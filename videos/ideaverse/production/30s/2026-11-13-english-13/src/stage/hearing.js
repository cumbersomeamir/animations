// hearing.js — Ideaverse production 30s english-13 #01 (English): why AI hearing aids pull speech out of noise — and why
// two people talking at once is still hard. Engine header copied unchanged from english-09 photosearch.js (= accepted
// feedback-round renderer = education pilot-01 engine); overlay tail from english-12 (caption safe area x 100..900).
// Only props + choreography are new. Every frame is a pure function of t (window.renderAt).
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

// ---- helpers
function chip(g, x, y, txt, a, col, size = 26, fg = NAVY) { if (!(a > 0)) return 0; g.save(); g.globalAlpha = Math.min(1, a); g.translate(x, y); const k = 0.8 + 0.2 * Math.min(1, a); g.scale(k, k); g.font = `800 ${size}px ${HI}`; g.textAlign = 'left'; const w = g.measureText(txt).width + size * 1.1; g.fillStyle = col; rr(g, 0, -size * 0.82, w, size * 1.64, size * 0.82); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, size * 0.55, 2); g.restore(); return w; }
function bigLabel(g, txt, y, a, col = '#F4F7FB', size = 52) { if (!(a > 0)) return; g.save(); g.globalAlpha = Math.min(1, a); g.font = `800 ${size}px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(txt, NW / 2, y + 10 * (1 - Math.min(1, a))); g.restore(); }
const VA = P.mint, VB = AMBER, VC = '#5AA9FF', NOISE = '#7C6A58', CLINK = '#F4F7FB';

// ---- easel card (600 x 800 logical, drawn at 2x)
const NW = 600, NH = 800, CS = 2;
// hook: a noisy room flowing into a hearing aid (illustration)
function ear(g, cx, cy, s) {
  g.save(); g.translate(cx, cy); g.scale(s, s);
  g.fillStyle = '#E9C9A8'; g.beginPath(); g.moveTo(-10, -70); g.bezierCurveTo(50, -95, 75, -20, 40, 20); g.bezierCurveTo(25, 40, 30, 70, 0, 80); g.bezierCurveTo(-25, 85, -35, 60, -20, 45); g.bezierCurveTo(-45, 10, -50, -55, -10, -70); g.fill();
  g.strokeStyle = '#B98F6B'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-5, -45); g.bezierCurveTo(30, -55, 40, -10, 15, 10); g.stroke();
  g.fillStyle = '#2A3550'; g.beginPath(); g.ellipse(48, -40, 16, 42, 0.35, 0, 7); g.fill(); g.strokeStyle = P.mint; g.lineWidth = 4; g.stroke();               // behind-the-ear hearing aid
  g.strokeStyle = '#2A3550'; g.lineWidth = 5; g.beginPath(); g.moveTo(40, -78); g.quadraticCurveTo(10, -95, 2, -30); g.stroke();
  g.fillStyle = P.mint; g.beginPath(); g.arc(52, -48, 5, 0, 7); g.fill();
  g.restore();
}
const SOURCES = [[60, 230, VA], [540, 260, VB], [80, 640, VC], [520, 650, VA], [300, 170, VB]];
function drawRoom(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  const cx = 300, cy = 470;
  // flows: wave packets travelling from each voice toward the ear; grey noise specks drifting in
  SOURCES.forEach(([x, y, col], i) => {
    g.save(); g.strokeStyle = col; g.lineWidth = 6; g.lineCap = 'round'; g.globalAlpha = 0.9;
    for (let k = 0; k < 3; k++) { const u = ((s.ph * 0.55 + k / 3 + i * 0.17) % 1), px = lerp(x, cx, u), py = lerp(y, cy, u), ang = Math.atan2(cy - y, cx - x);
      g.save(); g.translate(px, py); g.rotate(ang); g.globalAlpha = 0.9 * Math.sin(Math.PI * u); g.beginPath(); for (let j = -26; j <= 26; j += 2) { const yy = 12 * Math.sin(j * 0.45 + s.ph * 9 + i) * Math.cos(j / 26 * Math.PI / 2); j === -26 ? g.moveTo(j, yy) : g.lineTo(j, yy); } g.stroke(); g.restore(); }
    g.restore();
    g.fillStyle = col; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); g.fillStyle = '#0E1424'; g.beginPath(); g.ellipse(x, y + 4, 9, 6, 0, 0, Math.PI); g.fill();                 // talking head icon
  });
  let sd = 11; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let i = 0; i < 46; i++) { const x0 = r() * NW, y0 = 150 + r() * 600, u = (s.ph * 0.3 + r()) % 1; g.fillStyle = `rgba(150,130,110,${(0.55 * Math.sin(Math.PI * u)).toFixed(2)})`; g.fillRect(lerp(x0, cx, u * 0.6) - 4, lerp(y0, cy, u * 0.6) - 4, 8, 8); }
  for (const [x, y] of [[150, 760], [470, 180], [560, 470]]) { g.save(); g.strokeStyle = CLINK; g.lineWidth = 4; g.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(s.ph * 7 + x)); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g.beginPath(); g.moveTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8); g.lineTo(x + Math.cos(a) * 20, y + Math.sin(a) * 20); g.stroke(); } g.restore(); }
  ear(g, cx, cy, 1.25);
  if (!window.THUMB) bigLabel(g, 'WHICH VOICE?', 95, s.which, AMBER, 60);
}
// the time × pitch grid
const COLS = 14, ROWS = 12, GX = 50, GY = 160, GW = 500, GH = 540, CW = GW / COLS, CH = GH / ROWS;
const F0A = [2, 2, 3, 3, 4, 4, 3, 3, 2, 2, 3, 4, 4, 3], ONA = [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1];
const F0B = [3, 4, 4, 5, 5, 4, 3, 3, 4, 5, 5, 4, 3, 3], ONB = [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1];
const HARM = [0, 3, 6];
const cellsOf = (f0, on) => { const out = []; for (let c = 0; c < COLS; c++) if (on[c]) for (const h of HARM) { const r = f0[c] + h; if (r < ROWS) out.push([c, r]); } return out; };
const CA = cellsOf(F0A, ONA), CB = cellsOf(F0B, ONB);
const keyOf = (c, r) => c * 100 + r, SETA = new Set(CA.map(([c, r]) => keyOf(c, r))), SETB = new Set(CB.map(([c, r]) => keyOf(c, r)));
const NOISEC = [], CLINKC = []; { let sd = 77; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let c = 0; c < COLS; c++) for (let rr2 = 0; rr2 < ROWS; rr2++) { if (SETA.has(keyOf(c, rr2))) continue; if (rr2 >= 9 && r() < 0.16) CLINKC.push([c, rr2]); else if (r() < 0.36) NOISEC.push([c, rr2]); } }
const cellXY = (c, r) => [GX + c * CW, GY + GH - (r + 1) * CH];
function tile(g, x, y, col, a = 1, glow = 0) { g.save(); g.globalAlpha = a; g.fillStyle = col; if (glow > 0) { g.shadowColor = col; g.shadowBlur = 16 * glow; } rr(g, x + 2, y + 2, CW - 4, CH - 4, 6); g.fill(); g.restore(); }
function splitTile(g, x, y, a = 1) { g.save(); g.globalAlpha = a; g.beginPath(); g.roundRect(x + 2, y + 2, CW - 4, CH - 4, 6); g.clip(); g.fillStyle = VA; g.beginPath(); g.moveTo(x, y); g.lineTo(x + CW, y); g.lineTo(x, y + CH); g.fill(); g.fillStyle = VB; g.beginPath(); g.moveTo(x + CW, y); g.lineTo(x + CW, y + CH); g.lineTo(x, y + CH); g.fill(); g.restore(); }
function drawGrid(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  g.fillStyle = '#121A2C'; rr(g, GX - 8, GY - 8, GW + 16, GH + 16, 16); g.fill();
  const sliced = (c) => c / COLS < s.slice, kept = (c) => c / COLS < s.keep;
  // the unsliced mixture: one blurred smear
  if (s.slice < 1) { g.save(); g.filter = 'blur(10px)'; g.beginPath(); g.rect(GX + GW * s.slice, GY, GW * (1 - s.slice) + 20, GH); g.clip();
    for (const [c, r] of [...CA, ...NOISEC, ...CLINKC]) { const [x, y] = cellXY(c, r); tile(g, x, y, '#9AA3B5', 0.55); } g.restore(); }
  // sliced tiles
  for (const [c, r] of NOISEC) { if (!sliced(c)) continue; const [x, y] = cellXY(c, r); tile(g, x, y, NOISE, kept(c) ? 0.12 : 0.85); }
  for (const [c, r] of CLINKC) { if (!sliced(c)) continue; const [x, y] = cellXY(c, r); const fall = s.clatter; tile(g, x, y + 160 * fall * fall, CLINK, (kept(c) ? 0.35 : 0.95) * (1 - fall)); }
  const bOn = s.second > 0;
  for (const [c, r] of CA) { if (!sliced(c)) continue; const [x, y] = cellXY(c, r); const both = bOn && SETB.has(keyOf(c, r));
    if (both && s.second >= 1) splitTile(g, x, y); else tile(g, x, y, VA, 1, kept(c) ? 0.5 + 0.5 * s.stay : 0); }
  if (bOn) for (const [c, r] of CB) { if (SETA.has(keyOf(c, r)) && s.second >= 1) continue; const [x, y] = cellXY(c, r); tile(g, x, y, VB, Math.min(1, s.second)); }
  if (s.q > 0) for (const [c, r] of CB) if (SETA.has(keyOf(c, r))) { const [x, y] = cellXY(c, r); g.save(); g.globalAlpha = s.q; g.fillStyle = '#0E1424'; g.font = `900 30px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', x + CW / 2, y + CH / 2 + 2); g.restore(); }
  // the slicing lines + mask sweep
  if (s.slice > 0 && s.slice < 1) { const x = GX + GW * s.slice; g.save(); g.strokeStyle = P.mint; g.lineWidth = 5; g.shadowColor = P.mint; g.shadowBlur = 16; g.beginPath(); g.moveTo(x, GY - 10); g.lineTo(x, GY + GH + 10); g.stroke(); g.restore(); }
  if (s.slice > 0) { g.save(); g.strokeStyle = 'rgba(244,247,251,0.12)'; g.lineWidth = 2; for (let c = 1; c < COLS; c++) { if (!sliced(c)) break; g.beginPath(); g.moveTo(GX + c * CW, GY); g.lineTo(GX + c * CW, GY + GH); g.stroke(); }
    for (let r = 1; r < ROWS; r++) { g.beginPath(); g.moveTo(GX, GY + r * CH); g.lineTo(GX + GW * s.slice, GY + r * CH); g.stroke(); } g.restore(); }
  if (s.keep > 0 && s.keep < 1) { const x = GX + GW * s.keep; g.save(); g.fillStyle = 'rgba(108,218,126,0.16)'; g.fillRect(GX, GY, x - GX, GH); g.restore(); }
  if (s.axes > 0) { g.save(); g.globalAlpha = Math.min(1, s.axes); g.fillStyle = '#F4F7FB'; g.font = `800 26px ${HI}`; g.textBaseline = 'middle';
    g.textAlign = 'left'; g.fillText('TIME →', GX, GY + GH + 40); g.save(); g.translate(GX - 26, GY + GH / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillText('PITCH →', 0, 0); g.restore(); g.restore(); }
  bigLabel(g, s.label[0], 88, s.label[1], s.label[2], 52);
}
function drawTurns(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  g.fillStyle = '#121A2C'; rr(g, GX - 8, GY - 8, GW + 16, GH + 16, 16); g.fill();
  const k = s.turns, sc = lerp(1, 0.5, k);
  for (const [c, r] of CA) { const [x0, y] = cellXY(c, r); const x = GX + (x0 - GX) * sc; const both = SETB.has(keyOf(c, r)) && k <= 0; if (both) splitTile(g, x0, y); else { g.save(); g.translate(x, 0); g.scale(sc, 1); g.translate(-x, 0); tile(g, x, y, VA, 1, s.ok); g.restore(); } }
  for (const [c, r] of CB) { if (SETA.has(keyOf(c, r)) && k <= 0) continue; const [x0, y] = cellXY(c, r); const x = GX + (x0 - GX) * sc + GW * 0.5 * k; g.save(); g.translate(x, 0); g.scale(sc, 1); g.translate(-x, 0); tile(g, x, y, VB, 1, s.ok); g.restore(); }
  if (k > 0.5) { g.save(); g.globalAlpha = Math.min(1, (k - 0.5) * 2); g.strokeStyle = 'rgba(244,247,251,0.35)'; g.setLineDash([10, 10]); g.lineWidth = 3; g.beginPath(); g.moveTo(GX + GW / 2, GY); g.lineTo(GX + GW / 2, GY + GH); g.stroke(); g.restore(); }
  if (s.ok > 0) { for (const [x, col] of [[GX + GW * 0.25, VA], [GX + GW * 0.75, VB]]) { g.save(); g.globalAlpha = s.ok; g.fillStyle = col; g.beginPath(); g.arc(x, GY - 26, 24, 0, 7); g.fill(); check(g, x - 13, GY - 39, 26, NAVY, 6); g.restore(); } }
  g.save(); g.fillStyle = '#F4F7FB'; g.font = `800 26px ${HI}`; g.textAlign = 'left'; g.textBaseline = 'middle'; if (s.ok <= 0) g.fillText('TIME →', GX, GY + GH + 40); g.restore();
  bigLabel(g, s.ok > 0 ? 'ONE AT A TIME' : 'TAKE TURNS', 80, 1, P.mint, 52);
}

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, chipM, holo;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: sound-bars icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 14; for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) { mg.fillStyle = (i + j) % 3 ? P.mint : AMBER; mg.globalAlpha = 0.4 + 0.6 * ((i * 7 + j * 3) % 5) / 4; mg.fillRect(150 + i * 32, 80 + j * 38, 26, 30); } mg.globalAlpha = 1;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // the hearing-aid AI chip (generic) + its hologram card
  chipM = new THREE.Group(); const body = rbox(0.07, 0.012, 0.07, 0.006, mats.navy); chipM.add(body); const die = rbox(0.036, 0.006, 0.036, 0.004, mats.mint); die.position.y = 0.008; chipM.add(die);
  for (let i = 0; i < 6; i++) for (const s2 of [-1, 1]) { const pin = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.012), mats.steel); pin.position.set(-0.025 + i * 0.01, 0, s2 * 0.04); chipM.add(pin); const pin2 = pin.clone(); pin2.rotation.y = Math.PI / 2; pin2.position.set(s2 * 0.04, 0, -0.025 + i * 0.01); chipM.add(pin2); }
  chipM.visible = false; scene.add(chipM);
  { const c = canvas(768, 576); holo = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.3), new THREE.MeshBasicMaterial({ map: cvTex(c), transparent: true, depthWrite: false, toneMapped: false })); holo.userData.c = c; holo.visible = false; holo.renderOrder = 5; scene.add(holo); }
}

