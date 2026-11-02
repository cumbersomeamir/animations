// Educational Pilot 01: "Why your phone struggles at a crowded concert".
// One concept: bars = signal strength; speed depends on the tower's shared capacity. drawFrame(ctx,t) is pure.
import { W, H, FPS, DURATION, C, clamp, lerp, inv, TAU, ease, env, pulse, wobble, hash, K, hexA, roundRect, camera, project } from './core.mjs';
import { drawBix, drawDot, BIX_BASE } from './cast.mjs';

// ------------------------------------------------------------------ world layout (units ≈ metres)
const GROUND = 0;
const BIX = [0, 0, 6];
const PHONE = { pos: [1.35, 0, 5.4], w: 1.15, h: 2.15 };
const PHONE_TOP = [PHONE.pos[0], PHONE.h + 0.05, PHONE.pos[2]];
const TOWER = [5, 0, -24], MAST_H = 22;
const GATE = [TOWER[0], MAST_H, TOWER[2]];
const LANES = 4;

export const T = {
  barsOn: [0.05, 0.5], proud: [0.35, 0.8], pick: 0.92, throw: 1.2, dotArrive: 2.15, taps: [1.5, 1.8],
  scratch: 1.95, shotB: [2.5, 3.2], point: 2.85, meter: 4.45, shrug: 5.35,
  shotC: [6.25, 7.7], ramp: [6.7, 9.3], shotD: [11.0, 12.0], dotBack: [11.45, 12.15], load: 12.15, catch: 12.35,
  plaque: 12.55, gesture: 12.95, sig: 12.9,
};

// ------------------------------------------------------------------ crowd (deterministic)
const CROWD = [];
for (let i = 0; CROWD.length < 170 && i < 2000; i++) {
  const x = -17 + hash(i * 1.37) * 32, z = -21 + hash(i * 2.91) * 25;
  if (Math.abs(x - 0.5) < 3.2 && z > 1.5) continue;              // keep space around Bix & the phone
  if (Math.hypot(x - TOWER[0], z - TOWER[2]) < 4) continue;        // tower base
  const far = Math.hypot(x - TOWER[0], z - TOWER[2]);
  // a quarter already online; the rest join in a wave during the reveal (ordered by distance to camera side)
  const act = hash(i * 7.3) < 0.25 ? -1 : lerp(T.ramp[0], T.ramp[1], clamp((z + 21) / 25 * 0.6 + hash(i * 3.1) * 0.4));
  CROWD.push({ x, z, h: 1.55 + hash(i * 5.5) * 0.35, act, far, side: hash(i * 9.1) < 0.5 ? -1 : 1 });
}
const phonePos = c => [c.x + 0.22 * c.side, c.h + 0.35, c.z];

// ------------------------------------------------------------------ queue at the tower (FIFO, shared capacity μ)
const MU = 4.0;                       // packets served per second by this tower (illustrative)
const N0 = 36;                        // already waiting at t = 0
const lambda = t => lerp(3.0, 10.0, ease.sine(inv(T.ramp[0], T.ramp[1] + 0.4, t)));
const PK = [];                        // all packets in arrival order
for (let i = 0; i < N0; i++) PK.push({ arrive: -10 + i * 0.01, phone: -1 });
{
  let t = 0, acc = 0, n = 0;
  while (t < DURATION + 1) {
    acc += lambda(t) / 60; t += 1 / 60;
    if (t >= T.dotArrive && !PK.some(p => p.dot)) PK.push({ arrive: T.dotArrive, dot: true, phone: -2 });
    while (acc >= 1) {
      acc -= 1; n++;
      const active = CROWD.map((c, k) => [c, k]).filter(([c]) => c.act < t - 0.85);
      const pick = active.length ? active[Math.floor(hash(n * 4.17) * active.length)][1] : -1;
      PK.push({ arrive: t, phone: pick });
    }
  }
  PK.sort((a, b) => a.arrive - b.arrive);
  PK.forEach((p, i) => { p.idx = i; p.serve = (i + 1) / MU; });   // queue never empties: service is continuous
}
export const DOT = PK.find(p => p.dot);
const served = t => MU * t;           // continuous served count (smooth crawl)
const queueLen = t => PK.filter(p => p.arrive <= t).length - served(t);

const helix = q => {                  // queue index -> point on a spiral around the mast (front at the gate)
  const a = 1.3 + q * 0.5, r = 2.3 + q * 0.03, y = MAST_H - 1.1 - q * 0.3;
  return [TOWER[0] + Math.cos(a) * r, y, TOWER[2] + Math.sin(a) * r];
};
const bez = (a, b, lift, k) => {
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + lift, (a[2] + b[2]) / 2];
  const u = 1 - k; return [u * u * a[0] + 2 * u * k * m[0] + k * k * b[0], u * u * a[1] + 2 * u * k * m[1] + k * k * b[1], u * u * a[2] + 2 * u * k * m[2] + k * k * b[2]];
};
function packetPos(p, t) {
  // returns {pos, state} ; states: fly (to queue), wait, pass, down (backhaul), back (Dot returning)
  const flyT = 0.85;
  const src = p.dot ? PHONE_TOP : p.phone >= 0 ? phonePos(CROWD[p.phone]) : null;
  if (t < p.arrive) {
    if (!src || t < p.arrive - flyT) return null;
    const k = ease.inOut((t - (p.arrive - flyT)) / flyT);
    return { pos: bez(src, helix(Math.max(0, p.idx - served(p.arrive))), 4, k), state: 'fly' };
  }
  const q = p.idx - served(t);
  if (q > 0) return { pos: helix(q), state: 'wait', q };
  const after = t - p.serve;
  if (after < 0.18) return { pos: [GATE[0] + Math.cos(p.idx * 1.5708) * 1.0, GATE[1] + 0.4 + after * 2, GATE[2] + Math.sin(p.idx * 1.5708) * 1.0], state: 'pass', lane: p.idx % LANES };
  if (p.dot) {
    if (t < T.dotBack[0]) return { pos: [GATE[0], GATE[1] + 1.2, GATE[2]], state: 'hold' };
    if (t < T.dotBack[1]) { const k = ease.inOut(inv(...T.dotBack, t)); return { pos: bez(GATE, PHONE_TOP, 5, k), state: 'back' }; }
    return null;
  }
  if (after < 0.7) { const k = (after - 0.18) / 0.52; return { pos: [TOWER[0] + 0.25, lerp(GATE[1], 0.3, ease.in(k)), TOWER[2] + 0.25], state: 'down' }; }
  return null;
}

