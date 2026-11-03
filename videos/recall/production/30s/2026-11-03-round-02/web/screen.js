// Microwave display artwork (the episode's readable physical screen). Words only: it never shows a cooking time.
import { PAL } from './lowpoly.js';

const FONT = 'Fredoka';

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/** s = { word: 'END' | 'PAUSED' | 'HEATING' | '', progress: 0..1 | null, blink: 0..1 } */
export function drawDisplay(mw, s) {
  const g = mw.ctx, W = mw.canvas.width, H = mw.canvas.height;
  g.fillStyle = '#10140D'; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.6);
  glow.addColorStop(0, 'rgba(199,243,107,0.10)'); glow.addColorStop(1, 'rgba(199,243,107,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
  if (s.word) {
    g.save(); g.globalAlpha = 1 - 0.65 * (s.blink || 0);
    g.fillStyle = PAL.lime; g.font = `700 ${s.progress != null ? 92 : 118}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(199,243,107,0.6)'; g.shadowBlur = 18;
    g.fillText(s.word, W / 2, s.progress != null ? H * 0.38 : H * 0.53);
    g.restore();
  }
  if (s.progress != null) {
    const x = 56, y = H * 0.7, w = W - 112, h = 30;
    g.strokeStyle = PAL.lime; g.lineWidth = 5; rr(g, x, y, w, h, 15); g.stroke();
    g.fillStyle = PAL.lime; rr(g, x + 7, y + 7, Math.max(16, (w - 14) * s.progress), h - 14, 8); g.fill();
    g.fillStyle = 'rgba(199,243,107,0.55)'; g.fillRect(x + w / 2 - 2, y - 12, 4, h + 24);   // halfway mark
  }
  mw.tex.needsUpdate = true;
}
