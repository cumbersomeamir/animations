// notice.js — Ideaverse production 30s feedback-05 #01 (Hindi): a long school notice → verified deadline-and-actions checklist.
// (Engine header below copied from hindi-04 label.js = hindi-03 eraser.js = accepted feedback-round renderer.)
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
function badge(g, x, y, r, txt, bg, fg) { g.save(); g.fillStyle = bg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = fg; g.font = `800 ${Math.round(r * 1.2)}px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y + 2); g.restore(); }

// ---- the fictional school notice (a wall of text with four key lines buried in it)
const NW = 600, NH = 800;
const BODY = [
  ['सभी अभिभावकों को सूचित किया जाता है कि', 0], ['विद्यालय की ओर से वार्षिक पिकनिक का', 0], ['आयोजन किया जा रहा है। सभी विद्यार्थी', 0],
  ['समय पर पहुँचें और अध्यापक के निर्देश मानें।', 0], ['पिकनिक 21 नवंबर को होगी।', 1], ['विद्यार्थी अपना पानी और हल्का नाश्ता', 0],
  ['साथ लाएँ। स्कूल की वर्दी पहनना अनिवार्य', 0], ['होगा। मोबाइल फ़ोन लाने की अनुमति नहीं।', 0], ['शुल्क ₹350, 14 नवंबर तक जमा करें।', 2],
  ['किसी भी जानकारी के लिए कक्षा अध्यापक से', 0], ['संपर्क करें। अभिभावकों से सहयोग अपेक्षित।', 0], ['सहमति-पत्र पर अभिभावक के हस्ताक्षर ज़रूरी।', 3],
  ['कार्यक्रम की जानकारी समय पर दी जाएगी।', 0], ['बस का समय बाद में बताया जाएगा।', 4], ['धन्यवाद। — प्रधानाचार्य', 0],
];
const KEYROW = { 1: 4, 2: 8, 3: 11, 4: 13 };            // key id → body row
const LINE_H = 40, BODY_Y = 196;
const rowY = (i, scroll = 0) => BODY_Y + i * LINE_H - scroll;
function drawNotice(g, s = {}) {
  const scroll = s.scroll || 0;
  g.fillStyle = '#FBF8F1'; g.fillRect(0, 0, NW, NH);
  g.save(); g.beginPath(); g.rect(0, 150, NW, NH - 210); g.clip();
  BODY.forEach(([txt, key], i) => {
    const y = rowY(i, scroll); if (y < 174 || y > NH - 40) return;
    const hl = key && s.hl && s.hl[key];
    if (hl > 0) { g.save(); g.globalAlpha = Math.min(1, hl); g.fillStyle = key === 4 ? 'rgba(255,194,75,0.55)' : key === 2 && s.deadline ? 'rgba(255,194,75,0.65)' : 'rgba(108,218,126,0.45)'; rr(g, 30, y - 22, 540 * Math.min(1, hl * 1.4), 42, 10); g.fill(); g.restore(); }
    g.fillStyle = key && (hl > 0) ? NAVY : 'rgba(27,35,51,0.78)'; g.font = `${key && hl > 0 ? 800 : 500} 27px ${HI}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, 40, y);
    const b = key && s.badge && s.badge[key];
    if (b > 0) { g.save(); g.globalAlpha = Math.min(1, b); if (key === 4) badge(g, 560, y, 22, '?', AMBER, NAVY); else { badge(g, 560, y, 22, String(key), P.mint, NAVY); } g.restore(); }
  });
  g.restore();
  // header (fixed)
  g.fillStyle = NAVY; rr(g, 0, 0, NW, 140, 0); g.fill();
  g.fillStyle = '#F4F7FB'; g.font = `800 50px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('विद्यालय सूचना', NW / 2, 56);
  g.fillStyle = P.mint; g.font = `700 32px ${HI}`; g.fillText('वार्षिक पिकनिक', NW / 2, 108);
  tag(g, NW - 30, NH - 62, 'उदाहरण', NAVY, AMBER, 24);
  if (s.missed > 0) {      // the missed-deadline stamp
    g.save(); g.globalAlpha = Math.min(1, s.missed); g.translate(NW / 2, 560); g.rotate(-0.16); const k = 1.5 - 0.5 * Math.min(1, s.missed); g.scale(k, k);
    g.strokeStyle = '#D9534F'; g.lineWidth = 9; rr(g, -190, -52, 380, 104, 18); g.stroke(); g.fillStyle = '#D9534F'; g.font = `800 64px ${HI}`; g.fillText('तारीख़ निकल गई', 0, 4); g.restore();
  }
  if (s.ask > 0) { const y = rowY(KEYROW[4], scroll); g.save(); g.globalAlpha = Math.min(1, s.ask); g.font = `800 32px ${HI}`; g.textAlign = 'center'; const w = g.measureText('स्कूल से पूछें').width + 36; g.fillStyle = AMBER; rr(g, NW / 2 - w / 2, y + 30, w, 54, 27); g.fill(); g.fillStyle = NAVY; g.textBaseline = 'middle'; g.fillText('स्कूल से पूछें', NW / 2, y + 58); g.restore(); }
}
// ---- the AI's checklist (other side of the easel card)
const LIST = [
  ['1', '21 नवंबर — पिकनिक', '“पिकनिक 21 नवंबर को होगी।”', P.mint],
  ['2', '₹350 — 14 नवंबर तक', '“शुल्क ₹350, 14 नवंबर तक जमा करें।”', P.mint],
  ['3', 'सहमति-पत्र पर हस्ताक्षर', '“…अभिभावक के हस्ताक्षर ज़रूरी।”', P.mint],
  ['?', 'बस का समय — पता नहीं', '“बाद में बताया जाएगा।”', AMBER],
];
function drawList(g, s = {}) {
  g.fillStyle = '#F4F7FB'; g.fillRect(0, 0, NW, NH);
  g.fillStyle = P.mint; rr(g, 0, 0, NW, 140, 0); g.fill();
  g.fillStyle = NAVY; g.font = `800 50px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('AI का जवाब', NW / 2, 56);
  g.font = `700 30px ${HI}`; g.fillText('तारीख़ · पैसे · काम', NW / 2, 108);
  LIST.forEach(([n, head, quote, col], i) => {
    const a = (s.rows || [])[i] || 0; if (a <= 0) return;
    const y = 196 + i * 140; g.save(); g.globalAlpha = Math.min(1, a); g.translate(0, 20 * (1 - Math.min(1, a)));
    g.fillStyle = col === AMBER ? 'rgba(255,194,75,0.22)' : 'rgba(108,218,126,0.16)'; rr(g, 24, y - 40, NW - 48, 124, 18); g.fill();
    badge(g, 64, y, 24, n, col, NAVY);
    g.fillStyle = NAVY; g.textAlign = 'left'; g.font = `800 34px ${HI}`; g.fillText(head, 104, y);
    g.fillStyle = 'rgba(27,35,51,0.7)'; g.font = `500 25px ${HI}`; g.fillText(quote, 104, y + 48);
    g.restore();
  });
  tag(g, NW - 30, NH - 62, 'उदाहरण', NAVY, AMBER, 24);
}

