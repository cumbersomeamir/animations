// slowmo.js — Ideaverse production 30s english-22 #01 (English): AI slow motion invents in-between frames from two real ones
// (motion guess → move both to the middle → blend); on a fast bounce the guess can fail and the blend shows the ball twice.
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine);
// overlay tail from english-12. New: the coral ball + its two ghosts, viewfinder overlay, three-slot frame card, slow-mo timeline phone screens.
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

// ------------------------------------------------------------------ the ball (original; a coral rubber ball with navy seams)
const CORAL = '#FF7A45', GREY = '#9AA6BF', RED2 = '#FF5A5A';
const BALL_R = 0.075, BA = V(-0.12, 0.92, 0.6), BB = V(0.12, 0.84, 0.6);   // real frame 1 · real frame 2 (a fast bounce between them)
function ballTexture() {
  const c = canvas(512, 256), g = c.getContext('2d');
  g.fillStyle = CORAL; g.fillRect(0, 0, 512, 256);
  g.strokeStyle = '#1B2333'; g.lineWidth = 10;
  g.beginPath(); g.moveTo(0, 128); g.lineTo(512, 128); g.stroke();
  for (const x0 of [128, 384]) { g.beginPath(); for (let y = 0; y <= 256; y += 4) { const x = x0 + 46 * Math.sin((y / 256) * Math.PI * 2); y ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  return cvTex(c);
}

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, labelL, labelH, ball, ghostA, ghostB, ovl, ovlCanvas;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
const NW = 600, NH = 800, CS = 2;
const OV_W = 0.5, OV_H = 0.42, OV_C = V(0, 0.88, 0.48), OPX = 1000, OPY = 840, OV_F = 1.1;   // OV_F: ball → backdrop parallax   // overlay plane behind the balls: brackets, guess arrow, ✗
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: a play icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 14; mg.fillStyle = P.mint; mg.beginPath(); mg.moveTo(216, 80); mg.lineTo(326, 150); mg.lineTo(216, 220); mg.closePath(); mg.fill();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  // the ball: one solid (the real ball) + two ghosts (the blend)
  const bt = ballTexture(), geo = new THREE.SphereGeometry(BALL_R, 48, 32);
  ball = sh(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: bt, roughness: 0.45, metalness: 0.05, emissiveMap: bt, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.35 }))); ball.rotation.set(0.4, 0.6, 0.2); scene.add(ball);
  const gm = () => new THREE.MeshStandardMaterial({ map: bt, roughness: 0.45, transparent: true, opacity: 0.5, depthWrite: false, emissiveMap: bt, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.4 });
  ghostA = new THREE.Mesh(geo, gm()); ghostA.position.copy(BA); ghostA.rotation.set(0.4, 0.6, 0.2); scene.add(ghostA);
  ghostB = new THREE.Mesh(geo, gm()); ghostB.position.copy(BB); ghostB.rotation.set(0.9, 1.4, 0.4); scene.add(ghostB);
  ovlCanvas = canvas(OPX, OPY);
  ovl = new THREE.Mesh(new THREE.PlaneGeometry(OV_W, OV_H), new THREE.MeshBasicMaterial({ map: cvTex(ovlCanvas), transparent: true, depthWrite: false, toneMapped: false })); ovl.position.copy(OV_C); scene.add(ovl);
  // easel + card
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // DOCKET's phone (illustrative player screens; not any real app's UI)
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
function ball2d(g, x, y, r, a = 1) {                                   // the same coral ball, drawn flat
  if (!(a > 0)) return; g.save(); g.globalAlpha = a;
  const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r); gr.addColorStop(0, '#FFB08A'); gr.addColorStop(1, '#E85A2A');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.strokeStyle = '#1B2333'; g.lineWidth = Math.max(1.5, r * 0.12); g.beginPath(); g.arc(x, y, r * 0.98, 0, 7); g.clip(); g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.stroke();
  g.beginPath(); g.arc(x - r * 1.25, y, r * 0.95, -0.9, 0.9); g.stroke(); g.restore();
}
// a little "video frame": dark room, floor line, the ball(s); kind 'roll' (ball on the floor) or 'bounce' (ball in the air)
function frameBox(g, x, y, w, h, balls, border = null, ba = 1) {
  g.save(); rr(g, x, y, w, h, 12); g.clip();
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#22305A'); gr.addColorStop(1, '#16203A'); g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.fillStyle = 'rgba(108,218,126,0.12)'; for (let i = 1; i < 8; i++) g.fillRect(x + (w * i) / 8, y + h * 0.84, 2, h * 0.16);
  g.fillStyle = '#0E1424'; g.fillRect(x, y + h * 0.84, w, h * 0.16);
  balls.forEach(([bx, by, a]) => ball2d(g, x + bx * w, y + by * h, h * 0.19, a));
  g.restore();
  if (border) { g.save(); g.globalAlpha = ba; g.strokeStyle = border; g.lineWidth = 6; rr(g, x, y, w, h, 12); g.stroke(); g.restore(); }
}
function arrow(g, x0, y0, x1, y1, col, lw, head = 14) { const a = Math.atan2(y1 - y0, x1 - x0); g.save(); g.strokeStyle = g.fillStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1 - Math.cos(a) * head * 0.6, y1 - Math.sin(a) * head * 0.6); g.stroke(); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - Math.cos(a - 0.45) * head, y1 - Math.sin(a - 0.45) * head); g.lineTo(x1 - Math.cos(a + 0.45) * head, y1 - Math.sin(a + 0.45) * head); g.closePath(); g.fill(); g.restore(); }
function cross(g, x, y, s, col, lw) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y + s); g.moveTo(x + s, y - s); g.lineTo(x - s, y + s); g.stroke(); g.restore(); }

