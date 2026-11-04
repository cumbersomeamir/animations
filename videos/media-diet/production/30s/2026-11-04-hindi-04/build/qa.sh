#!/usr/bin/env bash
# QA on the ENCODED file: streams/duration/frames, full decode, loudness, caption & safe-area bounds,
# contact sheets (representative + every cut boundary), one ASR + timing pass.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=media-diet-30s-hindi04-01.mp4; VENV=.cache/venv; mkdir -p qa .cache/qa_frames
ffprobe -v error -show_format -show_streams -count_frames -of json "$OUT" > qa/ffprobe.json
python3 - <<'PY'
import json
d = json.load(open('qa/ffprobe.json')); v = [s for s in d['streams'] if s['codec_type'] == 'video'][0]; a = [s for s in d['streams'] if s['codec_type'] == 'audio'][0]
c = {'h264 High': v['codec_name'] == 'h264' and v.get('profile') == 'High', 'yuv420p': v['pix_fmt'] == 'yuv420p', '1080x1920': (v['width'], v['height']) == (1080, 1920),
     '30/1 fps': v['r_frame_rate'] == '30/1' and v['avg_frame_rate'] == '30/1', '900 frames': int(v['nb_read_frames']) == 900,
     'video 30.000 s': abs(float(v['duration']) - 30.0) < 0.0005, 'aac 48 kHz stereo': a['codec_name'] == 'aac' and a['sample_rate'] == '48000' and a['channels'] == 2,
     'audio 30.000 s (±1 AAC frame)': abs(float(a['duration']) - 30.0) <= 0.0214, 'container 30.0 s': abs(float(d['format']['duration']) - 30.0) <= 0.0214}
json.dump({'checks': c, 'video_duration': v['duration'], 'audio_duration': a['duration'], 'format_duration': d['format']['duration'], 'frames': v['nb_read_frames'],
           'bit_rate': d['format']['bit_rate'], 'size': d['format']['size']}, open('qa/stream-checks.json', 'w'), indent=1)
for k, ok in c.items(): print(('PASS ' if ok else 'FAIL ') + k)
assert all(c.values())
PY
ffmpeg -hide_banner -v error -xerror -i "$OUT" -map 0 -f null - 2> qa/full-decode.log && echo "full decode: exit 0, $(wc -c < qa/full-decode.log) bytes of errors" | tee qa/full-decode-result.txt
ffmpeg -hide_banner -nostats -i "$OUT" -map 0:a -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary:/,$p' > qa/loudness.txt
python3 - <<'PY'
import re
s = open('qa/loudness.txt').read(); I = float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1)); tp = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1))
ok = -16.0 <= I <= -14.0 and tp <= -1.0
print(f"loudness: integrated {I} LUFS, true peak {tp} dBTP -> {'PASS' if ok else 'FAIL'}"); assert ok
PY
python3 build/bounds_check.py
rm -f .cache/qa_frames/*.png
for i in $(seq 0 29); do t=$(python3 -c "print(f'{0.5 + $i:.2f}')"); ffmpeg -v error -y -ss "$t" -i "$OUT" -frames:v 1 ".cache/qa_frames/t${t}.png"; done
"$VENV/bin/python" build/contact.py qa/contact-sheet-representative.png 6 250 $(ls .cache/qa_frames/t*.png | sort -V)
rm -f .cache/qa_frames/*.png
for c in 2.72 6.18 10.79 16.64 22.12 25.96; do f=$(python3 -c "print(round($c*30))"); for d in -2 -1 0 1 2; do n=$((f+d)); ffmpeg -v error -y -i "$OUT" -vf "select=eq(n\,$n)" -vsync 0 -frames:v 1 ".cache/qa_frames/cut${c}_f$(printf %03d $n).png"; done; done
"$VENV/bin/python" build/contact.py qa/contact-sheet-boundaries.png 5 230 $(ls .cache/qa_frames/cut*.png | sort -V)
ffmpeg -v error -y -i "$OUT" -vf "select=eq(n\,0)" -vsync 0 -frames:v 1 qa/first-frame.png
ffmpeg -v error -y -i "$OUT" -vf "select=eq(n\,899)" -vsync 0 -frames:v 1 qa/last-frame.png
"$VENV/bin/python" build/asr_check_hi.py "$OUT" qa/asr.json
echo "QA complete"
