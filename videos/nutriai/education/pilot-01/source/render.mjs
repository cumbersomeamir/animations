// render.mjs (education pilot 01): serve the Three.js page locally, drive it frame-by-frame in headless Chromium
// (pre-installed Playwright, SwiftShader WebGL) and pipe raw frames to FFmpeg.
// Usage:
//   node render.mjs                       -> build/video-noaudio.mp4
//   node render.mjs --still 0,12,100      -> build/stills/f0000.png ...
//   node render.mjs --from 0 --to 60 --out build/part.mp4
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright'); // pre-installed in this environment (v1.63.0)
const here = path.dirname(new URL(import.meta.url).pathname);
const assets = path.resolve(here, "../../../assets");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const build = path.join(here, 'build');
fs.mkdirSync(build, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.glsl': 'text/plain', '.frag': 'text/plain', '.otf': 'font/otf', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const file = u.startsWith('/assets/') ? path.join(assets, u.slice(8)) : path.join(here, u);
  if (!file.startsWith(here) && !file.startsWith(assets)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || /ERROR|warning/i.test(m.text())) errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
page.on('requestfailed', (r) => errors.push('request failed ' + r.url()));
await page.goto(`http://127.0.0.1:${port}/web/index.html`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
const TL = await page.evaluate(() => window.TL);
console.log('lip-sync envelope loaded:', await page.evaluate(() => window.hasMouth));
// first render compiles both programs; surface any GLSL errors before going further
await page.evaluate(() => window.renderFrame(0));
const glErr = errors.filter((e) => /shader|program|GLSL|error/i.test(e));
if (glErr.length) { console.error('Shader/page errors:\n' + glErr.join('\n')); await browser.close(); server.close(); process.exit(1); }

const stills = opt('--still');
if (stills) {
  const dir = path.join(build, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const s of stills.split(',')) {
    const f = Number(s);
    await page.evaluate((ff) => window.renderFrame(ff), f);
    const file = path.join(dir, `f${String(f).padStart(4, '0')}.png`);
    await page.locator('canvas').screenshot({ path: file });
    console.log('wrote', file);
  }
} else {
  const from = Number(opt('--from', 0)), to = Number(opt('--to', TL.frames));
  const out = opt('--out', path.join(build, 'video-noaudio.mp4'));
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', '1080x1920', '-r', String(TL.fps), '-i', '-',
    '-vf', 'vflip', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(TL.fps), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = from; f < to; f++) {
    const b64 = await page.evaluate((ff2) => window.renderAndGrab(ff2), f);
    const buf = Buffer.from(b64, 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 30 === 0) console.log(`frame ${f}/${to}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`done ${out} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  fs.writeFileSync(path.join(build, 'textlog.json'), JSON.stringify(await page.evaluate(() => window.textLog())));
}
if (errors.length) console.log('page messages:', [...new Set(errors)].slice(0, 10).join('\n'));
await browser.close();
server.close();
