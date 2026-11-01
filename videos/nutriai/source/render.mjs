// Local renderer: draws every frame with @napi-rs/canvas and pipes raw RGBA into FFmpeg.
// Usage:
//   node render.mjs                         -> build/video-noaudio.mp4 (+ build/textlog.json)
//   node render.mjs --still 0,15,150        -> build/stills/f0000.png ...
//   node render.mjs --from 100 --to 200 --out build/part.mp4
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { TL, W, H, init, drawFrame } from './lib/scenes.mjs';
import { TEXT_LOG } from './lib/type.mjs';
import { rng } from './lib/util.mjs';

const here = path.dirname(new URL(import.meta.url).pathname);
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const build = path.join(here, 'build');
fs.mkdirSync(build, { recursive: true });

// Vendored fonts under private family names so system fonts can never be picked by accident.
for (const f of ['InterDisplay-Black.otf', 'InterDisplay-ExtraBold.otf', 'InterDisplay-Bold.otf']) GlobalFonts.registerFromPath(path.join(here, 'fonts', f), 'NutriDisplay');
for (const f of ['Inter-SemiBold.otf', 'Inter-Bold.otf', 'Inter-Medium.otf']) GlobalFonts.registerFromPath(path.join(here, 'fonts', f), 'NutriText');
// Inter-ExtraBold is not vendored; 800 weight in NutriText resolves to the nearest vendored weight (Bold).

const icon = await loadImage(path.join(here, '..', 'assets', 'icon.png'));

// Paper grain: a few deterministic noise tiles at half resolution.
function makeGrain(seed) {
  const c = createCanvas(W / 2, H / 2);
  const g = c.getContext('2d');
  const img = g.createImageData(W / 2, H / 2);
  const r = rng(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = r();
    const dark = v < 0.5;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = dark ? 40 : 255;
    img.data[i + 3] = Math.floor(Math.abs(v - 0.5) * 2 * 26);
  }
  g.putImageData(img, 0, 0);
  return c;
}
const grain = [makeGrain(1), makeGrain(2), makeGrain(3)];
init(icon, grain);

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

const stills = opt('--still');
if (stills) {
  const dir = path.join(build, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const s of stills.split(',')) {
    const f = Number(s);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawFrame(ctx, f);
    const file = path.join(dir, `f${String(f).padStart(4, '0')}.png`);
    fs.writeFileSync(file, await canvas.encode('png'));
    console.log('wrote', file);
  }
  process.exit(0);
}

const from = Number(opt('--from', 0));
const to = Number(opt('--to', TL.frames));
const out = opt('--out', path.join(build, 'video-noaudio.mp4'));
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(TL.fps), '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(TL.fps), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = from; f < to; f++) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawFrame(ctx, f);
  const buf = canvas.data();
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % 60 === 0) console.log(`frame ${f}/${to} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
fs.writeFileSync(path.join(build, 'textlog.json'), JSON.stringify(TEXT_LOG));
console.log(`done ${out} in ${((Date.now() - t0) / 1000).toFixed(1)}s, text records: ${TEXT_LOG.length}`);
