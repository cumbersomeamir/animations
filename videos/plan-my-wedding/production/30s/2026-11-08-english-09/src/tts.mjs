// Local narration: kokoro-js 1.2.1 + Kokoro-82M ONNX (Apache-2.0), CPU, cached weights.
// Voice = 0.7 af_bella + 0.3 am_puck style vectors (both bundled in node_modules/kokoro-js/voices),
// American English phonemes ('a'), speed 0.98. The blend is applied by swapping the style tensor
// passed to the ONNX model; nothing in node_modules is modified.
import { KokoroTTS } from 'kokoro-js';
import { Tensor } from '@huggingface/transformers';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { LINES, VOICE } from './narration.mjs';

const OUT = path.resolve('build/vo');
fs.mkdirSync(OUT, { recursive: true });
const load = (id) => { const b = fs.readFileSync(`node_modules/kokoro-js/voices/${id}.bin`); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const parts = VOICE.mix.map(([id, w]) => [load(id), w]);
const blend = new Float32Array(parts[0][0].length);
for (const [v, w] of parts) for (let i = 0; i < blend.length; i++) blend[i] += v[i] * w;

const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });
const model = tts.model;
tts.model = (inputs) => {
  const n = inputs.input_ids.dims.at(-1);
  const off = 256 * Math.min(Math.max(n - 2, 0), 509);
  return model({ ...inputs, style: new Tensor('float32', blend.slice(off, off + 256), [1, 256]) });
};
const meta = [];
for (const line of LINES) {
  // voice id 'af_bella' selects American-English phonemization; its style is replaced by the blend above
  const audio = await tts.generate(line.say, { voice: 'af_bella', speed: VOICE.speed });
  const sr = audio.sampling_rate, x = audio.audio;
  let a = 0, b = x.length - 1;
  while (a < x.length && Math.abs(x[a]) < 0.008) a++;
  while (b > a && Math.abs(x[b]) < 0.008) b--;
  a = Math.max(0, a - Math.round(0.03 * sr)); b = Math.min(x.length, b + Math.round(0.08 * sr));
  audio.audio = x.slice(a, b);
  // phrase onsets after pauses >= 70 ms (used to sync each listed item to its word)
  const win = Math.round(0.01 * sr), env = [];
  for (let i = 0; i + win <= audio.audio.length; i += win) { let m = 0; for (let j = i; j < i + win; j++) m = Math.max(m, Math.abs(audio.audio[j])); env.push(m); }
  const onsets = [0]; let quiet = 0;
  env.forEach((m, k) => { if (m < 0.01) quiet++; else { if (quiet >= 7 && k > 0) onsets.push(+(k * 0.01).toFixed(2)); quiet = 0; } });
  const raw = path.join(OUT, `${line.id}_24k.wav`);
  await audio.save(raw);
  const out = path.join(OUT, `${line.id}.wav`);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_f32le', out]);
  const dur = audio.audio.length / sr;
  meta.push({ ...line, duration: +dur.toFixed(3), end: +(line.start + dur).toFixed(3), onsets });
  console.log(`${line.id} ${line.start.toFixed(2)}-${(line.start + dur).toFixed(2)} (${dur.toFixed(2)}s) onsets ${onsets.join(',')}  "${line.say}"`);
}
fs.writeFileSync(path.join(OUT, 'vo.json'), JSON.stringify({ voice: VOICE, model: 'onnx-community/Kokoro-82M-v1.0-ONNX (fp32)', lines: meta }, null, 2));
