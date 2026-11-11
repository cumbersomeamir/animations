// Meshline production 30s, batch 2026-11-11-english-12: "Why concrete walls shrink Bluetooth range".
// Same Transit-Map world as english-06..11 (charcoal printed sheet, electric-blue ink, white stations, label halos,
// paper veils, Inter labels, screen-space caption plate + one screen-space instrument). A floor plan: two phones at
// the same distance; a concrete wall drops between them and the link fails; drywall barely matters; a 2.4 GHz wave is
// absorbed and reflected; the measured loss (about 30 dB through ~20 cm at 2 GHz, NIST IR 6055) equals ~30x the
// distance in open air (ITU-R P.525 free-space law); a relay in the doorway turns one blocked hop into two clear hops.
// Generic radio behaviour only; no Meshline transport, range or relay claims (listing: "nearby messaging, even offline").
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000, CAP_CX = 500;                                      // captions centred in x 100..900 (2026-11-11 brief)
const GREY = '#B5BDB8';

// ------------------------------------------------------------------ map (G units)
const A = [4.6, 15.2], B = [13.4, 15.2], R = [9.0, 19.6], LINK_Y = 15.2;
const WALL = { x: 9.0, top: 10.6, door0: 18.7, door1: 20.5, bot: 22.4 };
const ROOM = { x0: 1.6, x1: 16.4, y0: 10.6, y1: 22.4 };
const RULER = { y: 25.9, x0: 2.6, u: 0.4 };
const T = {
  hop0: [0.0, 0.85], slam: 1.2, drop: [2.0, 2.4], why: 3.2,
  dry: [4.15, 4.6], hop1: [4.75, 5.55], back: [6.75, 7.1],
  wave: [7.4, 9.3], ghz: 7.6, absorb: 9.93, reflect: 10.95, through: 11.5,
  db: 14.5, cm: 16.36, ruler: 17.95, count: [19.3, 20.6],
  relay: 21.44, hopA: [23.45, 23.95], hopB: [23.98, 24.45], direct: 24.7, cta: 26.29,
};
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const DIRECT = [[A[0] + 0.75, LINK_Y], [B[0] - 0.75, LINK_Y]];
const HOP_A = [[A[0] + 0.55, A[1] + 0.55], [R[0] - 0.55, R[1] - 0.55]], HOP_B = [[R[0] + 0.55, R[1] - 0.55], [B[0] - 0.55, B[1] + 0.55]];

// wall state: present (slam) and material (0 = drywall, 1 = concrete)
const wallIn = t => (t < T.slam - 0.25 ? 0 : ease.outBack(clamp((t - T.slam + 0.25) / 0.3)));
const concrete = t => 1 - env(t, T.dry[0], T.dry[1]) + env(t, T.back[0], T.back[1]);
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);                           // CTA: the map steps back behind a paper veil

// ------------------------------------------------------------------ camera (one purposeful move per beat)
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 15.7, z: 1.18 }], [3.9, { x: 9.0, y: 15.6, z: 1.22 }],          // hook: same distance, wall drops in
    [4.4, { x: 9.0, y: 15.6, z: 1.2 }], [6.8, { x: 9.0, y: 15.6, z: 1.22 }],          // drywall
    [7.3, { x: 7.3, y: 15.0, z: 1.6 }], [12.9, { x: 7.4, y: 15.0, z: 1.66 }],         // the wave meets concrete
    [13.4, { x: 9.0, y: 15.0, z: 1.48 }], [17.5, { x: 9.0, y: 15.0, z: 1.52 }],       // the measured loss
    [18.2, { x: 6.3, y: 25.5, z: 1.4 }], [19.3, { x: 6.4, y: 25.5, z: 1.42 }],      // open-air equivalent: close on 1x,
    [20.6, { x: 9.0, y: 25.2, z: 1.0 }], [21.0, { x: 9.0, y: 25.2, z: 1.01 }],        // then pull out as it counts to 30x
    [21.6, { x: 9.0, y: 16.9, z: 1.08 }], [26.0, { x: 9.0, y: 16.9, z: 1.1 }],        // relay in the doorway
    [30, { x: 9.0, y: 16.9, z: 1.14 }],
  ]);
}

