// theftlock.js — Ideaverse production 30s english-25 #01 (English): Android's Theft Detection Lock — AI + motion sensors recognise
// a grab, then running/biking/driving away, and lock the screen; may not trigger with steady Wi-Fi/Bluetooth; where to turn it on.
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine);
// overlay tail from english-12. New: a night street set (shop fronts, lamp posts), a gloved snatch, sensor / motion-pattern / Wi-Fi-Bluetooth cards, generic settings screen.
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

// ------------------------------------------------------------------ the street at night (original set) + the snatch
const CORAL = '#FF7A45', GREY = '#9AA6BF', RED2 = '#FF5A5A';
function mulberry(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, labelL, labelH, street, glove, sleeve, streaks = [];
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
const NW = 600, NH = 800, CS = 2;
function shopTexture(seed) {
  const c = canvas(512, 384), g = c.getContext('2d'), r = mulberry(seed);
  const gr = g.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, '#FFD9A0'); gr.addColorStop(1, '#E39A5C'); g.fillStyle = gr; g.fillRect(0, 0, 512, 384);
  for (let s = 0; s < 3; s++) { const y = 90 + s * 100; g.fillStyle = 'rgba(80,40,30,0.55)'; g.fillRect(20, y + 52, 472, 10); for (let i = 0; i < 9; i++) { g.fillStyle = ['#5A3E66', '#3E6A8A', '#7A4A3A', '#3E7A5A'][Math.floor(r() * 4)]; g.fillRect(30 + i * 52 + r() * 10, y + 10 + r() * 14, 26 + r() * 12, 40 - r() * 14); } }
  return cvTex(c);
}
function buildStreet() {
  street = new THREE.Group(); scene.add(street);
  const walk = rbox(7.0, 0.04, 1.6, 0.01, M('#3A4A72', { roughness: 0.75 })); walk.position.set(1.5, 0.02, 0.6); walk.receiveShadow = true; street.add(walk);
  const curb = rbox(7.0, 0.06, 0.08, 0.01, M('#8C9BB8', { roughness: 0.6 })); curb.position.set(1.5, 0.03, 1.42); street.add(curb);
  for (let x = -1.6; x < 5.0; x += 1.1) {                                  // shop fronts: a frame and a warm window
    const fr = rbox(0.96, 1.2, 0.08, 0.02, M('#1B2333', { roughness: 0.7 })); fr.position.set(x, 0.9, -0.45); street.add(fr);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.62), new THREE.MeshBasicMaterial({ map: shopTexture(Math.round(x * 10) + 40), toneMapped: false })); win.position.set(x, 1.0, -0.405); street.add(win);
    const awn = rbox(0.96, 0.05, 0.22, 0.01, M(['#3E8A5A', '#B5523A', '#2F64D6'][Math.round((x + 1.6) / 1.1) % 3], { roughness: 0.6 })); awn.position.set(x, 1.38, -0.32); street.add(awn);
  }
  for (const x of [-1.4, 1.45, 3.05, 4.65]) {                              // lamp posts along the curb (foreground depth in the chase; none in the hook's centre)
    const pole = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.7, 12), mats.steel)); pole.position.set(x, 0.85, 1.35); street.add(pole);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), new THREE.MeshBasicMaterial({ color: '#FFE2A0', toneMapped: false })); lamp.position.set(x, 1.72, 1.35); street.add(lamp);
  }
  // the thief: only a dark sleeve and glove (no person shown)
  glove = rbox(0.09, 0.11, 0.075, 0.03, M('#4A5060', { roughness: 0.75 })); scene.add(glove);
  sleeve = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.9, 16), M('#3A4050', { roughness: 0.8 }))); scene.add(sleeve);
  for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.012), new THREE.MeshBasicMaterial({ color: '#F4F7FB', transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); scene.add(m); streaks.push(m); }
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
  docket = createDocket(THREE); scene.add(docket.root);
  buildStreet();
  // easel + card
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // the phone (generic; not any real phone's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  labelL = makeLabel(0.5, 0.13); labelH = makeLabel(0.56, 0.21);
}

