// livecaption.js — Ideaverse production 30s english-06 #01 (English): phone live captions can mishear numbers — check before you act.
// (Engine header below copied from feedback-05 notice.js = hindi-04 = accepted feedback-round renderer.)
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
function tag(g, x, y, txt, fg, bg, size = 26) { g.save(); g.textAlign = 'left'; g.font = `700 ${size}px ${HI}`; g.letterSpacing = '2px'; const w = g.measureText(txt).width + 30; g.fillStyle = bg; rr(g, x - w, y, w, size + 20, (size + 20) / 2); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, x - w + 15, y + (size + 20) / 2 + 2); g.restore(); }
function clock(g, cx, cy, r, h, m, col) {
  g.save(); g.lineCap = 'round'; g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.strokeStyle = col; g.lineWidth = r * 0.12; g.stroke();
  g.strokeStyle = NAVY; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(cx + Math.sin(a) * r * 0.78, cy - Math.cos(a) * r * 0.78); g.lineTo(cx + Math.sin(a) * r * 0.88, cy - Math.cos(a) * r * 0.88); g.stroke(); }
  const ha = ((h % 12) + m / 60) / 12 * Math.PI * 2, ma = m / 60 * Math.PI * 2;
  g.lineWidth = r * 0.11; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(ha) * r * 0.48, cy - Math.cos(ha) * r * 0.48); g.stroke();
  g.lineWidth = r * 0.07; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(ma) * r * 0.72, cy - Math.cos(ma) * r * 0.72); g.stroke();
  g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r * 0.08, 0, 7); g.fill(); g.restore();
}
function wave(g, x, y, w, h, prog, col, dim) { const n = 28; for (let i = 0; i < n; i++) { const a = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)); g.fillStyle = i / n < prog ? col : dim; rr(g, x + i * (w / n), y - a * h / 2, w / n * 0.55, a * h, 3); g.fill(); } }

