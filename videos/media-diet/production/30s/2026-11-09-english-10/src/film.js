// Media Diet · 30 s English episode (english-10) — describe a school dashboard and Muse spaces build it (Meta, 6 Nov 2026)
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



// ------------------------------------------------------------------ small canvas glyphs (generic; no Meta/Muse logos or UI)
function gEnvelope(g, x, y, w, h, col = '#f3f1ff', line = '#9d8cf0') { g.fillStyle = col; rr(g, x, y, w, h, h * 0.12); g.fill(); g.strokeStyle = line; g.lineWidth = Math.max(2, h * 0.06); g.beginPath(); g.moveTo(x + w * 0.06, y + h * 0.12); g.lineTo(x + w / 2, y + h * 0.58); g.lineTo(x + w * 0.94, y + h * 0.12); g.stroke(); }
function gLock(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -22, -6, 44, 34, 6); g.fill(); g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.arc(0, -6, 14, Math.PI, 0); g.stroke(); g.restore(); }
function gPin(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -12, 20, Math.PI * 0.85, Math.PI * 0.15); g.lineTo(0, 30); g.closePath(); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, -12, 8, 0, Math.PI * 2); g.fill(); g.restore(); }
function gLink(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.7); g.strokeStyle = col; g.lineWidth = 9; for (const dx of [-17, 17]) { rr(g, dx - 22, -13, 44, 26, 13); g.stroke(); } g.restore(); }
function gCal(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -24, -20, 48, 44, 7); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(-18, -6, 36, 24); g.fillStyle = col; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.fillRect(-14 + i * 11, -1 + j * 10, 7, 6); g.fillRect(-14, -28, 6, 12); g.fillRect(8, -28, 6, 12); g.restore(); }
function gBubble(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -4, 26, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(-18, 12); g.lineTo(-26, 28); g.lineTo(-4, 20); g.fill(); g.fillStyle = '#ffffff'; for (const dx of [-10, 0, 10]) { g.beginPath(); g.arc(dx, -4, 3.5, 0, Math.PI * 2); g.fill(); } g.restore(); }
function gNoPhone(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#ffffff'; g.lineWidth = 6; rr(g, -14, -24, 28, 48, 6); g.stroke(); g.strokeStyle = P.magenta; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-24, 24); g.lineTo(24, -24); g.stroke(); g.restore(); }
function gDownload(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(0, -34); g.lineTo(0, 10); g.stroke(); g.beginPath(); g.moveTo(-18, -8); g.lineTo(0, 12); g.lineTo(18, -8); g.stroke(); g.beginPath(); g.moveTo(-30, 14); g.lineTo(-30, 30); g.lineTo(30, 30); g.lineTo(30, 14); g.stroke(); g.restore(); }
function gSpark(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, q = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); }
function gCalIcon(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -26, -22, 52, 48, 8); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(-20, -8, 40, 28); g.fillStyle = col; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) g.fillRect(-16 + i * 9, -3 + j * 11, 6, 6); g.fillRect(-16, -30, 6, 12); g.fillRect(10, -30, 6, 12); g.restore(); }
function gSync(g, x, y, s, col, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 20, 0.3, Math.PI - 0.2); g.stroke(); g.beginPath(); g.arc(0, 0, 20, Math.PI + 0.3, 2 * Math.PI - 0.2); g.stroke();
  for (const a of [Math.PI - 0.2, -0.2]) { const px = Math.cos(a) * 20, py = Math.sin(a) * 20; g.beginPath(); g.moveTo(px - 8, py - (a < 0 ? -6 : 6)); g.lineTo(px + 6 * Math.sign(Math.cos(a) || 1) * 0 + (a < 0 ? 4 : -4), py); g.lineTo(px + 8, py + (a < 0 ? -6 : 6)); g.fill(); } g.restore(); }
function gShare(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 6; for (const [px, py] of [[-18, 0], [16, -16], [16, 16]]) { g.beginPath(); g.arc(px, py, 8, 0, Math.PI * 2); g.fill(); } g.beginPath(); g.moveTo(-18, 0); g.lineTo(16, -16); g.moveTo(-18, 0); g.lineTo(16, 16); g.stroke(); g.restore(); }
// the school events (fictional examples of the official "school dashboard" idea)
const EV = [['Tue', 10, 'Picture day', '#2a9fbf'], ['Thu', 12, 'Field trip', '#d23d7c'], ['Fri', 13, 'Bake sale', '#e8a33a'], ['Mon', 16, 'Winter concert', '#7c3fda'], ['Wed', 18, 'Book fair', '#3fae6a']];
const SUBJ = ['Picture day reminder', 'Field trip form', 'Bake sale volunteers', 'Winter concert times', 'Lunch menu', 'Book fair', 'Class photo order', 'Library week', 'Spirit day', 'Parent evening', 'Bus change', 'Science fair', 'Permission slip', 'Snack rota'];

// ------------------------------------------------------------------ desk calendar (accepted prop; pages hinge over to NOV 6)
const CAL = { x: -3.3, z: -0.75 };
const cal = new THREE.Group(); cal.position.set(CAL.x, DESK, CAL.z); cal.rotation.y = 0.25; scene.add(cal);
{ const base = card(1.25, 0.12, 0.7, P.violet, P.edge); base.position.y = 0.06; cal.add(base);
  const back = card(1.2, 1.35, 0.05, P.violet2, P.edge, 'z'); back.position.set(0, 0.78, -0.18); back.rotation.x = -0.18; cal.add(back);
  for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 16), paper(P.white)); ring.position.set(-0.3 + i * 0.6, 1.43, -0.27); cal.add(ring); } }
