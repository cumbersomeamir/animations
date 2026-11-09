// Media Diet · 45 s English physics special — how many people would actually move Chicago's Bean seven inches? (event: Sun 8 Nov 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted feedback-round film.js (via the
// accepted news-episode builds): a paper miniature in Media Diet brand colours — laminated cards with visible edges, paper
// grain, real cast shadows, hinged props, one camera set-up per beat, restrained depth of field. English captions use the
// accepted English treatment (Space Grotesk 700, 50 px, baselines 414/478). Deterministic: window.render(frame); window.TEXTS().
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
  og.save(); og.globalAlpha = a; og.fillStyle = gr; og.fillRect(0, 300, W, 260); og.restore();
  if (c.lines.length === 1) otext(c.lines[0], 540, 448, { alpha: a, kind: 'caption', font: CAPF });
  else { otext(c.lines[0], 540, 414, { alpha: a, kind: 'caption', font: CAPF }); otext(c.lines[1], 540, 478, { alpha: a, kind: 'caption', font: CAPF }); }
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

// ------------------------------------------------------------------ environment map so the Bean reads as polished steel (stylised sky + skyline)
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = (() => { const es = new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4f6fe8'); gr.addColorStop(0.42, '#bcd0ff'); gr.addColorStop(0.5, '#f1ecff'); gr.addColorStop(0.53, '#8f89c4'); gr.addColorStop(1, '#2a2f72'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) })));
  let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, h = 5 + r() * 16, w = 2 + r() * 3.5; const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0.69, 0.3, 0.22 + r() * 0.3) })); b.position.set(Math.cos(a) * 36, h / 2 - 1.5, Math.sin(a) * 36); es.add(b); }
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(3 + r() * 3, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' })); c.position.set(Math.cos(i) * 30, 18 + r() * 8, Math.sin(i * 1.7) * 30); c.scale.y = 0.4; es.add(c); }
  return pmrem.fromScene(es, 0.02).texture; })();

// ------------------------------------------------------------------ the Bean (chrome), its plaza and its schematic supports — the REAL page
const realSet = new THREE.Group(); scene.add(realSet);
const BEAN = { L: 2.4, H: 1.2, Wd: 1.53 };
function beanGeo() { const g = new THREE.SphereGeometry(1, 128, 80); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); let y = p.getY(i); if (y < 0) y = y * (1 - 0.85 * Math.exp(-(x * x) / 0.26)); y = Math.max(y, -0.6); p.setXYZ(i, x * BEAN.L / 2, ((y + 0.6) / 1.6) * BEAN.H, z * BEAN.Wd / 2); }
  g.computeVertexNormals(); return g; }
const chrome = new THREE.MeshStandardMaterial({ color: '#f4f6ff', metalness: 1.0, roughness: 0.06, envMap: envTex, envMapIntensity: 1.15, transparent: true, opacity: 1 });
const bean = new THREE.Mesh(beanGeo(), chrome); bean.castShadow = true; bean.receiveShadow = true; realSet.add(bean); bean.position.set(0, DESK + 0.035, 0);
{ const plaza = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.03, 6.4), [paper(P.lav), paper(P.lav), new THREE.MeshStandardMaterial({ map: canvasTex(740, 640, (g, w, h) => { g.fillStyle = '#cbc6ec'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(85,45,188,0.18)'; g.lineWidth = 2; for (let x = 0; x < w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }), roughness: 0.95 }), paper(P.lav), paper(P.lav), paper(P.lav)]);
  plaza.position.set(0, DESK + 0.015, 0.6); plaza.receiveShadow = true; realSet.add(plaza);
  // generic paper skyline + trees behind the plaza (no identifiable buildings)
  let s = 21; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9; i++) { const h = 1.4 + r() * 2.2, w = 0.6 + r() * 0.5; const b = card(w, h, 0.06, ['#3d46b5', '#552dbc', '#2c2f86'][i % 3], P.lav, 'z'); b.position.set(-3.6 + i * 0.9, DESK + h / 2, -2.9 - r() * 0.4); realSet.add(b);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, h * 0.85), new THREE.MeshBasicMaterial({ map: canvasTex(64, 128, (g, W_, H_) => { for (let y = 6; y < H_; y += 12) for (let x = 6; x < W_; x += 12) { g.fillStyle = r() > 0.5 ? 'rgba(201,191,255,0.55)' : 'rgba(201,191,255,0.12)'; g.fillRect(x, y, 6, 7); } }), transparent: true })); win.position.set(b.position.x, b.position.y, b.position.z + 0.035); realSet.add(win); }
  for (let i = 0; i < 6; i++) { const x = (i < 3 ? -3.0 : 3.0) + (i % 3 - 1) * 0.35, z = -1.4 + (i % 3) * 0.9; const tr = card(0.05, 0.5, 0.05, '#7a5a3a', '#7a5a3a', 'x'); tr.position.set(x, DESK + 0.25, z); realSet.add(tr); const c = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), paper(i % 2 ? '#3fae6a' : '#2f8f4e')); c.position.set(x, DESK + 0.72, z); c.scale.y = 1.15; c.castShadow = true; realSet.add(c); } }
