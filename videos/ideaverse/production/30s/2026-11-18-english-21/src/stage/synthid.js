// synthid.js — Ideaverse production 30s english-21 #01 (English): an invisible watermark hidden in the pixels of images made by
// Google's AI, found again by a second model after crops, filters and compression; the trap: no mark is not proof it's real.
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine);
// overlay tail from english-12. New: two procedural landscape photos on stands, watermark/finder card, edited print, check screens, first-post card.
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

// ------------------------------------------------------------------ two photos (original procedural landscapes; no real photos)
function mulberry(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// v = 0: lake at sunset with a sailboat (photo A, "looks real") · v = 1: blue-hour lake with a lit cabin (photo B, made by Google's AI)
function drawPhoto(g, w, h, v) {
  const HZ = 0.6, r = mulberry(v ? 77 : 41);
  const sky = g.createLinearGradient(0, 0, 0, h * HZ);
  if (v === 0) { sky.addColorStop(0, '#2B3A6B'); sky.addColorStop(0.55, '#E9806A'); sky.addColorStop(1, '#FFC98A'); }
  else { sky.addColorStop(0, '#111B3D'); sky.addColorStop(0.6, '#4A68AC'); sky.addColorStop(1, '#A9C4E8'); }
  g.fillStyle = sky; g.fillRect(0, 0, w, h * HZ + 1);
  if (v === 1) { g.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(r() * w, r() * h * 0.3, 0.6 + r() * w * 0.003, 0, 7); g.fill(); } }
  const sx = w * (v ? 0.72 : 0.36), sy = h * (v ? 0.17 : 0.45), sr = w * (v ? 0.045 : 0.085);
  g.save(); g.shadowColor = v ? '#F4F1E0' : '#FFD27A'; g.shadowBlur = w * 0.06; g.fillStyle = v ? '#F4F1E0' : '#FFE3A3'; g.beginPath(); g.arc(sx, sy, sr, 0, 7); g.fill(); g.restore();
  const layers = v ? ['#2E4174', '#22305A', '#18223F'] : ['#9A607E', '#6A4268', '#3E2C4C'];
  layers.forEach((col, li) => {
    const base = h * (0.4 + li * 0.065), amp = h * (0.15 - li * 0.035), ph = r() * 6, f1 = 1.2 + r() * 1.5, f2 = 4 + r() * 4;
    g.fillStyle = col; g.beginPath(); g.moveTo(0, h * HZ + 1);
    for (let i = 0; i <= 80; i++) { const k = i / 80, y = base - amp * (0.7 * Math.abs(Math.sin(k * f1 * Math.PI + ph)) + 0.2 * Math.sin(k * f2 * Math.PI + ph * 2)); g.lineTo(k * w, y); }
    g.lineTo(w, h * HZ + 1); g.closePath(); g.fill();
  });
  const lake = g.createLinearGradient(0, h * HZ, 0, h);
  if (v === 0) { lake.addColorStop(0, '#E2906F'); lake.addColorStop(1, '#3A2D52'); } else { lake.addColorStop(0, '#6F8CC4'); lake.addColorStop(1, '#121B36'); }
  g.fillStyle = lake; g.fillRect(0, h * HZ, w, h * (1 - HZ));
  g.fillStyle = v ? 'rgba(244,241,224,0.45)' : 'rgba(255,227,163,0.6)';
  for (let i = 0; i < 9; i++) { const yy = h * (HZ + 0.03) + i * h * 0.028, ww = sr * (2.2 - i * 0.18) * (v ? 0.8 : 1); g.fillRect(sx - ww / 2, yy, ww, Math.max(1, h * 0.007)); }
  if (v === 0) {                                                         // sailboat
    const bx = w * 0.66, by = h * 0.72, s = w * 0.07;
    g.fillStyle = '#2A1E33'; g.beginPath(); g.moveTo(bx - s, by); g.lineTo(bx + s, by); g.lineTo(bx + s * 0.7, by + s * 0.3); g.lineTo(bx - s * 0.7, by + s * 0.3); g.closePath(); g.fill();
    g.fillStyle = '#FFF4E6'; g.beginPath(); g.moveTo(bx, by - s * 1.9); g.lineTo(bx, by - s * 0.1); g.lineTo(bx + s * 0.9, by - s * 0.1); g.closePath(); g.fill();
    g.fillStyle = '#F2D8C8'; g.beginPath(); g.moveTo(bx - s * 0.08, by - s * 1.6); g.lineTo(bx - s * 0.08, by - s * 0.1); g.lineTo(bx - s * 0.7, by - s * 0.1); g.closePath(); g.fill();
  } else {                                                               // cabin with a lit window + its reflection
    const cx = w * 0.7, cy = h * 0.79, s = w * 0.075;
    g.fillStyle = '#0D1428'; g.beginPath(); g.moveTo(w * 0.42, h); g.lineTo(w * 0.48, h * 0.8); g.quadraticCurveTo(w * 0.75, h * 0.76, w, h * 0.78); g.lineTo(w, h); g.closePath(); g.fill();
    g.fillStyle = '#3B2A2A'; g.fillRect(cx - s, cy - s * 0.9, s * 2, s * 0.9);
    g.fillStyle = '#5A2E2E'; g.beginPath(); g.moveTo(cx - s * 1.2, cy - s * 0.85); g.lineTo(cx, cy - s * 1.7); g.lineTo(cx + s * 1.2, cy - s * 0.85); g.closePath(); g.fill();
    g.save(); g.shadowColor = AMBER; g.shadowBlur = s * 0.8; g.fillStyle = AMBER; g.fillRect(cx - s * 0.55, cy - s * 0.65, s * 0.45, s * 0.4); g.fillRect(cx + s * 0.15, cy - s * 0.65, s * 0.45, s * 0.4); g.restore();
  }
  g.fillStyle = v ? '#0A1022' : '#24182E';                              // left shore + pines
  g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.8); g.quadraticCurveTo(w * 0.22, h * 0.8, w * 0.38, h * 0.92); g.lineTo(w * 0.42, h); g.closePath(); g.fill();
  for (let i = 0; i < 6; i++) {
    const x = w * (0.03 + i * 0.06), yb = h * (0.84 + i * 0.012), th = h * (0.16 - i * 0.012) * (0.85 + 0.3 * r()), tw = th * 0.32;
    for (let k = 0; k < 3; k++) { const y0 = yb - th * k * 0.28; g.beginPath(); g.moveTo(x - tw * (1 - k * 0.22), y0); g.lineTo(x, y0 - th * 0.5); g.lineTo(x + tw * (1 - k * 0.22), y0); g.closePath(); g.fill(); }
  }
}
const PHOTO = [], PHOTOL = [];   // portrait (prints) + landscape (card, phone) renders of each photo

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, labelL, prints = [];
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
const NW = 600, NH = 800, CS = 2;
const PR_W = 0.34, PR_H = 0.4533, PCW = 600, PCH = 800, PR_Y = 1.0;            // print size (m), print canvas (px), print centre height
const PRINT = [V(-0.2, 0, 0.74), V(0.2, 0, 0.74)];
function buildPrint(at, v) {
  const grp = new THREE.Group(); grp.position.copy(at); scene.add(grp);
  const pole = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, PR_Y, 12), mats.steel)); pole.position.set(0, PR_Y / 2, -0.04); grp.add(pole);   // stand: one pole behind the frame
  const foot = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.02, 32), mats.navy)); foot.position.set(0, 0.01, -0.04); grp.add(foot);
  const fr = rbox(PR_W + 0.04, PR_H + 0.04, 0.025, 0.008, M('#E9EFF2', { roughness: 0.5 })); fr.position.set(0, PR_Y, 0); grp.add(fr);
  const c = canvas(PCW, PCH);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(PR_W, PR_H), new THREE.MeshBasicMaterial({ map: cvTex(c), toneMapped: false })); mesh.position.set(0, PR_Y, 0.0135); grp.add(mesh);
  return { grp, c, mesh, v, key: '' };
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: a picture icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 14; mg.strokeStyle = P.mint; mg.lineWidth = 12; rr(mg, 166, 70, 180, 150, 16); mg.stroke();
    mg.fillStyle = P.mint; mg.beginPath(); mg.moveTo(186, 205); mg.lineTo(236, 140); mg.lineTo(276, 185); mg.lineTo(296, 165); mg.lineTo(326, 205); mg.closePath(); mg.fill(); mg.beginPath(); mg.arc(300, 112, 14, 0, 7); mg.fill();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  for (const v of [0, 1]) { const a = canvas(PCW - 48, PCH - 48); drawPhoto(a.getContext('2d'), a.width, a.height, v); PHOTO[v] = a; const b = canvas(1000, 600); drawPhoto(b.getContext('2d'), 1000, 600, v); PHOTOL[v] = b; }
  { const d = PHOTOL[1].getContext('2d').getImageData((ZB[0] - IMG[0]) * 2, (ZB[1] - IMG[1]) * 2, ZB[2] * 2, ZB[3] * 2), cw = ZB[2] * 2 / 15, ch = ZB[3] * 2 / 3; CELLS = [];   // enlarged pixels under the zoom box
    for (let j = 0; j < 3; j++) for (let i = 0; i < 15; i++) { let r = 0, g2 = 0, b = 0, n = 0; for (let y = Math.floor(j * ch); y < Math.floor((j + 1) * ch); y++) for (let x = Math.floor(i * cw); x < Math.floor((i + 1) * cw); x++) { const o = (y * d.width + x) * 4; r += d.data[o]; g2 += d.data[o + 1]; b += d.data[o + 2]; n++; } CELLS.push([r / n | 0, g2 / n | 0, b / n | 0]); } }
  prints = [buildPrint(PRINT[0], 0), buildPrint(PRINT[1], 1)];
  // easel + card
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // DOCKET's phone (illustrative check screens; not any real app's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  labelL = makeLabel(0.5, 0.13);
}

