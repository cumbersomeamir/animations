// Media Diet · 30 s English episode (english-07) — WhatsApp Events invites now reach friends who aren't on WhatsApp (Meta, 5 Nov 2026)
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



// ------------------------------------------------------------------ small canvas glyphs (generic; no WhatsApp/Meta logos or UI)
function gEnvelope(g, x, y, w, h, col = '#f3f1ff', line = '#9d8cf0') { g.fillStyle = col; rr(g, x, y, w, h, h * 0.12); g.fill(); g.strokeStyle = line; g.lineWidth = Math.max(2, h * 0.06); g.beginPath(); g.moveTo(x + w * 0.06, y + h * 0.12); g.lineTo(x + w / 2, y + h * 0.58); g.lineTo(x + w * 0.94, y + h * 0.12); g.stroke(); }
function gLock(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -22, -6, 44, 34, 6); g.fill(); g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.arc(0, -6, 14, Math.PI, 0); g.stroke(); g.restore(); }
function gPin(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -12, 20, Math.PI * 0.85, Math.PI * 0.15); g.lineTo(0, 30); g.closePath(); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, -12, 8, 0, Math.PI * 2); g.fill(); g.restore(); }
function gLink(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.7); g.strokeStyle = col; g.lineWidth = 9; for (const dx of [-17, 17]) { rr(g, dx - 22, -13, 44, 26, 13); g.stroke(); } g.restore(); }
function gCal(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -24, -20, 48, 44, 7); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(-18, -6, 36, 24); g.fillStyle = col; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g.fillRect(-14 + i * 11, -1 + j * 10, 7, 6); g.fillRect(-14, -28, 6, 12); g.fillRect(8, -28, 6, 12); g.restore(); }
function gBubble(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.arc(0, -4, 26, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(-18, 12); g.lineTo(-26, 28); g.lineTo(-4, 20); g.fill(); g.fillStyle = '#ffffff'; for (const dx of [-10, 0, 10]) { g.beginPath(); g.arc(dx, -4, 3.5, 0, Math.PI * 2); g.fill(); } g.restore(); }
function gNoPhone(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#ffffff'; g.lineWidth = 6; rr(g, -14, -24, 28, 48, 6); g.stroke(); g.strokeStyle = P.magenta; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-24, 24); g.lineTo(24, -24); g.stroke(); g.restore(); }
function gDownload(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(0, -34); g.lineTo(0, 10); g.stroke(); g.beginPath(); g.moveTo(-18, -8); g.lineTo(0, 12); g.lineTo(18, -8); g.stroke(); g.beginPath(); g.moveTo(-30, 14); g.lineTo(-30, 30); g.lineTo(30, 30); g.lineTo(30, 14); g.stroke(); g.restore(); }
function gSpark(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, q = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); }
// the picnic cover photo (a paper illustration, fictional event)
function drawCover(g, x, y, w, h, r = 18) {
  g.save(); rr(g, x, y, w, h, r); g.clip();
  const sky = g.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#8fd8f2'); sky.addColorStop(1, '#c9bfff'); g.fillStyle = sky; g.fillRect(x, y, w, h);
  g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(x + w * 0.78, y + h * 0.3, h * 0.13, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#7c3fda'; g.beginPath(); g.moveTo(x, y + h * 0.7); g.quadraticCurveTo(x + w * 0.3, y + h * 0.42, x + w * 0.62, y + h * 0.66); g.lineTo(x + w * 0.62, y + h); g.lineTo(x, y + h); g.fill();
  g.fillStyle = '#552dbc'; g.beginPath(); g.moveTo(x + w * 0.35, y + h * 0.78); g.quadraticCurveTo(x + w * 0.7, y + h * 0.5, x + w, y + h * 0.68); g.lineTo(x + w, y + h); g.lineTo(x + w * 0.35, y + h); g.fill();
  // checked blanket + basket
  const bx = x + w * 0.2, by = y + h * 0.74, bw = w * 0.42, bh = h * 0.2; g.fillStyle = '#ffffff'; g.fillRect(bx, by, bw, bh);
  g.fillStyle = P.magenta; for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2 === 0) g.fillRect(bx + i * bw / 6, by + j * bh / 3, bw / 6, bh / 3);
  g.fillStyle = '#c47a3a'; rr(g, bx + bw * 0.62, by - bh * 0.45, bw * 0.3, bh * 0.55, 6); g.fill(); g.strokeStyle = '#c47a3a'; g.lineWidth = Math.max(3, h * 0.025); g.beginPath(); g.arc(bx + bw * 0.77, by - bh * 0.45, bw * 0.1, Math.PI, 0); g.stroke();
  g.restore();
}

// ------------------------------------------------------------------ desk calendar (accepted prop; pages hinge over to NOV 5)
const CAL = { x: -3.3, z: -0.75 };
const cal = new THREE.Group(); cal.position.set(CAL.x, DESK, CAL.z); cal.rotation.y = 0.25; scene.add(cal);
{ const base = card(1.25, 0.12, 0.7, P.violet, P.edge); base.position.y = 0.06; cal.add(base);
  const back = card(1.2, 1.35, 0.05, P.violet2, P.edge, 'z'); back.position.set(0, 0.78, -0.18); back.rotation.x = -0.18; cal.add(back);
  for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 16), paper(P.white)); ring.position.set(-0.3 + i * 0.6, 1.43, -0.27); cal.add(ring); } }
