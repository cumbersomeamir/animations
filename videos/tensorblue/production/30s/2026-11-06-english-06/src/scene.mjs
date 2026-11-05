// Tensorblue 30s english-06 · episode 01 — "Why a torn QR code still scans" (error correction)
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged): kinetic type + tactile cards + blue
// wipes, before/after staging. Story object: one real QR sticker on a pale menu card. Every code,
// tear and result comes from demo/out/qr.json (segno-encoded, decoded by zbar + OpenCV), so what
// the viewer sees is exactly what was tested. Every cue is timed from the narration's word timings.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, pill, makeBackground,
} from './brt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- the tested QR demo ------------------------------------------------------------------
const QR = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/qr.json'), 'utf8'));
const MAT = Object.fromEntries(Object.entries(QR.codes).map(([k, v]) => [k, v.rows.map((r) => [...r].map(Number))]));
const QZ = QR.quiet_zone;
const URL_SHOWN = QR.content.replace(/^https:\/\//, '');          // example.com/menu
const R = Math.round;
for (const [k, want] of [['H_intact', true], ['H_torn_br', true], ['L_torn_br', false], ['H_torn_tl', false]]) {
  for (const r of Object.values(QR.results[k])) if (r.zbar !== want || r.opencv !== want) throw new Error('demo result changed: ' + k);
}

// ---- cues -----------------------------------------------------------------------------
const T = {
  lost: VW('L1', 'lost'), still: VW('L1', 'still'), scans: VW('L1', 'scans'),
  carries: VW('L2', 'carries'), extra: VW('L2', 'extra'), recovery: VW('L2', 'recovery'), error2: VW('L2', 'error'),
  torn: VW('L3', 'torn'), dirty: VW('L3', 'dirty'), rebuilds: VW('L3', 'rebuilds'), missing: VW('L3', 'missing'),
  levL: VW('L4', 'l'), seven: VW('L4', 'seven'), levH: VW('L4', 'h'), thirty: VW('L4', 'thirty'),
  error5: VW('L5', 'error'), cant: VW('L5', "can't"), three: VW('L5', 'three'), corner5: VW('L5', 'corner'), squares5: VW('L5', 'squares'), look: VW('L5', 'look'),
  choose: VW('L6', 'choose'), higher: VW('L6', 'higher'), corners6: VW('L6', 'corners'), clear: VW('L6', 'clear'),
  follow: VW('L7', 'follow'), tb: VW('L7', 'tensorblue'),
};
// scene starts; S5 starts on "error" so "But" still belongs to the L-vs-H comparison
const SC = [0, VL('L1').t1 + 0.2, VL('L2').t1 + 0.12, VL('L3').t1 + 0.12, T.error5 + 0.05, VL('L5').t1 + 0.15, VL('L7').t0 - 0.35, 30.01];
const WIPE = 0.5;
const WDIR = [0, 1, -1, 2, 1, -1, 2];   // 1 = L->R, -1 = R->L, 2 = bottom->top
T.chime = VL('L6').t1 + 0.12;
export const CUES = { ...T, scenes: SC };

// ---- QR drawing ------------------------------------------------------------------------
function geo(lv, cx, cy, m) {
  const n = MAT[lv].length, side = (n + 2 * QZ) * m, x = R(cx - side / 2), y = R(cy - side / 2);
  return { lv, n, m, x, y, side, ox: x + QZ * m, oy: y + QZ * m };
}
function modules(ctx, g, color, keep = null) {
  const M = MAT[g.lv]; ctx.fillStyle = color;
  for (let r = 0; r < g.n; r++) for (let c = 0; c < g.n; c++) if (M[r][c] && (!keep || keep(r, c))) {
    const x0 = R(g.ox + c * g.m), y0 = R(g.oy + r * g.m);
    ctx.fillRect(x0, y0, R(g.ox + (c + 1) * g.m) - x0, R(g.oy + (r + 1) * g.m) - y0);
  }
}
const tearUV = (key) => QR.tears[key].poly;
const tearPts = (g, key) => tearUV(key).map(([u, v]) => [g.ox + u * g.n * g.m, g.oy + v * g.n * g.m]);
function polyPath(ctx, P, close = true) { ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); if (close) ctx.closePath(); }
function inPoly(P, x, y) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; }
// modules whose centre the tear removes (symbol units), ordered from the cut inwards for the rebuild
function lostModules(lv, key) {
  const n = MAT[lv].length, P = tearUV(key), out = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (inPoly(P, (c + 0.5) / n, (r + 0.5) / n)) out.push([r, c]);
  return out;
}
const LOST_H = lostModules('H', 'br');

