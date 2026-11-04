// label.js — Ideaverse production 30s hindi-04 #01 (Hindi): photograph a care label to understand washing symbols.
// (Engine header below copied from hindi-03 eraser.js.)
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
const HI = '"Space Grotesk", "Noto Sans Devanagari"';
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function check(g, x, y, s, col, lw) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y + s * 0.5); g.lineTo(x + s * 0.38, y + s * 0.88); g.lineTo(x + s, y); g.stroke(); g.restore(); }
function tag(g, x, y, txt, fg, bg, size = 26) { g.save(); g.textAlign = 'left'; g.font = `700 ${size}px ${HI}`; const w = g.measureText(txt).width + 30; g.fillStyle = bg; rr(g, x - w, y, w, size + 20, (size + 20) / 2); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, x - w + 15, y + (size + 20) / 2 + 2); g.restore(); }

// ---- ISO 3758 / GINETEX-style care symbols (drawn, line art). cx, cy = centre, s = size (px)
function symTub(g, cx, cy, s, num, bars) {
  g.save(); g.lineWidth = s * 0.07; g.lineJoin = 'round'; g.lineCap = 'round';
  const w = s, h = s * 0.7, x = cx - w / 2, y = cy - h / 2;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * 0.12, y + h); g.lineTo(x + w * 0.88, y + h); g.lineTo(x + w, y);       // tub
  g.moveTo(x, y); for (let i = 0; i < 4; i++) g.quadraticCurveTo(x + w * (i + 0.5) / 4, y + (i % 2 ? -1 : 1) * h * 0.14 + h * 0.08, x + w * (i + 1) / 4, y + h * 0.06);   // water line
  g.stroke();
  g.font = `800 ${Math.round(s * 0.36)}px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(num, cx, cy + h * 0.16);
  for (let b = 0; b < bars; b++) { g.beginPath(); g.moveTo(x + w * 0.1, y + h + s * 0.14 + b * s * 0.12); g.lineTo(x + w * 0.9, y + h + s * 0.14 + b * s * 0.12); g.stroke(); }
  g.restore();
}
function cross(g, cx, cy, s) { g.save(); g.lineWidth = s * 0.07; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - s * 0.5, cy - s * 0.42); g.lineTo(cx + s * 0.5, cy + s * 0.42); g.moveTo(cx + s * 0.5, cy - s * 0.42); g.lineTo(cx - s * 0.5, cy + s * 0.42); g.stroke(); g.restore(); }
function symNoBleach(g, cx, cy, s) { g.save(); g.lineWidth = s * 0.07; g.lineJoin = 'round'; g.beginPath(); g.moveTo(cx, cy - s * 0.42); g.lineTo(cx + s * 0.5, cy + s * 0.38); g.lineTo(cx - s * 0.5, cy + s * 0.38); g.closePath(); g.stroke(); g.restore(); cross(g, cx, cy, s * 0.9); }
function symNoTumble(g, cx, cy, s) { g.save(); g.lineWidth = s * 0.07; g.strokeRect(cx - s * 0.42, cy - s * 0.42, s * 0.84, s * 0.84); g.beginPath(); g.arc(cx, cy, s * 0.3, 0, 7); g.stroke(); g.restore(); cross(g, cx, cy, s * 0.9); }
function symIron1(g, cx, cy, s) {
  g.save(); g.lineWidth = s * 0.07; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx - s * 0.5, cy + s * 0.3); g.lineTo(cx + s * 0.5, cy + s * 0.3); g.lineTo(cx + s * 0.42, cy - s * 0.12); g.quadraticCurveTo(cx + s * 0.38, cy - s * 0.3, cx + s * 0.1, cy - s * 0.3); g.lineTo(cx - s * 0.2, cy - s * 0.3);
  g.quadraticCurveTo(cx - s * 0.42, cy - s * 0.1, cx - s * 0.5, cy + s * 0.3); g.moveTo(cx + s * 0.1, cy - s * 0.3); g.lineTo(cx + s * 0.18, cy - s * 0.44); g.lineTo(cx - s * 0.32, cy - s * 0.44); g.stroke();
  g.beginPath(); g.arc(cx + s * 0.02, cy + s * 0.05, s * 0.07, 0, 7); g.fill(); g.restore();
}
// the care label (fictional example): 600 x 800, symbols in a 2 x 2 grid
const LW = 600, LH = 800;
const SYM = { tub: [170, 330, 190], bleach: [430, 330, 170], tumble: [170, 590, 170], iron: [430, 590, 180] };
function drawLabel(g, s = {}) {
  g.fillStyle = '#F7F3EA'; g.fillRect(0, 0, LW, LH);
  g.strokeStyle = 'rgba(27,35,51,0.18)'; g.lineWidth = 6; g.setLineDash([14, 10]); g.strokeRect(18, 18, LW - 36, LH - 36); g.setLineDash([]);
  g.fillStyle = NAVY; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `800 56px ${HI}`; g.fillText('100% कॉटन', LW / 2, 92);
  g.fillStyle = 'rgba(27,35,51,0.55)'; g.font = `600 32px ${HI}`; g.fillText('देखभाल निर्देश', LW / 2, 152);
  g.fillStyle = NAVY; g.strokeStyle = NAVY;
  symTub(g, ...SYM.tub.slice(0, 2), SYM.tub[2], '30', 1); symNoBleach(g, ...SYM.bleach); symNoTumble(g, ...SYM.tumble); symIron1(g, ...SYM.iron);
  tag(g, LW - 34, LH - 92, 'उदाहरण', NAVY, AMBER, 26);
  // callouts while the answer is explained / checked
  const ring = (x, y, rx, ry, a, col) => { if (a <= 0) return; const k = 1.25 - 0.25 * Math.min(1, a); g.save(); g.globalAlpha = Math.min(1, a); g.strokeStyle = col; g.lineWidth = 9; g.shadowColor = col; g.shadowBlur = 18; g.beginPath(); g.ellipse(x, y, rx * k, ry * k, 0, 0, 7); g.stroke(); g.restore(); };
  ring(SYM.tub[0], SYM.tub[1] + 18, 78, 62, s.num, AMBER);
  ring(SYM.tub[0], SYM.tub[1] + 94, 104, 26, s.bar, AMBER);
  const chip = (x, y, txt, a, col = P.mint) => { if (a <= 0) return; g.save(); g.globalAlpha = Math.min(1, a); g.font = `800 34px ${HI}`; const w = g.measureText(txt).width + 30; g.fillStyle = col; rr(g, x - w / 2, y - 28, w, 56, 28); g.fill(); g.fillStyle = NAVY; g.fillText(txt, x, y + 2); g.restore(); };
  chip(SYM.tub[0], 212, '30°C तक', s.numChip);
  chip(SYM.tub[0], 484, 'हल्की धुलाई', s.barChip);
  for (const [k, a] of Object.entries(s.ok || {})) { if (a <= 0) continue; const [x, y] = SYM[k]; g.save(); g.globalAlpha = Math.min(1, a); g.fillStyle = P.mint; g.beginPath(); g.arc(x + 92, y - 84, 32, 0, 7); g.fill(); check(g, x + 74, y - 102, 36, NAVY, 9); g.restore(); }
}
// the "expensive" shirt (front, original drawing)
function drawShirt(g) {
  g.clearRect(0, 0, 512, 512);
  g.fillStyle = '#2F5FA8'; g.beginPath(); g.moveTo(170, 60); g.lineTo(60, 120); g.lineTo(20, 230); g.lineTo(95, 255); g.lineTo(120, 200); g.lineTo(122, 470); g.lineTo(390, 470); g.lineTo(392, 200); g.lineTo(417, 255); g.lineTo(492, 230); g.lineTo(452, 120); g.lineTo(342, 60);
  g.quadraticCurveTo(256, 120, 170, 60); g.closePath(); g.fill();
  g.fillStyle = '#F4F7FB'; g.beginPath(); g.moveTo(170, 60); g.lineTo(256, 150); g.lineTo(220, 70); g.closePath(); g.fill(); g.beginPath(); g.moveTo(342, 60); g.lineTo(256, 150); g.lineTo(292, 70); g.closePath(); g.fill();
  g.strokeStyle = '#1E3F75'; g.lineWidth = 6; g.beginPath(); g.moveTo(256, 150); g.lineTo(256, 470); g.stroke();
  g.fillStyle = '#F4F7FB'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(256, 195 + i * 60, 9, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 4; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(140 + i * 28, 210); g.lineTo(140 + i * 28, 460); g.stroke(); }
  g.fillStyle = '#F7F3EA'; g.fillRect(236, 80, 40, 26);      // the care label at the collar
}

// ------------------------------------------------------------------ scene objects
let docket, washer, door, shirt, board, labelCanvas, labelMesh, phone, screenCanvas, screenMesh;
const WASH_POS = V(0.52, 0, 0.12), WASH_YAW = -0.3;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
function plane(w, h, c, lit = false) {
  const t = cvTex(c);
  const m = lit ? new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.42, roughness: 0.72, side: THREE.DoubleSide, transparent: true }) : new THREE.MeshBasicMaterial({ map: t, toneMapped: false, transparent: true });
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: tub icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.strokeStyle = P.mint; mg.fillStyle = P.mint; mg.shadowColor = P.mint; mg.shadowBlur = 16; symTub(mg, 256, 140, 170, '', 0);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  // ----- washing machine (original prop, cabinet palette)
  washer = new THREE.Group(); washer.position.copy(WASH_POS); washer.rotation.y = WASH_YAW; scene.add(washer);
  const body = rbox(0.62, 0.86, 0.56, 0.05, mats.shell); body.position.y = 0.45; washer.add(body);
  const base = rbox(0.64, 0.06, 0.56, 0.02, mats.navy); base.position.y = 0.03; washer.add(base);
  const panel = rbox(0.6, 0.13, 0.04, 0.02, mats.navy); panel.position.set(0, 0.8, 0.27); washer.add(panel);
  const knob = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 24), mats.mint)); knob.rotation.x = Math.PI / 2; knob.position.set(0.2, 0.8, 0.3); washer.add(knob);
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.06), new THREE.MeshBasicMaterial({ color: P.mint, toneMapped: false })); disp.position.set(-0.1, 0.8, 0.292); washer.add(disp);
  door = new THREE.Group(); door.position.set(-0.19, 0.42, 0.285); washer.add(door);       // hinge on the left edge of the porthole
  const ring = sh(new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 14, 40), mats.steel)); ring.position.x = 0.19; door.add(ring);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.16, 40), M('#0E1424', { roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.85 })); glass.position.set(0.19, 0, 0.01); door.add(glass);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.17, 40), mats.recess); hole.position.set(0, 0.42, 0.281); washer.add(hole);
  // ----- the shirt
  const shc = canvas(512, 512); drawShirt(shc.getContext('2d'));
  shirt = plane(0.42, 0.42, shc, true); scene.add(shirt);
  // ----- the care label on the easel (round-02/hindi-03 board geometry)
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  labelCanvas = canvas(LW, LH); drawLabel(labelCanvas.getContext('2d'));
  labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(labelCanvas), toneMapped: false })); labelMesh.position.set(0, 1.0, -0.002); board.add(labelMesh);
  // ----- the phone (illustrative example screens; not any real app's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  const lens = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 24), mats.mint)); lens.rotation.x = Math.PI / 2; lens.position.set(-0.08, 0.2, -0.019); phone.add(lens);
}

// ------------------------------------------------------------------ label + phone screen states (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
let labelKey = '', screenKey = '';
function labelState(t) {
  return { num: q20(inv(Hh.num, Hh.num + 0.25, t)) * (1 - q20(inv(18.2, 18.4, t))), numChip: q20(inv(Hh.deg, Hh.deg + 0.25, t)) * (1 - q20(inv(18.2, 18.4, t))),
    bar: q20(inv(Hh.bar, Hh.bar + 0.25, t)) * (1 - q20(inv(18.2, 18.4, t))), barChip: q20(inv(Hh.gentle, Hh.gentle + 0.25, t)) * (1 - q20(inv(18.2, 18.4, t))),
    ok: Object.fromEntries(['tub', 'bleach', 'tumble', 'iron'].map((k, i) => [k, q20(inv(Hh.match + i * 0.35, Hh.match + i * 0.35 + 0.2, t))])) };
}
function updateLabel(t) { const s = labelState(t), k = JSON.stringify(s); if (k === labelKey) return; labelKey = k; drawLabel(labelCanvas.getContext('2d'), s); labelMesh.material.map.needsUpdate = true; }
const ANS = [['टब 30', 'पानी 30°C तक'], ['नीचे लाइन', 'हल्की धुलाई'], ['त्रिकोण ✕', 'ब्लीच नहीं'], ['चौकोर ✕', 'ड्रायर नहीं'], ['इस्त्री •', 'कम गरम']];
function drawScreen(t) {
  const mode = t < Hh.snap ? 'view' : t < Hh.siteShow ? 'chat' : 'site';
  const k = { mode, align: q20(inv(Hh.align0, Hh.align1, t)), flash: q20(1 - inv(Hh.snap, Hh.snap + 0.3, t)), typed: q20(inv(Hh.type0, Hh.type1, t)),
    ans: ANS.map((_, i) => q20(inv(Hh.ans[i], Hh.ans[i] + 0.25, t))), site: q20(inv(Hh.siteShow, Hh.siteShow + 0.3, t)), siteOk: q20(inv(Hh.siteOk, Hh.siteOk + 0.3, t)) };
  const key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none';
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'उदाहरण', NAVY, AMBER, 26);
  if (mode === 'view') {   // camera viewfinder: the label is tilted + blurry, then straight + sharp
    const a = k.align;
    g.save(); g.beginPath(); g.rect(24, 110, SW - 48, 760); g.clip(); g.fillStyle = '#1A2234'; g.fillRect(24, 110, SW - 48, 760);
    g.translate(SW / 2 + 40 * (1 - a), 490 + 30 * (1 - a)); g.rotate(-0.32 * (1 - a)); g.scale(0.78 + 0.1 * a, 0.78 + 0.1 * a);
    g.filter = `blur(${(8 * (1 - a)).toFixed(1)}px)`; g.drawImage(labelCanvas, -LW / 2 * 0.8, -LH / 2 * 0.8, LW * 0.8, LH * 0.8); g.restore(); g.filter = 'none';
    const fc = a >= 1 ? P.mint : '#F4F7FB';
    g.strokeStyle = fc; g.lineWidth = 6; for (const [x, y, sx, sy] of [[60, 150, 1, 1], [SW - 60, 150, -1, 1], [60, 830, 1, -1], [SW - 60, 830, -1, -1]]) { g.beginPath(); g.moveTo(x, y + 50 * sy); g.lineTo(x, y); g.lineTo(x + 50 * sx, y); g.stroke(); }
    if (a >= 1) { g.fillStyle = P.mint; g.font = `800 34px ${HI}`; g.textAlign = 'center'; g.fillText('साफ़ ✓', SW / 2, 800); g.textAlign = 'left'; }
    g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(SW / 2, 945, 52, 0, 7); g.fill(); g.strokeStyle = '#0B1020'; g.lineWidth = 6; g.beginPath(); g.arc(SW / 2, 945, 42, 0, 7); g.stroke();
    return;
  }
  if (mode === 'chat') {
    g.fillStyle = '#F4F7FB'; g.font = `700 34px ${HI}`; g.fillText('AI सहायक', 30, 108); g.fillStyle = 'rgba(244,247,251,0.15)'; g.fillRect(24, 136, SW - 48, 3);
    // my photo + question
    g.fillStyle = P.mint; rr(g, SW - 300, 160, 270, 300, 26); g.fill(); g.drawImage(labelCanvas, SW - 290, 170, 250, 280 * (LH / LW) * 0.8 > 280 ? 280 : 280);
    const qtxt = 'इन निशानों का मतलब हिंदी में बताओ', n = Math.round(qtxt.length * k.typed);
    if (n > 0) { g.font = `700 32px ${HI}`; const w = SW - 80; g.fillStyle = P.mint; rr(g, 40, 480, w, 118, 26); g.fill(); g.fillStyle = NAVY; const s = qtxt.slice(0, n); const cut = 'इन निशानों का मतलब'.length;
      g.fillText(s.slice(0, Math.min(n, cut)), 64, 520); if (n > cut) g.fillText(s.slice(cut).trim(), 64, 565); }
    if (k.ans.some((v) => v > 0)) {
      g.fillStyle = '#1E2A44'; rr(g, 30, 620, SW - 60, 390, 26); g.fill();
      ANS.forEach(([sym, mean], i) => { const a = k.ans[i]; if (a <= 0) return; g.save(); g.globalAlpha = a; const y = 668 + i * 72; g.font = `700 32px ${HI}`; g.fillStyle = 'rgba(244,247,251,0.7)'; g.fillText(sym, 56, y); g.fillStyle = i < 2 ? P.mint : '#F4F7FB'; g.font = `800 34px ${HI}`; g.fillText(mean, 250, y); g.restore(); });
    }
    return;
  }
  // cross-check with the brand's own care page (illustrative)
  g.save(); g.globalAlpha = k.site;
  g.fillStyle = '#E9EFF2'; rr(g, 24, 110, SW - 48, 70, 20); g.fill(); g.fillStyle = 'rgba(27,35,51,0.7)'; g.font = `600 28px ${HI}`; g.fillText('🔒 ब्रांड की वेबसाइट', 50, 146);
  g.fillStyle = '#F7F3EA'; rr(g, 24, 200, SW - 48, 640, 24); g.fill();
  g.fillStyle = NAVY; g.font = `800 44px ${HI}`; g.fillText('शर्ट · देखभाल', 60, 270);
  g.strokeStyle = NAVY; g.fillStyle = NAVY; symTub(g, 140, 420, 140, '30', 1); symNoBleach(g, 380, 420, 120); symNoTumble(g, 140, 650, 120); symIron1(g, 380, 650, 130);
  if (k.siteOk > 0) { g.globalAlpha = k.site * k.siteOk; g.fillStyle = P.mint; rr(g, 60, 870, SW - 120, 90, 45); g.fill(); g.fillStyle = NAVY; g.font = `800 40px ${HI}`; g.textAlign = 'center'; g.fillText('लेबल से मेल ✓', SW / 2, 917); g.textAlign = 'left'; }
  g.restore();
}

// ------------------------------------------------------------------ choreography
const P0 = { x: 0.04, z: 0.55, rotY: 4 };              // by the washer
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const SIDE = { x: -0.18, z: 0.42, rotY: -14 };          // beside the label easel for the cross-check
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...P0, crouch: 0.3, lean: 14, headPitch: 18, headYaw: 20 } },
  { t: 0.3, p: {} },
  { t: 1.3, e: 'outBack', p: { crouch: 0.02, lean: -4, headPitch: -6, headYaw: 0 } },          // pulls the shirt out, holds it up
  { t: 2.55, p: { lean: -2 } },
  { t: 2.95, e: 'outBack', p: { lean: 8, headPitch: 6, headRoll: 12 } },                        // it shrinks: lean in, head tilt
  { t: 3.5, p: { headRoll: 6 } },
  { t: 3.62, p: { ...HOME2, crouch: 0, lean: 0, headPitch: 12, headRoll: 0 } },                 // (cut) holding the phone up
  { t: 12.29, p: {} },
  { t: 12.3, p: { x: 0.3, z: 0.5 } },                                                          // (cut) clear of the label close-up
  { t: 18.29, p: {} },
  { t: 18.3, p: { ...SIDE, headPitch: 4, headYaw: -18 } },                                       // (cut) beside the label
  { t: 19.2, p: { headYaw: -30, headPitch: 0 } },
  { t: 20.6, p: { headYaw: 8, headPitch: 14 } },
  { t: 21.5, p: { headYaw: -26, headPitch: 2 } },
  { t: 22.4, p: { headYaw: 4, headPitch: 12 } },
  { t: 25.0, p: {} },
  { t: 25.5, e: 'inOutCubic', p: { ...HOME2, headPitch: -2, headYaw: 0 } },
  { t: 26.3, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.3, p: { bFwd: 120 } },
  { t: 29.0, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 0], [0.35, 0], [0.7, 1], [30.5, 1]], 1: [[-1, 0], [0.35, 0], [0.7, 1], [25.4, 1], [25.6, 0], [30.5, 0]] };
const EXPR = [[-9, 'focus'], [1.2, 'happy'], [2.75, 'wow'], [3.1, 'puzzled'], [3.62, 'determined'], [5.6, 'focus'], [6.3, 'happy'], [7.5, 'focus'], [12.6, 'happy'], [14.0, 'focus'], [16.6, 'happy'],
  [18.3, 'skeptic'], [19.6, 'focus'], [21.4, 'happy'], [22.5, 'focus'], [23.9, 'proud'], [25.6, 'happy'], [28.4, 'proud']];
const BLINKS = [2.2, 5.0, 8.6, 11.0, 15.4, 19.1, 22.0, 24.6, 27.3, 29.3];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  if (t > 25.0 && t < 25.5) p.hop += 0.03 * Math.abs(Math.sin(((t - 25.0) / 0.5) * Math.PI * 2));
  p.antenna = kick(t, Hh.shrink, 24) + kick(t, Hh.snap, 14) + kick(t, Hh.match, 10) + kick(t, Hh.siteOk, 12) + 6 * Math.sin(t * 3.1);
  if (t > 26.3) { p.headPitch += 3 * Math.sin((t - 26.3) * 5) * Math.exp(-(t - 26.3) * 1.2); p.bFwd += 7 * Math.sin((t - 26.3) * 6.2) * Math.exp(-(t - 26.3) * 0.8); }
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
  const AIM = spot(p, V(0.0, 0.98, 0.4), 0.05, Math.PI);          // (hidden phase / aiming)
  const SHOW = spot(p, V(0.0, 1.02, 0.36), -0.06);
  const SIDEH = spot(p, V(0.22, 0.88, 0.3), -0.1, 0.12);
  const LOW = spot(p, V(-0.14, 0.62, 0.25), -0.4, 0.2);
  const segs = [[-1, SHOW], [18.15, SHOW], [18.3, SIDEH], [21.85, SIDEH], [21.95, SHOW], [24.9, SHOW], [25.5, LOW]];
  let i = 1; while (i < segs.length - 1 && t > segs[i][0]) i++;
  const [t0, A] = segs[i - 1], [t1, B] = segs[i], k = E.inOutCubic(inv(t0, t1, t));
  return { p: A.p.clone().lerp(B.p, k), q: A.q.clone().slerp(B.q, k) };
}
const onPhone = (x, y, z = 0.02) => phone.localToWorld(V(x, y, z));
function shirtAt(t, p) {
  const doorPt = washer.localToWorld(V(0, 0.42, 0.32)), held = local(p, V(0.0, 1.02, 0.36));
  if (t < 0.4) return { pos: doorPt, s: 0.5 };
  if (t < 1.3) { const k = E.outCubic(inv(0.4, 1.3, t)); const pos = doorPt.clone().lerp(held, k); pos.y += Math.sin(Math.PI * k) * 0.12; return { pos, s: 0.5 + 0.5 * k }; }
  const sk = t < Hh.shrink ? 1 : lerp(1, 0.42, E.outBack(inv(Hh.shrink, Hh.shrink + 0.35, t)));
  return { pos: held.clone().add(V(0, 0.08 * (1 - sk), 0)), s: sk };
}
function layoutShirt(t, p) {
  shirt.visible = t < 3.62; if (!shirt.visible) return null;
  const { pos, s } = shirtAt(t, p); shirt.position.copy(pos); shirt.quaternion.copy(Q(0, p.rotY * D2R, 0.04 * Math.sin(t * 3)));
  const wob = t >= Hh.shrink ? 1 + 0.08 * Math.exp(-(t - Hh.shrink) / 0.12) * Math.cos((t - Hh.shrink) * 30) : 1;
  shirt.scale.set(s * wob, s / wob, 1);
  return { l: shirt.localToWorld(V(-0.17, 0.14, 0.01)), r: shirt.localToWorld(V(0.17, 0.14, 0.01)) };
}

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  door.rotation.y = -track([[0.0, 0], [0.35, 1.7, 'outBack'], [3.0, 1.7], [3.4, 0, 'inOutCubic']], t);
  scene.updateMatrixWorld(true);
  const s = phoneSpotAt(t); phone.position.copy(s.p); phone.quaternion.copy(s.q); phone.visible = t >= 3.62;
  scene.updateMatrixWorld(true);
  const sh2 = layoutShirt(t, p);
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  let tA = sh2 ? sh2.l : onPhone(-0.19, -0.06, 0), tB = sh2 ? sh2.r : onPhone(0.19, -0.06, 0);
  if (!sh2 && t >= 18.3 && t < 21.9) { tB = onPhone(0.19, -0.08, 0); tA = null; }
  if (t >= 25.4) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updateLabel(t); drawScreen(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const INS = [[-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]];
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];   // square to the easel, whole label below the caption band
const CAM = [
  [0.0, [0.26, 1.2, 3.15], [0.24, 0.86, 0.3]], [3.61, [0.25, 1.19, 2.9], [0.24, 0.88, 0.3]],
  [3.62, ...INS], [12.29, [-0.03, 1.15, 1.86], [-0.03, 1.12, 0.88]],
  [12.3, ...LAB], [18.29, [-0.14, 1.13, 1.095], [-0.64, 1.13, -0.32]],
  [18.3, [0.05, 1.18, 2.15], [-0.32, 1.0, 0.0]], [21.94, [0.03, 1.17, 2.02], [-0.32, 1.0, 0.0]],
  [21.95, [-0.2, 1.15, 1.97], [-0.2, 1.12, 0.9]], [25.29, [-0.2, 1.15, 1.9], [-0.2, 1.12, 0.9]],
  [25.3, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.shrink, 0.012, 0.1, 40) + kick(t, Hh.snap, 0.006, 0.08, 40) + kick(t, Hh.siteOk, 0.006, 0.08, 40);
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
  if (t >= Hh.snap && t < Hh.snap + 0.2) { octx.fillStyle = `rgba(255,255,255,${(0.4 * (1 - (t - Hh.snap) / 0.2)).toFixed(3)})`; octx.fillRect(0, 0, W, H); }   // shutter flash
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
