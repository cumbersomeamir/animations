"""Tensorblue english-24 test: unique, time-sorted IDs from several machines with no central counter.

Our own Python (standard library) implementation of the ID layout documented in Twitter's open-source
Snowflake README (github.com/twitter-archive/snowflake, tag snowflake-2010):
    time      41 bits  milliseconds since a custom epoch (Twitter's code: twepoch = 1288834974657)
    machine   10 bits  configured machine id (up to 1024 machines)
    sequence  12 bits  counter for IDs made in the same millisecond on one machine (4096 per ms)
It is NOT Twitter's code (we never run foreign scripts); it re-implements the documented layout so we can test it.

The test:
  1. one real clock reading is captured, and three machines (ids 1, 2, 3) each make three IDs in that same
     millisecond (sequence 0, 1, 2), then one more ID each in the next millisecond -> 12 IDs;
  2. check: all 12 distinct; sorting the numbers puts them in time order; decoding gives back time/machine/counter;
  3. a clock that moves backwards is refused (as the README describes);
  4. js_precision.mjs then shows what JavaScript's Number type does to one of these IDs.

usage: python3 snowflake_test.py <out_dir>   -> writes snowflake-test.json
"""
import datetime
import json
import os
import sys
import time

TWEPOCH = 1288834974657            # Twitter's custom epoch, from IdWorker.scala (2010 release)
TIME_BITS, MACHINE_BITS, SEQ_BITS = 41, 10, 12
MAX_SEQ = (1 << SEQ_BITS) - 1


class Machine:
    def __init__(self, machine_id):
        assert 0 <= machine_id < (1 << MACHINE_BITS)
        self.machine_id, self.last_ms, self.seq = machine_id, -1, 0

    def make_id(self, now_ms):
        if now_ms < self.last_ms:
            raise RuntimeError(f'clock moved backwards by {self.last_ms - now_ms} ms: refusing to make an id')
        if now_ms == self.last_ms:
            self.seq = (self.seq + 1) & MAX_SEQ
            if self.seq == 0:
                raise RuntimeError('4096 ids already made this millisecond: wait for the next one')
        else:
            self.seq = 0
        self.last_ms = now_ms
        return ((now_ms - TWEPOCH) << (MACHINE_BITS + SEQ_BITS)) | (self.machine_id << SEQ_BITS) | self.seq


def decode(i):
    return {'ms': (i >> (MACHINE_BITS + SEQ_BITS)) + TWEPOCH, 'machine': (i >> SEQ_BITS) & ((1 << MACHINE_BITS) - 1), 'seq': i & MAX_SEQ}


def iso(ms):
    return datetime.datetime.fromtimestamp(ms / 1000, datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S.%f')[:-3] + ' UTC'


def main(out_dir):
    now = int(time.time() * 1000)                 # ONE real clock reading, shared by all three machines
    machines = [Machine(m) for m in (1, 2, 3)]
    made = []
    for ms in (now, now + 1):
        for m in machines:
            for _ in range(3 if ms == now else 1):
                i = m.make_id(ms)
                made.append({'id': str(i), 'ms': ms, 'machine': m.machine_id, 'seq': decode(i)['seq']})
    ids = [int(x['id']) for x in made]
    by_number = sorted(made, key=lambda x: int(x['id']))
    time_order_ok = all(a['ms'] <= b['ms'] for a, b in zip(by_number, by_number[1:]))
    decode_ok = all(decode(int(x['id'])) == {'ms': x['ms'], 'machine': x['machine'], 'seq': x['seq']} for x in made)
    try:
        machines[0].make_id(now - 5)
        backwards = 'accepted (unexpected)'
    except RuntimeError as e:
        backwards = str(e)
    sample = made[3]                                # machine 2, sequence 0, first millisecond
    s = int(sample['id'])
    res = {
        'what': 'Our own re-implementation of the documented 2010 Snowflake layout (41-bit time, 10-bit machine, 12-bit sequence); not Twitter code.',
        'run_utc': iso(now),
        'epoch_ms': TWEPOCH, 'epoch_utc': iso(TWEPOCH),
        'layout_bits': {'sign': 1, 'time': TIME_BITS, 'machine': MACHINE_BITS, 'sequence': SEQ_BITS},
        'capacity': {'ids_per_ms_per_machine': MAX_SEQ + 1, 'machines': 1 << MACHINE_BITS,
                     'years_of_time_field': round((1 << TIME_BITS) / 1000 / 86400 / 365.25, 1),
                     'time_field_runs_out_utc': iso(TWEPOCH + (1 << TIME_BITS) - 1)},
        'ids': made,
        'count': len(ids), 'distinct': len(set(ids)),
        'sorted_by_number_is_time_order': time_order_ok,
        'decode_round_trip_ok': decode_ok,
        'clock_backwards_test': backwards,
        'sample': {'id': sample['id'], 'digits': len(sample['id']), 'bits_used': s.bit_length(),
                   'binary_time': format(s >> 22, f'0{TIME_BITS}b'), 'binary_machine': format((s >> 12) & 1023, '010b'), 'binary_seq': format(s & 4095, '012b'),
                   'ms_since_epoch': s >> 22, 'machine': (s >> 12) & 1023, 'seq': s & 4095, 'time_utc': iso(sample['ms'])},
    }
    assert res['distinct'] == res['count'] == 12 and time_order_ok and decode_ok and backwards.startswith('clock moved backwards')
    os.makedirs(out_dir, exist_ok=True)
    json.dump(res, open(os.path.join(out_dir, 'snowflake-test.json'), 'w'), indent=1)
    print(json.dumps({k: v for k, v in res.items() if k != 'ids'}, indent=1))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'out')
