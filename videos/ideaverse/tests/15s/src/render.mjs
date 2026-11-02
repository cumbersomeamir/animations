// render.mjs — drives headless Chromium (preinstalled Playwright) over a local static server.
//   node render.mjs --stills=0,1.5,2.2 --out=../build/stills       full-res PNG stills
//   node render.mjs --frames --workers=3                              all frames -> ../build/frames/f0000.png
//   node render.mjs --encode --audio=../build/score.m4a --out=../ideaverse-15s-test.mp4
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import C from './reel/cues.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(HERE, '../../../assets');
const BUILD = path.resolve(HERE, '../build');
const arg = (k, d) => { const a = process.argv.find((x) => x === `--${k}` || x.startsWith(`--${k}=`)); return a === undefined ? d : a.includes('=') ? a.split('=')[1] : true; };

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json' };
function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      const file = u.startsWith('/assets/') ? path.join(ASSETS, u.slice(8)) : path.join(HERE, u === '/' ? '/reel/index.html' : u);
      if (!file.startsWith(HERE) && !file.startsWith(ASSETS)) { rsp.writeHead(403); return rsp.end(); }
      fs.readFile(file, (err, buf) => {
        if (err) { rsp.writeHead(404); return rsp.end(); }
        rsp.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }); rsp.end(buf);
      });
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`http://127.0.0.1:${port}/reel/index.html`);
  const ok = await page.evaluate(() => window.READY);
  if (!ok || errors.length) throw new Error('page not ready: ' + ok + ' ' + errors.join(' | '));
  return page;
}
async function shot(page, t, file) {
  await page.evaluate((tt) => window.renderAt(tt), t);
  const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  fs.writeFileSync(file, buf);
}

const srv = await serve();
const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try {
  if (arg('stills')) {
    const dir = path.resolve(HERE, arg('out', '../build/stills')); fs.mkdirSync(dir, { recursive: true });
    const page = await openPage(browser, port);
    for (const s of String(arg('stills')).split(',')) {
      const t = +s; await shot(page, t, path.join(dir, `t${t.toFixed(2).padStart(5, '0')}.png`));
    }
    console.log('stills ->', dir);
  }
  if (arg('frames')) {
    const dir = path.join(BUILD, 'frames'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const n = Math.round(C.dur * C.fps), workers = +arg('workers', 3), t0 = Date.now();
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const page = await openPage(browser, port);
      for (let f = w; f < n; f += workers) {
        await shot(page, f / C.fps, path.join(dir, `f${String(f).padStart(4, '0')}.png`));
        if (f % 60 === 0) console.log(`frame ${f}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }));
    console.log('frames done', n, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  if (arg('encode')) {
    const outFile = path.resolve(HERE, arg('out', '../ideaverse-15s-test.mp4'));
    const a = ['-y', '-v', 'error', '-framerate', String(C.fps), '-i', path.join(BUILD, 'frames/f%04d.png')];
    if (arg('audio')) a.push('-i', path.resolve(HERE, arg('audio')));
    a.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(C.fps));
    if (arg('audio')) a.push('-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000');
    a.push('-t', String(C.dur), '-movflags', '+faststart', outFile);
    const r = spawnSync('ffmpeg', a, { stdio: 'inherit' });
    if (r.status !== 0) throw new Error('ffmpeg failed');
    console.log('encoded ->', outFile);
  }
} finally { await browser.close(); srv.close(); }
