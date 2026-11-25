// Media Diet · 30 s English episode 24 — "The safety net spread the crash." Microsoft's post-incident report (20 Nov 2026) on the
// 12 Nov 2026 Microsoft 365 / Outlook outage: a latent defect froze busy gateway servers and automatic rerouting cascaded the failure.
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted english-12…23 builds: a paper miniature in
// Media Diet brand colours with real cast shadows, one camera set-up per beat, restrained depth of field. New setting: a paper server
// floor, a server cutaway and a stylised paper world map. Load numbers in the row scenes are illustrative. Deterministic: window.render(f).
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
const CYAN = '#2addfa', GREEN = '#3ddc84', AMBER = '#ffb21f', GOLD = '#ffd23f', RED = '#ff4d6d', ICE = '#bfe9ff';
const glowMat = (col, op = 1) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending });
const smooth = (u) => u * u * (3 - 2 * u);
const loadCol = (l) => (l < 0.8 ? new THREE.Color(GREEN) : l < 1.0 ? new THREE.Color(GREEN).lerp(new THREE.Color(AMBER), (l - 0.8) / 0.2) : new THREE.Color(AMBER).lerp(new THREE.Color(RED), clamp((l - 1.0) / 0.15)));

// ------------------------------------------------------------------ envelope stock (generic paper mail tokens, no logos)
const envTex = canvasTex(128, 84, (g, w, h) => { g.fillStyle = '#f6f2ff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a7fd0'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); g.beginPath(); g.moveTo(6, 8); g.lineTo(w / 2, h * 0.58); g.lineTo(w - 6, 8); g.stroke(); });
const envMat = new THREE.MeshStandardMaterial({ map: envTex, roughness: 0.85 });
const envGeo = new THREE.BoxGeometry(0.075, 0.05, 0.006);
function envelopes(n) { const m = new THREE.InstancedMesh(envGeo, envMat, n); m.castShadow = true; m.frustumCulled = false; scene.add(m); m.userData.n = n; return m; }
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();
function setEnv(m, i, pos, rx, ry, rz, sc = 1) { _p.copy(pos); _q.setFromEuler(_e.set(rx, ry, rz)); _s.setScalar(sc); _m4.compose(_p, _q, _s); m.setMatrixAt(i, _m4); }
function hideEnv(m, from = 0) { for (let i = from; i < m.userData.n; i++) setEnv(m, i, V3(0, -5, 0), 0, 0, 0, 0.001); m.instanceMatrix.needsUpdate = true; }

// ------------------------------------------------------------------ paper server tower: slots, status LED, load gauge with a limit line, frost when frozen
const SW = 0.24, SHT = 0.6, SD = 0.24, GH = 0.36;   // gauge: 0..GH, limit (load 1.0) at 0.8·GH
function makeServer(parent = scene) {
  const g = new THREE.Group(); parent.add(g); const tilt = new THREE.Group(); g.add(tilt);
  const body = new THREE.Mesh(new RoundedBoxGeometry(SW, SHT, SD, 3, 0.02), paper(P.navy2)); body.position.y = SHT / 2; body.castShadow = body.receiveShadow = true; tilt.add(body);
  const top = new THREE.Mesh(new RoundedBoxGeometry(SW + 0.02, 0.03, SD + 0.02, 2, 0.01), paper(P.lav)); top.position.y = SHT + 0.012; top.castShadow = true; tilt.add(top);
  const slotMat = new THREE.MeshStandardMaterial({ color: '#1a1f5c', emissive: CYAN, emissiveIntensity: 0.55, roughness: 0.5 });
  for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.022, 0.01), slotMat); s.position.set(-0.035, 0.12 + k * 0.085, SD / 2 + 0.004); tilt.add(s); }
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.018, 14, 10), new THREE.MeshStandardMaterial({ color: GREEN, emissive: GREEN, emissiveIntensity: 1.2 })); led.position.set(-0.07, SHT - 0.05, SD / 2 + 0.01); tilt.add(led);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.05, GH + 0.02, 0.012), paper('#0b0f3a')); slot.position.set(0.075, 0.08 + GH / 2, SD / 2 + 0.004); tilt.add(slot);
  const fillM = new THREE.Mesh(new THREE.BoxGeometry(0.036, 1, 0.014), new THREE.MeshStandardMaterial({ color: GREEN, emissive: GREEN, emissiveIntensity: 0.7 })); fillM.geometry.translate(0, 0.5, 0); fillM.position.set(0.075, 0.09, SD / 2 + 0.006); tilt.add(fillM);
  const lim = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.008, 0.016), new THREE.MeshStandardMaterial({ color: RED, emissive: RED, emissiveIntensity: 0.9 })); lim.position.set(0.075, 0.09 + 0.8 * GH, SD / 2 + 0.008); tilt.add(lim);
  const frost = new THREE.Mesh(new RoundedBoxGeometry(SW + 0.03, SHT + 0.03, SD + 0.03, 3, 0.03), new THREE.MeshStandardMaterial({ color: ICE, emissive: '#7fc8ff', emissiveIntensity: 0.3, transparent: true, opacity: 0, roughness: 0.3, depthWrite: false })); frost.position.y = SHT / 2; tilt.add(frost);
  return { g, tilt, led, fillM, slotMat, frost };
}
function setServer(S, load, frozen) {   // load: 1.0 = limit; frozen 0..1
  const l = Math.max(0, load); S.fillM.scale.y = Math.max(0.001, Math.min(l, 1.2) * 0.8 * GH); const c = loadCol(l); S.fillM.material.color.copy(c); S.fillM.material.emissive.copy(c);
  const f = clamp(frozen); S.led.material.color.set(f > 0.5 ? RED : l > 1 ? AMBER : GREEN); S.led.material.emissive.copy(S.led.material.color); S.led.material.emissiveIntensity = f > 0.5 ? 1.4 : 1.1;
  S.slotMat.emissiveIntensity = 0.55 * (1 - 0.85 * f); S.frost.material.opacity = 0.32 * f; S.tilt.rotation.x = -0.12 * smooth(f);
}

