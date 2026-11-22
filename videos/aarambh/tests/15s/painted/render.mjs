// render.mjs — own headless renderer for the painted test (Playwright + the pre-installed Chromium, WebGL via SwiftShader).
//   node render.mjs --sheet=0.5,2,4 [--cols=4] [--w=270] [--crop=x,y,w,h] --out=out/check/a.jpg
//   node render.mjs --strip=1.0:1.4 [--cols=6] [--w=270] --out=out/check/strip.jpg      (every 30 fps frame in the span)
//   node render.mjs --stills=1.2,3.4 --out=out/stills                                    (full-res JPEGs)
//   node render.mjs --frames [--range=a:b] [--workers=4]                                 (out/frames/f00000.jpg…, resumable)
//   node render.mjs --encode --out=../aarambh-15s-test.mp4 [--audio=../audio/mix.wav]
import { createRequire } from 'node:module';
// Playwright is pre-installed in this environment (global NODE_PATH); its bundled Chromium is used.
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readdirSync, renameSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const FPS = 30, DUR = 15, N = FPS * DUR, FRAMES = 'out/frames';
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c ? bad(new Error(cmd + ' exited ' + c)) : ok()); });
const save = (path, url) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, Buffer.from(url.split(',')[1], 'base64')); };

if (args.encode) {
  const out = args.out || '../aarambh-15s-test.mp4', audio = args.audio;
  const n = readdirSync(FRAMES).filter(f => f.endsWith('.jpg')).length;
  if (n !== N) { console.error(`expected ${N} frames, found ${n}`); process.exit(1); }
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-stats', '-framerate', String(FPS), '-i', `${FRAMES}/f%05d.jpg`,
    ...(audio ? ['-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000'] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-t', String(DUR), '-movflags', '+faststart', out]);
  console.log('wrote ' + out);
  process.exit(0);
}

// Tiny local static server (p5 2.x loads images with fetch, which file:// URLs don't support).
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2', '.css': 'text/css', '.json': 'application/json' };
const server = createServer((req, res) => {
  const p = join(resolve('.'), decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(resolve('.')) || !existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p));
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] });
async function openPage(tag = '') {
  const page = await browser.newPage({ viewport: { width: 400, height: 700 } });
  page.on('console', m => { if (['error', 'warning'].includes(m.type()) && !/INVALID_OPERATION|GPU stall|swiftshader/i.test(m.text())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(BASE + '?render', { waitUntil: 'load' });
  await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
  return page;
}
const nums = s => String(s).split(',').map(Number);

if (args.sheet || args.strip) {
  const page = await openPage();
  let times;
  if (args.sheet) times = nums(args.sheet);
  else { const [a, b] = String(args.strip).split(':').map(Number); times = []; for (let f = Math.round(a * FPS); f <= Math.round(b * FPS); f++) times.push(f / FPS); }
  const crop = args.crop ? nums(args.crop) : null;
  const { url, ms } = await page.evaluate(([t, c, w, cr]) => window.renderSheet(t, c, w, cr), [times, +(args.cols || 4), +(args.w || 270), crop]);
  save(args.out || 'out/check/sheet.jpg', url);
  console.log(`sheet ${times.length} frames → ${args.out}  ms/frame: ${ms.join(' ')}`);
} else if (args.stills) {
  const page = await openPage();
  for (const t of nums(args.stills)) { const url = await page.evaluate(tt => window.renderAt(tt), t); save(`${args.out || 'out/stills'}/t${t.toFixed(2)}.jpg`, url); }
} else if (args.frames) {
  const [a, b] = args.range ? String(args.range).split(':').map(Number) : [0, DUR];
  const todo = []; for (let f = Math.round(a * FPS); f < Math.min(N, Math.round(b * FPS)); f++) if (!existsSync(`${FRAMES}/f${String(f).padStart(5, '0')}.jpg`)) todo.push(f);
  mkdirSync(FRAMES, { recursive: true });
  const workers = Math.max(1, +(args.workers || 4)); let next = 0, done = 0; const t0 = Date.now();
  console.log(`rendering ${todo.length} frames with ${workers} workers`);
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = await openPage(` w${w}`);
    while (next < todo.length) {
      const f = todo[next++];
      const url = await page.evaluate(tt => window.renderAt(tt, 'image/jpeg', .95), f / FPS);
      const p = `${FRAMES}/f${String(f).padStart(5, '0')}.jpg`;
      save(p + '.tmp', url); renameSync(p + '.tmp', p);
      if (++done % 30 === 0) console.log(`${done}/${todo.length}  ${((Date.now() - t0) / done / 1000 * workers).toFixed(2)} s/frame/worker`);
    }
  }));
  console.log(`frames done in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
await browser.close();
server.close();
