"""QA for the NutriAI 15 s test MP4: metadata, full decode, duration, audio loudness/clipping,
black/freeze detection, text safe-area check, contact sheets. Writes into ../../qa/.
Usage: python3 -I qa.py <video.mp4>
"""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.dirname(HERE)
QA = os.path.join(os.path.dirname(SRC), 'qa')
os.makedirs(QA, exist_ok=True)
video = os.path.abspath(sys.argv[1])
TL = json.load(open(os.path.join(SRC, 'timeline.json')))
res = {}

def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.returncode, p.stdout, p.stderr

# 1. ffprobe
_, out, _ = run(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-count_frames', '-of', 'json', video])
probe = json.loads(out)
json.dump(probe, open(os.path.join(QA, 'ffprobe.json'), 'w'), indent=1)
v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
a = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
res['video'] = {k: v.get(k) for k in ['codec_name', 'profile', 'width', 'height', 'pix_fmt', 'r_frame_rate', 'avg_frame_rate', 'nb_read_frames', 'duration']}
res['audio'] = {k: a.get(k) for k in ['codec_name', 'sample_rate', 'channels', 'duration']}
res['container_duration'] = probe['format']['duration']

# 2. full decode
code, _, err = run(['ffmpeg', '-v', 'error', '-i', video, '-f', 'null', '-'])
open(os.path.join(QA, 'decode.log'), 'w').write(err)
res['full_decode'] = {'exit_code': code, 'error_lines': len([l for l in err.splitlines() if l.strip()])}

# 3. loudness + peaks
_, _, err = run(['ffmpeg', '-hide_banner', '-nostats', '-i', video, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'])
summ = err[err.rfind('Summary:'):]
num = lambda pat: float(re.search(pat, summ).group(1)) if re.search(pat, summ) else None
res['loudness'] = {'integrated_LUFS': num(r'I:\s+(-?[\d.]+) LUFS'), 'LRA_LU': num(r'LRA:\s+(-?[\d.]+) LU'), 'true_peak_dBFS': num(r'Peak:\s+(-?[\d.]+) dBFS')}
_, _, err = run(['ffmpeg', '-hide_banner', '-nostats', '-i', video, '-af', 'astats=metadata=0:reset=0', '-f', 'null', '-'])
ov = err[err.rfind('Overall'):]
grab = lambda k: (re.search(k + r':\s+(-?[\w.]+)', ov).group(1) if re.search(k + r':\s+(-?[\w.]+)', ov) else None)
res['astats'] = {'peak_level_dB': grab('Peak level dB'), 'rms_level_dB': grab('RMS level dB'), 'clipped_samples': grab('Number of clipped samples') }

# 4. black / freeze detection
_, _, err = run(['ffmpeg', '-hide_banner', '-nostats', '-i', video, '-vf', 'blackdetect=d=0.25:pix_th=0.06,freezedetect=n=0.002:d=0.6', '-an', '-f', 'null', '-'])
res['blackdetect'] = re.findall(r'black_start:\S+ black_end:\S+ black_duration:\S+', err)
res['freezedetect'] = re.findall(r'freeze_(?:start|duration|end): \S+', err)

# 5. text safe area (from the page's own layout boxes)
tb_path = os.path.join(SRC, 'build', 'text-boxes.json')
if os.path.exists(tb_path):
    tb = json.load(open(tb_path))
    bad = []
    for k, items in tb.items():
        for it in items:
            if it['x0'] < 60 or it['x1'] > 1020: bad.append((k, it))
    res['text_safe_area'] = {'checked': sum(len(v) for v in tb.values()), 'outside_60_1020px': bad}

# 6. contact sheets: every 0.5 s, plus scene boundaries
def frames_at(ts, prefix):
    paths = []
    for i, t in enumerate(ts):
        pth = os.path.join(QA, f'_{prefix}{i:03d}.png')
        run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{t:.4f}', '-i', video, '-frames:v', '1', pth])
        paths.append((t, pth))
    return paths
def sheet(paths, cols, name, w=180):
    h = int(w * 16 / 9)
    rows = (len(paths) + cols - 1) // cols
    m = Image.new('RGB', (cols * w, rows * (h + 18)), (25, 25, 25))
    d = ImageDraw.Draw(m)
    for i, (t, p) in enumerate(paths):
        im = Image.open(p).convert('RGB').resize((w, h))
        x, y = (i % cols) * w, (i // cols) * (h + 18)
        m.paste(im, (x, y + 18))
        d.text((x + 4, y + 3), f'{t:.2f}s  f{round(t * TL["fps"])}', fill=(230, 230, 230))
        os.remove(p)
    m.save(os.path.join(QA, name))
ts = [i * 0.5 + 0.017 for i in range(30)]
sheet(frames_at(ts, 'c'), 6, 'contact-sheet.png')
bounds = []
for s in TL['scenes']:
    for f in (s['start'], s['start'] + 1, s['end'] - 1):
        if 0 <= f < TL['frames']: bounds.append(f)
bounds = sorted(set(bounds))
sheet(frames_at([min((f + 0.5) / TL['fps'], TL['frames'] / TL['fps'] - 0.05) for f in bounds], 'b'), 6, 'scene-boundaries.png')
run(['ffmpeg', '-y', '-v', 'error', '-i', video, '-filter_complex', 'showwavespic=s=1600x300:split_channels=1:colors=#86DA3F|#A6E955', '-frames:v', '1', os.path.join(QA, 'audio-waveform.png')])

json.dump(res, open(os.path.join(QA, 'qa-results.json'), 'w'), indent=1)
print(json.dumps(res, indent=1))
