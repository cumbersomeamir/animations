// Media Diet · 30 s English episode (english-09) — log in to your own Spotify on United seatback screens with a QR code (Spotify, 5 Nov 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted feedback-round film.js (via the
// accepted news-episode builds): a paper miniature in Media Diet brand colours — laminated cards with visible edges, paper
// grain, real cast shadows, hinged props, one camera set-up per beat, restrained depth of field. English captions use the
// accepted English treatment (Space Grotesk 700, 50 px, baselines 414/478). Deterministic: window.render(frame); window.TEXTS().
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const TL = await (await fetch('./timeline.json')).json();
const CUES = await (await fetch('./data/cues.json')).json();
const E = TL.events; const W = TL.width, H = TL.height, FPS = TL.fps;
await Promise.all(['700 50px "Space Grotesk"', '600 28px Inter', '600 26px "Plex Mono"'].map((f) => document.fonts.load(f)));
const iconImg = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = '../../../../assets/icon.png'; });

// ------------------------------------------------------------------ helpers
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const outC = (u) => 1 - Math.pow(1 - u, 3);
const outBack = (u) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
const prog = (t, a, b, e = ease) => e(clamp((t - a) / (b - a)));
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// brand palette (assets/icon.png) mapped to paper stock
const P = { navy: '#0d1240', navy2: '#141a52', deep: '#24287e', violet: '#552dbc', violet2: '#7c3fda', violetL: '#a359fa', lav: '#c9bfff',
  cyan: '#2addfa', magenta: '#fe4092', edge: '#ece8ff', white: '#f3f1ff', ink: '#14163a' };

// ------------------------------------------------------------------ renderer + composer (MSAA target, restrained bokeh)
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('gl').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 200);
const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
const bokeh = new BokehPass(scene, camera, { focus: 10, aperture: 0.0008, maxblur: 0.005 });
composer.addPass(bokeh); composer.addPass(new OutputPass());

// ------------------------------------------------------------------ paper stock: grain texture + card builder
const grain = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 512, 512);
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 30000; i++) { const v = 150 + rnd() * 105; g.fillStyle = `rgba(${v},${v},${v},0.5)`; g.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 2, 1 + rnd() * 2); }
  g.strokeStyle = 'rgba(170,170,185,0.18)'; g.lineWidth = 1;
  for (let i = 0; i < 260; i++) { const x = rnd() * 512, y = rnd() * 512, a = rnd() * Math.PI; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * (8 + rnd() * 26), y + Math.sin(a) * (8 + rnd() * 26)); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const matCache = new Map();
function paper(color, o = {}) {
  const key = color + JSON.stringify(o); if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({ color, map: grain, bumpMap: grain, bumpScale: 3.0, roughness: 0.92, metalness: 0, ...o });
  matCache.set(key, m); return m;
}
// a card: box with printed faces on its two large sides and lighter paper-core edges on the thin sides
let tintSeed = 3; const tint = (hex) => { tintSeed = (tintSeed * 16807) % 2147483647; const k = 0.94 + 0.08 * (tintSeed / 2147483647); const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };
function card(w, h, d, face, edge = P.edge, thin = 'y', back = null) {
  const F = paper(tint(face)), Bk = paper(back ? tint(back) : tint(face)), Ed = paper(edge);
  const axes = ['x', 'x', 'y', 'y', 'z', 'z'];
  const mats = axes.map((ax, i) => (ax === thin ? (i % 2 === 0 ? F : Bk) : Ed));
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.castShadow = true; m.receiveShadow = true; return m;
}
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

