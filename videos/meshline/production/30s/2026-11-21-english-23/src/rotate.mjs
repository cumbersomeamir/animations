// Meshline production 30s, batch 2026-11-21-english-23: "Why your phone keeps changing its Bluetooth address".
// Same Transit-Map world as english-06..22 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). Bluetooth LE privacy: a fixed address lets observers
// track a device; a periodically changing Resolvable Private Address (RPA) defeats that, and only devices holding the
// Identity Resolving Key from pairing can resolve it (NIST SP 800-121r2-upd1 §3.2.1; Bluetooth SIG RPA post). Android CDD
// §7.4.3 C-3-5: RPA timeout no longer than 15 minutes, randomized 5-15 min. NIST: make device names non-descriptive.
// Addresses and the name "Sam's Phone" are illustrative. No Meshline Bluetooth or privacy-feature claims (listing facts only).
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 40 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
CAPS[0].a = Math.max(CAPS[0].a, 0.55);                                       // the frame-zero title words hand over to the first caption
const SCREEN_CY = 1000, CAP_CX = 500;                                      // captions centred in x 100..900 (2026-11-11 brief)
const GREY = '#B5BDB8';
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

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
// ------------------------------------------------------------------ a transit-map street: three stops with strangers' scanners; you walk the line with a rotating address tag
const LINE_Y = 17.0, PY = 15.9, TAG_Y = 13.85, SCAN_Y = 19.0;
const STOPS = [{ x: 3.0, name: 'shop' }, { x: 8.0, name: 'café' }, { x: 13.0, name: 'station' }];
const FRIEND = [10.6, 21.3];
const FIXED = '4E:20:B7…', SEG = ['A1:7C:05…', '6D:02:E9…', 'F0:9B:44…'], HOOK_TAGS = ['7A:3F:91…', '4D:08:C3…', 'C2:91:5E…', 'B8:47:0A…'];
const T = {
  hookFlip: 1.2, why: 2.55,
  fixed: [3.65, 5.9], trail: 5.15,
  walk: [7.0, 14.6], timer: 9.5, devices: 14.55,
  key: 16.6, token: [17.75, 18.45], you: 18.7,
  name: 21.35, plain: 23.4,
  cta: 25.61,
};
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);
// the walk: one position model drives the phone, the tag flips and the scanner logs
const walkX = t => t < T.fixed[0] - 0.2 ? lerp(9.35, 10.0, clamp(t / 3.3)) : t < T.walk[0] - 0.4 ? lerp(2.5, 13.3, ease.inOut(inv(...T.fixed, t))) : t < T.walk[1] ? lerp(2.4, 13.3, inv(...T.walk, t)) : 13.3;
const tAtX = (x, t0, t1, x0, x1) => t0 + (t1 - t0) * (x - x0) / (x1 - x0);
const FLIP = [tAtX(5.0, ...T.walk, 2.4, 13.3), tAtX(10.5, ...T.walk, 2.4, 13.3)];   // address rotations between the stops
const LOG_B = STOPS.map(s => tAtX(s.x, ...T.walk, 2.4, 13.3));                         // when each scanner logs the rotating address
const LOG_A = STOPS.map(s => { for (let t = T.fixed[0]; t < T.fixed[1]; t += 1 / 240) if (walkX(t) >= s.x) return t; return T.fixed[1]; });
const segAt = t => (t < FLIP[0] ? 0 : t < FLIP[1] ? 1 : 2);

// ------------------------------------------------------------------ camera (each key checked: x·60·z ≥ 540 and (18−x)·60·z ≥ 540; vital objects left of x ≈ 880 px)
function cam(t) {
  return K(t, [
    [0, { x: 7.4, y: 16.3, z: 1.25 }], [3.2, { x: 7.4, y: 16.25, z: 1.27 }],             // hook: the tag keeps changing; old tags left behind
    [3.7, { x: 8.6, y: 16.7, z: 1.08 }], [6.6, { x: 8.6, y: 16.7, z: 1.08 }],            // what if it never changed: tracked
    [7.1, { x: 8.34, y: 16.6, z: 1.08 }], [14.7, { x: 9.66, y: 16.6, z: 1.08 }], [15.4, { x: 9.66, y: 16.6, z: 1.08 }],   // rotation: the camera pans with you past three strangers
    [16.2, { x: 11.57, y: 18.7, z: 1.4 }], [20.4, { x: 11.57, y: 18.75, z: 1.42 }],      // paired: the key resolves it
    [21.2, { x: 12.7, y: 15.4, z: 1.7 }], [25.2, { x: 12.7, y: 15.45, z: 1.71 }],        // the name tag
    [26.2, { x: 9.0, y: 16.6, z: 1.0 }], [30, { x: 9.0, y: 16.7, z: 1.1 }],              // CTA: slow push under the veil
  ]);
}

