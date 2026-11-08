// Tensorblue 30s english-09 · episode 01 — "Works for your friend, fails for you" (DNS caching)
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged): kinetic type + tactile cards + simple
// isometric stage (old server, new server) + blue wipes, before/after staging.
// Story objects: two phones on the fictional shop.example, two DNS resolver cards with a cache row,
// question/answer cards handed between them, and the site moving from the old server to the new one.
// Addresses, TTLs and who-got-what are the real results in demo/out/dns-demo.json (dnslib + dnsmasq + dig).
// Every cue is timed from the narration's word timings (voice-timing.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalFonts } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, pill,
  isoP, isoBox, makeBackground,
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
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/dns-demo.json'), 'utf8'));
const Q = DEMO.log.filter((e) => e.address);
const YOURS_BEFORE = Q[0], AUTH_AFTER = Q[1], YOURS_STALE = Q[2], FRIEND = Q[3], YOURS_LATER = Q[4];
const OLD = DEMO.old, NEW = DEMO.new, NAME = DEMO.name;
if (YOURS_BEFORE.address !== OLD || AUTH_AFTER.address !== NEW || YOURS_STALE.address !== OLD || FRIEND.address !== NEW || YOURS_LATER.address !== NEW) throw new Error('demo result changed');

// ---- cues -----------------------------------------------------------------------------
const T = {
  works: VW('L1', 'works'), not: VW('L1', 'not'), yours1: VW('L1', 'yours'), why: VW('L1', 'why'),
  get: VW('L2', 'get'), address2: VW('L2', 'address'), dns: VW('L2', 'dns'), resolver2: VW('L2', 'resolver'), caches: VW('L2', 'caches'),
  moved: VW('L3', 'moved'), servers: VW('L3', 'servers'), keeps: VW('L3', 'keeps'), old3: VW('L3', 'old'), ttl3: VW('L3', 'time-to-live'), out: VW('L3', 'out'),
  asked: VW('L4', 'asked'), move4: VW('L4', 'move'), got: VW('L4', 'got'), new4: VW('L4', 'new'),
  compare: VW('L5', 'compare'), old5: VW('L5', 'old'), stale: VW('L5', 'stale'), cache5: VW('L5', 'cache'), same: VW('L5', 'same'), look: VW('L5', 'look'), elsewhere: VW('L5', 'elsewhere'),
  moving: VW('L6', 'moving'), lower: VW('L6', 'lower'), ttl6: VW('L6', 'ttl'), first: VW('L6', 'first'),
  follow: VW('L7', 'follow'), tb: VW('L7', 'tensorblue'),
};
const SC = [0, VL('L1').t1 + 0.2, VL('L2').t1 + 0.12, VL('L3').t1 + 0.12, VL('L4').t1 + 0.12, VL('L5').t1 + 0.12, VL('L7').t0 - 0.35, 30.01];
const WIPE = 0.5;
const WDIR = [0, 1, -1, 2, 1, -1, 2];   // 1 = L->R, -1 = R->L, 2 = bottom->top
T.chime = VL('L6').t1 + 0.1;
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
// a phone opening the fictional shop.example: loading | ok | fail
function phone(ctx, cx, top, who, state, o = {}) {
  const { alpha = 1, w = 300, h = 520 } = o, x = cx - w / 2, sc = w / 300;
  text(ctx, who, cx, top - 22, { size: 34, font: 'IDXB', color: C.white, alpha });
  card(ctx, x, top, w, h, { fill: C.pale, r: 44 * sc, alpha });
  ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.fillStyle = C.gray; rr(ctx, cx - 40 * sc, top + 16, 80 * sc, 12, 6); ctx.fill();
  ctx.fillStyle = C.white; rr(ctx, x + 22 * sc, top + 46 * sc, w - 44 * sc, 54 * sc, 27 * sc); ctx.fill(); ctx.restore();
  text(ctx, NAME, cx, top + 82 * sc, { size: 26 * sc, font: 'InterSB', color: C.ink, alpha });
  const my = top + 130 * sc;
  if (state === 'loading') {
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.fillStyle = C.grayMid; ctx.beginPath(); ctx.arc(cx - 30 * sc + i * 30 * sc, top + h * 0.55, 9 * sc, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  } else if (state === 'ok') {
    ctx.save(); ctx.globalAlpha = alpha * S.alpha;
    ctx.fillStyle = C.blue; rr(ctx, x + 22 * sc, my, w - 44 * sc, 120 * sc, 18 * sc); ctx.fill();
    for (let i = 0; i < 2; i++) { ctx.fillStyle = C.white; rr(ctx, x + 22 * sc + i * (w - 44 * sc + 16 * sc) / 2, my + 140 * sc, (w - 44 * sc - 16 * sc) / 2, 150 * sc, 16 * sc); ctx.fill();
      ctx.fillStyle = C.gray; rr(ctx, x + 38 * sc + i * (w - 44 * sc + 16 * sc) / 2, my + 250 * sc, 70 * sc, 14 * sc, 7 * sc); ctx.fill(); }
    ctx.restore();
    text(ctx, 'Shop', x + 46 * sc, my + 74 * sc, { size: 40 * sc, font: 'IDXB', align: 'left', alpha });
  } else if (state === 'fail') {
    ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, top + h * 0.47, 46 * sc, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    crossMark(ctx, cx, top + h * 0.47, 56 * sc);
    text(ctx, "Can't connect", cx, top + h * 0.47 + 100 * sc, { size: 32 * sc, font: 'IDXB', color: C.ink, alpha });
    text(ctx, 'no response', cx, top + h * 0.47 + 140 * sc, { size: 26 * sc, font: 'InterSB', color: C.grayDark, alpha });
  }
}
// a DNS resolver card with its cache row
function resolver(ctx, x, y, who, o = {}) {
  const { alpha = 1, addr = null, ttl = null, fresh = false, hl = 0, w = 420 } = o;
  card(ctx, x, y, w, 250, { fill: C.white, r: 26, alpha });
  text(ctx, 'DNS resolver', x + 30, y + 60, { size: 36, font: 'IDXB', color: C.ink, align: 'left', alpha });
  text(ctx, who, x + w - 30, y + 58, { size: 26, font: 'InterSB', color: C.grayDark, align: 'right', alpha });
  ctx.save(); ctx.globalAlpha = alpha * S.alpha; ctx.fillStyle = hl > 0 ? `rgba(59,130,246,${0.12 + 0.12 * hl})` : C.pale; rr(ctx, x + 24, y + 92, w - 48, 128, 18); ctx.fill(); ctx.restore();
  text(ctx, 'cache', x + 44, y + 126, { size: 24, font: 'InterB', color: C.grayDark, align: 'left', alpha });
  if (addr) {
    text(ctx, NAME, x + 44, y + 168, { size: 28, font: 'InterB', color: C.ink, align: 'left', alpha });
    text(ctx, addr, x + 44, y + 204, { size: 30, font: 'MonoB', color: fresh ? C.blue : C.ink, align: 'left', alpha });
    if (ttl != null) pill(ctx, x + w - 92, y + 118, `TTL ${ttl} s`, { size: 24, fill: C.ink, color: C.white, alpha });
  } else text(ctx, 'empty', x + 44, y + 182, { size: 30, font: 'InterSB', color: C.grayMid, align: 'left', alpha });
}
// handed-over cards: a question and an answer
function questionCard(ctx, cx, cy, k) { if (k > 0) pill(ctx, cx, cy, `${NAME}?`, { size: 30, fill: C.pale, color: C.ink, alpha: clamp(k * 3) }); }
function answerCard(ctx, cx, cy, addr, k, fresh) {
  if (k <= 0) return;
  const w = textW(ctx, addr, 32, 'MonoB') + 44, h = 60;
  ctx.save(); ctx.globalAlpha = clamp(k * 3) * S.alpha; shadow(ctx, cx, cy + 36, w * 0.45, 10, 0.5);
  ctx.fillStyle = fresh ? C.blue : C.ink; rr(ctx, cx - w / 2, cy - h / 2, w, h, 16); ctx.fill(); ctx.restore();
  text(ctx, addr, cx, cy + 11, { size: 32, font: 'MonoB', color: C.white, alpha: clamp(k * 3) });
}

// ---- captions (accepted treatment: Inter SemiBold 54 px, ink inside y 340–520, x 90–990) -------
const CAPS = [
  { t0: VL('L1').t0, lines: ["It works on your friend's phone,", 'but not on yours.'] },
  { t0: T.why, lines: ['Why?'] },
  { t0: VL('L2').t0, lines: ["Phones get a site's address", 'from a DNS resolver,'] },
  { t0: VW('L2', 'which'), lines: ['which caches it.'] },
  { t0: VL('L3').t0, lines: ['The site moved servers.'] },
  { t0: VW('L3', 'your'), lines: ['Your resolver keeps', 'the old address'] },
  { t0: VW('L3', 'until'), lines: ['until its time-to-live', 'runs out.'] },
  { t0: VL('L4').t0, lines: ["Your friend's resolver asked", 'after the move'] },
  { t0: VW('L4', 'and'), lines: ['and got the new one.'] },
  { t0: VL('L5').t0, lines: ['Compare both', "phones' addresses."] },
  { t0: T.old5, lines: ['Old one on yours?', 'Stale cache.'] },
  { t0: T.same, lines: ['Same? Look elsewhere.'] },
  { t0: VL('L6').t0, lines: ['Moving a site?', 'Lower the TTL first.'], tEnd: VL('L7').t0 - 0.1 },
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
// S1 hook: same address, two phones — your friend's loads, yours fails (first second)
function s1(ctx, t) {
  phone(ctx, 300, 640, 'You', t < 0.6 ? 'loading' : 'fail');
  phone(ctx, 780, 640, 'Friend', t < 0.45 ? 'loading' : 'ok');
  badge(ctx, 905, 650, 26, true, ev(t, 0.45, 0.3));
  badge(ctx, 425, 650, 26, false, ev(t, 0.6, 0.3));
  pill(ctx, 540, 1250, `same address: ${NAME}`, { size: 32, fill: C.white, color: C.ink, alpha: easeOut(ev(t, 1.0, 0.3)) });
  kword(ctx, 'Why?', 540, 1440, 100, t, T.why - 0.05, { color: C.blue });
}
// S2 the lookup: question to the resolver, the answer comes back and is cached
function s2(ctx, t) {
  const t0 = SC[1];
  phone(ctx, 240, 640, 'You', 'loading', { w: 230, h: 400, alpha: easeOut(ev(t, t0, 0.3)) });
  const cached = t >= T.caches - 0.05;
  resolver(ctx, 450, 650, 'yours', { alpha: easeOut(ev(t, t0 + 0.1, 0.3)), addr: cached ? OLD : null, ttl: cached ? YOURS_BEFORE.ttl : null, hl: cached ? 1 - ev(t, T.caches + 0.3, 0.5) : 0 });
  const q = ease(ev(t, T.get - 0.1, 0.6));
  if (q > 0 && q < 1) questionCard(ctx, lerp(240, 660, q), lerp(860, 940, q), 1);
  const a = ease(ev(t, T.address2, 0.6)), drop = ease(ev(t, T.caches - 0.35, 0.3));
  if (a > 0 && drop < 1) answerCard(ctx, lerp(660, 240, a), lerp(940, 860, a), OLD, 1 - drop, false);
  text(ctx, `real dig answer: ${NAME}  ${YOURS_BEFORE.ttl}  IN A  ${OLD}`, 540, 1205, { size: 26, font: 'MonoM', color: C.gray, alpha: easeOut(ev(t, T.caches + 0.1, 0.3)) });
  kpair(ctx, 'DNS ', 'resolver', 1440, 92, t, T.dns - 0.05, T.resolver2 - 0.05);
}
// S3 isometric stage: the site moves to a new server; your resolver still hands out the old address
const O3 = { x: 540, y: 1150, u: 54 };
const SLAB = { top: C.slab, left: C.slabSide, right: '#0A1428', edge: 'rgba(183,199,223,0.25)' };
const SRV = { top: C.pale, left: C.gray, right: '#A7B8D2', edge: 'rgba(3,6,16,0.25)' };
const SRV_OFF = { top: '#6F7D94', left: '#4B566A', right: '#3E4859', edge: 'rgba(3,6,16,0.3)' };
function server(ctx, o, x0, label, on) {
  isoBox(ctx, o, x0, -1, 0, 2, 2, 1.8, on ? SRV : SRV_OFF);
  const [lx, ly] = isoP(o, x0 + 2, 1, 0);
  const w = textW(ctx, label, 24, 'MonoB') + 30;
  ctx.save(); ctx.globalAlpha = S.alpha; ctx.fillStyle = on ? C.white : C.grayMid; rr(ctx, lx - w / 2, ly + 14, w, 44, 22); ctx.fill(); ctx.restore();
  text(ctx, label, lx, ly + 44, { size: 24, font: 'MonoB', color: C.ink });
}
function s3(ctx, t) {
  const t0 = SC[2];
  const P = (x, y, z) => isoP(O3, x, y, z);
  shadow(ctx, O3.x, O3.y + 230, 360, 36, 0.5);
  isoBox(ctx, O3, -4, -3, -0.4, 8, 6, 0.4, SLAB);
  const mv = ease(ev(t, T.moved - 0.1, 0.7)), off = t >= T.moved + 0.5;
  server(ctx, O3, -3, OLD, !off);
  server(ctx, O3, 1, NEW, true);
  // the site: a blue block hops from the old server to the new one
  const sx = lerp(-2, 2, mv), sz = 1.8 + Math.sin(mv * Math.PI) * 1.2;
  isoBox(ctx, O3, sx - 0.5, -0.5, sz, 1, 1, 0.55, { top: '#5B97F8', left: C.blue, right: C.blueDeep, edge: 'rgba(255,255,255,0.3)' });
  { const [lx, ly] = P(sx, 0, sz + 1.0); text(ctx, 'site', lx, ly, { size: 28, font: 'IDXB', color: C.white }); }
  if (off) { const [ox, oy] = P(-2, 0, 2.4); pill(ctx, ox, oy - 20, 'old server off', { size: 26, fill: C.ink, color: C.white, alpha: easeOut(ev(t, T.moved + 0.5, 0.3)) }); }
  // your resolver card (top) keeps the old answer; its TTL counts down (real demo values)
  const ttl = Math.round(lerp(YOURS_BEFORE.ttl, YOURS_STALE.ttl, ev(t, T.keeps, T.out - T.keeps)));
  resolver(ctx, 150, 610, 'yours', { addr: OLD, ttl, hl: ev(t, T.keeps - 0.1, 0.3) * (1 - ev(t, T.ttl3 + 0.6, 0.4)) * 0.8 + 0.2 * ev(t, T.keeps, 0.2), w: 470 });
  pill(ctx, 820, 700, 'still cached', { size: 30, fill: C.blue, color: C.white, alpha: easeOut(ev(t, T.keeps - 0.05, 0.3)) });
  kword(ctx, 'time-to-live', 540, 1468, 76, t, T.ttl3 - 0.05, { color: C.blue });
}
// S4 your friend's resolver asked after the move: empty cache -> new answer -> the page loads (mirror of S2)
function s4(ctx, t) {
  const t0 = SC[3];
  const got = t >= T.got - 0.05, ok = t >= T.new4 + 0.15;
  phone(ctx, 240, 640, 'Friend', ok ? 'ok' : 'loading', { w: 230, h: 400, alpha: easeOut(ev(t, t0, 0.3)) });
  badge(ctx, 345, 650, 22, true, ev(t, T.new4 + 0.15, 0.3));
  resolver(ctx, 450, 650, "friend's", { alpha: easeOut(ev(t, t0 + 0.1, 0.3)), addr: got ? NEW : null, ttl: got ? FRIEND.ttl : null, fresh: true, hl: got ? 1 - ev(t, T.got + 0.3, 0.5) : 0 });
  const q = ease(ev(t, T.asked - 0.1, 0.55));
  if (q > 0 && q < 1) questionCard(ctx, lerp(240, 660, q), lerp(860, 940, q), 1);
  pill(ctx, 660, 960, 'asked after the move', { size: 28, fill: C.pale, color: C.ink, alpha: easeOut(ev(t, T.move4 - 0.1, 0.3)) * (1 - ev(t, T.got - 0.35, 0.2)) });
  const a = ease(ev(t, T.got - 0.25, 0.55));
  if (a > 0 && a < 1) answerCard(ctx, lerp(660, 240, a), lerp(940, 860, a), NEW, 1, true);
  text(ctx, `real dig answer: ${NAME}  ${FRIEND.ttl}  IN A  ${NEW}`, 540, 1205, { size: 26, font: 'MonoM', color: C.gray, alpha: easeOut(ev(t, T.new4 + 0.1, 0.3)) });
  kpair(ctx, 'Got the ', 'new one.', 1440, 88, t, T.got - 0.05, T.new4 - 0.05);
}
// S5 the diagnostic: compare the addresses; old one -> stale cache; same -> look elsewhere
function s5(ctx, t) {
  const t0 = SC[4];
  const same = t >= T.same - 0.05;
  const cols = [['Your phone', same ? NEW : OLD, !same], ["Friend's phone", NEW, false]];
  cols.forEach(([who, addr, isOld], i) => {
    const x = 130 + i * 420, a = easeOut(ev(t, t0 + i * 0.1, 0.3));
    card(ctx, x, 620, 400, 190, { fill: C.white, r: 24, alpha: a });
    text(ctx, who, x + 30, 676, { size: 30, font: 'InterB', color: C.grayDark, align: 'left', alpha: a });
    text(ctx, addr, x + 30, 744, { size: 38, font: 'MonoB', color: isOld ? C.ink : C.blue, align: 'left', alpha: a });
    if (isOld) pill(ctx, x + 310, 680, 'old', { size: 26, fill: C.ink, color: C.white, alpha: easeOut(ev(t, T.old5 - 0.05, 0.3)) });
  });
  // verdicts
  const v1 = easeOut(ev(t, T.stale - 0.1, 0.3)) * (1 - ev(t, T.same - 0.1, 0.2));
  if (v1 > 0) { card(ctx, 230, 870, 620, 120, { fill: C.blue, edge: C.blueDeep, r: 24, alpha: v1 }); text(ctx, 'Different, old on yours: stale cache', 540, 943, { size: 32, font: 'InterB', color: C.white, alpha: v1 }); }
  const v2 = easeOut(ev(t, T.same, 0.3));
  if (v2 > 0) {
    card(ctx, 230, 870, 620, 120, { fill: C.pale, r: 24, alpha: v2 });
    text(ctx, 'Same address: not DNS', 540, 943, { size: 34, font: 'InterB', color: C.ink, alpha: v2 });
    ['the app', 'the network', 'the server'].forEach((s, i) => pill(ctx, 260 + i * 280, 1080, s, { size: 30, fill: C.white, color: C.ink, alpha: easeOut(ev(t, T.elsewhere - 0.1 + i * 0.12, 0.3)) }));
    text(ctx, 'look elsewhere', 540, 1170, { size: 30, font: 'InterSB', color: C.gray, alpha: easeOut(ev(t, T.elsewhere, 0.3)) });
  }
  kpair(ctx, 'Stale ', 'cache.', 1440, 88, t, T.stale - 0.05, T.cache5 - 0.05, { t1: T.same - 0.15 });
  kpair(ctx, 'Look ', 'elsewhere.', 1440, 88, t, T.look - 0.05, T.elsewhere - 0.05);
}
// S6 the owner's tip: lower the TTL before a planned move
function s6(ctx, t) {
  const t0 = SC[5];
  const a = easeOut(ev(t, t0, 0.3));
  card(ctx, 150, 640, 780, 330, { fill: C.white, r: 28, alpha: a });
  text(ctx, 'DNS record', 190, 702, { size: 38, font: 'IDXB', color: C.ink, align: 'left', alpha: a });
  text(ctx, 'example settings', 890, 700, { size: 26, font: 'InterSB', color: C.grayDark, align: 'right', alpha: a });
  text(ctx, `${NAME}   A   ${OLD}`, 190, 778, { size: 32, font: 'MonoB', color: C.ink, align: 'left', alpha: a });
  text(ctx, 'TTL', 190, 880, { size: 36, font: 'InterB', color: C.ink, align: 'left', alpha: a });
  const k = ease(ev(t, T.lower - 0.05, 0.6)), val = Math.round(lerp(3600, 60, k));
  ctx.save(); ctx.globalAlpha = a * S.alpha; ctx.fillStyle = k > 0 ? 'rgba(59,130,246,0.14)' : C.pale; rr(ctx, 290, 830, 330, 76, 18); ctx.fill(); ctx.restore();
  text(ctx, `${val} s`, 455, 882, { size: 40, font: 'MonoB', color: k > 0 ? C.blue : C.ink, alpha: a });
  text(ctx, k >= 1 ? 'then move' : 'before moving', 760, 880, { size: 30, font: 'InterB', color: k >= 1 ? C.blue : C.grayDark, alpha: a });
  pill(ctx, 540, 1060, 'old answers expire sooner', { size: 32, fill: C.blue, color: C.white, alpha: easeOut(ev(t, T.chime, 0.3)) });
  kpair(ctx, 'Lower the ', 'TTL first.', 1300, 88, t, T.lower - 0.05, T.ttl6 - 0.05);
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
  add(0.45, 'match'); add(0.6, 'strike'); add(1.0, 'clack', { soft: true }); add(T.why - 0.05, 'type');
  for (let i = 1; i < SCENES.length; i++) add(SC[i] - WIPE / 2, 'wipe');
  add(T.get - 0.1, 'slide', { soft: true }); add(T.address2, 'slide'); add(T.caches - 0.05, 'slot'); add(T.dns - 0.05, 'type');
  add(T.moved - 0.1, 'slide'); add(T.moved + 0.6, 'clack'); add(T.keeps - 0.05, 'blip', { lo: true }); add(T.ttl3 - 0.05, 'type');
  add(T.asked - 0.1, 'slide', { soft: true }); add(T.got - 0.3, 'slide'); add(T.got - 0.05, 'slot'); add(T.new4 + 0.2, 'match');
  add(T.old5 - 0.05, 'blip', { lo: true }); add(T.stale - 0.1, 'carve'); add(T.same - 0.05, 'clack'); add(T.elsewhere - 0.1, 'blip', { hi: true });
  add(T.lower - 0.05, 'slide'); add(T.ttl6 - 0.05, 'type'); add(T.chime, 'chime');
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
