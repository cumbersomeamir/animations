// Media Diet · 30 s Hindi episode (hindi-03) — iOS 27.2 adds Google's SynthID watermark to iPhone AI images; how to check
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted feedback-round film.js: a paper
// miniature in Media Diet brand colours — laminated cards with visible edges, paper grain, real cast shadows, hinged props,
// one camera set-up per beat, restrained depth of field. Hindi captions in Noto Sans Devanagari (same band/size/position).
// Deterministic: window.render(frame); window.TEXTS() returns the overlay text boxes for QA.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const TL = await (await fetch('./timeline.json')).json();
const CUES = await (await fetch('./data/cues.json')).json();
const E = TL.events; const W = TL.width, H = TL.height, FPS = TL.fps;
await Promise.all(['700 50px "Space Grotesk"', '600 28px Inter', '600 26px "Plex Mono"'].map((f) => document.fonts.load(f)));
await Promise.all([document.fonts.load('700 48px "Noto Sans Devanagari"', 'हिंदी अक्टूबर 26'), document.fonts.load('700 48px "Noto Sans Devanagari"', '0123456789.,?')]);
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
const DEV = '"Noto Sans Devanagari"';
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function starShape(ro = 0.24, ri = 0.07) { const s = new THREE.Shape(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 2, r = i % 2 ? ri : ro; const p = [Math.cos(a) * r, Math.sin(a) * r]; if (i) s.lineTo(...p); else s.moveTo(...p); } return s; }
const starGeo = new THREE.ExtrudeGeometry(starShape(), { depth: 0.025, bevelEnabled: false });

// ------------------------------------------------------------------ printed pictures (canvas "photo prints" on card stock)
function drawScene(g, w, h, kind, ox = 0, fullW = w) {   // ox/fullW let the extension wings continue the same scene
  const X = (u) => u * fullW - ox;
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, kind === 'A' ? '#7c5ce8' : '#4c63d8'); sky.addColorStop(1, kind === 'A' ? '#ffb3d3' : '#bfe9ff'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  g.fillStyle = kind === 'A' ? '#fff3c4' : '#fff8dc'; g.beginPath(); g.arc(X(kind === 'B' ? 0.82 : 0.72), h * 0.3, h * 0.11, 0, Math.PI * 2); g.fill();
  const ridge = (y0, amp, col, ph) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * y0 - Math.sin((x + ox) / fullW * 7 + ph) * amp - Math.sin((x + ox) / fullW * 17 + ph * 2) * amp * 0.35); g.lineTo(w, h); g.fill(); };
  ridge(0.58, h * 0.1, kind === 'A' ? '#552dbc' : '#3d46b5', 1); ridge(0.72, h * 0.07, kind === 'A' ? '#24287e' : '#2a7f9e', 2.4);
  if (kind === 'M') { g.fillStyle = '#7fd6f0'; g.fillRect(0, h * 0.8, w, h * 0.2); g.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 6; i++) g.fillRect(X(0.1 + i * 0.15), h * (0.84 + (i % 2) * 0.05), w * 0.06, 3);
    g.fillStyle = '#1d4d5c'; for (const u of [0.12, 0.2, 0.86]) { const x = X(u); g.beginPath(); g.moveTo(x, h * 0.42); g.lineTo(x - h * 0.08, h * 0.8); g.lineTo(x + h * 0.08, h * 0.8); g.fill(); } }
  if (kind === 'A') { const bx = X(0.38), by = h * 0.36, br = h * 0.15; g.fillStyle = '#fe4092'; g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffd1e4'; g.fillRect(bx - br * 0.15, by - br, br * 0.3, br * 2);
    g.strokeStyle = '#14163a'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx - br * 0.6, by + br * 0.8); g.lineTo(bx - br * 0.25, by + br * 1.5); g.moveTo(bx + br * 0.6, by + br * 0.8); g.lineTo(bx + br * 0.25, by + br * 1.5); g.stroke(); g.fillStyle = '#8a5a2b'; g.fillRect(bx - br * 0.28, by + br * 1.45, br * 0.56, br * 0.4);
    g.fillStyle = 'rgba(255,255,255,0.85)'; for (const [u, v, s] of [[0.15, 0.2, 1], [0.8, 0.55, 0.8]]) { g.beginPath(); g.arc(X(u), h * v, h * 0.05 * s, 0, Math.PI * 2); g.arc(X(u) + h * 0.06 * s, h * v - h * 0.02, h * 0.06 * s, 0, Math.PI * 2); g.arc(X(u) + h * 0.12 * s, h * v, h * 0.045 * s, 0, Math.PI * 2); g.fill(); } }
  if (kind === 'B') { const hx = X(0.5), hy = h * 0.66; g.fillStyle = '#efecff'; g.fillRect(hx - h * 0.1, hy - h * 0.12, h * 0.2, h * 0.14); g.fillStyle = '#fe4092'; g.beginPath(); g.moveTo(hx - h * 0.13, hy - h * 0.11); g.lineTo(hx, hy - h * 0.24); g.lineTo(hx + h * 0.13, hy - h * 0.11); g.fill(); g.fillStyle = '#24287e'; g.fillRect(hx - h * 0.025, hy - h * 0.06, h * 0.05, h * 0.08);
    g.fillStyle = '#1d4d5c'; for (const u of [0.06, 0.94, 1.12, -0.12]) { const x = X(u); g.beginPath(); g.moveTo(x, h * 0.46); g.lineTo(x - h * 0.07, h * 0.76); g.lineTo(x + h * 0.07, h * 0.76); g.fill(); } }
}
const picCanvas = {}; function picTex(kind, w = 512, h = 384, ox = 0, fullW = 512, border = true) {
  return canvasTex(w, h, (g) => { drawScene(g, w, h, kind, ox, fullW); if (border) { g.strokeStyle = '#f6f4ff'; g.lineWidth = 18; g.strokeRect(0, 0, w, h); } if (!ox && border) picCanvas[kind] = g.canvas; }); }
