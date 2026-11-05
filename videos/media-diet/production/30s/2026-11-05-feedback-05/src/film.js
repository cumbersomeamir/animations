// Media Diet · 30 s Hindi episode (feedback-05) — Android screen-share privacy now covers Chrome (rollout from 14 Oct 2026)
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted feedback-round film.js (via the
// accepted hindi-03/hindi-04 builds): a paper miniature in Media Diet brand colours — laminated cards with visible edges,
// paper grain, real cast shadows, hinged props, one camera set-up per beat, restrained depth of field. Hindi captions in
// Noto Sans Devanagari (accepted treatment). Deterministic: window.render(frame); window.TEXTS() for QA.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const TL = await (await fetch('./timeline.json')).json();
const CUES = await (await fetch('./data/cues.json')).json();
const E = TL.events; const W = TL.width, H = TL.height, FPS = TL.fps;
await Promise.all(['700 50px "Space Grotesk"', '600 28px Inter', '600 26px "Plex Mono"'].map((f) => document.fonts.load(f)));
await Promise.all([document.fonts.load('700 48px "Noto Sans Devanagari"', 'हिंदी अक्टूबर 26'), document.fonts.load('700 48px "Noto Sans Devanagari"', '0123456789.,?')]);
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
const CAPF = `700 48px ${DEV}`;   // Devanagari needs more line room than Latin: baselines 406/480 (ink stays inside y 340–520)
function captions(t) {
  const c = CUES.find((q) => t >= q.in && t < q.out); if (!c) return; const a = clamp((t - c.in) / 0.1);
  const gr = og.createLinearGradient(0, 300, 0, 560); gr.addColorStop(0, 'rgba(4,6,30,0)'); gr.addColorStop(0.3, 'rgba(4,6,30,0.5)'); gr.addColorStop(0.75, 'rgba(4,6,30,0.5)'); gr.addColorStop(1, 'rgba(4,6,30,0)');
  og.save(); og.globalAlpha = a; og.fillStyle = gr; og.fillRect(0, 300, W, 260); og.restore();
  if (c.lines.length === 1) otext(c.lines[0], 540, 446, { alpha: a, kind: 'caption', font: CAPF });
  else { otext(c.lines[0], 540, 406, { alpha: a, kind: 'caption', font: CAPF }); otext(c.lines[1], 540, 480, { alpha: a, kind: 'caption', font: CAPF }); }
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


// ------------------------------------------------------------------ desk calendar (accepted prop; pages hinge over to 14 अक्टूबर)
const CAL = { x: -2.8, z: -1.35 };
const cal = new THREE.Group(); cal.position.set(CAL.x, DESK, CAL.z); cal.rotation.y = 0.3; scene.add(cal);
{ const base = card(1.25, 0.12, 0.7, P.violet, P.edge); base.position.y = 0.06; cal.add(base);
  const back = card(1.2, 1.35, 0.05, P.violet2, P.edge, 'z'); back.position.set(0, 0.78, -0.18); back.rotation.x = -0.18; cal.add(back);
  for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 16), paper(P.white)); ring.position.set(-0.3 + i * 0.6, 1.43, -0.27); cal.add(ring); } }
