// Phone screen artwork (original, minimal; no real phone's interface): a home screen of plain rounded icons; a touch
// that registers draws a lime ripple and opens a simple app card; a touch that does not register draws only a faint
// grey ring (the attempt) and nothing opens.
import { PAL } from './lowpoly.js';

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
export const ICON = { u: 0.37, v: 0.42 };   // the icon that gets tapped (screen UV)
const COLS = ['#7E8F6A', '#C9673F', '#6E8FA8', '#B59A5A', '#8A6E9E', '#5E7F72', '#A8714E', '#6F8A4E'];

/** s: { app 0..1, ring: { u (0..1 progress), ok } | null } */
export function drawHome(ctx, W, H, s) {
  const g = ctx, k = W / 540;
  g.save(); g.setTransform(k, 0, 0, k, 0, 0);
  const w = 540, h = 1140;
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#26301F'); bg.addColorStop(1, '#151A11');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = PAL.paper; for (let i = 0; i < 4; i++) { rr(g, 30 + i * 13, 38 - i * 6, 8, 8 + i * 6, 2); g.fill(); }
  rr(g, 462, 20, 46, 22, 6); g.lineWidth = 3; g.strokeStyle = PAL.paper; g.stroke(); rr(g, 466, 24, 26, 14, 3); g.fill();
  g.fillStyle = 'rgba(248,250,243,0.85)'; g.font = '600 64px Fredoka'; g.textAlign = 'center'; g.fillText('10:08', 270, 170);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const x = 58 + c * 112, y = 280 + r * 140;
    rr(g, x, y, 88, 88, 24); g.fillStyle = COLS[(r * 4 + c) % COLS.length]; g.fill();
    g.fillStyle = 'rgba(248,250,243,0.55)'; g.beginPath(); g.arc(x + 44, y + 44, 18, 0, Math.PI * 2); g.fill();
  }
  rr(g, 40, 950, 460, 120, 40); g.fillStyle = 'rgba(248,250,243,0.12)'; g.fill();
  for (let c = 0; c < 4; c++) { rr(g, 66 + c * 112, 966, 88, 88, 24); g.fillStyle = COLS[(c + 3) % COLS.length]; g.fill(); }
  const cx = ICON.u * 540, cy = ICON.v * 1140;
  if (s.ring && s.ring.u > 0 && s.ring.u < 1) {
    const u = s.ring.u;
    if (s.ring.ok) { g.strokeStyle = `rgba(199,243,107,${1 - u})`; g.lineWidth = 10; g.beginPath(); g.arc(cx, cy, 30 + 120 * u, 0, Math.PI * 2); g.stroke(); }
    else { g.strokeStyle = `rgba(200,200,190,${0.45 * (1 - u)})`; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, 46 - 10 * u, 0, Math.PI * 2); g.stroke(); }
  }
  if (s.app > 0.01) {   // the app opens out of its icon
    const a = s.app, x0 = cx - 44 + (0 - (cx - 44)) * a, y0 = cy - 44 + (0 - (cy - 44)) * a, ww = 88 + (w - 88) * a, hh = 88 + (h - 88) * a;
    g.save(); rr(g, x0, y0, ww, hh, 24 * (1 - a) + 2); g.clip();
    g.fillStyle = '#F8FAF3'; g.fillRect(x0, y0, ww, hh);
    g.fillStyle = PAL.lime; g.fillRect(x0, y0, ww, hh * 0.16);
    g.fillStyle = PAL.ink; g.globalAlpha = a;
    g.font = '600 56px Fredoka'; g.textAlign = 'left'; g.fillText('Notes', 50, 150);
    for (let i = 0; i < 5; i++) { rr(g, 40, 230 + i * 150, 460, 120, 22); g.fillStyle = i === 0 ? 'rgba(199,243,107,0.45)' : 'rgba(32,37,27,0.08)'; g.fill(); g.fillStyle = 'rgba(32,37,27,0.5)'; rr(g, 70, 262 + i * 150, 260, 18, 9); g.fill(); rr(g, 70, 298 + i * 150, 360, 14, 7); g.fill(); }
    g.restore();
  }
  g.fillStyle = 'rgba(248,250,243,0.7)'; rr(g, 200, 1110, 140, 9, 4.5); g.fill();
  g.restore();
}
