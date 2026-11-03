// eraser.js — Ideaverse production 30s hindi-03 #01 (Hindi): remove a background distraction from a photo.
// Accepted renderer kept: copied from round-02 src/stage/ocr.js (feedback-round renderer = education pilot-01 engine:
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
const HI = '"Space Grotesk", "Noto Sans Devanagari"';          // Latin from Space Grotesk, Devanagari from Noto Sans Devanagari
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function check(g, x, y, s, col, lw) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y + s * 0.5); g.lineTo(x + s * 0.38, y + s * 0.88); g.lineTo(x + s, y); g.stroke(); g.restore(); }
function cross(g, x, y, s, col, lw) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s, y + s); g.moveTo(x + s, y); g.lineTo(x, y + s); g.stroke(); g.restore(); }
function tag(g, x, y, txt, fg, bg, size = 26) { g.save(); g.font = `700 ${size}px ${HI}`; const w = g.measureText(txt).width + 30; g.fillStyle = bg; rr(g, x - w, y, w, size + 20, (size + 20) / 2); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, x - w + 15, y + (size + 20) / 2 + 2); g.restore(); }

// ---- the personal photo (original illustration, fictional): a friend flying a kite in a park, a dustbin behind
const PW = 600, PH = 800;
const BIN = { x: 410, y: 418, w: 124, h: 192 };                 // dustbin bbox (photo px)
const SHADOW = { x: 506, y: 608, rx: 74, ry: 15 };              // its shadow on the grass (missed by the first selection)
const GRID = { c: 4, r: 6 };                                     // fill patches over the dustbin bbox
let cleanCanvas = null;                                          // the scene without the dustbin (what the AI should predict)
function drawScene(g, withBin) {
  const sky = g.createLinearGradient(0, 0, 0, 470); sky.addColorStop(0, '#1F3354'); sky.addColorStop(0.65, '#3E7A8A'); sky.addColorStop(1, '#F2C27A');
  g.fillStyle = sky; g.fillRect(0, 0, PW, 480);
  g.fillStyle = '#FFE2A8'; g.beginPath(); g.arc(470, 395, 46, 0, 7); g.fill();                            // low sun
  g.fillStyle = '#2E5E57'; g.beginPath(); g.moveTo(0, 470); g.quadraticCurveTo(160, 380, 330, 455); g.quadraticCurveTo(470, 410, 600, 450); g.lineTo(600, 520); g.lineTo(0, 520); g.fill();
  const grass = g.createLinearGradient(0, 470, 0, PH); grass.addColorStop(0, '#4FAE62'); grass.addColorStop(1, '#2F7D45'); g.fillStyle = grass; g.fillRect(0, 478, PW, PH - 478);
  g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 3; for (let i = 0; i < 26; i++) { const x = (i * 97) % 600, y = 520 + ((i * 53) % 260); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y - 12); g.stroke(); }
  g.fillStyle = '#244B3A'; g.beginPath(); g.arc(90, 400, 70, 0, 7); g.arc(140, 380, 55, 0, 7); g.fill(); g.fillStyle = '#3B2A22'; g.fillRect(104, 430, 18, 70);   // tree
  // kite + string
  g.save(); g.translate(150, 150); g.rotate(-0.25); g.fillStyle = AMBER; g.beginPath(); g.moveTo(0, -46); g.lineTo(36, 0); g.lineTo(0, 58); g.lineTo(-36, 0); g.closePath(); g.fill(); g.strokeStyle = '#E58A2E'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -46); g.lineTo(0, 58); g.moveTo(-36, 0); g.lineTo(36, 0); g.stroke(); g.restore();
  g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 2; g.beginPath(); g.moveTo(160, 205); g.quadraticCurveTo(220, 380, 268, 470); g.stroke();
  // the friend (simple illustrated figure)
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(250, 742, 70, 12, 0, 0, 7); g.fill();
  g.fillStyle = '#1B2333'; g.fillRect(222, 610, 26, 130); g.fillRect(256, 610, 26, 130);                  // legs
  g.fillStyle = P.mint; rr(g, 200, 470, 104, 160, 34); g.fill();                                           // shirt
  g.strokeStyle = P.mint; g.lineWidth = 24; g.lineCap = 'round'; g.beginPath(); g.moveTo(292, 500); g.lineTo(272, 470); g.stroke();   // arm up to the string
  g.fillStyle = '#F3D2B3'; g.beginPath(); g.arc(252, 430, 46, 0, 7); g.fill();                              // face
  g.fillStyle = '#2B1E18'; g.beginPath(); g.arc(252, 414, 48, Math.PI, 0); g.fill();                        // hair
  g.fillStyle = '#1B2333'; g.beginPath(); g.arc(236, 434, 5, 0, 7); g.arc(268, 434, 5, 0, 7); g.fill();
  g.strokeStyle = '#1B2333'; g.lineWidth = 4; g.beginPath(); g.arc(252, 444, 16, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  if (withBin) {
    g.fillStyle = 'rgba(0,0,0,0.30)'; g.beginPath(); g.ellipse(SHADOW.x, SHADOW.y, SHADOW.rx, SHADOW.ry, 0, 0, 7); g.fill();
    g.fillStyle = '#5E6B80'; g.beginPath(); g.moveTo(BIN.x + 14, BIN.y + 30); g.lineTo(BIN.x + BIN.w - 14, BIN.y + 30); g.lineTo(BIN.x + BIN.w - 24, BIN.y + BIN.h); g.lineTo(BIN.x + 24, BIN.y + BIN.h); g.closePath(); g.fill();
    g.fillStyle = '#4A5568'; rr(g, BIN.x, BIN.y + 12, BIN.w, 24, 8); g.fill(); rr(g, BIN.x + 44, BIN.y, 36, 14, 6); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 5; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(BIN.x + 42 + i * 20, BIN.y + 50); g.lineTo(BIN.x + 44 + i * 18, BIN.y + BIN.h - 16); g.stroke(); }
  }
}
function cell(i) { const cw = BIN.w / GRID.c, ch = BIN.h / GRID.r, c = i % GRID.c, r = Math.floor(i / GRID.c); return [BIN.x + c * cw, BIN.y + r * ch, cw, ch]; }
const NCELL = GRID.c * GRID.r;
// photo state: lifted (0..1 bin gone), filled (cells done), shadow (1 = still there), ring amber/mint highlights
function drawPhoto(g, s) {
  drawScene(g, s.lifted < 1);
  if (s.lifted >= 1) {
    for (let i = 0; i < NCELL; i++) {
      const [x, y, w, h] = cell(i);
      if (i < s.filled) continue;                                   // already predicted: clean background shows
      for (let yy = 0; yy < h; yy += 12) for (let xx = 0; xx < w; xx += 12) { g.fillStyle = ((xx + yy) / 12) % 2 ? '#C9CED8' : '#F4F7FB'; g.fillRect(x + xx, y + yy, Math.min(12, w - xx), Math.min(12, h - yy)); }   // the gap
    }
  }
  if (s.lifted >= 1 && s.shadow > 0) { g.save(); g.globalAlpha = s.shadow; g.fillStyle = 'rgba(0,0,0,0.30)'; g.beginPath(); g.ellipse(SHADOW.x, SHADOW.y, SHADOW.rx, SHADOW.ry, 0, 0, 7); g.fill(); g.restore(); }
  if (s.ringBin > 0) { g.save(); g.globalAlpha = s.ringBin; g.strokeStyle = AMBER; g.lineWidth = 9; g.setLineDash([22, 14]); g.lineDashOffset = -s.t * 60; g.shadowColor = AMBER; g.shadowBlur = 18; g.beginPath(); g.ellipse(BIN.x + BIN.w / 2, BIN.y + BIN.h / 2, 96, 122, 0, 0, 7); g.stroke(); g.restore(); }
  if (s.edge > 0) { g.save(); g.globalAlpha = s.edge; g.strokeStyle = P.mint; g.lineWidth = 6; g.setLineDash([16, 10]); g.strokeRect(BIN.x - 6, BIN.y - 6, BIN.w + 12, BIN.h + 12); g.restore(); }
  if (s.reSel > 0 && s.shadow > 0) { g.save(); g.strokeStyle = 'rgba(108,218,126,0.95)'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.ellipse(SHADOW.x, SHADOW.y, SHADOW.rx + 8, SHADOW.ry + 10, 0, -2.2, -2.2 + Math.PI * 2.05 * s.reSel); g.stroke(); g.restore(); }
  if (s.ringShadow > 0) { g.save(); g.globalAlpha = s.ringShadow; g.strokeStyle = s.fixed ? P.mint : AMBER; g.lineWidth = 8; g.shadowColor = g.strokeStyle; g.shadowBlur = 16; g.beginPath(); g.ellipse(SHADOW.x, SHADOW.y, SHADOW.rx + 22, SHADOW.ry + 22, 0, 0, 7); g.stroke(); g.restore(); }
}
let binOnlyCanvas = null;   // the dustbin cut-out texture

