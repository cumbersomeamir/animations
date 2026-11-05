// Tensorblue 30s feedback-05 · episode 01 — OCR से स्कैन पीडीएफ़ खोजने लायक कैसे बनता है
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) + the accepted Hindi treatment (Mukta, Kokoro Hindi).
// Every document visual is REAL output of the demo pipeline in ./demo (fictional slip -> scan.pdf ->
// OCRmyPDF/Tesseract -> searchable.pdf): the scan image, Tesseract's word boxes, the empty text of the scan,
// and the position of "Python" in the new PDF text layer. No line backgrounds.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalFonts, loadImage } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, makeBackground,
} from './brt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(HERE, '../../../../assets/fonts');
GlobalFonts.registerFromPath(path.join(ASSETS, 'mukta/Mukta-SemiBold.ttf'), 'MuktaSB');
GlobalFonts.registerFromPath(path.join(ASSETS, 'mukta/Mukta-Bold.ttf'), 'MuktaB');
GlobalFonts.registerFromPath(path.join(ASSETS, 'mukta/Mukta-ExtraBold.ttf'), 'MuktaXB');
GlobalFonts.registerFromPath(path.join(ASSETS, 'jetbrains-mono/JetBrainsMono-Bold.ttf'), 'MonoB');
GlobalFonts.registerFromPath(path.join(ASSETS, 'jetbrains-mono/JetBrainsMono-Medium.ttf'), 'MonoM');

// ---- the real demo artifacts ----------------------------------------------------------------
const DEMO = path.join(HERE, 'demo/out');
const SCAN = await loadImage(fs.readFileSync(path.join(DEMO, 'scan.png')));
const OCR = JSON.parse(fs.readFileSync(path.join(DEMO, 'ocr.json'), 'utf8'));
const [IW, IH] = OCR.size;
const PX = 150 / 72; // PDF points -> scan pixels (scan rendered at 150 dpi)
const bboxHtml = fs.readFileSync(path.join(DEMO, 'searchable_bbox.html'), 'utf8');
const m = bboxHtml.match(/<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">Python<\/word>/);
const HIT = { x: +m[1] * PX, y: +m[2] * PX, w: (+m[3] - +m[1]) * PX, h: (+m[4] - +m[2]) * PX }; // "Python" in searchable.pdf
const WORDS = OCR.words;
const PYW = WORDS.find((w) => w.text === 'Python');
const DUE = (() => { const ln = WORDS.find((w) => w.text === 'Due').line; const ws = WORDS.filter((w) => w.line === ln);
  const x0 = Math.min(...ws.map((w) => w.x)), y0 = Math.min(...ws.map((w) => w.y)), x1 = Math.max(...ws.map((w) => w.x + w.w)), y1 = Math.max(...ws.map((w) => w.y + w.h));
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, text: ws.map((w) => w.text).join(' ') }; })();
const AFTER_LINES = OCR.after_text.split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
const BEFORE_CHARS = OCR.before_text.trim().length; // 0: the scan PDF has no text

