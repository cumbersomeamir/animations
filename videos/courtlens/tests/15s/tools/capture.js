'use strict';
// Deterministic frame capture of src/diagram.html with the preinstalled Playwright Chromium.
// The page exposes one GSAP master timeline; window.seek(t) freezes it at t (skill "?t=N" contract).
// Usage: node tools/capture.js video <out.mp4> | stills <dir> <t1,t2,..> | cues <out.json>
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const FPS = 30, DUR = 15, N = DUR * FPS;

function captions() {
  const mp = path.join(ROOT, 'build/vo/manifest.json');
  if (!fs.existsSync(mp)) return [];
  const man = JSON.parse(fs.readFileSync(mp, 'utf8'));
  const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, '');
  return man.map((m) => {
    const text = m.text;
    const tw = text.split(' ');
    const sayW = (m.say || m.text).split(' ');
    const asr = m.asr.words; // [word, start, end] relative to line start
    const times = sayW.length === asr.length ? asr.map((w) => w[1]) : sayW.map((_, i) => (i / sayW.length) * m.duration);
    const words = [];
    let j = 0, c = 0;
    for (const w of tw) {
      const first = j;
      let acc = '';
      while (j < sayW.length && acc.length < norm(w).length) { acc += norm(sayW[j]); j++; }
      words.push({ start: m.start + (times[first] ?? m.duration), startChar: c, endChar: c + w.length });
      c += w.length + 1;
    }
    let split = 0;
    if (text.length > 34) {
      let best = 1e9;
      for (let i = 0; i < text.length; i++) if (text[i] === ' ') { const v = Math.max(i, text.length - i - 1); if (v < best) { best = v; split = i; } }
    }
    return { id: m.id, text, start: m.start, end: m.end, words, split, hide: m.id === 'v5' };
  });
}

async function open() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + path.join(ROOT, 'src/diagram.html') + '?render=1');
  const info = await page.evaluate((c) => window.boot(c), captions());
  if (errors.length) { console.error('PAGE ERRORS:', errors); process.exit(1); }
  return { browser, page, info };
}

(async () => {
  const [mode, a, b] = process.argv.slice(2);
  const { browser, page, info } = await open();
  console.log('timeline duration', info.duration.toFixed(3), 's; cues', info.cues.length);
  if (mode === 'cues') fs.writeFileSync(a, JSON.stringify({ duration: info.duration, cues: info.cues }, null, 1));
  else if (mode === 'stills') {
    fs.mkdirSync(a, { recursive: true });
    for (const t of b.split(',').map(Number)) {
      await page.evaluate((tt) => window.seek(tt), t);
      await page.screenshot({ path: path.join(a, `t${t.toFixed(2).padStart(5, '0')}.png`) });
    }
  } else if (mode === 'video') {
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS), '-movflags', '+faststart', a], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = 0; f < N; f++) {
      await page.evaluate((tt) => window.seek(tt), f / FPS);
      const png = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
      if (f % 90 === 0) console.log(`frame ${f}/${N} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    }
    ff.stdin.end();
    await new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg ' + c)))));
    console.log('video ->', a, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
