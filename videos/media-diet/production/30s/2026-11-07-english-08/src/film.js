// Media Diet · 30 s English episode (english-08) — text a recipe photo to Alexa for Shopping and the ingredients land in your cart (Amazon, 6 Nov 2026)
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



// ------------------------------------------------------------------ small canvas glyphs (generic; no Amazon/Alexa logos or UI)
function gEnvelope(g, x, y, w, h, col = '#f3f1ff', line = '#9d8cf0') { g.fillStyle = col; rr(g, x, y, w, h, h * 0.12); g.fill(); g.strokeStyle = line; g.lineWidth = Math.max(2, h * 0.06); g.beginPath(); g.moveTo(x + w * 0.06, y + h * 0.12); g.lineTo(x + w / 2, y + h * 0.58); g.lineTo(x + w * 0.94, y + h * 0.12); g.stroke(); }
function gLock(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -22, -6, 44, 34, 6); g.fill(); g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.arc(0, -6, 14, Math.PI, 0); g.stroke(); g.restore(); }
function gPin(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -12, 20, Math.PI * 0.85, Math.PI * 0.15); g.lineTo(0, 30); g.closePath(); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, -12, 8, 0, Math.PI * 2); g.fill(); g.restore(); }
function gLink(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.7); g.strokeStyle = col; g.lineWidth = 9; for (const dx of [-17, 17]) { rr(g, dx - 22, -13, 44, 26, 13); g.stroke(); } g.restore(); }
function gCal(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -24, -20, 48, 44, 7); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(-18, -6, 36, 24); g.fillStyle = col; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.fillRect(-14 + i * 11, -1 + j * 10, 7, 6); g.fillRect(-14, -28, 6, 12); g.fillRect(8, -28, 6, 12); g.restore(); }
function gBubble(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -4, 26, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(-18, 12); g.lineTo(-26, 28); g.lineTo(-4, 20); g.fill(); g.fillStyle = '#ffffff'; for (const dx of [-10, 0, 10]) { g.beginPath(); g.arc(dx, -4, 3.5, 0, Math.PI * 2); g.fill(); } g.restore(); }
function gNoPhone(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#ffffff'; g.lineWidth = 6; rr(g, -14, -24, 28, 48, 6); g.stroke(); g.strokeStyle = P.magenta; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-24, 24); g.lineTo(24, -24); g.stroke(); g.restore(); }
function gDownload(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(0, -34); g.lineTo(0, 10); g.stroke(); g.beginPath(); g.moveTo(-18, -8); g.lineTo(0, 12); g.lineTo(18, -8); g.stroke(); g.beginPath(); g.moveTo(-30, 14); g.lineTo(-30, 30); g.lineTo(30, 30); g.lineTo(30, 14); g.stroke(); g.restore(); }
function gSpark(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, q = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); }
function gCart(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-40, -26); g.lineTo(-28, -26); g.lineTo(-16, 14); g.lineTo(28, 14); g.lineTo(36, -14); g.lineTo(-22, -14); g.stroke(); g.beginPath(); g.arc(-12, 28, 7, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(24, 28, 7, 0, Math.PI * 2); g.fill(); g.restore(); }
function gLens(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.arc(-6, -6, 18, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(8, 8); g.lineTo(24, 24); g.stroke(); g.restore(); }
// the recipe (fictional example; Amazon's own announcement illustrates the same idea with lasagna ingredients)
const ING = [['Lasagna noodles', '#e8b04a'], ['Ricotta', '#f3f1ff'], ['Mozzarella', '#ffe7a6'], ['Tomato sauce', '#e2445c'], ['Spinach', '#3fae6a'], ['Garlic', '#d9cfc0'], ['Basil', '#2f8f4e']];
function drawRecipeMini(g, x, y, w, h) {   // the recipe card as seen in a photo / viewfinder
  g.save(); g.fillStyle = '#f7f3e8'; rr(g, x, y, w, h, w * 0.05); g.fill(); g.fillStyle = P.magenta; rr(g, x, y, w, h * 0.16, w * 0.05); g.fill(); g.fillRect(x, y + h * 0.08, w, h * 0.08);
  g.fillStyle = '#ffffff'; g.font = `700 ${Math.round(h * 0.1)}px "Space Grotesk"`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Lasagna', x + w * 0.08, y + h * 0.085);
  for (let i = 0; i < 7; i++) { const yy = y + h * (0.24 + i * 0.1); g.fillStyle = ING[i][1]; g.beginPath(); g.arc(x + w * 0.12, yy, h * 0.025, 0, Math.PI * 2); g.fill(); g.fillStyle = '#9a93c4'; rr(g, x + w * 0.2, yy - h * 0.018, w * (0.42 + 0.25 * ((i * 37) % 7) / 7), h * 0.036, h * 0.018); g.fill(); }
  g.restore();
}

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
// the source placard (shown on screen: who said it, and when)
const srcCard = new THREE.Group(); srcCard.position.set(-3.1, DESK, 0.22); srcCard.rotation.y = 0.12; scene.add(srcCard);
const srcHinge = new THREE.Group(); srcCard.add(srcHinge);
{ const tex = canvasTex(640, 300, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 26); g.fill(); g.fillStyle = P.magenta; rr(g, 0, 0, w, 78, 26); g.fill(); g.fillRect(0, 40, w, 38);
    g.fillStyle = '#ffffff'; g.font = '700 46px "Space Grotesk"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('SOURCE', 34, 42);
    g.fillStyle = P.ink; g.font = '700 60px "Space Grotesk"'; g.fillText('Amazon News', 34, 146); g.fillStyle = '#552dbc'; g.font = '600 48px "Plex Mono"'; g.fillText('Nov 6, 2026', 34, 228); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.6, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]);
  face.position.y = 0.36; face.castShadow = true; srcHinge.add(face); const foot = card(1.28, 0.03, 0.4, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.16); srcCard.add(foot); }

