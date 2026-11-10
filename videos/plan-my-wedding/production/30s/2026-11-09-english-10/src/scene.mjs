// English episode: a buffet can run short on time with plenty of food: two queues merging at one serving point
// vs separate stations with a one-way flow, plus an accessible route. Accepted origami-world recipe: lib.mjs /
// models.mjs from tests/15s @33e410b (DURATION=30 only); caption strip, crane and end card as in english-09.
// New mechanisms: a top-down paper venue plan with origami guest tokens, a crane that cuts the table into two
// stations, a wheelchair route (step -> ramp, obstacle cleared, food within reach) and walkthrough pins.
import { loadImage } from '@napi-rs/canvas';
import { W, H, P, F, TAU, clamp, lerp, prog, seg, ease, stepT, jit, rng, facets, path, hinge, popup, shade, makeGrain, star4 } from './lib.mjs';
import { heart, ribbon, crane, check, tag, person } from './models.mjs';
import { T } from './cues.mjs';

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
const tagAt = (ctx, x, y, u, text, px = 30) => { if (u <= 0.03) return 0; ctx.save(); ctx.translate(x, y); ctx.scale(u, u); tag(ctx, text, px); ctx.restore(); ctx.font = F.sansB(px); return ctx.measureText(text).width + 34; };
function label(ctx, x, y, text, px, col = P.ink, font = F.sansB, align = 'center') { ctx.fillStyle = col; ctx.font = font(px); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y); }



// ---------------------------------------------------------------- top-down paper venue plan (all coordinates on screen)
const PL = { l: 70, r: 1010, t: 560, b: 1590 };
const GC = [P.goldLight, P.raspLight, P.goldDark, P.blushDeep, P.rasp, P.gold];
function poly(pts) {
  const seg2 = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const [a, b] = [pts[i - 1], pts[i]]; const d = Math.hypot(b[0] - a[0], b[1] - a[1]); seg2.push({ a, b, d, s: L }); L += d; }
  const at = (d) => {
    d = clamp(d, 0, L);
    const sg = seg2.find((q) => d <= q.s + q.d + 1e-6) || seg2.at(-1);
    const u = sg.d ? (d - sg.s) / sg.d : 0;
    return { x: lerp(sg.a[0], sg.b[0], u), y: lerp(sg.a[1], sg.b[1], u), ang: Math.atan2(sg.b[1] - sg.a[1], sg.b[0] - sg.a[0]) };
  };
  return { pts, L, at };
}
// jam phase: two queues converge on one serving point (head at the end of each path)
const JL = poly([[150, 1530], [190, 1180], [420, 920], [522, 818]]);
const JR = poly([[930, 1530], [890, 1180], [660, 920], [558, 818]]);
// station phase: each queue has its own station and leaves one way toward the dining area
const SL = poly([[240, 1540], [240, 950], [196, 842], [430, 842], [462, 720], [470, 650]]);
const SR = poly([[840, 1540], [840, 950], [884, 842], [650, 842], [618, 720], [610, 650]]);
const NQ = 12;

