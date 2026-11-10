// Renders frames with @napi-rs/canvas and pipes raw RGBA into FFmpeg (lossless intermediate).
//   node src/render.mjs                    full render, 4 parallel chunks -> build/video_lossless.mkv
//   node src/render.mjs --frames 0,30,60   PNG stills -> build/frames/
import { createCanvas } from '@napi-rs/canvas';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { W, H, FPS, DURATION } from './lib.mjs';
import { drawFrame, init } from './scene.mjs';

const args = process.argv.slice(2);
const arg = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const TOTAL = Math.round(FPS * DURATION); // 450
fs.mkdirSync('build/frames', { recursive: true });
await init();
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

if (arg('--frames')) {
  const dir = arg('--dir') || 'build/frames';
  fs.mkdirSync(dir, { recursive: true });
  for (const f of arg('--frames').split(',').map(Number)) {
    drawFrame(ctx, f / FPS);
    const out = path.join(dir, `f${String(f).padStart(4, '0')}.png`);
    fs.writeFileSync(out, canvas.toBuffer('image/png'));
    console.log(out);
  }
} else if (arg('--chunk')) {
  const [a, b] = arg('--chunk').split(':').map(Number);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'ultrafast', '-qp', '0', '-pix_fmt', 'yuv444p', arg('--out')], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = a; f < b; f++) {
    drawFrame(ctx, f / FPS);
    const buf = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
} else {
  const n = Math.min(4, os.cpus().length);
  const per = Math.ceil(TOTAL / n);
  const t0 = Date.now();
  const segs = [];
  await Promise.all([...Array(n).keys()].map((i) => {
    const a = i * per, b = Math.min(TOTAL, a + per);
    const out = `build/seg${i}.mkv`;
    segs.push(out);
    return new Promise((res, rej) => {
      const p = spawn(process.execPath, ['src/render.mjs', '--chunk', `${a}:${b}`, '--out', out], { stdio: 'inherit' });
      p.on('close', (c) => (c === 0 ? res() : rej(new Error('chunk ' + i + ' failed'))));
    });
  }));
  fs.writeFileSync('build/segs.txt', segs.map((s) => `file '${path.resolve(s)}'`).join('\n'));
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', 'build/segs.txt', '-c', 'copy', 'build/video_lossless.mkv']);
  console.log(`rendered ${TOTAL} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s -> build/video_lossless.mkv`);
}
