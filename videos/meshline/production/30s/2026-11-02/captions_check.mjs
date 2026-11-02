// Pixel-exact caption ink bounds: renders each caption chunk exactly as the film does and measures the ink bbox.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import '../../../education/pilot-01/src/fonts.mjs';
const caps = JSON.parse(fs.readFileSync('captions.json')); const L = { size: 52, base1: 398, base2: 458 };
const cv = createCanvas(1080, 1920), ctx = cv.getContext('2d'); const rows = []; let ok = true;
for (const c of caps) {
  ctx.clearRect(0, 0, 1080, 1920); ctx.font = `${L.size}px EBold`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
  if (c.l.length === 1) ctx.fillText(c.l[0], 540, 398); else { ctx.fillText(c.l[0], 540, L.base1); ctx.fillText(c.l[1], 540, L.base2); }
  const d = ctx.getImageData(0, 300, 1080, 220).data; let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  for (let y = 0; y < 220; y++) for (let x = 0; x < 1080; x++) if (d[(y * 1080 + x) * 4 + 3] > 40) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y + 300); y1 = Math.max(y1, y + 300); }
  const pass = y0 >= 350 && y1 <= 470 && x0 >= 80 && x1 <= 1000; ok = ok && pass;
  rows.push({ id: c.id, a: c.a, b: c.b, lines: c.l, ink: { x0, x1, y0, y1 }, pass });
}
let overlap = false; for (let i = 1; i < caps.length; i++) if (caps[i].a < caps[i - 1].b) overlap = true;
fs.writeFileSync('qa/caption_bounds.json', JSON.stringify({ rule: 'ink y in [350,470], x in [80,1000]', allPass: ok, handoffOverlap: overlap, rows }, null, 1));
rows.forEach(r => console.log(r.id, JSON.stringify(r.ink), r.pass ? 'OK' : 'FAIL')); console.log('allPass', ok, 'handoffOverlap', overlap);
