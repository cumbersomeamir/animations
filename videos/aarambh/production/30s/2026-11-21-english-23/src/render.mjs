// Aarambh english-23 30 s #01 — Inge Lehmann and the inner core. Approved editorial ("Vox scrapbook") motion skill under the 2026-11-11 rules (context/25),
// the 2026-11-15 first-frame addendum and the 2026-11-17 feedback addendum (one idea per scene, 2–5 curiosity words, explanatory motion, a striking thumbnail).
// Frame 0 = real 1932 portrait of Inge Lehmann beside an Earth sliced open + "SHE HEARD THE IMPOSSIBLE" (no fade/flicker/intro); narration from 0.05 s;
// thumbnail = frame 0.
// Story: earthquake waves arrived where they shouldn't; Inge Lehmann noticed -> what was hiding inside? -> the core slows waves and bends them away,
// leaving a quiet band (one PKP ray) -> yet in 1929 stations there recorded quake waves (drum seismogram page) -> in 1936 she proposed an inner core
// where waves speed up, sending some there (one PKiKP ray reflected at the inner-core boundary) -> later evidence showed it's solid -> lesson: a measurement that disagrees with a
// prediction can reveal hidden structure -> CTA.
// The Earth is a software-rendered 3D cutaway (src/earth.mjs) using NASA's public-domain Blue Marble (2002) graded to the icon palette; ray paths are traced
// through a simplified PREM P-wave profile (illustration). Portrait: Even Neuhaus, 1932, The Royal Library (Denmark), via Wikimedia Commons (PD-Denmark50 / CC BY-SA 4.0).
// Usage: node src/render.mjs --out build/video.mp4 | --stills build/st --times 1,5 | --cues | --thumb out.png
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { trace, solveP, renderCutaway, planeToScreen, rot, loadTexture, RE, RCMB, RICB, vAt } from './earth.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FS = path.join(ROOT, 'node_modules/@fontsource');
GlobalFonts.registerFromPath(`${FS}/fraunces/files/fraunces-latin-800-normal.woff2`, 'Fraunces');
GlobalFonts.registerFromPath(`${FS}/inter/files/inter-latin-700-normal.woff2`, 'InterB');
GlobalFonts.registerFromPath(`${FS}/inter/files/inter-latin-800-normal.woff2`, 'InterX');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf', 'Mono');

const W = 1080, H = 1920, FPS = 30, N = 900, CX = 500; // CX: visual and caption centre inside the x 100..900 safe area
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', gold: '#F1B444', goldDeep: '#C98A22', ink: '#123B31', paper: '#FFFDF6' };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eout = (t) => 1 - Math.pow(1 - t, 3);
const lin = (u) => u;
const pr = (t, a, b, e = eio) => e(clamp((t - a) / (b - a)));
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const rnd = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- word timings and captions ----------
const WORDS = JSON.parse(readFileSync(path.join(ROOT, 'qa/asr_words_narration.json'), 'utf8')).words;
const ws = (i) => WORDS[i].start, we = (i) => WORDS[i].end;
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json)
  [0, 5, ['Earthquake waves arrived', 'where they shouldn’t.']],
  [6, 9, ['Inge Lehmann noticed.']],
  [10, 13, ['What was hiding inside?']],
  [14, 21, ['The core slows waves', 'and bends them away,']],
  [22, 25, ['leaving a quiet band.']],
  [26, 28, ['Yet in 1929,']],
  [29, 33, ['stations there recorded', 'quake waves.']],
  [34, 40, ['In 1936, she proposed', 'an inner core']],
  [41, 47, ['where waves speed up,', 'sending some there.']],
  [48, 53, ['Later evidence', 'showed it is solid.']],
  [54, 58, ['Lesson: a measurement', 'that disagrees']],
  [59, 65, ['with a prediction can', 'reveal hidden structure.']],
  [66, 71, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 10: SENT[1].start, 14: SENT[2].start, 26: SENT[3].start, 34: SENT[4].start, 48: SENT[5].start, 54: SENT[6].start, 66: SENT[7].start };
const sStart = (a) => (SENT_START[a] !== undefined ? (Math.abs(ws(a) - SENT_START[a]) > 0.25 ? SENT_START[a] + 0.1 : Math.max(ws(a), SENT_START[a])) : (we(a - 1) + ws(a)) / 2); // fall back to the placed start when ASR mis-stamps a sentence's first word
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                        // hard cut on "What was hiding inside?" -> the veiled centre
  whip: [SENT[2].start - 0.25, SENT[2].start],      // whip pan to the face-on Earth: one ray bends away
  push: [SENT[3].start - 0.3, SENT[3].start - 0.05],// push to the drum-seismogram page
  turn: [SENT[4].start - 0.35, SENT[4].start],      // page turn back to the Earth: the inner core
  zoom: [SENT[5].start - 0.35, SENT[5].start + 0.35], // continuous push into the inner core: solid
  slide: [SENT[6].start - 0.35, SENT[6].start],     // slide to the lesson page
  cta: [SENT[7].start - 0.4, SENT[7].start],
};

// ---------- assets ----------
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR = await loadImage(path.join(ROOT, 'assets/inge-lehmann-1932-neuhaus-kb.jpg')); // 1280x1869 standard-width copy of the 3370x4922 Royal Library scan
const crop = (img, fx0, fy0, fx1, fy1) => { const w = Math.round(img.width * (fx1 - fx0)), h = Math.round(img.height * (fy1 - fy0)); const cv = createCanvas(w, h); cv.getContext('2d').drawImage(img, img.width * fx0, img.height * fy0, w, h, 0, 0, w, h); return cv; };
const PORC = crop(POR, 0.13, 0.03, 0.93, 0.6); // head to shoulders
await loadTexture(path.join(ROOT, 'assets/earth-blue-marble-2002-nasa-1920.jpg'));

