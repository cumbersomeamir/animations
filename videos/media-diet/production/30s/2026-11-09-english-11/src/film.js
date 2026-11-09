// Media Diet · 30 s English episode (english-11) — Instagram teen-detection AI goes global; suspected teens get Teen Account protections (Meta, 9 Nov 2026)
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



// ------------------------------------------------------------------ small canvas glyphs (generic; no Meta/Instagram/Facebook/Threads logos or UI)
function gEnvelope(g, x, y, w, h, col = '#f3f1ff', line = '#9d8cf0') { g.fillStyle = col; rr(g, x, y, w, h, h * 0.12); g.fill(); g.strokeStyle = line; g.lineWidth = Math.max(2, h * 0.06); g.beginPath(); g.moveTo(x + w * 0.06, y + h * 0.12); g.lineTo(x + w / 2, y + h * 0.58); g.lineTo(x + w * 0.94, y + h * 0.12); g.stroke(); }
function gLock(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -22, -6, 44, 34, 6); g.fill(); g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.arc(0, -6, 14, Math.PI, 0); g.stroke(); g.restore(); }
function gPin(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -12, 20, Math.PI * 0.85, Math.PI * 0.15); g.lineTo(0, 30); g.closePath(); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, -12, 8, 0, Math.PI * 2); g.fill(); g.restore(); }
function gLink(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.7); g.strokeStyle = col; g.lineWidth = 9; for (const dx of [-17, 17]) { rr(g, dx - 22, -13, 44, 26, 13); g.stroke(); } g.restore(); }
function gCal(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -24, -20, 48, 44, 7); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(-18, -6, 36, 24); g.fillStyle = col; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.fillRect(-14 + i * 11, -1 + j * 10, 7, 6); g.fillRect(-14, -28, 6, 12); g.fillRect(8, -28, 6, 12); g.restore(); }
function gBubble(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -4, 26, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(-18, 12); g.lineTo(-26, 28); g.lineTo(-4, 20); g.fill(); g.fillStyle = '#ffffff'; for (const dx of [-10, 0, 10]) { g.beginPath(); g.arc(dx, -4, 3.5, 0, Math.PI * 2); g.fill(); } g.restore(); }
function gNoPhone(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#ffffff'; g.lineWidth = 6; rr(g, -14, -24, 28, 48, 6); g.stroke(); g.strokeStyle = P.magenta; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-24, 24); g.lineTo(24, -24); g.stroke(); g.restore(); }
function gDownload(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(0, -34); g.lineTo(0, 10); g.stroke(); g.beginPath(); g.moveTo(-18, -8); g.lineTo(0, 12); g.lineTo(18, -8); g.stroke(); g.beginPath(); g.moveTo(-30, 14); g.lineTo(-30, 30); g.lineTo(30, 30); g.lineTo(30, 14); g.stroke(); g.restore(); }
function gSpark(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, q = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); }
function gShield2(g, x, y, s, col, tick = true) { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(0, -46); g.lineTo(38, -32); g.lineTo(34, 10); g.quadraticCurveTo(26, 36, 0, 50); g.quadraticCurveTo(-26, 36, -34, 10); g.lineTo(-38, -32); g.closePath(); g.fillStyle = col; g.fill();
  if (tick) { g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-14, 2); g.lineTo(-3, 14); g.lineTo(16, -10); g.stroke(); } g.restore(); }
