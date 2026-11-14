// Tensorblue 30s english-14 · episode 01 — "10,000 posts. 14 rows." (how a long feed recycles its rows)
// Blue Receipt Theatre (accepted kit `brt.mjs`, unchanged) + the original 3D stage (`stage3d.mjs`):
// a phone on a bench shows a 12-row feed. Every row that leaves the top flies around the side, gets
// re-stamped with its next post and slides back in at the bottom — 14 physical cards in total, the
// numbers measured in demo/out/list-demo.json (Chromium test). A 10,000-row tower is the plain list.
// Every cue is timed from the narration's word timings (voice-timing.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import {
  W, H, FPS, C, S, LOGO, clamp, lerp, ease, easeOut, easeIn, back, ev, rr, text, textW, shadow, kword, makeBackground,
} from './brt.mjs';
import { camera, project, drawBox, contactShadow, floor, bez, mix3 } from './stage3d.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TIMING = JSON.parse(fs.readFileSync(path.resolve(HERE, '../audio/voice-timing.json'), 'utf8'));
const LINE = Object.fromEntries(TIMING.lines.map((l) => [l.id, l]));
function VW(id, word, n = 1) {
  let k = 0;
  for (const w of LINE[id].words) if (w.w.toLowerCase().replace(/[^a-z0-9'-]/g, '') === word) { k++; if (k === n) return w.t0; }
  throw new Error(`cue word not found: ${id}/${word}`);
}
const VL = (id) => LINE[id];

// ---- the measured demo (Chromium) ------------------------------------------------------------------
const DEMO = JSON.parse(fs.readFileSync(path.resolve(HERE, 'demo/out/list-demo.json'), 'utf8'));
const POOL = DEMO.recycled.pool_size, VISIBLE = POOL - 2;
if (DEMO.plain.rows !== 10000 || POOL !== 14 || DEMO.recycled.rows_in_dom_max !== 14 || DEMO.recycled.rows_created !== 14 || DEMO.recycled.last_post_shown !== 10000) throw new Error('demo result changed');

// ---- site colours (tensorblue.com CSS, re-checked 2026-11-11) ----------------------------------
const SITE = { surface: '#0B1423', surface2: '#08101F', deep: '#050816', blue: '#3B82F6', logo: '#0A6CFF', pale: '#D8E3F5', gray: '#B7C7DF', white: '#FFFFFF', ink: '#030610' };
const DARK_BLUE = '#2757A6';

// ---- cues -----------------------------------------------------------------------------------------
const T = {
  ten: VW('L1', 'ten'), posts1: VW('L1', 'posts'), not: VW('L1', 'not'), rows1: VW('L1', 'rows'),
  so: VW('L2', 'so'), where: VW('L2', 'where'), come: VW('L2', 'come'),
  lists: VW('L3', 'lists'), only: VW('L3', 'only'), rows3: VW('L3', 'rows'), screen: VW('L3', 'screen'), plus: VW('L3', 'plus'), spares: VW('L3', 'spares'),
  a4: VW('L4', 'a'), leaves: VW('L4', 'leaves'), top: VW('L4', 'top'), destroyed: VW('L4', 'destroyed'), its: VW('L4', "it's"), reused: VW('L4', 'reused'), next: VW('L4', 'next'),
  in5: VW('L5', 'in'), test: VW('L5', 'test'), a5: VW('L5', 'a'), plain: VW('L5', 'plain'), ten5: VW('L5', 'ten'), rows5: VW('L5', 'rows'), a5b: VW('L5', 'a', 2), recycling: VW('L5', 'recycling'), fourteen: VW('L5', 'fourteen'),
  android: VW('L6', 'android'), improves: VW('L6', 'improves'), and6: VW('L6', 'and'), saves: VW('L6', 'saves'), power: VW('L6', 'power'),
  a7: VW('L7', 'a'), small: VW('L7', 'small'), loop: VW('L7', 'loop'), refilled: VW('L7', 'refilled'), scroll: VW('L7', 'scroll'),
  follow: VW('L8', 'follow'), tb: VW('L8', 'tensorblue'),
};
T.chime = VL('L7').t1 + 0.1;
const CTA_AT = VL('L8').t0 - 0.4;
const SHOTS = [0, T.so - 0.15, T.lists - 0.15, T.a4 - 0.15, T.in5 - 0.15, T.android - 0.15, T.a7 - 0.15, CTA_AT, 30.01];
const SH = { hook: 0, where: 1, spares: 2, reuse: 3, proof: 4, android: 5, payoff: 6, cta: 7 };
export const CUES = { ...T, scenes: SHOTS };

// ---- scrolling: S(t) = rows scrolled; row r (post r+1) sits at u = r - S rows below the top ----------
// the follow shot: card 0 leaves the top with Post 15 on "leaves" and comes back as Post 29 by "reused"
const SK = [[0, 0], [0.35, 0], [1.5, 5.0], [T.leaves, 14.0], [T.reused - 0.05, 15.0], [CTA_AT, 40.0], [30.01, 42.0]];
function scrollAt(t) {
  for (let i = 0; i + 1 < SK.length; i++) {
    const [t0, s0] = SK[i], [t1, s1] = SK[i + 1];
    if (t <= t1) { const k = clamp((t - t0) / (t1 - t0)); return lerp(s0, s1, i === 1 ? easeOut(k) : k); }
  }
  return SK[SK.length - 1][1];
}

// ---- camera: one pose per shot, eased moves between them (no idle drift) ------------------------
const POSES = [
  { eye: [0.1, 4.8, 11.2], at: [0.1, 5.0, 0.0], fov: 32 },         // hook: the feed, face on
  { eye: [5.4, 5.0, 11.6], at: [1.1, 4.5, 0.2], fov: 34 },         // where from? 3/4 view: a row flies around the side
  { eye: [1.6, 4.4, 12.4], at: [0.8, 3.0, 0.0], fov: 34 },         // only the rows on screen, plus spares
  { eye: [5.0, 4.8, 10.6], at: [1.2, 3.7, 0.3], fov: 34 },         // follow one row: off the top, spun round, back in
  { eye: [-1.0, 5.0, 13.5], at: [-0.8, 3.6, 0.0], fov: 38 },       // proof: the 10,000-row tower vs the 14-row loop
  { eye: [3.0, 4.6, 11.4], at: [0.9, 3.0, 0.0], fov: 34 },         // Android: responsive, saves power
  { eye: [-2.4, 6.0, 14.4], at: [0.6, 4.6, 0.0], fov: 36 },        // payoff: the small loop (slow crane)
];
const MOVE = [0, 0.9, 0.8, 0.8, 0.9, 0.8, 1.0];
function camAt(t) {
  let i = 0; while (i + 1 < POSES.length && t >= SHOTS[i + 1]) i++;
  const p = POSES[i]; if (i === 0) return camera(p.eye, p.at, p.fov);
  const q = POSES[i - 1], k = ease(ev(t, SHOTS[i], MOVE[i]));
  let eye = mix3(q.eye, p.eye, k); const at = mix3(q.at, p.at, k);
  if (i === SH.payoff) { const c = ease(ev(t, SHOTS[i] + MOVE[i], CTA_AT - SHOTS[i] - MOVE[i])); eye = mix3(eye, [3.2, 7.2, 13.6], c * k); } // slow orbit/crane on the payoff only
  return camera(eye, at, lerp(q.fov, p.fov, k));
}

// ---- world objects --------------------------------------------------------------------------------
const BENCH = { x: 0.0, y: -0.6, z: -1.2, w: 22, h: 0.6, d: 15, colors: { top: SITE.surface, front: SITE.surface2, left: SITE.surface2, right: SITE.surface2 }, color: SITE.surface2 };
const PH = { x: 0, y: 0, z: 0, w: 2.9, h: 6.0, d: 0.32, pitch: -0.07 };
const BODY = { top: '#1B2740', left: SITE.surface2, right: SITE.surface2, back: SITE.surface, front: SITE.surface };
const ROW_H = 0.37, CARD_H = 0.33, CARD_W = 2.5, CARD_D = 0.05;
const Y_TOP = 5.35;                                                     // top of row 0 (phone-local)
const ZC = PH.d / 2 + 0.03;                                             // cards sit on the screen
// phone-local → world (the phone leans back by its pitch about its base)
const cp = Math.cos(PH.pitch), sp = Math.sin(PH.pitch);
const L2W = (lx, ly, lz) => [PH.x + lx, PH.y + ly * cp - lz * sp, PH.z + ly * sp + lz * cp];
const TOWER = { x: -4.2, y: 0, z: -1.0, w: CARD_W, d: 1.0 };

// textures -----------------------------------------------------------------------------------------
const TEXC = new Map();
function cached(key, w, h, draw) { if (TEXC.has(key)) return TEXC.get(key); const cv = createCanvas(w, h); draw(cv.getContext('2d'), w, h); TEXC.set(key, cv); return cv; }
const postTex = (n, hl) => cached(`post|${n}|${hl ? 1 : 0}`, 500, 66, (g, w, h) => {
  g.fillStyle = hl ? SITE.blue : SITE.white; rr(g, 0, 0, w, h, 14); g.fill();
  g.fillStyle = hl ? SITE.white : SITE.blue; g.beginPath(); g.arc(36, h / 2, 20, 0, Math.PI * 2); g.fill();
  g.fillStyle = hl ? SITE.white : SITE.ink; g.font = '38px IDXB'; g.textAlign = 'left'; g.fillText('Post ' + n.toLocaleString('en-US'), 72, 46);
  g.fillStyle = hl ? '#BFD5FB' : '#C5D3EA'; rr(g, 330, 24, 140, 18, 9); g.fill();
});
const PHONE_TEX = cached('phone', 580, 1200, (g, w, h) => {
  g.fillStyle = '#05080F'; rr(g, 0, 0, w, h, 64); g.fill();
  g.fillStyle = SITE.pale; rr(g, 20, 20, w - 40, h - 40, 48); g.fill();
  g.fillStyle = SITE.ink; g.font = '54px IDXB'; g.textAlign = 'left'; g.fillText('Feed', 48, 104);
  g.fillStyle = SITE.ink; rr(g, w - 290, 58, 246, 66, 33); g.fill();
  g.fillStyle = SITE.white; g.font = '32px InterB'; g.textAlign = 'center'; g.fillText('10,000 posts', w - 167, 102);
});
const SEG_H = 8 * ROW_H;                                                  // tower segment: 8 rows, so rows match the phone's size
const towerTex = (k) => cached('tower' + k, 300, 40 * k, (g, w, h) => {    // k whole rows
  g.fillStyle = '#C5D3EA'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < k; i++) { g.fillStyle = SITE.white; rr(g, 8, i * 40 + 3, w - 16, 34, 8); g.fill(); g.fillStyle = SITE.blue; g.beginPath(); g.arc(30, i * 40 + 20, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = '#9AA9C2'; rr(g, 50, i * 40 + 14, 120, 12, 6); g.fill(); }
});

// ---- screen-space label (large, brief) anchored to a 3D point --------------------------------
function tag(ctx, cam, p, label, k, o = {}) {
  if (k <= 0) return;
  const s = project(cam, p); if (s.z < 0.2) return;
  const size = o.size || 40, w = textW(ctx, label, size, 'IDXB') + size * 1.2;
  const x = clamp(s.x + (o.dx || 0), 110 + w / 2, 890 - w / 2), y = clamp(s.y + (o.dy || 0), 600, 1480);
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(back(k), back(k));
  shadow(ctx, 0, size * 0.9, w * 0.45, 10, 0.5);
  ctx.fillStyle = o.fill || SITE.white; rr(ctx, -w / 2, -size * 0.85, w, size * 1.7, size * 0.85); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = clamp(k * 2) * S.alpha; ctx.translate(x, y); ctx.scale(back(k), back(k));
  text(ctx, label, 0, size * 0.36, { size, font: 'IDXB', color: o.color || SITE.ink }); ctx.restore();
}

// ---- the pool: 14 cards, card c shows row r ≡ c (mod 14) in [floor(S), floor(S)+13] ---------------
// u = r - S: (-1,0) flying around the side (re-stamped halfway), [0,12) on screen, [12,13] entering below
function cardState(c, Sv) {
  const base = Math.floor(Sv);
  let r = base + ((c - base) % POOL + POOL) % POOL;                        // first row ≥ base with r ≡ c
  let u = r - Sv;
  if (u >= VISIBLE + 1) { r -= POOL; u -= POOL; }                           // keep u in (-1, 13]
  return { r, u };
}
const rowPosL = (u) => [0, Y_TOP - (u + 1) * ROW_H, ZC];                  // bottom-centre of a row slot, phone-local
function transitL(f) {                                                       // f: 0 = leaving the top → 1 = entering slot 13
  const p0 = rowPosL(-1 + 1e-6), p3 = rowPosL(VISIBLE + 1 - 1e-6);
  return bez(p0, [2.4, p0[1] + 0.8, ZC + 0.9], [2.6, p3[1] - 0.2, ZC + 0.9], p3, f);
}

// ---- the world ------------------------------------------------------------------------------------
const hop = (t, t0, a = 0.25) => a * Math.sin(Math.PI * clamp((t - t0) / 0.45));
function world(ctx, t) {
  const cam = camAt(t);
  floor(ctx, cam, BENCH, { at: [0.2, 0, 0.0], radius: 9, strength: 0.22 });
  const objs = [];
  const phoneY = hop(t, T.improves, 0.2);
  objs.push({ ...PH, y: phoneY, colors: BODY, color: SITE.surface, tex: { front: PHONE_TEX }, edge: 'rgba(183,199,223,0.35)' });
  const Sv = scrollAt(t);
  const followOn = t >= SHOTS[SH.reuse] - 0.2 && t < SHOTS[SH.proof] + 0.3;
  for (let c = 0; c < POOL; c++) {
    const { r, u } = cardState(c, Sv);
    let lp, scale = 1, post = r + 1, yaw = 0;
    if (u < 0) {                                                              // in flight around the side
      const f = -u; lp = transitL(f); scale = 1 + 0.12 * Math.sin(Math.PI * f);
      yaw = 2 * Math.PI * ease(clamp((f - 0.42) / 0.16));                      // one full spin; back side faces us at f = 0.5
      if (f >= 0.5) post = r + 1 + POOL;                                      // …and it comes round showing its next post
    } else lp = rowPosL(u);
    const w = L2W(lp[0], lp[1] + phoneY / cp, lp[2]);
    const hl = followOn && c === 0;
    objs.push({ x: w[0], y: w[1], z: w[2], w: CARD_W * scale, h: CARD_H * scale, d: CARD_D, pitch: PH.pitch, yaw, color: hl ? SITE.blue : SITE.white,
      colors: { left: SITE.gray, right: SITE.gray, top: SITE.gray, back: hl ? SITE.blue : SITE.pale }, tex: { front: postTex(Math.max(1, post), hl) }, edge: 'rgba(3,6,16,0.22)', kind: 'card' });
  }
  // the plain list: a 10,000-row tower rising out of frame, later lowered away
  const tk = easeIn(ev(t, T.plain - 0.1, 1.1)) * (1 - ease(ev(t, T.android + 0.2, 0.9)));
  const th = 60 * tk;                                                       // built from short segments (true texture scale)
  for (let y0 = 0, i = 0; y0 < th - 1e-3 && i < 40; y0 += SEG_H, i++) {
    const rows = Math.max(1, Math.min(8, Math.ceil((th - y0) / ROW_H - 1e-6))), hh = rows * ROW_H;
    objs.push({ ...TOWER, y: y0, h: hh, color: '#B7C7DF', colors: { top: SITE.pale }, tex: { front: towerTex(rows) }, skip: y0 + hh < th - 1e-3 ? ['top'] : [], kind: 'tower', seg: i });
  }
  // draw: shadows, then objects far → near (cards are drawn just after the phone they sit on)
  for (const o of objs) if (o.kind !== 'card' && !(o.kind === 'tower' && o.seg > 0)) contactShadow(ctx, cam, o, 0.5, o.h > 1 ? 0.3 : 0.12);
  objs.map((o) => ({ o, z: project(cam, [o.x, o.y + (o.h || 0) / 2, o.z]).z - (o.kind === 'card' ? 0.4 : 0) }))
    .sort((a, b) => b.z - a.z).forEach(({ o }) => drawBox(ctx, cam, o));
  // ---- large, brief labels (one idea at a time) ----
  const screenMid = L2W(-1.6, Y_TOP - 6 * ROW_H, ZC), bottomIn = L2W(0, Y_TOP - 13.5 * ROW_H, ZC), side = L2W(2.6, 3.3, ZC + 0.9);
  tag(ctx, cam, screenMid, `${VISIBLE} ON SCREEN`, ev(t, T.rows3 - 0.05, 0.3) * (1 - ev(t, T.plus - 0.15, 0.15)), { fill: SITE.blue, color: SITE.white, dx: -60 });
  tag(ctx, cam, side, '+ 2 SPARES', ev(t, T.spares - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.reuse] - 0.15, 0.2)), { fill: SITE.white, dy: -40 });
  tag(ctx, cam, L2W(2.4, 5.6, ZC + 0.9), 'NOT DESTROYED', ev(t, T.destroyed - 0.05, 0.3) * (1 - ev(t, T.its - 0.2, 0.2)), { fill: SITE.white, dy: -70 });
  tag(ctx, cam, L2W(2.3, 1.0, ZC), 'REUSED', ev(t, T.reused - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.proof] - 0.15, 0.2)), { fill: SITE.blue, color: SITE.white, dy: 0 });
  tag(ctx, cam, [TOWER.x, 0, TOWER.z + 0.6], '10,000 ROWS', ev(t, T.ten5 - 0.05, 0.3) * (1 - ev(t, T.a5b - 0.2, 0.2)), { fill: SITE.white, dy: 60 });
  tag(ctx, cam, L2W(0, 0, ZC), `${POOL} ROWS`, ev(t, T.fourteen - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.android] - 0.15, 0.2)), { fill: SITE.blue, color: SITE.white, dy: 70 });
  tag(ctx, cam, L2W(0, 0, ZC), 'MORE RESPONSIVE', ev(t, T.improves - 0.05, 0.3) * (1 - ev(t, T.and6 - 0.2, 0.2)), { fill: SITE.white, dy: 70 });
  tag(ctx, cam, L2W(0, 0, ZC), 'SAVES POWER', ev(t, T.saves - 0.05, 0.3) * (1 - ev(t, SHOTS[SH.payoff] - 0.1, 0.2)), { fill: SITE.blue, color: SITE.white, dy: 70 });
  // ---- kinetic type: hook, question, payoff (never with a label paragraph) ----
  kword(ctx, '10,000 POSTS.', 540, 680, 104, t, T.ten + 0.05, { t1: T.so - 0.3 });
  kword(ctx, 'NOT 10,000 ROWS.', 540, 790, 84, t, T.not - 0.05, { color: SITE.blue, t1: T.so - 0.3 });
  kword(ctx, 'WHERE FROM?', 540, 720, 108, t, T.where - 0.05, { color: SITE.blue, t1: T.lists - 0.3 });
  kword(ctx, 'SMALL LOOP,', 540, 680, 104, t, T.small - 0.05, { t1: CTA_AT });
  kword(ctx, 'REFILLED.', 540, 790, 104, t, T.refilled - 0.05, { color: SITE.blue, t1: CTA_AT });
}

