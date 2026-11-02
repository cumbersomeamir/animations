// spam.js — Ideaverse production 30s feedback-01 "AI you use daily — how spam filters learn to sort email".
// Built on the education pilot-01 engine (same renderer, lights, newsroom stage, materials, camera system and DOCKET
// rig); only the props and choreography are new. Every frame is a pure function of t (window.renderAt).
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
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function flagIcon(g, x, y, s, col) { g.save(); g.fillStyle = col; g.fillRect(x, y, s * 0.12, s); g.beginPath(); g.moveTo(x + s * 0.12, y); g.lineTo(x + s * 0.8, y + s * 0.2); g.lineTo(x + s * 0.12, y + s * 0.45); g.closePath(); g.fill(); g.restore(); }
function check(g, x, y, s, col, lw) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y + s * 0.5); g.lineTo(x + s * 0.38, y + s * 0.88); g.lineTo(x + s, y); g.stroke(); g.restore(); }
function exampleTag(g, x, y) { g.save(); g.font = '700 30px "JetBrains Mono"'; g.letterSpacing = '4px'; const w = g.measureText('EXAMPLE').width + 34; g.fillStyle = 'rgba(27,35,51,0.10)'; rr(g, x - w, y, w, 48, 24); g.fill(); g.fillStyle = 'rgba(27,35,51,0.62)'; g.textBaseline = 'middle'; g.fillText('EXAMPLE', x - w + 17, y + 25); g.restore(); }
function envelopeBase(g, w, h, stripe) {
  g.fillStyle = PAPER; g.fillRect(0, 0, w, h);
  g.fillStyle = stripe; g.fillRect(0, 0, w, 14);                                  // coloured top edge
  g.strokeStyle = 'rgba(27,35,51,0.10)'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
}
// big envelope fronts (1024 x 698 ≈ 0.44 x 0.30 m). Fictional senders + .example links only.
const EW = 1024, EH = 698;
const E1_SPOTS = { link: [52, 388, 640, 84], sales: [40, 486, 880, 84], flags: [40, 588, 640, 84] };
function drawE1(g, found) {
  envelopeBase(g, EW, EH, AMBER);
  g.textBaseline = 'alphabetic'; g.letterSpacing = '0px';
  g.font = '700 38px "JetBrains Mono"'; g.fillStyle = 'rgba(27,35,51,0.7)'; g.fillText('FROM: Prize Center', 52, 84);
  exampleTag(g, EW - 40, 46);
  g.font = '700 150px "Space Grotesk"'; g.fillStyle = NAVY; g.fillText('YOU WON!!!', 46, 240);
  g.fillStyle = AMBER; rr(g, 52, 272, 420, 92, 20); g.fill(); g.fillStyle = NAVY; g.font = '700 66px "Space Grotesk"'; g.fillText('CLAIM NOW', 80, 342);
  // suspicious link
  g.font = '700 46px "JetBrains Mono"'; g.fillStyle = LINK; g.fillText('claim-prize.example/win', 70, 446); g.fillRect(70, 456, g.measureText('claim-prize.example/win').width, 5);
  // repeated sales language
  g.font = '700 60px "Space Grotesk"'; g.fillStyle = NAVY; g.fillText('BUY NOW · BUY NOW · BUY NOW', 56, 548);
  // reported by people
  for (let i = 0; i < 3; i++) flagIcon(g, 64 + i * 64, 604, 54, i === 1 ? NAVY : '#C8423B');
  g.font = '700 46px "Space Grotesk"'; g.fillStyle = NAVY; g.fillText('Reported as spam', 270, 648);
  for (const [k, on] of Object.entries(found)) {
    if (on <= 0) continue; const [x, y, w, h] = E1_SPOTS[k];
    g.save(); g.globalAlpha = Math.min(1, on); g.strokeStyle = '#E79A12'; g.lineWidth = 12 + 6 * Math.max(0, 1 - on * 3) ; g.shadowColor = AMBER; g.shadowBlur = 24;
    rr(g, x - 10 - 20 * (1 - Math.min(1, on)), y - 6, w + 20 + 40 * (1 - Math.min(1, on)), h + 12, 22); g.stroke(); g.restore();
  }
}
function drawE3(g) {
  envelopeBase(g, EW, EH, P.mint);
  g.textBaseline = 'alphabetic'; g.letterSpacing = '0px';
  g.font = '700 38px "JetBrains Mono"'; g.fillStyle = 'rgba(27,35,51,0.7)'; g.fillText('FROM: Sam', 52, 84);
  exampleTag(g, EW - 40, 46);
  g.font = '700 128px "Space Grotesk"'; g.fillStyle = NAVY; g.fillText('Team lunch', 46, 246); g.fillText('on Friday?', 46, 384);
  g.font = '500 54px "Space Grotesk"'; g.fillStyle = 'rgba(27,35,51,0.82)'; g.fillText('Hi! Are you free at 12?', 52, 500);
  g.fillText('Same café as last time.', 52, 574);
}
function drawE4(g) {
  envelopeBase(g, EW, EH, '#8FA3C7');
  g.textBaseline = 'alphabetic'; g.letterSpacing = '0px';
  g.font = '700 38px "JetBrains Mono"'; g.fillStyle = 'rgba(27,35,51,0.7)'; g.fillText('FROM: Hiring Team', 52, 84);
  exampleTag(g, EW - 40, 46);
  g.font = '700 120px "Space Grotesk"'; g.fillStyle = NAVY; g.fillText('Job interview:', 46, 236); g.fillText('please confirm', 46, 368);
  g.font = '500 52px "Space Grotesk"'; g.fillStyle = 'rgba(27,35,51,0.82)'; g.fillText('Reply to book your time slot.', 52, 476);
  g.font = '700 44px "JetBrains Mono"'; g.fillStyle = LINK; g.fillText('careers.example/interview', 56, 566); g.fillRect(56, 576, g.measureText('careers.example/interview').width, 5);
}
// mini example envelopes for the clusters (256 x 174)
const SPAMMY = ['FREE!!!', 'BUY NOW', 'WIN $$$', 'CLICK!!', 'LAST CALL', 'CLAIM IT', 'ACT NOW', 'PRIZE!!', 'OFFER!!'];
const NORMAL = ['Hi Mum', 'Lunch?', 'Notes', 'Photos', 'Receipt', 'Homework', 'Thanks!', 'Agenda', 'Trip plan'];
function drawMini(g, spam, text) {
  envelopeBase(g, 256, 174, spam ? AMBER : P.mint);
  g.textBaseline = 'alphabetic'; g.font = `700 ${spam ? 46 : 44}px "Space Grotesk"`; g.fillStyle = NAVY; g.fillText(text, 18, 82);
  if (spam) { g.font = '700 22px "JetBrains Mono"'; g.fillStyle = LINK; g.fillText('win.example/…', 18, 124); g.fillRect(18, 129, 170, 3); flagIcon(g, 206, 108, 34, '#C8423B'); }
  else { g.fillStyle = 'rgba(27,35,51,0.35)'; g.fillRect(18, 108, 150, 10); g.fillRect(18, 132, 110, 10); check(g, 196, 112, 40, '#2FA052', 9); }
}

