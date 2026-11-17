// Media Diet · 30 s English episode 20 — "24 hours to say hello." Voyager 1 reaches one light-day from Earth (NASA, 18 Nov 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted english-12…19 builds: a paper miniature
// in Media Diet brand colours, one camera set-up per beat, restrained depth of field. Approved feedback rules (context/26) + first-frame
// rule: frame 0 = paper Voyager with a golden radio ring arriving + the 5-word hook. Voyager, Earth and the DSN dish are generic paper
// models from NASA's published layout (no NASA imagery); the received-power figure is an estimate. Deterministic: window.render(f).
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
const fill = new THREE.DirectionalLight('#ffe6cc', 1.0); fill.position.set(4, 26, 9); scene.add(fill);   // soft front fill, no shadows
const Y = V3(0, 1, 0);
function seg(m, a, b, r) { const d = b.clone().sub(a); const L = d.length(); if (L < 1e-5) { m.visible = false; return; } m.visible = true; m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(Y, d.normalize()); m.scale.set(r, L, r); }
const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 14);
const GOLD = '#ffd23f';
const glowMat = (col, op = 1) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending });

// ------------------------------------------------------------------ the space stage (raised above the paper hills, so only the night backdrop and paper stars show)
const SY = 20;
const stars = (() => { const n = 1100, pos = new Float32Array(n * 3); let s = 4242; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, th = r() * Math.PI * 2, R = 38 + r() * 18, q = Math.sqrt(1 - u * u); pos.set([R * q * Math.cos(th), SY + R * u, R * q * Math.sin(th)], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ color: '#efeaff', size: 0.11, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false })); scene.add(p); return p; })();
const paperStars = []; { let s = 77; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(starGeo, paper(i % 3 ? P.lav : GOLD)); const a = r() * Math.PI * 2, R = 9 + r() * 7; m.position.set(Math.cos(a) * R, SY + (r() - 0.5) * 9, -6 - r() * 8); m.scale.setScalar(0.5 + r() * 0.8); m.rotation.z = r() * 3; scene.add(m); paperStars.push(m); } }

// ------------------------------------------------------------------ Voyager 1: a generic paper model from NASA's published layout (3.7 m dish, ten-sided bus, RTG boom, science boom, magnetometer boom)
function dishGeo(R, depth, n = 48) { const pts = []; for (let i = 0; i <= 18; i++) { const r = R * i / 18; pts.push(new THREE.Vector2(r, depth * (r / R) ** 2)); } return new THREE.LatheGeometry(pts, n); }
function makeVoyager() { const g = new THREE.Group(); scene.add(g);
  const dish = new THREE.Mesh(dishGeo(0.62, 0.17), [paper(P.white, { side: THREE.DoubleSide })][0]); dish.castShadow = true; g.add(dish);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.012, 8, 64), paper(P.lav)); rim.rotation.x = Math.PI / 2; rim.position.y = 0.17; g.add(rim);
  const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.2, 16), paper('#cfc8ff')); feed.position.y = 0.36; g.add(feed);
  [0, 1, 2].forEach((k) => { const st = new THREE.Mesh(unitCyl, paper(P.lav)); const a = k * 2.094; seg(st, V3(Math.cos(a) * 0.5, 0.11, Math.sin(a) * 0.5), V3(0, 0.3, 0), 0.006); g.add(st); });
  const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.17, 10), paper('#d6a13a')); bus.position.y = -0.12; bus.castShadow = true; g.add(bus);
  const foil = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.03, 10), paper('#8a5a20')); foil.position.y = -0.2; g.add(foil);
  const rtgBoom = new THREE.Mesh(unitCyl, paper(P.lav)); seg(rtgBoom, V3(-0.25, -0.14, 0.05), V3(-1.05, -0.3, 0.2), 0.016); g.add(rtgBoom);
  const rtgMat = new THREE.MeshStandardMaterial({ color: '#3a3d58', roughness: 0.7, emissive: '#ff7a2a', emissiveIntensity: 0.05 });
  const rtgs = [0, 1, 2].map((k) => { const c = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.17, 16), rtgMat); c.add(body);
    for (let f = 0; f < 6; f++) { const fin = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.16, 0.06), rtgMat); const a = f * Math.PI / 3; fin.position.set(Math.cos(a) * 0.09, 0, Math.sin(a) * 0.09); fin.rotation.y = -a; c.add(fin); }
    const p = V3(-0.62, -0.22, 0.11).lerp(V3(-1.05, -0.3, 0.2), k / 2); c.position.copy(p); c.quaternion.setFromUnitVectors(Y, V3(-0.8, -0.16, 0.15).normalize()); g.add(c); return c; });
  const sciBoom = new THREE.Mesh(unitCyl, paper(P.lav)); seg(sciBoom, V3(0.25, -0.14, -0.05), V3(0.9, -0.24, -0.15), 0.016); g.add(sciBoom);
  const plat = card(0.2, 0.14, 0.16, P.deep, P.lav); plat.position.set(0.95, -0.24, -0.15); g.add(plat);
  const cam = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 12), paper(P.ink)); cam.rotation.z = Math.PI / 2; cam.position.set(1.05, -0.18, -0.15); g.add(cam);
  const mag = new THREE.Mesh(unitCyl, paper('#cfc8ff')); seg(mag, V3(0.0, -0.18, -0.25), V3(0.55, -0.55, -1.9), 0.006); g.add(mag);
  g.userData = { rtgMat, rtgs, dish }; return g; }
