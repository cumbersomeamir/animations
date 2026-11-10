#!/usr/bin/env python3
"""Build every plate / slot placeholder for "Not My Life" from the two genuine recordings.

Inputs  (see scripts/fetch_sources.sh):
  assets/sources/01-discover-personalized-gallery.mp4      clip, 720x1600 CFR 30
  cache/sources/raw-01-discover-personalized-gallery.mp4   raw device recording, VFR
Outputs (committed):
  assets/slots/*.mp4|png        replaceable FOOTAGE slots (clean crops, no UI chrome)
  assets/ui/*                   UI plates (real recording, never replaced by generated content)
  assets/plates/*.png           editorial plates (real results) for payoff cards
Cache (not committed):
  cache/frames/<name>/%05d.jpg  per-frame JPEGs the renderer streams as textures

Only crops, Lanczos scaling, mild unsharp on upscaled grid tiles and time-remaps that
select real frames are applied. Nothing is generated or painted.
"""
import json, os, subprocess, sys, shutil
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
M = json.load(open('manifest.json'))

if '--slots-only' in sys.argv:
    # Replacement workflow: you dropped new clips into assets/slots/. Re-check frame counts,
    # refresh posters (in-point frame) and the renderer's frame cache. Sources are not needed.
    POSTER_FRAME = {'opening-character': 0}
    ok = True
    for key, s in M['slots'].items():
        d = f'cache/frames/{key}'
        shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
        A = s['size'][0] / s['size'][1]  # keep the replacement's resolution, centre-crop to the slot aspect
        vf = f"crop='trunc(min(iw\\,ih*{A:.6f})/2)*2':'trunc(min(ih\\,iw/{A:.6f})/2)*2'"
        subprocess.run(['ffmpeg', '-v', 'error', '-i', s['file'], '-vf', vf, '-q:v', '2', '-start_number', '0', f'{d}/%05d.jpg'], check=True)
        n = len(os.listdir(d))
        pf = POSTER_FRAME.get(key, 12)
        shutil.copy(f'{d}/{pf:05d}.jpg', s['poster'].replace('.png', '.poster.jpg'))
        Image.open(f'{d}/{pf:05d}.jpg').save(s['poster'])
        status = 'OK' if n >= s['frames'] else f'TOO SHORT (need {s["frames"]})'
        ok &= n >= s['frames']
        print(f'{key:24s} {n:4d} frames  {status}')
        os.remove(s['poster'].replace('.png', '.poster.jpg'))
    for name in ('feed-proof', 'phone-screen-payoff'):  # UI plates: cache only if missing (fresh checkout)
        d = f'cache/frames/{name}'
        if not os.path.isdir(d) or not os.listdir(d):
            os.makedirs(d, exist_ok=True)
            subprocess.run(['ffmpeg', '-v', 'error', '-i', M['uiPlates'][name]['file'], '-q:v', '2', '-start_number', '0', f'{d}/%05d.jpg'], check=True)
        print(f'{name:24s} {len(os.listdir(d)):4d} frames  (UI plate, genuine)')
    sys.exit(0 if ok else 1)
CLIP = M['sources']['clip']['file']
RAW = M['sources']['raw']['file']
for p in (CLIP, RAW):
    if not os.path.exists(p):
        sys.exit(f'missing {p}: run scripts/fetch_sources.sh')

TMP = 'cache/prep'
os.makedirs(TMP, exist_ok=True)
for d in ('assets/slots', 'assets/ui', 'assets/plates', 'cache/frames'):
    os.makedirs(d, exist_ok=True)


def run(cmd):
    subprocess.run(cmd, check=True)


# ---------------------------------------------------------------- source frames
def clip_frames(indices):
    """Decode chosen CFR clip frames (0-based) -> dict idx->PIL RGB."""
    need = sorted(set(indices))
    out = {}
    d = f'{TMP}/clip'
    if not os.path.isdir(d) or len(os.listdir(d)) < 1109:
        shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
        run(['ffmpeg', '-v', 'error', '-i', CLIP, '-fps_mode', 'passthrough', f'{d}/%05d.png'])
    for i in need:
        out[i] = Image.open(f'{d}/{i + 1:05d}.png').convert('RGB')
    return out