function token(ctx, x, y, col, ang, a = 1) {
  if (a <= 0.02) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2); ctx.scale(1.3, 1.3);
  const hex = (r, k0 = 0) => [0, 1, 2, 3, 4, 5].map((k) => [Math.cos(k0 + (k * TAU) / 6) * r, Math.sin(k0 + (k * TAU) / 6) * r * 0.78]);
  facets(ctx, [{ pts: hex(23), c: col, tone: 0.1 }], { blur: 6, sx: 3, sy: 5 });
  const oct = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => [Math.cos((k * TAU) / 8) * 13, Math.sin((k * TAU) / 8) * 13]);
  facets(ctx, [{ pts: oct, c: '#E9C9AE', tone: 0.15 }], { shadow: false });
  facets(ctx, [{ pts: [oct[0], oct[1], oct[2], oct[3], oct[4]], c: P.ink, tone: 0.1 }], { shadow: false });
  ctx.restore();
}
function wheelchair(ctx, x, y, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2); ctx.scale(1.3, 1.3);
  facets(ctx, [
    { pts: [[-28, -20], [-20, -20], [-20, 22], [-28, 22]], c: P.ink, tone: 0.2 },
    { pts: [[20, -20], [28, -20], [28, 22], [20, 22]], c: P.ink, tone: -0.1 },
    { pts: [[-19, -14], [19, -14], [19, 24], [-19, 24]], c: P.gold, tone: 0.12 },
  ], { blur: 6, sx: 3, sy: 5 });
  ctx.restore();
  token(ctx, x, y, P.rasp, ang);
}
function dish(ctx, x, y, c, glow = 0) {
  if (glow > 0) { ctx.fillStyle = `rgba(195,144,76,${(0.35 * glow).toFixed(2)})`; ctx.beginPath(); ctx.arc(x, y, 34, 0, TAU); ctx.fill(); }
  ctx.fillStyle = shade(P.cream, -0.05); ctx.beginPath(); ctx.arc(x, y, 24, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(74,30,38,0.2)'; ctx.lineWidth = 1.5; ctx.stroke();
  facets(ctx, [0, 1, 2, 3, 4, 5].map((k) => { const a = (k * TAU) / 6; return { pts: [[x, y], [x + Math.cos(a) * 15, y + Math.sin(a) * 15], [x + Math.cos(a + TAU / 6) * 15, y + Math.sin(a + TAU / 6) * 15]], c, tone: Math.cos(a + 2.4) * 0.3 }; }), { shadow: false, outline: false });
}
function spoon(ctx, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.5); ctx.scale(s, s);
  facets(ctx, [{ pts: [[-3, 0], [3, 0], [2, 34], [-2, 34]], c: P.ink, tone: 0.2 }], { blur: 4, sx: 1, sy: 3 });
  facets(ctx, [0, 1, 2, 3, 4, 5].map((k) => { const a = (k * TAU) / 6; return { pts: [[0, -10], [Math.cos(a) * 9, -10 + Math.sin(a) * 13], [Math.cos(a + TAU / 6) * 9, -10 + Math.sin(a + TAU / 6) * 13]], c: P.goldLight, tone: Math.cos(a + 2.4) * 0.3 }; }), { blur: 4, sx: 1, sy: 3 });
  ctx.restore();
}
function table(ctx, l, r, y0, dishes, glowFrom = 1e9, glow = 0) {
  facets(ctx, [
    { pts: [[l, y0], [r, y0], [r, y0 + 70], [l, y0 + 70]], c: P.cream, tone: 0.12 },
    { pts: [[l, y0 + 26], [r, y0 + 26], [r, y0 + 44], [l, y0 + 44]], c: P.rasp, tone: 0.05 },
  ], { blur: 14, sx: 5, sy: 9 });
  dishes.forEach(([x, c]) => dish(ctx, x, y0 + 35, c, x < glowFrom ? glow : 0));
}
function hourglass(ctx, x, y, t) {
  const flip = Math.floor(t / 1.4), ph = (t % 1.4) / 1.4;
  ctx.save(); ctx.translate(x, y); ctx.rotate((flip + ease.inOut(clamp((ph - 0.8) / 0.2))) * Math.PI);
  facets(ctx, [
    { pts: [[-20, -30], [20, -30], [0, 0]], c: P.goldPale, tone: 0.2 },
    { pts: [[0, 0], [20, 30], [-20, 30]], c: P.goldPale, tone: -0.1 },
    { pts: [[-12 * (1 - ph), -30 + 18 * ph], [12 * (1 - ph), -30 + 18 * ph], [0, 0]], c: P.gold, tone: 0.1 },
    { pts: [[0, 30 - 22 * ph], [16 * ph + 4, 30], [-16 * ph - 4, 30]], c: P.gold, tone: -0.1 },
  ], { blur: 6, sx: 2, sy: 4 });
  ctx.strokeStyle = P.ink; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-24, -32); ctx.lineTo(24, -32); ctx.moveTo(-24, 32); ctx.lineTo(24, 32); ctx.stroke();
  ctx.restore();
}
function bang(ctx, x, y, u) {
  if (u <= 0.03) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(u, u);
  facets(ctx, [0, 1, 2, 3, 4, 5].map((k) => { const a = (k * TAU) / 6; return { pts: [[0, 0], [Math.cos(a) * 28, Math.sin(a) * 28], [Math.cos(a + TAU / 6) * 28, Math.sin(a + TAU / 6) * 28]], c: P.cream, tone: Math.cos(a + 2.4) * 0.15 }; }), { blur: 6, sx: 2, sy: 4 });
  label(ctx, 0, 2, '!', 40, P.rasp, F.serif);
  ctx.restore();
}
function arrowPath(ctx, path, u, col, dash = [18, 14], w = 6, d0 = 0) {
  if (u <= 0) return;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.setLineDash(dash); ctx.lineDashOffset = -d0;
  ctx.beginPath();
  const n = 60, end = path.L * u;
  for (let k = 0; k <= n; k++) { const p = path.at((k / n) * end); k ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }
  ctx.stroke(); ctx.setLineDash([]);
  const p = path.at(end), q = path.at(Math.max(0, end - 12));
  const a = Math.atan2(p.y - q.y, p.x - q.x);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * 18, p.y + Math.sin(a) * 18); ctx.lineTo(p.x + Math.cos(a + 2.4) * 16, p.y + Math.sin(a + 2.4) * 16); ctx.lineTo(p.x + Math.cos(a - 2.4) * 16, p.y + Math.sin(a - 2.4) * 16); ctx.fill();
  ctx.restore();
}
function pin(ctx, x, y, n, u, sc = 1) {
  if (u <= 0.03) return;
  ctx.save(); ctx.translate(x, y - (1 - Math.min(1, u)) * 60); ctx.scale(Math.min(1.1, u) * sc, Math.min(1.1, u) * sc);
  facets(ctx, [
    { pts: [[0, 0], [-22, -40], [0, -64], [0, 0]], c: P.rasp, tone: 0.2 },
    { pts: [[0, 0], [0, -64], [22, -40]], c: P.rasp, tone: -0.15 },
  ], { blur: 8, sx: 3, sy: 6 });
  ctx.fillStyle = P.cream; ctx.beginPath(); ctx.arc(0, -42, 14, 0, TAU); ctx.fill();
  label(ctx, 0, -41, String(n), 24, P.rasp, F.sansB);
  ctx.restore();
}

