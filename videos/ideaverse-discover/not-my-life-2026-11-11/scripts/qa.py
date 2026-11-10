#!/usr/bin/env python3
"""Verification for the delivered MP4s. Writes build/qa/report.json + transition/representative contact sheets.
Checks: ffprobe container/codec/size/fps/duration, full decode without errors, decoded frame count == 750,
black frames, near-frozen runs, safe-area text bounds (from scene constants), loop seam (video + audio),
loudness/true peak, silence spans, beat alignment of cuts, and that both deliverables share identical picture."""
import json, os, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
OUT = 'build/qa'
os.makedirs(OUT, exist_ok=True)
FILES = ['out/not-my-life-25s.mp4', 'out/not-my-life-25s-no-music.mp4']
W, H, FPS, NF = 1080, 1920, 30, 750
CUTS = {54: 'dive lands (no cut, overlay)', 90: 'black card in', 105: 'superhook', 120: 'motion starts', 180: 'reveal-01 lands',
        248: 'feed proof', 285: 'reveal-02', 375: 'reveal-03', 480: 'payoff', 660: 'viewer closes to grid', 0: 'loop seam'}
rep = {}


def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def probe(f):
    r = sh(['ffprobe', '-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', f])
    j = json.loads(r.stdout)
    v = next(s for s in j['streams'] if s['codec_type'] == 'video')
    a = next((s for s in j['streams'] if s['codec_type'] == 'audio'), None)
    return {
        'format_duration': float(j['format']['duration']), 'size_bytes': int(j['format']['size']),
        'video': {k: v.get(k) for k in ('codec_name', 'profile', 'width', 'height', 'pix_fmt', 'r_frame_rate', 'avg_frame_rate', 'duration', 'nb_frames', 'nb_read_frames', 'color_space', 'color_transfer', 'color_primaries')},
        'audio': None if a is None else {k: a.get(k) for k in ('codec_name', 'profile', 'sample_rate', 'channels', 'duration', 'bit_rate')},
    }


def decode_errors(f):
    r = sh(['ffmpeg', '-v', 'error', '-xerror', '-i', f, '-map', '0', '-f', 'null', '-'])
    return r.returncode, r.stderr.strip()[:2000]


def frames_gray(f, w=270, h=480):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'scale={w}:{h}:flags=area,format=gray', '-f', 'rawvideo', '-'], capture_output=True)
    a = np.frombuffer(r.stdout, np.uint8)
    return a.reshape(-1, h, w).astype(np.float32)


def frames_rgb_small(f, w=270, h=480):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'scale={w}:{h}:flags=area,format=rgb24', '-f', 'rawvideo', '-'], capture_output=True)
    return np.frombuffer(r.stdout, np.uint8).reshape(-1, h, w, 3)


def lufs_tp(f):
    r = sh(['ffmpeg', '-nostats', '-i', f, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    lines = [l.strip() for l in r.stderr.splitlines()]
    I = next(float(l.split()[1]) for l in reversed(lines) if l.startswith('I:'))
    tp = next(float(l.split()[1]) for l in reversed(lines) if l.startswith('Peak:'))
    return I, tp


def silence(f, th=-50, d=0.25):
    r = sh(['ffmpeg', '-nostats', '-i', f, '-map', '0:a', '-af', f'silencedetect=n={th}dB:d={d}', '-f', 'null', '-'])
    return [l.split('] ')[-1] for l in r.stderr.splitlines() if 'silence_' in l]


def audio_pcm(f):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-map', '0:a', '-f', 'f32le', '-ac', '2', '-ar', '48000', '-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2)


for f in FILES:
    k = os.path.basename(f)
    p = probe(f)
    code, err = decode_errors(f)
    g = frames_gray(f)
    d = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))           # consecutive-frame change (0..255)
    mean = g.mean(axis=(1, 2))
    black = [int(i) for i in np.where(mean < 6)[0]]
    # black frames with text: count pixels that are bright
    bright = (g > 200).mean(axis=(1, 2))
    empty_black = [i for i in black if bright[i] < 0.002]
    low = d < 0.25
    runs, s = [], None
    for i, v in enumerate(low):
        if v and s is None: s = i
        if (not v or i == len(low) - 1) and s is not None:
            e = i if v else i - 1
            if e - s + 1 >= 6: runs.append([s + 1, e + 1])
            s = None
    seam = float(np.abs(g[-1] - g[0]).mean())
    pcm = audio_pcm(f)
    I, tp = lufs_tp(f)
    rep[k] = {
        'probe': p, 'decode_returncode': code, 'decode_errors': err, 'decoded_frames': int(g.shape[0]),
        'frame_count_ok': int(g.shape[0]) == NF and str(p['video']['nb_read_frames']) == str(NF),
        'resolution_ok': p['video']['width'] == W and p['video']['height'] == H,
        'codecs_ok': p['video']['codec_name'] == 'h264' and p['video']['pix_fmt'] == 'yuv420p' and p['audio'] and p['audio']['codec_name'] == 'aac',
        'fps_ok': p['video']['r_frame_rate'] == '30/1',
        'black_frames(mean<6)': black, 'empty_black_frames(no text)': empty_black,
        'near_frozen_runs(>=6 frames, diff<0.25)': runs,
        'frame_diff_stats': {'median': float(np.median(d)), 'p95': float(np.percentile(d, 95)), 'max': float(d.max()), 'argmax_frame': int(d.argmax()) + 1},
        'loop_video_last_to_first_diff': seam, 'loop_video_typical_diff_median': float(np.median(d)),
        'loop_video_diff_745_749': [float(x) for x in d[-5:]], 'loop_video_diff_0_4': [float(x) for x in d[:4]],
        'audio_samples': int(pcm.shape[0]), 'audio_seconds': pcm.shape[0] / 48000,
        'audio_seam_step': float(np.abs(pcm[0] - pcm[-1]).max()), 'audio_typical_step_median': float(np.median(np.abs(np.diff(pcm, axis=0)))),
        'integrated_lufs': I, 'true_peak_dbtp': tp, 'silence(-50dB,>=0.25s)': silence(f),
    }

