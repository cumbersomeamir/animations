// vacuum.js — Ideaverse production 30s english-14 #01 (English): why a robot vacuum can dodge a sock but swallow a cable.
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine);
// overlay tail from english-12 (caption safe area x 100..900). New: generic robot vacuum, sock, shoe, cable (tube), camera
// frustum + detection boxes, laser line, model-list card. Every frame is a pure function of t (window.renderAt).
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

// ---- easel card (600 x 800 logical, drawn at 2x): the per-model obstacle lists (iRobot's published table)
const NW = 600, NH = 800, CS = 2;
const ROWSM = [['ROOMBA j7', true, true], ['ROOMBA j6', true, false], ['NO CAMERA', false, false]];
function drawCard(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  if (s.face === 'idle') { g.strokeStyle = 'rgba(108,218,126,0.5)'; g.lineWidth = 10; g.beginPath(); g.arc(NW / 2, 380, 150, 0, 7); g.stroke(); g.fillStyle = 'rgba(108,218,126,0.5)'; g.beginPath(); g.arc(NW / 2, 380, 30, 0, 7); g.fill(); return; }
  g.fillStyle = '#F4F7FB'; g.font = `800 50px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.globalAlpha = Math.min(1, s.header); g.fillText('DEPENDS ON MODEL', NW / 2, 86); g.globalAlpha = 1;
  g.font = `800 26px ${HI}`; g.fillStyle = 'rgba(244,247,251,0.7)'; g.fillText('CORDS', 400, 168); g.fillText('SOCKS', 515, 168);
  ROWSM.forEach(([name, cord, sock], i) => { const y = 210 + i * 150, hot = i === 1 && s.rowB > 0, a = Math.min(1, s.rows[i]); if (!(a > 0)) return;
    g.save(); g.globalAlpha = a; g.fillStyle = hot ? '#1E2B48' : '#16203A'; rr(g, 26, y, 548, 124, 22); g.fill(); if (hot) { g.strokeStyle = P.mint; g.lineWidth = 6; g.stroke(); }
    g.fillStyle = '#F4F7FB'; g.textAlign = 'left'; g.font = `800 36px ${HI}`; g.fillText(name, 52, y + 62);
    const mark = (x, ok, vis) => { if (!(vis > 0)) return; g.save(); g.globalAlpha = a * Math.min(1, vis); g.fillStyle = ok ? P.mint : '#E5483B'; g.beginPath(); g.arc(x, y + 62, 30, 0, 7); g.fill();
      if (ok) check(g, x - 16, y + 46, 32, NAVY, 7); else { g.strokeStyle = '#FFFFFF'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 12, y + 50); g.lineTo(x + 12, y + 74); g.moveTo(x + 12, y + 50); g.lineTo(x - 12, y + 74); g.stroke(); } g.restore(); };
    const vC = i === 1 ? s.cordsB : 1, vS = i === 1 ? s.socksB : 1; mark(400, cord, vC); mark(515, sock, vS); g.restore(); });
  if (s.check > 0) chip(g, 150, 712, 'CHECK YOURS', s.check, P.mint, 40);
}

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, vac, brush, sock, shoe, cable, plug, frustum, boxes = [], laser, laserPts, trail, labelL, tagL = [];
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const CABLE_PTS = [[0.62, 1.02], [0.46, 0.84], [0.33, 0.66], [0.27, 0.52], [0.2, 0.34], [0.05, 0.24], [-0.16, 0.2]].map(([x, z]) => V(x, 0.0045, z));
const CABLE_CURVE = new THREE.CatmullRomCurve3(CABLE_PTS);
const CABLE_N = 140, CABLE_BASE = CABLE_CURVE.getSpacedPoints(CABLE_N);
const SOCK_AT = V(-0.2, 0, 0.55), SHOE_AT = V(-0.48, 0, 0.44), LASER_Z = 0.55;
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: radar-sweep icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 14; mg.strokeStyle = P.mint; mg.lineWidth = 8; for (const r of [40, 80, 120]) { mg.beginPath(); mg.arc(256, 260, r, Math.PI * 1.15, Math.PI * 1.85); mg.stroke(); } mg.fillStyle = P.mint; mg.beginPath(); mg.arc(256, 260, 14, 0, 7); mg.fill();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  // easel + card (model lists)
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // the robot vacuum (generic; forward = local -z)
  vac = new THREE.Group(); scene.add(vac);
  const shell = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.172, 0.075, 56), mats.shell)); shell.position.y = 0.045; vac.add(shell);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.006, 56), mats.navy); top.position.y = 0.084; vac.add(top);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.006, 8, 40), mats.mint); ring.rotation.x = Math.PI / 2; ring.position.y = 0.088; vac.add(ring);
  const bump = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.176, 0.176, 0.05, 48, 1, true, Math.PI * 0.62, Math.PI * 0.76), M('#2A3550', { roughness: 0.4, side: THREE.DoubleSide }))); bump.position.y = 0.04; vac.add(bump);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.014, 24), new THREE.MeshBasicMaterial({ color: P.mint, toneMapped: false })); lens.position.set(0, 0.05, -0.177); lens.rotation.y = Math.PI; vac.add(lens);
  brush = new THREE.Group(); brush.position.set(-0.11, 0.006, -0.11); vac.add(brush); for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.003, 0.005), mats.mint); b.rotation.y = i * Math.PI * 2 / 3; b.position.set(Math.cos(i * 2.09) * 0.035, 0, -Math.sin(i * 2.09) * 0.035); brush.add(b); }
  // sock + shoe (obstacles the camera is trained to name) and the cable (thin, flat)
  const sc = canvas(256, 64), sg = sc.getContext('2d'); sg.fillStyle = '#E9A23B'; sg.fillRect(0, 0, 256, 64); sg.fillStyle = '#F4F7FB'; for (let i = 0; i < 8; i++) sg.fillRect(i * 32, 0, 12, 64);
  const sockMat = new THREE.MeshStandardMaterial({ map: cvTex(sc), roughness: 0.9 });
  sock = new THREE.Group(); const leg = sh(new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.14, 6, 16), sockMat)); leg.rotation.z = Math.PI / 2; leg.position.y = 0.027; sock.add(leg);
  const foot = sh(new THREE.Mesh(new THREE.CapsuleGeometry(0.027, 0.06, 6, 16), sockMat)); foot.rotation.x = Math.PI / 2; foot.position.set(0.1, 0.026, 0.04); sock.add(foot);
  sock.position.copy(SOCK_AT); sock.rotation.y = 0.1; scene.add(sock);
  shoe = new THREE.Group(); const upper = rbox(0.24, 0.07, 0.09, 0.03, M('#3E8EDE', { roughness: 0.6 })); upper.position.y = 0.05; shoe.add(upper); const sole = rbox(0.26, 0.02, 0.1, 0.008, M('#F4F7FB', { roughness: 0.7 })); sole.position.y = 0.01; shoe.add(sole);
  shoe.position.copy(SHOE_AT); shoe.rotation.y = 0.5; scene.add(shoe);
  cable = new THREE.Mesh(new THREE.TubeGeometry(CABLE_CURVE, CABLE_N, 0.004, 8, false), M('#E9EFF2', { roughness: 0.45, metalness: 0.05 })); cable.castShadow = true; scene.add(cable);
  plug = rbox(0.05, 0.03, 0.035, 0.006, M('#E9EFF2', { roughness: 0.5 })); plug.position.copy(CABLE_PTS[0]).add(V(0, 0.012, 0)); scene.add(plug);
  // camera frustum (illustrative) + detection boxes
  { const g = new THREE.BufferGeometry(); const P0 = [0, 0, 0], q = [[-0.5, -0.06, -0.85], [0.42, -0.06, -0.85], [0.42, -0.06, -0.2], [-0.5, -0.06, -0.2]];
    const pos = []; for (let i = 0; i < 4; i++) pos.push(...P0, ...q[i], ...q[(i + 1) % 4]); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    frustum = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: P.mint, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })); frustum.visible = false; scene.add(frustum); }
  const mkBox = (w, h, d, col, dashed) => { const grp = new THREE.Group(); const e = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)); const m = new THREE.LineSegments(e, dashed ? new THREE.LineDashedMaterial({ color: col, dashSize: 0.02, gapSize: 0.015, toneMapped: false }) : new THREE.LineBasicMaterial({ color: col, toneMapped: false })); if (dashed) m.computeLineDistances(); grp.add(m);
    grp.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: dashed ? 0.16 : 0.24, depthWrite: false, toneMapped: false }))); grp.visible = false; scene.add(grp); return grp; };
  boxes = [mkBox(0.26, 0.08, 0.13, P.mint), mkBox(0.3, 0.1, 0.14, P.mint), mkBox(0.14, 0.03, 0.3, AMBER, true)];
  boxes[0].position.set(SOCK_AT.x + 0.03, 0.04, SOCK_AT.z + 0.02); boxes[0].rotation.y = 0.1; boxes[1].position.set(SHOE_AT.x, 0.05, SHOE_AT.z); boxes[1].rotation.y = 0.5; boxes[2].position.set(0.28, 0.015, 0.58); boxes[2].rotation.y = 0.45;
  tagL = [makeLabel(0.2, 0.06, 512), makeLabel(0.2, 0.06, 512), makeLabel(0.2, 0.06, 512)];
  // laser line + mapping trail
  laser = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: RED, toneMapped: false })); laser.visible = false; laser.frustumCulled = false; scene.add(laser);
  laserPts = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: '#FFD0D0', size: 0.012, sizeAttenuation: true, transparent: true, depthWrite: false, toneMapped: false })); laserPts.visible = false; laserPts.frustumCulled = false; scene.add(laserPts);
  trail = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1), new THREE.MeshBasicMaterial({ color: P.mint, transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false })); trail.rotation.x = -Math.PI / 2; trail.visible = false; scene.add(trail);
  labelL = makeLabel(0.5, 0.13);
}

// ------------------------------------------------------------------ states (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
let cardKey = '';
// vacuum path in the hook (x, z, time) → stuck on the cable; parked for the explanations; mapping lane in the payoff
const PATH = [[0.0, -0.2, 1.32], [1.05, -0.2, 0.86], [1.6, 0.07, 0.66], [2.25, 0.13, 0.44], [2.85, 0.14, 0.38]];
function vacAt(t) {
  if (t < Hh.cut1) { let i = 1; while (i < PATH.length - 1 && t > PATH[i][0]) i++; const [t0, x0, z0] = PATH[i - 1], [t1, x1, z1] = PATH[i], k = E.inOutSine(inv(t0, t1, t));
    const x = lerp(x0, x1, k), z = lerp(z0, z1, k), dx = x1 - x0, dz = z1 - z0; const stuck = inv(Hh.stuck, Hh.stuck + 0.1, t);
    return { x: x + 0.004 * Math.sin(t * 60) * stuck, z, yaw: Math.atan2(-dx, -dz), tilt: 0.06 * stuck, spin: t < Hh.stuck ? t * 25 : Hh.stuck * 25 }; }
  if (t < Hh.cut2) return { x: 0.0, z: 1.06, yaw: 0, tilt: 0, spin: 0 };
  if (t < Hh.cut4) return { x: 0.0, z: 1.32, yaw: 0, tilt: 0, spin: 0 };                       // parked further back so the laser close-ups are clear
  const k = E.inOutSine(inv(Hh.mapping, Hh.cta, t));
  return { x: -0.05, z: lerp(1.25, 0.35, k), yaw: 0, tilt: 0, spin: t * 25 };
}
function cableAt(t) {                                               // pulled toward the vacuum when swallowed; gathered into DOCKET's hand when cleared
  const pts = CABLE_BASE.map((p) => p.clone());
  if (t >= Hh.swallow && t < Hh.cut1) { const v = vacAt(t), c = V(v.x, 0.03, v.z), k = E.outCubic(inv(Hh.swallow, Hh.stuck + 0.3, t));
    pts.forEach((p) => { const d = Math.hypot(p.x - c.x, p.z - c.z); if (d < 0.32) { const w = k * Math.pow(1 - d / 0.32, 1.5); p.lerp(c, w * 0.85); p.y = lerp(p.y, 0.012, w); } }); }
  if (t >= Hh.cut4) { const k = E.inOutCubic(inv(Hh.grab[0], Hh.grab[1], t)), h = HAND_GRAB();
    pts.forEach((p, i) => { const u = i / CABLE_N, w = clamp(k * 1.6 - u * 0.6); p.lerp(h.clone().add(V(0.06 * Math.sin(u * 30), -0.09 + 0.06 * Math.cos(u * 30), 0.02 * Math.sin(u * 7))), w); }); }
  return pts;
}
let HAND_GRAB = () => V(0.62, 0.6, 1.0);
let cableKey = '';
function updateCable(t) {
  const key = (t >= Hh.swallow && t < Hh.cut1) || (t >= Hh.cut4) ? Math.round(t * FPS) : 'base'; if (key === cableKey) return; cableKey = key;
  const pts = cableAt(t); cable.geometry.dispose(); cable.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), CABLE_N, 0.004, 8, false);
  plug.position.copy(pts[0]).add(V(0, 0.012, 0));
}
let laserKey = '';
function laserAt(t) {                                               // a red laser line across the floor at z = LASER_Z; it bends where it hits something
  const k = Math.round(inv(Hh.sweep[0], Hh.sweep[1], t) * 60) / 60; if (String(k) === laserKey) return; laserKey = String(k);
  const n = 400, pts = [], hits = [];
  const yAt = (x) => { let y = 0.002; const ds = Math.abs(x - (SOCK_AT.x + 0.03)); if (ds < 0.13) y = Math.max(y, 0.055 * Math.sqrt(Math.max(0, 1 - (ds / 0.13) ** 2)));     // sock: a tall bump
    const dc = Math.abs(x - 0.285); if (dc < 0.006) y = Math.max(y, 0.008 * Math.sqrt(1 - (dc / 0.006) ** 2)); return y; };                                                 // cable: ~4 mm, a couple of points
  const x1 = lerp(-0.7, 0.62, Math.max(0.01, k));
  for (let i = 0; i <= n; i++) { const x = lerp(-0.7, x1, i / n); pts.push(V(x, yAt(x), LASER_Z)); }
  for (let x = -0.7; x <= x1; x += 0.012) { const y = yAt(x); if (y > 0.004) hits.push(V(x, y + 0.004, LASER_Z)); }
  laser.geometry.dispose(); laser.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 500, 0.0016, 6, false);
  laserPts.geometry.dispose(); laserPts.geometry = new THREE.BufferGeometry().setFromPoints(hits.length ? hits : [V(0, -1, 0)]);
}
function cardState(t) {
  if (t < Hh.cut3) return { face: 'idle' };
  return { face: 'list', header: q20(inv(Hh.header, Hh.header + 0.3, t)), rows: [0, 1, 2].map((i) => q20(inv(Hh.header + 0.3 + i * 0.25, Hh.header + 0.6 + i * 0.25, t))),
    rowB: q20(inv(Hh.rowB, Hh.rowB + 0.3, t)), cordsB: q20(inv(Hh.cordsB, Hh.cordsB + 0.25, t)), socksB: q20(inv(Hh.socksB, Hh.socksB + 0.25, t)), check: q20(inv(Hh.check, Hh.check + 0.3, t)) };
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawCard(g, s); tag(g, NW - 22, NH - 62, 'EXAMPLE', NAVY, AMBER, 18); cardMesh.material.map.needsUpdate = true;
}
function labelAt(t) {
  if (t >= Hh.stuck && t < Hh.cut1) return ['STUCK!', RED, '#FFFFFF'];
  if (t >= Hh.trained && t < Hh.cut2) return ['TRAINED TO NAME', P.mint, NAVY];
  if (t >= Hh.few && t < Hh.cut3) return ['FEW POINTS', AMBER, NAVY];
  if (t >= Hh.off && t < Hh.cta) return ['AVOIDANCE OFF', AMBER, NAVY];
  if (t >= Hh.mapping && t < Hh.off) return ['FIRST MAPPING RUN', P.mint, NAVY];
  return null;
}

// ------------------------------------------------------------------ choreography
const WATCH = { x: 1.9, z: 0.2, rotY: -120 };                      // off-screen during the floor shots                     // behind the action, watching the vacuum
const CLEAR = { x: 0.72, z: 0.3, rotY: -150 };                      // beside the cable's plug end, ready to gather it
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...WATCH, headPitch: 22 } },
  { t: Hh.stuck, p: {} },
  { t: Hh.why, e: 'outBack', p: { headRoll: 14, headPitch: 18 } },                               // head tilt: "Why?"
  { t: Hh.cut1 - 0.01, p: {} },
  { t: Hh.cut4 - 0.01, p: { headRoll: 0 } },
  { t: Hh.cut4, p: { ...CLEAR, headPitch: 20, crouch: 0.6, lean: 10 } },                          // (cut) gathers the cable
  { t: Hh.grab[1], p: { crouch: 0.2, lean: 2, headPitch: 6 } },
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headPitch: -2, crouch: 0, lean: 0 } },               // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 0], [30.5, 0]], 1: [[-1, 0], [Hh.cut4 - 0.01, 0], [Hh.cut4, 1], [Hh.cta - 0.01, 1], [Hh.cta, 0], [30.5, 0]] };
const EXPR = [[-9, 'focus'], [Hh.stuck, 'wow'], [Hh.why, 'puzzled'], [Hh.cut1, 'focus'], [Hh.cut4, 'determined'], [Hh.grab[1], 'happy'], [Hh.off, 'skeptic'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [1.9, 6.0, 12.0, 17.0, 22.9, 25.6, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.stuck, 18) + kick(t, Hh.grab[1], 12) + 6 * Math.sin(t * 3.1);
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

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  // DOCKET's hand B reaches the plug end and lifts it; the cable follows the hand
  const reach = local(p, V(0.18, 0.62, 0.34));
  const wB = track(IKW[1], t); solveArm(1, p, reach, wB); solveArm(0, p, null, 0);
  scene.updateMatrixWorld(true);
  { const hb = V(); docket.handWorld(1, hb); HAND_GRAB = () => hb.clone(); }
  const v = vacAt(t); vac.position.set(v.x, 0, v.z); vac.rotation.set(v.tilt, v.yaw, 0, 'YXZ'); brush.rotation.y = -v.spin;
  updateCable(t);
  const camShot = t >= Hh.cut1 && t < Hh.cut2, laserShot = t >= Hh.cut2 && t < Hh.cut3;
  frustum.visible = camShot; if (camShot) { frustum.position.set(v.x, 0.05, v.z - 0.17); frustum.material.opacity = 0.12 * clamp(inv(Hh.cut1, Hh.cut1 + 0.4, t)); }
  const bx = [Hh.boxSock, Hh.boxShoe, Hh.boxCord], tags = [['SOCK ✓', P.mint, NAVY], ['SHOE ✓', P.mint, NAVY], ['CORD?', AMBER, NAVY]];
  boxes.forEach((b, i) => { const a = camShot && t >= bx[i]; b.visible = a; if (a) b.scale.setScalar(1 + 0.25 * (1 - E.outCubic(inv(bx[i], bx[i] + 0.25, t)))); });
  tagL.forEach((m, i) => { const a = camShot && t >= bx[i]; if (!a) { m.visible = false; return; } const [txt, bg, fg] = tags[i]; paintLabel(m, txt, (g, W2, H2) => pill(g, W2, H2, txt, bg, fg)); billboard(m, boxes[i].position.clone().add(V(0, 0.1, 0)), E.outBack(inv(bx[i], bx[i] + 0.3, t))); });
  laser.visible = laserPts.visible = laserShot && t >= Hh.sweep[0]; if (laser.visible) laserAt(t);
  trail.visible = t >= Hh.mapping && t < Hh.cta; if (trail.visible) { const len = Math.max(0.01, 1.25 - v.z); trail.scale.set(1, len, 1); trail.position.set(v.x, 0.003, v.z + len / 2); }
  const lb = labelAt(t);
  if (lb) { const [txt, bg, fg] = lb; paintLabel(labelL, txt + bg, (g, W2, H2) => pill(g, W2, H2, txt, bg, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.085), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updateCard(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const CAM = [
  [0.0, [0.5, 1.75, 2.35], [0.0, 0.05, 0.52]], [Hh.cut1 - 0.01, [0.45, 1.62, 2.18], [0.02, 0.05, 0.52]],
  [Hh.cut1, [-0.06, 1.0, 2.4], [-0.06, 0.0, 0.5]], [Hh.cut2 - 0.01, [-0.06, 0.95, 2.3], [-0.06, 0.0, 0.5]],
  [Hh.cut2, [-0.1, 0.16, 1.02], [-0.15, 0.03, 0.55]], [Hh.push[0], [-0.08, 0.15, 0.98], [-0.13, 0.03, 0.55]], [Hh.push[1], [0.27, 0.07, 0.8], [0.285, 0.012, 0.55]], [Hh.cut3 - 0.01, [0.268, 0.068, 0.79], [0.285, 0.012, 0.55]],
  [Hh.cut3, ...LAB], [Hh.cut4 - 0.01, [-0.15, 1.13, 1.06], [-0.64, 1.13, -0.32]],
  [Hh.cut4, [0.2, 1.4, 3.35], [0.3, 0.62, 0.55]], [Hh.cta - 0.01, [0.18, 1.38, 3.2], [0.28, 0.6, 0.55]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.stuck, 0.01, 0.1, 40) + kick(t, Hh.few, 0.004, 0.08, 40);
  cam.position.set(pos[0] + shake + 0.004 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.004 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: the vacuum stuck on the cable, sock dodged + 3 large words
window.renderThumb = () => {
  const t = 3.4; cameraAt(t); stageAt(t); labelL.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, 'rgba(8,11,22,0.92)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 900);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['SOCK: DODGED', '#F4F7FB', 380], ['CABLE: EATEN', AMBER, 560]].forEach(([w, col, y]) => { let S = 150; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