// schematic structure: two rings, posts and a foundation slab (illustrative — not an engineering drawing)
const struct = new THREE.Group(); realSet.add(struct);
const structMat = new THREE.MeshStandardMaterial({ color: '#ff9f43', roughness: 0.5, emissive: '#ff9f43', emissiveIntensity: 0.25, transparent: true, opacity: 0 });
const slabMat = new THREE.MeshStandardMaterial({ color: '#8a86a8', roughness: 0.95, map: grain, transparent: true, opacity: 0, emissive: P.cyan, emissiveIntensity: 0 });
{ for (const x of [-0.45, 0.45]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.035, 10, 48), structMat); ring.rotation.y = Math.PI / 2; ring.position.set(x, DESK + 0.62, 0); struct.add(ring); }
  for (const [x, z] of [[-0.75, 0.3], [-0.75, -0.3], [0.75, 0.3], [0.75, -0.3], [-0.45, 0.42], [0.45, -0.42]]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 10), structMat); post.position.set(x, DESK + 0.3, z); struct.add(post); }
  const slab = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.7), slabMat); slab.position.set(0, DESK + 0.005, 0); struct.add(slab); struct.userData.slab = slab; }
const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.02, 0.16), [paper('#ffe7a6'), paper('#ffe7a6'), new THREE.MeshStandardMaterial({ map: canvasTex(475, 80, (g, w, h) => { g.fillStyle = '#ffe7a6'; g.fillRect(0, 0, w, h); g.fillStyle = P.ink; for (let i = 0; i <= 7; i++) { const x = 20 + i * 62; g.fillRect(x, 0, 3, i % 7 === 0 ? 46 : 30); g.font = '700 22px "Space Grotesk"'; g.textAlign = 'center'; g.fillText(String(i), x, 66); } }), roughness: 0.9 }), paper('#ffe7a6'), paper('#ffe7a6'), paper('#ffe7a6')]);
ruler.position.set(-0.95, DESK + 0.045, 1.35); ruler.rotation.y = 0.08; realSet.add(ruler);

// ------------------------------------------------------------------ the MODEL page: graph paper, a loose block with a Bean silhouette
const modelSet = new THREE.Group(); scene.add(modelSet);
{ const gp = new THREE.Mesh(new THREE.BoxGeometry(11, 0.02, 7.2), [paper('#e9ecff'), paper('#e9ecff'), new THREE.MeshStandardMaterial({ map: canvasTex(1100, 720, (g, w, h) => { g.fillStyle = '#eef0ff'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 20) { g.strokeStyle = x % 100 === 0 ? 'rgba(61,70,181,0.35)' : 'rgba(61,70,181,0.12)'; g.lineWidth = x % 100 === 0 ? 2 : 1; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 20) { g.strokeStyle = y % 100 === 0 ? 'rgba(61,70,181,0.35)' : 'rgba(61,70,181,0.12)'; g.lineWidth = y % 100 === 0 ? 2 : 1; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }), roughness: 0.95 }), paper('#e9ecff'), paper('#e9ecff'), paper('#e9ecff')]);
  gp.position.set(-1.5, DESK + 0.01, 0.5); gp.receiveShadow = true; modelSet.add(gp); }
const BLK = { w: 2.0, h: 0.8, d: 1.2 };
const block = new THREE.Group(); modelSet.add(block);
{ const face = canvasTex(500, 200, (g, w, h) => { g.fillStyle = '#d8d4f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#9fa6d6'; g.beginPath(); g.ellipse(250, 102, 190, 80, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d8d4f2'; g.beginPath(); g.ellipse(250, 190, 70, 44, 0, Math.PI, 0); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(200, 72, 70, 22, -0.2, 0, Math.PI * 2); g.fill(); g.fillStyle = P.ink; g.font = '700 30px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('MODEL', 250, 30); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(BLK.w, BLK.h, BLK.d), [paper('#cfcaf0'), paper('#cfcaf0'), paper('#e2deff'), paper('#cfcaf0'), new THREE.MeshStandardMaterial({ map: face, emissive: '#ffffff', emissiveMap: face, emissiveIntensity: 0.2, roughness: 0.9 }), paper('#cfcaf0')]);
  m.position.y = DESK + 0.02 + BLK.h / 2; m.castShadow = true; m.receiveShadow = true; block.add(m); }
// crowd tiles of 100 people (4 × 4) behind the pushing side
const tileTex = (n) => canvasTex(220, 200, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 22); g.fill(); g.fillStyle = '#3ddc84'; rr(g, 0, 0, w, 40, 22); g.fill(); g.fillRect(0, 20, w, 20); g.fillStyle = '#0d1240'; g.font = '700 28px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${n} people`, w / 2, 21);
  for (let i = 0; i < 100; i++) { if (i >= n) break; const x = 22 + (i % 10) * 18, y = 56 + Math.floor(i / 10) * 14; g.fillStyle = PCOL[i % 6]; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); } });
