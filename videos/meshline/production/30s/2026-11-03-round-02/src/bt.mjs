// Meshline production 30s, round 02: "Why nearby phones can talk directly while a far-away friend needs a route".
// Same Transit-Map world as batch-02 / store-and-forward (charcoal printed sheet, electric-blue ink, white stations,
// pen tips, paper veils, printed labels, screen-space caption plate + one screen-space instrument).
// New props: a printed room floor plan with two phones, radio pulses and a direct dashed radio link, an illustrative
// radio-reach bubble that is cut back by walls and interference, a distant printed city, and a pen-drawn routed
// path through generic routers. Generic networking principles only; no Meshline radio stack, range or feature claims.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, C, clamp, lerp, inv, TAU, ease, env, hash, hexA, roundRect, K } from '../../../../education/pilot-01/src/core.mjs';

export const DURATION = 30;
const G = 60, SHEET = { w: 18, h: 32 };
const CAPS = JSON.parse(fs.readFileSync(new URL('../captions.json', import.meta.url)));
const SCREEN_CY = 1000;

// ------------------------------------------------------------------ map (G units, octilinear routes)
const ROOM = { x0: 2.2, y0: 19.4, x1: 10.4, y1: 24.0 };
const CITY = { x0: 11.4, y0: 8.4, x1: 17.0, y1: 13.2 };
const ME = [7.4, 22.4], P2 = [4.0, 22.4], R0 = [9.3, 22.4], F = [14.4, 10.0];
const ROUTE = [ME, R0, [11.0, 22.4], [12.4, 21.0], [12.4, 17.4], [14.4, 15.4], [14.4, 12.4], F];
const STOP_IDX = [0, 1, 3, 4, 5, 6, 7];                                  // ME, home router, R1, R2, R3, city router, friend
const BUILDINGS = [[11.75, 9.8, 0.95], [12.9, 10.6, 0.8], [15.2, 10.8, 0.85], [16.15, 11.3, 0.6]];   // x, top, width (ground 12.9)
const T = {
  hook: [0.3, 2.9], pull: [2.9, 4.4], bigPulse: 3.05, query: 3.95,
  tags: 5.95, link: [7.15, 7.6], token: [7.8, 8.35], noNet: 8.55, inst: 7.7,
  reach: [10.55, 11.4], limited: 11.6, distance: 12.15, walls: 13.05, interf: 13.8,
  city4: 15.75, measure: [16.45, 17.05], far: 16.75,
  route: [18.6, 20.3], internet: 20.2, hop: [20.45, 20.8, 21.2, 21.55, 21.9, 22.22, 22.55], routers: 21.25,
  close: 22.97, farAway: 24.65, cta: 26.88,
};
const len = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= L) { const k = d / L; return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; } d -= L; } return pts[pts.length - 1]; };
const CUM = ROUTE.map((_, i) => len(ROUTE.slice(0, i + 1))), RLEN = CUM[CUM.length - 1];
const STOP_D = STOP_IDX.map(i => CUM[i]);
const penD = t => RLEN * inv(...T.route, t);                              // constant-speed pen: stop pass times are exact
const passT = d => lerp(T.route[0], T.route[1], d / RLEN);
function hopD(t) {                                                        // the message hops stop to stop (brief dwell at each router)
  const h = T.hop; if (t < h[0]) return -1; if (t >= h[h.length - 1]) return RLEN;
  for (let i = 0; i < h.length - 1; i++) if (t < h[i + 1]) return lerp(STOP_D[i], STOP_D[i + 1], ease.inOut(inv(h[i] + 0.07, h[i + 1], t)));
  return RLEN;
}
// illustrative radio reach (not to scale): inside the room, beyond the walls, and with interference
const rIn = t => 4.2 * ease.out(inv(...T.reach, t)) - 0.25 * ease.inOut(inv(T.interf, T.interf + 0.5, t));
const rOut = t => Math.min(rIn(t), lerp(4.2, 2.2, ease.inOut(inv(T.walls, T.walls + 0.5, t))));
const wob = t => 0.12 * ease.inOut(inv(T.interf, T.interf + 0.4, t));