const calPages = [3, 4, 5].map((d, i) => { const hinge = new THREE.Group(); hinge.position.set(0, 1.42, -0.235 + (2 - i) * 0.004); hinge.rotation.x = -0.18; cal.add(hinge);
  const tex = canvasTex(400, 440, (g, w, h) => { g.fillStyle = '#f3f1ff'; g.fillRect(0, 0, w, h); g.fillStyle = P.magenta; g.fillRect(0, 0, w, 96); g.fillStyle = '#ffffff'; g.font = '700 58px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NOV', w / 2, 52);
    g.fillStyle = P.ink; g.font = '700 230px "Space Grotesk"'; g.fillText(String(d), w / 2, 270); g.fillStyle = '#9d8cf0'; g.fillRect(60, 400, w - 120, 6); });
  const pg = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.24, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#e6e2ff')]);
  pg.position.set(0, -0.64, 0); pg.castShadow = true; hinge.add(pg); return hinge; }).reverse();
// the source placard (shown on screen: who said it, and when)
const srcCard = new THREE.Group(); srcCard.position.set(-3.1, DESK, 0.22); srcCard.rotation.y = 0.12; scene.add(srcCard);
const srcHinge = new THREE.Group(); srcCard.add(srcHinge);
{ const tex = canvasTex(640, 300, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 26); g.fill(); g.fillStyle = P.magenta; rr(g, 0, 0, w, 78, 26); g.fill(); g.fillRect(0, 40, w, 38);
    g.fillStyle = '#ffffff'; g.font = '700 46px "Space Grotesk"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('SOURCE', 34, 42);
    g.fillStyle = P.ink; g.font = '700 60px "Space Grotesk"'; g.fillText('Meta newsroom', 34, 146); g.fillStyle = '#552dbc'; g.font = '600 48px "Plex Mono"'; g.fillText('Nov 5, 2026', 34, 228); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.6, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]);
  face.position.y = 0.36; face.castShadow = true; srcHinge.add(face); const foot = card(1.28, 0.03, 0.4, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.16); srcCard.add(foot); }

// ------------------------------------------------------------------ paper phones on stands (generic screens; no app UI copied)
const PH = { w: 1.22, h: 2.3, sw: 1.08, sh: 2.12, cw: 540, ch: 1060 }; PH.cy = PH.h / 2 + 0.06;
function makePhone(x, z, ry, body = P.navy2) {
  const grp = new THREE.Group(); grp.position.set(x, DESK, z); grp.rotation.y = ry; scene.add(grp);
  const tilt = new THREE.Group(); tilt.rotation.x = -0.08; grp.add(tilt);
  const b = card(PH.w, PH.h, 0.08, body, P.lav, 'z'); b.position.y = PH.cy; tilt.add(b);
  const cv = document.createElement('canvas'); cv.width = PH.cw; cv.height = PH.ch; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(PH.sw, PH.sh), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.6, roughness: 0.85 })); scr.position.set(0, PH.cy, 0.041); tilt.add(scr);
  const strut = card(0.5, 1.2, 0.05, P.violet, P.edge, 'z'); strut.position.set(0, 0.62, -0.32); strut.rotation.x = 0.42; grp.add(strut);
  const foot = card(1.1, 0.06, 0.75, P.violet, P.edge); foot.position.set(0, 0.03, -0.12); grp.add(foot);
  const lip = card(1.1, 0.1, 0.06, P.violet2, P.edge, 'z'); lip.position.set(0, 0.1, 0.1); grp.add(lip);
  return { grp, tilt, g: cv.getContext('2d'), tex, key: '' };
}
const scrPt = (ph, cx, cy, dz = 0.06) => { ph.grp.updateMatrixWorld(true); return ph.tilt.localToWorld(V3((cx / PH.cw - 0.5) * PH.sw, PH.cy + (0.5 - cy / PH.ch) * PH.sh, dz)); };
const HOST = makePhone(-1.15, -0.1, 0.06);
const GA = makePhone(1.45, -0.2, -0.1);        // the friend's phone (no WhatsApp): opens the invite link
const GB = makePhone(0.12, -0.15, 0.08, '#2a2f72');   // a second guest, not replied yet (limit shot)

function statusBar(g) { g.fillStyle = '#efecff'; g.fillRect(0, 0, PH.cw, PH.ch); g.fillStyle = '#24287e'; g.fillRect(0, 0, PH.cw, 44); g.fillStyle = '#c9bfff'; g.font = '600 22px "Plex Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 24, 23);
  for (let i = 0; i < 3; i++) g.fillRect(PH.cw - 92 + i * 10, 30 - i * 5, 6, 6 + i * 5); rr(g, PH.cw - 52, 14, 30, 16, 4); g.fill(); }