// the white sticker (with quiet zone); `piece`: 0 = intact, (0,1) = corner flying off, 1 = gone
function sticker(ctx, g, o = {}) {
  const { tear = null, piece = 0, ghost = null, alpha = 1, fly = [1, 1] } = o;
  const X = g.x, Y = g.y, SD = R(g.x + g.side) - X;
  const torn = tear && piece > 0;
  const P = tear ? tearPts(g, tear) : null;
  ctx.save(); ctx.globalAlpha = alpha * S.alpha;
  if (torn) { ctx.beginPath(); ctx.rect(X, Y, SD, SD); polyPath(ctx, P); ctx.clip('evenodd'); }
  ctx.fillStyle = C.white; ctx.fillRect(X, Y, SD, SD); modules(ctx, g, C.ink);
  ctx.restore();
  if (!torn) return;
  ctx.save(); ctx.globalAlpha = alpha * S.alpha;
  ctx.beginPath(); ctx.rect(X, Y, SD, SD); ctx.clip();
  ctx.strokeStyle = C.gray; ctx.lineWidth = Math.max(2, g.m / 4); ctx.lineJoin = 'round';
  ctx.beginPath(); polyPath(ctx, P.slice(0, -1), false); ctx.stroke();
  if (ghost) { ctx.beginPath(); polyPath(ctx, P); ctx.clip(); ghost(ctx, g); }
  ctx.restore();
  if (piece < 1) {   // the torn-off corner: same pixels, flying away and fading
    const k = piece, pv = tear === 'br' ? [X + SD, Y + SD] : [X, Y];
    ctx.save(); ctx.globalAlpha = alpha * S.alpha * (1 - easeIn(k));
    ctx.translate(pv[0] + fly[0] * 150 * k, pv[1] + fly[1] * (60 * k + 420 * k * k)); ctx.rotate(fly[0] * 0.7 * k); ctx.translate(-pv[0], -pv[1]);
    ctx.beginPath(); polyPath(ctx, P); ctx.clip(); ctx.beginPath(); ctx.rect(X, Y, SD, SD); ctx.clip();
    ctx.fillStyle = C.white; ctx.fillRect(X, Y, SD, SD); modules(ctx, g, C.ink);
    ctx.restore();
  }
}
// tactile pale card (menu card): contact shadow, darker base edge, face
function card(ctx, x, y, w, h, o = {}) {
  const { fill = C.pale, edge = C.gray, r = 26, alpha = 1, depth = 10 } = o;
  if (alpha <= 0) return;
  shadow(ctx, x + w / 2, y + h + depth + 8, w * 0.5, 24, 0.6 * alpha);
  ctx.save(); ctx.globalAlpha = alpha * S.alpha;
  ctx.fillStyle = edge; rr(ctx, x, y + depth, w, h, r); ctx.fill();
  ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill();
  ctx.restore();
}
// scanner viewfinder corners (a UI object, snaps in once)
function brackets(ctx, g, k, color = C.blue, off = 24) {
  if (k <= 0) return;
  const x = g.x - off, y = g.y - off, w = g.side + 2 * off, s = lerp(1.14, 1, back(k)), cx = x + w / 2, cy = y + w / 2, L = w * 0.15;
  ctx.save(); ctx.globalAlpha = clamp(k * 1.6) * S.alpha; ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  ctx.strokeStyle = color; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [px, py, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + w, 1, -1], [x + w, y + w, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(px, py + sy * L); ctx.lineTo(px, py); ctx.lineTo(px + sx * L, py); ctx.stroke();
  }
  ctx.restore();
}
function tickMark(ctx, x, y, s, color = C.white, lw = 0.16) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * lw * 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.42, y + s * 0.02); ctx.lineTo(x - s * 0.12, y + s * 0.32); ctx.lineTo(x + s * 0.46, y - s * 0.3); ctx.stroke(); ctx.restore();
}
function crossMark(ctx, x, y, s, color = C.white) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.3, y - s * 0.3); ctx.lineTo(x + s * 0.3, y + s * 0.3); ctx.moveTo(x + s * 0.3, y - s * 0.3); ctx.lineTo(x - s * 0.3, y + s * 0.3); ctx.stroke(); ctx.restore();
}
// scan result chip: ok = white pill + blue tick; not ok = pale pill + navy cross
function chip(ctx, cx, cy, ok, label, k, size = 38) {
  if (k <= 0) return;
  const w = textW(ctx, label, size, 'InterB') + size * 2.7, h = size * 1.9, s = back(k);
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(cx, cy); ctx.scale(s, s);
  shadow(ctx, 0, h * 0.55, w * 0.45, 12, 0.5);
  ctx.fillStyle = ok ? C.white : C.pale; rr(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill();
  const ix = -w / 2 + h / 2 + 2, ir = h * 0.33;
  ctx.fillStyle = ok ? C.blue : C.ink; ctx.beginPath(); ctx.arc(ix, 0, ir, 0, Math.PI * 2); ctx.fill();
  if (ok) tickMark(ctx, ix, 0, ir * 1.1); else crossMark(ctx, ix, 0, ir * 1.1);
  text(ctx, label, ix + ir + size * 0.45, size * 0.36, { size, font: 'InterB', color: C.ink, align: 'left' });
  ctx.restore();
}
function kpair(ctx, a, b, y, size, t, ta, tb, o = {}) {
  // two-tone kinetic line: `a` white + `b` blue, centred
  const font = o.font || 'IDXB', w1 = textW(ctx, a, size, font, -1), w2 = textW(ctx, b, size, font, -1), x0 = 540 - (w1 + w2) / 2;
  kword(ctx, a, x0, y, size, t, ta, { align: 'left', font, t1: o.t1 });
  kword(ctx, b, x0 + w1, y, size, t, tb, { align: 'left', font, color: C.blue, t1: o.t1 });
}

// ---- captions (accepted treatment: Inter SemiBold 54 px, ink inside y 340–520, x 90–990) -------
const CAPS = [
  { t0: VL('L1').t0, lines: ['This QR code lost a corner,', 'and it still scans.'] },
  { t0: VL('L2').t0, lines: ['Every QR code carries', 'extra recovery data:'] },
  { t0: T.error2, lines: ['error correction.'] },
  { t0: VL('L3').t0, lines: ['If squares get torn or dirty,'] },
  { t0: VW('L3', 'the'), lines: ['the scanner rebuilds', 'the missing data.'] },
  { t0: VL('L4').t0, lines: ['Level L recovers about', 'seven percent of its data;'] },
  { t0: VW('L4', 'level', 2), lines: ['level H, about thirty.'] },
  { t0: VL('L5').t0, lines: ['But error correction'] },
  { t0: T.cant, lines: ["can't fix the three corner", 'squares scanners look for.'] },
  { t0: VL('L6').t0, lines: ['Printing one?'] },
  { t0: T.choose, lines: ['Choose a higher level,', 'and keep those corners clear.'], tEnd: VL('L6').t1 + 0.9 },
  { t0: VL('L7').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.6 },
];
for (let i = 0; i < CAPS.length; i++) { CAPS[i].t0 -= 0.06; if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0; }
export const CAPTIONS = CAPS;
export const CAPTION_SIZE = 54, CAPTION_LH = 64, CAPTION_TOP = 340, CAPTION_BOTTOM = 520, CAPTION_MAXW = 880;
const CAPTION_PAD = 8;
export function captionLayout(ctx, cap) {
  ctx.save(); ctx.font = `${CAPTION_SIZE}px InterSB`; const ms = cap.lines.map((s) => ctx.measureText(s)); ctx.restore();
  for (let i = 0; i < ms.length; i++) if (ms[i].width > CAPTION_MAXW) throw new Error('caption too wide: ' + cap.lines[i]);
  const asc = Math.max(...ms.map((m) => m.actualBoundingBoxAscent)), desc = Math.max(...ms.map((m) => m.actualBoundingBoxDescent));
  const blockH = asc + (cap.lines.length - 1) * CAPTION_LH + desc;
  const top = CAPTION_TOP + CAPTION_PAD + (CAPTION_BOTTOM - CAPTION_TOP - 2 * CAPTION_PAD - blockH) / 2;
  return cap.lines.map((s, i) => ({ text: s, baseline: top + asc + i * CAPTION_LH }));
}
function drawCaption(ctx, t) {
  const cap = CAPS.find((c) => t >= c.t0 && t < c.tEnd); if (!cap) return;
  const a = clamp((t - cap.t0) / 0.1) * clamp((cap.tEnd - t) / 0.12);
  for (const L of captionLayout(ctx, cap)) text(ctx, L.text, 540, L.baseline, { size: CAPTION_SIZE, font: 'InterSB', alpha: a });
}

// ---- scenes ------------------------------------------------------------------------------
const STAGE_TOP = 540;
const MENU = { x: 245, y: 690, w: 590, h: 655 };
const G1 = geo('H', 540, 1060, 13);

// S1 hook (frame 0 = a real menu QR): the corner tears off, the scanner still reads it
function s1(ctx, t) {
  card(ctx, MENU.x, MENU.y, MENU.w, MENU.h);
  text(ctx, 'MENU  ·  TABLE 12', 540, MENU.y + 70, { size: 34, font: 'InterB', color: C.ink, track: 2 });
  const piece = ease(ev(t, 0.12, 0.65));
  sticker(ctx, G1, { tear: 'br', piece });
  brackets(ctx, G1, ev(t, 0.75, 0.3));
  chip(ctx, 540, 1428, true, URL_SHOWN, ev(t, 1.05, 0.35));
  kpair(ctx, 'Still ', 'scans.', 640, 92, t, T.still - 0.05, T.scans - 0.05);
}

// S2 inside the code: message bytes + extra recovery bytes (real counts for this version-3-H code)
const H_BLOCKS = { data: 26, ec: 44 };   // version 3-H: 2 blocks x (13 data + 22 EC) codewords
const G2 = geo('H', 540, 780, 7);
function s2(ctx, t) {
  const t0 = SC[1];
  card(ctx, G2.x - 22, G2.y - 22, G2.side + 44, G2.side + 44, { alpha: easeOut(ev(t, t0, 0.3)) });
  sticker(ctx, G2, { alpha: easeOut(ev(t, t0, 0.3)) });
  text(ctx, 'inside this code (level H)', 540, 990, { size: 32, font: 'InterSB', color: C.gray, alpha: easeOut(ev(t, t0 + 0.2, 0.3)) });
  const cols = 14, tile = 44, gap = 6, x0 = 540 - (cols * (tile + gap) - gap) / 2, y0 = 1030;
  for (let i = 0; i < H_BLOCKS.data + H_BLOCKS.ec; i++) {
    const isData = i < H_BLOCKS.data;
    const k = isData ? back(ev(t, T.carries + i * 0.018, 0.25)) : back(ev(t, T.extra + (i - H_BLOCKS.data) * 0.016, 0.25));
    if (k <= 0) continue;
    const c = i % cols, r = Math.floor(i / cols), x = x0 + c * (tile + gap), y = y0 + r * (tile + gap);
    ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x + tile / 2, y + tile / 2); ctx.scale(k, k);
    ctx.fillStyle = isData ? C.gray : C.blueDeep; rr(ctx, -tile / 2, -tile / 2 + 5, tile, tile, 9); ctx.fill();
    ctx.fillStyle = isData ? C.white : C.blue; rr(ctx, -tile / 2, -tile / 2, tile, tile, 9); ctx.fill();
    ctx.restore();
  }
  const ly = 1330, la = easeOut(ev(t, T.carries + 0.3, 0.3)), lb = easeOut(ev(t, T.recovery, 0.3));
  ctx.save(); ctx.globalAlpha = la * S.alpha; ctx.fillStyle = C.white; rr(ctx, 205, ly - 30, 34, 34, 7); ctx.fill(); ctx.restore();
  text(ctx, `${H_BLOCKS.data} message bytes`, 255, ly, { size: 34, font: 'InterSB', align: 'left', alpha: la });
  ctx.save(); ctx.globalAlpha = lb * S.alpha; ctx.fillStyle = C.blue; rr(ctx, 205, ly + 26, 34, 34, 7); ctx.fill(); ctx.restore();
  text(ctx, `${H_BLOCKS.ec} recovery bytes`, 255, ly + 56, { size: 34, font: 'InterSB', align: 'left', alpha: lb });
  pill(ctx, 540, 1440, 'error correction', { size: 36, fill: C.blue, color: C.white, alpha: easeOut(ev(t, T.error2 - 0.05, 0.3)) });
}

