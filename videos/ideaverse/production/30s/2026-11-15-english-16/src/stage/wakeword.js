// wakeword.js — Ideaverse production 30s english-16 #01 (English): why a smart speaker wakes when nobody said the wake word
// (on-device check of short snippets, nothing sent until a snippet is close enough; a measured TV study; lower the sensitivity).
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine);
// overlay tail from english-12 (caption safe area x 100..900). New: TV + subtitles, generic smart speaker (x-ray chip, light
// ring), sound snippets, illustrative match meter + wake line, cloud, 12-show card, settings phone. Pure function of t.
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
let docket, board, cardCanvas, cardMesh, tvCanvas, tvMesh, spk, shellMat, ring, ringGlow, chipMesh, chipMat, cloud, meter, meterFill, meterLine, meterTag, snipTiles = [], coldTile, sentTile, phone, screenCanvas, screenMesh, labelL;
const BOARD_POS = V(1.55, 0, -0.9), BOARD_YAW = -0.6;
const TV_POS = V(0.22, 0, -1.15), TV_YAW = -0.08;
const TABLE_POS = V(0.3, 0, 0.95), TOP_Y = 0.48;
const SPK = V(0.3, TOP_Y + 0.05, 0.95);                       // speaker centre
const METER_POS = V(0.04, 0.5, 1.12), CLOUD_POS = V(0.33, 0.98, 0.8);
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
const NW = 600, NH = 800, CS = 2;
const TVW = 768, TVH = 432;
const SNIP = Array.from({ length: Hh.snipN }, (_, k) => { const r = mulberry(70 + k); return { t: Hh.snip0 + k * Hh.snipGap, h: 0.16 + r() * 0.3, seed: 70 + k }; });
const FLY = 0.7, THR1 = 0.62, THR2 = 0.86, COLD_H = 0.8;
function mulberry(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function waveCanvas(seed, col) {                                   // a short snippet of sound: rounded tile + waveform
  const c = canvas(256, 120), g = c.getContext('2d'), r = mulberry(seed);
  g.fillStyle = '#16203A'; rr(g, 4, 4, 248, 112, 26); g.fill(); g.strokeStyle = col; g.lineWidth = 6; rr(g, 4, 4, 248, 112, 26); g.stroke();
  g.strokeStyle = col; g.lineWidth = 7; g.lineCap = 'round';
  for (let i = 0; i < 17; i++) { const x = 30 + i * 12.2, h = 8 + r() * 70 * Math.sin(Math.PI * (i + 0.5) / 17); g.beginPath(); g.moveTo(x, 60 - h / 2); g.lineTo(x, 60 + h / 2); g.stroke(); }
  return c;
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: sound-bars icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 14; mg.strokeStyle = P.mint; mg.lineWidth = 16; mg.lineCap = 'round';
    [50, 100, 150, 100, 60, 120, 40].forEach((h, i) => { const x = 136 + i * 40; mg.beginPath(); mg.moveTo(x, 150 - h / 2); mg.lineTo(x, 150 + h / 2); mg.stroke(); });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  // easel + card (the study's 12 shows)
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // TV on a low cabinet (a generic show with subtitles)
  const tv = new THREE.Group(); tv.position.copy(TV_POS); tv.rotation.y = TV_YAW; scene.add(tv);
  const cab = rbox(1.05, 0.4, 0.38, 0.02, M('#2A3550', { roughness: 0.6 })); cab.position.y = 0.2; tv.add(cab);
  const neck = rbox(0.12, 0.08, 0.06, 0.01, mats.steel); neck.position.set(0, 0.44, -0.02); tv.add(neck);
  const body = rbox(0.98, 0.58, 0.045, 0.02, M('#070A12', { roughness: 0.3, metalness: 0.3 })); body.position.y = 0.77; tv.add(body);
  tvCanvas = canvas(TVW, TVH);
  tvMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.93, 0.523), new THREE.MeshBasicMaterial({ map: cvTex(tvCanvas), toneMapped: false })); tvMesh.position.set(0, 0.77, 0.024); tv.add(tvMesh);
  // side table + generic smart speaker (fabric puck, light ring); x-ray reveals a small chip inside
  const tbl = new THREE.Group(); tbl.position.copy(TABLE_POS); scene.add(tbl);
  const ttop = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.03, 40), M('#B07A4A', { roughness: 0.55 }))); ttop.position.y = TOP_Y - 0.015; tbl.add(ttop);
  const tstem = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, TOP_Y - 0.03, 12), mats.steel)); tstem.position.y = (TOP_Y - 0.03) / 2; tbl.add(tstem);
  const tfoot = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.018, 28), mats.steel)); tfoot.position.y = 0.009; tbl.add(tfoot);
  const fab = canvas(256, 128), fbg = fab.getContext('2d'); fbg.fillStyle = '#D9DEE6'; fbg.fillRect(0, 0, 256, 128); fbg.fillStyle = 'rgba(40,52,80,0.22)'; for (let y = 4; y < 128; y += 8) for (let x = (y % 16 ? 4 : 8); x < 256; x += 8) { fbg.beginPath(); fbg.arc(x, y, 1.6, 0, 7); fbg.fill(); }
  shellMat = new THREE.MeshStandardMaterial({ map: cvTex(fab), roughness: 0.85, transparent: true, opacity: 1 });
  spk = new THREE.Group(); spk.position.set(SPK.x, TOP_Y, SPK.z); scene.add(spk);
  const sb = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.12, 0.07, 56), shellMat)); sb.position.y = 0.035; spk.add(sb);
  const dome = sh(new THREE.Mesh(new THREE.SphereGeometry(0.115, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), shellMat)); dome.scale.y = 0.32; dome.position.y = 0.07; spk.add(dome);
  ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.007, 10, 64), new THREE.MeshBasicMaterial({ color: '#2A3550', toneMapped: false })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.108; spk.add(ring);
  { const gc = canvas(128, 128), gg = gc.getContext('2d'), gr = gg.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(190,255,205,0.85)'); gr.addColorStop(0.4, 'rgba(108,218,126,0.35)'); gr.addColorStop(1, 'rgba(108,218,126,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
    ringGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), new THREE.MeshBasicMaterial({ map: cvTex(gc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0 })); scene.add(ringGlow); }
  chipMat = new THREE.MeshStandardMaterial({ color: P.mint, emissive: new THREE.Color(P.mint), emissiveIntensity: 0.3, roughness: 0.3 });
  chipMesh = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.014, 0.06, 2, 0.004), chipMat); chipMesh.position.y = 0.05; spk.add(chipMesh); chipMesh.visible = false;
  // match meter (illustrative) + cloud
  meter = new THREE.Group(); scene.add(meter);
  const plate = rbox(0.085, 0.36, 0.01, 0.012, mats.navy); plate.position.y = 0.18; meter.add(plate);
  meterFill = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.3), new THREE.MeshBasicMaterial({ color: P.mint, toneMapped: false })); meterFill.position.set(0, 0.03, 0.007); meter.add(meterFill);
  meterLine = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.008), new THREE.MeshBasicMaterial({ color: AMBER, toneMapped: false })); meterLine.position.z = 0.009; meter.add(meterLine);
  meterTag = labelPlane(THREE, 'WAKE', 0.1, 0.04, NAVY, AMBER, '800 {S}px "Space Grotesk"'); meterTag.position.z = 0.009; meter.add(meterTag);
  const mt = labelPlane(THREE, 'MATCH', 0.12, 0.042, NAVY, P.mint, '800 {S}px "Space Grotesk"'); mt.position.set(0, -0.04, 0.009); meter.add(mt);
  { const cc = canvas(256, 160), cg = cc.getContext('2d'); cg.fillStyle = '#F4F7FB'; for (const [x, y, r] of [[80, 100, 44], [128, 76, 56], [178, 100, 42]]) { cg.beginPath(); cg.arc(x, y, r, 0, 7); cg.fill(); } cg.fillRect(80, 100, 98, 44); rr(cg, 36, 100, 184, 44, 22); cg.fill();
    cloud = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.125), new THREE.MeshBasicMaterial({ map: cvTex(cc), transparent: true, toneMapped: false, depthWrite: false })); scene.add(cloud); }
  for (const s of SNIP) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.056), new THREE.MeshBasicMaterial({ map: cvTex(waveCanvas(s.seed, P.mint)), transparent: true, toneMapped: false, depthWrite: false })); m.visible = false; m.renderOrder = 4; scene.add(m); snipTiles.push(m); }
  const cw = cvTex(waveCanvas(5, AMBER));
  coldTile = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.07), new THREE.MeshBasicMaterial({ map: cw, transparent: true, toneMapped: false, depthWrite: false })); coldTile.renderOrder = 5; scene.add(coldTile);
  sentTile = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.07), new THREE.MeshBasicMaterial({ map: cw, transparent: true, toneMapped: false, depthWrite: false })); sentTile.renderOrder = 5; scene.add(sentTile);
  // the phone (illustrative settings screen; not any real app's UI)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  labelL = makeLabel(0.5, 0.13);
}

