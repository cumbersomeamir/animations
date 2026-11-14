// Media Diet · 30 s English episode 14 — "How can disorder beat a perfect pattern?" MIT/Northeastern scale-rich metamaterials (Nature, 11 Nov 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted english-12/13 builds: a paper miniature
// in Media Diet brand colours — laminated cards with visible edges, paper grain, real cast shadows, one camera set-up per beat,
// restrained depth of field. Approved feedback rules (context/26): one visual idea and one large brief label at a time, captions inside
// x 100–900 / y 230–1500. Samples = schematic paper reconstructions (not the paper's geometry). Deterministic: window.render(f).
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
  const c = CUES.find((q) => t >= q.in && t < q.out); if (!c) return; const a = clamp((t - c.in) / 0.1);
  const gr = og.createLinearGradient(0, 300, 0, 560); gr.addColorStop(0, 'rgba(4,6,30,0)'); gr.addColorStop(0.3, 'rgba(4,6,30,0.5)'); gr.addColorStop(0.75, 'rgba(4,6,30,0.5)'); gr.addColorStop(1, 'rgba(4,6,30,0)');
  og.save(); og.globalAlpha = a; og.fillStyle = gr; og.fillRect(0, 300, W, 260); og.font = CAPF; const mw = Math.max(...c.lines.map((l) => og.measureText(l).width)); og.restore();
  const font = mw > 760 ? `700 ${Math.floor(50 * 760 / mw)}px "Space Grotesk"` : CAPF;   // keep every caption inside x 100–900
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
let sd = 1411; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
const sh = (id) => TL.shots.find((s) => s.id === id);
const dummy = new THREE.Object3D();
// soft front fill (no shadows) so paper beams read from the camera side
const fill = new THREE.DirectionalLight('#fff1e0', 0.9); fill.position.set(4, 6, 9); scene.add(fill);

// ------------------------------------------------------------------ the test bench: paper plinths on the desk
const benchSet = new THREE.Group(); scene.add(benchSet);
const BY = DESK + 0.08;                       // top of a plinth = bottom of a sample
const TOP0 = BY + 1.04;                       // top of the platen on an undeformed sample
const tagTex = (txt, bg) => canvasTex(512, 128, (g, w, h) => { g.fillStyle = bg; rr(g, 0, 0, w, h, 36); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 70px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 3); });
function plinth(tagTxt, bg) { const g = new THREE.Group(); const p = card(1.2, 0.08, 0.5, P.deep, P.lav); p.position.y = DESK + 0.04; g.add(p);
  if (tagTxt) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.155, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tagTex(tagTxt, bg), roughness: 0.9 }), paper(P.white)]); t.position.set(0, DESK + 0.04, 0.257); g.add(t); }
  benchSet.add(g); return g; }

// ------------------------------------------------------------------ the two samples (sample-local: x −0.5…0.5, y 0…1 above the plinth, depth 0.12)
const DEPTH = 0.12;
function polyline(a, b, step = 0.05) { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); return Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]); }
// perfect lattice: 5 × 5 square cells
const LAT = [];
for (let k = 0; k <= 5; k++) LAT.push({ pts: polyline([-0.5 + k * 0.2, 0], [-0.5 + k * 0.2, 1]), t: 0.03, vert: true, col: k });
for (let j = 0; j <= 5; j++) LAT.push({ pts: polyline([-0.5, j * 0.2], [0.5, j * 0.2]), t: 0.03, vert: false, row: j });
// scale-rich network (after the published recipe: random point + random angle, a line that runs until it meets the border or an
// earlier line, then the next one, progressively thinner) — a schematic reconstruction, not the paper's geometry
const NET = [{ a: [-0.5, 0], b: [0.5, 0], t: 0.035 }, { a: [0.5, 0], b: [0.5, 1], t: 0.035 }, { a: [0.5, 1], b: [-0.5, 1], t: 0.035 }, { a: [-0.5, 1], b: [-0.5, 0], t: 0.035 }];
function rayHit(p, d) { let best = Infinity; for (const s of NET) { const ex = s.b[0] - s.a[0], ey = s.b[1] - s.a[1]; const den = d[0] * ey - d[1] * ex; if (Math.abs(den) < 1e-9) continue;
    const wx = s.a[0] - p[0], wy = s.a[1] - p[1]; const tt = (wx * ey - wy * ex) / den, uu = (wx * d[1] - wy * d[0]) / den; if (tt > 1e-6 && uu >= -1e-9 && uu <= 1 + 1e-9 && tt < best) best = tt; } return best; }