// ------------------------------------------------------------------ lights + backdrop
scene.background = canvasTex(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#060824'); gr.addColorStop(0.5, '#141250'); gr.addColorStop(1, '#090b2e'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
scene.add(new THREE.HemisphereLight('#c7bbff', '#1a1640', 0.75));
const key = new THREE.DirectionalLight('#ffe9d2', 3.6); key.position.set(-11, 10, -4); key.castShadow = true;
key.shadow.mapSize.set(1536, 1536); Object.assign(key.shadow.camera, { left: -13, right: 13, top: 14, bottom: -14, near: 1, far: 60 }); key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
scene.add(key); scene.add(key.target);
const rim = new THREE.DirectionalLight('#9fd8ff', 0.55); rim.position.set(9, 7, 12); scene.add(rim);

// table (stacked paper layers) + layered paper hills backdrop
const table = new THREE.Group(); scene.add(table);
[[18, 0.1, 30, P.navy2, -0.05], [18.3, 0.08, 30.3, P.deep, -0.14], [18.6, 0.08, 30.6, P.navy, -0.22]].forEach(([w, h, d, c, y]) => { const m = card(w, h, d, c, P.lav); m.position.set(0, y, 3); table.add(m); });
const hillShape = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], 0); pts.forEach(([x, y]) => s.lineTo(x, y)); s.lineTo(pts[pts.length - 1][0], 0); return s; };
[[-15, P.violet, 0.0, [[-14, 3.2], [-9, 5.6], [-4, 4.0], [1, 6.4], [6, 4.4], [11, 5.8], [14, 3.4]]], [-14, P.deep, 0.0, [[-14, 2.2], [-8, 3.6], [-2, 2.6], [4, 4.0], [10, 2.8], [14, 3.0]]]].forEach(([z, c, y0, pts]) => {
  const geo = new THREE.ExtrudeGeometry(hillShape(pts), { depth: 0.06, bevelEnabled: false });
  const m = new THREE.Mesh(geo, [paper(c), paper(P.lav)]); m.position.set(0, y0, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
});


// ------------------------------------------------------------------ desk mat (layered paper) the story plays out on
const DESK = 0.05;
{ const m1 = card(13.2, 0.03, 12.4, '#1b2170', P.lav); m1.position.set(0, 0.015, 1.4); scene.add(m1);
  const m2 = card(12.8, 0.02, 12.0, '#232a86', P.edge); m2.position.set(0, 0.04, 1.4); scene.add(m2); }
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function starShape(ro = 0.24, ri = 0.07) { const s = new THREE.Shape(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 2, r = i % 2 ? ri : ro; const p = [Math.cos(a) * r, Math.sin(a) * r]; if (i) s.lineTo(...p); else s.moveTo(...p); } return s; }
const starGeo = new THREE.ExtrudeGeometry(starShape(), { depth: 0.025, bevelEnabled: false });
const ov = document.getElementById('ov'); const og = ov.getContext('2d'); let TEXTLOG = [];
function otext(str, x, y, o = {}) {
  og.save(); og.font = o.font || '700 50px "Space Grotesk"'; og.textAlign = o.align || 'center'; og.fillStyle = o.color || '#f6f4ff';
  og.globalAlpha = o.alpha ?? 1; og.shadowColor = 'rgba(2,3,20,0.95)'; og.shadowBlur = o.shadow ?? 14; og.fillText(str, x, y);
  const m = og.measureText(str); const x0 = x - m.actualBoundingBoxLeft, x1 = x + m.actualBoundingBoxRight;
  if ((o.alpha ?? 1) > 0.05) TEXTLOG.push({ kind: o.kind || 'label', text: str, x0: Math.round(x0), y0: Math.round(y - m.actualBoundingBoxAscent), x1: Math.round(x1), y1: Math.round(y + m.actualBoundingBoxDescent) });
  og.restore();
}
const CAPF = '700 50px "Space Grotesk"';   // accepted English caption treatment
function captions(t) {
  const c = CUES.find((q) => t >= q.in && t < q.out); if (!c) return; const a = clamp((t - c.in) / 0.1);
  const gr = og.createLinearGradient(0, 300, 0, 560); gr.addColorStop(0, 'rgba(4,6,30,0)'); gr.addColorStop(0.3, 'rgba(4,6,30,0.5)'); gr.addColorStop(0.75, 'rgba(4,6,30,0.5)'); gr.addColorStop(1, 'rgba(4,6,30,0)');
  og.save(); og.globalAlpha = a; og.fillStyle = gr; og.fillRect(0, 300, W, 260); og.restore();
  if (c.lines.length === 1) otext(c.lines[0], 540, 448, { alpha: a, kind: 'caption', font: CAPF });
  else { otext(c.lines[0], 540, 414, { alpha: a, kind: 'caption', font: CAPF }); otext(c.lines[1], 540, 478, { alpha: a, kind: 'caption', font: CAPF }); }
}


const project = (v) => { const p = v.clone().project(camera); return [(p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H]; };
function sCheck(g, cx, cy, r, a) { if (a <= 0) return; g.save(); g.globalAlpha = Math.min(1, a); g.translate(cx, cy); const s = outBack(Math.min(1, a)); g.scale(s, s); g.fillStyle = P.cyan; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#0d1240'; g.lineWidth = r * 0.24; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-r * 0.45, 0); g.lineTo(-r * 0.12, r * 0.33); g.lineTo(r * 0.5, -r * 0.35); g.stroke(); g.restore(); }
// generic glyphs (no brand logos): shield, bell, bag, person, gear, bug
function gShield(g, x, y, s, on) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(0, -46); g.lineTo(38, -32); g.lineTo(34, 10); g.quadraticCurveTo(26, 36, 0, 50); g.quadraticCurveTo(-26, 36, -34, 10); g.lineTo(-38, -32); g.closePath();
  g.fillStyle = on ? P.cyan : '#6b6f9e'; g.fill(); g.lineWidth = 8; g.lineCap = 'round'; g.lineJoin = 'round';
  if (on) { g.strokeStyle = '#0d1240'; g.beginPath(); g.moveTo(-14, 2); g.lineTo(-3, 14); g.lineTo(16, -10); g.stroke(); } else { g.strokeStyle = P.magenta; g.beginPath(); g.moveTo(-30, 34); g.lineTo(30, -30); g.stroke(); } g.restore(); }
function gBell(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.moveTo(-30, 22); g.quadraticCurveTo(-26, -30, 0, -32); g.quadraticCurveTo(26, -30, 30, 22); g.closePath(); g.fill(); g.fillRect(-36, 20, 72, 9); g.beginPath(); g.arc(0, 36, 9, 0, Math.PI * 2); g.fill(); g.restore(); }
function gBag(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -30, -16, 60, 50, 8); g.fill(); g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.arc(0, -16, 15, Math.PI, 0); g.stroke(); g.restore(); }
function gPerson(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -14, 15, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(0, 30, 30, Math.PI, 0); g.fill(); g.restore(); }
function gGear(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; for (let i = 0; i < 8; i++) { g.save(); g.rotate(i * Math.PI / 4); g.fillRect(-7, -36, 14, 16); g.restore(); } g.beginPath(); g.arc(0, 0, 26, 0, Math.PI * 2); g.fill(); g.fillStyle = '#141a52'; g.beginPath(); g.arc(0, 0, 10, 0, Math.PI * 2); g.fill(); g.restore(); }
function gBug(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#ffffff'; g.lineWidth = 7; g.lineCap = 'round'; for (const k of [-1, 1]) for (const dy of [-12, 4, 20]) { g.beginPath(); g.moveTo(k * 16, dy); g.lineTo(k * 34, dy - 8); g.stroke(); } g.beginPath(); g.moveTo(-8, -30); g.lineTo(-16, -42); g.moveTo(8, -30); g.lineTo(16, -42); g.stroke();
  g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(0, 4, 20, 28, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = P.magenta; g.fillRect(-2, -18, 4, 46); g.restore(); }



// ------------------------------------------------------------------ small canvas glyphs (generic; no Spotify/United/Starlink logos or UI)
function gEnvelope(g, x, y, w, h, col = '#f3f1ff', line = '#9d8cf0') { g.fillStyle = col; rr(g, x, y, w, h, h * 0.12); g.fill(); g.strokeStyle = line; g.lineWidth = Math.max(2, h * 0.06); g.beginPath(); g.moveTo(x + w * 0.06, y + h * 0.12); g.lineTo(x + w / 2, y + h * 0.58); g.lineTo(x + w * 0.94, y + h * 0.12); g.stroke(); }
function gLock(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -22, -6, 44, 34, 6); g.fill(); g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.arc(0, -6, 14, Math.PI, 0); g.stroke(); g.restore(); }
function gPin(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -12, 20, Math.PI * 0.85, Math.PI * 0.15); g.lineTo(0, 30); g.closePath(); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, -12, 8, 0, Math.PI * 2); g.fill(); g.restore(); }
function gLink(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.7); g.strokeStyle = col; g.lineWidth = 9; for (const dx of [-17, 17]) { rr(g, dx - 22, -13, 44, 26, 13); g.stroke(); } g.restore(); }
function gCal(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -24, -20, 48, 44, 7); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(-18, -6, 36, 24); g.fillStyle = col; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.fillRect(-14 + i * 11, -1 + j * 10, 7, 6); g.fillRect(-14, -28, 6, 12); g.fillRect(8, -28, 6, 12); g.restore(); }
function gBubble(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -4, 26, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(-18, 12); g.lineTo(-26, 28); g.lineTo(-4, 20); g.fill(); g.fillStyle = '#ffffff'; for (const dx of [-10, 0, 10]) { g.beginPath(); g.arc(dx, -4, 3.5, 0, Math.PI * 2); g.fill(); } g.restore(); }
function gNoPhone(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#ffffff'; g.lineWidth = 6; rr(g, -14, -24, 28, 48, 6); g.stroke(); g.strokeStyle = P.magenta; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-24, 24); g.lineTo(24, -24); g.stroke(); g.restore(); }
function gDownload(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(0, -34); g.lineTo(0, 10); g.stroke(); g.beginPath(); g.moveTo(-18, -8); g.lineTo(0, 12); g.lineTo(18, -8); g.stroke(); g.beginPath(); g.moveTo(-30, 14); g.lineTo(-30, 30); g.lineTo(30, 30); g.lineTo(30, 14); g.stroke(); g.restore(); }
function gSpark(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, q = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); }
function gNote(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.ellipse(-14, 22, 12, 9, -0.4, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(18, 14, 12, 9, -0.4, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(-4, 20); g.lineTo(-4, -24); g.lineTo(28, -32); g.lineTo(28, 12); g.stroke(); g.restore(); }
function gWifi(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 7; g.lineCap = 'round'; for (const r of [14, 28, 42]) { g.beginPath(); g.arc(0, 16, r, -Math.PI * 0.78, -Math.PI * 0.22); g.stroke(); } g.beginPath(); g.arc(0, 16, 5, 0, Math.PI * 2); g.fill(); g.restore(); }
function gPlaneTop(g, x, y, s, col, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.moveTo(0, -30); g.quadraticCurveTo(6, -26, 6, -14); g.lineTo(6, -4); g.lineTo(34, 8); g.lineTo(34, 14); g.lineTo(6, 8); g.lineTo(5, 22); g.lineTo(14, 28); g.lineTo(14, 32); g.lineTo(0, 29); g.lineTo(-14, 32); g.lineTo(-14, 28); g.lineTo(-5, 22); g.lineTo(-6, 8); g.lineTo(-34, 14); g.lineTo(-34, 8); g.lineTo(-6, -4); g.lineTo(-6, -14); g.quadraticCurveTo(-6, -26, 0, -30); g.fill(); g.restore(); }
function gKeys(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 6; rr(g, -60, -34, 120, 68, 10); g.stroke(); g.fillStyle = col; for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) g.fillRect(-50 + c * 17 + (r === 1 ? 6 : 0), -24 + r * 17, 11, 11); g.restore(); }
// a QR-style pattern (procedural, illustrative only — it encodes nothing)
const QR = (() => { const n = 25, m = []; let s = 11; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647); for (let y = 0; y < n; y++) { m.push([]); for (let x = 0; x < n; x++) m[y].push(rnd() > 0.52); }
  for (const [ox, oy] of [[0, 0], [n - 7, 0], [0, n - 7]]) for (let y = -1; y < 8; y++) for (let x = -1; x < 8; x++) { const X = ox + x, Y = oy + y; if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const ring = Math.max(Math.abs(x - 3), Math.abs(y - 3)); m[Y][X] = x >= 0 && y >= 0 && x < 7 && y < 7 && ring !== 2; } return m; })();
