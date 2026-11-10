// QA evidence: ffprobe metadata, full decode, loudness, contact sheet and scene-boundary sheet.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
const OUT = 'plan-my-wedding-30s-english11-01.mp4';
fs.mkdirSync('qa', { recursive: true });
const probe = execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', OUT], { encoding: 'utf8' });
fs.writeFileSync('qa/ffprobe.json', probe);
const j = JSON.parse(probe);
const v = j.streams.find((s) => s.codec_type === 'video'), a = j.streams.find((s) => s.codec_type === 'audio');
const dec = spawnSync('ffmpeg', ['-v', 'error', '-i', OUT, '-f', 'null', '-'], { encoding: 'utf8' });
fs.writeFileSync('qa/decode.log', dec.stderr || '');
const frames = execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', OUT], { encoding: 'utf8' }).trim();
const eb = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', OUT, '-filter_complex', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const sum = eb.slice(eb.lastIndexOf('Summary:'));
const I = +(sum.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1], TP = +(sum.match(/Peak:\s+(-?[\d.]+) dBFS/) || [])[1];
const vd = spawnSync('ffmpeg', ['-hide_banner', '-i', OUT, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const maxv = +(vd.match(/max_volume: (-?[\d.]+) dB/) || [])[1];
const font = 'node_modules/@expo-google-fonts/jost/600SemiBold/Jost_600SemiBold.ttf';
const stamp = `drawtext=fontfile=${font}:text='%{pts\\:hms}':x=8:y=8:fontsize=34:fontcolor=white:box=1:boxcolor=0x4A1E26@0.75`;
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', OUT, '-vf', `fps=2,${stamp},scale=216:384,tile=10x6:padding=4:color=white`, '-frames:v', '1', 'qa/contact-sheet.jpg']);
const B = [0.0, 1.6, 2.6, 3.8, 5.2, 6.7, 8.0, 10.2, 11.7, 13.1, 15.0, 15.5, 17.0, 19.5, 22.3, 25.4, 26.4, 29.97];
const sel = B.map((t) => `eq(n\\,${Math.round(t * 30)})`).join('+');
execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', OUT, '-vf', `select='${sel}',${stamp},scale=270:480,tile=9x2:padding=4:color=white`, '-vsync', 'vfr', '-frames:v', '1', 'qa/boundaries.jpg']);
const report = {
  file: OUT, size_bytes: +j.format.size, duration_s: +j.format.duration,
  video: { codec: v.codec_name, profile: v.profile, width: v.width, height: v.height, pix_fmt: v.pix_fmt, fps: v.r_frame_rate, frames: +frames, duration_s: +v.duration },
  audio: { codec: a.codec_name, sample_rate: +a.sample_rate, channels: a.channels, duration_s: +a.duration, bit_rate: +a.bit_rate },
  loudness: { integrated_lufs: I, true_peak_dbfs: TP, max_volume_db: maxv },
  full_decode_errors: (dec.stderr || '').trim().length === 0 ? 'none' : dec.stderr.trim().split('\n').length + ' lines (see qa/decode.log)',
};
const vo = JSON.parse(fs.readFileSync('build/vo/vo.json', 'utf8'));
const { LINES } = await import('./narration.mjs');
const src = fs.readFileSync('src/scene.mjs', 'utf8');
const caps = [...src.matchAll(/\[(\d+\.?\d*), (\d+\.?\d*), \[/g)].map((m) => [+m[1], +m[2]]);
report.narration = LINES.map((l, i) => { const d = vo.lines.find((v) => v.id === l.id).duration; return { id: l.id, start: l.start, end: +(l.start + d).toFixed(2), say: l.say }; });
report.narration_overlaps = report.narration.slice(1).filter((l, i) => l.start < report.narration[i].end).map((l) => l.id);
report.cta_window_s = [report.narration.at(-1).start, report.narration.at(-1).end];
report.caption_windows = caps;
report.words = LINES.map((l) => l.say).join(' ').split(/\s+/).length;
fs.writeFileSync('qa/verify.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