// ---- captions (2026-11-11 rule: readable inside x 100–900; house band y 340–520, centred x 500) ----
const CAPS = [
  { t0: VL('L1').t0, lines: ['Ten thousand posts.'] },
  { t0: T.not, lines: ['Not ten thousand rows.'] },
  { t0: VL('L2').t0, lines: ['So where do new posts', 'come from?'] },
  { t0: VL('L3').t0, lines: ['Lists built for this only', 'create the rows on screen,'] },
  { t0: T.plus, lines: ['plus spares.'] },
  { t0: VL('L4').t0, lines: ['A row that leaves the top', "isn't destroyed."] },
  { t0: T.its, lines: ["It's reused", 'for the next post.'] },
  { t0: VL('L5').t0, lines: ['In our test:'] },
  { t0: T.a5, lines: ['a plain list, 10,000 rows.'] },
  { t0: T.a5b, lines: ['A recycling list, 14.'] },
  { t0: VL('L6').t0, lines: ['Android says it improves', 'responsiveness'] },
  { t0: T.and6, lines: ['and saves power.'] },
  { t0: VL('L7').t0, lines: ['A long feed is just', 'a small loop of rows,'] },
  { t0: T.refilled, lines: ['refilled as you scroll.'], tEnd: VL('L8').t0 - 0.05 },
  { t0: VL('L8').t0, lines: ['Follow Tensorblue for', 'software explained simply.'], tEnd: 29.7 },
];
for (let i = 0; i < CAPS.length; i++) { CAPS[i].t0 -= 0.06; if (!CAPS[i].tEnd) CAPS[i].tEnd = CAPS[i + 1].t0; }
export const CAPTIONS = CAPS;
export const CAPTION_SIZE = 54, CAPTION_LH = 64, CAPTION_TOP = 340, CAPTION_BOTTOM = 520, CAPTION_MAXW = 760, CAPTION_CX = 500;
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
  for (const L of captionLayout(ctx, cap)) text(ctx, L.text, CAPTION_CX, L.baseline, { size: CAPTION_SIZE, font: 'InterSB', alpha: a });
}

