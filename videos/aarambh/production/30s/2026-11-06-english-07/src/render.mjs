// Aarambh english-07 30 s #01 — Archive Light Table (English): Garrett Morgan's all-stop traffic signal (U.S. Patent 1,475,024, 1923).
// Seven pages on the light table changed by page turns, slide swaps, a hard cut and a CTA slide-in (accepted recipe); English captions.
// Archival objects: Garrett A. Morgan portrait (Wikimedia Commons, PD-old), the 1916 newspaper photo of his Lake Erie tunnel rescue
// (Commons, PD-US) and the real patent drawing sheet 1 (USPTO). Intersection, cars and signal-mechanism scenes are original
// illustrations labelled "ILLUSTRATION". Original Canvas2D code (core from the english-06 renderer).
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
  [0, 7, ['Many early traffic signals', 'showed only two commands:']],
  [8, 10, ['stop and go.']],
  [11, 16, ['In 1923, Cleveland inventor', 'Garrett Morgan']],
  [17, 19, ['patented an improvement.']],
  [20, 26, ['A hand crank first', 'raised the arms,']],
  [27, 31, ['stopping traffic', 'in every direction.']],
  [32, 36, ['That pause let cars', 'already crossing']],
  [37, 40, ['clear the intersection.']],
  [41, 46, ['Then the signal turned,', 'and the arms']],
  [47, 53, ['lowered slowly', 'for the other street.']],
  [54, 59, ['Lesson: improve a system', 'by adding']],
  [60, 64, ['the step it was missing.']],
  [65, 70, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 11: SENT[1].start, 20: SENT[2].start, 32: SENT[3].start, 41: SENT[4].start, 54: SENT[5].start, 65: SENT[6].start }; // script starts override early ASR stamps
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2); // mid-sentence: halfway through the pause
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.25, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  turn1: [SENT[1].start - 0.35, SENT[1].start], swap: [SENT[2].start - 0.35, SENT[2].start],
  loupe: [ws(22) - 0.2, ws(31) + 0.2], loupeMove: [ws(24) - 0.05, ws(26) + 0.1], // crank 28 (Fig. 1) -> raised arms (Fig. 2)
  cut: SENT[3].start - 0.06, // hard cut on "That"
  turn2: [SENT[4].start - 0.35, SENT[4].start], swap2: [SENT[5].start - 0.35, SENT[5].start], cta: [SENT[6].start - 0.5, SENT[6].start],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const IMG = {};
for (const [k, f] of [['portrait', 'garrett-morgan-portrait-commons.jpg'], ['rescue', 'garrett-morgan-1916-rescue-newspaper.jpg'], ['pat', 'us1475024-sheet1-fig1-fig2.png']]) IMG[k] = await loadImage(path.join(ROOT, 'assets', f));
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
const GREEN = '#3E8E5A';
function car(c, x, y, horiz, col) { // top view; (x, y) = centre
  c.save(); c.translate(x, y); if (horiz) c.rotate(Math.PI / 2);
  c.fillStyle = 'rgba(0,0,0,0.25)'; rr(c, -20, -34, 44, 74, 10); c.fill();
  c.fillStyle = col; rr(c, -22, -37, 44, 74, 10); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 2; c.stroke();
  c.fillStyle = 'rgba(20,30,28,0.55)'; rr(c, -16, -24, 32, 14, 4); c.fill(); rr(c, -16, 14, 32, 10, 4); c.fill();
  c.restore();
}
function arrowGlyph(c, x, y, vertical, col) { c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 4; c.translate(x, y); if (!vertical) c.rotate(Math.PI / 2);
  c.beginPath(); c.moveTo(0, -12); c.lineTo(0, 12); c.stroke(); for (const s of [-1, 1]) { c.beginPath(); c.moveTo(0, 16 * s); c.lineTo(-7, 7 * s); c.lineTo(7, 7 * s); c.closePath(); c.fill(); } c.restore(); }
function chip(c, x, y, vertical, go) { const col = go ? GREEN : RED; c.save(); c.fillStyle = 'rgba(2,34,28,0.9)'; rr(c, x, y, 150, 50, 12); c.fill(); arrowGlyph(c, x + 28, y + 25, vertical, '#FBF7EE');
  c.fillStyle = col; rr(c, x + 52, y + 9, 88, 32, 8); c.fill(); c.fillStyle = '#FFFFFF'; c.font = '800 22px InterX'; c.textAlign = 'center'; c.fillText(go ? 'GO' : 'STOP', x + 96, y + 33); c.restore(); }