function nearLine(p) { let m = 9; for (const s of NET) { const ex = s.b[0] - s.a[0], ey = s.b[1] - s.a[1]; const L2 = ex * ex + ey * ey; const u = clamp(((p[0] - s.a[0]) * ex + (p[1] - s.a[1]) * ey) / L2); m = Math.min(m, Math.hypot(p[0] - s.a[0] - u * ex, p[1] - s.a[1] - u * ey)); } return m; }
{ let th = 0.045; let tries = 0; while (NET.length < 4 + 40 && tries < 4000) { tries++; const p = [-0.47 + rnd() * 0.94, 0.03 + rnd() * 0.94]; if (nearLine(p) < 0.035) continue; const ang = rnd() * Math.PI, d = [Math.cos(ang), Math.sin(ang)];
    const f = rayHit(p, d), b = rayHit(p, [-d[0], -d[1]]); const A = [p[0] - d[0] * b, p[1] - d[1] * b], Bp = [p[0] + d[0] * f, p[1] + d[1] * f]; if (Math.hypot(Bp[0] - A[0], Bp[1] - A[1]) < 0.09) continue;
    NET.push({ a: A, b: Bp, t: th, seed: p }); th = Math.max(0.009, th * 0.94); } }
const NETL = NET.map((s, i) => ({ pts: polyline(s.a, s.b, 0.045), t: s.t, idx: i, seed: s.seed || [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2], len: Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]), border: i < 4,
  mid: [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2], w: 0.4 + 0.6 * rnd() }));
const beamMat = new THREE.MeshStandardMaterial({ color: '#ffffff', map: grain, bumpMap: grain, bumpScale: 1.5, roughness: 0.85, emissive: '#ff6a2b', emissiveIntensity: 0.0 });
function mkSample(lines) { const nSeg = lines.reduce((a, l) => a + l.pts.length - 1, 0); const m = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), beamMat.clone(), nSeg);
  m.castShadow = true; m.receiveShadow = true; m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(nSeg * 3), 3); const g = new THREE.Group(); g.add(m);
  const top = card(1.1, 0.04, DEPTH + 0.06, '#cfc9ee', P.white); g.add(top); scene.add(g); return { g, m, lines, top }; }
const lattice = mkSample(LAT), network = mkSample(NETL);
const BASE = new THREE.Color('#ece8ff'), HOT = new THREE.Color('#ff4d6d'), WARM = new THREE.Color('#ffb03a'), DIM = new THREE.Color('#bdb6e6');
// write a sample: def(x, y, line, u) → [x', y'] ; col(line, u) → THREE.Color ; vis(line, u0, u1) → 0..1 scale
function writeSample(S, def, col, vis) { let q = 0; let topY = 0, topN = 0;
  for (const L of S.lines) { const P2 = L.pts.map((p, i) => def(p[0], p[1], L, i / (L.pts.length - 1)));
    for (let i = 0; i < P2.length - 1; i++) { const a = P2[i], b = P2[i + 1]; const v = vis ? vis(L, i / (P2.length - 1), (i + 1) / (P2.length - 1)) : 1; const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      dummy.position.set((a[0] + b[0]) / 2, BY + (a[1] + b[1]) / 2, 0); dummy.rotation.set(0, 0, Math.atan2(b[1] - a[1], b[0] - a[0])); dummy.scale.set(v > 0.01 ? len + L.t * 0.9 : 0.0001, v > 0.01 ? L.t * Math.min(1, v) : 0.0001, DEPTH);
      dummy.updateMatrix(); S.m.setMatrixAt(q, dummy.matrix); S.m.setColorAt(q, col(L, (i + 0.5) / (P2.length - 1))); q++; }
    for (const p of P2) if (p[1] > 0.97) { topY += p[1]; topN++; } }
  S.m.instanceMatrix.needsUpdate = true; S.m.instanceColor.needsUpdate = true; S.top.position.set(0, BY + (topN ? topY / topN : 1) + 0.02, 0); }
