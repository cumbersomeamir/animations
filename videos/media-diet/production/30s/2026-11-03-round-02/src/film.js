// Media Diet · 30 s round-02 episode — "How emergency satellite messaging reaches help when there is no mobile signal"
// Style recipe: LAYERED TECH CUTAWAY (context/11), unchanged from the accepted feedback-round renderer: a handcrafted paper
// miniature in Media Diet brand colours — laminated cards with visible edges, paper grain, real cast shadows, hinged props,
// one camera set-up per beat, restrained depth of field. three.js is only the renderer; the style is the paper craft.
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


// ------------------------------------------------------------------ landscape: paper contour layers on the table
const GROUND = 0.05;
const flatShape = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], -pts[0][1]); for (const [x, z] of pts.slice(1)) s.lineTo(x, -z); s.closePath(); return s; };
function flatLayer(pts, y, thick, color, edge = P.lav) {
  const g = new THREE.ExtrudeGeometry(flatShape(pts), { depth: thick, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, [paper(tint(color)), paper(edge)]); m.position.y = y; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
}
function blob(cx, cz, r, seed, wob = 0.12, n = 44) {
  let s = seed; const rr = () => ((s = (s * 16807) % 2147483647) / 2147483647); const ph = [rr() * 6.28, rr() * 6.28, rr() * 6.28]; const pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const k = 1 + wob * (0.6 * Math.sin(2 * a + ph[0]) + 0.3 * Math.sin(3 * a + ph[1]) + 0.2 * Math.sin(5 * a + ph[2])); pts.push([cx + Math.cos(a) * r * k, cz + Math.sin(a) * r * k]); }
  return pts;
}
{ const pts = []; for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); pts.push([8.3 * Math.sign(c) * Math.abs(c) ** 0.22, 11.3 * Math.sign(s) * Math.abs(s) ** 0.22]); }
  flatLayer(pts, 0.0, GROUND, '#27308f'); }
function contourHill(cx, cz, radii, seed, cols, step = 0.14) { radii.forEach((r, i) => flatLayer(blob(cx, cz, r, seed + i * 7, 0.14), GROUND + i * step, step, cols[i % cols.length])); }
const HILLC = ['#2f3aa8', '#3d46b5', '#5160d2', '#6a72dd'];
contourHill(-6.8, -0.6, [2.2, 1.65, 1.1, 0.6], 21, HILLC);
contourHill(6.9, -6.6, [2.7, 2.0, 1.35, 0.7], 33, HILLC);
contourHill(7.3, 9.0, [1.5, 0.9], 45, HILLC);
// standing ridge cut-outs between the phone and the distant tower
function standCut(pts, z, color, thick = 0.07) { const g = new THREE.ExtrudeGeometry(hillShape(pts), { depth: thick, bevelEnabled: false }); const m = new THREE.Mesh(g, [paper(color), paper(P.lav)]); m.position.set(0, GROUND - 0.01, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; }
standCut([[-8.6, 1.2], [-7.4, 1.85], [-6.2, 2.05], [-4.6, 1.85], [-3.0, 1.5], [-1.4, 1.05], [0.4, 0.65], [2.2, 0.28], [2.8, 0]], -3.3, '#8d78e8');
standCut([[-8.6, 1.8], [-7.0, 2.5], [-5.4, 2.3], [-3.6, 2.1], [-1.8, 1.6], [0.2, 1.1], [1.8, 0.55], [2.6, 0]], -3.95, P.violet);
// clearing, rock (the phone's spot) and stepping stones from the trailhead
const P0 = { x: -1.2, z: 3.2 }, PTREE = { x: -2.9, z: 3.05 }, PTRAIL = { x: 4.8, z: 8.85 };
flatLayer(blob(P0.x, P0.z, 1.5, 5, 0.15), GROUND, 0.02, '#3540a8');
const ROCK_TOP = GROUND + 0.02 + 0.3;
[[0.62, '#8f88c9'], [0.47, '#a59fdc'], [0.31, '#bdb8ef']].forEach(([r, c], i) => flatLayer(blob(P0.x, P0.z, r, 9 + i, 0.18), GROUND + 0.02 + i * 0.1, 0.1, c, P.white));
for (let i = 0; i < 8; i++) { const u = i / 7; const x = lerp(3.9, -0.4, u) + Math.sin(u * 5) * 0.3, z = lerp(8.1, 4.4, u); flatLayer(blob(x, z, 0.17, 50 + i, 0.2, 16), GROUND, 0.025, '#5b60c0', P.lav); }

// crossed-card paper conifers (two slotted cut-outs)
function treeShape(h, r, trunk) {
  const s = new THREE.Shape(), tw = 0.07, c = h - trunk, y = (f) => trunk + c * f;
  s.moveTo(-tw, 0); s.lineTo(-tw, trunk); s.lineTo(-r, trunk); s.lineTo(-r * 0.45, y(0.3)); s.lineTo(-r * 0.8, y(0.3)); s.lineTo(-r * 0.3, y(0.6)); s.lineTo(-r * 0.58, y(0.6)); s.lineTo(0, h);
  s.lineTo(r * 0.58, y(0.6)); s.lineTo(r * 0.3, y(0.6)); s.lineTo(r * 0.8, y(0.3)); s.lineTo(r * 0.45, y(0.3)); s.lineTo(r, trunk); s.lineTo(tw, trunk); s.lineTo(tw, 0); return s;
}
function tree(x, z, h, r, color, trunkF = 0.2, rot = 0) {
  const g = new THREE.Group(); const geo = new THREE.ExtrudeGeometry(treeShape(h, r, h * trunkF), { depth: 0.03, bevelEnabled: false }); geo.translate(0, 0, -0.015);
  for (const a of [0, Math.PI / 2]) { const m = new THREE.Mesh(geo, [paper(tint(color)), paper(P.lav)]); m.rotation.y = a; m.castShadow = true; m.receiveShadow = true; g.add(m); }
  g.position.set(x, GROUND, z); g.rotation.y = rot; scene.add(g); return g;
}
const TA = { x: -2.75, z: 2.45 };
tree(TA.x, TA.z, 3.6, 1.2, '#8d78e8', 1.05 / 3.6, 0.785);
[[-4.6, 1.2, 2.7, 0.95, '#b9a6ff'], [-4.9, 3.5, 2.3, 0.85, '#7c5ce8'], [-2.2, 0.6, 2.1, 0.8, '#c9bfff'], [-6.5, 4.6, 2.8, 1.0, '#8d78e8'], [-5.9, -2.2, 2.4, 0.9, '#b9a6ff'],
 [1.0, -1.7, 2.0, 0.75, '#8d78e8'], [2.5, -4.8, 2.3, 0.85, '#c9bfff'], [8.2, -1.0, 2.6, 0.95, '#7c5ce8'], [7.8, 5.9, 2.2, 0.8, '#b9a6ff'], [-7.0, 8.5, 2.4, 0.9, '#8d78e8'],
 [-3.8, 9.8, 1.9, 0.7, '#c9bfff'], [8.1, 11.2, 1.8, 0.7, '#7c5ce8'], [-8.0, -6.5, 2.2, 0.8, '#b9a6ff'], [0.2, -6.8, 2.0, 0.75, '#8d78e8']].forEach(([x, z, h, r, c], i) => tree(x, z, h, r, c, 0.2, 0.6 + i * 0.13));

// ------------------------------------------------------------------ mobile tower (lattice of paper struts) + two small houses it serves
function strut(a, b, th, color) { const d = b.clone().sub(a); const m = card(th, d.length(), th, color, P.white, 'x'); m.position.copy(a.clone().add(b).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); return m; }
const TOWER = { x: -5.6, z: -6.2, H: 4.2 };
const tower = new THREE.Group(); tower.position.set(TOWER.x, GROUND, TOWER.z); scene.add(tower);
{ const hb = 0.5, ht = 0.16, H = TOWER.H; const corner = (sx, sz, y) => { const h = lerp(hb, ht, y / H); return V3(sx * h, y, sz * h); };
  const C4 = [[-1, -1], [1, -1], [1, 1], [-1, 1]]; const lv = [0, 0.9, 1.8, 2.7, 3.5, H];
  for (const [sx, sz] of C4) tower.add(strut(corner(sx, sz, 0), corner(sx, sz, H), 0.07, P.lav));
  for (let i = 1; i < lv.length; i++) for (let k = 0; k < 4; k++) { const [ax, az] = C4[k], [bx, bz] = C4[(k + 1) % 4];
    tower.add(strut(corner(ax, az, lv[i]), corner(bx, bz, lv[i]), 0.04, P.edge)); tower.add(strut(corner(ax, az, lv[i - 1]), corner(bx, bz, lv[i]), 0.03, P.edge)); }
  const plat = card(0.62, 0.05, 0.62, P.violet2, P.white); plat.position.y = H + 0.02; tower.add(plat);
  const mast = card(0.05, 0.7, 0.05, P.lav, P.white, 'x'); mast.position.y = H + 0.37; tower.add(mast);
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + 0.3; const pn = card(0.16, 0.55, 0.05, P.white, P.lav, 'z'); pn.position.set(Math.sin(a) * 0.24, H + 0.36, Math.cos(a) * 0.24); pn.rotation.y = a; tower.add(pn); }
  const bc = card(0.09, 0.09, 0.09, P.magenta, '#ffd1e4'); bc.position.y = H + 0.75; tower.add(bc); }