// ------------------------------------------------------------------ drawing helpers (pure functions of a quantised state)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
const bg = (g, w, h, col) => { g.fillStyle = col; g.fillRect(0, 0, w, h - 1); g.fillRect(0, h - 1, w, 1); };   // two partial fills (a lone full-canvas fill can be dropped by Chromium)
const GREY = '#9AA6BF';
const MARKS = (() => { const r = mulberry(5), s = new Set(); while (s.size < 17) s.add(Math.floor(r() * 45)); return [...s]; })();   // 15 × 3 cells
// photo drawn into a box, optionally edited: crop (zoom in), filter (warm tint), compress (blocks)
function photoBox(g, src, x, y, w, h, ed = {}) {
  g.save(); rr(g, x, y, w, h, 10); g.clip();
  const z = 1 + 0.32 * (ed.crop || 0), sw = src.width / z, shh = src.height / z, sx = (src.width - sw) * 0.62, sy = (src.height - shh) * 0.5;
  if ((ed.comp || 0) > 0) {
    const tc = canvas(Math.max(8, Math.round(w / 22)), Math.max(8, Math.round(h / 22))), tg = tc.getContext('2d'); tg.drawImage(src, sx, sy, sw, shh, 0, 0, tc.width, tc.height);
    g.drawImage(src, sx, sy, sw, shh, x, y, w, h); g.globalAlpha = ed.comp; g.imageSmoothingEnabled = false; g.drawImage(tc, x, y, w, h); g.imageSmoothingEnabled = true; g.globalAlpha = 1;
  } else g.drawImage(src, sx, sy, sw, shh, x, y, w, h);
  if ((ed.filt || 0) > 0) { g.globalCompositeOperation = 'color'; g.globalAlpha = 0.75 * ed.filt; g.fillStyle = '#C8874A'; g.fillRect(x, y, w, h); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  g.restore();
}
function scanLine(g, x, y, w, h, k) { if (!(k > 0 && k < 1)) return; const yy = y + h * k; g.save(); const gr = g.createLinearGradient(0, yy - 40, 0, yy); gr.addColorStop(0, 'rgba(108,218,126,0)'); gr.addColorStop(1, 'rgba(108,218,126,0.45)'); g.fillStyle = gr; g.fillRect(x, yy - 40, w, 40); g.fillStyle = P.mint; g.fillRect(x, yy - 3, w, 6); g.restore(); }
function centreChip(g, cx, y, txt, a, col, size, fg = NAVY) { if (!(a > 0)) return; g.save(); g.font = `800 ${size}px ${HI}`; const w = g.measureText(txt).width + size * 1.1; g.restore(); chip(g, cx - w / 2, y, txt, a, col, size, fg); }
function stamp(g, cx, cy, txt, a, col, size, rot) { if (!(a > 0)) return; g.save(); g.globalAlpha = Math.min(1, a); g.translate(cx, cy); g.rotate(rot); const k = 1.6 - 0.6 * E.outBack(clamp(a)); g.scale(k, k); g.font = `800 ${size}px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(txt).width + size; g.lineWidth = size * 0.16; g.strokeStyle = col; rr(g, -w / 2, -size * 0.85, w, size * 1.7, size * 0.3); g.stroke(); g.fillStyle = 'rgba(14,20,36,0.55)'; g.fill(); g.fillStyle = col; g.fillText(txt, 0, 3); g.restore(); }

// ---- the card: B/C (watermark + finder) and H (first post); card y 500–600 is the label lane, y > 610 stays empty
let cardKey = '';
const IMG = [50, 70, 500, 300];                                           // image box on the card
const ZB = [318, 282, 150, 33];                                           // zoom box on the image (15 × 3 cells → inset)
const INSET = [50, 398, 500, 96];
let CELLS = null;
function cardState(t) {
  if (t >= Hh.cut5) return { m: 'post', big: q20(1 - inv(Hh.posts[0] - 0.1, Hh.posts[0] + 0.35, t)), rows: [0, 1, 2].map((i) => q20(inv(Hh.posts[0] + i * 0.28, Hh.posts[0] + i * 0.28 + 0.35, t))), first: q20(inv(Hh.first, Hh.first + 0.3, t)) };
  return { m: 'mark', gen: q20(inv(Hh.gen[0], Hh.gen[1], t)), maker: q20(inv(Hh.gen[0] - 0.1, Hh.gen[0] + 0.2, t)), lens: q20(inv(Hh.lens, Hh.lens + 0.3, t)), marks: q20(inv(Hh.marks[0], Hh.marks[1], t)),
    finder: q20(inv(Hh.finder, Hh.finder + 0.3, t)), link: q20(inv(Hh.together, Hh.together + 0.45, t)), scan: q20(inv(Hh.findScan[0], Hh.findScan[1], t)), found: q20(inv(Hh.found1, Hh.found1 + 0.25, t)) };
}
function drawCard(g, s) {
  bg(g, NW, NH, '#0E1424');
  if (s.m === 'mark') {
    const [x, y, w, h] = IMG;
    g.fillStyle = '#16203A'; rr(g, x, y, w, h, 10); g.fill();
    if (s.gen > 0) { g.save(); g.beginPath(); g.rect(x, y, w, h * s.gen); g.clip(); photoBox(g, PHOTOL[1], x, y, w, h); g.restore(); scanLine(g, x, y, w, h, s.gen); }
    chip(g, x + 14, y + 32, 'AI MAKER', s.maker * (1 - s.finder), P.mint, 24);
    // zoom box + inset of enlarged pixels, then the hidden pattern in them
    const ins = s.lens * (1 - s.finder);
    if (ins > 0) {
      g.save(); g.globalAlpha = ins; g.strokeStyle = '#F4F7FB'; g.lineWidth = 3; g.strokeRect(ZB[0], ZB[1], ZB[2], ZB[3]);
      g.strokeStyle = 'rgba(244,247,251,0.45)'; g.lineWidth = 2; g.beginPath(); g.moveTo(ZB[0], ZB[1] + ZB[3]); g.lineTo(INSET[0], INSET[1]); g.moveTo(ZB[0] + ZB[2], ZB[1] + ZB[3]); g.lineTo(INSET[0] + INSET[2], INSET[1]); g.stroke();
      const cw = INSET[2] / 15, ch = INSET[3] / 3;
      for (let j = 0; j < 3; j++) for (let i = 0; i < 15; i++) { const c = CELLS[j * 15 + i]; g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; g.fillRect(INSET[0] + i * cw, INSET[1] + j * ch, cw - 2, ch - 2); }
      MARKS.forEach((m, k) => { const a = clamp(s.marks * 1.6 - (k / MARKS.length) * 0.6); if (!(a > 0)) return; const i = m % 15, j = Math.floor(m / 15); g.globalAlpha = ins * a; g.strokeStyle = P.mint; g.lineWidth = 4; g.strokeRect(INSET[0] + i * cw + 6, INSET[1] + j * ch + 6, cw - 14, ch - 14); g.fillStyle = P.mint; g.beginPath(); g.arc(INSET[0] + i * cw + cw / 2 - 1, INSET[1] + j * ch + ch / 2 - 1, 4, 0, 7); g.fill(); });
      g.restore();
    }
    // the second model: AI MAKER ⇄ AI FINDER (trained together), then the finder scans the image → MARK FOUND
    if (s.finder > 0) {
      g.save(); g.globalAlpha = s.finder;
      chip(g, 64, 446, 'AI MAKER', 1, P.mint, 28); chip(g, 340, 446, 'AI FINDER', 1, P.mint, 28);
      if (s.link > 0) { g.strokeStyle = P.mint; g.lineWidth = 6; g.lineCap = 'round'; const x0 = 262, x1 = lerp(262, 330, s.link); g.beginPath(); g.moveTo(x0, 438); g.lineTo(x1, 438); g.moveTo(x0, 454); g.lineTo(x1, 454); g.stroke();
        g.fillStyle = P.mint; g.beginPath(); g.moveTo(x1 + 8, 438); g.lineTo(x1 - 6, 428); g.lineTo(x1 - 6, 448); g.fill(); g.beginPath(); g.moveTo(x0 - 8, 454); g.lineTo(x0 + 6, 444); g.lineTo(x0 + 6, 464); g.fill(); }
      g.restore();
      scanLine(g, x, y, w, h, s.scan);
      if (s.found > 0) { g.save(); g.globalAlpha = s.found; g.strokeStyle = P.mint; g.lineWidth = 6; rr(g, x + 3, y + 3, w - 6, h - 6, 10); g.stroke(); g.restore(); centreChip(g, x + w / 2, y + h - 40, '✓ MARK FOUND', s.found, P.mint, 30); }
    }
    return;
  }
  // payoff: the photo with no mark → where it first appeared (reposts, newest first; the oldest = the first post)
  if (s.big > 0) { g.save(); g.globalAlpha = s.big; photoBox(g, PHOTOL[0], 50, 70, 500, 300); centreChip(g, 300, 330, 'NO MARK', 1, GREY, 30); g.restore(); }
  const ROWS = [['Repost', '2 hours ago'], ['Repost', '1 day ago'], ['First post', '9 days ago']];
  ROWS.forEach(([a, b], i) => {
    const k = s.rows[i]; if (!(k > 0)) return; const y = 40 + i * 152, x = lerp(110, 30, E.outCubic(k)), hl = i === 2 ? s.first : 0;
    g.save(); g.globalAlpha = k; g.fillStyle = hl > 0 ? `rgba(255,194,75,${0.16 * hl})` : '#16203A'; rr(g, x, y, 540, 132, 16); g.fill();
    if (hl > 0) { g.strokeStyle = AMBER; g.globalAlpha = k * hl; g.lineWidth = 5; rr(g, x, y, 540, 132, 16); g.stroke(); g.globalAlpha = k; }
    photoBox(g, PHOTOL[0], x + 14, y + 14, 172, 104);
    const y1 = i === 2 && hl > 0 ? lerp(44, 32, hl) : 44, y2 = i === 2 && hl > 0 ? lerp(88, 68, hl) : 88;
    g.fillStyle = '#F4F7FB'; g.font = `800 32px ${HI}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(a, x + 208, y + y1);
    g.fillStyle = 'rgba(244,247,251,0.7)'; g.font = `700 26px ${HI}`; g.fillText(b, x + 208, y + y2);
    if (i === 2 && hl > 0) { g.globalAlpha = k * hl; g.fillStyle = AMBER; g.font = `800 28px ${HI}`; g.fillText('“made with AI”', x + 208, 104 + y); }
    g.restore();
  });
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawCard(g, s); cardMesh.material.map.needsUpdate = true;
}
// ---- the prints: photo B is edited (crop, filter, compress) and the finder still finds its mark; photo A shows no mark, then AI-MADE
function printState(pr, t) {
  if (pr.v === 1) return { crop: q20(inv(Hh.crop, Hh.crop + 0.35, t)), filt: q20(inv(Hh.filter, Hh.filter + 0.3, t)), comp: q20(inv(Hh.compress, Hh.compress + 0.3, t)),
    sc: t >= Hh.cut2 && t < Hh.cut3 ? q20(((t - Hh.cut2) % 0.85) / 0.85) : 0, ok: t >= Hh.cut2 ? q20(inv(Hh.crop + 0.4, Hh.crop + 0.6, t)) : 0,
    ed: t < Hh.filter ? 'CROPPED' : t < Hh.compress ? 'FILTERED' : 'COMPRESSED', edA: q20(inv(Hh.crop, Hh.crop + 0.2, t)) };
  return { no: t >= Hh.cut4 ? 1 : 0, ai: q20(inv(Hh.other, Hh.other + 0.35, t)) };
}
function updatePrint(pr, t) {
  const s = printState(pr, t), k = JSON.stringify(s); if (k === pr.key) return; pr.key = k;
  const g = pr.c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  bg(g, PCW, PCH, '#FBF8F1');
  photoBox(g, PHOTO[pr.v], 24, 24, PCW - 48, PCH - 48, s);
  if (pr.v === 1) {
    if (s.edA > 0) chip(g, 44, 74, s.ed, s.edA, '#F4F7FB', 30);
    if (s.sc > 0) scanLine(g, 24, 24, PCW - 48, PCH - 48, s.sc);
    if (s.ok > 0) centreChip(g, PCW / 2, PCH - 84, '✓ MARK FOUND', s.ok, P.mint, 36);
  } else {
    if (s.no > 0) centreChip(g, PCW / 2, PCH - 84, 'NO MARK', s.no, GREY, 36);
    stamp(g, PCW / 2, PCH * 0.42, 'AI-MADE', s.ai, AMBER, 64, -0.18);
  }
  pr.mesh.material.map.needsUpdate = true;
}
// ---- DOCKET's phone: the check on photo B (watermark found), then on photo A (no watermark)
let screenKey = '';
function screenState(t) {
  const B = t < Hh.swap; return { p: B ? 1 : 0, sw: q20(inv(Hh.swap, Hh.swap + 0.2, t)), dots: Math.floor(t * 4) % 4, res: B ? (t >= Hh.found2 ? 1 : 0) : (t >= Hh.nomark ? 1 : 0), sub: B ? 0 : q20(inv(Hh.notG, Hh.notG + 0.3, t)) };
}
function drawScreen(t) {
  const s = screenState(t), key = JSON.stringify(s); if (key === screenKey) return; screenKey = key;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px'; bg(g, SW, SH, '#0E1424');
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#F4F7FB'; g.font = `800 46px ${HI}`; g.fillText('AI check', 34, 120);
  const off = s.p === 0 ? lerp(SW, 0, E.outCubic(s.sw)) : 0;
  photoBox(g, PHOTOL[s.p], 30 + off, 180, SW - 60, 330);
  g.fillStyle = '#16203A'; rr(g, 30, 560, SW - 60, 220, 24); g.fill();
  g.textAlign = 'center';
  if (!s.res) { g.fillStyle = 'rgba(244,247,251,0.85)'; g.font = `700 32px ${HI}`; g.fillText('Looking for a watermark' + '.'.repeat(s.dots), SW / 2, 670); }
  else if (s.p === 1) { centreChip(g, SW / 2, 636, 'WATERMARK FOUND', 1, P.mint, 40); g.fillStyle = 'rgba(244,247,251,0.85)'; g.font = `700 34px ${HI}`; g.fillText('Made with Google AI', SW / 2, 728); }
  else { centreChip(g, SW / 2, 636, 'NO WATERMARK', 1, GREY, 40); if (s.sub > 0) { g.globalAlpha = s.sub; g.fillStyle = 'rgba(244,247,251,0.85)'; g.font = `700 34px ${HI}`; g.fillText('Not made by Google AI', SW / 2, 728); g.globalAlpha = 1; } }
  g.textAlign = 'left'; tag(g, SW - 30, 30, 'EXAMPLE', NAVY, AMBER, 22);
  screenMesh.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ choreography
const HOME2 = { x: -0.02, z: 0.42, rotY: 0 };
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const OFF = { x: 1.8, z: 0.4, rotY: 0 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...OFF, ...REST_ARMS } },                                                          // off: the two photos fill the hook
  { t: Hh.cut3 - 0.01, p: {} },
  { t: Hh.cut3, p: { ...HOME2, headPitch: 14 } },                                                  // (cut) the phone check
  { t: Hh.found2 - 0.05, p: {} },
  { t: Hh.found2 + 0.3, e: 'outBack', p: { headPitch: 8, headRoll: 5 } },                          // nods at "found"
  { t: Hh.nomark - 0.05, p: {} },
  { t: Hh.nomark + 0.35, e: 'outBack', p: { headPitch: 16, headRoll: -7 } },                       // tilts at "no mark"
  { t: Hh.cut4 - 0.01, p: {} },
  { t: Hh.cut4, p: { ...OFF, headPitch: 0, headRoll: 0 } },                                        // (cut) off for the photos + card
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headPitch: -2, headYaw: 0 } },                          // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const phoneOn = (t) => t >= Hh.cut3 && t < Hh.cut4;
const EXPR = [[-9, 'focus'], [Hh.found2, 'happy'], [Hh.nomark, 'skeptic'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [1.6, 15.4, 18.2, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.found2, 12) + kick(t, Hh.nomark, 12) + 6 * Math.sin(t * 3.1);
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
  if (t < Hh.cut1) return ['WHICH ONE IS AI?', AMBER, NAVY];
  if (t >= Hh.lens && t < Hh.finder) return ['INVISIBLE WATERMARK', P.mint, NAVY];
  if (t >= Hh.together && t < Hh.cut2) return ['TRAINED TOGETHER', P.mint, NAVY];
  if (t >= Hh.crop + 0.4 && t < Hh.cut3) return ['STILL FOUND', P.mint, NAVY];
  if (t >= Hh.found2 && t < Hh.swap) return ['MARK FOUND', P.mint, NAVY];
  if (t >= Hh.notG && t < Hh.cut4) return ['NOT GOOGLE’S AI', GREY, NAVY];
  if (t >= Hh.other && t < Hh.cut5) return ['ANOTHER AI', AMBER, NAVY];
  if (t >= Hh.cut5 + 0.1 && t < Hh.posts[0]) return ['NO MARK ≠ REAL', AMBER, NAVY];
  if (t >= Hh.posts[0] && t < Hh.cta) return ['FIND THE FIRST POST', P.mint, NAVY];
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
  const showPrints = t < Hh.cut1 || (t >= Hh.cut2 && t < Hh.cut3) || (t >= Hh.cut4 && t < Hh.cut5);
  prints.forEach((pr) => { pr.grp.visible = showPrints; if (showPrints) updatePrint(pr, t); });
  board.visible = (t >= Hh.cut1 && t < Hh.cut2) || t >= Hh.cut5;
  updateCard(t); if (on) drawScreen(t);
  const lb = labelAt(t);
  if (lb) { const [txt, bgc, fg] = lb; paintLabel(labelL, txt + bgc, (g, W2, H2) => pill(g, W2, H2, txt, bgc, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, LBL_UP(t)), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: 0 });
}
const LBL_UP = (t) => -0.095;

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const HOOKCAM = [[0.0, 1.03, 2.63], [0.0, 1.03, 0.5]];
const PRINTCAM = [[0.21, 0.93, 2.48], [0.2, 0.93, 0.74]];
const CLOSE = [[0.01, 0.9, 2.3], [0.01, 0.875, 0.78]];
const CAM = [
  [0.0, ...HOOKCAM], [Hh.hidden - 0.1, [0.01, 1.03, 2.56], [0.01, 1.03, 0.5]], [Hh.cut1 - 0.01, [0.08, 1.03, 2.4], [0.13, 1.03, 0.6]],
  [Hh.cut1, ...LAB], [Hh.cut2 - 0.01, [-0.13, 1.13, 1.1], [-0.64, 1.13, -0.32]],
  [Hh.cut2, ...PRINTCAM], [Hh.cut3 - 0.01, [0.205, 0.935, 2.38], [0.2, 0.935, 0.74]],
  [Hh.cut3, ...CLOSE], [Hh.cut4 - 0.01, [0.01, 0.9, 2.2], [0.01, 0.875, 0.78]],
  [Hh.cut4, [0.0, 1.03, 2.63], [0.0, 1.03, 0.5]], [Hh.cut5 - 0.01, [-0.08, 1.03, 2.42], [-0.13, 1.03, 0.6]],
  [Hh.cut5, ...LAB], [Hh.cta - 0.01, [-0.13, 1.13, 1.1], [-0.64, 1.13, -0.32]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  cam.position.set(pos[0] + 0.003 * Math.sin(t * 0.9), pos[1] + 0.003 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: the two photos + "WHICH ONE / IS AI?"
window.renderThumb = () => {
  const t = 0.0; cameraAt(t); cam.position.set(0.0, 1.03, 2.63); cam.lookAt(0.0, 1.03, 0.5); stageAt(t); labelL.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 760);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['WHICH ONE', '#F4F7FB', 400], ['IS AI?', AMBER, 560]].forEach(([w, col, y]) => { let S = 170; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