const calPages = [4, 5, 6].map((d, i) => { const hinge = new THREE.Group(); hinge.position.set(0, 1.42, -0.235 + (2 - i) * 0.004); hinge.rotation.x = -0.18; cal.add(hinge);
  const tex = canvasTex(400, 440, (g, w, h) => { g.fillStyle = '#f3f1ff'; g.fillRect(0, 0, w, h); g.fillStyle = P.magenta; g.fillRect(0, 0, w, 96); g.fillStyle = '#ffffff'; g.font = '700 58px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NOV', w / 2, 52);
    g.fillStyle = P.ink; g.font = '700 230px "Space Grotesk"'; g.fillText(String(d), w / 2, 270); g.fillStyle = '#9d8cf0'; g.fillRect(60, 400, w - 120, 6); });
  const pg = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.24, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#e6e2ff')]);
  pg.position.set(0, -0.64, 0); pg.castShadow = true; hinge.add(pg); return hinge; }).reverse();
const srcCard = new THREE.Group(); srcCard.position.set(-3.1, DESK, 0.22); srcCard.rotation.y = 0.12; scene.add(srcCard);
const srcHinge = new THREE.Group(); srcCard.add(srcHinge);
{ const tex = canvasTex(640, 300, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 26); g.fill(); g.fillStyle = P.magenta; rr(g, 0, 0, w, 78, 26); g.fill(); g.fillRect(0, 40, w, 38);
    g.fillStyle = '#ffffff'; g.font = '700 46px "Space Grotesk"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('SOURCE', 34, 42);
    g.fillStyle = P.ink; g.font = '700 60px "Space Grotesk"'; g.fillText('Meta Newsroom', 34, 146); g.fillStyle = '#552dbc'; g.font = '600 48px "Plex Mono"'; g.fillText('Nov 6, 2026', 34, 228); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.6, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]);
  face.position.y = 0.36; face.castShadow = true; srcHinge.add(face); const foot = card(1.28, 0.03, 0.4, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.16); srcCard.add(foot); }

// ------------------------------------------------------------------ the phone on its stand (generic screens; no Meta/Muse UI copied)
const PH = { w: 1.22, h: 2.3, sw: 1.08, sh: 2.12, cw: 540, ch: 1060 }; PH.cy = PH.h / 2 + 0.06;
function makePhone(x, y, z, ry, sc) {
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; grp.scale.setScalar(sc); scene.add(grp);
  const tilt = new THREE.Group(); tilt.rotation.x = -0.08; grp.add(tilt);
  const b = card(PH.w, PH.h, 0.08, P.navy2, P.lav, 'z'); b.position.y = PH.cy; tilt.add(b);
  const cv = document.createElement('canvas'); cv.width = PH.cw; cv.height = PH.ch; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(PH.sw, PH.sh), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.6, roughness: 0.85 })); scr.position.set(0, PH.cy, 0.041); tilt.add(scr);
  const strut = card(0.5, 1.2, 0.05, P.violet, P.edge, 'z'); strut.position.set(0, 0.6, -0.48); strut.rotation.x = 0.42; grp.add(strut);
  const foot = card(1.1, 0.06, 0.75, P.violet, P.edge); foot.position.set(0, 0.03, -0.12); grp.add(foot);
  const lip = card(1.1, 0.1, 0.06, P.violet2, P.edge, 'z'); lip.position.set(0, 0.1, 0.1); grp.add(lip);
  return { grp, tilt, g: cv.getContext('2d'), tex, key: '' };
}
const scrPt = (ph, cx, cy, dz = 0.06) => { ph.grp.updateMatrixWorld(true); return ph.tilt.localToWorld(V3((cx / PH.cw - 0.5) * PH.sw, PH.cy + (0.5 - cy / PH.ch) * PH.sh, dz)); };
const PHONE = makePhone(0, DESK, -0.2, 0, 1);
const PARTNER = makePhone(1.75, DESK, 1.15, -0.45, 0.42);
function statusBar(g) { g.fillStyle = '#efecff'; g.fillRect(0, 0, PH.cw, PH.ch); g.fillStyle = '#24287e'; g.fillRect(0, 0, PH.cw, 44); g.fillStyle = '#c9bfff'; g.font = '600 22px "Plex Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 24, 23);
  for (let i = 0; i < 3; i++) g.fillRect(PH.cw - 92 + i * 10, 30 - i * 5, 6, 6 + i * 5); rr(g, PH.cw - 52, 14, 30, 16, 4); g.fill(); }