function crossing(c, x0, y0, w, h, RW = 150) { // grass, two roads and an intersection box; returns centre
  const cx = x0 + w / 2, cy = y0 + h / 2;
  c.save(); c.beginPath(); rr(c, x0, y0, w, h, 14); c.clip();
  c.fillStyle = '#D3DFCF'; c.fillRect(x0, y0, w, h);
  c.fillStyle = '#56625E'; c.fillRect(cx - RW / 2, y0, RW, h); c.fillRect(x0, cy - RW / 2, w, RW);
  c.strokeStyle = 'rgba(251,247,238,0.7)'; c.lineWidth = 4; c.setLineDash([22, 18]);
  c.beginPath(); c.moveTo(cx, y0); c.lineTo(cx, cy - RW / 2); c.moveTo(cx, cy + RW / 2); c.lineTo(cx, y0 + h); c.moveTo(x0, cy); c.lineTo(cx - RW / 2, cy); c.moveTo(cx + RW / 2, cy); c.lineTo(x0 + w, cy); c.stroke(); c.setLineDash([]);
  c.strokeStyle = 'rgba(251,247,238,0.9)'; c.lineWidth = 6; // stop lines
  c.beginPath(); c.moveTo(cx - RW / 2 - 8, cy); c.lineTo(cx - RW / 2 - 8, cy + RW / 2); c.moveTo(cx - RW / 2, cy - RW / 2 - 8); c.lineTo(cx, cy - RW / 2 - 8); c.stroke();
  c.restore(); return [cx, cy];
}
// Morgan-style semaphore seen from the front: box (12), two arms (13) pivoted at its sides, bell cap (65)
function semaphore(c, x, y, armT, face, faceFlip = 1) { // armT 0 = arms raised (vertical), 1 = arms horizontal; face 'STOP'|'GO'
  c.save();
  c.fillStyle = C.ink; c.fillRect(x - 14, y + 200, 28, 430); rr(c, x - 70, y + 620, 140, 22, 8); c.fill(); // pole + base
  c.beginPath(); c.ellipse(x, y - 8, 70, 30, 0, Math.PI, 0); c.fill(); // bell cap
  const fw = 100 * Math.abs(faceFlip); c.fillStyle = '#F4EEDC'; c.strokeStyle = C.ink; c.lineWidth = 4; c.fillRect(x - fw / 2, y, fw, 200); c.strokeRect(x - fw / 2, y, fw, 200);
  if (Math.abs(faceFlip) > 0.2) { c.save(); c.translate(x, 0); c.scale(Math.abs(faceFlip), 1); c.fillStyle = face === 'GO' ? GREEN : RED; c.font = '800 38px Mono'; c.textAlign = 'center';
    [...face].forEach((ch, i) => c.fillText(ch, 0, y + (face === 'GO' ? 82 : 46) + i * 44)); c.restore(); }
  for (const s of [-1, 1]) { // arms
    const px = x + s * 54, py = y + 214, ang = lerp(-Math.PI / 2, s < 0 ? Math.PI : 0, armT);
    c.save(); c.translate(px, py); c.rotate(ang); c.fillStyle = '#F4EEDC'; c.strokeStyle = C.ink; c.lineWidth = 4; c.fillRect(0, -22, 190, 44); c.strokeRect(0, -22, 190, 44);
    const vertical = armT < 0.5; c.fillStyle = vertical ? RED : GREEN; c.font = '800 26px Mono'; c.textAlign = 'center';
    c.save(); c.translate(105, 9); if (s < 0 && !vertical) c.rotate(Math.PI); c.fillText(vertical ? 'STOP' : 'GO', 0, s < 0 && !vertical ? 18 : 0); c.restore();
    c.restore(); c.fillStyle = C.gold; c.beginPath(); c.arc(px, py, 8, 0, 6.283); c.fill();
  }
  c.restore();
}