const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.replace(/[।,?.!]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- cues -----------------------------------------------------------------------------------
const T = {
  mil: VW('L1', 'मिल'), kaise: VW('L1', 'कैसे'),
  tasveer2: VW('L2', 'तस्वीर'), usmen: VW('L2', 'उसमें'), text2: VW('L2', 'टेक्स्ट'),
  ocr3: VW('L3', 'ओसीआर'), akshar: VW('L3', 'अक्षर'), text3: VW('L3', 'टेक्स्ट'), har: VW('L3', 'हर'), jagah: VW('L3', 'जगह'),
  neeche: VW('L4', 'नीचे'), adrishya: VW('L4', 'अदृश्य'), parat: VW('L4', 'परत'),
  chune: VW('L5', 'चुने'), khoje: VW('L5', 'खोजे'),
  khojna: VW('L6', 'खोजना'), pehle: VW('L6', 'पहले'), chalaiye: VW('L6', 'चलाइए'),
  tb: VW('L7', 'टेंसरब्लू'), follow: VW('L7', 'फ़ॉलो'), aasaan: VW('L7', 'आसान'),
};
const SC = [0, VL('L1').t1 + 0.2, VL('L2').t1 + 0.15, VL('L3').t1 + 0.15, VL('L4').t1 + 0.15, VL('L5').t1 + 0.15, VL('L7').t0 - 0.35, 30.01];
const WIPE = 0.5;
const WDIR = [0, 1, -1, 2, 1, -1, 2];
T.chime = VL('L6').t1 + 0.12;
export const CUES = { ...T, scenes: SC };

// ---- Devanagari type helpers (accepted since batch 03) -------------------------------------------
function hi(ctx, str, x, y, o = {}) { text(ctx, str, x, y, { font: 'MuktaB', ...o }); }
function hiW(ctx, str, size, font = 'MuktaXB') { return textW(ctx, str, size, font); }
function kHi(ctx, str, x, y, size, t, t0, o = {}) {
  const { font = 'MuktaXB', color = C.white, align = 'center', dur = 0.38 } = o;
  const kin = easeOut(ev(t, t0, dur)); if (kin <= 0) return 0;
  const w = hiW(ctx, str, size, font); const x0 = align === 'center' ? x - w / 2 : x;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, y - size * 1.25, w + 40, size * 1.75); ctx.clip();
  text(ctx, str, x0, y + (1 - kin) * size * 1.3, { size, font, color, align: 'left' });
  ctx.restore(); return w;
}
function kHiPair(ctx, a, b, y, size, t, ta, tb) {
  const w1 = hiW(ctx, a, size), w2 = hiW(ctx, b, size), x0 = 540 - (w1 + w2) / 2;
  kHi(ctx, a, x0, y, size, t, ta, { align: 'left' }); kHi(ctx, b, x0 + w1, y, size, t, tb, { align: 'left', color: C.blue });
}
function pillHi(ctx, cx, cy, str, o = {}) {
  const { size = 34, fill = C.pale, color = C.ink, font = 'MuktaB', alpha = 1 } = o; if (alpha <= 0) return;
  const w = hiW(ctx, str, size, font) + size * 1.2, h = size * 1.75;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.fillStyle = fill; rr(ctx, cx - w / 2, cy - h / 2, w, h, h / 2); ctx.fill(); ctx.restore();
  hi(ctx, str, cx, cy + size * 0.36, { size, font, color, alpha });
}
function tick(ctx, cx, cy, s, color = C.white, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.strokeStyle = color; ctx.lineWidth = s * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(cx - s * 0.45, cy); ctx.lineTo(cx - s * 0.12, cy + s * 0.32); ctx.lineTo(cx + s * 0.5, cy - s * 0.36); ctx.stroke(); ctx.restore();
}
function card(ctx, x, y, w, h, o = {}) {
  const { fill = C.pale, alpha = 1, r = 36 } = o; if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha;
  shadow(ctx, x + w / 2 + 8, y + h + 18, w * 0.5, 26, 0.65);
  ctx.fillStyle = C.blueDeep; rr(ctx, x, y + 9, w, h, r); ctx.fill();
  ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill();
  ctx.restore();
}

// ---- document props --------------------------------------------------------------------------
// the scanned page at (x, y) with scale s; returns a mapper from scan pixels to screen
function page(ctx, x, y, s, o = {}) {
  const { alpha = 1, label = null, crop = IH } = o;
  const w = IW * s, h = crop * s;
  if (alpha > 0) {
    ctx.save(); ctx.globalAlpha = S.alpha * alpha;
    shadow(ctx, x + w / 2 + 8, y + h + 16, w * 0.52, 24, 0.65);
    ctx.fillStyle = C.blueDeep; rr(ctx, x - 6, y + 2, w + 12, h + 12, 18); ctx.fill();
    ctx.save(); rr(ctx, x, y, w, h, 14); ctx.clip(); ctx.drawImage(SCAN, 0, 0, IW, crop, x, y, w, h); ctx.restore();
    ctx.restore();
    if (label) pillHi(ctx, x + w / 2, y + h + 46, label, { size: 32, fill: C.pale, alpha });
  }
  return (b) => ({ x: x + b.x * s, y: y + b.y * s, w: b.w * s, h: b.h * s });
}
function hl(ctx, b, alpha = 1, fill = 'rgba(59,130,246,0.30)') {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.fillStyle = fill; rr(ctx, b.x - 6, b.y - 5, b.w + 12, b.h + 10, 8); ctx.fill();
  ctx.strokeStyle = C.blue; ctx.lineWidth = 4; rr(ctx, b.x - 6, b.y - 5, b.w + 12, b.h + 10, 8); ctx.stroke(); ctx.restore();
}
function magnifier(ctx, cx, cy, r, color = C.ink) {
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.strokeStyle = color; ctx.lineWidth = r * 0.32; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx - r * 0.15, cy - r * 0.15, r * 0.62, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + r * 0.32, cy + r * 0.32); ctx.lineTo(cx + r * 0.85, cy + r * 0.85); ctx.stroke(); ctx.restore();
}
// search bar: query typed by `typed` 0..1; result pill on the right
function searchBar(ctx, x, y, w, query, typed, result, o = {}) {
  const { alpha = 1, resultAlpha = 0, resultFill = C.blue } = o; if (alpha <= 0) return;
  const h = 84; const sa = S.alpha; S.alpha = sa * alpha;
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.fillStyle = C.blueDeep; rr(ctx, x, y + 6, w, h, h / 2); ctx.fill();
  ctx.fillStyle = C.white; rr(ctx, x, y, w, h, h / 2); ctx.fill(); ctx.restore();
  magnifier(ctx, x + 50, y + h / 2, 26);
  const n = Math.round(query.length * clamp(typed));
  text(ctx, query.slice(0, n), x + 96, y + h / 2 + 15, { size: 42, font: 'InterB', color: C.ink, align: 'left' });
  if (typed > 0 && typed < 1 && Math.floor(typed * 12) % 2 === 0) { ctx.save(); ctx.fillStyle = C.blue; ctx.fillRect(x + 100 + textW(ctx, query.slice(0, n), 42, 'InterB'), y + 20, 4, 44); ctx.restore(); }
  if (resultAlpha > 0) pillHi(ctx, x + w - 92, y + h / 2, result, { size: 32, fill: resultFill, color: resultFill === C.blue ? C.white : C.ink, alpha: resultAlpha });
  S.alpha = sa;
}