function plan(ctx, t) {
  const f = fold(t, T.fold, 540);
  if (f <= 0.02) return;
  ctx.save(); ctx.translate(0, 1075); ctx.scale(1, f); ctx.translate(0, -1075);
  const zk = lerp(1.3, 1, seg(t, T.tag - 0.3, T.tag + 0.25, ease.inOut));
  ctx.translate(540, 980); ctx.scale(zk, zk); ctx.translate(-540, -980);
  // the paper plan: two halves with a centre crease, faint floor grid
  facets(ctx, [
    { pts: [[PL.l, PL.t], [PL.r, PL.t], [PL.r, 1075], [PL.l, 1075]], c: P.cream, tone: 0.1 },
    { pts: [[PL.l, 1075], [PL.r, 1075], [PL.r, PL.b], [PL.l, PL.b]], c: P.cream, tone: -0.02 },
  ], { blur: 30, sx: 10, sy: 18 });
  ctx.strokeStyle = 'rgba(74,30,38,0.05)'; ctx.lineWidth = 2; ctx.beginPath();
  for (let x = PL.l + 70; x < PL.r; x += 70) { ctx.moveTo(x, PL.t + 80); ctx.lineTo(x, PL.b); }
  for (let y = PL.t + 140; y < PL.b; y += 70) { ctx.moveTo(PL.l, y); ctx.lineTo(PL.r, y); }
  ctx.stroke();
  // header band (plan -> walkthrough check)
  const wk = t >= T.walk;
  facets(ctx, [{ pts: [[PL.l, PL.t], [PL.r, PL.t], [PL.r, PL.t + 70], [PL.l, PL.t + 70]], c: wk ? P.rasp : P.goldPale, tone: 0.06 }], { shadow: false });
  const hk = wk ? seg(t, T.walk, T.walk + 0.3, ease.out) : 1;
  ctx.save(); ctx.globalAlpha *= seg(t, T.tag - 0.1, T.tag + 0.3); ctx.translate(0, PL.t + 35); ctx.scale(1, hk); label(ctx, PL.l + 36, 2, wk ? 'VENUE WALKTHROUGH CHECK' : 'BUFFET PLAN', 30, wk ? P.cream : P.ink, F.sansB, 'left'); ctx.restore();
  tagAt(ctx, 860, PL.t + 58, rise(t, T.tag, 0.25) * (1 - seg(t, T.walk - 0.2, T.walk)), 'Made-up layout', 28);
  const dlu = 1 - seg(t, T.ownQ - 0.3, T.ownQ);
  if (dlu > 0.02) { ctx.save(); ctx.globalAlpha *= dlu; label(ctx, 540, PL.t + 100, 'to dining tables', 26, 'rgba(74,30,38,0.5)', F.sans); ctx.fillStyle = 'rgba(74,30,38,0.4)'; ctx.beginPath(); ctx.moveTo(540, PL.t + 74); ctx.lineTo(530, PL.t + 86); ctx.lineTo(550, PL.t + 86); ctx.fill(); ctx.restore(); }

  // tables: one long table with ONE serving point, cut into two stations by the crane
  const su = seg(t, T.split, T.split + 0.5, ease.inOut);
  const dl = [[340, P.goldLight], [420, P.raspLight], [500, P.gold]], dr = [[580, P.raspLight], [660, P.goldLight], [740, P.gold]];
  const gl = seg(t, T.reach, T.reach + 0.3, ease.out) * (1 - seg(t, T.walk, T.walk + 0.3));
  ctx.save(); ctx.translate(-120 * su, 0); table(ctx, 300, 540, 700, dl, 360, gl); ctx.restore();
  ctx.save(); ctx.translate(120 * su, 0); table(ctx, 540, 780, 700, dr); ctx.restore();
  if (su < 0.5) { const sp = 1 + 0.25 * Math.sin(Math.PI * prog(t, T.spoon, T.spoon + 0.35)); spoon(ctx, 540, 800, sp); const ring = rise(t, T.merge, 0.3) * (1 - seg(t, T.split - 0.2, T.split)); if (ring > 0.03) { ctx.strokeStyle = P.rasp; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(540, 798, 46 * ring, 0, TAU); ctx.stroke(); } }
  else { spoon(ctx, 300, 800, rise(t, T.split + 0.3, 0.25)); spoon(ctx, 780, 800, rise(t, T.split + 0.4, 0.25)); }

  // queues
  const back = seg(t, T.backs, T.backs + 0.9, ease.out);
  const nJam = Math.round(lerp(8, 12, back));
  const reroute = seg(t, T.ownQ, T.ownQ + 0.7, ease.inOut);
  const flowT = Math.max(0, t - T.oneway);
  const dim = seg(t, T.route - 0.1, T.route + 0.3) * (1 - seg(t, T.walk, T.walk + 0.4));
  [[JL, SL, 0], [JR, SR, 1]].forEach(([J, S, side]) => {
    if (reroute > 0.6) arrowPath(ctx, S, seg(t, T.oneway, T.oneway + 0.6, ease.out), 'rgba(179,47,63,0.5)', [16, 14], 5, flowT * 60);
    else arrowPath(ctx, J, seg(t, T.queues + side * 0.25, T.queues + side * 0.25 + 0.5, ease.out) * (1 - seg(t, T.ownQ, T.ownQ + 0.3)), 'rgba(179,47,63,0.45)', [16, 14], 5);
    for (let i = 0; i < NQ; i++) {
      // jam position (head at the merge, first three squeezed)
      const dj = J.L - (i < 3 ? i * 50 : 100 + (i - 2) * 72);
      const jj = jit(t, 31 + i + side * 20, i < 3 ? 2.6 : 1);
      const bump = i === 0 ? Math.sin(t * 7) * 6 * (side ? -1 : 1) : 0;
      let pj = J.at(dj), jx = pj.x + jj.x + bump, jy = pj.y + jj.y;
      let ja = i < nJam ? 1 : 0;
      if (i >= 8 && i < nJam) { const k = seg(t, T.backs + (i - 8) * 0.18, T.backs + (i - 8) * 0.18 + 0.35, ease.out); jy += (1 - k) * 120; ja = k; }
      // station position: evenly spaced, flowing one way after "one-way flow"
      const ds = ((i * S.L) / NQ + flowT * 70) % S.L;
      const ps = S.at(ds);
      const sa = Math.min(seg(ds, 0, 40, ease.out), 1 - seg(ds, S.L - 60, S.L, ease.in));
      const x = lerp(jx, ps.x, reroute), y = lerp(jy, ps.y, reroute);
      const ang = reroute > 0.5 ? ps.ang : pj.ang;
      const a = lerp(ja, i < nJam ? sa : 0, reroute) * (side === 0 ? 1 - 0.65 * dim : 1);
      token(ctx, x, y, GC[(i + side * 3) % GC.length], ang, a);
    }
    if (reroute < 0.5) { const hb = J.at(J.L - 22); bang(ctx, hb.x + (side ? 30 : -30), hb.y - 46, (0.85 + 0.25 * Math.sin(Math.PI * prog(t, T.crawl + side * 0.1, T.crawl + side * 0.1 + 0.3))) * (1 - seg(t, T.ownQ, T.ownQ + 0.3))); }
  });
  if (reroute < 0.9) { ctx.save(); ctx.globalAlpha = 1 - reroute; hourglass(ctx, 540, 1000, t); ctx.restore(); }

  // accessible route through the left lane (step -> ramp, obstacle cleared, food within reach)
  const ru = seg(t, T.route, T.route + 0.7, ease.out) * (1 - seg(t, T.walk + 0.6, T.walk + 1.0));
  const show3 = t >= T.pin3 ? seg(t, T.pin3, T.pin3 + 0.4, ease.out) : 0;
  const AR = poly([[240, 1540], [240, 950], [196, 842], [300, 842]]);
  if (t > T.route) {
    const ramp = seg(t, T.stepFree, T.stepFree + 0.3, ease.out);
    const wide = seg(t, T.wide, T.wide + 0.35, ease.out);
    const ga = Math.max(ru, show3);
    if (ga > 0.02) {
      ctx.save(); ctx.globalAlpha = ga;
      const hw = lerp(42, 62, wide);
      ctx.strokeStyle = 'rgba(179,47,63,0.35)'; ctx.lineWidth = 3; ctx.setLineDash([10, 10]);
      ctx.beginPath(); ctx.moveTo(240 - hw, 1540); ctx.lineTo(240 - hw, 960); ctx.moveTo(240 + hw, 1540); ctx.lineTo(240 + hw, 960); ctx.stroke(); ctx.setLineDash([]);
      if (wide > 0.05) { ctx.strokeStyle = P.rasp; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(240 - hw + 6, 1150); ctx.lineTo(240 + hw - 6, 1150); ctx.stroke(); for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(240 + sx * (hw - 6), 1150); ctx.lineTo(240 + sx * (hw - 18), 1142); ctx.lineTo(240 + sx * (hw - 18), 1158); ctx.closePath(); ctx.fillStyle = P.rasp; ctx.fill(); } }
      arrowPath(ctx, AR, seg(t, T.route, T.route + 0.7, ease.out), P.rasp, [22, 12], 7);
      ctx.restore();
    }
    // step across the lane, replaced by a ramp
    if (ru > 0.02) {
      ctx.save(); ctx.globalAlpha = ru;
      if (ramp < 1) facets(ctx, [{ pts: [[190, 1262], [290, 1262], [290, 1282], [190, 1282]], c: '#5A2E34', tone: 0.1 }], { blur: 6, sx: 2, sy: 4 });
      if (ramp > 0) { ctx.save(); ctx.translate(240, 1272); ctx.scale(1, ramp); facets(ctx, [{ pts: [[-50, -26], [50, -26], [50, 26], [-50, 26]], c: P.goldLight, tone: 0.1 }], { blur: 6, sx: 2, sy: 4 }); ctx.strokeStyle = P.goldDark; ctx.lineWidth = 3; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(-14, k * 14 + 6); ctx.lineTo(0, k * 14 - 4); ctx.lineTo(14, k * 14 + 6); ctx.stroke(); } ctx.restore(); }
      // obstacle (stacked spare chair) in the lane, slid out of the way
      const ox = lerp(250, 120, wide);
      facets(ctx, [{ pts: [[ox - 24, 1040], [ox + 24, 1040], [ox + 24, 1088], [ox - 24, 1088]], c: P.goldDark, tone: 0.12 }, { pts: [[ox - 24, 1040], [ox + 24, 1040], [ox + 24, 1052], [ox - 24, 1052]], c: P.goldDark, tone: -0.2 }], { blur: 6, sx: 2, sy: 4 });
      ctx.restore();
      tagAt(ctx, 410, 1294, rise(t, T.stepFree + 0.1, 0.25) * ru, 'step-free', 31);
      tagAt(ctx, 430, 1170, rise(t, T.wide + 0.1, 0.25) * ru, 'wide and clear', 31);
      tagAt(ctx, 380, 958, rise(t, T.reach + 0.1, 0.25) * ru, 'food within reach', 31);
    }
    // the wheelchair user travels the route
    const wu = seg(t, T.wcGo, T.reach + 0.1, ease.inOut);
    const wa = rise(t, T.route + 0.3, 0.3) * (1 - seg(t, T.walk + 0.6, T.walk + 1.0));
    if (wa > 0.03) { const p = AR.at(wu * AR.L); ctx.save(); ctx.globalAlpha = Math.min(1, wa); wheelchair(ctx, p.x, p.y, p.ang); ctx.restore(); if (t > T.reach) { ctx.strokeStyle = 'rgba(195,144,76,0.8)'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(p.x, p.y, 92 * seg(t, T.reach, T.reach + 0.3, ease.out), -2.6, -0.5); ctx.stroke(); ctx.setLineDash([]); } }
  }

  // walkthrough pins: queue starts, exits, wheelchair route
  pin(ctx, 240, 1560, 1, rise(t, T.pin1, 0.35)); pin(ctx, 840, 1560, 1, rise(t, T.pin1 + 0.12, 0.35));
  tagAt(ctx, 540, 1540, rise(t, T.pin1 + 0.2, 0.25), 'queues start here', 31);
  pin(ctx, 432, 716, 2, rise(t, T.pin2, 0.35), 0.8); pin(ctx, 648, 716, 2, rise(t, T.pin2 + 0.12, 0.35), 0.8);
  const ex = rise(t, T.pin2 + 0.2, 0.25);
  if (ex > 0.03) { ctx.save(); ctx.translate(540, 714); ctx.scale(ex, ex); tag(ctx, 'exits', 28); ctx.restore(); }
  pin(ctx, 240, 1300, 3, rise(t, T.pin3, 0.35));
  tagAt(ctx, 420, 1300, rise(t, T.pin3 + 0.2, 0.25), 'wheelchair route', 31);
  ctx.restore();
}