// ------------------------------------------------------------------ the paper phone on a stand (generic screens; no Amazon UI copied)
const PH = { w: 1.22, h: 2.3, sw: 1.08, sh: 2.12, cw: 540, ch: 1060 }; PH.cy = PH.h / 2 + 0.06;
function makePhone(x, z, ry, body = P.navy2) {
  const grp = new THREE.Group(); grp.position.set(x, DESK, z); grp.rotation.y = ry; scene.add(grp);
  const tilt = new THREE.Group(); tilt.rotation.x = -0.08; grp.add(tilt);
  const b = card(PH.w, PH.h, 0.08, body, P.lav, 'z'); b.position.y = PH.cy; tilt.add(b);
  const cv = document.createElement('canvas'); cv.width = PH.cw; cv.height = PH.ch; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(PH.sw, PH.sh), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.6, roughness: 0.85 })); scr.position.set(0, PH.cy, 0.041); tilt.add(scr);
  const strut = card(0.5, 1.2, 0.05, P.violet, P.edge, 'z'); strut.position.set(0, 0.62, -0.32); strut.rotation.x = 0.42; grp.add(strut);
  const foot = card(1.1, 0.06, 0.75, P.violet, P.edge); foot.position.set(0, 0.03, -0.12); grp.add(foot);
  const lip = card(1.1, 0.1, 0.06, P.violet2, P.edge, 'z'); lip.position.set(0, 0.1, 0.1); grp.add(lip);
  return { grp, tilt, g: cv.getContext('2d'), tex, key: '' };
}
const scrPt = (ph, cx, cy, dz = 0.06) => { ph.grp.updateMatrixWorld(true); return ph.tilt.localToWorld(V3((cx / PH.cw - 0.5) * PH.sw, PH.cy + (0.5 - cy / PH.ch) * PH.sh, dz)); };
const PHONE = makePhone(0.78, -0.3, -0.16);
function statusBar(g, dark) { g.fillStyle = dark ? '#0d1240' : '#efecff'; g.fillRect(0, 0, PH.cw, PH.ch); g.fillStyle = '#24287e'; g.fillRect(0, 0, PH.cw, 44); g.fillStyle = '#c9bfff'; g.font = '600 22px "Plex Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 24, 23);
  for (let i = 0; i < 3; i++) g.fillRect(PH.cw - 92 + i * 10, 30 - i * 5, 6, 6 + i * 5); rr(g, PH.cw - 52, 14, 30, 16, 4); g.fill(); }
