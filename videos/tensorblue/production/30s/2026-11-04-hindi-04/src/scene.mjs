// Tensorblue 30s Hindi batch 04 · episode 01 — पासकी से लॉगिन: पासवर्ड टाइप किए बिना
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) with the accepted Hindi treatment from batch 03
// (Mukta, zero tracking, Kokoro Hindi voice). Story objects: one phone, one website card, the private key
// (blue key token; its white notch bars = the key) and the public key (a padlock whose body shows the SAME
// notch pattern, so the pair visibly belongs together), one challenge card. No line backgrounds.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalFonts } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword,
  KEY_A, token, makeBackground,
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

// ---- cues ---------------------------------------------------------------------------------
const T = {
  type1: VW('L1', 'टाइप'), kaise: VW('L1', 'कैसे'),
  banaate: VW('L2', 'बनाते'), do2: VW('L2', 'दो'), chaabiyan: VW('L2', 'चाबियाँ'),
  private3: VW('L3', 'प्राइवेट'), public3: VW('L3', 'पब्लिक'), website3: VW('L3', 'वेबसाइट'),
  chunauti: VW('L4', 'चुनौती'), bhejti: VW('L4', 'भेजती'),
  roz: VW('L5', 'रोज़'), unlock: VW('L5', 'अनलॉक'),
  private6: VW('L6', 'प्राइवेट'), sign: VW('L6', 'साइन'), website6: VW('L6', 'वेबसाइट'), public6: VW('L6', 'पब्लिक'), jaanchti: VW('L6', 'जाँचती'),
  finger: VW('L7', 'फ़िंगरप्रिंट'), chehra: VW('L7', 'चेहरा'), nahin7: VW('L7', 'नहीं'),
  tb: VW('L8', 'टेंसरब्लू'), follow: VW('L8', 'फ़ॉलो'), aasaan: VW('L8', 'आसान'),
};
const SC = [0, VL('L1').t1 + 0.2, VL('L2').t1 + 0.15, VL('L3').t1 + 0.15, VL('L5').t1 + 0.15, VL('L6').t1 + 0.15, VL('L8').t0 - 0.35, 30.01];
const WIPE = 0.5;
const WDIR = [0, 1, -1, 2, 1, -1, 2];
T.chime = VL('L7').t1 + 0.12;
export const CUES = { ...T, scenes: SC };

// ---- Devanagari type helpers (accepted in batch 03) -------------------------------------------
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
function cross(ctx, cx, cy, s, color = C.white, alpha = 1) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha; ctx.strokeStyle = color; ctx.lineWidth = s * 0.18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - s * 0.4, cy - s * 0.4); ctx.lineTo(cx + s * 0.4, cy + s * 0.4); ctx.moveTo(cx + s * 0.4, cy - s * 0.4); ctx.lineTo(cx - s * 0.4, cy + s * 0.4); ctx.stroke(); ctx.restore();
}

