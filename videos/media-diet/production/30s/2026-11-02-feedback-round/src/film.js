// Media Diet · 30 s feedback-round episode — "How a warehouse robot finds its way when GPS cannot help inside"
// Style recipe: LAYERED TECH CUTAWAY (context/11): a handcrafted, dimensional paper miniature in Media Diet brand colours —
// laminated card walls/shelves with visible stacked edges, paper grain, real cast shadows, hinged/jointed props, distinct
// camera set-ups per beat, restrained depth of field. three.js is only the renderer; the style is the paper craft.
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

// ------------------------------------------------------------------ warehouse (floor plan in x/z; scan plane y = 0.375)
const WH = { x0: -3.1, x1: 3.1, z0: -4.6, z1: 4.6, h: 1.4 };
const RACKS = [{ x0: -2.25, x1: -0.95, z0: -3.5, z1: -0.7 }, { x0: 0.95, x1: 2.25, z0: -3.5, z1: -0.7 }, { x0: -2.25, x1: -0.95, z0: 0.75, z1: 3.05 }, { x0: 0.95, x1: 2.25, z0: 0.75, z1: 3.05 }];
const warehouse = new THREE.Group(); scene.add(warehouse);
[[6.4, 0.05, 9.4, P.deep, 0.025], [6.2, 0.05, 9.2, '#1b2170', 0.07]].forEach(([w, h, d, c, y]) => { const m = card(w, h, d, c, P.lav); m.position.set(0, y, 0); warehouse.add(m); });
const FLOOR_Y = 0.095;
function wall(x, z, len, alongX) { // laminated wall: violet outer + lavender inner, visible two-tone top edge
  const g = new THREE.Group();
  const outer = card(alongX ? len : 0.08, WH.h, alongX ? 0.08 : len, P.violet, P.edge, alongX ? 'z' : 'x');
  const inner = card(alongX ? len - 0.16 : 0.06, WH.h - 0.1, alongX ? 0.06 : len - 0.16, '#8d78e8', '#f6f3ff', alongX ? 'z' : 'x');
  outer.position.y = WH.h / 2; inner.position.y = (WH.h - 0.06) / 2;
  const s = Math.sign(alongX ? -z : -x); if (alongX) inner.position.z = s * 0.07; else inner.position.x = s * 0.07;
  g.add(outer, inner); g.position.set(x, FLOOR_Y, z); warehouse.add(g); return g;
}
wall(0, WH.z0, 6.25, true); wall(WH.x0, 0, 9.25, false); wall(WH.x1, 0, 9.25, false);
const front = new THREE.Group(); warehouse.add(front);      // front wall with a doorway, two pieces + lintel
[[-1.95, 2.3], [1.95, 2.3]].forEach(([x, len]) => { const o = card(len, WH.h, 0.08, P.violet, P.edge, 'z'); o.position.set(x, FLOOR_Y + WH.h / 2, WH.z1); front.add(o); const i = card(len - 0.1, WH.h - 0.1, 0.06, '#8d78e8', '#f6f3ff', 'z'); i.position.set(x, FLOOR_Y + (WH.h - 0.1) / 2, WH.z1 - 0.07); front.add(i); });
{ const l = card(1.6, 0.45, 0.08, P.violet, P.edge, 'z'); l.position.set(0, FLOOR_Y + WH.h - 0.225, WH.z1); front.add(l); }
const frontStub = new THREE.Group(); warehouse.add(frontStub);   // cut section of the front wall (pink cut edge), shown only in the cutaway shot
[[-1.95, 2.3], [1.95, 2.3]].forEach(([x, len]) => { const o = card(len, 0.56, 0.14, P.violet, '#ffb3d3', 'z'); o.position.set(x, FLOOR_Y + 0.28, WH.z1 - 0.03); frontStub.add(o); });
// racks: skirt (scan target) + uprights + boards + paper boxes
const rackGroup = new THREE.Group(); warehouse.add(rackGroup);
let seed = 11; const rnd = () => ((seed = (seed * 48271) % 2147483647) / 2147483647);
for (const r of RACKS) {
  const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, w = r.x1 - r.x0, d = r.z1 - r.z0;
  const skirtH = 0.48;
  [[w, d / 2, true, r.z1], [w, -d / 2, true, r.z0]].forEach(([len, off, ax, z]) => { const s = card(len, skirtH, 0.04, P.lav, P.white, 'z'); s.position.set(cx, FLOOR_Y + skirtH / 2, z); rackGroup.add(s); });
  [[r.x0], [r.x1]].forEach(([x]) => { const s = card(0.04, skirtH, d, P.lav, P.white, 'x'); s.position.set(x, FLOOR_Y + skirtH / 2, cz); rackGroup.add(s); });
  for (const hy of [0.5, 0.82, 1.14]) { const b = card(w + 0.04, 0.035, d + 0.04, '#b9a6ff', P.white, 'y'); b.position.set(cx, FLOOR_Y + hy, cz); rackGroup.add(b); }
  for (const [ux, uz] of [[r.x0, r.z0], [r.x1, r.z0], [r.x0, r.z1], [r.x1, r.z1]]) { const u = card(0.05, 1.18, 0.05, P.violet2, P.white, 'x'); u.position.set(ux, FLOOR_Y + 0.59, uz); rackGroup.add(u); }
  for (const hy of [0.5, 0.82, 1.14]) for (let k = 0; k < 3; k++) {
    const bw = 0.5 + rnd() * 0.5, bh = 0.18 + rnd() * 0.08, bd = 0.6 + rnd() * 0.25; const cols = ['#5fd3ea', '#9d8cf0', '#2f357f', '#d9d2ff'];
    const bx = card(Math.min(bw, w - 0.12), bh, bd, cols[Math.floor(rnd() * 4)], P.white, 'y'); bx.position.set(cx + (rnd() - 0.5) * 0.12, FLOOR_Y + hy + 0.02 + bh / 2, r.z0 + 0.45 + k * (d - 0.9) / 2); rackGroup.add(bx);
  }
}
// destination flag (paper pennant on a stick)
const flag = new THREE.Group(); { const st = card(0.03, 0.7, 0.03, P.white, P.white, 'x'); st.position.y = 0.35; const pen = card(0.32, 0.2, 0.01, P.magenta, '#ffd1e4', 'z'); pen.position.set(0.17, 0.58, 0); flag.add(st, pen); }
flag.position.set(0, FLOOR_Y, -4.0); warehouse.add(flag);
// roof: layered card slab hinged at the back wall
const roofPivot = new THREE.Group(); roofPivot.position.set(0, FLOOR_Y + WH.h + 0.02, WH.z0 - 0.05); warehouse.add(roofPivot);
{ const r1 = card(6.6, 0.05, 9.5, '#3b2a99', P.edge, 'y', '#cfc8ff'); r1.position.set(0, 0.03, 4.75); const r2 = card(6.3, 0.04, 9.2, P.violet, P.edge, 'y'); r2.position.set(0, 0.075, 4.75);
  for (let i = 0; i < 5; i++) { const rib = card(6.3, 0.05, 0.12, '#6c4fe0', P.edge, 'y'); rib.position.set(0, 0.12, 1.0 + i * 1.9); roofPivot.add(rib); }
  roofPivot.add(r1, r2); }

