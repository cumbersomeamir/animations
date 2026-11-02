// Meshline production 30s: store-and-forward (delay-tolerant networking), "A message can travel without a complete connection".
// Same Transit-Map world as batch-02 (charcoal printed sheet, electric-blue ink, white stations, pen tips, veils,
// printed callouts, screen-space caption plate). New props: envelope tokens, an outbox with a waiting clock, a
// travelling relay vehicle on a printed rail, pen-drawn contact links, and a screen-space timeline instrument
// (style §2: "screen space only for the instrument"). Generic networking principle; no Meshline feature claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000;

// ------------------------------------------------------------------ network (G, octilinear)
const A = [4, 9], B = [14, 9];
const GAP = [8.0, 10.0];
const TRAY = [5.75, 10.5];                                 // A's outbox (stored messages)                                     // the missing piece of the live route
const RELAY = [[0.8, 17.5], [0.8, 13.6], [2.2, 12.2], [4, 12.2], [6, 12.2], [8, 14.2], [8, 17.4], [9.6, 19.0], [12.4, 19.0], [14, 17.4], [14, 12.2], [15.4, 12.2], [17.4, 12.2]];
const T = {
  liveDraw: [0.2, 1.5], liveBreak: 1.55, bounce: [1.9, 3.3], store: [5.2, 5.8], clock: 5.8,
  relayIn: [7.5, 9.0], contactA: [9.1, 9.45], handA: [10.3, 10.9], dwellA: 11.2,
  relayTravel: [11.3, 14.2], contactB: [14.25, 14.55], handB: [14.65, 15.25], deliver: 15.3, relayOut: [15.6, 16.9],
  delay: 17.6, wait2: 19.4, compare: 21.14, callout: 23.4, cta: 27.0,
};
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const RL = len(RELAY);
const dA = len(RELAY.slice(0, 4)), dB = len(RELAY.slice(0, 11));          // distance along the rail to each contact point
function relayD(t) {                                                        // relay position along its rail (monotone; dwells at contacts)
  if (t < T.relayIn[0]) return -1;
  if (t < T.relayIn[1]) return dA * ease.out(inv(...T.relayIn, t));
  if (t < T.relayTravel[0]) return dA;
  if (t < T.relayTravel[1]) return lerp(dA, dB, ease.inOut(inv(...T.relayTravel, t)));
  if (t < T.relayOut[0]) return dB;
  if (t < T.relayOut[1]) return lerp(dB, RL, ease.in(inv(...T.relayOut, t)));
  return RL;
}

// ------------------------------------------------------------------ camera (purposeful moves; one per beat)
function cam(t) {
  const base = K(t, [
    [0, { x: 9, y: 9.9, z: 1.25 }], [4.4, { x: 9, y: 10.0, z: 1.25 }], [5.3, { x: 5.6, y: 10.7, z: 1.55 }], [7.3, { x: 5.6, y: 10.8, z: 1.55 }],
    [8.1, { x: 5.0, y: 11.6, z: 1.38 }], [11.2, { x: 5.2, y: 11.7, z: 1.38 }],
    [14.2, { x: 12.0, y: 12.3, z: 1.38 }], [16.6, { x: 12.0, y: 12.2, z: 1.38 }],
    [17.4, { x: 9, y: 11.8, z: 1.1 }], [20.8, { x: 9, y: 11.9, z: 1.1 }], [21.8, { x: 9, y: 13.2, z: 0.92 }], [30, { x: 9, y: 12.9, z: 0.98 }],
  ]);
  if (t > 11.2 && t < 14.2) {                                               // ride with the relay while it carries the message
    const p = at(RELAY, relayD(t)), k = ease.inOut(inv(11.2, 11.9, t)) * (1 - ease.inOut(inv(13.5, 14.2, t)));
    base.x = lerp(base.x, p[0], k * 0.85); base.y = Math.min(lerp(base.y, p[1] - 1.6, k * 0.85), 14.4); base.z = lerp(base.z, 1.25, k);   // clamp: A–B row stays below the caption band
  }
  return base;
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

// ------------------------------------------------------------------ ink helpers (identical grammar to batch-02)
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
function fizz(ctx, p, t, t0) {
  const k = t - t0; if (k < 0 || k > 0.7) return;
  ctx.strokeStyle = hexA(C.coral, 1 - k / 0.7); ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + hash(i + t0) * 0.6, d0 = (0.2 + k * 0.9) * G, d1 = d0 + 0.18 * G; ctx.beginPath(); ctx.moveTo(p[0] * G + Math.cos(a) * d0, p[1] * G + Math.sin(a) * d0); ctx.lineTo(p[0] * G + Math.cos(a) * d1, p[1] * G + Math.sin(a) * d1); ctx.stroke(); }
}