// ------------------------------------------------------------------ cached sheet (same stock/tooth/grid/light as batch-02)
let SHEET_IMG = null;
function sheetImage() {
  if (SHEET_IMG) return SHEET_IMG;
  const s = 2, cv = createCanvas(SHEET.w * G * s, SHEET.h * G * s), c = cv.getContext('2d'); c.scale(s, s);
  const w = SHEET.w * G, h = SHEET.h * G;
  c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { c.fillStyle = hexA(C.ink, 0.01 + 0.025 * hash(i * 3.7)); c.fillRect(hash(i * 1.3) * w, hash(i * 2.9) * h, 1.5, 1.5); }
  c.strokeStyle = hexA(C.ink, 0.03); c.lineWidth = 0.8;
  for (let i = 0; i < 900; i++) { const x = hash(i * 5.1) * w, y = hash(i * 7.3) * h, a = hash(i) * TAU, l = 1.5 + hash(i * 2.2) * 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  c.strokeStyle = hexA(C.blueSoft, 0.05); c.lineWidth = 1;
  for (let x = 1; x < SHEET.w; x++) { c.beginPath(); c.moveTo(x * G, 0); c.lineTo(x * G, h); c.stroke(); }
  for (let y = 1; y < SHEET.h; y++) { c.beginPath(); c.moveTo(0, y * G); c.lineTo(w, y * G); c.stroke(); }
  const lg = c.createLinearGradient(0, 0, w, h); lg.addColorStop(0, 'rgba(247,247,242,0.05)'); lg.addColorStop(1, 'rgba(0,0,0,0.12)'); c.fillStyle = lg; c.fillRect(0, 0, w, h);
  SHEET_IMG = cv; return cv;
}

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02 / english-06..11)
function strokePath(ctx, pts, d, width, col, shadow = true, dash = null) {
  const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0] * G, pts[0][1] * G); let rem = d; for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (rem >= L) { ctx.lineTo(pts[i][0] * G, pts[i][1] * G); rem -= L; } else { const p = at(pts, d); ctx.lineTo(p[0] * G, p[1] * G); break; } } };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (dash) ctx.setLineDash(dash);
  if (shadow) { path(); ctx.save(); ctx.translate(3, 5); ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = width; ctx.stroke(); ctx.restore(); }
  path(); ctx.strokeStyle = col; ctx.lineWidth = width; ctx.stroke(); ctx.setLineDash([]);
}
function penTip(ctx, p, col = C.blueSoft) {
  const g = ctx.createRadialGradient(p[0] * G, p[1] * G, 0, p[0] * G, p[1] * G, 0.8 * G); g.addColorStop(0, hexA(col, 0.45)); g.addColorStop(1, hexA(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.8 * G, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink; ctx.strokeStyle = C.blue; ctx.lineWidth = 0.05 * G; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, 0.11 * G, 0, TAU); ctx.fill(); ctx.stroke();
}
function label(ctx, txt, x, y, size, col = C.ink, align = 'left', font = 'EBold', alpha = 1) {
  if (alpha <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${size * G}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.lineWidth = 0.1 * G; ctx.strokeStyle = hexA(C.bg, 0.92); ctx.strokeText(txt, x * G, y * G); ctx.fillStyle = col; ctx.fillText(txt, x * G, y * G); ctx.restore();
}
function ring(ctx, p, age, col = C.blueSoft, maxR = 0.6) { if (age < 0 || age > 0.6) return; ctx.strokeStyle = hexA(col, 1 - age / 0.6); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p[0] * G, p[1] * G, (0.2 + maxR * age / 0.6) * G, 0, TAU); ctx.stroke(); }
function cross(ctx, p, s, a = 1) {
  if (a <= 0) return; const x = p[0] * G, y = p[1] * G, r = s * G;
  ctx.save(); ctx.globalAlpha *= a; ctx.lineWidth = 0.1 * G; ctx.lineCap = 'round'; ctx.strokeStyle = C.coral;
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke(); ctx.restore();
}
function check(ctx, x, y, s, col, a = 1) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - s * 0.45, y); ctx.lineTo(x - s * 0.1, y + s * 0.35); ctx.lineTo(x + s * 0.5, y - s * 0.35); ctx.stroke(); ctx.restore();
}
function fizz(ctx, p, t, t0) {
  const k = t - t0; if (k < 0 || k > 0.6) return;
  ctx.strokeStyle = hexA(C.coral, 1 - k / 0.6); ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + hash(i + t0) * 0.6, d0 = (0.2 + k * 0.9) * G, d1 = d0 + 0.18 * G; ctx.beginPath(); ctx.moveTo(p[0] * G + Math.cos(a) * d0, p[1] * G + Math.sin(a) * d0); ctx.lineTo(p[0] * G + Math.cos(a) * d1, p[1] * G + Math.sin(a) * d1); ctx.stroke(); }
}
function envelope(ctx, x, y, s, a = 1, flap = C.blue) {                    // message token
  if (a <= 0) return; const w = s, h = s * 0.68;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, x - w / 2 + 3, y - h / 2 + 5, w, h, s * 0.08); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, s * 0.08); ctx.fill();
  ctx.strokeStyle = flap; ctx.lineWidth = Math.max(2, s * 0.08); ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - w / 2 + s * 0.08, y - h / 2 + s * 0.08); ctx.lineTo(x, y + h * 0.08); ctx.lineTo(x + w / 2 - s * 0.08, y - h / 2 + s * 0.08); ctx.stroke();
  ctx.restore();
}
function phone(ctx, p, glyph, s = 2.0, a = 1) {
  if (a <= 0) return; const x = p[0] * G, y = p[1] * G, w = 0.62 * G * s, h = 1.04 * G * s;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G * s); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G * s, y - h / 2 + 0.12 * G * s, w - 0.14 * G * s, h - 0.24 * G * s, 0.05 * G); ctx.fill();
  if (glyph === 'env' || glyph === 'ok') envelope(ctx, x, y - 0.1 * G * s, 0.36 * G * s, 1);
  if (glyph === 'ok') check(ctx, x, y + 0.3 * G * s, 0.22 * G * s, C.blueSoft);
  if (glyph === 'x') cross(ctx, [x / G, (y + 0.3 * G * s) / G], 0.08 * s, 1);
  ctx.restore();
}