// ------------------------------------------------------------------ scene objects
let docket, cab, gaugeNeedle, reader, scanBar, inboxDr, spamDr, inboxGlow, spamGlow, gaugeGlowHi, gaugeGlowLo;
let ghost, env1, env3, env4, e1Canvas, e1State = '', mag, lensCanvas, lensMesh, sticker, minis = [], clusterHalo = [], clusterLabels = [];
const CAB_POS = V(0.5, 0, 0.1), CAB_YAW = -0.22;

function makeEnvelope(draw, w = 0.44, h = 0.3, cw = EW, chh = EH) {
  const g = new THREE.Group();
  const body = rbox(w, h, 0.014, 0.006, mats.paper); g.add(body);
  const c = canvas(cw, chh); draw(c.getContext('2d'));
  const front = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.985, h * 0.98), paperFace(c)); front.position.z = 0.0075; front.receiveShadow = true; g.add(front);
  // back flap lines
  const bc = canvas(256, 174), bg = bc.getContext('2d'); bg.fillStyle = PAPER; bg.fillRect(0, 0, 256, 174); bg.strokeStyle = 'rgba(27,35,51,0.25)'; bg.lineWidth = 5; bg.beginPath(); bg.moveTo(4, 6); bg.lineTo(128, 100); bg.lineTo(252, 6); bg.stroke();
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.985, h * 0.98), paperFace(bc)); back.position.z = -0.0075; back.rotation.y = Math.PI; g.add(back);
  g.userData = { canvas: c, front, w, h };
  scene.add(g); return g;
}
function makeCabDrawer(yC, label, bg) {
  const g = new THREE.Group(); g.position.set(0, yC, 0.23); cab.add(g);
  const face = rbox(0.58, 0.28, 0.04, 0.014, mats.shell); face.position.z = 0.02; g.add(face);
  const handle = rbox(0.22, 0.034, 0.034, 0.012, mats.mint); handle.position.set(0, 0.075, 0.056); g.add(handle);
  const lab = labelPlane(THREE, label, 0.3, 0.085, NAVY, bg); lab.position.set(0, -0.045, 0.0415); g.add(lab);
  const oc = canvas(512, 192), og = oc.getContext('2d'); og.strokeStyle = bg; og.lineWidth = 16; og.shadowColor = bg; og.shadowBlur = 22; og.beginPath(); og.roundRect(18, 18, 476, 156, 34); og.stroke();
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.15), new THREE.MeshBasicMaterial({ map: cvTex(oc), transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); glow.position.set(0, -0.045, 0.043); g.add(glow);
  const tray = new THREE.Group(); g.add(tray);
  for (const [w, h, d, x, y, z] of [[0.53, 0.012, 0.42, 0, -0.12, -0.21], [0.012, 0.17, 0.42, -0.265, -0.04, -0.21], [0.012, 0.17, 0.42, 0.265, -0.04, -0.21], [0.53, 0.17, 0.012, 0, -0.04, -0.42]]) {
    const m = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats.steel)); m.position.set(x, y, z); tray.add(m);
  }
  const rec = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.26), mats.recess); rec.position.set(0, yC, 0.2515); cab.add(rec);
  g.userData = { glow, lab };
  return g;
}
function buildStage() {
  // floor + back wall (pilot)
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
  // wall monitors: icons only (envelope / sorted lines) — décor, no text
  for (const [x, y, icon] of [[-1.25, 1.35, 'mail'], [1.45, 1.5, 'sort']]) {
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.strokeStyle = P.mint; mg.fillStyle = P.mint; mg.lineWidth = 14; mg.lineJoin = 'round'; mg.shadowColor = P.mint; mg.shadowBlur = 16;
    if (icon === 'mail') { mg.strokeRect(146, 80, 220, 140); mg.beginPath(); mg.moveTo(146, 80); mg.lineTo(256, 160); mg.lineTo(366, 80); mg.stroke(); }
    else { for (let i = 0; i < 4; i++) { mg.fillStyle = i === 2 ? AMBER : P.mint; mg.fillRect(130, 70 + i * 44, 250 - (i % 2) * 70, 22); } }
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  // DOCKET (unchanged pilot rig)
  docket = createDocket(THREE); scene.add(docket.root);

  // ----- MAIL SORTER cabinet: SPAM SCORE gauge panel, INBOX + SPAM drawers, letter reader on top
  cab = new THREE.Group(); cab.position.copy(CAB_POS); cab.rotation.y = CAB_YAW; scene.add(cab);
  const base = rbox(0.66, 0.1, 0.52, 0.02, mats.navy); base.position.y = 0.05; cab.add(base);
  const body = rbox(0.62, 0.92, 0.5, 0.05, mats.shell); body.position.y = 0.56; cab.add(body);
  const capTop = rbox(0.64, 0.03, 0.52, 0.01, mats.mint); capTop.position.y = 1.025; cab.add(capTop);
  // gauge panel
  const gp = rbox(0.56, 0.25, 0.02, 0.02, mats.navy); gp.position.set(0, 0.87, 0.255); cab.add(gp);
  const gd = canvas(640, 286), gg = gd.getContext('2d');
  gg.fillStyle = '#0E1424'; gg.beginPath(); gg.roundRect(0, 0, 640, 286, 24); gg.fill();
  gg.lineWidth = 22; gg.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const a = Math.PI * (1.08 + i * 0.096); gg.strokeStyle = i < 3 ? P.mint : i < 6 ? '#8B93A6' : AMBER; gg.beginPath(); gg.arc(320, 262, 200, a, a + 0.07); gg.stroke(); }
  gg.font = '700 44px "JetBrains Mono"'; gg.textAlign = 'center'; gg.fillStyle = P.mint; gg.fillText('LOW', 80, 274); gg.fillStyle = AMBER; gg.fillText('HIGH', 556, 274);
  gg.fillStyle = '#E9EFF2'; gg.font = '700 34px "JetBrains Mono"'; gg.letterSpacing = '5px'; gg.fillText('SPAM SCORE', 320, 160);
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.53, 0.237), new THREE.MeshBasicMaterial({ map: cvTex(gd), toneMapped: false })); dial.position.set(0, 0.87, 0.266); cab.add(dial);
  gaugeNeedle = new THREE.Group(); gaugeNeedle.position.set(0, 0.87 - 0.1185 + 0.237 * (24 / 286), 0.27); cab.add(gaugeNeedle);
  const nd = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.15, 0.004), new THREE.MeshBasicMaterial({ color: '#FFFFFF' })); nd.position.y = 0.075; gaugeNeedle.add(nd);
  const hub = new THREE.Mesh(new THREE.CircleGeometry(0.02, 24), new THREE.MeshBasicMaterial({ color: P.mint })); hub.position.z = 0.003; gaugeNeedle.add(hub);
  gaugeGlowHi = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), glowMat(AMBER)); gaugeGlowHi.position.set(0.2, 0.772, 0.268); cab.add(gaugeGlowHi);
  gaugeGlowLo = new THREE.Mesh(new THREE.CircleGeometry(0.06, 24), glowMat(P.mint)); gaugeGlowLo.position.set(-0.2, 0.772, 0.268); cab.add(gaugeGlowLo);
  // drawers
  inboxDr = makeCabDrawer(0.575, 'INBOX', P.mint);
  spamDr = makeCabDrawer(0.265, 'SPAM', AMBER);
  inboxGlow = inboxDr.userData.glow; spamGlow = spamDr.userData.glow;
  // reader (letter stand) on top: lip + slanted back rest + mint scan strip
  reader = new THREE.Group(); reader.position.set(0, 1.04, 0.1); cab.add(reader);
  const lip = rbox(0.52, 0.035, 0.12, 0.01, mats.navy); lip.position.set(0, 0, 0.04); reader.add(lip);
  const rest = rbox(0.5, 0.26, 0.02, 0.01, mats.navy); rest.position.set(0, 0.13, -0.06); rest.rotation.x = -20 * D2R; reader.add(rest);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.02), mats.mint); strip.position.set(0, 0.022, 0.095); reader.add(strip);
  scanBar = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.022), glowMat(P.mint)); scene.add(scanBar);

  // ----- envelopes
  env1 = makeEnvelope((g) => drawE1(g, {})); e1Canvas = env1.userData.canvas;
  env3 = makeEnvelope(drawE3); env4 = makeEnvelope(drawE4);
  // NOT SPAM sticker (child of env4)
  const sc = canvas(560, 200), sg = sc.getContext('2d');
  sg.fillStyle = P.mint; sg.beginPath(); sg.roundRect(6, 6, 548, 188, 28); sg.fill();
  sg.strokeStyle = NAVY; sg.lineWidth = 7; sg.setLineDash([20, 12]); sg.beginPath(); sg.roundRect(22, 22, 516, 156, 18); sg.stroke(); sg.setLineDash([]);
  check(sg, 52, 66, 66, NAVY, 16);
  sg.fillStyle = NAVY; sg.font = '700 84px "Space Grotesk"'; sg.textBaseline = 'middle'; sg.fillText('NOT SPAM', 150, 104);
  sticker = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.089), new THREE.MeshBasicMaterial({ map: cvTex(sc), transparent: true, toneMapped: false, depthWrite: false }));
  scene.add(sticker);
  // older mail already in the drawers (lying flat)
  const flat = (dr, spam, txt, x, z, rz, y) => { const m = makeEnvelope((g) => drawMini(g, spam, txt), 0.3, 0.204, 256, 174); scene.remove(m); dr.add(m); m.position.set(x, -0.105 + y, z); m.rotation.set(-Math.PI / 2, 0, rz); };
  flat(inboxDr, false, 'Photos', -0.1, -0.24, 0.18, 0); flat(inboxDr, false, 'Agenda', 0.1, -0.2, -0.12, 0.003);
  flat(spamDr, true, 'FREE!!!', -0.09, -0.25, -0.2, 0); flat(spamDr, true, 'ACT NOW', 0.1, -0.2, 0.15, 0.003);
  // missing-letter ghost (dashed amber outline + '?') floating over the INBOX tray during the search
  const gc = canvas(512, 348), gq = gc.getContext('2d'); gq.strokeStyle = AMBER; gq.lineWidth = 14; gq.setLineDash([34, 22]); gq.shadowColor = AMBER; gq.shadowBlur = 16;
  gq.beginPath(); gq.roundRect(14, 14, 484, 320, 26); gq.stroke(); gq.setLineDash([]); gq.beginPath(); gq.moveTo(20, 20); gq.lineTo(256, 190); gq.lineTo(492, 20); gq.stroke();
  gq.fillStyle = AMBER; gq.font = '700 150px "Space Grotesk"'; gq.textAlign = 'center'; gq.textBaseline = 'middle'; gq.fillText('?', 256, 250);
  ghost = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.204), new THREE.MeshBasicMaterial({ map: cvTex(gc), transparent: true, depthWrite: false, toneMapped: false })); inboxDr.add(ghost);
  // ----- clusters of examples (18 minis, two groups) at screen-left of the stage
  for (let i = 0; i < 18; i++) {
    const spam = i % 2 === 0, j = Math.floor(i / 2), txt = spam ? SPAMMY[j] : NORMAL[j];
    const m = makeEnvelope((g) => drawMini(g, spam, txt), 0.17, 0.1156, 256, 174);
    m.userData.spam = spam; m.userData.slot = j; minis.push(m);
  }
  for (const [spam, y] of [[true, CLU.spamY], [false, CLU.normY]]) {
    const hc = canvas(512, 384), hg = hc.getContext('2d'); hg.strokeStyle = spam ? AMBER : P.mint; hg.lineWidth = 10; hg.shadowColor = hg.strokeStyle; hg.shadowBlur = 18; hg.beginPath(); hg.roundRect(14, 14, 484, 356, 40); hg.stroke();
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.51), new THREE.MeshBasicMaterial({ map: cvTex(hc), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    halo.position.set(CLU.x, y, CLU.z - 0.03); scene.add(halo); clusterHalo.push(halo);
    const lab = labelPlane(THREE, spam ? 'LOOKS LIKE SPAM' : 'LOOKS NORMAL', 0.5, 0.075, NAVY, spam ? AMBER : P.mint);
    lab.position.set(CLU.x, y - 0.3, CLU.z); scene.add(lab); clusterLabels.push(lab);
  }
  // ----- magnifier (lens shows a zoomed crop of the envelope beneath it)
  mag = new THREE.Group(); scene.add(mag);
  const ring = sh(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.014, 14, 48), mats.navy)); mag.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.005, 8, 48), mats.mint); ring2.position.z = 0.012; mag.add(ring2);
  lensCanvas = canvas(384, 384);
  lensMesh = new THREE.Mesh(new THREE.CircleGeometry(0.104, 48), new THREE.MeshBasicMaterial({ map: cvTex(lensCanvas), toneMapped: false, transparent: true }));
  lensMesh.position.z = 0.002; mag.add(lensMesh);
  const hdl = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.17, 14), mats.navy));
  const hdlEnd = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.03, 14), mats.mint));
  const hg = new THREE.Group(); mag.add(hg);
  hg.rotation.z = Math.atan2(-MAG_DIR.x, MAG_DIR.y);
  hdl.position.y = 0.124 + 0.085; hdlEnd.position.y = 0.124 + 0.17; hg.add(hdl, hdlEnd);
}
const CLU = { x: -0.95, z: -0.15, spamY: 1.2, normY: 0.6 };
const MAG_DIR = new THREE.Vector2(-0.55, -0.835).normalize();   // handle direction in envelope plane

