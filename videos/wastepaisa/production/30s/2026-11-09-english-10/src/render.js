#!/usr/bin/env node
// node src/render.js video <out.mp4>   -> 900 frames rendered at 30 fps (smooth camera travel), x264 veryfast yuv420p
// node src/render.js stills <dir> t1 t2 ...
// node src/render.js captions            -> qa/caption-bounds.json only (same renderAt as the video, no frames encoded)
const fs = require('fs'), path = require('path'), { spawn } = require('child_process'); const { chromium } = require('playwright'); const serve = require('./serve');
(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const srv = await serve(); const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.error('[pageerror]', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
  await p.goto(`http://127.0.0.1:${srv.address().port}/production/30s/2026-11-09-english-10/src/scene.html`);
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const shot = async (t) => { const info = await p.evaluate((tt) => window.renderAt(tt), t); const d = await p.evaluate(() => document.getElementById('c').toDataURL('image/png')); return { png: Buffer.from(d.split(',')[1], 'base64'), info }; };
  if (mode === 'captions') { const log = []; for (let f = 0; f < 900; f++) log.push({ frame: f, t: +(f / 30).toFixed(3), ...(await p.evaluate((tt) => window.renderAt(tt), f / 30)) });
    fs.writeFileSync(path.join(__dirname, '..', 'qa', 'caption-bounds.json'), JSON.stringify(log, null, 1)); console.log('caption log for 900 frames written'); }
  else if (mode === 'stills') { fs.mkdirSync(out, { recursive: true }); for (const t of rest) fs.writeFileSync(path.join(out, `t${(+t).toFixed(2).padStart(5, '0')}.png`), (await shot(+t)).png); }
  else {
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-frames:v', '900',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const log = []; const t0 = Date.now();
    for (let f = 0; f < 900; f++) { const r = await shot(f / 30); log.push({ frame: f, t: +(f / 30).toFixed(3), ...r.info }); if (!ff.stdin.write(r.png)) await new Promise((rr) => ff.stdin.once('drain', rr)); if (f % 150 === 0) process.stderr.write(`frame ${f} ${((Date.now() - t0) / 1000).toFixed(0)}s\n`); }
    ff.stdin.end(); await new Promise((rr) => ff.on('close', rr));
    fs.writeFileSync(path.join(__dirname, '..', 'qa', 'caption-bounds.json'), JSON.stringify(log, null, 1));
    console.log(`900 frames -> ${out} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  await b.close(); srv.close();
})();