function header(g, title, sub) { g.fillStyle = '#3d46b5'; g.fillRect(0, 44, PH.cw, 92); g.fillStyle = '#ffffff'; g.font = '700 38px "Space Grotesk"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(title, 32, sub ? 78 : 90); if (sub) { g.fillStyle = '#c9bfff'; g.font = '600 22px "Space Grotesk"'; g.fillText(sub, 32, 114); } }
const AV = ['#7c3fda', '#2a9fbf', '#d23d7c', '#552dbc', '#8a8fb8'];
function phoneDraw(ph, s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 30) / 30 : v)); if (key === ph.key) return; ph.key = key;
  const g = ph.g; statusBar(g); g.textAlign = 'left'; g.textBaseline = 'middle';
  if (s.mode === 'chat') {
    header(g, 'Picnic crew', '5 friends');
    const bub = (y, txt, mine, a = 1) => { if (a <= 0) return; g.save(); g.globalAlpha = clamp(a); g.font = '600 30px "Space Grotesk"'; const w = g.measureText(txt).width + 48; const x = mine ? PH.cw - 30 - w : 30; g.fillStyle = mine ? '#7c3fda' : '#ffffff'; rr(g, x, y, w, 70, 22); g.fill(); g.fillStyle = mine ? '#ffffff' : P.ink; g.fillText(txt, x + 24, y + 36); g.restore(); };
    bub(180, 'Picnic on Saturday?', false); bub(275, 'Sounds great!', false); bub(370, "I'll send an invite", true);
    // the event invite bubble
    g.fillStyle = '#ffffff'; rr(g, 120, 470, 390, 330, 24); g.fill(); g.strokeStyle = '#7c3fda'; g.lineWidth = 5; g.stroke(); drawCover(g, 136, 486, 358, 170, 16);
    g.fillStyle = P.ink; g.font = '700 32px "Space Grotesk"'; g.fillText('Saturday picnic', 140, 700); gCal(g, 160, 755, 0.7, '#552dbc'); g.fillStyle = '#552dbc'; g.font = '600 26px "Space Grotesk"'; g.fillText('Sat · 4:00 PM', 190, 757);
    g.fillStyle = '#ffffff'; rr(g, 30, 960, PH.cw - 60, 70, 35); g.fill(); g.fillStyle = '#9d9bbd'; g.font = '600 26px "Space Grotesk"'; g.fillText('Message', 60, 996);
  } else if (s.mode === 'create') {
    header(g, 'New event');
    const ph = clamp(s.photo); g.strokeStyle = '#9d8cf0'; g.lineWidth = 4; g.setLineDash([14, 10]); rr(g, 30, 160, 480, 250, 20); g.stroke(); g.setLineDash([]);
    if (ph < 1) { g.fillStyle = '#7a74b8'; g.font = '700 30px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('+ Add cover photo', 270, 286); g.textAlign = 'left'; }
    if (ph > 0) { g.save(); rr(g, 30, 160, 480, 250, 20); g.clip(); g.translate(0, -260 * (1 - outC(ph))); drawCover(g, 30, 160, 480, 250, 20); g.restore(); }
    const field = (y, label, val, active) => { g.fillStyle = '#552dbc'; g.font = '600 24px "Space Grotesk"'; g.fillText(label, 34, y - 22); g.fillStyle = '#ffffff'; rr(g, 30, y, 480, 76, 16); g.fill(); g.strokeStyle = active ? P.cyan : '#b9b4dc'; g.lineWidth = active ? 5 : 3; g.stroke(); g.fillStyle = P.ink; g.font = '700 32px "Space Grotesk"'; g.fillText(val, 54, y + 40); };
    const title = 'Saturday picnic'; const n = Math.round(title.length * clamp(s.type));
    field(480, 'Event name', title.slice(0, n), s.type > 0 && s.type < 1); field(610, 'Date and time', 'Sat · 4:00 PM', false); field(740, 'Location', '14 Park Lane', false);
    const pr = clamp(s.press); const sc = 1 - 0.06 * Math.sin(Math.PI * pr); g.save(); g.translate(270, 925); g.scale(sc, sc);
    g.fillStyle = s.shared ? '#2a9fbf' : P.magenta; rr(g, -240, -48, 480, 96, 48); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 34px "Space Grotesk"'; g.textAlign = 'center'; gLink(g, -120, 0, 0.75, '#ffffff'); g.fillText(s.shared ? 'Link shared' : 'Share link', 30, 2); g.restore(); g.textAlign = 'left';
  } else if (s.mode === 'home') {
    header(g, 'Events');
    g.fillStyle = P.ink; g.font = '700 26px "Space Grotesk"'; g.fillText('Upcoming', 34, 176); g.fillStyle = '#9d9bbd'; g.fillText('Past', 190, 176); g.fillStyle = P.magenta; g.fillRect(34, 196, 116, 5);
    g.fillStyle = '#ffffff'; rr(g, 30, 222, 480, 470, 24); g.fill(); drawCover(g, 46, 238, 448, 190, 16);
    g.fillStyle = P.ink; g.font = '700 34px "Space Grotesk"'; g.fillText('Saturday picnic', 52, 466); gCal(g, 72, 520, 0.7, '#552dbc'); g.fillStyle = '#552dbc'; g.font = '600 26px "Space Grotesk"'; g.fillText('Sat · 4:00 PM', 102, 522);
    const n = Math.floor(s.going + 1e-6); g.fillStyle = P.ink; g.font = '700 30px "Space Grotesk"'; g.fillText('Going', 52, 610); g.fillStyle = P.magenta; g.font = '700 44px "Space Grotesk"'; g.fillText(String(n), 152, 610);
    for (let i = 0; i < 5; i++) { const x = 250 + i * 50; g.fillStyle = i < n ? AV[i] : '#dcd8f4'; g.beginPath(); g.arc(x, 610, 22, 0, Math.PI * 2); g.fill(); if (i < n) { gPerson(g, x, 612, 0.42, '#ffffff'); } }
    const rm = clamp(s.remind); g.fillStyle = '#ffffff'; rr(g, 30, 716, 480, 120, 24); g.fill(); if (rm > 0) { g.strokeStyle = P.cyan; g.lineWidth = 5 * rm; g.stroke(); }
    gBell(g, 82, 772, 0.75, '#7c3fda'); g.fillStyle = P.ink; g.font = '700 30px "Space Grotesk"'; g.fillText('Reminder', 130, 756); g.fillStyle = '#7a74b8'; g.font = '600 24px "Space Grotesk"'; g.fillText('1 hour before', 130, 796);
    g.fillStyle = rm > 0.5 ? P.cyan : '#9d9bbd'; rr(g, 390, 744, 96, 52, 26); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(lerp(416, 460, rm), 770, 20, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#7c3fda'; g.lineWidth = 4; rr(g, 30, 880, 480, 90, 45); g.stroke(); g.fillStyle = '#7c3fda'; g.font = '700 30px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('+ Create event', 270, 926); g.textAlign = 'left';
  } else if (s.mode === 'guest') {
    // a plain web page opened from the link (generic browser bar; no app)
    g.fillStyle = '#24287e'; g.fillRect(0, 44, PH.cw, 80); g.fillStyle = '#3d46b5'; rr(g, 24, 60, PH.cw - 48, 48, 24); g.fill(); gLock(g, 56, 82, 0.5, '#c9bfff'); g.fillStyle = '#c9bfff'; g.font = '600 22px "Plex Mono"'; g.fillText('event invite link', 82, 85);
    const op = clamp(s.open ?? 1); g.save(); g.globalAlpha = op; g.translate(0, 40 * (1 - outC(op)));
    drawCover(g, 30, 150, 480, 230, 20);
    g.fillStyle = P.ink; g.font = '700 40px "Space Grotesk"'; g.fillText('Saturday picnic', 34, 428); gCal(g, 56, 486, 0.75, '#552dbc'); g.fillStyle = '#552dbc'; g.font = '600 28px "Space Grotesk"'; g.fillText('Sat · 4:00 PM', 90, 488);
    const rep = clamp(s.replied); const sh = s.shake ? Math.sin(s.shake * Math.PI * 8) * 5 * (1 - s.shake) : 0;
    g.fillStyle = '#ffffff'; rr(g, 30, 540, 480, 128, 22); g.fill(); g.strokeStyle = rep > 0.5 ? P.cyan : (s.shake > 0 && s.shake < 1 ? P.magenta : '#b9b4dc'); g.lineWidth = rep > 0.5 ? 5 : 4; g.stroke();
    if (rep < 0.5) { g.save(); g.translate(sh, 0); gLock(g, 82, 606, 1.05, '#552dbc'); g.restore(); g.fillStyle = '#552dbc'; g.font = '700 28px "Space Grotesk"'; g.fillText('Address', 130, 584); g.fillStyle = '#7a74b8'; g.font = '600 24px "Space Grotesk"'; g.fillText('shown after you reply', 130, 624);
      g.fillStyle = '#d6d2f2'; rr(g, 130, 642, 260, 12, 6); g.fill(); }
    else { gPin(g, 80, 606, 1.15, P.magenta); g.fillStyle = '#552dbc'; g.font = '700 28px "Space Grotesk"'; g.fillText('Address', 130, 584); g.fillStyle = P.ink; g.font = '700 34px "Space Grotesk"'; g.fillText('14 Park Lane', 130, 628); }
    if (rep < 0.5) { const pr = clamp(s.press ?? 0); const sc = 1 - 0.06 * Math.sin(Math.PI * pr); g.save(); g.translate(270, 790); g.scale(sc, sc); g.fillStyle = P.magenta; rr(g, -240, -50, 480, 100, 50); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 38px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('RSVP', 0, 2); g.restore(); g.textAlign = 'left'; }
    else { g.strokeStyle = P.cyan; g.lineWidth = 5; rr(g, 30, 740, 480, 100, 50); g.stroke(); g.fillStyle = P.ink; g.font = '700 36px "Space Grotesk"'; g.textAlign = 'center'; g.fillText("You're going", 250, 792); g.textAlign = 'left'; sCheck(g, 420, 790, 26, clamp((rep - 0.5) * 3)); }
    g.restore();
  }
  ph.tex.needsUpdate = true;
}

// ------------------------------------------------------------------ the five friends (paper tokens) in front of the host phone
const TOK = [[-1.95, 1.05], [-1.55, 1.25], [-1.15, 1.33], [-0.75, 1.25], [-0.35, 1.05]];
const discTex = (draw) => canvasTex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); draw(g); });
const tokens = TOK.map(([x, z], i) => {
  const grp = new THREE.Group(); grp.position.set(x, DESK, z); grp.rotation.y = -x * 0.08 - 0.09; scene.add(grp);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.04, 28), paper(P.violet)); foot.position.y = 0.02; foot.castShadow = foot.receiveShadow = true; grp.add(foot);
  const stick = card(0.04, 0.42, 0.03, P.edge, P.white, 'z'); stick.position.y = 0.23; grp.add(stick);
  const head = new THREE.Group(); head.position.y = 0.6; head.scale.setScalar(0.85); grp.add(head);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 40), paper(P.edge)); disc.rotation.x = Math.PI / 2; disc.castShadow = true; head.add(disc);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.205, 40), new THREE.MeshStandardMaterial({ map: discTex((g) => { g.fillStyle = AV[i]; g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill(); gPerson(g, 128, 132, 2.6, '#f3f1ff'); }), roughness: 0.9 })); face.position.z = 0.017; head.add(face);
  const appB = new THREE.Mesh(new THREE.CircleGeometry(0.075, 28), new THREE.MeshStandardMaterial({ map: discTex((g) => { g.fillStyle = i < 4 ? '#2a9fbf' : '#5a5f8f'; g.beginPath(); g.arc(128, 128, 124, 0, Math.PI * 2); g.fill(); if (i < 4) gBubble(g, 132, 128, 2.6, '#ffffff'); else gNoPhone(g, 128, 128, 2.7); }), roughness: 0.9 })); appB.position.set(-0.17, -0.15, 0.03); head.add(appB);
  const chk = new THREE.Mesh(new THREE.CircleGeometry(0.085, 28), new THREE.MeshStandardMaterial({ map: discTex((g) => sCheck(g, 128, 128, 120, 1)), roughness: 0.9, transparent: true })); chk.position.set(0.17, 0.16, 0.035); head.add(chk);
  return { grp, head, chk };
});
// the "?" tag over the friend without the app
const qTag = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.02), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(130, 150, (g) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, 130, 150, 18); g.fill(); g.fillStyle = P.magenta; g.font = '700 120px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 65, 82); }), roughness: 0.9 }), paper('#cfc8ff')]);
qTag.castShadow = true; scene.add(qTag);
const smallCard = (w, h, draw) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(Math.round(w * 600), Math.round(h * 600), draw), emissive: '#ffffff', emissiveIntensity: 0.12, roughness: 0.9 }), paper('#cfc8ff')]); m.castShadow = true; scene.add(m); return m; };
const invites = TOK.map(() => smallCard(0.3, 0.2, (g, w, h) => gEnvelope(g, 0, 0, w, h, '#f3f1ff', '#7c3fda')));
const chips = TOK.map(() => smallCard(0.3, 0.17, (g, w, h) => { g.fillStyle = P.cyan; rr(g, 0, 0, w, h, h / 2); g.fill(); gLink(g, w / 2, h / 2, 1.1, '#0d1240'); }));
const replies = TOK.map((_, i) => smallCard(0.2, 0.2, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 24); g.fill(); g.fillStyle = AV[i]; g.beginPath(); g.arc(w / 2, h / 2, w * 0.36, 0, Math.PI * 2); g.fill(); sCheck(g, w * 0.72, h * 0.3, w * 0.2, 1); gPerson(g, w / 2, h / 2 + 4, 0.9, '#ffffff'); }));
const tokHead = (i) => { tokens[i].grp.updateMatrixWorld(true); return tokens[i].head.localToWorld(V3(0, 0, 0.12)); };