// ------------------------------------------------------------------ choreography
const HOOK = { x: -0.18, z: 0.42, rotY: 10 };
const CABP = { x: -0.2, z: 0.62, rotY: 55 };
const CLUP = { x: -0.26, z: 0.28, rotY: -42 };
const HOLD2 = { x: -0.12, z: 0.62, rotY: 14 };
const CTA = { x: -0.06, z: 0.62, rotY: 6 };
const CABN = { x: -0.12, z: 0.57, rotY: 52 };   // close in for magnifier + sorting
const PULL = { x: -0.14, z: 0.76, rotY: 62 };   // stepping back with a drawer pull
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...HOOK, crouch: 0.3, lean: 6, aFwd: 70, aOut: 16, aBend: 30, bFwd: 70, bOut: 16, bBend: 30, headYaw: -14, headPitch: -18 } },
  { t: 0.45, p: {} },
  { t: 0.6, e: 'outQuad', p: { crouch: 0.58, lean: 12, headPitch: 4, headYaw: -4 } },
  { t: 0.95, e: 'outBack', p: { crouch: 0.1, lean: -3, headPitch: -2, headYaw: 0 } },
  { t: 1.25, p: { headRoll: -13, headYaw: -8, headPitch: 4 } },
  { t: 1.85, p: { headRoll: 0, headYaw: 0 } },
  { t: 2.45, e: 'inOutCubic', p: { ...CABP, crouch: 0.05, lean: 4, headPitch: -12 } },
  { t: 2.7, p: { crouch: 0.02, lean: 0, headPitch: -6 } },
  // examples: walk to the left, point at the forming clusters
  { t: 3.1, e: 'inOutCubic', p: { ...CLUP, headPitch: -8, headYaw: -6, ...REST_ARMS } },
  { t: 3.45, e: 'outBack', p: { aFwd: 72, aOut: 30, aBend: 8, headPitch: -10 } },
  { t: 4.3, p: { headPitch: -2, headYaw: 4, aFwd: 64 } },
  { t: 5.05, p: { headPitch: 4, headYaw: -2, aFwd: 30, aOut: 14, aBend: 30 } },
  { t: 5.25, e: 'outBack', p: { lean: -4, aFwd: 10, aOut: 10, aBend: 14 } },
  // back to the sorter, magnifier out of NOTES
  { t: 5.85, e: 'inOutCubic', p: { ...CABN, lean: 0, headPitch: -14, headYaw: -10 } },
  { t: 5.95, p: { notes: 1 } },
  { t: 6.2, p: { notes: 0 } },
  { t: 7.3, p: { headPitch: -10, headYaw: -4 } },
  { t: 8.9, p: { headPitch: -6, headYaw: -10 } },
  { t: 10.15, p: { headPitch: -12 } },
  { t: 10.35, p: { notes: 1 } },
  { t: 10.6, p: { notes: 0, ...REST_ARMS, bFwd: 20, bBend: 30 } },
  { t: 11.85, p: { headPitch: 14, headYaw: 6 } },      // looks down at the gauge
  { t: 12.4, p: { headPitch: 6, headYaw: 0 } },
  // sort E1 into SPAM
  { t: 13.35, p: { headPitch: -10, crouch: 0.05 } },
  { t: 13.8, e: 'inOutCubic', p: { crouch: 0.45, lean: 16, headPitch: 18 } },
  { t: 14.1, e: 'outBack', p: { crouch: 0.12, lean: 2, headPitch: -6 } },
  // E3 into INBOX
  { t: 14.95, e: 'inOutCubic', p: { crouch: 0.22, lean: 10, headPitch: 12 } },
  { t: 15.3, e: 'outBack', p: { crouch: 0.05, lean: 0, headPitch: 0 } },
  { t: 16.3, p: { headPitch: -10, headYaw: 4 } },
  { t: 17.55, p: { headPitch: -6 } },
  { t: 17.98, e: 'inOutCubic', p: { crouch: 0.45, lean: 16, headPitch: 18 } },
  { t: 18.3, e: 'outBack', p: { crouch: 0.1, lean: 0, headPitch: 0, ...REST_ARMS } },
  { t: 18.9, e: 'inOutCubic', p: { rotY: 22, headRoll: 14, headYaw: -10, aOut: 42, bOut: 42, aBend: 70, bBend: 70, aFwd: 20, bFwd: 20 } },
  { t: 19.7, p: { headRoll: 9 } },
  // recovery: open INBOX, look, close; open SPAM, pick the interview, sticker, file it
  { t: 20.15, e: 'inOutCubic', p: { ...CABN, headRoll: 0, headYaw: 0, headPitch: 6, ...REST_ARMS, crouch: 0.1, lean: 6 } },
  { t: 20.55, e: 'outQuad', p: { ...PULL, lean: -6, crouch: 0.12, headPitch: 22 } },
  { t: 21.3, p: { headPitch: 26, headYaw: -12 } },
  { t: 21.5, e: 'inOutCubic', p: { ...CABN, lean: 8, headPitch: 10, headYaw: 0 } },
  { t: 21.85, e: 'inOutCubic', p: { crouch: 0.55, lean: 18, headPitch: 20 } },
  { t: 22.2, e: 'outQuad', p: { ...PULL, lean: 4, crouch: 0.5, headPitch: 26 } },
  { t: 22.45, p: { lean: 18, crouch: 0.52 } },
  { t: 22.95, e: 'inOutCubic', p: { ...HOLD2, crouch: 0.06, lean: -2, headPitch: 6, headYaw: 0 } },
  { t: 23.5, p: { headPitch: 10 } },
  { t: 23.85, p: { headPitch: 0 } },
  { t: 24.25, e: 'inOutCubic', p: { ...CABN, crouch: 0.2, lean: 10, headPitch: 14 } },
  { t: 24.6, p: { crouch: 0.22 } },
  { t: 24.95, e: 'outBack', p: { crouch: 0.04, lean: 0, headPitch: -2, ...REST_ARMS } },
  // CTA
  { t: 25.75, e: 'inOutCubic', p: { ...CTA, headPitch: -2, headYaw: 0 } },
  { t: 26.35, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6, aFwd: 18, aBend: 28 } },
  { t: 28.2, p: { bFwd: 120 } },
  { t: 28.9, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40, aFwd: 40, aBend: 40, aOut: 14 } },
  { t: 30.5, p: {} },
]);
// IK weights per arm (A = screen-left hand, B = screen-right hand)
const IKW = {
  0: [[0.3, 0], [0.47, 1], [2.4, 1], [2.58, 0], [22.8, 0], [22.95, 1], [23.85, 1], [24.0, 0]],
  1: [[0.3, 0], [0.47, 1], [2.55, 1], [2.68, 0], [5.9, 0], [6.05, 1], [10.25, 1], [10.45, 0],
      [13.18, 0], [13.32, 1], [13.82, 1], [13.95, 0], [14.45, 0], [14.57, 1], [15.0, 1], [15.12, 0],
      [17.45, 0], [17.57, 1], [18.0, 1], [18.12, 0], [20.0, 0], [20.15, 1], [21.5, 1], [21.62, 0],
      [21.72, 0], [21.88, 1], [24.47, 1], [24.62, 0]],
};
const EXPR = [[-9, 'wow'], [0.62, 'happy'], [1.2, 'skeptic'], [2.3, 'neutral'], [3.2, 'focus'], [5.15, 'happy'], [5.95, 'focus'], [6.35, 'skeptic'], [7.4, 'focus'], [8.95, 'skeptic'], [10.6, 'neutral'],
  [10.95, 'focus'], [11.9, 'wow'], [12.6, 'neutral'], [13.3, 'determined'], [14.4, 'happy'], [15.6, 'neutral'], [17.3, 'focus'], [17.6, 'determined'], [18.3, 'puzzled'],
  [20.15, 'focus'], [21.15, 'puzzled'], [21.85, 'determined'], [22.7, 'wow'], [23.5, 'happy'], [24.9, 'proud'], [25.6, 'happy'], [28.3, 'proud']];