// ------------------------------------------------------------------ props
function envelope(ctx, p, s = 0.62, alpha = 1, col = C.ink, rot = 0) {   // printed envelope token (message)
  const x = p[0] * G, y = p[1] * G, w = s * G, h = s * 0.68 * G;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, -w / 2 + 3, -h / 2 + 5, w, h, 4); ctx.fill();
  ctx.fillStyle = col; roundRect(ctx, -w / 2, -h / 2, w, h, 4); ctx.fill();
  ctx.strokeStyle = C.blue; ctx.lineWidth = Math.max(2, w * 0.07); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-w / 2 + 3, -h / 2 + 3); ctx.lineTo(0, h * 0.08); ctx.lineTo(w / 2 - 3, -h / 2 + 3); ctx.stroke();
  ctx.restore();
}
function station(ctx, p, name, t, lit = 0) {                              // white station block with an outbox tray
  const x = p[0] * G, y = p[1] * G, w = 1.15 * G, h = 1.15 * G;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.22 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.22 * G); ctx.fill();
  ctx.strokeStyle = lit > 0 ? hexA(C.blue, 0.6 + 0.4 * lit) : C.charcoal; ctx.lineWidth = 0.08 * G; ctx.stroke();
  ctx.fillStyle = C.charcoal; ctx.font = `${0.62 * G}px EDisplay`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(name, x, y + 2);
}
function outbox(ctx, p, t, items, label1, a = 1) {                       // printed tray beside a station holding stored envelopes
  if (a <= 0) return;
  const x = TRAY[0] * G, y = (TRAY[1] - 0.1) * G;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.strokeStyle = hexA(C.blueSoft, 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 0.55 * G, y - 0.25 * G); ctx.lineTo(x - 0.55 * G, y + 0.35 * G); ctx.lineTo(x + 0.55 * G, y + 0.35 * G); ctx.lineTo(x + 0.55 * G, y - 0.25 * G); ctx.stroke();
  ctx.restore();
  label(ctx, label1, TRAY[0], TRAY[1] + 0.75, 0.36, C.blueSoft, 'center', 'ESemi', a);
}
function clockFace(ctx, p, t, speed, a = 1, col = C.ink) {               // printed waiting clock; the hand sweeps while the message waits
  if (a <= 0) return;
  const x = p[0] * G, y = p[1] * G, r = 0.42 * G;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(14,20,18,0.95)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r * 0.78, y + Math.sin(an) * r * 0.78); ctx.lineTo(x + Math.cos(an) * r * 0.9, y + Math.sin(an) * r * 0.9); ctx.stroke(); }
  const an = -Math.PI / 2 + speed * TAU; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * r * 0.7, y + Math.sin(an) * r * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an / 12) * r * 0.45, y + Math.sin(an / 12) * r * 0.45); ctx.stroke();
  ctx.restore();
}
function relayVehicle(ctx, p, dir, carrying, t) {                         // style §2 vehicle (white capsule, windows in line colour), enlarged
  const x = p[0] * G, y = p[1] * G, w = 1.5 * G, h = 0.56 * G;
  ctx.save(); ctx.translate(x, y); if (Math.abs(dir) > 0.5) ctx.rotate(Math.atan2(dir, 0) * 0 + (dir > 0 ? Math.PI / 2 : -Math.PI / 2) * 0);
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, -w / 2 + 4, -h / 2 + 7, w, h, h / 2); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill(); ctx.strokeStyle = C.charcoal; ctx.lineWidth = 0.05 * G; ctx.stroke();
  ctx.fillStyle = C.blueSoft; for (let i = 0; i < 3; i++) roundRect(ctx, -w * 0.32 + i * w * 0.24 - w * 0.07, -h * 0.22, w * 0.15, h * 0.44, 4), ctx.fill();
  ctx.restore();
  if (carrying) envelope(ctx, [p[0], p[1] - 0.62], 0.52);
}

