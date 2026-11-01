// Kinetic editorial typography + a text bounding-box log used by QA (clipping / safe-area check).
import { C, clamp, ease, lerp, rgba, rng, seg } from './util.mjs';

export const TEXT_LOG = [];
let CURRENT_FRAME = 0;
export function setFrame(f) { CURRENT_FRAME = f; }

// fillText wrapper that records the device-space bounding box of every glyph run.
export function text(ctx, str, x, y, tag = 'ui') {
  ctx.fillText(str, x, y);
  if (ctx.globalAlpha < 0.05) return;
  const m = ctx.measureText(str);
  const align = ctx.textAlign;
  let x0 = x;
  if (align === 'center') x0 = x - m.width / 2;
  else if (align === 'right' || align === 'end') x0 = x - m.width;
  const asc = m.actualBoundingBoxAscent ?? 0, desc = m.actualBoundingBoxDescent ?? 0;
  let y0 = y - asc, y1 = y + desc;
  if (ctx.textBaseline === 'middle') { const h = asc + desc; y0 = y - h / 2; y1 = y + h / 2; }
  const T = ctx.getTransform();
  const pts = [[x0, y0], [x0 + m.width, y0], [x0, y1], [x0 + m.width, y1]].map(([px, py]) => [T.a * px + T.c * py + T.e, T.b * px + T.d * py + T.f]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  TEXT_LOG.push({ f: CURRENT_FRAME, tag, str, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), a: ctx.globalAlpha });
}

function layout(ctx, words, maxW, size) {
  const space = ctx.measureText(' ').width;
  const lines = [[]];
  let w = 0;
  for (const word of words) {
    const ww = ctx.measureText(word).width;
    const cur = lines[lines.length - 1];
    if (cur.length && w + space + ww > maxW) {
      lines.push([]);
      w = 0;
    }
    const L = lines[lines.length - 1];
    L.push({ word, w: ww });
    w += (L.length > 1 ? space : 0) + ww;
  }
  const out = [];
  lines.forEach((L, li) => {
    let x = 0;
    for (const it of L) {
      out.push({ ...it, line: li, x });
      x += it.w + space;
    }
  });
  return { items: out, nLines: lines.length };
}

// Headline with kicker. spec: {text, hi:[words], in, out, kicker, size, mode:'rise'|'drop', x, y}
// theme: {ink, marker, kicker}
export function headline(ctx, f, spec, theme) {
  if (f < spec.in - 2 || f > spec.out + 2) return;
  const size = spec.size ?? 90;
  const x0 = spec.x ?? 92, top = spec.y ?? 300;
  const maxW = spec.maxW ?? 896;
  ctx.save();
  ctx.font = `900 ${size}px "NutriDisplay"`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const words = spec.text.split(' ');
  const { items } = layout(ctx, words, maxW, size);
  const lh = size * 1.06;
  const outP = seg(f, spec.out - 10, spec.out);
  // kicker
  if (spec.kicker) {
    const kp = ease.outCubic(seg(f, spec.in - 4, spec.in + 8));
    ctx.save();
    ctx.globalAlpha = kp * (1 - outP);
    ctx.font = `700 31px "NutriText"`;
    ctx.fillStyle = theme.kicker;
    ctx.beginPath();
    ctx.arc(x0 + 9, top - 11, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.letterSpacing = '4px';
    text(ctx, spec.kicker, x0 + 28 + (1 - kp) * -20, top, 'kicker');
    ctx.restore();
  }
  const base0 = top + 26 + size * 0.86;
  const r = rng(spec.seed ?? 7);
  items.forEach((it, i) => {
    const tIn = spec.in + i * (spec.stagger ?? 3);
    let p = seg(f, tIn, tIn + (spec.mode === 'drop' ? 16 : 12));
    if (p <= 0) return;
    let dy = 0, rot = 0, alpha = 1;
    if (spec.mode === 'drop') {
      dy = -(1 - ease.outBounce(p)) * 420;
      rot = (r() - 0.5) * 7 * (0.35 + 0.65 * (1 - p));
      alpha = clamp(p * 4);
    } else {
      dy = (1 - ease.outBack(p, 2.2)) * size * 0.55;
      alpha = clamp(p * 2);
    }
    const ow = seg(f, spec.out - 10 + i * 0.6, spec.out);
    dy -= ease.inCubic(ow) * 60;
    alpha *= 1 - ow;
    const bx = x0 + it.x, by = base0 + it.line * lh + dy;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (spec.hi && spec.hi.includes(it.word)) {
      const hp = ease.outCubic(seg(f, tIn + 6, tIn + 18));
      ctx.fillStyle = theme.marker;
      ctx.save();
      ctx.translate(bx - 10, by - size * 0.62);
      ctx.transform(1, 0, -0.08, 1, 0, 0);
      ctx.fillRect(0, 0, (it.w + 20) * hp, size * 0.74);
      ctx.restore();
    }
    ctx.translate(bx + it.w / 2, by);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.fillStyle = theme.ink;
    text(ctx, it.word, -it.w / 2, 0, 'headline');
    ctx.restore();
  });
  ctx.restore();
}

// Small editorial callout pill (used for the S1 tower labels and the footnote).
export function pill(ctx, x, y, str, opt = {}) {
  ctx.save();
  ctx.font = opt.font || '700 29px "NutriText"';
  const w = ctx.measureText(str).width + (opt.padX ?? 40) + (opt.dot ? 18 : 0);
  const h = opt.h ?? 48;
  const align = opt.align || 'left';
  const left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
  ctx.globalAlpha *= opt.alpha ?? 1;
  ctx.fillStyle = 'rgba(28,38,32,0.16)';
  ctx.beginPath();
  ctx.roundRect(left + 4, y - h / 2 + 5, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = opt.bg || C.ink;
  ctx.beginPath();
  ctx.roundRect(left, y - h / 2, w, h, h / 2);
  ctx.fill();
  let tx = left + (opt.padX ?? 40) / 2;
  if (opt.dot) {
    ctx.fillStyle = opt.dot;
    ctx.beginPath();
    ctx.arc(tx + 6, y, 6.5, 0, Math.PI * 2);
    ctx.fill();
    tx += 18;
  }
  ctx.fillStyle = opt.fg || C.cream;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  text(ctx, str, tx, y + 1, opt.tag || 'callout');
  ctx.restore();
  return { left, w, h };
}