// ------------------------------------------------------------------ camera (one purposeful move per beat)
const WIDE = { x: 9.6, y: 16.3, z: 0.88 };
function cam(t) {
  return K(t, [
    [0, { x: 6.3, y: 21.5, z: 1.45 }], [2.9, { x: 6.3, y: 21.45, z: 1.48 }], [4.4, WIDE], [4.9, { x: 9.6, y: 16.3, z: 0.885 }],
    [5.9, { x: 6.3, y: 21.8, z: 1.65 }], [10.2, { x: 6.25, y: 21.85, z: 1.68 }],
    [11.0, { x: 7.0, y: 22.0, z: 1.25 }], [14.6, { x: 7.0, y: 22.05, z: 1.27 }],
    [15.9, WIDE], [18.3, { x: 9.6, y: 16.3, z: 0.885 }],
    [22.6, { x: 10.1, y: 16.25, z: 0.885 }],                              // drift with the message as it climbs the route
    [23.5, WIDE], [30, { x: 9.6, y: 16.35, z: 0.9 }],
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
function envelope(ctx, p, s = 0.62, alpha = 1, col = C.ink) {           // printed envelope token (a message)
  const x = p[0] * G, y = p[1] * G, w = s * G, h = s * 0.68 * G;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; roundRect(ctx, -w / 2 + 3, -h / 2 + 5, w, h, 4); ctx.fill();
  ctx.fillStyle = col; roundRect(ctx, -w / 2, -h / 2, w, h, 4); ctx.fill();
  ctx.strokeStyle = C.blue; ctx.lineWidth = Math.max(2, w * 0.07); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-w / 2 + 3, -h / 2 + 3); ctx.lineTo(0, h * 0.08); ctx.lineTo(w / 2 - 3, -h / 2 + 3); ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------------------ props
function phone(ctx, p, lit = 0, waves = 0) {                             // generic phone glyph (no UI, no app screen)
  const x = p[0] * G, y = p[1] * G, w = 0.62 * G, h = 1.04 * G;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.13 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.13 * G); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.07 * G, y - h / 2 + 0.12 * G, w - 0.14 * G, h - 0.24 * G, 0.05 * G); ctx.fill();
  if (lit > 0) { ctx.fillStyle = hexA(C.blue, 0.85 * lit); roundRect(ctx, x - w / 2 + 0.07 * G, y - h / 2 + 0.12 * G, w - 0.14 * G, h - 0.24 * G, 0.05 * G); ctx.fill(); }
  if (waves > 0) {                                                        // radio arcs above the phone
    ctx.save(); ctx.globalAlpha *= waves; ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(x, y - h / 2 - 0.02 * G, (0.2 + i * 0.17) * G, -Math.PI * 0.78, -Math.PI * 0.22); ctx.stroke(); }
    ctx.restore();
  }
}
function router(ctx, p, lit = 0, dim = 0) {                              // generic router glyph (box + two antennas)
  const x = p[0] * G, y = p[1] * G, w = 0.95 * G, h = 0.5 * G;
  ctx.save(); ctx.globalAlpha *= 1 - 0.6 * dim;
  ctx.strokeStyle = C.ink; ctx.lineWidth = 0.07 * G; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - w * 0.3, y - h / 2); ctx.lineTo(x - w * 0.36, y - h / 2 - 0.32 * G); ctx.moveTo(x + w * 0.3, y - h / 2); ctx.lineTo(x + w * 0.36, y - h / 2 - 0.32 * G); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 4, y - h / 2 + 7, w, h, 0.12 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.12 * G); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = lit > 0 ? hexA(C.blue, 0.4 + 0.6 * lit) : '#9AA39F'; ctx.beginPath(); ctx.arc(x - 0.2 * G + i * 0.2 * G, y, 0.055 * G, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function routerStop(ctx, p, lit = 0) {                                    // interchange ring = a router on the internet
  const x = p[0] * G, y = p[1] * G, r = 0.3 * G;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(x + 3, y + 5, r, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.charcoal; ctx.lineWidth = 0.08 * G; ctx.stroke();
  if (lit > 0) { ctx.fillStyle = hexA(C.blue, lit); ctx.beginPath(); ctx.arc(x, y, r * 0.48, 0, TAU); ctx.fill(); }
}
function pulse(ctx, c, age, dur, maxR, alpha = 1, col = C.blueSoft) {     // one expanding radio pulse
  if (age < 0 || age > dur) return;
  const k = age / dur; ctx.strokeStyle = hexA(col, alpha * (1 - k) * 0.9); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(c[0] * G, c[1] * G, (0.35 + (maxR - 0.35) * k) * G, 0, TAU); ctx.stroke();
}
const D12 = Math.hypot(ME[0] - P2[0], ME[1] - P2[1]);

// ------------------------------------------------------------------ beats
function drawRoom(ctx, t) {
  const wl = env(t, T.walls, T.walls + 0.2) * (1 - env(t, T.walls + 0.9, T.walls + 1.5));     // walls flash when they cut the reach
  const hl = env(t, T.close, T.close + 0.4) * (1 - env(t, T.farAway - 0.1, T.farAway + 0.3)); // takeaway: "close by"
  ctx.fillStyle = hexA(C.blue, 0.05 + 0.06 * hl); ctx.fillRect(ROOM.x0 * G, ROOM.y0 * G, (ROOM.x1 - ROOM.x0) * G, (ROOM.y1 - ROOM.y0) * G);
  const col = wl > 0 ? (wl > 0.5 ? C.blueSoft : C.ink) : C.ink;
  ctx.save(); ctx.lineCap = 'square';
  const doorA = 5.4, doorB = 6.6;                                          // printed floor plan: walls with a door gap
  const walls = [[[doorB, ROOM.y1], [ROOM.x1, ROOM.y1], [ROOM.x1, ROOM.y0], [ROOM.x0, ROOM.y0], [ROOM.x0, ROOM.y1], [doorA, ROOM.y1]]];
  for (const w of walls) { ctx.globalAlpha = 0.85; strokePath(ctx, w, 99, (0.16 + 0.06 * wl) * G, col, true); }
  ctx.globalAlpha = 0.5; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([5, 6]);
  ctx.beginPath(); ctx.arc(doorA * G, ROOM.y1 * G, (doorB - doorA) * G, -Math.PI / 2, 0); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  label(ctx, 'one room', ROOM.x0 + 0.1, ROOM.y0 - 0.5, 0.42, C.ink, 'left', 'EBold', 1 - env(t, T.close - 0.2, T.close + 0.2));
  label(ctx, 'close by: direct link', ROOM.x0 + 0.1, ROOM.y0 - 0.55, 0.52, C.ink, 'left', 'EBold', env(t, T.close, T.close + 0.4));
}

function drawCity(ctx, t, a) {
  if (a <= 0.01) return;
  const hl = env(t, T.farAway, T.farAway + 0.4);
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = hexA(C.blue, 0.05); roundRect(ctx, CITY.x0 * G, CITY.y0 * G, (CITY.x1 - CITY.x0) * G, (CITY.y1 - CITY.y0) * G, 0.3 * G); ctx.fill();
  ctx.strokeStyle = hexA(C.blueSoft, 0.55); ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]); ctx.stroke(); ctx.setLineDash([]);
  for (const [bx, top, bw] of BUILDINGS) {
    ctx.fillStyle = '#18201D'; ctx.fillRect(bx * G, top * G, bw * G, (12.9 - top) * G);
    ctx.strokeStyle = hexA(C.blueSoft, 0.5); ctx.lineWidth = 2; ctx.strokeRect(bx * G, top * G, bw * G, (12.9 - top) * G);
    ctx.fillStyle = hexA(C.ink, 0.28);
    for (let yy = top + 0.35; yy < 12.6; yy += 0.45) for (let xx = bx + 0.18; xx < bx + bw - 0.15; xx += 0.3) ctx.fillRect(xx * G, yy * G, 0.1 * G, 0.14 * G);
  }
  ctx.strokeStyle = hexA(C.ink, 0.35); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo((CITY.x0 + 0.2) * G, 12.9 * G); ctx.lineTo((CITY.x1 - 0.2) * G, 12.9 * G); ctx.stroke();
  ctx.restore();
  label(ctx, 'another city', (CITY.x0 + CITY.x1) / 2, CITY.y0 + 0.5, 0.48, C.ink, 'center', 'EBold', a);
  const arrived = clamp((t - T.hop[6]) / 0.3);
  ctx.save(); ctx.globalAlpha *= a; phone(ctx, F, Math.max(arrived, 0.6 * hl * (0.5 + 0.5 * Math.sin(t * 5)))); ctx.restore();
  label(ctx, 'friend', F[0] + 0.55, F[1] + 0.02, 0.4, C.ink, 'left', 'EBold', a);
  const q = clamp((t - T.query) / 0.3) * (1 - env(t, T.route[1] - 0.2, T.route[1] + 0.2));
  if (q > 0) { ctx.save(); ctx.globalAlpha *= a; label(ctx, '?', F[0] - 0.55, F[1] - 0.05, 0.75 * ease.outBack(clamp((t - T.query) / 0.35)), C.coral, 'right', 'EDisplay', q); ctx.restore(); }
  ring(ctx, F, t - T.hop[6], C.blueSoft, 1.0);
}

