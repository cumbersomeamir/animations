// Frame-accurate renderer: drives src/index.html in headless Chromium (Playwright)
// and pipes PNG screenshots straight into FFmpeg (no frame files on disk).
//
//   node tools/render.mjs                       -> build/video.mp4 (all frames)
//   node tools/render.mjs --stills 0,45,120     -> build/stills/f0000.png ...
//   node tools/render.mjs --from 0 --to 90 --out build/part.mp4
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
// Playwright is the environment's pre-installed copy (bundled Chromium); resolved via require so NODE_PATH applies.
const { chromium } = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PILOT = path.resolve(HERE, '..');
const SERVE_ROOT = path.resolve(PILOT, '..', '..'); // videos/help (so the page can use assets/icon.png)
const PAGE = '/' + path.relative(SERVE_ROOT, path.join(PILOT, 'src', 'index.html')).split(path.sep).join('/');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return acc;
}, []));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.otf': 'font/otf', '.wav': 'audio/wav' };
const server = http.createServer((req, res) => {
  const p = path.join(SERVE_ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(SERVE_ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const SHEET = Boolean(args.sheet); // --sheet: render the character model sheet instead of the film
const page = await browser.newPage({ viewport: SHEET ? { width: 2400, height: 1500 } : { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.type(), m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const mode = args.mode || 'film';
await page.goto(`http://127.0.0.1:${port}${SHEET ? PAGE.replace('index.html', 'sheet.html') : PAGE}?mode=${mode}`);
await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 180000 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error(err); process.exit(1); }
if (SHEET) {
  const out = path.join(PILOT, 'character', 'tally-model-sheet.png');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, await (await page.$('#stage')).screenshot({ type: 'png' }));
  console.log('wrote', out);
  await browser.close(); server.close(); process.exit(0);
}
const meta = await page.evaluate(() => window.__meta);
const stage = await page.$('#stage');

async function grab(f) {
  await page.evaluate((fr) => new Promise((res) => { window.__renderFrame(fr); requestAnimationFrame(() => requestAnimationFrame(res)); }), f);
  return stage.screenshot({ type: 'png', animations: 'disabled', caret: 'hide' });
}

if (args.textbounds) {
  // QA: measure caption / chip / signature boxes at given frames; flag anything outside the 1080x1920 canvas or safe zone
  const frames = String(args.textbounds).split(',').map(Number);
  const rows = [];
  for (const f of frames) {
    await page.evaluate((fr) => window.__renderFrame(fr), f);
    rows.push(await page.evaluate((fr) => {
      const box = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect();
        const op = Number(getComputedStyle(e.closest('#cap,#sig,#chip') || e).opacity);
        return { x0: Math.round(r.left), y0: Math.round(r.top), x1: Math.round(r.right), y1: Math.round(r.bottom), opacity: op, text: e.textContent.trim() }; };
      const spans = [...document.querySelectorAll('#cap span')].flatMap((sp) => [...sp.getClientRects()].map((r) => ({ x0: Math.round(r.left), y0: Math.round(r.top), x1: Math.round(r.right), y1: Math.round(r.bottom) })));
      return { frame: fr, t: +(fr / 30).toFixed(3), caption: box('#cap span'), captionLines: spans, chip: box('#chip'), signature: box('#sig') };
    }, f));
  }
  const bad = rows.flatMap((r) => [r.caption, r.chip, r.signature, ...(r.captionLines || [])].filter(Boolean)
    .filter((b) => b.x0 < 40 || b.x1 > 1040 || b.y0 < 100 || b.y1 > 1700).map((b) => ({ frame: r.frame, ...b })));
  const out = path.join(PILOT, 'qa', 'text-bounds.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ safeZone: { x: [40, 1040], y: [100, 1700] }, outOfSafeZone: bad, rows }, null, 1));
  console.log('text bounds:', rows.length, 'frames checked;', bad.length, 'boxes outside safe zone ->', out);
} else if (args.stills) {
  const dir = path.join(PILOT, args.outdir || 'build/stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const s of String(args.stills).split(',')) {
    const f = Math.round(Number(s));
    const buf = await grab(f);
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(4, '0')}.png`), buf);
    console.log('still', f);
  }
} else {
  const from = Number(args.from || 0), to = Number(args.to || meta.frames); // [from, to)
  const out = path.join(PILOT, args.out || 'build/video.mp4');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(meta.fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
    '-r', String(meta.fps), '-g', '30', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = from; f < to; f++) {
    const buf = await grab(f);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 15 === 0) console.log(`frame ${f}/${to} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, 'frames', to - from, 'in', ((Date.now() - t0) / 1000).toFixed(0), 's');
}
await browser.close();
server.close();
