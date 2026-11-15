// Media Diet · 30 s English episode 16 — "Ten fans. No jet fuel." COMAC CE-25A electric airliner, first crewed flight (14 Nov 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted english-12…15 builds: a paper miniature
// in Media Diet brand colours with real cast shadows, one camera set-up per beat, restrained depth of field. Approved feedback rules
// (context/26) + first-frame rule: frame 0 shows the airliner with its ten fans and the 5-word hook; captions inside x 100–900.
// The aircraft is a generic reconstruction from published photos' description (T-tail, ten wing-top ducted fans), not a replica.
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
let sd = 1611; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
const frac = (x) => x - Math.floor(x);
const sh = (id) => TL.shots.find((s) => s.id === id);
const dummy = new THREE.Object3D();
const fill = new THREE.DirectionalLight('#ffe6cc', 1.0); fill.position.set(5, 6, 9); scene.add(fill);   // soft front fill, no shadows
const dusk = new THREE.DirectionalLight('#ff9a5a', 0.0); dusk.position.set(9, 3, -2); scene.add(dusk);

// ------------------------------------------------------------------ the airliner: a generic paper 19-seat commuter with ten wing-top ducted fans and a T-tail (not a replica)
function makePlane() { const g = new THREE.Group(); const fans = [];
  const body = paper('#f1eeff'), dark = paper('#24287e'), accent = paper(P.violet);
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 1.7, 8, 24), body); fus.rotation.z = Math.PI / 2; fus.castShadow = true; g.add(fus);
  const winTex = canvasTex(1024, 64, (c, w, h) => { c.fillStyle = '#f1eeff'; c.fillRect(0, 0, w, h); c.fillStyle = '#24287e'; for (let i = 0; i < 9; i++) { rr(c, 210 + i * 70, 18, 34, 26, 8); c.fill(); } rr(c, 60, 12, 80, 34, 12); c.fill(); c.fillStyle = P.violet; c.fillRect(0, 52, w, 7); });
  for (const s of [-1, 1]) { const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.11), new THREE.MeshStandardMaterial({ map: winTex, roughness: 0.9 })); strip.position.set(0.05, 0.02, s * 0.131); if (s < 0) strip.rotation.y = Math.PI; g.add(strip); }
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.035, 2.7), body); wing.position.set(0.12, 0.14, 0); wing.castShadow = true; g.add(wing);
  const ductMat = paper('#2b2d4f'); const bladeMat = new THREE.MeshStandardMaterial({ color: '#2addfa', emissive: P.cyan, emissiveIntensity: 0.6, roughness: 0.5 });
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const z = s * (0.27 + k * 0.23); const f = new THREE.Group(); f.position.set(0.2, 0.235, z); g.add(f);
    const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.14, 28, 1, true), ductMat); duct.rotation.z = Math.PI / 2; duct.castShadow = true; f.add(duct);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 8, 28), paper('#4b4e86')); lip.rotation.y = Math.PI / 2; lip.position.x = 0.07; f.add(lip);
    const rot = new THREE.Group(); f.add(rot); for (let b = 0; b < 4; b++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.15, 0.03), bladeMat); bl.rotation.x = b * Math.PI / 4; rot.add(bl); }
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), paper(P.magenta)); hub.position.x = 0.012; f.add(hub); fans.push(rot); }
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.03), body); fin.position.set(-0.93, 0.3, 0); fin.rotation.z = -0.25; fin.castShadow = true; g.add(fin);
  const hs = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.025, 0.9), body); hs.position.set(-1.0, 0.5, 0); hs.castShadow = true; g.add(hs);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.034), accent); stripe.position.set(-0.95, 0.38, 0); stripe.rotation.z = -0.25; g.add(stripe);
  const bat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.16), new THREE.MeshStandardMaterial({ color: '#3ddc84', emissive: '#3ddc84', emissiveIntensity: 0.5, transparent: true, opacity: 0 })); bat.position.set(0.05, -0.08, 0); g.add(bat);
  return { g, fans, bat, body }; }
const plane = makePlane(); scene.add(plane.g);
function spinFans(P_, t, k = 1) { P_.fans.forEach((r, i) => (r.rotation.x = t * 38 * k + i)); }