const voy = makeVoyager();
// aim the dish axis (local +y) along dir
function aimVoy(v, pos, dir, roll = 0) { v.position.copy(pos); const q = new THREE.Quaternion().setFromUnitVectors(Y, dir.clone().normalize()); const r = new THREE.Quaternion().setFromAxisAngle(Y, roll); v.quaternion.copy(q).multiply(r); }

// ------------------------------------------------------------------ Earth (paper globe) and the radio pulse
const earthTex = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#2466c9'; g.fillRect(0, 0, w, h); let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) { g.fillStyle = r() < 0.6 ? '#3fae6a' : '#c9b27c'; g.beginPath(); const x = r() * w, y = h * (0.2 + r() * 0.6); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; const rr2 = 30 + r() * 60; g.lineTo(x + Math.cos(a) * rr2 * 1.6, y + Math.sin(a) * rr2); } g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(r() * w, r() * h, 30 + r() * 80, 6 + r() * 10, r() * 0.4, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#f3f1ff'; g.fillRect(0, 0, w, 26); g.fillRect(0, h - 26, w, 26); });
function makeEarth(R) { const g = new THREE.Group(); scene.add(g); const s = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 40), new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.9, emissive: '#16306a', emissiveIntensity: 0.35 })); g.add(s);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.08, 48, 32), new THREE.MeshBasicMaterial({ color: '#2addfa', transparent: true, opacity: 0.18, side: THREE.BackSide, depthWrite: false })); g.add(halo); g.userData.globe = s; return g; }
const earth = makeEarth(0.36), bigEarth = makeEarth(0.62);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.026, 12, 72), glowMat(GOLD, 0.95)); scene.add(ring);
const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.01, 10, 72), glowMat(GOLD, 0.6)); scene.add(ring2);
const track = new THREE.Mesh(unitCyl, new THREE.MeshBasicMaterial({ color: '#8f86d6', transparent: true, opacity: 0.35 })); scene.add(track);
// a 24-hour paper dial: one sweep of the hand = one way at light speed
const dial = new THREE.Group(); scene.add(dial);
{ const face = new THREE.Mesh(new THREE.CircleGeometry(0.3, 48), new THREE.MeshStandardMaterial({ map: canvasTex(256, 256, (g) => { g.fillStyle = '#efecff'; g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill(); g.fillStyle = P.ink; for (let k = 0; k < 24; k++) { g.save(); g.translate(128, 128); g.rotate(k / 24 * Math.PI * 2); g.fillRect(-2, -118, 4, k % 6 ? 12 : 24); g.restore(); } }), roughness: 0.9 })); dial.add(face);
  const back = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.03, 48), paper(P.violet)); back.rotation.x = Math.PI / 2; back.position.z = -0.016; dial.add(back);
  const sweep = new THREE.Mesh(new THREE.CircleGeometry(0.27, 64, Math.PI / 2, 0.001), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.55 })); sweep.position.z = 0.004; dial.add(sweep); dial.userData.sweep = sweep;
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.25, 0.01), paper(P.ink)); hand.geometry.translate(0, 0.12, 0); hand.position.z = 0.008; dial.add(hand); dial.userData.hand = hand; }
// a paper fridge bulb: the scale of Voyager's transmitter (PopSci's comparison)
const bulb = new THREE.Group(); scene.add(bulb);
{ const glass = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 20), new THREE.MeshStandardMaterial({ color: '#fff4c2', emissive: GOLD, emissiveIntensity: 0.8, transparent: true, opacity: 0.9 })); glass.scale.y = 1.2; bulb.add(glass);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.1, 20), paper('#b9b4cf')); base.position.y = -0.17; bulb.add(base); bulb.userData.glass = glass; }