// ------------------------------------------------------------------ S1: the hook row (perspective) + a red "rerouting net" passing the crash along
const HOOKN = 9; const hookRow = Array.from({ length: HOOKN }, (_, i) => { const S = makeServer(); S.g.position.set(-0.2 + i * 0.36, DESK, -0.25 - i * 0.42); S.g.rotation.y = 0.35; return S; });
const hookArcs = Array.from({ length: HOOKN - 1 }, (_, i) => { const a = hookRow[i].g.position, b = hookRow[i + 1].g.position;
  const cv = new THREE.QuadraticBezierCurve3(V3(a.x, DESK + SHT + 0.05, a.z), V3((a.x + b.x) / 2, DESK + SHT + 0.32, (a.z + b.z) / 2), V3(b.x, DESK + SHT + 0.05, b.z));
  const m = new THREE.Mesh(new THREE.TubeGeometry(cv, 30, 0.012, 8), glowMat(RED, 0.85)); scene.add(m); m.userData.cv = cv; return m; });
const hookEnv = envelopes(40);

// ------------------------------------------------------------------ S2: a generic paper laptop stuck on "can't connect", queued mail piling up
const laptop = new THREE.Group(); scene.add(laptop); laptop.position.set(0, DESK, 0.3);
const scrTex = canvasTex(512, 320, () => {});
function drawScreen(t) { const c = scrTex.image, g = c.getContext('2d'); g.fillStyle = '#eef0ff'; g.fillRect(0, 0, 512, 320); g.fillStyle = '#d9dcf5'; g.fillRect(0, 0, 512, 40); g.fillRect(0, 40, 120, 280);
  g.fillStyle = '#b9bde6'; for (let k = 0; k < 6; k++) g.fillRect(14, 58 + k * 34, 90, 14);
  g.save(); g.translate(316, 150); g.strokeStyle = '#8a7fd0'; g.lineWidth = 7; g.strokeRect(-52, -34, 104, 68); g.beginPath(); g.moveTo(-50, -32); g.lineTo(0, 6); g.lineTo(50, -32); g.stroke(); g.restore();
  g.save(); g.translate(316, 250); g.rotate(t * 5); g.strokeStyle = '#552dbc'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 22, 0, Math.PI * 1.4); g.stroke(); g.restore();
  g.fillStyle = '#c4284a'; g.font = '700 30px "Space Grotesk"'; g.textAlign = 'center'; g.fillText("Can't connect", 316, 214); scrTex.needsUpdate = true; }
{ const base = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.04, 0.6, 3, 0.02), paper('#cfc8ff')); base.position.y = 0.02; base.castShadow = base.receiveShadow = true; laptop.add(base);
  const kb = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.006, 0.3), paper('#9d95e0')); kb.position.set(0, 0.043, 0.06); laptop.add(kb);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.04, -0.29); hinge.rotation.x = -0.28; laptop.add(hinge);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.58, 0.03, 3, 0.02), paper(P.navy2)); lid.position.set(0, 0.29, 0); lid.castShadow = true; hinge.add(lid);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.512), new THREE.MeshStandardMaterial({ map: scrTex, emissive: '#ffffff', emissiveMap: scrTex, emissiveIntensity: 0.55, roughness: 0.6 })); scr.position.set(0, 0.29, 0.017); hinge.add(scr); }
