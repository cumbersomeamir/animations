// portrait.js — Ideaverse production 30s english-08 #01 (English): how a phone fakes background blur (portrait mode).
// Engine header copied unchanged from english-07 shoplist.js (= accepted feedback-round renderer = education pilot-01 engine:
// renderer, lights, newsroom stage, materials, camera system, DOCKET rig, caption pill). Captions use Space Grotesk +
// Noto Sans Devanagari. Only props + choreography are new. Every frame is a pure function of t (window.renderAt).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import C from './cues.js';
import { createDocket, labelPlane, DOCKET_PALETTE as P, BASE_POSE } from '../character/docket.js';

const W = 1080, H = 1920, FPS = 30, Hh = C.hits;
const AMBER = '#FFC24B', NAVY = '#1B2333', PAPER = '#FBF8F1', LINK = '#2F64D6';
const D2R = Math.PI / 180;
// ------------------------------------------------------------------ math (pilot)
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const E = {
  linear: (k) => k, inQuad: (k) => k * k, outQuad: (k) => 1 - (1 - k) * (1 - k), inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outCubic: (k) => 1 - Math.pow(1 - k, 3), outQuart: (k) => 1 - Math.pow(1 - k, 4), inQuart: (k) => k * k * k * k,
  outBack: (k) => { const s = 1.9; return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); },
  inOutSine: (k) => -(Math.cos(Math.PI * k) - 1) / 2,
};
const kick = (t, t0, amp, dec = 0.12, freq = 28) => (t < t0 ? 0 : amp * Math.exp(-(t - t0) / dec) * Math.cos((t - t0) * freq));
function track(keys, t) { // [[t, v, ease], ...]
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1, e] = keys[i]; return lerp(v0, v1, E[e || 'inOutCubic'](inv(t0, t1, t))); }
  return keys[keys.length - 1][1];
}
function poseKeys(list) { let acc = { ...BASE_POSE }; return list.map((k) => { acc = { ...acc, ...k.p }; return { t: k.t, e: k.e, p: { ...acc } }; }); }
function poseAt(keys, t) {
  if (t <= keys[0].t) return { ...keys[0].p };
  for (let i = 1; i < keys.length; i++) if (t <= keys[i].t) { const a = keys[i - 1], b = keys[i], k = E[b.e || 'inOutCubic'](inv(a.t, b.t, t)); const o = {}; for (const key in b.p) o[key] = lerp(a.p[key], b.p[key], k); return o; }
  return { ...keys[keys.length - 1].p };
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const Q = (rx, ry, rz = 0) => new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ'));

// ------------------------------------------------------------------ renderer + stage (pilot recipe, unchanged)
const out = document.getElementById('out'); const octx = out.getContext('2d');
const glCanvas = document.createElement('canvas'); glCanvas.width = W; glCanvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#0E1424'); scene.fog = new THREE.Fog('#0E1424', 4.5, 9);
const cam = new THREE.PerspectiveCamera(44, W / H, 0.05, 40);
{
  const pm = new THREE.PMREMGenerator(renderer), env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color('#2A3550'), side: THREE.BackSide })));
  const pnl = (w, h, col, k, pos) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(0, 0, 0); env.add(m); };
  pnl(10, 4, '#ffffff', 4, [2, 8, 4]); pnl(4, 8, P.mint, 2.5, [-8, 2, -2]); pnl(6, 3, '#ffffff', 1.5, [0, 2, 9]);
  scene.environment = pm.fromScene(env, 0.04).texture; scene.environmentIntensity = 0.55;
}
scene.add(new THREE.HemisphereLight('#9FB4D9', '#0E1424', 0.55));
const key = new THREE.SpotLight('#FFF4E6', 38, 12, 0.6, 0.55, 1.6); key.position.set(1.8, 3.6, 2.6); key.target.position.set(0.1, 0.6, 0.1);
key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.camera.near = 1; key.shadow.camera.far = 9;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight(P.mint, 1.4); rim.position.set(-2.5, 2.5, -2.5); scene.add(rim);
const fill = new THREE.PointLight('#6C8FD9', 3, 6, 1.5); fill.position.set(-1.6, 1.4, 2); scene.add(fill);

const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.1, ...o });
const mats = { navy: M(P.navy, { roughness: 0.45, metalness: 0.3 }), deep: M('#121826', { roughness: 0.7 }), shell: M(P.shell, { roughness: 0.38 }), mint: M(P.mint, { emissive: new THREE.Color(P.mint), emissiveIntensity: 0.3, roughness: 0.3 }), steel: M(P.steel, { roughness: 0.3, metalness: 0.6 }), white: M('#FFFFFF', { roughness: 0.6 }), amber: M(AMBER, { emissive: new THREE.Color(AMBER), emissiveIntensity: 0.25 }), recess: M('#070A12', { roughness: 0.9 }), paper: M(PAPER, { roughness: 0.75 }) };
const sh = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
const rbox = (w, h, d, r, m) => sh(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m));
const cvTex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const glowMat = (col) => new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
// lit paper with a touch of self-light so printed text stays legible in the dark newsroom
const paperFace = (c) => { const t = cvTex(c); return new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.42, roughness: 0.72 }); };

