// Media Diet · 30 s English episode 12 — "Why is 500 km/h so hard?" BYD YANGWANG U9 Xtreme, 503.17 km/h (1 Nov 2026, FIA-recognised 6 Nov 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted Bean special / news-episode builds:
// a paper miniature in Media Diet brand colours — laminated cards with visible edges, paper grain, real cast shadows, one camera
// set-up per beat, restrained depth of field. Approved feedback rules (context/26): one visual idea at a time, one large brief label
// at a time, captions inside x 100–900 / y 230–1500. Car = generic paper reconstruction, not a replica. Deterministic: window.render(f).
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
  og.save(); og.globalAlpha = a; og.fillStyle = gr; og.fillRect(0, 300, W, 260); og.font = CAPF; const mw = Math.max(...c.lines.map((l) => og.measureText(l).width)); og.restore();
  const font = mw > 760 ? `700 ${Math.floor(50 * 760 / mw)}px "Space Grotesk"` : CAPF;   // keep every caption inside x 100–900
  if (c.lines.length === 1) otext(c.lines[0], 540, 448, { alpha: a, kind: 'caption', font });
  else { otext(c.lines[0], 540, 414, { alpha: a, kind: 'caption', font }); otext(c.lines[1], 540, 478, { alpha: a, kind: 'caption', font }); }
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




// ------------------------------------------------------------------ helpers for this special: arrows, labels, tokens
const ARROW = { mg: '#ffd23f', N: '#2addfa', fr: '#ff4d6d', push: '#3ddc84', react: '#4d8bff', white: '#f3f1ff' };
function makeArrow(color, r = 0.035, onTop = true) { const g = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.45, emissive: color, emissiveIntensity: 0.45, depthTest: !onTop, transparent: onTop });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 18), mat); const head = new THREE.Mesh(new THREE.ConeGeometry(r * 2.7, r * 6.5, 24), mat);
  if (onTop) { shaft.renderOrder = head.renderOrder = 5; } g.add(shaft, head); scene.add(g); g.userData = { shaft, head, r, mat }; g.visible = false; return g; }
function setArrow(a, from, dir, len, op = 1) { if (len < 0.02 || op <= 0.01) { a.visible = false; return; } a.visible = true; const hl = Math.min(a.userData.r * 6.5, len * 0.55), sl = Math.max(0.001, len - hl);
  a.position.copy(from); a.quaternion.setFromUnitVectors(V3(0, 1, 0), dir.clone().normalize()); a.userData.shaft.scale.set(1, sl, 1); a.userData.shaft.position.set(0, sl / 2, 0); a.userData.head.position.set(0, sl + hl / 2, 0); a.userData.mat.opacity = op; }
function labelTex(lines, bg, fg = '#ffffff', w = 640) { const h = 74 + (lines.length - 1) * 58; return canvasTex(w, h, (g) => { g.fillStyle = bg; rr(g, 0, 0, w, h, 26); g.fill(); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => { g.font = i === 0 ? '700 44px "Space Grotesk"' : '600 36px "Space Grotesk"'; g.fillText(l, w / 2, 38 + i * 58); }); }); }
function label(lines, bg, sc = 0.55, fg = '#ffffff', w = 640) { const tex = labelTex(lines, bg, fg, w); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })); const h = 74 + (lines.length - 1) * 58; sp.scale.set(sc, sc * h / w, 1); sp.renderOrder = 10; sp.visible = false; scene.add(sp); return sp; }
function showLabel(sp, pos, a) { sp.visible = a > 0.01; if (!sp.visible) return; sp.position.copy(pos); sp.material.opacity = clamp(a); const s0 = sp.userData.s0 || (sp.userData.s0 = sp.scale.clone()); const k = 0.85 + 0.15 * outBack(clamp(a)); sp.scale.set(s0.x * k, s0.y * k, 1); }
function token(col, s = 1) { const grp = new THREE.Group(); grp.scale.setScalar(s); scene.add(grp);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.03, 20), paper(P.violet)); foot.position.y = 0.015; foot.castShadow = true; grp.add(foot);
  const stick = card(0.03, 0.26, 0.02, P.edge, P.white, 'z'); stick.position.y = 0.15; grp.add(stick); const head = new THREE.Group(); head.position.y = 0.4; grp.add(head);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 28), paper(P.edge)); disc.rotation.x = Math.PI / 2; disc.castShadow = true; head.add(disc);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.14, 28), new THREE.MeshStandardMaterial({ map: canvasTex(128, 128, (g) => { g.fillStyle = col; g.beginPath(); g.arc(64, 64, 63, 0, Math.PI * 2); g.fill(); gPerson(g, 64, 66, 1.3, '#f3f1ff'); }), roughness: 0.9 })); face.position.z = 0.012; head.add(face); return grp; }
const PCOL = ['#7c3fda', '#2a9fbf', '#d23d7c', '#552dbc', '#e8a33a', '#3fae6a'];