// ------------------------------------------------------------------ scene objects
let docket, cab, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh;
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: checklist icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 16; for (let i = 0; i < 3; i++) { check(mg, 150, 70 + i * 60, 34, P.mint, 9); mg.fillStyle = i === 2 ? AMBER : P.mint; mg.fillRect(210, 82 + i * 60, 160 - i * 30, 16); }
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  // ----- background cabinet (set dressing)
  cab = new THREE.Group(); cab.position.copy(CAB_POS); cab.rotation.y = CAB_YAW; scene.add(cab);
  const base = rbox(0.66, 0.1, 0.52, 0.02, mats.navy); base.position.y = 0.05; cab.add(base);
  const body = rbox(0.62, 0.92, 0.5, 0.05, mats.shell); body.position.y = 0.56; cab.add(body);
  for (const y of [0.575, 0.265]) { const f = rbox(0.58, 0.28, 0.04, 0.014, mats.shell); f.position.set(0, y, 0.27); cab.add(f); const h = rbox(0.22, 0.034, 0.034, 0.012, mats.mint); h.position.set(0, y + 0.075, 0.3); cab.add(h); }
  // ----- the easel with a two-sided card (notice ↔ AI checklist)
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW, NH); drawNotice(cardCanvas.getContext('2d'));
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.002); board.add(cardMesh);
  // ----- the phone (illustrative example screens; not any real app's UI)
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
function cardFace(t) { return (t >= Hh.flip1 + 0.15 && t < Hh.flip2 + 0.15) ? 'list' : 'notice'; }
function flipScale(t) { for (const f of [Hh.flip1, Hh.flip2]) if (t >= f && t < f + 0.3) return Math.abs(Math.cos(Math.PI * (t - f) / 0.3)); return 1; }
function cardState(t) {
  if (cardFace(t) === 'list') return { face: 'list', rows: Hh.rows.map((a) => q20(inv(a, a + 0.25, t))) };
  const scroll = Math.round(track([[0, 320], [1.7, 120, 'outCubic']], t));
  return { face: 'notice', scroll: t < 4 ? scroll : 120, deadline: t < 4,
    hl: { 2: q20(inv(Hh.buried, Hh.buried + 0.3, t)) * (t < 4 ? 1 : 0) + (t >= Hh.flip2 ? q20(inv(Hh.badges[1], Hh.badges[1] + 0.25, t)) : 0),
      1: t >= Hh.flip2 ? q20(inv(Hh.badges[0], Hh.badges[0] + 0.25, t)) : 0, 3: t >= Hh.flip2 ? q20(inv(Hh.badges[2], Hh.badges[2] + 0.25, t)) : 0, 4: t >= Hh.flip2 ? q20(inv(Hh.unclear, Hh.unclear + 0.25, t)) : 0 },
    badge: t >= Hh.flip2 ? { 1: q20(inv(Hh.badges[0], Hh.badges[0] + 0.25, t)), 2: q20(inv(Hh.badges[1], Hh.badges[1] + 0.25, t)), 3: q20(inv(Hh.badges[2], Hh.badges[2] + 0.25, t)), 4: q20(inv(Hh.unclear, Hh.unclear + 0.25, t)) } : {},
    missed: t < 4 ? q20(inv(Hh.missed, Hh.missed + 0.2, t)) : 0, ask: t >= Hh.flip2 ? q20(inv(Hh.ask, Hh.ask + 0.25, t)) : 0 };
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); if (s.face === 'list') drawList(g, s); else drawNotice(g, s); cardMesh.material.map.needsUpdate = true;
}
const INSTR = [['तारीख़ें, पैसे और ज़रूरी काम अलग करो।', Hh.type[0], Hh.type[1]], ['हर एक के साथ नोटिस की असली लाइन लिखो।', Hh.type[2], Hh.type[3]], ['साफ़ न हो तो अंदाज़ा नहीं — “पता नहीं” लिखो।', Hh.type[4], Hh.type[5]]];
const CHIPS = [['तारीख़ें', Hh.chips[0], P.mint], ['पैसे', Hh.chips[1], P.mint], ['ज़रूरी काम', Hh.chips[2], P.mint], ['असली लाइन', Hh.chips[3], P.mint], ['पता नहीं', Hh.chips[4], AMBER]];
function drawScreen(t) {
  const k = { paste: q20(inv(Hh.paste, Hh.paste + 0.5, t)), scrollP: Math.round(clamp((t - Hh.paste - 0.4) / 2) * 10), typed: INSTR.map(([s, a, b]) => q20(inv(a, b, t))), chips: CHIPS.map(([, a]) => q20(inv(a, a + 0.25, t))), sent: t >= Hh.send ? 1 : 0 };
  const key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'उदाहरण', NAVY, AMBER, 26);
  g.fillStyle = '#F4F7FB'; g.font = `700 34px ${HI}`; g.fillText('AI सहायक', 30, 108); g.fillStyle = 'rgba(244,247,251,0.15)'; g.fillRect(24, 136, SW - 48, 3);
  // the pasted notice: a tall bubble with tiny scrolling lines
  if (k.paste > 0) {
    g.save(); g.globalAlpha = k.paste; g.fillStyle = '#E9EFF2'; rr(g, 150, 160, 368, 300, 24); g.fill();
    g.save(); rr(g, 150, 160, 368, 300, 24); g.clip(); g.fillStyle = NAVY; g.fillRect(150, 160, 368, 44); g.fillStyle = '#F4F7FB'; g.font = `800 24px ${HI}`; g.fillText('विद्यालय सूचना', 170, 183);
    for (let i = 0; i < 22; i++) { const y = 224 + i * 20 - k.scrollP * 8; if (y < 210 || y > 450) continue; g.fillStyle = [4, 8, 11, 13].includes(i % 15) ? 'rgba(27,35,51,0.75)' : 'rgba(27,35,51,0.3)'; g.fillRect(172, y, 300 - ((i * 37) % 90), 9); }
    g.restore(); g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `600 24px ${HI}`; g.fillText('लंबा नोटिस · 15 लाइनें', 180, 486); g.restore();
  }
  // my instruction, typed line by line, then chips over its keywords
  if (k.typed.some((v) => v > 0)) {
    g.fillStyle = P.mint; rr(g, 30, 520, SW - 60, 300, 26); g.fill();
    g.fillStyle = NAVY; g.font = `700 30px ${HI}`;
    INSTR.forEach(([s], i) => { const n = Math.round(s.length * k.typed[i]); if (n <= 0) return; const words = s.slice(0, n); const brk = s.indexOf(' ', 18) > 0 && s.length > 24 ? s.lastIndexOf(' ', 22) : -1;
      const l1 = brk > 0 ? words.slice(0, Math.min(words.length, brk)) : words, l2 = brk > 0 && words.length > brk ? words.slice(brk + 1) : '';
      g.fillText(l1, 52, 562 + i * 88); if (l2) g.fillText(l2, 52, 600 + i * 88); });
  }
  // keyword chips row
  CHIPS.forEach(([s, , col], i) => { const a = k.chips[i]; if (a <= 0) return; const x = [36, 186, 296, 36, 236][i], y = i < 3 ? 866 : 936; g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(0.7 + 0.3 * a, 0.7 + 0.3 * a);
    g.font = `800 32px ${HI}`; const w = g.measureText(s).width + 32; g.fillStyle = '#16203A'; rr(g, 0, -28, w, 56, 28); g.fill(); g.strokeStyle = col; g.lineWidth = 4; g.stroke(); g.fillStyle = col; g.fillText(s, 16, 2); g.restore(); });
  if (k.sent) { g.fillStyle = P.mint; g.beginPath(); g.arc(SW - 70, 990, 32, 0, 7); g.fill(); g.fillStyle = NAVY; g.beginPath(); g.moveTo(SW - 84, 974); g.lineTo(SW - 52, 990); g.lineTo(SW - 84, 1006); g.closePath(); g.fill(); }
}

