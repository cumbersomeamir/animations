// Media Diet · 30 s English episode 23 — "Kicked flat. How does it get up?" ReLoco (arXiv 2611.23916, 18 Nov 2026): one learned policy
// gets a 64.5 kg Tiangong 3.0 humanoid back up after kicks. Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the
// accepted english-12…22 builds: a paper miniature in Media Diet brand colours with real cast shadows, one camera set-up per beat, restrained
// depth of field. New setting: an outdoor paper test lawn + a holographic simulation pad. The robot is a generic illustrative reconstruction
// (not a replica); its centre of mass is computed from an illustrative mass split, contact forces from 2-D statics. Deterministic: window.render(f).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

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
  const c = CUES.find((q) => t >= q.in && t < q.out); if (!c) return; const a = c.hook ? 1 : clamp((t - c.in) / 0.1);
  if (c.hook) { og.save(); og.font = '700 100px "Space Grotesk"'; const hw = Math.max(...c.lines.map((l) => og.measureText(l).width)); og.restore(); const hf = hw > 690 ? Math.floor(100 * 690 / hw) : 100;   // the hook question, full size from frame 0
    const gr0 = og.createLinearGradient(0, 270, 0, 590); gr0.addColorStop(0, 'rgba(4,6,30,0)'); gr0.addColorStop(0.3, 'rgba(4,6,30,0.55)'); gr0.addColorStop(0.75, 'rgba(4,6,30,0.55)'); gr0.addColorStop(1, 'rgba(4,6,30,0)'); og.fillStyle = gr0; og.fillRect(0, 270, W, 320);
    c.lines.forEach((l, i) => otext(l, 540, 412 + i * Math.round(hf * 1.02), { kind: 'caption', font: `700 ${hf}px "Space Grotesk"`, color: i ? '#f6f4ff' : '#ffd23f', shadow: 18 })); return; }
  const gr = og.createLinearGradient(0, 300, 0, 560); gr.addColorStop(0, 'rgba(4,6,30,0)'); gr.addColorStop(0.3, 'rgba(4,6,30,0.5)'); gr.addColorStop(0.75, 'rgba(4,6,30,0.5)'); gr.addColorStop(1, 'rgba(4,6,30,0)');
  og.save(); og.globalAlpha = a; og.fillStyle = gr; og.fillRect(0, 300, W, 260); og.font = CAPF; const mw = Math.max(...c.lines.map((l) => og.measureText(l).width)); og.restore();
  const font = mw > 700 ? `700 ${Math.floor(50 * 700 / mw)}px "Space Grotesk"` : CAPF;   // centred at x 540, so ≤ 700 px keeps every caption inside x 100–900
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
const sh = (id) => TL.shots.find((s) => s.id === id);
const fill = new THREE.DirectionalLight('#ffe6cc', 1.0); fill.position.set(4, 6, 9); scene.add(fill);   // soft front fill, no shadows
const CYAN = '#2addfa', GREEN = '#3ddc84', AMBER = '#ffb21f', GOLD = '#ffd23f', RED = '#ff4d6d';
const glowMat = (col, op = 1) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending });
const G0 = DESK + 0.03;                 // top of the grass test pad = robot ground
const RX = -0.45;                       // robot root x on the grass (it falls toward +x)
const smooth = (u) => u * u * (3 - 2 * u);
let rs = 11; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);

// ------------------------------------------------------------------ outdoor test lawn (layered paper) + trees for depth
const lawn = new THREE.Group(); scene.add(lawn);
{ const a = card(3.6, 0.03, 2.9, '#2f8f5b', '#bfe8c9'); a.position.set(0.1, DESK + 0.015, 0.15); lawn.add(a);
  const b = card(3.8, 0.012, 3.1, '#1f6b44', P.edge); b.position.set(0.1, DESK + 0.006, 0.15); lawn.add(b); }
const tufts = new THREE.InstancedMesh(new THREE.ConeGeometry(0.016, 0.085, 5), paper('#4fbf78'), 420); tufts.castShadow = true; lawn.add(tufts);
{ const m = new THREE.Matrix4(); let n = 0;
  while (n < 420) { const x = -1.6 + rnd() * 3.4, z = -1.25 + rnd() * 2.75; if (Math.abs(z) < 0.42 && x > -1.05 && x < 1.25) continue;
    const s = 0.6 + rnd() * 0.8; m.compose(V3(x, G0 + 0.04 * s, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd() - 0.5) * 0.5, rnd() * 3, (rnd() - 0.5) * 0.5)), V3(s, s, s)); tufts.setMatrixAt(n++, m); } }
function tree(x, z, s, c1, c2) { const g = new THREE.Group(); g.position.set(x, DESK, z); g.scale.setScalar(s); scene.add(g);
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.5, 10), paper('#7a5236')); tr.position.y = 0.25; tr.castShadow = true; g.add(tr);
  [[0.42, 0.55, 0.55, c1], [0.34, 0.45, 0.85, c2], [0.24, 0.36, 1.1, c1]].forEach(([r, h, y, c]) => { const k = new THREE.Mesh(new THREE.ConeGeometry(r, h, 9), paper(c)); k.position.y = y; k.castShadow = true; k.receiveShadow = true; g.add(k); }); return g; }
const TREES = [[-1.9, -2.1, 1.25], [-0.95, -2.6, 1.0], [0.15, -2.3, 1.45], [1.25, -2.0, 1.1], [2.2, -2.5, 1.3], [-2.6, -1.4, 0.9], [2.9, -1.5, 0.95]].map(([x, z, s], i) => tree(x, z, s, i % 2 ? '#2d8a57' : '#3aa36a', i % 2 ? '#3aa36a' : '#2a7d50'));

