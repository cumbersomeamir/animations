// Aarambh production 30 s #01 — Archive Light Table: "Marie Curie: two sciences, two Nobel Prizes".
// Original Canvas2D code. Art direction (read-only) from the public Archive Light Table STYLE.md; no third-party code.
// Usage: node src/render.mjs --out build/video.mp4 | --stills qa/stills --times 1,8 | --cues (writes src/cues.json)
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FS = path.join(ROOT, 'node_modules/@fontsource');
GlobalFonts.registerFromPath(`${FS}/fraunces/files/fraunces-latin-800-normal.woff2`, 'Fraunces');
GlobalFonts.registerFromPath(`${FS}/inter/files/inter-latin-700-normal.woff2`, 'InterB');
GlobalFonts.registerFromPath(`${FS}/inter/files/inter-latin-800-normal.woff2`, 'InterX');
GlobalFonts.registerFromPath('/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf', 'Mono');

const W = 1080, H = 1920, FPS = 30, N = 900;
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', gold: '#F1B444', goldDeep: '#C98A22', ink: '#123B31', paper: '#FFFDF6' };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eout = (t) => 1 - Math.pow(1 - t, 3);
const pr = (t, a, b, e = eio) => e(clamp((t - a) / (b - a)));
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = eio((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i - 1][1].map((v, j) => lerp(v, keys[i][1][j], u)); }
  return keys[keys.length - 1][1];
}

// ---------- word timings (one ASR pass on the placed narration; qa/asr_words_narration.json) ----------
const WORDS = JSON.parse(readFileSync(path.join(ROOT, 'qa/asr_words_narration.json'), 'utf8')).words;
const ws = (i) => WORDS[i].start, we = (i) => WORDS[i].end;
const CAPS = [ // [firstWord, lastWord, lines]  (caption text = final script, correct spelling)
  [0, 8, ['Marie Curie did something', 'no one had done before:']],
  [9, 16, ['she won Nobel Prizes', 'in two different sciences.']],
  [17, 23, ['In 1903, she shared', 'the Physics prize']],
  [24, 29, ['with Pierre Curie', 'and Henri Becquerel,']],
  [30, 33, ['for research', 'on radiation.']],
  [34, 38, ['In 1911,', 'she won Chemistry,']],
  [39, 45, ['for her work on', 'radium and polonium.']],
  [46, 52, ['The lesson is not', 'a motivational slogan.']],
  [53, 59, ['Look at how', 'one line of research']],
  [60, 66, ['led her across the', 'boundaries between subjects.']],
];
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = ws(a) - 0.08;
  const nextStart = i + 1 < CAPS.length ? ws(CAPS[i + 1][0]) - 0.08 : 30;
  return { t0, t1: Math.min(we(b) + 0.6, nextStart - 0.06), lines };
});

// ---------- world layout (1080x1920 table at zoom 1) ----------
const PH = { x: 540, y: 760, w: 300, rot: -0.02 }; PH.h = PH.w * 1305 / 960;
const PL = { x: 290, y: 1235, w: 330, rot: -0.025 }; PL.h = PL.w * 397 / 492;
const CARD1 = { x: 290, y: 1522, w: 410, h: 226, rot: -0.03 };
const CARD2 = { x: 790, y: 1340, w: 400, h: 270, rot: 0.03 };
const BOUND_X = 540;
const LP = (o, lx, ly) => [o.x + lx * Math.cos(o.rot) - ly * Math.sin(o.rot), o.y + lx * Math.sin(o.rot) + ly * Math.cos(o.rot)];
// key reading points
const FACE = [552, 676];
const C1_TITLE = LP(CARD1, -70, -52), C1_NAMES = LP(CARD1, -20, 22);
const PLATE_PT = [PL.x + 10, PL.y - 6];
const C2_TITLE = LP(CARD2, -60, -40), C2_ELEM = LP(CARD2, 128, -34);
// the research thread: portrait -> plate -> physics card -> across the boundary -> chemistry card
const THREAD = [[PH.x - 40, PH.y + PH.h / 2 + 50], [PL.x + 60, PL.y - PL.h / 2 - 8], [PL.x, PL.y + PL.h / 2 + 8], [CARD1.x, CARD1.y - CARD1.h / 2 - 6], [CARD1.x + 150, CARD1.y - CARD1.h / 2 - 6], [BOUND_X, 1462], [CARD2.x - CARD2.w / 2 - 10, CARD2.y + 60]];
const CROSS = [BOUND_X, 1462];

