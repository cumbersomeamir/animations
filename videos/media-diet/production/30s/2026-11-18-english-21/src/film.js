// Media Diet · 30 s English episode 21 — "This drill has no bit." Quaise millimeter-wave drilling; Google's 50 MW deal (17 Nov 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted english-12…20 builds: a paper miniature
// in Media Diet brand colours with real cast shadows, one camera set-up per beat, restrained depth of field. Approved feedback rules
// (context/26, incl. the 17 Nov addendum) + first-frame rule: frame 0 = a crust cutaway with a glowing beam boring down + the 5-word hook.
// Rig, truck, plant, data center and volcano are generic paper models (no Quaise or Google imagery). Deterministic: window.render(f).
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
const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 14);
const GOLD = '#ffd23f', BEAM = '#ffe9a8';
const glowMat = (col, op = 1) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending });
let sd = 2121; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);

// ------------------------------------------------------------------ the crust cutaway: paper strata that get hotter (and glow more) with depth
const BW = 2.4, BD = 1.2, BH = 3.0, TOPY = DESK + BH, FZ = BD / 2;
const crust = new THREE.Group(); scene.add(crust);
const STRATA = [['#4f9a5b', 0.12], ['#b98d5a', 0.38], ['#c9844a', 0.5], ['#8e7f9a', 0.6], ['#a8664a', 0.5], ['#c2512e', 0.45], ['#9e2f24', 0.45]];
const strataMats = []; { let y = TOPY; STRATA.forEach(([c, h], i) => { const m = card(BW, h, BD, c, P.edge); const mat = Array.isArray(m.material) ? m.material : [m.material];
  const em = new THREE.MeshStandardMaterial({ map: grain, bumpMap: grain, bumpScale: 3, color: c, roughness: 0.92, emissive: i > 3 ? '#ff5a1f' : '#000000', emissiveIntensity: i > 3 ? 0.08 * (i - 3) : 0 });
  m.material = [em, em, em, em, em, em]; strataMats.push(em); m.position.set(0, y - h / 2, 0); crust.add(m); y -= h; }); }
// borehole channel on the cut face, the beam inside it, and the glowing bottom
const hole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1, 0.02), new THREE.MeshStandardMaterial({ color: '#1a1030', roughness: 1 })); hole.geometry.translate(0, -0.5, 0); hole.position.set(0, TOPY, FZ + 0.006); crust.add(hole);
const beam = new THREE.Mesh(unitCyl, glowMat(BEAM, 0.95)); scene.add(beam);
const SPARK = Array.from({ length: 16 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), glowMat(i % 2 ? '#ffd23f' : '#ff7a2a')); scene.add(m); return m; });
const melt = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.03, 10, 32), glowMat('#ff5a1f', 0.85)); scene.add(melt); const beamHalo = new THREE.Mesh(unitCyl, glowMat(GOLD, 0.35)); scene.add(beamHalo);
const hot = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), glowMat('#ff8a3a', 0.9)); scene.add(hot); const hotCore = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 12), glowMat('#fff2b0', 1)); scene.add(hotCore);
const VAP = Array.from({ length: 36 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.018 + (i % 3) * 0.006, 10, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? '#e9e4ff' : '#9fe7ff', transparent: true, opacity: 0.8, depthWrite: false })); scene.add(m); return m; });
function setBore(depth, on = 1, t = 0, vapor = 0, gas = 0) { const bot = TOPY - depth; hole.scale.y = Math.max(0.001, depth);
  const a = V3(0, TOPY + 0.35, FZ + 0.03), b = V3(0, bot + 0.02, FZ + 0.03); beam.visible = beamHalo.visible = on > 0.01; seg(beam, a, b, 0.018 * on); seg(beamHalo, a, b, 0.045 * on); beamHalo.material.opacity = 0.3 * on * (0.85 + 0.15 * Math.sin(t * 17));
  hot.visible = hotCore.visible = melt.visible = on > 0.01; melt.position.set(0, bot, FZ + 0.02); melt.scale.setScalar(on * (1 + 0.08 * Math.sin(t * 7)));
  SPARK.forEach((m, i) => { const k = (t * 1.3 + i / SPARK.length) % 1; m.visible = on > 0.5; const a = i * 2.4; m.position.set(Math.cos(a) * (0.05 + 0.25 * k), bot + 0.32 * k - 0.35 * k * k, FZ + 0.04 + Math.sin(a) * 0.05); m.material.opacity = on * (1 - k); });
  hot.position.set(0, bot, FZ + 0.02); hotCore.position.copy(hot.position); hot.scale.setScalar(on * (0.9 + 0.12 * Math.sin(t * 9))); hotCore.scale.setScalar(on);
  VAP.forEach((m, i) => { const k = (t * (0.35 + 0.25 * gas) + i / VAP.length) % 1; const show = i % 2 ? vapor : gas; m.visible = show > 0.02; m.material.opacity = 0.85 * show * (1 - k);
    m.position.set(Math.sin(i * 2.3 + t * 3) * 0.035, bot + k * depth * 0.9, FZ + 0.035); }); }

