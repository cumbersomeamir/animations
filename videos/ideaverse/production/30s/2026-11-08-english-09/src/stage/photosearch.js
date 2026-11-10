// photosearch.js — Ideaverse production 30s english-09 #01 (English): how photo search finds a dog no file name mentions.
// Engine header copied unchanged from english-08 portrait.js (= accepted feedback-round renderer = education pilot-01 engine:
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

// ---- fictional photos, drawn in a 100 x 100 box (no stock images)
function sky(g, a, b) { const gr = g.createLinearGradient(0, 0, 0, 100); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, 100, 100); }
function ell(g, x, y, rx, ry, col, rot = 0) { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); }
function animal(g, body, head, ear, goat) {           // side view, facing right (dog and goat share the pose: easy to confuse)
  g.strokeStyle = body; g.lineWidth = 5; g.lineCap = 'round';
  for (const x of [36, 44, 58, 66]) { g.beginPath(); g.moveTo(x, 66); g.lineTo(x + (x % 2 ? 1 : -1), 82); g.stroke(); }
  g.beginPath(); g.moveTo(28, 58); g.quadraticCurveTo(20, 50, goat ? 24 : 18, goat ? 52 : 44); g.stroke();
  ell(g, 50, 62, 24, 12, body); ell(g, 72, 47, 11, 10, head); ell(g, 81, 51, 6.5, 4.6, head);
  ell(g, 87, 50, 1.8, 1.6, '#1A1A1A'); ell(g, 74, 44, 1.6, 1.6, '#1A1A1A');
  if (goat) { g.strokeStyle = '#5A5148'; g.lineWidth = 3; g.beginPath(); g.moveTo(68, 39); g.quadraticCurveTo(62, 28, 54, 32); g.stroke(); g.beginPath(); g.moveTo(72, 38); g.quadraticCurveTo(68, 27, 60, 29); g.stroke();
    ell(g, 64, 45, 6, 2.6, ear, -0.3); g.fillStyle = '#D9D2C5'; g.beginPath(); g.moveTo(80, 55); g.lineTo(84, 64); g.lineTo(77, 56); g.fill(); }
  else { ell(g, 67, 49, 4.5, 8, ear, 0.25); g.strokeStyle = '#D9443A'; g.lineWidth = 3; g.beginPath(); g.arc(70, 51, 9, 1.0, 2.2); g.stroke(); }
}
const PHOTO = {
  dog1: (g) => { sky(g, '#9FD3F5', '#DDF1FF'); g.fillStyle = '#5DAA4F'; g.fillRect(0, 70, 100, 30); animal(g, '#A0632E', '#A0632E', '#6E3F1A'); ell(g, 90, 82, 5, 5, '#E5483B'); },
  dog2: (g) => { g.fillStyle = '#E9DCC8'; g.fillRect(0, 0, 100, 100); g.fillStyle = '#6C4F9C'; g.fillRect(0, 38, 100, 50); g.fillStyle = '#7E61AE'; g.fillRect(6, 28, 40, 26); g.fillRect(54, 28, 40, 26);
    ell(g, 48, 62, 28, 10, '#E2C48F'); ell(g, 74, 57, 11, 9, '#E2C48F'); ell(g, 83, 60, 6, 4, '#E2C48F'); ell(g, 88, 59, 1.8, 1.6, '#1A1A1A'); ell(g, 76, 54, 1.6, 1.4, '#1A1A1A'); ell(g, 69, 59, 4, 7, '#B8925A', 0.4); },
  dog3: (g) => { sky(g, '#B9C7D9', '#E8EEF5'); g.fillStyle = '#F7F9FC'; g.fillRect(0, 68, 100, 32); animal(g, '#23232A', '#23232A', '#111'); ell(g, 76, 54, 4, 4, '#F2F2F2'); },
  goat: (g) => { sky(g, '#A9D8F2', '#E3F3FF'); g.fillStyle = '#6FB257'; g.fillRect(0, 70, 100, 30); g.fillStyle = '#8B6B4A'; g.fillRect(4, 52, 3, 26); g.fillRect(4, 58, 96, 3); animal(g, '#EDE7DC', '#EDE7DC', '#CFC6B6', true); },
  beach: (g, v = 0) => { sky(g, v ? '#7CC6F0' : '#8FD0F7', '#D9F1FF'); ell(g, v ? 22 : 78, 22, 9, 9, '#FFD45C'); g.fillStyle = '#2E8FC9'; g.fillRect(0, 50, 100, 18); g.fillStyle = '#F1D9A2'; g.fillRect(0, 66, 100, 34);
    g.fillStyle = v ? '#2F9E6A' : '#E5483B'; g.beginPath(); g.moveTo(v ? 70 : 28, 52); g.lineTo(v ? 52 : 10, 66); g.lineTo(v ? 88 : 46, 66); g.fill(); g.fillStyle = '#5A4632'; g.fillRect(v ? 69 : 27, 60, 2, 26); },
  cake: (g, v = 0) => { g.fillStyle = '#FBE3D2'; g.fillRect(0, 0, 100, 100); g.fillStyle = '#B9825A'; g.fillRect(0, 74, 100, 26);
    g.fillStyle = v ? '#6B3E26' : '#F5A3B8'; g.fillRect(24, 52, 52, 22); g.fillStyle = v ? '#8A5636' : '#FFF4E6'; g.fillRect(22, 46, 56, 8); g.fillStyle = v ? '#4E2B19' : '#F5A3B8'; g.fillRect(30, 34, 40, 14);
    for (const x of [38, 50, 62]) { g.fillStyle = '#7FB7E8'; g.fillRect(x - 1.5, 24, 3, 10); ell(g, x, 21, 2.2, 3.4, '#FFB23F'); } },
  receipt: (g, v = 0) => { g.fillStyle = '#7A5638'; g.fillRect(0, 0, 100, 100); g.save(); g.translate(50, 50); g.rotate(v ? 0.12 : -0.08); g.fillStyle = '#FBFAF6'; g.fillRect(-22, -42, 44, 84);
    g.fillStyle = '#2A2F3A'; g.font = '700 7px "Space Grotesk"'; g.textAlign = 'center'; g.fillText('RECEIPT', 0, -30); g.fillStyle = '#9AA0AA'; for (let i = 0; i < 7; i++) g.fillRect(-16, -22 + i * 7, 22 + (i * 7) % 10, 2.2);
    g.fillStyle = '#2A2F3A'; g.fillRect(-16, 30, 32, 3); g.font = '700 6px "Space Grotesk"'; g.textAlign = 'left'; g.fillText('TOTAL', -16, 27); g.restore(); },
  sunset: (g) => { sky(g, '#5B3F8C', '#FF9A55'); ell(g, 50, 70, 16, 16, '#FFD27A'); g.fillStyle = '#2A2140'; g.beginPath(); g.moveTo(0, 72); g.quadraticCurveTo(30, 58, 60, 74); g.quadraticCurveTo(80, 64, 100, 70); g.lineTo(100, 100); g.lineTo(0, 100); g.fill(); },
  mountain: (g) => { sky(g, '#7FB7EA', '#DCEEFF'); for (const [x, h, c] of [[30, 55, '#6E7D93'], [68, 62, '#5B6A80']]) { g.fillStyle = c; g.beginPath(); g.moveTo(x - 40, 85); g.lineTo(x, 85 - h); g.lineTo(x + 40, 85); g.fill(); g.fillStyle = '#F4F7FB'; g.beginPath(); g.moveTo(x - 9, 85 - h + 12); g.lineTo(x, 85 - h); g.lineTo(x + 9, 85 - h + 12); g.fill(); } g.fillStyle = '#4E8F4A'; g.fillRect(0, 82, 100, 18); },
  food: (g) => { g.fillStyle = '#3B4A5C'; g.fillRect(0, 0, 100, 100); ell(g, 50, 52, 36, 36, '#F4F4F2'); ell(g, 50, 52, 24, 24, '#F2C14E'); g.strokeStyle = '#D9A532'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(44 + i * 3, 50 + (i % 2) * 4, 9, 0.5, 2.6); g.stroke(); } ell(g, 52, 48, 7, 6, '#C8402F'); },
  bike: (g) => { g.fillStyle = '#C9B8A6'; g.fillRect(0, 0, 100, 70); g.fillStyle = '#8D8F94'; g.fillRect(0, 70, 100, 30); g.strokeStyle = '#1F5FA8'; g.lineWidth = 3; for (const x of [30, 70]) { g.beginPath(); g.arc(x, 72, 13, 0, 7); g.stroke(); }
    g.beginPath(); g.moveTo(30, 72); g.lineTo(46, 52); g.lineTo(64, 52); g.lineTo(70, 72); g.moveTo(46, 52); g.lineTo(52, 72); g.lineTo(30, 72); g.moveTo(64, 52); g.lineTo(62, 44); g.stroke(); },
  flower: (g) => { g.fillStyle = '#CFE3EE'; g.fillRect(0, 0, 100, 100); g.fillStyle = '#B85C3A'; g.beginPath(); g.moveTo(36, 70); g.lineTo(64, 70); g.lineTo(60, 92); g.lineTo(40, 92); g.fill();
    g.strokeStyle = '#3E8E4C'; g.lineWidth = 3; g.beginPath(); g.moveTo(50, 70); g.lineTo(50, 38); g.stroke(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ell(g, 50 + Math.cos(a) * 8, 32 + Math.sin(a) * 8, 6, 4, '#E86C9A', a); } ell(g, 50, 32, 4, 4, '#FFD45C'); },
};
function thumb(g, kind, x, y, w, h, o = {}) {
  g.save(); g.translate(x, y); g.beginPath(); g.roundRect(0, 0, w, h, Math.min(w, h) * 0.06); g.clip();
  g.save(); const s = Math.max(w, h) / 100; g.translate((w - 100 * s) / 2, (h - 100 * s) / 2); g.scale(s, s); PHOTO[kind](g, o.v || 0); g.restore();
  if (o.dim > 0) { g.fillStyle = `rgba(14,20,36,${(0.62 * o.dim).toFixed(3)})`; g.fillRect(0, 0, w, h); }
  g.restore();
  if (o.frame > 0) { g.save(); g.globalAlpha = Math.min(1, o.frame); g.strokeStyle = o.col || P.mint; g.lineWidth = o.lw || 6; g.shadowColor = o.col || P.mint; g.shadowBlur = 14; g.beginPath(); g.roundRect(x, y, w, h, Math.min(w, h) * 0.06); g.stroke(); g.restore(); }
}
function chip(g, x, y, txt, a, col, size = 26, fg = NAVY) { if (!(a > 0)) return 0; g.save(); g.globalAlpha = Math.min(1, a); g.translate(x, y); const k = 0.8 + 0.2 * Math.min(1, a); g.scale(k, k); g.font = `800 ${size}px ${HI}`; g.textAlign = 'left'; const w = g.measureText(txt).width + size * 1.1; g.fillStyle = col; rr(g, 0, -size * 0.82, w, size * 1.64, size * 0.82); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, size * 0.55, 2); g.restore(); return w; }
function ring(g, x, y, rx, ry, a, col) { if (!(a > 0)) return; const k = 1.25 - 0.25 * Math.min(1, a); g.save(); g.globalAlpha = Math.min(1, a); g.strokeStyle = col; g.lineWidth = 7; g.shadowColor = col; g.shadowBlur = 14; g.beginPath(); g.ellipse(x, y, rx * k, ry * k, 0, 0, 7); g.stroke(); g.restore(); }
function searchBar(g, x, y, w, h, txt, k = 1, ph = 'Search your photos') {
  g.save(); g.fillStyle = '#16203A'; rr(g, x, y, w, h, h / 2); g.fill(); g.strokeStyle = txt ? P.mint : 'rgba(244,247,251,0.25)'; g.lineWidth = 3; g.stroke();
  g.strokeStyle = '#F4F7FB'; g.lineWidth = 4; g.beginPath(); g.arc(x + h * 0.5, y + h * 0.46, h * 0.18, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x + h * 0.63, y + h * 0.6); g.lineTo(x + h * 0.75, y + h * 0.72); g.stroke();
  g.font = `700 ${Math.round(h * 0.44)}px ${HI}`; g.textBaseline = 'middle'; g.textAlign = 'left';
  const n = Math.round(txt.length * clamp(k)); if (n > 0) { g.fillStyle = '#F4F7FB'; g.fillText(txt.slice(0, n), x + h * 0.95, y + h / 2 + 1); } else { g.fillStyle = 'rgba(244,247,251,0.45)'; g.fillText(ph, x + h * 0.95, y + h / 2 + 1); }
  g.restore();
}

