// overlay.js: 2D editorial layer (captions, measured labels, stamp, tags, source, signature).
// Drawn into a 1080x1920 canvas each frame and composited over the WebGL render.
import { COL, clamp, ease, seg, lerp } from './util.js';

export const TEXT_LOG = [];
export function createOverlay(W, H) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext('2d');
  let frame = 0;
  // log device-space bounds (applies the current canvas transform, so scaled/translated text is checked correctly)
  const log = (str, x0, y0, x1, y1, tag) => {
    if (g.globalAlpha <= 0.05) return;
    const T = g.getTransform();
    const pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => [T.a * x + T.c * y + T.e, T.b * x + T.d * y + T.f]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    TEXT_LOG.push({ f: frame, str, tag, x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) });
  };

  function text(str, x, y, font, color, align = 'left', tag = 'text') {
    g.font = font;
    g.textAlign = align;
    g.textBaseline = 'alphabetic';
    g.fillStyle = color;
    g.fillText(str, x, y);
    const m = g.measureText(str);
    const x0 = align === 'center' ? x - m.width / 2 : align === 'right' ? x - m.width : x;
    log(str, x0, y - m.actualBoundingBoxAscent, x0 + m.width, y + m.actualBoundingBoxDescent, tag);
    return m.width;
  }
  function begin(f) { frame = f; g.clearRect(0, 0, W, H); g.globalAlpha = 1; }

  // Caption: small kicker + one or two lines; `runs` lines are arrays of [text, colour]
  function caption(p, kicker, lines, y0 = 228) {
    if (p <= 0 || p >= 2) return;
    const a = p < 1 ? ease.outCubic(clamp(p * 1.4)) : 1 - ease.inCubic(clamp(p - 1));
    const dy = p < 1 ? (1 - ease.outBack(clamp(p))) * 40 : -(p - 1) * 30;
    g.save();
    g.globalAlpha = a;
    // soft scrim for legibility on the dark stage
    const sg = g.createLinearGradient(0, 0, 0, 560);
    sg.addColorStop(0, 'rgba(5,8,6,0.78)');
    sg.addColorStop(1, 'rgba(5,8,6,0)');
    g.fillStyle = sg;
    g.fillRect(0, 0, W, 560);
    if (kicker) {
      g.fillStyle = COL.lime;
      g.beginPath(); g.arc(78, y0 - 12 + dy, 8, 0, Math.PI * 2); g.fill();
      g.letterSpacing = '4px';
      text(kicker, 96, y0 + dy, '700 30px NText', COL.lime, 'left', 'kicker');
      g.letterSpacing = '0px';
    }
    lines.forEach((runs, i) => {
      let x = 70;
      const y = y0 + 88 + i * 92 + dy;
      for (const [s, col] of runs) x += text(s, x, y, '900 82px NDisplay', col, 'left', 'caption');
    });
    g.restore();
  }

  // Pill label anchored to a screen point with a leader line.
  function label(p, at, anchor, lines, opt = {}) {
    if (p <= 0) return;
    const a = ease.outCubic(clamp(p * 1.6));
    g.save();
    g.globalAlpha = a * (opt.alpha ?? 1);
    const pad = 22, lh = [56, 40];
    g.font = '800 46px NText';
    const w0 = g.measureText(lines[0]).width;
    g.font = '600 32px NText';
    const w1 = lines[1] ? g.measureText(lines[1]).width : 0;
    const w = Math.max(w0, w1) + pad * 2, h = lines[1] ? 112 : 72;
    const align = opt.align || 'left';
    const x = align === 'left' ? at[0] : at[0] - w;
    const y = at[1] - h / 2 + (1 - ease.outBack(clamp(p))) * 30;
    // leader
    if (anchor) {
      g.strokeStyle = opt.lineCol || COL.mist;
      g.lineWidth = 3;
      g.setLineDash([3, 8]);
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(align === 'left' ? x : x + w, at[1]);
      g.lineTo(anchor[0], anchor[1]);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = opt.lineCol || COL.mist;
      g.beginPath(); g.arc(anchor[0], anchor[1], 7, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = 'rgba(5,8,6,0.82)';
    g.strokeStyle = opt.edge || COL.leaf;
    g.lineWidth = 3;
    g.beginPath(); g.roundRect(x, y, w, h, 18); g.fill(); g.stroke();
    text(lines[0], x + pad, y + 54, '800 46px NText', opt.col || COL.mist, 'left', 'label');
    if (lines[1]) text(lines[1], x + pad, y + 96, '600 32px NText', opt.subCol || COL.lime, 'left', 'label');
    g.restore();
  }

  // Text centred inside a 3D layer (water).
  function inLayer(p, at, big, small) {
    if (p <= 0) return;
    g.save();
    g.globalAlpha = ease.outCubic(clamp(p * 1.5));
    const s = lerp(0.8, 1, ease.outBack(clamp(p)));
    g.translate(at[0], at[1]);
    g.scale(s, s);
    text(small, 0, -34, '700 30px NText', 'rgba(237,246,229,0.9)', 'center', 'layer');
    text(big, 0, 30, '900 66px NDisplay', COL.mist, 'center', 'layer');
    g.restore();
  }

  // "Not counted" tag following a flying piece.
  function tag(p, at, str) {
    if (p <= 0 || p >= 1) return;
    g.save();
    g.globalAlpha = Math.sin(clamp(p) * Math.PI) * 1.4 > 1 ? 1 : Math.sin(clamp(p) * Math.PI) * 1.4;
    g.font = '800 36px NText';
    const w = g.measureText(str).width + 70;
    const x = clamp(at[0] - w / 2, 64, W - 64 - w), y = clamp(at[1] - 30, 150, 1640);
    g.fillStyle = 'rgba(5,8,6,0.85)';
    g.strokeStyle = '#E0705A';
    g.lineWidth = 3;
    g.beginPath(); g.roundRect(x, y, w, 60, 30); g.fill(); g.stroke();
    g.strokeStyle = '#E0705A'; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x + 22, y + 20); g.lineTo(x + 42, y + 40); g.moveTo(x + 42, y + 20); g.lineTo(x + 22, y + 40); g.stroke();
    text(str, x + 56, y + 43, '800 36px NText', COL.mist, 'left', 'tag');
    g.restore();
  }

  // Ink stamp that slams down.
  function stamp(p, at, big, small, alpha = 1) {
    if (p <= 0 || alpha <= 0) return;
    const k = p < 1 ? lerp(2.2, 1, ease.outQuad(clamp(p))) : 1;   // slam-in only; fading never re-scales
    g.save();
    g.globalAlpha = clamp(p * 3) * clamp(alpha);
    g.translate(at[0], at[1]);
    g.rotate(-0.12);
    g.scale(k, k);
    g.font = '900 92px NDisplay';
    const wb = g.measureText(big).width;
    g.font = '700 28px NText';
    const w = Math.max(wb, g.measureText(small).width, 240) + 56;
    g.strokeStyle = COL.lime;
    g.lineWidth = 8;
    g.fillStyle = 'rgba(5,8,6,0.55)';
    g.beginPath(); g.roundRect(-w / 2, -84, w, 150, 22); g.fill(); g.stroke();
    text(big, 0, 14, '900 92px NDisplay', COL.lime, 'center', 'stamp');
    text(small, 0, 52, '700 28px NText', COL.mist, 'center', 'stamp');
    g.restore();
  }

  function sparks(f, f0, from, to, n = 14) {
    for (let i = 0; i < n; i++) {
      const t = clamp((f - f0 - i * 0.8) / 12);
      if (t <= 0 || t >= 1) continue;
      const x = lerp(from[0] + (i % 5 - 2) * 18, to[0], ease.inOutQuad(t)) + Math.sin(i * 7 + t * 6) * 16;
      const y = lerp(from[1], to[1], ease.inQuad(t));
      g.fillStyle = `rgba(166,233,85,${1 - t})`;
      g.beginPath(); g.arc(x, y, 6 - 3 * t, 0, Math.PI * 2); g.fill();
    }
  }

  function source(a) {
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a;
    g.fillStyle = 'rgba(5,8,6,0.72)';
    g.beginPath(); g.roundRect(W / 2 - 440, 1584, 880, 88, 20); g.fill();
    text('Per 100 g edible portion (raw flesh, no skin or seed)', W / 2, 1618, '600 27px NText', 'rgba(237,246,229,0.82)', 'center', 'source');
    text('Data: USDA FoodData Central, “Mangos, raw”, FDC ID 169910', W / 2, 1656, '600 27px NText', 'rgba(237,246,229,0.82)', 'center', 'source');
    g.restore();
  }
  function signature(a, icon) {
    if (a <= 0) return;
    g.save();
    g.globalAlpha = a * 0.9;
    if (icon) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(W - 268, 1704, 46, 46, 11); g.fill(); g.drawImage(icon, W - 266, 1706, 42, 42); }
    text('NutriAI', W - 212, 1739, '800 32px NText', COL.mist, 'left', 'signature');
    g.restore();
  }
  function badge(p, at, str) {
    if (p <= 0) return;
    g.save();
    g.globalAlpha = clamp(p * 2);
    const k = ease.outBack(clamp(p));
    g.translate(at[0], at[1]);
    g.scale(k, k);
    g.font = '900 54px NDisplay';
    const w = g.measureText(str).width + 60;
    g.fillStyle = COL.leaf;
    g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill();
    text(str, 0, 19, '900 54px NDisplay', COL.ink, 'center', 'badge');
    g.restore();
  }
  return { canvas, g, begin, caption, label, inLayer, tag, stamp, sparks, source, signature, badge, text };
}
