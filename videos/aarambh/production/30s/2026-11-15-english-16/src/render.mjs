// Aarambh english-16 30 s #01 — editorial motion (approved animation-direction skill, editorial mode) under the 2026-11-11 rules (context/25) and the
// 2026-11-15 first-frame addendum: frame 0 = real portrait + real 1858 rose + "NOT THE WOUNDS" (no fade/flicker/intro), narration from 0.05 s, thumbnail = frame 0.
// Story: Florence Nightingale's polar-area chart — most soldiers who died weren't killed by wounds -> what killed them? -> blue = preventable disease
// -> after the Sanitary Commission flushed sewers in 1855, the blue shrank, even the next winter (roses redrawn from her 1858 monthly rates)
// -> strong evidence, not certainty -> lesson: before calling it proof, ask what else changed.
// Archival objects (public domain): Henry Hering's photograph of Florence Nightingale, c. 1860 (NPG x82368); "Diagram of the Causes of Mortality in the Army
// in the East" (1858; David Rumsey Map Collection copy via Commons); title page of the Sanitary Commission report (1857; Wellcome Collection b24757354).
// Data: Nightingale's monthly deaths and annual rates per 1,000, April 1854 - March 1856 (Notes on Matters Affecting the Health ... of the British Army, 1858),
// as published in R HistData::Nightingale. Pipe, arrows, cards and the redrawn roses are original illustration.
// Usage: node src/render.mjs --out build/video.mp4 | --stills build/st --times 1,5 | --cues | --thumb out.png
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