function picture(w, h, tex, emissive = 0.28) {
  const face = new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: emissive, roughness: 0.9 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.035), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), face, paper('#cfc8ff')]); m.castShadow = true; m.receiveShadow = true; return m;
}
function easel(x, z, rotY) { const g = new THREE.Group(); g.position.set(x, DESK, z); g.rotation.y = rotY; scene.add(g);
  const foot = card(0.9, 0.04, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.02, 0.05); g.add(foot);
  const lip = card(0.9, 0.08, 0.05, '#cfc8ff', P.white, 'z'); lip.position.set(0, 0.07, 0.22); g.add(lip);
  const leg = card(0.08, 1.1, 0.04, P.lav, P.white, 'z'); leg.position.set(0, 0.5, -0.22); leg.rotation.x = -0.28; g.add(leg); return g; }
const LEAN = -0.12;
// mystery photo M (the hook)
const M_POS = { x: -0.35, z: 3.75, r: -0.3 };
const easelM = easel(M_POS.x, M_POS.z, M_POS.r); const picM = picture(1.9, 1.42, picTex('M')); picM.position.set(0, 0.8, 0.12); picM.rotation.x = LEAN; easelM.add(picM);
// AI-made picture A (Image Playground-like generation) and AI-changed photo B (extended edges)
const A_POS = { x: 0.75, z: -1.3, r: -0.3 }, B_POS = { x: 2.85, z: -0.8, r: -0.45 };
const easelA = easel(A_POS.x, A_POS.z, A_POS.r); const aHinge = new THREE.Group(); aHinge.position.set(0, 0.1, 0.14); easelA.add(aHinge);
const picA = picture(1.6, 1.2, picTex('A')); picA.position.set(0, 0.62, 0); aHinge.add(picA);
const easelB = easel(B_POS.x, B_POS.z, B_POS.r); const bGroup = new THREE.Group(); bGroup.position.set(0, 0.72, 0.12); bGroup.rotation.x = LEAN; easelB.add(bGroup);
const picB = picture(1.1, 0.83, picTex('B', 512, 384, 0, 512)); bGroup.add(picB);
const wings = [-1, 1].map((s) => { const hinge = new THREE.Group(); hinge.position.set(s * 0.55, 0, 0); bGroup.add(hinge);
  const tex = canvasTex(256, 384, (g) => { drawScene(g, 256, 384, 'B', s < 0 ? -256 : 512, 512); g.strokeStyle = '#f6f4ff'; g.lineWidth = 18; g.strokeRect(s < 0 ? 0 : -20, 0, 276, 384); g.setLineDash([10, 8]); g.strokeStyle = 'rgba(42,221,250,0.9)'; g.lineWidth = 5; g.beginPath(); g.moveTo(s < 0 ? 254 : 2, 0); g.lineTo(s < 0 ? 254 : 2, 384); g.stroke(); });
  const m = picture(0.55, 0.83, tex, 0.28); m.position.set(s * 0.275, 0, -0.001); hinge.add(m); return { hinge, s }; });

// ------------------------------------------------------------------ desk calendar (pages hinge over to 26 अक्टूबर)
const CAL = { x: -2.75, z: -1.0 };
const cal = new THREE.Group(); cal.position.set(CAL.x, DESK, CAL.z); cal.rotation.y = 0.25; scene.add(cal);
{ const base = card(1.25, 0.12, 0.7, P.violet, P.edge); base.position.y = 0.06; cal.add(base);
  const back = card(1.2, 1.35, 0.05, P.violet2, P.edge, 'z'); back.position.set(0, 0.78, -0.18); back.rotation.x = -0.18; cal.add(back);
  for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 16), paper(P.white)); ring.position.set(-0.3 + i * 0.6, 1.43, -0.27); cal.add(ring); } }