// ------------------------------------------------------------------ the simulation pad (training world): dark floor, cyan grid, grid wall
const SIMX = 5.0;
const sim = new THREE.Group(); scene.add(sim); sim.position.set(SIMX, 0, 0);
{ const a = card(2.8, 0.03, 2.4, '#0b1238', '#2a3c8a'); a.position.set(0, DESK + 0.015, 0.1); sim.add(a);
  const gr = new THREE.GridHelper(2.6, 26, CYAN, '#1d6fa0'); gr.position.set(0, G0 + 0.003, 0.1); gr.material.transparent = true; gr.material.opacity = 0.7; sim.add(gr);
  const wt = canvasTex(512, 320, (g, w, h) => { g.fillStyle = '#0a1036'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(42,221,250,0.55)'; g.lineWidth = 2; for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.75), new THREE.MeshStandardMaterial({ map: wt, emissive: '#ffffff', emissiveMap: wt, emissiveIntensity: 0.55, roughness: 0.9 })); wall.position.set(0, G0 + 0.875, -1.0); sim.add(wall); }

// ------------------------------------------------------------------ the humanoid (generic paper reconstruction of a 1.70 m, 64.5 kg class robot; not a replica)
const LT = 0.25, LS = 0.25, TOR = 0.31, LUA = 0.17, LFA = 0.165;
function makeBot(holo) {
  const root = new THREE.Group(); scene.add(root);
  const shell = holo ? new THREE.MeshStandardMaterial({ color: '#8eeeff', emissive: '#1fb4d8', emissiveIntensity: 0.75, transparent: true, opacity: 0.62, roughness: 0.4 }) : paper(P.white);
  const dark = holo ? new THREE.MeshStandardMaterial({ color: '#4fd0f0', emissive: '#1890b8', emissiveIntensity: 0.7, transparent: true, opacity: 0.6 }) : paper('#2b2f5e');
  const joint = holo ? dark : paper(P.violet);
  const acc = new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: holo ? 1.2 : 0.9 });
  const mk = (w, h, d, mat, r = 0.018) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat); m.castShadow = !holo; m.receiveShadow = !holo; root.add(m); return m; };
  const ball = (r, mat) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), mat); m.castShadow = !holo; root.add(m); return m; };
  const B = { root, holo, mats: [shell, dark, acc] };
  B.pelvis = mk(0.12, 0.1, 0.22, dark, 0.03); B.torso = mk(0.15, 0.25, 0.27, shell, 0.05); B.chest = mk(0.014, 0.1, 0.13, acc, 0.006);
  B.neck = mk(0.05, 0.06, 0.05, dark, 0.012); B.head = mk(0.12, 0.13, 0.12, shell, 0.045);
  B.visor = mk(0.014, 0.045, 0.095, holo ? acc : new THREE.MeshStandardMaterial({ color: '#0d1240', roughness: 0.25, metalness: 0.3, emissive: CYAN, emissiveIntensity: 0.35 }), 0.007);
  B.side = [-1, 1].map((s) => ({ s, thigh: mk(0.09, LT, 0.09, shell, 0.035), shin: mk(0.075, LS, 0.075, dark, 0.03), foot: mk(0.17, 0.045, 0.085, shell, 0.018),
    knee: ball(0.046, joint), hipJ: ball(0.05, joint), uarm: mk(0.062, LUA, 0.062, shell, 0.026), farm: mk(0.055, 0.13, 0.055, dark, 0.022), hand: mk(0.05, 0.065, 0.055, shell, 0.02),
    shJ: ball(0.05, joint), elb: ball(0.039, joint) }));
  return B;
}
function ik(A, T, l1, l2, s) { const dx = T[0] - A[0], dy = T[1] - A[1]; const d = Math.hypot(dx, dy) || 1e-6; const ux = dx / d, uy = dy / d;
  const dc = clamp(d, Math.abs(l1 - l2) + 0.02, l1 + l2 - 1e-4); const a = s * Math.acos(clamp((l1 * l1 + dc * dc - l2 * l2) / (2 * l1 * dc), -1, 1));
  return { J: [A[0] + l1 * (ux * Math.cos(a) - uy * Math.sin(a)), A[1] + l1 * (ux * Math.sin(a) + uy * Math.cos(a))], E: [A[0] + ux * dc, A[1] + uy * dc], reach: d <= l1 + l2 + 0.004 }; }