function drawQR(g, x, y, size, col = '#0d1240') { const n = QR.length, c = size / n; g.fillStyle = '#ffffff'; rr(g, x - c * 1.5, y - c * 1.5, size + c * 3, size + c * 3, c * 2); g.fill(); g.fillStyle = col; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) if (QR[j][i]) g.fillRect(x + i * c, y + j * c, c + 0.5, c + 0.5); }
function brackets(g, x, y, w, h, col, lw = 6, k = 0.22) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; for (const [cx, cy, dx, dy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) { g.beginPath(); g.moveTo(cx, cy + dy * h * k); g.lineTo(cx, cy); g.lineTo(cx + dx * w * k, cy); g.stroke(); } }
const TILES = [['Trip mix', '#7c3fda'], ['Road songs', '#2a9fbf'], ['Podcast · Ep. 12', '#d23d7c'], ['Audiobook', '#552dbc']];
function tileArt(g, x, y, s, i) { const [name, col] = TILES[i]; g.fillStyle = col; rr(g, x, y, s, s, s * 0.1); g.fill(); g.save(); g.globalAlpha = 0.35; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x + s * 0.72, y + s * 0.3, s * 0.22, 0, Math.PI * 2); g.fill(); g.restore(); gNote(g, x + s * 0.42, y + s * 0.52, s / 130, '#ffffff'); }

// ------------------------------------------------------------------ desk calendar (accepted prop; pages hinge over to NOV 5)
const CAL = { x: -3.3, z: -0.75 };
const cal = new THREE.Group(); cal.position.set(CAL.x, DESK, CAL.z); cal.rotation.y = 0.25; scene.add(cal);
{ const base = card(1.25, 0.12, 0.7, P.violet, P.edge); base.position.y = 0.06; cal.add(base);
  const back = card(1.2, 1.35, 0.05, P.violet2, P.edge, 'z'); back.position.set(0, 0.78, -0.18); back.rotation.x = -0.18; cal.add(back);
  for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 16), paper(P.white)); ring.position.set(-0.3 + i * 0.6, 1.43, -0.27); cal.add(ring); } }
const calPages = [3, 4, 5].map((d, i) => { const hinge = new THREE.Group(); hinge.position.set(0, 1.42, -0.235 + (2 - i) * 0.004); hinge.rotation.x = -0.18; cal.add(hinge);
  const tex = canvasTex(400, 440, (g, w, h) => { g.fillStyle = '#f3f1ff'; g.fillRect(0, 0, w, h); g.fillStyle = P.magenta; g.fillRect(0, 0, w, 96); g.fillStyle = '#ffffff'; g.font = '700 58px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NOV', w / 2, 52);
    g.fillStyle = P.ink; g.font = '700 230px "Space Grotesk"'; g.fillText(String(d), w / 2, 270); g.fillStyle = '#9d8cf0'; g.fillRect(60, 400, w - 120, 6); });
  const pg = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.24, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#e6e2ff')]);
  pg.position.set(0, -0.64, 0); pg.castShadow = true; hinge.add(pg); return hinge; }).reverse();
const srcCard = new THREE.Group(); srcCard.position.set(-3.1, DESK, 0.22); srcCard.rotation.y = 0.12; scene.add(srcCard);
const srcHinge = new THREE.Group(); srcCard.add(srcHinge);
{ const tex = canvasTex(640, 300, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 26); g.fill(); g.fillStyle = P.magenta; rr(g, 0, 0, w, 78, 26); g.fill(); g.fillRect(0, 40, w, 38);
    g.fillStyle = '#ffffff'; g.font = '700 46px "Space Grotesk"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('SOURCE', 34, 42);
    g.fillStyle = P.ink; g.font = '700 56px "Space Grotesk"'; g.fillText('Spotify Newsroom', 34, 146); g.fillStyle = '#552dbc'; g.font = '600 48px "Plex Mono"'; g.fillText('Nov 5, 2026', 34, 228); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.6, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]);
  face.position.y = 0.36; face.castShadow = true; srcHinge.add(face); const foot = card(1.28, 0.03, 0.4, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.16); srcCard.add(foot); }