// ---- story objects --------------------------------------------------------------------------
function card(ctx, x, y, w, h, o = {}) {
  const { fill = C.pale, alpha = 1, r = 36 } = o; if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha;
  shadow(ctx, x + w / 2 + 8, y + h + 18, w * 0.5, 26, 0.65);
  ctx.fillStyle = C.blueDeep; rr(ctx, x, y + 9, w, h, r); ctx.fill();
  ctx.fillStyle = fill; rr(ctx, x, y, w, h, r); ctx.fill();
  ctx.restore();
}
// the PRIVATE key: the accepted blue token; its notch bars are the key
function privKey(ctx, cx, cy, s, o = {}) { token(ctx, cx, cy, s, { key: KEY_A, showId: false, ...o }); }
// the PUBLIC key: a padlock whose body carries the SAME notch pattern (it only accepts this key's signature)
function pubLock(ctx, cx, cy, s, open = 0, o = {}) {
  const { alpha = 1 } = o; if (alpha <= 0 || s <= 0) return;
  ctx.save(); ctx.globalAlpha = S.alpha * alpha;
  shadow(ctx, cx + 6, cy + s * 0.86, s * 0.5, s * 0.08, 0.55);
  const lift = open * s * 0.28;
  ctx.strokeStyle = C.gray; ctx.lineWidth = s * 0.13; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - s * 0.3, cy - s * 0.02 - lift); ctx.lineTo(cx - s * 0.3, cy - s * 0.22 - lift);
  ctx.arc(cx, cy - s * 0.22 - lift, s * 0.3, Math.PI, 0); ctx.lineTo(cx + s * 0.3, cy - s * 0.02 - lift * (1 - open) - (open > 0 ? s * 0.06 : 0)); ctx.stroke();
  ctx.fillStyle = C.blueDeep; rr(ctx, cx - s * 0.5, cy + s * 0.04, s, s * 0.78, s * 0.16); ctx.fill();
  ctx.fillStyle = C.blue; rr(ctx, cx - s * 0.5, cy, s, s * 0.76, s * 0.16); ctx.fill();
  const bw = s * 0.09, gap = s * 0.055, total = 4 * bw + 3 * gap, base = cy + s * 0.56;
  ctx.fillStyle = C.white;
  KEY_A.bars.forEach((b, i) => { const h = s * (0.08 + b * 0.065); rr(ctx, cx - total / 2 + i * (bw + gap), base - h, bw, h, bw * 0.3); ctx.fill(); });
  ctx.restore();
}
function phone(ctx, x, y, w, h, o = {}) {
  const { alpha = 1, title = null, locked = 0, scan = 0, lockscreen = false } = o; if (alpha <= 0) return;
  const sa = S.alpha; S.alpha = sa * alpha;
  ctx.save(); ctx.globalAlpha = S.alpha;
  shadow(ctx, x + w / 2 + 8, y + h + 18, w * 0.5, 24, 0.65);
  ctx.fillStyle = C.navy; rr(ctx, x, y, w, h, 56); ctx.fill();
  ctx.strokeStyle = C.gray; ctx.lineWidth = 4; rr(ctx, x, y, w, h, 56); ctx.stroke();
  ctx.fillStyle = C.pale; rr(ctx, x + 18, y + 18, w - 36, h - 36, 42); ctx.fill();
  ctx.fillStyle = C.ink; rr(ctx, x + w / 2 - 50, y + 30, 100, 22, 11); ctx.fill();
  ctx.restore();
  if (title) hi(ctx, title, x + w / 2, y + 120, { size: 40, font: 'MuktaXB', color: C.ink });
  if (lockscreen) {
    // lock-screen: padlock that opens when unlocked, and a fingerprint pad that fills on the scan
    const lx = x + w / 2, ly = y + 190;
    ctx.save(); ctx.globalAlpha = S.alpha; ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
    const lift = (1 - locked) * 18;
    ctx.beginPath(); ctx.arc(lx, ly - 6 - lift, 22, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = C.ink; rr(ctx, lx - 32, ly, 64, 50, 10); ctx.fill(); ctx.restore();
    fingerprint(ctx, x + w / 2, y + h - 170, 74, scan);
  }
  S.alpha = sa;
}
function fingerprint(ctx, cx, cy, r, fill = 0) {
  ctx.save(); ctx.globalAlpha = S.alpha;
  ctx.fillStyle = fill > 0 ? `rgba(59,130,246,${0.2 + 0.8 * fill})` : 'rgba(3,6,16,0.08)';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = fill > 0.5 ? C.white : C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const rr2 = r * (0.22 + i * 0.19); ctx.beginPath(); ctx.arc(cx, cy + r * 0.08, rr2, Math.PI * (1.05 + i * 0.03), Math.PI * (1.95 - i * 0.03)); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(cx, cy + r * 0.08); ctx.lineTo(cx, cy + r * 0.62); ctx.stroke();
  ctx.restore();
}
function site(ctx, x, y, w, h, o = {}) {
  const { alpha = 1, body = null } = o; if (alpha <= 0) return;
  const sa = S.alpha; S.alpha = sa * alpha;
  card(ctx, x, y, w, h);
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.fillStyle = C.white; rr(ctx, x + 24, y + 22, w - 48, 52, 26); ctx.fill(); ctx.restore();
  for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalAlpha = S.alpha; ctx.fillStyle = C.gray; ctx.beginPath(); ctx.arc(x + 54 + i * 26, y + 48, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  hi(ctx, 'वेबसाइट', x + 150, y + 62, { size: 34, font: 'MuktaB', color: C.ink, align: 'left' });
  if (body) body(x, y, w, h);
  S.alpha = sa;
}
function challenge(ctx, cx, cy, w, o = {}) {
  const { alpha = 1, signed = 0, rot = 0 } = o; if (alpha <= 0) return;
  const h = w * 0.62; const sa = S.alpha; S.alpha = sa * alpha;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.translate(-cx, -cy);
  shadow(ctx, cx + 6, cy + h / 2 + 10, w * 0.5, 14, 0.55);
  ctx.globalAlpha = S.alpha; ctx.fillStyle = C.white; rr(ctx, cx - w / 2, cy - h / 2, w, h, w * 0.08); ctx.fill();
  hi(ctx, 'चुनौती', cx - w / 2 + w * 0.09, cy - h / 2 + w * 0.15, { size: w * 0.11, font: 'MuktaXB', color: C.ink, align: 'left' });
  text(ctx, '7Q2F · 91KX', cx, cy + w * 0.06, { size: w * 0.1, font: 'InterB', color: C.blueDeep, track: 2 });
  if (signed > 0) {
    const sr = w * 0.16, sx = cx + w / 2 - sr * 1.25, sy = cy + h / 2 - sr * 1.15;
    const k = back(signed);
    ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(sx, sy, sr * k, 0, Math.PI * 2); ctx.fill();
    tick(ctx, sx, sy, sr * 1.1 * k, C.white, 1);
  }
  ctx.restore(); S.alpha = sa;
}

// ---- captions (Hindi, Mukta SemiBold; ink inside y 340–520, x 90–990; <= 2 lines) ---------------
const CAPS = [
  { t0: VL('L1').t0, lines: ['पासकी में पासवर्ड', 'टाइप नहीं होता। कैसे?'] },
  { t0: VL('L2').t0, lines: ['पासकी बनाते समय फ़ोन', 'दो जुड़ी चाबियाँ बनाता है।'] },
  { t0: VL('L3').t0, lines: ['प्राइवेट चाबी आपके पास,', 'पब्लिक चाबी वेबसाइट के पास।'] },
  { t0: VL('L4').t0, lines: ['लॉगिन पर वेबसाइट', 'चुनौती भेजती है।'] },
  { t0: VL('L5').t0, lines: ['आप रोज़ की तरह', 'फ़ोन अनलॉक करते हैं।'] },
  { t0: VL('L6').t0, lines: ['फ़ोन प्राइवेट चाबी से साइन करता है,'] },
  { t0: VW('L6', 'वेबसाइट'), lines: ['वेबसाइट पब्लिक चाबी से जाँचती है।'] },
  { t0: VL('L7').t0, lines: ['फ़िंगरप्रिंट या चेहरा', 'वेबसाइट तक नहीं जाता।'], tEnd: VL('L7').t1 + 0.4 },
  { t0: VL('L8').t0, lines: ['टेंसरब्लू फ़ॉलो करें,', 'सॉफ़्टवेयर आसान भाषा में।'], tEnd: 29.75 },
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

// ---- scenes ---------------------------------------------------------------------------------
const STAGE_TOP = 540;

// S1 hook: the usual sign-in form, but the password field is crossed out; "Sign in with a passkey"
function s1(ctx, t) {
  const x = 170, y = 600, w = 740, h = 600;
  card(ctx, x, y, w, h);
  hi(ctx, 'साइन इन', x + 56, y + 92, { size: 56, font: 'MuktaXB', color: C.ink, align: 'left' });
  // password field
  const fy = y + 140, strike = ev(t, T.type1 - 0.1, 0.35);
  ctx.save(); ctx.globalAlpha = 1 - 0.55 * strike; ctx.fillStyle = C.white; rr(ctx, x + 50, fy, w - 100, 110, 28); ctx.fill(); ctx.restore();
  hi(ctx, 'पासवर्ड', x + 84, fy + 70, { size: 40, color: C.ink, align: 'left', alpha: 1 - 0.55 * strike });
  text(ctx, '••••••••', x + w - 84, fy + 72, { size: 44, font: 'InterB', color: C.ink, align: 'right', alpha: 1 - 0.55 * strike });
  if (strike > 0) { ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 50, fy + 55); ctx.lineTo(x + 50 + (w - 100) * ease(strike), fy + 55); ctx.stroke(); ctx.restore(); }
  // passkey button with the key token
  const by = y + 300, pulse = back(ev(t, T.type1 + 0.25, 0.4));
  ctx.save(); ctx.translate(540, by + 75); ctx.scale(0.94 + 0.06 * pulse, 0.94 + 0.06 * pulse); ctx.translate(-540, -(by + 75));
  ctx.fillStyle = C.blueDeep; rr(ctx, x + 50, by + 8, w - 100, 150, 40); ctx.fill();
  ctx.fillStyle = C.blue; rr(ctx, x + 50, by, w - 100, 150, 40); ctx.fill();
  privKey(ctx, x + 140, by + 75, 84, { shadowOn: false });
  hi(ctx, 'पासकी से साइन इन', x + 210, by + 92, { size: 50, font: 'MuktaXB', color: C.white, align: 'left' });
  ctx.restore();
  kHi(ctx, 'कैसे?', 540, 1440, 96, t, T.kaise - 0.08, { color: C.blue });
}
// S2 creating a passkey: the phone makes two linked keys (same notch pattern)
function s2(ctx, t) {
  const t0 = SC[1];
  phone(ctx, 370, 590, 340, 560, { title: 'पासकी बनाएँ', alpha: easeOut(ev(t, t0, 0.35)) });
  const k = ease(ev(t, T.do2 - 0.1, 0.6));
  if (k > 0) {
    privKey(ctx, lerp(540, 300, k), lerp(900, 1290, k), lerp(40, 190, k));
    pubLock(ctx, lerp(540, 780, k), lerp(900, 1200, k), lerp(40, 190, k));
  }
  const pk = ev(t, T.chaabiyan - 0.05, 0.3);
  if (pk > 0) pillHi(ctx, 540, 1250, 'एक जोड़ी', { size: 40, fill: C.blue, color: C.white, alpha: pk });
}
// S3 who keeps what: private key with you, public key with the website
function s3(ctx, t) {
  const t0 = SC[2];
  const a = easeOut(ev(t, t0, 0.35));
  phone(ctx, 110, 620, 300, 500, { alpha: a, title: 'आपका फ़ोन' });
  site(ctx, 560, 640, 410, 380, { alpha: a });
  const pk = ease(ev(t, T.private3 - 0.1, 0.5));
  privKey(ctx, lerp(300, 260, pk), lerp(1290, 900, pk), lerp(190, 140, pk));
  if (pk > 0.9) pillHi(ctx, 260, 1220, 'प्राइवेट: आपके पास', { size: 36, fill: C.blue, color: C.white, alpha: ev(t, T.private3 + 0.4, 0.25) });
  const uk = ease(ev(t, T.public3 - 0.1, 0.55));
  pubLock(ctx, lerp(780, 765, uk), lerp(1200, 850, uk), lerp(190, 150, uk));
  if (uk > 0.9) pillHi(ctx, 765, 1100, 'पब्लिक: वेबसाइट के पास', { size: 36, fill: C.pale, alpha: ev(t, T.website3, 0.25) });
}
// S4 sign-in: the website sends a challenge; you unlock the phone the everyday way
function s4(ctx, t) {
  const t0 = SC[3];
  const a = easeOut(ev(t, t0, 0.35));
  const unlocking = ev(t, T.unlock - 0.15, 0.5);
  phone(ctx, 110, 640, 380, 700, { alpha: a, lockscreen: true, locked: 1 - unlocking, scan: ev(t, T.roz - 0.05, 0.9) });
  site(ctx, 560, 640, 410, 330, { alpha: a, body: (x, y, w) => pubLock(ctx, x + w / 2, y + 160, 110) });
  const ck = ease(ev(t, T.chunauti - 0.15, 0.7));
  if (t >= T.chunauti - 0.15) challenge(ctx, lerp(765, 300, ck), lerp(860, 985, ck) - Math.sin(Math.PI * ck) * 60, lerp(180, 250, ck), { rot: lerp(0, -0.04, ck) });
  if (t >= T.roz - 0.1) pillHi(ctx, 300, 1420, 'फ़िंगरप्रिंट · चेहरा · पिन', { size: 34, fill: C.pale, alpha: ev(t, T.roz - 0.1, 0.25) });
  if (unlocking > 0.6) pillHi(ctx, 765, 1150, 'फ़ोन अनलॉक', { size: 38, fill: C.blue, color: C.white, alpha: ev(t, T.unlock + 0.2, 0.25) });
}
// S5 the phone signs the challenge with the private key; the website checks it with the public key
function s5(ctx, t) {
  const t0 = SC[4];
  const a = easeOut(ev(t, t0, 0.3));
  const sg = ev(t, T.sign - 0.1, 0.3);
  const go = ease(ev(t, T.website6 - 0.1, 0.7));
  const cx = lerp(420, 760, go), cy = lerp(780, 820, go);
  // private key stamps the card
  const kin = ease(ev(t, T.private6 - 0.15, 0.45)), kx = lerp(170, 190, kin), ky = lerp(1150, 790, kin);
  privKey(ctx, kx, ky, 130, { alpha: a * (1 - clamp(go * 3)) });
  challenge(ctx, cx, cy, 320, { signed: sg, alpha: a });
  // website with the public-key lock; it opens when the signature checks out
  const op = ev(t, T.jaanchti - 0.1, 0.35);
  pubLock(ctx, 760, 1150, 170, op, { alpha: a });
  hi(ctx, 'पब्लिक चाबी', 760, 1360, { size: 36, color: C.gray, alpha: a });
  if (op > 0.5) { pillHi(ctx, 540, 1460, 'बिना पासवर्ड लॉगिन', { size: 42, fill: C.blue, color: C.white, alpha: ev(t, T.jaanchti + 0.2, 0.25) }); }
  hi(ctx, 'प्राइवेट चाबी से साइन', 330, 1010, { size: 36, color: C.gray, alpha: a * clamp(sg * 2) * (1 - clamp(go * 3)) });
}
// S6 takeaway: biometrics stay on the phone; the website only gets the signed answer
function s6(ctx, t) {
  const t0 = SC[5];
  const a = easeOut(ev(t, t0, 0.35));
  phone(ctx, 110, 620, 330, 620, { alpha: a, lockscreen: true, locked: 0, scan: 1 });
  if (t >= T.finger - 0.1) pillHi(ctx, 275, 1320, 'फ़ोन में ही', { size: 42, fill: C.blue, color: C.white, alpha: ev(t, T.finger - 0.1, 0.25) });
  site(ctx, 520, 620, 450, 560, { alpha: a, body: (x, y, w) => {
    const rows = [['पब्लिक चाबी', true, t0 + 0.2], ['साइन किया जवाब', true, t0 + 0.45], ['फ़िंगरप्रिंट / चेहरा', false, T.nahin7 - 0.1]];
    rows.forEach(([label, ok, tt], i) => {
      const k = ev(t, tt, 0.3); if (k <= 0) return;
      const ry = y + 130 + i * 130;
      ctx.save(); ctx.globalAlpha = S.alpha * k; ctx.fillStyle = C.white; rr(ctx, x + 28, ry, w - 56, 104, 26); ctx.fill(); ctx.restore();
      hi(ctx, label, x + 52, ry + 64, { size: 34, color: ok ? C.ink : C.grayDark, align: 'left', alpha: k });
      ctx.save(); ctx.globalAlpha = S.alpha * k; ctx.fillStyle = ok ? C.blue : C.ink; ctx.beginPath(); ctx.arc(x + w - 70, ry + 52, 28, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      if (ok) tick(ctx, x + w - 70, ry + 52, 30, C.white, k); else cross(ctx, x + w - 70, ry + 52, 30, C.white, k);
    });
  } });
  kHiPair(ctx, 'आपकी चाबी, ', 'आपके पास', 1450, 70, t, T.chime - 0.05, T.chime + 0.1);
}
// S7 CTA — the accepted end card (Hindi subline and button, as in batch 03)
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

// ---- SFX (each tied to an on-screen action) ---------------------------------------------------
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(T.type1 - 0.1, 'strike'); add(T.type1 + 0.25, 'blip'); add(T.kaise - 0.08, 'type');
  for (let i = 1; i < SCENES.length; i++) add(SC[i] - WIPE / 2, 'wipe');
  add(T.do2 - 0.1, 'clack'); add(T.chaabiyan - 0.05, 'match');
  add(T.private3 - 0.1, 'slide', { soft: true }); add(T.public3 - 0.1, 'slide', { soft: true }); add(T.website3, 'blip');
  add(T.chunauti - 0.15, 'paper'); add(T.roz - 0.05, 'carve'); add(T.unlock - 0.15, 'slot');
  add(T.sign - 0.1, 'clack'); add(T.website6 - 0.1, 'slide'); add(T.jaanchti - 0.1, 'match'); add(T.jaanchti + 0.2, 'blip', { hi: true });
  add(T.finger - 0.1, 'blip'); add(T.nahin7 - 0.1, 'strike');
  add(T.chime, 'chime');
  add(SC[6] + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e;
}

// ---- frame (accepted wipe compositor) ------------------------------------------------------------
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