function header(g, title, sub, glyph) { g.fillStyle = '#3d46b5'; g.fillRect(0, 44, PH.cw, 100); let x = 32; if (glyph) { g.fillStyle = '#f3f1ff'; g.beginPath(); g.arc(62, 94, 30, 0, Math.PI * 2); g.fill(); glyph(g, 62, 92); x = 108; }
  g.fillStyle = '#ffffff'; g.font = '700 34px "Space Grotesk"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(title, x, sub ? 80 : 94); if (sub) { g.fillStyle = '#c9bfff'; g.font = '600 22px "Space Grotesk"'; g.fillText(sub, x, 116); } }
function bubble(g, x, y, w, h, mine, a = 1) { g.save(); g.globalAlpha = clamp(a); g.fillStyle = mine ? '#7c3fda' : '#ffffff'; rr(g, x, y, w, h, 24); g.fill(); g.restore(); }
function phoneDraw(ph, s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 30) / 30 : v)); if (key === ph.key) return; ph.key = key;
  const g = ph.g; g.textAlign = 'left'; g.textBaseline = 'middle';
  if (s.mode === 'camera') {
    statusBar(g, true);
    // viewfinder framing the recipe card
    drawRecipeMini(g, 95, 190, 350, 500); g.strokeStyle = '#ffffff'; g.lineWidth = 6; for (const [cx, cy, dx, dy] of [[70, 165, 1, 1], [470, 165, -1, 1], [70, 715, 1, -1], [470, 715, -1, -1]]) { g.beginPath(); g.moveTo(cx, cy + dy * 46); g.lineTo(cx, cy); g.lineTo(cx + dx * 46, cy); g.stroke(); }
    g.fillStyle = '#c9bfff'; g.font = '700 26px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('PHOTO', 270, 790); g.textAlign = 'left';
    const pr = clamp(s.press); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(270, 900, 62 - 8 * Math.sin(Math.PI * pr), 0, Math.PI * 2); g.fill(); g.strokeStyle = '#0d1240'; g.lineWidth = 6; g.beginPath(); g.arc(270, 900, 50 - 8 * Math.sin(Math.PI * pr), 0, Math.PI * 2); g.stroke();
    if (s.shot > 0) { g.save(); g.globalAlpha = clamp(s.shot * 3); drawRecipeMini(g, 50, 860, 70, 96); g.restore(); }
    if (s.flash > 0) { g.fillStyle = `rgba(255,255,255,${clamp(s.flash)})`; g.fillRect(0, 44, PH.cw, PH.ch); }
  } else if (s.mode === 'thread') {
    statusBar(g); header(g, 'Alexa for Shopping', 'Text message', (c, x, y) => gCart(c, x, y, 0.55, '#552dbc'));
    let y = 180;
    // the invitation text (illustration of "a text message inviting them to try the experience")
    const inv = clamp(s.invite); if (inv > 0) { g.save(); g.translate(0, 30 * (1 - outC(inv))); bubble(g, 26, y, 400, 150, false, inv); g.globalAlpha = inv; gEnvelope(g, 50, y + 30, 70, 50, '#7c3fda', '#f3f1ff'); g.fillStyle = P.ink; g.font = '700 30px "Space Grotesk"'; g.fillText("You're invited to", 136, y + 46); g.fillText('shop by text', 136, y + 86); g.fillStyle = '#7a74b8'; g.font = '600 22px "Space Grotesk"'; g.fillText('Accept terms · link your number', 50, y + 124); g.restore(); }
    y += 180;
    const ph_ = clamp(s.photo); if (ph_ > 0) { g.save(); g.translate(40 * (1 - outC(ph_)), 0); bubble(g, 214, y, 300, 330, true, ph_); g.globalAlpha = ph_; drawRecipeMini(g, 236, y + 22, 256, 286); g.restore(); }
    y += 350;
    const ty = clamp(s.typing); if (ty > 0 && s.reply <= 0) { bubble(g, 26, y, 130, 64, false, 1); for (let i = 0; i < 3; i++) { g.fillStyle = '#9a93c4'; g.beginPath(); g.arc(62 + i * 28, y + 32, 8 + 3 * Math.sin(s.t * 12 - i), 0, Math.PI * 2); g.fill(); } }
    const rp = clamp(s.reply); if (rp > 0) { g.save(); g.translate(0, 24 * (1 - outC(rp))); bubble(g, 26, y, 460, 300, false, rp); g.globalAlpha = rp; sCheck(g, 64, y + 42, 20, 1); g.fillStyle = P.ink; g.font = '700 30px "Space Grotesk"'; g.fillText('Added 7 items to your cart', 96, y + 44);
      for (let i = 0; i < 7; i++) { const cx = 46 + (i % 2) * 214, cy = y + 92 + Math.floor(i / 2) * 44; g.fillStyle = ING[i][1]; g.beginPath(); g.arc(cx + 10, cy, 9, 0, Math.PI * 2); g.fill(); g.fillStyle = '#41406e'; g.font = '600 22px "Space Grotesk"'; g.fillText(ING[i][0], cx + 28, cy + 1); }
      g.restore(); }
    g.fillStyle = '#ffffff'; rr(g, 26, 970, 488, 64, 32); g.fill(); g.fillStyle = '#9d9bbd'; g.font = '600 24px "Space Grotesk"'; g.fillText('Text message', 56, 1003);
  } else if (s.mode === 'search') {
    statusBar(g); header(g, 'Shop', null, (c, x, y) => gCart(c, x, y, 0.55, '#552dbc'));
    const k = s.k, q = k >= 0 ? ING[k][0] : ''; const typed = q.slice(0, Math.round(q.length * clamp(s.type)));
    g.fillStyle = '#ffffff'; rr(g, 26, 168, 488, 76, 38); g.fill(); g.strokeStyle = P.cyan; g.lineWidth = 4; g.stroke(); gLens(g, 66, 206, 0.8, '#552dbc'); g.fillStyle = P.ink; g.font = '700 30px "Space Grotesk"'; g.fillText(typed, 104, 208); if (k >= 0) { g.fillStyle = P.magenta; rr(g, 330, 110, 184, 46, 23); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 26px "Space Grotesk"'; g.textAlign = 'center'; g.fillText(`search ${k + 1} of 7`, 422, 134); g.textAlign = 'left'; }
    if (s.type > 0 && s.type < 1 && Math.floor(s.t * 6) % 2 === 0) { g.fillStyle = P.ink; g.fillRect(108 + g.measureText(typed).width, 186, 3, 42); }
    if (k >= 0 && s.res > 0) { g.save(); g.globalAlpha = clamp(s.res * 2); g.fillStyle = '#ffffff'; rr(g, 26, 276, 488, 300, 24); g.fill(); g.fillStyle = ING[k][1]; rr(g, 50, 300, 150, 150, 18); g.fill(); g.strokeStyle = 'rgba(20,22,58,0.15)'; g.lineWidth = 3; g.stroke();
      g.fillStyle = P.ink; g.font = '700 32px "Space Grotesk"'; g.fillText(ING[k][0], 222, 330); for (let i = 0; i < 2; i++) { g.fillStyle = '#d6d2f2'; rr(g, 222, 372 + i * 34, 220 - i * 70, 16, 8); g.fill(); }
      const pr = clamp(s.add); const sc = 1 - 0.07 * Math.sin(Math.PI * pr); g.save(); g.translate(270, 512); g.scale(sc, sc); g.fillStyle = pr >= 1 ? '#2a9fbf' : P.magenta; rr(g, -220, -36, 440, 72, 36); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 30px "Space Grotesk"'; g.textAlign = 'center'; g.fillText(pr >= 1 ? 'Added' : 'Add to cart', 0, 2); g.restore(); g.textAlign = 'left'; g.restore(); }
    g.fillStyle = '#ffffff'; rr(g, 26, 610, 488, 96, 24); g.fill(); gCart(g, 80, 656, 0.7, '#552dbc'); g.fillStyle = P.ink; g.font = '700 30px "Space Grotesk"'; g.fillText(`Cart: ${s.n} of 7`, 130, 658);
    for (let i = 0; i < 7; i++) { g.fillStyle = i < s.n ? ING[i][1] : '#dcd8f4'; g.beginPath(); g.arc(70 + i * 66, 780, 22, 0, Math.PI * 2); g.fill(); if (i < s.n) { g.strokeStyle = 'rgba(20,22,58,0.25)'; g.lineWidth = 2; g.stroke(); } }
  }
  ph.tex.needsUpdate = true;
}

// ------------------------------------------------------------------ the recipe card on its easel + ingredient tiles that can leave it
const REC = { x: -0.88, z: -0.7, r: 0.16, w: 1.3, h: 1.85, y: 1.12 };
const rec = new THREE.Group(); rec.position.set(REC.x, DESK, REC.z); rec.rotation.y = REC.r; scene.add(rec);
const recTilt = new THREE.Group(); recTilt.rotation.x = -0.1; rec.add(recTilt);
const rcv = document.createElement('canvas'); rcv.width = 520; rcv.height = 740; const rcg = rcv.getContext('2d'); const rTex = new THREE.CanvasTexture(rcv); rTex.colorSpace = THREE.SRGBColorSpace; rTex.anisotropy = 8;
{ const face = new THREE.Mesh(new THREE.BoxGeometry(REC.w, REC.h, 0.03), [paper('#efe8d6'), paper('#efe8d6'), paper('#efe8d6'), paper('#efe8d6'), new THREE.MeshStandardMaterial({ map: rTex, emissive: '#ffffff', emissiveMap: rTex, emissiveIntensity: 0.22, roughness: 0.9 }), paper('#e6dcc4')]); face.position.y = REC.y; face.castShadow = true; recTilt.add(face);
  const strut = card(0.4, 1.0, 0.04, P.violet, P.edge, 'z'); strut.position.set(0, 0.5, -0.3); strut.rotation.x = 0.45; rec.add(strut); const foot = card(1.2, 0.05, 0.6, P.violet, P.edge); foot.position.set(0, 0.025, -0.08); rec.add(foot);
  const lip = card(1.2, 0.08, 0.05, P.violet2, P.edge, 'z'); lip.position.set(0, 0.09, 0.08); rec.add(lip); }
const lineY = (i) => 236 + i * 64;   // canvas y of ingredient line i
let rKey = '';
function drawRecipe(checks) { const k = String(checks); if (k === rKey) return; rKey = k; const g = rcg; g.fillStyle = '#f7f3e8'; g.fillRect(0, 0, 520, 740); g.fillStyle = P.magenta; g.fillRect(0, 0, 520, 120);
  g.fillStyle = '#ffffff'; g.font = '700 64px "Space Grotesk"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('Lasagna', 36, 62); g.fillStyle = '#552dbc'; g.font = '700 30px "Space Grotesk"'; g.fillText('INGREDIENTS', 36, 172);
  for (let i = 0; i < 7; i++) { const y = lineY(i); g.strokeStyle = '#9a93c4'; g.lineWidth = 4; rr(g, 448, y - 20, 40, 40, 8); g.stroke(); if (i < checks) { g.fillStyle = P.cyan; rr(g, 448, y - 20, 40, 40, 8); g.fill(); g.strokeStyle = P.ink; g.lineWidth = 6; g.beginPath(); g.moveTo(455, y); g.lineTo(465, y + 10); g.lineTo(481, y - 12); g.stroke(); } g.fillStyle = 'rgba(154,147,196,0.35)'; rr(g, 30, y - 22, 400, 44, 12); g.fill(); }
  g.fillStyle = '#9a93c4'; for (let i = 0; i < 2; i++) { rr(g, 36, 690 + i * 0, 300, 10, 5); g.fill(); } rTex.needsUpdate = true; }
const recPt = (cx, cy, dz = 0.03) => { rec.updateMatrixWorld(true); return recTilt.localToWorld(V3((cx / 520 - 0.5) * REC.w, REC.y + (0.5 - cy / 740) * REC.h, dz)); };
const tiles = ING.map(([name, col]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.11, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(456, 66, (g, w, h) => { g.fillStyle = '#ffffff'; rr(g, 0, 0, w, h, 14); g.fill(); g.fillStyle = col; rr(g, 0, 0, 34, h, 14); g.fill(); g.fillRect(16, 0, 18, h); g.strokeStyle = 'rgba(20,22,58,0.2)'; g.lineWidth = 2; rr(g, 1, 1, w - 2, h - 2, 14); g.stroke(); g.fillStyle = P.ink; g.font = '700 38px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText(name, 52, h / 2 + 2); }), emissive: '#ffffff', emissiveIntensity: 0.1, roughness: 0.9 }), paper('#e6e2ff')]); m.castShadow = true; scene.add(m); return m; });

// ------------------------------------------------------------------ the paper shopping cart
const CART = { x: -0.15, z: 1.32 };
const cart = new THREE.Group(); cart.position.set(CART.x, DESK, CART.z); cart.rotation.y = -0.18; cart.scale.setScalar(0.85); scene.add(cart);
const meshTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#7c3fda'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9bfff'; g.lineWidth = 4; for (let x = 12; x < w; x += 26) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 14; y < h; y += 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
const meshMat = new THREE.MeshStandardMaterial({ map: meshTex, roughness: 0.9 });
const cartBody = new THREE.Group(); cart.add(cartBody);
{ const W = 1.15, D = 0.72, H = 0.48, Y = 0.42;
  const bot = card(W, 0.04, D, P.violet, P.edge); bot.position.y = Y; cartBody.add(bot);
  for (const [x, z, w, d] of [[0, D / 2, W, 0.03], [0, -D / 2, W, 0.03], [W / 2, 0, 0.03, D], [-W / 2, 0, 0.03, D]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, d), [meshMat, meshMat, paper(P.lav), paper(P.lav), meshMat, meshMat]); m.position.set(x, Y + H / 2, z); m.castShadow = true; cartBody.add(m); }
  const rim = card(W + 0.06, 0.04, 0.06, P.lav, P.white, 'y'); rim.position.set(0, Y + H, D / 2); cartBody.add(rim); const rim2 = rim.clone(); rim2.position.z = -D / 2; cartBody.add(rim2);
  const hpost = card(0.04, 0.42, 0.04, P.lav, P.white, 'x'); hpost.position.set(-W / 2 - 0.12, Y + H + 0.12, 0); hpost.rotation.z = 0.5; cartBody.add(hpost);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, D + 0.1, 16), paper(P.magenta)); handle.rotation.x = Math.PI / 2; handle.position.set(-W / 2 - 0.22, Y + H + 0.3, 0); handle.castShadow = true; cartBody.add(handle);
  for (const x of [-0.42, 0.42]) for (const z of [-0.26, 0.26]) { const leg = card(0.035, Y - 0.08, 0.035, P.lav, P.white, 'x'); leg.position.set(x, (Y - 0.08) / 2 + 0.08, z); cartBody.add(leg);
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 20), paper(P.navy2)); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.075, z); wh.castShadow = true; cartBody.add(wh); } }
const cartSlot = (i) => { cart.updateMatrixWorld(true); return cart.localToWorld(V3(-0.36 + (i % 4) * 0.24, 0.62 + Math.floor(i / 4) * 0.08, -0.12 + (i % 2) * 0.16)); };

