// ocr.js — Ideaverse production 30s round-02 #01 "How your phone reads text from a photo".
// Accepted renderer kept: copied from feedback-round src/stage/spam.js (itself the education pilot-01 engine: same
// renderer, lights, newsroom stage, materials, camera system, DOCKET rig and caption pill). Only props + choreography
// are new. Every frame is a pure function of t (window.renderAt).
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
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function check(g, x, y, s, col, lw) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y + s * 0.5); g.lineTo(x + s * 0.38, y + s * 0.88); g.lineTo(x + s, y); g.stroke(); g.restore(); }
function tag(g, x, y, txt, fg, bg, size = 26) { g.save(); g.font = `700 ${size}px "JetBrains Mono"`; g.letterSpacing = '4px'; const w = g.measureText(txt).width + 30; g.fillStyle = bg; rr(g, x - w, y, w, size + 18, (size + 18) / 2); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, x - w + 15, y + (size + 18) / 2 + 1); g.restore(); }

// ---- the bus-stop timetable board (fictional example). Layout constants are reused by the phone screen + highlights.
const BW = 600, BH = 800;
const BRD = { head: [40, 36, 520, 150], station: [300, 252], times: [[150, 430, '08:15'], [450, 430, '08:45'], [150, 560, '09:15'], [450, 560, '09:45']], fare: [300, 690] };
function drawBoard(g, glow = {}) {
  g.fillStyle = '#16203A'; g.fillRect(0, 0, BW, BH);
  g.strokeStyle = P.mint; g.lineWidth = 10; rr(g, 8, 8, BW - 16, BH - 16, 26); g.stroke();
  g.fillStyle = P.mint; rr(g, ...BRD.head, 26); g.fill();
  g.fillStyle = NAVY; g.font = '700 112px "Space Grotesk"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BUS 42', 300, 116);
  g.fillStyle = '#F4F7FB'; g.font = '700 54px "Space Grotesk"'; g.fillText('Central Station', ...BRD.station);
  g.fillStyle = 'rgba(244,247,251,0.25)'; g.fillRect(60, 318, 480, 4);
  g.fillStyle = 'rgba(244,247,251,0.65)'; g.font = '700 30px "JetBrains Mono"'; g.letterSpacing = '6px'; g.fillText('DEPARTS', 300, 358); g.letterSpacing = '0px';
  g.fillStyle = '#F4F7FB'; g.font = '700 96px "Space Grotesk"';
  for (const [x, y, s] of BRD.times) g.fillText(s, x, y);
  g.fillStyle = AMBER; g.font = '700 56px "JetBrains Mono"'; g.fillText('FARE 2.20', ...BRD.fare);
  tag(g, BW - 36, BH - 74, 'EXAMPLE', 'rgba(244,247,251,0.7)', 'rgba(244,247,251,0.10)', 22);
  for (const [k, v] of Object.entries(glow)) {
    if (v <= 0) continue;
    const [x, y] = k === 'fare' ? BRD.fare : BRD.times[0];
    g.save(); g.globalAlpha = Math.min(1, v); g.strokeStyle = P.mint; g.lineWidth = 10; g.shadowColor = P.mint; g.shadowBlur = 26;
    rr(g, x - (k === 'fare' ? 190 : 140) - 16 * (1 - Math.min(1, v)), y - 62, (k === 'fare' ? 380 : 280) + 32 * (1 - Math.min(1, v)), 124, 26); g.stroke(); g.restore();
  }
  g.textAlign = 'left';
}
// ---- menu card (fictional example, Spanish)
const MW = 1024, MH = 698;
const MENU = [['Sopa del día', 'Soup of the day', '4,50 €'], ['Pan con tomate', 'Bread with tomato', '3,00 €'], ['Agua', 'Water', '1,50 €']];
function drawMenu(g) {
  g.fillStyle = '#FBF8F1'; g.fillRect(0, 0, MW, MH);
  g.strokeStyle = 'rgba(27,35,51,0.16)'; g.lineWidth = 8; g.strokeRect(14, 14, MW - 28, MH - 28);
  g.fillStyle = NAVY; g.font = '700 92px "Space Grotesk"'; g.textBaseline = 'alphabetic'; g.textAlign = 'center'; g.fillText('MENÚ DEL DÍA', MW / 2, 140);
  g.fillStyle = P.mint; g.fillRect(MW / 2 - 140, 168, 280, 8);
  g.textAlign = 'left';
  MENU.forEach(([es, , pr], i) => { const y = 300 + i * 130; g.fillStyle = NAVY; g.font = '500 70px "Space Grotesk"'; g.fillText(es, 70, y); g.font = '700 64px "JetBrains Mono"'; g.textAlign = 'right'; g.fillText(pr, MW - 70, y); g.textAlign = 'left'; });
  tag(g, MW - 40, 34, 'EXAMPLE', 'rgba(27,35,51,0.62)', 'rgba(27,35,51,0.10)', 26);
}
// ---- character tiles + learned-pattern cards
const CANDS = ['3', 'B', '6', '8', '0', 'S', '9'];
const MATCH_I = 3;                                     // '8'
const VARIANTS = ['700 150px "Space Grotesk"', '700 150px serif', '700 140px "JetBrains Mono"', 'italic 700 150px serif', '500 150px "Space Grotesk"', 'hand', 'dots', 'outline'];
function glyph(g, ch, w, h, font, col) {
  g.save(); g.fillStyle = col; g.strokeStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (font === 'hand') { g.lineWidth = 13; g.lineCap = 'round'; g.beginPath(); g.ellipse(w / 2 + 4, h * 0.34, 34, 30, -0.2, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(w / 2 - 2, h * 0.66, 42, 38, 0.15, 0, Math.PI * 2); g.stroke(); }
  else if (font === 'dots') { const pat = ['01110', '10001', '10001', '01110', '10001', '10001', '01110']; for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (pat[r][c] === '1') { g.beginPath(); g.arc(w / 2 - 44 + c * 22, h / 2 - 66 + r * 22, 8.5, 0, 7); g.fill(); } }
  else if (font === 'outline') { g.font = '700 156px "Space Grotesk"'; g.lineWidth = 7; g.strokeText(ch, w / 2, h / 2 + 6); }
  else { g.font = font; g.fillText(ch, w / 2, h / 2 + 8); }
  g.restore();
}
function cardCanvas(ch, font, glow) {
  const c = canvas(200, 260), g = c.getContext('2d');
  g.fillStyle = '#FBF8F1'; rr(g, 4, 4, 192, 252, 22); g.fill();
  if (glow) { g.strokeStyle = P.mint; g.lineWidth = 12; rr(g, 8, 8, 184, 244, 20); g.stroke(); }
  glyph(g, ch, 200, 260, font || '700 150px "Space Grotesk"', NAVY);
  return c;
}

// ------------------------------------------------------------------ scene objects
let docket, cab, gaugeNeedle, gaugeGlowHi, numDr, letDr, numGlow, board, boardCanvas, boardMesh, phone, screenCanvas, screenMesh, flashLight, flashGlow;
let menuCard, menuCanvas, tile, tileCanvas, chip, cards = [], variants = [];
const CAB_POS = V(0.5, 0, 0.1), CAB_YAW = -0.22;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;

function makeCabDrawer(yC, label, bg) {
  const g = new THREE.Group(); g.position.set(0, yC, 0.23); cab.add(g);
  const face = rbox(0.58, 0.28, 0.04, 0.014, mats.shell); face.position.z = 0.02; g.add(face);
  const handle = rbox(0.22, 0.034, 0.034, 0.012, mats.mint); handle.position.set(0, 0.075, 0.056); g.add(handle);
  const lab = labelPlane(THREE, label, 0.3, 0.085, NAVY, bg); lab.position.set(0, -0.045, 0.0415); g.add(lab);
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
  for (const [x, y, icon] of [[-1.25, 1.35, 'text'], [1.45, 1.5, 'sort']]) {   // wall monitors: icons only, no text
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.strokeStyle = P.mint; mg.fillStyle = P.mint; mg.lineWidth = 12; mg.lineJoin = 'round'; mg.shadowColor = P.mint; mg.shadowBlur = 16;
    if (icon === 'text') { mg.strokeRect(150, 70, 212, 160); for (let i = 0; i < 3; i++) mg.fillRect(180, 105 + i * 38, 150 - i * 30, 14); }
    else { for (let i = 0; i < 4; i++) { mg.fillStyle = i === 2 ? AMBER : P.mint; mg.fillRect(130, 70 + i * 44, 250 - (i % 2) * 70, 22); } }
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);

  // ----- bus-stop timetable board (left of stage)
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  const post = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 1.5, 16), mats.steel)); post.position.set(-0.36, 0.75, -0.02); board.add(post);
  const disc = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.025, 32), mats.mint)); disc.rotation.x = Math.PI / 2; disc.position.set(-0.36, 1.52, 0); board.add(disc);
  const foot = rbox(0.2, 0.04, 0.2, 0.01, mats.navy); foot.position.set(-0.36, 0.02, -0.02); board.add(foot);
  const frame = rbox(0.64, 0.84, 0.04, 0.02, mats.navy); frame.position.set(0, 1.0, -0.025); board.add(frame);
  boardCanvas = canvas(BW, BH); drawBoard(boardCanvas.getContext('2d'));
  boardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(boardCanvas), toneMapped: false })); boardMesh.position.set(0, 1.0, -0.002); board.add(boardMesh);

  // ----- pattern library cabinet: MATCH meter, LETTERS + NUMBERS drawers (MAIL SORTER geometry from feedback-01)
  cab = new THREE.Group(); cab.position.copy(CAB_POS); cab.rotation.y = CAB_YAW; scene.add(cab);
  const base = rbox(0.66, 0.1, 0.52, 0.02, mats.navy); base.position.y = 0.05; cab.add(base);
  const body = rbox(0.62, 0.92, 0.5, 0.05, mats.shell); body.position.y = 0.56; cab.add(body);
  const capTop = rbox(0.64, 0.03, 0.52, 0.01, mats.mint); capTop.position.y = 1.025; cab.add(capTop);
  const gp = rbox(0.56, 0.25, 0.02, 0.02, mats.navy); gp.position.set(0, 0.87, 0.255); cab.add(gp);
  const gd = canvas(640, 286), gg = gd.getContext('2d');
  gg.fillStyle = '#0E1424'; gg.beginPath(); gg.roundRect(0, 0, 640, 286, 24); gg.fill();
  gg.lineWidth = 22; gg.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const a = Math.PI * (1.08 + i * 0.096); gg.strokeStyle = i < 3 ? AMBER : i < 6 ? '#8B93A6' : P.mint; gg.beginPath(); gg.arc(320, 262, 200, a, a + 0.07); gg.stroke(); }
  gg.font = '700 44px "JetBrains Mono"'; gg.textAlign = 'center'; gg.fillStyle = AMBER; gg.fillText('LOW', 80, 274); gg.fillStyle = P.mint; gg.fillText('HIGH', 556, 274);
  gg.fillStyle = '#E9EFF2'; gg.font = '700 40px "JetBrains Mono"'; gg.letterSpacing = '6px'; gg.fillText('MATCH', 320, 160);
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.53, 0.237), new THREE.MeshBasicMaterial({ map: cvTex(gd), toneMapped: false })); dial.position.set(0, 0.87, 0.266); cab.add(dial);
  gaugeNeedle = new THREE.Group(); gaugeNeedle.position.set(0, 0.87 - 0.1185 + 0.237 * (24 / 286), 0.27); cab.add(gaugeNeedle);
  const nd = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.15, 0.004), new THREE.MeshBasicMaterial({ color: '#FFFFFF' })); nd.position.y = 0.075; gaugeNeedle.add(nd);
  const hub = new THREE.Mesh(new THREE.CircleGeometry(0.02, 24), new THREE.MeshBasicMaterial({ color: P.mint })); hub.position.z = 0.003; gaugeNeedle.add(hub);
  gaugeGlowHi = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), glowMat(P.mint)); gaugeGlowHi.position.set(0.2, 0.772, 0.268); cab.add(gaugeGlowHi);
  letDr = makeCabDrawer(0.575, 'LETTERS', P.mint);
  numDr = makeCabDrawer(0.265, 'NUMBERS', P.mint);
  numGlow = numDr.userData.glow;
  const reader = new THREE.Group(); reader.position.set(0, 1.04, 0.1); cab.add(reader);   // letter stand kept as set dressing
  const lip = rbox(0.52, 0.035, 0.12, 0.01, mats.navy); lip.position.set(0, 0, 0.04); reader.add(lip);
  const rest = rbox(0.5, 0.26, 0.02, 0.01, mats.navy); rest.position.set(0, 0.13, -0.06); rest.rotation.x = -20 * D2R; reader.add(rest);

  // ----- candidate pattern cards (rise from NUMBERS) + learned variants of '8'
  CANDS.forEach((ch, i) => { const m = plane(0.1, 0.13, cardCanvas(ch, null, false), true); m.userData = { ch, i, glowC: cardCanvas(ch, null, true) }; scene.add(m); cards.push(m); });
  VARIANTS.forEach((f, i) => { const m = plane(0.1, 0.13, cardCanvas('8', f, false), true); scene.add(m); variants.push(m); });
  // ----- the character tile: the blurry '8' cut from the photo, turning crisp after the match
  tileCanvas = canvas(200, 250);
  tile = new THREE.Group(); scene.add(tile);
  const tb = rbox(0.1, 0.125, 0.02, 0.008, mats.navy); tile.add(tb);
  const tf = plane(0.092, 0.115, tileCanvas); tf.position.z = 0.0105; tile.add(tf); tile.userData.face = tf;
  // ----- copied-time chip (flies into DOCKET's NOTES drawer)
  const cc = canvas(400, 150), cg = cc.getContext('2d'); cg.fillStyle = P.mint; rr(cg, 4, 4, 392, 142, 40); cg.fill(); cg.fillStyle = NAVY; cg.font = '700 96px "Space Grotesk"'; cg.textAlign = 'center'; cg.textBaseline = 'middle'; cg.fillText('08:15', 200, 80);
  chip = plane(0.16, 0.06, cc); scene.add(chip);
  // ----- menu card (pops out of DOCKET's SOURCES drawer)
  menuCanvas = canvas(MW, MH); drawMenu(menuCanvas.getContext('2d'));
  menuCard = new THREE.Group(); scene.add(menuCard);
  const mb = rbox(0.44, 0.3, 0.012, 0.006, mats.paper); menuCard.add(mb);
  const mf = plane(0.434, 0.294, menuCanvas, true); mf.position.z = 0.0065; menuCard.add(mf);
  // ----- the phone (illustrative example screen; not any real app's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  const lens = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 24), mats.mint)); lens.rotation.x = Math.PI / 2; lens.position.set(-0.08, 0.2, -0.019); phone.add(lens);
  const lens2 = new THREE.Mesh(new THREE.CircleGeometry(0.019, 24), M('#05070C', { roughness: 0.1, metalness: 0.6 })); lens2.position.set(-0.08, 0.2, -0.0256); lens2.rotation.y = Math.PI; phone.add(lens2);
  flashGlow = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), glowMat('#ffffff')); flashGlow.position.set(-0.02, 0.2, -0.027); flashGlow.rotation.y = Math.PI; phone.add(flashGlow);
  flashLight = new THREE.PointLight('#ffffff', 0, 3, 1.6); scene.add(flashLight);
}