// ------------------------------------------------------------------ "download the app?" tile, struck out (guest needs no app)
const dl = new THREE.Group(); dl.position.set(0.98, DESK, 0.95); dl.rotation.y = 0.2; dl.scale.setScalar(0.72); scene.add(dl);
const dlHinge = new THREE.Group(); dl.add(dlHinge);
const dlCv = document.createElement('canvas'); dlCv.width = 300; dlCv.height = 340; const dlg = dlCv.getContext('2d'); const dlTex = new THREE.CanvasTexture(dlCv); dlTex.colorSpace = THREE.SRGBColorSpace;
{ const face = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.68, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: dlTex, emissive: '#ffffff', emissiveMap: dlTex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = 0.36; face.castShadow = true; dlHinge.add(face);
  const foot = card(0.6, 0.03, 0.3, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.12); dl.add(foot); }
let dlKey = '';
function drawDl(strike) { const k = String(Math.round(strike * 30)); if (k === dlKey) return; dlKey = k; const g = dlg; g.fillStyle = '#f3f1ff'; rr(g, 0, 0, 300, 340, 30); g.fill(); g.fillStyle = '#d8d2ff'; rr(g, 50, 40, 200, 170, 26); g.fill(); gDownload(g, 150, 125, 1.5, '#552dbc');
  g.fillStyle = P.ink; g.font = '700 38px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Install app?', 150, 270);
  if (strike > 0) { g.strokeStyle = P.magenta; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(36, 316); g.lineTo(36 + 228 * clamp(strike), 316 - 290 * clamp(strike)); g.stroke(); } dlTex.needsUpdate = true; }