// ------------------------------------------------------------------ the cabin: seat back with seatback screen, tray table, window
const SEAT = { z: -0.5, sy: 2.15, sw: 1.3, sh: 0.82 };
const seat = new THREE.Group(); seat.position.set(0, DESK, SEAT.z); scene.add(seat);
{ const sh = new THREE.Shape(); sh.moveTo(-0.85, 0); sh.lineTo(-0.85, 2.55); sh.quadraticCurveTo(-0.85, 2.85, -0.55, 2.88); sh.lineTo(-0.42, 2.88); sh.quadraticCurveTo(-0.4, 3.2, 0, 3.22); sh.quadraticCurveTo(0.4, 3.2, 0.42, 2.88); sh.lineTo(0.55, 2.88); sh.quadraticCurveTo(0.85, 2.85, 0.85, 2.55); sh.lineTo(0.85, 0); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }); const m = new THREE.Mesh(geo, [paper('#2c2f86'), paper(P.lav)]); m.position.z = -0.14; m.castShadow = true; m.receiveShadow = true; seat.add(m);
  const cover = card(0.86, 0.36, 0.01, '#f3f1ff', P.white, 'z'); cover.position.set(0, 2.98, 0.02); seat.add(cover);   // headrest cover
  const bezel = card(SEAT.sw + 0.12, SEAT.sh + 0.12, 0.04, '#0d1240', P.lav, 'z'); bezel.position.set(0, SEAT.sy, 0.02); seat.add(bezel);
  const pocket = card(1.3, 0.5, 0.05, '#24287e', P.lav, 'z'); pocket.position.set(0, 0.55, 0.03); seat.add(pocket); }
const seatCv = document.createElement('canvas'); seatCv.width = 832; seatCv.height = 525; const sg = seatCv.getContext('2d'); const seatTex = new THREE.CanvasTexture(seatCv); seatTex.colorSpace = THREE.SRGBColorSpace; seatTex.anisotropy = 8;
{ const scr = new THREE.Mesh(new THREE.PlaneGeometry(SEAT.sw, SEAT.sh), new THREE.MeshStandardMaterial({ map: seatTex, emissive: '#ffffff', emissiveMap: seatTex, emissiveIntensity: 0.7, roughness: 0.8 })); scr.position.set(0, SEAT.sy, 0.045); seat.add(scr); }
const seatPt = (cx, cy, dz = 0.06) => { seat.updateMatrixWorld(true); return seat.localToWorld(V3((cx / 832 - 0.5) * SEAT.sw, SEAT.sy + (0.5 - cy / 525) * SEAT.sh, dz)); };
// tray table (down) with its arms
const TRAY = { y: 1.06 };
{ const tray = card(1.25, 0.05, 0.7, '#3d46b5', P.lav); tray.position.set(0, TRAY.y, SEAT.z + 0.4); scene.add(tray);
  for (const x of [-0.66, 0.66]) { const arm = card(0.05, 0.05, 0.7, P.lav, P.white); arm.position.set(x, TRAY.y - 0.02, SEAT.z + 0.4); scene.add(arm); const post = card(0.05, TRAY.y - 0.6, 0.05, P.lav, P.white, 'x'); post.position.set(x, (TRAY.y + 0.6) / 2, SEAT.z + 0.06); scene.add(post); } }
// window wall with an oval window and drifting clouds
const win = new THREE.Group(); win.position.set(-1.35, DESK, -0.25); win.rotation.y = 0.55; scene.add(win);
const winCv = document.createElement('canvas'); winCv.width = 300; winCv.height = 420; const wg = winCv.getContext('2d'); const winTex = new THREE.CanvasTexture(winCv); winTex.colorSpace = THREE.SRGBColorSpace;
{ const wall = card(1.0, 3.0, 0.06, '#e9e5ff', P.lav, 'z'); wall.position.y = 1.5; win.add(wall);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.84), new THREE.MeshStandardMaterial({ map: winTex, emissive: '#ffffff', emissiveMap: winTex, emissiveIntensity: 0.55, roughness: 0.6, transparent: true })); glass.position.set(0, 2.0, 0.035); win.add(glass);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.035, 10, 48), paper('#cfc8ff')); ring.scale.set(0.95, 1.33, 1); ring.position.set(0, 2.0, 0.045); ring.castShadow = true; win.add(ring); }
let wKey = '';
function drawWindow(t) { const k = String(Math.round(t * 15)); if (k === wKey) return; wKey = k; const g = wg; g.clearRect(0, 0, 300, 420); g.save(); g.beginPath(); g.ellipse(150, 210, 138, 198, 0, 0, Math.PI * 2); g.clip();
  const sky = g.createLinearGradient(0, 0, 0, 420); sky.addColorStop(0, '#5d7bf0'); sky.addColorStop(1, '#bfe6ff'); g.fillStyle = sky; g.fillRect(0, 0, 300, 420);
  g.fillStyle = '#ffffff'; for (let i = 0; i < 5; i++) { const x = ((i * 137 - t * 70) % 560 + 560) % 560 - 130, y = 90 + i * 64; for (const [dx, dy, r] of [[0, 0, 36], [34, -12, 30], [64, 4, 26], [-30, 8, 24]]) { g.beginPath(); g.arc(x + dx, y + dy, r, 0, Math.PI * 2); g.fill(); } }
  g.restore(); winTex.needsUpdate = true; }

// ------------------------------------------------------------------ the phone on the tray table (generic screens)
const PH = { w: 1.22, h: 2.3, sw: 1.08, sh: 2.12, cw: 540, ch: 1060 }; PH.cy = PH.h / 2 + 0.06;
function makePhone(x, y, z, ry, sc) {
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; grp.scale.setScalar(sc); scene.add(grp);
  const tilt = new THREE.Group(); tilt.rotation.x = -0.12; grp.add(tilt);
  const b = card(PH.w, PH.h, 0.08, P.navy2, P.lav, 'z'); b.position.y = PH.cy; tilt.add(b);
  const cv = document.createElement('canvas'); cv.width = PH.cw; cv.height = PH.ch; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(PH.sw, PH.sh), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.6, roughness: 0.85 })); scr.position.set(0, PH.cy, 0.041); tilt.add(scr);
  const strut = card(0.5, 1.2, 0.05, P.violet, P.edge, 'z'); strut.position.set(0, 0.6, -0.48); strut.rotation.x = 0.42; grp.add(strut);
  const foot = card(1.1, 0.06, 0.75, P.violet, P.edge); foot.position.set(0, 0.03, -0.12); grp.add(foot);
  const lip = card(1.1, 0.1, 0.06, P.violet2, P.edge, 'z'); lip.position.set(0, 0.1, 0.1); grp.add(lip);
  return { grp, tilt, g: cv.getContext('2d'), tex, key: '' };
}
const scrPt = (ph, cx, cy, dz = 0.06) => { ph.grp.updateMatrixWorld(true); return ph.tilt.localToWorld(V3((cx / PH.cw - 0.5) * PH.sw, PH.cy + (0.5 - cy / PH.ch) * PH.sh, dz)); };
const PHONE = makePhone(0.43, TRAY.y + 0.025, SEAT.z + 0.52, -0.12, 0.4);
function statusBar(g, dark) { g.fillStyle = dark ? '#0d1240' : '#efecff'; g.fillRect(0, 0, PH.cw, PH.ch); g.fillStyle = '#24287e'; g.fillRect(0, 0, PH.cw, 50); g.fillStyle = '#c9bfff'; g.font = '600 26px "Plex Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 24, 26);
  for (let i = 0; i < 3; i++) g.fillRect(PH.cw - 92 + i * 10, 34 - i * 5, 6, 6 + i * 5); rr(g, PH.cw - 52, 16, 30, 18, 4); g.fill(); }