// ------------------------------------------------------------------ surface: a gyrotron truck feeding the beam, a derrick, a geothermal plant, a data center, a power line
const surf = new THREE.Group(); scene.add(surf);
const truck = new THREE.Group(); surf.add(truck);
{ const box = card(0.5, 0.26, 0.26, P.white, P.lav); box.position.set(0, 0.2, 0); truck.add(box); const cab = card(0.16, 0.2, 0.24, P.violet, P.lav); cab.position.set(0.34, 0.17, 0); truck.add(cab);
  [-0.17, 0.17, 0.33].forEach((x) => [-0.12, 0.12].forEach((z) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16), paper(P.ink)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.05, z); truck.add(w); }));
  const gyro = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.32, 20), paper('#cfc8ff')); gyro.position.set(-0.08, 0.48, 0); truck.add(gyro); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 8, 24), paper(P.violet)); ring.rotation.x = Math.PI / 2; ring.position.set(-0.08, 0.5, 0); truck.add(ring); }
truck.position.set(-0.55, TOPY, 0.2);
const derrick = new THREE.Group(); surf.add(derrick);
{ const H = 0.85, w = 0.16; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const l = new THREE.Mesh(unitCyl, paper(P.lav)); seg(l, V3(sx * w, 0, sz * w), V3(sx * 0.03, H, sz * 0.03), 0.012); derrick.add(l); });
  for (let k = 1; k < 4; k++) { const y = H * k / 4.2, ww = w * (1 - k / 4.4); const r = new THREE.Mesh(new THREE.BoxGeometry(ww * 2, 0.012, ww * 2), paper(P.violet)); r.position.y = y; derrick.add(r); }
  const wg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 12), paper('#cfc8ff')); wg.rotation.z = Math.PI / 2.6; wg.position.set(-0.25, 0.42, 0); derrick.add(wg); }
derrick.position.set(0, TOPY, FZ - 0.1);
const plant = new THREE.Group(); surf.add(plant);
{ const hall = card(0.55, 0.28, 0.36, '#d7d3ea', P.lav); hall.position.y = 0.14; plant.add(hall); const roof = card(0.58, 0.03, 0.39, P.violet, P.lav); roof.position.y = 0.295; plant.add(roof);
  [-0.12, 0.12].forEach((x) => { const tk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.36, 18), paper('#c4bfe0')); tk.position.set(x, 0.18, -0.28); plant.add(tk); });
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 10), paper('#9a98b0')); pipe.rotation.z = Math.PI / 2; pipe.position.set(-0.45, 0.06, 0.05); plant.add(pipe); }
plant.position.set(0.7, TOPY, -0.15);
const STEAM = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), new THREE.MeshStandardMaterial({ color: '#f3f1ff', transparent: true, opacity: 0.7, roughness: 1 })); scene.add(m); return m; });
const dc = new THREE.Group(); scene.add(dc);
const winTex = canvasTex(256, 128, (g) => { g.fillStyle = '#20245e'; g.fillRect(0, 0, 256, 128); for (let r = 0; r < 4; r++) for (let c = 0; c < 10; c++) { g.fillStyle = (r * 7 + c * 3) % 5 ? '#2addfa' : '#ffd23f'; g.fillRect(10 + c * 24, 12 + r * 28, 14, 16); } });
const dcWin = new THREE.MeshStandardMaterial({ map: winTex, emissive: '#ffffff', emissiveMap: winTex, emissiveIntensity: 0.2, roughness: 0.8 });
{ const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.36, 0.42), [paper('#d7d3ea'), paper('#d7d3ea'), paper(P.violet), paper('#d7d3ea'), dcWin, paper('#d7d3ea')]); body.position.y = 0.18; body.castShadow = true; dc.add(body);
  [-0.25, 0, 0.25].forEach((x) => { const u = card(0.14, 0.06, 0.14, '#b9b4cf', P.lav); u.position.set(x, 0.39, 0); dc.add(u); }); }
