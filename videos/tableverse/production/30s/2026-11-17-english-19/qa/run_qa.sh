#!/usr/bin/env bash
# Mux + verification for tableverse-30s-english19-01. Run from the episode folder:
#   bash qa/run_qa.sh <python-with-faster-whisper (optional)>
set -euo pipefail
OUT=tableverse-30s-english19-01.mp4
ASR_PY=${1:-}

# 1) mux: video copied, audio AAC 192 kb/s 48 kHz stereo; -0.5 dB headroom for AAC true-peak; hard 30.000 s
ffmpeg -y -hide_banner -loglevel error -i build/video.mp4 -i build/mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -af "volume=-0.5dB" \
  -t 30 -movflags +faststart "$OUT"

# 2) metadata
ffprobe -v error -show_format -show_streams -of json "$OUT" > qa/ffprobe.json
ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=codec_name,profile,pix_fmt,width,height,r_frame_rate,nb_read_frames,duration -of default=nw=1 "$OUT" > qa/video_stream.txt
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration -of default=nw=1 "$OUT" > qa/audio_stream.txt
ffprobe -v error -show_entries format=duration -of default=nw=1 "$OUT" > qa/format_duration.txt

# 3) full decode (any error output = failure)
ffmpeg -hide_banner -v error -i "$OUT" -f null - > qa/full_decode.log 2>&1 || true
echo "decode errors: $(wc -l < qa/full_decode.log)" >> qa/full_decode.log

# 4) loudness + true peak of the delivered AAC
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary:/,$p' > qa/loudness.txt

# 5) contact sheet (one frame per second, 30 tiles) + transition / representative frames
ffmpeg -y -hide_banner -loglevel error -i "$OUT" -vf "fps=1,scale=270:480,tile=6x5:padding=6:color=0x160A64" -frames:v 1 qa/contact_sheet.png
mkdir -p qa/frames
for f in 0 1 30 60 118 132 136 146 182 210 217 242 246 254 257 260 263 271 288 305 322 339 356 368 384 413 442 449 476 500 513 520 530 548 596 604 616 640 650 670 677 736 780 790 806 814 822 834 860 899; do
  ffmpeg -y -hide_banner -loglevel error -i "$OUT" -vf "select=eq(n\,$f)" -vframes 1 "qa/frames/f$(printf %04d $f).png"
done

# 6) narration timing: Whisper word timestamps vs planned VO spans
if [ -n "$ASR_PY" ]; then
  "$ASR_PY" -I qa/asr_check.py "$OUT" build/vo_spans.json > qa/asr_words.txt
fi
cat qa/video_stream.txt qa/audio_stream.txt qa/format_duration.txt; tail -1 qa/full_decode.log; cat qa/loudness.txt