// ------------------------------------------------------------------ phone screen (illustrative; drawn per state)
let screenState = '';
const SCR = { x: 24, y: 118, w: 500, h: 667 };              // photo area on the screen (board aspect 3:4)
const bx = (x) => SCR.x + (x / BW) * SCR.w, by = (y) => SCR.y + (y / BH) * SCR.h, bs = SCR.w / BW;
function drawScreen(t) {
  const mode = t < Hh.snap ? 'view' : t < Hh.realText ? 'photo' : t < Hh.menuShow ? 'text' : t < Hh.blurShow ? 'menu' : t < Hh.fixTime ? 'blur' : 'fixed';
  const q = (v) => Math.round(clamp(v) * 20) / 20;
  const k = {
    boxes: q(inv(Hh.boxes0, Hh.boxes0 + 1.4, t)), ret: q(inv(Hh.tileHome, Hh.tileHome + 0.6, t)), real: q(inv(Hh.realText, Hh.realText + 0.7, t)),
    sel: q(inv(Hh.tap - 0.1, Hh.tap + 0.1, t)), bubble: q(inv(Hh.tap + 0.12, Hh.tap + 0.3, t)), copied: q(inv(Hh.copied, Hh.copied + 0.15, t)),
    tr: [0, 1, 2].map((i) => q(inv(Hh.trans[i], Hh.trans[i] + 0.3, t))), mis: q(inv(Hh.misShow, Hh.misShow + 0.3, t)), fix: q(inv(Hh.fixTime, Hh.fixTime + 0.3, t)), fare: q(inv(Hh.fixFare, Hh.fixFare + 0.3, t)),
    flash: q(1 - inv(Hh.snap, Hh.snap + 0.35, t)), hole: t >= Hh.tileOut && t < Hh.tileHome + 0.6 ? 1 : 0,
  };
  const key = mode + JSON.stringify(k) + (mode === 'view' ? Math.round(t * 10) : '');
  if (key === screenState) return; screenState = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none';
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  // status row + EXAMPLE tag
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 22, 'EXAMPLE', NAVY, AMBER, 24);
  const photo = (blur = 0, alpha = 1) => { g.save(); g.globalAlpha = alpha; if (blur) g.filter = `blur(${blur}px)`; g.drawImage(boardCanvas, SCR.x, SCR.y, SCR.w, SCR.h); g.restore(); };
  const box = (x, y, w, h, a, col = P.mint, lw = 5) => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = lw; g.shadowColor = col; g.shadowBlur = 10; rr(g, bx(x), by(y), w * bs, h * bs, 10); g.stroke(); g.restore(); };
  const panel = (y, h) => { g.fillStyle = '#16203A'; rr(g, 20, y, SW - 40, h, 26); g.fill(); };
  if (mode === 'view') {
    photo(0, 0.85);
    g.strokeStyle = '#F4F7FB'; g.lineWidth = 6; for (const [x, y, sx, sy] of [[SCR.x + 20, SCR.y + 20, 1, 1], [SCR.x + SCR.w - 20, SCR.y + 20, -1, 1], [SCR.x + 20, SCR.y + SCR.h - 20, 1, -1], [SCR.x + SCR.w - 20, SCR.y + SCR.h - 20, -1, -1]]) { g.beginPath(); g.moveTo(x, y + 50 * sy); g.lineTo(x, y); g.lineTo(x + 50 * sx, y); g.stroke(); }
    g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(SW / 2, 905, 56, 0, 7); g.fill(); g.strokeStyle = '#0B1020'; g.lineWidth = 6; g.beginPath(); g.arc(SW / 2, 905, 46, 0, 7); g.stroke();
    return;
  }
  if (mode === 'photo' || mode === 'text') {
    photo(0, 1 - 0.85 * k.real);
    // text finding: block → lines → words (ML Kit structure)
    if (k.real < 1) {
      const a = 1 - k.real;
      box(30, 26, 540, 700, a * clamp(k.boxes * 4), 'rgba(108,218,126,0.55)', 4);
      [[40, 36, 520, 150], [70, 210, 460, 84], [40, 380, 520, 100], [40, 510, 520, 100], [110, 650, 380, 80]].forEach(([x, y, w, h], i) => box(x, y, w, h, a * clamp((k.boxes - 0.25 - i * 0.1) * 5)));
      BRD.times.forEach(([x, y], i) => box(x - 126, y - 52, 252, 104, a * clamp((k.boxes - 0.75 - i * 0.05) * 6), AMBER, 4));
      if (k.hole) { g.fillStyle = 'rgba(11,16,32,0.92)'; g.fillRect(bx(BRD.times[0][0] + 36), by(BRD.times[0][1] - 46), 50 * bs, 92 * bs); }
    }
    // recognised text panel (assembles after the tile comes back), then becomes the real-text view
    if (k.ret > 0 || mode === 'text') {
      const ph = 140 + 560 * k.real, py = 800 - 680 * k.real;
      g.save(); g.globalAlpha = Math.max(k.ret, k.real); panel(py, Math.min(ph, SH - py - 30));
      const lines = [['BUS 42', 64, '#F4F7FB'], ['Central Station', 46, 'rgba(244,247,251,0.8)'], ['08:15   08:45', 60, '#F4F7FB'], ['09:15   09:45', 60, '#F4F7FB'], ['FARE 2.20', 46, AMBER]];
      const n = Math.max(1, Math.round(lines.length * Math.max(k.ret, k.real)));
      if (k.real < 0.05) { g.font = '700 54px "Space Grotesk"'; g.fillStyle = '#F4F7FB'; g.fillText('BUS 42 · 08:15'.slice(0, Math.max(2, Math.round(14 * k.ret))), 50, py + 70); }
      else lines.slice(0, n).forEach(([s, sz, col], i) => {
        const yy = py + 70 + i * 104;
        if (i === 2 && k.sel > 0) { g.fillStyle = `rgba(108,218,126,${0.35 * k.sel})`; rr(g, 40, yy - 44, 196, 88, 12); g.fill(); g.fillStyle = P.mint; for (const xh of [40, 236]) { g.fillRect(xh - 3, yy - 44, 6, 88); g.beginPath(); g.arc(xh, xh === 40 ? yy - 50 : yy + 50, 10, 0, 7); g.fill(); } }
        g.font = `700 ${sz}px "Space Grotesk"`; g.fillStyle = col; g.fillText(s, 50, yy);
      });
      g.restore();
      if (k.bubble > 0) { g.save(); g.globalAlpha = k.bubble; const yy = py + 70 + 2 * 104 - 128; g.fillStyle = '#F4F7FB'; rr(g, 40, yy - 38, 200, 76, 38); g.fill(); g.fillStyle = NAVY; g.font = '700 44px "Space Grotesk"'; g.fillText(k.copied > 0 ? 'Copied' : 'Copy', 70, yy + 2); if (k.copied > 0) check(g, 196, yy - 18, 30, '#2FA052', 8); g.restore(); }
    }
    return;
  }
  if (mode === 'menu') {
    g.drawImage(menuCanvas, 14, 200, 520, 354);
    MENU.forEach(([, en, pr], i) => {
      const f = k.tr[i]; if (f <= 0) return;
      const y = 200 + (300 + i * 130) / MH * 354, sy = Math.abs(Math.cos(Math.PI * Math.min(1, f) * 0.5 + (f < 0.5 ? 0 : Math.PI * 0.5)));
      g.save(); g.translate(0, y - 16); g.scale(1, f < 0.5 ? 1 - 2 * f : 2 * f - 1); g.fillStyle = f < 0.5 ? '#FBF8F1' : '#F4F7FB';
      rr(g, 30, -36, 488, 72, 14); g.fill(); g.strokeStyle = P.mint; g.lineWidth = 5; g.stroke();
      if (f >= 0.5) { g.fillStyle = NAVY; let fs = 40; g.font = `700 ${fs}px "Space Grotesk"`; while (g.measureText(en).width > 330 && fs > 28) { fs -= 2; g.font = `700 ${fs}px "Space Grotesk"`; } g.fillText(en, 44, 2); g.font = '700 32px "JetBrains Mono"'; g.textAlign = 'right'; g.fillText(pr, 506, 2); g.textAlign = 'left'; }
      g.restore();
    });
    g.fillStyle = P.mint; g.font = '700 36px "JetBrains Mono"'; g.textAlign = 'center'; g.fillText('ES  →  EN', SW / 2, 650); g.textAlign = 'left';
    return;
  }
  // blurry photo → misread, then double-checked
  photo(7, 0.9);
  panel(640, 370);
  g.font = '700 54px "Space Grotesk"'; g.fillStyle = '#F4F7FB'; g.fillText('BUS 42', 50, 705);
  const tx = 50, ty = 820;
  g.font = '700 112px "Space Grotesk"';
  if (k.fix < 1) { g.globalAlpha = 1 - k.fix; g.fillStyle = AMBER; g.fillText('06', tx, ty); g.fillStyle = '#F4F7FB'; g.fillText(':15', tx + g.measureText('06').width, ty); g.fillStyle = AMBER; g.fillText('?', tx + 330, ty);
    g.strokeStyle = AMBER; g.lineWidth = 7; rr(g, tx - 14, ty - 70, 150, 130, 18); if (k.mis > 0) { g.globalAlpha = (1 - k.fix) * k.mis; g.stroke(); } g.globalAlpha = 1; }
  if (k.fix > 0) { g.globalAlpha = k.fix; g.fillStyle = P.mint; g.fillText('08:15', tx, ty); check(g, tx + 330, ty - 60, 70, P.mint, 14); g.globalAlpha = 1; }
  g.font = '700 60px "JetBrains Mono"'; g.fillStyle = AMBER; g.fillText('FARE 2.20', 50, 950); if (k.fare > 0) { g.globalAlpha = k.fare; check(g, 400, 912, 56, P.mint, 12); g.globalAlpha = 1; }
}
function drawTile(t) {
  const crisp = inv(Hh.crisp, Hh.crisp + 0.25, t);
  const s = crisp.toFixed(2); if (tile.userData.s === s) return; tile.userData.s = s;
  const g = tileCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none';
  g.fillStyle = crisp > 0.5 ? '#FBF8F1' : '#16203A'; g.fillRect(0, 0, 200, 250);
  g.save(); g.filter = `blur(${(9 * (1 - crisp)).toFixed(1)}px)`; glyph(g, '8', 200, 250, '700 170px "Space Grotesk"', crisp > 0.5 ? NAVY : '#F4F7FB'); g.restore();
  if (crisp > 0.5) { g.strokeStyle = P.mint; g.lineWidth = 12; rr(g, 6, 6, 188, 238, 18); g.stroke(); }
  tile.userData.face.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ choreography
const SHOOT = { x: 0.1, z: 0.4, rotY: -52 };
const HOME = { x: -0.08, z: 0.52, rotY: 8 };
const BSIDE = { x: -0.2, z: 0.24, rotY: -12 };
const CTA = { x: -0.06, z: 0.62, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...SHOOT, crouch: 0.08, lean: -2, headPitch: 6, headYaw: 0 } },
  { t: 1.3, p: { lean: 2, headPitch: 8 } },
  { t: 1.45, e: 'outQuad', p: { lean: -6, headPitch: 2 } },
  { t: 1.75, e: 'outBack', p: { lean: 2, headPitch: 18 } },              // looks down at the shot
  { t: 2.25, p: {} },
  { t: 2.8, e: 'inOutCubic', p: { ...HOME, headPitch: 18, lean: 4 } },     // turns to show us the screen
  { t: 5.3, p: { headPitch: 14, headYaw: 6 } },
  { t: 5.75, e: 'outBack', p: { headPitch: 4, headYaw: 30, headRoll: -4 } },// watches the tile fly to the cabinet
  { t: 9.2, p: { headYaw: 34, headPitch: 10 } },
  { t: 9.45, e: 'outBack', p: { headYaw: 26, headPitch: -2, crouch: 0.0, lean: -4 } },
  { t: 10.9, p: { headYaw: 20, headPitch: 8, lean: 0 } },
  { t: 11.4, e: 'inOutCubic', p: { headYaw: 0, headPitch: 18, headRoll: 0 } },
  { t: 14.35, p: { headPitch: 20 } },
  { t: 14.6, e: 'outQuad', p: { lean: 6 } },
  { t: 14.9, p: { lean: 0, headPitch: 8 } },
  { t: 15.32, p: { notes: 1 } },
  { t: 15.72, p: { notes: 1, headPitch: 18 } },
  { t: 15.86, p: { notes: 0, drawer: 1 } },                                 // SOURCES drawer: menu card pops out
  { t: 16.25, p: { drawer: 0, headPitch: 10, headYaw: -8 } },
  { t: 17.6, p: { headYaw: 8, headPitch: 12 } },
  { t: 18.3, p: { headYaw: 0 } },
  { t: 18.85, e: 'inOutCubic', p: { ...BSIDE, headPitch: 14, headYaw: 8 } },
  { t: 20.1, p: { headPitch: 16, headRoll: 10 } },
  { t: 21.2, e: 'outQuad', p: { headYaw: -34, headPitch: -2, headRoll: 0, aFwd: 62, aOut: 46, aBend: 14 } },// double-check: points at the board
  { t: 21.85, e: 'outBack', p: { headYaw: 4, headPitch: 14 } },
  { t: 22.3, p: { headYaw: -30, headPitch: 6, aFwd: 50, aOut: 40 } },
  { t: 22.75, e: 'outBack', p: { headYaw: 0, headPitch: 6, ...{ aFwd: 6, aOut: 10, aBend: 12 } } },
  { t: 23.3, e: 'outBack', p: { lean: -6, crouch: 0.08 } },
  { t: 23.7, p: { lean: 0, crouch: 0 } },
  { t: 25.4, e: 'inOutCubic', p: { ...CTA, headPitch: -2, headYaw: 0, headRoll: 0 } },
  { t: 26.2, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.3, p: { bFwd: 120 } },
  { t: 29.0, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
// IK weights (A = screen-left hand, B = screen-right hand). Phone held in both hands most of the time.
const IKW = {
  0: [[-1, 1], [15.0, 1], [15.2, 0], [15.88, 0], [16.05, 1], [18.4, 1], [18.6, 0], [25.15, 0], [25.4, 1], [30.5, 1]],
  1: [[-1, 1], [25.3, 1], [25.5, 0], [30.5, 0]],
};
const EXPR = [[-9, 'focus'], [Hh.snap, 'wow'], [1.9, 'happy'], [2.8, 'neutral'], [3.4, 'focus'], [5.8, 'wow'], [6.4, 'focus'], [7.55, 'puzzled'], [8.1, 'skeptic'], [8.6, 'puzzled'], [9.2, 'wow'], [9.6, 'happy'],
  [11.4, 'focus'], [12.4, 'happy'], [14.5, 'determined'], [15.0, 'happy'], [16.3, 'focus'], [16.9, 'happy'], [19.3, 'focus'], [19.9, 'puzzled'], [21.2, 'skeptic'], [21.95, 'wow'], [22.4, 'focus'], [22.65, 'happy'], [23.3, 'proud'], [25.5, 'happy'], [28.4, 'proud']];
const BLINKS = [2.1, 4.9, 7.1, 10.4, 13.2, 17.9, 20.6, 24.2, 27.3, 29.3];
let VOICE = null;

function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  const hops = [[2.25, 2.8], [18.3, 18.85], [24.8, 25.4]];
  for (const [a, b] of hops) if (t > a && t < b) p.hop += 0.03 * Math.abs(Math.sin(((t - a) / (b - a)) * Math.PI * 2));
  p.antenna = kick(t, Hh.snap, 18) + kick(t, Hh.crisp, 14) + kick(t, Hh.tap, 10) + kick(t, Hh.fixTime, 14) + kick(t, 23.3, 12) + 6 * Math.sin(t * 3.1);
  if (t > 26.2) { p.headPitch += 3 * Math.sin((t - 26.2) * 5) * Math.exp(-(t - 26.2) * 1.2); p.bFwd += 7 * Math.sin((t - 26.2) * 6.2) * Math.exp(-(t - 26.2) * 0.8); }
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


// ---- props (all pure functions of t)
const pulse = (t, a, b) => (t < a || t > b ? 0 : Math.min(inv(a, a + 0.12, t), 1 - inv(b - 0.2, b, t)) * (0.75 + 0.25 * Math.sin((t - a) * 14)));
function spot(p, lp, pitch, yawOff = 0) { return { p: local(p, lp), q: Q(pitch, p.rotY * D2R + yawOff) }; }
function phoneSpotAt(t) {           // held positions in DOCKET space
  const p = docketAt(t);
  const AIM = spot(p, V(0.02, 0.95 - p.crouch * 0.1, 0.42), 0.1, Math.PI);          // aimed at the board, screen toward DOCKET
  const SHOW = spot(p, V(0.0, 1.02 - p.crouch * 0.1, 0.36), -0.06);               // held up to show us the screen (insert shots)
  const WAIST = spot(p, V(0.0, 0.74 - p.crouch * 0.1, 0.33), -0.28);                // lower, so DOCKET's face reads
  const RIGHT = spot(p, V(0.2, 1.02, 0.33), -0.06, -0.1);                           // beside the menu card
  const SIDE = spot(p, V(0.21, 0.86, 0.28), -0.1, 0.12);                             // next to the board
  const LOW = spot(p, V(-0.12, 0.62, 0.25), -0.4, 0.2);                             // at the side during the CTA
  const segs = [[-1, AIM], [2.25, AIM], [2.8, SHOW], [5.2, SHOW], [5.6, WAIST], [10.75, WAIST], [11.1, SHOW], [13.9, SHOW], [14.2, WAIST], [15.0, WAIST], [15.35, RIGHT], [18.3, RIGHT], [18.85, SIDE], [24.8, SIDE], [25.4, LOW]];
  let i = 1; while (i < segs.length - 1 && t > segs[i][0]) i++;
  const [t0, A] = segs[i - 1], [t1, B] = segs[i], k = E.inOutCubic(inv(t0, t1, t));
  return { p: A.p.clone().lerp(B.p, k), q: A.q.clone().slerp(B.q, k) };
}
function placePhone(t) { const s = phoneSpotAt(t); phone.position.copy(s.p); phone.quaternion.copy(s.q); const sq = kick(t, Hh.snap, 0.03, 0.06, 30); phone.scale.set(1 + sq, 1 - sq, 1); }
const onPhone = (x, y, z = 0.02) => phone.localToWorld(V(x, y, z));
const screenPt = (u, v) => onPhone((u / SW - 0.5) * SC_W, (0.5 - v / SH) * SC_H, 0.02);   // canvas px → world
function numOpenAt(t) { return track([[6.15, 0], [6.4, 1, 'outBack'], [11.0, 1], [11.3, 0, 'inOutCubic']], t); }
const FAN_C = () => numDr.localToWorld(V(0, 0.2, 0.06));
function fanPos(i, n, r = 0.29, spread = 1.25) { const a = (i / (n - 1) - 0.5) * spread; return numDr.localToWorld(V(Math.sin(a) * r, 0.14 + Math.cos(a) * r * 0.62, 0.1 + 0.02 * Math.cos(a))); }
function layoutCards(t) {
  const q = new THREE.Quaternion(); cab.getWorldQuaternion(q);
  cards.forEach((m, i) => {
    const dT = i === MATCH_I ? Hh.cardsDown : Hh.variants - 0.05;
    const k = E.outBack(inv(Hh.cards0 + i * 0.07, Hh.cards0 + i * 0.07 + 0.35, t)), down = E.inQuad(inv(dT, dT + 0.35, t));
    m.visible = t >= Hh.cards0 + i * 0.07 && t < dT + 0.4;
    if (!m.visible) return;
    const inDr = numDr.localToWorld(V((i - 3) * 0.06, -0.08, -0.15));
    const pos = inDr.clone().lerp(fanPos(i, cards.length), k * (1 - down));
    if (i === MATCH_I) pos.lerp(FAN_C().add(V(0, 0.18, 0.04)), E.inOutCubic(inv(Hh.variants, Hh.variants + 0.4, t)) * (1 - down));
    m.position.copy(pos); m.quaternion.copy(q).multiply(Q(-0.1, 0, -((i / (cards.length - 1)) - 0.5) * 0.5 * (1 - (i === MATCH_I ? inv(Hh.variants, Hh.variants + 0.4, t) : 0))));
    const glowOn = i === MATCH_I && t >= Hh.match;
    if (m.userData.g !== glowOn) { m.userData.g = glowOn; const c = glowOn ? m.userData.glowC : cardCanvas(m.userData.ch, null, false); m.material.map.image = c; m.material.emissiveMap.image = c; m.material.map.needsUpdate = true; }
    const near = hopIndexAt(t) === i ? 1 : 0; m.scale.setScalar(1 + 0.12 * near + (glowOn ? 0.15 * Math.exp(-(t - Hh.match) / 0.15) : 0));
  });
  // learned variants of '8' fan out around the matched card ("patterns it learned from many examples")
  variants.forEach((m, i) => {
    const k = E.outBack(inv(Hh.variants + 0.1 + i * 0.06, Hh.variants + 0.45 + i * 0.06, t)), down = E.inQuad(inv(Hh.cardsDown, Hh.cardsDown + 0.35, t));
    m.visible = k > 0 && t < Hh.cardsDown + 0.4; if (!m.visible) return;
    const c = FAN_C().add(V(0, 0.18, 0.04)), a = (i / (variants.length - 1) - 0.5) * 2.4;
    const target = numDr.localToWorld(numDr.worldToLocal(c.clone()).add(V(Math.sin(a) * 0.24, Math.cos(a) * 0.15 - 0.06, -0.02)));
    m.position.copy(c.clone().lerp(target, k * (1 - down))); m.quaternion.copy(q).multiply(Q(-0.1, 0, -a * 0.25)); m.scale.setScalar(0.85);
  });
}
const HOPS = () => [[Hh.hops[0], 0], [Hh.hops[1], 1], [Hh.hops[2], 2], [Hh.hops[3], MATCH_I]];
function hopIndexAt(t) { let idx = -1; for (const [ht, i] of HOPS()) if (t >= ht - 0.05) idx = i; return t < Hh.match + 0.3 ? idx : -1; }
function layoutTile(t) {
  drawTile(t);
  tile.visible = t >= Hh.tileOut && t < Hh.tileHome + 0.25;
  if (!tile.visible) return;
  const q = new THREE.Quaternion(); cab.getWorldQuaternion(q);
  const fromPhone = screenPt(bx(BRD.times[0][0] + 60), by(BRD.times[0][1]));
  const nearFan = (i) => fanPos(i, cards.length).add(V(0, 0, 0.06)).add(numDr.localToWorld(V(0, 0, 0)).sub(numDr.localToWorld(V(0, 0, 0))));
  let pos, qq = q.clone(), arc = 0;
  if (t < Hh.tileAtFan) { const k = E.inOutCubic(inv(Hh.tileOut, Hh.tileAtFan, t)); pos = fromPhone.clone().lerp(FAN_C().add(V(-0.3, 0.15, 0.12)), k); arc = Math.sin(Math.PI * k) * 0.18; qq = phone.quaternion.clone().slerp(q, k); }
  else if (t < Hh.hops[0]) pos = FAN_C().add(V(-0.3, 0.15, 0.12));
  else if (t < Hh.tileBack) {
    const H = HOPS(); let j = 0; while (j < H.length - 1 && t >= H[j + 1][0]) j++;
    const [h0, i0] = H[j], nxt = H[j + 1];
    const a = fanPos(i0, cards.length).add(V(0, 0, 0.05)), b = nxt ? fanPos(nxt[1], cards.length).add(V(0, 0, 0.05)) : a;
    const k = nxt ? E.inOutCubic(inv(nxt[0] - 0.2, nxt[0], t)) : 0;
    pos = t < h0 + 0.0 ? a : a.clone().lerp(b, k); arc = Math.sin(Math.PI * k) * 0.05;
    if (t >= Hh.match) pos = a.clone().lerp(FAN_C().add(V(0, 0.18, 0.1)), E.outCubic(inv(Hh.variants, Hh.variants + 0.4, t)));
  } else {
    const k = E.inOutCubic(inv(Hh.tileBack, Hh.tileHome, t)); const start = FAN_C().add(V(0, 0.18, 0.1));
    pos = start.clone().lerp(screenPt(160, 870), k); arc = Math.sin(Math.PI * k) * 0.16; qq = q.clone().slerp(phone.quaternion, k);
  }
  pos.y += arc; tile.position.copy(pos); tile.quaternion.copy(qq);
  const pop = t >= Hh.crisp ? 1 + 0.25 * Math.exp(-(t - Hh.crisp) / 0.08) * Math.cos((t - Hh.crisp) * 30) : 1;
  tile.scale.setScalar(pop * (t > Hh.tileHome - 0.15 ? 1 - inv(Hh.tileHome - 0.15, Hh.tileHome + 0.2, t) * 0.7 : 1));
}
function needleAt(t) {
  const H = HOPS(), vals = [0.35, 0.55, 0.62, 1.0];
  let v = 0; for (let j = 0; j < H.length; j++) if (t >= H[j][0]) v = vals[j];
  const ang = -1.15 + 2.27 * v;
  let a = track([[Hh.hops[0] - 0.3, -1.15], [Hh.hops[0], -1.15 + 2.27 * 0.35, 'outBack']], t);
  if (t >= Hh.hops[0]) { const j = H.findIndex((h, jj) => t < (H[jj + 1] ? H[jj + 1][0] : 99)); const prev = j > 0 ? -1.15 + 2.27 * vals[j - 1] : a; a = lerp(prev, ang, E.outBack(inv(H[j][0], H[j][0] + 0.25, t))); }
  if (t > Hh.cardsDown) a = lerp(a, -1.15, E.inOutCubic(inv(Hh.cardsDown, Hh.cardsDown + 0.6, t)));
  return a;
}
function layoutChip(t) {
  chip.visible = t >= Hh.chipFly && t < Hh.chipFly + 0.5; if (!chip.visible) return;
  const k = E.inQuad(inv(Hh.chipFly, Hh.chipFly + 0.45, t));
  const notes = V(); docket.notes.getWorldPosition(notes); notes.add(V(0, 0.05, 0.12));
  const a = screenPt(140, 560); chip.position.copy(a.lerp(notes, k)); chip.position.y += Math.sin(Math.PI * k) * 0.12;
  chip.quaternion.copy(phone.quaternion); chip.scale.setScalar(1 - 0.5 * k);
}
function layoutMenu(t, p) {
  menuCard.visible = t >= Hh.menuOut && t < 18.9; if (!menuCard.visible) return;
  const src = V(); docket.sources.getWorldPosition(src); src.add(V(0, 0, 0.12));
  const held = local(p, V(-0.25, 1.0, 0.33)), q = Q(-0.06, p.rotY * D2R + 0.14);
  const k = E.outBack(inv(Hh.menuOut, Hh.menuOut + 0.35, t)), away = E.inQuad(inv(18.4, 18.85, t));
  menuCard.position.copy(src.lerp(held, k)).add(V(-0.25 * away, -0.5 * away, 0)); menuCard.quaternion.copy(q);
  menuCard.scale.setScalar(Math.max(0.001, 0.3 + 0.7 * Math.min(1, k)));
}

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  numDr.position.z = 0.23 + numOpenAt(t) * 0.36;
  scene.updateMatrixWorld(true);
  placePhone(t);
  scene.updateMatrixWorld(true);
  layoutMenu(t, p);
  // ---- IK targets
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  let tA = onPhone(-0.19, -0.06, 0), tB = onPhone(0.19, -0.06, 0);
  if (t >= 15.0) tB = onPhone(0.19, -0.1, 0);
  if (t >= 15.85 && t < 18.9) tA = menuCard.localToWorld(V(-0.235, -0.02, 0));
  else if (t >= 15.0 && t < 25.15) tA = null;
  if (t >= Hh.tap - 0.35 && t < Hh.tap + 0.45) { const k = Math.min(E.inOutCubic(inv(Hh.tap - 0.35, Hh.tap, t)), 1 - E.inOutCubic(inv(Hh.tap + 0.15, Hh.tap + 0.45, t))); tA = onPhone(-0.19, -0.06, 0).lerp(screenPt(150, 560).add(V(0, 0, 0.05)), k); }
  if (t >= 25.3) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  drawScreen(t);
  // camera flash
  const fl = Math.max(0, 1 - (t - Hh.snap) / 0.25) * (t >= Hh.snap ? 1 : 0);
  flashGlow.material.opacity = fl; flashLight.intensity = 9 * fl; flashLight.position.copy(onPhone(-0.02, 0.2, -0.12));
  // board highlights during the double-check
  const bk = { time: inv(Hh.boardTime, Hh.boardTime + 0.3, t) * (1 - inv(24.6, 25.0, t)), fare: inv(Hh.boardFare, Hh.boardFare + 0.3, t) * (1 - inv(24.6, 25.0, t)) };
  const bkey = `${bk.time.toFixed(2)}|${bk.fare.toFixed(2)}`;
  if (board.userData.k !== bkey) { board.userData.k = bkey; drawBoard(boardCanvas.getContext('2d'), bk); boardMesh.material.map.needsUpdate = true; }
  gaugeNeedle.rotation.z = -needleAt(t);
  gaugeGlowHi.material.opacity = pulse(t, Hh.match, Hh.cardsDown);
  numGlow.material.opacity = 0.8 * pulse(t, 6.2, 7.0);
  layoutCards(t); layoutTile(t); layoutChip(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const CAM = [
  [0.0, [0.05, 1.26, 2.9], [-0.32, 1.02, 0.0]], [2.81, [0.02, 1.25, 2.68], [-0.28, 1.02, 0.05]],
  [2.82, [-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]], [5.4, [-0.03, 1.15, 1.9], [-0.03, 1.12, 0.88]],
  [5.401, [0.2, 1.2, 2.75], [0.18, 0.86, 0.25]], [6.95, [0.2, 1.2, 2.7], [0.18, 0.86, 0.25]],
  [6.951, [0.08, 0.9, 1.85], [0.36, 0.78, 0.5]], [10.95, [0.09, 0.9, 1.8], [0.36, 0.78, 0.5]],
  [10.951, [-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]], [14.0, [-0.03, 1.15, 1.9], [-0.03, 1.12, 0.88]],
  [14.001, [0.0, 1.2, 2.35], [-0.05, 1.05, 0.5]], [16.19, [0.0, 1.2, 2.3], [-0.05, 1.05, 0.5]],
  [16.2, [0.12, 1.12, 1.98], [0.1, 1.08, 0.83]], [18.5, [0.12, 1.12, 1.93], [0.1, 1.08, 0.83]],
  [18.501, [-0.33, 1.22, 2.78], [-0.37, 1.04, 0.0]], [23.3, [-0.33, 1.22, 2.7], [-0.37, 1.04, 0.0]],
  [25.6, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.snap, 0.01, 0.1, 40) + kick(t, Hh.match, 0.006, 0.08, 40) + kick(t, Hh.crisp, 0.006, 0.08, 40) + kick(t, Hh.fixTime, 0.008, 0.08, 40);
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
    for (;;) { c.font = `700 ${size}px "Space Grotesk"`; if (Math.max(...cap.lines.map(lineW)) <= CAP_MAXW - 72 || size <= 44) break; size -= 2; }
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
    for (;;) { c.font = `700 ${size}px "Space Grotesk"`; if (Math.max(...cap.lines.map(lineW)) <= CAP_MAXW - 72 || size <= 44) break; size -= 2; }
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
  if (t >= Hh.snap && t < Hh.snap + 0.25) { octx.fillStyle = `rgba(255,255,255,${(0.45 * (1 - (t - Hh.snap) / 0.25)).toFixed(3)})`; octx.fillRect(0, 0, W, H); }   // camera flash
  overlay(t);
  return true;
};
window.renderSheet = () => true;

window.READY = (async () => {
  await Promise.all(['700 40px "Space Grotesk"', '500 40px "Space Grotesk"', '700 20px "JetBrains Mono"'].map((f) => document.fonts.load(f)));
  const img = new Image(); img.src = '/assets/icon.png'; await img.decode(); ICON = img;
  try { const r = await fetch('/voice.json'); if (r.ok) VOICE = await r.json(); } catch (e) { /* no lip-sync data */ }
  buildStage();
  window.renderAt(0);
  return document.fonts.check('700 40px "Space Grotesk"');
})();