function drawReach(ctx, t) {
  const ri = rIn(t); if (ri <= 0.05) return;
  const ro = rOut(t), w = wob(t), a = 0.75 + 0.25 * (1 - env(t, 15.0, 16.0));
  const blob = (r) => {                                                    // reach outline (wobbly once interference arrives)
    ctx.beginPath();
    for (let i = 0; i <= 96; i++) { const th = i / 96 * TAU, rr = r + w * Math.sin(7 * th + t * 6) + w * 0.6 * Math.sin(11 * th - t * 4); const x = (ME[0] + Math.cos(th) * rr) * G, y = (ME[1] + Math.sin(th) * rr) * G; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath();
  };
  const fillBlob = (r) => {
    const g = ctx.createRadialGradient(ME[0] * G, ME[1] * G, 0, ME[0] * G, ME[1] * G, r * G);
    g.addColorStop(0, hexA(C.blue, 0.28 * a)); g.addColorStop(0.75, hexA(C.blue, 0.1 * a)); g.addColorStop(1, hexA(C.blue, 0.03 * a));
    blob(r); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = hexA(C.blueSoft, 0.75 * a); ctx.lineWidth = 3; ctx.setLineDash([10, 9]); ctx.stroke(); ctx.setLineDash([]);
  };
  ctx.save(); ctx.beginPath(); ctx.rect(ROOM.x0 * G, ROOM.y0 * G, (ROOM.x1 - ROOM.x0) * G, (ROOM.y1 - ROOM.y0) * G); ctx.clip(); fillBlob(ri); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, SHEET.w * G, SHEET.h * G); ctx.rect(ROOM.x0 * G, ROOM.y0 * G, (ROOM.x1 - ROOM.x0) * G, (ROOM.y1 - ROOM.y0) * G); ctx.clip('evenodd'); fillBlob(ro); ctx.restore();
  // reach labels
  const lb = 1 - env(t, 14.9, 15.4);
  label(ctx, 'radio reach', ME[0] + 0.2, ME[1] - ri - 0.42 + 0.2, 0.42, C.blueSoft, 'center', 'EBold', env(t, T.reach[0] + 0.4, T.reach[1]) * (1 - env(t, T.distance - 0.3, T.distance)));
  label(ctx, 'limited', ME[0] + 1.2, ME[1] + 1.15, 0.4, C.ink, 'left', 'EBold', env(t, T.limited, T.limited + 0.3) * lb);
  // distance: signal fades along a radius (strong near the phone, faint at the edge)
  const dk = env(t, T.distance, T.distance + 0.45) * lb;
  if (dk > 0) {
    const dir = [-Math.SQRT1_2, -Math.SQRT1_2], L = 3.75 * dk;
    for (let i = 0; i < 4; i++) {
      const s = 0.85 + i * 0.95; if (s > L) break;
      const p = [ME[0] + dir[0] * s, ME[1] + dir[1] * s], bars = 4 - i;
      for (let b = 0; b < 4; b++) { ctx.fillStyle = b < bars ? hexA(C.ink, 0.95) : hexA(C.ink, 0.18); ctx.fillRect((p[0] - 0.3 + b * 0.16) * G, (p[1] + 0.12 - 0.09 * (b + 1)) * G, 0.1 * G, 0.09 * (b + 1) * G); }
    }
    label(ctx, 'distance', ME[0] + dir[0] * 3.75 - 0.6, ME[1] + dir[1] * 3.75 + 0.02, 0.4, C.ink, 'right', 'EBold', dk);
  }
  // walls: the part of the reach beyond the walls is cut back
  const wk = env(t, T.walls, T.walls + 0.35) * lb;
  if (wk > 0) {
    label(ctx, 'walls', ME[0], ROOM.y1 + 1.15, 0.4, C.ink, 'center', 'EBold', wk);
    ctx.save(); ctx.globalAlpha *= wk; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ME[0] * G, (ROOM.y1 + 0.85) * G); ctx.lineTo(ME[0] * G, (ROOM.y1 + 0.25) * G); ctx.stroke(); ctx.restore();
  }
  // interference: coral static from another source cuts the reach a little more
  const ik = env(t, T.interf, T.interf + 0.35) * lb;
  if (ik > 0) {
    const c = [9.25, 20.15];
    ctx.save(); ctx.globalAlpha *= ik; ctx.strokeStyle = C.coral; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const ph = t * 7 + i * 1.7, ox = (hash(i * 3.1) - 0.5) * 0.9, oy = (hash(i * 5.3) - 0.5) * 0.6;
      ctx.beginPath(); for (let j = 0; j <= 6; j++) { const x = (c[0] + ox - 0.3 + j * 0.1) * G, y = (c[1] + oy + (j % 2 ? -0.09 : 0.09) * Math.sin(ph)) * G; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    }
    ctx.restore();
    label(ctx, 'interference', 8.55, 20.15, 0.4, C.coral, 'right', 'EBold', ik);
  }
}