const calPages = [12, 13, 14].map((d, i) => { const hinge = new THREE.Group(); hinge.position.set(0, 1.42, -0.235 + (2 - i) * 0.004); hinge.rotation.x = -0.18; cal.add(hinge);
  const tex = canvasTex(400, 440, (g, w, h) => { g.fillStyle = '#f3f1ff'; g.fillRect(0, 0, w, h); g.fillStyle = P.magenta; g.fillRect(0, 0, w, 96); g.fillStyle = '#ffffff'; g.font = `700 54px ${DEV}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('अक्टूबर', w / 2, 52);
    g.fillStyle = P.ink; g.font = '700 210px "Space Grotesk"'; g.fillText(String(d), w / 2, 270); g.fillStyle = '#9d8cf0'; g.fillRect(60, 400, w - 120, 6); });
  const pg = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.24, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#e6e2ff')]);
  pg.position.set(0, -0.64, 0); pg.castShadow = true; hinge.add(pg); return hinge; }).reverse();   // [14, 13, 12]: 12 on top

// ------------------------------------------------------------------ the web page (generic login / payment page; no brand UI) drawn into a box
function drawPage(g, x, y, w, h, s) {
  g.save(); g.translate(x, y); const u = w / 100;   // page units: 100 wide
  g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 6 * u); g.fill();
  g.fillStyle = '#d9d2ff'; rr(g, 6 * u, 5 * u, 88 * u, 9 * u, 4.5 * u); g.fill();   // address pill
  g.fillStyle = '#2a2f72'; g.fillRect(11 * u, 8 * u, 4 * u, 4 * u); g.beginPath(); g.arc(13 * u, 8 * u, 2 * u, Math.PI, 0); g.lineWidth = u; g.strokeStyle = '#2a2f72'; g.stroke();
  g.fillStyle = '#9d8cf0'; rr(g, 19 * u, 8.5 * u, 50 * u, 2.5 * u, u); g.fill();
  if (s.page === 'pay') {
    const cg = g.createLinearGradient(10 * u, 0, 90 * u, 0); cg.addColorStop(0, '#552dbc'); cg.addColorStop(1, '#2addfa'); g.fillStyle = cg; rr(g, 10 * u, 0.2 * h, 80 * u, 0.24 * h, 5 * u); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.85)'; rr(g, 16 * u, 0.25 * h, 14 * u, 0.05 * h, 2 * u); g.fill();
    for (const [yy, n, k] of [[0.52, 16, s.dots], [0.66, 3, s.dots2 ?? 0]]) { g.fillStyle = '#ffffff'; rr(g, 8 * u, yy * h, 84 * u, 0.09 * h, 3 * u); g.fill(); g.strokeStyle = '#9d8cf0'; g.lineWidth = 0.8 * u; g.stroke();
      const m = Math.round(n * clamp(k)); g.fillStyle = P.ink; for (let i = 0; i < m; i++) { g.beginPath(); g.arc(13 * u + i * (n > 4 ? 4.6 : 6) * u, (yy + 0.045) * h, 1.5 * u, 0, Math.PI * 2); g.fill(); } }
    g.fillStyle = P.magenta; rr(g, 8 * u, 0.8 * h, 84 * u, 0.09 * h, 4 * u); g.fill();
  } else {
    g.fillStyle = '#7c3fda'; g.beginPath(); g.arc(50 * u, 0.25 * h, 10 * u, 0, Math.PI * 2); g.fill(); gPerson(g, 50 * u, 0.25 * h + u, 0.22 * u, '#ffffff');
    g.fillStyle = '#9d8cf0'; rr(g, 30 * u, 0.36 * h, 40 * u, 0.025 * h, u); g.fill();
    g.fillStyle = '#ffffff'; rr(g, 8 * u, 0.44 * h, 84 * u, 0.09 * h, 3 * u); g.fill(); g.strokeStyle = '#9d8cf0'; g.lineWidth = 0.8 * u; g.stroke();
    g.fillStyle = '#2a2f72'; rr(g, 13 * u, 0.475 * h, 34 * u, 0.025 * h, u); g.fill();
    g.fillStyle = '#ffffff'; rr(g, 8 * u, 0.58 * h, 84 * u, 0.09 * h, 3 * u); g.fill(); g.strokeStyle = s.focus ? P.cyan : '#9d8cf0'; g.lineWidth = (s.focus ? 1.6 : 0.8) * u; g.stroke();
    const m = Math.round(8 * clamp(s.dots)); g.fillStyle = P.ink; for (let i = 0; i < m; i++) { g.beginPath(); g.arc(14 * u + i * 6 * u, 0.625 * h, 1.8 * u, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = P.magenta; rr(g, 8 * u, 0.74 * h, 84 * u, 0.09 * h, 4 * u); g.fill();
  }
  g.restore();
}
const LOGIN_BOX = [0.06, 0.42, 0.94, 0.69], PAY_BOX = [0.06, 0.17, 0.94, 0.91];   // regions (page fractions) that Android blanks for the viewer

// ------------------------------------------------------------------ the user's phone (standing paper phone, printed + redrawn screen)
const PH = { w: 0.9, h: 1.75, d: 0.07 };
const PHN = { x: -0.6, z: 1.4, r: 0.15 };
const phone = new THREE.Group(); phone.position.set(PHN.x, DESK, PHN.z); phone.rotation.y = PHN.r; scene.add(phone);
const pcv = document.createElement('canvas'); pcv.width = 360; pcv.height = 700; const pg2 = pcv.getContext('2d'); const pTex = new THREE.CanvasTexture(pcv); pTex.colorSpace = THREE.SRGBColorSpace; pTex.anisotropy = 8;
const pBody = new THREE.Group(); pBody.position.y = 0.06; pBody.rotation.x = -0.08; phone.add(pBody);
{ const body = card(PH.w, PH.h, PH.d, P.navy2, P.lav, 'z'); body.position.y = PH.h / 2; pBody.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(PH.w - 0.08, PH.h - 0.1), new THREE.MeshStandardMaterial({ map: pTex, emissive: '#ffffff', emissiveMap: pTex, emissiveIntensity: 0.6, roughness: 0.85 }));
  screen.position.set(0, PH.h / 2, PH.d / 2 + 0.002); pBody.add(screen);
  const clip = card(0.62, 0.08, 0.4, P.lav, P.white, 'y'); clip.position.y = 0.04; phone.add(clip);
  const lip = card(0.62, 0.14, 0.02, P.lav, P.white, 'z'); lip.position.set(0, 0.08, 0.14); phone.add(lip); }
let pKey = '';
function drawPhone(s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 30) / 30 : v)); if (key === pKey) return; pKey = key;
  const g = pg2, W2 = 360, H2 = 700; const bg = g.createLinearGradient(0, 0, 0, H2); bg.addColorStop(0, '#1d2470'); bg.addColorStop(1, '#10154b'); g.fillStyle = bg; g.fillRect(0, 0, W2, H2);
  g.fillStyle = 'rgba(233,229,255,0.35)'; rr(g, 130, 16, 100, 14, 7); g.fill();
  if (s.share) { g.fillStyle = P.magenta; rr(g, 16, 40, 128, 34, 17); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(36, 57, 7, 0, Math.PI * 2); g.fill(); g.fillRect(52, 52, 74, 10); }   // "sharing" pill (glyph only)
  if (s.mode === 'page') drawPage(g, 16, 86, 328, 590, s);
  else if (s.mode === 'settings') {
    const k = s.k ?? 0; const page2 = k >= 2;
    g.fillStyle = '#e9e5ff'; rr(g, 16, 86, 328, 590, 22); g.fill();
    if (!page2) { gGear(g, 60, 128, 0.62, '#2a2f72'); g.fillStyle = '#2a2f72'; rr(g, 96, 120, 150, 16, 8); g.fill();
      for (let i = 0; i < 5; i++) { const y = 176 + i * 92, hi = i === 4 && k >= 1; g.fillStyle = hi ? P.cyan : '#d9d2ff'; rr(g, 32, y, 296, 74, 16); g.fill();
        if (i === 4) { g.fillStyle = '#2a2f72'; rr(g, 52, y + 16, 24, 42, 5); g.fill(); g.fillStyle = hi ? P.cyan : '#d9d2ff'; g.fillRect(58, y + 26, 12, 22); g.fillStyle = '#2a2f72'; g.fillRect(62, y + 34, 4, 12); g.fillRect(62, y + 28, 4, 4); }
        else { g.fillStyle = '#9d8cf0'; g.beginPath(); g.arc(64, y + 37, 13, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = hi ? '#0d1240' : '#7a74b8'; rr(g, 96, y + 22, i === 4 ? 150 : 120 - i * 8, 14, 7); g.fill(); rr(g, 96, y + 44, 90, 10, 5); g.fill(); } }
    else { g.fillStyle = '#2a2f72'; rr(g, 52, 112, 24, 42, 5); g.fill(); g.fillStyle = '#e9e5ff'; g.fillRect(58, 122, 12, 22); g.fillStyle = '#2a2f72'; g.fillRect(62, 130, 4, 12); g.fillRect(62, 124, 4, 4); rr(g, 96, 120, 150, 16, 8); g.fill();
      for (let i = 0; i < 4; i++) { const y = 176 + i * 92, hi = i === 1 && k >= 2.4; g.fillStyle = hi ? P.cyan : '#d9d2ff'; rr(g, 32, y, 296, 74, 16); g.fill(); g.fillStyle = hi ? '#0d1240' : '#7a74b8'; rr(g, 56, y + 18, 130 - i * 10, 14, 7); g.fill();
        if (i === 1) { g.fillStyle = hi ? '#0d1240' : '#2a2f72'; g.font = '700 40px "Space Grotesk"'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText('15', 306, y + 40); } else { rr(g, 56, y + 42, 80, 10, 5); g.fill(); } }
      const a = clamp((k - 2.6) / 0.4); if (a > 0) { g.save(); g.globalAlpha = a; g.fillStyle = '#ffffff'; rr(g, 60, 556, 240, 100, 24); g.fill(); g.fillStyle = P.ink; g.font = '700 70px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('15', 150, 608); g.restore(); sCheck(g, 252, 606, 32, a); } }
  }
  pTex.needsUpdate = true;
}

// ------------------------------------------------------------------ the viewer's monitor (screen-share copy) + paper shutters that blank sensitive parts
const MON = { x: 0.65, z: -0.9, r: -0.1 }; const SCR = { w: 2.12, h: 1.32, y: 1.25 };
const mon = new THREE.Group(); mon.position.set(MON.x, DESK, MON.z); mon.rotation.y = MON.r; scene.add(mon);
const mcv = document.createElement('canvas'); mcv.width = 640; mcv.height = 400; const mg = mcv.getContext('2d'); const mTex = new THREE.CanvasTexture(mcv); mTex.colorSpace = THREE.SRGBColorSpace; mTex.anisotropy = 8;
{ const base = card(0.9, 0.06, 0.55, P.violet, P.edge); base.position.y = 0.03; mon.add(base);
  const neck = card(0.14, 0.5, 0.08, P.violet2, P.edge, 'z'); neck.position.set(0, 0.3, -0.05); mon.add(neck);
  const frame = card(SCR.w + 0.16, SCR.h + 0.16, 0.08, P.navy2, P.lav, 'z'); frame.position.set(0, SCR.y, 0); mon.add(frame);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCR.w, SCR.h), new THREE.MeshStandardMaterial({ map: mTex, emissive: '#ffffff', emissiveMap: mTex, emissiveIntensity: 0.6, roughness: 0.85 }));
  screen.position.set(0, SCR.y, 0.042); mon.add(screen); }
const PANEL = { x: 222, y: 52, w: 196, h: 336 };   // the phone's mirrored page inside the monitor canvas
const mLocal = (cx, cy) => [(cx / 640 - 0.5) * SCR.w, SCR.y + (0.5 - cy / 400) * SCR.h];
let mKey = '';
function drawMonitor(s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 30) / 30 : v)); if (key === mKey) return; mKey = key;
  const g = mg; g.fillStyle = '#141a52'; g.fillRect(0, 0, 640, 400); g.fillStyle = '#24287e'; g.fillRect(0, 0, 640, 36);
  g.fillStyle = P.magenta; g.beginPath(); g.arc(24, 18, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = '#c9bfff'; rr(g, 40, 12, 90, 12, 6); g.fill();
  g.fillStyle = '#0d1240'; rr(g, PANEL.x - 8, PANEL.y - 8, PANEL.w + 16, PANEL.h + 16, 16); g.fill();
  drawPage(g, PANEL.x, PANEL.y, PANEL.w, PANEL.h, s);
  g.fillStyle = 'rgba(201,191,255,0.25)'; for (const x of [40, 470]) { rr(g, x, 70, 130, 90, 12); g.fill(); rr(g, x, 180, 130, 90, 12); g.fill(); }
  mTex.needsUpdate = true;
}
function shutter(box) { const [x0, y0, x1, y1] = box; const [lx0, ly0] = mLocal(PANEL.x + x0 * PANEL.w, PANEL.y + y0 * PANEL.h), [lx1, ly1] = mLocal(PANEL.x + x1 * PANEL.w, PANEL.y + y1 * PANEL.h);
  const w = lx1 - lx0, h = ly0 - ly1; const tex = canvasTex(128, Math.max(32, Math.round(128 * h / w)), (g, cw, ch) => { g.fillStyle = '#5a5e8a'; g.fillRect(0, 0, cw, ch); g.strokeStyle = 'rgba(201,191,255,0.25)'; g.lineWidth = 4; for (let i = -ch; i < cw; i += 18) { g.beginPath(); g.moveTo(i, ch); g.lineTo(i + ch, 0); g.stroke(); } });
  const pivot = new THREE.Group(); pivot.position.set((lx0 + lx1) / 2, ly0, 0.06); mon.add(pivot);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, h + 0.02, 0.012), [paper(P.lav), paper(P.lav), paper(P.lav), paper(P.lav), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), paper('#5a5e8a')]); m.position.y = -(h + 0.02) / 2; m.castShadow = true; pivot.add(m); return pivot; }
const shutLogin = shutter(LOGIN_BOX), shutPay = shutter(PAY_BOX);

// ------------------------------------------------------------------ the screen-share stream (paper packets riding a cyan thread) and the watching eye
const shareMat = new THREE.MeshBasicMaterial({ color: P.cyan }); let shareTube = null;
const packets = []; for (let i = 0; i < 6; i++) { const m = card(0.1, 0.07, 0.02, '#f3f1ff', P.white, 'z'); scene.add(m); packets.push(m); }
const eye = new THREE.Group(); eye.position.set(0.62, SCR.y + SCR.h / 2 + 0.36, 0.02); mon.add(eye);   // perched on the viewer's monitor like a webcam
const eyeHead = new THREE.Group(); eye.add(eyeHead);
let pupil, iris, lid;
{ const clip = card(0.34, 0.08, 0.2, P.violet2, P.edge); clip.position.y = -0.33; eye.add(clip);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 40, 28), paper('#f6f4ff')); ball.castShadow = true; eyeHead.add(ball);
  iris = new THREE.Mesh(new THREE.CircleGeometry(0.175, 36), paper('#2fb8d6', { emissive: '#2fb8d6', emissiveIntensity: 0.55 })); iris.position.z = 0.318; eyeHead.add(iris);
  pupil = new THREE.Mesh(new THREE.CircleGeometry(0.085, 28), new THREE.MeshStandardMaterial({ color: P.ink, roughness: 0.6 })); pupil.position.z = 0.322; eyeHead.add(pupil);
  lid = new THREE.Mesh(new THREE.SphereGeometry(0.335, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), paper('#d23d7c', { side: THREE.DoubleSide })); lid.castShadow = true; eyeHead.add(lid); }
// ------------------------------------------------------------------ the protection shield (generic paper sticker, no Android logo)
const shieldShape = (() => { const s = new THREE.Shape(); s.moveTo(0, 0.26); s.lineTo(0.21, 0.18); s.lineTo(0.19, -0.02); s.quadraticCurveTo(0.14, -0.2, 0, -0.28); s.quadraticCurveTo(-0.14, -0.2, -0.19, -0.02); s.lineTo(-0.21, 0.18); s.closePath(); return s; })();
function shieldMesh(scale = 1) { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shieldShape, { depth: 0.04, bevelEnabled: false }), [paper(P.cyan), paper('#c8f6ff')]); m.castShadow = true; g.add(m);
  const ck = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (c) => { c.clearRect(0, 0, 128, 128); c.strokeStyle = '#0d1240'; c.lineWidth = 16; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(32, 66); c.lineTo(56, 90); c.lineTo(98, 42); c.stroke(); }), transparent: true }));
  ck.position.z = 0.042; g.add(ck); g.scale.setScalar(scale); scene.add(g); return g; }
const badge = shieldMesh(1.0);

// ------------------------------------------------------------------ version blocks 13–17 (15 and above get it)
const BLK = { x0: -4.28, z: 3.3, step: 0.64 };
const blocks = [13, 14, 15, 16, 17].map((v, i) => { const ok = v >= 15; const g = new THREE.Group(); g.position.set(BLK.x0 + i * BLK.step, DESK, BLK.z); scene.add(g);
  const tex = canvasTex(160, 160, (c, w, h) => { c.fillStyle = ok ? '#f3f1ff' : '#b9b4dc'; c.fillRect(0, 0, w, h); c.fillStyle = P.ink; c.font = '700 96px "Space Grotesk"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(v), w / 2, h / 2 + 6); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.28), [paper(ok ? P.violet : '#4a4f86'), paper(ok ? P.violet : '#4a4f86'), paper(ok ? P.violet2 : '#5a5e8a'), paper(P.navy2), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.2, roughness: 0.9 }), paper(P.violet)]);
  m.position.y = 0.29; m.castShadow = true; g.add(m); const sh = ok ? shieldMesh(0.8) : null; return { g, m, ok, sh, i }; });
{ const shelf = card(BLK.step * 5 + 0.3, 0.05, 0.6, P.lav, P.white); shelf.position.set(BLK.x0 + BLK.step * 2, DESK + 0.0, BLK.z); scene.add(shelf); }

// the question tag (accepted prop)
const qTag = new THREE.Group(); { const tex = canvasTex(160, 200, (g, w, h) => { g.fillStyle = P.magenta; g.beginPath(); g.arc(80, 80, 72, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.font = '700 110px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 80, 86); });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.45, 0.012), [paper('#ffd1e4'), paper('#ffd1e4'), paper('#ffd1e4'), paper('#ffd1e4'), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5 }), paper(P.magenta)]);
  m.castShadow = true; qTag.add(m); const st = card(0.015, 0.3, 0.015, P.white, P.white, 'x'); st.position.y = -0.3; qTag.add(st); }
scene.add(qTag);

// ------------------------------------------------------------------ the Media Diet paper sign (signature, CTA shot — accepted prop)
const sign = new THREE.Group(); scene.add(sign);
{ const tex = canvasTex(1024, 300, (g, w, h) => { g.fillStyle = '#efecff'; g.fillRect(0, 0, w, h); g.drawImage(iconImg, 40, 40, 220, 220); g.fillStyle = P.ink; g.font = '700 118px "Space Grotesk"'; g.textBaseline = 'middle'; g.fillText('Media Diet', 300, 158); });
  const face = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.76, 0.03), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }), paper('#cfc8ff')]);
  face.position.y = 0.38; face.castShadow = true; const hinge = new THREE.Group(); hinge.add(face); sign.add(hinge); sign.userData.hinge = hinge;
  const foot = card(2.6, 0.03, 0.5, '#cfc8ff', P.white); foot.position.set(0, 0.015, 0.2); sign.add(foot); }
sign.position.set(0.15, DESK, 3.4);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const SHOTS = {
  S1: (t) => { const u = prog(t, 0, 3.56); return SH(L3([0.95, 2.05, 3.45], [0.95, 2.0, 3.05], u), V3(0.75, 1.98, -0.85), 46); },
  S2: (t) => { const u = prog(t, 3.56, 8.24), c = prog(t, 5.6, 6.3); return SH(L3([-1.3, 1.75, 3.6], [-1.1, 1.7, 3.8], u), L3([-2.65, 0.9, -1.25], [-0.6, 1.1, 1.35], c), 50); },
  S3: (t) => { const u = prog(t, 8.24, 13.92); return SH(L3([0.15, 2.05, 5.1], [0.1, 1.95, 4.7], u), V3(0.1, 1.15, -0.1), 52); },
  S4: (t) => { const u = prog(t, 13.92, 17.75); return SH(L3([1.15, 2.0, 3.0], [1.2, 1.98, 2.75], u), V3(0.98, 1.98, -0.85), 44); },
  S5: (t) => { const u = prog(t, 17.75, 21.64); return SH(L3([-3.0, 2.4, 8.6], [-3.0, 2.3, 8.3], u), V3(-3.0, 0.6, 3.3), 54); },
  S6: (t) => { const u = prog(t, 21.64, 25.95); return SH(L3([0.05, 1.3, 3.45], [-0.05, 1.25, 3.2], u), V3(-0.6, 0.98, 1.42), 42); },
  S7: (t) => { const u = prog(t, 25.95, 29.6); return SH(L3([0.45, 2.8, 9.2], [0.55, 3.8, 10.5], u), L3([0.25, 0.7, 0.4], [0.25, 0.75, 0.2], u), 48, lerp(5.9, 7.2, u)); },
};

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;

  // page state on both screens: before the protection the password shows; after it, the viewer's copy is shuttered
  const share = t < 21.64; let pageS;
  if (t < E.type1End + 0.6) pageS = { page: 'login', dots: prog(t, E.type1, E.type1End, (x) => x), focus: t >= E.type1 - 0.2 };
  else if (t < E.login2) pageS = { page: 'login', dots: t < E.shield ? 1 : 0, focus: false };
  else if (t < E.pay) pageS = { page: 'login', dots: prog(t, E.type2, E.type2 + 1.0, (x) => x), focus: t >= E.type2 - 0.1 };
  else pageS = { page: 'pay', dots: prog(t, E.pay + 0.35, E.pay + 1.6, (x) => x), dots2: prog(t, E.pay + 1.6, E.pay + 2.0, (x) => x) };
  if (t >= E.login2 - 0.3 && t < E.login2) pageS = { page: 'login', dots: 0, focus: false };
  if (id === 'S6') drawPhone({ mode: 'settings', share: false, k: E.steps.reduce((k, s) => k + prog(t, s, s + 0.3), 0) });
  else if (t >= 21.64) drawPhone({ mode: 'settings', share: false, k: 3 });
  else drawPhone({ mode: 'page', share, ...pageS });
  drawMonitor(share ? pageS : { page: 'login', dots: 0 });
  // shutters drop the instant a sensitive field is in use (after the protection arrives)
  { const a = prog(t, E.type2 - 0.05, E.type2 + 0.25, outBack) * (t < E.pay ? 1 : 1 - prog(t, E.pay - 0.05, E.pay + 0.05)); shutLogin.scale.y = Math.max(0.001, clamp(a, 0, 1.08)); shutLogin.visible = a > 0.01 && share;
    const b = prog(t, E.pay, E.pay + 0.3, outBack); shutPay.scale.y = Math.max(0.001, clamp(b, 0, 1.08)); shutPay.visible = b > 0.01 && share;
    const thud = Math.sin(Math.PI * clamp((t - E.auto) / 0.35)) * 0.04; shutLogin.position.z = 0.06 + thud; shutPay.position.z = 0.06 + thud; }
  // the stream: packets ride a thread from the phone to the monitor while sharing
  { if (shareTube) { scene.remove(shareTube); shareTube.geometry.dispose(); shareTube = null; }
    phone.updateMatrixWorld(true); mon.updateMatrixWorld(true);
    const a = pBody.localToWorld(V3(0, PH.h + 0.05, 0)), b = mon.localToWorld(V3(-SCR.w / 2 - 0.05, SCR.y + 0.3, 0)); const mid = a.clone().lerp(b, 0.5).add(V3(0, 0.75, 0));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    if (share && id !== 'S5') { shareTube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.014, 6, false), shareMat); scene.add(shareTube); }
    packets.forEach((p, i) => { const ph = ((t * 0.55 + i / packets.length) % 1); p.visible = share && id !== 'S5'; if (p.visible) { p.position.copy(curve.getPoint(ph)); p.quaternion.copy(camera.quaternion); } }); }
  // the eye: stares at the password (hook), then searches the blank panels
  { mon.updateMatrixWorld(true); let ox = 0, oy = 0;
    if (t < 3.56) { ox = 0; oy = -0.12 + 0.05 * prog(t, 0, 3.5); } else if (t >= E.search && t < 17.75) { const k = t - E.search; ox = 0.35 * Math.sin(k * 4.6); oy = 0.2 * Math.cos(k * 3.3); }
    eye.updateMatrixWorld(true); eyeHead.lookAt(mon.localToWorld(V3(-0.15 + ox * 1.6, SCR.y - 0.2 + oy * 1.6, 1.1)));
    const zoom = t < 3.56 ? 1 + 0.25 * prog(t, 0.6, 2.4) : 1; pupil.scale.setScalar(zoom);
    const blink = Math.max(Math.sin(Math.PI * clamp((t - 1.25) / 0.24)), Math.sin(Math.PI * clamp((t - E.lid + 0.25) / 0.24)));
    const half = prog(t, E.lid, E.lid + 0.3) * (t < 17.75 ? 1 : 0); const cov = Math.max(blink, 0.5 * half);
    lid.rotation.x = lerp(-2.0, 1.5, cov); }
  { const a = prog(t, E.query, E.query + 0.3, outBack); qTag.visible = id === 'S4' && a > 0.01; eye.updateMatrixWorld(true); qTag.position.copy(eye.localToWorld(V3(-0.6, -0.12, 0.12))); qTag.scale.setScalar(Math.max(0.01, a) * 1.2); qTag.rotation.y = -0.6; }
  // calendar: 12 → 13 → 14 अक्टूबर
  calPages.forEach((h, i) => { if (i === 0) return; const k = 2 - i; const u = prog(t, E.calFlip + k * 0.5, E.calFlip + k * 0.5 + 0.48); h.rotation.x = lerp(-0.18, 0.5 - Math.PI * 2, u); });
  // the protection arrives: shield drops onto the phone and stays
  { const u = prog(t, E.shield, E.shield + 0.5, outBack); badge.visible = t >= E.shield - 0.05; const pos = pBody.localToWorld(V3(PH.w / 2 - 0.08, PH.h - 0.05, PH.d / 2 + 0.03)); pBody.getWorldQuaternion(badge.quaternion);
    badge.position.copy(pos).add(V3(0, (1 - clamp(u, 0, 1)) * 1.4, 0)); const glow = Math.sin(Math.PI * clamp((t - E.auto) / 0.5)); badge.scale.setScalar(0.85 * (1 + 0.15 * glow)); }
  // version blocks: 15 and above rise and get a shield
  blocks.forEach((b) => { const k = b.ok ? b.i - 2 : 0; const u = b.ok ? prog(t, E.blocks + k * 0.28, E.blocks + k * 0.28 + 0.4, outBack) : 0; b.m.position.y = 0.26 + 0.32 * u; b.m.rotation.x = b.ok ? 0 : -0.18 * prog(t, E.blocks, E.blocks + 0.4);
    if (b.sh) { const s = prog(t, E.blocks + 0.5 + k * 0.28, E.blocks + 0.8 + k * 0.28, outBack); b.sh.visible = s > 0.01; b.sh.position.set(b.g.position.x, DESK + 1.2 + 0.32 * u, b.g.position.z + 0.05); b.sh.scale.setScalar(Math.max(0.01, s) * 0.75); b.sh.rotation.set(0, 0, 0); } });
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