function header(g, title, sub) { g.fillStyle = '#3d46b5'; g.fillRect(0, 44, PH.cw, 100); g.fillStyle = '#ffffff'; g.font = '700 38px "Space Grotesk"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(title, 32, sub ? 82 : 94); if (sub) { g.fillStyle = '#c9bfff'; g.font = '600 22px "Space Grotesk"'; g.fillText(sub, 32, 120); } }
function evCard(g, x, y, w, e, a = 1, isNew = false) { if (a <= 0) return; g.save(); g.globalAlpha = clamp(a); g.translate(0, 18 * (1 - outC(clamp(a)))); g.fillStyle = '#ffffff'; rr(g, x, y, w, 96, 20); g.fill(); g.fillStyle = e[3]; rr(g, x, y, 92, 96, 20); g.fill(); g.fillRect(x + 60, y, 32, 96);
  g.fillStyle = '#ffffff'; g.font = '700 22px "Space Grotesk"'; g.textAlign = 'center'; g.fillText(e[0].toUpperCase(), x + 46, y + 30); g.font = '700 40px "Space Grotesk"'; g.fillText(String(e[1]), x + 46, y + 66); g.textAlign = 'left';
  g.fillStyle = P.ink; g.font = '700 32px "Space Grotesk"'; g.fillText(e[2], x + 112, y + 40); g.fillStyle = '#7a74b8'; g.font = '600 22px "Space Grotesk"'; g.fillText('from a school email', x + 112, y + 74);
  if (isNew) { g.fillStyle = P.magenta; rr(g, x + w - 84, y + 14, 70, 32, 16); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 20px "Space Grotesk"'; g.fillText('NEW', x + w - 72, y + 31); } g.restore(); }
function phoneDraw(ph, s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 30) / 30 : v)); if (key === ph.key) return; ph.key = key;
  const g = ph.g; statusBar(g); g.textAlign = 'left'; g.textBaseline = 'middle';
  if (s.mode === 'flood') {
    header(g, 'Inbox', `${s.unread} unread`); const off = (s.scroll * 96) % 96, k0 = Math.floor(s.scroll);
    g.save(); g.beginPath(); g.rect(0, 144, PH.cw, PH.ch - 144); g.clip();
    for (let i = -1; i < 10; i++) { const y = 160 + i * 96 + off, idx = ((k0 - i) % SUBJ.length + SUBJ.length * 10) % SUBJ.length; g.fillStyle = '#ffffff'; rr(g, 20, y, 500, 84, 16); g.fill(); g.fillStyle = P.magenta; g.beginPath(); g.arc(46, y + 42, 9, 0, Math.PI * 2); g.fill();
      g.fillStyle = P.ink; g.font = '700 26px "Space Grotesk"'; g.fillText('School office', 68, y + 28); g.fillStyle = '#7a74b8'; g.font = '600 24px "Space Grotesk"'; g.fillText(SUBJ[idx], 68, y + 60); }
    g.restore();
  } else if (s.mode === 'muse') {
    header(g, 'Muse'); g.fillStyle = P.ink; g.font = '700 28px "Space Grotesk"'; g.fillText('Chat', 40, 186); g.fillStyle = '#552dbc'; g.fillText('Spaces', 150, 186); g.fillStyle = P.magenta; g.fillRect(150, 206, 100, 5);
    const sp = clamp(s.spaces); if (sp > 0) { g.save(); g.globalAlpha = sp; g.fillStyle = P.magenta; rr(g, 268, 168, 66, 34, 17); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 20px "Space Grotesk"'; g.fillText('NEW', 278, 186); g.restore(); }
    [['Holiday gift tracker', '#d23d7c'], ['Daily word game', '#2a9fbf'], ['DIY project board', '#e8a33a']].forEach(([n, c], i) => { const u = clamp(sp * 3 - i); if (u <= 0) return; const y = 250 + i * 150; g.save(); g.globalAlpha = u; g.fillStyle = '#ffffff'; rr(g, 24, y, 492, 128, 22); g.fill(); g.fillStyle = c; rr(g, 44, y + 22, 84, 84, 18); g.fill(); g.fillStyle = P.ink; g.font = '700 30px "Space Grotesk"'; g.fillText(n, 150, y + 52); g.fillStyle = '#7a74b8'; g.font = '600 22px "Space Grotesk"'; g.fillText('a space', 150, y + 88); g.restore(); });
    const nb = clamp(s.newBtn); if (nb > 0) { g.save(); g.translate(270, 760); const sc = outBack(nb); g.scale(sc, sc); g.fillStyle = '#7c3fda'; rr(g, -220, -46, 440, 92, 46); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 34px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('+ New space', 0, 2); g.restore(); g.textAlign = 'left'; }
  } else if (s.mode === 'prompt') {
    header(g, 'New space'); const msg = "A school dashboard: find my kids' events in school emails and add them to my calendar."; const n = Math.round(msg.length * clamp(s.type));
    g.fillStyle = '#ffffff'; rr(g, 24, 180, 492, 300, 24); g.fill(); g.strokeStyle = P.cyan; g.lineWidth = 4; g.stroke(); g.fillStyle = '#7a74b8'; g.font = '700 22px "Space Grotesk"'; g.fillText('DESCRIBE YOUR IDEA', 48, 214);
    g.fillStyle = P.ink; g.font = '700 32px "Space Grotesk"'; const words = msg.slice(0, n).split(' '); let line = '', y = 262; for (const w of words) { const tl = line ? line + ' ' + w : w; if (g.measureText(tl).width > 440) { g.fillText(line, 48, y); line = w; y += 44; } else line = tl; } g.fillText(line, 48, y);
    if (s.type < 1 && Math.floor(s.t * 6) % 2 === 0) { g.fillStyle = P.ink; g.fillRect(52 + g.measureText(line).width, y - 20, 3, 40); }
    const b = clamp(s.build); if (b > 0) { g.fillStyle = '#552dbc'; g.font = '700 28px "Space Grotesk"'; g.fillText('Building your space…', 48, 540); for (let i = 0; i < 4; i++) { const u = clamp(b * 4 - i); g.fillStyle = `rgba(124,63,218,${0.15 + 0.25 * u})`; rr(g, 24, 580 + i * 108, 492 * (0.4 + 0.6 * u), 92, 20); g.fill(); } }
  } else if (s.mode === 'dash') {
    header(g, 'School dashboard', 'a space in Muse'); const sync = s.sync ?? 0;
    gSync(g, 470, 94, 0.8, '#ffffff', sync * Math.PI * 4);
    let y = 170; const items = EV.slice(0, 4).map((e, i) => [e, clamp((s.cards ?? 1) * 4 - i), false]); if (s.fresh > 0) items.unshift([EV[4], s.fresh, true]);
    items.forEach(([e, a, isNew]) => { evCard(g, 24, y, 492, e, a, isNew); y += 112 * clamp(a + (isNew ? 0 : 0)); });
    g.fillStyle = '#7a74b8'; g.font = '600 24px "Space Grotesk"'; g.fillText(s.fresh > 0 ? 'Updated just now' : 'Connected: Mail · Calendar', 32, 760);
    const sh = clamp(s.share); g.fillStyle = sh > 0 ? '#dcd8f4' : '#ffffff'; rr(g, 24, 800, 492, 96, 24); g.fill(); gShare(g, 80, 848, 1.0, sh > 0 ? '#9d9bbd' : '#552dbc'); g.fillStyle = sh > 0 ? '#9d9bbd' : P.ink; g.font = '700 30px "Space Grotesk"'; g.fillText('Share space', 120, 850);
    if (sh > 0) { g.save(); g.globalAlpha = sh; g.fillStyle = P.magenta; rr(g, 330, 830, 170, 40, 20); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 22px "Space Grotesk"'; g.fillText('not yet', 372, 851); g.restore(); }
  } else if (s.mode === 'mini') { header(g, 'Messages'); g.fillStyle = '#ffffff'; rr(g, 24, 180, 400, 90, 22); g.fill(); g.fillStyle = '#9d9bbd'; g.font = '600 28px "Space Grotesk"'; g.fillText('waiting for a share…', 48, 226); }
  ph.tex.needsUpdate = true;
}

// ------------------------------------------------------------------ envelopes raining (hook) — a pile of school emails
const envTex = SUBJ.map((sbj, i) => canvasTex(300, 200, (g, w, h) => { gEnvelope(g, 0, 0, w, h, '#f3f1ff', '#9d8cf0'); g.fillStyle = P.magenta; rr(g, 16, h - 58, w - 32, 40, 12); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 22px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText(sbj.length > 20 ? sbj.slice(0, 19) + '…' : sbj, 26, h - 38); }));
const envs = SUBJ.map((_, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: envTex[i], roughness: 0.9 }), paper('#e6e2ff')]); m.castShadow = true; scene.add(m);
  let s = i * 97 + 13; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  m.userData = { t0: -0.6 + i * 0.15 + r() * 0.06, x0: -1.1 + r() * 2.2, rest: V3(-0.95 + r() * 1.9, DESK + 0.01 + i * 0.006, 0.45 + r() * 0.75), ry: r() * 2 - 1, spin: r() * 6 - 3 }; return m; });