const BLINKS = [2.2, 4.6, 7.0, 9.6, 12.9, 15.8, 19.3, 21.6, 24.2, 27.1, 29.2];
let VOICE = null;

function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  const hops = [[1.95, 2.45], [2.7, 3.1], [5.3, 5.85], [18.35, 18.9], [19.75, 20.15], [22.5, 22.95], [23.9, 24.25], [25.2, 25.75]];
  for (const [a, b] of hops) if (t > a && t < b) p.hop += 0.032 * Math.abs(Math.sin(((t - a) / (b - a)) * Math.PI * 2));
  p.antenna = kick(t, Hh.e1Catch, 22) + kick(t, Hh.onReader, 10) + kick(t, Hh.scoreHigh, 14) + kick(t, Hh.land1, 12) + kick(t, Hh.land4, 12) + kick(t, Hh.stickerSlap, 20) + kick(t, Hh.puzzled, 16) + 6 * Math.sin(t * 3.1);
  if (t > 26.35) { p.headPitch += 3 * Math.sin((t - 26.35) * 5) * Math.exp(-(t - 26.35) * 1.2); p.bFwd += 7 * Math.sin((t - 26.35) * 6.2) * Math.exp(-(t - 26.35) * 0.8); }
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

// ---- drawer open amounts (0..1) and label glows
function spamOpenAt(t) {
  return track([[13.2, 0], [13.45, 1, 'outBack'], [14.15, 1], [14.4, 0, 'inOutCubic'], [17.5, 0], [17.75, 1, 'outBack'], [18.5, 1], [18.75, 0, 'inOutCubic'],
    [22.0, 0], [22.3, 1, 'outCubic'], [23.85, 1], [24.1, 0, 'inOutCubic']], t);
}
function inboxOpenAt(t) {
  return track([[14.5, 0], [14.72, 1, 'outBack'], [15.4, 1], [15.65, 0, 'inOutCubic'], [20.25, 0], [20.55, 1, 'outCubic'], [21.45, 1], [21.72, 0, 'inOutCubic'],
    [24.0, 0], [24.25, 1, 'outBack'], [25.3, 1], [25.58, 0, 'inOutCubic']], t);
}
const pulse = (t, a, b) => (t < a || t > b ? 0 : Math.min(inv(a, a + 0.12, t), 1 - inv(b - 0.2, b, t)) * (0.75 + 0.25 * Math.sin((t - a) * 14)));

