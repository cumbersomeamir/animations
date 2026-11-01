// Meshline 15s style test: text-message-animation grammar, reimplemented on @napi-rs/canvas.
// Single source of truth: thread/meshline-thread.json -> buildTimeline() -> every pop, typing window,
// receipt, scroll offset and sound cue. drawFrame(ctx, t) is a pure function of time (no clocks, no RNG).
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';

export const W = 1080, H = 1920, FPS = 30;
const DATA = JSON.parse(fs.readFileSync(new URL('../thread/meshline-thread.json', import.meta.url)));
export const DURATION = DATA.durationMs / 1000;
const ICON_PATH = JSON.parse(fs.readFileSync(new URL('../../../project/src/iconPath.json', import.meta.url)));

// palette: sampled from assets/icon.png (overrides the skill's iMessage/WhatsApp defaults)
export const C = {
  bg: '#111714', ink: '#F7F7F2', blue: '#3157FF', blueSoft: '#8EA2FF',
  recv: '#222B28', header: '#151C19', hair: '#26302C', field: '#19211E',
  muted: '#8D9692', dim: '#5E6864', coral: '#FF6A5C', failFill: '#2A3350',
};

// ------------------------------------------------------------------ helpers
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, v) => clamp((v - a) / (b - a));
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeInOut = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
const TAU = Math.PI * 2;

// Damped spring 0 -> 1 (same physics model the skill's Remotion spring() uses: mass/stiffness/damping)
export function spring(tSec, { damping = 14, mass = 0.7, stiffness = 100 } = {}) {
  if (tSec <= 0) return 0;
  const w0 = Math.sqrt(stiffness / mass), z = damping / (2 * Math.sqrt(stiffness * mass));
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * tSec) * (Math.cos(wd * tSec) + (z * w0 / wd) * Math.sin(wd * tSec));
  }
  const r1 = -w0 * (z - Math.sqrt(z * z - 1)), r2 = -w0 * (z + Math.sqrt(z * z - 1));
  return 1 - (r2 * Math.exp(r1 * tSec) - r1 * Math.exp(r2 * tSec)) / (r2 - r1);
}
const POP = { damping: 14, mass: 0.7, stiffness: 100 };   // skill: bubble entrance
const TAP = { damping: 9, mass: 0.5, stiffness: 100 };    // skill: tapback overshoot

function roundRectPath(ctx, x, y, w, h, r) {
  const [tl, tr, br, bl] = Array.isArray(r) ? r : [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y); ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br); ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h); ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl); ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}

// ------------------------------------------------------------------ timeline (skill §4, extended)
export function buildTimeline(thread) {
  let cursor = 0;
  const timed = thread.map((m, i) => {
    if (m.history) return { ...m, i, typingStartMs: -2000, typingLenMs: 0, enterMs: -2000 }; // already on screen
    cursor += m.delayMs ?? 500;
    const typingLenMs = m.from === 'them' ? (m.typingMs ?? 800) : 0;
    const typingStartMs = cursor;
    cursor += typingLenMs;
    const enterMs = cursor;
    cursor += 250;
    return { ...m, i, typingStartMs, typingLenMs, enterMs };
  });
  return { timed, cursorMs: cursor };
}
const { timed: TL, cursorMs } = buildTimeline(DATA.thread);
const S = ms => ms / 1000;
const SWITCH = S(TL.find(m => m.system).enterMs);
const END = S(TL.find(m => m.end).enterMs);
// Adaptation: the skill derives duration (cursor + 1000ms tail). The brief demands exactly 15.0s, so the
// tail after the end card is fixed by durationMs and asserted to be a readable hold (>= 3s).
if (DATA.durationMs - TL.find(m => m.end).enterMs < 3000) throw new Error('end-card hold < 3s; shorten the thread');

// ------------------------------------------------------------------ layout constants (skill safe areas)
const STATUS_H = 110, HEADER_BOTTOM = 270;          // status bar ~120, header ~150
const BAND_TOP = 290, FLOOR = 1505;                 // newest bubble lands in the lower third, above compose
const COMPOSE_Y = 1560;                             // bottom ~360 kept clear (compose + platform UI)
const GUTTER = 60;                                  // centre ~88% width
const MAXW = Math.round(W * 0.74);                  // bubble max width 74%
const FONT = 48, LH = 62, PADX = 34, PADY = 22, RAD = 34, TAILR = 9;
const RUN_GAP = 30, IN_RUN_GAP = 10, RECEIPT_H = 46, TYPING_W = 170, TYPING_H = 106;