// ------------------------------------------------------------------ scene objects
let docket, cab, gaugeNeedle, gaugeGlowHi, delDr, photoDr, delGlow, board, photoCanvas, photoMesh, phone, screenCanvas, screenMesh, cutout, patches = [];
const CAB_POS = V(0.5, 0, 0.1), CAB_YAW = -0.22;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;

function makeCabDrawer(yC, label, bg) {
  const g = new THREE.Group(); g.position.set(0, yC, 0.23); cab.add(g);
  const face = rbox(0.58, 0.28, 0.04, 0.014, mats.shell); face.position.z = 0.02; g.add(face);
  const handle = rbox(0.22, 0.034, 0.034, 0.012, mats.mint); handle.position.set(0, 0.075, 0.056); g.add(handle);
  const lab = labelPlane(THREE, label, 0.3, 0.085, NAVY, bg, `700 {S}px ${HI}`); lab.position.set(0, -0.045, 0.0415); g.add(lab);
  const oc = canvas(512, 192), og = oc.getContext('2d'); og.strokeStyle = bg; og.lineWidth = 16; og.shadowColor = bg; og.shadowBlur = 22; og.beginPath(); og.roundRect(18, 18, 476, 156, 34); og.stroke();
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.15), new THREE.MeshBasicMaterial({ map: cvTex(oc), transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); glow.position.set(0, -0.045, 0.043); g.add(glow);
  for (const [w, h, d, x, y, z] of [[0.53, 0.012, 0.42, 0, -0.12, -0.21], [0.012, 0.17, 0.42, -0.265, -0.04, -0.21], [0.012, 0.17, 0.42, 0.265, -0.04, -0.21], [0.53, 0.17, 0.012, 0, -0.04, -0.42]]) {
    const m = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats.steel)); m.position.set(x, y, z); g.add(m);
  }
  const rec = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.26), mats.recess); rec.position.set(0, yC, 0.2515); cab.add(rec);
  g.userData = { glow, lab };
  return g;
}
function plane(w, h, c, lit = false) {
  const t = cvTex(c);
  const m = lit ? new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.42, roughness: 0.72 }) : new THREE.MeshBasicMaterial({ map: t, toneMapped: false, transparent: true });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
}
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
  for (const [x, y, icon] of [[-1.25, 1.35, 'photo'], [1.45, 1.5, 'sort']]) {   // wall monitors: icons only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.strokeStyle = P.mint; mg.fillStyle = P.mint; mg.lineWidth = 12; mg.lineJoin = 'round'; mg.shadowColor = P.mint; mg.shadowBlur = 16;
    if (icon === 'photo') { mg.strokeRect(150, 70, 212, 160); mg.beginPath(); mg.moveTo(160, 220); mg.lineTo(230, 140); mg.lineTo(280, 190); mg.lineTo(310, 160); mg.lineTo(352, 220); mg.stroke(); mg.beginPath(); mg.arc(310, 110, 16, 0, 7); mg.fill(); }
    else { for (let i = 0; i < 4; i++) { mg.fillStyle = i === 2 ? AMBER : P.mint; mg.fillRect(130, 70 + i * 44, 250 - (i % 2) * 70, 22); } }
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);

  // ----- the personal photo on an easel (round-02 board geometry)
  cleanCanvas = canvas(PW, PH); drawScene(cleanCanvas.getContext('2d'), false);
  binOnlyCanvas = canvas(BIN.w + 8, BIN.h + 8); { const full = canvas(PW, PH); drawScene(full.getContext('2d'), true); binOnlyCanvas.getContext('2d').drawImage(full, BIN.x - 4, BIN.y - 4, BIN.w + 8, BIN.h + 8, 0, 0, BIN.w + 8, BIN.h + 8); }
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  photoCanvas = canvas(PW, PH);
  photoMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(photoCanvas), toneMapped: false })); photoMesh.position.set(0, 1.0, -0.002); board.add(photoMesh);
  const tc = canvas(300, 80); tag(tc.getContext('2d'), 296, 10, 'उदाहरण', NAVY, AMBER, 30);
  const ttag = plane(0.15, 0.04, tc); ttag.position.set(0.215, 1.375, 0.0); board.add(ttag);
  // dustbin cut-out (lifts off the photo) + fill patches (fly in from the surrounding scene)
  cutout = plane(0.6 * (BIN.w + 8) / PW, 0.8 * (BIN.h + 8) / PH, binOnlyCanvas); scene.add(cutout);
  for (let i = 0; i < NCELL; i++) {
    const [x, y, w, h] = cell(i), c = canvas(64, 64); c.getContext('2d').drawImage(cleanCanvas, x, y, w, h, 0, 0, 64, 64);
    const m = plane(0.6 * w / PW, 0.8 * h / PH, c); m.userData = { i, x, y, w, h }; scene.add(m); patches.push(m);
  }

  // ----- cabinet (MAIL SORTER geometry, kept as set dressing): अनुमान meter, drawers
  cab = new THREE.Group(); cab.position.copy(CAB_POS); cab.rotation.y = CAB_YAW; scene.add(cab);
  const base = rbox(0.66, 0.1, 0.52, 0.02, mats.navy); base.position.y = 0.05; cab.add(base);
  const body = rbox(0.62, 0.92, 0.5, 0.05, mats.shell); body.position.y = 0.56; cab.add(body);
  const capTop = rbox(0.64, 0.03, 0.52, 0.01, mats.mint); capTop.position.y = 1.025; cab.add(capTop);
  const gp = rbox(0.56, 0.25, 0.02, 0.02, mats.navy); gp.position.set(0, 0.87, 0.255); cab.add(gp);
  const gd = canvas(640, 286), gg = gd.getContext('2d');
  gg.fillStyle = '#0E1424'; gg.beginPath(); gg.roundRect(0, 0, 640, 286, 24); gg.fill();
  gg.lineWidth = 22; gg.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const a = Math.PI * (1.08 + i * 0.096); gg.strokeStyle = i < 3 ? AMBER : i < 6 ? '#8B93A6' : P.mint; gg.beginPath(); gg.arc(320, 262, 200, a, a + 0.07); gg.stroke(); }
  gg.font = `700 44px ${HI}`; gg.textAlign = 'center'; gg.fillStyle = AMBER; gg.fillText('खाली', 84, 272); gg.fillStyle = P.mint; gg.fillText('भरा', 556, 272);
  gg.fillStyle = '#E9EFF2'; gg.font = `700 46px ${HI}`; gg.fillText('अनुमान', 320, 165);
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.53, 0.237), new THREE.MeshBasicMaterial({ map: cvTex(gd), toneMapped: false })); dial.position.set(0, 0.87, 0.266); cab.add(dial);
  gaugeNeedle = new THREE.Group(); gaugeNeedle.position.set(0, 0.87 - 0.1185 + 0.237 * (24 / 286), 0.27); cab.add(gaugeNeedle);
  const nd = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.15, 0.004), new THREE.MeshBasicMaterial({ color: '#FFFFFF' })); nd.position.y = 0.075; gaugeNeedle.add(nd);
  const hub = new THREE.Mesh(new THREE.CircleGeometry(0.02, 24), new THREE.MeshBasicMaterial({ color: P.mint })); hub.position.z = 0.003; gaugeNeedle.add(hub);
  gaugeGlowHi = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), glowMat(P.mint)); gaugeGlowHi.position.set(0.2, 0.772, 0.268); cab.add(gaugeGlowHi);
  photoDr = makeCabDrawer(0.575, 'फ़ोटो', P.mint);
  delDr = makeCabDrawer(0.265, 'हटाया गया', AMBER);
  delGlow = delDr.userData.glow;
  const reader = new THREE.Group(); reader.position.set(0, 1.04, 0.1); cab.add(reader);
  const lip = rbox(0.52, 0.035, 0.12, 0.01, mats.navy); lip.position.set(0, 0, 0.04); reader.add(lip);
  const rest = rbox(0.5, 0.26, 0.02, 0.01, mats.navy); rest.position.set(0, 0.13, -0.06); rest.rotation.x = -20 * D2R; reader.add(rest);

  // ----- the phone (illustrative example screen; not Google's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  const lens = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 24), mats.mint)); lens.rotation.x = Math.PI / 2; lens.position.set(-0.08, 0.2, -0.019); phone.add(lens);
}

