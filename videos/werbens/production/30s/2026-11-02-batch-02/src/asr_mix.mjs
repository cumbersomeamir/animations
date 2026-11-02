// QA: is each narration line intelligible inside the FINAL mix (music + SFX on top)? Local Whisper base.en.
// Output: qa/asr-mix.json
import fs from "node:fs";
import { pipeline, env } from "@huggingface/transformers";
import path from "node:path";
const PILOT_CACHE = path.resolve("../../../education/pilot-01/node_modules/@huggingface/transformers/.cache");
if (fs.existsSync(path.join(PILOT_CACHE, "onnx-community/whisper-base.en_timestamped"))) env.cacheDir = PILOT_CACHE;
import { execFileSync } from "node:child_process";
const mp4 = process.argv[2] || "werbens-30s-production-02.mp4";
const raw = execFileSync("ffmpeg", ["-loglevel", "error", "-i", mp4, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
const W = JSON.parse(fs.readFileSync("src/words.json", "utf8"));
const asr = await pipeline("automatic-speech-recognition", "onnx-community/whisper-base.en_timestamped", { dtype: "fp32" });
const norm = (s) => s.toLowerCase().replace(/[^a-z' ]/g, " ").replace(/\s+/g, " ").trim();
const out = [];
for (const l of W.lines) {
  const a = Math.max(0, Math.floor((l.start - 0.15) * 16000)), b = Math.min(x.length, Math.ceil((l.end + 0.3) * 16000));
  const r = await asr(x.slice(a, b));
  const want = norm(l.script).split(" "), got = norm(r.text).split(" ");
  const hits = want.filter((w) => got.includes(w)).length;
  out.push({ id: l.id, window_s: [+(a / 16000).toFixed(2), +(b / 16000).toFixed(2)], script: l.script, heard: r.text.trim(), words: `${hits}/${want.length}` });
  console.log(`${l.id} [${hits}/${want.length}] "${r.text.trim()}"`);
}
// whole-mix transcript as a second check
const full = await asr(x, { chunk_length_s: 30 });
console.log("FULL:", full.text.trim());
fs.mkdirSync("qa", { recursive: true });
fs.writeFileSync("qa/asr-mix.json", JSON.stringify({ model: "onnx-community/whisper-base.en_timestamped", lines: out, full: full.text.trim() }, null, 2));
