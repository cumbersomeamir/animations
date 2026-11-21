// greenwave.js — Ideaverse production 30s english-23 #01 (English): Google's Project Green Light — anonymous Maps driving trends
// show where cars keep stopping; engineers accept timing suggestions (more green, a green wave); one measured Boston pilot crossing.
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine);
// overlay tail from english-12. New: a tiny city diorama (avenue, three signals, deterministic traffic), trend dots + heat, result card, engineer/report phone screens.
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

// ------------------------------------------------------------------ the tiny city (original; an avenue with three signalised crossings)
const CORAL = '#FF7A45', GREY = '#9AA6BF', RED2 = '#FF5A5A', GO = '#4DFF88';
function mulberry(a) { return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const ZC = [0.25, -0.35, -0.95];                 // crossing centres (cars drive toward −z)
const STOP = ZC.map((z) => z + 0.13);            // stop lines
const LANES = [-0.06, 0.06], V0 = 0.3, CAR_L = 0.085, GAP = 0.04, SPAWN_Z = 1.1, END_Z = -1.8;
const CYC = 4, GRN = 2, AMB = 0.35;
// signal offsets (s): hook = green wave · trends = old timing (all at once) · from Hh.wave = more green at crossing 2 + a wave
function offsets(t) { if (t < Hh.cut1) return [0, 2, 4]; if (t < Hh.wave) return [2, 2, 2]; return [-1, 1, 3]; }
function lightState(i, t) { const o = offsets(t)[i], p = (((t - o) % CYC) + CYC) % CYC; return p < GRN - AMB ? 'G' : p < GRN ? 'A' : 'R'; }
// deterministic traffic: simple car-following + stop lines; recorded once per frame
let SIM = null;
function simulate() {
  const r = mulberry(23), cars = [], out = []; let id = 0;
  const spawns = []; for (const [li] of LANES.entries()) for (let t = -12 + li * 0.45; t < 31; t += 0.85 + 0.25 * r()) spawns.push([t, li]);
  spawns.sort((a, b) => a[0] - b[0]); let si = 0;
  const dt = 1 / 120, t0 = -12;
  for (let n = 0, t = t0; t < 30.05; n++, t = t0 + n * dt) {
    while (si < spawns.length && spawns[si][0] <= t) { const li = spawns[si][1]; const last = cars.filter((c) => c.lane === li).reduce((m, c) => Math.max(m, c.z), -9); if (last < SPAWN_Z - CAR_L - GAP - 0.02) cars.push({ id: id++, lane: li, z: SPAWN_Z, v: V0, col: r() }); si++; }
    for (const c of cars) {
      let vt = V0;
      const lead = cars.filter((d) => d.lane === c.lane && d.z < c.z).reduce((m, d) => (m && m.z > d.z ? m : d), null);
      if (lead) { const gap = c.z - lead.z - CAR_L; vt = Math.min(vt, Math.max(0, (gap - GAP) / 0.35)); }
      for (let i = 0; i < 3; i++) { const d = c.z - CAR_L / 2 - STOP[i]; if (d < -0.002 || d > 0.5) continue; const s = lightState(i, t); if (s === 'G' || (s === 'A' && d < 0.05)) continue; vt = Math.min(vt, Math.max(0, (d - 0.004) / 0.3)); }
      c.v += clamp(vt - c.v, -1.4 * dt, 0.7 * dt); c.z -= c.v * dt;
    }
    for (let k = cars.length - 1; k >= 0; k--) if (cars[k].z < END_Z) cars.splice(k, 1);
    if (n >= -t0 * 120 && (n + t0 * 120) % 4 === 0) out.push(cars.map((c) => [c.id, c.lane, c.z]));   // one record per video frame
  }
  return out;
}
const carsAt = (t) => SIM[clamp(Math.round(t * FPS), 0, SIM.length - 1)];

// ------------------------------------------------------------------ scene objects
let docket, board, cardCanvas, cardMesh, phone, screenCanvas, screenMesh, labelL, labelH, city, carMeshes = [], lamps = [], stopBars = [], glows = [], band, heat = [], dots, dotsAll, plusTag;
const BOARD_POS = V(-0.64, 0, -0.32), BOARD_YAW = 0.34;
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
const NW = 600, NH = 800, CS = 2;
const CAR_COLS = [CORAL, AMBER, P.mint, '#F4F7FB', LINK, '#C9A7FF'];
function windowsTexture() {                                           // base map (facade + dark windows) + emissive map (lit windows only)
  const c = canvas(64, 128), g = c.getContext('2d'), e = canvas(64, 128), ge = e.getContext('2d'), r = mulberry(7);
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 128); ge.fillStyle = '#000000'; ge.fillRect(0, 0, 64, 128);
  for (let y = 8; y < 124; y += 14) for (let x = 6; x < 60; x += 14) { const lit = r() < 0.4; g.fillStyle = lit ? '#FFD98A' : '#1B2333'; g.fillRect(x, y, 8, 8); if (lit) { ge.fillStyle = '#FFD98A'; ge.fillRect(x, y, 8, 8); } }
  const t = cvTex(c), te = cvTex(e); for (const x of [t, te]) x.wrapS = x.wrapT = THREE.RepeatWrapping; return [t, te];
}
function buildCity() {
  city = new THREE.Group(); scene.add(city);
  // ground: sidewalks, the avenue, three cross streets, lane dashes (one canvas)
  const GW = 1.6, GD = 3.2, GZ = -0.3, px = 400;
  const gc = canvas(GW * px, GD * px), g = gc.getContext('2d'), X = (x) => (x + GW / 2) * px, Zp = (z) => (GZ + GD / 2 - z) * px;
  g.fillStyle = '#2A3550'; g.fillRect(0, 0, gc.width, gc.height);
  g.fillStyle = '#141B2D'; g.fillRect(X(-0.14), 0, 0.28 * px, gc.height);
  for (const z of ZC) g.fillRect(0, Zp(z + 0.1), gc.width, 0.2 * px);
  g.fillStyle = 'rgba(244,247,251,0.55)';
  for (let z = 1.5; z > -1.9; z -= 0.09) { if (ZC.some((c) => Math.abs(z - c) < 0.13)) continue; g.fillRect(X(-0.004), Zp(z), 0.008 * px, 0.045 * px); }
  for (const z of ZC) for (let x = -0.12; x < 0.13; x += 0.04) g.fillRect(X(x), Zp(z + 0.115), 0.022 * px, 0.035 * px);   // zebra after each stop line
  const gt = cvTex(gc); const ground = new THREE.Mesh(new THREE.PlaneGeometry(GW, GD), new THREE.MeshStandardMaterial({ map: gt, roughness: 0.85 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0.003, GZ); ground.receiveShadow = true; city.add(ground);
  // buildings (low near the camera, taller far away), lit windows
  const wt = windowsTexture(), r = mulberry(11);
  const blocks = [[0.4, 1.3], [-0.2, 0.12], [-0.8, -0.48], [-1.75, -1.08]];
  const cols = ['#3A4A72', '#2E3B5E', '#4A5B86', '#8C9BB8', '#34466E'];
  blocks.forEach(([z0, z1], bi) => {
    for (const s of [-1, 1]) {
      let z = z1 - 0.02;
      while (z - 0.12 > z0) {
        const d = 0.12 + 0.08 * r(), w = 0.14 + 0.08 * r(), h = (bi === 0 ? 0.05 + 0.06 * r() : 0.1 + 0.26 * r()), x = s * (0.2 + w / 2 + 0.02 * r());
        const rep = [Math.max(1, Math.round(w / 0.07)), Math.max(1, Math.round(h / 0.09))], tex = wt[0].clone(), tee = wt[1].clone(); for (const x of [tex, tee]) { x.needsUpdate = true; x.repeat.set(...rep); }
        const m = new THREE.MeshStandardMaterial({ color: cols[Math.floor(r() * cols.length)], map: tex, emissiveMap: tee, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.9, roughness: 0.7 });
        const b = rbox(w, h, d, 0.008, m); b.position.set(x, h / 2, z - d / 2); city.add(b); z -= d + 0.03;
      }
    }
  });
  // signals: pole + head with three lamps facing the cars, a coloured stop bar, a soft glow
  ZC.forEach((zc, i) => {
    const pole = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.007, 0.2, 10), mats.steel)); pole.position.set(0.17, 0.1, STOP[i] - 0.01); city.add(pole);
    const arm = sh(new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.008, 0.008), mats.steel)); arm.position.set(0.12, 0.196, STOP[i] - 0.01); city.add(arm);
    const head = rbox(0.032, 0.085, 0.026, 0.006, mats.navy); head.position.set(0.075, 0.17, STOP[i] - 0.01); city.add(head);
    const L = ['#FF4D4D', '#FFC24B', GO].map((col, k) => { const m = new THREE.MeshStandardMaterial({ color: '#1a1f2c', emissive: new THREE.Color(col), emissiveIntensity: 0, roughness: 0.3 }); const s = new THREE.Mesh(new THREE.SphereGeometry(0.0095, 16, 12), m); s.position.set(0.075, 0.195 - k * 0.025, STOP[i] + 0.004); city.add(s); return m; });
    lamps.push(L);
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.014), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, toneMapped: false })); bar.rotation.x = -Math.PI / 2; bar.position.set(0, 0.005, STOP[i]); city.add(bar); stopBars.push(bar);
    const gl = new THREE.Mesh(new THREE.CircleGeometry(0.014, 24), glowMat('#ffffff')); gl.position.set(0.075, 0.17, STOP[i] + 0.02); city.add(gl); glows.push(gl);
    // the stop "heat" at each crossing (driving trends), drawn on the road
    const hc = canvas(256, 256), hg = hc.getContext('2d'), gr = hg.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, 'rgba(255,90,90,0.85)'); gr.addColorStop(1, 'rgba(255,90,90,0)'); hg.fillStyle = gr; hg.fillRect(0, 0, 256, 256);
    const hm = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: cvTex(hc), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })); hm.rotation.x = -Math.PI / 2; hm.position.set(0, 0.006, STOP[i] + 0.16); city.add(hm); heat.push(hm);
  });
  // cars
  for (let k = 0; k < 48; k++) {
    const grp = new THREE.Group(); const body = rbox(0.05, 0.026, CAR_L, 0.01, M(CAR_COLS[k % CAR_COLS.length], { roughness: 0.35, metalness: 0.2 })); body.position.y = 0.02; grp.add(body);
    const cab = rbox(0.042, 0.02, 0.042, 0.008, M('#10162A', { roughness: 0.2, metalness: 0.4 })); cab.position.set(0, 0.04, 0.008); grp.add(cab);
    for (const s of [-1, 1]) { const tl = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.007, 0.004), new THREE.MeshBasicMaterial({ color: '#FF3B3B', toneMapped: false })); tl.position.set(s * 0.017, 0.024, CAR_L / 2 + 0.001); grp.add(tl); }
    grp.visible = false; city.add(grp); carMeshes.push(grp);
  }
  // the green wave: a soft band on the avenue that travels with the released cars
  const bc = canvas(64, 256), bgc = bc.getContext('2d'), bgr = bgc.createLinearGradient(0, 0, 0, 256); bgr.addColorStop(0, 'rgba(77,255,136,0)'); bgr.addColorStop(0.5, 'rgba(77,255,136,0.55)'); bgr.addColorStop(1, 'rgba(77,255,136,0)'); bgc.fillStyle = bgr; bgc.fillRect(0, 0, 64, 256);
  band = []; for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.6), new THREE.MeshBasicMaterial({ map: cvTex(bc), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })); m.rotation.x = -Math.PI / 2; m.position.y = 0.0065; city.add(m); band.push(m); }
  // stop dots: where past trips stopped (anonymous, aggregated; illustrative counts) — most at crossing 2
  const rr2 = mulberry(5), pts = []; [14, 46, 26].forEach((n, i) => { for (let k = 0; k < n; k++) pts.push([LANES[k % 2] + (rr2() - 0.5) * 0.05, 0.01, STOP[i] + 0.03 + rr2() * 0.3 * (0.4 + 0.6 * rr2()), rr2()]); });
  dotsAll = pts.sort((a, b) => a[3] - b[3]);
  dots = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: RED2, size: 0.016, sizeAttenuation: true, transparent: true, opacity: 0.95, depthWrite: false, toneMapped: false })); dots.frustumCulled = false; city.add(dots);
  plusTag = makeLabel(0.16, 0.07, 512);
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: a traffic-light icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.strokeStyle = P.mint; mg.lineWidth = 10; rr(mg, 216, 50, 80, 200, 20); mg.stroke(); mg.shadowColor = P.mint; mg.shadowBlur = 14; mg.fillStyle = P.mint; mg.beginPath(); mg.arc(256, 200, 22, 0, 7); mg.fill();
    mg.fillStyle = 'rgba(108,218,126,0.3)'; for (const y of [100, 150]) { mg.beginPath(); mg.arc(256, y, 22, 0, 7); mg.fill(); }
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  buildCity(); SIM = simulate();
  // easel + card
  board = new THREE.Group(); board.position.copy(BOARD_POS); board.rotation.y = BOARD_YAW; scene.add(board);
  for (const s of [-1, 1]) { const leg = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 1.5, 12), mats.steel)); leg.position.set(0.26 * s, 0.72, -0.06); leg.rotation.z = -0.06 * s; board.add(leg); }
  const back = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 1.4, 12), mats.steel)); back.position.set(0, 0.68, -0.32); back.rotation.x = 0.26; board.add(back);
  const ledge = rbox(0.7, 0.04, 0.1, 0.01, mats.navy); ledge.position.set(0, 0.58, 0.0); board.add(ledge);
  const frame = rbox(0.66, 0.86, 0.04, 0.02, mats.shell); frame.position.set(0, 1.0, -0.025); board.add(frame);
  cardCanvas = canvas(NW * CS, NH * CS);
  cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ map: cvTex(cardCanvas), toneMapped: false, side: THREE.DoubleSide })); cardMesh.position.set(0, 1.0, 0.004); board.add(cardMesh);
  // DOCKET's phone (illustrative screens; not any real app's UI)
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

