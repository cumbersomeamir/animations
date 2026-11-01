// Local narration: kokoro-js 1.2.1 (Apache-2.0) + Kokoro-82M ONNX weights (Apache-2.0), CPU only.
import { KokoroTTS } from 'kokoro-js';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { LINES, VOICE } from './narration.mjs';

const OUT = path.resolve('build/vo');
fs.mkdirSync(OUT, { recursive: true });
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });
const meta = [];
for (const line of LINES) {
  const audio = await tts.generate(line.text, { voice: VOICE, speed: line.speed ?? 1 });
  const sr = audio.sampling_rate, x = audio.audio;
  let a = 0, b = x.length - 1;
  while (a < x.length && Math.abs(x[a]) < 0.008) a++;
  while (b > a && Math.abs(x[b]) < 0.008) b--;
  a = Math.max(0, a - Math.round(0.03 * sr)); b = Math.min(x.length, b + Math.round(0.08 * sr));
  audio.audio = x.slice(a, b);
  const raw = path.join(OUT, `${line.id}_24k.wav`);
  await audio.save(raw);
  const out = path.join(OUT, `${line.id}.wav`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_f32le', out]);
  const dur = audio.audio.length / sr, slot = line.slotEnd - line.start;
  meta.push({ ...line, file: path.relative('.', out), duration: +dur.toFixed(3), fits: dur <= slot });
  console.log(`${line.id} ${dur.toFixed(2)}s / slot ${slot.toFixed(2)}s ${dur <= slot ? 'OK' : 'OVER'} "${line.text}"`);
}
fs.writeFileSync(path.join(OUT, 'vo.json'), JSON.stringify({ voice: VOICE, model: 'onnx-community/Kokoro-82M-v1.0-ONNX (fp32)', lines: meta }, null, 2));
