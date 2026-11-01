// Generates narration lines locally with Kokoro-82M (Apache-2.0 open weights) via kokoro-js.
// Output: build/narration/<id>.wav (mono float->16bit, 24 kHz, silence-trimmed) + build/narration/manifest.json
import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import fs from "node:fs";
import path from "node:path";
import { NARRATION, VOICE, PHONEME_OVERRIDES } from "./narration.mjs";

const OUT = path.resolve("build/narration");
fs.mkdirSync(OUT, { recursive: true });

function trim(samples, sr, thresh = 0.012, padMs = 25) {
  let a = 0, b = samples.length - 1;
  while (a < samples.length && Math.abs(samples[a]) < thresh) a++;
  while (b > a && Math.abs(samples[b]) < thresh) b--;
  const pad = Math.round((padMs / 1000) * sr);
  a = Math.max(0, a - pad);
  b = Math.min(samples.length - 1, b + pad);
  return samples.slice(a, b + 1);
}

function writeWav16(file, samples, sr) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(file, buf);
}

const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
const manifest = { model: "onnx-community/Kokoro-82M-v1.0-ONNX (q8)", voice: VOICE, lines: [] };
for (const line of NARRATION) {
  // Phonemize with Kokoro's own G2P, then apply brand-name pronunciation overrides before synthesis.
  let phonemes = "";
  const sp = new TextSplitterStream(); sp.push(line.text); sp.close();
  for await (const chunk of tts.stream(sp, { voice: VOICE })) phonemes += (phonemes ? " " : "") + chunk.phonemes;
  for (const [from, to] of Object.entries(PHONEME_OVERRIDES)) phonemes = phonemes.replaceAll(from, to);
  const { input_ids } = tts.tokenizer(phonemes, { truncation: true });
  const audio = await tts.generate_from_ids(input_ids, { voice: VOICE, speed: line.speed ?? 1.0 });
  const sr = audio.sampling_rate;
  const trimmed = trim(audio.audio, sr);
  const file = path.join(OUT, `${line.id}.wav`);
  writeWav16(file, trimmed, sr);
  const dur = trimmed.length / sr;
  manifest.lines.push({ id: line.id, text: line.text, phonemes, start: line.start, duration: +dur.toFixed(3), end: +(line.start + dur).toFixed(3), sr, file: path.relative(process.cwd(), file) });
  console.log(`${line.id}  ${line.start.toFixed(2)}s  +${dur.toFixed(2)}s  "${line.text}"`);
}
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log("wrote", path.join(OUT, "manifest.json"));