const poles = [], wires = [], DOTS = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), glowMat(GOLD)); scene.add(m); return m; });
for (let k = 0; k < 3; k++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.42, 10), paper('#8f86d6')); scene.add(p); poles.push(p); }
for (let k = 0; k < 2; k++) { const w = new THREE.Mesh(unitCyl, paper(P.ink)); scene.add(w); wires.push(w); }
function linkPower(A, B, t, on) { const tops = [0, 0.5, 1].map((k) => A.clone().lerp(B, k).add(V3(0, 0.42, 0))); poles.forEach((p, k) => { p.position.copy(tops[k]).add(V3(0, -0.21, 0)); p.visible = true; });
  wires.forEach((w, k) => seg(w, tops[k], tops[k + 1], 0.004)); DOTS.forEach((m, i) => { const k = ((t * 0.5 + i / DOTS.length) % 1); m.visible = on > 0.02; m.material.opacity = on; const p = tops[0].clone().lerp(tops[2], k); p.y -= 0.04 * Math.sin(Math.PI * ((k * 2) % 1)); m.position.copy(p); }); }

// ------------------------------------------------------------------ a conventional tri-cone drill bit (for the question and the "bits fail" beat)
function makeBit() { const g = new THREE.Group(); scene.add(g); const mat = new THREE.MeshStandardMaterial({ color: '#a7a4bf', roughness: 0.55, metalness: 0.3, emissive: '#ff3a10', emissiveIntensity: 0 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.2, 24), mat); body.position.y = 0.16; g.add(body); const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.14, 18), mat); pin.position.y = 0.33; g.add(pin);
  const cones = [0, 1, 2].map((k) => { const cg = new THREE.Group(); const a = k * 2.094; cg.position.set(Math.cos(a) * 0.055, 0.06, Math.sin(a) * 0.055); cg.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6); g.add(cg);
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 16), mat); c.rotation.x = Math.PI; cg.add(c); for (let tth = 0; tth < 6; tth++) { const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.02, 0.018), mat); const b = tth / 6 * Math.PI * 2; tooth.position.set(Math.cos(b) * 0.045, -0.02, Math.sin(b) * 0.045); cg.add(tooth); } return cg; });
  const drill = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 14), paper('#9a98b0')); drill.position.y = 1.5; g.add(drill);
  g.userData = { mat, cones }; return g; }
const bit = makeBit();
const SHARDS = Array.from({ length: 8 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.02), new THREE.MeshStandardMaterial({ color: '#a7a4bf', emissive: '#ff5a1f', emissiveIntensity: 0.6 })); scene.add(m); return m; });
// thermometer + depth ticks on the cut face
const thermo = new THREE.Group(); scene.add(thermo);
{ const tube = card(0.12, 2.6, 0.04, '#efecff', P.lav); tube.position.y = 1.3; thermo.add(tube); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), paper('#ff4d6d')); bulb.position.y = -0.02; thermo.add(bulb);
  for (let k = 0; k < 9; k++) { const tk = card(0.06, 0.012, 0.045, P.ink, P.ink); tk.position.set(-0.02, 0.15 + k * 0.29, 0.01); thermo.add(tk); } }
const thermoCol = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 0.05), new THREE.MeshStandardMaterial({ color: '#ff4d6d', emissive: '#ff4d6d', emissiveIntensity: 0.4 })); thermoCol.geometry.translate(0, 0.5, 0); thermoCol.position.set(0, 0.05, 0.012); thermo.add(thermoCol);
thermo.position.set(-0.55, DESK + 0.2, FZ + 0.08);
const ticks = []; for (let k = 1; k <= 5; k++) { const tk = card(0.22, 0.014, 0.03, P.white, P.white); tk.position.set(BW / 2 - 0.18, TOPY - k * 0.5, FZ + 0.03); scene.add(tk); ticks.push(tk); }
// super-hot water loop: a U-pipe down into the hot rock; drops go down blue and come back gold
const loopPts = [V3(-0.35, TOPY + 0.1, FZ + 0.04), V3(-0.35, DESK + 0.55, FZ + 0.04), V3(0.35, DESK + 0.55, FZ + 0.04), V3(0.35, TOPY + 0.1, FZ + 0.04)];
const loopSegs = [0, 1, 2].map((k) => { const m = new THREE.Mesh(unitCyl, new THREE.MeshStandardMaterial({ color: '#cfc8ff', transparent: true, opacity: 0.55 })); scene.add(m); seg(m, loopPts[k], loopPts[k + 1], 0.04); return m; });
const DROPS = Array.from({ length: 22 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.032, 14, 10), new THREE.MeshStandardMaterial({ color: '#2addfa', emissive: '#2addfa', emissiveIntensity: 0.4 })); scene.add(m); return m; });
function loopAt(u) { const L = [loopPts[0].distanceTo(loopPts[1]), loopPts[1].distanceTo(loopPts[2]), loopPts[2].distanceTo(loopPts[3])]; let d = u * (L[0] + L[1] + L[2]);
  for (let k = 0; k < 3; k++) { if (d <= L[k]) return loopPts[k].clone().lerp(loopPts[k + 1], d / L[k]); d -= L[k]; } return loopPts[3].clone(); }