// ------------------------------------------------------------------ 2D helpers (pure functions of a quantised state)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
const bg = (g, w, h, col) => { g.fillStyle = col; g.fillRect(0, 0, w, h - 1); g.fillRect(0, h - 1, w, 1); };   // two partial fills (a lone full-canvas fill can be dropped by Chromium)
function centreChip(g, cx, y, txt, a, col, size, fg = NAVY) { if (!(a > 0)) return; g.save(); g.font = `800 ${size}px ${HI}`; const w = g.measureText(txt).width + size * 1.1; g.restore(); chip(g, cx - w / 2, y, txt, a, col, size, fg); }
function lockIcon(g, x, y, s, col) { g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = s * 0.16; g.beginPath(); g.arc(x, y - s * 0.25, s * 0.34, Math.PI, 0); g.stroke(); rr(g, x - s * 0.5, y - s * 0.25, s, s * 0.8, s * 0.12); g.fill(); g.restore(); }
function wifiIcon(g, x, y, s, col) { g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = s * 0.12; g.lineCap = 'round'; for (const k of [1, 0.66, 0.33]) { g.beginPath(); g.arc(x, y + s * 0.4, s * k, -Math.PI * 0.78, -Math.PI * 0.22); g.stroke(); } g.beginPath(); g.arc(x, y + s * 0.4, s * 0.09, 0, 7); g.fill(); g.restore(); }
function btIcon(g, x, y, s, col) { g.save(); g.strokeStyle = col; g.lineWidth = s * 0.12; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - s * 0.35, y - s * 0.3); g.lineTo(x + s * 0.3, y + s * 0.3); g.lineTo(x, y + s * 0.6); g.lineTo(x, y - s * 0.6); g.lineTo(x + s * 0.3, y - s * 0.3); g.lineTo(x - s * 0.35, y + s * 0.3); g.stroke(); g.restore(); }
function axesIcon(g, x, y, s, col, wob) { g.save(); g.translate(x, y); g.rotate(wob * 0.25); g.strokeStyle = g.fillStyle = col; g.lineWidth = s * 0.1; g.lineCap = 'round';
  for (const [dx, dy] of [[1, 0], [0, -1], [-0.6, 0.6]]) { g.beginPath(); g.moveTo(0, 0); g.lineTo(dx * s, dy * s); g.stroke(); g.beginPath(); g.arc(dx * s, dy * s, s * 0.12, 0, 7); g.fill(); } g.restore(); }

