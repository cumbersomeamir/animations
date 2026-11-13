// Media Diet · 30 s English episode 13 — "Why would a walking robot need wheels?" Boston Dynamics, "Atlas on a Roll" (9 Nov 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted english-12 / Bean builds: a paper
// miniature in Media Diet brand colours — laminated cards with visible edges, paper grain, real cast shadows, one camera set-up per
// beat, restrained depth of field. Approved feedback rules (context/26): one visual idea and one large brief label at a time,
// captions inside x 100–900 / y 230–1500. Robot = generic paper humanoid on scooter wheels, not a replica. Deterministic: window.render(f).
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

// ------------------------------------------------------------------ small helpers for this episode
let sd = 13; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
const frac = (x) => x - Math.floor(x);
const sh = (id) => TL.shots.find((s) => s.id === id);

// soft front fill so the robot reads from the camera side (no shadows; key light still casts them)
const fill = new THREE.DirectionalLight('#fff1e0', 0); fill.position.set(5, 6, 9); scene.add(fill);
// ------------------------------------------------------------------ LAB FLOOR (paper test bay)
const labSet = new THREE.Group(); scene.add(labSet);
const FY = DESK + 0.03;                      // floor top
{ const f = card(9, 0.02, 7, '#cfc9ee', P.white); f.position.set(0, FY - 0.01, 0); labSet.add(f);
  [[-2.6, -1.9, 0.5, 0.42, 0.45, P.deep], [-1.95, -2.2, 0.38, 0.3, 0.36, P.violet], [2.5, -2.0, 0.55, 0.5, 0.5, P.deep], [2.0, -2.4, 0.4, 0.62, 0.4, P.violet2]].forEach(([x, z, w, h, d, c]) => {
    const b = card(w, h, d, c, P.lav); b.position.set(x, FY + h / 2, z); labSet.add(b); }); }