const segAt = (m, A, B, z, k0 = 0.5) => { const dx = B[0] - A[0], dy = B[1] - A[1]; m.position.set(A[0] + dx * k0, A[1] + dy * k0, z); m.rotation.set(0, 0, Math.atan2(dy, dx) - Math.PI / 2); };
const MASS = { torso: 22, head: 4, pelvis: 8, thigh: 6.5, shin: 4, foot: 1.2, uarm: 2.2, farm: 1.6 };   // ≈ 65 kg (illustrative split)
// pose Q: p = pelvis [x,y], t = torso pitch from vertical (+ = leaning forward), f / fL,fR = ankle targets, h / hL,hR = hand targets, ff = foot flatness (1 flat, 0 toes)
function poseBot(B, Q) {
  const [px, py] = Q.p, t = Q.t; const td = [Math.sin(t), Math.cos(t)], fr = [Math.cos(t), -Math.sin(t)];
  const hip = [px, py], sho = [px + TOR * td[0], py + TOR * td[1]], hc = [sho[0] + 0.115 * td[0], sho[1] + 0.115 * td[1]];
  const at = (P0, k, f = 0) => [P0[0] + k * td[0] + f * fr[0], P0[1] + k * td[1] + f * fr[1]];
  const rot = -t; const put = (m, P0, z = 0) => { m.position.set(P0[0], P0[1], z); m.rotation.set(0, 0, rot); };
  put(B.pelvis, at(hip, 0.01)); const tc = at(hip, 0.185); put(B.torso, tc); put(B.chest, at(hip, 0.2, 0.077)); put(B.neck, at(sho, 0.035)); put(B.head, hc); put(B.visor, at(hc, 0.012, 0.061));
  let cx = MASS.torso * tc[0] + MASS.head * hc[0] + MASS.pelvis * hip[0], cy = MASS.torso * tc[1] + MASS.head * hc[1] + MASS.pelvis * hip[1], M = MASS.torso + MASS.head + MASS.pelvis;
  const add = (P0, m) => { cx += m * P0[0]; cy += m * P0[1]; M += m; };
  const out = { feet: [], hands: [], hip, sho, hc };
  B.side.forEach((S) => { const L = S.s < 0; const zl = S.s * 0.065, za = S.s * 0.155;
    const f = (L ? Q.fL : Q.fR) || Q.f, h = (L ? Q.hL : Q.hR) || Q.h;
    const leg = ik(hip, f, LT, LS, 1); segAt(S.thigh, hip, leg.J, zl); segAt(S.shin, leg.J, leg.E, zl); S.hipJ.position.set(hip[0], hip[1], zl); S.knee.position.set(leg.J[0], leg.J[1], zl);
    const sd = [leg.E[0] - leg.J[0], leg.E[1] - leg.J[1]]; const sl = Math.hypot(...sd) || 1; const perp = [-sd[1] / sl, sd[0] / sl]; const ff = Q.ff ?? 1;
    let dir = [lerp(perp[0], 1, ff), lerp(perp[1], 0, ff)]; const dl = Math.hypot(...dir) || 1; dir = [dir[0] / dl, dir[1] / dl]; const down = [dir[1], -dir[0]];
    const fc = [leg.E[0] + dir[0] * 0.045 + down[0] * 0.022, leg.E[1] + dir[1] * 0.045 + down[1] * 0.022]; S.foot.position.set(fc[0], fc[1], zl); S.foot.rotation.set(0, 0, Math.atan2(dir[1], dir[0]));
    const heel = [fc[0] - dir[0] * 0.085 + down[0] * 0.022, fc[1] - dir[1] * 0.085 + down[1] * 0.022], toe = [fc[0] + dir[0] * 0.085 + down[0] * 0.022, fc[1] + dir[1] * 0.085 + down[1] * 0.022];
    out.feet.push({ heel, toe, z: zl, ground: Math.min(heel[1], toe[1]) < 0.02 });
    const arm = ik(sho, h, LUA, LFA, -1); segAt(S.uarm, sho, arm.J, za); const ad = [arm.E[0] - arm.J[0], arm.E[1] - arm.J[1]]; const al = Math.hypot(...ad) || 1;
    const hcn = [arm.J[0] + ad[0] / al * LFA, arm.J[1] + ad[1] / al * LFA]; segAt(S.farm, arm.J, hcn, za, 0.42); S.hand.position.set(hcn[0], hcn[1], za); S.hand.rotation.set(0, 0, Math.atan2(ad[1], ad[0]) - Math.PI / 2);
    S.shJ.position.set(sho[0], sho[1], za); S.elb.position.set(arm.J[0], arm.J[1], za);
    out.hands.push({ c: hcn, z: za, ground: arm.reach && hcn[1] < 0.045 });
    add([(hip[0] + leg.J[0]) / 2, (hip[1] + leg.J[1]) / 2], MASS.thigh); add([(leg.J[0] + leg.E[0]) / 2, (leg.J[1] + leg.E[1]) / 2], MASS.shin); add(fc, MASS.foot);
    add([(sho[0] + arm.J[0]) / 2, (sho[1] + arm.J[1]) / 2], MASS.uarm); add([(arm.J[0] + hcn[0]) / 2, (arm.J[1] + hcn[1]) / 2], MASS.farm); });
  out.com = [cx / M, cy / M]; return out;
}
const bot = makeBot(false), ghost = makeBot(true);
const mixQ = (A, B2, u) => { const o = { p: [lerp(A.p[0], B2.p[0], u), lerp(A.p[1], B2.p[1], u)], t: lerp(A.t, B2.t, u), ff: lerp(A.ff ?? 1, B2.ff ?? 1, u) };
  for (const k of ['f', 'h', 'fL', 'fR', 'hL', 'hR']) { const a = A[k] || A[k[0]], b = B2[k] || B2[k[0]]; if (a && b) o[k] = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; } return o; };
// key poses (robot-local metres/1.65; ground y = 0)
const K = {
  STAND0: { p: [0.01, 0.535], t: 0.0, f: [0.0, 0.045], h: [0.035, 0.515], ff: 1 },
  PRONE: { p: [0.5, 0.078], t: Math.PI / 2, f: [0.0, 0.12], h: [0.74, 0.03], ff: 0 },
  PLANK: { p: [0.47, 0.21], t: 1.26, f: [0.0, 0.12], h: [0.74, 0.03], ff: 0 },
  FROG: { p: [0.38, 0.26], t: 1.4, f: [0.28, 0.045], h: [0.74, 0.03], ff: 1 },
  SHIFT: { p: [0.22, 0.21], t: 1.3, f: [0.28, 0.045], h: [0.74, 0.03], ff: 1 },
  UP: { p: [0.22, 0.25], t: 0.95, f: [0.28, 0.045], h: [0.6, 0.3], ff: 1 },
  STAND: { p: [0.29, 0.535], t: 0.02, f: [0.28, 0.045], h: [0.315, 0.515], ff: 1 },
};
const GU = [[0, 'PRONE'], [0.55, 'PLANK'], [1.1, 'FROG'], [2.45, 'SHIFT'], [2.7, 'SHIFT'], [3.1, 'UP'], [3.75, 'STAND']];   // seconds from the first push
function getUp(s) { if (s <= 0) return K.PRONE; for (let i = 1; i < GU.length; i++) { const [t1, k1] = GU[i], [t0, k0] = GU[i - 1]; if (s <= t1) { const u = ease((s - t0) / (t1 - t0)); const q = mixQ(K[k0], K[k1], u);
  if (k0 === 'PLANK' && k1 === 'FROG') { q.f = [q.f[0], q.f[1] + 0.09 * Math.sin(Math.PI * u)]; q.p = [q.p[0], q.p[1] + 0.05 * Math.sin(Math.PI * u)]; } return q; } } return K.STAND; }
