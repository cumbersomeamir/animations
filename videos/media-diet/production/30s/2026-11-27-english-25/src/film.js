// Media Diet · 30 s English episode 25 — "We hit an asteroid. Here's the scar." ESA's Hera images (25 Nov 2026) of Dimorphos, deflected
// by NASA's DART (26 Sep 2022): a stadium-sized crater across the moonlet, now tumbling; the mechanism is ejecta recoil (momentum
// enhancement β = 3.61, Cheng et al., Nature 2023). Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the
// accepted english-12…24 builds: a paper miniature in Media Diet brand colours with real cast shadows, one camera set-up per beat,
// restrained depth of field. New setting: a paper deep-space diorama. Asteroids, spacecraft and plume are illustrative. Deterministic: window.render(f).
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
const fill = new THREE.DirectionalLight('#ffe6cc', 0.7); fill.position.set(4, 6, 9); scene.add(fill);
const CYAN = '#2addfa', GREEN = '#3ddc84', AMBER = '#ffb21f', GOLD = '#ffd23f', RED = '#ff4d6d';
const glowMat = (col, op = 1) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending });
const smooth = (u) => u * u * (3 - 2 * u);
let rs = 7; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
const FY = 1.25;   // height at which the space scenes float above the desk
const HEADOBJ = scene.children.filter((o) => !o.isLight && o !== key.target);   // desk, table and hills from the shared head: hidden in the space shots

// ------------------------------------------------------------------ deep-space backdrop card (paper stars) in front of the hills
const starTex = canvasTex(2048, 1200, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#05061c'); gr.addColorStop(0.6, '#0d0f3a'); gr.addColorStop(1, '#151456'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) { const x = r() * w, y = r() * h, k = r(); g.fillStyle = k > 0.97 ? '#ffd23f' : k > 0.9 ? '#a8f0ff' : '#eae6ff'; g.globalAlpha = 0.35 + 0.65 * r(); g.beginPath(); g.arc(x, y, 0.8 + 2.4 * k * k, 0, Math.PI * 2); g.fill(); } g.globalAlpha = 1; });
const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(26, 15), new THREE.MeshBasicMaterial({ map: starTex })); backdrop.position.set(0, 5.5, -8); scene.add(backdrop);

// ------------------------------------------------------------------ rubble-pile asteroids (generic paper reconstructions, not shape models)
function rubbleGeo(radius, seed, squash, detail = 4, bumps = 0.14, crater = null) {
  const g = new THREE.IcosahedronGeometry(radius, detail); const pos = g.attributes.position; let s = seed; const rn = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const blobs = Array.from({ length: 16 }, () => ({ d: V3(rn() - 0.5, rn() - 0.5, rn() - 0.5).normalize(), a: (rn() - 0.4) * bumps, w: 0.2 + rn() * 0.4 }));
  const cols = [];
  for (let i = 0; i < pos.count; i++) { const v = V3(pos.getX(i), pos.getY(i), pos.getZ(i)); const n = v.clone().normalize(); let k = 1;
    blobs.forEach((b) => { k += b.a * Math.exp(-(1 - n.dot(b.d)) / b.w * 3); }); k += (Math.sin(n.x * 23 + n.y * 17) * Math.cos(n.z * 19)) * 0.018; v.multiplyScalar(k); v.set(v.x * squash[0], v.y * squash[1], v.z * squash[2]);
    if (crater) { const along = v.x; const p0 = radius * crater.plane; if (along > p0) { v.x = p0; } const lat = Math.hypot(v.y, v.z); const Rc = radius * crater.r; if (v.x >= p0 - 1e-6 && lat < Rc) v.x -= radius * crater.depth * (1 - (lat / Rc) ** 2); }
    pos.setXYZ(i, v.x, v.y, v.z);
    const base = new THREE.Color('#948ca2').multiplyScalar(0.92 + 0.16 * rn()); if (crater) { const p0 = radius * crater.plane; if (v.x > p0 - radius * 0.2) base.lerp(new THREE.Color('#5f586e'), clamp((v.x - (p0 - radius * 0.2)) / (radius * 0.2))); }
    cols.push(base.r, base.g, base.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals(); return g; }
const rockMat = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, map: grain, bumpMap: grain, bumpScale: 2.5, roughness: 0.93 }), rockMat2 = paper('#7a7388'), craterRimMat = paper('#a69eb6');
function makeAsteroid(radius, seed, squash, craterOn) {
  const g = new THREE.Group(); scene.add(g);
  const m = new THREE.Mesh(rubbleGeo(radius, seed, squash, 4, 0.14, craterOn ? { plane: 0.42, r: 0.95, depth: 0.12 } : null), rockMat); m.castShadow = m.receiveShadow = true; g.add(m);
  const bould = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), rockMat2, 90); bould.castShadow = true; g.add(bould); const M4 = new THREE.Matrix4(); let n = 0;
  while (n < 90) { const d = V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(); if (craterOn && d.x > 0.45) continue; const sz = radius * (0.04 + 0.08 * rnd() ** 2);
    M4.compose(d.clone().multiplyScalar(radius * (0.93 + 0.08 * rnd())).multiply(V3(squash[0], squash[1], squash[2])), new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 3, rnd() * 3)), V3(sz, sz * (0.7 + 0.4 * rnd()), sz)); bould.setMatrixAt(n++, M4); }
  if (craterOn) { const rim = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.8, radius * 0.028, 8, 48), craterRimMat); rim.rotation.y = Math.PI / 2; rim.position.x = radius * 0.44; rim.scale.set(1, squash[1] / squash[0] * 0.98, squash[2] / squash[0] * 0.98); rim.castShadow = true; g.add(rim); }
  return g; }
