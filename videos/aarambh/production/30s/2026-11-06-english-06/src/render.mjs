// Aarambh english-06 30 s #01 — Archive Light Table (English): Mary Anderson and the windshield wiper (U.S. Patent 743,801, 1903).
// Seven pages on the light table changed by page turns, slide swaps, a hard cut and a CTA slide-in (accepted recipe); English captions.
// Archival objects: portrait of Mary Anderson, c. 1910 (Wikimedia Commons, PD-old; same photo as NIHF's inductee image) and the
// real patent drawing sheet (USPTO). Trolley, snow, window, handle, spring and counterweight scenes are original illustrations
// labelled "ILLUSTRATION". Original Canvas2D code (core from the feedback-05 renderer; English typography from round-02).
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
const C = { green: '#05473A', deep: '#022C24', desk: '#011E18', cream: '#FBF7EE', gold: '#F1B444', goldDeep: '#C98A22', ink: '#123B31', paper: '#FFFDF6', yarnDark: '#B9A887', tape: '#0A5A49', glass: '#CFE3E8', night: '#2E4650', snow: '#FFFFFF' };
const RED = '#B5532F';
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
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const rnd = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- word timings (one ASR pass on placed narration) ----------
const WORDS = JSON.parse(readFileSync(path.join(ROOT, 'qa/asr_words_narration.json'), 'utf8')).words;
const ws = (i) => WORDS[i].start, we = (i) => WORDS[i].end;
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json)
  [0, 6, ['On a snowy New York', 'trolley ride,']],
  [7, 11, ['Mary Anderson', 'noticed a problem.']],
  [12, 17, ['Drivers had to open', 'their windows,']],
  [18, 23, ['sometimes stopping', 'to clear the glass.']],
  [24, 29, ['Her 1903 patent', 'put rubber blades']],
  [30, 35, ['on an arm', 'outside the glass.']],
  [36, 39, ['Turn a handle inside,']],
  [40, 47, ['and springs press the', 'rubber as it sweeps.']],
  [48, 54, ['A counterweight kept the', 'swinging arm balanced.']],
  [55, 59, ['Lesson: the hassles', 'everyone accepts']],
  [60, 65, ['are problems', 'waiting for a tool.']],
  [66, 71, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 12: SENT[1].start, 24: SENT[2].start, 36: SENT[3].start, 48: SENT[4].start, 55: SENT[5].start, 66: SENT[6].start }; // script starts override early ASR stamps
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2); // mid-sentence: halfway through the pause
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.25, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  turn1: [SENT[1].start - 0.35, SENT[1].start], swap: [SENT[2].start - 0.35, SENT[2].start],
  loupe: [ws(28) - 0.2, ws(35) + 0.3],
  cut: SENT[3].start - 0.06, // hard cut on "Turn"
  turn2: [SENT[4].start - 0.35, SENT[4].start], swap2: [SENT[5].start - 0.35, SENT[5].start], cta: [SENT[6].start - 0.5, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const IMG = {};
for (const [k, f] of [['portrait', 'mary-anderson-c1910-commons.jpg'], ['pat', 'us743801-sheet1-fig1-fig2.png']]) IMG[k] = await loadImage(path.join(ROOT, 'assets', f));
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
const pageCv = {}; for (const id of ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']) pageCv[id] = createCanvas(PW, PH);
function head(c, kicker, title) {
  c.textAlign = 'left'; c.fillStyle = C.goldDeep; c.font = '700 26px Mono'; c.fillText(kicker, 48, 70);
  if (title) { c.fillStyle = C.ink; c.font = '800 46px Fraunces'; c.fillText(title, 48, 124); }
}
function foot(c, text) { c.textAlign = 'left'; c.font = '700 21px Mono'; c.fillStyle = 'rgba(18,59,49,0.72)'; c.fillText(text, 48, PH - 34); }
function pill(c, text, x, y, a = 1, size = 30) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.font = `800 ${size}px InterX`; const w = c.measureText(text).width + 32; c.fillStyle = 'rgba(2,34,28,0.9)'; rr(c, x - w / 2, y - size * 0.85, w, size * 1.7, 12); c.fill(); c.fillStyle = C.cream; c.textAlign = 'center'; c.fillText(text, x, y + size * 0.34); c.restore(); }
function stamp(c, lines, x, y, a, rot = -0.08, col = C.goldDeep) {
  if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); const s = 1.3 - 0.3 * a; c.scale(s, s);
  c.font = '800 34px Mono'; const w = Math.max(...lines.map((l, i) => { c.font = i === 0 ? '800 34px Mono' : '700 28px Mono'; return c.measureText(l).width; })) + 40, h = 26 + lines.length * 46;
  c.strokeStyle = col; c.lineWidth = 5; rr(c, -w / 2, -h / 2, w, h, 10); c.stroke();
  c.fillStyle = col; c.textAlign = 'center'; lines.forEach((l, i) => { c.font = i === 0 ? '800 34px Mono' : '700 28px Mono'; c.fillText(l, 0, -h / 2 + 52 + i * 44); });
  c.restore();
}
function note(c, text, x, y, size = 24, col = 'rgba(18,59,49,0.78)', align = 'left', font = 'InterB') { c.textAlign = align; c.font = `${font === 'InterX' ? 800 : 700} ${size}px ${font}`; c.fillStyle = col; c.fillText(text, x, y); }
// archival print: white border + soft shadow; returns drawn rect
function print(c, img, x, y, w, rot = 0, credit = null, align = 'left') {
  const h = w * img.height / img.width;
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot);
  c.shadowColor = 'rgba(2,44,36,0.28)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
  c.fillStyle = '#FFFFFF'; c.fillRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24 + (credit ? 30 : 0)); c.shadowColor = 'rgba(0,0,0,0)';
  c.drawImage(img, -w / 2, -h / 2, w, h);
  if (credit) { c.font = '700 18px Mono'; c.fillStyle = 'rgba(18,59,49,0.8)'; c.textAlign = align; c.fillText(credit, align === 'right' ? w / 2 : -w / 2, h / 2 + 30); }
  c.restore(); return { x, y, w, h };
}