const mctx = createCanvas(10, 10).getContext('2d');
function wrap(text, font, maxW) {
  mctx.font = font;
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const n = cur ? cur + ' ' + w : w; if (mctx.measureText(n).width > maxW && cur) { lines.push(cur); cur = w; } else cur = n; }
  if (cur) lines.push(cur);
  return { lines, w: Math.max(...lines.map(l => mctx.measureText(l).width)) };
}

// messages -> render items
const MSGS = TL.filter(m => m.from);
MSGS.forEach((m, k) => {
  const wr = wrap(m.text, `${FONT}px MLMed`, MAXW - 2 * PADX);
  m.lines = wr.lines; m.bw = Math.ceil(wr.w) + 2 * PADX; m.bh = wr.lines.length * LH + 2 * PADY;
  const next = MSGS[k + 1], prev = MSGS[k - 1];
  m.tail = !next || next.from !== m.from;                 // skill: tail on last bubble of a run
  m.gap = !prev ? 18 : prev.from === m.from ? IN_RUN_GAP : RUN_GAP;
});
const sent = MSGS.filter(m => m.from === 'me');
// receipt windows (skill: receipt under the LAST sent bubble, fades in ~300ms after landing)
const WAVE = { start: SWITCH + 0.05, end: SWITCH + 0.8 };
sent.forEach((m, k) => {
  const nextSent = sent[k + 1];
  m.rIn = S(m.enterMs) + (m.fail ? 0.55 : 0.3);
  m.rOut = nextSent ? (nextSent.fail ? S(nextSent.enterMs) + 0.6 : S(nextSent.enterMs) + 0.1) : 99;
  if (m.fail && nextSent && nextSent.fail) m.rOut = WAVE.end + 0.35; // both stay "Not delivered" until re-sent
  const reader = TL.find(x => x.from === 'them' && x.enterMs > m.enterMs);
  m.readAt = m.status === 'read' && reader ? S(reader.typingStartMs) : 99;
});

// ------------------------------------------------------------------ slot heights over time
function msgSlot(m, t) {
  const te = S(m.enterMs);
  if (m.from === 'them') {
    const ts = S(m.typingStartMs);
    if (t < ts) return 0;
    const g = clamp(spring(t - ts, POP)) * (TYPING_H + m.gap);
    if (t < te) return g;
    return lerp(TYPING_H + m.gap, m.bh + m.gap, clamp(spring(t - te, POP)));
  }
  return clamp(spring(t - te, POP)) * (m.bh + m.gap);
}
function receiptSlot(m, t) {
  if (m.from !== 'me') return 0;
  return RECEIPT_H * clamp(easeOut(inv(m.rIn, m.rIn + 0.25, t))) * (1 - easeInOut(inv(m.rOut, m.rOut + 0.3, t)));
}
const SYS_H = 104, NOTICE_H = 104;
const sysSlot = t => clamp(spring(t - SWITCH, POP)) * SYS_H;
const CARD = { w: 880, h: 820 };
const cardSlot = t => clamp(spring(t - END, POP)) * (CARD.h + 40);

function layout(t) {
  let y = BAND_TOP;
  const items = [];
  items.push({ kind: 'stamp', y, h: 70, label: 'Today 9:12 PM' }); y += 70;
  let noticeDone = false;
  for (const m of TL) {
    if (!m.history && !noticeDone) {
      noticeDone = true;
      items.push({ kind: 'stamp', y, h: 84, label: 'Today 9:41 PM' }); y += 84;
      items.push({ kind: 'notice', y, h: NOTICE_H }); y += NOTICE_H;
    }
    if (m.system) { const h = sysSlot(t); items.push({ kind: 'sys', y, h }); y += h; continue; }
    if (m.end) { const h = cardSlot(t); items.push({ kind: 'card', y, h }); y += h; continue; }
    const h = msgSlot(m, t); items.push({ kind: 'msg', m, y, h }); y += h;
    const rh = receiptSlot(m, t); if (rh > 0.01) items.push({ kind: 'receipt', m, y, h: rh }); y += rh;
  }
  return { items, bottom: y };
}