// ------------------------------------------------------------------ the wall
function drawWall(ctx, t) {
  const k = wallIn(t); if (k <= 0) return;
  const m = concrete(t), th = lerp(0.22, 0.7, m), x0 = (WALL.x - th / 2) * G, wpx = th * G;
  const drop = (1 - Math.min(1, k)) * 2.2;                                   // slams down from above
  const segs = [[WALL.top - drop, WALL.door0 - drop], [WALL.door1 - drop, WALL.bot - drop]];
  ctx.save(); ctx.globalAlpha *= clamp(k * 1.5);
  for (const [y0, y1] of segs) {
    const Y0 = y0 * G, Hh = (y1 - y0) * G;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x0 + 4, Y0 + 6, wpx, Hh);
    ctx.fillStyle = m > 0.5 ? '#3A4440' : '#2A3330'; ctx.fillRect(x0, Y0, wpx, Hh);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, Y0, wpx, Hh); ctx.clip(); ctx.strokeStyle = hexA(C.ink, 0.38 * m); ctx.lineWidth = 2;
    for (let yy = Y0 - wpx; yy < Y0 + Hh + wpx; yy += 0.28 * G) { ctx.beginPath(); ctx.moveTo(x0, yy + wpx); ctx.lineTo(x0 + wpx, yy); ctx.stroke(); }
    for (let i = 0; i < 26 * m; i++) { ctx.fillStyle = hexA(C.ink, 0.25); ctx.beginPath(); ctx.arc(x0 + hash(i * 3.3 + y0) * wpx, Y0 + hash(i * 7.1 + y0) * Hh, 1.6, 0, TAU); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = hexA(C.ink, lerp(0.45, 0.85, m)); ctx.lineWidth = 2.5; if (m < 0.5) ctx.setLineDash([8, 6]); ctx.strokeRect(x0, Y0, wpx, Hh); ctx.setLineDash([]);
  }
  ctx.restore();
  if (t > T.slam && t < T.slam + 0.7) {                                      // dust where it lands
    const q = (t - T.slam) / 0.7;
    for (let i = 0; i < 10; i++) { const dx = (hash(i * 2.1) - 0.5) * 1.6, r = (0.08 + 0.12 * hash(i)) * G * (1 + q); ctx.fillStyle = hexA(C.ink, 0.25 * (1 - q)); ctx.beginPath(); ctx.arc((WALL.x + dx * (0.5 + q)) * G, (WALL.bot - 0.1 - q * 0.4 * hash(i * 5)) * G, r, 0, TAU); ctx.fill(); }
  }
  // absorption glow inside the wall (l3)
  const ab = env(t, T.absorb, T.absorb + 0.3) * (1 - env(t, 12.8, 13.2));
  if (ab > 0) { const g = ctx.createRadialGradient(WALL.x * G, LINK_Y * G, 0, WALL.x * G, LINK_Y * G, 1.1 * G); g.addColorStop(0, hexA(C.coral, 0.55 * ab)); g.addColorStop(1, hexA(C.coral, 0)); ctx.fillStyle = g; ctx.fillRect((WALL.x - 1.1) * G, (LINK_Y - 1.1) * G, 2.2 * G, 2.2 * G); }
}