const TOWER_TOP = V3(TOWER.x, GROUND + TOWER.H + 0.4, TOWER.z);
function house(x, z, rot, c) { const g = new THREE.Group(); const b = card(0.6, 0.42, 0.5, c, P.white, 'z'); b.position.y = 0.21; g.add(b);
  for (const s of [-1, 1]) { const r = card(0.36, 0.03, 0.58, P.violet, P.edge, 'y'); r.position.set(s * 0.15, 0.53, 0); r.rotation.z = -s * 0.62; g.add(r); }
  const w = card(0.14, 0.12, 0.02, '#ffe9d2', P.white, 'z'); w.position.set(0.12, 0.24, 0.26); g.add(w); g.position.set(x, GROUND, z); g.rotation.y = rot; scene.add(g); return g; }
const HOUSES = [[-4.3, -5.1, 0.3, P.lav], [-6.8, -4.9, -0.4, '#b9a6ff'], [-5.0, -7.6, 0.1, P.lav]].map(([x, z, r, c]) => ({ x, z, g: house(x, z, r, c) }));

// ------------------------------------------------------------------ dusk sky props: paper stars + crescent moon on wires
const wireMat = new THREE.MeshStandardMaterial({ color: '#2a2f72' });
{ const st = new THREE.Shape(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.07 : 0.24; const p = [Math.cos(a) * r, Math.sin(a) * r]; if (i) st.lineTo(...p); else st.moveTo(...p); }
  const sg_ = new THREE.ExtrudeGeometry(st, { depth: 0.03, bevelEnabled: false });
  for (const [x, y, z, s] of [[-6.8, 8.4, -10.5, 1], [-3.2, 9.8, -11, 0.8], [3.4, 9.6, -10.8, 0.9], [6.4, 10.8, -11.2, 1.1], [-0.4, 11.6, -11.5, 0.7], [5.4, 7.6, -9.8, 0.75], [-8.2, 11.0, -11.8, 0.8], [1.6, 7.9, -10.2, 0.6]]) {
    const m = new THREE.Mesh(sg_, [paper(P.edge), paper(P.white)]); m.position.set(x, y, z); m.scale.setScalar(s); m.rotation.z = x * 0.3; scene.add(m);
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 6, 4), wireMat); w.position.set(x, y + 3.2, z); scene.add(w); }
  const moon = new THREE.Shape(); moon.absarc(0, 0, 0.75, 0, Math.PI * 2, false); const hole = new THREE.Path(); hole.absarc(0.32, 0.18, 0.62, 0, Math.PI * 2, true); moon.holes.push(hole);
  const mm = new THREE.Mesh(new THREE.ExtrudeGeometry(moon, { depth: 0.04, bevelEnabled: false }), [paper('#f4f0dc'), paper(P.white)]); mm.position.set(6.6, 9.6, -12); mm.rotation.z = 0.3; mm.scale.setScalar(0.8); scene.add(mm);
  const mw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 6, 4), wireMat); mw.position.set(6.4, 12.9, -12); scene.add(mw); }

// ------------------------------------------------------------------ satellite (the accepted paper cut-out on a wire) gliding along an orbit arc
const sat = new THREE.Group(); scene.add(sat);
{ const body = card(0.7, 0.45, 0.45, P.lav, P.white, 'y'); sat.add(body);
  const panTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#1d2470'; g.fillRect(0, 0, w, h); g.strokeStyle = P.cyan; g.lineWidth = 3; for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.55), [paper(P.edge), paper(P.edge), new THREE.MeshStandardMaterial({ map: panTex, roughness: 0.9 }), paper('#1d2470'), paper(P.edge), paper(P.edge)]); p.position.x = s * 1.02; p.castShadow = true; sat.add(p); }
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.13, 0.16, 16), [paper(P.white), paper(P.lav), paper(P.lav)]); ant.position.y = -0.3; sat.add(ant);
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 6, 6), wireMat); wire.position.y = 3.2; sat.add(wire); }
sat.scale.setScalar(1.2);
const SAT_R = 40.5, SAT_C = V3(0, -32.5, -5.5);
const satAngle = (t) => (t < E.satIn ? -0.3 : t < E.satArrive ? lerp(-0.25, 0.018, prog(t, E.satIn, E.satArrive, outC)) : 0.018 + 0.0011 * (t - E.satArrive));
const satPos = (t) => { const a = satAngle(t); return V3(SAT_C.x + Math.sin(a) * SAT_R, SAT_C.y + Math.cos(a) * SAT_R, SAT_C.z); };

