// Media Diet · 30 s Hindi episode (hindi-04) — Google Play Store (2 Nov 2026) now reminds you if Play Protect stays off
// Style recipe: LAYERED TECH CUTAWAY (context/11), renderer core unchanged from the accepted feedback-round film.js (via the
// accepted hindi-03 build): a paper miniature in Media Diet brand colours — laminated cards with visible edges, paper grain,
// real cast shadows, hinged props, one camera set-up per beat, restrained depth of field. Hindi captions in Noto Sans
// Devanagari (accepted hindi-03 caption treatment). Deterministic: window.render(frame); window.TEXTS() for QA.
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

// ------------------------------------------------------------------ desk calendar (accepted prop; pages hinge over to 2 नवंबर)
const CAL = { x: -2.35, z: -1.45 };
const cal = new THREE.Group(); cal.position.set(CAL.x, DESK, CAL.z); cal.rotation.y = 0.32; scene.add(cal);
{ const base = card(1.25, 0.12, 0.7, P.violet, P.edge); base.position.y = 0.06; cal.add(base);
  const back = card(1.2, 1.35, 0.05, P.violet2, P.edge, 'z'); back.position.set(0, 0.78, -0.18); back.rotation.x = -0.18; cal.add(back);
  for (let i = 0; i < 2; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 16), paper(P.white)); ring.position.set(-0.3 + i * 0.6, 1.43, -0.27); cal.add(ring); } }