// the lattice's collapse band: rows 2–3 (y 0.4–0.6); c(x) per column spreads from the cell that buckles first
const BAND = [0.4, 0.6];
function latticeDef(cAt, cm) { return (x, y, L) => { const c = cAt(x); const h = BAND[1] - BAND[0]; let yy = y, xx = x;
  if (y > BAND[0] && y < BAND[1]) { yy = BAND[0] + (y - BAND[0]) * (1 - 0.62 * cm); if (L.vert) xx = x + 0.08 * c * Math.sin(Math.PI * (y - BAND[0]) / h); }
  else if (y >= BAND[1]) yy = y - 0.62 * h * cm; return [xx, yy]; }; }
function netDef(s) { return (x, y, L, u) => { const k = (L.border ? 0.2 : 1) * clamp(L.len / (L.t * 22), 0, 1.6); const bow = 0.022 * s * k * Math.sin(Math.PI * u) * (L.idx % 2 ? 1 : -1);
  const dx = L.pts[L.pts.length - 1][1] - L.pts[0][1], dy = -(L.pts[L.pts.length - 1][0] - L.pts[0][0]); const n = Math.hypot(dx, dy) || 1; return [x + bow * dx / n, y * (1 - 0.07 * s) + bow * dy / n]; }; }

// ------------------------------------------------------------------ Euler columns (constraint beat)
const eulerSet = new THREE.Group(); scene.add(eulerSet);
function column(h, t, x) { const segs = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), paper('#ece8ff')); m.castShadow = true; m.receiveShadow = true; eulerSet.add(m); return m; });
  const wt = card(0.34, 0.2, 0.3, P.navy2, P.lav); wt.castShadow = true; eulerSet.add(wt); return { h, t, x, segs, wt }; }
const colLong = column(1.0, 0.032, -0.42), colShort = column(0.45, 0.11, 0.45);
for (const x of [-0.42, 0.45]) { const p = card(0.5, 0.06, 0.4, P.deep, P.lav); p.position.set(x, DESK + 0.03, 0); eulerSet.add(p); }
function setColumn(C, amp, drop, appear) { const n = C.segs.length; const y0 = DESK + 0.06; const pts = Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [C.x + amp * Math.sin(Math.PI * u), y0 + u * C.h * appear * (1 - drop)]; });
  C.segs.forEach((m, i) => { const a = pts[i], b = pts[i + 1]; const len = Math.hypot(b[0] - a[0], b[1] - a[1]); m.visible = appear > 0.01; m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0); m.rotation.set(0, 0, Math.atan2(b[1] - a[1], b[0] - a[0])); m.scale.set(len + C.t * 0.5, C.t, C.t); });
  const top = pts[n]; C.wt.position.set(top[0] + amp * 0.0, top[1] + 0.1, 0); C.wt.rotation.z = -amp * 1.4; return pts; }

// ------------------------------------------------------------------ falling weights / press heads
const weights = [0, 1].map(() => { const w = new THREE.Group(); const b = card(0.62, 0.26, 0.34, P.navy2, P.lav); w.add(b); const s = card(0.5, 0.03, 0.3, P.magenta, P.magenta); s.position.y = 0.145; w.add(s); scene.add(w); return w; });
const plA = plinth('ORDER', '#3d46b5'), plB = plinth('DISORDER', '#b0203a'), plC = plinth(null), plD = plinth(null);

