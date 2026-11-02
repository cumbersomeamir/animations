// Canvas artwork: the printed table card (real QR matrix + Recall icon logo) and the phone camera screen.
// The phone only ever shows the decoded text when that exact image decodes (verified in QA with zxing-cpp).
import { PAL } from './lowpoly.js';

export const CARD = { w: 600, h: 825, mod: 15, quiet: 4, left: 52, top: 262 };
const FONT = 'Fredoka';

export function moduleRect(r, c) {
  const { mod, quiet, left, top } = CARD;
  return [left + (quiet + c) * mod, top + (quiet + r) * mod, mod, mod];
}

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

/** variant: 'small' (7x7 Recall-icon logo), 'big' (15x15 sticker), 'thumb' (small + thumb over the top-right marker) */
export function drawCard(qr, icon, variant = 'small') {
  const c = document.createElement('canvas'); c.width = CARD.w; c.height = CARD.h;
  const g = c.getContext('2d');
  g.fillStyle = '#FBF8F1'; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = PAL.lime; g.fillRect(0, 0, c.width, 26);
  g.fillStyle = PAL.ink; g.font = `600 78px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('SCAN ME', c.width / 2, 150);
  g.fillStyle = '#FFFFFF'; const qs = (qr.size + 2 * CARD.quiet) * CARD.mod; g.fillRect(CARD.left, CARD.top, qs, qs);
  g.fillStyle = '#111111';
  for (let r = 0; r < qr.size; r++) for (let k = 0; k < qr.size; k++) if (qr.matrix[r][k]) { const [x, y, w, h] = moduleRect(r, k); g.fillRect(x, y, w, h); }
  const logo = (n) => {
    const o = (qr.size - n) / 2, [x, y] = moduleRect(o, o), s = n * CARD.mod;
    g.fillStyle = '#FFFFFF'; g.fillRect(x, y, s, s);
    g.save(); rr(g, x + 4, y + 4, s - 8, s - 8, s * 0.18); g.clip(); if (icon) g.drawImage(icon, x + 4, y + 4, s - 8, s - 8); g.restore();
  };
  if (variant === 'big') logo(15); else logo(7);
  if (variant === 'thumb') {
    const [x, y] = moduleRect(0, qr.size - 7); g.fillStyle = '#A8714E';   // thumb over the top-right position marker
    g.beginPath(); g.ellipse(x + 3.4 * CARD.mod, y + 3.4 * CARD.mod, 5.4 * CARD.mod, 4.6 * CARD.mod, 0.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.ellipse(x + 4 * CARD.mod, y + 2.4 * CARD.mod, 2.4 * CARD.mod, 1.2 * CARD.mod, 0.5, 0, Math.PI * 2); g.fill();
  }
  return c;
}

/** Centre of finder pattern k (0 TL, 1 TR, 2 BL) in card pixels. */
export function finderCenter(qr, k) {
  const [r, c] = [[3, 3], [3, qr.size - 4], [qr.size - 4, 3]][k];
  const [x, y] = moduleRect(r, c); return [x + CARD.mod / 2, y + CARD.mod / 2];
}

/**
 * Phone camera screen. s = { card: canvas, rot, zoom, scanT, lock (0..1), lockFail (0..1), result (0..1), searching (0..1), text, t }
 */
export function drawScreen(phone, qr, s) {
  const g = phone.ctx, W = phone.canvas.width, H = phone.canvas.height;
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#6B5640'); bg.addColorStop(0.5, '#8A6A4C'); bg.addColorStop(1, '#4B3A2B');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // blurred café blobs
  g.globalAlpha = 0.35;
  for (const [x, y, r, col] of [[90, 200, 120, '#FFE2B0'], [460, 260, 90, '#E7D9C0'], [380, 980, 160, '#B98557'], [70, 900, 110, '#6F8A4E']]) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  g.globalAlpha = 1;
  // the card in view
  const cx = W / 2, cy = H * 0.36, sc = 0.66 * (s.zoom || 1);
  g.save(); g.translate(cx, cy); g.rotate(s.rot || 0); g.transform(1, 0, -0.04, 1, 0, 0); g.scale(sc, sc);
  g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 30; g.shadowOffsetY = 12;
  g.drawImage(s.card, -CARD.w / 2, -CARD.h / 2 - 40);
  g.shadowColor = 'transparent';
  // lock overlay on the three position markers
  const fc = [0, 1, 2].map(k => { const [x, y] = finderCenter(qr, k); return [x - CARD.w / 2, y - CARD.h / 2 - 40]; });
  const drawMarker = (p, a, col) => {
    g.save(); g.globalAlpha = a; g.lineWidth = 9 / sc; g.strokeStyle = col;
    const r = 4.8 * CARD.mod; rr(g, p[0] - r, p[1] - r, 2 * r, 2 * r, 14); g.stroke(); g.restore();
  };
  if (s.lock > 0) {
    fc.forEach((p, k) => drawMarker(p, Math.min(1, s.lock * 3 - k), PAL.lime));
    if (s.lock > 0.66) {
      g.save(); g.globalAlpha = (s.lock - 0.66) * 3; g.strokeStyle = PAL.lime; g.lineWidth = 6 / sc; g.setLineDash([16, 12]);
      g.beginPath(); g.moveTo(...fc[1]); g.lineTo(...fc[0]); g.lineTo(...fc[2]); g.stroke(); g.setLineDash([]);
      // orientation arrow: "up" for the code, from the top-left marker
      const up = [fc[0][0] + (fc[1][0] - fc[0][0]) * 0.5, fc[0][1] - 70];
      g.fillStyle = PAL.lime; g.beginPath(); g.moveTo(up[0], up[1] - 38); g.lineTo(up[0] - 30, up[1] + 10); g.lineTo(up[0] + 30, up[1] + 10); g.closePath(); g.fill();
      g.restore();
    }
  }
  if (s.lockFail > 0) {
    const blink = 0.45 + 0.55 * Math.abs(Math.sin(s.t * 7));
    drawMarker(fc[0], s.lockFail, PAL.lime); drawMarker(fc[2], s.lockFail, PAL.lime);
    drawMarker(fc[1], s.lockFail * blink, '#FFFFFF');
    g.save(); g.globalAlpha = s.lockFail * blink; g.fillStyle = '#FFFFFF'; g.font = `700 ${Math.round(90 / sc)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('?', fc[1][0], fc[1][1]); g.restore();
  }
  g.restore();
  // scan frame + scan line
  const fw = 372, fh = 372, fx = cx - fw / 2, fy = cy + 36 - fh / 2;
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 9; g.lineCap = 'round';
  for (const [x, y, dx, dy] of [[fx, fy, 1, 1], [fx + fw, fy, -1, 1], [fx, fy + fh, 1, -1], [fx + fw, fy + fh, -1, -1]]) {
    g.beginPath(); g.moveTo(x, y + dy * 60); g.lineTo(x, y); g.lineTo(x + dx * 60, y); g.stroke();
  }
  if (s.result < 0.5) {
    const ly = fy + 20 + (fh - 40) * (0.5 + 0.5 * Math.sin(s.scanT * 4.2));
    const lg = g.createLinearGradient(fx, 0, fx + fw, 0); lg.addColorStop(0, 'rgba(199,243,107,0)'); lg.addColorStop(0.5, 'rgba(199,243,107,0.9)'); lg.addColorStop(1, 'rgba(199,243,107,0)');
    g.fillStyle = lg; g.fillRect(fx + 10, ly, fw - 20, 6);
  }
  // status bar
  g.fillStyle = 'rgba(20,20,18,0.55)'; g.fillRect(0, 0, W, 64);
  g.fillStyle = '#FFFFFF'; g.font = `600 30px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('10:24', 28, 34);
  g.textAlign = 'center'; g.fillText('Camera', W / 2, 34);
  // searching pill
  if (s.searching > 0) {
    g.save(); g.globalAlpha = s.searching; g.fillStyle = 'rgba(20,20,18,0.78)'; rr(g, W / 2 - 205, 96, 410, 74, 37); g.fill();
    g.fillStyle = '#FFFFFF'; g.font = `600 36px ${FONT}`; g.textAlign = 'center'; g.fillText('Searching for a code…', W / 2, 134); g.restore();
  }
  // result sheet (only when this image decodes)
  if (s.result > 0) {
    g.globalAlpha = Math.min(1, s.result * 1.5);
    const y = 640 + 60 * (1 - s.result);
    g.save(); g.fillStyle = PAL.lime; rr(g, 24, y, W - 48, 300, 36); g.fill();
    g.fillStyle = PAL.ink; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.beginPath(); g.arc(80, y + 70, 30, 0, Math.PI * 2); g.fill();
    g.strokeStyle = PAL.lime; g.lineWidth = 8; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(66, y + 71); g.lineTo(77, y + 83); g.lineTo(96, y + 58); g.stroke();
    g.font = `600 36px ${FONT}`; g.fillText('Text found', 128, y + 70);
    let fs = 52; g.font = `700 ${fs}px ${FONT}`; while (g.measureText(s.text).width > W - 104 && fs > 30) { fs -= 2; g.font = `700 ${fs}px ${FONT}`; }
    g.fillText(s.text, 48, y + 175);
    g.restore(); g.globalAlpha = 1;
  }
  phone.tex.needsUpdate = true;
}

export function drawSticker(canvas, icon) {
  const g = canvas.getContext('2d'), n = canvas.width;
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, n, n);
  g.save(); rr(g, 10, 10, n - 20, n - 20, n * 0.18); g.clip(); if (icon) g.drawImage(icon, 10, 10, n - 20, n - 20); g.restore();
}
