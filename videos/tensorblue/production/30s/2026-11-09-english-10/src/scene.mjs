// Tensorblue 30s english-10 · episode 01 — "A private window is not invisibility"
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged): kinetic type + tactile cards + blue wipes,
// before/after staging. Story objects: one private browser window on the fictional shop.example, the
// "kept on this device" tray, the profile's History and Cookies files after closing, a download and a
// bookmark, the website's request log and the network's log. All file and log contents are the real
// results in demo/out/private-demo.json (real Chromium via Playwright, local site + logging proxy).
// Every cue is timed from the narration's word timings (voice-timing.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalFonts } from '@napi-rs/canvas';
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

// ---- the real demo ------------------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/private-demo.json'), 'utf8'));
const HIST = DEMO.profile_after_close.history_urls.map((r) => r[0].replace(/^https?:\/\//, ''));
const COOK = DEMO.profile_after_close.cookies.map((r) => r[1]);
const SITE_LOG = DEMO.website_log.map((e) => e.request), NET_LOG = DEMO.network_log.map((e) => e.host + e.path);
const PRIV_COOKIES_OPEN = DEMO.steps[1].private_cookies_while_open;
if (HIST.join() !== 'shop.example/shoes' || COOK.join() !== 'seen_shoes' || SITE_LOG.join() !== 'GET /shoes,GET /gift'
  || NET_LOG.join() !== 'shop.example/shoes,shop.example/gift' || PRIV_COOKIES_OPEN.join() !== 'seen_gift' || DEMO.steps[2].cookies.length !== 0) throw new Error('demo result changed');

// ---- cues -----------------------------------------------------------------------------
const T = {
  private1: VW('L1', 'private'), who: VW('L1', 'who'), still1: VW('L1', 'still'), visit1: VW('L1', 'visit'),
  mainly: VW('L2', 'mainly'), what: VW('L2', 'what'), device2: VW('L2', 'device'), keeps: VW('L2', 'keeps'),
  close: VW('L3', 'close'), history: VW('L3', 'history'), cookies: VW('L3', 'cookies'), arent: VW('L3', "aren't"), kept: VW('L3', 'kept'),
  downloads: VW('L4', 'downloads'), bookmarks: VW('L4', 'bookmarks'), still4: VW('L4', 'still'), stay: VW('L4', 'stay'),
  website: VW('L5', 'website'), still5: VW('L5', 'still'), sees: VW('L5', 'sees'), visit5: VW('L5', 'visit'), and5: VW('L5', 'and'),
  your: VW('L5', 'your'), network: VW('L5', 'network'), school: VW('L5', 'school'), employer: VW('L5', 'employer'), internet: VW('L5', 'internet'), provider: VW('L5', 'provider'),
  helps: VW('L6', 'helps'), shared: VW('L6', 'shared'), device6: VW('L6', 'device'), doesnt: VW('L6', "doesn't"), invisible: VW('L6', 'invisible'), online: VW('L6', 'online'),
  follow: VW('L7', 'follow'), tb: VW('L7', 'tensorblue'),
};
const SC = [0, VL('L1').t1 + 0.2, VL('L2').t1 + 0.12, VL('L3').t1 + 0.12, VL('L4').t1 + 0.12, T.and5 - 0.12, VL('L5').t1 + 0.15, VL('L7').t0 - 0.35, 30.01];
const WIPE = 0.5;
const WDIR = [0, 1, -1, 2, 1, -1, 1, 2];   // 1 = L->R, -1 = R->L, 2 = bottom->top (CTA keeps the accepted wipe up)
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
// a browser window (our own drawing): private = navy title bar with a "Private" pill
function browserWindow(ctx, x, y, w, h, o = {}) {
  const { priv = true, url = 'shop.example/gift', alpha = 1, loaded = 1, scale = 1 } = o;
  if (alpha <= 0 || scale <= 0) return;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(scale, scale); ctx.translate(-(x + w / 2), -(y + h / 2));
  card(ctx, x, y, w, h, { fill: C.white, r: 26, alpha });
  ctx.save(); ctx.globalAlpha = alpha * S.alpha;
  ctx.fillStyle = priv ? C.ink : C.pale; rr(ctx, x, y, w, 84, 26); ctx.fill(); ctx.fillRect(x, y + 50, w, 34);
  ctx.fillStyle = priv ? '#1B2740' : C.white; rr(ctx, x + 24, y + 104, w - 48, 56, 28); ctx.fill();
  ctx.restore();
  for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.fillStyle = priv ? C.grayDark : C.gray; ctx.beginPath(); ctx.arc(x + 36 + i * 26, y + 42, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  if (priv) pill(ctx, x + w - 100, y + 42, 'Private', { size: 28, fill: C.blue, color: C.white, alpha });
  else text(ctx, 'Normal window', x + w - 30, y + 52, { size: 26, font: 'InterB', color: C.ink, align: 'right', alpha });
  text(ctx, url, x + 52, y + 142, { size: 28, font: 'MonoB', color: priv ? C.white : C.ink, align: 'left', alpha });
  // page: a simple shop
  const pa = alpha * clamp(loaded);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha = pa * S.alpha; ctx.fillStyle = C.blue; rr(ctx, x + 24, y + 184, w - 48, 110, 18); ctx.fill();
    const tw = (w - 48 - 32) / 3;
    for (let i = 0; i < 3; i++) { ctx.fillStyle = C.pale; rr(ctx, x + 24 + i * (tw + 16), y + 312, tw, h - 340, 16); ctx.fill(); }
    ctx.restore();
    text(ctx, 'Shop', x + 52, y + 254, { size: 42, font: 'IDXB', align: 'left', alpha: pa });
  }
  ctx.restore();
}
// a row in a "file" or "log" card
function row(ctx, x, y, w, label, o = {}) {
  const { alpha = 1, ok = null, sub = null, mono = true, dashed = false, color = C.ink } = o;
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha * S.alpha;
  if (dashed) { ctx.setLineDash([10, 8]); ctx.strokeStyle = C.grayMid; ctx.lineWidth = 3; rr(ctx, x, y, w, 66, 16); ctx.stroke(); }
  else { ctx.fillStyle = C.pale; rr(ctx, x, y, w, 66, 16); ctx.fill(); }
  ctx.restore();
  text(ctx, label, x + 22, y + 43, { size: 28, font: mono ? 'MonoB' : 'InterB', color: dashed ? C.grayMid : color, align: 'left', alpha });
  if (sub) text(ctx, sub, x + w - (ok === null ? 22 : 64), y + 42, { size: 24, font: 'InterSB', color: C.grayDark, align: 'right', alpha });
  if (ok !== null) badge(ctx, x + w - 34, y + 33, 18, ok, alpha);
}
function bookmarkStar(ctx, cx, cy, r, color = C.blue) {
  ctx.save(); ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; ctx.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
function downloadIcon(ctx, cx, cy, s, color = C.blue) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.42); ctx.lineTo(cx, cy + s * 0.12); ctx.moveTo(cx - s * 0.24, cy - s * 0.1); ctx.lineTo(cx, cy + s * 0.14); ctx.lineTo(cx + s * 0.24, cy - s * 0.1);
  ctx.moveTo(cx - s * 0.36, cy + s * 0.4); ctx.lineTo(cx + s * 0.36, cy + s * 0.4); ctx.stroke(); ctx.restore();
}

// ---- captions (accepted treatment: Inter SemiBold 54 px, ink inside y 340–520, x 90–990) -------
const CAPS = [
  { t0: VL('L1').t0, lines: ['This window is private.'] },
  { t0: VW('L1', 'so'), lines: ['So who can still see', 'this visit?'] },
  { t0: VL('L2').t0, lines: ['Private mode mainly changes', 'what this device keeps.'] },
  { t0: VL('L3').t0, lines: ['Close the window, and its', "history and cookies aren't kept."] },
  { t0: VL('L4').t0, lines: ['Downloads and bookmarks', 'you save still stay.'] },
  { t0: VL('L5').t0, lines: ['But the website', 'still sees the visit,'] },
  { t0: T.and5, lines: ['and so can whoever', 'runs your network,'] },
  { t0: VW('L5', 'like'), lines: ['like a school, employer', 'or internet provider.'] },
  { t0: VL('L6').t0, lines: ['So it helps on a shared device.'] },
  { t0: VW('L6', 'it'), lines: ["It doesn't make you", 'invisible online.'], tEnd: VL('L6').t1 + 0.9 },
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
// S1 hook: a private window opens the site — and three observers react in the first second
function s1(ctx, t) {
  browserWindow(ctx, 150, 600, 780, 470, { loaded: ev(t, 0.15, 0.25) });
  const obs = [['Website', 'saw the visit', true], ['Network', 'saw the site', true], ['This device', "won't keep it", false]];
  obs.forEach(([who, what, ok], i) => {
    const k = ev(t, 0.45 + i * 0.15, 0.3), x = 120 + i * 290;
    if (k <= 0) return;
    card(ctx, x, 1130, 260, 170, { fill: ok ? C.white : C.pale, r: 22, alpha: clamp(k * 2) });
    badge(ctx, x + 130, 1130, 26, ok, k);
    text(ctx, who, x + 130, 1208, { size: 32, font: 'IDXB', color: C.ink, alpha: clamp(k * 2) });
    text(ctx, what, x + 130, 1252, { size: 26, font: 'InterSB', color: ok ? C.blue : C.grayDark, alpha: clamp(k * 2) });
  });
  kpair(ctx, 'Who can ', 'still see?', 1450, 76, t, T.who - 0.05, T.still1 - 0.05);
}
// S2 what the device keeps while the private window is open (real names from the run)
function s2(ctx, t) {
  const t0 = SC[1];
  browserWindow(ctx, 150, 600, 780, 330, { alpha: easeOut(ev(t, t0, 0.3)), loaded: 1 });
  const a = easeOut(ev(t, T.mainly - 0.1, 0.3));
  card(ctx, 150, 980, 780, 300, { fill: C.white, r: 26, alpha: a });
  text(ctx, 'on this device, while open', 190, 1040, { size: 30, font: 'InterB', color: C.grayDark, align: 'left', alpha: a });
  row(ctx, 190, 1070, 700, 'open tab: shop.example/gift', { alpha: easeOut(ev(t, T.what - 0.1, 0.3)), mono: true });
  row(ctx, 190, 1160, 700, `cookie: ${PRIV_COOKIES_OPEN[0]}`, { alpha: easeOut(ev(t, T.device2 - 0.1, 0.3)), mono: true });
  kpair(ctx, 'What this device ', 'keeps.', 1450, 76, t, T.what - 0.05, T.keeps - 0.05);
}
// S3 close the window: the profile's real History and Cookies files afterwards
function s3(ctx, t) {
  const t0 = SC[2];
  const cl = ease(ev(t, T.close - 0.05, 0.45));
  if (cl < 1) browserWindow(ctx, 330, 600, 420, 230, { alpha: 1 - cl, scale: 1 - 0.5 * cl, loaded: 1 });
  const a = easeOut(ev(t, T.close + 0.25, 0.3));
  card(ctx, 130, 640, 820, 640, { fill: C.white, r: 28, alpha: a });
  text(ctx, 'browser profile, after closing', 170, 700, { size: 30, font: 'InterB', color: C.grayDark, align: 'left', alpha: a });
  text(ctx, 'History file', 170, 760, { size: 32, font: 'IDXB', color: C.ink, align: 'left', alpha: a });
  row(ctx, 170, 785, 740, HIST[0], { alpha: a, ok: true, sub: 'normal window' });
  row(ctx, 170, 865, 740, 'shop.example/gift', { alpha: a, dashed: true, sub: 'private: not saved' });
  const b = easeOut(ev(t, T.cookies - 0.15, 0.3));
  text(ctx, 'Cookies file', 170, 1000, { size: 32, font: 'IDXB', color: C.ink, align: 'left', alpha: b });
  row(ctx, 170, 1025, 740, COOK[0], { alpha: b, ok: true, sub: 'normal window' });
  row(ctx, 170, 1105, 740, PRIV_COOKIES_OPEN[0], { alpha: b, dashed: true, sub: 'private: not saved' });
  text(ctx, 'real Chromium run', 540, 1236, { size: 26, font: 'InterSB', color: C.grayDark, alpha: easeOut(ev(t, T.arent, 0.3)) });
  kpair(ctx, "Aren't ", 'kept.', 1450, 84, t, T.arent - 0.05, T.kept - 0.05);
}
// S4 what stays: things you save on purpose
function s4(ctx, t) {
  const t0 = SC[3];
  const a = easeOut(ev(t, t0, 0.3));
  card(ctx, 150, 640, 780, 420, { fill: C.white, r: 28, alpha: a });
  text(ctx, 'still on this device', 190, 702, { size: 30, font: 'InterB', color: C.grayDark, align: 'left', alpha: a });
  const d = back(ev(t, T.downloads - 0.1, 0.35)), bm = back(ev(t, T.bookmarks - 0.1, 0.35));
  if (d > 0) { ctx.save(); ctx.globalAlpha = clamp(d) * S.alpha; ctx.fillStyle = C.pale; rr(ctx, 190, 740, 700, 130, 20); ctx.fill(); ctx.restore(); downloadIcon(ctx, 255, 805, 70); text(ctx, 'gift-receipt.pdf', 320, 800, { size: 34, font: 'MonoB', color: C.ink, align: 'left', alpha: clamp(d) }); text(ctx, 'a file you downloaded', 320, 842, { size: 26, font: 'InterSB', color: C.grayDark, align: 'left', alpha: clamp(d) }); }
  if (bm > 0) { ctx.save(); ctx.globalAlpha = clamp(bm) * S.alpha; ctx.fillStyle = C.pale; rr(ctx, 190, 890, 700, 130, 20); ctx.fill(); ctx.restore(); bookmarkStar(ctx, 255, 955, 40); text(ctx, 'shop.example', 320, 950, { size: 34, font: 'MonoB', color: C.ink, align: 'left', alpha: clamp(bm) }); text(ctx, 'a bookmark you saved', 320, 992, { size: 26, font: 'InterSB', color: C.grayDark, align: 'left', alpha: clamp(bm) }); }
  kpair(ctx, 'Still ', 'stay.', 1450, 84, t, T.still4 - 0.05, T.stay - 0.05);
}
// S5 the website's own log (real): both visits, normal and private
function s5(ctx, t) {
  const t0 = SC[4];
  const a = easeOut(ev(t, t0, 0.3));
  card(ctx, 130, 640, 820, 360, { fill: C.white, r: 28, alpha: a });
  text(ctx, "shop.example's server log", 170, 702, { size: 32, font: 'IDXB', color: C.ink, align: 'left', alpha: a });
  row(ctx, 170, 735, 740, SITE_LOG[0], { alpha: a, sub: 'normal window' });
  const hl = ev(t, T.sees - 0.1, 0.3);
  row(ctx, 170, 820, 740, SITE_LOG[1], { alpha: a, sub: 'private window', color: hl > 0 ? C.blue : C.ink });
  if (hl > 0) { ctx.save(); ctx.globalAlpha = clamp(hl) * S.alpha; ctx.strokeStyle = C.blue; ctx.lineWidth = 5; rr(ctx, 167, 817, 746, 72, 18); ctx.stroke(); ctx.restore(); }
  text(ctx, 'the site still gets every request', 540, 950, { size: 28, font: 'InterSB', color: C.grayDark, alpha: easeOut(ev(t, T.visit5, 0.3)) });
  kpair(ctx, 'The website ', 'still sees.', 1450, 80, t, T.website - 0.05, T.sees - 0.05);
}
// S6 the network's log (real): the same site name for both windows; who runs networks
function s6(ctx, t) {
  const t0 = SC[5];
  const a = easeOut(ev(t, t0, 0.3));
  card(ctx, 130, 640, 820, 285, { fill: C.white, r: 28, alpha: a });
  text(ctx, 'network log', 170, 702, { size: 32, font: 'IDXB', color: C.ink, align: 'left', alpha: a });
  row(ctx, 170, 735, 740, DEMO.network_log[0].host, { alpha: a, sub: 'normal window' });
  row(ctx, 170, 820, 740, DEMO.network_log[1].host, { alpha: a, sub: 'private window', color: C.blue });
  [['a school', T.school], ['an employer', T.employer], ['an internet provider', T.internet]].forEach(([s, tt], i) => {
    const k = ev(t, tt - 0.1, 0.3); if (k <= 0) return;
    pill(ctx, 540, 1060 + i * 82, s, { size: 34, fill: C.pale, color: C.ink, alpha: easeOut(k) });
  });
  kpair(ctx, 'Your ', 'network', 1450, 84, t, T.your - 0.05, T.network - 0.05);
}
// S7 takeaway: what it is for, what it is not
function s7(ctx, t) {
  const t0 = SC[6];
  const r1 = easeOut(ev(t, T.helps - 0.1, 0.3)), r2 = easeOut(ev(t, T.doesnt - 0.1, 0.3));
  card(ctx, 130, 640, 820, 170, { fill: C.white, r: 24, alpha: r1 });
  badge(ctx, 205, 725, 30, true, ev(t, T.shared - 0.05, 0.3));
  text(ctx, 'shared device', 260, 712, { size: 26, font: 'InterB', color: C.blue, align: 'left', alpha: r1 });
  text(ctx, 'the next person won’t find', 260, 752, { size: 34, font: 'InterB', color: C.ink, align: 'left', alpha: r1 });
  text(ctx, 'it in this browser’s history', 260, 790, { size: 34, font: 'InterB', color: C.ink, align: 'left', alpha: r1 });
  card(ctx, 130, 850, 820, 170, { fill: C.pale, r: 24, alpha: r2 });
  badge(ctx, 205, 935, 30, false, ev(t, T.invisible - 0.05, 0.3));
  text(ctx, 'online', 260, 922, { size: 26, font: 'InterB', color: C.grayDark, align: 'left', alpha: r2 });
  text(ctx, 'websites and networks', 260, 962, { size: 34, font: 'InterB', color: C.ink, align: 'left', alpha: r2 });
  text(ctx, 'can still see the visit', 260, 1000, { size: 34, font: 'InterB', color: C.ink, align: 'left', alpha: r2 });
  pill(ctx, 540, 1110, 'private window: fewer traces on this device', { size: 28, fill: C.blue, color: C.white, alpha: easeOut(ev(t, T.chime, 0.3)) });
  kpair(ctx, 'Not ', 'invisible.', 1450, 92, t, T.doesnt - 0.05, T.invisible - 0.05);
}
// S8 CTA — the accepted English end card, unchanged
function s8(ctx, t) {
  const t0 = SC[7];
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
const SCENES = [s1, s2, s3, s4, s5, s6, s7, s8];

// ---- SFX (each tied to an on-screen action) ---------------------------------------------
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(0.15, 'slide', { soft: true }); add(0.45, 'blip', { hi: true }); add(0.6, 'blip', { hi: true }); add(0.75, 'blip', { lo: true }); add(T.still1 - 0.05, 'type');
  for (let i = 1; i < SCENES.length; i++) add(SC[i] - WIPE / 2, 'wipe');
  add(T.what - 0.1, 'clack', { soft: true }); add(T.device2 - 0.1, 'clack', { soft: true }); add(T.keeps - 0.05, 'type');
  add(T.close - 0.05, 'slide'); add(T.history - 0.2, 'paper'); add(T.cookies - 0.15, 'paper'); add(T.arent - 0.05, 'type', { lo: true });
  add(T.downloads - 0.1, 'slot'); add(T.bookmarks - 0.1, 'blip'); add(T.stay - 0.05, 'type');
  add(T.sees - 0.1, 'carve'); add(T.sees - 0.05, 'type');
  add(T.school - 0.1, 'blip'); add(T.employer - 0.1, 'blip'); add(T.internet - 0.1, 'blip'); add(T.network - 0.05, 'type');
  add(T.shared - 0.05, 'match'); add(T.invisible - 0.05, 'strike'); add(T.chime, 'chime');
  add(SC[7] + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
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
