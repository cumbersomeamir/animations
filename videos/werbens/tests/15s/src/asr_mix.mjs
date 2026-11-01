// QA: is each narration line intelligible inside the FINAL mix (music + SFX on top)? Local Whisper small.en.
// Reuses weights already cached by the paused 30 s project (no new download). Output: qa/asr-mix.json
import { pipeline, env } from "@huggingface/transformers";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
env.cacheDir = path.resolve("../../project/node_modules/@huggingface/transformers/.cache");
const mp4 = process.argv[2] || "werbens-15s-test.mp4";
const raw = execFileSync("ffmpeg", ["-loglevel", "error", "-i", mp4, "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
const man = JSON.parse(fs.readFileSync("build/narration/manifest.json", "utf8"));
const asr = await pipeline("automatic-speech-recognition", "onnx-community/whisper-small.en_timestamped", { dtype: "fp32" });
const norm = (s) => s.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
const out = [];
for (const l of man.lines) {
  const a = Math.max(0, Math.floor((l.start - 0.15) * 16000)), b = Math.min(x.length, Math.ceil((l.end + 0.35) * 16000));
  const r = await asr(x.slice(a, b));
  const want = norm(l.text).split(" "), got = norm(r.text).split(" ");
  const hits = want.filter((w) => got.includes(w)).length;
  out.push({ id: l.id, window: [+(a / 16000).toFixed(2), +(b / 16000).toFixed(2)], script: l.text, heard: r.text.trim(), words: `${hits}/${want.length}` });
  console.log(`${l.id} [${hits}/${want.length}] "${r.text.trim()}"`);
}
fs.mkdirSync("qa", { recursive: true });
fs.writeFileSync("qa/asr-mix.json", JSON.stringify(out, null, 2));