const calPages = [24, 25, 26].map((d, i) => { const hinge = new THREE.Group(); hinge.position.set(0, 1.42, -0.235 + (2 - i) * 0.004); hinge.rotation.x = -0.18; cal.add(hinge);
  const tex = canvasTex(400, 440, (g, w, h) => { g.fillStyle = '#f3f1ff'; g.fillRect(0, 0, w, h); g.fillStyle = P.magenta; g.fillRect(0, 0, w, 96); g.fillStyle = '#ffffff'; g.font = `700 54px ${DEV}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('अक्टूबर', w / 2, 52);
    g.fillStyle = P.ink; g.font = '700 210px "Space Grotesk"'; g.fillText(String(d), w / 2, 270); g.fillStyle = '#9d8cf0'; g.fillRect(60, 400, w - 120, 6); });
  const pg = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.24, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#e6e2ff')]);
  pg.position.set(0, -0.64, 0); pg.castShadow = true; hinge.add(pg); return hinge; }).reverse();   // [26, 25, 24]: 24 on top

// ------------------------------------------------------------------ the paper phone (printed, redrawn screen) on a clip stand
const PH = { w: 0.62, h: 1.18, d: 0.06 };
const PHONE = { x: -1.05, z: -0.75 };
const phone = new THREE.Group(); phone.position.set(PHONE.x, DESK, PHONE.z); phone.rotation.y = -0.05; scene.add(phone);
const scr = document.createElement('canvas'); scr.width = 300; scr.height = 574; const sg = scr.getContext('2d');
const scrTex = new THREE.CanvasTexture(scr); scrTex.colorSpace = THREE.SRGBColorSpace; scrTex.anisotropy = 8;
{ const body = card(PH.w, PH.h, PH.d, P.navy2, P.lav, 'z'); body.position.y = PH.h / 2 + 0.03; body.rotation.x = -0.1; phone.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(PH.w - 0.07, PH.h - 0.09), new THREE.MeshStandardMaterial({ map: scrTex, emissive: '#ffffff', emissiveMap: scrTex, emissiveIntensity: 0.6, roughness: 0.85 }));
  screen.position.set(0, 0, PH.d / 2 + 0.002); body.add(screen);
  const clip = card(0.46, 0.08, 0.3, P.lav, P.white, 'y'); clip.position.y = 0.04; phone.add(clip);
  const lip = card(0.46, 0.12, 0.02, P.lav, P.white, 'z'); lip.position.set(0, 0.07, 0.1); phone.add(lip); }
function sCheck(g, cx, cy, r, a) { if (a <= 0) return; g.save(); g.globalAlpha = Math.min(1, a); g.translate(cx, cy); const s = outBack(Math.min(1, a)); g.scale(s, s); g.fillStyle = P.cyan; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#0d1240'; g.lineWidth = r * 0.24; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-r * 0.45, 0); g.lineTo(-r * 0.12, r * 0.33); g.lineTo(r * 0.5, -r * 0.35); g.stroke(); g.restore(); }
function sStar(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, q = i % 2 ? r * 0.32 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); }
let lastKey = '';
function drawScreen(s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 30) / 30 : v)); if (key === lastKey) return; lastKey = key;
  const g = sg, w = 300, h = 574; const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1d2470'); bg.addColorStop(1, '#0f1449'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(233,229,255,0.35)'; rr(g, 110, 22, 80, 14, 7); g.fill();
  if (s.mode === 'idle') { g.strokeStyle = '#e9e5ff'; g.lineWidth = 8; rr(g, 70, 200, 160, 120, 18); g.stroke(); g.fillStyle = '#e9e5ff'; g.beginPath(); g.moveTo(84, 306); g.lineTo(130, 250); g.lineTo(160, 284); g.lineTo(184, 262); g.lineTo(216, 306); g.fill(); g.beginPath(); g.arc(190, 232, 12, 0, Math.PI * 2); g.fill(); }
  if (s.mode === 'update') { const p = clamp(s.p ?? 0); g.save(); g.translate(150, 290); g.lineWidth = 16; g.strokeStyle = 'rgba(169,163,230,0.35)'; g.beginPath(); g.arc(0, 0, 96, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = P.cyan; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 96, -Math.PI / 2, -Math.PI / 2 + Math.max(0.01, p) * Math.PI * 2); g.stroke(); g.restore();
    g.fillStyle = '#f3f1ff'; g.font = '700 64px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('27.2', 150, 290);
    if ((s.ok ?? 0) <= 0) { g.strokeStyle = '#e9e5ff'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(150, 420); g.lineTo(150, 470); g.moveTo(128, 450); g.lineTo(150, 472); g.lineTo(172, 450); g.stroke(); }
    sCheck(g, 150, 452, 32, s.ok ?? 0); }
  if (s.mode === 'ai') { const k = s.k ?? 0; g.save(); g.translate(150, 300); g.rotate(-0.6); g.fillStyle = '#e9e5ff'; rr(g, -10, -10, 150, 20, 8); g.fill(); g.fillStyle = P.magenta; rr(g, -14, -14, 30, 28, 6); g.fill(); g.restore();
    for (let i = 0; i < 5; i++) { const a = i * 1.3 + k * 2.2; sStar(g, 110 + Math.cos(a) * (40 + i * 9), 230 + Math.sin(a) * (30 + i * 6), 14 + 6 * Math.sin(k * 6 + i), i % 2 ? P.cyan : '#ffffff'); } }
  scrTex.needsUpdate = true;
}
function screenState(t) {
  if (t < E.update - 0.3) return { mode: 'idle' };
  if (t < 7.95) return { mode: 'update', p: prog(t, E.update, E.updateEnd, (x) => x), ok: clamp((t - E.updateOk) / 0.22) };
  if (t < 11.8) return { mode: 'ai', k: t };
  return { mode: 'idle' };
}
// the question tag (accepted prop)
const qTag = new THREE.Group(); { const tex = canvasTex(160, 200, (g, w, h) => { g.fillStyle = P.magenta; g.beginPath(); g.arc(80, 80, 72, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.font = '700 110px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 80, 86); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.45, 0.012), [paper('#ffd1e4'), paper('#ffd1e4'), paper('#ffd1e4'), paper('#ffd1e4'), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5 }), paper(P.magenta)]);
  m.castShadow = true; qTag.add(m); const st = card(0.015, 0.3, 0.015, P.white, P.white, 'x'); st.position.y = -0.3; qTag.add(st); }
scene.add(qTag);

// ------------------------------------------------------------------ sparkles (paper stars) for the AI tool
const sparkles = []; for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(starGeo, [paper(i % 3 ? P.white : P.cyan), paper(P.lav)]); m.castShadow = true; scene.add(m); sparkles.push(m); }

// ------------------------------------------------------------------ the stamp (presses the invisible mark) and the magnifier (reveals it)
const stamp = new THREE.Group(); scene.add(stamp);
{ const block = card(0.42, 0.32, 0.16, P.violet, P.edge, 'z'); stamp.add(block); const pad = card(0.38, 0.28, 0.03, '#2fd0ec', P.white, 'z'); pad.position.z = -0.09; stamp.add(pad);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.22, 16), [paper(P.lav), paper(P.white), paper(P.white)]); neck.rotation.x = Math.PI / 2; neck.position.z = 0.18; stamp.add(neck);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), paper(P.magenta)); knob.position.z = 0.32; stamp.add(knob); stamp.traverse((o) => { o.castShadow = true; }); }
const lens = new THREE.Group(); scene.add(lens);
const LENS_R = 0.36;
{ const ring = new THREE.Mesh(new THREE.TorusGeometry(LENS_R, 0.045, 10, 48), paper(P.violet2)); ring.castShadow = true; lens.add(ring);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(LENS_R, 48), new THREE.MeshBasicMaterial({ color: '#bff6ff', transparent: true, opacity: 0.12, depthWrite: false })); lens.add(glass);
  const handle = card(0.08, 0.55, 0.05, P.violet, P.edge, 'z'); handle.position.set(0.22, -0.55, 0); handle.rotation.z = 0.5; lens.add(handle); }
// the hidden pattern: a code of tiny marks spread through the whole picture, drawn only inside the lens
const patTex = canvasTex(512, 384, (g, w, h) => { g.clearRect(0, 0, w, h); let s = 99; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let y = 6; y < h; y += 16) for (let x = 6; x < w; x += 16) { if (rnd() < 0.42) { g.fillStyle = rnd() < 0.5 ? 'rgba(42,221,250,0.95)' : 'rgba(255,255,255,0.9)'; g.fillRect(x, y, 7, 7); } } });
const patMesh = new THREE.Mesh(new THREE.CircleGeometry(LENS_R * 0.93, 48), new THREE.MeshBasicMaterial({ map: patTex, transparent: true, depthWrite: false })); picA.add(patMesh); patMesh.position.z = 0.0185;
const patUV0 = patMesh.geometry.attributes.uv.array.slice(); const patPos = patMesh.geometry.attributes.position.array;
function setPattern(cx, cy, a) { const uv = patMesh.geometry.attributes.uv.array; for (let i = 0; i < uv.length / 2; i++) { uv[i * 2] = (patPos[i * 3] + cx) / 1.6 + 0.5; uv[i * 2 + 1] = (patPos[i * 3 + 1] + cy) / 1.2 + 0.5; }
  patMesh.geometry.attributes.uv.needsUpdate = true; patMesh.position.x = cx; patMesh.position.y = cy; patMesh.material.opacity = a; patMesh.visible = a > 0.01; }
const shimmer = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); shimmer.position.z = 0.019; picA.add(shimmer);

// ------------------------------------------------------------------ row of paper phones (which iPhones make these marks)
const ROW = { x0: 3.56, z: 0.6 }; const rowTags = ['14', '15', '15 प्रो', '16', '17']; const rowPhones = rowTags.map((tag, i) => {
  const ok = i >= 2; const x = ROW.x0 + i * 0.62; const base = new THREE.Group(); base.position.set(x, DESK, ROW.z); scene.add(base);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.02, 0.05); base.add(hinge);
  const body = card(0.48, 0.9, 0.05, ok ? P.navy2 : '#3a3f7a', P.lav, 'z'); body.position.y = 0.45; hinge.add(body);
  const tex = canvasTex(128, 240, (g, w, h) => { g.fillStyle = ok ? '#1d2470' : '#2a2f5e'; g.fillRect(0, 0, w, h); if (ok) { sStar(g, 64, 110, 34, P.cyan); sStar(g, 96, 70, 14, '#ffffff'); sStar(g, 34, 160, 12, '#ffffff'); } });
  const scrM = new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.0, roughness: 0.85 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.82), scrM); screen.position.set(0, 0.45, 0.026); hinge.add(screen);
  const tagTex = canvasTex(256, 110, (g, w, h) => { g.fillStyle = ok ? '#f3f1ff' : '#b9b4dc'; rr(g, 4, 4, w - 8, h - 8, 22); g.fill(); g.fillStyle = P.ink; g.font = `700 60px ${DEV}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tag, w / 2, h / 2 + 4); });
  const tagM = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.21, 0.02), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tagTex, emissive: '#ffffff', emissiveMap: tagTex, emissiveIntensity: 0.2, roughness: 0.9 }), paper(P.lav)]);
  tagM.position.set(0, 0.12, 0.42); tagM.rotation.x = -0.6; tagM.castShadow = true; base.add(tagM); return { ok, hinge, scrM, i }; });

