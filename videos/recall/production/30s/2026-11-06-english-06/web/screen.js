// Phone screen artwork: an original, minimal dark map (no real app's look) with the location dot and its direction
// beam. The dot never moves (location stays right); only the beam angle / width changes with the compass reading.
import { PAL } from './lowpoly.js';

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/** s: { ang: beam angle in rad (0 = up / north, + = clockwise), width: beam half-angle (rad), pulse: 0..1 dot ping,
 *  ok: 0..1 "steady" tick, glow: 0..1 chip-corner outline (giant phone only) } */
export function drawMap(ctx, W, H, s) {
  const g = ctx, k = W / 540;
  g.save(); g.setTransform(k, 0, 0, k, 0, 0);
  const w = 540, h = 1140;
  g.fillStyle = '#1B2017'; g.fillRect(0, 0, w, h);
  // city blocks between streets
  const cols = [-40, 150, 330, 520], rowsY = [70, 300, 560, 760, 1000];
  for (let i = 0; i < cols.length - 1; i++) for (let j = 0; j < rowsY.length - 1; j++) {
    const x = cols[i] + 22, y = rowsY[j] + 22, bw = cols[i + 1] - cols[i] - 44, bh = rowsY[j + 1] - rowsY[j] - 44;
    g.fillStyle = (i === 2 && j === 0) ? '#2C4224' : (i === 1 && j === 2) ? '#38452C' : '#272E21';
    rr(g, x, y, bw, bh, 18); g.fill();
    if (i === 2 && j === 0) { g.fillStyle = '#3E5A31'; for (let t = 0; t < 7; t++) { g.beginPath(); g.arc(x + 30 + (t % 4) * 38, y + 40 + Math.floor(t / 4) * 70, 15, 0, Math.PI * 2); g.fill(); } }
  }
  g.strokeStyle = '#323A2A'; g.lineWidth = 3;
  for (const x of [150, 330]) { g.beginPath(); g.moveTo(x, 60); g.lineTo(x, h); g.stroke(); }
  for (const y of [300, 560, 760]) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  // the café (the block the dot is in) and its street door to the north
  const cx = 240, cy = 660;
  g.strokeStyle = 'rgba(199,243,107,0.35)'; g.lineWidth = 4; rr(g, 172, 582, 136, 156, 16); g.stroke();
  g.fillStyle = PAL.lime; rr(g, 214, 576, 52, 12, 6); g.fill();                        // door on the north side
  g.fillStyle = 'rgba(248,250,243,0.55)';                                           // tiny cup icon
  rr(g, 262, 690, 24, 22, 5); g.fill(); g.lineWidth = 4; g.strokeStyle = 'rgba(248,250,243,0.55)'; g.beginPath(); g.arc(289, 701, 7, -1.2, 1.2); g.stroke();
  // beam (wedge) under the dot
  const L = 230, a = s.ang || 0, hw = s.width ?? 0.3;
  const grd = g.createRadialGradient(cx, cy, 10, cx, cy, L);
  grd.addColorStop(0, 'rgba(199,243,107,0.75)'); grd.addColorStop(1, 'rgba(199,243,107,0)');
  g.fillStyle = grd; g.beginPath(); g.moveTo(cx, cy);
  g.arc(cx, cy, L, -Math.PI / 2 + a - hw, -Math.PI / 2 + a + hw); g.closePath(); g.fill();
  // accuracy halo, dot, ping
  g.fillStyle = 'rgba(199,243,107,0.13)'; g.beginPath(); g.arc(cx, cy, 64, 0, Math.PI * 2); g.fill();
  if (s.pulse > 0.01) { g.strokeStyle = `rgba(199,243,107,${0.9 * (1 - s.pulse)})`; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, 30 + 90 * s.pulse, 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.arc(cx + 2, cy + 4, 30, 0, Math.PI * 2); g.fill();
  g.fillStyle = PAL.paper; g.beginPath(); g.arc(cx, cy, 30, 0, Math.PI * 2); g.fill();
  g.fillStyle = PAL.lime; g.beginPath(); g.arc(cx, cy, 21, 0, Math.PI * 2); g.fill();
  // status bar + north badge (north-up map) + home bar
  g.fillStyle = '#12160F'; g.fillRect(0, 0, w, 58);
  g.fillStyle = PAL.paper; for (let i = 0; i < 4; i++) rr(g, 30 + i * 13, 38 - i * 6, 8, 8 + i * 6, 2), g.fill();
  rr(g, 462, 20, 46, 22, 6); g.lineWidth = 3; g.strokeStyle = PAL.paper; g.stroke(); rr(g, 466, 24, 30, 14, 3); g.fill();
  g.fillStyle = 'rgba(18,22,15,0.92)'; g.beginPath(); g.arc(468, 128, 40, 0, Math.PI * 2); g.fill();
  g.lineWidth = 3; g.strokeStyle = 'rgba(248,250,243,0.6)'; g.stroke();
  g.fillStyle = PAL.lime; g.beginPath(); g.moveTo(468, 92); g.lineTo(480, 112); g.lineTo(456, 112); g.closePath(); g.fill();
  g.fillStyle = PAL.paper; g.font = '600 38px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('N', 468, 140);
  if (s.ok > 0.01) {   // steady: a small lime check badge next to the dot
    g.globalAlpha = s.ok; g.fillStyle = PAL.lime; g.beginPath(); g.arc(cx + 70, cy - 66, 26, 0, Math.PI * 2); g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + 58, cy - 66); g.lineTo(cx + 67, cy - 56); g.lineTo(cx + 83, cy - 76); g.stroke(); g.globalAlpha = 1;
  }
  if (s.glow > 0.01) {   // giant phone: outline where the compass chip sits under the glass
    g.globalAlpha = s.glow; g.strokeStyle = PAL.lime; g.lineWidth = 8; g.setLineDash([18, 12]); rr(g, 270 - 0.26 * 587 - 70, 570 - 0.70 * 587 - 70, 140, 140, 18); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
  }
  g.fillStyle = 'rgba(248,250,243,0.7)'; rr(g, 200, 1110, 140, 9, 4.5); g.fill();
  g.restore();
}