function fallPose(u) { const ph = (Math.PI / 2) * Math.pow(clamp(u), 1.6); const k = ph / (Math.PI / 2);
  const p = [0.5 * Math.sin(ph) + 0.03 * Math.sin(Math.PI * Math.min(1, u * 3)), 0.045 + 0.5 * Math.cos(ph) + 0.033 * Math.sin(ph)];
  const t = ph + 0.12 * Math.sin(2 * ph); const sho = [p[0] + TOR * Math.sin(t), p[1] + TOR * Math.cos(t)];
  const hang = [sho[0] + 0.12, sho[1] - 0.3]; const hk = smooth(clamp((k - 0.35) / 0.65));
  return { p, t, f: [0, lerp(0.045, 0.12, k)], h: [lerp(hang[0], 0.74, hk), lerp(hang[1], 0.03, hk)], ff: 1 - k }; }
const WALK = { L: 0.19 };
function walkPose(d, x0) { const L = WALK.L; const Q = { p: [x0 + d, 0.525 + 0.008 * Math.cos(2 * Math.PI * d / L)], t: 0.06, ff: 1 };
  [['fL', 0], ['fR', 0.5]].forEach(([key, off]) => { const ph = d / (2 * L) + off; const c = Math.floor(ph), fr = ph - c; const xs = (cc) => x0 + (cc + 0.3 - off) * 2 * L;
    if (fr < 0.6) Q[key] = [xs(c), 0.045]; else { const u = (fr - 0.6) / 0.4; Q[key] = [lerp(xs(c), xs(c + 1), ease(u)), 0.045 + 0.07 * Math.sin(Math.PI * u)]; } });
  const sw = Math.sin(Math.PI * d / L); const sx = x0 + d + TOR * Math.sin(0.06); Q.hL = [sx + 0.09 * sw, 0.53]; Q.hR = [sx - 0.09 * sw, 0.53]; return Q; }

// ------------------------------------------------------------------ physics overlays: centre of mass, plumb line, support patch, contact-force arrows
const comTex = canvasTex(128, 128, (g) => { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 64, 62, 0, Math.PI * 2); g.fill(); g.fillStyle = '#0d1240'; g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.fill();
  g.fillStyle = GOLD; [[0, 0.5], [1, 1.5]].forEach(([a, b]) => { g.beginPath(); g.moveTo(64, 64); g.arc(64, 64, 52, a * Math.PI, b * Math.PI); g.closePath(); g.fill(); }); });
const comSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: comTex, depthTest: false, transparent: true })); comSp.scale.set(0.085, 0.085, 1); comSp.renderOrder = 14; scene.add(comSp);
const comGlow = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), glowMat(GOLD, 0.35)); comGlow.renderOrder = 13; comGlow.material.depthTest = false; scene.add(comGlow);
const plumbMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, depthTest: false }); const plumb = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 1, 8), plumbMat); plumb.renderOrder = 12; scene.add(plumb);
const dotMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.95, depthTest: false, side: THREE.DoubleSide }); const pDot = new THREE.Mesh(new THREE.RingGeometry(0.022, 0.042, 28), dotMat); pDot.rotation.x = -Math.PI / 2; pDot.renderOrder = 12; scene.add(pDot);
const polyGeo = new THREE.BufferGeometry(); polyGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3)); polyGeo.setIndex([0, 1, 2, 0, 2, 3]);
const polyMat = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }); const poly = new THREE.Mesh(polyGeo, polyMat); poly.renderOrder = 6; scene.add(poly);
const polyEdge = new THREE.LineLoop(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3)), new THREE.LineBasicMaterial({ color: '#b6ffd0', transparent: true, opacity: 0.95 })); polyEdge.renderOrder = 7; scene.add(polyEdge);
function setPoly(pts, col, op) { const a = polyGeo.attributes.position, b = polyEdge.geometry.attributes.position; pts.forEach((p, i) => { a.setXYZ(i, p.x, p.y, p.z); b.setXYZ(i, p.x, p.y + 0.001, p.z); }); a.needsUpdate = b.needsUpdate = true; polyGeo.computeBoundingSphere(); polyEdge.geometry.computeBoundingSphere();
  polyMat.color.set(col); polyMat.opacity = 0.42 * op; polyEdge.material.opacity = 0.95 * op; poly.visible = polyEdge.visible = op > 0.01; }
