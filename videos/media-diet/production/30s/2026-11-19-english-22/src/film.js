// Media Diet · 30 s English episode 22 — "Five minutes. What's the catch?" BYD flash charging (Tai 9 launch 19 Nov 2026; Abu Dhabi press demo)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted english-12…21 builds: a paper miniature
// in Media Diet brand colours with real cast shadows, one camera set-up per beat, deeper foreground depth (frame-0 nozzle in bokeh).
// Approved feedback rules (context/26 incl. 17 Nov addendum) + first-frame rule: frame 0 = a huge nozzle facing a tiny battery gate + the
// hook. Car, charger, cell cross-section and curve are generic paper models (no BYD imagery). Deterministic: window.render(f).
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
const X = V3(1, 0, 0), Y = V3(0, 1, 0);
function seg(m, a, b, r) { const d = b.clone().sub(a); const L = d.length(); if (L < 1e-5) { m.visible = false; return; } m.visible = true; m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Y, d.normalize()); m.scale.set(r, L, r); }
const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 16);
const CYAN = '#2addfa', GREEN = '#3ddc84', AMBER = '#ffb21f', GOLD = '#ffd23f';
const glowMat = (col, op = 1) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending });

// ------------------------------------------------------------------ frame 0: a huge charging nozzle facing a tiny battery gate
const nozzle = new THREE.Group(); scene.add(nozzle);
{ const head = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.62, 40), paper('#d7d3ea')); head.rotation.z = Math.PI / 2; head.castShadow = true; nozzle.add(head);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.31, 40), paper('#1b1e40')); face.rotation.y = Math.PI / 2; face.position.x = 0.312; nozzle.add(face);
  [[0.09, 0.1], [-0.09, 0.1], [0, -0.1]].forEach(([z, y], i) => { const pin = new THREE.Mesh(new THREE.CylinderGeometry(i < 2 ? 0.07 : 0.09, i < 2 ? 0.07 : 0.09, 0.05, 24), glowMat(CYAN, 0.9)); pin.rotation.z = Math.PI / 2; pin.position.set(0.32, y, z); nozzle.add(pin); });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 12, 64), glowMat(CYAN, 0.95)); ring.rotation.y = Math.PI / 2; ring.position.x = 0.315; nozzle.add(ring); nozzle.userData.ring = ring;
  const grip = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.95, 0.34, 4, 0.12), paper(P.violet)); const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 40), paper(P.violet)); collar.rotation.z = Math.PI / 2; collar.position.x = 0.22; nozzle.add(collar); grip.position.set(-0.42, -0.42, 0); grip.rotation.z = 0.35; grip.castShadow = true; nozzle.add(grip);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(-0.6, -0.85, 0), V3(-0.9, -1.4, 0.2), V3(-1.6, -1.7, 0.6), V3(-2.6, -1.8, 1.0)]), 40, 0.11, 16), paper('#1b1e40')); cable.castShadow = true; nozzle.add(cable); }
const gateBat = new THREE.Group(); scene.add(gateBat);
{ const body = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.42, 0.34, 4, 0.05), paper(P.lav)); body.castShadow = true; gateBat.add(body);
  const band = card(0.64, 0.08, 0.36, P.violet, P.violet); band.position.y = 0.12; gateBat.add(band);
  const term = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 20), paper('#cfc8ff')); term.position.set(0.18, 0.24, 0); gateBat.add(term);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.05), glowMat(CYAN, 0.95)); slot.position.set(-0.12, 0.222, 0); gateBat.add(slot); gateBat.userData.slot = slot;
  const frameG = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.01, 0.09), paper(P.ink)); frameG.position.set(-0.12, 0.214, 0); gateBat.add(frameG); }

