// Meshline 10s test, S14 Transit Map (art direction only): a printed network on charcoal stock.
// Pen tips ink octilinear routes; data tokens queue at one busy cell-tower station. Pure function of t.
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect } from '../../../../education/pilot-01/src/core.mjs';

const G = 60;                         // grid step in sheet px
const TOWER = [9, 10];                // station positions in G
const YOU = [9, 22.5];
// feeder routes from phone stations to the tower: octilinear polylines (G)
const ROUTES = [
  { pts: [YOU, [9, 14], [9, 10]], t0: 0.25, dur: 1.6, you: true },
  { pts: [[2, 20], [2, 15], [7, 10], [9, 10]], t0: 3.0, dur: 1.2 },
  { pts: [[16, 21], [16, 15], [11, 10], [9, 10]], t0: 3.15, dur: 1.2 },
  { pts: [[1, 8], [5, 8], [7, 10], [9, 10]], t0: 3.35, dur: 1.1 },
  { pts: [[17, 6], [13, 6], [11, 8], [9, 10]], t0: 3.5, dur: 1.1 },
  { pts: [[4, 25], [4, 19], [8, 15], [8.6, 10.6]], t0: 3.7, dur: 1.2 },
  { pts: [[14, 26], [14, 19], [10, 15], [9.4, 10.6]], t0: 3.85, dur: 1.2 },
  { pts: [[3, 3], [6, 3], [9, 6], [9, 10]], t0: 4.0, dur: 1.0 },
  { pts: [[15, 1.5], [12, 1.5], [9, 4.5], [9, 10]], t0: 4.15, dur: 1.0 },
];
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
function at(pts, d) { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; }
ROUTES.forEach(r => { r.L = len(r.pts); });

// camera: sheet-space centre (G) + zoom; one push toward the tower in beat 3
function camAt(t) {
  const k = ease.inOut(inv(5.0, 8.2, t));
  return { cx: lerp(9, 9, k), cy: lerp(13.6, 11.6, k), z: lerp(1.0, 1.65, k), tilt: lerp(0.0, 0.06, k) };
}

// token queue at the tower: shared capacity serves one token per 0.42 s through the gate
const SERVE = 0.42;
function queueTokens(t) {
  const tokens = [];
  if (t < 4.6) return tokens;
  const arrived = Math.min(26, Math.floor((t - 4.6) * 7.5) + 6);      // demand keeps arriving (illustrative)
  const served = Math.max(0, Math.floor((t - 5.2) / SERVE));
  for (let i = served; i < arrived; i++) tokens.push({ q: i - served, you: i === 14, frac: ((t - 5.2) / SERVE) % 1 });
  return tokens;
}

function paper(ctx) {
  ctx.fillStyle = '#0B0F0D'; ctx.fillRect(-2000, -2000, 6000, 6000);              // table
  const sx = 0, sy = 0, sw = 18 * G, sh = 28 * G;
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, sx + 14, sy + 18, sw, sh, 10); ctx.fill();   // sheet shadow
  ctx.fillStyle = C.bg; roundRect(ctx, sx, sy, sw, sh, 10); ctx.fill();
  // paper tooth: deterministic speckle + fibres
  for (let i = 0; i < 2200; i++) { ctx.fillStyle = hexA(C.ink, 0.012 + 0.02 * hash(i * 3.7)); ctx.fillRect(hash(i * 1.3) * sw, hash(i * 2.9) * sh, 2, 2); }
  ctx.strokeStyle = hexA(C.blueSoft, 0.05); ctx.lineWidth = 1;
  for (let x = 1; x < 18; x++) { ctx.beginPath(); ctx.moveTo(x * G, 0); ctx.lineTo(x * G, sh); ctx.stroke(); }
  for (let y = 1; y < 28; y++) { ctx.beginPath(); ctx.moveTo(0, y * G); ctx.lineTo(sw, y * G); ctx.stroke(); }
  // printed cartouche
  ctx.fillStyle = C.blue; ctx.fillRect(0.6 * G, 26.2 * G, 0.12 * G, 1.1 * G);
  ctx.fillStyle = C.ink; ctx.font = '30px EBold'; ctx.textAlign = 'left'; ctx.fillText('Cell capacity, one tower', 0.95 * G, 26.75 * G);
  ctx.fillStyle = C.muted; ctx.font = '22px EMed'; ctx.fillText('Illustrative map · not real network data', 0.95 * G, 27.2 * G);
}

