// Captions (pill text inside y 340–520 and x 100–900, ≤ 2 lines; the frame-0 hook words as a large outlined title), brief
// in-world labels, the end brand mark, and the thumbnail pill (the thumbnail is frame 0).
import { PAL } from './lowpoly.js';
import { clamp } from './anim.js';

const CORAL = '#F08A5D';
const INK = PAL.ink, LIME = PAL.lime, PAPER = PAL.paper, SHADE = '#0E120B', FONT = 'Fredoka', BRAND_FONT = 'Fredoka';   // English: the accepted Fredoka caption pill
export const SAFE = { capTop: 340, capBottom: 520, left: 100, right: 900, topClear: 300 };   // english-13: x 100..900

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

function layout(g, cap) {
  for (let size = 56; size >= 40; size -= 2) {
    g.font = `600 ${size}px ${FONT}`;
    const lines = cap.lines.map(segs => {
      const txt = segs.map(s => s[0]).join(''); const m = g.measureText(txt);
      return { segs, w: m.width, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight };
    });
    const LH = Math.round(size * 1.24), inkH = LH * (lines.length - 1) + lines[0].asc + lines[lines.length - 1].desc;
    const maxW = 2 * Math.min(540 - SAFE.left, SAFE.right - 540) - 60;   // centred at 540: ink and its pill stay inside x 100..900
    if (inkH <= SAFE.capBottom - SAFE.capTop - 30 && Math.max(...lines.map(l => l.w)) <= maxW) return { size, lines, LH, inkH };
  }
  throw new Error('caption does not fit');
}