// ------------------------------------------------------------------ the car at a flash charger (generic paper SUV) + a big charge gauge
const car = new THREE.Group(); scene.add(car);
{ const body = new THREE.Mesh(new RoundedBoxGeometry(1.7, 0.46, 0.76, 4, 0.1), paper('#d8a43a')); body.position.y = 0.38; body.castShadow = true; car.add(body);
  const cabin = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.36, 0.7, 4, 0.08), paper('#e2b44e')); cabin.position.set(-0.1, 0.76, 0); cabin.castShadow = true; car.add(cabin);
  const glass = new THREE.Mesh(new RoundedBoxGeometry(1.0, 0.24, 0.72, 3, 0.05), paper('#1f2350')); glass.position.set(-0.1, 0.79, 0); car.add(glass);
  [[-0.55, 0.4], [0.55, 0.4], [-0.55, -0.4], [0.55, -0.4]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.14, 24), paper(P.ink)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.19, z); w.castShadow = true; car.add(w); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 16), paper('#b9b4cf')); hub.rotation.x = Math.PI / 2; hub.position.set(x, 0.19, z); car.add(hub); });
  const port = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), glowMat(CYAN, 0.9)); port.position.set(0.62, 0.5, 0.385); car.add(port); }
car.position.set(0.15, DESK, -0.2);
const charger = new THREE.Group(); scene.add(charger);
{ const pillar = card(0.36, 1.45, 0.32, P.white, P.lav); pillar.position.y = 0.725; charger.add(pillar); const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.3), glowMat(CYAN, 0.7)); screen.position.set(0, 1.12, 0.165); charger.add(screen);
  const stripe = card(0.37, 0.08, 0.33, P.violet, P.violet); stripe.position.y = 1.38; charger.add(stripe); }
charger.position.set(1.45, DESK, 0.35);
const chgCable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(1.45, DESK + 0.9, 0.52), V3(1.3, DESK + 0.35, 0.85), V3(0.95, DESK + 0.3, 0.62), V3(0.78, DESK + 0.5, 0.2)]), 40, 0.035, 12), paper('#1b1e40')); scene.add(chgCable);
const cableCurve = new THREE.CatmullRomCurve3([V3(1.45, DESK + 0.9, 0.52), V3(1.3, DESK + 0.35, 0.85), V3(0.95, DESK + 0.3, 0.62), V3(0.78, DESK + 0.5, 0.2)]);
const PULSE = Array.from({ length: 18 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), glowMat(CYAN)); scene.add(m); return m; });
const gauge = new THREE.Group(); scene.add(gauge);
{ const shell = new THREE.Mesh(new RoundedBoxGeometry(0.42, 1.25, 0.12, 4, 0.06), paper(P.white)); shell.position.y = 0.625; gauge.add(shell); const cap = card(0.16, 0.06, 0.1, P.lav, P.lav); cap.position.y = 1.28; gauge.add(cap);
  [0.1, 0.7, 0.97].forEach((p) => { const tk = card(0.46, 0.012, 0.13, P.ink, P.ink); tk.position.set(0, 0.08 + 1.09 * p, 0); gauge.add(tk); }); }
const gFill = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1, 0.13), new THREE.MeshStandardMaterial({ color: GREEN, emissive: GREEN, emissiveIntensity: 0.4 })); gFill.geometry.translate(0, 0.5, 0); gFill.position.y = 0.08; gauge.add(gFill);
const gBand = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1, 0.135), new THREE.MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 0.35, transparent: true, opacity: 0 })); gBand.geometry.translate(0, 0.5, 0); gauge.add(gBand);
function setGauge(soc, band = 0) { gFill.scale.y = Math.max(0.001, 1.09 * soc); gBand.position.y = 0.08 + 1.09 * 0.7; gBand.scale.y = 1.09 * 0.3; gBand.material.opacity = band * 0.85;
  gFill.material.color.set(band > 0.5 ? GREEN : GREEN); }