// ------------------------------------------------------------------ inverse-square rig: one source, a frame at distance 1 (one lit tile) and at distance 2 (same light over four tiles)
const IS = new THREE.Group(); scene.add(IS); IS.position.set(9, SY, 0);
const isSrc = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), glowMat('#fff2a8')); isSrc.position.set(0, 1.15, 0); IS.add(isSrc);
function frameAt(y, size) { const g = new THREE.Group(); g.position.y = y; IS.add(g); const b = 0.012;
  [[0, size / 2, size + b, b], [0, -size / 2, size + b, b], [size / 2, 0, b, size], [-size / 2, 0, b, size]].forEach(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), paper(P.lav)); m.position.set(x, 0, z); g.add(m); }); return g; }
const F1 = frameAt(0.55, 0.5), F2 = frameAt(-0.05, 1.0);
const tile1 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.012, 0.48), new THREE.MeshStandardMaterial({ color: GOLD, emissive: GOLD, emissiveIntensity: 1, transparent: true })); F1.add(tile1);
const tiles4 = [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].map(([x, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.012, 0.47), new THREE.MeshStandardMaterial({ color: '#7a6420', emissive: GOLD, emissiveIntensity: 0.25, transparent: true })); m.position.set(x, 0, z); F2.add(m); return m; });
const rays = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => { const m = new THREE.Mesh(unitCyl, glowMat('#fff2a8', 0.5)); IS.add(m); m.userData.c = V3(sx * 0.5, -0.05, sz * 0.5); return m; });

// ------------------------------------------------------------------ beam footprint at Earth, the narrow beam cone, the Deep Space Network dish, the RTG gauge, the big-vs-small dish
const foot = new THREE.Mesh(new THREE.CircleGeometry(1.45, 64), new THREE.MeshBasicMaterial({ map: canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,210,63,0.30)'); gr.addColorStop(0.85, 'rgba(255,210,63,0.16)'); gr.addColorStop(0.95, 'rgba(255,226,120,0.55)'); gr.addColorStop(1, 'rgba(255,210,63,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(foot);
const SPK = Array.from({ length: 40 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), glowMat('#fff6c8')); scene.add(m); return m; });
const cone = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 48, 1, true), new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); cone.geometry.translate(0, -0.5, 0); scene.add(cone);
const ground = new THREE.Group(); scene.add(ground); ground.position.set(-9, SY - 1.0, 0);
{ const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.08, 64), paper('#3e8a55')); ground.add(disc); const rim2 = new THREE.Mesh(new THREE.CylinderGeometry(2.42, 2.42, 0.05, 64), paper('#7a5a3a')); rim2.position.y = -0.05; ground.add(rim2); }
function makeDSN(R) { const g = new THREE.Group(); ground.add(g);
  const ped = card(0.5, 0.5, 0.5, '#d7d3ea', P.lav); ped.position.y = 0.29; g.add(ped);
  const yoke = card(0.34, 0.5, 0.12, '#c4bfe0', P.lav); yoke.position.set(0, 0.75, 0); g.add(yoke);
  const tilt = new THREE.Group(); tilt.position.y = 1.05; g.add(tilt);
  const d = new THREE.Mesh(dishGeo(R, R * 0.28), paper(P.white, { side: THREE.DoubleSide })); d.castShadow = true; tilt.add(d);
  const rim3 = new THREE.Mesh(new THREE.TorusGeometry(R, 0.02, 8, 72), paper(P.lav)); rim3.rotation.x = Math.PI / 2; rim3.position.y = R * 0.28; tilt.add(rim3);
  const fd = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.28, 16), paper('#cfc8ff')); fd.position.y = R * 0.62; tilt.add(fd);
  [0, 1, 2, 3].forEach((k) => { const st = new THREE.Mesh(unitCyl, paper(P.lav)); const a = k * Math.PI / 2 + 0.4; seg(st, V3(Math.cos(a) * R * 0.85, R * 0.2, Math.sin(a) * R * 0.85), V3(0, R * 0.55, 0), 0.01); tilt.add(st); });
  tilt.rotation.x = 0.45; g.userData = { tilt, R }; return g; }
