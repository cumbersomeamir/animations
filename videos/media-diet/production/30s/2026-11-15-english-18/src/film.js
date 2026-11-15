// Media Diet · 30 s English episode 18 — "Copper isn't magnetic." Jake Rogers' 3D-printed hoverboard floating over copper (YouTube, 13 Nov 2026 UTC)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted english-12…17 builds: a paper miniature
// in Media Diet brand colours with real cast shadows, one camera set-up per beat, restrained depth of field. Approved feedback rules
// (context/26) + first-frame rule: frame 0 = the board hovering over a copper plate + the 3-word hook. The board is a generic
// reconstruction (shell + two rotors of 12 magnets), not a replica; eddy-current loops are schematic. Deterministic: window.render(f).
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
const Y = V3(0, 1, 0);
function seg(m, a, b, r) { const d = b.clone().sub(a); const L = d.length(); if (L < 1e-5) { m.visible = false; return; } m.visible = true; m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Y, d.normalize()); m.scale.set(r, L, r); }

// ------------------------------------------------------------------ copper: a brushed metal plate (the only metal in the paper world; reflections from a neutral room map on this material only)
const envTex = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const copperTex = canvasTex(1024, 640, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f0a77a'); gr.addColorStop(0.45, '#d9875a'); gr.addColorStop(1, '#b8673e'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2200; i++) { const y = r() * h; g.strokeStyle = r() < 0.6 ? `rgba(255,226,196,${0.04 + r() * 0.07})` : `rgba(110,48,20,${0.02 + r() * 0.04})`; g.lineWidth = 0.4 + r() * 0.8; g.beginPath(); g.moveTo(r() * w * 0.3, y); g.lineTo(w * (0.6 + r() * 0.4), y + (r() - 0.5) * 3); g.stroke(); } });
const copperMat = new THREE.MeshStandardMaterial({ color: '#ffc49e', map: copperTex, metalness: 1.0, roughness: 0.2, envMap: envTex, envMapIntensity: 1.5 });
const copperEdge = new THREE.MeshStandardMaterial({ color: '#8f4a22', metalness: 0.7, roughness: 0.4, envMap: envTex, envMapIntensity: 0.7 });
function copperPlate(w, d, h = 0.07) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [copperEdge, copperEdge, copperMat, copperEdge, copperEdge, copperEdge]); m.castShadow = true; m.receiveShadow = true; return m; }
const PLATE_H = 0.07, plateTop = DESK + PLATE_H;
const plate = copperPlate(2.6, 1.7); plate.position.set(0, DESK + PLATE_H / 2, 0); scene.add(plate);

