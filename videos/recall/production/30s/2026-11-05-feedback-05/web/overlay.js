// Captions (text ink inside y 340–520, x 90–990, ≤ 2 lines), in-world labels and the end brand mark.
import { PAL } from './lowpoly.js';
import { clamp } from './anim.js';

const INK = PAL.ink, LIME = PAL.lime, PAPER = PAL.paper, SHADE = '#0E120B', FONT = '"Baloo 2"', BRAND_FONT = 'Fredoka';   // Hindi text needs Devanagari glyphs
export const SAFE = { capTop: 340, capBottom: 520, left: 90, right: 990, topClear: 300 };

function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

function layout(g, cap) {
  for (let size = 56; size >= 46; size -= 2) {
    g.font = `600 ${size}px ${FONT}`;
    const lines = cap.lines.map(segs => {
      const txt = segs.map(s => s[0]).join(''); const m = g.measureText(txt);
      return { segs, w: m.width, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight };
    });
    const LH = Math.round(size * 1.32), inkH = LH * (lines.length - 1) + lines[0].asc + lines[lines.length - 1].desc;
    if (inkH <= SAFE.capBottom - SAFE.capTop - 30 && Math.max(...lines.map(l => l.w)) <= SAFE.right - SAFE.left - 40) return { size, lines, LH, inkH };
  }
  throw new Error('caption does not fit');
}

function caption(g, tl, t, cache) {
  const cap = tl.captions.find(c => t >= c.start - 1e-6 && t < c.end);
  if (!cap) return null;
  const L = cache[cap.start] || (cache[cap.start] = layout(g, cap));
  const a = clamp((t - cap.start) / 0.12) * (cap.end >= 29.99 ? 1 : clamp((cap.end - t) / 0.12));
  const top = 413 - L.inkH / 2;           // ink block centred at y 413: 2-line Devanagari ink (taller matras) stays inside 340–520
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
  if (shot.startsWith('giant')) {
    push(tag(g, 'शोर', P.noise?.x, P.noise?.y, o.noiseTag, { color: '#F08A5D' }));
    push(tag(g, 'माइक', P.mic?.x, P.mic?.y, o.micTag, { pointTo: P.micPt }));
    push(tag(g, 'स्पीकर', P.spk?.x, P.spk?.y, o.spkTag, { color: PAPER, pointTo: P.spkPt }));
    push(tag(g, 'उल्टी लहर', P.anti?.x, P.anti?.y, o.antiTag));
    push(tag(g, 'कान तक', P.ear?.x, P.ear?.y, o.earTag, { color: PAPER }));
    push(tag(g, 'देर', P.delay?.x, P.delay?.y, o.delayTag, { color: PAPER }));
    push(tag(g, 'धीमी गूंज', P.lane0?.x, P.lane0?.y, o.slowTag, { color: '#F08A5D' }));
    push(tag(g, 'लगभग शांत', P.lane2?.x, P.lane2?.y, o.quietTag));
    push(tag(g, 'आवाज़', P.lane0?.x, P.lane0?.y, o.fastTag, { color: '#F08A5D' }));
    push(tag(g, 'आवाज़ बची', P.lane2?.x, P.lane2?.y, o.leftTag, { color: PAPER }));
    push(tag(g, 'प्लेन', P.plane?.x, P.plane?.y, o.planeTag, { color: PAPER }));
    push(tag(g, 'ट्रेन', P.train?.x, P.train?.y, o.trainTag, { color: PAPER }));
    push(tag(g, 'एसी', P.ac?.x, P.ac?.y, o.acTag, { color: PAPER }));
  }
  if (o.bubble > 0.01) {   // the friend's sudden call (diegetic voice), speech bubble from the left
    g.save(); g.globalAlpha = o.bubble; g.font = `700 50px ${FONT}`;
    const text = 'अरे, सुनो!', w = g.measureText(text).width + 56, hgt = 92, x = 130, y = 760;
    g.fillStyle = SHADE; rr(g, x + 5, y + 6, w, hgt, 30); g.fill();
    g.fillStyle = PAPER; rr(g, x, y, w, hgt, 30); g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.moveTo(x + 40, y + hgt - 2); g.lineTo(x + 18, y + hgt + 34); g.lineTo(x + 78, y + hgt - 2); g.closePath(); g.fillStyle = PAPER; g.fill();
    g.fillStyle = INK; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(text, x + 28, y + hgt / 2 + 2); g.restore();
    boxes.push({ kind: 'label', top: y, bottom: y + hgt + 34, left: x, right: x + w + 5, text });
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