// ------------------------------------------------------------------ the measured curve (BYD's Abu Dhabi press demo): 70 % at 5:17, 97 % at 8:57
const board = new THREE.Group(); scene.add(board);
const BWID = 1.05, BHT = 1.4;
{ const panel = card(BWID + 0.3, BHT + 0.3, 0.04, '#efecff', P.lav, 'z'); panel.position.set(BWID / 2 - 0.05, BHT / 2 - 0.02, -0.03); board.add(panel);
  const ax = card(BWID, 0.016, 0.02, P.ink, P.ink, 'z'); ax.position.set(BWID / 2, 0, 0.005); board.add(ax); const ay = card(0.016, BHT, 0.02, P.ink, P.ink, 'z'); ay.position.set(0, BHT / 2, 0.005); board.add(ay);
  for (let m = 1; m <= 9; m++) { const tk = card(0.008, 0.05, 0.02, P.ink, P.ink, 'z'); tk.position.set(m / 9 * BWID, -0.03, 0.005); board.add(tk); }
  [0.7, 0.97].forEach((p) => { const g = card(BWID, 0.006, 0.01, '#b9b4cf', '#b9b4cf', 'z'); g.position.set(BWID / 2, p * BHT, 0); board.add(g); }); }
const socAt = (min) => (min <= 5.283 ? 0.10 + 0.60 * (1 - Math.pow(1 - min / 5.283, 1.15)) : 0.70 + 0.27 * (1 - Math.pow(1 - Math.min(1, (min - 5.283) / 3.667), 1.6)));
const curvePts = []; for (let i = 0; i <= 120; i++) { const m = 8.95 * i / 120; curvePts.push(V3(m / 9 * BWID, socAt(m) * BHT, 0.02)); }
const curveGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePts), 240, 0.016, 10); const curve = new THREE.Mesh(curveGeo, new THREE.MeshStandardMaterial({ color: GREEN, emissive: GREEN, emissiveIntensity: 0.5 })); board.add(curve);
const curveSlow = new THREE.Mesh(curveGeo, new THREE.MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 0.55 })); board.add(curveSlow);
const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 18, 12), glowMat('#ffffff')); board.add(dot);
const mark70 = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 10), glowMat(GREEN)); board.add(mark70); mark70.position.set(5.283 / 9 * BWID, 0.7 * BHT, 0.03);
const mark97 = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 10), glowMat(AMBER)); board.add(mark97); mark97.position.set(8.95 / 9 * BWID, 0.97 * BHT, 0.03);
function drawCurve(minutes) { const idxTotal = curveGeo.index.count; const f = clamp(minutes / 8.95); const split = 5.283 / 8.95; const n = Math.floor(idxTotal * f / 6) * 6; const ns = Math.floor(idxTotal * Math.min(f, split) / 6) * 6;
  curve.geometry = curveGeo; curve.geometry.setDrawRange(0, Math.max(0, ns)); curveSlow.geometry = curveGeo.clone(); curveSlow.geometry.setDrawRange(ns, Math.max(0, n - ns));
  const m = clamp(minutes, 0, 8.95); dot.position.set(m / 9 * BWID, socAt(m) * BHT, 0.035); mark70.visible = minutes >= 5.283; mark97.visible = minutes >= 8.95; }
board.position.set(-0.8, DESK + 0.35, 0.3);

