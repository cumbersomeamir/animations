// Hindi intelligibility check ("listening" by ASR): multilingual Whisper large-v3-turbo (onnx-community, MIT) via
// transformers.js, language=hindi, task=transcribe. Compares the transcript with the script (Devanagari, normalised).
// Usage: node src/asr_hi.mjs <dir-with-L*.wav | file.mp4> [--words] [--out qa/asr-hi.json]
import { pipeline } from "@huggingface/transformers";
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
import { NARRATION } from "./narration.js";
const args = process.argv.slice(2), src = args[0], opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const MODEL = "onnx-community/whisper-large-v3-turbo";
const asr = await pipeline("automatic-speech-recognition", MODEL, { dtype: { encoder_model: "q4", decoder_model_merged: "q4" }, device: "cpu" });
const load = (f, a = 0, b = null) => { const o = ["-loglevel", "error", "-i", f]; if (b !== null) o.push("-ss", String(a), "-to", String(b)); const raw = execFileSync("ffmpeg", [...o, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 }); return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4); };
const norm = (s) => s.replace(/[‘’“”"'.,।?!:;—\-]/g, " ").replace(/़/g, "").replace(/\s+/g, " ").trim(); // drop nukta for fair matching
const out = [];
const man = fs.existsSync(path.join(src, "manifest.json")) ? JSON.parse(fs.readFileSync(path.join(src, "manifest.json"))) : null;
for (const l of NARRATION) {
  let x;
  if (man) { const e = man.lines.find((m) => m.id === l.id); if (!e) continue; x = load(path.join(src, `${l.id}.wav`)); }
  else { const e = JSON.parse(fs.readFileSync("build/narration/manifest.json")).lines.find((m) => m.id === l.id); x = load(src, Math.max(0, e.start - 0.15), e.end + 0.3); }
  const r = await asr(x, { language: "hindi", task: "transcribe" });
  const want = norm(l.text).split(" "), got = norm(r.text).split(" "), hits = want.filter((w) => got.includes(w)).length;
  out.push({ id: l.id, script: l.text, heard: r.text.trim(), words: `${hits}/${want.length}` });
  console.log(`${l.id} [${hits}/${want.length}] ${r.text.trim()}`);
}
const tot = out.reduce((a, o) => [a[0] + +o.words.split("/")[0], a[1] + +o.words.split("/")[1]], [0, 0]);
console.log(`TOTAL ${tot[0]}/${tot[1]}`);
const of = opt("--out", null); if (of) { fs.mkdirSync(path.dirname(of), { recursive: true }); fs.writeFileSync(of, JSON.stringify({ model: MODEL, lines: out, total: `${tot[0]}/${tot[1]}` }, null, 2)); }
