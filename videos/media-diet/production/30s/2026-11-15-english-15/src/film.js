// Media Diet · 30 s English episode 15 — "How do you catch this?" SpaceX Starship Flight 15: first upper-stage tower catch (14 Nov 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted english-12…14 builds: a paper miniature
// in Media Diet brand colours with real cast shadows, one camera set-up per beat, restrained depth of field. Approved feedback rules
// (context/26) + first-frame rule (15 Nov): frame 0 shows the caught ship with the 5-word hook question; captions inside x 100–900.
// Ship, tower and arms are a generic reconstruction, not a replica. Deterministic: window.render(f).
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
let sd = 1511; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
const frac = (x) => x - Math.floor(x);
const sh = (id) => TL.shots.find((s) => s.id === id);
const fill = new THREE.DirectionalLight('#ffe6cc', 1.0); fill.position.set(5, 5, 9); scene.add(fill);   // soft front fill, no shadows
const sunset = new THREE.DirectionalLight('#ff9a5a', 0.0); sunset.position.set(8, 2.5, -3); scene.add(sunset);
// stylised dusk environment for the steel hull
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = (() => { const es = new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a3f9e'); gr.addColorStop(0.42, '#c9a4ff'); gr.addColorStop(0.5, '#ffd9a8'); gr.addColorStop(0.55, '#7a6a9a'); gr.addColorStop(1, '#2a2040'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) })));
  return pmrem.fromScene(es, 0.02).texture; })();

// ------------------------------------------------------------------ the ship (generic paper-and-steel reconstruction of a Starship upper stage; not a replica)
const SR = 0.17, SHH = 1.9;                    // radius, barrel height
const steel = new THREE.MeshStandardMaterial({ color: '#d9dbe6', metalness: 0.75, roughness: 0.32, envMap: envTex, envMapIntensity: 1.0, map: grain, bumpMap: grain, bumpScale: 0.6 });
const hexTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#3a3c4a'; g.fillRect(0, 0, w, h); const r = 26, dx = r * Math.sqrt(3), dy = r * 1.5;
  for (let row = -1; row < h / dy + 1; row++) for (let col = -1; col < w / dx + 1; col++) { const cx = col * dx + (row % 2 ? dx / 2 : 0), cy = row * dy; g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; g.lineTo(cx + Math.cos(a) * (r - 2.5), cy + Math.sin(a) * (r - 2.5)); } g.closePath(); g.fillStyle = `rgb(${18 + (row * 7 + col * 13) % 10},${19 + (row * 5 + col * 3) % 9},${26 + (row + col) % 8})`; g.fill(); } });
hexTex.wrapS = hexTex.wrapT = THREE.RepeatWrapping; hexTex.repeat.set(2, 6);
const hexGlow = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#000000'; g.fillRect(0, 0, w, h); const r = 26, dx = r * Math.sqrt(3), dy = r * 1.5;
  for (let row = -1; row < h / dy + 1; row++) for (let col = -1; col < w / dx + 1; col++) { const cx = col * dx + (row % 2 ? dx / 2 : 0), cy = row * dy; g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; g.lineTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3)); } g.closePath(); g.fillStyle = '#ffffff'; g.fill(); } });