// ------------------------------------------------------------------ auto-scroll (skill §7)
// Target keeps the newest bubble's bottom at FLOOR (lower third of the band, clear of the compose bar).
// For the end card the target centres the card. The offset follows the target with a critically damped
// spring (no bounce), simulated once over the whole timeline so every frame is deterministic.
const SCROLL = new Float64Array(Math.ceil(DURATION * FPS) + 2);
{
  const targetAt = t => {
    const L = layout(t);
    // skill layout is justifyContent:flex-end: the stack sits on the floor and grows upward
    let target = L.bottom - FLOOR;
    if (t >= END) { const card = L.items.find(i => i.kind === 'card'); target = card.y + 20 + CARD.h / 2 - 1010; }
    return target;
  };
  let y = targetAt(0), v = 0; const w = TAU / 0.32, sub = 8, dt = 1 / FPS / sub;
  for (let f = 0; f < SCROLL.length; f++) {
    const t = f / FPS;
    const target = targetAt(t);
    for (let s = 0; s < sub; s++) { const a = w * w * (target - y) - 2 * w * v; v += a * dt; y += v * dt; }
    SCROLL[f] = y;
  }
}
const scrollAt = t => { const f = t * FPS, i = Math.floor(f), k = f - i; return lerp(SCROLL[Math.min(i, SCROLL.length - 1)], SCROLL[Math.min(i + 1, SCROLL.length - 1)], k); };

// ------------------------------------------------------------------ drawing: chrome
function drawBackground(ctx, t, scroll) {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  // faint mesh-dot wallpaper, drifts with the scroll (parallax) and links up once nearby messaging is on
  const link = clamp(inv(SWITCH, SWITCH + 1.2, t));
  const off = (scroll * 0.35) % 90;
  for (let gy = -90; gy < H + 90; gy += 90) for (let gx = 45; gx < W; gx += 90) {
    const y = gy - off + (Math.floor(gx / 90) % 2 ? 45 : 0);
    ctx.fillStyle = hexA(C.ink, 0.045 + 0.03 * link);
    ctx.beginPath(); ctx.arc(gx, y, 3, 0, TAU); ctx.fill();
  }
}

function wifiGlyph(ctx, x, y, s, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 4.2 * s; ctx.lineCap = 'round';
  for (const r of [8, 15, 22]) { ctx.beginPath(); ctx.arc(x, y, r * s, Math.PI * 1.25, Math.PI * 1.75); ctx.stroke(); }
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 3 * s, 0, TAU); ctx.fill();
}
function meshGlyph(ctx, x, y, s, col, node = C.ink) {
  // the icon's wave + node, drawn from the extracted centreline (icon space 512 -> s)
  const pts = ICON_PATH.points, k = s / 512;
  ctx.strokeStyle = col; ctx.lineWidth = ICON_PATH.width * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); pts.forEach(([px, py], i) => (i ? ctx.lineTo(x + (px - 256) * k, y + (py - 256) * k) : ctx.moveTo(x + (px - 256) * k, y + (py - 256) * k))); ctx.stroke();
  ctx.fillStyle = node; ctx.beginPath(); ctx.arc(x + (ICON_PATH.node[0] - 256) * k, y + (ICON_PATH.node[1] - 256) * k, ICON_PATH.nodeR * k, 0, TAU); ctx.fill();
}

function drawStatusBar(ctx, t) {
  ctx.fillStyle = C.header; ctx.fillRect(0, 0, W, STATUS_H);
  ctx.fillStyle = C.ink; ctx.font = '34px MLSemi'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('9:41', 66, 62);
  // signal bars: no service
  for (let i = 0; i < 4; i++) { ctx.fillStyle = hexA(C.ink, 0.25); ctx.fillRect(812 + i * 13, 74 - (i + 1) * 7, 9, (i + 1) * 7); }
  // Wi-Fi stays slashed for the whole video: the internet never comes back
  wifiGlyph(ctx, 892, 76, 1.05, hexA(C.ink, 0.35));
  const blink = t < SWITCH ? (Math.floor(t * 2.2) % 2 ? 1 : 0.55) : 1;
  ctx.strokeStyle = hexA(C.coral, blink); ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(870, 46); ctx.lineTo(914, 82); ctx.stroke();
  // battery
  roundRectPath(ctx, 944, 50, 58, 26, 7); ctx.strokeStyle = hexA(C.ink, 0.6); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = C.ink; roundRectPath(ctx, 949, 55, 38, 16, 4); ctx.fill();
  ctx.fillRect(1004, 58, 4, 10);
  // Meshline glyph appears next to the dead Wi-Fi once messages go nearby
  const k = spring(t - SWITCH - 0.15, TAP);
  if (k > 0.01) { ctx.save(); ctx.translate(760, 62); ctx.scale(k, k); meshGlyph(ctx, 0, 0, 58, C.blue); ctx.restore(); }
}

