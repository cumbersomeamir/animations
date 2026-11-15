// Media Diet · 30 s English episode 17 — "No joints. Just tension." Colorado State TeCoBot tensegrity robots (Nature Machine Intelligence, 11 Nov 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted english-12…16 builds: a paper miniature
// in Media Diet brand colours with real cast shadows, one camera set-up per beat, restrained depth of field. Approved feedback rules
// (context/26) + first-frame rule: frame 0 = two linked robots looped around a pipe + the 4-word hook. Robots are a generic
// reconstruction of a six-rod tensegrity module with claws, not a replica. Deterministic: window.render(f).
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
let sd = 1711; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
const sh = (id) => TL.shots.find((s) => s.id === id);
const fill = new THREE.DirectionalLight('#ffe6cc', 1.0); fill.position.set(4, 6, 9); scene.add(fill);   // soft front fill, no shadows
const Y = V3(0, 1, 0), Z = V3(0, 0, 1);
function seg(m, a, b, r) { const d = b.clone().sub(a); const L = d.length(); if (L < 1e-5) { m.visible = false; return; } m.visible = true; m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Y, d.normalize()); m.scale.set(r, L, r); }
const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 10);

// ------------------------------------------------------------------ the robot: a generic paper reconstruction of a tensegrity "trunk" module — six stiff rods held only by a stretchy web, a claw at each end
const rodMat = new THREE.MeshStandardMaterial({ color: '#23263f', roughness: 0.45, metalness: 0.2 });
function makeBot(webCol = '#2addfa') {
  const g = new THREE.Group(); scene.add(g);
  const webMat = new THREE.MeshStandardMaterial({ color: webCol, emissive: webCol, emissiveIntensity: 0.35, roughness: 0.5, transparent: true, opacity: 0.95 });
  const rods = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(unitCyl, rodMat); m.castShadow = true; g.add(m); return m; });
  const cords = Array.from({ length: 24 }, () => { const m = new THREE.Mesh(unitCyl, webMat); m.castShadow = true; g.add(m); return m; });
  const claws = [0, 1].map(() => { const c = new THREE.Group(); g.add(c); const base = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.12, 20), paper('#f1eeff')); base.castShadow = true; c.add(base);
    const fingers = [-1, 1].map((s) => { const h = new THREE.Group(); h.position.set(0, 0.06, s * 0.05); c.add(h); const f1 = card(0.04, 0.16, 0.04, P.violet, P.lav); f1.position.y = 0.08; h.add(f1); const tip = card(0.04, 0.04, 0.09, P.violet, P.lav); tip.position.set(0, 0.16, -s * 0.03); h.add(tip); return { h, s }; });
    return { c, fingers }; });
  return { g, rods, cords, claws, webMat };
}
// pose a bot along a curve: C(s) for s in [0,1], ref = a vector never parallel to the tangent; squash ∈ [0,1] flattens the cross-section
const RODS = [0, 1, 2].map((k) => ({ s0: 0.0, s1: 0.56, a0: k * 2 * Math.PI / 3, a1: k * 2 * Math.PI / 3 + 1.9 })).concat([0, 1, 2].map((k) => ({ s0: 0.44, s1: 1.0, a0: Math.PI / 3 + k * 2 * Math.PI / 3, a1: Math.PI / 3 + k * 2 * Math.PI / 3 + 1.9 })));
function frameAt(C, s, ref) { const e = 0.002; const p = C(s), T = C(Math.min(1, s + e)).sub(C(Math.max(0, s - e))).normalize(); const B = T.clone().cross(ref).normalize(); const N = B.clone().cross(T).normalize(); return { p, T, N, B }; }
function poseBot(bot, C, ref, o = {}) { const r = o.r ?? 0.11, sq = o.squash ?? 0, clawOpen = o.claw ?? 0.2, scale = o.scale ?? 1;
  const pt = (s, a) => { const f = frameAt(C, s, ref); const rr = r * scale; return f.p.clone().addScaledVector(f.N, Math.cos(a) * rr * (1 - 0.55 * sq)).addScaledVector(f.B, Math.sin(a) * rr * (1 + 0.35 * sq)); };
  const ends = RODS.map((R) => [pt(R.s0, R.a0), pt(R.s1, R.a1)]);
  ends.forEach(([a, b], i) => seg(bot.rods[i], a, b, 0.012 * scale));
  // web: triangle rings at each layer's ends + cross cords between the layers + long side cords
  const pairs = []; const ring = (idx) => { for (let k = 0; k < 3; k++) pairs.push([idx[k], idx[(k + 1) % 3]]); };
  ring([[0, 0], [1, 0], [2, 0]]); ring([[0, 1], [1, 1], [2, 1]]); ring([[3, 0], [4, 0], [5, 0]]); ring([[3, 1], [4, 1], [5, 1]]);
  for (let k = 0; k < 3; k++) { pairs.push([[k, 1], [3 + k, 0]]); pairs.push([[k, 1], [3 + (k + 2) % 3, 0]]); pairs.push([[k, 0], [3 + k, 0]]); pairs.push([[3 + k, 1], [k, 1]]); }
  pairs.slice(0, bot.cords.length).forEach(([u, v], i) => seg(bot.cords[i], ends[u[0]][u[1]], ends[v[0]][v[1]], 0.0055 * scale));
  bot.cords.forEach((c, i) => { if (i >= pairs.length) c.visible = false; });
  // claws at both ends, pointing outward along the axis
  [0, 1].forEach((e) => { const f = frameAt(C, e, ref); const dir = e ? f.T.clone() : f.T.clone().negate(); const cl = bot.claws[e]; cl.c.position.copy(f.p).addScaledVector(dir, 0.04 * scale); cl.c.quaternion.setFromUnitVectors(Y, dir); cl.c.scale.setScalar(scale);
    cl.fingers.forEach((F) => (F.h.rotation.x = F.s * (0.15 + 0.5 * clawOpen))); });
}
const line = (A, B) => (s) => A.clone().lerp(B, s);
const arc = (c, R, a0, a1, z = 0) => (s) => { const a = lerp(a0, a1, s); return V3(c.x + R * Math.cos(a), c.y + R * Math.sin(a), c.z + z * s); };
const helix = (c, R, a0, turns, h) => (s) => { const a = a0 + s * turns * 2 * Math.PI; return V3(c.x + R * Math.cos(a), c.y + h * s, c.z + R * Math.sin(a)); };
const bend = (A, dir, len, k, upv) => (s) => { const L = len * s; const u = dir.clone().normalize(), n = upv.clone().normalize(); if (Math.abs(k) < 1e-4) return A.clone().addScaledVector(u, L); return A.clone().addScaledVector(u, Math.sin(k * L) / k).addScaledVector(n, (1 - Math.cos(k * L)) / k); };
const bots = [makeBot('#2addfa'), makeBot('#fe4092'), makeBot('#ffd23f')];

