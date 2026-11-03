// Tensorblue 30s Hindi batch 03 · episode 01 — पासवर्ड मैनेजर आपका मास्टर पासवर्ड जाने बिना कैसे काम करता है
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged): kinetic type + tactile cards + isometric stage
// + blue wipes. Story objects: one vault card, one blue key token (its white notch bars = the key),
// one server on the stage. All narration and captions are Hindi (Devanagari, Mukta font).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalFonts } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword,
  KEY_A, token, isoP, isoBox, makeBackground,
} from './brt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MUKTA = path.resolve(HERE, '../../../../assets/fonts/mukta');
GlobalFonts.registerFromPath(path.join(MUKTA, 'Mukta-SemiBold.ttf'), 'MuktaSB');
GlobalFonts.registerFromPath(path.join(MUKTA, 'Mukta-Bold.ttf'), 'MuktaB');
GlobalFonts.registerFromPath(path.join(MUKTA, 'Mukta-ExtraBold.ttf'), 'MuktaXB');

const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.replace(/[।,?.!]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- cues --------------------------------------------------------------------------------
const T = {
  nahin1: VW('L1', 'नहीं'), kaise: VW('L1', 'कैसे'),
  device: VW('L2', 'डिवाइस'), chaabi2: VW('L2', 'चाबी'), banaate: VW('L2', 'बनाते'),
  vault3: VW('L3', 'वॉल्ट'), lock3: VW('L3', 'लॉक'), sync: VW('L3', 'सिंक'),
  server: VW('L4', 'सर्वर'), lock4: VW('L4', 'लॉक'), chaabi4: VW('L4', 'चाबी'),
  daalte: VW('L5', 'डालते'), chaabi5: VW('L5', 'चाबी'), banti: VW('L5', 'बनती'), vault5: VW('L5', 'वॉल्ट'), khulta: VW('L5', 'खुलता'),
  bhoolne: VW('L6', 'भूलने'), company: VW('L6', 'कंपनी'), lauta: VW('L6', 'लौटा'),
  tb: VW('L7', 'टेंसरब्लू'), follow: VW('L7', 'फ़ॉलो'), aasaan: VW('L7', 'आसान'),
};
const SC = [0, VL('L1').t1 + 0.25, VL('L2').t1 + 0.18, VL('L3').t1 + 0.18, VL('L4').t1 + 0.18, VL('L5').t1 + 0.18, VL('L7').t0 - 0.35, 30.01];
const WIPE = 0.5;
const WDIR = [0, 1, -1, 2, 1, -1, 2];
T.chime = VL('L6').t1 + 0.15;
export const CUES = { ...T, scenes: SC };

// ---- Devanagari type helpers (zero tracking keeps the shirorekha joined; tall mask for matras) ----
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

// ---- story objects ----------------------------------------------------------------------
function card(ctx, x, y, w, h, o = {}) {
  const { fill = C.pale, alpha = 1, r = 36 } = o; if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha;
  shadow(ctx, x + w / 2 + 8, y + h + 18, w * 0.5, 26, 0.65);
  ctx.fillStyle = C.blueDeep; rr(ctx, x, y + 9, w, h, r); ctx.fill();
  ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill();
  ctx.restore();
}
function padlock(ctx, cx, cy, s, open = 0, o = {}) {
  const { color = C.blue, alpha = 1 } = o; if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha;
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round';
  const lift = open * s * 0.35;
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.12 - lift, s * 0.32, Math.PI, 0); ctx.lineTo(cx + s * 0.32, cy + s * 0.1 - lift * (1 - open)); ctx.moveTo(cx - s * 0.32, cy - s * 0.12 - lift); ctx.lineTo(cx - s * 0.32, cy + s * 0.1 - lift); ctx.stroke();
  ctx.fillStyle = color; rr(ctx, cx - s * 0.5, cy, s, s * 0.78, s * 0.14); ctx.fill();
  ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(cx, cy + s * 0.34, s * 0.1, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(cx - s * 0.04, cy + s * 0.36, s * 0.08, s * 0.2);
  ctx.restore();
}
const ROWS = [['ईमेल', '9f3a c27b'], ['बैंक', 'e0b4 51d8'], ['वाई-फ़ाई', '7c16 aa09']];
// the vault: readable rows (masked) <-> scrambled ciphertext; `locked` 0..1 also closes the padlock
function vault(ctx, x, y, w, h, locked, o = {}) {
  const { alpha = 1, title = 'आपका वॉल्ट' } = o; if (alpha <= 0) return;
  const sa = S.alpha; S.alpha = sa * alpha;
  card(ctx, x, y, w, h);
  hi(ctx, title, x + 44, y + 78, { size: 50, font: 'MuktaXB', color: C.ink, align: 'left' });
  padlock(ctx, x + w - 78, y + 42, 54, 1 - locked);
  const rowH = (h - 140) / 3;
  ROWS.forEach(([label, cipher], i) => {
    const ry = y + 120 + i * rowH;
    ctx.save(); ctx.globalAlpha = S.alpha; ctx.fillStyle = C.white; rr(ctx, x + 32, ry, w - 64, rowH - 20, 22); ctx.fill(); ctx.restore();
    const k = clamp(locked * 3 - i * 0.6); // rows scramble one after another
    const aIn = clamp(1 - k * 2), aCi = clamp(k * 2 - 1);
    if (aIn > 0) {
      hi(ctx, label, x + 64, ry + rowH * 0.5 + 6, { size: 42, color: C.ink, align: 'left', alpha: aIn });
      text(ctx, '••••••', x + w - 64, ry + rowH * 0.5 + 6, { size: 42, font: 'InterB', color: C.ink, align: 'right', alpha: aIn });
    }
    if (aCi > 0) { // ciphertext fitted to the row width
      const str = w >= 600 ? cipher + ' ' + cipher.split(' ').reverse().join(' ') : cipher;
      const fs = Math.min(40, 40 * (w - 110) / textW(ctx, str, 40, 'InterB', 2));
      text(ctx, str, x + w / 2, ry + rowH * 0.5 + fs * 0.15, { size: fs, font: 'InterB', color: C.blueDeep, alpha: aCi, track: 2 });
    }
  });
  S.alpha = sa;
}
// a device card with the master-password field; `dots` = how many characters typed, `forgot` shows "?"
function device(ctx, x, y, w, h, dots, o = {}) {
  const { alpha = 1, forgot = 0 } = o; if (alpha <= 0) return;
  const sa = S.alpha; S.alpha = sa * alpha;
  card(ctx, x, y, w, h);
  hi(ctx, 'मास्टर पासवर्ड', x + 40, y + 74, { size: 44, font: 'MuktaXB', color: C.ink, align: 'left' });
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.fillStyle = C.white; rr(ctx, x + 36, y + 110, w - 72, 96, 26); ctx.fill();
  ctx.strokeStyle = C.blue; ctx.lineWidth = 4; rr(ctx, x + 36, y + 110, w - 72, 96, 26); ctx.stroke(); ctx.restore();
  const n = Math.floor(dots);
  if (forgot > 0) text(ctx, '?  ?  ?', x + w / 2, y + 174, { size: 52, font: 'InterB', color: C.ink, alpha: forgot });
  else text(ctx, '•'.repeat(n), x + 70, y + 176, { size: 56, font: 'InterB', color: C.ink, align: 'left', track: 6 });
  S.alpha = sa;
}
function tick(ctx, cx, cy, s, color = C.white, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.strokeStyle = color; ctx.lineWidth = s * 0.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(cx - s * 0.45, cy); ctx.lineTo(cx - s * 0.12, cy + s * 0.32); ctx.lineTo(cx + s * 0.5, cy - s * 0.36); ctx.stroke(); ctx.restore();
}
function keyToken(ctx, cx, cy, s, o = {}) { token(ctx, cx, cy, s, { key: KEY_A, showId: false, ...o }); }
function keyOutline(ctx, cx, cy, s, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.setLineDash([16, 12]); ctx.strokeStyle = C.gray; ctx.lineWidth = 5;
  rr(ctx, cx - s / 2, cy - s / 2, s, s, s * 0.22); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = C.white; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - s * 0.22, cy - s * 0.22); ctx.lineTo(cx + s * 0.22, cy + s * 0.22); ctx.moveTo(cx + s * 0.22, cy - s * 0.22); ctx.lineTo(cx - s * 0.22, cy + s * 0.22); ctx.stroke();
  ctx.restore();
}
const O4 = { x: 470, y: 1060, u: 76 };
function serverStage(ctx, rise = 1) {
  const o = O4;
  ctx.save(); ctx.translate(0, (1 - rise) * 100); S.alpha = rise;
  isoBox(ctx, o, 0, 0, -0.45, 6, 4, 0.45, { top: C.slab, left: C.slabSide, right: '#091428', edge: 'rgba(183,199,223,0.35)' });
  isoBox(ctx, o, 3.2, 0.5, 0, 2.2, 1.8, 2.3, { top: C.pale, left: C.gray, right: C.grayMid, edge: 'rgba(3,6,16,0.25)' });
  const lp = isoP(o, 3.4, 2.3, 1.9);
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.transform(0.866, 0.5, 0, 1, 0, 0);
  const ax = lp[0] / 0.866, ay = lp[1] - 0.5 * ax; ctx.font = '46px MuktaXB'; ctx.fillStyle = C.ink; ctx.fillText('सर्वर', ax, ay);
  ctx.restore();
  ctx.restore(); S.alpha = 1;
}

