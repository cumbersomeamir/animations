// voiceclone.js — Ideaverse production 30s english-12 #01 (English): why a cloned voice can sound like someone you know.
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine:
// renderer, lights, newsroom stage, materials, camera system, DOCKET rig, caption pill). Caption pill re-centred for the
// 2026-11-11 safe area (x 100..900). Only props + choreography are new. Every frame is a pure function of t (window.renderAt).
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
function bigLabel(g, txt, y, a, col = '#F4F7FB', size = 56) { if (!(a > 0)) return; g.save(); g.globalAlpha = Math.min(1, a); g.font = `800 ${size}px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(txt, NW / 2, y + 12 * (1 - Math.min(1, a))); g.restore(); }
function stampMark(g, txt, x, y, a, col) { if (!(a > 0)) return; const k = Math.min(1, a); g.save(); g.translate(x, y); g.rotate(-0.12); g.scale(1.6 - 0.6 * E.outBack(k), 1.6 - 0.6 * E.outBack(k)); g.globalAlpha = k;
  g.font = `900 64px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width + 60; g.strokeStyle = col; g.lineWidth = 10; rr(g, -w / 2, -52, w, 104, 18); g.stroke(); g.fillStyle = col; g.fillText(txt, 0, 4); g.restore(); }
// an original, generic voice wave (no real person): fixed pseudo-random envelope
const WAVE = Array.from({ length: 64 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 0.61) * Math.cos(i * 0.23 + 1.1)));
function wave(g, x, y, w, h, k, col, ph = 0) { g.save(); g.fillStyle = col; const n = Math.round(WAVE.length * clamp(k)); const bw = w / WAVE.length;
  for (let i = 0; i < n; i++) { const v = WAVE[i] * (0.75 + 0.25 * Math.sin(ph * 9 + i)); const hh = Math.max(6, h * v); rr(g, x + i * bw + bw * 0.18, y - hh / 2, bw * 0.64, hh, bw * 0.3); g.fill(); } g.restore(); }
function rosette(g, cx, cy, r, k, col) {                   // the learned "voice pattern" (illustrative)
  g.save(); g.translate(cx, cy); for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, v = 0.45 + 0.55 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.9 + 0.5)); const L = r * v * clamp(k * 1.4 - i / 36 * 0.4);
    if (L <= 0) continue; g.strokeStyle = i % 3 ? col : AMBER; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32); g.lineTo(Math.cos(a) * (r * 0.32 + L), Math.sin(a) * (r * 0.32 + L)); g.stroke(); }
  g.fillStyle = '#16203A'; g.beginPath(); g.arc(0, 0, r * 0.3, 0, 7); g.fill(); g.restore(); }
function avatar(g, cx, cy, r, col) { g.save(); g.fillStyle = col; g.beginPath(); g.arc(cx, cy - r * 0.18, r * 0.42, 0, 7); g.fill(); g.beginPath(); g.ellipse(cx, cy + r * 0.72, r * 0.78, r * 0.52, 0, Math.PI, 0); g.fill(); g.restore(); }
function lock(g, cx, cy, s, col) { g.save(); g.strokeStyle = col; g.lineWidth = s * 0.14; g.beginPath(); g.arc(cx, cy - s * 0.25, s * 0.32, Math.PI, 0); g.stroke(); g.fillStyle = col; rr(g, cx - s * 0.5, cy - s * 0.25, s, s * 0.8, s * 0.12); g.fill();
  g.fillStyle = '#0E1424'; g.beginPath(); g.arc(cx, cy + s * 0.1, s * 0.11, 0, 7); g.fill(); g.restore(); }