// ------------------------------------------------------------------ card + hologram states (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
const q40 = (v) => Math.round(clamp(v) * 40) / 40;
let cardKey = '';
function cardState(t) {
  const ph = Math.round(t * FPS) / FPS;
  if (t < Hh.cut2) return { face: 'room', ph, which: q20(inv(Hh.which, Hh.which + 0.3, t)) };
  if (t < Hh.cut4) {
    const lab = t >= Hh.overlap ? ['OVERLAP', AMBER] : t >= Hh.second ? ['SECOND VOICE', AMBER] : t >= Hh.stay ? ['VOICES STAY', P.mint] : t >= Hh.keep[0] ? ['KEEP SPEECH', P.mint] : t >= Hh.slice[0] ? ['PITCH × TIME', '#F4F7FB'] : ['SOUND', '#F4F7FB'];
    const la = t >= Hh.overlap ? inv(Hh.overlap, Hh.overlap + 0.3, t) : t >= Hh.second ? inv(Hh.second, Hh.second + 0.3, t) : t >= Hh.stay ? inv(Hh.stay, Hh.stay + 0.3, t) : t >= Hh.keep[0] ? inv(Hh.keep[0], Hh.keep[0] + 0.3, t) : t >= Hh.slice[0] ? inv(Hh.slice[0], Hh.slice[0] + 0.3, t) : inv(Hh.cut2 + 0.1, Hh.cut2 + 0.4, t);
    return { face: 'grid', slice: q40(inv(Hh.slice[0], Hh.slice[1], t)), axes: q20(inv(Hh.axes, Hh.axes + 0.3, t) * (1 - inv(Hh.second - 0.3, Hh.second, t))), keep: q40(inv(Hh.keep[0], Hh.keep[1], t)),
      clatter: q20(inv(Hh.clatter, Hh.clatter + 0.45, t)), stay: q20(Math.sin(Math.PI * inv(Hh.stay, Hh.stay + 0.8, t))), second: q20(inv(Hh.second, Hh.second + 0.4, t) * 1.02), q: q20(inv(Hh.overlap, Hh.overlap + 0.3, t)),
      label: [lab[0], q20(la), lab[1]] };
  }
  return { face: 'turns', turns: q40(E.inOutCubic(inv(Hh.turns[0], Hh.turns[1], t))), ok: q20(inv(Hh.ok, Hh.ok + 0.3, t)) };
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px'; g.filter = 'none';
  if (s.face === 'room') drawRoom(g, s); else if (s.face === 'grid') drawGrid(g, s); else drawTurns(g, s);
  tag(g, NW - 22, NH - 62, 'EXAMPLE', NAVY, AMBER, 18); cardMesh.material.map.needsUpdate = true;
}
let holoKey = '';
function drawHolo(t) {                                              // the chip's hologram: speech kept (mint wave rises), noise dropped (grey specks fall)
  const ph = Math.round(t * FPS) / FPS, a = q20(inv(Hh.chip, Hh.chip + 0.3, t)), p = q20(inv(Hh.pull, Hh.pull + 0.4, t)), key = `${ph}|${a}|${p}`; if (key === holoKey) return; holoKey = key;
  const c = holo.userData.c, g = c.getContext('2d'), W2 = c.width, H2 = c.height; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W2, H2);
  g.fillStyle = 'rgba(11,16,32,0.88)'; g.beginPath(); g.roundRect(6, 6, W2 - 12, H2 - 12, 40); g.fill(); g.strokeStyle = P.mint; g.lineWidth = 6; g.stroke();
  g.fillStyle = P.mint; g.font = `800 ${Math.round(H2 * 0.16)}px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('AI CHIP', W2 / 2, H2 * 0.17);
  // left: SPEECH ↑ (kept)   right: NOISE ↓ (dropped)
  g.font = `800 ${Math.round(H2 * 0.1)}px ${HI}`; g.fillStyle = '#F4F7FB'; g.fillText('SPEECH', W2 * 0.28, H2 * 0.86); g.fillText('NOISE', W2 * 0.72, H2 * 0.86);
  g.save(); g.strokeStyle = P.mint; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 40; i++) { const x = W2 * 0.12 + i * (W2 * 0.32 / 40), y = H2 * 0.5 - p * H2 * 0.08 + 22 * Math.sin(i * 0.6 + ph * 10); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
  if (p > 0) { g.fillStyle = P.mint; g.beginPath(); g.arc(W2 * 0.28, H2 * 0.3, 18, 0, 7); g.fill(); check(g, W2 * 0.28 - 10, H2 * 0.3 - 10, 20, NAVY, 5); }
  let sd = 5; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let i = 0; i < 26; i++) { const x = W2 * 0.58 + r() * W2 * 0.3, y0 = H2 * 0.32 + r() * H2 * 0.36, fall = p * ((ph * 0.8 + r()) % 1); g.fillStyle = `rgba(150,130,110,${(0.9 * (1 - p * 0.75)).toFixed(2)})`; g.fillRect(x - 7, y0 + fall * H2 * 0.25 - 7, 14, 14); }
  holo.material.map.needsUpdate = true; holo.material.opacity = a;
}

// ------------------------------------------------------------------ choreography
const OFF = { x: 0.3, z: 0.5, rotY: 6 };
const HK = { x: 0.06, z: 0.28, rotY: -14 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...OFF } },
  { t: Hh.cut1 - 0.01, p: {} },
  { t: Hh.cut1, p: { ...HK, headYaw: 4, headPitch: 6 } },                                         // (cut) two-shot: DOCKET shows the chip
  { t: Hh.chip - 0.2, p: {} },
  { t: Hh.chip + 0.25, e: 'outBack', p: { headYaw: 18, headPitch: 12 } },                        // looks at the chip
  { t: Hh.cut2 - 0.01, p: {} },
  { t: Hh.cut2, p: { ...OFF, headYaw: 0, headPitch: 0 } },                                        // (cut) easel
  { t: Hh.cut4 - 0.01, p: {} },
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...REST_ARMS, headPitch: -2, headYaw: 0, twist: 0 } },                        // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 0], [30.5, 0]], 1: [[-1, 0], [Hh.cut1 - 0.01, 0], [Hh.cut1 + 0.35, 1], [Hh.cut2 - 0.01, 1], [Hh.cut2, 0], [30.5, 0]] };
const EXPR = [[-9, 'neutral'], [Hh.cut1, 'focus'], [Hh.pull, 'happy'], [Hh.cut2, 'focus'], [Hh.cut4, 'focus'], [Hh.ok, 'proud'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [4.4, 9.6, 12.9, 17.5, 22.8, 25.9, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.chip, 14) + kick(t, Hh.ok, 14) + 6 * Math.sin(t * 3.1);
  if (t > 27.9) { p.headPitch += 3 * Math.sin((t - 27.9) * 5) * Math.exp(-(t - 27.9) * 1.2); p.bFwd += 7 * Math.sin((t - 27.9) * 6.2) * Math.exp(-(t - 27.9) * 0.8); }
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

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  const palm = local(p, V(0.24, 0.98, 0.36));                       // B holds the chip up in the two-shot
  const tA = local(p, V(-0.75, 1.12, 0.3)), tB = palm;               // A points at the card in the payoff two-shot
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  const showChip = t >= Hh.cut1 && t < Hh.cut2;
  chipM.visible = showChip; if (showChip) { const hb = V(); docket.handWorld(1, hb); chipM.position.copy(hb).add(V(0, 0.08, 0)); chipM.rotation.set(0.6, t * 0.6, 0); chipM.scale.setScalar(2.2); }
  holo.visible = showChip && t >= Hh.chip; if (holo.visible) { drawHolo(t); holo.position.copy(local(p, V(-0.17, 1.13, 0.52))); holo.quaternion.copy(cam.quaternion); const k = E.outBack(inv(Hh.chip, Hh.chip + 0.3, t)); holo.scale.setScalar(Math.max(0.01, 0.8 * k)); }
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updateCard(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const PUSH = [[-0.3, 1.16, 0.62], [-0.64, 1.16, -0.32]];          // closer on the overlapping tiles
const CAM = [
  [0.0, [-0.07, 1.13, 1.3], [-0.64, 1.13, -0.32]], [Hh.cut1 - 0.01, [-0.16, 1.13, 1.04], [-0.64, 1.13, -0.32]],
  [Hh.cut1, [0.44, 1.2, 2.45], [-0.2, 1.0, 0.0]], [Hh.cut2 - 0.01, [0.38, 1.18, 2.28], [-0.2, 1.0, 0.0]],
  [Hh.cut2, ...LAB], [Hh.push[0], [-0.13, 1.13, 1.12], [-0.64, 1.13, -0.32]], [Hh.push[1], ...PUSH], [Hh.cut4 - 0.01, [-0.32, 1.16, 0.58], [-0.64, 1.16, -0.32]],
  [Hh.cut4, ...LAB], [Hh.cta - 0.01, [-0.15, 1.13, 1.05], [-0.64, 1.13, -0.32]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.which, 0.006, 0.1, 40) + kick(t, Hh.overlap, 0.006, 0.1, 40) + kick(t, Hh.ok, 0.005, 0.08, 40);
  cam.position.set(pos[0] + shake + 0.006 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.005 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: the noisy room flowing into a hearing aid + 2 large words
window.renderThumb = () => {
  window.THUMB = true; cardKey = ''; const t = 2.6; cameraAt(t); stageAt(t); renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, 'rgba(8,11,22,0.92)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 900);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['WHICH', '#F4F7FB', 400], ['VOICE?', AMBER, 600]].forEach(([w, col, y]) => { let S = 220; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 26; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
  const v = c.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.48, H * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  window.THUMB = false; return true;
};

// ------------------------------------------------------------------ overlay: captions in the upper safe band (ink y 344–520)
let ICON = null;
const CAP_TOP = 344, CAP_MAXW = 800, CX = 500;   // 2026-11-11 safe area: x 100..900, y 230..1500
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
    c.globalAlpha = kout * kin; c.translate(CX, cy); c.scale(0.94 + 0.06 * kin, 0.94 + 0.06 * kin); c.translate(-CX, -cy);
    c.fillStyle = 'rgba(11,16,32,0.74)'; c.beginPath(); c.roundRect(CX - lw / 2, CAP_TOP, lw, bh, 28); c.fill();
    c.strokeStyle = 'rgba(108,218,126,0.35)'; c.lineWidth = 2; c.stroke();
    cap.lines.forEach((ln, li) => {
      let x = CX - lineW(ln) / 2; const yy = CAP_TOP + padY + lh * li + lh / 2 + 2;
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
    const S = (x, y) => [CX + (x - CX) * sc, cy + (y - cy) * sc];
    let ink = [1e9, 1e9, -1e9, -1e9];
    cap.lines.forEach((ln, li) => {
      let x = CX - lineW(ln) / 2; const yy = CAP_TOP + padY + lh * li + lh / 2 + 2;
      for (const [s2] of ln) {
        let x0 = x, x1, y0, y1;
        if (s2 === '@icon') { x1 = x + ICONW; y0 = yy - ICONW / 2; y1 = yy + ICONW / 2; x += ICONW + 14; }
        else { const m = c.measureText(s2); x0 = x - m.actualBoundingBoxLeft; x1 = x + m.actualBoundingBoxRight; y0 = yy - m.actualBoundingBoxAscent; y1 = yy + m.actualBoundingBoxDescent; x += m.width; if (!s2.trim()) continue; }
        ink = [Math.min(ink[0], x0), Math.min(ink[1], y0), Math.max(ink[2], x1), Math.max(ink[3], y1)];
      }
    });
    c.restore();
    const [ix0, iy0] = S(ink[0], ink[1]), [ix1, iy1] = S(ink[2], ink[3]), [px0, py0] = S(CX - lw / 2, CAP_TOP), [px1, py1] = S(CX + lw / 2, CAP_TOP + bh);
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