// ---- the easel card (600 x 800 logical, drawn at 2x for crisp close-ups)
const NW = 600, NH = 800, CS = 2;
const LIB = [['sunset', 'IMG_2207.JPG'], ['dog1', 'IMG_4031.JPG'], ['receipt', 'IMG_0918.JPG'], ['food', 'IMG_3350.JPG'], ['beach', 'IMG_1764.JPG'], ['goat', 'IMG_5129.JPG'],
  ['mountain', 'IMG_0611.JPG'], ['dog2', 'IMG_2875.JPG'], ['cake', 'IMG_4410.JPG'], ['bike', 'IMG_0083.JPG'], ['flower', 'IMG_3902.JPG'], ['dog3', 'IMG_5560.JPG']];
const MATCH = ['dog1', 'dog2', 'dog3', 'goat'];
const ORDER = (() => { const m = LIB.filter(([k]) => MATCH.includes(k)).sort((a, b) => MATCH.indexOf(a[0]) - MATCH.indexOf(b[0])); return [...m, ...LIB.filter(([k]) => !MATCH.includes(k))]; })();
const CELL = (i) => ({ x: 30 + (i % 3) * 185, y: 140 + Math.floor(i / 3) * 158, w: 170, h: 118 });
function drawGrid(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  searchBar(g, 30, 34, 540, 76, 'dog', s.typed);
  LIB.forEach(([kind, name], i0) => {
    const i1 = ORDER.findIndex(([k]) => k === kind), A = CELL(i0), B = CELL(i1), k = E.inOutCubic(clamp(s.shuf - (i0 % 4) * 0.06));
    const x = lerp(A.x, B.x, k), y = lerp(A.y, B.y, k) - 26 * Math.sin(Math.PI * k), hit = MATCH.includes(kind);
    thumb(g, kind, x, y, A.w, A.h, { dim: hit ? 0 : s.shuf, frame: hit ? s.shuf : 0 });
    g.save(); g.font = '700 17px "JetBrains Mono"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = hit ? '#F4F7FB' : `rgba(244,247,251,${(0.75 - 0.4 * s.shuf).toFixed(2)})`; g.fillText(name, x + 4, y + A.h + 17); g.restore();
    if (hit && s.names > 0) { g.save(); g.globalAlpha = Math.min(1, s.names); g.strokeStyle = AMBER; g.lineWidth = 4; g.shadowColor = AMBER; g.shadowBlur = 10; rr(g, x - 2, y + A.h + 4, 150, 27, 8); g.stroke(); g.restore(); }
  });
  if (s.chipNames > 0) { g.save(); g.font = `800 28px ${HI}`; const t = 'no file name says “dog”'; const w = g.measureText(t).width + 30; g.restore(); chip(g, (NW - w) / 2, 772, t, s.chipNames, AMBER, 28); }
}
const ROWS = [['dog1', 'IMG_4031.JPG', ['dog', 'grass', 'ball']], ['beach', 'IMG_1764.JPG', ['beach', 'sea', 'sky']], ['cake', 'IMG_4410.JPG', ['cake', 'candles', 'table']]];
const RY = (i) => 128 + i * 222;
function drawTags(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  searchBar(g, 30, 30, 540, 70, 'dog', s.q);
  ROWS.forEach(([kind, name, tags], i) => {
    const y = RY(i);
    thumb(g, kind, 30, y, 250, 168, { frame: i === 0 ? s.linkOK : 0 });
    if (s.scan[i] > 0 && s.scan[i] < 1) {                       // the app "looks": a scan bar sweeps the picture
      const x = 30 + 250 * s.scan[i]; g.save(); g.fillStyle = 'rgba(108,218,126,0.18)'; g.fillRect(30, y, x - 30, 168); g.shadowColor = P.mint; g.shadowBlur = 18; g.fillStyle = P.mint; g.fillRect(x - 3, y, 6, 168); g.restore();
    }
    if (s.scan[i] >= 1) { g.save(); g.strokeStyle = P.mint; g.lineWidth = 4; for (const [cx, cy, dx, dy] of [[30, y, 1, 1], [280, y, -1, 1], [30, y + 168, 1, -1], [280, y + 168, -1, -1]]) { g.beginPath(); g.moveTo(cx, cy + dy * 26); g.lineTo(cx, cy); g.lineTo(cx + dx * 26, cy); g.stroke(); } g.restore(); }
    g.save(); g.font = '700 18px "JetBrains Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = 'rgba(244,247,251,0.7)'; g.fillText(name, 34, y + 188); g.restore();
    if (i === 0 && s.nameX > 0) { g.save(); g.globalAlpha = Math.min(1, s.nameX); g.strokeStyle = '#8C93A3'; g.lineWidth = 3; g.beginPath(); g.moveTo(34, y + 188); g.lineTo(178, y + 188); g.stroke(); g.restore(); chip(g, 188, y + 188, '✕ no match', s.nameX, '#C9CED8', 20); }
    tags.forEach((tg, j) => { const a = s.tags[i] * 3 - j; if (a <= 0) return; const main = j === 0, pulse = main ? s.main[i] : 0;
      g.save(); const cx = 312, cy = y + 34 + j * 52; g.translate(cx, cy); const sc = 1 + 0.18 * Math.sin(Math.PI * clamp(pulse)); g.scale(sc, sc);
      chip(g, 0, 0, tg, Math.min(1, a), main ? (i === 0 && s.linkOK > 0 ? P.mint : main && s.main[i] > 0 ? P.mint : '#E9EFF2') : 'rgba(233,239,242,0.55)', main ? 30 : 24); g.restore(); });
  });
  if (s.link > 0) {                                           // the typed word is matched to the tag
    g.save(); g.strokeStyle = P.mint; g.lineWidth = 5; g.shadowColor = P.mint; g.shadowBlur = 12; g.setLineDash([700 * s.link, 2000]);
    g.beginPath(); g.moveTo(170, 100); g.bezierCurveTo(420, 118, 470, 120, 352, RY(0) + 12); g.stroke(); g.restore();
    if (s.linkOK > 0) { g.save(); g.globalAlpha = s.linkOK; g.fillStyle = P.mint; g.beginPath(); g.arc(470, RY(0) + 34, 22, 0, 7); g.fill(); check(g, 459, RY(0) + 24, 22, NAVY, 5); g.restore(); }
  }
  if (s.nameX > 0) { g.save(); g.globalAlpha = Math.min(1, s.nameX); g.strokeStyle = '#8C93A3'; g.lineWidth = 4; g.setLineDash([12, 10]); g.beginPath(); g.moveTo(120, 100); g.quadraticCurveTo(10, 200, 60, RY(0) + 180); g.stroke(); g.restore(); }
}
const RES = [['dog1', 30, 140], ['dog2', 310, 140], ['dog3', 30, 440], ['goat', 310, 440]];
function drawResults(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  searchBar(g, 30, 30, 540, 70, 'dog', 1);
  g.save(); g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `700 22px ${HI}`; g.textBaseline = 'middle'; g.fillText('4 results', 34, 120); g.restore();
  RES.forEach(([kind, x, y]) => thumb(g, kind, x, y, 260, 260, { frame: kind === 'goat' ? s.ring : 0, col: AMBER }));
  if (s.chip > 0) chip(g, 324, 474, 'tagged: dog', s.chip, AMBER, 26);
  if (s.goat > 0) chip(g, 380, 668, 'it’s a goat', s.goat, '#F4F7FB', 26);
}

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, qMark;
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: magnifier icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 16; mg.strokeStyle = P.mint; mg.lineWidth = 16; mg.lineCap = 'round'; mg.beginPath(); mg.arc(236, 132, 66, 0, 7); mg.stroke(); mg.beginPath(); mg.moveTo(286, 182); mg.lineTo(340, 236); mg.stroke();
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
}