// ---- CTA — the accepted English end card, unchanged ------------------------------------------
function cta(ctx, t) {
  const lk = back(ev(t, CTA_AT + 0.05, 0.5));
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

// ---- SFX (each tied to an on-screen action) ---------------------------------------------
export function sfxEvents() {
  const e = []; const add = (t, type, o = {}) => e.push({ t: +t.toFixed(3), type, ...o });
  add(0.35, 'slide'); add(T.not - 0.05, 'type');
  for (let i = 1; i < SHOTS.length - 1; i++) add(SHOTS[i], 'wipe');
  add(T.where - 0.05, 'type');
  // a soft clack each time a row spins round to its next post
  for (let r = 1; r < 40; r++) {
    const tc = (() => { for (let t = 0.4; t < CTA_AT; t += 1 / 60) if (scrollAt(t) >= r - 0.5) return t; return null; })();
    if (tc && ((tc > SHOTS[SH.where] && tc < SHOTS[SH.proof]) || (tc > SHOTS[SH.payoff] && tc < CTA_AT - 0.2))) add(tc, 'clack', { soft: true });   // only where the flight is the subject
  }
  add(T.rows3, 'blip'); add(T.spares, 'blip'); add(T.destroyed, 'blip'); add(T.reused, 'blip', { hi: true });
  add(T.plain, 'slide'); add(T.ten5, 'carve'); add(T.fourteen, 'blip', { hi: true }); add(T.android + 0.2, 'slide', { soft: true });
  add(T.improves, 'tap'); add(T.saves, 'blip');
  add(T.small - 0.05, 'type'); add(T.refilled - 0.05, 'type'); add(T.chime, 'chime');
  add(CTA_AT + 0.05, 'clack', { soft: true }); add(T.tb - 0.1, 'type', { soft: true }); add(T.follow - 0.05, 'tap');
  return e.sort((a, b) => a.t - b.t);
}

// ---- frame: the 3D world, then one blue wipe up into the accepted CTA -------------------------
const STAGE_TOP = 540, WIPE = 0.5;
const bg = makeBackground();
// a soft top edge for the stage while the 10,000-row tower runs out of frame (the background fades over it)
const TOP_FADE = (() => {
  const cv = createCanvas(W, 160), g = cv.getContext('2d');
  g.drawImage(bg, 0, STAGE_TOP, W, 160, 0, 0, W, 160);
  g.globalCompositeOperation = 'destination-in';
  const gr = g.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, 160); return cv;
})();
export function drawFrame(ctx, f) {
  const t = f / FPS;
  S.alpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(bg, 0, 0);
  if (process.env.ONLY_BG) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, H - STAGE_TOP); ctx.clip();
  const k = (t - (CTA_AT - WIPE / 2)) / WIPE;
  if (k < 0) { world(ctx, t); const fk = ev(t, T.plain - 0.2, 0.3) * (1 - ev(t, T.android + 1.2, 0.3)); if (fk > 0) { ctx.globalAlpha = fk; ctx.drawImage(TOP_FADE, 0, STAGE_TOP); ctx.globalAlpha = 1; } }
  else if (k >= 1) cta(ctx, t);
  else {
    const e = ease(k), band = 220, edge = lerp(H + band, STAGE_TOP - band, e);
    ctx.save(); ctx.beginPath(); ctx.rect(0, STAGE_TOP, W, Math.max(0, edge - STAGE_TOP)); ctx.clip(); world(ctx, t); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, edge + band, W, H); ctx.clip(); cta(ctx, t); ctx.restore();
    ctx.fillStyle = C.blue; ctx.fillRect(0, edge, W, band);
  }
  ctx.restore();
  if (!process.env.NO_CAPTION) drawCaption(ctx, t);
}