// the Oregon well site: a paper volcano and a conventional rig
const site = new THREE.Group(); scene.add(site); site.position.set(9, DESK, 0);
{ const gnd = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.06, 64), paper('#5c7a4a')); gnd.position.y = 0.03; site.add(gnd);
  const volc = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.4, 9, 1, true), paper('#7d6a8a', { side: THREE.DoubleSide })); volc.position.set(-0.6, 0.76, -1.3); site.add(volc);
  const crater = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 9), paper('#4a3f5a')); crater.position.set(-0.6, 1.2, -1.3); site.add(crater);
  const snow = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.55, 9, 1, true), paper(P.white, { side: THREE.DoubleSide })); snow.position.set(-0.6, 1.2, -1.3); site.add(snow); }
const rig2 = derrick.clone(); rig2.scale.setScalar(0.95); site.add(rig2); rig2.position.set(0.45, 0.06, 0.4);
const bit2 = makeBit(); site.add(bit2); bit2.scale.setScalar(0.9); bit2.position.set(0.45, 0.12, 0.4);
// day/night sky card + sun and moon
const sky = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshBasicMaterial({ color: '#2a63c9' })); scene.add(sky);
const sun = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), glowMat('#ffd23f')); scene.add(sun); const moon = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), new THREE.MeshBasicMaterial({ color: '#e9e4ff' })); scene.add(moon);

// ------------------------------------------------------------------ CTA sign (Media Diet identity only) + a little derrick behind it
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, 1024, 300); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot2 = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot2.position.set(0, 0.015, 0.2); sign.add(foot2); }
sign.position.set(0, DESK + 0.02, 1.2);
const rig3 = derrick.clone(); scene.add(rig3); rig3.scale.setScalar(1.4); rig3.position.set(0.0, DESK, 0.35);

