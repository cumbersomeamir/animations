// Aarambh round-02 30 s #01 — Archive Light Table: Hedy Lamarr & George Antheil, frequency hopping (US 2,292,387).
// Seven pages on the light table changed by page turns, slide swaps, a hard cut and a CTA slide-in (accepted feedback-round recipe).
// Archive object: the real patent drawing sheet 2 (US patents are not subject to copyright). Other imagery is original illustration;
// portraits omitted because their licences could not be verified (Commons API rate-limited) — typeset name plates instead.
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
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json)
  [0, 6, ['Actress Hedy Lamarr and', 'composer George Antheil']],
  [7, 11, ['patented an', 'anti-jamming idea.']],
  [12, 19, ['A torpedo steered on one', 'fixed radio frequency']],
  [20, 22, ['could be', 'blocked.']],
  [23, 28, ['Their fix: matching', 'piano-style rolls']],
  [29, 35, ['made sender and receiver', 'hop frequencies together.']],
  [36, 39, ['The Navy', 'rejected it,']],
  [40, 44, ['but frequency hopping', 'later became']],
  [45, 48, ['common in', 'wireless systems.']],
  [49, 55, ['Takeaway: a tool', 'from one field']],
  [56, 61, ['can solve a problem', 'in another.']],
  [62, 67, ['Download Aarambh', 'to support livelihood tools.']],
];
const SENT_START = { 0: 0.3, 12: 6.25, 23: 10.4, 36: 16.3, 49: 22.0, 62: 26.35 }; // script start times override early ASR stamps
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : ws(a)) - 0.08;
  const nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : (SENT_START[nxA] !== undefined ? Math.max(ws(nxA), SENT_START[nxA]) : ws(nxA)) - 0.08;
  return { t0: Math.max(0.25, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  turn1: [5.95, 6.35], swap: [10.0, 10.5], cut: ws(29) - 0.08,
  loupe: [ws(25) - 0.3, ws(28) + 0.45],
  turn2: [15.95, 16.3], swap2: [21.7, 22.15], cta: [25.9, 26.35],
};
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const PAT = await loadImage(path.join(ROOT, 'assets/us2292387-sheet2-figs7-4.png'));
const SIG = await loadImage(path.join(ROOT, 'assets/us2292387-sheet2-signatures.png'));
const VO = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
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

const RED = '#B5532F';
function wavePath(c, x0, y, x1, amp, freq, phase) { c.beginPath(); for (let x = x0; x <= x1; x += 4) { const yy = y + Math.sin((x - x0) * freq + phase) * amp; x === x0 ? c.moveTo(x, yy) : c.lineTo(x, yy); } c.stroke(); }
function torpedo(c, x, y, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = '#3E4A45'; rr(c, -60, -11, 120, 22, 11); c.fill(); c.fillStyle = '#2A332F'; c.beginPath(); c.moveTo(-60, 0); c.lineTo(-76, -12); c.lineTo(-76, 12); c.closePath(); c.fill(); c.fillStyle = C.gold; c.fillRect(30, -3, 12, 6); c.restore(); }
function ship(c, x, y, s = 1, col = C.ink) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.moveTo(-80, 0); c.lineTo(80, 0); c.lineTo(60, 26); c.lineTo(-64, 26); c.closePath(); c.fill(); c.fillRect(-30, -26, 50, 26); c.fillRect(-4, -62, 6, 36); c.restore(); }
// a scrolling perforated roll: holes chosen per step from a fixed sequence
const SEQ = [3, 6, 1, 5, 2, 7, 0, 4, 6, 2, 5, 1, 3, 7, 4, 0];
function roll(c, x, y, w, h, offset, rows, hiCol) {
  c.save(); c.fillStyle = '#F1E8D2'; c.strokeStyle = C.yarnDark; c.lineWidth = 3; rr(c, x, y, w, h, 8); c.fill(); c.stroke();
  c.beginPath(); rr(c, x, y, w, h, 8); c.clip();
  const step = 56, rowH = h / (rows + 1);
  for (let k = -2; k < w / step + 3; k++) {
    const gi = Math.floor(offset / step) + k, xx = x + k * step - (offset % step);
    const r = SEQ[((gi % SEQ.length) + SEQ.length) % SEQ.length];
    c.fillStyle = Math.abs(xx + step / 2 - hiCol) < step / 2 ? C.goldDeep : C.ink;
    rr(c, xx + 14, y + rowH * (r + 1) - 7, 28, 14, 6); c.fill();
  }
  c.restore();
}
function drawP1(c, t) {
  head(c, 'THE INVENTORS', null);
  const a1 = pr(t, ws(0) + 0.1, ws(0) + 0.6, eout), a2 = pr(t, ws(4), ws(4) + 0.5, eout);
  const plate = (x, a, name, role, born) => { if (a <= 0) return; c.save(); c.globalAlpha = a; c.translate(0, (1 - a) * 30);
    c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, x, 130, 390, 250, 16); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
    c.fillStyle = C.cream; c.textAlign = 'left'; c.font = '800 50px Fraunces'; c.fillText(name[0], x + 28, 205); c.fillText(name[1], x + 28, 262);
    c.fillStyle = C.gold; c.font = '800 34px InterX'; c.fillText(role, x + 28, 320); c.fillStyle = 'rgba(251,247,238,0.75)'; c.font = '700 24px Mono'; c.fillText(born, x + 28, 358); c.restore(); };
  plate(40, a1, ['Hedy', 'Lamarr'], 'actress', 'born 1914, Austria');
  plate(470, a2, ['George', 'Antheil'], 'composer', 'born 1900, USA');
  // real signatures from the patent drawing (1942)
  const sa = pr(t, ws(7) - 0.2, ws(7) + 0.4, eout);
  c.save(); c.globalAlpha = 0.25 + 0.75 * sa; c.drawImage(SIG, 70, 440, 760, 215); c.restore();
  c.font = '700 22px Mono'; c.fillStyle = 'rgba(18,59,49,0.75)'; c.textAlign = 'center'; c.fillText('their signatures on the 1942 patent drawing', PW / 2, 690);
  stamp(c, ['U.S. PATENT 2,292,387', 'granted Aug. 11, 1942'], PW / 2, 800, pr(t, ws(7), ws(7) + 0.45, eout), -0.04);
  foot(c, 'Signatures: US 2,292,387, sheet 2');
}
function drawP2(c, t) {
  head(c, 'THE PROBLEM', 'One channel can be jammed');
  const t0 = VO[1].start, blk = ws(22) - 0.1;
  // channel ladder
  const chY = (k) => 300 + k * 52, N8 = 8, sig = 3;
  for (let k = 0; k < N8; k++) { c.strokeStyle = 'rgba(18,59,49,0.18)'; c.lineWidth = 2; c.beginPath(); c.moveTo(60, chY(k)); c.lineTo(PW - 60, chY(k)); c.stroke(); }
  c.font = '700 22px Mono'; c.fillStyle = 'rgba(18,59,49,0.7)'; c.textAlign = 'left'; c.fillText('radio channels', 62, 286);
  const jam = pr(t, blk, blk + 0.35, eout);
  // guidance signal on one channel
  c.save(); c.strokeStyle = C.tape; c.lineWidth = 6; c.globalAlpha = 1 - 0.75 * jam; wavePath(c, 150, chY(sig), PW - 150, 9, 0.09, -t * 9); c.restore();
  // ship (sender) and torpedo (receiver)
  ship(c, 120, chY(sig) + 330, 0.9);
  const tx = lerp(330, 640, pr(t, t0, t0 + 3.3, (u) => u)), veer = jam * 0.6;
  c.strokeStyle = 'rgba(18,59,49,0.35)'; c.lineWidth = 3; c.setLineDash([8, 10]); c.beginPath(); c.moveTo(120, chY(sig) + 20); c.lineTo(120, chY(sig) + 300); c.stroke(); c.setLineDash([]);
  torpedo(c, tx, 810 + jam * 40, veer);
  c.font = '800 28px InterX'; c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText('sender', 120, 870); c.fillText('torpedo', tx, 870 + jam * 40);
  if (jam > 0) { // enemy jammer floods the same channel
    c.save(); c.globalAlpha = jam; ship(c, 760, chY(sig) + 330, 0.75, '#5B3B2E'); c.strokeStyle = RED; c.lineWidth = 6;
    c.beginPath(); for (let x = 150; x <= PW - 150; x += 18) c.lineTo(x, chY(sig) + ((x / 18) % 2 ? -18 : 18) * (0.6 + 0.4 * Math.sin(t * 40 + x))); c.stroke();
    c.font = '800 28px InterX'; c.fillStyle = RED; c.textAlign = 'center'; c.fillText('jammer', 760, 870); c.restore();
  }
  stamp(c, ['BLOCKED'], 560, 230, jam, 0.05);
  foot(c, 'ILLUSTRATION · source: Smithsonian; NIHF');
}
const PIMG = { x: 30, y: 150, w: 840, h: 840 * 980 / 1435 };
function drawP3(c, t) {
  head(c, 'THE PATENT DRAWING', null);
  c.fillStyle = '#FBF8EE'; c.fillRect(PIMG.x - 6, PIMG.y - 6, PIMG.w + 12, PIMG.h + 12);
  c.drawImage(PAT, PIMG.x, PIMG.y, PIMG.w, PIMG.h);
  c.strokeStyle = 'rgba(18,59,49,0.4)'; c.lineWidth = 2; c.strokeRect(PIMG.x, PIMG.y, PIMG.w, PIMG.h);
  label(c, 'record strip: a perforated roll', 470, 860, PIMG.x + 300, PIMG.y + 0.86 * PIMG.h, pr(t, ws(26) - 0.1, ws(26) + 0.3, eout));
  c.font = '700 26px Mono'; c.fillStyle = 'rgba(18,59,49,0.85)'; c.textAlign = 'left'; c.fillText('Fig. 7: torpedo path   Fig. 4: control roll', 48, 930);
  foot(c, 'U.S. patent drawing (not subject to copyright)');
}
function drawP4(c, t) {
  head(c, 'HOW IT WORKED', 'Both sides hop together');
  const t0 = T.cut, off = Math.max(0, t - t0) * 120, hiX = 450;
  const curStep = (o) => SEQ[((Math.floor((o + hiX - 120) / 56) % SEQ.length) + SEQ.length) % SEQ.length];
  roll(c, 60, 180, PW - 120, 150, off, 7, hiX);
  roll(c, 60, 720, PW - 120, 150, off, 7, hiX);
  c.font = '800 26px InterX'; c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText('SENDER roll', 64, 170); c.fillText('RECEIVER roll', 64, 900);
  // read line
  c.strokeStyle = C.gold; c.lineWidth = 4; c.setLineDash([6, 8]); c.beginPath(); c.moveTo(hiX, 170); c.lineTo(hiX, 880); c.stroke(); c.setLineDash([]);
  // channel grid between rolls: 8 channels; the active channel lights for both
  const ch = curStep(off), y0 = 370, dy = 40;
  for (let k = 0; k < 8; k++) { const on = k === ch; c.fillStyle = on ? C.gold : 'rgba(18,59,49,0.12)'; rr(c, 160, y0 + k * dy, 580, 26, 8); c.fill(); }
  c.font = '700 22px Mono'; c.fillStyle = 'rgba(18,59,49,0.7)'; c.textAlign = 'right'; c.fillText('channel', 150, y0 + 18);
  // jammer stuck on one channel
  const jk = 3; c.strokeStyle = RED; c.lineWidth = 4; c.beginPath(); for (let x = 760; x <= 860; x += 12) c.lineTo(x, y0 + jk * dy + 13 + ((x / 12) % 2 ? -9 : 9)); c.stroke();
  c.font = '800 22px InterX'; c.fillStyle = RED; c.textAlign = 'left'; c.fillText('jammer', 770, y0 + jk * dy - 6);
  label(c, 'same holes = same channel', 450, 692, hiX, 620, pr(t, ws(30), ws(30) + 0.4, eout));
  c.font = '700 24px Mono'; c.fillStyle = C.goldDeep; c.textAlign = 'right'; c.fillText('patent: up to 88 frequencies', PW - 48, 70);
  foot(c, 'ILLUSTRATION · patent US 2,292,387; NIHF');
}
function drawP5(c, t) {
  head(c, 'WHAT HAPPENED NEXT', null);
  stamp(c, ['REJECTED', 'U.S. Navy: "too cumbersome"'], PW / 2, 220, pr(t, ws(38), ws(38) + 0.4, eout), -0.05);
  const later = pr(t, ws(43) - 0.1, ws(43) + 0.5, eout);
  c.save(); c.globalAlpha = 0.2 + 0.8 * later;
  c.font = '800 34px Mono'; c.fillStyle = C.goldDeep; c.textAlign = 'left'; c.fillText('1962', 60, 420);
  c.font = '800 30px InterB'; c.fillStyle = C.ink; c.fillText('frequency-hopping torpedoes', 180, 410); c.fillText('on U.S. blockade ships, Cuba', 180, 450);
  c.restore();
  const wl = pr(t, ws(45) - 0.1, ws(48) + 0.3);
  // generic wireless devices with hopping signals (no specific standard claimed)
  const dev = [[200, 700], [450, 640], [700, 700]];
  dev.forEach(([x, y], i) => { const a = clamp(wl * 3 - i); c.save(); c.globalAlpha = 0.15 + 0.85 * a;
    c.fillStyle = C.ink; rr(c, x - 34, y - 60, 68, 120, 12); c.fill(); c.fillStyle = C.cream; rr(c, x - 24, y - 46, 48, 70, 6); c.fill();
    c.strokeStyle = C.ink; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 22, y - 60); c.lineTo(x + 22, y - 96); c.stroke();
    c.strokeStyle = C.gold; c.lineWidth = 4; for (let r = 1; r <= 3; r++) { const ph = (t * 3 + r * 0.4 + i) % 1; c.globalAlpha = (0.15 + 0.85 * a) * (1 - ph); c.beginPath(); c.arc(x + 22, y - 100, 14 + ph * 40, -2.4, -0.7); c.stroke(); }
    c.restore(); });
  c.save(); c.globalAlpha = wl; c.font = '800 34px InterX'; c.fillStyle = C.ink; c.textAlign = 'center'; c.fillText('later: common in wireless systems', PW / 2, 840); c.restore();
  foot(c, 'Sources: Smithsonian Magazine (2019)');
}
function drawP6(c, t) {
  head(c, 'TAKEAWAY', 'Move a tool across fields');
  const mv = pr(t, ws(51), ws(55) + 0.2), sv = pr(t, ws(57), ws(57) + 0.5, eout);
  c.font = '800 34px InterX'; c.textAlign = 'center'; c.fillStyle = C.ink; c.fillText('MUSIC', 230, 250); c.fillText('RADIO', 670, 250);
  c.strokeStyle = 'rgba(18,59,49,0.35)'; c.lineWidth = 3; c.setLineDash([10, 10]); c.beginPath(); c.moveTo(450, 220); c.lineTo(450, 860); c.stroke(); c.setLineDash([]);
  // piano keys (music field)
  for (let k = 0; k < 7; k++) { c.fillStyle = '#FFFDF6'; c.strokeStyle = C.ink; c.lineWidth = 3; c.fillRect(90 + k * 40, 300, 40, 150); c.strokeRect(90 + k * 40, 300, 40, 150); }
  for (const k of [0, 1, 3, 4, 5]) { c.fillStyle = C.ink; c.fillRect(90 + k * 40 + 28, 300, 24, 90); }
  // the roll travels from music to radio
  const rx = lerp(110, 520, mv); roll(c, rx, 520, 300, 110, t * 60, 5, -999);
  // radio side: hopping signal path appears once the roll arrives
  c.save(); c.globalAlpha = mv; c.strokeStyle = C.gold; c.lineWidth = 6; c.lineJoin = 'round'; c.beginPath();
  [[520, 760], [580, 700], [640, 790], [700, 720], [760, 800], [820, 740]].forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); c.restore();
  c.save(); c.globalAlpha = sv; c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, 120, 880, 660, 70, 14); c.fill(); c.fillStyle = C.cream; c.font = '800 30px InterX'; c.textAlign = 'center'; c.fillText('a music tool solved a radio problem', PW / 2, 926); c.restore();
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
// magnifier — used once: lands on Fig. 4 (the perforated record strip) of the real patent drawing and tracks along it
function loupe(c, t) {
  const land = Math.min(pr(t, T.loupe[0], T.loupe[0] + 0.35, eout), 1 - pr(t, T.loupe[1] - 0.3, T.loupe[1], eout));
  if (land <= 0.001 || t < T.swap[1] || t >= T.cut) return;
  const u = pr(t, T.loupe[0] + 0.3, T.loupe[1] - 0.35);
  const lx = PX + PIMG.x + PIMG.w * lerp(0.16, 0.6, u), ly = PY + PIMG.y + PIMG.h * 0.855;
  const R = 125 * (1.35 - 0.35 * land), mag = 2.4;
  c.save(); c.globalAlpha = land * 0.45; c.fillStyle = 'rgba(1,30,24,0.6)'; c.beginPath(); c.arc(lx + 20, ly + 22, R + 12, 0, 6.283); c.fill(); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.beginPath(); c.arc(lx, ly, R, 0, 6.283); c.clip();
  c.translate(lx, ly); c.scale(mag, mag); c.translate(-lx, -ly); c.drawImage(tableCache, -400, -400); drawPage(c, 'p3', t); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.lineWidth = 20; c.strokeStyle = C.deep; c.beginPath(); c.arc(lx, ly, R + 10, 0, 6.283); c.stroke();
  c.lineWidth = 3; c.strokeStyle = C.gold; c.beginPath(); c.arc(lx, ly, R + 20, 0, 6.283); c.stroke(); c.restore();
}
function camera(t) {
  if (t >= T.cut && t < T.cut + 0.01) return [540, 950, 1.06];
  return kf(t, [[0, [540, 990, 0.93]], [0.7, [540, 962, 0.98]], [T.turn1[0], [540, 954, 1.04]], [T.turn1[1], [540, 952, 1.0]], [T.swap[0], [540, 952, 1.04]], [T.swap[1], [540, 952, 1.0]], [T.cut - 0.01, [540, 954, 1.05]], [T.cut, [540, 950, 1.06]], [T.turn2[0], [540, 954, 1.02]], [T.turn2[1], [540, 952, 1.0]], [T.swap2[0], [540, 954, 1.04]], [T.swap2[1], [540, 952, 1.0]], [T.cta[0], [540, 954, 1.04]], [T.cta[1], [540, 952, 1.0]], [30, [540, 952, 1.03]]]);
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
  const cues = { T, turn: [T.turn1, T.turn2], swap: [T.swap[0], T.swap2[0], T.cta[0]], cut: [T.cut], land: [T.loupe[0] + 0.35],
    stamp: [ws(7), ws(22) - 0.1, ws(38)], plates: [ws(0) + 0.1, ws(4)], jam: ws(22) - 0.1, hop: [T.cut, T.turn2[0]], later: ws(43), devices: [ws(45), ws(48)],
    move: [ws(51), ws(55) + 0.2], tick: [ws(26), ws(30), ws(57)], cta: T.cta[1] };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '1.2,4.4,6.1,8.0,9.9,10.3,11.9,12.6,13.6,15.0,16.1,17.2,19.6,21.0,21.9,23.4,25.0,26.1,28.0').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