// ------------------------------------------------------------------ the phone (paper prop on a folded stand; screen is a printed, redrawn card)
const PH = { w: 0.46, h: 0.88, d: 0.055 };
const AIM_TILT = -0.34, AIM_YAW = -0.4;
const phone = new THREE.Group(); scene.add(phone); const phoneTilt = new THREE.Group(); phone.add(phoneTilt);
const scr = document.createElement('canvas'); scr.width = 300; scr.height = 574; const sg = scr.getContext('2d');
const scrTex = new THREE.CanvasTexture(scr); scrTex.colorSpace = THREE.SRGBColorSpace; scrTex.anisotropy = 8;
{ const body = card(PH.w, PH.h, PH.d, P.navy2, P.lav, 'z'); body.position.y = PH.h / 2 + 0.02; phoneTilt.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(PH.w - 0.06, PH.h - 0.07), new THREE.MeshStandardMaterial({ map: scrTex, emissive: '#ffffff', emissiveMap: scrTex, emissiveIntensity: 0.6, roughness: 0.85 }));
  screen.position.set(0, PH.h / 2 + 0.02, PH.d / 2 + 0.002); phoneTilt.add(screen);
  const clip = card(0.36, 0.07, 0.24, P.lav, P.white, 'y'); clip.position.y = 0.035; phone.add(clip);
  const lip = card(0.36, 0.1, 0.02, P.lav, P.white, 'z'); lip.position.set(0, 0.06, 0.06); phone.add(lip); }
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function sBars(g, x, y, sc, full) { for (let i = 0; i < 4; i++) { const bh = (10 + i * 10) * sc, bw = 11 * sc; rr(g, x + i * 17 * sc, y - bh, bw, bh, 3 * sc); if (full) { g.fillStyle = P.cyan; g.fill(); } else { g.strokeStyle = '#a9a3e6'; g.lineWidth = 3 * Math.max(1, sc * 0.6); g.stroke(); } } }
function sSat(g, cx, cy, sc, col) { g.save(); g.translate(cx, cy); g.rotate(-0.45); g.scale(sc, sc); g.fillStyle = col; g.fillRect(-14, -11, 28, 22);
  g.strokeStyle = col; g.lineWidth = 3; for (const s of [-1, 1]) { g.strokeRect(s > 0 ? 20 : -56, -9, 36, 18); g.beginPath(); g.moveTo(s * 14, 0); g.lineTo(s * 20, 0); g.moveTo(s > 0 ? 32 : -44, -9); g.lineTo(s > 0 ? 32 : -44, 9); g.moveTo(s > 0 ? 44 : -32, -9); g.lineTo(s > 0 ? 44 : -32, 9); g.stroke(); }
  g.beginPath(); g.moveTo(0, 11); g.lineTo(0, 20); g.stroke(); g.beginPath(); g.arc(0, 26, 7, Math.PI, 0); g.stroke(); g.restore(); }
function sBubble(g, cx, cy, sc, fill, line, tailRight = false) { g.save(); g.translate(cx, cy); g.scale(sc, sc); g.fillStyle = fill; rr(g, -95, -58, 190, 116, 30); g.fill();
  g.beginPath(); const tx = tailRight ? 50 : -50; g.moveTo(tx - 16, 50); g.lineTo(tx + (tailRight ? 30 : -30), 86); g.lineTo(tx + 16, 50); g.fill();
  g.strokeStyle = line; g.lineWidth = 11; g.lineCap = 'round'; for (const [y, l] of [[-24, 120], [2, 104], [28, 70]]) { g.beginPath(); g.moveTo(-60, y); g.lineTo(-60 + l, y); g.stroke(); } g.restore(); }