// ---------- textures, backgrounds ----------
function noiseTile(s, seed, amp) {
  const c = createCanvas(s, s), x = c.getContext('2d'), im = x.createImageData(s, s);
  let a = seed >>> 0; const r = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < s * s; i++) { const v = 128 + (r() - 0.5) * amp; im.data.set([v, v, v, 255], i * 4); }
  x.putImageData(im, 0, 0); return c;
}
const grainA = noiseTile(256, 7, 40), grainB = noiseTile(256, 99, 40), paperTex = noiseTile(256, 21, 14);
function makeBg(cx, cy, inner, outer) {
  const cv = createCanvas(W, H), c = cv.getContext('2d');
  c.fillStyle = outer; c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(cx, cy, 60, cx, cy, 1150); g.addColorStop(0, inner); g.addColorStop(0.55, '#06392F'); g.addColorStop(1, outer);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.07; c.globalCompositeOperation = 'overlay'; c.fillStyle = c.createPattern(paperTex, 'repeat'); c.fillRect(0, 0, W, H);
  return cv;
}
const BG = { a: makeBg(620, 900, '#0E5A49', '#01130F'), b: makeBg(CX, 960, '#0B5244', '#011410'), c: makeBg(CX, 900, '#20180C', '#060402') };
function makePaper(seed, tint) { // a scrapbook page: cream paper, warm vignette, torn top and bottom edges
  const cv = createCanvas(W, H), c = cv.getContext('2d');
  c.fillStyle = '#0B2A23'; c.fillRect(0, 0, W, H);
  const top = 250, bot = 1640; c.beginPath(); c.moveTo(-10, top);
  for (let x = 0; x <= W + 20; x += 18) c.lineTo(x, top + (rnd(x, seed) - 0.5) * 16);
  c.lineTo(W + 10, bot); for (let x = W + 20; x >= -20; x -= 18) c.lineTo(x, bot + (rnd(x, seed + 3) - 0.5) * 16); c.closePath();
  c.save(); c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 50; c.shadowOffsetY = 16; c.fillStyle = tint; c.fill(); c.restore();
  c.save(); c.clip(); c.globalAlpha = 0.22; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(paperTex, 'repeat'); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; const g = c.createRadialGradient(CX, 950, 250, CX, 950, 1100); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(201,138,34,0.28)'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  return cv;
}
const PAGE = { seis: makePaper(3, '#FBF5E6'), lesson: makePaper(11, '#FFFBF0') };

// ---------- primitives ----------
function label(c, text, x, y, size, col = C.cream, font = 'Fraunces', a = 1, align = 'center') { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `800 ${size}px ${font}`; c.textAlign = align; c.fillStyle = col;
  c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 18; c.shadowOffsetY = 4; c.fillText(text, x, y); c.restore(); }
function pill(c, text, x, y, size, a, col = C.gold) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `800 ${size}px InterX`; const w = c.measureText(text).width + 56;
  c.translate(x, y); const s = 0.9 + 0.1 * a; c.scale(s, s); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 24; c.shadowOffsetY = 8; c.fillStyle = 'rgba(2,28,22,0.92)'; rr(c, -w / 2, -size * 0.95, w, size * 1.5, 18); c.fill();
  c.shadowColor = 'rgba(0,0,0,0)'; c.fillStyle = col; c.textAlign = 'center'; c.fillText(text, 0, size * 0.12); c.restore(); }
function photo(c, img, x, y, w, rot_ = 0, a = 1, sweep = -1) { // archival print: white border, deep soft shadow, optional light sweep
  if (a <= 0) return; const h = w * img.height / img.width; c.save(); c.globalAlpha = a; c.translate(x + w / 2, y + h / 2); c.rotate(rot_);
  c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28); c.shadowColor = 'rgba(0,0,0,0)';
  c.drawImage(img, -w / 2, -h / 2, w, h);
  if (sweep >= 0 && sweep <= 1) { c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip(); const sx = lerp(-w, w, sweep); const g = c.createLinearGradient(sx - 120, 0, sx + 120, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.32)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.rotate(-0.3); c.fillRect(-w * 1.5, -h * 1.5, w * 3, h * 3); c.restore(); }
  c.restore(); return { x, y, w, h };
}
function tape(c, x, y, w, rot_, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = 0.78 * a; c.translate(x, y); c.rotate(rot_); c.fillStyle = '#EFE4C2'; c.beginPath();
  c.moveTo(-w / 2, -22); for (let k = 0; k <= 6; k++) c.lineTo(-w / 2 + (w * k) / 6, -22 + (k % 2 ? 3 : 0)); c.lineTo(w / 2, 22); for (let k = 6; k >= 0; k--) c.lineTo(-w / 2 + (w * k) / 6, 22 - (k % 2 ? 3 : 0)); c.closePath(); c.fill();
  c.globalAlpha = 0.18 * a; c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2, -22, w, 12); c.restore(); }
function glowDot(c, x, y, a, r = 30, col = [241, 180, 68]) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(0.4, `rgba(${col[0]},${col[1]},${col[2]},${0.7 * a})`); g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore(); }
function stamp(c, lines, x, y, a, rot_ = -0.06, col = C.goldDeep, bg = null) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot_); const s = 1.3 - 0.3 * a; c.scale(s, s);
  const w = Math.max(...lines.map((l, i) => { c.font = i === 0 ? '800 54px Mono' : '700 32px Mono'; return c.measureText(l).width; })) + 56, h = 40 + lines.length * 62;
  if (bg) { c.fillStyle = bg; rr(c, -w / 2, -h / 2, w, h, 12); c.fill(); } c.strokeStyle = col; c.lineWidth = 7; rr(c, -w / 2, -h / 2, w, h, 12); c.stroke(); c.fillStyle = col; c.textAlign = 'center';
  lines.forEach((l, i) => { c.font = i === 0 ? '800 54px Mono' : '700 32px Mono'; c.fillText(l, 0, -h / 2 + 76 + i * 58); }); c.restore(); }