// ------------------------------------------------------------------ photo + phone screen state (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
function photoState(t) {
  const filled = Math.min(NCELL, Math.floor(inv(Hh.fill0, Hh.fill1, t) * NCELL + 1e-6));
  return {
    t: Math.round(t * 10) / 10,
    lifted: t >= Hh.lift ? 1 : 0,
    filled: t >= Hh.lift ? (t >= Hh.fill1 ? NCELL : filled) : 0,
    shadow: t < Hh.shadowFix ? 1 : 1 - q20(inv(Hh.shadowFix, Hh.shadowFix + 0.3, t)),
    ringBin: q20(inv(Hh.point, Hh.point + 0.2, t)) * (1 - q20(inv(Hh.lift - 0.3, Hh.lift, t))),
    edge: q20(inv(Hh.edges, Hh.edges + 0.25, t)) * (1 - q20(inv(Hh.shadowRing - 0.1, Hh.shadowRing + 0.2, t))),
    ringShadow: q20(inv(Hh.shadowRing, Hh.shadowRing + 0.25, t)) * (1 - q20(inv(21.0, 21.3, t))),
    reSel: q20(inv(Hh.shadowFix - 0.4, Hh.shadowFix, t)),
    fixed: t >= Hh.shadowFix + 0.15,
  };
}
let photoKey = '', screenKey = '';
function updatePhoto(t) {
  const s = photoState(t), k = JSON.stringify(s); if (k === photoKey) return; photoKey = k;
  drawPhoto(photoCanvas.getContext('2d'), s); photoMesh.material.map.needsUpdate = true;
}
const SPH = { x: 34, y: 120, w: 480, h: 640 };                // photo area on the phone screen
const spx = (x) => SPH.x + (x / PW) * SPH.w, spy = (y) => SPH.y + (y / PH) * SPH.h;
function drawScreen(t) {
  const mode = t < Hh.freeShow ? 'edit' : 'free';
  const k = { mode, tap: q20(inv(Hh.tap, Hh.tap + 0.35, t)), circ: q20(inv(Hh.circle0, Hh.circle1, t)), sel: q20(inv(Hh.circle1, Hh.circle1 + 0.2, t)),
    sub: q20(inv(Hh.subOk, Hh.subOk + 0.25, t)), dev: q20(inv(Hh.devOk, Hh.devOk + 0.25, t)), ph: photoKey };
  const key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none';
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'उदाहरण', NAVY, AMBER, 26);
  if (mode === 'edit') {
    g.save(); rr(g, SPH.x, SPH.y, SPH.w, SPH.h, 18); g.clip(); g.drawImage(photoCanvas, SPH.x, SPH.y, SPH.w, SPH.h); g.restore();
    const cx = spx(BIN.x + BIN.w / 2), cy = spy(BIN.y + BIN.h / 2);
    if (k.tap > 0 && k.tap < 1) { g.save(); g.globalAlpha = 1 - k.tap; g.strokeStyle = '#F4F7FB'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, 20 + 70 * k.tap, 0, 7); g.stroke(); g.restore(); }
    if (k.circ > 0) {   // the user's rough circle around the dustbin (brush stroke)
      g.save(); g.strokeStyle = 'rgba(108,218,126,0.95)'; g.lineWidth = 14; g.lineCap = 'round'; g.shadowColor = P.mint; g.shadowBlur = 14; g.beginPath();
      const n = 64, a0 = -1.9; for (let i = 0; i <= n * k.circ; i++) { const a = a0 + (i / n) * Math.PI * 2.08, r = 1 + 0.06 * Math.sin(i * 0.7); const x = cx + Math.cos(a) * 82 * r, y = cy + Math.sin(a) * 104 * r; i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); g.restore();
    }
    if (k.sel > 0) { g.save(); g.globalAlpha = 0.35 * k.sel; g.fillStyle = P.mint; g.beginPath(); g.ellipse(cx, cy, 80, 102, 0, 0, 7); g.fill(); g.restore(); }
    // bottom tool row: three generic icons (tap · circle · brush), the circle one active during the selection
    const icons = ['tap', 'circle', 'brush'];
    icons.forEach((ic, i) => {
      const x = 130 + i * 144, y = 880, act = (ic === 'tap' && k.tap > 0 && k.circ === 0) || (ic === 'circle' && k.circ > 0);
      g.fillStyle = act ? P.mint : '#16203A'; g.beginPath(); g.arc(x, y, 50, 0, 7); g.fill();
      g.strokeStyle = act ? NAVY : '#F4F7FB'; g.fillStyle = g.strokeStyle; g.lineWidth = 7; g.lineCap = 'round';
      if (ic === 'tap') { g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); g.beginPath(); g.arc(x, y, 26, 0, 7); g.stroke(); }
      if (ic === 'circle') { g.setLineDash([10, 8]); g.beginPath(); g.arc(x, y, 24, 0, 7); g.stroke(); g.setLineDash([]); }
      if (ic === 'brush') { g.beginPath(); g.moveTo(x - 22, y + 18); g.quadraticCurveTo(x, y - 30, x + 22, y + 4); g.stroke(); }
    });
    return;
  }
  // free / paid checklist (the accurate distinction, see context/17)
  g.fillStyle = '#16203A'; rr(g, 24, 120, SW - 48, 820, 30); g.fill();
  g.fillStyle = '#F4F7FB'; g.font = `700 54px ${HI}`; g.textAlign = 'center'; g.fillText('मैजिक इरेज़र', SW / 2, 200);
  g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `500 34px ${HI}`; g.fillText('गूगल फ़ोटोज़', SW / 2, 258); g.textAlign = 'left';
  const row = (y, label, val, okK, good) => {
    g.fillStyle = '#0E1424'; rr(g, 50, y - 70, SW - 100, 150, 24); g.fill();
    g.fillStyle = 'rgba(244,247,251,0.7)'; g.font = `500 34px ${HI}`; g.fillText(label, 80, y - 22);
    g.fillStyle = good ? P.mint : AMBER; let fs = 50; g.font = `700 ${fs}px ${HI}`; while (g.measureText(val).width > SW - 260 && fs > 32) { fs -= 2; g.font = `700 ${fs}px ${HI}`; } g.fillText(val, 80, y + 36);
    if (okK > 0) { g.save(); g.globalAlpha = okK; check(g, SW - 140, y - 30, 70, P.mint, 13); g.restore(); }
  };
  row(420, 'सब्सक्रिप्शन', 'ज़रूरी नहीं', k.sub, true);
  row(620, 'फ़ोन', 'सपोर्टेड होना चाहिए', k.dev, true);
  g.fillStyle = 'rgba(244,247,251,0.45)'; g.font = `500 30px ${HI}`; g.fillText('3 GB RAM · Android 8 / iOS 15+', 60, 820);
}

