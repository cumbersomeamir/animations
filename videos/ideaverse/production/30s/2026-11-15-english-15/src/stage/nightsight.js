// nightsight.js — Ideaverse production 30s english-15 #01 (English): how a phone photographs a room almost too dark to see
// (Night Sight: a burst of frames, lined up and averaged, then a neural network cleans up; moving things blur).
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine);
// overlay tail from english-12 (caption safe area x 100..900). New: dim-room lighting, café table + candle, generic phone,
// phone "photos" rendered from the phone's position, simulated grain + exact averaging, burst cards. Pure function of t.
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

// ------------------------------------------------------------------ photo maths (2D, deterministic): phone captures, grain, averaging
// The "photos" are real renders of this scene from the phone's position with the room lights up (what a long, clean
// exposure would record). The grain is simulated (seeded Gaussian, 2x2 grains); averages are computed exactly.
const PW = 540, PHT = 960, NF = 8, NW_ = 10;                 // photo resolution (9:16) · frames in the illustrative burst · wave poses
function mulberry(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const toArr = (c) => { const d = c.getContext('2d').getImageData(0, 0, PW, PHT).data, a = new Float32Array(PW * PHT * 3); for (let i = 0, j = 0; i < d.length; i += 4, j += 3) { a[j] = d[i] / 255; a[j + 1] = d[i + 1] / 255; a[j + 2] = d[i + 2] / 255; } return a; };
function toCanvas(a, { k = 1, add = null, ka = 1, border = false, scale = 1 } = {}) {
  const c = canvas(PW, PHT), g = c.getContext('2d'), im = g.createImageData(PW, PHT), d = im.data;
  for (let i = 0, j = 0; i < d.length; i += 4, j += 3) { for (let ch = 0; ch < 3; ch++) d[i + ch] = (a[j + ch] * k + (add ? add[j + ch] * ka : 0)) * 255; d[i + 3] = 255; }
  g.putImageData(im, 0, 0);
  if (border) { g.strokeStyle = 'rgba(244,247,251,0.92)'; g.lineWidth = 10; g.strokeRect(5, 5, PW - 10, PHT - 10); }
  if (scale === 1) return c;
  const s = canvas(Math.round(PW * scale), Math.round(PHT * scale)); s.getContext('2d').drawImage(c, 0, 0, s.width, s.height); return s;
}
function grain(seed) {                                         // coarse colour grain, sigma ~0.18 (what a brightened short exposure shows)
  const r = mulberry(seed), a = new Float32Array(PW * PHT * 3), gw = PW / 2, gh = PHT / 2;
  const gs = () => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185 * r()); };
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const l = gs() * 0.17, cr = gs() * 0.07, cb = gs() * 0.07, v0 = l + cr, v1 = l - 0.5 * cr - 0.3 * cb, v2 = l + cb;
    for (let q = 0; q < 4; q++) { const j = ((y * 2 + (q >> 1)) * PW + x * 2 + (q & 1)) * 3; a[j] = v0; a[j + 1] = v1; a[j + 2] = v2; }
  }
  return a;
}
const IMG = { frame: [], avg: [], waveView: [] };

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, cards = [], merged, sweepCanvas, sweepTex, stool, table, flame, flameGlow, candleLight, labelL;
const LIGHTS = [];
const BOARD_POS = V(-0.95, 0, -0.75), BOARD_YAW = 0.42;
const TABLE = V(0, 0, 0.1), SPOT = { x: 0.0, z: -0.26, rotY: 0 };
const PH_W = 0.24, PH_H = 0.4267, SC_W = 0.222, SC_H = 0.3947, PH_D = 0.024;
const PHONE_HAND = V(0.0, 0.9, 1.55), PHONE_REST = V(0.0, 0.888, 1.55), SUBJ = V(0.06, 0.7, -0.18);
const SLOT = (i) => PHONE_HAND.clone().add(V(0, 0, 0.14 + i * 0.075));    // burst frames fly toward the viewer, one slot per frame
const CW = 0.27, CH = 0.48;
const SHAKE = Array.from({ length: NF }, (_, i) => { const r = mulberry(400 + i); return [(r() - 0.5) * 0.07, (r() - 0.5) * 0.05, (r() - 0.5) * 0.1]; });   // hand-shake offsets
const MERGE = [7, 6, 5, 4, 3, 2, 1, 0];                       // merge order (front card first)
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: crescent-moon icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 16; mg.fillStyle = P.mint; mg.beginPath(); mg.arc(256, 150, 80, 0, 7); mg.fill();
    mg.shadowBlur = 0; mg.fillStyle = '#0E1424'; mg.beginPath(); mg.arc(292, 124, 74, 0, 7); mg.fill();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  scene.traverse((o) => { if (o.isLight) LIGHTS.push([o, o.intensity]); });
  docket = createDocket(THREE); scene.add(docket.root);
  // easel (newsroom furniture; idle card, no text)
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(600, 800); { const g = cardCanvas.getContext('2d'); g.fillStyle = '#0E1424'; g.fillRect(0, 0, 600, 800); g.strokeStyle = 'rgba(108,218,126,0.5)'; g.lineWidth = 10; g.beginPath(); g.arc(300, 380, 150, 0, 7); g.stroke(); g.fillStyle = 'rgba(108,218,126,0.5)'; g.beginPath(); g.arc(300, 380, 30, 0, 7); g.fill(); }
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // café table with a candle, a mug and a small plant (the photo's subject: DOCKET at a candle-lit table)
  table = new THREE.Group(); table.position.copy(TABLE); scene.add(table);
  const top = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.035, 48), M('#B07A4A', { roughness: 0.55 }))); top.position.y = 0.58; table.add(top);
  const stem = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.56, 16), mats.steel)); stem.position.y = 0.29; table.add(stem);
  const foot = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.02, 32), mats.steel)); foot.position.y = 0.01; table.add(foot);
  const wax = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.11, 24), M('#F4E9D2', { roughness: 0.8 }))); wax.position.set(0.13, 0.652, 0.1); table.add(wax);
  flame = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 12), new THREE.MeshBasicMaterial({ color: '#FFE2A0', toneMapped: false })); flame.scale.set(1, 1.9, 1); flame.position.set(0.13, 0.735, 0.1); table.add(flame);
  { const gc = canvas(128, 128), gg = gc.getContext('2d'), gr = gg.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,200,120,0.9)'); gr.addColorStop(0.35, 'rgba(255,160,70,0.35)'); gr.addColorStop(1, 'rgba(255,140,60,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
    flameGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), new THREE.MeshBasicMaterial({ map: cvTex(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); scene.add(flameGlow); }
  candleLight = new THREE.PointLight('#FFB061', 1.0, 2.6, 2); candleLight.position.set(TABLE.x + 0.13, 0.8, TABLE.z + 0.12); candleLight.castShadow = false; scene.add(candleLight);
  const mug = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.085, 24), M(P.mint, { roughness: 0.4 }))); mug.position.set(-0.15, 0.64, 0.08); table.add(mug);
  const hdl = sh(new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.007, 8, 20), M(P.mint, { roughness: 0.4 }))); hdl.position.set(-0.195, 0.64, 0.08); table.add(hdl);
  const pot = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.06, 20), M(AMBER, { roughness: 0.6 }))); pot.position.set(-0.03, 0.628, -0.05); table.add(pot);
  for (const [x, y, z, s] of [[-0.03, 0.69, -0.05, 0.035], [-0.06, 0.675, -0.04, 0.026], [0.0, 0.68, -0.06, 0.028]]) { const lf = sh(new THREE.Mesh(new THREE.SphereGeometry(s, 16, 12), M('#3E9E5A', { roughness: 0.7 }))); lf.position.set(x, y, z); table.add(lf); }
  // stool + books (the brace), shown from the payoff on
  stool = new THREE.Group(); stool.position.set(PHONE_REST.x, 0, PHONE_REST.z); scene.add(stool);
  const seat = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.035, 32), mats.navy)); seat.position.y = 0.51; stool.add(seat);
  for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5, lg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.5, 10), mats.steel)); lg.position.set(Math.cos(a) * 0.12, 0.25, Math.sin(a) * 0.12); stool.add(lg); }
  [['#2F64D6', 0.3, 0.0], [AMBER, 0.27, 0.06], ['#E9EFF2', 0.29, -0.04]].forEach(([c, w, r], i) => { const b = rbox(w, 0.04, 0.2, 0.006, M(c, { roughness: 0.7 })); b.position.y = 0.548 + i * 0.04; b.rotation.y = r; stool.add(b); });
  stool.visible = false;
  // the phone (generic; illustrative camera screen, not any real app's UI). Screen faces +z, lens faces the table.
  phone = new THREE.Group(); scene.add(phone);
  phone.add(rbox(PH_W, PH_H, PH_D, 0.03, mats.navy));
  const bezel = rbox(PH_W - 0.01, PH_H - 0.01, 0.004, 0.026, M('#070A12', { roughness: 0.3 })); bezel.position.z = PH_D / 2 + 0.0005; phone.add(bezel);
  screenCanvas = canvas(PW, PHT);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = PH_D / 2 + 0.003; phone.add(screenMesh);
  const glow = new THREE.PointLight('#CFE0FF', 0.5, 0.7, 2); glow.position.set(0, -0.12, 0.08); phone.add(glow);   // the screen's own glow (lights the books when braced)
  const lens = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 24), M('#05070C', { roughness: 0.1, metalness: 0.6 }))); lens.rotation.x = Math.PI / 2; lens.position.set(-0.07, 0.16, -PH_D / 2 - 0.004); phone.add(lens);
  // burst frames (cards) + the merged card
  for (let i = 0; i < NF; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, toneMapped: false, side: THREE.DoubleSide, depthWrite: false })); m.renderOrder = 2 + i; m.visible = false; scene.add(m); cards.push(m); }
  merged = new THREE.Mesh(new THREE.PlaneGeometry(CW, CH), new THREE.MeshBasicMaterial({ toneMapped: false, side: THREE.DoubleSide })); merged.visible = false; merged.renderOrder = 12; scene.add(merged);
  sweepCanvas = canvas(PW, PHT); sweepTex = cvTex(sweepCanvas);
  labelL = makeLabel(0.5, 0.13);
}
function setLook(b) {                                           // b = 1: room lit (what the long exposure records), 0: the dim room
  for (const [l, base] of LIGHTS) l.intensity = base * lerp(0.018, 1, b);
  scene.environmentIntensity = 0.55 * lerp(0.025, 1, b);
  candleLight.intensity = lerp(0.42, 2.0, b);
  const c = lerp(0.22, 1, b); cardMesh.material.color.setRGB(c, c, c);
}
const capCam = new THREE.PerspectiveCamera(60, W / H, 0.05, 40);
function capture(at) {                                          // the long-exposure look: shadows lifted, brighter than the room
  capCam.position.copy(at); capCam.lookAt(SUBJ); scene.updateMatrixWorld(true);
  for (const [l, base] of LIGHTS) if (l.isHemisphereLight || l.isPointLight) l.intensity = base * 2.6;
  scene.environmentIntensity = 0.55 * 2.4; renderer.toneMappingExposure = 2.0; renderer.render(scene, capCam); renderer.toneMappingExposure = 1.05; setLook(1); const c = canvas(PW, PHT); c.getContext('2d').drawImage(glCanvas, 0, 0, PW, PHT); return c; }

