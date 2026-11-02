// Renderer: deterministic frames -> raw RGBA -> ffmpeg (H.264 yuv420p).
// usage:
//   node render.mjs stills <t1,t2,...> <out.png> [scale]     contact tile of times
//   node render.mjs video <out.mp4> [startFrame endFrame]       silent video segment
import { createCanvas } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { W, H, FPS, NFRAMES } from './ui.mjs';
import { drawFrame } from './scene.mjs';
import fs from 'node:fs';

const [mode, a1, a2, a3, a4] = process.argv.slice(2);
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

if (mode === 'stills') {
  const times = a1.split(',').map(Number);
  const scale = a3 ? Number(a3) : 0.5;
  const cols = Math.min(times.length, 5), rows = Math.ceil(times.length / cols);
  const tw = Math.round(W * scale), th = Math.round(H * scale);
  const sheet = createCanvas(cols * tw + (cols + 1) * 8, rows * (th + 30) + 8);
  const g = sheet.getContext('2d');
  g.fillStyle = '#222'; g.fillRect(0, 0, sheet.width, sheet.height);
  times.forEach((t, i) => {
    const f = Math.min(NFRAMES - 1, Math.round(t * FPS));
    const t0 = Date.now(); drawFrame(ctx, f); const ms = Date.now() - t0;
    const x = 8 + (i % cols) * (tw + 8), y = 8 + Math.floor(i / cols) * (th + 30);
    g.drawImage(canvas, x, y, tw, th);
    g.fillStyle = '#fff'; g.font = '18px sans-serif'; g.fillText(`t=${t.toFixed(2)}s f=${f} (${ms}ms)`, x + 4, y + th + 20);
  });
  fs.writeFileSync(a2, sheet.toBuffer('image/png'));
  console.log('wrote', a2);
} else if (mode === 'video') {
  const out = a1;
  const f0 = a2 ? Number(a2) : 0, f1 = a3 ? Number(a3) : NFRAMES;
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-maxrate', '12M', '-bufsize', '24M', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2', '-tune', 'animation',
    '-g', '60', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    drawFrame(ctx, f);
    const buf = canvas.data(); // raw RGBA
    if (!ff.stdin.write(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength))) await new Promise((r) => ff.stdin.once('drain', r));
    if ((f - f0) % 60 === 0) console.log(`frame ${f} ${((Date.now() - t0) / (f - f0 + 1)).toFixed(0)} ms/frame`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`done ${f1 - f0} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
} else {
  console.log('usage: node render.mjs stills|video ...');
}
