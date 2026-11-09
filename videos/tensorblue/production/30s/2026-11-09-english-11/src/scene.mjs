// Tensorblue 30s english-11 · episode 01 — "Why a sent photo can lose tiny writing"
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged): kinetic type + tactile cards + blue wipes,
// before/after staging. Story objects: one fictional ticket photo, its lossy re-saved copy and the
// original file, enlarged crops (same filter for both), OCR verdicts, a quoted help-page card and the
// takeaway options. All images and numbers are the real outputs in demo/out (Pillow + Tesseract).
// Every cue is timed from the narration's word timings (voice-timing.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalFonts, loadImage } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, pill, makeBackground,
} from './brt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(HERE, '../../../../assets');
GlobalFonts.registerFromPath(path.join(ASSETS, 'fonts/jetbrains-mono/JetBrainsMono-Bold.ttf'), 'MonoB');
GlobalFonts.registerFromPath(path.join(ASSETS, 'fonts/jetbrains-mono/JetBrainsMono-Medium.ttf'), 'MonoM');
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- the real demo -----------------------------------------------------------------------
const DD = path.resolve(HERE, 'demo/out');
const DEMO = JSON.parse(fs.readFileSync(path.join(DD, 'photo-demo.json'), 'utf8'));
const IMG_ORIG = await loadImage(fs.readFileSync(path.join(DD, 'original.jpg')));
const IMG_RESAVED = await loadImage(fs.readFileSync(path.join(DD, 'resaved.jpg')));
const CROP_ORIG = await loadImage(fs.readFileSync(path.join(DD, 'crop-original.png')));
const CROP_RESAVED = await loadImage(fs.readFileSync(path.join(DD, 'crop-resaved.png')));
if (!DEMO.ocr.original_reads_code || DEMO.ocr.resaved_reads_code || !DEMO.as_document.identical_to_original) throw new Error('demo result changed');
const KB = (b) => `${Math.round(b / 1000)} KB`;
const OCR_BAD = DEMO.ocr.resaved_crop.split(' ').slice(-1)[0];          // what OCR read for the code in the re-saved copy

// ---- cues -----------------------------------------------------------------------------
const T = {
  same: VW('L1', 'same'), twice: VW('L1', 'twice'), why: VW('L1', 'why'), read: VW('L1', 'read'), one1: VW('L1', 'one'),
  shrink: VW('L2', 'shrink'), lossy2: VW('L2', 'lossy'), compression: VW('L2', 'compression'),
  lossy3: VW('L3', 'lossy'), discarded: VW('L3', 'discarded'), good: VW('L3', 'good'), tiny: VW('L3', 'tiny'), suffers: VW('L3', 'suffers'), most: VW('L3', 'most'),
  whatsapps: VW('L4', "whatsapp's"), usually: VW('L4', 'usually'), compressed: VW('L4', 'compressed'), offers: VW('L4', 'offers'), hd4: VW('L4', 'hd'),
  resaved: VW('L5', 're-saved'), code: VW('L5', 'code'), into: VW('L5', 'into'), guess: VW('L5', 'guess'), original5: VW('L5', 'original'), kept: VW('L5', 'kept'),
  fine: VW('L6', 'fine'), hd6: VW('L6', 'hd'), attach: VW('L6', 'attach'), document: VW('L6', 'document'), then: VW('L6', 'then'), check: VW('L6', 'check'),
  follow: VW('L7', 'follow'), tb: VW('L7', 'tensorblue'),
};
const SC = [0, VL('L1').t1 + 0.2, VL('L2').t1 + 0.12, VL('L3').t1 + 0.12, VL('L4').t1 + 0.12, VL('L5').t1 + 0.15, VL('L7').t0 - 0.35, 30.01];
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
// an image inside a rounded frame (tactile print)
function framed(ctx, img, x, y, w, h, o = {}) {
  const { alpha = 1, sx = 0, sy = 0, sw = img.width, sh = img.height, border = C.white, r = 18 } = o;
  if (alpha <= 0) return;
  card(ctx, x - 8, y - 8, w + 16, h + 16, { fill: border, r: r + 4, alpha, depth: 8 });
  ctx.save(); ctx.globalAlpha = alpha * S.alpha; rr(ctx, x, y, w, h, r); ctx.clip();
  ctx.imageSmoothingEnabled = true; ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h); ctx.restore();
}
function magnifier(ctx, cx, cy, r, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.strokeStyle = C.blue; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + r * 0.72, cy + r * 0.72); ctx.lineTo(cx + r * 1.4, cy + r * 1.4); ctx.stroke(); ctx.restore();
}