// ------------------------------------------------------------------ environment map (stylised dusk sky) — only the glossy canopy uses it
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = (() => { const es = new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a3f9e'); gr.addColorStop(0.4, '#c9a4ff'); gr.addColorStop(0.5, '#ffd9a8'); gr.addColorStop(0.53, '#a8703f'); gr.addColorStop(1, '#2a2040'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) })));
  return pmrem.fromScene(es, 0.02).texture; })();
let sd = 11; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
const frac = (x) => x - Math.floor(x);
const dummy = new THREE.Object3D();

// ------------------------------------------------------------------ DESERT STRAIGHT (editorial reconstruction of the closed road, dusk light)
const roadSet = new THREE.Group(); scene.add(roadSet);
const SAND = { a: '#d6a265', b: '#c48a52', c: '#a87244', d: '#e4b878', edge: '#f2dcb4' };
{ const s = card(34, 0.02, 18, SAND.a, SAND.edge); s.position.set(0, DESK + 0.01, -1); roadSet.add(s); }
const RY = DESK + 0.04;                 // road surface height
{ const r = card(34, 0.02, 1.7, '#2b2d4f', '#55588a'); r.position.set(0, RY - 0.01, 0); roadSet.add(r);
  for (const z of [-0.76, 0.76]) { const e = card(34, 0.006, 0.05, P.white, P.white); e.position.set(0, RY + 0.003, z); roadSet.add(e); } }
const dashes = Array.from({ length: 44 }, () => { const d = card(0.42, 0.006, 0.05, '#ffd23f', '#ffd23f'); d.position.set(0, RY + 0.003, 0); roadSet.add(d); return d; });
[[-4.2, SAND.d, [[-17, 0.35], [-11, 0.8], [-6, 0.45], [-1, 0.95], [4, 0.5], [9, 0.85], [17, 0.4]]],
 [-6.0, SAND.b, [[-17, 0.8], [-10, 1.6], [-4, 0.95], [2, 1.8], [8, 1.05], [17, 1.4]]],
 [-8.0, SAND.c, [[-17, 1.3], [-9, 2.4], [-2, 1.6], [5, 2.7], [11, 1.7], [17, 2.1]]]].forEach(([z, c, pts]) => {
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(hillShape(pts), { depth: 0.06, bevelEnabled: false }), [paper(c), paper(SAND.edge)]); m.position.set(0, DESK, z); m.castShadow = true; m.receiveShadow = true; roadSet.add(m); });
const sun = new THREE.Mesh(new THREE.CircleGeometry(1.3, 64), new THREE.MeshStandardMaterial({ color: '#ffc46b', emissive: '#ffb04a', emissiveIntensity: 1.0, roughness: 1, map: grain })); sun.position.set(-3.2, 2.2, -9.6); roadSet.add(sun);

// ------------------------------------------------------------------ the car: a generic low electric hypercar in paper (not a replica), faces +x
const car = new THREE.Group(); roadSet.add(car); car.position.set(0, RY, 0);
const PROF = [[1.03, 0.11], [1.01, 0.19], [0.66, 0.26], [0.36, 0.3], [0.1, 0.44], [-0.3, 0.45], [-0.6, 0.38], [-0.96, 0.34], [-1.03, 0.27], [-1.01, 0.1]];
const shapeOf = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; };
const bodyMats = [paper('#ebe7ff', { transparent: true }), paper('#d6cffc', { transparent: true })];
const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shapeOf(PROF), { depth: 0.8, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.022, bevelSegments: 3, curveSegments: 4 }), bodyMats);
body.position.z = -0.4; body.castShadow = true; body.receiveShadow = true; car.add(body);
const glass = new THREE.MeshStandardMaterial({ color: '#10153f', metalness: 0.4, roughness: 0.12, envMap: envTex, envMapIntensity: 1.0, transparent: true });
const canopy = new THREE.Mesh(new THREE.ExtrudeGeometry(shapeOf([[0.37, 0.305], [0.11, 0.455], [-0.29, 0.462], [-0.52, 0.39], [-0.5, 0.32]]), { depth: 0.88, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 2 }), glass);
canopy.position.z = -0.44; canopy.castShadow = true; car.add(canopy);
const trimMat = paper(P.magenta, { transparent: true });
for (const z of [-0.437, 0.437]) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 0.006), trimMat); s.position.set(-0.06, 0.2, z); car.add(s); }
const archMat = new THREE.MeshStandardMaterial({ color: '#14163a', roughness: 0.9, transparent: true, side: THREE.DoubleSide });
const wheelTex = canvasTex(256, 256, (g) => { g.fillStyle = '#16182e'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#b9b2e8'; g.beginPath(); g.arc(128, 128, 84, 0, Math.PI * 2); g.fill(); g.fillStyle = '#2b2d4f'; g.beginPath(); g.arc(128, 128, 70, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#d9d3ff'; for (let i = 0; i < 5; i++) { g.save(); g.translate(128, 128); g.rotate(i * Math.PI * 2 / 5); g.fillRect(-9, -70, 18, 62); g.restore(); } g.fillStyle = P.magenta; g.beginPath(); g.arc(128, 128, 16, 0, Math.PI * 2); g.fill(); });
const wheelMat = new THREE.MeshStandardMaterial({ map: wheelTex, roughness: 0.8 });
const wheels = [[0.64, 0.42], [0.64, -0.42], [-0.66, 0.42], [-0.66, -0.42]].map(([x, z]) => { const w = new THREE.Group(); w.position.set(x, 0.15, z); car.add(w);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.11, 36), [paper('#1b1d33'), wheelMat, wheelMat]); m.rotation.x = Math.PI / 2; m.castShadow = true; w.add(m);
  const arch = new THREE.Mesh(new THREE.CircleGeometry(0.18, 28, 0, Math.PI), archMat); arch.position.set(x, 0.15, Math.sign(z) * 0.434); car.add(arch); return w; });