// a 2.4 GHz wave packet: incident from the left phone; at the wall part is reflected, the rest crosses, much weaker
function wave(ctx, pts0, x0, x1, amp, phase, col, a, width = 4) {
  if (a <= 0.01 || x1 <= x0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = col; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.beginPath();
  for (let x = x0; x <= x1 + 1e-6; x += 0.04) { const [px, py, dx, dy] = pts0(x); const s = Math.sin((x * TAU) / 0.5 + phase) * amp; const X = (px - dy * s) * G, Y = (py + dx * s) * G; if (x === x0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); }
  ctx.stroke(); ctx.restore();
}
function drawWave(ctx, t) {
  if (t < T.wave[0] || t > 13.3) return;
  const a = clamp((t - T.wave[0]) / 0.2) * (1 - env(t, 12.9, 13.3)), head = lerp(A[0] + 0.8, WALL.x - 0.35, ease.out(inv(...T.wave, t))), ph = -t * 9;
  const horiz = x => [x, LINK_Y, 1, 0];
  wave(ctx, horiz, Math.max(A[0] + 0.8, head - 3.2), head, 0.32, ph, C.blueSoft, a, 5);
  // reflected: back up and to the left from the wall face
  const rk = ease.out(inv(T.reflect - 0.1, T.reflect + 0.9, t));
  if (rk > 0) { const ang = Math.PI * 1.22, ux = Math.cos(ang), uy = Math.sin(ang), O = [WALL.x - 0.4, LINK_Y]; const refl = d => [O[0] + ux * d, O[1] + uy * d, ux, uy]; wave(ctx, refl, Math.max(0, rk * 3.4 - 2.2), rk * 3.4, 0.24, ph, C.blueSoft, a * 0.85, 4); }
  // transmitted: what gets through is faint
  const tk = ease.out(inv(T.through - 0.3, T.through + 1.0, t));
  if (tk > 0) wave(ctx, horiz, WALL.x + 0.4, WALL.x + 0.4 + tk * 3.4, 0.07, ph, C.blueSoft, a * 0.55, 2.5);
}

// ------------------------------------------------------------------ beats
function drawScene(ctx, t) {
  const postWall = [];
  // floor plan (thin outer walls)
  ctx.save(); ctx.strokeStyle = hexA(C.ink, 0.3); ctx.lineWidth = 0.07 * G; ctx.strokeRect(ROOM.x0 * G, ROOM.y0 * G, (ROOM.x1 - ROOM.x0) * G, (ROOM.y1 - ROOM.y0) * G); ctx.restore();
  // hook: same distance (dimension line through the doorway level)
  const dimA = 1 - env(t, 3.9, 4.3);                                         // on screen from frame 1
  if (dimA > 0) {
    ctx.save(); ctx.globalAlpha *= dimA; ctx.strokeStyle = hexA(C.ink, 0.7); ctx.lineWidth = 3; const y = 19.6 * G;
    ctx.beginPath(); ctx.moveTo(A[0] * G, y); ctx.lineTo(B[0] * G, y); for (const x of [A[0], B[0]]) { ctx.moveTo(x * G, y - 0.3 * G); ctx.lineTo(x * G, y + 0.3 * G); } ctx.stroke(); ctx.restore();
    label(ctx, 'same distance', 6.7, 18.95, 0.5, C.ink, 'center', 'EBold', dimA);
  }
  // the direct link A ↔ B
  const conc = concrete(t) > 0.5 && wallIn(t) > 0.5;
  const linkA = (1 - env(t, T.wave[0] - 0.4, T.wave[0])) + env(t, 21.0, 21.4) * (1 - env(t, T.cta - 0.1, T.cta + 0.4));
  if (linkA > 0) {
    const broken = (t > T.drop[0] && t < T.dry[1]) || t > 20.0;
    ctx.save(); ctx.globalAlpha *= linkA * (t > 20 ? 0.75 : 1);
    if (!broken) strokePath(ctx, DIRECT, len(DIRECT), 0.13 * G, C.blueSoft, true, [14, 9]);
    else { strokePath(ctx, [DIRECT[0], [WALL.x - 0.5, LINK_Y]], WALL.x - 0.5 - DIRECT[0][0], 0.12 * G, hexA(C.coral, 0.8), false, [10, 10]); strokePath(ctx, [[WALL.x + 0.5, LINK_Y], DIRECT[1]], DIRECT[1][0] - WALL.x - 0.5, 0.12 * G, hexA(C.coral, 0.35), false, [10, 10]); }
    ctx.restore();
    const xA = broken ? (t > 20 ? env(t, T.direct, T.direct + 0.25) : env(t, T.drop[1], T.drop[1] + 0.25)) : 0;
    postWall.push(() => cross(ctx, [WALL.x, LINK_Y], 0.3 * (0.6 + 0.4 * ease.outBack(clamp((t - (t > 20 ? T.direct : T.drop[1])) / 0.3))), xA * linkA * (1 - veil(t))));
  }
  // envelopes across the direct link
  const trip = (t0, t1, stopAtWall) => { if (t < t0 || t > t1 + 0.25) return; const q = t0 <= 0 ? lerp(0.3, 1, ease.out(inv(t0, t1, t))) : ease.inOut(inv(t0, t1, t)), xEnd = stopAtWall ? WALL.x - 0.5 : DIRECT[1][0]; const x = lerp(DIRECT[0][0], xEnd, q); envelope(ctx, x * G, LINK_Y * G, 0.62 * G, (t0 <= 0 ? 1 : clamp((t - t0) / 0.12)) * (1 - clamp((t - t1) / 0.2))); };
  trip(...T.hop0, false); trip(T.drop[0], T.drop[1], true); trip(...T.hop1, false);
  fizz(ctx, [WALL.x - 0.5, LINK_Y], t, T.drop[1]);
  label(ctx, '?', WALL.x + 1.2, LINK_Y - 1.6, 1.1 * ease.outBack(clamp((t - T.why) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.why) / 0.2) * (1 - env(t, 4.0, 4.3)));
  // the wall and its material label
  drawWall(ctx, t);
  postWall.forEach(f => f());
  const matA = clamp((t - T.slam - 0.1) / 0.25) * (1 - env(t, 17.6, 18.0));
  const isDry = concrete(t) < 0.5;
  label(ctx, isDry ? 'drywall' : 'concrete', WALL.x, WALL.top - 0.5, 0.6, isDry ? C.blueSoft : C.ink, 'center', 'EBold', matA * (t > 7.2 && t < 13.2 ? 0 : 1));
  // l2: drywall barely matters
  label(ctx, 'barely any loss', WALL.x + 0.6, LINK_Y - 1.65, 0.5, C.blueSoft, 'left', 'EBold', env(t, 5.5, 5.8) * (1 - env(t, 6.6, 6.9)));
  // l3: the wave meets concrete
  drawWave(ctx, t);
  label(ctx, '2.4 GHz', A[0] + 1.0, LINK_Y + 1.1, 0.6, C.blueSoft, 'left', 'EBold', env(t, T.ghz, T.ghz + 0.3) * (1 - env(t, 9.55, 9.85)));
  label(ctx, 'absorbed', WALL.x - 0.6, LINK_Y + 1.45, 0.6, C.coral, 'right', 'EBold', env(t, T.absorb, T.absorb + 0.25) * (1 - env(t, 12.9, 13.2)));
  label(ctx, 'reflected', 5.7, 12.6, 0.6, C.blueSoft, 'left', 'EBold', env(t, T.reflect + 0.2, T.reflect + 0.45) * (1 - env(t, 12.9, 13.2)));
  // l4: the measured loss and the thickness
  const st = env(t, T.db, T.db + 0.2) * (1 - env(t, 17.6, 18.0));
  if (st > 0) {
    const s = 1 + 0.35 * (1 - ease.outBack(clamp((t - T.db) / 0.3)));
    ctx.save(); ctx.globalAlpha *= st; ctx.translate((WALL.x + 2.2) * G, (LINK_Y - 2.4) * G); ctx.rotate(-0.08); ctx.scale(s, s);
    roundRect(ctx, -1.55 * G, -0.55 * G, 3.1 * G, 1.1 * G, 0.15 * G); ctx.strokeStyle = C.coral; ctx.lineWidth = 0.08 * G; ctx.stroke();
    ctx.font = `${0.78 * G}px EDisplay`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.coral; ctx.fillText('−30 dB', 0, 0.04 * G); ctx.restore();
  }
  ring(ctx, [WALL.x + 2.2, LINK_Y - 2.4], t - T.db, C.coral, 1.2);
  const cmA = env(t, T.cm, T.cm + 0.25) * (1 - env(t, 17.6, 18.0));
  if (cmA > 0) {
    const y = (LINK_Y + 1.5) * G, xa = (WALL.x - 0.35) * G, xb = (WALL.x + 0.35) * G;
    ctx.save(); ctx.globalAlpha *= cmA; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xa - 0.5 * G, y); ctx.lineTo(xb + 0.5 * G, y);
    for (const x of [xa, xb]) { ctx.moveTo(x, y - 0.25 * G); ctx.lineTo(x, y + 0.25 * G); } ctx.stroke(); ctx.restore();
    label(ctx, '20 cm', WALL.x, LINK_Y + 2.15, 0.6, C.ink, 'center', 'EBold', cmA);
  }
  // l5: the open-air equivalent, on its own strip below the plan
  const ru = env(t, T.ruler, T.ruler + 0.4) * (1 - env(t, 21.0, 21.4));
  if (ru > 0) {
    const n = 1 + 29 * ease.inOut(inv(...T.count, t)), xe = RULER.x0 + n * RULER.u, y = RULER.y;
    ctx.save(); ctx.globalAlpha *= ru;
    label(ctx, 'open air', RULER.x0 - 0.6, y - 1.7, 0.7, GREY, 'left', 'EBold', 1);
    strokePath(ctx, [[RULER.x0, y], [xe, y]], xe - RULER.x0, 0.16 * G, C.blueSoft, true, [14, 9]);
    ctx.strokeStyle = hexA(C.ink, 0.75); ctx.lineWidth = 3;
    for (let i = 0; i <= Math.floor(n + 1e-6); i++) { const x = (RULER.x0 + i * RULER.u) * G, hh = i % 5 === 0 ? 0.5 : 0.28; ctx.beginPath(); ctx.moveTo(x, (y + 0.5) * G); ctx.lineTo(x, (y + 0.5 + hh) * G); ctx.stroke(); }
    ctx.restore();
    phone(ctx, [RULER.x0 - 0.6, y], 'none', 1.5, ru); phone(ctx, [xe + 0.6, y], 'none', 1.5, ru);
    label(ctx, '1×', RULER.x0 + RULER.u / 2, y + 1.6, 0.6, C.ink, 'center', 'EBold', ru * (1 - env(t, T.count[0], T.count[0] + 0.3)));
    label(ctx, `${Math.round(n)}×`, xe, y + 1.6, 0.6, C.ink, 'center', 'EBold', ru * env(t, T.count[0] + 0.1, T.count[0] + 0.3) * (1 - env(t, T.count[1] - 0.1, T.count[1] + 0.1)));
    label(ctx, '30× the distance', 9.0, y + 1.75, 0.8, C.blueSoft, 'center', 'EBold', ru * env(t, T.count[1] - 0.1, T.count[1] + 0.2));
  }
  // l6: a relay in the doorway turns one blocked hop into two clear hops
  const ra = clamp((t - T.relay) / 0.15);
  if (ra > 0) {
    for (const [hp, tt] of [[HOP_A, T.hopA], [HOP_B, T.hopB]]) {
      const k = ease.inOut(inv(tt[0] - 0.05, tt[0] + 0.3, t));
      if (k > 0) { ctx.save(); ctx.globalAlpha *= 1 - veil(t); strokePath(ctx, hp, len(hp) * k, 0.14 * G, C.blueSoft, true, [14, 9]); ctx.restore(); if (k < 1) penTip(ctx, at(hp, len(hp) * k)); }
      if (t > tt[0] && t < tt[1] + 0.25) { const q = ease.inOut(inv(tt[0], tt[1], t)), p = at(hp, len(hp) * q); envelope(ctx, p[0] * G, p[1] * G, 0.62 * G, 1 - clamp((t - tt[1]) / 0.2)); }
    }
    phone(ctx, R, t > T.hopA[1] && t < T.hopB[0] + 0.3 ? 'env' : 'none', 1.45, clamp((t - T.relay) / 0.2) * (1 - veil(t)));
    ring(ctx, R, t - T.relay, C.blueSoft, 1.0);
    label(ctx, 'relay', R[0] + 0.8, R[1] + 0.05, 0.6, C.blueSoft, 'left', 'EBold', ra * (1 - veil(t)));
    label(ctx, '2 clear hops', 2.4, 19.15, 0.6, C.blueSoft, 'left', 'EBold', env(t, T.hopA[0], T.hopA[0] + 0.3) * (1 - veil(t)));
  }
  // the two phones
  const yGlyph = t >= T.hop0[1] && t < 2.0 ? 'ok' : (t >= T.drop[1] && t < 4.3 ? 'x' : (t >= T.hop1[1] && t < 6.9 ? 'ok' : (t >= T.hopB[1] && t < 27.5 ? 'ok' : 'none')));
  phone(ctx, A, t >= T.hop0[0] && t < T.hop0[1] + 0.2 || (t >= T.drop[0] - 0.2 && t < T.drop[0] + 0.1) || (t >= T.hop1[0] - 0.2 && t < T.hop1[0] + 0.1) || (t >= T.hopA[0] - 0.3 && t < T.hopA[0] + 0.1) ? 'env' : 'none');
  phone(ctx, B, yGlyph);
  ring(ctx, B, t - T.hop0[1], C.blueSoft, 0.9); ring(ctx, B, t - T.hop1[1], C.blueSoft, 0.9); ring(ctx, B, t - T.hopB[1], C.blueSoft, 0.9);
}
function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(3.0 * G, 11.05 * G, 0.1 * G, 1.3 * G); ctx.restore();
  label(ctx, 'Walls vs radio', 3.3, 11.4, 0.5, C.ink, 'left', 'EBold', a);
  label(ctx, 'same distance, new wall', 3.3, 12.05, 0.34, GREY, 'left', 'ESemi', a);
}