// ------------------------------------------------------------------ satellite (paper cutout on a wire) + GPS signal rings
const sat = new THREE.Group(); scene.add(sat); sat.position.set(1.9, 3.7, -2.0);
{ const body = card(0.7, 0.45, 0.45, P.lav, P.white, 'y'); sat.add(body);
  const panTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#1d2470'; g.fillRect(0, 0, w, h); g.strokeStyle = P.cyan; g.lineWidth = 3; for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.55), [paper(P.edge), paper(P.edge), new THREE.MeshStandardMaterial({ map: panTex, roughness: 0.9 }), paper('#1d2470'), paper(P.edge), paper(P.edge)]); p.position.x = s * 1.02; p.castShadow = true; sat.add(p); }
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 6, 6), new THREE.MeshStandardMaterial({ color: '#2a2f72' })); wire.position.y = 3.2; sat.add(wire); }
const sigRings = []; for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.6 + i * 0.55, 0.035, 6, 48, Math.PI * 0.75), new THREE.MeshBasicMaterial({ color: P.cyan, transparent: true, opacity: 0 })); m.rotation.set(Math.PI / 2, 0, Math.PI * 0.62); scene.add(m); sigRings.push(m); }

// ------------------------------------------------------------------ robot (original, functional; folded-card body + lidar turret)
const robot = new THREE.Group(); scene.add(robot);
const LIDAR_Y = 0.375;
{ const body = card(0.55, 0.2, 0.72, '#e6f6ff', P.white, 'y'); body.position.y = FLOOR_Y + 0.17; robot.add(body);
  const stripe = card(0.56, 0.05, 0.73, P.navy2, P.white, 'y'); stripe.position.y = FLOOR_Y + 0.11; robot.add(stripe);
  const bumper = card(0.5, 0.06, 0.04, P.magenta, '#ffd1e4', 'z'); bumper.position.set(0, FLOOR_Y + 0.13, -0.37); robot.add(bumper);
  for (const [x, z] of [[-0.28, -0.24], [0.28, -0.24], [-0.28, 0.24], [0.28, 0.24]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 20), [paper(P.navy), paper(P.lav), paper(P.lav)]); w.rotation.z = Math.PI / 2; w.position.set(x, FLOOR_Y + 0.07, z); w.castShadow = true; robot.add(w); }
  const tur = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.1, 28), [paper(P.navy2), paper(P.lav), paper(P.navy2)]); tur.position.y = LIDAR_Y - 0.005; tur.castShadow = true; robot.add(tur);
  const win = new THREE.Mesh(new THREE.CylinderGeometry(0.104, 0.104, 0.025, 28, 1, true), new THREE.MeshBasicMaterial({ color: P.cyan })); win.position.y = LIDAR_Y; robot.add(win);
  const topTex = canvasTex(256, 336, (g, w, h) => { g.fillStyle = '#e6f6ff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8fa2d8'; g.lineWidth = 5; g.strokeRect(14, 14, w - 28, h - 28);
    g.strokeRect(40, h - 110, w - 80, 70); for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(58 + i * 32, h - 98); g.lineTo(58 + i * 32, h - 52); g.stroke(); } g.fillStyle = P.magenta; g.fillRect(w / 2 - 50, 30, 100, 16); });
  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.66), [paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: topTex, roughness: 0.9 }), paper(P.white), paper(P.white), paper(P.white)]);
  lid.position.y = FLOOR_Y + 0.276; lid.castShadow = true; robot.add(lid); }
