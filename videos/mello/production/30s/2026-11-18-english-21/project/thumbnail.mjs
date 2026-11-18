// Vertical thumbnail for mello-30s-english21-01 (1080x1920 PNG), the same composition as frame 0: the performer holding a
// small glowing gold orb (his good news) by a closed laptop while his friend looks at her phone, with "KEEP GOOD NEWS QUIET?".
//   node thumbnail.mjs ../mello-30s-english21-01-thumbnail.png
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { createRequire } from 'node:module'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), APP = path.resolve(HERE, '../../../..'), REL = path.relative(APP, HERE).split(path.sep).join('/');
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '/usr/local/lib/node_modules_global', 'playwright'))); }
const OUT = path.resolve(HERE, process.argv[2] || '../mello-30s-english21-01-thumbnail.png');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = http.createServer((req, res) => { const p = path.join(APP, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', e => { console.error('[pageerror]', e.message); process.exitCode = 1; });
await page.goto(`http://127.0.0.1:${server.address().port}/${REL}/scene/index.html`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
await page.evaluate(() => {
  // the opening shot itself (frame 0), with the hook words set larger
  window.renderAt(0.0);
  document.getElementById('cap').style.display = 'none'; document.getElementById('lock').style.display = 'none';
  const d = document.createElement('div');
  d.style.cssText = 'position:absolute;left:100px;top:175px;width:800px;text-align:center;font-family:"Instrument Serif",serif;color:#191632;line-height:0.86;letter-spacing:-0.01em;';
  d.innerHTML = '<div style="font-size:170px">KEEP GOOD NEWS</div><div style="font-size:170px;color:#633BFE">QUIET?</div>';
  document.getElementById('stage').appendChild(d);
});
await page.waitForTimeout(150);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
await browser.close(); server.close();
console.log('thumbnail', OUT);