// ------------------------------------------------------------------ "Before" / "Now" tags, search counter and paper clock (S4)
function tagCard(text, col, w = 0.86) { const grp = new THREE.Group(); scene.add(grp); const tex = canvasTex(520, 120, (g, W_, H_) => { g.fillStyle = col; rr(g, 0, 0, W_, H_, 60); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 58px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W_ / 2, H_ / 2 + 3); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(w, w * 0.23, 0.02), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.2, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = w * 0.16; face.rotation.x = -0.45; face.castShadow = true; grp.add(face); return grp; }
const tagBefore = tagCard('Before', '#5a5f8f'); tagBefore.position.set(0.75, DESK, 0.62); tagBefore.rotation.y = -0.16;
const tagNow = tagCard('Now', '#2a9fbf'); tagNow.position.set(0.75, DESK, 0.62); tagNow.rotation.y = -0.16;
const counter = new THREE.Group(); counter.position.set(-0.32, DESK, 0.55); counter.rotation.y = 0.1; scene.add(counter);
const ccv = document.createElement('canvas'); ccv.width = 300; ccv.height = 240; const ccg = ccv.getContext('2d'); const cTex = new THREE.CanvasTexture(ccv); cTex.colorSpace = THREE.SRGBColorSpace;
{ const face = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.5, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: cTex, emissive: '#ffffff', emissiveMap: cTex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = 0.3; face.rotation.x = -0.25; face.castShadow = true; counter.add(face);
  const foot = card(0.62, 0.03, 0.3, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.1); counter.add(foot); }
let cKey = '';
function drawCounter(n, bump) { const k = n + ':' + Math.round(bump * 10); if (k === cKey) return; cKey = k; const g = ccg; g.fillStyle = '#f3f1ff'; rr(g, 0, 0, 300, 240, 26); g.fill(); gLens(g, 56, 56, 0.9, '#552dbc'); g.fillStyle = '#552dbc'; g.font = '700 32px "Space Grotesk"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('searches', 96, 56);
  g.fillStyle = P.ink; g.font = `700 ${Math.round(120 * (1 + 0.15 * bump))}px "Space Grotesk"`; g.textAlign = 'center'; g.fillText(String(n), 150, 160); cTex.needsUpdate = true; }
const clock = new THREE.Group(); clock.position.set(-1.05, DESK, 0.45); clock.rotation.y = 0.25; scene.add(clock);
const hand = new THREE.Group();
{ const face = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 40), [paper(P.lav), paper(P.white), paper(P.white)]); face.rotation.x = Math.PI / 2; face.position.y = 0.36; face.castShadow = true; clock.add(face);
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.23, 40), new THREE.MeshStandardMaterial({ map: canvasTex(256, 256, (g) => { g.fillStyle = '#f3f1ff'; g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill(); g.fillStyle = '#552dbc'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.arc(128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100, i % 3 ? 6 : 10, 0, Math.PI * 2); g.fill(); } }), roughness: 0.9 })); dial.position.set(0, 0.36, 0.021); clock.add(dial);
  hand.position.set(0, 0.36, 0.03); clock.add(hand); const h1 = card(0.03, 0.18, 0.01, P.magenta, P.magenta, 'z'); h1.position.y = 0.08; hand.add(h1);
  const leg = card(0.05, 0.16, 0.05, P.violet, P.edge, 'x'); leg.position.y = 0.08; clock.add(leg); const ft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.03, 24), paper(P.violet)); ft.position.y = 0.015; clock.add(ft); }