function gChatLock(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -40, -34, 80, 56, 16); g.fill(); g.beginPath(); g.moveTo(-20, 20); g.lineTo(-30, 40); g.lineTo(-2, 22); g.fill(); g.restore(); gLock(g, x + 26 * s, y + 18 * s, 0.8 * s, '#ffffff'); }
function gEyeFilter(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -40, -34, 80, 68, 12); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(-28, 22); g.lineTo(-8, -6); g.lineTo(6, 10); g.lineTo(16, 0); g.lineTo(30, 22); g.closePath(); g.fill(); g.beginPath(); g.arc(16, -16, 7, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ffffff'; g.lineWidth = 5; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(-40 + (i + 2) * 20, -34); g.lineTo(-40 + (i + 2) * 20 - 14, 34); g.stroke(); } g.restore(); }
function gMoonClock(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, 0, 36, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -22); g.moveTo(0, 0); g.lineTo(16, 8); g.stroke();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(30, -30, 14, 0, Math.PI * 2); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(36, -34, 12, 0, Math.PI * 2); g.fill(); g.restore(); }
function gTeen(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -16, 16, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(0, -18, 24, Math.PI * 1.05, Math.PI * 1.95); g.lineTo(18, -4); g.lineTo(-18, -4); g.closePath(); g.globalAlpha = 0.55; g.fill(); g.globalAlpha = 1; g.beginPath(); g.moveTo(-32, 36); g.quadraticCurveTo(-30, 6, 0, 6); g.quadraticCurveTo(30, 6, 32, 36); g.closePath(); g.fill(); g.restore(); }

// ------------------------------------------------------------------ desk calendar (accepted prop; pages hinge over to NOV 9)
const CAL = { x: -3.3, z: -0.75 };
const cal = new THREE.Group(); cal.position.set(CAL.x, DESK, CAL.z); cal.rotation.y = 0.25; scene.add(cal);
{ const base = card(1.25, 0.12, 0.7, P.violet, P.edge); base.position.y = 0.06; cal.add(base);
  const back = card(1.2, 1.35, 0.05, P.violet2, P.edge, 'z'); back.position.set(0, 0.78, -0.18); back.rotation.x = -0.18; cal.add(back);
  for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 16), paper(P.white)); ring.position.set(-0.3 + i * 0.6, 1.43, -0.27); cal.add(ring); } }
const calPages = [7, 8, 9].map((d, i) => { const hinge = new THREE.Group(); hinge.position.set(0, 1.42, -0.235 + (2 - i) * 0.004); hinge.rotation.x = -0.18; cal.add(hinge);
  const tex = canvasTex(400, 440, (g, w, h) => { g.fillStyle = '#f3f1ff'; g.fillRect(0, 0, w, h); g.fillStyle = P.magenta; g.fillRect(0, 0, w, 96); g.fillStyle = '#ffffff'; g.font = '700 58px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NOV', w / 2, 52);
    g.fillStyle = P.ink; g.font = '700 230px "Space Grotesk"'; g.fillText(String(d), w / 2, 270); g.fillStyle = '#9d8cf0'; g.fillRect(60, 400, w - 120, 6); });
  const pg = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.24, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#e6e2ff')]);
  pg.position.set(0, -0.64, 0); pg.castShadow = true; hinge.add(pg); return hinge; }).reverse();
const srcCard = new THREE.Group(); srcCard.position.set(-3.1, DESK, 0.22); srcCard.rotation.y = 0.12; scene.add(srcCard);
const srcHinge = new THREE.Group(); srcCard.add(srcHinge);
{ const tex = canvasTex(640, 300, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 26); g.fill(); g.fillStyle = P.magenta; rr(g, 0, 0, w, 78, 26); g.fill(); g.fillRect(0, 40, w, 38);
    g.fillStyle = '#ffffff'; g.font = '700 46px "Space Grotesk"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('SOURCE', 34, 42);
    g.fillStyle = P.ink; g.font = '700 60px "Space Grotesk"'; g.fillText('Meta Newsroom', 34, 146); g.fillStyle = '#552dbc'; g.font = '600 48px "Plex Mono"'; g.fillText('Nov 9, 2026', 34, 228); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.6, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]);
  face.position.y = 0.36; face.castShadow = true; srcHinge.add(face); const foot = card(1.28, 0.03, 0.4, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.16); srcCard.add(foot); }

