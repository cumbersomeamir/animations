// moon.js — Ideaverse production 30s english-19 #01 (English): where a phone's crisp moon detail comes from
// (Samsung Galaxy Scene Optimizer recognizes the moon, merges 10+ shots, then a deep-learning engine enhances detail; it can
// confuse a picture of the moon with the real one; turn it off for only what the lens caught). Engine header copied
// unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine); overlay tail
// from english-12. New: procedural moons (soft / noisy / merged / crisp), a night window, the merge + detail card, phone screens.
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

// ------------------------------------------------------------------ the moon (procedural, original): soft = what the lens catches, crisp = enhanced
function mulberry(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const MARIA = [[-0.32, -0.28, 0.3, 0.22], [0.05, -0.38, 0.26, 0.16], [0.28, -0.05, 0.22, 0.3], [-0.12, 0.12, 0.24, 0.18], [-0.42, 0.22, 0.16, 0.24], [0.18, 0.36, 0.14, 0.1]];
function moonCanvas(size, { sharp = 1, blur = 0 } = {}) {
  const tmp = canvas(size, size), t = tmp.getContext('2d'), R = size * 0.46, cx = size / 2, cy = size / 2, r = mulberry(11), mr = mulberry(12);
  const gr = t.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.1, cx, cy, R); gr.addColorStop(0, '#F3EFE4'); gr.addColorStop(0.75, '#D9D3C4'); gr.addColorStop(1, '#A39C8A');
  t.fillStyle = gr; t.beginPath(); t.arc(cx, cy, R, 0, 7); t.fill();
  t.save(); t.beginPath(); t.arc(cx, cy, R, 0, 7); t.clip();
  for (const [x, y, rx, ry] of MARIA) { t.fillStyle = 'rgba(118,112,98,0.55)'; t.beginPath(); t.ellipse(cx + x * R, cy + y * R, rx * R, ry * R, mr() * 3, 0, 7); t.fill(); }
  for (let i = 0; i < 90; i++) {
    const a = r() * 6.283, d = Math.sqrt(r()) * 0.93, x = cx + Math.cos(a) * d * R, y = cy + Math.sin(a) * d * R, cr = (0.012 + r() * r() * 0.075) * R;
    if (!(sharp > 0)) continue; t.globalAlpha = sharp;
    t.fillStyle = 'rgba(96,90,78,0.55)'; t.beginPath(); t.arc(x + cr * 0.15, y + cr * 0.15, cr, 0, 7); t.fill();
    t.fillStyle = 'rgba(255,255,255,0.45)'; t.beginPath(); t.arc(x - cr * 0.18, y - cr * 0.18, cr * 0.62, 0, 7); t.fill();
  }
  if (sharp > 0) { t.globalAlpha = sharp * 0.5; t.strokeStyle = '#FFFFFF'; t.lineWidth = Math.max(1, R * 0.006); const tx = cx - R * 0.12, ty = cy + R * 0.62; for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; t.beginPath(); t.moveTo(tx + Math.cos(a) * R * 0.04, ty + Math.sin(a) * R * 0.04); t.lineTo(tx + Math.cos(a) * R * (0.18 + 0.1 * r()), ty + Math.sin(a) * R * (0.18 + 0.1 * r())); t.stroke(); } }
  t.restore(); t.globalAlpha = 1;
  const c = canvas(size, size), g = c.getContext('2d'); g.filter = blur > 0 ? `blur(${blur}px)` : 'none'; g.drawImage(tmp, 0, 0); g.filter = 'none';
  return c;
}
function noisy(src, size, amt, seed) {                              // a short, noisy shot: the soft moon + sensor grain
  const c = canvas(size, size), g = c.getContext('2d'), r = mulberry(seed);
  g.fillStyle = '#05070E'; g.fillRect(0, 0, size, size - 1); g.fillRect(0, size - 1, size, 1); g.drawImage(src, 0, 0, size, size);
  const n = Math.round(size * size * 0.09 * amt), s = Math.max(1, Math.round(size / 120));
  for (let i = 0; i < n; i++) { const v = Math.round(60 + r() * 190); g.fillStyle = `rgba(${v},${v},${v},${0.25 + 0.4 * r()})`; g.fillRect(Math.floor(r() * size), Math.floor(r() * size), s, s); }
  return c;
}
const IMG = {};

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, labelL, sky;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
const NW = 600, NH = 800, CS = 2;
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
  for (const [x, y] of [[-1.25, 1.35]]) {                              // wall monitor: crescent icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 16; mg.fillStyle = P.mint; mg.beginPath(); mg.arc(256, 150, 80, 0, 7); mg.fill(); mg.shadowBlur = 0; mg.fillStyle = '#0E1424'; mg.beginPath(); mg.arc(292, 124, 74, 0, 7); mg.fill();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  // moon images (built once)
  IMG.crisp = moonCanvas(512, { sharp: 1 });
  IMG.soft = moonCanvas(512, { sharp: 0.3, blur: 9 });
  IMG.shots = Array.from({ length: 12 }, (_, i) => noisy(IMG.soft, 160, 1, 300 + i));
  IMG.merged = noisy(IMG.soft, 512, 0.18, 77);
  // a night window on the back wall with the real moon: small and soft
  { const wc = canvas(512, 360), g = wc.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, '#0A1430'); gr.addColorStop(1, '#1E2C55'); g.fillStyle = gr; g.fillRect(0, 0, 512, 360);
    const r = mulberry(5); for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + 0.6 * r()})`; g.fillRect(r() * 512, r() * 360, 2, 2); }
    g.filter = 'blur(1.5px)'; g.drawImage(IMG.soft, 330, 70, 70, 70); g.filter = 'none';
    sky = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5625), new THREE.MeshBasicMaterial({ map: cvTex(wc), toneMapped: false, fog: false })); sky.position.set(0.55, 1.62, -2.33); scene.add(sky);
    const wf = rbox(0.86, 0.62, 0.04, 0.02, mats.shell); wf.position.set(0.55, 1.62, -2.36); scene.add(wf); }
  docket = createDocket(THREE); scene.add(docket.root);
  // easel + card (merge, then AI detail)
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // the phone (illustrative camera / settings screens; not any real app's UI)
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
let cardKey = '';
function cardState(t) { return { shots: q20(inv(Hh.shots[0], Hh.shots[1], t)), merge: q20(E.inOutCubic(inv(Hh.merge[0], Hh.merge[1], t))), sweep: Math.round(inv(Hh.sweep[0], Hh.sweep[1], t) * 40) / 40 }; }
const MX = 300, MY = 350, MR = 200;
function drawCard(g, s) {
  bg(g, NW, NH, '#0E1424');
  if (!(s.shots > 0)) return;
  const m = s.merge;
  if (m > 0) { g.save(); g.globalAlpha = m; g.drawImage(IMG.merged, MX - MR, MY - MR, MR * 2, MR * 2); g.restore(); }
  for (let i = 0; i < 12; i++) {
    const a = clamp(s.shots * 12 - i); if (!(a > 0)) continue;
    const gx = 75 + (i % 4) * 150, gy = 170 + Math.floor(i / 4) * 170, x = lerp(gx, MX, m), y = lerp(gy, MY, m), sz = lerp(130, MR * 2, m);
    g.save(); g.globalAlpha = a * (1 - m * m); g.drawImage(IMG.shots[i], x - sz / 2, y - sz / 2, sz, sz); g.strokeStyle = 'rgba(244,247,251,0.6)'; g.lineWidth = 3; g.strokeRect(x - sz / 2, y - sz / 2, sz, sz); g.restore();
  }
  if (s.sweep > 0) {
    const x = lerp(MX - MR - 10, MX + MR + 10, s.sweep);
    g.save(); g.beginPath(); g.rect(0, 0, x, NH); g.clip(); g.fillStyle = '#05070E'; g.fillRect(MX - MR, MY - MR, MR * 2, MR * 2); g.drawImage(IMG.crisp, MX - MR, MY - MR, MR * 2, MR * 2); g.restore();
    if (s.sweep < 1) { g.fillStyle = AMBER; g.fillRect(x - 3, MY - MR - 20, 6, MR * 2 + 40); }
  }
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawCard(g, s); cardMesh.material.map.needsUpdate = true;
}
let screenKey = '';
function screenState(t) {
  if (t < Hh.cut1) return { m: 'crisp' };
  if (t < Hh.cut3) return { m: 'view', box: q20(inv(Hh.recog, Hh.recog + 0.3, t)) };
  if (t < Hh.cut4) return { m: 'monitor', box: q20(inv(Hh.screenBox, Hh.screenBox + 0.3, t)) };
  if (t < Hh.plain) return { m: 'settings', off: q20(inv(Hh.toggle, Hh.toggle + 0.25, t)) };
  return { m: 'plain' };
}
function moonBox(g, cx, cy, r, a, col, txt) {
  g.save(); g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = 7; const k = 1 + 0.15 * (1 - a), rr2 = r * k;
  g.strokeRect(cx - rr2, cy - rr2, rr2 * 2, rr2 * 2); tag(g, cx + rr2, cy - rr2 - 56, txt, NAVY, col, 30); g.restore();
}
function drawScreen(t) {
  const s = screenState(t), key = JSON.stringify(s); if (key === screenKey) return; screenKey = key;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  bg(g, SW, SH, '#05070E');
  if (s.m === 'crisp') { g.drawImage(IMG.crisp, 24, 230, 500, 500); }
  if (s.m === 'view') { g.drawImage(IMG.shots[3], 54, 250, 440, 440); if (s.box > 0) moonBox(g, 274, 470, 215, s.box, P.mint, 'MOON'); }
  if (s.m === 'monitor') {
    g.fillStyle = '#1C2033'; rr(g, 40, 260, 468, 330, 18); g.fill(); g.fillStyle = '#0B0F1C'; g.fillRect(64, 282, 420, 284); g.drawImage(IMG.soft, 170, 300, 210, 210);
    g.fillStyle = '#1C2033'; g.fillRect(256, 590, 36, 60); g.fillRect(196, 650, 156, 16);
    if (s.box > 0) moonBox(g, 275, 405, 112, s.box, AMBER, 'MOON?');
  }
  if (s.m === 'settings') {
    g.fillStyle = '#F4F7FB'; g.font = `800 46px ${HI}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('Camera settings', 44, 200);
    g.fillStyle = '#16203A'; rr(g, 30, 290, SW - 60, 120, 24); g.fill();
    g.fillStyle = '#F4F7FB'; g.font = `700 40px ${HI}`; g.fillText('Scene Optimizer', 60, 350);
    const on = 1 - s.off, tx = 400, ty = 350; g.fillStyle = on > 0.5 ? P.mint : '#3A4560'; rr(g, tx, ty - 30, 104, 60, 30); g.fill();
    g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(lerp(tx + 30, tx + 74, on), ty, 24, 0, 7); g.fill();
  }
  if (s.m === 'plain') { g.drawImage(IMG.merged, 24, 230, 500, 500); }
  tag(g, SW - 30, 30, 'EXAMPLE', NAVY, AMBER, 22);
  if (s.m === 'view' || s.m === 'monitor') { g.strokeStyle = 'rgba(244,247,251,0.8)'; g.lineWidth = 6; for (const [x, y, dx, dy] of [[34, 150, 1, 1], [514, 150, -1, 1], [34, 840, 1, -1], [514, 840, -1, -1]]) { g.beginPath(); g.moveTo(x, y + 50 * dy); g.lineTo(x, y); g.lineTo(x + 50 * dx, y); g.stroke(); } }
  screenMesh.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ choreography
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...HOME2, headPitch: 14 } },
  { t: Hh.why - 0.3, p: {} },
  { t: Hh.why, e: 'outBack', p: { headRoll: 12 } },                                               // "Where…?"
  { t: Hh.cut2 - 0.01, p: {} },
  { t: Hh.cut2, p: { x: 1.7, z: 0.5, headRoll: 0 } },                                              // (cut) off for the card
  { t: Hh.cut3 - 0.01, p: {} },
  { t: Hh.cut3, p: { ...HOME2, headPitch: 14 } },                                                  // (cut) the phone again
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headPitch: -2, headRoll: 0 } },                       // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const phoneOn = (t) => t < Hh.cut2 || (t >= Hh.cut3 && t < Hh.cta);
const EXPR = [[-9, 'wow'], [Hh.why, 'puzzled'], [Hh.cut1, 'focus'], [Hh.cut3, 'skeptic'], [Hh.cut4, 'determined'], [Hh.plain, 'happy'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [2.0, 6.2, 11.0, 18.0, 23.0, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, 0.0, 12) + kick(t, Hh.plain, 10) + 6 * Math.sin(t * 3.1);
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
  if (t < Hh.cut1) return ['DETAIL FROM WHERE?', AMBER, NAVY];
  if (t >= Hh.optLbl && t < Hh.recog) return ['SCENE OPTIMIZER', P.mint, NAVY];
  if (t >= Hh.recog && t < Hh.cut2) return ['MOON RECOGNIZED', P.mint, NAVY];
  if (t >= Hh.shots[0] + 0.1 && t < Hh.aiLbl) return ['10+ SHOTS MERGED', P.mint, NAVY];
  if (t >= Hh.aiLbl && t < Hh.cut3) return ['AI DETAIL', AMBER, NAVY];
  if (t >= Hh.skyLbl && t < Hh.cut4) return ['SKY OR SCREEN?', AMBER, NAVY];
  if (t >= Hh.offLbl && t < Hh.plain) return ['TURN IT OFF', P.mint, NAVY];
  if (t >= Hh.plain && t < Hh.cta) return ['WHAT THE LENS CAUGHT', P.mint, NAVY];
  return null;
}

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  const on = phoneOn(t); phone.visible = on;
  if (on) { const s = spot(p, V(0.0, 0.88, 0.36), -0.04); phone.position.copy(s.p); phone.quaternion.copy(s.q); scene.updateMatrixWorld(true); }
  solveArm(0, p, on ? onPhone(-0.19, -0.06, 0) : null, on ? 1 : 0); solveArm(1, p, on ? onPhone(0.19, -0.06, 0) : null, on ? 1 : 0);
  scene.updateMatrixWorld(true);
  updateCard(t); if (on) drawScreen(t);
  const lb = labelAt(t);
  if (lb) { const [txt, bgc, fg] = lb; paintLabel(labelL, txt + bgc, (g, W2, H2) => pill(g, W2, H2, txt, bgc, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.1), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: 0 });
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const HOOKCAM = [[0.08, 1.22, 2.65], [0.08, 1.06, 0.9]];
const CLOSE = [[-0.03, 0.9, 2.32], [-0.03, 0.875, 0.91]];
const CLOSE2 = [[0.16, 0.92, 2.28], [-0.03, 0.875, 0.91]];
const CAM = [
  [0.0, ...HOOKCAM], [Hh.cut1 - 0.01, [0.08, 1.2, 2.55], [0.08, 1.05, 0.9]],
  [Hh.cut1, ...CLOSE], [Hh.cut2 - 0.01, [-0.03, 0.9, 2.24], [-0.03, 0.875, 0.91]],
  [Hh.cut2, ...LAB], [Hh.cut3 - 0.01, [-0.15, 1.13, 1.06], [-0.64, 1.13, -0.32]],
  [Hh.cut3, ...CLOSE2], [Hh.cut4 - 0.01, [0.14, 0.92, 2.22], [-0.03, 0.875, 0.91]],
  [Hh.cut4, ...CLOSE], [Hh.cta - 0.01, [-0.03, 0.9, 2.24], [-0.03, 0.875, 0.91]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  cam.position.set(pos[0] + 0.003 * Math.sin(t * 0.9), pos[1] + 0.003 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: the crisp phone moon vs the small real moon + "DETAIL FROM WHERE?"
window.renderThumb = () => {
  const t = 0.0; cameraAt(t); cam.position.set(0.08, 1.3, 2.85); cam.lookAt(0.08, 1.2, 0.9); stageAt(t); labelL.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 760);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['DETAIL', AMBER, 400], ['FROM WHERE?', '#F4F7FB', 560]].forEach(([w, col, y]) => { let S = 170; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