// a paper pointer (taps "Add to cart" in the before montage)
const pointer = new THREE.Group(); scene.add(pointer);
{ const sh = new THREE.Shape(); [[0, 0], [0, -0.3], [0.075, -0.23], [0.13, -0.34], [0.17, -0.32], [0.115, -0.21], [0.21, -0.21]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false }), [paper('#ffffff'), paper(P.ink)]); m.castShadow = true; pointer.add(m); }
// the photo of the recipe that travels into the text thread
const photoCard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(300, 400, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); drawRecipeMini(g, 16, 16, w - 32, h - 32); }), emissive: '#ffffff', emissiveIntensity: 0.15, roughness: 0.9 }), paper('#e6e2ff')]);
photoCard.castShadow = true; scene.add(photoCard);

// ------------------------------------------------------------------ takeaway set (S6): seven search cards vs one text
const TK = { x: 2.7, z: 1.15 };
const tk = new THREE.Group(); tk.position.set(TK.x, DESK, TK.z); scene.add(tk);
const searchCards = ING.map(([name, col], i) => { const hinge = new THREE.Group(); const row = i < 4 ? 0 : 1; hinge.position.set(-0.95 + (i < 4 ? i : i - 4 + 0.5) * 0.46, 0, -0.35 + row * 0.42); tk.add(hinge);
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.34, 0.02), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(264, 204, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 22); g.fill(); g.fillStyle = '#ffffff'; rr(g, 14, 18, w - 28, 54, 27); g.fill(); gLens(g, 46, 45, 0.6, '#552dbc'); g.fillStyle = col; rr(g, 22, 92, 70, 70, 12); g.fill(); g.fillStyle = P.ink; g.font = '700 26px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText(name.split(' ')[0], 104, 128); g.fillStyle = '#7a74b8'; g.font = '600 22px "Space Grotesk"'; g.fillText('search ' + (i + 1), 104, 158); }), emissive: '#ffffff', emissiveIntensity: 0.15, roughness: 0.9 }), paper('#cfc8ff')]);
  face.position.y = 0.19; face.castShadow = true; hinge.add(face); return hinge; });