hexGlow.wrapS = hexGlow.wrapT = THREE.RepeatWrapping; hexGlow.repeat.set(2, 6);
const tileMat = new THREE.MeshStandardMaterial({ color: '#ffffff', map: hexTex, roughness: 0.75, emissive: '#ff6a2b', emissiveIntensity: 0, emissiveMap: hexGlow });
function makeShip() { const g = new THREE.Group();
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(SR, SR, SHH, 48, 1, true, 0, Math.PI), steel); barrel.position.y = SHH / 2; barrel.castShadow = true; g.add(barrel);   // leeward steel half (+x)
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(SR + 0.004, SR + 0.004, SHH, 48, 1, true, Math.PI, Math.PI), tileMat); shield.position.y = SHH / 2; shield.castShadow = true; g.add(shield);   // windward tiled half (−x, the belly)
  const pts = []; for (let i = 0; i <= 16; i++) { const u = i / 16; pts.push(new THREE.Vector2(SR * Math.sqrt(1 - u * u * 0.98), u * 0.42)); }
  const nose = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), steel); nose.position.y = SHH; nose.castShadow = true; g.add(nose);
  const ff = [-1, 1].map((s) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.34, 0.16), steel); f.position.set(-0.03, SHH + 0.02, s * (SR + 0.07)); f.castShadow = true; g.add(f); return f; });
  const af = [-1, 1].map((s) => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.46, 0.22), steel); f.position.set(-0.03, 0.3, s * (SR + 0.1)); f.castShadow = true; g.add(f); return f; });
  const pins = [-1, 1].map((s) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.08, 18), new THREE.MeshStandardMaterial({ color: '#ffd23f', metalness: 0.2, roughness: 0.45, emissive: '#ffd23f', emissiveIntensity: 0 })); p.rotation.x = Math.PI / 2; p.position.set(0, SHH - 0.16, s * (SR + 0.03)); g.add(p); return p; });
  const flames = [0, 1, 2].map((k) => { const a = k * Math.PI * 2 / 3; const fl = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.5, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#ffb36b', transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending }));
    fl.rotation.x = Math.PI; fl.position.set(Math.cos(a) * 0.07, -0.3, Math.sin(a) * 0.07); g.add(fl); const core = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.32, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#bff6ff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); core.rotation.x = Math.PI; core.position.set(Math.cos(a) * 0.07, -0.2, Math.sin(a) * 0.07); g.add(core); return [fl, core]; });
  for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.08, 18, 1, true), new THREE.MeshStandardMaterial({ color: '#2b2d3a', metalness: 0.5, roughness: 0.5, side: THREE.DoubleSide })); b.position.set(Math.cos(a) * 0.07, -0.03, Math.sin(a) * 0.07); g.add(b); }
  return { g, pins, flames, ff, af }; }
const ship = makeShip(); scene.add(ship.g);
function setFlames(a, t) { ship.flames.forEach(([f, c], k) => { const fl = 0.85 + 0.15 * Math.sin(t * 40 + k * 2); f.material.opacity = 0.75 * a * fl; c.material.opacity = 0.9 * a; f.scale.set(1, 0.6 + 0.6 * a * fl, 1); c.scale.set(1, 0.6 + 0.5 * a, 1); }); }

// ------------------------------------------------------------------ STARBASE: ground, the tower and its two catch arms (paper reconstruction)
const padSet = new THREE.Group(); scene.add(padSet);
{ const gnd = card(16, 0.03, 10, '#b9a88a', '#e3d6bd'); gnd.position.set(0, DESK + 0.015, -1); padSet.add(gnd);
  const pad = card(1.8, 0.06, 1.6, '#8c8aa0', P.lav); pad.position.set(0.9, DESK + 0.06, 0); padSet.add(pad); }
const TX = -0.42, TH = 3.6;   // tower position (x) and height
const latTex = canvasTex(128, 512, (g, w, h) => { g.fillStyle = '#2b2d4f'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6d70a8'; g.lineWidth = 7; for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 64); g.moveTo(w, y); g.lineTo(0, y + 64); g.stroke(); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.lineWidth = 10; g.strokeRect(0, -10, w, h + 20); });
latTex.wrapS = latTex.wrapT = THREE.RepeatWrapping; latTex.repeat.set(1, 3);
{ const tw = new THREE.Mesh(new THREE.BoxGeometry(0.42, TH, 0.42), new THREE.MeshStandardMaterial({ map: latTex, roughness: 0.8 })); tw.position.set(TX, DESK + TH / 2, -0.15); tw.castShadow = true; tw.receiveShadow = true; padSet.add(tw);
  const top = card(0.5, 0.06, 0.5, '#3d3f68', P.lav); top.position.set(TX, DESK + TH + 0.03, -0.15); padSet.add(top); }
const carriage = new THREE.Group(); padSet.add(carriage);
{ const c = card(0.5, 0.22, 0.5, '#3d3f68', P.lav); carriage.add(c); }
const arms = [-1, 1].map((s) => { const piv = new THREE.Group(); piv.position.set(0.22, 0, s * 0.2 - 0.15 + 0.15); carriage.add(piv);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.08), new THREE.MeshStandardMaterial({ map: latTex, roughness: 0.8, color: '#9da0d8' })); arm.position.x = 0.575; arm.castShadow = true; piv.add(arm);
  return { piv, s }; });