// ------------------------------------------------------------------ choreography
const P0 = { x: 0.1, z: 0.36, rotY: -28 };            // beside the photo
const P1 = { x: 0.26, z: 0.24, rotY: -58 };            // stepped aside, watching the photo get filled
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...P0, x: 0.24, crouch: 0.02, lean: 0, headPitch: 6, headYaw: -18 } },
  { t: 0.05, p: {} },
  { t: 0.8, e: 'outBack', p: { ...P0, headYaw: -26, headPitch: 2, lean: 4 } },
  { t: 1.6, p: { headRoll: -10 } },
  { t: 2.15, e: 'outBack', p: { aFwd: 74, aOut: 44, aBend: 8, headRoll: 0, headYaw: -30 } },        // points at the dustbin
  { t: 3.0, p: { aFwd: 70 } },
  { t: 3.3, e: 'inOutCubic', p: { ...REST_ARMS, headYaw: 0, headPitch: 10 } },
  { t: 8.9, p: {} },
  { t: 9.3, e: 'inOutCubic', p: { ...P1, headYaw: -10, headPitch: 4 } },
  { t: 12.0, p: { headPitch: 8, headYaw: -14 } },
  { t: 14.6, p: { headPitch: 2 } },
  { t: 15.2, e: 'outBack', p: { lean: -4 } },
  { t: 18.6, p: { headPitch: 12, lean: 6 } },
  { t: 21.0, e: 'inOutCubic', p: { headPitch: 14, headYaw: 0, lean: 0 } },                       // stays beside the photo (out of the close-up's view)
  { t: 25.6, p: {} },
  { t: 26.15, e: 'inOutCubic', p: { ...HOME2, headPitch: -2 } },                                 // walks to the CTA spot in the wide shot
  { t: 26.5, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.3, p: { bFwd: 120 } },
  { t: 29.0, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 0], [0.05, 0], [0.4, 1], [2.0, 1], [2.15, 0], [3.1, 0], [3.3, 1], [25.6, 1], [30.5, 1]], 1: [[-1, 1], [25.5, 1], [25.7, 0], [30.5, 0]] };