const oneText = new THREE.Group(); oneText.position.set(TK.x + 1.05, DESK, TK.z + 0.1); oneText.rotation.y = -0.22; scene.add(oneText);
{ const face = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.98, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(320, 392, (g, w, h) => { g.fillStyle = '#7c3fda'; rr(g, 0, 0, w, h - 34, 34); g.fill(); g.beginPath(); g.moveTo(w - 80, h - 40); g.lineTo(w - 30, h); g.lineTo(w - 120, h - 40); g.fill(); drawRecipeMini(g, 30, 30, w - 60, h - 150); g.fillStyle = '#ffffff'; g.font = '700 40px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('1 text', w / 2, h - 82); }), emissive: '#ffffff', emissiveIntensity: 0.2, roughness: 0.9 }), paper('#cfc8ff')]);
  face.position.y = 0.52; face.castShadow = true; oneText.add(face); const foot = card(0.8, 0.03, 0.34, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.1); oneText.add(foot); }

// ------------------------------------------------------------------ U.S. map (accepted prop from english-06) with phones that get invitations
const MAP = { x: 5.6, z: 1.55, w: 2.6, d: 1.66 };
const US = [[0.02,0.08],[0.18,0.06],[0.45,0.06],[0.55,0.10],[0.62,0.12],[0.66,0.20],[0.70,0.17],[0.78,0.16],[0.86,0.10],[0.94,0.04],[0.97,0.10],[0.90,0.22],[0.86,0.32],[0.84,0.42],[0.80,0.52],[0.82,0.66],[0.84,0.80],[0.80,0.82],[0.74,0.68],[0.66,0.68],[0.58,0.72],[0.50,0.78],[0.46,0.92],[0.40,0.80],[0.32,0.74],[0.22,0.72],[0.14,0.64],[0.08,0.56],[0.03,0.40],[0.00,0.24]];
const mapMat = paper('#8d78e8', { emissive: P.cyan, emissiveIntensity: 0 });
{ const sh = new THREE.Shape(); US.forEach(([u, v], i) => { const x = (u - 0.5) * MAP.w, y = -(v - 0.5) * MAP.d; if (i) sh.lineTo(x, y); else sh.moveTo(x, y); }); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); const m = new THREE.Mesh(geo, [mapMat, paper(P.edge)]); m.position.set(MAP.x, DESK, MAP.z); m.castShadow = true; m.receiveShadow = true; scene.add(m); }
const offMat = new THREE.MeshBasicMaterial({ color: '#4a4f80' });
const onTex = canvasTex(120, 210, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.fillStyle = '#7c3fda'; rr(g, 12, 20, 96, 56, 14); g.fill(); gEnvelope(g, 34, 32, 52, 34, '#f3f1ff', '#7c3fda'); g.fillStyle = '#ffffff'; rr(g, 12, 96, 96, 50, 14); g.fill(); gCart(g, 60, 120, 0.45, '#552dbc'); });
const onMat = new THREE.MeshStandardMaterial({ map: onTex, emissive: '#ffffff', emissiveMap: onTex, emissiveIntensity: 0.55, roughness: 0.85 });
const PINS = [[0.15, 0.3], [0.3, 0.55], [0.42, 0.3], [0.55, 0.5], [0.66, 0.35], [0.78, 0.3], [0.72, 0.58], [0.25, 0.32], [0.48, 0.65], [0.86, 0.2]];
const mapPh = PINS.map(([u, v]) => { const grp = new THREE.Group(); grp.position.set(MAP.x + (u - 0.5) * MAP.w, DESK + 0.06, MAP.z + (v - 0.5) * MAP.d); grp.rotation.x = -0.15; scene.add(grp);
  const b = card(0.2, 0.36, 0.025, P.navy2, P.lav, 'z'); b.position.y = 0.2; grp.add(b); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.31), offMat); sc.position.set(0, 0.2, 0.014); grp.add(sc);
  const f = card(0.22, 0.025, 0.1, P.violet, P.edge); f.position.y = 0.012; grp.add(f); return { grp, sc }; });
const invEnv = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.01), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(150, 100, (g, w, h) => gEnvelope(g, 0, 0, w, h, '#f3f1ff', P.magenta)), emissive: '#ffffff', emissiveIntensity: 0.2, roughness: 0.9 }), paper('#e6e2ff')]); m.castShadow = true; scene.add(m); return m; });
const banner = new THREE.Group(); banner.position.set(MAP.x, DESK, MAP.z - 1.25); scene.add(banner);
const bnCv = document.createElement('canvas'); bnCv.width = 760; bnCv.height = 200; const bng = bnCv.getContext('2d'); const bnTex = new THREE.CanvasTexture(bnCv); bnTex.colorSpace = THREE.SRGBColorSpace;
{ const face = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: bnTex, emissive: '#ffffff', emissiveMap: bnTex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = 0.56; face.castShadow = true; banner.add(face);
  for (const x of [-0.7, 0.7]) { const st = card(0.05, 0.32, 0.04, P.edge, P.white, 'z'); st.position.set(x, 0.16, 0); banner.add(st); } }