// ------------------------------------------------------------------ beats
function drawLiveRoute(ctx, t) {
  // the live route A→B exists only in two halves: a continuous end-to-end path is missing right now
  const k = ease.inOut(inv(...T.liveDraw, t));
  const L1 = [[A[0] + 0.6, A[1]], [GAP[0], A[1]]], L2 = [[B[0] - 0.6, B[1]], [GAP[1], B[1]]];
  if (k > 0) {
    strokePath(ctx, L1, (GAP[0] - A[0] - 0.6) * k, 0.24 * G, C.blue); strokePath(ctx, L2, (B[0] - 0.6 - GAP[1]) * k, 0.24 * G, C.blue);
    if (k < 1) { penTip(ctx, at(L1, (GAP[0] - A[0] - 0.6) * k)); penTip(ctx, at(L2, (B[0] - 0.6 - GAP[1]) * k)); }
  }
  const bk = clamp((t - T.liveBreak) / 0.3);
  if (bk > 0) {
    ctx.save(); ctx.globalAlpha *= bk; ctx.strokeStyle = hexA(C.coral, 0.8); ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
    ctx.beginPath(); ctx.moveTo((GAP[0] + 0.25) * G, A[1] * G); ctx.lineTo((GAP[1] - 0.25) * G, A[1] * G); ctx.stroke(); ctx.setLineDash([]);
    const cx = (GAP[0] + GAP[1]) / 2 * G, cy = A[1] * G, s = 0.28 * G;
    ctx.lineWidth = 0.1 * G; ctx.lineCap = 'round'; ctx.strokeStyle = C.coral; ctx.beginPath(); ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s); ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s); ctx.stroke();
    ctx.restore();
    label(ctx, 'no live route', 9, A[1] - 0.95, 0.42, C.coral, 'center', 'EBold', bk * (1 - env(t, 6.6, 7.2)));
  }
  // comparison label in the takeaway
  label(ctx, 'live route: broken', 9, A[1] - 0.95, 0.42, C.coral, 'center', 'EBold', env(t, T.compare + 0.3, T.compare + 0.8));
}

