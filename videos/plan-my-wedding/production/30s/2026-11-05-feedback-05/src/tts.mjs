// Hindi narration with Kokoro-82M (Apache-2.0) via kokoro-js 1.2.1, CPU, cached weights.
// Kokoro v1.0 ships Hindi voices (hf_alpha, hf_beta, hm_omega, hm_psi) in node_modules/kokoro-js/voices.
// Phonemes come from src/g2p.py (misaki EspeakG2P 'hi', Kokoro's own Hindi G2P) because the bundled
// JS phonemizer only contains English data. Voice mixes are blended style vectors (no cloning).
//   node src/tts.mjs [variant]   variant: name of a "mix" in VARIANTS below (default from narration.json)
import { KokoroTTS } from 'kokoro-js';
import { Tensor } from '@huggingface/transformers';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const cfg = JSON.parse(fs.readFileSync('src/narration.json', 'utf8'));
const VARIANTS = {
  final: cfg.voice.mix,
  hf_alpha: [['hf_alpha', 1]],
  hf_beta: [['hf_beta', 1]],
  alpha_omega: [['hf_alpha', 0.7], ['hm_omega', 0.3]],
};
const variant = process.argv[2] || 'final';
const mixList = VARIANTS[variant];
const speed = cfg.voice.speed;
const ph = JSON.parse(fs.readFileSync('build/vo/phonemes.json', 'utf8'));
const OUT = path.resolve(variant === 'final' ? 'build/vo' : `build/vo/${variant}`);
fs.mkdirSync(OUT, { recursive: true });

const load = (id) => { const b = fs.readFileSync(`node_modules/kokoro-js/voices/${id}.bin`); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const blend = new Float32Array(load(mixList[0][0]).length);
for (const [id, w] of mixList) { const v = load(id); for (let i = 0; i < blend.length; i++) blend[i] += v[i] * w; }

const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' });
const vocab = JSON.parse(fs.readFileSync('node_modules/@huggingface/transformers/.cache/onnx-community/Kokoro-82M-v1.0-ONNX/tokenizer.json', 'utf8')).model.vocab;
const model = tts.model;
tts.model = (inputs) => {
  const n = inputs.input_ids.dims.at(-1);
  const off = 256 * Math.min(Math.max(n - 2, 0), 509);
  return model({ ...inputs, style: new Tensor('float32', blend.slice(off, off + 256), [1, 256]) });
};
const meta = [];
for (const line of cfg.lines) {
  const p = ph.find((x) => x.id === line.id).phonemes;
  const missing = [...new Set([...p].filter((ch) => !(ch in vocab)))]; // must be empty: unknown IPA would be dropped silently
  const { input_ids } = tts.tokenizer(p, { truncation: true });
  const audio = await tts.generate_from_ids(input_ids, { voice: mixList[0][0], speed: line.speed ?? speed }); // number lines slower for clarity
  const sr = audio.sampling_rate, x = audio.audio;
  let a = 0, b = x.length - 1;
  while (a < x.length && Math.abs(x[a]) < 0.008) a++;
  while (b > a && Math.abs(x[b]) < 0.008) b--;
  a = Math.max(0, a - Math.round(0.03 * sr)); b = Math.min(x.length, b + Math.round(0.08 * sr));
  audio.audio = x.slice(a, b);
  const win = Math.round(0.01 * sr), env = [];
  for (let i = 0; i + win <= audio.audio.length; i += win) { let m = 0; for (let j = i; j < i + win; j++) m = Math.max(m, Math.abs(audio.audio[j])); env.push(m); }
  const onsets = [0]; let quiet = 0;
  env.forEach((m, k) => { if (m < 0.01) quiet++; else { if (quiet >= 7 && k > 0) onsets.push(+(k * 0.01).toFixed(2)); quiet = 0; } });
  const raw = path.join(OUT, `${line.id}_24k.wav`);
  await audio.save(raw);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', raw, '-ar', '48000', '-ac', '1', '-c:a', 'pcm_f32le', path.join(OUT, `${line.id}.wav`)]);
  const dur = audio.audio.length / sr;
  meta.push({ id: line.id, duration: +dur.toFixed(3), onsets, missing });
  console.log(`${variant} ${line.id} ${dur.toFixed(2)}s onsets ${onsets.join(',')}${missing.length ? ' MISSING ' + missing.join('') : ''}`);
}
fs.writeFileSync(path.join(OUT, 'vo.json'), JSON.stringify({ variant, mix: mixList, speed, lines: meta }, null, 2));
// concatenated preview for the ASR check
const list = cfg.lines.map((l) => `file '${path.join(OUT, l.id + '_24k.wav')}'`).join('\n');
fs.writeFileSync(path.join(OUT, 'concat.txt'), list);
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, 'concat.txt'), '-af', 'apad=pad_dur=0.3', '-ar', '16000', path.join(OUT, 'all.wav')]);