// ------------------------------------------------------------------ the letters (opened school emails) and the paper wall calendar (month view)
const LET = { x: 1.15, z: 0.45 };
const letters = EV.slice(0, 4).map((e, i) => { const grp = new THREE.Group(); grp.position.set(LET.x - 0.28 + i * 0.19, DESK, LET.z + i * 0.05); grp.rotation.y = -0.35 + i * 0.12; scene.add(grp);
  const tex = canvasTex(300, 380, (g, w, h) => { g.fillStyle = '#ffffff'; rr(g, 0, 0, w, h, 18); g.fill(); g.fillStyle = '#3d46b5'; rr(g, 0, 0, w, 64, 18); g.fill(); g.fillRect(0, 40, w, 24); g.fillStyle = '#ffffff'; g.font = '700 24px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('School office', 18, 34);
    for (let k = 0; k < 4; k++) { g.fillStyle = '#d6d2f2'; rr(g, 18, 92 + k * 30, 250 - (k % 2) * 60, 14, 7); g.fill(); }
    g.fillStyle = e[3]; rr(g, 18, 230, 264, 110, 18); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 30px "Space Grotesk"'; g.fillText(e[2], 34, 266); g.font = '700 26px "Plex Mono"'; g.fillText(`${e[0]} Nov ${e[1]}`, 34, 310); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.79, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.22, roughness: 0.9 }), paper('#e6e2ff')]); m.position.y = 0.43; m.rotation.x = -0.18; m.castShadow = true; grp.add(m);
  const foot = card(0.5, 0.03, 0.25, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.06); grp.add(foot); return { grp, face: m }; });
const WCAL = { x: 2.0, z: -0.45, w: 1.5, h: 1.36, y: 1.05 };
const wcal = new THREE.Group(); wcal.position.set(WCAL.x, DESK, WCAL.z); wcal.rotation.y = -0.38; scene.add(wcal);
const wcCv = document.createElement('canvas'); wcCv.width = 600; wcCv.height = 544; const wcg = wcCv.getContext('2d'); const wcTex = new THREE.CanvasTexture(wcCv); wcTex.colorSpace = THREE.SRGBColorSpace; wcTex.anisotropy = 8;
{ const face = new THREE.Mesh(new THREE.BoxGeometry(WCAL.w, WCAL.h, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: wcTex, emissive: '#ffffff', emissiveMap: wcTex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = WCAL.y; face.rotation.x = -0.1; face.castShadow = true; wcal.add(face);
  const strut = card(0.45, 1.0, 0.04, P.violet, P.edge, 'z'); strut.position.set(0, 0.5, -0.32); strut.rotation.x = 0.45; wcal.add(strut); const foot = card(1.4, 0.05, 0.55, P.violet, P.edge); foot.position.set(0, 0.025, -0.08); wcal.add(foot); }
const dayCell = (d) => { const idx = d - 1 + 6, c = idx % 7, r = Math.floor(idx / 7); return [30 + c * 80 + 40, 150 + r * 76 + 38]; };   // Nov 2026 starts on a Sunday → offset 6 in a Mon-first grid
let wcKey = '';
function drawWallCal(on) { const k = on.map((v) => Math.round(v * 10)).join(','); if (k === wcKey) return; wcKey = k; const g = wcg; g.fillStyle = '#f7f5ff'; g.fillRect(0, 0, 600, 544); g.fillStyle = P.magenta; g.fillRect(0, 0, 600, 84); g.fillStyle = '#ffffff'; g.font = '700 48px "Space Grotesk"'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText('NOVEMBER', 300, 44);
  g.fillStyle = '#552dbc'; g.font = '700 22px "Space Grotesk"'; ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => g.fillText(d, 70 + i * 80, 118));
  for (let d = 1; d <= 30; d++) { const [x, y] = dayCell(d); g.strokeStyle = '#d6d2f2'; g.lineWidth = 2; g.strokeRect(x - 40, y - 38, 80, 76); g.fillStyle = '#9a93c4'; g.font = '600 22px "Space Grotesk"'; g.textAlign = 'left'; g.fillText(String(d), x - 34, y - 22); }
  EV.forEach((e, i) => { const a = clamp(on[i]); if (a <= 0) return; const [x, y] = dayCell(e[1]); g.save(); g.globalAlpha = a; g.fillStyle = e[3]; rr(g, x - 36, y - 6, 72, 40, 10); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 16px "Space Grotesk"'; g.textAlign = 'center'; g.fillText(e[2].split(' ')[0], x, y + 14); g.restore(); });
  g.textAlign = 'left'; wcTex.needsUpdate = true; }
const wcPt = (d) => { wcal.updateMatrixWorld(true); const [x, y] = dayCell(d); const v = V3((x / 600 - 0.5) * WCAL.w, WCAL.y + (0.5 - y / 544) * WCAL.h, 0.06); return wcal.localToWorld(v); };
const chips = EV.map((e) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.11, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(200, 110, (g, w, h) => { g.fillStyle = e[3]; rr(g, 0, 0, w, h, 18); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 54px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(e[1]), w / 2, h / 2 + 2); }), emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 0.9 }), paper('#e6e2ff')]); m.castShadow = true; scene.add(m); return m; });
const letPt = (i) => { letters[i].grp.updateMatrixWorld(true); return letters[i].face.localToWorld(V3(0, -0.2, 0.02)); };

