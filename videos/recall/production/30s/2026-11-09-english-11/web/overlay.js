// Captions (text ink inside y 340–520, x 90–990, ≤ 2 lines), thermal-view scan line + legend, in-world labels and the
// end brand mark.
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
  if (o.thermal > 0.001) {   // thermal camera: scan line at the wipe edge, then a legend under the caption
    const y = 1920 * o.thermal;
    if (o.thermal < 0.999) {
      g.save(); const gr = g.createLinearGradient(0, y - 40, 0, y + 6); gr.addColorStop(0, 'rgba(199,243,107,0)'); gr.addColorStop(1, 'rgba(199,243,107,0.5)');
      g.fillStyle = gr; g.fillRect(0, y - 40, 1080, 46); g.fillStyle = LIME; g.fillRect(0, y - 3, 1080, 6); g.restore();
    }
    const a = clamp((o.thermal - 0.5) / 0.3);
    if (a > 0.01) {
      g.save(); g.globalAlpha = a; g.font = `700 30px ${FONT}`; g.textBaseline = 'middle';
      const l1 = 'thermal view:  cool', l2 = 'hot', w1 = g.measureText(l1).width, w2 = g.measureText(l2).width, bw = 170;
      const w = 26 + w1 + 14 + bw + 14 + w2 + 26, x = 540 - w / 2, yy = 572, h = 52;
      rr(g, x + 4, yy + 5, w, h, h / 2); g.fillStyle = SHADE; g.fill();
      rr(g, x, yy, w, h, h / 2); g.fillStyle = INK; g.fill(); g.lineWidth = 3; g.strokeStyle = LIME; g.stroke();
      g.fillStyle = PAPER; g.fillText(l1, x + 26, yy + h / 2 + 1);
      const bx = x + 26 + w1 + 14, gr = g.createLinearGradient(bx, 0, bx + bw, 0);
      for (const [v, c] of [[0, '#0B0F3A'], [0.2, '#2433A8'], [0.4, '#8E2BB0'], [0.6, '#E2463C'], [0.8, '#FFA62B'], [1, '#FFF6C8']]) gr.addColorStop(v, c);
      rr(g, bx, yy + 16, bw, 20, 10); g.fillStyle = gr; g.fill();
      g.fillStyle = PAPER; g.fillText(l2, bx + bw + 14, yy + h / 2 + 1); g.restore();
      boxes.push({ kind: 'label', top: yy, bottom: yy + h + 5, left: x, right: x + w + 4, text: 'thermal view' });
    }
  }
  const T = (k, text, a, opt = {}) => P[k] && push(tag(g, text, P[k + 'T'].x, P[k + 'T'].y, a, { pointTo: P[k], ...opt }));
  const HOT = '#FFA62B', COOL = '#8FB3FF', CORAL = '#F08A5D';
  if (shot === 'hook_thermal') { T('hot', 'food: hot', o.hotTag, { color: HOT }); T('cool', 'plate rim: cool', o.coolTag, { color: COOL }); }
  if (shot === 'giant_food') { T('wave', 'microwaves', o.waveTag); T('mol', 'water molecules', o.molTag, { color: PAPER }); T('diel', 'jostling = heat', o.dielTag, { color: HOT }); }
  if (shot === 'giant_plate') { T('pass', 'passes through', o.passTag); T('cond', 'heat flows from food', o.condTag, { color: HOT }); T('rim', 'rim stays cool', o.rimTag, { color: COOL }); }
  if (shot === 'giant_pottery') { T('soak', 'water soaks into clay', o.soakTag, { color: '#8FC8EE' }); T('iron', 'iron-rich glaze', o.ironTag, { color: PAPER }); T('self', 'heats itself', o.selfTag, { color: CORAL }); }
  if (shot === 'test_in') { T('dish', 'empty dish', o.dishTag, { color: PAPER }); T('cup', 'cup of water', o.cupTag, { color: '#8FC8EE' }); T('min', '1 minute (sped up)', o.minTag); }
  if (shot === 'test_out') {
    if (P.dish && o.safeTag > 0.01) push(tag(g, 'dish stays cool = safe', 540, 1290, o.safeTag, { color: LIME, pointTo: P.dish }));
    if (o.warmTag > 0.01) push(tag(g, "gets warm? don't use it", 540, 1385, o.warmTag, { color: CORAL }));
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