// ------------------------------------------------------------------ the sign-up card on its easel (generic form; no Instagram UI)
const SU = { x: 0.0, z: -1.05, w: 1.3, h: 1.7, y: 1.12 };
const su = new THREE.Group(); su.position.set(SU.x, DESK, SU.z); scene.add(su);
const suTilt = new THREE.Group(); suTilt.rotation.x = -0.1; su.add(suTilt);
const suCv = document.createElement('canvas'); suCv.width = 520; suCv.height = 680; const sug = suCv.getContext('2d'); const suTex = new THREE.CanvasTexture(suCv); suTex.colorSpace = THREE.SRGBColorSpace; suTex.anisotropy = 8;
{ const face = new THREE.Mesh(new THREE.BoxGeometry(SU.w, SU.h, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: suTex, emissive: '#ffffff', emissiveMap: suTex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = SU.y; face.castShadow = true; suTilt.add(face);
  const strut = card(0.4, 1.0, 0.04, P.violet, P.edge, 'z'); strut.position.set(0, 0.5, -0.32); strut.rotation.x = 0.45; su.add(strut); const foot = card(1.2, 0.05, 0.6, P.violet, P.edge); foot.position.set(0, 0.025, -0.08); su.add(foot);
  const lip = card(1.2, 0.08, 0.05, P.violet2, P.edge, 'z'); lip.position.set(0, 0.09, 0.08); su.add(lip); }
let suKey = '';
function drawSignup(year, tick, done) { const k = year.toFixed(2) + tick.toFixed(2) + done.toFixed(2); if (k === suKey) return; suKey = k; const g = sug; g.fillStyle = '#f7f5ff'; g.fillRect(0, 0, 520, 680); g.fillStyle = '#3d46b5'; g.fillRect(0, 0, 520, 104);
  g.fillStyle = '#ffffff'; g.font = '700 48px "Space Grotesk"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('Create account', 34, 54);
  const field = (y, label) => { g.fillStyle = '#552dbc'; g.font = '700 28px "Space Grotesk"'; g.fillText(label, 36, y - 26); g.fillStyle = '#ffffff'; rr(g, 30, y, 460, 80, 16); g.fill(); g.strokeStyle = '#b9b4dc'; g.lineWidth = 3; g.stroke(); };
  field(170, 'Name'); g.fillStyle = '#9a93c4'; rr(g, 60, 202, 180, 16, 8); g.fill();
  field(320, 'Birthday'); g.fillStyle = P.ink; g.font = '700 44px "Plex Mono"'; g.fillText('03 / 14 /', 56, 362);
  // the year rolls like a counter: 2012 → 1999
  g.save(); g.beginPath(); g.rect(290, 322, 180, 76); g.clip(); const yi = Math.floor(year), fr = year - yi; g.fillStyle = P.magenta; g.font = '700 50px "Plex Mono"';
  g.fillText(String(yi), 300, 362 - fr * 70); g.fillText(String(yi - 1 < 1999 ? 1999 : yi - 1), 300, 432 - fr * 70); g.restore();
  if (tick > 0) { g.save(); g.globalAlpha = clamp(tick); g.fillStyle = P.magenta; rr(g, 30, 430, 300, 64, 32); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 32px "Space Grotesk"'; g.fillText('Age 18+', 56, 463); g.restore(); sCheck(g, 288, 462, 22, clamp(tick)); }
  g.fillStyle = done > 0.5 ? '#2a9fbf' : '#7c3fda'; rr(g, 30, 560, 460, 84, 42); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 34px "Space Grotesk"'; g.textAlign = 'center'; g.fillText(done > 0.5 ? 'Account created' : 'Sign up', 260, 603); g.textAlign = 'left'; suTex.needsUpdate = true; }
// the teen (paper token) standing next to the form
function token(x, z, ry, s, col, glyph) { const grp = new THREE.Group(); grp.position.set(x, DESK, z); grp.rotation.y = ry; grp.scale.setScalar(s); scene.add(grp);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.04, 28), paper(P.violet)); foot.position.y = 0.02; foot.castShadow = true; grp.add(foot);
  const stick = card(0.04, 0.42, 0.03, P.edge, P.white, 'z'); stick.position.y = 0.23; grp.add(stick); const head = new THREE.Group(); head.position.y = 0.62; grp.add(head);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 40), paper(P.edge)); disc.rotation.x = Math.PI / 2; disc.castShadow = true; head.add(disc);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.205, 40), new THREE.MeshStandardMaterial({ map: canvasTex(256, 256, (g) => { g.fillStyle = col; g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill(); glyph(g); }), roughness: 0.9 })); face.position.z = 0.017; head.add(face); return { grp, head }; }