// ---- easel card (600 x 800 logical, drawn at 2x) — one idea per face
const NW = 600, NH = 800, CS = 2;
function drawHook(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  avatar(g, NW / 2, 190, 120, '#3E8EDE'); bigLabel(g, 'SAM', 330, 1, '#F4F7FB', 60);
  wave(g, 40, 470, 520, 150, s.wave, P.mint, s.ph);
  if (s.ok > 0 && s.stamp < 1) chip(g, 196, 610, '✓ familiar', s.ok * (1 - s.stamp), P.mint, 40);
  stampMark(g, 'NOT PROOF', NW / 2, 640, s.stamp, '#E5483B');
}
function drawClip(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  if (s.pattern <= 0) {
    bigLabel(g, 'SHORT CLIP', 90, s.clip, '#F4F7FB', 52);
    g.save(); g.globalAlpha = Math.min(1, s.clip); g.fillStyle = '#16203A'; rr(g, 40, 150, 520, 420, 26); g.fill(); avatar(g, NW / 2, 300, 110, '#3E8EDE');
    wave(g, 80, 500, 440, 70, 1, 'rgba(244,247,251,0.35)'); wave(g, 80, 500, 440, 70, s.play, P.mint, s.ph); g.restore();
    if (s.learn > 0) { g.save(); g.globalAlpha = Math.min(1, s.learn); g.fillStyle = P.mint; g.beginPath(); g.moveTo(NW / 2 - 40, 610); g.lineTo(NW / 2 + 40, 610); g.lineTo(NW / 2, 680); g.fill(); g.restore(); }
    return;
  }
  bigLabel(g, 'VOICE PATTERN', 90, s.pattern, P.mint, 50);
  rosette(g, NW / 2, 400, 230, s.pattern, P.mint);
  if (s.pattern >= 1) chip(g, 205, 700, 'Sam’s sound', 1, '#3E8EDE', 32, '#FFFFFF');
}
function drawNew(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  bigLabel(g, s.like > 0 ? 'SOUNDS LIKE SAM' : 'NEW WORDS', 90, 1, s.like > 0 ? AMBER : '#F4F7FB', 50);
  const txt = 'Need money, fast!', n = Math.round(txt.length * s.type);
  g.fillStyle = '#F4F7FB'; rr(g, 40, 160, 520, 120, 24); g.fill(); g.fillStyle = NAVY; g.font = `800 46px ${HI}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt.slice(0, n), 70, 222);
  if (s.type > 0 && s.type < 1) g.fillRect(70 + g.measureText(txt.slice(0, n)).width + 4, 196, 5, 52);
  rosette(g, 130, 420, 80, 1, P.mint); g.fillStyle = '#F4F7FB'; g.font = `900 70px ${HI}`; g.textAlign = 'center'; g.fillText('+', 250, 424);
  g.save(); g.fillStyle = P.mint; g.beginPath(); g.moveTo(300, 400); g.lineTo(350, 420); g.lineTo(300, 440); g.fill(); g.restore();
  if (s.out > 0) { g.fillStyle = '#16203A'; rr(g, 360, 330, 200, 180, 22); g.fill(); wave(g, 372, 420, 176, 120, s.out, P.mint, s.ph); }
  if (s.like > 0) { g.save(); g.globalAlpha = Math.min(1, s.like); avatar(g, NW / 2, 640, 90, '#3E8EDE'); g.restore(); chip(g, 350, 600, '✓', s.like, P.mint, 44); }
}
function drawLimit(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  const box = (y, label, a, okCol, mark) => { if (!(a > 0)) return; g.save(); g.globalAlpha = Math.min(1, a); g.fillStyle = '#16203A'; rr(g, 40, y, 520, 300, 30); g.fill(); g.strokeStyle = okCol; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#F4F7FB'; g.font = `800 52px ${HI}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(label, 80, y + 70); g.restore(); mark(y, a); };
  box(60, 'SOUND', s.sound, P.mint, (y, a) => { g.save(); g.globalAlpha = Math.min(1, a); wave(g, 80, y + 190, 300, 110, 1, P.mint); g.fillStyle = P.mint; g.beginPath(); g.arc(470, y + 190, 50, 0, 7); g.fill(); check(g, 445, y + 168, 50, NAVY, 10); g.restore(); });
  box(420, 'WHAT SAM KNOWS', s.knows, AMBER, (y, a) => { g.save(); g.globalAlpha = Math.min(1, a); lock(g, 150, y + 190, 110, AMBER); g.fillStyle = '#E5483B'; g.beginPath(); g.arc(470, y + 190, 50, 0, 7); g.fill();
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(450, y + 170); g.lineTo(490, y + 210); g.moveTo(490, y + 170); g.lineTo(450, y + 210); g.stroke(); g.restore();
    if (s.code > 0) chip(g, 230, y + 196, 'code word', s.code, AMBER, 34); });
}

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, bubble, stampM;
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: voice-wave icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 16; mg.fillStyle = P.mint; for (let i = 0; i < 13; i++) { const h = 30 + 150 * Math.abs(Math.sin(i * 0.9 + 0.4)); mg.beginPath(); mg.roundRect(110 + i * 24, 150 - h / 2, 14, h, 7); mg.fill(); }
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
  bubble = labelPlane(THREE, '“Need money, fast!”', 0.44, 0.1, NAVY, '#F4F7FB', '800 {S}px "Space Grotesk"'); bubble.visible = false; scene.add(bubble);
  stampM = labelPlane(THREE, 'NEVER SAID', 0.34, 0.09, '#FFFFFF', '#E5483B', '900 {S}px "Space Grotesk"'); stampM.visible = false; scene.add(stampM);
}