// ------------------------------------------------------------------ paper laptop = the detector (generic screen glyphs, no brand UI)
const LAP = { x: 2.25, z: 3.55, r: -0.42 };
const lap = new THREE.Group(); lap.position.set(LAP.x, DESK, LAP.z); lap.rotation.y = LAP.r; scene.add(lap);
const lcv = document.createElement('canvas'); lcv.width = 640; lcv.height = 400; const lg = lcv.getContext('2d'); const lTex = new THREE.CanvasTexture(lcv); lTex.colorSpace = THREE.SRGBColorSpace; lTex.anisotropy = 8;
const lidHinge = new THREE.Group(); lidHinge.position.set(0, 0.07, -0.62); lap.add(lidHinge);
{ const base = card(2.1, 0.07, 1.35, P.lav, P.white); base.position.y = 0.035; lap.add(base);
  const keys = card(1.8, 0.012, 0.62, '#9d8cf0', P.white); keys.position.set(0, 0.075, -0.12); lap.add(keys);
  const pad = card(0.6, 0.012, 0.32, '#b9a6ff', P.white); pad.position.set(0, 0.075, 0.42); lap.add(pad);
  const lid = card(2.1, 1.32, 0.05, P.violet, P.edge, 'z'); lid.position.set(0, 0.66, 0); lidHinge.add(lid);
  const scrn = new THREE.Mesh(new THREE.PlaneGeometry(1.92, 1.2), new THREE.MeshStandardMaterial({ map: lTex, emissive: '#ffffff', emissiveMap: lTex, emissiveIntensity: 0.65, roughness: 0.85 })); scrn.position.set(0, 0.66, 0.027); lidHinge.add(scrn); }