const qTag = new THREE.Group(); { const tex = canvasTex(160, 200, (g, w, h) => { g.fillStyle = P.magenta; g.beginPath(); g.arc(80, 80, 72, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.font = '700 110px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 80, 86); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.45, 0.012), [paper('#ffd1e4'), paper('#ffd1e4'), paper('#ffd1e4'), paper('#ffd1e4'), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5 }), paper(P.magenta)]);
  m.position.y = 0.0; m.castShadow = true; qTag.add(m); const st = card(0.015, 0.3, 0.015, P.white, P.white, 'x'); st.position.y = -0.3; qTag.add(st); }
scene.add(qTag);
// robot route (x, z) keyframes; heading derived from motion
const ROUTE_A = [[6.0, 0, 3.6], [14.4, 0, 3.6], [15.2, 0, 2.4], [18.3, 0, 2.4], [19.6, 0, 1.65]];
const REROUTE = [[23.6, 0, 1.65], [24.1, 0.6, 0.9], [24.6, 0.62, 0.05], [24.95, 0.62, -0.55], [25.45, 0.0, -1.1], [26.2, 0.0, -3.45]];
function robotPose(t) {
  const keys = t < 23.6 ? ROUTE_A : REROUTE;
  let p = [keys[0][1], keys[0][2]];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, x0, z0] = keys[i], [t1, x1, z1] = keys[i + 1]; if (t >= t0 && t <= t1) { const u = ease(clamp((t - t0) / (t1 - t0))); p = [lerp(x0, x1, u), lerp(z0, z1, u)]; break; } if (t > t1) p = [x1, z1]; }
  const q = (() => { const tt = t + 0.05; const ks = tt < 23.6 ? ROUTE_A : REROUTE; let r = [ks[0][1], ks[0][2]]; for (let i = 0; i < ks.length - 1; i++) { const [t0, x0, z0] = ks[i], [t1, x1, z1] = ks[i + 1]; if (tt >= t0 && tt <= t1) { const u = ease(clamp((tt - t0) / (t1 - t0))); r = [lerp(x0, x1, u), lerp(z0, z1, u)]; break; } if (tt > t1) r = [x1, z1]; } return r; })();
  const dx = q[0] - p[0], dz = q[1] - p[1]; const heading = Math.hypot(dx, dz) > 1e-4 ? Math.atan2(-dx, -dz) : (p[0] > 0.3 ? 0 : 0);
  return { x: p[0], z: p[1], heading };
}

// ------------------------------------------------------------------ crate (folded box with flaps + tape)
const crate = new THREE.Group(); scene.add(crate);
{ const b = card(0.62, 0.5, 0.62, '#d23d7c', '#ffd1e4', 'y'); b.position.y = 0.25; crate.add(b);
  const tape = card(0.64, 0.02, 0.14, '#ffd1e4', P.white, 'y'); tape.position.y = 0.51; crate.add(tape);
  const lab = canvasTex(256, 200, (g, w, h) => { g.fillStyle = '#f7e4ee'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a1f4f'; g.lineWidth = 10; g.beginPath(); for (const x of [70, 180]) { g.moveTo(x, 150); g.lineTo(x, 60); g.moveTo(x - 30, 90); g.lineTo(x, 55); g.lineTo(x + 30, 90); } g.stroke(); });
  for (const s of [1, -1]) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.26), new THREE.MeshStandardMaterial({ map: lab, roughness: 0.9 })); l.position.set(0, 0.26, s * 0.312); if (s < 0) l.rotation.y = Math.PI; crate.add(l); }
  for (const s of [-1, 1]) { const f = card(0.62, 0.015, 0.3, '#b8346c', '#ffd1e4', 'y'); f.position.set(0, 0.505, s * 0.16); f.rotation.x = s * 0.18; crate.add(f); } }
const CRATE_AT = [0.0, 0.15];
function crateXform(t) { if (t < E.crate) return null; const u = prog(t, E.crate, E.crateEnd, outC); const x = lerp(-1.9, CRATE_AT[0], u); const tilt = (1 - u) * 0.35 + Math.sin(u * Math.PI) * 0.08; return { x, z: CRATE_AT[1], tilt, y: Math.sin(clamp((t - E.crateEnd) / 0.25) * Math.PI) * 0.03 }; }

