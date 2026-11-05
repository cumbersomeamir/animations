// Media Diet · 30 s English episode (english-06) — Chrome's enhanced autofill suggests details from Gmail in forms (Google, 28 Oct 2026)
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
const DEV = '"Noto Sans Devanagari"';
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


// ------------------------------------------------------------------ small canvas glyphs (generic; no Google/Chrome/Gmail logos)
function gEnvelope(g, x, y, w, h, col = '#f3f1ff', line = '#9d8cf0') { g.fillStyle = col; rr(g, x, y, w, h, h * 0.12); g.fill(); g.strokeStyle = line; g.lineWidth = Math.max(2, h * 0.06); g.beginPath(); g.moveTo(x + w * 0.06, y + h * 0.12); g.lineTo(x + w / 2, y + h * 0.58); g.lineTo(x + w * 0.94, y + h * 0.12); g.stroke(); }
function gTruck(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -40, -22, 48, 36, 5); g.fill(); rr(g, 10, -10, 28, 24, 5); g.fill(); g.fillStyle = '#ffffff'; for (const cx of [-24, 24]) { g.beginPath(); g.arc(cx, 18, 9, 0, Math.PI * 2); g.fill(); } g.restore(); }
function gPlane(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.5); g.fillStyle = col; g.beginPath(); g.moveTo(-40, 0); g.quadraticCurveTo(-40, -6, -30, -6); g.lineTo(34, -6); g.quadraticCurveTo(44, 0, 34, 6); g.lineTo(-30, 6); g.quadraticCurveTo(-40, 6, -40, 0); g.fill();
  g.beginPath(); g.moveTo(0, -4); g.lineTo(-14, -34); g.lineTo(-4, -34); g.lineTo(16, -4); g.fill(); g.beginPath(); g.moveTo(0, 4); g.lineTo(-14, 34); g.lineTo(-4, 34); g.lineTo(16, 4); g.fill(); g.beginPath(); g.moveTo(-32, -4); g.lineTo(-40, -18); g.lineTo(-34, -18); g.lineTo(-24, -4); g.fill(); g.restore(); }
function gHash(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(-10, -30); g.lineTo(-18, 30); g.moveTo(14, -30); g.lineTo(6, 30); g.moveTo(-28, -10); g.lineTo(28, -10); g.moveTo(-30, 12); g.lineTo(26, 12); g.stroke(); g.restore(); }
function gSpark(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, q = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); }
function gLock(g, x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; rr(g, -22, -6, 44, 34, 6); g.fill(); g.strokeStyle = col; g.lineWidth = 7; g.beginPath(); g.arc(0, -6, 14, Math.PI, 0); g.stroke(); g.restore(); }

// ------------------------------------------------------------------ desk calendar (accepted prop; pages hinge over to OCT 28)
const CAL = { x: -2.65, z: -1.55 };
const cal = new THREE.Group(); cal.position.set(CAL.x, DESK, CAL.z); cal.rotation.y = 0.3; scene.add(cal);
{ const base = card(1.25, 0.12, 0.7, P.violet, P.edge); base.position.y = 0.06; cal.add(base);
  const back = card(1.2, 1.35, 0.05, P.violet2, P.edge, 'z'); back.position.set(0, 0.78, -0.18); back.rotation.x = -0.18; cal.add(back);
  for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 16), paper(P.white)); ring.position.set(-0.3 + i * 0.6, 1.43, -0.27); cal.add(ring); } }
const calPages = [26, 27, 28].map((d, i) => { const hinge = new THREE.Group(); hinge.position.set(0, 1.42, -0.235 + (2 - i) * 0.004); hinge.rotation.x = -0.18; cal.add(hinge);
  const tex = canvasTex(400, 440, (g, w, h) => { g.fillStyle = '#f3f1ff'; g.fillRect(0, 0, w, h); g.fillStyle = P.magenta; g.fillRect(0, 0, w, 96); g.fillStyle = '#ffffff'; g.font = '700 58px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('OCT', w / 2, 52);
    g.fillStyle = P.ink; g.font = '700 210px "Space Grotesk"'; g.fillText(String(d), w / 2, 270); g.fillStyle = '#9d8cf0'; g.fillRect(60, 400, w - 120, 6); });
  const pg = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.24, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#e6e2ff')]);
  pg.position.set(0, -0.64, 0); pg.castShadow = true; hinge.add(pg); return hinge; }).reverse();
