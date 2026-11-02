// Deterministic frame renderer: drives src/index.html in headless Chromium (pre-installed Playwright)
// and writes PNG frames (film) or a single PNG (sheet / stills).
// Usage:
//   node build/render.mjs sheet <out.png>
//   node build/render.mjs film <framesDir> [startFrame] [endFrame] [step]
//   node build/render.mjs stills <outDir> <t1,t2,...>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [mode = 'film', out = 'frames', a3, a4, a5] = process.argv.slice(2);
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/timeline.json'), 'utf8'));

const WEBROOT = path.resolve(ROOT, '..', '..');   // videos/media-diet (so the page can reach ../assets/icon.png)
const { server, port } = await serve(WEBROOT);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--force-color-profile=srgb'] });
const isSheet = mode === 'sheet';
const vw = isSheet ? 1920 : TL.width, vh = isSheet ? 1240 : TL.height;
const page = await browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.type(), m.text()); });
page.on('pageerror', (e) => { errors.push(String(e)); console.log('[pageerror]', e); });
await page.goto(`http://127.0.0.1:${port}/education/pilot-01/src/index.html?mode=${isSheet ? 'sheet' : 'film'}`);
await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 120000 });
if (errors.length) { console.error('page errors, aborting'); process.exit(1); }

if (isSheet) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out });
  console.log('wrote', out);
} else if (mode === 'film') {
  fs.mkdirSync(out, { recursive: true });
  const total = Math.round(TL.duration * TL.fps);
  const start = Number(a3 ?? 0), end = Number(a4 ?? total - 1), step = Number(a5 ?? 1);
  const t0 = Date.now();
  const bounds = [];
  for (let f = start; f <= end; f += step) {
    await page.evaluate((fr) => window.renderFrame(fr), f);
    await page.screenshot({ path: path.join(out, `f${String(f).padStart(4, '0')}.png`) });
    bounds.push({ f, items: await page.evaluate(() => window.__textBounds()) });
    if (f % 30 === 0) console.log(`frame ${f}/${end}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  // text-bounds QA: every visible text element must sit inside the frame with a 36 px margin
  const M = 36, viol = [];
  for (const b of bounds) for (const it of b.items) if (it.x0 < M || it.y0 < M || it.x1 > vw - M || it.y1 > vh - M) viol.push({ f: b.f, ...it });
  fs.mkdirSync(path.join(ROOT, 'qa'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'qa', 'text-bounds.json'), JSON.stringify({ margin_px: M, frames: bounds.length, violations: viol, per_frame: bounds }, null, 0));
  console.log(`text-bounds: ${viol.length} violations (margin ${M}px)`);
} else if (mode === 'stills') {
  fs.mkdirSync(out, { recursive: true });
  for (const t of a3.split(',').map(Number)) {
    const f = Math.round(t * TL.fps);
    await page.evaluate((fr) => window.renderFrame(fr), f);
    await page.screenshot({ path: path.join(out, `t${t.toFixed(2)}.png`) });
  }
}
await browser.close();
server.close();