const EXPR = [[-9, 'neutral'], [0.9, 'happy'], [1.6, 'skeptic'], [3.4, 'focus'], [6.6, 'determined'], [8.7, 'happy'], [9.5, 'focus'], [11.0, 'wow'], [14.6, 'happy'], [15.6, 'focus'], [19.8, 'puzzled'], [20.5, 'determined'], [20.8, 'happy'],
  [21.2, 'focus'], [22.65, 'happy'], [24.6, 'proud'], [25.7, 'happy'], [28.4, 'proud']];
const BLINKS = [2.6, 5.2, 7.4, 10.6, 13.6, 17.1, 22.0, 24.0, 27.4, 29.3];
let VOICE = null;

function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  const hops = [[0.05, 0.8], [8.9, 9.3], [25.6, 26.15]];
  for (const [a, b] of hops) if (t > a && t < b) p.hop += 0.03 * Math.abs(Math.sin(((t - a) / (b - a)) * Math.PI * 2));
  p.antenna = kick(t, Hh.point, 14) + kick(t, Hh.lift, 16) + kick(t, Hh.fill1, 12) + kick(t, Hh.shadowFix, 14) + 6 * Math.sin(t * 3.1);
  if (t > 26.5) { p.headPitch += 3 * Math.sin((t - 26.5) * 5) * Math.exp(-(t - 26.5) * 1.2); p.bFwd += 7 * Math.sin((t - 26.5) * 6.2) * Math.exp(-(t - 26.5) * 0.8); }
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

