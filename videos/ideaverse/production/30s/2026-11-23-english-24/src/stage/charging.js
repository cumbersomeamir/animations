// charging.js — Ideaverse production 30s english-24 #01 (English): why an iPhone pauses at 80% overnight — on-device machine
// learning learns the charging routine (≥14 days, ≥9 long charges in one place), holds at 80%, finishes shortly before you need it.
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine);
// overlay tail from english-12. New: a bedside set (nightstand, phone on a stand, alarm clock, window night→dawn, bed corner), aging + routine cards, generic notification screens.
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

// ------------------------------------------------------------------ the bedside at night (original set: nightstand, phone on a stand, alarm clock, window)
const CORAL = '#FF7A45', GREY = '#9AA6BF', RED2 = '#FF5A5A';
function mulberry(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// the night, as a pure function of t: clock minutes since midnight, battery %, hold, dawn 0..1, alarm
function nightAt(t) {
  let min, bat = 80, hold = 0, dawn = 0, alarm = 0;
  if (t < Hh.cut4) min = lerp(70, 220, E.inOutSine(inv(Hh.race[0], Hh.race[1], t)));                 // 1:10 → 3:40 ("then waits")
  else {
    min = t < Hh.fill[0] ? lerp(220, 330, inv(Hh.cut4, Hh.fill[0], t)) : t < Hh.alarm ? lerp(330, 419, inv(Hh.fill[0], Hh.alarm, t)) : 420;
    hold = t < Hh.fill[0] ? 1 : 0;
    bat = Math.round(lerp(80, 100, E.inOutSine(inv(Hh.fill[0], Hh.fill[1], t))));
    dawn = E.inOutSine(inv(Hh.fill[0] - 0.3, Hh.alarm, t)); alarm = t >= Hh.alarm ? 1 : 0;
  }
  return { min: Math.round(min), bat, hold, dawn: q20(dawn), alarm };
}
const hhmm = (m) => `${Math.floor(m / 60) || 12}:${String(m % 60).padStart(2, '0')}`;

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, labelL, labelH, room, nCanvas, nMesh, clkCanvas, clkMesh, skyCanvas, skyMesh, dawnLight;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
const NW = 600, NH = 800, CS = 2;
const NST = V(0, 0, 0.25), TOP_Y = 0.45, NPH = V(0.065, 0.0, 0.31), NPW = 320, NPHH = 640;
function buildRoom() {
  room = new THREE.Group(); scene.add(room);
  const wood = M('#34466E', { roughness: 0.6 }), shell = M('#E9EFF2', { roughness: 0.5 });
  const body = rbox(0.46, TOP_Y, 0.34, 0.02, wood); body.position.set(NST.x, TOP_Y / 2, NST.z); room.add(body);
  const drawer = rbox(0.4, 0.14, 0.01, 0.01, M('#2B3A60', { roughness: 0.6 })); drawer.position.set(NST.x, 0.3, NST.z + 0.172); room.add(drawer);
  const handle = rbox(0.08, 0.014, 0.012, 0.005, mats.steel); handle.position.set(NST.x, 0.3, NST.z + 0.18); room.add(handle);
  // the phone on a little stand, tilted back, screen to the camera
  const stand = rbox(0.06, 0.03, 0.05, 0.008, M(P.mint, { roughness: 0.5 })); stand.position.set(NPH.x, TOP_Y + 0.015, NPH.z - 0.01); room.add(stand);
  const pg = new THREE.Group(); pg.position.set(NPH.x, TOP_Y + 0.088, NPH.z); pg.rotation.x = -0.28; room.add(pg);
  const pbody = rbox(0.085, 0.17, 0.01, 0.012, mats.navy); pg.add(pbody);
  nCanvas = canvas(NPW, NPHH);
  nMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.077, 0.154), new THREE.MeshBasicMaterial({ map: cvTex(nCanvas), toneMapped: false })); nMesh.position.z = 0.0055; pg.add(nMesh);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(NPH.x, TOP_Y + 0.006, NPH.z + 0.005), V(NPH.x + 0.05, TOP_Y + 0.005, NPH.z - 0.04), V(0.2, TOP_Y + 0.004, 0.14), V(0.235, 0.38, 0.1), V(0.25, 0.01, 0.06)]), 40, 0.004, 8, false), M('#F4F7FB', { roughness: 0.6 })); room.add(cable);
  // alarm clock
  const clk = rbox(0.15, 0.075, 0.055, 0.015, M('#1B2333', { roughness: 0.4 })); clk.position.set(-0.115, TOP_Y + 0.0375, NST.z + 0.04); clk.rotation.y = 0.15; room.add(clk);
  clkCanvas = canvas(300, 150);
  clkMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.065), new THREE.MeshBasicMaterial({ map: cvTex(clkCanvas), toneMapped: false })); clkMesh.position.set(0, 0, 0.0285); clk.add(clkMesh);
  // lamp (off)
  const lb = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.015, 24), shell)); lb.position.set(-0.16, TOP_Y + 0.008, NST.z - 0.09); room.add(lb);
  const ls = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 10), mats.steel)); ls.position.set(-0.16, TOP_Y + 0.09, NST.z - 0.09); room.add(ls);
  const shade = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.075, 0.085, 28, 1, true), M('#F4E9D8', { roughness: 0.8, side: THREE.DoubleSide }))); shade.position.set(-0.16, TOP_Y + 0.19, NST.z - 0.09); room.add(shade);
  // the bed's corner (foreground depth, right)
  const bed = rbox(0.9, 0.26, 1.1, 0.03, M('#2E3B5E', { roughness: 0.7 })); bed.position.set(0.72, 0.13, 0.42); room.add(bed);
  const mat = rbox(0.86, 0.1, 1.06, 0.04, M('#E9EFF2', { roughness: 0.8 })); mat.position.set(0.72, 0.31, 0.42); room.add(mat);
  const blanket = rbox(0.88, 0.05, 0.72, 0.03, M('#3E8A5A', { roughness: 0.85 })); blanket.position.set(0.72, 0.375, 0.6); room.add(blanket);
  const pillow = rbox(0.34, 0.08, 0.2, 0.04, M('#F4F7FB', { roughness: 0.9 })); pillow.position.set(0.6, 0.4, 0.03); room.add(pillow);
  // window: sky from night to dawn
  const wf = rbox(0.74, 0.64, 0.03, 0.015, shell); wf.position.set(-0.02, 0.98, -0.34); room.add(wf);
  skyCanvas = canvas(512, 448);
  skyMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.58), new THREE.MeshBasicMaterial({ map: cvTex(skyCanvas), toneMapped: false })); skyMesh.position.set(-0.02, 0.98, -0.322); room.add(skyMesh);
  for (const [w, h, x, y] of [[0.012, 0.58, -0.02, 0.98], [0.68, 0.012, -0.02, 0.98]]) { const b = rbox(w, h, 0.02, 0.004, shell); b.position.set(x, y, -0.315); room.add(b); }
  dawnLight = new THREE.PointLight('#FFC48A', 0, 3, 1.5); dawnLight.position.set(-0.02, 1.0, -0.1); room.add(dawnLight);
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: a battery icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 14; mg.strokeStyle = P.mint; mg.lineWidth = 12; rr(mg, 150, 100, 190, 100, 16); mg.stroke(); mg.fillStyle = P.mint; mg.fillRect(346, 130, 16, 40); rr(mg, 166, 116, 120, 68, 8); mg.fill();
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  buildRoom();
  // easel + card
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // DOCKET's phone (illustrative lock screen; not any real phone's UI)
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
function bolt(g, x, y, s, col) { g.save(); g.fillStyle = col; g.beginPath(); g.moveTo(x + 0.15 * s, y - 0.5 * s); g.lineTo(x - 0.3 * s, y + 0.08 * s); g.lineTo(x - 0.02 * s, y + 0.08 * s); g.lineTo(x - 0.15 * s, y + 0.5 * s); g.lineTo(x + 0.3 * s, y - 0.08 * s); g.lineTo(x + 0.02 * s, y - 0.08 * s); g.closePath(); g.fill(); g.restore(); }
function shield(g, x, y, s, col, lw) { g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + 0.85 * s, y - 0.65 * s); g.quadraticCurveTo(x + 0.85 * s, y + 0.55 * s, x, y + s); g.quadraticCurveTo(x - 0.85 * s, y + 0.55 * s, x - 0.85 * s, y - 0.65 * s); g.closePath(); g.stroke(); g.restore(); }

