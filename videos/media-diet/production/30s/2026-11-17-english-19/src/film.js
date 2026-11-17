// Media Diet · 30 s English episode 19 — "Tiny label. Big problem." Genesis AI's robot-arm demo (TechCrunch, 17 Nov 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted english-12…18 builds: a paper miniature
// in Media Diet brand colours with real cast shadows, one camera set-up per beat, restrained depth of field. Approved feedback rules
// (context/26) + first-frame rule: frame 0 = a gloved robot fingertip on the corner of a tiny label + the 4-word hook. Hands, box and
// labels are a generic reconstruction (no Genesis footage); the peel cutaway uses the ideal thin-film peel law. Deterministic: window.render(f).
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
const X = V3(1, 0, 0), Y = V3(0, 1, 0), Z = V3(0, 0, 1);
function seg(m, a, b, r) { const d = b.clone().sub(a); const L = d.length(); if (L < 1e-5) { m.visible = false; return; } m.visible = true; m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Y, d.normalize()); m.scale.set(r, L, r); }
const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 18);

// ------------------------------------------------------------------ a generic robot hand in a sensor glove (human proportions, as Genesis describes its hands; not a replica)
const gloveTex = (worn) => canvasTex(256, 256, (g) => { g.fillStyle = '#dcd8f2'; g.fillRect(0, 0, 256, 256); let s = worn ? 91 : 17; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '60,50,110'},${0.05 + r() * 0.07})`; g.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2); }
  if (worn) { for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(70,60,95,${0.35 + r() * 0.4})`; g.lineWidth = 1.5 + r() * 3; g.beginPath(); const x = r() * 256, y = r() * 256; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 50, y + (r() - 0.5) * 20); g.stroke(); } } });
const GLOVE = new THREE.MeshStandardMaterial({ map: gloveTex(false), roughness: 0.95 }); const GLOVE_W = new THREE.MeshStandardMaterial({ map: gloveTex(true), roughness: 0.95 });
function makeHand(kind = 'robot') { const g = new THREE.Group(); scene.add(g);
  const padMat = new THREE.MeshStandardMaterial({ color: '#2addfa', emissive: '#2addfa', emissiveIntensity: 0.25, roughness: 0.5 });
  const meshes = [];
  const palm = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.09, 0.32, 3, 0.035), GLOVE); palm.castShadow = true; g.add(palm); meshes.push(palm);
  const fingers = []; const LEN = [0.11, 0.08, 0.065];
  [-0.12, -0.04, 0.04, 0.12].forEach((z, i) => { const k = [0.92, 1.0, 0.97, 0.82][i]; let parent = g; const joints = [];
    const base = new THREE.Group(); base.position.set(0.17, 0, z); parent.add(base); parent = base;
    LEN.forEach((l0, j) => { const l = l0 * k; const jg = new THREE.Group(); if (j) jg.position.set(LEN[j - 1] * k, 0, 0); parent.add(jg);
      const ph = new THREE.Mesh(new THREE.CapsuleGeometry(0.031 - j * 0.003, l - 0.03, 4, 12), GLOVE); ph.rotation.z = -Math.PI / 2; ph.position.x = l / 2; ph.castShadow = true; jg.add(ph); meshes.push(ph);
      if (j === 2) { const pad = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 10), padMat); pad.scale.set(1.2, 0.5, 1); pad.position.set(l * 0.62, -0.022, 0); jg.add(pad); const dot = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), padMat); dot.scale.set(1, 0.5, 1); dot.position.set(l * 0.45, 0.026, 0); jg.add(dot); }
      if (j === 1) { const dot = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 8), padMat); dot.scale.set(1, 0.5, 1); dot.position.set(l * 0.5, 0.028, 0); jg.add(dot); }
      joints.push(jg); parent = jg; });
    fingers.push(joints); });
  const tb = new THREE.Group(); tb.position.set(0.0, -0.01, 0.16); tb.rotation.y = -0.75; g.add(tb); const t1 = new THREE.Group(); tb.add(t1); const t2 = new THREE.Group(); t2.position.x = 0.1; t1.add(t2);
  [[t1, 0.1], [t2, 0.08]].forEach(([jg, l], j) => { const ph = new THREE.Mesh(new THREE.CapsuleGeometry(0.033, l - 0.03, 4, 12), GLOVE); ph.rotation.z = -Math.PI / 2; ph.position.x = l / 2; ph.castShadow = true; jg.add(ph); meshes.push(ph);
    if (j) { const pad = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 10), padMat); pad.scale.set(1.2, 0.5, 1); pad.position.set(l * 0.6, -0.024, 0); jg.add(pad); } });
  const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.07, 28), GLOVE); cuff.rotation.z = Math.PI / 2; cuff.position.x = -0.2; g.add(cuff); meshes.push(cuff);
  const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 1.0, 28), kind === 'robot' ? paper(P.white) : paper('#3e6fb0')); fore.rotation.z = Math.PI / 2; fore.position.x = -0.72; fore.castShadow = true; g.add(fore);
  if (kind === 'robot') { const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 28), paper(P.violet)); ring.rotation.z = Math.PI / 2; ring.position.x = -0.3; g.add(ring); }
  g.userData = { fingers, thumb: [t1, t2], padMat, meshes }; return g; }
