"""Real DNS demo for Tensorblue english-09: why a site works for your friend but not for you.

Everything runs on 127.0.0.1 with reserved names and documentation addresses:
  - a tiny authoritative server (dnslib) for the fictional name shop.example (RFC 2606 reserves .example),
    TTL 30 s, first answering the OLD server 192.0.2.10, then the NEW server 198.51.100.20
    (RFC 5737 documentation ranges);
  - two caching resolvers (dnsmasq 2.91): "your resolver" on :5401 and "your friend's resolver" on :5402;
  - every question is asked with dig, exactly as a person would diagnose it.
Timeline: your resolver asks before the move and caches the old address; the site moves; your
resolver keeps answering the old address from its cache, while your friend's resolver (first asking
after the move) gets the new one; once the 30 s TTL runs out, your resolver asks again and refreshes.
usage: python dns_demo.py <out_dir>        (needs dnslib, dnsmasq, dig; binds UDP 5300/5401/5402)
"""
import json, os, subprocess, sys, tempfile, time
from dnslib import A, QTYPE, RCODE, RR
from dnslib.server import BaseResolver, DNSServer

NAME, OLD, NEW, TTL = "shop.example.", "192.0.2.10", "198.51.100.20", 30
AUTH, YOURS, FRIEND = 5300, 5401, 5402


class Authoritative(BaseResolver):
    def __init__(self):
        self.ip = OLD

    def resolve(self, request, handler):
        reply = request.reply()
        if str(request.q.qname).lower() == NAME and request.q.qtype == QTYPE.A:
            reply.add_answer(RR(NAME, QTYPE.A, rdata=A(self.ip), ttl=TTL))
        else:
            reply.header.rcode = RCODE.NXDOMAIN
        return reply


def dnsmasq(port, d):
    return subprocess.Popen(["dnsmasq", "--keep-in-foreground", "--conf-file=/dev/null", "--no-resolv", "--no-hosts",
                             f"--port={port}", "--listen-address=127.0.0.1", "--bind-interfaces",
                             f"--server=127.0.0.1#{AUTH}", "--cache-size=150", f"--pid-file={d}/dnsmasq-{port}.pid"],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def dig(port):
    cmd = ["dig", "@127.0.0.1", "-p", str(port), "shop.example", "A", "+noall", "+answer"]
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=10).stdout.strip()
    parts = out.split()
    return {"command": " ".join(cmd[:1] + cmd[1:]), "answer": out,
            "ttl": int(parts[1]) if len(parts) >= 5 else None, "address": parts[4] if len(parts) >= 5 else None}


def main():
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    auth = Authoritative()
    server = DNSServer(auth, port=AUTH, address="127.0.0.1"); server.start_thread()
    log, t0 = [], None
    with tempfile.TemporaryDirectory() as d:
        procs = [dnsmasq(YOURS, d), dnsmasq(FRIEND, d)]
        time.sleep(1.0)
        try:
            t0 = time.monotonic()
            rec = lambda who, port, note: log.append({"t": round(time.monotonic() - t0, 1), "who": who, "note": note, **dig(port)})
            rec("your resolver", YOURS, "your phone asks before the move")
            time.sleep(2.0)
            auth.ip = NEW; log.append({"t": round(time.monotonic() - t0, 1), "who": "site owner", "note": f"the site moves: shop.example now points to {NEW}"})
            time.sleep(0.5)
            rec("authoritative server", AUTH, "the source now says the new address")
            rec("your resolver", YOURS, "your phone asks again, answered from cache")
            rec("friend's resolver", FRIEND, "your friend's phone asks for the first time, after the move")
            time.sleep(TTL - 2.0)
            rec("your resolver", YOURS, f"after the {TTL} s TTL runs out: asks the source again")
        finally:
            for p in procs:
                p.terminate(); p.wait(timeout=5)
            server.stop()
    vers = {"dnsmasq": subprocess.run(["dnsmasq", "--version"], capture_output=True, text=True).stdout.splitlines()[0],
            "dig": subprocess.run(["dig", "-v"], capture_output=True, text=True).stderr.strip(),
            "dnslib": __import__("dnslib").version}
    json.dump({"name": NAME.rstrip("."), "old": OLD, "new": NEW, "ttl": TTL, "tools": vers, "log": log},
              open(os.path.join(out, "dns-demo.json"), "w"), indent=1)
    for e in log:
        print(f"t={e['t']:5.1f}  {e['who']:22s} {e.get('answer', e['note'])}")


if __name__ == "__main__":
    main()