// closed: arms parallel (+x) either side of the hull; open: swung out by ±0.9 rad
function setArms(open, y) { carriage.position.set(TX, y, -0.15); arms.forEach((A) => { A.piv.position.set(0.22, 0, A.s * (SR + 0.075) + 0.15); A.piv.rotation.y = -A.s * 0.9 * open; }); }
const SHIPX = TX + 0.22 + 0.9;   // hull centre when held (x)

// ------------------------------------------------------------------ ORBIT: a paper Earth
const orbitSet = new THREE.Group(); scene.add(orbitSet);
const earthTex = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#2f5fb8'; g.fillRect(0, 0, w, h); let s_ = 77; const r = () => ((s_ = (s_ * 16807) % 2147483647) / 2147483647);
  g.fillStyle = '#6fae7a'; for (let i = 0; i < 26; i++) { const cx = r() * w, cy = h * (0.2 + 0.6 * r()), rx = 30 + r() * 110, ry = 20 + r() * 60; g.beginPath(); g.ellipse(cx, cy, rx, ry, r() * 3, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 70, 6 + r() * 12, r(), 0, Math.PI * 2); g.fill(); } g.fillStyle = '#eef3ff'; g.fillRect(0, 0, w, 26); g.fillRect(0, h - 26, w, 26); });
const earth = new THREE.Mesh(new THREE.SphereGeometry(0.75, 64, 48), new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.9 })); earth.position.set(0, 1.1, -0.4); earth.castShadow = true; orbitSet.add(earth);
const atmo = new THREE.Mesh(new THREE.SphereGeometry(0.79, 64, 48), new THREE.MeshBasicMaterial({ color: '#8fd3ff', transparent: true, opacity: 0.12, side: THREE.BackSide })); atmo.position.copy(earth.position); orbitSet.add(atmo);
const mini = makeShip(); mini.g.scale.setScalar(0.22); orbitSet.add(mini.g);
const trail = Array.from({ length: 26 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0 })); orbitSet.add(m); return m; });

// ------------------------------------------------------------------ FUEL ESTIMATE: one steel kilo vs ~7 propellant kilos
const fuelSet = new THREE.Group(); scene.add(fuelSet);
{ const pl = card(2.2, 0.08, 0.9, P.deep, P.lav); pl.position.set(0, DESK + 0.04, 0); fuelSet.add(pl); }
const kgCube = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), steel); kgCube.castShadow = true; fuelSet.add(kgCube);
const fuelMat = paper('#ff8a3d'); const fuelCubes = Array.from({ length: 7 }, (_, i) => { const m = card(0.26, 0.26, 0.26, '#ff8a3d', '#ffd2a8'); m.castShadow = true; fuelSet.add(m); return m; });

// ------------------------------------------------------------------ REENTRY: plasma + air flecks around a belly-first ship
const plasma = Array.from({ length: 70 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.02), new THREE.MeshBasicMaterial({ color: rnd() < 0.5 ? '#ff9a3d' : '#ffd36b', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  m.userData = { x: -1 + rnd() * 2.2, z: -0.3 + rnd() * 0.6, ph: rnd(), sp: 1.6 + rnd() }; scene.add(m); return m; });
const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,200,120,0.95)'); gr.addColorStop(0.4, 'rgba(255,120,40,0.45)'); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
glow.scale.set(3.2, 1.2, 1); scene.add(glow);