// ---------- timing derived from words ----------
const T = {
  name: ws(0) + 0.6,
  zones: ws(14),                 // "two different sciences"
  c1land: ws(17) + 0.1,          // "In 1903"
  names: ws(25) - 0.15,          // "Pierre Curie and Henri Becquerel"
  plate: ws(31) - 0.3,           // "research on radiation"
  rays: ws(33),
  cross: ws(34) - 0.2,           // "In 1911" — line crosses the boundary
  c2land: ws(35) + 0.5,
  chem: ws(38),                  // "Chemistry"
  elems: ws(43),                 // "radium and polonium"
  lift: we(45) + 0.5,
  thread: ws(56),                // "one line of research"
  across: ws(62),                // "across"
  end: we(66),
};

const portrait = await loadImage(path.join(ROOT, 'assets/marie-curie-c1920-henri-manuel-PD.jpg'));
const plate = await loadImage(path.join(ROOT, 'assets/becquerel-plate-1896-PD.jpg'));
function noiseTile(s, seed, amp) {
  const c = createCanvas(s, s), x = c.getContext('2d'), im = x.createImageData(s, s);
  let a = seed >>> 0; const r = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < s * s; i++) { const v = 128 + (r() - 0.5) * amp; im.data.set([v, v, v, 255], i * 4); }
  x.putImageData(im, 0, 0); return c;
}
const grainA = noiseTile(256, 7, 40), grainB = noiseTile(256, 99, 40), diffuser = noiseTile(256, 3, 20);
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const inkCol = (lit) => `rgb(${Math.round(lerp(18, 201, lit))},${Math.round(lerp(59, 138, lit))},${Math.round(lerp(49, 34, lit))})`;

// cached static table (cream/green glowing glass, frame, grid) — light level applied per frame
const tableCache = createCanvas(W + 800, H + 800);
{
  const c = tableCache.getContext('2d'); c.translate(400, 400);
  c.fillStyle = C.desk; c.fillRect(-400, -400, W + 800, H + 800);
  rr(c, 30, 250, W - 60, H - 330, 26); c.fillStyle = C.green; c.fill();
  rr(c, 52, 272, W - 104, H - 374, 14);
  const g = c.createRadialGradient(540, 1100, 120, 540, 1100, 1000); g.addColorStop(0, '#FFFFFB'); g.addColorStop(1, '#E2EADD');
  c.save(); c.fillStyle = g; c.fill(); c.clip();
  c.globalAlpha = 0.06; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(diffuser, 'repeat'); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.strokeStyle = 'rgba(5,71,58,0.08)'; c.lineWidth = 1.5;
  for (let x = 92; x < W - 52; x += 64) { c.beginPath(); c.moveTo(x, 272); c.lineTo(x, H - 102); c.stroke(); }
  for (let y = 304; y < H - 102; y += 64) { c.beginPath(); c.moveTo(52, y); c.lineTo(W - 52, y); c.stroke(); }
  c.restore();
}
function table(c, light) {
  c.drawImage(tableCache, -400, -400);
  if (light < 0.999) { c.save(); rr(c, 52, 272, W - 104, H - 374, 14); c.globalAlpha = 1 - light; c.fillStyle = C.deep; c.fill(); c.restore(); }
}

function glyphRays(c, x, y, lit, prog = 1) {
  c.save(); c.translate(x, y); c.strokeStyle = inkCol(lit); c.fillStyle = inkCol(lit); c.lineWidth = 3; c.lineCap = 'round';
  c.beginPath(); c.arc(-34, 0, 6, 0, 6.283); c.fill();
  for (let k = -2; k <= 2; k++) { const a = k * 0.32; c.beginPath(); c.moveTo(-26, 0); const n = Math.round(20 * prog); for (let i = 0; i <= n; i++) { const d = i * 3; c.lineTo(-26 + d * Math.cos(a) - Math.sin(i * 0.9) * 3 * Math.sin(a), d * Math.sin(a) + Math.sin(i * 0.9) * 3 * Math.cos(a)); } c.stroke(); }
  c.restore();
}
function elemBox(c, x, y, sym, name, lit) {
  c.save(); c.strokeStyle = inkCol(lit); c.fillStyle = inkCol(lit); c.lineWidth = 3;
  c.strokeRect(x - 34, y - 34, 68, 68);
  c.font = '800 34px Fraunces'; c.textAlign = 'center'; c.fillText(sym, x, y + 10);
  c.font = '700 13px Mono'; c.fillText(name, x, y + 27);
  c.restore();
}