function poseHand(h, pos, fwd, up = Y, flex = [0.2, 0.2, 0.2, 0.2], thumb = 0.3, point = false) { h.position.copy(pos);
  const f = fwd.clone().normalize(); const zz = f.clone().cross(up).normalize(); const yy = zz.clone().cross(f).normalize(); h.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(f, yy, zz));
  h.userData.fingers.forEach((jn, i) => { const a = point && i === 1 ? 0.08 : flex[i]; jn.forEach((jg, j) => (jg.rotation.z = -a * [0.8, 1.0, 0.7][j])); });
  h.userData.thumb.forEach((jg, j) => (jg.rotation.z = -thumb * (j ? 0.8 : 0.4))); }
function setWorn(h, w) { h.userData.meshes.forEach((m) => (m.material = w ? GLOVE_W : GLOVE)); }
// world position of a fingertip pad (finger i)
function tipPos(h, i = 1) { h.updateMatrixWorld(true); const jn = h.userData.fingers[i][2]; return jn.localToWorld(V3(0.065 * [0.92, 1.0, 0.97, 0.82][i] * 0.62, -0.03, 0)); }
const handR = makeHand('robot'), handL = makeHand('robot'), handH = makeHand('human');

// ------------------------------------------------------------------ cardboard box with flaps and tape
const KRAFT = '#c99a62', KRAFT_D = '#a57944';
const box = new THREE.Group(); scene.add(box);
const BW = 0.9, BH = 0.55, BD = 0.6;
{ const body = card(BW, BH, BD, KRAFT, KRAFT_D, 'z'); body.position.y = BH / 2; box.add(body);
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(BW - 0.04, BD - 0.04), paper('#5a3d22')); inside.rotation.x = -Math.PI / 2; inside.position.y = BH + 0.002; box.add(inside); box.userData.inside = inside; }
const flaps = [[0, BD / 2, BW, BD / 2, 'z+'], [0, -BD / 2, BW, BD / 2, 'z-'], [BW / 2, 0, BW / 2, BD - 0.02, 'x+'], [-BW / 2, 0, BW / 2, BD - 0.02, 'x-']].map(([x, z, w, d, side]) => {
  const hinge = new THREE.Group(); hinge.position.set(x, BH, z); box.add(hinge);
  const f = card(side[0] === 'z' ? w : w, 0.012, side[0] === 'z' ? d : d, KRAFT, KRAFT_D); const s = side[1] === '+' ? -1 : 1;
  if (side[0] === 'z') f.position.set(0, 0.006 + (side[1] === '+' ? 0.012 : 0), s * d / 2); else f.position.set(s * w / 2, 0.0, 0);
  hinge.add(f); hinge.userData = { side }; return hinge; });
function setFlaps(u) { // u = 0 open (standing out), 1 closed flat
  flaps.forEach((hg, i) => { const side = hg.userData.side; const k = clamp(u * 1.6 - (side[0] === 'x' ? 0 : 0.6), 0, 1); const ang = (1 - k) * 1.9;
    if (side === 'z+') hg.rotation.x = ang; if (side === 'z-') hg.rotation.x = -ang; if (side === 'x+') hg.rotation.z = -ang; if (side === 'x-') hg.rotation.z = ang; }); }