function circlePortrait(c, img, fx, fy, fr, x, y, r, a = 1, ring = C.gold) { if (a <= 0) return; const sw = img.width * fr * 2, sx = img.width * fx - sw / 2, sy = img.height * fy - sw / 2; c.save(); c.globalAlpha = a;
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.clip(); c.drawImage(img, sx, sy, sw, sw, x - r, y - r, 2 * r, 2 * r); c.restore();
  c.strokeStyle = ring; c.lineWidth = 6; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.stroke(); c.restore(); }
function star(c, x, y, r, a, col = C.gold) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.fillStyle = col; c.beginPath(); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 - Math.PI / 2, rr_ = i % 2 ? r * 0.32 : r; c.lineTo(x + Math.cos(an) * rr_, y + Math.sin(an) * rr_); } c.fill(); c.restore(); }
function dust(c, t, seed, a = 1) { // foreground depth: large soft out-of-focus motes drifting in front of the subject
  if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) { const x = ((rnd(i, seed) * 1300 + t * (14 + 22 * rnd(i, seed + 1))) % 1300) - 110, y = 520 + rnd(i, seed + 2) * 1100 + Math.sin(t * 0.7 + i) * 30, r = 26 + 60 * rnd(i, seed + 3);
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,214,140,${0.16 * a})`); g.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
  c.restore(); }

// ---------- the Earth ----------
const ATM = (c, x, y, R, a = 1) => { const g = c.createRadialGradient(x, y, R * 0.92, x, y, R * 1.25); g.addColorStop(0, `rgba(120,214,190,${0.32 * a})`); g.addColorStop(1, 'rgba(120,214,190,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, R * 1.25, 0, 6.283); c.fill(); };
function earth(c, x, y, R, o) { // draws the cutaway centred at (x, y); returns a projector for points on the exposed cut plane (local z = 0, x >= 0)
  const box = o.box ? [o.box[0] - x, o.box[1] - y, o.box[2], o.box[3]] : undefined;
  if (!o.noAtm) ATM(c, x, y, R, o.atm ?? 1);
  const e = renderCutaway({ ...o, R, box, ss: o.ss ?? (R > 600 ? 1 : 1.5) });
  c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(e.cv, x + e.x0, y + e.y0, e.w, e.h); c.restore();
  const M = e.M; return (u, v) => { const [sx, sy] = planeToScreen(M, R, u, v); return [x + sx, y + sy]; };
}
// rays: the epicentre sits at the top of the exposed face (plane angle 90 deg); distance runs clockwise down the right side
const PH0 = Math.PI / 2;
const polar = (rkm, th) => [(rkm / RE) * Math.cos(PH0 - th), (rkm / RE) * Math.sin(PH0 - th)];
const BAND = [102, 143]; // Lehmann (1987): no direct P beyond 102 deg, no P' (PKP) before 143 deg in a two-shell Earth
const pKP = 240, RAY_KP = trace(pKP, 2);                       // one PKP ray: slowed and bent by the core, lands beyond the band
// one PKiKP ray: reflected at the inner-core boundary (the mechanism Lehmann described for her model), landing at 125 deg inside the band
const pIK = solveP(125, RICB / vAt(RICB, 'inner') + 0.02, RICB / vAt(RICB, 'outer') - 0.02, true), RAY_IK = trace(pIK, 2);
function rayAt(ray, f) { // point index for travel-time fraction f
  const tt = f * ray.time; let k = 0; while (k < ray.pts.length - 1 && ray.pts[k + 1][2] <= tt) k++; return k; }
function drawRay(c, proj, ray, f, a = 1, col = [241, 180, 68]) {
  if (a <= 0 || f <= 0) return; const k = rayAt(ray, clamp(f)); const P = ray.pts.slice(0, k + 1).map(([r, th]) => proj(...polar(r, th)));
  c.save(); c.globalAlpha = a; c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},0.35)`; c.lineWidth = 22; c.beginPath(); P.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  c.strokeStyle = '#FFF4CC'; c.lineWidth = 7; c.shadowColor = `rgba(${col[0]},${col[1]},${col[2]},0.95)`; c.shadowBlur = 22; c.beginPath(); P.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.restore();
  if (f < 1) { const [hx, hy] = P[P.length - 1]; glowDot(c, hx, hy, 0.95 * a, 46); }
}
function rayLayerAt(ray, f) { return ray.pts[rayAt(ray, clamp(f))][3]; }
function station(c, proj, deg, state, a = 1, t = 0, ping = -1) { // a seismometer pin on the rim: state 'off' (grey), 'on' (gold)
  if (a <= 0) return; const th = deg * Math.PI / 180, [x, y] = proj(...polar(RE * 1.0, th)), [xo, yo] = proj(...polar(RE * 1.1, th)); const nx = xo - x, ny = yo - y, d = Math.hypot(nx, ny) || 1, ux = nx / d, uy = ny / d;
  c.save(); c.globalAlpha = a; c.translate(x + ux * 30, y + uy * 30); c.rotate(Math.atan2(uy, ux) + Math.PI / 2);
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 12; c.fillStyle = state === 'on' ? C.gold : '#9AA7A2'; c.beginPath(); c.moveTo(0, 26); c.lineTo(-22, -16); c.lineTo(22, -16); c.closePath(); c.fill();
  c.shadowColor = 'rgba(0,0,0,0)'; c.fillStyle = state === 'on' ? '#3A2405' : '#33403C'; c.beginPath(); c.arc(0, -2, 6, 0, 6.283); c.fill(); c.restore();
  if (ping >= 0 && ping < 1.2) { c.save(); c.strokeStyle = C.gold; for (let k = 0; k < 2; k++) { const u = clamp(ping - k * 0.25); if (u <= 0 || u >= 1) continue; c.globalAlpha = (1 - u) * a; c.lineWidth = 6; c.beginPath(); c.arc(x + ux * 30, y + uy * 30, 28 + u * 90, 0, 6.283); c.stroke(); } c.restore();
    glowDot(c, x + ux * 30, y + uy * 30, 0.8 * (1 - clamp(ping)) * a, 110); }
}
function quake(c, proj, a, t, burst = -1) { // the epicentre: a gold star on the rim with a pulse
  if (a <= 0) return; const [x, y] = proj(...polar(RE, 0)); const [xo, yo] = proj(...polar(RE * 1.08, 0));
  glowDot(c, xo, yo, 0.7 * a, 70); star(c, xo, yo, 34 + 3 * Math.sin(t * 6), a);
  if (burst >= 0 && burst < 1) { c.save(); c.strokeStyle = 'rgba(255,230,160,1)'; for (let k = 0; k < 3; k++) { const u = clamp(burst * 1.3 - k * 0.15); if (u <= 0 || u >= 1) continue; c.globalAlpha = (1 - u) * a; c.lineWidth = 6; c.beginPath(); c.arc(x, y, 20 + u * 160, 0, 6.283); c.stroke(); } c.restore(); }
}
function bandArc(c, proj, a, gold = 0) { // the shadow band on the rim (102..143 deg) and a faint wedge on the face
  if (a <= 0) return; const P = []; for (let d = BAND[0]; d <= BAND[1]; d += 1) P.push(proj(...polar(RE * 1.035, d * Math.PI / 180)));
  const Q = []; for (let d = BAND[1]; d >= BAND[0]; d -= 1) Q.push(proj(...polar(RE * 0.62, d * Math.PI / 180)));
  c.save(); c.globalAlpha = 0.42 * a; c.fillStyle = gold > 0 ? `rgba(${lerp(10, 241, gold)},${lerp(20, 180, gold)},${lerp(40, 68, gold)},1)` : '#0A1428';
  c.beginPath(); [...P, ...Q].forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill(); c.restore();
  c.save(); c.globalAlpha = a; c.lineCap = 'round'; c.strokeStyle = gold > 0 ? C.gold : '#1C2C4A'; c.lineWidth = 20; c.beginPath(); P.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  c.setLineDash([2, 18]); c.strokeStyle = 'rgba(251,247,238,0.7)'; c.lineWidth = 6; c.beginPath(); P.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.restore();
}