def raw_pts():
    p = f'{TMP}/raw_pts.txt'
    if not os.path.exists(p):
        r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'frame=pts_time',
                            '-of', 'csv=p=0', RAW], capture_output=True, text=True, check=True)
        open(p, 'w').write(r.stdout)
    return np.array([float(x.strip().strip(',')) for x in open(p) if x.strip()])


PTS = raw_pts()


def raw_frame_at(t):
    """Index of the raw frame on screen at time t (largest pts <= t)."""
    return int(np.searchsorted(PTS, t + 1e-4, side='right') - 1)


_raw_cache = {}


def raw_frames(indices):
    need = sorted(set(indices))
    d = f'{TMP}/raw'
    os.makedirs(d, exist_ok=True)
    missing = [i for i in need if not os.path.exists(f'{d}/{i:05d}.png')]
    if missing:
        lo, hi = min(missing), max(missing)
        t0, t1 = PTS[lo] - 0.0005, PTS[hi] + 0.0005
        tmp = f'{TMP}/rawseg'
        shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
        run(['ffmpeg', '-v', 'error', '-i', RAW, '-vf', f"select='between(t\\,{t0:.4f}\\,{t1:.4f})'",
             '-fps_mode', 'passthrough', f'{tmp}/%05d.png'])
        got = sorted(os.listdir(tmp))
        idxs = [i for i in range(len(PTS)) if t0 <= PTS[i] <= t1]
        assert len(got) == len(idxs), (len(got), len(idxs))
        for name, i in zip(got, idxs):
            shutil.move(f'{tmp}/{name}', f'{d}/{i:05d}.png')
    return {i: Image.open(f'{d}/{i:05d}.png').convert('RGB') for i in need}


# ---------------------------------------------------------------- writers
def write_seq_mp4(frames, path, crf=12):
    """frames: list of PIL images (same size) -> H.264 CFR 30 mp4 (+ cache jpgs)."""
    seq = f'{TMP}/seq'
    shutil.rmtree(seq, ignore_errors=True); os.makedirs(seq)
    tmp = path[:-4] + '.tmp.mp4'
    if all(im is frames[0] for im in frames):  # held still: encode one picture N times
        frames[0].save(f'{seq}/still.png')
        inp = ['-loop', '1', '-framerate', '30', '-i', f'{seq}/still.png', '-frames:v', str(len(frames))]
    else:
        for k, im in enumerate(frames):
            im.save(f'{seq}/{k:05d}.png', compress_level=1)
        inp = ['-framerate', '30', '-i', f'{seq}/%05d.png']
    run(['ffmpeg', '-v', 'error', '-y', *inp, '-c:v', 'libx264',
         '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-colorspace', 'bt709',
         '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', tmp])
    os.replace(tmp, path)


def cache_frames(name, mp4):
    """Decode an asset mp4 to cache/frames/<name>/%05d.jpg (0-based) for the renderer."""
    d = f'cache/frames/{name}'
    shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    run(['ffmpeg', '-v', 'error', '-i', mp4, '-q:v', '2', '-start_number', '0', f'{d}/%05d.jpg'])
    return len(os.listdir(d))


def upscale_tile(im, size):
    big = im.resize(size, Image.LANCZOS)
    return big.filter(ImageFilter.UnsharpMask(radius=2.0, percent=55, threshold=2))


report = {}

# ---------------------------------------------------------------- clip-derived
C = clip_frames([300, 600, 700] + list(range(795, 894)))
S = M['slots']

# opening-character: still from 6-of-30 loop in-point (matches grid tile r4c1)
oc = C[795].crop(tuple(S['opening-character']['placeholderSource']['crop']))
oc.save(S['opening-character']['poster'])
write_seq_mp4([oc] * S['opening-character']['frames'], S['opening-character']['file'])

# superhook-motion: real 6-of-30 video section, clip frames 795..893
cr = tuple(S['superhook-motion']['placeholderSource']['crop'])
sh = [C[i].crop(cr) for i in range(795, 894)]
assert len(sh) == S['superhook-motion']['frames']
sh[12].save(S['superhook-motion']['poster'])
write_seq_mp4(sh, S['superhook-motion']['file'])

# reveal-01 stand-in: 4-of-30 still
r1 = C[700].crop(tuple(S['reveal-01-underwater']['placeholderSource']['crop']))
r1.save(S['reveal-01-underwater']['poster'])
write_seq_mp4([r1] * S['reveal-01-underwater']['frames'], S['reveal-01-underwater']['file'])