lidHinge.rotation.x = -0.22;
let lKey = '';
function drawLaptop(s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 40) / 40 : v)); if (key === lKey) return; lKey = key;
  const g = lg, w = 640, h = 400; g.fillStyle = '#141a52'; g.fillRect(0, 0, w, h); g.fillStyle = '#24287e'; g.fillRect(0, 0, w, 38); for (let i = 0; i < 3; i++) { g.fillStyle = ['#fe4092', '#c9bfff', '#2addfa'][i]; g.beginPath(); g.arc(24 + i * 22, 19, 7, 0, Math.PI * 2); g.fill(); }
  const img = s.img ? picCanvas[s.img] : null; const bx = 70, by = 70, bw = 300, bh = 225;
  if (!img) { g.setLineDash([16, 12]); g.strokeStyle = '#9d8cf0'; g.lineWidth = 5; rr(g, bx, by, bw, bh, 18); g.stroke(); g.setLineDash([]); g.strokeStyle = '#e9e5ff'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx + bw / 2, by + 150); g.lineTo(bx + bw / 2, by + 80); g.moveTo(bx + bw / 2 - 26, by + 104); g.lineTo(bx + bw / 2, by + 78); g.lineTo(bx + bw / 2 + 26, by + 104); g.stroke(); }
  else { g.drawImage(img, bx, by, bw, bh); const sp = s.scan ?? -1; if (sp >= 0 && sp <= 1) { const y = by + sp * bh; const gr = g.createLinearGradient(0, y - 40, 0, y); gr.addColorStop(0, 'rgba(42,221,250,0)'); gr.addColorStop(1, 'rgba(42,221,250,0.55)'); g.fillStyle = gr; g.fillRect(bx, y - 40, bw, 40); g.fillStyle = '#2addfa'; g.fillRect(bx - 8, y - 3, bw + 16, 6); } }
  // result panel
  g.fillStyle = '#1d2470'; rr(g, 400, 70, 190, 225, 18); g.fill();
  if (s.res === 'found') { const a = clamp(s.ra ?? 0); g.save(); g.globalAlpha = a; for (let y = 0; y < 4; y++) for (let x = 0; x < 6; x++) if ((x * 7 + y * 3) % 5 < 3) { g.fillStyle = (x + y) % 2 ? '#2addfa' : '#ffffff'; g.fillRect(430 + x * 22, 92 + y * 18, 12, 10); } g.restore(); sCheck(g, 495, 225, 46, a); }
  else if (s.res === 'none') { const a = clamp(s.ra ?? 0); g.save(); g.globalAlpha = a; g.strokeStyle = '#a9a3e6'; g.lineWidth = 10; g.beginPath(); g.arc(495, 190, 52, 0, Math.PI * 2); g.stroke(); g.lineCap = 'round'; g.beginPath(); g.moveTo(470, 190); g.lineTo(520, 190); g.stroke(); g.restore(); }
  else { g.fillStyle = 'rgba(169,163,230,0.35)'; for (let i = 0; i < 3; i++) { rr(g, 425, 110 + i * 46, 140 - i * 30, 18, 9); g.fill(); } }
  lTex.needsUpdate = true;
}
function laptopState(t) {
  if (t < E.scanInEnd - 0.05) return { img: null, res: '' };
  if (t >= 22.85 && t < E.scanIn2End - 0.05) return { img: null, res: '' };
  if (t < 22.85) return { img: 'A', scan: t < E.scanEnd ? prog(t, E.scan, E.scanEnd, (x) => x) : -1, res: t >= E.found ? 'found' : '', ra: (t - E.found) / 0.3 };
  return { img: 'M', scan: t < E.scan2End ? prog(t, E.scan2, E.scan2End, (x) => x) : -1, res: t >= E.none ? 'none' : '', ra: (t - E.none) / 0.3 };
}
// flying copies (the picture travels to the detector)
const copyA = picture(1.6, 1.2, picTex('A', 512, 384, 0, 512), 0.28); copyA.scale.setScalar(0.6); scene.add(copyA);
const copyM = picture(1.9, 1.42, picTex('M', 512, 384, 0, 512), 0.28); copyM.scale.setScalar(0.5); scene.add(copyM);
const qTag2 = qTag.clone(); scene.add(qTag2);

