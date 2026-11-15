// Meshline production 30s, batch 2026-11-15-english-17: "Why one message can fill the air".
// Same Transit-Map world as english-06..16 (charcoal printed sheet, electric-blue ink, label halos, paper veils, Inter
// labels, screen-space caption plate + one screen-space instrument). A 14-device mesh: naive flooding (every reception
// repeated) is simulated round by round and its transmission count shown; then managed flooding: a hop count that drops
// by one per relay (TTL, RFC 3626 §3.3; Bluetooth mesh TTL) and a "seen it" cache (RFC 3626 duplicate set; Bluetooth mesh
// message cache) so each device relays once; then a sender that doubles its wait before each retry (RFC 6298 5.5).
// Generic protocol behaviour; no Meshline relay, mesh or delivery claims (listing facts only in the CTA).
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

// ------------------------------------------------------------------ the mesh: 14 devices, links between devices in radio range
const NODES = [[3.2, 16.0], [5.6, 12.6], [5.8, 16.4], [5.4, 20.2], [8.4, 11.2], [8.6, 14.4], [8.2, 18.0], [8.8, 21.2], [11.4, 12.8], [11.2, 16.2], [11.6, 19.6], [14.2, 11.6], [14.6, 15.4], [14.4, 19.4]];
const NB = NODES.map((p, i) => NODES.map((q, j) => j).filter(j => j !== i && Math.hypot(NODES[j][0] - p[0], NODES[j][1] - p[1]) <= 3.9));
const EDGES = []; NB.forEach((l, i) => l.forEach(j => { if (j > i) EDGES.push([i, j]); }));
// naive flooding: every reception is repeated in the next round (copies bounce back and forth)
const NAIVE = []; { let tx = [{ n: 0, from: -1 }]; for (let r = 0; r <= 4; r++) { NAIVE.push(tx); const nx = []; for (const s of tx) for (const j of NB[s.n]) nx.push({ n: j, from: s.n }); tx = nx; } }
const naiveCum = NAIVE.map((_, r) => NAIVE.slice(0, r + 1).reduce((a, l) => a + l.length, 0));
// managed flooding: hop count 3 (drops by one per relay; a copy at 0 is not relayed) + "seen it" cache (one relay per device)
const HOP = NODES.map(() => Infinity); HOP[0] = 0; { const q = [0]; while (q.length) { const u = q.shift(); for (const v of NB[u]) if (HOP[v] === Infinity) { HOP[v] = HOP[u] + 1; q.push(v); } } }
const TTL0 = 3, relays = NODES.map((_, i) => HOP[i] <= TTL0).map((r, i) => r);   // devices at hop 0..3 transmit once; hop 4 receives a 0 and stops
const MANAGED_SENDS = relays.filter(Boolean).length;
const T = {
  once: 0.8, l2: 4.44, r: [4.6, 5.4, 6.2, 7.0, 7.8], cost: 10.47,
  m0: 12.3, mh: [12.3, 13.3, 14.3, 15.3], zero: 17.0, seen: 18.6,
  wait: 21.6, retries: [22.05, 22.95, 24.75], reply: 25.4, cta: 25.84,
};
const ROUND_DUR = 0.7;
const veil = t => env(t, T.cta - 0.1, T.cta + 0.6);

// ------------------------------------------------------------------ camera (one purposeful move per beat)
function cam(t) {
  return K(t, [
    [0, { x: 9.0, y: 16.0, z: 1.05 }], [4.2, { x: 9.0, y: 16.0, z: 1.08 }],             // hook: the air is full
    [4.6, { x: 9.0, y: 16.0, z: 1.03 }], [11.9, { x: 9.0, y: 16.0, z: 1.06 }],          // naive flooding grows
    [12.2, { x: 9.0, y: 16.0, z: 1.04 }], [21.0, { x: 9.0, y: 16.0, z: 1.07 }],         // hop count + seen-it list
    [21.5, { x: 6.6, y: 16.0, z: 1.38 }], [25.6, { x: 6.6, y: 16.0, z: 1.42 }],         // the sender waits longer before each retry
    [26.3, { x: 9.0, y: 16.0, z: 1.05 }], [30, { x: 9.0, y: 16.0, z: 1.08 }],
  ]);
}