const darkCard = (w, h, d, thin = 'y') => { const m = card(w, h, d, '#24287e', P.lav, thin); return m; };
for (const z of [-0.22, 0.22]) { const s = darkCard(0.05, 0.22, 0.03); s.position.set(-0.8, 0.47, z); car.add(s); }
const wing = darkCard(0.3, 0.028, 0.98); wing.position.set(-0.83, 0.585, 0); wing.rotation.z = 0.1; car.add(wing);
for (const z of [-0.49, 0.49]) { const ep = darkCard(0.34, 0.13, 0.015, 'z'); ep.position.set(-0.83, 0.56, z); car.add(ep); }
const split = darkCard(0.16, 0.014, 0.86); split.position.set(0.98, 0.085, 0); car.add(split);
const headMat = new THREE.MeshStandardMaterial({ color: '#bff6ff', emissive: P.cyan, emissiveIntensity: 1.2 });
for (const z of [-0.27, 0.27]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.2), headMat); h.position.set(0.93, 0.205, z); h.rotation.z = -0.2; car.add(h); }
const tailMat = new THREE.MeshStandardMaterial({ color: '#ffd0e4', emissive: P.magenta, emissiveIntensity: 1.2 });
{ const tl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.74), tailMat); tl.position.set(-1.045, 0.29, 0); car.add(tl); }
// cutaway internals: four motors at the wheels, a flat blade-style battery in the floor (schematic)
const motors = [[0.6, 0.25], [0.6, -0.25], [-0.62, 0.25], [-0.62, -0.25]].map(([x, z]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.18, 28), new THREE.MeshStandardMaterial({ color: '#2a6f9a', emissive: P.cyan, emissiveIntensity: 0, roughness: 0.5 }));
  m.rotation.x = Math.PI / 2; m.position.set(x, 0.15, z); m.visible = false; car.add(m); return m; });
const batMat = new THREE.MeshStandardMaterial({ color: '#7c3fda', emissive: '#7c3fda', emissiveIntensity: 0.25, roughness: 0.6 });
const blades = Array.from({ length: 9 }, (_, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.06, 0.04), batMat); b.position.set(-0.02, 0.13, -0.24 + i * 0.06); b.visible = false; car.add(b); return b; });
function setCut(c) { bodyMats.forEach((m) => { m.opacity = 1 - 0.8 * c; m.depthWrite = c < 0.05; }); glass.opacity = 1 - 0.75 * c; glass.depthWrite = c < 0.05; trimMat.opacity = 1 - 0.7 * c; archMat.opacity = 1 - 0.8 * c;
  body.castShadow = c < 0.5; motors.forEach((m) => (m.visible = c > 0.02)); blades.forEach((b) => (b.visible = c > 0.02)); }
// thermometer prop for the heat beat
const thermo = new THREE.Group(); roadSet.add(thermo); thermo.position.set(-0.35, RY, -1.0); thermo.rotation.y = 0.6;
{ const tTex = canvasTex(160, 760, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 50); g.fill(); g.fillStyle = '#dcd6ff'; rr(g, 52, 40, 56, 640, 28); g.fill();
    g.fillStyle = 'rgba(61,220,132,0.85)'; g.fillRect(36, 330, 88, 150); g.fillStyle = 'rgba(255,77,109,0.5)'; g.fillRect(36, 60, 88, 150); g.fillStyle = '#14163a'; g.beginPath(); g.arc(80, 700, 46, 0, Math.PI * 2); g.fill(); });
  const f = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.95, 0.025), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tTex, roughness: 0.9 }), paper('#cfc8ff')]);
  f.position.y = 0.5; f.castShadow = true; thermo.add(f); const foot = card(0.34, 0.03, 0.22, '#cfc8ff', P.white); foot.position.y = 0.015; thermo.add(foot); }
