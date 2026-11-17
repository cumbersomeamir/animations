// declined.js — Ideaverse production 30s english-18 #01 (English): why your own card gets declined on holiday
// (each payment is scored for fraud from hundreds of clues; clues that are fine alone stack past the bank's line; false
// declines happen; confirm it was you in the bank's app, then pay again). Engine header copied unchanged from english-09
// photosearch.js (= accepted feedback-round renderer = education pilot-01 engine); overlay tail from english-12.
// New: café counter + generic payment terminal, DOCKET's card, suitcase, the score card, a generic bank-alert phone. Pure function of t.
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

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, labelL, counter, term, termCanvas, termMesh, payCard, suitcase;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
const NW = 600, NH = 800, CS = 2;
const COUNTER_POS = V(0.58, 0, 0.62), TERM_POS = V(0.4, 0.95, 0.8), TW = 256, TH = 220;
const DRED = '#E5483B';
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: globe icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 14; mg.strokeStyle = P.mint; mg.lineWidth = 10; mg.beginPath(); mg.arc(256, 150, 90, 0, 7); mg.stroke();
    mg.beginPath(); mg.ellipse(256, 150, 40, 90, 0, 0, 7); mg.stroke(); mg.beginPath(); mg.moveTo(166, 150); mg.lineTo(346, 150); mg.stroke();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  // easel + card (the score: clues, three columns, the bank's line)
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // café counter + payment terminal (generic) + DOCKET's card + suitcase
  counter = new THREE.Group(); counter.position.copy(COUNTER_POS); scene.add(counter);
  const cBody = rbox(0.42, 0.8, 0.8, 0.02, M('#2A3550', { roughness: 0.6 })); cBody.position.y = 0.4; counter.add(cBody);
  const cTop = rbox(0.48, 0.035, 0.86, 0.01, M('#B07A4A', { roughness: 0.5 })); cTop.position.y = 0.815; counter.add(cTop);
  term = new THREE.Group(); term.position.copy(TERM_POS); term.rotation.set(-0.3, -0.62, 0, 'YXZ'); term.scale.setScalar(1.75); scene.add(term);
  const tb = rbox(0.13, 0.2, 0.04, 0.015, M('#121826', { roughness: 0.4 })); term.add(tb);
  termCanvas = canvas(TW, TH);
  termMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.112, 0.096), new THREE.MeshBasicMaterial({ map: cvTex(termCanvas), toneMapped: false })); termMesh.position.set(0, 0.04, 0.0205); term.add(termMesh);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const k = rbox(0.026, 0.014, 0.006, 0.003, mats.steel); k.position.set(-0.033 + c * 0.033, -0.035 - r * 0.02, 0.021); term.add(k); }
  { const cc = canvas(256, 160), g = cc.getContext('2d'); g.fillStyle = AMBER; rr(g, 0, 0, 256, 160, 18); g.fill(); g.fillStyle = '#D9A63A'; rr(g, 30, 52, 52, 40, 8); g.fill(); g.strokeStyle = NAVY; g.lineWidth = 6; g.lineCap = 'round'; for (const r of [16, 28, 40]) { g.beginPath(); g.arc(196, 72, r, -0.7, 0.7); g.stroke(); } g.fillStyle = NAVY; g.fillRect(30, 120, 150, 10);
    payCard = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.054, 0.003), [M(AMBER), M(AMBER), M(AMBER), M(AMBER), new THREE.MeshStandardMaterial({ map: cvTex(cc), roughness: 0.4 }), M(AMBER)]); payCard.castShadow = true; scene.add(payCard); }
  suitcase = new THREE.Group(); suitcase.position.set(-0.38, 0, 1.02); suitcase.rotation.y = 0.35; scene.add(suitcase);
  const sBody = rbox(0.34, 0.44, 0.17, 0.04, M('#2F64D6', { roughness: 0.5 })); sBody.position.y = 0.26; suitcase.add(sBody);
  const sHandle = rbox(0.14, 0.03, 0.03, 0.01, mats.steel); sHandle.position.y = 0.5; suitcase.add(sHandle);
  for (const [x, y, c] of [[-0.08, 0.32, AMBER], [0.07, 0.2, P.mint]]) { const st = new THREE.Mesh(new THREE.CircleGeometry(0.045, 24), M(c)); st.position.set(x, y, 0.087); suitcase.add(st); }
  for (const x of [-0.12, 0.12]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), mats.navy); w.rotation.x = Math.PI / 2; w.position.set(x, 0.025, 0); suitcase.add(w); }
  // the phone (illustrative bank alert; not any real bank's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  labelL = makeLabel(0.5, 0.13);
}

