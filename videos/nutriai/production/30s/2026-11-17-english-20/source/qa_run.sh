#!/bin/bash
# Machine QA on the exported MP4 (run from this source folder). Writes ../qa/*. ASR needs the scratchpad venv: PY=<venv python> ASR=<asr script>.
set -e
MP4=${1:-../nutriai-30s-english20-01.mp4}; Q=../qa; mkdir -p $Q
ffprobe -v error -show_streams -show_format -count_frames -of json "$MP4" > $Q/ffprobe.json
ffmpeg -v error -i "$MP4" -f null - 2> $Q/decode.log || true
ffmpeg -hide_banner -nostats -i "$MP4" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary:/,$p' > $Q/loudness.txt
{ echo "blackdetect d=0.1 pix_th=0.10:"; ffmpeg -hide_banner -nostats -i "$MP4" -vf blackdetect=d=0.1:pix_th=0.10 -an -f null - 2>&1 | grep -c black_start || true
  echo "freezedetect default (n=0.001 d=0.5):"; ffmpeg -hide_banner -nostats -i "$MP4" -vf freezedetect=n=0.001:d=0.5 -an -f null - 2>&1 | grep -E "freeze_(start|duration)" || echo 0
  echo "freezedetect strict (n=0.003 d=0.5):"; ffmpeg -hide_banner -nostats -i "$MP4" -vf freezedetect=n=0.003:d=0.5 -an -f null - 2>&1 | grep -E "freeze_(start|duration)" || echo 0; } > $Q/black-freeze.txt
python3 qa_bounds.py textlog.json > $Q/text-bounds.txt
ffmpeg -v error -y -i "$MP4" -vf "select='not(mod(n\,30))+eq(n\,899)',scale=270:480,drawtext=fontfile=../../../../source/fonts/Inter-Bold.otf:text='%{n}':x=6:y=6:fontsize=22:fontcolor=red:box=1:boxcolor=white@0.7,tile=8x4:padding=4:color=white" -fps_mode passthrough -frames:v 1 $Q/contact-sheet.png
if [ -n "$PY" ]; then $PY $ASR base.en --vad "$MP4" 2>&1 | grep -v -i warn | sed 's/np.float64(\([0-9.]*\))/\1/g' > $Q/asr-final-mp4.txt; $PY $ASR small.en --text "$MP4" 2>&1 | grep -v -i warn > $Q/asr-final-small.txt; fi
echo QA done
