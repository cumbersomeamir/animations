// CLI: node src/render.mjs --cues build/cues.json | --still 0.5,4.1 --out dir | --video build/video.mp4 [--workers 4]
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');




import '../../../../education/pilot-01/src/fonts.mjs';
const { drawFrame, cues } = await import('./prod.mjs');
const { W, H, FPS } = await import('../../../../education/pilot-01/src/core.mjs'); const DURATION = 30;

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));
const icon = await loadImage(fs.readFileSync(path.resolve(ROOT, '../../../assets/icon.png')));
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
const TOTAL = Math.round(FPS * DURATION);
const render = f => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; drawFrame(ctx, f / FPS, { icon }); };
const run = (cmd, a) => new Promise((res, rej) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('exit', c => (c === 0 ? res() : rej(new Error(cmd + ' ' + c)))); });

if (args.cues) {
  fs.mkdirSync(path.dirname(args.cues), { recursive: true });
  fs.writeFileSync(args.cues, JSON.stringify(cues(), null, 1));
  console.log('cues ->', args.cues);
} else if (args.still) {
  const out = args.out || 'build/stills'; fs.mkdirSync(out, { recursive: true });
  for (const s of String(args.still).split(',')) {
    const f = Math.min(TOTAL - 1, Math.round(parseFloat(s) * FPS)); render(f);
    const file = path.join(out, `f${String(f).padStart(3, '0')}.png`); fs.writeFileSync(file, await canvas.encode('png')); console.log(file);
  }
} else if (args.video) {
  const from = +(args.from ?? 0), to = +(args.to ?? TOTAL), workers = +(args.workers ?? 1);
  if (workers > 1) {
    const dir = path.join(path.dirname(args.video), 'chunks'); fs.mkdirSync(dir, { recursive: true });
    const size = Math.ceil((to - from) / workers), files = [];
    await Promise.all([...Array(workers).keys()].map(w => {
      const a = from + w * size, b = Math.min(to, a + size); if (a >= b) return null;
      const file = path.join(dir, `chunk${w}.mp4`); files[w] = file;
      return run(process.execPath, [fileURLToPath(import.meta.url), '--video', file, '--from', String(a), '--to', String(b)]);
    }));
    const list = path.join(dir, 'list.txt'); fs.writeFileSync(list, files.filter(Boolean).map(f => `file '${path.resolve(f)}'`).join('\n'));
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', args.video]);
    console.log('video ->', args.video);
  } else {
    fs.mkdirSync(path.dirname(args.video), { recursive: true });
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-g', '30',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', args.video], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = from; f < to; f++) {
      render(f);
      const d = ctx.getImageData(0, 0, W, H).data;
      if (!ff.stdin.write(Buffer.from(d.buffer, d.byteOffset, d.byteLength))) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise((res, rej) => ff.on('exit', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
    console.log('video ->', args.video);
  }
}
