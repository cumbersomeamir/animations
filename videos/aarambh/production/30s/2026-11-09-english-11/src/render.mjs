// Aarambh english-11 30 s #01 — Archive Light Table (English): Gideon Sundback, the 1917 "Separable Fastener" and the slider that designs the transition.
// Six pages on the light table changed by page turns, a slide swap, a hard cut and a CTA slide-in (accepted recipe).
// Archival objects: a public-domain portrait (Wikimedia Commons "Gideon Sundback.jpg", PD-old, c. 1920) and real drawings of
// U.S. Patent 1,219,881 (USPTO full-image PDF): sheet 1, Fig. 1 (slider), Fig. 2 (locking/unlocking), Fig. 4 (member), Fig. 9 (nesting).
// The zipper hook, the alternating-teeth strip, the opening demo and the lesson diagram are original illustrations ("ILLUSTRATION").
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
const CAPS = [ // [firstWord, lastWord, lines]; ASR word indices (qa/asr_words_narration.json; "Sundback" is split by tiny.en into 0-2)
  [0, 3, ['Gideon Sundback made']],
  [4, 8, ["Whitcomb Judson's earlier", 'fastener reliable.']],
  [9, 16, ['His 1917 patent uses', 'identical, cup-shaped teeth']],
  [17, 23, ['that alternate', 'between two tapes.']],
  [24, 29, ["The slider's Y-shaped", 'channel steers']],
  [30, 32, ['both rows together,']],
  [33, 39, ['so each tooth', 'nests in the next.']],
  [40, 46, ['Pull it back, and the', 'diverging channels']],
  [47, 52, ['part them again,', 'tooth by tooth.']],
  [53, 58, ['Lesson: design the', 'transition between states,']],
  [59, 64, ['not just the', 'two endpoints.']],
  [65, 70, ['Download Aarambh to', 'support livelihood tools.']],
];
const SENT = JSON.parse(readFileSync(path.join(ROOT, 'audio/script.json'), 'utf8')).sentences;
const SENT_START = { 0: SENT[0].start, 9: SENT[1].start, 24: SENT[2].start, 40: SENT[3].start, 53: SENT[4].start, 65: SENT[5].start }; // script starts override early ASR stamps
const sStart = (a) => (SENT_START[a] !== undefined ? Math.max(ws(a), SENT_START[a]) : (we(a - 1) + ws(a)) / 2); // mid-sentence: halfway through the pause
const capWin = CAPS.map(([a, b, lines], i) => {
  const t0 = sStart(a) - 0.08, nxA = i + 1 < CAPS.length ? CAPS[i + 1][0] : null;
  const next = nxA === null ? 30 : sStart(nxA) - 0.08;
  return { t0: Math.max(0.25, t0), t1: Math.min(we(b) + 0.6, next - 0.06, 29.85), lines };
});
const T = {
  turn1: [SENT[1].start - 0.35, SENT[1].start], swap: [SENT[2].start - 0.35, SENT[2].start],
  loupe: [ws(26) - 0.2, SENT[3].start - 0.26], // real Fig. 1: Y-shaped channel -> throat -> nested teeth
  cut: SENT[3].start - 0.06, // hard cut on "Pull it back"
  turn2: [SENT[4].start - 0.35, SENT[4].start], cta: [SENT[5].start - 0.5, SENT[5].start],
};
const PULL = [ws(40) - 0.05, ws(52) + 0.3]; // demo: slider pulled back ("Pull" .. "tooth by tooth")
const icon = await loadImage(path.join(ROOT, 'assets/aarambh-icon.png'));
const IMG = {};
for (const [k, f] of [['por', 'gideon-sundback-portrait-pd.jpg'], ['sh1', 'us1219881-sheet1.png'], ['f1', 'us1219881-fig1-slider.png'], ['f2', 'us1219881-fig2-locking.png'], ['f4', 'us1219881-fig4-member.png'], ['f9', 'us1219881-fig9-nesting.png']]) IMG[k] = await loadImage(path.join(ROOT, 'assets', f));
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
const UL = { name: [0.41, 0.585, 0.034], date: [0.68, 0.96, 0.102] }; // gold underlines on the sheet-1 header (fractions of the print)
const ARM = { l: [0.13, 0.22, 0.35, 0.37], r: [0.75, 0.22, 0.53, 0.37] }; // stringer arms entering the slider on Fig. 1 (fractions)