// ------------------------------------------------------------------ SKY + LAND: layered paper clouds over a patchwork of fields
const skySet = new THREE.Group(); scene.add(skySet);
const fieldTex = canvasTex(1024, 1024, (c, w, h) => { const cols = ['#9fbf74', '#c8b46a', '#7fa76a', '#b8c98a', '#d9c891', '#8bb07a']; let s_ = 9; const r = () => ((s_ = (s_ * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { c.fillStyle = cols[Math.floor(r() * cols.length)]; c.fillRect(i * 64, j * 64, 64, 64); }
  c.strokeStyle = 'rgba(80,90,60,0.35)'; c.lineWidth = 3; for (let i = 0; i <= 16; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); }
  c.strokeStyle = '#7fb3e0'; c.lineWidth = 16; c.beginPath(); c.moveTo(0, 700); c.bezierCurveTo(300, 600, 600, 860, 1024, 720); c.stroke(); });
fieldTex.wrapS = fieldTex.wrapT = THREE.RepeatWrapping;
fieldTex.repeat.set(3, 3);
const land = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: fieldTex, roughness: 0.95 })); land.rotation.x = -Math.PI / 2; land.position.y = 0.08; land.receiveShadow = true; skySet.add(land);
const skyCard = new THREE.Mesh(new THREE.PlaneGeometry(60, 24), new THREE.MeshBasicMaterial({ map: canvasTex(8, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1040'); gr.addColorStop(0.45, '#3a2f8c'); gr.addColorStop(0.78, '#c46a8a'); gr.addColorStop(1, '#ffb27a'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }), depthWrite: false })); skyCard.position.set(0, 9, -12); skySet.add(skyCard);
const cloudMat = paper('#f6f3ff'); const cloudShape = (() => { const s = new THREE.Shape(); s.moveTo(-0.6, 0); s.lineTo(0.6, 0); s.absarc(0.45, 0.12, 0.16, 0, Math.PI, false); s.absarc(0.12, 0.2, 0.24, 0, Math.PI, false); s.absarc(-0.25, 0.14, 0.2, 0, Math.PI, false); s.absarc(-0.5, 0.08, 0.1, 0, Math.PI, false); s.lineTo(-0.6, 0); return s; })();
const clouds = Array.from({ length: 18 }, (_, i) => { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(cloudShape, { depth: 0.05, bevelEnabled: false }), cloudMat); m.castShadow = true; const s = 0.8 + rnd() * 1.4; m.scale.setScalar(s);
  m.userData = i < 7 ? { x: -6 + rnd() * 12, y: 1.05 + rnd() * 0.45, z: -1.2 + rnd() * 2.6, sp: 0.7 + rnd() * 0.5 } : { x: -6 + rnd() * 12, y: 1.0 + rnd() * 2.6, z: -7 + rnd() * 4.5, sp: 0.5 + rnd() * 0.5 }; skySet.add(m); return m; });

// ------------------------------------------------------------------ MAP: range ring and short hops (schematic)
const mapSet = new THREE.Group(); scene.add(mapSet);
const mapTex = canvasTex(1024, 1024, (c, w, h) => { c.fillStyle = '#cfe6f5'; c.fillRect(0, 0, w, h); c.fillStyle = '#e9e1c6'; c.beginPath(); c.moveTo(0, 0); c.lineTo(760, 0); c.bezierCurveTo(820, 160, 700, 300, 820, 420); c.bezierCurveTo(900, 520, 780, 700, 860, 820); c.lineTo(900, 1024); c.lineTo(0, 1024); c.closePath(); c.fill();
  c.fillStyle = '#d7cfb0'; for (let i = 0; i < 14; i++) { c.beginPath(); c.ellipse(80 + (i * 137) % 640, 90 + (i * 263) % 860, 60, 30, i, 0, Math.PI * 2); c.fill(); } });
{ const m = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.03, 3.2), [paper(P.lav), paper(P.lav), new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.95 }), paper(P.lav), paper(P.lav), paper(P.lav)]); m.position.set(0, DESK + 0.015, 0); m.receiveShadow = true; mapSet.add(m); }
const CITIES = [[-0.35, 0.15], [0.55, -0.55], [-0.95, -0.7], [0.7, 0.75], [-0.8, 0.95], [0.15, -1.15]];
const cityMeshes = CITIES.map(([x, z], i) => { const g = new THREE.Group(); const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 20), paper(i === 0 ? P.magenta : '#24287e')); pin.position.y = 0.02; g.add(pin); g.position.set(x, DESK + 0.03, z); mapSet.add(g); return g; });
const ringR = 1.25;   // 400 km on this schematic map
const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 96), new THREE.MeshStandardMaterial({ color: '#ffd23f', emissive: '#ffd23f', emissiveIntensity: 0.5 })); ring.rotation.x = Math.PI / 2; ring.position.set(CITIES[0][0], DESK + 0.05, CITIES[0][1]); mapSet.add(ring);
const disc = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0.12, depthWrite: false })); disc.rotation.x = -Math.PI / 2; disc.position.set(CITIES[0][0], DESK + 0.035, CITIES[0][1]); mapSet.add(disc);
const HOPS = [[0, 1], [0, 3], [0, 4], [1, 5]];
const hopTubes = HOPS.map(([a, b]) => { const A = V3(CITIES[a][0], DESK + 0.05, CITIES[a][1]), B = V3(CITIES[b][0], DESK + 0.05, CITIES[b][1]); const M = A.clone().lerp(B, 0.5); M.y += 0.35 * A.distanceTo(B);
  const curve = new THREE.QuadraticBezierCurve3(A, M, B); const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.012, 8, false), new THREE.MeshStandardMaterial({ color: '#2addfa', emissive: '#2addfa', emissiveIntensity: 0.5 })); m.geometry.setDrawRange(0, 0); mapSet.add(m); return { m, curve }; });