const tape = new THREE.Mesh(new THREE.BoxGeometry(1, 0.006, 0.09), new THREE.MeshStandardMaterial({ color: '#d9b77e', roughness: 0.35, transparent: true, opacity: 0.85 })); tape.position.set(0, BH + 0.03, 0); box.add(tape);
const boxLabel = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.004, 0.11), paper('#ffd23f')); boxLabel.position.set(0.22, BH + 0.03, 0.17); box.add(boxLabel);
const smallBox = card(0.26, 0.2, 0.22, KRAFT, KRAFT_D); scene.add(smallBox);
box.position.set(0, DESK, -0.35);

// ------------------------------------------------------------------ label strip (liner + labels); the target label is a ribbon that can curl
const strip = new THREE.Group(); scene.add(strip); strip.position.set(0, DESK, 0.55);
{ const liner = card(1.5, 0.008, 0.17, '#f1eee6', '#e0dccf'); liner.position.y = 0.004; strip.add(liner);
  [-0.6, -0.4, -0.2, 0.2, 0.4, 0.6].forEach((x) => { const l = card(0.14, 0.004, 0.1, '#ffd23f', '#e8bf2c'); l.position.set(x, 0.01, 0); strip.add(l); }); }
const LBL = { L: 0.14, W: 0.1, T: 0.004, N: 28 };
function makeRibbon(col, edge, n) { const g = new THREE.Group(); const segs = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [paper(edge), paper(edge), paper(col), paper('#ece4c8'), paper(edge), paper(edge)]); m.castShadow = true; g.add(m); segs.push(m); } g.userData.segs = segs; return g; }
// ribbon poser: attached end at A (local x = +L/2), peel front d0 from that end, then an arc of radius rc up to angle th (from the surface, pointing back toward -x), then straight
function poseRibbon(rb, L, W, T, peeled, th, rc = 0.02, y0 = 0) { const n = rb.userData.segs.length; const pts = []; const ds = L / n;
  const att = Math.max(0, L - peeled); for (let i = 0; i <= n; i++) { const s = i * ds; let p;
    if (s <= att) p = V3(L / 2 - s, y0, 0);
    else { const q = s - att; const arcL = rc * th; if (q <= arcL) { const a = q / rc; p = V3(L / 2 - att - rc * Math.sin(a), y0 + rc * (1 - Math.cos(a)), 0); }
      else { const a = th; const bx = L / 2 - att - rc * Math.sin(a), by = y0 + rc * (1 - Math.cos(a)); p = V3(bx - Math.cos(a) * (q - arcL), by + Math.sin(a) * (q - arcL), 0); } }
    pts.push(p); }
  rb.userData.segs.forEach((m, i) => { const a = pts[i], b = pts[i + 1]; const d = b.clone().sub(a); const len = d.length(); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(X, d.normalize()); m.scale.set(len * 1.04, T, W); });
  return pts; }
const target = makeRibbon('#ffd23f', '#e8bf2c', LBL.N); target.position.set(0, 0.01, 0); strip.add(target);

// ------------------------------------------------------------------ physics cutaway: a big film on a liner, pulled flat vs straight up (ideal thin-film peel)
const cut = new THREE.Group(); scene.add(cut); cut.position.set(0, DESK, 0.3);
{ const base = card(2.2, 0.06, 0.8, '#f1eee6', '#d9d4c4'); base.position.y = 0.03; cut.add(base); }
const bigFilm = makeRibbon('#ffd23f', '#e8bf2c', 40); bigFilm.position.set(0.42, 0.06 + 0.012, 0); cut.add(bigFilm);
const pullArrow = makeArrow(ARROW.fr, 0.03, true), upArrow = makeArrow(ARROW.push, 0.03, true);

// ------------------------------------------------------------------ CTA sign (Media Diet identity only) + riser so the labelled box shows behind it
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, 1024, 300); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0, DESK + 0.02, 1.2);
const riser = card(1.2, 0.5, 0.8, P.deep, P.lav); riser.position.set(0, DESK + 0.25, 0.25); scene.add(riser);