function sCheck(g, cx, cy, r, a) { if (a <= 0) return; g.save(); g.globalAlpha = Math.min(1, a); g.translate(cx, cy); const s = outBack(Math.min(1, a)); g.scale(s, s); g.fillStyle = P.cyan; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#0d1240'; g.lineWidth = r * 0.24; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-r * 0.45, 0); g.lineTo(-r * 0.12, r * 0.33); g.lineTo(r * 0.5, -r * 0.35); g.stroke(); g.restore(); }
let lastKey = '';
function drawScreen(s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 30) / 30 : v)); if (key === lastKey) return; lastKey = key;
  const g = sg, w = 300, h = 574; const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1d2470'); bg.addColorStop(1, '#0f1449'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  sBars(g, 28, 62, 0.9, s.bars === 'full');
  if (s.bars !== 'full') { g.strokeStyle = P.magenta; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(26, 64); g.lineTo(84, 22); g.stroke(); }
  if (s.sat) sSat(g, 236, 44, 0.5, P.cyan);
  if (s.mode === 'nosig') {
    sBars(g, 82, 360, 2.6, false);
    const a = clamp(s.slash ?? 0); if (a > 0) { g.strokeStyle = P.magenta; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(70, 380); g.lineTo(lerp(70, 238, a), lerp(380, 220, a)); g.stroke(); }
  } else if (s.mode === 'aim') {
    const pop = outBack(clamp(s.pop ?? 1)); g.save(); g.translate(150, 330); g.scale(pop, pop);
    sSat(g, 0, -150, 1.25, '#e9e5ff');
    g.lineWidth = 7; if (s.blocked) { g.strokeStyle = P.magenta; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(0, 0, 78, i * Math.PI / 3 + 0.15, i * Math.PI / 3 + 0.75); g.stroke(); } }
    else { g.strokeStyle = P.cyan; g.setLineDash([16, 12]); g.beginPath(); g.arc(0, 0, 78, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); }
    const d = s.dot ?? 0; g.strokeStyle = 'rgba(233,229,255,0.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-20, 0); g.lineTo(20, 0); g.moveTo(0, -20); g.lineTo(0, 20); g.stroke();
    g.fillStyle = s.blocked ? P.magenta : P.cyan; g.beginPath(); g.arc(d * 46, -d * 34, 17, 0, Math.PI * 2); g.fill(); g.restore();
  } else if (s.mode === 'msg' || s.mode === 'reply') {
    const pop = outBack(clamp(s.pop ?? 1)); const up = s.mode === 'reply' ? clamp(s.r ?? 0) : 0;
    sSat(g, 150, 136, 1.0, '#e9e5ff');
    const p = clamp(s.p ?? 0); for (let i = 0; i < 5; i++) { const on = p * 5 > i + 0.5; g.fillStyle = on ? P.cyan : 'rgba(169,163,230,0.35)'; g.beginPath(); g.arc(150, lerp(250, 186, i / 4) - up * 20, 6, 0, Math.PI * 2); g.fill(); }
    sBubble(g, lerp(150, 168, up), lerp(330, 286, up), Math.max(0.01, pop) * lerp(1, 0.72, up), '#f3f1ff', '#2a2f72', true);
    sCheck(g, lerp(232, 222, up), lerp(392, 330, up), 24, s.ok ?? 0);
    if (up > 0) sBubble(g, 130, 450, 0.72 * outBack(up), P.magenta, '#ffffff', false);
  } else if (s.mode === 'demo') {
    g.save(); g.translate(150, 320); const p = clamp(s.p ?? 0);
    g.lineWidth = 9; g.strokeStyle = 'rgba(169,163,230,0.45)'; g.setLineDash([14, 12]); g.beginPath(); g.arc(0, 0, 92, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.strokeStyle = P.cyan; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 92, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); g.stroke();
    if ((s.ok ?? 0) <= 0) { g.fillStyle = '#e9e5ff'; g.beginPath(); g.moveTo(-26, -36); g.lineTo(40, 0); g.lineTo(-26, 36); g.closePath(); g.fill(); }
    g.restore(); sSat(g, 150, 148, 0.9, '#e9e5ff'); sCheck(g, 150, 320, 64, s.ok ?? 0);
  }
  scrTex.needsUpdate = true;
}
function screenState(t) {
  if (t >= 22.85 && t < 26.4) return { bars: 'full', mode: 'demo', p: prog(t, E.demo, E.demoOk - 0.05, (x) => x), ok: clamp((t - E.demoOk) / 0.22) };
  if (t < E.phoneMode) return { bars: 'none', mode: 'nosig', slash: clamp((t - E.slash) / 0.2) };
  if (t < E.compose) return { bars: 'none', sat: 1, mode: 'aim', pop: clamp((t - E.phoneMode) / 0.25), dot: 1 - prog(t, E.aim, E.aimEnd) };
  if (t < 19.2) return { bars: 'none', sat: 1, mode: 'msg', pop: clamp((t - E.compose) / 0.25), p: prog(t, E.msgUp, E.msgAtSat, (x) => x), ok: clamp((t - E.msgAtSat) / 0.22) };
  if (t < 22.85) { if (t < E.relinkEnd) return { bars: 'none', sat: 1, mode: 'aim', blocked: t >= E.treeHit && t < E.slideEnd ? 1 : 0, dot: 1 - prog(t, E.slide + 0.2, E.slideEnd + 0.2) };
    return { bars: 'none', sat: 1, mode: t < E.replyIn ? 'msg' : 'reply', p: 1, ok: 1, r: clamp((t - E.replyIn) / 0.3) }; }
  return { bars: 'none', sat: 1, mode: 'reply', p: 1, ok: 1, r: 1 };
}
function phonePose(t) {
  if (t >= 19.2 && t < 22.85) { const u = prog(t, E.slide, E.slideEnd); const hop = Math.sin(Math.PI * clamp((t - E.slide) / (E.slideEnd - E.slide))) * 0.5;
    return { x: lerp(PTREE.x, P0.x, u), z: lerp(PTREE.z, P0.z, u), y: lerp(GROUND, ROCK_TOP, u) + hop, yaw: lerp(0.2, AIM_YAW, u), tilt: lerp(0, AIM_TILT, prog(t, E.slide + 0.3, E.slideEnd + 0.15)) }; }
  if (t >= 22.85 && t < 26.4) return { x: PTRAIL.x, z: PTRAIL.z, y: GROUND, yaw: -0.32, tilt: -0.1 };
  const a = prog(t, E.aim, E.aimEnd); return { x: P0.x, z: P0.z, y: ROCK_TOP, yaw: lerp(0, AIM_YAW, a), tilt: lerp(0, AIM_TILT, a) };
}
// the question tag (accepted prop) pops above the phone while the voice asks
const qTag = new THREE.Group(); { const tex = canvasTex(160, 200, (g, w, h) => { g.fillStyle = P.magenta; g.beginPath(); g.arc(80, 80, 72, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.font = '700 110px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 80, 86); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.45, 0.012), [paper('#ffd1e4'), paper('#ffd1e4'), paper('#ffd1e4'), paper('#ffd1e4'), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5 }), paper(P.magenta)]);
  m.castShadow = true; qTag.add(m); const st = card(0.015, 0.3, 0.015, P.white, P.white, 'x'); st.position.y = -0.3; qTag.add(st); }
scene.add(qTag);

// ------------------------------------------------------------------ the short text: a folded paper speech bubble that physically travels
function bubbleShape(w, h, r, tailRight) { const s = new THREE.Shape(), x0 = -w / 2, y0 = -h / 2; const tx = tailRight ? w * 0.22 : -w * 0.22;
  s.moveTo(x0 + r, y0); s.lineTo(tx - 0.05, y0); s.lineTo(tx + (tailRight ? 0.06 : -0.06), y0 - 0.12); s.lineTo(tx + 0.05, y0); s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
  s.lineTo(x0 + w, y0 + h - r); s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h); s.lineTo(x0 + r, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0); return s; }
function token(fill, ink, edge, tailRight) { const g = new THREE.Group(); const geo = new THREE.ExtrudeGeometry(bubbleShape(0.5, 0.34, 0.09, tailRight), { depth: 0.02, bevelEnabled: false }); geo.translate(0, 0, -0.01);
  const m = new THREE.Mesh(geo, [paper(fill), paper(edge)]); m.castShadow = true; g.add(m);
  const lt = canvasTex(256, 176, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = ink; c.lineWidth = 16; c.lineCap = 'round'; for (const [y, l] of [[48, 170], [88, 146], [128, 96]]) { c.beginPath(); c.moveTo(40, y); c.lineTo(40 + l, y); c.stroke(); } });
  for (const s of [1, -1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.34), new THREE.MeshStandardMaterial({ map: lt, transparent: true, alphaTest: 0.4, roughness: 0.9 })); pl.position.z = s * 0.0115; if (s < 0) pl.rotation.y = Math.PI; g.add(pl); }
  scene.add(g); return g; }
const msgTok = token('#f3f1ff', '#2a2f72', P.lav, true), replyTok = token(P.magenta, '#ffffff', '#ffd1e4', false);

// ------------------------------------------------------------------ ground station (hut + steerable paper dish)
const GS = { x: 4.9, z: -2.6 };
const station = new THREE.Group(); station.position.set(GS.x, GROUND, GS.z); scene.add(station);
{ const hut = card(1.3, 0.72, 1.0, P.lav, P.white, 'z'); hut.position.y = 0.36; station.add(hut);
  const roof = card(1.42, 0.06, 1.12, P.violet, P.edge, 'y'); roof.position.y = 0.75; station.add(roof);
  const door = card(0.3, 0.46, 0.02, P.navy2, P.lav, 'z'); door.position.set(-0.35, 0.23, 0.51); station.add(door);
  const vent = card(0.36, 0.14, 0.02, '#8d78e8', P.white, 'z'); vent.position.set(0.3, 0.5, 0.51); station.add(vent);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.36, 16), [paper(P.white), paper(P.lav), paper(P.lav)]); ped.position.set(0.15, 0.96, 0); ped.castShadow = true; station.add(ped); }
const dish = new THREE.Group(); dish.position.set(GS.x + 0.15, GROUND + 1.12, GS.z); scene.add(dish);
const DISH_FOCUS = 0.5; const feedMat = new THREE.MeshStandardMaterial({ color: P.magenta, emissive: P.magenta, emissiveIntensity: 0, roughness: 0.9 });
{ const R = 0.66, th = 0.8; const bowl = new THREE.Mesh(new THREE.SphereGeometry(R, 40, 10, 0, Math.PI * 2, 0, th), paper(P.edge, { side: THREE.DoubleSide })); bowl.rotation.x = Math.PI; bowl.position.y = R; bowl.castShadow = true; bowl.receiveShadow = true; dish.add(bowl);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R * Math.sin(th), 0.022, 6, 48), paper(P.violet2)); rim.rotation.x = Math.PI / 2; rim.position.y = R * (1 - Math.cos(th)); dish.add(rim);
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; dish.add(strut(V3(Math.cos(a) * R * Math.sin(th) * 0.95, R * (1 - Math.cos(th)), Math.sin(a) * R * Math.sin(th) * 0.95), V3(0, DISH_FOCUS, 0), 0.02, P.white)); }
  const feed = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), feedMat); feed.position.y = DISH_FOCUS; dish.add(feed);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16), paper(P.lav)); hub.position.y = 0.0; dish.add(hub); }
