// Local narration with Kokoro-82M (Apache-2.0) via kokoro-js 1.2.1. Output: build/narration/*.wav + manifest.json
import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import fs from "node:fs";
import path from "node:path";
import { NARRATION, VOICE, PHONEME_OVERRIDES } from "./narration.js";

const OUT = path.resolve("build/narration");
fs.mkdirSync(OUT, { recursive: true });
const trim = (x, sr, th = 0.012, padMs = 25) => {
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
// internal pauses (>=50 ms) for word/phrase sync
function gaps(x, sr) {
  const win = Math.round(sr * 0.01), out = []; let st = -1;
  for (let i = 0, k = 0; i < x.length; i += win, k++) {
    let s = 0; for (let j = i; j < Math.min(x.length, i + win); j++) s += x[j] * x[j];
    const e = Math.sqrt(s / win);
    if (e < 0.01) { if (st < 0) st = k; } else { if (st >= 0 && k - st >= 5) out.push([st / 100, k / 100]); st = -1; }
  }
  return out;
}
const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
const manifest = { model: "onnx-community/Kokoro-82M-v1.0-ONNX (q8)", voice: VOICE, lines: [] };
for (const line of NARRATION) {
  let ph = "";
  const sp = new TextSplitterStream(); sp.push(line.text); sp.close();
  for await (const c of tts.stream(sp, { voice: VOICE })) ph += (ph ? " " : "") + c.phonemes;
  for (const [a, b] of Object.entries(PHONEME_OVERRIDES)) ph = ph.replaceAll(a, b);
  const { input_ids } = tts.tokenizer(ph, { truncation: true });
  const audio = await tts.generate_from_ids(input_ids, { voice: VOICE });
  const x = trim(audio.audio, audio.sampling_rate);
  const file = path.join(OUT, `${line.id}.wav`);
  wav16(file, x, audio.sampling_rate);
  const dur = x.length / audio.sampling_rate;
  const g = gaps(x, audio.sampling_rate);
  manifest.lines.push({ ...line, phonemes: ph, duration: +dur.toFixed(3), end: +(line.start + dur).toFixed(3), gaps: g, file: path.relative(process.cwd(), file) });
  console.log(`${line.id} ${line.start.toFixed(2)}s +${dur.toFixed(2)}s gaps=${JSON.stringify(g)} "${line.text}"`);
}
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