// the source placard (shown on screen: who said it, and when)
const srcCard = new THREE.Group(); srcCard.position.set(-1.45, DESK, -1.15); srcCard.rotation.y = 0.1; scene.add(srcCard);
const srcHinge = new THREE.Group(); srcCard.add(srcHinge);
{ const tex = canvasTex(640, 300, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 26); g.fill(); g.fillStyle = P.magenta; rr(g, 0, 0, w, 78, 26); g.fill(); g.fillRect(0, 40, w, 38);
    g.fillStyle = '#ffffff'; g.font = '700 46px "Space Grotesk"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('SOURCE', 34, 42);
    g.fillStyle = P.ink; g.font = '700 60px "Space Grotesk"'; g.fillText('Google blog', 34, 146); g.fillStyle = '#552dbc'; g.font = '600 48px "Plex Mono"'; g.fillText('Oct 28, 2026', 34, 228); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.6, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#cfc8ff')]);
  face.position.y = 0.36; face.castShadow = true; srcHinge.add(face); const foot = card(1.28, 0.03, 0.4, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.16); srcCard.add(foot); }

// ------------------------------------------------------------------ the inbox tray and its envelopes
const INBOX = { x: -0.85, z: 1.35 };
const inbox = new THREE.Group(); inbox.position.set(INBOX.x, DESK, INBOX.z); inbox.rotation.y = 0.12; scene.add(inbox);
{ const bot = card(1.5, 0.05, 1.0, P.violet, P.edge); bot.position.y = 0.025; inbox.add(bot);
  for (const [x, z, w, d, ax] of [[0, 0.5, 1.5, 0.04, 'z'], [0, -0.5, 1.5, 0.04, 'z'], [0.75, 0, 0.04, 1.0, 'x'], [-0.75, 0, 0.04, 1.0, 'x']]) { const wl = card(w, 0.32, d, '#8d78e8', P.white, ax); wl.position.set(x, 0.16, z); inbox.add(wl); }
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.2), new THREE.MeshStandardMaterial({ map: canvasTex(280, 80, (g) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, 280, 80, 16); g.fill(); gEnvelope(g, 20, 16, 64, 48, '#7c3fda', '#f3f1ff'); g.fillStyle = P.ink; g.font = '700 40px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('INBOX', 100, 42); }), roughness: 0.9 }));
  label.position.set(0, 0.18, 0.525); inbox.add(label); }
const envTex = canvasTex(256, 168, (g, w, h) => { gEnvelope(g, 0, 0, w, h, '#f3f1ff', '#9d8cf0'); });
const envelopes = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.41, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: envTex, roughness: 0.9 }), paper('#e6e2ff')]); m.castShadow = true; inbox.add(m); envelopes.push(m); }
const lens = new THREE.Group(); scene.add(lens);
{ const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 10, 40), paper(P.violet2)); ring.castShadow = true; lens.add(ring);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.26, 40), new THREE.MeshBasicMaterial({ color: '#bff6ff', transparent: true, opacity: 0.18, depthWrite: false })); lens.add(glass);
  const handle = card(0.07, 0.42, 0.05, P.violet, P.edge, 'z'); handle.position.set(0.17, -0.4, 0); handle.rotation.z = 0.5; lens.add(handle); }