function drawLocal(ctx, t) {
  // hook: the two phones talk directly: pulses alternate between them
  let litMe = 0, litP2 = 0;
  for (let k = 0; k < 4; k++) {
    const s = T.hook[0] + k * 0.72, from = k % 2 ? P2 : ME, dur = 0.85, age = t - s;
    pulse(ctx, from, age, dur, D12 + 0.25, 1 - env(t, 2.9, 3.2));
    const arr = s + dur * (D12 - 0.35) / (D12 - 0.1), fl = clamp(1 - Math.abs(t - arr) / 0.25);
    if (k % 2) litMe = Math.max(litMe, fl); else litP2 = Math.max(litP2, fl);
  }
  // hook pull-back: one pulse spreads out and fades long before the other city
  const bAge = t - T.bigPulse;
  if (bAge > 0 && bAge < 1.5) { const k = bAge / 1.5; ctx.strokeStyle = hexA(C.blueSoft, 0.85 * Math.pow(1 - k, 2.2)); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ME[0] * G, ME[1] * G, (0.4 + 7.0 * ease.out(k)) * G, 0, TAU); ctx.stroke(); }
  // after the reach is drawn: soft beacon pulses that stop at the edge of the reach
  if (t > T.reach[1]) for (let k = 0; k < 30; k++) { const s = T.reach[1] + k * 1.1; pulse(ctx, ME, t - s, 1.0, rIn(t) * 0.97, 0.55); }
  // direct radio link (pen-drawn dashed link between the two radios)
  const lk = ease.out(inv(...T.link, t));
  const hlClose = env(t, T.close, T.close + 0.4) * (1 - env(t, T.farAway - 0.1, T.farAway + 0.3));
  if (lk > 0) {
    const a = [ME[0] - 0.45, ME[1]], b = [P2[0] + 0.45, P2[1]];
    strokePath(ctx, [a, b], Math.hypot(a[0] - b[0], 0) * lk, (0.14 + 0.06 * hlClose) * G, hlClose > 0.3 ? C.ink : C.blueSoft, true, [14, 9]);
    if (lk < 1) penTip(ctx, at([a, b], Math.hypot(a[0] - b[0], 0) * lk));
  }
  // a message crosses the link directly (beat 2), then loops in the takeaway
  if (t > T.token[0] && t < T.token[1] + 0.15) { const k = ease.inOut(inv(...T.token, t)); envelope(ctx, [lerp(ME[0] - 0.4, P2[0] + 0.4, k), ME[1] - 0.62 - Math.sin(k * Math.PI) * 0.18], 0.55); }
  if (t > T.token[1]) litP2 = Math.max(litP2, clamp(1 - (t - T.token[1]) / 0.5));
  if (t > T.close) {
    const u = ((t - T.close) / 1.3) % 2, dirR = u < 1, k = ease.inOut(u % 1), fade = Math.min(1, (u % 1) / 0.12, (1 - (u % 1)) / 0.12) * env(t, T.close, T.close + 0.3);
    const x = dirR ? lerp(ME[0] - 0.4, P2[0] + 0.4, k) : lerp(P2[0] + 0.4, ME[0] - 0.4, k);
    envelope(ctx, [x, ME[1] - 0.62 - Math.sin(k * Math.PI) * 0.18], 0.5, fade);
  }
  // labels for the direct link
  const lab = 1 - env(t, 10.2, 10.6);
  label(ctx, 'Bluetooth radios', (ME[0] + P2[0]) / 2, ME[1] - 1.55, 0.44, C.blueSoft, 'center', 'EBold', env(t, T.tags, T.tags + 0.3) * (1 - env(t, T.link[1] - 0.1, T.link[1] + 0.2)));
  label(ctx, 'direct radio link', (ME[0] + P2[0]) / 2, ME[1] - 1.55, 0.44, C.ink, 'center', 'EBold', env(t, T.link[1] - 0.05, T.link[1] + 0.25) * lab);
  label(ctx, 'no internet needed', (ME[0] + P2[0]) / 2, ME[1] + 0.95, 0.4, C.blueSoft, 'center', 'EBold', env(t, T.noNet, T.noNet + 0.3) * lab);
  const waves = env(t, T.tags, T.tags + 0.3) * (1 - env(t, 10.2, 10.6));
  phone(ctx, P2, litP2, waves);
  phone(ctx, ME, Math.max(litMe, 0.35 * env(t, T.route[0], T.route[0] + 0.3) * (1 - env(t, T.hop[1], T.hop[1] + 0.3))), waves);
}

