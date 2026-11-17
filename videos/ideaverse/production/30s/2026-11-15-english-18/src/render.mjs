// render.mjs — headless Chromium (preinstalled Playwright) over a local static server.
//   node render.mjs --stills=0,1.2,5.8 [--out=../build/stills]   PNG stills
//   node render.mjs --sheet                                       ../character/docket-model-sheet.png
//   node render.mjs --frames --workers=3                          ../build/frames/f0000..f0449.png
//   node render.mjs --encode --audio=../build/mix.wav --out=../ideaverse-education-pilot-01.mp4
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import C from './stage/cues.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(HERE, '../../../../assets');
const BUILD = path.resolve(HERE, '../build');
const arg = (k, d) => { const a = process.argv.find((x) => x === `--${k}` || x.startsWith(`--${k}=`)); return a === undefined ? d : a.includes('=') ? a.split('=')[1] : true; };

// per-frame lip-sync envelope from the narration clips (RMS, normalised, smoothed)
function readWav(file) {
  const b = fs.readFileSync(file); let o = 12, fmt, data;
  while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'fmt ') fmt = { ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12) }; if (id === 'data') data = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz % 2); }
  const n = data.length / 2 / fmt.ch, x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = data.readInt16LE(i * 2 * fmt.ch) / 32768; return { x, sr: fmt.sr };
}
function voiceEnvelope() {
  const n = Math.round(C.dur * C.fps), env = new Float32Array(n);
  for (const v of C.narration) {
    const { x, sr } = readWav(path.join(HERE, 'narration/wav', v.id + '.wav'));
    const hop = sr / C.fps;
    for (let f = 0; f * hop < x.length; f++) {
      let s = 0; const a = Math.floor(f * hop), b = Math.min(x.length, Math.floor((f + 1) * hop)); for (let i = a; i < b; i++) s += x[i] * x[i];
      const fi = Math.round(v.t * C.fps) + f; if (fi >= 0 && fi < n) env[fi] = Math.max(env[fi], Math.sqrt(s / Math.max(1, b - a)));
    }
  }
  let pk = 0; for (const e of env) pk = Math.max(pk, e);
  const out = Array.from(env, (e) => Math.min(1, (e / pk) * 1.5));
  return out.map((e, i) => +(0.6 * e + 0.4 * (out[i - 1] ?? e)).toFixed(3));
}
const VOICE_JSON = JSON.stringify(voiceEnvelope());

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json' };
function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      if (u === '/voice.json') { rsp.writeHead(200, { 'content-type': 'application/json' }); return rsp.end(VOICE_JSON); }
      const file = u.startsWith('/assets/') ? path.join(ASSETS, u.slice(8)) : path.join(HERE, u === '/' ? '/stage/index.html' : u);
      if (!file.startsWith(HERE) && !file.startsWith(ASSETS)) { rsp.writeHead(403); return rsp.end(); }
      fs.readFile(file, (err, buf) => { if (err) { rsp.writeHead(404); return rsp.end(); } rsp.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }); rsp.end(buf); });
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}
async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/stage/index.html`);
  const ok = await page.evaluate(() => window.READY);
  if (!ok || errors.length) throw new Error('page not ready: ' + ok + ' ' + errors.join(' | '));
  return page;
}
const clip = { x: 0, y: 0, width: 1080, height: 1920 };
async function shot(page, t, file) { await page.evaluate((tt) => window.renderAt(tt), t); fs.writeFileSync(file, await page.screenshot({ type: 'png', clip })); }

const srv = await serve(), port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  if (arg('stills')) {
    const dir = path.resolve(HERE, arg('out', '../build/stills')); fs.mkdirSync(dir, { recursive: true });
    const page = await openPage(browser, port);
    for (const s of String(arg('stills')).split(',')) { const t = +s; await shot(page, t, path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.png`)); if (arg('dbg')) console.log(t, JSON.stringify(await page.evaluate(() => window.DBG))); }
    console.log('stills ->', dir);
  }
  if (arg('thumb')) {   // separate vertical thumbnail (window.renderThumb) -> PNG
    const page = await openPage(browser, port); await page.evaluate(() => window.renderThumb());
    const f = path.resolve(HERE, arg('thumb')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, await page.screenshot({ type: 'png', clip })); console.log('thumb ->', f);
  }
  if (arg('caplog')) {   // QA: caption geometry for every frame -> JSON
    const page = await openPage(browser, port), rows = [];
    for (let f = 0; f < Math.round(C.dur * C.fps); f++) rows.push({ f, boxes: await page.evaluate((tt) => window.captionBoxes(tt), f / C.fps) });
    const file = path.resolve(HERE, arg('caplog')); fs.writeFileSync(file, JSON.stringify(rows)); console.log('caption log ->', file);
  }
  if (arg('sheet')) {
    const page = await openPage(browser, port);
    await page.evaluate(() => window.renderSheet());
    const f = path.resolve(HERE, '../character/docket-model-sheet.png'); fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, await page.screenshot({ type: 'png', clip })); console.log('sheet ->', f);
  }
  if (arg('frames')) {
    const dir = path.join(BUILD, 'frames'); const from = +arg('from', 0), to = +arg('to', Math.round(C.dur * C.fps));
    if (!arg('from')) fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const n = to, workers = +arg('workers', 3), t0 = Date.now();
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const page = await openPage(browser, port);
      for (let f = from + w; f < n; f += workers) { await shot(page, f / C.fps, path.join(dir, `f${String(f).padStart(4, '0')}.png`)); if (f % 60 === 0) console.log(`frame ${f}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`); }
    }));
    console.log('frames done', n, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  if (arg('encode')) {
    const outFile = path.resolve(HERE, arg('out', '../build/video.mp4'));
    const a = ['-y', '-v', 'error', '-framerate', String(C.fps), '-i', path.join(BUILD, 'frames/f%04d.png')];
    if (arg('audio')) a.push('-i', path.resolve(HERE, arg('audio')));
    a.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(C.fps));
    if (arg('audio')) a.push('-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000');
    a.push('-t', String(C.dur), '-movflags', '+faststart', outFile);
    if (spawnSync('ffmpeg', a, { stdio: 'inherit' }).status !== 0) throw new Error('ffmpeg failed');
    console.log('encoded ->', outFile);
  }
} finally { await browser.close(); srv.close(); }