// ------------------------------------------------------------------ card + phone screen states (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
const q40 = (v) => Math.round(clamp(v) * 40) / 40;
let cardKey = '', screenKey = '';
function flipScale(t) { for (const f of [Hh.flip1, Hh.flip2]) if (t >= f && t < f + 0.3) return Math.abs(Math.cos(Math.PI * (t - f) / 0.3)); return 1; }
function cardState(t) {
  if (t < Hh.flip1 + 0.15) return { face: 'grid', typed: q20(inv(Hh.type[0], Hh.type[1], t)), shuf: q40(inv(Hh.shuffle[0], Hh.shuffle[1], t) * 1.18),
    names: q20(inv(Hh.names, Hh.names + 0.25, t)), chipNames: q20(inv(Hh.chipNames, Hh.chipNames + 0.25, t)) };
  if (t < Hh.flip2 + 0.15) return { face: 'tags', scan: Hh.scan.map((a) => q40(inv(a, a + 0.55, t))), tags: Hh.tags.map((a) => q20(inv(a, a + 0.45, t))),
    main: Hh.main.map((a) => q20(inv(a, a + 0.35, t))), q: q20(inv(Hh.query[0], Hh.query[1], t)), link: q40(inv(Hh.link[0], Hh.link[1], t)), linkOK: q20(inv(Hh.link[1], Hh.link[1] + 0.2, t)),
    nameX: q20(inv(Hh.nameX, Hh.nameX + 0.3, t)) };
  return { face: 'res', ring: q20(inv(Hh.ringGoat, Hh.ringGoat + 0.25, t)), chip: q20(inv(Hh.chipGoat, Hh.chipGoat + 0.25, t)), goat: q20(inv(Hh.goat, Hh.goat + 0.25, t)) };
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  if (s.face === 'grid') drawGrid(g, s); else if (s.face === 'tags') drawTags(g, s); else drawResults(g, s);
  tag(g, NW - 22, NH - 62, 'EXAMPLE', NAVY, AMBER, 18); cardMesh.material.map.needsUpdate = true;
}
// phone: illustrative Photos search screen (generic, not a specific app's UI)
const PLIB = ['mountain', 'dog1', 'food', 'sunset', 'receipt', 'flower', 'bike', 'cake', 'beach'];
function screenState(t) {
  let q = '', k = 0;
  if (t >= Hh.qReceipt[0]) { q = 'receipt'; k = inv(Hh.qReceipt[0], Hh.qReceipt[1], t); }
  if (t >= Hh.qBeach[0]) { q = 'beach'; k = inv(Hh.qBeach[0], Hh.qBeach[1], t); }
  if (t >= Hh.qCake[0]) { q = 'cake'; k = inv(Hh.qCake[0], Hh.qCake[1], t); }
  if (t >= Hh.found - 0.35) { q = 'receipt'; k = 1; }
  return { q, k: q20(k), field: q20(inv(Hh.field, Hh.field + 0.3, t)), res: q20(inv(0.75, 1, k)), open: q20(E.inOutCubic(inv(Hh.found, Hh.found + 0.45, t))), ok: q20(inv(Hh.found + 0.45, Hh.found + 0.7, t)), blink: t < Hh.qReceipt[0] ? Math.floor(t * 3) % 2 : 0 };
}
function drawScreen(t) {
  const k = screenState(t);
  const key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'EXAMPLE', NAVY, AMBER, 24);
  g.fillStyle = '#F4F7FB'; g.font = `700 36px ${HI}`; g.fillText('Photos', 30, 108);
  searchBar(g, 26, 140, SW - 52, 76, k.q, k.k, 'Search');
  if (!k.q && k.field > 0 && k.blink) { g.fillStyle = P.mint; g.fillRect(26 + 76 * 0.95, 160, 4, 36); }
  const GX = 26, GY = 250, GW = 156, GG = 14;
  if (!k.q || k.res <= 0) PLIB.forEach((kind, i) => thumb(g, kind, GX + (i % 3) * (GW + GG), GY + Math.floor(i / 3) * (GW + GG), GW, GW));
  else { const list = k.q === 'receipt' ? [['receipt', 0], ['receipt', 1]] : k.q === 'beach' ? [['beach', 0], ['beach', 1]] : [['cake', 0], ['cake', 1]];
    g.save(); g.globalAlpha = k.res; g.fillStyle = 'rgba(244,247,251,0.6)'; g.font = `700 24px ${HI}`; g.fillText(`${list.length} results for “${k.q}”`, 30, GY - 4 + 0); g.restore();
    list.forEach(([kind, v], i) => { g.save(); g.globalAlpha = k.res; thumb(g, kind, GX + i * (GW + GG), GY + 24, GW, GW, { v, frame: i === 0 ? 1 : 0 }); g.restore(); }); }
  if (k.open > 0) {                                            // the forgotten photo, opened
    const x = lerp(GX, 26, k.open), y = lerp(GY + 24, 250, k.open), w = lerp(GW, SW - 52, k.open);
    g.fillStyle = `rgba(11,16,32,${(0.9 * k.open).toFixed(2)})`; g.fillRect(0, 236, SW, SH - 236); thumb(g, 'receipt', x, y, w, w, { frame: k.open, lw: 6 });
    if (k.ok > 0) { g.save(); g.globalAlpha = k.ok; g.fillStyle = P.mint; rr(g, 26, 780, SW - 52, 84, 42); g.fill(); check(g, 60, 800, 40, NAVY, 8); g.fillStyle = NAVY; g.font = `800 36px ${HI}`; g.fillText('found it', 122, 824); g.restore(); }
  }
}

