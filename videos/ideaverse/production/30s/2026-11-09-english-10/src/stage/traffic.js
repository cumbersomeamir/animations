// traffic.js — Ideaverse production 30s english-10 #01 (English): how a maps app predicts a traffic jam before you reach it.
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine:
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

// ---- helpers
function chip(g, x, y, txt, a, col, size = 26, fg = NAVY) { if (!(a > 0)) return 0; g.save(); g.globalAlpha = Math.min(1, a); g.translate(x, y); const k = 0.8 + 0.2 * Math.min(1, a); g.scale(k, k); g.font = `800 ${size}px ${HI}`; g.textAlign = 'left'; const w = g.measureText(txt).width + size * 1.1; g.fillStyle = col; rr(g, 0, -size * 0.82, w, size * 1.64, size * 0.82); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, size * 0.55, 2); g.restore(); return w; }
function ring(g, x, y, rx, ry, a, col) { if (!(a > 0)) return; const k = 1.25 - 0.25 * Math.min(1, a); g.save(); g.globalAlpha = Math.min(1, a); g.strokeStyle = col; g.lineWidth = 7; g.shadowColor = col; g.shadowBlur = 14; g.beginPath(); g.ellipse(x, y, rx * k, ry * k, 0, 0, 7); g.stroke(); g.restore(); }
const GREEN = '#4CC07A', RED = '#E5483B';

// ---- the fictional city map (600 x 800 logical, drawn at 2x)
const NW = 600, NH = 800, CS = 2;
const VX = [90, 180, 300, 420, 520], HY = [150, 280, 380, 520, 600, 700];
const ROUTE = [[300, 790], [300, 600], [420, 600], [420, 280], [180, 280], [180, 150]];
const SEG = { A: [0, 1], B: [1, 2], C: [2, 3], D: [3, 4], E: [4, 5] };       // C = the road ahead, D = where the crash happens
const segPt = (s, k) => { const [i, j] = SEG[s]; return [lerp(ROUTE[i][0], ROUTE[j][0], k), lerp(ROUTE[i][1], ROUTE[j][1], k)]; };
const CARS = [['A', 0.2, 0.18], ['A', 0.7, 0.18], ['B', 0.4, 0.25], ['C', 0.15, 0.32], ['C', 0.62, 0.32], ['D', 0.3, 0.2], ['D', 0.8, 0.2], ['E', 0.5, 0.2],
  ['h3', 0.1, 0.15], ['h3', 0.6, 0.15], ['v0', 0.3, 0.12], ['v4', 0.55, 0.14], ['h5', 0.4, 0.16], ['v1', 0.75, 0.12]];