function header(g, title) { g.fillStyle = '#3d46b5'; g.fillRect(0, 50, PH.cw, 110); g.fillStyle = '#ffffff'; g.font = '700 46px "Space Grotesk"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(title, 34, 106); }
function phoneDraw(ph, s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 30) / 30 : v)); if (key === ph.key) return; ph.key = key;
  const g = ph.g; g.textAlign = 'left'; g.textBaseline = 'middle';
  if (s.mode === 'camera') {
    statusBar(g, true); drawQR(g, 120, 300, 300); const p = clamp(s.scan); brackets(g, 90, 270, 360, 360, p > 0 ? P.cyan : '#ffffff', 8);
    if (p > 0 && p < 1) { g.fillStyle = 'rgba(42,221,250,0.85)'; g.fillRect(96, 276 + 348 * p, 348, 6); }
    if (s.ok > 0) { g.save(); g.globalAlpha = clamp(s.ok); g.fillStyle = '#ffffff'; rr(g, 40, 720, 460, 120, 26); g.fill(); gNote(g, 100, 780, 0.9, '#7c3fda'); g.fillStyle = P.ink; g.font = '700 34px "Space Grotesk"'; g.fillText('Log in to seatback?', 150, 764); g.fillStyle = P.magenta; rr(g, 150, 786, 170, 40, 20); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 24px "Space Grotesk"'; g.fillText('Confirm', 190, 807); g.restore(); }
    g.fillStyle = '#c9bfff'; g.font = '700 30px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('Point at the QR code', 270, 920); g.textAlign = 'left';
  } else if (s.mode === 'wifi') {
    statusBar(g); header(g, 'Wi-Fi');
    const nets = [['United', true], ['Gate-B12', false], ['Airport_Free', false]];
    nets.forEach(([n, mine], i) => { const y = 200 + i * 120; g.fillStyle = '#ffffff'; rr(g, 24, y, 492, 100, 22); g.fill(); if (mine && s.tap > 0) { g.strokeStyle = P.cyan; g.lineWidth = 6; g.stroke(); } gWifi(g, 78, y + 46, 0.85, mine ? '#552dbc' : '#b9b4dc'); g.fillStyle = mine ? P.ink : '#9d9bbd'; g.font = '700 38px "Space Grotesk"'; g.fillText(n, 134, y + 40);
      if (mine) { g.fillStyle = s.tap >= 1 ? '#2a9fbf' : '#7a74b8'; g.font = '600 26px "Space Grotesk"'; g.fillText(s.tap >= 1 ? 'Connected' : 'Tap to join', 134, y + 76); if (s.tap >= 1) sCheck(g, 470, y + 50, 22, 1); } });
    const np = clamp(s.nopass); if (np > 0) { g.save(); g.globalAlpha = np; g.translate(0, 20 * (1 - outC(np))); g.fillStyle = '#ffffff'; rr(g, 24, 580, 492, 200, 26); g.fill(); g.strokeStyle = P.magenta; g.lineWidth = 5; g.stroke(); gLock(g, 80, 650, 1.0, '#9d9bbd');
      g.strokeStyle = P.magenta; g.lineWidth = 7; g.beginPath(); g.moveTo(52, 690); g.lineTo(108, 618); g.stroke(); g.fillStyle = P.ink; g.font = '700 38px "Space Grotesk"'; g.fillText('No Wi-Fi pass', 134, 636); g.fillStyle = '#7a74b8'; g.font = '600 28px "Space Grotesk"'; g.fillText('needed for the seatback', 134, 680); g.fillText('Spotify app', 134, 716); g.restore(); }
  } else if (s.mode === 'pass') {
    statusBar(g); header(g, 'Your account');
    g.fillStyle = '#552dbc'; g.font = '700 30px "Space Grotesk"'; g.fillText('Password', 34, 220); g.fillStyle = '#ffffff'; rr(g, 24, 248, 492, 96, 22); g.fill(); g.strokeStyle = P.cyan; g.lineWidth = 5; g.stroke(); g.fillStyle = P.ink; g.font = '700 60px "Space Grotesk"'; g.fillText('••••••••', 56, 300);
    const st = clamp(s.stay); if (st > 0) { g.save(); g.globalAlpha = st; g.fillStyle = '#ffffff'; rr(g, 24, 380, 492, 150, 26); g.fill(); gLock(g, 86, 450, 1.3, '#2a9fbf'); g.fillStyle = P.ink; g.font = '700 36px "Space Grotesk"'; g.fillText('Stays on', 150, 434); g.fillText('your phone', 150, 476); g.restore(); }
    const lo = clamp(s.out); if (lo > 0) { g.save(); g.globalAlpha = lo; g.fillStyle = '#ffffff'; rr(g, 24, 570, 492, 130, 26); g.fill(); sCheck(g, 82, 635, 28, lo); g.fillStyle = P.ink; g.font = '700 34px "Space Grotesk"'; g.fillText('Seatback logged out', 128, 636); g.restore(); }
  } else if (s.mode === 'remote') {
    statusBar(g, true); g.fillStyle = '#c9bfff'; g.font = '700 32px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('Playing on seatback', 270, 130);
    tileArt(g, 120, 190, 300, 2); g.fillStyle = '#ffffff'; g.font = '700 38px "Space Grotesk"'; g.fillText('Podcast · Ep. 12', 270, 560);
    g.fillStyle = '#3d46b5'; rr(g, 60, 610, 420, 14, 7); g.fill(); g.fillStyle = P.cyan; rr(g, 60, 610, 420 * s.prog, 14, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(240, 680); g.lineTo(240, 760); g.lineTo(300, 720); g.closePath(); g.fill(); g.textAlign = 'left';
  }
  ph.tex.needsUpdate = true;
}

// ------------------------------------------------------------------ seatback screen modes
let sKey = '';
function seatDraw(s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 30) / 30 : v)); if (key === sKey) return; sKey = key;
  const g = sg, W_ = 832, H_ = 525; g.fillStyle = '#0d1240'; g.fillRect(0, 0, W_, H_); g.textAlign = 'left'; g.textBaseline = 'middle';
  const top = (title) => { g.fillStyle = '#24287e'; g.fillRect(0, 0, W_, 70); gNote(g, 46, 36, 0.6, P.cyan); g.fillStyle = '#ffffff'; g.font = '700 34px "Space Grotesk"'; g.fillText(title, 84, 37); };
  if (s.mode === 'menu') {
    g.fillStyle = '#24287e'; g.fillRect(0, 0, W_, 70); g.fillStyle = '#ffffff'; g.font = '700 34px "Space Grotesk"'; g.fillText('Entertainment', 30, 37);
    const items = [['Movies', '#3d46b5'], ['TV', '#3d46b5'], ['Map', '#3d46b5'], ['Spotify', '#7c3fda']];
    items.forEach(([n, col], i) => { const x = 30 + i * 198, y = 120; const hi = i === 3 ? clamp(s.hi) : 0; g.save(); if (hi > 0) { g.translate(x + 87, y + 120); g.scale(1 + 0.08 * hi, 1 + 0.08 * hi); g.translate(-x - 87, -y - 120); }
      g.fillStyle = col; rr(g, x, y, 174, 240, 20); g.fill(); if (hi > 0) { g.strokeStyle = P.cyan; g.lineWidth = 8; g.stroke(); }
      if (i === 0) { g.fillStyle = '#c9bfff'; g.beginPath(); g.moveTo(x + 66, y + 80); g.lineTo(x + 66, y + 150); g.lineTo(x + 120, y + 115); g.fill(); }
      else if (i === 1) { g.strokeStyle = '#c9bfff'; g.lineWidth = 7; rr(g, x + 42, y + 78, 90, 64, 8); g.stroke(); }
      else if (i === 2) gPlaneTop(g, x + 87, y + 112, 1.1, '#c9bfff', 0.6);
      else gNote(g, x + 84, y + 110, 1.2, '#ffffff');
      g.fillStyle = '#ffffff'; g.font = '700 30px "Space Grotesk"'; g.textAlign = 'center'; g.fillText(n, x + 87, y + 205); g.textAlign = 'left'; g.restore(); });
    g.fillStyle = '#9d8cf0'; g.font = '600 24px "Space Grotesk"'; g.fillText('Your own account, with a QR code', 30, 430);
  } else if (s.mode === 'qr') {
    top('Spotify'); drawQR(g, 60, 120, 300); const p = clamp(s.scan); if (p > 0) brackets(g, 40, 100, 340, 340, P.cyan, 7);
    g.fillStyle = '#ffffff'; g.font = '700 40px "Space Grotesk"'; g.fillText('Log in with', 420, 200); g.fillText('your phone', 420, 250); g.fillStyle = '#9d8cf0'; g.font = '600 28px "Space Grotesk"'; g.fillText('Scan the code', 420, 310);
    if (s.dim > 0) { g.fillStyle = `rgba(13,18,64,${0.88 * clamp(s.dim)})`; g.fillRect(0, 0, W_, H_); }
    if (s.ok > 0) { g.save(); g.globalAlpha = clamp(s.ok); g.fillStyle = 'rgba(13,18,64,0.85)'; g.fillRect(0, 70, W_, H_); sCheck(g, 416, 280, 60, clamp(s.ok)); g.fillStyle = '#ffffff'; g.font = '700 40px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('Connected', 416, 390); g.textAlign = 'left'; g.restore(); }
  } else if (s.mode === 'library' || s.mode === 'nopw') {
    top('Your Library'); const a = clamp(s.tiles);
    for (let i = 0; i < 4; i++) { const u = clamp(a * 4 - i); if (u <= 0) continue; const x = 30 + i * 198, y = 96; g.save(); g.globalAlpha = u; g.translate(0, 30 * (1 - outC(u))); tileArt(g, x, y, 174, i); g.fillStyle = '#ffffff'; g.font = '700 24px "Space Grotesk"'; g.fillText(TILES[i][0], x + 2, y + 200); g.restore(); }
    const c = clamp(s.cont); if (c > 0) { g.save(); g.globalAlpha = c; g.fillStyle = '#24287e'; rr(g, 30, 330, 772, 160, 22); g.fill(); if (s.glow > 0) { g.strokeStyle = P.cyan; g.lineWidth = 6 * clamp(s.glow); g.stroke(); }
      g.fillStyle = '#9d8cf0'; g.font = '700 24px "Space Grotesk"'; g.fillText('CONTINUE LISTENING', 56, 362); g.fillStyle = '#ffffff'; g.font = '700 34px "Space Grotesk"'; g.fillText('Podcast · Ep. 12', 56, 406);
      g.fillStyle = '#3d46b5'; rr(g, 56, 446, 600, 14, 7); g.fill(); g.fillStyle = P.cyan; rr(g, 56, 446, 600 * s.prog, 14, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(56 + 600 * s.prog, 453, 12, 0, Math.PI * 2); g.fill();
      g.font = '600 24px "Plex Mono"'; g.fillStyle = '#c9bfff'; g.fillText(`${Math.floor(s.left / 60)}:${String(Math.floor(s.left % 60)).padStart(2, '0')} left`, 676, 455); g.restore(); }
    if (s.mode === 'nopw') { const n = clamp(s.nopw); g.save(); g.globalAlpha = 0.9 * n; g.fillStyle = 'rgba(13,18,64,0.9)'; g.fillRect(0, 70, W_, H_); g.globalAlpha = n; gKeys(g, 200, 220, 2.0, '#c9bfff'); g.strokeStyle = P.magenta; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(90, 320); g.lineTo(310, 120); g.stroke();
      g.fillStyle = '#ffffff'; g.font = '700 40px "Space Grotesk"'; g.fillText('No password', 50, 400); g.fillText('typed here', 50, 450); g.restore(); }
  } else if (s.mode === 'map') {
    g.fillStyle = '#1b2170'; g.fillRect(0, 0, W_, H_); g.fillStyle = '#24287e'; g.fillRect(0, 0, W_, 70); g.fillStyle = '#ffffff'; g.font = '700 34px "Space Grotesk"'; g.fillText('Flight map', 30, 37);
    g.fillStyle = '#2c3a9a'; for (const [x, y, w, h] of [[60, 140, 260, 200], [380, 120, 180, 150], [600, 220, 200, 230]]) { rr(g, x, y, w, h, 60); g.fill(); }
    const A = [120, 380], B = [700, 230], C = [410, 90]; g.strokeStyle = '#9d8cf0'; g.lineWidth = 5; g.setLineDash([14, 12]); g.beginPath(); g.moveTo(...A); g.quadraticCurveTo(...C, ...B); g.stroke(); g.setLineDash([]);
    const u = clamp(s.fly), q = (a, b, c) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c; const px = q(A[0], C[0], B[0]), py = q(A[1], C[1], B[1]); const dx = 2 * (1 - u) * (C[0] - A[0]) + 2 * u * (B[0] - C[0]), dy = 2 * (1 - u) * (C[1] - A[1]) + 2 * u * (B[1] - C[1]);
    for (const [x, y] of [A, B]) { g.fillStyle = P.magenta; g.beginPath(); g.arc(x, y, 12, 0, Math.PI * 2); g.fill(); } gPlaneTop(g, px, py, 1.1, '#ffffff', Math.atan2(dy, dx) + Math.PI / 2);
    const lo = clamp(s.out); if (lo > 0) { g.save(); g.globalAlpha = lo; g.fillStyle = 'rgba(13,18,64,0.9)'; g.fillRect(0, 70, W_, H_); sCheck(g, 416, 250, 56, lo); g.fillStyle = '#ffffff'; g.font = '700 42px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('Logged out', 416, 350); g.fillStyle = '#9d8cf0'; g.font = '600 28px "Space Grotesk"'; g.fillText('Screen reset for the next passenger', 416, 400); g.textAlign = 'left'; g.restore(); }
  }
  seatTex.needsUpdate = true;
}
// scan beam (dotted arc from the phone to the seatback's QR code)
const beamMat = new THREE.MeshBasicMaterial({ color: P.cyan, transparent: true, opacity: 0.9 }); let beam = null;

// ------------------------------------------------------------------ the fleet (S7): paper planes, Starlink ones light up
const FLEET = { x: 4.0, z: 1.45 };
const planeShape = (() => { const s = new THREE.Shape(); const pts = [[0, -0.5], [0.07, -0.42], [0.08, -0.12], [0.5, 0.08], [0.5, 0.16], [0.08, 0.06], [0.06, 0.34], [0.2, 0.44], [0.2, 0.5], [0, 0.46], [-0.2, 0.5], [-0.2, 0.44], [-0.06, 0.34], [-0.08, 0.06], [-0.5, 0.16], [-0.5, 0.08], [-0.08, -0.12], [-0.07, -0.42]]; pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; })();
const planeGeo = new THREE.ExtrudeGeometry(planeShape, { depth: 0.05, bevelEnabled: false }); planeGeo.rotateX(-Math.PI / 2);
const offPlane = paper('#8a8fb8'), onPlane = paper('#f3f1ff', { emissive: P.cyan, emissiveIntensity: 0.35 });
const dishOff = new THREE.MeshBasicMaterial({ color: '#5a5f8f' }), dishOn = new THREE.MeshBasicMaterial({ color: P.cyan });
const noteTex = canvasTex(128, 128, (g) => { g.fillStyle = '#7c3fda'; rr(g, 0, 0, 128, 128, 26); g.fill(); gNote(g, 62, 64, 1.05, '#ffffff'); });
const fleet = [[-0.75, -0.45], [0.0, -0.55], [0.75, -0.45], [-0.75, 0.55], [0.0, 0.45], [0.75, 0.55]].map(([dx, dz], i) => { const grp = new THREE.Group(); grp.position.set(FLEET.x + dx, DESK, FLEET.z + dz); grp.rotation.y = 0.5 + i * 0.07; scene.add(grp);
  const body = new THREE.Mesh(planeGeo, offPlane); body.position.y = 0.01; body.castShadow = true; body.receiveShadow = true; grp.add(body);
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 20), dishOff); dish.position.set(0, 0.075, -0.18); grp.add(dish);
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: noteTex, emissive: '#ffffff', emissiveMap: noteTex, emissiveIntensity: 0.3, roughness: 0.9 }), paper('#cfc8ff')]); badge.castShadow = true; scene.add(badge);
  return { grp, body, dish, badge }; });