# editorial plates
P = M['editorialPlates']
C[600].crop(tuple(P['card-couple']['crop'])).save(P['card-couple']['file'])

# ---------------------------------------------------------------- raw-derived
last = len(PTS) - 1
R = raw_frames([last])
grid = R[last]
grid.save(M['uiPlates']['grid-scrolled']['file'])
for key in ('reveal-02-tokyo', 'reveal-03-space'):
    t = grid.crop(tuple(S[key]['placeholderSource']['crop']))
    up = upscale_tile(t, tuple(S[key]['size']))
    up.save(S[key]['poster'])
    write_seq_mp4([up] * S[key]['frames'], S[key]['file'])
# payoff world stand-in: dark blue 'brand' tech-room tile, 9:16 centre below the UI badge, upscaled to plate size
pw = grid.crop(tuple(S['payoff-spaceship']['placeholderSource']['crop'])).resize((1440, 2560), Image.LANCZOS)
pw.save(S['payoff-spaceship']['poster'])
write_seq_mp4([pw] * S['payoff-spaceship']['frames'], S['payoff-spaceship']['file'], crf=16)

# feed proof: f248..284 (37 frames) = 8 held frames of pre-scroll state + 29 real-time frames
feed_idx = [raw_frame_at(173.90)] * 8 + [raw_frame_at(173.951 + j / 30) for j in range(29)]
RF = raw_frames(feed_idx + [raw_frame_at(174.95)])
feed = [RF[i] for i in feed_idx]
write_seq_mp4(feed, M['uiPlates']['feed-proof']['file'])
# scroll amount of each feed frame. Build the scrollable content strip from the top state
# (scroll 0) and the final state (scroll 671), then match each frame's grid band against it.
FINAL_SCROLL = 671
top = np.asarray(feed[0].convert('L'), dtype=np.float32)
fin = np.asarray(grid.convert('L'), dtype=np.float32)
strip = np.zeros((1380 + FINAL_SCROLL, 720), np.float32)
strip[:1380] = top[:1380]
strip[208 + FINAL_SCROLL:1380 + FINAL_SCROLL] = fin[208:1380]
offs = []
for im in feed:
    a = np.asarray(im.convert('L'), dtype=np.float32)
    best = (1e9, 0)
    for o in range(0, FINAL_SCROLL + 1):
        d = np.abs(a[450:1350:3, ::3] - strip[450 + o:1350 + o:3, ::3]).mean()
        if d < best[0]:
            best = (d, o)
    offs.append({'scroll': best[1], 'dy': FINAL_SCROLL - best[1], 'err': round(float(best[0]), 2)})
json.dump({'note': 'scroll = grid content scroll (720px source space) from the top state; dy = distance still to travel to the final '
                   'scrolled state. Tile r4c2 final rect x240-478 y762-1079; tile r2c1 at scroll 0 x0-238 y795-1111.',
           'frames': offs}, open(M['uiPlates']['feed-proof']['offsets'], 'w'), indent=1)
report['feed_offsets'] = [(o['dy'], o['err']) for o in offs]

# phone screen during payoff/outro: f480..749 (270 frames); viewer closes at f660 = raw pts 218.0348
ps_idx = [raw_frame_at(218.0348 + (k - 180) / 30) for k in range(270)]
RP = raw_frames(ps_idx)
write_seq_mp4([RP[i] for i in ps_idx], M['uiPlates']['phone-screen-payoff']['file'])
report['phone_close_frame'] = next(k for k, i in enumerate(ps_idx) if PTS[i] >= 218.03)
report['phone_last_raw'] = ps_idx[-1]

# ---------------------------------------------------------------- render cache
counts = {}
for key, s in S.items():
    counts[key] = cache_frames(key, s['file'])
    assert counts[key] == s['frames'], (key, counts[key], s['frames'])
counts['feed-proof'] = cache_frames('feed-proof', M['uiPlates']['feed-proof']['file'])
counts['phone-screen-payoff'] = cache_frames('phone-screen-payoff', M['uiPlates']['phone-screen-payoff']['file'])
report['cached_frames'] = counts
print(json.dumps(report, indent=1))