// ------------------------------------------------------------------ glyphs
function device(ctx, p, a = 1, lit = 0, seen = 0, dim = 0) {
  if (a <= 0.01) return; const x = p[0] * G, y = p[1] * G, w = 0.58 * G, h = 0.96 * G;
  ctx.save(); ctx.globalAlpha *= a * (1 - dim * 0.6);
  if (lit > 0) { const g = ctx.createRadialGradient(x, y, 0, x, y, 1.1 * G); g.addColorStop(0, hexA(C.blueSoft, 0.45 * lit)); g.addColorStop(1, hexA(C.blueSoft, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 1.1 * G, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; roundRect(ctx, x - w / 2 + 3, y - h / 2 + 5, w, h, 0.1 * G); ctx.fill();
  ctx.fillStyle = C.ink; roundRect(ctx, x - w / 2, y - h / 2, w, h, 0.1 * G); ctx.fill();
  ctx.fillStyle = '#0E1412'; roundRect(ctx, x - w / 2 + 0.05 * G, y - h / 2 + 0.09 * G, w - 0.1 * G, h - 0.18 * G, 0.04 * G); ctx.fill();
  if (seen > 0) check(ctx, x, y + 0.02 * G, 0.3 * G, C.blueSoft, seen);
  ctx.restore();
}
function badge(ctx, x, y, n, a = 1) {                                       // hop-count badge riding on a copy
  if (a <= 0.01) return; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = n === 0 ? C.coral : C.blue; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 0.42 * G, y - 0.36 * G, 0.3 * G, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.font = `${0.4 * G}px EBold`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), x + 0.42 * G, y - 0.34 * G); ctx.restore();
}
function copyEnv(ctx, x, y, s, a, coral) {                                // one copy of the message (coral = going back to a device that has it)
  if (a <= 0.01) return; envelope(ctx, x, y, s, a, coral ? C.coral : C.blue);
  if (coral) { ctx.save(); ctx.globalAlpha *= a * 0.8; ctx.fillStyle = C.coral; roundRect(ctx, x - s / 2, y - s * 0.34, s, s * 0.68, s * 0.08); ctx.fill(); ctx.restore(); }
}
function puff(ctx, p, t, t0) { const k = (t - t0) / 0.5; if (k < 0 || k > 1) return; cross(ctx, [p[0] + 0.55, p[1] - 0.55], 0.14 * (0.7 + 0.3 * k), 1 - k); }

// ------------------------------------------------------------------ scene
function drawScene(ctx, t) {
  const v = veil(t);
  // radio links (printed rails)
  ctx.save(); ctx.globalAlpha *= 1 - v * 0.6; for (const [i, j] of EDGES) strokePath(ctx, [NODES[i], NODES[j]], 99, 0.06 * G, hexA(C.blueSoft, 0.28), false); ctx.restore();
  // which beat is on screen
  const hookA = 1 - env(t, 4.1, 4.45), naiveA = env(t, 4.45, 4.6) * (1 - env(t, 11.95, 12.2)), manA = env(t, 12.15, 12.3) * (1 - v);
  const lit = NODES.map(() => 0), seen = NODES.map(() => 0), dim = NODES.map(() => 0);
  // HOOK: the late naive rounds in full swing (copies everywhere, coral where they bounce back)
  if (hookA > 0.01) {
    const loop = 0.9, k = (t % loop) / loop;
    for (const rr of [3, 4]) NAIVE[rr].forEach((s, idx) => { if (s.from < 0 || idx % (rr === 4 ? 3 : 1)) return; const kk = (k + (idx % 7) / 7) % 1, a = NODES[s.from], b = NODES[s.n]; const back = idx % 3 === 0;
      copyEnv(ctx, lerp(a[0], b[0], kk) * G, lerp(a[1], b[1], kk) * G, 0.6 * G, hookA * 0.95, back); });
    NODES.forEach((_, i) => { lit[i] = 0.6 + 0.4 * Math.sin(t * 9 + i); });
  }
  // NAIVE flooding rounds: every reception repeated; copies heading back to a device that already had it turn coral
  if (naiveA > 0.01) {
    const have = new Set([0]);
    for (let r = 1; r <= 4; r++) {
      const t0 = T.r[r - 1]; if (t < t0) break; const q = r === 4 ? ((t - t0) / ROUND_DUR) % 1 : ease.inOut(inv(t0, t0 + ROUND_DUR, t));
      NAIVE[r].forEach((s, idx) => {
        if (r === 4 && idx % 2) return;                                              // draw half of round 4 (counter stays exact)
        const a = NODES[s.from], b = NODES[s.n], back = have.has(s.n);
        if (q < 1) copyEnv(ctx, lerp(a[0], b[0], q) * G, lerp(a[1], b[1], q) * G, 0.58 * G, naiveA, back);
      });
      NAIVE[r].forEach(s => have.add(s.n));
      NAIVE[r - 1].forEach(s => { lit[s.n] = Math.max(lit[s.n], 1 - clamp((t - t0) / 0.6)); });
    }
    if (t < T.r[0] + ROUND_DUR) { lit[0] = 1; }
    label(ctx, 'every device repeats', 9.0, 9.9, 0.66, C.blueSoft, 'center', 'EBold', naiveA * env(t, 5.6, 5.9) * (1 - env(t, 8.0, 8.3)));
    label(ctx, 'bouncing back', 9.0, 9.9, 0.66, C.coral, 'center', 'EBold', naiveA * env(t, 8.4, 8.7) * (1 - env(t, T.cost - 0.2, T.cost)));
    label(ctx, 'each copy costs airtime', 9.0, 9.9, 0.66, C.coral, 'center', 'EBold', naiveA * env(t, T.cost, T.cost + 0.3));
  }
  // MANAGED flooding: badges count down 3→2→1→0, each device relays once; a 0 is not relayed; repeats are dropped
  if (manA > 0.01) {
    for (let h = 0; h <= TTL0; h++) {
      const t0 = T.mh[h], q = ease.inOut(inv(t0, t0 + 0.75, t)); if (t < t0) continue;
      NODES.forEach((p, i) => {
        if (HOP[i] !== h) return;
        lit[i] = Math.max(lit[i], 1 - clamp((t - t0) / 0.7));
        for (const j of NB[i]) {
          const b = NODES[j], dup = HOP[j] <= h;                                          // goes back to someone who already has it
          if (dup && t < T.seen - 0.4) continue;                                           // duplicates shown only in the "seen it" beat
          const tt = dup ? T.seen + (i % 4) * 0.18 : t0, qq = dup ? ease.inOut(inv(tt, tt + 0.55, t)) : q;
          if (qq > 0 && qq < 1) { const x = lerp(p[0], b[0], qq) * G, y = lerp(p[1], b[1], qq) * G; copyEnv(ctx, x, y, 0.6 * G, manA, dup); badge(ctx, x, y, TTL0 - h, manA); }
          if (dup) puff(ctx, b, t, tt + 0.55);
        }
      });
    }
    NODES.forEach((_, i) => { const reachT = HOP[i] === 0 ? T.mh[0] : T.mh[HOP[i] - 1] + 0.75; seen[i] = env(t, reachT, reachT + 0.2) * env(t, T.seen - 0.3, T.seen) * (1 - env(t, 20.9, 21.3)); });
    NODES.forEach((p, i) => { if (HOP[i] === TTL0 + 1) label(ctx, '0 · stop', p[0], p[1] + 0.9, 0.42, C.coral, 'center', 'EBold', manA * env(t, T.zero, T.zero + 0.25)); });
    label(ctx, 'hop count', 9.0, 9.9, 0.66, C.blueSoft, 'center', 'EBold', manA * env(t, 13.3, 13.6) * (1 - env(t, 16.6, 16.9)));
    label(ctx, 'at zero, it stops', 9.0, 9.9, 0.66, C.coral, 'center', 'EBold', manA * env(t, T.zero - 0.1, T.zero + 0.2) * (1 - env(t, T.seen - 0.3, T.seen)));
    label(ctx, 'seen it? drop it', 9.0, 9.9, 0.66, C.blueSoft, 'center', 'EBold', manA * env(t, T.seen, T.seen + 0.3) * (1 - env(t, 21.1, 21.4)));
  }
  // RETRY beat: the sender waits for a reply; each retry waits twice as long; the reply arrives
  if (t > 21.2 && t < T.cta + 0.5) {
    const s = NODES[0], ra = env(t, 21.3, 21.6) * (1 - v);
    let prev = T.wait;
    T.retries.forEach((tr, i) => {
      const k = clamp((t - prev) / (tr - prev)); if (t > prev) { ctx.save(); ctx.globalAlpha *= ra * (t < tr + 0.3 ? 1 : 0.25); ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(s[0] * G, s[1] * G, (0.9 + i * 0.3) * G, -Math.PI / 2, -Math.PI / 2 + k * TAU); ctx.stroke(); ctx.restore(); }
      if (t > tr && t < tr + 0.6) { const q = ease.out(inv(tr, tr + 0.6, t)); envelope(ctx, (s[0] + q * 2.4) * G, (s[1] - q * 0.4) * G, 0.6 * G, ra * (1 - q)); }
      prev = tr;
    });
    if (t > T.reply - 0.6) { const q = ease.inOut(inv(T.reply - 0.6, T.reply, t)); if (q < 1) envelope(ctx, lerp(s[0] + 3.4, s[0] + 0.5, q) * G, (s[1] + 0.2) * G, 0.6 * G, ra, C.blue); }
    check(ctx, (s[0] + 0.85) * G, (s[1] - 0.95) * G, 0.5 * G, C.blueSoft, env(t, T.reply, T.reply + 0.2) * ra);
    label(ctx, 'no reply yet', s[0], s[1] + 2.05, 0.62, C.ink, 'center', 'EBold', ra * (1 - env(t, 22.5, 22.8)));
    label(ctx, 'wait longer', s[0], s[1] + 2.05, 0.62, C.blueSoft, 'center', 'EBold', ra * env(t, 23.3, 23.6) * (1 - env(t, T.reply - 0.2, T.reply)));
    label(ctx, 'reply', s[0], s[1] + 2.05, 0.62, C.blueSoft, 'center', 'EBold', ra * env(t, T.reply, T.reply + 0.2));
  }
  // the devices (drawn last)
  NODES.forEach((p, i) => device(ctx, p, 1, lit[i] * (1 - v), seen[i] * (1 - v), (t > 21.3 && i !== 0 ? 0.6 : 0)));
}

// ------------------------------------------------------------------ screen-space instrument: copies sent (computed by the simulation above)
function drawInstrument(ctx, t) {
  const A = (1 - env(t, T.cta - 0.3, T.cta + 0.15));
  if (A <= 0) return;
  ctx.save(); ctx.globalAlpha = A;
  roundRect(ctx, 96, 1418, 888, 156, 22); ctx.fillStyle = 'rgba(10,14,12,0.92)'; ctx.fill(); ctx.strokeStyle = hexA(C.blueSoft, 0.35); ctx.lineWidth = 2; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  if (t < 21.2) {
    let n = naiveCum[4], col = C.coral, lab = 'transmissions of ONE message';
    if (t >= 4.45 && t < 12.15) { n = 1; for (let r = 1; r <= 4; r++) if (t >= T.r[r - 1] + ROUND_DUR * 0.5) n = naiveCum[r]; col = n > 20 ? C.coral : C.blueSoft; }
    if (t >= 12.15) { n = 0; for (let h = 0; h <= TTL0; h++) if (t >= T.mh[h] + 0.2) n += NODES.filter((_, i) => HOP[i] === h).length; col = C.blueSoft; lab = 'with hop count + seen-it list'; }
    ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText(t >= 12.15 ? lab : 'transmissions of one message', 132, 1460);
    ctx.font = '64px EDisplay'; ctx.fillStyle = col; ctx.fillText(String(n), 132, 1524);
    if (t >= 12.15) { ctx.font = '30px EBold'; ctx.textAlign = 'right'; ctx.fillStyle = hexA(C.coral, 0.85); ctx.fillText(`vs ${naiveCum[4]} without`, 940, 1524); }
    else { ctx.font = '26px ESemi'; ctx.textAlign = 'right'; ctx.fillStyle = GREY; ctx.fillText('14 devices · illustrative', 940, 1524); }
  } else {
    ctx.font = '26px ESemi'; ctx.fillStyle = GREY; ctx.fillText('retry timer', 132, 1460);
    const X0 = 300, X1 = 940, Y = 1522, s0 = T.wait, s1 = T.retries[2] + 0.4, px = s => X0 + (X1 - X0) * (s - s0) / (s1 - s0);
    ctx.strokeStyle = hexA(C.ink, 0.25); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X0, Y); ctx.lineTo(X1, Y); ctx.stroke();
    ctx.fillStyle = C.blueSoft; ctx.fillRect(X0, Y - 3, Math.max(0, Math.min(X1, px(t)) - X0), 6);
    T.retries.forEach((tr, i) => { if (t < tr) return; ctx.fillStyle = C.blueSoft; ctx.beginPath(); ctx.arc(px(tr), Y, 12, 0, TAU); ctx.fill(); ctx.font = '24px EBold'; ctx.textAlign = 'center'; ctx.fillText(['wait 1', 'wait 2', 'wait 4'][i], (px(i ? T.retries[i - 1] : s0) + px(tr)) / 2, Y - 30); });
    ctx.font = '38px EBold'; ctx.textAlign = 'left'; ctx.fillStyle = C.ink; ctx.fillText('×2', 132, 1524);
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
  if (big) { line('THE AIR', 360, C.ink, 124); line('IS FULL', 500, C.coral, 124); }
  else { line('THE AIR', 390, C.ink, 96); line('IS FULL', 488, C.coral, 96); }
  ctx.restore();
}
export function drawFrame(ctx, t, assets) {
  drawWorld(ctx, t, cam(t));
  drawInstrument(ctx, t);
  drawTitle(ctx, 1 - env(t, 0.3, 0.55));
  drawCaptions(ctx, t);
  ctx.fillStyle = hexA(C.ink, 0.5); ctx.font = '22px EMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('Illustrative map · not to scale · generic principle, not a product feature', 96, 1612);
  if (assets.icon) {                                                        // CTA signature: official icon + wordmark in the safe area
    const a = env(t, T.cta, T.cta + 0.5);
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; roundRect(ctx, 364, 1462, 64, 64, 15); ctx.save(); ctx.clip(); ctx.drawImage(assets.icon, 364, 1462, 64, 64); ctx.restore(); ctx.fillStyle = C.ink; ctx.font = '44px EBold'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Meshline', 444, 1495); ctx.restore(); }
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
  for (let i = 0; i < 9; i++) add(0.05 + i * 0.45, 'zip', 0.06);
  add(T.once, 'click', 0.14);
  T.r.forEach((t0, r) => { add(t0, 'zip', 0.12 + r * 0.03); if (r >= 2) add(t0 + 0.3, 'fizz', 0.1 + r * 0.03); });
  add(T.cost, 'offline', 0.14);
  T.mh.forEach((t0, h) => { add(t0, 'zip', 0.16); add(t0 + 0.7, 'tick', 0.16); });
  add(T.zero, 'stamp', 0.18); for (let i = 0; i < 4; i++) add(T.seen + 0.55 + i * 0.18, 'click', 0.1);
  add(T.wait, 'tick', 0.12); T.retries.forEach(tr => add(tr, 'zip', 0.16)); add(T.reply, 'stop', 0.22);
  add(T.cta, 'chime', 0.3);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, events: ev };
}