// ---- the nightstand phone, the clock, the sky
let nKey = '', cKey = '', sKey = '';
function drawNightPhone(t) {
  const n = nightAt(t), sh2 = t >= Hh.cut1 && t < Hh.cut2 ? q20(inv(Hh.shield, Hh.shield + 0.4, t)) : 0, s = { b: n.bat, h: n.hold, sh: sh2, m: n.min }, key = JSON.stringify(s); if (key === nKey) return; nKey = key;
  const g = nCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; bg(g, NPW, NPHH, '#0B1020');
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(244,247,251,0.75)'; g.font = `700 40px ${HI}`; g.fillText(hhmm(s.m), NPW / 2, 70);
  const cx = NPW / 2, cy = 300, r = 105;
  g.lineWidth = 22; g.strokeStyle = '#26304A'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
  g.strokeStyle = s.b >= 100 ? P.mint : s.h ? AMBER : P.mint; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * s.b / 100); g.stroke();
  g.fillStyle = '#F4F7FB'; g.font = `800 78px ${HI}`; g.fillText(`${s.b}%`, cx, cy + 4);
  if (s.h) { g.fillStyle = AMBER; g.fillRect(cx - 22, cy + 150, 14, 44); g.fillRect(cx + 8, cy + 150, 14, 44); }
  else bolt(g, cx, cy + 172, 60, s.b >= 100 ? P.mint : AMBER);
  if (s.sh > 0) { g.save(); g.globalAlpha = s.sh; shield(g, cx, cy, 150 * (1.25 - 0.25 * E.outBack(s.sh)), P.mint, 12); g.restore(); }
  nMesh.material.map.needsUpdate = true;
}
function drawClock(t) {
  const n = nightAt(t), ring = n.alarm && Math.floor(t * 6) % 2 === 0 ? 1 : 0, key = n.min + '|' + n.alarm + '|' + ring; if (key === cKey) return; cKey = key;
  const g = clkCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); bg(g, 300, 150, '#070A12');
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = n.alarm ? (ring ? '#FFE2A0' : AMBER) : CORAL; g.font = `800 92px "JetBrains Mono", ${HI}`; g.fillText(hhmm(n.min), 150, 80);
  if (n.alarm) { g.fillStyle = ring ? '#FFE2A0' : AMBER; g.beginPath(); g.arc(270, 28, 12, Math.PI, 0); g.lineTo(282, 40); g.lineTo(258, 40); g.closePath(); g.fill(); }
  clkMesh.material.map.needsUpdate = true;
}
function drawSky(t) {
  const n = nightAt(t), key = String(n.dawn); if (key === sKey) return; sKey = key;
  const g = skyCanvas.getContext('2d'), d = n.dawn, W2 = 512, H2 = 448; g.setTransform(1, 0, 0, 1, 0, 0);
  const mix = (a, b) => { const pa = a.match(/\w\w/g).map((x) => parseInt(x, 16)), pb = b.match(/\w\w/g).map((x) => parseInt(x, 16)); return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], d))).join(',')})`; };
  const gr = g.createLinearGradient(0, 0, 0, H2); gr.addColorStop(0, mix('0B1433', '3B5BA8')); gr.addColorStop(0.65, mix('17224A', 'F2A86B')); gr.addColorStop(1, mix('1E2A55', 'FFD08A'));
  g.fillStyle = gr; g.fillRect(0, 0, W2, H2 - 1); g.fillRect(0, H2 - 1, W2, 1);
  const r = mulberry(3); g.fillStyle = `rgba(255,255,255,${0.85 * (1 - d)})`; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(r() * W2, r() * H2 * 0.6, 1 + r() * 1.6, 0, 7); g.fill(); }
  g.fillStyle = `rgba(244,241,224,${1 - d})`; g.beginPath(); g.arc(380, 100, 34, 0, 7); g.fill();
  if (d > 0) { g.fillStyle = `rgba(255,214,120,${d})`; g.beginPath(); g.arc(160, H2 - 40 + 60 * (1 - d), 46, 0, 7); g.fill(); }
  g.fillStyle = mix('0A0F22', '3A2E4A'); g.beginPath(); g.moveTo(0, H2); for (let x = 0; x <= W2; x += 32) g.lineTo(x, H2 - 40 - 30 * Math.abs(Math.sin(x * 0.02 + 1))); g.lineTo(W2, H2); g.closePath(); g.fill();
  skyMesh.material.map.needsUpdate = true; dawnLight.intensity = 1.6 * d;
}

// ---- the card: C = full charge ages batteries · D = the learned routine + the three conditions (label lane y 500–600)
let cardKey = '';
const NIGHTS = (() => { const r = mulberry(17); return Array.from({ length: 14 }, () => [22.5 + r() * 1.3, 6.6 + r() * 0.6]); })();   // plug-in / unplug hours
const hx = (h) => 70 + ((h < 12 ? h + 24 : h) - 21) / 11 * 480;                   // 9 PM … 8 AM → x
function cardState(t) {
  if (t < Hh.cut3) return { m: 'age', k: q20(inv(Hh.hours[0], Hh.hours[1], t)) };
  return { m: 'rt', on: q20(inv(Hh.onPhone, Hh.onPhone + 0.3, t)), n: Math.round(14 * inv(Hh.nights[0], Hh.nights[1], t)), u: q20(inv(Hh.unplug, Hh.unplug + 0.3, t)), c: Hh.chk.map((c) => q20(inv(c, c + 0.25, t))) };
}
function drawCard(g, s) {
  bg(g, NW, NH, '#0E1424');
  g.textBaseline = 'middle';
  if (s.m === 'age') {
    // a full battery, hours ticking at 100%, an aging bar growing (illustrative)
    g.strokeStyle = '#F4F7FB'; g.lineWidth = 8; rr(g, 80, 70, 400, 170, 26); g.stroke(); g.fillStyle = '#F4F7FB'; rr(g, 486, 125, 22, 60, 6); g.fill();
    g.fillStyle = P.mint; rr(g, 96, 86, 368, 138, 16); g.fill();
    g.fillStyle = NAVY; g.font = `800 72px ${HI}`; g.textAlign = 'center'; g.fillText('100%', 280, 158);
    g.fillStyle = 'rgba(244,247,251,0.75)'; g.font = `800 28px ${HI}`; g.textAlign = 'left'; g.fillText('HOURS AT FULL', 80, 300);
    g.fillStyle = '#F4F7FB'; g.font = `800 64px ${HI}`; g.textAlign = 'right'; g.fillText(`${Math.round(8 * s.k)} h`, 520, 300);
    g.fillStyle = 'rgba(244,247,251,0.75)'; g.font = `800 28px ${HI}`; g.textAlign = 'left'; g.fillText('BATTERY AGING', 80, 380);
    g.fillStyle = '#26304A'; rr(g, 80, 410, 440, 34, 12); g.fill();
    g.fillStyle = AMBER; rr(g, 80, 410, Math.max(24, 440 * (0.12 + 0.7 * s.k)), 34, 12); g.fill();
    return;
  }
  chip(g, 40, 50, 'ON THE PHONE', Math.max(0.0, s.on), P.mint, 26);
  // axis
  g.fillStyle = 'rgba(244,247,251,0.65)'; g.font = `700 20px ${HI}`; g.textAlign = 'center';
  [[22, '10 PM'], [2, '2 AM'], [6, '6 AM']].forEach(([h, l]) => { g.fillText(l, hx(h), 104); g.fillStyle = 'rgba(244,247,251,0.12)'; g.fillRect(hx(h) - 1, 116, 2, 290); g.fillStyle = 'rgba(244,247,251,0.65)'; });
  // 14 nights plugged in
  for (let i = 0; i < s.n; i++) { const [a, b] = NIGHTS[i], y = 124 + i * 20; g.fillStyle = i % 2 ? '#4E7BD8' : P.mint; rr(g, hx(a), y, hx(b) - hx(a), 13, 6); g.fill(); g.fillStyle = 'rgba(244,247,251,0.5)'; g.font = `700 13px ${HI}`; g.textAlign = 'right'; g.fillText(String(i + 1), 60, y + 7); }
  if (s.u > 0) { g.save(); g.globalAlpha = s.u; g.strokeStyle = AMBER; g.lineWidth = 4; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(hx(7), 116); g.lineTo(hx(7), 410); g.stroke(); g.setLineDash([]); g.fillStyle = AMBER; g.font = `800 20px ${HI}`; g.textAlign = 'center'; g.fillText('usually unplugged', hx(7) - 40, 424); g.restore(); }
  // the conditions (Apple: at least 14 days; at least 9 charges of 5 hours or more in a given location)
  [['14+ DAYS', 40], ['9+ CHARGES, 5 H+', 200], ['SAME PLACE', 432]].forEach(([w, x], i) => { if (s.c[i] > 0) chip(g, x, 470, '✓ ' + w, s.c[i], P.mint, 20); });
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawCard(g, s); cardMesh.material.map.needsUpdate = true;
}
// ---- DOCKET's phone: the paused-charging notice → touch and hold → Charge Now → charging resumes (generic, EXAMPLE)
let screenKey = '';
function screenState(t) { return { p: q20(inv(Hh.press[0], Hh.press[1], t)), m: q20(inv(Hh.menu, Hh.menu + 0.25, t)), tap: t >= Hh.tap && t < Hh.tap + 0.25 ? 1 : 0, go: t >= Hh.go ? 1 : 0, pct: t >= Hh.go ? 80 + Math.min(2, Math.floor((t - Hh.go) / 0.8) + 1) : 80 }; }
function drawScreen(t) {
  const s = screenState(t), key = JSON.stringify(s); if (key === screenKey) return; screenKey = key;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px'; bg(g, SW, SH, '#0B1020');
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#F4F7FB'; g.font = `800 120px ${HI}`; g.fillText('6:10', SW / 2, 190);
  // the notification card (grows a little while held)
  const k = 1 + 0.04 * s.p, cw = (SW - 60) * k, ch = 170 * k, cx = SW / 2, cy = 400;
  g.fillStyle = '#1C2640'; rr(g, cx - cw / 2, cy - ch / 2, cw, ch, 28); g.fill();
  g.textAlign = 'left';
  if (!s.go) { g.fillStyle = AMBER; g.fillRect(cx - cw / 2 + 34, cy - 34, 12, 40); g.fillRect(cx - cw / 2 + 54, cy - 34, 12, 40); g.fillStyle = '#F4F7FB'; g.font = `800 40px ${HI}`; g.fillText('Charging paused', cx - cw / 2 + 92, cy - 24); g.fillStyle = 'rgba(244,247,251,0.8)'; g.font = `700 32px ${HI}`; g.fillText('at 80% · full by 6:55', cx - cw / 2 + 92, cy + 28); }
  else { bolt(g, cx - cw / 2 + 52, cy - 2, 56, P.mint); g.fillStyle = '#F4F7FB'; g.font = `800 40px ${HI}`; g.fillText('Charging now', cx - cw / 2 + 92, cy - 24); g.fillStyle = P.mint; g.font = `800 36px ${HI}`; g.fillText(`${s.pct}%`, cx - cw / 2 + 92, cy + 28); }
  if (s.p > 0 && !s.go) { g.save(); g.globalAlpha = 0.55; g.strokeStyle = '#F4F7FB'; g.lineWidth = 6; g.beginPath(); g.arc(cx + 120, cy, 22 + 40 * s.p, 0, 7); g.stroke(); g.fillStyle = 'rgba(244,247,251,0.6)'; g.beginPath(); g.arc(cx + 120, cy, 20, 0, 7); g.fill(); g.restore(); }
  if (s.m > 0 && !s.go) { g.save(); g.globalAlpha = s.m; g.fillStyle = '#1C2640'; rr(g, 30, 520, SW - 60, 120, 28); g.fill(); g.fillStyle = P.mint; rr(g, 60, 545, SW - 120, 70, 35); g.fill(); g.fillStyle = NAVY; g.font = `800 38px ${HI}`; g.textAlign = 'center'; g.fillText('Charge Now', SW / 2, 581); g.restore(); }
  if (s.tap) { g.fillStyle = 'rgba(244,247,251,0.55)'; g.beginPath(); g.arc(SW / 2, 581, 32, 0, 7); g.fill(); }
  g.textAlign = 'left'; tag(g, SW - 30, 30, 'EXAMPLE', NAVY, AMBER, 22);
  screenMesh.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ choreography
const HOME2 = { x: -0.02, z: 0.42, rotY: 0 };
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const OFF = { x: 1.8, z: 0.4, rotY: 0 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...OFF, ...REST_ARMS } },                                                          // off: the bedside fills the hook
  { t: Hh.cut5 - 0.01, p: {} },
  { t: Hh.cut5, p: { ...HOME2, headPitch: 14 } },                                                  // (cut) the payoff on DOCKET's phone
  { t: Hh.go - 0.05, p: {} },
  { t: Hh.go + 0.3, e: 'outBack', p: { headPitch: 9, headRoll: 5 } },
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headPitch: -2, headRoll: 0 } },                         // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const phoneOn = (t) => t >= Hh.cut5 && t < Hh.cta;
const EXPR = [[-9, 'skeptic'], [Hh.press[0], 'focus'], [Hh.go, 'happy'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [22.0, 25.6, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.go, 14) + 6 * Math.sin(t * 3.1);
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
  if (t >= Hh.shield && t < Hh.cut2) return ['NOT BROKEN', P.mint, NAVY];
  if (t >= 7.3 && t < Hh.cut3) return ['FULL = FASTER AGING', AMBER, NAVY];
  if (t >= 10.85 && t < Hh.chk[0] - 0.4) return ['LEARNS YOUR ROUTINE', P.mint, NAVY];
  if (t >= 15.95 && t < Hh.fill[0]) return ['HOLDS AT 80%', AMBER, NAVY];
  if (t >= 18.4 && t < Hh.cut5) return ['FULL WHEN YOU WAKE', P.mint, NAVY];
  if (t >= 21.1 && t < Hh.tap) return ['NEED IT NOW?', AMBER, NAVY];
  if (t >= Hh.tap && t < Hh.cta) return ['CHARGE NOW', P.mint, NAVY];
  return null;
}
const shotAt = (t) => (t < Hh.cut1 ? 'hook' : t < Hh.cut2 ? 'close' : t < Hh.cut4 ? 'card' : t < Hh.cut5 ? 'night' : t < Hh.cta ? 'phone' : 'cta');

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  const on = phoneOn(t); phone.visible = on;
  if (on) { const s = spot(p, V(0.0, 0.88, 0.36), -0.04); phone.position.copy(s.p); phone.quaternion.copy(s.q); scene.updateMatrixWorld(true); }
  solveArm(0, p, on ? onPhone(-0.19, -0.06, 0) : null, on ? 1 : 0); solveArm(1, p, on ? onPhone(0.19, -0.06, 0) : null, on ? 1 : 0);
  scene.updateMatrixWorld(true);
  const shot = shotAt(t), roomShot = shot === 'hook' || shot === 'close' || shot === 'night';
  room.visible = roomShot; board.visible = shot === 'card' || shot === 'cta';
  if (roomShot) { drawNightPhone(t); drawClock(t); drawSky(t); }
  if (shot === 'card') updateCard(t); if (on) drawScreen(t);
  labelH.visible = false;
  if (shot === 'hook') { paintLabel(labelH, 'hook', (g, W2, H2) => { g.fillStyle = AMBER; g.beginPath(); g.roundRect(8, 8, W2 - 16, H2 - 16, 60); g.fill(); g.fillStyle = NAVY; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 120px ${HI}`; g.fillText('WHY STUCK', W2 / 2, H2 * 0.32); g.fillText('AT 80%?', W2 / 2, H2 * 0.71); });
    const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion); billboard(labelH, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.1), 0.26); }
  const lb = labelAt(t);
  if (lb) { const [txt, bgc, fg] = lb; paintLabel(labelL, txt + bgc, (g, W2, H2) => pill(g, W2, H2, txt, bgc, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.095), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: 0 });
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const HOOKCAM = [[-0.04, 0.68, 1.2], [-0.03, 0.535, 0.3]];
const CLOSEPH = [[0.075, 0.6, 0.6], [0.065, 0.535, 0.3]];
const NIGHTCAM = [[0.1, 0.7, 1.3], [-0.03, 0.56, 0.25]];
const CLOSE = [[0.01, 0.9, 2.3], [0.01, 0.875, 0.78]];
const CAM = [
  [0.0, ...HOOKCAM], [Hh.cut1 - 0.01, [-0.035, 0.66, 1.07], [-0.025, 0.535, 0.3]],
  [Hh.cut1, ...CLOSEPH], [Hh.cut2 - 0.01, [0.072, 0.59, 0.55], [0.065, 0.535, 0.3]],
  [Hh.cut2, ...LAB], [Hh.cut3 - 0.01, [-0.125, 1.13, 1.12], [-0.64, 1.13, -0.32]],
  [Hh.cut3, [-0.085, 1.13, 1.28], [-0.64, 1.13, -0.32]], [Hh.cut4 - 0.01, [-0.11, 1.13, 1.17], [-0.64, 1.13, -0.32]],
  [Hh.cut4, ...NIGHTCAM], [Hh.cut5 - 0.01, [0.07, 0.68, 1.15], [-0.03, 0.555, 0.25]],
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
// separate vertical thumbnail tied to the hook: the phone held at 80% at night + "STUCK AT / 80%?"
window.renderThumb = () => {
  const t = 0.0; cameraAt(t); stageAt(t); labelL.visible = false; labelH.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 760);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['STUCK AT', '#F4F7FB', 300], ['80%?', AMBER, 470]].forEach(([w, col, y]) => { let S = 170; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
