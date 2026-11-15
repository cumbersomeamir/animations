// shutter.js — Ideaverse production 30s english-17 #01 (English): how a phone keeps the moment from before you pressed
// (a rolling buffer of frames; the shutter picks frames already taken; Live Photos / Top Shot keep 1.5 s each side; a model
// suggests the sharpest; pick the frame yourself). Engine header copied unchanged from english-09 photosearch.js (= accepted
// feedback-round renderer = education pilot-01 engine); overlay tail from english-12 (caption safe area x 100..900).
// New: an original illustrated dog-jump scene, the frame ring, the ±1.5 s card, the frame-picker phone. Pure function of t.
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
const RED = '#FF4D4D';
function makeLabel(w, h, px = 1024) { const c = canvas(px, Math.round(px * h / w)); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: cvTex(c), transparent: true, depthWrite: false, depthTest: false, toneMapped: false })); m.userData.c = c; m.userData.key = ''; m.visible = false; m.renderOrder = 10; scene.add(m); return m; }
function paintLabel(m, key, draw) { if (m.userData.key === key) return; m.userData.key = key; const c = m.userData.c, g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height); m.material.map.needsUpdate = true; }
function pill(g, W2, H2, txt, bg, fg) { g.fillStyle = bg; g.beginPath(); g.roundRect(8, 8, W2 - 16, H2 - 16, (H2 - 16) / 2); g.fill(); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  let S = Math.round(H2 * 0.56); g.font = `800 ${S}px ${HI}`; while (g.measureText(txt).width > W2 * 0.86 && S > 10) { S -= 2; g.font = `800 ${S}px ${HI}`; } g.fillText(txt, W2 / 2, H2 * 0.53); }
function billboard(m, pos, s) { m.position.copy(pos); m.quaternion.copy(cam.quaternion); m.scale.setScalar(Math.max(0.01, s)); m.visible = s > 0.02; }