function drawHeader(ctx, t, iconImg) {
  ctx.fillStyle = C.header; ctx.fillRect(0, STATUS_H, W, HEADER_BOTTOM - STATUS_H);
  ctx.fillStyle = C.hair; ctx.fillRect(0, HEADER_BOTTOM - 2, W, 2);
  // back chevron
  ctx.strokeStyle = C.blueSoft; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(78, 166); ctx.lineTo(56, 190); ctx.lineTo(78, 214); ctx.stroke();
  const on = clamp(inv(SWITCH, SWITCH + 0.35, t));
  // avatar
  const ax = 160, ay = 190;
  ctx.fillStyle = '#2A3431'; ctx.beginPath(); ctx.arc(ax, ay, 46, 0, TAU); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = on > 0 ? hexA(C.blue, on) : hexA(C.coral, 0.85);
  if (on < 1) { ctx.strokeStyle = hexA(C.coral, 0.85 * (1 - on)); ctx.beginPath(); ctx.arc(ax, ay, 50, 0, TAU); ctx.stroke(); }
  ctx.strokeStyle = hexA(C.blue, on); ctx.beginPath(); ctx.arc(ax, ay, 50, 0, TAU); ctx.stroke();
  ctx.fillStyle = C.ink; ctx.font = '42px MLSemi'; ctx.textAlign = 'center'; ctx.fillText('S', ax, ay + 2);
  // name + status line (crossfade + slide)
  ctx.textAlign = 'left'; ctx.font = '42px MLSemi'; ctx.fillStyle = C.ink; ctx.fillText(DATA.contact, 232, 168);
  ctx.font = '30px MLMed';
  // old status slides up and out first, then the new one slides up into place (no text-on-text overlap)
  const outK = easeInOut(inv(SWITCH, SWITCH + 0.22, t)), inK = easeOut(inv(SWITCH + 0.2, SWITCH + 0.45, t));
  ctx.save(); ctx.beginPath(); ctx.rect(225, 200, 400, 40); ctx.clip();
  ctx.globalAlpha = 1 - outK;
  ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(240, 218 - 26 * outK, 8, 0, TAU); ctx.fill();
  ctx.fillText('No internet', 258, 219 - 26 * outK);
  ctx.globalAlpha = inK;
  ctx.fillStyle = C.blueSoft; ctx.beginPath(); ctx.arc(240, 218 + 26 * (1 - inK), 8, 0, TAU); ctx.fill();
  ctx.fillText('Nearby', 258, 219 + 26 * (1 - inK));
  ctx.restore();
  ctx.globalAlpha = 1;
  // ripple from the status dot (nearby pulses)
  if (t > SWITCH) for (const p0 of [SWITCH, SWITCH + 0.5, SWITCH + 1.0]) {
    const k = inv(p0, p0 + 0.9, t);
    if (k > 0 && k < 1) { ctx.strokeStyle = hexA(C.blueSoft, 0.6 * (1 - k)); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(240, 218, 8 + 16 * easeOut(k), 0, TAU); ctx.stroke(); }
  }
  // app icon (approved asset) as the thread's brand mark, top-right
  ctx.save(); roundRectPath(ctx, 952, 152, 76, 76, 18); ctx.clip(); ctx.drawImage(iconImg, 952, 152, 76, 76); ctx.restore();
  ctx.strokeStyle = C.hair; ctx.lineWidth = 2; roundRectPath(ctx, 952, 152, 76, 76, 18); ctx.stroke();
}