// ------------------------------------------------------------------ lidar geometry: analytic 2-D ray casting against the floor plan
function rects(t) { const R = [...RACKS]; const c = crateXform(t); if (c && t >= E.crateEnd - 0.05) R.push({ x0: c.x - 0.31, x1: c.x + 0.31, z0: c.z - 0.31, z1: c.z + 0.31, crate: true }); return R; }
function castRay(ox, oz, ang, R) {
  const dx = -Math.sin(ang), dz = -Math.cos(ang); let best = Infinity, hitCrate = false;
  const walls = [[WH.x0 + 0.07, null], [WH.x1 - 0.07, null], [null, WH.z0 + 0.07], [null, WH.z1 - 0.07]];
  for (const [wx, wz] of walls) { if (wx !== null && Math.abs(dx) > 1e-6) { const s = (wx - ox) / dx; if (s > 0 && s < best) best = s; } if (wz !== null && Math.abs(dz) > 1e-6) { const s = (wz - oz) / dz; const hx = ox + dx * s; const door = wz > 0 && Math.abs(hx) < 0.8; if (s > 0 && s < best && !door) best = s; } }
  for (const r of R) { // slab test
    let tmin = -Infinity, tmax = Infinity;
    for (const [o, d, a, b] of [[ox, dx, r.x0, r.x1], [oz, dz, r.z0, r.z1]]) { if (Math.abs(d) < 1e-9) { if (o < a || o > b) { tmin = Infinity; } } else { let t1 = (a - o) / d, t2 = (b - o) / d; if (t1 > t2) [t1, t2] = [t2, t1]; tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); } }
    if (tmax >= tmin && tmin > 0 && tmin < best) { best = tmin; hitCrate = !!r.crate; }
  }
  const sb = Math.max(0, best - 0.07);    // marker sits just in front of the surface it measured
  return { x: ox + dx * sb, z: oz + dz * sb, d: best, crate: hitCrate };
}
const NRAYS = 240;
function scan(ox, oz, t) { const R = rects(t); const out = []; for (let i = 0; i < NRAYS; i++) { const a = (i / NRAYS) * Math.PI * 2; const h = castRay(ox, oz, a, R); if (Number.isFinite(h.d) && h.d < 12) out.push({ a, ...h }); } return out; }

// scan visual objects (rebuilt per frame where needed)
const dotGeo = new THREE.SphereGeometry(0.045, 10, 8);
const dotMatC = new THREE.MeshBasicMaterial({ color: P.cyan }), dotMatM = new THREE.MeshBasicMaterial({ color: P.magenta });
const dots = new THREE.InstancedMesh(dotGeo, dotMatC, 2400); dots.count = 0; scene.add(dots);
const dotsM = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 12, 10), dotMatM, 400); dotsM.count = 0; scene.add(dotsM);
const fanMat = new THREE.MeshBasicMaterial({ color: P.cyan, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
let fan = null; const lineMat = new THREE.LineBasicMaterial({ color: P.cyan, transparent: true, opacity: 0.9 });
let outline = null; let pulse = null;
const ribGeo = new THREE.BoxGeometry(0.075, 0.035, 1); const ribMat = new THREE.MeshBasicMaterial({ color: P.cyan });
const pulseBall = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), new THREE.MeshBasicMaterial({ color: '#ffffff' })); scene.add(pulseBall);
const SCANS = {   // the scans that actually happen (pose fixed at the moment of each sweep)
  s1: { t0: E.sweep, t1: E.sweepEnd, pose: [0, 3.6] },
  s2: { t0: E.sweep2, t1: E.sweep2End, pose: [0, 2.4] },
  s3: { t0: E.sweep3, t1: E.sweep3End, pose: [0, 1.65] },
};
const scanCache = {}; function scanOf(k, t) { if (!scanCache[k]) { const s = SCANS[k]; scanCache[k] = scan(s.pose[0], s.pose[1], k === 's3' ? E.crateEnd + 0.1 : 0); } return scanCache[k]; }