const colMat = new THREE.MeshStandardMaterial({ color: '#ff4d6d', emissive: '#ff4d6d', emissiveIntensity: 0.35, roughness: 0.6 });
const column = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 0.012), colMat); thermo.add(column);
const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 24), colMat); bulb.rotation.x = Math.PI / 2; bulb.position.set(0, 0.5 - 0.95 / 2 + (60 / 760) * 0.95, 0.02); thermo.add(bulb);
const thermoY = (u) => 0.5 + 0.95 / 2 - (u / 760) * 0.95;   // canvas y (px) → local y
function setColumn(px) { const y0 = thermoY(690), y1 = thermoY(px); column.scale.y = Math.max(0.001, y1 - y0); column.position.set(0, (y0 + y1) / 2, 0.02); }
// heat flecks rising off the battery
const flecks = Array.from({ length: 16 }, (_, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.006), new THREE.MeshStandardMaterial({ color: '#ff9f43', emissive: '#ff6a2b', emissiveIntensity: 0.9, transparent: true })); m.userData = { x: -0.4 + rnd() * 0.8, z: -0.25 + rnd() * 0.5, ph: rnd() }; m.visible = false; car.add(m); return m; });
// dust kicked up behind the wheels (hook shot)
const puffs = Array.from({ length: 14 }, (_, i) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.09, 1), new THREE.MeshStandardMaterial({ color: SAND.d, roughness: 1, transparent: true, map: grain })); m.userData.ph = i / 14; m.visible = false; roadSet.add(m); return m; });
// oncoming air (relative wind) as paper flecks that pass over the car
const AIRN = 160; const air = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.012, 0.03), new THREE.MeshStandardMaterial({ color: '#eaf8ff', emissive: '#9fe8ff', emissiveIntensity: 0.45, roughness: 0.8 }), AIRN); air.visible = false; roadSet.add(air);
const AIR = Array.from({ length: AIRN }, () => ({ h: 0.04 + rnd() * 0.72, z: -0.45 + rnd() * 0.9, ph: rnd() * 6.4, sp: 2.4 + rnd() * 0.9 }));
const topY = (x) => { if (x > 1.45 || x < -1.9) return 0; if (x > 1.03) return 0.19 * (1 - (x - 1.03) / 0.42); if (x < -1.03) return 0.34 * (1 - (-1.03 - x) / 0.87);
  for (let i = 0; i < PROF.length - 2; i++) { const [x0, y0] = PROF[i], [x1, y1] = PROF[i + 1]; if (x <= x0 && x >= x1) return y0 + (y1 - y0) * (x0 - x) / (x0 - x1); } return 0.3; };
const flowY = (x, h) => h + Math.max(0, topY(x) + 0.06 - h * 0.45);
// arrows (onTop): drag, one-way run, ghost return
const A = { drag: makeArrow('#ff4d6d', 0.05), run: makeArrow(P.cyan, 0.07), back: makeArrow('#c9bfff', 0.07) };

// ------------------------------------------------------------------ the speedometer (super hook) — a paper dial on the desk
const gaugeSet = new THREE.Group(); scene.add(gaugeSet);
const dialTex = canvasTex(1024, 600, (g) => { g.fillStyle = '#0f1446'; rr(g, 0, 0, 1024, 600, 60); g.fill(); const cx = 512, cy = 540, R = 430;
  for (let v = 0; v <= 550; v += 10) { const a = Math.PI + (v / 550) * Math.PI; const maj = v % 100 === 0, mid = v % 50 === 0; const r0 = R - (maj ? 60 : mid ? 40 : 22);
    g.strokeStyle = v === 500 ? '#fe4092' : v > 500 ? '#ff9fc6' : '#d9d3ff'; g.lineWidth = v === 500 ? 14 : maj ? 8 : 4; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.stroke();
    if (maj) { g.fillStyle = v === 500 ? '#fe4092' : '#f3f1ff'; g.font = '700 56px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(v), cx + Math.cos(a) * (R - 112), cy + Math.sin(a) * (R - 112)); } }
  g.fillStyle = '#c9bfff'; g.font = '700 48px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('km/h', cx, cy - 140); });
const DIAL = { w: 1.7, h: 1.0, y: DESK + 0.12 + 0.5 };
{ const d = new THREE.Mesh(new THREE.BoxGeometry(DIAL.w, DIAL.h, 0.04), [paper(P.lav), paper(P.lav), paper(P.lav), paper(P.lav), new THREE.MeshStandardMaterial({ map: dialTex, roughness: 0.85 }), paper('#cfc8ff')]);
  d.position.set(0, DIAL.y, 0); d.castShadow = true; d.receiveShadow = true; gaugeSet.add(d);
  const st = card(1.9, 0.12, 0.5, P.deep, P.lav); st.position.set(0, DESK + 0.06, 0.05); gaugeSet.add(st); }
const pivot = new THREE.Group(); pivot.position.set(0, DIAL.y + DIAL.h / 2 - 0.9 * DIAL.h, 0.035); gaugeSet.add(pivot);
{ const n = card(0.035, 0.64, 0.015, '#ffd23f', '#ffd23f', 'z'); n.position.y = 0.3; pivot.add(n); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 28), paper(P.magenta)); hub.rotation.x = Math.PI / 2; pivot.add(hub); }

// ------------------------------------------------------------------ the cube lab: speed × speed × speed (instanced paper cubelets)
const cubeSet = new THREE.Group(); scene.add(cubeSet);
const CS = 0.16, CP = 0.172;
const cubeMat = new THREE.MeshStandardMaterial({ color: '#ffffff', map: grain, bumpMap: grain, bumpScale: 2.0, roughness: 0.9 });
const mkCubes = () => { const m = new THREE.InstancedMesh(new THREE.BoxGeometry(CS, CS, CS), cubeMat, 125); m.castShadow = true; m.receiveShadow = true; m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(125 * 3), 3); cubeSet.add(m); return m; };
const cubeA = mkCubes(), cubeB = mkCubes();
const COL = { drag: new THREE.Color('#ff4d6d'), power: new THREE.Color('#ffc53d'), speed: new THREE.Color(P.cyan) };
// set an n×n×n block: s(i,j,k) → scale 0..1, c(i,j,k) → colour
function setBlock(m, n, cx, cz, s, c) { let q = 0; for (let k = 0; k < n; k++) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const sc = Math.max(0.0001, s(i, j, k));
  dummy.position.set(cx + (i - (n - 1) / 2) * CP, DESK + 0.02 + CS / 2 + k * CP, cz + (j - (n - 1) / 2) * CP); dummy.scale.setScalar(sc); dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); m.setMatrixAt(q, dummy.matrix); m.setColorAt(q, c(i, j, k)); q++; }
  for (; q < 125; q++) { dummy.scale.setScalar(0.0001); dummy.updateMatrix(); m.setMatrixAt(q, dummy.matrix); }
  m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