// ------------------------------------------------------------------ the Media Diet paper sign (signature, CTA shot — accepted prop)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.85, DESK, 6.7);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const SHOTS = {
  S1: (t) => { const u = prog(t, 0, 2.75); return SH(L3([-0.85, 1.32, 8.7], [-0.75, 1.25, 8.1], u), V3(-0.1, 1.0, 3.75), 46); },
  S2: (t) => { const u = prog(t, 2.75, 7.95), c = prog(t, 4.2, 5.0); return SH(L3([-2.15, 1.3, 2.35], [-2.0, 1.25, 2.1], u), V3(lerp(-2.45, -1.55, c), 0.85, lerp(-1.0, -0.85, c)), 52); },
  S3: (t) => { const u = prog(t, E.gen - 0.4, E.extend + 0.3); return SH(L3([-0.55, 2.25, 3.4], [1.45, 2.2, 3.0], u), L3([-0.45, 0.8, -1.0], [1.85, 0.8, -1.0], u), 54); },
  S4: (t) => { const u = prog(t, 11.8, 15.9); return SH(L3([0.05, 1.0, 1.35], [0.15, 0.98, 1.05], u), V3(0.72, 0.78, -1.3), 42); },
  S5: (t) => { const u = prog(t, 15.9, 18.5); return SH(L3([4.8, 3.3, 5.0], [4.8, 3.1, 4.7], u), V3(4.8, 0.45, 0.6), 58); },
  S6: (t) => { const u = prog(t, 18.5, 22.85); return SH(L3([1.55, 1.45, 7.7], [1.65, 1.38, 7.3], u), V3(2.3, 0.85, 3.45), 46); },
  S7: (t) => { const u = prog(t, 22.85, 26.05); return SH(L3([-1.75, 1.6, 7.6], [-1.6, 1.55, 7.25], u), V3(1.25, 0.85, 3.55), 52); },
  S8: (t) => { const u = prog(t, 26.05, 29.6); return SH(L3([0.95, 3.0, 11.3], [1.15, 4.2, 12.9], u), L3([0.85, 0.8, 1.6], [0.85, 0.9, 1.0], u), 48, lerp(4.8, 6.6, u)); },
};