// ------------------------------------------------------------------ the measured floor-map sheet (4 panels, folds open)
const SHEET = { cx: 0, cz: 8.3, w: 3.4, d: 5.04, y: 0.012 };       // on the table in front of the warehouse
const mapTex = canvasTex(1024, 1518, (g, w, h) => {
  g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(42,47,114,0.12)'; g.lineWidth = 2; for (let x = 0; x <= w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  const sx = (x) => ((x - WH.x0) / (WH.x1 - WH.x0)) * (w - 120) + 60, sz = (z) => ((z - WH.z0) / (WH.z1 - WH.z0)) * (h - 120) + 60;
  g.strokeStyle = P.ink; g.lineWidth = 9; g.strokeRect(sx(WH.x0 + 0.07), sz(WH.z0 + 0.07), sx(WH.x1 - 0.07) - sx(WH.x0 + 0.07), sz(WH.z1 - 0.07) - sz(WH.z0 + 0.07));
  g.lineWidth = 7; for (const r of RACKS) g.strokeRect(sx(r.x0), sz(r.z0), sx(r.x1) - sx(r.x0), sz(r.z1) - sz(r.z0));
  g.fillStyle = 'rgba(42,47,114,0.10)'; for (const r of RACKS) g.fillRect(sx(r.x0), sz(r.z0), sx(r.x1) - sx(r.x0), sz(r.z1) - sz(r.z0));
  g.strokeStyle = 'rgba(42,47,114,0.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();   // fold creases
});
const toSheet = (x, z) => V3(SHEET.cx + ((x - WH.x0) / (WH.x1 - WH.x0) - 0.5) * SHEET.w * (1 - 120 / 1024) , SHEET.y + 0.03, SHEET.cz + ((z - WH.z0) / (WH.z1 - WH.z0) - 0.5) * SHEET.d * (1 - 120 / 1518));
const sheetRoot = new THREE.Group(); sheetRoot.position.set(SHEET.cx, SHEET.y, SHEET.cz); scene.add(sheetRoot);
function panel(u0, v0) { // quadrant panel: printed front (its quarter of the map) + plain back, card-thick
  const g = new THREE.Group(); const pw = SHEET.w / 2, pd = SHEET.d / 2;
  const tex = mapTex.clone(); tex.needsUpdate = true; tex.repeat.set(0.5, 0.5); tex.offset.set(u0, 1 - v0 - 0.5);
  const geo = new THREE.BoxGeometry(pw, 0.012, pd); const front = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }); const backM = paper('#dcd6ff'); const ed = paper('#ffffff');
  const m = new THREE.Mesh(geo, [ed, ed, front, backM, ed, ed]); m.castShadow = true; m.receiveShadow = true; g.add(m); return g;
}
// hierarchy: left half static (TL, BL on a hinge); right half on the centre hinge (TR, BR on a hinge)
const pw = SHEET.w / 2, pd = SHEET.d / 2;
const TLp = panel(0, 0); TLp.position.set(-pw / 2, 0, -pd / 2); sheetRoot.add(TLp);
const BLh = new THREE.Group(); BLh.position.set(-pw / 2, 0, 0); sheetRoot.add(BLh); const BLp = panel(0, 0.5); BLp.position.set(0, 0, pd / 2); BLh.add(BLp);
const Rh = new THREE.Group(); sheetRoot.add(Rh);
const TRp = panel(0.5, 0); TRp.position.set(pw / 2, 0, -pd / 2); Rh.add(TRp);
const BRh = new THREE.Group(); BRh.position.set(pw / 2, 0, 0); Rh.add(BRh); const BRp = panel(0.5, 0.5); BRp.position.set(0, 0, pd / 2); BRh.add(BRp);
function foldSheet(t) {
  const a1 = prog(t, E.unfold, E.unfold + 0.65), a2 = prog(t, E.unfold + 0.6, E.unfoldEnd);
  Rh.rotation.z = Math.PI * (1 - a1); Rh.position.y = 0.03 * (1 - a1) + 0.002;
  BLh.rotation.x = -Math.PI * (1 - a2); BRh.rotation.x = -Math.PI * (1 - a2); BLh.position.y = BRh.position.y = 0.016 * (1 - a2) + 0.001;
  sheetRoot.visible = t >= E.unfold - 0.4;
  sheetRoot.position.y = SHEET.y + 0.25 * (1 - prog(t, E.unfold - 0.4, E.unfold, outC));
}
// matching threads (shelf corner ↔ sheet corner) and position pin
const MATCH = [[RACKS[0].x1, RACKS[0].z1], [RACKS[1].x0, RACKS[1].z1], [RACKS[3].x0, RACKS[3].z0]];
const threadMat = new THREE.MeshBasicMaterial({ color: P.magenta }); let threads = [];
const ringGeo = new THREE.TorusGeometry(0.09, 0.018, 8, 28);
const rings = MATCH.flatMap(() => [new THREE.Mesh(ringGeo, threadMat), new THREE.Mesh(ringGeo, threadMat)]); rings.forEach((r) => { r.rotation.x = Math.PI / 2; scene.add(r); });
const pin = new THREE.Group(); { const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.26, 16), paper(P.magenta)); c.rotation.x = Math.PI; c.position.y = 0.13; const head = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 24), [paper(P.magenta), paper('#ffffff'), paper(P.magenta)]); head.position.y = 0.28; pin.add(c, head); pin.traverse((o) => { o.castShadow = true; }); }
scene.add(pin);
const sheetDots = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 8), dotMatC, 600); sheetDots.count = 0; scene.add(sheetDots);

// ------------------------------------------------------------------ route strips (paper dashes on the floor)
const stripMatC = paper(P.cyan), stripMatOld = paper('#7fe9ff');
const stripGeo = new THREE.BoxGeometry(0.16, 0.012, 0.28);
const pathA = []; for (let z = 0.95; z >= -3.6; z -= 0.42) pathA.push([0, z]);
const pathB = (() => { const pts = []; const poly = [[0, 0.95], [0.6, 0.65], [0.62, 0.05], [0.62, -0.55], [0.0, -1.05], [0, -3.6]]; for (let i = 0; i < poly.length - 1; i++) { const [x0, z0] = poly[i], [x1, z1] = poly[i + 1]; const L = Math.hypot(x1 - x0, z1 - z0); const n = Math.max(1, Math.round(L / 0.42)); for (let k = 0; k < n; k++) pts.push([lerp(x0, x1, k / n), lerp(z0, z1, k / n), Math.atan2(x1 - x0, z1 - z0)]); } return pts; })();
const stripsA = pathA.map(() => { const m = new THREE.Mesh(stripGeo, stripMatC); m.receiveShadow = true; scene.add(m); return m; });
const stripsB = pathB.map(() => { const m = new THREE.Mesh(stripGeo, stripMatC); m.receiveShadow = true; scene.add(m); return m; });

