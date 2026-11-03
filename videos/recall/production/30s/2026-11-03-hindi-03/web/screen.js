// Phone screen artwork for Hindi episode 03: a generic sketch app (not Recall's UI). The finger's stroke is drawn
// where it touches; water drops on the glass add ghost dots at the drops' own positions (the illustrated
// false touches) and break the real stroke; after drying, the stroke is clean.
import { PAL } from './lowpoly.js';

export const SW = 540, SH = 1140;
const HFONT = '"Baloo 2"';
/** Drops on the screen glass, in screen UV (0..1); the same UVs place the 3D drop meshes. */
export const SCREEN_DROPS = [[0.27, 0.36, 1.0], [0.7, 0.3, 0.8], [0.62, 0.62, 1.1], [0.3, 0.7, 0.9], [0.5, 0.48, 0.7]];

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/** Wavy line the wet finger tries to draw (UV points). */
export function wetPath(u) { return [0.2 + 0.6 * u, 0.5 + 0.09 * Math.sin(u * Math.PI * 2.5)]; }
/** Smiley drawn by the dry finger: circle, two eyes, smile (UV), total param 0..1. */
export function cleanPath(u) {
  const cx = 0.5, cy = 0.5, R = 0.24;
  if (u < 0.6) { const a = -Math.PI / 2 + (u / 0.6) * Math.PI * 2; return [cx + R * Math.cos(a), cy + R * Math.sin(a) * 0.47]; }
  if (u < 0.68) return [cx - 0.08, cy - 0.04];
  if (u < 0.76) return [cx + 0.08, cy - 0.04];
  const k = (u - 0.76) / 0.24, a = Math.PI * (0.15 + 0.7 * k);
  return [cx + 0.13 * Math.cos(a), cy + 0.03 + 0.06 * Math.sin(a)];
}

/** s = { mode: 'wet'|'clean'|'idle', p (stroke progress 0..1), ghosts (0..1 per drop), t } */
export function drawScreen(phone, s) {
  const g = phone.ctx, W = SW, H = SH;
  g.fillStyle = '#20251B'; g.fillRect(0, 0, W, H);
  // status + app bar
  g.fillStyle = '#FFFFFF'; g.font = `600 30px ${HFONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('10:24', 28, 36);
  g.fillStyle = '#2F3628'; g.fillRect(0, 70, W, 96);
  g.fillStyle = PAL.lime; rr(g, 26, 92, 52, 52, 14); g.fill();
  g.strokeStyle = '#20251B'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(40, 132); g.lineTo(64, 106); g.stroke();
  g.fillStyle = '#F8FAF3'; g.font = `700 46px ${HFONT}`; g.fillText('स्केच', 96, 120);
  for (let i = 0; i < 3; i++) { g.fillStyle = ['#C7F36B', '#F08A5D', '#F8FAF3'][i]; g.beginPath(); g.arc(W - 150 + i * 46, 118, 15, 0, Math.PI * 2); g.fill(); }
  // canvas
  const X0 = 24, Y0 = 190, CW = W - 48, CH = H - 230;
  g.fillStyle = '#FBF8F1'; rr(g, X0, Y0, CW, CH, 26); g.fill();
  const P = ([u, v]) => [u * W, v * H];
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (s.mode === 'wet' && s.p > 0) {
    // the real stroke: broken and jittery where the drops confuse the reading
    g.strokeStyle = '#20251B'; g.lineWidth = 16;
    const N = Math.floor(80 * s.p);
    for (let k = 1; k <= N; k++) {
      const u0 = (k - 1) / 80, u1 = k / 80;
      if (Math.sin(k * 1.7) > 0.55) continue;                   // gaps: missed readings
      const [x0, y0] = P(wetPath(u0)), [x1, y1] = P(wetPath(u1)), j = 9 * Math.sin(k * 3.1);
      g.beginPath(); g.moveTo(x0, y0 + j * 0.5); g.lineTo(x1, y1 - j * 0.5); g.stroke();
    }
  }
  if (s.mode === 'clean' && s.p > 0) {
    g.strokeStyle = '#20251B'; g.lineWidth = 16;
    const seg = (a, b) => { g.beginPath(); for (let k = 0; k <= 40; k++) { const u = a + (b - a) * k / 40; if (u > s.p) break; const [x, y] = P(cleanPath(u)); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); };
    seg(0, 0.6);
    if (s.p > 0.6) { const [x, y] = P(cleanPath(0.64)); g.fillStyle = '#20251B'; g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.fill(); }
    if (s.p > 0.68) { const [x, y] = P(cleanPath(0.72)); g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.fill(); }
    if (s.p > 0.76) seg(0.76, 1.0);
  }
  // ghost touches: dots + ripples at the drops' positions
  (s.ghosts || []).forEach((a, i) => {
    if (a <= 0.01) return;
    const [x, y] = P(SCREEN_DROPS[i]);
    g.save(); g.globalAlpha = Math.min(1, a);
    g.fillStyle = '#E0603A'; g.beginPath(); g.arc(x, y, 18, 0, Math.PI * 2); g.fill();
    const rip = (s.t * 1.6 + i * 0.37) % 1;
    g.strokeStyle = '#E0603A'; g.lineWidth = 5; g.globalAlpha = Math.min(1, a) * (1 - rip); g.beginPath(); g.arc(x, y, 22 + 40 * rip, 0, Math.PI * 2); g.stroke();
    g.restore();
  });
  phone.tex.needsUpdate = true;
}