function drawRoute(ctx, t) {
  // the internet: many networks joined by routers (printed dashed zone)
  const za = env(t, T.internet, T.internet + 0.4);
  if (za > 0) {
    ctx.save(); ctx.globalAlpha *= za; ctx.strokeStyle = hexA(C.blueSoft, 0.45); ctx.lineWidth = 2.5; ctx.setLineDash([4, 10]);
    roundRect(ctx, 11.3 * G, 14.3 * G, 5.4 * G, 7.6 * G, 0.6 * G); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    label(ctx, 'internet', 15.35, 19.5, 0.5, C.ink, 'center', 'EBold', za);
  }
  const d = penD(t), farHl = env(t, T.farAway, T.farAway + 0.4);
  if (d > 0) {
    if (farHl > 0) strokePath(ctx, ROUTE, d, 0.42 * G, hexA(C.blueSoft, 0.25 * farHl), false);
    strokePath(ctx, ROUTE, d, 0.24 * G, C.blue);
    if (d < RLEN) penTip(ctx, at(ROUTE, d));
  }
  // stops pop as the pen reaches them; routers light as the message hops through
  const hd = hopD(t);
  for (let i = 1; i < STOP_IDX.length - 1; i++) {
    const p = ROUTE[STOP_IDX[i]], pt = passT(STOP_D[i]);
    if (i === 1) continue;                                                 // the home router is drawn in the room layer
    const s = ease.outBack(clamp((t - pt) / 0.3)); if (s <= 0) continue;
    const lit = clamp((t - T.hop[i]) / 0.15) * (1 - clamp((t - T.hop[i] - 0.5) / 0.4) * 0.6);
    ctx.save(); ctx.translate(p[0] * G, p[1] * G); ctx.scale(s, s); ctx.translate(-p[0] * G, -p[1] * G);
    i === 5 ? router(ctx, p, lit) : routerStop(ctx, p, lit); ctx.restore();
    ring(ctx, p, t - pt, C.blueSoft, 0.5); ring(ctx, p, t - T.hop[i], C.ink, 0.6);
  }
  label(ctx, 'routers', 12.95, 17.45, 0.42, C.ink, 'left', 'EBold', env(t, T.routers, T.routers + 0.3));
  label(ctx, 'router', R0[0], R0[1] + 0.68, 0.36, '#B5BDB8', 'center', 'ESemi', 1 - env(t, T.noNet - 0.2, T.noNet + 0.2) * (1 - env(t, T.route[0], T.route[0] + 0.4)));
  // the message hops along the route (beat 5), then loops in the takeaway
  if (hd >= 0 && t < T.hop[6] + 0.25) { const p = at(ROUTE, hd); envelope(ctx, [p[0] + 0.05, p[1] - 0.62], 0.55, 1 - clamp((t - T.hop[6]) / 0.25)); }
  if (t > T.farAway) {
    const u = ((t - T.farAway) / 2.4) % 1, k = ease.inOut(clamp(u / 0.85)), fade = Math.min(1, u / 0.08, (0.92 - u) / 0.07) * env(t, T.farAway, T.farAway + 0.3);
    if (fade > 0) { const p = at(ROUTE, RLEN * k); envelope(ctx, [p[0] + 0.05, p[1] - 0.62], 0.52, fade); }
  }
  label(ctx, 'far away: network route', 13.8, 14.15, 0.5, C.ink, 'right', 'EBold', farHl);
}