// S3 zoom on the torn corner: the lost squares, then rebuilt from the recovery data
const P3 = { x: 150, y: 600, w: 780, h: 600 };
const G3 = (() => { const g = geo('H', 0, 0, 34); const x = P3.x + P3.w - 40 - g.side, y = P3.y + P3.h - 40 - g.side; return { ...g, x, y, ox: x + QZ * 34, oy: y + QZ * 34 }; })();
function s3(ctx, t) {
  const t0 = SC[2];
  card(ctx, P3.x, P3.y, P3.w, P3.h);
  const P = tearPts(G3, 'br');
  ctx.save(); ctx.beginPath(); rr(ctx, P3.x, P3.y, P3.w, P3.h, 26); ctx.clip();
  sticker(ctx, G3, {
    tear: 'br', piece: 1,
    ghost: (c) => {
      const n = LOST_H.length;
      LOST_H.forEach(([r, col], i) => {
        if (!MAT.H[r][col]) return;
        const a = ev(t, T.rebuilds + (i / n) * 0.7, 0.18); if (a <= 0) return;
        c.save(); c.globalAlpha = a * S.alpha; modules(c, G3, C.blue, (rr2, cc) => rr2 === r && cc === col); c.restore();
      });
    },
  });
  // the missing area, outlined on "torn"
  const od = easeOut(ev(t, T.torn - 0.05, 0.3));
  if (od > 0) {
    ctx.save(); ctx.globalAlpha = od * S.alpha; ctx.beginPath(); ctx.rect(G3.x, G3.y, G3.side, G3.side); ctx.clip();
    ctx.setLineDash([16, 12]); ctx.strokeStyle = C.blue; ctx.lineWidth = 6; ctx.beginPath(); polyPath(ctx, P); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  pill(ctx, P3.x + 150, P3.y + 50, 'zoomed in', { size: 30, fill: C.ink, color: C.white, alpha: easeOut(ev(t, t0, 0.3)) });
  const lostN = LOST_H.length;
  pill(ctx, 700, 1255, ev(t, T.rebuilds, 0.01) > 0 ? 'rebuilt from recovery data' : `${lostN} squares lost`, { size: 34, fill: ev(t, T.rebuilds, 0.01) > 0 ? C.blue : C.pale, color: ev(t, T.rebuilds, 0.01) > 0 ? C.white : C.ink, alpha: easeOut(ev(t, T.torn, 0.3)) });
  chip(ctx, 540, 1370, true, URL_SHOWN, ev(t, T.missing, 0.35));
  text(ctx, 'decoded by zbar and OpenCV', 540, 1452, { size: 30, font: 'InterSB', color: C.gray, alpha: easeOut(ev(t, T.missing + 0.2, 0.3)) });
}

// S4 same tear, two levels: L (7%) fails, H (30%) scans — real decode results
const G4L = geo('L', 285, 873, 10), G4H = geo('H', 765, 873, 9);
function s4(ctx, t) {
  const t0 = SC[3];
  const sides = [['L', G4L, '25 × 25 squares', 0.07, T.seven, false, T.seven + 0.8], ['H', G4H, '29 × 29 squares', 0.3, T.levH, true, T.levH + 0.45]];
  for (const [lv, g, dims, pct, tb, ok, tr] of sides) {
    const cx = g.x + g.side / 2, a = easeOut(ev(t, t0 + (lv === 'H' ? 0.1 : 0), 0.3));
    text(ctx, `Level ${lv}`, cx, 620, { size: 50, font: 'IDXB', color: (lv === 'L' ? t >= T.levL - 0.05 : t >= T.levH - 0.05) ? C.white : C.gray, alpha: a });
    text(ctx, dims, cx, 662, { size: 28, font: 'InterSB', color: C.gray, alpha: a });
    card(ctx, g.x - 16, g.y - 16, g.side + 32, g.side + 32, { alpha: a, r: 20, depth: 8 });
    sticker(ctx, g, { tear: 'br', piece: 1, alpha: a });
    const bx = g.x - 16, bw = g.side + 32, by = 1105, fill = ease(ev(t, tb, 0.6));
    ctx.save(); ctx.globalAlpha = a * S.alpha; ctx.fillStyle = C.navy; rr(ctx, bx, by, bw, 24, 12); ctx.fill();
    if (fill > 0) { ctx.fillStyle = C.blue; rr(ctx, bx, by, Math.max(24, bw * pct * fill), 24, 12); ctx.fill(); }
    ctx.restore();
    text(ctx, `about ${Math.round(pct * 100)}% can be restored`, cx, 1172, { size: 29, font: 'InterSB', color: C.gray, alpha: easeOut(ev(t, tb, 0.3)) });
    chip(ctx, cx, 1262, ok, ok ? 'Scans' : "Can't read", ev(t, tr, 0.35), 36);
  }
  kpair(ctx, '7% → ', '30%', 1440, 100, t, T.seven - 0.05, T.thirty - 0.08);
}

// S5 limit: a much smaller tear, but on a corner square -> not found
const G5 = geo('H', 540, 905, 12);
function finderBox(g, which) {
  const off = which === 'tl' ? [0, 0] : which === 'tr' ? [g.n - 7, 0] : [0, g.n - 7];
  return [g.ox + off[0] * g.m - g.m * 0.6, g.oy + off[1] * g.m - g.m * 0.6, g.m * 8.2];
}
function s5(ctx, t) {
  const t0 = SC[4];
  const a = easeOut(ev(t, t0, 0.3));
  card(ctx, G5.x - 38, G5.y - 38, G5.side + 76, G5.side + 76, { alpha: a });
  const piece = ease(ev(t, T.cant - 0.2, 0.6));
  sticker(ctx, G5, { tear: 'tl', piece, alpha: a, fly: [-1, 1] });
  ['tl', 'tr', 'bl'].forEach((w, i) => {
    const k = easeOut(ev(t, T.three + i * 0.12, 0.25)); if (k <= 0) return;
    const [x, y, s] = finderBox(G5, w);
    ctx.save(); ctx.globalAlpha = k * S.alpha; ctx.lineWidth = 7; ctx.strokeStyle = w === 'tl' ? C.gray : C.blue;
    if (w === 'tl') ctx.setLineDash([14, 10]);
    ctx.beginPath(); rr(ctx, x, y, s, s, 10); ctx.stroke(); ctx.restore();
  });
  brackets(ctx, G5, ev(t, T.look - 0.1, 0.3), C.gray, 30);
  chip(ctx, 540, 1262, false, 'No code found', ev(t, T.look + 0.2, 0.35));
  text(ctx, 'zbar and OpenCV', 540, 1335, { size: 30, font: 'InterSB', color: C.gray, alpha: easeOut(ev(t, T.look + 0.4, 0.3)) });
  kpair(ctx, 'Corner ', 'squares', 1445, 88, t, T.corner5 - 0.05, T.squares5 - 0.05);
}

// S6 takeaway: pick a higher level, keep the corner squares clear
const G6 = geo('H', 540, 1190, 7);
function s6(ctx, t) {
  const t0 = SC[5];
  kword(ctx, 'Higher level,', 540, 642, 84, t, T.higher - 0.05);
  kword(ctx, 'corners clear.', 540, 734, 84, t, T.corners6 - 0.05, { color: C.blue });
  const a = easeOut(ev(t, t0, 0.3));
  card(ctx, 150, 778, 780, 205, { fill: C.white, alpha: a });
  text(ctx, 'Error correction', 190, 830, { size: 34, font: 'InterB', color: C.ink, align: 'left', alpha: a });
  const segs = [['L', '7%'], ['M', '15%'], ['Q', '25%'], ['H', '30%']], sx = 180, sw = 180, sy = 850, sh = 108;
  const sel = lerp(1, 3, ease(ev(t, T.higher - 0.05, 0.35)));
  ctx.save(); ctx.globalAlpha = a * S.alpha; ctx.fillStyle = C.pale; rr(ctx, sx, sy, sw * 4, sh, 22); ctx.fill();
  ctx.fillStyle = C.blue; rr(ctx, sx + sel * sw + 6, sy + 6, sw - 12, sh - 12, 18); ctx.fill(); ctx.restore();
  segs.forEach(([l, p], i) => {
    const on = Math.abs(sel - i) < 0.5, cx = sx + i * sw + sw / 2;
    text(ctx, l, cx, sy + 56, { size: 44, font: 'IDXB', color: on ? C.white : C.ink, alpha: a });
    text(ctx, p, cx, sy + 92, { size: 26, font: 'InterSB', color: on ? C.white : C.grayDark, alpha: a });
  });
  card(ctx, G6.x - 18, G6.y - 18, G6.side + 36, G6.side + 36, { alpha: a, r: 18, depth: 8 });
  sticker(ctx, G6, { alpha: a });
  // a tick beside each corner square (outside the sticker, so the corners stay clear)
  [[G6.x - 30, G6.y - 30], [G6.x + G6.side + 30, G6.y - 30], [G6.x - 30, G6.y + G6.side + 30]].forEach(([x, y], i) => {
    const k = back(ev(t, T.corners6 + i * 0.1, 0.3)); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(k, k);
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2); ctx.fill(); tickMark(ctx, 0, 0, 24); ctx.restore();
  });
  chip(ctx, 540, 1438, true, URL_SHOWN, ev(t, T.chime, 0.35), 34);
}