// ------------------------------------------------------------------ the robot: a generic paper humanoid on scooter wheels (not a replica), faces +x
const shellMats = { body: paper('#ece8ff', { transparent: true }), plate: paper(P.violet, { transparent: true }), dark: paper('#24287e', { transparent: true }) };
const actMat = () => new THREE.MeshStandardMaterial({ color: '#2a6f9a', emissive: P.cyan, emissiveIntensity: 0.0, roughness: 0.5 });
function pbox(w, h, d, m) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.castShadow = true; b.receiveShadow = true; return b; }
const wheelTex = canvasTex(256, 256, (g) => { g.fillStyle = '#16182e'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#d9d3ff'; g.beginPath(); g.arc(128, 128, 92, 0, Math.PI * 2); g.fill(); g.fillStyle = '#7c3fda'; g.beginPath(); g.arc(128, 128, 78, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f3f1ff'; for (let i = 0; i < 6; i++) { g.save(); g.translate(128, 128); g.rotate(i * Math.PI / 3); g.fillRect(-8, -78, 16, 66); g.restore(); } g.fillStyle = P.cyan; g.beginPath(); g.arc(128, 128, 18, 0, Math.PI * 2); g.fill(); });
const rimMat = new THREE.MeshStandardMaterial({ map: wheelTex, roughness: 0.8 });
const WR = 0.14, L1 = 0.42, L2 = 0.42;
function makeWheel() { const g = new THREE.Group(); const tire = new THREE.Mesh(new THREE.TorusGeometry(WR - 0.032, 0.032, 14, 40), paper('#1b1d33')); tire.castShadow = true; g.add(tire);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(WR - 0.035, WR - 0.035, 0.05, 36), [paper('#cfc8ff'), rimMat, rimMat]); disc.rotation.x = Math.PI / 2; disc.castShadow = true; g.add(disc); return g; }
function makeRobot(ghost = null) {
  const R = { root: new THREE.Group(), legs: [], arms: [], acts: [] }; const M = ghost ? { body: ghost, plate: ghost, dark: ghost } : shellMats;
  const hips = new THREE.Group(); R.root.add(hips); R.hips = hips;
  const pelvis = pbox(0.22, 0.12, 0.38, M.dark); hips.add(pelvis);
  const torso = new THREE.Group(); torso.position.y = 0.06; hips.add(torso); R.torso = torso;
  const chest = pbox(0.28, 0.44, 0.46, M.body); chest.position.y = 0.26; torso.add(chest);
  if (!ghost) { const plate = pbox(0.012, 0.26, 0.3, M.plate); plate.position.set(0.146, 0.3, 0); torso.add(plate); }
  const neck = pbox(0.08, 0.06, 0.08, M.dark); neck.position.y = 0.51; torso.add(neck);
  const head = pbox(0.2, 0.18, 0.22, M.body); head.position.y = 0.62; torso.add(head);
  if (!ghost) { const visor = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.05, 0.17), new THREE.MeshStandardMaterial({ color: '#bff6ff', emissive: P.cyan, emissiveIntensity: 1.1 })); visor.position.set(0.102, 0.64, 0); torso.add(visor); }
  for (const s of [-1, 1]) { // arms
    const sh_ = new THREE.Group(); sh_.position.set(0, 0.44, s * 0.29); torso.add(sh_);
    const up = pbox(0.09, 0.3, 0.09, M.body); up.position.y = -0.15; sh_.add(up);
    const el = new THREE.Group(); el.position.y = -0.3; sh_.add(el); const lo = pbox(0.08, 0.27, 0.08, M.dark); lo.position.y = -0.135; el.add(lo);
    R.arms.push({ sh: sh_, el }); }
  for (const s of [-1, 1]) { // legs: hip → thigh → knee → shin → ankle actuator + wheel
    const hip = new THREE.Group(); hip.position.set(0, -0.02, s * 0.15); hips.add(hip);
    const thigh = pbox(0.11, L1, 0.11, M.body); thigh.position.y = -L1 / 2; hip.add(thigh);
    const knee = new THREE.Group(); knee.position.y = -L1; hip.add(knee); const shin = pbox(0.1, L2, 0.1, M.dark); shin.position.y = -L2 / 2; knee.add(shin);
    const ankle = new THREE.Group(); ankle.position.y = -L2; knee.add(ankle);
    const wheel = ghost ? (() => { const w = new THREE.Mesh(new THREE.CylinderGeometry(WR, WR, 0.06, 20), ghost); w.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.add(w); return g; })() : makeWheel();
    wheel.position.z = s * 0.06; ankle.add(wheel);
    const foot = ghost ? null : pbox(0.26, 0.06, 0.13, M.dark); if (foot) { foot.position.set(0.04, -WR + 0.03, 0); foot.visible = false; ankle.add(foot); }
    const adapter = ghost ? null : new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 20), paper(P.magenta)); if (adapter) { adapter.rotation.x = Math.PI / 2; adapter.position.z = s * 0.025; ankle.add(adapter); }
    if (!ghost) for (const [grp, z] of [[hip, 0], [knee, 0], [ankle, 0]]) { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.13, 24), actMat()); a.rotation.x = Math.PI / 2; a.position.z = z; a.visible = false; grp.add(a); R.acts.push(a); }
    R.legs.push({ hip, knee, ankle, wheel, foot, adapter, s }); }
  if (!ghost) for (const sh_ of R.arms) { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 24), actMat()); a.rotation.x = Math.PI / 2; a.visible = false; sh_.sh.add(a); R.acts.push(a); }
  return R; }
// pose: x, z, heading (rad), crouch angle a (thigh from vertical), hop (m), spin (rad about y), lean (rad), dist rolled (for wheel spin), arm swing
function pose(R, o) { const a = o.a ?? 0.18; const legH = (L1 + L2) * Math.cos(a);
  R.root.position.set(o.x ?? 0, FY + WR + (o.hop ?? 0), o.z ?? 0); R.root.rotation.set(0, (o.head ?? 0) + (o.spin ?? 0), -(o.lean ?? 0));   // lean tilts about the wheel axle
  R.hips.position.y = legH; R.hips.rotation.z = 0;
  R.legs.forEach((L) => { L.hip.rotation.z = a; L.knee.rotation.z = -2 * a; L.ankle.rotation.z = a; L.wheel.rotation.z = -(o.dist ?? 0) / WR; });
  R.torso.rotation.z = -a * 0.3;
  R.arms.forEach((A, i) => { A.sh.rotation.z = o.arm ?? 0.15; A.sh.rotation.x = (i ? -1 : 1) * (0.12 + (o.armOut ?? 0)); A.el.rotation.z = 0.5 + (o.elbow ?? 0); }); }