function sendPress(t) { // send button reacts to every sent message
  let p = 0;
  for (const m of sent) p = Math.max(p, Math.exp(-Math.max(0, t - S(m.enterMs) + 0.12) * 12) * (t > S(m.enterMs) - 0.12 ? 1 : 0));
  return p;
}
function drawCompose(ctx, t, endK) {
  ctx.globalAlpha = 1 - 0.6 * endK;
  ctx.fillStyle = C.bg; ctx.fillRect(0, COMPOSE_Y - 24, W, H - COMPOSE_Y + 24);
  roundRectPath(ctx, 58, COMPOSE_Y, 846, 100, 50); ctx.fillStyle = C.field; ctx.fill();
  ctx.strokeStyle = C.hair; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = C.dim; ctx.font = '36px MLMed'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Message', 104, COMPOSE_Y + 51);
  const on = clamp(inv(SWITCH, SWITCH + 0.35, t));
  const pr = sendPress(t);
  const r = 50 * (1 - 0.12 * pr);
  ctx.fillStyle = on > 0.5 ? C.blue : '#2C3632'; ctx.beginPath(); ctx.arc(974, COMPOSE_Y + 50, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(974, COMPOSE_Y + 70); ctx.lineTo(974, COMPOSE_Y + 30); ctx.moveTo(956, COMPOSE_Y + 47); ctx.lineTo(974, COMPOSE_Y + 29); ctx.lineTo(992, COMPOSE_Y + 47); ctx.stroke();
  ctx.globalAlpha = 1;
  // honest label: this is not the real product UI
  ctx.fillStyle = hexA(C.ink, 0.42); ctx.font = '26px MLMed'; ctx.textAlign = 'center';
  ctx.fillText('Stylised illustration · not actual app screens', W / 2, 1735);
}

// ------------------------------------------------------------------ drawing: thread
function refillK(m, t, yTop, scroll) {
  if (!m.fail) return 1;
  if (t < WAVE.start) return 0;
  // the sweeping mesh line refills the bubble as it passes over it
  const wy = waveY(t);
  const top = yTop - scroll + m.gap;
  return t > WAVE.end ? 1 : clamp((wy - top) / m.bh);
}
const waveY = t => lerp(HEADER_BOTTOM - 40, FLOOR + 120, easeInOut(inv(WAVE.start, WAVE.end, t)));

function drawBubble(ctx, m, yTop, t, scroll, alpha) {
  const te = S(m.enterMs);
  const me = m.from === 'me';
  const x = me ? W - GUTTER - m.bw : GUTTER;
  const y = yTop + m.gap - scroll;
  // typing indicator (received only) before the bubble
  if (!me && t >= S(m.typingStartMs) && t < te + 0.12) {
    const p = clamp(spring(t - S(m.typingStartMs), POP));
    const fade = 1 - inv(te, te + 0.12, t);
    ctx.save(); ctx.globalAlpha = alpha * p * fade;
    ctx.translate(x, y + TYPING_H); ctx.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p); ctx.translate(-x, -(y + TYPING_H));
    roundRectPath(ctx, x, y, TYPING_W, TYPING_H, [RAD, RAD, RAD, TAILR]); ctx.fillStyle = C.recv; ctx.fill();
    for (let i = 0; i < 3; i++) {
      const o = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * FPS / 8 - i * 0.9)); // skill's frame-driven dot breathing
      ctx.fillStyle = hexA('#AEB6B2', o); ctx.beginPath(); ctx.arc(x + 48 + i * 37, y + TYPING_H / 2 - 5 * (o - 0.4), 10.5, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  if (t < te) return null;
  const p = spring(t - te, POP);
  const pc = clamp(p);
  // failed-send shake
  let shake = 0;
  if (m.fail) { const k = t - m.rIn; if (k > 0 && k < 0.4) shake = Math.sin(k * 55) * 14 * (1 - k / 0.4); }
  ctx.save(); ctx.globalAlpha = alpha * pc;
  const ox = me ? x + m.bw : x, oy = y + m.bh;           // transform origin: bottom corner on sender side
  ctx.translate(ox + shake, oy); ctx.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p); ctx.translate(-ox, -oy + 24 * (1 - pc));
  const radii = me ? [RAD, RAD, m.tail ? TAILR : RAD, RAD] : [RAD, RAD, RAD, m.tail ? TAILR : RAD];
  roundRectPath(ctx, x, y, m.bw, m.bh, radii);
  if (me) {
    const rk = refillK(m, t, yTop, scroll);
    if (m.fail && rk < 1) {
      ctx.fillStyle = C.failFill; ctx.fill();
      ctx.save(); roundRectPath(ctx, x, y, m.bw, m.bh, radii); ctx.clip();
      ctx.fillStyle = C.blue; ctx.fillRect(x, y, m.bw, m.bh * rk); ctx.restore();
    } else { ctx.fillStyle = C.blue; ctx.fill(); }
  } else { ctx.fillStyle = C.recv; ctx.fill(); }
  ctx.fillStyle = me && m.fail && refillK(m, t, yTop, scroll) < 1 ? hexA(C.ink, 0.7) : C.ink;
  ctx.font = `${FONT}px MLMed`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  m.lines.forEach((ln, i) => ctx.fillText(ln, x + PADX, y + PADY + 46 + i * LH));
  ctx.restore();
  // failed badge (!) left of the bubble until it is re-sent
  if (m.fail) {
    const rk = refillK(m, t, yTop, scroll);
    const bk = clamp(spring(t - m.rIn, TAP)) * (1 - easeOut(clamp((rk - 0.6) / 0.4)));
    if (bk > 0.01) {
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x - 42 + shake, y + m.bh / 2); ctx.scale(bk, bk);
      ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill();
      ctx.fillStyle = C.bg; ctx.font = '32px MLDisplay'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 0, 2);
      ctx.restore();
    }
  }
  // tapback (skill: lands ~400ms after the bubble, overshoot)
  if (m.reaction) {
    const k = spring(t - te - 0.4, TAP);
    if (k > 0.01) {
      const cx = x + m.bw - 6, cy = y - 6;
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.scale(k, k);
      ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(0, 0, 36, 0, TAU); ctx.fill();
      ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(0, 0, 31, 0, TAU); ctx.fill();
      heart(ctx, 0, 2, 15, C.ink);
      ctx.restore();
    }
  }
  return { x, y, w: m.bw, h: m.bh };
}

