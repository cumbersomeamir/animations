// "When's the Big Boom?" (Big Frog drums every 2 beats, Little Frog every 3 beats: their drums land together on 6,
// because 6 is in the twos and the threes — 2 × 3 = 6 — and again on 12) — Pop-up Counting Storybook (english-25).
// Entertainment first: two cut-paper frog drummers on a lily-pad stage in a dusk pond; a firefly hops along twelve
// numbered lily pads, one per beat; orange rings mark Big Frog's hits, cyan rings Little Frog's; BOOM on 6 and 12, and
// the second boom sinks the stage. Beat-synced cuts; sharp close-ups.
import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E, clamp, lerp, prog, rng, D2R } from './util.mjs';
import { drawFrog, drawDrum } from './frog.mjs';
import * as T from './timeline.mjs';
import { W, H } from './timeline.mjs';
import {
  C, FONT, applyGrain, cutPoly, cutCircle, roundRectPts, pathFrom, piece, withShadow, noShadow, splitPin,
  sparkle, label, measure,
} from './craft.mjs';
import { drawBaker } from './baker.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ICON = null;
export async function init() {
  ICON = await loadImage(path.join(HERE, '..', '..', '..', '..', 'assets', 'icon.png'));
}

// ------------------------------------------------------------------ layout (world px)
const CX = 500; // caption centre (captions live in x 100–900)
const CAP_Y = 372; // caption centre: the upper band y ≈ 280–460
const BOOK = { x: 30, y: 448, w: 1020, bot: 1500 }; // backdrop page
const BAR_Y = 412;
const RES = 2; // cached page texture at 2× so the close-ups stay sharp
const HZ = 900; // far bank of the pond on the page print
const STAGE = { x: 545, y: 1185, rx: 360, ry: 80 }; // the lily-pad stage (floating)
const WAVE_Y = 1250; // top of the paper wave in front of the stage
const CLIP_Y = 1264; // the sinking stage disappears below this line (hidden behind the wave)
const BIG = { x: 400, y: 1152, s: 1.0, drum: [400, 1226, 72] };
const LITTLE = { x: 700, y: 1152, s: 0.74, drum: [700, 1214, 50] };
const padXY = (k) => [120 + (k - 1) * (780 / 11), 1382 - 26 * Math.sin((Math.PI * (k - 1)) / 11)];
const TOK = [52, 94]; // hit dots below each pad: Big Frog's row (orange), Little Frog's row (cyan)
const SIGN_Y = 740;
const BAKER = { x: 250, y: 1690, s: 0.74 };

// ------------------------------------------------------------------ helpers
const TEX = {};
function texCanvas(key, w, h) {
  if (!TEX[key]) TEX[key] = createCanvas(w, h);
  const c = TEX[key];
  const x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, w, h);
  return c;
}
function pulse(f, f0, len = 18) {
  const t = f - f0;
  return t >= 0 && t < len ? Math.sin((Math.PI * t) / len) : 0;
}
/** 1 on frame f0, fading to 0 over len frames */
function decay(f, f0, len) {
  const t = f - f0;
  return t >= 0 && t < len ? 1 - t / len : 0;
}
function cardTex(key, w, h, draw, fill = C.cream, border = C.violet) {
  const c = texCanvas(key, w, h);
  const x = c.getContext('2d');
  piece(x, cutPoly(roundRectPts(3, 3, w - 6, h - 6, 26), key.length * 7, 1.1, 14), border, { grainA: 0.06 });
  piece(x, cutPoly(roundRectPts(10, 10, w - 20, h - 20, 20), key.length * 7 + 1, 0.9, 14), fill, { grainA: 0.06 });
  draw(x);
  return c;
}
function eqText(x, parts, cx, cy, size) {
  x.save();
  x.font = `700 ${size}px ${FONT}`;
  const ws = parts.map(([t]) => x.measureText(t).width);
  let px = cx - ws.reduce((a, b) => a + b, 0) / 2;
  x.textBaseline = 'middle';
  parts.forEach(([t, col], i) => { x.fillStyle = col; x.fillText(t, px, cy); px += ws[i]; });
  x.restore();
}

// ------------------------------------------------------------------ camera: one shot per beat-synced cut
function camera(f) {
  const s = T.SHOTS.find((sh) => f >= sh.from && f < sh.to) || T.SHOTS[T.SHOTS.length - 1];
  const u = E.inOutSine(prog(s.from, s.to, f));
  return { z: lerp(s.z[0], s.z[1], u), fx: lerp(s.f[0][0], s.f[1][0], u), fy: lerp(s.f[0][1], s.f[1][1], u) };
}
function applyCam(ctx, cam, factor) {
  const z = 1 + (cam.z - 1) * factor;
  const fx = 540 + (cam.fx - 540) * factor, fy = 960 + (cam.fy - 960) * factor;
  ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-fx, -fy);
}