// ------------------------------------------------------------------ choreography
const OFF = { x: 0.3, z: 0.5, rotY: 6 };                 // clear of the easel close-up
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const SIDE = { x: -0.18, z: 0.42, rotY: -14 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...OFF, headPitch: 8 } },
  { t: 3.39, p: {} },
  { t: 3.4, p: { ...HOME2, headRoll: -14, headPitch: 6 } },                                   // (cut) reaction: puzzled tilt
  { t: 3.75, e: 'outBack', p: { headRoll: 10, headYaw: -12 } },                                 // head shake
  { t: 4.05, e: 'outBack', p: { headRoll: -6, headYaw: 10 } },
  { t: 4.3, p: { headRoll: 0, headYaw: 0, headPitch: 14 } },
  { t: 7.0, p: { headPitch: 22 } },
  { t: 8.2, p: { headPitch: 14 } },
  { t: 17.09, p: {} },
  { t: 17.1, p: { ...OFF } },                                                                  // (cut) easel close-up
  { t: 23.59, p: {} },
  { t: 23.6, p: { ...SIDE, headYaw: -28, headPitch: 2, aFwd: 66, aOut: 44, aBend: 10 } },     // (cut) points at the unclear line
  { t: 24.3, e: 'outBack', p: { headYaw: 6, headPitch: 10 } },
  { t: 24.6, p: { headPitch: 2 } }, { t: 24.85, p: { headPitch: 12 } },                         // nod
  { t: 25.24, p: {} },
  { t: 25.25, p: { ...HOME2, ...REST_ARMS, headPitch: -2, headYaw: 0 } },                       // (cut) CTA
  { t: 26.4, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.3, p: { bFwd: 120 } },
  { t: 29.0, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 1], [23.59, 1], [23.6, 0], [25.24, 0], [25.25, 1], [30.5, 1]], 1: [[-1, 1], [25.24, 1], [25.25, 0], [30.5, 0]] };