const pulse = (t, a, b) => (t < a || t > b ? 0 : Math.min(inv(a, a + 0.12, t), 1 - inv(b - 0.2, b, t)) * (0.75 + 0.25 * Math.sin((t - a) * 14)));
function spot(p, lp, pitch, yawOff = 0) { return { p: local(p, lp), q: Q(pitch, p.rotY * D2R + yawOff) }; }
function phoneSpotAt(t) {
  const p = docketAt(t);
  const SHOW = spot(p, V(0.0, 1.02 - p.crouch * 0.1, 0.36), -0.06);
  const WAIST = spot(p, V(0.06, 0.74 - p.crouch * 0.1, 0.33), -0.28);
  const LOW = spot(p, V(-0.12, 0.62, 0.25), -0.4, 0.2);
  const segs = [[-1, WAIST], [3.0, WAIST], [3.35, SHOW], [8.9, SHOW], [9.3, WAIST], [20.6, WAIST], [21.0, SHOW], [25.55, SHOW], [26.1, LOW]];
  let i = 1; while (i < segs.length - 1 && t > segs[i][0]) i++;
  const [t0, A] = segs[i - 1], [t1, B] = segs[i], k = E.inOutCubic(inv(t0, t1, t));
  return { p: A.p.clone().lerp(B.p, k), q: A.q.clone().slerp(B.q, k) };
}
function placePhone(t) { const s = phoneSpotAt(t); phone.position.copy(s.p); phone.quaternion.copy(s.q); }
const onPhone = (x, y, z = 0.02) => phone.localToWorld(V(x, y, z));
const screenPt = (u, v) => onPhone((u / SW - 0.5) * SC_W, (0.5 - v / SH) * SC_H, 0.02);
const onPhoto = (px, py, z = 0.004) => board.localToWorld(V((px / PW - 0.5) * 0.6, 1.0 + (0.5 - py / PH) * 0.8, z));
function delOpenAt(t) { return track([[Hh.lift - 0.25, 0], [Hh.lift + 0.05, 1, 'outBack'], [Hh.lift + 1.1, 1], [Hh.lift + 1.4, 0, 'inOutCubic']], t); }
function layoutCutout(t) {
  const t0 = Hh.lift, t1 = Hh.lift + 0.9;
  cutout.visible = t >= t0 && t < t1; if (!cutout.visible) return;
  const k = E.inOutCubic(inv(t0, t1, t));
  const from = onPhoto(BIN.x + BIN.w / 2, BIN.y + BIN.h / 2, 0.01), to = delDr.localToWorld(V(0, -0.02, -0.18));
  const pos = from.clone().lerp(to, k); pos.y += Math.sin(Math.PI * k) * 0.35; pos.z += Math.sin(Math.PI * k) * 0.25;
  cutout.position.copy(pos); cutout.quaternion.copy(board.quaternion).multiply(Q(-0.6 * k, 0.8 * k, 0.9 * Math.sin(Math.PI * k)));
  cutout.scale.setScalar(1 - 0.45 * k);
}
function layoutPatches(t) {
  patches.forEach((m) => {
    const { i, x, y, w, h } = m.userData;
    const ta = Hh.fill0 + (i / NCELL) * (Hh.fill1 - Hh.fill0), tb = ta + 0.42;
    m.visible = t >= ta - 0.02 && t < tb + 0.02; if (!m.visible) return;
    const k = E.outCubic(inv(ta, tb, t));
    const ang = i * 2.399, src = [x + w / 2 + Math.cos(ang) * 150, y + h / 2 + Math.sin(ang) * 120];   // sampled from the surrounding scene
    const a = onPhoto(src[0], clamp(src[1], 20, PH - 20) , 0.06), b = onPhoto(x + w / 2, y + h / 2, 0.006);
    m.position.copy(a.lerp(b, k)); m.quaternion.copy(board.quaternion).multiply(Q(0, 0, (1 - k) * 1.4 * Math.sin(i)));
    m.scale.setScalar(0.7 + 0.3 * k);
  });
}
function needleAt(t) { return lerp(-1.15, 1.12, E.inOutCubic(inv(Hh.fill0, Hh.fill1, t))) * (1 - E.inOutCubic(inv(23.0, 23.6, t))) + -1.15 * E.inOutCubic(inv(23.0, 23.6, t)) + (t >= Hh.fill1 ? 0.04 * Math.sin((t - Hh.fill1) * 20) * Math.exp(-(t - Hh.fill1) * 3) : 0); }

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  delDr.position.z = 0.23 + delOpenAt(t) * 0.36;
  scene.updateMatrixWorld(true);
  placePhone(t);
  scene.updateMatrixWorld(true);
  // ---- IK: phone in both hands (A free while pointing / during the CTA wave B free)
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  let tA = onPhone(-0.19, -0.06, 0), tB = onPhone(0.19, -0.06, 0);
  if (t >= 25.5) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updatePhoto(t); drawScreen(t);
  gaugeNeedle.rotation.z = -needleAt(t);
  gaugeGlowHi.material.opacity = pulse(t, Hh.fill1, Hh.fill1 + 1.0);
  delGlow.material.opacity = 0.8 * pulse(t, Hh.lift - 0.2, Hh.lift + 1.2);
  layoutCutout(t); layoutPatches(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const CAM = [
  [0.0, [-0.14, 1.24, 2.95], [-0.28, 1.03, 0.0]], [3.44, [-0.18, 1.22, 2.65], [-0.28, 1.03, 0.0]],
  [3.45, [-0.571, 1.15, 1.63], [-0.069, 1.12, 0.678]], [9.29, [-0.56, 1.15, 1.57], [-0.069, 1.12, 0.678]],
  [9.3, [-0.12, 1.15, 1.18], [-0.64, 1.13, -0.32]], [15.49, [-0.14, 1.15, 1.1], [-0.64, 1.13, -0.32]],
  [15.5, [-0.17, 0.87, 0.6], [-0.517, 0.84, -0.363]], [21.04, [-0.19, 0.87, 0.52], [-0.517, 0.84, -0.363]],
  [21.05, [-0.95, 1.15, 1.0], [-0.045, 1.12, 0.431]], [25.59, [-0.9, 1.15, 0.97], [-0.045, 1.12, 0.431]],
  [25.6, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.point, 0.005, 0.08, 40) + kick(t, Hh.lift, 0.008, 0.08, 40) + kick(t, Hh.fill1, 0.006, 0.08, 40) + kick(t, Hh.shadowFix, 0.006, 0.08, 40);
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
  stageAt(t); cameraAt(t);
  renderer.render(scene, cam);
  octx.setTransform(1, 0, 0, 1, 0, 0); octx.drawImage(glCanvas, 0, 0);
  overlay(t);
  return true;
};
window.renderSheet = () => true;

window.READY = (async () => {
  await Promise.all(['700 40px "Space Grotesk"', '500 40px "Space Grotesk"', '700 20px "JetBrains Mono"'].map((f) => document.fonts.load(f)));
  await Promise.all(['700 40px "Noto Sans Devanagari"', '500 40px "Noto Sans Devanagari"'].map((f) => document.fonts.load(f, 'हिन्दी फ़ोटो')));
  const img = new Image(); img.src = '/assets/icon.png'; await img.decode(); ICON = img;
  try { const r = await fetch('/voice.json'); if (r.ok) VOICE = await r.json(); } catch (e) { /* no lip-sync data */ }
  buildStage();
  window.renderAt(0);
  return document.fonts.check('700 40px "Space Grotesk"') && document.fonts.check('700 40px "Noto Sans Devanagari"', 'हिन्दी');
})();