// ------------------------------------------------------------------ the illustrated scene: a dog jumping a hurdle (editorial, original)
const PEAK = 0.5, PRESS_PH = 0.72;                                // jump apex · the moment the shutter was pressed (too late)
const rowPh = (r) => PRESS_PH + (r - 3) * 0.11;                    // 7 frames, ±1.5 s around the press (illustrative spacing)
function jumpU(ph) { return clamp((ph - 0.3) / 0.4); }
function blurAt(ph) { const u = jumpU(ph); return u > 0 && u < 1 ? 0.12 + 0.88 * Math.abs(Math.cos(Math.PI * u)) : 1; }
function dogBody(g, s, tilt, legPh, air) {
  g.save(); g.rotate(tilt); const fur = '#D9973F', dark = '#9C6526';
  g.strokeStyle = fur; g.lineCap = 'round'; g.lineWidth = s * 0.07; g.beginPath(); g.moveTo(-0.38 * s, -0.06 * s); g.quadraticCurveTo(-0.58 * s, -0.12 * s, -0.62 * s, -0.3 * s); g.stroke();
  g.strokeStyle = dark; g.lineWidth = s * 0.075;
  const leg = (x, a, len) => { g.beginPath(); g.moveTo(x * s, 0.08 * s); g.lineTo(x * s + Math.sin(a) * len * s, 0.08 * s + Math.cos(a) * len * s); g.stroke(); };
  if (air) { leg(0.24, -1.15, 0.3); leg(0.18, -0.95, 0.3); leg(-0.24, 1.2, 0.3); leg(-0.18, 1.0, 0.3); }
  else { leg(0.24, 0.5 * Math.sin(legPh), 0.3); leg(0.18, 0.5 * Math.sin(legPh + 2.2), 0.3); leg(-0.24, 0.5 * Math.sin(legPh + 3.1), 0.3); leg(-0.18, 0.5 * Math.sin(legPh + 5.0), 0.3); }
  g.fillStyle = fur; g.beginPath(); g.ellipse(0, 0, 0.42 * s, 0.17 * s, 0, 0, 7); g.fill();
  g.strokeStyle = P.mint; g.lineWidth = s * 0.05; g.beginPath(); g.moveTo(0.3 * s, -0.16 * s); g.lineTo(0.36 * s, 0.06 * s); g.stroke();
  g.fillStyle = fur; g.beginPath(); g.arc(0.46 * s, -0.16 * s, 0.15 * s, 0, 7); g.fill();
  g.fillStyle = '#EDBE78'; g.beginPath(); g.ellipse(0.6 * s, -0.11 * s, 0.1 * s, 0.065 * s, 0, 0, 7); g.fill();
  g.fillStyle = '#2B1D12'; g.beginPath(); g.arc(0.69 * s, -0.13 * s, 0.025 * s, 0, 7); g.fill(); g.beginPath(); g.arc(0.5 * s, -0.21 * s, 0.022 * s, 0, 7); g.fill();
  g.fillStyle = dark; g.beginPath(); g.ellipse(0.38 * s, -0.22 * s, 0.05 * s, 0.11 * s, -0.5, 0, 7); g.fill();
  g.restore();
}
function drawScene(g, W, H, ph, sharpen = 1) {
  const gy = H * 0.82;
  const sk = g.createLinearGradient(0, 0, 0, gy); sk.addColorStop(0, '#8FCBEA'); sk.addColorStop(1, '#E6F3F7'); g.fillStyle = sk; g.fillRect(0, 0, W, gy);
  g.fillStyle = '#F7E3A1'; g.beginPath(); g.arc(W * 0.82, H * 0.17, Math.min(W, H) * 0.09, 0, 7); g.fill();
  g.fillStyle = '#86C98F'; g.beginPath(); g.ellipse(W * 0.22, gy, W * 0.5, H * 0.14, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#5DBB63'; g.fillRect(0, gy, W, H - gy);
  const s = Math.min(W * 0.34, H * 0.42), hx = W * 0.5, hh = s * 0.55;
  g.fillStyle = '#F4F7FB'; g.fillRect(hx - s * 0.32, gy - hh, s * 0.05, hh); g.fillRect(hx + s * 0.27, gy - hh, s * 0.05, hh);
  g.fillStyle = AMBER; g.fillRect(hx - s * 0.36, gy - hh - s * 0.05, s * 0.72, s * 0.06);
  const u = jumpU(ph), air = u > 0.04 && u < 0.96, jh = Math.min(H * 0.42, W * 0.5);
  const x = lerp(W * 0.1, W * 0.9, ph), y = gy - s * 0.37 - Math.sin(Math.PI * u) * jh, tilt = air ? -Math.cos(Math.PI * u) * 0.38 : 0;
  const b = blurAt(ph) * sharpen, vx = 1, vy = air ? -Math.cos(Math.PI * u) * 1.4 : 0, n = Math.hypot(vx, vy);
  const N = b > 0.2 ? 6 : 1;
  for (let i = N - 1; i >= 0; i--) { const o = (i / Math.max(1, N - 1)) * b * s * 0.32; g.save(); g.globalAlpha = N > 1 ? (i === 0 ? 0.6 : 0.22) : 1; g.translate(x - (vx / n) * o, y - (vy / n) * o); dogBody(g, s, tilt, ph * 46, air); g.restore(); }
}
const CAPS = Array.from({ length: Hh.capN }, (_, k) => ({ t: Hh.cap0 + k * Hh.capDt, ph: lerp(0.05, PRESS_PH, k / (Hh.capN - 1)) }));
const IMG = {};

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, labelL, ringCards = [], ringBase, nowTag, result, resultMat;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
const NW = 600, NH = 800, CS = 2;
const RING_C = V(0.0, 1.0, 0.25), RING_R = 0.38, RESULT_POS = V(0.0, 1.04, 0.62);
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: shutter-ring icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 14; mg.strokeStyle = P.mint; mg.lineWidth = 12; mg.beginPath(); mg.arc(256, 150, 84, 0, 7); mg.stroke(); mg.fillStyle = P.mint; mg.beginPath(); mg.arc(256, 150, 56, 0, 7); mg.fill();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  // easel + card (the frames around the press)
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // the rolling buffer: 12 frame slots on a loop, a NOW mark at the front
  IMG.caps = CAPS.map((c) => { const cv = canvas(256, 144), g = cv.getContext('2d'); drawScene(g, 256, 144, c.ph); g.strokeStyle = 'rgba(244,247,251,0.9)'; g.lineWidth = 6; g.strokeRect(3, 3, 250, 138); return cvTex(cv); });
  { const cv = canvas(256, 144), g = cv.getContext('2d'); g.fillStyle = '#16203A'; g.fillRect(0, 0, 256, 144); g.strokeStyle = 'rgba(244,247,251,0.35)'; g.lineWidth = 6; g.strokeRect(3, 3, 250, 138); IMG.blank = cvTex(cv); }
  for (let j = 0; j < 12; j++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1125), new THREE.MeshBasicMaterial({ map: IMG.blank, toneMapped: false, transparent: true, side: THREE.DoubleSide })); m.visible = false; scene.add(m); ringCards.push(m); }
  ringBase = new THREE.Mesh(new THREE.TorusGeometry(RING_R, 0.005, 8, 96), new THREE.MeshBasicMaterial({ color: P.mint, transparent: true, opacity: 0.5, toneMapped: false })); ringBase.rotation.x = Math.PI / 2; ringBase.position.copy(RING_C).add(V(0, -0.075, 0)); ringBase.visible = false; scene.add(ringBase);
  nowTag = labelPlane(THREE, 'NOW', 0.1, 0.04, NAVY, P.mint, '800 {S}px "Space Grotesk"'); nowTag.visible = false; scene.add(nowTag);
  { const cv = canvas(512, 288), g = cv.getContext('2d'); drawScene(g, 512, 288, PRESS_PH); g.strokeStyle = '#F4F7FB'; g.lineWidth = 10; g.strokeRect(5, 5, 502, 278); resultMat = new THREE.MeshBasicMaterial({ map: cvTex(cv), toneMapped: false, transparent: true }); }
  result = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.169), resultMat); result.visible = false; result.renderOrder = 6; scene.add(result);
  // the phone (illustrative camera / frame-picker screens; not any real app's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  labelL = makeLabel(0.5, 0.13);
}