// ---------- illustration primitives (original drawings, labelled "ILLUSTRATION") ----------
const STEEL = '#6F7F7B', BRASS = '#C9A24A', BRASS_D = '#7A5A1E';
function tooth(c, x, y, side, h, L, tip, glow) { // cup-shaped element: root in its tape, rounded head crossing the centre line when meshed
  c.save(); c.translate(x, y); c.scale(side, 1);
  if (glow > 0) { c.shadowColor = `rgba(241,180,68,${0.9 * glow})`; c.shadowBlur = 14; }
  c.fillStyle = glow > 0 ? '#E8C25E' : BRASS; rr(c, -tip, -h / 2, L, h, h * 0.42); c.fill(); c.shadowColor = 'rgba(0,0,0,0)';
  c.strokeStyle = BRASS_D; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = 'rgba(90,60,20,0.55)'; c.beginPath(); c.ellipse(-tip + L * 0.22, 0, L * 0.1, h * 0.26, 0, 0, 6.283); c.fill();
  c.restore();
}
function slider(c, cx, sy, tabUp, s = 1) {
  c.save(); c.translate(cx, sy); c.scale(s, s);
  const g = c.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#7D8B8F'); g.addColorStop(0.5, '#C7D0D2'); g.addColorStop(1, '#7D8B8F');
  c.fillStyle = g; c.strokeStyle = '#3E4A47'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-62, -58); c.lineTo(62, -58); c.lineTo(32, 20); c.lineTo(-32, 20); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#56636A'; c.beginPath(); c.moveTo(-16, -58); c.lineTo(16, -58); c.lineTo(0, -30); c.closePath(); c.fill(); // the point between the diverging channels
  const ty = tabUp ? -58 : 20, dir = tabUp ? -1 : 1;
  c.fillStyle = '#9AA7AB'; c.strokeStyle = '#3E4A47'; c.lineWidth = 2.5; rr(c, -13, dir < 0 ? ty - 74 : ty, 26, 74, 11); c.fill(); c.stroke();
  c.fillStyle = 'rgba(30,40,38,0.55)'; rr(c, -6, dir < 0 ? ty - 64 : ty + 44, 12, 20, 6); c.fill();
  c.restore();
}
function zipper(c, cx, yTop, yBot, sy, o = {}) {
  const p = o.p ?? 24, tw = o.tw ?? 64, edge = o.edge ?? 8, L = o.L ?? 34, tip = o.tip ?? 12, maxDx = o.maxDx ?? 70, k = o.k ?? 0.42;
  const dxAt = (y) => (o.gap !== undefined ? o.gap : (y < sy - 34 ? Math.min(maxDx, (sy - 34 - y) * k) : 0));
  for (const side of [-1, 1]) {
    c.beginPath(); let first = true;
    for (let y = yTop; y <= yBot; y += 5) { const x = cx + side * (edge + dxAt(y)); if (first) { c.moveTo(x, y); first = false; } else c.lineTo(x, y); }
    for (let y = yBot; y >= yTop; y -= 5) c.lineTo(cx + side * (edge + dxAt(y) + tw), y);
    c.closePath(); c.fillStyle = side < 0 ? '#0A5A49' : '#0D6B57'; c.fill();
    c.save(); c.strokeStyle = 'rgba(251,247,238,0.35)'; c.setLineDash([6, 6]); c.lineWidth = 2; c.beginPath(); first = true;
    for (let y = yTop; y <= yBot; y += 5) { const x = cx + side * (edge + dxAt(y) + tw * 0.62); if (first) { c.moveTo(x, y); first = false; } else c.lineTo(x, y); } c.stroke(); c.restore();
  }
  const n = Math.floor((yBot - yTop) / p);
  for (let i = 0; i < n; i++) for (const side of [-1, 1]) {
    const y = yTop + p * 0.5 + i * p + (side > 0 ? p / 2 : 0); if (y > yBot - 4) continue;
    const dx = dxAt(y); tooth(c, cx + side * dx, y, side, p * 0.52, L, tip, o.flash ? clamp(o.flash(y)) : 0);
  }
  if (o.slider !== false && sy > yTop - 60 && sy < yBot + 60) slider(c, cx, sy, o.tabUp, o.ss ?? 1);
}
function arrowAlong(c, x0, y0, x1, y1, t, a) { if (a <= 0) return; c.save(); c.globalAlpha = a; c.strokeStyle = C.gold; c.lineWidth = 7; c.lineCap = 'round'; c.setLineDash([16, 12]); c.lineDashOffset = -t * 60;
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]); const an = Math.atan2(y1 - y0, x1 - x0);
  c.fillStyle = C.gold; c.beginPath(); c.moveTo(x1 + Math.cos(an) * 16, y1 + Math.sin(an) * 16); c.lineTo(x1 + Math.cos(an + 2.4) * 18, y1 + Math.sin(an + 2.4) * 18); c.lineTo(x1 + Math.cos(an - 2.4) * 18, y1 + Math.sin(an - 2.4) * 18); c.closePath(); c.fill(); c.restore(); }
