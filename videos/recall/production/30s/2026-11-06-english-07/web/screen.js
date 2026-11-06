// Phone screen artwork: an original, minimal charging screen (no real phone's look): a big battery with a lime fill,
// the percentage, a lime bolt while charging, and a coral thermometer + pause bars when charging is paused for heat.
import { PAL } from './lowpoly.js';

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/** s: { pct, charging 0/1, paused 0/1, warm 0..1, ok 0..1 } */
export function drawCharge(ctx, W, H, s) {
  const g = ctx, k = W / 540;
  g.save(); g.setTransform(k, 0, 0, k, 0, 0);
  const w = 540, h = 1140, CORAL = '#F08A5D';
  g.fillStyle = '#151A11'; g.fillRect(0, 0, w, h);
  if (s.warm > 0.01) {   // warm tint creeping in from the edges
    const gr = g.createRadialGradient(270, 560, 200, 270, 560, 640);
    gr.addColorStop(0, 'rgba(240,138,93,0)'); gr.addColorStop(1, `rgba(240,138,93,${0.5 * s.warm})`);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  // status bar
  g.fillStyle = PAL.paper; for (let i = 0; i < 4; i++) { rr(g, 30 + i * 13, 38 - i * 6, 8, 8 + i * 6, 2); g.fill(); }
  rr(g, 462, 20, 46, 22, 6); g.lineWidth = 3; g.strokeStyle = PAL.paper; g.stroke(); rr(g, 466, 24, 30 * s.pct / 100, 14, 3); g.fillStyle = PAL.lime; g.fill();
  // big battery
  const bx = 160, by = 230, bw = 220, bh = 470;
  rr(g, bx + 70, by - 34, 80, 40, 12); g.fillStyle = '#C9CDC4'; g.fill();
  rr(g, bx, by, bw, bh, 40); g.fillStyle = '#20251B'; g.fill(); g.lineWidth = 12; g.strokeStyle = s.paused ? CORAL : '#C9CDC4'; g.stroke();
  const fh = (bh - 36) * s.pct / 100;
  g.save(); rr(g, bx + 18, by + 18, bw - 36, bh - 36, 26); g.clip();
  g.fillStyle = s.paused ? '#A9C96A' : PAL.lime; g.fillRect(bx + 18, by + bh - 18 - fh, bw - 36, fh);
  g.fillStyle = 'rgba(32,37,27,0.25)'; for (let i = 1; i < 10; i++) g.fillRect(bx + 18, by + 18 + i * (bh - 36) / 10 - 2, bw - 36, 4);   // charge rows
  g.restore();
  // 80% tick on the battery's side
  const y80 = by + bh - 18 - (bh - 36) * 0.8; g.fillStyle = PAL.paper; g.fillRect(bx + bw + 14, y80 - 3, 34, 6);
  g.font = '600 34px Fredoka'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('80', bx + bw + 56, y80);
  // centre icon: bolt (charging) or thermometer + pause (paused for heat)
  const cx = 270, cy = by + bh * 0.42;
  if (s.charging) {
    g.fillStyle = '#20251B'; g.strokeStyle = PAL.paper; g.lineWidth = 8; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(cx + 18, cy - 90); g.lineTo(cx - 52, cy + 12); g.lineTo(cx - 4, cy + 12); g.lineTo(cx - 20, cy + 92); g.lineTo(cx + 52, cy - 14); g.lineTo(cx + 4, cy - 14); g.closePath(); g.fill(); g.stroke();
  } else {
    g.fillStyle = 'rgba(21,26,17,0.75)'; g.beginPath(); g.arc(cx, cy, 92, 0, Math.PI * 2); g.fill();
    g.fillStyle = CORAL; rr(g, cx - 52, cy - 62, 24, 92, 12); g.fill(); g.beginPath(); g.arc(cx - 40, cy + 38, 24, 0, Math.PI * 2); g.fill();
    g.fillStyle = PAL.paper; rr(g, cx + 6, cy - 46, 18, 84, 5); g.fill(); rr(g, cx + 38, cy - 46, 18, 84, 5); g.fill();
  }
  // percentage
  g.fillStyle = s.paused ? CORAL : PAL.paper; g.font = '600 150px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.fillText(`${s.pct}%`, 270, 905);
  if (s.ok > 0.01) {   // charging again: a small lime check
    g.globalAlpha = s.ok; g.fillStyle = PAL.lime; g.beginPath(); g.arc(270, 990, 30, 0, Math.PI * 2); g.fill();
    g.strokeStyle = PAL.ink; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(256, 990); g.lineTo(266, 1001); g.lineTo(285, 978); g.stroke(); g.globalAlpha = 1;
  }
  g.fillStyle = 'rgba(248,250,243,0.7)'; rr(g, 200, 1110, 140, 9, 4.5); g.fill();
  g.restore();
}