function heart(ctx, x, y, s, col) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.8, y - s * 1.2, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 0.8, y - s * 1.2, x + s * 1.4, y - s * 0.1, x, y + s * 0.9);
  ctx.fill();
}

function drawReceipt(ctx, m, yTop, h, t, scroll, alpha) {
  const k = h / RECEIPT_H;
  const y = yTop - scroll + 28;
  const rk = refillK(m, t, yTop - m.bh - m.gap, scroll); // bubble above
  const failed = m.fail && rk < 1;
  let label = 'Delivered', col = C.muted;
  if (failed) { label = 'Not delivered'; col = C.coral; }
  if (t >= m.readAt) label = 'Read';
  ctx.save(); ctx.globalAlpha = alpha * k; ctx.font = '26px MLSemi'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillStyle = col; ctx.fillText(label, W - GUTTER - 6, y);
  if (!failed) { // small mesh tick = sent nearby (stylised)
    const tw = ctx.measureText(label).width;
    meshGlyph(ctx, W - GUTTER - 6 - tw - 26, y, 30, C.blueSoft, C.ink);
  }
  ctx.restore();
}

function drawNotice(ctx, y, t, scroll, alpha) {
  // offline system notice: on screen from frame 0 (the hook); it dims once nearby messaging takes over
  const label = 'No internet connection';
  ctx.font = '30px MLSemi';
  const tw = ctx.measureText(label).width, pw = tw + 110, ph = 62;
  const cx = W / 2, cy = y - scroll + NOTICE_H / 2;
  const pulse = t < SWITCH ? 0.5 + 0.5 * Math.sin(t * TAU * 1.4) : 0;
  const settle = 1 - 0.45 * clamp(inv(SWITCH, SWITCH + 0.5, t));
  ctx.save(); ctx.globalAlpha = alpha * settle; ctx.translate(cx, cy);
  roundRectPath(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fillStyle = hexA(C.coral, 0.12 + 0.06 * pulse); ctx.fill();
  ctx.strokeStyle = hexA(C.coral, 0.75); ctx.lineWidth = 2.5; ctx.stroke();
  wifiGlyph(ctx, -pw / 2 + 44, 9, 0.95, C.coral);
  ctx.strokeStyle = C.coral; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-pw / 2 + 26, -14); ctx.lineTo(-pw / 2 + 62, 16); ctx.stroke();
  ctx.fillStyle = C.coral; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, -pw / 2 + 80, 1);
  ctx.restore();
}

function drawStamp(ctx, y, h, label, scroll, alpha) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = C.dim; ctx.font = '26px MLSemi'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, W / 2, y - scroll + h - 34); ctx.restore();
}

function drawSystem(ctx, y, h, t, scroll, alpha) {
  const p = spring(t - SWITCH, POP), pc = clamp(p);
  if (pc <= 0.01) return;
  const label = TL.find(m => m.system).system;
  ctx.font = '30px MLSemi';
  const tw = ctx.measureText(label).width, pw = tw + 110, ph = 62;
  const cx = W / 2, cy = y - scroll + SYS_H / 2;
  ctx.save(); ctx.globalAlpha = alpha * pc; ctx.translate(cx, cy); ctx.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p);
  roundRectPath(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fillStyle = hexA(C.blue, 0.16); ctx.fill();
  ctx.strokeStyle = hexA(C.blue, 0.9); ctx.lineWidth = 2.5; ctx.stroke();
  meshGlyph(ctx, -pw / 2 + 42, 0, 46, C.blue);
  ctx.fillStyle = C.blueSoft; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, -pw / 2 + 76, 1);
  ctx.restore();
}