// ------------------------------------------------------------------ the browser window (generic page; no Chrome UI) with a returns form
const WIN = { x: 0.55, z: -0.85, r: -0.12, w: 2.3, h: 1.68, y: 1.3 };
const win = new THREE.Group(); win.position.set(WIN.x, DESK, WIN.z); win.rotation.y = WIN.r; scene.add(win);
const wcv = document.createElement('canvas'); wcv.width = 960; wcv.height = 700; const wg = wcv.getContext('2d'); const wTex = new THREE.CanvasTexture(wcv); wTex.colorSpace = THREE.SRGBColorSpace; wTex.anisotropy = 8;
{ const leg = card(0.1, 0.7, 0.1, P.violet2, P.edge, 'x'); leg.position.set(0, 0.35, -0.08); win.add(leg); const foot = card(0.9, 0.05, 0.5, P.violet, P.edge); foot.position.y = 0.025; win.add(foot);
  const frame = card(WIN.w + 0.14, WIN.h + 0.14, 0.07, P.navy2, P.lav, 'z'); frame.position.set(0, WIN.y, 0); win.add(frame);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(WIN.w, WIN.h), new THREE.MeshStandardMaterial({ map: wTex, emissive: '#ffffff', emissiveMap: wTex, emissiveIntensity: 0.6, roughness: 0.85 })); scr.position.set(0, WIN.y, 0.037); win.add(scr); }
const ORDER_NO = 'A-48217';
let wKey = '';
function drawWindow(s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 30) / 30 : v)); if (key === wKey) return; wKey = key;
  const g = wg; g.fillStyle = '#e9e5ff'; g.fillRect(0, 0, 960, 700); g.fillStyle = '#24287e'; g.fillRect(0, 0, 960, 74);
  for (let i = 0; i < 3; i++) { g.fillStyle = ['#fe4092', '#c9bfff', '#2addfa'][i]; g.beginPath(); g.arc(34 + i * 30, 37, 10, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#3d46b5'; rr(g, 140, 18, 700, 38, 19); g.fill(); g.fillStyle = '#c9bfff'; g.font = '600 24px "Plex Mono"'; g.textBaseline = 'middle'; g.fillText('shop.example/returns', 174, 38);
  if (s.mode === 'settings') {
    g.fillStyle = P.ink; g.font = '700 46px "Space Grotesk"'; g.textAlign = 'left'; g.fillText('Settings › Autofill', 60, 140);
    const on = s.on ?? 1; g.fillStyle = '#ffffff'; rr(g, 60, 200, 840, 120, 22); g.fill(); g.fillStyle = P.ink; g.font = '700 38px "Space Grotesk"'; g.fillText('Enhanced autofill', 104, 260);
    g.fillStyle = on > 0.5 ? P.cyan : '#9d9bbd'; rr(g, 730, 228, 130, 64, 32); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(lerp(762, 828, on), 260, 26, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; rr(g, 60, 350, 840, 120, 22); g.fill(); gEnvelope(g, 104, 382, 80, 56, '#7c3fda', '#f3f1ff'); g.fillStyle = P.ink; g.fillText('Use info from Gmail', 210, 412);
    const chk = s.chk ?? 1; g.strokeStyle = '#552dbc'; g.lineWidth = 6; rr(g, 790, 382, 56, 56, 10); g.stroke(); if (chk > 0.5) { g.strokeStyle = '#0d1240'; g.lineWidth = 8; g.beginPath(); g.moveTo(802, 410); g.lineTo(814, 424); g.lineTo(836, 396); g.stroke(); }
    gLock(g, 120, 560, 1.4, '#552dbc'); g.fillStyle = '#552dbc'; g.font = '600 32px "Space Grotesk"'; g.fillText('Encrypted · you choose', 180, 565);
  } else {
    g.fillStyle = P.ink; g.font = '700 50px "Space Grotesk"'; g.textAlign = 'left'; g.fillText('Return an item', 60, 140);
    const field = (y, label, val, focus) => { g.fillStyle = '#552dbc'; g.font = '600 28px "Space Grotesk"'; g.fillText(label, 64, y - 26); g.fillStyle = '#ffffff'; rr(g, 60, y, 840, 74, 14); g.fill(); g.strokeStyle = focus ? P.cyan : '#b9b4dc'; g.lineWidth = focus ? 6 : 3; g.stroke();
      if (val === '…') { g.fillStyle = '#7a74b8'; rr(g, 90, y + 30, 260, 14, 7); g.fill(); } else if (val) { g.fillStyle = P.ink; g.font = '600 36px "Plex Mono"'; g.fillText(val, 90, y + 39); } };
    field(220, 'Name', '…', false); field(350, 'Email', '…', false);
    const filled = (s.fill ?? 0) > 0.5; field(480, 'Order number', filled ? ORDER_NO : '', s.focus);
    if (s.focus && !filled && Math.floor((s.t ?? 0) * 2.2) % 2 === 0) { g.fillStyle = P.ink; g.fillRect(92, 494, 4, 46); }
    if (filled) sCheck(g, 860, 517, 24, clamp((s.fill - 0.5) * 3));
    const sg = clamp(s.sugg ?? 0); if (sg > 0 && !filled) { const hgt = 110 * outBack(sg); g.save(); g.beginPath(); g.rect(60, 560, 840, hgt + 10); g.clip(); g.fillStyle = '#ffffff'; rr(g, 60, 562, 840, 108, 16); g.fill(); g.strokeStyle = P.cyan; g.lineWidth = 4; g.stroke();
      gEnvelope(g, 92, 586, 80, 58, '#7c3fda', '#f3f1ff'); g.fillStyle = P.ink; g.font = '600 38px "Plex Mono"'; g.fillText(ORDER_NO, 200, 606); g.fillStyle = '#7a74b8'; g.font = '600 26px "Space Grotesk"'; g.fillText('from your receipt email in Gmail', 200, 646); gSpark(g, 862, 616, 22, '#7c3fda'); g.restore(); }
    else if (!filled) { g.fillStyle = P.magenta; rr(g, 60, 600, 300, 64, 32); g.fill(); g.fillStyle = '#ffffff'; g.font = '700 30px "Space Grotesk"'; g.fillText('Continue', 120, 633); }
  }
  wTex.needsUpdate = true;
}

// ------------------------------------------------------------------ the rail from inbox to browser + the travelling detail card
const railMat = new THREE.MeshBasicMaterial({ color: P.cyan }); let rail = null;
const detail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.015), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: canvasTex(200, 120, (g) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, 200, 120, 16); g.fill(); gHash(g, 46, 60, 0.9, '#552dbc'); g.fillStyle = P.ink; g.font = '600 30px "Plex Mono"'; g.textBaseline = 'middle'; g.fillText(ORDER_NO.slice(2), 84, 60); }), emissive: '#ffffff', emissiveIntensity: 0.15, roughness: 0.9 }), paper('#cfc8ff')]);
detail.castShadow = true; scene.add(detail);
// three example tickets (order number, tracking, flight booking) that pop up out of the inbox
const ticketDefs = [['#', '#552dbc'], ['truck', '#2a9fbf'], ['plane', '#d23d7c']];
const tickets = ticketDefs.map(([k, col], i) => { const g = new THREE.Group(); scene.add(g);
  const tex = canvasTex(220, 160, (c) => { c.fillStyle = '#f3f1ff'; rr(c, 0, 0, 220, 160, 20); c.fill(); c.fillStyle = col; rr(c, 0, 0, 220, 40, 20); c.fill(); c.fillRect(0, 22, 220, 18); if (k === '#') gHash(c, 110, 100, 1.05, col); else if (k === 'truck') gTruck(c, 110, 100, 1.2, col); else gPlane(c, 110, 100, 1.15, col); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.015), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.2, roughness: 0.9 }), paper('#cfc8ff')]); m.castShadow = true; m.position.y = 0.2; g.add(m);
  const st = card(0.03, 0.5, 0.03, P.white, P.white, 'x'); st.position.y = -0.25; g.add(st); return g; });