const tile100 = tileTex(100), tile50 = tileTex(50);
const tiles = []; for (let i = 0; i < 16; i++) { const c = i % 4, r = Math.floor(i / 4); const m = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.02), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: i === 2 ? tile50 : tile100, emissive: '#ffffff', emissiveMap: i === 2 ? tile50 : tile100, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]);
  m.castShadow = true; const grp = new THREE.Group(); grp.position.set(-2.05 - c * 0.56, DESK, -0.95 + r * 0.58); grp.add(m); m.position.y = 0.24; m.rotation.x = -0.75; modelSet.add(grp); tiles.push({ grp, m, alt: i === 2 }); }
const fullTile2 = new THREE.MeshStandardMaterial({ map: tile100, emissive: '#ffffff', emissiveMap: tile100, emissiveIntensity: 0.25, roughness: 0.9 });
// pushers (tokens) and the queue
const pushers = [0, 1, 2, 3].map((i) => { const t = token(PCOL[i], 0.9); modelSet.add(t); t.position.set(-1.25, DESK, -0.45 + i * 0.32); t.rotation.y = 0.9; return t; });
const rivals = [0, 1, 2].map((i) => { const t = token('#c0392b', 0.9); modelSet.add(t); t.position.set(1.25, DESK, -0.3 + i * 0.35); t.rotation.y = -0.9; return t; });
const queue = Array.from({ length: 12 }, (_, i) => { const t = token(PCOL[i % 6], 0.85); modelSet.add(t); t.position.set(-1.5 - i * 0.2, DESK, 1.0 - i * 0.3); t.rotation.y = 0.5; return t; });
const angler = token('#e8a33a', 0.9); modelSet.add(angler); angler.position.set(-1.1, DESK + 0.95, 0.15); angler.rotation.y = 0.8;
// the slider macro: ruler with inch marks (enlarged)
const mRuler = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.02, 0.22), [paper('#ffe7a6'), paper('#ffe7a6'), new THREE.MeshStandardMaterial({ map: canvasTex(750, 110, (g, w, h) => { g.fillStyle = '#ffe7a6'; g.fillRect(0, 0, w, h); g.fillStyle = P.ink; for (let i = 0; i <= 8; i++) { const x = 30 + i * 85; g.fillRect(x, 0, 4, i === 0 || i === 7 ? 70 : 40); g.font = '700 28px "Space Grotesk"'; g.textAlign = 'center'; g.fillText(i + '"', x, 96); } g.fillStyle = P.magenta; g.fillRect(30 + 7 * 85 - 2, 0, 8, 74); }), roughness: 0.9 }), paper('#ffe7a6'), paper('#ffe7a6'), paper('#ffe7a6')]);
mRuler.position.set(BLK.w / 2 + 0.69, DESK + 0.03, BLK.d / 2 + 0.2); modelSet.add(mRuler);
const startMark = card(0.03, 0.5, 0.03, P.magenta, P.magenta, 'x'); startMark.position.set(BLK.w / 2, DESK + 0.25, BLK.d / 2 + 0.2); modelSet.add(startMark);