// ---- captions (Hindi, Mukta SemiBold; ink inside y 340–520, x 90–990; <= 2 lines) -----------------
const CAPS = [
  { t0: VL('L1').t0, lines: ['यह स्कैन पीडीएफ़ है,', 'फिर भी शब्द मिल गया। कैसे?'] },
  { t0: VL('L2').t0, lines: ['स्कैन अक्सर सिर्फ़', 'एक तस्वीर होता है,'] },
  { t0: VW('L2', 'उसमें'), lines: ['उसमें टेक्स्ट नहीं।'] },
  { t0: VL('L3').t0, lines: ['ओसीआर तस्वीर के अक्षर पहचानकर', 'टेक्स्ट बनाता है,'] },
  { t0: VW('L3', 'हर'), lines: ['हर शब्द की जगह के साथ।'] },
  { t0: VL('L4').t0, lines: ['यह टेक्स्ट तस्वीर के नीचे', 'एक अदृश्य परत बनता है।'] },
  { t0: VL('L5').t0, lines: ['अब शब्द चुने और', 'खोजे जा सकते हैं।'] },
  { t0: VL('L6').t0, lines: ['स्कैन पीडीएफ़ में खोजना है,', 'तो पहले ओसीआर चलाइए।'], tEnd: VL('L6').t1 + 0.9 },
  { t0: VL('L7').t0, lines: ['टेंसरब्लू फ़ॉलो करें,', 'सॉफ़्टवेयर आसान भाषा में।'], tEnd: 29.75 },
];
for (let i = 0; i < CAPS.length; i++) { CAPS[i].t0 -= 0.08; if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0; }
export const CAPTIONS = CAPS;
export const CAPTION_SIZE = 54, CAPTION_LH = 72, CAPTION_TOP = 340, CAPTION_BOTTOM = 520, CAPTION_MAXW = 880;
const CAPTION_FONT = 'MuktaSB', CAPTION_PAD = 8;
export function captionLayout(ctx, cap) {
  ctx.save(); ctx.font = `${CAPTION_SIZE}px ${CAPTION_FONT}`; const ms = cap.lines.map((s) => ctx.measureText(s)); ctx.restore();
  for (let i = 0; i < ms.length; i++) if (ms[i].width > CAPTION_MAXW) throw new Error('caption too wide: ' + cap.lines[i]);
  const asc = Math.max(...ms.map((m2) => m2.actualBoundingBoxAscent)), desc = Math.max(...ms.map((m2) => m2.actualBoundingBoxDescent));
  const blockH = asc + (cap.lines.length - 1) * CAPTION_LH + desc;
  const top = CAPTION_TOP + CAPTION_PAD + (CAPTION_BOTTOM - CAPTION_TOP - 2 * CAPTION_PAD - blockH) / 2;
  return cap.lines.map((s, i) => ({ text: s, baseline: top + asc + i * CAPTION_LH }));
}
function drawCaption(ctx, t) {
  const cap = CAPS.find((c) => t >= c.t0 && t < c.tEnd); if (!cap) return;
  const a = clamp((t - cap.t0) / 0.1) * clamp((cap.tEnd - t) / 0.12);
  for (const L of captionLayout(ctx, cap)) text(ctx, L.text, 540, L.baseline, { size: CAPTION_SIZE, font: CAPTION_FONT, alpha: a });
}