// ------------------------------------------------------------------ camera choreography
function cam(t) {
  const k = K(t, [
    [0, { p: [1.5, 1.85, 14.8], g: [0.5, 1.3, 5.8], f: 34 }],
    [2.5, { p: [1.4, 1.8, 14.4], g: [0.5, 1.35, 5.8], f: 34 }],
    [3.2, { p: [-1.7, 1.3, 17.2], g: [2.5, 9.8, -14], f: 50 }],
    [6.25, { p: [-1.8, 1.35, 17.5], g: [2.5, 10.2, -14], f: 50 }],
    [7.7, { p: [-13, 31, 34], g: [3.0, 12.5, -14], f: 50 }],
    [11.0, { p: [-11.8, 29, 32], g: [3.2, 13.0, -14.5], f: 49 }],
    [12.0, { p: [1.4, 2.3, 15.6], g: [0.6, 2.75, 5.6], f: 38 }],
    [15.0, { p: [1.35, 2.35, 15.2], g: [0.6, 2.8, 5.6], f: 37.5 }],
  ]);
  // subtle handheld breathing
  const br = [0.03 * Math.sin(t * 1.3), 0.025 * Math.sin(t * 1.7 + 1), 0];
  return camera(k.p.map((v, i) => v + (br[i] || 0)), k.g, k.f);
}

// ------------------------------------------------------------------ environment
const BUILDINGS = [];
{
  let i = 0;
  const add = (x, z, w, d, h) => BUILDINGS.push({ x, z, w, d, h, i: i++ });
  for (let x = -46; x <= 46; x += 11) add(x + hash(x) * 3, -50 - hash(x * 3) * 8, 8 + hash(x * 5) * 3, 8, 16 + hash(x * 7) * 38);
  for (let z = -40; z <= 18; z += 10) { add(-30 - hash(z) * 4, z, 8, 8, 12 + hash(z * 3) * 30); add(32 + hash(z * 2) * 4, z, 8, 8, 12 + hash(z * 5) * 34); }
  add(-20, 22, 7, 6, 10); add(22, 24, 7, 7, 14);
}

function line3(ctx, cm, a, b) { const p = project(cm, a), q = project(cm, b); if (!p || !q) return; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
function poly3(ctx, cm, pts) { const pp = pts.map(p => project(cm, p)); if (pp.some(p => !p)) return false; ctx.beginPath(); ctx.moveTo(pp[0].x, pp[0].y); for (const p of pp.slice(1)) ctx.lineTo(p.x, p.y); ctx.closePath(); return true; }

function drawSky(ctx, cm, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, C.bgDeep); g.addColorStop(0.6, C.bg); g.addColorStop(1, '#0D1311');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const tp = project(cm, GATE);
  if (tp) { const r = 900; const gg = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, r); gg.addColorStop(0, hexA(C.blue, 0.12)); gg.addColorStop(1, hexA(C.blue, 0)); ctx.fillStyle = gg; ctx.fillRect(0, 0, W, H); }
}

function drawGround(ctx, cm) {
  ctx.lineWidth = 1;
  for (let x = -40; x <= 40; x += 2) { ctx.strokeStyle = hexA(C.blueSoft, x % 10 === 0 ? 0.09 : 0.045); line3(ctx, cm, [x, 0, -60], [x, 0, 14]); }
  for (let z = -60; z <= 14; z += 2) { ctx.strokeStyle = hexA(C.blueSoft, z % 10 === 0 ? 0.09 : 0.045); line3(ctx, cm, [-40, 0, z], [40, 0, z]); }
}

function drawBuilding(ctx, cm, b) {
  const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2, z0 = b.z - b.d / 2, z1 = b.z + b.d / 2;
  const P = (x, y, z) => [x, y, z];
  const c = project(cm, [b.x, b.h / 2, b.z]); if (!c) return;
  const fade = clamp(1.4 - c.z / 90, 0.35, 1);
  const faces = [
    [P(x0, 0, z1), P(x1, 0, z1), P(x1, b.h, z1), P(x0, b.h, z1)], [P(x1, 0, z0), P(x1, 0, z1), P(x1, b.h, z1), P(x1, b.h, z0)],
    [P(x0, 0, z0), P(x0, 0, z1), P(x0, b.h, z1), P(x0, b.h, z0)], [P(x0, b.h, z0), P(x1, b.h, z0), P(x1, b.h, z1), P(x0, b.h, z1)],
  ];
  for (const f of faces) if (poly3(ctx, cm, f)) { ctx.fillStyle = hexA(C.blue, 0.035 * fade); ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.26 * fade); ctx.lineWidth = 1.4; ctx.stroke(); }
  ctx.strokeStyle = hexA(C.blueSoft, 0.07 * fade); ctx.lineWidth = 1;
  for (let y = 3; y < b.h; y += 3) { line3(ctx, cm, [x0, y, z1], [x1, y, z1]); line3(ctx, cm, [x1, y, z0], [x1, y, z1]); }
}