// ------------------------------------------------------------------ cinematic cell cross-section: cathode | separator | graphite anode (layers), ions, plating, heat
const cell = new THREE.Group(); scene.add(cell); cell.position.set(0, DESK, 0.2);
const CW = 2.0, CHt = 1.25, CD = 0.5;
const heatMats = [];
const mkLayer = (w, h, x, col, em = '#ff5a1f') => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, CD), new THREE.MeshStandardMaterial({ map: grain, bumpMap: grain, bumpScale: 2, color: col, roughness: 0.85, emissive: em, emissiveIntensity: 0 })); m.position.set(x, CHt / 2 + 0.02, 0); m.castShadow = true; cell.add(m); heatMats.push(m.material); return m; };
mkLayer(0.05, CHt, -CW / 2, '#c9c6d8');                       // aluminium collector
mkLayer(0.66, CHt, -CW / 2 + 0.36, '#7c3fda');                 // cathode (LFP)
const sepL = mkLayer(0.06, CHt, -0.03, '#f3f1ff');             // separator
const ANX0 = 0.0, ANX1 = 0.86;
const sheets = []; for (let k = 0; k < 9; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(ANX1 - ANX0, 0.07, CD), new THREE.MeshStandardMaterial({ map: grain, color: '#3a3d58', roughness: 0.8, emissive: '#ff5a1f', emissiveIntensity: 0 })); s.position.set((ANX0 + ANX1) / 2 + 0.03, 0.12 + k * 0.135, 0); s.castShadow = true; cell.add(s); sheets.push(s); heatMats.push(s.material); }
mkLayer(0.05, CHt, ANX1 + 0.06, '#c8743a');                    // copper collector
{ const back = card(CW + 0.2, CHt + 0.1, 0.04, P.deep, P.lav, 'z'); back.position.set(0.03, CHt / 2 + 0.02, -CD / 2 - 0.03); cell.add(back); }
const IONS = Array.from({ length: 46 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), glowMat(CYAN)); cell.add(m); return m; });
const PLATE = Array.from({ length: 34 }, (_, i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.018 + (i % 3) * 0.006, 0.05 + (i % 4) * 0.02, 8), new THREE.MeshStandardMaterial({ color: '#e8e8f2', metalness: 0.9, roughness: 0.25, emissive: '#9fa4c4', emissiveIntensity: 0.25 })); m.rotation.z = Math.PI / 2; cell.add(m); return m; });
const thermo = new THREE.Group(); scene.add(thermo);
{ const tube = card(0.1, 1.1, 0.04, '#efecff', P.lav); tube.position.y = 0.6; thermo.add(tube); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 14), paper('#ff4d6d')); bulb.position.y = 0.04; thermo.add(bulb); }
const tCol = new THREE.Mesh(new THREE.BoxGeometry(0.045, 1, 0.05), new THREE.MeshStandardMaterial({ color: '#ff4d6d', emissive: '#ff4d6d', emissiveIntensity: 0.4 })); tCol.geometry.translate(0, 0.5, 0); tCol.position.set(0, 0.08, 0.012); thermo.add(tCol);
thermo.position.set(1.28, DESK, 0.42);
const FLAKES = Array.from({ length: 10 }, (_, i) => { const m = new THREE.Mesh(starGeo, new THREE.MeshStandardMaterial({ color: '#e9f6ff', emissive: '#9fdcff', emissiveIntensity: 0.4 })); m.scale.setScalar(0.18 + (i % 3) * 0.07); scene.add(m); return m; });

// ------------------------------------------------------------------ CTA sign (Media Diet identity only) + a small charger behind it
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, 1024, 300); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot2 = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot2.position.set(0, 0.015, 0.2); sign.add(foot2); }
sign.position.set(0, DESK + 0.02, 1.2);