// ------------------------------------------------------------------ terminal, card, phone (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
let termKey = '';
function drawTerm(t) {
  const ok = t >= Hh.approved, key = (ok ? 'ok' : 'no') + (t >= Hh.payTap && !ok ? 'w' : ''); if (key === termKey) return; termKey = key;
  const g = termCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = key === 'now' ? '#1C2033' : ok ? '#2E9E57' : DRED; g.fillRect(0, 0, TW, TH);
  g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (key === 'now') { g.font = `800 40px ${HI}`; g.fillText('...', TW / 2, TH / 2); }
  else { g.beginPath(); g.arc(TW / 2, 70, 38, 0, 7); g.fill();
    if (ok) check(g, TW / 2 - 22, 50, 44, '#2E9E57', 10); else { g.strokeStyle = DRED; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(TW / 2 - 16, 54); g.lineTo(TW / 2 + 16, 86); g.moveTo(TW / 2 + 16, 54); g.lineTo(TW / 2 - 16, 86); g.stroke(); }
    g.fillStyle = '#FFFFFF'; g.font = `800 40px ${HI}`; g.fillText(ok ? 'APPROVED' : 'DECLINED', TW / 2, 150); g.font = `600 26px ${HI}`; g.fillText('€24.80', TW / 2, 192); }
  termMesh.material.map.needsUpdate = true;
}
let cardKey = '';
function cardState(t) {
  if (t >= Hh.cut3) return { blank: 1 };                          // the card is only used for the explanation
  return { card: q20(inv(Hh.cut1, Hh.cut1 + 0.3, t)), dots: q20(inv(Hh.dots[0], Hh.dots[1], t)), dfade: q20(inv(Hh.line[0], Hh.line[0] + 0.4, t)), line: q20(inv(Hh.line[0], Hh.line[1], t)),
    cols: Hh.col.map((c) => q20(inv(c, c + 0.4, t))), fine: [0, 1, 2].map((i) => q20(inv(Hh.fine + i * 0.15, Hh.fine + i * 0.15 + 0.25, t))),
    stack: q20(E.inOutCubic(inv(Hh.stack[0], Hh.stack[1], t))), over: q20(inv(Hh.over, Hh.over + 0.25, t)), stamp: q20(inv(Hh.stamp, Hh.stamp + 0.25, t)) };
}
const BASE_Y = 640, LINE_Y = 300, COL_X = [150, 300, 450], COL_H = [145, 135, 155], COL_W = 96, COL_C = ['#5E86A8', '#7B6F9A', '#A0705E'];
function icon(g, i, x, y, k = 1) {
  g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = '#F4F7FB'; g.fillStyle = '#F4F7FB'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
  if (i === 0) { g.beginPath(); g.arc(0, 0, 30, 0, 7); g.stroke(); g.beginPath(); g.ellipse(0, 0, 13, 30, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-30, 0); g.lineTo(30, 0); g.stroke(); }
  if (i === 1) { g.beginPath(); g.moveTo(-30, -6); g.lineTo(-24, -26); g.lineTo(24, -26); g.lineTo(30, -6); g.closePath(); g.stroke(); g.strokeRect(-24, -6, 48, 32); g.fillRect(-7, 6, 14, 20); }
  if (i === 2) { for (let k2 = 0; k2 < 4; k2++) { g.beginPath(); g.ellipse(0, 18 - k2 * 12, 26, 8, 0, 0, 7); g.fillStyle = k2 === 3 ? AMBER : '#F4F7FB'; g.fill(); g.strokeStyle = '#0E1424'; g.lineWidth = 3; g.stroke(); } }
  g.restore();
}
function drawCard(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH - 1); g.fillRect(0, NH - 1, NW, 1); if (s.blank) return;   // two partial fills: a single full-canvas opaque fill was dropped on redraw (Chromium canvas)
  // B · the payment card + hundreds of clue dots lighting up
  if (s.dfade < 1 && s.card > 0) {
    g.save(); g.globalAlpha = (1 - s.dfade) * s.card;
    g.fillStyle = AMBER; rr(g, 230, 96, 140, 88, 14); g.fill(); g.fillStyle = '#D9A63A'; rr(g, 248, 122, 32, 24, 5); g.fill();
    const n = 15 * 12, lit = Math.round(s.dots * n);
    for (let i = 0; i < n; i++) { const x = 90 + (i % 15) * 30, y = 250 + Math.floor(i / 15) * 30, on = i < lit; g.fillStyle = on ? (i % 23 === 7 ? AMBER : P.mint) : 'rgba(244,247,251,0.14)'; g.beginPath(); g.arc(x, y, on ? 8 : 6, 0, 7); g.fill(); }
    g.restore();
  }
  // C · the bank's line, then one column per clue
  if (s.line > 0) {
    g.save(); g.globalAlpha = s.line; g.strokeStyle = 'rgba(244,247,251,0.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(60, BASE_Y); g.lineTo(540, BASE_Y); g.stroke();
    g.strokeStyle = '#F4F7FB'; g.lineWidth = 6; g.setLineDash([22, 14]); g.beginPath(); g.moveTo(60, LINE_Y); g.lineTo(60 + 480 * s.line, LINE_Y); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#F4F7FB'; g.font = `800 26px ${HI}`; g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText('BANK’S LINE', 540, LINE_Y - 10); g.restore();
  }
  const st = s.stack, total = COL_H[0] + COL_H[1] + COL_H[2], red = s.over > 0;
  let acc = 0;
  for (let i = 0; i < 3; i++) {
    const a = s.cols[i]; if (!(a > 0)) continue;
    const h = COL_H[i] * E.outCubic(a), x = lerp(COL_X[i], 300, st), y0 = lerp(BASE_Y, BASE_Y - acc, st);
    g.save(); g.globalAlpha = Math.min(1, a * 1.5); g.fillStyle = red ? DRED : COL_C[i]; rr(g, x - COL_W / 2, y0 - h, COL_W, h, 10); g.fill();
    icon(g, i, x, lerp(BASE_Y + 62, y0 - h / 2, st), lerp(1, 0.7, st));
    const f = s.fine[i] * (1 - st); if (f > 0) { g.globalAlpha = f; g.fillStyle = P.mint; g.beginPath(); g.arc(x, y0 - h - 40, 24, 0, 7); g.fill(); check(g, x - 14, y0 - h - 54, 28, NAVY, 7); }
    g.restore(); acc += COL_H[i] * E.outCubic(a);
  }
  if (s.stamp > 0) { g.save(); g.globalAlpha = s.stamp; g.translate(300, 200); g.rotate(-0.12); g.scale(0.8 + 0.2 * s.stamp, 0.8 + 0.2 * s.stamp); g.strokeStyle = DRED; g.lineWidth = 8; rr(g, -150, -38, 300, 76, 12); g.stroke(); g.fillStyle = DRED; g.font = `800 48px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DECLINED', 0, 3); g.restore(); }
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawCard(g, s); cardMesh.material.map.needsUpdate = true;
}
function touchDot(g, x, y, rip) {
  g.save(); g.fillStyle = 'rgba(255,194,75,0.55)'; g.beginPath(); g.arc(x, y, 30, 0, 7); g.fill(); g.strokeStyle = AMBER; g.lineWidth = 5; g.stroke();
  if (rip >= 0) { g.globalAlpha = 1 - rip; g.strokeStyle = AMBER; g.lineWidth = 6; g.beginPath(); g.arc(x, y, 30 + 50 * rip, 0, 7); g.stroke(); }
  g.restore();
}
const YES = [74, 600, 400, 92], NO = [74, 714, 400, 80];
let screenKey = '';
function drawScreen(t) {
  const s = { done: q20(inv(Hh.unblock, Hh.unblock + 0.25, t)), dot: t >= Hh.tap - 0.5 && t < Hh.unblock + 0.3 ? 1 : 0, rip: t >= Hh.tap && t < Hh.tap + 0.45 ? q20((t - Hh.tap) / 0.45) : -1, pop: q20(inv(Hh.cut4 + 0.2, Hh.cut4 + 0.5, t)) };
  const key = JSON.stringify(s); if (key === screenKey) return; screenKey = key;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, SW, SH);
  tag(g, SW - 30, 30, 'EXAMPLE', NAVY, AMBER, 22);
  g.save(); g.globalAlpha = s.pop; g.translate(0, 30 * (1 - s.pop));
  g.fillStyle = '#16203A'; rr(g, 34, 120, SW - 68, 420, 30); g.fill();
  g.fillStyle = AMBER; g.beginPath(); g.arc(SW / 2, 200, 40, Math.PI, 0); g.lineTo(SW / 2 + 40, 228); g.lineTo(SW / 2 - 40, 228); g.closePath(); g.fill(); g.beginPath(); g.arc(SW / 2, 238, 10, 0, 7); g.fill();
  g.fillStyle = '#F4F7FB'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 52px ${HI}`; g.fillText('Was this you?', SW / 2, 315);
  g.font = `600 34px ${HI}`; g.fillStyle = 'rgba(244,247,251,0.75)'; g.fillText('Café, abroad', SW / 2, 385); g.font = `800 46px ${HI}`; g.fillStyle = '#F4F7FB'; g.fillText('€24.80', SW / 2, 450);
  if (s.done < 1) {
    g.fillStyle = P.mint; rr(g, ...YES, 46); g.fill(); g.fillStyle = NAVY; g.font = `800 38px ${HI}`; g.fillText('Yes, it was me', YES[0] + YES[2] / 2, YES[1] + YES[3] / 2 + 2);
    g.fillStyle = '#2A3550'; rr(g, ...NO, 40); g.fill(); g.fillStyle = '#F4F7FB'; g.font = `700 32px ${HI}`; g.fillText('No', NO[0] + NO[2] / 2, NO[1] + NO[3] / 2 + 2);
  }
  if (s.done > 0) { g.globalAlpha = s.done; g.fillStyle = P.mint; g.beginPath(); g.arc(SW / 2, 650, 56, 0, 7); g.fill(); check(g, SW / 2 - 30, 622, 60, NAVY, 12); g.fillStyle = '#F4F7FB'; g.font = `800 40px ${HI}`; g.fillText('Card unblocked', SW / 2, 760); }
  g.restore();
  if (s.dot) touchDot(g, YES[0] + YES[2] / 2, YES[1] + YES[3] / 2, s.rip);
  screenMesh.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ choreography
const CUST = { x: 0.05, z: 0.62, rotY: 30 };
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const OFF = { x: 1.8, z: 0.5, rotY: 0 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...CUST, headYaw: 8, headPitch: 10 } },
  { t: Hh.why - 0.3, p: {} },
  { t: Hh.why, e: 'outBack', p: { headRoll: 14, headYaw: 0, headPitch: 2 } },                     // "Why?"
  { t: Hh.cut1 - 0.01, p: {} },
  { t: Hh.cut1, p: { ...OFF, headRoll: 0 } },                                                      // (cut) the card
  { t: Hh.cut3 - 0.01, p: {} },
  { t: Hh.cut3, p: { ...CUST, headYaw: 8, headPitch: 10 } },                                       // (cut) declined again
  { t: Hh.falseLbl, e: 'outBack', p: { headRoll: -10, headYaw: -4 } },
  { t: Hh.cut4 - 0.01, p: {} },
  { t: Hh.cut4, p: { ...HOME2, headPitch: 14, headRoll: 0, headYaw: 0 } },                         // (cut) the phone
  { t: Hh.cut5 - 0.01, p: {} },
  { t: Hh.cut5, p: { ...CUST, headYaw: 8, headPitch: 10 } },                                       // (cut) pays again
  { t: Hh.approved + 0.1, p: {} },
  { t: Hh.approved + 0.4, e: 'outBack', p: { headRoll: 8, headPitch: 4 } },
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headPitch: -2, headRoll: 0, headYaw: 0 } },           // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const atCounter = (t) => t < Hh.cut1 || (t >= Hh.cut3 && t < Hh.cut4) || (t >= Hh.cut5 && t < Hh.cta);
const phoneOn = (t) => t >= Hh.cut4 && t < Hh.cut5;
const EXPR = [[-9, 'puzzled'], [Hh.cut3, 'skeptic'], [Hh.cut4, 'focus'], [Hh.unblock, 'happy'], [Hh.cut5, 'focus'], [Hh.approved, 'happy'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [2.3, 19.8, 22.6, 25.6, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, 0.0, 12) + kick(t, Hh.approved, 14) + 6 * Math.sin(t * 3.1);
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
function cardTarget(t) {                                           // hand B holds the card in front of the terminal (taps again to pay)
  const front = term.localToWorld(V(0.01, -0.085, 0.075)), near = term.localToWorld(V(0.01, -0.075, 0.035));   // below the screen, so it stays readable
  if (t >= Hh.cut5) { const k = E.inOutCubic(inv(Hh.cut5 + 0.05, Hh.payTap, t)) * (1 - E.inOutCubic(inv(Hh.approved + 0.3, Hh.approved + 0.8, t))); return front.lerp(near, k); }
  return front;
}
function labelAt(t) {
  if (t < Hh.cut1) return ['DECLINED ON HOLIDAY?', AMBER, NAVY];
  if (t >= Hh.scoreLbl && t < Hh.clues) return ['FRAUD SCORE', P.mint, NAVY];
  if (t >= Hh.clues && t < Hh.col[0]) return ['HUNDREDS OF CLUES', P.mint, NAVY];
  if (t >= Hh.fine && t < Hh.stack[0]) return ['ALONE: FINE', P.mint, NAVY];
  if (t >= Hh.over && t < Hh.cut3) return ['TOGETHER: TOO HIGH', AMBER, NAVY];
  if (t >= Hh.falseLbl && t < Hh.cut4) return ['FALSE ALARM', AMBER, NAVY];
  if (t >= Hh.confirmLbl && t < Hh.cut5) return ['CONFIRM IT WAS YOU', P.mint, NAVY];
  if (t >= Hh.approved && t < Hh.cta) return ['PAY AGAIN', P.mint, NAVY];
  return null;
}

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  const ctr = atCounter(t), ph = phoneOn(t);
  const props = !ph && t < Hh.cta; counter.visible = term.visible = props; payCard.visible = ctr; suitcase.visible = props;
  phone.visible = ph;
  if (ph) { const s = spot(p, V(0.0, 0.88, 0.36), -0.04); phone.position.copy(s.p); phone.quaternion.copy(s.q); scene.updateMatrixWorld(true); }
  if (ph) { solveArm(0, p, onPhone(-0.19, -0.06, 0), 1); solveArm(1, p, onPhone(0.19, -0.06, 0), 1); }
  else if (ctr) { solveArm(0, p, null, 0); solveArm(1, p, cardTarget(t), 1); }
  scene.updateMatrixWorld(true);
  if (ctr) { const h = V(); docket.handWorld(1, h); payCard.position.copy(h).add(V(0.0, 0.0, 0.03)); payCard.quaternion.copy(term.quaternion); window.DBG = { card: +h.distanceTo(cardTarget(t)).toFixed(3) }; }
  drawTerm(t); updateCard(t); if (ph) drawScreen(t);
  const lb = labelAt(t);
  if (lb) { const [txt, bg, fg] = lb; paintLabel(labelL, txt + bg, (g, W2, H2) => pill(g, W2, H2, txt, bg, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.1), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: 0 });
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const SHOP = [[0.02, 1.15, 3.0], [0.14, 0.8, 0.6]];
const PHONECAM = [[0.0, 1.16, 2.55], [0.0, 0.98, 0.9]];
const TERMCAM = [[0.0, 1.06, 1.38], [0.4, 0.95, 0.8]];
const CAM = [
  [0.0, ...SHOP], [Hh.cut1 - 0.01, [0.03, 1.14, 2.88], [0.14, 0.8, 0.6]],
  [Hh.cut1, ...LAB], [Hh.cut3 - 0.01, [-0.15, 1.13, 1.06], [-0.64, 1.13, -0.32]],
  [Hh.cut3, ...SHOP], [Hh.cut4 - 0.01, [0.03, 1.14, 2.88], [0.14, 0.8, 0.6]],
  [Hh.cut4, ...PHONECAM], [Hh.cut5 - 0.01, [0.0, 1.13, 2.4], [0.0, 0.95, 0.9]],
  [Hh.cut5, ...TERMCAM], [Hh.cta - 0.01, [0.03, 1.05, 1.32], [0.4, 0.95, 0.8]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.stamp, 0.005, 0.1, 40);
  cam.position.set(pos[0] + shake + 0.003 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.003 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: DOCKET, the card and a DECLINED terminal + "DECLINED ON HOLIDAY?"
window.renderThumb = () => {
  const t = 0.0; cameraAt(t); cam.position.set(0.02, 1.22, 3.1); cam.lookAt(0.14, 0.95, 0.6); stageAt(t); labelL.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 760);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['DECLINED', DRED, 400], ['ON HOLIDAY?', '#F4F7FB', 560]].forEach(([w, col, y]) => { let S = 170; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
