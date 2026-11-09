// Phone screen artwork (original, minimal; no real phone's interface): a bright reading screen. `bright` (0..1) is the share
// of the screen's polarized light that gets through the viewer's polarized lens (1 = full, 0 = black).
import { PAL } from './lowpoly.js';

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/** s: { bright 0..1 } */
export function drawReader(ctx, W, H, s) {
  const g = ctx, k = W / 540;
  g.save(); g.setTransform(k, 0, 0, k, 0, 0);
  const w = 540, h = 1140;
  g.fillStyle = '#F8FAF3'; g.fillRect(0, 0, w, h);
  g.fillStyle = PAL.lime; g.fillRect(0, 0, w, 150);
  g.fillStyle = PAL.ink; for (let i = 0; i < 4; i++) { rr(g, 30 + i * 13, 38 - i * 6, 8, 8 + i * 6, 2); g.fill(); }
  g.font = '600 52px Fredoka'; g.textAlign = 'left'; g.fillText('Field notes', 40, 120);
  rr(g, 40, 200, 460, 260, 24); g.fillStyle = '#88A35E'; g.fill();
  g.fillStyle = '#E9D6A6'; g.beginPath(); g.arc(400, 270, 40, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6F8A4E'; g.beginPath(); g.moveTo(40, 420); g.lineTo(180, 320); g.lineTo(300, 400); g.lineTo(400, 330); g.lineTo(500, 400); g.lineTo(500, 460); g.lineTo(40, 460); g.closePath(); g.fill();
  g.fillStyle = 'rgba(32,37,27,0.75)';
  for (let i = 0; i < 9; i++) { rr(g, 40, 500 + i * 60, i % 3 === 2 ? 300 : 460, 22, 11); g.fill(); }
  g.fillStyle = 'rgba(32,37,27,0.5)'; rr(g, 200, 1110, 140, 9, 4.5); g.fill();
  const b = Math.max(0, Math.min(1, s.bright));
  if (b < 0.999) { g.fillStyle = `rgba(6,8,5,${0.96 * (1 - b)})`; g.fillRect(0, 0, w, h); }
  g.restore();
}