const pileEnv = envelopes(60);

// ------------------------------------------------------------------ S3: one server in cutaway — requests queue at a one-at-a-time lock (turnstile) and jam
const cut = new THREE.Group(); scene.add(cut); cut.position.set(0, DESK, 0.2);
const cutShell = new THREE.Group(); cut.add(cutShell);
{ const back = card(1.1, 1.3, 0.04, P.navy2, P.lav, 'z'); back.position.set(0, 0.65, -0.3); cutShell.add(back);
  const side1 = card(0.04, 1.3, 0.6, P.deep, P.lav, 'x'); side1.position.set(-0.55, 0.65, 0); const side2 = side1.clone(); side2.position.x = 0.55; cutShell.add(side1, side2);
  const roof = card(1.14, 0.04, 0.64, P.lav, P.white); roof.position.set(0, 1.32, 0); cutShell.add(roof);
  const floor = card(1.1, 0.03, 0.6, '#1b2170', P.lav); floor.position.set(0, 0.015, 0); cutShell.add(floor); }
const lockG = new THREE.Group(); cut.add(lockG); lockG.position.set(0.1, 0.03, 0);
{ const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 16), paper('#9d95e0')); post.position.y = 0.25; post.castShadow = true; lockG.add(post);
  for (let k = 0; k < 3; k++) { const arm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.03), paper(P.violetL)); arm.position.y = 0.32; arm.rotation.y = k * Math.PI / 3; arm.castShadow = true; lockG.add(arm); }
  const pad = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 8, 20, Math.PI), paper(GOLD)); pad.position.set(0, 0.6, 0); lockG.add(pad); const pb = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.1, 0.05, 2, 0.015), paper(GOLD)); pb.position.set(0, 0.54, 0); lockG.add(pb); }
const lockArms = lockG.children.slice(1, 4);
const cutLed = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshStandardMaterial({ color: GREEN, emissive: GREEN, emissiveIntensity: 1.3 })); cutLed.position.set(-0.4, 1.18, 0.02); cut.add(cutLed);
const cutFrost = new THREE.Mesh(new THREE.BoxGeometry(1.16, 1.36, 0.66), new THREE.MeshStandardMaterial({ color: ICE, emissive: '#7fc8ff', emissiveIntensity: 0.4, transparent: true, opacity: 0, depthWrite: false })); cutFrost.position.y = 0.66; cut.add(cutFrost);
const qEnv = envelopes(40);
const FLAKES = Array.from({ length: 12 }, (_, i) => { const m = new THREE.Mesh(starGeo, new THREE.MeshStandardMaterial({ color: '#e9f6ff', emissive: '#9fdcff', emissiveIntensity: 0.6 })); m.scale.setScalar(0.18 + (i % 3) * 0.06); scene.add(m); return m; });

// ------------------------------------------------------------------ S4/S5/S8: a row of gateway servers fed by one stream of mail
const ROWX0 = -1.35, ROWDX = 0.3;
const rowS = Array.from({ length: 13 }, (_, i) => { const S = makeServer(); S.g.position.set(ROWX0 + i * ROWDX, DESK, -0.1); return S; });
const srcHopper = new THREE.Group(); scene.add(srcHopper); srcHopper.position.set(-0.05, DESK + 0.55, -1.15); srcHopper.scale.setScalar(0.7);
{ const h = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.3, 24, 1, true), paper('#cfc8ff')); h.material.side = THREE.DoubleSide; h.position.y = 0.55; h.castShadow = true; srcHopper.add(h);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 10), paper('#9d95e0')); st.position.y = 0.2; srcHopper.add(st); }
const rowEnv = envelopes(150);