function card(c, o, s, which) {
  c.save(); c.translate(o.x, o.y); c.rotate(o.rot);
  const w = o.w, h = o.h, L = -w / 2 + 26, Tp = -h / 2;
  c.shadowColor = 'rgba(2,44,36,0.22)'; c.shadowBlur = 16; c.shadowOffsetY = 5;
  c.fillStyle = C.paper; c.fillRect(-w / 2, -h / 2, w, h); c.shadowColor = 'rgba(0,0,0,0)';
  const g = c.createRadialGradient(0, 0, w * 0.2, 0, 0, w * 0.62); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(241,180,68,0.14)');
  c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
  c.strokeStyle = 'rgba(5,71,58,0.32)'; c.lineWidth = 2; c.strokeRect(-w / 2 + 9, -h / 2 + 9, w - 18, h - 18);
  c.textAlign = 'left';
  if (which === 1) {
    c.fillStyle = inkCol(s.c1year); c.font = '700 30px Mono'; c.fillText('1903', L, Tp + 50);
    c.fillStyle = C.ink; c.font = '800 33px Fraunces'; c.fillText('Nobel Prize in Physics', L, Tp + 92);
    c.font = '700 20px InterB'; c.fillStyle = inkCol(s.c1names);
    c.fillText('shared: Henri Becquerel,', L, Tp + 130); c.fillText('Pierre Curie, Marie Curie', L, Tp + 156);
    c.font = '700 14px Mono'; c.fillStyle = 'rgba(18,59,49,0.78)';
    c.fillText('"…joint researches on the radiation phenomena…"', L, Tp + 184);
    c.fillStyle = 'rgba(18,59,49,0.6)'; c.font = '700 12px Mono';
    c.fillText('TYPESET SUMMARY, NOT AN ARCHIVAL DOCUMENT · source: nobelprize.org', L, Tp + h - 16);
    if (s.c1names > 0) { c.strokeStyle = C.gold; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(L, Tp + 163); c.lineTo(L + 255 * s.c1names, Tp + 163); c.stroke(); }
  } else {
    c.fillStyle = inkCol(s.c2year); c.font = '700 30px Mono'; c.fillText('1911', L, Tp + 50);
    c.fillStyle = C.ink; c.font = '800 33px Fraunces'; c.fillText('Nobel Prize', L, Tp + 92); c.fillText('in Chemistry', L, Tp + 130);
    c.font = '700 18px InterB'; c.fillStyle = 'rgba(18,59,49,0.85)'; c.fillText('prize share 1/1', L, Tp + 162);
    c.font = '700 14px Mono'; c.fillStyle = inkCol(s.c2quote);
    c.fillText('"…discovery of the elements', L, Tp + 196); c.fillText('radium and polonium…"', L, Tp + 214);
    c.fillStyle = 'rgba(18,59,49,0.6)'; c.font = '700 12px Mono';
    c.fillText('TYPESET SUMMARY, NOT AN ARCHIVAL DOCUMENT · nobelprize.org', L, Tp + h - 16);
    if (s.c2chem > 0) { c.strokeStyle = C.gold; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(L, Tp + 139); c.lineTo(L + 200 * s.c2chem, Tp + 139); c.stroke(); }
  }
  c.restore();
  if (which === 1) glyphRays(c, ...LP(CARD1, 150, -62), s.c1year);
  else { const [ex, ey] = LP(CARD2, 128, -38); elemBox(c, ex - 40, ey, 'Ra', 'radium', s.elems); elemBox(c, ex + 40, ey, 'Po', 'polonium', s.elems); }
}