// ------------------------------------------------------------------ the Media Diet paper sign (signature, CTA shot)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0, 0.0, 5.25);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SHOTS = {
  S1: (t) => { const u = prog(t, 0, 2.8), c = prog(t, E.roofLift, 4.6); return { pos: V3(lerp(lerp(7.4, 6.8, u), 4.6, c), lerp(lerp(3.2, 3.6, u), 9.2, c), lerp(lerp(13.6, 12.8, u), 9.6, c)), look: V3(lerp(0.2, 0, c), lerp(2.2, 0.2, c), lerp(-0.6, 0.6, c)), fov: lerp(42, 46, c), focus: lerp(14, 12, c) }; },
  S2: (t) => { const u = prog(t, 4.6, 9.6); return { pos: V3(lerp(-1.2, -0.9, u), lerp(1.9, 2.15, u), lerp(7.0, 6.7, u)), look: V3(0.3, 0.25, lerp(2.2, 2.0, u)), fov: 50, focus: 4.4 }; },
  S3: (t) => { const u = prog(t, 9.6, 12.8); return { pos: V3(0.0, lerp(14.2, 13.6, u), lerp(5.6, 5.2, u)), look: V3(0, 0, -0.3), fov: 42, focus: 14 }; },
  S4: (t) => { const u = prog(t, 12.8, 17.9); return { pos: V3(lerp(2.6, 2.2, u), lerp(9.6, 9.2, u), lerp(15.4, 14.6, u)), look: V3(0, 0, 3.4), fov: 46, focus: 10.5 }; },
  S5: (t) => { const u = prog(t, 17.9, 20.3); return { pos: V3(lerp(-2.4, -2.0, u), lerp(8.4, 8.0, u), lerp(13.4, 13.0, u)), look: V3(0.1, 0, lerp(5.6, 5.4, u)), fov: 46, focus: 8.6 }; },
  S6: (t) => { const u = prog(t, 20.3, 22.6); return { pos: V3(lerp(-1.05, -0.9, u), lerp(2.15, 2.0, u), lerp(3.85, 3.65, u)), look: V3(0.15, 0.2, lerp(0.45, 0.35, u)), fov: 50, focus: 3.5 }; },
  S7: (t) => { const u = prog(t, 22.6, 26.4); return { pos: V3(0.0, lerp(14.2, 13.8, u), 0.4), look: V3(0, 0, -0.4), fov: 40, focus: 14, top: true }; },
  S8: (t) => { const u = prog(t, 26.4, 29.4); return { pos: V3(lerp(3.2, 4.4, u), lerp(5.0, 8.2, u), lerp(10.8, 13.2, u)), look: V3(0, 0.3, lerp(1.6, 1.4, u)), fov: 44, focus: lerp(8.0, 11.5, u) }; },
};

