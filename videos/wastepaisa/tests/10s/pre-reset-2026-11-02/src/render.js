#!/usr/bin/env node
// node src/render.js video <out.mp4> | stills <dir> t1 t2 ...
// Renders 120 unique stepped frames (12 fps stop motion) and encodes 300 delivery frames at 30 fps.
const fs = require('fs'), path = require('path'), { spawn } = require('child_process'); const { chromium } = require('playwright'); const serve = require('./serve');
(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const srv = await serve(); const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.error('[pageerror]', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
  await p.goto(`http://127.0.0.1:${srv.address().port}/tests/10s/pre-reset-2026-11-02/src/scene.html`);
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const shot = async (t) => { const cap = await p.evaluate((tt) => window.renderAt(tt), t); const d = await p.evaluate(() => document.getElementById('c').toDataURL('image/png')); return { png: Buffer.from(d.split(',')[1], 'base64'), cap }; };
  if (mode === 'stills') { fs.mkdirSync(out, { recursive: true }); for (const t of rest) fs.writeFileSync(path.join(out, `t${(+t).toFixed(2).padStart(5, '0')}.png`), (await shot(+t)).png); }
  else {
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '12', '-c:v', 'png', '-i', '-', '-vf', 'fps=30', '-frames:v', '300',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const caps = []; const t0 = Date.now();
    for (let s = 0; s < 120; s++) { const r = await shot(s / 12); caps.push({ step: s, t: +(s / 12).toFixed(3), cap: r.cap }); if (!ff.stdin.write(r.png)) await new Promise((rr) => ff.stdin.once('drain', rr)); }
    ff.stdin.end(); await new Promise((rr) => ff.on('close', rr));
    fs.writeFileSync(path.join(path.dirname(out), 'caption-bounds.json'), JSON.stringify(caps, null, 1));
    console.log(`120 steps -> ${out} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  await b.close(); srv.close();
})();
