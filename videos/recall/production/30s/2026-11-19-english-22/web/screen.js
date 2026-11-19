// Phone screen artwork for english-22: a simple reading app that re-lays itself out in portrait or landscape (auto-rotate), and
// a generic rotation-lock icon (padlock inside a circular arrow) that appears when the lock is switched on. No real app or brand.
import { PAL } from './lowpoly.js';

const FONT = 'Fredoka';
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function picture(g, x, y, w, h) {
  rr(g, x, y, w, h, 24); g.fillStyle = '#88A35E'; g.fill();
  g.fillStyle = '#E9D6A6'; g.beginPath(); g.arc(x + w * 0.78, y + h * 0.27, h * 0.15, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6F8A4E'; g.beginPath(); g.moveTo(x, y + h * 0.85); g.lineTo(x + w * 0.3, y + h * 0.46); g.lineTo(x + w * 0.56, y + h * 0.77); g.lineTo(x + w * 0.78, y + h * 0.5); g.lineTo(x + w, y + h * 0.77); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath(); g.fill();
}
function lines(g, x, y, w, n, step) { g.fillStyle = 'rgba(32,37,27,0.72)'; for (let i = 0; i < n; i++) { rr(g, x, y + i * step, i % 3 === 2 ? w * 0.62 : w, 22, 11); g.fill(); } }
function portrait(g) {   // 540 x 1140
  g.fillStyle = '#F8FAF3'; g.fillRect(0, 0, 540, 1140);
  g.fillStyle = PAL.lime; g.fillRect(0, 0, 540, 150);
  g.fillStyle = PAL.ink; g.font = `600 52px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('Notes', 40, 120);
  picture(g, 40, 200, 460, 280); lines(g, 40, 530, 460, 9, 62);
}
function landscape(g) {   // 1140 x 540
  g.fillStyle = '#F8FAF3'; g.fillRect(0, 0, 1140, 540);
  g.fillStyle = PAL.lime; g.fillRect(0, 0, 1140, 110);
  g.fillStyle = PAL.ink; g.font = `600 50px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('Notes', 40, 82);
  picture(g, 40, 150, 470, 340); lines(g, 560, 160, 540, 6, 58);
}
function lockIcon(g, cx, cy, a, on) {
  g.save(); g.globalAlpha = a; g.translate(cx, cy);
  g.fillStyle = on ? PAL.lime : 'rgba(32,37,27,0.18)'; g.beginPath(); g.arc(0, 0, 46, 0, Math.PI * 2); g.fill();
  g.strokeStyle = PAL.ink; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.arc(0, 0, 31, -0.35 * Math.PI, 1.25 * Math.PI); g.stroke();
  g.beginPath(); g.moveTo(-22, -26); g.lineTo(-12, -33); g.lineTo(-19, -42); g.stroke();
  g.fillStyle = PAL.ink; rr(g, -13, -4, 26, 20, 4); g.fill();
  g.lineWidth = 5; g.beginPath(); g.arc(0, -4, 8, Math.PI, 0); g.stroke();
  g.restore();
}
/** s = { rot (content angle on the screen; -PI/2 = landscape, upright when the phone is turned clockwise), lock (0..1), tap (0..1) } */
export function drawUI(ctx, W, H, s) {
  const g = ctx, k = W / 540, r = s.rot || 0;
  g.save(); g.setTransform(k, 0, 0, k, 0, 0);
  g.fillStyle = '#141412'; g.fillRect(0, 0, 540, 1140);
  const sc = 1 - 0.3 * Math.sin(2 * Math.abs(r));
  g.save(); g.translate(270, 570); g.rotate(r); g.scale(sc, sc);
  if (Math.abs(r) < Math.PI / 4) { g.translate(-270, -570); portrait(g); } else { g.translate(-570, -270); landscape(g); }
  g.restore();
  if ((s.lock || 0) > 0.01) {
    if ((s.tap || 0) > 0.01 && s.tap < 1) { g.save(); g.globalAlpha = 1 - s.tap; g.strokeStyle = PAL.lime; g.lineWidth = 8; g.beginPath(); g.arc(270, 340, 60 + 90 * s.tap, 0, Math.PI * 2); g.stroke(); g.restore(); }
    lockIcon(g, 270, 340, Math.min(1, s.lock * 1.5), s.lock > 0.5);
  }
  g.restore();
}