const teen = token(-0.92, -0.55, 0.15, 1.25, '#d23d7c', (g) => gTeen(g, 128, 132, 2.6, '#f3f1ff'));

// ------------------------------------------------------------------ the account card that travels: gate → Adult room, then Teen Account room
const acct = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.4, 0.015), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(310, 200, (g, w, h) => { g.fillStyle = '#ffffff'; rr(g, 0, 0, w, h, 20); g.fill(); g.fillStyle = '#d23d7c'; g.beginPath(); g.arc(56, 70, 38, 0, Math.PI * 2); g.fill(); gTeen(g, 56, 74, 0.8, '#ffffff');
  g.fillStyle = P.ink; g.font = '700 30px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('New account', 108, 56); g.fillStyle = '#7a74b8'; g.font = '600 24px "Space Grotesk"'; g.fillText('Birthday:', 108, 96); g.fillStyle = P.magenta; g.font = '700 30px "Plex Mono"'; g.fillText('1999', 214, 96);
  g.fillStyle = '#d6d2f2'; rr(g, 24, 140, 262, 14, 7); g.fill(); rr(g, 24, 166, 180, 14, 7); g.fill(); }), emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 0.9 }), paper('#e6e2ff')]); acct.castShadow = true; scene.add(acct);
// the age-check gate (posts + barrier arm)
const gate = new THREE.Group(); gate.position.set(0, DESK, 0.15); scene.add(gate);
const arm = new THREE.Group(); arm.position.set(-0.62, 0.62, 0); gate.add(arm);
{ for (const x of [-0.7, 0.7]) { const post = card(0.1, 0.75, 0.1, P.violet2, P.edge, 'x'); post.position.set(x, 0.375, 0); gate.add(post); }
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.04), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(320, 20, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ffffff' : P.magenta; g.fillRect(i * 40, 0, 40, h); } }), roughness: 0.9 }), paper(P.white)]); bar.position.x = 0.65; bar.castShadow = true; arm.add(bar);
  const sgn = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.02), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(350, 110, (g, w, h) => { g.fillStyle = '#3d46b5'; rr(g, 0, 0, w, h, 20); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 50px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Age check', w / 2, h / 2 + 2); }), emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]); sgn.position.set(0.7, 0.88, 0); sgn.castShadow = true; gate.add(sgn); const sp = card(0.04, 0.12, 0.04, P.edge, P.white, 'x'); sp.position.set(0.7, 0.76, 0); gate.add(sp); }
// two rooms (open paper booths): Adult account | Teen Account
function booth(x, z, label, wall, labCol, glyph) { const grp = new THREE.Group(); grp.position.set(x, DESK, z); scene.add(grp);
  const floor = card(1.0, 0.04, 0.8, wall, P.edge); floor.position.y = 0.02; grp.add(floor);
  for (const [px, pz, w, d, ax] of [[0, -0.4, 1.0, 0.04, 'z'], [-0.5, 0, 0.04, 0.8, 'x'], [0.5, 0, 0.04, 0.8, 'x']]) { const m = card(w, 0.55, d, wall, P.white, ax); m.position.set(px, 0.3, pz); grp.add(m); }
  const lab = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.24, 0.02), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(490, 120, (g, w, h) => { g.fillStyle = labCol; rr(g, 0, 0, w, h, 24); g.fill(); if (glyph) glyph(g); g.fillStyle = '#ffffff'; g.font = '700 50px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, w / 2 + (glyph ? 30 : 0), h / 2 + 2); }), emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]);
  lab.position.set(0, 0.72, -0.4); lab.castShadow = true; grp.add(lab); return grp; }
const adultRoom = booth(-0.62, 1.15, 'Adult account', '#5a5f8f', '#5a5f8f', null);
const teenRoom = booth(0.62, 1.15, 'Teen Account', '#2a9fbf', '#2a9fbf', (g) => gShield2(g, 52, 60, 0.85, '#f3f1ff', false));
const glowMat = new THREE.MeshBasicMaterial({ color: P.cyan, transparent: true, opacity: 0 }); { const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), glowMat); gl.rotation.x = -Math.PI / 2; gl.position.set(0, 0.045, 0); teenRoom.add(gl); }
// the AI scanner: a paper lens with a cyan sweep
const scanner = new THREE.Group(); scene.add(scanner);
{ const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 10, 40), paper(P.violet2)); ring.castShadow = true; scanner.add(ring); const glass = new THREE.Mesh(new THREE.CircleGeometry(0.2, 40), new THREE.MeshBasicMaterial({ color: '#bff6ff', transparent: true, opacity: 0.25, depthWrite: false })); scanner.add(glass);
  const lab = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.01), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(170, 70, (g, w, h) => { g.fillStyle = P.violet2; rr(g, 0, 0, w, h, 16); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 40px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('AI', w / 2, h / 2 + 2); }), roughness: 0.9 }), paper(P.white)]); lab.position.set(0, 0.32, 0); scanner.add(lab); }
