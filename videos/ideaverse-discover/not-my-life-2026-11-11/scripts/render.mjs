#!/usr/bin/env node
// Render "Not My Life" frames with headless Chromium (Three.js scene) and pipe raw RGBA into FFmpeg.
//   node scripts/render.mjs                      full film -> build/video.mp4 (no audio)
//   node scripts/render.mjs --shots 375,480      re-render only those shots (by first frame), then re-join
//   node scripts/render.mjs --range 400-500      re-render every shot touching that range, then re-join
//   node scripts/render.mjs --png 0,45,90 --dir build/stills   still frames as PNG
//   node scripts/render.mjs --workers 2 --crf 16
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1080, H = 1920, TOTAL = 750;
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]] : a), []));
const workers = Number(args.workers || 2);
const crf = String(args.crf || 16);
const outDir = path.join(ROOT, 'build');
fs.mkdirSync(path.join(outDir, 'segments'), { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.otf': 'font/otf', '.mp4': 'video/mp4' };
const sinks = new Map(); // worker id -> { write(buf) }

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'POST' && url.pathname === '/frame') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const buf = Buffer.concat(chunks);
      if (buf.length !== W * H * 4) { res.writeHead(400); res.end('bad size ' + buf.length); return; }
      await sinks.get(url.searchParams.get('w'))(buf, Number(url.searchParams.get('f')));
      res.writeHead(200); res.end('ok');
    });
    return;
  }
  const p = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { console.log('MISSING ASSET', url.pathname); res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;

function ffmpegSink(file) {
  const tmp = file.replace(/\.mp4$/, '.tmp.mp4');
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', 'pipe:0',
    '-vf', 'vflip,scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p',
    '-c:v', 'libx264', '-preset', String(args.preset || 'medium'), '-crf', crf, '-x264-params', 'keyint=60:min-keyint=1:aq-mode=3',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv', '-movflags', '+faststart', tmp],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? (fs.renameSync(tmp, file), res()) : rej(new Error('ffmpeg ' + c)))));
  return {
    write: (buf) => new Promise((r) => (ff.stdin.write(buf) ? r() : ff.stdin.once('drain', r))),
    end: () => { ff.stdin.end(); return done; },
  };
}
function pngWrite(file, buf) {
  return new Promise((res, rej) => {
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-i', 'pipe:0', '-vf', 'vflip', '-frames:v', '1', file]);
    ff.on('close', (c) => (c === 0 ? res() : rej(new Error('png ' + c)))); ff.stdin.end(buf);
  });
}

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${PORT}/scene/index.html`);
  await page.waitForFunction(() => window.NML);
  await page.evaluate(() => window.NML.ready);
  return page;
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-sandbox'] });
const t0 = Date.now();
try {
  if (args.textboxes) {
    const page = await openPage(browser);
    const res = {};
    for (let f = 0; f < TOTAL; f++) { const bx = await page.evaluate((f) => NML.textBoxes(f), f); if (bx.length) res[f] = bx; }
    const file = path.resolve(ROOT, String(args.textboxes) === 'true' ? 'build/qa/textboxes.json' : args.textboxes);
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(res, null, 0));
    const all = Object.values(res).flat().filter((b) => b.alpha > 0.01);
    console.log('text frames', Object.keys(res).length, 'bounds x', Math.min(...all.map((b) => b.x0)), Math.max(...all.map((b) => b.x1)), 'y', Math.min(...all.map((b) => b.y0)), Math.max(...all.map((b) => b.y1)));
  } else if (args.png) {
    const frames = String(args.png).split(',').map(Number);
    const dir = path.resolve(ROOT, args.dir || 'build/stills');
    fs.mkdirSync(dir, { recursive: true });
    const page = await openPage(browser);
    sinks.set('png', async (buf, f) => pngWrite(path.join(dir, `f${String(f).padStart(3, '0')}.png`), buf));
    for (const f of frames) {
      const info = await page.evaluate(async (f) => { const r = await NML.renderFrame(f); const px = NML.readPixels(); await fetch(`/frame?w=png&f=${f}`, { method: 'POST', body: px }); return r; }, f);
      console.log('still', f, JSON.stringify(info));
    }
  } else {
    // One encoded segment per shot (same encoder settings) so any shot can be re-rendered alone and re-joined with -c copy.
    const SHOTS = [[0, 89], [90, 104], [105, 247], [248, 284], [285, 374], [375, 479], [480, 659], [660, 749]];
    let todo = SHOTS;
    if (args.shots) { const want = String(args.shots).split(',').map(Number); todo = SHOTS.filter(([s]) => want.includes(s)); }
    else if (args.range) { const [a, b] = String(args.range).split('-').map(Number); todo = SHOTS.filter(([s, e]) => e >= a && s <= b); }
    const queue = [...todo].sort((x, y) => (y[1] - y[0]) - (x[1] - x[0]));  // longest first
    console.log('shots to render:', todo.map(([s, e]) => `${s}-${e}`).join(' '));
    await Promise.all(Array.from({ length: Math.min(workers, queue.length) }, async (_, w) => {
      const id = `w${w}`; const page = await openPage(browser);
      while (queue.length) {
        const [s, e] = queue.shift();
        const file = path.join(outDir, 'segments', `seg_${String(s).padStart(3, '0')}-${String(e).padStart(3, '0')}.mp4`);
        const sink = ffmpegSink(file); sinks.set(id, sink.write);
        for (let f = s; f <= e; f++) {
          await page.evaluate(async ([f, id]) => { await NML.renderFrame(f); const px = NML.readPixels(); const r = await fetch(`/frame?w=${id}&f=${f}`, { method: 'POST', body: px }); if (!r.ok) throw new Error(await r.text()); }, [f, id]);
          if ((f - s) % 25 === 0) console.log(`${id} frame ${f} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
        }
        await sink.end(); console.log(`${id} shot ${s}-${e} done (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
      }
      await page.close();
    }));
    {
      // concat every segment covering 0..749 in order
      const segs = new Set(fs.readdirSync(path.join(outDir, 'segments')));
      const cover = SHOTS.map(([s, e]) => `seg_${String(s).padStart(3, '0')}-${String(e).padStart(3, '0')}.mp4`);
      const missing = cover.filter((x) => !segs.has(x));
      if (missing.length) console.log('not joining yet, missing segments:', missing.join(' '));
      else {
      fs.writeFileSync(path.join(outDir, 'segments.txt'), cover.map((x) => `file 'segments/${x}'`).join('\n') + '\n');
      await new Promise((res, rej) => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(outDir, 'segments.txt'), '-c', 'copy', '-movflags', '+faststart', path.join(outDir, 'video.tmp.mp4')], { stdio: 'inherit' })
        .on('close', (c) => (c === 0 ? (fs.renameSync(path.join(outDir, 'video.tmp.mp4'), path.join(outDir, 'video.mp4')), res()) : rej(new Error('concat ' + c)))));
      console.log('wrote build/video.mp4 from', cover.join(' + '));
      }
    }
  }
} finally {
  await browser.close(); server.close();
  console.log(`elapsed ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