// ------------------------------------------------------------------ CTA sign (Media Diet identity only)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, 1024, 300); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.0, DESK, 0.9);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const U = (id, t) => prog(t, sh(id).in, sh(id).out, (x) => x);
const SHOTS = {
  S1: (t) => { const u = U('S1', t); return SH(L3([0.9, 1.0, 3.9], [0.7, 0.95, 3.5], u), V3(0.0, 0.75, 0), 42); },
  S2: (t) => { const u = U('S2', t); return SH(L3([0.3, 1.15, 6.2], [0.25, 1.1, 5.95], u), V3(0.0, 0.72, 0), 42); },
  S3: (t) => { const u = U('S3', t); return SH(L3([-0.75, 0.95, 3.7], [-0.55, 0.9, 3.4], u), V3(0.0, 0.7, 0), 42); },
  S4: (t) => { const u = U('S4', t); return SH(L3([0.35, 0.95, 4.1], [0.3, 0.9, 3.85], u), V3(0.02, 0.62, 0), 42); },
  S5: (t) => { const u = U('S5', t); return SH(L3([0.0, 0.85, 3.3], [0.0, 0.82, 3.05], u), V3(0.0, 0.72, 0), 42); },
  S6: (t) => { const u = U('S6', t); return SH(L3([-0.3, 1.2, 6.7], [-0.25, 1.15, 6.45], u), V3(0.0, 0.8, 0), 42); },
  S7: (t) => { const u = U('S7', t); return SH(L3([0.8, 0.95, 3.6], [0.6, 0.9, 3.35], u), V3(0.0, 0.72, 0), 42); },
  S8: (t) => { const u = U('S8', t); return SH(L3([0.25, 1.65, 7.6], [0.2, 1.85, 8.0], u), L3([0, 0.5, 0.5], [0, 0.55, 0.45], u), 42); },
};