// ---------- scenes (each draws the full frame; t is global time) ----------
const SPIN0 = 1.25;
const F0 = { por: [44, 580, 430, -0.05], ex: 688, ey: 1010, er: 300 }; // frame-0 composition (also the thumbnail)
const PING0 = 1.75; // the impossible arrival pings on "shouldn't"
function scene1(c, t) { // HOOK — frame 0 is complete: real portrait + Earth sliced open + a station pinging where no wave should arrive + "SHE HEARD THE IMPOSSIBLE"
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.0, 1.03, pr(t, 0, T.cut, lin)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  photo(c, PORC, ...F0.por, 1, t > 2.45 ? pr(t, 2.45, 3.6, lin) : -1);
  tape(c, F0.por[0] + 80, F0.por[1] - 6, 160, -0.35);
  const proj = earth(c, F0.ex, F0.ey, F0.er, { yaw: -0.62, pitch: -0.3, spin: SPIN0 + t * 0.05, t });
  quake(c, proj, 1, t, (t * 0.55) % 1);
  bandArc(c, proj, 0.55);
  const ping = t < PING0 ? 0.55 + 0.45 * Math.sin(t * 5) * 0 : -1;
  station(c, proj, 125, 'on', 1, t, t < PING0 ? 0.35 : t - PING0); if (ping >= 0) glowDot(c, ...proj(...polar(RE * 1.14, 125 * Math.PI / 180)), 0.55, 90);
  c.restore();
  dust(c, t, 1, 0.8);
  label(c, 'SHE HEARD', CX, 1452, 118, C.cream, 'InterX'); label(c, 'THE IMPOSSIBLE', CX, 1562, 92, C.gold, 'InterX');
}
function scene2(c, t) { // SUPER HOOK: what was hiding inside? — pushed into the face: a veiled centre with a question mark, the liquid core swirling around it
  c.drawImage(BG.c, 0, 0);
  const u = pr(t, T.cut, T.whip[0], lin), R = lerp(1500, 1650, u), cx = 500, cy = 1000;
  earth(c, cx, cy, R, { yaw: -0.62, pitch: -0.3, spin: SPIN0 + t * 0.05, t: t * 2, veil: 1, box: [0, 0, W, H], noAtm: true }); // the core sits at the Earth's centre in any view
  const q = pr(t, ws(12) - 0.1, ws(13), eout), pulse = 0.85 + 0.15 * Math.sin(t * 7);
  glowDot(c, cx, cy, 0.35 * q, 380, [120, 60, 20]);
  label(c, '?', cx, cy + 95, 300 * (0.85 + 0.15 * q) * pulse, C.gold, 'Fraunces', 0.25 + 0.75 * q);
}
const E3 = { x: 430, y: 960, R: 340, yaw: -0.14, pitch: -0.12 };
const L3 = [ws(14) - 0.05, we(21) - 0.05]; // the PKP ray travels from "The" to the end of "away"
const BANDT = ws(22) - 0.05;
function scene3(c, t) { // ONE RAY: the core slows it and bends it away; a quiet band appears on the far side
  c.drawImage(BG.b, 0, 0);
  const proj = earth(c, E3.x, E3.y, E3.R, { yaw: E3.yaw, pitch: E3.pitch, spin: SPIN0 + t * 0.04, t });
  const f = pr(t, L3[0], L3[1], lin), lay = rayLayerAt(RAY_KP, f);
  const ba = pr(t, BANDT, BANDT + 0.5, eout); bandArc(c, proj, ba); station(c, proj, 125, 'off', ba);
  drawRay(c, proj, RAY_KP, f, 1, lay === 'outer' ? [255, 150, 60] : [241, 180, 68]);
  // a flash where the ray enters the core and slows
  const kIn = RAY_KP.pts.findIndex((p) => p[3] === 'outer'), fIn = RAY_KP.pts[kIn][2] / RAY_KP.time, tIn = lerp(L3[0], L3[1], fIn);
  const [ix, iy] = proj(...polar(RAY_KP.pts[kIn][0], RAY_KP.pts[kIn][1])); const fl = pr(t, tIn, tIn + 0.15, lin) * (1 - pr(t, tIn + 0.15, tIn + 0.6, lin)); glowDot(c, ix, iy, fl, 120);
  quake(c, proj, 1, t, pr(t, L3[0] - 0.1, L3[0] + 0.9, lin));
  station(c, proj, RAY_KP.delta, 'on', pr(t, L3[1] - 0.1, L3[1] + 0.1, lin), t, t - L3[1]);
  dust(c, t, 3, 0.6);
  pill(c, 'SHADOW ZONE', CX, 1440, 52, pr(t, BANDT + 0.3, BANDT + 0.7, eout));
}
// drum seismograph (illustration): a turning drum, a pen, a trace that kicks when the waves arrive
const REC = ws(31) - 0.12; // "recorded"
function trace1929(x, t) { // trace height at paper position x (px from the pen, positive = already drawn) — a strong arrival packet after REC
  const tp = t - x / 260; let y = 6 * Math.sin(tp * 23) * Math.sin(tp * 3.1) + 4 * Math.sin(tp * 41 + 1);
  const a = tp - REC; if (a > 0) y += 120 * Math.exp(-a * 1.7) * Math.sin(a * 26) * Math.min(1, a * 8);
  return y; }