// ------------------------------------------------------------------ arrows + labels
const A = { mg: makeArrow(ARROW.mg, 0.04), N: makeArrow(ARROW.N, 0.04), fr: makeArrow(ARROW.fr, 0.05), push: makeArrow(ARROW.push, 0.05), net: makeArrow(ARROW.white, 0.04), rivalP: makeArrow(ARROW.fr, 0.05), ang: makeArrow(ARROW.push, 0.04), angX: makeArrow('#9ff0c4', 0.03), react: makeArrow(ARROW.react, 0.05), crowd: makeArrow(ARROW.push, 0.05), rmg: makeArrow(ARROW.mg, 0.035), rN: makeArrow(ARROW.N, 0.035), rN2: makeArrow(ARROW.N, 0.035), disp: makeArrow(ARROW.white, 0.03) };
const small = Array.from({ length: 4 }, () => makeArrow(ARROW.push, 0.025));
const tileArr = Array.from({ length: 16 }, () => makeArrow(ARROW.push, 0.02));
const L = {
  rmg: label(['weight  mg ≈ 979 kN'], '#8a6d00', 0.62), rN: label(['ground pushes up  N'], '#127a8f', 0.62), ruler: label(['7 in = 0.178 m', 'not to scale'], '#3d46b5', 0.5, '#fff', 520), q: label(['how many people?'], P.magenta, 0.62),
  sup: label(['structural supports', '+ foundation (schematic)'], '#b05a10', 0.78, '#fff', 680), loose: label(['IMAGINARY LOOSE BEAN', 'idealised model, not the real one'], P.magenta, 0.95, '#fff', 760),
  mg: label(['mg ≈ 979 kN'], '#8a6d00', 0.5, '#fff', 480), N: label(['N = mg'], '#127a8f', 0.42, '#fff', 400), fr: label(['friction ≤ μs·N'], '#b0203a', 0.55, '#fff', 520), push: label(['people: n × 300 N'], '#1a7f4b', 0.6, '#fff', 560),
  ex: label(['250 people × 300 N = 75 kN', 'example only, not the real crowd size'], '#1a7f4b', 1.0, '#fff', 820), cancel: label(['opposite pushes cancel', 'ΣF ≈ 0'], '#5a5f8f', 0.8, '#fff', 640),
  ang: label(['only F·cos θ pushes sideways'], '#1a7f4b', 0.85, '#fff', 720), reach: label(['can\'t reach the surface'], '#5a5f8f', 0.7, '#fff', 620), perf: label(['"perfectly coordinated"?'], P.magenta, 0.75, '#fff', 680),
  dist: label(['moved 0.178 m', 'shown enlarged'], '#3d46b5', 0.55, '#fff', 520), react: label(['support reaction', 'balances the push'], '#2a4fb0', 0.72, '#fff', 620), squad: label(['the squad'], '#1a7f4b', 0.55, '#fff', 420), found: label(['the foundation'], '#2a4fb0', 0.6, '#fff', 480),
};
// the squad around the real Bean (S10/S11)
const squad = Array.from({ length: 18 }, (_, i) => { const t = token(PCOL[i % 6], 0.75); realSet.add(t); const a = Math.PI * (0.55 + 0.9 * (i / 17)); t.position.set(Math.cos(a) * 1.55 - 0.1, DESK + 0.03, Math.sin(a) * 1.0 * -1 + 0.35); t.rotation.y = -a + Math.PI / 2; t.visible = false; return t; });

// ------------------------------------------------------------------ the Media Diet paper sign (signature, CTA shot — accepted prop)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.0, DESK, 2.6);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const SHOTS = {
  S1: () => SH(V3(0, 1.6, 5), V3(0, 0.6, 0), 48),
  S2: (t) => { const u = prog(t, 3.5, 7.3); return SH(L3([-1.85, 1.55, 4.75], [-1.45, 1.6, 4.55], u), V3(-0.2, 0.55, 0.35), 48); },
  S3: (t) => { const u = prog(t, 7.3, 10.75); return SH(L3([1.75, 1.45, 4.35], [1.45, 1.5, 4.55], u), V3(0.0, 0.55, 0.25), 48); },
  S4: (t) => { const u = prog(t, 10.75, 16.15); return SH(L3([0.0, 2.1, 6.05], [-0.05, 2.05, 5.8], u), V3(-0.05, 0.48, 0.25), 48); },
  S5: (t) => { const u = prog(t, 16.15, 22.2); return SH(L3([-1.45, 2.75, 4.85], [-1.5, 2.8, 5.1], u), V3(-1.45, 0.25, -0.1), 50); },
  S6: (t) => { const u = prog(t, 22.2, 24.5); return SH(L3([-3.0, 1.55, 2.9], [-3.15, 1.5, 2.7], u), V3(-3.15, 0.3, -0.1), 48); },
  S7: (t) => { const u = prog(t, 24.5, 28.3), q = prog(t, E.queue - 0.2, E.queue + 0.8); const a = SH(L3([0.05, 2.65, 7.1], [-0.15, 2.62, 6.95], u), V3(-0.2, 0.45, 0.4), 50); return SH(a.pos.clone().lerp(V3(-1.55, 2.75, 6.7), q), a.look.clone().lerp(V3(-1.75, 0.35, -0.3), q), 50); },
  S8: (t) => { const u = prog(t, 30.4, 33.95); return SH(L3([2.05, 1.45, 3.35], [2.0, 1.4, 3.2], u), V3(1.55, 0.18, 0.62), 46); },
  S9: (t) => { const u = prog(t, 33.95, 37.25); return SH(L3([-0.5, 1.85, 6.15], [-0.35, 1.8, 5.95], u), V3(-0.38, 0.42, 0.35), 48); },
  S10: (t) => { const u = prog(t, 37.25, 41.05); return SH(L3([0.9, 2.2, 4.9], [0.75, 2.3, 5.05], u), V3(-0.1, 0.5, 0.2), 48); },
  S11: (t) => { const u = prog(t, 41.05, 44.7); return SH(L3([0.25, 2.6, 7.4], [0.3, 3.3, 8.4], u), L3([0.0, 0.75, 0.9], [0.0, 0.8, 0.7], u), 48, lerp(6.0, 7.2, u)); },
};