// ------------------------------------------------------------------ states
/** every drum hit as [frame, who], who = 'big' | 'little' | 'both' */
const HITS = (() => {
  const h = [];
  for (const t of T.DEMO_BIG) h.push([t, 'big']);
  for (const t of T.DEMO_LITTLE) h.push([t, 'little']);
  for (let k = 1; k <= 12; k++) {
    const t = T.beatAt(k), b = T.bigHits(k), l = T.littleHits(k);
    if (b && l) h.push([t, 'both']); else if (b) h.push([t, 'big']); else if (l) h.push([t, 'little']);
  }
  return h;
})();
const BOOMS = HITS.filter(([, w]) => w === 'both').map(([t]) => t);
/** frames since the latest big boom (−1 when none within `len`) */
function boomAge(f, len = 24) {
  for (const t of BOOMS) if (f >= t && f < t + len) return f - t;
  return -1;
}
/** a drummer's stick: raised over the 9 frames before a hit, slammed down on the hit frame, small rebound */
function stick(f, who) {
  let k = 0, hit = 0;
  for (const [t, w] of HITS) {
    if (w !== who && w !== 'both') continue;
    if (f >= t - 9 && f < t) k = Math.max(k, E.outQuad(clamp((f - (t - 9)) / 6)));
    if (f >= t && f < t + 8) k = Math.max(k, 0.22 * Math.sin((Math.PI * (f - t)) / 8));
    hit = Math.max(hit, decay(f, t, 10));
  }
  return { k, hit };
}
function sinkDy(f) {
  if (f < T.SINK[0]) return 0;
  const down = E.inQuad(prog(T.SINK[0], T.SINK[1], f)) * 330;
  const up = E.outBack(prog(T.POPUP[0], T.POPUP[1], f));
  return down * (1 - up);
}
/** soft bob on the music's beat while the band plays */
function beatBob(f) {
  if (f < 54 || f >= T.PAGE_TURN[0]) return 0;
  return 4 * decay(f % T.BEAT, 0, 8);
}
function frogState(who, f) {
  const P = who === 'big' ? BIG : LITTLE;
  const st = stick(f, who);
  const fr = {
    x: P.x, y: P.y, s: P.s, eyes: 'open', mouth: 'smile', look: who === 'big' ? [0.8, -0.1] : [-0.8, -0.1],
    tie: who === 'big' ? C.violet : null, cap: who === 'little', stickL: st.k, stickR: st.k,
  };
  fr.hop = beatBob(f + (who === 'big' ? 0 : 2));
  if (f > 40 && (f + (who === 'big' ? 0 : 37)) % 95 < 3) fr.eyes = 'closed'; // blink
  // frame 0 (thumbnail): sticks up, ready, eyeing each other
  if (f < 40) { fr.stickL = fr.stickR = 0.92; fr.mouth = 'grin'; fr.eyes = 'wide'; fr.look = who === 'big' ? [1, -0.2] : [-1, -0.2]; }
  if (st.hit > 0.05) { fr.mouth = 'open'; fr.squashY = 1 - 0.1 * st.hit; fr.squashX = 1 + 0.07 * st.hit; fr.eyes = 'happy'; }
  // the "why" close-up: each drummer bounces as its pads light up
  for (const [, t] of who === 'big' ? T.RINGS_BIG : T.RINGS_LITTLE) { const p = pulse(f, t, 12); if (p > 0) { fr.hop += 10 * p; fr.eyes = 'happy'; fr.mouth = 'grin'; } }
  const ba = boomAge(f);
  if (ba >= 0) { fr.hop += 34 * Math.sin(Math.PI * clamp(ba / 20)); fr.eyes = 'wide'; fr.mouth = 'open'; fr.stickL = fr.stickR = Math.max(fr.stickL, ba > 3 ? 1 : 0); }
  if (f >= T.SIGN[0] && f < T.RUN2 - 12) { fr.stickL = 0.85 + 0.15 * Math.sin(f * 0.4); fr.stickR = 0.85 + 0.15 * Math.sin(f * 0.4 + 1); fr.eyes = 'happy'; fr.mouth = 'grin'; }
  if (f >= T.SINK[0] && f < T.POPUP[0]) { fr.eyes = 'wide'; fr.mouth = 'o'; fr.stickL = fr.stickR = 1; fr.look = [0, -1]; }
  if (f >= T.POPUP[0]) { fr.eyes = 'happy'; fr.mouth = 'open'; fr.stickL = fr.stickR = 1; fr.hop = 12 * Math.abs(Math.sin((f - T.POPUP[0]) * 0.35)); }
  return fr;
}
function fireflyPos(f) {
  // floats above pad 1 until the count; then lands on pad k exactly on beat k (a 9-frame hop arc before each beat)
  const idle = (t) => { const [x, y] = padXY(1); return [x + 26 * Math.sin(t * 0.07), y - 80 + 14 * Math.sin(t * 0.11)]; };
  if (f < T.beatAt(1) - 9) return idle(f);
  let k = 1;
  for (let j = 1; j <= 12; j++) if (f >= T.beatAt(j) - 9) k = j;
  const t = T.beatAt(k);
  const from = k === 1 ? idle(t - 9) : [padXY(k - 1)[0], padXY(k - 1)[1] - 30];
  const to = [padXY(k)[0], padXY(k)[1] - 30];
  const u = clamp((f - (t - 9)) / 9);
  if (u >= 1) return [to[0], to[1] - 5 * Math.abs(Math.sin(f * 0.25))];
  return [lerp(from[0], to[0], u), lerp(from[1], to[1], u) - 46 * Math.sin(Math.PI * u)];
}
function bakerState(f) {
  const st = { x: BAKER.x, y: BAKER.y, s: BAKER.s, rise: 1, lean: 0, aL: 14, fL: 10, aR: 14, fR: 10, head: 0, hop: 0, eyes: 'happy', mouth: 'smile' };
  if (f > 40 && f % 80 < 3) st.eyes = 'closed'; else if (f > 40) st.eyes = 'open';
  if (camera(f).z > 1.3) st.rise = 0; // the pop-up baker lies folded flat during the close shots
  if (boomAge(f, 30) >= 0) { st.aL = st.aR = 155; st.hop = 10; st.eyes = 'happy'; st.mouth = 'open'; }
  if (f >= 836) { const w = prog(836, 844, f); st.aR = lerp(14, 150, w); st.fR = lerp(10, 22 + 26 * Math.sin(f * 0.45), w); st.eyes = 'happy'; st.mouth = 'open'; }
  return st;
}