function carPos(spec, t) {
  const [s, p0, v] = spec, k = (p0 + v * t) % 1;
  if (SEG[s]) return segPt(s, k);
  if (s[0] === 'h') { const y = HY[+s.slice(1)]; return [lerp(20, 580, k), y]; }
  const x = VX[+s.slice(1)]; return [x, lerp(780, 40, k)];
}
function segPath(g, s) { const [i, j] = SEG[s]; g.beginPath(); g.moveTo(...ROUTE[i]); g.lineTo(...ROUTE[j]); }
function drawMap(g, s) {
  g.fillStyle = '#1A2741'; g.fillRect(0, 0, NW, NH);
  g.fillStyle = '#213152'; for (let i = 0; i < VX.length - 1; i++) for (let j = 0; j < HY.length - 1; j++) rr(g, VX[i] + 14, HY[j] + 14, VX[i + 1] - VX[i] - 28, HY[j + 1] - HY[j] - 28, 8), g.fill();
  g.fillStyle = '#2E6B4E'; rr(g, 104, 614, 182, 72, 10); g.fill();
  g.strokeStyle = '#2B5F9E'; g.lineWidth = 34; g.beginPath(); g.moveTo(-20, 470); g.bezierCurveTo(200, 430, 380, 480, 620, 430); g.stroke();
  g.strokeStyle = '#3A4A68'; g.lineWidth = 16; g.lineCap = 'round';
  for (const x of VX) { g.beginPath(); g.moveTo(x, 30); g.lineTo(x, 790); g.stroke(); }
  for (const y of HY) { g.beginPath(); g.moveTo(10, y); g.lineTo(590, y); g.stroke(); }
  // route, coloured per segment
  for (const k of Object.keys(SEG)) { g.lineWidth = 14; g.lineCap = 'round'; g.strokeStyle = '#7C879B'; segPath(g, k); g.stroke(); if (s.known > 0) { g.save(); g.globalAlpha = Math.min(1, s.known); g.strokeStyle = GREEN; segPath(g, k); g.stroke(); g.restore(); } }
  if (s.red > 0) {                                   // predicted jam on the road ahead (dashed = predicted)
    g.save(); g.globalAlpha = Math.min(1, s.red); g.strokeStyle = RED; g.lineWidth = 16; g.shadowColor = RED; g.shadowBlur = 18 * (0.6 + 0.4 * Math.sin(s.ph * 9)); segPath(g, 'C'); g.stroke();
    g.shadowBlur = 0; g.strokeStyle = '#FFD1CC'; g.lineWidth = 5; g.setLineDash([14, 12]); segPath(g, 'C'); g.stroke(); g.restore();
  }
  if (s.crash > 0) { g.save(); g.globalAlpha = Math.min(1, s.crash); g.strokeStyle = RED; g.lineWidth = 16; g.shadowColor = RED; g.shadowBlur = 16; segPath(g, 'D'); g.stroke(); g.restore(); }
  // phone dots (cars) moving at their speeds
  if (s.dots > 0) { g.save(); g.globalAlpha = Math.min(1, s.dots); for (const c of CARS) { const [x, y] = carPos(c, s.tt); g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.strokeStyle = P.mint; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 10, 0, 7); g.stroke(); } g.restore(); }
  if (s.speeds > 0) { chip(g, 434, 470, '48 km/h', s.speeds, '#F4F7FB', 22); chip(g, 314, 690, '45 km/h', s.speeds, '#F4F7FB', 22); chip(g, 232, 254, '40 km/h', s.speeds, '#F4F7FB', 22); }
  // destination + you
  g.fillStyle = '#F4F7FB'; g.fillRect(178, 92, 4, 58); g.fillStyle = AMBER; g.beginPath(); g.moveTo(182, 92); g.lineTo(220, 104); g.lineTo(182, 116); g.fill();
  g.fillStyle = 'rgba(244,247,251,0.85)'; g.font = `700 22px ${HI}`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('Office', 196, 136);
  { const y = 735 - 60 * s.you; g.save(); g.shadowColor = P.mint; g.shadowBlur = 16; g.fillStyle = P.mint; g.beginPath(); g.arc(300, y, 17, 0, 7); g.fill(); g.restore(); g.fillStyle = NAVY; g.beginPath(); g.moveTo(300, y - 10); g.lineTo(309, y + 8); g.lineTo(300, y + 3); g.lineTo(291, y + 8); g.fill(); }
  // labels
  if (s.warn > 0) { g.save(); g.globalAlpha = Math.min(1, s.warn); badge(g, 452, 420, 22, '!', RED, '#FFFFFF'); g.restore(); chip(g, s.pred > 0 ? 212 : 268, 500, s.pred > 0 ? 'jam in 12 min' : 'jam ahead', s.warn, RED, 24, '#FFFFFF'); }
  if (s.usual > 0) {                                  // how the road ahead usually flows, by hour
    g.save(); g.globalAlpha = Math.min(1, s.usual); g.fillStyle = 'rgba(11,16,32,0.9)'; rr(g, 16, 560, 270, 226, 18); g.fill(); g.strokeStyle = 'rgba(244,247,251,0.25)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#F4F7FB'; g.font = `800 20px ${HI}`; g.textBaseline = 'middle'; g.fillText('ROAD AHEAD · USUALLY', 32, 586);
    [['4pm', 0.25], ['5pm', 0.5], ['6pm', 0.95], ['7pm', 0.6], ['8pm', 0.3]].forEach(([h, v], i) => { const x = 36 + i * 50, hh = 120 * v * Math.min(1, s.usual * 1.5); const hot = h === '6pm' && s.hour > 0;
      g.fillStyle = v > 0.8 ? RED : v > 0.45 ? AMBER : GREEN; if (hot) { g.shadowColor = RED; g.shadowBlur = 14; } rr(g, x, 740 - hh, 34, hh, 6); g.fill(); g.shadowBlur = 0;
      g.fillStyle = hot ? '#FFFFFF' : 'rgba(244,247,251,0.7)'; g.font = `700 17px ${HI}`; g.textAlign = 'center'; g.fillText(h, x + 17, 760); g.textAlign = 'left'; });
    g.restore(); }
  if (s.hour > 0) chip(g, 22, 532, 'you get there ≈ 6 pm', s.hour, AMBER, 20);
  if (s.crash > 0) { const k = Math.min(1, s.crash); g.save(); g.globalAlpha = k; g.translate(300, 280); g.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k);
    g.fillStyle = '#FFD45C'; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, r = i % 2 ? 18 : 36; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill();
    g.fillStyle = RED; g.font = `900 34px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', 0, 2); g.restore(); ring(g, 300, 280, 62, 50, s.crash, AMBER); chip(g, 226, 330, 'sudden crash', s.crash, AMBER, 22); }
  // ETA chip (top right)
  { const off = s.off > 0, txt = off ? 'ETA 34 min?' : s.eta > 0.5 ? 'ETA 26 min' : 'ETA 18 min', c = off ? AMBER : s.eta > 0.5 ? AMBER : P.mint;
    chip(g, 340, 56, txt, 1, c, 30); if (off && s.off < 1) { g.save(); g.globalAlpha = 1 - s.off; chip(g, 340, 56, 'ETA 26 min', 1, AMBER, 30); g.restore(); } }
  if (s.tagTxt) { g.save(); g.textAlign = 'left'; g.font = `700 20px ${HI}`; g.letterSpacing = '2px'; const w = g.measureText(s.tagTxt).width + 28; g.fillStyle = s.tagCol || P.mint; rr(g, 20, 34, w, 40, 20); g.fill(); g.fillStyle = NAVY; g.textBaseline = 'middle'; g.fillText(s.tagTxt, 34, 56); g.restore(); }
}

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, qMark;
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: route-pin icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 16; mg.strokeStyle = P.mint; mg.lineWidth = 14; mg.lineCap = 'round'; mg.beginPath(); mg.moveTo(120, 240); mg.lineTo(220, 170); mg.lineTo(300, 200); mg.lineTo(390, 100); mg.stroke(); mg.fillStyle = P.mint; mg.beginPath(); mg.arc(390, 92, 26, 0, 7); mg.fill();
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
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  const lens = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 24), mats.mint)); lens.rotation.x = Math.PI / 2; lens.position.set(-0.08, 0.2, -0.019); phone.add(lens);
  qMark = labelPlane(THREE, '?', 0.13, 0.13, NAVY, AMBER, '800 {S}px "Space Grotesk"'); scene.add(qMark);
}

// ------------------------------------------------------------------ card + phone screen states (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
let cardKey = '', screenKey = '';
function flipScale() { return 1; }
function cardState(t) {
  const tt = Math.round(t * FPS) / FPS, ph = Math.round(t * FPS) / FPS;
  if (t < Hh.cut2) { const w = q20(inv(Hh.warn, Hh.warn + 0.3, t)); return { tt, ph, known: 1, dots: 1, red: w, warn: w, eta: q20(inv(Hh.eta, Hh.eta + 0.2, t)), you: 0, tagTxt: 'MAP' }; }
  const pred = q20(inv(Hh.predict, Hh.predict + 0.4, t));
  return { tt, ph, dots: q20(inv(Hh.dots, Hh.dots + 0.4, t)), speeds: q20(inv(Hh.speeds, Hh.speeds + 0.3, t) * (1 - inv(Hh.usual - 0.3, Hh.usual, t))), known: q20(inv(Hh.now, Hh.now + 0.5, t)),
    usual: q20(inv(Hh.usual, Hh.usual + 0.5, t) * (1 - inv(Hh.crash - 0.6, Hh.crash - 0.2, t))), hour: q20(inv(Hh.hour, Hh.hour + 0.3, t) * (1 - inv(Hh.crash - 0.6, Hh.crash - 0.2, t))), red: pred, warn: pred, pred, eta: q20(inv(Hh.predict + 0.3, Hh.predict + 0.5, t)),
    crash: q20(inv(Hh.crash, Hh.crash + 0.3, t)), off: q20(inv(Hh.off, Hh.off + 0.35, t)), you: q20(inv(Hh.cut2, Hh.cut4, t)),
    tagTxt: t < Hh.now ? 'LIVE SPEEDS' : t < Hh.usual ? 'RIGHT NOW' : t < Hh.crash ? 'PREDICTED' : 'SURPRISE', tagCol: t < Hh.usual ? P.mint : AMBER };
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawMap(g, s); tag(g, NW - 22, NH - 62, 'EXAMPLE', NAVY, AMBER, 18); cardMesh.material.map.needsUpdate = true;
}
// phone: illustrative directions screen (generic, not a specific app's UI)
function screenState(t) {
  return { picker: q20(inv(Hh.picker, Hh.picker + 0.3, t) * (1 - inv(Hh.compare - 0.15, Hh.compare, t))), pick: q20(inv(Hh.pick, Hh.pick + 0.2, t)),
    compare: q20(inv(Hh.compare, Hh.compare + 0.35, t)), second: q20(inv(Hh.compare + 0.5, Hh.compare + 0.8, t)), choose: q20(inv(Hh.choose, Hh.choose + 0.3, t)) };
}
function drawScreen(t) {
  const k = screenState(t);
  const key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'EXAMPLE', NAVY, AMBER, 24);
  g.fillStyle = '#F4F7FB'; g.font = `700 36px ${HI}`; g.fillText('Directions', 30, 108);
  g.fillStyle = '#16203A'; rr(g, 26, 140, SW - 52, 130, 20); g.fill();
  g.fillStyle = P.mint; g.beginPath(); g.arc(62, 178, 10, 0, 7); g.fill(); g.fillStyle = '#F4F7FB'; g.font = `700 30px ${HI}`; g.fillText('Home', 90, 178);
  g.fillStyle = AMBER; g.beginPath(); g.moveTo(56, 220); g.lineTo(72, 230); g.lineTo(56, 240); g.fill(); g.fillStyle = '#F4F7FB'; g.fillText('Office', 90, 232);
  const leave = k.pick > 0.5 ? 'Leave at 5:30 pm ▾' : 'Leave now ▾';
  g.save(); g.font = `800 30px ${HI}`; const w = g.measureText(leave).width + 44; g.fillStyle = k.picker > 0 || k.pick > 0 ? P.mint : '#2A3550'; rr(g, 26, 296, w, 62, 31); g.fill(); g.fillStyle = k.picker > 0 || k.pick > 0 ? NAVY : '#F4F7FB'; g.fillText(leave, 48, 328); g.restore();
  if (k.compare <= 0) { g.fillStyle = '#16203A'; rr(g, 26, 384, SW - 52, 110, 20); g.fill(); g.fillStyle = AMBER; g.font = `800 44px ${HI}`; g.fillText('26 min', 52, 426); g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `700 24px ${HI}`; g.fillText('if you leave now', 52, 468); }
  if (k.picker > 0) { g.save(); g.globalAlpha = k.picker; g.fillStyle = '#1B2640'; rr(g, 26, 520, SW - 52, 290, 24); g.fill(); g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `700 24px ${HI}`; g.fillText('Leave at…', 52, 556);
    ['5:30 pm', '5:45 pm', '6:00 pm'].forEach((h, i) => { const y = 612 + i * 66, on = i === 0 && k.pick > 0; if (on) { g.fillStyle = P.mint; rr(g, 40, y - 28, SW - 80, 56, 16); g.fill(); } g.fillStyle = on ? NAVY : '#F4F7FB'; g.font = `800 34px ${HI}`; g.fillText(h, 60, y + 1); }); g.restore(); }
  if (k.compare > 0) {
    g.save(); g.globalAlpha = k.compare; g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `700 24px ${HI}`; g.fillText('Estimated journey time', 30, 410); g.restore();
    const row = (y, a, when, mins, col, on) => { if (!(a > 0)) return; g.save(); g.globalAlpha = a; g.fillStyle = '#16203A'; rr(g, 26, y, SW - 52, 120, 22); g.fill(); g.strokeStyle = col; g.lineWidth = on ? 6 : 3; g.stroke();
      g.fillStyle = '#F4F7FB'; g.font = `700 28px ${HI}`; g.fillText(when, 52, y + 40); g.fillStyle = col; g.font = `800 46px ${HI}`; g.fillText(mins, 52, y + 86); g.restore(); };
    row(440, k.compare, 'Leave 5:30 pm', 'about 21 min', P.mint, k.choose > 0.5); row(584, k.second, 'Leave 6:00 pm', 'about 31 min', AMBER, false);
    if (k.choose > 0) { g.save(); g.globalAlpha = k.choose; g.fillStyle = P.mint; g.beginPath(); g.arc(SW - 80, 500, 30, 0, 7); g.fill(); check(g, SW - 96, 486, 30, NAVY, 7); g.restore(); }
    if (k.second > 0) { g.save(); g.globalAlpha = k.second * 0.8; g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `700 22px ${HI}`; g.fillText('based on usual traffic', 30, 744); g.restore(); }
  }
}

// ------------------------------------------------------------------ choreography
const OFF = { x: 0.3, z: 0.5, rotY: 6 };
const HK = { x: 0.06, z: 0.28, rotY: -14 };
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...OFF } },
  { t: Hh.cut1 - 0.01, p: {} },
  { t: Hh.cut1, p: { ...HK, headYaw: -24, headPitch: 2, twist: -6 } },                         // (cut) two-shot: DOCKET looks at the map
  { t: 2.3, p: {} },
  { t: 2.65, e: 'outBack', p: { headYaw: 6, headRoll: 12, lean: -4, twist: 0 } },               // "warn of a jam?" — head tilt to camera
  { t: Hh.cut2 - 0.01, p: {} },
  { t: Hh.cut2, p: { ...OFF, headRoll: 0, lean: 0, headYaw: 0 } },                             // (cut) easel
  { t: Hh.cut4 - 0.01, p: {} },
  { t: Hh.cut4, p: { ...HOME2, headPitch: 14 } },                                               // (cut) phone insert
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...REST_ARMS, headPitch: -2 } },                                            // (cut) CTA
  { t: 26.4, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.3, p: { bFwd: 120 } },
  { t: 29.0, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 0], [Hh.point - 0.3, 0], [Hh.point + 0.1, 1], [3.9, 1], [4.3, 0], [Hh.cut4 - 0.01, 0], [Hh.cut4, 1], [30.5, 1]], 1: [[-1, 1], [Hh.cta - 0.01, 1], [Hh.cta, 0], [30.5, 0]] };
const EXPR = [[-9, 'neutral'], [Hh.cut1, 'focus'], [2.3, 'puzzled'], [Hh.cut2, 'focus'], [Hh.cut4, 'focus'], [20.4, 'determined'], [22.3, 'wow'], [23.7, 'proud'], [Hh.cta, 'happy'], [28.4, 'proud']];
const BLINKS = [2.1, 5.3, 9.6, 12.9, 19.6, 24.6, 27.3, 29.3];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.how, 18) + kick(t, Hh.choose, 14) + 6 * Math.sin(t * 3.1);
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
  const LOWB = spot(p, V(0.16, 0.62, 0.25), -0.4, -0.2);            // two-shot: held low in hand B
  const SHOW = spot(p, V(0.0, 1.02, 0.36), -0.06);
  const LOW = spot(p, V(-0.14, 0.62, 0.25), -0.4, 0.2);
  const segs = [[-1, LOWB], [Hh.cut2 - 0.01, LOWB], [Hh.cut2, SHOW], [Hh.cta - 0.01, SHOW], [Hh.cta, LOW]];
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
  if (t < Hh.cut2) { tA = local(p, V(-0.75, 1.12, 0.3)); tB = onPhone(0.12, -0.2, 0); }            // two-shot: A points at the card, B holds the phone low
  if (t >= Hh.cta) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  const qm = t >= Hh.how && t < Hh.cut2 ? E.outBack(inv(Hh.how, Hh.how + 0.3, t)) : 0;
  { qMark.position.copy(local(p, V(-0.36, 1.3, 0.22))); /* beside the head, below the caption band */ qMark.quaternion.copy(cam.quaternion); qMark.scale.setScalar(Math.max(0.01, qm)); qMark.visible = qm > 0.02; }
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updateCard(t); drawScreen(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const INS = [[-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]];
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const CRASH = [[-0.227, 1.21, 0.758], [-0.61, 1.21, -0.326]];        // upper map: crash + ETA chip, square to the card
const CAM = [
  [0.0, [-0.07, 1.13, 1.3], [-0.64, 1.13, -0.32]], [Hh.cut1 - 0.01, [-0.15, 1.13, 1.06], [-0.64, 1.13, -0.32]],
  [Hh.cut1, [0.44, 1.2, 2.45], [-0.2, 1.0, 0.0]], [Hh.cut2 - 0.01, [0.38, 1.18, 2.28], [-0.2, 1.0, 0.0]],
  [Hh.cut2, ...LAB], [Hh.push[0], [-0.15, 1.13, 1.06], [-0.64, 1.13, -0.32]], [Hh.push[1], ...CRASH], [Hh.cut4 - 0.01, [-0.244, 1.21, 0.711], [-0.61, 1.21, -0.326]],
  [Hh.cut4, ...INS], [Hh.cta - 0.01, [-0.03, 1.15, 1.86], [-0.03, 1.12, 0.88]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.warn, 0.006, 0.1, 40) + kick(t, Hh.cut1, 0.008, 0.1, 40) + kick(t, Hh.crash, 0.008, 0.08, 40) + kick(t, Hh.choose, 0.005, 0.08, 40);
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