// ------------------------------------------------------------------ per-frame update
const px = (n) => n / 306000;    // newtons → arrow length (490 kN ≈ 1.6 units)
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;
  const real = ['S2', 'S3', 'S9', 'S10', 'S11'].includes(id), model = ['S4', 'S5', 'S6', 'S7', 'S8'].includes(id);
  realSet.visible = real; modelSet.visible = model;
  Object.values(A).forEach((a) => (a.visible = false)); small.forEach((a) => (a.visible = false)); tileArr.forEach((a) => (a.visible = false)); Object.values(L).forEach((l) => (l.visible = false));
  const bc = V3(0, DESK + 0.62, 0);   // Bean centre of mass (approx.)
  // ---------------- REAL page
  if (id === 'S2') { setArrow(A.rmg, V3(0, DESK + 0.95, 0.85), V3(0, -1, 0), 0.7 * prog(t, E.mg, E.mg + 0.35), 1); showLabel(L.rmg, V3(0.18, DESK + 0.3, 1.3), prog(t, E.mg + 0.1, E.mg + 0.4));
    for (const [a, x] of [[A.rN, -0.88], [A.rN2, 0.88]]) setArrow(a, V3(x, DESK + 0.02, 0.62), V3(0, 1, 0), 0.42 * prog(t, E.N, E.N + 0.35), 1); showLabel(L.rN, V3(-0.62, DESK + 0.78, 0.9), prog(t, E.N + 0.1, E.N + 0.4));
    showLabel(L.ruler, ruler.position.clone().add(V3(0.15, 0.2, 0.1)), prog(t, E.ruler, E.ruler + 0.3)); }
  // the cutaway: shell turns translucent, schematic structure appears; then the supports drop away for the imaginary loose Bean
  const cut = id === 'S3' ? prog(t, E.cut, E.cut + 0.6) * (1 - prog(t, E.loose, E.loose + 0.6)) : id === 'S9' ? 0.55 : id === 'S10' ? 0.35 * prog(t, E.found, E.found + 0.4) : 0;
  chrome.opacity = 1 - 0.72 * cut; chrome.depthWrite = cut < 0.05; structMat.opacity = cut > 0 ? Math.min(1, cut * 1.4) : 0; slabMat.opacity = Math.max(cut > 0 ? Math.min(1, cut * 1.6) : 0, id === 'S10' || id === 'S11' ? 0.85 : 0);
  slabMat.emissiveIntensity = id === 'S10' ? 0.6 * prog(t, E.found, E.found + 0.4) : 0;
  bean.position.y = DESK + 0.035 + (id === 'S3' ? 0.08 * prog(t, E.loose, E.loose + 0.7, outBack) : 0);
  if (id === 'S3') { showLabel(L.sup, V3(0.5, DESK + 0.18, 1.3), prog(t, E.cut + 0.2, E.cut + 0.5) * (1 - prog(t, E.loose - 0.2, E.loose + 0.1))); showLabel(L.loose, V3(0.5, DESK + 0.18, 1.35), prog(t, E.loose, E.loose + 0.4)); }
  if (id === 'S9') { const pw = px(75000) * 2.2; setArrow(A.crowd, V3(-1.25 - pw, DESK + 0.45, 0.3), V3(1, 0, 0), pw * prog(t, E.realPush, E.realPush + 0.4), 1); setArrow(A.react, V3(0.62, DESK + 0.12, 1.1), V3(-1, 0, 0), pw * prog(t, E.react, E.react + 0.4), 1);
    showLabel(L.react, V3(0.22, DESK + 0.5, 1.45), prog(t, E.react + 0.15, E.react + 0.45)); }
  squad.forEach((s, i) => { const on = id === 'S10' || id === 'S11'; s.visible = on; if (on) { const k = id === 'S11' ? 1 : prog(t, 37.35 + i * 0.04, 37.6 + i * 0.04, outBack); s.scale.setScalar(0.75 * Math.max(0.01, k)); s.position.y = DESK + 0.03 + 0.03 * Math.abs(Math.sin(t * 6 + i)); } });
  if (id === 'S10') { showLabel(L.squad, V3(-1.6, DESK + 0.9, 0.9), prog(t, 37.5, 37.8)); showLabel(L.found, V3(0.9, DESK + 0.35, 1.25), prog(t, E.found, E.found + 0.35)); }
  // ---------------- MODEL page
  const top = DESK + 0.02 + BLK.h, mid = DESK + 0.02 + BLK.h / 2, zf = BLK.d / 2 + 0.05;
  let bx = 0; if (id === 'S8') bx = 1.19 * prog(t, E.slide, E.slide + 0.65, (x) => 1 - Math.pow(1 - x, 2)); block.position.x = bx; startMark.visible = id === 'S8';
  if (id === 'S4' || id === 'S5') {
    setArrow(A.mg, V3(0.45, mid + 0.25, zf + 0.02), V3(0, -1, 0), 0.62 * prog(t, E.fbd, E.fbd + 0.35), 1); showLabel(L.mg, V3(0.5, DESK + 0.2, zf + 0.45), prog(t, E.fbd + 0.1, E.fbd + 0.4) * (id === 'S4' ? 1 : 0));
    setArrow(A.N, V3(0.75, DESK + 0.02, zf + 0.04), V3(0, 1, 0), 0.62 * prog(t, E.fbd + 0.25, E.fbd + 0.6), 1); showLabel(L.N, V3(0.62, top + 0.08, zf + 0.2), prog(t, E.fbd + 0.35, E.fbd + 0.65) * (id === 'S4' ? 1 : 0));
    const frL = px(489500) * prog(t, E.fric, E.fric + 0.45); setArrow(A.fr, V3(0.82, DESK + 0.06, zf + 0.03), V3(-1, 0, 0), frL, 1); showLabel(L.fr, V3(0.05, DESK + 0.2, zf + 0.35), prog(t, E.fric + 0.15, E.fric + 0.45) * (id === 'S4' ? 1 : 0));
    pushers.forEach((p, i) => { p.visible = true; p.scale.setScalar(0.9 * Math.max(0.01, prog(t, E.people + i * 0.1, E.people + i * 0.1 + 0.3, outBack))); const a = small[i]; setArrow(a, V3(-1.2, DESK + 0.4, -0.45 + i * 0.32), V3(1, 0, 0), 0.16 * prog(t, E.people + 0.3 + i * 0.1, E.people + 0.6 + i * 0.1), 1); });
    // summed push grows: 4 people → 250 (example) → 1,600
    let n = 4 * prog(t, E.people, E.people + 0.6); if (t >= E.ex) n = lerp(4, 250, prog(t, E.ex, E.ex + 0.6)); if (t >= E.grow) n = lerp(250, 1632, prog(t, E.grow, E.grow + 1.6, (x) => x));
    const pl = px(n * 300) * (id === 'S5' ? 1 : 0); setArrow(A.push, V3(-BLK.w / 2 - 0.05 - pl, mid, zf + 0.03), V3(1, 0, 0), pl, 1); showLabel(L.push, V3(-BLK.w / 2 - 0.05 - pl / 2, mid - 0.22, zf + 0.35), id === 'S5' ? prog(t, E.ex, E.ex + 0.3) : 0);
    tiles.forEach((tl, i) => { let s = 0; if (id === 'S5') { if (i < 3) s = prog(t, E.ex + i * 0.12, E.ex + i * 0.12 + 0.3, outBack); else s = prog(t, E.grow + (i - 3) * 0.11, E.grow + (i - 3) * 0.11 + 0.3, outBack); }
      tl.grp.visible = s > 0.01; tl.grp.scale.setScalar(Math.max(0.01, s)); if (tl.alt) tl.m.material[4] = t >= E.grow + 0.05 ? fullTile2 : tl.m.material[4]; tl.grp.rotation.z = 0; }); }
  if (id === 'S6') { // "perfectly" — the tiles drift out of sync, their arrows splay
    const w = prog(t, 22.35, 22.9);
    tiles.forEach((tl, i) => { tl.grp.visible = true; tl.grp.scale.setScalar(1); const ph = i * 1.7; tl.grp.rotation.y = w * 0.35 * Math.sin(t * 3 + ph); tl.grp.position.y = DESK + w * 0.05 * Math.abs(Math.sin(t * 4 + ph));
      const dir = V3(Math.cos(w * 1.1 * Math.sin(ph * 2.3)), 0, Math.sin(w * 1.1 * Math.sin(ph * 2.3))); setArrow(tileArr[i], tl.grp.position.clone().add(V3(0.2, 0.08, 0.15)), dir, 0.28, 1); });
  }
  if (id === 'S7') {
    tiles.forEach((tl) => (tl.grp.visible = false));
    // (a) opposite pushes cancel
    const ca = prog(t, E.cancel, E.cancel + 0.4) * (1 - prog(t, E.angled - 0.1, E.angled + 0.2)); const len = 0.9 * ca;
    pushers.forEach((p) => (p.visible = true)); rivals.forEach((r, i) => { r.visible = ca > 0.01; r.scale.setScalar(0.9 * Math.max(0.01, prog(t, E.cancel + i * 0.08, E.cancel + 0.3 + i * 0.08, outBack))); });
    setArrow(A.push, V3(-BLK.w / 2 - 0.05 - len, mid, zf + 0.03), V3(1, 0, 0), len, 1); setArrow(A.rivalP, V3(BLK.w / 2 + 0.05 + len, mid, zf + 0.03), V3(-1, 0, 0), len, 1);
    angler.position.set(-1.62, DESK, 0.15);
    // (b) an angled push: only the horizontal component helps
    const an = prog(t, E.angled, E.angled + 0.4) * (1 - prog(t, E.queue - 0.1, E.queue + 0.2)); angler.visible = an > 0.01; angler.scale.setScalar(0.9 * Math.max(0.01, an));
    const th = 0.87, from = V3(-1.52, mid + 0.42, 0.2); setArrow(A.ang, from, V3(Math.cos(th), -Math.sin(th), 0), 0.66 * an, 1); setArrow(A.angX, V3(-1.52, mid - 0.14, 0.28), V3(1, 0, 0), 0.66 * Math.cos(th) * an * prog(t, E.angled + 0.4, E.angled + 0.8), 0.95);
    // (c) the queue: most people can't reach the surface
    queue.forEach((q, i) => { const s = prog(t, E.queue + i * 0.07, E.queue + i * 0.07 + 0.3, outBack); q.visible = s > 0.01; q.scale.setScalar(0.85 * Math.max(0.01, s)); });
  } else { rivals.forEach((r) => (r.visible = false)); queue.forEach((q) => (q.visible = false)); angler.visible = false; }
  if (!['S4', 'S5', 'S7'].includes(id)) pushers.forEach((p) => (p.visible = false));
  if (id === 'S8') { setArrow(A.push, V3(bx - BLK.w / 2 - 0.75, mid, zf + 0.03), V3(1, 0, 0), 0.7 * (1 - prog(t, E.slide + 0.65, E.slide + 0.9)), 1); setArrow(A.disp, V3(BLK.w / 2, DESK + 0.12, BLK.d / 2 + 0.32), V3(1, 0, 0), bx, 1); showLabel(L.dist, V3(BLK.w / 2 + 0.6, DESK + 0.32, zf + 0.45), prog(t, E.slide + 0.6, E.slide + 0.9)); }
  // ---------------- CTA sign
  const sgu = prog(t, E.sign, E.sign + 0.45, outBack); sign.visible = id === 'S11'; sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(sgu, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}