// the Meshline wave sweeps down the thread when messaging switches to nearby
function drawWave(ctx, t) {
  if (t < WAVE.start || t > WAVE.end + 0.25) return;
  const y = waveY(t);
  const a = 1 - inv(WAVE.end, WAVE.end + 0.25, t);
  const pts = ICON_PATH.points;
  const E0 = pts[0], E1 = pts[pts.length - 1];
  // rotate the icon wave so its chord is horizontal and stretch it across the screen
  const ang = -Math.atan2(E1[1] - E0[1], E1[0] - E0[0]);
  const len = Math.hypot(E1[0] - E0[0], E1[1] - E0[1]);
  const k = (W + 160) / len;
  const map = ([px, py]) => {
    const dx = px - E0[0], dy = py - E0[1];
    return [-80 + (dx * Math.cos(ang) - dy * Math.sin(ang)) * k, y + (dx * Math.sin(ang) + dy * Math.cos(ang)) * k * 0.55];
  };
  const mp = pts.map(map);
  const g = ctx.createLinearGradient(0, y - 120, 0, y + 30);
  g.addColorStop(0, hexA(C.blue, 0)); g.addColorStop(1, hexA(C.blue, 0.18 * a));
  ctx.fillStyle = g; ctx.fillRect(0, y - 120, W, 150);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = hexA(C.blue, 0.3 * a); ctx.lineWidth = 40; ctx.beginPath(); mp.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.stroke();
  ctx.strokeStyle = hexA(C.blue, a); ctx.lineWidth = 16; ctx.stroke();
  const node = map(ICON_PATH.node);
  ctx.fillStyle = hexA(C.bg, a); ctx.beginPath(); ctx.arc(node[0], node[1], 20, 0, TAU); ctx.fill();
  ctx.fillStyle = hexA(C.ink, a); ctx.beginPath(); ctx.arc(node[0], node[1], 13, 0, TAU); ctx.fill();
}

// end card: a chat-native centred "app card" message whose parts pop in like bubbles
const ENDP = { icon: END + 0.05, title: END + 0.4, sub: END + 0.75, cta: END + 1.15 };
function drawCard(ctx, y, t, scroll, iconImg) {
  const p = spring(t - END, POP), pc = clamp(p);
  if (pc <= 0.01) return;
  const cx = W / 2, top = y - scroll + 20;
  const x0 = cx - CARD.w / 2;
  ctx.save(); ctx.globalAlpha = pc;
  ctx.translate(cx, top + CARD.h); ctx.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p); ctx.translate(-cx, -(top + CARD.h) + 24 * (1 - pc));
  const g = ctx.createRadialGradient(cx, top + CARD.h * 0.4, 50, cx, top + CARD.h * 0.4, 620);
  g.addColorStop(0, hexA(C.blue, 0.2)); g.addColorStop(1, hexA(C.blue, 0));
  ctx.fillStyle = g; ctx.fillRect(0, top - 200, W, CARD.h + 400);
  roundRectPath(ctx, x0, top, CARD.w, CARD.h, 44); ctx.fillStyle = '#161E1B'; ctx.fill();
  ctx.strokeStyle = '#2C3733'; ctx.lineWidth = 3; ctx.stroke();
  // icon
  const ik = spring(t - ENDP.icon, TAP);
  const is = 250;
  if (ik > 0.01) {
    ctx.save(); ctx.translate(cx, top + 70 + is / 2); ctx.scale(ik, ik);
    roundRectPath(ctx, -is / 2, -is / 2, is, is, 56); ctx.save(); ctx.clip(); ctx.drawImage(iconImg, -is / 2, -is / 2, is, is); ctx.restore();
    ctx.strokeStyle = '#2E3935'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  }
  // title
  const tk = clamp(spring(t - ENDP.title, POP));
  ctx.globalAlpha = pc * tk; ctx.fillStyle = C.ink; ctx.font = '112px MLDisplay'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('Meshline', cx, top + 470 + 30 * (1 - tk));
  const sk = clamp(spring(t - ENDP.sub, POP));
  ctx.globalAlpha = pc * sk; ctx.fillStyle = '#AEB6B2'; ctx.font = '44px MLMed';
  ctx.fillText('Private nearby messaging', cx, top + 548 + 24 * (1 - sk));
  // CTA pill
  const ck = spring(t - ENDP.cta, POP);
  if (ck > 0.01) {
    ctx.globalAlpha = pc * clamp(ck);
    ctx.font = '48px MLSemi';
    const label = 'Explore on Google Play', tw = ctx.measureText(label).width, pw = tw + 120, ph = 116;
    const py = top + 660;
    ctx.save(); ctx.translate(cx, py); ctx.scale(0.85 + 0.15 * ck, 0.85 + 0.15 * ck);
    roundRectPath(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fillStyle = C.blue; ctx.fill();
    for (const s0 of [ENDP.cta + 0.9, ENDP.cta + 2.1]) { // shimmer sweeps keep the hold alive
      const k = inv(s0, s0 + 0.55, t);
      if (k > 0 && k < 1) {
        ctx.save(); roundRectPath(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2); ctx.clip();
        const sx = -pw / 2 - 100 + (pw + 200) * easeInOut(k);
        const sg = ctx.createLinearGradient(sx - 80, 0, sx + 80, 0);
        sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.3)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sg; ctx.fillRect(-pw / 2, -ph / 2, pw, ph); ctx.restore();
      }
    }
    ctx.fillStyle = C.ink; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 3);
    ctx.restore();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ frame
