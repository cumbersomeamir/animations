// QA: frame 0 + frames around every shot change, decoded from the exported MP4 (not the renderer).
// usage: node transitions.mjs <final.mp4> <out.png>
import { execFileSync } from 'node:child_process';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CUES } from './scene.mjs';
const [mp4, out] = process.argv.slice(2);
const times = [0];
for (const s of CUES.scenes.slice(1)) if (s < 30) times.push(+(s - 0.2).toFixed(2), +(s + 0.15).toFixed(2), +(s + 0.6).toFixed(2));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tr-'));
const tw = 216, th = 384, cols = 7, rows = Math.ceil(times.length / cols);
const sheet = createCanvas(cols * (tw + 6) + 6, rows * (th + 26) + 6), g = sheet.getContext('2d');
g.fillStyle = '#222'; g.fillRect(0, 0, sheet.width, sheet.height);
for (let i = 0; i < times.length; i++) {
  const f = path.join(dir, `${i}.png`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', mp4, '-vf', `select=eq(n\\,${Math.min(899, Math.round(times[i] * 30))}),scale=${tw}:${th}`, '-frames:v', '1', f]);
  const im = await loadImage(fs.readFileSync(f));
  const x = 6 + (i % cols) * (tw + 6), y = 6 + Math.floor(i / cols) * (th + 26);
  g.drawImage(im, x, y); g.fillStyle = '#fff'; g.font = '16px sans-serif'; g.fillText(`${times[i].toFixed(2)} s`, x + 4, y + th + 18);
}
fs.writeFileSync(out, sheet.toBuffer('image/png'));
console.log('wrote', out, times.length, 'frames');