// ---- the card: the measured Boston result, with its scope (card y 500–600 is the label lane; y > 610 stays empty)
let cardKey = '';
function cardState(t) { return { p: q20(inv(Hh.pilot, Hh.pilot + 0.3, t)), n: Math.round(33 * E.outCubic(inv(Hh.num[0], Hh.num[1], t))), b: q20(E.inOutCubic(inv(Hh.bar[0], Hh.bar[1], t))), s: q20(inv(Hh.src, Hh.src + 0.3, t)) }; }
function drawCard(g, s) {
  bg(g, NW, NH, '#0E1424');
  g.textBaseline = 'middle';
  chip(g, 40, 56, 'BOSTON PILOT', Math.max(0.35, s.p), AMBER, 28);
  g.fillStyle = 'rgba(244,247,251,0.85)'; g.font = `700 26px ${HI}`; g.textAlign = 'left'; g.fillText('one crossing (Atlantic Ave & Richmond St)', 40, 112);
  g.fillStyle = s.n > 0 ? P.mint : 'rgba(244,247,251,0.35)'; g.font = `800 150px ${HI}`; g.textAlign = 'center'; g.fillText(s.n > 0 ? `−${s.n}%` : '?', NW / 2, 222);
  g.fillStyle = '#F4F7FB'; g.font = `800 34px ${HI}`; g.fillText('unnecessary stops', NW / 2, 314);
  // before / after bars
  g.textAlign = 'left'; g.font = `800 24px ${HI}`;
  g.fillStyle = 'rgba(244,247,251,0.7)'; g.fillText('BEFORE', 40, 366); g.fillText('AFTER', 40, 424);
  g.fillStyle = RED2; rr(g, 160, 350, 390, 32, 10); g.fill();
  if (s.b > 0) { g.fillStyle = P.mint; rr(g, 160, 408, Math.max(20, 390 * 0.67 * s.b), 32, 10); g.fill(); }
  if (s.s > 0) { g.save(); g.globalAlpha = s.s; g.fillStyle = 'rgba(244,247,251,0.65)'; g.font = `700 21px ${HI}`; g.textAlign = 'left'; g.fillText('Source: City of Boston, May 2025 (evaluated with INRIX)', 40, 478); g.restore(); }
}
function updateCard(t) {
  const s = cardState(t), k = JSON.stringify(s); if (k === cardKey) return; cardKey = k;
  const g = cardCanvas.getContext('2d'); g.setTransform(CS, 0, 0, CS, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  drawCard(g, s); cardMesh.material.map.needsUpdate = true;
}
// ---- DOCKET's phone: the engineer's suggestion (accept), then a resident's report of a badly timed light
let screenKey = '';
function screenState(t) {
  if (t < Hh.cut5) return { m: 'rec', a: q20(inv(Hh.rec, Hh.rec + 0.3, t)), tap: t >= Hh.tap && t < Hh.tap + 0.25 ? 1 : 0, ok: t >= Hh.tap + 0.12 ? 1 : 0 };
  return { m: 'rep', f: q20(inv(Hh.form, Hh.form + 0.3, t)), tap: t >= Hh.send && t < Hh.send + 0.25 ? 1 : 0, ok: t >= Hh.sent ? 1 : 0 };
}
function miniStreet(g, x, y, w, worst) {                              // three crossings on a line; the worst ringed in red
  g.fillStyle = '#2A3550'; rr(g, x, y - 10, w, 20, 10); g.fill();
  for (let i = 0; i < 3; i++) { const cx = x + w * (0.2 + 0.3 * i); g.fillStyle = '#F4F7FB'; g.beginPath(); g.arc(cx, y, 12, 0, 7); g.fill(); if (i === worst) { g.strokeStyle = RED2; g.lineWidth = 6; g.beginPath(); g.arc(cx, y, 26, 0, 7); g.stroke(); } }
}
function drawScreen(t) {
  const s = screenState(t), key = JSON.stringify(s); if (key === screenKey) return; screenKey = key;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px'; bg(g, SW, SH, '#0E1424');
  g.textAlign = 'left'; g.textBaseline = 'middle';
  if (s.m === 'rec') {
    g.fillStyle = '#F4F7FB'; g.font = `800 44px ${HI}`; g.fillText('Signal timing', 34, 120);
    g.fillStyle = 'rgba(244,247,251,0.7)'; g.font = `700 28px ${HI}`; g.fillText('City engineer view', 34, 170);
    g.save(); g.globalAlpha = s.a;
    g.fillStyle = '#16203A'; rr(g, 30, 220, SW - 60, 520, 26); g.fill();
    miniStreet(g, 60, 300, SW - 120, 1);
    g.fillStyle = '#F4F7FB'; g.font = `800 36px ${HI}`; g.fillText('Crossing 2', 60, 390);
    g.fillStyle = RED2; g.font = `700 28px ${HI}`; g.fillText('Most stops on this street', 60, 438);
    g.fillStyle = 'rgba(244,247,251,0.8)'; g.font = `700 28px ${HI}`; g.fillText('Suggestion:', 60, 512);
    g.fillStyle = P.mint; g.font = `800 40px ${HI}`; g.fillText('+6 s green', 60, 562);
    g.fillStyle = 'rgba(244,247,251,0.8)'; g.font = `700 26px ${HI}`; g.fillText('+ green wave with its neighbours', 60, 612);
    if (!s.ok) { g.fillStyle = P.mint; rr(g, 60, 650, 200, 70, 35); g.fill(); g.fillStyle = NAVY; g.font = `800 30px ${HI}`; g.textAlign = 'center'; g.fillText('ACCEPT', 160, 686); g.strokeStyle = GREY; g.lineWidth = 4; rr(g, 290, 650, 190, 70, 35); g.stroke(); g.fillStyle = GREY; g.fillText('REJECT', 385, 686); }
    else { centreChip(g, SW / 2, 686, '✓ ACCEPTED', 1, P.mint, 34); }
    if (s.tap) { g.fillStyle = 'rgba(244,247,251,0.5)'; g.beginPath(); g.arc(160, 686, 30, 0, 7); g.fill(); }
    g.restore();
  } else {
    g.fillStyle = '#F4F7FB'; g.font = `800 44px ${HI}`; g.fillText('Report a problem', 34, 120);
    g.fillStyle = 'rgba(244,247,251,0.7)'; g.font = `700 28px ${HI}`; g.fillText('to your city', 34, 170);
    g.save(); g.globalAlpha = Math.max(0.35, s.f);
    g.fillStyle = '#16203A'; rr(g, 30, 220, SW - 60, 520, 26); g.fill();
    g.fillStyle = 'rgba(244,247,251,0.7)'; g.font = `700 26px ${HI}`; g.fillText('What', 60, 270);
    chip(g, 60, 320, 'Traffic light', 1, AMBER, 30);
    g.fillStyle = 'rgba(244,247,251,0.7)'; g.font = `700 26px ${HI}`; g.fillText('Problem', 60, 390);
    g.fillStyle = '#F4F7FB'; g.font = `700 30px ${HI}`; g.fillText('Timing: always red', 60, 436); g.fillText('when I arrive', 60, 474);
    g.fillStyle = 'rgba(244,247,251,0.7)'; g.font = `700 26px ${HI}`; g.fillText('Where', 60, 540); g.fillStyle = '#F4F7FB'; g.font = `700 30px ${HI}`; g.fillText('Your crossing', 60, 584);
    if (!s.ok) { g.fillStyle = P.mint; rr(g, 60, 640, SW - 180, 76, 38); g.fill(); g.fillStyle = NAVY; g.font = `800 32px ${HI}`; g.textAlign = 'center'; g.fillText('SEND', 60 + (SW - 180) / 2, 679); }
    else centreChip(g, SW / 2, 679, '✓ SENT', 1, P.mint, 36);
    if (s.tap) { g.fillStyle = 'rgba(244,247,251,0.5)'; g.beginPath(); g.arc(SW / 2 - 30, 679, 32, 0, 7); g.fill(); }
    g.restore();
  }
  g.textAlign = 'left'; tag(g, SW - 30, 30, 'EXAMPLE', NAVY, AMBER, 22);
  screenMesh.material.map.needsUpdate = true;
}

// ------------------------------------------------------------------ the city per frame: lights, cars, wave band, trends
const STATE_COL = { G: GO, A: '#FFC24B', R: '#FF4D4D' };
function cityAt(t, shot) {
  for (let i = 0; i < 3; i++) {
    const s = lightState(i, t);
    lamps[i].forEach((m, k) => { const on = (k === 0 && s === 'R') || (k === 1 && s === 'A') || (k === 2 && s === 'G'); m.emissiveIntensity = on ? 3 : 0; m.color.set(on ? STATE_COL[s] : '#1a1f2c'); });
    stopBars[i].material.color.set(STATE_COL[s]);
    glows[i].material.color.set(STATE_COL[s]); glows[i].material.opacity = 0.45; glows[i].position.y = s === 'R' ? 0.195 : s === 'A' ? 0.17 : 0.145;
  }
  const list = carsAt(t); carMeshes.forEach((m) => { m.visible = false; });
  list.forEach(([id, lane, z]) => { const m = carMeshes[id % carMeshes.length]; m.visible = true; m.position.set(LANES[lane], 0.004, z); });
  // the green wave band: the platoon released at crossing 1 travels at cruise speed
  const waveOn = shot === 'hook' ? 1 : shot === 'side' ? clamp(inv(Hh.wave + 0.3, Hh.wave + 0.9, t)) : 0;
  const o = offsets(t)[0];
  band.forEach((b, k) => { const age = (((t - o) % CYC) + CYC) % CYC + k * CYC, z = STOP[0] + 0.12 - V0 * age; b.position.z = z; b.material.opacity = waveOn * clamp((z - END_Z) / 0.3) * clamp((STOP[0] + 0.4 - z) / 0.3) * 0.9; });
  // trends (top-down shot): dots where past trips stopped, a red heat at each crossing; the worst pulses
  const tr = shot === 'top';
  dots.visible = tr;
  if (tr) { const n = Math.round(q20(inv(Hh.dots[0], Hh.dots[1], t)) * dotsAll.length); const arr = []; for (let k = 0; k < n; k++) arr.push(dotsAll[k][0], dotsAll[k][1], dotsAll[k][2]); dots.geometry.dispose(); dots.geometry = new THREE.BufferGeometry(); dots.geometry.setAttribute('position', new THREE.Float32BufferAttribute(arr.length ? arr : [0, -9, 0], 3)); }
  const hk = tr ? E.outCubic(inv(Hh.cols[0], Hh.cols[1], t)) : 0;
  [0.45, 1.0, 0.65].forEach((w, i) => { const pulse = i === 1 ? 1 + 0.25 * kick(t, Hh.worst, 1, 0.3, 10) + (t > Hh.worst ? 0.08 * Math.sin((t - Hh.worst) * 6) : 0) : 1; heat[i].material.opacity = 0.9 * hk; heat[i].scale.setScalar(Math.max(0.01, (0.45 + 0.75 * w) * hk * pulse)); });
  // "+6 s" over crossing 2 when it gets more green
  const pt = shot === 'side' ? q20(inv(Hh.wave - 0.05, Hh.wave + 0.2, t) * (1 - inv(Hh.waveLbl - 0.3, Hh.waveLbl, t))) : 0;
  if (pt > 0) { paintLabel(plusTag, 'plus', (g, W2, H2) => pill(g, W2, H2, '+6 s GREEN', GO, NAVY)); const p = V(0.0, 0.25, STOP[1] - 0.01); billboard(plusTag, p, 0.55 * pt); } else plusTag.visible = false;
}

// ------------------------------------------------------------------ choreography
const HOME2 = { x: -0.02, z: 0.42, rotY: 0 };
const HOME = { x: -0.06, z: 0.55, rotY: 6 };
const OFF = { x: 1.8, z: 0.4, rotY: 0 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...OFF, ...REST_ARMS } },                                                          // off: the city fills the hook
  { t: Hh.cut2 - 0.01, p: {} },
  { t: Hh.cut2, p: { ...HOME2, headPitch: 14 } },                                                  // (cut) the engineer's phone
  { t: Hh.tap - 0.05, p: {} },
  { t: Hh.tap + 0.3, e: 'outBack', p: { headPitch: 9, headRoll: 5 } },
  { t: Hh.cut3 - 0.01, p: {} },
  { t: Hh.cut3, p: { ...OFF, headPitch: 0, headRoll: 0 } },                                        // (cut) off for the city + card
  { t: Hh.cut5 - 0.01, p: {} },
  { t: Hh.cut5, p: { ...HOME2, headPitch: 14 } },                                                  // (cut) the report
  { t: Hh.sent - 0.05, p: {} },
  { t: Hh.sent + 0.3, e: 'outBack', p: { headPitch: 9, headRoll: -5 } },
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...HOME, ...REST_ARMS, headPitch: -2, headRoll: 0 } },                         // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const phoneOn = (t) => (t >= Hh.cut2 && t < Hh.cut3) || (t >= Hh.cut5 && t < Hh.cta);
const EXPR = [[-9, 'focus'], [Hh.tap + 0.2, 'happy'], [Hh.cut5, 'skeptic'], [Hh.form, 'determined'], [Hh.sent, 'happy'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [10.8, 22.2, 25.9, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.tap, 12) + kick(t, Hh.sent, 12) + 6 * Math.sin(t * 3.1);
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
  if (t >= Hh.dots[0] + 0.5 && t < Hh.worst) return ['MAPS DRIVING TRENDS', P.mint, NAVY];
  if (t >= Hh.worst && t < Hh.cut2) return ['MOST STOPS HERE', RED2, '#FFFFFF'];
  if (t >= 11.0 && t < Hh.cut3) return ['ENGINEERS DECIDE', P.mint, NAVY];
  if (t >= Hh.waveLbl && t < Hh.cut4) return ['GREEN WAVE', P.mint, NAVY];
  if (t >= 17.6 && t < Hh.cut5) return ['ONE CROSSING, ONE PILOT', AMBER, NAVY];
  if (t >= Hh.cut5 + 0.15 && t < Hh.form) return ['RESULTS VARY', AMBER, NAVY];
  if (t >= Hh.form && t < Hh.cta) return ['REPORT A BAD LIGHT', P.mint, NAVY];
  return null;
}
const shotAt = (t) => (t < Hh.cut1 ? 'hook' : t < Hh.cut2 ? 'top' : t < Hh.cut3 ? 'phone' : t < Hh.cut4 ? 'side' : t < Hh.cut5 ? 'card' : t < Hh.cta ? 'phone' : 'cta');

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  scene.updateMatrixWorld(true);
  const on = phoneOn(t); phone.visible = on;
  if (on) { const s = spot(p, V(0.0, 0.88, 0.36), -0.04); phone.position.copy(s.p); phone.quaternion.copy(s.q); scene.updateMatrixWorld(true); }
  solveArm(0, p, on ? onPhone(-0.19, -0.06, 0) : null, on ? 1 : 0); solveArm(1, p, on ? onPhone(0.19, -0.06, 0) : null, on ? 1 : 0);
  scene.updateMatrixWorld(true);
  const shot = shotAt(t), cityShot = shot === 'hook' || shot === 'top' || shot === 'side';
  city.visible = cityShot; board.visible = shot === 'card' || shot === 'cta';
  if (cityShot) cityAt(t, shot); else plusTag.visible = false;
  if (shot === 'card') updateCard(t); if (on) drawScreen(t);
  labelH.visible = false;
  if (shot === 'hook') { paintLabel(labelH, 'hook', (g, W2, H2) => { g.fillStyle = GO; g.beginPath(); g.roundRect(8, 8, W2 - 16, H2 - 16, 60); g.fill(); g.fillStyle = NAVY; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 112px ${HI}`; g.fillText('AI THAT CHANGES', W2 / 2, H2 * 0.32); g.fillText('YOUR COMMUTE', W2 / 2, H2 * 0.71); });
    const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion); billboard(labelH, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.1), 0.26); }
  const lb = labelAt(t);
  if (lb) { const [txt, bgc, fg] = lb; paintLabel(labelL, txt + bgc, (g, W2, H2) => pill(g, W2, H2, txt, bgc, fg)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion);
    billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.095), 0.24); } else labelL.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: 0 });
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const LAB = [[-0.107, 1.13, 1.189], [-0.64, 1.13, -0.32]];
const HOOKCAM = [[0.0, 0.62, 1.35], [0.0, 0.0, -0.5]];
const TOPCAM = [[0.0, 1.45, 0.62], [0.0, 0.0, -0.3]];
const SIDECAM = [[-0.07, 0.2, 0.36], [0.1, 0.07, -1.5]];
const CLOSE = [[0.01, 0.9, 2.3], [0.01, 0.875, 0.78]];
const CAM = [
  [0.0, ...HOOKCAM], [Hh.cut1 - 0.01, [0.0, 0.56, 1.18], [0.0, 0.0, -0.55]],
  [Hh.cut1, ...TOPCAM], [Hh.cut2 - 0.01, [0.0, 1.36, 0.56], [0.0, 0.0, -0.32]],
  [Hh.cut2, ...CLOSE], [Hh.cut3 - 0.01, [0.01, 0.9, 2.2], [0.01, 0.875, 0.78]],
  [Hh.cut3, ...SIDECAM], [Hh.cut4 - 0.01, [-0.065, 0.19, 0.26], [0.1, 0.07, -1.52]],
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
// separate vertical thumbnail tied to the hook: the green wave through the tiny city + "GREEN / WAVE"
window.renderThumb = () => {
  const t = 0.0; cameraAt(t); stageAt(t); labelL.visible = false; labelH.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 760);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['GREEN', GO, 300], ['WAVE', '#F4F7FB', 455]].forEach(([w, col, y]) => { let S = 170; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 22; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