// ---- thumbnail: the hook as one still, 4 large words -------------------------------------------
export function drawThumbnail(ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg, 0, 0);
  const cam = camera([4.6, 4.6, 12.4], [0.9, 2.9, 0.0], 34, 540, 1300);
  floor(ctx, cam, BENCH, { at: [0.6, 0, 0.4], radius: 7, strength: 0.3 });
  const objs = [{ ...PH, colors: BODY, color: SITE.surface, tex: { front: PHONE_TEX }, edge: 'rgba(183,199,223,0.35)' }];
  const Sv = 14.45;
  for (let c = 0; c < POOL; c++) {
    const { r, u } = cardState(c, Sv); const lp = u < 0 ? transitL(-u) : rowPosL(u); const post = u < 0 && -u >= 0.5 ? r + 1 + POOL : r + 1;
    const w = L2W(...lp); const sc = u < 0 ? 1.12 : 1;
    objs.push({ x: w[0], y: w[1], z: w[2], w: CARD_W * sc, h: CARD_H * sc, d: CARD_D, pitch: PH.pitch, color: u < 0 ? SITE.blue : SITE.white, colors: { left: SITE.gray, right: SITE.gray, top: SITE.gray }, tex: { front: postTex(post, u < 0) }, kind: 'card' });
  }
  for (const o of objs) if (o.kind !== 'card') contactShadow(ctx, cam, o, 0.5, 0.3);
  objs.map((o) => ({ o, z: project(cam, [o.x, o.y + (o.h || 0) / 2, o.z]).z - (o.kind === 'card' ? 0.4 : 0) })).sort((a, b) => b.z - a.z).forEach(({ o }) => drawBox(ctx, cam, o));
  text(ctx, '10,000', 540, 430, { size: 150, font: 'IDXB' });
  text(ctx, 'POSTS.', 540, 590, { size: 150, font: 'IDXB' });
  text(ctx, '14 ROWS.', 540, 750, { size: 150, font: 'IDXB', color: SITE.blue });
  const wT = textW(ctx, 'Tensor', 48, 'IDXB'), wB = textW(ctx, 'blue', 48, 'IDXB'), x0 = 540 - (54 + 16 + wT + wB) / 2;
  ctx.drawImage(LOGO, x0, 1712, 54, 70);
  text(ctx, 'Tensor', x0 + 70, 1764, { size: 48, font: 'IDXB', align: 'left' });
  text(ctx, 'blue', x0 + 70 + wT, 1764, { size: 48, font: 'IDXB', color: C.blue, align: 'left' });
}