// ---------- illustration primitives ----------
function snowfall(c, t, n, x0, y0, w, h, seed = 1, a = 1, speed = 60) { // flakes drift down inside a box (deterministic)
  c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip(); c.fillStyle = `rgba(255,255,255,${0.9 * a})`;
  for (let i = 0; i < n; i++) { const sp = speed * (0.6 + rnd(i, seed) * 0.8), r = 2 + rnd(i, seed + 2) * 4;
    const y = y0 + ((rnd(i, seed + 3) * h + t * sp) % h), x = x0 + rnd(i, seed + 4) * w + Math.sin(t * 1.3 + i) * 8;
    c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); }
  c.restore();
}
function snowCrust(c, x, y, w, h, amt, seed = 5) { // snow built up on glass: soft white blotches; amt 0..1
  if (amt <= 0) return; c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
  c.fillStyle = `rgba(250,252,253,${0.55 * amt})`; c.fillRect(x, y, w, h);
  for (let i = 0; i < 160; i++) { if (rnd(i, seed) > amt) continue; const bx = x + rnd(i, seed + 1) * w, by = y + rnd(i, seed + 2) * h, br = 6 + rnd(i, seed + 3) * 18;
    c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(bx, by, br, 0, 6.283); c.fill();
    c.strokeStyle = 'rgba(120,150,160,0.35)'; c.lineWidth = 1.5; c.stroke(); }
  c.restore();
}
function trolley(c, cx, by, s, o = {}) { // front view of an early electric streetcar; by = bottom y; o: snow, sideOpen, lean, wipe
  c.save(); c.translate(cx, by); c.scale(s, s);
  c.strokeStyle = C.ink; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -330); c.lineTo(60, -420); c.stroke(); // trolley pole
  c.fillStyle = C.tape; rr(c, -150, -330, 300, 330, 26); c.fill();
  c.fillStyle = '#0B4A3D'; rr(c, -160, -340, 320, 34, 14); c.fill(); // roof
  // windshield (centre vestibule window) with driver silhouette behind it
  const gx = -90, gy = -290, gw = 180, gh = 130;
  c.fillStyle = C.glass; c.fillRect(gx, gy, gw, gh);
  c.fillStyle = 'rgba(42,51,47,0.75)'; c.beginPath(); c.arc(-10, gy + 62, 22, 0, 6.283); c.fill(); rr(c, -52, gy + 88, 84, 50, 18); c.fill();
  snowCrust(c, gx, gy, gw, gh, o.snow || 0, 11);
  if (o.wipe > 0) { c.save(); c.beginPath(); c.ellipse(o.wx || 0, o.wy || gy + 65, 80 * o.wipe, 52 * o.wipe, 0, 0, 6.283); c.clip(); c.fillStyle = C.glass; c.fillRect(gx, gy, gw, gh);
    c.fillStyle = 'rgba(42,51,47,0.75)'; c.beginPath(); c.arc(-10, gy + 62, 22, 0, 6.283); c.fill(); rr(c, -52, gy + 88, 84, 50, 18); c.fill(); c.restore(); }
  c.strokeStyle = C.ink; c.lineWidth = 5; c.strokeRect(gx, gy, gw, gh);
  // side windows; the right one opens (glass slides down)
  for (const sx of [-140, 102]) { c.fillStyle = C.glass; c.fillRect(sx, -280, 38, 110); c.strokeStyle = C.ink; c.lineWidth = 4; c.strokeRect(sx, -280, 38, 110); }
  const so = o.sideOpen || 0; c.fillStyle = 'rgba(18,59,49,0.85)'; c.fillRect(102, -280 + 110 * so, 38, 110 * (1 - so));
  if ((o.lean || 0) > 0) { c.save(); c.globalAlpha = o.lean; c.fillStyle = '#2A332F'; c.beginPath(); c.arc(121 + 14 * o.lean, -238, 17, 0, 6.283); c.fill(); c.fillStyle = '#1B1F1D'; rr(c, 106 + 14 * o.lean, -262, 32, 10, 4); c.fill(); c.restore(); } // driver's head out of the side window
  c.fillStyle = C.gold; c.beginPath(); c.arc(0, -110, 20, 0, 6.283); c.fill(); // headlight
  c.fillStyle = C.ink; rr(c, -160, -40, 320, 26, 8); c.fill(); // bumper
  c.restore();
}