// ------------------------------------------------------------------ the U.S. map with desktop / Android / iPhone props and the "Personal Intelligence" toggle
const MAP = { x: 3.45, z: 2.55, w: 2.9, d: 1.85 };
const US = [[0.02,0.08],[0.18,0.06],[0.45,0.06],[0.55,0.10],[0.62,0.12],[0.66,0.20],[0.70,0.17],[0.78,0.16],[0.86,0.10],[0.94,0.04],[0.97,0.10],[0.90,0.22],[0.86,0.32],[0.84,0.42],[0.80,0.52],[0.82,0.66],[0.84,0.80],[0.80,0.82],[0.74,0.68],[0.66,0.68],[0.58,0.72],[0.50,0.78],[0.46,0.92],[0.40,0.80],[0.32,0.74],[0.22,0.72],[0.14,0.64],[0.08,0.56],[0.03,0.40],[0.00,0.24]];
const mapMat = paper('#8d78e8', { emissive: P.cyan, emissiveIntensity: 0 });
{ const sh = new THREE.Shape(); US.forEach(([u, v], i) => { const x = (u - 0.5) * MAP.w, y = -(v - 0.5) * MAP.d; if (i) sh.lineTo(x, y); else sh.moveTo(x, y); }); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); const m = new THREE.Mesh(geo, [mapMat, paper(P.edge)]); m.position.set(MAP.x, DESK, MAP.z); m.castShadow = true; m.receiveShadow = true; scene.add(m); }
const devices = []; { const mk = (x, z, kind) => { const g = new THREE.Group(); g.position.set(MAP.x + x, DESK + 0.06, MAP.z + z); scene.add(g);
    if (kind === 'laptop') { const b = card(0.62, 0.04, 0.42, P.lav, P.white); b.position.y = 0.02; g.add(b); const l = card(0.62, 0.42, 0.03, P.navy2, P.lav, 'z'); l.position.set(0, 0.23, -0.2); l.rotation.x = -0.25; g.add(l);
      const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.34), new THREE.MeshBasicMaterial({ color: '#7c8cff' })); sc.position.set(0, 0.23, -0.18); sc.rotation.x = -0.25; g.add(sc); }
    else { const b = card(0.24, 0.46, 0.03, kind === 'ios' ? '#2a2f72' : P.navy2, P.lav, 'z'); b.position.y = 0.25; b.rotation.x = -0.15; g.add(b); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.4), new THREE.MeshBasicMaterial({ color: '#7c8cff' })); sc.position.set(0, 0.25, 0.018); sc.rotation.x = -0.15; g.add(sc);
      const cam = kind === 'ios' ? card(0.07, 0.025, 0.005, '#0d1240', '#0d1240', 'z') : new THREE.Mesh(new THREE.CircleGeometry(0.014, 12), new THREE.MeshBasicMaterial({ color: '#0d1240' })); cam.position.set(0, 0.43, 0.022); cam.rotation.x = -0.15; g.add(cam); }
    devices.push(g); };
  mk(-0.7, 0.05, 'laptop'); mk(0.1, 0.12, 'android'); mk(0.6, 0.08, 'ios'); }