// ------------------------------------------------------------------ stage pieces
function drawBurst(ctx, f) {
  // the big boom: a cut-paper starburst flashing up behind the band
  const age = boomAge(f, 22);
  if (age < 0) return;
  const u = age / 22, s = E.outBack(Math.min(1, u * 2.5)) * (1 - 0.25 * u);
  const cx = 550, cy = 1010;
  ctx.save(); ctx.globalAlpha = 1 - u * u;
  const pts = [];
  for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2 + 0.1, r = (i % 2 ? 95 : 215) * s; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.85]); }
  withShadow(ctx, 6, 0.25); piece(ctx, pts, C.yellow, { margin: 5, grainA: 0.04, edge: 'rgba(248,111,3,0.8)' }); noShadow(ctx);
  piece(ctx, cutCircle(cx, cy, 70 * s, 60 * s, 9750, 0.6, 28), C.orange, { grainA: 0.03 });
  ctx.restore();
}
function drawSplash(ctx, f) {
  for (const t of BOOMS) {
    const u = prog(t, t + 24, f);
    if (u <= 0 || u >= 1) continue;
    const r = rng(t);
    ctx.save(); ctx.globalAlpha = 1 - u * u;
    for (let i = 0; i < 18; i++) {
      const sx = STAGE.x + (r() - 0.5) * 620, a = -Math.PI * (0.25 + 0.5 * r()), sp = 140 + 200 * r();
      const x = sx + Math.cos(a) * sp * u * 0.6, y = WAVE_Y - 10 + Math.sin(a) * sp * u * 1.4 + 420 * u * u;
      ctx.fillStyle = i % 3 ? 'rgba(190,240,255,0.95)' : '#FFFFFF';
      ctx.beginPath(); ctx.ellipse(x, y, 7, 11, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
function drawStageGroup(ctx, f) {
  const dy = sinkDy(f);
  const ba = boomAge(f);
  const bob = 3 * Math.sin(f * 0.12) + (ba >= 0 ? 10 * Math.sin((Math.PI * ba) / 12) * (1 - ba / 24) : 0);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, CLIP_Y); ctx.clip();
  ctx.translate(0, dy + bob);
  drawBurst(ctx, f);
  // the lily-pad stage: a big pad with its notch, veins and a lotus flower
  ctx.save(); withShadow(ctx, 10, 0.3);
  const NA = -Math.PI * 0.8; // the pad's notch, back-left
  ctx.beginPath(); ctx.ellipse(STAGE.x, STAGE.y, STAGE.rx, STAGE.ry, 0, NA + 0.13, NA + Math.PI * 2 - 0.13); ctx.lineTo(STAGE.x, STAGE.y); ctx.closePath();
  const g = ctx.createRadialGradient(STAGE.x - 60, STAGE.y - 30, 20, STAGE.x, STAGE.y, STAGE.rx);
  g.addColorStop(0, '#8BE3A8'); g.addColorStop(1, '#2E9A63');
  ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#FFFDF8'; ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = 'rgba(30,110,70,0.45)'; ctx.lineWidth = 3;
  for (let k = 0; k < 9; k++) { const a = NA + 0.5 + (k * (Math.PI * 2 - 1)) / 8; ctx.beginPath(); ctx.moveTo(STAGE.x, STAGE.y); ctx.lineTo(STAGE.x + Math.cos(a) * STAGE.rx * 0.88, STAGE.y + Math.sin(a) * STAGE.ry * 0.88); ctx.stroke(); }
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; piece(ctx, cutCircle(845 + Math.cos(a) * 20, 1196 + Math.sin(a) * 9, 17, 10, 9700 + k, 0.4, 14), k % 2 ? '#FF9EC0' : '#FFC4DA', { margin: 1.5, grainA: 0 }); }
  piece(ctx, cutCircle(845, 1196, 10, 8, 9706, 0.3, 12), C.yellow, { grainA: 0 });
  // frogs behind their drums
  const big = frogState('big', f), little = frogState('little', f);
  drawFrog(ctx, little); drawFrog(ctx, big);
  const hb = stick(f, 'big').hit, hl = stick(f, 'little').hit;
  drawDrum(ctx, BIG.drum[0], BIG.drum[1], BIG.drum[2], C.orange, hb);
  drawDrum(ctx, LITTLE.drum[0], LITTLE.drum[1], LITTLE.drum[2], C.cyan, hl);
  // sound arcs off each drum on a hit
  for (const [h, P, col] of [[hb, BIG, C.orange], [hl, LITTLE, C.cyan]]) {
    if (h < 0.05) continue;
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.globalAlpha = h * (1 - i * 0.28); ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.lineCap = 'round';
      const R = P.drum[2] * (1.35 + 0.45 * i + 0.6 * (1 - h));
      for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(P.drum[0], P.drum[1] - P.drum[2], R, side < 0 ? Math.PI * 1.05 : Math.PI * 1.7, side < 0 ? Math.PI * 1.3 : Math.PI * 1.95); ctx.stroke(); }
      ctx.restore();
    }
  }
  ctx.restore();
}
function drawWave(ctx, f) {
  // a paper wave strip in front of the stage (the pond surface the stage sinks behind)
  const pts = [];
  for (let x = BOOK.x; x <= BOOK.x + BOOK.w; x += 12) pts.push([x, WAVE_Y + 7 * Math.sin(x * 0.045 + f * 0.09) + 3 * Math.sin(x * 0.11 - f * 0.05)]);
  pts.push([BOOK.x + BOOK.w, WAVE_Y + 58], [BOOK.x, WAVE_Y + 58]);
  ctx.save(); withShadow(ctx, 6, 0.22);
  const g = ctx.createLinearGradient(0, WAVE_Y - 10, 0, WAVE_Y + 58);
  g.addColorStop(0, '#9AD8F4'); g.addColorStop(1, 'rgba(110,182,230,0)');
  piece(ctx, pts, g, { margin: 0, grainA: 0.03, edge: 'rgba(255,253,248,0.95)' });
  ctx.restore();
  // ripples / bubbles while the stage is under
  const dy = sinkDy(f);
  if (dy > 30) {
    const r = rng(Math.floor(f / 2));
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3;
    for (let i = 0; i < 12; i++) { const x = STAGE.x + (r() - 0.5) * 560, y = WAVE_Y - 6 - r() * 40, rr = 5 + r() * 10; ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.stroke(); }
  }
}
function drawTrack(ctx, f) {
  // twelve numbered lily pads = the beats. Below each pad, a dot pops up when a frog drums on that beat: orange row =
  // Big Frog (2, 4, 6, …), cyan row = Little Frog (3, 6, …). Where both rows have a dot, the drums land together.
  for (let k = 1; k <= 12; k++) {
    const [x, y0] = padXY(k);
    const tb = T.beatAt(k), lit = f >= tb, land = decay(f, tb, 12);
    const y = y0 + 5 * land;
    const big = T.bigHits(k), little = T.littleHits(k);
    const both6 = k === 6 ? pulse(f, T.BOTH_PULSE[0], 20) + pulse(f, T.BOTH_PULSE[1], 20) : 0;
    // "together" column glow behind a pad where both frogs drum
    if (big && little && lit) {
      const a = Math.min(1, prog(tb, tb + 6, f)) * (0.75 + 0.25 * Math.sin(f * 0.2)) ;
      ctx.save(); ctx.globalAlpha = a; withShadow(ctx, 4, 0.2);
      piece(ctx, cutPoly(roundRectPts(x - 37 - 4 * both6, y - 34 - 4 * both6, 74 + 8 * both6, TOK[1] + 60 + 8 * both6, 30), 9800 + k, 0.6, 10), 'rgba(249,227,14,0.9)', { margin: 2, grainA: 0.02 });
      ctx.restore();
    }
    ctx.save(); withShadow(ctx, 5, 0.25);
    ctx.beginPath(); ctx.ellipse(x, y, 34, 22, 0, -Math.PI / 2 + 0.22, Math.PI * 1.5 - 0.22); ctx.lineTo(x, y); ctx.closePath();
    ctx.fillStyle = lit ? '#8BE6AC' : '#4FB57E'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#FFFDF8'; ctx.stroke();
    ctx.restore();
    label(ctx, String(k), x, y + 2, 34, { fill: C.deep });
    // hit dots
    const rp = (list) => { const e = list.find(([kk]) => kk === k); return e ? pulse(f, e[1], 14) : 0; };
    for (const [on, dy, col, list] of [[big, TOK[0], C.orange, T.RINGS_BIG], [little, TOK[1], C.cyan, T.RINGS_LITTLE]]) {
      if (on && lit) {
        const sc = E.outBack(prog(tb, tb + 8, f)) * (1 + 0.45 * (rp(list) + both6));
        if (sc > 0.01) { ctx.save(); ctx.translate(x, y0 + dy); ctx.scale(sc, sc); withShadow(ctx, 4, 0.25); piece(ctx, cutCircle(0, 0, 20, 20, 9820 + k + dy, 0.5, 22), col, { margin: 3, grainA: 0.04 }); ctx.restore(); }
      } else if (on && k === 12 && f >= T.VO.v07 + 6) {
        // prediction: "they boom again on 12" — dashed dots wait under pad 12 before it is played
        ctx.save(); ctx.globalAlpha = 0.55 + 0.45 * Math.sin(f * 0.3) ** 2; ctx.setLineDash([7, 6]); ctx.lineWidth = 4; ctx.strokeStyle = col;
        ctx.beginPath(); ctx.arc(x, y0 + dy, 20, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
    }
    if (big && little && lit) sparkle(ctx, x + 40, y - 34, 14 + 12 * land + 8 * both6, C.yellow);
  }
  // the firefly (beat marker)
  const [fx, fy] = fireflyPos(f);
  const gl = ctx.createRadialGradient(fx, fy, 2, fx, fy, 44);
  gl.addColorStop(0, 'rgba(255,245,150,0.95)'); gl.addColorStop(1, 'rgba(255,245,150,0)');
  ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(fx, fy, 44, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,253,248,0.9)';
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(fx + sx * 10, fy - 9, 10, 5.5, sx * (0.6 + 0.45 * Math.sin(f * 1.7)), 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(fx, fy + 2, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(fx, fy - 8, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(fx + 2, fy - 9, 1.8, 0, Math.PI * 2); ctx.fill();
}
function drawSign(ctx, f) {
  if (f < T.SIGN[0]) return;
  const u = E.outBack(prog(T.SIGN[0], T.SIGN[1], f));
  const theta = (Math.PI / 2) * (1 - u);
  const tex = cardTex('sign', 360, 110, (x) => eqText(x, [['2 × 3 = ', C.ink], ['6', C.purple]], 180, 58, 74), '#FFF6C9');
  ctx.strokeStyle = 'rgba(42,22,80,0.55)'; ctx.lineWidth = 3;
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(STAGE.x + sx * 140, BOOK.y + 6); ctx.lineTo(STAGE.x + sx * 140, SIGN_Y + 4); ctx.stroke(); }
  if (Math.cos(theta) > 0.03) drawPlane(ctx, tex, { x: STAGE.x - 180, w: 360, hingeY: SIGN_Y, h: 110, theta, dir: 1, F: 1600, shadow: 0.8, warm: 0.3 * pulse(f, T.SIGN[1], 20) });
  for (const sx of [-1, 1]) splitPin(ctx, STAGE.x + sx * 140, SIGN_Y + 4, 5);
}
function drawStage(ctx, f) {
  drawStageGroup(ctx, f);
  drawWave(ctx, f);
  drawSplash(ctx, f);
  drawTrack(ctx, f);
  drawSign(ctx, f);
}

// ------------------------------------------------------------------ perspective hinge renderer
/**
 * Draw `tex` as a rigid card hinged on a horizontal line at hingeY.
 * dir +1: card hangs below the hinge; dir -1: card stands above it. theta: rotation toward the viewer (rad).
 * Pinhole projection about (x + w/2, hingeY) with focal length F. Returns the far edge {y, k}.
 */
function drawPlane(ctx, tex, o) {
  const { x, w, hingeY, h, theta, dir = 1, F = 1500, n = 64, shade = 0, warm = 0, shadow = 0, sx = 0, sy = 0 } = o;
  const sw = o.sw ?? tex.width, sh = o.sh ?? tex.height;
  const cx = x + w / 2;
  const c = Math.cos(theta), s = Math.sin(theta);
  const proj = (d) => { const k = F / (F - d * s); return [hingeY + dir * d * c * k, k]; };
  const far = proj(h);
  if (Math.abs(far[0] - hingeY) < 0.5 && Math.abs(c) < 0.02) return { y: far[0], k: far[1] };
  const quad = [[cx - w / 2, hingeY], [cx + w / 2, hingeY], [cx + (w * far[1]) / 2, far[0]], [cx - (w * far[1]) / 2, far[0]]];
  if (shadow > 0) {
    ctx.save();
    ctx.filter = `blur(${Math.round(10 + shadow * 10)}px)`;
    ctx.fillStyle = `rgba(40,16,60,${0.32 * shadow})`;
    ctx.beginPath();
    quad.forEach((p, i) => (i ? ctx.lineTo(p[0] + 10 * shadow, p[1] + 18 * shadow) : ctx.moveTo(p[0] + 10 * shadow, p[1] + 18 * shadow)));
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  let prev = proj(0);
  for (let i = 0; i < n; i++) {
    const p1 = proj((h * (i + 1)) / n);
    const km = (prev[1] + p1[1]) / 2;
    const ww = w * km;
    const srcH = sh / n;
    const srcY = dir > 0 ? sy + srcH * i : sy + sh - srcH * (i + 1);
    const top = Math.min(prev[0], p1[0]);
    const hh = Math.abs(p1[0] - prev[0]);
    if (hh > 0.05) ctx.drawImage(tex, sx, srcY, sw, srcH, cx - ww / 2, top - 0.3, ww, hh + 0.8);
    prev = p1;
  }
  if (shade > 0 || warm > 0) {
    ctx.save();
    ctx.beginPath(); quad.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.closePath();
    ctx.clip();
    if (shade > 0) { ctx.fillStyle = `rgba(30,12,50,${shade})`; ctx.fillRect(0, Math.min(hingeY, far[0]) - 5, W, Math.abs(far[0] - hingeY) + 10); }
    if (warm > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,214,120,${warm})`; ctx.fillRect(0, Math.min(hingeY, far[0]) - 5, W, Math.abs(far[0] - hingeY) + 10); }
    ctx.restore();
  }
  return { y: far[0], k: far[1] };
}

// ------------------------------------------------------------------ cached layers
let BG = null;
function background() {
  // blurred bakery interior behind the book (depth of field); oversize for parallax
  if (BG) return BG;
  const bw = 1300, bh = 2140;
  const c = createCanvas(bw, bh), x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, bh);
  g.addColorStop(0, '#F7E3EE'); g.addColorStop(0.5, '#EED7F2'); g.addColorStop(1, '#D9B98F');
  x.fillStyle = g; x.fillRect(0, 0, bw, bh);
  const r = rng(13);
  x.filter = 'blur(14px)';
  // window light
  x.fillStyle = 'rgba(255,250,235,0.9)'; x.fillRect(820, 260, 360, 520);
  x.fillStyle = 'rgba(200,170,230,0.7)'; x.fillRect(990, 260, 18, 520); x.fillRect(820, 510, 360, 16);
  // shelves with bread loaves, jars, rolling pins (no cookies: counted objects stay in the boxes only)
  for (const sy of [700, 1080]) {
    x.fillStyle = '#B98A56'; x.fillRect(0, sy, 760, 26);
    for (let k = 0; k < 6; k++) {
      const px = 40 + k * 120 + r() * 30;
      if (k % 3 === 0) { x.fillStyle = '#D79A55'; x.beginPath(); x.ellipse(px, sy - 34, 52, 34, 0, Math.PI, 0); x.fill(); }
      else if (k % 3 === 1) { x.fillStyle = 'rgba(185,150,240,0.85)'; x.fillRect(px - 26, sy - 90, 52, 90); x.fillStyle = '#7E5BD8'; x.fillRect(px - 28, sy - 100, 56, 16); }
      else { x.fillStyle = '#E8C08A'; x.fillRect(px - 60, sy - 26, 120, 22); }
    }
  }
  // warm string-light bokeh
  for (let k = 0; k < 16; k++) {
    const px = 40 + k * 80 + r() * 20, py = 120 + Math.sin(k * 0.8) * 40 + r() * 30;
    const rg = x.createRadialGradient(px, py, 0, px, py, 46);
    rg.addColorStop(0, 'rgba(255,214,140,0.95)'); rg.addColorStop(1, 'rgba(255,214,140,0)');
    x.fillStyle = rg; x.beginPath(); x.arc(px, py, 46, 0, Math.PI * 2); x.fill();
  }
  x.filter = 'none';
  // tabletop
  const t = x.createLinearGradient(0, 1540, 0, bh);
  t.addColorStop(0, '#E9C79A'); t.addColorStop(1, '#D3A673');
  x.fillStyle = t; x.fillRect(0, 1560, bw, bh - 1560);
  applyGrain(x, 0, 0, bw, bh, 0.05);
  BG = c;
  return c;
}

let BOOKART = null;
function bookArt() {
  // backdrop page print + page stack; floor page with perspective checker (static)
  if (BOOKART) return BOOKART;
  const c = createCanvas(W, H), x = c.getContext('2d');
  // page stack + violet boards
  x.save(); withShadow(x, 24, 0.3);
  x.fillStyle = C.violet; x.fillRect(BOOK.x - 14, BAR_Y + 10, BOOK.w + 28, BOOK.bot - BAR_Y);
  x.restore();
  for (let k = 3; k >= 1; k--) { x.fillStyle = k % 2 ? '#EFE3CF' : '#FFF8EC'; x.fillRect(BOOK.x - 3 * k, BOOK.y + 2, BOOK.w + 6 * k, BOOK.bot - BOOK.y + k); }
  // floor page (perspective)
  const fq = [[BOOK.x, BOOK.bot], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x + BOOK.w + 90, H + 40], [BOOK.x - 90, H + 40]];
  x.save(); withShadow(x, 18, 0.25);
  pathFrom(x, fq.map((p, i) => [p[0] + (i < 2 ? 0 : (i === 2 ? 12 : -12)), p[1]])); x.fillStyle = C.violet; x.fill();
  x.restore();
  pathFrom(x, fq); x.fillStyle = C.cream; x.fill();
  x.save(); pathFrom(x, fq); x.clip();
  const vx = CX, vy = BOOK.bot - 1500;
  const rows = [];
  for (let k = 0; k <= 6; k++) rows.push(BOOK.bot + (H + 40 - BOOK.bot) * Math.pow(k / 6, 1.3));
  for (let k = 0; k < 6; k++) for (let q = -10; q < 10; q++) {
    if ((q + k) % 2 === 0) continue;
    const pts = [[q, rows[k]], [q + 1, rows[k]], [q + 1, rows[k + 1]], [q, rows[k + 1]]].map(([qq, yy]) => {
      const xb = CX + qq * 130; const u = (yy - vy) / (H + 40 - vy); return [vx + (xb - vx) * u, yy];
    });
    pathFrom(x, pts); x.fillStyle = 'rgba(209,152,250,0.26)'; x.fill();
  }
  const gg = x.createLinearGradient(0, BOOK.bot, 0, BOOK.bot + 60);
  gg.addColorStop(0, 'rgba(60,30,80,0.35)'); gg.addColorStop(1, 'rgba(60,30,80,0)');
  x.fillStyle = gg; x.fillRect(0, BOOK.bot, W, 60);
  applyGrain(x, 0, BOOK.bot, W, H - BOOK.bot, 0.08);
  x.restore();
  BOOKART = c;
  return c;
}

let PAGEPRINT = null;
function pagePrint() {
  // the upright backdrop page: a frog pond at dusk — violet-to-peach sky, a paper moon and the first stars, the far
  // bank with reeds, calm blue water with ripple lines and the moon's reflection, cattails at the edges (2× texture)
  if (PAGEPRINT) return PAGEPRINT;
  const c = createCanvas(W * RES, (BOOK.bot + 4) * RES), x = c.getContext('2d'); x.scale(RES, RES);
  const pts = cutPoly([[BOOK.x, BOOK.y], [BOOK.x + BOOK.w, BOOK.y], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x, BOOK.bot]], 900, 0.8, 18);
  x.save(); pathFrom(x, pts); x.clip();
  const g = x.createLinearGradient(0, BOOK.y, 0, HZ);
  g.addColorStop(0, '#8C6FE6'); g.addColorStop(0.55, '#CDA6F2'); g.addColorStop(1, '#FFCCAA');
  x.fillStyle = g; x.fillRect(BOOK.x, BOOK.y, BOOK.w, HZ - BOOK.y + 10);
  const r = rng(95);
  for (let k = 0; k < 22; k++) sparkle(x, BOOK.x + 20 + r() * (BOOK.w - 40), BOOK.y + 20 + r() * 240, 3 + r() * 6, 'rgba(255,253,230,0.85)');
  // paper moon
  x.save(); withShadow(x, 8, 0.2); piece(x, cutCircle(870, 600, 58, 58, 9951, 1.0, 40), '#FFF1B8', { margin: 3, grainA: 0.05 }); x.restore();
  for (const [mx, my, mr] of [[852, 585, 9], [885, 620, 7], [878, 578, 5]]) { x.fillStyle = 'rgba(230,200,120,0.45)'; x.beginPath(); x.arc(mx, my, mr, 0, Math.PI * 2); x.fill(); }
  // water
  const wg = x.createLinearGradient(0, HZ, 0, BOOK.bot);
  wg.addColorStop(0, '#8FCDEE'); wg.addColorStop(0.45, '#5EA6DE'); wg.addColorStop(1, '#3C78C2');
  x.fillStyle = wg; x.fillRect(BOOK.x, HZ, BOOK.w, BOOK.bot - HZ);
  // the moon's reflection
  for (let k = 0; k < 9; k++) { const yy = HZ + 18 + k * 22, w = 70 - k * 5; x.fillStyle = `rgba(255,241,184,${0.55 - k * 0.05})`; x.beginPath(); x.roundRect(870 - w / 2 + (k % 2 ? 8 : -6), yy, w, 7, 4); x.fill(); }
  // ripple lines
  x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 3; x.lineCap = 'round';
  for (let k = 0; k < 26; k++) { const yy = HZ + 30 + r() * (BOOK.bot - HZ - 50), xx = BOOK.x + 40 + r() * (BOOK.w - 80), w = 30 + r() * 60; x.beginPath(); x.moveTo(xx - w / 2, yy); x.quadraticCurveTo(xx, yy - 6, xx + w / 2, yy); x.stroke(); }
  // far bank: a soft violet hill line with reed silhouettes
  x.fillStyle = '#7A5CC8';
  x.beginPath(); x.moveTo(BOOK.x, HZ + 8);
  for (let xx = BOOK.x; xx <= BOOK.x + BOOK.w; xx += 20) x.lineTo(xx, HZ - 18 - 14 * Math.sin(xx * 0.013) - 8 * Math.sin(xx * 0.041));
  x.lineTo(BOOK.x + BOOK.w, HZ + 8); x.closePath(); x.fill();
  x.strokeStyle = '#6A4CB8'; x.lineWidth = 5;
  for (let k = 0; k < 40; k++) { const xx = BOOK.x + 10 + r() * (BOOK.w - 20), hh = 30 + r() * 50; x.beginPath(); x.moveTo(xx, HZ); x.quadraticCurveTo(xx + 6, HZ - hh / 2, xx + (r() - 0.5) * 16, HZ - hh); x.stroke(); }
  x.fillStyle = 'rgba(255,255,255,0.22)'; x.fillRect(BOOK.x, HZ + 6, BOOK.w, 4);
  // cattails at the page edges
  const cattail = (bx, by, hh, lean, seed) => {
    x.strokeStyle = '#2E9A63'; x.lineWidth = 7; x.beginPath(); x.moveTo(bx, by); x.quadraticCurveTo(bx + lean * 0.3, by - hh * 0.6, bx + lean, by - hh); x.stroke();
    x.save(); x.translate(bx + lean * 0.92, by - hh * 0.9); x.rotate(Math.atan2(lean, hh));
    piece(x, cutPoly(roundRectPts(-12, -40, 24, 80, 12), seed, 0.5, 8), '#8A5A24', { margin: 2, grainA: 0.08 });
    x.restore();
  };
  for (const [bx, hh, lean, s] of [[52, 520, -10, 1], [80, 430, 14, 2], [104, 330, 4, 3], [1000, 500, 12, 4], [1024, 400, -14, 5], [978, 300, -4, 6]]) cattail(bx, BOOK.bot, hh, lean, 9900 + s);
  x.strokeStyle = '#3FAE72'; x.lineWidth = 9; x.lineCap = 'round';
  for (const [bx, hh, lean] of [[40, 380, 30], [70, 300, -24], [1012, 360, -30], [1040, 280, 22]]) { x.beginPath(); x.moveTo(bx, BOOK.bot); x.quadraticCurveTo(bx + lean * 0.2, BOOK.bot - hh * 0.6, bx + lean, BOOK.bot - hh); x.stroke(); }
  applyGrain(x, BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y, 0.06);
  x.restore();
  PAGEPRINT = c;
  return c;
}

let CTAPAGE = null;
function ctaPageArt() {
  if (CTAPAGE) return CTAPAGE;
  const c = createCanvas(W, BOOK.bot + 4), x = c.getContext('2d');
  const pts = cutPoly([[BOOK.x, BOOK.y], [BOOK.x + BOOK.w, BOOK.y], [BOOK.x + BOOK.w, BOOK.bot], [BOOK.x, BOOK.bot]], 901, 0.8, 18);
  x.save(); pathFrom(x, pts); x.clip();
  const g = x.createLinearGradient(0, BOOK.y, 0, BOOK.bot);
  g.addColorStop(0, '#24107E'); g.addColorStop(1, C.deep);
  x.fillStyle = g; x.fillRect(BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y);
  const r = rng(41);
  for (let k = 0; k < 70; k++) sparkle(x, BOOK.x + r() * BOOK.w, BOOK.y + r() * (BOOK.bot - BOOK.y), 4 + r() * 9, k % 4 ? 'rgba(209,152,250,0.45)' : 'rgba(249,227,14,0.7)');
  applyGrain(x, BOOK.x, BOOK.y, BOOK.w, BOOK.bot - BOOK.y, 0.06);
  x.restore();
  CTAPAGE = c;
  return c;
}



// ------------------------------------------------------------------ frame-0 headline (hook words, folds away)
function drawHeadline(ctx, f) {
  if (f >= T.HEADLINE_OUT[1]) return;
  const th = (Math.PI / 2) * E.inCubic(prog(T.HEADLINE_OUT[0], T.HEADLINE_OUT[1], f));
  const tex = texCanvas('headline', 820, 196);
  const x = tex.getContext('2d');
  piece(x, cutPoly(roundRectPts(6, 6, 808, 184, 32), 1501, 1.4, 16), '#FFFDF8', { margin: 0, grainA: 0.05, edge: 'rgba(57,12,214,0.45)' });
  x.fillStyle = C.violet; x.fillRect(26, 20, 8, 156);
  const line = (t, y, col) => { x.save(); x.font = `700 84px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 8; x.strokeStyle = '#FFFFFF'; x.strokeText(t, 420, y); x.fillStyle = col; x.fillText(t, 420, y); x.restore(); };
  line("WHEN'S THE", 58, C.deep);
  line('BIG BOOM?', 140, C.purple);
  drawPlane(ctx, tex, { x: CX - 410, w: 820, hingeY: 278, h: 196, theta: th, dir: 1, F: 2200, shadow: 0.8, shade: 0.3 * Math.sin(th) });
}

function drawLamp(ctx, f) {
  // hanging paper lamp, top-right (beside the window): motivates the warm key light
  const lx = 990, sw = Math.sin(f * 0.05) * 0.04;
  ctx.save(); ctx.translate(lx, BAR_Y + 38); ctx.rotate(sw);
  ctx.strokeStyle = 'rgba(42,22,80,0.6)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 64); ctx.stroke();
  const g = ctx.createRadialGradient(0, 120, 4, 0, 120, 120);
  g.addColorStop(0, 'rgba(255,224,140,0.55)'); g.addColorStop(1, 'rgba(255,224,140,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 120, 120, 0, Math.PI * 2); ctx.fill();
  withShadow(ctx, 6, 0.25);
  piece(ctx, cutPoly([[-46, 112], [46, 112], [26, 64], [-26, 64]], 1201, 0.8, 8), C.orange, { margin: 2.5, grainA: 0.06 });
  noShadow(ctx);
  ctx.fillStyle = 'rgba(255,240,180,0.95)'; ctx.beginPath(); ctx.arc(0, 118, 11, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

let FLOORPROPS = null;
function floorProps() {
  // pop-up rolling pin + flour sack on the floor page, bottom-right (decor, not counted objects)
  if (FLOORPROPS) return FLOORPROPS;
  const c = createCanvas(W, H), x = c.getContext('2d');
  x.save(); withShadow(x, 10, 0.3);
  piece(x, cutPoly([[790, 1720], [930, 1720], [950, 1590], [900, 1560], [820, 1560], [770, 1590]], 1301, 1.4, 12), '#F3E3C3', { margin: 3, grainA: 0.12 });
  x.restore();
  x.fillStyle = C.violet; x.fillRect(776, 1626, 168, 26);
  x.fillStyle = 'rgba(255,255,255,0.8)'; for (const [px, py] of [[835, 1580], [870, 1574], [852, 1592]]) { x.beginPath(); x.arc(px, py, 9, 0, Math.PI * 2); x.fill(); }
  x.save(); withShadow(x, 8, 0.3); x.translate(640, 1760); x.rotate(-0.12);
  piece(x, cutPoly(roundRectPts(-120, -20, 240, 40, 20), 1302, 0.8, 12), '#E7C38E', { margin: 2.5, grainA: 0.12 });
  piece(x, cutPoly(roundRectPts(-170, -10, 52, 20, 10), 1303, 0.5, 8), C.purple, { margin: 2, grainA: 0.05 });
  piece(x, cutPoly(roundRectPts(118, -10, 52, 20, 10), 1304, 0.5, 8), C.purple, { margin: 2, grainA: 0.05 });
  x.restore();
  FLOORPROPS = c;
  return c;
}

function drawCTA(ctx, f) {
  ctx.drawImage(ctaPageArt(), 0, 0);
  const s = E.outBack(prog(T.CTA_POP, T.CTA_POP + 14, f));
  const cx = CX, cy = 840, sz = 330;
  if (s > 0.01) {
    // icon card on a V-fold: rises from the page on its base hinge
    const tex = texCanvas('icon', sz + 24, sz + 24);
    const x = tex.getContext('2d');
    piece(x, cutPoly(roundRectPts(2, 2, sz + 20, sz + 20, 78), 12, 1, 14), '#FFFFFF', { grainA: 0.03 });
    x.save(); pathFrom(x, roundRectPts(12, 12, sz, sz, 70)); x.clip(); x.drawImage(ICON, 12, 12, sz, sz); x.restore();
    drawPlane(ctx, tex, { x: cx - (sz + 24) / 2, w: sz + 24, hingeY: cy + sz / 2 + 12, h: sz + 24, theta: -(Math.PI / 2) * (1 - s), dir: -1, shadow: 0.9 });
  }
  const word = 'TableVerse', size = 122;
  ctx.save(); ctx.font = `700 ${size}px ${FONT}`;
  const ws = [...word].map((ch) => ctx.measureText(ch).width);
  ctx.restore();
  let px = cx - ws.reduce((a, b) => a + b, 0) / 2;
  [...word].forEach((ch, i) => {
    const t = f - (T.CTA_POP + 8 + i * 2);
    const sc = t < 0 ? 0 : E.outBack(clamp(t / 8));
    if (sc > 0) {
      ctx.save(); ctx.translate(px + ws[i] / 2, 1130); ctx.scale(sc, sc);
      ctx.font = `700 ${size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = '#FFFDF8'; ctx.strokeText(ch, 0, 0);
      const g = ctx.createLinearGradient(0, -size / 2, 0, size / 2); g.addColorStop(0, C.yellow); g.addColorStop(1, C.orange);
      ctx.fillStyle = g; ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
    px += ws[i];
  });
  const ps = E.outBack(prog(T.CTA_POP + 26, T.CTA_POP + 36, f));
  if (ps > 0.01) {
    ctx.save(); ctx.translate(cx, 1255); ctx.scale(ps, ps);
    withShadow(ctx, 8, 0.4, '5,0,30');
    piece(ctx, cutPoly(roundRectPts(-210, -38, 420, 76, 38), 13, 0.9, 12), C.cream, { margin: 3, grainA: 0.05 });
    noShadow(ctx); label(ctx, 'on Google Play', 0, 2, 48, { fill: C.deep });
    ctx.restore();
  }
}

function drawHingeBar(ctx) {
  ctx.save(); withShadow(ctx, 8, 0.3);
  piece(ctx, cutPoly(roundRectPts(BOOK.x - 20, BAR_Y, BOOK.w + 40, 40, 14), 500, 1, 16), C.violet, { grainA: 0.1 });
  ctx.restore();
  for (let k = 0; k < 8; k++) {
    const rx = BOOK.x + 70 + k * ((BOOK.w - 140) / 7);
    ctx.lineWidth = 7; ctx.strokeStyle = C.brassDk; ctx.beginPath(); ctx.ellipse(rx, BAR_Y + 34, 9, 20, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = '#F2CB61'; ctx.stroke();
  }
}

function drawCaptions(ctx, f) {
  for (let ci = 0; ci < T.CAPTIONS.length; ci++) {
    const [lines, a, b] = T.CAPTIONS[ci];
    if (f < a || f >= b) continue;
    // a caption that continues the previous one (same first line, back-to-back) updates without re-popping
    const prev = T.CAPTIONS[ci - 1], next = T.CAPTIONS[ci + 1];
    const count = (l) => /^1(!|,)/.test(l[0]); // the growing count captions '1!' … '1, 2, 3, 4, 5, 6!'
    const contIn = prev && prev[2] === a && (lines[0].startsWith(prev[0][0]) || (count(lines) && count(prev[0])));
    const contOut = next && next[1] === b && (next[0][0].startsWith(lines[0]) || (count(lines) && count(next[0])));
    const pin = contIn ? 1 : E.outBack(clamp((f - a) / 7));
    const aIn = contIn ? 1 : clamp((f - a) / 4), aOut = contOut || b >= T.FRAMES ? 1 : 1 - clamp((f - (b - 5)) / 5);
    const size = 54, lh = 64;
    const wmax = Math.max(...lines.map((l) => measure(ctx, l, size)));
    const bw = Math.min(800, wmax + 64), bh = lines.length * lh + 28;
    ctx.save();
    ctx.globalAlpha *= aIn * aOut;
    ctx.translate(CX, CAP_Y);
    ctx.scale(0.93 + 0.07 * pin, 0.93 + 0.07 * pin);
    withShadow(ctx, 8, 0.25);
    piece(ctx, cutPoly(roundRectPts(-bw / 2, -bh / 2, bw, bh, 22), 700 + ci, 1.1, 16), '#FFFDF8', { grainA: 0.05, edge: 'rgba(57,12,214,0.35)' });
    noShadow(ctx);
    ctx.fillStyle = C.violet; ctx.fillRect(-bw / 2 + 16, -bh / 2 + 8, 6, bh - 16);
    lines.forEach((ln, k) => label(ctx, ln, 6, (k - (lines.length - 1) / 2) * lh + 3, size, { fill: C.ink }));
    ctx.restore();
  }
}

function drawBunting(ctx, f) {
  const cols = [C.violet, C.cream, C.purple, C.lilac, C.orange, C.cream, C.violet, C.yellow, C.purple, C.lilac, C.cream];
  const sway = Math.sin(f * 0.05) * 5;
  const yAt = (x) => 70 + 60 * (1 - Math.pow((x - 540) / 600, 2)) + sway * Math.sin((x / 1080) * Math.PI);
  ctx.strokeStyle = 'rgba(42,22,80,0.4)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); for (let x = -20; x <= 1100; x += 20) (x === -20 ? ctx.moveTo(x, yAt(x)) : ctx.lineTo(x, yAt(x))); ctx.stroke();
  for (let k = 0; k < 11; k++) {
    const x0 = 20 + k * 96, x1 = x0 + 70, y0 = yAt(x0), y1 = yAt(x1);
    ctx.save(); withShadow(ctx, 5, 0.18);
    piece(ctx, cutPoly([[x0, y0], [x1, y1], [(x0 + x1) / 2 + Math.sin(f * 0.08 + k) * 4, (y0 + y1) / 2 + 64]], 600 + k, 0.8, 9), cols[k], { margin: 2, grainA: 0.06 });
    ctx.restore();
  }
}

let FG = null;
function foreground() {
  // out-of-focus reeds and cattails at the bottom corners (closest depth layer)
  if (FG) return FG;
  const c = createCanvas(W, H), x = c.getContext('2d');
  x.filter = 'blur(9px)';
  x.lineCap = 'round';
  const reed = (bx, hh, lean, col, w) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(bx, H + 40); x.quadraticCurveTo(bx + lean * 0.2, H - hh * 0.6, bx + lean, H - hh); x.stroke(); };
  for (const [bx, hh, lean] of [[10, 420, 40], [60, 330, -20], [110, 250, 30], [1070, 440, -40], [1020, 340, 24], [975, 240, -30]]) reed(bx, hh, lean, 'rgba(46,154,99,0.95)', 26);
  for (const [bx, by, rot] of [[50, 1560, 0.1], [1056, 1520, -0.12]]) { x.save(); x.translate(bx, by); x.rotate(rot); x.fillStyle = 'rgba(138,90,36,0.95)'; x.beginPath(); x.roundRect(-20, -60, 40, 120, 20); x.fill(); x.restore(); }
  x.fillStyle = 'rgba(88,201,139,0.9)'; x.beginPath(); x.ellipse(190, 1930, 120, 50, 0, 0, Math.PI * 2); x.fill();
  x.filter = 'none';
  FG = c;
  return c;
}

// ------------------------------------------------------------------ main
let PAGEBUF = null;
export function drawFrame(ctx, f) {
  if (!PAGEBUF) PAGEBUF = createCanvas(W, BOOK.bot + 4);
  const cam = camera(f);
  // background (blurred, slow parallax)
  ctx.save(); applyCam(ctx, cam, 0.35); ctx.drawImage(background(), -110, -110); ctx.restore();
  ctx.save(); applyCam(ctx, cam, 0.6); drawBunting(ctx, f); ctx.restore();

  // book (boards, stack, floor) + pages
  ctx.save(); applyCam(ctx, cam, 1.0);
  ctx.drawImage(bookArt(), 0, 0);
  const turning = f >= T.PAGE_TURN[0];
  if (turning) drawCTA(ctx, f);
  if (f < T.PAGE_TURN[1]) {
    const b = PAGEBUF.getContext('2d');
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.clearRect(0, 0, W, BOOK.bot + 4);
    if (!turning) { ctx.drawImage(pagePrint(), 0, 0, W, BOOK.bot + 4); drawStage(ctx, f); }
    else {
      b.drawImage(pagePrint(), 0, 0, W, BOOK.bot + 4);
      drawStage(b, f);
      const p = E.inOutSine(prog(T.PAGE_TURN[0], T.PAGE_TURN[1], f));
      const th = p * 89.5 * D2R;
      drawPlane(ctx, PAGEBUF, { x: 0, w: W, hingeY: BOOK.y, h: BOOK.bot - BOOK.y + 4, theta: th, dir: 1, F: 4000, n: 120, sy: BOOK.y, sh: BOOK.bot - BOOK.y + 4, shadow: 0.8, shade: 0.35 * p, warm: 0.15 * p });
    }
  }
  drawHingeBar(ctx);
  drawLamp(ctx, f);
  ctx.drawImage(floorProps(), 0, 0);
  drawBaker(ctx, bakerState(f));
  ctx.restore();

  // closest layer
  ctx.save(); applyCam(ctx, cam, 1.25); ctx.drawImage(foreground(), 0, 0); ctx.restore();

  // warm key light from the top-right + vignette
  const lg = ctx.createRadialGradient(780, 520, 80, 640, 900, 1250);
  lg.addColorStop(0, 'rgba(255,240,205,0.16)'); lg.addColorStop(0.6, 'rgba(255,240,205,0)'); lg.addColorStop(1, 'rgba(50,20,70,0.28)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
  drawCaptions(ctx, f);
  drawHeadline(ctx, f);
  applyGrain(ctx, 0, 0, W, H, 0.03, 'overlay');
}

// ------------------------------------------------------------------ thumbnail = frame 0 (the hook image)
export function drawThumbnail(ctx) {
  drawFrame(ctx, 0);
}