const miniPlane = makePlane(); miniPlane.g.scale.setScalar(0.16); mapSet.add(miniPlane.g);

// ------------------------------------------------------------------ ENERGY PER KILO: one kilo of each, and its energy as stacked tiles
const energySet = new THREE.Group(); scene.add(energySet);
for (const x of [-0.65, 0.65]) { const p = card(0.9, 0.08, 0.7, P.deep, P.lav); p.position.set(x, DESK + 0.04, 0.1); energySet.add(p); }
const fuelCan = new THREE.Group(); { const b = card(0.26, 0.3, 0.16, '#ff8a3d', '#ffd2a8'); b.position.y = 0.15; fuelCan.add(b); const h = card(0.14, 0.05, 0.05, '#c45a1a', '#ffd2a8'); h.position.set(0.02, 0.33, 0); fuelCan.add(h); }
fuelCan.position.set(-0.65, DESK + 0.08, 0.32); energySet.add(fuelCan);
const cell = new THREE.Group(); { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.3, 24), [paper('#3ddc84'), paper('#24287e'), paper('#24287e')]); b.position.y = 0.15; b.castShadow = true; cell.add(b); const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 16), paper('#cfd2de')); tip.position.y = 0.315; cell.add(tip); }
cell.position.set(0.65, DESK + 0.08, 0.32); energySet.add(cell);
const TILE = 0.075; const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(TILE, TILE, TILE), new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffd23f', emissiveIntensity: 0.35, roughness: 0.6 }), 52);
tiles.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(52 * 3), 3); tiles.castShadow = true; energySet.add(tiles);
const GOLD = new THREE.Color('#ffd23f'), HOTC = new THREE.Color('#ff4d6d'), GREEN = new THREE.Color('#3ddc84');

// ------------------------------------------------------------------ WEIGHT OVER THE FLIGHT: two planes on scales
const scaleSet = new THREE.Group(); scene.add(scaleSet);
const scalePlanes = [-0.62, 0.62].map((x, i) => { const base = card(0.95, 0.1, 0.6, P.deep, P.lav); base.position.set(x, DESK + 0.05, 0); scaleSet.add(base);
  const plate = card(0.85, 0.04, 0.5, '#cfc9ee', P.white); plate.position.set(x, DESK + 0.12, 0); scaleSet.add(plate);
  const pl = makePlane(); pl.g.scale.setScalar(0.34); pl.g.position.set(x, DESK + 0.36, 0); pl.g.rotation.y = -0.6; scaleSet.add(pl.g);
  const blk = card(0.34, 0.3, 0.3, i ? '#3ddc84' : '#ff8a3d', P.white); blk.position.set(x, DESK + 0.14 + 0.15, 0.36); scaleSet.add(blk); return { x, plate, pl, blk }; });