// ------------------------------------------------------------------ S6/S7: paper world map with server sites (stylised continents, equirectangular)
const MAPW = 3.6, MAPH = 1.8;
const LAND = {
  na: [[-168, 65], [-160, 70], [-140, 70], [-120, 72], [-95, 72], [-80, 73], [-66, 62], [-60, 52], [-66, 45], [-70, 42], [-76, 38], [-81, 31], [-80, 25], [-85, 30], [-90, 29], [-97, 27], [-97, 21], [-90, 16], [-84, 11], [-79, 8], [-83, 9], [-92, 15], [-105, 20], [-110, 24], [-115, 30], [-118, 34], [-123, 40], [-124, 46], [-126, 50], [-133, 57], [-145, 60], [-155, 58], [-165, 60]],
  gl: [[-55, 60], [-44, 60], [-20, 70], [-20, 80], [-60, 82], [-72, 78], [-56, 70]],
  sa: [[-79, 8], [-75, 11], [-62, 11], [-50, 1], [-35, -5], [-38, -13], [-41, -22], [-48, -26], [-53, -33], [-58, -38], [-65, -42], [-68, -50], [-70, -55], [-74, -50], [-73, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 0]],
  eu: [[-10, 36], [-9, 43], [-2, 44], [-4, 48], [1, 50], [5, 53], [8, 57], [5, 62], [12, 66], [20, 70], [30, 71], [41, 67], [44, 58], [40, 48], [30, 45], [27, 41], [22, 37], [17, 39], [12, 44], [8, 44], [3, 42], [0, 38], [-5, 36]],
  uk: [[-5, 50], [1, 51], [0, 53], [-3, 58], [-6, 57], [-5, 54]],
  af: [[-17, 15], [-17, 21], [-12, 28], [-6, 35], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [42, -2], [40, -15], [35, -25], [28, -34], [18, -34], [12, -18], [13, -5], [8, 4], [-5, 5], [-12, 8]],
  as: [[30, 45], [40, 48], [44, 58], [41, 67], [60, 70], [80, 73], [100, 77], [130, 72], [160, 70], [180, 66], [176, 60], [160, 58], [155, 50], [141, 45], [130, 42], [122, 40], [122, 31], [118, 24], [108, 20], [106, 10], [100, 13], [99, 8], [103, 1], [95, 16], [92, 22], [88, 22], [80, 15], [77, 8], [73, 18], [67, 25], [57, 26], [56, 20], [52, 15], [44, 12], [36, 28], [36, 36]],
  jp: [[130, 31], [135, 34], [141, 36], [142, 42], [140, 40], [135, 36]],
  au: [[114, -22], [114, -34], [122, -34], [130, -32], [138, -35], [146, -39], [150, -37], [153, -28], [146, -19], [142, -11], [136, -12], [130, -12], [122, -17]],
};
const lx = (lon) => (lon / 180) * MAPW / 2, lz = (lat) => -(lat / 90) * MAPH / 2;
const mapTex = canvasTex(2048, 1024, (g, w, h) => { g.fillStyle = '#1b2170'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(201,191,255,0.12)'; g.lineWidth = 2;
  for (let lo = -180; lo <= 180; lo += 30) { const x = (lo + 180) / 360 * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let la = -60; la <= 60; la += 30) { const y = (90 - la) / 180 * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  Object.values(LAND).forEach((pts) => { g.beginPath(); pts.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * w, y = (90 - la) / 180 * h; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath();
    g.fillStyle = '#e9e4ff'; g.fill(); g.lineWidth = 5; g.strokeStyle = '#a99ff0'; g.stroke(); }); });
const worldMap = new THREE.Group(); scene.add(worldMap);
{ const board = new THREE.Mesh(new THREE.BoxGeometry(MAPW + 0.12, 0.04, MAPH + 0.12), [paper(P.lav), paper(P.lav), new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.9 }), paper(P.deep), paper(P.lav), paper(P.lav)]); board.position.y = DESK + 0.02; board.receiveShadow = true; worldMap.add(board); }
let rs = 5; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
const REGIONS = { na: [[-77, 39, 14], [-96, 33, 8], [-120, 38, 8], [-88, 42, 6], [-73, 45, 4], [-122, 47, 4]], eu: [[5, 51, 7], [-6, 53, 4], [10, 50, 5], [2, 47, 4], [18, 59, 3]], as: [[139, 35, 5], [103, 1, 5], [114, 22, 4], [127, 37, 3], [77, 18, 4]], au: [[151, -33, 4], [144, -37, 3]], sa: [[-46, -23, 4]], af: [[28, -26, 3]] };
const SITES = []; Object.entries(REGIONS).forEach(([reg, cl]) => cl.forEach(([lo, la, n]) => { for (let k = 0; k < n; k++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * (2.0 + n * 0.45);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.07, 10), new THREE.MeshStandardMaterial({ color: GREEN, emissive: GREEN, emissiveIntensity: 0.8 })); m.castShadow = true;
  m.position.set(lx(lo + Math.cos(a) * r), DESK + 0.075, lz(la + Math.sin(a) * r * 0.8)); worldMap.add(m); SITES.push({ m, reg, lo: lo + Math.cos(a) * r, la: la + Math.sin(a) * r * 0.8 }); } }));
