// Aarambh feedback-round 30 s #01 — Archive Light Table: George de Mestral, burrs and the hook-and-loop fastener.
// Six panels on the light table changed by page turns, a slide swap, a hard cut and a CTA slide-in.
// All imagery is original illustration (no free portrait of de Mestral exists on Commons/Wikipedia; none is faked).
// Original Canvas2D code; art direction (read-only) from the public Archive Light Table STYLE.md.
// Usage: node src/render.mjs --out build/video.mp4 | --stills build/st --times 1,5 | --cues
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
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', gold: '#F1B444', goldDeep: '#C98A22', ink: '#123B31', paper: '#FFFDF6', burr: '#7A5A2A', burrDark: '#4E3815', yarn: '#E9DFC6', yarnDark: '#B9A887', tape: '#0A5A49', tapeLight: '#2C7A63' };
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eout = (t) => 1 - Math.pow(1 - t, 3);
const pr = (t, a, b, e = eio) => e(clamp((t - a) / (b - a)));
const obk = (t) => { const s = 1.7; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const u = eio((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i - 1][1].map((v, j) => lerp(v, keys[i][1][j], u)); }
  return keys[keys.length - 1][1];
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

// ---------- word timings (one ASR pass on placed narration) ----------
const WORDS = JSON.parse(readFileSync(path.join(ROOT, 'qa/asr_words_narration.json'), 'utf8')).words;
const ws = (i) => WORDS[i].start, we = (i) => WORDS[i].end;
const CAPS = [
  [0, 6, ['In 1941, burrs stuck', 'to Swiss engineer']],
  [7, 10, ["George de Mestral's", 'clothes.']],
  [11, 17, ['Under a microscope,', 'he saw tiny hooks']],
  [18, 20, ['catching', 'looped threads.']],
  [21, 27, ['With a French weaver,', 'he spent years']],
  [28, 30, ['copying that', 'structure:']],
  [31, 37, ['one strip of hooks,', 'one of loops.']],
  [38, 43, ['Press them together', 'and they grip.']],
  [44, 50, ['Pull, and the flexible', 'hooks let go.']],
  [51, 58, ['The lesson: study how', 'nature solves a problem,']],
  [59, 62, ['then test', 'the mechanism.']],
  [63, 71, ['Follow Aarambh for the ideas', 'behind great inventions.']],
];
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = a === 0 ? 0.3 : ws(a) - 0.08, next = i + 1 < CAPS.length ? ws(CAPS[i + 1][0]) - 0.08 : 30;
  return { t0, t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  stick1: ws(3) - 0.1, stick2: ws(3) + 0.45, name: ws(7) - 0.1,
  turn1: [we(10) - 0.05, ws(11) + 0.05],
  hooks: ws(17), loupe: [ws(17) - 0.35, ws(20) + 0.35], catch: [ws(18), we(20)],
  swap: [ws(21) - 0.4, ws(21) + 0.12],
  years: ws(27), hookStrip: ws(31), loopStrip: ws(35),
  cut: ws(38) - 0.12,
  press: [ws(38), ws(43) - 0.05], grip: ws(43), pull: [ws(44), we(50)],
  turn2: [we(50) + 0.1, ws(51) - 0.05],
  strap: [ws(51) + 0.1, ws(52) + 0.5], steps: [ws(53), ws(60)],
  cta: [ws(63) - 0.6, ws(63) - 0.05],
};

const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
function noiseTile(s, seed, amp) {
  const c = createCanvas(s, s), x = c.getContext('2d'), im = x.createImageData(s, s);
  let a = seed >>> 0; const r = () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < s * s; i++) { const v = 128 + (r() - 0.5) * amp; im.data.set([v, v, v, 255], i * 4); }
  x.putImageData(im, 0, 0); return c;
}
const grainA = noiseTile(256, 7, 40), grainB = noiseTile(256, 99, 40), diffuser = noiseTile(256, 3, 20), paperTex = noiseTile(256, 21, 14);
const tableCache = createCanvas(W + 800, H + 800);
{
  const c = tableCache.getContext('2d'); c.translate(400, 400);
  c.fillStyle = C.desk; c.fillRect(-400, -400, W + 800, H + 800);
  rr(c, 30, 250, W - 60, H - 330, 26); c.fillStyle = C.green; c.fill();
  rr(c, 52, 272, W - 104, H - 374, 14);
  const g = c.createRadialGradient(540, 1050, 120, 540, 1050, 1000); g.addColorStop(0, '#FFFFFB'); g.addColorStop(1, '#E2EADD');
  c.save(); c.fillStyle = g; c.fill(); c.clip();
  c.globalAlpha = 0.06; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(diffuser, 'repeat'); c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.strokeStyle = 'rgba(5,71,58,0.08)'; c.lineWidth = 1.5;
  for (let x = 92; x < W - 52; x += 64) { c.beginPath(); c.moveTo(x, 272); c.lineTo(x, H - 102); c.stroke(); }
  for (let y = 304; y < H - 102; y += 64) { c.beginPath(); c.moveTo(52, y); c.lineTo(W - 52, y); c.stroke(); }
  c.restore();
}

