// meme.js — Ideaverse production 30s meme-01 (Hindi, experimental meme episode): the AI shopping-list fail.
// Accepted renderer kept (copied from hindi-03 src/stage/eraser.js = feedback-round renderer = education pilot-01
// engine: renderer, lights, newsroom stage, materials, camera system, DOCKET rig). New for this experiment: meme
// timing (freeze-frames with zoom punch) and outlined meme captions, still inside the y 344–520 safe band.
// Every frame is a pure function of t (window.renderAt).
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
function tag(g, x, y, txt, fg, bg, size = 26) { g.save(); g.font = `700 ${size}px ${HI}`; const w = g.measureText(txt).width + 30; g.fillStyle = bg; rr(g, x - w, y, w, size + 20, (size + 20) / 2); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, x - w + 15, y + (size + 20) / 2 + 2); g.restore(); }
function labelCanvas(lines, bg, fg, w = 512, h = 384) {
  const c = canvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; rr(g, 0, 0, w, h, 26); g.fill();
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach(([s, size], i) => { g.font = `800 ${size}px ${HI}`; g.fillText(s, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.15); });
  return c;
}

// ------------------------------------------------------------------ scene objects
let docket, cab, phone, screenCanvas, screenMesh, cart, clipboard, items = [], modest = [], tags = [];
const CAB_POS = V(0.95, 0, -0.25), CAB_YAW = -0.4;
const CART_POS = V(0.36, 0, 0.3), CART_YAW = -0.28;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
function plane(w, h, c, lit = false) {
  const t = cvTex(c);
  const m = lit ? new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.42, roughness: 0.72 }) : new THREE.MeshBasicMaterial({ map: t, toneMapped: false, transparent: true });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
}
// a labelled grocery prop: box/sack (rbox + front label), can (cylinder + label), melon (striped sphere)
function makeItem(kind, label, size, col) {
  const g = new THREE.Group();
  if (kind === 'melon') {
    const mc = canvas(512, 256), mg = mc.getContext('2d'); mg.fillStyle = '#2F8F4A'; mg.fillRect(0, 0, 512, 256); mg.fillStyle = '#1D5E31'; for (let i = 0; i < 16; i++) mg.fillRect(i * 32, 0, 14, 256);
    const s = sh(new THREE.Mesh(new THREE.SphereGeometry(size[0], 28, 20), new THREE.MeshStandardMaterial({ map: cvTex(mc), roughness: 0.45 }))); s.scale.set(1, 0.86, 1); g.add(s);
  } else if (kind === 'can') {
    const cy = sh(new THREE.Mesh(new THREE.CylinderGeometry(size[0], size[0], size[1], 24), M(col, { roughness: 0.35, metalness: 0.3 }))); g.add(cy);
    const lid = sh(new THREE.Mesh(new THREE.CylinderGeometry(size[0] * 0.35, size[0] * 0.35, 0.03, 16), mats.navy)); lid.position.y = size[1] / 2 + 0.015; g.add(lid);
    const lab = plane(size[0] * 1.7, size[1] * 0.55, labelCanvas(label, '#FBF8F1', NAVY, 384, 300), true); lab.position.set(0, 0, size[0] + 0.002); g.add(lab);
  } else {
    const b = rbox(size[0], size[1], size[2], kind === 'sack' ? 0.05 : 0.012, M(col, { roughness: kind === 'sack' ? 0.9 : 0.55 })); g.add(b);
    const lab = plane(size[0] * 0.86, size[1] * 0.62, labelCanvas(label, kind === 'sack' ? '#FBF8F1' : '#F4F7FB', NAVY), true); lab.position.set(0, 0, size[2] / 2 + 0.004); g.add(lab);
  }
  scene.add(g); return g;
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: cart icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.strokeStyle = P.mint; mg.lineWidth = 12; mg.lineJoin = 'round'; mg.shadowColor = P.mint; mg.shadowBlur = 16;
    mg.beginPath(); mg.moveTo(130, 80); mg.lineTo(170, 80); mg.lineTo(210, 200); mg.lineTo(370, 200); mg.lineTo(395, 110); mg.lineTo(185, 110); mg.stroke(); mg.beginPath(); mg.arc(225, 235, 16, 0, 7); mg.arc(345, 235, 16, 0, 7); mg.stroke();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  // ----- background cabinet (set dressing, as in earlier episodes)
  cab = new THREE.Group(); cab.position.copy(CAB_POS); cab.rotation.y = CAB_YAW; scene.add(cab);
  const base = rbox(0.66, 0.1, 0.52, 0.02, mats.navy); base.position.y = 0.05; cab.add(base);
  const body = rbox(0.62, 0.92, 0.5, 0.05, mats.shell); body.position.y = 0.56; cab.add(body);
  for (const y of [0.575, 0.265]) { const f = rbox(0.58, 0.28, 0.04, 0.014, mats.shell); f.position.set(0, y, 0.27); cab.add(f); const h = rbox(0.22, 0.034, 0.034, 0.012, mats.mint); h.position.set(0, y + 0.075, 0.3); cab.add(h); }
  // ----- shopping cart (original prop): wire basket, handle, frame, wheels
  cart = new THREE.Group(); cart.position.copy(CART_POS); cart.rotation.y = CART_YAW; scene.add(cart);
  const wc = canvas(256, 256), wg = wc.getContext('2d'); wg.clearRect(0, 0, 256, 256); wg.strokeStyle = '#9FE6AE'; wg.lineWidth = 7; for (let i = 0; i <= 256; i += 64) { wg.beginPath(); wg.moveTo(i, 0); wg.lineTo(i, 256); wg.stroke(); wg.beginPath(); wg.moveTo(0, i); wg.lineTo(256, i); wg.stroke(); }
  const wireT = cvTex(wc); wireT.wrapS = wireT.wrapT = THREE.RepeatWrapping;
  const wireM = (rx, ry) => { const t = wireT.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.4, metalness: 0.4, emissive: new THREE.Color(P.mint), emissiveIntensity: 0.15 }); };
  const BW = 0.66, BHh = 0.2, BD = 0.46, BY = 0.5;           // shallow basket so the pile reads
  for (const [w, h, x, y, z, ry] of [[BW, BHh, 0, BY + BHh / 2, BD / 2, 0], [BW, BHh, 0, BY + BHh / 2, -BD / 2, 0], [BD, BHh, -BW / 2, BY + BHh / 2, 0, Math.PI / 2], [BD, BHh, BW / 2, BY + BHh / 2, 0, Math.PI / 2]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wireM(w * 3, h * 3)); m.position.set(x, y, z); m.rotation.y = ry; cart.add(m);
  }
  const floorB = new THREE.Mesh(new THREE.PlaneGeometry(BW, BD), wireM(BW * 3, BD * 3)); floorB.rotation.x = -Math.PI / 2; floorB.position.y = BY; cart.add(floorB);
  const rim = rbox(BW + 0.03, 0.025, BD + 0.03, 0.01, mats.mint); rim.position.y = BY + BHh; cart.add(rim);
  const rimIn = rbox(BW - 0.02, 0.026, BD - 0.02, 0.01, M('#0E1424')); rimIn.position.y = BY + BHh; rimIn.scale.set(1, 1.01, 1); cart.add(rimIn); rimIn.visible = false;
  const hbar = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, BD + 0.06, 14), mats.navy)); hbar.rotation.x = Math.PI / 2; hbar.position.set(-BW / 2 - 0.12, BY + BHh + 0.12, 0); cart.add(hbar);
  for (const z of [-1, 1]) { const arm = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.19, 10), mats.steel)); arm.rotation.z = 1.0; arm.position.set(-BW / 2 - 0.06, BY + BHh + 0.06, z * BD / 2); cart.add(arm); }
  for (const [x, z] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
    const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, BY - 0.06, 10), mats.steel)); leg.position.set(x * (BW / 2 - 0.04), (BY - 0.06) / 2 + 0.06, z * (BD / 2 - 0.04)); cart.add(leg);
    const wh = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 20), mats.navy)); wh.rotation.x = Math.PI / 2; wh.position.set(x * (BW / 2 - 0.04), 0.045, z * (BD / 2 - 0.04)); cart.add(wh);
  }
  const ctag = plane(0.3, 0.075, labelCanvas([['उदाहरण', 120]], AMBER, NAVY, 512, 128)); ctag.position.set(0.14, BY - 0.08, BD / 2 + 0.006); cart.add(ctag);
  // ----- the absurd "whole neighbourhood" order (original props, illustrative labels)
  const SPEC = [
    // [hit, kind, label lines, size, colour, rest position in cart-local, rest rotation y]
    ['rain', 'sack', [['चावल', 92], ['25 kg', 70]], [0.3, 0.36, 0.16], '#E9E1CF', [-0.17, 0.68, 0.04], 0.2],
    ['rain', 'box', [['चीनी', 92], ['10 kg', 70]], [0.26, 0.22, 0.18], '#F4F7FB', [0.17, 0.62, 0.06], -0.15],
    ['rain', 'box', [['बिस्किट', 84], ['× 48', 70]], [0.28, 0.18, 0.16], AMBER, [0.12, 0.8, -0.06], 0.1],
    ['rain', 'sack', [['आलू', 92], ['20 kg', 70]], [0.28, 0.3, 0.16], '#C9A97A', [-0.12, 0.9, -0.04], -0.2],
    ['rain', 'box', [['चायपत्ती', 80], ['5 kg', 70]], [0.22, 0.2, 0.14], P.mint, [0.17, 0.88, 0.04], 0.25],
    ['atta', 'sack', [['आटा', 110], ['50 kg', 90]], [0.46, 0.4, 0.2], '#F4EBD6', [0.0, 1.06, 0.06], 0.05],
    ['oil0', 'can', [['तेल', 120], ['5 L', 96]], [0.075, 0.24], '#E8B23A', [-0.22, 1.29, 0.12], 0],
    ['oil1', 'can', [['तेल', 120], ['5 L', 96]], [0.075, 0.24], '#E8B23A', [-0.07, 1.3, 0.14], 0.3],
    ['oil2', 'can', [['तेल', 120], ['5 L', 96]], [0.075, 0.24], '#E8B23A', [0.08, 1.29, 0.14], -0.2],
    ['oil3', 'can', [['तेल', 120], ['5 L', 96]], [0.075, 0.24], '#E8B23A', [0.23, 1.28, 0.12], 0.1],
    ['mel0', 'melon', null, [0.12], null, [-0.13, 1.47, 0.08], 0],
    ['mel1', 'melon', null, [0.12], null, [0.13, 1.47, 0.08], 0],
    ['mel2', 'melon', null, [0.12], null, [0.0, 1.62, 0.07], 0],                // bounces off and knocks the clipboard
  ];
  SPEC.forEach(([hit, kind, label, size, col, rest, ry], i) => { const m = makeItem(kind, label, size, col); m.userData = { hit, kind, rest: V(...rest), ry, i }; items.push(m); });
  // ----- the modest corrected order (illustrative)
  const MOD = [['box', [['आटा', 96], ['2 kg', 80]], [0.2, 0.22, 0.12], '#F4EBD6', [-0.18, 0.62, 0.0]], ['box', [['सब्ज़ी', 92]], [0.22, 0.16, 0.16], P.mint, [0.06, 0.58, 0.04]],
    ['can', [['दूध', 120], ['1 L', 96]], [0.05, 0.18], '#F4F7FB', [0.2, 0.6, -0.06]], ['box', [['अंडे', 92], ['× 12', 76]], [0.22, 0.1, 0.14], '#E9E1CF', [0.0, 0.55, -0.12]]];
  MOD.forEach(([kind, label, size, col, rest], i) => { const m = makeItem(kind, label, size, col); m.userData = { rest: V(...rest), i }; modest.push(m); });
  ['₹110', '₹180', '₹180', '₹90'].forEach((p, i) => { const c = canvas(256, 120), g = c.getContext('2d'); g.fillStyle = AMBER; rr(g, 4, 4, 248, 112, 22); g.fill(); g.fillStyle = NAVY; g.font = `800 64px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p, 128, 64); const t = plane(0.17, 0.08, c); t.userData = { c, i, p, ok: false }; scene.add(t); tags.push(t); });
  // ----- DOCKET's clipboard (dropped when the third melon lands)
  clipboard = new THREE.Group(); scene.add(clipboard);
  const cbB = rbox(0.24, 0.32, 0.012, 0.01, M('#8A5A3A', { roughness: 0.7 })); clipboard.add(cbB);
  const pc = canvas(256, 320), pg = pc.getContext('2d'); pg.fillStyle = '#FBF8F1'; pg.fillRect(0, 0, 256, 320); pg.fillStyle = NAVY; pg.font = `800 40px ${HI}`; pg.fillText('राशन', 24, 64); pg.fillStyle = 'rgba(27,35,51,0.3)'; for (let i = 0; i < 5; i++) pg.fillRect(24, 100 + i * 40, 200 - (i % 2) * 50, 10);
  const paper = plane(0.21, 0.27, pc, true); paper.position.set(0, -0.015, 0.0075); clipboard.add(paper);
  const clip = rbox(0.09, 0.03, 0.02, 0.006, mats.steel); clip.position.set(0, 0.15, 0.012); clipboard.add(clip);
  // ----- the phone (illustrative chat screen; not a real app's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  const lens = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 24), mats.mint)); lens.rotation.x = Math.PI / 2; lens.position.set(-0.08, 0.2, -0.019); phone.add(lens);
}

// ------------------------------------------------------------------ phone screen (illustrative chat, drawn per state)
let screenKey = '';
const LIST = [['आटा 2 kg', '₹110'], ['सब्ज़ियाँ', '₹180'], ['दूध 3 L', '₹180'], ['अंडे 12', '₹90']];
function bubble(g, x, y, w, h, me) { g.fillStyle = me ? P.mint : '#1E2A44'; rr(g, x, y, w, h, 28); g.fill(); }
function drawScreen(t) {
  const q = (v) => Math.round(clamp(v) * 20) / 20;
  const mode = t < Hh.vagueIns ? 'chat' : t < Hh.fixType ? 'vague' : 'fix';
  const k = { mode, typed: q(inv(0.25, 1.5, t)), sent: t >= 1.6 ? 1 : 0, reply: q(inv(1.8, 2.4, t)), long: Math.floor(clamp((t - 2.4) / 2.2) * 7),
    qs: Hh.qs.map((a) => q(inv(a, a + 0.25, t))), chips: Hh.chips.map((a) => q(inv(a, a + 0.25, t))), send2: t >= Hh.send2 ? 1 : 0,
    list: Hh.listRows.map((a) => q(inv(a, a + 0.25, t))), total: q(inv(Hh.total, Hh.total + 0.25, t)) };
  const key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'उदाहरण', NAVY, AMBER, 26);
  g.fillStyle = '#F4F7FB'; g.font = `700 34px ${HI}`; g.fillText('AI सहायक', 30, 110);
  g.fillStyle = 'rgba(244,247,251,0.15)'; g.fillRect(24, 140, SW - 48, 3);
  const vague = 'राशन की लिस्ट बना दो';
  if (mode === 'chat' || mode === 'vague') {
    // my vague message
    const txt = mode === 'chat' ? vague.slice(0, Math.round(vague.length * k.typed)) : vague;
    g.font = `700 40px ${HI}`; const w = Math.min(SW - 120, g.measureText(vague).width + 50);
    bubble(g, SW - 30 - w, 180, w, 84, true); g.fillStyle = NAVY; g.fillText(txt, SW - 30 - w + 25, 224);
    if (mode === 'vague') { g.save(); g.strokeStyle = AMBER; g.lineWidth = 8; g.shadowColor = AMBER; g.shadowBlur = 14; rr(g, SW - 36 - w, 174, w + 12, 96, 32); g.stroke(); g.restore(); }
    if (k.reply > 0 && mode === 'chat') {
      g.globalAlpha = k.reply; bubble(g, 30, 300, SW - 110, 70 + 62 * Math.max(1, k.long), false);
      const rows = ['चावल 25 kg', 'आटा 50 kg', 'तेल 20 L', 'आलू 20 kg', 'चीनी 10 kg', 'बिस्किट × 48', 'तरबूज़ × 3'];
      g.fillStyle = '#F4F7FB'; g.font = `700 38px ${HI}`; for (let i = 0; i < Math.max(1, k.long); i++) g.fillText('• ' + rows[i], 56, 345 + i * 62);
      g.globalAlpha = 1;
    }
    if (mode === 'vague') {   // what it never knew
      const Q = ['कितने लोग?', 'कितने दिन?', 'बजट?', 'घर में क्या है?'];
      Q.forEach((s, i) => { const a = k.qs[i]; if (a <= 0) return; g.save(); g.globalAlpha = a; const y = 360 + i * 130, x = i % 2 ? 250 : 60; g.translate(x + 110, y + 40); g.scale(0.7 + 0.3 * a, 0.7 + 0.3 * a); g.rotate((i % 2 ? 0.05 : -0.05));
        g.fillStyle = '#2A2410'; rr(g, -120, -45, 240 + (s.length > 8 ? 60 : 0), 90, 26); g.fill(); g.strokeStyle = AMBER; g.lineWidth = 5; g.stroke(); g.fillStyle = AMBER; g.font = `800 44px ${HI}`; g.textAlign = 'center'; g.fillText(s, (s.length > 8 ? 30 : 0), 4); g.restore(); });
    }
    return;
  }
  // the specific request: four constraint chips, then a modest list with illustrative prices
  const CH = ['2 लोग', '3 दिन', '₹600', 'घर में: चावल-दाल'];
  bubble(g, 40, 170, SW - 70, 230, true);
  g.fillStyle = NAVY; g.font = `700 34px ${HI}`; g.fillText('राशन की लिस्ट बना दो —', 64, 212);
  CH.forEach((s, i) => { const a = k.chips[i]; if (a <= 0) return; const x = i === 3 ? 64 : 64 + i * 150, y = i === 3 ? 330 : 268; g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(0.6 + 0.4 * a, 0.6 + 0.4 * a);
    g.font = `800 38px ${HI}`; const w = g.measureText(s).width + 34; g.fillStyle = NAVY; rr(g, 0, -30, w, 60, 30); g.fill(); g.fillStyle = P.mint; g.textBaseline = 'middle'; g.fillText(s, 17, 2); g.restore(); });
  if (k.send2) {
    const rows = k.list.filter((a) => a > 0).length; bubble(g, 30, 440, SW - 90, 100 + 80 * rows + (k.total > 0 ? 90 : 0), false);
    LIST.forEach(([n, p], i) => { const a = k.list[i]; if (a <= 0) return; g.save(); g.globalAlpha = a; const y = 500 + i * 80; g.fillStyle = '#F4F7FB'; g.font = `700 42px ${HI}`; g.fillText(n, 60, y); g.textAlign = 'right'; g.fillStyle = AMBER; g.fillText(p, SW - 90, y); g.restore(); });
    if (k.total > 0) { g.save(); g.globalAlpha = k.total; const y = 500 + LIST.length * 80 + 20; g.fillStyle = 'rgba(244,247,251,0.25)'; g.fillRect(60, y - 44, SW - 150, 3); g.fillStyle = P.mint; g.font = `800 46px ${HI}`; g.fillText('कुल ≈ ₹560', 60, y + 8); g.restore(); }
    g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = `500 30px ${HI}`; g.fillText('कीमतें सिर्फ़ उदाहरण', 40, 1000);
  }
}

// ------------------------------------------------------------------ choreography
const HOME = { x: -0.16, z: 0.5, rotY: 22 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...HOME, headPitch: 18, headYaw: -10, bFwd: 30, bOut: 14, bBend: 60 } },     // typing (phone in A), clipboard in B
  { t: 1.6, p: { headPitch: 18 } },
  { t: 1.9, e: 'outBack', p: { headPitch: 4, headYaw: 16 } },
  { t: 2.7, e: 'outBack', p: { headPitch: -16, headYaw: 30, lean: -6 } },                    // looks up at the incoming flood
  { t: 4.3, p: { headPitch: -22, headYaw: 34, lean: -9, crouch: 0.06 } },
  { t: 5.6, p: { headPitch: -10, headYaw: 30, lean: -4, crouch: 0 } },
  { t: 6.45, e: 'outQuad', p: { lean: -12, hop: 0.04 } },                                     // the 50 kg slam
  { t: 6.75, e: 'outBack', p: { lean: -2, hop: 0 } },
  { t: 7.3, e: 'outQuart', p: { headYaw: 0, headPitch: 2 } },                                  // double take: to camera…
  { t: 7.5, e: 'outQuart', p: { headYaw: 40, headPitch: -8 } },                                // …back to the cart…
  { t: 7.72, e: 'outQuart', p: { headYaw: -2, headPitch: 4 } },                                // …and to camera again
  { t: 8.3, p: { headYaw: 30, headPitch: -12 } },
  { t: 9.6, p: { headYaw: 34, headPitch: -16 } },
  { t: 9.75, e: 'outQuad', p: { lean: -10, bFwd: 50, bOut: 40, bBend: 20 } },                  // melon hits the clipboard
  { t: 10.15, e: 'outBack', p: { lean: 0, headYaw: 0, headPitch: 2, bFwd: 14, bOut: 16, bBend: 20 } },   // deadpan to camera
  { t: 11.0, p: {} },
  { t: 11.2, e: 'inOutCubic', p: { ...REST_ARMS } },
  { t: 14.5, p: { headYaw: 24, headPitch: -6 } },
  { t: 15.6, p: { headYaw: 0, headPitch: 14 } },
  { t: 21.6, p: { headYaw: 20, headPitch: 6 } },
  { t: 23.0, p: { headYaw: 0, headPitch: 0 } },
  { t: 23.6, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.0, p: { bFwd: 120 } },
  { t: 28.8, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
// IK: B holds the phone throughout (two-handed in the inserts); A holds the clipboard until it is knocked away
const IKW = { 0: [[-1, 1], [30.5, 1]], 1: [[-1, 1], [9.7, 1], [9.75, 0], [11.0, 0], [11.3, 1], [14.45, 1], [14.6, 0], [15.75, 0], [15.9, 1], [21.6, 1], [21.75, 0], [30.5, 0]] };
const EXPR = [[-9, 'focus'], [1.9, 'happy'], [2.7, 'wow'], [5.6, 'puzzled'], [6.45, 'wow'], [7.3, 'skeptic'], [7.72, 'wow'], [8.3, 'puzzled'], [9.75, 'wow'], [10.15, 'deadpan'],
  [11.2, 'skeptic'], [12.2, 'puzzled'], [14.5, 'determined'], [15.9, 'focus'], [19.6, 'happy'], [21.7, 'focus'], [22.6, 'happy'], [23.4, 'happy'], [28.3, 'proud']];
const BLINKS = [3.4, 6.1, 8.9, 12.4, 16.5, 20.4, 24.8, 27.6, 29.4];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, 2.8, 12) + kick(t, Hh.atta, 22) + kick(t, Hh.oil[0], 10) + kick(t, Hh.mel[2], 14) + kick(t, Hh.clipHit, 26) + 6 * Math.sin(t * 3.1);
  if (t > 23.6) { p.headPitch += 3 * Math.sin((t - 23.6) * 5) * Math.exp(-(t - 23.6) * 1.2); p.bFwd += 7 * Math.sin((t - 23.6) * 6.2) * Math.exp(-(t - 23.6) * 0.8); }
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
  const TYPE = spot(p, V(-0.2, 0.84, 0.28), -0.55, -0.3);      // one-handed (A), tilted up, away from the cart
  const SHOW = spot(p, V(0.0, 1.02, 0.36), -0.06);
  const LOW = spot(p, V(-0.16, 0.66, 0.26), -0.4, 0.2);
  const segs = [[-1, TYPE], [10.7, TYPE], [11.0, SHOW], [14.45, SHOW], [14.55, TYPE], [15.75, TYPE], [15.85, SHOW], [21.6, SHOW], [21.7, TYPE], [23.3, TYPE], [23.7, LOW]];
  let i = 1; while (i < segs.length - 1 && t > segs[i][0]) i++;
  const [t0, A] = segs[i - 1], [t1, B] = segs[i], k = E.inOutCubic(inv(t0, t1, t));
  return { p: A.p.clone().lerp(B.p, k), q: A.q.clone().slerp(B.q, k) };
}
const onPhone = (x, y, z = 0.02) => phone.localToWorld(V(x, y, z));
const cartPt = (v) => cart.localToWorld(v.clone());
function itemTime(hit) { return hit === 'rain' ? null : hit === 'atta' ? Hh.atta : hit.startsWith('oil') ? Hh.oil[+hit[3]] : Hh.mel[+hit[3]]; }
function layoutItems(t) {
  const cq = cart.getWorldQuaternion(new THREE.Quaternion());
  let rainIdx = 0;
  items.forEach((m) => {
    const u = m.userData; let tl = itemTime(u.hit); if (tl === null) { tl = Hh.rain0 + rainIdx * 0.28; rainIdx++; }
    const tf = tl - 0.45, out0 = Hh.empty0 + u.i * 0.04, out1 = out0 + 0.5;
    m.visible = t >= tf && t < out1; if (!m.visible) return;
    const rest = cartPt(u.rest);
    let pos, rot = cq.clone().multiply(Q(0, u.ry));
    if (t < tl) { const k = E.inQuad(inv(tf, tl, t)); pos = rest.clone().add(V(0.25 * Math.sin(u.i * 1.7), 1.6 * (1 - k), 0.3 * (1 - k))); rot.multiply(Q(2.2 * (1 - k), 0, 1.4 * (1 - k))); }
    else pos = rest.clone();
    pos.y += t >= tl ? Math.abs(kick(t, tl, 0.05, 0.08, 26)) : 0;
    if (u.hit === 'mel2' && t >= tl) {     // bounces off the pile, hits the clipboard, rolls away
      const k = inv(tl, Hh.clipHit, t), clipPos = local(docketAt(Hh.clipHit), V(0.32, 0.66, 0.22));
      if (t < Hh.clipHit) { pos = rest.clone().lerp(clipPos, k); pos.y += Math.sin(Math.PI * k) * 0.35; }
      else { const k2 = E.outCubic(inv(Hh.clipHit, Hh.clipHit + 0.8, t)); pos = clipPos.clone().lerp(V(-0.55, 0.11, 0.95), k2); pos.y = Math.max(0.105, clipPos.y * (1 - k2) * (1 - k2) + 0.105 + Math.abs(Math.sin(k2 * 7)) * 0.12 * (1 - k2)); }
      rot = Q(t * 5, 0, t * 3);
    }
    if (t >= out0) { const k = E.inQuad(inv(out0, out1, t)); pos.add(V(0.9 * k, 1.4 * k, -0.6 * k)); }
    m.position.copy(pos); m.quaternion.copy(rot);
    const sq = t >= tl ? kick(t, tl, 0.12, 0.06, 30) : 0; m.scale.set(1 + sq * 0.4, 1 - sq, 1 + sq * 0.4);
  });
  modest.forEach((m) => {
    const u = m.userData, tl = Hh.modest0 + u.i * 0.18, tf = tl - 0.4;
    m.visible = t >= tf; if (!m.visible) return;
    const rest = cartPt(u.rest), k = E.inQuad(inv(tf, tl, t));
    m.position.copy(rest.clone().add(V(0, 0.8 * (1 - k), 0.2 * (1 - k)))); m.position.y += t >= tl ? Math.abs(kick(t, tl, 0.03, 0.06, 26)) : 0;
    m.quaternion.copy(cq.clone().multiply(Q(1.2 * (1 - k), 0.2 * u.i, 0)));
  });
  tags.forEach((tg) => {
    const u = tg.userData, m = modest[u.i], a = inv(Hh.tags0 + u.i * 0.12, Hh.tags0 + u.i * 0.12 + 0.2, t);
    tg.visible = a > 0 && t < 30; if (!tg.visible) return;
    tg.position.copy(m.position).add(V(0, 0.19, 0.1)); tg.quaternion.copy(cq); tg.scale.setScalar(0.6 + 0.4 * a);
    const ok = t >= Hh.check0 + u.i * 0.16;
    if (ok !== u.ok) { u.ok = ok; const g = u.c.getContext('2d'); g.clearRect(0, 0, 256, 120); g.fillStyle = ok ? P.mint : AMBER; rr(g, 4, 4, 248, 112, 22); g.fill(); g.fillStyle = NAVY; g.font = `800 60px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(u.p + (ok ? ' ✓' : ''), 128, 64); tg.material.map.needsUpdate = true; }
  });
}
function layoutClipboard(t, p) {
  if (t < Hh.clipHit) { const hB = V(); docket.handWorld(1, hB); clipboard.position.copy(hB).add(V(0, 0.05, 0.03)); clipboard.quaternion.copy(Q(-0.1, p.rotY * D2R - 0.9, -0.15)); return; }
  const k = inv(Hh.clipHit, Hh.clipHit + 0.42, t), start = local(docketAt(Hh.clipHit), V(0.32, 0.62, 0.2));
  const end = local(docketAt(Hh.clipHit), V(0.1, 0.012, 0.62));
  const pos = start.clone().lerp(end, k); pos.y = lerp(start.y, end.y, k * k) + Math.sin(Math.PI * Math.min(1, k)) * 0.15;
  if (t > Hh.clipHit + 0.42) pos.y += Math.abs(kick(t, Hh.clipHit + 0.42, 0.04, 0.06, 30));
  clipboard.position.copy(pos);
  const lie = Q(-Math.PI / 2, 0.6, 0);
  clipboard.quaternion.copy(Q(-0.3 - 2.4 * k, 0.6 + 3.0 * k, 0.1 + 1.5 * k).slerp(lie, E.inQuad(clamp(k))));
}

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  const s = phoneSpotAt(t); phone.position.copy(s.p); phone.quaternion.copy(s.q);
  scene.updateMatrixWorld(true);
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  const insert = (t >= 11.0 && t < 14.45) || (t >= 15.85 && t < 21.6);
  let tA = insert ? onPhone(-0.19, -0.06, 0) : onPhone(0.0, -0.24, -0.02);
  let tB = insert ? onPhone(0.19, -0.06, 0) : (t < Hh.clipHit ? local(p, V(0.3, 0.6, 0.16)) : null);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  const ex = exprAt(t), dead = ex === 'deadpan';
  docket.face(dead ? 'neutral' : ex, { talk: talkAt(t), blink: dead ? 0.58 : BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  drawScreen(t);
  layoutItems(t); layoutClipboard(t, p);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const S3 = [[0.1, 1.3, 3.55], [0.08, 1.1, 0.3]];
const INS = [[0.215, 1.15, 1.79], [-0.109, 1.12, 0.792]];
const CAM = [
  [0.0, [0.02, 1.22, 3.0], [0.02, 1.0, 0.35]], [2.55, [0.02, 1.21, 2.82], [0.02, 1.0, 0.35]],
  [2.551, [0.16, 1.32, 3.95], [0.12, 1.12, 0.3]], [5.45, [0.15, 1.31, 3.75], [0.12, 1.12, 0.3]],
  [5.451, ...S3], [10.95, [0.08, 1.28, 3.3], [0.08, 1.1, 0.3]],
  [10.951, ...INS], [14.45, [0.2, 1.15, 1.74], [-0.109, 1.12, 0.792]],
  [14.451, ...S3], [15.85, [0.09, 1.29, 3.4], [0.08, 1.1, 0.3]],
  [15.851, ...INS], [21.6, [0.2, 1.15, 1.74], [-0.109, 1.12, 0.792]],
  [21.601, [0.5, 1.2, 2.25], [0.4, 0.78, 0.3]], [23.39, [0.5, 1.19, 2.1], [0.4, 0.78, 0.3]],
  [23.4, [-0.05, 1.26, 2.65], [-0.08, 1.08, 0.45]], [30.0, [-0.05, 1.25, 2.45], [-0.08, 1.09, 0.45]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.atta, 0.016, 0.1, 40) + kick(t, Hh.oil[1], 0.006, 0.08, 40) + kick(t, Hh.mel[2], 0.008, 0.08, 40) + kick(t, Hh.clipHit + 0.42, 0.01, 0.08, 44) + kick(t, 3.4, 0.006, 0.08, 40);
  cam.position.set(pos[0] + shake + 0.006 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.005 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}

// ------------------------------------------------------------------ meme timing: freeze-frames (picture holds, voice continues)
const FREEZE = () => Hh.freeze;
function visualTime(t) { for (const [a, b] of FREEZE()) if (t >= a && t < b) return a; return t; }
function freezeAt(t) { for (const [a, b, fx, fy] of FREEZE()) if (t >= a && t < b) return { a, b, fx, fy }; return null; }   // fx < 0: focus DOCKET's face

// ------------------------------------------------------------------ overlay: outlined meme captions in the upper safe band (y 344–520)
let ICON = null;
const CAP_TOP = 344, CAP_MAXW = 900;
function capLayout(c, cap, t) {
  let size = 62; c.save(); c.letterSpacing = '0px'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  const ICONW = 60, lineW = (ln) => ln.reduce((a, [s]) => a + (s === '@icon' ? ICONW + 14 : c.measureText(s).width), 0);
  for (;;) { c.font = `800 ${size}px ${HI}`; if (Math.max(...cap.lines.map(lineW)) <= CAP_MAXW - 40 || size <= 44) break; size -= 2; }
  const lh = Math.round(size * 1.18), padY = 12, bh = cap.lines.length * lh + padY * 2;
  const lw = Math.min(CAP_MAXW, Math.max(...cap.lines.map(lineW)) + 40);
  const top = cap.lines.length === 1 ? CAP_TOP + 30 : CAP_TOP;              // single lines sit mid-band
  c.restore();
  return { size, lh, padY, bh, lw, top, ICONW, lineW };
}
function overlay(t) {
  const c = octx;
  for (const cap of C.captions) {
    if (t < cap.t0 || t >= cap.t1) continue;
    const L = capLayout(c, cap, t);
    const kin = E.outBack(inv(cap.t0, cap.t0 + 0.18, t)), kout = 1 - E.inQuad(inv(cap.t1 - 0.12, cap.t1, t));
    const fz = freezeAt(t), shakeX = fz ? 5 * Math.sin((t - fz.a) * 60) * Math.exp(-(t - fz.a) * 4) : 0;
    c.save(); c.letterSpacing = '0px'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.font = `800 ${L.size}px ${HI}`;
    c.globalAlpha = kout * Math.min(1, kin + 0.001); const cy = L.top + L.bh / 2, sc = 0.9 + 0.1 * Math.min(1.04, kin);
    c.translate(W / 2 + shakeX, cy); c.scale(sc, sc); c.translate(-W / 2, -cy);
    cap.lines.forEach((ln, li) => {
      let x = W / 2 - L.lineW(ln) / 2; const yy = L.top + L.padY + L.lh * li + L.lh / 2 + 2;
      for (const [s, col] of ln) {
        if (s === '@icon') { if (ICON) { c.save(); c.fillStyle = '#000'; c.beginPath(); c.roundRect(x - 4, yy - L.ICONW / 2 - 4, L.ICONW + 8, L.ICONW + 8, 16); c.fill(); c.beginPath(); c.roundRect(x, yy - L.ICONW / 2, L.ICONW, L.ICONW, 14); c.clip(); c.drawImage(ICON, x, yy - L.ICONW / 2, L.ICONW, L.ICONW); c.restore(); } x += L.ICONW + 14; continue; }
        c.strokeStyle = '#05070C'; c.lineWidth = Math.round(L.size * 0.2); c.strokeText(s, x, yy);
        c.fillStyle = col === 1 ? P.mint : col === 2 ? AMBER : '#FFFFFF'; c.fillText(s, x, yy); x += c.measureText(s).width;
      }
    });
    c.restore();
  }
  const v = c.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.48, H * 0.78); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.35)');
  c.fillStyle = v; c.fillRect(0, 0, W, H);
}
// QA: exact caption geometry (same layout maths as overlay(); stroke half-width included in ink)
window.captionBoxes = (t) => {
  const c = octx, outBoxes = [];
  for (const cap of C.captions) {
    if (t < cap.t0 || t >= cap.t1) continue;
    const L = capLayout(c, cap, t), kin = E.outBack(inv(cap.t0, cap.t0 + 0.18, t)), sc = 0.9 + 0.1 * Math.min(1.04, kin), cy = L.top + L.bh / 2, sw = Math.round(L.size * 0.2) / 2;
    c.save(); c.font = `800 ${L.size}px ${HI}`; c.textBaseline = 'middle';
    let ink = [1e9, 1e9, -1e9, -1e9];
    cap.lines.forEach((ln, li) => {
      let x = W / 2 - L.lineW(ln) / 2; const yy = L.top + L.padY + L.lh * li + L.lh / 2 + 2;
      for (const [s2] of ln) {
        let x0 = x, x1, y0, y1;
        if (s2 === '@icon') { x0 = x - 4; x1 = x + L.ICONW + 4; y0 = yy - L.ICONW / 2 - 4; y1 = yy + L.ICONW / 2 + 4; x += L.ICONW + 14; }
        else { const m = c.measureText(s2); x0 = x - m.actualBoundingBoxLeft - sw; x1 = x + m.actualBoundingBoxRight + sw; y0 = yy - m.actualBoundingBoxAscent - sw; y1 = yy + m.actualBoundingBoxDescent + sw; x += m.width; if (!s2.trim()) continue; }
        ink = [Math.min(ink[0], x0), Math.min(ink[1], y0), Math.max(ink[2], x1), Math.max(ink[3], y1)];
      }
    });
    c.restore();
    const S = (x, y) => [W / 2 + (x - W / 2) * sc, cy + (y - cy) * sc];
    const [ix0, iy0] = S(ink[0], ink[1]), [ix1, iy1] = S(ink[2], ink[3]), [px0, py0] = S(W / 2 - L.lw / 2, L.top), [px1, py1] = S(W / 2 + L.lw / 2, L.top + L.bh);
    outBoxes.push({ t0: cap.t0, lines: cap.lines.length, size: L.size, ink: [ix0, iy0, ix1, iy1].map((v) => +v.toFixed(1)), pill: [Math.min(px0, ix0), Math.min(py0, iy0), Math.max(px1, ix1), Math.max(py1, iy1)].map((v) => +v.toFixed(1)) });
  }
  return outBoxes;
};
window.renderAt = (t) => {
  const vt = visualTime(t), fz = freezeAt(t);
  stageAt(vt); cameraAt(vt);
  renderer.render(scene, cam);
  octx.setTransform(1, 0, 0, 1, 0, 0);
  if (fz && fz.fx < 0) { const v = V(); docket.faceMesh.getWorldPosition(v); v.project(cam); fz.fx = (v.x + 1) / 2 * W; fz.fy = (1 - v.y) / 2 * H; }
  if (fz) {   // freeze-frame: zoom punch toward the focal point, desaturated, small shake, white flash on entry
    const k = E.outBack(inv(fz.a, fz.a + 0.16, t)), s = 1 + (fz.fy < 900 ? 0.3 : 0.18) * k, sx = 4 * Math.sin((t - fz.a) * 55) * Math.exp(-(t - fz.a) * 5);
    octx.fillStyle = '#000'; octx.fillRect(0, 0, W, H);
    octx.save(); octx.filter = 'saturate(0.55) contrast(1.12)'; octx.translate(fz.fx + sx, fz.fy); octx.rotate(-0.025 * k); octx.scale(s, s); octx.translate(-fz.fx, -fz.fy); octx.drawImage(glCanvas, 0, 0); octx.restore();
    const fl = 1 - inv(fz.a, fz.a + 0.12, t); if (fl > 0) { octx.fillStyle = `rgba(255,255,255,${(0.55 * fl).toFixed(3)})`; octx.fillRect(0, 0, W, H); }
  } else octx.drawImage(glCanvas, 0, 0);
  overlay(t);
  return true;
};
window.renderSheet = () => true;

window.READY = (async () => {
  await Promise.all(['700 40px "Space Grotesk"', '500 40px "Space Grotesk"', '700 20px "JetBrains Mono"'].map((f) => document.fonts.load(f)));
  await Promise.all(['800 40px "Noto Sans Devanagari"', '700 40px "Noto Sans Devanagari"', '500 40px "Noto Sans Devanagari"'].map((f) => document.fonts.load(f, 'हिन्दी राशन')));
  const img = new Image(); img.src = '/assets/icon.png'; await img.decode(); ICON = img;
  try { const r = await fetch('/voice.json'); if (r.ok) VOICE = await r.json(); } catch (e) { /* no lip-sync data */ }
  buildStage();
  window.renderAt(0);
  return document.fonts.check('700 40px "Space Grotesk"') && document.fonts.check('800 40px "Noto Sans Devanagari"', 'हिन्दी');
})();