const NA = SITES.filter((s) => s.reg === 'na'); const US_E = [-77, 39];
NA.forEach((s) => (s.d = Math.hypot(s.lo - US_E[0], s.la - US_E[1]))); const naSorted = [...NA].sort((a, b) => a.d - b.d); naSorted.forEach((s, i) => (s.rank = i / NA.length));
const OTHER = SITES.filter((s) => s.reg !== 'na'); OTHER.forEach((s, i) => (s.rank = ((i * 37) % OTHER.length) / OTHER.length));
const ARC_TO = [[5, 50], [139, 35], [103, 2], [151, -33], [-46, -23], [28, -26], [77, 18]];
const worldArcs = ARC_TO.map(([lo, la], i) => { const a = V3(lx(-80), DESK + 0.09, lz(40)), b = V3(lx(lo), DESK + 0.09, lz(la)); const mid = a.clone().add(b).multiplyScalar(0.5); mid.y += 0.35 + 0.25 * (Math.abs(lo + 80) / 230);
  const cv = new THREE.QuadraticBezierCurve3(a, mid, b); const m = new THREE.Mesh(new THREE.TubeGeometry(cv, 48, 0.008, 8), glowMat(AMBER, 0.9)); worldMap.add(m); m.userData.cv = cv; return m; });
const arcEnv = envelopes(70);
const setSite = (s, f) => { const c = new THREE.Color(GREEN).lerp(new THREE.Color(RED), clamp(f)); s.m.material.color.copy(c); s.m.material.emissive.copy(c); s.m.scale.y = 1 - 0.35 * clamp(f); };

// ------------------------------------------------------------------ S9: pools behind paper walls (planned fix)
const pools = new THREE.Group(); scene.add(pools);
const poolS = Array.from({ length: 12 }, (_, i) => { const S = makeServer(pools); const p = Math.floor(i / 4), k = i % 4; S.g.position.set(-1.45 + p * 1.1 + k * 0.26, DESK, -0.1); return S; });
const walls = [0, 1].map((k) => { const w = card(0.05, 0.85, 0.75, P.violet, P.lav, 'x'); w.position.set(-0.645 + k * 1.1, DESK + 0.425, -0.1); pools.add(w); return w; });
const poolEnv = envelopes(90);

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
  S1: (t) => { const u = U('S1', t); return SH(L3([-1.3, DESK + 0.62, 1.95], [-1.22, DESK + 0.62, 1.84], u), V3(0.55, DESK + 0.3, -1.05), 40, 2.15); },
  S2: (t) => { const u = U('S2', t); return SH(L3([0.55, DESK + 0.95, 1.95], [0.48, DESK + 0.9, 1.8], u), V3(0.0, DESK + 0.32, 0.15), 40); },
  S3: (t) => { const u = U('S3', t); return SH(L3([0.62, DESK + 0.95, 2.25], [0.56, DESK + 0.9, 2.12], u), V3(-0.02, DESK + 0.55, 0.0), 40); },
  S4: (t) => { const u = U('S4', t); return SH(L3([1.75, DESK + 1.35, 2.05], [1.65, DESK + 1.3, 1.95], u), V3(-0.4, DESK + 0.32, -0.35), 40); },
  S5: (t) => { const u = U('S5', t); return SH(L3([-2.05, DESK + 1.05, 1.75], [-1.95, DESK + 1.02, 1.65], u), V3(0.05, DESK + 0.32, -0.35), 40); },
  S6: (t) => { const u = U('S6', t); return SH(L3([lx(-97), DESK + 1.45, lz(36) + 0.95], [lx(-95), DESK + 1.38, lz(36) + 0.86], u), V3(lx(-96), DESK + 0.02, lz(41)), 40); },
  S7: (t) => { const u = U('S7', t); return SH(L3([2.75, DESK + 2.85, 0.55], [2.95, DESK + 3.0, 0.6], u), V3(-0.3, DESK - 0.05, -0.05), 40); },
  S8: (t) => { const u = U('S8', t); return SH(L3([1.75, DESK + 1.35, 2.05], [1.68, DESK + 1.32, 1.98], u), V3(-0.4, DESK + 0.32, -0.35), 40); },
  S9: (t) => { const u = U('S9', t); return SH(L3([1.65, DESK + 1.45, 2.2], [1.55, DESK + 1.4, 2.1], u), V3(-0.4, DESK + 0.3, -0.35), 40); },
  S10: (t) => { const u = U('S10', t); return SH(L3([0.3, 1.75, 6.6], [0.25, 1.95, 7.0], u), L3([0, 0.85, 0.4], [0, 0.9, 0.35], u), 42); },
};