// ---------- pages (900 x 1000 local), drawn per frame onto offscreen canvases ----------
const PW = 900, PH = 1000, PX = 90, PY = 512;
const paperBG = (() => {
  const cv = createCanvas(PW, PH), c = cv.getContext('2d');
  c.fillStyle = C.paper; c.fillRect(0, 0, PW, PH);
  c.globalAlpha = 0.18; c.globalCompositeOperation = 'multiply'; c.fillStyle = c.createPattern(paperTex, 'repeat'); c.fillRect(0, 0, PW, PH);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  const g = c.createRadialGradient(PW / 2, PH / 2, PW * 0.3, PW / 2, PH / 2, PW * 0.78); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(241,180,68,0.16)');
  c.fillStyle = g; c.fillRect(0, 0, PW, PH);
  c.strokeStyle = 'rgba(5,71,58,0.3)'; c.lineWidth = 2; c.strokeRect(16, 16, PW - 32, PH - 32);
  return cv;
})();
const pageCv = {}; for (const id of ['p1', 'p2', 'p3', 'p4', 'p5', 'p6']) pageCv[id] = createCanvas(PW, PH);
function head(c, kicker, title) {
  c.textAlign = 'left'; c.fillStyle = C.goldDeep; c.font = '700 26px Mono'; c.fillText(kicker, 48, 70);
  if (title) { c.fillStyle = C.ink; c.font = '800 46px Fraunces'; c.fillText(title, 48, 124); }
}
function foot(c, text) { c.textAlign = 'left'; c.font = '700 21px Mono'; c.fillStyle = 'rgba(18,59,49,0.72)'; c.fillText(text, 48, PH - 34); }
function label(c, text, x, y, ax, ay, a = 1, col = C.ink) {
  if (a <= 0) return; c.save(); c.globalAlpha = a;
  c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.moveTo(ax, ay); c.lineTo(x, y); c.stroke();
  c.fillStyle = C.gold; c.beginPath(); c.arc(ax, ay, 7, 0, 6.283); c.fill();
  c.font = '800 32px InterX'; const w = c.measureText(text).width + 32;
  c.fillStyle = 'rgba(2,34,28,0.9)'; rr(c, x - w / 2, y - 27, w, 54, 12); c.fill();
  c.fillStyle = C.cream; c.textAlign = 'center'; c.fillText(text, x, y + 11); c.restore();
}
function stamp(c, lines, x, y, a, rot = -0.08) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); const s = 1.3 - 0.3 * a; c.scale(s, s);
  c.font = '800 34px Mono'; const w = Math.max(...lines.map((l) => c.measureText(l).width)) + 40, h = 26 + lines.length * 44;
  c.strokeStyle = C.goldDeep; c.lineWidth = 5; rr(c, -w / 2, -h / 2, w, h, 10); c.stroke();
  c.fillStyle = C.goldDeep; c.textAlign = 'center'; lines.forEach((l, i) => { c.font = i === 0 ? '800 34px Mono' : '700 28px Mono'; c.fillText(l, 0, -h / 2 + 50 + i * 42); });
  c.restore();
}
// drawing primitives for the mechanism
function burr(c, x, y, r, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = C.burrDark; c.beginPath(); c.arc(0, 0, r * 0.62, 0, 6.283); c.fill();
  c.strokeStyle = C.burr; c.lineWidth = Math.max(2, r * 0.07); c.lineCap = 'round';
  for (let k = 0; k < 26; k++) { const a = k * 2.399 + 0.3, l = r * (0.95 + 0.1 * Math.sin(k * 7)); const ex = Math.cos(a) * l, ey = Math.sin(a) * l;
    c.beginPath(); c.moveTo(Math.cos(a) * r * 0.4, Math.sin(a) * r * 0.4); c.lineTo(ex, ey);
    c.quadraticCurveTo(ex + Math.cos(a + 1.6) * r * 0.16, ey + Math.sin(a + 1.6) * r * 0.16, ex + Math.cos(a + 2.6) * r * 0.12, ey + Math.sin(a + 2.6) * r * 0.12); c.stroke(); }
  c.fillStyle = 'rgba(255,240,200,0.18)'; c.beginPath(); c.arc(-r * 0.2, -r * 0.22, r * 0.25, 0, 6.283); c.fill();
  c.restore();
}
function hookShape(c, x, y, len, curl, dir = 1, col = C.tapeLight, w = 7) { // stem from (x,y) along +y*dir, J-hook at the tip; curl 0..1
  c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
  const tipY = y + len * dir; c.beginPath(); c.moveTo(x, y); c.lineTo(x, tipY);
  const r = len * 0.22, a0 = dir > 0 ? 0 : Math.PI, sweep = Math.PI * (0.25 + 0.95 * curl);
  c.arc(x + r, tipY, r, a0 + (dir > 0 ? Math.PI : 0), a0 + (dir > 0 ? Math.PI : 0) - sweep * dir, dir > 0); c.stroke(); c.restore();
}
function loopShape(c, x, y, h, wdt, dir = -1, col = C.yarn, edge = C.yarnDark, lw = 7, stretch = 0) {
  c.save(); c.lineCap = 'round'; const top = y + h * dir * (1 + stretch);
  for (const [cl, ww] of [[edge, lw + 4], [col, lw]]) { c.strokeStyle = cl; c.lineWidth = ww; c.beginPath(); c.moveTo(x - wdt / 2, y); c.bezierCurveTo(x - wdt * 0.8, top, x + wdt * 0.8, top, x + wdt / 2, y); c.stroke(); }
  c.restore();
}