const Q_REST = new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), V3(0.75, 0.66, 0.1).normalize());
const dishFocusWorld = () => dish.localToWorld(V3(0, DISH_FOCUS, 0));

// ------------------------------------------------------------------ response centre (lit windows + hinged SOS placard)
const CEN = { x: 5.75, z: 3.9 };
const centre = new THREE.Group(); centre.position.set(CEN.x, GROUND, CEN.z); scene.add(centre); const winMats = [];
{ const blk = card(2.0, 1.3, 1.5, '#d9d2ff', P.white, 'z'); blk.position.y = 0.65; centre.add(blk);
  const roof = card(2.14, 0.07, 1.64, P.violet, P.edge, 'y'); roof.position.y = 1.335; centre.add(roof);
  const band = card(2.04, 0.12, 1.54, P.violet2, P.white, 'y'); band.position.y = 0.06; centre.add(band);
  const win = (x, y, z, ry) => { const m = new THREE.MeshStandardMaterial({ color: '#2a2f72', emissive: '#ffe9d2', emissiveIntensity: 0, roughness: 0.9 }); winMats.push(m); const w = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.27, 0.02), m); w.position.set(x, y, z); w.rotation.y = ry; centre.add(w); };
  for (const y of [0.45, 0.92]) for (const x of [-0.6, 0, 0.6]) win(x, y, 0.76, 0);
  for (const z of [-0.4, 0.4]) win(-1.01, 0.92, z, Math.PI / 2);
  const door = card(0.02, 0.56, 0.38, P.navy2, P.lav, 'x'); door.position.set(-1.01, 0.34, 0); centre.add(door);
  const mast = card(0.04, 0.7, 0.04, P.lav, P.white, 'x'); mast.position.set(0.72, 1.72, -0.45); centre.add(mast);
  const bc = card(0.08, 0.08, 0.08, P.cyan, P.white); bc.position.set(0.72, 2.1, -0.45); centre.add(bc); }
const placard = new THREE.Group(); placard.position.set(CEN.x - 0.25, GROUND + 1.37, CEN.z + 0.3); scene.add(placard);
{ const tex = canvasTex(512, 220, (g, w, h) => { g.fillStyle = P.magenta; rr(g, 0, 0, w, h, 44); g.fill(); g.fillStyle = '#fff'; g.font = '700 150px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SOS', w / 2, h / 2 + 10); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.4, 0.03), [paper('#ffd1e4'), paper('#ffd1e4'), paper('#ffd1e4'), paper('#ffd1e4'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), paper(P.magenta)]);
  face.position.y = 0.2; face.castShadow = true; placard.add(face); }

// ------------------------------------------------------------------ route strips (paper dashes) from the ground station to the centre door
const stripGeo = new THREE.BoxGeometry(0.16, 0.012, 0.26); const stripDim = paper('#3d4399'), stripLit = paper(P.cyan);
const ROUTE = [[GS.x - 0.15, GS.z + 0.62], [GS.x - 0.15, GS.z + 1.5], [4.3, 0.3], [4.3, 3.1], [4.62, CEN.z]];
const routeLen = []; { let L = 0; routeLen.push(0); for (let i = 1; i < ROUTE.length; i++) { L += Math.hypot(ROUTE[i][0] - ROUTE[i - 1][0], ROUTE[i][1] - ROUTE[i - 1][1]); routeLen.push(L); } }
const ROUTE_L = routeLen[routeLen.length - 1];
function routeAt(s) { for (let i = 1; i < ROUTE.length; i++) if (s <= routeLen[i] || i === ROUTE.length - 1) { const u = clamp((s - routeLen[i - 1]) / (routeLen[i] - routeLen[i - 1])); const [x0, z0] = ROUTE[i - 1], [x1, z1] = ROUTE[i]; return { x: lerp(x0, x1, u), z: lerp(z0, z1, u), a: Math.atan2(x1 - x0, z1 - z0) }; } }
const strips = []; for (let s = 0.15; s < ROUTE_L - 0.1; s += 0.36) { const p = routeAt(s); const m = new THREE.Mesh(stripGeo, stripDim); m.position.set(p.x, GROUND + 0.008, p.z); m.rotation.y = p.a; m.receiveShadow = true; scene.add(m); strips.push({ m, s }); }

// ------------------------------------------------------------------ camp + trailhead props (the person in need is implied by their things)
const tent = new THREE.Group(); tent.position.set(-4.4, GROUND, 5.6); tent.rotation.y = 0.32; scene.add(tent);
{ const L = 1.7, half = 0.75, Ht = 1.0, slope = Math.hypot(half, Ht), ang = Math.atan2(half, Ht);
  const sheet = card(1.9, 0.02, 2.0, P.navy2, P.lav); sheet.position.y = 0.01; tent.add(sheet);
  for (const s of [-1, 1]) { const pnl = card(0.03, slope, L, '#d23d7c', '#ffd1e4', 'x'); pnl.position.set(s * half / 2, Ht / 2 + 0.02, 0); pnl.rotation.z = s * ang; tent.add(pnl); }
  const tri = (a, b, c) => { const s = new THREE.Shape(); s.moveTo(...a); s.lineTo(...b); s.lineTo(...c); s.closePath(); return s; };
  const back = new THREE.Mesh(new THREE.ExtrudeGeometry(tri([-half, 0], [half, 0], [0, Ht]), { depth: 0.03, bevelEnabled: false }), [paper('#b8346c'), paper('#ffd1e4')]); back.position.set(0, 0.02, -L / 2); back.castShadow = true; tent.add(back);
  const fl = new THREE.Mesh(new THREE.ExtrudeGeometry(tri([-half, 0], [0, 0], [0, Ht]), { depth: 0.03, bevelEnabled: false }), [paper('#b8346c'), paper('#ffd1e4')]); fl.position.set(0, 0.02, L / 2 - 0.03); fl.castShadow = true; tent.add(fl);
  const doorIn = new THREE.Mesh(new THREE.ExtrudeGeometry(tri([0, 0], [half * 0.85, 0], [0, Ht * 0.85]), { depth: 0.01, bevelEnabled: false }), paper(P.navy)); doorIn.position.set(0, 0.02, L / 2 - 0.2); tent.add(doorIn);
  const fr = new THREE.Group(); fr.position.set(0, 0.02, L / 2 - 0.03); fr.rotation.y = 0.9; tent.add(fr);
  const frm = new THREE.Mesh(new THREE.ExtrudeGeometry(tri([0, 0], [half, 0], [0, Ht]), { depth: 0.03, bevelEnabled: false }), [paper('#e25a92'), paper('#ffd1e4')]); frm.castShadow = true; fr.add(frm); }
