// 2D overlay for the knowledge-challenge format (Microgame Frenzy grammar adapted to the Recall palette).
// Safe areas: nothing above y=300; caption text ink inside y 350–470 with >= 80 px side margins;
// UI row (badge / chips / fuse / tags / signature) at y 500–610; essential scene content 620–1480.
import { PAL } from './clay.js';
import { clamp, E } from './anim.js';

const INK = PAL.ink, LIME = PAL.lime, PAPER = PAL.paper, SHADE = '#0E120B';
const FONT = 'Fredoka', DISPLAY = '"Titan One"';
const BURST_R = 290, SLAM_Y = 860;   // burst radius capped so the 3-frame overshoot never enters the top 300 px
export const SAFE = { capTop: 350, capBottom: 470, margin: 80, uiTop: 500, uiBottom: 612, topClear: 300 };

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
/** Card in the home style: hard shadow down-right, ink outline. */
function card(ctx, x, y, w, h, r, fill, { shadow = SHADE, outline = SHADE, lw = 4, off = 6 } = {}) {
  rr(ctx, x + off, y + off, w, h, r); ctx.fillStyle = shadow; ctx.fill();
  rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = outline; ctx.stroke();
}
function label(ctx, text, x, y, { size = 36, color = PAPER, align = 'left', alpha = 1, weight = 600, font = FONT } = {}) {
  if (alpha <= 0.001) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.26; ctx.strokeStyle = INK; ctx.strokeText(text, x, y);
  ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.restore();
}
function arrow(ctx, x, y, len, fill, alpha, { head = 34, half = 23, shaft = 9 } = {}) {
  if (alpha <= 0.001 || Math.abs(len) < 1) return;
  const d = Math.sign(len), L = Math.abs(len), h = Math.min(head, L), hw = half * Math.min(1, 0.55 + L / 100), sw = shaft * Math.min(1, 0.6 + L / 140);
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath();
  ctx.moveTo(x - sw, y); ctx.lineTo(x - sw, y + d * (L - h)); ctx.lineTo(x - hw, y + d * (L - h)); ctx.lineTo(x, y + d * L);
  ctx.lineTo(x + hw, y + d * (L - h)); ctx.lineTo(x + sw, y + d * (L - h)); ctx.lineTo(x + sw, y); ctx.closePath();
  ctx.lineJoin = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.stroke(); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
}

// ---------------- captions: fit the measured ink box into 350–470
function layoutCaption(ctx, cap) {
  for (let size = 54; size >= 40; size -= 2) {
    ctx.font = `600 ${size}px ${FONT}`;
    const lines = cap.lines.map(segs => {
      const txt = segs.map(s => s[0]).join('');
      const m = ctx.measureText(txt);
      return { segs, txt, w: m.width, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight };
    });
    const LH = Math.round(size * 1.22);
    const inkH = LH * (lines.length - 1) + lines[0].asc + lines[lines.length - 1].desc;
    const maxW = Math.max(...lines.map(l => l.w));
    if (inkH <= SAFE.capBottom - SAFE.capTop - 4 && maxW <= 1080 - 2 * SAFE.margin - 8) return { size, lines, LH, inkH };
  }
  throw new Error('caption does not fit: ' + JSON.stringify(cap.lines));
}

export function drawCaption(ctx, tl, t, cache) {
  const cap = tl.captions.find(c => t >= c.start - 1e-6 && t < c.end);
  if (!cap) return null;
  const key = cap.start;
  if (!cache[key]) cache[key] = layoutCaption(ctx, cap);
  const L = cache[key];
  const a = clamp((t - cap.start) / 0.1) * (cap.end >= 29.99 ? 1 : clamp((cap.end - t) / 0.1));
  const mid = (SAFE.capTop + SAFE.capBottom) / 2;
  const top = mid - L.inkH / 2;
  ctx.save(); ctx.globalAlpha = a; ctx.font = `600 ${L.size}px ${FONT}`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  let ink = { left: 1e9, right: -1e9, top: 1e9, bottom: -1e9 };
  const rows = L.lines.map((ln, i) => {
    const base = top + ln.asc + (i === 0 ? 0 : L.LH * i) + (i === 0 ? 0 : (L.lines[0].asc - ln.asc));
    const x = 540 - ln.w / 2;
    ink = { left: Math.min(ink.left, x - ln.l), right: Math.max(ink.right, x + ln.r), top: Math.min(ink.top, base - ln.asc), bottom: Math.max(ink.bottom, base + ln.desc) };
    return { ln, base, x };
  });
  const pill = { left: Math.min(ink.left, 540 - 160) - 34, right: Math.max(ink.right, 540 + 160) + 34, top: SAFE.capTop - 26, bottom: SAFE.capBottom + 22 };
  card(ctx, pill.left, pill.top, pill.right - pill.left, pill.bottom - pill.top, 30, 'rgba(32,37,27,0.94)', { outline: 'rgba(199,243,107,0.55)', lw: 3, off: 7 });
  for (const { ln, base, x } of rows) {
    let cx = x;
    for (const [txt, hl] of ln.segs) { ctx.fillStyle = hl ? LIME : PAPER; ctx.fillText(txt, cx, base); cx += ctx.measureText(txt).width; }
  }
  ctx.restore();
  return { kind: 'caption', ink, pill, alpha: a, size: L.size, nLines: L.lines.length };
}