// ---- envelope transforms: named spots + time segments
const TRAY = (dr, k) => dr.localToWorld(V(0.0 + (k ? 0.02 : 0), -0.098 + 0.004 * k, -0.2 - 0.01 * k));
const trayQ = (k) => { const q = new THREE.Quaternion(); cab.getWorldQuaternion(q); return q.multiply(Q(-Math.PI / 2, 0, k ? -0.08 : 0.06)); };
function readerSpot() { return { p: reader.localToWorld(V(0, 0.155, -0.045)), q: Q(-20 * D2R, CAB_YAW) }; }
function holdSpot(t) { const p = docketAt(t); return { p: local(p, V(0, 0.84 - p.crouch * 0.12, 0.33)), q: Q(-0.1, p.rotY * D2R) }; }
function aboveSpot(dr) { const p = dr.localToWorld(V(0.02, 0.2, -0.16)); return { p, q: Q(-55 * D2R, CAB_YAW) }; }
function traySpot(dr, k) { return { p: TRAY(dr, k), q: trayQ(k) }; }
function flySpot(x, y, z, spin) { return { p: V(x, y, z), q: Q(spin[0], spin[1], spin[2]) }; }
// seg: [t0, t1, fromFn(t), toFn(t), ease, arc]
function placeEnvelope(env, segs, t, hiddenBefore) {
  if (t < hiddenBefore) { env.visible = false; return; }
  env.visible = true;
  let s = segs[0];
  for (const sg of segs) { if (t >= sg[0]) s = sg; }
  const [t0, t1, from, to, ease, arc] = s;
  const k = E[ease || 'inOutCubic'](inv(t0, t1, t));
  const A = from(t), B = to(t);
  const pos = A.p.clone().lerp(B.p, k); pos.y += Math.sin(Math.PI * k) * (arc || 0);
  env.position.copy(pos); env.quaternion.copy(A.q).slerp(B.q, k);
}
const SEG1 = [
  [Hh.e1Launch, Hh.e1Catch, () => flySpot(1.05, 2.15, -0.5, [1.2, 2.6, -0.6]), () => holdSpot(Hh.e1Catch), 'outQuad', 0.25],
  [Hh.e1Catch, Hh.carry, (t) => holdSpot(t), (t) => holdSpot(t), 'linear'],
  [Hh.carry, Hh.onReader, () => holdSpot(Hh.carry), () => readerSpot(), 'inOutCubic', 0.12],
  [Hh.onReader, Hh.grab1, () => readerSpot(), () => readerSpot(), 'linear'],
  [Hh.grab1, Hh.drop1, () => readerSpot(), () => aboveSpot(spamDr), 'inOutCubic', 0.06],
  [Hh.drop1, Hh.land1, () => aboveSpot(spamDr), () => traySpot(spamDr, 0), 'inQuad'],
  [Hh.land1, 99, () => traySpot(spamDr, 0), () => traySpot(spamDr, 0), 'linear'],
];
const SEG3 = [
  [Hh.e3Launch, Hh.e3Land, () => flySpot(1.3, 0.8, 0.7, [0.9, -1.6, 0.5]), () => readerSpot(), 'outQuad', 0.06],
  [Hh.e3Land, Hh.grab3, () => readerSpot(), () => readerSpot(), 'linear'],
  [Hh.grab3, Hh.drop3, () => readerSpot(), () => aboveSpot(inboxDr), 'inOutCubic', 0.05],
  [Hh.drop3, Hh.land3, () => aboveSpot(inboxDr), () => traySpot(inboxDr, 0), 'inQuad'],
  [Hh.land3, 99, () => traySpot(inboxDr, 0), () => traySpot(inboxDr, 0), 'linear'],
];
const SEG4 = [
  [Hh.e4Launch, Hh.e4Land, () => flySpot(1.3, 0.95, 0.6, [1.0, -2.0, 0.4]), () => readerSpot(), 'outQuad', 0.06],
  [Hh.e4Land, Hh.grab4, () => readerSpot(), () => readerSpot(), 'linear'],
  [Hh.grab4, Hh.drop4, () => readerSpot(), () => aboveSpot(spamDr), 'inOutCubic', 0.06],
  [Hh.drop4, Hh.land4, () => aboveSpot(spamDr), () => traySpot(spamDr, 1), 'inQuad'],
  [Hh.land4, Hh.pick4, () => traySpot(spamDr, 1), () => traySpot(spamDr, 1), 'linear'],
  [Hh.pick4, Hh.held4, () => traySpot(spamDr, 1), () => holdSpot(Hh.held4), 'inOutCubic', 0.1],
  [Hh.held4, 23.9, (t) => holdSpot(t), (t) => holdSpot(t), 'linear'],
  [23.9, Hh.drop4b, () => holdSpot(23.9), () => aboveSpot(inboxDr), 'inOutCubic', 0.05],
  [Hh.drop4b, Hh.land4b, () => aboveSpot(inboxDr), () => traySpot(inboxDr, 1), 'inQuad'],
  [Hh.land4b, 99, () => traySpot(inboxDr, 1), () => traySpot(inboxDr, 1), 'linear'],
];
const grip = (env, x = -0.2, y = 0) => env.localToWorld(V(x, y, 0.012));