let bnKey = '';
function drawBanner(p) { const k = String(Math.round(p * 60)); if (k === bnKey) return; bnKey = k; const g = bng; g.fillStyle = '#f3f1ff'; rr(g, 0, 0, 760, 200, 30); g.fill(); gEnvelope(g, 40, 30, 80, 58, P.magenta, '#ffffff'); g.fillStyle = P.ink; g.font = '700 58px "Space Grotesk"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('Invite only · U.S.', 140, 62);
  g.fillStyle = '#d8d2ff'; rr(g, 40, 128, 680, 40, 20); g.fill(); g.fillStyle = P.cyan; if (p > 0.03) { rr(g, 40, 128, 680 * p, 40, 20); g.fill(); } bnTex.needsUpdate = true; }

// ------------------------------------------------------------------ the Media Diet paper sign (signature, CTA shot — accepted prop)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.2, DESK, 3.7);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const CLOSE = (u) => SH(L3([0.98, 1.72, 3.65], [0.95, 1.69, 3.42], u), V3(0.82, 1.5, -0.3), 46);
const WIDE = (u) => SH(L3([0.22, 3.0, 5.85], [0.2, 2.92, 5.6], u), V3(0.1, 1.0, 0.12), 50);
const SHOTS = {
  S1: (t) => { const u = prog(t, 0, 3.17); return SH(L3([-0.2, 3.0, 5.95], [-0.15, 2.9, 5.6], u), V3(-0.08, 0.98, 0.1), 50); },
  S2: (t) => { const u = prog(t, 3.17, 5.95); return SH(L3([-3.12, 1.65, 3.45], [-3.15, 1.6, 3.2], u), V3(-3.12, 0.82, -0.2), 50); },
  S3: (t) => CLOSE(prog(t, 5.95, 8.29)),
  S4: (t) => { const u = prog(t, 8.29, 12.58); return SH(L3([0.42, 1.78, 3.95], [0.4, 1.74, 3.7], u), V3(0.32, 1.3, -0.4), 48); },
  S5: (t) => { const a = CLOSE(prog(t, 12.58, 14.9)), w = WIDE(prog(t, 15.6, 17.72)), u = prog(t, 14.9, 15.65); return SH(a.pos.clone().lerp(w.pos, u), a.look.clone().lerp(w.look, u), lerp(a.fov, w.fov, u)); },
  S6: (t) => { const u = prog(t, 17.72, 20.45); return SH(L3([2.98, 2.7, 6.1], [2.98, 2.65, 5.85], u), V3(2.95, 0.62, 1.1), 48); },
  S7: (t) => { const u = prog(t, 20.45, 25.93); return SH(L3([5.6, 4.25, 5.8], [5.6, 4.1, 5.55], u), V3(5.6, 0.35, 1.35), 48); },
  S8: (t) => { const u = prog(t, 25.93, 29.6); return SH(L3([0.2, 3.1, 9.7], [0.3, 3.9, 10.8], u), L3([-0.05, 0.75, 0.9], [-0.05, 0.8, 0.6], u), 48, lerp(6.1, 7.3, u)); },
};

