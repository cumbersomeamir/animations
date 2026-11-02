// Deterministic frame renderer for the Canvas-2D film: drives src/index.html in headless Chromium (pre-installed
// Playwright), writes PNG frames and a per-frame text-bounds log (window.TEXTS) for the caption/safe-area check.
// Usage: node build/render.mjs film <framesDir> [start] [end] [step]   |   node build/render.mjs stills <dir> <t1,t2,...>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEBROOT = path.resolve(ROOT, '..', '..', '..');            // videos/media-diet (page reaches ../assets/icon.png)
const REL = path.relative(WEBROOT, ROOT).split(path.sep).join('/');
const [mode = 'film', out = 'frames', a3, a4, a5] = process.argv.slice(2);
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/timeline.json'), 'utf8'));
const { server, port } = await serve(WEBROOT);
const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: TL.width, height: TL.height }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') { errors.push(m.text()); console.log('[page]', m.text()); } });
page.on('pageerror', (e) => { errors.push(String(e)); console.log('[pageerror]', e); });
await page.goto(`http://127.0.0.1:${port}/${REL}/src/index.html`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
if (errors.length) { console.error('page errors, aborting'); process.exit(1); }
const canvas = await page.$('#c');
fs.mkdirSync(out, { recursive: true });
if (mode === 'film') {
  const total = Math.round(TL.duration * TL.fps);
  const start = Number(a3 ?? 0), end = Number(a4 ?? total - 1), step = Number(a5 ?? 1);
  const t0 = Date.now(); const log = [];
  for (let f = start; f <= end; f += step) {
    await page.evaluate((fr) => window.render(fr), f);
    await canvas.screenshot({ path: path.join(out, `f${String(f).padStart(4, '0')}.png`) });
    log.push({ f, items: await page.evaluate(() => window.TEXTS()) });
    if (f % 60 === 0) console.log(`frame ${f}/${end}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  const qaFile = path.join(ROOT, 'qa', 'text-bounds-raw.json');
  fs.mkdirSync(path.dirname(qaFile), { recursive: true });
  let all = log;
  if (fs.existsSync(qaFile) && (start > 0 || end < total - 1)) all = [...JSON.parse(fs.readFileSync(qaFile, 'utf8')).filter((b) => !log.some((n) => n.f === b.f)), ...log].sort((x, y) => x.f - y.f);
  fs.writeFileSync(qaFile, JSON.stringify(all));
  console.log(`rendered ${log.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
} else {
  for (const t of a3.split(',').map(Number)) {
    await page.evaluate((fr) => window.render(fr), Math.round(t * TL.fps));
    await canvas.screenshot({ path: path.join(out, `t${t.toFixed(2)}.png`) });
  }
}
await browser.close(); server.close();