// ---- the phone screen: unlocked (app tiles) → locked (lock + flash); payoff: the settings path (EXAMPLE)
let screenKey = '';
const TILE_COLS = [CORAL, AMBER, P.mint, '#4E7BD8', '#C9A7FF', '#F4F7FB'];
function screenState(t) {
  if (t >= Hh.cut5) return { m: 'set', r: Hh.rows.map((x) => q20(inv(x, x + 0.25, t))), tg: q20(inv(Hh.toggle, Hh.toggle + 0.2, t)), tap: t >= Hh.toggle - 0.1 && t < Hh.toggle + 0.2 ? 1 : 0 };
  const L = t < Hh.cut3 ? Hh.lock1 : Hh.lock2, lk = t >= L ? 1 : 0;
  return { m: lk ? 'lock' : 'home', f: lk ? q20(inv(L, L + 0.45, t)) : 0 };
}
function drawScreen(t) {
  const s = screenState(t), key = JSON.stringify(s); if (key === screenKey) return; screenKey = key;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (s.m === 'home') {
    bg(g, SW, SH, '#22305A'); g.fillStyle = '#F4F7FB'; g.font = `800 64px ${HI}`; g.fillText('10:41', SW / 2, 150);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { g.fillStyle = TILE_COLS[(i + j * 2) % TILE_COLS.length]; rr(g, 50 + i * 120, 300 + j * 140, 88, 88, 24); g.fill(); }
  } else if (s.m === 'lock') {
    bg(g, SW, SH, '#0B1020');
    if (s.f < 1) { g.save(); g.globalAlpha = 1 - s.f; g.strokeStyle = P.mint; g.lineWidth = 18; g.beginPath(); g.arc(SW / 2, 470, 120 + 260 * s.f, 0, 7); g.stroke(); g.restore(); }
    lockIcon(g, SW / 2, 480, 190 * (1.25 - 0.25 * E.outBack(Math.min(1, s.f * 2))), '#F4F7FB');
    g.fillStyle = 'rgba(244,247,251,0.8)'; g.font = `800 40px ${HI}`; g.fillText('Locked', SW / 2, 700);
  } else {
    bg(g, SW, SH, '#0E1424'); g.textAlign = 'left';
    g.fillStyle = '#F4F7FB'; g.font = `800 50px ${HI}`; g.fillText('Settings', 34, 110);
    const rows = [['Google', 0], ['All services', 1], ['Theft protection', 2]];
    rows.forEach(([txt, i]) => { const a = s.r[i + 1]; if (!(a > 0)) return; const y = 220 + i * 120; g.save(); g.globalAlpha = a; g.fillStyle = i === 2 ? '#1C2E4A' : '#16203A'; rr(g, 30 + i * 22, y - 46, SW - 60 - i * 22, 92, 22); g.fill();
      g.fillStyle = '#F4F7FB'; g.font = `800 40px ${HI}`; g.fillText((i ? '› ' : '') + txt, 56 + i * 22, y + 2); g.restore(); });
    if (s.r[3] > 0) {
      const y = 640; g.save(); g.globalAlpha = s.r[3]; g.fillStyle = '#16203A'; rr(g, 30, y - 70, SW - 60, 140, 26); g.fill();
      g.fillStyle = '#F4F7FB'; g.font = `800 34px ${HI}`; g.fillText('Theft Detection Lock', 56, y - 14); g.fillStyle = 'rgba(244,247,251,0.75)'; g.font = `700 28px ${HI}`; g.fillText('Locks the screen if taken', 56, y + 32);
      const on = s.tg, tx = 410, ty = y + 4; g.fillStyle = on > 0.5 ? P.mint : '#3A4560'; rr(g, tx, ty - 28, 96, 56, 28); g.fill(); g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(lerp(tx + 28, tx + 68, on), ty, 22, 0, 7); g.fill();
      if (s.tap) { g.fillStyle = 'rgba(244,247,251,0.5)'; g.beginPath(); g.arc(tx + 48, ty, 34, 0, 7); g.fill(); }
      g.restore();
    }
  }
  g.textAlign = 'left'; tag(g, SW - 30, 30, 'EXAMPLE', NAVY, AMBER, 22);
  screenMesh.material.map.needsUpdate = true;
}
// ---- the cards: B = AI + motion sensors · C = grab, then run / bike / drive · E = steady Wi-Fi / Bluetooth (label lane y 500–600)
let cardKey = '';
const trace = (u, kind) => { const r = Math.sin(u * 91.7) * 0.5 + Math.sin(u * 37.3) * 0.5;
  if (kind === 'grab') return u < 0.55 ? 0.06 * r : 0.95 * Math.exp(-((u - 0.62) ** 2) / 0.0012) + (u > 0.66 ? 0.18 * Math.sin(u * 60) : 0) + 0.04 * r;
  if (kind === 'run') return 0.55 * Math.abs(Math.sin(u * 28)) - 0.2 + 0.05 * r;
  if (kind === 'bike') return 0.35 * Math.sin(u * 14) + 0.06 * r;
  return 0.08 * Math.sin(u * 140) + 0.12 * Math.sin(u * 6) + 0.03 * r; };