const pointer = new THREE.Group(); scene.add(pointer);
{ const sh = new THREE.Shape(); [[0, 0], [0, -0.3], [0.075, -0.23], [0.13, -0.34], [0.17, -0.32], [0.115, -0.21], [0.21, -0.21]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false }), [paper('#ffffff'), paper(P.ink)]); m.castShadow = true; pointer.add(m); }
// ------------------------------------------------------------------ connectors (S6): a mail tile and a calendar tile wired to the phone
function tile(x, z, ry, draw) { const grp = new THREE.Group(); grp.position.set(x, DESK, z); grp.rotation.y = ry; scene.add(grp); const m = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(224, 224, draw), roughness: 0.9 }), paper('#cfc8ff')]); m.position.y = 0.36; m.castShadow = true; grp.add(m);
  const foot = card(0.5, 0.03, 0.26, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.08); grp.add(foot); return { grp, face: m }; }
const mailTile = tile(-1.05, 0.35, 0.3, (g, w, h) => { g.fillStyle = '#3d46b5'; rr(g, 0, 0, w, h, 40); g.fill(); gEnvelope(g, 42, 64, 140, 96, '#f3f1ff', '#7c3fda'); g.fillStyle = '#ffffff'; g.font = '700 30px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('Mail', w / 2, 196); });
const calTile = tile(0.98, 1.0, -0.3, (g, w, h) => { g.fillStyle = '#3d46b5'; rr(g, 0, 0, w, h, 40); g.fill(); gCalIcon(g, w / 2, 98, 2.0, '#f3f1ff'); g.fillStyle = '#ffffff'; g.font = '700 30px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('Calendar', w / 2, 196); });
const cordMat = new THREE.MeshBasicMaterial({ color: P.cyan }); let cords = [];
const newEnv = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.23, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: envTex[5], roughness: 0.9 }), paper('#e6e2ff')]); newEnv.castShadow = true; scene.add(newEnv);