// ---------------------------------------------------------------- crane (scene-change carrier)
const flapPhi = (t, t0) => 1.2 + Math.sin((t - t0) * 15) * 1.25;
function craneState(t) {
  const swoop = (t0, a, b, c, s, dir) => { const u = ease.inOut(prog(t, t0, t0 + 0.55)); const q = (k) => lerp(lerp(a[k], b[k], u), lerp(b[k], c[k], u), u); return { x: q(0), y: q(1), s, phi: flapPhi(t, t0), dir, rot: dir * (u - 0.5) * 0.3 }; };
  if (t >= T.crane && t < T.crane + 0.55) return swoop(T.crane, [-450, 980], [540, 560], [1500, 760], 1.6, 1);
  if (t >= T.end + 0.5) {
    const u = ease.inOut(prog(t, T.end + 0.5, T.perch));
    const landed = t >= T.perch;
    const qx = (1 - u) * (1 - u) * 1250 + 2 * (1 - u) * u * 1060 + u * u * 770, qy = (1 - u) * (1 - u) * 520 + 2 * (1 - u) * u * 380 + u * u * 322;
    return { x: qx, y: qy, s: 0.44, phi: landed ? 0.18 : flapPhi(t, T.end), dir: -1, rot: 0 };
  }
  return null;
}