const EXPR = [[-9, 'neutral'], [3.4, 'puzzled'], [4.35, 'focus'], [6.0, 'happy'], [8.25, 'focus'], [12.4, 'happy'], [14.5, 'skeptic'], [17.1, 'happy'], [23.6, 'focus'], [24.3, 'proud'], [25.25, 'happy'], [28.4, 'proud']];
const BLINKS = [5.3, 9.6, 12.9, 15.8, 24.0, 27.3, 29.3];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, 3.4, 22) + kick(t, Hh.send, 12) + kick(t, 24.3, 12) + 6 * Math.sin(t * 3.1);
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
  const SHOW = spot(p, V(0.0, 1.02, 0.36), -0.06);
  const TYPE = spot(p, V(0.02, 0.84, 0.3), -0.55);
  const SIDEH = spot(p, V(0.22, 0.88, 0.3), -0.1, 0.12);
  const LOW = spot(p, V(-0.14, 0.62, 0.25), -0.4, 0.2);
  const segs = [[-1, TYPE], [4.34, TYPE], [4.35, SHOW], [6.99, SHOW], [7.0, TYPE], [8.24, TYPE], [8.25, SHOW], [23.59, SHOW], [23.6, SIDEH], [25.24, SIDEH], [25.25, LOW]];
  let i = 1; while (i < segs.length - 1 && t > segs[i][0]) i++;
  const [t0, A] = segs[i - 1], [t1, B] = segs[i], k = E.inOutCubic(inv(t0, t1, t));
  return { p: A.p.clone().lerp(B.p, k), q: A.q.clone().slerp(B.q, k) };
}
const onPhone = (x, y, z = 0.02) => phone.localToWorld(V(x, y, z));

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  cardMesh.scale.x = Math.max(0.02, flipScale(t));
  scene.updateMatrixWorld(true);
  const s = phoneSpotAt(t); phone.position.copy(s.p); phone.quaternion.copy(s.q);
  scene.updateMatrixWorld(true);
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  let tA = onPhone(-0.19, -0.06, 0), tB = onPhone(0.19, -0.06, 0);
  if (t >= 23.6 && t < 25.25) { tA = null; tB = onPhone(0.19, -0.08, 0); }
  if (t >= 25.25) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updateCard(t); drawScreen(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const INS = [[-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]];
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];   // square to the easel card, whole card below the caption band
const CAM = [
  [0.0, [-0.12, 1.13, 1.12], [-0.64, 1.13, -0.32]], [3.39, ...LAB],
  [3.4, [0.0, 1.24, 2.5], [-0.05, 1.05, 0.45]], [4.34, [0.0, 1.23, 2.38], [-0.05, 1.05, 0.45]],
  [4.35, ...INS], [6.99, [-0.03, 1.15, 1.9], [-0.03, 1.12, 0.88]],
  [7.0, [0.12, 1.12, 2.15], [0.0, 0.92, 0.5]], [8.24, [0.12, 1.11, 2.05], [0.0, 0.92, 0.5]],
  [8.25, ...INS], [17.09, [-0.03, 1.15, 1.82], [-0.03, 1.12, 0.88]],
  [17.1, ...LAB], [23.59, [-0.14, 1.13, 1.095], [-0.64, 1.13, -0.32]],
  [23.6, [0.05, 1.18, 2.15], [-0.32, 1.0, 0.0]], [25.24, [0.03, 1.17, 2.05], [-0.32, 1.0, 0.0]],
  [25.25, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.missed, 0.012, 0.1, 40) + kick(t, Hh.send, 0.005, 0.08, 40) + kick(t, Hh.flip1, 0.006, 0.08, 40) + kick(t, Hh.flip2, 0.006, 0.08, 40);
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
