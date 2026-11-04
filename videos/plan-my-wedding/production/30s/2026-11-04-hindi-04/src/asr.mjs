// Automated "listening" check: transcribe rendered Hindi narration with a local Whisper model
// (transformers.js, ONNX, CPU) and compare it with the script (character error rate).
import { pipeline } from '@huggingface/transformers';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const [, , model = 'onnx-community/whisper-small', ...files] = process.argv;
const DT = model.includes('large') ? { encoder_model: 'q8', decoder_model_merged: 'q8' } : { encoder_model: 'fp32', decoder_model_merged: 'q8' };
const asr = await pipeline('automatic-speech-recognition', model, { dtype: DT, device: 'cpu' });
const read16k = (f) => { const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], { maxBuffer: 1 << 28 }); return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4); };
const out = {};
for (const f of files) {
  const r = await asr(read16k(f), { language: 'hindi', task: 'transcribe', chunk_length_s: 30, stride_length_s: 5 });
  out[f] = r.text.trim();
  console.log(f, '=>', out[f]);
}
if (process.env.ASR_OUT) fs.writeFileSync(process.env.ASR_OUT, JSON.stringify({ model, out }, null, 2));