function drawP1(c, t) {
  head(c, 'OBSERVATION · 1941', null);
  c.fillStyle = C.ink; c.textAlign = 'left'; c.font = '800 62px Fraunces'; c.fillText('George de Mestral', 48, 150);
  c.font = '800 30px InterB'; c.fillStyle = 'rgba(18,59,49,0.85)'; c.fillText('Swiss engineer, born 1907', 50, 196);
  const n = pr(t, T.name, T.name + 0.5); if (n > 0) { c.strokeStyle = C.gold; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(50, 168); c.lineTo(50 + 560 * n, 168); c.stroke(); }
  // knitted sleeve (illustration): rows of yarn loops
  c.save(); rr(c, 40, 300, PW - 80, 560, 160); c.clip();
  c.fillStyle = '#C9BC9C'; c.fillRect(40, 300, PW - 80, 560);
  for (let row = 0; row < 15; row++) for (let col = 0; col < 18; col++) {
    const x = 40 + col * 48 + (row % 2) * 24, y = 320 + row * 38;
    loopShape(c, x, y + 22, 24, 30, -1, '#E6DBC1', '#A89778', 6);
  }
  c.restore();
  c.strokeStyle = 'rgba(18,59,49,0.5)'; c.lineWidth = 3; rr(c, 40, 300, PW - 80, 560, 160); c.stroke();
  // burrs fly in and stick (bounce)
  for (const [ts, x, y, r] of [[T.stick1, 560, 560, 70], [T.stick2, 330, 690, 52]]) {
    const u = clamp((t - (ts - 0.45)) / 0.45);
    if (u <= 0) continue;
    const bx = lerp(x + 380, x, eout(u)), by = lerp(y - 420, y, eout(u)) + (u >= 1 ? -Math.max(0, Math.sin((t - ts) * 18)) * 14 * Math.exp(-(t - ts) * 6) : 0);
    c.save(); c.fillStyle = 'rgba(2,34,28,0.18)'; c.beginPath(); c.ellipse(bx + 10, by + r * 0.8, r * 0.9, r * 0.25, 0, 0, 6.283); c.fill(); c.restore();
    burr(c, bx, by, r, t * 0.2 * (1 - u));
  }
  label(c, 'burr', 760, 380, 600, 520, pr(t, T.stick1 + 0.5, T.stick1 + 0.9, eout));
  foot(c, 'ILLUSTRATION · facts: NIHF; WIPO');
}
const SPINES = [[-1.15, 330], [-0.82, 360], [-0.5, 380], [-0.18, 372], [0.12, 350]];
function drawP2(c, t) {
  head(c, 'UNDER THE MICROSCOPE', 'What he saw');
  const cx = 450, cy = 540, R = 370;
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, 6.283); c.clip();
  const g = c.createRadialGradient(cx, cy, 40, cx, cy, R); g.addColorStop(0, '#F3EEDD'); g.addColorStop(0.85, '#D9D0B5'); g.addColorStop(1, '#8F8668');
  c.fillStyle = g; c.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  // burr spines from lower-left, each ending in a hook
  const base = [cx - 300, cy + 300];
  c.fillStyle = C.burrDark; c.beginPath(); c.arc(base[0], base[1], 120, 0, 6.283); c.fill();
  const tips = [];
  SPINES.forEach(([a, L], i) => {
    const ex = base[0] + Math.cos(a) * L, ey = base[1] + Math.sin(a) * L;
    c.strokeStyle = C.burr; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(base[0], base[1]); c.lineTo(ex, ey); c.stroke();
    // hooked tip
    c.beginPath(); c.arc(ex + Math.cos(a + 1.57) * 24, ey + Math.sin(a + 1.57) * 24, 24, a - 1.57 + Math.PI, a - 1.57 + Math.PI + 3.6); c.stroke();
    tips.push([ex + Math.cos(a + 1.57) * 24, ey + Math.sin(a + 1.57) * 24 + 10]);
  });
  // yarn loops drift in from the right and get caught on the hooks
  const k = pr(t, T.catch[0], T.catch[1]);
  tips.forEach(([hx, hy], i) => {
    const ki = clamp(k * 1.6 - i * 0.15);
    const lx = lerp(hx + 330, hx + 6, eout(ki)), ly = lerp(hy - 60, hy + 4, eout(ki));
    c.save(); c.strokeStyle = ki >= 1 ? C.goldDeep : C.yarnDark; c.lineWidth = 15; c.lineCap = 'round';
    c.beginPath(); c.moveTo(lx + 260, ly - 30); c.bezierCurveTo(lx + 120, ly - 40, lx - 40, ly - 50, lx - 28, ly); c.bezierCurveTo(lx - 16, ly + 44, lx + 60, ly + 30, lx + 260, ly + 40); c.stroke();
    c.strokeStyle = C.yarn; c.lineWidth = 9;
    c.beginPath(); c.moveTo(lx + 260, ly - 30); c.bezierCurveTo(lx + 120, ly - 40, lx - 40, ly - 50, lx - 28, ly); c.bezierCurveTo(lx - 16, ly + 44, lx + 60, ly + 30, lx + 260, ly + 40); c.stroke();
    c.restore();
  });
  c.restore();
  c.lineWidth = 26; c.strokeStyle = C.deep; c.beginPath(); c.arc(cx, cy, R + 12, 0, 6.283); c.stroke();
  const la = pr(t, T.hooks, T.hooks + 0.4, eout);
  label(c, 'hook', 700, 230, tips[2][0], tips[2][1] - 30, la);
  label(c, 'looped thread', 640, 880, tips[0][0] + 160, tips[0][1] + 40, pr(t, T.catch[0] + 0.3, T.catch[0] + 0.7, eout));
  foot(c, "ILLUSTRATION · NIHF: 'thousands of tiny hooks'");
  pages.p2tips = tips;
}
const pages = {};
function stripScene(c, t, hookY, loopY, opts = {}) {
  // hook tape (top) and loop tape (bottom), cross-section
  const nH = 9, x0 = 110, dx = 85;
  const hp = opts.hookProg ?? 1, lp = opts.loopProg ?? 1, curl = opts.curl ?? 1, stretch = opts.stretch ?? 0, engaged = opts.engaged ?? 0;
  // loop tape
  c.fillStyle = '#E9DFC6'; c.strokeStyle = C.yarnDark; c.lineWidth = 3; rr(c, 60, loopY, PW - 120, 54, 10); c.fill(); c.stroke();
  for (let i = 0; i < nH; i++) if (i / nH < lp) loopShape(c, x0 + i * dx + 22, loopY + 2, 70, 56, -1, engaged > 0 ? `rgba(241,180,68,${0.5 + 0.5 * engaged})` : C.yarn, C.yarnDark, 8, stretch);
  // hook tape
  c.fillStyle = C.tape; rr(c, 60, hookY - 54, PW - 120, 54, 10); c.fill();
  c.strokeStyle = C.deep; c.lineWidth = 3; c.stroke();
  for (let i = 0; i < nH; i++) if (i / nH < hp) hookShape(c, x0 + i * dx, hookY, 92, curl, 1, C.tapeLight, 9);
}
function drawP3(c, t) {
  head(c, 'COPYING THE STRUCTURE', 'Two strips');
  stamp(c, ['NEARLY 8 YEARS', 'with a weaver in France', 'cotton first, then nylon'], 590, 225, pr(t, T.years, T.years + 0.45, eout), -0.05);
  const hp = pr(t, T.swap[1] + 0.1, T.years + 1.2, (u) => u), lp = pr(t, T.swap[1] + 0.6, T.years + 1.7, (u) => u);
  stripScene(c, t, 450, 720, { hookProg: Math.max(hp, 0.0001), loopProg: Math.max(lp, 0.0001) });
  label(c, 'hook side', 200, 330, 150, 400, pr(t, T.hookStrip, T.hookStrip + 0.4, eout));
  label(c, 'loop side', 210, 822, 170, 756, pr(t, T.loopStrip, T.loopStrip + 0.4, eout));
  c.font = '700 28px Mono'; c.fillStyle = 'rgba(18,59,49,0.85)'; c.textAlign = 'left'; c.fillText('Swiss patent: filed 1951, granted 1954', 48, 922);
  foot(c, 'ILLUSTRATION · sources: WIPO; NIHF');
}
function drawP4(c, t) {
  head(c, 'TEST THE MECHANISM', 'Press, then pull');
  const pd = pr(t, T.press[0], T.press[1]);            // press: hook tape moves down into the loops
  const pu = clamp((t - T.pull[0]) / (T.pull[1] - T.pull[0])); // pull
  const LOOPY = 700, HOOKLEN = 92;
  let hookY = 360 + 190 * pd, curl = 1, stretch = 0, engaged = pd > 0.95 ? 1 : 0;
  if (pu > 0) {
    if (pu < 0.6) { const a = eio(pu / 0.6); hookY = 550 - 60 * a; curl = 1 - 0.65 * a; stretch = Math.max(0, (LOOPY - (hookY + HOOKLEN - 12)) / 70 - 1); }
    else { const b = eout((pu - 0.6) / 0.4), ts = (pu - 0.6) * (T.pull[1] - T.pull[0]); hookY = lerp(490, 280, b); curl = 1 - 0.65 * Math.exp(-ts * 7); stretch = 0.25 * Math.exp(-ts * 8) * Math.cos(ts * 30); engaged = 0; }
  }
  stripScene(c, t, hookY, LOOPY, { curl, stretch, engaged });
  label(c, 'hooks flex open', 690, 470, 520, hookY + 60, pu > 0.15 && pu < 0.62 ? 1 : 0);
  // arrows
  const arrow = (x, y, dir, a, txt) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = C.goldDeep; c.fillStyle = C.goldDeep; c.lineWidth = 8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y - 60 * dir); c.lineTo(x, y + 50 * dir); c.stroke(); c.beginPath(); c.moveTo(x - 22, y + 30 * dir); c.lineTo(x, y + 62 * dir); c.lineTo(x + 22, y + 30 * dir); c.fill();
    c.font = '800 30px Mono'; c.textAlign = 'left'; c.fillText(txt, x + 34, y + 10); c.restore(); };
  arrow(780, 230, 1, pd > 0 && pu === 0 ? 1 - clamp((pd - 0.85) / 0.15) * 0.5 : 0, 'PRESS');
  arrow(780, 250, -1, pu > 0 ? 1 : 0, 'PULL');
  stamp(c, ['GRIP'], 450, 900, pr(t, T.grip, T.grip + 0.3, eout) * (1 - pr(t, T.pull[0], T.pull[0] + 0.2)), 0.04);
  stamp(c, ['RELEASE'], 450, 900, pr(t, T.pull[1] - 0.45, T.pull[1] - 0.1, eout), -0.04);
  foot(c, 'ILLUSTRATION · flexible nylon hooks (NIHF)');
}
function shoe(c, x, y, strapA) {
  c.save(); c.translate(x, y);
  c.fillStyle = '#F1ECDD'; c.strokeStyle = C.ink; c.lineWidth = 5;
  c.beginPath(); c.moveTo(-300, 60); c.quadraticCurveTo(-310, -60, -230, -110); c.quadraticCurveTo(-120, -160, -40, -150); c.quadraticCurveTo(60, -60, 220, -30); c.quadraticCurveTo(320, -10, 330, 60); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = C.green; c.beginPath(); c.moveTo(-320, 60); c.lineTo(345, 60); c.quadraticCurveTo(350, 100, 300, 100); c.lineTo(-300, 100); c.quadraticCurveTo(-330, 95, -320, 60); c.fill();
  // strap pivoting from the far side; strapA 0 = open (lifted), 1 = closed
  c.save(); c.translate(-150, -120); c.rotate(lerp(-0.95, 0.12, strapA));
  c.fillStyle = C.tape; rr(c, -10, -22, 300, 50, 18); c.fill(); c.strokeStyle = C.deep; c.lineWidth = 4; c.stroke();
  c.fillStyle = C.gold; c.fillRect(220, -14, 54, 34); c.restore();
  c.restore();
}
function drawP5(c, t) {
  head(c, 'EVERYDAY USE', 'Open. Close. Repeat.');
  const sa = t < T.strap[0] ? 0 : kf(t, [[T.strap[0], [0]], [T.strap[0] + 0.45, [1]], [T.strap[0] + 0.9, [0.15]], [T.strap[1] + 0.4, [1]]])[0];
  shoe(c, 450, 380, sa);
  // takeaway: the method across the pages
  const steps = [['observe', 'p1'], ['magnify', 'p2'], ['copy', 'p3'], ['test', 'p4']];
  steps.forEach(([name], i) => {
    const a = pr(t, lerp(T.steps[0], T.steps[1], i / 3) - 0.1, lerp(T.steps[0], T.steps[1], i / 3) + 0.35, eout);
    const x = 140 + i * 207, y = 700;
    c.save(); c.globalAlpha = 0.25 + 0.75 * a;
    c.fillStyle = a > 0.5 ? 'rgba(2,34,28,0.9)' : 'rgba(18,59,49,0.15)'; c.beginPath(); c.arc(x, y, 72, 0, 6.283); c.fill();
    c.strokeStyle = C.gold; c.lineWidth = 4; c.stroke();
    c.save(); c.translate(x, y); c.strokeStyle = C.cream; c.fillStyle = C.cream; c.lineWidth = 5; c.lineCap = 'round';
    if (i === 0) burr(c, 0, 0, 34);
    if (i === 1) { c.beginPath(); c.arc(-6, -6, 28, 0, 6.283); c.stroke(); c.beginPath(); c.moveTo(14, 14); c.lineTo(36, 36); c.stroke(); }
    if (i === 2) { c.fillStyle = C.tapeLight; c.fillRect(-36, -26, 72, 16); c.fillStyle = C.yarn; c.fillRect(-36, 12, 72, 16); }
    if (i === 3) { c.beginPath(); c.moveTo(-16, -30); c.lineTo(-16, 30); c.moveTo(-28, 16); c.lineTo(-16, 30); c.lineTo(-4, 16); c.moveTo(16, 30); c.lineTo(16, -30); c.moveTo(4, -16); c.lineTo(16, -30); c.lineTo(28, -16); c.stroke(); }
    c.restore();
    c.fillStyle = C.ink; c.font = '800 30px InterX'; c.textAlign = 'center'; c.fillText(name, x, y + 120);
    if (i < 3) { c.strokeStyle = C.goldDeep; c.lineWidth = 4; c.beginPath(); c.moveTo(x + 82, y); c.lineTo(x + 124, y); c.stroke(); }
    c.restore();
  });
  foot(c, 'ILLUSTRATION · everyday use on shoes (NIHF)');
}
function drawP6(c, t) {
  c.fillStyle = C.deep; c.fillRect(0, 0, PW, PH);
  c.strokeStyle = C.gold; c.lineWidth = 3; c.strokeRect(22, 22, PW - 44, PH - 44);
  const a = pr(t, T.cta[1], T.cta[1] + 0.5, eout);
  c.save(); c.globalAlpha = 0.4 + 0.6 * a; c.drawImage(icon, PW / 2 - 140, 170, 280, 280); c.restore();
  c.fillStyle = C.cream; c.textAlign = 'center'; c.font = '800 76px Fraunces'; c.fillText('Follow Aarambh', PW / 2, 580);
  c.font = '800 36px InterB'; c.fillStyle = C.gold; c.fillText('for the ideas behind', PW / 2, 650); c.fillText('great inventions', PW / 2, 698);
  c.font = '700 22px Mono'; c.fillStyle = 'rgba(251,247,238,0.7)';
  c.fillText('Sources: invent.org · wipo.int (see post caption)', PW / 2, PH - 60);
}
const DRAW = { p1: drawP1, p2: drawP2, p3: drawP3, p4: drawP4, p5: drawP5, p6: drawP6 };
function page(id, t) { const cv = pageCv[id], c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(paperBG, 0, 0); c.save(); DRAW[id](c, t); c.restore(); return cv; }

