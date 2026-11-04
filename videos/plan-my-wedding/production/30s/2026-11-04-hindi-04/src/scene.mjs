// Hindi episode: "कैटरिंग कोटेशन: एक जैसी चीज़ें मिलाकर तुलना" (compare catering quotes on the same inclusions).
// Accepted origami-world recipe: lib.mjs / models.mjs from tests/15s @33e410b (DURATION=30 only); scene grammar,
// Devanagari fonts, captions, crane and end card from production/30s/2026-11-03-hindi-03 (@981aeec).
// New mechanisms: cloche lids opening into quote cards, plate grid with empty "minimum" plates, add-on vs
// included rows, stacked paper cost towers, comparison checklist. All figures are illustrative.
import { loadImage, GlobalFonts } from '@napi-rs/canvas';
import nodePath from 'node:path';
import { W, H, P, F, TAU, clamp, lerp, prog, seg, ease, stepT, jit, rng, facets, path, hinge, popup, shade, makeGrain, star4 } from './lib.mjs';
import { heart, ribbon, crane, check } from './models.mjs';
import { T } from './cues.mjs';

const FD = nodePath.resolve('node_modules/@expo-google-fonts');
GlobalFonts.registerFromPath(nodePath.join(FD, 'noto-serif-devanagari/700Bold/NotoSerifDevanagari_700Bold.ttf'), 'NSD');
GlobalFonts.registerFromPath(nodePath.join(FD, 'hind/600SemiBold/Hind_600SemiBold.ttf'), 'HindSB');
GlobalFonts.registerFromPath(nodePath.join(FD, 'hind/700Bold/Hind_700Bold.ttf'), 'HindB');
const HF = { serif: (px) => `${px}px NSD`, sans: (px) => `${px}px HindSB`, bold: (px) => `${px}px HindB` };

const FLOOR = 1640;
const grain = makeGrain(5);
let icon = null;
export async function init() { icon = await loadImage('assets/app-icon-play.png'); }
const rise = (t, t0, dur = 0.32) => (t < t0 ? 0 : t < t0 + dur ? ease.back(prog(t, t0, t0 + dur), 2.2) : 1);
const fold = (t, t0, x = 540) => 1 - seg(t, t0 + (x / W) * 0.2, t0 + (x / W) * 0.2 + 0.28, ease.in);

// ---------------------------------------------------------------- backdrop (accepted)
const WALL = (() => {
  const r = rng(11), pts = [];
  const cols = 5, rows = 6;
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) pts.push([(-200 + i * (1480 / cols)) + (i % cols ? (r() - 0.5) * 120 : 0), -300 + j * (2000 / rows) + (j % rows ? (r() - 0.5) * 120 : 0)]);
  const tris = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = pts[j * (cols + 1) + i], b = pts[j * (cols + 1) + i + 1], c = pts[(j + 1) * (cols + 1) + i], d = pts[(j + 1) * (cols + 1) + i + 1];
    tris.push({ pts: [a, b, d], c: P.blush, tone: 0.1 + (r() - 0.5) * 0.14 }, { pts: [a, d, c], c: P.blush, tone: -0.04 + (r() - 0.5) * 0.14 });
  }
  return tris;
})();
function backdrop(ctx) {
  for (const f of WALL) { path(ctx, f.pts); ctx.fillStyle = shade(f.c, f.tone); ctx.fill(); }
  ctx.strokeStyle = 'rgba(255,250,244,0.35)'; ctx.lineWidth = 2;
  for (const f of WALL) { path(ctx, f.pts); ctx.stroke(); }
  facets(ctx, [
    { pts: [[-40, FLOOR], [540, FLOOR], [-40, 2000]], c: P.cream, tone: 0.08 },
    { pts: [[540, FLOOR], [1120, FLOOR], [1120, 2000], [-40, 2000]], c: P.cream, tone: -0.04 },
    { pts: [[540, FLOOR], [1120, 1800], [1120, 2000]], c: P.creamDeep, tone: 0 },
  ], { shadow: false, outline: false });
  ctx.strokeStyle = 'rgba(74,30,38,0.12)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-40, FLOOR); ctx.lineTo(1120, FLOOR); ctx.stroke();
}
function hTag(ctx, text, px = 34, col = P.ink, fill = P.cream) {
  ctx.font = HF.sans(px);
  const w = ctx.measureText(text).width + 40, h = px + 26;
  facets(ctx, [
    { pts: [[-w / 2, 0], [w / 2, 0], [w / 2, -h / 2], [-w / 2, -h / 2]], c: fill, tone: -0.08 },
    { pts: [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2 - 6, -h], [-w / 2 + 6, -h]], c: fill, tone: 0.3 },
  ], { blur: 8, sx: 3, sy: 6 });
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, -h / 2 + 3);
}
const tagAt = (ctx, x, y, u, text, px, col, fill) => { if (u <= 0.03) return; ctx.save(); ctx.translate(x, y); ctx.scale(u, u); hTag(ctx, text, px, col, fill); ctx.restore(); };

