"""QA for courtlens-30s-feedback-01.mp4 — run after build.sh.
Usage: python qa.py <mp4> <timeline.json> <lines_dir> <qa_out_dir>
Checks: container/codec spec, full decode, loudness, narration timing (cross-correlation of each TTS line against the
decoded MP4 audio), top safe zone (y<300) free of dark text pixels, contact sheet + transition frames.
Writes qa_report.json in qa_out_dir.
"""
import json, subprocess, sys, os
import numpy as np
import soundfile as sf

mp4, tl_path, lines_dir, out = sys.argv[1:5]
os.makedirs(out, exist_ok=True)
tl = json.load(open(tl_path))
rep = {}


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


# 1. spec
pr = json.loads(run(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-count_frames', '-of', 'json', mp4]).stdout)
v = [s for s in pr['streams'] if s['codec_type'] == 'video'][0]
a = [s for s in pr['streams'] if s['codec_type'] == 'audio'][0]
rep['spec'] = {
    'format_duration': float(pr['format']['duration']), 'size_bytes': int(pr['format']['size']),
    'video': {k: v.get(k) for k in ['codec_name', 'profile', 'width', 'height', 'pix_fmt', 'r_frame_rate', 'avg_frame_rate', 'nb_read_frames', 'duration', 'color_space']},
    'audio': {k: a.get(k) for k in ['codec_name', 'profile', 'sample_rate', 'channels', 'duration']},
}
s = rep['spec']
s['pass'] = (abs(s['format_duration'] - 30.0) < 1e-3 and v['codec_name'] == 'h264' and v['pix_fmt'] == 'yuv420p'
             and v['width'] == 1080 and v['height'] == 1920 and v['r_frame_rate'] == '30/1'
             and int(v['nb_read_frames']) == 900 and a['codec_name'] == 'aac')

# 2. full decode
d = run(['ffmpeg', '-hide_banner', '-v', 'error', '-i', mp4, '-f', 'null', '-'])
rep['full_decode'] = {'returncode': d.returncode, 'errors': d.stderr.strip()[:2000], 'pass': d.returncode == 0 and not d.stderr.strip()}

# 3. loudness
lo = run(['ffmpeg', '-hide_banner', '-nostats', '-i', mp4, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr
summ = lo[lo.rfind('Summary:'):]
def grab(key):
    for line in summ.splitlines():
        if line.strip().startswith(key):
            return float(line.split(':')[1].split()[0])
rep['loudness'] = {'integrated_lufs': grab('I:'), 'lra_lu': grab('LRA:'), 'true_peak_dbfs': grab('Peak:')}

# 4. narration timing via cross-correlation
wav = os.path.join(out, '_audio.wav')
run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-i', mp4, '-ac', '1', '-ar', '24000', wav])
mix, sr = sf.read(wav)
timing = []
for item in tl['narration']:
    x, sr2 = sf.read(f"{lines_dir}/{item['id']}.wav")
    assert sr2 == sr
    st = item['start']; w0 = int(max(0, st - 0.5) * sr); w1 = int(min(len(mix), (st + 0.5) * sr + len(x)))
    seg = mix[w0:w1]
    n = 1 << int(np.ceil(np.log2(len(seg) + len(x))))
    cc = np.fft.irfft(np.fft.rfft(seg, n) * np.conj(np.fft.rfft(x, n)), n)[: len(seg) - len(x) + 1]
    lag = int(np.argmax(cc)); found = (w0 + lag) / sr
    corr = float(cc[lag] / (np.linalg.norm(x) * np.linalg.norm(seg[lag:lag + len(x)]) + 1e-12))
    timing.append({'id': item['id'], 'planned_start': st, 'measured_start': round(found, 4),
                   'offset_ms': round((found - st) * 1000, 1), 'end': round(found + len(x) / sr, 3), 'similarity': round(corr, 3)})
os.remove(wav)
rep['narration_timing'] = timing
rep['narration_pass'] = all(abs(t['offset_ms']) <= 40 and t['similarity'] > 0.8 for t in timing)
last = timing[-1]
rep['cta'] = {'starts': last['measured_start'], 'ends': last['end'], 'final_seconds_window': round(30 - last['measured_start'], 2),
              'pass': 3.0 <= 30 - last['measured_start'] <= 4.0}

# caption chunks vs speech
caps = tl['captions']
rep['captions'] = {'count': len(caps), 'non_overlapping': all(caps[i]['end'] <= caps[i + 1]['start'] + 1e-9 for i in range(len(caps) - 1))}

# 5. safe zone: y<300 must hold no dark (text/diagram) pixels — sampled every 5th frame
buf = subprocess.run(['ffmpeg', '-hide_banner', '-v', 'error', '-i', mp4, '-vf', "select='not(mod(n\\,5))',crop=1080:300:0:0,format=gray", '-vsync', '0', '-f', 'rawvideo', '-'], capture_output=True).stdout
fr = np.frombuffer(buf, np.uint8).reshape(-1, 300, 1080)
mins = fr.reshape(len(fr), -1).min(axis=1)
rep['top_safe_zone'] = {'frames_checked': int(len(fr)), 'darkest_pixel': int(mins.min()), 'pass': bool(mins.min() > 150)}

# 6. sheets
run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-i', mp4, '-vf',
     "select='not(mod(n\\,30))',scale=270:480,drawtext=fontfile=/usr/share/fonts/opentype/inter/Inter-Bold.otf:text='%{eif\\:n\\:d}s':x=8:y=448:fontsize=22:fontcolor=0x02193B:box=1:boxcolor=0xFFFFFF@0.8,tile=6x5:padding=4:color=white",
     '-frames:v', '1', '-q:v', '3', os.path.join(out, 'contact-sheet-1fps.jpg')])
times = [0.0, 2.55, 3.6, 4.5, 6.1, 9.3, 13.35, 15.5, 18.7, 21.95, 23.6, 24.8, 26.6, 29.94]
tiles = []
for t in times:
    f = os.path.join(out, f'_t{t:05.2f}.png')
    run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-ss', f'{t}', '-i', mp4, '-frames:v', '1', '-vf',
         f"scale=360:640,drawtext=fontfile=/usr/share/fonts/opentype/inter/Inter-Bold.otf:text='{t:.2f}s':x=8:y=612:fontsize=22:fontcolor=0x02193B:box=1:boxcolor=0xFFFFFF@0.8", f])
    tiles.append(f)
inputs = sum([['-i', f] for f in tiles], [])
run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', *inputs, '-filter_complex',
     ''.join(f'[{i}:v]' for i in range(len(tiles))) + f'xstack=inputs={len(tiles)}:layout=' +
     '|'.join(f'{(i % 7) * 360}_{(i // 7) * 640}' for i in range(len(tiles))), '-q:v', '3', os.path.join(out, 'transition-frames.jpg')])
for f in tiles:
    if os.path.exists(f): os.remove(f)
run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-sseof', '-0.04', '-i', mp4, '-frames:v', '1', '-q:v', '2', os.path.join(out, 'final-frame.jpg')])

rep['all_pass'] = all([s['pass'], rep['full_decode']['pass'], rep['narration_pass'], rep['cta']['pass'],
                       rep['captions']['non_overlapping'], rep['top_safe_zone']['pass']])
json.dump(rep, open(os.path.join(out, 'qa_report.json'), 'w'), indent=2)
print(json.dumps(rep, indent=2))
