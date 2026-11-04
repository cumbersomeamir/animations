// Hindi narration with Kokoro-82M v1.0 (Apache-2.0) Hindi voice packs via the kokoro-js 1.2.1 model wrapper.
// G2P: eSpeak NG (`espeak-ng -v hi --ipa --tie=^`, Ubuntu package espeak-ng 1.51) + misaki EspeakG2P post-processing
// (E2M tie mapping, stress kept, ties/hyphens removed), clause by clause so punctuation pauses survive.
// Usage: node src/tts_hi.mjs [--voice hf_alpha:1] [--out build/narration] [--only L1,L2]
import { KokoroTTS } from "kokoro-js";
import { Tensor, env } from "@huggingface/transformers";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { NARRATION, VOICE_BLEND, SPEED, SPOKEN } from "./narration.js";

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const blendSpec = opt("--voice", null) ? opt("--voice").split(",").map((s) => { const [n, w] = s.split(":"); return [n, +(w || 1)]; }) : VOICE_BLEND;
const OUT = path.resolve(opt("--out", "build/narration")); fs.mkdirSync(OUT, { recursive: true });
const only = opt("--only", null)?.split(",");
const require = createRequire(import.meta.url);
const VOICES = path.join(path.dirname(require.resolve("kokoro-js")), "../voices");
const PILOT_CACHE = path.resolve("../../../education/pilot-01/node_modules/@huggingface/transformers/.cache");
if (fs.existsSync(path.join(PILOT_CACHE, "onnx-community/Kokoro-82M-v1.0-ONNX"))) env.cacheDir = PILOT_CACHE;

const vec = (name) => { const b = fs.readFileSync(path.join(VOICES, `${name}.bin`)); return new Float32Array(b.buffer, b.byteOffset, b.length / 4); };
const parts = blendSpec.map(([n, w]) => [vec(n), w]), wsum = blendSpec.reduce((a, [, w]) => a + w, 0);
const blend = new Float32Array(parts[0][0].length); for (const [v, w] of parts) for (let i = 0; i < blend.length; i++) blend[i] += (v[i] * w) / wsum;

const E2M = [["a^ɪ", "I"], ["a^ʊ", "W"], ["d^z", "ʣ"], ["d^ʒ", "ʤ"], ["e^ɪ", "A"], ["o^ʊ", "O"], ["ə^ʊ", "Q"], ["s^s", "S"], ["t^s", "ʦ"], ["t^ʃ", "ʧ"], ["ɔ^ɪ", "Y"]].sort((a, b) => (a[0] < b[0] ? -1 : 1));
function espeak(clause) { const r = spawnSync("espeak-ng", ["-v", "hi", "-q", "--ipa", "--tie=^", clause], { encoding: "utf8" }); if (r.status !== 0) throw new Error(r.stderr); return r.stdout.replace(/\s+/g, " ").trim(); }
export function g2p(text) {
  let t = text; for (const [a, b] of Object.entries(SPOKEN)) t = t.replaceAll(a, b);
  t = t.replace(/[‘’“”"']/g, "").replace(/—/g, ",");
  const out = []; // clause-wise so the punctuation Kokoro was trained on is kept
  for (const m of t.matchAll(/([^,।?!:;.]+)([,।?!:;.]?)/g)) { const body = m[1].trim(); if (!body) continue; let ps = espeak(body); for (const [a, b] of E2M) ps = ps.replaceAll(a, b); ps = ps.replaceAll("^", "").replaceAll("-", ""); out.push(ps + ({ "।": ".", "": "" }[m[2]] ?? m[2])); }
  return out.join(" ");
}
const trim = (x, sr, th = 0.012, padMs = 30) => { let a = 0, b = x.length - 1; while (a < x.length && Math.abs(x[a]) < th) a++; while (b > a && Math.abs(x[b]) < th) b--; const p = Math.round((padMs / 1000) * sr); return x.slice(Math.max(0, a - p), Math.min(x.length, b + p + 1)); };
function wav16(file, x, sr) { const n = x.length, buf = Buffer.alloc(44 + n * 2); buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40); for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i])) * 32767), 44 + i * 2); fs.writeFileSync(file, buf); }
function analyse(x, sr) { const win = Math.round(sr * 0.01), env = [], gaps = []; let st = -1; for (let i = 0, k = 0; i < x.length; i += win, k++) { let s = 0; for (let j = i; j < Math.min(x.length, i + win); j++) s += x[j] * x[j]; const e = Math.sqrt(s / win); env.push(+e.toFixed(4)); if (e < 0.01) { if (st < 0) st = k; } else { if (st >= 0 && k - st >= 6) gaps.push([st / 100, k / 100]); st = -1; } } return { env, gaps }; }

const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
const manifest = { model: "onnx-community/Kokoro-82M-v1.0-ONNX (q8)", g2p: "espeak-ng 1.51 -v hi --ipa --tie=^ + misaki EspeakG2P mapping", voice_blend: blendSpec, speed: SPEED, lines: [] };
for (const line of NARRATION) {
  if (only && !only.includes(line.id)) continue;
  const ph = g2p(line.text);
  const { input_ids } = tts.tokenizer(ph, { truncation: true });
  const off = 256 * Math.min(Math.max(input_ids.dims.at(-1) - 2, 0), 509);
  const { waveform } = await tts.model({ input_ids, style: new Tensor("float32", blend.slice(off, off + 256), [1, 256]), speed: new Tensor("float32", [SPEED], [1]) });
  const sr = 24000, x = trim(waveform.data, sr), file = path.join(OUT, `${line.id}.wav`);
  wav16(file, x, sr);
  const { env: en, gaps } = analyse(x, sr), dur = x.length / sr;
  manifest.lines.push({ id: line.id, start: line.start, text: line.text, phonemes: ph, tokens: input_ids.dims.at(-1), duration: +dur.toFixed(3), end: +(line.start + dur).toFixed(3), gaps, env: en, file: path.relative(process.cwd(), file) });
  console.log(`${line.id} ${line.start.toFixed(2)}→${(line.start + dur).toFixed(2)}s (${dur.toFixed(2)}s) "${line.text}"  /${ph}/`);
}
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest));
