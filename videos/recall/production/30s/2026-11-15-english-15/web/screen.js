// Microwave display artwork (round 02 style): lime digits on a dark panel. Shows the 1-minute dish test ("1:00" → "END").
import { PAL } from './lowpoly.js';

const FONT = 'Fredoka';

/** s = { text: '1:00' | 'END' | '' } */
export function drawDisplay(mw, s) {
  const g = mw.ctx, W = mw.canvas.width, H = mw.canvas.height;
  g.fillStyle = '#10140D'; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.6);
  glow.addColorStop(0, 'rgba(199,243,107,0.10)'); glow.addColorStop(1, 'rgba(199,243,107,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
  if (s.text) {
    g.save(); g.fillStyle = PAL.lime; g.font = `700 128px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(199,243,107,0.6)'; g.shadowBlur = 18; g.fillText(s.text, W / 2, H * 0.53); g.restore();
  }
  mw.tex.needsUpdate = true;
}
