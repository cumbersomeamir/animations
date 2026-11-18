"""Tensorblue english-21 test: a real four-stage "app update" and two progress bars watching it.

Python 3 standard library only. Real work on this machine, nothing simulated:
  1 DOWNLOAD  the update package (a zip) over HTTP from a local server, capped at 100 Mb/s (12.5 MB/s) so the
              link behaves like a fast home connection instead of loopback speed
  2 VERIFY    SHA-256 of every downloaded byte, compared with the published hash
  3 UNPACK    extract every file from the zip
  4 INSTALL   copy each file into the "app" folder and fsync it (so it is really on disk), then write a manifest

Two bars watch the same run:
  bytes-only  percent = downloaded bytes / package bytes, never shown as 100 until everything is done
              (Microsoft: "Don't let a progress bar go to 100 percent unless the operation has completed.")
  staged      every stage owns a share of one bar, sized from a calibration run's stage times
              (Microsoft: "have all the steps in the operation share a portion of the progress";
               Apple Progress: sub-operations get a portion of the parent's pending unit count)
Run 1 calibrates the shares; run 2 is the one reported and shown. Timings are this machine's.

usage: python3 stages_demo.py <out_dir>   -> writes stages-demo.json
"""
import hashlib
import http.server
import io
import json
import os
import random
import shutil
import sys
import tempfile
import threading
import time
import urllib.request
import zipfile

N_FILES = 2400
RATE = 12.5e6            # bytes per second (100 Mb/s)
SAMPLE = 0.05            # bar sampling interval (s)
SEED = 20261118


def build_package(path):
    rnd = random.Random(SEED)
    with zipfile.ZipFile(path, 'w', compression=zipfile.ZIP_STORED) as z:
        z.writestr('assets/video-intro.bin', rnd.randbytes(18_000_000))          # one big asset
        for i in range(N_FILES):                                                  # thousands of small files
            z.writestr(f'app/res/{i // 100:02d}/file-{i:04d}.dat', rnd.randbytes(rnd.randint(2_000, 14_000)))
    return os.path.getsize(path)