function photo(c) {
  c.save(); c.translate(PH.x, PH.y); c.rotate(PH.rot);
  const b = 14;
  c.shadowColor = 'rgba(2,44,36,0.28)'; c.shadowBlur = 22; c.shadowOffsetY = 7;
  c.fillStyle = '#FFFFFF'; c.fillRect(-PH.w / 2 - b, -PH.h / 2 - b, PH.w + 2 * b, PH.h + 2 * b + 30); c.shadowColor = 'rgba(0,0,0,0)';
  c.drawImage(portrait, -PH.w / 2, -PH.h / 2, PH.w, PH.h);
  c.font = '700 13px Mono'; c.fillStyle = 'rgba(18,59,49,0.75)';
  c.fillText('Henri Manuel, c. 1920 · public domain · Wikimedia Commons', -PH.w / 2, PH.h / 2 + 27);
  c.restore();
}
function plateObj(c, s) {
  c.save(); c.translate(PL.x, PL.y); c.rotate(PL.rot);
  c.shadowColor = 'rgba(2,44,36,0.25)'; c.shadowBlur = 16; c.shadowOffsetY = 5;
  c.fillStyle = 'rgba(30,40,36,0.9)'; c.fillRect(-PL.w / 2 - 6, -PL.h / 2 - 6, PL.w + 12, PL.h + 12); c.shadowColor = 'rgba(0,0,0,0)';
  c.drawImage(plate, -PL.w / 2, -PL.h / 2, PL.w, PL.h);
  c.font = '700 13px Mono'; c.fillStyle = 'rgba(18,59,49,0.78)';
  c.fillText('H. Becquerel · photographic plate exposed to', -PL.w / 2, PL.h / 2 + 24);
  c.fillText('radioactivity · public domain · Wikimedia Commons', -PL.w / 2, PL.h / 2 + 42);
  c.restore();
}

function polyPart(c, pts, k) { // draw first fraction k of polyline by length
  const seg = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  let rem = tot * k; c.beginPath(); c.moveTo(...pts[0]);
  for (let i = 1; i < pts.length && rem > 0; i++) { const f = Math.min(1, rem / seg[i - 1]); c.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); rem -= seg[i - 1]; }
  c.stroke();
}

function world(c, s) {
  table(c, s.light);
  // subject zones + boundary (the two sciences)
  if (s.zones > 0) {
    c.save(); c.globalAlpha = s.zones;
    c.font = '700 26px Mono'; c.textAlign = 'center'; c.fillStyle = C.ink;
    c.fillText('PHYSICS', 290, 1068); c.fillText('CHEMISTRY', 790, 1068);
    c.strokeStyle = 'rgba(5,71,58,0.55)'; c.lineWidth = 3; c.setLineDash([10, 10]);
    c.beginPath(); c.moveTo(BOUND_X, 1040); c.lineTo(BOUND_X, 1040 + 660 * s.zones); c.stroke(); c.setLineDash([]);
    c.restore();
  }
  photo(c); plateObj(c, s); card(c, CARD1, s, 1); card(c, CARD2, s, 2);
  // radiation ink rays from the plate (continuity)
  if (s.rays > 0) {
    c.save(); c.strokeStyle = C.goldDeep; c.globalAlpha = 0.9; c.lineWidth = 2.5; c.lineCap = 'round';
    for (let k = 0; k < 7; k++) { const a = -0.55 + k * 0.18, r0 = 175, r1 = r0 + 90 * s.rays; c.beginPath(); for (let i = 0; i <= 20; i++) { const r = lerp(r0, r1, i / 20); const wv = Math.sin(i * 1.1 + k) * 4; c.lineTo(PL.x + r * Math.cos(a) - wv * Math.sin(a), PL.y + r * Math.sin(a) + wv * Math.cos(a)); } c.stroke(); }
    c.restore();
  }
  // name reading on the portrait
  if (s.name > 0) {
    const a = [PH.x + PH.w / 2 - 6, PH.y - PH.h / 2 + 60];
    c.save(); c.globalAlpha = s.name; c.strokeStyle = C.gold; c.lineWidth = 3;
    c.beginPath(); c.arc(a[0], a[1], 8, 0, 6.283); c.stroke();
    c.beginPath(); c.moveTo(a[0] + 8, a[1]); c.lineTo(a[0] + 8 + 40 * s.name, a[1]); c.stroke();
    c.fillStyle = 'rgba(2,34,28,0.88)'; rr(c, a[0] + 50, a[1] - 34, 260, 68, 10); c.fill();
    c.fillStyle = C.cream; c.font = '800 36px Fraunces'; c.textAlign = 'left'; c.fillText('Marie Curie', a[0] + 66, a[1] + 12);
    c.restore();
  }
  // research thread (gold) — partial links during the story, full trace in the takeaway
  c.save(); c.strokeStyle = C.gold; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round'; c.setLineDash([2, 13]);
  if (s.link1 > 0) polyPart(c, [THREAD[1], THREAD[2], THREAD[3]].map((p) => p), s.link1);          // plate -> physics card
  if (s.link2 > 0) polyPart(c, [[PL.x + PL.w / 2 + 6, PL.y + 20], CROSS, THREAD[6]], s.link2);     // radiation -> chemistry (crosses boundary)
  c.setLineDash([]);
  if (s.thread > 0) { c.lineWidth = 7; c.globalAlpha = 0.95; polyPart(c, THREAD, s.thread); }
  c.restore();
  if (s.crossFlash > 0) { c.save(); c.globalAlpha = s.crossFlash; c.strokeStyle = C.gold; c.lineWidth = 4; c.beginPath(); c.arc(CROSS[0], CROSS[1], 16 + 26 * (1 - s.crossFlash), 0, 6.283); c.stroke(); c.restore(); }
}