// ------------------------------------------------------------------ availability + limit (S7): web laptop with the same space; share stopped at a "not yet" gate
const laptop = new THREE.Group(); laptop.position.set(-1.3, DESK, 0.15); laptop.rotation.y = 0.35; scene.add(laptop);
const lapCv = document.createElement('canvas'); lapCv.width = 640; lapCv.height = 400; const lg = lapCv.getContext('2d'); const lapTex = new THREE.CanvasTexture(lapCv); lapTex.colorSpace = THREE.SRGBColorSpace;
{ const base = card(1.2, 0.05, 0.8, P.lav, P.white); base.position.y = 0.025; laptop.add(base); const lid = card(1.2, 0.78, 0.04, P.navy2, P.lav, 'z'); lid.position.set(0, 0.43, -0.38); lid.rotation.x = -0.22; laptop.add(lid);
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.69), new THREE.MeshStandardMaterial({ map: lapTex, emissive: '#ffffff', emissiveMap: lapTex, emissiveIntensity: 0.55, roughness: 0.85 })); sc.position.set(0, 0.43, -0.355); sc.rotation.x = -0.22; laptop.add(sc); }
{ const g = lg; g.fillStyle = '#efecff'; g.fillRect(0, 0, 640, 400); g.fillStyle = '#24287e'; g.fillRect(0, 0, 640, 40); g.fillStyle = '#3d46b5'; rr(g, 120, 8, 400, 24, 12); g.fill(); g.fillStyle = '#c9bfff'; g.font = '600 16px "Plex Mono"'; g.textBaseline = 'middle'; g.fillText('Muse on the web', 140, 21);
  g.fillStyle = P.ink; g.font = '700 30px "Space Grotesk"'; g.fillText('School dashboard', 30, 74); EV.slice(0, 4).forEach((e, i) => { const x = 30 + (i % 2) * 300, y = 104 + Math.floor(i / 2) * 140; g.fillStyle = '#ffffff'; rr(g, x, y, 280, 120, 16); g.fill(); g.fillStyle = e[3]; rr(g, x, y, 80, 120, 16); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 34px "Space Grotesk"'; g.textAlign = 'center'; g.fillText(String(e[1]), x + 40, y + 62); g.textAlign = 'left'; g.fillStyle = P.ink; g.font = '700 24px "Space Grotesk"'; g.fillText(e[2], x + 96, y + 60); }); lapTex.needsUpdate = true; }
const gate = new THREE.Group(); gate.position.set(1.0, DESK, 1.05); gate.rotation.y = -0.3; scene.add(gate);
{ const tex = canvasTex(360, 300, (g, w, h) => { g.fillStyle = '#5a5f8f'; rr(g, 0, 0, w, h, 26); g.fill(); gLock(g, w / 2, 96, 2.2, '#f3f1ff'); g.fillStyle = '#ffffff'; g.font = '700 40px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Sharing', w / 2, 196); g.fillStyle = P.magenta; rr(g, 70, 226, 220, 52, 26); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 32px "Space Grotesk"'; g.fillText('not yet', w / 2, 253); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]); m.position.y = 0.3; m.castShadow = true; const h = new THREE.Group(); h.add(m); gate.add(h); gate.userData.hinge = h;
  const foot = card(0.6, 0.03, 0.26, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.08); gate.add(foot); }
const shareArrow = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.2, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(180, 100, (g, w, h) => { g.fillStyle = '#7c3fda'; rr(g, 0, 0, w, h, 30); g.fill(); gShare(g, w / 2, h / 2, 1.3, '#ffffff'); }), roughness: 0.9 }), paper('#e6e2ff')]); shareArrow.castShadow = true; scene.add(shareArrow);

// ------------------------------------------------------------------ the Media Diet paper sign (signature, CTA shot — accepted prop)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.25, DESK, 2.7);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const CLOSE = (u) => SH(L3([0.05, 1.78, 3.75], [0.04, 1.75, 3.55], u), V3(0.0, 1.62, -0.2), 46);
const SHOTS = {
  S1: (t) => { const u = prog(t, 0, 3.05); return SH(L3([0.0, 2.75, 4.95], [0.0, 2.65, 4.65], u), V3(0.0, 1.45, 0.2), 50); },
  S2: (t) => { const u = prog(t, 3.05, 5.0); return SH(L3([-3.12, 1.65, 3.45], [-3.15, 1.6, 3.2], u), V3(-3.12, 0.82, -0.2), 50); },
  S3: (t) => CLOSE(prog(t, 5.0, 6.95)),
  S4: (t) => { const u = prog(t, 6.95, 11.57); return SH(L3([2.02, 2.3, 4.35], [1.98, 2.25, 4.1], u), V3(1.8, 1.08, -0.1), 48); },
  S5: (t) => { const a = CLOSE(prog(t, 11.57, 14.5)), b = SH(L3([0.78, 2.75, 5.65], [0.78, 2.7, 5.45], prog(t, 15.0, 17.26)), V3(0.78, 1.12, 0.0), 50), u = prog(t, 14.5, 15.1); return SH(a.pos.clone().lerp(b.pos, u), a.look.clone().lerp(b.look, u), lerp(a.fov, b.fov, u)); },
  S6: (t) => { const u = prog(t, 17.26, 21.24); return SH(L3([0.0, 2.55, 4.85], [0.0, 2.5, 4.6], u), V3(0.0, 1.38, 0.1), 50); },
  S7: (t) => { const u = prog(t, 21.24, 25.95); return SH(L3([-0.15, 2.95, 5.95], [0.0, 2.9, 5.75], u), V3(0.05, 1.18, 0.4), 50); },
  S8: (t) => { const u = prog(t, 25.95, 29.6); return SH(L3([0.3, 3.2, 9.0], [0.4, 4.0, 10.1], u), L3([0.2, 1.0, 0.5], [0.2, 1.05, 0.2], u), 48, lerp(7.6, 8.8, u)); },
};