const runway = card(2.6, 0.02, 2.0, '#2a2f72', P.lav); runway.position.set(FLEET.x, DESK + 0.0, FLEET.z); scene.add(runway);
const banner = new THREE.Group(); banner.position.set(FLEET.x, DESK, FLEET.z - 1.35); scene.add(banner);
const bnCv = document.createElement('canvas'); bnCv.width = 760; bnCv.height = 220; const bng = bnCv.getContext('2d'); const bnTex = new THREE.CanvasTexture(bnCv); bnTex.colorSpace = THREE.SRGBColorSpace;
{ const face = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: bnTex, emissive: '#ffffff', emissiveMap: bnTex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = 0.6; face.castShadow = true; banner.add(face);
  for (const x of [-0.7, 0.7]) { const st = card(0.05, 0.34, 0.04, P.edge, P.white, 'z'); st.position.set(x, 0.17, 0); banner.add(st); } }
let bnKey = '';
function drawBanner(p) { const k = String(Math.round(p * 60)); if (k === bnKey) return; bnKey = k; const g = bng; g.fillStyle = '#f3f1ff'; rr(g, 0, 0, 760, 220, 30); g.fill(); g.fillStyle = P.ink; g.font = '700 54px "Space Grotesk"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('Starlink planes first', 40, 58);
  g.fillStyle = '#552dbc'; g.font = '600 36px "Space Grotesk"'; g.fillText('more aircraft through 2027', 40, 116); g.fillStyle = '#d8d2ff'; rr(g, 40, 160, 680, 34, 17); g.fill(); g.fillStyle = P.cyan; if (p > 0.03) { rr(g, 40, 160, 680 * p, 34, 17); g.fill(); } bnTex.needsUpdate = true; }