const sweepMat = new THREE.MeshBasicMaterial({ color: P.cyan, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }); const sweep = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.05), sweepMat); scene.add(sweep);
const stamp = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.2, 0.01), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(310, 100, (g, w, h) => { g.fillStyle = P.magenta; rr(g, 0, 0, w, h, 20); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 42px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Likely a teen', w / 2, h / 2 + 2); }), emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 0.9 }), paper(P.white)]); stamp.castShadow = true; scene.add(stamp);
// three protection badges for the Teen Account room
const BADGES = [['Who can contact them', gChatLock], ['What they see', gEyeFilter], ['Time on the app', gMoonClock]];
const badges = BADGES.map(([label, glyph], i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.5, 0.015), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(310, 250, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 26); g.fill(); g.strokeStyle = P.cyan; g.lineWidth = 8; g.stroke(); glyph(g, w / 2, 100, 1.25, '#2a9fbf'); g.fillStyle = P.ink; g.font = '700 26px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, w / 2, 200); }), emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]); m.castShadow = true; scene.add(m); return m; });

// ------------------------------------------------------------------ globe (S3) and the app tiles (S7)
const GLOBE = { x: 3.5, z: -2.0, y: 1.1, r: 0.55 };
const globe = new THREE.Group(); globe.position.set(GLOBE.x, DESK + GLOBE.y, GLOBE.z); scene.add(globe);
{ const tex = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#2a3fa8'; g.fillRect(0, 0, w, h); g.fillStyle = '#8d78e8';
    for (const pts of [[[140, 110], [300, 90], [330, 180], [260, 250], [200, 230], [150, 180]], [[250, 270], [330, 280], [320, 420], [270, 440], [250, 360]], [[470, 100], [560, 90], [600, 150], [540, 200], [480, 170]], [[490, 210], [600, 220], [610, 360], [540, 400], [500, 300]], [[600, 90], [860, 80], [900, 180], [780, 240], [650, 200]], [[800, 330], [900, 320], [920, 390], [830, 400]]]) { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }
    g.strokeStyle = 'rgba(201,191,255,0.35)'; g.lineWidth = 2; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, i * h / 6); g.lineTo(w, i * h / 6); g.stroke(); } for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(i * w / 12, 0); g.lineTo(i * w / 12, h); g.stroke(); } });
  const sph = new THREE.Mesh(new THREE.SphereGeometry(GLOBE.r, 48, 32), new THREE.MeshStandardMaterial({ map: tex, bumpMap: grain, bumpScale: 2, roughness: 0.9 })); sph.castShadow = true; globe.add(sph); globe.userData.sph = sph;
  const stand = card(0.06, GLOBE.y - GLOBE.r + 0.05, 0.06, P.violet2, P.edge, 'x'); stand.position.set(GLOBE.x, DESK + (GLOBE.y - GLOBE.r) / 2, GLOBE.z); scene.add(stand); const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.05, 32), paper(P.violet)); base.position.set(GLOBE.x, DESK + 0.025, GLOBE.z); base.castShadow = true; scene.add(base); }