const pack = new THREE.Group(); pack.position.set(4.15, GROUND, 8.6); pack.rotation.y = 0.45; scene.add(pack);
{ const b = card(0.56, 0.66, 0.34, '#2fb8d6', '#c8f6ff', 'z'); b.position.y = 0.33; pack.add(b);
  const top = card(0.58, 0.1, 0.36, P.navy2, P.lav, 'y'); top.position.y = 0.7; pack.add(top);
  const flap = card(0.5, 0.26, 0.03, P.violet, P.lav, 'z'); flap.position.set(0, 0.56, 0.185); pack.add(flap);
  const buckle = card(0.1, 0.07, 0.02, P.magenta, '#ffd1e4', 'z'); buckle.position.set(0, 0.45, 0.205); pack.add(buckle);
  const pocket = card(0.38, 0.2, 0.06, '#27a3c0', '#c8f6ff', 'z'); pocket.position.set(0, 0.2, 0.19); pack.add(pocket);
  for (const s of [-1, 1]) { const st = card(0.06, 0.6, 0.02, P.navy2, P.lav, 'z'); st.position.set(s * 0.16, 0.38, -0.18); pack.add(st); } }
const post = new THREE.Group(); post.position.set(5.65, GROUND, 8.25); scene.add(post);
{ const st = card(0.08, 1.35, 0.08, P.lav, P.white, 'x'); st.position.y = 0.675; post.add(st); }
const arm = new THREE.Group(); arm.position.set(0, 1.12, 0.06); post.add(arm);
{ const s = new THREE.Shape(); [[0.05, -0.14], [-0.72, -0.14], [-0.72, -0.22], [-0.98, 0], [-0.72, 0.22], [-0.72, 0.14], [0.05, 0.14]].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath();
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }), [paper('#efecff'), paper(P.lav)]); m.castShadow = true; arm.add(m);
  const pic = canvasTex(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 4; i++) { const bh = 22 + i * 18; rr(g, 60 + i * 30, 104 - bh, 18, bh, 4); g.fillStyle = '#2a2f72'; g.fill(); } g.strokeStyle = P.magenta; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(52, 112); g.lineTo(190, 18); g.stroke(); });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshStandardMaterial({ map: pic, transparent: true, alphaTest: 0.4, roughness: 0.9 })); pl.position.set(-0.4, 0, 0.032); arm.add(pl); }

// ------------------------------------------------------------------ dynamic link threads (rebuilt per frame)
const thrC = new THREE.MeshBasicMaterial({ color: P.cyan }), thrDim = new THREE.MeshBasicMaterial({ color: '#6f86e6' }), thrM = new THREE.MeshBasicMaterial({ color: P.magenta });
let dyn = []; const addDyn = (m) => { scene.add(m); dyn.push(m); return m; };
function clearDyn() { for (const m of dyn) { scene.remove(m); m.geometry.dispose(); } dyn = []; }
function thread(a, b, p, mat, r = 0.024) { if (p <= 0.002) return; const e = a.clone().lerp(b, Math.min(1, p)); addDyn(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, e), 1, r, 6, false), mat)); }
const pulseBall = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), new THREE.MeshBasicMaterial({ color: '#ffffff' })); scene.add(pulseBall);
const ripples = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 72), new THREE.MeshBasicMaterial({ color: P.cyan, transparent: true, opacity: 0 })); m.rotation.x = Math.PI / 2; scene.add(m); ripples.push(m); }
const towerRings = []; for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 6, 40, Math.PI * 0.7), new THREE.MeshBasicMaterial({ color: P.cyan, transparent: true, opacity: 0 })); scene.add(m); towerRings.push(m); }
const burst = new THREE.Group(); for (let i = 0; i < 7; i++) { const m = card(0.03, 0.22, 0.03, P.magenta, '#ffd1e4', 'x'); m.position.y = 0.2; const g = new THREE.Group(); g.add(m); g.rotation.z = (i / 7) * Math.PI * 2; burst.add(g); } scene.add(burst);

// ------------------------------------------------------------------ the Media Diet paper sign (signature, CTA shot — accepted prop)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(1.9, 0.0, 13.5);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const dist = (a, b) => V3(...a).distanceTo(V3(...b));
const SHOTS = {
  S1: (t) => { const u = prog(t, 0, 2.8), c = prog(t, E.tilt, E.tiltEnd); const pos = L3([0.3, 0.85, 7.9], [0.1, 0.95, 7.5], u); return SH(pos, L3([-2.6, 1.7, -3.8], [-2.3, 3.4, -3.6], c), 50, pos.distanceTo(V3(P0.x, 0.8, P0.z))); },
  S2: (t) => { const u = prog(t, 4.8, 8.8); const pos = L3([-0.9, 0.55, 7.9], [-0.8, 0.62, 7.6], u); return SH(pos, V3(-0.6, 4.4, -3.0), 62, pos.distanceTo(V3(P0.x, 0.8, P0.z))); },
  S3: (t) => { const u = prog(t, E.msgUp - 0.2, E.msgAtSat + 0.2), w = prog(t, 8.8, 11.6); const pos = L3([-0.7, 1.05, 5.6], [-0.6, 1.4, 6.6], w);
    const look = V3(P0.x, 0.85, P0.z).lerp(V3(0.5, 6.8, -4.2), u); return SH(pos, look, 46, pos.distanceTo(V3(P0.x, 0.85, P0.z).lerp(satPos(t), u))); },
  S4: (t) => { const u = prog(t, E.msgDown - 0.2, E.msgAtDish + 0.1), w = prog(t, 11.6, 13.9); const pos = L3([7.4, 1.2, 2.2], [7.2, 1.3, 2.0], w);
    const look = V3(1.6, 6.8, -4.6).lerp(V3(4.7, 1.6, -2.9), u); return SH(pos, look, 48, pos.distanceTo(satPos(t).lerp(V3(GS.x, 1.2, GS.z), u))); },
  S5: (t) => { const u = prog(t, 13.9, 16.1); const pos = L3([10.8, 6.4, 9.0], [10.4, 6.2, 8.6], u); return SH(pos, V3(4.9, 0.5, 1.0), 44); },
  S6: (t) => { const u = prog(t, 16.1, 19.15); const pos = L3([-3.4, 11.0, -1.2], [1.0, 2.6, 13.6], u); return SH(pos, L3([-5.4, 0.3, -6.0], [-0.2, 4.2, -2.6], u), lerp(48, 56, u), lerp(11.5, 11.0, u)); },
  S7: (t) => { const u = prog(t, 19.2, 22.85); const pos = L3([-2.05, 1.5, 9.6], [-2.05, 1.6, 9.2], u); return SH(pos, V3(-2.05, 1.85, 2.6), 46, pos.distanceTo(V3(-2.0, 0.8, 3.1))); },
  S8: (t) => { const u = prog(t, 22.85, 26.4); const pos = L3([6.45, 1.2, 12.3], [6.3, 1.15, 12.0], u); return SH(pos, V3(4.7, 0.85, 8.6), 46, pos.distanceTo(V3(PTRAIL.x, 0.5, PTRAIL.z))); },
  S9: (t) => { const u = prog(t, 26.4, 29.6); const pos = L3([2.0, 1.6, 19.5], [2.2, 2.1, 22.0], u); return SH(pos, L3([2.0, 3.0, 2.0], [2.0, 3.2, 2.0], u), 56, pos.distanceTo(V3(1.9, 0.4, 13.5)) + 1.2); },
};