// ---------------------------------------------------------------- S1: two cloches with per-plate tags
function dome(ctx, x, base, lid) {
  // table cloth + plate
  facets(ctx, [
    { pts: [[x - 170, base], [x + 170, base], [x + 150, base - 26], [x - 150, base - 26]], c: P.rasp, tone: 0.1 },
    { pts: [[x - 140, base - 26], [x + 140, base - 26], [x + 128, base - 40], [x - 128, base - 40]], c: P.goldLight, tone: 0.3 },
  ], { blur: 14, sx: 5, sy: 10 });
  // lid hinged at its right rim (swings open like a door): lid 0 closed .. 1 open
  const pts = [];
  for (let i = 0; i <= 8; i++) { const a = Math.PI + (i / 8) * Math.PI; pts.push([x + Math.cos(a) * 120, base - 40 + Math.sin(a) * 110]); }
  pts.push([x, base - 40]);
  const hg = hinge(pts, [x + 120, base - 40], [x + 120, base - 300], lid * Math.PI * 0.62);
  const c0 = hg.pts[9];
  const list = [];
  for (let i = 0; i < 8; i++) list.push({ pts: [c0, hg.pts[i], hg.pts[i + 1]], c: P.goldPale, tone: (0.4 - i * 0.09) * Math.max(0.3, hg.k) });
  facets(ctx, list, { blur: 14, sx: 5, sy: 10 });
  const top = hg.pts[4];
  facets(ctx, [{ pts: [[top[0] - 14, top[1]], [top[0] + 14, top[1]], [top[0] + 8, top[1] - 18], [top[0] - 8, top[1] - 18]], c: P.goldDark, tone: 0.1 }], { blur: 6, sx: 2, sy: 4 });
}
function hook(ctx, t) {
  const f = fold(t, T.cards - 0.05, 540);
  if (f <= 0.02) return;
  [[300, T.domeA], [780, T.domeB]].forEach(([x, t0]) => {
    const lid = seg(t, T.lids + (x > 540 ? 0.1 : 0), T.lids + 0.3 + (x > 540 ? 0.1 : 0), ease.out);
    popup(ctx, x, 1520, rise(t, t0, 0.34) * f, (g) => dome(g, 0, 0, lid), 1.5);
  });
  tagAt(ctx, 300, 1180, rise(t, T.tagA, 0.28) * f, '₹800 / प्लेट', 50, P.ink, P.cream);
  tagAt(ctx, 780, 1180, rise(t, T.tagB, 0.28) * f, '₹1,000 / प्लेट', 50, P.ink, P.cream);
  const au = rise(t, T.ask, 0.28) * f;
  if (au > 0.03) { ctx.save(); ctx.translate(410, 1030); ctx.scale(au, au); star4(ctx, 0, 0, 34, P.gold, P.goldDark); ctx.restore(); tagAt(ctx, 540, 960, au, 'सस्ता कौन?', 44, P.cream, P.rasp); }
}