function drawRelayRail(ctx, t) {
  // printed rail of the travelling relay (thin "second mode" line); inks brighter where the relay has travelled
  const a = 0.35 + 0.65 * env(t, 6.9, 7.5);
  ctx.save(); ctx.globalAlpha *= a;
  strokePath(ctx, RELAY, RL, 0.09 * G, hexA(C.blueSoft, 0.35), false, [10, 10]);
  ctx.restore();
  const d = relayD(t);
  if (d > 0) strokePath(ctx, RELAY, d, 0.14 * G, hexA(C.blueSoft, 0.9));
  // takeaway replay: the message rides the route assembled over time (contact 1 → carried → contact 2), on a loop
  if (t > T.compare + 0.8) {
    const u = ((t - (T.compare + 0.8)) / 3.0) % 1, k = ease.inOut(u);
    const pe = at(RELAY, lerp(dA, dB, k)), fade = Math.min(1, u / 0.12, (1 - u) / 0.12) * env(t, T.compare + 0.8, T.compare + 1.2);
    strokePath(ctx, RELAY.slice(0), lerp(dA, dB, k), 0.18 * G, hexA(C.blue, 0.55 * fade), false);
    envelope(ctx, [pe[0], pe[1] - 0.5], 0.5, fade);
  }
  // contact tags for the takeaway ("route assembled over time")
  const ca = env(t, T.compare + 0.6, T.compare + 1.1);
  label(ctx, 'contact 1 · earlier', RELAY[3][0] + 0.2, RELAY[3][1] + 0.85, 0.38, C.blueSoft, 'left', 'EBold', ca);
  label(ctx, 'contact 2 · later', RELAY[10][0] - 0.4, RELAY[10][1] + 1.25, 0.38, C.blueSoft, 'right', 'EBold', ca);
  label(ctx, 'route over time', 10.9, 19.75, 0.44, C.ink, 'center', 'EBold', env(t, T.compare + 0.3, T.compare + 0.8));
}

function contactLink(ctx, from, to, t0, t1, t) {                          // a pen-drawn short-lived link during a contact
  const k = ease.out(inv(t0, t1, t)); if (k <= 0) return;
  const fade = 1 - env(t, t1 + 1.6, t1 + 2.2);
  if (fade <= 0) return;
  ctx.save(); ctx.globalAlpha *= fade;
  strokePath(ctx, [from, to], Math.hypot(to[0] - from[0], to[1] - from[1]) * k, 0.16 * G, C.blueSoft, true, [12, 8]);
  if (k < 1) penTip(ctx, at([from, to], Math.hypot(to[0] - from[0], to[1] - from[1]) * k));
  ctx.restore();
}

function drawMessages(ctx, t) {
  const tray = TRAY;
  // hook: envelope leaves A, hits the gap, bounces back
  if (t > T.bounce[0] && t < T.store[1]) {
    let p;
    if (t < 2.75) p = [lerp(A[0] + 0.8, GAP[0] - 0.2, ease.inOut(inv(T.bounce[0], 2.75, t))), A[1] - 0.05];
    else if (t < T.bounce[1]) p = [lerp(GAP[0] - 0.2, A[0] + 0.9, ease.out(inv(2.75, T.bounce[1], t))), A[1] - 0.05 - Math.sin(inv(2.75, T.bounce[1], t) * Math.PI) * 0.5];
    else if (t < T.store[0]) p = [A[0] + 0.9, A[1] - 0.05];
    else p = [lerp(A[0] + 0.9, tray[0], ease.inOut(inv(...T.store, t))), lerp(A[1] - 0.05, tray[1], ease.inOut(inv(...T.store, t))) - Math.sin(inv(...T.store, t) * Math.PI) * 0.6];
    envelope(ctx, p, 0.62);
  }
  fizz(ctx, [GAP[0], A[1]], t, 2.75);
  // stored in A's tray until the relay contact
  if (t >= T.store[1] && t < T.handA[0]) envelope(ctx, tray, 0.62);
  // handoff A → relay (along the contact link)
  const relayA = [RELAY[3][0], RELAY[3][1]];
  if (t >= T.handA[0] && t < T.handA[1]) { const k = ease.inOut(inv(...T.handA, t)); envelope(ctx, [lerp(tray[0], relayA[0], k), lerp(tray[1], relayA[1] - 0.62, k) - Math.sin(k * Math.PI) * 0.7], 0.62); }
  // handoff relay → B
  const relayB = [RELAY[10][0], RELAY[10][1]];
  if (t >= T.handB[0] && t < T.handB[1]) { const k = ease.inOut(inv(...T.handB, t)); envelope(ctx, [lerp(relayB[0], B[0] + 0.05, k), lerp(relayB[1] - 0.62, B[1] + 1.0, k) - Math.sin(k * Math.PI) * 0.6], 0.62); }
  if (t >= T.handB[1]) envelope(ctx, [B[0] + 0.05, B[1] + 1.0], 0.62);
  // a second message that is still waiting: no contact yet (delivery is not guaranteed)
  if (t > T.wait2) { const k = ease.outBack(clamp((t - T.wait2) / 0.35)); envelope(ctx, [tray[0], tray[1]], 0.62 * k, 1, '#C9D0E2'); }
}