const PINS = [[0.2, 0.3], [0.28, 0.6], [0.52, 0.28], [0.54, 0.55], [0.7, 0.3], [0.85, 0.7], [0.62, 0.4], [0.15, 0.45], [0.92, 0.35], [0.4, 0.4], [0.75, 0.6], [0.05, 0.3]];
const pins = PINS.map(([u, v]) => { const lon = u * Math.PI * 2, lat = (0.5 - v) * Math.PI; const m = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), new THREE.MeshBasicMaterial({ color: P.cyan })); const p = V3(Math.cos(lat) * Math.cos(-lon), Math.sin(lat), Math.cos(lat) * Math.sin(-lon)).multiplyScalar(GLOBE.r + 0.02); m.position.copy(p); globe.userData.sph.add(m); return m; });
const APPS = [['Instagram', 'Worldwide now', P.magenta, 1], ['Facebook', 'Rolling out', '#3d46b5', 0.42], ['Threads', 'Later this year', '#5a5f8f', 0]];
const appTiles = APPS.map(([name, status, col], i) => { const grp = new THREE.Group(); grp.position.set(2.85 + i * 0.68, DESK, 1.3); grp.rotation.y = -0.05 * (i - 1); scene.add(grp);
  const cv = document.createElement('canvas'); cv.width = 260; cv.height = 340; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.78, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]); m.position.y = 0.43; m.rotation.x = -0.12; m.castShadow = true; grp.add(m);
  const foot = card(0.56, 0.03, 0.28, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.08); grp.add(foot); return { grp, g: cv.getContext('2d'), tex, key: '', name, status, col }; });