function titleCaption(g, cap, t) {   // frame-0 hook words: large, outlined, no pill (the first frame doubles as the thumbnail)
  const lines = cap.lines.map(l => l.map(s => s[0]).join('')), maxW = 2 * (900 - 540) - 40;
  let size = 128; for (; size > 70; size -= 4) { g.font = `700 ${size}px ${FONT}`; if (Math.max(...lines.map(l => g.measureText(l).width)) <= maxW) break; }
  const LH = Math.round(size * 1.12), y0 = 470 - (lines.length - 1) * LH / 2;
  const a = cap.end >= 29.99 ? 1 : clamp((cap.end - t) / 0.15);
  g.save(); g.globalAlpha = a; g.font = `700 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
  let ink = { left: 1e9, right: -1e9, top: 1e9, bottom: -1e9 };
  cap.lines.forEach((segs, i) => {
    const txt = segs.map(s => s[0]).join(''), m = g.measureText(txt), y = y0 + i * LH + size * 0.36, color = segs.some(s => s[1]) ? LIME : PAPER;
    g.lineWidth = size * 0.16; g.strokeStyle = INK; g.strokeText(txt, 540, y); g.fillStyle = color; g.fillText(txt, 540, y);
    ink = { left: Math.min(ink.left, 540 - m.width / 2), right: Math.max(ink.right, 540 + m.width / 2), top: Math.min(ink.top, y - m.actualBoundingBoxAscent), bottom: Math.max(ink.bottom, y + m.actualBoundingBoxDescent) };
  });
  g.restore();
  return { kind: 'caption', ink, pill: { left: ink.left - 10, right: ink.right + 10, top: ink.top - 10, bottom: ink.bottom + 10 }, nLines: lines.length, size };
}

function caption(g, tl, t, cache) {
  const cap = tl.captions.find(c => t >= c.start - 1e-6 && t < c.end);
  if (!cap) return null;
  if (cap.title) return titleCaption(g, cap, t);
  const L = cache[cap.start] || (cache[cap.start] = layout(g, cap));
  const a = clamp((t - cap.start) / 0.12) * (cap.end >= 29.99 ? 1 : clamp((cap.end - t) / 0.12));
  const top = 403 - L.inkH / 2;           // ink block centred at y 403 (as feedback round 01 / round 02): 2-line ink stays inside 340–520
  g.save(); g.globalAlpha = a; g.font = `600 ${L.size}px ${FONT}`; g.textBaseline = 'alphabetic';
  let ink = { left: 1e9, right: -1e9, top: 1e9, bottom: -1e9 };
  const rows = L.lines.map((ln, i) => {
    const base = top + L.lines[0].asc + L.LH * i, x = 540 - ln.w / 2;
    ink = { left: Math.min(ink.left, x - ln.l), right: Math.max(ink.right, x + ln.r), top: Math.min(ink.top, base - ln.asc), bottom: Math.max(ink.bottom, base + ln.desc) };
    return { ln, base, x };
  });
  const pill = { left: ink.left - 30, right: ink.right + 30, top: ink.top - 20, bottom: ink.bottom + 20 };
  rr(g, pill.left + 5, pill.top + 6, pill.right - pill.left, pill.bottom - pill.top, 28); g.fillStyle = 'rgba(14,18,11,0.45)'; g.fill();
  rr(g, pill.left, pill.top, pill.right - pill.left, pill.bottom - pill.top, 28); g.fillStyle = 'rgba(32,37,27,0.9)'; g.fill();
  for (const { ln, base, x } of rows) {
    let cx = x;
    for (const [txt, hl] of ln.segs) { g.fillStyle = hl ? LIME : PAPER; g.fillText(txt, cx, base); cx += g.measureText(txt).width; }
  }
  g.restore();
  return { kind: 'caption', ink, pill, nLines: L.lines.length, size: L.size };
}

function tag(g, text, x, y, a, { color = LIME, size = 46, pointTo = null } = {}) {
  if (a <= 0.01 || !x) return null;
  g.save(); g.globalAlpha = a; g.font = `700 ${size}px ${FONT}`;
  const w = g.measureText(text).width + 34, h = size + 22;
  x = clamp(x, 110 + w / 2, 886 - w / 2); y = clamp(y, 600, 1410);   // english-19: 1410 keeps a 76 px tag's box (+5 shadow) inside y 1460
  if (pointTo) { g.strokeStyle = INK; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(pointTo.x, pointTo.y); g.stroke();
    g.strokeStyle = color; g.lineWidth = 4; g.stroke(); g.beginPath(); g.arc(pointTo.x, pointTo.y, 8, 0, Math.PI * 2); g.fillStyle = color; g.fill(); }
  rr(g, x - w / 2 + 4, y - h / 2 + 5, w, h, h / 2); g.fillStyle = SHADE; g.fill();
  rr(g, x - w / 2, y - h / 2, w, h, h / 2); g.fillStyle = INK; g.fill(); g.lineWidth = 3; g.strokeStyle = color; g.stroke();
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y + 1); g.restore();
  return { kind: 'label', top: y - h / 2, bottom: y + h / 2 + 5, left: x - w / 2, right: x + w / 2 + 4, text };
}

export function drawOverlay(g, W, H, t, o, P, tl, icon, cache, shot) {
  g.clearRect(0, 0, W, H);
  g.save(); g.scale(W / 1080, H / 1920);
  const boxes = [], push = b => b && boxes.push(b);
  const T = (k, text, a, opt = {}) => P[k] && push(tag(g, text, P[k + 'T'].x, P[k + 'T'].y, a, opt));
  const SKY = '#9FD8F0';
  T('wave', '~12 cm wave', o.waveTag, { size: 54 });
  T('mm', '~1 mm hole', o.mmTag, { color: PAPER, size: 54 });
  T('solid', 'like solid metal', o.solidTag, { size: 52 });
  T('bounce', 'bounces back', o.bounceTag, { size: 54 });
  T('light', 'light ~0.0005 mm', o.lightTag, { color: PAPER, size: 50 });
  T('gap', 'gap', o.gapTag, { size: 56 });
  if (o.brand > 0.01 && icon) {
    g.save(); g.globalAlpha = o.brand; g.font = `700 36px ${BRAND_FONT}`;
    const tw = g.measureText('Recall').width, w = 14 + 46 + 14 + tw + 26, x = 540 - w / 2, y = 568;
    rr(g, x + 4, y + 5, w, 64, 32); g.fillStyle = SHADE; g.fill();
    rr(g, x, y, w, 64, 32); g.fillStyle = PAPER; g.fill(); g.lineWidth = 3; g.strokeStyle = LIME; g.stroke();
    g.save(); rr(g, x + 12, y + 9, 46, 46, 11); g.clip(); g.drawImage(icon, x + 12, y + 9, 46, 46); g.restore();
    g.fillStyle = INK; g.textBaseline = 'middle'; g.fillText('Recall', x + 72, y + 33); g.restore();
    boxes.push({ kind: 'brand', top: y, bottom: y + 69, left: x, right: x + w + 4 });
  }
  const cb = caption(g, tl, t, cache); if (cb) boxes.push(cb);
  g.restore();
  return boxes;
}

/** The separate vertical thumbnail (1080x1920): the hook's close-up with 2–4 large words. */
export function drawThumbnail(g, W, H, icon) {   // frame 0 (the door's metal net + title words) is already drawn; add the Recall pill
  if (!icon) return;
  g.save(); g.scale(W / 1080, H / 1920);
  g.font = `700 36px ${BRAND_FONT}`;
  const tw = g.measureText('Recall').width, w = 14 + 46 + 14 + tw + 26, x = 540 - w / 2, y = 1400;
  rr(g, x + 4, y + 5, w, 64, 32); g.fillStyle = SHADE; g.fill();
  rr(g, x, y, w, 64, 32); g.fillStyle = PAPER; g.fill(); g.lineWidth = 3; g.strokeStyle = LIME; g.stroke();
  g.save(); rr(g, x + 12, y + 9, 46, 46, 11); g.clip(); g.drawImage(icon, x + 12, y + 9, 46, 46); g.restore();
  g.fillStyle = INK; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Recall', x + 72, y + 33);
  g.restore();
}
