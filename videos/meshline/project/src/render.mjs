// CLI renderer: frames -> raw RGBA -> ffmpeg (libx264). Usage:
//   node src/render.mjs --events build/events.json
//   node src/render.mjs --still 0.5,4.2,11.5 --out build/stills
//   node src/render.mjs --video build/video.mp4 [--from 0 --to 900] [--workers 4]
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { W, H, FPS, DURATION } from './lib.mjs';
import { drawFrame, events } from './scene.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));

GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/InterDisplay-ExtraBold.otf'), 'MLDisplay');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/InterDisplay-Bold.otf'), 'MLDisplayB');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/Inter-SemiBold.otf'), 'MLSemi');
GlobalFonts.registerFromPath(path.join(ROOT, 'fonts/Inter-Medium.otf'), 'MLMed');

const icon = await loadImage(fs.readFileSync(path.join(ROOT, '../assets/icon.png')));
const assets = { icon };
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
const TOTAL = FPS * DURATION;

function render(frame) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  drawFrame(ctx, frame / FPS, assets);
}

if (args.events) {
  fs.mkdirSync(path.dirname(args.events), { recursive: true });
  fs.writeFileSync(args.events, JSON.stringify(events(), null, 1));
  console.log('events ->', args.events);
} else if (args.still) {
  const out = args.out || 'build/stills';
  fs.mkdirSync(out, { recursive: true });
  for (const s of String(args.still).split(',')) {
    const f = Math.round(parseFloat(s) * FPS);
    render(f);
    const file = path.join(out, `f${String(f).padStart(4, '0')}.png`);
    fs.writeFileSync(file, await canvas.encode('png'));
    console.log(file);
  }
} else if (args.video) {
  const from = +(args.from ?? 0), to = +(args.to ?? TOTAL);
  const workers = +(args.workers ?? 1);
  if (workers > 1) {
    // split into contiguous chunks rendered by child processes, then concat losslessly
    const dir = path.join(path.dirname(args.video), 'chunks');
    fs.mkdirSync(dir, { recursive: true });
    const n = to - from, size = Math.ceil(n / workers);
    const jobs = [];
    for (let w = 0; w < workers; w++) {
      const a = from + w * size, b = Math.min(to, a + size);
      if (a >= b) continue;
      const file = path.join(dir, `chunk${w}.mp4`);
      jobs.push(new Promise((res, rej) => {
        const p = spawn(process.execPath, [fileURLToPath(import.meta.url), '--video', file, '--from', a, '--to', b], { stdio: ['ignore', 'inherit', 'inherit'] });
        p.on('exit', code => (code === 0 ? res(file) : rej(new Error('chunk failed ' + w))));
      }));
    }
    const files = await Promise.all(jobs);
    const list = path.join(dir, 'list.txt');
    fs.writeFileSync(list, files.map(f => `file '${path.resolve(f)}'`).join('\n'));
    await new Promise((res, rej) => {
      const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', args.video], { stdio: 'inherit' });
      p.on('exit', c => (c === 0 ? res() : rej(new Error('concat failed'))));
    });
    console.log('video ->', args.video);
  } else {
    fs.mkdirSync(path.dirname(args.video), { recursive: true });
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-g', '30', '-bf', '2',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', args.video], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = from; f < to; f++) {
      render(f);
      const buf = ctx.getImageData(0, 0, W, H).data;
      if (!ff.stdin.write(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength))) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - from) % 90 === 0) console.log(`frame ${f}/${to} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
    ff.stdin.end();
    await new Promise((res, rej) => ff.on('exit', c => (c === 0 ? res() : rej(new Error('ffmpeg failed ' + c)))));
    console.log('video ->', args.video, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}