const handArrows = [makeArrow(CYAN, 0.015), makeArrow(CYAN, 0.015)], footArrows = [makeArrow(GREEN, 0.015), makeArrow(GREEN, 0.015)];
const W_N = 64.5 * 9.81;   // 633 N
const toW = (B, x, y, z) => B.root.localToWorld(V3(x, y, z));
let FORCE = { hands: 0, feet: W_N, on: false };
function physics(B, st, o) {   // o: {orb, plumb, patch:'feet'|'support', arrows, op}
  const op = o.op ?? 1; B.root.updateMatrixWorld(true);
  const c = toW(B, st.com[0], st.com[1], 0); comSp.visible = comGlow.visible = !!o.orb && op > 0.01; comSp.position.copy(c); comGlow.position.copy(c); comSp.material.opacity = op; comGlow.material.opacity = 0.35 * op * (0.8 + 0.2 * Math.sin(o.t * 6));
  const fx = st.feet.map((f) => [Math.min(f.heel[0], f.toe[0]), Math.max(f.heel[0], f.toe[0])]); const fMin = Math.min(...fx.map((a) => a[0])), fMax = Math.max(...fx.map((a) => a[1]));
  const hOn = st.hands.every((h) => h.ground); const hx = (st.hands[0].c[0] + st.hands[1].c[0]) / 2;
  let lo = fMin, hi = fMax; if (o.patch === 'support' && hOn) { lo = Math.min(lo, hx - 0.03); hi = Math.max(hi, hx + 0.03); }
  const pm = fMax - fMin < 0.06 ? 0.035 : 0;   // toes-only contact: draw a small patch around the toe line
  const inside = st.com[0] >= lo - 0.005 && st.com[0] <= hi + 0.005; const col = inside ? GREEN : RED;
  const g = toW(B, st.com[0], 0.004, 0); plumb.visible = pDot.visible = !!o.plumb && op > 0.01; const len = Math.max(0.001, c.y - g.y); plumb.position.set(c.x, (c.y + g.y) / 2, c.z); plumb.scale.set(1, len, 1); plumbMat.opacity = 0.9 * op;
  pDot.position.copy(g); dotMat.color.set(col); dotMat.opacity = 0.95 * op;
  if (o.patch) { const y = 0.006; const hz = o.patch === 'support' && hOn ? 0.19 : 0.115;
    const pts = o.patch === 'support' && hOn ? [toW(B, fMin - pm, y, -0.115), toW(B, fMin - pm, y, 0.115), toW(B, hx + 0.035, y, hz), toW(B, hx + 0.035, y, -hz)] : [toW(B, fMin - pm, y, -0.115), toW(B, fMin - pm, y, 0.115), toW(B, fMax + pm, y, 0.115), toW(B, fMax + pm, y, -0.115)];
    setPoly(pts, o.patchCol || col, op * (o.patchOp ?? 1)); } else setPoly([V3(0, 0, 0), V3(0, 0, 0), V3(0, 0, 0), V3(0, 0, 0)], GREEN, 0);
  // statics: hands must carry weight only while the CoM is ahead of the toes (outside the feet's support)
  const toeX = fMax; let Fh = 0; if (hOn && hx > toeX + 0.01) Fh = W_N * clamp((st.com[0] - toeX) / (hx - toeX)); const Ff = W_N - Fh; FORCE = { hands: Fh, feet: Ff, on: !!o.arrows };
  const s = 0.62 / W_N;   // arrow length per newton (each arrow = one hand or one foot)
  handArrows.forEach((a, i) => { const h = st.hands[i]; setArrow(a, toW(B, h.c[0], 0.006, h.z), V3(0, 1, 0), o.arrows && hOn ? s * Fh / 2 : 0, op); });
  footArrows.forEach((a, i) => { const f = st.feet[i]; const x = clamp(st.com[0], fx[i][0] + 0.02, fx[i][1] - 0.02); setArrow(a, toW(B, x, 0.006, f.z), V3(0, 1, 0), o.arrows ? s * Ff / 2 : 0, op); });
}
function hidePhysics() { comSp.visible = comGlow.visible = plumb.visible = pDot.visible = false; setPoly([V3(0, 0, 0), V3(0, 0, 0), V3(0, 0, 0), V3(0, 0, 0)], GREEN, 0); handArrows.concat(footArrows).forEach((a) => (a.visible = false)); FORCE.on = false; }

// ------------------------------------------------------------------ the kick (a generic paper boot on a swinging leg) + impact burst
const kicker = new THREE.Group(); scene.add(kicker); kicker.position.set(RX - 0.39, G0 + 1.3, 0.0);
{ const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.8, 18), paper('#2a3f8f')); leg.position.y = -0.4; leg.castShadow = true; kicker.add(leg);
  const boot = new THREE.Group(); boot.position.y = -0.82; kicker.add(boot);
  const up = new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.15, 0.12, 3, 0.035), paper('#f0e6d2')); up.position.set(0, 0.02, 0); up.castShadow = true; boot.add(up);
  const toe = new THREE.Mesh(new RoundedBoxGeometry(0.21, 0.085, 0.12, 3, 0.038), paper('#f0e6d2')); toe.position.set(0.06, -0.055, 0); toe.castShadow = true; boot.add(toe);
  const sole = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.026, 0.126, 2, 0.01), paper('#3a2a20')); sole.position.set(0.06, -0.1, 0); boot.add(sole); }
const BURST = Array.from({ length: 3 }, (_, i) => { const m = new THREE.Mesh(starGeo, glowMat(i ? '#ffffff' : GOLD, 0.9)); m.renderOrder = 9; scene.add(m); return m; });
const STREAK = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.008, 0.008), glowMat('#ffffff', 0.7)); scene.add(m); return m; });

// ------------------------------------------------------------------ training lift (simulation only): a cable + clamp on the head, an upward arrow
const liftCable = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1, 8), glowMat(GOLD, 0.9)); scene.add(liftCable);
const liftRing = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 10, 32), glowMat(GOLD, 0.9)); liftRing.rotation.x = Math.PI / 2; scene.add(liftRing);
const liftArrow = makeArrow(GOLD, 0.02);
const resetFlash = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.01, 40), glowMat(CYAN, 0.0)); scene.add(resetFlash);

// ------------------------------------------------------------------ hardware tally: 47 kicks as tiles (34 falls→get-ups, 5 no fall, 8 safety cut-outs) + stopwatch
const tileTex = (bg, glyph) => canvasTex(128, 128, (g) => { g.fillStyle = bg; rr(g, 4, 4, 120, 120, 22); g.fill(); g.strokeStyle = '#ffffff'; g.fillStyle = '#ffffff'; g.lineWidth = 14; g.lineCap = 'round'; g.lineJoin = 'round';
  if (glyph === 'check') { g.beginPath(); g.moveTo(34, 66); g.lineTo(56, 88); g.lineTo(96, 42); g.stroke(); } if (glyph === 'dash') { g.beginPath(); g.moveTo(38, 64); g.lineTo(90, 64); g.stroke(); }
  if (glyph === 'bang') { g.fillRect(56, 28, 16, 50); g.beginPath(); g.arc(64, 96, 9, 0, Math.PI * 2); g.fill(); } });