// ------------------------------------------------------------------ per-frame update
const cMean = (cAt) => { let s_ = 0; for (let k = 0; k <= 5; k++) s_ += cAt(-0.5 + k * 0.2); return s_ / 6; };
function dropW(w, x, t, t0, t1, topY, rest = 0) { const u = clamp((t - t0) / (t1 - t0)); const y = t < t1 ? lerp(topY + 1.6, topY, u * u) : topY - rest; w.visible = t >= t0 - 0.01; w.position.set(x, y + 0.13, 0); }
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;
  const two = id === 'S2' || id === 'S6'; const showLat = two || id === 'S3', showNet = two || ['S1', 'S5', 'S7'].includes(id);
  lattice.g.visible = showLat; network.g.visible = showNet; eulerSet.visible = id === 'S4'; sign.visible = id === 'S8';
  plA.visible = showLat && two; plD.visible = showLat && !two; plB.visible = showNet && two; plC.visible = showNet && !two; weights.forEach((w) => (w.visible = false));
  const xl = two ? -0.62 : 0, xn = two ? 0.62 : 0; lattice.g.position.x = xl; network.g.position.x = xn; plA.position.x = xl; plB.position.x = xn; plC.position.x = xn; plD.position.x = xl;
  // ---- network sample
  if (showNet) { let s = 0, col = () => BASE, vis = null;
    if (id === 'S1') { s = t < E.hit1 ? 0 : 1.0 * Math.exp(-(t - E.hit1) * 2.2) * Math.cos((t - E.hit1) * 9) * 0.6 + 0.5 * (1 - Math.exp(-(t - E.hit1) * 6));
      const g = t < E.hit1 ? 0 : Math.exp(-(t - E.hit1) * 1.4); col = (L) => BASE.clone().lerp(WARM, g * L.w * 0.8); dropW(weights[0], xn, t, E.drop1, E.hit1, TOP0, 0.07 * clamp(s)); }
    if (id === 'S2') col = () => BASE.clone().lerp(new THREE.Color('#ffd6a8'), 0.6 * prog(t, E.net2, E.net2 + 0.3) * (1 - prog(t, E.ord2, E.ord2 + 0.3)));
    if (id === 'S5') { const T0 = E.draw, dt = 2.4 / NETL.length; vis = (L, u0, u1) => { if (L.border) return prog(t, T0 - 0.15, T0); const g = prog(t, T0 + (L.idx - 4) * dt, T0 + (L.idx - 4) * dt + 0.22);
        const su = clamp(((L.seed[0] - L.pts[0][0]) * (L.pts[L.pts.length - 1][0] - L.pts[0][0]) + (L.seed[1] - L.pts[0][1]) * (L.pts[L.pts.length - 1][1] - L.pts[0][1])) / (L.len * L.len)); const reach = g * Math.max(su, 1 - su);
        return Math.abs((u0 + u1) / 2 - su) <= reach + 1e-6 ? 1 : 0; }; col = (L) => (L.border ? BASE : BASE.clone().lerp(new THREE.Color('#2addfa'), 0.55 * (1 - prog(t, E.draw + (L.idx - 4) * 2.4 / NETL.length + 0.25, E.draw + (L.idx - 4) * 2.4 / NETL.length + 0.8)))); }
    if (id === 'S6') { s = t < E.hit6 ? 0 : 0.55 + 0.35 * Math.exp(-(t - E.hit6) * 3) * Math.cos((t - E.hit6) * 10); col = (L) => BASE.clone().lerp(WARM, (t > E.hit6 ? 0.55 : 0) * L.w); dropW(weights[1], xn, t, E.drop6, E.hit6, TOP0, 0.07 * s); }
    if (id === 'S7') { s = 0.55; const R = 1.3 * prog(t, E.share - 0.1, E.share + 1.6, (x) => x); const hit = [0, 1.0];
      col = (L) => { const d = Math.hypot(L.mid[0] - hit[0], L.mid[1] - hit[1]); const on = clamp((R - d) * 6); return BASE.clone().lerp(WARM, on * (0.2 + 0.8 * L.w * L.w)).lerp(HOT, on * clamp(0.5 - d) * 0.8); }; }
    writeSample(network, netDef(s), col, vis); network.m.material.emissiveIntensity = 0; }
  // ---- lattice sample
  if (showLat) { let cAt = () => 0; let hot = 0;
    if (id === 'S2') { const k = 0.6 * prog(t, E.ord2, E.ord2 + 0.3); writeSample(lattice, (x, y) => [x, y], () => BASE.clone().lerp(new THREE.Color('#a8c8ff'), k)); }
    else { if (id === 'S3') { const first = -0.2; cAt = (x) => { const d = Math.abs(x - first); return t < E.buckle ? 0 : clamp(prog(t, E.buckle, E.buckle + 0.45) * (d < 0.15 ? 1 : 0) + prog(t, E.spread + (d - 0.15) * 1.6, E.spread + (d - 0.15) * 1.6 + 0.45) * (d >= 0.15 ? 1 : 0)); }; dropW(weights[0], xl, t, E.press, E.press + 1.4, TOP0, 0); weights[0].visible = true;
        const top = TOP0 - 0.62 * 0.2 * cMean(cAt); weights[0].position.y = Math.min(weights[0].position.y, top + 0.13); }
      if (id === 'S6') { cAt = () => (t < E.hit6 ? 0 : prog(t, E.hit6, E.hit6 + 0.35)); dropW(weights[0], xl, t, E.drop6, E.hit6, TOP0, 0.62 * 0.2 * cAt(0)); }
      writeSample(lattice, latticeDef(cAt, cMean(cAt)), (L, u) => { const y = L.vert ? u : L.row * 0.2; const inBand = y > BAND[0] - 0.01 && y < BAND[1] + 0.01; const x = L.vert ? -0.5 + L.col * 0.2 : -0.5 + u; return BASE.clone().lerp(HOT, inBand ? cAt(x) : 0); }); } }
  // ---- Euler columns
  if (id === 'S4') { const ap = prog(t, E.cols - 0.1, E.cols + 0.4, outBack); const b = prog(t, E.buckle4 - 0.15, E.buckle4 + 0.45);
    setColumn(colLong, 0.11 * b, 0.05 * b, ap); setColumn(colShort, 0, 0, ap); [colLong, colShort].forEach((C) => { C.wt.visible = t > E.wt4 - 0.3; C.wt.position.y += (1 - prog(t, E.wt4 - 0.3, E.wt4, (x) => x * x)) * 0.8; });
    colLong.segs.forEach((m) => m.material.color.set(b > 0.1 ? '#ffb3c1' : '#ece8ff')); }
  const sgu = prog(t, E.sign, E.sign + 0.45, outBack); sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(sgu, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}
// Euler column colours are per-column (long one blushes when it buckles)
colLong.segs.forEach((m) => (m.material = new THREE.MeshStandardMaterial({ color: '#ece8ff', map: grain, bumpMap: grain, bumpScale: 2, roughness: 0.9 })));

// ------------------------------------------------------------------ 2-D overlay: one large, brief label at a time (never in the caption band)
function chip(text, x, y, bg, o = {}) { og.save(); og.font = o.font || '700 30px "Space Grotesk"'; const w = og.measureText(text).width + 40, h = o.h || 52; const x0 = o.align === 'left' ? x : x - w / 2; og.globalAlpha = o.alpha ?? 1; og.fillStyle = bg; rr(og, x0, y - h / 2, w, h, h / 2); og.fill(); og.restore();
  otext(text, x0 + w / 2, y + (o.dy ?? 11), { font: o.font || '700 30px "Space Grotesk"', alpha: o.alpha ?? 1, shadow: 0, kind: o.kind || 'label', color: o.color }); }
