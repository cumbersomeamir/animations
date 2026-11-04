// Pixel-exact caption ink bounds: renders each caption chunk exactly as the film does (Devanagari font + Inter fallback) and measures the ink bbox.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import './src/fonts_hi.mjs';
import { CAP } from './src/caplayout.mjs';
const caps = JSON.parse(fs.readFileSync('captions.json'));
const cv = createCanvas(1080, 1920), ctx = cv.getContext('2d'); const rows = []; let ok = true;
for (const c of caps) {
  ctx.clearRect(0, 0, 1080, 1920); ctx.font = `${CAP.size}px ${CAP.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff';
  if (c.l.length === 1) ctx.fillText(c.l[0], 540, CAP.base1); else { ctx.fillText(c.l[0], 540, CAP.base1); ctx.fillText(c.l[1], 540, CAP.base2); }
  // line-collision check: ink of line 1 alone vs line 2 alone must not overlap vertically
  const d = ctx.getImageData(0, 300, 1080, 220).data; let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  for (let y = 0; y < 220; y++) for (let x = 0; x < 1080; x++) if (d[(y * 1080 + x) * 4 + 3] > 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y + 300); y1 = Math.max(y1, y + 300); }
  let gap = null;
  if (c.l.length === 2) {
    const ink = (txt, base) => { ctx.clearRect(0, 0, 1080, 1920); ctx.fillText(txt, 540, base); const e = ctx.getImageData(0, 300, 1080, 220).data; let a = 1e9, b = -1; for (let y = 0; y < 220; y++) for (let x = 0; x < 1080; x++) if (e[(y * 1080 + x) * 4 + 3] > 40) { a = Math.min(a, y + 300); b = Math.max(b, y + 300); } return [a, b]; };
    gap = ink(c.l[1], CAP.base2)[0] - ink(c.l[0], CAP.base1)[1];
  }
  const pass = y0 >= CAP.yMin && y1 <= CAP.yMax && x0 >= 90 && x1 <= 990 && (gap === null || gap >= 4); ok = ok && pass;
  rows.push({ id: c.id, a: c.a, b: c.b, lines: c.l, ink: { x0, x1, y0, y1 }, lineGap: gap, pass });
}
let overlap = false; for (let i = 1; i < caps.length; i++) if (caps[i].a < caps[i - 1].b) overlap = true;
fs.mkdirSync('qa', { recursive: true });
fs.writeFileSync('qa/caption_bounds.json', JSON.stringify({ rule: 'ink y in [340,520], x in [90,990], 2 lines >= 4 px apart', allPass: ok, handoffOverlap: overlap, rows }, null, 1));
rows.forEach(r => console.log(r.id, JSON.stringify(r.ink), 'gap', r.lineGap, r.pass ? 'OK' : 'FAIL')); console.log('allPass', ok, 'handoffOverlap', overlap);
