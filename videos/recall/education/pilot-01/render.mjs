// Frame-accurate renderer: serves this folder locally, drives web/index.html in headless Chromium
// (preinstalled Playwright, SwiftShader WebGL), captures each frame as PNG and pipes it to FFmpeg.
//
//   node render.mjs --out build/video_silent.mp4            # full 450 frames
//   node render.mjs --stills 0,45,120 --outdir build/stills  # selected frames as PNG
//   node render.mjs --sheet build/sheet                       # character model-sheet poses
//   node render.mjs --pngdir build/frames --from 0 --to 149 # PNG frames (used by build.sh, parallel workers)
//   options: --scale 0.5 (preview size), --from N --to M, --step K
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch {
  ({ chromium } = require('/opt/node22/lib/node_modules/playwright'));
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP_ASSETS = path.resolve(HERE, '../../assets');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));
const FPS = 30, W = 1080, H = 1920;
const scale = Number(args.scale || 1);
const total = Math.round(15 * FPS);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  const file = u.startsWith('/app-assets/') ? path.join(APP_ASSETS, u.slice(12)) : path.join(HERE, u);
  if (!file.startsWith(HERE) && !file.startsWith(APP_ASSETS)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
    '--disable-gpu-vsync', '--font-render-hinting=none'],
});
const page = await browser.newPage({ viewport: { width: Math.round(W * scale), height: Math.round(H * scale) }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text()); });
page.on('pageerror', e => console.error('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}/web/index.html`);
const data = {
  timeline: JSON.parse(fs.readFileSync(path.join(HERE, 'timeline.json'), 'utf8')),
  mouth: fs.existsSync(path.join(HERE, 'build/mouth.json')) ? JSON.parse(fs.readFileSync(path.join(HERE, 'build/mouth.json'), 'utf8')) : null,
  width: Math.round(W * scale), height: Math.round(H * scale),
};
await page.waitForFunction(() => typeof window.__setup === 'function', null, { timeout: 30000 });
const phys = await page.evaluate(d => window.__setup(d), data);
console.log('physics', JSON.stringify(phys));
if (args.physics) fs.writeFileSync(args.physics, JSON.stringify(phys, null, 2));

async function shot() { return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: data.width, height: data.height } }); }

if (args.sheet) {
  fs.mkdirSync(args.sheet, { recursive: true });
  const poses = await page.evaluate(() => window.__sheetPoses());
  for (const p of poses) {
    await page.evaluate(n => window.__renderSheetPose(n), p);
    fs.writeFileSync(path.join(args.sheet, `${p}.png`), await shot());
    console.log('pose', p);
  }
} else if (args.pngdir) {
  fs.mkdirSync(args.pngdir, { recursive: true });
  const from = Number(args.from || 0), to = Number(args.to || total - 1);
  const t0 = Date.now(), log = [];
  for (let f = from; f <= to; f++) {
    const info = await page.evaluate(n => window.__renderFrame(n), f);
    fs.writeFileSync(path.join(args.pngdir, `f${String(f).padStart(3, '0')}.png`), await shot());
    log.push({ f, ...info });
    if ((f - from) % 15 === 0) console.log(`frame ${f} [${from}-${to}] ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  fs.writeFileSync(path.join(args.pngdir, `layout_${from}_${to}.json`), JSON.stringify(log));
  console.log('done', from, to, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
} else if (args.stills) {
  const dir = args.outdir || 'build/stills';
  fs.mkdirSync(dir, { recursive: true });
  for (const f of String(args.stills).split(',').map(Number)) {
    await page.evaluate(n => window.__renderFrame(n), f);
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(3, '0')}.png`), await shot());
    console.log('still', f);
  }
} else {
  const out = args.out || 'build/video_silent.mp4';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const from = Number(args.from || 0), to = Number(args.to || total - 1), step = Number(args.step || 1);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS / step), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-r', String(FPS / step), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = from; f <= to; f += step) {
    await page.evaluate(n => window.__renderFrame(n), f);
    const buf = await shot();
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log(`frame ${f}/${to}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', out, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
await browser.close();
server.close();