// S7 CTA — the accepted English end card, unchanged
function s7(ctx, t) {
  const t0 = SC[6];
  const lk = back(ev(t, t0 + 0.05, 0.5));
  if (lk > 0) {
    const h = 300 * lk, w = h * 200 / 260;
    shadow(ctx, 540, 1020, 120 * lk, 18, 0.5);
    ctx.save(); ctx.globalAlpha = clamp(lk); ctx.drawImage(LOGO, 540 - w / 2, 690 + (300 - h), w, h); ctx.restore();
  }
  const size = 128, w1 = textW(ctx, 'Tensor', size, 'IDXB', -2), w2 = textW(ctx, 'blue', size, 'IDXB', -2);
  const x0 = 540 - (w1 + w2) / 2;
  kword(ctx, 'Tensor', x0, 1160, size, t, T.tb - 0.1, { align: 'left' });
  kword(ctx, 'blue', x0 + w1, 1160, size, t, T.tb - 0.02, { align: 'left', color: C.blue });
  kword(ctx, 'software explained simply', 540, 1250, 50, t, T.tb + 0.5, { font: 'IDB', color: C.gray });
  const fk = back(ev(t, T.follow - 0.05, 0.35));
  if (fk > 0) {
    ctx.save(); ctx.translate(540, 1370); ctx.scale(fk, fk); ctx.translate(-540, -1370);
    ctx.fillStyle = C.blue; rr(ctx, 540 - 150, 1370 - 50, 300, 100, 50); ctx.fill();
    text(ctx, 'Follow', 540, 1388, { size: 50, font: 'IDXB' });
    ctx.restore();
  }
}
const SCENES = [s1, s2, s3, s4, s5, s6, s7];