function drawApp(a, i, prog_, statusA) { const k = prog_.toFixed(2) + statusA.toFixed(2); if (k === a.key) return; a.key = k; const g = a.g; g.fillStyle = '#f3f1ff'; rr(g, 0, 0, 260, 340, 30); g.fill(); g.fillStyle = a.col; rr(g, 40, 30, 180, 150, 34); g.fill(); gShield2(g, 130, 104, 1.05, '#f3f1ff', i === 0);
  g.fillStyle = P.ink; g.font = '700 36px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(a.name, 130, 214);
  g.fillStyle = '#d8d2ff'; rr(g, 26, 248, 208, 20, 10); g.fill(); if (prog_ > 0.02) { g.fillStyle = P.cyan; rr(g, 26, 248, 208 * prog_, 20, 10); g.fill(); }
  g.save(); g.globalAlpha = clamp(statusA); g.fillStyle = i === 0 ? '#2a9fbf' : i === 1 ? '#7c3fda' : P.magenta; rr(g, 20, 284, 220, 42, 21); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 24px "Space Grotesk"'; g.fillText(a.status, 130, 306); g.restore(); a.tex.needsUpdate = true; }

// ------------------------------------------------------------------ tags + sign
function tagCard(text, col, w = 0.86) { const grp = new THREE.Group(); scene.add(grp); const tex = canvasTex(520, 120, (g, W_, H_) => { g.fillStyle = col; rr(g, 0, 0, W_, H_, 60); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 58px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W_ / 2, H_ / 2 + 3); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(w, w * 0.23, 0.02), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.2, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = w * 0.16; face.rotation.x = -0.45; face.castShadow = true; grp.add(face); return grp; }
const tagBefore = tagCard('Before', '#5a5f8f'); tagBefore.position.set(-0.62, DESK, 1.85);
const tagNow = tagCard('Now', '#2a9fbf'); tagNow.position.set(0.62, DESK, 1.85);
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.1, DESK, 2.75);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const SHOTS = {
  S1: (t) => { const u = prog(t, 0, 3.06); return SH(L3([-0.14, 1.95, 2.45], [-0.12, 1.9, 2.25], u), V3(-0.12, 1.36, -0.9), 46); },
  S2: (t) => { const u = prog(t, 3.06, 5.0); return SH(L3([-3.12, 1.65, 3.45], [-3.15, 1.6, 3.2], u), V3(-3.12, 0.82, -0.2), 50); },
  S3: (t) => { const u = prog(t, 5.0, 7.56); return SH(L3([3.5, 1.85, 1.45], [3.5, 1.82, 1.2], u), V3(3.5, 1.42, -2.0), 46); },
  S4: (t) => { const u = prog(t, 7.56, 11.13); return SH(L3([0.0, 3.45, 4.7], [0.0, 3.35, 4.45], u), V3(0.0, 0.62, 0.0), 50); },
  S5: (t) => { const u = prog(t, 11.13, 16.83); return SH(L3([0.1, 3.1, 4.4], [0.15, 3.0, 4.15], u), V3(0.05, 0.62, 0.55), 50); },
  S6: (t) => { const u = prog(t, 16.83, 21.82); return SH(L3([0.64, 2.35, 5.15], [0.63, 2.3, 4.9], u), V3(0.62, 1.25, 1.1), 48); },
  S7: (t) => { const u = prog(t, 21.82, 25.92); return SH(L3([3.53, 2.2, 5.0], [3.53, 2.15, 4.75], u), V3(3.53, 0.95, 1.2), 48); },
  S8: (t) => { const u = prog(t, 25.92, 29.6); return SH(L3([0.3, 3.3, 9.0], [0.4, 4.1, 10.1], u), L3([0.2, 0.9, 0.4], [0.2, 0.95, 0.1], u), 48, lerp(7.6, 8.8, u)); },
};

// ------------------------------------------------------------------ per-frame update
const arc = (a, b, h, u) => a.clone().lerp(b, u).add(V3(0, Math.sin(Math.PI * u) * h, 0));
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;
  // sign-up form: the year rolls 2012 → 1999, "Age 18+" ticks, account created
  { const r = prog(t, E.roll, E.roll + 1.5, (x) => 1 - Math.pow(1 - x, 2)); const year = 2012 - 13 * r; drawSignup(Math.max(1999, year), prog(t, E.tick, E.tick + 0.3), t >= E.created ? 1 : 0); }
  teen.head.rotation.z = 0.18 * Math.sin(Math.PI * clamp((t - E.tick) / 0.6)); teen.grp.rotation.y = 0.15 + 0.25 * Math.sin(Math.PI * clamp((t - 0.2) / 1.2));
  // the account card: on the form → through the gate → Adult room; later scanned → Teen Account room
  { suTilt.updateMatrixWorld(true); const pForm = su.localToWorld(V3(0, 0.55, 0.12)), pGate = gate.localToWorld(V3(0, 0.5, 0)), pAdult = adultRoom.localToWorld(V3(0, 0.3, 0)), pTeen = teenRoom.localToWorld(V3(0, 0.3, 0));
    let p;
    if (t < E.leave) p = pForm; else if (t < E.atGate) p = pForm.clone().lerp(pGate, ease(prog(t, E.leave, E.atGate))); else if (t < E.inAdult) p = arc(pGate, pAdult, 0.25, ease(prog(t, E.atGate + 0.1, E.inAdult)));
    else if (t < E.move) p = pAdult.clone().add(V3(0, 0.04 * Math.sin(Math.PI * clamp((t - E.stampT) / 0.3)), 0)); else p = arc(pAdult, pTeen, 0.45, ease(prog(t, E.move, E.move + 0.8)));
    if (t >= 25.92) p = pTeen; acct.position.copy(p); acct.visible = t >= E.leave; acct.quaternion.copy(camera.quaternion); acct.scale.setScalar(Math.max(0.01, prog(t, E.leave, E.leave + 0.3, outBack))); }
  arm.rotation.z = 1.2 * prog(t, E.lift, E.lift + 0.35, outBack) * (1 - prog(t, E.inAdult + 0.3, E.inAdult + 0.7));
  // the AI scanner sweeps the account in the Adult room; stamp "Likely a teen"; the Teen Account room lights up
  { const show = id === 'S5'; scanner.visible = show; sweep.visible = show; if (show) { const pA = adultRoom.localToWorld(V3(0, 0.3, 0)); const sw = prog(t, E.scan, E.scan + 1.0, (x) => x); scanner.position.copy(pA).add(V3(-0.3 + 0.6 * sw, 0.36 + 0.03 * Math.sin(t * 5), 0.32)); scanner.quaternion.copy(camera.quaternion);
      sweep.position.copy(pA).add(V3(-0.31 + 0.62 * sw, 0.0, 0.05)); sweep.quaternion.copy(camera.quaternion); sweep.rotateZ(Math.PI / 2); sweepMat.opacity = 0.6 * Math.sin(Math.PI * clamp((t - E.scan) / 1.0)); } }
  { const s = id === 'S5' ? prog(t, E.stampT, E.stampT + 0.3, outBack) * (1 - prog(t, E.move + 0.4, E.move + 0.7)) : 0; stamp.visible = s > 0.01; stamp.position.copy(acct.position).add(V3(0.1, 0.3, 0.05)); stamp.quaternion.copy(camera.quaternion); stamp.rotateZ(-0.12); stamp.scale.setScalar(Math.max(0.01, s)); }
  glowMat.opacity = 0.55 * prog(t, E.shield, E.shield + 0.4) * (0.75 + 0.25 * Math.sin(t * 3));
  // protection badges pop in an arc above the Teen Account room
  badges.forEach((m, i) => { const s = t >= 25.92 ? 1 : id === 'S6' ? prog(t, E.badges[i], E.badges[i] + 0.35, outBack) : 0; m.visible = s > 0.01; const base = teenRoom.localToWorld(V3(0, 0, 0)); m.position.copy(base).add(V3((i - 1) * 0.6, 1.22 + (i === 1 ? 0.1 : 0) + 0.02 * Math.sin(t * 3 + i), -0.15)); m.quaternion.copy(camera.quaternion); m.scale.setScalar(0.9 * Math.max(0.01, s)); });
  // globe spins; pins light up around the world
  globe.userData.sph.rotation.y = t * 0.55; pins.forEach((m, i) => { const s = prog(t, E.pins + i * 0.1, E.pins + i * 0.1 + 0.25, outBack); m.scale.setScalar(Math.max(0.01, s)); });
  // app tiles: Instagram worldwide now; Facebook rolling out; Threads later this year
  appTiles.forEach((a, i) => { const pop = t >= 25.92 ? 1 : id === 'S7' ? prog(t, E.apps + i * 0.12, E.apps + i * 0.12 + 0.35, outBack) : 0; a.grp.scale.setScalar(Math.max(0.01, pop)); a.grp.visible = pop > 0.01;
    const pr = i === 0 ? 1 : i === 1 ? lerp(0.1, 0.42, prog(t, E.fbRoll, E.fbRoll + 0.8)) : 0; const st = i === 0 ? prog(t, E.apps + 0.3, E.apps + 0.6) : i === 1 ? prog(t, E.fbRoll, E.fbRoll + 0.3) : prog(t, E.threads, E.threads + 0.3); drawApp(a, i, pr, st); });
  // tags
  tagBefore.visible = id === 'S4'; tagBefore.scale.setScalar(Math.max(0.01, prog(t, 7.62, 7.95, outBack)));
  tagNow.visible = id === 'S5'; tagNow.scale.setScalar(Math.max(0.01, prog(t, 11.2, 11.55, outBack)));
  // calendar 7 → 8 → 9, the source placard hinges up
  calPages.forEach((h, i) => { if (i === 0) return; const k = 2 - i; const u = prog(t, E.calFlip + k * 0.3, E.calFlip + k * 0.3 + 0.32); h.rotation.x = lerp(-0.18, 0.5 - Math.PI * 2, u); });
  srcCard.visible = t >= 3.06; { const u = prog(t, E.source, E.source + 0.45, outBack); srcHinge.rotation.x = -Math.PI / 2 * (1 - clamp(u, 0, 1.2)); }
  // sign hinges up for the CTA
  const sgu = prog(t, E.sign, E.sign + 0.45, outBack); sign.visible = t >= E.sign - 0.1; sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(sgu, 0, 1.2));
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