const tagTex = (txt, bg) => canvasTex(420, 120, (g, w, h) => { g.fillStyle = bg; rr(g, 0, 0, w, h, 30); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 64px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 2); });
function tag(txt, bg) { const grp = new THREE.Group(); const f = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.02), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tagTex(txt, bg), roughness: 0.9 }), paper('#cfc8ff')]);
  f.position.y = 0.09; f.rotation.x = -0.35; f.castShadow = true; grp.add(f); cubeSet.add(grp); grp.visible = false; return grp; }
const tag400 = tag('400 km/h', '#3d46b5'), tag500 = tag('500 km/h', '#b0203a');
const slabMats = ['#2addfa', '#fe4092', '#a359fa'].map((c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.3, map: grain, roughness: 0.85, transparent: true, opacity: 0.62, depthWrite: false }));
const SLAB = 0.055, BS = 5 * CP - (CP - CS);   // block side for n = 5
const slabs = [new THREE.Mesh(new THREE.BoxGeometry(BS, SLAB, BS), slabMats[0]), new THREE.Mesh(new THREE.BoxGeometry(SLAB, BS, BS), slabMats[1]), new THREE.Mesh(new THREE.BoxGeometry(BS, BS, SLAB), slabMats[2])];
slabs.forEach((s) => { s.castShadow = true; s.receiveShadow = true; s.visible = false; cubeSet.add(s); });