# audio onsets vs picture cuts: largest rise of short-time energy within +-60 ms of each hit
def onsets(pcm, cuts):
    x = pcm.mean(axis=1); hop = 240; n = len(x) // hop
    e = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-12); de = np.diff(20 * np.log10(e))
    out = {}
    for c in cuts:
        i = int(round(c * 48000 / hop)); lo, hi = max(i - 12, 0), min(i + 12, len(de))
        j = lo + int(np.argmax(de[lo:hi])); out[f'{c:.3f}s'] = {'onset_offset_ms': round((j + 1 - i) * hop / 48, 1), 'rise_db': round(float(de[j]), 1)}
    return out
for f in FILES:
    rep[os.path.basename(f)]['audio_onsets_at_cuts'] = onsets(audio_pcm(f), [0.0, 3.0, 6.0, 9.5, 12.5, 16.0])
if os.path.exists('build/render_log.txt'):
    log = open('build/render_log.txt', errors='ignore').read()
    rep['render_log'] = {'missing_assets': log.count('MISSING ASSET'), 'page_errors': log.count('[pageerror]')}

# identical picture in both deliverables
r1 = sh(['ffmpeg', '-v', 'error', '-i', FILES[0], '-map', '0:v', '-f', 'md5', '-'])
r2 = sh(['ffmpeg', '-v', 'error', '-i', FILES[1], '-map', '0:v', '-f', 'md5', '-'])
rep['picture_identical_between_versions'] = r1.stdout.strip() == r2.stdout.strip()
rep['cuts_on_beat_grid'] = {str(f): {'what': w, 'seconds': f / FPS, 'beats': f / 15, 'on_beat': f % 15 == 0, 'on_8th': f % 15 in (0, 7, 8)} for f, w in sorted(CUTS.items())}
tb_file = 'build/qa/textboxes.json'  # produced by: node scripts/render.mjs --textboxes
if os.path.exists(tb_file):
    tb = json.load(open(tb_file)); boxes = [b for v in tb.values() for b in v if b['alpha'] > 0.01]
    bx = {'x0': min(b['x0'] for b in boxes), 'x1': max(b['x1'] for b in boxes), 'y0': min(b['y0'] for b in boxes), 'y1': max(b['y1'] for b in boxes)}
    rep['text_safe_area'] = {'measured_union_of_all_title_glyph_boxes': bx, 'frames_with_text': len(tb), 'required': {'x0': 100, 'x1': 900, 'y0': 230, 'y1': 1500},
                             'inside': bx['x0'] >= 100 and bx['x1'] <= 900 and bx['y0'] >= 230 and bx['y1'] <= 1500}
else:
    rep['text_safe_area'] = 'not measured (run node scripts/render.mjs --textboxes)'
rep['thumbnail_text_box'] = 'centre x 500, width <= 770 -> x ~115..885, y 1114..1486 (scripts/thumbnail.py)'

# contact sheets: every transition +-2 frames, and 1 fps overview
src = FILES[0]
def sheet(frames, name, cols):
    sel = '+'.join(f'eq(n\\,{i})' for i in frames)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', f"select='{sel}',scale=216:384,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='%{{eif\\:n\\:d}}':x=4:y=4:fontsize=16:fontcolor=yellow,tile={cols}x{int(np.ceil(len(frames) / cols))}:padding=3",
                    '-frames:v', '1', '-fps_mode', 'passthrough', f'{OUT}/{name}.png'], check=True)
trans = []
for c in [54, 90, 105, 120, 165, 180, 248, 260, 271, 285, 362, 375, 480, 660]:
    trans += [c - 2, c - 1, c, c + 1, c + 2]
trans += [745, 746, 747, 748, 749, 0, 1, 2]
trans = sorted(set(x for x in trans if 0 <= x < NF))
sheet(trans, 'transitions', 15)
sheet(list(range(0, NF, 15)), 'overview_every_15f', 10)
json.dump(rep, open(f'{OUT}/report.json', 'w'), indent=1, default=str)
for k in FILES:
    r = rep[os.path.basename(k)]
    print(os.path.basename(k), '| frames', r['decoded_frames'], '| ok', r['frame_count_ok'], r['resolution_ok'], r['codecs_ok'], r['fps_ok'],
          '| dur', r['probe']['format_duration'], '| decode rc', r['decode_returncode'], '| LUFS', r['integrated_lufs'], 'TP', r['true_peak_dbtp'],
          '| black', r['black_frames(mean<6)'][:20], '| empty black', r['empty_black_frames(no text)'], '| frozen', r['near_frozen_runs(>=6 frames, diff<0.25)'],
          '| seam v', round(r['loop_video_last_to_first_diff'], 2), 'median', round(r['loop_video_typical_diff_median'], 2),
          '| seam a', round(r['audio_seam_step'], 4), 'median', round(r['audio_typical_step_median'], 4), '| silence', r['silence(-50dB,>=0.25s)'])
print('picture identical between versions:', rep['picture_identical_between_versions'])
print('text safe area:', rep['text_safe_area'])