// ------------------------------------------------------------------ CTA sign (Media Diet identity only)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, 1024, 300); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.15, DESK + 0.03, 1.6);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const U = (id, t) => prog(t, sh(id).in, sh(id).out, (x) => x);
const HOLDY = 1.95;   // carriage height when holding the ship
const SHOTS = {
  S1: (t) => { const u = U('S1', t); return SH(L3([2.7, 1.7, 4.6], [2.6, 1.7, 4.45], u), V3(0.55, 1.88, 0), 42); },
  S2: (t) => { const u = U('S2', t); return SH(L3([0.5, 1.55, 6.4], [0.4, 1.5, 6.1], u), V3(0.0, 1.0, -0.4), 42); },
  S3: (t) => { const u = U('S3', t); return SH(L3([0.4, 1.35, 4.9], [0.35, 1.3, 4.65], u), V3(0.05, 0.38, 0), 42); },
  S4: (t) => { const u = U('S4', t); return SH(L3([0.35, 1.05, 4.2], [0.3, 1.0, 3.95], u), V3(0.0, 1.5, 0), 42); },
  S5: (t) => { const u = U('S5', t); return SH(L3([2.6, 1.3, 4.6], [2.45, 1.4, 4.4], u), L3([0.6, 1.9, 0], [0.6, 1.55, 0], u), 42); },
  S6: (t) => { const u = U('S6', t); return SH(L3([1.8, 2.15, 2.1], [1.65, 2.1, 1.95], u), V3(SHIPX - 0.05, 2.05, 0), 40); },
  S7: (t) => { const u = U('S7', t); return SH(L3([0.25, 1.6, 1.6], [0.2, 1.55, 1.45], u), V3(0.0, 1.45, -0.1), 40); },
  S8: (t) => { const u = U('S8', t); return SH(L3([1.0, 1.7, 7.6], [0.9, 1.85, 8.0], u), L3([0.2, 1.25, 0.6], [0.2, 1.3, 0.55], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;
  const pad = ['S1', 'S5', 'S6', 'S8'].includes(id); padSet.visible = pad; orbitSet.visible = id === 'S2'; fuelSet.visible = id === 'S3'; sign.visible = id === 'S8';
  ship.g.visible = ['S1', 'S4', 'S5', 'S6', 'S7', 'S8'].includes(id); glow.visible = id === 'S4'; plasma.forEach((p) => (p.visible = id === 'S4'));
  sunset.intensity = pad ? 1.2 : 0.3; setFlames(0, t); tileMat.emissiveIntensity = 0; ship.pins.forEach((p) => (p.material.emissiveIntensity = 0));
  ship.g.rotation.set(0, 0, 0); ship.g.scale.setScalar(1);
  // held in the arms (S1, S6 end, S8)
  const held = () => { setArms(0, HOLDY); ship.g.position.set(SHIPX, HOLDY + 0.085 - (SHH - 0.16), 0); };   // pins resting on the arms
  if (id === 'S1' || id === 'S8') held();
  if (id === 'S2') { const n = 1.6 + 2.2 * prog(t, E.orbit, E.home, (x) => x); const a = n * Math.PI * 2; const R = 1.12; const back = prog(t, E.home, 5.95);
    const r = lerp(R, 0.8, back); const pos = (aa, rr) => V3(earth.position.x + Math.cos(aa) * rr, earth.position.y + Math.sin(aa) * rr * 0.55 + 0.05, earth.position.z + Math.sin(aa) * rr * 0.83);
    mini.g.position.copy(pos(a, r)); mini.g.rotation.set(0, -a, Math.PI / 2 - 0.3); earth.rotation.y = t * 0.25;
    trail.forEach((m, i) => { const aa = a - (i + 1) * 0.09; m.position.copy(pos(aa, lerp(R, 0.8, back))); m.material.opacity = 0.65 * (1 - i / trail.length) * prog(t, E.orbit, E.orbit + 0.3); }); }
  if (id === 'S3') { kgCube.position.set(-0.6, DESK + 0.08 + 0.15, 0); kgCube.scale.setScalar(Math.max(0.01, prog(t, E.shipCube, E.shipCube + 0.35, outBack)));
    fuelCubes.forEach((c, i) => { const k = prog(t, E.fuel + i * 0.2, E.fuel + i * 0.2 + 0.3, outBack); c.visible = k > 0.01; const col = i % 4, row = Math.floor(i / 4); c.position.set(0.05 + col * 0.29, DESK + 0.08 + 0.13 + row * 0.27, 0); c.scale.setScalar(Math.max(0.01, k)); }); }
  if (id === 'S4') { // belly-first: hull horizontal, tiles (−z side) facing down; air streams up past it
    ship.g.position.set(1.15, 1.45, 0); ship.g.rotation.set(0, 0, Math.PI / 2);   // nose toward −x, belly (tiles) down
    const heat = prog(t, E.air - 0.1, E.air + 0.5); tileMat.emissiveIntensity = 1.1 * heat * (0.85 + 0.15 * Math.sin(t * 30));
    glow.position.set(0.0, 1.22, 0.05); glow.material.opacity = 0.75 * heat;
    plasma.forEach((p) => { const u = frac(t * p.userData.sp + p.userData.ph); const ex = p.userData.x * 1.15; const side = Math.abs(ex) > 1.05 ? 1 : 0; p.position.set(ex + Math.sign(ex) * u * 0.25 * side, 1.25 + u * 0.9, (p.userData.z > 0 ? 1 : -1) * (SR + 0.05 + u * 0.25)); p.material.opacity = heat * (1 - u) * 0.85; p.rotation.set(0, 0, Math.PI / 2); p.scale.set(1, 1 + u * 2, 1); }); }
  if (id === 'S5') { // flip upright, engines light, slow descent toward the waiting arms
    const fl = prog(t, E.flip - 0.05, E.flip + 0.75); const y = lerp(2.9, 2.25, prog(t, 15.8, 18.26, (x) => 1 - (1 - x) * (1 - x)));
    ship.g.position.set(SHIPX + 0.35 * (1 - fl), y - (SHH - 0.16) * fl, 0); ship.g.rotation.set(0, 0, (1 - fl) * Math.PI / 2);
    setFlames(prog(t, E.engines, E.engines + 0.2), t); setArms(1, HOLDY + 0.05); }
  if (id === 'S6') { const close = prog(t, E.arms, E.arms + 0.75); const y = lerp(HOLDY + 0.3, HOLDY + 0.085, prog(t, 18.3, E.arms + 0.8));
    setArms(1 - close, HOLDY); ship.g.position.set(SHIPX, y - (SHH - 0.16), 0); setFlames(0.35 * (1 - prog(t, E.arms + 0.4, E.arms + 0.8)), t);
    ship.pins.forEach((p) => (p.material.emissiveIntensity = 0.9 * prog(t, E.pins, E.pins + 0.3))); }
  if (id === 'S7') { held(); padSet.visible = false; ship.g.position.set(0, 0.3, 0);
    ship.g.rotation.set(0, Math.PI / 2 - 0.35, 0); tileMat.emissiveIntensity = 1.2 * prog(t, E.heat - 0.1, E.heat + 0.4) * (1 - 0.75 * prog(t, E.cool, E.cool + 1.2)) * (0.9 + 0.1 * Math.sin(t * 25)); }
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
  if (id === 'S2') { chip('SpaceX · Starship Flight 15 · 14 Nov 2026', 540, 1372, 'rgba(254,64,146,0.92)', { font: '700 28px "Space Grotesk"', alpha: prog(t, 1.5, 1.8) });
    chip('editorial reconstruction', 540, 1446, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, 1.5, 1.8), dy: 9 }); }
  if (id === 'S3') { big('~7 kg fuel per kg', 1380, prog(t, E.labFuel, E.labFuel + 0.25), C.gold, { size: 76 });
    chip('rocket-equation estimate', 540, 1470, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, E.labFuel, E.labFuel + 0.25), dy: 9 }); }
  if (id === 'S4') big('AIR BRAKES', 1390, prog(t, E.labAir, E.labAir + 0.25), C.red, { size: 88 });
  if (id === 'S5') { big('FLIP', 1390, win(t, E.labFlip, E.engines), C.teal, { size: 88 }); big('ENGINES ON', 1390, prog(t, E.engines, E.engines + 0.25), C.gold, { size: 84 }); }
  if (id === 'S6') big('2 pins · ~1 ft', 1390, prog(t, E.labPins, E.labPins + 0.25), C.violet, { size: 80 });
  if (id === 'S7') big('HEAT, NOT FUEL', 1390, prog(t, E.labHeat, E.labHeat + 0.25), C.red, { size: 84 });
  captions(t);
}

// printed cards that glow get their own print as the emissive map (a flat white glow washes them out)
scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
// thumbnail = the first frame (the caught ship + the hook question), so the opening image and the thumbnail match
window.renderThumb = async () => { await window.render(0); return TEXTLOG; };
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