// ---- captions (Hindi, Mukta SemiBold; ink inside y 340–520, x 90–990; <= 2 lines) ---------------
const CAPS = [
  { t0: VL('L1').t0, lines: ['पासवर्ड मैनेजर आपका', 'मास्टर पासवर्ड नहीं जानता। कैसे?'] },
  { t0: VL('L2').t0, lines: ['कई पासवर्ड मैनेजर डिवाइस पर ही', 'इससे चाबी बनाते हैं।'] },
  { t0: VL('L3').t0, lines: ['इसी चाबी से वॉल्ट', 'लॉक होकर सिंक होता है।'] },
  { t0: VL('L4').t0, lines: ['सर्वर पर लॉक डेटा रहता है,', 'चाबी नहीं।'] },
  { t0: VL('L5').t0, lines: ['मास्टर पासवर्ड डालते ही', 'चाबी फिर बनती है,'] },
  { t0: VW('L5', 'और'), lines: ['और वॉल्ट खुलता है।'] },
  { t0: VL('L6').t0, lines: ['इसलिए इसे भूलने पर, कंपनी', 'अक्सर उसे लौटा नहीं पाती।'], tEnd: VL('L6').t1 + 0.9 },
  { t0: VL('L7').t0, lines: ['टेंसरब्लू फ़ॉलो करें,', 'सॉफ़्टवेयर आसान भाषा में।'], tEnd: 29.75 },
];
for (let i = 0; i < CAPS.length; i++) { CAPS[i].t0 -= 0.08; if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0; }
export const CAPTIONS = CAPS;
export const CAPTION_SIZE = 54, CAPTION_LH = 72, CAPTION_TOP = 340, CAPTION_BOTTOM = 520, CAPTION_MAXW = 880;
const CAPTION_FONT = 'MuktaSB', CAPTION_PAD = 8;
export function captionLayout(ctx, cap) {
  ctx.save(); ctx.font = `${CAPTION_SIZE}px ${CAPTION_FONT}`; const ms = cap.lines.map((s) => ctx.measureText(s)); ctx.restore();
  for (let i = 0; i < ms.length; i++) if (ms[i].width > CAPTION_MAXW) throw new Error('caption too wide: ' + cap.lines[i]);
  const asc = Math.max(...ms.map((m) => m.actualBoundingBoxAscent)), desc = Math.max(...ms.map((m) => m.actualBoundingBoxDescent));
  const blockH = asc + (cap.lines.length - 1) * CAPTION_LH + desc;
  const top = CAPTION_TOP + CAPTION_PAD + (CAPTION_BOTTOM - CAPTION_TOP - 2 * CAPTION_PAD - blockH) / 2;
  return cap.lines.map((s, i) => ({ text: s, baseline: top + asc + i * CAPTION_LH }));
}
function drawCaption(ctx, t) {
  const cap = CAPS.find((c) => t >= c.t0 && t < c.tEnd); if (!cap) return;
  const a = clamp((t - cap.t0) / 0.1) * clamp((cap.tEnd - t) / 0.12);
  for (const L of captionLayout(ctx, cap)) text(ctx, L.text, 540, L.baseline, { size: CAPTION_SIZE, font: CAPTION_FONT, alpha: a });
}