function state(t) {
  const flick = t < 0.45 ? (t < 0.12 ? 0 : t < 0.18 ? 1 : t < 0.24 ? 0.3 : pr(t, 0.24, 0.45)) : 1;
  return {
    light: (0.1 + 0.9 * flick) * (1 - 0.35 * pr(t, 29.0, 30.0)),
    name: Math.max(Math.min(pr(t, T.name, T.name + 0.45, eout), 1 - pr(t, 6.4, 7.0)), pr(t, T.lift + 1.0, T.lift + 1.6)),
    zones: pr(t, T.zones - 0.3, T.zones + 0.7),
    c1year: pr(t, T.c1land, T.c1land + 0.4, eout),
    c1names: pr(t, T.names, T.names + 1.4),
    rays: pr(t, T.rays, T.rays + 0.8),
    link1: pr(t, T.plate, T.plate + 0.8),
    link2: pr(t, T.cross, T.cross + 0.9),
    c2year: pr(t, T.c2land - 0.2, T.c2land + 0.2, eout),
    c2chem: pr(t, T.chem, T.chem + 0.5, eout),
    elems: pr(t, T.elems, T.elems + 0.6, eout), c2quote: pr(t, T.elems, T.elems + 0.6, eout),
    thread: pr(t, T.thread, T.across + 1.2),
    crossFlash: t > T.across + 0.3 ? 1 - pr(t, T.across + 0.3, T.across + 1.3, eout) : 0,
  };
}
const camKeys = [[0, [540, 1080, 0.84]], [0.6, [540, 1060, 0.86]], [2.0, [540, 800, 1.2]], [3.3, [540, 790, 1.22]], [4.6, [540, 1080, 0.86]], [T.c1land - 0.5, [540, 1090, 0.86]], [T.c1land + 0.4, [300, 1480, 1.28]], [T.plate - 0.2, [300, 1470, 1.28]], [T.plate + 0.5, [300, 1260, 1.28]], [T.cross - 0.1, [320, 1270, 1.26]], [T.c2land + 0.1, [720, 1335, 1.26]], [T.lift, [720, 1335, 1.27]], [T.lift + 1.4, [540, 1095, 0.84]], [T.thread, [540, 1095, 0.84]], [30, [540, 1105, 0.87]]];
const lpKeys = [[0, [820, 560]], [0.55, [820, 560]], [1.0, FACE], [3.3, FACE], [3.9, [900, 600]], [T.c1land - 0.6, [80, 1300]], [T.c1land, C1_TITLE], [T.names - 0.1, C1_TITLE], [T.names + 1.3, C1_NAMES], [T.plate, C1_NAMES], [T.plate + 0.5, PLATE_PT], [T.cross, PLATE_PT], [T.c2land, C2_TITLE], [T.elems - 0.35, C2_TITLE], [T.elems + 0.25, C2_ELEM], [T.lift, C2_ELEM], [T.lift + 0.6, [1000, 1000]]];
function landed(t) {
  const segs = [[0.6, 1.0, 3.3, 3.8], [T.c1land - 0.35, T.c1land, T.lift, T.lift + 0.55]];
  let v = 0; for (const [a, b, c, d] of segs) v = Math.max(v, Math.min(pr(t, a, b, eout), 1 - pr(t, c, d, eout)));
  return v;
}