function drawRoute(ctx, r, t) {
  const k = ease.inOut(clamp((t - r.t0) / r.dur));
  if (k <= 0) return null;
  const d = k * r.L;
  // ink stroke up to the pen tip (with a paper shadow for depth)
  const path = () => { ctx.beginPath(); ctx.moveTo(r.pts[0][0] * G, r.pts[0][1] * G); let rem = d; for (let i = 1; i < r.pts.length; i++) { const L = Math.hypot(r.pts[i][0] - r.pts[i - 1][0], r.pts[i][1] - r.pts[i - 1][1]); if (rem >= L) { ctx.lineTo(r.pts[i][0] * G, r.pts[i][1] * G); rem -= L; } else { const p = at(r.pts, d); ctx.lineTo(p[0] * G, p[1] * G); break; } } };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  path(); ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = (r.you ? 0.22 : 0.15) * G; ctx.save(); ctx.translate(3, 5); ctx.stroke(); ctx.restore();
  path(); ctx.strokeStyle = r.you ? C.blue : '#2E46C8'; ctx.lineWidth = (r.you ? 0.22 : 0.15) * G; ctx.stroke();
  // origin station (a phone): white stop
  stop(ctx, r.pts[0], r.you ? 0.2 : 0.12, t - r.t0);
  if (k < 1) { // pen tip: white core, blue ring, soft halo
    const p = at(r.pts, d);
    const g = ctx.createRadialGradient(p[0] * G, p[1] * G, 0, p[0] * G, p[1] * G, 0.8 * G); g.addColorStop(0, hexA(C.blueSoft, 0.45)); g.addColorStop(1, hexA(C.blueSoft, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.8 * G, 0, TAU); ctx.fill();
    ctx.fillStyle = C.ink; ctx.strokeStyle = C.blue; ctx.lineWidth = 0.05 * G; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.11 * G, 0, TAU); ctx.fill(); ctx.stroke();
    return p;
  }
  return null;
}

function stop(ctx, p, r, age) {
  if (age < 0) return;
  const s = age < 0.28 ? 0.6 + 0.5 * ease.outBack(age / 0.28) : 1;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(p[0] * G + 2, p[1] * G + 4, r * G * s, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.blue; ctx.lineWidth = 0.05 * G; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, r * G * s, 0, TAU); ctx.fill(); ctx.stroke();
  if (age < 0.6) { ctx.strokeStyle = hexA(C.blueSoft, 1 - age / 0.6); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, (0.1 + 0.32 * age / 0.6) * G * 2, 0, TAU); ctx.stroke(); }
}

function tower(ctx, t) {
  const [x, y] = TOWER, busy = env(t, 4.4, 5.4);
  // interchange capsule (stadium), lands with weight when the second route arrives
  const age = t - 4.2;
  const s = age < 0 ? 1 : age < 0.4 ? 1 + 1.4 * (1 - ease.out(age / 0.4)) : 1;
  const w = 4.2 * G * s, h = 1.3 * G * s;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x * G - w / 2 + 4, y * G - h / 2 + 7, w, h, h / 2); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x * G - w / 2, y * G - h / 2, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = busy > 0.5 ? C.coral : C.charcoal; ctx.lineWidth = 0.07 * G; ctx.stroke();
  // gate: one lane of shared capacity, blinks per served token
  const blink = t > 5.2 ? Math.max(0, 1 - (((t - 5.2) / SERVE) % 1) * 3) : 0;
  ctx.fillStyle = blink > 0 ? C.blue : hexA(C.blue, 0.4); ctx.beginPath(); ctx.arc(x * G, y * G - h / 2 - 0.25 * G, 0.16 * G * (1 + 0.5 * blink), 0, TAU); ctx.fill();
  // printed label on the sheet
  ctx.fillStyle = C.charcoal; ctx.font = `${0.6 * G}px EBold`; ctx.textAlign = 'center'; ctx.fillText('CELL TOWER', x * G, y * G + 0.21 * G);
  if (busy > 0) { ctx.globalAlpha = busy; ctx.textAlign = 'center'; ctx.font = `${0.46 * G}px ESemi`; const bw = ctx.measureText('busy · shared capacity').width + 0.5 * G; ctx.fillStyle = 'rgba(8,12,10,0.9)'; roundRect(ctx, x * G - bw / 2, y * G - 1.62 * G, bw, 0.68 * G, 0.34 * G); ctx.fill(); ctx.fillStyle = C.coral; ctx.fillText('busy · shared capacity', x * G, y * G - 1.13 * G); ctx.globalAlpha = 1; }
}