// ---- SFX (each tied to an on-screen action) ---------------------------------------------
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(0.12, 'paper'); add(0.75, 'tap'); add(1.05, 'match'); add(T.still - 0.05, 'type'); add(T.scans - 0.05, 'type', { lo: true });
  for (let i = 1; i < SCENES.length; i++) add(SC[i] - WIPE / 2, 'wipe');
  add(SC[1] + 0.05, 'clack', { soft: true }); add(T.carries, 'carve'); add(T.extra, 'slide', { soft: true }); add(T.error2 - 0.05, 'blip', { hi: true });
  add(T.torn - 0.05, 'carve'); add(T.rebuilds, 'slide'); add(T.missing, 'match');
  add(T.seven, 'blip', { lo: true }); add(T.seven + 0.8, 'strike'); add(T.levH, 'blip', { hi: true }); add(T.levH + 0.45, 'match'); add(T.thirty - 0.08, 'type');
  add(T.cant - 0.2, 'paper'); add(T.three, 'carve'); add(T.look + 0.2, 'strike'); add(T.squares5 - 0.05, 'type', { lo: true });
  add(T.higher - 0.05, 'tap'); add(T.corners6, 'blip'); add(T.chime, 'chime');
  add(SC[6] + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e;
}

// ---- frame -------------------------------------------------------------------------------
const bg = makeBackground();
function sceneIndex(t) { let i = 0; while (i + 1 < SCENES.length && t >= SC[i + 1]) i++; return i; }
function drawScene(ctx, i, t) { ctx.save(); S.alpha = 1; SCENES[i](ctx, t); ctx.restore(); S.alpha = 1; }
export function drawFrame(ctx, f) {
  const t = f / FPS;
  S.alpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(bg, 0, 0);
  if (process.env.ONLY_BG) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, H - STAGE_TOP); ctx.clip();
  const i = sceneIndex(t);
  let wipe = null;
  for (let j = 1; j < SCENES.length; j++) { const k = (t - (SC[j] - WIPE / 2)) / WIPE; if (k >= 0 && k < 1) wipe = { j, k }; }
  if (!wipe) drawScene(ctx, i, t);
  else {
    const { j, k } = wipe; const dir = WDIR[j]; const e = ease(k); const band = 220;
    if (dir === 2) {
      const edge = lerp(H + band, STAGE_TOP - band, e);
      ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, Math.max(0, edge - STAGE_TOP)); ctx.clip(); drawScene(ctx, j - 1, t); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(0, edge + band, W, H); ctx.clip(); drawScene(ctx, j, t); ctx.restore();
      ctx.fillStyle = C.blue; ctx.fillRect(0, edge, W, band);
    } else {
      const edge = dir === 1 ? lerp(-band, W, e) : lerp(W, -band, e);
      const oldR = dir === 1 ? [edge + band, W] : [0, edge];
      const newR = dir === 1 ? [0, edge] : [edge + band, W];
      ctx.save(); ctx.beginPath(); ctx.rect(oldR[0], STAGE_TOP, Math.max(0, oldR[1] - oldR[0]), H); ctx.clip(); drawScene(ctx, j - 1, t); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(newR[0], STAGE_TOP, Math.max(0, newR[1] - newR[0]), H); ctx.clip(); drawScene(ctx, j, t); ctx.restore();
      ctx.fillStyle = C.blue; ctx.fillRect(edge, STAGE_TOP, band, H);
    }
  }
  ctx.restore();
  if (!process.env.NO_CAPTION) drawCaption(ctx, t);
}
