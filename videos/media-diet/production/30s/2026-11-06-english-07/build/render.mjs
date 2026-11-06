// Deterministic frame renderer (three.js paper diorama + 2-D caption overlay) in headless Chromium (pre-installed
// Playwright, SwiftShader WebGL). Writes PNG frames + a per-frame overlay text log for the caption/safe-area check.
// Usage: node build/render.mjs film <framesDir> [start] [end]   |   node build/render.mjs stills <dir> <t1,t2,...>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEBROOT = path.resolve(ROOT, '..', '..', '..');
const REL = path.relative(WEBROOT, ROOT).split(path.sep).join('/');
const [mode = 'film', out = 'frames', a3, a4] = process.argv.slice(2);
const TL = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/timeline.json'), 'utf8'));
const { server, port } = await serve(WEBROOT);
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: TL.width, height: TL.height }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') { errors.push(m.text()); console.log('[page]', m.text()); } });
page.on('pageerror', (e) => { errors.push(String(e)); console.log('[pageerror]', e); });
await page.goto(`http://127.0.0.1:${port}/${REL}/src/index.html`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
if (errors.length) { console.error('page errors, aborting'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
if (mode === 'film') {
  const total = Math.round(TL.duration * TL.fps); const start = Number(a3 ?? 0), end = Number(a4 ?? total - 1);
  const t0 = Date.now(); const log = [];
  for (let f = start; f <= end; f++) {
    await page.evaluate((fr) => window.render(fr), f);
    await page.screenshot({ path: path.join(out, `f${String(f).padStart(4, '0')}.png`) });
    log.push({ f, items: await page.evaluate(() => window.TEXTS()) });
    if (f % 30 === 0) console.log(`frame ${f}/${end}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  // per-range overlay text log; build/merge_bounds.py merges all ranges into qa/text-bounds-raw.json (latest wins)
  fs.writeFileSync(path.join(out, `_bounds_${String(start).padStart(4, '0')}_${String(end).padStart(4, '0')}_${Date.now()}.json`), JSON.stringify(log));
  console.log(`rendered ${log.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
} else {
  const t0 = Date.now();
  for (const t of a3.split(',').map(Number)) { await page.evaluate((fr) => window.render(fr), Math.round(t * TL.fps)); await page.screenshot({ path: path.join(out, `t${t.toFixed(2)}.png`) }); }
  console.log(`stills in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
await browser.close(); server.close();