const calPages = [[31, 'अक्टूबर'], [1, 'नवंबर'], [2, 'नवंबर']].map(([d, mon], i) => { const hinge = new THREE.Group(); hinge.position.set(0, 1.42, -0.235 + (2 - i) * 0.004); hinge.rotation.x = -0.18; cal.add(hinge);
  const tex = canvasTex(400, 440, (g, w, h) => { g.fillStyle = '#f3f1ff'; g.fillRect(0, 0, w, h); g.fillStyle = P.magenta; g.fillRect(0, 0, w, 96); g.fillStyle = '#ffffff'; g.font = `700 54px ${DEV}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(mon, w / 2, 52);
    g.fillStyle = P.ink; g.font = '700 210px "Space Grotesk"'; g.fillText(String(d), w / 2, 270); g.fillStyle = '#9d8cf0'; g.fillRect(60, 400, w - 120, 6); });
  const pg = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.24, 0.012), [paper(P.white), paper(P.white), paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25, roughness: 0.9 }), paper('#e6e2ff')]);
  pg.position.set(0, -0.64, 0); pg.castShadow = true; hinge.add(pg); return hinge; }).reverse();   // [2 Nov, 1 Nov, 31 Oct]: 31 Oct on top

// ------------------------------------------------------------------ the big paper phone lying on the desk (printed, redrawn screen)
const PHN = { w: 2.3, l: 4.4, h: 0.14 }; const TOP = DESK + PHN.h;
{ const body = card(PHN.w, PHN.h, PHN.l, P.navy2, P.lav, 'y'); body.position.set(0, DESK + PHN.h / 2, 0); scene.add(body);
  const lip = card(PHN.w + 0.06, 0.03, PHN.l + 0.06, P.violet, P.edge, 'y'); lip.position.set(0, DESK + 0.015, 0); scene.add(lip); }
const SW = 2.12, SL = 4.2, CW = 512, CH = 1014;
const scr = document.createElement('canvas'); scr.width = CW; scr.height = CH; const sg = scr.getContext('2d');
const scrTex = new THREE.CanvasTexture(scr); scrTex.colorSpace = THREE.SRGBColorSpace; scrTex.anisotropy = 8;
{ const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SL), new THREE.MeshStandardMaterial({ map: scrTex, emissive: '#ffffff', emissiveMap: scrTex, emissiveIntensity: 0.55, roughness: 0.85 }));
  screen.rotation.x = -Math.PI / 2; screen.position.set(0, TOP + 0.002, 0); screen.receiveShadow = true; scene.add(screen); }
const toCanvas = (x, z) => [(x / SW + 0.5) * CW, (z / SL + 0.5) * CH];
const SLOTS = []; for (const z of [-0.48, 0.1, 0.68]) for (const x of [-0.58, 0, 0.58]) SLOTS.push({ x, z });
const TOG = { x0: 0.0, x1: 0.5, z: 1.55 }, BADGE = { x: -0.62, z: 1.55 };
let lastKey = '';
function drawScreen(s) {
  const key = JSON.stringify(s, (k, v) => (typeof v === 'number' ? Math.round(v * 30) / 30 : v)); if (key === lastKey) return; lastKey = key;
  const g = sg; const bg = g.createLinearGradient(0, 0, 0, CH); bg.addColorStop(0, '#1d2470'); bg.addColorStop(1, '#10154b'); g.fillStyle = bg; g.fillRect(0, 0, CW, CH);
  g.fillStyle = 'rgba(233,229,255,0.35)'; rr(g, 196, 26, 120, 18, 9); g.fill();
  // app slots
  g.strokeStyle = 'rgba(169,163,230,0.28)'; g.lineWidth = 4; for (const sl of SLOTS) { const [cx, cy] = toCanvas(sl.x, sl.z); rr(g, cx - 50, cy - 50, 100, 100, 18); g.stroke(); }
  // update ring in the top zone
  if (s.up >= 0) { const [cx, cy] = toCanvas(0, -1.45); g.save(); g.translate(cx, cy); g.lineWidth = 16; g.strokeStyle = 'rgba(169,163,230,0.35)'; g.beginPath(); g.arc(0, 0, 92, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = P.cyan; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, 92, -Math.PI / 2, -Math.PI / 2 + Math.max(0.01, s.up) * Math.PI * 2); g.stroke(); g.restore();
    g.fillStyle = '#f3f1ff'; g.font = '700 60px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('53.9', cx, cy - 4); gBag(g, cx - 150, cy, 0.9, '#e9e5ff'); sCheck(g, cx + 150, cy, 34, s.ok ?? 0); }
  // Play Protect row: shield badge + switch track (the knob is a physical paper piece)
  { const [bx, by] = toCanvas(BADGE.x, BADGE.z); gShield(g, bx, by, 1.15, s.on > 0.5); const [tx0] = toCanvas(TOG.x0, 0), [tx1, ty] = toCanvas(TOG.x1, TOG.z);
    g.fillStyle = s.on > 0.5 ? P.cyan : '#4a4f86'; rr(g, tx0 - 48, ty - 44, tx1 - tx0 + 96, 88, 44); g.fill(); }
  scrTex.needsUpdate = true;
}
const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 32), [paper('#f3f1ff'), paper(P.white), paper(P.lav)]); knob.castShadow = true; scene.add(knob);

// ------------------------------------------------------------------ app tiles (paper cards with generic glyphs)
const TILE = 0.42;
function tileTex(kind, col) { return canvasTex(128, 128, (g, w, h) => { g.fillStyle = col; rr(g, 0, 0, w, h, 26); g.fill(); g.fillStyle = '#ffffff';
  if (kind === 0) { g.beginPath(); g.arc(64, 64, 30, 0, Math.PI * 2); g.fill(); } else if (kind === 1) { g.fillRect(36, 36, 56, 56); } else if (kind === 2) { g.beginPath(); g.moveTo(64, 30); g.lineTo(98, 94); g.lineTo(30, 94); g.closePath(); g.fill(); }
  else if (kind === 3) { for (let i = 0; i < 3; i++) g.fillRect(34, 38 + i * 20, 60 - i * 12, 10); } else if (kind === 4) { g.beginPath(); g.arc(50, 78, 16, 0, Math.PI * 2); g.fill(); g.fillRect(60, 30, 9, 50); g.fillRect(60, 30, 28, 9); } else { g.beginPath(); g.arc(64, 64, 32, 0, Math.PI * 1.5); g.lineTo(64, 64); g.fill(); } }); }
const tileCols = ['#2fb8d6', '#7c3fda', '#a359fa', '#3d46b5', '#5160d2', '#2a9fbf', '#8d78e8', '#24a0c8', '#552dbc'];
const tiles = tileCols.map((c, i) => { const tx = tileTex(i % 6, c); const top = new THREE.MeshStandardMaterial({ map: tx, emissive: '#ffffff', emissiveMap: tx, emissiveIntensity: 0.15, roughness: 0.9 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(TILE, 0.05, TILE), [paper(P.edge), paper(P.edge), top, paper(c), paper(P.edge), paper(P.edge)]); m.castShadow = true; m.receiveShadow = true; scene.add(m); return { m, top, base: top.map }; });
const BAD = 4; const badTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = P.magenta; rr(g, 0, 0, w, h, 26); g.fill(); gBug(g, 64, 66, 0.95); });
const offTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#5a5e8a'; rr(g, 0, 0, w, h, 26); g.fill(); g.globalAlpha = 0.45; gBug(g, 64, 66, 0.95); g.globalAlpha = 1; g.fillStyle = '#f3f1ff'; g.fillRect(44, 40, 14, 48); g.fillRect(70, 40, 14, 48); });

// ------------------------------------------------------------------ conveyor + shield gate (checks apps on install)
const BELT = { x0: 1.3, x1: 4.2, z: 0.68 };
const beltTex = canvasTex(512, 96, (g, w, h) => { g.fillStyle = '#2a2f72'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(201,191,255,0.55)'; g.lineWidth = 8; for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x + 40, 18); g.lineTo(x + 16, 48); g.lineTo(x + 40, 78); g.stroke(); } });
beltTex.wrapS = THREE.RepeatWrapping; beltTex.repeat.set(3, 1);
{ const belt = new THREE.Mesh(new THREE.BoxGeometry(BELT.x1 - BELT.x0, 0.06, 0.6), [paper(P.lav), paper(P.lav), new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.9 }), paper(P.navy), paper(P.lav), paper(P.lav)]);
  belt.position.set((BELT.x0 + BELT.x1) / 2, TOP - 0.03, BELT.z); belt.receiveShadow = true; scene.add(belt);
  for (const x of [BELT.x0 + 0.3, BELT.x1 - 0.3]) { const leg = card(0.1, TOP - 0.06, 0.5, P.violet, P.edge, 'x'); leg.position.set(x, (TOP - 0.06) / 2 + 0.0, BELT.z); scene.add(leg); } }
const GATE_X = 1.75;
{ for (const s of [-1, 1]) { const post = card(0.08, 0.85, 0.08, P.violet2, P.edge, 'x'); post.position.set(GATE_X, TOP + 0.42, BELT.z + s * 0.38); scene.add(post); }
  const bar = card(0.14, 0.12, 0.92, P.violet2, P.edge, 'y'); bar.position.set(GATE_X, TOP + 0.88, BELT.z); scene.add(bar);
  const emb = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.42, 0.42), [new THREE.MeshStandardMaterial({ map: canvasTex(128, 128, (g) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, 128, 128, 24); g.fill(); gShield(g, 64, 64, 1.05, true); }), roughness: 0.9 }), paper(P.white), paper(P.white), paper(P.white), paper(P.white), paper(P.white)]);
  emb.position.set(GATE_X + 0.08, TOP + 1.12, BELT.z); emb.castShadow = true; scene.add(emb); }
const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.8), new THREE.MeshBasicMaterial({ color: P.cyan, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
curtain.rotation.y = Math.PI / 2; curtain.position.set(GATE_X, TOP + 0.42, BELT.z); scene.add(curtain);
const NEW = [{ i: 8, t0: E.belt }, { i: 7, t0: E.belt + 0.8 }, { i: 6, t0: E.belt + 1.6 }];   // three new apps ride in and fill the bottom row
function newTilePos(n, t) { const sl = SLOTS[n.i]; const u = clamp((t - n.t0) / 1.0); if (t < n.t0) return null;
  if (u < 0.55) return V3(lerp(BELT.x1 - 0.25, GATE_X - 0.15, u / 0.55), TOP + 0.03, BELT.z);
  const v = (u - 0.55) / 0.45; return V3(lerp(GATE_X - 0.15, sl.x, ease(v)), TOP + 0.03 + Math.sin(Math.PI * v) * 0.35, lerp(BELT.z, sl.z, ease(v))); }

// ------------------------------------------------------------------ radar sweep (periodic scan) + ring pulse
const GRID_C = V3(0, TOP + 0.07, 0.1);
const radar = new THREE.Mesh(new THREE.CircleGeometry(1.15, 40, 0, 0.75), new THREE.MeshBasicMaterial({ color: P.cyan, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
radar.rotation.x = -Math.PI / 2; radar.position.copy(GRID_C); scene.add(radar);
const pulse = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 6, 72), new THREE.MeshBasicMaterial({ color: P.cyan, transparent: true, opacity: 0 })); pulse.rotation.x = Math.PI / 2; pulse.position.copy(GRID_C); scene.add(pulse);

// ------------------------------------------------------------------ warning tag, lock, paper bin
const warn = new THREE.Group(); { const s = new THREE.Shape(); s.moveTo(0, 0.26); s.lineTo(0.26, -0.2); s.lineTo(-0.26, -0.2); s.closePath();
  const tri = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false }), [paper('#ffb020'), paper('#ffe2a8')]); tri.castShadow = true; warn.add(tri);
  const ex = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (g) => { g.clearRect(0, 0, 128, 128); g.fillStyle = '#14163a'; g.font = '700 96px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', 64, 70); }), transparent: true }));
  ex.position.set(0, -0.02, 0.032); warn.add(ex); const st = card(0.02, 0.4, 0.02, P.white, P.white, 'x'); st.position.set(0, -0.4, 0.015); warn.add(st); }
scene.add(warn);
const BIN = { x: -1.85, z: 1.05 };
{ const g = new THREE.Group(); g.position.set(BIN.x, DESK, BIN.z); scene.add(g); const bot = card(0.62, 0.03, 0.62, P.violet, P.edge); bot.position.y = 0.015; g.add(bot);
  for (const [x, z, w, d, ax] of [[0, 0.3, 0.62, 0.03, 'z'], [0, -0.3, 0.62, 0.03, 'z'], [0.3, 0, 0.03, 0.62, 'x'], [-0.3, 0, 0.03, 0.62, 'x']]) { const wl = card(w, 0.5, d, '#8d78e8', P.white, ax); wl.position.set(x, 0.25, z); g.add(wl); } }

// ------------------------------------------------------------------ clock (time passes while the switch stays off)
const CLK = { x: 1.85, z: -1.75 };
const clock = new THREE.Group(); clock.position.set(CLK.x, DESK, CLK.z); clock.rotation.y = -0.45; scene.add(clock);
const hands = [];
{ const stand = card(0.5, 0.08, 0.35, P.violet, P.edge); stand.position.y = 0.04; clock.add(stand);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.07, 48), [paper(P.violet2), new THREE.MeshStandardMaterial({ map: canvasTex(256, 256, (g) => { g.fillStyle = '#f3f1ff'; g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill(); g.fillStyle = P.ink; for (let i = 0; i < 12; i++) { g.save(); g.translate(128, 128); g.rotate(i * Math.PI / 6); g.fillRect(-4, -116, 8, i % 3 ? 16 : 26); g.restore(); } }), roughness: 0.9 }), paper(P.violet2)]);
  face.rotation.x = Math.PI / 2; face.position.set(0, 0.56, 0); face.castShadow = true; clock.add(face);
  for (const [len, w, col] of [[0.3, 0.05, P.ink], [0.4, 0.035, P.magenta]]) { const pv = new THREE.Group(); pv.position.set(0, 0.56, 0.045); clock.add(pv); const hd = card(w, len, 0.012, col, col, 'z'); hd.position.y = len / 2 - 0.04; pv.add(hd); hands.push(pv); } }

// ------------------------------------------------------------------ the reminder card (generic glyphs, no Play UI) and the settings sheet
const noteTex = canvasTex(600, 190, (g, w, h) => { g.fillStyle = '#f3f1ff'; rr(g, 0, 0, w, h, 34); g.fill(); g.fillStyle = '#ffd36a'; g.beginPath(); g.arc(95, 95, 62, 0, Math.PI * 2); g.fill(); gBell(g, 95, 92, 1.15, P.ink);
  gShield(g, 225, 95, 1.05, false); g.fillStyle = '#9d8cf0'; for (const [y, l] of [[70, 250], [110, 190], [146, 120]]) { rr(g, 300, y - 9, l, 18, 9); g.fill(); } });
const note = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.03, 0.6), [paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: noteTex, emissive: '#ffffff', emissiveMap: noteTex, emissiveIntensity: 0.3, roughness: 0.9 }), paper('#cfc8ff'), paper(P.white), paper(P.white)]);
note.castShadow = true; scene.add(note);
const sheetCv = document.createElement('canvas'); sheetCv.width = 512; sheetCv.height = 486; const shg = sheetCv.getContext('2d'); const sheetTex = new THREE.CanvasTexture(sheetCv); sheetTex.colorSpace = THREE.SRGBColorSpace; sheetTex.anisotropy = 8;
let sheetKey = '';
function drawSheet(k) { const key = String(Math.round(k * 20)); if (key === sheetKey) return; sheetKey = key; const g = shg; g.fillStyle = '#e9e5ff'; rr(g, 0, 0, 512, 486, 30); g.fill(); g.fillStyle = 'rgba(42,47,114,0.25)'; rr(g, 206, 14, 100, 12, 6); g.fill();
  const icons = [gBag, gPerson, (g2, x, y, s, c, lit) => gShield(g2, x, y, s * 0.95, lit), gGear];
  for (let i = 0; i < 4; i++) { const y = 70 + i * 108, lit = k > i + 0.02; g.fillStyle = lit ? P.cyan : '#c9bfff'; rr(g, 40, y - 12, 432, 88, 22); g.fill();
    icons[i](g, 104, y + 32, 0.75, lit ? '#0d1240' : '#2a2f72', lit); g.fillStyle = lit ? '#0d1240' : '#7a74b8'; for (const [dx, l] of [[0, 200], [0, 140]]) { rr(g, 170, y + (l === 200 ? 12 : 42), l, 14, 7); g.fill(); }
    g.strokeStyle = lit ? '#0d1240' : '#7a74b8'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(430, y + 18); g.lineTo(446, y + 32); g.lineTo(430, y + 46); g.stroke(); }
  sheetTex.needsUpdate = true; }
const sheet = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.025, 1.9), [paper(P.white), paper(P.white), new THREE.MeshStandardMaterial({ map: sheetTex, emissive: '#ffffff', emissiveMap: sheetTex, emissiveIntensity: 0.3, roughness: 0.9 }), paper('#cfc8ff'), paper(P.white), paper(P.white)]);
sheet.castShadow = true; scene.add(sheet);

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
sign.position.set(0.3, DESK, 3.7);

// ------------------------------------------------------------------ camera shots (one set-up per beat; eased moves, no bobbing)
const SH = (pos, look, fov, focus) => ({ pos, look, fov, focus: focus ?? pos.distanceTo(look) });
const L3 = (a, b, u) => V3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
const SHOTS = {
  S1: (t) => { const u = prog(t, 0, 2.72); return SH(L3([1.0, 2.5, 4.5], [0.85, 2.3, 4.1], u), V3(0.35, TOP + 0.1, 1.2), 46); },
  S2: (t) => { const u = prog(t, 2.72, 6.18), c = prog(t, 4.0, 4.7); return SH(L3([-1.5, 2.3, 1.4], [-1.0, 2.5, 1.2], u), L3([-2.3, 0.85, -1.45], [0.0, TOP, -1.45], c), 52); },
  S3: (t) => { const u = prog(t, 6.18, 10.79), c = prog(t, 8.3, 8.9); return SH(L3([1.0, 2.6, 1.25], [0.55, 2.85, 1.05], u), L3([1.6, 0.55, -1.75], [-0.05, 0.3, -1.45], c), 50); },
  S4: (t) => { const u = prog(t, E.radar - 0.5, E.radar + 0.2); return SH(L3([3.7, 2.3, 3.3], [0.25, 4.6, 2.4], u), L3([2.0, 0.3, 0.5], [0.0, TOP, 0.05], u), lerp(48, 50, u)); },
  S5: (t) => { const u = prog(t, 16.64, 22.12); return SH(L3([-1.1, 3.6, 3.45], [-1.2, 3.45, 3.15], u), V3(-0.75, TOP, 0.6), 52); },
  S6: (t) => { const u = prog(t, 22.12, 25.96); return SH(L3([0.2, 4.4, 3.4], [0.2, 4.1, 3.1], u), V3(0.15, TOP, 0.75), 48); },
  S7: (t) => { const u = prog(t, 25.96, 29.6); return SH(L3([0.7, 2.9, 7.3], [0.9, 3.9, 8.7], u), L3([0.0, 0.5, 0.6], [0.0, 0.55, 0.35], u), 48, lerp(3.8, 5.3, u)); },
};

// ------------------------------------------------------------------ per-frame update
function update(t) {
  const shot = TL.shots.find((s) => t >= s.in && t < s.out) || TL.shots[TL.shots.length - 1]; const id = shot.id;
  const cam = SHOTS[id](t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.updateProjectionMatrix(); camera.lookAt(cam.look);
  bokeh.uniforms.focus.value = cam.focus; bokeh.uniforms.aperture.value = 0.0008; bokeh.uniforms.maxblur.value = 0.005;

  // the Play Protect switch: on → off (hook) … back on at the end (S6)
  const on = t < E.toggleOff ? 1 : t < E.toggleOn ? 1 - prog(t, E.toggleOff, E.toggleOff + 0.3, outC) : prog(t, E.toggleOn, E.toggleOn + 0.3, outBack);
  knob.position.set(lerp(TOG.x0, TOG.x1, clamp(on, -0.05, 1.08)), TOP + 0.05, TOG.z);
  drawScreen({ on: clamp(on), up: t >= E.update - 0.2 && t < E.notify ? prog(t, E.update, E.updateEnd, (x) => x) : -1, ok: clamp((t - E.updateOk) / 0.22) });
  { const a = prog(t, E.query, E.query + 0.3, outBack) * (1 - prog(t, E.queryOff, E.queryOff + 0.25)); qTag.visible = id === 'S1' && a > 0.01; qTag.position.set(0.66, TOP + 0.55, 1.05); qTag.scale.setScalar(Math.max(0.01, a) * 1.3); qTag.rotation.y = 0.15; }
  // calendar: 31 Oct → 1 Nov → 2 Nov
  calPages.forEach((h, i) => { if (i === 0) return; const k = 2 - i; const u = prog(t, E.calFlip + k * 0.5, E.calFlip + k * 0.5 + 0.48); h.rotation.x = lerp(-0.18, 0.5 - Math.PI * 2, u); });
  // clock: hands race while the switch stays off
  { const sp = prog(t, E.clockSpin, E.clockSpinEnd); hands[0].rotation.z = -0.6 - sp * Math.PI * 2 * 0.5; hands[1].rotation.z = -2.2 - sp * Math.PI * 2 * 6; }
  // the reminder card drops in from the top edge, then the bell wiggles
  { const u = prog(t, E.notify, E.notify + 0.5, outBack); const show = t >= E.notify - 0.05 && t < 16.64; note.visible = show; const wig = Math.sin((t - E.notify - 0.5) * 18) * 0.06 * clamp(1 - Math.abs(t - E.notify - 1.1) / 0.6);
    note.position.set(0, lerp(TOP + 0.9, TOP + 0.03, clamp(u, 0, 1.1)), lerp(-2.95, -1.45, clamp(u, 0, 1.05))); note.rotation.set(0, wig, 0); }
  // app tiles: six installed apps, three new ones ride the belt through the shield gate
  beltTex.offset.x = -(t * 0.9 % 1) * (t >= E.belt - 0.5 && t < E.belt + 3.0 ? 1 : 0);
  let gateLit = 0;
  tiles.forEach((tl, i) => { const n = NEW.find((q) => q.i === i); let p;
    if (n) { p = newTilePos(n, t); tl.m.visible = !!p; if (p) { tl.m.position.copy(p); const near = 1 - Math.min(1, Math.abs(p.x - GATE_X) / 0.25); gateLit = Math.max(gateLit, p.y < TOP + 0.08 ? near : 0); } }
    else { const sl = SLOTS[i]; tl.m.visible = true; tl.m.position.set(sl.x, TOP + 0.03, sl.z); }
    tl.m.rotation.set(0, 0, 0);
    // radar highlight
    let glow = 0; if (t >= E.radar && t < E.radarEnd) { const ang = (t - E.radar) * Math.PI * 2 / 1.25; const a = Math.atan2(-(tl.m.position.z - GRID_C.z), tl.m.position.x - GRID_C.x); const d = ((ang - a) % (Math.PI * 2) + Math.PI * 4) % (Math.PI * 2); glow = d < 0.75 ? 1 - d / 0.75 : 0; }
    tl.top.emissiveIntensity = 0.15 + 0.55 * glow; });
  curtain.material.opacity = 0.45 * gateLit;
  radar.visible = t >= E.radar && t < E.radarEnd; radar.rotation.z = (t - E.radar) * Math.PI * 2 / 1.25; radar.material.opacity = 0.32 * prog(t, E.radar, E.radar + 0.2) * (1 - prog(t, E.radarEnd - 0.25, E.radarEnd));
  { const ph = ((t - E.radar) / 1.25) % 1; pulse.visible = radar.visible; pulse.scale.setScalar(0.2 + ph * 1.0); pulse.material.opacity = 0.6 * (1 - ph) * radar.material.opacity / 0.32; }
  // the harmful app: turns magenta, warning, disabled, removed into the bin
  { const tl = tiles[BAD]; const map = t >= E.disable ? offTex : t >= E.bad ? badTex : tl.base; if (tl.top.map !== map) { tl.top.map = map; tl.top.emissiveMap = map; tl.top.needsUpdate = true; }
    if (t >= E.bad && t < E.disable) tl.top.emissiveIntensity = 0.25 + 0.25 * Math.abs(Math.sin((t - E.bad) * 5));
    const pop = prog(t, E.bad, E.bad + 0.25, outBack); if (t < E.disable) tl.m.position.y = TOP + 0.03 + Math.sin(Math.PI * clamp((t - E.bad) / 0.3)) * 0.12 * (pop > 0 ? 1 : 0);
    const u = prog(t, E.remove, E.removeEnd); if (u > 0) { const s = SLOTS[BAD]; tl.m.position.set(lerp(s.x, BIN.x, ease(u)), TOP + 0.03 + Math.sin(Math.PI * u) * 0.9 - (u > 0.85 ? (u - 0.85) * 2.2 : 0), lerp(s.z, BIN.z, ease(u))); tl.m.rotation.set(u * 1.6, 0, u * 0.9); }
    tl.m.visible = u < 0.999; }
  { const a = prog(t, E.warn, E.warn + 0.3, outBack) * (1 - prog(t, E.remove, E.remove + 0.25)); warn.visible = a > 0.01 && t < 22.12; const s = SLOTS[BAD]; warn.position.set(s.x + 0.2, TOP + 0.75, s.z + 0.12); warn.scale.setScalar(Math.max(0.01, a)); warn.rotation.y = Math.atan2(camera.position.x - warn.position.x, camera.position.z - warn.position.z); }
  // the settings sheet slides up over the grid; steps light as they are spoken; switch flips back on
  { const u = prog(t, E.sheet, E.sheet + 0.5, outC); sheet.visible = t >= E.sheet - 0.05 && t < 25.96; sheet.position.set(0, lerp(TOP + 0.2, TOP + 0.075, u), lerp(3.2, 0.12, u));
    drawSheet(E.steps.reduce((k, s) => k + prog(t, s, s + 0.2), 0)); }
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