// a paper pointer (taps RSVP on the friend's phone)
const pointer = new THREE.Group(); scene.add(pointer);
{ const sh = new THREE.Shape(); [[0, 0], [0, -0.3], [0.075, -0.23], [0.13, -0.34], [0.17, -0.32], [0.115, -0.21], [0.21, -0.21]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false }), [paper('#ffffff'), paper(P.ink)]); m.castShadow = true; pointer.add(m); }
// a 3-D paper map pin that pops off the address row once the guest has replied
const pin = new THREE.Group(); scene.add(pin);
{ const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), paper(P.magenta)); head.position.y = 0.2; head.castShadow = true; pin.add(head);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.2, 20), paper(P.magenta)); tip.rotation.x = Math.PI; tip.position.y = 0.07; tip.castShadow = true; pin.add(tip);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), paper(P.white)); dot.position.set(0, 0.22, 0.09); pin.add(dot); }
// paper tags for the limit shot
function tagCard(text, col) { const grp = new THREE.Group(); scene.add(grp); const tex = canvasTex(520, 120, (g, w, h) => { g.fillStyle = col; rr(g, 0, 0, w, h, 60); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 50px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 3); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.2, 0.02), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.2, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = 0.14; face.rotation.x = -0.5; face.castShadow = true; grp.add(face); return grp; }
const tagB = tagCard('Not replied yet', '#5a5f8f'); tagB.position.set(0.12, DESK, 0.62); tagB.rotation.y = 0.08;
const tagA = tagCard('Replied', '#2a9fbf'); tagA.position.set(1.45, DESK, 0.55); tagA.rotation.y = -0.1;