function youStation(ctx, t) {
  const [x, y] = YOU;
  ctx.fillStyle = C.ink; ctx.font = `${0.62 * G}px EBold`; ctx.textAlign = 'left'; ctx.fillText('YOUR PHONE', x * G + 0.5 * G, y * G + 0.2 * G);
  // printed signal bars next to the station: all four inked = full bars
  const lit = clamp(inv(0.2, 0.9, t) * 4);
  for (let i = 0; i < 4; i++) { const bh = (0.3 + i * 0.24) * G; ctx.fillStyle = lit > i ? C.ink : hexA(C.ink, 0.15); roundRect(ctx, x * G + 0.55 * G + i * 0.42 * G, y * G + 1.55 * G - bh, 0.3 * G, bh, 4); ctx.fill(); }
  ctx.fillStyle = C.blueSoft; ctx.font = `${0.5 * G}px ESemi`; ctx.fillText('signal: full', x * G + 2.4 * G, y * G + 1.45 * G);
}

function tokens(ctx, t) {
  // queue along the "you" route below the tower: tokens step forward as the gate serves one at a time
  for (const tk of queueTokens(t)) {
    const slide = tk.q === 0 ? 0 : 0;
    const d = 0.75 + tk.q * 0.48 - (t > 5.2 ? ease.inOut(Math.min(1, tk.frac * 2.2)) * 0.48 : 0) + slide;
    const yy = TOWER[1] + 0.5 + d, xx = TOWER[0];
    if (yy > YOU[1] - 0.4) continue;
    const s = (tk.you ? 0.42 : 0.3) * G;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, xx * G - s / 2 + 3, yy * G - s / 2 + 5, s, s, 6); ctx.fill();
    ctx.fillStyle = tk.you ? C.ink : '#C9D0E2'; roundRect(ctx, xx * G - s / 2, yy * G - s / 2, s, s, 6); ctx.fill();
    ctx.fillStyle = C.blue; ctx.fillRect(xx * G - s / 2, yy * G + s * 0.08, s, s * 0.16);
    if (tk.you) {
      ctx.strokeStyle = C.coral; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(xx * G, yy * G, s * 0.95 + 4 * Math.sin(t * 8), 0, TAU); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `${0.46 * G}px ESemi`; ctx.textAlign = 'left'; ctx.fillText('your data · waiting', xx * G + 0.6 * G, yy * G + 0.15 * G);
    }
  }
}

const CAPS = [
  { a: 0.3, b: 2.35, l: ['Full bars,', 'but nothing loads?'] },
  { a: 2.55, b: 4.9, l: ['Signal strength', "isn't spare capacity"] },
  { a: 5.1, b: 9.95, l: ['Many phones share', 'the tower, so data waits'] },
];
function captions(ctx, t) {
  for (const c of CAPS) {
    if (t < c.a || t > c.b) continue;
    const a = clamp((t - c.a) / 0.18) * (1 - clamp((t - (c.b - 0.15)) / 0.15));
    ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
    ctx.font = '64px EBold';
    const w = Math.max(...c.l.map(s => ctx.measureText(s).width)) + 70;
    roundRect(ctx, 540 - w / 2, 330, w, 168, 26); ctx.fillStyle = 'rgba(8,12,10,0.86)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.4); ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.ink; c.l.forEach((s, i) => ctx.fillText(s, 540, 398 + i * 74));
    ctx.restore();
  }
}

export function drawFrame(ctx, t, assets) {
  // stop-motion feel: source frames on 15 fps steps for the paper jitter, motion at 30
  const cam = camAt(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0B0F0D'; ctx.fillRect(0, 0, W, H);
  const sc = 0.98 * cam.z;
  ctx.setTransform(sc, 0, cam.tilt * sc, sc, 540 - cam.cx * G * sc - cam.tilt * sc * cam.cy * G, 1080 - cam.cy * G * sc);
  paper(ctx);
  for (const r of ROUTES) if (!r.you) drawRoute(ctx, r, t);
  drawRoute(ctx, ROUTES[0], t);
  tokens(ctx, t);
  tower(ctx, t);
  youStation(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1000, 560, 540, 1000, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  captions(ctx, t);
  if (assets.icon && t > 8.0) { const a = env(t, 8.0, 8.5) * 0.6; ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 790, 1820, 42, 42, 10); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 790, 1820, 42, 42); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '28px ESemi'; ctx.textAlign = 'left'; ctx.fillText('Meshline', 842, 1851); ctx.restore(); }
}

export function cues() {
  const ev = []; const add = (t, type, g = 1) => ev.push({ t: +t.toFixed(3), type, gain: g });
  for (const r of ROUTES) { add(r.t0, 'pen', r.you ? 0.8 : 0.35); add(r.t0 + r.dur, 'stop', r.you ? 0.7 : 0.3); }
  [0.35, 0.5, 0.65, 0.8].forEach((t, i) => add(t, 'bar' + i, 0.5));
  add(4.2, 'land', 0.9);
  for (let t = 5.2; t < 9.9; t += SERVE) add(t, 'gate', 0.35);
  add(8.0, 'sig', 0.3);
  return { duration: 10, events: ev.sort((a, b) => a.t - b.t) };
}