// ------------------------------------------------------------------ overlay (captions + the one small timing readout — accepted treatment)
const ov = document.getElementById('ov'); const og = ov.getContext('2d'); let TEXTLOG = [];
function otext(str, x, y, o = {}) {
  og.save(); og.font = o.font || '700 50px "Space Grotesk"'; og.textAlign = o.align || 'center'; og.fillStyle = o.color || '#f6f4ff';
  og.globalAlpha = o.alpha ?? 1; og.shadowColor = 'rgba(2,3,20,0.95)'; og.shadowBlur = o.shadow ?? 14; og.fillText(str, x, y);
  const m = og.measureText(str); const x0 = x - m.actualBoundingBoxLeft, x1 = x + m.actualBoundingBoxRight;
  if ((o.alpha ?? 1) > 0.05) TEXTLOG.push({ kind: o.kind || 'label', text: str, x0: Math.round(x0), y0: Math.round(y - m.actualBoundingBoxAscent), x1: Math.round(x1), y1: Math.round(y + m.actualBoundingBoxDescent) });
  og.restore();
}
function captions(t) {
  const c = CUES.find((q) => t >= q.in && t < q.out); if (!c) return; const a = clamp((t - c.in) / 0.1);
  const gr = og.createLinearGradient(0, 300, 0, 560); gr.addColorStop(0, 'rgba(4,6,30,0)'); gr.addColorStop(0.3, 'rgba(4,6,30,0.5)'); gr.addColorStop(0.75, 'rgba(4,6,30,0.5)'); gr.addColorStop(1, 'rgba(4,6,30,0)');
  og.save(); og.globalAlpha = a; og.fillStyle = gr; og.fillRect(0, 300, W, 260); og.restore();
  if (c.lines.length === 1) otext(c.lines[0], 540, 448, { alpha: a, kind: 'caption' });
  else { otext(c.lines[0], 540, 414, { alpha: a, kind: 'caption' }); otext(c.lines[1], 540, 478, { alpha: a, kind: 'caption' }); }
}
const project = (v) => { const p = v.clone().project(camera); return [(p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H]; };

// ------------------------------------------------------------------ per-frame update
const Y = V3(0, 1, 0), Zax = V3(0, 0, 1);
let PTOP = V3();
function placeToken(tok, p, s, t) { tok.visible = s > 0.01; if (!tok.visible) return; tok.position.copy(p); tok.quaternion.copy(camera.quaternion); tok.rotateZ(0.08 * Math.sin(t * 5.3)); tok.rotateY(0.25 * Math.sin(t * 3.1)); tok.scale.setScalar(s); }
function update(t) {
  clearDyn();
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;

  // satellite glides in along its arc, then keeps drifting slowly (it is moving, not parked)
  const sp = satPos(t); sat.position.copy(sp); sat.rotation.set(0.15, -0.35, -satAngle(t)); sat.visible = t >= E.satIn - 0.05;
  const satBelly = sp.clone().add(V3(0, -0.45, 0));

  // phone pose + printed screen
  const pp = phonePose(t); phone.position.set(pp.x, pp.y, pp.z); phone.rotation.y = pp.yaw; phoneTilt.rotation.x = pp.tilt; phone.updateMatrixWorld(true);
  PTOP = phoneTilt.localToWorld(V3(0, PH.h + 0.04, 0)); const pScreen = phoneTilt.localToWorld(V3(0, PH.h * 0.55, 0.12));
  drawScreen(screenState(t));

  // S1: the tower's signal rings head for the phone but die at the ridge
  { const D = V3(P0.x, 0.9, P0.z).sub(TOWER_TOP).normalize(); const q1 = new THREE.Quaternion().setFromUnitVectors(Zax, D), q2 = new THREE.Quaternion().setFromAxisAngle(Zax, Math.PI / 2 - Math.PI * 0.35);
    towerRings.forEach((r, i) => { const ph = (((t - E.rings) * 0.55 + i * 0.25) % 1 + 1) % 1; const on = id === 'S1' && t >= E.rings;
      r.position.copy(TOWER_TOP).addScaledVector(D, ph * 3.4); r.quaternion.copy(q1).multiply(q2); r.scale.setScalar(0.6 + ph * 1.3);
      r.material.opacity = on ? 0.85 * Math.pow(1 - ph, 0.6) * (ph > 0.8 ? (1 - ph) / 0.2 : 1) : 0; }); }
  { const a = prog(t, E.query, E.query + 0.3, outBack) * (1 - prog(t, E.queryOff, E.queryOff + 0.25)); qTag.visible = id === 'S1' && a > 0.01; qTag.position.set(P0.x + 0.42, ROCK_TOP + PH.h + 0.62, P0.z + 0.1); qTag.scale.setScalar(Math.max(0.01, a) * 1.3); qTag.rotation.y = -0.2; }

  // uplink: the bubble leaves the screen and climbs the thread to the satellite
  const linkMat = (id === 'S6' && t >= E.far) || id === 'S9' ? thrC : thrDim;
  const normalPhone = !(t >= 19.2 && t < 26.4);
  if (normalPhone && t >= E.msgUp - 0.15) thread(PTOP, satBelly, t < E.msgAtSat ? prog(t, E.msgUp - 0.15, E.msgAtSat, (x) => x) : 1, t < E.msgAtSat + 0.4 ? thrC : linkMat);
  { const u = prog(t, E.msgUp, E.msgAtSat); const s = outBack(clamp((t - E.msgUp + 0.1) / 0.3)) * (1 - prog(t, E.msgAtSat - 0.12, E.msgAtSat + 0.12)) * lerp(0.9, 1.5, u);
    const p = u < 0.12 ? pScreen.clone().lerp(PTOP.clone().add(V3(0.1, 0.25, 0.05)), u / 0.12) : PTOP.clone().add(V3(0.1, 0.25, 0.05)).lerp(satBelly, (u - 0.12) / 0.88);
    placeToken(msgTok, p, t >= E.msgUp - 0.1 && t < E.msgAtSat + 0.15 ? s : 0, t); }
  // ground station: dish turns to the satellite; the text comes down to it
  const qAim = new THREE.Quaternion().setFromUnitVectors(Y, sp.clone().sub(dish.position).normalize());
  dish.quaternion.copy(Q_REST).slerp(qAim, prog(t, E.dishTurn, E.dishTurnEnd)); dish.updateMatrixWorld(true);
  const focusW = dishFocusWorld(); feedMat.emissiveIntensity = 0.9 * clamp(1 - Math.abs(t - E.msgAtDish - 0.1) / 0.35);
  if (t >= E.msgDown - 0.1 && !(t >= 19.2 && t < 26.4)) thread(satBelly, focusW, t < E.msgAtDish ? prog(t, E.msgDown - 0.1, E.msgAtDish, (x) => x) : 1, t < E.msgAtDish + 0.4 ? thrC : linkMat);
  { const u = prog(t, E.msgDown, E.msgAtDish); const s = outBack(clamp((t - E.msgDown + 0.15) / 0.3)) * (1 - prog(t, E.msgAtDish - 0.1, E.msgAtDish + 0.12)) * lerp(1.5, 1.0, u);
    if (t >= E.msgDown - 0.15 && t < E.msgAtDish + 0.15) placeToken(msgTok, satBelly.clone().lerp(focusW.clone().add(V3(0, 0.2, 0)), u), s, t); }
  // route to the response centre
  const rs = prog(t, E.route, E.routeEnd, (x) => x) * ROUTE_L; const routeOn = t >= E.route && !(t >= 19.2 && t < 26.4);
  strips.forEach(({ m, s }) => { m.material = routeOn && s <= rs + 0.05 ? stripLit : stripDim; });
  if (t >= E.route - 0.1 && t < E.centreLit + 0.1) { const r = routeAt(Math.min(rs, ROUTE_L)); const s = outBack(clamp((t - E.route + 0.1) / 0.25)) * (1 - prog(t, E.routeEnd - 0.05, E.centreLit + 0.05));
    placeToken(msgTok, V3(r.x, GROUND + 0.34 + 0.04 * Math.sin(t * 9), r.z), s * 1.15, t); }
  winMats.forEach((m, i) => { m.emissiveIntensity = (t >= 19.2 && t < 26.4) ? 0 : 1.35 * prog(t, E.centreLit + i * 0.06, E.centreLit + i * 0.06 + 0.25); });
  { const su = prog(t, E.placard, E.placard + 0.45, outBack); placard.rotation.x = -Math.PI / 2 * (1 - clamp(su, 0, 1.2)); }

  // S6: the tower serves a small circle of nearby homes; the satellite link is a long climb
  ripples.forEach((r, i) => { const ph = (((t - E.ring) * 0.6 + i / 3) % 1 + 1) % 1; const on = id === 'S6';
    r.position.set(TOWER.x, GROUND + 0.03, TOWER.z); r.scale.setScalar(0.3 + ph * 2.3); r.material.opacity = on ? (1 - ph) * 0.75 * prog(t, E.ring, E.ring + 0.3) : 0; });
  if (id === 'S6') { const pr = prog(t, E.ring, E.ringEnd); if (pr > 0.002) { const ring = addDyn(new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.04, 6, 96, Math.PI * 2 * pr), thrC)); ring.rotation.x = Math.PI / 2; ring.position.set(TOWER.x, GROUND + 0.035, TOWER.z); }
    HOUSES.forEach((h, i) => thread(TOWER_TOP, V3(h.x, GROUND + 0.62, h.z), prog(t, E.ring + 0.25 + i * 0.12, E.ring + 0.75 + i * 0.12), thrC, 0.02)); }
  pulseBall.visible = id === 'S6' && t >= E.far && t < E.farEnd; if (pulseBall.visible) pulseBall.position.copy(PTOP).lerp(satBelly, prog(t, E.far, E.farEnd));

  // S7: under the canopy the link fails; moved to open sky it connects; the reply comes back slowly
  burst.visible = false;
  if (id === 'S7') {
    const d = satBelly.clone().sub(PTOP).normalize();
    if (t < E.slide) { const sHit = (1.6 - PTOP.y) / d.y; const B = PTOP.clone().addScaledVector(d, sHit); const p = prog(t, E.tree, E.treeHit, (x) => x);
      const fade = 1 - prog(t, E.treeHit + 0.15, E.treeHit + 0.4); if (fade > 0.01) thread(PTOP, B, p, t < E.treeHit ? thrC : thrM, 0.024 * Math.max(0.3, fade));
      const b = clamp((t - E.treeHit) / 0.3); burst.visible = t >= E.treeHit && b < 1; burst.position.copy(B); burst.quaternion.copy(camera.quaternion); burst.scale.setScalar(0.6 + b * 0.9); }
    if (t >= E.relink) thread(PTOP, satBelly, prog(t, E.relink, E.relinkEnd, (x) => x), thrC);
    const u = prog(t, E.reply, E.replyIn, (x) => x * x * (3 - 2 * x)); const s = outBack(clamp((t - E.reply + 0.1) / 0.3)) * (1 - prog(t, E.replyIn - 0.08, E.replyIn + 0.12));
    placeToken(replyTok, satBelly.clone().lerp(PTOP.clone().add(V3(0.05, 0.28, 0.08)), u), t >= E.reply - 0.1 && t < E.replyIn + 0.15 ? s * 1.15 : 0, t);
  } else if (!(t >= E.reply - 0.1 && t < E.replyIn + 0.15)) replyTok.visible = false;
  if (!(t >= E.msgUp - 0.1 && t < E.msgAtSat + 0.15) && !(t >= E.msgDown - 0.15 && t < E.msgAtDish + 0.15) && !(t >= E.route - 0.1 && t < E.centreLit + 0.1)) msgTok.visible = false;

  // S8: trailhead — the off-grid signpost swings up
  { const a = prog(t, E.post, E.post + 0.5, outBack); arm.rotation.z = (Math.PI / 2) * (1 - clamp(a, 0, 1.15)); }
  // sign hinges up for the CTA
  const su = prog(t, E.sign, E.sign + 0.45, outBack); sign.visible = t >= E.sign - 0.1; sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(su, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}