// ------------------------------------------------------------------ overlay (captions + the one small timing readout)
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
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1];
  const cam = SHOTS[shot.id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); if (cam.top) camera.up.set(0, 0, -1);
  camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = cam.top ? 0.00025 : 0.0008; bokeh.uniforms.maxblur.value = cam.top ? 0.002 : 0.005;

  // GPS rings: travel down from the satellite, fade and break at the roof (S1 only)
  sigRings.forEach((r, i) => { const ph = ((t - E.signal) * 0.9 + i * 0.25) % 1; const on = t >= E.signal && t < 4.6;
    r.position.set(lerp(sat.position.x, 0.6, ph), lerp(sat.position.y - 0.4, FLOOR_Y + WH.h + 0.25, ph), lerp(sat.position.z, -0.4, ph));
    r.material.opacity = on ? (1 - ph) * (t < E.signalFade ? 0.85 : 0.85 * (1 - prog(t, E.signalFade, E.signalFade + 1.0))) * (ph < 0.9 ? 1 : 0) : 0; r.scale.setScalar(0.6 + ph * 0.6); });
  sat.visible = shot.id === 'S1' || shot.id === 'S8';
  front.visible = shot.id !== 'S2'; frontStub.visible = shot.id === 'S2';   // cutaway: front wall cut down to a low section for the interior shot

  // roof lifts on its hinge and swings away
  const lift = prog(t, E.roofLift, E.roofGone); roofPivot.rotation.x = -0.3 * Math.sin(Math.min(1, lift * 1.6) * Math.PI / 2); roofPivot.position.y = FLOOR_Y + WH.h + 0.02 + outC(lift) * 9; roofPivot.position.z = WH.z0 - 0.05 - outC(lift) * 6; roofPivot.visible = lift < 0.999;

  // robot pose
  const rp = robotPose(t); robot.position.set(rp.x, 0, rp.z); robot.rotation.y = rp.heading;
  robot.children.forEach((c) => { if (c.geometry && c.geometry.type === 'CylinderGeometry' && c.rotation.z) c.rotation.x = -(rp.z) * 6; });

  // the question tag pops above the robot while the voice asks, then folds away
  { const a = prog(t, E.query, E.query + 0.3, outBack) * (1 - prog(t, 6.2, 6.5)); qTag.visible = a > 0.01; qTag.position.set(rp.x, FLOOR_Y + 0.95, rp.z); qTag.scale.setScalar(Math.max(0.01, a) * 1.3); qTag.rotation.y = 0.5; }
  // crate
  const cx = crateXform(t); crate.visible = !!cx; if (cx) { crate.position.set(cx.x, FLOOR_Y + cx.y, cx.z); crate.rotation.set(0, 0, cx.tilt); }

  // pulse: one measured reflection, out and back
  pulseBall.visible = t >= E.pulseOut && t < E.pulseBack + 0.05;
  if (pulse) { scene.remove(pulse); pulse.geometry.dispose(); pulse = null; }
  const PT = castRay(0, 3.6, -0.62, RACKS);       // first measurement: towards the front-left rack corner
  if (pulseBall.visible) {
    const o = V3(0, FLOOR_Y + LIDAR_Y - 0.09, 3.6), h = V3(PT.x, FLOOR_Y + LIDAR_Y - 0.09, PT.z);
    const u = t < E.pulseHit ? prog(t, E.pulseOut, E.pulseHit, (x) => x) : 1 - prog(t, E.pulseHit, E.pulseBack, (x) => x);
    pulseBall.position.lerpVectors(o, h, u);
    const g = new THREE.BufferGeometry().setFromPoints([o, h]); pulse = new THREE.Line(g, new THREE.LineDashedMaterial({ color: '#ffffff', dashSize: 0.06, gapSize: 0.05 })); pulse.computeLineDistances(); scene.add(pulse);
  }

  // scan dots + the sweeping fan (only during the actual sweeps)
  const dotList = []; const dotListM = []; const LY = FLOOR_Y + LIDAR_Y - 0.09;
  const addScan = (k, upto) => { const S = scanOf(k); for (const h of S) { if (h.a <= upto) (h.crate ? dotListM : dotList).push([h.x, LY, h.z]); } };
  if (t >= E.sweep && t < 20.3) addScan('s1', t < E.sweepEnd ? ((t - E.sweep) / (E.sweepEnd - E.sweep)) * Math.PI * 2 : 9);
  if (t >= E.sweep2 && t < 20.3) addScan('s2', t < E.sweep2End ? ((t - E.sweep2) / (E.sweep2End - E.sweep2)) * Math.PI * 2 : 9);
  if (t >= E.sweep3) addScan('s3', t < E.sweep3End ? ((t - E.sweep3) / (E.sweep3End - E.sweep3)) * Math.PI * 2 : 9);
  const mtx = new THREE.Matrix4();
  dots.count = Math.min(2400, dotList.length); dotList.slice(0, 2400).forEach((p, i) => { mtx.makeTranslation(...p); dots.setMatrixAt(i, mtx); }); dots.instanceMatrix.needsUpdate = true;
  dotsM.count = Math.min(400, dotListM.length); dotListM.slice(0, 400).forEach((p, i) => { mtx.makeTranslation(...p); dotsM.setMatrixAt(i, mtx); }); dotsM.instanceMatrix.needsUpdate = true;
  if (fan) { scene.remove(fan); fan.geometry.dispose(); fan = null; }
  for (const k of ['s1', 's2', 's3']) { const s = SCANS[k]; if (t >= s.t0 && t < s.t1) {
    const th = ((t - s.t0) / (s.t1 - s.t0)) * Math.PI * 2; const S = scanOf(k); const verts = []; const o = [s.pose[0], LY, s.pose[1]];
    for (const h of S) if (h.a <= th && h.a >= th - 0.55) verts.push(h);
    const pos = []; for (let i = 0; i < verts.length - 1; i++) { pos.push(...o, verts[i].x, LY, verts[i].z, verts[i + 1].x, LY, verts[i + 1].z); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); fan = new THREE.Mesh(g, fanMat); scene.add(fan);
  } }
  // outline: consecutive scan points join into the shapes of walls and shelves (S3 onwards)
  if (outline) { scene.remove(outline); outline.dispose(); outline = null; }
  if (t >= E.outline && t < 20.3) {
    const S = scanOf('s1'); const n = Math.floor(S.length * prog(t, E.outline, E.outlineEnd, (x) => x)); const segs = [];
    for (let i = 0; i < n; i++) { const a = S[i], b = S[(i + 1) % S.length]; if (Math.hypot(a.x - b.x, a.z - b.z) < 0.35) segs.push(a.x, LY + 0.01, a.z, b.x, LY + 0.01, b.z); }
    outline = new THREE.InstancedMesh(ribGeo, ribMat, Math.max(1, segs.length / 6)); let k = 0; const q = new THREE.Quaternion(), sc = new THREE.Vector3(), m4 = new THREE.Matrix4();
    for (let i = 0; i < segs.length; i += 6) { const a = V3(segs[i], segs[i + 1], segs[i + 2]), b = V3(segs[i + 3], segs[i + 4], segs[i + 5]); const L = a.distanceTo(b);
      q.setFromAxisAngle(V3(0, 1, 0), Math.atan2(b.x - a.x, b.z - a.z)); sc.set(1, 1, Math.max(0.01, L)); m4.compose(a.clone().lerp(b, 0.5), q, sc); outline.setMatrixAt(k++, m4); }
    outline.count = k; scene.add(outline);
  }

  // map sheet, fresh-scan dots on the sheet sliding into alignment, matching threads, pin
  foldSheet(t);
  const align = prog(t, E.match, E.match + 0.7);
  const showSheetDots = t >= E.sweep2End - 0.1 && t < 20.3;
  const cur = t < 18.3 ? [0, 2.4] : [robotPose(t).x, robotPose(t).z];
  if (showSheetDots) {
    const S = scanOf('s2'); const err = (1 - align); const ang = 0.32 * err, off = [0.55 * err, -0.4 * err]; let i = 0;
    for (const h of S) { if (i >= 600) break; const rx = h.x - 0, rz = h.z - 2.4; const ca = Math.cos(ang), sa = Math.sin(ang);
      const x = cur[0] + ca * rx - sa * rz + off[0], z = cur[1] + sa * rx + ca * rz + off[1]; const p = toSheet(x, z); mtx.makeTranslation(p.x, p.y, p.z); sheetDots.setMatrixAt(i++, mtx); }
    sheetDots.count = i; sheetDots.instanceMatrix.needsUpdate = true;
  } else sheetDots.count = 0;
  threads.forEach((m) => { scene.remove(m); m.geometry.dispose(); }); threads = [];
  rings.forEach((r) => (r.visible = false));
  if (t >= E.match && t < 17.9) MATCH.forEach(([x, z], i) => {
    const a = V3(x, FLOOR_Y + 0.5, z), b = toSheet(x, z).add(V3(0, 0.02, 0)); const p = prog(t, E.match + i * 0.12, E.match + i * 0.12 + 0.55);
    if (p <= 0) return; const mid = a.clone().lerp(b, 0.5).add(V3(0, 1.6, 0)); const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const g = new THREE.TubeGeometry(curve, 40, 0.03, 6, false); g.setDrawRange(0, Math.floor(g.index.count * p / 3) * 3); const m = new THREE.Mesh(g, threadMat); scene.add(m); threads.push(m);
    rings[i * 2].visible = true; rings[i * 2].position.copy(a); rings[i * 2 + 1].visible = p > 0.95; rings[i * 2 + 1].position.copy(b);
  });
  pin.visible = t >= E.pin && t < 20.3;
  if (pin.visible) { const p = toSheet(cur[0], cur[1]); const s = outBack(clamp((t - E.pin) / 0.3)); pin.position.copy(p); pin.scale.setScalar(Math.max(0.01, s) * 1.7); }

  // route strips: planned path, blocked, re-routed
  stripsA.forEach((m, i) => { const [x, z] = pathA[i]; const on = t >= E.path + i * 0.04 && t < 26.4; m.visible = on;
    const off = prog(t, E.reroute + (Math.abs(z - CRATE_AT[1]) < 1.3 ? 0 : 99), E.reroute + 0.35); m.position.set(x, FLOOR_Y + 0.008 + off * 0.25, z); m.rotation.set(off * 1.2, 0, 0);
    m.material = Math.abs(z - CRATE_AT[1]) < 1.3 && t >= E.reroute ? stripMatOld : stripMatC; m.scale.setScalar(Math.abs(z - CRATE_AT[1]) < 1.3 ? 1 - off : 1);
    if (t >= E.reroute + 0.35 && Math.abs(z - CRATE_AT[1]) < 1.3) m.visible = false; if (t >= E.drive && z > robotPose(t).z + 0.2) m.visible = false; });
  stripsB.forEach((m, i) => { const [x, z, a] = pathB[i]; const t0 = E.reroute + 0.35 + i * 0.03; const on = t >= t0 && t < 26.4 && (t < E.drive || z < robotPose(t).z - 0.2);
    m.visible = on && (Math.abs(z - CRATE_AT[1]) < 1.3 || false); const u = prog(t, t0, t0 + 0.2, outC); m.position.set(x, FLOOR_Y + 0.008 + (1 - u) * 0.2, z); m.rotation.set(0, a, 0); });

  // sign hinges up for the CTA
  const su = prog(t, E.sign, E.sign + 0.45, outBack); sign.visible = t >= E.sign - 0.1; sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(su, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}

