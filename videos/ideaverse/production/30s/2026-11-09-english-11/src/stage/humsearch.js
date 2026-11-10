// humsearch.js — Ideaverse production 30s english-11 #01 (English): how a phone names a song you only hum.
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine:
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
function tag(g, x, y, txt, fg, bg, size = 26) { g.save(); g.textAlign = 'left'; g.font = `700 ${size}px ${HI}`; g.letterSpacing = '2px'; const w = g.measureText(txt).width + 30; g.fillStyle = bg; rr(g, x - w, y, w, size + 20, (size + 20) / 2); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, x - w + 15, y + (size + 20) / 2 + 2); g.restore(); }
function badge(g, x, y, r, txt, bg, fg) { g.save(); g.fillStyle = bg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = fg; g.font = `800 ${Math.round(r * 1.2)}px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y + 2); g.restore(); }

// ---- helpers
function chip(g, x, y, txt, a, col, size = 26, fg = NAVY) { if (!(a > 0)) return 0; g.save(); g.globalAlpha = Math.min(1, a); g.translate(x, y); const k = 0.8 + 0.2 * Math.min(1, a); g.scale(k, k); g.font = `800 ${size}px ${HI}`; g.textAlign = 'left'; const w = g.measureText(txt).width + size * 1.1; g.fillStyle = col; rr(g, 0, -size * 0.82, w, size * 1.64, size * 0.82); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, size * 0.55, 2); g.restore(); return w; }
function ring(g, x, y, rx, ry, a, col) { if (!(a > 0)) return; const k = 1.25 - 0.25 * Math.min(1, a); g.save(); g.globalAlpha = Math.min(1, a); g.strokeStyle = col; g.lineWidth = 7; g.shadowColor = col; g.shadowBlur = 14; g.beginPath(); g.ellipse(x, y, rx * k, ry * k, 0, 0, 7); g.stroke(); g.restore(); }
function noteGlyph(g, x, y, s, col) { g.save(); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = s * 0.16; g.beginPath(); g.ellipse(x, y, s * 0.42, s * 0.3, -0.4, 0, 7); g.fill(); g.beginPath(); g.moveTo(x + s * 0.36, y - s * 0.08); g.lineTo(x + s * 0.36, y - s * 1.2); g.quadraticCurveTo(x + s * 0.9, y - s * 0.9, x + s * 0.8, y - s * 0.5); g.stroke(); g.restore(); }
const SONGS = [['Neon Kettle', 74, [0, 2, 4, 2, 6, 4]], ['Blue Tram Home', 68, [0, 2, 4, 2, 5, 4]], ['Paper Kites at Noon', 41, [4, 3, 1, 3, 0, 1]]];
const HUMN = C.hum.map(([, n]) => n);                     // the hummed tune (step numbers)

// ---- easel card (600 x 800 logical, drawn at 2x)
const NW = 600, NH = 800, CS = 2;
const NOTEX = (i) => 100 + i * 80, NOTEY = (n) => 340 - n * 20;      // note heads sit on the staff (lines y 210–354)
function drawStaff(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  g.fillStyle = '#F4F7FB'; g.font = `800 40px ${HI}`; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText('What’s this song?', NW / 2, 92);
  g.strokeStyle = 'rgba(244,247,251,0.35)'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { const y = 210 + i * 36; g.beginPath(); g.moveTo(40, y); g.lineTo(560, y); g.stroke(); }
  HUMN.forEach((n, i) => { const a = s.notes[i]; if (!(a > 0)) return; g.save(); g.globalAlpha = Math.min(1, a); noteGlyph(g, NOTEX(i), NOTEY(n), 34 * (0.7 + 0.3 * Math.min(1, a)), P.mint); g.restore(); });
  g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `700 26px ${HI}`; g.textAlign = 'left'; g.fillText('lyrics:', 40, 470);
  if (s.blank > 0) { g.save(); g.globalAlpha = Math.min(1, s.blank); g.strokeStyle = AMBER; g.lineWidth = 6; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(140 + i * 100, 482); g.lineTo(210 + i * 100, 482); g.stroke(); } g.fillStyle = AMBER; g.font = `900 44px ${HI}`; g.fillText('?', 548, 468); g.restore(); }
  if (s.hum > 0) chip(g, 150, 600, 'just hum it', s.hum, P.mint, 34);
}
function contour(g, ns, x0, y0, dx, dy, col, lw, k = 1) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); ns.forEach((n, i) => { const x = x0 + i * dx, y = y0 - n * dy; if (i === 0) g.moveTo(x, y); else { g.lineTo(x, ns[i - 1] * -dy + y0); g.lineTo(x, y); } g.lineTo(x + dx * 0.8, y); }); g.setLineDash([2000 * k, 4000]); g.stroke(); g.restore(); }
function drawShape(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  g.fillStyle = 'rgba(244,247,251,0.7)'; g.font = `800 24px ${HI}`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('YOUR HUM', 30, 46);
  g.fillStyle = '#16203A'; rr(g, 20, 66, 560, 200, 18); g.fill();
  const lift = 54 * s.pitch;                                  // sung higher: same shape, different pitch
  // wobbly hum line (fades) → clean melody shape
  if (s.shape < 1) { g.save(); g.globalAlpha = 1 - s.shape; g.strokeStyle = '#F4F7FB'; g.lineWidth = 4; g.beginPath(); for (let x = 0; x <= 520; x += 4) { const i = Math.min(5, Math.floor(x / 87)), n = HUMN[i]; const y = 220 - n * 22 + 9 * Math.sin(x * 0.21) + 5 * Math.sin(x * 0.53); x ? g.lineTo(40 + x, y) : g.moveTo(40 + x, y); } g.stroke(); g.restore(); }
  if (s.shape > 0) contour(g, HUMN, 50, 222 - lift, 88, 22, P.mint, 10, s.shape);
  if (s.shape >= 1) chip(g, 330, 98, 'melody shape', 1, P.mint, 22);
  if (s.pitch > 0) { g.save(); g.globalAlpha = Math.min(1, s.pitch); g.strokeStyle = AMBER; g.lineWidth = 5; g.beginPath(); g.moveTo(560, 230); g.lineTo(560, 230 - lift); g.stroke(); g.fillStyle = AMBER; g.beginPath(); g.moveTo(550, 240 - lift); g.lineTo(560, 222 - lift); g.lineTo(570, 240 - lift); g.fill(); g.restore(); chip(g, 30, 98, 'higher pitch, same shape', s.pitch, AMBER, 20); }
  // songs to compare against
  SONGS.forEach(([name, pct, ns], i) => { const a = s.songs[i]; if (!(a > 0)) return; const y = 300 + i * 158;
    g.save(); g.globalAlpha = Math.min(1, a); g.fillStyle = '#16203A'; rr(g, 20 + 40 * (1 - Math.min(1, a)), y, 560, 140, 18); g.fill();
    g.fillStyle = '#F4F7FB'; g.font = `700 24px ${HI}`; g.fillText(name, 40, y + 28); contour(g, ns, 46, y + 112, 56, 12, 'rgba(244,247,251,0.75)', 6);
    if (s.match > 0) { const m = Math.min(1, s.match); if (i < 2) contour(g, HUMN, 46, y + 112, 56, 12, 'rgba(108,218,126,0.55)', 4, m);
      g.fillStyle = 'rgba(244,247,251,0.15)'; rr(g, 400, y + 60, 160, 22, 11); g.fill(); g.fillStyle = i === 2 ? '#8C93A3' : P.mint; rr(g, 400, y + 60, Math.max(22, 160 * pct / 100 * m), 22, 11); g.fill();
      g.fillStyle = '#F4F7FB'; g.font = `800 26px ${HI}`; g.fillText(`${Math.round(pct * m)}%`, 470, y + 112); }
    g.restore(); });
}
function drawResults(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  g.fillStyle = '#F4F7FB'; g.font = `800 36px ${HI}`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('Likely matches', 30, 70);
  SONGS.forEach(([name, pct], i) => { const y = 120 + i * 190, a = s.rows[i]; if (!(a > 0)) return; g.save(); g.globalAlpha = Math.min(1, a);
    g.fillStyle = '#16203A'; rr(g, 20, y, 560, 160, 22); g.fill(); g.fillStyle = ['#C86BD9', '#3E8EDE', '#E2884A'][i]; rr(g, 40, y + 22, 116, 116, 14); g.fill(); noteGlyph(g, 92, y + 98, 40, 'rgba(255,255,255,0.9)');
    g.fillStyle = '#F4F7FB'; g.font = `800 32px ${HI}`; g.fillText(name, 178, y + 58); g.fillStyle = i === 0 ? P.mint : 'rgba(244,247,251,0.7)'; g.font = `800 30px ${HI}`; g.fillText(`${pct}% match`, 178, y + 110);
    if (i === 0) { g.fillStyle = P.mint; g.font = `800 20px ${HI}`; g.fillText('TOP', 488, y + 30); }
    g.restore(); });
  if (s.wrong > 0) { ring(g, 300, 200, 272, 100, s.wrong, AMBER); chip(g, 300, 304, 'can be wrong', s.wrong, AMBER, 26); }
}

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, qMark;
const NOTES = [];
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: music-note icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 16; noteGlyph(mg, 236, 210, 110, P.mint);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  const lens = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 24), mats.mint)); lens.rotation.x = Math.PI / 2; lens.position.set(-0.08, 0.2, -0.019); phone.add(lens);
  qMark = labelPlane(THREE, '?', 0.13, 0.13, NAVY, AMBER, '800 {S}px "Space Grotesk"'); scene.add(qMark);
  { const nc = canvas(128, 128), ng = nc.getContext('2d'); ng.shadowColor = P.mint; ng.shadowBlur = 14; noteGlyph(ng, 52, 92, 64, P.mint); const nt = cvTex(nc);
    for (let i = 0; i < C.hum.length; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.11), new THREE.MeshBasicMaterial({ map: nt, transparent: true, depthWrite: false, toneMapped: false })); m.visible = false; scene.add(m); NOTES.push(m); } }
}

// ------------------------------------------------------------------ card + phone screen states (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
const q40 = (v) => Math.round(clamp(v) * 40) / 40;
let cardKey = '', screenKey = '';
function flipScale(t) { const f = Hh.results; if (t >= f && t < f + 0.3) return Math.abs(Math.cos(Math.PI * (t - f) / 0.3)); return 1; }
function cardState(t) {
  if (t < Hh.cut3) return { face: 'staff', notes: C.hum.map(([a]) => q20(inv(a + 0.15, a + 0.35, t))), blank: q20(inv(Hh.blank, Hh.blank + 0.3, t)), hum: q20(inv(Hh.nod, Hh.nod + 0.3, t)) };
  if (t < Hh.results + 0.15) return { face: 'shape', shape: q40(inv(Hh.shape[0], Hh.shape[1], t)), songs: [0, 1, 2].map((i) => q20(inv(Hh.compare[0] + i * 0.18, Hh.compare[0] + i * 0.18 + 0.3, t))),
    match: q40(inv(Hh.compare[0] + 0.6, Hh.compare[1] + 0.3, t)), pitch: q20(E.inOutCubic(inv(Hh.pitch, Hh.pitch + 0.6, t))) };
  return { face: 'res', rows: [0, 1, 2].map((i) => q20(inv(Hh.results + 0.2 + i * 0.15, Hh.results + 0.45 + i * 0.15, t))), wrong: q20(inv(Hh.wrong, Hh.wrong + 0.3, t)) };
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  if (s.face === 'staff') drawStaff(g, s); else if (s.face === 'shape') drawShape(g, s); else drawResults(g, s);
  tag(g, NW - 22, NH - 62, 'EXAMPLE', NAVY, AMBER, 18); cardMesh.material.map.needsUpdate = true;
}
// phone: illustrative song-search screens (generic, not a specific app's UI)
function screenState(t) {
  if (t < Hh.cut5) return { m: 'search', tap: q20(inv(Hh.tap, Hh.tap + 0.45, t)), listen: q20(inv(Hh.listen, Hh.listen + 0.25, t)), prog: q40(inv(Hh.ring[0], Hh.ring[1], t)), pulse: t >= Hh.listen ? Math.round(((t * 1.6) % 1) * 10) / 10 : 0 };
  return { m: 'res', p1: q20(inv(Hh.play1, Hh.not1, t)), n1: q20(inv(Hh.not1, Hh.not1 + 0.25, t)), p2: q20(inv(Hh.play2, Hh.yes2, t)), y2: q20(inv(Hh.yes2, Hh.yes2 + 0.25, t)), eq: Math.round(t * 8) % 4 };
}
function drawScreen(t) {
  const k = screenState(t);
  const key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'EXAMPLE', NAVY, AMBER, 24);
  if (k.m === 'search') {
    if (k.listen < 1) { g.save(); g.globalAlpha = 1 - k.listen;
      g.fillStyle = '#16203A'; rr(g, 26, 130, SW - 52, 84, 42); g.fill(); g.fillStyle = 'rgba(244,247,251,0.45)'; g.font = `700 32px ${HI}`; g.fillText('Search', 70, 173);
      g.strokeStyle = '#F4F7FB'; g.lineWidth = 5; rr(g, SW - 92, 150, 22, 34, 11); g.stroke(); g.beginPath(); g.arc(SW - 81, 180, 18, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
      g.fillStyle = '#16203A'; rr(g, 70, 300, SW - 140, 110, 55); g.fill(); g.strokeStyle = P.mint; g.lineWidth = 5; g.stroke(); noteGlyph(g, 140, 372, 40, P.mint);
      g.fillStyle = '#F4F7FB'; g.font = `800 38px ${HI}`; g.fillText('Search a song', 190, 356);
      if (k.tap > 0 && k.tap < 1) { g.strokeStyle = `rgba(108,218,126,${(1 - k.tap).toFixed(2)})`; g.lineWidth = 8; g.beginPath(); g.arc(SW / 2, 356, 30 + 220 * k.tap, 0, 7); g.stroke(); }
      g.restore(); }
    if (k.listen > 0) { g.save(); g.globalAlpha = k.listen; const cx = SW / 2, cy = 420;
      for (const d of [0, 0.5]) { const p = (k.pulse + d) % 1; g.strokeStyle = `rgba(108,218,126,${(0.6 * (1 - p)).toFixed(2)})`; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, 110 + 110 * p, 0, 7); g.stroke(); }
      g.fillStyle = P.mint; g.beginPath(); g.arc(cx, cy, 100, 0, 7); g.fill(); noteGlyph(g, cx - 10, cy + 30, 70, NAVY);
      g.strokeStyle = 'rgba(244,247,251,0.18)'; g.lineWidth = 14; g.beginPath(); g.arc(cx, cy, 136, 0, 7); g.stroke();
      g.strokeStyle = '#F4F7FB'; g.beginPath(); g.arc(cx, cy, 136, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k.prog); g.stroke();
      for (const [sec, lab] of [[10, '10 s'], [15, '15 s']]) { const a = -Math.PI / 2 + Math.PI * 2 * sec / 15; g.fillStyle = AMBER; g.beginPath(); g.arc(cx + Math.cos(a) * 136, cy + Math.sin(a) * 136, 10, 0, 7); g.fill(); }
      g.fillStyle = '#F4F7FB'; g.font = `800 40px ${HI}`; g.textAlign = 'center'; g.fillText('Listening…', cx, 640); g.fillStyle = 'rgba(244,247,251,0.7)'; g.font = `700 30px ${HI}`; g.fillText('hum for 10–15 seconds', cx, 692);
      g.textAlign = 'left'; g.restore(); }
    return;
  }
  g.fillStyle = '#F4F7FB'; g.font = `700 34px ${HI}`; g.fillText('Likely matches', 30, 110);
  SONGS.forEach(([name, pct], i) => { const y = 150 + i * 176; g.fillStyle = '#16203A'; rr(g, 26, y, SW - 52, 156, 22); g.fill();
    g.fillStyle = ['#C86BD9', '#3E8EDE', '#E2884A'][i]; rr(g, 44, y + 20, 84, 84, 12); g.fill(); noteGlyph(g, 82, y + 82, 30, 'rgba(255,255,255,0.9)');
    g.fillStyle = '#F4F7FB'; g.font = `800 28px ${HI}`; g.fillText(name, 146, y + 44); g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `700 22px ${HI}`; g.fillText(`${pct}% match`, 146, y + 82);
    const p = i === 0 ? k.p1 : i === 1 ? k.p2 : 0, playing = p > 0 && p < 1;
    g.fillStyle = playing ? P.mint : '#2A3550'; g.beginPath(); g.arc(SW - 80, y + 62, 34, 0, 7); g.fill(); g.fillStyle = playing ? NAVY : '#F4F7FB';
    if (playing) { g.fillRect(SW - 92, y + 48, 8, 28); g.fillRect(SW - 76, y + 48, 8, 28); } else { g.beginPath(); g.moveTo(SW - 90, y + 44); g.lineTo(SW - 64, y + 62); g.lineTo(SW - 90, y + 80); g.fill(); }
    g.fillStyle = 'rgba(244,247,251,0.15)'; rr(g, 44, y + 122, SW - 140, 12, 6); g.fill(); if (p > 0) { g.fillStyle = P.mint; rr(g, 44, y + 122, Math.max(12, (SW - 140) * p), 12, 6); g.fill(); }
    if (playing) { g.fillStyle = P.mint; for (let b = 0; b < 4; b++) { const hh = 10 + ((b + k.eq) % 4) * 8; g.fillRect(SW - 150 + b * 12, y + 100 - hh, 8, hh); } }
  });
  if (k.n1 > 0) chip(g, 300, 270, '✕ not it', k.n1, '#C9CED8', 30);
  if (k.y2 > 0) chip(g, 270, 446, '✓ that’s it', k.y2, P.mint, 30);
}

// ------------------------------------------------------------------ choreography
const OFF = { x: 0.3, z: 0.5, rotY: 6 };
const HK = { x: 0.06, z: 0.28, rotY: -14 };
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...HK, headYaw: 4, headPitch: 2 } },                                            // two-shot from frame 0: DOCKET hums
  { t: 2.1, p: {} },
  { t: 2.45, p: { headYaw: -26, twist: -6 } },                                                    // "but no words?" — looks + points at the card
  { t: 3.15, p: {} },
  { t: 3.45, e: 'outBack', p: { headYaw: 6, twist: 0, headPitch: 8 } },                           // "Just hum it" — nod to camera
  { t: 3.8, p: { headPitch: 0 } },
  { t: Hh.cut2 - 0.01, p: {} },
  { t: Hh.cut2, p: { ...HOME2, headPitch: 14, headYaw: 0 } },                                     // (cut) phone insert: search a song
  { t: Hh.cut3 - 0.01, p: {} },
  { t: Hh.cut3, p: { ...OFF } },                                                                  // (cut) easel
  { t: Hh.cut5 - 0.01, p: {} },
  { t: Hh.cut5, p: { ...HOME2, headPitch: 14 } },                                                 // (cut) phone insert: play each
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...REST_ARMS, headPitch: -2 } },                                              // (cut) CTA
  { t: 26.4, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.3, p: { bFwd: 120 } },
  { t: 29.0, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 0], [2.15, 0], [2.5, 1], [3.3, 1], [3.7, 0], [Hh.cut2 - 0.01, 0], [Hh.cut2, 1], [Hh.cut3 - 0.01, 1], [Hh.cut3, 0], [Hh.cut5 - 0.01, 0], [Hh.cut5, 1], [30.5, 1]], 1: [[-1, 1], [Hh.cta - 0.01, 1], [Hh.cta, 0], [30.5, 0]] };
const EXPR = [[-9, 'happy'], [2.3, 'puzzled'], [3.25, 'happy'], [Hh.cut2, 'focus'], [Hh.cut5, 'focus'], [Hh.not1, 'skeptic'], [Hh.yes2, 'wow'], [24.1, 'proud'], [Hh.cta, 'happy'], [28.4, 'proud']];
const BLINKS = [1.7, 5.3, 9.6, 12.9, 20.4, 24.6, 27.3, 29.3];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = C.hum.reduce((a, [h]) => a + kick(t, h, 7, 0.1, 30), 0) + kick(t, Hh.nod, 14) + kick(t, Hh.yes2, 14) + 6 * Math.sin(t * 3.1);
  if (t < 1.1) { p.headRoll += 5 * Math.sin(t * 7); p.headPitch += C.hum.reduce((a, [h]) => a + kick(t, h, 3, 0.08, 20), 0); }   // humming sway
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
  const LOWB = spot(p, V(0.16, 0.62, 0.25), -0.4, -0.2);            // two-shot: held low in hand B
  const SHOW = spot(p, V(0.0, 1.02, 0.36), -0.06);
  const LOW = spot(p, V(-0.14, 0.62, 0.25), -0.4, 0.2);
  const segs = [[-1, LOWB], [Hh.cut2 - 0.01, LOWB], [Hh.cut2, SHOW], [Hh.cta - 0.01, SHOW], [Hh.cta, LOW]];
  let i = 1; while (i < segs.length - 1 && t > segs[i][0]) i++;
  const [t0, A] = segs[i - 1], [t1, B] = segs[i], k = E.inOutCubic(inv(t0, t1, t));
  return { p: A.p.clone().lerp(B.p, k), q: A.q.clone().slerp(B.q, k) };
}
const onPhone = (x, y, z = 0.02) => phone.localToWorld(V(x, y, z));

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  cardMesh.scale.set(Math.max(0.02, flipScale(t)), 1, 1);
  scene.updateMatrixWorld(true);
  const s = phoneSpotAt(t); phone.position.copy(s.p); phone.quaternion.copy(s.q);
  scene.updateMatrixWorld(true);
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  let tA = onPhone(-0.19, -0.06, 0), tB = onPhone(0.19, -0.06, 0);
  if (t < Hh.cut2) { tA = local(p, V(-0.75, 1.12, 0.3)); tB = onPhone(0.12, -0.2, 0); }            // two-shot: A points at the card, B holds the phone low
  NOTES.forEach((m, i) => { const h = C.hum[i][0], k = E.inOutSine(inv(h, h + 0.35, t)), on = t >= h && t < h + 0.35; m.visible = on; if (!on) return;   // hummed note flies from DOCKET onto the card's staff
    const from = local(p, V(-0.12, 1.22, 0.3)), to = board.localToWorld(V((NOTEX(i) - NW / 2) / 1000, 1.0 + (NH / 2 - NOTEY(C.hum[i][1])) / 1000, 0.03));
    m.position.copy(from.lerp(to, k)); m.position.y += 0.12 * Math.sin(Math.PI * k); m.quaternion.copy(cam.quaternion); m.scale.setScalar(1 - 0.5 * k); m.material.opacity = 1; });
  if (t >= Hh.cta) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  const qm = t >= Hh.blank && t < Hh.nod ? E.outBack(inv(Hh.blank, Hh.blank + 0.3, t)) : 0;
  { qMark.position.copy(local(p, V(-0.36, 1.3, 0.22))); /* beside the head, below the caption band */ qMark.quaternion.copy(cam.quaternion); qMark.scale.setScalar(Math.max(0.01, qm)); qMark.visible = qm > 0.02; }
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updateCard(t); drawScreen(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const INS = [[-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]];
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const TOP = [[-0.172, 1.25, 1.004], [-0.639, 1.25, -0.316]];         // the top result row, square to the card
const CAM = [
  [0.0, [0.52, 1.22, 2.62], [-0.22, 1.02, 0.0]], [Hh.cut2 - 0.01, [0.38, 1.18, 2.24], [-0.2, 1.02, 0.0]],
  [Hh.cut2, ...INS], [Hh.cut3 - 0.01, [-0.03, 1.15, 1.86], [-0.03, 1.12, 0.88]],
  [Hh.cut3, ...LAB], [Hh.push[0], [-0.14, 1.14, 1.1], [-0.64, 1.14, -0.32]], [Hh.push[1], ...TOP], [Hh.cut5 - 0.01, [-0.18, 1.25, 0.98], [-0.639, 1.25, -0.316]],
  [Hh.cut5, ...INS], [Hh.cta - 0.01, [-0.03, 1.15, 1.86], [-0.03, 1.12, 0.88]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.tap, 0.005, 0.1, 40) + kick(t, Hh.results, 0.006, 0.08, 40) + kick(t, Hh.yes2, 0.005, 0.08, 40);
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