const bot = makeRobot(); labSet.add(bot.root);
function setShell(c) { Object.values(shellMats).forEach((m) => { m.opacity = 1 - 0.8 * c; m.depthWrite = c < 0.05; }); bot.acts.forEach((a) => (a.visible = c > 0.02)); bot.root.traverse((o) => { if (o.isMesh && shellMats.body === o.material) o.castShadow = c < 0.5; }); }
// robot path for the hook: roll in, slow, crouch, spin-jump, land, roll on
function hookPose(t) { const x = -1.35 + 1.25 * outC(clamp(t / 1.5)) + 0.9 * prog(t, E.land, 3.7, (u) => u * u);
  const air = clamp((t - E.jump) / (E.land - E.jump)); const inAir = t > E.jump && t < E.land;
  const hop = inAir ? 4 * 0.32 * air * (1 - air) : 0; const spin = 2 * Math.PI * (t < E.jump ? 0 : t > E.land ? 1 : ease(air));
  const crouch = 0.18 + 0.45 * (prog(t, E.crouch, E.jump - 0.02) * (1 - prog(t, E.jump, E.jump + 0.15))) + 0.4 * prog(t, E.land - 0.05, E.land + 0.08) * (1 - prog(t, E.land + 0.1, E.land + 0.5));
  return { x, a: inAir ? 0.35 : crouch, hop, spin, dist: x * 1.0, lean: -0.08 * prog(t, 0.9, 1.4) * (1 - prog(t, 1.4, 1.6)), arm: 0.15 + (inAir ? 0.9 * Math.sin(air * Math.PI) : 0), armOut: inAir ? 0.5 * Math.sin(air * Math.PI) : 0 }; }

// ghosts for the simulation beat
const ghostMat = new THREE.MeshStandardMaterial({ color: '#7fe6ff', emissive: P.cyan, emissiveIntensity: 0.35, transparent: true, opacity: 0.55, roughness: 0.6, depthWrite: false });
const simSet = new THREE.Group(); scene.add(simSet);
const tileTex = canvasTex(256, 256, (g) => { g.fillStyle = '#141a52'; g.fillRect(0, 0, 256, 256); g.strokeStyle = 'rgba(42,221,250,0.35)'; g.lineWidth = 4; g.strokeRect(6, 6, 244, 244); });
const ghosts = []; const GN = [6, 5];
for (let i = 0; i < GN[0]; i++) for (let j = 0; j < GN[1]; j++) { const x = (i - (GN[0] - 1) / 2) * 1.0, z = (j - (GN[1] - 1) / 2) * 1.0;
  const tile = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.02, 0.92), [paper('#24287e'), paper('#24287e'), new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.9 }), paper('#24287e'), paper('#24287e'), paper('#24287e')]); tile.position.set(x, DESK + 0.02, z); tile.receiveShadow = true; simSet.add(tile);
  const g = makeRobot(ghostMat); g.root.scale.setScalar(0.55); simSet.add(g.root); ghosts.push({ g, x, z, ph: rnd() * 6, k: (i + j) / (GN[0] + GN[1]) }); }

// ------------------------------------------------------------------ the torque–speed board (a paper chart redrawn per frame)
const chartSet = new THREE.Group(); scene.add(chartSet);
const CW = 1024, CHh = 1024; const chartCanvas = document.createElement('canvas'); chartCanvas.width = CW; chartCanvas.height = CHh; const cg = chartCanvas.getContext('2d');
const chartTex = new THREE.CanvasTexture(chartCanvas); chartTex.colorSpace = THREE.SRGBColorSpace; chartTex.anisotropy = 8;
const BOARD = { w: 1.5, h: 1.5, y: DESK + 0.1 + 0.75 };
{ const b = new THREE.Mesh(new THREE.BoxGeometry(BOARD.w, BOARD.h, 0.04), [paper(P.lav), paper(P.lav), paper(P.lav), paper(P.lav), new THREE.MeshStandardMaterial({ map: chartTex, roughness: 0.9, emissive: '#ffffff', emissiveMap: chartTex, emissiveIntensity: 0.22 }), paper('#cfc8ff')]);
  b.position.set(0, BOARD.y, 0); b.castShadow = true; b.receiveShadow = true; chartSet.add(b); const st = card(1.7, 0.1, 0.45, P.deep, P.lav); st.position.set(0, DESK + 0.05, 0.05); chartSet.add(st); }
