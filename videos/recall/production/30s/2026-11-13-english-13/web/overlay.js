// Captions (text ink inside y 340–520 and x 100–900, ≤ 2 lines), the big scale-reading chip, brief in-world labels, the
// payoff speed graph, the end brand mark, and the separate vertical thumbnail.
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
  for (let size = 56; size >= 44; size -= 2) {
    g.font = `600 ${size}px ${FONT}`;
    const lines = cap.lines.map(segs => {
      const txt = segs.map(s => s[0]).join(''); const m = g.measureText(txt);
      return { segs, w: m.width, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight };
    });
    const LH = Math.round(size * 1.24), inkH = LH * (lines.length - 1) + lines[0].asc + lines[lines.length - 1].desc;
    if (inkH <= SAFE.capBottom - SAFE.capTop - 30 && Math.max(...lines.map(l => l.w)) <= SAFE.right - SAFE.left - 40) return { size, lines, LH, inkH };
  }
  throw new Error('caption does not fit');
}

function caption(g, tl, t, cache) {
  const cap = tl.captions.find(c => t >= c.start - 1e-6 && t < c.end);
  if (!cap) return null;
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
  x = clamp(x, 110 + w / 2, 886 - w / 2); y = clamp(y, 600, 1420);
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
  T('push', 'push', o.pushTag); T('grav', 'gravity', o.gravTag, { color: CORAL });
  T('tip', 'extra push', o.extraTag); T('tip', 'push = gravity', o.equalTag, { color: PAPER }); T('tip', 'less push', o.lessTag, { color: CORAL });
  if (o.chip > 0.01) {   // the scale's reading, large: the one number the viewer follows through the ride
    const v = o.reading, col = v > 76 ? LIME : v < 74 ? CORAL : PAPER, y = 1300, h = 128;
    g.save(); g.globalAlpha = o.chip; g.font = `700 92px ${FONT}`;
    const num = v.toFixed(1), wn = g.measureText(num).width; g.font = `700 40px ${FONT}`; const wk = g.measureText('kg').width, wl = g.measureText('scale').width;
    const w = 40 + wl + 28 + wn + 14 + wk + 40, x = 540 - w / 2;
    rr(g, x + 5, y + 6, w, h, h / 2); g.fillStyle = SHADE; g.fill();
    rr(g, x, y, w, h, h / 2); g.fillStyle = 'rgba(32,37,27,0.94)'; g.fill(); g.lineWidth = 4; g.strokeStyle = col; g.stroke();
    g.textBaseline = 'middle'; g.fillStyle = PAPER; g.font = `700 40px ${FONT}`; g.fillText('scale', x + 40, y + h / 2 + 2);
    g.fillStyle = col; g.font = `700 92px ${FONT}`; g.fillText(num, x + 40 + wl + 28, y + h / 2 + 4);
    g.font = `700 40px ${FONT}`; g.fillText('kg', x + 40 + wl + 28 + wn + 14, y + h / 2 + 16); g.restore();
    boxes.push({ kind: 'label', top: y, bottom: y + h + 6, left: x, right: x + w + 5, text: 'scale ' + num });
  }
  if (o.mass > 0.01) push(tag(g, 'mass: 75 kg', 540, 935, o.mass, { color: PAPER, size: 56 }));
  if (o.graph[0] > 0.001) {   // payoff: speed over the ride, coloured by what the scale showed
    const x0 = 170, x1 = 390, x2 = 610, x3 = 830, yb = 1415, yt = 1205, cardA = Math.min(1, o.graph[0] * 3);
    g.save(); g.globalAlpha = cardA; rr(g, 130, 1000, 740, 455, 40); g.fillStyle = 'rgba(32,37,27,0.86)'; g.fill(); g.restore();
    g.save(); g.globalAlpha = cardA; g.strokeStyle = 'rgba(248,250,243,0.45)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, 1068); g.lineTo(x0, yb); g.lineTo(x3 + 10, yb); g.stroke();
    g.fillStyle = PAPER; g.font = `700 34px ${FONT}`; g.textBaseline = 'middle'; g.fillText('speed', x0 - 10, 1040); g.restore();
    const segs = [[x0, yb, x1, yt, LIME, '84'], [x1, yt, x2, yt, PAPER, '75'], [x2, yt, x3, yb, CORAL, '66']];
    segs.forEach(([ax, ay, bx, by, c, n], i) => {
      const u = o.graph[i]; if (u <= 0.001) return;
      g.save(); g.strokeStyle = c; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + (bx - ax) * u, ay + (by - ay) * u); g.stroke();
      g.globalAlpha = clamp((u - 0.3) / 0.5); g.fillStyle = c; g.font = `700 84px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      const mx = (ax + bx) / 2; g.fillText(n, mx, Math.min(ay, by) - 64); g.font = `700 34px ${FONT}`; g.fillText('kg', mx, Math.min(ay, by) - 22); g.restore();
    });
    boxes.push({ kind: 'label', top: 1000, bottom: 1455, left: 130, right: 870, text: 'speed graph' });
  }
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
export function drawThumbnail(g, W, H, icon) {
  g.clearRect(0, 0, W, H);
  g.save(); g.scale(W / 1080, H / 1920);
  const gr = g.createLinearGradient(0, 0, 0, 1050); gr.addColorStop(0, 'rgba(20,24,16,0.88)'); gr.addColorStop(0.55, 'rgba(20,24,16,0.7)'); gr.addColorStop(1, 'rgba(20,24,16,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 1080, 1050);
  const word = (txt, y, size, color) => {
    g.font = `700 ${size}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.lineJoin = 'round'; g.lineWidth = size * 0.16; g.strokeStyle = INK; g.strokeText(txt, 540, y); g.fillStyle = color; g.fillText(txt, 540, y);
  };
  word('HEAVIER', 520, 180, LIME);
  word('GOING UP?', 690, 132, PAPER);
  if (icon) {
    g.font = `700 36px ${BRAND_FONT}`;
    const tw = g.measureText('Recall').width, w = 14 + 46 + 14 + tw + 26, x = 540 - w / 2, y = 1400;
    rr(g, x + 4, y + 5, w, 64, 32); g.fillStyle = SHADE; g.fill();
    rr(g, x, y, w, 64, 32); g.fillStyle = PAPER; g.fill(); g.lineWidth = 3; g.strokeStyle = LIME; g.stroke();
    g.save(); rr(g, x + 12, y + 9, 46, 46, 11); g.clip(); g.drawImage(icon, x + 12, y + 9, 46, 46); g.restore();
    g.fillStyle = INK; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Recall', x + 72, y + 33);
  }
  g.restore();
}
