// Local narration with Kokoro-82M (Apache-2.0) via kokoro-js 1.2.1 → build/narration/*.wav + manifest.json
// The host voice is an original blend of two bundled Kokoro style vectors (see narration.js); the blend is applied by
// calling the model with our own style tensor (same maths as kokoro-js generate_from_ids, which only supports one voice).
import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import { Tensor, env } from "@huggingface/transformers";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { NARRATION, VOICE_BLEND, SPEED, LANG_VOICE, PHONEME_OVERRIDES } from "./narration.js";

const require = createRequire(import.meta.url);
const VOICES = path.join(path.dirname(require.resolve("kokoro-js")), "../voices");
// Reuse the Kokoro weights already cached by education/pilot-01 (no re-download) when present.
const PILOT_CACHE = path.resolve("../../../education/pilot-01/node_modules/@huggingface/transformers/.cache");
if (fs.existsSync(path.join(PILOT_CACHE, "onnx-community/Kokoro-82M-v1.0-ONNX"))) env.cacheDir = PILOT_CACHE;
const OUT = path.resolve("build/narration");
fs.mkdirSync(OUT, { recursive: true });

const vec = (name) => { const b = fs.readFileSync(path.join(VOICES, `${name}.bin`)); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const parts = VOICE_BLEND.map(([n, w]) => [vec(n), w]);
const blend = new Float32Array(parts[0][0].length);
for (const [v, w] of parts) for (let i = 0; i < blend.length; i++) blend[i] += v[i] * w;

const trim = (x, sr, th = 0.012, padMs = 30) => {
  let a = 0, b = x.length - 1;
  while (a < x.length && Math.abs(x[a]) < th) a++;
  while (b > a && Math.abs(x[b]) < th) b--;
  const p = Math.round((padMs / 1000) * sr);
  return x.slice(Math.max(0, a - p), Math.min(x.length, b + p + 1));
};
function wav16(file, x, sr) {
  const n = x.length, buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i])) * 32767), 44 + i * 2);
  fs.writeFileSync(file, buf);
}
// RMS envelope at 100 Hz (for lip-sync in the scene) + internal pauses ≥ 60 ms
function analyse(x, sr) {
  const win = Math.round(sr * 0.01), env = [], gaps = []; let st = -1;
  for (let i = 0, k = 0; i < x.length; i += win, k++) {
    let s = 0; for (let j = i; j < Math.min(x.length, i + win); j++) s += x[j] * x[j];
    const e = Math.sqrt(s / win); env.push(+e.toFixed(4));
    if (e < 0.01) { if (st < 0) st = k; } else { if (st >= 0 && k - st >= 6) gaps.push([st / 100, k / 100]); st = -1; }
  }
  return { env, gaps };
}

const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
const manifest = { model: "onnx-community/Kokoro-82M-v1.0-ONNX (q8)", voice_blend: VOICE_BLEND, speed: SPEED, lines: [] };
for (const line of NARRATION) {
  let ph = "";
  const sp = new TextSplitterStream(); sp.push(line.text); sp.close();
  for await (const c of tts.stream(sp, { voice: LANG_VOICE })) ph += (ph ? " " : "") + c.phonemes; // G2P only (audio discarded)
  for (const [from, to] of Object.entries(PHONEME_OVERRIDES)) ph = ph.replaceAll(from, to);
  const { input_ids } = tts.tokenizer(ph, { truncation: true });
  const off = 256 * Math.min(Math.max(input_ids.dims.at(-1) - 2, 0), 509);
  const { waveform } = await tts.model({ input_ids, style: new Tensor("float32", blend.slice(off, off + 256), [1, 256]), speed: new Tensor("float32", [SPEED], [1]) });
  const sr = 24000;
  const x = trim(waveform.data, sr);
  const file = path.join(OUT, `${line.id}.wav`);
  wav16(file, x, sr);
  const dur = x.length / sr;
  const { env, gaps } = analyse(x, sr);
  manifest.lines.push({ ...line, phonemes: ph, duration: +dur.toFixed(3), end: +(line.start + dur).toFixed(3), gaps, env, file: path.relative(process.cwd(), file) });
  console.log(`${line.id} ${line.start.toFixed(2)}→${(line.start + dur).toFixed(2)}s (${dur.toFixed(2)}s) gaps=${JSON.stringify(gaps)} "${line.text}"  /${ph}/`);
}
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest));