// ------------------------------------------------------------------ choreography (DOCKET is the photo's subject)
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const ARMS_TABLE = { aFwd: 34, aOut: 12, aBend: 62, bFwd: 34, bOut: 12, bBend: 62 };
const WAVE_UP = { bFwd: 160, bOut: -18, bBend: 22, headRoll: 6 };
const FREEZE = { ...WAVE_UP, headRoll: 3, headPitch: -2 };                 // freeze = stop mid-wave
const WAVE_ON = Hh.cut4 + 0.1, FREEZE_T = Hh.freeze;
const DK = poseKeys([
  { t: -1, p: { ...SPOT, ...ARMS_TABLE, headPitch: 3 } },
  { t: Hh.cut4 - 0.01, p: {} },
  { t: Hh.cut4 + 0.35, e: 'outBack', p: { ...WAVE_UP } },                                          // starts waving
  { t: FREEZE_T - 0.22, p: {} },
  { t: FREEZE_T, p: { ...FREEZE } },                                                 // freezes ("freeze")
  { t: Hh.sharp + 0.6, p: {} },
  { t: Hh.sharp + 1.2, p: { ...ARMS_TABLE, headRoll: 4, headPitch: 3 } },
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headPitch: -2, headRoll: 0 } },                       // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const waving = (t) => t >= WAVE_ON && t < FREEZE_T;
const wavePhase = (t) => (t - WAVE_ON) * 1.7;                    // cycles
function waveAdd(p, ph, k = 1) { p.bOut += k * 24 * Math.sin(ph * Math.PI * 2); p.bBend += k * 18 * Math.sin(ph * Math.PI * 2 + 0.5); }
const frozen = (t) => t >= FREEZE_T && t < Hh.sharp + 0.6;
const EXPR = [[-9, 'happy'], [Hh.cut4, 'happy'], [FREEZE_T, 'proud'], [Hh.sharp + 0.6, 'happy'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [2.4, 6.6, 11.8, 16.0, 19.6, 22.2, 25.9, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  if (!frozen(t)) { p.lean += 1.2 * Math.sin(t * 2.2); p.headRoll += 1.5 * Math.sin(t * 1.3); }
  if (waving(t)) waveAdd(p, wavePhase(t), clamp(inv(Hh.cut4, Hh.cut4 + 0.35, t)) * (1 - E.outCubic(inv(FREEZE_T - 0.22, FREEZE_T, t))));
  p.antenna = frozen(t) ? 0 : kick(t, Hh.cut4 + 0.35, 12) + kick(t, Hh.sharp + 0.6, 10) + 6 * Math.sin(t * 3.1);
  if (t > 27.9) { p.headPitch += 3 * Math.sin((t - 27.9) * 5) * Math.exp(-(t - 27.9) * 1.2); p.bFwd += 7 * Math.sin((t - 27.9) * 6.2) * Math.exp(-(t - 27.9) * 0.8); }
  return p;
}
function exprAt(t) { let e = 'neutral'; for (const [t0, x] of EXPR) if (t >= t0) e = x; return e; }
function talkAt(t) { if (!VOICE || frozen(t)) return 0; return VOICE[Math.round(t * FPS)] || 0; }
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

// ------------------------------------------------------------------ images (built once, deterministic)
function makeImages() {
  const hide = [phone, merged, labelL, stool, flameGlow, ...cards]; hide.forEach((o) => { o.visible = false; });
  setLook(1); flame.scale.set(1, 1.9, 1);
  const shoot = (p, expr, at) => { docket.pose(p); docket.face(expr, { talk: 0, blink: 0, t: 0, look: 0 }); return capture(at); };
  const hook = shoot(poseAt(DK, 1.0), 'happy', PHONE_HAND);
  IMG.hook = hook; const H0 = toArr(hook);
  const S = new Float32Array(H0.length);
  MERGE.forEach((ci, k) => {                                   // frame ci = clean photo + its own grain; running average after k+1 frames
    const n = grain(1000 + ci);
    for (let j = 0; j < S.length; j++) S[j] += n[j];
    IMG.frame[ci] = toCanvas(H0, { add: n, border: true });
    IMG.avg[k] = toCanvas(H0, { add: S, ka: 1 / (k + 1), border: true });
  });
  IMG.clean = toCanvas(H0, { border: true });
  const nv = grain(77);
  IMG.hookView = toCanvas(H0, { k: 0.55, add: nv, ka: 0.6, scale: 0.5 });
  const Wsum = new Float32Array(H0.length);
  for (let k = 0; k < NW_; k++) {                               // DOCKET's waving arm at 10 phases: viewfinder frames + their average
    const p = poseAt(DK, Hh.cut4 + 1.0); waveAdd(p, k / NW_);
    const A = toArr(shoot(p, 'happy', PHONE_HAND)); for (let j = 0; j < A.length; j++) Wsum[j] += A[j] / NW_;
    IMG.waveView[k] = toCanvas(A, { k: 0.55, add: nv, ka: 0.6, scale: 0.5 });
  }
  IMG.blur = toCanvas(Wsum);
  const F = toArr(shoot(poseAt(DK, FREEZE_T + 0.4), 'proud', PHONE_REST));
  IMG.freezeView = toCanvas(F, { k: 0.55, add: nv, ka: 0.6, scale: 0.5 }); IMG.sharp = toCanvas(F);
  IMG.tex = { frame: IMG.frame.map(cvTex), avg: IMG.avg.map(cvTex), clean: cvTex(IMG.clean) };
}

// ------------------------------------------------------------------ phone screen (illustrative camera UI: moon chip, shutter + capture ring)
let screenKey = '';
function screenState(t) {
  let img = 'hook', ring = -1, done = false, ok = false;
  if (t >= Hh.cut1 && t < Hh.cut4) { img = t < Hh.shutter ? 'hookView' : 'hookView'; ring = t >= Hh.shutter ? q20(inv(Hh.burst[0], Hh.burst[1], t)) : -1; }
  if (t >= Hh.cut4 && t < Hh.cut5) { img = t >= Hh.ring2[1] ? 'blur' : 'wave'; ring = t >= Hh.ring2[0] && t < Hh.ring2[1] ? q20(inv(Hh.ring2[0], Hh.ring2[1], t)) : -1; done = t >= Hh.ring2[1]; }
  if (t >= Hh.cut5) { img = t >= Hh.ring3[1] ? 'sharp' : t >= FREEZE_T ? 'freezeView' : 'wave'; ring = t >= Hh.ring3[0] && t < Hh.ring3[1] ? q20(inv(Hh.ring3[0], Hh.ring3[1], t)) : -1; done = t >= Hh.ring3[1]; ok = t >= Hh.sharp; }
  const wk = img === 'wave' ? Math.floor(((wavePhase(t) % 1) + 1) % 1 * NW_) % NW_ : 0;
  const flash = t >= Hh.shutter && t < Hh.shutter + 0.14 ? 1 : 0;
  return { img, wk, ring, done, ok, flash };
}
function drawScreen(t) {
  const s = screenState(t), key = JSON.stringify(s); if (key === screenKey) return; screenKey = key;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  const src = s.img === 'wave' ? IMG.waveView[s.wk] : IMG[s.img];
  g.drawImage(src, 0, 0, PW, PHT);
  // top: crescent-moon chip (night mode on) + EXAMPLE tag
  g.fillStyle = 'rgba(8,11,22,0.6)'; rr(g, 22, 22, 74, 74, 37); g.fill();
  g.fillStyle = AMBER; g.beginPath(); g.arc(59, 59, 22, 0, 7); g.fill(); g.fillStyle = '#121a2c'; g.beginPath(); g.arc(70, 51, 20, 0, 7); g.fill();
  tag(g, PW - 22, 26, 'EXAMPLE', NAVY, AMBER, 22);
  if (!s.done && s.img !== 'hook') {                             // shutter + capture ring (illustrative ticks)
    const cx = PW / 2, cy = PHT - 100;
    g.fillStyle = 'rgba(8,11,22,0.45)'; g.beginPath(); g.arc(cx, cy, 70, 0, 7); g.fill();
    g.fillStyle = s.ring >= 0 ? 'rgba(244,247,251,0.55)' : '#F4F7FB'; g.beginPath(); g.arc(cx, cy, 44, 0, 7); g.fill();
    if (s.ring >= 0) { const n = 15; g.lineCap = 'round'; g.lineWidth = 7; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI * 2, on = i < Math.round(s.ring * n); g.strokeStyle = on ? AMBER : 'rgba(244,247,251,0.35)'; g.beginPath(); g.moveTo(cx + Math.cos(a) * 54, cy + Math.sin(a) * 54); g.lineTo(cx + Math.cos(a) * 64, cy + Math.sin(a) * 64); g.stroke(); } }
  }
  if (s.ok) { g.fillStyle = P.mint; g.beginPath(); g.arc(PW - 70, PHT - 90, 44, 0, 7); g.fill(); check(g, PW - 92, PHT - 112, 44, NAVY, 10); }
  if (s.flash) { g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(0, 0, PW, PHT); }
  screenMesh.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ burst frames + merged card (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
function cardsAt(t) {
  const out = [];
  for (let i = 0; i < NF; i++) {
    const s = { vis: false, pos: SLOT(i), rot: V(0, 0, 0), a: 0, bright: 0, sc: 1 };
    const t0 = Hh.burst[0] + i * ((Hh.burst[1] - Hh.burst[0] - 0.3) / (NF - 1));
    if (t >= t0 && t < Hh.nn) {
      s.vis = true; const k = E.outCubic(inv(t0, t0 + 0.32, t));
      const [dx, dy, rz] = SHAKE[i], al = E.inOutCubic(inv(Hh.align[0] + i * 0.04, Hh.align[1] - (NF - 1 - i) * 0.03, t)), sh = 1 - al;
      s.pos = PHONE_HAND.clone().lerp(SLOT(i).add(V(dx * sh, dy * sh, 0)), k); s.rot.set(0, 0, rz * sh); s.sc = lerp(0.35, 1, k); s.a = clamp(k * 1.4);
      s.bright = E.outCubic(inv(Hh.grain - 0.1, Hh.grain + 0.12, t));
      // "every frame": the front frames slide aside, then return for the line-up
      const fi = NF - 1 - i; if (fi < 3) { const o = E.inOutCubic(inv(Hh.flips[fi], Hh.flips[fi] + 0.28, t)) * (1 - E.inOutCubic(inv(Hh.stack[0] + fi * 0.06, Hh.stack[1] - 0.1, t))); s.pos.add(V(-0.42 * o, 0.02 * o, 0)); s.rot.y += 0.9 * o; }
      // averaging: each frame flies into the front slot, in merge order
      const mk = MERGE.indexOf(i), tm = Hh.avg[0] + mk * ((Hh.avg[1] - Hh.avg[0] - 0.25) / (NF - 1)), m = E.inOutCubic(inv(tm, tm + 0.22, t));
      if (mk > 0) { s.pos.lerp(SLOT(NF - 1).add(V(0, 0, 0.004)), m); if (m >= 1) s.vis = false; }
      if (t >= Hh.avg[0] && mk === 0) s.vis = false;              // the front frame becomes the merged card
    }
    out.push(s);
  }
  return out;
}
function mergedK(t) { if (t < Hh.avg[0]) return 0; let k = 1; for (let mk = 1; mk < NF; mk++) { const tm = Hh.avg[0] + mk * ((Hh.avg[1] - Hh.avg[0] - 0.25) / (NF - 1)); if (t >= tm + 0.22) k = mk + 1; } return k; }
let sweepKey = '';
function updateCards(t) {
  const st = cardsAt(t);
  cards.forEach((m, i) => { const s = st[i]; m.visible = s.vis; if (!s.vis) return; m.position.copy(s.pos); m.rotation.set(s.rot.x, s.rot.y, s.rot.z); m.scale.setScalar(s.sc);
    m.material.map = IMG.tex.frame[i]; const c = lerp(0.42, 1, s.bright); m.material.color.setRGB(c, c, c); m.material.opacity = s.a; });
  const k = mergedK(t); merged.visible = k > 0 && t < Hh.cut4; if (!merged.visible) return;
  merged.position.copy(SLOT(NF - 1)).add(V(0, 0, 0.006));
  if (t < Hh.sweep[0]) { merged.material.map = IMG.tex.avg[k - 1]; merged.material.needsUpdate = true; return; }
  const sw = Math.round(inv(Hh.sweep[0], Hh.sweep[1], t) * 40) / 40, ok = t >= Hh.clean, key = sw + '|' + ok;
  merged.material.map = sweepTex; merged.material.needsUpdate = true; if (key === sweepKey) return; sweepKey = key;
  const g = sweepCanvas.getContext('2d'), x = sw * (PW + 60) - 30;
  g.drawImage(IMG.avg[NF - 1], 0, 0); g.save(); g.beginPath(); g.rect(0, 0, Math.max(0, x), PHT); g.clip(); g.drawImage(IMG.clean, 0, 0); g.restore();
  if (sw > 0 && sw < 1) { const gr = g.createLinearGradient(x - 40, 0, x + 6, 0); gr.addColorStop(0, 'rgba(108,218,126,0)'); gr.addColorStop(1, 'rgba(108,218,126,0.85)'); g.fillStyle = gr; g.fillRect(x - 40, 0, 46, PHT); g.fillStyle = P.mint; g.fillRect(x, 0, 6, PHT); }
  if (ok) { g.fillStyle = P.mint; g.beginPath(); g.arc(PW - 70, 74, 44, 0, 7); g.fill(); check(g, PW - 92, 52, 44, NAVY, 10); }
  sweepTex.needsUpdate = true;
}
function labelAt(t) {
  if (t < Hh.cut1) return ['IT WAS THIS DARK?', AMBER, NAVY];
  if (t >= Hh.burstLbl && t < Hh.cut2) return ['BURST', P.mint, NAVY];
  if (t >= Hh.grain && t < Hh.align[0]) return ['GRAIN', AMBER, NAVY];
  if (t >= Hh.align[0] && t < Hh.avg[0]) return ['LINE UP', P.mint, NAVY];
  if (t >= Hh.avg[0] && t < 12.62) return ['AVERAGE', P.mint, NAVY];
  if (t >= Hh.nn && t < Hh.cut4) return ['NEURAL NETWORK', P.mint, NAVY];
  if (t >= Hh.blur && t < Hh.cut5) return ['MOVING = BLUR', AMBER, NAVY];
  if (t >= Hh.braceLbl && t < FREEZE_T) return ['BRACE IT', P.mint, NAVY];
  if (t >= FREEZE_T && t < Hh.sharp) return ['FREEZE', P.mint, NAVY];
  if (t >= Hh.sharp && t < Hh.cta) return ['SHARP', P.mint, NAVY];
  return null;
}
const LBL_Y = -0.1;
function phoneAt(t) {                                            // handheld sway; set down on the books for the payoff
  const sway = V(0.005 * Math.sin(t * 1.7) + 0.003 * Math.sin(t * 4.3), 0.004 * Math.sin(t * 2.3 + 1) + 0.002 * Math.sin(t * 5.1), 0);
  if (t < Hh.cut5) return { p: PHONE_HAND.clone().add(sway), r: V(0.03 * Math.sin(t * 1.1), 0.02 * Math.sin(t * 0.8), 0.015 * Math.sin(t * 1.4)) };
  const k = E.inOutCubic(inv(Hh.brace[0], Hh.brace[1], t)), bounce = kick(t, Hh.brace[1], 0.004, 0.08, 30), held = PHONE_REST.clone().add(V(0, 0.1, 0.05));
  return { p: held.add(sway.multiplyScalar(1 - k)).lerp(PHONE_REST, k).add(V(0, bounce, 0)), r: V(0.03 * Math.sin(t * 1.1) * (1 - k), 0, 0) };
}

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  setLook(t >= Hh.cta ? 1 : 0);
  const fl = 1 + 0.08 * Math.sin(t * 23) + 0.05 * Math.sin(t * 37 + 1); flame.scale.set(1, 1.9 * fl, 1);
  const fw = table.localToWorld(flame.position.clone()); flameGlow.position.copy(fw); flameGlow.quaternion.copy(cam.quaternion); flameGlow.scale.setScalar(fl); flameGlow.visible = t < Hh.cta;
  candleLight.intensity *= fl;
  const ph = phoneAt(t); phone.position.copy(ph.p); phone.rotation.set(ph.r.x, ph.r.y, ph.r.z); phone.visible = t < Hh.cta;
  stool.visible = t >= Hh.cut5 && t < Hh.cta;
  updateCards(t); drawScreen(t);
  const lb = labelAt(t);
  if (lb) { const [txt, bg, fg] = lb; paintLabel(labelL, txt + bg, (g, W2, H2) => pill(g, W2, H2, txt, bg, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, LBL_Y), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: frozen(t) ? 0 : BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: 0 });
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const FRONT = [[0.0, 0.93, 3.7], [0.0, 0.905, 2.22]];
const CAM = [
  [0.0, [0.0, 1.2, 2.66], [0.0, 0.86, 0.3]], [Hh.cut1 - 0.01, [0.0, 1.19, 2.6], [0.0, 0.86, 0.3]],
  [Hh.cut1, [0.42, 1.0, 2.5], [0.0, 0.9, 1.62]], [Hh.burst[0], [0.45, 1.0, 2.56], [0.0, 0.9, 1.65]], [6.4, [0.95, 1.18, 3.2], [-0.02, 0.92, 1.88]], [Hh.cut2 - 0.01, [0.92, 1.17, 3.14], [-0.02, 0.92, 1.9]],
  [Hh.cut2, ...FRONT], [Hh.stack[0], ...FRONT], [Hh.stack[1], [0.82, 1.14, 3.2], [0.0, 0.92, 1.86]], [Hh.avg[0], [0.8, 1.13, 3.15], [0.0, 0.92, 1.86]],
  [Hh.avg[0] + 0.6, ...FRONT], [Hh.cut4 - 0.01, [0.0, 0.93, 3.6], [0.0, 0.905, 2.22]],
  [Hh.cut4, [0.0, 1.2, 2.66], [0.0, 0.86, 0.3]], [17.9, [0.0, 1.19, 2.62], [0.0, 0.86, 0.3]], [18.55, [0.0, 0.902, 2.79], [0.0, 0.897, 1.55]], [Hh.cut5 - 0.01, [0.0, 0.902, 2.75], [0.0, 0.897, 1.55]],
  [Hh.cut5, [0.52, 1.08, 3.1], [-0.1, 0.74, 0.85]], [22.9, [0.49, 1.07, 3.05], [-0.1, 0.74, 0.85]], [24.15, [0.08, 0.98, 2.95], [0.0, 0.88, 1.2]], [24.6, [0.0, 0.89, 2.79], [0.0, 0.884, 1.55]], [Hh.cta - 0.01, [0.0, 0.89, 2.74], [0.0, 0.884, 1.55]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.cut1, 0.004, 0.1, 40) + kick(t, Hh.brace[1], 0.004, 0.08, 40);
  cam.position.set(pos[0] + shake + 0.003 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.003 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: dark room, bright phone photo + "IT WAS THIS DARK?"
window.renderThumb = () => {
  const t = 0.0; cameraAt(t); cam.position.set(0.0, 1.2, 2.95); cam.lookAt(0.0, 1.13, 0.3); stageAt(t); labelL.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 760);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['IT WAS', '#F4F7FB', 400], ['THIS DARK?', AMBER, 560]].forEach(([w, col, y]) => { let S = 160; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
  makeImages();
  window.renderAt(0);
  return document.fonts.check('700 40px "Space Grotesk"') && document.fonts.check('700 40px "Noto Sans Devanagari"', 'हिन्दी');
})();