const dimPost = makeAsteroid(0.42, 11, [1.0, 0.82, 0.92], true);
const dimPre = makeAsteroid(0.42, 11, [1.0, 0.82, 0.92], false);
const didy = makeAsteroid(0.5, 29, [1.0, 0.86, 1.0], false);   // Didymos (spinning-top-ish), only in the orbit shot
const dimSmall = makeAsteroid(0.1, 11, [1.0, 0.82, 0.92], true);   // Dimorphos to scale with Didymos (151 m vs 730 m)
// "hundreds of previously unknown boulders" around the pair (Hera, 25 Nov 2026) — illustrative cloud
const cloud = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), rockMat2, 220); cloud.frustumCulled = false; scene.add(cloud);
const CLOUD = Array.from({ length: 220 }, () => ({ r: 0.6 + rnd() * 1.1, a: rnd() * Math.PI * 2, y: (rnd() - 0.5) * 0.7, w: 0.05 + rnd() * 0.12, s: 0.006 + 0.016 * rnd() ** 2, sp: rnd() * 3 }));
function setCloud(center, k, t) { const M4 = new THREE.Matrix4(); CLOUD.forEach((c, i) => { const a = c.a + t * c.w; M4.compose(V3(center.x + Math.cos(a) * c.r * k, center.y + c.y * k, center.z + Math.sin(a) * c.r * k), new THREE.Quaternion().setFromEuler(new THREE.Euler(t * c.sp, t, 0)), V3(c.s, c.s, c.s).multiplyScalar(k)); cloud.setMatrixAt(i, M4); }); cloud.instanceMatrix.needsUpdate = true; }

// ------------------------------------------------------------------ spacecraft (generic paper models): DART impactor and the Hera orbiter
function makeDART() { const g = new THREE.Group(); scene.add(g);
  const bus = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.12, 0.12, 2, 0.015), paper('#d8d2ea')); bus.castShadow = true; g.add(bus);
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 0.02, 20), paper(P.white)); dish.rotation.z = Math.PI / 2; dish.position.x = 0.07; g.add(dish);
  [-1, 1].forEach((s) => { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.01, 0.01), paper('#9d95e0')); arm.position.set(0, 0, s * 0.075); arm.rotation.y = Math.PI / 2; g.add(arm);
    const panel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 24), new THREE.MeshStandardMaterial({ color: '#2a3c9e', emissive: '#1d4fd0', emissiveIntensity: 0.35, roughness: 0.5 })); panel.rotation.x = Math.PI / 2; panel.position.set(0, 0, s * 0.3); panel.scale.set(1, 1, 0.25); panel.castShadow = true; g.add(panel); });
  return g; }