function drawAnnotations(ctx, t) {
  const tray = TRAY;
  outbox(ctx, A, t, 1, 'stored', Math.max(env(t, T.store[0], T.store[1]) * (1 - env(t, T.handA[1] + 0.2, T.handA[1] + 0.6)), env(t, T.wait2 - 0.3, T.wait2)));   // tray shows only while it holds a message
  // waiting clock at A (message 1), sweeping while it waits
  const c1 = env(t, T.clock, T.clock + 0.3) * (1 - env(t, T.handA[0], T.handA[0] + 0.3));
  clockFace(ctx, [tray[0] + 1.25, tray[1] - 0.05], t, (t - T.clock) * 0.9, c1);
  label(ctx, 'waiting…', tray[0] + 2.0, tray[1] - 0.05, 0.36, C.ink, 'left', 'ESemi', c1);
  // waiting clock for message 2 + honest label
  const c2 = env(t, T.wait2, T.wait2 + 0.3);
  clockFace(ctx, [tray[0] + 1.25, tray[1] - 0.05], t, (t - T.wait2) * 0.9, c2, C.coral);
  label(ctx, 'no contact yet', tray[0] + 2.0, tray[1] - 0.05, 0.38, C.coral, 'left', 'EBold', c2 * (1 - env(t, T.compare - 0.2, T.compare + 0.3)));
  // relay accepted / delivered marks
  label(ctx, 'accepted', RELAY[3][0] + 1.1, RELAY[3][1] + 0.75, 0.4, C.blueSoft, 'left', 'EBold', clamp((t - T.handA[1]) / 0.25) * (1 - env(t, 11.8, 12.3)));
  const dk = clamp((t - T.deliver) / 0.3);
  if (dk > 0) label(ctx, 'delivered later', B[0], B[1] + 1.95, 0.42, C.ink, 'center', 'EBold', dk * (1 - env(t, T.compare - 0.2, T.compare + 0.3)));
  ring(ctx, B, t - T.deliver, C.blueSoft, 1.0);
}

function drawCallout(ctx, t) {
  const a = env(t, T.callout, T.callout + 0.5);
  if (a <= 0) return;
  const x = 2.2, y = 5.2, w = 13.6, h = 2.5;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(ctx, x * G + 6, y * G + 9, w * G, h * G, 0.25 * G); ctx.fill();
  ctx.fillStyle = 'rgba(14,20,18,0.97)'; roundRect(ctx, x * G, y * G, w * G, h * G, 0.25 * G); ctx.fill();
  ctx.fillStyle = C.blue; ctx.fillRect(x * G, y * G, 0.12 * G, h * G * clamp((t - T.callout) / 0.5));
  ctx.restore();
  label(ctx, 'No live route ≠ always lost', x + 0.55, y + 0.85, 0.66, C.ink, 'left', 'EBold', a);
  label(ctx, 'store · carry · forward, if a later contact comes', x + 0.55, y + 1.75, 0.38, C.blueSoft, 'left', 'ESemi', a * clamp((t - T.callout - 0.4) / 0.4));
}

function drawCartouche(ctx) {
  ctx.fillStyle = C.blue; ctx.fillRect(5.0 * G, 5.55 * G, 0.1 * G, 1.1 * G);
  label(ctx, 'Store and forward', 5.3, 5.85, 0.46, C.ink, 'left', 'EBold');
  label(ctx, 'when no route is complete', 5.3, 6.45, 0.36, '#B5BDB8', 'left', 'ESemi');
}