// ------------------------------------------------------------------ choreography
const OFF = { x: 0.3, z: 0.5, rotY: 6 };
const HK = { x: 0.06, z: 0.28, rotY: -14 };
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...OFF } },
  { t: Hh.cut1 - 0.01, p: {} },
  { t: Hh.cut1, p: { ...HK, headYaw: -24, headPitch: 2, twist: -6 } },                         // (cut) two-shot: DOCKET looks at the search result
  { t: 2.9, p: {} },
  { t: 3.25, e: 'outBack', p: { headYaw: 6, headRoll: 12, lean: -4, twist: 0 } },               // "find him?" — head tilt to camera
  { t: Hh.cut2 - 0.01, p: {} },
  { t: Hh.cut2, p: { ...OFF, headRoll: 0, lean: 0, headYaw: 0 } },                             // (cut) easel
  { t: Hh.cut4 - 0.01, p: {} },
  { t: Hh.cut4, p: { ...HOME2, headPitch: 14 } },                                               // (cut) phone insert
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...REST_ARMS, headPitch: -2 } },                                            // (cut) CTA
  { t: 26.4, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 28.3, p: { bFwd: 120 } },
  { t: 29.0, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 0], [Hh.point - 0.3, 0], [Hh.point + 0.1, 1], [3.9, 1], [4.3, 0], [Hh.cut4 - 0.01, 0], [Hh.cut4, 1], [30.5, 1]], 1: [[-1, 1], [Hh.cta - 0.01, 1], [Hh.cta, 0], [30.5, 0]] };