function drawFar(ctx, t, a) {
  // beat 4: the friend is far beyond the reach (dashed measure line from the reach edge)
  const mk = ease.out(inv(...T.measure, t)) * (1 - env(t, 18.2, 18.6)) * a;
  if (mk <= 0) return;
  const v = [F[0] - ME[0], F[1] - ME[1]], L = Math.hypot(...v), u = [v[0] / L, v[1] / L];
  const s0 = rIn(t) + 0.05, s1 = L - 1.2, p0 = [ME[0] + u[0] * s0, ME[1] + u[1] * s0];
  const p1 = [ME[0] + u[0] * lerp(s0, s1, mk), ME[1] + u[1] * lerp(s0, s1, mk)];
  ctx.save(); ctx.strokeStyle = hexA(C.coral, 0.9); ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(p0[0] * G, p0[1] * G); ctx.lineTo(p1[0] * G, p1[1] * G); ctx.stroke(); ctx.setLineDash([]);
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo((p0[0] - u[1] * 0.3) * G, (p0[1] + u[0] * 0.3) * G); ctx.lineTo((p0[0] + u[1] * 0.3) * G, (p0[1] - u[0] * 0.3) * G); ctx.stroke();
  ctx.restore();
  label(ctx, 'far beyond radio reach', 10.75, 15.55, 0.5, C.coral, 'right', 'EBold', env(t, T.far, T.far + 0.35) * (1 - env(t, 18.2, 18.6)));
}