// ---------------------------------------------------------------- S2-S4: quote cards
const CARD = { top: 620, w: 420, h: 800 };
const CX = [300, 780];
function plate(ctx, x, y, empty) {
  const r = 22;
  if (empty) {
    ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = P.rasp; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.62, 0, 0, TAU); ctx.stroke(); ctx.restore();
    return;
  }
  const list = [];
  for (let i = 0; i < 6; i++) { const a0 = (i / 6) * TAU, a1 = ((i + 1) / 6) * TAU; list.push({ pts: [[x, y], [x + Math.cos(a0) * r, y + Math.sin(a0) * r * 0.62], [x + Math.cos(a1) * r, y + Math.sin(a1) * r * 0.62]], c: P.goldLight, tone: Math.cos((a0 + a1) / 2 + 2.3) * 0.35 }); }
  facets(ctx, list, { blur: 4, sx: 2, sy: 3 });
  ctx.fillStyle = P.rasp; ctx.beginPath(); ctx.ellipse(x - 6, y - 2, 6, 3, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = P.gold; ctx.beginPath(); ctx.ellipse(x + 7, y + 1, 5, 2.6, 0, 0, TAU); ctx.fill();
}
function row(ctx, x0, y, w, label, value, mark, u, add) {
  // folded strip hinged at its top edge
  if (u <= 0.03) return;
  const hg = hinge([[x0, y], [x0 + w, y], [x0 + w, y + 70], [x0, y + 70]], [x0, y], [x0 + w, y], (1 - u) * Math.PI * 0.95);
  facets(ctx, [{ pts: hg.pts, c: hg.front ? (add ? P.blush : P.cream) : P.blushDeep, tone: 0.15 * Math.abs(hg.k) }], { blur: 6, sx: 2, sy: 5 });
  if (!hg.front || hg.k < 0.6) return;
  ctx.save(); ctx.translate(0, y); ctx.scale(1, hg.k); ctx.translate(0, -y);
  ctx.fillStyle = P.ink; ctx.font = HF.sans(30); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, x0 + 18, y + 37);
  if (mark === 'check') check(ctx, x0 + w - 40, y + 32, 22);
  else { ctx.fillStyle = P.rasp; ctx.font = HF.bold(30); ctx.textAlign = 'right'; ctx.fillText(value, x0 + w - 16, y + 38); }
  ctx.restore();
}
function cards(ctx, t) {
  if (t < T.cards - 0.05) return;
  const f = fold(t, T.fold1, 540);
  if (f <= 0.02) return;
  const u = ease.back(prog(t, T.cards, T.cards + 0.4), 1.5);
  CX.forEach((cx, k) => {
    const l = cx - CARD.w / 2, top = CARD.top, h = CARD.h * Math.min(1, u);
    ctx.save(); ctx.translate(0, 1500); ctx.scale(1, f); ctx.translate(0, -1500);
    facets(ctx, [{ pts: [[l, top + CARD.h - h], [l + CARD.w, top + CARD.h - h], [l + CARD.w, top + CARD.h], [l, top + CARD.h]], c: P.cream, tone: 0.14 }], { blur: 24, sx: 8, sy: 14 });
    if (u < 0.9) { ctx.restore(); return; }
    facets(ctx, [{ pts: [[l, top], [l + CARD.w, top], [l + CARD.w, top + 64], [l, top + 64]], c: k ? P.gold : P.rasp, tone: 0.1 }], { shadow: false });
    ctx.fillStyle = P.cream; ctx.font = HF.bold(36); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(k ? 'दूसरा कोटेशन' : 'पहला कोटेशन', cx, top + 34);
    ctx.fillStyle = P.ink; ctx.font = HF.serif(48); ctx.fillText(k ? '₹1,000 / प्लेट' : '₹800 / प्लेट', cx, top + 112);
    // plate grid: each plate = 10 plates
    const nFull = 20, nEmpty = k ? 0 : 5;
    for (let i = 0; i < nFull + nEmpty; i++) {
      const col = i % 5, r = Math.floor(i / 5);
      const t0 = i < nFull ? T.guests + r * 0.12 : T.min + 0.08 + (i - nFull) * 0.08;
      const v = seg(t, t0, t0 + 0.12, ease.out);
      if (v <= 0.05) continue;
      ctx.save(); ctx.translate(l + 62 + col * 74, top + 190 + r * 52); ctx.scale(v, v);
      plate(ctx, 0, 0, i >= nFull);
      ctx.restore();
    }
    const gy = top + 190 + 5 * 52 - 4;
    if (k === 0) tagAt(ctx, cx, gy + 40, rise(t, T.min, 0.25), t < T.empty ? 'न्यूनतम 250 प्लेट का बिल' : 'बिल 250 का, 50 प्लेट खाली', 30, P.cream, P.rasp);
    else tagAt(ctx, cx, gy + 40, rise(t, T.guests + 0.5, 0.25), '200 प्लेट · न्यूनतम 150', 30, P.ink, P.goldPale);
    const ry = top + 520;
    const items = [['लाइव काउंटर', '+₹30,000'], ['सर्विस स्टाफ़', '+₹20,000'], ['टैक्स', 'अलग']];
    items.forEach(([lab, val], i) => {
      if (k === 0) row(ctx, l + 16, ry + i * 84, CARD.w - 32, lab, val, null, seg(t, T.addA[i], T.addA[i] + 0.22, ease.out), true);
      else row(ctx, l + 16, ry + i * 84, CARD.w - 32, lab, '', 'check', seg(t, T.incB[i], T.incB[i] + 0.22, ease.out), false);
    });
    ctx.restore();
  });
  // your guest count, centred under both cards
  const gu = rise(t, T.guests, 0.28) * f;
  tagAt(ctx, 540, 1540, gu, 'आपके मेहमान: 200', 40, P.cream, P.ink);
}