function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = [];
  { const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H); }   // miniature vignette
  // the one timing readout: a small stopwatch at the phone while the reply is on its way (no numbers: times vary)
  if (t >= E.reply && t < E.replyIn + 0.6) {
    const [x0, y0] = project(PTOP); const x = clamp(x0 + 170, 200, 880), y = clamp(y0 - 40, 700, 1500); const a = clamp((t - E.reply) / 0.15) * (1 - clamp((t - E.replyIn - 0.4) / 0.2));
    const u = clamp((t - E.reply) / (E.replyIn - E.reply)); og.save(); og.globalAlpha = a; og.translate(x, y);
    og.fillStyle = 'rgba(236,232,255,0.96)'; og.beginPath(); og.arc(0, 0, 54, 0, Math.PI * 2); og.fill(); og.strokeStyle = '#14163a'; og.lineWidth = 6; og.stroke();
    og.fillStyle = '#14163a'; og.fillRect(-10, -72, 20, 14); og.strokeStyle = '#fe4092'; og.lineWidth = 7; og.lineCap = 'round';
    const sweep = u * Math.PI * 1.85; og.beginPath(); og.arc(0, 0, 36, -Math.PI / 2, -Math.PI / 2 + Math.max(0.01, sweep)); og.stroke(); og.strokeStyle = '#14163a'; og.lineWidth = 5; og.beginPath(); og.moveTo(0, 0);
    og.lineTo(Math.cos(-Math.PI / 2 + sweep) * 36, Math.sin(-Math.PI / 2 + sweep) * 36); og.stroke(); og.restore();
  }
  captions(t);
}

window.render = (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
