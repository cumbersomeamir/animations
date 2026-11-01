// QA helper: transcribes each narration line with local Whisper (transformers.js, MIT-licensed weights)
// to (a) verify intelligibility vs the script and (b) obtain word timestamps for caption/action sync.
// Output: build/narration/words.json
import { pipeline } from "@huggingface/transformers";
import fs from "node:fs";

const m = JSON.parse(fs.readFileSync("build/narration/manifest.json"));
const asr = await pipeline("automatic-speech-recognition", "onnx-community/whisper-small.en_timestamped", { dtype: "fp32" });

function readWav16(file) {
  const b = fs.readFileSync(file);
  const sr = b.readUInt32LE(24);
  const n = (b.length - 44) / 2;
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = b.readInt16LE(44 + i * 2) / 32768;
  return { x, sr };
}
function resample(x, from, to) {
  const n = Math.floor((x.length * to) / from);
  const y = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = (i * from) / to, i0 = Math.floor(t), fr = t - i0;
    y[i] = (x[i0] ?? 0) * (1 - fr) + (x[i0 + 1] ?? 0) * fr;
  }
  return y;
}
const norm = (s) => s.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();

const out = [];
for (const l of m.lines) {
  const { x, sr } = readWav16(l.file);
  const pad = new Float32Array(16000 * 0.3);
  const y16 = resample(x, sr, 16000);
  const y = new Float32Array(pad.length + y16.length + pad.length);
  y.set(y16, pad.length);
  const r = await asr(y, { return_timestamps: "word" });
  const words = (r.chunks || []).map((c) => ({ w: c.text.trim(), t0: +(c.timestamp[0] - 0.3).toFixed(2), t1: +((c.timestamp[1] ?? c.timestamp[0]) - 0.3).toFixed(2) }));
  const a = norm(l.text).split(" "), b = norm(r.text).split(" ");
  const hits = a.filter((w) => b.includes(w)).length;
  out.push({ id: l.id, script: l.text, heard: r.text.trim(), wordMatch: `${hits}/${a.length}`, words });
  console.log(`${l.id} [${hits}/${a.length}] heard: "${r.text.trim()}"`);
  console.log("    " + words.map((w) => `${w.w}@${w.t0}`).join("  "));
}
fs.writeFileSync("build/narration/words.json", JSON.stringify(out, null, 2));