// ------------------------------------------------------------------ camera shots
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const U = (id, t) => prog(t, sh(id).in, sh(id).out, (x) => x);
const SHOTS = {
  S1: (t) => { const u = U('S1', t); return SH(L3([0.1, 0.4, 1.85], [0.08, 0.39, 1.78], u), V3(-0.12, 0.14, 0.42), 38); },
  S2: (t) => { const u = U('S2', t); return SH(L3([0.8, 2.15, 1.55], [0.72, 2.05, 1.45], u), V3(0, 0.5, -0.33), 40); },
  S3: (t) => { const u = U('S3', t); return SH(L3([-0.35, 0.42, 1.75], [-0.3, 0.41, 1.68], u), V3(-0.05, 0.1, 0.45), 38); },
  S4: (t) => { const u = U('S4', t); return SH(L3([0.6, 0.85, 2.3], [0.55, 0.55, 1.75], u), L3([0, 0.4, -0.3], [0, 0.08, 0.5], ease(u)), 40); },
  S5: (t) => { const u = U('S5', t); return SH(L3([0.15, 0.62, 2.55], [0.12, 0.6, 2.45], u), V3(0.0, 0.22, 0.3), 40); },
  S6: (t) => { const u = U('S6', t); return SH(L3([-0.55, 0.3, 1.35], [-0.5, 0.29, 1.28], u), V3(-0.06, 0.08, 0.52), 38); },
  S7: (t) => { const u = U('S7', t); return SH(L3([0.0, 1.35, 2.3], [0.0, 1.3, 2.15], u), V3(0, 0.05, 0.3), 40); },
  S8: (t) => { const u = U('S8', t); return SH(L3([-0.5, 0.36, 1.45], [-0.46, 0.38, 1.38], u), V3(-0.02, 0.14, 0.52), 38); },
  S9: (t) => { const u = U('S9', t); return SH(L3([0.3, 1.75, 6.6], [0.25, 1.95, 7.0], u), L3([0, 0.85, 0.4], [0, 0.9, 0.35], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
const TIP = V3(-LBL.L / 2, 0.012, 0.55);   // world position of the target label's free corner edge (strip at z 0.55)
function aimTip(h, tip, fwd, up, flex, thumb) { poseHand(h, V3(0, 0, 0), fwd, up, flex, thumb); const p = tipPos(h, 1); h.position.copy(tip.clone().sub(p)); }
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;
  const onDesk = ['S1', 'S2', 'S3', 'S4', 'S6', 'S8'].includes(id);
  box.visible = onDesk || id === 'S9'; strip.visible = onDesk; cut.visible = id === 'S5'; sign.visible = riser.visible = id === 'S9';
  handR.visible = ['S1', 'S2', 'S3', 'S6', 'S7', 'S8'].includes(id); handL.visible = id === 'S2'; handH.visible = id === 'S7'; smallBox.visible = id === 'S2';
  pullArrow.visible = upArrow.visible = false; setWorn(handR, false); [handR, handL, handH].forEach((h) => (h.userData.padMat.emissiveIntensity = 0.25));
  setFlaps(1); tape.scale.x = BW + 0.2; tape.position.x = 0; tape.visible = true; boxLabel.visible = id === 'S9'; box.position.set(0, DESK, -0.35);
  poseRibbon(target, LBL.L, LBL.W, LBL.T, 0, 0);
  const down = V3(0.35, -0.55, -1).normalize();
  if (id === 'S1') { // hook: the gloved fingertip resting on the corner of the tiny label
    aimTip(handR, TIP.clone().add(V3(0.012, 0.004, 0.0)), V3(-0.55, -0.72, -0.42), Y, [0.75, 0.15, 0.9, 1.0], 0.5); }
  if (id === 'S2') { // pack the small box, close the flaps, run tape along the seam
    const pk = prog(t, 3.2, E.pack, (x) => x * x * (3 - 2 * x)); const fl = prog(t, E.flaps, E.flaps + 0.55); const tp = prog(t, E.tape, E.tape + 0.75, (x) => x);
    smallBox.position.set(lerp(-0.32, 0, pk), DESK + lerp(1.0, 0.38, pk), lerp(-0.1, -0.35, pk)); smallBox.visible = fl < 0.45;
    const hp = smallBox.position.clone().add(V3(0, 0.16, 0)); poseHand(handL, fl > 0.05 ? V3(lerp(-0.2, -0.32, fl), 0.78, -0.35 + 0.05) : hp, fl > 0.05 ? V3(0.6, -0.5, 0.4) : V3(0.5, -0.85, 0.35), Y, fl > 0.05 ? [0.2, 0.2, 0.2, 0.2] : [0.9, 0.9, 0.9, 0.9], 0.6);
    setFlaps(fl); tape.visible = tp > 0.01; tape.scale.x = Math.max(0.01, (BW + 0.2) * tp); tape.position.x = -(BW + 0.2) / 2 + tape.scale.x / 2;
    poseHand(handR, V3(-(BW + 0.2) / 2 + tape.scale.x + 0.05, 0.8 + 0.05 * (1 - tp), -0.35), V3(-0.55, -0.6, 0.3), Y, [0.6, 0.6, 0.6, 0.6], 0.5); }
  if (id === 'S3') { // the rerun: the fingertip slides across the label; the corner barely lifts and drops back
    const sl = prog(t, 7.0, E.slip + 0.6, (x) => x); const fight = Math.sin(Math.PI * prog(t, E.slip, E.slip + 0.5)) * (t > E.slip ? 1 : 0);
    aimTip(handR, TIP.clone().add(V3(lerp(0.09, -0.02, sl), 0.006, 0.0)), V3(-0.55, -0.72, -0.42), Y, [0.75, 0.15, 0.9, 1.0], 0.5);
    poseRibbon(target, LBL.L, LBL.W, LBL.T, 0.02 * fight, 0.35 * fight, 0.01); }
  if (id === 'S4') { aimTip(handR, TIP.clone().add(V3(0.05, 0.18, 0.05)), V3(-0.55, -0.42, -0.72), Y, [0.6, 0.15, 0.7, 0.8], 0.4); handR.visible = false; }
  if (id === 'S5') { // flat pull: huge force; straight up: small force (ideal thin film, F ∝ 1/(1 − cos θ))
    const th = lerp(0.17, Math.PI / 2, prog(t, E.steep - 0.2, E.steep + 0.5)); const pts = poseRibbon(bigFilm, 1.0, 0.45, 0.018, 0.42, th, 0.05, 0);
    const tip = bigFilm.localToWorld(pts[pts.length - 1].clone()); const dir = V3(-Math.cos(th), Math.sin(th), 0);
    const big = prog(t, E.flat, E.flat + 0.3) * (1 + 2.6 * prog(t, E.grow, E.grow + 0.8)) * (1 - prog(t, E.steep - 0.2, E.steep + 0.1));
    setArrow(pullArrow, tip.clone().addScaledVector(dir, 0.04), dir, 0.36 * big, clamp(big));
    const up = prog(t, E.steep + 0.3, E.steep + 0.6); setArrow(upArrow, tip.clone().addScaledVector(dir, 0.04), dir, 0.26 * up, up); }
  if (id === 'S6') { // the hard part: push and slide to lift the first edge
    const lift = prog(t, E.lift, E.lift + 0.9); const slide = prog(t, 16.6, E.lift + 0.3);
    const pts6 = poseRibbon(target, LBL.L, LBL.W, LBL.T, 0.055 * lift, 1.15 * lift, 0.012); const fr6 = target.localToWorld(pts6[pts6.length - 1].clone());
    aimTip(handR, lift > 0.02 ? fr6.clone().add(V3(0.006, 0.006, 0)) : TIP.clone().add(V3(lerp(0.05, 0.004, slide), 0.006, 0)), V3(-0.3, -0.85, -0.42), Y, [0.75, 0.15, 0.9, 1.0], 0.5); }
  if (id === 'S7') { // the same sensor glove on a worker's hand and on the robot's hand; then the robot hand wears out
    poseHand(handH, V3(-0.25, 0.28, 0.35), V3(0.12, -0.25, 1), Y, [0.35, 0.3, 0.32, 0.4], 0.4); poseHand(handR, V3(0.25, 0.28, 0.35), V3(-0.12, -0.25, 1), Y, [0.35, 0.3, 0.32, 0.4], 0.4);
    const glow = prog(t, E.glove, E.glove + 0.4) * (0.75 + 0.25 * Math.sin(t * 7)); [handH, handR].forEach((h) => (h.userData.padMat.emissiveIntensity = 0.25 + 1.4 * glow));
    const w = t > E.wear; setWorn(handR, w); if (w) { handR.userData.padMat.emissiveIntensity = 0.12 + 0.5 * Math.abs(Math.sin(t * 13)); handR.position.y -= 0.03 * prog(t, E.wear, E.wear + 0.5); } }
  if (id === 'S8') { // takeaway: lift a corner, then pull steep — the label comes off cleanly
    const c = prog(t, E.corner, E.corner + 0.5); const pull = prog(t, E.pull, E.pull + 0.8);
    const peeled = lerp(0.055 * c, LBL.L * 0.97, pull), th = lerp(1.15 * c, 1.85, pull);
    const pts = poseRibbon(target, LBL.L, LBL.W, LBL.T, peeled, th, 0.012);
    const free = target.localToWorld(pts[pts.length - 1].clone());
    aimTip(handR, free.clone().add(V3(0.006, 0.006, 0)), V3(-0.3, -0.85, -0.42), Y, [0.75, 0.15, 0.9, 1.0], 0.5 + 0.4 * c); }
  if (id === 'S9') { box.position.set(0, DESK + 0.5, 0.25); }
  const sgu = prog(t, E.sign, E.sign + 0.45, outBack); sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(sgu, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}

// ------------------------------------------------------------------ 2-D overlay: one large, brief label at a time (never in the caption band)
function chip(text, x, y, bg, o = {}) { og.save(); og.font = o.font || '700 30px "Space Grotesk"'; const w = og.measureText(text).width + 40, h = o.h || 52; const x0 = o.align === 'left' ? x : x - w / 2; og.globalAlpha = o.alpha ?? 1; og.fillStyle = bg; rr(og, x0, y - h / 2, w, h, h / 2); og.fill(); og.restore();
  otext(text, x0 + w / 2, y + (o.dy ?? 11), { font: o.font || '700 30px "Space Grotesk"', alpha: o.alpha ?? 1, shadow: 0, kind: o.kind || 'label', color: o.color }); }
function big(text, y, a, bg, o = {}) { if (a <= 0.01) return; let fs = o.size || 78; og.save(); og.font = `700 ${fs}px "Space Grotesk"`; const w = og.measureText(text).width; og.restore();
  if (w > 680) fs = Math.floor(fs * 680 / w); const yy = y + (1 - outC(clamp(a))) * 18;
  chip(text, o.x ?? 540, yy, bg, { font: `700 ${fs}px "Space Grotesk"`, h: Math.round(fs * 1.42), alpha: clamp(a), dy: Math.round(fs * 0.36), color: o.color }); }
const win = (t, a, b, f = 0.25) => prog(t, a, a + f) * (1 - prog(t, b - 0.12, b));
const C = { teal: 'rgba(18,122,143,0.94)', red: 'rgba(196,40,74,0.94)', gold: 'rgba(176,112,0,0.95)', green: 'rgba(26,127,75,0.95)', violet: 'rgba(85,45,188,0.94)' };
function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = []; const id = shot.id;
  const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  if (id === 'S2') { chip('Genesis AI demo · TechCrunch · 17 Nov 2026', 540, 1372, 'rgba(254,64,146,0.92)', { font: '700 26px "Space Grotesk"', alpha: prog(t, 2.1, 2.4) });
    chip('editorial reconstruction', 540, 1446, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, 2.1, 2.4), dy: 9 }); }
  if (id === 'S3') big('rerun', 1390, prog(t, E.labRerun, E.labRerun + 0.25), C.red, { size: 84 });
  if (id === 'S5') { big('flat pull ≈ 66× force', 1380, win(t, E.labFlat, E.steep - 0.05), C.red, { size: 72 }); big('straight up: easy', 1380, prog(t, E.steep + 0.35, E.steep + 0.6), C.green, { size: 72 });
    chip('ideal thin film, 10° vs 90° (Kendall 1975)', 540, 1468, 'rgba(13,18,64,0.72)', { font: '700 26px "Space Grotesk"', h: 46, alpha: win(t, E.labFlat, E.steep - 0.05), dy: 9 }); }
  if (id === 'S6') big('lift the edge', 1390, prog(t, E.labLift, E.labLift + 0.25), C.gold, { size: 84 });
  if (id === 'S7') { big('same sensor glove', 1390, win(t, E.labGlove, E.labWear), C.teal, { size: 80 }); big('hands last weeks', 1390, prog(t, E.labWear, E.labWear + 0.25), C.red, { size: 80 }); }
  if (id === 'S8') big('corner, then steep', 1390, prog(t, E.labTake, E.labTake + 0.25), C.green, { size: 80 });
  captions(t);
}

scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.renderThumb = async () => { await window.render(0); return TEXTLOG; };   // thumbnail = frame 0
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