// ------------------------------------------------------------------ overlay (captions — accepted treatment, Devanagari face)
const ov = document.getElementById('ov'); const og = ov.getContext('2d'); let TEXTLOG = [];
function otext(str, x, y, o = {}) {
  og.save(); og.font = o.font || '700 50px "Space Grotesk"'; og.textAlign = o.align || 'center'; og.fillStyle = o.color || '#f6f4ff';
  og.globalAlpha = o.alpha ?? 1; og.shadowColor = 'rgba(2,3,20,0.95)'; og.shadowBlur = o.shadow ?? 14; og.fillText(str, x, y);
  const m = og.measureText(str); const x0 = x - m.actualBoundingBoxLeft, x1 = x + m.actualBoundingBoxRight;
  if ((o.alpha ?? 1) > 0.05) TEXTLOG.push({ kind: o.kind || 'label', text: str, x0: Math.round(x0), y0: Math.round(y - m.actualBoundingBoxAscent), x1: Math.round(x1), y1: Math.round(y + m.actualBoundingBoxDescent) });
  og.restore();
}
const CAPF = `700 48px ${DEV}`;   // Devanagari needs more line room than Latin: baselines 406/480 (ink stays inside y 340–520)
function captions(t) {
  const c = CUES.find((q) => t >= q.in && t < q.out); if (!c) return; const a = clamp((t - c.in) / 0.1);
  const gr = og.createLinearGradient(0, 300, 0, 560); gr.addColorStop(0, 'rgba(4,6,30,0)'); gr.addColorStop(0.3, 'rgba(4,6,30,0.5)'); gr.addColorStop(0.75, 'rgba(4,6,30,0.5)'); gr.addColorStop(1, 'rgba(4,6,30,0)');
  og.save(); og.globalAlpha = a; og.fillStyle = gr; og.fillRect(0, 300, W, 260); og.restore();
  if (c.lines.length === 1) otext(c.lines[0], 540, 446, { alpha: a, kind: 'caption', font: CAPF });
  else { otext(c.lines[0], 540, 406, { alpha: a, kind: 'caption', font: CAPF }); otext(c.lines[1], 540, 480, { alpha: a, kind: 'caption', font: CAPF }); }
}