// ------------------------------------------------------------------ camera shots
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const U = (id, t) => prog(t, sh(id).in, sh(id).out, (x) => x);
const SHOTS = {
  S1: (t) => { const u = U('S1', t); return SH(L3([1.9, 2.9, 6.2], [1.8, 2.85, 6.0], u), V3(-0.05, 2.0, 0.3), 40); },
  S2: (t) => { const u = U('S2', t); return SH(L3([1.4, TOPY + 1.5, 3.4], [1.25, TOPY + 1.4, 3.2], u), V3(0.05, TOPY + 0.15, 0), 40); },
  S3: (t) => { const u = U('S3', t); return SH(L3([0.45, 1.45, 2.6], [0.4, 1.4, 2.45], u), V3(-0.1, 1.2, 0.6), 38); },
  S4: (t) => { const u = U('S4', t); const y = lerp(2.4, 0.95, ease(u)); return SH(V3(0.7, y + 0.25, 3.9), V3(-0.18, y, 0.4), 40); },
  S5: (t) => { const u = U('S5', t); return SH(L3([0.6, 1.4, 3.3], [0.55, 1.35, 3.15], u), V3(0, 1.0, 0.5), 40); },
  S6: (t) => { const u = U('S6', t); return SH(L3([0.7, 1.75, 3.0], [0.6, 1.7, 2.85], u), V3(0, 1.45, 0.5), 40); },
  S7: (t) => { const u = U('S7', t); return SH(L3([10.4, 2.0, 5.3], [10.3, 1.95, 5.1], u), V3(9.05, 0.75, -0.4), 40); },
  S8: (t) => { const u = U('S8', t); return SH(L3([0.9, TOPY + 1.1, 3.5], [0.8, TOPY + 1.05, 3.35], u), V3(0.0, TOPY + 0.45, -0.1), 40); },
  S9: (t) => { const u = U('S9', t); return SH(L3([0.3, 1.75, 6.6], [0.25, 1.95, 7.0], u), L3([0, 0.85, 0.4], [0, 0.9, 0.35], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0006; bokeh.uniforms.maxblur.value = 0.005;
  const inCrust = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S8'].includes(id);
  crust.visible = surf.visible = inCrust; hole.visible = inCrust; dc.visible = id === 'S2' || id === 'S8'; poles.forEach((p) => (p.visible = false)); wires.forEach((w) => (w.visible = false)); DOTS.forEach((m) => (m.visible = false));
  bit.visible = false; SHARDS.forEach((m) => (m.visible = false)); thermo.visible = id === 'S4'; ticks.forEach((tk) => (tk.visible = id === 'S4')); loopSegs.forEach((m) => (m.visible = id === 'S5')); DROPS.forEach((m) => (m.visible = false));
  site.visible = id === 'S7'; sky.visible = sun.visible = moon.visible = id === 'S8'; sign.visible = rig3.visible = id === 'S9'; STEAM.forEach((m) => (m.visible = false));
  truck.visible = derrick.visible = inCrust; bit.userData.mat.emissiveIntensity = 0; strataMats.forEach((m, i) => (m.emissiveIntensity = i > 3 ? 0.08 * (i - 3) : 0));
  let depth = 2.1, on = 1, vap = 0.6, gas = 0.4;
  if (id === 'S1') { depth = 2.1 + 0.05 * t; }
  if (id === 'S2') { depth = 2.2; dc.position.set(-0.75, TOPY, -0.25); const deal = prog(t, E.deal, E.deal + 0.6); dcWin.emissiveIntensity = 0.2 + 0.9 * deal; linkPower(plant.position.clone().add(V3(-0.3, 0, 0.05)), dc.position.clone().add(V3(0.42, 0, 0.05)), t, deal);
    STEAM.forEach((m, i) => { const k = (t * 0.35 + i / STEAM.length) % 1; m.visible = true; m.position.copy(plant.position).add(V3(0.15 * Math.sin(i * 2.1), 0.32 + k * 0.9, -0.28)); m.scale.setScalar(0.6 + 1.4 * k); m.material.opacity = 0.65 * (1 - k); }); }
  if (id === 'S3') { // the question: an ordinary bit grinding vs a beam that never touches the rock
    depth = 1.9; vap = 0.8; gas = 0.3; bit.visible = true; bit.scale.setScalar(1.25); bit.position.set(-0.24, 1.0 + 0.01 * Math.sin(t * 30), FZ + 0.42); bit.scale.setScalar(0.85); bit.rotation.y = t * 6; bit.userData.mat.emissiveIntensity = 0.0; }
  if (id === 'S4') { // heat climbs with depth; at the bottom a bit glows and breaks
    const u = U('S4', t); depth = 0; on = 0; thermoCol.scale.y = 0.15 + 2.3 * ease(prog(t, 7.0, 10.0)); bit.visible = true; bit.scale.setScalar(1.1); const by = lerp(2.6, 0.62, ease(prog(t, 6.8, 10.2))); bit.position.set(0.0, by, FZ + 0.22); bit.rotation.y = t * 5;
    const heat = prog(t, 9.0, 10.4); bit.userData.mat.emissiveIntensity = 0.9 * heat; strataMats.forEach((m, i) => (m.emissiveIntensity = i > 3 ? (0.08 + 0.25 * heat) * (i - 3) : 0));
    if (t > E.crack) { const k = prog(t, E.crack, E.crack + 0.9); SHARDS.forEach((m, i) => { m.visible = true; const a = i * 0.785; m.position.copy(bit.position).add(V3(Math.cos(a) * (0.08 + 0.4 * k), 0.05 - 0.25 * k * k + 0.18 * k, Math.sin(a) * 0.15 * k + 0.05)); m.rotation.set(k * 6 + i, k * 4, i); });
      bit.userData.cones.forEach((c, i) => (c.visible = !(i === 1 && k > 0.2))); } else bit.userData.cones.forEach((c) => (c.visible = true)); }
  else bit.userData.cones.forEach((c) => (c.visible = true));
  if (id === 'S5') { // super-hot water: drops go down blue and come back gold
    depth = 0; on = 0; const hotA = prog(t, E.water, E.water + 0.6); strataMats.forEach((m, i) => (m.emissiveIntensity = i > 3 ? (0.12 + 0.2 * hotA) * (i - 3) : 0));
    DROPS.forEach((m, i) => { const u = ((t * 0.18 + i / DROPS.length) % 1); m.visible = true; m.position.copy(loopAt(u)); const g = clamp((u - 0.38) / 0.25); const c = new THREE.Color('#2addfa').lerp(new THREE.Color('#ffb21f'), g * hotA); m.material.color.copy(c); m.material.emissive.copy(c); m.material.emissiveIntensity = 0.4 + 0.8 * g * hotA; m.scale.setScalar(1 + 0.5 * g * hotA); }); }
  if (id === 'S6') { // the beam vaporizes rock; purge gas carries it out
    depth = 2.05 + 0.25 * prog(t, E.beam, 18.3); on = prog(t, E.beam - 0.3, E.beam + 0.2); vap = prog(t, E.vapor, E.vapor + 0.4); gas = prog(t, E.gas, E.gas + 0.4) * 1.2; }
  if (id === 'S8') { // always on: day turns to night, the power keeps flowing
    depth = 2.2; dc.position.set(-0.75, TOPY, -0.25); dcWin.emissiveIntensity = 1.0; linkPower(plant.position.clone().add(V3(-0.3, 0, 0.05)), dc.position.clone().add(V3(0.42, 0, 0.05)), t, 1);
    const n = prog(t, E.night - 0.6, E.night + 0.6); sky.material.color.copy(new THREE.Color('#5aa0ff').lerp(new THREE.Color('#0d1240'), n)); sky.position.set(0, TOPY + 1.5, -3.2);
    const a = lerp(0.6, -0.5, prog(t, 22.2, E.night + 0.4)); sun.position.set(Math.sin(a) * 2.2, TOPY + 0.7 + Math.cos(a) * 1.2 - 0.8 * n, -3.0); moon.position.set(-1.0 + 0.6 * n, TOPY + 0.6 + 1.0 * n, -3.0); moon.visible = n > 0.05;
    STEAM.forEach((m, i) => { const k = (t * 0.35 + i / STEAM.length) % 1; m.visible = true; m.position.copy(plant.position).add(V3(0.15 * Math.sin(i * 2.1), 0.32 + k * 0.9, -0.28)); m.scale.setScalar(0.6 + 1.4 * k); m.material.opacity = 0.65 * (1 - k); }); }
  bit2.visible = false; if (id === 'S7') { rig2.rotation.y = 0; }
  setBore(depth, inCrust ? on : 0, t, inCrust ? vap * on : 0, inCrust ? gas * on : 0); if (!inCrust) { beam.visible = beamHalo.visible = hot.visible = hotCore.visible = melt.visible = false; VAP.forEach((m) => (m.visible = false)); SPARK.forEach((m) => (m.visible = false)); }
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
  if (id === 'S2') { big('50 MW deal', 1380, prog(t, E.deal, E.deal + 0.25), C.gold, { size: 84 });
    chip('Quaise × Google · power deal · 17 Nov 2026', 540, 1466, 'rgba(254,64,146,0.92)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, 1.6, 1.9), dy: 9 }); }
  if (id === 'S4') { big('≈ +25 °C every km', 1390, win(t, E.labKm, E.crack), C.red, { size: 76 }); big('bits break', 1390, prog(t, E.crack, E.crack + 0.25), C.red, { size: 84 }); }
  if (id === 'S5') { big('374 °C+: super-hot water', 1380, prog(t, E.labWater, E.labWater + 0.25), C.gold, { size: 64 });
    chip('up to 10× power per well (Quaise estimate)', 540, 1466, 'rgba(13,18,64,0.72)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, E.labWater, E.labWater + 0.25), dy: 9 }); }
  if (id === 'S6') big('beam + gas, no bit', 1390, prog(t, E.labBeam, E.labBeam + 0.25), C.teal, { size: 78 });
  if (id === 'S7') { big('phase 1: ordinary drills', 1380, prog(t, E.labOrd, E.labOrd + 0.25), C.red, { size: 66 });
    chip('beam drilling planned for phase 2 (Quaise)', 540, 1466, 'rgba(13,18,64,0.72)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, E.labOrd, E.labOrd + 0.25), dy: 9 }); }
  if (id === 'S8') big('day and night', 1390, prog(t, E.labDay, E.labDay + 0.25), C.green, { size: 84 });
  captions(t);
}

scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && m.map !== winTex && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.renderThumb = async () => { await window.render(0); return TEXTLOG; };   // thumbnail = frame 0
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