// ------------------------------------------------------------------ canvas helpers
const HI = '"Space Grotesk", "Noto Sans Devanagari"';
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function check(g, x, y, s, col, lw) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y + s * 0.5); g.lineTo(x + s * 0.38, y + s * 0.88); g.lineTo(x + s, y); g.stroke(); g.restore(); }
function tag(g, x, y, txt, fg, bg, size = 26) { g.save(); g.textAlign = 'left'; g.font = `700 ${size}px ${HI}`; g.letterSpacing = '2px'; const w = g.measureText(txt).width + 30; g.fillStyle = bg; rr(g, x - w, y, w, size + 20, (size + 20) / 2); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, x - w + 15, y + (size + 20) / 2 + 2); g.restore(); }
function badge(g, x, y, r, txt, bg, fg) { g.save(); g.fillStyle = bg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = fg; g.font = `800 ${Math.round(r * 1.2)}px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y + 2); g.restore(); }

function ltag(g, x, y, txt, fg, bg, size = 24) { g.save(); g.textAlign = 'left'; g.font = `700 ${size}px ${HI}`; g.letterSpacing = '2px'; const w = g.measureText(txt).width + 30; g.fillStyle = bg; rr(g, x, y, w, size + 20, (size + 20) / 2); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, x + 15, y + (size + 20) / 2 + 2); g.restore(); }

// ---- the fictional portrait photo (600 x 800): built from depth layers so the blur can be computed per layer
const NW = 600, NH = 800, MAXB = 15;
const HC = { x: 300, y: 300 };                       // hair-cloud centre
const hairR = (a) => 112 + 8 * Math.sin(9 * a + 0.4) + 4 * Math.sin(17 * a + 1.3);
const BULBS = [];
{ for (const [y0, sag, n, x0, x1] of [[70, 60, 11, -20, 620], [150, 45, 9, 40, 640]]) for (let i = 0; i < n; i++) { const k = i / (n - 1), x = lerp(x0, x1, k); BULBS.push([x, y0 + sag * 4 * k * (1 - k) + 6, i % 3 === 1 ? '#FFD38A' : '#FFB25B']); }
  for (const [x, y] of [[40, 330], [96, 352], [470, 318], [532, 342], [566, 360], [150, 372]]) BULBS.push([x, y, '#BFD8FF']); }
const L = {};                                        // layer canvases (built once)
function personPath(g) {                             // outline used for the AI trace (shoulders → hair cloud → shoulders)
  g.beginPath(); g.moveTo(112, NH + 4); g.bezierCurveTo(118, 560, 150, 470, 250, 446); g.lineTo(262, 410);
  const a0 = Math.PI * 0.62, a1 = Math.PI * 2.38;
  for (let i = 0; i <= 90; i++) { const a = lerp(a0, a1, i / 90); g.lineTo(HC.x + Math.cos(a) * (hairR(a) + 14), HC.y + Math.sin(a) * (hairR(a) + 14)); }
  g.lineTo(338, 410); g.lineTo(350, 446); g.bezierCurveTo(450, 470, 482, 560, 488, NH + 4);
}
function buildLayers() {
  const mk = () => canvas(NW, NH);
  // far: dusk sky, skyline with windows, light strings (bulbs drawn separately as bokeh)
  L.sky = mk(); { const g = L.sky.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 520); gr.addColorStop(0, '#22305A'); gr.addColorStop(0.55, '#6B4F86'); gr.addColorStop(1, '#E59A6B'); g.fillStyle = gr; g.fillRect(0, 0, NW, 520);
    let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let x = -10; x < NW; ) { const w = 50 + r() * 60, h = 70 + r() * 130; g.fillStyle = '#2B2446'; g.fillRect(x, 470 - h, w, h + 50); g.fillStyle = 'rgba(255,214,140,0.85)'; for (let wy = 470 - h + 14; wy < 460; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 16) if (r() < 0.45) g.fillRect(wx, wy, 7, 10); x += w + 4; }
    g.strokeStyle = 'rgba(30,24,40,0.9)'; g.lineWidth = 2.5; for (const [y0, sag, x0, x1] of [[70, 60, -20, 620], [150, 45, 40, 640]]) { g.beginPath(); for (let i = 0; i <= 40; i++) { const k = i / 40; g.lineTo(lerp(x0, x1, k), y0 + sag * 4 * k * (1 - k)); } g.stroke(); } }
  // mid: trees + a lamp post
  L.trees = mk(); { const g = L.trees.getContext('2d');
    const tree = (x, y, r, c) => { g.fillStyle = '#3A2A22'; g.fillRect(x - 9, y, 18, 560 - y); g.fillStyle = c; for (const [dx, dy, k] of [[0, 0, 1], [-0.55, 0.3, 0.7], [0.55, 0.32, 0.72], [0, -0.4, 0.7]]) { g.beginPath(); g.arc(x + dx * r, y + dy * r, r * k, 0, 7); g.fill(); } };
    tree(70, 380, 92, '#2E5E4E'); tree(545, 360, 100, '#2A5546'); tree(175, 430, 60, '#376B57'); tree(452, 440, 56, '#356652');
    g.fillStyle = '#1E2433'; g.fillRect(398, 330, 8, 230); g.fillStyle = '#FFE2A8'; g.beginPath(); g.arc(402, 326, 14, 0, 7); g.fill(); }
  // near: grass + path
  L.ground = mk(); { const g = L.ground.getContext('2d'); const gr = g.createLinearGradient(0, 520, 0, NH); gr.addColorStop(0, '#3F6B4A'); gr.addColorStop(1, '#2C4C36'); g.fillStyle = gr; g.fillRect(0, 528, NW, NH - 528);
    g.fillStyle = '#B9A27E'; g.beginPath(); g.moveTo(250, 528); g.lineTo(350, 528); g.lineTo(520, NH); g.lineTo(80, NH); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 3; for (let y = 560; y < NH; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(NW, y); g.stroke(); } }
  // the person (sharp): hair cloud core, face, neck, jacket
  L.person = mk(); { const g = L.person.getContext('2d');
    g.fillStyle = '#3B2618'; g.beginPath(); for (let i = 0; i <= 120; i++) { const a = (i / 120) * Math.PI * 2; g.lineTo(HC.x + Math.cos(a) * (hairR(a) - 8), HC.y + Math.sin(a) * (hairR(a) - 8)); } g.fill();
    g.fillStyle = '#4A3020'; for (let i = 0; i < 70; i++) { const a = i * 2.39996, rr2 = 20 + (i * 37 % 80); g.beginPath(); g.arc(HC.x + Math.cos(a) * rr2, HC.y - 10 + Math.sin(a) * rr2 * 0.9, 9, 0, 7); g.fill(); }
    g.fillStyle = '#E2604A'; g.beginPath(); g.moveTo(112, NH); g.bezierCurveTo(118, 560, 150, 470, 250, 446); g.lineTo(350, 446); g.bezierCurveTo(450, 470, 482, 560, 488, NH); g.fill();
    g.fillStyle = '#F4F7FB'; g.beginPath(); g.moveTo(250, 446); g.lineTo(350, 446); g.lineTo(326, 560); g.lineTo(274, 560); g.fill();
    g.fillStyle = '#B9774F'; g.fillRect(278, 386, 44, 66);
    g.fillStyle = '#C9845A'; g.beginPath(); g.ellipse(300, 338, 60, 74, 0, 0, 7); g.fill();
    g.fillStyle = '#3B2618'; g.beginPath(); g.ellipse(300, 276, 64, 30, 0, Math.PI, 0); g.fill();
    g.strokeStyle = '#6E3A2A'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.arc(300, 372, 22, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    g.fillStyle = '#B06F48'; g.beginPath(); g.ellipse(300, 352, 7, 5, 0, 0, 7); g.fill(); }
  // frizz: the outer curls (what the AI misses)
  L.frizz = mk(); { const g = L.frizz.getContext('2d'); g.strokeStyle = '#4A3020'; g.lineWidth = 6; g.lineCap = 'round';
    for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2 + 0.05 * Math.sin(i * 7); if (Math.sin(a) > 0.55) continue; const rr2 = hairR(a) + 2 + (i % 3) * 7; g.beginPath(); g.arc(HC.x + Math.cos(a) * rr2, HC.y + Math.sin(a) * rr2, 9 + (i % 4) * 2, a - 2.2, a + 2.2); g.stroke(); } }
  // sunglasses (the AI reads the dark lenses as far away)
  L.glasses = mk(); { const g = L.glasses.getContext('2d'); g.lineWidth = 6; g.strokeStyle = '#151515';
    for (const x of [271, 329]) { g.fillStyle = '#1A1A22'; g.beginPath(); g.arc(x, 330, 24, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(160,190,255,0.45)'; g.beginPath(); g.ellipse(x - 8, 321, 8, 4, -0.5, 0, 7); g.fill(); }
    g.beginPath(); g.moveTo(294, 326); g.quadraticCurveTo(300, 320, 306, 326); g.stroke(); g.beginPath(); g.moveTo(247, 326); g.lineTo(238, 322); g.moveTo(353, 326); g.lineTo(362, 322); g.stroke(); }
  // depth-map silhouettes (lighter = closer, as in the Pixel 2 write-up)
  const sil = (src, col) => { const c = mk(), g = c.getContext('2d'); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, NW, NH); return c; };
  L.dSky = sil(L.sky, '#16233D'); L.dTrees = sil(L.trees, '#2F6E6A'); L.dGround = sil(L.ground, '#8FD9A0'); L.dPerson = sil(L.person, '#F4F7FB'); L.dGlass = sil(L.glasses, '#16233D');
  L.sharp = mk(); drawLayers(L.sharp.getContext('2d'), 0, 0);
  L.full = mk(); drawLayers(L.full.getContext('2d'), 1, 1);
}
function blurDraw(g, src, px) { if (px > 0.25) { g.filter = `blur(${px.toFixed(2)}px)`; g.drawImage(src, 0, 0); g.filter = 'none'; } else g.drawImage(src, 0, 0); }
function bulbs(g, lv, pulse = 0) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [x, y, col] of BULBS) { const r = 4 + 19 * lv * (1 + 0.18 * pulse), a = Math.min(1, Math.pow(4.5 / r, 0.75));
    g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    if (lv > 0.2) { g.globalAlpha = a * 0.5; g.strokeStyle = col; g.lineWidth = 2; g.stroke(); } }
  g.restore();
}
// blur level lv (0..1) scales the per-depth blur; err (0..1) = how much the AI's mistakes (frizz, sunglasses) get blurred too
function drawLayers(g, lv, err, pulse = 0) {
  g.fillStyle = '#6B4F86'; g.fillRect(0, 0, NW, 528); g.fillStyle = '#35603F'; g.fillRect(0, 520, NW, NH - 520);
  blurDraw(g, L.sky, MAXB * lv); bulbs(g, lv, pulse);
  blurDraw(g, L.trees, MAXB * 0.6 * lv); blurDraw(g, L.ground, MAXB * 0.3 * lv);
  blurDraw(g, L.frizz, 7 * lv * err); g.drawImage(L.person, 0, 0); blurDraw(g, L.glasses, 5.5 * lv * err);
}
function ring(g, x, y, rx, ry, a, col) { if (!(a > 0)) return; const k = 1.25 - 0.25 * Math.min(1, a); g.save(); g.globalAlpha = Math.min(1, a); g.strokeStyle = col; g.lineWidth = 8; g.shadowColor = col; g.shadowBlur = 16; g.beginPath(); g.ellipse(x, y, rx * k, ry * k, 0, 0, 7); g.stroke(); g.restore(); }
function chip(g, x, y, txt, a, col, size = 30) { if (!(a > 0)) return; g.save(); g.globalAlpha = Math.min(1, a); g.translate(x, y); g.scale(0.8 + 0.2 * Math.min(1, a), 0.8 + 0.2 * Math.min(1, a)); g.font = `800 ${size}px ${HI}`; g.textAlign = 'left'; const w = g.measureText(txt).width + 30; g.fillStyle = col; rr(g, 0, -size * 0.85, w, size * 1.7, size * 0.85); g.fill(); g.fillStyle = NAVY; g.textBaseline = 'middle'; g.fillText(txt, 15, 2); g.restore(); }
// card / screen photo: s = { lv, err, sweep, pulse, trace, mask, depth:[g,t,s], legend, meters, far, rings..., tagTxt }
function drawPhoto(g, s) {
  g.save();
  if (s.sweep !== undefined && s.sweep < 1) {            // hook: blur wipes left→right
    g.drawImage(L.sharp, 0, 0); const x = lerp(-40, NW + 40, s.sweep);
    g.save(); g.beginPath(); g.rect(0, 0, x, NH); g.clip(); g.drawImage(L.full, 0, 0); g.restore();
    g.save(); g.shadowColor = P.mint; g.shadowBlur = 24; g.fillStyle = P.mint; g.fillRect(x - 3, 0, 6, NH); g.restore();
  } else if (s.lv >= 1 && s.err >= 1 && !s.pulse) g.drawImage(L.full, 0, 0);
  else drawLayers(g, s.lv, s.err, s.pulse || 0);
  // depth map: layers recoloured near (light) → far (dark), revealed near-first
  const d = s.depth || [0, 0, 0];
  if (d.some((v) => v > 0)) {
    g.save(); g.globalAlpha = d[2]; g.drawImage(L.dSky, 0, 0); g.globalAlpha = d[1]; g.drawImage(L.dTrees, 0, 0); g.globalAlpha = d[0]; g.drawImage(L.dGround, 0, 0); g.restore();
  }
  if (s.mask > 0) { g.save(); g.globalAlpha = s.mask; g.drawImage(L.dPerson, 0, 0); g.globalAlpha = s.mask * Math.max(d[2], 0.0); g.drawImage(L.dGlass, 0, 0); g.restore(); }
  if (s.trace > 0) { g.save(); g.strokeStyle = P.mint; g.lineWidth = 7; g.lineJoin = 'round'; g.shadowColor = P.mint; g.shadowBlur = 18; g.setLineDash([2600 * s.trace, 4000]); personPath(g); g.stroke(); g.restore(); }
  if (s.legend > 0) { g.save(); g.globalAlpha = s.legend; g.fillStyle = 'rgba(11,16,32,0.82)'; rr(g, 40, 678, 520, 92, 20); g.fill();
    const gr = g.createLinearGradient(150, 0, 450, 0); gr.addColorStop(0, '#F4F7FB'); gr.addColorStop(0.35, '#8FD9A0'); gr.addColorStop(0.7, '#2F6E6A'); gr.addColorStop(1, '#16233D'); g.fillStyle = gr; rr(g, 150, 712, 300, 26, 13); g.fill(); g.strokeStyle = 'rgba(244,247,251,0.5)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#F4F7FB'; g.font = `800 28px ${HI}`; g.textBaseline = 'middle'; g.textAlign = 'right'; g.fillText('NEAR', 138, 726); g.textAlign = 'left'; g.fillText('FAR', 462, 726); g.restore(); }
  if (s.meters > 0) {                                     // blur amount per depth
    g.save(); g.globalAlpha = s.meters; g.fillStyle = 'rgba(11,16,32,0.82)'; rr(g, 40, 618, 300, 152, 20); g.fill();
    [['near', 0.3], ['mid', 0.6], ['far', 1]].forEach(([n, k], i) => { const y = 650 + i * 44, hot = n === 'far' && s.far > 0;
      g.fillStyle = hot ? AMBER : '#F4F7FB'; g.font = `800 26px ${HI}`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(n, 60, y);
      g.fillStyle = 'rgba(244,247,251,0.18)'; rr(g, 132, y - 10, 186, 20, 10); g.fill();
      g.fillStyle = hot ? AMBER : P.mint; if (hot) { g.shadowColor = AMBER; g.shadowBlur = 16 * s.far; } rr(g, 132, y - 10, Math.max(20, 186 * k * s.lv), 20, 10); g.fill(); g.shadowBlur = 0; });
    g.restore(); }
  ring(g, 388, 214, 70, 56, s.ringHair, AMBER); ring(g, 300, 330, 90, 44, s.ringGlass, AMBER);
  chip(g, 250, 128, 'hair blurred', s.chipHair, AMBER); chip(g, 168, 424, 'glasses blurred', s.chipGlass, AMBER, 28);
  if (s.edges > 0) { g.save(); g.strokeStyle = P.mint; g.lineWidth = 6; g.setLineDash([16, 14]); g.lineDashOffset = -s.edges * 120; g.shadowColor = P.mint; g.shadowBlur = 12; g.globalAlpha = Math.min(1, s.edges * 3);
    g.beginPath(); g.arc(HC.x, HC.y, 150, Math.PI * 0.95, Math.PI * (0.95 + 1.1 * s.edges)); g.stroke(); g.restore(); }
  if (s.chipAI > 0) chip(g, 380, 470, 'AI: person', s.chipAI, P.mint, 30);
  if (s.tagTxt) ltag(g, 22, 22, s.tagTxt, NAVY, s.tagCol || P.mint, 22);
  if (s.example !== false) tag(g, NW - 22, NH - 64, 'EXAMPLE', NAVY, AMBER, 20);
  g.restore();
}

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, lensRing, lensLabel, qMark;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
function buildStage() {
  // floor + back wall + panels + NEWSROOM sign (pilot recipe, unchanged)
  const fc = canvas(1024, 1024), fg = fc.getContext('2d');
  fg.fillStyle = '#141B2B'; fg.fillRect(0, 0, 1024, 1024); fg.strokeStyle = 'rgba(108,218,126,0.10)'; fg.lineWidth = 3;
  for (let i = 0; i <= 1024; i += 64) { fg.beginPath(); fg.moveTo(i, 0); fg.lineTo(i, 1024); fg.stroke(); fg.beginPath(); fg.moveTo(0, i); fg.lineTo(1024, i); fg.stroke(); }
  const ft = cvTex(fc); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(4, 4);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.55, metalness: 0.2 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), M('#1B2333', { roughness: 0.9 })); wall.position.set(0, 3, -2.4); wall.receiveShadow = true; scene.add(wall);
  for (const [x, y, w, h] of [[-1.3, 2.1, 0.9, 1.4], [1.35, 2.25, 0.8, 1.1], [0.05, 3.0, 1.6, 0.5]]) { const p = rbox(w, h, 0.05, 0.03, mats.deep); p.position.set(x, y, -2.35); scene.add(p); }
  const signCanvas = canvas(1024, 256); const sgc = signCanvas.getContext('2d');
  sgc.font = '700 120px "Space Grotesk"'; sgc.textAlign = 'center'; sgc.textBaseline = 'middle'; sgc.letterSpacing = '18px';
  sgc.shadowColor = P.mint; sgc.shadowBlur = 30; sgc.fillStyle = P.mint; sgc.fillText('NEWSROOM', 512, 132);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.375), new THREE.MeshBasicMaterial({ map: cvTex(signCanvas), transparent: true, toneMapped: false }));
  sign.position.set(-0.8, 0.98, -2.32); sign.scale.setScalar(0.62); scene.add(sign);
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: aperture/camera icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 16; mg.strokeStyle = P.mint; mg.lineWidth = 12; mg.beginPath(); mg.arc(256, 150, 80, 0, 7); mg.stroke();
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; mg.beginPath(); mg.moveTo(256 + Math.cos(a) * 80, 150 + Math.sin(a) * 80); mg.lineTo(256 + Math.cos(a + 1.2) * 34, 150 + Math.sin(a + 1.2) * 34); mg.stroke(); }
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  // ----- the easel with the photo card
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  buildLayers();
  cardCanvas = canvas(NW, NH);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // ----- the phone (illustrative example screens; not any real app's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  const lens = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 24), M('#05070C', { roughness: 0.1, metalness: 0.6 }))); lens.rotation.x = Math.PI / 2; lens.position.set(-0.08, 0.2, -0.019); phone.add(lens);
  const lensRim = new THREE.Mesh(new THREE.RingGeometry(0.022, 0.03, 32), mats.mint); lensRim.position.set(-0.08, 0.2, -0.0252); lensRim.rotation.y = Math.PI; phone.add(lensRim);
  lensRing = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.062, 40), glowMat(AMBER)); lensRing.position.set(-0.08, 0.2, -0.03); lensRing.rotation.y = Math.PI; phone.add(lensRing);
  lensLabel = labelPlane(THREE, 'TINY LENS', 0.26, 0.07, NAVY, AMBER, '800 {S}px "Space Grotesk"'); lensLabel.position.set(-0.02, 0.35, -0.03); lensLabel.rotation.y = Math.PI; phone.add(lensLabel);
  qMark = labelPlane(THREE, '?', 0.13, 0.13, NAVY, AMBER, '800 {S}px "Space Grotesk"'); scene.add(qMark);
}

// ------------------------------------------------------------------ card + phone screen states (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
const q40 = (v) => Math.round(clamp(v) * 40) / 40;
let cardKey = '', screenKey = '';
function flipScale(t) { const f = Hh.flip1; if (t >= f && t < f + 0.3) return Math.abs(Math.cos(Math.PI * (t - f) / 0.3)); return 1; }
function cardState(t) {
  if (t < Hh.flip1 + 0.15) return { lv: 1, err: 1, sweep: q40(E.inOutSine(inv(Hh.sweep[0], Hh.sweep[1], t))), tagTxt: 'PORTRAIT MODE' };
  if (t < Hh.cut3) {
    const und = q20(inv(Hh.undepth, Hh.undepth + 0.4, t));
    const dep = Hh.depth.map((a) => q20(inv(a, a + 0.35, t) * (1 - und)));
    const lv = q40(E.inOutSine(inv(Hh.blur[0], Hh.blur[1], t)));
    return { lv, err: 1, trace: t < Hh.mask + 0.5 ? q40(inv(Hh.trace[0], Hh.trace[1], t)) * (1 - q20(inv(Hh.mask + 0.2, Hh.mask + 0.5, t))) : 0,
      mask: q20(inv(Hh.mask, Hh.mask + 0.3, t) * (1 - und)), chipAI: q20(inv(Hh.mask + 0.05, Hh.mask + 0.3, t) * (1 - inv(Hh.depth[0] - 0.2, Hh.depth[0], t))), depth: dep,
      legend: q20(inv(Hh.legend, Hh.legend + 0.3, t) * (1 - und)), meters: q20(inv(Hh.meters, Hh.meters + 0.3, t)), far: q20(inv(Hh.far, Hh.far + 0.25, t)),
      pulse: q20(Math.sin(Math.PI * inv(Hh.bokeh, Hh.bokeh + 0.5, t))),
      tagTxt: t < Hh.depth[0] - 0.1 ? 'ORIGINAL' : t < Hh.undepth + 0.2 ? 'DEPTH GUESS' : 'BLUR ADDED', tagCol: t < Hh.depth[0] - 0.1 ? '#C9CED8' : P.mint };
  }
  if (t < Hh.cut4) return { lv: 1, err: 1, ringHair: q20(inv(Hh.ringHair, Hh.ringHair + 0.25, t)), chipHair: q20(inv(Hh.chipHair, Hh.chipHair + 0.25, t)),
    ringGlass: q20(inv(Hh.ringGlass, Hh.ringGlass + 0.25, t)), chipGlass: q20(inv(Hh.chipGlass, Hh.chipGlass + 0.25, t)), edges: q20(inv(Hh.edges[0], Hh.edges[1], t)) };
  return { lv: 0.3, err: 1, tagTxt: 'PORTRAIT MODE' };
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); drawPhoto(g, s); cardMesh.material.map.needsUpdate = true;
}
// phone: illustrative "Edit" screen — blur slider + portrait on/off (generic, not a specific app's UI)
const photoC = () => (photoC.c ||= canvas(NW, NH));
function screenState(t) {
  const down = E.inOutCubic(inv(Hh.down[0], Hh.down[1], t)), on = t < Hh.off ? 1 : t < Hh.on2 ? 0 : 1;
  const lv = t < Hh.on2 ? lerp(1, 0.3, down) : 0.3;
  return { lv: q40(lv), on, sw: q20(t < Hh.on2 ? 1 - inv(Hh.off, Hh.off + 0.2, t) : inv(Hh.on2, Hh.on2 + 0.2, t)), layer: q40(Math.sin(Math.PI * inv(Hh.layer[0], Hh.layer[1], t))),
    slider: q20(inv(Hh.layer[1] - 0.2, Hh.layer[1] + 0.1, t)), knob: q40(lv), lowOK: q20(inv(Hh.on2 + 0.25, Hh.on2 + 0.5, t)) };
}
function drawScreen(t) {
  const k = screenState(t);
  const key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'EXAMPLE', NAVY, AMBER, 24);
  g.fillStyle = '#F4F7FB'; g.font = `700 34px ${HI}`; g.fillText('Edit photo', 30, 104);
  const pc = photoC(), pg = pc.getContext('2d'); pg.setTransform(1, 0, 0, 1, 0, 0);
  drawPhoto(pg, { lv: k.on ? k.lv : 0, err: 1, example: false });
  const PX = 34, PY = 140, PWd = SW - 68, PHt = PWd * NH / NW;
  if (k.layer > 0) {                                   // "the blur is added later": the blur layer lifts off the sharp photo
    g.save(); rr(g, PX, PY, PWd, PHt, 18); g.clip(); g.drawImage(L.sharp, PX, PY, PWd, PHt); g.restore();
    g.save(); g.globalAlpha = 0.92; g.translate(PX + PWd / 2 + 40 * k.layer, PY + PHt / 2 - 70 * k.layer); g.rotate(0.06 * k.layer); g.scale(1 - 0.12 * k.layer, 1 - 0.12 * k.layer);
    g.beginPath(); g.roundRect(-PWd / 2, -PHt / 2, PWd, PHt, 18); g.clip(); g.drawImage(pc, -PWd / 2, -PHt / 2, PWd, PHt);
    g.restore(); g.save(); g.globalAlpha = Math.min(1, k.layer * 1.6); chip(g, 52, PY + PHt - 56, 'sharp photo', 1, '#C9CED8', 30); chip(g, 236, PY + 44, '+ blur layer', 1, P.mint, 30); g.restore();
  } else { g.save(); rr(g, PX, PY, PWd, PHt, 18); g.clip(); g.drawImage(pc, PX, PY, PWd, PHt); g.restore(); }
  // controls
  const y1 = PY + PHt + 70;
  g.save(); g.globalAlpha = 0.35 + 0.65 * k.slider; g.fillStyle = '#F4F7FB'; g.font = `700 30px ${HI}`; g.fillText('Blur', 36, y1);
  g.fillStyle = 'rgba(244,247,251,0.2)'; rr(g, 120, y1 - 7, 380, 14, 7); g.fill(); g.fillStyle = k.on ? P.mint : 'rgba(244,247,251,0.35)'; rr(g, 120, y1 - 7, Math.max(14, 380 * (k.on ? k.knob : 0)), 14, 7); g.fill();
  g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(120 + 380 * (k.on ? k.knob : 0), y1, 20, 0, 7); g.fill(); g.restore();
  const y2 = y1 + 84;
  g.fillStyle = '#F4F7FB'; g.font = `700 30px ${HI}`; g.fillText('Portrait effect', 36, y2);
  g.fillStyle = k.sw > 0.5 ? P.mint : '#3A4258'; rr(g, 404, y2 - 26, 100, 52, 26); g.fill(); g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(lerp(430, 478, k.sw), y2, 21, 0, 7); g.fill();
  g.font = `800 24px ${HI}`; g.fillStyle = k.sw > 0.5 ? P.mint : '#C9CED8'; g.textAlign = 'right'; g.fillText(k.sw > 0.5 ? 'ON' : 'OFF', 390, y2 + 1); g.textAlign = 'left';
  if (k.lowOK > 0) { g.save(); g.globalAlpha = k.lowOK; check(g, 36, y1 + 120, 30, P.mint, 7); g.fillStyle = P.mint; g.font = `700 28px ${HI}`; g.fillText('adjusted after the shot', 82, y1 + 136); g.restore(); }
}

// ------------------------------------------------------------------ choreography
const OFF = { x: 0.3, z: 0.5, rotY: 6 };
const HK = { x: 0.06, z: 0.28, rotY: -14 };
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...OFF } },
  { t: 0.89, p: {} },
  { t: 0.9, p: { ...HK, headYaw: 6, headPitch: 2 } },                                            // (cut) two-shot: DOCKET shows its phone's lens
  { t: 1.9, p: {} },
  { t: 2.3, p: { headYaw: -28, headPitch: 0, twist: -8 } },                                      // looks + points at the blurred photo
  { t: 3.3, p: {} },
  { t: 3.6, p: { headYaw: 4, twist: 0 } },
  { t: 3.75, e: 'outBack', p: { headRoll: 12, lean: -4 } },                                       // "So how?"
  { t: 4.39, p: {} },
  { t: 4.4, p: { ...OFF, headRoll: 0, lean: 0 } },                                                // (cut) easel
  { t: 18.59, p: {} },
  { t: 18.6, p: { ...HOME2, headPitch: 14 } },                                                    // (cut) phone insert (edit screen)
  { t: 25.39, p: {} },
  { t: 25.4, p: { ...REST_ARMS, headPitch: -2 } },                                                // (cut) CTA
  { t: 26.4, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.3, p: { bFwd: 120 } },
  { t: 29.0, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 0], [1.9, 0], [2.3, 1], [3.3, 1], [3.7, 0], [18.59, 0], [18.6, 1], [30.5, 1]], 1: [[-1, 1], [25.39, 1], [25.4, 0], [30.5, 0]] };
const EXPR = [[-9, 'neutral'], [0.9, 'focus'], [2.2, 'wow'], [3.6, 'puzzled'], [4.4, 'focus'], [18.6, 'focus'], [21.5, 'determined'], [22.7, 'wow'], [24.2, 'proud'], [25.4, 'happy'], [28.4, 'proud']];
const BLINKS = [1.6, 5.3, 9.6, 11.9, 20.3, 24.6, 27.3, 29.3];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.lens, 14) + kick(t, Hh.how, 18) + kick(t, Hh.off, 12) + 6 * Math.sin(t * 3.1);
  if (t > 26.4) { p.headPitch += 3 * Math.sin((t - 26.4) * 5) * Math.exp(-(t - 26.4) * 1.2); p.bFwd += 7 * Math.sin((t - 26.4) * 6.2) * Math.exp(-(t - 26.4) * 0.8); }
  return p;
}
function exprAt(t) { let e = 'neutral'; for (const [t0, x] of EXPR) if (t >= t0) e = x; return e; }
function talkAt(t) { if (!VOICE) return 0; return VOICE[Math.round(t * FPS)] || 0; }
const local = (p, v) => v.clone().applyAxisAngle(V(0, 1, 0), p.rotY * D2R).add(V(p.x, p.hop, p.z));
function solveArm(side, p, target, w) {
  if (w <= 0 || !target) return;
  const tmp = new THREE.Vector3(); const keys = side ? ['bFwd', 'bOut', 'bBend'] : ['aFwd', 'aOut', 'aBend'];
  let x = keys.map((k) => p[k]);
  const lim = [[-60, 200], [-40, 95], [0, 150]];
  const cost = (v) => { docket.setArm(side, v[0], v[1], v[2]); docket.handWorld(side, tmp); return tmp.distanceToSquared(target); };
  let best = cost(x), step = 24;
  for (let it = 0; it < 48 && step > 0.3; it++) {
    let improved = false;
    for (let j = 0; j < 3; j++) for (const s of [1, -1]) {
      const y = x.slice(); y[j] = clamp(y[j] + s * step, lim[j][0], lim[j][1]); const c = cost(y);
      if (c < best) { best = c; x = y; improved = true; }
    }
    if (!improved) step *= 0.5;
  }
  keys.forEach((k, j) => { p[k] = lerp(p[k], x[j], w); });
  docket.setArm(side, p[keys[0]], p[keys[1]], p[keys[2]]);
}

function spot(p, lp, pitch, yawOff = 0) { return { p: local(p, lp), q: Q(pitch, p.rotY * D2R + yawOff) }; }
function phoneSpotAt(t) {
  const p = docketAt(t);
  const LENS = spot(p, V(0.13, 0.66, 0.38), 0.04, Math.PI);         // back (lens) toward the camera, held in front of DOCKET's chest
  const SHOW = spot(p, V(0.0, 1.02, 0.36), -0.06);
  const LOW = spot(p, V(-0.14, 0.62, 0.25), -0.4, 0.2);
  const segs = [[-1, LENS], [4.39, LENS], [4.4, SHOW], [25.39, SHOW], [25.4, LOW]];
  let i = 1; while (i < segs.length - 1 && t > segs[i][0]) i++;
  const [t0, A] = segs[i - 1], [t1, B] = segs[i], k = E.inOutCubic(inv(t0, t1, t));
  return { p: A.p.clone().lerp(B.p, k), q: A.q.clone().slerp(B.q, k) };
}
const onPhone = (x, y, z = 0.02) => phone.localToWorld(V(x, y, z));

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  cardMesh.scale.set(Math.max(0.02, flipScale(t)), 1, 1);
  scene.updateMatrixWorld(true);
  const s = phoneSpotAt(t); phone.position.copy(s.p); phone.quaternion.copy(s.q);
  scene.updateMatrixWorld(true);
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  let tA = onPhone(-0.19, -0.06, 0), tB = onPhone(0.19, -0.06, 0);
  if (t < 4.4) { tA = local(p, V(-0.75, 1.12, 0.3)); tB = onPhone(-0.15, -0.1, 0); }              // hook: A points at the photo, B holds the phone
  if (t >= 25.4) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  // lens ring + label (hook), "?" over DOCKET
  const lr = t >= Hh.lens && t < Hh.cut2 ? E.outBack(inv(Hh.lens, Hh.lens + 0.3, t)) * (1 - inv(3.1, 3.4, t)) : 0;
  lensRing.material.opacity = clamp(lr); lensRing.scale.setScalar(Math.max(0.01, lr)); lensLabel.scale.setScalar(Math.max(0.01, lr)); lensLabel.visible = lr > 0.02;
  const qm = t >= Hh.how && t < Hh.cut2 ? E.outBack(inv(Hh.how, Hh.how + 0.3, t)) : 0;
  { const hp = V(); docket.handWorld(1, hp); qMark.position.copy(local(p, V(-0.1, 1.62, 0.05))); qMark.quaternion.copy(cam.quaternion); qMark.scale.setScalar(Math.max(0.01, qm)); qMark.visible = qm > 0.02; }
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updateCard(t); drawScreen(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const INS = [[-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]];
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const CLOSE = [[-0.375, 1.16, 0.43], [-0.639, 1.16, -0.316]];        // head + hair of the photo, square to the card
const CAM = [
  [0.0, [-0.07, 1.13, 1.3], [-0.64, 1.13, -0.32]], [0.89, [-0.16, 1.13, 1.04], [-0.64, 1.13, -0.32]],
  [0.9, [0.44, 1.2, 2.45], [-0.2, 1.0, 0.0]], [4.39, [0.38, 1.18, 2.28], [-0.2, 1.0, 0.0]],
  [4.4, ...LAB], [10.6, [-0.12, 1.13, 1.13], [-0.64, 1.13, -0.32]], [14.24, [-0.17, 1.14, 0.98], [-0.64, 1.14, -0.32]],
  [14.25, [-0.36, 1.16, 0.48], [-0.639, 1.16, -0.316]], [18.59, ...CLOSE],
  [18.6, ...INS], [25.39, [-0.03, 1.15, 1.86], [-0.03, 1.12, 0.88]],
  [25.4, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.cut1, 0.008, 0.1, 40) + kick(t, Hh.flip1, 0.006, 0.08, 40) + kick(t, Hh.off, 0.005, 0.08, 40);
  cam.position.set(pos[0] + shake + 0.006 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.005 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}

// ------------------------------------------------------------------ overlay: captions in the upper safe band (ink y 344–520)
let ICON = null;
const CAP_TOP = 344, CAP_MAXW = 900;
function overlay(t) {
  const c = octx;
  for (const cap of C.captions) {
    if (t < cap.t0 || t >= cap.t1) continue;
    const kin = E.outCubic(inv(cap.t0, cap.t0 + 0.22, t)), kout = 1 - E.inQuad(inv(cap.t1 - 0.16, cap.t1, t));
    let size = 60; c.save(); c.letterSpacing = '0px'; c.textBaseline = 'middle';
    const ICONW = 58;
    const lineW = (ln) => ln.reduce((a, [s]) => a + (s === '@icon' ? ICONW + 14 : c.measureText(s).width), 0);
    for (;;) { c.font = `700 ${size}px ${HI}`; if (Math.max(...cap.lines.map(lineW)) <= CAP_MAXW - 72 || size <= 44) break; size -= 2; }
    const lh = Math.round(size * 1.14), padY = 20, bh = cap.lines.length * lh + padY * 2;
    const lw = Math.min(CAP_MAXW, Math.max(...cap.lines.map(lineW)) + 72);
    const cy = CAP_TOP + bh / 2;
    c.globalAlpha = kout * kin; c.translate(W / 2, cy); c.scale(0.94 + 0.06 * kin, 0.94 + 0.06 * kin); c.translate(-W / 2, -cy);
    c.fillStyle = 'rgba(11,16,32,0.74)'; c.beginPath(); c.roundRect(W / 2 - lw / 2, CAP_TOP, lw, bh, 28); c.fill();
    c.strokeStyle = 'rgba(108,218,126,0.35)'; c.lineWidth = 2; c.stroke();
    cap.lines.forEach((ln, li) => {
      let x = W / 2 - lineW(ln) / 2; const yy = CAP_TOP + padY + lh * li + lh / 2 + 2;
      for (const [s, col] of ln) {
        if (s === '@icon') { if (ICON) { c.save(); c.beginPath(); c.roundRect(x, yy - ICONW / 2, ICONW, ICONW, 14); c.clip(); c.drawImage(ICON, x, yy - ICONW / 2, ICONW, ICONW); c.restore(); } x += ICONW + 14; continue; }
        c.fillStyle = col === 1 ? P.mint : col === 2 ? AMBER : '#F4F7FB'; c.fillText(s, x, yy); x += c.measureText(s).width;
      }
    });
    c.restore();
  }
  // vignette (pilot)
  const v = c.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.48, H * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)');
  c.fillStyle = v; c.fillRect(0, 0, W, H);
}

// QA: exact caption geometry for frame t (same layout maths as overlay(); measures only, draws nothing)
window.captionBoxes = (t) => {
  const c = octx, outBoxes = [];
  for (const cap of C.captions) {
    if (t < cap.t0 || t >= cap.t1) continue;
    const kin = E.outCubic(inv(cap.t0, cap.t0 + 0.22, t));
    let size = 60; c.save(); c.letterSpacing = '0px'; c.textBaseline = 'middle';
    const ICONW = 58, lineW = (ln) => ln.reduce((a, [s]) => a + (s === '@icon' ? ICONW + 14 : c.measureText(s).width), 0);
    for (;;) { c.font = `700 ${size}px ${HI}`; if (Math.max(...cap.lines.map(lineW)) <= CAP_MAXW - 72 || size <= 44) break; size -= 2; }
    const lh = Math.round(size * 1.14), padY = 20, bh = cap.lines.length * lh + padY * 2, lw = Math.min(CAP_MAXW, Math.max(...cap.lines.map(lineW)) + 72), cy = CAP_TOP + bh / 2, sc = 0.94 + 0.06 * kin;
    const S = (x, y) => [W / 2 + (x - W / 2) * sc, cy + (y - cy) * sc];
    let ink = [1e9, 1e9, -1e9, -1e9];
    cap.lines.forEach((ln, li) => {
      let x = W / 2 - lineW(ln) / 2; const yy = CAP_TOP + padY + lh * li + lh / 2 + 2;
      for (const [s2] of ln) {
        let x0 = x, x1, y0, y1;
        if (s2 === '@icon') { x1 = x + ICONW; y0 = yy - ICONW / 2; y1 = yy + ICONW / 2; x += ICONW + 14; }
        else { const m = c.measureText(s2); x0 = x - m.actualBoundingBoxLeft; x1 = x + m.actualBoundingBoxRight; y0 = yy - m.actualBoundingBoxAscent; y1 = yy + m.actualBoundingBoxDescent; x += m.width; if (!s2.trim()) continue; }
        ink = [Math.min(ink[0], x0), Math.min(ink[1], y0), Math.max(ink[2], x1), Math.max(ink[3], y1)];
      }
    });
    c.restore();
    const [ix0, iy0] = S(ink[0], ink[1]), [ix1, iy1] = S(ink[2], ink[3]), [px0, py0] = S(W / 2 - lw / 2, CAP_TOP), [px1, py1] = S(W / 2 + lw / 2, CAP_TOP + bh);
    outBoxes.push({ t0: cap.t0, lines: cap.lines.length, size, ink: [ix0, iy0, ix1, iy1].map((v) => +v.toFixed(1)), pill: [px0, py0, px1, py1].map((v) => +v.toFixed(1)) });
  }
  return outBoxes;
};
window.renderAt = (t) => {
  cameraAt(t); stageAt(t);             // camera first: the "?" label billboards to this frame's camera
  renderer.render(scene, cam);
  octx.setTransform(1, 0, 0, 1, 0, 0); octx.drawImage(glCanvas, 0, 0);
  overlay(t);
  return true;
};
window.renderSheet = () => true;

window.READY = (async () => {
  await Promise.all(['700 40px "Space Grotesk"', '500 40px "Space Grotesk"', '700 20px "JetBrains Mono"'].map((f) => document.fonts.load(f)));
  await Promise.all(['700 40px "Noto Sans Devanagari"', '500 40px "Noto Sans Devanagari"'].map((f) => document.fonts.load(f, 'हिन्दी फ़ोटो')));
  await Promise.all(['800 40px "Space Grotesk"'].map((f) => document.fonts.load(f)));
  const img = new Image(); img.src = '/assets/icon.png'; await img.decode(); ICON = img;
  try { const r = await fetch('/voice.json'); if (r.ok) VOICE = await r.json(); } catch (e) { /* no lip-sync data */ }
  buildStage();
  window.renderAt(0);
  return document.fonts.check('700 40px "Space Grotesk"') && document.fonts.check('700 40px "Noto Sans Devanagari"', 'हिन्दी');
})();