const TT = { back: tileTex('#6f74b8', ''), ok: tileTex('#1f9d5c', 'check'), none: tileTex('#8b8fa8', 'dash'), cut: tileTex('#d0344f', 'bang') };
const board = new THREE.Group(); scene.add(board); board.position.set(0.3, G0, -0.8); board.rotation.y = -0.2;
{ const bk = card(0.86, 0.86, 0.03, '#efecff', P.lav, 'z'); bk.position.set(0, 0.55, 0); board.add(bk); const lg = card(0.04, 0.14, 0.04, '#cfc8ff'); lg.position.set(-0.34, 0.07, 0); const lg2 = lg.clone(); lg2.position.x = 0.34; board.add(lg, lg2); }
const TILES = Array.from({ length: 47 }, (_, i) => { const kind = i < 34 ? 'ok' : i < 39 ? 'none' : 'cut'; const g = new THREE.Group(); const c = i % 7, r = Math.floor(i / 7);
  g.position.set(-0.33 + c * 0.11, 0.9 - r * 0.11, 0.02); board.add(g);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(0.095, 0.095), new THREE.MeshStandardMaterial({ map: TT[kind], roughness: 0.8 })); front.position.z = 0.004; g.add(front);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(0.095, 0.095), new THREE.MeshStandardMaterial({ map: TT.back, roughness: 0.8 })); back.rotation.y = Math.PI; back.position.z = 0.002; g.add(back);
  return { g, kind, i }; });
const watch = new THREE.Group(); scene.add(watch); board.add(watch); watch.position.set(0.36, 0.72, 0.06); watch.rotation.set(0, 0, 0); watch.scale.setScalar(0.85);
{ const body = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 40), paper(P.violet)); body.rotation.x = Math.PI / 2; body.position.y = 0.2; body.castShadow = true; watch.add(body);
  const ft = canvasTex(256, 256, (g) => { g.fillStyle = '#f3f1ff'; g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill(); g.fillStyle = '#14163a'; g.textAlign = 'center'; g.font = '700 70px "Space Grotesk"'; g.fillText('2.64 s', 128, 140); g.font = '700 25px "Space Grotesk"'; g.fillText('mean get-up', 128, 184); g.fillStyle = '#552dbc'; g.fillRect(124, 22, 8, 30); });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.135, 40), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.85 })); face.position.set(0, 0.2, 0.027); watch.add(face);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 14), paper(P.lav)); crown.position.set(0, 0.375, 0); watch.add(crown);
  }

// ------------------------------------------------------------------ payoff prop: a "kick force" meter whose needle has no value (force not measured)
const meter = new THREE.Group(); scene.add(meter); meter.position.set(0.78, G0, -0.85); meter.rotation.y = -0.4;
{ const mt = canvasTex(512, 300, (g) => { g.fillStyle = '#f3f1ff'; g.beginPath(); g.moveTo(16, 280); g.arc(256, 280, 240, Math.PI, 0); g.closePath(); g.fill();
    const gr = g.createLinearGradient(40, 0, 472, 0); gr.addColorStop(0, '#3ddc84'); gr.addColorStop(0.5, '#ffb21f'); gr.addColorStop(1, '#ff4d6d'); g.strokeStyle = gr; g.lineWidth = 34; g.beginPath(); g.arc(256, 280, 190, Math.PI * 1.04, Math.PI * 1.96); g.stroke();
    g.fillStyle = '#14163a'; g.textAlign = 'center'; g.font = '700 40px "Space Grotesk"'; g.fillText('KICK FORCE', 256, 200); g.font = '700 92px "Space Grotesk"'; g.fillStyle = '#d0344f'; g.fillText('?', 256, 276); });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.4), new THREE.MeshStandardMaterial({ map: mt, transparent: true, roughness: 0.85 })); face.position.set(0, 0.86, 0.02); meter.add(face);
  const back = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 40, 1, false, -Math.PI / 2, Math.PI), paper(P.violet)); back.rotation.x = Math.PI / 2; back.position.set(0, 0.68, 0.0); meter.add(back);
  const post = card(0.05, 0.68, 0.05, '#cfc8ff'); post.position.set(0, 0.34, -0.02); meter.add(post); const base = card(0.3, 0.03, 0.2, '#cfc8ff'); base.position.set(0, 0.015, 0); meter.add(base); }
const needle = new THREE.Group(); needle.position.set(0, 0.68, 0.035); meter.add(needle);
{ const n = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.27, 0.01), new THREE.MeshStandardMaterial({ color: '#14163a' })); n.position.y = 0.135; needle.add(n); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 16), paper(P.magenta)); hub.rotation.x = Math.PI / 2; needle.add(hub); }

// ------------------------------------------------------------------ CTA sign (Media Diet identity only)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, 1024, 300); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot2 = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot2.position.set(0, 0.015, 0.2); sign.add(foot2); }
sign.position.set(0, G0 + 0.0, 1.15);