// ---- captions (accepted treatment: Inter SemiBold 54 px, ink inside y 340–520, x 90–990) -------
const CAPS = [
  { t0: VL('L1').t0, lines: ['Same photo, sent twice.'] },
  { t0: T.why, lines: ["Why can't you read this one?"] },
  { t0: VL('L2').t0, lines: ['Chat apps often shrink photos', 'with lossy compression.'] },
  { t0: VL('L3').t0, lines: ['Lossy means detail', 'is discarded for good.'] },
  { t0: T.tiny, lines: ['Tiny text suffers most.'] },
  { t0: VL('L4').t0, lines: ["WhatsApp's help says shared", 'media is usually compressed,'] },
  { t0: VW('L4', 'and'), lines: ['and offers HD.'] },
  { t0: VL('L5').t0, lines: ['In our test, the re-saved copy', 'turned the code into a guess;'] },
  { t0: VW('L5', 'the', 3), lines: ['the original kept it.'] },
  { t0: VL('L6').t0, lines: ['Fine print? Send HD,', 'or attach it as a document,'] },
  { t0: T.then, lines: ['then check it.'], tEnd: VL('L6').t1 + 0.9 },
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
// the ticket area of each image (same physical region), for the thumbnails
const TICKET = { x: 330, y: 1150, w: 2460, h: 1700 };
const sc = DEMO.resaved.pixels[0] / DEMO.original.pixels[0];
// S1 hook: two copies that look the same small — enlarged, one code is a smear
function s1(ctx, t) {
  const cols = [[120, IMG_RESAVED, CROP_RESAVED, 're-saved photo', sc, false], [565, IMG_ORIG, CROP_ORIG, 'original file', 1, true]];
  cols.forEach(([x, img, crop, label, k, ok], i) => {
    framed(ctx, img, x, 600, 395, 273, { sx: TICKET.x * k, sy: TICKET.y * k, sw: TICKET.w * k, sh: TICKET.h * k });
    text(ctx, label, x + 197, 935, { size: 30, font: 'InterB', color: C.white });
    const z = easeOut(ev(t, 0.25 + i * 0.12, 0.35));
    if (z > 0) framed(ctx, crop, x, lerp(1060, 990, z), 395, 197, { alpha: z });
    badge(ctx, x + 380, 990, 26, ok, ev(t, 0.75 + i * 0.1, 0.3));
  });
  kpair(ctx, "Can't you ", 'read this one?', 1330, 64, t, T.why - 0.05, T.read - 0.05);
}
// S2 the shrink: real pixel counts and file sizes (our test settings)
function s2(ctx, t) {
  const t0 = SC[1];
  const a = easeOut(ev(t, t0, 0.3));
  const k = ease(ev(t, T.shrink - 0.1, 0.7));
  framed(ctx, IMG_ORIG, 150, 620, 300, 400, { alpha: a });
  text(ctx, 'original', 300, 1080, { size: 30, font: 'InterB', color: C.white, alpha: a });
  text(ctx, `${DEMO.original.pixels.join(' × ')}`, 300, 1122, { size: 28, font: 'MonoB', color: C.gray, alpha: a });
  text(ctx, KB(DEMO.original.bytes), 300, 1160, { size: 34, font: 'MonoB', color: C.white, alpha: a });
  // the copy shrinks into the right-hand slot
  const w = lerp(300, 130, k), h = w * 4 / 3, x = lerp(150, 690, k), y = lerp(620, 760, k);
  if (k > 0) framed(ctx, IMG_RESAVED, x, y, w, h, { alpha: clamp(k * 3) });
  const r = easeOut(ev(t, T.lossy2 - 0.1, 0.3));
  text(ctx, 're-saved', 755, 1080, { size: 30, font: 'InterB', color: C.white, alpha: r });
  text(ctx, `${DEMO.resaved.pixels.join(' × ')}`, 755, 1122, { size: 28, font: 'MonoB', color: C.gray, alpha: r });
  text(ctx, KB(DEMO.resaved.bytes), 755, 1160, { size: 34, font: 'MonoB', color: C.blue, alpha: r });
  pill(ctx, 540, 1255, `our test: ${DEMO.resaved.long_edge} px, JPEG quality ${DEMO.resaved.jpeg_quality}`, { size: 28, fill: C.pale, color: C.ink, alpha: easeOut(ev(t, T.compression, 0.3)) });
  kpair(ctx, 'Lossy ', 'compression', 1440, 80, t, T.lossy2 - 0.05, T.compression - 0.05);
}
// S3 lossy = discarded for good; big text survives, tiny text smears (both from the re-saved copy)
function s3(ctx, t) {
  const t0 = SC[2];
  const a = easeOut(ev(t, t0, 0.3));
  card(ctx, 130, 620, 820, 150, { fill: C.white, r: 24, alpha: a });
  text(ctx, 'lossy compression', 170, 680, { size: 30, font: 'InterB', color: C.blue, align: 'left', alpha: a });
  text(ctx, 'drops parts of the data — it can’t be restored', 170, 728, { size: 32, font: 'InterB', color: C.ink, align: 'left', alpha: easeOut(ev(t, T.discarded - 0.1, 0.3)) });
  const b = easeOut(ev(t, T.tiny - 0.2, 0.3));
  // big headline from the re-saved copy (still fine) vs the tiny code from the same copy
  framed(ctx, IMG_RESAVED, 150, 840, 380, 110, { alpha: b, sx: 150, sy: 410, sw: 456, sh: 132 });
  text(ctx, 'big text: still fine', 340, 1010, { size: 28, font: 'InterB', color: C.white, alpha: b });
  framed(ctx, CROP_RESAVED, 570, 820, 360, 183, { alpha: easeOut(ev(t, T.suffers - 0.15, 0.3)) });
  text(ctx, 'tiny text: smeared', 750, 1050, { size: 28, font: 'InterB', color: C.white, alpha: easeOut(ev(t, T.suffers - 0.1, 0.3)) });
  text(ctx, 'both from the same re-saved photo', 540, 1120, { size: 26, font: 'InterSB', color: C.gray, alpha: easeOut(ev(t, T.most, 0.3)) });
  kpair(ctx, 'Tiny text ', 'suffers most.', 1440, 76, t, T.tiny - 0.05, T.suffers - 0.05);
}
// S4 one real app's documented behaviour: a quoted help-page card (no app UI), then a quality choice
function s4(ctx, t) {
  const t0 = SC[3];
  const a = easeOut(ev(t, t0, 0.3));
  card(ctx, 130, 620, 820, 330, { fill: C.white, r: 26, alpha: a });
  text(ctx, 'WhatsApp Help Center', 170, 682, { size: 30, font: 'InterB', color: C.grayDark, align: 'left', alpha: a });
  text(ctx, 'How to send media', 170, 722, { size: 28, font: 'InterSB', color: C.grayDark, align: 'left', alpha: a });
  const q = easeOut(ev(t, T.usually - 0.15, 0.3));
  text(ctx, '“…media files are usually', 170, 800, { size: 42, font: 'IDB', color: C.ink, align: 'left', alpha: q });
  text(ctx, 'compressed when shared.”', 170, 856, { size: 42, font: 'IDB', color: C.blue, align: 'left', alpha: q });
  text(ctx, 'faq.whatsapp.com', 910, 910, { size: 24, font: 'MonoM', color: C.grayDark, align: 'right', alpha: q });
  // a generic quality choice (our own drawing, not the app's UI)
  const c = easeOut(ev(t, T.offers - 0.1, 0.3)), on = ease(ev(t, T.hd4 - 0.05, 0.3));
  ctx.save(); ctx.globalAlpha = c * S.alpha; ctx.fillStyle = C.pale; rr(ctx, 290, 1010, 500, 100, 50); ctx.fill();
  ctx.fillStyle = C.blue; rr(ctx, lerp(296, 540, on), 1016, 244, 88, 44); ctx.fill(); ctx.restore();
  text(ctx, 'Standard', 418, 1074, { size: 34, font: 'IDXB', color: on < 0.5 ? C.white : C.ink, alpha: c });
  text(ctx, 'HD', 662, 1074, { size: 34, font: 'IDXB', color: on >= 0.5 ? C.white : C.ink, alpha: c });
  text(ctx, 'photo quality option', 540, 1160, { size: 26, font: 'InterSB', color: C.gray, alpha: c });
  kpair(ctx, 'Usually ', 'compressed', 1440, 80, t, T.usually - 0.05, T.compressed - 0.05);
}
// S5 the result (real): enlarged crops + what OCR read; the original file is byte-identical
function s5(ctx, t) {
  const t0 = SC[4];
  const a = easeOut(ev(t, t0, 0.3)), b = easeOut(ev(t, T.original5 - 0.15, 0.3));
  framed(ctx, CROP_RESAVED, 150, 620, 500, 255, { alpha: a });
  // on "code": outline the booking code inside the enlarged crop
  const hk = easeOut(ev(t, T.code - 0.1, 0.3));
  if (hk > 0) { ctx.save(); ctx.globalAlpha = hk * S.alpha; ctx.strokeStyle = C.blue; ctx.lineWidth = 6; rr(ctx, 172, 748, 260, 64, 14); ctx.stroke(); ctx.restore(); }
  badge(ctx, 650, 625, 28, false, ev(t, T.guess - 0.1, 0.3));
  text(ctx, 're-saved', 700, 700, { size: 30, font: 'InterB', color: C.white, align: 'left', alpha: a });
  text(ctx, `OCR: ${OCR_BAD}`, 700, 750, { size: 32, font: 'MonoB', color: C.gray, align: 'left', alpha: easeOut(ev(t, T.guess - 0.1, 0.3)) });
  framed(ctx, CROP_ORIG, 150, 940, 500, 250, { alpha: b });
  badge(ctx, 650, 945, 28, true, ev(t, T.kept - 0.1, 0.3));
  text(ctx, 'original', 700, 1020, { size: 30, font: 'InterB', color: C.white, align: 'left', alpha: b });
  text(ctx, `OCR: ${DEMO.code}`, 700, 1070, { size: 32, font: 'MonoB', color: C.blue, align: 'left', alpha: easeOut(ev(t, T.kept - 0.1, 0.3)) });
  text(ctx, 'the original file, copied as-is: same SHA-256', 540, 1262, { size: 26, font: 'InterSB', color: C.gray, alpha: easeOut(ev(t, T.kept, 0.3)) });
  kpair(ctx, 'Into a ', 'guess.', 1440, 88, t, T.into - 0.05, T.guess - 0.05);
}
// S6 takeaway: two ways to keep fine print, then check
function s6(ctx, t) {
  const t0 = SC[5];
  kword(ctx, 'Fine print?', 540, 660, 84, t, T.fine - 0.05);
  const r1 = easeOut(ev(t, T.hd6 - 0.15, 0.3)), r2 = easeOut(ev(t, T.attach - 0.1, 0.3));
  card(ctx, 130, 720, 820, 130, { fill: C.white, r: 24, alpha: r1 });
  badge(ctx, 200, 785, 28, true, ev(t, T.hd6 - 0.05, 0.3));
  text(ctx, 'Send in HD quality', 250, 800, { size: 40, font: 'InterB', color: C.ink, align: 'left', alpha: r1 });
  card(ctx, 130, 880, 820, 130, { fill: C.white, r: 24, alpha: r2 });
  badge(ctx, 200, 945, 28, true, ev(t, T.document - 0.05, 0.3));
  text(ctx, 'or attach it as a document', 250, 960, { size: 40, font: 'InterB', color: C.ink, align: 'left', alpha: r2 });
  const c = easeOut(ev(t, T.then - 0.1, 0.3));
  if (c > 0) {
    framed(ctx, CROP_ORIG, 330, 1060, 300, 150, { alpha: c });
    magnifier(ctx, 680, 1120, 30, c);
    text(ctx, 'zoom in on', 740, 1120, { size: 28, font: 'InterB', color: C.white, align: 'left', alpha: c });
    text(ctx, 'what arrived', 740, 1156, { size: 28, font: 'InterB', color: C.white, align: 'left', alpha: c });
  }
  kpair(ctx, 'Then ', 'check it.', 1440, 88, t, T.then - 0.05, T.check - 0.05);
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
  add(0.25, 'slide', { soft: true }); add(0.37, 'slide', { soft: true }); add(0.75, 'strike'); add(0.85, 'match'); add(T.read - 0.05, 'type');
  for (let i = 1; i < SCENES.length; i++) add(SC[i] - WIPE / 2, 'wipe');
  add(T.shrink - 0.1, 'slide'); add(T.lossy2 - 0.1, 'blip', { lo: true }); add(T.compression - 0.05, 'type');
  add(T.discarded - 0.1, 'carve'); add(T.tiny - 0.2, 'clack', { soft: true }); add(T.suffers - 0.15, 'clack'); add(T.suffers - 0.05, 'type', { lo: true });
  add(T.usually - 0.15, 'paper'); add(T.offers - 0.1, 'clack', { soft: true }); add(T.hd4 - 0.05, 'tap');
  add(T.guess - 0.1, 'strike'); add(T.original5 - 0.15, 'slide', { soft: true }); add(T.kept - 0.1, 'match'); add(T.guess - 0.05, 'type');
  add(T.fine - 0.05, 'type'); add(T.hd6 - 0.05, 'blip'); add(T.document - 0.05, 'blip'); add(T.then - 0.1, 'slide', { soft: true }); add(T.chime, 'chime');
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