// ------------------------------------------------------------------ screen-space instrument: timeline (above the bottom overlay zone)
const TL = { x0: 250, x1: 930, y: 1500 };
function timeT(t) { // illustrative time cursor: crawls while waiting, runs while the relay travels (no real units)
  return clamp(K(t, [[0, 0], [T.store[1], 0.04], [T.handA[1], 0.26], [T.relayTravel[1], 0.76], [T.handB[1], 0.82], [17.2, 0.84], [30, 0.86]]));
}
function drawTimeline(ctx, t) {
  const a = env(t, 5.1, 5.6) * (1 - env(t, T.cta - 0.2, T.cta + 0.3));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  // clock icon
  const cx = 138, cy = 1468; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 17, 0, TAU); ctx.stroke();
  const an = -Math.PI / 2 + timeT(t) * TAU * 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(an) * 12, cy + Math.sin(an) * 12); ctx.stroke();
  ctx.fillStyle = hexA(C.ink, 0.7); ctx.font = '24px ESemi'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('time', 166, 1468);
  // track + progress
  const y = TL.y, X = u => lerp(TL.x0, TL.x1, u);
  ctx.strokeStyle = hexA(C.ink, 0.18); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(X(0), y); ctx.lineTo(X(1), y); ctx.stroke();
  const u = timeT(t);
  ctx.strokeStyle = C.blue; ctx.beginPath(); ctx.moveTo(X(0), y); ctx.lineTo(X(u), y); ctx.stroke();
  // delay span highlight
  const dl = env(t, T.delay, T.delay + 0.5);
  if (dl > 0) { ctx.strokeStyle = hexA(C.coral, 0.9 * dl); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X(0.04), y + 24); ctx.lineTo(X(0.82), y + 24); ctx.stroke(); ctx.fillStyle = hexA(C.coral, dl); ctx.font = '24px EBold'; ctx.textAlign = 'center'; ctx.fillText('delay', X(0.43), y + 46); }
  // event markers
  const mk = (uu, txt, tt, col = C.ink) => { const k = clamp((t - tt) / 0.25); if (k <= 0) return; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(uu), y, 9 * (0.6 + 0.4 * ease.outBack(k)), 0, TAU); ctx.fill(); ctx.font = '24px EBold'; ctx.textAlign = 'center'; ctx.fillStyle = hexA(col, k); ctx.fillText(txt, X(uu), y - 30); };
  mk(0.04, 'stored', T.store[1]);
  mk(0.26, 'carried', T.handA[1], C.blueSoft);
  mk(0.82, 'delivered', T.handB[1]);
  // cursor
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(X(u), y - 14); ctx.lineTo(X(u) - 9, y - 26); ctx.lineTo(X(u) + 9, y - 26); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// ------------------------------------------------------------------ captions (screen space; ink in y 350–470, x 90–990)
function drawCaptions(ctx, t) {
  for (const c of CAPS) {
    if (t < c.a || t > c.b) continue;
    const a = clamp((t - c.a) / 0.16) * (1 - clamp((t - (c.b - 0.14)) / 0.14));
    ctx.save(); ctx.globalAlpha = a; ctx.font = '52px EBold'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const w = Math.max(...c.l.map(s => ctx.measureText(s).width)) + 64;
    roundRect(ctx, 540 - w / 2, 334, w, c.l.length > 1 ? 152 : 92, 22); ctx.fillStyle = 'rgba(8,12,10,0.86)'; ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = C.ink;
    if (c.l.length === 1) ctx.fillText(c.l[0], 540, 398); else { ctx.fillText(c.l[0], 540, 398); ctx.fillText(c.l[1], 540, 458); }
    ctx.restore();
  }
}

