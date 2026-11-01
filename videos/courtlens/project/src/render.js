'use strict';
// Frame renderer: draws every frame with @napi-rs/canvas and pipes raw RGBA into FFmpeg.
// Usage:
//   node src/render.js video <out.mp4> [startFrame endFrame]
//   node src/render.js stills <dir> <t1,t2,...>
//   node src/render.js cues <out.json>
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const S = require('./scenes');
const { rng } = require('./lib');

const ROOT = path.resolve(__dirname, '..');
const APP = path.resolve(ROOT, '..');
const FPS = 30;
const N = Math.round(30 * FPS);

function registerFonts() {
  const fsrc = path.join(ROOT, 'node_modules/@fontsource');
  for (const w of [600, 700, 800, 900]) {
    GlobalFonts.registerFromPath(path.join(fsrc, `fraunces/files/fraunces-latin-${w}-normal.woff2`), 'Fraunces');
    GlobalFonts.registerFromPath(path.join(fsrc, `fraunces/files/fraunces-latin-${w}-italic.woff2`), 'Fraunces');
  }
  for (const w of [500, 600, 700, 800]) GlobalFonts.registerFromPath(path.join(fsrc, `inter/files/inter-latin-${w}-normal.woff2`), 'Inter');
}

function makeGrain() {
  const c = createCanvas(740, 1160);
  const g = c.getContext('2d');
  const img = g.createImageData(740, 1160);
  const r = rng(2024);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = r() < 0.5 ? 0 : 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = Math.floor(r() * 120);
  }
  g.putImageData(img, 0, 0);
  return c;
}

async function assets() {
  registerFonts();
  S.init();
  const icon = await loadImage(path.join(APP, 'assets/icon.png'));
  const capPath = path.join(ROOT, 'build/vo/captions.json');
  const captions = fs.existsSync(capPath) ? JSON.parse(fs.readFileSync(capPath, 'utf8')) : null;
  if (!captions) console.warn('WARN: captions.json missing — rendering without captions');
  return { icon, grain: makeGrain(), captions };
}

async function video(out, f0 = 0, f1 = N) {
  const A = await assets();
  const canvas = createCanvas(S.W, S.H);
  const ctx = canvas.getContext('2d');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${S.W}x${S.H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const t = f / FPS;
    ctx.save();
    S.frame(ctx, t, A);
    ctx.restore();
    const buf = canvas.data();
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 60 === 0) process.stdout.write(`frame ${f}/${f1} (${((Date.now() - t0) / 1000).toFixed(1)}s)\n`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (code) => (code === 0 ? r() : j(new Error('ffmpeg exit ' + code)))));
  console.log(`video done: ${out} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

async function stills(dir, times) {
  const A = await assets();
  fs.mkdirSync(dir, { recursive: true });
  const canvas = createCanvas(S.W, S.H);
  const ctx = canvas.getContext('2d');
  for (const t of times) {
    ctx.save();
    S.frame(ctx, t, A);
    ctx.restore();
    const p = path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.png`);
    fs.writeFileSync(p, canvas.toBuffer('image/png'));
  }
  console.log(`${times.length} stills -> ${dir}`);
}

(async () => {
  const [mode, a, b, c] = process.argv.slice(2);
  if (mode === 'video') await video(a, b ? +b : 0, c ? +c : N);
  else if (mode === 'stills') await stills(a, b.split(',').map(Number));
  else if (mode === 'cues') { S.init(); fs.writeFileSync(a, JSON.stringify({ T: S.T, cues: S.cueSheet() }, null, 1)); console.log('cues ->', a); }
  else { console.error('usage: video|stills|cues'); process.exit(1); }
})().catch((e) => { console.error(e); process.exit(1); });