const dart = makeDART();
function makeHera() { const g = new THREE.Group(); scene.add(g);
  const bus = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.14, 0.14, 2, 0.015), paper('#e0b43a')); bus.castShadow = true; g.add(bus);
  const cam = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.06, 18), paper('#2b2f5e')); cam.rotation.z = Math.PI / 2; cam.position.x = -0.1; g.add(cam);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.022, 18), new THREE.MeshStandardMaterial({ color: '#0d1240', emissive: CYAN, emissiveIntensity: 0.6 })); lens.rotation.y = -Math.PI / 2; lens.position.x = -0.131; g.add(lens); g.userData.lens = lens;
  [-1, 1].forEach((s) => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.006, 0.32), new THREE.MeshStandardMaterial({ color: '#25307e', emissive: '#1d4fd0', emissiveIntensity: 0.3 })); w.position.set(0.0, 0, s * 0.25); w.castShadow = true; g.add(w); });
  return g; }
const hera = makeHera();
const flash = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), glowMat('#fff4c8', 0.9)); scene.add(flash);
const STREAK = Array.from({ length: 5 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.006, 0.006), glowMat('#ffffff', 0.6)); scene.add(m); return m; });

// ------------------------------------------------------------------ the stadium (scale comparison, generic)
const stadium = new THREE.Group(); scene.add(stadium);
{ const shape = new THREE.Shape(); shape.absellipse(0, 0, 0.46, 0.33, 0, Math.PI * 2); const hole = new THREE.Path(); hole.absellipse(0, 0, 0.36, 0.23, 0, Math.PI * 2, true); shape.holes.push(hole);
  const stands = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: false, curveSegments: 48 }), [paper('#e9e4ff'), paper('#cfc8ff')]); stands.rotation.x = -Math.PI / 2; stands.castShadow = true; stadium.add(stands);
  const field = new THREE.Mesh(new THREE.CircleGeometry(1, 48), paper('#3fae6a')); field.scale.set(0.36, 0.23, 1); field.rotation.x = -Math.PI / 2; field.position.y = 0.01; stadium.add(field);
  const lines = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.068, 32), paper(P.white)); lines.rotation.x = -Math.PI / 2; lines.position.y = 0.012; stadium.add(lines); }

// ------------------------------------------------------------------ ejecta: rubble thrown back out of the impact face (illustrative), plus an exhaust-like glow
const EJN = 320; const ej = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), paper('#a59db5'), EJN); ej.frustumCulled = false; ej.castShadow = true; scene.add(ej);
const EJ = Array.from({ length: EJN }, () => { const a = rnd() * Math.PI * 2, c = 0.35 + 0.65 * rnd(); return { dir: V3(Math.cos(0.65 * (1 - c)) , Math.sin(0.65 * (1 - c)) * Math.cos(a), Math.sin(0.65 * (1 - c)) * Math.sin(a)).normalize(), sp: 0.25 + 0.9 * rnd() ** 1.5, s: 0.006 + 0.022 * rnd() ** 2, d0: rnd() * 0.25, rot: rnd() * 6 }; });
const exhaust = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.6, 32, 1, true), glowMat(AMBER, 0.0)); exhaust.geometry.translate(0, -0.8, 0); scene.add(exhaust);
function setEjecta(origin, axis, age, k = 1) { const M4 = new THREE.Matrix4(); const q = new THREE.Quaternion().setFromUnitVectors(V3(1, 0, 0), axis.clone().normalize());
  EJ.forEach((e, i) => { const tt = age - e.d0; if (tt <= 0) { M4.compose(V3(0, -50, 0), new THREE.Quaternion(), V3(0.001, 0.001, 0.001)); ej.setMatrixAt(i, M4); return; }
    const p = e.dir.clone().applyQuaternion(q).multiplyScalar(e.sp * tt * k).add(origin); M4.compose(p, new THREE.Quaternion().setFromEuler(new THREE.Euler(e.rot + tt * 3, tt * 2, 0)), V3(e.s, e.s, e.s).multiplyScalar(k)); ej.setMatrixAt(i, M4); });
  ej.instanceMatrix.needsUpdate = true; }
function hideEjecta() { setEjecta(V3(0, -50, 0), V3(1, 0, 0), -1); }