// ---- the card: three slots REAL 1 / AI-MADE / REAL 2 (card y 500–600 is the label lane; y > 610 stays empty)
let cardKey = '';
const SL = [[40, 24, 520, 140], [40, 178, 520, 140], [40, 332, 520, 140]];   // REAL 1 · in-between · REAL 2
const ROLL = { a: [0.25, 0.65], b: [0.75, 0.65] }, BOUNCE = { a: [0.3, 0.3], b: [0.7, 0.44] };
function cardState(t) {
  if (t >= Hh.cut4) return { m: 'bounce', ok: q20(inv(Hh.realOk, Hh.realOk + 0.3, t)), made: q20(inv(Hh.madeUp, Hh.madeUp + 0.3, t)), pulse: t >= Hh.madeUp + 0.3 ? q20(0.5 + 0.5 * Math.sin((t - Hh.madeUp) * 5)) : 0 };
  return { m: 'roll', a: q20(inv(Hh.slotA, Hh.slotA + 0.3, t)), b: q20(inv(Hh.slotB, Hh.slotB + 0.3, t)), n: q20(inv(Hh.slotN, Hh.slotN + 0.3, t)), arr: q20(inv(Hh.arrows[0], Hh.arrows[1], t)),
    mv: q20(E.inOutCubic(inv(Hh.move[0], Hh.move[1], t))), bl: q20(inv(Hh.blend[0], Hh.blend[1], t)), nt: q20(inv(Hh.newTag, Hh.newTag + 0.25, t)) };
}
function slotTag(g, i, txt, col, a, fg = NAVY) { const [x, y] = SL[i]; chip(g, x + 12, y + 30, txt, a, col, 24, fg); }
function drawCard(g, s) {
  bg(g, NW, NH, '#0E1424');
  if (s.m === 'roll') {
    // REAL 1 and REAL 2 appear; the empty in-between slot waits ("?")
    if (s.a > 0) { g.save(); g.globalAlpha = s.a; frameBox(g, ...SL[0], [[...ROLL.a, 1]]); g.restore(); slotTag(g, 0, 'REAL 1', P.mint, s.a); }
    if (s.b > 0) { g.save(); g.globalAlpha = s.b; frameBox(g, ...SL[2], [[...ROLL.b, 1]]); g.restore(); slotTag(g, 2, 'REAL 2', P.mint, s.b); }
    if (s.n > 0) {
      const [x, y, w, h] = SL[1]; g.save(); g.globalAlpha = s.n; g.setLineDash([12, 10]); g.strokeStyle = 'rgba(244,247,251,0.5)'; g.lineWidth = 4; rr(g, x + 2, y + 2, w - 4, h - 4, 12); g.stroke(); g.setLineDash([]);
      if (s.mv === 0) { g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `800 64px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', x + w / 2, y + h / 2 + 4); }
      g.restore();
    }
    // the motion guess: arrows on REAL 1 — the ball's pixels point to where they are in REAL 2, the floor's pixels stay put
    if (s.arr > 0) {
      const [x, y, w, h] = SL[0];
      for (let j = 0; j < 3; j++) for (let i = 0; i < 12; i++) {
        const px = x + (i + 0.5) * w / 12, py = y + 20 + (j + 0.5) * (h - 30) / 3, onBall = Math.hypot(px - (x + ROLL.a[0] * w), py - (y + ROLL.a[1] * h)) < h * 0.24;
        const k = clamp(s.arr * 1.5 - (i / 12) * 0.5); if (!(k > 0)) continue;
        if (onBall) arrow(g, px, py, px + k * w * 0.42, py, AMBER, 5, 16);
        else { g.fillStyle = `rgba(244,247,251,${0.45 * k})`; g.beginPath(); g.arc(px, py, 3, 0, 7); g.fill(); }
      }
    }
    // move both frames to the middle: REAL 1's ball slides right + down, REAL 2's slides left + up; then they blend into one
    if (s.mv > 0) {
      const [x, y, w, h] = SL[1], r = h * 0.19, aw = 1 - s.bl;
      const ax = lerp(SL[0][0] + ROLL.a[0] * w, x + 0.5 * w, s.mv), ay = lerp(SL[0][1] + ROLL.a[1] * h, y + 0.65 * h, s.mv);
      const bx = lerp(SL[2][0] + ROLL.b[0] * w, x + 0.5 * w, s.mv), by = lerp(SL[2][1] + ROLL.b[1] * h, y + 0.65 * h, s.mv);
      if (s.bl > 0) { frameBox(g, x, y, w, h, [[0.5, 0.65, s.bl]], s.nt > 0 ? AMBER : null, s.nt); }
      ball2d(g, ax, ay, r, 0.5 * aw); ball2d(g, bx, by, r, 0.5 * aw);
      if (s.nt > 0) slotTag(g, 1, 'AI-MADE', AMBER, s.nt);
    }
    return;
  }
  // the fast bounce: REAL 1 (high left) · AI-MADE (both balls, half see-through) · REAL 2 (high right)
  frameBox(g, ...SL[0], [[...BOUNCE.a, 1]], s.ok > 0 ? P.mint : null, s.ok); slotTag(g, 0, 'REAL 1', P.mint, 1);
  frameBox(g, ...SL[1], [[...BOUNCE.a, 0.5], [...BOUNCE.b, 0.5]], s.made > 0 ? AMBER : null, s.made * (0.6 + 0.4 * s.pulse)); slotTag(g, 1, 'AI-MADE', AMBER, 1);
  frameBox(g, ...SL[2], [[...BOUNCE.b, 1]], s.ok > 0 ? P.mint : null, s.ok); slotTag(g, 2, 'REAL 2', P.mint, 1);
  if (s.ok > 0) { for (const i of [0, 2]) { const [x, y, w] = SL[i]; g.save(); g.globalAlpha = s.ok; g.fillStyle = P.mint; g.beginPath(); g.arc(x + w - 40, y + 40, 26, 0, 7); g.fill(); check(g, x + w - 55, y + 26, 30, NAVY, 7); g.restore(); } }
  if (s.made > 0) { const [x, y, w] = SL[1]; g.save(); g.globalAlpha = s.made; g.fillStyle = AMBER; g.beginPath(); g.arc(x + w - 40, y + 40, 26, 0, 7); g.fill(); g.fillStyle = NAVY; g.font = `800 36px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', x + w - 40, y + 42); g.restore(); }
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawCard(g, s); cardMesh.material.map.needsUpdate = true;
}
// ---- the overlay behind the 3D balls: viewfinder brackets (hook), the straight guess arrow and its ✗ (bounce shot)
let ovlKey = '';
const toOv = (v) => [(OV_C.x + (v.x - OV_C.x) * OV_F - OV_C.x + OV_W / 2) / OV_W * OPX, (OV_C.y + OV_H / 2 - (OV_C.y + (v.y - OV_C.y) * OV_F)) / OV_H * OPY];
function ovlState(t) {
  const hook = t < Hh.cut1, bnc = t >= Hh.cut3 && t < Hh.cut4;
  return { br: hook ? 1 : bnc ? q20(inv(Hh.both[0], Hh.both[1], t)) : 0, one: hook ? q20(inv(Hh.one, Hh.one + 0.25, t)) : 0,
    mk: bnc ? q20(inv(Hh.bounce[1], Hh.bounce[1] + 0.25, t)) : 0, gs: bnc ? q20(inv(Hh.guess, Hh.guess + 0.35, t)) : 0, x: bnc ? q20(inv(Hh.fail, Hh.fail + 0.2, t)) : 0, fade: bnc ? q20(1 - inv(Hh.both[0], Hh.both[1], t)) : 1 };
}
function updateOverlay(t) {
  const s = ovlState(t), k = JSON.stringify(s); if (k === ovlKey) return; ovlKey = k;
  const g = ovlCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, OPX, OPY);
  if (s.br > 0) {                                                       // one video frame: a gridded backdrop (the ghosts are see-through) + brackets
    g.save(); g.globalAlpha = s.br; rr(g, 0, 0, OPX, OPY, 36); g.fillStyle = 'rgba(22,32,58,0.92)'; g.fill(); g.clip();
    g.strokeStyle = 'rgba(108,218,126,0.22)'; g.lineWidth = 4; for (let x = 60; x < OPX; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, OPY); g.stroke(); } for (let y = 40; y < OPY; y += 80) { g.beginPath(); g.moveTo(0, y); g.lineTo(OPX, y); g.stroke(); }
    g.restore();
    g.save(); g.globalAlpha = 0.85 * s.br; g.strokeStyle = '#F4F7FB'; g.lineWidth = 10; g.lineCap = 'round'; const m = 40, L = 120;
    for (const [cx, cy, dx, dy] of [[m, m, 1, 1], [OPX - m, m, -1, 1], [m, OPY - m, 1, -1], [OPX - m, OPY - m, -1, -1]]) { g.beginPath(); g.moveTo(cx, cy + dy * L); g.lineTo(cx, cy); g.lineTo(cx + dx * L, cy); g.stroke(); }
    g.restore();
  }
  const [ax, ay] = toOv(BA), [bx, by] = toOv(BB);
  if (s.mk > 0) {                                                       // where the ball was in REAL 1 (dashed ring)
    g.save(); g.globalAlpha = s.mk * s.fade; g.setLineDash([16, 12]); g.strokeStyle = 'rgba(244,247,251,0.85)'; g.lineWidth = 6; g.beginPath(); g.arc(ax, ay, (BALL_R / OV_W) * OPX * 1.05, 0, 7); g.stroke(); g.restore();
  }
  if (s.gs > 0) {                                                       // the motion guess: REAL 1 → REAL 2, then ✗
    g.save(); g.globalAlpha = s.fade; g.setLineDash([22, 16]); const ex = lerp(ax, bx, s.gs), ey = lerp(ay, by, s.gs); arrow(g, ax + 70, ay + 10, ex - 60 * s.gs, ey - 6 * s.gs, AMBER, 10, 34); g.restore();
    if (s.x > 0) { g.save(); g.globalAlpha = s.x * s.fade; g.fillStyle = 'rgba(14,20,36,0.85)'; g.beginPath(); g.arc((ax + bx) / 2, (ay + by) / 2 - 70, 62, 0, 7); g.fill(); cross(g, (ax + bx) / 2, (ay + by) / 2 - 70, 30 * E.outBack(s.x), RED2, 14); g.restore(); }
  }
  ovl.material.map.needsUpdate = true;
}
// ---- DOCKET's phone: the slow-mo timeline (real frames + made-up frames), then the original frames, one at a time
let screenKey = '';
const TILES = 9, REAL_T = [0, 4, 8];
function screenState(t) {
  if (t < Hh.cut5) return { m: 'slow', ai: q20(inv(Hh.aiTiles[0], Hh.aiTiles[1], t)), ph: q20(((t - Hh.cut1) / 1.8) % 1) };
  if (t < Hh.orig) return { m: 'play', ph: Math.round(((t - Hh.cut5) * 2.2) % TILES) };
  return { m: 'orig', sw: q20(inv(Hh.orig, Hh.orig + 0.3, t)), f: t >= Hh.step2 ? 2 : 1, tap: t >= Hh.step2 && t < Hh.step2 + 0.25 ? 1 : 0 };
}
function previewBalls(i) {                                              // what each timeline frame shows (i = 0..8; 4 = the failed in-between)
  const A = BOUNCE.a, B = BOUNCE.b; if (i === 0) return [[...A, 1]]; if (i === 8) return [[...B, 1]];
  if (i === 4) return [[...A, 0.5], [...B, 0.5]];
  const k = i / 8; return i < 4 ? [[lerp(A[0], 0.5, k * 2), lerp(A[1], 0.36, k * 2), 1]] : [[lerp(0.5, B[0], (k - 0.5) * 2), lerp(0.36, B[1], (k - 0.5) * 2), 1]];
}
function drawScreen(t) {
  const s = screenState(t), key = JSON.stringify(s); if (key === screenKey) return; screenKey = key;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px'; bg(g, SW, SH, '#0E1424');
  const orig = s.m === 'orig';
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#F4F7FB'; g.font = `800 46px ${HI}`; g.fillText(orig ? 'Original' : 'Slow-mo', 34, 120);
  if (!orig) chip(g, 250, 120, 'AI', 1, AMBER, 30);
  // preview
  const pv = s.m === 'slow' ? previewBalls(4) : s.m === 'play' ? previewBalls(s.ph) : previewBalls(s.f === 1 ? 0 : 8);
  frameBox(g, 30, 180, SW - 60, 340, pv);
  if (orig) { g.fillStyle = 'rgba(244,247,251,0.9)'; g.font = `800 34px ${HI}`; g.textAlign = 'center'; g.fillText(`Frame ${s.f} of 2`, SW / 2, 570); }
  // timeline: 9 tiles; real frames (mint) and made-up frames (amber); in Original only the real ones remain
  const tw = (SW - 60 - 8 * 10) / 9;
  for (let i = 0; i < TILES; i++) {
    const real = REAL_T.includes(i), x = 30 + i * (tw + 10), y = 640;
    let a = real ? 1 : s.m === 'slow' ? clamp(s.ai * 2.2 - (i % 4) * 0.35) : orig ? 1 - s.sw : 1; if (!(a > 0)) continue;
    g.save(); g.globalAlpha = a; g.fillStyle = real ? '#2A3A60' : 'rgba(255,194,75,0.3)'; rr(g, x, y, tw, 90, 8); g.fill(); g.strokeStyle = real ? P.mint : AMBER; g.lineWidth = 4; rr(g, x, y, tw, 90, 8); g.stroke(); g.restore();
  }
  const playI = s.m === 'play' ? s.ph : s.m === 'slow' ? Math.floor(s.ph * TILES) : (s.f === 1 ? 0 : 8);
  { const x = 30 + playI * (tw + 10) + tw / 2; g.fillStyle = '#F4F7FB'; g.fillRect(x - 3, 626, 6, 118); }
  g.textAlign = 'left'; g.font = `700 28px ${HI}`;
  g.fillStyle = P.mint; rr(g, 40, 790, 26, 26, 6); g.fill(); g.fillStyle = 'rgba(244,247,251,0.85)'; g.fillText('real', 76, 804);
  if (!orig) { g.fillStyle = AMBER; rr(g, 200, 790, 26, 26, 6); g.fill(); g.fillStyle = 'rgba(244,247,251,0.85)'; g.fillText('made by AI', 236, 804); }
  if (orig) { g.fillStyle = '#2A3550'; g.beginPath(); g.arc(SW - 90, 900, 52, 0, 7); g.fill(); g.fillStyle = '#F4F7FB'; g.beginPath(); g.moveTo(SW - 105, 875); g.lineTo(SW - 70, 900); g.lineTo(SW - 105, 925); g.closePath(); g.fill(); g.fillRect(SW - 66, 875, 8, 50);
    if (s.tap) { g.fillStyle = 'rgba(244,247,251,0.45)'; g.beginPath(); g.arc(SW - 90, 900, 40, 0, 7); g.fill(); } }
  g.textAlign = 'left'; tag(g, SW - 30, 30, 'EXAMPLE', NAVY, AMBER, 22);
  screenMesh.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ choreography
const HOME2 = { x: -0.02, z: 0.42, rotY: 0 };
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const OFF = { x: 1.8, z: 0.4, rotY: 0 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...OFF, ...REST_ARMS } },                                                          // off: the ball fills the hook
  { t: Hh.cut1 - 0.01, p: {} },
  { t: Hh.cut1, p: { ...HOME2, headPitch: 14 } },                                                  // (cut) the slow-mo on the phone
  { t: Hh.aiTiles[0] - 0.05, p: {} },
  { t: Hh.aiTiles[0] + 0.35, e: 'outBack', p: { headPitch: 16, headRoll: -7 } },                   // "made it up"
  { t: Hh.cut2 - 0.01, p: {} },
  { t: Hh.cut2, p: { ...OFF, headPitch: 0, headRoll: 0 } },                                        // (cut) off for card + bounce
  { t: Hh.cut5 - 0.01, p: {} },
  { t: Hh.cut5, p: { ...HOME2, headPitch: 14 } },                                                  // (cut) the phone again
  { t: Hh.orig - 0.05, p: {} },
  { t: Hh.orig + 0.3, e: 'outBack', p: { headPitch: 10, headRoll: 5 } },
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headPitch: -2, headRoll: 0 } },                         // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const phoneOn = (t) => (t >= Hh.cut1 && t < Hh.cut2) || (t >= Hh.cut5 && t < Hh.cta);
const EXPR = [[-9, 'skeptic'], [Hh.cut5, 'focus'], [Hh.orig, 'determined'], [Hh.step2 + 0.3, 'happy'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [4.4, 22.1, 25.6, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.aiTiles[0], 12) + kick(t, Hh.orig, 10) + kick(t, Hh.step2, 8) + 6 * Math.sin(t * 3.1);
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
  if (t >= Hh.aiTiles[0] && t < Hh.cut2) return ['AI SLOW-MO', AMBER, NAVY];
  if (t >= Hh.slotB + 0.1 && t < Hh.arrows[0]) return ['TWO REAL FRAMES', P.mint, NAVY];
  if (t >= Hh.arrows[0] && t < Hh.move[0]) return ['MOTION GUESS', AMBER, NAVY];
  if (t >= Hh.blend[0] && t < Hh.cut3) return ['MOVED + BLENDED', AMBER, NAVY];
  if (t >= Hh.fail && t < Hh.both[0]) return ['GUESS FAILS', RED2, '#FFFFFF'];
  if (t >= Hh.both[0] && t < Hh.cut4) return ['BOTH BALLS', AMBER, NAVY];
  if (t >= Hh.madeUp && t < Hh.cut5) return ['NEVER HAPPENED', AMBER, NAVY];
  if (t >= Hh.cut5 + 0.1 && t < Hh.orig) return ['SMOOTH ≠ PROOF', AMBER, NAVY];
  if (t >= Hh.orig && t < Hh.cta) return ['CHECK THE ORIGINAL', P.mint, NAVY];
  return null;
}
// the real ball in the bounce shot: frame 1 → down to the floor (out of frame) → back up to frame 2, very fast
function ballAt(t) {
  const [t0, t1] = Hh.bounce; if (t < t0) return BA.clone(); if (t >= t1) return BB.clone();
  const u = (t - t0) / (t1 - t0), x = lerp(BA.x, BB.x, u), fy = BALL_R;
  const y = u < 0.5 ? lerp(BA.y, fy, (u / 0.5) ** 2) : lerp(fy, BB.y, 1 - (1 - (u - 0.5) / 0.5) ** 2);
  return V(x, y, BA.z);
}

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  const on = phoneOn(t); phone.visible = on;
  if (on) { const s = spot(p, V(0.0, 0.88, 0.36), -0.04); phone.position.copy(s.p); phone.quaternion.copy(s.q); scene.updateMatrixWorld(true); }
  solveArm(0, p, on ? onPhone(-0.19, -0.06, 0) : null, on ? 1 : 0); solveArm(1, p, on ? onPhone(0.19, -0.06, 0) : null, on ? 1 : 0);
  scene.updateMatrixWorld(true);
  // the ball shots: the hook (both ghosts) and the bounce (the real ball, then the blend)
  const hook = t < Hh.cut1, bnc = t >= Hh.cut3 && t < Hh.cut4;
  board.visible = !(hook || bnc || on); ovl.visible = hook || bnc;                     // easel only in the card shots (+ CTA)
  const bl = bnc ? E.inOutCubic(inv(Hh.both[0], Hh.both[1], t)) : 0;
  ball.visible = bnc && bl < 1; if (ball.visible) { ball.position.copy(ballAt(t)); ball.rotation.z = 0.2 - 6 * inv(Hh.bounce[0], Hh.bounce[1], t); ball.material.transparent = bl > 0; ball.material.opacity = 1 - bl; }
  const ghostOn = hook || (bnc && bl > 0); ghostA.visible = ghostB.visible = ghostOn;
  if (ghostOn) { const pop = hook ? 1 + 0.06 * kick(t, Hh.one, 1, 0.15, 18) : 1; ghostA.material.opacity = hook ? 0.45 : 0.45 * bl; ghostB.material.opacity = hook ? 0.45 : 0.45 * bl; ghostA.scale.setScalar(pop); ghostB.scale.setScalar(hook ? 1 + 0.06 * kick(t, Hh.two, 1, 0.15, 18) : 1); }
  if (ovl.visible) updateOverlay(t);
  updateCard(t); if (on) drawScreen(t);
  labelH.visible = false;
  if (t < Hh.cut1) { paintLabel(labelH, 'hook', (g, W2, H2) => { g.fillStyle = AMBER; g.beginPath(); g.roundRect(8, 8, W2 - 16, H2 - 16, 60); g.fill(); g.fillStyle = NAVY; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 112px ${HI}`; g.fillText('A FRAME THAT', W2 / 2, H2 * 0.32); g.fillText('NEVER HAPPENED', W2 / 2, H2 * 0.71); });
    const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion); billboard(labelH, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.1), 0.26); }
  const lb = labelAt(t);
  if (lb) { const [txt, bgc, fg] = lb; paintLabel(labelL, txt + bgc, (g, W2, H2) => pill(g, W2, H2, txt, bgc, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.095), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: 0 });
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const BALLCAM = [[0.0, 0.88, 1.75], [0.0, 0.86, 0.6]];
const CLOSE = [[0.01, 0.9, 2.3], [0.01, 0.875, 0.78]];
const CAM = [
  [0.0, ...BALLCAM], [Hh.cut1 - 0.01, [0.0, 0.88, 1.62], [0.0, 0.86, 0.6]],
  [Hh.cut1, ...CLOSE], [Hh.cut2 - 0.01, [0.01, 0.9, 2.22], [0.01, 0.875, 0.78]],
  [Hh.cut2, ...LAB], [Hh.cut3 - 0.01, [-0.13, 1.13, 1.1], [-0.64, 1.13, -0.32]],
  [Hh.cut3, [0.0, 0.86, 1.92], [0.0, 0.86, 0.6]], [Hh.cut4 - 0.01, [0.0, 0.87, 1.72], [0.0, 0.86, 0.6]],
  [Hh.cut4, ...LAB], [Hh.cut5 - 0.01, [-0.125, 1.13, 1.12], [-0.64, 1.13, -0.32]],
  [Hh.cut5, ...CLOSE], [Hh.cta - 0.01, [0.01, 0.9, 2.2], [0.01, 0.875, 0.78]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  cam.position.set(pos[0] + 0.003 * Math.sin(t * 0.9), pos[1] + 0.003 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: the ball in two places + "NEVER / HAPPENED"
window.renderThumb = () => {
  const t = 0.0; cameraAt(t); stageAt(t); labelL.visible = false; labelH.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 760);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['NEVER', '#F4F7FB', 300], ['HAPPENED', AMBER, 455]].forEach(([w, col, y]) => { let S = 170; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