// ---------------------------------------------------------------- S5: stacked paper cost towers
const PX = 300 / 100000; // px per rupee
function block(ctx, x, yb, w, hpx, c, label, val, dashed) {
  if (dashed) {
    ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = P.raspDark; ctx.lineWidth = 3;
    ctx.strokeRect(x - w / 2, yb - hpx, w, hpx); ctx.restore();
  } else {
    facets(ctx, [
      { pts: [[x - w / 2, yb], [x + w / 2, yb], [x + w / 2, yb - hpx], [x - w / 2, yb - hpx]], c, tone: 0.08 },
      { pts: [[x + w / 2, yb], [x + w / 2 + 18, yb - 12], [x + w / 2 + 18, yb - hpx - 12], [x + w / 2, yb - hpx]], c, tone: -0.3 },
      { pts: [[x - w / 2, yb - hpx], [x + w / 2, yb - hpx], [x + w / 2 + 18, yb - hpx - 12], [x - w / 2 + 18, yb - hpx - 12]], c, tone: 0.42 },
    ], { blur: 14, sx: 5, sy: 10 });
  }
  ctx.fillStyle = dashed ? P.raspDark : P.ink; ctx.font = HF.sans(hpx > 80 ? 30 : 26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(val ? `${label} ${val}` : label, x, yb - hpx / 2 + 2);
}
function towers(ctx, t) {
  if (t < T.towerA - 0.05) return;
  const f = fold(t, T.fold2, 540);
  if (f <= 0.02) return;
  const base = 1560, xA = 320, xB = 760, w = 300;
  ctx.save(); ctx.translate(0, base); ctx.scale(1, f); ctx.translate(0, -base);
  const A = [['प्लेट', '₹2,00,000', 200000, P.goldPale], ['लाइव काउंटर', '₹30,000', 30000, P.raspLight], ['स्टाफ़', '₹20,000', 20000, P.raspLight], ['टैक्स', '?', 20000, null]];
  let y = base;
  A.forEach(([lab, val, amt, c], i) => {
    const t0 = T.towerA + i * T.blkGap;
    const hpx = amt * PX;
    if (t < t0) { y -= hpx; return; }
    const v = prog(t, t0, t0 + 0.22);
    const drop = i === 0 ? 0 : (1 - ease.in(v)) * -110; // short drop: stays below the caption band
    if (i === 0) { popup(ctx, 0, base, rise(t, t0, 0.3), (g) => block(g, xA, 0, w, hpx, c, lab, val)); }
    else { ctx.save(); ctx.translate(0, drop); block(ctx, xA, y, w, hpx, c, lab, val, !c); ctx.restore(); }
    y -= hpx;
  });
  tagAt(ctx, xA, y - 30, rise(t, T.labelA, 0.25), '₹2,50,000 + टैक्स', 38, P.cream, P.rasp);
  popup(ctx, 0, base, rise(t, T.towerB, 0.34), (g) => block(g, xB, 0, w, 200000 * PX, P.gold, 'सब शामिल', '₹2,00,000'));
  tagAt(ctx, xB, base - 200000 * PX - 30, rise(t, T.labelB, 0.25), '₹2,00,000', 40, P.ink, P.goldPale);
  ctx.fillStyle = P.ink; ctx.font = HF.bold(34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (t > T.towerA) ctx.fillText('पहला', xA, base + 36);
  if (t > T.towerB) ctx.fillText('दूसरा', xB, base + 36);
  ctx.restore();
}

// ---------------------------------------------------------------- S6: comparison checklist (accepted sheet style)
const ROWS = ['प्लेट: दाम और गिनती', 'लाइव काउंटर', 'सर्विस स्टाफ़', 'टैक्स', 'न्यूनतम मेहमान'];
const SH = { x: 540, top: 680, w: 880, h: 820 };
function sheet(ctx, t) {
  if (t < T.sheet) return;
  const f = fold(t, T.fold3, 540);
  if (f <= 0.02) return;
  const u = ease.back(prog(t, T.sheet, T.sheet + 0.35), 1.6);
  const l = SH.x - SH.w / 2, r = SH.x + SH.w / 2, top = SH.top;
  ctx.save(); ctx.translate(0, top); ctx.scale(1, f); ctx.translate(0, -top);
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + SH.h * Math.min(1, u)], [l, top + SH.h * Math.min(1, u)]], c: P.cream, tone: 0.14 }], { blur: 26, sx: 9, sy: 16 });
  facets(ctx, [{ pts: [[l, top], [r, top], [r, top + 84], [l, top + 84]], c: P.rasp, tone: 0.08 }], { shadow: false });
  ctx.fillStyle = P.cream; ctx.font = HF.bold(40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (u > 0.4) ctx.fillText('दोनों कोटेशन में मिलाइए', SH.x, top + 46);
  if (u > 0.9) {
    ctx.fillStyle = P.ink; ctx.font = HF.bold(32);
    ctx.fillText('पहला', 700, top + 124); ctx.fillText('दूसरा', 870, top + 124);
    ROWS.forEach((s, i) => {
      const y = top + 160 + i * 104;
      const ru = seg(t, T.sheet + 0.3 + i * 0.1, T.sheet + 0.5 + i * 0.1, ease.out);
      if (ru <= 0.03) return;
      const hg = hinge([[l + 30, y], [r - 30, y], [r - 30, y + 88], [l + 30, y + 88]], [l + 30, y], [r - 30, y], (1 - ru) * Math.PI * 0.95);
      facets(ctx, [{ pts: hg.pts, c: hg.front ? (i % 2 ? P.blush : P.cream) : P.blushDeep, tone: (i % 2 ? -0.05 : 0.18) * Math.abs(hg.k) }], { blur: 8, sx: 3, sy: 6 });
      if (!hg.front || hg.k < 0.6) return;
      ctx.save(); ctx.translate(0, y); ctx.scale(1, hg.k); ctx.translate(0, -y);
      ctx.fillStyle = P.ink; ctx.font = HF.sans(36); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(s, l + 62, y + 46);
      const tk = T.ticks[i];
      [700, 870].forEach((cx, k) => {
        ctx.beginPath(); ctx.arc(cx, y + 44, 26, 0, TAU); ctx.strokeStyle = 'rgba(74,30,38,0.45)'; ctx.lineWidth = 3; ctx.stroke();
        check(ctx, cx + 2, y + 40, 26 * rise(t, tk + k * 0.1, 0.2));
      });
      if (t > tk + 0.2) { ctx.fillStyle = P.goldDark; ctx.font = HF.bold(40); ctx.textAlign = 'center'; ctx.fillText('=', 785, y + 44); }
      ctx.restore();
    });
    const su = rise(t, T.stamp, 0.25);
    if (su > 0.03) { ctx.save(); ctx.translate(SH.x, top + 760); ctx.scale(su, su); ctx.rotate(-0.04); hTag(ctx, 'अब तुलना कीजिए', 42, P.cream, P.rasp); ctx.restore(); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- crane (scene-change carrier)
const flapPhi = (t, t0) => 1.2 + Math.sin((t - t0) * 15) * 1.25;
function craneState(t) {
  const swoop = (t0, a, b, c, s, dir) => { const u = ease.inOut(prog(t, t0, t0 + 0.55)); const q = (k) => lerp(lerp(a[k], b[k], u), lerp(b[k], c[k], u), u); return { x: q(0), y: q(1), s, phi: flapPhi(t, t0), dir, rot: dir * (u - 0.5) * 0.3 }; };
  if (t >= T.crane1 && t < T.crane1 + 0.55) return swoop(T.crane1, [1450, 760], [600, 1150], [-450, 900], 1.8, -1);
  if (t >= T.crane2 && t < T.crane2 + 0.55) return swoop(T.crane2, [-450, 900], [450, 1150], [1500, 760], 1.8, 1);
  if (t >= T.card + 0.5) {
    const u = ease.inOut(prog(t, T.card + 0.5, T.perch));
    const landed = t >= T.perch;
    const qx = (1 - u) * (1 - u) * 1250 + 2 * (1 - u) * u * 1060 + u * u * 770, qy = (1 - u) * (1 - u) * 520 + 2 * (1 - u) * u * 380 + u * u * 322;
    return { x: qx, y: qy, s: 0.44, phi: landed ? 0.18 : flapPhi(t, T.card), dir: -1, rot: 0 };
  }
  return null;
}

// ---------------------------------------------------------------- captions: accepted folded strip, Hindi type
const CAPS = [
  [0.18, 3.5, ['₹800 या ₹1,000 प्रति प्लेट:', 'सस्ता कौन?']],
  [3.68, 8.82, ['मान लीजिए मेहमान 200,', 'पर पहले में न्यूनतम 250 प्लेट']],
  [9.0, 12.19, ['ऊपर से लाइव काउंटर,', 'स्टाफ़ और टैक्स अलग']],
  [12.37, 14.83, ['दूसरे कोटेशन में', 'ये सब शामिल']],
  [15.01, 19.67, ['कुल: पहला ₹2,50,000 से ज़्यादा,', 'दूसरा ₹2,00,000']],
  [19.83, 25.46, ['प्लेट, लाइव काउंटर, स्टाफ़,', 'टैक्स और न्यूनतम मेहमान मिलाइए']],
];
const CAP_Y = 425;
function captions(ctx, t) {
  for (const [a, b, lines] of CAPS) {
    if (t < a || t > b + 0.25) continue;
    const u = seg(t, a, a + 0.25, ease.out) * (1 - seg(t, b, b + 0.25, ease.in));
    if (u <= 0.02) continue;
    let px = 54;
    ctx.font = HF.serif(px);
    while (px > 42 && Math.max(...lines.map((s) => ctx.measureText(s).width)) > 760) { px -= 2; ctx.font = HF.serif(px); }
    const tw = Math.max(...lines.map((s) => ctx.measureText(s).width));
    const w = Math.min(820, tw + 80), lh = px * 1.36, h = lines.length * lh + 24;
    const j = jit(t, 99, 1);
    ctx.save(); ctx.translate(540 + j.x, CAP_Y + j.y); ctx.rotate(j.r - 0.01);
    const k = Math.sin(u * Math.PI / 2);
    const half = (side) => {
      const xs = side * (w / 2) * k;
      return [
        { pts: [[0, -h / 2], [xs, -h / 2 + 4], [xs, 0], [0, 0]], c: P.cream, tone: side < 0 ? 0.32 : 0.16 },
        { pts: [[0, 0], [xs, 0], [xs, h / 2 - 4], [0, h / 2]], c: P.cream, tone: side < 0 ? 0.06 : -0.1 },
      ];
    };
    const tail = (side) => ({ pts: [[side * (w / 2 - 20) * k, -h / 2 + 22], [side * (w / 2 + 36) * k, -h / 2 + 22], [side * (w / 2 + 18) * k, 6], [side * (w / 2 + 36) * k, h / 2 + 4], [side * (w / 2 - 20) * k, h / 2 + 4]], c: P.rasp, tone: -0.15 });
    facets(ctx, [tail(-1), tail(1)], { blur: 10, sx: 4, sy: 8 });
    facets(ctx, [...half(-1), ...half(1)], { blur: 16, sx: 5, sy: 10 });
    if (k > 0.55) {
      ctx.save(); ctx.scale(k, 1);
      ctx.fillStyle = P.ink; ctx.font = HF.serif(px); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      lines.forEach((s, i) => ctx.fillText(s, 0, (i - (lines.length - 1) / 2) * lh + 6));
      ctx.restore();
    }
    ctx.restore();
  }
}
function illustrative(ctx, t) {
  const u = seg(t, T.cards + 0.4, T.cards + 0.65, ease.out) * fold(t, T.fold2, 540);
  if (u <= 0.03) return;
  ctx.save(); ctx.translate(540, 596); ctx.scale(1, u); hTag(ctx, 'उदाहरण के आँकड़े, बाज़ार दर नहीं', 30, P.ink, P.cream); ctx.restore();
}

// ---------------------------------------------------------------- S7: end card (accepted layout, Hindi CTA)
const EC = { x: 540, y: 930, w: 880, h: 1180 };
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function endCard(ctx, t) {
  if (t < T.card) return;
  const { x, y, w, h } = EC;
  const l = x - w / 2, r = x + w / 2, tp = y - h / 2, bt = y + h / 2;
  const slide = 1 - ease.out(prog(t, T.card, T.card + 0.2));
  ctx.save(); ctx.translate(0, slide * 900);
  const open = seg(t, T.card + 0.15, T.card + 0.45, ease.inOut);
  const k = Math.cos((1 - open) * Math.PI);
  const content = (g) => {
    const eu = rise(t, T.card + 0.4, 0.3);
    if (eu > 0.03) {
      g.save(); g.translate(x, 600); g.scale(eu, eu); g.translate(-x, -600);
      heart(g, x, 590, 92); ribbon(g, [x - 150, 640], [x + 150, 560], 30, P.rasp); star4(g, x, 455, 40, P.rasp, P.raspDark);
      g.restore();
    }
    const line = (s, yy, t0, px) => {
      const v = rise(t, t0, 0.24);
      if (v <= 0.03) return;
      g.save(); g.translate(0, yy - px * 0.7); g.scale(1, Math.min(1, v)); g.translate(0, -(yy - px * 0.7));
      g.fillStyle = P.ink; g.font = F.serif(px); g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(s, x, yy); g.restore();
    };
    line('Plan My', 860, T.title, 150);
    line('Wedding', 1000, T.title + 0.12, 150);
    const su = seg(t, T.sub, T.sub + 0.25, ease.out);
    if (su > 0) { g.globalAlpha = su; g.fillStyle = P.rasp; g.font = HF.sans(38); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('कोटेशन · बजट · मेहमान सूची', x, 1082); g.globalAlpha = 1; }
  };
  facets(ctx, [{ pts: [[l, tp], [x, tp], [x, bt], [l, bt]], c: P.cream, tone: 0.16 }], { blur: 30, sx: 10, sy: 18 });
  if (k >= 0) {
    ctx.save(); ctx.translate(x, 0); ctx.scale(Math.max(k, 0.001), 1); ctx.translate(-x, 0);
    facets(ctx, [{ pts: [[x, tp], [r, tp], [r, bt], [x, bt]], c: P.cream, tone: 0.02 }], { blur: 30, sx: 10, sy: 18 });
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(l, tp, w / 2, h); ctx.clip(); content(ctx); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(x, tp, (w / 2) * k, h); ctx.clip(); ctx.translate(x, 0); ctx.scale(Math.max(k, 0.001), 1); ctx.translate(-x, 0); content(ctx); ctx.restore();
    ctx.strokeStyle = 'rgba(255,250,242,0.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, tp + 4); ctx.lineTo(x, bt - 4); ctx.stroke();
  } else {
    facets(ctx, [{ pts: [[x, tp], [x + (r - x) * k, tp], [x + (r - x) * k, bt], [x, bt]], c: P.blush, tone: 0.1 + 0.2 * k }], { blur: 18, sx: 6, sy: 12 });
  }
  const bu = rise(t, T.banner, 0.3);
  if (bu > 0.03) {
    const by = 1240, bw = 800 * Math.min(1, bu), bh = 132;
    ctx.save(); ctx.translate(x, by);
    const tails = (s) => ({ pts: [[s * (bw / 2 - 30), -bh / 2 + 26], [s * (bw / 2 + 40), -bh / 2 + 26], [s * (bw / 2 + 20), 12], [s * (bw / 2 + 40), bh / 2 + 10], [s * (bw / 2 - 30), bh / 2 + 10]], c: P.raspDark, tone: 0 });
    facets(ctx, [tails(-1), tails(1)], { blur: 10, sx: 4, sy: 8 });
    facets(ctx, [
      { pts: [[-bw / 2, -bh / 2], [bw / 2, -bh / 2], [bw / 2, 0], [-bw / 2, 0]], c: P.rasp, tone: 0.18 },
      { pts: [[-bw / 2, 0], [bw / 2, 0], [bw / 2, bh / 2], [-bw / 2, bh / 2]], c: P.rasp, tone: -0.08 },
    ], { blur: 18, sx: 6, sy: 12 });
    if (bu > 0.7) {
      const ix = -bw / 2 + 26, is = 88;
      ctx.save(); roundRect(ctx, ix, -is / 2, is, is, 20); ctx.clip(); ctx.drawImage(icon, ix, -is / 2, is, is); ctx.restore();
      ctx.strokeStyle = P.cream; ctx.lineWidth = 3; roundRect(ctx, ix, -is / 2, is, is, 20); ctx.stroke();
      ctx.fillStyle = P.cream; ctx.font = HF.bold(44); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('प्लान माय वेडिंग डाउनलोड करें', 52, 6);
    }
    ctx.restore();
    if (bu > 0.9) { ctx.fillStyle = P.ink; ctx.font = HF.sans(36); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('गूगल प्ले पर', x, by + 110); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- frame
export function drawFrame(ctx, tReal) {
  const t = stepT(tReal);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = P.blush; ctx.fillRect(0, 0, W, H);
  backdrop(ctx);
  hook(ctx, t);
  cards(ctx, t);
  towers(ctx, t);
  illustrative(ctx, t);
  sheet(ctx, t);
  endCard(ctx, t);
  const cs = craneState(t);
  if (cs) {
    const j = jit(t, 7, 1.5);
    ctx.save(); ctx.translate(cs.x + j.x, cs.y + j.y); if (cs.rot) ctx.rotate(cs.rot);
    crane(ctx, 0, 0, cs.s, 1, cs.phi, cs.dir, cs.s > 1 ? { blur: 30, shx: 18, shy: 30 } : {});
    ctx.restore();
  }
  captions(ctx, t);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.55;
  ctx.drawImage(grain, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}