// ------------------------------------------------------------------ momentum arrows and the payoff bars
const aDart = makeArrow(CYAN, 0.03), aRub = makeArrow(AMBER, 0.03), aTot = makeArrow(GOLD, 0.03), aRecoil = makeArrow(GOLD, 0.03);
const barTex = (txt, col) => canvasTex(256, 96, (g) => { g.fillStyle = col; g.fillRect(0, 0, 256, 96); g.fillStyle = '#ffffff'; g.font = '700 46px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 128, 50); });
const bars = new THREE.Group(); scene.add(bars);
function makeBar(x, col, txt) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1, 0.34), [paper(col), paper(col), paper(P.lav), paper(col), paper(col), paper(col)]); b.geometry.translate(0, 0.5, 0); b.position.set(x, DESK, 0); b.castShadow = true; bars.add(b);
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.15), new THREE.MeshStandardMaterial({ map: barTex(txt, col), roughness: 0.9 })); tag.position.set(x, DESK + 0.1, 0.2); bars.add(tag); return b; }
const barDart = makeBar(-0.24, '#1b8fb3', 'DART'), barRub = makeBar(0.24, '#c98a10', 'RUBBLE');

// ------------------------------------------------------------------ planetary defence illustration: a paper Earth and a generic incoming asteroid nudged off course
const LAND = { na: [[-168, 65], [-140, 70], [-95, 72], [-66, 62], [-60, 52], [-70, 42], [-81, 31], [-80, 25], [-97, 27], [-97, 21], [-84, 11], [-79, 8], [-92, 15], [-110, 24], [-118, 34], [-124, 46], [-133, 57], [-155, 58]],
  sa: [[-79, 8], [-62, 11], [-50, 1], [-35, -5], [-41, -22], [-53, -33], [-65, -42], [-70, -55], [-74, -50], [-71, -30], [-76, -14], [-81, -5]],
  eu: [[-10, 36], [-9, 43], [-4, 48], [5, 53], [8, 57], [5, 62], [20, 70], [41, 67], [44, 58], [40, 48], [27, 41], [12, 44], [0, 38]],
  af: [[-17, 15], [-12, 28], [-6, 35], [10, 37], [32, 31], [43, 12], [51, 12], [40, -15], [28, -34], [18, -34], [12, -18], [8, 4], [-12, 8]],
  as: [[40, 48], [60, 70], [100, 77], [160, 70], [180, 66], [155, 50], [130, 42], [122, 31], [108, 20], [100, 13], [103, 1], [92, 22], [80, 15], [73, 18], [57, 26], [44, 12], [36, 36]],
  au: [[114, -22], [114, -34], [130, -32], [146, -39], [153, -28], [142, -11], [130, -12]] };
const earthTex = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#2a6fd0'; g.fillRect(0, 0, w, h); Object.values(LAND).forEach((pts) => { g.beginPath(); pts.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * w, y = (90 - la) / 180 * h; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); g.fillStyle = '#7fd18f'; g.fill(); });
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(0, 0, w, 26); g.fillRect(0, h - 30, w, 30); });
const earth = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 32), new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.8, bumpMap: grain, bumpScale: 1.5 })); earth.castShadow = true; scene.add(earth);
const atmo = new THREE.Mesh(new THREE.SphereGeometry(0.6, 48, 32), glowMat('#6fc3ff', 0.18)); scene.add(atmo);
const threat = makeAsteroid(0.09, 41, [1, 0.8, 0.9], false);
const pathOld = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(V3(-1.6, FY + 1.2, -1.0), V3(0.0, FY, 0.0)), 8, 0.006, 6), glowMat(RED, 0.7)); scene.add(pathOld);
const pathNew = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(V3(-0.9, FY + 0.68, -0.56), V3(-0.3, FY + 0.35, -0.1), V3(0.55, FY + 0.55, 0.55)), 32, 0.007, 6), glowMat(GREEN, 0.85)); scene.add(pathNew);
const probe2 = makeDART(); probe2.scale.setScalar(0.6);

// ------------------------------------------------------------------ orbit rings (S4): old path (ghost) and the tighter new one — gap exaggerated for visibility
const orbitG = new THREE.Group(); scene.add(orbitG); orbitG.position.set(0, FY, 0); orbitG.rotation.y = 1.22; orbitG.scale.setScalar(0.82);
const ringOld = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.008, 6, 96), glowMat('#b9b2ff', 0.5)); orbitG.add(ringOld);
const ringNew = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.01, 6, 96), glowMat(GOLD, 0.9)); orbitG.add(ringNew);

