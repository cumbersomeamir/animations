// faceid.js — Ideaverse production 30s english-20 #01 (English): Face ID's one-in-a-million odds, and why Apple says they
// rise for twins, look-alike siblings and kids under 13 (and again with mask mode); payoff: passcode or mask mode off.
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine);
// overlay tail from english-12. New: sculpted twin busts, depth map + dots + mask, scan beam, number-row card, phone screens.
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

// ------------------------------------------------------------------ sculpted twin busts (original, stylised; no real faces)
function mulberry(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss2 = (x, y, cx, cy, sx, sy) => Math.exp(-(((x - cx) ** 2) / (2 * sx * sx) + ((y - cy) ** 2) / (2 * sy * sy)));
function headGeometry(nose = 1) {                                   // unit sphere → head: nose, brow, eye sockets, cheeks, lips, chin
  const g = new THREE.SphereGeometry(1, 120, 90), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); let { x, y, z } = v;
    x *= 0.78; y *= 1.04; z *= 0.92;
    if (z > 0) {
      const f = Math.min(1, z / 0.9);
      z += f * (0.2 * nose * gauss2(x, y, 0, -0.08, 0.085, 0.2) + 0.07 * gauss2(x, y, 0, 0.26, 0.4, 0.06)
        - 0.09 * (gauss2(x, y, -0.27, 0.12, 0.11, 0.07) + gauss2(x, y, 0.27, 0.12, 0.11, 0.07))
        + 0.05 * (gauss2(x, y, -0.33, -0.18, 0.12, 0.1) + gauss2(x, y, 0.33, -0.18, 0.12, 0.1))
        + 0.05 * gauss2(x, y, 0, -0.45, 0.16, 0.05) - 0.03 * gauss2(x, y, 0, -0.52, 0.18, 0.02) + 0.06 * gauss2(x, y, 0, -0.72, 0.2, 0.1));
    }
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals(); return g;
}
function depthColors(geo) {                                          // near = amber → far = navy (the 3D map)
  const p = geo.attributes.position, c = new Float32Array(p.count * 3), a = new THREE.Color(AMBER), b = new THREE.Color('#2F64D6'), m = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const k = clamp((p.getZ(i) + 0.1) / 1.15); m.copy(b).lerp(a, k * k); c[i * 3] = m.r; c[i * 3 + 1] = m.g; c[i * 3 + 2] = m.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); return geo;
}
function dotPositions(geo, n, seed) {                                // dots landing on the front of the face
  const p = geo.attributes.position, n2 = geo.attributes.normal, r = mulberry(seed), out = [];
  for (let tries = 0; out.length < n && tries < n * 40; tries++) { const i = Math.floor(r() * p.count); if (n2.getZ(i) > 0.35 && p.getZ(i) > 0.2) out.push(p.getX(i) * 1.012, p.getY(i) * 1.012, p.getZ(i) * 1.012); }
  return new Float32Array(out);
}

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, labelL, busts = [], scanPhone, beam, dots, dotsAll, depthMesh, maskMesh;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
const NW = 600, NH = 800, CS = 2;
const HEAD_R = 0.15, BUST = [V(-0.41, 0, 0.62), V(0.41, 0, 0.62)], HEAD_Y = 1.18;
function buildBust(at, nose, scarf) {
  const grp = new THREE.Group(); grp.position.copy(at); scene.add(grp);
  const ped = rbox(0.3, 0.86, 0.3, 0.02, M('#2A3550', { roughness: 0.6 })); ped.position.y = 0.43; grp.add(ped);
  const sh2 = rbox(0.36, 0.12, 0.2, 0.06, M('#E9EFF2', { roughness: 0.5 })); sh2.position.y = 0.93; grp.add(sh2);
  const neck = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.12, 24), M('#E9EFF2', { roughness: 0.5 }))); neck.position.y = 1.02; grp.add(neck);
  const sc = sh(new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.025, 12, 32), M(scarf, { roughness: 0.6 }))); sc.rotation.x = Math.PI / 2; sc.position.y = 0.99; grp.add(sc);
  const geo = headGeometry(nose), head = sh(new THREE.Mesh(geo, M('#E9EFF2', { roughness: 0.45 }))); head.scale.setScalar(HEAD_R); head.position.y = HEAD_Y; grp.add(head);
  return { grp, head, geo };
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: lock icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 14; mg.strokeStyle = P.mint; mg.lineWidth = 14; mg.beginPath(); mg.arc(256, 120, 40, Math.PI, 0); mg.stroke(); mg.fillStyle = P.mint; rr(mg, 196, 120, 120, 90, 14); mg.fill();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  // twin busts (A = "you", B = the twin, a hair wider nose)
  busts = [buildBust(BUST[0], 1.0, P.mint), buildBust(BUST[1], 1.06, AMBER)];
  // the 3D map overlay + dots + mask on bust A
  const A = busts[0];
  depthMesh = new THREE.Mesh(depthColors(headGeometry(1.0)), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, toneMapped: false })); depthMesh.scale.setScalar(HEAD_R * 1.004); depthMesh.position.y = HEAD_Y; A.grp.add(depthMesh);
  dotsAll = dotPositions(A.geo, 2600, 9);
  dots = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: '#FF6A6A', size: 0.0042, sizeAttenuation: true, transparent: true, opacity: 0.95, depthWrite: false, toneMapped: false }));
  dots.scale.setScalar(HEAD_R); dots.position.y = HEAD_Y; dots.frustumCulled = false; A.grp.add(dots);
  { const mg = new THREE.SphereGeometry(1.02, 64, 32, Math.PI / 2 - 1.15, 2.3, 1.75, 0.95); const mk = sh(new THREE.Mesh(mg, M(P.mint, { roughness: 0.8, side: THREE.DoubleSide })));   // lower-face patch, centred on +z
    mk.scale.set(0.8 * HEAD_R, 1.06 * HEAD_R, 1.06 * HEAD_R); mk.position.y = HEAD_Y; mk.visible = false; A.grp.add(mk); maskMesh = mk; }
  // the scanning phone (in front of bust A, its top edge toward the face) + the beam
  scanPhone = new THREE.Group(); scene.add(scanPhone);
  const sp = rbox(0.075, 0.14, 0.01, 0.01, mats.navy); scanPhone.add(sp);
  const notch = new THREE.Mesh(new THREE.CircleGeometry(0.008, 16), new THREE.MeshBasicMaterial({ color: '#FF6A6A', toneMapped: false })); notch.position.set(0, 0.058, -0.0055); notch.rotation.y = Math.PI; scanPhone.add(notch);
  beam = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.42, 40, 1, true), new THREE.MeshBasicMaterial({ color: '#FF6A6A', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); scene.add(beam);
  // easel + card (numbers)
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // DOCKET's phone (illustrative lock / passcode / settings screens; not Apple's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  labelL = makeLabel(0.5, 0.13);
}