// ------------------------------------------------------------------ the board: a generic paper reconstruction (pink shell, two counter-rotating rotors, each a ring of 12 magnet blocks)
const ROT_X = 0.34, MAG_R = 0.18, NMAG = 12, SHELL_H = 0.13;
const MAG_C = ['#e8434f', '#3d6cf0'];   // schematic pole colours, alternating
function makeRotor() { const g = new THREE.Group(); const spin = new THREE.Group(); g.add(spin);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.03, 40), paper(P.violet)); base.position.y = 0.0; base.castShadow = true; spin.add(base);
  const mags = []; for (let k = 0; k < NMAG; k++) { const a = (k / NMAG) * Math.PI * 2; const m = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.05, 0.085), new THREE.MeshStandardMaterial({ color: MAG_C[k % 2], roughness: 0.5, metalness: 0.1, emissive: '#ffb21f', emissiveIntensity: 0 }));
    m.position.set(Math.cos(a) * MAG_R, -0.035, Math.sin(a) * MAG_R); m.rotation.y = -a; m.castShadow = true; spin.add(m); mags.push(m); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 24), paper(P.lav)); hub.position.y = -0.02; spin.add(hub);
  const blur = new THREE.Mesh(new THREE.RingGeometry(MAG_R - 0.05, MAG_R + 0.05, 64), new THREE.MeshBasicMaterial({ color: '#ffd9e8', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
  blur.rotation.x = Math.PI / 2; blur.position.y = -0.062; g.add(blur);
  g.userData = { spin, mags, blur }; return g; }
const board = new THREE.Group(); scene.add(board);
const shellMat = paper('#ff8fc0', { transparent: true });
const shell = new THREE.Mesh(new RoundedBoxGeometry(1.36, SHELL_H, 0.6, 5, 0.06), shellMat); shell.castShadow = true; shell.receiveShadow = true;
const gripMat = paper('#3b2a78', { transparent: true }); const grip = new THREE.Mesh(new RoundedBoxGeometry(1.06, 0.012, 0.4, 3, 0.005), gripMat); grip.position.y = SHELL_H / 2 + 0.004;
const shellG = new THREE.Group(); shellG.add(shell, grip); board.add(shellG);
const rotors = [-1, 1].map((sx) => { const r = makeRotor(); r.position.set(sx * ROT_X, -SHELL_H / 2 - 0.018, 0); board.add(r); return r; });
const MAG_BOTTOM = SHELL_H / 2 + 0.018 + 0.06;   // board centre → bottom of the magnets
const HOVER = plateTop + 0.1 + MAG_BOTTOM, REST = plateTop + MAG_BOTTOM + 0.002;

// swirling eddy currents in the copper (schematic): glowing loops under each rotor, turning with it
const swirlTex = canvasTex(512, 512, (g, w) => { g.translate(w / 2, w / 2); for (let i = 0; i < 4; i++) { const r = 70 + i * 42; for (let k = 0; k < 3; k++) { const a0 = k * 2.094 + i * 0.5; g.strokeStyle = `rgba(255,${190 - i * 25},${90 - i * 15},${0.95 - i * 0.15})`; g.lineWidth = 16 - i * 2; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, r, a0, a0 + 1.55); g.stroke();
  const ax = Math.cos(a0 + 1.55) * r, ay = Math.sin(a0 + 1.55) * r, tx = -Math.sin(a0 + 1.55), ty = Math.cos(a0 + 1.55); g.fillStyle = g.strokeStyle; g.beginPath(); g.moveTo(ax + tx * 26, ay + ty * 26); g.lineTo(ax - ty * 15, ay + tx * 15); g.lineTo(ax + ty * 15, ay - tx * 15); g.fill(); } } });
const swirls = [-1, 1].map((sx) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.64), new THREE.MeshBasicMaterial({ map: swirlTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(sx * ROT_X, plateTop + 0.003, 0); m.renderOrder = 2; scene.add(m); return m; });
const pushArrows = [0, 1, 2, 3, 4, 5].map(() => makeArrow(ARROW.push, 0.022, false));

// ------------------------------------------------------------------ the limit: one rotor up close, a single magnet flung outward; a paper 6 kg weight for scale
const bigRot = makeRotor(); bigRot.scale.setScalar(1.35); bigRot.position.set(0, DESK + 0.42, 0); scene.add(bigRot);
const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.3, 24), paper(P.lav)); post.position.set(0, DESK + 0.15, 0); post.castShadow = true; scene.add(post);
const flingArrows = Array.from({ length: NMAG }, () => makeArrow(ARROW.fr, 0.016, true));
const kettle = new THREE.Group(); scene.add(kettle);
{ const body = new THREE.Mesh(new THREE.SphereGeometry(0.17, 40, 28), paper('#2c3050')); body.scale.y = 0.92; body.position.y = 0.16; body.castShadow = true; kettle.add(body);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.028, 14, 36, Math.PI), paper('#2c3050')); handle.position.y = 0.3; handle.castShadow = true; kettle.add(handle);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.11), new THREE.MeshStandardMaterial({ map: canvasTex(256, 140, (g) => { g.fillStyle = '#ffd23f'; rr(g, 0, 0, 256, 140, 24); g.fill(); g.fillStyle = P.ink; g.font = '700 84px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('6 kg', 128, 76); }), roughness: 0.9, transparent: true }));
  tag.position.set(0, 0.16, 0.168); tag.visible = false; kettle.add(tag); }
kettle.position.set(0.44, DESK, 0.46); kettle.userData.s = 0.8;

// ------------------------------------------------------------------ takeaway set: paving slabs beyond the copper edge; CTA riser behind the sign
const paving = new THREE.Group(); scene.add(paving);
[0, 1, 2].forEach((k) => { const s = card(0.6, 0.04, 1.3, '#8b8fa8', '#c6c8d8'); s.position.set(1.66 + k * 0.63, DESK + 0.02, 0); paving.add(s); });
const riser = card(2.0, 0.74, 0.62, P.deep, P.lav); riser.position.set(0, DESK + 0.37, 0.55); scene.add(riser);
const ctaPlate = copperPlate(1.9, 0.56, 0.05); ctaPlate.position.set(0, DESK + 0.74 + 0.025, 0.55); scene.add(ctaPlate);

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
  S1: (t) => { const u = U('S1', t); return SH(L3([2.75, 0.62, 1.35], [2.65, 0.61, 1.3], u), V3(0.05, 0.33, 0), 38); },
  S2: (t) => { const u = U('S2', t); return SH(L3([2.2, 1.85, 3.4], [2.0, 1.75, 3.2], u), V3(0, 0.2, 0), 40); },
  S3: (t) => { const u = U('S3', t); return SH(L3([1.35, 0.25, 2.0], [1.05, 0.24, 1.6], u), V3(0, 0.25, 0), 40); },
  S4: (t) => { const u = U('S4', t); return SH(L3([0.9, 1.9, 2.55], [0.8, 1.8, 2.4], u), V3(0, 0.2, 0), 40); },
  S5: (t) => { const u = U('S5', t); return SH(L3([0.3, 0.46, 2.55], [0.26, 0.45, 2.42], u), V3(0, 0.3, 0), 40); },
  S6: (t) => { const u = U('S6', t); return SH(L3([1.7, 0.8, 2.9], [1.62, 0.78, 2.78], u), V3(0, 0.3, 0), 40); },
  S7: (t) => { const u = U('S7', t); return SH(L3([0.1, 2.55, 2.3], [0.1, 2.45, 2.15], u), V3(0.1, 0.34, 0.16), 40); },
  S8: (t) => { const u = U('S8', t); return SH(L3([1.3, 1.15, 3.7], [1.9, 1.1, 3.5], u), L3([0.75, 0.22, 0], [1.68, 0.2, 0], u), 40); },
  S9: (t) => { const u = U('S9', t); return SH(L3([0.3, 1.75, 6.6], [0.25, 1.95, 7.0], u), L3([0, 0.85, 0.4], [0, 0.9, 0.35], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
const W_VIS = 3.2;   // on-screen spin rate (rad/s), slowed so 12 magnets read on camera; the real rotors spin far faster
function spinAngle(t, stop = Infinity, tau = 0.35) { if (t < stop) return W_VIS * t; return W_VIS * stop + W_VIS * tau * (1 - Math.exp(-(t - stop) / tau)); }
function poseRotors(ang, blurA) { rotors.forEach((r, i) => { r.userData.spin.rotation.y = (i ? -1 : 1) * ang; r.userData.blur.material.opacity = blurA; }); }
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;
  const onPlate = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S8'].includes(id);
  plate.visible = onPlate; board.visible = onPlate || id === 'S9'; bigRot.visible = post.visible = kettle.visible = id === 'S7'; paving.visible = id === 'S8';
  riser.visible = ctaPlate.visible = sign.visible = id === 'S9'; flingArrows.forEach((a) => (a.visible = false)); pushArrows.forEach((a) => (a.visible = false));
  shellMat.opacity = 1; gripMat.opacity = 1; shellG.position.set(0, 0, 0); shellG.visible = true; swirls.forEach((s) => (s.material.opacity = 0)); board.rotation.set(0, 0, 0); board.scale.setScalar(1);
  rotors.forEach((r) => r.userData.mags.forEach((m) => (m.material.emissiveIntensity = 0)));
  const bob = 0.006 * Math.sin(t * 5.1);
  let ang = spinAngle(t), blurA = 0.35, sw = 0.28;
  if (id === 'S1') { board.position.set(0, HOVER + bob, 0); board.rotation.y = 0.0; }
  if (id === 'S2') { const g = prog(t, E.glide, 4.9, (x) => x * x * (3 - 2 * x)); board.position.set(lerp(-0.5, 0.2, g), HOVER + bob, lerp(0.12, -0.1, g)); board.rotation.y = lerp(0.18, -0.12, g); }
  if (id === 'S3') { board.position.set(0.05, HOVER + bob, 0); }
  if (id === 'S4') { board.position.set(0, HOVER, 0); const rv = prog(t, E.reveal, E.reveal + 0.55); shellG.position.y = 0.22 * rv; shellMat.opacity = gripMat.opacity = 1 - rv; shellG.visible = rv < 0.99;
    sw = 0.15 + 0.85 * prog(t, E.curr, E.curr + 0.6); }
  if (id === 'S5') { const push = prog(t, E.push, E.push + 0.45); board.position.set(0, HOVER + 0.025 * push, 0); shellG.visible = false;
    sw = 1.0 + 0.4 * prog(t, E.own, E.own + 0.5);
    const grow = prog(t, E.own + 0.2, E.push + 0.2); [-1, 1].forEach((sx, i) => [-0.12, 0, 0.12].forEach((dz, k) => { const a = pushArrows[i * 3 + k]; const x = sx * ROT_X + (k - 1) * 0.06; setArrow(a, V3(x, plateTop + 0.006, dz), Y, (board.position.y - MAG_BOTTOM - plateTop - 0.012) * grow * (0.9 + 0.1 * Math.sin(t * 9 + k)), grow); })); }
  if (id === 'S6') { const drop = prog(t, E.drop - 0.1, E.drop + 0.12, (x) => x * x); board.position.set(0, lerp(HOVER, REST, drop) + (1 - drop) * bob, 0);
    ang = spinAngle(t, E.stop, 0.3); const w = Math.exp(-Math.max(0, t - E.stop) / 0.3); blurA = 0.35 * w; sw = 0.6 * w; }
  if (id === 'S8') { const g = prog(t, 21.8, E.edge + 0.25, (x) => x); const x = lerp(-0.2, 1.78, g); const fall = prog(t, E.edge, E.edge + 0.16, (u) => u * u);
    const restP = DESK + 0.04 + MAG_BOTTOM + 0.002; board.position.set(x, lerp(HOVER + bob, restP, fall), 0); board.rotation.z = 0.08 * Math.sin(Math.PI * fall); swirls.forEach((s, i) => { s.position.x = x + (i ? 1 : -1) * ROT_X; });
    sw = 0.45 * (1 - fall); }
  else swirls.forEach((s, i) => { s.position.x = (i ? 1 : -1) * ROT_X; });
  if (id === 'S9') { board.position.set(0, DESK + 0.74 + 0.05 + 0.1 + MAG_BOTTOM + bob, 0.55); board.scale.setScalar(1); swirls.forEach((s) => (s.material.opacity = 0)); sw = 0; }
  poseRotors(ang, blurA);
  if (onPlate) swirls.forEach((s, i) => { s.material.opacity = sw * (id === 'S8' ? 1 : 1); s.rotation.z = (i ? 1 : -1) * ang; });
  if (id === 'S7') { // single rotor up close, spun up; one magnet (gold) is flung outward — the arrow grows with the spin
    const spinUp = prog(t, E.spinup, E.spinup + 1.2); const a = W_VIS * t + 1.2 * spinUp * (t - E.spinup > 0 ? t - E.spinup : 0); bigRot.userData.spin.rotation.y = a; bigRot.userData.blur.material.opacity = 0.2 + 0.25 * spinUp;
    bigRot.updateMatrixWorld(true); bigRot.userData.mags[0].material.emissiveIntensity = 0.8 * prog(t, E.mag, E.mag + 0.3);
    bigRot.userData.mags.forEach((m, k) => { const p = m.getWorldPosition(new THREE.Vector3()); const dir = p.clone().setY(0).normalize(); const L = (k ? 0.13 : 0.19) * prog(t, E.fling, E.fling + 0.6); setArrow(flingArrows[k], p.clone().addScaledVector(dir, 0.08), dir, L, prog(t, E.fling, E.fling + 0.2)); });
    const kg = prog(t, E.kg, E.kg + 0.45, outBack); kettle.scale.setScalar(Math.max(0.001, kg * kettle.userData.s)); }
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
const C = { teal: 'rgba(18,122,143,0.94)', red: 'rgba(196,40,74,0.94)', gold: 'rgba(176,112,0,0.95)', green: 'rgba(26,127,75,0.95)', violet: 'rgba(85,45,188,0.94)' };
function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = []; const id = shot.id;
  const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  if (id === 'S2') { chip('Jake Rogers · YouTube video · 13 Nov 2026 (UTC)', 540, 1372, 'rgba(254,64,146,0.92)', { font: '700 26px "Space Grotesk"', alpha: prog(t, 1.9, 2.2) });
    chip('editorial reconstruction', 540, 1446, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, 1.9, 2.2), dy: 9 }); }
  if (id === 'S4') big('eddy currents', 1390, prog(t, E.labCurr, E.labCurr + 0.25), C.gold, { size: 84 });
  if (id === 'S5') big('pushes back', 1390, prog(t, E.labPush, E.labPush + 0.25), C.green, { size: 84 });
  if (id === 'S6') big('no spin, no lift', 1390, prog(t, E.labDrop, E.labDrop + 0.2), C.red, { size: 80 });
  if (id === 'S7') { big('≈ 6 kg pull', 1380, prog(t, E.labKg, E.labKg + 0.25), C.red, { size: 84, x: 390 });
    chip("creator's estimate · 3.84 g magnet at 8,000 rpm", 450, 1468, 'rgba(13,18,64,0.72)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, E.labKg, E.labKg + 0.25), dy: 9 }); }
  if (id === 'S8') big('motion + metal', 1390, prog(t, E.labMM, E.labMM + 0.25), C.teal, { size: 84 });
  captions(t);
}

scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && m.map !== copperTex && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.renderThumb = async () => { await window.render(0); return TEXTLOG; };   // thumbnail = frame 0
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