const W = 1080, H = 1920, FPS = 30, N = 900, CX = 500; // CX: visual and caption centre inside the x 100..900 safe area
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', gold: '#F1B444', goldDeep: '#C98A22', ink: '#123B31', paper: '#FFFDF6' };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eout = (t) => 1 - Math.pow(1 - t, 3);
const pr = (t, a, b, e = eio) => e(clamp((t - a) / (b - a)));
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const rnd = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- word timings and captions ----------
const WORDS = JSON.parse(readFileSync(path.join(ROOT, 'qa/asr_words_narration.json'), 'utf8')).words;
const ws = (i) => WORDS[i].start, we = (i) => WORDS[i].end;
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json; "1855" is tokens 34-35)
  [0, 4, ['Most British soldiers', 'who died']],
  [5, 12, ['in the Crimean War', "weren't killed by wounds."]],
  [13, 16, ['So what killed them?']],
  [17, 20, ["In Florence", "Nightingale's chart,"]],
  [21, 26, ['blue is death from', 'preventable disease.']],
  [27, 30, ['After a sanitary', 'commission']],
  [31, 35, ['flushed sewers', 'in 1855,']],
  [36, 42, ['the blue shrank,', 'even the next winter.']],
  [43, 46, ['Strong evidence,', 'not certainty:']],
  [47, 53, ["one chart can't rule", 'out other changes.']],
  [54, 58, ['Lesson: before', 'calling it proof,']],
  [59, 62, ['ask what else changed.']],
  [63, 68, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 13: SENT[1].start, 17: SENT[2].start, 27: SENT[3].start, 43: SENT[4].start, 54: SENT[5].start, 63: SENT[6].start };
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2);
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.22, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  cut: SENT[1].start - 0.06,                    // hard cut on "So what killed them?" -> the full real 1858 diagram
  whip: [SENT[3].start - 0.2, SENT[3].start],     // whip pan to the real 1857 Sanitary Commission report
  push: [ws(36) - 0.3, ws(36) - 0.05],            // push to the redrawn before/after roses on "the blue shrank"
  push2: [SENT[4].start - 0.3, SENT[4].start],    // push to the caveat
  turn: [SENT[5].start - 0.35, SENT[5].start],    // page turn to the lesson
  cta: [SENT[6].start - 0.4, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const POR = await loadImage(path.join(ROOT, 'assets/florence-nightingale-hering-npg-x82368-pd.jpg'));
const ROSE = await loadImage(path.join(ROOT, 'assets/nightingale-diagram-causes-of-mortality-1858-pd.jpg'));
const REP = await loadImage(path.join(ROOT, 'assets/sanitary-commission-report-1857-title-wellcome-pd.jpg'));
const crop = (img, fx0, fy0, fx1, fy1) => { const w = Math.round(img.width * (fx1 - fx0)), h = Math.round(img.height * (fy1 - fy0)); const cv = createCanvas(w, h); cv.getContext('2d').drawImage(img, img.width * fx0, img.height * fy0, w, h, 0, 0, w, h); return cv; };
const ROSEC = crop(ROSE, 0.505, 0.04, 0.925, 0.95); // the real April 1854 - March 1855 rose
// Nightingale's monthly figures (Notes on Matters Affecting the Health ... of the British Army, 1858; via HistData::Nightingale): annual rates per 1,000 and counts
const DATA = readFileSync(path.join(ROOT, 'assets/nightingale-monthly-deaths-1854-1856.csv'), 'utf8').trim().split('\n').slice(1).map((l) => { const v = l.split(','); return { date: v[0], dis: +v[2], wou: +v[3], oth: +v[4], rD: +v[5], rW: +v[6], rO: +v[7] }; });
const BEFORE = DATA.slice(0, 12), AFTER = DATA.slice(12, 24);
// ---------- textures, background ----------
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
const BG = { a: makeBg(CX, 980, '#0E5A49', '#01130F'), b: makeBg(CX, 1050, '#0B5244', '#011410'), c: makeBg(CX, 1000, '#0D4F57', '#01131A') };
const PAPER = (() => { const cv = createCanvas(W, H), c = cv.getContext('2d'); c.fillStyle = C.paper; c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.2; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(paperTex, 'repeat'); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; const g = c.createRadialGradient(CX, 1000, 300, CX, 1000, 1200); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(201,138,34,0.22)'); c.fillStyle = g; c.fillRect(0, 0, W, H); return cv; })();

// ---------- primitives ----------
function label(c, text, x, y, size, col = C.cream, font = 'Fraunces', a = 1, align = 'center') { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `800 ${size}px ${font}`; c.textAlign = align; c.fillStyle = col;
  c.shadowColor = 'rgba(0,0,0,0.35)'; c.shadowBlur = 18; c.shadowOffsetY = 4; c.fillText(text, x, y); c.restore(); }
function approx(c, text, x, y, size, col, font = 'Fraunces', a = 1) { // draws a leading '≈ ' in Mono (Fraunces lacks the glyph), rest in font, centred
  if (a <= 0) return; if (!text.startsWith('≈ ')) return label(c, text, x, y, size, col, font, a);
  const rest = text.slice(2); c.save(); c.font = `800 ${size}px Mono`; const w1 = c.measureText('≈ ').width; c.font = `800 ${size}px ${font}`; const w2 = c.measureText(rest).width; c.restore();
  const x0 = x - (w1 + w2) / 2; label(c, '≈', x0, y, size, col, 'Mono', a, 'left'); label(c, rest, x0 + w1, y, size, col, font, a, 'left'); }
function photo(c, img, x, y, w, rot = 0, a = 1, sweep = -1) { // archival print: white border, deep soft shadow, optional light sweep
  if (a <= 0) return; const h = w * img.height / img.width; c.save(); c.globalAlpha = a; c.translate(x + w / 2, y + h / 2); c.rotate(rot);
  c.shadowColor = 'rgba(0,0,0,0.55)'; c.shadowBlur = 40; c.shadowOffsetY = 18; c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2 - 14, -h / 2 - 14, w + 28, h + 28); c.shadowColor = 'rgba(0,0,0,0)';
  c.drawImage(img, -w / 2, -h / 2, w, h);
  if (sweep >= 0 && sweep <= 1) { c.save(); c.beginPath(); c.rect(-w / 2, -h / 2, w, h); c.clip(); const sx = lerp(-w, w, sweep); const g = c.createLinearGradient(sx - 120, 0, sx + 120, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.32)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.rotate(-0.3); c.fillRect(-w * 1.5, -h * 1.5, w * 3, h * 3); c.restore(); }
  c.restore(); return { x, y, w, h };
}
// ---------- primitives (original illustration) ----------
const INK = '#16302A', BLUEW = '#8FB4C9', REDW = '#E7A9A0', GREYW = '#6E6A66';
function glowDot(c, x, y, a, r = 30, col = [241, 180, 68]) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(0.4, `rgba(${col[0]},${col[1]},${col[2]},${0.7 * a})`); g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore(); }
function stamp(c, lines, x, y, a, rot = -0.06, col = C.goldDeep, bg = null) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); const s = 1.3 - 0.3 * a; c.scale(s, s);
  const w = Math.max(...lines.map((l, i) => { c.font = i === 0 ? '800 40px Mono' : '700 32px Mono'; return c.measureText(l).width; })) + 48, h = 30 + lines.length * 50;
  if (bg) { c.fillStyle = bg; rr(c, -w / 2, -h / 2, w, h, 12); c.fill(); } c.strokeStyle = col; c.lineWidth = 6; rr(c, -w / 2, -h / 2, w, h, 12); c.stroke(); c.fillStyle = col; c.textAlign = 'center';
  lines.forEach((l, i) => { c.font = i === 0 ? '800 40px Mono' : '700 32px Mono'; c.fillText(l, 0, -h / 2 + 58 + i * 48); }); c.restore(); }