function pageShadow(c, x, y, w, h, a = 0.3) { c.save(); c.shadowColor = `rgba(2,44,36,${a})`; c.shadowBlur = 26; c.shadowOffsetY = 9; c.fillStyle = '#fff'; c.fillRect(x, y, w, h); c.restore(); }
function drawPage(c, id, t, dx = 0, dy = 0, rot = 0, sc = 1) {
  const cv = page(id, t);
  c.save(); c.translate(PX + PW / 2 + dx, PY + PH / 2 + dy); c.rotate(rot); c.scale(sc, sc); c.translate(-PX - PW / 2, -PY - PH / 2);
  pageShadow(c, PX, PY, PW, PH); c.drawImage(cv, PX, PY); c.restore();
}
function pageTurn(c, idOld, idNew, u, t) {
  drawPage(c, idNew, t);
  const old = page(idOld, t);
  const x0 = PX, x1 = PX + PW, f = lerp(x1, x0, eio(u));
  c.save(); c.beginPath(); c.rect(x0, PY - 40, f - x0, PH + 80); c.clip(); pageShadow(c, PX, PY, PW, PH, 0.2); c.drawImage(old, PX, PY); c.restore();
  const sg = c.createLinearGradient(f, 0, f + 60, 0); sg.addColorStop(0, 'rgba(2,34,28,0.35)'); sg.addColorStop(1, 'rgba(2,34,28,0)');
  c.fillStyle = sg; c.fillRect(f, PY, Math.min(60, x1 - f), PH);
  const fw = x1 - f, fade = 1 - pr(u, 0.82, 1);
  if (fw > 1 && fade > 0) {
    const lift = Math.sin(Math.PI * u) * 26;
    c.save(); c.globalAlpha = fade; c.translate(0, -lift * 0.3);
    c.beginPath(); c.moveTo(f, PY); c.lineTo(f - fw, PY - lift); c.lineTo(f - fw, PY + PH + lift); c.lineTo(f, PY + PH); c.closePath();
    c.save(); c.clip(); const bg = c.createLinearGradient(f - fw, 0, f, 0); bg.addColorStop(0, '#E9E1CC'); bg.addColorStop(0.75, '#F8F3E6'); bg.addColorStop(1, '#D9CFB6');
    c.fillStyle = bg; c.fillRect(f - fw - 2, PY - 60, fw + 4, PH + 120); c.restore();
    c.strokeStyle = 'rgba(5,71,58,0.35)'; c.lineWidth = 2; c.stroke(); c.restore();
  }
}
function slideSwap(c, a, b, u, t) { const e = eio(u); drawPage(c, a, t, -1050 * e, 20 * e, -0.05 * e); drawPage(c, b, t, 1050 * (1 - e), -20 * (1 - e), 0.04 * (1 - e)); }
function scene(c, t) {
  if (t < T.turn1[0]) return drawPage(c, 'p1', t);
  if (t < T.turn1[1]) return pageTurn(c, 'p1', 'p2', (t - T.turn1[0]) / (T.turn1[1] - T.turn1[0]), t);
  if (t < T.swap[0]) return drawPage(c, 'p2', t);
  if (t < T.swap[1]) return slideSwap(c, 'p2', 'p3', (t - T.swap[0]) / (T.swap[1] - T.swap[0]), t);
  if (t < T.cut) return drawPage(c, 'p3', t);
  if (t < T.turn2[0]) return drawPage(c, 'p4', t);
  if (t < T.turn2[1]) return pageTurn(c, 'p4', 'p5', (t - T.turn2[0]) / (T.turn2[1] - T.turn2[0]), t);
  if (t < T.cta[0]) return drawPage(c, 'p5', t);
  if (t < T.cta[1]) return slideSwap(c, 'p5', 'p6', (t - T.cta[0]) / (T.cta[1] - T.cta[0]), t);
  return drawPage(c, 'p6', t);
}
// magnifier — used once, to show the curved tip of one hook under the microscope
function loupe(c, t) {
  const land = Math.min(pr(t, T.loupe[0], T.loupe[0] + 0.35, eout), 1 - pr(t, T.loupe[1] - 0.3, T.loupe[1], eout));
  if (land <= 0.001 || t < T.turn1[1] || t >= T.swap[0] || !pages.p2tips) return;
  const tip = pages.p2tips[3]; const lx = PX + tip[0] + 10, ly = PY + tip[1] - 10;
  const R = 120 * (1.35 - 0.35 * land), mag = 2.4;
  c.save(); c.globalAlpha = land * 0.45; c.fillStyle = 'rgba(1,30,24,0.6)'; c.beginPath(); c.arc(lx + 20, ly + 22, R + 12, 0, 6.283); c.fill(); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.beginPath(); c.arc(lx, ly, R, 0, 6.283); c.clip();
  c.translate(lx, ly); c.scale(mag, mag); c.translate(-lx, -ly); c.drawImage(tableCache, -400, -400); drawPage(c, 'p2', t); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.lineWidth = 20; c.strokeStyle = C.deep; c.beginPath(); c.arc(lx, ly, R + 10, 0, 6.283); c.stroke();
  c.lineWidth = 3; c.strokeStyle = C.gold; c.beginPath(); c.arc(lx, ly, R + 20, 0, 6.283); c.stroke(); c.restore();
}
function camera(t) {
  if (t >= T.cut && t < T.cut + 0.01) return [540, 950, 1.06];
  return kf(t, [[0, [540, 990, 0.93]], [0.7, [540, 962, 0.98]], [T.turn1[0], [540, 954, 1.04]], [T.turn1[1], [540, 952, 1.0]], [T.swap[0], [540, 952, 1.04]], [T.swap[1], [540, 952, 1.0]], [T.cut - 0.01, [540, 954, 1.05]], [T.cut, [540, 950, 1.06]], [T.turn2[0], [540, 954, 1.02]], [T.turn2[1], [540, 952, 1.0]], [T.cta[0], [540, 954, 1.04]], [T.cta[1], [540, 952, 1.0]], [30, [540, 952, 1.03]]]);
}