// ---------- pages ----------
function drawP1(c, t) {
  head(c, 'NEW YORK · EARLY 1900s', null);
  const inA = pr(t, 0.12, 0.6, eout);
  c.save(); c.globalAlpha = inA; c.translate(0, (1 - inA) * 24); print(c, IMG.portrait, 52, 100, 360, -0.02, 'Mary Anderson, c. 1910'); c.restore();
  // winter street panel with a trolley: snow falls from frame 0 (immediate hook)
  const px = 450, py = 100, pw = 400, ph = 500;
  c.fillStyle = C.night; rr(c, px, py, pw, ph, 14); c.fill();
  const tin = pr(t, ws(5) - 0.4, ws(5) + 0.3, eout);
  c.save(); c.beginPath(); rr(c, px, py, pw, ph, 14); c.clip();
  c.fillStyle = 'rgba(255,255,255,0.12)'; c.fillRect(px, py + ph - 70, pw, 70); // street
  trolley(c, lerp(px + pw + 160, px + pw / 2, tin), py + ph - 30, 1.0, { snow: 0.25 + 0.6 * pr(t, 0.5, 4.5, (u) => u) });
  snowfall(c, t, 70, px, py, pw, ph, 3, 1, 70);
  c.restore();
  note(c, 'ILLUSTRATION', px + pw - 12, py + ph - 14, 18, 'rgba(255,255,255,0.75)', 'right', 'Mono');
  const pl = pr(t, ws(7) - 0.25, ws(7) + 0.25, eout);
  if (pl > 0) { c.save(); c.globalAlpha = pl; c.translate(0, (1 - pl) * 20);
    c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, 52, 650, 796, 130, 16); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
    c.fillStyle = C.cream; c.textAlign = 'left'; c.font = '800 50px Fraunces'; c.fillText('Mary Anderson', 80, 712);
    c.fillStyle = C.gold; c.font = '800 28px InterX'; c.fillText('inventor · 1866–1953 · Birmingham, Alabama', 80, 756); c.restore(); }
  pill(c, 'the problem: snow on the glass', 450, 860, pr(t, ws(11) - 0.2, ws(11) + 0.25, eout), 30);
  foot(c, 'Sources: NIHF; U.S. Patent 743,801');
}
function drawP2(c, t) {
  head(c, 'THE PROBLEM', 'Drivers could not see');
  const px = 60, py = 160, pw = 780, ph = 600;
  c.fillStyle = C.night; rr(c, px, py, pw, ph, 14); c.fill();
  c.save(); c.beginPath(); rr(c, px, py, pw, ph, 14); c.clip();
  const stop = pr(t, ws(19) - 0.1, ws(19) + 0.4);
  const road = (t < ws(19) ? t : ws(19) + (t - ws(19)) * (1 - stop)) * 260; // street lines slide until the car stops
  c.fillStyle = 'rgba(255,255,255,0.1)'; c.fillRect(px, py + ph - 110, pw, 110);
  c.fillStyle = 'rgba(255,255,255,0.35)'; for (let k = -1; k < 8; k++) { const x = px + ((k * 130 - road) % 1040 + 1040) % 1040 - 130; c.fillRect(x, py + ph - 60, 70, 8); }
  const op = pr(t, ws(15) - 0.2, ws(15) + 0.4), lean = op * (1 - pr(t, ws(19), ws(19) + 0.3));
  const wipe = pr(t, ws(21) - 0.2, ws(23) + 0.4);
  trolley(c, px + pw / 2, py + ph - 40, 1.6, { snow: 0.35 + 0.6 * pr(t, SENT[1].start - 0.4, ws(15), (u) => u), sideOpen: op, lean, wipe, wx: -20, wy: -220 });
  if (wipe > 0 && wipe < 0.98) { const a = wipe * 16, hx = px + pw / 2 + 1.6 * (-20 + Math.cos(a) * 55 * wipe), hy = py + ph - 40 + 1.6 * (-225 + Math.sin(a) * 34 * wipe);
    c.save(); c.translate(hx, hy); c.rotate(-0.3); c.fillStyle = '#8C5A3C'; c.strokeStyle = C.ink; c.lineWidth = 3; rr(c, -22, -26, 44, 56, 18); c.fill(); c.stroke(); rr(c, -36, -6, 18, 26, 8); c.fill(); c.stroke(); c.fillStyle = '#6E4630'; c.fillRect(-24, 22, 48, 18); c.restore(); } // mitten
  snowfall(c, t, 90, px, py, pw, ph, 7, 1, 80);
  c.restore();
  note(c, 'ILLUSTRATION', px + pw - 14, py + ph - 16, 18, 'rgba(255,255,255,0.75)', 'right', 'Mono');
  pill(c, 'window opened to see', 640, 230, pr(t, ws(15) - 0.15, ws(15) + 0.3, eout), 28);
  stamp(c, ['STOPPED', 'to clear the glass'], 450, 862, stop, -0.04, RED);
  foot(c, 'Source: NIHF inductee page');
}
const PAT = { x: 110, y: 92, w: 680 };
function drawP3(c, t) {
  head(c, 'THE 1903 PATENT', null);
  const r = print(c, IMG.pat, PAT.x, PAT.y, PAT.w, -0.008, 'U.S. Patent 743,801, drawing sheet (USPTO)');
  pages.p3pat = r;
  note(c, 'Fig. 2: rubber blades (T) on a swinging arm', 450, 842, 28, C.ink, 'center', 'InterX');
  stamp(c, ['PATENT 743,801 · NOV. 10, 1903'], 450, 910, pr(t, ws(26) - 0.1, ws(26) + 0.35, eout), -0.03);
}
// window mechanism geometry (page coords): glass rect and pivot at its top-right corner (as in patent Fig. 2)
const G = { x: 80, y: 190, w: 470, h: 470 }, PIV = { x: 560, y: 180 }, ARM = 520;
function armAngle(t) { // radians; PI/2 = straight down, PI = pointing left
  const t0 = ws(38) + 0.25; if (t < t0) return 2.25;
  const u = (t - t0) / 1.7; return 2.25 + Math.sin(u * Math.PI * 2) * 0.5; // swings between ~100° and ~158°
}
function sweptRange(t) { const t0 = ws(38) + 0.25; if (t < t0) return null; let lo = 2.25, hi = 2.25; for (let x = t0; x <= t; x += 1 / 30) { const a = armAngle(x); lo = Math.min(lo, a); hi = Math.max(hi, a); } return [lo, hi]; }
function windowScene(c, t, angle, snowAmt = 0.95, swept = null) {
  c.fillStyle = '#5E4A33'; rr(c, G.x - 26, G.y - 26, G.w + 52, G.h + 52, 8); c.fill(); // frame
  c.fillStyle = C.glass; c.fillRect(G.x, G.y, G.w, G.h);
  snowCrust(c, G.x, G.y, G.w, G.h, snowAmt, 21);
  if (swept) { c.save(); c.beginPath(); c.rect(G.x, G.y, G.w, G.h); c.clip(); c.beginPath(); c.moveTo(PIV.x, PIV.y); c.arc(PIV.x, PIV.y, ARM - 10, swept[0], swept[1]); c.closePath(); c.fillStyle = C.glass; c.fill();
    c.strokeStyle = 'rgba(18,59,49,0.18)'; c.lineWidth = 2; for (let k = 0; k < 30; k++) { const a = lerp(swept[0], swept[1], k / 29); c.beginPath(); c.moveTo(PIV.x + Math.cos(a) * 60, PIV.y + Math.sin(a) * 60); c.lineTo(PIV.x + Math.cos(a) * (ARM - 20), PIV.y + Math.sin(a) * (ARM - 20)); c.stroke(); } c.restore(); }
  // arm with rubber blade
  const ex = PIV.x + Math.cos(angle) * ARM, ey = PIV.y + Math.sin(angle) * ARM;
  c.save(); c.lineCap = 'round'; c.strokeStyle = '#3E4A45'; c.lineWidth = 14; c.beginPath(); c.moveTo(PIV.x, PIV.y); c.lineTo(ex, ey); c.stroke();
  c.strokeStyle = '#1B1F1D'; c.lineWidth = 9; c.beginPath(); c.moveTo(PIV.x + Math.cos(angle) * 140, PIV.y + Math.sin(angle) * 140); c.lineTo(ex, ey); c.stroke(); c.restore();
  c.fillStyle = C.ink; c.beginPath(); c.arc(PIV.x, PIV.y, 16, 0, 6.283); c.fill(); c.fillStyle = C.gold; c.beginPath(); c.arc(PIV.x, PIV.y, 6, 0, 6.283); c.fill();
}
function drawP4(c, t) {
  head(c, 'HOW IT WORKED', 'Handle inside, blade outside');
  const ang = armAngle(t);
  windowScene(c, t, ang, 0.95, sweptRange(t));
  note(c, 'outside the glass', G.x + G.w / 2, G.y + G.h + 60, 24, C.ink, 'center', 'InterX');
  // inset 1: the handle inside turns the same spindle
  const hA = pr(t, ws(38) - 0.25, ws(38) + 0.2, eout);
  c.save(); c.globalAlpha = 0.2 + 0.8 * hA; c.fillStyle = 'rgba(2,34,28,0.06)'; rr(c, 640, 190, 220, 230, 14); c.fill();
  note(c, 'INSIDE', 750, 222, 22, C.goldDeep, 'center', 'Mono');
  const hx = 750, hy = 320; c.fillStyle = C.ink; c.beginPath(); c.arc(hx, hy, 26, 0, 6.283); c.fill();
  c.strokeStyle = C.ink; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + Math.cos(ang - Math.PI) * 70, hy + Math.sin(ang - Math.PI) * 70); c.stroke();
  c.fillStyle = C.gold; c.beginPath(); c.arc(hx + Math.cos(ang - Math.PI) * 70, hy + Math.sin(ang - Math.PI) * 70, 14, 0, 6.283); c.fill();
  note(c, 'handle (L)', 750, 400, 24, C.ink, 'center', 'InterX'); c.restore();
  // inset 2: side view — springs press the rubber against the glass
  const sA = pr(t, ws(41) - 0.25, ws(41) + 0.25, eout);
  if (sA > 0) { c.save(); c.globalAlpha = sA; c.fillStyle = 'rgba(2,34,28,0.06)'; rr(c, 640, 440, 220, 260, 14); c.fill();
    note(c, 'SIDE VIEW', 750, 472, 22, C.goldDeep, 'center', 'Mono');
    c.fillStyle = C.glass; c.fillRect(812, 490, 16, 190); c.strokeStyle = C.ink; c.lineWidth = 2; c.strokeRect(812, 490, 16, 190);
    c.fillStyle = '#3E4A45'; c.fillRect(672, 520, 26, 140); // arm
    const squeeze = 0.5 + 0.5 * Math.sin(t * 9);
    c.strokeStyle = C.goldDeep; c.lineWidth = 4; c.beginPath(); for (let k = 0; k <= 8; k++) { const x = lerp(698, 776, k / 8), y = 590 + (k % 2 ? -18 : 18) * (0.8 + 0.2 * squeeze); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); // spring
    c.fillStyle = '#1B1F1D'; c.fillRect(776, 540, 36, 100); // rubber
    c.fillStyle = RED; c.beginPath(); c.moveTo(790, 520); c.lineTo(806, 506); c.lineTo(806, 534); c.closePath(); c.fill();
    note(c, 'springs press', 740, 712, 22, C.ink, 'center', 'InterX'); c.restore(); }
  pill(c, 'cleared arc (patent Fig. 2, area a)', 450, 830, pr(t, ws(47) - 0.2, ws(47) + 0.3, eout), 28);
  foot(c, 'ILLUSTRATION · after U.S. Patent 743,801');
}
function drawP5(c, t) {
  head(c, 'BALANCE', 'A counterweight on the arm');
  const px = 470, py = 360, L = 430, Lx = 150;
  const w = pr(t, ws(49) - 0.1, ws(49) + 0.45, eout), bal = pr(t, ws(49) + 0.2, ws(54) + 0.1);
  const ang = lerp(2.05, 2.45, 1 - bal) + Math.sin(t * 6) * 0.015 * (1 - bal); // sags towards the blade until balanced
  // long arm (blade side) and short extension beyond the pivot
  const ex = px + Math.cos(ang) * L, ey = py + Math.sin(ang) * L, cx = px - Math.cos(ang) * Lx, cy = py - Math.sin(ang) * Lx;
  c.save(); c.lineCap = 'round'; c.strokeStyle = '#3E4A45'; c.lineWidth = 16; c.beginPath(); c.moveTo(cx, cy); c.lineTo(ex, ey); c.stroke();
  c.strokeStyle = '#1B1F1D'; c.lineWidth = 10; c.beginPath(); c.moveTo(px + Math.cos(ang) * 120, py + Math.sin(ang) * 120); c.lineTo(ex, ey); c.stroke(); c.restore();
  c.fillStyle = C.ink; c.beginPath(); c.arc(px, py, 20, 0, 6.283); c.fill(); c.fillStyle = C.gold; c.beginPath(); c.arc(px, py, 7, 0, 6.283); c.fill();
  note(c, 'pivot', px + 30, py + 8, 24, C.ink, 'left', 'InterX');
  // counterweight c slides onto the extension
  const wx = lerp(cx + 160, cx, w), wy = lerp(cy - 120, cy, w);
  c.save(); c.globalAlpha = 0.25 + 0.75 * w; c.fillStyle = C.gold; c.beginPath(); c.arc(wx, wy, 40, 0, 6.283); c.fill(); c.strokeStyle = C.goldDeep; c.lineWidth = 4; c.stroke();
  c.fillStyle = C.deep; c.font = '800 34px Fraunces'; c.textAlign = 'center'; c.fillText('c', wx, wy + 12); c.restore();
  note(c, 'blade side', ex - 10, ey + 50, 24, C.ink, 'center', 'InterX');
  // balance gauge: bubble moves to the centre as the arm is balanced
  c.fillStyle = 'rgba(2,34,28,0.08)'; rr(c, 250, 760, 400, 50, 25); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(450, 755); c.lineTo(450, 815); c.stroke();
  c.fillStyle = C.gold; c.beginPath(); c.arc(lerp(600, 450, bal), 785, 18, 0, 6.283); c.fill();
  note(c, bal > 0.9 ? 'balanced on both sides of the pivot' : 'heavy on the blade side', 450, 860, 28, bal > 0.9 ? C.goldDeep : RED, 'center', 'InterX');
  foot(c, 'ILLUSTRATION · patent: counterweight c');
}
function drawP6(c, t) {
  head(c, 'LESSON', 'Look for accepted hassles');
  print(c, IMG.portrait, 640, 150, 210, 0.03, 'c. 1910');
  const a = pr(t, ws(57) - 0.2, ws(57) + 0.3, eout), b = pr(t, ws(61) - 0.2, ws(61) + 0.3, eout), d = pr(t, ws(65) - 0.25, ws(65) + 0.3, eout);
  const card = (y, a, l1, l2, fill, ink) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate((1 - a) * -30, 0); c.fillStyle = fill; rr(c, 50, y, 540, 150, 16); c.fill();
    c.fillStyle = ink === 'light' ? C.gold : C.deep; c.font = '800 24px Mono'; c.textAlign = 'left'; c.fillText(l1, 80, y + 50); c.fillStyle = ink === 'light' ? C.cream : C.deep; c.font = '800 34px InterX'; c.fillText(l2, 80, y + 105); c.restore(); };
  card(200, a, 'EVERYONE ACCEPTED', 'stopping to clear snow', 'rgba(2,34,28,0.92)', 'light');
  if (b > 0) { c.save(); c.globalAlpha = b; c.strokeStyle = C.goldDeep; c.lineWidth = 5; c.beginPath(); c.moveTo(320, 365); c.lineTo(320, 425); c.stroke(); c.beginPath(); c.moveTo(304, 410); c.lineTo(320, 428); c.lineTo(336, 410); c.stroke(); c.restore(); }
  card(440, b, 'SHE SAW', 'a problem worth a tool', 'rgba(2,34,28,0.92)', 'light');
  if (d > 0) { c.save(); c.globalAlpha = d; c.strokeStyle = C.goldDeep; c.lineWidth = 5; c.beginPath(); c.moveTo(320, 605); c.lineTo(320, 665); c.stroke(); c.beginPath(); c.moveTo(304, 650); c.lineTo(320, 668); c.lineTo(336, 650); c.stroke(); c.restore(); }
  card(680, d, 'HER TOOL', 'a wiper worked from inside', C.gold, 'dark');
  if (d > 0) { c.save(); c.globalAlpha = d; c.fillStyle = C.deep; c.beginPath(); c.arc(745, 755, 40, 0, 6.283); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 8; c.beginPath(); c.moveTo(727, 755); c.lineTo(741, 771); c.lineTo(765, 739); c.stroke(); c.restore(); }
  foot(c, 'Sources: NIHF; U.S. Patent 743,801');
}
function drawP7(c, t) {
  c.fillStyle = C.deep; c.fillRect(0, 0, PW, PH);
  c.strokeStyle = C.gold; c.lineWidth = 3; c.strokeRect(22, 22, PW - 44, PH - 44);
  const a = pr(t, T.cta[1], T.cta[1] + 0.5, eout);
  c.save(); c.globalAlpha = 0.4 + 0.6 * a; c.drawImage(icon, PW / 2 - 140, 150, 280, 280); c.restore();
  c.fillStyle = C.cream; c.textAlign = 'center'; c.font = '800 74px Fraunces'; c.fillText('Download Aarambh', PW / 2, 560);
  c.font = '800 40px InterB'; c.fillStyle = C.gold; c.fillText('to support livelihood tools', PW / 2, 632);
  c.font = '700 26px InterB'; c.fillStyle = 'rgba(251,247,238,0.8)'; c.fillText('Fund verified livelihood tools', PW / 2, 740); c.fillText('and follow their impact.', PW / 2, 778);
  c.font = '700 22px Mono'; c.fillStyle = 'rgba(251,247,238,0.6)'; c.fillText('Get it on Google Play', PW / 2, 880);
}
const DRAW = { p1: drawP1, p2: drawP2, p3: drawP3, p4: drawP4, p5: drawP5, p6: drawP6, p7: drawP7 };
const pages = {};
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
  if (t < T.swap2[0]) return drawPage(c, 'p5', t);
  if (t < T.swap2[1]) return slideSwap(c, 'p5', 'p6', (t - T.swap2[0]) / (T.swap2[1] - T.swap2[0]), t);
  if (t < T.cta[0]) return drawPage(c, 'p6', t);
  if (t < T.cta[1]) return slideSwap(c, 'p6', 'p7', (t - T.cta[0]) / (T.cta[1] - T.cta[0]), t);
  return drawPage(c, 'p7', t);
}
// magnifier — used once: lands on the rubber cleaners (T) of the real patent Fig. 2 and tracks down the arm
const ARMF = [[0.78, 0.40], [0.57, 0.66]]; // arm in the drawing crop: upper and lower points (fractions)
function loupe(c, t) {
  const land = Math.min(pr(t, T.loupe[0], T.loupe[0] + 0.35, eout), 1 - pr(t, T.loupe[1] - 0.3, T.loupe[1], eout));
  if (land <= 0.001 || t < T.swap[1] || t >= T.cut || !pages.p3pat) return;
  const r = pages.p3pat, m = pr(t, T.loupe[0] + 0.3, T.loupe[1] - 0.3);
  const lx = PX + r.x + r.w * lerp(ARMF[0][0], ARMF[1][0], m), ly = PY + r.y + r.h * lerp(ARMF[0][1], ARMF[1][1], m);
  const R = 105 * (1.35 - 0.35 * land), mag = 2.3;
  c.save(); c.globalAlpha = land * 0.45; c.fillStyle = 'rgba(1,30,24,0.6)'; c.beginPath(); c.arc(lx + 20, ly + 22, R + 12, 0, 6.283); c.fill(); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.beginPath(); c.arc(lx, ly, R, 0, 6.283); c.clip();
  c.translate(lx, ly); c.scale(mag, mag); c.translate(-lx, -ly); c.drawImage(tableCache, -400, -400); drawPage(c, 'p3', t); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.lineWidth = 20; c.strokeStyle = C.deep; c.beginPath(); c.arc(lx, ly, R + 10, 0, 6.283); c.stroke();
  c.lineWidth = 3; c.strokeStyle = C.gold; c.beginPath(); c.arc(lx, ly, R + 20, 0, 6.283); c.stroke(); c.restore();
}
function camera(t) {
  if (t >= T.cut && t < T.cut + 0.01) return [540, 950, 1.06];
  return kf(t, [[0, [540, 990, 0.93]], [0.7, [540, 962, 0.98]], [T.turn1[0], [540, 954, 1.04]], [T.turn1[1], [540, 952, 1.0]], [T.swap[0], [540, 952, 1.04]], [T.swap[1], [540, 952, 1.0]], [T.cut - 0.01, [540, 954, 1.04]], [T.cut, [540, 950, 1.06]], [T.turn2[0], [540, 954, 1.02]], [T.turn2[1], [540, 952, 1.0]], [T.swap2[0], [540, 954, 1.04]], [T.swap2[1], [540, 952, 1.0]], [T.cta[0], [540, 954, 1.04]], [T.cta[1], [540, 952, 1.0]], [30, [540, 952, 1.03]]]);
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
  // captions: plate y 350–510, x within 90..990; Inter 800 54 px
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
  const t0 = ws(38) + 0.25, sweeps = []; for (let x = t0; x < T.turn2[0] - 0.1; x += 0.85) sweeps.push(+x.toFixed(3)); // one swish per half swing (period 1.7 s)
  const cues = { T, turn: [T.turn1, T.turn2], swap: [T.swap[0], T.swap2[0], T.cta[0]], cut: [T.cut], land: [T.loupe[0] + 0.35],
    trolley: ws(5) - 0.4, plate: ws(7) - 0.25, window: ws(15) - 0.2, stop: ws(19) - 0.1, wipe: [ws(21) - 0.2, ws(23) + 0.4],
    stamp: [ws(19) - 0.1, ws(26) - 0.1], handle: ws(38) - 0.25, sweeps, springs: ws(41) - 0.25, label: [ws(11) - 0.2, ws(15) - 0.15, ws(47) - 0.2],
    weight: ws(49) - 0.1, balanced: ws(54) + 0.1, cards: [ws(57) - 0.2, ws(61) - 0.2], ok: ws(65) - 0.25, cta: T.cta[1] };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '0.6,3.9,6.3,8.2,9.2,12.2,13.4,15.6,17.2,18.3,19.6,21.0,23.0,25.6,27.5').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