// ------------------------------------------------------------------ glyphs
function device(ctx, p, a = 1, lit = 0, col = C.blueSoft) {
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = 1.4 * G, h = 2.25 * G;
  ctx.save(); ctx.globalAlpha *= a;
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 0, x, y, 1.6 * G); g.addColorStop(0, hexA(col, 0.5 * lit)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 1.6 * G, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.14 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.14 * G); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G, y - h / 2 + 0.13 * G, w - 0.14 * G, h - 0.26 * G, 0.05 * G); ctx.fill();
  ctx.restore();
}
function tagPill(ctx, txt, x, y, size, col, a = 1, flip = 0, bg = 'rgba(12,17,15,0.96)') {   // address tag; flip 0..1 squashes it like a split-flap card
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x * G, y * G); ctx.scale(1, Math.max(0.04, Math.abs(Math.cos(flip * Math.PI))));
  ctx.font = `${size * G}px EBold`; const w = ctx.measureText(txt).width + 0.6 * G, h = size * 1.7 * G;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, -w / 2 + 4, -h / 2 + 6, w, h, 0.22 * G); ctx.fill();
  roundRect(ctx, -w / 2, -h / 2, w, h, 0.22 * G); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 0.03 * G); ctx.restore();
}
function scanner(ctx, x, a, t, flash) {                                      // a stranger's scanner post: a box with an antenna, listening upward
  if (a <= 0.01) return; const X = x * G, Y = SCAN_Y * G;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, X - 0.65 * G + 4, Y - 0.45 * G + 6, 1.3 * G, 0.95 * G, 0.16 * G); ctx.fill();
  ctx.fillStyle = '#1C2521'; roundRect(ctx, X - 0.65 * G, Y - 0.45 * G, 1.3 * G, 0.95 * G, 0.16 * G); ctx.fill(); ctx.strokeStyle = GREY; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = GREY; ctx.beginPath(); ctx.arc(X, Y + 0.02 * G, 0.12 * G, 0, TAU); ctx.fill();
  for (let j = 0; j < 2; j++) { const age = (t * 0.7 + j * 0.5 + x * 0.1) % 1; ctx.strokeStyle = hexA(GREY, 0.45 * (1 - age)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X, Y - 0.45 * G, (0.35 + 0.8 * age) * G, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  if (flash > 0) { ctx.strokeStyle = hexA(C.ink, flash); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(X, Y, (0.7 + 0.6 * (1 - flash)) * G, 0, TAU); ctx.stroke(); }
  ctx.restore();
}
function keyGlyph(ctx, x, y, s, col, a = 1) {
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.translate(x * G, y * G);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 0.16 * s * G; ctx.lineCap = 'round';
  const draw = () => { ctx.beginPath(); ctx.arc(-0.45 * s * G, 0, 0.26 * s * G, 0, TAU); ctx.moveTo(-0.19 * s * G, 0); ctx.lineTo(0.6 * s * G, 0); ctx.moveTo(0.38 * s * G, 0); ctx.lineTo(0.38 * s * G, 0.24 * s * G); ctx.moveTo(0.58 * s * G, 0); ctx.lineTo(0.58 * s * G, 0.2 * s * G); ctx.stroke(); };
  ctx.save(); ctx.translate(3, 5); draw(); ctx.restore(); ctx.strokeStyle = col; draw(); ctx.restore();
}

// ------------------------------------------------------------------ scene
function drawScene(ctx, t) {
  const v = veil(t), px = walkX(t);
  // the line and its stops (transit-map grammar)
  ctx.save(); ctx.globalAlpha *= 1 - 0.5 * v; strokePath(ctx, [[0.6, LINE_Y], [17.4, LINE_Y]], 99, 0.2 * G, hexA(C.blueSoft, 0.55)); ctx.restore();
  const fixedMode = t > T.fixed[0] - 0.25 && t < T.walk[0] - 0.35;
  for (const [i, s] of STOPS.entries()) {
    ctx.save(); ctx.globalAlpha *= 1 - 0.5 * v; ctx.fillStyle = C.bg; ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 0.08 * G; ctx.beginPath(); ctx.arc(s.x * G, LINE_Y * G, 0.36 * G, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    const lg = fixedMode ? LOG_A[i] : LOG_B[i], fl = t > lg && t < lg + 0.6 && (fixedMode || (t > T.walk[0] && t < T.walk[1] + 0.6)) ? 1 - (t - lg) / 0.6 : 0;
    const cl = env(t, 15.9, 16.3) * (1 - env(t, 20.5, 20.9)), cu = (1 - env(t, 20.9, 21.3)) * (i === 2 ? 1 : 1 - cl);   // close-ups keep only what they need
    scanner(ctx, s.x, (1 - 0.6 * v) * cu, t, fl);
    label(ctx, s.name, s.x, SCAN_Y + 1.3, 0.66, GREY, 'center', 'EBold', (1 - v) * cu * (1 - cl));
  }
  // hook: old tags left behind along the line (fading), the live tag flips
  const hk = 1 - env(t, 3.3, 3.6);
  if (hk > 0) {
    tagPill(ctx, HOOK_TAGS[0], 1.75, TAG_Y + 0.2, 0.5, GREY, 0.35 * hk); tagPill(ctx, HOOK_TAGS[1], 5.15, TAG_Y + 0.1, 0.56, GREY, 0.6 * hk);
    ctx.save(); ctx.globalAlpha *= 0.5 * hk; ctx.setLineDash([6, 12]); ctx.strokeStyle = GREY; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(3.1 * G, (TAG_Y + 0.15) * G); ctx.lineTo(3.7 * G, (TAG_Y + 0.12) * G); ctx.moveTo(6.6 * G, (TAG_Y + 0.08) * G); ctx.lineTo(7.4 * G, (TAG_Y + 0.05) * G); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    const fk = clamp((t - (T.hookFlip - 0.18)) / 0.36);
    tagPill(ctx, fk < 0.5 ? HOOK_TAGS[2] : HOOK_TAGS[3], px, TAG_Y, 0.74, C.blueSoft, hk, fk > 0 && fk < 1 ? fk : 0);
  }
  label(ctx, '?', px + 2.4, TAG_Y - 0.1, 1.2 * ease.outBack(clamp((t - T.why) / 0.35)), C.coral, 'center', 'EDisplay', clamp((t - T.why) / 0.2) * (1 - env(t, 3.2, 3.5)));
  // what if it never changed: one fixed tag, every scanner logs it, a coral trail joins them
  if (fixedMode) {
    const fa = env(t, T.fixed[0] - 0.25, T.fixed[0]) * (1 - env(t, T.walk[0] - 0.7, T.walk[0] - 0.35));
    tagPill(ctx, FIXED, px, TAG_Y, 0.74, C.coral, fa);
    label(ctx, 'never changes', px, TAG_Y - 1.2, 0.62, C.coral, 'center', 'EBold', fa);
    const tr = clamp((t - T.trail) / 0.7) * fa;
    if (tr > 0) { const pts = STOPS.map(s => [s.x, SCAN_Y + 2.2]); ctx.save(); ctx.globalAlpha *= tr; strokePath(ctx, pts, len(pts) * tr, 0.08 * G, C.coral, false, [10, 10]); ctx.restore(); label(ctx, 'tracked', 8.0, SCAN_Y + 2.95, 0.8, C.coral, 'center', 'EBold', tr); }
  }
  // rotation: a new random address between stops; sped-up timer
  if (t > T.walk[0] - 0.35 && t < 21.0) {
    const ra = env(t, T.walk[0] - 0.35, T.walk[0]);
    const k = segAt(t), fk0 = clamp((t - (FLIP[0] - 0.18)) / 0.36), fk1 = clamp((t - (FLIP[1] - 0.18)) / 0.36);
    const flip = (fk0 > 0 && fk0 < 1) ? fk0 : (fk1 > 0 && fk1 < 1) ? fk1 : 0, txt = SEG[k];                       // before the flip midpoint segAt() still returns the old segment
    tagPill(ctx, txt, px, TAG_Y, 0.74, C.blueSoft, ra * (1 - env(t, 20.6, 21.0)), flip);
    const tm = env(t, T.timer, T.timer + 0.25) * (1 - env(t, 15.6, 15.9));
    if (tm > 0) { const kk = ((t - T.walk[0]) % 3.5) / 3.5; ctx.save(); ctx.globalAlpha *= tm; ctx.lineCap = 'round'; ctx.strokeStyle = hexA(C.ink, 0.2); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc((px - 3.0) * G, TAG_Y * G, 0.42 * G, 0, TAU); ctx.stroke(); ctx.strokeStyle = C.blueSoft; ctx.beginPath(); ctx.arc((px - 3.0) * G, TAG_Y * G, 0.42 * G, -Math.PI / 2, -Math.PI / 2 + kk * TAU); ctx.stroke(); ctx.restore();
      label(ctx, '≤ 15 min', px - 3.0, TAG_Y - 0.9, 0.58, C.blueSoft, 'center', 'EBold', tm); label(ctx, 'sped up', px - 3.0, TAG_Y + 0.85, 0.46, GREY, 'center', 'EBold', tm); }
    const nd = env(t, T.devices, T.devices + 0.25) * (1 - env(t, 15.7, 16.0));
    for (const s of STOPS) tagPill(ctx, 'new device?', s.x, SCAN_Y + 2.3, 0.52, GREY, nd);
  }
  // paired: the friend holds the shared key; a copy of the tag passes through it and resolves to "it's you"
  const pa = env(t, T.key - 0.3, T.key) * (1 - env(t, 20.7, 21.1)) * (1 - v);
  if (pa > 0) {
    device(ctx, FRIEND, pa, env(t, T.you, T.you + 0.2) * pa);
    label(ctx, 'paired friend', FRIEND[0], FRIEND[1] + 1.75, 0.62, C.ink, 'center', 'EBold', pa);
    keyGlyph(ctx, FRIEND[0] - 2.5, FRIEND[1] - 0.25, 1.2, C.blueSoft, pa * env(t, T.key, T.key + 0.25));
    label(ctx, 'shared key', FRIEND[0] - 2.6, FRIEND[1] + 0.7, 0.56, C.blueSoft, 'center', 'EBold', pa * env(t, T.key, T.key + 0.25));
    if (t > T.token[0] && t < T.you + 0.2) { const q = ease.inOut(inv(...T.token, t)); tagPill(ctx, SEG[2], lerp(13.3, FRIEND[0] - 2.5, q), lerp(TAG_Y, FRIEND[1] - 0.25, q), 0.52, C.blueSoft, 1 - clamp((t - T.you) / 0.2)); }
    tagPill(ctx, "it's you", FRIEND[0], FRIEND[1] - 2.05, 0.64, C.ink, pa * env(t, T.you, T.you + 0.2), 0, C.blue);
    tagPill(ctx, 'stranger: ?', 14.0, SCAN_Y + 1.35, 0.56, GREY, pa * env(t, T.you + 0.2, T.you + 0.45));
  }
  // payoff: the name tag (same at every stop) gives you away; keep it plain
  const na = env(t, T.name - 0.1, T.name + 0.2) * (1 - v);
  if (na > 0) {
    const pk = clamp((t - (T.plain - 0.18)) / 0.36);
    tagPill(ctx, 'F3:58:1D…', 13.3, TAG_Y, 0.62, C.blueSoft, na);
    tagPill(ctx, pk < 0.5 ? "Sam's Phone" : 'Phone', 13.3, TAG_Y - 1.25, 0.62, pk < 0.5 ? C.coral : C.ink, na, pk > 0 && pk < 1 ? pk : 0);
    label(ctx, 'name: same everywhere', 13.3, TAG_Y - 2.25, 0.44, C.coral, 'center', 'EBold', na * (1 - env(t, T.plain - 0.2, T.plain)));
    label(ctx, 'plain name', 13.3, TAG_Y - 2.25, 0.46, C.blueSoft, 'center', 'EBold', na * env(t, T.plain + 0.1, T.plain + 0.3));
  }
  // you
  const moving = (t > T.fixed[0] && t < T.fixed[1]) || (t > T.walk[0] && t < T.walk[1]) || t < 3.3, bob = moving ? 0.05 * Math.abs(Math.sin(t * 9)) : 0;
  const fadeJump = 1 - env(t, T.fixed[0] - 0.3, T.fixed[0] - 0.15) * (1 - env(t, T.fixed[0] - 0.15, T.fixed[0])) - env(t, T.walk[0] - 0.5, T.walk[0] - 0.4) * (1 - env(t, T.walk[0] - 0.4, T.walk[0] - 0.25));
  device(ctx, [px, PY - bob], clamp(fadeJump), 0.6 * (1 - v));
  label(ctx, 'you', px, PY + 1.75, 0.64, C.ink, 'center', 'EBold', (1 - v) * clamp(fadeJump));
}

// ------------------------------------------------------------------ screen-space instrument: a stranger's scanner log (one readout; kept left of the right-side controls)
function drawInstrument(ctx, t) {
  const modeA = env(t, T.fixed[0], T.fixed[0] + 0.25) * (1 - env(t, 6.6, 6.85));
  const modeB = env(t, T.walk[0], T.walk[0] + 0.25) * (1 - env(t, 15.8, 16.05));
  const modeC = env(t, T.name - 0.1, T.name + 0.2) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  const A = Math.max(modeA, modeB, modeC); if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 768, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '26px ESemi'; ctx.fillStyle = GREY;
  if (modeC > 0.01) {
    ctx.fillText('what a scanner sees', 132, 1450);
    const pk = t >= T.plain;
    ctx.font = '24px ESemi'; ctx.fillText('address', 132, 1494); ctx.fillText('name', 132, 1540);
    ctx.font = '32px EBold'; ctx.fillStyle = C.blueSoft; ctx.fillText('changes', 300, 1494); ctx.fillStyle = pk ? C.ink : C.coral; ctx.fillText(pk ? 'Phone' : "Sam's Phone", 300, 1540);
    ctx.font = '28px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = pk ? C.blueSoft : C.coral; ctx.fillText(pk ? 'plain: says nothing' : 'same everywhere', 830, 1540);
  } else {
    ctx.fillText("a stranger's scanner log", 132, 1450);
    const cols = [250, 480, 710], fixed = modeA > modeB;
    STOPS.forEach((s, i) => { const lg = fixed ? LOG_A[i] : LOG_B[i]; if (t < lg) return; const a = clamp((t - lg) / 0.2);
      ctx.save(); ctx.globalAlpha *= a; ctx.textAlign = 'center'; ctx.font = '24px ESemi'; ctx.fillStyle = GREY; ctx.fillText(s.name, cols[i], 1494);
      ctx.font = '30px EBold'; ctx.fillStyle = fixed ? C.coral : C.ink; ctx.fillText(fixed ? FIXED : SEG[i], cols[i], 1538); ctx.restore(); });
    const done = fixed ? t >= LOG_A[2] + 0.2 : t >= T.devices;
    if (done) { ctx.font = '26px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = fixed ? C.coral : C.blueSoft; ctx.fillText(fixed ? 'same device: tracked' : 'looks like 3 devices', 830, 1450); }
  }
  ctx.restore();
}
// ------------------------------------------------------------------ captions (screen space; 2026-11-19 brief: ink and plate in y 280–460, x 100–900)
function drawCaptions(ctx, t) {
  for (const c of CAPS) {
    if (t < c.a || t > c.b) continue;
    const a = clamp((t - c.a) / 0.16) * (1 - clamp((t - (c.b - 0.14)) / 0.14));
    ctx.save(); ctx.globalAlpha = a; ctx.font = '52px EBold'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const w = Math.max(...c.l.map(s => ctx.measureText(s).width)) + 64;
    roundRect(ctx, CAP_CX - w / 2, 306, w, c.l.length > 1 ? 152 : 92, 22); ctx.fillStyle = 'rgba(8,12,10,0.86)'; ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = C.ink;
    if (c.l.length === 1) ctx.fillText(c.l[0], CAP_CX, 370); else { ctx.fillText(c.l[0], CAP_CX, 370); ctx.fillText(c.l[1], CAP_CX, 430); }
    ctx.restore();
  }
}


// ------------------------------------------------------------------ frame
function drawWorld(ctx, t, cm) {
  const sc = cm.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  drawScene(ctx, t);
  const v = veil(t);                                                         // paper veil for the CTA
  if (v > 0) { ctx.fillStyle = hexA(C.bg, 0.7 * v); ctx.fillRect(0, 0, SHEET.w * G, SHEET.h * G); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1000, 560, 540, 1000, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bg = ctx.createLinearGradient(0, 1640, 0, 1920); bg.addColorStop(0, 'rgba(8,11,10,0)'); bg.addColorStop(1, 'rgba(8,11,10,0.9)'); ctx.fillStyle = bg; ctx.fillRect(0, 1640, W, 280);
}
// frame-zero title: 4 truthful curiosity words in the caption band, handing over to the first caption at ~0.55 s
function drawTitle(ctx, a, big = false) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  const line = (s, y, col, size) => { ctx.font = `${size}px EDisplay`; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(8,11,10,0.95)'; ctx.strokeText(s, 500, y); ctx.fillStyle = col; ctx.fillText(s, 500, y); };
  if (big) { line('NEW ADDRESS.', 345, C.ink, 112); line('SAME PHONE.', 470, C.coral, 112); }
  else { line('NEW ADDRESS.', 362, C.ink, 90); line('SAME PHONE.', 452, C.coral, 90); }
  ctx.restore();
}
export function drawFrame(ctx, t, assets) {
  drawWorld(ctx, t, cam(t));
  drawInstrument(ctx, t);
  drawTitle(ctx, 1 - env(t, 0.3, 0.55));
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = '22px EMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Illustrative map · not to scale · generic principle, not a product feature', 96, 1612);
  if (assets.icon) {                                                        // CTA (feedback "call to action needed"): icon + wordmark + an explicit action button
    const a = env(t, T.cta, T.cta + 0.5), b = env(t, T.cta + 0.35, T.cta + 0.8);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 364, 1404, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 364, 1404, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 444, 1437); ctx.restore(); }
    if (b > 0) {                                                            // listing facts only: price 0, Android
      const s = 0.92 + 0.08 * ease.outBack(b), pulse = 1 + 0.025 * Math.sin(Math.max(0, t - T.cta - 1.2) * 4.2) * clamp(t - T.cta - 1.2);
      ctx.save(); ctx.globalAlpha = b; ctx.translate(500, 1520); ctx.scale(s * pulse, s * pulse);
      roundRect(ctx, -250, -40, 500, 80, 40); ctx.fillStyle = C.blue; ctx.fill(); ctx.strokeStyle = hexA(C.ink, 0.35); ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = '36px EBold'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Download free · Android', 0, 2); ctx.restore();
    }
  }
}

// the separate thumbnail is the frame-zero composition (same words, same scene) plus the signature
export function drawThumb(ctx, assets) {
  drawWorld(ctx, 0.0, cam(0));
  drawTitle(ctx, 1, true);
  if (assets.icon) { ctx.save(); roundRect(ctx, 384, 1640, 72, 72, 16); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 384, 1640, 72, 72); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '50px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 472, 1677); ctx.restore(); }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  add(0.02, 'click', 0.12); add(T.hookFlip, 'tick', 0.18); add(T.why, 'retry', 0.14);
  add(T.fixed[0], 'zip', 0.16); for (const l of LOG_A) add(l, 'click', 0.14); add(T.trail, 'pen', 0.16, { dur: 0.6 }); add(T.trail + 0.7, 'offline', 0.14);
  add(T.walk[0], 'sweep', 0.12, { dur: 0.4 }); for (const l of LOG_B) add(l, 'click', 0.14); for (const f of FLIP) add(f, 'tick', 0.2);
  add(T.timer, 'tick', 0.1); add(T.devices, 'chime', 0.14);
  add(T.key, 'land', 0.16); add(T.token[0], 'zip', 0.16); add(T.you, 'chime', 0.18);
  add(T.name, 'stamp', 0.18); add(T.plain - 0.05, 'tick', 0.2); add(T.plain + 0.1, 'chime', 0.14);
  add(T.cta, 'chime', 0.3); add(T.cta + 0.4, 'click', 0.18);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