// ---------- pages ----------
function drawP1(c, t) {
  head(c, 'BEFORE', 'Two commands only');
  const [cx, cy] = crossing(c, 60, 150, 780, 600);
  const flip = ws(8) - 0.05, ns = t < flip, sw = flip + 0.55; // the waiting car starts the instant GO shows and brakes 0.55 s later
  c.save(); c.beginPath(); rr(c, 60, 150, 780, 600, 14); c.clip();
  const ay = cy - (flip - t) * 95; car(c, cx + 38, ay, false, C.gold); // north-south car still crossing when the signal flips
  const tb = clamp(t - flip, 0, sw - flip), bx = cx - 140 + 0.5 * 628 * tb * tb; // ~95 px in 0.55 s, stops ~24 px short of the crossing car
  car(c, bx, cy + 38, true, '#C9D6D9'); // waiting east-west car starts at once
  car(c, cx - 38, cy + 230, false, '#E4D2B5');
  c.restore();
  chip(c, 610, 170, true, ns); chip(c, 610, 230, false, !ns);
  const nm = pr(t, sw - 0.05, sw + 0.25, eout);
  if (nm > 0) { c.save(); c.globalAlpha = nm; c.strokeStyle = RED; c.lineWidth = 7; c.beginPath(); c.arc(cx + 10, cy + 40, 70 + 20 * (1 - nm), 0, 6.283); c.stroke(); c.restore(); }
  stamp(c, ['NEAR MISS'], 250, 230, nm, -0.06, RED);
  pill(c, 'only two commands: STOP · GO', 450, 822, pr(t, ws(6) - 0.15, ws(6) + 0.3, eout), 28);
  note(c, 'ILLUSTRATION', 826, 740, 18, 'rgba(18,59,49,0.7)', 'right', 'Mono');
  foot(c, 'Sources: NIHF; U.S. Patent 1,475,024');
}
function drawP2(c, t) {
  head(c, 'CLEVELAND, OHIO', null);
  const inA = pr(t, SENT[1].start - 0.2, SENT[1].start + 0.4, eout);
  c.save(); c.globalAlpha = 0.3 + 0.7 * inA; print(c, IMG.portrait, 60, 96, 300, -0.02, 'Garrett A. Morgan'); c.restore();
  print(c, IMG.rescue, 410, 116, 430, 0.02, '1916 newspaper: his Lake Erie tunnel rescue');
  const pl = pr(t, ws(15) - 0.25, ws(15) + 0.25, eout);
  if (pl > 0) { c.save(); c.globalAlpha = pl; c.translate(0, (1 - pl) * 20);
    c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, 60, 540, 780, 124, 16); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
    c.fillStyle = C.cream; c.textAlign = 'left'; c.font = '800 50px Fraunces'; c.fillText('Garrett A. Morgan', 88, 600);
    c.fillStyle = C.gold; c.font = '800 28px InterX'; c.fillText('inventor · 1877–1963 · Cleveland, Ohio', 88, 644); c.restore(); }
  stamp(c, ['PATENT 1,475,024 · NOV. 20, 1923'], 450, 752, pr(t, ws(17) - 0.1, ws(17) + 0.35, eout), -0.03);
  pill(c, 'an improvement, not the first signal', 450, 868, pr(t, ws(19) - 0.2, ws(19) + 0.25, eout), 28);
  foot(c, 'Sources: NIHF; U.S. Patent 1,475,024');
}
const PAT = { x: 190, y: 92, w: 520 };
function drawP3(c, t) {
  head(c, 'THE 1923 PATENT', null);
  const r = print(c, IMG.pat, PAT.x, PAT.y, PAT.w, -0.006, 'U.S. Patent 1,475,024, sheet 1 (USPTO)');
  pages.p3pat = r;
  pill(c, 'Fig. 2: arms raised, STOP every way', 450, 918, pr(t, ws(30) - 0.2, ws(30) + 0.25, eout), 28);
}
function drawP4(c, t) {
  head(c, 'THE PAUSE', 'Stop every direction first');
  const [cx, cy] = crossing(c, 60, 160, 780, 580);
  c.save(); c.beginPath(); rr(c, 60, 160, 780, 580, 14); c.clip();
  const ay = cy - 30 + Math.max(0, t - T.cut) * 62; car(c, cx + 38, ay, false, C.gold); // already partly across: keeps going
  car(c, cx - 140, cy + 38, true, '#C9D6D9'); car(c, cx - 38, cy - 190, false, '#E4D2B5'); // waiting cars hold
  c.restore();
  chip(c, 610, 180, true, false); chip(c, 610, 240, false, false);
  pill(c, 'ALL STOP', 230, 210, pr(t, ws(33) - 0.2, ws(33) + 0.2, eout), 32);
  const lab = pr(t, ws(36) - 0.15, ws(36) + 0.25, eout);
  if (lab > 0) { c.save(); c.globalAlpha = lab; c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.moveTo(cx + 64, ay); c.lineTo(690, ay - 40); c.stroke(); c.restore(); pill(c, 'already crossing', 700, ay - 40, lab, 24); }
  // pause timer
  const p = pr(t, T.cut + 0.1, ws(40) - 0.2, (u) => u); c.fillStyle = 'rgba(2,34,28,0.12)'; rr(c, 150, 790, 600, 26, 13); c.fill(); c.fillStyle = C.gold; rr(c, 150, 790, 600 * p, 26, 13); c.fill();
  note(c, 'pause', 450, 850, 24, C.ink, 'center', 'InterX');
  const ok = pr(t, ws(38) - 0.1, ws(38) + 0.35, eout);
  if (ok > 0) { c.save(); c.globalAlpha = ok; c.fillStyle = GREEN; c.beginPath(); c.arc(cx, cy, 40, 0, 6.283); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 8; c.beginPath(); c.moveTo(cx - 18, cy); c.lineTo(cx - 4, cy + 15); c.lineTo(cx + 20, cy - 14); c.stroke(); c.restore(); pill(c, 'intersection clear', 450, 910, ok, 26); }
  note(c, 'ILLUSTRATION', 826, 730, 18, 'rgba(18,59,49,0.7)', 'right', 'Mono');
}
function drawP5(c, t) {
  head(c, 'THEN', 'Turn, then lower slowly');
  const turn = pr(t, ws(44) - 0.15, ws(44) + 0.45), lower = pr(t, ws(48) - 0.1, ws(49) + 0.9, (u) => 1 - Math.pow(1 - u, 2));
  const flipS = turn < 0.5 ? 1 - turn * 2 : turn * 2 - 1;
  semaphore(c, 270, 230, lower, turn < 0.5 ? 'STOP' : 'GO', flipS);
  const step = (y, a, n, txt) => { c.save(); c.globalAlpha = 0.3 + 0.7 * a; c.fillStyle = a > 0.5 ? 'rgba(2,34,28,0.92)' : 'rgba(2,34,28,0.25)'; rr(c, 520, y, 340, 70, 14); c.fill();
    c.fillStyle = C.gold; c.font = '800 28px Mono'; c.textAlign = 'left'; c.fillText(n, 540, y + 46); c.fillStyle = C.cream; c.font = '800 26px InterX'; c.fillText(txt, 580, y + 45); c.restore(); };
  step(250, 1, '1', 'arms up: all stop'); step(340, turn, '2', 'signal turns'); step(430, lower, '3', 'arms lower slowly');
  note(c, 'patent: a dash-pot slows the arms', 690, 540, 22, 'rgba(18,59,49,0.8)', 'center');
  // mini top view: the other street starts moving after the arms are down
  const go = pr(t, ws(52) - 0.3, ws(52) + 0.2), [mx, my] = crossing(c, 520, 600, 340, 230, 70);
  c.save(); c.beginPath(); rr(c, 520, 600, 340, 230, 14); c.clip();
  c.save(); c.translate(0, 0); c.scale(1, 1); const bx = mx - 80 + Math.max(0, t - (ws(52) - 0.3)) * 120 * go; c.translate(bx, my + 18); c.scale(0.55, 0.55); car(c, 0, 0, true, '#C9D6D9'); c.restore();
  c.restore();
  note(c, go > 0.5 ? 'other street: GO' : 'other street: waiting', 690, 870, 24, go > 0.5 ? GREEN : RED, 'center', 'InterX');
  note(c, 'ILLUSTRATION · after patent Fig. 1–2', 48, PH - 34, 21, 'rgba(18,59,49,0.72)', 'left', 'Mono');
}
function drawP6(c, t) {
  head(c, 'LESSON', 'Add the missing step');
  const box = (x, y, w, txt, col, a = 1, glow = 0) => { if (a <= 0) return; c.save(); c.globalAlpha = a; if (glow > 0) { c.shadowColor = `rgba(241,180,68,${0.8 * glow})`; c.shadowBlur = 30; }
    c.fillStyle = col; rr(c, x, y, w, 84, 14); c.fill(); c.shadowBlur = 0; c.fillStyle = '#FFFFFF'; c.font = '800 28px InterX'; c.textAlign = 'center'; c.fillText(txt, x + w / 2, y + 53); c.restore(); };
  const arr = (x, y, a) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = C.ink; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 34, y); c.stroke(); c.beginPath(); c.moveTo(x + 24, y - 10); c.lineTo(x + 36, y); c.lineTo(x + 24, y + 10); c.stroke(); c.restore(); };
  const a = pr(t, ws(54) - 0.15, ws(54) + 0.3, eout), b = pr(t, ws(57) - 0.2, ws(57) + 0.3, eout), d = pr(t, ws(59) - 0.15, ws(59) + 0.5, eout), g = pr(t, ws(64) - 0.2, ws(64) + 0.3, eout);
  note(c, 'TWO STEPS', 60, 225, 24, C.goldDeep, 'left', 'Mono');
  box(60, 245, 180, 'STOP', RED, a); arr(256, 287, a); box(306, 245, 180, 'GO', GREEN, a);
  note(c, 'THREE STEPS', 60, 445, 24, C.goldDeep, 'left', 'Mono');
  box(60, 465, 180, 'STOP', RED, b); arr(256, 507, b);
  box(306, 465 + (1 - d) * 40, 230, 'ALL STOP', C.goldDeep, d, g); arr(552, 507, d);
  box(602, 465, 180, 'GO', GREEN, b);
  if (g > 0) { c.save(); c.globalAlpha = g; c.fillStyle = C.deep; c.beginPath(); c.arc(421, 610, 34, 0, 6.283); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 7; c.beginPath(); c.moveTo(405, 610); c.lineTo(417, 624); c.lineTo(438, 597); c.stroke(); c.restore(); }
  print(c, IMG.portrait, 620, 650, 190, 0.03, 'G. A. Morgan');
  pill(c, 'same signal, one added step', 330, 770, g, 28);
  foot(c, 'Sources: U.S. Patent 1,475,024; NIHF');
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
// magnifier — used once: lands on crank 28 of the real patent Fig. 1, then moves to the raised arms of Fig. 2
const LENS = [[0.38, 0.706], [0.85, 0.245]]; // fractions in the sheet crop: crank 28; raised arms (Fig. 2)
function loupe(c, t) {
  const land = Math.min(pr(t, T.loupe[0], T.loupe[0] + 0.35, eout), 1 - pr(t, T.loupe[1] - 0.3, T.loupe[1], eout));
  if (land <= 0.001 || t < T.swap[1] || t >= T.cut || !pages.p3pat) return;
  const r = pages.p3pat, m = pr(t, T.loupeMove[0], T.loupeMove[1]);
  const lx = PX + r.x + r.w * lerp(LENS[0][0], LENS[1][0], m), ly = PY + r.y + r.h * lerp(LENS[0][1], LENS[1][1], m);
  const R = 105 * (1.35 - 0.35 * land), mag = 2.2;
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
  const ticks = []; for (let x = T.cut + 0.3; x < ws(40) - 0.2; x += 0.5) ticks.push(+x.toFixed(3));
  const cues = { T, turn: [T.turn1, T.turn2], swap: [T.swap[0], T.swap2[0], T.cta[0]], cut: [T.cut], land: [T.loupe[0] + 0.35, T.loupeMove[1]],
    drive: 0.2, flip: ws(8) - 0.05, brake: ws(8) + 0.5, plate: ws(15) - 0.25, stamp: [ws(17) - 0.1], label: [ws(6) - 0.15, ws(19) - 0.2, ws(30) - 0.2, ws(33) - 0.2, ws(36) - 0.15],
    crank: ws(22) - 0.2, armsUp: ws(24) - 0.05, ticks, clear: ws(38) - 0.1, turnBox: ws(44) - 0.15, armsDown: [ws(48) - 0.1, ws(49) + 0.9], otherGo: ws(52) - 0.3,
    cards: [ws(54) - 0.15, ws(57) - 0.2, ws(59) - 0.15], ok: ws(64) - 0.2, cta: T.cta[1] };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '0.6,2.6,3.9,4.2,6.2,8.6,9.6,10.9,12.4,14.2,15.6,16.9,17.8,19.6,21.4,22.5,24.0,26.4,28.0').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