const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
function drawFrame(t) {
  const s = state(t);
  const [cx, cy, z] = kf(t, camKeys);
  ctx.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
  world(ctx, s);
  const land = landed(t);
  if (land > 0.001) {
    const [lx, ly] = kf(t, lpKeys);
    const R = 135 * (1.35 - 0.35 * land), mag = 2.4, sh = 24 * (1.4 - land);
    ctx.save(); ctx.globalAlpha = land * 0.45; ctx.fillStyle = 'rgba(1,30,24,0.6)'; ctx.beginPath(); ctx.arc(lx + sh, ly + sh, R + 14, 0, 6.283); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = clamp(land * 1.6); ctx.beginPath(); ctx.arc(lx, ly, R, 0, 6.283); ctx.clip();
    ctx.translate(lx, ly); ctx.scale(mag, mag); ctx.translate(-lx, -ly); world(ctx, s); ctx.restore();
    ctx.save(); ctx.globalAlpha = clamp(land * 1.6);
    ctx.lineWidth = 20; ctx.strokeStyle = C.deep; ctx.beginPath(); ctx.arc(lx, ly, R + 10, 0, 6.283); ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(lx, ly, R + 3, 3.6, 4.9); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.arc(lx, ly, R + 20, 0, 6.283); ctx.stroke();
    ctx.restore();
  }
  // screen space: captions (upper centre; text ink y ~362-470), signature, grain
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const cw of capWin) {
    if (t < cw.t0 || t >= cw.t1) continue;
    const al = clamp(Math.min((t - cw.t0) / 0.1, (cw.t1 - t) / 0.1));
    ctx.save(); ctx.globalAlpha = al; ctx.font = '800 52px InterX';
    const bw = Math.min(920, Math.max(...cw.lines.map((l) => ctx.measureText(l).width)) + 64);
    rr(ctx, 540 - bw / 2, 336, bw, 148, 16); ctx.fillStyle = 'rgba(2,34,28,0.86)'; ctx.fill();
    ctx.fillStyle = C.gold; ctx.fillRect(540 - bw / 2 + 16, 481, bw - 32, 3);
    ctx.fillStyle = C.cream; ctx.textAlign = 'center';
    cw.lines.forEach((l, i) => ctx.fillText(l, 540, (cw.lines.length === 1 ? 428 : 400) + i * 58));
    ctx.restore();
  }
  ctx.save(); ctx.font = '800 28px Fraunces'; ctx.fillStyle = 'rgba(251,247,238,0.8)'; ctx.textAlign = 'right'; ctx.fillText('Aarambh', 1000, 1866);
  const sx = 1000 - ctx.measureText('Aarambh').width - 18; ctx.fillStyle = C.gold; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 3.5 : 11; ctx.lineTo(sx + Math.cos(a) * r, 1857 + Math.sin(a) * r); } ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.2; ctx.fillStyle = ctx.createPattern(Math.floor(t * 12) % 2 ? grainA : grainB, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const cues = {
    land: [1.0, T.c1land, T.plate + 0.5, T.c2land],
    glide: [[0.55, 0.45], [3.3, 0.6], [T.c1land - 0.6, 0.6], [T.plate, 0.5], [T.cross, 0.9], [T.lift, 0.8]],
    pen: [[T.zones - 0.3, 1.0], [T.names, 1.3], [T.plate, 0.8], [T.cross, 0.9], [T.thread, T.across + 1.2 - T.thread]],
    tick: [T.name, T.c1land + 0.1, T.chem, T.elems, T.across + 0.3],
    bell: [[T.zones, 1760], [T.rays, 2093], [T.elems, 2349], [T.across + 0.3, 2637]],
    T,
  };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log('cues', JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '1.5,5.5,9,11.5,13.5,16.5,19,22,26.5,29.8').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