// a small motor on a test bench (measurement beat)
const bench = new THREE.Group(); chartSet.add(bench); bench.position.set(1.15, DESK + 0.1, 0.55);
{ const base = card(0.6, 0.06, 0.32, P.deep, P.lav); base.position.y = 0.03; bench.add(base);
  const mot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.24, 28), [paper('#2a6f9a'), paper(P.cyan), paper(P.cyan)]); mot.rotation.z = Math.PI / 2; mot.position.set(-0.12, 0.17, 0); mot.castShadow = true; bench.add(mot);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 12), paper('#cfc8ff')); shaft.rotation.z = Math.PI / 2; shaft.position.set(0.07, 0.17, 0); bench.add(shaft); }
const flyTex = canvasTex(128, 128, (g) => { g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill(); g.fillStyle = '#b07000'; g.fillRect(56, 6, 16, 52); });
const fly = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 32), [paper('#b07000'), new THREE.MeshStandardMaterial({ map: flyTex }), new THREE.MeshStandardMaterial({ map: flyTex })]); fly.rotation.z = Math.PI / 2; fly.position.set(0.17, 0.17, 0); fly.castShadow = true; bench.add(fly);
const O = { x: 170, y: 860 }, X1 = 900, Y1 = 150;        // chart frame (px): origin, max speed x, max torque y
const cpt = (s, tq) => [O.x + s * (X1 - O.x), O.y - tq * (O.y - Y1)];
const MEAS = Array.from({ length: 9 }, (_, i) => { const s = 0.06 + i * 0.11; return [s, Math.max(0.02, 1 - s + (rnd() - 0.5) * 0.05)]; });
function drawChart(st) {
  const g = cg; g.clearRect(0, 0, CW, CHh); g.fillStyle = '#f3f1ff'; g.fillRect(0, 0, CW, CHh);
  const A = st.axes ?? 1; if (A <= 0) { chartTex.needsUpdate = true; return; }
  g.save(); g.globalAlpha = A; g.strokeStyle = '#14163a'; g.lineWidth = 10; g.lineCap = 'round';
  g.beginPath(); g.moveTo(O.x, Y1 - 40); g.lineTo(O.x, O.y); g.lineTo(X1 + 40, O.y); g.stroke();
  g.fillStyle = '#14163a'; g.beginPath(); g.moveTo(O.x - 18, Y1 - 30); g.lineTo(O.x, Y1 - 64); g.lineTo(O.x + 18, Y1 - 30); g.fill(); g.beginPath(); g.moveTo(X1 + 30, O.y - 18); g.lineTo(X1 + 64, O.y); g.lineTo(X1 + 30, O.y + 18); g.fill();
  g.font = '700 58px "Space Grotesk"'; g.textAlign = 'left'; g.fillText('TORQUE', O.x + 26, Y1 - 52 + 40); g.textAlign = 'right'; g.fillText('SPEED', X1 + 40, O.y + 80); g.restore();
  // ideal-motor box (full torque at every speed)
  if ((st.ideal ?? 0) > 0) { const m = st.morph ?? 0; const [x0, y0] = cpt(0, 1), [x1, y1] = cpt(1, 1 - m), [x2, y2] = cpt(1, 0);
    g.save(); g.globalAlpha = st.ideal; g.fillStyle = 'rgba(42,221,250,0.45)'; g.beginPath(); g.moveTo(O.x, O.y); g.lineTo(x0, y0); g.lineTo(lerp(x1, x2, 0), lerp(y1, y1, 0)); g.lineTo(x2, y2); g.closePath(); g.fill();
    g.strokeStyle = '#127a8f'; g.lineWidth = 8; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore(); }
  // the real motor's limit: straight speed–torque line, region underneath
  const ln = st.line ?? 0; if (ln > 0) { const [ax, ay] = cpt(0, 1), [bx, by] = cpt(1, 0);
    if ((st.fill ?? 0) > 0) { g.save(); g.globalAlpha = st.fill; g.fillStyle = 'rgba(124,63,218,0.30)'; g.beginPath(); g.moveTo(O.x, O.y); g.lineTo(ax, ay); g.lineTo(bx, by); g.closePath(); g.fill(); g.restore(); }
    g.save(); g.strokeStyle = st.lineCol || '#552dbc'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(ax, ay); g.lineTo(lerp(ax, bx, ln), lerp(ay, by, ln)); g.stroke(); g.restore();
    g.save(); g.fillStyle = '#552dbc'; g.globalAlpha = clamp(ln * 3); g.beginPath(); g.arc(ax, ay, 22, 0, Math.PI * 2); g.fill(); g.globalAlpha = clamp((ln - 0.9) * 10); g.beginPath(); g.arc(bx, by, 22, 0, Math.PI * 2); g.fill(); g.restore(); }
  // the unreachable corner
  if ((st.corner ?? 0) > 0) { const [cx, cy] = cpt(1, 1); g.save(); g.globalAlpha = st.corner; g.fillStyle = 'rgba(254,64,146,0.18)'; g.beginPath(); g.arc(cx, cy, 86, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#d61f69'; g.lineWidth = 18; g.lineCap = 'round'; const k = 34 * outBack(clamp(st.corner)); g.beginPath(); g.moveTo(cx - k, cy - k); g.lineTo(cx + k, cy + k); g.moveTo(cx + k, cy - k); g.lineTo(cx - k, cy + k); g.stroke(); g.restore(); }
  // measured points
  (st.meas ?? []).forEach((a, i) => { if (a <= 0) return; const [x, y] = cpt(...MEAS[i]); g.save(); g.globalAlpha = clamp(a); g.fillStyle = '#ffb000'; g.strokeStyle = '#14163a'; g.lineWidth = 5; g.beginPath(); g.arc(x, y, 18 * outBack(clamp(a)), 0, Math.PI * 2); g.fill(); g.stroke(); g.restore(); });
  // operating point
  if (st.dot) { const [x, y] = cpt(st.dot.s, st.dot.t); g.save(); g.globalAlpha = st.dot.a ?? 1; g.fillStyle = st.dot.col || '#ffb000'; g.shadowColor = st.dot.col || '#ffb000'; g.shadowBlur = 30; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0; g.strokeStyle = '#14163a'; g.lineWidth = 6; g.stroke();
    if (st.dot.x) { g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.beginPath(); g.moveTo(x - 13, y - 13); g.lineTo(x + 13, y + 13); g.moveTo(x + 13, y - 13); g.lineTo(x - 13, y + 13); g.stroke(); } g.restore(); }
  chartTex.needsUpdate = true; }
const along = (u) => ({ s: u, t: 1 - u });   // a point on the real limit line

// ------------------------------------------------------------------ CTA sign (Media Diet identity only)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, 1024, 300); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.0, FY, 1.1);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const U = (id, t) => prog(t, sh(id).in, sh(id).out, (x) => x);
const SHOTS = {
  S1: (t) => { const u = U('S1', t); return SH(L3([3.3, 1.35, 5.2], [3.05, 1.3, 4.9], u), L3([-0.45, 0.86, 0], [0.15, 0.9, 0], u), 42); },
  S2: (t) => { const u = U('S2', t); return SH(L3([1.15, 1.02, 1.9], [1.05, 0.98, 1.75], u), V3(0.0, 0.2, 0.0), 40); },
  S3: (t) => { const u = U('S3', t); return SH(L3([3.3, 1.4, 4.95], [3.15, 1.35, 4.75], u), L3([-0.1, 0.76, 0], [0.25, 0.76, 0], u), 42); },
  S4: (t) => { const u = U('S4', t); return SH(L3([0.3, 1.0, 5.5], [0.25, 0.98, 5.25], u), V3(0.0, 0.84, 0), 42); },
  S5: (t) => { const u = U('S5', t); return SH(L3([-1.0, 1.05, 5.3], [-0.9, 1.0, 5.1], u), V3(0.0, 0.84, 0), 42); },
  S6: (t) => { const u = U('S6', t); return SH(L3([2.6, 3.4, 4.6], [3.0, 4.2, 5.4], u), V3(0, 0.1, 0), 42); },
  S7: (t) => { const u = U('S7', t); return SH(L3([1.0, 1.0, 5.3], [0.85, 0.98, 5.1], u), V3(0.02, 0.84, 0), 42); },
  S8: (t) => { const u = U('S8', t); return SH(L3([1.4, 1.2, 6.1], [1.25, 1.15, 5.85], u), V3(0.38, 0.8, 0.15), 42); },
  S9: (t) => { const u = U('S9', t); return SH(L3([3.55, 1.4, 5.4], [3.35, 1.35, 5.2], u), L3([-0.4, 0.76, 0.05], [0.35, 0.76, 0.15], u), 42); },
  S10: (t) => { const u = U('S10', t); return SH(L3([0.25, 1.7, 7.6], [0.2, 1.9, 8.0], u), L3([-0.1, 0.78, 0.5], [-0.1, 0.8, 0.45], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;
  labSet.visible = ['S1', 'S2', 'S3', 'S9', 'S10'].includes(id); fill.intensity = labSet.visible ? 1.25 : 0.35; simSet.visible = id === 'S6'; chartSet.visible = ['S4', 'S5', 'S7', 'S8'].includes(id); sign.visible = id === 'S10';
  bench.visible = id === 'S8';
  // robot
  setShell(id === 'S3' ? prog(t, E.shell, E.shell + 0.45) : 0);
  bot.legs.forEach((L) => { L.wheel.visible = true; if (L.foot) L.foot.visible = false; if (L.adapter) L.adapter.visible = true; L.wheel.position.y = 0; });
  if (id === 'S1') pose(bot, hookPose(t));
  if (id === 'S2') { pose(bot, { x: 0, a: 0.25, dist: 0 });   // the swap: foot lifts away, adapter + scooter rim slide onto the ankle actuator
    const off = prog(t, E.footOff, E.footOff + 0.45), on = prog(t, E.rimOn, E.rimOn + 0.5, outBack);
    bot.legs.forEach((L) => { L.foot.visible = off < 0.98; L.foot.position.set(0.04 - 0.55 * off, -WR + 0.03 - 0.06 * off, 0); L.foot.rotation.z = 0.5 * off; L.foot.scale.setScalar(Math.max(0.01, 1 - 0.6 * off));
      L.wheel.visible = on > 0.01; L.wheel.position.z = L.s * (0.06 + 0.28 * (1 - clamp(on))); L.adapter.visible = t > E.footOff + 0.2; L.adapter.scale.setScalar(Math.max(0.01, prog(t, E.footOff + 0.2, E.footOff + 0.5, outBack))); });
    bot.root.position.y = FY + WR + 0.12 * (1 - prog(t, E.rimOn + 0.3, E.rimOn + 0.8)) * (t > E.footOff ? 1 : prog(t, 3.7, E.footOff)); }
  if (id === 'S3') { const x = -0.45 + 0.85 * prog(t, E.launch3, 8.5, (u) => u * u); const acc = prog(t, E.launch3, E.launch3 + 0.3) * (1 - prog(t, 8.2, 8.5)); pose(bot, { x, a: 0.24, dist: x, lean: 0.16 * acc, arm: 0.15 - 0.3 * acc });
    bot.acts.forEach((a, i) => { a.material.emissiveIntensity = prog(t, E.glow + i * 0.07, E.glow + i * 0.07 + 0.25) * (0.7 + 0.9 * acc + 0.15 * Math.sin(t * 18 + i)); }); }
  if (id === 'S9') { const x = -0.9 + 1.5 * prog(t, 22.2, 24.6, (u) => 1 - (1 - u) * (1 - u)); const z = 0.45 * ease(prog(t, E.dash, E.dash + 0.55)) - 0.45 * ease(prog(t, E.dash + 0.7, E.dash + 1.25));
    const st = prog(t, E.stop9 - 0.25, E.stop9 + 0.2); pose(bot, { x, z, dist: x + Math.abs(z), a: 0.2 + 0.15 * (prog(t, E.dash, E.dash + 0.2) - prog(t, E.dash + 1.1, E.dash + 1.3)) + 0.12 * st * (1 - prog(t, E.stop9 + 0.3, E.stop9 + 0.8)), head: 0.35 * Math.sin(Math.PI * prog(t, E.dash, E.dash + 1.25)), lean: 0.12 * prog(t, 22.2, 22.6) * (1 - prog(t, 22.7, 23.2)) - 0.18 * st * (1 - prog(t, E.stop9 + 0.3, E.stop9 + 0.7)) }); }
  if (id === 'S10') pose(bot, { x: -1.0, z: 0.1, a: 0.2, head: 0.6 });
  // simulation grid
  if (id === 'S6') ghosts.forEach((G) => { const s = prog(t, E.sim + G.k * 1.0, E.sim + G.k * 1.0 + 0.3, outBack); G.g.root.visible = s > 0.01; const x = G.x - 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2.2 + G.ph));
    pose(G.g, { x, z: G.z, a: 0.22, dist: x / 0.55, lean: 0.15 * Math.cos(t * 2.2 + G.ph) }); G.g.root.position.y = DESK + 0.03 + WR * 0.55; G.g.root.scale.setScalar(0.55 * Math.max(0.01, s)); });
  // chart states
  if (chartSet.visible) { let st = {};
    if (id === 'S4') st = { axes: prog(t, E.axes - 0.1, E.axes + 0.3), line: prog(t, E.line, E.line + 0.7), fill: prog(t, E.line + 0.6, E.line + 1.0), corner: prog(t, E.corner, E.corner + 0.35) };
    if (id === 'S5') { const u = t < E.turn ? lerp(0.0, 0.06, prog(t, E.launch - 0.1, E.launch + 0.25)) : t < E.stop ? lerp(0.06, 0.48, prog(t, E.turn - 0.1, E.turn + 0.35)) : lerp(0.48, 0.8, prog(t, E.stop - 0.1, E.stop + 0.35));
      const inside = 0.25 * (1 - prog(t, E.launch - 0.1, E.launch + 0.2)); const p = along(u); st = { line: 1, fill: 1, corner: 0, dot: { s: p.s * (1 - inside), t: p.t * (1 - inside) + 0.0, a: prog(t, 11.0, 11.2), col: t > E.limit ? '#ff5a2b' : '#ffb000' }, lineCol: t > E.limit ? '#d61f69' : '#552dbc' }; }
    if (id === 'S7') { const real = prog(t, E.real, E.real + 0.45); const dp = prog(t, E.dotIn - 0.1, E.dotIn + 0.5);
      st = { ideal: prog(t, E.ideal - 0.15, E.ideal + 0.25) * (1 - 0.65 * real), line: real, fill: real, dot: { s: lerp(0.2, 0.86, dp), t: lerp(0.3, 0.86, dp), a: prog(t, 15.7, 15.95), col: real > 0.6 ? '#ff2d55' : '#ffb000', x: real > 0.8 } }; }
    if (id === 'S8') { const snap = prog(t, E.snap, E.snap + 0.6); st = { ideal: 1 - prog(t, E.snap + 0.55, E.snap + 0.9) * 0.0, morph: snap, line: prog(t, E.snap + 0.3, E.snap + 0.7), fill: 0, lineCol: '#1a7f4b', meas: MEAS.map((_, i) => prog(t, E.meas + 0.1 + i * 0.13, E.meas + 0.35 + i * 0.13)) };
      fly.rotation.x = t * 14; }
    drawChart(st); }
  const sgu = prog(t, E.sign, E.sign + 0.45, outBack); sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(sgu, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}

// ------------------------------------------------------------------ 2-D overlay: one large, brief label at a time (never in the caption band)
function chip(text, x, y, bg, o = {}) { og.save(); og.font = o.font || '700 30px "Space Grotesk"'; const w = og.measureText(text).width + 40, h = o.h || 52; const x0 = o.align === 'left' ? x : x - w / 2; og.globalAlpha = o.alpha ?? 1; og.fillStyle = bg; rr(og, x0, y - h / 2, w, h, h / 2); og.fill(); og.restore();
  otext(text, x0 + w / 2, y + (o.dy ?? 11), { font: o.font || '700 30px "Space Grotesk"', alpha: o.alpha ?? 1, shadow: 0, kind: o.kind || 'label', color: o.color }); }
function big(text, y, a, bg, o = {}) { if (a <= 0.01) return; let fs = o.size || 78; og.save(); og.font = `700 ${fs}px "Space Grotesk"`; const w = og.measureText(text).width; og.restore();
  if (w > 720) fs = Math.floor(fs * 720 / w); const yy = y + (1 - outC(clamp(a))) * 18;   // keep every label inside x 100–900
  chip(text, o.x ?? 540, yy, bg, { font: `700 ${fs}px "Space Grotesk"`, h: Math.round(fs * 1.42), alpha: clamp(a), dy: Math.round(fs * 0.36), color: o.color }); }
const win = (t, a, b, f = 0.25) => prog(t, a, a + f) * (1 - prog(t, b - 0.12, b));
const C = { teal: 'rgba(18,122,143,0.94)', red: 'rgba(196,40,74,0.94)', gold: 'rgba(176,112,0,0.95)', green: 'rgba(26,127,75,0.95)', violet: 'rgba(85,45,188,0.94)', navy: 'rgba(13,18,64,0.82)' };
function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = []; const id = shot.id;
  const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  if (id === 'S1') { chip('Boston Dynamics · Atlas on a Roll · 9 Nov 2026', 540, 1372, 'rgba(254,64,146,0.92)', { font: '700 28px "Space Grotesk"', alpha: prog(t, 0.4, 0.7) });
    chip('editorial reconstruction', 540, 1446, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, 0.2, 0.5), dy: 9 }); }
  if (id === 'S2') big('scooter rim + 1 adapter', 1360, prog(t, E.labRim, E.labRim + 0.25), C.violet, { size: 64 });
  if (id === 'S3') big('test rig, not a product', 1330, prog(t, E.labTest, E.labTest + 0.25), C.teal, { size: 64 });
  if (id === 'S4') big('not both at once', 1395, prog(t, E.labNot, E.labNot + 0.25), C.red);
  if (id === 'S5') { big('LAUNCH', 1395, win(t, E.launch, E.turn), C.gold, { size: 88 }); big('TURN', 1395, win(t, E.turn, E.stop), C.gold, { size: 88 }); big('STOP', 1395, prog(t, E.stop, E.stop + 0.25), C.red, { size: 88 }); }
  if (id === 'S6') big('SIMULATION', 1330, prog(t, E.labSim, E.labSim + 0.25), C.teal, { size: 84 });
  if (id === 'S7') { big('ideal motor', 1395, win(t, E.ideal, E.labImp), C.teal); big('impossible move', 1395, prog(t, E.labImp, E.labImp + 0.25), C.red); }
  if (id === 'S8') { big('MEASURED', 1395, win(t, E.meas, E.labMatch), C.gold, { size: 84 }); big('sim = real', 1395, prog(t, E.labMatch, E.labMatch + 0.25), C.green, { size: 84 }); }
  if (id === 'S9') big('honest motor model', 1330, prog(t, E.labModel, E.labModel + 0.25), C.green, { size: 68 });
  captions(t);
}

// printed cards that glow get their own print as the emissive map (a flat white glow washes them out)
scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
// separate vertical thumbnail tied to the hook: the robot mid-spin on its wheels + 2 large words ("WHY WHEELS?")
window.renderThumb = async () => { const t = 2.15; update(t);
  camera.position.set(2.75, 0.55, 3.9); camera.up.set(0, 1, 0); camera.fov = 42; camera.updateProjectionMatrix(); camera.lookAt(V3(-0.05, 1.5, 0)); bokeh.uniforms.focus.value = camera.position.distanceTo(V3(0.0, 1.0, 0)); composer.render();
  og.clearRect(0, 0, W, H); TEXTLOG = []; const v = og.createLinearGradient(0, 0, 0, H); v.addColorStop(0, 'rgba(4,5,26,0.55)'); v.addColorStop(0.45, 'rgba(4,5,26,0.08)'); v.addColorStop(1, 'rgba(4,5,26,0.35)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  const fit = (txt, size) => { og.font = `700 ${size}px "Space Grotesk"`; const w = og.measureText(txt).width; return w > 700 ? Math.floor(size * 700 / w) : size; };
  const f1 = fit('WHY', 230), f2 = fit('WHEELS?', 200);
  otext('WHY', 540, 400, { font: `700 ${f1}px "Space Grotesk"`, color: '#ffd23f', shadow: 30, kind: 'thumb' });
  otext('WHEELS?', 540, 400 + f2 * 1.05, { font: `700 ${f2}px "Space Grotesk"`, color: '#f6f4ff', shadow: 30, kind: 'thumb' });
  chip('editorial reconstruction', 540, 612, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, dy: 9 }); return TEXTLOG; };
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