// ------------------------------------------------------------------ card + phone screen states (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
const q40 = (v) => Math.round(clamp(v) * 40) / 40;
let cardKey = '', screenKey = '';
function flipScale(t) { for (const f of [Hh.flip1, Hh.flip2]) if (t >= f && t < f + 0.3) return Math.abs(Math.cos(Math.PI * (t - f) / 0.3)); return 1; }
function cardState(t) {
  const ph = Math.round(t * FPS) / FPS;
  if (t < Hh.cut1) return { face: 'hook', wave: q40(inv(Hh.wave, Hh.wave + 0.6, t)), ok: q20(inv(Hh.ok, Hh.ok + 0.25, t)), stamp: q20(inv(Hh.stamp, Hh.stamp + 0.3, t)), ph: t < Hh.stamp + 0.3 ? ph : 0 };
  if (t < Hh.cut2) return { face: 'hook', wave: 1, ok: 1, stamp: 0, ph: 0 };   // two-shot background: just "SAM ✓ familiar" (the call's own labels carry this beat)
  if (t < Hh.flip1 + 0.15) return { face: 'clip', clip: q20(inv(Hh.cut2 + 0.1, Hh.cut2 + 0.4, t)), play: q40(inv(Hh.clip, Hh.learn, t)), learn: q20(inv(Hh.learn, Hh.learn + 0.3, t)), pattern: q40(inv(Hh.pattern, Hh.pattern + 0.8, t)), ph: t < Hh.learn ? ph : 0 };
  if (t < Hh.flip2 + 0.15) return { face: 'new', type: q40(inv(Hh.type[0], Hh.type[1], t)), out: q40(inv(Hh.out, Hh.out + 0.6, t)), like: q20(inv(Hh.like, Hh.like + 0.3, t)), ph: t > Hh.out && t < Hh.like ? ph : 0 };
  return { face: 'limit', sound: q20(inv(Hh.sound, Hh.sound + 0.3, t)), knows: q20(inv(Hh.knows, Hh.knows + 0.3, t)), code: q20(inv(Hh.code, Hh.code + 0.3, t)) };
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  if (s.face === 'hook') drawHook(g, s); else if (s.face === 'clip') drawClip(g, s); else if (s.face === 'new') drawNew(g, s); else drawLimit(g, s);
  tag(g, NW - 22, NH - 62, 'EXAMPLE', NAVY, AMBER, 18); cardMesh.material.map.needsUpdate = true;
}
// phone: illustrative call screens (generic, not a specific app's UI)
function screenState(t) {
  if (t < Hh.cut4) return { m: 'in', urgent: 0, press: 0 };
  if (t < Hh.hang + 0.3) return { m: 'in', urgent: 1, press: q20(inv(Hh.hang, Hh.hang + 0.3, t)) };
  if (t < Hh.contacts) return { m: 'ended' };
  if (t < Hh.dial) return { m: 'contacts', sel: q20(inv(Hh.contacts + 0.3, Hh.contacts + 0.5, t)) };
  return { m: 'dial', real: q20(inv(Hh.real, Hh.real + 0.3, t)), dots: Math.floor(t * 3) % 4 };
}
function drawScreen(t) {
  const k = screenState(t);
  const key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'EXAMPLE', NAVY, AMBER, 24);
  g.textAlign = 'center';
  if (k.m === 'in') {
    avatar(g, SW / 2, 280, 150, '#3E8EDE'); g.fillStyle = '#F4F7FB'; g.font = `800 60px ${HI}`; g.fillText('Sam', SW / 2, 440); g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `700 30px ${HI}`; g.fillText('incoming call…', SW / 2, 494);
    if (k.urgent) { g.fillStyle = AMBER; rr(g, 64, 560, SW - 128, 90, 45); g.fill(); g.fillStyle = NAVY; g.font = `800 40px ${HI}`; g.fillText('“Need money, fast!”', SW / 2, 606); }
    g.fillStyle = '#E5483B'; g.beginPath(); g.arc(150, 840, 62 * (1 + 0.15 * Math.sin(Math.PI * (k.press || 0))), 0, 7); g.fill(); g.fillStyle = P.mint; g.beginPath(); g.arc(SW - 150, 840, 62, 0, 7); g.fill();
    g.strokeStyle = '#FFFFFF'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(124, 846); g.lineTo(176, 846); g.stroke();
    if (k.press > 0) { g.strokeStyle = `rgba(229,72,59,${(1 - k.press).toFixed(2)})`; g.lineWidth = 8; g.beginPath(); g.arc(150, 840, 62 + 120 * k.press, 0, 7); g.stroke(); }
    g.fillStyle = 'rgba(244,247,251,0.75)'; g.font = `700 28px ${HI}`; g.fillText('hang up', 150, 940); g.fillText('answer', SW - 150, 940);
  } else if (k.m === 'ended') {
    avatar(g, SW / 2, 280, 150, '#3E5470'); g.fillStyle = '#F4F7FB'; g.font = `800 60px ${HI}`; g.fillText('Call ended', SW / 2, 460);
  } else if (k.m === 'contacts') {
    g.textAlign = 'left'; g.fillStyle = '#F4F7FB'; g.font = `800 44px ${HI}`; g.fillText('Contacts', 30, 120);
    [['Alex', 0], ['Sam', 1], ['Jordan', 0], ['Priya', 0]].forEach(([n, me], i) => { const y = 190 + i * 130; const on = me && k.sel > 0;
      g.fillStyle = on ? P.mint : '#16203A'; rr(g, 26, y, SW - 52, 110, 22); g.fill(); avatar(g, 90, y + 56, 64, on ? NAVY : '#3E5470');
      g.fillStyle = on ? NAVY : '#F4F7FB'; g.font = `800 40px ${HI}`; g.fillText(n, 150, y + 44); g.font = `700 24px ${HI}`; g.fillStyle = on ? NAVY : 'rgba(244,247,251,0.55)'; g.fillText(me ? 'saved number' : 'mobile', 150, y + 82); });
    g.textAlign = 'center';
  } else {
    avatar(g, SW / 2, 280, 150, '#3E8EDE'); g.fillStyle = '#F4F7FB'; g.font = `800 60px ${HI}`; g.fillText('Sam', SW / 2, 440);
    g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `700 30px ${HI}`; g.fillText(k.real > 0 ? 'saved number · connected' : 'calling saved number' + '.'.repeat(k.dots), SW / 2, 494);
    if (k.real > 0) { g.save(); g.globalAlpha = k.real; g.fillStyle = P.mint; rr(g, 50, 560, SW - 100, 100, 50); g.fill(); g.fillStyle = NAVY; g.font = `800 38px ${HI}`; g.fillText('“I’m fine — not me!”', SW / 2, 611); g.restore();
      g.save(); g.globalAlpha = k.real; g.fillStyle = P.mint; g.beginPath(); g.arc(SW / 2, 800, 80, 0, 7); g.fill(); check(g, SW / 2 - 40, 762, 80, NAVY, 14); g.restore(); }
  }
  g.textAlign = 'left';
}

