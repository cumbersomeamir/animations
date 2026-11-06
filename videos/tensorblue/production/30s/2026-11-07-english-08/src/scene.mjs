// Tensorblue 30s english-08 · episode 01 — "Why a deleted photo is still there"
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged): kinetic type + tactile cards + simple
// isometric stage (one backup drive) + blue wipes, before/after staging.
// Story objects: one code-drawn photo card (beach.jpg), a phone, the cloud, a laptop, the trash,
// a "deleted" record card that travels between devices, and an older backup. Where the photo
// exists after each step is the real result in demo/out/sync-demo.json (real folders + rsync).
// Every cue is timed from the narration's word timings (voice-timing.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, pill,
  isoP, isoBox, makeBackground,
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

// ---- the real demo (folders + rsync): where beach.jpg exists after each step -------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/sync-demo.json'), 'utf8'));
const has = (step, place) => { const s = DEMO.steps[step].state[place]; return !!s && s.includes(DEMO.photo); };
{
  const want = [[1, ['cloud', 'laptop', 'backup-monday']], [2, ['cloud-trash', 'backup-monday']], [4, []]];
  for (const [i, places] of want) for (const p of ['phone', 'cloud', 'laptop', 'cloud-trash', 'backup-monday'])
    if (has(i, p) !== places.includes(p)) throw new Error('demo result changed at step ' + i + ' / ' + p);
}

// ---- cues -----------------------------------------------------------------------------
const T = {
  deleted: VW('L1', 'deleted'), why: VW('L1', 'why'), still: VW('L1', 'still'), laptop1: VW('L1', 'laptop'),
  only: VW('L2', 'only'), remove2: VW('L2', 'remove'), device2: VW('L2', "device's"), copy2: VW('L2', 'copy'), cloud2: VW('L2', 'cloud'), keeps: VW('L2', 'keeps'),
  synced: VW('L3', 'synced'), different: VW('L3', 'different'), every: VW('L3', 'every'), device3: VW('L3', 'device'), removes: VW('L3', 'removes'),
  waits: VW('L4', 'waits'), trash4: VW('L4', 'trash'), often: VW('L4', 'often'), thirty: VW('L4', 'thirty'), days: VW('L4', 'days'),
  older: VW('L5', 'older'), backups5: VW('L5', 'backups'), keep5: VW('L5', 'keep'), until: VW('L5', 'until'), removed5: VW('L5', 'removed'),
  permanent: VW('L6', 'permanent'), sync6: VW('L6', 'sync'), empty6: VW('L6', 'empty'), check6: VW('L6', 'check'), backups6: VW('L6', 'backups'),
  follow: VW('L7', 'follow'), tb: VW('L7', 'tensorblue'),
};
const SC = [0, VL('L1').t1 + 0.2, VL('L2').t1 + 0.15, VL('L3').t1 + 0.15, VL('L4').t1 + 0.15, VL('L5').t1 + 0.15, VL('L7').t0 - 0.35, 30.01];
const WIPE = 0.5;
const WDIR = [0, 1, -1, 2, 1, -1, 2];   // 1 = L->R, -1 = R->L, 2 = bottom->top
T.chime = VL('L6').t1 + 0.12;
export const CUES = { ...T, scenes: SC };