const dsn = makeDSN(1.05), small = makeDSN(0.32);
const person = token('#d23d7c', 0.55); ground.add(person); person.position.set(0.75, 0.04, 0.9);
const gauge = new THREE.Group(); scene.add(gauge);
{ const frameG = card(0.22, 1.2, 0.06, P.deep, P.lav); frameG.position.y = 0.6; gauge.add(frameG); }
const gaugeFill = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1, 0.07), new THREE.MeshStandardMaterial({ color: '#3ddc84', emissive: '#3ddc84', emissiveIntensity: 0.35 })); gaugeFill.geometry.translate(0, 0.5, 0); gaugeFill.position.y = 0.04; gauge.add(gaugeFill);
const gaugeDrop = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1, 0.07), new THREE.MeshStandardMaterial({ color: '#ff4d6d', emissive: '#ff4d6d', emissiveIntensity: 0.4, transparent: true })); gaugeDrop.geometry.translate(0, 0.5, 0); gauge.add(gaugeDrop);

// ------------------------------------------------------------------ CTA sign (Media Diet identity only) + a small Voyager model behind it
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, 1024, 300); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot2 = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot2.position.set(0, 0.015, 0.2); sign.add(foot2); }
sign.position.set(0, DESK + 0.02, 1.2);
const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.2, 10), paper(P.lav)); stick.position.set(0.0, DESK + 0.6, 0.3); scene.add(stick);