function drawCartouche(ctx, a) {
  if (a <= 0.01) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = C.blue; ctx.fillRect(2.3 * G, 17.0 * G, 0.1 * G, 1.25 * G); ctx.restore();
  label(ctx, 'Near or far?', 2.6, 17.35, 0.52, C.ink, 'left', 'EBold', a);
  label(ctx, 'direct radio vs network route', 2.6, 17.98, 0.36, '#B5BDB8', 'left', 'ESemi', a);
}

// ------------------------------------------------------------------ screen-space instrument: path panel (above the bottom overlay zone)
function drawInstrument(ctx, t) {
  const a = env(t, T.inst, T.inst + 0.5) * (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  const h1 = env(t, T.close, T.close + 0.3) * (1 - env(t, T.farAway - 0.1, T.farAway + 0.2)), h2 = env(t, T.farAway, T.farAway + 0.3);
  if (h1 > 0) { ctx.fillStyle = hexA(C.blue, 0.22 * h1); roundRect(ctx, 108, 1428, 864, 66, 14); ctx.fill(); }
  if (h2 > 0) { ctx.fillStyle = hexA(C.blue, 0.22 * h2); roundRect(ctx, 108, 1498, 864, 66, 14); ctx.fill(); }
  const XA = 330, XB = 690, Y1 = 1461, Y2 = 1531;
  const mini = (x, y, lit = 0) => { ctx.fillStyle = C.ink; roundRect(ctx, x - 9, y - 15, 18, 30, 5); ctx.fill(); ctx.fillStyle = lit > 0 ? hexA(C.blue, lit) : '#0E1412'; roundRect(ctx, x - 6, y - 10, 12, 20, 2); ctx.fill(); };
  ctx.font = '27px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  // row 1: nearby → direct radio link
  ctx.fillStyle = C.ink; ctx.fillText('nearby', 132, Y1);
  ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 5; ctx.setLineDash([12, 8]); ctx.beginPath(); ctx.moveTo(XA + 16, Y1); ctx.lineTo(XB - 16, Y1); ctx.stroke(); ctx.setLineDash([]);
  mini(XA, Y1); mini(XB, Y1);
  ctx.fillStyle = C.blueSoft; ctx.fillText('direct radio', 724, Y1);
  // row 2: far away → route via routers (fills in as the pen and the message travel)
  const r2 = env(t, T.city4, T.city4 + 0.4);
  if (r2 > 0) {
    ctx.save(); ctx.globalAlpha *= r2;
    ctx.fillStyle = C.ink; ctx.fillText('far away', 132, Y2);
    const pk = penD(t) / RLEN;
    ctx.strokeStyle = hexA(C.ink, 0.16); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(XA + 16, Y2); ctx.lineTo(XB - 16, Y2); ctx.stroke();
    if (pk > 0) { ctx.strokeStyle = C.blue; ctx.beginPath(); ctx.moveTo(XA + 16, Y2); ctx.lineTo(lerp(XA + 16, XB - 16, pk), Y2); ctx.stroke(); }
    for (let i = 1; i <= 5; i++) {
      const x = lerp(XA, XB, i / 6), lit = clamp((t - T.hop[i]) / 0.15), shown = clamp((pk - i / 6 + 0.02) / 0.04);
      if (shown <= 0) continue;
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, Y2, 9, 0, TAU); ctx.fill();
      if (lit > 0) { ctx.fillStyle = hexA(C.blue, lit); ctx.beginPath(); ctx.arc(x, Y2, 5, 0, TAU); ctx.fill(); }
    }
    mini(XA, Y2, 0); mini(XB, Y2, clamp((t - T.hop[6]) / 0.3));
    const via = env(t, T.routers, T.routers + 0.3);
    ctx.fillStyle = hexA(C.coral, 1 - via); ctx.font = '30px EDisplay'; ctx.fillText('?', 724, Y2);
    ctx.fillStyle = hexA(C.ink, via); ctx.font = '27px EBold'; ctx.fillText('via routers', 724, Y2);
    ctx.restore();
  }
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
  const cityTop = SCREEN_CY + (CITY.y0 - 0.2 - cm.y) * G * sc, cityRight = 540 + (CITY.x1 - cm.x) * G * sc;
  const farA = Math.min(clamp((1.2 - sc) / 0.22), clamp((cityTop - 500) / 50), clamp((1060 - cityRight) / 40));   // paper veil: the far city shows only when it sits fully in frame below the captions
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#080B0A'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(sc, 0, 0, sc, 540 - cm.x * G * sc, SCREEN_CY - cm.y * G * sc);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, 14, 20, SHEET.w * G, SHEET.h * G, 8); ctx.fill();
  ctx.drawImage(sheetImage(), 0, 0, SHEET.w * G, SHEET.h * G);
  drawCartouche(ctx, 1 - env(t, 4.6, 5.0));
  drawRoom(ctx, t);
  drawReach(ctx, t);
  drawCity(ctx, t, farA);
  drawFar(ctx, t, farA);
  router(ctx, R0, clamp((t - T.hop[1]) / 0.15) * (1 - 0.6 * clamp((t - T.hop[1] - 0.5) / 0.4)), env(t, T.noNet - 0.2, T.noNet + 0.2) * (1 - env(t, T.route[0], T.route[0] + 0.4)));
  ring(ctx, R0, t - passT(STOP_D[1]), C.blueSoft, 0.5); ring(ctx, R0, t - T.hop[1], C.ink, 0.6);
  drawRoute(ctx, t);
  drawLocal(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vg = ctx.createRadialGradient(540, 1000, 560, 540, 1000, 1260); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  const tg = ctx.createLinearGradient(0, 0, 0, 320); tg.addColorStop(0, 'rgba(8,11,10,0.82)'); tg.addColorStop(1, 'rgba(8,11,10,0)'); ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 320);
  const bg = ctx.createLinearGradient(0, 1640, 0, 1920); bg.addColorStop(0, 'rgba(8,11,10,0)'); bg.addColorStop(1, 'rgba(8,11,10,0.9)'); ctx.fillStyle = bg; ctx.fillRect(0, 1640, W, 280);
  drawInstrument(ctx, t);
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = '22px EMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Illustrative map · not to scale · generic principle, not a product feature', 96, 1612);
  // CTA signature (last 3 s): icon + wordmark inside the safe area, replacing the instrument
  if (assets.icon) {
    const a = env(t, T.cta, T.cta + 0.5);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 404, 1462, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 404, 1462, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 484, 1495); ctx.restore(); }
  }
}