function big(text, y, a, bg, o = {}) { if (a <= 0.01) return; let fs = o.size || 78; og.save(); og.font = `700 ${fs}px "Space Grotesk"`; const w = og.measureText(text).width; og.restore();
  if (w > 720) fs = Math.floor(fs * 720 / w); const yy = y + (1 - outC(clamp(a))) * 18;   // keep every label inside x 100–900
  chip(text, o.x ?? 540, yy, bg, { font: `700 ${fs}px "Space Grotesk"`, h: Math.round(fs * 1.42), alpha: clamp(a), dy: Math.round(fs * 0.36), color: o.color }); }
const C = { teal: 'rgba(18,122,143,0.94)', red: 'rgba(196,40,74,0.94)', gold: 'rgba(176,112,0,0.95)', green: 'rgba(26,127,75,0.95)', violet: 'rgba(85,45,188,0.94)' };
function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = []; const id = shot.id;
  const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  if (id === 'S1') { chip('MIT + Northeastern · Nature · 11 Nov 2026', 540, 1372, 'rgba(254,64,146,0.92)', { font: '700 28px "Space Grotesk"', alpha: prog(t, 0.4, 0.7) });
    chip('editorial reconstruction', 540, 1446, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, 0.2, 0.5), dy: 9 }); }
  if (id === 'S3') big('one buckles, all follow', 1390, prog(t, E.lab3, E.lab3 + 0.25), C.red, { size: 66 });
  if (id === 'S4') big('long + thin buckles first', 1390, prog(t, E.lab4, E.lab4 + 0.25), C.red, { size: 64 });
  if (id === 'S5') big('MANY SIZES', 1390, prog(t, E.lab5, E.lab5 + 0.25), C.teal, { size: 88 });
  if (id === 'S6') big('network held up better', 1390, prog(t, E.lab6, E.lab6 + 0.25), C.green, { size: 64 });
  if (id === 'S7') big('damage shared', 1390, prog(t, E.lab7, E.lab7 + 0.25), C.gold, { size: 80 });
  captions(t);
}

// printed cards that glow get their own print as the emissive map (a flat white glow washes them out)
scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
// separate vertical thumbnail tied to the hook: the network sample under its weight + 2 large words ("MESSIER" / "= TOUGHER?")
window.renderThumb = async () => { const t = 2.4; update(t);
  camera.position.set(0.75, 0.62, 2.9); camera.up.set(0, 1, 0); camera.fov = 42; camera.updateProjectionMatrix(); camera.lookAt(V3(0.0, 0.95, 0)); bokeh.uniforms.focus.value = camera.position.distanceTo(V3(0, 0.6, 0)); composer.render();
  og.clearRect(0, 0, W, H); TEXTLOG = []; const v = og.createLinearGradient(0, 0, 0, H); v.addColorStop(0, 'rgba(4,5,26,0.55)'); v.addColorStop(0.42, 'rgba(4,5,26,0.08)'); v.addColorStop(1, 'rgba(4,5,26,0.35)'); og.fillStyle = v; og.fillRect(0, 0, W, H);
  const fit = (txt, size) => { og.font = `700 ${size}px "Space Grotesk"`; const w = og.measureText(txt).width; return w > 700 ? Math.floor(size * 700 / w) : size; };
  const f1 = fit('MESSIER', 190), f2 = fit('= TOUGHER?', 150);
  otext('MESSIER', 540, 400, { font: `700 ${f1}px "Space Grotesk"`, color: '#ffd23f', shadow: 30, kind: 'thumb' });
  otext('= TOUGHER?', 540, 400 + f2 * 1.12, { font: `700 ${f2}px "Space Grotesk"`, color: '#f6f4ff', shadow: 30, kind: 'thumb' });
  chip('editorial reconstruction', 540, 1446, 'rgba(13,18,64,0.7)', { font: '700 26px "Space Grotesk"', h: 46, dy: 9 }); return TEXTLOG; };
window.render = async (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
