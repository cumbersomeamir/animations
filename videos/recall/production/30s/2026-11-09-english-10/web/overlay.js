// Captions (text ink inside y 340–520, x 90–990, ≤ 2 lines), in-world labels and the end brand mark.
import { PAL } from './lowpoly.js';
import { clamp } from './anim.js';

const INK = PAL.ink, LIME = PAL.lime, PAPER = PAL.paper, SHADE = '#0E120B', FONT = 'Fredoka', BRAND_FONT = 'Fredoka';   // English: the accepted Fredoka caption pill
export const SAFE = { capTop: 340, capBottom: 520, left: 90, right: 990, topClear: 300 };

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

function tag(g, text, x, y, a, { color = LIME, size = 38, pointTo = null } = {}) {
  if (a <= 0.01 || !x) return null;
  g.save(); g.globalAlpha = a; g.font = `700 ${size}px ${FONT}`;
  const w = g.measureText(text).width + 34, h = size + 22;
  x = clamp(x, 110 + w / 2, 970 - w / 2); y = clamp(y, 600, 1420);
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
  if (o.lens > 0.01) {   // POV through a sunglass lens: tint + rim, dropping in from the top
    const dy = -1920 * (1 - o.lens);
    g.save(); g.translate(0, dy);
    g.fillStyle = 'rgba(30,44,36,0.40)'; g.fillRect(0, 0, 1080, 1920);
    g.lineWidth = 120; g.strokeStyle = 'rgba(18,20,16,0.92)'; rr(g, -20, 40, 1120, 1900, 360); g.stroke();
    g.lineWidth = 10; g.strokeStyle = 'rgba(199,243,107,0.35)'; rr(g, 40, 100, 1000, 1780, 320); g.stroke();
    g.restore();
  }
  if (shot.startsWith('giant')) {   // each tag sits at a projected world point (P.<k>T) and points at P.<k>
    const T = (k, text, a, opt = {}) => P[k] && push(tag(g, text, P[k + 'T'].x, P[k + 'T'].y, a, { pointTo: P[k], ...opt }));
    T('before', 'light: every direction', o.allTag, { color: '#FFB830' });
    T('filter', 'screen filter', o.filterTag);
    T('after', 'one direction', o.oneTag);
    if (shot === 'giant_glare') {
      T('lens', 'lens: vertical slots', o.lensTag, { color: PAPER });
      T('glare', 'glare: sideways', o.glareTag, { color: '#F08A5D' });
      T('block', 'blocked', o.blockTag, { color: '#F08A5D' });
    } else {
      T('lens', 'crossed: blocked', o.crossTag, { color: '#F08A5D' });
      T('lens', 'turned: passes', o.passTag);
    }
  }
  if (shot === 'test_cu' && P.glasses) push(tag(g, 'darkens = polarized', P.glassesT.x, P.glassesT.y, o.testTag, { pointTo: P.glasses }));
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