// ------------------------------------------------------------------ frame
export function drawFrame(ctx, t, assets) {
  const cm = cam(t), sc = cm.z;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  ctx.save(); ctx.globalAlpha = 1 - env(t, 4.3, 4.9); drawCartouche(ctx); ctx.restore();
  drawRelayRail(ctx, t);
  drawLiveRoute(ctx, t);
  contactLink(ctx, [A[0], A[1] + 0.6], [RELAY[3][0], RELAY[3][1] - 0.32], ...T.contactA, t);
  contactLink(ctx, [RELAY[10][0], RELAY[10][1] - 0.32], [B[0], B[1] + 0.6], ...T.contactB, t);
  station(ctx, A, 'A', t, 0);
  station(ctx, B, 'B', t, clamp((t - T.deliver) / 0.3));
  const d = relayD(t);
  if (d >= 0 && t < T.relayOut[1] + 0.4) {
    const p = at(RELAY, d), ahead = at(RELAY, Math.min(RL, d + 0.3));
    ctx.save(); ctx.globalAlpha *= 1 - env(t, T.relayOut[1] - 0.3, T.relayOut[1] + 0.3);   // the relay leaves the sheet
    relayVehicle(ctx, p, Math.sign(ahead[1] - p[1]), t > T.handA[1] && t < T.handB[0], t);
    ctx.restore();
    label(ctx, 'travelling relay', p[0] + 0.95, p[1] + 0.05, 0.38, C.blueSoft, 'left', 'EBold', env(t, 7.9, 8.4) * (1 - env(t, 10.0, 10.4)));
  }
  drawMessages(ctx, t);
  drawAnnotations(ctx, t);
  drawCallout(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1000, 560, 540, 1000, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bg = ctx.createLinearGradient(0, 1640, 0, 1920); bg.addColorStop(0, 'rgba(8,11,10,0)'); bg.addColorStop(1, 'rgba(8,11,10,0.9)'); ctx.fillStyle = bg; ctx.fillRect(0, 1640, W, 280);
  drawTimeline(ctx, t);
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = '22px EMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Illustrative map · generic networking principle, not a product feature', 96, 1612);
  // CTA signature (last 3 s): icon + wordmark inside the safe area, replacing the timeline instrument
  if (assets.icon) {
    const a = env(t, T.cta, T.cta + 0.5);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 404, 1462, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 404, 1462, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 484, 1495); ctx.restore(); }
  }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  add(T.liveDraw[0], 'pen', 0.55, { dur: T.liveDraw[1] - T.liveDraw[0] }); add(T.liveBreak, 'stamp', 0.5);
  add(T.bounce[0], 'zip', 0.35); add(2.75, 'fizz', 0.5); add(T.store[1], 'stamp', 0.45);
  for (let t = T.clock + 0.2; t < T.handA[0]; t += 0.5) add(t, 'tick', 0.18);
  add(T.relayIn[0], 'clacks', 0.35, { dur: T.relayIn[1] - T.relayIn[0] }); add(T.relayIn[1], 'stop', 0.4);
  add(T.contactA[0], 'pen', 0.4, { dur: 0.35 }); add(T.handA[0], 'zip', 0.3); add(T.handA[1], 'chime', 0.35);
  add(T.relayTravel[0], 'clacks', 0.35, { dur: T.relayTravel[1] - T.relayTravel[0] }); add(T.relayTravel[1], 'stop', 0.4);
  add(T.contactB[0], 'pen', 0.4, { dur: 0.3 }); add(T.handB[0], 'zip', 0.3); add(T.deliver, 'chime', 0.45);
  add(T.relayOut[0], 'clacks', 0.25, { dur: 1.2 });
  add(T.wait2, 'stamp', 0.35); for (let t = T.wait2 + 0.3; t < 21.2; t += 0.5) add(t, 'tick', 0.14);
  add(T.compare, 'sweep', 0.3, { dur: 0.8 }); add(T.callout, 'callout', 0.4); add(T.cta, 'chime', 0.35);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