function chip(c, col, text, x, y, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = '800 38px InterX'; const w = c.measureText(text).width; const x0 = x - (w + 70) / 2;
  c.fillStyle = 'rgba(2,28,22,0.9)'; rr(c, x0 - 18, y - 44, w + 106, 66, 16); c.fill(); c.fillStyle = col; rr(c, x0, y - 30, 40, 40, 8); c.fill(); c.fillStyle = C.cream; c.textAlign = 'left'; c.fillText(text, x0 + 60, y + 2); c.restore(); }
function circlePortrait(c, img, fx, fy, fr, x, y, r, a = 1, ring = C.gold) { if (a <= 0) return; const sw = img.width * fr * 2, sx = img.width * fx - sw / 2, sy = img.height * fy - sw / 2; c.save(); c.globalAlpha = a;
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 30; c.shadowOffsetY = 12; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.clip(); c.drawImage(img, sx, sy, sw, sw, x - r, y - r, 2 * r, 2 * r); c.restore();
  c.strokeStyle = ring; c.lineWidth = 6; c.beginPath(); c.arc(x, y, r + 10, 0, 6.283); c.stroke(); c.restore(); }
const RK = 250 / Math.sqrt(1022.8); // radius per sqrt(rate): Jan 1855 disease rate (the largest wedge) -> 250 px; area proportional to the rate, as in her chart
function rose(c, data, cx, cy, grow, k = RK, hi = null, hiA = 0) { // months from 9 o'clock clockwise (April first), as she drew them
  const wedge = (i, rate, col, alpha) => { if (rate <= 0) return; const a0 = Math.PI + i * Math.PI / 6, r = k * Math.sqrt(rate); c.save(); c.globalAlpha = alpha; c.fillStyle = col; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a0, a0 + Math.PI / 6); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(2,28,22,0.35)'; c.lineWidth = 1.5; c.stroke(); c.restore(); };
  data.forEach((d, i) => { const g = clamp(grow * 12 - i); if (g <= 0) return; const L = [[d.rD, BLUEW], [d.rO, GREYW], [d.rW, REDW]].sort((p, q) => q[0] - p[0]);
    for (const [rate, col] of L) wedge(i, rate * g * g, col, 0.95); });
  if (hi && hiA > 0) for (const i of hi) { const d = data[i]; const tot = Math.max(d.rD, d.rW, d.rO), a0 = Math.PI + i * Math.PI / 6, r = k * Math.sqrt(tot) + 4; c.save(); c.globalAlpha = hiA; c.strokeStyle = C.gold; c.lineWidth = 6; c.shadowColor = 'rgba(241,180,68,0.7)'; c.shadowBlur = 14;
    c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, Math.max(r, 16), a0, a0 + Math.PI / 6); c.closePath(); c.stroke(); c.restore(); }
  c.save(); c.fillStyle = INK; c.beginPath(); c.arc(cx, cy, 4, 0, 6.283); c.fill(); c.restore(); }