// ------------------------------------------------------------------ TV, card and phone screens (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
const COLD = 'Maybe I don’t like the cold.';
let tvKey = '';
function tvState(t) {
  if (t < Hh.cut1) return { sub: COLD, n: COLD.length };
  if (t >= Hh.cut3 && t < Hh.cut4) return { sub: COLD, n: Math.round(clamp(inv(17.55, 18.75, t)) * COLD.length) };
  if (t >= Hh.cut5) return { sub: COLD, n: Math.round(clamp(inv(Hh.cold2 - 0.25, Hh.cold2 + 0.45, t)) * COLD.length) };
  return { sub: '', n: 0 };                                       // no subtitles while the speaker is explained
}
function drawTV(t) {
  const s = tvState(t), key = s.sub + s.n + '|' + Math.floor(t * 4); if (key === tvKey) return; tvKey = key;
  const g = tvCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  const gr = g.createLinearGradient(0, 0, 0, TVH); gr.addColorStop(0, '#3B3550'); gr.addColorStop(1, '#1C2033'); g.fillStyle = gr; g.fillRect(0, 0, TVW, TVH);
  g.fillStyle = 'rgba(255,200,120,0.18)'; g.fillRect(520, 40, 150, 120);                                   // a window
  const fig = (x, col, nod) => { g.fillStyle = col; g.beginPath(); g.arc(x, 170 + nod, 46, 0, 7); g.fill(); rr(g, x - 80, 230 + nod, 160, 220, 70); g.fill(); };
  fig(250, '#7B6F9A', 3 * Math.sin(t * 5)); fig(520, '#5E86A8', 3 * Math.sin(t * 4 + 1));
  const txt = s.sub.slice(0, s.n); if (txt) { g.font = `600 40px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; const w = g.measureText(s.sub).width + 40; g.fillStyle = 'rgba(0,0,0,0.65)'; rr(g, TVW / 2 - w / 2, 352, w, 58, 10); g.fill(); g.fillStyle = '#FFFFFF'; g.textAlign = 'left'; g.fillText(txt, TVW / 2 - w / 2 + 20, 382); }
  tvMesh.material.map.needsUpdate = true;
}
let cardKey = '';
function cardState(t) { return { tiles: q20(inv(Hh.tiles[0], Hh.tiles[1], t)), badges: q20(inv(Hh.badges[0], Hh.badges[1], t)) }; }
function drawCard(g, s) {
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, NW, NH);
  if (!(s.tiles > 0)) return;                                          // plain card until the show tiles arrive (no decorative ring)
  const cols = ['#7B6F9A', '#5E86A8', '#A0705E', '#5E9A7B'];
  for (let i = 0; i < 12; i++) {
    const a = clamp(s.tiles * 12 - i), b = clamp(s.badges * 12 - i); if (!(a > 0)) continue;
    const cx = 84 + (i % 4) * 144, cy = 210 + Math.floor(i / 4) * 140;
    g.save(); g.globalAlpha = a; g.translate(cx, cy); const k = (0.85 + 0.15 * a) * 0.8; g.scale(k, k);
    g.fillStyle = '#2A3550'; rr(g, -80, -52, 160, 100, 14); g.fill(); g.fillStyle = '#1C2033'; rr(g, -70, -44, 140, 82, 8); g.fill();
    g.fillStyle = cols[i % 4]; g.beginPath(); g.arc(-22, -14, 13, 0, 7); g.fill(); rr(g, -40, 2, 36, 34, 14); g.fill();
    g.fillStyle = cols[(i + 1) % 4]; g.beginPath(); g.arc(24, -12, 13, 0, 7); g.fill(); rr(g, 6, 4, 36, 32, 14); g.fill();
    g.fillStyle = '#2A3550'; g.fillRect(-14, 48, 28, 10);
    if (b > 0) { g.globalAlpha = a * b; g.fillStyle = '#0E1424'; g.beginPath(); g.arc(66, -46, 26, 0, 7); g.fill(); g.strokeStyle = P.mint; g.lineWidth = 7; g.shadowColor = P.mint; g.shadowBlur = 14; g.beginPath(); g.arc(66, -46, 15, 0, 7); g.stroke(); }
    g.restore();
  }
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawCard(g, s); cardMesh.material.map.needsUpdate = true;
}
let screenKey = '';
function drawScreen(t) {
  const k = q20(E.inOutCubic(inv(Hh.slide[0], Hh.slide[1], t))), key = String(k); if (key === screenKey) return; screenKey = key;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#0E1424'; g.fillRect(0, 0, SW, SH);
  tag(g, SW - 24, 30, 'EXAMPLE', NAVY, AMBER, 22);
  // speaker icon
  g.fillStyle = '#D9DEE6'; g.beginPath(); g.ellipse(SW / 2, 200, 92, 40, 0, 0, 7); g.fill(); g.fillRect(SW / 2 - 92, 200, 184, 46); g.beginPath(); g.ellipse(SW / 2, 246, 92, 30, 0, 0, Math.PI); g.fill();
  g.strokeStyle = '#2A3550'; g.lineWidth = 6; g.beginPath(); g.ellipse(SW / 2, 196, 56, 22, 0, 0, 7); g.stroke();
  g.fillStyle = '#F4F7FB'; g.font = `800 56px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Sensitivity', SW / 2, 360);
  const x0 = 96, x1 = SW - 96, y = 480, kx = lerp((x0 + x1) / 2, x0, k);
  g.strokeStyle = 'rgba(244,247,251,0.25)'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
  g.strokeStyle = P.mint; g.beginPath(); g.moveTo(x0, y); g.lineTo(kx, y); g.stroke();
  [[x0, 'Less'], [(x0 + x1) / 2, 'Default'], [x1, 'More']].forEach(([x, w], i) => { const on = (i === 0 && k > 0.95) || (i === 1 && k < 0.05); g.fillStyle = on ? P.mint : 'rgba(244,247,251,0.6)'; g.font = `${on ? 800 : 600} 36px ${HI}`; g.fillText(w, x, y + 70); });
  g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(kx, y, 30, 0, 7); g.fill(); g.strokeStyle = P.mint; g.lineWidth = 8; g.stroke();
  screenMesh.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ choreography
const HOOK = { x: -0.32, z: -0.22, rotY: 22 };
const HOME2 = { x: -0.06, z: 0.55, rotY: 6 };
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const OFF = { x: -1.4, z: 0.6, rotY: 0 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...HOOK, headYaw: 24, headPitch: 15 } },
  { t: Hh.why - 0.3, p: {} },
  { t: Hh.why, e: 'outBack', p: { headRoll: 14, lean: -3 } },                                    // "wake up?"
  { t: Hh.cut2 - 0.01, p: {} },
  { t: Hh.cut2, p: { headRoll: 0, lean: 0 } },
  { t: Hh.cut3 - 0.01, p: {} },
  { t: Hh.cut3, p: { ...HOOK, headYaw: -6, headPitch: 2 } },                                       // (cut) listening
  { t: Hh.wake - 0.05, p: {} },
  { t: Hh.wake + 0.25, e: 'outBack', p: { headYaw: 26, headPitch: 15, lean: -4 } },                // snaps round to the speaker
  { t: Hh.cut4 - 0.01, p: {} },
  { t: Hh.cut4, p: { ...HOME2, headYaw: 0, headPitch: 14, lean: 0 } },                             // (cut) phone
  { t: Hh.cut5 - 0.01, p: {} },
  { t: Hh.cut5, p: { ...HOOK, headYaw: -6, headPitch: 2 } },                                       // (cut) the same line again
  { t: Hh.asleep, p: {} },
  { t: Hh.asleep + 0.3, e: 'outBack', p: { headYaw: 24, headPitch: 14 } },
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headYaw: 0, headPitch: -2, headRoll: 0, lean: 0 } },   // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 0], [Hh.cut4 - 0.01, 0], [Hh.cut4, 1], [Hh.cut5 - 0.01, 1], [Hh.cut5, 0], [30.5, 0]], 1: [[-1, 0], [Hh.cut4 - 0.01, 0], [Hh.cut4, 1], [Hh.cut5 - 0.01, 1], [Hh.cut5, 0], [30.5, 0]] };
const EXPR = [[-9, 'puzzled'], [Hh.cut1, 'focus'], [Hh.cut3, 'focus'], [Hh.wake, 'wow'], [Hh.cut4, 'determined'], [Hh.slide[1], 'happy'], [Hh.cut5, 'focus'], [Hh.asleep, 'proud'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [1.9, 6.0, 11.3, 14.6, 17.9, 22.3, 25.0, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, 0.0, 10) + kick(t, Hh.wake, 18) + kick(t, Hh.asleep, 10) + 6 * Math.sin(t * 3.1);
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

// ------------------------------------------------------------------ the speaker's standby check (pure functions of t)
const TVSRC = () => TV_POS.clone().add(V(0.12, 0.8, 0.12));
function along(a, b, k, lift = 0.35) { const m = a.clone().lerp(b, 0.5).add(V(0, lift, 0)); const u = 1 - k; return a.clone().multiplyScalar(u * u).add(m.multiplyScalar(2 * u * k)).add(b.clone().multiplyScalar(k * k)); }
const coldT = (t) => (t >= Hh.cut5 ? Hh.cold2 : Hh.cold);
function meterVal(t) {
  let v = 0.04 + 0.02 * Math.sin(t * 7);
  const spike = (tc, h, dec) => (t < tc ? 0 : h * clamp((t - tc) / 0.12) * Math.exp(-Math.max(0, t - tc - 0.12) / dec));
  if (t >= Hh.cut1 && t < Hh.cut2) for (const s of SNIP) v = Math.max(v, spike(s.t + FLY, s.h, 0.28));
  if ((t >= Hh.cut3 && t < Hh.cut4) || t >= Hh.cut5) v = Math.max(v, spike(coldT(t) + FLY, COLD_H, t >= Hh.cut5 ? 0.5 : 1.6));
  return clamp(v);
}
const thrAt = (t) => (t >= Hh.cut5 ? THR2 : THR1);
function ringOn(t) { if (t < Hh.cut1) return 1; if (t >= Hh.wake && t < Hh.cut4) return 1; return 0; }
function labelAt(t) {
  if (t < Hh.cut1) return ['WHO WOKE IT?', AMBER, NAVY];
  if (t >= Hh.onDevice && t < Hh.nothing) return ['ON DEVICE', P.mint, NAVY];
  if (t >= Hh.nothing && t < Hh.line) return ['NOTHING SENT', P.mint, NAVY];
  if (t >= Hh.line && t < Hh.cut2) return ['CLOSE ENOUGH?', AMBER, NAVY];
  if (t >= Hh.tiles[0] + 0.1 && t < Hh.all12) return ['12 TV SHOWS', P.mint, NAVY];
  if (t >= Hh.all12 && t < Hh.cut3) return ['12 OF 12', AMBER, NAVY];
  if (t >= Hh.sent[0] && t < Hh.cut4) return ['SENT', AMBER, NAVY];
  if (t >= Hh.slide[0] + 0.15 && t < Hh.cut5) return ['LESS SENSITIVE', P.mint, NAVY];
  if (t >= Hh.asleep && t < Hh.cta) return ['STAYS ASLEEP', P.mint, NAVY];
  return null;
}

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  // phone held up with both hands for the settings beat
  const showPhone = t >= Hh.cut4 && t < Hh.cut5; phone.visible = showPhone;
  if (showPhone) { const s = spot(p, V(0.0, 1.02, 0.36), -0.06); phone.position.copy(s.p); phone.quaternion.copy(s.q); scene.updateMatrixWorld(true); }
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  solveArm(0, p, showPhone ? onPhone(-0.19, -0.06, 0) : null, wA); solveArm(1, p, showPhone ? onPhone(0.19, -0.06, 0) : null, wB);
  scene.updateMatrixWorld(true);
  // speaker: ring, glow, x-ray + chip
  const on = ringOn(t), pulse = on ? 0.75 + 0.25 * Math.sin(t * 6) : 0;
  ring.material.color.set(on ? '#C8FFD6' : '#2A3550');
  ringGlow.position.copy(SPK).add(V(0, 0.09, 0)); ringGlow.quaternion.copy(cam.quaternion); ringGlow.material.opacity = on ? pulse : 0; ringGlow.visible = on > 0;
  const xr = t >= Hh.cut1 && t < Hh.cut2 ? E.inOutCubic(inv(Hh.cut1 + 0.2, Hh.chip, t)) : 0;
  shellMat.opacity = lerp(1, 0.22, xr); shellMat.depthWrite = xr < 0.5; chipMesh.visible = xr > 0.05;
  let flash = kick(t, Hh.chip, 0.8, 0.3, 0.1); for (const s of SNIP) if (t >= s.t + FLY) flash = Math.max(flash, 1.2 * Math.exp(-(t - s.t - FLY) / 0.18));
  chipMat.emissiveIntensity = 0.3 + (t >= Hh.cut1 && t < Hh.cut2 ? flash : 0);
  // snippets: from the TV into the speaker, checked, then dropped
  snipTiles.forEach((m, i) => { const s = SNIP[i], k = inv(s.t, s.t + FLY, t), vis = t >= Hh.cut1 && t < Hh.cut2 && t >= s.t && t < s.t + FLY + 0.25; m.visible = vis; if (!vis) return;
    const dk = inv(s.t + FLY, s.t + FLY + 0.25, t); m.position.copy(along(TVSRC(), SPK.clone().add(V(0, 0.07, 0)), E.inOutSine(k))); m.quaternion.copy(cam.quaternion); m.scale.setScalar(lerp(1, 0.25, dk)); m.material.opacity = (1 - dk) * clamp((k - 0.3) / 0.15); });   // fades in below the top band
  // the culprit line (and, after the setting change, the same line again)
  const ct = coldT(t), inCold = (t >= Hh.cut3 && t < Hh.cut4) || (t >= Hh.cut5 && t < Hh.cta);
  { const k = inv(ct, ct + FLY, t), vis = inCold && t >= ct && t < ct + FLY + 0.3; coldTile.visible = vis; if (vis) { const dk = inv(ct + FLY, ct + FLY + 0.3, t); coldTile.position.copy(along(TVSRC(), SPK.clone().add(V(0, 0.08, 0)), E.inOutSine(k))); coldTile.quaternion.copy(cam.quaternion); coldTile.scale.setScalar(lerp(1, 0.3, dk)); coldTile.material.opacity = 1 - dk; } }
  { const k = inv(Hh.sent[0], Hh.sent[1], t), vis = t >= Hh.sent[0] && t < Hh.cut4 && k < 1; sentTile.visible = vis; if (vis) { sentTile.position.copy(along(SPK.clone().add(V(0, 0.1, 0)), CLOUD_POS, E.inOutCubic(k), 0.12)); sentTile.quaternion.copy(cam.quaternion); sentTile.scale.setScalar(lerp(0.4, 1, Math.min(1, k * 3)) * lerp(1, 0.4, inv(0.75, 1, k))); sentTile.material.opacity = 1; } }
  // meter + cloud
  const showMeter = (t >= Hh.snip0 - 0.3 && t < Hh.cut2) || (t >= Hh.cut3 && t < Hh.cut4) || (t >= Hh.cut5 && t < Hh.cta);
  meter.visible = showMeter; if (showMeter) { meter.position.copy(METER_POS); meter.quaternion.copy(cam.quaternion); meter.scale.setScalar(0.85); const v = meterVal(t), thr = thrAt(t);
    meterFill.scale.y = Math.max(0.01, v); meterFill.position.y = 0.03 + 0.15 * v; meterFill.material.color.set(v >= thr ? AMBER : P.mint);
    const lv = (t >= Hh.line && t < Hh.cut2) || t >= Hh.cut3; meterLine.visible = meterTag.visible = lv; const ly = 0.03 + 0.3 * thr; meterLine.position.y = ly; meterTag.position.set(0.1, ly, 0.009);
    const pop = t < Hh.cut2 ? E.outBack(inv(Hh.line, Hh.line + 0.3, t)) : 1; meterLine.scale.x = Math.max(0.01, pop); }
  const showCloud = (t >= Hh.nothing && t < Hh.cut2) || (t >= Hh.cut3 && t < Hh.cut4); cloud.visible = showCloud;
  if (showCloud) { cloud.position.copy(CLOUD_POS); cloud.quaternion.copy(cam.quaternion); const lit = t >= Hh.sent[1] - 0.1 && t < Hh.cut4; cloud.material.opacity = lit ? 1 : 0.32; cloud.material.color.set(lit ? '#FFFFFF' : '#9FB4D9'); cloud.scale.setScalar(1 + (lit ? 0.12 * Math.exp(-(t - Hh.sent[1]) / 0.2) : 0)); }
  drawTV(t); updateCard(t); if (showPhone) drawScreen(t);
  const lb = labelAt(t);
  if (lb) { const [txt, bg, fg] = lb; paintLabel(labelL, txt + bg, (g, W2, H2) => pill(g, W2, H2, txt, bg, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.1), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[BOARD_POS.x + 1.6 * Math.sin(BOARD_YAW), 1.13, BOARD_POS.z + 1.6 * Math.cos(BOARD_YAW)], [BOARD_POS.x, 1.13, BOARD_POS.z]];
const LAB2 = [[BOARD_POS.x + 1.45 * Math.sin(BOARD_YAW), 1.13, BOARD_POS.z + 1.45 * Math.cos(BOARD_YAW)], [BOARD_POS.x, 1.13, BOARD_POS.z]];
const WIDE = [[0.0, 1.2, 2.8], [0.0, 0.72, 0.0]];
const CAM = [
  [0.0, [0.0, 1.18, 2.75], [0.0, 0.72, 0.1]], [Hh.cut1 - 0.01, [0.0, 1.16, 2.62], [0.0, 0.72, 0.1]],
  [Hh.cut1, [0.14, 0.98, 1.86], [0.3, 0.6, 0.95]], [Hh.snip0, [0.15, 0.95, 1.78], [0.3, 0.6, 0.95]], [Hh.nothing - 0.1, [0.15, 0.96, 1.8], [0.29, 0.61, 0.95]],
  [Hh.nothing + 0.8, [0.02, 0.96, 2.3], [0.14, 0.76, 0.85]], [Hh.cut2 - 0.01, [0.02, 0.96, 2.26], [0.14, 0.76, 0.85]],
  [Hh.cut2, ...LAB], [Hh.cut3 - 0.01, ...LAB2],
  [Hh.cut3, ...WIDE], [Hh.cut4 - 0.01, [0.0, 1.19, 2.72], [0.0, 0.72, 0.0]],
  [Hh.cut4, [-0.03, 1.15, 1.95], [-0.03, 1.12, 0.88]], [Hh.cut5 - 0.01, [-0.03, 1.15, 1.86], [-0.03, 1.12, 0.88]],
  [Hh.cut5, ...WIDE], [Hh.cta - 0.01, [0.0, 1.19, 2.72], [0.0, 0.72, 0.0]],
  [Hh.cta, [0.02, 1.26, 2.6], [-0.02, 1.08, 0.5]], [30.0, [0.02, 1.25, 2.4], [-0.03, 1.09, 0.5]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.wake, 0.006, 0.1, 40);
  cam.position.set(pos[0] + shake + 0.003 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.003 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: the TV line + the lit speaker + "WHO WOKE IT?"
window.renderThumb = () => {
  const t = 0.0; cameraAt(t); cam.position.set(0.0, 1.22, 2.95); cam.lookAt(0.0, 0.92, 0.1); stageAt(t); labelL.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 760);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['WHO', '#F4F7FB', 400], ['WOKE IT?', AMBER, 560]].forEach(([w, col, y]) => { let S = 170; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