// ------------------------------------------------------------------ card + phone screens (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
const bg = (g, w, h, col) => { g.fillStyle = col; g.fillRect(0, 0, w, h - 1); g.fillRect(0, h - 1, w, 1); };   // two partial fills (a lone full-canvas fill can be dropped by Chromium)
const NB = 14, VEC = (() => { const r = mulberry(31); return Array.from({ length: NB }, () => 0.25 + 0.7 * r()); })();
const NOWV = VEC.map((v, i) => v + 0.025 * Math.sin(i * 2.3)), TWINV = VEC.map((v, i) => v + 0.06 * Math.sin(i * 1.7 + 1));
let cardKey = '';
function cardState(t) { return { bars: q20(inv(Hh.bars[0], Hh.bars[1], t)), cmp: q20(E.inOutCubic(inv(Hh.compare[0], Hh.compare[1], t))), ok: q20(inv(Hh.match, Hh.match + 0.25, t)),
  twin: q20(inv(Hh.twinRow[0], Hh.twinRow[1], t)), close: q20(inv(Hh.close, Hh.close + 0.25, t)), chips: Hh.chips.map((c) => q20(inv(c, c + 0.3, t))) }; }
function barRow(g, y, vec, col, a, label, h = 110) {
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(244,247,251,0.75)'; g.font = `800 26px ${HI}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(label, 48, y - h - 26);
  vec.forEach((v, i) => { const bh = v * h * clamp(a * 1.4 - i * 0.03); g.fillStyle = col; rr(g, 48 + i * 37, y - bh, 26, bh, 6); g.fill(); });
  g.restore();
}
function drawCard(g, s) {
  bg(g, NW, NH, '#0E1424');
  if (!(s.bars > 0)) { g.fillStyle = 'rgba(244,247,251,0.2)'; g.font = `800 30px ${HI}`; g.textAlign = 'center'; g.fillText('· · ·', NW / 2, 400); return; }
  const yS = 250, yN = lerp(400, 250, s.cmp);
  barRow(g, yS, VEC, P.mint, 1, 'SAVED (YOU)');
  barRow(g, yN, NOWV, 'rgba(244,247,251,0.75)', s.bars, s.cmp > 0.5 ? '' : 'NOW');
  if (s.ok > 0) { g.save(); g.globalAlpha = s.ok; g.fillStyle = P.mint; g.beginPath(); g.arc(520, 104, 34, 0, 7); g.fill(); check(g, 500, 82, 40, NAVY, 9); g.restore(); }
  if (s.twin > 0) { barRow(g, 480, TWINV, AMBER, s.twin, 'YOUR TWIN'); }
  if (s.close > 0) { g.save(); g.globalAlpha = s.close; g.fillStyle = AMBER; g.beginPath(); g.arc(520, 334, 34, 0, 7); g.fill(); g.fillStyle = NAVY; g.font = `800 44px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 520, 336); g.restore(); }
  ['TWIN', 'SIBLING', 'UNDER 13'].forEach((w, i) => { if (s.chips[i] > 0) chip(g, 40 + i * 182, 46, w, s.chips[i], AMBER, 26); });
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawCard(g, s); cardMesh.material.map.needsUpdate = true;
}
let screenKey = '';
function screenState(t) {
  if (t < Hh.cut4) return { m: 'lock', scan: q20((t * 0.8) % 1) };
  return { m: t < Hh.offLbl - 0.1 ? 'pass' : 'settings', digits: Math.min(6, Math.max(0, Math.floor((t - Hh.keypad - 0.2) / 0.16))), off: q20(inv(Hh.toggle, Hh.toggle + 0.25, t)) };
}
function drawScreen(t) {
  const s = screenState(t), key = JSON.stringify(s); if (key === screenKey) return; screenKey = key;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; bg(g, SW, SH, '#0E1424');
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (s.m === 'lock') {
    g.strokeStyle = '#F4F7FB'; g.lineWidth = 16; g.beginPath(); g.arc(SW / 2, 330, 62, Math.PI, 0); g.stroke(); g.fillStyle = '#F4F7FB'; rr(g, SW / 2 - 92, 330, 184, 150, 22); g.fill();
    g.fillStyle = '#0E1424'; g.beginPath(); g.arc(SW / 2, 395, 18, 0, 7); g.fill(); g.fillRect(SW / 2 - 7, 400, 14, 40);
    g.strokeStyle = P.mint; g.lineWidth = 8; const cx = SW / 2, cy = 690, b = 120, k = 30;
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.beginPath(); g.moveTo(cx + dx * b, cy + dy * (b - k)); g.lineTo(cx + dx * b, cy + dy * b); g.lineTo(cx + dx * (b - k), cy + dy * b); g.stroke(); }
    g.fillStyle = 'rgba(108,218,126,0.5)'; g.fillRect(cx - b + 10, cy - b + 10 + (2 * b - 20) * s.scan, 2 * b - 20, 6);
  }
  if (s.m === 'pass') {
    g.fillStyle = '#F4F7FB'; g.font = `800 44px ${HI}`; g.fillText('Enter Passcode', SW / 2, 200);
    for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(SW / 2 - 125 + i * 50, 290, 13, 0, 7); g.lineWidth = 4; g.strokeStyle = '#F4F7FB'; g.stroke(); if (i < s.digits) { g.fillStyle = '#F4F7FB'; g.fill(); } }
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const n = r === 3 ? (c === 1 ? '0' : '') : String(r * 3 + c + 1); if (!n) continue; const x = SW / 2 + (c - 1) * 150, y = 430 + r * 140; g.fillStyle = '#2A3550'; g.beginPath(); g.arc(x, y, 56, 0, 7); g.fill(); g.fillStyle = '#F4F7FB'; g.font = `700 50px ${HI}`; g.fillText(n, x, y + 2); }
  }
  if (s.m === 'settings') {
    g.fillStyle = '#F4F7FB'; g.font = `800 44px ${HI}`; g.textAlign = 'left'; g.fillText('Face ID & Passcode', 40, 200);
    g.fillStyle = '#16203A'; rr(g, 30, 290, SW - 60, 130, 24); g.fill();
    g.fillStyle = '#F4F7FB'; g.font = `700 34px ${HI}`; g.fillText('Face ID with a Mask', 58, 355);
    const on = 1 - s.off, tx = 410, ty = 355; g.fillStyle = on > 0.5 ? P.mint : '#3A4560'; rr(g, tx, ty - 30, 100, 60, 30); g.fill(); g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(lerp(tx + 30, tx + 70, on), ty, 24, 0, 7); g.fill();
  }
  g.textAlign = 'left'; tag(g, SW - 30, 30, 'EXAMPLE', NAVY, AMBER, 22);
  screenMesh.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ choreography
const HOME2 = { x: -0.02, z: 0.42, rotY: 0 };
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const OFF = { x: 1.8, z: 0.4, rotY: 0 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...HOME2, headPitch: 10 } },
  { t: Hh.twin - 0.2, p: {} },
  { t: Hh.twin + 0.2, e: 'outBack', p: { headYaw: 28, headRoll: 8 } },                           // looks at the twin
  { t: Hh.cut1 - 0.01, p: {} },
  { t: Hh.cut1, p: { ...OFF, headYaw: 0, headRoll: 0 } },                                          // (cut) off for scan + card
  { t: Hh.cut4 - 0.01, p: {} },
  { t: Hh.cut4, p: { ...HOME2, headPitch: 14 } },                                                  // (cut) the phone again
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headPitch: -2 } },                                     // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const phoneOn = (t) => t < Hh.cut1 || (t >= Hh.cut4 && t < Hh.cta);
const EXPR = [[-9, 'focus'], [Hh.twin, 'wow'], [Hh.cut4, 'determined'], [Hh.toggle + 0.3, 'happy'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [2.2, 23.0, 25.8, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.twin, 14) + kick(t, Hh.toggle, 10) + 6 * Math.sin(t * 3.1);
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
function labelAt(t) {
  if (t < Hh.twin) return ['1 IN A MILLION?', AMBER, NAVY];
  if (t < Hh.cut1) return ['YOUR TWIN?', AMBER, NAVY];
  if (t >= Hh.depth[0] && t < Hh.dots[0]) return ['3D MAP', P.mint, NAVY];
  if (t >= Hh.dots[0] && t < Hh.cut2) return ['THOUSANDS OF DOTS', P.mint, NAVY];
  if (t >= Hh.bars[0] && t < Hh.match) return ['FACE → NUMBERS', P.mint, NAVY];
  if (t >= Hh.match && t < Hh.twinRow[0]) return ['MATCH', P.mint, NAVY];
  if (t >= Hh.close && t < Hh.cut3) return ['TOO CLOSE', AMBER, NAVY];
  if (t >= Hh.mask[0] && t < Hh.cut4) return ['MASK MODE: HIGHER', AMBER, NAVY];
  if (t >= Hh.keypad && t < Hh.offLbl) return ['USE A PASSCODE', P.mint, NAVY];
  if (t >= Hh.offLbl && t < Hh.cta) return ['MASK MODE OFF', P.mint, NAVY];
  return null;
}
let dotKey = '';
function updateDots(t) {
  const n = Math.round(q20(inv(Hh.dots[0], Hh.dots[1], t)) * (dotsAll.length / 3)), masked = t >= Hh.cut3 ? q20(inv(Hh.mask[0], Hh.mask[1], t)) : 0, key = n + '|' + masked; if (key === dotKey) return; dotKey = key;
  const out = []; for (let i = 0; i < n; i++) { const y = dotsAll[i * 3 + 1]; if (masked > 0 && y < -0.08 && (i % 20) / 20 < masked) continue; out.push(dotsAll[i * 3], y, dotsAll[i * 3 + 2]); }
  dots.geometry.dispose(); dots.geometry = new THREE.BufferGeometry(); dots.geometry.setAttribute('position', new THREE.Float32BufferAttribute(out.length ? out : [0, -9, 0], 3));
}

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  const on = phoneOn(t); phone.visible = on;
  if (on) { const s = spot(p, V(0.0, 0.88, 0.36), -0.04); phone.position.copy(s.p); phone.quaternion.copy(s.q); scene.updateMatrixWorld(true); }
  solveArm(0, p, on ? onPhone(-0.19, -0.06, 0) : null, on ? 1 : 0); solveArm(1, p, on ? onPhone(0.19, -0.06, 0) : null, on ? 1 : 0);
  scene.updateMatrixWorld(true);
  const cardShot = t >= Hh.cut2 && t < Hh.cut3; busts.forEach((b) => { b.grp.visible = !cardShot; });
  // the twin lights up on "Your twin's?"
  const tw = t < Hh.cut1 ? clamp(inv(Hh.twin, Hh.twin + 0.3, t)) : 0; busts[1].head.material.emissive.set(AMBER); busts[1].head.material.emissiveIntensity = 0.25 * tw;
  // scan: phone in front of bust A, beam, depth colours, dots, mask
  const scan = t >= Hh.cut1 && t < Hh.cut2, maskShot = t >= Hh.cut3 && t < Hh.cut4;
  const headW = V(BUST[0].x, HEAD_Y, BUST[0].z), ph = headW.clone().add(V(0.2, -0.04, 0.26));
  scanPhone.visible = beam.visible = scan || maskShot; scanPhone.position.copy(ph); scanPhone.lookAt(headW.x, headW.y, headW.z + 0.6); scanPhone.rotateY(Math.PI);
  if (beam.visible) { const mid = ph.clone().lerp(headW, 0.5); beam.position.copy(mid); beam.lookAt(headW); beam.rotateX(-Math.PI / 2); beam.material.opacity = 0.1 * clamp(inv(Hh.beam, Hh.beam + 0.3, t)) * (0.8 + 0.2 * Math.sin(t * 20)); }
  depthMesh.material.opacity = scan ? 0.85 * E.inOutCubic(inv(Hh.depth[0], Hh.depth[1], t)) * (1 - inv(Hh.dots[0], Hh.dots[0] + 0.6, t) * 0.55) : maskShot ? 0.35 : 0;
  dots.visible = scan || maskShot; if (dots.visible) updateDots(t);
  maskMesh.visible = maskShot && t >= Hh.mask[0]; if (maskMesh.visible) maskMesh.scale.y = 1.06 * HEAD_R * E.outBack(inv(Hh.mask[0], Hh.mask[0] + 0.35, t));
  updateCard(t); if (on) drawScreen(t);
  const lb = labelAt(t);
  if (lb) { const [txt, bgc, fg] = lb; paintLabel(labelL, txt + bgc, (g, W2, H2) => pill(g, W2, H2, txt, bgc, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.1), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: 0 });
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const HOOKCAM = [[0.0, 1.2, 3.35], [0.0, 1.0, 0.5]];
const SCAN = [[-0.12, 1.3, 1.62], [-0.38, 1.17, 0.66]];
const CLOSE = [[0.01, 0.9, 2.3], [0.01, 0.875, 0.78]];
const CAM = [
  [0.0, ...HOOKCAM], [Hh.twin - 0.1, [0.0, 1.19, 3.22], [0.0, 1.0, 0.5]], [Hh.cut1 - 0.01, [0.2, 1.19, 3.0], [0.3, 1.08, 0.6]],
  [Hh.cut1, ...SCAN], [Hh.cut2 - 0.01, [-0.15, 1.28, 1.48], [-0.39, 1.17, 0.66]],
  [Hh.cut2, ...LAB], [Hh.cut3 - 0.01, [-0.15, 1.13, 1.06], [-0.64, 1.13, -0.32]],
  [Hh.cut3, [-0.1, 1.28, 1.58], [-0.38, 1.16, 0.66]], [Hh.cut4 - 0.01, [-0.14, 1.27, 1.46], [-0.39, 1.16, 0.66]],
  [Hh.cut4, ...CLOSE], [Hh.cta - 0.01, [0.01, 0.9, 2.22], [0.01, 0.875, 0.78]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  cam.position.set(pos[0] + 0.003 * Math.sin(t * 0.9), pos[1] + 0.003 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: twin busts, DOCKET's locked phone + "1 IN A MILLION?"
window.renderThumb = () => {
  const t = 0.0; cameraAt(t); cam.position.set(0.0, 1.3, 3.4); cam.lookAt(0.0, 1.12, 0.5); stageAt(t); labelL.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 760);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['1 IN A', '#F4F7FB', 400], ['MILLION?', AMBER, 560]].forEach(([w, col, y]) => { let S = 170; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
