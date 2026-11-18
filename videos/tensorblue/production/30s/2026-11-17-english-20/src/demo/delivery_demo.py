"""Tensorblue english-20 test: store-and-forward with acknowledgments vs send-once, over a bad link.

Real UDP sockets on 127.0.0.1 (Python 3 standard library only). NOT WhatsApp's code or protocol:
a small model of the generic design WhatsApp's own pages describe (clock = not sent yet, one tick = sent,
undelivered messages kept on the server while it tries to deliver, two ticks = delivered, then deleted
from the server), and that XMPP's Stream Management (XEP-0198) and SMTP (RFC 5321) specify.

Cast:
  sender  -- your phone, sends 20 messages
  LINK    -- a bad connection between your phone and the server: a UDP relay that drops ~1/3 of packets
             in BOTH directions. A drop is decided by a hash of (direction, packet kind, message id,
             attempt), so the same packets drop on every run regardless of timing.
  server  -- relays to the friend
  friend  -- the recipient; their phone is OFF for the first part of the run (no socket listening)

Design A, "send once":   no acknowledgments, no storage. The sender sends each message once; the server
                         forwards it if the friend is online and otherwise has nowhere to keep it.
Design B, "store-and-forward + acks": the sender keeps each message (clock) and resends until the server
                         acknowledges it (one tick). The server keeps it until the friend's phone
                         acknowledges it, then deletes its copy and tells the sender (two ticks).
                         Duplicates from resends are recognised by message id.

usage: python3 delivery_demo.py <out_dir>   -> writes delivery-demo.json
"""
import asyncio
import hashlib
import json
import os
import sys
import time

N_MSG = 20
GAP = 0.05                 # one message every 50 ms
FRIEND_ON_AT = 0.60        # the friend's phone comes back on (s after the first send)
RESEND = 0.12              # sender / server resend timeout (s)
DROP_PCT = 33              # bad link: about a third of packets dropped
RUN_FOR = 3.0
HOST = '127.0.0.1'


def dropped(direction, kind, mid, attempt):
    h = hashlib.sha256(f'{direction}|{kind}|{mid}|{attempt}'.encode()).digest()
    return int.from_bytes(h[:4], 'big') % 100 < DROP_PCT


class UDP(asyncio.DatagramProtocol):
    def __init__(self, on_msg):
        self.on_msg = on_msg
        self.transport = None

    def connection_made(self, transport):
        self.transport = transport

    def datagram_received(self, data, addr):
        self.on_msg(json.loads(data.decode()), addr)