function pipe(c, x0, x1, y, t, flow, a = 1) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = '#7C8C88'; rr(c, x0, y - 40, x1 - x0, 80, 40); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.fillStyle = 'rgba(20,30,28,0.85)'; rr(c, x0 + 12, y - 28, x1 - x0 - 24, 56, 28); c.fill();
  const front = lerp(x0 + 12, x1 - 12, flow); for (let k = 0; k < 9; k++) { const sx = lerp(x0 + 60, x1 - 60, rnd(k, 4)); const pushed = sx < front ? Math.min(x1 - 30, front + (k * 9) % 40) : sx; c.fillStyle = '#5B4A35'; c.beginPath(); c.arc(pushed, y + 8 - (k % 3) * 6, 10 + (k % 3) * 3, 0, 6.283); c.fill(); }
  if (flow > 0) { const g = c.createLinearGradient(x0, 0, front, 0); g.addColorStop(0, 'rgba(120,190,220,0.9)'); g.addColorStop(1, 'rgba(200,235,250,0.95)'); c.fillStyle = g; rr(c, x0 + 12, y - 28, Math.max(4, front - x0 - 12), 56, 28); c.fill();
    for (let k = 0; k < 6; k++) { const wx = x0 + 30 + ((t * 300 + k * 90) % Math.max(10, front - x0 - 40)); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(wx, y - 10); c.quadraticCurveTo(wx + 10, y - 18, wx + 20, y - 10); c.stroke(); } }
  c.restore(); }