// ------------------------------------------------------------------ CTA sign (Media Diet identity only)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, 1024, 300); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.0, RY, 1.55);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus, up) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look), up: up || V3(0, 1, 0) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const sh = (id) => TL.shots.find((s) => s.id === id);
const U = (id, t) => prog(t, sh(id).in, sh(id).out, (x) => x);
const SHOTS = {
  S1: (t) => { const u = U('S1', t); return SH(L3([4.35, 0.68, 3.3], [3.95, 0.64, 2.95], u), V3(0.12, 0.34, -0.05), 44); },
  S2: (t) => { const u = U('S2', t); return SH(L3([0.0, 0.98, 5.15], [0.0, 0.96, 4.85], u), V3(0, 0.64, 0), 44); },
  S3: (t) => { const u = U('S3', t); return SH(L3([0.05, 0.74, 6.45], [0.0, 0.72, 6.2], u), V3(-0.02, 0.5, 0), 44); },
  S4: (t) => { const u = U('S4', t); return SH(L3([1.6, 1.55, 2.75], [1.45, 1.6, 2.6], u), V3(0, 0.36, 0), 42); },
  S5: (t) => { const u = U('S5', t); return SH(L3([0.1, 2.05, 5.95], [0.06, 2.0, 5.7], u), V3(0.03, 0.36, 0), 42); },
  S6: (t) => { const u = U('S6', t); return SH(L3([3.55, 3.2, 3.35], [3.3, 3.1, 3.45], u), V3(-0.12, 0.12, 0), 44); },
  S7: (t) => { const u = U('S7', t); return SH(L3([2.45, 2.55, 2.75], [2.3, 2.45, 2.6], u), V3(0.05, 0.26, -0.2), 44); },
  S8: (t) => { const u = U('S8', t); return SH(L3([1.95, 1.95, 3.15], [1.8, 1.9, 3.0], u), V3(0.05, 0.47, 0.05), 42); },
  S9: (t) => { const u = U('S9', t); return SH(L3([0.0, 11.9, 0.1], [0.05, 11.6, 0.1], u), V3(1.25, 0.0, 0.1), 44, undefined, V3(1, 0, 0)); },
  S10: (t) => { const u = U('S10', t); return SH(L3([0.35, 1.7, 7.4], [0.3, 1.95, 7.8], u), L3([0.0, 0.62, 1.0], [0.0, 0.66, 0.9], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
const LAB = { list: [] };
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.copy(cam.up); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;
  roadSet.visible = ['S1', 'S3', 'S6', 'S7', 'S9', 'S10'].includes(id); gaugeSet.visible = id === 'S2'; cubeSet.visible = ['S4', 'S5', 'S8'].includes(id); sign.visible = id === 'S10';
  Object.values(A).forEach((a) => (a.visible = false));
  // road motion (the car stays put; the road, dust and air move past it)
  const speed = id === 'S1' ? 9.0 : id === 'S3' ? 4.5 : 0;
  const dist = id === 'S1' ? 9.0 * t : id === 'S3' ? 4.5 * (t - 5.3) + 7 : 3.2;
  dashes.forEach((d, i) => { d.position.x = frac((i * 0.75 - dist) / 33) * 33 - 16.5; });
  wheels.forEach((w) => (w.rotation.z = -dist / 0.15));
  car.position.x = 0; if (id === 'S9') car.position.x = lerp(-0.1, 0.7, prog(t, 23.55, 26.2, (x) => x)); if (id === 'S10') car.position.x = -0.35;
  // dust
  puffs.forEach((p, i) => { const on = id === 'S1'; p.visible = on; if (!on) return; const u = frac(t / 0.6 + p.userData.ph); const side = i % 2 ? 0.42 : -0.42;
    p.position.set(-0.75 - 2.4 * u, RY + 0.05 + 0.22 * u, side + Math.sign(side) * 0.15 * u); p.scale.setScalar(0.5 + 1.8 * u); p.material.opacity = 0.55 * (1 - u) * clamp(u * 6); });
  // air
  air.visible = id === 'S3';
  if (air.visible) { const k = prog(t, E.air - 0.1, E.air + 0.4); AIR.forEach((a, i) => { const x = 3.2 - frac((t * a.sp + a.ph) / 6.4) * 6.4; const over = Math.abs(a.z) < 0.5; const y = RY + (over ? flowY(x, a.h) : a.h + 0.02);
      const y2 = RY + (over ? flowY(x - 0.05, a.h) : a.h + 0.02); dummy.position.set(x, y, a.z); dummy.rotation.set(0, 0, Math.atan2(y - y2, 0.05)); dummy.scale.setScalar(k * (0.8 + 0.4 * (i % 3) / 2)); dummy.updateMatrix(); air.setMatrixAt(i, dummy.matrix); }); air.instanceMatrix.needsUpdate = true;
    const v = prog(t, E.drag - 0.05, 7.4, (x) => x); setArrow(A.drag, V3(0.95, RY + 0.8, 0.3), V3(-1, 0, 0), 1.85 * v * v + 0.001, 1); }
  if (id === 'S2') { let v = 490 * outC(prog(t, E.needle - 0.05, E.needle + 0.45)); if (t > E.crawl) v = 490 + 13.17 * prog(t, E.crawl, 5.25, (x) => x); v += 1.4 * Math.sin(t * 47) * prog(t, E.crawl, E.crawl + 0.25);
    pivot.rotation.z = Math.PI / 2 - (v / 550) * Math.PI; }
  // cutaway (motors + battery)
  const cut = id === 'S6' ? prog(t, 13.4, 13.75) : id === 'S7' ? 1 : 0; setCut(cut);
  motors.forEach((m, i) => { m.material.emissiveIntensity = id === 'S6' ? 1.4 * prog(t, E.m1 + i * 0.17, E.m1 + i * 0.17 + 0.2) + 0.25 * Math.max(0, Math.sin(t * 9 + i)) * prog(t, E.labMW, E.labMW + 0.3) : id === 'S7' ? 0.35 : 0; });
  { const hot = id === 'S7' ? prog(t, E.heat, E.heat + 0.5) * (1 - prog(t, E.cool, E.ideal)) : 0; const ok = id === 'S7' ? prog(t, E.cool + 0.3, E.ideal + 0.2) : 0;
    const c = new THREE.Color('#7c3fda').lerp(new THREE.Color('#ff5a2b'), hot).lerp(new THREE.Color('#3ddc84'), ok); batMat.color.copy(c); batMat.emissive.copy(c);
    batMat.emissiveIntensity = (id === 'S6' ? 0.25 + 0.5 * prog(t, E.labMW, E.labMW + 0.3) : 0.25) + hot * (0.9 + 0.25 * Math.sin(t * 23)) + ok * 0.35;
    flecks.forEach((f) => { const on = hot > 0.05; f.visible = on; if (!on) return; const u = frac(t * 0.9 + f.userData.ph); f.position.set(f.userData.x, 0.18 + 0.55 * u, f.userData.z); f.material.opacity = hot * (1 - u); f.rotation.set(t * 3 + u, t * 2, 0); });
    thermo.visible = id === 'S7'; if (thermo.visible) { const lvl = lerp(560, 150, prog(t, E.heat, E.heat + 0.7)); setColumn(lerp(lvl, 400, prog(t, E.cool, E.ideal))); colMat.color.copy(c.clone().lerp(new THREE.Color('#ff4d6d'), hot * 0.5)); colMat.emissive.copy(colMat.color); } }
  // one-way run
  if (id === 'S9') { setArrow(A.run, V3(car.position.x + 1.12, RY + 0.14, -0.05), V3(1, 0, 0), (3.3 - car.position.x - 1.12) * prog(t, E.one, E.one + 0.7), 1); setArrow(A.back, V3(3.3, RY + 0.14, 0.62), V3(-1, 0, 0), 3.9 * prog(t, E.ghost, E.ghost + 0.7), 0.4); }
  // the cube lab
  if (cubeSet.visible) {
    if (id === 'S4') { const n = 4; setBlock(cubeA, n, 0, 0, (i, j, k) => (k === 0 ? prog(t, E.sq + (i + j) * 0.05, E.sq + (i + j) * 0.05 + 0.25, outBack) : prog(t, E.ext + (k - 1) * 0.25 + i * 0.02, E.ext + (k - 1) * 0.25 + i * 0.02 + 0.25, outBack)),
        (i, j, k) => (k === 0 ? COL.drag : COL.speed).clone().lerp(COL.power, prog(t, E.labV3, E.labV3 + 0.35)));
      setBlock(cubeB, 0, 0, 0, () => 0, () => COL.power); tag400.visible = tag500.visible = false; slabs.forEach((s) => (s.visible = false)); }
    if (id === 'S5') { setBlock(cubeA, 4, -0.62, 0, () => 1, () => COL.power); setBlock(cubeB, 5, 0.66, 0, (i, j, k) => prog(t, E.c5 + k * 0.2 + (i + j) * 0.015, E.c5 + k * 0.2 + (i + j) * 0.015 + 0.25, outBack), () => COL.power);
      tag400.visible = true; tag400.position.set(-0.62, DESK + 0.02, 0.62); tag400.scale.setScalar(Math.max(0.01, prog(t, E.c4, E.c4 + 0.3, outBack)));
      tag500.visible = t >= E.c5; tag500.position.set(0.66, DESK + 0.02, 0.7); tag500.scale.setScalar(Math.max(0.01, prog(t, E.c5, E.c5 + 0.3, outBack))); slabs.forEach((s) => (s.visible = false)); }
    if (id === 'S8') { setBlock(cubeA, 0, 0, 0, () => 0, () => COL.power); setBlock(cubeB, 5, 0, 0, () => 1, () => COL.power); tag400.visible = tag500.visible = false;
      const h0 = DESK + 0.02, top = h0 + BS, x1 = BS / 2, z1 = BS / 2;
      [[E.s1, V3(0, top + SLAB / 2 + 0.035, 0)], [E.s2, V3(x1 + SLAB / 2 + 0.035, h0 + BS / 2, 0)], [E.s3, V3(0, h0 + BS / 2, z1 + SLAB / 2 + 0.035)]].forEach(([te, p], i) => { const s = slabs[i]; const u = prog(t, te, te + 0.3, outBack); s.visible = u > 0.01; s.position.copy(p);
        const off = (1 - clamp(u)) * 0.35; if (i === 0) s.position.y += off; if (i === 1) s.position.x += off; if (i === 2) s.position.z += off; s.scale.setScalar(Math.max(0.01, Math.min(1.08, u))); }); }
  }
  // CTA sign
  const sgu = prog(t, E.sign, E.sign + 0.45, outBack); sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(sgu, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}

// ------------------------------------------------------------------ 2-D overlay: one large, brief label at a time (never in the caption band)
function chip(text, x, y, bg, o = {}) { og.save(); og.font = o.font || '700 30px "Space Grotesk"'; const w = og.measureText(text).width + 40, h = o.h || 52; const x0 = o.align === 'left' ? x : x - w / 2; og.globalAlpha = o.alpha ?? 1; og.fillStyle = bg; rr(og, x0, y - h / 2, w, h, h / 2); og.fill(); og.restore();
  otext(text, x0 + w / 2, y + (o.dy ?? 11), { font: o.font || '700 30px "Space Grotesk"', alpha: o.alpha ?? 1, shadow: 0, kind: o.kind || 'label', color: o.color }); }
function big(text, y, a, bg, o = {}) { if (a <= 0.01) return; const fs = o.size || 78; const yy = y + (1 - outC(clamp(a))) * 18;
  chip(text, o.x ?? 540, yy, bg, { font: `700 ${fs}px "Space Grotesk"`, h: Math.round(fs * 1.42), alpha: clamp(a), dy: Math.round(fs * 0.36), color: o.color }); }
const win = (t, a, b, f = 0.25) => prog(t, a, a + f) * (1 - prog(t, b - 0.12, b));
function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = []; const id = shot.id;
  const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  if (id === 'S1') { const r = 503.17 * outC(prog(t, E.readout, 1.75)); big(`${r.toFixed(2)} km/h`, 1250, prog(t, E.readout, E.readout + 0.25), 'rgba(13,18,64,0.82)', { size: 92, color: '#ffd23f' });
    chip('FIA-recognised · Abu Dhabi · 1 Nov 2026', 540, 1372, 'rgba(254,64,146,0.92)', { font: '700 30px "Space Grotesk"', alpha: prog(t, E.fia, E.fia + 0.3) });
    chip('editorial reconstruction', 540, 1446, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, 0.2, 0.5), dy: 9 }); }
  if (id === 'S3') big('drag: speed²', 1330, prog(t, E.labV2, E.labV2 + 0.25), 'rgba(196,40,74,0.94)');
  if (id === 'S4') { big('drag: speed²', 1330, win(t, E.sq + 0.05, E.ext), 'rgba(196,40,74,0.94)'); big('× speed', 1330, win(t, E.ext, E.labV3), 'rgba(18,122,143,0.94)'); big('power: speed³', 1330, prog(t, E.labV3, E.labV3 + 0.25), 'rgba(176,112,0,0.95)'); }
  if (id === 'S5') big('×1.95', 1330, prog(t, E.lab195, E.lab195 + 0.25), 'rgba(176,112,0,0.95)', { size: 96 });
  if (id === 'S6') { big('4 × 555 kW', 1330, win(t, E.labKW, E.labMW), 'rgba(18,122,143,0.94)'); big('= 2.2 MW', 1330, prog(t, E.labMW, E.labMW + 0.25), 'rgba(18,122,143,0.94)', { size: 96 }); }
  if (id === 'S7') { big('HEAT', 1330, win(t, E.labHeat, E.ideal), 'rgba(196,60,30,0.95)', { size: 96 }); big('ideal start temp', 1330, prog(t, E.ideal, E.ideal + 0.25), 'rgba(26,127,75,0.95)'); }
  if (id === 'S8') { big('+1% speed', 1330, win(t, E.labP1, E.labP3), 'rgba(18,122,143,0.94)'); big('+3% power', 1330, prog(t, E.labP3, E.labP3 + 0.25), 'rgba(176,112,0,0.95)');
    chip('slabs exaggerated for clarity', 540, 1446, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, E.s1, E.s1 + 0.3), dy: 9 }); }
  if (id === 'S9') { big('ONE WAY', 1430, win(t, E.one + 0.1, E.ghost), 'rgba(18,122,143,0.94)', { size: 80 }); big('no 2-way average', 1430, prog(t, E.ghost + 0.05, E.ghost + 0.3), 'rgba(196,40,74,0.94)', { size: 72 }); }
  captions(t);
}