// ------------------------------------------------------------------ screen-space instrument (one plate; one short readout per beat)
function drawInstrument(ctx, t) {
  const A0 = (1 - env(t, T.cta - 0.3, T.cta + 0.15)) * (1 - env(t, 12.7, 13.0) + env(t, 21.2, 21.5));   // hidden in l4-l5: one readout at a time
  if (A0 <= 0) return;
  ctx.save(); ctx.globalAlpha = A0;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const Y = 1496;
  const txt = (s, x, y, col, font, a = 1, align = 'left') => { if (a <= 0.01) return; ctx.globalAlpha = A0 * a; ctx.font = font; ctx.textAlign = align; ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.textAlign = 'left'; };
  const pA = 1 - env(t, 12.7, 13.0), pB = 0, pC = env(t, 21.3, 21.6);
  if (pA > 0) {                                                             // signal through the wall (meter)
    const wall = wallIn(t) > 0.5, dry = concrete(t) < 0.5;
    const name = !wall ? 'no wall' : dry ? 'drywall' : 'concrete';
    const f = !wall ? 1 : dry ? 0.97 : (t < T.drop[0] ? 1 - 0.82 * ease.inOut(inv(T.slam, T.drop[0], t)) : 0.18);
    txt('signal', 132, Y - 30, GREY, '24px ESemi', pA); txt(name, 132, Y + 14, dry || !wall ? C.ink : C.coral, '36px EBold', pA);
    ctx.globalAlpha = A0 * pA; roundRect(ctx, 400, Y - 17, 540, 34, 12); ctx.strokeStyle = hexA(C.ink, 0.25); ctx.lineWidth = 2; ctx.stroke();
    roundRect(ctx, 400, Y - 17, Math.max(24, 540 * f), 34, 12); ctx.fillStyle = f < 0.5 ? C.coral : C.blue; ctx.fill();
    if (dry && wall) txt('−0.6 dB', 920, Y + 1, C.ink, '28px EBold', pA * env(t, 5.4, 5.7), 'right');
  }
  if (pB > 0) {
    if (t < 17.8) {
      txt('through 20 cm concrete', 132, Y - 26, GREY, '26px ESemi', pB * env(t, T.cm, T.cm + 0.3));
      const v = Math.round(30 * ease.inOut(inv(T.db - 0.1, T.db + 0.8, t)));
      txt('lost', 132, Y + 18, C.ink, '36px EBold', pB); txt(`≈ −${v} dB`, 930, Y + 6, C.coral, '64px EDisplay', pB * clamp((t - T.db + 0.15) / 0.2), 'right');
    } else {
      const k = env(t, 17.8, 18.1);
      txt('open air', 132, Y - 26, GREY, '26px ESemi', pB * k); txt('30 dB ≈', 132, Y + 18, C.ink, '36px EBold', pB * k);
      const n = Math.round(1 + 29 * ease.inOut(inv(...T.count, t)));
      txt(`×${n} distance`, 930, Y + 6, C.blueSoft, '64px EDisplay', pB * k, 'right');
    }
  }
  if (pC > 0) {
    const a1 = env(t, T.hopA[0], T.hopA[0] + 0.3), a2 = env(t, T.direct, T.direct + 0.3);
    if (a1 > 0) { ctx.globalAlpha = A0 * pC * a1; check(ctx, 150, Y, 34, C.blueSoft); txt('2 clear hops', 184, Y, C.blueSoft, '40px EBold', pC * a1); }
    if (a2 > 0) { ctx.globalAlpha = A0 * pC * a2; cross(ctx, [580 / G, Y / G], 0.2, 1); txt('1 through concrete', 612, Y, C.coral, '30px EBold', pC * a2); }
    if (a1 <= 0) txt('relay in the doorway', 132, Y, C.ink, '36px EBold', pC * env(t, T.relay, T.relay + 0.3));
  }
  ctx.restore();
}