// ---------- scenes (each draws the full frame; t is global time) ----------
const F0 = { por: [55, 600, 380, -0.03], rose: [470, 585, 455, 0.025] }; // frame-0 composition (also the thumbnail)
function scene1(c, t) { // HOOK — frame 0 is complete: real portrait + real 1858 rose + "NOT THE WOUNDS"
  c.drawImage(BG.a, 0, 0);
  const z = lerp(1.0, 1.035, pr(t, 0, T.cut, (u) => u)); c.save(); c.translate(CX, 1000); c.scale(z, z); c.translate(-CX, -1000);
  photo(c, ROSEC, ...F0.rose, 1, t > 0.3 ? pr(t, 0.3, 1.6, (u) => u) : -1);
  photo(c, POR, ...F0.por, 1, t > 0.5 ? pr(t, 0.5, 1.8, (u) => u) : -1);
  c.restore();
  label(c, 'NOT THE', CX, 1300, 112, C.cream, 'InterX'); label(c, 'WOUNDS', CX, 1440, 136, C.gold, 'InterX');
}
const RP = { x: 70, y: 600, w: 860 }; RP.h = RP.w * ROSE.height / ROSE.width;
function scene2(c, t) { // SUPER HOOK + READING THE CHART: hard cut to the full real diagram; "?"; legend chips
  c.drawImage(BG.b, 0, 0);
  const fx = RP.x + RP.w * 0.76, fy = RP.y + RP.h * 0.42, z = lerp(1.0, 1.12, pr(t, T.cut, T.whip[0], (u) => u));
  c.save(); c.translate(fx, fy); c.scale(z, z); c.translate(-fx, -fy); photo(c, ROSE, RP.x, RP.y, RP.w, -0.008, 1); c.restore();
  const qa = pr(t, ws(13) - 0.15, ws(13) + 0.2, eout) * (1 - pr(t, ws(17) - 0.2, ws(17) + 0.1));
  label(c, '?', CX, 1320, 200, C.gold, 'Fraunces', qa * (0.88 + 0.12 * Math.sin((t - T.cut) * 7)));
  chip(c, BLUEW, 'preventable disease', CX, 1240, pr(t, ws(21) - 0.15, ws(21) + 0.25, eout));
  chip(c, REDW, 'wounds', CX, 1330, pr(t, ws(25) - 0.15, ws(25) + 0.25, eout));
}
const RPG = { x: 280, y: 560, w: 440 }; RPG.h = RPG.w * REP.height / REP.width;
function scene3(c, t) { // PROOF 1: the real 1857 report of the Sanitary Commission; sewers flushed (illustration); 1855
  c.drawImage(BG.c, 0, 0);
  const dz = lerp(1.0, 1.04, pr(t, T.whip[1], T.push[0], (u) => u)); c.save(); c.translate(CX, 900); c.scale(dz, dz); c.translate(-CX, -900);
  photo(c, REP, RPG.x, RPG.y, RPG.w, -0.012, 1, pr(t, T.whip[1], T.whip[1] + 1.2, (u) => u));
  const ul = pr(t, ws(29) - 0.1, ws(30) + 0.2); if (ul > 0) { c.save(); c.strokeStyle = C.gold; c.lineWidth = 6; c.lineCap = 'round'; c.shadowColor = 'rgba(241,180,68,0.6)'; c.shadowBlur = 12; const y = RPG.y + RPG.h * 0.392, x0 = RPG.x + RPG.w * 0.11; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + RPG.w * 0.74 * ul, y); c.stroke(); c.restore(); }
  c.restore();
  stamp(c, ['1855'], 760, 650, pr(t, ws(34) - 0.1, ws(34) + 0.3, eout), 0.08, C.gold, 'rgba(2,28,22,0.75)');
  const pa = pr(t, ws(31) - 0.3, ws(31), eout), fl = pr(t, ws(31), ws(33) + 0.4, (u) => u);
  pipe(c, 150, 850, 1380, t, fl, pa); label(c, 'sewers flushed', CX, 1470, 36, C.cream, 'Mono', pr(t, ws(32) - 0.1, ws(32) + 0.3, eout));
}
const RB = [300, 930], RA = [770, 930];
function scene4(c, t) { // PROOF 2: both roses redrawn from her monthly rates; the "after" rose is far smaller, even in winter
  c.drawImage(BG.a, 0, 0);
  const g = pr(t, T.push[1], T.push[1] + 0.9, (u) => u), hiA = pr(t, ws(39) - 0.2, ws(39) + 0.3, eout);
  rose(c, BEFORE, RB[0], RB[1], g, RK, [8, 9, 10], hiA); rose(c, AFTER, RA[0], RA[1], g, RK, [8, 9, 10], hiA);
  label(c, 'BEFORE', RB[0], 630, 38, C.gold, 'Mono', 1); label(c, 'Apr 1854–Mar 1855', RB[0], 670, 26, C.cream, 'Mono', 1);
  label(c, 'AFTER', RA[0], 760, 38, C.gold, 'Mono', 1); label(c, 'Apr 1855–Mar 1856', RA[0], 800, 26, C.cream, 'Mono', 1);
  const na = pr(t, ws(41) - 0.2, ws(42) + 0.1, eout);
  label(c, 'Jan 1855', RB[0], 1250, 32, C.cream, 'Mono', na); label(c, '2,761', RB[0], 1320, 64, C.gold, 'Fraunces', na);
  label(c, 'Jan 1856', RA[0], 1250, 32, C.cream, 'Mono', na); label(c, '42', RA[0], 1320, 64, C.gold, 'Fraunces', na);
  label(c, 'disease deaths', CX + 35, 1385, 30, C.cream, 'Mono', na);
  label(c, 'redrawn from her 1858 figures', CX + 35, 1460, 24, 'rgba(251,247,238,0.7)', 'Mono', pr(t, T.push[1], T.push[1] + 0.5));
}
function scene5(c, t) { // CAVEAT: the drop matches the cleanup's timing; strong evidence, not certainty; other changes can't be ruled out
  c.drawImage(BG.b, 0, 0);
  const k = RK * 0.62; rose(c, BEFORE, 270, 820, 1, k); rose(c, AFTER, 760, 820, 1, k);
  c.save(); c.strokeStyle = C.gold; c.lineWidth = 8; c.lineCap = 'round'; const ar = pr(t, T.push2[1], T.push2[1] + 0.5, eout); c.beginPath(); c.moveTo(450, 820); c.lineTo(lerp(450, 680, ar), 820); c.stroke();
  if (ar > 0.95) { c.fillStyle = C.gold; c.beginPath(); c.moveTo(696, 820); c.lineTo(672, 804); c.lineTo(672, 836); c.closePath(); c.fill(); } c.restore();
  label(c, 'sewers flushed', 565, 790, 26, C.cream, 'Mono', ar);
  label(c, 'STRONG EVIDENCE', CX, 1120, 66, C.gold, 'InterX', pr(t, ws(43) - 0.15, ws(44) + 0.1, eout));
  label(c, 'NOT CERTAINTY', CX, 1210, 66, C.cream, 'InterX', pr(t, ws(45) - 0.15, ws(46) + 0.1, eout));
  const oq = pr(t, ws(51) - 0.2, ws(53), eout);
  for (let i = 0; i < 3; i++) { const p = clamp(oq * 3 - i); if (p <= 0) continue; const x = lerp(470, 660, (i + 0.5) / 3), y = lerp(700, 870, p) + Math.sin(t * 3 + i) * 6; label(c, '?', x, y, 64, '#B9C4C0', 'Fraunces', p); }
  label(c, 'other changes?', 565, 950, 30, '#B9C4C0', 'Mono', oq);
}
function scene6(c, t) { // PAYOFF: before calling it proof, ask what else changed
  c.drawImage(PAPER, 0, 0);
  circlePortrait(c, POR, 0.41, 0.33, 0.27, CX, 700, 130, 1);
  label(c, 'FLORENCE NIGHTINGALE', CX, 905, 32, C.goldDeep, 'Mono', 1);
  const c1 = pr(t, ws(55) - 0.2, ws(56) + 0.1, eout), c2 = pr(t, ws(59) - 0.2, ws(60) + 0.1, eout);
  const card = (y, txt, a, mark) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 30); c.shadowColor = 'rgba(0,0,0,0.25)'; c.shadowBlur = 20; c.shadowOffsetY = 8; c.fillStyle = 'rgba(2,28,22,0.92)'; rr(c, 150, y - 60, 700, 120, 20); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
    c.fillStyle = C.gold; c.font = '800 44px Mono'; c.textAlign = 'left'; c.fillText(mark, 190, y + 16); c.fillStyle = C.cream; c.font = '800 46px InterX'; c.fillText(txt, 270, y + 16); c.restore(); };
  card(1060, 'before vs after', c1, '1'); card(1210, 'what else changed?', c2, '2');
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
  if (t < T.cut) return scene1(c, t);
  if (t < T.whip[0]) return scene2(c, t);
  if (t < T.whip[1]) { const e = eio((t - T.whip[0]) / (T.whip[1] - T.whip[0])); const a = at(scene2, bufA), b = at(scene3, bufB);
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(a, -W * e - k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1;
    for (let k = 0; k < 3; k++) { c.globalAlpha = k ? 0.25 : 1; c.drawImage(b, W * (1 - e) + k * 40 * Math.sin(Math.PI * e), 0); } c.globalAlpha = 1; return; }
  if (t < T.push[0]) return scene3(c, t);
  if (t < T.push[1]) return push(scene3, scene4, T.push[0], T.push[1]);
  if (t < T.push2[0]) return scene4(c, t);
  if (t < T.push2[1]) return push(scene4, scene5, T.push2[0], T.push2[1]);
  if (t < T.turn[0]) return scene5(c, t);
  if (t < T.turn[1]) { const u = (t - T.turn[0]) / (T.turn[1] - T.turn[0]), e = eio(u); const a = at(scene5, bufA), b = at(scene6, bufB);
    c.drawImage(b, 0, 0); const f = lerp(W, 0, e); c.save(); c.beginPath(); c.rect(0, 0, f, H); c.clip(); c.drawImage(a, 0, 0); c.restore();
    const sg = c.createLinearGradient(f, 0, f + 80, 0); sg.addColorStop(0, 'rgba(2,34,28,0.4)'); sg.addColorStop(1, 'rgba(2,34,28,0)'); c.fillStyle = sg; c.fillRect(f, 0, 80, H);
    const fw = W - f; if (fw > 1) { const lift = Math.sin(Math.PI * u) * 40; c.save(); c.globalAlpha = 1 - pr(u, 0.85, 1); c.beginPath(); c.moveTo(f, 0); c.lineTo(f - fw * 0.5, -lift); c.lineTo(f - fw * 0.5, H + lift); c.lineTo(f, H); c.closePath();
      const bg = c.createLinearGradient(f - fw * 0.5, 0, f, 0); bg.addColorStop(0, '#E9E1CC'); bg.addColorStop(1, '#D3C8AC'); c.fillStyle = bg; c.fill(); c.restore(); } return; }
  if (t < T.cta[0]) return scene6(c, t);
  if (t < T.cta[1]) { const e = eio((t - T.cta[0]) / (T.cta[1] - T.cta[0])); const a = at(scene6, bufA), b = at(scene7, bufB);
    c.save(); c.translate(-W * e, 0); c.drawImage(a, 0, 0); c.restore(); c.save(); c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 60; c.drawImage(b, W * (1 - e), 0); c.restore(); return; }
  return scene7(c, t);
}
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
function drawFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; render(ctx, t); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  // no opening flicker or fade: frame 0 is the finished composition (first-frame rule)
  if (t >= T.cut && t < T.cut + 0.1) { ctx.fillStyle = `rgba(255,253,246,${0.4 * (1 - (t - T.cut) / 0.1)})`; ctx.fillRect(0, 0, W, H); }
  // captions: plate centred at x = 500, <= 800 px wide (x 100..900), y 330..490; Inter 800 54 px
  for (const cw of capWin) {
    if (t < cw.t0 || t >= cw.t1) continue;
    const al = clamp(Math.min((t - cw.t0) / 0.1, (cw.t1 - t) / 0.1));
    ctx.save(); ctx.globalAlpha = al; ctx.font = '800 54px InterX';
    const bw = Math.min(800, Math.max(...cw.lines.map((l) => ctx.measureText(l).width)) + 60);
    rr(ctx, CX - bw / 2, 330, bw, 160, 18); ctx.fillStyle = 'rgba(2,28,22,0.9)'; ctx.fill();
    ctx.fillStyle = C.gold; ctx.fillRect(CX - bw / 2 + 18, 486, bw - 36, 3);
    ctx.fillStyle = C.cream; ctx.textAlign = 'center';
    cw.lines.forEach((l, i) => ctx.fillText(l, CX, (cw.lines.length === 1 ? 430 : 398) + i * 62));
    ctx.restore();
  }
  ctx.save(); ctx.font = '800 28px Fraunces'; ctx.fillStyle = 'rgba(251,247,238,0.75)'; ctx.textAlign = 'right'; ctx.fillText('Aarambh', 1000, 1866);
  const sx = 1000 - ctx.measureText('Aarambh').width - 18; ctx.fillStyle = C.gold; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 3.5 : 11; ctx.lineTo(sx + Math.cos(a) * r, 1857 + Math.sin(a) * r); } ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.18; ctx.fillStyle = ctx.createPattern(Math.floor(t * 12) % 2 ? grainA : grainB, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}