// ---- scenes -------------------------------------------------------------------------------
const STAGE_TOP = 540;

// S1 hook: your vault is full, but the manager doesn't know the master password
function s1(ctx, t) {
  vault(ctx, 190, 600, 700, 640, 0);
  const q = back(ev(t, T.nahin1 - 0.1, 0.35));
  if (q > 0) {
    ctx.save(); ctx.translate(540, 1335); ctx.scale(q, q); ctx.translate(-540, -1335);
    pillHi(ctx, 540, 1335, 'मास्टर पासवर्ड: पता नहीं', { size: 40, fill: C.ink, color: C.white });
    ctx.restore();
  }
  kHi(ctx, 'कैसे?', 540, 1470, 96, t, T.kaise - 0.08, { color: C.blue });
}
// S2 the key is made on your device, from the master password
function s2(ctx, t) {
  const t0 = SC[1];
  device(ctx, 170, 620, 740, 250, 8 * ease(ev(t, t0 + 0.05, 0.9)));
  if (t >= T.device - 0.1) pillHi(ctx, 540, 940, 'डिवाइस पर ही', { size: 40, fill: C.blue, color: C.white, alpha: ev(t, T.device - 0.1, 0.25) });
  const kk = ease(ev(t, T.chaabi2 - 0.2, 0.6));
  if (kk > 0) {
    const y = lerp(760, 1150, kk), s = lerp(60, 210, kk);
    keyToken(ctx, 540, y, s);
    if (kk > 0.9) pillHi(ctx, 540, 1150 - 150, 'चाबी', { size: 40, fill: C.pale, alpha: ev(t, T.chaabi2 + 0.35, 0.2) });
  }
  kHiPair(ctx, 'पासवर्ड → ', 'चाबी', 1440, 76, t, T.chaabi2 - 0.1, T.banaate - 0.05);
}
// S3 the vault is locked with the key on the device, and only then synced; the key stays
function s3(ctx, t) {
  const t0 = SC[2];
  const lk = ev(t, T.lock3 - 0.1, 0.55);
  const sy = ease(ev(t, T.sync - 0.05, 0.75));
  vault(ctx, 190 + sy * 330, 600 - sy * 10, 700 - sy * 330, 560 - sy * 250, lk, { title: sy > 0.5 ? 'वॉल्ट' : 'आपका वॉल्ट' });
  keyToken(ctx, 300, 1300, 150, { alpha: easeOut(ev(t, t0, 0.3)) });
  if (lk > 0.2) pillHi(ctx, 610, 1300, 'चाबी यहीं रहती है', { size: 38, fill: C.pale, alpha: ev(t, T.lock3 + 0.2, 0.25) });
  if (sy > 0) pillHi(ctx, 705, 980, 'सर्वर की ओर सिंक', { size: 38, fill: C.blue, color: C.white, alpha: sy });
}
// S4 the server stores only the locked vault — no key
function s4(ctx, t) {
  const t0 = SC[3];
  serverStage(ctx, easeOut(ev(t, t0, 0.5)));
  const vk = easeOut(ev(t, t0 + 0.2, 0.5));
  vault(ctx, 110, 580 + (1 - vk) * -40, 440, 380, 1, { alpha: vk, title: 'वॉल्ट' });
  if (t >= T.lock4 - 0.1) pillHi(ctx, 330, 1010, 'सिर्फ़ लॉक डेटा', { size: 38, fill: C.blue, color: C.white, alpha: ev(t, T.lock4 - 0.1, 0.25) });
  const nk = ev(t, T.chaabi4 - 0.1, 0.3);
  if (nk > 0) { keyOutline(ctx, 790, 700, 150, nk); pillHi(ctx, 790, 832, 'चाबी नहीं', { size: 38, fill: C.pale, color: C.ink, alpha: nk }); }
}
// S5 typing the master password re-creates the SAME key, and the vault opens on the device
function s5(ctx, t) {
  const t0 = SC[4];
  device(ctx, 170, 600, 740, 240, 8 * ease(ev(t, T.daalte - 0.3, 0.8)));
  const kk = back(ev(t, T.chaabi5 - 0.1, 0.45));
  if (kk > 0) {
    keyToken(ctx, 300, 1030, 160 * kk);
    if (t >= T.banti) { const a = ev(t, T.banti, 0.25); pillHi(ctx, 280, 1170, 'वही चाबी', { size: 38, fill: C.blue, color: C.white, alpha: a }); tick(ctx, 410, 1166, 34, C.blue, a); }
  }
  const op = ev(t, T.khulta - 0.15, 0.6);
  vault(ctx, 470, 900, 450, 430, 1 - op, { title: 'वॉल्ट', alpha: easeOut(ev(t, T.vault5 - 0.4, 0.35)) });
  kHiPair(ctx, 'वॉल्ट ', 'खुला', 1460, 76, t, T.khulta - 0.05, T.khulta + 0.15);
}
// S6 forget it -> no key can be made; the company holds only locked data
function s6(ctx, t) {
  const t0 = SC[5];
  device(ctx, 110, 600, 420, 240, 0, { forgot: easeOut(ev(t, t0 + 0.1, 0.3)) });
  keyOutline(ctx, 320, 980, 140, easeOut(ev(t, T.bhoolne, 0.3)));
  const sv = easeOut(ev(t, T.company - 0.15, 0.4));
  if (sv > 0) {
    S.alpha = sv; card(ctx, 580, 600, 390, 400); S.alpha = 1;
    hi(ctx, 'कंपनी', 775, 676, { size: 46, font: 'MuktaXB', color: C.ink, alpha: sv });
    padlock(ctx, 775, 760, 120, 0, { alpha: sv });
    hi(ctx, 'लॉक वॉल्ट', 775, 960, { size: 38, color: C.ink, alpha: sv });
  }
  if (t >= T.lauta - 0.1) pillHi(ctx, 775, 1090, 'पासवर्ड हमारे पास नहीं', { size: 36, fill: C.pale, color: C.ink, alpha: ev(t, T.lauta - 0.1, 0.25) });
  kHiPair(ctx, 'चाबी सिर्फ़ ', 'आपके पास', 1360, 72, t, T.chime - 0.05, T.chime + 0.12);
}
// S7 CTA — the accepted end card; Hindi subline and button
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