// ------------------------------------------------------------------ set pieces: pipes, floor props, the weight, a controller, a 3-rod tensegrity prism
const labSet = new THREE.Group(); scene.add(labSet);
const pipeMat = new THREE.MeshStandardMaterial({ color: '#9aa0c8', metalness: 0.55, roughness: 0.35, map: grain });
const pipeHG = new THREE.Group(); labSet.add(pipeHG);
const pipeH = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 6.4, 40), pipeMat); pipeH.rotation.x = Math.PI / 2; pipeH.position.set(0, 1.25, -0.3); pipeH.castShadow = true; pipeH.receiveShadow = true; pipeHG.add(pipeH);
for (const z of [-2.4, 1.7]) { const st = card(0.1, 1.2, 0.1, P.deep, P.lav); st.position.set(0, DESK + 0.6, z); pipeHG.add(st); }
const pipeV = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 3.4, 40), pipeMat); pipeV.position.set(0, DESK + 1.7, 0); pipeV.castShadow = true; pipeV.receiveShadow = true; labSet.add(pipeV);
const floor = card(6, 0.02, 5, '#cfc9ee', P.white); floor.position.set(0, DESK + 0.01, 0); labSet.add(floor);
const weight = card(0.5, 0.18, 0.36, P.navy2, P.lav); weight.castShadow = true; labSet.add(weight);
const pad = new THREE.Group(); labSet.add(pad); { const b = card(0.42, 0.08, 0.22, '#2b2d4f', P.lav); pad.add(b); for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 16), paper(P.magenta)); st.position.set(s * 0.12, 0.06, 0); pad.add(st); } const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), paper(P.cyan)); btn.position.set(0, 0.05, 0.05); pad.add(btn); }
const signal = Array.from({ length: 3 }, (_, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.12 + i * 0.09, 0.008, 6, 32, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#2addfa', transparent: true, opacity: 0 })); labSet.add(m); return m; });
// three-rod tensegrity prism (takeaway diagram)
const prism = new THREE.Group(); labSet.add(prism);
const pRods = Array.from({ length: 3 }, () => { const m = new THREE.Mesh(unitCyl, new THREE.MeshStandardMaterial({ color: '#ff8a3d', emissive: '#ff6a2b', emissiveIntensity: 0.25, roughness: 0.5 })); m.castShadow = true; prism.add(m); return m; });
const pCords = Array.from({ length: 9 }, () => { const m = new THREE.Mesh(unitCyl, new THREE.MeshStandardMaterial({ color: '#2addfa', emissive: '#2addfa', emissiveIntensity: 0.5 })); prism.add(m); return m; });

// ------------------------------------------------------------------ CTA sign (Media Diet identity only)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, 1024, 300); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0, DESK + 0.02, 1.2);

// ------------------------------------------------------------------ camera shots
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const U = (id, t) => prog(t, sh(id).in, sh(id).out, (x) => x);
const SHOTS = {
  S1: (t) => { const u = U('S1', t); return SH(L3([1.6, 1.8, 1.4], [1.5, 1.76, 1.3], u), V3(0.0, 1.27, -0.45), 42); },
  S2: (t) => { const u = U('S2', t); return SH(L3([0.6, 1.25, 3.2], [0.5, 1.2, 3.0], u), V3(0.0, 0.25, 0), 42); },
  S3: (t) => { const u = U('S3', t); const a = lerp(0.25, -0.35, u); return SH(V3(Math.sin(a) * 1.7, 0.85, Math.cos(a) * 1.7), V3(0.0, 0.5, 0), 40); },
  S4: (t) => { const u = U('S4', t); return SH(L3([0.3, 0.95, 2.0], [0.25, 0.9, 1.85], u), V3(0.0, 0.62, 0), 40); },
  S5: (t) => { const u = U('S5', t); return SH(L3([0.7, 1.05, 2.5], [0.6, 1.0, 2.35], u), V3(0.0, 0.42, 0), 40); },
  S6: (t) => { const u = U('S6', t); return SH(L3([1.4, 1.5, 3.6], [1.3, 1.9, 3.5], u), L3([0, 0.95, 0], [0, 1.45, 0], u), 42); },
  S7: (t) => { const u = U('S7', t); return SH(L3([0.5, 1.0, 2.9], [0.45, 0.98, 2.75], u), V3(0.0, 0.42, 0.1), 40); },
  S8: (t) => { const u = U('S8', t); const a = 0.4 + 0.5 * u; return SH(V3(Math.sin(a) * 2.95, 1.45, Math.cos(a) * 2.95), V3(0, 1.12, 0), 40); },
  S9: (t) => { const u = U('S9', t); return SH(L3([0.3, 1.75, 6.6], [0.25, 1.95, 7.0], u), L3([0, 0.85, 0.4], [0, 0.9, 0.35], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;
  bots.forEach((b) => (b.g.visible = false)); pipeHG.visible = id === 'S1'; pipeV.visible = id === 'S6'; weight.visible = id === 'S5'; pad.visible = id === 'S7'; prism.visible = id === 'S8'; sign.visible = id === 'S9';
  signal.forEach((m) => (m.material.opacity = 0)); bots.forEach((b) => (b.webMat.emissiveIntensity = 0.35));
  const show = (b) => { b.g.visible = true; return b; };
  const top = DESK + 0.02 + 0.11;   // axis height of a bot lying on the floor
  if (id === 'S1') { // two linked bots hugging the horizontal pipe in a loop
    const c = V3(0, 1.25, -0.3), R = 0.3, a0 = -0.4 + 0.05 * Math.sin(t * 1.2), mid = a0 + Math.PI * 1.02, a1 = a0 + Math.PI * 2.0;
    poseBot(show(bots[0]), arc(c, R, a0, mid), Z, { claw: 0.1 }); poseBot(show(bots[1]), arc(c, R, mid + 0.06, a1 - 0.25), Z, { claw: 0.1 }); }
  if (id === 'S2') { // two bots inch toward each other and lock claws
    const meet = prog(t, 2.2, E.link, (x) => x * (2 - x)); const gap = lerp(0.9, 0.06, meet);
    poseBot(show(bots[0]), line(V3(-1.15 - gap / 2 + 0.06, top, 0), V3(-gap / 2, top, 0)), Y, { claw: t < E.link ? 0.8 : 0.1 });
    poseBot(show(bots[1]), line(V3(gap / 2, top, 0), V3(1.15 + gap / 2 - 0.06, top, 0)), Y, { claw: t < E.link ? 0.8 : 0.1 }); }
  if (id === 'S3') { const b = show(bots[0]); poseBot(b, line(V3(-0.6, 0.5, 0), V3(0.6, 0.5, 0)), Y, { scale: 1.6, r: 0.11, claw: 0.2 }); }
  if (id === 'S4') { // rods first, then the web appears and the arrows tell push vs pull
    const b = show(bots[0]); poseBot(b, line(V3(-0.6, 0.62, 0), V3(0.6, 0.62, 0)), Y, { scale: 1.9, r: 0.11, claw: 0.2 });
    const web = prog(t, E.web - 0.1, E.web + 0.6); b.cords.forEach((c, i) => { if (c.visible) { c.scale.x *= Math.max(0.01, web); c.scale.z *= Math.max(0.01, web); } }); b.webMat.emissiveIntensity = 0.35 + 0.6 * prog(t, E.pull, E.pull + 0.3);
    b.claws.forEach((cl) => (cl.c.visible = web > 0.5)); }
  else bots.forEach((b) => b.claws.forEach((cl) => (cl.c.visible = true)));
  if (id === 'S5') { // a weight squashes the body: the cross-section flattens, the web glows (load shared), then it springs back
    const sq = prog(t, E.squash, E.squash + 0.5) * (1 - prog(t, E.release, E.release + 0.6)); const b = show(bots[0]);
    poseBot(b, line(V3(-0.65, top + 0.04 - 0.05 * sq, 0), V3(0.65, top + 0.04 - 0.05 * sq, 0)), Y, { scale: 1.25, r: 0.11, squash: sq, claw: 0.2 });
    b.webMat.emissiveIntensity = 0.35 + 1.0 * sq; weight.position.set(0, top + 0.04 + 0.11 * 1.25 * (1 - 0.55 * sq) + 0.09 + (1 - prog(t, E.squash - 0.5, E.squash, (x) => x * x)) * 0.9, 0); }
  if (id === 'S6') { // linked bots wrap the vertical pipe and climb it
    const climb = prog(t, E.climb, 19.4, (x) => x); const c = V3(0, DESK + 0.25 + 0.9 * climb, 0);
    poseBot(show(bots[0]), helix(c, 0.32, 0.2 + 2.0 * climb, 0.62, 0.55), Y, { claw: 0.1 }); poseBot(show(bots[1]), helix(c.clone().add(V3(0, 0.56, 0)), 0.32, 0.2 + 2.0 * climb + 0.62 * 2 * Math.PI + 0.12, 0.62, 0.55), Y, { claw: 0.1 }); }
  if (id === 'S7') { const b = show(bots[2]); const w = 0.3 * Math.sin(Math.max(0, t - E.pilot) * 3); poseBot(b, bend(V3(-0.55, top + 0.02, 0), V3(1, 0, 0), 1.1, w, Z), Z, { claw: 0.3 });
    pad.position.set(0.55, DESK + 0.06, 0.55); pad.rotation.y = -0.6; signal.forEach((m, i) => { const ph = ((t * 1.6 + i * 0.33) % 1); m.material.opacity = prog(t, E.pilot, E.pilot + 0.3) * (1 - ph) * 0.9; m.position.set(0.45, DESK + 0.18 + i * 0.0, 0.42); m.rotation.set(-Math.PI / 2, 0, 2.3); m.scale.setScalar(0.6 + ph); }); }
  if (id === 'S8') { // a 3-rod tensegrity prism: orange rods never touch, cyan cords hold them
    const tw = 0.9, hgt = 0.9, R = 0.35, by = 0.5; const bot_ = [0, 1, 2].map((k) => V3(Math.cos(k * 2.094) * R, by, Math.sin(k * 2.094) * R)); const top_ = [0, 1, 2].map((k) => V3(Math.cos(k * 2.094 + tw) * R, by + hgt, Math.sin(k * 2.094 + tw) * R));
    const grow = prog(t, E.tens - 0.2, E.tens + 0.5); prism.rotation.y = t * 0.4;
    pRods.forEach((m, k) => seg(m, bot_[k], top_[(k + 1) % 3], 0.022 * Math.max(0.01, grow)));
    const cp = [[bot_[0], bot_[1]], [bot_[1], bot_[2]], [bot_[2], bot_[0]], [top_[0], top_[1]], [top_[1], top_[2]], [top_[2], top_[0]], [bot_[0], top_[0]], [bot_[1], top_[1]], [bot_[2], top_[2]]];
    pCords.forEach((m, i) => seg(m, cp[i][0], cp[i][1], 0.008 * prog(t, E.tens + 0.2, E.tens + 0.7))); }
  if (id === 'S9') { poseBot(show(bots[0]), line(V3(-1.0, DESK + 0.98, 0.85), V3(1.0, DESK + 0.98, 0.85)), Y, { claw: 0.2, scale: 1.3 }); }
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
  if (id === 'S2') { chip('Colorado State · Nature Machine Intelligence · 11 Nov 2026', 540, 1372, 'rgba(254,64,146,0.92)', { font: '700 25px "Space Grotesk"', alpha: prog(t, 2.2, 2.5) });
    chip('editorial reconstruction', 540, 1446, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, 2.2, 2.5), dy: 9 }); }
  if (id === 'S4') { big('RODS PUSH', 1390, win(t, E.push, E.pull), C.gold, { size: 88 }); big('WEB PULLS', 1390, prog(t, E.pull, E.pull + 0.25), C.teal, { size: 88 }); }
  if (id === 'S5') big('load spreads', 1390, prog(t, E.labLoad, E.labLoad + 0.25), C.violet, { size: 80 });
  if (id === 'S6') big('loop + climb', 1390, prog(t, E.labClimb, E.labClimb + 0.25), C.green, { size: 84 });
  if (id === 'S7') big('human-piloted (for now)', 1390, prog(t, E.pilot, E.pilot + 0.25), C.red, { size: 64 });
  if (id === 'S8') big('TENSEGRITY', 1390, prog(t, E.labTens, E.labTens + 0.25), C.gold, { size: 88 });
  captions(t);
}

scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.renderThumb = async () => { await window.render(0); return TEXTLOG; };   // thumbnail = frame 0
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