// ------------------------------------------------------------------ 2-D overlay: footage (S1), model tag, assumption chips, equations
const footage = new Image(); let footIdx = -1;
async function loadFoot(i) { if (i === footIdx) return; footIdx = i; footage.src = `../.cache/footage/f${String(i + 1).padStart(4, '0')}.png`; await footage.decode(); }
function chip(text, x, y, bg, o = {}) { og.save(); og.font = o.font || '700 30px "Space Grotesk"'; const w = og.measureText(text).width + 40, h = o.h || 52; const x0 = o.align === 'left' ? x : x - w / 2; og.globalAlpha = o.alpha ?? 1; og.fillStyle = bg; rr(og, x0, y - h / 2, w, h, h / 2); og.fill(); og.restore();
  otext(text, x0 + w / 2, y + 11, { font: o.font || '700 30px "Space Grotesk"', alpha: o.alpha ?? 1, shadow: 0, kind: 'label' }); }
function eqCard(lines, y, a, accent = '#3d46b5') { if (a <= 0.01) return; const h = 30 + lines.length * 46; og.save(); og.globalAlpha = clamp(a); og.fillStyle = 'rgba(243,241,255,0.95)'; rr(og, 110, y, 860, h, 22); og.fill(); og.fillStyle = accent; rr(og, 110, y, 14, h, 7); og.fill(); og.restore();
  lines.forEach((l, i) => otext(l, 150 + 0, y + 46 + i * 46, { align: 'left', font: i === 0 ? '700 34px "Plex Mono"' : '600 28px "Space Grotesk"', color: i === 0 ? '#14163a' : '#552dbc', alpha: clamp(a), shadow: 0, kind: 'label' })); }
