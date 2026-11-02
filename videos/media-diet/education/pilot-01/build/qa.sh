#!/usr/bin/env bash
# QA for the final MP4: ffprobe metadata, exact-duration checks, full decode, loudness, contact sheets from the
# ENCODED file, ASR intelligibility check, text-bounds report (written by render.mjs during the frame render).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=media-diet-education-pilot-01.mp4
VENV=.cache/venv
mkdir -p qa .cache/qa_frames
ffprobe -v error -show_format -show_streams -count_frames -of json "$OUT" > qa/ffprobe.json
python3 - <<'PY'
import json
d = json.load(open('qa/ffprobe.json'))
v = [s for s in d['streams'] if s['codec_type'] == 'video'][0]
a = [s for s in d['streams'] if s['codec_type'] == 'audio'][0]
checks = {
  'video codec h264': v['codec_name'] == 'h264',
  'pix_fmt yuv420p': v['pix_fmt'] == 'yuv420p',
  'size 1080x1920': (v['width'], v['height']) == (1080, 1920),
  'fps 30/1': v['r_frame_rate'] == '30/1' and v['avg_frame_rate'] == '30/1',
  'frames 450': int(v['nb_read_frames']) == 450,
  'video duration 15.000': abs(float(v['duration']) - 15.0) < 0.0005,
  'audio codec aac': a['codec_name'] == 'aac',
  'audio 48 kHz stereo': a['sample_rate'] == '48000' and a['channels'] == 2,
  'audio duration 15.000 (+/-1 AAC frame)': abs(float(a['duration']) - 15.0) <= 0.0214,
  'container duration 15.0x': abs(float(d['format']['duration']) - 15.0) <= 0.0214,
}
rep = {'checks': checks, 'video_duration': v['duration'], 'audio_duration': a['duration'], 'format_duration': d['format']['duration'],
       'nb_frames': v['nb_read_frames'], 'bit_rate': d['format']['bit_rate'], 'size_bytes': d['format']['size']}
json.dump(rep, open('qa/stream-checks.json', 'w'), indent=1)
for k, ok in checks.items(): print(('PASS ' if ok else 'FAIL ') + k)
print('durations: video', v['duration'], 'audio', a['duration'], 'format', d['format']['duration'])
assert all(checks.values()), 'stream checks failed'
PY
# full decode of every video + audio packet; any error output fails QA
ffmpeg -hide_banner -v error -xerror -i "$OUT" -map 0 -f null - 2> qa/full-decode.log
echo "full decode: exit 0, $(wc -c < qa/full-decode.log) bytes of errors" | tee qa/full-decode-result.txt
# loudness / peaks of the delivered audio
ffmpeg -hide_banner -nostats -i "$OUT" -map 0:a -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary:/,$p' > qa/loudness.txt
ffmpeg -hide_banner -nostats -i "$OUT" -map 0:a -af astats=metadata=0 -f null - 2>&1 | grep -E "Peak level dB|RMS level dB|Number of samples|Flat factor|Peak count" | head -8 >> qa/loudness.txt
cat qa/loudness.txt
# contact sheets from the encoded MP4
rm -f .cache/qa_frames/*.png
for i in $(seq 0 29); do t=$(python3 -c "print(f'{0.25 + $i*0.5:.2f}')"); ffmpeg -v error -y -ss "$t" -i "$OUT" -frames:v 1 ".cache/qa_frames/t${t}.png"; done
"$VENV/bin/python" build/contact.py qa/contact-sheet-representative.png 6 260 $(ls .cache/qa_frames/t*.png | sort -V)
rm -f .cache/qa_frames/*.png
for c in 2.65 6.32 8.75 10.70; do
  f=$(python3 -c "print(round($c*30))")
  for d in -2 -1 0 1 2; do n=$((f+d)); ffmpeg -v error -y -i "$OUT" -vf "select=eq(n\,$n)" -vsync 0 -frames:v 1 ".cache/qa_frames/cut${c}_f$(printf %03d $n).png"; done
done
"$VENV/bin/python" build/contact.py qa/contact-sheet-boundaries.png 5 260 $(ls .cache/qa_frames/cut*.png | sort -V)
# first / last frames
ffmpeg -v error -y -i "$OUT" -vf "select=eq(n\,0)" -vsync 0 -frames:v 1 qa/first-frame.png
ffmpeg -v error -y -i "$OUT" -vf "select=eq(n\,449)" -vsync 0 -frames:v 1 qa/last-frame.png
# intelligibility: offline ASR (Vosk small en-us) on the final mix vs the scripted narration
if [ -d .cache/vosk-model-small-en-us-0.15 ]; then
  "$VENV/bin/python" build/asr_check.py "$OUT" .cache/vosk-model-small-en-us-0.15 qa/asr-transcript.json
fi
echo "QA complete"