// ------------------------------------------------------------------ captions (screen space; ink in y 350–470, x 100–900)
function drawCaptions(ctx, t) {
  for (const c of CAPS) {
    if (t < c.a || t > c.b) continue;
    const a = clamp((t - c.a) / 0.16) * (1 - clamp((t - (c.b - 0.14)) / 0.14));
    ctx.save(); ctx.globalAlpha = a; ctx.font = '52px EBold'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const w = Math.max(...c.l.map(s => ctx.measureText(s).width)) + 64;
    roundRect(ctx, CAP_CX - w / 2, 334, w, c.l.length > 1 ? 152 : 92, 22); ctx.fillStyle = 'rgba(8,12,10,0.86)'; ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = C.ink;
    if (c.l.length === 1) ctx.fillText(c.l[0], CAP_CX, 398); else { ctx.fillText(c.l[0], CAP_CX, 398); ctx.fillText(c.l[1], CAP_CX, 458); }
    ctx.restore();
  }
}

// ------------------------------------------------------------------ frame
function drawWorld(ctx, t, cm, thumb = false) {
  const sc = cm.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  if (!thumb) drawCartouche(ctx, 1 - env(t, 3.4, 3.9));
  drawScene(ctx, t);
  const v2 = env(t, 17.9, 18.3) * (1 - env(t, 20.9, 21.3));                 // l5: veil the plan while the open-air strip explains
  if (v2 > 0) { ctx.fillStyle = hexA(C.bg, 0.9 * v2); ctx.fillRect((ROOM.x0 - 0.3) * G, (ROOM.y0 - 1.2) * G, (ROOM.x1 - ROOM.x0 + 0.6) * G, (ROOM.y1 - ROOM.y0 + 1.5) * G); }
  const v = veil(t);                                                         // paper veil for the CTA
  if (v > 0) { ctx.fillStyle = hexA(C.bg, 0.7 * v); ctx.fillRect(0, 0, SHEET.w * G, SHEET.h * G); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1000, 560, 540, 1000, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bg = ctx.createLinearGradient(0, 1640, 0, 1920); bg.addColorStop(0, 'rgba(8,11,10,0)'); bg.addColorStop(1, 'rgba(8,11,10,0.9)'); ctx.fillStyle = bg; ctx.fillRect(0, 1640, W, 280);
}
export function drawFrame(ctx, t, assets) {
  drawWorld(ctx, t, cam(t));
  drawInstrument(ctx, t);
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = '22px EMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Illustrative map · not to scale · generic principle, not a product feature', 96, 1612);
  if (assets.icon) {                                                        // CTA signature: official icon + wordmark in the safe area
    const a = env(t, T.cta, T.cta + 0.5);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 364, 1462, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 364, 1462, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 444, 1495); ctx.restore(); }
  }
}