// ------------------------------------------------------------------ CTA sign (Media Diet identity only)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, 1024, 300); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0, DESK, 1.0);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const U = (id, t) => prog(t, sh(id).in, sh(id).out, (x) => x);
const SHOTS = {
  S1: (t) => { const u = U('S1', t); return SH(L3([1.95, 3.05, 5.9], [1.85, 3.0, 5.65], u), V3(0.05, 2.02, 0), 42); },
  S2: (t) => { const u = U('S2', t); return SH(L3([-3.1, 3.5, 5.2], [-2.6, 3.4, 5.3], u), V3(0.1, 1.75, 0), 42); },
  S3: (t) => { const u = U('S3', t); return SH(L3([0.0, 4.6, 2.9], [0.0, 4.4, 2.7], u), V3(-0.25, 0.0, 0.1), 42); },
  S4: (t) => { const u = U('S4', t); return SH(L3([0.1, 1.55, 5.5], [0.05, 1.5, 5.3], u), V3(0.0, 0.66, 0), 42); },
  S5: (t) => { const u = U('S5', t); return SH(L3([-0.3, 1.6, 5.45], [-0.25, 1.55, 5.25], u), V3(0.0, 0.66, 0), 42); },
  S6: (t) => { const u = U('S6', t); return SH(L3([0.1, 1.5, 5.3], [0.05, 1.45, 5.1], u), V3(0.0, 0.38, 0), 42); },
  S7: (t) => { const u = U('S7', t); return SH(L3([0.6, 4.2, 3.4], [0.45, 4.0, 3.2], u), V3(-0.1, 0.0, 0.0), 42); },
  S8: (t) => { const u = U('S8', t); return SH(L3([0.35, 2.3, 7.6], [0.3, 2.45, 8.0], u), L3([0, 1.05, 0.5], [0, 1.1, 0.45], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;
  const sky = id === 'S1' || id === 'S2' || id === 'S8'; skySet.visible = sky; mapSet.visible = id === 'S3' || id === 'S7'; energySet.visible = id === 'S4' || id === 'S5'; scaleSet.visible = id === 'S6'; sign.visible = id === 'S8';
  plane.g.visible = sky; dusk.intensity = sky ? 1.1 : 0.3; land.visible = id !== 'S8'; skyCard.visible = sky;
  // flight
  if (sky) { const bank = id === 'S2' ? -0.08 : -0.04; plane.g.position.set(id === 'S2' ? lerp(-0.6, 0.6, U('S2', t)) : 0, (id === 'S8' ? 1.85 : 2.2) + 0.03 * Math.sin(t * 1.3), 0); plane.g.rotation.set(id === 'S1' ? 0.05 : bank, id === 'S8' ? 0.5 : id === 'S1' ? -0.85 : 0.25, id === 'S1' ? -0.05 : 0.03); spinFans(plane, t);
    clouds.forEach((c) => { const x = c.userData.x - ((t * c.userData.sp) % 12); c.position.set(x < -6 ? x + 12 : x, c.userData.y, c.userData.z); c.visible = id === 'S8' ? c.userData.z < -2 : true; }); }
  // map: the 400 km ring (S3) and the short hops (S7)
  if (mapSet.visible) { const rr_ = id === 'S3' ? ringR * prog(t, E.ring, E.ring + 1.0, outC) : ringR; ring.scale.setScalar(Math.max(0.01, rr_)); disc.scale.setScalar(Math.max(0.01, rr_)); ring.visible = disc.visible = rr_ > 0.02;
    cityMeshes.forEach((c, i) => { c.scale.setScalar(Math.max(0.01, i === 0 ? 1 : (id === 'S7' ? 1 : prog(t, E.ring + 0.6 + i * 0.08, E.ring + 0.9 + i * 0.08, outBack)))); });
    hopTubes.forEach((H, i) => { const k = id === 'S7' ? prog(t, E.hops + i * 0.45, E.hops + i * 0.45 + 0.6) : 0; H.m.geometry.setDrawRange(0, Math.floor(k * 48) * 8 * 6); H.m.visible = k > 0.01; });
    miniPlane.g.visible = id === 'S7' && t > E.hops; if (miniPlane.g.visible) { const H = hopTubes[0]; const k = prog(t, E.hops, E.hops + 1.6); const p = H.curve.getPoint(k), q = H.curve.getPoint(Math.min(1, k + 0.02)); miniPlane.g.position.copy(p); miniPlane.g.lookAt(q); miniPlane.g.rotateY(-Math.PI / 2); spinFans(miniPlane, t); } }
  // energy tiles
  if (energySet.visible) { let q = 0; const fuelN = 50; const fuelShow = prog(t, E.fuel, E.fuel + 1.5, (x) => x) * fuelN; const lost = id === 'S5' ? prog(t, E.waste, E.waste + 1.2) : 0;
    for (let i = 0; i < fuelN; i++) { const col = i % 5, row = Math.floor(i / 5); const on = id === 'S5' ? 1 : clamp(fuelShow - i); const waste = i >= 25 ? lost : 0;
      dummy.position.set(-0.65 + (col - 2) * (TILE + 0.012), DESK + 0.12 + TILE / 2 + row * (TILE + 0.01) + waste * 0.6, 0.05 + waste * 0.2); dummy.rotation.set(waste * 1.2, waste * 2, 0); dummy.scale.setScalar(Math.max(0.0001, on * (1 - waste * 0.85))); dummy.updateMatrix(); tiles.setMatrixAt(q, dummy.matrix); tiles.setColorAt(q, GOLD.clone().lerp(HOTC, waste)); q++; }
    { const on = prog(t, E.batt, E.batt + 0.3, outBack); dummy.position.set(0.65, DESK + 0.12 + TILE / 2, 0.05); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(Math.max(0.0001, on)); dummy.updateMatrix(); tiles.setMatrixAt(q, dummy.matrix); tiles.setColorAt(q, GREEN); q++;
      const two = id === 'S5' ? prog(t, E.twice, E.twice + 0.35, outBack) : 0; dummy.position.set(0.65, DESK + 0.12 + TILE * 1.5 + 0.01, 0.05); dummy.scale.setScalar(Math.max(0.0001, two)); dummy.updateMatrix(); tiles.setMatrixAt(q, dummy.matrix); tiles.setColorAt(q, GREEN); q++; }
    tiles.instanceMatrix.needsUpdate = true; tiles.instanceColor.needsUpdate = true; }
  // weight over the flight: fuel block shrinks, battery block stays
  if (scaleSet.visible) { const burn = prog(t, E.burn, E.burn + 2.4, (x) => x); scalePlanes.forEach((S, i) => { const h = i ? 1 : 1 - 0.75 * burn; S.blk.scale.set(1, Math.max(0.02, h), 1); S.blk.position.y = DESK + 0.14 + 0.15 * h; S.plate.position.y = DESK + 0.12 - (i ? 0.03 : 0.03 * (1 - burn * 0.75)); spinFans(S.pl, t); }); }
  const sgu = prog(t, E.sign, E.sign + 0.45, outBack); sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(sgu, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}

// ------------------------------------------------------------------ 2-D overlay: one large, brief label at a time (never in the caption band)
function chip(text, x, y, bg, o = {}) { og.save(); og.font = o.font || '700 30px "Space Grotesk"'; const w = og.measureText(text).width + 40, h = o.h || 52; const x0 = o.align === 'left' ? x : x - w / 2; og.globalAlpha = o.alpha ?? 1; og.fillStyle = bg; rr(og, x0, y - h / 2, w, h, h / 2); og.fill(); og.restore();
  otext(text, x0 + w / 2, y + (o.dy ?? 11), { font: o.font || '700 30px "Space Grotesk"', alpha: o.alpha ?? 1, shadow: 0, kind: o.kind || 'label', color: o.color }); }
function big(text, y, a, bg, o = {}) { if (a <= 0.01) return; let fs = o.size || 78; og.save(); og.font = `700 ${fs}px "Space Grotesk"`; const w = og.measureText(text).width; og.restore();
  if (w > 680) fs = Math.floor(fs * 680 / w); const yy = y + (1 - outC(clamp(a))) * 18;   // centred at x 540: ≤ 680 px keeps every label inside x 100–900
  chip(text, o.x ?? 540, yy, bg, { font: `700 ${fs}px "Space Grotesk"`, h: Math.round(fs * 1.42), alpha: clamp(a), dy: Math.round(fs * 0.36), color: o.color }); }
const win = (t, a, b, f = 0.25) => prog(t, a, a + f) * (1 - prog(t, b - 0.12, b));
const C = { teal: 'rgba(18,122,143,0.94)', red: 'rgba(196,40,74,0.94)', gold: 'rgba(176,112,0,0.95)', green: 'rgba(26,127,75,0.95)', violet: 'rgba(85,45,188,0.94)' };
function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = []; const id = shot.id;
  const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  if (id === 'S2') { chip('COMAC CE-25A · first crewed flight · 14 Nov 2026', 540, 1372, 'rgba(254,64,146,0.92)', { font: '700 27px "Space Grotesk"', alpha: prog(t, 2.3, 2.6) });
    chip('editorial reconstruction', 540, 1446, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, 2.3, 2.6), dy: 9 }); }
  if (id === 'S3') big('400 km (stated)', 1390, prog(t, E.lab400, E.lab400 + 0.25), C.gold, { size: 80 });
  if (id === 'S4') big('~50× energy per kilo', 1390, prog(t, E.lab50, E.lab50 + 0.25), C.gold, { size: 72 });
  if (id === 'S5') big('still ~25×', 1390, prog(t, E.lab25, E.lab25 + 0.25), C.red, { size: 84 });
  if (id === 'S6') big('battery weight stays', 1390, prog(t, E.labW, E.labW + 0.25), C.green, { size: 70 });
  if (id === 'S7') big('short hops first', 1390, prog(t, E.labHop, E.labHop + 0.25), C.teal, { size: 80 });
  captions(t);
}

scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
// thumbnail = the first frame (the airliner with its ten fans + the hook words)
window.renderThumb = async () => { await window.render(0); return TEXTLOG; };
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
