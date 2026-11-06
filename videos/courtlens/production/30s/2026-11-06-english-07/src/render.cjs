// Deterministic frame renderer: headless Chromium (pre-installed Playwright) draws scene.js at t = frame/fps.
// Usage: node render.cjs frames <outDir> [workers]        -> f_0000.png ... f_0899.png
//        node render.cjs stills <outDir> t1,t2,...         -> still_<t>.png
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = __dirname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.otf': 'font/otf', '.woff2': 'font/woff2', '.png': 'image/png' };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p)) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(rsp);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}
(async () => {
  const [mode, outDir, arg] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'timeline.json')));
  const srv = await serve(); const url = `http://127.0.0.1:${srv.address().port}/index.html`;
  const browser = await chromium.launch();
  const open = async () => {
    const page = await browser.newPage({ viewport: { width: tl.width, height: tl.height }, deviceScaleFactor: 1 });
    page.on('pageerror', e => console.error('pageerror', e));
    await page.goto(url);
    await page.waitForFunction('window.READY || window.RENDER_ERROR');
    const err = await page.evaluate('window.RENDER_ERROR'); if (err) throw new Error(err);
    return page;
  };
  const shot = async (page, t, file) => { await page.evaluate(t => window.renderAt(t), t); await page.screenshot({ path: file, type: 'png' }); };
  const t0 = Date.now();
  if (mode === 'stills') {
    const page = await open();
    for (const t of arg.split(',').map(Number)) await shot(page, t, path.join(outDir, `still_${t.toFixed(2)}.png`));
  } else {
    const n = Math.round(tl.duration * tl.fps), workers = parseInt(arg || '4');
    let done = 0;
    await Promise.all([...Array(workers)].map(async (_, w) => {
      const page = await open();
      for (let f = w; f < n; f += workers) {
        await shot(page, f / tl.fps, path.join(outDir, `f_${String(f).padStart(4, '0')}.png`));
        if (++done % 100 === 0) console.log(`${done}/${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
    }));
  }
  await browser.close(); srv.close();
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
})().catch(e => { console.error(e); process.exit(1); });