// separate vertical thumbnail tied to the hook: the wall has dropped and the link is broken; 4 large words
export function drawThumb(ctx, assets) {
  const t = 3.6;
  drawWorld(ctx, t, { x: 9.0, y: 15.9, z: 1.3 }, true);
  ctx.save(); const g = ctx.createLinearGradient(0, 120, 0, 820); g.addColorStop(0, 'rgba(8,11,10,0.92)'); g.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 820); ctx.restore();
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const big = (s, y, col, size) => { ctx.font = `${size}px EDisplay`; ctx.lineWidth = 18; ctx.strokeStyle = 'rgba(8,11,10,0.95)'; ctx.strokeText(s, 540, y); ctx.fillStyle = col; ctx.fillText(s, 540, y); };
  big('ONE WALL.', 330, C.ink, 150); big('NO LINK?', 500, C.coral, 150);
  ctx.restore();
  if (assets.icon) { ctx.save(); roundRect(ctx, 384, 1640, 72, 72, 16); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 384, 1640, 72, 72); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '50px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 472, 1677); ctx.restore(); }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  add(T.hop0[0], 'zip', 0.2); add(T.hop0[1], 'stop', 0.24);
  add(T.slam, 'land', 0.36); add(T.drop[0], 'zip', 0.18); add(T.drop[1], 'fizz', 0.26); add(T.drop[1] + 0.05, 'offline', 0.2);
  add(T.dry[0], 'sweep', 0.18, { dur: 0.45 }); add(T.hop1[0], 'zip', 0.18); add(T.hop1[1], 'stop', 0.22);
  add(T.back[0], 'sweep', 0.16, { dur: 0.35 }); add(T.wave[0], 'pen', 0.22, { dur: T.wave[1] - T.wave[0] });
  add(T.absorb, 'thunk', 0.2); add(T.reflect, 'relay', 0.16);
  add(T.db, 'stamp', 0.24); add(T.cm, 'click', 0.16);
  add(T.ruler, 'sweep', 0.14, { dur: 0.4 }); add(T.count[0], 'dots', 0.4, { dur: T.count[1] - T.count[0] }); add(T.count[1], 'stop', 0.2);
  add(T.relay, 'land', 0.22); add(T.hopA[0], 'zip', 0.18); add(T.hopA[1], 'slot', 0.24); add(T.hopB[0], 'zip', 0.18); add(T.hopB[1], 'stop', 0.24); add(T.direct, 'retry', 0.16);
  add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
