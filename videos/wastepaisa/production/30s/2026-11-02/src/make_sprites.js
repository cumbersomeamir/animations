const fs = require('fs'), path = require('path'); const { chromium } = require('playwright'); const serve = require('./serve');
(async () => {
  const srv = await serve(); const OUT = path.resolve(__dirname, '../sprites');
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 700, height: 900 } });
  p.on('pageerror', (e) => console.error(e.message));
  await p.goto(`http://127.0.0.1:${srv.address().port}/production/30s/2026-11-02/src/sprites.html`);
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const meta = {};
  for (const n of await p.evaluate(() => window.poseNames())) {
    const r = await p.evaluate((nn) => window.renderPose(nn), n);
    fs.writeFileSync(path.join(OUT, `tinku-${n}.png`), Buffer.from(r.dataURL.split(',')[1], 'base64'));
    meta[n] = { feet: r.feet, handL: r.handL, handR: r.handR };
  }
  fs.writeFileSync(path.join(OUT, 'sprites.json'), JSON.stringify(meta, null, 1));
  console.log(JSON.stringify(meta)); await b.close(); srv.close();
})();