function underline(c, r, fx0, fx1, fy, a) { if (a <= 0) return; c.save(); c.strokeStyle = C.gold; c.lineWidth = 6; c.lineCap = 'round'; const y = r.y + r.h * fy, x0 = r.x + r.w * fx0; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + (r.w * (fx1 - fx0)) * a, y); c.stroke(); c.restore(); }

// ---------- pages ----------
function drawP1(c, t) {
  head(c, 'MEADVILLE, PENNSYLVANIA · 1910s', null);
  note(c, 'ILLUSTRATION', 852, 72, 18, 'rgba(18,59,49,0.7)', 'right', 'Mono');
  const pa = pr(t, 0.02, 0.5, eout);
  c.save(); c.globalAlpha = pa; c.translate(0, (1 - pa) * 24); print(c, IMG.por, 48, 100, 300, -0.02, 'public domain, c. 1920'); c.restore();
  // hook: a zipper closes from frame 0 — the slider rises and the two rows of teeth snap together behind it
  const sy = lerp(585, 160, pr(t, 0.0, 3.9, (u) => u));
  c.save(); c.beginPath(); rr(c, 392, 96, 488, 480, 14); c.fillStyle = 'rgba(2,34,28,0.05)'; c.fill(); c.clip();
  zipper(c, 640, 90, 590, sy, { tabUp: true, flash: (y) => (y > sy + 20 && y < sy + 64 ? 1 - (y - sy - 20) / 44 : 0) });
  c.restore();
  const pl = pr(t, 0.45, 0.85, eout);
  if (pl > 0) { c.save(); c.globalAlpha = pl; c.translate(0, (1 - pl) * 20); c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, 48, 600, 804, 120, 16); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 3; c.stroke();
    c.fillStyle = C.cream; c.textAlign = 'left'; c.font = '800 48px Fraunces'; c.fillText('Gideon Sundback', 76, 658); c.fillStyle = C.gold; c.font = '800 28px InterX'; c.fillText('engineer · Meadville, Pennsylvania · 1880–1954', 76, 700); c.restore(); }
  const ja = pr(t, ws(4) - 0.2, ws(4) + 0.25, eout);
  if (ja > 0) { c.save(); c.globalAlpha = ja; c.fillStyle = 'rgba(2,34,28,0.07)'; rr(c, 48, 752, 430, 112, 14); c.fill(); c.strokeStyle = 'rgba(18,59,49,0.25)'; c.lineWidth = 2; c.stroke();
    note(c, 'BEFORE · WHITCOMB JUDSON', 70, 790, 22, C.goldDeep, 'left', 'Mono'); note(c, 'clasp locker, 1890s', 70, 822, 24, C.ink, 'left', 'InterX'); note(c, 'it lacked reliability (NIHF)', 70, 852, 21, 'rgba(18,59,49,0.8)', 'left'); c.restore(); }
  stamp(c, ['MADE IT RELIABLE'], 676, 808, pr(t, ws(8) - 0.1, ws(8) + 0.3, eout), -0.05);
  foot(c, 'Sources: NIHF; U.S. Patent 1,219,881');
}
function drawP2(c, t) {
  head(c, 'THE 1917 PATENT', null);
  const r = print(c, IMG.sh1, 44, 96, 420, -0.008, 'U.S. Patent 1,219,881, sheet 1 (USPTO)');
  underline(c, r, UL.name[0], UL.name[1], UL.name[2], pr(t, ws(9) - 0.15, ws(9) + 0.3));
  underline(c, r, UL.date[0], UL.date[1], UL.date[2], pr(t, ws(10) - 0.1, ws(10) + 0.45));
  stamp(c, ['PATENT 1,219,881', 'MAR. 20, 1917'], 252, 822, pr(t, ws(11) - 0.1, ws(11) + 0.3, eout), -0.05);
  note(c, 'application filed Aug. 27, 1914', 252, 918, 20, 'rgba(18,59,49,0.75)', 'center');
  const a4 = pr(t, ws(13) - 0.3, ws(13) + 0.1, eout), a9 = pr(t, ws(14) - 0.3, ws(14) + 0.1, eout);
  c.save(); c.globalAlpha = 0.35 + 0.65 * a4; print(c, IMG.f4, 530, 104, 300, 0.01); c.restore();
  pill(c, 'every tooth alike', 680, 362, a4, 24);
  c.save(); c.globalAlpha = 0.35 + 0.65 * a9; print(c, IMG.f9, 520, 404, 320, -0.01); c.restore();
  pill(c, 'each cup nests in the next', 680, 556, a9, 24);
  // alternating identical teeth on two tapes slide together (illustration)
  const g = lerp(46, 0, pr(t, ws(18) - 0.3, ws(18) + 0.6));
  c.save(); c.beginPath(); c.rect(500, 596, 360, 248); c.clip(); zipper(c, 680, 600, 840, 0, { gap: g, slider: false, p: 22 }); c.restore();
  pill(c, 'teeth alternate sides', 680, 884, pr(t, ws(18) - 0.15, ws(18) + 0.25, eout), 24);
  foot(c, 'Source: U.S. Patent 1,219,881');
}
const F1 = [40, 96, 470, -0.006];
const f1Rect = () => { const [x, y, w] = F1; return { x, y, w, h: w * IMG.f1.height / IMG.f1.width }; };
function drawP3(c, t) {
  head(c, 'THE SLIDER · PATENT FIG. 1', null);
  print(c, IMG.f1, ...F1);
  const r = f1Rect(), P = (fx, fy) => [r.x + r.w * fx, r.y + r.h * fy];
  const aa = Math.min(pr(t, ws(29) - 0.15, ws(29) + 0.25, eout), 1 - pr(t, ws(36) + 0.4, ws(36) + 0.8));
  arrowAlong(c, ...P(ARM.l[0], ARM.l[1]), ...P(ARM.l[2], ARM.l[3]), t, aa); arrowAlong(c, ...P(ARM.r[0], ARM.r[1]), ...P(ARM.r[2], ARM.r[3]), t, aa);
  print(c, IMG.f2, 546, 104, 290, 0.012);
  note(c, 'Fig. 2: "the manner of', 690, 512, 20, 'rgba(18,59,49,0.8)', 'center'); note(c, 'locking and unlocking"', 690, 538, 20, 'rgba(18,59,49,0.8)', 'center');
  pill(c, 'Y-shaped channel', 690, 640, pr(t, ws(26) - 0.15, ws(26) + 0.25, eout), 24);
  pill(c, 'rows steered together', 690, 720, pr(t, ws(30) - 0.15, ws(30) + 0.25, eout), 24);
  pill(c, 'each tooth nests', 690, 800, pr(t, ws(36) - 0.15, ws(36) + 0.25, eout), 24);
  foot(c, 'Source: U.S. Patent 1,219,881, Figs. 1–2');
}
function drawP4(c, t) {
  head(c, 'HOW IT OPENS', 'Pull back: the rows part');
  note(c, 'ILLUSTRATION · after patent Fig. 1', 48, 176, 18, 'rgba(18,59,49,0.7)', 'left', 'Mono');
  const u = pr(t, PULL[0], PULL[1], (x) => x), sy = lerp(262, 846, u);
  c.save(); c.beginPath(); rr(c, 60, 196, 540, 724, 14); c.fillStyle = 'rgba(2,34,28,0.05)'; c.fill(); c.clip();
  zipper(c, 330, 196, 920, sy, { tabUp: false, flash: (y) => (y < sy - 58 && y > sy - 132 ? (y - (sy - 132)) / 74 : 0) });
  c.restore();
  const parted = Math.max(0, Math.floor((sy - 262) / 12));
  c.save(); c.fillStyle = 'rgba(2,34,28,0.92)'; rr(c, 628, 210, 230, 170, 16); c.fill(); c.restore();
  note(c, 'TEETH PARTED', 743, 250, 22, C.gold, 'center', 'Mono');
  c.save(); c.fillStyle = C.cream; c.font = '800 84px Fraunces'; c.textAlign = 'center'; c.fillText(String(parted), 743, 352); c.restore();
  const chip = (y, col, txt) => { c.save(); c.fillStyle = col; rr(c, 628, y - 26, 26, 26, 6); c.fill(); c.restore(); note(c, txt, 666, y - 6, 22, C.ink, 'left', 'InterX'); };
  chip(452, '#E8C25E', 'above slider: open'); chip(500, '#0A5A49', 'below slider: closed');
  const dp = pr(t, ws(45) - 0.2, ws(45) + 0.2, eout);
  if (dp > 0) { const py = clamp(sy - 22, 590, 880); c.save(); c.globalAlpha = dp; c.strokeStyle = C.goldDeep; c.lineWidth = 3; c.beginPath(); c.moveTo(402, sy - 22); c.lineTo(600, py); c.stroke(); c.restore(); pill(c, 'diverging channels', 740, py, dp, 24); }
  foot(c, 'Source: U.S. Patent 1,219,881, Fig. 1');
}
function drawP5(c, t) {
  head(c, 'LESSON', 'Design the transition');
  const hl = pr(t, ws(54) - 0.2, ws(54) + 0.3, eout), ar = pr(t, ws(56) - 0.2, ws(57) + 0.2), dim = pr(t, ws(59) - 0.1, ws(59) + 0.4);
  const box = (x, w, a, gold) => { c.save(); c.globalAlpha = a; c.fillStyle = gold ? 'rgba(241,180,68,0.14)' : 'rgba(2,34,28,0.06)'; rr(c, x, 190, w, 240, 16); c.fill(); c.strokeStyle = gold ? C.goldDeep : 'rgba(18,59,49,0.3)'; c.lineWidth = gold ? 5 : 2.5; c.stroke(); c.restore(); };
  const ea = 1 - 0.5 * dim;
  box(48, 220, ea, false); box(632, 220, ea, false); box(318, 264, 1, hl > 0.5);
  const mini = { p: 16, tw: 30, edge: 5, L: 22, tip: 8, slider: false };
  c.save(); c.globalAlpha = ea; c.beginPath(); c.rect(52, 194, 212, 232); c.clip(); zipper(c, 158, 196, 428, 0, { ...mini, gap: 26 }); c.restore();
  c.save(); c.globalAlpha = ea; c.beginPath(); c.rect(636, 194, 212, 232); c.clip(); zipper(c, 742, 196, 428, 0, { ...mini, gap: 0 }); c.restore();
  const sy = 330 + Math.sin(t * 2.2) * 60;
  c.save(); c.beginPath(); c.rect(322, 194, 256, 232); c.clip(); zipper(c, 450, 196, 428, sy, { ...mini, slider: true, ss: 0.55, k: 0.5, maxDx: 30, tabUp: true }); c.restore();
  arrowAlong(c, 272, 310, 312, 310, t, ar); arrowAlong(c, 586, 310, 626, 310, t, ar);
  note(c, 'open', 158, 466, 24, `rgba(18,59,49,${0.85 * ea})`, 'center', 'InterX'); note(c, 'closed', 742, 466, 24, `rgba(18,59,49,${0.85 * ea})`, 'center', 'InterX');
  note(c, 'the transition:', 450, 466, 24, C.goldDeep, 'center', 'InterX'); note(c, 'the slider', 450, 496, 24, C.goldDeep, 'center', 'InterX');
  if (dim > 0) { note(c, 'endpoint', 158, 496, 20, `rgba(18,59,49,${0.6 * dim})`, 'center', 'Mono'); note(c, 'endpoint', 742, 496, 20, `rgba(18,59,49,${0.6 * dim})`, 'center', 'Mono'); }
  pill(c, 'Your turn: what is the in-between step?', 450, 572, pr(t, ws(59) + 0.1, ws(59) + 0.5, eout), 28);
  print(c, IMG.por, 48, 640, 180, -0.015, 'Gideon Sundback');
  note(c, 'Gideon Sundback, 1880–1954', 268, 690, 26, C.ink, 'left', 'InterX');
  note(c, 'National Inventors Hall of Fame, 2006', 268, 730, 21, 'rgba(18,59,49,0.8)', 'left');
  note(c, 'U.S. Patent 1,219,881 (1917)', 268, 762, 21, 'rgba(18,59,49,0.8)', 'left');
  note(c, 'improved Whitcomb Judson\'s fastener', 268, 794, 21, 'rgba(18,59,49,0.8)', 'left');
  foot(c, 'Sources: NIHF; U.S. Patent 1,219,881');
}
function drawP6(c, t) {
  c.fillStyle = C.deep; c.fillRect(0, 0, PW, PH);
  c.strokeStyle = C.gold; c.lineWidth = 3; c.strokeRect(22, 22, PW - 44, PH - 44);
  const a = pr(t, T.cta[1], T.cta[1] + 0.5, eout);
  c.save(); c.globalAlpha = 0.4 + 0.6 * a; c.drawImage(icon, PW / 2 - 140, 150, 280, 280); c.restore();
  c.fillStyle = C.cream; c.textAlign = 'center'; c.font = '800 74px Fraunces'; c.fillText('Download Aarambh', PW / 2, 560);
  c.font = '800 40px InterB'; c.fillStyle = C.gold; c.fillText('to support livelihood tools', PW / 2, 632);
  c.font = '700 26px InterB'; c.fillStyle = 'rgba(251,247,238,0.8)'; c.fillText('Fund verified livelihood tools', PW / 2, 740); c.fillText('and follow their impact.', PW / 2, 778);
  c.font = '700 22px Mono'; c.fillStyle = 'rgba(251,247,238,0.6)'; c.fillText('Get it on Google Play', PW / 2, 880);
}
const DRAW = { p1: drawP1, p2: drawP2, p3: drawP3, p4: drawP4, p5: drawP5, p6: drawP6 };
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
  if (t < T.cta[0]) return drawPage(c, 'p5', t);
  if (t < T.cta[1]) return slideSwap(c, 'p5', 'p6', (t - T.cta[0]) / (T.cta[1] - T.cta[0]), t);
  return drawPage(c, 'p6', t);
}
// magnifier — used once: the real Fig. 1, from the slider's Y-shaped channel to the throat where the rows meet, then to the nested teeth
const LENS = [[0.44, 0.355], [0.44, 0.505], [0.44, 0.62]];
function loupe(c, t) {
  const land = Math.min(pr(t, T.loupe[0], T.loupe[0] + 0.35, eout), 1 - pr(t, T.loupe[1] - 0.3, T.loupe[1], eout));
  if (land <= 0.001 || t < T.swap[1] || t >= T.cut) return;
  const r = f1Rect(), m1 = pr(t, ws(31) - 0.1, ws(32) + 0.2), m2 = pr(t, ws(36) - 0.15, ws(36) + 0.25);
  const fx = m1 < 1 ? lerp(LENS[0][0], LENS[1][0], m1) : lerp(LENS[1][0], LENS[2][0], m2), fy = m1 < 1 ? lerp(LENS[0][1], LENS[1][1], m1) : lerp(LENS[1][1], LENS[2][1], m2);
  const lx = PX + r.x + r.w * fx, ly = PY + r.y + r.h * fy;
  const R = 100 * (1.35 - 0.35 * land), mag = 2.2;
  c.save(); c.globalAlpha = land * 0.45; c.fillStyle = 'rgba(1,30,24,0.6)'; c.beginPath(); c.arc(lx + 20, ly + 22, R + 12, 0, 6.283); c.fill(); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.beginPath(); c.arc(lx, ly, R, 0, 6.283); c.clip();
  c.translate(lx, ly); c.scale(mag, mag); c.translate(-lx, -ly); c.drawImage(tableCache, -400, -400); drawPage(c, 'p3', t); c.restore();
  c.save(); c.globalAlpha = clamp(land * 1.6); c.lineWidth = 20; c.strokeStyle = C.deep; c.beginPath(); c.arc(lx, ly, R + 10, 0, 6.283); c.stroke();
  c.lineWidth = 3; c.strokeStyle = C.gold; c.beginPath(); c.arc(lx, ly, R + 20, 0, 6.283); c.stroke(); c.restore();
}
function camera(t) {
  if (t >= T.cut && t < T.cut + 0.01) return [540, 950, 1.06];
  return kf(t, [[0, [540, 990, 0.93]], [0.7, [540, 962, 0.98]], [T.turn1[0], [540, 954, 1.04]], [T.turn1[1], [540, 952, 1.0]], [T.swap[0], [540, 952, 1.04]], [T.swap[1], [540, 952, 1.0]], [T.cut - 0.01, [540, 954, 1.04]], [T.cut, [540, 950, 1.06]], [T.turn2[0], [540, 954, 1.02]], [T.turn2[1], [540, 952, 1.0]], [T.cta[0], [540, 954, 1.04]], [T.cta[1], [540, 952, 1.0]], [30, [540, 952, 1.03]]]);
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
  const ticks = []; for (let x = PULL[0] + 0.12; x < PULL[1]; x += 0.11) ticks.push(+x.toFixed(3)); // teeth parting, tooth by tooth
  const cues = { T, turn: [T.turn1, T.turn2], swap: [T.swap[0], T.cta[0]], cut: [T.cut], land: [T.loupe[0] + 0.35, ws(32) + 0.2, ws(36) + 0.25],
    zip: [0.0, 3.9], plate: 0.45, judson: ws(4) - 0.2, stamp: [ws(8) - 0.1, ws(11) - 0.1], underline: [ws(9) - 0.15, ws(10) - 0.1],
    figs: [ws(13) - 0.3, ws(14) - 0.3], mesh: ws(18) - 0.3, arrows: ws(29) - 0.15,
    label: [ws(13) - 0.3, ws(14) - 0.3, ws(18) - 0.15, ws(26) - 0.15, ws(30) - 0.15, ws(36) - 0.15, ws(45) - 0.2],
    pull: PULL, ticks, steps: [ws(54) - 0.2, ws(56) - 0.2, ws(59) - 0.1], ok: ws(54) + 0.3, prompt: ws(59) + 0.1, cta: T.cta[1] };
  writeFileSync(path.join(ROOT, 'src/cues.json'), JSON.stringify(cues, null, 1)); console.log(JSON.stringify(T));
} else if (arg('--stills')) {
  const dir = path.resolve(ROOT, arg('--stills')); mkdirSync(dir, { recursive: true });
  for (const tt of arg('--times', '0.6,2.0,3.0,5.5,7.6,9.8,11.9,13.6,15.4,16.6,18.6,20.4,22.3,24.2,25.9,28.0').split(',').map(Number)) { drawFrame(tt); writeFileSync(path.join(dir, `t${tt.toFixed(2).padStart(5, '0')}.png`), canvas.toBuffer('image/png')); }
} else {
  const out = path.resolve(ROOT, arg('--out', 'build/video.mp4')); mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < N; f++) { drawFrame(f / FPS); if (!ff.stdin.write(Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer))) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 150 === 0) console.log('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  console.log('wrote', out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