// ------------------------------------------------------------------ per-frame update
const arc = (a, b, h, u) => a.clone().lerp(b, u).add(V3(0, Math.sin(Math.PI * u) * h, 0));
const _q = new THREE.Quaternion(), _e = new THREE.Euler();
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;

  // phone screen per beat
  if (id === 'S1' || id === 'S2') phoneDraw(PHONE, { mode: 'camera', press: clamp((t - E.flash + 0.12) / 0.25), flash: t >= E.flash ? 1 - prog(t, E.flash, E.flash + 0.45, (x) => x) : 0, shot: t >= E.flash + 0.2 ? prog(t, E.flash + 0.2, E.flash + 0.5) : 0 });
  else if (id === 'S3') phoneDraw(PHONE, { mode: 'thread', t, invite: prog(t, E.invite, E.invite + 0.4), photo: 0, typing: 0, reply: 0 });
  else if (id === 'S4') { const k = Math.min(6, Math.floor((t - E.search0) / E.searchDt)); const t0 = E.search0 + Math.max(0, k) * E.searchDt; const n = E.searchAt.filter((x) => t >= x + 0.36).length;
    phoneDraw(PHONE, { mode: 'search', t, k: t < E.search0 ? -1 : k, type: prog(t, t0, t0 + 0.2, (x) => x), res: prog(t, t0 + 0.18, t0 + 0.28), add: clamp((t - t0 - 0.3) / 0.12), n }); }
  else phoneDraw(PHONE, { mode: 'thread', t, invite: 1, photo: prog(t, E.sent, E.sent + 0.3), typing: t >= E.sent + 0.35 ? 1 : 0, reply: prog(t, E.reply, E.reply + 0.35) });

  // recipe card: lines checked one by one in the manual "before" montage
  const nChk = id === 'S4' ? E.searchAt.filter((x) => t >= x + 0.36).length : 0; drawRecipe(nChk);
  // ingredient tiles: on the card, or flying into the cart (hook teaser in S1; for real in S5 and after)
  tiles.forEach((m, i) => { const home = recPt(230, lineY(i), 0.035); const slot = cartSlot(i); let p = home, onCard = true, u = 0;
    if (id === 'S1') { u = prog(t, E.peel + i * 0.14, E.peel + i * 0.14 + 0.62, (x) => x); }
    else if (t >= E.fly) { u = prog(t, E.fly + i * 0.13, E.fly + i * 0.13 + 0.6, (x) => x); }
    if (u > 0) { onCard = false; p = arc(home, slot, 0.5, ease(u)); }
    m.position.copy(p);
    if (onCard) { rec.updateMatrixWorld(true); recTilt.getWorldQuaternion(_q); m.quaternion.copy(_q); }
    else { recTilt.getWorldQuaternion(_q); const qa = _q.clone(); cart.getWorldQuaternion(_q); const qb = _q.clone().multiply(new THREE.Quaternion().setFromEuler(_e.set(-0.25, 0, (i % 2 ? 0.14 : -0.14) + (i - 3) * 0.05))); m.quaternion.copy(qa).slerp(qb, ease(u)); m.rotateZ(Math.sin(Math.PI * u) * 0.6); } });
  { const landT = (id === 'S1' ? [...Array(7).keys()].map((i) => E.peel + i * 0.14 + 0.62) : [...Array(7).keys()].map((i) => E.fly + i * 0.13 + 0.6)); let b = 0; landT.forEach((x) => { b = Math.max(b, Math.sin(Math.PI * clamp((t - x) / 0.25)) * 0.04); }); cartBody.position.y = -b; cartBody.rotation.z = b * 0.6; }
  // photo travels from the recipe into the phone's text thread (S5)
  { const show = id === 'S5' && t >= E.snap && t < E.sent + 0.05; photoCard.visible = show; if (show) { const a = recPt(260, 370, 0.1), b = scrPt(PHONE, 364, 525, 0.1); const u = prog(t, E.snap, E.sent); photoCard.position.copy(arc(a, b, 0.35, u)); photoCard.quaternion.copy(camera.quaternion); photoCard.scale.setScalar(1.25 - 0.55 * u); } }
  // tags, counter, clock, pointer
  tagBefore.visible = id === 'S4'; tagBefore.scale.setScalar(Math.max(0.01, prog(t, 8.35, 8.7, outBack)));
  tagNow.visible = id === 'S5'; tagNow.scale.setScalar(Math.max(0.01, prog(t, 12.65, 13.0, outBack)));
  counter.visible = clock.visible = false; { const n = id === 'S4' ? E.searchAt.filter((x) => t >= x + 0.36).length : 7; const lastAdd = E.searchAt.filter((x) => t >= x + 0.36).pop(); drawCounter(n, lastAdd !== undefined ? Math.sin(Math.PI * clamp((t - lastAdd - 0.36) / 0.25)) : 0); }
  hand.rotation.z = -Math.PI * 2 * 2.2 * prog(t, 8.5, 12.5, (x) => x);
  { const show = id === 'S4' && t >= E.search0 - 0.3; pointer.visible = show; if (show) { const k = Math.min(6, Math.max(0, Math.floor((t - E.search0) / E.searchDt))); const t0 = E.search0 + k * E.searchDt; const pBtn = scrPt(PHONE, 300, 530, 0.12), pRest = scrPt(PHONE, 420, 640, 0.14);
      const click = Math.sin(Math.PI * clamp((t - t0 - 0.3) / 0.12)); pointer.position.copy(pRest.clone().lerp(pBtn, prog(t, t0 + 0.1, t0 + 0.3))).add(V3(0, 0, -0.05 * click)); if (t > t0 + 0.42) pointer.position.lerp(pRest, prog(t, t0 + 0.42, t0 + 0.55)); pointer.quaternion.copy(PHONE.grp.quaternion); pointer.scale.setScalar(1 - 0.12 * click); } }
  // takeaway: one text pops, the seven searches fold away
  oneText.scale.setScalar(Math.max(0.01, id === 'S6' ? prog(t, E.oneText, E.oneText + 0.4, outBack) : t >= 25.93 ? 1 : 0)); oneText.visible = id === 'S6' || t >= 25.93;
  searchCards.forEach((h, i) => { h.rotation.x = -Math.PI / 2 * prog(t, E.fold + i * 0.12, E.fold + i * 0.12 + 0.3, (x) => x * x); });
  // calendar 4 → 5 → 6, the source placard hinges up
  calPages.forEach((h, i) => { if (i === 0) return; const k = 2 - i; const u = prog(t, E.calFlip + k * 0.3, E.calFlip + k * 0.3 + 0.32); h.rotation.x = lerp(-0.18, 0.5 - Math.PI * 2, u); });
  srcCard.visible = t >= 3.17; { const u = prog(t, E.source, E.source + 0.45, outBack); srcHinge.rotation.x = -Math.PI / 2 * (1 - clamp(u, 0, 1.2)); }
  // map: U.S. lights, three invited phones get envelopes, then more phones light over the coming weeks
  mapMat.emissiveIntensity = 0.5 * prog(t, E.usGlow, E.usGlow + 0.5);
  mapPh.forEach((p, i) => { const lt = i < 3 ? E.invites[i] + 0.2 : (E.lit[i - 3] >= 0 ? E.wave + E.lit[i - 3] : -1); const on = lt >= 0 && t >= lt; p.sc.material = on ? onMat : offMat; p.grp.scale.setScalar(lt >= 0 ? 1 + 0.2 * Math.sin(Math.PI * clamp((t - lt) / 0.3)) : 1); });
  invEnv.forEach((m, i) => { const s = prog(t, E.invites[i], E.invites[i] + 0.35, outBack) * (id === 'S7' ? 1 : 0); m.visible = s > 0.01; const p = mapPh[i].grp.position; m.position.set(p.x, p.y + 0.55 + 0.03 * Math.sin(t * 4 + i), p.z); m.quaternion.copy(camera.quaternion); m.scale.setScalar(Math.max(0.01, s)); });
  drawBanner(lerp(0.1, 0.62, prog(t, E.wave, E.wave + 1.8)) * (t >= E.invites[0] ? 1 : 0.6));
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
