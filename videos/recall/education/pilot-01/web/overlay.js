// 2D overlay: captions, force arrows, displaced-water labels, level gauge, rewind/pause glyphs, small signature.
import { PAL } from './clay.js';
import { clamp } from './anim.js';

const FONT = 'Fredoka';
const INK = PAL.ink, LIME = PAL.lime, PAPER = PAL.paper;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function label(ctx, text, x, y, { size = 40, color = PAPER, align = 'left', alpha = 1, weight = 600 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = `${weight} ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.26; ctx.strokeStyle = INK; ctx.strokeText(text, x, y);
  ctx.fillStyle = color; ctx.fillText(text, x, y);
  ctx.restore();
}

/** Vertical arrow from (x,y) with signed length (negative = up). */
function arrow(ctx, x, y, len, fill, alpha) {
  if (alpha <= 0 || Math.abs(len) < 1) return;
  const dir = Math.sign(len), L = Math.abs(len);
  const head = Math.min(40, L), hw = 27 * Math.min(1, 0.55 + L / 120), sw = 10 * Math.min(1, 0.6 + L / 160);
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x - sw, y); ctx.lineTo(x - sw, y + dir * (L - head)); ctx.lineTo(x - hw, y + dir * (L - head));
  ctx.lineTo(x, y + dir * L); ctx.lineTo(x + hw, y + dir * (L - head)); ctx.lineTo(x + sw, y + dir * (L - head));
  ctx.lineTo(x + sw, y); ctx.closePath();
  ctx.lineJoin = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke();
  ctx.fillStyle = fill; ctx.fill();
  ctx.restore();
}

function wrapParts(ctx, parts, maxW) {
  const words = [];
  for (const [txt, hl] of parts) for (const w of txt.split(/(\s+)/)) if (w.length) words.push([w, hl]);
  const lines = [[]]; let width = 0;
  for (const [w, hl] of words) {
    const ww = ctx.measureText(w).width;
    if (/^\s+$/.test(w)) { if (lines[lines.length - 1].length) { lines[lines.length - 1].push([w, hl, ww]); width += ww; } continue; }
    if (width + ww > maxW && lines[lines.length - 1].length) {
      const cur = lines[lines.length - 1]; while (cur.length && /^\s+$/.test(cur[cur.length - 1][0])) cur.pop();
      lines.push([]); width = 0;
    }
    lines[lines.length - 1].push([w, hl, ww]); width += ww;
  }
  return lines.map(l => { while (l.length && /^\s+$/.test(l[l.length - 1][0])) l.pop(); return { segs: l, w: l.reduce((a, s) => a + s[2], 0) }; });
}

export function drawCaption(ctx, W, tl, t) {
  const cap = tl.captions.find(c => t >= c.start - 0.001 && t < c.end);
  if (!cap) return null;
  const a = clamp((t - cap.start) / 0.14) * clamp((cap.end - t) / 0.12 + (cap.end >= 14.99 ? 1 : 0));
  const size = 66, lh = 76;
  ctx.save();
  ctx.font = `600 ${size}px ${FONT}`;
  const lines = wrapParts(ctx, cap.parts, 880);
  const bw = Math.max(...lines.map(l => l.w)) + 76, bh = lines.length * lh + 36;
  const cx = W / 2, top = 250 + (1 - clamp((t - cap.start) / 0.18)) * 16;
  ctx.globalAlpha = a;
  if (cap.chip) {
    ctx.font = `700 34px ${FONT}`;
    const cw = ctx.measureText(cap.chip).width + 44;
    rr(ctx, cx - cw / 2, top - 62, cw, 52, 26); ctx.fillStyle = LIME; ctx.fill();
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(cap.chip, cx, top - 35);
    ctx.font = `600 ${size}px ${FONT}`;
  }
  rr(ctx, cx - bw / 2, top, bw, bh, 34); ctx.fillStyle = 'rgba(24,28,20,0.9)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(199,243,107,0.35)'; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  lines.forEach((l, i) => {
    let x = cx - l.w / 2; const y = top + 18 + lh * i + lh / 2 + 2;
    for (const [w, hl, ww] of l.segs) { ctx.fillStyle = hl ? LIME : PAPER; ctx.fillText(w, x, y); x += ww; }
  });
  ctx.restore();
  return { top, bottom: top + bh, left: cx - bw / 2, right: cx + bw / 2, lines: lines.length };
}

export function drawOverlay(ctx, W, H, s, P, tl, icon) {
  ctx.clearRect(0, 0, W, H);
  const fx = s.fx, t = s.t;
  const boxes = [];
  const sc = W / 1080;
  ctx.save(); ctx.scale(sc, sc);
  const Wd = 1080, Hd = 1920;

  // --- level gauge on the front glass ---
  if (fx.gauge > 0) {
    ctx.save(); ctx.globalAlpha = fx.gauge;
    const g = P.gauge; // projected ticks [{x,y,k}]
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(g[0].x, g[0].y + 6); ctx.lineTo(g[g.length - 1].x, g[g.length - 1].y - 6); ctx.stroke();
    for (const k of g) { ctx.beginPath(); ctx.moveTo(k.x - (k.k % 4 === 0 ? 18 : 11), k.y); ctx.lineTo(k.x, k.y); ctx.lineWidth = 7; ctx.stroke(); }
    ctx.strokeStyle = PAPER;
    ctx.beginPath(); ctx.moveTo(g[0].x, g[0].y + 6); ctx.lineTo(g[g.length - 1].x, g[g.length - 1].y - 6); ctx.lineWidth = 3; ctx.stroke();
    for (const k of g) { ctx.beginPath(); ctx.moveTo(k.x - (k.k % 4 === 0 ? 18 : 11), k.y); ctx.lineTo(k.x, k.y); ctx.lineWidth = 2.5; ctx.stroke(); }
    // live level pointer
    const lv = P.levelPt;
    ctx.beginPath(); ctx.moveTo(lv.x + 6, lv.y); ctx.lineTo(lv.x + 30, lv.y - 13); ctx.lineTo(lv.x + 30, lv.y + 13); ctx.closePath();
    ctx.fillStyle = LIME; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore();
    const mk = (pt, txt, a, dy = 0) => {
      if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = a * fx.gauge;
      ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(pt.x - 26, pt.y); ctx.lineTo(pt.x + 4, pt.y); ctx.stroke();
      ctx.strokeStyle = LIME; ctx.lineWidth = 4; ctx.stroke();
      ctx.restore();
      label(ctx, txt, pt.x - 34, pt.y + dy, { size: 38, color: LIME, alpha: a * fx.gauge, align: 'right' });
    };
    mk(P.markBall, 'ball', fx.markBall, 16);
    mk(P.markHull, 'hull', fx.markHull, -4);
  }

  // --- ball: displaced-water ghost label + forces ---
  if (fx.ballGhost > 0.02 && P.ghost) {
    const a = fx.ballGhost;
    ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([14, 9]); ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.arc(P.ghost.x, P.ghost.y, P.ghost.r + 4, 0, Math.PI * 2);
    ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 5; ctx.strokeStyle = LIME; ctx.stroke();
    ctx.restore();
    const la = clamp((fx.ballGhostSlide - 0.6) / 0.4) * a;
    label(ctx, 'water pushed aside', P.ghost.x, P.ghost.y + P.ghost.r + 44, { size: 38, color: LIME, align: 'center', alpha: la });
  }
  if (fx.ballArrows > 0 && P.ball) {
    const Lw = 236, a = fx.ballArrows, grow = clamp(a * 1.4);
    arrow(ctx, P.ball.x, P.ball.y + P.ball.r + 6, Lw * grow, PAPER, a);
    arrow(ctx, P.ball.x, P.ball.y - P.ball.r - 6, -Lw * fx.pushRatio * grow, LIME, a);
    label(ctx, 'weight', P.ball.x + 40, P.ball.y + P.ball.r + 6 + Lw * 0.62, { size: 40, alpha: a });
    label(ctx, "water's push", P.ball.x - 36, P.ball.y - P.ball.r - 30, { size: 40, color: LIME, alpha: a, align: 'right' });
  }
  if (fx.pauseAmt > 0 && P.ball) {
    const x = P.ball.x - P.ball.r - 70, y = P.ball.y + 10, a = fx.pauseAmt;
    ctx.save(); ctx.globalAlpha = a;
    ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
    ctx.fillStyle = LIME; rr(ctx, x - 12, y - 13, 8, 26, 3); ctx.fill(); rr(ctx, x + 4, y - 13, 8, 26, 3); ctx.fill();
    ctx.restore();
  }
  if (fx.rewindAmt > 0 && P.hand) {
    const x = P.hand.x + 70, y = P.hand.y - 40, a = fx.rewindAmt;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y);
    ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
    ctx.fillStyle = LIME;
    for (const dx of [-2, 14]) { ctx.beginPath(); ctx.moveTo(dx, -12); ctx.lineTo(dx - 16, 0); ctx.lineTo(dx, 12); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // swirl around the twirling finger
    ctx.save(); ctx.globalAlpha = a * 0.9; ctx.strokeStyle = LIME; ctx.lineWidth = 5; ctx.lineCap = 'round';
    const ang = t * 14;
    ctx.beginPath(); ctx.arc(P.hand.x, P.hand.y, 46, ang, ang + 3.6); ctx.stroke();
    ctx.restore();
  }

  // --- hull: displaced water + forces ---
  if (fx.hullGhost > 0.02 && P.hullBottom) {
    label(ctx, 'water pushed aside', P.hullBottom.x - 150, P.hullBottom.y + 46, { size: 36, color: LIME, alpha: fx.hullGhost, align: 'center' });
  }
  if (fx.hullArrows > 0 && P.hullBottom) {
    const Lw = 236, a = fx.hullArrows;
    const xw = P.hullBottom.x + 70;
    arrow(ctx, xw, P.hullBottom.y + 8, Lw, PAPER, a);
    label(ctx, 'weight', xw + 40, P.hullBottom.y + 8 + Lw * 0.62, { size: 38, alpha: a });
    const xp = P.hullTop.x + 70;
    arrow(ctx, xp, P.hullTop.y - 10, -Lw * fx.pushRatio, LIME, a);
    label(ctx, "water's push", xp + 40, P.hullTop.y - 10 - Lw * 0.55, { size: 38, color: LIME, alpha: a });
    if (fx.balanceGlow > 0) {
      ctx.save(); ctx.globalAlpha = fx.balanceGlow * a;
      label(ctx, '=', xp - 44, P.hullTop.y - 10 - Lw * 0.55, { size: 56, color: LIME, align: 'center' });
      ctx.restore();
    }
  }

  // --- takeaway labels ---
  if (fx.labelSteel > 0 && P.steelPt) {
    const a = fx.labelSteel, p = P.steelPt, lx = p.x + 120, ly = p.y - 120;
    ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(lx - 10, ly + 20); ctx.stroke();
    ctx.strokeStyle = PAPER; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore();
    label(ctx, 'steel', lx, ly, { size: 42, alpha: a });
  }
  if (fx.labelAir > 0 && P.airPt) {
    const a = fx.labelAir, p = P.airPt;
    ctx.save(); ctx.globalAlpha = a * 0.85;
    for (let i = 0; i < 9; i++) {
      const ang = i * 2.1 + t * 0.9, rad = 70 + 40 * Math.sin(i * 1.3);
      const x = p.x + Math.cos(ang) * rad * 1.9, y = p.y + Math.sin(ang) * rad * 0.45 + 8 * Math.sin(t * 3 + i);
      ctx.beginPath(); ctx.arc(x, y, 5 + (i % 3) * 2, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
    }
    ctx.restore();
    label(ctx, 'air', p.x, p.y, { size: 52, color: PAPER, align: 'center', alpha: a });
  }

  // --- caption ---
  const cb = drawCaption(ctx, Wd, tl, t);
  if (cb) boxes.push({ kind: 'caption', ...cb });

  // --- signature ---
  if (fx.sig > 0 && icon) {
    const a = fx.sig, h = 64, txt = 'Recall';
    ctx.save(); ctx.globalAlpha = a;
    ctx.font = `600 36px ${FONT}`;
    const tw = ctx.measureText(txt).width, w = 14 + 44 + 12 + tw + 22;
    const x = Wd / 2 - w / 2, y = Hd - 230;
    rr(ctx, x, y, w, h, 32); ctx.fillStyle = 'rgba(24,28,20,0.82)'; ctx.fill();
    ctx.save(); rr(ctx, x + 12, y + 10, 44, 44, 11); ctx.clip(); ctx.drawImage(icon, x + 12, y + 10, 44, 44); ctx.restore();
    ctx.fillStyle = PAPER; ctx.textBaseline = 'middle'; ctx.fillText(txt, x + 68, y + h / 2 + 1);
    ctx.restore();
    boxes.push({ kind: 'signature', top: y, bottom: y + h, left: x, right: x + w });
  }
  ctx.restore();
  return boxes;
}
