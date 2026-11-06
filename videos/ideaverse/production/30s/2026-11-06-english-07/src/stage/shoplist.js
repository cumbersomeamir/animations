// shoplist.js — Ideaverse production 30s english-07 #01 (English): photo of a handwritten shopping list → checklist by aisle, checked.
// (Engine header below copied from english-06 livecaption.js = feedback-05 = accepted feedback-round renderer.)
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
const HAND = '"Caveat"';
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function check(g, x, y, s, col, lw) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y + s * 0.5); g.lineTo(x + s * 0.38, y + s * 0.88); g.lineTo(x + s, y); g.stroke(); g.restore(); }
function tag(g, x, y, txt, fg, bg, size = 26) { g.save(); g.textAlign = 'left'; g.font = `700 ${size}px ${HI}`; g.letterSpacing = '2px'; const w = g.measureText(txt).width + 30; g.fillStyle = bg; rr(g, x - w, y, w, size + 20, (size + 20) / 2); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, x - w + 15, y + (size + 20) / 2 + 2); g.restore(); }
function badge(g, x, y, r, txt, bg, fg) { g.save(); g.fillStyle = bg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = fg; g.font = `800 ${Math.round(r * 1.2)}px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y + 2); g.restore(); }

// ---- the handwritten note (fictional): 600 x 800 lined pad
const NW = 600, NH = 800;
const NOTE = [            // [text, rotation, x-jitter, kind]
  ['milk', -0.03, 0, ''], ['eggs ×', 0.02, 6, 'eggs'], ['bread', -0.02, -4, 'cross'], ['apples ×4', 0.03, 8, ''],
  ['spinach', -0.02, -2, ''], ['rice 1 kg', 0.025, 4, ''], ['tomatoes', -0.03, 2, ''], ['pasta', 0.02, -6, ''],
];
const NROW = (i) => 210 + i * 68;
const ROWOF = { eggs: 1, bread: 2 };
function drawNote(g, s = {}) {
  g.fillStyle = '#FFF6C9'; g.fillRect(0, 0, NW, NH);
  g.strokeStyle = 'rgba(80,130,200,0.28)'; g.lineWidth = 3; for (let y = 170; y < NH - 40; y += 68) { g.beginPath(); g.moveTo(20, y + 22); g.lineTo(NW - 20, y + 22); g.stroke(); }
  g.strokeStyle = 'rgba(220,90,90,0.45)'; g.beginPath(); g.moveTo(84, 0); g.lineTo(84, NH); g.stroke();
  g.fillStyle = '#23324F'; g.font = `700 70px ${HAND}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  g.save(); g.translate(110, 120); g.rotate(-0.04); g.fillText('shopping!!', 0, 0); g.restore();
  NOTE.forEach(([txt, rot, dx, kind], i) => {
    const y = NROW(i);
    const ok = s.ok && s.ok[i];
    if (s.hl && s.hl[i] > 0) { g.save(); g.globalAlpha = Math.min(1, s.hl[i]); g.fillStyle = kind === 'eggs' ? 'rgba(255,194,75,0.5)' : 'rgba(108,218,126,0.35)'; rr(g, 100, y - 52, 400, 66, 14); g.fill(); g.restore(); }
    g.save(); g.translate(120 + dx, y); g.rotate(rot); g.fillStyle = '#23324F'; g.font = `600 62px ${HAND}`; g.fillText(txt, 0, 0);
    if (kind === 'eggs') {           // the ambiguous digit: a 6 whose top loop nearly closes (could read as 8)
      const x0 = g.measureText(txt).width + 22; g.strokeStyle = '#23324F'; g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); g.ellipse(x0, -14, 14, 15, 0, 0, Math.PI * 2); g.stroke();                       // lower loop
      g.beginPath(); g.ellipse(x0 + 1, -42, 10, 13, 0, Math.PI * 0.62, Math.PI * 1.97); g.stroke();   // upper curl, open on the right: a 6 that could pass for an 8
    }
    if (kind === 'cross') { const w = g.measureText(txt).width; g.strokeStyle = '#23324F'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(-10, -18); g.quadraticCurveTo(w / 2, -30, w + 12, -16); g.stroke(); g.beginPath(); g.moveTo(-6, -8); g.quadraticCurveTo(w / 2, -20, w + 8, -6); g.stroke(); }
    g.restore();
    if (ok > 0) { g.save(); g.globalAlpha = Math.min(1, ok); badge(g, 540, y - 18, 22, kind === 'cross' ? '✕' : '✓', kind === 'cross' ? '#C9CED8' : P.mint, NAVY); g.restore(); }
  });
  const ring = (x, y, rx, ry, a, col) => { if (!(a > 0)) return; const k = 1.25 - 0.25 * Math.min(1, a); g.save(); g.globalAlpha = Math.min(1, a); g.strokeStyle = col; g.lineWidth = 9; g.shadowColor = col; g.shadowBlur = 18; g.beginPath(); g.ellipse(x, y, rx * k, ry * k, 0, 0, 7); g.stroke(); g.restore(); };
  ring(200, NROW(2) - 20, 120, 46, s.ringBread, AMBER);
  ring(314, NROW(1) - 26, 62, 52, s.ringEggs, AMBER);
  const chip = (x, y, txt, a, col) => { if (!(a > 0)) return; g.save(); g.globalAlpha = Math.min(1, a); g.font = `800 32px ${HI}`; const w = g.measureText(txt).width + 32; g.fillStyle = col; rr(g, x, y - 27, w, 54, 27); g.fill(); g.fillStyle = NAVY; g.textBaseline = 'middle'; g.fillText(txt, x + 16, y + 1); g.restore(); };
  chip(340, NROW(2) - 20, 'skipped', s.chipBread, '#C9CED8');
  chip(392, NROW(1) - 24, '6 or 8?', s.chipEggs, AMBER);
  tag(g, NW - 26, NH - 60, 'EXAMPLE', NAVY, AMBER, 22);
}
// ---- the organised checklist (other side of the card)
const GROUPS = [['PRODUCE', ['apples ×4', 'spinach', 'tomatoes']], ['DAIRY', ['milk', 'EGGS']], ['PANTRY', ['rice 1 kg', 'pasta']]];
function drawList(g, s = {}) {
  g.fillStyle = '#F4F7FB'; g.fillRect(0, 0, NW, NH);
  g.fillStyle = P.mint; rr(g, 0, 0, NW, 110, 0); g.fill();
  g.fillStyle = NAVY; g.font = `800 50px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Checklist by aisle', NW / 2, 58);
  g.textAlign = 'left'; let y = 160, row = 0;
  GROUPS.forEach(([aisle, items], gi) => {
    const a = (s.groups || [])[gi] || 0; if (a <= 0) { y += 52 + items.length * 52 + 14; row += items.length; return; }
    g.save(); g.globalAlpha = Math.min(1, a);
    g.fillStyle = NAVY; rr(g, 28, y - 24, 190, 44, 22); g.fill(); g.fillStyle = P.mint; g.font = `800 26px ${HI}`; g.letterSpacing = '3px'; g.fillText(aisle, 48, y); g.letterSpacing = '0px';
    y += 52;
    items.forEach((it) => {
      const isEgg = it === 'EGGS';
      g.strokeStyle = isEgg && !s.fixed ? AMBER : NAVY; g.lineWidth = 4; rr(g, 40, y - 18, 34, 34, 7); g.stroke();
      if (isEgg && s.fixed > 0) { g.save(); g.globalAlpha = Math.min(1, s.fixed); check(g, 44, y - 16, 26, P.mint, 6); g.restore(); }
      g.fillStyle = NAVY; g.font = `700 38px ${HI}`;
      if (isEgg) {
        if (s.fixed > 0) { g.save(); g.globalAlpha = Math.min(1, s.fixed); g.fillText('eggs ×6', 92, y); g.restore(); }
        if (!s.fixed || s.fixed < 1) { g.save(); g.globalAlpha = 1 - (s.fixed || 0); g.fillStyle = AMBER; rr(g, 86, y - 26, 330, 52, 14); g.fill(); g.fillStyle = NAVY; g.fillText('eggs ×6 or 8? ⚠', 96, y); g.restore(); }
      } else g.fillText(it, 92, y);
      y += 52; row++;
    });
    y += 14; g.restore();
  });
  if (s.skip > 0) { g.save(); g.globalAlpha = Math.min(1, s.skip) * 0.85; g.fillStyle = 'rgba(27,35,51,0.55)'; g.font = `600 30px ${HI}`; g.fillText('skipped: bread (crossed out)', 40, 724); g.restore(); }
  tag(g, NW - 26, NH - 60, 'EXAMPLE', NAVY, AMBER, 22);
}

// ------------------------------------------------------------------ scene objects
let docket, cab, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, flashGlow;
const CAB_POS = V(0.95, 0, -0.25), CAB_YAW = -0.4;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
let noteCanvas = null;      // static copy of the note for the phone photo
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
    mg.shadowColor = P.mint; mg.shadowBlur = 16; for (let i = 0; i < 3; i++) { check(mg, 150, 70 + i * 60, 34, P.mint, 9); mg.fillStyle = i === 1 ? AMBER : P.mint; mg.fillRect(210, 82 + i * 60, 160 - i * 30, 16); }
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  cab = new THREE.Group(); cab.position.copy(CAB_POS); cab.rotation.y = CAB_YAW; scene.add(cab);
  const base = rbox(0.66, 0.1, 0.52, 0.02, mats.navy); base.position.y = 0.05; cab.add(base);
  const body = rbox(0.62, 0.92, 0.5, 0.05, mats.shell); body.position.y = 0.56; cab.add(body);
  for (const y of [0.575, 0.265]) { const f = rbox(0.58, 0.28, 0.04, 0.014, mats.shell); f.position.set(0, y, 0.27); cab.add(f); const h = rbox(0.22, 0.034, 0.034, 0.012, mats.mint); h.position.set(0, y + 0.075, 0.3); cab.add(h); }
  // ----- the easel with a two-sided card (handwritten note ↔ checklist)
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW, NH); drawNote(cardCanvas.getContext('2d'));
  noteCanvas = canvas(NW, NH); drawNote(noteCanvas.getContext('2d'));
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // ----- the phone (illustrative example screens; not any real app's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  const lens = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 24), mats.mint)); lens.rotation.x = Math.PI / 2; lens.position.set(-0.08, 0.2, -0.019); phone.add(lens);
  flashGlow = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), glowMat('#ffffff')); flashGlow.position.set(-0.02, 0.2, -0.027); flashGlow.rotation.y = Math.PI; phone.add(flashGlow);
}

// ------------------------------------------------------------------ card + phone screen states (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
let cardKey = '', screenKey = '';
function cardFace(t) { return (t >= Hh.flip1 + 0.15 && t < Hh.flip2 + 0.15) ? 'list' : 'note'; }
function flipScale(t) { for (const f of [Hh.flip1, Hh.flip2]) if (t >= f && t < f + 0.3) return Math.abs(Math.cos(Math.PI * (t - f) / 0.3)); return 1; }
function cardState(t) {
  if (cardFace(t) === 'list') return { face: 'list', groups: Hh.groups.map((a) => q20(inv(a, a + 0.25, t))), skip: q20(inv(Hh.skip, Hh.skip + 0.25, t)) };
  const back = t >= Hh.flip2;
  return { face: 'note',
    ringBread: back ? 0 : q20(inv(Hh.ringBread, Hh.ringBread + 0.25, t)), chipBread: back ? 0 : q20(inv(Hh.chipBread, Hh.chipBread + 0.25, t)),
    ringEggs: back ? q20(inv(Hh.zoom - 0.5, Hh.zoom - 0.25, t)) : q20(inv(Hh.ringEggs, Hh.ringEggs + 0.25, t)), chipEggs: back ? 0 : q20(inv(Hh.chipEggs, Hh.chipEggs + 0.25, t)),
    ok: back ? NOTE.map((_, i) => q20(inv(Hh.match + i * 0.17, Hh.match + i * 0.17 + 0.2, t))) : null };
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); if (s.face === 'list') drawList(g, s); else drawNote(g, s); cardMesh.material.map.needsUpdate = true;
}
const INSTR = [['Turn this into a checklist', Hh.type[0], Hh.type[1]], ['grouped by supermarket aisle.', Hh.type[1], Hh.type[2]], ['Skip crossed-out items.', Hh.type[3], Hh.type[4]], ['Flag anything you can’t read.', Hh.type[5], Hh.type[6]]];
const CHIPS = [['Produce', Hh.chips[0], P.mint], ['Dairy', Hh.chips[0] + 0.15, P.mint], ['Pantry', Hh.chips[0] + 0.3, P.mint], ['✕ skip', Hh.chips[1], '#C9CED8'], ['? flag', Hh.chips[2], AMBER]];
function drawScreen(t) {
  const mode = t < Hh.zoom ? 'chat' : 'zoom';
  const k = { mode, photo: q20(inv(Hh.snap + 0.2, Hh.snap + 0.6, t)), typed: INSTR.map(([, a, b]) => q20(inv(a, b, t))), chips: CHIPS.map(([, a]) => q20(inv(a, a + 0.25, t))),
    zk: q20(inv(Hh.zoom, Hh.zoom + 0.6, t)), seen: q20(inv(Hh.seen, Hh.seen + 0.3, t)), fixed: q20(inv(Hh.fix, Hh.fix + 0.3, t)) };
  const key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'EXAMPLE', NAVY, AMBER, 24);
  if (mode === 'chat') {
    g.fillStyle = '#F4F7FB'; g.font = `700 34px ${HI}`; g.fillText('AI assistant', 30, 108); g.fillStyle = 'rgba(244,247,251,0.15)'; g.fillRect(24, 136, SW - 48, 3);
    if (k.photo > 0) { g.save(); g.globalAlpha = k.photo; g.fillStyle = P.mint; rr(g, SW - 250, 156, 222, 290, 22); g.fill(); g.save(); g.translate(SW - 139, 301); g.rotate(-0.04); g.drawImage(noteCanvas, -100, -133, 200, 266); g.restore(); g.restore(); }
    if (k.typed.some((v) => v > 0)) {
      g.fillStyle = P.mint; rr(g, 30, 470, SW - 60, 330, 26); g.fill(); g.fillStyle = NAVY; g.font = `700 32px ${HI}`;
      INSTR.forEach(([s], i) => { const n = Math.round(s.length * k.typed[i]); if (n > 0) g.fillText(s.slice(0, n), 54, 514 + i * 52 + (i >= 2 ? 30 : 0)); });
    }
    CHIPS.forEach(([s, , col], i) => { const a = k.chips[i]; if (a <= 0) return; const x = [36, 196, 320, 36, 196][i], y = i < 3 ? 846 : 916; g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(0.7 + 0.3 * a, 0.7 + 0.3 * a);
      g.font = `800 32px ${HI}`; const w = g.measureText(s).width + 32; g.fillStyle = '#16203A'; rr(g, 0, -28, w, 56, 28); g.fill(); g.strokeStyle = col; g.lineWidth = 4; g.stroke(); g.fillStyle = col; g.fillText(s, 16, 2); g.restore(); });
    return;
  }
  // zoom into the photo to settle the ambiguous digit, then fix the list
  g.fillStyle = '#F4F7FB'; g.font = `700 34px ${HI}`; g.fillText('Your photo', 30, 108);
  const zs = 1 + 1.6 * k.zk, cx = 300, cy = NROW(1) - 26;
  g.save(); rr(g, 24, 140, SW - 48, 520, 22); g.clip(); g.translate(SW / 2, 400); g.scale(zs * 0.82, zs * 0.82); g.translate(-(lerp(NW / 2, cx, k.zk)), -(lerp(NH / 2, cy, k.zk))); g.drawImage(noteCanvas, 0, 0); g.restore();
  if (k.seen > 0) { g.save(); g.globalAlpha = k.seen; g.strokeStyle = P.mint; g.lineWidth = 8; g.shadowColor = P.mint; g.shadowBlur = 16; g.beginPath(); g.arc(SW / 2 + 40, 400, 110, 0, 7); g.stroke(); g.restore();
    g.save(); g.globalAlpha = k.seen; g.fillStyle = P.mint; rr(g, SW / 2 - 130, 560, 260, 64, 32); g.fill(); g.fillStyle = NAVY; g.font = `800 38px ${HI}`; g.textAlign = 'center'; g.fillText('it’s a 6', SW / 2, 593); g.textAlign = 'left'; g.restore(); }
  g.fillStyle = '#16203A'; rr(g, 24, 690, SW - 48, 150, 22); g.fill();
  g.strokeStyle = k.fixed > 0.5 ? P.mint : AMBER; g.lineWidth = 5; rr(g, 52, 742, 46, 46, 9); g.stroke(); if (k.fixed > 0) { g.save(); g.globalAlpha = k.fixed; check(g, 57, 746, 36, P.mint, 7); g.restore(); }
  g.font = `800 44px ${HI}`; g.fillStyle = k.fixed > 0.5 ? '#F4F7FB' : AMBER; g.fillText(k.fixed > 0.5 ? 'eggs ×6' : 'eggs ×6 or 8? ⚠', 120, 766);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = `600 26px ${HI}`; g.fillText('DAIRY', 120, 718);
}

// ------------------------------------------------------------------ choreography
const OFF = { x: 0.3, z: 0.5, rotY: 6 };
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...OFF } },
  { t: 1.79, p: {} },
  { t: 1.8, p: { x: 0.12, z: 0.32, rotY: -62, headYaw: 0, headPitch: 4 } },                       // (cut) wide: side-on, aims the phone at the note
  { t: 2.3, e: 'outBack', p: { lean: -5 } },
  { t: 2.7, p: { lean: 0, headYaw: 0, headPitch: 12 } },
  { t: 3.59, p: {} },
  { t: 3.6, p: { ...HOME2, rotY: 6, headPitch: 12 } },
  { t: 12.39, p: {} },
  { t: 12.4, p: { ...OFF } },                                                                   // (cut) easel close-up
  { t: 20.99, p: {} },
  { t: 21.0, p: { ...HOME2, headPitch: 14 } },                                                   // (cut) phone insert (zoom/fix)
  { t: 25.39, p: {} },
  { t: 25.4, p: { ...REST_ARMS, headPitch: -2 } },                                               // (cut) CTA
  { t: 26.4, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.3, p: { bFwd: 120 } },
  { t: 29.0, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 1], [30.5, 1]], 1: [[-1, 1], [25.39, 1], [25.4, 0], [30.5, 0]] };
const EXPR = [[-9, 'neutral'], [1.8, 'focus'], [2.3, 'wow'], [2.7, 'happy'], [3.6, 'focus'], [8.4, 'determined'], [12.4, 'happy'], [21.0, 'focus'], [22.9, 'wow'], [23.6, 'proud'], [25.4, 'happy'], [28.4, 'proud']];
const BLINKS = [5.3, 9.6, 11.9, 22.4, 24.6, 27.3, 29.3];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.snap, 16) + kick(t, Hh.seen, 12) + kick(t, Hh.fix, 12) + 6 * Math.sin(t * 3.1);
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
  const AIM = spot(p, V(0.02, 1.0, 0.4), 0.05, Math.PI);           // screen toward DOCKET, camera toward the note
  const SHOW = spot(p, V(0.0, 1.02, 0.36), -0.06);
  const LOW = spot(p, V(-0.14, 0.62, 0.25), -0.4, 0.2);
  const segs = [[-1, AIM], [3.59, AIM], [3.6, SHOW], [25.39, SHOW], [25.4, LOW]];
  let i = 1; while (i < segs.length - 1 && t > segs[i][0]) i++;
  const [t0, A] = segs[i - 1], [t1, B] = segs[i], k = E.inOutCubic(inv(t0, t1, t));
  return { p: A.p.clone().lerp(B.p, k), q: A.q.clone().slerp(B.q, k) };
}
const onPhone = (x, y, z = 0.02) => phone.localToWorld(V(x, y, z));

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  // the note lands: flies in crumpled (squashed, spinning) and smooths out on the easel
  const land = E.outBack(inv(0.0, 0.5, t)), flat = E.outCubic(inv(0.4, 0.85, t));
  cardMesh.position.set(0.38 * (1 - land), 1.0 + 0.12 * (1 - land), 0.004 + 0.18 * Math.max(0, 1 - E.outCubic(inv(0.0, 0.5, t))));
  cardMesh.rotation.set(0.5 * (1 - land), 0, 0.6 * (1 - land) - 0.04 * (1 - flat) * Math.sin(t * 20));
  cardMesh.scale.set(Math.max(0.02, flipScale(t)) * (0.55 + 0.45 * flat), 0.45 + 0.55 * flat, 1);
  scene.updateMatrixWorld(true);
  const s = phoneSpotAt(t); phone.position.copy(s.p); phone.quaternion.copy(s.q);
  scene.updateMatrixWorld(true);
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  let tA = onPhone(-0.19, -0.06, 0), tB = onPhone(0.19, -0.06, 0);
  if (t < 3.6) { tA = onPhone(0.19, -0.06, 0); tB = onPhone(-0.19, -0.06, 0); }               // phone turned round (lens to the note)
  if (t >= 25.4) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  const fl = t >= Hh.snap ? Math.max(0, 1 - (t - Hh.snap) / 0.25) : 0; flashGlow.material.opacity = fl;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updateCard(t); drawScreen(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const INS = [[-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]];
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const CAM = [
  [0.0, [-0.13, 1.13, 1.1], [-0.64, 1.13, -0.32]], [1.79, ...LAB],
  [1.8, [0.42, 1.22, 2.3], [-0.26, 1.02, 0.0]], [3.59, [0.4, 1.21, 2.18], [-0.26, 1.02, 0.0]],
  [3.6, ...INS], [12.39, [-0.03, 1.15, 1.84], [-0.03, 1.12, 0.88]],
  [12.4, ...LAB], [20.99, [-0.15, 1.13, 1.08], [-0.64, 1.13, -0.32]],
  [21.0, ...INS], [25.39, [-0.03, 1.15, 1.86], [-0.03, 1.12, 0.88]],
  [25.4, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, 0.5, 0.01, 0.1, 40) + kick(t, Hh.snap, 0.006, 0.08, 40) + kick(t, Hh.flip1, 0.006, 0.08, 40) + kick(t, Hh.fix, 0.006, 0.08, 40);
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
  await Promise.all(['600 40px "Caveat"', '700 40px "Caveat"'].map((f) => document.fonts.load(f, 'shopping eggs 6')));
  const img = new Image(); img.src = '/assets/icon.png'; await img.decode(); ICON = img;
  try { const r = await fetch('/voice.json'); if (r.ok) VOICE = await r.json(); } catch (e) { /* no lip-sync data */ }
  buildStage();
  window.renderAt(0);
  return document.fonts.check('600 40px "Caveat"') && document.fonts.check('700 40px "Space Grotesk"') && document.fonts.check('700 40px "Noto Sans Devanagari"', 'हिन्दी');
})();