async def run(design, base_port):
    loop = asyncio.get_running_loop()
    t0 = time.monotonic()
    now = lambda: round(time.monotonic() - t0, 4)
    P_SENDER, P_LINK_S, P_LINK_V, P_SERVER, P_FRIEND = (base_port + i for i in range(5))
    log = []                              # every event, in order
    ev = lambda who, what, mid, **k: log.append({'t': now(), 'who': who, 'what': what, 'id': mid, **k})
    attempts = {}                         # (direction, kind, id) -> attempt counter, for the drop hash

    # ---- the bad link: two relay sockets (phone side and server side) ----
    def relay(direction, out_port, msg):
        key = (direction, msg['kind'], msg['id'])
        attempts[key] = attempts.get(key, 0) + 1
        if dropped(direction, msg['kind'], msg['id'], attempts[key]):
            ev('link', 'dropped', msg['id'], kind=msg['kind'], direction=direction, attempt=attempts[key])
            return
        tx = link_v if direction == 'up' else link_s
        tx.transport.sendto(json.dumps(msg).encode(), (HOST, out_port))

    link_s = UDP(lambda m, a: relay('up', P_SERVER, m))         # phone -> server
    link_v = UDP(lambda m, a: relay('down', P_SENDER, m))       # server -> phone
    await loop.create_datagram_endpoint(lambda: link_s, local_addr=(HOST, P_LINK_S))
    await loop.create_datagram_endpoint(lambda: link_v, local_addr=(HOST, P_LINK_V))

    # ---- server ----
    held = {}                 # store-and-forward: messages kept until the friend's phone acknowledges
    seen = set()
    delivered_ids = set()
    receipts_pending = {}     # id -> last time a "delivered" receipt was sent to the phone
    friend_online = False

    def server_rx(m, addr):
        if m['kind'] == 'msg':
            if design == 'send_once':
                if friend_online:
                    srv.transport.sendto(json.dumps(m).encode(), (HOST, P_FRIEND)); ev('server', 'forwarded', m['id'])
                else:
                    ev('server', 'nowhere_to_keep', m['id'])
                return
            if m['id'] not in seen:
                seen.add(m['id']); held[m['id']] = m; ev('server', 'stored', m['id'], held=len(held))
            else:
                ev('server', 'duplicate_ignored', m['id'])
            srv.transport.sendto(json.dumps({'kind': 'ack', 'id': m['id']}).encode(), (HOST, P_LINK_V))   # one tick
            if m['id'] in delivered_ids:
                receipts_pending.setdefault(m['id'], 0.0)
        elif m['kind'] == 'delivered_ack':   # the phone got the two-tick receipt
            receipts_pending.pop(m['id'], None)
        elif m['kind'] == 'friend_ack':      # the friend's phone has it
            if m['id'] in held:
                del held[m['id']]; delivered_ids.add(m['id']); ev('server', 'deleted_copy', m['id'], held=len(held))
                receipts_pending[m['id']] = 0.0

    srv = UDP(server_rx)
    await loop.create_datagram_endpoint(lambda: srv, local_addr=(HOST, P_SERVER))

    # ---- friend ----
    friend_got = []
    def friend_rx(m, addr):
        if m['kind'] != 'msg':
            return
        if m['id'] not in friend_got:
            friend_got.append(m['id']); ev('friend', 'received', m['id'])
        if design == 'store_and_forward':
            fr.transport.sendto(json.dumps({'kind': 'friend_ack', 'id': m['id']}).encode(), (HOST, P_SERVER))
    fr = UDP(friend_rx)

    # ---- sender (your phone) ----
    outbox = {}               # id -> last send time (clock)
    ticks = {}                # id -> 0 clock / 1 one tick / 2 two ticks
    def sender_rx(m, addr):
        if m['kind'] == 'ack' and m['id'] in outbox:
            del outbox[m['id']]
            if ticks.get(m['id'], 0) < 1:
                ticks[m['id']] = 1; ev('phone', 'one_tick', m['id'])
        elif m['kind'] == 'delivered':
            ticks[m['id']] = 2; ev('phone', 'two_ticks', m['id'])
            snd.transport.sendto(json.dumps({'kind': 'delivered_ack', 'id': m['id']}).encode(), (HOST, P_LINK_S))
    snd = UDP(sender_rx)
    await loop.create_datagram_endpoint(lambda: snd, local_addr=(HOST, P_SENDER))

    def send(mid):
        snd.transport.sendto(json.dumps({'kind': 'msg', 'id': mid, 'text': f'message {mid + 1}'}).encode(), (HOST, P_LINK_S))
        ev('phone', 'sent_attempt', mid)

    for i in range(N_MSG):
        ticks[i] = 0
        send(i)
        if design == 'store_and_forward':
            outbox[i] = now()
        if not friend_online and now() >= FRIEND_ON_AT:
            pass
        await asyncio.sleep(GAP)
        if not friend_online and now() >= FRIEND_ON_AT:
            await loop.create_datagram_endpoint(lambda: fr, local_addr=(HOST, P_FRIEND))
            friend_online = True; ev('friend', 'phone_on', None)
        for mid, ts in list(outbox.items()):
            if now() - ts > RESEND:
                outbox[mid] = now(); send(mid)

    end = time.monotonic() + RUN_FOR
    while time.monotonic() < end:
        await asyncio.sleep(0.02)
        if not friend_online and now() >= FRIEND_ON_AT:
            await loop.create_datagram_endpoint(lambda: fr, local_addr=(HOST, P_FRIEND))
            friend_online = True; ev('friend', 'phone_on', None)
        for mid, ts in list(outbox.items()):                       # sender: resend until acknowledged
            if now() - ts > RESEND:
                outbox[mid] = now(); send(mid)
        if design == 'store_and_forward' and friend_online:
            for mid, m in sorted(held.items()):                    # server: forward what it holds
                srv.transport.sendto(json.dumps(m).encode(), (HOST, P_FRIEND))
            for mid, ts in list(receipts_pending.items()):         # server: two-tick receipts until the phone confirms
                if now() - ts > RESEND:
                    receipts_pending[mid] = now()
                    srv.transport.sendto(json.dumps({'kind': 'delivered', 'id': mid}).encode(), (HOST, P_LINK_V))
        if design == 'store_and_forward' and len(friend_got) == N_MSG and not outbox and not held and not receipts_pending:
            break
        if design == 'send_once' and now() > N_MSG * GAP + 0.5:
            break

    for p in (link_s, link_v, srv, fr, snd):
        if p.transport:
            p.transport.close()

    drops = [e for e in log if e['what'] == 'dropped']
    res = {
        'design': design,
        'sent': N_MSG,
        'friend_received': len(friend_got),
        'friend_received_ids': sorted(friend_got),
        'lost': N_MSG - len(friend_got),
        'lost_on_link_first_try': sorted({e['id'] for e in drops if e['kind'] == 'msg' and e['attempt'] == 1}),
        'lost_ids': sorted(set(range(N_MSG)) - set(friend_got)),
        'send_attempts': sum(1 for e in log if e['what'] == 'sent_attempt'),
        'packets_dropped_by_link': len(drops),
        'server_nowhere_to_keep': sorted(e['id'] for e in log if e['what'] == 'nowhere_to_keep'),
        'server_max_held': max([e.get('held', 0) for e in log if e['what'] == 'stored'] or [0]),
        'server_copies_at_end': len(held),
        'duplicates_shown_to_friend': len(friend_got) - len(set(friend_got)),
        'final_ticks': [ticks[i] for i in range(N_MSG)],
        'events': log,
    }
    return res


async def main(out_dir):
    a = await run('send_once', 47100)
    b = await run('store_and_forward', 47200)
    os.makedirs(out_dir, exist_ok=True)
    out = {
        'what': 'Our own model on real UDP sockets (127.0.0.1); not WhatsApp code. Bad link drops ~1/3 of packets both ways (hash-decided).',
        'params': {'messages': N_MSG, 'gap_s': GAP, 'friend_phone_on_at_s': FRIEND_ON_AT, 'resend_timeout_s': RESEND, 'drop_pct': DROP_PCT},
        'python': sys.version.split()[0],
        'send_once': a,
        'store_and_forward': b,
    }
    with open(os.path.join(out_dir, 'delivery-demo.json'), 'w') as f:
        json.dump(out, f, indent=1)
    for r in (a, b):
        print(r['design'], {k: r[k] for k in ['sent', 'friend_received', 'lost', 'lost_ids', 'lost_on_link_first_try', 'server_nowhere_to_keep',
                                              'send_attempts', 'packets_dropped_by_link', 'server_max_held', 'server_copies_at_end', 'final_ticks']})


if __name__ == '__main__':
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else 'out'))
