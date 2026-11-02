// Frame capture: Canvas2D page -> PNG data URLs -> ffmpeg (fast preset). node render.mjs [--stills 0,60,...]
import { createRequire } from 'node:module'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const HERE = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(HERE, '../../..');   // videos/help
const MIME = { '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.otf': 'font/otf' };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('pageerror', (e) => console.log('pageerror', e.message));
await pg.goto(`http://127.0.0.1:${srv.address().port}/tests/10s/pre-reset-2026-11-02/src/stage.html`);
await pg.waitForFunction(() => window.__ready, null, { timeout: 60000 });
const grab = async (f) => Buffer.from((await pg.evaluate((x) => window.__draw(x), f)).split(',')[1], 'base64');
const i = process.argv.indexOf('--stills');
if (i > 0) { fs.mkdirSync(path.join(HERE, 'build'), { recursive: true }); for (const f of process.argv[i + 1].split(',').map(Number)) fs.writeFileSync(path.join(HERE, `build/s${String(f).padStart(3, '0')}.png`), await grab(f)); }
else {
  const out = path.join(HERE, 'build/video.mp4'); fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  let last = null;
  for (let f = 0; f < 300; f++) { const buf = (f % 2 === 1 && last) ? last : await grab(f); last = buf; if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('wrote', out);
}
await b.close(); srv.close();
