// Frame capture: Canvas2D page -> PNG -> ffmpeg (libx264 fast preset). Unique source frame every 2nd frame (15 fps puppets).
//   node render.mjs                -> build/video.mp4 (900 frames)
//   node render.mjs --stills 0,90  -> build/stills/fNNN.png
//   node render.mjs --capbounds    -> qa/caption-bounds.json (every frame)
import { createRequire } from 'node:module'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { spawn } from 'node:child_process';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const HERE = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(HERE, '../../..');   // videos/help
const MIME = { '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.otf': 'font/otf' };
const srv = http.createServer((q, r) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('pageerror', (e) => console.log('pageerror', e.message));
await pg.goto(`http://127.0.0.1:${srv.address().port}/production/30s/2026-11-06-english-07/src/stage.html`);
await pg.waitForFunction(() => window.__ready, null, { timeout: 60000 });
const grab = async (f) => Buffer.from((await pg.evaluate((x) => window.__draw(x), f)).split(',')[1], 'base64');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? (process.argv[i + 1] || true) : null; };
if (arg('--stills')) { const d = path.join(HERE, 'build/stills'); fs.mkdirSync(d, { recursive: true }); for (const f of String(arg('--stills')).split(',').map(Number)) fs.writeFileSync(path.join(d, `f${String(f).padStart(3, '0')}.png`), await grab(f)); }
else if (arg('--capbounds')) {
  const cards = JSON.parse(fs.readFileSync(path.join(HERE, 'src/captions.json'))).cards;
  const frames = cards.flatMap((k) => [Math.ceil(k.a * 30) + 4, Math.round((k.a + k.b) / 2 * 30)]);   // each card just after fade-in and at its midpoint
  const rows = []; for (const f of frames) { const c = await pg.evaluate((x) => window.__capAt(x), f); if (c) rows.push({ f, ...c }); }
  const bad = rows.filter((r) => r.y0 < 340 || r.y1 > 520 || r.x0 < 90 || r.x1 > 990);
  const ext = rows.reduce((a, r) => ({ x0: Math.min(a.x0, r.x0), x1: Math.max(a.x1, r.x1), y0: Math.min(a.y0, r.y0), y1: Math.max(a.y1, r.y1) }), { x0: 1e9, x1: -1, y0: 1e9, y1: -1 });
  fs.writeFileSync(path.join(HERE, 'qa/caption-bounds.json'), JSON.stringify({ rule: 'ink y 340-520, x 90-990 (feedback round)', framesChecked: rows.length, extent: ext, violations: bad, cards: [...new Map(rows.map((r) => [r.text, { text: r.text, fs: r.fs, x0: r.x0, x1: r.x1, y0: r.y0, y1: r.y1, firstFrame: r.f }])).values()] }, null, 1));
  console.log('caption frames', rows.length, 'extent', JSON.stringify(ext), 'violations', bad.length);
} else {
  const out = path.join(HERE, 'build/video.mp4'); fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', '-g', '60', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now(); let last = null, lastSig = null, reused = 0;
  for (let f = 0; f < 900; f++) {
    // stop-motion: identical state (same 15 fps puppet step, 12 fps effect step, caption + alpha) -> reuse the previous frame
    const sig = await pg.evaluate((x) => window.__sig(x), f);
    const buf = (sig === lastSig && last) ? (reused++, last) : await grab(f); last = buf; lastSig = sig;
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(0) + 's', 'reused frames', reused);
}
await b.close(); srv.close();