// ---- SFX (each tied to an on-screen action) -------------------------------------------------
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(T.nahin1 - 0.1, 'blip', { lo: true }); add(T.kaise - 0.08, 'type');
  for (let i = 1; i < SCENES.length; i++) add(SC[i] - WIPE / 2, 'wipe');
  add(SC[1] + 0.05, 'carve'); add(T.device - 0.1, 'blip'); add(T.chaabi2 - 0.2, 'clack'); add(T.chaabi2 - 0.1, 'type', { soft: true });
  add(T.lock3 - 0.1, 'slot'); add(T.sync - 0.05, 'slide');
  add(SC[3] + 0.05, 'clack', { soft: true }); add(T.lock4 - 0.1, 'blip'); add(T.chaabi4 - 0.1, 'strike');
  add(T.daalte - 0.3, 'carve'); add(T.chaabi5 - 0.1, 'clack'); add(T.banti, 'match'); add(T.khulta - 0.15, 'slot'); add(T.khulta - 0.05, 'type', { soft: true });
  add(SC[5] + 0.1, 'blip', { lo: true }); add(T.bhoolne, 'strike'); add(T.company - 0.15, 'clack', { soft: true }); add(T.lauta - 0.1, 'blip', { lo: true });
  add(T.chime, 'chime');
  add(SC[6] + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e;
}

// ---- frame (same wipe compositor as the accepted episodes) --------------------------------------
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