function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = []; const id = shot.id;
  if (id === 'S1') { const z = 1 + 0.05 * clamp(t / 3.5), cx = 540, cy = 1150; og.drawImage(footage, cx - cx * z, cy - cy * z, 1080 * z, 1920 * z);
    chip('Millennium Park · Sunday, Nov 8, 2026', 540, 1540, 'rgba(13,18,64,0.78)', { font: '700 28px "Space Grotesk"', alpha: prog(t, 0.3, 0.7) }); }
  else { const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H); }
  const model = ['S4', 'S5', 'S6', 'S7', 'S8'].includes(id);
  if (model) { chip('IMAGINARY LOOSE BEAN · idealised model', 540, 600, 'rgba(254,64,146,0.92)', { font: '700 28px "Space Grotesk"' });
    if (t >= E.mu) chip('μs = 0.5 (assumed)', 330, 664, 'rgba(176,32,58,0.9)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, E.mu, E.mu + 0.3) });
    if (t >= E.f300) chip('300 N per person (assumed)', 700, 664, 'rgba(26,127,75,0.9)', { font: '700 26px "Space Grotesk"', h: 46, alpha: prog(t, E.f300, E.f300 + 0.3) }); }
  if (id === 'S4') { eqCard(['m ≈ 99,790 kg', '110 short tons (220,000 lb), reported'], 1300, prog(t, E.fbd, E.fbd + 0.3)); eqCard(['N = m·g ≈ 979,000 N'], 1460, prog(t, E.Neq, E.Neq + 0.3), '#127a8f'); }
  if (id === 'S5') { eqCard(['F_start = μs·N ≈ 490,000 N', 'friction threshold ≈ 490 kN'], 1190, prog(t, E.Feq, E.Feq + 0.3), '#b0203a');
    if (t >= E.grow) eqCard(['n > 490,000 ÷ 300 ≈ 1,632', 'about 1,600 — idealised estimate'], 1350, prog(t, E.neq, E.neq + 0.3), '#1a7f4b'); if (t >= E.range) eqCard(['μs 0.3–0.6 → roughly 1,000–2,000'], 1510, prog(t, E.range, E.range + 0.3), '#5a5f8f'); }
  if (id === 'S2') chip('how many people?', 540, 1450, 'rgba(254,64,146,0.92)', { font: '700 34px "Space Grotesk"', h: 60, alpha: prog(t, E.q, E.q + 0.35) });
  if (id === 'S5' && t >= E.ex && t < E.grow) eqCard(['250 × 300 N = 75 kN', 'example only, not the real crowd size'], 1350, prog(t, E.ex + 0.2, E.ex + 0.5), '#1a7f4b');
  if (id === 'S6') eqCard(['"perfectly coordinated"?', 'timing, direction and grip all vary'], 1350, prog(t, 22.4, 22.75), '#fe4092');
  if (id === 'S7') { if (t < E.angled) eqCard(['opposite pushes cancel', 'ΣF ≈ 0'], 1350, prog(t, E.cancel + 0.35, E.cancel + 0.7), '#5a5f8f'); else if (t < E.queue) eqCard(['F_sideways = F·cos θ', 'an angled push only partly helps'], 1350, prog(t, E.angled + 0.4, E.angled + 0.7), '#1a7f4b'); else eqCard(['most people can\'t reach', 'the surface at all'], 1350, prog(t, E.queue + 0.5, E.queue + 0.8), '#5a5f8f'); }
  if (id === 'S8') { eqCard(['to start:  F > μs·N ≈ 490 kN', 'a force threshold'], 1190, prog(t, 30.6, 30.9), '#b0203a'); eqCard(['7 in = 0.178 m', 'a distance, not a force'], 1350, prog(t, E.slide + 0.6, E.slide + 0.9), '#3d46b5'); eqCard(['once moving:  ΣF = m·a'], 1510, prog(t, E.moving, E.moving + 0.3), '#5a5f8f'); }
  if (id === 'S9') { eqCard(['real answer needs:', 'anchor strength + contact geometry'], 1300, prog(t, E.need, E.need + 0.3), '#2a4fb0'); eqCard(['110 tons ÷ 300 N  ≠  answer'], 1460, prog(t, E.need + 0.6, E.need + 0.9), '#b0203a'); }
  captions(t);
}

// printed cards that glow get their own print as the emissive map (a flat white glow washes them out)
scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.isMeshStandardMaterial && m.map && m.map !== grain && !m.emissiveMap && m.emissiveIntensity > 0 && m.emissive.getHex() === 0xffffff) { m.emissiveMap = m.map; m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.25); m.needsUpdate = true; } }); });
window.render = async (f) => { const t = f / FPS; const shot = update(t); if (shot.id === 'S1') await loadFoot(Math.min(104, f)); else composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
