// Headless renderer for the Mello english13-01 scene.
//   node render.mjs --stills 0,2.5,8.6 --out generated/stills [--guides]
//   node render.mjs --video generated/video_silent.mp4 [--from 0 --to 900]
// Serves videos/mello/ on localhost, drives Chromium (pre-installed Playwright, SwiftShader WebGL),
// calls window.renderAt(t) per frame and pipes PNG screenshots into ffmpeg (libx264, yuv420p, 30 fps).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, '../../../..');            // videos/mello
const REL = path.relative(APP, HERE).split(path.sep).join('/');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '/usr/local/lib/node_modules_global', 'playwright'))); }

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => {
  if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]); return a;
}, []));
const FPS = 30, NFR = 900;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.woff2': 'font/woff2', '.png': 'image/png', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const p = path.join(APP, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/${REL}/scene/index.html`;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
  '--disable-gpu-vsync', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text()); });
page.on('pageerror', e => { console.error('[pageerror]', e.message); process.exitCode = 1; });
await page.goto(url);
await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
if (args.guides) await page.evaluate(() => window.showGuides(true));
// export the scene's event times so the sound design uses the exact same beats
fs.mkdirSync(path.join(HERE, 'generated'), { recursive: true });
fs.writeFileSync(path.join(HERE, 'generated/events.json'), JSON.stringify(await page.evaluate(() => ({ T: window.__T, S: window.__S })), null, 2));
const shot = () => page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } });

if (args.stills) {
  const out = path.resolve(HERE, args.out || 'generated/stills');
  fs.mkdirSync(out, { recursive: true });
  for (const s of String(args.stills).split(',')) {
    const t = parseFloat(s);
    await page.evaluate(t => window.renderAt(t), t);
    fs.writeFileSync(path.join(out, `t${t.toFixed(2).padStart(5, '0')}.png`), await shot());
    console.log('still', t);
  }
}
if (args.video) {
  const from = parseInt(args.from ?? 0), to = parseInt(args.to ?? NFR);
  const outFile = path.resolve(HERE, args.video);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-r', String(FPS), '-g', '60', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = from; f < to; f++) {
    await page.evaluate(t => window.renderAt(t), f / FPS);
    const buf = await shot();
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log(`frame ${f}/${to}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  const code = await new Promise(r => ff.on('close', r));
  if (code !== 0) { console.error('ffmpeg failed', code); process.exitCode = 1; }
  console.log(`video ${outFile} frames ${from}-${to} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
if (args.layout) {
  // Safe-zone audit every 3rd frame: captions inside the y 340-520 / x 90-990 band, max two lines,
  // nothing meaningful above y 300, key objects clear of the right-rail (x>930, y 900-1700) and bottom (y>1560) UI.
  const rows = [], issues = [];
  const inside = (b, x0, y0, x1, y1, tol = 6) => b[0] >= x0 - tol && b[1] >= y0 - tol && b[2] <= x1 + tol && b[3] <= y1 + tol;
  const overlaps = (b, x0, y0, x1, y1) => b && b[0] < x1 && b[2] > x0 && b[1] < y1 && b[3] > y0;
  for (let f = 0; f < NFR; f += 3) {
    const r = await page.evaluate(t => window.layoutReport(t), f / FPS);
    rows.push(r);
    if (r.captionText && !inside(r.captionText, 100, 340, 900, 520)) issues.push(`f${f}: caption text ${r.captionText} outside band (x 100-900)`);
    if (r.captionLines > 2) issues.push(`f${f}: ${r.captionLines} caption lines`);
    if (r.captionText && r.captionText[1] < 300) issues.push(`f${f}: caption above y 300`);
    // crucial in-scene text (english13: the card, the note card and the labels), each checked on its own.
    // The performer's head, the colleague's head (and, where present, a clock dial) must never sit behind caption text.
    const crucial = r.crucial || { card: r.card };   // each crucial text object is checked on its own
    if (r.clock && r.captionText && overlaps(r.clock, ...r.captionText)) issues.push(`f${f}: clock ${r.clock} behind caption text ${r.captionText}`);
    if (r.head && r.captionText && overlaps(r.head, ...r.captionText)) issues.push(`f${f}: head ${r.head} behind caption text ${r.captionText}`);
    if (r.zipper && r.captionText && overlaps(r.zipper, ...r.captionText)) issues.push(`f${f}: zipper ${r.zipper} behind caption text ${r.captionText}`);
    if (r.mateHead && r.captionText && overlaps(r.mateHead, ...r.captionText)) issues.push(`f${f}: colleague head ${r.mateHead} behind caption text ${r.captionText}`);
    for (const [k, b] of Object.entries(crucial)) {
      if (!b) continue;
      if (overlaps(b, 0, 0, 1080, 520) && b[1] < 520 - 6) issues.push(`f${f}: ${k} ${b} reaches into caption band`);
      if (overlaps(b, 930, 900, 1080, 1700) && b[2] > 936) issues.push(`f${f}: ${k} ${b} in right-rail UI zone`);
      if (b[3] > 1560) issues.push(`f${f}: ${k} ${b} in bottom UI zone`);
      if (b[0] < 60) issues.push(`f${f}: ${k} ${b} past left margin`);
    }
  }
  const out = path.resolve(HERE, args.layout);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ sampled_every_frames: 3, issues, rows }, null, 1));
  console.log(`layout: ${rows.length} samples, ${issues.length} issues`); issues.slice(0, 40).forEach(i => console.log('  ' + i));
}
await browser.close();
server.close();