// ------------------------------------------------------------------ card + phone screens (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
let cardKey = '';
function cardState(t) { return { rows: q20(inv(Hh.rows[0], Hh.rows[1], t)), bef: q20(inv(Hh.before, Hh.before + 0.25, t)), aft: q20(inv(Hh.after, Hh.after + 0.25, t)), scan: q20(inv(Hh.scan[0], Hh.scan[1], t)), best: q20(inv(Hh.best, Hh.best + 0.25, t)) }; }
const ROW_Y = (r) => 92 + r * 98, FX = 150, FW = 410, FH = 82;
function drawCard(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  if (!(s.rows > 0)) return;
  for (let r = 0; r < 7; r++) {
    const a = clamp(s.rows * 7 - r); if (!(a > 0)) continue; const y = ROW_Y(r), scanned = s.scan * 7 > r + 0.5, dim = scanned && r !== 1 ? 0.5 : 1;
    g.save(); g.globalAlpha = a * dim; g.beginPath(); g.rect(FX, y, FW, FH); g.clip(); g.translate(FX, y); drawScene(g, FW, FH, rowPh(r)); g.restore();
    g.save(); g.globalAlpha = a; g.translate(FX, y); g.strokeStyle = r === 3 ? AMBER : 'rgba(244,247,251,0.75)'; g.lineWidth = r === 3 ? 6 : 3; g.strokeRect(0, 0, FW, FH); g.restore();
    if (r === 3) { g.save(); g.globalAlpha = a; g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(98, y + FH / 2, 24, 0, 7); g.fill(); g.strokeStyle = AMBER; g.lineWidth = 6; g.beginPath(); g.arc(98, y + FH / 2, 32, 0, 7); g.stroke(); g.restore(); }
  }
  g.font = `800 30px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (s.bef > 0) { g.globalAlpha = s.bef; g.fillStyle = P.mint; g.fillText('−1.5 s', 72, ROW_Y(0) + FH / 2); g.globalAlpha = 1; }
  if (s.aft > 0) { g.globalAlpha = s.aft; g.fillStyle = P.mint; g.fillText('+1.5 s', 72, ROW_Y(6) + FH / 2); g.globalAlpha = 1; }
  if (s.scan > 0 && s.scan < 1) { const y = lerp(ROW_Y(0) - 8, ROW_Y(6) + FH + 8, s.scan); g.fillStyle = P.mint; g.fillRect(FX - 10, y - 3, FW + 20, 6); }
  if (s.best > 0) { const y = ROW_Y(1); g.globalAlpha = s.best; g.strokeStyle = P.mint; g.lineWidth = 8; g.strokeRect(FX - 4, y - 4, FW + 8, FH + 8); g.fillStyle = P.mint; g.beginPath(); g.arc(FX + FW - 6, y + 6, 26, 0, 7); g.fill(); check(g, FX + FW - 20, y - 6, 28, NAVY, 7); g.globalAlpha = 1; }
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawCard(g, s); cardMesh.material.map.needsUpdate = true;
}
const THUMB_X = (i) => 14 + i * 76, THUMB_Y = 650, THUMB_W = 70, THUMB_H = 104, BTN = [104, 800, 340, 70];
function scrubK(t) { return E.inOutCubic(inv(Hh.scrub[0], Hh.scrub[1], t)); }
function touchDot(g, x, y, rip) {
  g.save(); g.fillStyle = 'rgba(255,194,75,0.55)'; g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill(); g.strokeStyle = AMBER; g.lineWidth = 5; g.stroke();
  if (rip >= 0) { g.globalAlpha = 1 - rip; g.strokeStyle = AMBER; g.lineWidth = 6; g.beginPath(); g.arc(x, y, 30 + 50 * rip, 0, 7); g.stroke(); }
  g.restore();
}
function touchAt(t) {                                              // the finger's position on the screen (px) in the picker
  if (t < Hh.scrub[0] - 0.35) return null;
  const k = scrubK(t), i0 = THUMB_X(3) + THUMB_W / 2, i1 = THUMB_X(1) + THUMB_W / 2, ty = THUMB_Y + THUMB_H / 2;
  if (t < Hh.scrub[1] + 0.15) return [lerp(i0, i1, k), ty];
  const bk = E.inOutCubic(inv(Hh.scrub[1] + 0.15, Hh.tap - 0.05, t)), bx = BTN[0] + BTN[2] / 2, by = BTN[1] + BTN[3] / 2;
  if (t > Hh.tap + 0.6) return null;
  return [lerp(i1, bx, bk), lerp(ty, by, bk)];
}
let screenKey = '';
function screenState(t) {
  if (t < Hh.cut3) return { m: 'hook', rip: q20((t * 1.4) % 1) };
  const k = q20(scrubK(t)), tp = touchAt(t); return { m: 'edit', k, idx: Math.round(lerp(3, 1, k)), tap: t >= Hh.tap ? 1 : 0, ok: q20(inv(Hh.saved, Hh.saved + 0.25, t)), tx: tp ? Math.round(tp[0]) : -1, ty: tp ? Math.round(tp[1]) : -1, rip: t >= Hh.tap && t < Hh.tap + 0.5 ? q20((t - Hh.tap) / 0.5) : -1 };
}
function drawScreen(t) {
  const s = screenState(t), key = JSON.stringify(s); if (key === screenKey) return; screenKey = key;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, SW, SH);
  if (s.m === 'hook') {
    g.save(); g.beginPath(); g.roundRect(14, 14, SW - 28, 690, 26); g.clip(); g.translate(14, 14); drawScene(g, SW - 28, 690, PEAK, 0.4); g.restore();
    tag(g, SW - 30, 30, 'EXAMPLE', NAVY, AMBER, 22);
    g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(SW / 2, 790, 44, 0, 7); g.fill(); g.strokeStyle = '#F4F7FB'; g.lineWidth = 6; g.beginPath(); g.arc(SW / 2, 790, 58, 0, 7); g.stroke();
    touchDot(g, SW / 2, 790, s.rip);                                // the press (a touch indicator)
  } else {
    const ph = lerp(PRESS_PH, PEAK, s.k);
    g.save(); g.beginPath(); g.roundRect(14, 14, SW - 28, 600, 26); g.clip(); g.translate(14, 14); drawScene(g, SW - 28, 600, ph, s.k > 0.95 ? 0.4 : 1); g.restore();
    tag(g, SW - 30, 30, 'EXAMPLE', NAVY, AMBER, 22);
    for (let i = 0; i < 7; i++) { g.save(); g.beginPath(); g.rect(THUMB_X(i), THUMB_Y, THUMB_W, THUMB_H); g.clip(); g.translate(THUMB_X(i), THUMB_Y); drawScene(g, THUMB_W, THUMB_H, rowPh(i)); g.restore(); }
    g.strokeStyle = '#F4F7FB'; g.lineWidth = 7; g.strokeRect(THUMB_X(s.idx) - 4, THUMB_Y - 4, THUMB_W + 8, THUMB_H + 8);
    g.fillStyle = s.tap ? P.mint : '#2A3550'; g.beginPath(); g.roundRect(BTN[0], BTN[1], BTN[2], BTN[3], 35); g.fill();
    g.fillStyle = s.tap ? NAVY : '#F4F7FB'; g.font = `800 34px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Use this frame', BTN[0] + BTN[2] / 2, BTN[1] + BTN[3] / 2 + 2);
    if (s.tx >= 0) touchDot(g, s.tx, s.ty, s.rip);
    if (s.ok > 0) { g.globalAlpha = s.ok; g.fillStyle = P.mint; g.beginPath(); g.arc(90, 540, 46, 0, 7); g.fill(); check(g, 66, 516, 48, NAVY, 10); g.globalAlpha = 1; }
  }
  screenMesh.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ choreography
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const OFF = { x: 1.7, z: 0.5, rotY: 0 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...HOME2, headPitch: 14 } },
  { t: Hh.how - 0.3, p: {} },
  { t: Hh.how, e: 'outBack', p: { headRoll: 12 } },                                               // "How?"
  { t: Hh.cut1 - 0.01, p: {} },
  { t: Hh.cut1, p: { ...OFF, headRoll: 0 } },                                                      // (cut) off for the explanation
  { t: Hh.cut3 - 0.01, p: {} },
  { t: Hh.cut3, p: { ...HOME2, headPitch: 14 } },                                                  // (cut) the phone again
  { t: Hh.saved, p: {} },
  { t: Hh.saved + 0.3, e: 'outBack', p: { headRoll: -8, headPitch: 8 } },
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headPitch: -2, headRoll: 0 } },                       // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const phoneOn = (t) => t < Hh.cut1 || (t >= Hh.cut3 && t < Hh.cta);
const EXPR = [[-9, 'focus'], [Hh.how, 'puzzled'], [Hh.cut3, 'determined'], [Hh.saved, 'happy'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [1.9, 21.3, 25.6, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, 0.0, 10) + kick(t, Hh.saved, 14) + 6 * Math.sin(t * 3.1);
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
function spot(p, lp, pitch, yawOff = 0) { return { p: local(p, lp), q: Q(pitch, p.rotY * D2R + yawOff) }; }
const onPhone = (x, y, z = 0.02) => phone.localToWorld(V(x, y, z));
const scrPt = (px, py, z = 0.05) => onPhone((px / SW - 0.5) * SC_W, (0.5 - py / SH) * SC_H, z);
function fingerAt(t) {                                             // DOCKET's B hand: on the shutter (hook) · scrubbing · tapping
  if (t < Hh.cut1) return scrPt(SW / 2, 900, 0.06);
  const k = scrubK(t), i0 = THUMB_X(3) + THUMB_W / 2, i1 = THUMB_X(1) + THUMB_W / 2, thumb = scrPt(lerp(i0, i1, k), THUMB_Y + THUMB_H / 2, 0.06);
  if (t < Hh.scrub[0] - 0.5) return scrPt(i0, THUMB_Y + THUMB_H / 2, 0.16);
  if (t < Hh.scrub[1] + 0.15) return thumb;
  const btn = scrPt(BTN[0] + BTN[2] / 2, BTN[1] + BTN[3] / 2, t >= Hh.tap - 0.12 && t < Hh.tap + 0.2 ? 0.05 : 0.14);
  return thumb.lerp(btn, E.inOutCubic(inv(Hh.scrub[1] + 0.15, Hh.tap - 0.12, t)));
}

// ------------------------------------------------------------------ the rolling buffer (pure functions of t)
function capCount(t) { let n = 0; for (const c of CAPS) if (t >= c.t) n++; return n; }
function ringAngle(t) { const n = capCount(t); if (n === 0) return 0; const frac = E.outCubic(inv(CAPS[n - 1].t, CAPS[n - 1].t + 0.18, t)); return -(n - 2 + frac) * (Math.PI / 6); }   // newest frame turns to the front
function labelAt(t) {
  if (t < Hh.cut1) return ['BEFORE YOU CLICKED', AMBER, NAVY];
  if (t >= Hh.shooting && t < Hh.loop) return ['ALREADY SHOOTING', P.mint, NAVY];
  if (t >= Hh.loop && t < Hh.press) return ['ON A LOOP', P.mint, NAVY];
  if (t >= Hh.taken && t < Hh.cut2) return ['ALREADY TAKEN', AMBER, NAVY];
  if (t >= Hh.each && t < Hh.ai) return ['1.5 S EACH SIDE', P.mint, NAVY];
  if (t >= Hh.ai && t < Hh.cut3) return ['AI SUGGESTS', P.mint, NAVY];
  if (t >= Hh.pickLbl && t < Hh.cta) return ['PICK THE FRAME', P.mint, NAVY];
  return null;
}

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  const on = phoneOn(t); phone.visible = on;
  if (on) { const s = spot(p, V(0.0, 0.88, 0.36), -0.04); phone.position.copy(s.p); phone.quaternion.copy(s.q); scene.updateMatrixWorld(true); }
  solveArm(0, p, on ? onPhone(-0.19, -0.06, 0) : null, on ? 1 : 0); solveArm(1, p, on ? onPhone(0.19, -0.06, 0) : null, on ? 1 : 0);   // both hands hold the phone; touches are drawn on the screen
  scene.updateMatrixWorld(true);
  if (on) { const h = V(); docket.handWorld(0, h); window.DBG = { hold: +h.distanceTo(onPhone(-0.19, -0.06, 0)).toFixed(3) }; }
  // the ring buffer (B · C)
  const ringOn = t >= Hh.cut1 && t < Hh.cut2; ringBase.visible = ringOn; nowTag.visible = ringOn && t < Hh.press + 0.4;
  const n = capCount(t), ang = ringAngle(Math.min(t, Hh.press));
  ringCards.forEach((m, j) => {
    m.visible = ringOn; if (!ringOn) return;
    let k = -1; for (let q = n - 1; q >= 0; q--) if (q % 12 === j) { k = q; break; }
    const a = j * (Math.PI / 6) + ang, pos = RING_C.clone().add(V(Math.sin(a) * RING_R, 0, Math.cos(a) * RING_R));
    m.material.map = k >= 0 ? IMG.caps[k] : IMG.blank;
    const age = k >= 0 ? n - 1 - k : 11, fresh = k >= 0 ? Math.exp(-(t - CAPS[k].t) / 0.15) : 0;
    let c = lerp(1, 0.35, age / 11) + 0.4 * fresh;
    const picked = k >= Hh.capN - 3 && t >= Hh.press, glow = picked ? clamp((t - Hh.press) / 0.3) : 0;
    m.material.color.setRGB(c + 0.2 * glow, c + 0.1 * glow, c - 0.2 * glow);
    m.position.copy(pos); m.rotation.set(0, a, 0); m.scale.setScalar(1); m.material.opacity = 1;
    if (picked) { const st = Hh.pick[0] + (k - (Hh.capN - 3)) * 0.12, fk = E.inOutCubic(inv(st, st + 0.45, t)); m.position.lerp(RESULT_POS, fk); m.rotation.y = lerp(a, 0, fk); m.scale.setScalar(lerp(1, 1.3, fk)); m.material.opacity = 1 - inv(0.8, 1, fk); }
  });
  nowTag.position.copy(RING_C).add(V(0, -0.12, RING_R + 0.02)); nowTag.quaternion.copy(cam.quaternion);
  const rs = t >= Hh.pick[1] - 0.1 && t < Hh.cut2 ? E.outBack(inv(Hh.pick[1] - 0.1, Hh.pick[1] + 0.25, t)) : 0;
  result.visible = rs > 0.02; result.position.copy(RESULT_POS); result.quaternion.copy(cam.quaternion); result.scale.setScalar(Math.max(0.01, rs));
  updateCard(t); if (on) drawScreen(t);
  const lb = labelAt(t);
  if (lb) { const [txt, bg, fg] = lb; paintLabel(labelL, txt + bg, (g, W2, H2) => pill(g, W2, H2, txt, bg, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.1), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: 0 });
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const PHONECAM = [[0.0, 1.16, 2.55], [0.0, 0.98, 0.9]];
const CAM = [
  [0.0, ...PHONECAM], [Hh.cut1 - 0.01, [0.0, 1.15, 2.47], [0.0, 0.98, 0.9]],
  [Hh.cut1, [0.0, 1.38, 1.62], [0.0, 0.98, 0.25]], [Hh.press, [0.0, 1.34, 1.55], [0.0, 0.98, 0.3]], [Hh.pick[1], [0.0, 1.24, 1.68], [0.0, 1.0, 0.6]], [Hh.cut2 - 0.01, [0.0, 1.23, 1.64], [0.0, 1.0, 0.6]],
  [Hh.cut2, ...LAB], [Hh.cut3 - 0.01, [-0.15, 1.13, 1.06], [-0.64, 1.13, -0.32]],
  [Hh.cut3, ...PHONECAM], [Hh.scrub[0], [0.0, 1.13, 2.4], [0.0, 0.95, 0.9]], [Hh.cta - 0.01, [0.0, 1.13, 2.36], [0.0, 0.95, 0.9]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.press, 0.006, 0.1, 40);
  cam.position.set(pos[0] + shake + 0.003 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.003 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: the jump on the phone + DOCKET's late finger + "BEFORE YOU CLICKED"
window.renderThumb = () => {
  const t = 0.0; cameraAt(t); cam.position.set(0.0, 1.24, 2.75); cam.lookAt(0.0, 1.16, 0.9); stageAt(t); labelL.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 760);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['BEFORE YOU', '#F4F7FB', 400], ['CLICKED', AMBER, 560]].forEach(([w, col, y]) => { let S = 170; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
  const v = c.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.48, H * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  return true;
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