function screenShake(t) {
  let x = 0, y = 0;
  for (const m of sent) if (m.fail) { const k = t - m.rIn; if (k > 0 && k < 0.35) { x += Math.sin(k * 70) * 9 * (1 - k / 0.35); y += Math.cos(k * 53) * 4 * (1 - k / 0.35); } }
  const b = t - SWITCH; let z = 1;
  if (b > 0 && b < 0.6) z += 0.018 * Math.sin(Math.PI * b / 0.6);
  return { x, y, z };
}

export function drawFrame(ctx, t, assets) {
  const sh = screenShake(t);
  ctx.setTransform(sh.z, 0, 0, sh.z, sh.x - (sh.z - 1) * W / 2, sh.y - (sh.z - 1) * H / 2);
  const scroll = scrollAt(t);
  const L = layout(t);
  const endK = easeInOut(inv(END, END + 0.5, t));
  drawBackground(ctx, t, scroll);
  // thread, clipped to the band between header and compose bar
  ctx.save(); ctx.beginPath(); ctx.rect(0, HEADER_BOTTOM, W, COMPOSE_Y - 24 - HEADER_BOTTOM); ctx.clip();
  const old = 1 - 0.78 * endK; // older messages recede so the end card reads
  for (const it of L.items) {
    if (it.kind === 'stamp') drawStamp(ctx, it.y, it.h, it.label, scroll, old);
    else if (it.kind === 'notice') drawNotice(ctx, it.y, t, scroll, old);
    else if (it.kind === 'sys') drawSystem(ctx, it.y, it.h, t, scroll, old);
    else if (it.kind === 'msg') drawBubble(ctx, it.m, it.y, t, scroll, old);
    else if (it.kind === 'receipt') drawReceipt(ctx, it.m, it.y, it.h, t, scroll, old);
    else if (it.kind === 'card') drawCard(ctx, it.y, t, scroll, assets.icon);
  }
  drawWave(ctx, t);
  ctx.restore();
  drawCompose(ctx, t, endK);
  drawStatusBar(ctx, t);
  drawHeader(ctx, t, assets.icon);
  // gentle final fade keeps the CTA legible to the last frame
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const fo = inv(DURATION - 0.25, DURATION, t);
  if (fo > 0) { ctx.fillStyle = hexA(C.bg, 0.25 * fo); ctx.fillRect(0, 0, W, H); }
}

// ------------------------------------------------------------------ cue sheet (skill §8: one cue per message, same timebase)
export function cues() {
  const ev = [];
  const add = (t, type, gain = 1, extra = {}) => ev.push({ t: +t.toFixed(4), type, gain, ...extra });
  for (const m of MSGS) {
    if (m.history) continue; // already on screen at frame 0: no cue
    if (m.from === 'me') add(S(m.enterMs), 'send', 0.9);
    else { add(S(m.typingStartMs), 'typing', 0.5, { dur: S(m.typingLenMs) }); add(S(m.enterMs), 'receive', 0.85); }
    if (m.fail) add(m.rIn, 'fail', 0.8);
    if (m.reaction) add(S(m.enterMs) + 0.4, 'tapback', 0.7);
    if (m.status === 'read' && m.readAt < 99) add(m.readAt, 'read', 0.35);
  }
  // refill moments: when the sweep crosses each failed bubble (sampled from the same layout + scroll)
  for (const m of sent.filter(x => x.fail)) {
    for (let f = Math.floor(WAVE.start * FPS); f <= Math.ceil(WAVE.end * FPS); f++) {
      const t = f / FPS, it = layout(t).items.find(i => i.m === m && i.kind === 'msg');
      if (it && refillK(m, t, it.y, scrollAt(t)) >= 0.5) { add(t, 'refill', 0.7); break; }
    }
  }
  add(SWITCH, 'switch', 0.9);
  add(WAVE.start, 'sweep', 0.8, { dur: WAVE.end - WAVE.start });
  add(END, 'cardWhoosh', 0.6);
  add(ENDP.icon, 'pop', 0.8); add(ENDP.title, 'pop', 0.6); add(ENDP.sub, 'pop', 0.45); add(ENDP.cta, 'ctaPop', 0.85);
  add(ENDP.cta + 0.9, 'shimmer', 0.4); add(ENDP.cta + 2.1, 'shimmer', 0.35);
  ev.sort((a, b) => a.t - b.t);
  return { duration: DURATION, fps: FPS, switchAt: SWITCH, endAt: END, endParts: ENDP, events: ev,
    messages: TL.map(m => ({ i: m.i, from: m.from, text: m.text, system: m.system, end: m.end, typingStart: S(m.typingStartMs), enter: S(m.enterMs) })) };
}