// ---------------- command words (slam -> corner tag)
function burst(ctx, r, n, rot, color) {
  ctx.save(); ctx.rotate(rot); ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rad = i % 2 ? r * 0.62 : r; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = SHADE; ctx.stroke(); ctx.restore();
}
function commandWord(ctx, word, cx, cy, s, rot, alpha, withBurst) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.scale(s, s); ctx.transform(1, 0, -0.1, 1, 0, 0);
  ctx.font = `400 132px ${DISPLAY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(word).width;
  if (withBurst) burst(ctx, BURST_R, 14, rot, LIME);
  ctx.lineJoin = 'round';
  ctx.fillStyle = SHADE; ctx.fillText(word, 9, 10);
  ctx.lineWidth = 22; ctx.strokeStyle = INK; ctx.strokeText(word, 0, 0);
  ctx.fillStyle = PAPER; ctx.fillText(word, 0, 0);
  ctx.restore();
  return w;
}
function drawCommands(ctx, tl, t, fx, boxes) {
  const cmds = tl.commands;
  let cur = -1; for (let i = 0; i < cmds.length; i++) if (t >= cmds[i].t) cur = i;
  if (cur < 0) return;
  const c = cmds[cur], next = cmds[cur + 1];
  const x = t - c.t;
  const TAG = { x: 880, y: 538, s: 0.3 };
  // previous tag flies out when a new command slams (no pile-up)
  if (cur > 0 && x < 0.25) {
    const p = cmds[cur - 1], u = E.in(clamp(x / 0.25));
    if (1 - fx.chips > 0.01) commandWord(ctx, p.word, TAG.x + 700 * u, TAG.y, TAG.s, 0, (1 - u) * (1 - fx.chips), false);
  }
  const hideForChips = fx.chips;
  if (t < c.tag) {
    // slam over ~3 frames with overshoot, then hold
    const s = x < 0.1 ? 1.45 - 0.55 * E.out(x / 0.1) : x < 0.17 ? 0.9 + 0.1 * E.io((x - 0.1) / 0.07) : 1;
    commandWord(ctx, c.word, 540, SLAM_Y, s, x * 0.6, 1, true);
    boxes.push({ kind: 'command', word: c.word, top: SLAM_Y - BURST_R * s, bottom: SLAM_Y + BURST_R * s, left: 540 - BURST_R * s, right: 540 + BURST_R * s });
  } else if (t < c.tag + 0.16) {
    const u = E.io3((t - c.tag) / 0.16);
    commandWord(ctx, c.word, 540 + (TAG.x - 540) * u, SLAM_Y + (TAG.y - SLAM_Y) * u, 1 + (TAG.s - 1) * u, 0, 1, u < 0.6);
  } else if (!(next && t >= next.t) && fx.sig < 0.5) {
    const a = 1 - hideForChips;
    if (a > 0.01) {
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = `400 ${132 * TAG.s}px ${DISPLAY}`; const w = ctx.measureText(c.word).width * 1.0;
      card(ctx, TAG.x - w / 2 - 22, TAG.y - 28, w + 44, 56, 28, LIME, { lw: 3, off: 5 });
      ctx.restore();
      commandWord(ctx, c.word, TAG.x, TAG.y + 2, TAG.s * 0.82, 0, a, false);
      boxes.push({ kind: 'tag', word: c.word, top: TAG.y - 28, bottom: TAG.y + 33, left: TAG.x - w / 2 - 22, right: TAG.x + w / 2 + 27 });
    }
  }
}

// ---------------- stamps
function stamp(ctx, x, y, good, word, a, born) {
  if (a <= 0.001) return;
  const s = born < 0.1 ? 1.6 - 0.6 * E.out(born / 0.1) : 1;
  ctx.save(); ctx.globalAlpha = Math.min(1, a); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.14);
  ctx.beginPath(); ctx.arc(5, 6, 46, 0, Math.PI * 2); ctx.fillStyle = SHADE; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fillStyle = good ? LIME : INK; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = good ? INK : PAPER; ctx.stroke();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 11; ctx.strokeStyle = good ? INK : PAPER;
  ctx.beginPath();
  if (good) { ctx.moveTo(-20, 2); ctx.lineTo(-5, 17); ctx.lineTo(22, -16); } else { ctx.moveTo(-17, -17); ctx.lineTo(17, 17); ctx.moveTo(17, -17); ctx.lineTo(-17, 17); }
  ctx.stroke();
  ctx.restore();
  label(ctx, word, x, y + 72, { size: 32, color: good ? LIME : PAPER, align: 'center', alpha: Math.min(1, a), weight: 400, font: DISPLAY });
}

// ---------------- main overlay
export function drawOverlay(ctx, W, H, s, P, tl, icon, cache) {
  ctx.clearRect(0, 0, W, H);
  const fx = s.fx, t = s.t, boxes = [];
  ctx.save(); ctx.scale(W / 1080, H / 1920);

  // displacement markers on the front glass
  if (fx.markers > 0.01) {
    const a = fx.markers;
    ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([16, 10]); ctx.lineWidth = 6; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.moveTo(P.start0.x, P.start0.y); ctx.lineTo(P.start1.x, P.start1.y); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = PAPER; ctx.stroke(); ctx.restore();
    label(ctx, 'start', P.start0.x + 6, P.start0.y + 24, { size: 30, alpha: a });
    for (const [pt, base, txt] of [[P.levelL, P.baseL, '1×'], [P.levelR, P.baseR, fx.shipMark]]) {
      ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
      ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(pt.x - 34, pt.y); ctx.lineTo(pt.x + 2, pt.y); ctx.stroke();
      ctx.strokeStyle = LIME; ctx.lineWidth = 5; ctx.stroke();
      ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(pt.x - 10, pt.y); ctx.lineTo(base.x - 10, base.y); ctx.stroke();
      ctx.strokeStyle = LIME; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
      label(ctx, txt, pt.x + 22, pt.y - 22, { size: 38, color: LIME, align: 'left', alpha: a, weight: 700 });
    }
  }
  // "same steel" tags
  if (fx.sameTags > 0.01) {
    const a = fx.sameTags;
    for (const [pt, dy] of [[P.ball, -96], [P.shipTop, -70]]) {
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = PAPER; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(pt.x, pt.y + dy + 22); ctx.lineTo(pt.x, pt.y - 8); ctx.stroke(); ctx.restore();
      label(ctx, 'steel', pt.x, pt.y + dy, { size: 38, color: PAPER, align: 'center', alpha: a, weight: 700 });
    }
    label(ctx, '=', 540, (P.ball.y - 96 + P.shipTop.y - 70) / 2, { size: 64, color: LIME, align: 'center', alpha: a, weight: 700 });
  }
  // ball's displaced water
  if (fx.ballGhost > 0.01) {
    ctx.save(); ctx.globalAlpha = fx.ballGhost; ctx.setLineDash([12, 8]); ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.arc(P.ball.x, P.ball.y, P.ball.r + 8, 0, Math.PI * 2); ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = LIME; ctx.stroke(); ctx.restore();
    label(ctx, 'displaced water', P.shipBottom.x, P.shipBottom.y + 44, { size: 36, color: LIME, align: 'center', alpha: fx.shipGhost });
  }
  // forces
  const Lw = 112;
  if (fx.pushArrows > 0.01) {
    const a = fx.pushArrows;
    arrow(ctx, P.ball.x, P.ball.y - P.ball.r - 6, -Lw / 7.8, LIME, a);
    label(ctx, "water's push", P.ball.x - 22, P.ball.y - P.ball.r - 26, { size: 34, color: LIME, align: 'right', alpha: a });
    const xp = P.shipBottom.x - 62;
    arrow(ctx, xp, P.shipBottom.y + 8 + Lw * fx.shipPush, -Lw * fx.shipPush, LIME, a);
    label(ctx, "water's push", xp - 26, P.shipBottom.y + 8 + Lw * 0.55, { size: 34, color: LIME, align: 'right', alpha: a });
  }
  if (fx.shipWeight > 0.01) {
    const xw = P.shipCenter.x + 62;
    arrow(ctx, xw, P.shipCenter.y, Lw, PAPER, fx.shipWeight);
    label(ctx, 'weight', xw + 26, P.shipCenter.y + Lw * 0.62, { size: 34, alpha: fx.shipWeight });
    if (fx.balanced > 0.01) label(ctx, '=', P.shipCenter.x, P.shipBottom.y + 58, { size: 60, color: LIME, align: 'center', alpha: fx.balanced, weight: 700 });
  }
  if (fx.weights > 0.01) {
    // resting on the floor: draw the weight arrow above each piece, pointing down onto it (keeps the podium labels clear)
    for (const [pt, top] of [[P.ball, P.ball.y - P.ball.r], [P.shipCenter, P.shipTop.y]]) {
      arrow(ctx, pt.x, top - 8 - 100, 100, PAPER, fx.weights);
      label(ctx, 'weight', pt.x + 26, top - 8 - 62, { size: 34, alpha: fx.weights });
    }
    if (fx.weightsEq > 0.01) {
      label(ctx, '=', 540, P.ball.y - P.ball.r - 58, { size: 64, color: LIME, align: 'center', alpha: fx.weightsEq, weight: 700 });
      label(ctx, 'same weight', 540, P.sameW.y, { size: 36, color: LIME, align: 'center', alpha: fx.weightsEq, weight: 700 });
    }
  }
  // result stamps (fly up-out together, no pile-up)
  const out = fx.stampsOutU;
  if (fx.stampBall > 0) stamp(ctx, P.stampL.x, P.stampL.y - 500 * out, false, 'SINKS', fx.stampBall * (1 - out), t - s.cues.stampBall);
  if (fx.stampShip > 0) stamp(ctx, P.stampR.x, P.stampR.y - 500 * out, true, 'FLOATS', fx.stampShip * (1 - out), t - s.cues.stampShip);
  if (fx.stampSunk > 0) stamp(ctx, P.stampR.x, P.stampR.y, false, 'SINKS', fx.stampSunk, t - s.cues.stampSunk);
  if (fx.stampFinalBall > 0) stamp(ctx, P.stampL.x, P.stampL.y, false, 'SINKS', fx.stampFinalBall, t - s.cues.stampFinal);
  if (fx.stampFinalShip > 0) stamp(ctx, P.stampR.x, P.stampR.y, true, 'FLOATS', fx.stampFinalShip, t - s.cues.stampFinal - 0.25);
  // replay glyph near the twirling hand
  if (fx.replayGlyph > 0.01) {
    ctx.save(); ctx.globalAlpha = fx.replayGlyph; ctx.translate(P.hand.x + 66, P.hand.y - 36);
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill(); ctx.fillStyle = LIME;
    for (const dx of [-2, 14]) { ctx.beginPath(); ctx.moveTo(dx, -12); ctx.lineTo(dx - 16, 0); ctx.lineTo(dx, 12); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }

  // ---------------- UI row
  if (fx.badge > 0.01) {
    ctx.save(); ctx.globalAlpha = fx.badge; ctx.font = `700 30px ${FONT}`;
    const txt = fx.badgeDone ? 'Q1  ✓  SOLVED' : 'Q1 · GRADE 5 SCIENCE';
    const w = ctx.measureText(txt).width + 40;
    card(ctx, 80, 512, w, 52, 26, LIME, { lw: 3, off: 5 });
    ctx.fillStyle = INK; ctx.textBaseline = 'middle'; ctx.fillText(txt, 100, 539); ctx.restore();
    boxes.push({ kind: 'badge', top: 512, bottom: 569, left: 80, right: 80 + w + 5 });
  }
  const tk = tl.captions.find(c => c.chip && t >= c.start);   // TAKEAWAY chip replaces the badge in the final stretch
  if (fx.chips > 0.01) {
    const a = fx.chips, rev = fx.chipReveal;
    const opts = [['A', 'Steel gets lighter', false], ['B', 'The shape', true]];
    opts.forEach(([k, txt, right], i) => {
      const x = i === 0 ? 80 : 556, w = 444, y = 508;
      const dim = rev > 0 && !right ? 0.45 : 1;
      ctx.save(); ctx.globalAlpha = a * dim;
      card(ctx, x, y, w, 60, 22, rev > 0 && right ? LIME : PAPER, { lw: 4, off: 6 });
      ctx.fillStyle = INK; ctx.font = `400 34px ${DISPLAY}`; ctx.textBaseline = 'middle'; ctx.fillText(k, x + 20, y + 32);
      ctx.font = `600 32px ${FONT}`; ctx.fillText(txt, x + 62, y + 31);
      ctx.restore();
      boxes.push({ kind: 'chip', top: y, bottom: y + 66, left: x, right: x + w + 6 });
    });
    if (rev > 0) {
      ctx.save(); ctx.globalAlpha = a * rev; ctx.translate(556 + 444 - 36, 538);
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = LIME;
      ctx.beginPath(); ctx.moveTo(-10, 1); ctx.lineTo(-3, 9); ctx.lineTo(11, -8); ctx.stroke(); ctx.restore();
    }
  }
  if (fx.fuse > 0.01) {
    const a = fx.fuse, x0 = 100, x1 = 980, y = 600, u = fx.fuseU, xs = x0 + (x1 - x0) * u;
    ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(xs, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.strokeStyle = PAPER; ctx.lineWidth = 6; ctx.stroke();
    for (let k = 1; k <= 3; k++) { const xk = x0 + (x1 - x0) * k / 4; if (xk > xs) { ctx.beginPath(); ctx.arc(xk, y, 9, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke(); } }
    ctx.beginPath(); ctx.arc(x1, y, 13, 0, Math.PI * 2); ctx.fillStyle = LIME; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.stroke();
    if (u < 1) {
      const fl = 1 + 0.25 * Math.sin(t * 60);
      ctx.beginPath(); ctx.arc(xs, y, 11 * fl, 0, Math.PI * 2); ctx.fillStyle = LIME; ctx.fill();
      ctx.beginPath(); ctx.arc(xs, y, 5 * fl, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
    }
    ctx.restore();
    boxes.push({ kind: 'fuse', top: y - 14, bottom: y + 14, left: x0, right: x1 + 14 });
  }
  if (tk) {
    const a = clamp((t - tk.start) / 0.15);
    ctx.save(); ctx.globalAlpha = a; ctx.font = `700 30px ${FONT}`;
    const w = ctx.measureText(tk.chip).width + 40;
    card(ctx, 80, 512, w, 52, 26, LIME, { lw: 3, off: 5 });
    ctx.fillStyle = INK; ctx.textBaseline = 'middle'; ctx.fillText(tk.chip, 100, 539); ctx.restore();
    boxes.push({ kind: 'takeaway', top: 512, bottom: 569, left: 80, right: 80 + w + 5 });
  }
  drawCommands(ctx, tl, t, fx, boxes);
  if (fx.sig > 0.01 && icon) {
    ctx.save(); ctx.globalAlpha = fx.sig; ctx.font = `600 30px ${FONT}`;
    const tw = ctx.measureText('Recall').width, w = 12 + 38 + 10 + tw + 20, x = 1000 - w, y = 512;
    card(ctx, x, y, w, 52, 26, 'rgba(32,37,27,0.95)', { outline: 'rgba(199,243,107,0.6)', lw: 3, off: 5 });
    ctx.save(); rr(ctx, x + 10, y + 7, 38, 38, 9); ctx.clip(); ctx.drawImage(icon, x + 10, y + 7, 38, 38); ctx.restore();
    ctx.fillStyle = PAPER; ctx.textBaseline = 'middle'; ctx.fillText('Recall', x + 58, y + 27); ctx.restore();
    boxes.push({ kind: 'signature', top: y, bottom: y + 57, left: x, right: 1005 });
  }

  // caption last (always on top)
  const cb = drawCaption(ctx, tl, t, cache);
  if (cb) boxes.push(cb);
  ctx.restore();
  return boxes;
}