// ---- story objects ---------------------------------------------------------------------
function card(ctx, x, y, w, h, o = {}) {
  const { fill = C.pale, edge = C.gray, r = 26, alpha = 1, depth = 10 } = o;
  if (alpha <= 0) return;
  shadow(ctx, x + w / 2, y + h + depth + 8, w * 0.5, 24, 0.6 * alpha);
  ctx.save(); ctx.globalAlpha = alpha * S.alpha;
  ctx.fillStyle = edge; rr(ctx, x, y + depth, w, h, r); ctx.fill();
  ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill();
  ctx.restore();
}
function tickMark(ctx, x, y, s, color = C.white) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.32; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.42, y + s * 0.02); ctx.lineTo(x - s * 0.12, y + s * 0.32); ctx.lineTo(x + s * 0.46, y - s * 0.3); ctx.stroke(); ctx.restore();
}
function crossMark(ctx, x, y, s, color = C.white) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.3, y - s * 0.3); ctx.lineTo(x + s * 0.3, y + s * 0.3); ctx.moveTo(x + s * 0.3, y - s * 0.3); ctx.lineTo(x - s * 0.3, y + s * 0.3); ctx.stroke(); ctx.restore();
}
function badge(ctx, x, y, r, ok, k = 1) {
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(back(k), back(k));
  ctx.fillStyle = ok ? C.blue : C.ink; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  if (ok) tickMark(ctx, 0, 0, r * 1.05); else crossMark(ctx, 0, 0, r * 1.05);
  ctx.restore();
}
function kpair(ctx, a, b, y, size, t, ta, tb, o = {}) {
  const font = o.font || 'IDXB', w1 = textW(ctx, a, size, font, -1), w2 = textW(ctx, b, size, font, -1), x0 = 540 - (w1 + w2) / 2;
  kword(ctx, a, x0, y, size, t, ta, { align: 'left', font, t1: o.t1 });
  kword(ctx, b, x0 + w1, y, size, t, tb, { align: 'left', font, color: C.blue, t1: o.t1 });
}
// the photo: an original code-drawn beach picture in the palette (sky, sun, sea, sand) on a white print
function photo(ctx, cx, cy, w, o = {}) {
  const { alpha = 1, label = true, rot = 0, dim = 0 } = o;
  if (alpha <= 0 || w <= 0) return;
  const h = w * (label ? 1.18 : 1.0), x = -w / 2, y = -h / 2, p = w * 0.07, iw = w - 2 * p, ih = iw * 0.86;
  shadow(ctx, cx + w * 0.04, cy + h / 2 + w * 0.04, w * 0.5, w * 0.07, 0.55 * alpha);
  ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.fillStyle = C.white; rr(ctx, x, y, w, h, w * 0.06); ctx.fill();
  ctx.save(); rr(ctx, x + p, y + p, iw, ih, w * 0.03); ctx.clip();
  ctx.fillStyle = C.pale; ctx.fillRect(x + p, y + p, iw, ih);                                      // sky
  ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(x + p + iw * 0.72, y + p + ih * 0.3, iw * 0.12, 0, Math.PI * 2); ctx.fill(); // sun
  ctx.fillStyle = C.blue; ctx.fillRect(x + p, y + p + ih * 0.52, iw, ih * 0.24);                    // sea
  ctx.fillStyle = C.blueDeep; ctx.fillRect(x + p, y + p + ih * 0.52, iw, ih * 0.05);
  ctx.fillStyle = C.gray; ctx.beginPath(); ctx.moveTo(x + p, y + p + ih * 0.78); ctx.quadraticCurveTo(x + p + iw * 0.5, y + p + ih * 0.66, x + p + iw, y + p + ih * 0.8); ctx.lineTo(x + p + iw, y + p + ih); ctx.lineTo(x + p, y + p + ih); ctx.closePath(); ctx.fill(); // sand
  if (dim > 0) { ctx.fillStyle = `rgba(3,6,16,${0.45 * dim})`; ctx.fillRect(x + p, y + p, iw, ih); }
  ctx.restore();
  if (label) text(ctx, 'beach.jpg', 0, y + p + ih + (h - p - ih) * 0.62, { size: w * 0.105, font: 'InterB', color: C.ink });
  ctx.restore();
}
// an empty slot where the photo used to be
function emptySlot(ctx, cx, cy, w, label, k = 1) {
  if (k <= 0) return;
  const h = w * 1.18;
  ctx.save(); ctx.globalAlpha = clamp(k) * S.alpha; ctx.setLineDash([12, 9]); ctx.strokeStyle = C.grayMid; ctx.lineWidth = 4;
  rr(ctx, cx - w / 2, cy - h / 2, w, h, w * 0.06); ctx.stroke(); ctx.restore();
  text(ctx, label, cx, cy + 10, { size: Math.max(22, w * 0.11), font: 'InterB', color: C.grayDark, alpha: clamp(k) });
}
// device frames
function phoneFrame(ctx, cx, top, w, h, o = {}) {
  const { alpha = 1 } = o;
  card(ctx, cx - w / 2, top, w, h, { fill: C.pale, r: w * 0.15, alpha });
  ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.fillStyle = C.gray; rr(ctx, cx - w * 0.14, top + 16, w * 0.28, 12, 6); ctx.fill(); ctx.restore();
  text(ctx, 'Phone', cx, top + 66, { size: Math.max(26, w * 0.1), font: 'IDXB', color: C.ink, alpha });
}
function laptopFrame(ctx, cx, cy, w, o = {}) {
  const { alpha = 1 } = o, h = w * 0.66, x = cx - w / 2, y = cy - h / 2;
  shadow(ctx, cx, y + h + 46, w * 0.62, 22, 0.6 * alpha);
  ctx.save(); ctx.globalAlpha = alpha * S.alpha;
  ctx.fillStyle = C.gray; rr(ctx, x, y, w, h, 20); ctx.fill();
  ctx.fillStyle = C.pale; rr(ctx, x + 14, y + 14, w - 28, h - 28, 12); ctx.fill();
  ctx.fillStyle = C.grayMid; ctx.beginPath(); ctx.moveTo(x - 28, y + h + 6); ctx.lineTo(x + w + 28, y + h + 6); ctx.lineTo(x + w + 10, y + h + 34); ctx.lineTo(x - 10, y + h + 34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.gray; ctx.fillRect(x - 28, y + h, w + 56, 8);
  ctx.restore();
  text(ctx, 'Laptop', cx, y + h + 84, { size: Math.max(28, w * 0.09), font: 'IDXB', color: C.white, alpha });
}
function cloudShape(ctx, cx, cy, s, o = {}) {
  const { alpha = 1, fill = C.pale } = o;
  const blobs = [[-0.42, 0.12, 0.3], [-0.12, -0.12, 0.38], [0.26, -0.02, 0.32], [0.48, 0.18, 0.22], [0.02, 0.2, 0.3]];
  shadow(ctx, cx, cy + s * 0.5, s * 0.75, s * 0.08, 0.5 * alpha);
  ctx.save(); ctx.globalAlpha = alpha * S.alpha;
  for (const [fill2, dy] of [[C.gray, s * 0.06], [fill, 0]]) {
    ctx.fillStyle = fill2;
    ctx.beginPath(); for (const [bx, by, br] of blobs) { ctx.moveTo(cx + bx * s + br * s, cy + by * s + dy); ctx.arc(cx + bx * s, cy + by * s + dy, br * s, 0, Math.PI * 2); } ctx.fill();
    rr(ctx, cx - s * 0.66, cy + dy, s * 1.36, s * 0.42, s * 0.2); ctx.fill();
  }
  ctx.restore();
  text(ctx, 'Cloud', cx, cy + s * 0.75, { size: s * 0.16, font: 'IDXB', color: C.white, alpha });
}
function binIcon(ctx, cx, cy, s, color = C.ink) {
  ctx.save(); ctx.fillStyle = color;
  rr(ctx, cx - s * 0.42, cy - s * 0.42, s * 0.84, s * 0.12, s * 0.05); ctx.fill();
  rr(ctx, cx - s * 0.12, cy - s * 0.52, s * 0.24, s * 0.1, s * 0.04); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx - s * 0.34, cy - s * 0.25); ctx.lineTo(cx + s * 0.34, cy - s * 0.25); ctx.lineTo(cx + s * 0.27, cy + s * 0.5); ctx.lineTo(cx - s * 0.27, cy + s * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
// the "deleted" record that travels from device to device
function deleteRecord(ctx, cx, cy, k, o = {}) {
  if (k <= 0) return;
  const w = 290, h = 74;
  ctx.save(); ctx.globalAlpha = clamp(k * 3) * S.alpha;
  shadow(ctx, cx, cy + h / 2 + 8, w * 0.45, 12, 0.6);
  ctx.fillStyle = C.blueDeep; rr(ctx, cx - w / 2, cy - h / 2 + 6, w, h, 18); ctx.fill();
  ctx.fillStyle = C.blue; rr(ctx, cx - w / 2, cy - h / 2, w, h, 18); ctx.fill();
  ctx.restore();
  crossMark(ctx, cx - w / 2 + 34, cy, 30);
  text(ctx, 'delete: beach.jpg', cx - w / 2 + 62, cy + 9, { size: 25, font: 'InterB', align: 'left', alpha: clamp(k * 3) });
}

// ---- captions (accepted treatment: Inter SemiBold 54 px, ink inside y 340–520, x 90–990) -------
const CAPS = [
  { t0: VL('L1').t0, lines: ['You deleted this photo', 'on your phone.'] },
  { t0: T.why, lines: ['Why is it still', 'on your laptop?'] },
  { t0: VL('L2').t0, lines: ['Some deletes only remove', "this device's copy."] },
  { t0: VW('L2', 'the'), lines: ['The cloud keeps its own.'] },
  { t0: VL('L3').t0, lines: ['A synced delete is different:'] },
  { t0: T.every, lines: ['every device', 'removes its copy.'] },
  { t0: VL('L4').t0, lines: ['Even then,', 'it waits in the trash,'] },
  { t0: T.often, lines: ['often for thirty days.'] },
  { t0: VL('L5').t0, lines: ['And older backups can keep', "a copy until they're removed."] },
  { t0: VL('L6').t0, lines: ['For permanent removal:'] },
  { t0: T.sync6, lines: ['sync the delete,', 'empty the trash,'] },
  { t0: T.check6, lines: ['check your backups.'], tEnd: VL('L6').t1 + 0.9 },
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
// S1 hook: deleted on the phone (first second), still on the laptop
function s1(ctx, t) {
  phoneFrame(ctx, 290, 650, 300, 560);
  const press = ev(t, 0.12, 0.1) * (1 - ev(t, 0.35, 0.12));
  // phone: photo shrinks into the bin under it
  const gone = ease(ev(t, 0.3, 0.45));
  if (gone < 1) photo(ctx, lerp(290, 290, gone), lerp(905, 1100, gone), lerp(220, 40, gone), { alpha: 1 - easeIn(gone) });
  emptySlot(ctx, 290, 905, 220, 'deleted', ev(t, 0.7, 0.3));
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.fillStyle = press > 0.5 ? C.gray : C.white; rr(ctx, 290 - 70, 1110 + 4 * press, 140, 64, 20); ctx.fill(); ctx.restore();
  binIcon(ctx, 290, 1142 + 4 * press, 34);
  // laptop: the same photo, still there
  laptopFrame(ctx, 760, 900, 330);
  photo(ctx, 760, 925, 150);
  const st = ev(t, 0.85, 0.3);
  if (st > 0) { ctx.save(); ctx.globalAlpha = clamp(st * 2) * S.alpha; ctx.strokeStyle = C.blue; ctx.lineWidth = 6; rr(ctx, 760 - 84, 925 - 97, 168, 194, 14); ctx.stroke(); ctx.restore(); }
  pill(ctx, 760, 1230, 'still here', { size: 34, fill: C.blue, color: C.white, alpha: easeOut(ev(t, 0.9, 0.3)) });
  kpair(ctx, 'Still on your ', 'laptop?', 1440, 70, t, T.still - 0.05, T.laptop1 - 0.05);
}

// shared triangle layout for S2/S3: cloud on top, phone bottom-left, laptop bottom-right
const CL = { x: 540, y: 730 }, PH = { x: 285, top: 870 }, LP = { x: 770, y: 1040 };
function trio(ctx, t, o) {
  cloudShape(ctx, CL.x, CL.y, 230);
  phoneFrame(ctx, PH.x, PH.top, 240, 400);
  laptopFrame(ctx, LP.x, LP.y, 290);
  // copies
  const pk = o.phone, ck = o.cloud, lk = o.laptop;
  if (pk > 0) photo(ctx, PH.x, PH.top + 220, 130, { alpha: pk }); emptySlot(ctx, PH.x, PH.top + 220, 130, o.phoneLabel || 'removed', 1 - pk);
  if (ck > 0) photo(ctx, CL.x + 6, CL.y + 38, 112, { alpha: ck }); if (ck < 1) emptySlot(ctx, CL.x + 6, CL.y + 38, 112, 'removed', 1 - ck);
  if (lk > 0) photo(ctx, LP.x, LP.y + 22, 118, { alpha: lk }); if (lk < 1) emptySlot(ctx, LP.x, LP.y + 22, 118, 'removed', 1 - lk);
}
// S2 a device-only delete: the phone's copy goes, the cloud and laptop keep theirs
function s2(ctx, t) {
  const t0 = SC[1];
  const pk = 1 - ease(ev(t, T.remove2, 0.4));
  trio(ctx, t, { phone: pk, cloud: 1, laptop: 1, phoneLabel: 'removed' });
  pill(ctx, PH.x, PH.top + 440, 'Remove from this device', { size: 26, fill: ev(t, T.remove2 - 0.1, 0.05) > 0 ? C.blue : C.white, color: ev(t, T.remove2 - 0.1, 0.05) > 0 ? C.white : C.ink, alpha: easeOut(ev(t, t0, 0.3)) });
  const kk = ev(t, T.keeps - 0.1, 0.3);
  badge(ctx, CL.x + 72, CL.y - 22, 22, true, kk);
  pill(ctx, CL.x + 250, CL.y - 60, 'cloud copy kept', { size: 30, fill: C.blue, color: C.white, alpha: easeOut(kk) });
  badge(ctx, LP.x + 82, LP.y - 50, 22, true, ev(t, T.keeps + 0.15, 0.3));
  kpair(ctx, 'Only ', "this device's copy.", 1460, 60, t, T.only - 0.05, T.device2 - 0.05);
}
// S3 a synced delete: a "delete" record travels phone -> cloud -> laptop, each copy goes
function s3(ctx, t) {
  const t0 = SC[2];
  const ta = T.synced - 0.1, tb = T.different + 0.1, tc = T.removes - 0.25;
  const pk = 1 - ease(ev(t, ta, 0.35)), ck = 1 - ease(ev(t, tb + 0.55, 0.35)), lk = 1 - ease(ev(t, tc + 0.45, 0.35));
  trio(ctx, t, { phone: pk, cloud: ck, laptop: lk, phoneLabel: 'deleted' });
  pill(ctx, PH.x, PH.top + 440, 'Delete everywhere', { size: 26, fill: ev(t, ta, 0.05) > 0 ? C.blue : C.white, color: ev(t, ta, 0.05) > 0 ? C.white : C.ink, alpha: easeOut(ev(t, t0, 0.3)) });
  // the record: phone -> cloud, then cloud -> laptop (an object hand-off, no connector lines)
  const m1 = ease(ev(t, tb - 0.15, 0.6)), m2 = ease(ev(t, tc - 0.2, 0.6));
  if (t >= ta + 0.15 && t < tc + 0.7) {
    let x = lerp(PH.x, CL.x, m1), y = lerp(PH.top + 120, CL.y - 150, m1);
    if (m2 > 0) { x = lerp(CL.x, LP.x, m2); y = lerp(CL.y - 150, LP.y - 190, m2); }
    deleteRecord(ctx, x, y, ev(t, ta + 0.15, 0.2) * (1 - ev(t, tc + 0.5, 0.2)));
  }
  // the cloud's copy goes to its trash (seen next)
  const tr = ev(t, tb + 0.55, 0.3);
  if (tr > 0) { ctx.save(); ctx.globalAlpha = clamp(tr * 2) * S.alpha; ctx.fillStyle = C.white; rr(ctx, CL.x + 150, CL.y + 40, 120, 74, 16); ctx.fill(); ctx.restore(); binIcon(ctx, CL.x + 182, CL.y + 78, 34); text(ctx, '1', CL.x + 228, CL.y + 90, { size: 32, font: 'IDXB', color: C.blue, alpha: clamp(tr * 2) }); }
  kpair(ctx, 'Every ', 'device.', 1460, 76, t, T.every - 0.05, T.device3 - 0.05);
}
// S4 the trash: kept for a set time (often 30 days), still restorable
function s4(ctx, t) {
  const t0 = SC[3];
  const a = easeOut(ev(t, t0, 0.3));
  card(ctx, 170, 620, 740, 560, { fill: C.white, r: 30, alpha: a });
  binIcon(ctx, 230, 678, 46);
  text(ctx, 'Trash', 270, 694, { size: 44, font: 'IDXB', color: C.ink, align: 'left', alpha: a });
  text(ctx, 'recently deleted', 870, 692, { size: 28, font: 'InterSB', color: C.grayDark, align: 'right', alpha: a });
  const drop = ease(ev(t, T.waits - 0.25, 0.5));
  if (drop > 0) photo(ctx, 360, lerp(620, 900, drop), 220, { alpha: clamp(drop * 3), rot: lerp(-0.2, -0.04, drop) });
  // restore button (it can still come back)
  const rk = easeOut(ev(t, T.trash4, 0.3));
  ctx.save(); ctx.globalAlpha = rk * S.alpha; ctx.fillStyle = C.pale; rr(ctx, 540, 790, 320, 90, 24); ctx.fill(); ctx.restore();
  text(ctx, 'Restore', 700, 848, { size: 38, font: 'IDXB', color: C.ink, alpha: rk });
  // day counter: 30 cells fill from "often" to "days"
  const dk = ev(t, T.often, T.days + 0.3 - T.often), day = Math.max(1, Math.round(dk * 30));
  const ca = easeOut(ev(t, T.often - 0.2, 0.3));
  text(ctx, ca > 0 ? `day ${day} of 30` : '', 700, 960, { size: 40, font: 'IDXB', color: C.blue, alpha: ca });
  for (let i = 0; i < 30; i++) {
    const cx = 230 + (i % 15) * 42, cy = 1060 + Math.floor(i / 15) * 46;
    ctx.save(); ctx.globalAlpha = ca * S.alpha; ctx.fillStyle = i < day && dk > 0 ? C.blue : C.pale; rr(ctx, cx, cy, 34, 34, 8); ctx.fill(); ctx.restore();
  }
  kpair(ctx, 'Thirty ', 'days.', 1440, 84, t, T.thirty - 0.05, T.days - 0.05);
}
// S5 isometric stage: an older backup drive still holds a copy
const O5 = { x: 540, y: 1010, u: 56 };
const SLAB = { top: C.slab, left: C.slabSide, right: '#0A1428', edge: 'rgba(183,199,223,0.25)' };
const DRIVE = { top: C.pale, left: C.gray, right: '#A7B8D2', edge: 'rgba(3,6,16,0.25)' };
function s5(ctx, t) {
  const t0 = SC[4];
  const P = (x, y, z) => isoP(O5, x, y, z);
  shadow(ctx, O5.x, O5.y + 250, 380, 40, 0.5);
  isoBox(ctx, O5, -4, -4, -0.4, 8, 8, 0.4, SLAB);
  isoBox(ctx, O5, -2.6, -1.3, 0, 5.2, 2.6, 1.2, DRIVE);
  { const [lx, ly] = P(-2.3, 1.3, 0.4); ctx.save(); ctx.transform(0.866, 0.5, 0, 1, lx, ly); text(ctx, 'Backup · Monday', 0, 0, { size: 26, font: 'IDXB', color: C.ink, align: 'left' }); ctx.restore(); }
  { const [lx, ly] = P(2.2, 1.3, 0.62); ctx.save(); ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(lx, ly, 9, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  // the snapshot copy rises out of the drive
  const up = ease(ev(t, T.keep5 - 0.2, 0.6));
  const [tx, ty] = P(0, 0, 1.2);
  if (up > 0) photo(ctx, tx, lerp(ty, ty - 230, up), lerp(60, 180, up), { alpha: clamp(up * 3) });
  pill(ctx, tx + 220, ty - 230, "Monday's copy", { size: 30, fill: C.white, color: C.ink, alpha: easeOut(ev(t, T.keep5 + 0.3, 0.3)) });
  pill(ctx, 540, 1310, 'kept until this backup is removed', { size: 30, fill: C.pale, color: C.ink, alpha: easeOut(ev(t, T.until - 0.05, 0.3)) });
  kpair(ctx, 'Older ', 'backups.', 1450, 84, t, T.older - 0.05, T.backups5 - 0.05);
}
// S6 takeaway: three steps, and where a copy still exists after each (real demo states)
const PLACES = [['phone', 'Phone'], ['cloud', 'Cloud'], ['laptop', 'Laptop'], ['cloud-trash', 'Trash'], ['backup-monday', 'Backup']];
function s6(ctx, t) {
  const t0 = SC[5];
  kword(ctx, 'Permanent removal', 540, 650, 72, t, T.permanent - 0.05);
  const a = easeOut(ev(t, t0, 0.3));
  card(ctx, 150, 700, 780, 360, { fill: C.white, r: 28, alpha: a });
  const steps = [['Sync the delete', T.sync6], ['Empty the trash', T.empty6], ['Check your backups', T.check6]];
  steps.forEach(([s, tt], i) => {
    const y = 770 + i * 110, on = ev(t, tt - 0.05, 0.3);
    ctx.save(); ctx.globalAlpha = a * S.alpha; ctx.fillStyle = on > 0 ? C.blue : C.pale; ctx.beginPath(); ctx.arc(215, y, 30, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    if (on > 0) tickMark(ctx, 215, y, 30); else text(ctx, String(i + 1), 215, y + 12, { size: 34, font: 'IDXB', color: C.ink, alpha: a });
    text(ctx, s, 270, y + 14, { size: 42, font: 'InterB', color: C.ink, align: 'left', alpha: a });
  });
  // where beach.jpg still exists: start (step 0) -> synced delete (2) -> trash emptied -> backup removed (4)
  const stage = t >= T.check6 + 0.1 ? 'end' : t >= T.empty6 + 0.1 ? 'trash' : t >= T.sync6 + 0.1 ? 'sync' : 'start';
  PLACES.forEach(([key, label], i) => {
    const cx = 224 + i * 158, cy = 1210;
    let present;
    if (stage === 'start') present = DEMO.steps[0].state[key] ? DEMO.steps[0].state[key].includes(DEMO.photo) : false;
    else if (stage === 'sync') present = has(2, key);
    else if (stage === 'trash') present = !!(DEMO.steps[4].state_after_empty_trash[key] || []).includes(DEMO.photo);
    else present = has(4, key);
    if (stage === 'start' && key === 'cloud-trash') present = false;
    card(ctx, cx - 70, cy - 76, 140, 152, { fill: C.pale, r: 20, alpha: a, depth: 6 });
    if (present) photo(ctx, cx, cy - 18, 70, { alpha: a, label: false });
    else { ctx.save(); ctx.globalAlpha = a * S.alpha; ctx.setLineDash([8, 6]); ctx.strokeStyle = C.grayMid; ctx.lineWidth = 3; rr(ctx, cx - 35, cy - 53, 70, 70, 8); ctx.stroke(); ctx.restore(); }
    text(ctx, label, cx, cy + 50, { size: 26, font: 'InterB', color: C.ink, alpha: a });
  });
  pill(ctx, 540, 1360, 'no copy left', { size: 34, fill: C.blue, color: C.white, alpha: easeOut(ev(t, T.chime, 0.3)) });
  text(ctx, 'checked with real folders synced by rsync', 540, 1440, { size: 28, font: 'InterSB', color: C.gray, alpha: easeOut(ev(t, T.chime + 0.2, 0.3)) });
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
  add(0.12, 'tap'); add(0.3, 'slide', { soft: true }); add(0.85, 'blip', { hi: true }); add(T.still - 0.05, 'type'); add(T.laptop1 - 0.05, 'type', { lo: true });
  for (let i = 1; i < SCENES.length; i++) add(SC[i] - WIPE / 2, 'wipe');
  add(T.remove2 - 0.1, 'tap'); add(T.remove2, 'slide', { soft: true }); add(T.keeps - 0.1, 'blip', { hi: true }); add(T.device2 - 0.05, 'type');
  add(T.synced - 0.1, 'tap'); add(T.different - 0.05, 'slide'); add(T.different + 0.55, 'paper'); add(T.removes - 0.45, 'slide'); add(T.removes + 0.2, 'paper'); add(T.every - 0.05, 'type');
  add(T.waits - 0.25, 'paper'); add(T.trash4, 'clack', { soft: true }); add(T.often, 'carve'); add(T.thirty - 0.05, 'type'); add(T.days - 0.05, 'type', { lo: true });
  add(T.older - 0.05, 'type'); add(T.keep5 - 0.2, 'slot'); add(T.until - 0.05, 'blip');
  add(T.sync6 - 0.05, 'blip'); add(T.empty6 - 0.05, 'blip'); add(T.check6 - 0.05, 'blip', { hi: true }); add(T.permanent - 0.05, 'type'); add(T.chime, 'chime');
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