function drawThumb(c) { drawFrame(0); c.drawImage(canvas, 0, 0); } // the thumbnail IS frame 0 (first-frame rule, context/25 addendum 2026-11-15)

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const cues = { T, sweep: 0.3, wounds: ws(12) - 0.1, cut: T.cut, q: ws(13) - 0.15, chip1: ws(21) - 0.15, chip2: ws(25) - 0.15, whip: T.whip, underline: ws(29) - 0.1,
    pipe: ws(31) - 0.3, flush: [ws(31), ws(33) + 0.4], stamp: ws(34) - 0.1, push: T.push, grow: [T.push[1], T.push[1] + 0.9], winter: ws(39) - 0.2, numbers: ws(41) - 0.2,
    push2: T.push2, arrow: T.push2[1], strong: ws(43) - 0.15, notcert: ws(45) - 0.15, others: [ws(51) - 0.2, ws(53)], turn: T.turn, card1: ws(55) - 0.2, card2: ws(59) - 0.2, cta: T.cta };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--thumb')) {
  const cv = createCanvas(W, H); drawThumb(cv.getContext('2d')); writeFileSync(path.resolve(ROOT, arg('--thumb')), cv.toBuffer('image/png')); console.log('thumb written');
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '0.5,2.4,4.5,5.6,7,9,11,13,13.9,15.2,16.4,18,20.5,22.8,24.2,25.8,28.5').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