// ---- easel card: what was said vs what the caption shows (fictional example)
const NW = 600, NH = 800;
function drawCompare(g, s = {}) {
  g.fillStyle = '#FBF8F1'; g.fillRect(0, 0, NW, NH);
  g.fillStyle = NAVY; rr(g, 0, 0, NW, 120, 0); g.fill();
  g.fillStyle = '#F4F7FB'; g.font = `800 50px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Said vs. captioned', NW / 2, 62);
  const panel = (y, a, label, big, h, m, col, sub) => {
    if (a <= 0) return; g.save(); g.globalAlpha = Math.min(1, a); g.translate(0, 24 * (1 - Math.min(1, a)));
    g.fillStyle = col === AMBER ? 'rgba(255,194,75,0.2)' : 'rgba(108,218,126,0.18)'; rr(g, 28, y, NW - 56, 280, 26); g.fill();
    g.fillStyle = 'rgba(27,35,51,0.65)'; g.font = `700 32px ${HI}`; g.textAlign = 'left'; g.fillText(label, 56, y + 46);
    g.fillStyle = NAVY; g.font = `800 92px ${HI}`; g.fillText(big, 56, y + 150);
    g.fillStyle = 'rgba(27,35,51,0.75)'; g.font = `600 30px ${HI}`; g.fillText(sub, 56, y + 236);
    clock(g, 450, y + 150, 92, h, m, col); g.restore();
  };
  panel(150, s.said, 'Sam said', '3:15', 3, 15, P.mint, '“…three fifteen”');
  panel(470, s.cap, 'Caption shows', '3:50', 3, 50, AMBER, '“Meet me at 3:50”');
  if (s.ne > 0) { g.save(); g.globalAlpha = Math.min(1, s.ne); g.fillStyle = AMBER; g.beginPath(); g.arc(NW / 2, 450, 40, 0, 7); g.fill(); g.fillStyle = NAVY; g.font = `800 60px ${HI}`; g.textAlign = 'center'; g.fillText('≠', NW / 2, 452); g.restore(); }
  if (s.ring > 0) { g.save(); g.globalAlpha = Math.min(1, s.ring); g.strokeStyle = AMBER; g.lineWidth = 10; g.shadowColor = AMBER; g.shadowBlur = 18; const k = 1.2 - 0.2 * Math.min(1, s.ring); g.beginPath(); g.ellipse(160, 620, 130 * k, 70 * k, 0, 0, 7); g.stroke(); g.restore(); }
  tag(g, NW - 26, NH - 60, 'EXAMPLE', NAVY, AMBER, 22);
}

// ------------------------------------------------------------------ scene objects
let docket, cab, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, rail, straps = [], noise = [];
const CAB_POS = V(0.95, 0, -0.25), CAB_YAW = -0.4;
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: caption-bar icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 16; wave(mg, 120, 110, 280, 90, 1, P.mint, P.mint); mg.fillStyle = P.mint; rr(mg, 110, 190, 300, 26, 13); mg.fill(); mg.fillStyle = AMBER; rr(mg, 110, 230, 180, 22, 11); mg.fill();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  cab = new THREE.Group(); cab.position.copy(CAB_POS); cab.rotation.y = CAB_YAW; scene.add(cab);
  const base = rbox(0.66, 0.1, 0.52, 0.02, mats.navy); base.position.y = 0.05; cab.add(base);
  const body = rbox(0.62, 0.92, 0.5, 0.05, mats.shell); body.position.y = 0.56; cab.add(body);
  for (const y of [0.575, 0.265]) { const f = rbox(0.58, 0.28, 0.04, 0.014, mats.shell); f.position.set(0, y, 0.27); cab.add(f); const h = rbox(0.22, 0.034, 0.034, 0.012, mats.mint); h.position.set(0, y + 0.075, 0.3); cab.add(h); }
  // ----- "bus" hint for the hook: a handrail with swinging hand straps over DOCKET
  rail = new THREE.Group(); scene.add(rail);
  const bar = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.6, 14), mats.steel)); bar.rotation.z = Math.PI / 2; bar.position.set(0.05, 1.66, 0.5); rail.add(bar);
  for (const x of [-0.42, -0.05, 0.32]) {
    const g = new THREE.Group(); g.position.set(x, 1.66, 0.5); rail.add(g);
    const belt = rbox(0.035, 0.2, 0.012, 0.006, mats.navy); belt.position.y = -0.11; g.add(belt);
    const ring = sh(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 10, 28), mats.mint)); ring.position.y = -0.26; g.add(ring);
    straps.push(g);
  }
  // amber "noise" squiggles pulsing around DOCKET in the hook
  for (let i = 0; i < 4; i++) {
    const c = canvas(256, 128), g = c.getContext('2d'); g.strokeStyle = AMBER; g.lineWidth = 12; g.lineCap = 'round'; g.lineJoin = 'round'; g.shadowColor = AMBER; g.shadowBlur = 14;
    g.beginPath(); for (let k = 0; k <= 8; k++) { const x = 20 + k * 27, y = 64 + (k % 2 ? -34 : 34) * (i % 2 ? 0.8 : 1); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.11), new THREE.MeshBasicMaterial({ map: cvTex(c), transparent: true, depthWrite: false, toneMapped: false })); scene.add(m); noise.push(m);
  }
  // ----- the easel with the said-vs-captioned card
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW, NH); drawCompare(cardCanvas.getContext('2d'));
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false })); cardMesh.position.set(0, 1.0, 0.002); board.add(cardMesh);
  // ----- the phone (illustrative example screens; not any real phone's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  const lens = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 24), mats.mint)); lens.rotation.x = Math.PI / 2; lens.position.set(-0.08, 0.2, -0.019); phone.add(lens);
}

// ------------------------------------------------------------------ card + phone screen states (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
let cardKey = '', screenKey = '';
function updateCard(t) {
  const s = { said: q20(inv(Hh.said, Hh.said + 0.3, t)), cap: q20(inv(Hh.capSays, Hh.capSays + 0.3, t)), ne: q20(inv(Hh.ne, Hh.ne + 0.2, t)), ring: q20(inv(Hh.ne + 0.1, Hh.ne + 0.35, t)) };
  const k = JSON.stringify(s); if (k === cardKey) return; cardKey = k; drawCompare(cardCanvas.getContext('2d'), s); cardMesh.material.map.needsUpdate = true;
}
const CAPWORDS = ['Meet', 'me', 'at', 'the', 'gate', 'at', '3:50'];
function drawScreen(t) {
  const mode = t < 3.6 ? 'msg' : t < 8.1 ? 'settings' : 'chat';
  const k = { mode, tA: q20(inv(Hh.togA, Hh.togA + 0.2, t)), tI: q20(inv(Hh.togI, Hh.togI + 0.2, t)), play: q20(inv(Hh.play, Hh.play + 2.6, t)),
    words: Math.floor(clamp((t - Hh.words0) / (Hh.words1 - Hh.words0)) * CAPWORDS.length + 1e-6) * (t >= Hh.words0 ? 1 : 0),
    chips: Hh.chips.map((a) => q20(inv(a, a + 0.25, t))), typed: q20(inv(Hh.type0, Hh.type1, t)), sent: t >= Hh.send ? 1 : 0, reply: q20(inv(Hh.reply, Hh.reply + 0.3, t)), fixed: q20(inv(Hh.fixed, Hh.fixed + 0.3, t)) };
  const key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'EXAMPLE', NAVY, AMBER, 24);
  if (mode === 'settings') {
    g.fillStyle = '#F4F7FB'; g.font = `800 44px ${HI}`; g.fillText('Accessibility', 34, 128);
    const row = (y, os, name, on) => {
      g.fillStyle = '#16203A'; rr(g, 24, y, SW - 48, 150, 24); g.fill();
      g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = `600 28px ${HI}`; g.fillText(os, 52, y + 44);
      g.fillStyle = '#F4F7FB'; g.font = `800 38px ${HI}`; g.fillText(name, 52, y + 100);
      const x = SW - 150, yy = y + 75; g.fillStyle = on > 0.5 ? P.mint : '#3A4560'; rr(g, x, yy - 30, 104, 60, 30); g.fill();
      g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(x + 30 + 44 * on, yy, 24, 0, 7); g.fill();
    };
    row(190, 'Android', 'Live Caption', k.tA); row(380, 'iPhone', 'Live Captions', k.tI);
    g.fillStyle = 'rgba(244,247,251,0.5)'; g.font = `500 28px ${HI}`; g.fillText('Captions speech in videos,', 34, 600); g.fillText('calls and voice messages', 34, 640);
    return;
  }
  // chat with Sam
  g.fillStyle = '#F4F7FB'; g.font = `700 34px ${HI}`; g.fillText('Sam', 30, 108); g.fillStyle = 'rgba(244,247,251,0.15)'; g.fillRect(24, 136, SW - 48, 3);
  const vm = (y) => { g.fillStyle = '#1E2A44'; rr(g, 30, y, 400, 110, 30); g.fill(); g.fillStyle = P.mint; g.beginPath(); g.arc(84, y + 55, 30, 0, 7); g.fill(); g.fillStyle = NAVY; g.beginPath(); g.moveTo(74, y + 38); g.lineTo(100, y + 55); g.lineTo(74, y + 72); g.closePath(); g.fill(); wave(g, 130, y + 55, 250, 60, mode === 'msg' ? 0 : k.play, P.mint, 'rgba(244,247,251,0.3)'); g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = '600 24px "JetBrains Mono"'; g.fillText('0:06', 340, y + 92); };
  vm(170);
  if (mode === 'msg') {     // hook: can't hear — sound blocked
    g.save(); g.fillStyle = AMBER; g.beginPath(); g.arc(SW / 2, 520, 120, 0, 7); g.fill(); g.fillStyle = NAVY; g.beginPath(); g.moveTo(SW / 2 - 60, 490); g.lineTo(SW / 2 - 25, 490); g.lineTo(SW / 2 + 15, 450); g.lineTo(SW / 2 + 15, 590); g.lineTo(SW / 2 - 25, 550); g.lineTo(SW / 2 - 60, 550); g.closePath(); g.fill();
    g.strokeStyle = NAVY; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(SW / 2 + 40, 480); g.lineTo(SW / 2 + 90, 560); g.moveTo(SW / 2 + 90, 480); g.lineTo(SW / 2 + 40, 560); g.stroke(); g.restore();
    g.fillStyle = '#F4F7FB'; g.font = `800 40px ${HI}`; g.textAlign = 'center'; g.fillText('Too noisy to hear', SW / 2, 700); g.textAlign = 'left';
    return;
  }
  // live caption box (types the words)
  if (k.words > 0 || t >= Hh.words0) {
    g.fillStyle = 'rgba(14,20,36,0.95)'; rr(g, 24, 310, SW - 48, 170, 22); g.fill(); g.strokeStyle = P.mint; g.lineWidth = 4; g.stroke();
    g.fillStyle = P.mint; g.font = `700 24px ${HI}`; g.fillText('LIVE CAPTION', 46, 344);
    g.font = `800 44px ${HI}`; let x = 46, y = 400;
    for (let i = 0; i < k.words; i++) { const w = CAPWORDS[i] + ' ', ww = g.measureText(w).width; if (x + ww > SW - 40) { x = 46; y += 54; }
      const last = CAPWORDS[i] === '3:50'; g.fillStyle = last ? AMBER : '#F4F7FB';
      if (last && k.fixed > 0) { g.save(); g.globalAlpha = 1 - k.fixed; g.fillText(w, x, y); g.restore(); g.save(); g.globalAlpha = k.fixed; g.fillStyle = P.mint; g.fillText('3:15 ✓', x, y); g.restore(); }
      else g.fillText(w, x, y);
      x += ww; }
  }
  // what to check: times, names, numbers
  ['Times', 'Names', 'Numbers'].forEach((s, i) => { const a = k.chips[i]; if (a <= 0) return; const x = [34, 184, 344][i]; g.save(); g.globalAlpha = a; g.translate(x, 540); g.scale(0.7 + 0.3 * a, 0.7 + 0.3 * a);
    g.font = `800 34px ${HI}`; const w = g.measureText(s).width + 34; g.fillStyle = '#16203A'; rr(g, 0, -30, w, 60, 30); g.fill(); g.strokeStyle = AMBER; g.lineWidth = 4; g.stroke(); g.fillStyle = AMBER; g.fillText(s, 17, 2); g.restore(); });
  // my check with the sender, then Sam's reply
  if (k.typed > 0) { const s = 'Is it 3:15 or 3:50?'; const n = Math.round(s.length * k.typed); g.font = `800 40px ${HI}`; const w = Math.min(SW - 80, g.measureText(s).width + 50); g.fillStyle = P.mint; rr(g, SW - 30 - w, 620, w, 90, 30); g.fill(); g.fillStyle = NAVY; g.fillText(s.slice(0, n), SW - 30 - w + 25, 667); }
  if (k.sent) { g.fillStyle = 'rgba(244,247,251,0.5)'; g.font = `600 22px ${HI}`; g.textAlign = 'right'; g.fillText('Sent', SW - 34, 732); g.textAlign = 'left'; }
  if (k.reply > 0) { g.save(); g.globalAlpha = k.reply; g.fillStyle = '#1E2A44'; rr(g, 30, 770, 380, 90, 30); g.fill(); g.fillStyle = '#F4F7FB'; g.font = `800 42px ${HI}`; g.fillText('3:15! See you', 58, 817); g.restore(); }
}

// ------------------------------------------------------------------ choreography
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...HOME2, headPitch: 6, headYaw: -14, headRoll: 6 } },
  { t: 1.4, p: { headYaw: 12, headRoll: -8 } },
  { t: 2.6, p: { headYaw: -8, headRoll: 10, headPitch: 14 } },
  { t: 3.55, p: { headYaw: 0, headRoll: 0, headPitch: 14 } },
  { t: 12.39, p: {} },
  { t: 12.4, p: { x: 0.3, z: 0.5 } },                                                         // (cut) clear of the easel close-up
  { t: 18.19, p: {} },
  { t: 18.2, p: { ...HOME2, headPitch: 14 } },                                                // (cut) back on the phone
  { t: 23.6, p: { headPitch: 16 } },
  { t: 24.0, e: 'outBack', p: { headPitch: 6, lean: -4 } },                                    // reply arrives: relief
  { t: 25.49, p: { lean: 0 } },
  { t: 25.5, p: { ...REST_ARMS, headPitch: -2, headYaw: 0 } },                                 // (cut) CTA
  { t: 26.4, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.3, p: { bFwd: 120 } },
  { t: 29.0, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 1], [30.5, 1]], 1: [[-1, 1], [3.55, 1], [3.6, 1], [25.49, 1], [25.5, 0], [30.5, 0]] };
const EXPR = [[-9, 'puzzled'], [1.4, 'skeptic'], [2.6, 'puzzled'], [3.6, 'focus'], [6.4, 'happy'], [8.1, 'focus'], [10.6, 'happy'], [12.4, 'focus'], [18.2, 'determined'], [21.3, 'focus'], [23.7, 'happy'], [24.4, 'proud'], [25.5, 'happy'], [28.4, 'proud']];
const BLINKS = [2.2, 5.0, 9.4, 13.6, 17.0, 20.3, 22.8, 27.3, 29.3];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  if (t < 3.6) { p.lean += 4 * Math.sin(t * 5.2); p.tilt = (p.tilt || 0) + 5 * Math.sin(t * 3.4); p.hop += 0.012 * Math.abs(Math.sin(t * 6)); }   // bus sway
  p.antenna = kick(t, 0.2, 18) + kick(t, Hh.togA, 10) + kick(t, Hh.ne, 14) + kick(t, Hh.reply, 14) + 6 * Math.sin(t * 3.1) + (t < 3.6 ? 10 * Math.sin(t * 5.2) : 0);
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
  const HOOK = spot(p, V(0.06, 0.74, 0.36), -0.32);                // lower, so DOCKET's puzzled face reads above it
  const SHOW = spot(p, V(0.0, 1.02, 0.36), -0.06);
  const LOW = spot(p, V(-0.14, 0.62, 0.25), -0.4, 0.2);
  const segs = [[-1, HOOK], [3.59, HOOK], [3.6, SHOW], [25.49, SHOW], [25.5, LOW]];
  let i = 1; while (i < segs.length - 1 && t > segs[i][0]) i++;
  const [t0, A] = segs[i - 1], [t1, B] = segs[i], k = E.inOutCubic(inv(t0, t1, t));
  return { p: A.p.clone().lerp(B.p, k), q: A.q.clone().slerp(B.q, k) };
}
const onPhone = (x, y, z = 0.02) => phone.localToWorld(V(x, y, z));

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  rail.visible = t < 3.6;
  straps.forEach((s, i) => { s.rotation.z = 0.22 * Math.sin(t * 5.2 + i * 0.8); s.rotation.x = 0.08 * Math.sin(t * 3.4 + i); });
  scene.updateMatrixWorld(true);
  const s = phoneSpotAt(t); phone.position.copy(s.p); phone.quaternion.copy(s.q);
  scene.updateMatrixWorld(true);
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  let tA = onPhone(-0.19, -0.06, 0), tB = onPhone(0.19, -0.06, 0);
  if (t < 3.6) tB = straps[1].localToWorld(V(0.0, -0.31, 0));                                // holding the strap on the bus
  if (t >= 25.5) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  noise.forEach((m, i) => { m.visible = t < 3.6; if (!m.visible) return; const a = (i / 4) * Math.PI * 2 + t * 0.6, r = 0.52 + 0.05 * Math.sin(t * 7 + i);
    m.position.copy(local(p, V(Math.cos(a) * r, 1.25 + Math.sin(a) * 0.2, 0.25))); m.quaternion.copy(cam.quaternion); m.scale.setScalar(0.8 + 0.3 * Math.abs(Math.sin(t * 6 + i))); m.material.opacity = 0.6 + 0.4 * Math.abs(Math.sin(t * 5 + i * 2)); });
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updateCard(t); drawScreen(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const INS = [[-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]];
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const CAM = [
  [0.0, [0.1, 1.42, 2.75], [0.0, 1.24, 0.45]], [3.59, [0.06, 1.38, 2.5], [0.0, 1.22, 0.45]],
  [3.6, ...INS], [8.09, [-0.03, 1.15, 1.88], [-0.03, 1.12, 0.88]],
  [8.1, ...INS], [12.39, [-0.03, 1.15, 1.86], [-0.03, 1.12, 0.88]],
  [12.4, ...LAB], [18.19, [-0.14, 1.13, 1.095], [-0.64, 1.13, -0.32]],
  [18.2, ...INS], [25.49, [-0.03, 1.15, 1.84], [-0.03, 1.12, 0.88]],
  [25.5, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const sway = t < 3.6 ? 0.012 * Math.sin(t * 5.2) : 0;
  const shake = kick(t, Hh.ne, 0.012, 0.1, 40) + kick(t, Hh.togA, 0.005, 0.08, 40) + kick(t, Hh.reply, 0.006, 0.08, 40);
  cam.position.set(pos[0] + shake + sway + 0.006 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.005 * Math.sin(t * 1.3), pos[2]);
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