const canvas = createCanvas(W, H), ctx = canvas.getContext('2d');
function drawFrame(t) {
  const [cx, cy, z] = camera(t);
  ctx.setTransform(z, 0, 0, z, W / 2 - cx * z, H / 2 - cy * z);
  ctx.drawImage(tableCache, -400, -400);
  ctx.translate(540, 1012); ctx.scale(0.94, 0.94); ctx.translate(-540, -1012);
  scene(ctx, t); loupe(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const flick = t < 0.4 ? (t < 0.08 ? 0.35 : t < 0.14 ? 1 : t < 0.2 ? 0.55 : pr(t, 0.2, 0.4)) : 1;
  const dark = 1 - flick;
  if (dark > 0.001) { ctx.fillStyle = `rgba(2,34,28,${clamp(dark * 0.8, 0, 0.8)})`; ctx.fillRect(0, 0, W, H); }
  if (t >= T.cut && t < T.cut + 0.1) { ctx.fillStyle = `rgba(255,253,246,${0.35 * (1 - (t - T.cut) / 0.1)})`; ctx.fillRect(0, 0, W, H); }
  // captions: plate y 350–510, x within 90..990; text ink ~y 372–492
  for (const cw of capWin) {
    if (t < cw.t0 || t >= cw.t1) continue;
    const al = clamp(Math.min((t - cw.t0) / 0.1, (cw.t1 - t) / 0.1));
    ctx.save(); ctx.globalAlpha = al; ctx.font = '800 54px InterX';
    const bw = Math.min(900, Math.max(...cw.lines.map((l) => ctx.measureText(l).width)) + 64);
    rr(ctx, 540 - bw / 2, 350, bw, 160, 16); ctx.fillStyle = 'rgba(2,34,28,0.88)'; ctx.fill();
    ctx.fillStyle = C.gold; ctx.fillRect(540 - bw / 2 + 16, 506, bw - 32, 3);
    ctx.fillStyle = C.cream; ctx.textAlign = 'center';
    cw.lines.forEach((l, i) => ctx.fillText(l, 540, (cw.lines.length === 1 ? 450 : 418) + i * 62));
    ctx.restore();
  }
  ctx.save(); ctx.font = '800 28px Fraunces'; ctx.fillStyle = 'rgba(251,247,238,0.8)'; ctx.textAlign = 'right'; ctx.fillText('Aarambh', 1000, 1866);
  const sx = 1000 - ctx.measureText('Aarambh').width - 18; ctx.fillStyle = C.gold; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 3.5 : 11; ctx.lineTo(sx + Math.cos(a) * r, 1857 + Math.sin(a) * r); } ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.2; ctx.fillStyle = ctx.createPattern(Math.floor(t * 12) % 2 ? grainA : grainB, 'repeat'); ctx.fillRect(0, 0, W, H); ctx.restore();
}

const args = process.argv.slice(2), arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
if (args.includes('--cues')) {
  const cues = { T, stick: [T.stick1, T.stick2], turn: [T.turn1, T.turn2], swap: [T.swap[0], T.cta[0]], cut: [T.cut], land: [T.loupe[0] + 0.35],
    catch: T.catch, weave: [[T.hookStrip - 0.2, 0.8], [T.loopStrip - 0.2, 0.7]], stamp: [T.years], press: T.press, grip: T.grip, pull: T.pull, strap: [T.strap[0] + 0.45, T.strap[1] + 0.4], strapOpen: [T.strap[0] + 0.9],
    tick: [T.name, T.hooks, T.steps[0], lerp(T.steps[0], T.steps[1], 1 / 3), lerp(T.steps[0], T.steps[1], 2 / 3), T.steps[1]], cta: T.cta[1] };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '1.0,3.6,5.3,7.6,8.9,9.4,12.0,14.6,16.6,18.2,19.2,19.8,21.0,23.6,25.6,28.0').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