// ---- magnifier path over E1 (envelope-local fractions; v up)
const SPOTUV = (k) => { const [x, y, w, h] = E1_SPOTS[k]; return [(x + Math.min(w, 520) / 2) / EW - 0.5, 0.5 - (y + h / 2) / EH]; };
function magUV(t) {
  const L = SPOTUV('link'), S = SPOTUV('sales'), F = SPOTUV('flags');
  const keys = [[6.0, [0.75, -0.75]], [6.25, L], [7.15, [L[0] + 0.03, L[1] + 0.01]], [7.4, S], [8.75, [S[0] + 0.03, S[1]]], [8.98, F], [10.1, [F[0] + 0.02, F[1] + 0.01]], [10.4, [0.7, -0.9]]];
  return [track(keys.map(([tt, v]) => [tt, v[0]]), t), track(keys.map(([tt, v]) => [tt, v[1]]), t)];
}
let lensState = '';
function layoutMag(t, p) {
  const vis = t >= Hh.notesOpen && t < Hh.notesClose + 0.1;
  mag.visible = vis; if (!vis) return null;
  const [u, v] = magUV(t);
  const over = env1.localToWorld(V(u * 0.44, v * 0.3, 0.075));
  const q = env1.getWorldQuaternion(new THREE.Quaternion()).multiply(Q(0, 0.45));
  const notes = V(); docket.notes.getWorldPosition(notes); notes.add(V(0, 0.05, 0.1));
  const kin = E.outCubic(inv(Hh.notesOpen, Hh.magIn + 0.05, t)), kout = E.inQuad(inv(10.3, Hh.notesClose, t));
  const pos = notes.clone().lerp(over, kin).lerp(notes, kout);
  mag.position.copy(pos); mag.quaternion.copy(q);
  mag.scale.setScalar(Math.max(0.001, 0.4 + 0.6 * kin * (1 - kout)));
  // zoomed crop
  const s = `${u.toFixed(3)}|${v.toFixed(3)}|${e1State}`;
  if (s !== lensState) {
    lensState = s; const g = lensCanvas.getContext('2d'); const zoom = 1.55, rad = 0.104;
    const sw = (2 * rad / 0.44) * EW / zoom;
    const cx = (u + 0.5) * EW, cy = (0.5 - v) * EH;
    g.clearRect(0, 0, 384, 384); g.save(); g.beginPath(); g.arc(192, 192, 190, 0, 7); g.clip();
    g.fillStyle = PAPER; g.fillRect(0, 0, 384, 384);
    g.drawImage(e1Canvas, cx - sw / 2, cy - sw / 2, sw, sw, 0, 0, 384, 384);
    const gr = g.createRadialGradient(150, 130, 20, 192, 192, 200); gr.addColorStop(0, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(160,200,255,0.10)'); g.fillStyle = gr; g.fillRect(0, 0, 384, 384);
    g.restore(); lensMesh.material.map.needsUpdate = true;
  }
  return mag.localToWorld(V(MAG_DIR.x * 0.255, MAG_DIR.y * 0.255, 0));
}
function updateE1(t) {
  const f = { link: inv(Hh.linkFound, Hh.linkFound + 0.25, t), sales: inv(Hh.salesFound, Hh.salesFound + 0.25, t), flags: inv(Hh.flagFound, Hh.flagFound + 0.25, t) };
  const s = `${f.link.toFixed(2)}|${f.sales.toFixed(2)}|${f.flags.toFixed(2)}`;
  if (s === e1State) return; e1State = s;
  drawE1(e1Canvas.getContext('2d'), f); env1.userData.front.material.map.needsUpdate = true;
}
function layoutMinis(t) {
  minis.forEach((m, i) => {
    const t0 = Hh.minis0 + i * Hh.miniStep, k = E.outCubic(inv(t0, t0 + Hh.miniDur, t));
    m.visible = t >= t0;
    if (!m.visible) return;
    const j = m.userData.slot, col = (j % 3) - 1, row = Math.floor(j / 3) - 1;
    const y0 = m.userData.spam ? CLU.spamY : CLU.normY;
    const to = V(CLU.x + col * 0.2, y0 - row * 0.135, CLU.z + 0.01 * ((i * 7) % 3));
    const from = V(-1.95, 0.75 + 0.35 * Math.sin(i * 1.7), 0.7);
    const pos = from.clone().lerp(to, k); pos.y += Math.sin(Math.PI * k) * 0.12;
    m.position.copy(pos);
    m.quaternion.copy(Q(0.9 * (1 - k), -0.15 + 2.4 * (1 - k), 0.05 * Math.sin(i * 3.1) + 1.2 * (1 - k)));
    if (t > t0 + Hh.miniDur) m.position.y += kick(t, t0 + Hh.miniDur, 0.012, 0.06, 40);
  });
  const hk = E.outCubic(inv(Hh.halos, Hh.halos + 0.3, t));
  clusterHalo.forEach((h, i) => { h.material.opacity = hk * (0.85 + 0.15 * Math.sin(t * 6 + i)); h.scale.setScalar(1.06 - 0.06 * hk); });
  clusterLabels.forEach((l) => { l.visible = hk > 0.01; l.scale.setScalar(Math.max(0.001, E.outBack(hk))); });
}
function needleAt(t) {
  let a = -1.15;
  a = track([[Hh.scoreHigh, -1.15], [Hh.scoreHigh + 0.35, 1.12, 'outBack'], [Hh.scoreLow, 1.12], [Hh.scoreLow + 0.35, -1.12, 'outBack'], [Hh.scoreHigh2, -1.12], [Hh.scoreHigh2 + 0.4, 1.12, 'outBack'], [19.6, 1.12], [20.2, -1.15]], t);
  if (t > Hh.scan[0] && t < Hh.scoreHigh) a += 0.18 * Math.sin((t - Hh.scan[0]) * 17) * inv(Hh.scan[0], Hh.scan[0] + 0.3, t);   // reading…
  if (t > 16.5 && t < Hh.scoreHigh2) a += 0.16 * Math.sin((t - 16.5) * 15);
  return a;
}

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  inboxDr.position.z = 0.23 + inboxOpenAt(t) * 0.36;
  spamDr.position.z = 0.23 + spamOpenAt(t) * 0.36;
  scene.updateMatrixWorld(true);
  updateE1(t);
  placeEnvelope(env1, SEG1, t, -1);
  placeEnvelope(env3, SEG3, t, Hh.e3Launch);
  placeEnvelope(env4, SEG4, t, Hh.e4Launch);
  scene.updateMatrixWorld(true);
  // ---- IK targets
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  let tA = null, tB = null;
  const magGrip = layoutMag(t, p);
  if (t < 2.6) { tA = grip(env1, -0.235, -0.03); tB = t < Hh.carry ? grip(env1, 0.235, -0.03) : grip(env1, -0.2, -0.04); }
  else if (t >= 5.9 && t < 10.45 && magGrip) tB = magGrip;
  else if (t >= 13.15 && t < 14.0) tB = grip(env1, -0.2, -0.02);
  else if (t >= 14.4 && t < 15.15) tB = grip(env3, -0.2, -0.02);
  else if (t >= 17.4 && t < 18.15) tB = grip(env4, -0.2, -0.02);
  else if (t >= 20.0 && t < 21.65) tB = inboxDr.localToWorld(V(-0.08, 0.075, 0.075));
  else if (t >= 21.7 && t < 22.36) tB = spamDr.localToWorld(V(0, 0.075, 0.075));
  else if (t >= 22.36 && t < 24.65) tB = grip(env4, t < 22.95 ? -0.2 : 0.235, -0.03);
  if (t >= 22.8 && t < 24.0) tA = grip(env4, -0.235, -0.03);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  // gauge + glows
  gaugeNeedle.rotation.z = -needleAt(t);
  gaugeGlowHi.material.opacity = pulse(t, Hh.scoreHigh + 0.2, 13.9) + pulse(t, Hh.scoreHigh2 + 0.25, 18.6);
  gaugeGlowLo.material.opacity = pulse(t, Hh.scoreLow + 0.2, 15.3);
  spamGlow.material.opacity = 0.8 * (pulse(t, 13.05, 14.2) + pulse(t, 17.35, 18.55));
  inboxGlow.material.opacity = 0.8 * (pulse(t, 14.4, 15.45) + pulse(t, Hh.stickerSlap + 0.3, 25.35));
  inboxDr.userData.lab.scale.setScalar(1 + 0.1 * inboxGlow.material.opacity); spamDr.userData.lab.scale.setScalar(1 + 0.1 * spamGlow.material.opacity);
  // scan bar over E1 / E4 while the score is computed
  const scanE = t >= Hh.scan[0] && t < Hh.scan[1] ? [env1, inv(Hh.scan[0], Hh.scan[1], t)] : t >= 16.55 && t < 17.2 ? [env4, inv(16.55, 17.2, t)] : null;
  scanBar.visible = !!scanE;
  if (scanE) { const [en, k] = scanE; scanBar.position.copy(en.localToWorld(V(0, 0.14 - 0.28 * k, 0.012))); scanBar.quaternion.copy(en.getWorldQuaternion(new THREE.Quaternion())); scanBar.material.opacity = 0.75 * Math.sin(Math.PI * k) + 0.2; }
  layoutMinis(t);
  const gk = Math.min(inv(20.6, 20.8, t), 1 - inv(21.35, 21.5, t));
  ghost.visible = gk > 0; ghost.material.opacity = gk * (0.75 + 0.25 * Math.sin(t * 9)); ghost.position.set(0.11, -0.03 + 0.01 * Math.sin(t * 4), -0.1); ghost.rotation.set(-1.15, 0, -0.06); ghost.scale.setScalar(0.56 + 0.06 * gk);
  // NOT SPAM sticker: flies from NOTES onto the interview envelope and slaps on
  sticker.visible = t >= Hh.stickerFly;
  if (sticker.visible) {
    const onEnv = env4.localToWorld(V(0.075, -0.075, 0.011)), q = env4.getWorldQuaternion(new THREE.Quaternion()).multiply(Q(0, 0, 0.12));
    const notes = V(); docket.notes.getWorldPosition(notes); notes.add(V(0, 0.08, 0.12));
    const k = E.inQuad(inv(Hh.stickerFly, Hh.stickerSlap, t));
    sticker.position.copy(notes.lerp(onEnv, k)); sticker.position.y += Math.sin(Math.PI * k) * 0.12;
    sticker.quaternion.copy(q);
    const sq = t < Hh.stickerSlap ? 0.8 + 0.6 * k : 1 + 0.35 * Math.exp(-(t - Hh.stickerSlap) / 0.06) * Math.cos((t - Hh.stickerSlap) * 30);
    sticker.scale.setScalar(sq);
    if (t >= Hh.stickerSlap) sticker.position.copy(env4.localToWorld(V(0.075, -0.075, 0.0115)));
  }
  // squash on the letter landings
  for (const [en, t0] of [[env1, Hh.onReader], [env3, Hh.e3Land], [env4, Hh.e4Land]]) { const s = kick(t, t0, 0.06, 0.06, 34); en.scale.set(1 + s * 0.5, 1 - s, 1); }
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system)
const CAM = [
  [0.0, [-0.1, 1.27, 2.4], [-0.18, 1.11, 0.35]], [1.8, [-0.08, 1.26, 2.22], [-0.17, 1.11, 0.35]],
  [2.7, [0.2, 1.3, 3.05], [0.16, 0.98, 0.2]], [3.15, [0.15, 1.28, 3.0], [0.12, 0.98, 0.2]],
  [3.75, [-0.66, 1.2, 2.75], [-0.8, 1.0, -0.1]], [5.45, [-0.68, 1.19, 2.62], [-0.8, 1.0, -0.1]],
  [6.1, [0.3, 1.27, 1.34], [0.46, 1.1, 0.12]], [10.3, [0.31, 1.26, 1.28], [0.46, 1.1, 0.12]],
  [11.0, [0.18, 1.2, 2.45], [0.3, 0.92, 0.25]], [13.1, [0.18, 1.2, 2.38], [0.3, 0.92, 0.25]], [13.55, [0.14, 1.12, 2.9], [0.3, 0.74, 0.3]], [13.9, [0.14, 1.12, 2.88], [0.3, 0.74, 0.3]],
  [14.3, [0.17, 1.2, 2.42], [0.3, 0.9, 0.25]], [15.6, [0.16, 1.2, 2.4], [0.3, 0.9, 0.25]],
  [16.35, [0.36, 1.24, 1.75], [0.43, 1.03, 0.22]], [17.35, [0.35, 1.23, 1.72], [0.43, 1.02, 0.22]],
  [17.8, [0.14, 1.1, 2.5], [0.3, 0.62, 0.35]], [18.25, [0.14, 1.1, 2.5], [0.3, 0.62, 0.35]], [18.9, [0.0, 1.28, 2.58], [-0.04, 1.1, 0.45]], [19.85, [0.0, 1.27, 2.48], [-0.04, 1.1, 0.45]],
  [20.45, [0.0, 1.27, 2.42], [-0.04, 1.1, 0.45]],                 // cuts (not sweeps) in and out of the drawer inserts, each on an open drawer
  [20.451, [0.44, 1.25, 1.0], [0.45, 0.43, 0.55]], [21.42, [0.44, 1.24, 0.985], [0.45, 0.43, 0.55]],
  [21.421, [0.14, 1.12, 2.88], [0.3, 0.74, 0.3]], [22.22, [0.13, 1.11, 2.79], [0.3, 0.74, 0.3]],
  [22.221, [0.38, 0.92, 1.05], [0.415, 0.13, 0.52]], [22.55, [0.38, 0.92, 1.03], [0.415, 0.13, 0.52]],
  [22.551, [-0.02, 1.27, 2.16], [-0.06, 1.08, 0.62]], [22.88, [-0.02, 1.27, 2.1], [-0.06, 1.08, 0.62]], [23.85, [-0.02, 1.27, 2.05], [-0.06, 1.08, 0.62]],
  [24.45, [0.18, 1.3, 2.2], [0.3, 0.72, 0.42]], [25.4, [0.16, 1.28, 2.25], [0.28, 0.75, 0.42]],
  [26.1, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.e1Catch, 0.012, 0.1, 40) + kick(t, Hh.onReader, 0.006, 0.08, 40) + kick(t, Hh.scoreHigh + 0.3, 0.006, 0.08, 40) + kick(t, Hh.land1, 0.008, 0.08, 40) + kick(t, Hh.land4, 0.008, 0.08, 40) + kick(t, Hh.stickerSlap, 0.014, 0.1, 44) + kick(t, Hh.spamOpen1 + 0.2, 0.005, 0.08, 40);
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
    for (;;) { c.font = `700 ${size}px "Space Grotesk"`; if (Math.max(...cap.lines.map(lineW)) <= CAP_MAXW - 72 || size <= 44) break; size -= 2; }
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
    for (;;) { c.font = `700 ${size}px "Space Grotesk"`; if (Math.max(...cap.lines.map(lineW)) <= CAP_MAXW - 72 || size <= 44) break; size -= 2; }
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
  const img = new Image(); img.src = '/assets/icon.png'; await img.decode(); ICON = img;
  try { const r = await fetch('/voice.json'); if (r.ok) VOICE = await r.json(); } catch (e) { /* no lip-sync data */ }
  buildStage();
  window.renderAt(0);
  return document.fonts.check('700 40px "Space Grotesk"');
})();
