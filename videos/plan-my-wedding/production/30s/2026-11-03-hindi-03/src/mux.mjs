// Final encode: H.264 (yuv420p, high, crf 17) + AAC 192k, two-pass EBU R128 loudnorm to -16 LUFS / -1.5 dBTP.
import { execFileSync, spawnSync } from 'node:child_process';
const OUT = 'plan-my-wedding-30s-hindi03-01.mp4';
const p1 = spawnSync('ffmpeg', ['-hide_banner', '-i', 'build/mix.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' });
const m = JSON.parse(p1.stderr.slice(p1.stderr.lastIndexOf('{'), p1.stderr.lastIndexOf('}') + 1));
const ln = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', 'build/video_lossless.mkv', '-i', 'build/mix.wav',
  '-map', '0:v', '-map', '1:a', '-af', `${ln},aresample=48000`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30',
  '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', '30', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
console.log('measured input', m.input_i, 'LUFS', m.input_tp, 'dBTP ->', OUT);