// ---------------------------------------------------------------- captions: accepted English folded strip
const CAPS = [
  [0.18, 2.91, ['Plenty of food, and the', 'buffet line still crawls']],
  [3.19, 6.84, ['Made-up layout: two queues', 'merge at one serving point']],
  [7.09, 10.33, ['Everyone waits for the same', 'spoon, and the line backs up']],
  [10.61, 14.98, ['Split into separate stations, each', 'with its own queue, one-way flow']],
  [15.26, 19.99, ['Keep an accessible route: step-free,', 'wide and clear, food within reach']],
  [20.27, 25.93, ['Walkthrough: where each queue starts,', 'where it exits, the wheelchair route']],
];
const CAP_Y = 425;
function captions(ctx, t) {
  for (const [a, b, lines] of CAPS) {
    if (t < a || t > b + 0.25) continue;
    const u = seg(t, a, a + 0.25, ease.out) * (1 - seg(t, b, b + 0.25, ease.in));
    if (u <= 0.02) continue;
    let px = 66;
    ctx.font = F.serif(px);
    while (px > 50 && Math.max(...lines.map((s) => ctx.measureText(s).width)) > 740) { px -= 2; ctx.font = F.serif(px); }
    const tw = Math.max(...lines.map((s) => ctx.measureText(s).width));
    const w = Math.min(808, tw + 90), lh = px * 1.06, h = lines.length * lh + 36;
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
    const tail = (side) => ({ pts: [[side * (w / 2 - 20) * k, -h / 2 + 22], [side * (w / 2 + 40) * k, -h / 2 + 22], [side * (w / 2 + 20) * k, 6], [side * (w / 2 + 40) * k, h / 2 + 4], [side * (w / 2 - 20) * k, h / 2 + 4]], c: P.rasp, tone: -0.15 });
    facets(ctx, [tail(-1), tail(1)], { blur: 10, sx: 4, sy: 8 });
    facets(ctx, [...half(-1), ...half(1)], { blur: 16, sx: 5, sy: 10 });
    if (k > 0.55) {
      ctx.save(); ctx.scale(k, 1);
      ctx.fillStyle = P.ink; ctx.font = F.serif(px); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      lines.forEach((s, i) => ctx.fillText(s, 0, (i - (lines.length - 1) / 2) * lh + 4));
      ctx.restore();
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------- S5: end card (accepted English layout)
const EC = { x: 540, y: 930, w: 880, h: 1180 };
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function endCard(ctx, t) {
  if (t < T.end) return;
  const { x, y, w, h } = EC;
  const l = x - w / 2, r = x + w / 2, tp = y - h / 2, bt = y + h / 2;
  const slide = 1 - ease.out(prog(t, T.end, T.end + 0.2));
  ctx.save(); ctx.translate(0, slide * 900);
  const open = seg(t, T.end + 0.15, T.end + 0.45, ease.inOut);
  const k = Math.cos((1 - open) * Math.PI);
  const content = (g) => {
    const eu = rise(t, T.end + 0.4, 0.3);
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
    if (su > 0) { g.globalAlpha = su; g.fillStyle = P.rasp; g.font = F.sansB(34); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Checklist · Vendors · Budget', x, 1080); g.globalAlpha = 1; }
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
  const bu = rise(t, T.banner2, 0.3);
  if (bu > 0.03) {
    const by = 1240, bw = 780 * Math.min(1, bu), bh = 132;
    ctx.save(); ctx.translate(x, by);
    const tails = (s) => ({ pts: [[s * (bw / 2 - 30), -bh / 2 + 26], [s * (bw / 2 + 46), -bh / 2 + 26], [s * (bw / 2 + 24), 12], [s * (bw / 2 + 46), bh / 2 + 10], [s * (bw / 2 - 30), bh / 2 + 10]], c: P.raspDark, tone: 0 });
    facets(ctx, [tails(-1), tails(1)], { blur: 10, sx: 4, sy: 8 });
    facets(ctx, [
      { pts: [[-bw / 2, -bh / 2], [bw / 2, -bh / 2], [bw / 2, 0], [-bw / 2, 0]], c: P.rasp, tone: 0.18 },
      { pts: [[-bw / 2, 0], [bw / 2, 0], [bw / 2, bh / 2], [-bw / 2, bh / 2]], c: P.rasp, tone: -0.08 },
    ], { blur: 18, sx: 6, sy: 12 });
    if (bu > 0.7) {
      const ix = -bw / 2 + 28, is = 88;
      ctx.save(); roundRect(ctx, ix, -is / 2, is, is, 20); ctx.clip(); ctx.drawImage(icon, ix, -is / 2, is, is); ctx.restore();
      ctx.strokeStyle = P.cream; ctx.lineWidth = 3; roundRect(ctx, ix, -is / 2, is, is, 20); ctx.stroke();
      ctx.fillStyle = P.cream; ctx.font = F.sansB(44); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('Download Plan My Wedding', 52, 2);
    }
    ctx.restore();
    if (bu > 0.9) { ctx.fillStyle = P.ink; ctx.font = F.sans(32); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('on Google Play', x, by + 108); }
  }
  ctx.restore();
}

// ---------------------------------------------------------------- frame
export function drawFrame(ctx, tReal) {
  const t = stepT(tReal);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = P.blush; ctx.fillRect(0, 0, W, H);
  backdrop(ctx);
  plan(ctx, t);
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