function drawStage(ctx, cm, t) {
  const sx = -7, sz = -34, w = 20, d = 6, h = 2.4;
  const f = [[sx - w / 2, 0, sz + d / 2], [sx + w / 2, 0, sz + d / 2], [sx + w / 2, h, sz + d / 2], [sx - w / 2, h, sz + d / 2]];
  if (poly3(ctx, cm, f)) { ctx.fillStyle = hexA(C.blue, 0.08); ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.5); ctx.lineWidth = 2; ctx.stroke(); }
  ctx.strokeStyle = hexA(C.ink, 0.35); ctx.lineWidth = 2;
  line3(ctx, cm, [sx - w / 2, h, sz], [sx - w / 2, 12, sz]); line3(ctx, cm, [sx + w / 2, h, sz], [sx + w / 2, 12, sz]); line3(ctx, cm, [sx - w / 2, 12, sz], [sx + w / 2, 12, sz]);
  // light beams sweeping (concert)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const lx = sx - w / 2 + 2 + i * 4, a = Math.sin(t * 0.9 + i * 1.3) * 0.5;
    const top = project(cm, [lx, 12, sz]), bot1 = project(cm, [lx + Math.sin(a) * 9 - 1.6, 0, sz + 9]), bot2 = project(cm, [lx + Math.sin(a) * 9 + 1.6, 0, sz + 9]);
    if (top && bot1 && bot2) { ctx.fillStyle = hexA(i % 2 ? C.blueSoft : C.ink, 0.05); ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(bot1.x, bot1.y); ctx.lineTo(bot2.x, bot2.y); ctx.closePath(); ctx.fill(); }
  }
  ctx.restore();
}

function drawTower(ctx, cm, t) {
  const [tx, , tz] = TOWER;
  ctx.strokeStyle = hexA(C.ink, 0.75); ctx.lineWidth = 2.2;
  const legs = [[-1.4, -1.4], [1.4, -1.4], [0, 1.6]];
  for (const [dx, dz] of legs) line3(ctx, cm, [tx + dx, 0, tz + dz], [tx + dx * 0.25, MAST_H, tz + dz * 0.25]);
  ctx.strokeStyle = hexA(C.ink, 0.28); ctx.lineWidth = 1.2;
  for (let y = 0; y < MAST_H; y += 2) {
    const k0 = 1 - 0.75 * (y / MAST_H), k1 = 1 - 0.75 * ((y + 2) / MAST_H);
    for (let i = 0; i < 3; i++) { const a = legs[i], b = legs[(i + 1) % 3]; line3(ctx, cm, [tx + a[0] * k0, y, tz + a[1] * k0], [tx + b[0] * k1, y + 2, tz + b[1] * k1]); }
  }
  // antenna panels
  for (let i = 0; i < 3; i++) {
    const a = i * TAU / 3 + 0.4, x = tx + Math.cos(a) * 0.7, z = tz + Math.sin(a) * 0.7;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 5; line3(ctx, cm, [x, MAST_H - 0.4, z], [x, MAST_H + 1.8, z]);
  }
  // capacity gate ring with a few lanes (shared capacity)
  const ringPts = [];
  for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU; ringPts.push(project(cm, [tx + Math.cos(a) * 1.8, MAST_H + 0.3, tz + Math.sin(a) * 1.8])); }
  if (ringPts.every(Boolean)) { ctx.strokeStyle = hexA(C.blueSoft, 0.9); ctx.lineWidth = 3; ctx.beginPath(); ringPts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke(); }
  for (let l = 0; l < LANES; l++) {
    const a = l * TAU / LANES, p = project(cm, [tx + Math.cos(a) * 1.8, MAST_H + 0.3, tz + Math.sin(a) * 1.8]);
    if (!p) continue;
    // lane flashes whenever a packet passes through it
    let fl = 0; for (const pk of PK) { const d = t - pk.serve; if (d >= 0 && d < 0.25 && pk.idx % LANES === l) fl = Math.max(fl, 1 - d / 0.25); }
    const r = Math.max(4, 0.32 * p.s) * (1 + 0.6 * fl);
    ctx.fillStyle = hexA(fl > 0.05 ? C.ink : C.blue, 0.9); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
  }
  // backhaul to the internet (down the mast, off along the ground)
  ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.setLineDash([8, 10]); ctx.lineDashOffset = -t * 40;
  line3(ctx, cm, [tx + 0.25, MAST_H, tz + 0.25], [tx + 0.25, 0.05, tz + 0.25]); line3(ctx, cm, [tx + 0.25, 0.05, tz + 0.25], [tx + 40, 0.05, tz - 30]);
  ctx.setLineDash([]);
}

