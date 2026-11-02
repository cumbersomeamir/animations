#!/usr/bin/env bash
# QA for the final MP4: ffprobe metadata, full decode, frame count, loudness, contact sheets, waveform.
set -euo pipefail
cd "$(dirname "$0")/.."
F="${1:-aarambh-education-pilot-01.mp4}"
mkdir -p qa
FONT=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
ffprobe -v error -show_format -show_streams -of json "$F" > qa/ffprobe.json
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames,r_frame_rate,duration,width,height,codec_name,pix_fmt,profile -of default=nw=1 "$F" > qa/video_stream.txt
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels,duration,bit_rate -of default=nw=1 "$F" > qa/audio_stream.txt
# full decode of every video and audio packet; any error is written to the log
ffmpeg -v error -xerror -i "$F" -map 0 -f null - > qa/full_decode.log 2>&1 && echo "full decode OK (no errors)" >> qa/full_decode.log
ffmpeg -hide_banner -i "$F" -af loudnorm=print_format=summary -f null - 2> qa/loudness_raw.txt || true
grep -E "Input (Integrated|True Peak|LRA)" qa/loudness_raw.txt > qa/loudness.txt; rm -f qa/loudness_raw.txt
ffmpeg -hide_banner -i "$F" -af astats=metadata=0 -f null - 2>&1 | grep -E "Peak level dB|RMS level dB|Number of NaNs" | tail -3 > qa/astats.txt || true
# representative contact sheet: one frame every 0.5 s (30 frames)
SEL=$(python3 -c "print('+'.join(f'eq(n\\\\,{i*15})' for i in range(30)))")
ffmpeg -v error -y -i "$F" -vf "drawtext=fontfile=$FONT:text='f%{n}  %{pts\:flt}s':x=20:y=20:fontsize=44:fontcolor=white:box=1:boxcolor=black@0.6,select='$SEL',scale=270:480,tile=10x3:padding=6:color=black" -frames:v 1 -q:v 3 -fps_mode passthrough qa/contact_representative.jpg
# boundary contact sheet: frame before / at / after each scene transition + first/last frames
B="0 1 105 106 107 113 114 115 131 132 133 185 186 187 269 270 271 365 366 367 380 381 382 447 448 449"
SEL=$(python3 -c "print('+'.join(f'eq(n\\\\,{int(x)})' for x in '$B'.split()))")
ffmpeg -v error -y -i "$F" -vf "drawtext=fontfile=$FONT:text='f%{n}  %{pts\:flt}s':x=20:y=20:fontsize=44:fontcolor=white:box=1:boxcolor=black@0.6,select='$SEL',scale=270:480,tile=9x3:padding=6:color=black" -frames:v 1 -q:v 3 -fps_mode passthrough qa/contact_boundaries.jpg
ffmpeg -v error -y -i "$F" -filter_complex "showwavespic=s=1600x300:split_channels=1:colors=0xF1B444|0xFBF7EE" -frames:v 1 -q:v 3 qa/waveform.jpg
cat qa/video_stream.txt qa/audio_stream.txt qa/loudness.txt qa/full_decode.log