// ------------------------------------------------------------------ CTA sign (Media Diet identity only)
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
  S1: (t) => { const u = U('S1', t); return SH(L3([0.85, FY + 0.35, 1.85], [0.78, FY + 0.33, 1.73], u), V3(-0.12, FY + 0.02, 0), 40); },
  S2: (t) => { const u = U('S2', t); return SH(L3([1.25, FY + 0.3, 2.45], [1.15, FY + 0.28, 2.32], u), V3(-0.05, FY + 0.12, 0), 40); },
  S3: (t) => { const u = U('S3', t); return SH(L3([1.55, FY + 0.45, 2.55], [1.48, FY + 0.43, 2.45], u), V3(0.3, FY + 0.12, 0.2), 40); },
  S4: (t) => { const u = U('S4', t); return SH(L3([0.5, FY + 0.35, 3.7], [0.45, FY + 0.33, 3.55], u), V3(0.0, FY, 0), 40); },
  S5: (t) => { const u = U('S5', t); return SH(L3([0.55, FY + 0.6, 2.7], [0.6, FY + 0.58, 2.6], u), V3(0.25, FY + 0.12, 0.3), 40); },
  S6: (t) => { const u = U('S6', t); return SH(L3([0.05, FY + 0.3, 2.75], [0.0, FY + 0.28, 2.6], u), V3(-0.05, FY + 0.12, 0), 40); },
  S7: (t) => { const u = U('S7', t); return SH(L3([0.15, DESK + 0.95, 2.75], [0.12, DESK + 0.93, 2.65], u), V3(0.0, DESK + 0.36, 0), 40); },
  S8: (t) => { const u = U('S8', t); return SH(L3([0.6, FY + 0.6, 3.45], [0.55, FY + 0.58, 3.3], u), V3(-0.1, FY + 0.32, 0), 40); },
  S9: (t) => { const u = U('S9', t); return SH(L3([0.3, 1.75, 6.6], [0.25, 1.95, 7.0], u), L3([0, 0.85, 0.4], [0, 0.9, 0.35], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
const VIS = (objs, on) => objs.forEach((o) => (o.visible = on));
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  VIS([dimPost, dimPre, didy, dimSmall, cloud, dart, hera, flash, stadium, ej, exhaust, bars, earth, atmo, threat, pathOld, pathNew, probe2, orbitG, sign], false); STREAK.forEach((m) => (m.visible = false));
  [aDart, aRub, aTot, aRecoil].forEach((a) => (a.visible = false)); backdrop.visible = id !== 'S9' && id !== 'S7'; HEADOBJ.forEach((o) => (o.visible = id === 'S7' || id === 'S9'));
  dimPost.position.set(0, FY, 0); dimPost.scale.setScalar(1); dimPost.rotation.set(0, 0, 0);
  if (id === 'S1') { dimPost.visible = cloud.visible = true; dimPost.rotation.set(0.3 + 0.12 * Math.sin(t * 0.9), -0.5 + t * 0.1, 0.15 * Math.cos(t * 0.7)); setCloud(V3(0, FY, 0), 0.75, t); }
  if (id === 'S2') { dimPost.visible = hera.visible = stadium.visible = cloud.visible = true; dimPost.rotation.set(0.3, -0.35 + t * 0.05, 0.15); setCloud(V3(0, FY, 0), 0.75, t);
    hera.position.set(0.62, FY + 0.05, 0.85); hera.scale.setScalar(0.62); hera.rotation.set(0.1, 0.45, 0.05); hera.userData.lens.material.emissiveIntensity = 0.6 + 2.5 * Math.max(0, Math.sin((t - 3.2) * 9)) * (t > 3.2 && t < 3.6 ? 1 : 0);
    const sa = prog(t, E.stadium - 0.3, E.stadium + 0.4, outBack); stadium.position.set(-0.5, FY - 0.02 + 0.1 * (1 - clamp(sa)), 0.18); stadium.rotation.set(0.95, 0.35, -0.05); stadium.scale.multiplyScalar(0.62); stadium.scale.setScalar(Math.max(0.001, clamp(sa, 0, 1.2))); }
  if (id === 'S3') { const k = t - E.impact; dimPre.visible = k < 0.05; dimPost.visible = k >= 0.05; [dimPre, dimPost].forEach((d) => { d.position.set(0, FY, 0); d.rotation.set(0.3, -0.25, 0.1); });
    if (k < 0) { dart.visible = true; const u = prog(t, sh('S3').in, E.impact, (x) => x); const a = V3(1.35, FY + 0.42, 1.45), b = V3(0.42, FY + 0.03, 0.05); dart.position.copy(a.clone().lerp(b, u * u * 0.4 + u * 0.6)); dart.lookAt(b); dart.rotateY(-Math.PI / 2);
      const dir = b.clone().sub(a).normalize(); STREAK.forEach((m, i) => { m.visible = true; m.position.copy(dart.position.clone().addScaledVector(dir, -0.3 - 0.12 * i)).add(V3(0, (i - 2) * 0.03, 0)); m.quaternion.setFromUnitVectors(V3(1, 0, 0), dir); }); }
    const f = clamp(1 - k / 0.5); if (k >= 0 && f > 0) { flash.visible = true; flash.position.set(0.42, FY + 0.03, 0.05); flash.scale.setScalar(0.04 + 0.2 * outC(clamp(k / 0.35))); flash.material.opacity = 0.95 * f; }
    if (k > 0) { ej.visible = true; setEjecta(V3(0.4, FY + 0.03, 0.05), V3(1, 0.25, 0.6), k, 0.9); } }
  if (id === 'S4') { didy.visible = dimSmall.visible = orbitG.visible = cloud.visible = true; didy.position.set(0, FY, 0); didy.scale.setScalar(0.82); didy.rotation.set(0.15, t * 0.6, 0); setCloud(V3(0, FY, 0), 0.9, t * 0.5);
    const shr = prog(t, E.orbit, E.orbit + 0.9); ringNew.material.opacity = 0.9 * shr; ringOld.material.opacity = 0.55; const R = lerp(1.0, 0.9, shr); const ang = t * lerp(0.9, 1.05, shr);
    orbitG.updateMatrixWorld(true); dimSmall.position.copy(orbitG.localToWorld(V3(Math.cos(ang) * R, Math.sin(ang) * R, 0))); dimSmall.rotation.set(t, t * 0.7, 0); }
  if (id === 'S5') { const k = t - E.plume; dimPost.visible = true; ej.visible = true; const rec = 0.08 * smooth(clamp(k / 2.5)); dimPost.position.set(-rec, FY, 0); dimPost.rotation.set(0.25, 0.0, 0.1);
    setEjecta(V3(0.38 - rec, FY + 0.03, 0.16), V3(0.45, 0.2, 0.87), Math.max(0, k), 0.6);
    const ex = prog(t, E.exhaust - 0.2, E.exhaust + 0.4); exhaust.visible = ex > 0.01; exhaust.position.set(0.42 - rec, FY + 0.02, 0.12); exhaust.quaternion.setFromUnitVectors(V3(0, -1, 0), V3(0.45, 0.2, 0.87).normalize()); exhaust.material.opacity = 0.14 * ex;
    setArrow(aRecoil, V3(-0.4 - rec, FY + 0.0, -0.3), V3(-0.75, -0.1, -0.65), 0.45 * prog(t, E.labRecoil - 0.2, E.labRecoil + 0.4), 1); }
  if (id === 'S6') { dimPost.visible = true; const c = V3(0.12, FY + 0.5, 0); dimPost.position.copy(c); dimPost.rotation.set(0.25, -0.3, 0.1); const dd = V3(-0.35, -1, 0).normalize(), pp = V3(0.94, -0.33, 0); const base = c.clone().addScaledVector(dd, 0.4);
    const d1 = prog(t, E.arrowDart, E.arrowDart + 0.4), d2 = prog(t, E.arrowRub, E.arrowRub + 0.9), d3 = prog(t, E.labPush - 0.1, E.labPush + 0.4); const unit = 0.2;
    setArrow(aDart, base, dd, unit * d1, 1); setArrow(aRub, base.clone().addScaledVector(dd, unit), dd, 2.61 * unit * d2, 1); setArrow(aTot, base.clone().addScaledVector(pp, 0.13), dd, 3.61 * unit * d3, 1); }
  if (id === 'S7') { bars.visible = true; const g1 = prog(t, E.bars, E.bars + 0.5), g2 = prog(t, E.bars + 0.3, E.bars + 1.2); barDart.scale.y = Math.max(0.001, 0.29 * g1); barRub.scale.y = Math.max(0.001, 0.29 * 2.61 * g2); }
  if (id === 'S8') { earth.visible = atmo.visible = threat.visible = pathNew.visible = pathOld.visible = probe2.visible = true; earth.position.set(0, FY, 0); earth.scale.setScalar(0.8); atmo.scale.setScalar(0.8); earth.rotation.set(0.35, t * 0.15, 0); atmo.position.copy(earth.position);
    const hit = E.hit; const before = t < hit; pathOld.material.opacity = before ? 0.7 : 0.25; pathNew.material.opacity = 0.85 * prog(t, hit, hit + 0.4);
    const p0 = V3(-1.6, FY + 1.2, -1.0), pH = V3(-0.9, FY + 0.68, -0.56); if (before) { threat.position.copy(p0.clone().lerp(pH, prog(t, sh('S8').in, hit, (x) => x))); }
    else { threat.position.copy(pathNew.geometry.parameters.path.getPoint(clamp((t - hit) / 2.4))); }
    threat.rotation.set(t * 1.3, t, 0); const pu = prog(t, sh('S8').in, hit, (x) => x); probe2.position.copy(V3(0.6, FY + 1.0, 0.6).lerp(pH, pu)); probe2.lookAt(pH); probe2.rotateY(-Math.PI / 2); probe2.visible = before;
    const fk = clamp(1 - (t - hit) / 0.4); if (t >= hit && fk > 0) { flash.visible = true; flash.position.copy(pH); flash.scale.setScalar(0.03 + 0.2 * outC(clamp((t - hit) / 0.3))); flash.material.opacity = 0.9 * fk; } }
  if (id === 'S9') sign.visible = true;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = id === 'S1' ? 0.0014 : 0.0006; bokeh.uniforms.maxblur.value = id === 'S1' ? 0.008 : 0.005;
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
const small = (text, a) => chip(text, 540, 1462, 'rgba(13,18,64,0.78)', { font: '700 25px "Space Grotesk"', h: 46, alpha: a, dy: 9 });
const C = { teal: 'rgba(18,122,143,0.94)', red: 'rgba(196,40,74,0.94)', gold: 'rgba(176,112,0,0.95)', green: 'rgba(26,127,75,0.95)', violet: 'rgba(85,45,188,0.94)' };
function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = []; const id = shot.id;
  const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  if (id === 'S1') small("illustration of ESA Hera's view · 25 Nov 2026", 1);
  if (id === 'S2') { big('stadium-sized crater', 1370, prog(t, E.stadium, E.stadium + 0.25), C.gold, { size: 72 }); small('ESA Hera · Dimorphos (151 m) · released 25 Nov 2026', prog(t, 2.5, 2.8)); }
  if (id === 'S3') { big('6.1 km/s', 1370, prog(t, E.labSpeed, E.labSpeed + 0.25), C.teal, { size: 84 }); small('NASA DART · 579 kg · 26 Sep 2022', prog(t, 6.3, 6.6)); }
  if (id === 'S4') { big('orbit: 33 min shorter', 1370, prog(t, E.orbit, E.orbit + 0.25), C.gold, { size: 70 }); small('Dimorphos around Didymos · gap exaggerated', prog(t, 9.5, 9.8)); }
  if (id === 'S5') big('rubble recoil', 1370, prog(t, E.labRecoil, E.labRecoil + 0.25), C.red, { size: 80 });
  if (id === 'S6') { big('≈ 3.6 × the push', 1370, prog(t, E.labPush, E.labPush + 0.25), C.gold, { size: 78 }); small('β = 3.61 (Cheng et al., Nature 2023; density 2.4 g/cm³)', prog(t, E.arrowRub, E.arrowRub + 0.3)); }
  if (id === 'S7') { big('the rubble did most of it', 1370, prog(t, E.labMost, E.labMost + 0.25), C.green, { size: 66 }); small('β 2.2–4.9 for any plausible density', prog(t, 21.6, 21.9)); }
  if (id === 'S8') { big('planetary defense', 1370, prog(t, E.labDefense, E.labDefense + 0.25), C.teal, { size: 76 }); small('illustration · Didymos and Dimorphos pose no threat', prog(t, 23.3, 23.6)); }
  captions(t);
}

scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.renderThumb = async () => { await window.render(0); return TEXTLOG; };   // thumbnail = frame 0
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