function scene4(c, t) { // 1929: stations inside the band recorded strong waves
  c.drawImage(PAGE.seis, 0, 0);
  const dx = 500, dy = 1000, dw = 790, dh = 400, pen = dx + 230;
  c.save(); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 40; c.shadowOffsetY = 18;
  const dg = c.createLinearGradient(0, dy - dh / 2, 0, dy + dh / 2); dg.addColorStop(0, '#CFC6AE'); dg.addColorStop(0.18, '#FFFDF4'); dg.addColorStop(0.6, '#F3ECD8'); dg.addColorStop(1, '#9C927A');
  c.fillStyle = dg; rr(c, dx - dw / 2, dy - dh / 2, dw, dh, 40); c.fill(); c.restore();
  c.fillStyle = '#5C5446'; rr(c, dx - dw / 2 - 40, dy - 30, 40, 60, 10); c.fill(); rr(c, dx + dw / 2, dy - 30, 40, 60, 10); c.fill();
  c.save(); rr(c, dx - dw / 2, dy - dh / 2, dw, dh, 40); c.clip(); // paper lines scroll with the drum
  c.strokeStyle = 'rgba(18,59,49,0.12)'; c.lineWidth = 2; const sc = (t * 260) % 60; for (let x = dx - dw / 2 - 60 + sc; x < dx + dw / 2; x += 60) { c.beginPath(); c.moveTo(x, dy - dh / 2); c.lineTo(x, dy + dh / 2); c.stroke(); }
  c.lineWidth = 5; c.lineJoin = 'round'; c.beginPath(); for (let x = pen; x >= dx - dw / 2; x -= 3) { const y = dy + trace1929(pen - x, t); (x === pen ? c.moveTo(x, y) : c.lineTo(x, y)); } c.strokeStyle = '#123B31'; c.stroke();
  const kick = pr(t, REC, REC + 0.2, lin); if (kick > 0) { c.save(); c.globalCompositeOperation = 'source-over'; c.lineWidth = 7; c.strokeStyle = C.goldDeep; c.beginPath();
    for (let x = pen; x >= dx - dw / 2; x -= 3) { const tp = t - (pen - x) / 260; if (tp < REC) break; const y = dy + trace1929(pen - x, t); (x === pen ? c.moveTo(x, y) : c.lineTo(x, y)); } c.stroke(); c.restore(); }
  c.restore();
  const py = dy + trace1929(0, t); c.save(); c.strokeStyle = '#3B3226'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(pen + 230, dy - 210); c.lineTo(pen + 4, py); c.stroke(); c.fillStyle = '#3B3226'; c.beginPath(); c.arc(pen + 230, dy - 210, 18, 0, 6.283); c.fill(); c.restore();
  glowDot(c, pen, py, 0.6 * pr(t, REC, REC + 0.15, lin) * (1 - pr(t, REC + 0.8, REC + 1.6, lin)), 120);
  tape(c, dx - dw / 2 + 40, dy - dh / 2 - 6, 170, -0.25); tape(c, dx + dw / 2 - 30, dy + dh / 2 + 4, 170, -0.3);
  stamp(c, ['1929'], 300, 690, pr(t, ws(28) - 0.15, ws(28) + 0.15, eout), -0.08);
  dust(c, t, 4, 0.35);
}
const L5 = [ws(41) - 0.25, we(47) - 0.1]; // the PKiKP ray travels "where waves speed up, sending some there"
const UNVEIL = ws(39) - 0.1; // "inner core"
function scene5(c, t) { // 1936: an inner core where waves speed up — one ray bends into the band; continuous push into the core for "solid"
  c.drawImage(BG.b, 0, 0);
  const zu = pr(t, T.zoom[0], T.zoom[1], eio), R = lerp(E3.R, 1900, zu), yaw = lerp(E3.yaw, -0.62, zu), pitch = lerp(E3.pitch, -0.3, zu), M = rot(yaw, pitch);
  const [ox, oy] = planeToScreen(M, R, 0, 0), [oxs, oys] = planeToScreen(M, E3.R, 0, 0); // keep the centre moving from its scene-3 place to (CX, 980)
  const cx = lerp(E3.x + oxs, CX, zu) - ox, cy = lerp(E3.y + oys, 980, zu) - oy;
  const veil = 1 - pr(t, UNVEIL, UNVEIL + 0.45, eio), solid = pr(t, ws(52), ws(53) + 0.1, eio);
  const proj = earth(c, cx, cy, R, { yaw, pitch, spin: SPIN0 + t * 0.04, t, veil, solid, box: zu > 0 ? [0, 0, W, H] : undefined, noAtm: zu > 0.3 });
  const ra = 1 - pr(t, T.zoom[0], T.zoom[0] + 0.25, lin);
  if (ra > 0) {
    bandArc(c, proj, 0.7 * ra, pr(t, we(47) - 0.2, we(47) + 0.2, eout));
    const f = pr(t, L5[0], L5[1], lin); const lay = rayLayerAt(RAY_IK, f);
    c.save(); c.globalAlpha = ra; drawRay(c, proj, RAY_IK, f, 1, lay === 'outer' ? [255, 150, 60] : lay === 'inner' ? [255, 246, 200] : [241, 180, 68]); c.restore();
    const kb = RAY_IK.pts.reduce((m, p, i) => (p[0] < RAY_IK.pts[m][0] ? i : m), 0), tb = lerp(L5[0], L5[1], RAY_IK.pts[kb][2] / RAY_IK.time); // the bounce
    const bf = pr(t, tb - 0.05, tb + 0.1, lin) * (1 - pr(t, tb + 0.1, tb + 0.9, lin));
    if (bf > 0) { const P = []; for (let a = -Math.PI / 2; a <= Math.PI / 2 + 1e-6; a += Math.PI / 40) P.push(proj((RICB / RE) * Math.cos(a), (RICB / RE) * Math.sin(a)));
      c.save(); c.globalAlpha = bf * ra; c.strokeStyle = '#FFF4CC'; c.lineWidth = 6; c.shadowColor = 'rgba(241,180,68,1)'; c.shadowBlur = 24; c.beginPath(); P.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.restore();
      const [bx, by] = proj(...polar(RAY_IK.pts[kb][0], RAY_IK.pts[kb][1])); glowDot(c, bx, by, bf * ra, 110); }
    quake(c, proj, ra, t, pr(t, L5[0] - 0.1, L5[0] + 0.9, lin));
    station(c, proj, 125, f >= 1 ? 'on' : 'off', ra, t, t - L5[1]);
  }
  const [icx, icy] = proj(0, 0); glowDot(c, icx, icy, 0.55 * pr(t, UNVEIL, UNVEIL + 0.3, lin) * (1 - pr(t, UNVEIL + 0.5, UNVEIL + 1.4, lin)), 260);
  // 1936: her portrait chip with a date stamp, then the inner-core label (sequential, never together)
  const pa = pr(t, ws(35) - 0.2, ws(35) + 0.2, eout) * (1 - pr(t, UNVEIL - 0.35, UNVEIL - 0.05, lin));
  circlePortrait(c, PORC, 0.5, 0.36, 0.3, 785, 600, 105, pa); stamp(c, ['1936'], 785, 772, pa, -0.07, C.gold, 'rgba(2,28,22,0.85)');
  pill(c, 'INNER CORE', CX, 1440, 52, pr(t, UNVEIL + 0.1, UNVEIL + 0.45, eout) * (1 - pr(t, T.zoom[0], T.zoom[0] + 0.25, lin)));
  pill(c, 'SOLID', CX, 1440, 60, pr(t, ws(53) - 0.1, ws(53) + 0.25, eout));
  dust(c, t, 5, 0.6);
}
// lesson page: predicted arrivals (dashed) land everywhere except the band; the measured gold arrival lands in it; the mismatch opens onto the hidden core
const PINS = Array.from({ length: 9 }, (_, i) => 160 + i * 85), BANDPINS = [3, 4, 5], MEAS = 4, PY = 1290;
const PRED = [T.slide[1] + 0.15, ws(56)], MT = ws(58) - 0.2, RING = ws(61) - 0.05, LENS = ws(63) - 0.1, CARD = ws(63) + 0.3;
function scene6(c, t) {
  c.drawImage(PAGE.lesson, 0, 0);
  const qx = 130, qy = 700; glowDot(c, qx, qy, 0.5, 60); star(c, qx, qy, 32, 1, C.goldDeep);
  PINS.forEach((x, i) => { const inBand = BANDPINS.includes(i);
    const pu = pr(t, PRED[0] + i * 0.05, PRED[0] + i * 0.05 + 0.4, eout);
    if (!inBand && pu > 0) { c.save(); c.globalAlpha = 0.6; c.setLineDash([10, 12]); c.strokeStyle = '#5E6E68'; c.lineWidth = 5; c.beginPath(); const h = 220 + 90 * Math.sin(i);
      const N_ = 24; for (let k = 0; k <= N_ * pu; k++) { const u = k / N_, X = lerp(qx, x, u), Y = lerp(qy, PY - 40, u) - Math.sin(Math.PI * u) * h; k ? c.lineTo(X, Y) : c.moveTo(X, Y); } c.stroke(); c.restore(); }
    const on = i === MEAS && t > MT + 0.45; c.save(); c.translate(x, PY); c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 10; c.fillStyle = on ? C.gold : inBand ? '#2A3B4E' : '#8E9C96';
    c.beginPath(); c.moveTo(0, 28); c.lineTo(-24, -18); c.lineTo(24, -18); c.closePath(); c.fill(); c.restore(); });
  const bx0 = PINS[3] - 50, bx1 = PINS[5] + 50; c.save(); c.globalAlpha = 0.16 * pr(t, PRED[1], PRED[1] + 0.3, lin); c.fillStyle = '#0A1428'; rr(c, bx0, PY - 70, bx1 - bx0, 140, 20); c.fill(); c.restore();
  const mu = pr(t, MT, MT + 0.5, eio); if (mu > 0) { c.save(); c.strokeStyle = C.gold; c.lineWidth = 9; c.lineCap = 'round'; c.shadowColor = 'rgba(241,180,68,0.9)'; c.shadowBlur = 18; c.beginPath();
    const N_ = 30; for (let k = 0; k <= N_ * mu; k++) { const u = k / N_, X = lerp(qx, PINS[MEAS], u), Y = lerp(qy, PY - 40, u) - Math.sin(Math.PI * u) * 260; k ? c.lineTo(X, Y) : c.moveTo(X, Y); } c.stroke(); c.restore(); }
  const ru = pr(t, RING, RING + 0.4, eout); if (ru > 0) { c.save(); c.strokeStyle = C.gold; c.lineWidth = 7; c.globalAlpha = ru; c.beginPath(); c.arc(PINS[MEAS], PY, 70 + 12 * Math.sin(t * 6), 0, 6.283); c.stroke(); c.restore(); }
  const lu = pr(t, LENS, LENS + 0.6, eio); // the mismatch opens onto the hidden core
  if (lu > 0) { const lx = lerp(PINS[MEAS], CX, lu), ly = lerp(PY, 900, lu), lr = lerp(70, 250, lu);
    c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.fillStyle = '#081F19'; c.beginPath(); c.arc(lx, ly, lr + 14, 0, 6.283); c.fill(); c.restore();
    c.save(); c.beginPath(); c.arc(lx, ly, lr, 0, 6.283); c.clip(); c.fillStyle = '#0B1F1A'; c.fillRect(lx - lr, ly - lr, 2 * lr, 2 * lr);
    const Rr = lr * 1.9, M = rot(-0.14, -0.12), [ox, oy] = planeToScreen(M, Rr, 0, 0); earth(c, lx - ox, ly - oy, Rr, { yaw: -0.14, pitch: -0.12, spin: SPIN0, t, solid: 1, box: [lx - lr, ly - lr, 2 * lr, 2 * lr], noAtm: true, ss: 1 });
    c.restore(); c.save(); c.strokeStyle = C.gold; c.lineWidth = 10; c.beginPath(); c.arc(lx, ly, lr + 8, 0, 6.283); c.stroke(); c.restore(); }
  const ca = pr(t, CARD, CARD + 0.35, eout); if (ca > 0) { c.save(); c.globalAlpha = ca; c.translate(0, (1 - ca) * 30); c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = 'rgba(2,28,22,0.92)'; rr(c, 170, 1390, 660, 130, 24); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
    c.fillStyle = C.gold; c.font = '800 58px InterX'; c.textAlign = 'center'; c.fillText('mismatch = clue', CX, 1476); c.restore(); }
  tape(c, 210, 520, 180, -0.3, 1); tape(c, 820, 1580, 180, 0.25, 1);
}
function scene7(c, t) { // CTA (verified Aarambh listing line)
  c.drawImage(BG.a, 0, 0); const a = pr(t, T.cta[1], T.cta[1] + 0.5, eout);
  c.save(); c.globalAlpha = 0.5 + 0.5 * a; c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 40; c.shadowOffsetY = 16; c.drawImage(icon, CX - 150, 600, 300, 300); c.restore();
  label(c, 'Download Aarambh', CX, 1060, 76, C.cream); label(c, 'to support livelihood tools', CX, 1134, 42, C.gold, 'InterX');
  label(c, 'Fund verified livelihood tools', CX, 1250, 32, 'rgba(251,247,238,0.85)', 'InterB'); label(c, 'and follow their impact.', CX, 1292, 32, 'rgba(251,247,238,0.85)', 'InterB');
  label(c, 'Get it on Google Play', CX, 1400, 28, 'rgba(251,247,238,0.65)', 'Mono');
}
const bufA = createCanvas(W, H), bufB = createCanvas(W, H);
function render(c, t) {
  const at = (fn, buf) => { const x = buf.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; fn(x, t); return buf; };
  const push = (fa, fb, T0, T1) => { const e = eio((t - T0) / (T1 - T0)); const a = at(fa, bufA), b = at(fb, bufB);
    c.save(); c.translate(0, -H * 0.25 * e); c.drawImage(a, 0, 0); c.fillStyle = `rgba(0,0,0,${0.5 * e})`; c.fillRect(0, 0, W, H); c.restore();
    c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.drawImage(b, 0, H * (1 - e)); c.restore(); };
  const slide = (fa, fb, T0, T1) => { const e = eio((t - T0) / (T1 - T0)); const a = at(fa, bufA), b = at(fb, bufB);
    c.save(); c.translate(-W * e, 0); c.drawImage(a, 0, 0); c.restore(); c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.drawImage(b, W * (1 - e), 0); c.restore(); };
  if (t < T.cut) return scene1(c, t);
  if (t < T.whip[0]) return scene2(c, t);
  if (t < T.whip[1]) { const e = eio((t - T.whip[0]) / (T.whip[1] - T.whip[0])); const a = at(scene2, bufA), b = at(scene3, bufB);
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(a, -W * e - k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(b, W * (1 - e) + k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1; return; }
  if (t < T.push[0]) return scene3(c, t);
  if (t < T.push[1]) return push(scene3, scene4, T.push[0], T.push[1]);
  if (t < T.turn[0]) return scene4(c, t);
  if (t < T.turn[1]) { const u = (t - T.turn[0]) / (T.turn[1] - T.turn[0]), e = eio(u); const a = at(scene4, bufA), b = at(scene5, bufB);
    c.drawImage(b, 0, 0); const f = lerp(W, 0, e); c.save(); c.beginPath(); c.rect(0, 0, f, H); c.clip(); c.drawImage(a, 0, 0); c.restore();
    const sg = c.createLinearGradient(f, 0, f + 80, 0); sg.addColorStop(0, 'rgba(2,34,28,0.4)'); sg.addColorStop(1, 'rgba(2,34,28,0)'); c.fillStyle = sg; c.fillRect(f, 0, 80, H);
    const fw = W - f; if (fw > 1) { const lift = Math.sin(Math.PI * u) * 40; c.save(); c.globalAlpha = 1 - pr(u, 0.85, 1); c.beginPath(); c.moveTo(f, 0); c.lineTo(f - fw * 0.5, -lift); c.lineTo(f - fw * 0.5, H + lift); c.lineTo(f, H); c.closePath();
      const bg = c.createLinearGradient(f - fw * 0.5, 0, f, 0); bg.addColorStop(0, '#E9E1CC'); bg.addColorStop(1, '#D3C8AC'); c.fillStyle = bg; c.fill(); c.restore(); } return; }
  if (t < T.slide[0]) return scene5(c, t);
  if (t < T.slide[1]) return slide(scene5, scene6, T.slide[0], T.slide[1]);
  if (t < T.cta[0]) return scene6(c, t);
  if (t < T.cta[1]) return slide(scene6, scene7, T.cta[0], T.cta[1]);
  return scene7(c, t);
}
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
function drawFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; render(ctx, t); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  // no opening flicker or fade: frame 0 is the finished composition (first-frame rule)
  if (t >= T.cut && t < T.cut + 0.1) { ctx.fillStyle = `rgba(255,253,246,${0.4 * (1 - (t - T.cut) / 0.1)})`; ctx.fillRect(0, 0, W, H); }
  // captions: plate centred at x = 500, <= 800 px wide (x 100..900), y 300..460 (brief: upper captions about y 280-460); Inter 800 54 px
  for (const cw of capWin) {
    if (t < cw.t0 || t >= cw.t1) continue;
    const al = clamp(Math.min((t - cw.t0) / 0.1, (cw.t1 - t) / 0.1));
    ctx.save(); ctx.globalAlpha = al; ctx.font = '800 54px InterX';
    const bw = Math.min(800, Math.max(...cw.lines.map((l) => ctx.measureText(l).width)) + 60);
    rr(ctx, CX - bw / 2, 300, bw, 160, 18); ctx.fillStyle = 'rgba(2,28,22,0.9)'; ctx.fill();
    ctx.fillStyle = C.gold; ctx.fillRect(CX - bw / 2 + 18, 456, bw - 36, 3);
    ctx.fillStyle = C.cream; ctx.textAlign = 'center';
    cw.lines.forEach((l, i) => ctx.fillText(l, CX, (cw.lines.length === 1 ? 400 : 368) + i * 62));
    ctx.restore();
  }
  ctx.save(); ctx.font = '800 28px Fraunces'; ctx.fillStyle = 'rgba(251,247,238,0.75)'; ctx.textAlign = 'right'; ctx.fillText('Aarambh', 1000, 1866);
  const sx = 1000 - ctx.measureText('Aarambh').width - 18; ctx.fillStyle = C.gold; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 3.5 : 11; ctx.lineTo(sx + Math.cos(a) * r, 1857 + Math.sin(a) * r); } ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.18; ctx.fillStyle = ctx.createPattern(Math.floor(t * 12) % 2 ? grainA : grainB, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}
function drawThumb(c) { drawFrame(0); c.drawImage(canvas, 0, 0); } // the thumbnail IS frame 0 (first-frame rule, context/25 addendum 2026-11-15)

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const kIn = (ray) => ray.pts.findIndex((p) => p[3] === 'outer') / 1, frac = (ray, layer, first = true) => { const ks = ray.pts.map((p, i) => [p, i]).filter(([p]) => p[3] === layer); const p = first ? ks[0][0] : ks[ks.length - 1][0]; return p[2] / ray.time; };
  const cues = { T, ping0: PING0, sweep: 2.45, quakeHook: 0.0, veilQ: ws(12) - 0.1,
    ray3: L3, ray3Core: [lerp(L3[0], L3[1], frac(RAY_KP, 'outer')), lerp(L3[0], L3[1], frac(RAY_KP, 'outer', false))], band: BANDT,
    stamp1929: ws(28) - 0.15, rec: REC, por1936: ws(35) - 0.2, unveil: UNVEIL,
    ray5: L5, ray5Outer: [lerp(L5[0], L5[1], frac(RAY_IK, 'outer')), lerp(L5[0], L5[1], frac(RAY_IK, 'outer', false))], ray5Bounce: lerp(L5[0], L5[1], RAY_IK.pts.reduce((m, p, i) => (p[0] < RAY_IK.pts[m][0] ? i : m), 0) / 1 && RAY_IK.pts[RAY_IK.pts.reduce((m, p, i) => (p[0] < RAY_IK.pts[m][0] ? i : m), 0)][2] / RAY_IK.time),
    solid: [ws(52), ws(53) + 0.1], pred: PRED, meas: MT, ring: RING, lens: LENS, card: CARD,
    rays: { PKP: { p: pKP, delta: RAY_KP.delta, time_s: RAY_KP.time }, PKiKP: { p: pIK, delta: RAY_IK.delta, time_s: RAY_IK.time, deepest_km: RAY_IK.deepest }, band: BAND } };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T), JSON.stringify(cues.rays));
} else if (args.includes('--capbounds')) { // caption QA: widest line, plate bounds, timings
  const m = createCanvas(10, 10).getContext('2d'); m.font = '800 54px InterX'; let widest = 0, wl = '';
  const rows = capWin.map((cw) => { cw.lines.forEach((l) => { const w = m.measureText(l).width; if (w > widest) { widest = w; wl = l; } }); return `  ${cw.t0.toFixed(2)}-${cw.t1.toFixed(2)} | ${cw.lines.join(' / ')}`; });
  const bw = Math.min(800, widest + 60);
  const txt = `widest caption line ${widest.toFixed(0)} px ("${wl}"); plate ${bw.toFixed(0)} px centred at x 500 -> x ${(CX - bw / 2).toFixed(0)} to ${(CX + bw / 2).toFixed(0)} (rule: inside 100..900); plate y 300-460 (brief: about y 280-460, below the account UI); Inter 800 54 px; ${capWin.length} groups, max 2 lines; padding >= 30 px: ${widest + 60 <= 800}; first caption appears at ${capWin[0].t0.toFixed(2)} s (frame 0 has no caption)\n${rows.join('\n')}\n`;
  writeFileSync(path.join(ROOT, 'qa/caption_bounds.txt'), txt); console.log(txt);
} else if (arg('--thumb')) {
  const cv = createCanvas(W, H); drawThumb(cv.getContext('2d')); writeFileSync(path.resolve(ROOT, arg('--thumb')), cv.toBuffer('image/png')); console.log('thumb written');
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '0,2,4.5,6.5,8,9.2,11,12.9,15,17.3,18.5,19.6,20.5,21.4,23,24.8,26.4,28.5').split(',').map(Number)) { const t0 = Date.now(); drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); console.log(tt, Date.now() - t0, 'ms'); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