// ------------------------------------------------------------------ row model (illustrative): 90 units of traffic shared by healthy servers; limit 10 each
let READ = { each: 9, healthy: 10 };
function rowState(t, n, failT) {   // failT: freeze times per server index (Infinity = never)
  return Array.from({ length: n }, (_, i) => clamp((t - failT[i]) / 0.35)); }
function drawRow(t, n, frz, total, rerouteK, envCount = 150) {
  const healthy = []; for (let i = 0; i < n; i++) if (frz[i] < 0.5) healthy.push(i);
  const each = total / Math.max(1, healthy.length); READ = { each, healthy: healthy.length };
  for (let i = 0; i < 13; i++) { const S = rowS[i]; S.g.visible = i < n; if (i >= n) continue; setServer(S, frz[i] > 0.5 ? Math.min(1.2, each / 10) : each / 10, frz[i]); }
  const src = V3(srcHopper.position.x, DESK + 0.88, srcHopper.position.z);
  for (let k = 0; k < envCount; k++) { const life = (t * 0.55 + k / envCount) % 1; const dest = healthy.length ? healthy[k % healthy.length] : 0; const S = rowS[dest];
    const end = V3(S.g.position.x, DESK + SHT + 0.06, S.g.position.z); const mid = src.clone().lerp(end, 0.5); mid.y += 0.45;
    const u = life; const p = src.clone().multiplyScalar((1 - u) * (1 - u)).add(mid.clone().multiplyScalar(2 * u * (1 - u))).add(end.clone().multiplyScalar(u * u));
    setEnv(rowEnv, k, p, 0.3 * Math.sin(k), k * 1.3 + t, 0.2 * Math.cos(k), healthy.length ? 1 : 0.001); }
  hideEnv(rowEnv, envCount); rowEnv.instanceMatrix.needsUpdate = true; }

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  hookRow.forEach((S) => (S.g.visible = id === 'S1')); hookArcs.forEach((m) => (m.visible = id === 'S1')); laptop.visible = id === 'S2'; cut.visible = id === 'S3';
  rowS.forEach((S) => (S.g.visible = false)); srcHopper.visible = ['S4', 'S5', 'S8', 'S9'].includes(id); worldMap.visible = id === 'S6' || id === 'S7'; pools.visible = id === 'S9'; sign.visible = id === 'S10';
  [hookEnv, pileEnv, qEnv, rowEnv, arcEnv, poolEnv].forEach((m) => hideEnv(m)); FLAKES.forEach((m) => (m.visible = false));
  if (id === 'S1') { // the crash moves along the row through the red rerouting net
    const front = 2.2 + (t / 1.8) * 2.2; hookRow.forEach((S, i) => { const f = clamp(front - i); setServer(S, f > 0.5 ? 1.15 : 0.7 + 0.35 * clamp(front - i + 1), f); });
    hookArcs.forEach((m, i) => { const on = clamp(front - i - 0.3); m.material.opacity = 0.2 + 0.75 * on; });
    for (let k = 0; k < 40; k++) { const i = k % (HOOKN - 1); const cv = hookArcs[i].userData.cv; const u = (t * 0.8 + k * 0.137) % 1; const p = cv.getPoint(u); setEnv(hookEnv, k, p, 0.4, t * 2 + k, 0.3, clamp(front - i) > 0.2 ? 1 : 0.001); }
    hookEnv.instanceMatrix.needsUpdate = true; }
  if (id === 'S2') { drawScreen(t); const n = Math.floor(60 * prog(t, 2.2, 5.3, (x) => x));
    for (let k = 0; k < 60; k++) { const col = k % 6, row = Math.floor(k / 6); setEnv(pileEnv, k, V3(0.62 + (col % 3) * 0.085 + (row % 2) * 0.03, DESK + 0.01 + row * 0.012 + (col > 2 ? 0.006 : 0), 0.38 + Math.floor(col / 3) * 0.06), -Math.PI / 2, 0.2 * Math.sin(k), 0, k < n ? 1 : 0.001); }
    pileEnv.instanceMatrix.needsUpdate = true; }
  if (id === 'S3') { // requests pass a one-at-a-time lock; when too many pile up, it jams and the server freezes
    cut.updateMatrixWorld(true);
    const jam = prog(t, E.jam - 0.3, E.jam + 0.25); const fr = prog(t, E.jam + 0.1, E.jam + 0.9);
    lockArms.forEach((a, k) => (a.rotation.y = k * Math.PI / 3 + (1 - jam) * t * 3.2 + jam * (E.jam * 3.2)));
    const q = 6 + Math.floor(30 * prog(t, sh('S3').in, E.jam + 0.4, (x) => x));
    for (let k = 0; k < 40; k++) { const inQ = k < q; const lane = k % 3; const pos = V3(-0.42 + (Math.floor(k / 3) % 5) * 0.08 + (lane === 1 ? 0.02 : 0), 0.04 + Math.floor(k / 15) * 0.05 + lane * 0.003, -0.15 + lane * 0.13);
      const flow = (1 - jam) * ((t * 0.9 + k * 0.11) % 1); if (k < 6 && jam < 0.9) pos.x += flow * 0.75; setEnv(qEnv, k, cut.localToWorld(pos), -Math.PI / 2 + 0.15 * Math.sin(k), 0.3 * Math.cos(k), 0, inQ ? 1 : 0.001); }
    qEnv.instanceMatrix.needsUpdate = true;
    cutLed.material.color.set(fr > 0.5 ? RED : jam > 0.3 ? AMBER : GREEN); cutLed.material.emissive.copy(cutLed.material.color); cutFrost.material.opacity = 0.22 * fr;
    FLAKES.forEach((m, i) => { if (fr < 0.05) return; m.visible = true; const k = (t - E.jam) * 0.3 + i * 0.13; m.position.set(-0.45 + (i * 0.37) % 0.95, DESK + 1.25 - ((k * 0.9) % 1.1), 0.36 + (i % 3) * 0.05); m.rotation.z = t + i; m.material.opacity = fr; }); }
  if (id === 'S4') { const fT = Array(10).fill(Infinity); fT[3] = E.fail1; drawRow(t, 10, rowState(t, 10, fT), 90, 1); }
  if (id === 'S5') { const fT = Array(10).fill(Infinity); fT[3] = -1; [2, 4, 1, 5, 0, 6, 7, 8, 9].forEach((k, j) => (fT[k] = E.casc + j * 0.27)); drawRow(t, 10, rowState(t, 10, fT), 90, 1, 150); }
  if (id === 'S8') { const fT = Array(13).fill(Infinity); fT[5] = E.spareFail; drawRow(t, 13, rowState(t, 13, fT), 90, 1, 150); }
  if (id === 'S6' || id === 'S7') { const naF = (s) => clamp((t - (E.naWave + s.rank * 3.0)) / 0.3) * (s.rank < 0.84 ? 1 : 0);
    NA.forEach((s) => setSite(s, naF(s))); OTHER.forEach((s) => setSite(s, id === 'S7' ? clamp((t - (E.world + s.rank * 1.4)) / 0.3) : 0));
    const arcOn = id === 'S7' ? prog(t, E.arcs, E.arcs + 0.5) : 0; worldArcs.forEach((m) => { m.visible = arcOn > 0.01; m.material.opacity = 0.9 * arcOn; });
    if (id === 'S7') { worldMap.updateMatrixWorld(true); for (let k = 0; k < 70; k++) { const a = worldArcs[k % worldArcs.length]; const u = (t * 0.6 + k * 0.071) % 1; setEnv(arcEnv, k, worldMap.localToWorld(a.userData.cv.getPoint(u)), 0.3, t + k, 0.2, arcOn > 0.3 ? 0.8 : 0.001); } arcEnv.instanceMatrix.needsUpdate = true; } }
  if (id === 'S9') { const wu = prog(t, E.walls, E.walls + 0.6, outBack); walls.forEach((w) => { w.scale.y = Math.max(0.01, wu); w.position.y = DESK + 0.425 * Math.max(0.01, wu); });
    const fz = (i) => (i < 4 ? clamp((t - (E.poolFail + i * 0.22)) / 0.3) : 0); const total = 66;
    poolS.forEach((S, i) => { const p = Math.floor(i / 4); const fr = fz(i); const healthyInPool = [0, 1, 2, 3].filter((k) => fz(p * 4 + k) < 0.5).length; setServer(S, fr > 0.5 ? 1.15 : p === 0 ? Math.min(1.15, 0.55 * 4 / Math.max(1, healthyInPool)) : 0.55, fr); });
    const src = V3(-0.05, DESK + 0.88, -1.15);
    for (let k = 0; k < 90; k++) { const p = k % 3; const dest = poolS[p * 4 + (Math.floor(k / 3) % 4)]; const blocked = p === 0 && fz(p * 4) > 0.5; const end = V3(dest.g.position.x, DESK + SHT + 0.06, dest.g.position.z); const mid = src.clone().lerp(end, 0.5); mid.y += 0.4;
      const u = (t * 0.55 + k / 90) % 1; const pp = src.clone().multiplyScalar((1 - u) * (1 - u)).add(mid.clone().multiplyScalar(2 * u * (1 - u))).add(end.clone().multiplyScalar(u * u)); setEnv(poolEnv, k, pp, 0.3 * Math.sin(k), k + t, 0, blocked ? 0.001 : 1); }
    poolEnv.instanceMatrix.needsUpdate = true; }
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = id === 'S1' ? 0.0018 : 0.0006; bokeh.uniforms.maxblur.value = id === 'S1' ? 0.009 : 0.005;
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
  if (id === 'S1') small('illustration · Microsoft 365 outage, 12 Nov 2026', 1);
  if (id === 'S2') { big('≈ 24 hours of disruption', 1370, prog(t, E.labDown, E.labDown + 0.25), C.red, { size: 66 }); small("Microsoft's incident report · 20 Nov 2026", prog(t, 2.05, 2.35)); }
  if (id === 'S3') { big('too busy → frozen', 1370, prog(t, E.labBusy, E.labBusy + 0.25), C.teal, { size: 76 }); small('latent Windows defect: lock contention', prog(t, 5.8, 6.1)); }
  if (id === 'S4') { big(`same traffic ÷ ${READ.healthy} servers = ${READ.each.toFixed(1)} each`, 1370, prog(t, E.labShift, E.labShift + 0.25), C.gold, { size: 58 }); small('Nov 12: ~14% of capacity offline for routine updates', prog(t, 8.6, 8.9)); }
  if (id === 'S5') { big(READ.healthy > 0 ? `${READ.healthy} left · ${Math.min(99, READ.each).toFixed(1)} each (limit 10)` : 'all frozen', 1370, prog(t, E.labLoad, E.labLoad + 0.25), C.red, { size: 58 }); small('illustrative: 90 units of traffic, 10 servers', prog(t, 11.5, 11.8)); }
  if (id === 'S6') { big('over 80% unresponsive', 1370, prog(t, E.lab80, E.lab80 + 0.25), C.red, { size: 70 }); small('North America, in under two hours', prog(t, 14.6, 14.9)); }
  if (id === 'S7') { big('every region hit', 1370, prog(t, E.labWorld, E.labWorld + 0.25), C.gold, { size: 76 }); small('stylised map · sites are illustrative', prog(t, 18.8, 19.1)); }
  if (id === 'S8') { big('spare room absorbs it', 1370, prog(t, E.labSpare, E.labSpare + 0.25), C.green, { size: 70 }); }
  if (id === 'S9') { big('walled-off pools', 1370, prog(t, E.labPools, E.labPools + 0.25), C.violet, { size: 76 }); small("Microsoft's planned fix · report 20 Nov 2026", prog(t, E.walls, E.walls + 0.3)); }
  captions(t);
}

scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.renderThumb = async () => { await window.render(0); return TEXTLOG; };   // thumbnail = frame 0
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