function beamPath(cm, a, b, lift, n = 14) { const out = []; for (let i = 0; i <= n; i++) { const p = project(cm, bez(a, b, lift, i / n)); if (!p) return null; out.push(p); } return out; }
function drawBeams(ctx, cm, t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const c of CROWD) {
    if (c.act > t) continue;
    const k = c.act < 0 ? 1 : clamp((t - c.act) / 0.6);
    const pts = beamPath(cm, phonePos(c), GATE, 4, 10); if (!pts) continue;
    const n = Math.max(1, Math.round(k * 10));
    ctx.strokeStyle = hexA(C.blue, 0.2); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i <= n; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke();
  }
  // Bix's own radio path: strong (bright, thick) — that's what the bars measure
  const pts = beamPath(cm, PHONE_TOP, GATE, 4, 40);
  if (pts) {
    const on = env(t, 0.05, 0.5);
    ctx.strokeStyle = hexA(C.blueSoft, 0.35 * on); ctx.lineWidth = Math.max(4, pts[0].s * 0.09); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
    ctx.strokeStyle = hexA(C.ink, 0.6 * on); ctx.lineWidth = Math.max(1.5, pts[0].s * 0.025); ctx.stroke();
    // travelling wave crests (signal strength visual)
    for (let w = 0; w < 6; w++) {
      const u = ((t * 0.55 + w / 6) % 1), i = Math.floor(u * 40), p = pts[i];
      ctx.fillStyle = hexA(C.ink, 0.8 * on * (1 - u)); ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(2.5, p.s * 0.06), 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

function drawPerson(ctx, cm, c, t) {
  const base = project(cm, [c.x, 0, c.z]), head = project(cm, [c.x, c.h, c.z]); if (!base || !head) return;
  const s = base.s, bob = Math.sin(t * 5 + c.x * 3) * 0.05 * s;
  ctx.fillStyle = '#1B2421'; ctx.strokeStyle = hexA(C.blueSoft, 0.18); ctx.lineWidth = 1;
  roundRect(ctx, base.x - 0.22 * s, head.y + 0.2 * s + bob, 0.44 * s, base.y - head.y - 0.2 * s, 0.18 * s); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(head.x, head.y + bob, 0.17 * s, 0, TAU); ctx.fill(); ctx.stroke();
  const ph = project(cm, phonePos(c)); if (!ph) return;
  const lit = c.act < t ? 1 : 0.25;
  ctx.strokeStyle = '#2A3532'; ctx.lineWidth = Math.max(1, 0.06 * s); ctx.beginPath(); ctx.moveTo(head.x + 0.12 * s * c.side, head.y + 0.35 * s + bob); ctx.lineTo(ph.x, ph.y + 0.1 * s); ctx.stroke();
  ctx.fillStyle = hexA(lit > 0.5 ? C.blueSoft : C.muted, lit); roundRect(ctx, ph.x - 0.07 * s, ph.y - 0.12 * s, 0.14 * s, 0.24 * s, 0.03 * s); ctx.fill();
  if (c.act > 0 && t > c.act && t < c.act + 0.5) { const k = (t - c.act) / 0.5; ctx.strokeStyle = hexA(C.blueSoft, 1 - k); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ph.x, ph.y, (0.2 + k * 0.8) * s, 0, TAU); ctx.stroke(); }
}

function drawPackets(ctx, cm, t) {
  const items = [];
  for (const p of PK) {
    if (p.dot) continue;
    const st = packetPos(p, t); if (!st) continue;
    const pr = project(cm, st.pos); if (!pr) continue;
    items.push([pr, st]);
  }
  items.sort((a, b) => b[0].z - a[0].z);
  for (const [pr, st] of items) {
    const size = Math.max(3, 0.55 * pr.s);
    if (st.state === 'pass') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = hexA(C.ink, 0.6); ctx.beginPath(); ctx.arc(pr.x, pr.y - size / 2, size, 0, TAU); ctx.fill(); ctx.restore(); }
    drawDot(ctx, pr.x, pr.y + size / 2, size, { face: false, dim: st.state === 'wait', alpha: st.state === 'down' ? 0.6 : 1 });
  }
}