const piTog = new THREE.Group(); piTog.position.set(MAP.x, DESK, MAP.z + 1.15); scene.add(piTog);
const piCv = document.createElement('canvas'); piCv.width = 420; piCv.height = 150; const pig = piCv.getContext('2d'); const piTex = new THREE.CanvasTexture(piCv); piTex.colorSpace = THREE.SRGBColorSpace;
{ const face = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: piTex, emissive: '#ffffff', emissiveMap: piTex, emissiveIntensity: 0.3, roughness: 0.9 }), paper('#cfc8ff')]); face.position.y = 0.3; face.rotation.x = -0.35; face.castShadow = true; piTog.add(face);
  const foot = card(1.1, 0.03, 0.35, '#cfc8ff', P.white); foot.position.y = 0.015; piTog.add(foot); }
let piKey = '';
function drawPI(on) { const key = String(Math.round(on * 20)); if (key === piKey) return; piKey = key; const g = pig; g.fillStyle = '#f3f1ff'; rr(g, 0, 0, 420, 150, 24); g.fill();
  gSpark(g, 58, 75, 34, '#7c3fda'); g.fillStyle = on > 0.5 ? P.cyan : '#9d9bbd'; rr(g, 260, 40, 130, 70, 35); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(lerp(295, 355, on), 75, 27, 0, Math.PI * 2); g.fill();
  g.fillStyle = P.ink; g.font = '700 30px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Personal', 104, 56); g.fillText('Intelligence', 104, 94); piTex.needsUpdate = true; }