// printed cards that glow get their own print as the emissive map (a flat white glow washes them out)
scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
// separate vertical thumbnail tied to the hook: the record car at speed + 4 large words ("500 KM/H" / "WHY HARD?")
window.renderThumb = async () => { const t = 2.7; update(t);
  camera.position.set(3.55, 0.5, 2.75); camera.up.set(0, 1, 0); camera.fov = 44; camera.updateProjectionMatrix(); camera.lookAt(V3(0.22, 0.72, -0.05)); bokeh.uniforms.focus.value = camera.position.distanceTo(V3(0, 0.3, 0)); composer.render();
  og.clearRect(0, 0, W, H); TEXTLOG = []; const v = og.createLinearGradient(0, 0, 0, H); v.addColorStop(0, 'rgba(4,5,26,0.55)'); v.addColorStop(0.45, 'rgba(4,5,26,0.1)'); v.addColorStop(1, 'rgba(4,5,26,0.35)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  const fit = (txt, size) => { og.font = `700 ${size}px "Space Grotesk"`; const w = og.measureText(txt).width; return w > 700 ? Math.floor(size * 700 / w) : size; };
  const f1 = fit('500 KM/H', 200), f2 = fit('WHY HARD?', 170);
  otext('500 KM/H', 540, 560, { font: `700 ${f1}px "Space Grotesk"`, color: '#ffd23f', shadow: 30, kind: 'thumb' });
  otext('WHY HARD?', 540, 560 + f2 * 1.15, { font: `700 ${f2}px "Space Grotesk"`, color: '#f6f4ff', shadow: 30, kind: 'thumb' });
  chip('editorial reconstruction', 540, 1446, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, dy: 9 }); return TEXTLOG; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