function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = [];
  { const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H); }   // miniature vignette
  // the one timing readout: a small stopwatch at the lidar while the first pulse is out and back
  if (t >= E.pulseOut && t < E.pulseBack + 1.0) {
    const [x0, y0] = project(V3(0, FLOOR_Y + LIDAR_Y + 0.25, 3.6)); const x = clamp(x0, 200, 880) + 150, y = clamp(y0, 900, 1500) - 110; const a = clamp((t - E.pulseOut) / 0.12) * (1 - clamp((t - E.pulseBack - 0.8) / 0.2));
    const u = clamp((t - E.pulseOut) / (E.pulseBack - E.pulseOut)); og.save(); og.globalAlpha = a; og.translate(x - 150, y - 150);
    og.fillStyle = 'rgba(236,232,255,0.96)'; og.beginPath(); og.arc(0, 0, 54, 0, Math.PI * 2); og.fill(); og.strokeStyle = '#14163a'; og.lineWidth = 6; og.stroke();
    og.fillStyle = '#14163a'; og.fillRect(-10, -72, 20, 14); og.strokeStyle = '#fe4092'; og.lineWidth = 7; og.lineCap = 'round';
    og.beginPath(); og.arc(0, 0, 36, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 1.6); og.stroke(); og.strokeStyle = '#14163a'; og.lineWidth = 5; og.beginPath(); og.moveTo(0, 0);
    og.lineTo(Math.cos(-Math.PI / 2 + u * Math.PI * 1.6) * 36, Math.sin(-Math.PI / 2 + u * Math.PI * 1.6) * 36); og.stroke(); og.restore();
    if (t >= E.pulseBack) otext(`${PT_D.toFixed(1)} m`, x - 150, y - 60, { font: '600 34px "Plex Mono"', alpha: a * clamp((t - E.pulseBack) / 0.1), kind: 'label', shadow: 10 });
  }
  captions(t);
}
const PT_D = castRay(0, 3.6, -0.62, RACKS).d * 0.6;   // schematic scale: 1 floor unit ≈ 0.6 m in this miniature

window.render = (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