function plot(g, x, y, w, h, kind, k, col) { if (!(k > 0)) return; g.save(); g.strokeStyle = col; g.lineWidth = 4; g.lineJoin = 'round'; g.beginPath(); const n = Math.max(2, Math.round(160 * k)); for (let i = 0; i <= n; i++) { const u = i / 160, yy = y + h / 2 - trace(u, kind) * h * 0.45; i ? g.lineTo(x + u * w, yy) : g.moveTo(x + u * w, yy); } g.stroke(); g.restore(); }
function cardState(t) {
  if (t < Hh.cut2) return { m: 'b', ai: q20(inv(Hh.ai, Hh.ai + 0.3, t)), mo: q20(inv(Hh.motion, Hh.motion + 0.3, t)), w: t >= Hh.motion ? Math.round(Math.sin(t * 14) * 4) / 4 : 0 };
  if (t < Hh.cut4) return { m: 'c', g: q20(inv(Hh.trace[0], Hh.spike + 0.45, t)), sp: q20(inv(Hh.spike, Hh.spike + 0.25, t)), r: Hh.runs.map((x) => q20(inv(x, x + 0.5, t))) };
  return { m: 'e', wi: q20(inv(Hh.wifi, Hh.wifi + 0.3, t)), bt: q20(inv(Hh.bt, Hh.bt + 0.3, t)), nl: q20(inv(Hh.nolock, Hh.nolock + 0.3, t)) };
}
function drawCard(g, s) {
  bg(g, NW, NH, '#0E1424'); g.textBaseline = 'middle';
  if (s.m === 'b') {
    g.strokeStyle = '#F4F7FB'; g.lineWidth = 8; rr(g, 200, 90, 200, 360, 34); g.stroke();
    wifiIcon(g, 100, 250, 60, 'rgba(154,166,191,0.35)'); btIcon(g, 500, 270, 60, 'rgba(154,166,191,0.35)');
    axesIcon(g, 290, 300, 70, s.mo > 0 ? P.mint : 'rgba(154,166,191,0.4)', s.w);
    if (s.ai > 0) centreChip(g, 300, 150, 'AI', s.ai, P.mint, 40);
    return;
  }
  if (s.m === 'c') {
    g.fillStyle = '#16203A'; rr(g, 40, 50, 520, 170, 18); g.fill();
    plot(g, 60, 60, 480, 150, 'grab', s.g, '#F4F7FB');
    if (s.sp > 0) chip(g, 300, 54, 'GRAB', s.sp, RED2, 24, '#FFFFFF');
    [['RUN', 'run'], ['BIKE', 'bike'], ['DRIVE', 'drive']].forEach(([lab, kind], i) => { const y = 250 + i * 82, a = s.r[i]; if (!(a > 0)) return; g.save(); g.globalAlpha = Math.min(1, a * 2); chip(g, 40, y + 30, lab, 1, AMBER, 22); g.fillStyle = '#16203A'; rr(g, 170, y, 390, 62, 14); g.fill(); plot(g, 180, y + 2, 370, 58, kind, a, AMBER); g.restore(); });
    return;
  }
  g.strokeStyle = '#F4F7FB'; g.lineWidth = 7; rr(g, 245, 120, 110, 200, 22); g.stroke();
  g.lineWidth = 6; g.strokeStyle = P.mint;
  if (s.wi > 0) { g.save(); g.globalAlpha = s.wi; g.beginPath(); g.moveTo(150, 220); g.lineTo(150 + 90 * s.wi, 220); g.stroke(); g.restore(); }
  if (s.bt > 0) { g.save(); g.globalAlpha = s.bt; g.beginPath(); g.moveTo(450, 220); g.lineTo(450 - 90 * s.bt, 220); g.stroke(); g.restore(); }
  wifiIcon(g, 100, 205, 64, s.wi > 0 ? P.mint : 'rgba(154,166,191,0.5)'); btIcon(g, 500, 220, 64, s.bt > 0 ? P.mint : 'rgba(154,166,191,0.5)');
  g.save(); g.globalAlpha = 0.4 + 0.6 * s.nl; lockIcon(g, 300, 400, 90, GREY); g.restore();
  if (s.nl > 0) { g.save(); g.globalAlpha = s.nl; g.strokeStyle = AMBER; g.lineWidth = 8; g.beginPath(); g.arc(300, 405, 78, 0, 7); g.stroke(); g.fillStyle = AMBER; g.font = `800 52px ${HI}`; g.textAlign = 'center'; g.fillText('?', 372, 342); g.restore(); }
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawCard(g, s); cardMesh.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ choreography
const HOME2 = { x: -0.02, z: 0.42, rotY: 0 };
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const OFF = { x: -3.2, z: 0.4, rotY: 0 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...HOME2, headPitch: 14 } },                                                       // holding the phone
  { t: Hh.grab, p: {} },
  { t: Hh.grab + 0.35, e: 'outBack', p: { aFwd: 70, aOut: 6, aBend: 30, bFwd: 80, bOut: 6, bBend: 25, headPitch: 0, headYaw: 30, lean: 6 } },   // reaching after it
  { t: 2.6, p: { headYaw: 40 } },
  { t: Hh.cut1 - 0.01, p: {} },
  { t: Hh.cut1, p: { ...OFF, ...REST_ARMS, headYaw: 0, lean: 0 } },                                // (cut) off for cards + chase
  { t: Hh.cut5 - 0.01, p: {} },
  { t: Hh.cut5, p: { ...HOME2, headPitch: 14 } },                                                  // (cut) checking the setting
  { t: Hh.toggle - 0.05, p: {} },
  { t: Hh.toggle + 0.3, e: 'outBack', p: { headPitch: 9, headRoll: 5 } },
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headPitch: -2, headRoll: 0 } },                         // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const heldBy = (t) => (t < Hh.grab ? 'docket' : t < Hh.cut1 ? 'thief' : t < Hh.cut3 ? 'none' : t < Hh.cut4 ? 'run' : t < Hh.cut5 ? 'none' : t < Hh.cta ? 'docket' : 'none');
const EXPR = [[-9, 'happy'], [Hh.grab, 'wow'], [Hh.cut5, 'determined'], [Hh.toggle + 0.2, 'happy'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [22.6, 25.8, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.grab, 18) + kick(t, Hh.toggle, 10) + 6 * Math.sin(t * 3.1);
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
// the stolen phone's path (hook): yanked to the right, races off (the camera follows), leaves frame
const HELD = V(-0.02, 0.88, 0.78), P1 = V(0.42, 0.98, 0.98), P2 = V(0.95, 0.98, 1.05), P3 = V(2.4, 1.0, 0.95);
function snatchAt(t) {
  if (t < Hh.yank[1]) { const k = E.outCubic(inv(Hh.yank[0], Hh.yank[1], t)); return { p: HELD.clone().lerp(P1, k), roll: -0.25 * k }; }
  if (t < Hh.exit[0]) { const k = inv(Hh.yank[1], Hh.exit[0], t); return { p: P1.clone().lerp(P2, k).add(V(0, 0.025 * Math.sin(t * 15), 0)), roll: -0.25 + 0.08 * Math.sin(t * 15) }; }
  const k = E.inQuad(inv(Hh.exit[0], Hh.exit[1], t)); return { p: P2.clone().lerp(P3, k).add(V(0, 0.025 * Math.sin(t * 15), 0)), roll: -0.25 - 0.3 * k };
}
const RUN_X0 = 1.2, RUN_V = 0.75;                                       // the chase close-up (D)
function runAt(t) { const x = RUN_X0 + RUN_V * (t - Hh.cut3); return { p: V(x, 0.98 + 0.03 * Math.sin(t * 15), 1.0), roll: -0.18 + 0.08 * Math.sin(t * 15 + 1) }; }
function labelAt(t) {
  if (t >= Hh.ai && t < Hh.cut2) return ['AI + MOTION SENSORS', P.mint, NAVY];
  if (t >= Hh.spike && t < Hh.cut3) return ['THEFT MOTION', RED2, '#FFFFFF'];
  if (t >= Hh.lock2 + 0.1 && t < Hh.cut4) return ['LOCKED', P.mint, NAVY];
  if (t >= 16.25 && t < 17.75) return ['FEWER FALSE ALARMS', AMBER, NAVY];
  if (t >= 17.75 && t < Hh.cut5) return ['MAY NOT TRIGGER', AMBER, NAVY];
  if (t >= Hh.cut5 + 0.1 && t < Hh.cta) return ['CHECK IT’S ON', P.mint, NAVY];
  return null;
}
const shotAt = (t) => (t < Hh.cut1 ? 'hook' : t < Hh.cut3 ? 'card' : t < Hh.cut4 ? 'run' : t < Hh.cut5 ? 'card' : t < Hh.cta ? 'phone' : 'cta');

function stageAt(t) {
  const p = docketAt(t);
  const holder = heldBy(t), shot = shotAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  phone.visible = holder !== 'none';
  let armOn = false;
  if (holder === 'docket') { const s = spot(p, V(0.0, 0.88, 0.36), -0.04); phone.position.copy(s.p); phone.quaternion.copy(s.q); armOn = true; }
  else if (holder === 'thief' || holder === 'run') { const s = holder === 'thief' ? snatchAt(t) : runAt(t); phone.position.copy(s.p); phone.quaternion.copy(Q(-0.05, -0.1, s.roll)); }
  scene.updateMatrixWorld(true);
  solveArm(0, p, armOn ? onPhone(-0.19, -0.06, 0) : null, armOn ? 1 : 0); solveArm(1, p, armOn ? onPhone(0.19, -0.06, 0) : null, armOn ? 1 : 0);
  scene.updateMatrixWorld(true);
  // the glove: reaching in before the grab, then gripping the phone's right edge; the sleeve trails off to the right
  const gl = holder === 'thief' || holder === 'run' || (shot === 'hook' && t < Hh.grab);
  glove.visible = sleeve.visible = gl;
  if (gl) {
    let gp;
    if (t < Hh.grab) { const k = E.inOutSine(inv(-0.15, Hh.grab, t)); gp = V(0.56, 0.8, 1.02).lerp(onPhone(0.17, -0.12, 0.03), k); }
    else gp = onPhone(0.17, -0.12, 0.03);
    glove.position.copy(gp); glove.quaternion.copy(phone.quaternion);
    const dir = V(0.9, -0.25, 0.35).normalize(); sleeve.position.copy(gp.clone().addScaledVector(dir, 0.47)); sleeve.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
  }
  // speed streaks behind the running phone
  const run = holder === 'thief' && t > Hh.yank[0] + 0.2 || holder === 'run';
  streaks.forEach((m, k) => { m.visible = run; if (run) { m.position.copy(phone.position).add(V(-0.32 - 0.06 * k, -0.15 + 0.1 * k, -0.02)); m.quaternion.copy(cam.quaternion); m.material.opacity = 0.35 + 0.15 * Math.sin(t * 20 + k); } });
  street.visible = shot === 'hook' || shot === 'run'; board.visible = shot === 'card' || shot === 'cta';
  if (shot === 'card') updateCard(t); if (phone.visible) drawScreen(t);
  labelH.visible = false;
  if (shot === 'hook') { paintLabel(labelH, 'hook', (g, W2, H2) => { g.fillStyle = AMBER; g.beginPath(); g.roundRect(8, 8, W2 - 16, H2 - 16, 60); g.fill(); g.fillStyle = NAVY; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 120px ${HI}`; g.fillText('IT LOCKS', W2 / 2, H2 * 0.32); g.fillText('ITSELF?', W2 / 2, H2 * 0.71); });
    const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion); billboard(labelH, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.1), 0.26); }
  const lb = labelAt(t);
  if (lb) { const [txt, bgc, fg] = lb; paintLabel(labelL, txt + bgc, (g, W2, H2) => pill(g, W2, H2, txt, bgc, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.095), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: 0 });
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const CLOSE = [[0.01, 0.9, 2.3], [0.01, 0.875, 0.78]];
function cameraAt(t) {
  if (t < Hh.cut1) {                                                      // hook: frames DOCKET, then pans right with the thief
    const k = E.inOutCubic(inv(Hh.yank[0], Hh.exit[0], t)), x = lerp(0.22, 0.85, k);
    cam.position.set(x + 0.003 * Math.sin(t * 0.9), 1.05, 2.95 - 0.35 * k); cam.lookAt(x + 0.02, 0.92, 0.7); return;
  }
  if (t >= Hh.cut3 && t < Hh.cut4) {                                      // the chase close-up: tracking alongside the phone
    const r = runAt(t).p; cam.position.set(r.x - 0.12, 1.03, 2.55); cam.lookAt(r.x + 0.04, 0.98, 0.9); return;
  }
  const CAM = [
    [Hh.cut1, ...LAB], [Hh.cut2 - 0.01, [-0.125, 1.13, 1.12], [-0.64, 1.13, -0.32]],
    [Hh.cut2, [-0.085, 1.13, 1.27], [-0.64, 1.13, -0.32]], [Hh.cut3 - 0.01, [-0.11, 1.13, 1.16], [-0.64, 1.13, -0.32]],
    [Hh.cut3, ...LAB], [Hh.cut4, ...LAB],
    [Hh.cut4, ...LAB], [Hh.cut5 - 0.01, [-0.125, 1.13, 1.12], [-0.64, 1.13, -0.32]],
    [Hh.cut5, ...CLOSE], [Hh.cta - 0.01, [0.01, 0.9, 2.2], [0.01, 0.875, 0.78]],
    [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
  ];
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  cam.position.set(pos[0] + 0.003 * Math.sin(t * 0.9), pos[1] + 0.003 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: the snatch + "IT LOCKS / ITSELF?"
window.renderThumb = () => {
  const t = 0.0; cameraAt(t); stageAt(t); labelL.visible = false; labelH.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 760);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['IT LOCKS', '#F4F7FB', 300], ['ITSELF?', AMBER, 460]].forEach(([w, col, y]) => { let S = 170; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
  const v = c.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.48, H * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  return true;
};

// ------------------------------------------------------------------ overlay: captions in the upper band (pill y 282–458)
let ICON = null;
const CAP_TOP = 282, CAP_MAXW = 800, CX = 500;   // 2026-11-19 brief: caption band y ≈ 280..460, x 100..900
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