export function cues() {
  const ev = []; const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(3), type, gain, ...extra });
  for (let k = 0; k < 4; k++) add(T.hook[0] + k * 0.72 + 0.62, 'stop', 0.22);           // each radio pulse lands on the other phone
  add(T.pull[0], 'sweep', 0.3, { dur: 1.2 }); add(T.query, 'retry', 0.3);
  add(T.tags, 'click', 0.35); add(T.link[0], 'pen', 0.45, { dur: T.link[1] - T.link[0] }); add(T.token[0], 'zip', 0.3); add(T.token[1], 'chime', 0.32);
  add(T.reach[0], 'sweep', 0.25, { dur: 0.9 });
  for (let i = 0; i < 4; i++) add(T.distance + 0.1 + i * 0.1, 'bar', 0.22, { step: 3 - i });
  add(T.walls, 'thunk', 0.45); add(T.interf, 'fizz', 0.4);
  add(14.9, 'sweep', 0.28, { dur: 1.3 }); add(T.measure[0], 'penShort', 0.4, { dur: 0.6 }); add(T.far, 'offline', 0.25);
  add(T.route[0], 'pen', 0.5, { dur: T.route[1] - T.route[0] });
  for (let i = 1; i < STOP_D.length - 1; i++) add(passT(STOP_D[i]), 'stop', 0.2);
  for (let i = 1; i < T.hop.length - 1; i++) add(T.hop[i], 'turn', 0.4);
  add(T.hop[6], 'chime', 0.38);
  add(T.close, 'callout', 0.28); add(T.farAway, 'callout', 0.28); add(T.cta, 'chime', 0.32);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
