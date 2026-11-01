// Render driver: frames -> FFmpeg (H.264), stills for inspection, or the SFX event list.
// Usage:
//   node render.mjs --video ../build/video.mp4            full 900-frame silent video
//   node render.mjs --stills 0,50,120 --outdir ../build/stills
//   node render.mjs --events ../build/events.json
import { createCanvas } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { W, H, FPS, N, prepare, drawFrame, eventsJSON } from './scene.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };

await prepare();
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

if (opt('--events')) {
  const out = opt('--events');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(eventsJSON(), null, 1));
  console.log('events ->', out, eventsJSON().sfx.length, 'sfx');
}

if (opt('--stills')) {
  const dir = opt('--outdir', '../build/stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const s of opt('--stills').split(',')) {
    const f = +s;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawFrame(ctx, f);
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(3, '0')}.png`), canvas.toBuffer('image/png'));
  }
  console.log('stills ->', dir);
}

if (opt('--video')) {
  const out = opt('--video');
  const [a, b] = (opt('--range', `0:${N}`)).split(':').map(Number);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = a; f < b; f++) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawFrame(ctx, f);
    const buf = Buffer.from(canvas.data());
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 100 === 0) console.log(`frame ${f}/${b} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg exit ' + c)))));
  console.log('video ->', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
