#!/usr/bin/env node
// Deterministic frame renderer: serves the pilot folder on localhost, opens the
// scene in headless Chromium (Playwright, preinstalled), sets t = frame / fps,
// screenshots each frame and pipes PNGs into FFmpeg.
//
// Usage:
//   node src/render.js video  <out.mp4> [--from F] [--to F]   (video only, no audio)
//   node src/render.js stills <outDir> t1 t2 ...              (PNG stills at times)
//   node src/render.js sheet  <outDir>                         (character sheet cells)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const APP_ASSETS = path.resolve(ROOT, '..', '..', 'assets');
const script = JSON.parse(fs.readFileSync(path.join(ROOT, 'script.json'), 'utf8'));
const W = script.width, H = script.height, FPS = script.fps;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.css': 'text/css' };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      // /app-assets/* maps to the app's approved assets (icon), everything else to the pilot folder
      const base = u.startsWith('/app-assets/') ? APP_ASSETS : ROOT;
      const f = path.join(base, u.startsWith('/app-assets/') ? u.slice('/app-assets'.length) : u);
      if (!f.startsWith(base) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

async function open(mode) {
  const srv = await serve();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${srv.address().port}/src/index.html?mode=${mode}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  page.__cdp = await page.context().newCDPSession(page);
  return { srv, browser, page };
}

// Lossless PNG capture of the composited page (WebGL canvas + DOM overlay).
async function frame(page, t) {
  await page.evaluate((tt) => window.renderAt(tt), t);
  const r = await page.__cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
  return Buffer.from(r.data, 'base64');
}

async function main() {
  const [mode, out, ...rest] = process.argv.slice(2);
  if (mode === 'video') {
    const total = Math.round(script.duration * FPS);
    const arg = (k, d) => { const i = rest.indexOf(k); return i >= 0 ? parseInt(rest[i + 1], 10) : d; };
    const from = arg('--from', 0), to = arg('--to', total);
    const { srv, browser, page } = await open('video');
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    const SAFE = 40, bounds = { safe_margin_px: SAFE, frames_checked: 0, violations: [], max_extent: { x0: W, y0: H, x1: 0, y1: 0 } };
    for (let f = from; f < to; f++) {
      const png = await frame(page, f / FPS);
      const rects = await page.evaluate(() => window.overlayRects());
      bounds.frames_checked++;
      for (const r of rects) {
        const m = bounds.max_extent;
        m.x0 = Math.min(m.x0, r.x0); m.y0 = Math.min(m.y0, r.y0); m.x1 = Math.max(m.x1, r.x1); m.y1 = Math.max(m.y1, r.y1);
        if (r.x0 < SAFE || r.y0 < SAFE || r.x1 > W - SAFE || r.y1 > H - SAFE) bounds.violations.push({ frame: f, ...r });
      }
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
      if (f % 30 === 0) process.stderr.write(`frame ${f}/${to} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    fs.writeFileSync(out.replace(/\.mp4$/, '') + '.text-bounds.json', JSON.stringify(bounds, null, 1));
    console.log(`text bounds: ${bounds.frames_checked} frames, ${bounds.violations.length} safe-margin violations`);
    await browser.close(); srv.close();
    console.log(`rendered ${to - from} frames -> ${out} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  } else if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    const { srv, browser, page } = await open('video');
    for (const ts of rest) {
      const t = parseFloat(ts);
      fs.writeFileSync(path.join(out, `t${t.toFixed(2).padStart(5, '0')}.png`), await frame(page, t));
    }
    await browser.close(); srv.close();
  } else if (mode === 'sheet') {
    fs.mkdirSync(out, { recursive: true });
    const { srv, browser, page } = await open('sheet');
    const cells = await page.evaluate(() => window.sheetCells());
    for (let i = 0; i < cells.length; i++) {
      await page.evaluate((k) => window.renderSheetCell(k), i);
      const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 720, height: 900 } });
      fs.writeFileSync(path.join(out, `${String(i).padStart(2, '0')}-${cells[i]}.png`), png);
    }
    await browser.close(); srv.close();
    console.log(`sheet cells: ${cells.length}`);
  } else {
    console.error('usage: render.js video|stills|sheet ...'); process.exit(2);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