// ------------------------------------------------------------------ camera shots
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const U = (id, t) => prog(t, sh(id).in, sh(id).out, (x) => x);
const S = (x, y, z) => [x, SY + y, z];
const VPOS = V3(0.25, SY + 0.05, 0), EDIR = V3(-0.55, -0.32, 0.77).normalize();
const PERP = EDIR.clone().cross(Y).normalize();   // horizontal, perpendicular to the beam   // Voyager's dish points back toward Earth (down-left-front)
const SHOTS = {
  S1: (t) => { const u = U('S1', t); const c = VPOS.clone().add(V3(-0.05, 0.42, 0)); return SH(c.clone().add(V3(1.6, 0.25, 3.9)).addScaledVector(EDIR, -0.12 * u), c, 40); },
  S2: (t) => { const u = U('S2', t); return SH(L3(S(0.3, 0.2, 7.3), S(0.25, 0.15, 7.0), u), V3(0, SY - 0.22, 0), 40); },
  S3: (t) => { const u = U('S3', t); const b = VPOS.clone().addScaledVector(EDIR, -2.4).add(V3(0, 0.75, 0)).addScaledVector(PERP, 0.9); return SH(b.clone().addScaledVector(EDIR, 0.25 * u), VPOS.clone().addScaledVector(EDIR, 3.5), 40); },
  S4: (t) => { const u = U('S4', t); return SH(L3([9.6, SY + 1.15, 2.9], [9.5, SY + 1.1, 2.75], u), V3(9, SY + 0.32, 0), 40); },
  S5: (t) => { const u = U('S5', t); return SH(L3(S(0.2, 0.25, 3.2), S(0.15, 0.25, 3.0), u), V3(0, SY - 0.1, 0), 40); },
  S6: (t) => { const u = U('S6', t); const c = VPOS.clone().addScaledVector(EDIR, 0.9); return SH(c.clone().addScaledVector(PERP, -3.3).add(V3(0, 1.1 - 0.1 * u, 0)).addScaledVector(EDIR, -0.6), c, 40); },
  S7: (t) => { const u = U('S7', t); return SH(L3([-8.4, SY + 2.3, 4.0], [-8.5, SY + 2.2, 3.85], u), V3(-9, SY + 0.1, 0), 40); },
  S8: (t) => { const u = U('S8', t); voy.updateMatrixWorld(true); const r = voy.userData.rtgs[1].getWorldPosition(V3(0, 0, 0)); return SH(r.clone().addScaledVector(EDIR, -1.9 + 0.1 * u).add(V3(0, 0.55, 0)).addScaledVector(PERP, -0.5), r.clone().add(V3(0, -0.18, 0)), 40); },
  S9: (t) => { const u = U('S9', t); return SH(L3([-8.6, SY + 3.1, 5.4], [-8.65, SY + 3.0, 5.25], u), V3(-8.85, SY + 0.15, 0.2), 40); },
  S10: (t) => { const u = U('S10', t); return SH(L3([0.3, 1.75, 6.6], [0.25, 1.95, 7.0], u), L3([0, 0.85, 0.4], [0, 0.9, 0.35], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = id === 'S10' ? 0.0008 : 0.0003; bokeh.uniforms.maxblur.value = 0.005;
  const space = id !== 'S10';
  stars.visible = space; paperStars.forEach((m) => (m.visible = space));
  voy.visible = ['S1', 'S2', 'S3', 'S6', 'S8', 'S10'].includes(id); earth.visible = ['S1', 'S2', 'S3'].includes(id); bigEarth.visible = id === 'S5';
  ring.visible = ring2.visible = false; track.visible = dial.visible = bulb.visible = false; IS.visible = id === 'S4'; foot.visible = id === 'S5'; cone.visible = id === 'S6';
  ground.visible = id === 'S7' || id === 'S9'; small.visible = id === 'S9'; gauge.visible = id === 'S8'; sign.visible = stick.visible = id === 'S10';
  SPK.forEach((m) => (m.visible = false)); voy.userData.rtgMat.emissiveIntensity = 0.05; voy.scale.setScalar(1);
  const spin = 0.04 * Math.sin(t * 0.5);
  if (id === 'S1') { // hook: Voyager close, a golden "hello" ring arriving from distant Earth
    aimVoy(voy, VPOS, EDIR, 0.4 + spin); earth.position.copy(VPOS.clone().addScaledVector(EDIR, 5.5)); earth.scale.setScalar(0.5);
    earth.visible = false; ring.visible = ring2.visible = true; const k = (0.35 + t * 0.45) % 1; const from = VPOS.clone().addScaledVector(EDIR, 2.1).add(V3(-0.35, -0.55, 0));
    ring.position.copy(from.clone().lerp(VPOS.clone().addScaledVector(EDIR, 0.45), k)); ring.lookAt(VPOS); ring.scale.setScalar(1.7 - 0.8 * k); ring.material.opacity = 0.95 * Math.min(1, (1 - k) * 4);
    const k2 = (k + 0.5) % 1; ring2.position.copy(from.clone().lerp(VPOS.clone().addScaledVector(EDIR, 0.45), k2)); ring2.lookAt(VPOS); ring2.scale.setScalar(1.7 - 0.8 * k2); ring2.material.opacity = 0.6 * Math.min(1, (1 - k2) * 4); }
  if (id === 'S2') { // one light-day: a pulse leaves Earth and needs one full sweep of the 24-hour dial to reach Voyager
    const A = V3(-0.75, SY - 0.75, 0), B = V3(0.75, SY + 0.95, 0); earth.position.copy(A); earth.scale.setScalar(1); aimVoy(voy, B, A.clone().sub(B), 0.6); voy.scale.setScalar(0.62);
    track.visible = true; seg(track, A, B, 0.006); const k = prog(t, E.pulse, E.arrive, (x) => x);
    ring.visible = true; ring.position.copy(A.clone().lerp(B, 0.12 + 0.76 * k)); ring.lookAt(B); ring.scale.setScalar(0.8); ring.material.opacity = 0.95;
    dial.visible = true; dial.position.set(0.55, SY - 0.55, 0.3); dial.scale.setScalar(prog(t, E.pulse - 0.3, E.pulse, outBack));
    dial.userData.hand.rotation.z = -k * Math.PI * 2; dial.userData.sweep.geometry.dispose(); dial.userData.sweep.geometry = new THREE.CircleGeometry(0.27, 64, Math.PI / 2 - k * Math.PI * 2, Math.max(0.001, k * Math.PI * 2)); }
  if (id === 'S3') { // over Voyager's shoulder toward a tiny Earth; its radio ≈ a fridge bulb
    aimVoy(voy, VPOS, EDIR, 0.4 + spin); earth.position.copy(VPOS.clone().addScaledVector(EDIR, 7.5)); earth.scale.setScalar(0.3);
    bulb.visible = true; bulb.position.copy(VPOS.clone().addScaledVector(EDIR, 1.4).addScaledVector(PERP, 0.55).add(V3(0, 0.35, 0))); const b = prog(t, E.bulb, E.bulb + 0.35, outBack); bulb.scale.setScalar(Math.max(0.001, b)); bulb.userData.glass.material.emissiveIntensity = 0.5 + 0.4 * Math.sin(t * 6) ** 2; }
  if (id === 'S4') { // inverse square: same light, twice the distance, four tiles → a quarter each
    const r = prog(t, E.rays, E.rays + 0.6); rays.forEach((m) => { const end = isSrc.position.clone().lerp(m.userData.c, Math.max(0.01, r)); seg(m, isSrc.position, end, 0.006); });
    tile1.material.opacity = prog(t, E.tile1, E.tile1 + 0.3); tile1.visible = t < E.tile4 + 0.6; tile1.material.opacity *= 1 - 0.7 * prog(t, E.tile4, E.tile4 + 0.6);
    tiles4.forEach((m, i) => { m.material.opacity = prog(t, E.tile4 + i * 0.08, E.tile4 + 0.3 + i * 0.08); m.visible = m.material.opacity > 0.01; }); F2.visible = t > E.tile4 - 0.4; isSrc.scale.setScalar(1 + 0.15 * Math.sin(t * 8)); }
  if (id === 'S5') { // by Earth: a beam footprint far wider than the planet; a few faint sparks land
    bigEarth.position.set(0, SY - 0.15, 0); bigEarth.userData.globe.rotation.y = t * 0.1; foot.position.set(0, SY - 0.15, -0.9); foot.material.opacity = 0.9 * prog(t, E.foot, E.foot + 0.6);
    SPK.slice(0, 14).forEach((m, i) => { const ph = ((t - E.spark) * 0.8 + i * 0.27) % 1; if (t < E.spark) return; m.visible = true; const a = i * 2.39; const st = V3(Math.cos(a) * 2.2, SY + 1.8 + Math.sin(a) * 0.8, 1.2); const en = V3(Math.cos(a) * 2.6, SY - 0.15 + Math.sin(a) * 1.4, -0.6); m.position.copy(st.lerp(en, ph)); m.material.opacity = i < 2 ? 1 : 0.45; }); }
  if (id === 'S6') { // Voyager's dish squeezes the radio into a narrow cone toward Earth
    aimVoy(voy, VPOS, EDIR, 0.4 + spin); cone.position.copy(VPOS.clone().addScaledVector(EDIR, 0.25)); cone.quaternion.setFromUnitVectors(V3(0, -1, 0), EDIR);
    const n = prog(t, E.cone, E.cone + 0.8); const L = 6, w = lerp(2.8, 0.3, n); cone.scale.set(w, L, w); cone.material.opacity = 0.16 + 0.14 * n; }
  if (id === 'S7' || id === 'S9') { // the 70-meter Deep Space Network dish catches the faint sparks (S9: a small dish beside it catches far fewer)
    dsn.position.set(id === 'S9' ? -0.55 : 0, 0.04, 0); small.position.set(0.95, 0.04, 0.55); dsn.userData.tilt.rotation.x = 0.45; small.userData.tilt.rotation.x = 0.45;
    const t0 = id === 'S7' ? E.dsn : E.ears; const ctr = (g) => g.userData.tilt.localToWorld(V3(0, g.userData.R * 0.2, 0));
    ground.updateMatrixWorld(true); const cBig = ctr(dsn), cSmall = ctr(small);
    SPK.forEach((m, i) => { if (t < t0 - 0.4) return; const ph = ((t - t0 + 0.4) * 0.7 + i * 0.137) % 1; m.visible = true; const tgtBig = i % 3 !== 0 || id === 'S7'; const c = tgtBig ? cBig : cSmall; if (!tgtBig && i % 9) { m.visible = false; return; }
      const jitter = V3(((i * 37) % 11 - 5) * 0.06, 0, ((i * 53) % 11 - 5) * 0.06); m.position.copy(c.clone().add(jitter).add(V3(0.6, 3.2, 0.9).multiplyScalar(1 - ph))); m.material.opacity = 0.9; }); }
  if (id === 'S8') { // the nuclear power source glows; the gauge drops a little every year
    aimVoy(voy, VPOS, EDIR, 0.4 + spin); voy.userData.rtgMat.emissiveIntensity = (0.25 + 0.5 * prog(t, E.rtg, E.rtg + 0.5) * (0.85 + 0.15 * Math.sin(t * 5))) * (1 - 0.35 * prog(t, E.drop, E.drop + 1.0));
    voy.updateMatrixWorld(true); const rw = voy.userData.rtgs[1].getWorldPosition(V3(0, 0, 0)); gauge.position.copy(rw).addScaledVector(PERP, -0.42).add(V3(0, -0.62, 0)).addScaledVector(EDIR, -0.35); gauge.rotation.y = 0.3; gauge.scale.setScalar(0.55); const drop = prog(t, E.drop, E.drop + 1.0); gaugeFill.scale.y = 1.1 * (1 - 0.18 * drop); gaugeDrop.position.y = 0.04 + 1.1 * (1 - 0.18 * drop); gaugeDrop.scale.y = 1.1 * 0.18 * drop; gaugeDrop.material.opacity = drop > 0.01 ? 0.85 : 0; }
  if (id === 'S10') { voy.visible = true; aimVoy(voy, V3(0, DESK + 1.25, 0.3), V3(0.1, 0.25, 1), 0.3); voy.scale.setScalar(0.42); }
  const sgu = prog(t, E.sign, E.sign + 0.45, outBack); sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(sgu, 0, 1.2));
  key.target.position.set(0, space ? SY : 0, 1); key.position.set(-11, (space ? SY : 0) + 10, -4); rim.position.set(9, (space ? SY : 0) + 7, 12);
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
  if (id === 'S2') { big('24 h one way', 1380, prog(t, E.labDay, E.labDay + 0.25), C.gold, { size: 76 });
    chip('NASA · one light-day · 18 Nov 2026, 5:16 a.m. EST', 540, 1466, 'rgba(13,18,64,0.78)', { font: '700 25px "Space Grotesk"', h: 46, alpha: prog(t, 2.1, 2.4), dy: 9 }); }
  if (id === 'S4') { big('2× farther → ¼ power', 1390, prog(t, E.labIS, E.labIS + 0.25), C.gold, { size: 74 }); }
  if (id === 'S5') { big('< 10⁻¹⁸ W', 1380, prog(t, E.labW, E.labW + 0.25), C.violet, { size: 84 });
    chip('estimate: inverse-square + dish gains', 540, 1468, 'rgba(13,18,64,0.72)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, E.labW, E.labW + 0.25), dy: 9 }); }
  if (id === 'S7') big('70-meter dish', 1390, prog(t, E.labDSN, E.labDSN + 0.25), C.teal, { size: 84 });
  if (id === 'S8') big('−4 W every year', 1390, prog(t, E.labRTG, E.labRTG + 0.25), C.red, { size: 80 });
  if (id === 'S9') big('bigger ears', 1390, prog(t, E.labEars, E.labEars + 0.25), C.green, { size: 88 });
  captions(t);
}

scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.renderThumb = async () => { await window.render(0); return TEXTLOG; };   // thumbnail = frame 0
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