// a paper pointer that taps the field, then the suggestion (the demo)
const pointer = new THREE.Group(); win.add(pointer);
{ const sh = new THREE.Shape(); [[0, 0], [0, -0.3], [0.075, -0.23], [0.13, -0.34], [0.17, -0.32], [0.115, -0.21], [0.21, -0.21]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false }), [paper('#ffffff'), paper(P.ink)]); m.castShadow = true; pointer.add(m); }
const scrLocal = (cx, cy) => V3((cx / 960 - 0.5) * WIN.w, WIN.y + (0.5 - cy / 700) * WIN.h, 0.12);
// ------------------------------------------------------------------ the Media Diet paper sign (signature, CTA shot — accepted prop)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.3, DESK, 4.3);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const SHOTS = {
  S1: (t) => { const u = prog(t, 0, 2.32); return SH(L3([-0.15, 2.0, 5.1], [-0.15, 1.9, 4.7], u), V3(-0.15, 1.05, 0.1), 50); },
  S2: (t) => { const u = prog(t, 2.32, 5.0); return SH(L3([-1.5, 1.45, 2.0], [-1.55, 1.4, 1.75], u), V3(-2.05, 0.82, -1.35), 50); },
  S3: (t) => { const u = prog(t, 5.0, 10.35); return SH(L3([1.55, 2.35, 4.6], [1.35, 2.4, 4.3], u), V3(-0.05, 1.05, 0.05), 50); },
  S4: (t) => { const u = prog(t, 10.35, 13.8); return SH(L3([-0.85, 1.8, 4.75], [-0.85, 1.75, 4.5], u), V3(-0.85, 0.95, 1.3), 48); },
  S5: (t) => { const u = prog(t, 13.8, 18.21); return SH(L3([0.62, 1.3, 3.75], [0.6, 1.28, 3.5], u), V3(0.55, 1.05, -0.8), 46); },
  S6: (t) => { const u = prog(t, 18.21, 24.67); return SH(L3([3.45, 3.3, 7.6], [3.45, 3.1, 7.3], u), V3(3.45, 0.35, 2.8), 48); },
  S7: (t) => { const u = prog(t, 24.67, 26.66); return SH(L3([0.6, 1.38, 3.6], [0.6, 1.36, 3.45], u), V3(0.55, 1.2, -0.8), 46); },
  S8: (t) => { const u = prog(t, 26.66, 29.6); return SH(L3([0.6, 3.1, 10.2], [0.7, 4.0, 11.3], u), L3([0.4, 0.7, 0.8], [0.4, 0.75, 0.5], u), 48, lerp(5.95, 7.1, u)); },
};