// ------------------------------------------------------------------ choreography
const OFF = { x: 0.3, z: 0.5, rotY: 6 };
const HK = { x: 0.06, z: 0.28, rotY: -14 };
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...OFF } },
  { t: Hh.cut1 - 0.01, p: {} },
  { t: Hh.cut1, p: { ...HK, headYaw: 4, headPitch: 14 } },                                       // (cut) two-shot: DOCKET answers "Sam"
  { t: Hh.never - 0.05, p: {} },
  { t: Hh.never + 0.3, e: 'outBack', p: { headYaw: 10, headPitch: -2, lean: -5 } },              // double take: "Sam never said it"
  { t: Hh.cut2 - 0.01, p: {} },
  { t: Hh.cut2, p: { ...OFF, lean: 0, headYaw: 0, headPitch: 0 } },                              // (cut) easel
  { t: Hh.cut4 - 0.01, p: {} },
  { t: Hh.cut4, p: { ...HOME2, headPitch: 14 } },                                                 // (cut) phone: hang up, call back
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...REST_ARMS, headPitch: -2 } },                                              // (cut) CTA
  { t: 27.6, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.9, p: { bFwd: 120 } },
  { t: 29.5, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 1], [30.5, 1]], 1: [[-1, 1], [Hh.cta - 0.01, 1], [Hh.cta, 0], [30.5, 0]] };