// ------------------------------------------------------------------ rollout grid: phones light up in waves, some still waiting
const GRID = { x: 3.75, z: 2.35 };
const offMat = new THREE.MeshBasicMaterial({ color: '#4a4f80' });
const onTex = canvasTex(120, 210, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); drawCover(g, 10, 14, 100, 60, 8); g.fillStyle = P.ink; g.fillRect(12, 90, 80, 12); g.fillStyle = '#9d8cf0'; g.fillRect(12, 112, 60, 10); g.fillStyle = P.magenta; rr(g, 12, 150, 96, 34, 17); g.fill(); });
const onMat = new THREE.MeshStandardMaterial({ map: onTex, emissive: '#ffffff', emissiveMap: onTex, emissiveIntensity: 0.55, roughness: 0.85 });
const gridPh = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const grp = new THREE.Group(); grp.position.set(GRID.x + (c - 1.5) * 0.46, DESK, GRID.z + (r - 1) * 0.52); grp.rotation.x = -0.12; scene.add(grp);
  const b = card(0.27, 0.47, 0.03, r % 2 ? '#2a2f72' : P.navy2, P.lav, 'z'); b.position.y = 0.26; grp.add(b); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.23, 0.41), offMat); sc.position.set(0, 0.26, 0.017); grp.add(sc);
  const f = card(0.3, 0.03, 0.14, P.violet, P.edge); f.position.set(0, 0.015, -0.02); grp.add(f); gridPh.push({ grp, sc, c, r }); }
const LIT = E.lit;    // seconds after the wave starts (-1 = not yet)
const banner = new THREE.Group(); banner.position.set(GRID.x, DESK, GRID.z - 0.95); scene.add(banner);
const bnCv = document.createElement('canvas'); bnCv.width = 760; bnCv.height = 200; const bng = bnCv.getContext('2d'); const bnTex = new THREE.CanvasTexture(bnCv); bnTex.colorSpace = THREE.SRGBColorSpace;
{ const face = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: bnTex, emissive: '#ffffff', emissiveMap: bnTex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = 0.56; face.castShadow = true; banner.add(face);
  for (const x of [-0.7, 0.7]) { const st = card(0.05, 0.32, 0.04, P.edge, P.white, 'z'); st.position.set(x, 0.16, 0); banner.add(st); } }
let bnKey = '';
function drawBanner(p) { const k = String(Math.round(p * 60)); if (k === bnKey) return; bnKey = k; const g = bng; g.fillStyle = '#f3f1ff'; rr(g, 0, 0, 760, 200, 30); g.fill(); g.fillStyle = P.ink; g.font = '700 58px "Space Grotesk"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('Rolling out to everyone', 40, 64);
  g.fillStyle = '#d8d2ff'; rr(g, 40, 120, 680, 40, 20); g.fill(); g.fillStyle = P.cyan; if (p > 0.03) { rr(g, 40, 120, 680 * p, 40, 20); g.fill(); } bnTex.needsUpdate = true; }

// ------------------------------------------------------------------ the Media Diet paper sign (signature, CTA shot — accepted prop)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.15, DESK, 3.6);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const shotIn = (id) => TL.shots.find((s) => s.id === id);
const SHOTS = {
  S1: (t) => { const u = prog(t, 0, 3.38); return SH(L3([-1.15, 2.75, 5.6], [-1.15, 2.65, 5.25], u), V3(-1.15, 1.2, 0.45), 50); },
  S2: (t) => { const u = prog(t, 3.38, 6.44); return SH(L3([-3.12, 1.65, 3.45], [-3.15, 1.6, 3.2], u), V3(-3.12, 0.82, -0.2), 50); },
  S3: (t) => { const a = prog(t, 6.44, 8.3), u = prog(t, 8.3, 9.25); const p0 = L3([-1.12, 1.76, 3.9], [-1.12, 1.74, 3.68], a); return SH(L3([p0.x, p0.y, p0.z], [-1.15, 2.65, 5.3], u), L3([-1.15, 1.62, -0.1], [-1.15, 1.08, 0.45], u), lerp(46, 50, u)); },
  S4: (t) => { const u = prog(t, 10.38, 15.05); return SH(L3([1.55, 1.62, 3.55], [1.5, 1.58, 3.3], u), V3(1.38, 1.1, 0.0), 48); },
  S5: (t) => { const u = prog(t, 15.05, 18.65); return SH(L3([-1.0, 2.2, 4.35], [-1.05, 2.15, 4.1], u), V3(-1.15, 1.5, 0.2), 48); },
  S6: (t) => { const u = prog(t, 18.65, 23.29); return SH(L3([0.8, 2.0, 5.55], [0.8, 1.95, 5.25], u), V3(0.8, 1.02, 0.1), 48); },
  S7: (t) => { const u = prog(t, 23.29, 26.31); return SH(L3([3.75, 2.8, 6.05], [3.75, 2.7, 5.75], u), V3(3.75, 0.42, 2.12), 48); },
  S8: (t) => { const u = prog(t, 26.31, 29.6); return SH(L3([0.3, 3.1, 9.6], [0.4, 3.9, 10.7], u), L3([0.25, 0.75, 0.6], [0.25, 0.8, 0.3], u), 48, lerp(6.0, 7.2, u)); },
};

