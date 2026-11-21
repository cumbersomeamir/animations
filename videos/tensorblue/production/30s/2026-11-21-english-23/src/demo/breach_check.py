"""Tensorblue english-23 test: checking a password against known breaches without sending it.

Python 3 standard library only. A real request to the public Have I Been Pwned "Pwned Passwords" range API
(https://api.pwnedpasswords.com/range/{first 5 SHA-1 hex chars}), exactly as its API documentation describes:
  1. SHA-1 the password locally -> 40 hex characters
  2. send ONLY the first 5 characters (with the documented "Add-Padding: true" header)
  3. the service returns the remaining 35 characters of every leaked hash with that prefix, each with a count
  4. compare locally
Only two PUBLIC SAMPLE passwords are used, never a real person's: the famously weak "password123" and a fresh
random 20-character password generated here (it is printed only as its hash prefix, and then discarded).

usage: python3 breach_check.py <out_dir>   -> writes breach-check.json
"""
import datetime
import hashlib
import json
import os
import secrets
import string
import sys
import urllib.request

API = 'https://api.pwnedpasswords.com/range/'


def check(password, label):
    h = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix, suffix = h[:5], h[5:]
    req = urllib.request.Request(API + prefix, headers={'Add-Padding': 'true', 'User-Agent': 'tensorblue-educational-demo'})
    with urllib.request.urlopen(req, timeout=30) as r:
        body = r.read().decode('utf-8')
        status = r.status
    rows = [ln.split(':') for ln in body.strip().splitlines()]
    real = [(s, int(c)) for s, c in rows if int(c) > 0]          # padded entries have count 0 (API docs)
    hit = next((int(c) for s, c in rows if s.upper() == suffix), 0)
    return {
        'label': label,
        'hash_length': len(h),
        'sent_to_service': prefix,
        'sent_characters': len(prefix),
        'kept_on_device_characters': len(suffix),
        'http_status': status,
        'returned_suffixes_total': len(rows),
        'returned_real_leaked_suffixes': len(real),
        'returned_padding_entries': len(rows) - len(real),
        'found': hit > 0,
        'times_seen_in_breaches': hit,
        'example_returned_lines': [f'{s}:{c}' for s, c in real[:3]],
        'shown_hash': (h if label.startswith('weak') else prefix + '…'),
    }


def main(out_dir):
    weak = check('password123', 'weak sample: password123')
    strong_pw = ''.join(secrets.choice(string.ascii_letters + string.digits + '!#%&*') for _ in range(20))
    strong = check(strong_pw, 'strong sample: fresh random 20 characters (not stored)')
    del strong_pw
    res = {
        'what': 'Real queries to the public HIBP Pwned Passwords range API (k-anonymity) with two public sample passwords; nothing personal.',
        'queried_utc': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC'),
        'api': API + '{prefix}', 'header': 'Add-Padding: true',
        'possible_prefixes': 16 ** 5,
        'weak': weak, 'strong': strong,
    }
    os.makedirs(out_dir, exist_ok=True)
    json.dump(res, open(os.path.join(out_dir, 'breach-check.json'), 'w'), indent=1)
    print(json.dumps(res, indent=1))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'out')