class Throttled(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def copyfile(self, src, dst):
        t0, sent = time.monotonic(), 0
        while True:
            buf = src.read(64 * 1024)
            if not buf:
                break
            dst.write(buf)
            sent += len(buf)
            ahead = sent / RATE - (time.monotonic() - t0)
            if ahead > 0:
                time.sleep(ahead)


def run_update(url, size, sha, work, shares=None):
    """Runs the four stages; returns stage times and both bars sampled every SAMPLE seconds."""
    marks, state = {}, {'stage': 'download', 'done': 0.0}
    T0 = time.monotonic()
    samples = []
    stop = threading.Event()
    stage_units = {}

    def sampler():
        while not stop.is_set():
            samples.append((round(time.monotonic() - T0, 3), state['stage'], round(state['done'], 5)))
            time.sleep(SAMPLE)
    th = threading.Thread(target=sampler, daemon=True); th.start()

    pkg = os.path.join(work, 'update.zip')
    # 1 download
    marks['download'] = time.monotonic() - T0
    got = 0
    with urllib.request.urlopen(url) as r, open(pkg, 'wb') as f:
        while True:
            b = r.read(64 * 1024)
            if not b:
                break
            f.write(b); got += len(b); state['done'] = got / size
    # 2 verify
    state.update(stage='verify', done=0.0); marks['verify'] = time.monotonic() - T0
    h, n = hashlib.sha256(), 0
    with open(pkg, 'rb') as f:
        while True:
            b = f.read(1 << 20)
            if not b:
                break
            h.update(b); n += len(b); state['done'] = n / size
    ok = h.hexdigest() == sha
    # 3 unpack
    state.update(stage='unpack', done=0.0); marks['unpack'] = time.monotonic() - T0
    out = os.path.join(work, 'unpacked')
    with zipfile.ZipFile(pkg) as z:
        names = z.namelist()
        for i, nm in enumerate(names):
            z.extract(nm, out); state['done'] = (i + 1) / len(names)
    # 4 install
    state.update(stage='install', done=0.0); marks['install'] = time.monotonic() - T0
    app = os.path.join(work, 'app-installed')
    for i, nm in enumerate(names):
        src, dst = os.path.join(out, nm), os.path.join(app, nm)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(src, 'rb') as a, open(dst, 'wb') as b:
            shutil.copyfileobj(a, b); b.flush(); os.fsync(b.fileno())
        state['done'] = (i + 1) / len(names)
    with open(os.path.join(app, 'manifest.json'), 'w') as f:
        json.dump({'files': len(names), 'sha256': sha}, f); f.flush(); os.fsync(f.fileno())
    marks['end'] = time.monotonic() - T0
    state.update(stage='done', done=1.0)
    time.sleep(SAMPLE * 2); stop.set(); th.join()
    order = ['download', 'verify', 'unpack', 'install']
    dur = {s: marks[nx] - marks[s] for s, nx in zip(order, order[1:] + ['end'])}
    return {'ok': ok, 'files': len(names), 'marks': {k: round(v, 3) for k, v in marks.items()},
            'durations': {k: round(v, 3) for k, v in dur.items()}, 'samples': samples}


def bars(run, shares):
    """bytes-only bar and staged bar for each sample; percent shown as an integer, 100 only when done."""
    order = ['download', 'verify', 'unpack', 'install']
    out = []
    for t, stage, done in run['samples']:
        if stage == 'done':
            out.append((t, stage, 100, 100)); continue
        b = done if stage == 'download' else 1.0
        bytes_pct = min(99, int(b * 100))
        k = order.index(stage)
        st = sum(shares[s] for s in order[:k]) + shares[stage] * done
        staged_pct = min(99, int(st * 100))
        out.append((t, stage, bytes_pct, staged_pct))
    return out


def main(out_dir):
    work = tempfile.mkdtemp(prefix='tb-stages-')
    srv_dir = os.path.join(work, 'server'); os.makedirs(srv_dir)
    size = build_package(os.path.join(srv_dir, 'update.zip'))
    sha = hashlib.sha256(open(os.path.join(srv_dir, 'update.zip'), 'rb').read()).hexdigest()
    handler = lambda *a, **k: Throttled(*a, directory=srv_dir, **k)
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{httpd.server_address[1]}/update.zip'
    runs = []
    for k in range(2):
        w = os.path.join(work, f'run{k}'); os.makedirs(w)
        runs.append(run_update(url, size, sha, w))
        shutil.rmtree(w)
    httpd.shutdown(); shutil.rmtree(work)
    cal, rep = runs
    total_cal = sum(cal['durations'].values())
    shares = {s: round(d / total_cal, 4) for s, d in cal['durations'].items()}
    B = bars(rep, shares)
    end = rep['marks']['end']
    first99 = next(t for t, s, b, _ in B if b >= 99)
    stuck = end - first99
    # how far each bar is from "time actually passed" (the honest straight line), percentage points
    dev_b = max(abs(b - 100 * t / end) for t, s, b, _ in B if t <= end)
    dev_s = max(abs(g - 100 * t / end) for t, s, _, g in B if t <= end)
    res = {
        'what': 'Real four-stage update on this machine (download capped at 100 Mb/s from a local HTTP server, SHA-256 verify, unzip, install with fsync). Not any app\'s installer.',
        'python': sys.version.split()[0],
        'package': {'bytes': size, 'files': N_FILES + 1, 'sha256': sha, 'link_mbps': RATE * 8 / 1e6},
        'calibration_run_durations_s': cal['durations'],
        'shares_from_calibration': shares,
        'reported_run': {'ok': rep['ok'], 'durations_s': rep['durations'], 'marks_s': rep['marks'], 'total_s': round(end, 3)},
        'bytes_only': {'reached_99_at_s': first99, 'stuck_at_99_s': round(stuck, 2), 'stuck_share_of_wait': round(stuck / end, 3),
                       'max_gap_from_elapsed_time_pts': round(dev_b, 1)},
        'staged': {'max_gap_from_elapsed_time_pts': round(dev_s, 1)},
        'bars_every_0_05s': B,
    }
    os.makedirs(out_dir, exist_ok=True)
    json.dump(res, open(os.path.join(out_dir, 'stages-demo.json'), 'w'), indent=1)
    print(json.dumps({k: res[k] for k in ['package', 'calibration_run_durations_s', 'shares_from_calibration', 'reported_run', 'bytes_only', 'staged']}, indent=1))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'out')