// ------------------------------------------------------------------ per-frame update
const _q = new THREE.Quaternion();
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;

  // envelopes: riffle up and fall back while someone digs (hook), then rest in a neat stack
  envelopes.forEach((m, i) => { const base = V3((i % 2 ? 0.08 : -0.08) + (i - 4.5) * 0.02, 0.1 + i * 0.016, (i - 4.5) * 0.06); let lift = 0, tilt = -1.25;
    if (t < 2.4) { const ph = ((t * 1.6 + i * 0.37) % 1); lift = Math.sin(Math.PI * ph) * (0.45 + 0.05 * (i % 3)); tilt = -1.25 + Math.sin(Math.PI * ph) * 1.0; }
    m.position.copy(base).add(V3(0, lift, 0)); m.rotation.set(tilt, (i % 3 - 1) * 0.15, (i - 4.5) * 0.03); });
  { lens.visible = id === 'S1'; const a = t * 2.1; lens.position.set(INBOX.x + Math.sin(a) * 0.45, DESK + 0.95 + Math.sin(a * 1.7) * 0.08, INBOX.z + 0.15 + Math.cos(a) * 0.2); lens.quaternion.copy(camera.quaternion); }
  // browser form state
  let ws;
  if (id === 'S7' || (t >= 24.67 && t < 26.66)) ws = { mode: 'settings', on: t < E.ctrlOff ? 1 : t < E.ctrlOn ? 1 - prog(t, E.ctrlOff, E.ctrlOff + 0.2) : prog(t, E.ctrlOn, E.ctrlOn + 0.2), chk: 1 };
  else if (t < E.arrive) ws = { mode: 'form', focus: t < 2.4, t, sugg: 0, fill: 0 };
  else if (t < E.tap) ws = id === 'S5' ? { mode: 'form', focus: false, t, sugg: 0, fill: 0 } : { mode: 'form', focus: true, t, sugg: prog(t, E.arrive, E.arrive + 0.35), fill: 0 };
  else ws = { mode: 'form', focus: true, t, sugg: t < E.tap + 0.1 ? 0 : prog(t, E.suggest, E.suggest + 0.35), fill: t >= E.fill ? 0.5 + prog(t, E.fill, E.fill + 0.35) * 0.5 : 0 };
  if (t >= 26.66) ws = { mode: 'form', focus: false, t, sugg: 0, fill: 1 };
  drawWindow(ws);
  { const show = id === 'S5'; pointer.visible = show; if (show) { const pOff = scrLocal(900, 690), pField = scrLocal(470, 520), pSug = scrLocal(470, 618);
      const p = t < E.tap ? pOff.clone().lerp(pField, prog(t, 13.85, E.tap)) : t < E.fill - 0.35 ? pField : pField.clone().lerp(pSug, prog(t, E.fill - 0.35, E.fill - 0.05));
      const click = Math.max(Math.sin(Math.PI * clamp((t - E.tap) / 0.2)), Math.sin(Math.PI * clamp((t - E.fill + 0.05) / 0.2))); pointer.position.copy(p).add(V3(0, 0, 0.06 * (1 - click))); pointer.scale.setScalar(1 - 0.12 * click); } }
  // calendar 26 → 27 → 28, the source placard hinges up
  calPages.forEach((h, i) => { if (i === 0) return; const k = 2 - i; const u = prog(t, E.calFlip + k * 0.45, E.calFlip + k * 0.45 + 0.43); h.rotation.x = lerp(-0.18, 0.5 - Math.PI * 2, u); });
  { const u = prog(t, E.source, E.source + 0.45, outBack); srcHinge.rotation.x = -Math.PI / 2 * (1 - clamp(u, 0, 1.2)); }
  // the rail and the detail card: from the opened email into the form
  { if (rail) { scene.remove(rail); rail.geometry.dispose(); rail = null; } inbox.updateMatrixWorld(true); win.updateMatrixWorld(true);
    const a = inbox.localToWorld(V3(0, 0.75, 0)), b = win.localToWorld(V3(-0.2, WIN.y - 0.2, 0.1)); const curve = new THREE.QuadraticBezierCurve3(a, a.clone().lerp(b, 0.5).add(V3(0, 1.0, 0)), b);
    const draw = prog(t, E.open, E.open + 0.6); if ((id === 'S3' || id === 'S4') && draw > 0) { const g = new THREE.TubeGeometry(curve, 48, 0.016, 6, false); g.setDrawRange(0, Math.floor(g.index.count * draw / 3) * 3); rail = new THREE.Mesh(g, railMat); scene.add(rail); }
    const u = prog(t, E.travel, E.arrive); detail.visible = t >= E.open && t < E.arrive + 0.15 && id === 'S3'; if (detail.visible) { const p = t < E.travel ? a.clone().add(V3(0, 0.25 * prog(t, E.open, E.travel, outBack), 0)) : curve.getPoint(u); detail.position.copy(p); detail.quaternion.copy(camera.quaternion); detail.scale.setScalar(1 - 0.5 * prog(t, E.arrive - 0.2, E.arrive + 0.15)); } }
  // example tickets pop up out of the inbox on their words
  tickets.forEach((g, i) => { const s = prog(t, E.tickets[i], E.tickets[i] + 0.35, outBack) * (t < 13.8 ? 1 : 0); g.visible = s > 0.01; g.position.set(INBOX.x - 0.48 + i * 0.48, DESK + 0.85 + Math.sin(Math.PI * clamp((t - E.tickets[i]) / 0.5)) * 0.08, INBOX.z + 0.05); g.scale.setScalar(Math.max(0.01, s) * 0.88); g.rotation.y = 0.12 + (i - 1) * 0.08; });
  // U.S. map lights up, devices pop, Personal Intelligence switches on
  mapMat.emissiveIntensity = 0.55 * prog(t, E.map, E.map + 0.5);
  devices.forEach((d, i) => { const s = prog(t, E.devices + i * 0.25, E.devices + i * 0.25 + 0.35, outBack); d.scale.setScalar(Math.max(0.01, s)); d.visible = s > 0.01; });
  drawPI(prog(t, E.pi, E.pi + 0.25));
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