// ------------------------------------------------------------------ props: giant phone, meter, board, plaque
function drawGiantPhone(ctx, cm, t) {
  const bl = project(cm, [PHONE.pos[0] - PHONE.w / 2, 0, PHONE.pos[2]]), tr = project(cm, [PHONE.pos[0] + PHONE.w / 2, PHONE.h, PHONE.pos[2]]);
  if (!bl || !tr) return null;
  const x = bl.x, y = tr.y, w = tr.x - bl.x, h = bl.y - tr.y, s = bl.s;
  // tap / arrival jolt
  const jolt = wobble(t, T.taps[0], 9, 10, 4) + wobble(t, T.taps[1], 9, 10, 4) + wobble(t, T.dotBack[1], 7, 8, 8);
  ctx.save(); ctx.translate(jolt, 0);
  const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, h);
  g.addColorStop(0, hexA(C.blue, 0.22)); g.addColorStop(1, hexA(C.blue, 0)); ctx.fillStyle = g; ctx.fillRect(x - h, y - h / 2, w + 2 * h, 2 * h);
  roundRect(ctx, x, y, w, h, w * 0.14); ctx.fillStyle = '#141C19'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(2, s * 0.03); ctx.stroke();
  const ix = x + w * 0.07, iy = y + w * 0.07, iw = w * 0.86, ih = h - w * 0.14;
  roundRect(ctx, ix, iy, iw, ih, w * 0.09); ctx.fillStyle = '#0E1513'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.3); ctx.lineWidth = 1.5; ctx.stroke();
  // status row: four bars, all lit (strong signal)
  const lit = clamp((t - T.barsOn[0]) / (T.barsOn[1] - T.barsOn[0]) * 4);
  for (let i = 0; i < 4; i++) { const bh = ih * (0.025 + i * 0.012), bw = iw * 0.05; ctx.fillStyle = lit > i ? C.ink : hexA(C.ink, 0.2); ctx.fillRect(ix + iw * 0.66 + i * bw * 1.5, iy + ih * 0.08 - bh, bw, bh); }
  // content: spinner until the data comes back, then the page loads
  const cx = ix + iw / 2, cy = iy + ih * 0.5;
  const loaded = env(t, T.load, T.load + 0.35);
  if (loaded < 1) {
    ctx.globalAlpha = 1 - loaded;
    ctx.strokeStyle = hexA(C.ink, 0.15); ctx.lineWidth = Math.max(3, iw * 0.06); ctx.beginPath(); ctx.arc(cx, cy, iw * 0.2, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.blueSoft; ctx.lineCap = 'round'; ctx.beginPath(); const a0 = t * 7; ctx.arc(cx, cy, iw * 0.2, a0, a0 + 1.8); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (loaded > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(ix, iy + ih * 0.14, iw, ih * 0.86 * loaded); ctx.clip();
    roundRect(ctx, ix + iw * 0.1, iy + ih * 0.17, iw * 0.8, ih * 0.3, iw * 0.05); ctx.fillStyle = hexA(C.blue, 0.85); ctx.fill();
    ctx.fillStyle = hexA(C.ink, 0.8); for (let i = 0; i < 4; i++) roundRect(ctx, ix + iw * 0.1, iy + ih * (0.53 + i * 0.08), iw * (i === 3 ? 0.45 : 0.8), ih * 0.035, 3), ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  return { x, y, w, h, s, screen: [cx, cy] };
}

function drawMeter(ctx, x, y, sc, t, alpha) {
  // handheld two-readout meter: SIGNAL (bars, full) vs SPEED (needle, low). Illustrative, no numbers.
  if (alpha <= 0.01) return;
  const w = 300 * sc, h = 190 * sc;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(sc, sc);
  roundRect(ctx, -150, -190, 300, 190, 24); ctx.fillStyle = 'rgba(14,21,19,0.92)'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = C.ink; ctx.font = '26px ESemi'; ctx.textAlign = 'center';
  ctx.fillText('SIGNAL', -75, -150); ctx.fillText('SPEED', 75, -150);
  for (let i = 0; i < 4; i++) { const bh = 20 + i * 18; roundRect(ctx, -118 + i * 24, -30 - bh, 16, bh, 4); ctx.fillStyle = C.ink; ctx.fill(); }
  ctx.strokeStyle = hexA(C.ink, 0.25); ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(75, -40, 52, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.strokeStyle = C.coral; ctx.beginPath(); ctx.arc(75, -40, 52, Math.PI * 1.1, Math.PI * 1.22); ctx.stroke();
  const needle = Math.PI * (1.14 + 0.03 * Math.sin(t * 17) + 0.02 * Math.sin(t * 7));
  ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(75, -40); ctx.lineTo(75 + Math.cos(needle) * 48, -40 + Math.sin(needle) * 48); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(75, -40, 8, 0, TAU); ctx.fill();
  ctx.restore();
  return w + h;
}

function drawBoard(ctx, cm, t) {
  // glass stadium screen in the city: same two readouts; "speed per phone" drains as phones join (no numbers)
  const c = project(cm, [9.0, 11.2, -9]); if (!c) return;
  const a = env(t, 7.0, 7.6) * (1 - env(t, 10.95, 11.3));
  if (a <= 0) return;
  const s = c.s * 1.36, w = 6.6 * s, h = 7.6 * s;
  const L = -w / 2 + 0.55 * s;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(c.x, c.y);
  roundRect(ctx, -w / 2, -h / 2, w, h, 0.5 * s); ctx.fillStyle = 'rgba(12,19,17,0.9)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.8); ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = C.ink; ctx.font = `${0.6 * s}px ESemi`; ctx.textAlign = 'left';
  ctx.fillText('SIGNAL', L, -h / 2 + 1.1 * s);
  for (let i = 0; i < 4; i++) { const bh = (0.45 + i * 0.32) * s; roundRect(ctx, L + i * 0.62 * s, -h / 2 + 2.85 * s - bh, 0.42 * s, bh, 0.1 * s); ctx.fillStyle = C.ink; ctx.fill(); }
  ctx.fillStyle = C.ink; ctx.fillText('SPEED PER PHONE', L, -h / 2 + 4.0 * s);
  const active = CROWD.filter(cc => cc.act < t).length / CROWD.length;
  const lvl = lerp(0.62, 0.07, ease.inOut(inv(0.25, 1, active)));
  const bw = w - 1.1 * s;
  roundRect(ctx, L, -h / 2 + 4.45 * s, bw, 0.8 * s, 0.35 * s); ctx.fillStyle = hexA(C.ink, 0.12); ctx.fill();
  roundRect(ctx, L, -h / 2 + 4.45 * s, Math.max(0.7 * s, bw * lvl), 0.8 * s, 0.35 * s); ctx.fillStyle = lvl < 0.25 ? C.coral : C.blueSoft; ctx.fill();
  // demand: people icons fill up (no numbers)
  const nIcons = Math.round(lerp(3, 12, active));
  for (let i = 0; i < 12; i++) { ctx.fillStyle = i < nIcons ? C.blueSoft : hexA(C.ink, 0.12); const ix = L + 0.2 * s + i * 0.46 * s, iy = -h / 2 + 6.15 * s; ctx.beginPath(); ctx.arc(ix, iy - 0.28 * s, 0.14 * s, 0, TAU); ctx.fill(); roundRect(ctx, ix - 0.17 * s, iy - 0.1 * s, 0.34 * s, 0.42 * s, 0.1 * s); ctx.fill(); }
  ctx.fillStyle = hexA(C.ink, 0.55); ctx.font = `${0.4 * s}px EMed`; ctx.fillText('illustration', L, h / 2 - 0.35 * s);
  ctx.restore();
}

function drawPlaque(ctx, cm, t) {
  const k = ease.outBack(clamp((t - T.plaque) / 0.45));
  if (k <= 0.01) return;
  const c = { x: 540, y: 560 };
  ctx.save(); ctx.translate(c.x, c.y + wobble(t, T.plaque + 0.45, 1.2, 1.5, 4) + 4 * Math.sin(t * 1.4)); ctx.scale(k, k);
  const w = 860, h = 300;
  ctx.globalAlpha = clamp(k);
  const g = ctx.createRadialGradient(0, 0, 50, 0, 0, 560); g.addColorStop(0, hexA(C.blue, 0.25)); g.addColorStop(1, hexA(C.blue, 0)); ctx.fillStyle = g; ctx.fillRect(-600, -400, 1200, 800);
  roundRect(ctx, -w / 2, -h / 2, w, h, 40); ctx.fillStyle = 'rgba(12,19,17,0.9)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.9); ctx.lineWidth = 3; ctx.stroke();
  // glass edge (dimensional)
  ctx.strokeStyle = hexA(C.ink, 0.12); ctx.lineWidth = 2; roundRect(ctx, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 32); ctx.stroke();
  ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.font = '86px EDisplay'; ctx.fillText('Full bars ≠ fast data', 0, -8);
  ctx.fillStyle = '#B5BFBA'; ctx.font = '42px EMed'; ctx.fillText("Strong signal isn't spare capacity", 0, 78);
  ctx.restore();
}

// ------------------------------------------------------------------ Bix & Dot performance
const P = o => ({ ...BIX_BASE, ...o });
const POSE = {
  dark: P({ bars: 0, mouth: 0.2, look: [1, -0.4] }),
  proud: P({ handN: [95, -205], handF: [-95, -205], mouth: 1, happyEyes: 1, barGlow: 0.9, squash: -0.15, lift: -10 }),
  reach: P({ handF: [-118, -26], lean: -0.12, look: [-1, 0.8], mouth: 0.6, squash: 0.15 }),
  windup: P({ handF: [-135, -210], handN: [80, -120], lean: -0.16, mouth: 0.8, eye: 1.1, brow: 0.5, squash: 0.2 }),
  throw: P({ handF: [150, -250], handN: [60, -90], lean: 0.16, mouth: 0.9, mouthO: 0.3, squash: -0.2, look: [1, -1] }),
  tap: P({ handN: [140, -150], lean: 0.08, look: [1, 0.1], mouth: 0.3 }),
  lean: P({ handN: [140, -160], handF: [-60, -90], lean: 0.12, look: [1, 0.2], brow: 0.3, mouth: -0.1, eye: 1.15 }),
  confused: P({ handN: [70, -90], handF: [-30, -268], brow: 0.6, browTilt: 1, mouth: -0.25, look: [-0.4, -0.8], lean: -0.06 }),
  point: P({ handN: [34, -292], handF: [-80, -80], mouth: 0.6, brow: 0.6, look: [0, -1], barGlow: 0.6 }),
  meter: P({ handF: [-150, -215], handN: [90, -90], mouth: 0.1, brow: 0.4, look: [-1, -0.2] }),
  shrug: P({ handN: [118, -175], handF: [-150, -205], mouth: -0.45, brow: 0.8, browTilt: 1, squash: 0.18, look: [0, 0] }),
  impatient: P({ handN: [52, -138], handF: [-52, -138], brow: -0.9, mouth: -0.35, eye: 0.75, look: [0.6, -1] }),
  watch: P({ handN: [80, -110], handF: [-80, -110], brow: 0.4, mouth: 0, eye: 1.1, look: [0.5, -1] }),
  catch: P({ handN: [158, -150], handF: [-40, -140], eye: 1.25, brow: 0.8, mouthO: 0.5, look: [1, -0.5], lean: 0.08 }),
  relieved: P({ handN: [70, -110], handF: [-60, -160], happyEyes: 1, mouth: 0.9, squash: 0.12 }),
  present: P({ handN: [105, -265], handF: [-90, -90], mouth: 0.75, brow: 0.5, look: [0.6, -1] }),
};
function bixPose(t) {
  const pose = K(t, [
    [0, POSE.dark], [T.proud[0], P({ ...POSE.dark, bars: 4 }), 'linear'], [T.proud[0] + 0.2, POSE.proud, 'outBack'], [T.proud[1], POSE.proud],
    [T.pick, POSE.reach], [1.08, POSE.windup], [T.throw + 0.05, POSE.throw, 'inBack'], [1.38, POSE.tap],
    [T.taps[0], POSE.tap], [1.62, POSE.lean], [T.taps[1], POSE.tap], [T.scratch + 0.15, POSE.confused], [2.7, POSE.confused],
    [T.point + 0.25, POSE.point, 'outBack'], [4.2, POSE.point], [T.meter + 0.2, POSE.meter, 'outBack'], [5.15, POSE.meter],
    [T.shrug + 0.25, POSE.shrug, 'outBack'], [6.3, POSE.shrug], [7.0, POSE.impatient], [11.0, POSE.impatient],
    [11.5, POSE.watch], [12.1, POSE.watch], [T.catch + 0.1, POSE.catch, 'outBack'], [12.75, POSE.relieved],
    [T.gesture + 0.3, POSE.present, 'outBack'], [15, POSE.present],
  ]);
  // crest lights bar by bar (stepped), glow pulses when Bix points at it
  if (t < T.proud[0] + 0.05) pose.bars = Math.floor(clamp(inv(...T.barsOn, t)) * 4.999);
  pose.barGlow += 0.8 * (pulse(t, 2.95, 3.05, 3.1, 3.3) + pulse(t, 3.45, 3.55, 3.6, 3.8) + pulse(t, 3.95, 4.05, 4.1, 4.3));
  // blinks + foot tap while impatient
  for (const b of [2.35, 5.0, 9.0, 13.6]) pose.eye *= 1 - pulse(t, b, b + 0.04, b + 0.06, b + 0.12);
  if (t > 7 && t < 11) pose.footN = [30, -Math.max(0, Math.sin(t * TAU * 2.6)) * 16];
  pose.lift += -Math.abs(Math.sin(t * TAU * 0.5)) * 2;
  return pose;
}

// ------------------------------------------------------------------ captions (screen space)
const CAPS = [
  { a: 0.35, b: 2.38, main: 'Full bars. Nothing loads?' },
  { a: 2.8, b: 6.2, main: 'Bars = signal strength', sub: 'not how busy the tower is', subAt: 4.9 },
  { a: 6.55, b: 8.6, main: 'Thousands of phones', sub: 'share one tower', subAt: 7.4 },
  { a: 8.95, b: 11.15, main: 'Your data waits its turn' },
];
function drawCaptions(ctx, t) {
  for (const c of CAPS) {
    if (t < c.a || t > c.b + 0.3) continue;
    const kin = ease.outBack(clamp((t - c.a) / 0.35)), kout = env(t, c.b, c.b + 0.3, 'in');
    ctx.save(); ctx.globalAlpha = clamp(kin) * (1 - kout);
    ctx.font = '70px EBold'; const mw = ctx.measureText(c.main).width;
    ctx.font = '44px ESemi'; const sw = c.sub ? ctx.measureText(c.sub).width : 0;
    const showSub = c.sub && t >= c.subAt; const sk = showSub ? ease.out(clamp((t - c.subAt) / 0.3)) : 0;
    const pw = Math.max(mw, sw * sk) + 80, ph = 118 + 64 * sk;
    const y0 = 210 + 30 * (1 - kin) - 20 * kout;
    roundRect(ctx, 540 - pw / 2, y0, pw, ph, 30); ctx.fillStyle = 'rgba(8,13,11,0.78)'; ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
    ctx.textAlign = 'center'; ctx.fillStyle = C.ink; ctx.font = '70px EBold'; ctx.fillText(c.main, 540, y0 + 84);
    if (showSub) { ctx.globalAlpha *= sk; ctx.fillStyle = C.blueSoft; ctx.font = '44px ESemi'; ctx.fillText(c.sub, 540, y0 + 84 + 62); }
    ctx.restore();
  }
}

// ------------------------------------------------------------------ frame
export function drawFrame(ctx, t, assets) {
  const cm = cam(t);
  drawSky(ctx, cm, t);
  drawGround(ctx, cm);
  [...BUILDINGS].sort((a, b) => (project(cm, [b.x, b.h / 2, b.z])?.z ?? 0) - (project(cm, [a.x, a.h / 2, a.z])?.z ?? 0)).forEach(b => drawBuilding(ctx, cm, b));
  drawStage(ctx, cm, t);
  drawTower(ctx, cm, t);
  drawBeams(ctx, cm, t);
  [...CROWD].sort((a, b) => a.z - b.z).forEach(c => drawPerson(ctx, cm, c, t));
  drawPackets(ctx, cm, t);
  drawBoard(ctx, cm, t);
  // hero Dot (queue / flights)
  const dst = packetPos(DOT, t);
  let dotDrawn = false;
  const bixP = project(cm, BIX);
  const phone = drawGiantPhone(ctx, cm, t);
  // Bix (billboard)
  let bixInfo = null;
  if (bixP) bixInfo = drawBix(ctx, bixP.x, bixP.y, bixP.s * 2.0 / 300, bixPose(t));
  // Dot before the throw (on the ground, then in Bix's far hand) and after the catch
  if (bixInfo) {
    const dSize = bixInfo.scale * 70;
    if (t < T.pick) { const g = project(cm, [-0.4, 0, 7.0]); if (g) drawDot(ctx, g.x, g.y, dSize, { mood: 0.8, legs: true, t }); dotDrawn = true; }
    else if (t < T.throw) { drawDot(ctx, bixInfo.handF[0], bixInfo.handF[1] + dSize * 0.3, dSize, { mood: 1, t }); dotDrawn = true; }
    else if (t < T.throw + 0.12 && dst == null) { /* in transit to phone top */ }
    if (t >= T.catch) {
      const k = clamp((t - T.catch) / 0.2);
      const from = phone ? [phone.x + phone.w / 2, phone.y + phone.h * 0.3] : bixInfo.handF;
      let hx = lerp(from[0], bixInfo.handN[0] + dSize * 0.55, ease.out(k)), hy = lerp(from[1], bixInfo.handN[1] + dSize * 0.25, ease.out(k)) - Math.sin(k * Math.PI) * 60 * bixInfo.scale;
      const hop = clamp((t - (T.catch + 0.42)) / 0.35);
      if (hop > 0 && phone) { // hops onto the phone and sits, so Bix's hands are free
        const tx = phone.x + phone.w * 0.62, ty = phone.y + 2;
        hx = lerp(hx, tx, ease.inOut(hop)); hy = lerp(hy, ty, ease.inOut(hop)) - Math.sin(hop * Math.PI) * 90 * bixInfo.scale;
      }
      drawDot(ctx, hx, hy, dSize, { mood: 1, eye: 1, legs: hop >= 1, t }); dotDrawn = true;
    }
  }
  if (!dotDrawn && dst) {
    const pr = project(cm, dst.pos);
    if (pr) {
      const size = clamp(1.7 * pr.s, 22, 110); // capped: never balloons when the path passes near the lens
      const ring = (0.5 + 0.5 * Math.sin(t * TAU * 1.6));
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = hexA(C.blueSoft, 0.35 + 0.25 * ring); ctx.beginPath(); ctx.arc(pr.x, pr.y - size * 0.4, size * 1.3, 0, TAU); ctx.fill(); ctx.restore();
      drawDot(ctx, pr.x, pr.y + size * 0.1, size, { mood: dst.state === 'wait' ? -0.8 : 0.6, eye: dst.state === 'wait' ? 0.6 : 1, legs: dst.state === 'wait', tap: true, t });
      // "your data" tag in the wide shot
      const tagA = env(t, 7.4, 7.8) * (1 - env(t, 10.95, 11.2));
      if (tagA > 0) {
        ctx.save(); ctx.globalAlpha = tagA; ctx.font = '34px ESemi'; const tw = ctx.measureText('your data').width;
        const tx = pr.x + size * 1.4 + 20, ty = pr.y - size * 1.6;
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(pr.x + size * 0.6, pr.y - size * 0.8); ctx.lineTo(tx, ty + 10); ctx.stroke();
        roundRect(ctx, tx, ty - 34, tw + 30, 52, 26); ctx.fillStyle = C.ink; ctx.fill();
        ctx.fillStyle = C.charcoal; ctx.textAlign = 'left'; ctx.fillText('your data', tx + 15, ty + 3); ctx.restore();
      }
    }
  }
  // handheld meter (shot B)
  if (bixInfo) {
    const ma = env(t, T.meter, T.meter + 0.25) * (1 - env(t, 6.3, 6.6));
    if (ma > 0) drawMeter(ctx, bixInfo.handF[0] - 40 * bixInfo.scale, bixInfo.handF[1] + 40 * bixInfo.scale, bixInfo.scale * 1.15 * ease.outBack(clamp((t - T.meter) / 0.3)), t, ma);
  }
  drawPlaque(ctx, cm, t);
  // vignette
  const vg = ctx.createRadialGradient(540, 980, 520, 540, 980, 1300); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  drawCaptions(ctx, t);
  // labels: honest framing + small signature
  ctx.textAlign = 'left'; ctx.font = '24px EMed'; ctx.fillStyle = hexA(C.ink, 0.38); ctx.fillText('Illustrative animation', 48, 1868);
  const sg = env(t, T.sig, T.sig + 0.5);
  if (sg > 0 && assets.icon) {
    ctx.save(); ctx.globalAlpha = 0.62 * sg;
    roundRect(ctx, 760, 1830, 48, 48, 12); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 760, 1830, 48, 48); ctx.restore();
    ctx.fillStyle = C.ink; ctx.font = '32px ESemi'; ctx.fillText('Meshline', 820, 1866); ctx.restore();
  }
}

// ------------------------------------------------------------------ cue sheet for audio (same timebase)
export function cues() {
  const ev = []; const add = (t, type, gain = 1, pan = 0, extra = {}) => ev.push({ t: +t.toFixed(4), type, gain, pan, ...extra });
  for (let i = 0; i < 4; i++) add(T.barsOn[0] + (i + 0.5) * (T.barsOn[1] - T.barsOn[0]) / 4, 'bar', 0.55, 0, { step: i });
  add(T.proud[0] + 0.05, 'flex', 0.6);
  add(T.pick, 'pickup', 0.5, -0.2); add(1.08, 'windup', 0.5, -0.2); add(T.throw, 'throw', 0.9, 0.1);
  T.taps.forEach(t => add(t, 'tap', 0.7, 0.25));
  add(1.4, 'spinner', 0.35, 0.25, { dur: 1.2 });
  add(T.scratch, 'confused', 0.5);
  add(T.shotB[0], 'whoosh', 0.45);
  [3.0, 3.5, 4.0].forEach(t => add(t, 'crestPing', 0.5));
  add(T.meter, 'meterPop', 0.6, 0.2); add(T.meter + 0.3, 'needle', 0.35, 0.2, { dur: 1.6 });
  add(T.shrug, 'shrug', 0.5);
  add(T.shotC[0], 'crane', 0.7, 0, { dur: T.shotC[1] - T.shotC[0] });
  // phones joining: soft ticks, sampled (not one per phone, to avoid mush)
  const joins = CROWD.filter(c => c.act > 0).map(c => c.act).sort((a, b) => a - b);
  joins.forEach((t, i) => { if (i % 4 === 0) add(t, 'join', 0.12 + 0.18 * (i / joins.length), (hash(i) - 0.5) * 1.2); });
  // queue service: gate clicks (shared capacity, steady rate) during the wide shot
  for (const p of PK) if (p.serve > 6.8 && p.serve < 11.1) add(p.serve, 'gate', p.dot ? 0.9 : 0.16, 0.3, { hero: !!p.dot });
  add(7.0, 'crowdBed', 0.6, 0, { dur: 4.4 });
  add(T.shotD[0], 'whoosh', 0.5);
  add(T.dotBack[0], 'zipBack', 0.8);
  add(T.load, 'load', 0.8, 0.2); add(T.catch, 'catch', 0.7);
  add(T.plaque, 'plaque', 0.8); add(T.sig, 'sig', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, fps: FPS, events: ev, dotServe: DOT.serve, queueAt: [0, 2.15, 6.6, 9, 11].map(t => [t, +queueLen(t).toFixed(1)]) };
}