// ------------------------------------------------------------------ camera shots
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const U = (id, t) => prog(t, sh(id).in, sh(id).out, (x) => x);
let WALKX = 0;
const SHOTS = {
  S1: (t) => { const u = U('S1', t); return SH(L3([1.55, G0 + 0.45, 1.25], [1.47, G0 + 0.44, 1.17], u), V3(0.1, G0 + 0.1, 0.0), 40); },
  S2: (t) => { const u = U('S2', t); return SH(L3([-0.55, G0 + 0.68, 3.15], [-0.47, G0 + 0.66, 3.0], u), V3(-0.06, G0 + 0.42, 0), 40); },
  S3: (t) => { const u = U('S3', t); return SH(L3([1.25, G0 + 0.95, 2.35], [1.15, G0 + 0.91, 2.22], u), V3(-0.16, G0 + 0.32, 0), 40); },
  S4: (t) => { const u = U('S4', t); const up = prog(t, 12.55, 13.45); return SH(L3([1.18, G0 + 0.62, 1.85], [1.09, G0 + 0.66, 1.8], u), V3(lerp(0.1, -0.06, up), G0 + lerp(0.2, 0.44, up), 0), 40); },
  S5: (t) => { const u = U('S5', t); return SH(L3([SIMX + 1.18, G0 + 0.64, 1.85], [SIMX + 1.09, G0 + 0.66, 1.8], u), V3(SIMX + 0.08, G0 + 0.27, 0), 40); },
  S6: (t) => { const u = U('S6', t); return SH(L3([0.48, G0 + 0.85, 3.25], [0.42, G0 + 0.83, 3.1], u), V3(0.12, G0 + 0.45, -0.3), 40); },
  S7: (t) => { const u = U('S7', t); return SH(V3(WALKX + 0.72, G0 + 0.66, 2.4 - 0.08 * u), V3(WALKX + 0.14, G0 + 0.44, -0.15), 40); },
  S8: (t) => { const u = U('S8', t); return SH(L3([0.3, 1.75, 6.6], [0.25, 1.95, 7.0], u), L3([0, 0.85, 0.4], [0, 0.9, 0.35], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  bot.root.visible = id !== 'S5'; ghost.root.visible = id === 'S3' || id === 'S5'; kicker.visible = id === 'S2'; board.visible = id === 'S6'; meter.visible = id === 'S7'; sign.visible = id === 'S8';
  BURST.forEach((m) => (m.visible = false)); STREAK.forEach((m) => (m.visible = false)); liftCable.visible = liftRing.visible = false; liftArrow.visible = false; resetFlash.visible = false;
  bot.root.position.set(RX, G0, 0); bot.root.rotation.set(0, 0, 0); bot.root.scale.setScalar(1); ghost.root.position.set(RX, G0, 0); ghost.root.rotation.set(0, 0, 0);
  ghost.mats.forEach((m) => (m.opacity = 0.62)); hidePhysics(); let st;
  if (id === 'S1') { st = poseBot(bot, mixQ(K.PRONE, K.PLANK, 0.28 + 0.22 * prog(t, 0, 1.9))); physics(bot, st, { orb: true, plumb: true, t }); }
  if (id === 'S2') { const kk = t - E.kick; let Q;
    if (kk < 0) Q = K.STAND0; else if (kk < 0.78) Q = fallPose(kk / 0.78); else { Q = { ...K.PRONE, p: [K.PRONE.p[0], K.PRONE.p[1] + 0.018 * Math.exp(-(kk - 0.78) * 9) * Math.abs(Math.sin((kk - 0.78) * 16))] }; }
    st = poseBot(bot, Q);
    const th = kk < -0.5 ? -0.75 : kk < 0 ? lerp(-0.75, 0.18, Math.pow((kk + 0.5) / 0.5, 2)) : kk < 0.1 ? lerp(0.18, 0.34, kk / 0.1) : lerp(0.34, -0.5, prog(kk, 0.1, 0.7));
    kicker.rotation.set(0, 0, th); kicker.position.set(RX - 0.39, G0 + 1.3 + 0.9 * prog(kk, 0.35, 1.1), 0.0);
    if (kk > -0.02 && kk < 0.35) { const a = 1 - kk / 0.35; BURST.forEach((m, i) => { m.visible = true; m.position.set(RX - 0.08, G0 + 0.47 + i * 0.03, 0.14); m.rotation.set(0, 0, kk * 4 + i); m.scale.setScalar((0.25 + 0.75 * outC(kk / 0.35)) * (1 - 0.25 * i)); m.material.opacity = 0.9 * a; }); }
    if (kk > -0.22 && kk < 0.05) STREAK.forEach((m, i) => { m.visible = true; m.position.set(RX - 0.42 - 0.08 * i, G0 + 0.42 + 0.05 * i, 0.08); m.material.opacity = 0.6; }); }
  if (id === 'S3') { st = poseBot(bot, K.PRONE); const pa = prog(t, 6.45, 6.9); physics(bot, st, { orb: true, plumb: true, patch: 'feet', patchCol: GREEN, op: pa, t });
    const ga = prog(t, E.ghost, E.ghost + 0.45); ghost.root.visible = ga > 0.01; ghost.root.position.set(RX - 0.31, G0, 0); poseBot(ghost, K.STAND); ghost.mats.forEach((m) => (m.opacity = 0.5 * ga)); }
  if (id === 'S4') { st = poseBot(bot, getUp(t - E.plant)); physics(bot, st, { orb: true, plumb: true, patch: 'support', arrows: t > E.plank - 0.05, t }); }
  if (id === 'S5') { const cyc = t < E.reset ? t - (sh('S5').in + 0.06) : t - (E.reset + 0.22); const sp = t < E.reset ? 2.1 : 2.4;
    ghost.root.position.set(SIMX + RX, G0, 0); const gst = poseBot(ghost, getUp(cyc * sp));
    const N = t < E.liftFade ? 400 : Math.max(0, 400 - 20 * Math.floor(prog(t, E.liftFade, E.liftZero, (x) => x) * 20.001)); LIFTN = N;
    if (N > 0) { ghost.root.updateMatrixWorld(true); const top = toW(ghost, gst.hc[0] + 0.07 * Math.sin(K.PRONE.t), gst.hc[1] + 0.07, 0); const hw = toW(ghost, gst.hc[0], gst.hc[1], 0);
      const k = N / 400; liftRing.visible = liftCable.visible = true; liftRing.position.copy(hw); liftRing.material.opacity = 0.9 * Math.max(0.25, k);
      const y1 = G0 + 1.7; liftCable.position.set(hw.x, (hw.y + y1) / 2, hw.z); liftCable.scale.set(1, y1 - hw.y, 1); liftCable.material.opacity = 0.85 * Math.max(0.2, k);
      setArrow(liftArrow, V3(hw.x + 0.0, hw.y + 0.1, hw.z + 0.12), V3(0, 1, 0), 0.32 * k, 1); }
    const rf = 1 - prog(t, E.reset, E.reset + 0.3, (x) => x); if (t >= E.reset && rf > 0) { resetFlash.visible = true; resetFlash.position.set(SIMX + 0.05, G0 + 0.01, 0); resetFlash.material.opacity = 0.5 * rf; } }
  if (id === 'S6') { bot.root.position.set(RX - 0.02, G0, 0.18); st = poseBot(bot, { ...K.STAND, p: [K.STAND.p[0], K.STAND.p[1] + 0.004 * Math.sin(t * 3)] });
    TILES.forEach(({ g, kind, i }) => { const show = prog(t, E.tiles + 0.012 * i, E.tiles + 0.012 * i + 0.25); g.scale.setScalar(Math.max(0.001, show));
      const flipT = kind === 'ok' ? E.green + 0.028 * i : E.flags + 0.03 * (i - 34); g.rotation.y = Math.PI * (1 - prog(t, flipT, flipT + 0.3)); }); }
  if (id === 'S7') { const d = Math.max(0, (t - E.walk) * 0.12); WALKX = RX + 0.29 + d; st = poseBot(bot, mixQ(K.STAND, walkPose(d, 0.29), prog(t, E.walk, E.walk + 0.35)));
    needle.rotation.z = 0.9 * Math.sin(t * 2.3) + 0.35 * Math.sin(t * 5.1 + 1); }
  if (id === 'S8') { bot.root.position.set(-0.25, G0, 0.62); bot.root.scale.setScalar(1.2); bot.root.rotation.set(0, -1.25, 0); const w = Math.sin(t * 7); const Q = { ...K.STAND, hR: [0.42 + 0.06 * w, 1.06], hL: [0.315, 0.515] }; st = poseBot(bot, Q); }
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = id === 'S1' ? 0.0016 : 0.0006; bokeh.uniforms.maxblur.value = id === 'S1' ? 0.008 : 0.005;
  const sgu = prog(t, E.sign, E.sign + 0.45, outBack); sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(sgu, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}
let LIFTN = 400;

// ------------------------------------------------------------------ 2-D overlay: one large, brief label at a time (never in the caption band)
function chip(text, x, y, bg, o = {}) { og.save(); og.font = o.font || '700 30px "Space Grotesk"'; const w = og.measureText(text).width + 40, h = o.h || 52; const x0 = o.align === 'left' ? x : x - w / 2; og.globalAlpha = o.alpha ?? 1; og.fillStyle = bg; rr(og, x0, y - h / 2, w, h, h / 2); og.fill(); og.restore();
  otext(text, x0 + w / 2, y + (o.dy ?? 11), { font: o.font || '700 30px "Space Grotesk"', alpha: o.alpha ?? 1, shadow: 0, kind: o.kind || 'label', color: o.color }); }
function big(text, y, a, bg, o = {}) { if (a <= 0.01) return; let fs = o.size || 78; og.save(); og.font = `700 ${fs}px "Space Grotesk"`; const w = og.measureText(text).width; og.restore();
  if (w > 680) fs = Math.floor(fs * 680 / w); const yy = y + (1 - outC(clamp(a))) * 18;
  chip(text, o.x ?? 540, yy, bg, { font: `700 ${fs}px "Space Grotesk"`, h: Math.round(fs * 1.42), alpha: clamp(a), dy: Math.round(fs * 0.36), color: o.color }); }
const small = (text, a) => chip(text, 540, 1462, 'rgba(13,18,64,0.78)', { font: '700 25px "Space Grotesk"', h: 46, alpha: a, dy: 9 });
const C = { teal: 'rgba(18,122,143,0.94)', red: 'rgba(196,40,74,0.94)', gold: 'rgba(176,112,0,0.95)', green: 'rgba(26,127,75,0.95)', violet: 'rgba(85,45,188,0.94)' };
const r10 = (x) => Math.round(x / 10) * 10;
function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = []; const id = shot.id;
  const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  if (id === 'S1') small('illustrative 3D recreation', 1);
  if (id === 'S2') { if (t >= E.labKick) big(`${Math.round(lerp(1, 47, prog(t, E.labKick, E.labKick + 0.7, (x) => x)))} kicks`, 1370, prog(t, E.labKick, E.labKick + 0.2), C.red, { size: 80 });
    small('Tiangong 3.0 · 64.5 kg · ReLoco preprint, 18 Nov 2026', prog(t, 2.25, 2.55)); }
  if (id === 'S3') big('center of mass → over the feet', 1390, prog(t, E.labCom, E.labCom + 0.25), C.gold, { size: 64 });
  if (id === 'S4') { if (FORCE.on) big(`hands ${r10(FORCE.hands)} N · feet ${r10(FORCE.feet)} N`, 1370, prog(t, E.plank, E.plank + 0.25), C.teal, { size: 62 });
    small('illustrative statics · weight 64.5 kg × g ≈ 633 N', prog(t, E.plank + 0.2, E.plank + 0.5)); }
  if (id === 'S5') { big(`training aid: ${LIFTN} N`, 1370, prog(t, E.labLift, E.labLift + 0.25), C.violet, { size: 66 }); small('head lift in simulation only · 0 N on the real robot', prog(t, E.labLift + 0.3, E.labLift + 0.6)); }
  if (id === 'S6') { big('34 falls → 34 get-ups', 1370, prog(t, E.labTally, E.labTally + 0.25), C.green, { size: 70 }); small('other 13 kicks: 5 no fall, 8 safety cut-outs', prog(t, E.flags, E.flags + 0.3)); }
  if (id === 'S7') { big('proves recovery, not toughness', 1370, prog(t, E.labProof, E.labProof + 0.25), C.teal, { size: 62 }); small('kick force not measured · not yet peer-reviewed', prog(t, E.dial, E.dial + 0.3)); }
  captions(t);
}

scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.__dbg = (f) => { const t = f / FPS; update(t); const st = poseBot(bot, getUp(t - E.plant)); return { com: st.com, feet: st.feet.map((x) => [x.heel, x.toe, x.ground]), hands: st.hands.map((h) => [h.c, h.ground]), force: FORCE }; };
window.renderThumb = async () => { await window.render(0); return TEXTLOG; };   // thumbnail = frame 0
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