// ------------------------------------------------------------------ per-frame update
const arc = (a, b, h, u) => a.clone().lerp(b, u).add(V3(0, Math.sin(Math.PI * u) * h, 0));
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;

  // host phone screen: chat (hook) → new event form (create, photo, share) → Events Home (replies, reminder)
  if (t < E.create) phoneDraw(HOST, { mode: 'chat' });
  else if (t < E.home) phoneDraw(HOST, { mode: 'create', type: prog(t, E.create + 0.12, E.create + 0.75, (u) => u), photo: prog(t, E.photo, E.photo + 0.45), press: clamp((t - E.share) / 0.25), shared: t >= E.share + 0.15 });
  else { const going = E.replies.filter((r) => t >= r + 0.4).length; phoneDraw(HOST, { mode: 'home', going, remind: prog(t, E.remind, E.remind + 0.3) }); }
  // the friend's phone (A) and a second guest (B)
  const repA = t >= E.rsvp + 0.1 ? 0.5 + prog(t, E.rsvp + 0.1, E.rsvp + 0.4) * 0.5 : 0;
  phoneDraw(GA, { mode: 'guest', open: id === 'S4' ? prog(t, E.open, E.open + 0.3) : 1, replied: id === 'S6' || t >= 26.31 ? 1 : repA, press: clamp((t - E.rsvp) / 0.2) });
  GB.grp.visible = t >= 18.65; phoneDraw(GB, { mode: 'guest', open: 1, replied: 0, shake: clamp((t - E.lock) / 0.7) });
  tagA.visible = tagB.visible = t >= 18.65; { const sA = prog(t, 18.75, 19.1, outBack), sB = prog(t, 18.85, 19.2, outBack); tagA.scale.setScalar(Math.max(0.01, t >= 26.31 ? 1 : sA)); tagB.scale.setScalar(Math.max(0.01, t >= 26.31 ? 1 : sB)); }

  // hook: invites fly from the host phone to the friends; the last one bounces off the friend without the app
  const src = scrPt(HOST, 315, 640, 0.08);
  invites.forEach((m, i) => { const t0 = E.invites + i * 0.24, t1 = t0 + 0.55; m.visible = id === 'S1' && t >= t0; if (!m.visible) return; const end = tokHead(i);
    if (i < 4) { const u = prog(t, t0, t1, (x) => x); m.position.copy(arc(src, end, 0.45, u)); m.quaternion.copy(camera.quaternion); m.scale.setScalar(1 - 0.75 * prog(t, t1 - 0.1, t1 + 0.12)); m.visible = t < t1 + 0.12; }
    else { const u = prog(t, t0, t1, (x) => x); if (t < t1) { m.position.copy(arc(src, end, 0.45, u)); m.quaternion.copy(camera.quaternion); m.rotation.z = 0; }
      else { const b = prog(t, t1, t1 + 0.7, (x) => x); const p = end.clone().add(V3(0.35 * b, 0.32 * Math.sin(Math.PI * Math.min(1, b * 1.3)) - 0.62 * b * b, 0.2 * b)); m.position.copy(p); m.quaternion.copy(camera.quaternion); m.rotateZ(-2.2 * b); m.rotateX(-1.1 * b); } } });
  // share: one link chip leaves the phone and fans out to every friend, including the one without the app
  const btn = scrPt(HOST, 270, 925, 0.08), split = scrPt(HOST, 270, 520, 0.6);
  chips.forEach((m, i) => { m.visible = id === 'S3' && t >= E.share + 0.1 && t < E.land + 0.12; if (!m.visible) return; const end = tokHead(i);
    const p = t < E.fan ? btn.clone().lerp(split, prog(t, E.share + 0.1, E.fan)) : arc(split, end, 0.3, prog(t, E.fan, E.land)); m.position.copy(p); m.quaternion.copy(camera.quaternion); m.scale.setScalar(1 - 0.7 * prog(t, E.land - 0.08, E.land + 0.12)); });
  // replies come back to the host's Events Home
  const rsvpRow = scrPt(HOST, 300, 610, 0.08);
  replies.forEach((m, i) => { const t0 = E.replies[i]; m.visible = id === 'S5' && t >= t0 && t < t0 + 0.5; if (!m.visible) return; m.position.copy(arc(tokHead(i), rsvpRow, 0.35, prog(t, t0, t0 + 0.42))); m.quaternion.copy(camera.quaternion); m.scale.setScalar(1 - 0.6 * prog(t, t0 + 0.3, t0 + 0.48)); });
  // token badges: invite received (check), the "?" over the friend without the app until the link reaches them
  tokens.forEach((k, i) => { let s;
    if (t < E.create) s = i < 4 ? prog(t, E.invites + i * 0.24 + 0.5, E.invites + i * 0.24 + 0.8, outBack) : 0;
    else if (t < E.home) s = prog(t, E.land - 0.05, E.land + 0.25, outBack);
    else s = 1;
    k.chk.scale.setScalar(Math.max(0.01, s)); k.chk.visible = s > 0.01;
    const nod = Math.sin(Math.PI * clamp((t - (E.invites + i * 0.24 + 0.55)) / 0.4)) * (i < 4 ? 0.12 : 0) + Math.sin(Math.PI * clamp((t - E.land) / 0.4)) * 0.12; k.head.rotation.x = -nod; });
  { const q0 = E.invites + 4 * 0.24 + 0.8; const s = t < E.land ? prog(t, q0, q0 + 0.35, outBack) * (1 - prog(t, E.land - 0.1, E.land + 0.1)) : 0; qTag.visible = s > 0.01; const hp = tokHead(4); qTag.position.copy(hp).add(V3(0.05, 0.42 + 0.03 * Math.sin(t * 5), 0)); qTag.quaternion.copy(camera.quaternion); qTag.rotateZ(-0.12); qTag.scale.setScalar(Math.max(0.01, s)); }
  // pointer taps RSVP on the friend's phone
  { const show = id === 'S4'; pointer.visible = show; if (show) { const pOff = scrPt(GA, 500, 1050, 0.12), pBtn = scrPt(GA, 300, 810, 0.12); const p = pOff.clone().lerp(pBtn, prog(t, E.rsvp - 0.75, E.rsvp - 0.05)); const click = Math.sin(Math.PI * clamp((t - E.rsvp) / 0.2));
      pointer.position.copy(p).add(V3(0, 0, -0.06 * click)); pointer.quaternion.copy(GA.grp.quaternion); pointer.scale.setScalar(1 - 0.12 * click); if (t > E.rsvp + 0.5) pointer.position.lerp(pOff, prog(t, E.rsvp + 0.5, E.rsvp + 1.1)); } }
  // the address pin pops once the friend has replied (S4), and again in the comparison (S6)
  { const s = 0.5 * (id === 'S4' ? prog(t, E.rsvp + 0.25, E.rsvp + 0.6, outBack) : id === 'S6' ? 1 + 0.3 * Math.sin(Math.PI * clamp((t - E.pin) / 0.4)) : t >= 26.31 ? 1 : 0); pin.visible = s > 0.01 && (id === 'S4' || id === 'S6' || t >= 26.31);
    const base = scrPt(GA, 462, 590, 0.05); pin.position.copy(base).add(V3(0, 0.02, 0.02)); pin.scale.setScalar(Math.max(0.01, s)); pin.rotation.y = 0.4; }
  // "install app?" tile is struck out and tips over: no download needed
  dl.visible = id === 'S4'; drawDl(prog(t, E.nodl, E.nodl + 0.4)); dlHinge.rotation.x = -1.35 * prog(t, E.nodl + 0.45, E.nodl + 0.95);
  // calendar 3 → 4 → 5, the source placard hinges up
  calPages.forEach((h, i) => { if (i === 0) return; const k = 2 - i; const u = prog(t, E.calFlip + k * 0.3, E.calFlip + k * 0.3 + 0.32); h.rotation.x = lerp(-0.18, 0.5 - Math.PI * 2, u); });
  srcCard.visible = t >= 3.38; { const u = prog(t, E.source, E.source + 0.45, outBack); srcHinge.rotation.x = -Math.PI / 2 * (1 - clamp(u, 0, 1.2)); }
  // rollout wave
  gridPh.forEach((p, i) => { const lt = LIT[i]; const on = lt >= 0 && t >= E.wave + lt; p.sc.material = on ? onMat : offMat; const s = lt >= 0 ? 1 + 0.18 * Math.sin(Math.PI * clamp((t - E.wave - lt) / 0.3)) : 1; p.grp.scale.setScalar(s); });
  drawBanner(lerp(0.12, 0.72, prog(t, E.wave, E.wave + 2.4)));
  // sign hinges up for the CTA
  const su = prog(t, E.sign, E.sign + 0.45, outBack); sign.visible = t >= E.sign - 0.1; sign.userData.hinge.rotation.x = -Math.PI / 2 * (1 - clamp(su, 0, 1.2));
  key.target.position.set(0, 0, 1);
  return shot;
}

function drawOverlay(t, shot) {
  og.clearRect(0, 0, W, H); TEXTLOG = [];
  { const v = og.createRadialGradient(540, 1060, 520, 540, 1060, 1250); v.addColorStop(0, 'rgba(4,5,26,0)'); v.addColorStop(1, 'rgba(4,5,26,0.45)'); og.fillStyle = v; og.fillRect(0, 0, W, H); }   // miniature vignette
  captions(t);
}

window.render = (f) => { const t = f / FPS; const shot = update(t); composer.render(); drawOverlay(t, shot); return t; };
window.TEXTS = () => TEXTLOG;
window.__ready = true;