const EXPR = [[-9, 'neutral'], [Hh.cut1, 'focus'], [2.9, 'puzzled'], [Hh.cut2, 'focus'], [Hh.cut4, 'focus'], [20.9, 'determined'], [23.15, 'wow'], [23.8, 'proud'], [Hh.cta, 'happy'], [28.4, 'proud']];
const BLINKS = [2.7, 5.3, 9.6, 11.9, 19.6, 24.6, 27.3, 29.3];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.how, 18) + kick(t, Hh.found, 14) + 6 * Math.sin(t * 3.1);
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
  if (t >= Hh.cta) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  { const hA = V(), hB = V(); docket.handWorld(0, hA); docket.handWorld(1, hB); window.DBG = { a: tA && wA > 0.5 ? +hA.distanceTo(tA).toFixed(3) : null, b: tB && wB > 0.5 ? +hB.distanceTo(tB).toFixed(3) : null }; }
  const qm = t >= Hh.how && t < Hh.cut2 ? E.outBack(inv(Hh.how, Hh.how + 0.3, t)) : 0;
  { qMark.position.copy(local(p, V(-0.36, 1.3, 0.22))); /* beside the head, below the caption band */ qMark.quaternion.copy(cam.quaternion); qMark.scale.setScalar(Math.max(0.01, qm)); qMark.visible = qm > 0.02; }
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  updateCard(t); drawScreen(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const INS = [[-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]];
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const GOAT = [[-0.223, 0.9, 0.44], [-0.507, 0.9, -0.363]];          // the goat result, square to the card
const CAM = [
  [0.0, [-0.07, 1.13, 1.3], [-0.64, 1.13, -0.32]], [Hh.cut1 - 0.01, [-0.15, 1.13, 1.06], [-0.64, 1.13, -0.32]],
  [Hh.cut1, [0.44, 1.2, 2.45], [-0.2, 1.0, 0.0]], [Hh.cut2 - 0.01, [0.38, 1.18, 2.28], [-0.2, 1.0, 0.0]],
  [Hh.cut2, ...LAB], [Hh.push[0], [-0.15, 1.13, 1.06], [-0.64, 1.13, -0.32]], [Hh.push[1], ...GOAT], [Hh.cut4 - 0.01, [-0.235, 0.9, 0.41], [-0.507, 0.9, -0.363]],
  [Hh.cut4, ...INS], [Hh.cta - 0.01, [-0.03, 1.15, 1.86], [-0.03, 1.12, 0.88]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.shuffle[0], 0.006, 0.1, 40) + kick(t, Hh.cut1, 0.008, 0.1, 40) + kick(t, Hh.flip1, 0.006, 0.08, 40) + kick(t, Hh.found, 0.005, 0.08, 40);
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
