#!/usr/bin/env python3
"""Automated QA for the delivered MP4. Writes into ../qa/:
  ffprobe.json, decode.log, checks.json, contact-representative.png, contact-boundaries.png,
  and asr-intelligibility.json when VOSK_MODEL + a vosk-capable python (VOSK_PY) are set.
Usage: qa.py <final.mp4>"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
QA = os.path.join(ROOT, 'qa'); os.makedirs(QA, exist_ok=True)
mp4 = os.path.abspath(sys.argv[1])
run = lambda cmd: subprocess.run(cmd, capture_output=True, text=True)

# 1. ffprobe (with exact frame/packet counts)
p = run(['ffprobe', '-v', 'error', '-count_frames', '-show_format', '-show_streams', '-of', 'json', mp4])
probe = json.loads(p.stdout)
json.dump(probe, open(os.path.join(QA, 'ffprobe.json'), 'w'), indent=2)
v = next(s for s in probe['streams'] if s['codec_type'] == 'video')
a = next(s for s in probe['streams'] if s['codec_type'] == 'audio')

# 2. full decode of every video frame and audio sample
d = run(['ffmpeg', '-v', 'error', '-nostdin', '-i', mp4, '-map', '0', '-f', 'null', '-'])
open(os.path.join(QA, 'decode.log'), 'w').write(
    f"command: ffmpeg -v error -i {os.path.basename(mp4)} -map 0 -f null -\nexit_code: {d.returncode}\nstderr_bytes: {len(d.stderr)}\n{d.stderr}")

# 3. decoded audio sample count, loudness, black/freeze detection
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-i', mp4, '-map', '0:a', '-f', 's16le', '-ac', '2', '-ar', '48000', '-'], capture_output=True).stdout
samples = len(pcm) // 4
import array
tail = array.array('h', pcm[720000 * 4:])
tail_peak = max((abs(x) for x in tail), default=0) / 32768
loud = run(['ffmpeg', '-hide_banner', '-nostdin', '-i', mp4, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'])
summ = ' '.join(loud.stderr[loud.stderr.rfind('Summary:'):].split())
black = run(['ffmpeg', '-hide_banner', '-nostdin', '-i', mp4, '-map', '0:v', '-vf', 'blackdetect=d=0.1:pix_th=0.06', '-f', 'null', '-'])
freeze = run(['ffmpeg', '-hide_banner', '-nostdin', '-i', mp4, '-map', '0:v', '-vf', 'freezedetect=n=0.0005:d=0.5', '-f', 'null', '-'])
checks = {
    'file': os.path.relpath(mp4, ROOT), 'bytes': os.path.getsize(mp4),
    'format_duration_s': float(probe['format']['duration']),
    'video': {'codec': v['codec_name'], 'profile': v.get('profile'), 'pix_fmt': v['pix_fmt'], 'width': v['width'], 'height': v['height'],
              'r_frame_rate': v['r_frame_rate'], 'avg_frame_rate': v['avg_frame_rate'], 'nb_read_frames': int(v['nb_read_frames']),
              'duration_s': float(v['duration'])},
    'audio': {'codec': a['codec_name'], 'profile': a.get('profile'), 'sample_rate': int(a['sample_rate']), 'channels': a['channels'],
              'duration_s': float(a['duration']), 'duration_ts': int(a['duration_ts']), 'time_base': a['time_base'],
              'start_time': a['start_time'], 'decoded_samples': samples, 'decoded_seconds': samples / 48000,
              'decoded_overhang_samples': samples - 720000, 'overhang_peak_abs': round(tail_peak, 6),
              'note': 'AAC decodes whole 1024-sample frames; the stream declares 720000 samples (15.000 s) and the '
                      'encoder priming (1024) is offset by a negative first pts. Samples beyond 720000 are end padding.'},
    'full_decode': {'exit_code': d.returncode, 'errors': d.stderr.strip()[:500]},
    'loudness_ebur128': summ,
    'blackdetect': re.findall(r'black_start:\S+ black_end:\S+ black_duration:\S+', black.stderr),
    'freezedetect': re.findall(r'freeze_(?:start|duration|end): \S+', freeze.stderr),
}
checks['pass'] = {
    'h264_1080x1920_30fps': v['codec_name'] == 'h264' and v['width'] == 1080 and v['height'] == 1920 and v['r_frame_rate'] == '30/1',
    'exactly_450_frames': int(v['nb_read_frames']) == 450,
    'video_15.000s': abs(float(v['duration']) - 15.0) < 1e-6,
    'aac_audio_present': a['codec_name'] == 'aac',
    'audio_declared_720000_samples': int(a['duration_ts']) == 720000 and a['time_base'] == '1/48000',
    'audio_decoded_covers_15s_overhang_silent': samples >= 720000 and tail_peak < 0.001,
    'container_15.000s': abs(float(probe['format']['duration']) - 15.0) < 0.0011,
    'full_decode_clean': d.returncode == 0 and not d.stderr.strip(),
    'no_black_segments': not checks['blackdetect'],
}
json.dump(checks, open(os.path.join(QA, 'checks.json'), 'w'), indent=2)
print(json.dumps(checks['pass'], indent=2))

# 4. contact sheets decoded from the delivered file
rep = [f'{t:.3f}' for t in range(15)] + ['14.967']
subprocess.run([sys.executable, os.path.join(HERE, 'contact.py'), 'video', os.path.join(QA, 'contact-representative.png'), '8', mp4] + rep, check=True)
# boundary frames: first/last, each side of every beat change and the hard cut (f223|f224)
bnd = ['0.000', '0.033', '2.433', '2.500', '2.567', '4.967', '5.033', '7.400', '7.433', '7.467', '7.500',
       '9.500', '9.567', '10.467', '10.533', '13.600', '13.667', '14.933', '14.967']
subprocess.run([sys.executable, os.path.join(HERE, 'contact.py'), 'video', os.path.join(QA, 'contact-boundaries.png'), '7', mp4] + bnd, check=True)

# 5. ASR intelligibility on the delivered audio (optional)
if os.environ.get('VOSK_MODEL') and os.environ.get('VOSK_PY'):
    r = run([os.environ['VOSK_PY'], '-I', os.path.join(HERE, 'asr_check.py'), mp4, os.environ['VOSK_MODEL'], os.path.join(QA, 'asr-intelligibility.json')])
    print(r.stdout)