const EXPR = [[-9, 'neutral'], [Hh.cut1, 'happy'], [Hh.never, 'wow'], [Hh.never + 0.6, 'skeptic'], [Hh.cut2, 'focus'], [Hh.cut4, 'skeptic'], [Hh.hang, 'determined'], [Hh.real, 'happy'], [Hh.real + 0.6, 'proud'], [Hh.cta, 'happy'], [29.0, 'proud']];
const BLINKS = [3.6, 9.6, 12.9, 22.2, 24.9, 28.0, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.never, 18) + kick(t, Hh.hang, 12) + kick(t, Hh.real, 14) + 6 * Math.sin(t * 3.1);
  if (t > 27.6) { p.headPitch += 3 * Math.sin((t - 27.6) * 5) * Math.exp(-(t - 27.6) * 1.2); p.bFwd += 7 * Math.sin((t - 27.6) * 6.2) * Math.exp(-(t - 27.6) * 0.8); }
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
  const CHEST = spot(p, V(0.06, 0.84, 0.38), -0.22, 0.12);         // two-shot: call screen toward camera
  const SHOW = spot(p, V(0.0, 1.02, 0.36), -0.06);
  const LOW = spot(p, V(-0.14, 0.62, 0.25), -0.4, 0.2);
  const segs = [[-1, CHEST], [Hh.cut2 - 0.01, CHEST], [Hh.cut2, SHOW], [Hh.cta - 0.01, SHOW], [Hh.cta, LOW]];
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
  if (t >= Hh.cta) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  // the call's words (bubble) and the stamp, beside DOCKET's head, below the caption band
  const bu = t >= Hh.bubble && t < Hh.cut2 ? E.outBack(inv(Hh.bubble, Hh.bubble + 0.3, t)) : 0, st = t >= Hh.never && t < Hh.cut2 ? E.outBack(inv(Hh.never, Hh.never + 0.3, t)) : 0;
  bubble.position.copy(local(p, V(-0.21, 1.17, 0.42))); bubble.quaternion.copy(cam.quaternion); bubble.scale.setScalar(Math.max(0.01, bu)); bubble.visible = bu > 0.02;
  stampM.position.copy(local(p, V(-0.2, 1.09, 0.46))); stampM.quaternion.copy(cam.quaternion); stampM.rotateZ(0.1); stampM.scale.setScalar(Math.max(0.01, st)); stampM.visible = st > 0.02;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updateCard(t); drawScreen(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const INS = [[-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]];
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const LIMIT = [[-0.205, 1.16, 0.909], [-0.639, 1.16, -0.316]];        // the two-box card, square and a little closer
const CAM = [
  [0.0, [-0.07, 1.13, 1.3], [-0.64, 1.13, -0.32]], [Hh.cut1 - 0.01, [-0.16, 1.13, 1.04], [-0.64, 1.13, -0.32]],
  [Hh.cut1, [0.44, 1.2, 2.45], [-0.2, 1.0, 0.0]], [Hh.cut2 - 0.01, [0.38, 1.18, 2.28], [-0.2, 1.0, 0.0]],
  [Hh.cut2, ...LAB], [Hh.push[0], [-0.14, 1.13, 1.09], [-0.64, 1.13, -0.32]], [Hh.push[1], ...LIMIT], [Hh.cut4 - 0.01, [-0.222, 1.16, 0.862], [-0.639, 1.16, -0.316]],
  [Hh.cut4, ...INS], [Hh.cta - 0.01, [-0.03, 1.15, 1.86], [-0.03, 1.12, 0.88]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.stamp, 0.008, 0.1, 40) + kick(t, Hh.never, 0.006, 0.1, 40) + kick(t, Hh.hang, 0.005, 0.08, 40);
  cam.position.set(pos[0] + shake + 0.006 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.005 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: the two-shot moment + 3 large words
window.renderThumb = () => {
  const t = 4.9; cameraAt(t); stageAt(t); renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 1100); gr.addColorStop(0, 'rgba(8,11,22,0.92)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 1100);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['THAT', '#F4F7FB', 330], ['VOICE', '#F4F7FB', 510], ['LIED.', AMBER, 690]].forEach(([w, col, y]) => { c.font = `800 180px ${HI}`; c.lineWidth = 26; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