// ------------------------------------------------------------------ the Media Diet paper sign (signature, CTA shot — accepted prop)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.15, DESK, 2.4);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const CABIN = (u) => SH(L3([0.12, 2.5, 3.75], [0.1, 2.45, 3.5], u), V3(-0.05, 2.04, -0.4), 48);
const SCREEN = (u, dx = 0) => SH(L3([0.05 + dx, 2.55, 2.8], [0.03 + dx, 2.53, 2.6], u), V3(0, 2.32, -0.5), 46);
const SHOTS = {
  S1: (t) => CABIN(prog(t, 0, 3.1)),
  S2: (t) => { const u = prog(t, 3.1, 5.85); return SH(L3([-3.12, 1.65, 3.45], [-3.15, 1.6, 3.2], u), V3(-3.12, 0.82, -0.2), 50); },
  S3: (t) => SCREEN(prog(t, 5.85, 7.87)),
  S4: (t) => { const a = SH(L3([0.52, 2.6, 1.72], [0.5, 2.55, 1.56], prog(t, 7.87, 10.4)), V3(0.44, 1.72, 0.0), 46), b = CABIN(prog(t, 10.9, 12.39)), u = prog(t, 10.35, 10.95); return SH(a.pos.clone().lerp(b.pos, u), a.look.clone().lerp(b.look, u), lerp(a.fov, b.fov, u)); },
  S5: (t) => SCREEN(prog(t, 12.39, 16.16), -0.12),
  S6: (t) => { const u = prog(t, 16.16, 20.57); return SH(L3([-0.62, 2.38, 2.9], [-0.6, 2.35, 2.7], u), V3(0.02, 2.08, -0.35), 48); },
  S7: (t) => { const u = prog(t, 20.57, 25.9); return SH(L3([4.0, 3.75, 5.6], [4.0, 3.6, 5.35], u), V3(4.0, 0.3, 1.15), 48); },
  S8: (t) => { const u = prog(t, 25.9, 29.6); return SH(L3([0.25, 3.1, 8.6], [0.35, 3.9, 9.7], u), L3([0.0, 1.1, 0.4], [0.0, 1.15, 0.1], u), 48, lerp(7.2, 8.4, u)); },
};

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;
  drawWindow(t);
  const lib = (t0) => ({ tiles: prog(t, t0, t0 + 0.8, (x) => x), cont: prog(t, t0 + 0.6, t0 + 0.9) });
  // seatback + phone per beat
  if (id === 'S1') { if (t < E.hookOk + 0.35) { seatDraw({ mode: 'qr', scan: prog(t, E.hookScan, E.hookScan + 0.5), ok: prog(t, E.hookOk, E.hookOk + 0.3) }); } else { seatDraw({ mode: 'library', ...lib(E.hookOk + 0.35), prog: 0.61, left: 1421, glow: 0 }); }
    phoneDraw(PHONE, { mode: 'camera', scan: prog(t, E.hookScan, E.hookScan + 0.5, (x) => x), ok: 0 }); }
  else if (id === 'S2' || id === 'S3') { seatDraw({ mode: 'menu', hi: prog(t, E.menuHi, E.menuHi + 0.35, outBack) }); phoneDraw(PHONE, { mode: 'wifi', tap: 0, nopass: 0 }); }
  else if (id === 'S4') { if (t < 10.4) { seatDraw({ mode: 'qr', scan: 0, ok: 0, dim: 1 - prog(t, 10.1, 10.4) }); phoneDraw(PHONE, { mode: 'wifi', tap: prog(t, E.wifiTap, E.wifiTap + 0.25), nopass: prog(t, E.noPass, E.noPass + 0.35) }); }
    else { seatDraw({ mode: 'qr', scan: prog(t, E.scan, E.scan + 0.5), ok: prog(t, E.scanOk, E.scanOk + 0.3) }); phoneDraw(PHONE, { mode: 'camera', scan: prog(t, E.scan, E.scan + 0.5, (x) => x), ok: prog(t, E.scanOk - 0.2, E.scanOk + 0.1) }); } }
  else if (id === 'S5') { const pr = lerp(0.61, 0.66, prog(t, E.resume, 16.16, (x) => x)); seatDraw({ mode: 'library', ...lib(12.45), prog: pr, left: Math.round(1421 - (pr - 0.61) * 3640), glow: Math.sin(Math.PI * clamp((t - E.resume) / 0.8)) }); phoneDraw(PHONE, { mode: 'remote', prog: pr }); }
  else if (id === 'S6') { if (t < E.mapAt) seatDraw({ mode: 'nopw', tiles: 1, cont: 1, prog: 0.66, left: 1239, glow: 0, nopw: prog(t, E.nopw, E.nopw + 0.35) }); else seatDraw({ mode: 'map', fly: prog(t, E.mapAt, E.land, (x) => ease(x)), out: prog(t, E.logout, E.logout + 0.3) });
    phoneDraw(PHONE, { mode: 'pass', stay: prog(t, E.stay, E.stay + 0.35), out: prog(t, E.logout + 0.15, E.logout + 0.45) }); }
  else { seatDraw({ mode: 'qr', scan: 0, ok: 0 }); phoneDraw(PHONE, { mode: 'pass', stay: 1, out: 1 }); }
  // scan beam: dotted arc from the phone's top to the QR code while scanning
  { if (beam) { scene.remove(beam); beam.geometry.dispose(); beam = null; } const scanT = id === 'S1' ? E.hookScan : id === 'S4' && t >= 10.4 ? E.scan : -1;
    if (scanT >= 0 && t >= scanT - 0.05 && t < scanT + 0.75) { const a = scrPt(PHONE, 270, 40, -0.1), b = seatPt(210, 270, 0.08); const curve = new THREE.QuadraticBezierCurve3(a, a.clone().lerp(b, 0.5).add(V3(0, 0.35, 0.15)), b); const d = prog(t, scanT - 0.05, scanT + 0.25);
      const gg = new THREE.TubeGeometry(curve, 40, 0.012, 6, false); gg.setDrawRange(0, Math.floor(gg.index.count * d / 3) * 3); beam = new THREE.Mesh(gg, beamMat); beamMat.opacity = 0.9 * (1 - prog(t, scanT + 0.5, scanT + 0.75)); scene.add(beam); } }
  // calendar 3 → 4 → 5, the source placard hinges up
  calPages.forEach((h, i) => { if (i === 0) return; const k = 2 - i; const u = prog(t, E.calFlip + k * 0.3, E.calFlip + k * 0.3 + 0.32); h.rotation.x = lerp(-0.18, 0.5 - Math.PI * 2, u); });
  srcCard.visible = t >= 3.1; { const u = prog(t, E.source, E.source + 0.45, outBack); srcHinge.rotation.x = -Math.PI / 2 * (1 - clamp(u, 0, 1.2)); }
  // fleet: planes pop in, Starlink planes light up first, more follow
  fleet.forEach((p, i) => { const pop = id === 'S7' ? prog(t, E.fleet + i * 0.08, E.fleet + i * 0.08 + 0.35, outBack) : t >= 25.9 ? 1 : 0; p.grp.scale.setScalar(Math.max(0.01, pop)); p.grp.visible = pop > 0.01;
    const lt = E.lit[i] >= 0 ? E.lit[i] : 1e9; const on = t >= lt; p.body.material = on ? onPlane : offPlane; p.dish.material = on ? dishOn : dishOff;
    const bs = on ? prog(t, lt, lt + 0.35, outBack) : 0; p.badge.visible = bs > 0.01 && p.grp.visible; p.grp.updateMatrixWorld(true); const bp = p.grp.localToWorld(V3(0, 0.38, 0)); p.badge.position.copy(bp).add(V3(0, 0.03 * Math.sin(t * 4 + i), 0)); p.badge.quaternion.copy(camera.quaternion); p.badge.scale.setScalar(Math.max(0.01, bs)); });
  drawBanner(lerp(0.15, 0.62, prog(t, E.more, E.more + 1.2)));
  // sign hinges up for the CTA
  const su = prog(t, E.sign, E.sign + 0.45, outBack); sign.visible = t >= E.sign - 0.1; sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(su, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}

function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = [];
  { const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H); }   // miniature vignette
  captions(t);
}

// printed cards that glow get their own print as the emissive map (a flat white glow washes them out)
scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.render = (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
