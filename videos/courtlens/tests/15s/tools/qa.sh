#!/usr/bin/env bash
# QA evidence for the delivered MP4 -> qa/
set -euo pipefail
cd "$(dirname "$0")/.."
F=courtlens-15s-test.mp4
mkdir -p qa/frames
ffprobe -v error -show_format -show_streams -of json "$F" > qa/ffprobe.json
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,r_frame_rate,width,height,codec_name,pix_fmt -of default=nw=1 "$F" > qa/video_stream.txt
ffmpeg -v error -i "$F" -f null - 2> qa/decode_errors.txt && echo "full decode: OK ($(wc -c < qa/decode_errors.txt) bytes of errors)" > qa/decode.txt
ffmpeg -hide_banner -nostats -i "$F" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' > qa/loudness.txt
ffmpeg -hide_banner -nostats -i "$F" -af astats=metadata=0 -f null - 2>&1 | grep -E "Peak level dB|RMS level dB|Number of samples" | tail -3 > qa/astats.txt
# contact sheet: one frame every 0.5 s (30 tiles)
ffmpeg -v error -y -i "$F" -vf "fps=2,scale=216:384,tile=10x3:padding=4:color=white" -frames:v 1 qa/contact-sheet.png
# scene-boundary + representative frames
for t in 0.00 1.50 2.00 2.70 5.20 6.40 7.80 8.25 9.50 10.40 11.35 11.85 12.05 12.60 13.40 14.20; do
  ffmpeg -v error -y -ss $t -i "$F" -q:v 3 -frames:v 1 qa/frames/f_$t.jpg
done
ffmpeg -v error -y -sseof -0.05 -i "$F" -q:v 3 -frames:v 1 -update 1 qa/frames/f_last.jpg
ffmpeg -v error -y -i qa/frames/f_0.00.jpg -i qa/frames/f_2.00.jpg -i qa/frames/f_5.20.jpg -i qa/frames/f_8.25.jpg -i qa/frames/f_12.05.jpg -i qa/frames/f_12.60.jpg -i qa/frames/f_13.40.jpg -i qa/frames/f_last.jpg -filter_complex "hstack=8,scale=2880:-1" qa/boundary_strip.png
ffmpeg -v error -y -i "$F" -lavfi "showwavespic=s=1600x240:colors=0xE0AD59" -frames:v 1 qa/waveform.png
cat qa/video_stream.txt qa/decode.txt; grep -E "I:|LRA:|Peak:" qa/loudness.txt; jq -r '.format.duration' qa/ffprobe.json 2>/dev/null || python3 -c "import json;print(json.load(open('qa/ffprobe.json'))['format']['duration'])"