// ------------------------------------------------------------------ per-frame update
const arc = (a, b, h, u) => a.clone().lerp(b, u).add(V3(0, Math.sin(Math.PI * u) * h, 0));
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;

  // phone screens
  if (id === 'S1' || id === 'S2') phoneDraw(PHONE, { mode: 'flood', scroll: t * 3.2, unread: Math.min(47, 12 + Math.floor(t * 12)) });
  else if (id === 'S3') phoneDraw(PHONE, { mode: 'muse', spaces: prog(t, E.spaces, E.spaces + 0.6, (x) => x), newBtn: prog(t, E.newBtn, E.newBtn + 0.35) });
  else if (id === 'S4') phoneDraw(PHONE, { mode: 'flood', scroll: 20 + t * 0.4, unread: 47 });
  else if (id === 'S5' && t < E.dash) phoneDraw(PHONE, { mode: 'prompt', t, type: prog(t, E.type, E.type + 1.5, (x) => x), build: prog(t, E.build, E.dash, (x) => x) });
  else if (id === 'S5') phoneDraw(PHONE, { mode: 'dash', cards: prog(t, E.dash, E.dash + 0.6, (x) => x), fresh: 0, share: 0, sync: 0 });
  else if (id === 'S6') phoneDraw(PHONE, { mode: 'dash', cards: 1, fresh: prog(t, E.fresh, E.fresh + 0.35), share: 0, sync: prog(t, E.sync, E.sync + 0.8, (x) => x) });
  else phoneDraw(PHONE, { mode: 'dash', cards: 1, fresh: 1, share: id === 'S7' ? prog(t, E.notyet, E.notyet + 0.3) : 1, sync: 1 });
  phoneDraw(PARTNER, { mode: 'mini' });
  // envelopes rain down and pile up in front of the phone (hook); they stay as a pile
  envs.forEach((m) => { const d = m.userData; const u = prog(t, d.t0, d.t0 + 0.75, (x) => x); m.visible = t >= d.t0; if (!m.visible) return; const top = V3(d.x0, 3.4, 0.6 + (d.rest.z - 0.6) * 0.3);
    m.position.copy(top.clone().lerp(d.rest, u * u)); m.rotation.set(-Math.PI / 2 * u + (1 - u) * 0.4 * Math.sin(t * 6 + d.ry), d.ry + d.spin * (1 - u), (1 - u) * d.spin * 0.3); });
  // wall calendar: before = two dates copied by hand (S4); now = every event lands at once (S5); new one later (S6)
  let on;
  if (id === 'S4') on = EV.map((e, i) => (i < 2 ? prog(t, E.manual[i] + 1.0, E.manual[i] + 1.15) : 0));
  else if (t < E.fly) on = EV.map(() => 0);
  else on = EV.map((e, i) => (i < 4 ? prog(t, E.fly + i * 0.12 + 0.55, E.fly + i * 0.12 + 0.7) : prog(t, E.fresh + 0.55, E.fresh + 0.7)));
  drawWallCal(on);
  chips.forEach((m, i) => { let p = null, u = 0;
    if (id === 'S4' && i < 2) { const t0 = E.manual[i]; u = prog(t, t0, t0 + 1.0); if (t >= t0 && t < t0 + 1.0) p = arc(letPt(i), wcPt(EV[i][1]), 0.25, ease(u)); }
    else if ((id === 'S5' || id === 'S6') && i < 4) { const t0 = E.fly + i * 0.12; u = prog(t, t0, t0 + 0.55, (x) => x); if (t >= t0 && t < t0 + 0.55) p = arc(letPt(i), wcPt(EV[i][1]), 0.45, ease(u)); }
    else if (id === 'S6' && i === 4) { const t0 = E.fresh; u = prog(t, t0, t0 + 0.55, (x) => x); if (t >= t0 && t < t0 + 0.55) p = arc(scrPt(PHONE, 270, 220, 0.1), calTile.face.localToWorld(V3(0, 0, 0.05)), 0.4, ease(u)); }
    m.visible = !!p; if (p) { m.position.copy(p); m.quaternion.copy(camera.quaternion); } });
  // the paper pointer copies dates by hand (S4): it rides along with each chip
  { let p = null; if (id === 'S4') for (let i = 0; i < 2; i++) { const t0 = E.manual[i]; if (t >= t0 - 0.3 && t < t0 + 1.25) p = t < t0 ? letPt(i) : t < t0 + 1.0 ? chips[i].position.clone() : wcPt(EV[i][1]); }
    pointer.visible = !!p; if (p) { pointer.position.copy(p).add(V3(0.04, -0.06, 0.08)); pointer.quaternion.copy(camera.quaternion); } }
  // tags: Before / Now
  tagBefore.visible = id === 'S4'; tagBefore.scale.setScalar(Math.max(0.01, prog(t, 7.0, 7.35, outBack)));
  tagNow.visible = id === 'S5'; tagNow.scale.setScalar(Math.max(0.01, prog(t, 11.65, 12.0, outBack)));
  // connectors: cords mail → phone → calendar, a new email arrives and flows through (S6)
  cords.forEach((c) => { scene.remove(c); c.geometry.dispose(); }); cords = [];
  mailTile.grp.visible = calTile.grp.visible = id === 'S6' || t >= 25.95;
  if (id === 'S6' || t >= 25.95) { const s = prog(t, 17.4, 17.9, outBack); mailTile.grp.scale.setScalar(Math.max(0.01, t >= 25.95 ? 1 : s)); calTile.grp.scale.setScalar(Math.max(0.01, t >= 25.95 ? 1 : prog(t, 17.55, 18.05, outBack)));
    const d = t >= 25.95 ? 1 : prog(t, E.connect, E.connect + 0.6); if (d > 0) { const pairs = [[mailTile.face.localToWorld(V3(0.28, 0, 0)), scrPt(PHONE, 0, 600, 0.0)], [scrPt(PHONE, 540, 600, 0.0), calTile.face.localToWorld(V3(-0.28, 0, 0))]];
      pairs.forEach(([a, b]) => { const curve = new THREE.QuadraticBezierCurve3(a, a.clone().lerp(b, 0.5).add(V3(0, -0.35, 0.25)), b); const geo = new THREE.TubeGeometry(curve, 32, 0.014, 6, false); geo.setDrawRange(0, Math.floor(geo.index.count * d / 3) * 3); const m = new THREE.Mesh(geo, cordMat); scene.add(m); cords.push(m); }); } }
  { const show = id === 'S6' && t >= E.newMail && t < E.newMail + 0.6; newEnv.visible = show; if (show) { const a = V3(-1.9, 2.6, 0.9), b = mailTile.face.localToWorld(V3(0, 0, 0.05)); newEnv.position.copy(arc(a, b, 0.3, prog(t, E.newMail, E.newMail + 0.55))); newEnv.quaternion.copy(camera.quaternion); } }
  mailTile.face.rotation.z = 0.12 * Math.sin(Math.PI * clamp((t - E.newMail - 0.55) / 0.3));
  // availability + limit: laptop shows the same space; the share card bounces off the "not yet" gate
  laptop.visible = id === 'S7' || t >= 25.95; laptop.scale.setScalar(Math.max(0.01, t >= 25.95 ? 1 : prog(t, E.web, E.web + 0.4, outBack)));
  gate.visible = PARTNER.grp.visible = id === 'S7' || t >= 25.95; gate.scale.setScalar(Math.max(0.01, t >= 25.95 ? 1 : prog(t, E.gate, E.gate + 0.35, outBack))); PARTNER.grp.scale.setScalar(0.42 * Math.max(0.01, t >= 25.95 ? 1 : prog(t, E.gate - 0.1, E.gate + 0.25, outBack)));
  gate.userData.hinge.rotation.z = 0.08 * Math.sin(Math.PI * clamp((t - E.bounce) / 0.3));
  { const show = id === 'S7' && t >= E.shareGo && t < E.bounce + 0.7; shareArrow.visible = show; if (show) { const a = scrPt(PHONE, 120, 848, 0.15), b = gate.localToWorld(V3(-0.05, 0.35, 0.1)); const back = a.clone().lerp(b, 0.55);
      const p = t < E.bounce ? a.clone().lerp(b, ease(prog(t, E.shareGo, E.bounce))) : b.clone().lerp(back, prog(t, E.bounce, E.bounce + 0.6, outC)).add(V3(0, -0.25 * prog(t, E.bounce, E.bounce + 0.6), 0)); shareArrow.position.copy(p); shareArrow.quaternion.copy(camera.quaternion); } }
  // calendar 4 → 5 → 6, the source placard hinges up
  calPages.forEach((h, i) => { if (i === 0) return; const k = 2 - i; const u = prog(t, E.calFlip + k * 0.3, E.calFlip + k * 0.3 + 0.32); h.rotation.x = lerp(-0.18, 0.5 - Math.PI * 2, u); });
  srcCard.visible = t >= 3.05; { const u = prog(t, E.source, E.source + 0.45, outBack); srcHinge.rotation.x = -Math.PI / 2 * (1 - clamp(u, 0, 1.2)); }
  // sign hinges up for the CTA
  const su = prog(t, E.sign, E.sign + 0.45, outBack); sign.visible = t >= E.sign - 0.1; sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(su, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}
function tagCard(text, col, w = 0.86) { const grp = new THREE.Group(); scene.add(grp); const tex = canvasTex(520, 120, (g, W_, H_) => { g.fillStyle = col; rr(g, 0, 0, W_, H_, 60); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 58px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W_ / 2, H_ / 2 + 3); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(w, w * 0.23, 0.02), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.2, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = w * 0.16; face.rotation.x = -0.45; face.castShadow = true; grp.add(face); return grp; }
const tagBefore = tagCard('Before', '#5a5f8f'); tagBefore.position.set(1.45, DESK, 1.15); tagBefore.rotation.y = -0.2;
const tagNow = tagCard('Now', '#2a9fbf'); tagNow.position.set(0.0, DESK, 0.62);

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