// ------------------------------------------------------------------ per-frame update
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const worldOf = (obj, v) => { obj.updateMatrixWorld(true); return obj.localToWorld(v.clone()); };
function fly(obj, from, to, qFrom, qTo, u, s0, s1, arc = 0.6) { obj.visible = true; obj.position.copy(from).lerp(to, u); obj.position.y += Math.sin(Math.PI * u) * arc; obj.quaternion.copy(qFrom).slerp(qTo, u); obj.scale.setScalar(lerp(s0, s1, u)); }
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;

  drawScreen(screenState(t));
  // question tag over the mystery photo (S1), and again when no mark is found (S7)
  { const a = prog(t, E.query, E.query + 0.3, outBack) * (1 - prog(t, E.queryOff, E.queryOff + 0.25)); qTag.visible = id === 'S1' && a > 0.01; qTag.position.set(M_POS.x + 0.95, DESK + 1.32, M_POS.z + 0.35); qTag.scale.setScalar(Math.max(0.01, a) * 1.3); qTag.rotation.y = -0.3; }
  { const a = prog(t, E.query2, E.query2 + 0.3, outBack); qTag2.visible = (id === 'S7' || id === 'S8') && a > 0.01; qTag2.position.set(M_POS.x + 0.95, DESK + 1.32, M_POS.z + 0.35); qTag2.scale.setScalar(Math.max(0.01, a) * 1.3); qTag2.rotation.y = -0.3; }
  // calendar: 24 → 25 → 26 flip over the top
  calPages.forEach((h, i) => { if (i === 0) return; const k = 2 - i; const u = prog(t, E.calFlip + k * 0.5, E.calFlip + k * 0.5 + 0.48); h.rotation.x = lerp(-0.18, 0.5 - Math.PI * 2, u); });
  // AI tool: sparkles, the made picture A unfolds up; photo B's edges unfold outward
  const aC = worldOf(easelA, V3(0, 0.75, 0.2)), pC = worldOf(phone, V3(0, 0.8, 0.1));
  sparkles.forEach((m, i) => { const on = t >= E.spark && t < E.extendEnd + 0.2; m.visible = on; if (!on) return; const k = prog(t, E.spark + i * 0.05, E.spark + i * 0.05 + 0.3, outBack) * (1 - prog(t, E.extendEnd - 0.1, E.extendEnd + 0.2));
    const src = i < 5 ? pC.clone().lerp(aC, prog(t, E.spark, E.genEnd)) : worldOf(easelB, V3(0, 0.75, 0.25)); const a = t * (1.6 + i * 0.13) + i * 0.7;
    m.position.copy(src).add(V3(Math.cos(a) * (0.5 + 0.06 * i), Math.sin(a * 1.3) * 0.35 + 0.1, Math.sin(a) * 0.2)); m.scale.setScalar(Math.max(0.01, k) * (0.6 + 0.05 * (i % 4))); m.rotation.set(0, 0, a); });
  { const u = prog(t, E.gen, E.genEnd, outBack); picA.visible = t >= E.gen - 0.02; aHinge.rotation.x = lerp(-Math.PI / 2, LEAN, clamp(u, 0, 1.1)); picA.scale.setScalar(lerp(0.3, 1, prog(t, E.gen, E.genEnd, outC))); }
  { const u = prog(t, E.extend, E.extendEnd, outC); wings.forEach(({ hinge, s }) => { hinge.rotation.y = s * Math.PI * 0.985 * (1 - u); hinge.position.z = -0.04 * (1 - u); }); }
  // invisible mark: stamp presses, nothing visible changes; magnifier reveals the hidden pattern
  picA.updateMatrixWorld(true); picA.getWorldQuaternion(_q);
  { const down = prog(t, E.stamp, E.stamp + 0.22, outC), up = prog(t, E.stampUp, E.stampUp + 0.35); const z = lerp(0.95, 0.13, down * (1 - up)); const x = lerp(-0.1, -1.2, prog(t, E.stampUp + 0.2, E.stampUp + 0.7));
    stamp.visible = t >= 11.8 && t < E.lensEnd; stamp.position.copy(picA.localToWorld(V3(x, 0.08, z))); stamp.quaternion.copy(_q); }
  shimmer.material.opacity = 0.22 * Math.sin(Math.PI * clamp((t - E.stamp - 0.15) / 0.45));
  { const u = prog(t, E.lens, E.lensEnd, outC); const d = prog(t, E.lensEnd, 15.9, (x) => x); const cx = lerp(-1.3, 0.12, u) + 0.22 * d, cy = lerp(-0.25, 0.05, u) + 0.12 * d;
    lens.visible = t >= E.lens - 0.05 && t < 15.9; lens.position.copy(picA.localToWorld(V3(cx, cy, 0.28))); lens.quaternion.copy(_q); setPattern(cx, cy, lens.visible ? prog(t, E.reveal, E.reveal + 0.4) : 0); }
  // which iPhones: 15 Pro and later stand up and light
  let k = 0; rowPhones.forEach((p) => { if (!p.ok) { p.hinge.rotation.x = -Math.PI / 2 + 0.03; p.scrM.emissiveIntensity = 0.0; return; } const u = prog(t, E.phones + k * 0.32, E.phones + k * 0.32 + 0.45, outBack); k++;
    p.hinge.rotation.x = lerp(-Math.PI / 2 + 0.03, -0.08, clamp(u, 0, 1.1)); p.scrM.emissiveIntensity = 0.65 * clamp(u); });
  // detector laptop + the picture copies that travel into it
  drawLaptop(laptopState(t)); lidHinge.updateMatrixWorld(true); const scrC = lidHinge.localToWorld(V3(0, 0.66, 0.06)); lidHinge.getWorldQuaternion(_q2);
  copyA.visible = false; copyM.visible = false;
  if (t >= E.scanIn - 0.05 && t < E.scanInEnd) fly(copyA, aC, scrC, _q, _q2, prog(t, E.scanIn, E.scanInEnd), 0.6, 0.12, 0.9);
  if (t >= E.scanIn2 - 0.05 && t < E.scanIn2End) { const mq = new THREE.Quaternion(); picM.getWorldQuaternion(mq); fly(copyM, worldOf(easelM, V3(0, 0.8, 0.2)), scrC, mq, _q2, prog(t, E.scanIn2, E.scanIn2End), 0.5, 0.1, 0.5); }
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

window.render = (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
