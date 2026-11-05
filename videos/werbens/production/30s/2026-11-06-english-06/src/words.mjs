// Word timing + intelligibility check for each narration line (local Whisper base.en, transformers.js).
// Writes src/words.json (committed; the scene reads it for word-timed captions and lip-sync accents).
import { pipeline, env } from "@huggingface/transformers";
import path from "node:path";
import fs from "node:fs";

const MODEL = "onnx-community/whisper-base.en_timestamped";
// reuse the Whisper weights cached by education/pilot-01 (no re-download) when present
const PILOT_CACHE = path.resolve("../../../education/pilot-01/node_modules/@huggingface/transformers/.cache");
if (fs.existsSync(path.join(PILOT_CACHE, "onnx-community/whisper-base.en_timestamped"))) env.cacheDir = PILOT_CACHE;
const m = JSON.parse(fs.readFileSync("build/narration/manifest.json"));
const asr = await pipeline("automatic-speech-recognition", MODEL, { dtype: "fp32" });
function readWav16(file) {
  const b = fs.readFileSync(file), sr = b.readUInt32LE(24), n = (b.length - 44) / 2, x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = b.readInt16LE(44 + i * 2) / 32768;
  return { x, sr };
}
function resample(x, from, to) {
  const n = Math.floor((x.length * to) / from), y = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = (i * from) / to, i0 = Math.floor(t), fr = t - i0; y[i] = (x[i0] ?? 0) * (1 - fr) + (x[i0 + 1] ?? 0) * fr; }
  return y;
}
const norm = (s) => s.toLowerCase().replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ").trim();
const out = { model: MODEL, lines: [] };
for (const l of m.lines) {
  const { x, sr } = readWav16(l.file);
  const PAD = 0.3, pad = new Float32Array(16000 * PAD), y16 = resample(x, sr, 16000);
  const y = new Float32Array(pad.length * 2 + y16.length); y.set(y16, pad.length);
  const r = await asr(y, { return_timestamps: "word" });
  // Whisper's cross-attention word times drift early around leading silence, so map its [first.t0, last.t1] span linearly
  // onto the measured speech onset/offset of the trimmed clip (30 ms pad each side) — keeps relative word spacing.
  const raw = (r.chunks || []).map((c) => ({ w: c.text.trim(), a: c.timestamp[0], b: c.timestamp[1] ?? c.timestamp[0] }));
  // piecewise-linear anchors: line onset/offset + each measured pause ≥ 0.2 s matched, IN ORDER, to the Whisper word boundary
  // nearest its expected position (linear map), accepted only within 0.4 s → anchors stay monotonic
  const A = raw[0].a, B = raw.at(-1).b, on = l.start + 0.03, off = l.end - 0.03;
  const lin = (t) => on + ((t - A) / Math.max(1e-3, B - A)) * (off - on);
  const anchors = [[A, on]];
  let last = -1;
  for (const [g0, g1] of l.gaps.filter(([a, b]) => b - a >= 0.2)) {
    const gc = l.start + (g0 + g1) / 2;
    let best = -1, bd = 0.4;
    for (let i = last + 1; i < raw.length - 1; i++) { const d = Math.abs(lin((raw[i].b + raw[i + 1].a) / 2) - gc); if (d < bd) { bd = d; best = i; } }
    if (best >= 0) { anchors.push([raw[best].b, l.start + g0], [raw[best + 1].a, l.start + g1]); last = best; }
  }
  anchors.push([B, off]);
  const map = (t) => { for (let i = 0; i < anchors.length - 1; i++) { const [x0, y0] = anchors[i], [x1, y1] = anchors[i + 1]; if (t <= x1 || i === anchors.length - 2) return y0 + ((t - x0) / Math.max(1e-3, x1 - x0)) * (y1 - y0); } };
  const words = raw.map((c) => ({ w: c.w, t0: +map(c.a).toFixed(3), t1: +map(c.b).toFixed(3) }));
  const a = norm(l.text).split(" "), b = norm(r.text).split(" ");
  const hits = a.filter((w) => b.includes(w)).length;
  out.lines.push({ id: l.id, start: l.start, end: l.end, script: l.text, heard: r.text.trim(), wordMatch: `${hits}/${a.length}`, words, env: l.env.map((v) => +v.toFixed(3)) }); // env: 100 Hz RMS for lip-sync
  console.log(`${l.id} [${hits}/${a.length}] heard: "${r.text.trim()}"\n    ` + words.map((w) => `${w.w}@${w.t0.toFixed(2)}-${w.t1.toFixed(2)}`).join("  "));
}
fs.writeFileSync("src/words.json", JSON.stringify(out, null, 1));