// ------------------------------------------------------------------ camera shots
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const U = (id, t) => prog(t, sh(id).in, sh(id).out, (x) => x);
const SHOTS = {
  S1: (t) => { const u = U('S1', t); return SH(L3([0.5, 0.42, 2.45], [0.46, 0.41, 2.35], u), V3(0.0, 0.8, 0.25), 40, 2.4); },
  S2: (t) => { const u = U('S2', t); return SH(L3([0.65, 1.6, 4.3], [0.55, 1.5, 4.1], u), V3(0.25, 0.62, 0.1), 40); },
  S3: (t) => { const u = U('S3', t); return SH(L3([1.6, 0.9, 1.75], [1.5, 0.85, 1.6], u), V3(0.85, 0.55, 0.25), 38); },
  S4: (t) => { const u = U('S4', t); return SH(L3([-0.1, 1.15, 3.45], [-0.12, 1.12, 3.3], u), V3(-0.28, 1.05, 0.3), 40); },
  S5: (t) => { const u = U('S5', t); return SH(L3([0.45, 1.0, 3.35], [0.35, 0.95, 3.15], u), V3(0.05, 0.66, 0.2), 40); },
  S6: (t) => { const u = U('S6', t); return SH(L3([0.7, 0.95, 3.2], [0.65, 0.93, 3.1], u), V3(0.25, 0.66, 0.25), 40); },
  S7: (t) => { const u = U('S7', t); return SH(L3([0.15, 1.2, 3.4], [0.1, 1.18, 3.25], u), V3(-0.28, 1.05, 0.3), 40); },
  S8: (t) => { const u = U('S8', t); return SH(L3([0.55, 1.05, 2.2], [0.5, 1.0, 2.05], u), V3(0.0, 0.72, 0.2), 40); },
  S9: (t) => { const u = U('S9', t); return SH(L3([0.3, 1.75, 6.6], [0.25, 1.95, 7.0], u), L3([0, 0.85, 0.4], [0, 0.9, 0.35], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = id === 'S1' ? 0.0016 : 0.0006; bokeh.uniforms.maxblur.value = id === 'S1' ? 0.008 : 0.005;
  nozzle.visible = gateBat.visible = id === 'S1'; car.visible = charger.visible = chgCable.visible = id === 'S2' || id === 'S3'; gauge.visible = id === 'S8';
  board.visible = id === 'S4' || id === 'S7'; cell.visible = ['S5', 'S6'].includes(id); thermo.visible = id === 'S6'; sign.visible = id === 'S9';
  PULSE.forEach((m) => (m.visible = false)); FLAKES.forEach((m) => (m.visible = false)); IONS.forEach((m) => (m.visible = false)); PLATE.forEach((m) => (m.visible = false));
  heatMats.forEach((m) => (m.emissiveIntensity = 0));
  if (id === 'S1') { // a huge nozzle in front of a tiny gate
    nozzle.position.set(-0.05, 1.12 - 0.03 * Math.sin(t * 2), 0.25); nozzle.rotation.set(0.15, -0.5, -Math.PI / 2 + 0.08); gateBat.position.set(0.05, DESK + 0.15, 0.3); gateBat.rotation.y = -0.35; gateBat.scale.setScalar(0.6);
    nozzle.userData.ring.material.opacity = 0.75 + 0.2 * Math.sin(t * 6); gateBat.userData.slot.material.opacity = 0.6 + 0.35 * Math.sin(t * 9); }
  if (id === 'S2') { // the claim: 10 → 70 % in five minutes (gauge sweeps)
    gauge.position.set(-0.22, DESK + 0.62, 1.75); gauge.rotation.y = 0.1; gauge.scale.setScalar(0.42); setGauge(lerp(0.1, 0.7, prog(t, E.fill, E.fill + 1.9)));
    PULSE.forEach((m, i) => { m.visible = t > E.fill - 0.3; const k = (t * 0.9 + i / PULSE.length) % 1; m.position.copy(cableCurve.getPoint(k)); }); }
  if (id === 'S3') { // pour in a megawatt? the pulses jam at the port
    const jam = prog(t, E.jam, E.jam + 0.6); PULSE.forEach((m, i) => { m.visible = true; const k = (t * (0.9 + 1.4 * jam) + i / PULSE.length) % 1; const kk = jam > 0 ? Math.min(k, 1 - 0.18 * jam * (i % 5) / 5) : k; m.position.copy(cableCurve.getPoint(kk)); m.scale.setScalar(1 + 0.6 * jam); }); }
  if (id === 'S4' || id === 'S7') { // the measured demo curve: steep to 70 %, then it bends
    board.rotation.y = id === 'S4' ? 0.0 : -0.12; const mins = id === 'S4' ? 8.95 * prog(t, E.curve, E.curve + 3.0, (x) => x) : 8.95; drawCurve(mins); curveSlow.material.emissiveIntensity = 0.55 + (id === 'S7' ? 0.3 * Math.sin(t * 6) ** 2 : 0);
    if (id === 'S7') { FLAKES.forEach((m, i) => { if (t < E.cold) return; m.visible = true; const k = (t - E.cold) * 0.35 + i * 0.1; m.position.set(-0.9 + (i * 0.37) % 1.3, DESK + 2.0 - ((k * 1.1) % 1.8), 0.7 + (i % 3) * 0.1); m.rotation.z = t + i; }); } }
  if (id === 'S5' || id === 'S6') { // ions cross the separator and slide between graphite sheets; rushed, they plate as metal
    const rush = id === 'S6' ? 1 : prog(t, E.rush, E.rush + 0.5); const flow = 0.45 + 1.2 * rush;
    IONS.forEach((m, i) => { m.visible = true; const k = (t * flow * 0.35 + i / IONS.length) % 1; const lane = i % 9; const ly = 0.12 + lane * 0.135 + 0.068;
      let x, y; if (k < 0.45) { x = lerp(-0.62, -0.05, k / 0.45); y = 0.2 + ((i * 37) % 100) / 100 * 1.0; } else if (k < 0.6) { const u = (k - 0.45) / 0.15; x = lerp(-0.05, 0.03, u); y = lerp(0.2 + ((i * 37) % 100) / 100 * 1.0, ly, u); } else { const u = (k - 0.6) / 0.4; x = lerp(0.03, 0.03 + (0.8 * (1 - 0.75 * rush)) * u, 1); x = 0.03 + (0.8 - 0.62 * rush) * u; y = ly; }
      m.position.set(x, y + 0.02, CD / 2 + 0.01); m.material.opacity = 0.95; });
    const pl = id === 'S6' ? 1 : prog(t, E.plate, E.plate + 1.0); PLATE.forEach((m, i) => { const show = i / PLATE.length < pl; m.visible = show; const yy = 0.15 + ((i * 53) % 100) / 100 * 1.05; m.position.set(0.05 + 0.03 * (i % 3), yy, CD / 2 - 0.06 + 0.04 * (i % 4)); m.scale.setScalar(show ? Math.min(1, (pl - i / PLATE.length) * 6) : 0.001); });
    if (id === 'S6') { const h = prog(t, E.heat, E.heat + 0.9); heatMats.forEach((m) => (m.emissiveIntensity = 0.55 * h * (0.85 + 0.15 * Math.sin(t * 7)))); tCol.scale.y = 0.2 + 0.85 * h; } }
  if (id === 'S8') { // payoff: the fast zone is the middle
    gauge.position.set(0, DESK, 0.15); gauge.rotation.y = 0; gauge.scale.setScalar(1.0); setGauge(0.97, prog(t, E.band, E.band + 0.4)); }
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
  if (id === 'S2') { big('10→70% in 5 min (claim)', 1370, prog(t, E.labClaim, E.labClaim + 0.25), C.green, { size: 66 });
    chip('BYD Tai 9 (Ti 9) · launch 19 Nov 2026 · BYD claim', 540, 1462, 'rgba(13,18,64,0.78)', { font: '700 25px "Space Grotesk"', h: 46, alpha: prog(t, 1.95, 2.25), dy: 9 }); }
  if (id === 'S4') { big('last 27%: 3 min 40 s', 1370, prog(t, E.labDemo, E.labDemo + 0.25), C.gold, { size: 72 });
    chip('BYD press demo, Abu Dhabi · reported 13 Nov 2026', 540, 1462, 'rgba(13,18,64,0.78)', { font: '700 25px "Space Grotesk"', h: 46, alpha: prog(t, 8.4, 8.7), dy: 9 }); }
  if (id === 'S5') big('rushed → lithium plating', 1390, prog(t, E.labPlate, E.labPlate + 0.25), C.violet, { size: 66 });
  if (id === 'S6') big('heat ∝ current²', 1390, prog(t, E.labHeat, E.labHeat + 0.25), C.red, { size: 80 });
  if (id === 'S7') { big('battery sets the pace', 1370, win(t, E.labPace, 30), C.teal, { size: 72 });
    chip('BYD claim at −30 °C: 20→97% in 12 min', 540, 1462, 'rgba(13,18,64,0.78)', { font: '700 25px "Space Grotesk"', h: 46, alpha: prog(t, E.cold, E.cold + 0.3), dy: 9 }); }
  if (id === 'S8') big('fast zone: the middle', 1390, prog(t, E.labMid, E.labMid + 0.25), C.green, { size: 74 });
  captions(t);
}

scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.renderThumb = async () => { await window.render(0); return TEXTLOG; };   // thumbnail = frame 0
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