// ---- scenes ------------------------------------------------------------------------------------
const STAGE_TOP = 540;
const PS = 0.8, PX0 = 540 - IW * PS / 2, CROP = 880; // big page shots: slip cropped below its last line

// S1 hook — the working result first: a search on the scanned page finds "Python"
function s1(ctx, t) {
  const map = page(ctx, PX0, 690, PS, { crop: CROP });
  const typed = ev(t, 0.1, 0.55), found = ev(t, 0.75, 0.25);
  searchBar(ctx, 170, 572, 740, 'Python', typed, '1 मिला', { resultAlpha: found });
  hl(ctx, map(HIT), found);
  kHi(ctx, 'कैसे?', 540, 1470, 92, t, T.kaise - 0.08, { color: C.blue });
}
// S2 the scan is only a picture: no text in it (real: pdftotext finds 0 characters)
function s2(ctx, t) {
  const t0 = SC[1];
  const s = 0.42, map = page(ctx, 100, 620, s, { label: 'स्कैन पीडीएफ़' });
  card(ctx, 560, 620, 390, 496);
  hi(ctx, 'टेक्स्ट', 600, 690, { size: 44, font: 'MuktaXB', color: C.ink, align: 'left' });
  ctx.save(); ctx.setLineDash([14, 12]); ctx.strokeStyle = C.gray; ctx.lineWidth = 4; rr(ctx, 600, 720, 310, 250, 22); ctx.stroke(); ctx.restore();
  const e = ev(t, T.text2 - 0.1, 0.3);
  if (e > 0) { hi(ctx, 'खाली', 755, 860, { size: 44, color: C.grayDark, alpha: e }); pillHi(ctx, 755, 1040, `${BEFORE_CHARS} अक्षर`, { size: 38, fill: C.ink, color: C.white, alpha: e }); }
  // the word "Python" seen up close: only pixels
  const zk = easeOut(ev(t, T.tasveer2 - 0.1, 0.45));
  if (zk > 0) {
    const sx = PYW.x - 4, sy = PYW.y - 6, sw = PYW.w * 0.5, sh = PYW.h + 12;
    const dw = 820, dh = dw * sh / sw, dx = 130, dy = 1230;
    ctx.save(); ctx.globalAlpha = zk; ctx.fillStyle = C.blueDeep; rr(ctx, dx - 8, dy - 2, dw + 16, dh + 16, 18); ctx.fill();
    rr(ctx, dx, dy - 8, dw, dh, 14); ctx.clip(); ctx.imageSmoothingEnabled = false; ctx.drawImage(SCAN, sx, sy, sw, sh, dx, dy - 8, dw, dh); ctx.restore();
    hl(ctx, map(PYW), zk * 0.9, 'rgba(59,130,246,0.12)');
    pillHi(ctx, 540, dy + dh + 44, 'सिर्फ़ पिक्सेल', { size: 32, fill: C.pale, alpha: zk });
  }
}
// S3 OCR (Tesseract) finds each word and its position, and writes the text
function s3(ctx, t) {
  const t0 = SC[2];
  const s = 0.47, map = page(ctx, 70, 640, s);
  pillHi(ctx, 70 + IW * s / 2, 600, 'Tesseract OCR', { size: 30, fill: C.ink, color: C.white, font: 'MuktaB' });
  card(ctx, 530, 640, 420, 555, { fill: C.white });
  hi(ctx, 'पहचाना गया टेक्स्ट', 560, 700, { size: 36, font: 'MuktaXB', color: C.ink, align: 'left' });
  const span = Math.max(0.8, T.har - T.akshar - 0.2);
  WORDS.forEach((w, i) => {
    const k = ev(t, T.akshar - 0.1 + (i / WORDS.length) * span, 0.18);
    if (k <= 0) return;
    const b = map(w);
    ctx.save(); ctx.globalAlpha = k; ctx.strokeStyle = C.blue; ctx.lineWidth = 3; rr(ctx, b.x - 3, b.y - 3, b.w + 6, b.h + 6, 4); ctx.stroke(); ctx.restore();
  });
  AFTER_LINES.forEach((ln, i) => {
    const k = ev(t, T.akshar + 0.2 + (i / AFTER_LINES.length) * span, 0.25);
    text(ctx, ln, 556, 760 + i * 58, { size: 25, font: 'MonoM', color: C.ink, align: 'left', alpha: k });
  });
  // the position of one word (real Tesseract box)
  const jk = ev(t, T.jagah - 0.15, 0.3);
  if (jk > 0) {
    const b = map(PYW); hl(ctx, b, jk);
    pillHi(ctx, 540, 1300, `Python  →  x ${PYW.x}, y ${PYW.y}`, { size: 34, font: 'MonoB', fill: C.blue, color: C.white, alpha: jk });
  }
  kHiPair(ctx, 'अक्षर → ', 'टेक्स्ट + जगह', 1440, 64, t, T.text3 - 0.1, T.jagah);
}
// S4 the text becomes an invisible layer on top of the picture (exploded isometric view)
function isoPlane(ctx, ox, oy, s, draw) {
  ctx.save(); ctx.transform(0.866 * s, 0.5 * s, -0.866 * s, 0.5 * s, ox, oy); draw(); ctx.restore();
}
function s4(ctx, t) {
  // OCRmyPDF draws the invisible text (render mode 3) first and the scan image after it,
  // so the text layer sits BENEATH the picture (checked in demo/out/searchable.pdf).
  const t0 = SC[3];
  const s = 0.42, ox = 591;
  const drop = ease(ev(t, T.neeche, 0.6));              // the picture lands on top of the text layer
  const inv = ev(t, T.adrishya, 0.5);                   // ...which is invisible
  const up = -110 * drop;                               // re-centre the stack once it closes
  const oyT = 960 + up, oyP = oyT - lerp(400, 14, drop);
  const enter = easeOut(ev(t, t0, 0.35));
  // text layer (lower): real word boxes + words
  isoPlane(ctx, ox, oyT, s, () => {
    ctx.globalAlpha = enter;
    ctx.fillStyle = 'rgba(216,227,245,0.16)'; ctx.fillRect(0, 0, IW, IH);
    ctx.strokeStyle = C.blue; ctx.lineWidth = 8;
    if (inv > 0) ctx.setLineDash([22, 14]);
    ctx.strokeRect(0, 0, IW, IH); ctx.setLineDash([]);
    ctx.globalAlpha = enter * (1 - 0.6 * inv);
    for (const w of WORDS) { ctx.fillStyle = 'rgba(59,130,246,0.95)'; ctx.font = `${Math.round(w.h * 1.15)}px InterB`; ctx.fillText(w.text, w.x, w.y + w.h); }
    ctx.strokeStyle = C.white; ctx.lineWidth = 3; ctx.setLineDash([10, 8]);
    for (const w of WORDS) ctx.strokeRect(w.x - 3, w.y - 3, w.w + 6, w.h + 6);
  });
  // picture layer (upper, opaque): the scan itself
  isoPlane(ctx, ox, oyP, s, () => {
    ctx.globalAlpha = enter;
    ctx.fillStyle = `rgba(0,0,0,${0.18 + 0.25 * drop})`; ctx.fillRect(24, 34, IW, IH);
    ctx.drawImage(SCAN, 0, 0, IW, IH);
  });
  pillHi(ctx, 250, oyP + 160, 'तस्वीर', { size: 36, fill: C.pale, alpha: enter });
  pillHi(ctx, 760, oyT + 360, inv > 0.5 ? 'अदृश्य टेक्स्ट परत' : 'टेक्स्ट परत', { size: 36, fill: C.blue, color: C.white, alpha: easeOut(ev(t, t0 + 0.1, 0.3)) });
}
// S5 now words can be selected and searched (real text-layer positions)
function s5(ctx, t) {
  const map = page(ctx, PX0, 690, PS, { crop: CROP });
  const sel = ev(t, T.chune - 0.1, 0.45);
  if (sel > 0) {
    const b = map(DUE); const w = b.w * ease(sel);
    hl(ctx, { x: b.x, y: b.y, w, h: b.h }, 1, 'rgba(59,130,246,0.35)');
    if (sel >= 1) pillHi(ctx, 540, 1452, `कॉपी: ${DUE.text}`, { size: 34, fill: C.pale, font: 'MuktaB' });
  }
  const typed = ev(t, T.khoje - 0.2, 0.45), found = ev(t, T.khoje + 0.3, 0.25);
  searchBar(ctx, 170, 572, 740, 'Python', typed, '1 मिला', { resultAlpha: found });
  hl(ctx, map(HIT), found);
}
// S6 takeaway: run OCR first (the real command used for this demo)
function s6(ctx, t) {
  const t0 = SC[5];
  const a = easeOut(ev(t, t0, 0.35));
  card(ctx, 110, 620, 860, 380, { fill: C.navy, alpha: a });
  ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < 3; i++) { ctx.fillStyle = [C.gray, C.grayMid, C.blue][i]; ctx.beginPath(); ctx.arc(160 + i * 34, 664, 10, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
  const cmd = 'ocrmypdf scan.pdf searchable.pdf';
  const typed = ev(t, t0 + 0.35, 1.3); // the command types while "स्कैन पीडीएफ़" is spoken
  const n = Math.round(cmd.length * typed);
  text(ctx, '$', 150, 770, { size: 40, font: 'MonoB', color: C.blue, align: 'left', alpha: a });
  text(ctx, cmd.slice(0, n), 190, 770, { size: 38, font: 'MonoB', color: C.white, align: 'left', alpha: a });
  const done = ev(t, T.chalaiye + 0.1, 0.3);
  if (done > 0) {
    ctx.save(); ctx.globalAlpha = done; ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(170, 860, 24, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    tick(ctx, 170, 860, 26, C.white, done);
    text(ctx, 'searchable.pdf', 212, 874, { size: 38, font: 'MonoB', color: C.pale, align: 'left', alpha: done });
    text(ctx, `${BEFORE_CHARS} → ${WORDS.length} words`, 212, 940, { size: 32, font: 'MonoM', color: C.gray, align: 'left', alpha: done });
  }
  pillHi(ctx, 540, 1080, 'ओपन-सोर्स: OCRmyPDF + Tesseract', { size: 34, fill: C.pale, alpha: ev(t, T.khojna, 0.3) });
  kHiPair(ctx, 'पहले ओसीआर, ', 'फिर सर्च', 1300, 76, t, T.pehle - 0.05, T.chalaiye - 0.05);
  // the result, once more, on the chime: the page answers the search
  const r = easeOut(ev(t, T.chime, 0.4));
  if (r > 0) { searchBar(ctx, 250, 1390, 580, 'Python', 1, '1 मिला', { resultAlpha: r, alpha: r }); }
}
// S7 CTA — the accepted end card
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
  kHi(ctx, 'सॉफ़्टवेयर, आसान भाषा में', 540, 1262, 52, t, T.aasaan - 0.2, { font: 'MuktaB', color: C.gray });
  const fk = back(ev(t, T.follow - 0.05, 0.35));
  if (fk > 0) {
    ctx.save(); ctx.translate(540, 1380); ctx.scale(fk, fk); ctx.translate(-540, -1380);
    ctx.fillStyle = C.blue; rr(ctx, 540 - 170, 1380 - 52, 340, 104, 52); ctx.fill();
    hi(ctx, 'फ़ॉलो करें', 540, 1398, { size: 52, font: 'MuktaXB' });
    ctx.restore();
  }
}
const SCENES = [s1, s2, s3, s4, s5, s6, s7];

// ---- SFX (each tied to an on-screen action) -----------------------------------------------------
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(0.1, 'carve'); add(0.75, 'match'); add(T.kaise - 0.08, 'type');
  for (let i = 1; i < SCENES.length; i++) add(SC[i] - WIPE / 2, 'wipe');
  add(T.tasveer2 - 0.1, 'slide', { soft: true }); add(T.text2 - 0.1, 'blip', { lo: true });
  add(T.akshar - 0.1, 'carve'); add(T.jagah - 0.15, 'blip', { hi: true }); add(T.text3 - 0.1, 'type', { soft: true });
  add(T.neeche, 'slide'); add(T.adrishya, 'blip', { lo: true });
  add(T.chune - 0.1, 'slide', { soft: true }); add(T.khoje - 0.2, 'carve'); add(T.khoje + 0.3, 'match');
  add(SC[5] + 0.35, 'carve'); add(T.pehle - 0.05, 'type', { soft: true }); add(T.chalaiye + 0.1, 'blip', { hi: true });
  add(T.chime, 'chime');
  add(SC[6] + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e;
}

// ---- frame (accepted wipe compositor) -------------------------------------------------------------
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
