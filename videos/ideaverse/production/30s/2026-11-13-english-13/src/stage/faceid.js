// faceid.js — Ideaverse production 30s english-13 #01 (English): how Face ID knows it's you in the dark — and why a photo fails.
// Engine header copied unchanged from english-09 photosearch.js (= accepted feedback-round renderer = education pilot-01 engine:
// renderer, lights, newsroom stage, materials, camera system, DOCKET rig, caption pill); overlay tail from english-12 (caption
// safe area x 100..900). New: generic mannequin busts, raycast dot clouds (THREE.Points), lock hologram, light dimming.
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
function tag(g, x, y, txt, fg, bg, size = 26) { g.save(); g.textAlign = 'left'; g.font = `700 ${size}px ${HI}`; g.letterSpacing = '2px'; const w = g.measureText(txt).width + 30; g.fillStyle = bg; rr(g, x - w, y, w, size + 20, (size + 20) / 2); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, x - w + 15, y + (size + 20) / 2 + 2); g.restore(); }
function badge(g, x, y, r, txt, bg, fg) { g.save(); g.fillStyle = bg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = fg; g.font = `800 ${Math.round(r * 1.2)}px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y + 2); g.restore(); }

// ---- helpers
function chip(g, x, y, txt, a, col, size = 26, fg = NAVY) { if (!(a > 0)) return 0; g.save(); g.globalAlpha = Math.min(1, a); g.translate(x, y); const k = 0.8 + 0.2 * Math.min(1, a); g.scale(k, k); g.font = `800 ${size}px ${HI}`; g.textAlign = 'left'; const w = g.measureText(txt).width + size * 1.1; g.fillStyle = col; rr(g, 0, -size * 0.82, w, size * 1.64, size * 0.82); g.fill(); g.fillStyle = fg; g.textBaseline = 'middle'; g.fillText(txt, size * 0.55, 2); g.restore(); return w; }
const RED = '#FF4D4D', BLUE = '#3E8EDE';
// big, brief 3D labels (canvas planes, billboarded to the camera)
function makeLabel(w, h, px = 1024) { const c = canvas(px, Math.round(px * h / w)); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: cvTex(c), transparent: true, depthWrite: false, toneMapped: false })); m.userData.c = c; m.userData.key = ''; m.visible = false; m.renderOrder = 5; scene.add(m); return m; }
function paintLabel(m, key, draw) { if (m.userData.key === key) return; m.userData.key = key; const c = m.userData.c, g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height); m.material.map.needsUpdate = true; }
function pill(g, W2, H2, txt, bg, fg, sub) { g.fillStyle = bg; g.beginPath(); g.roundRect(8, 8, W2 - 16, H2 - 16, (H2 - 16) / 2); g.fill(); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  let S = Math.round(H2 * (sub ? 0.42 : 0.56)); g.font = `800 ${S}px ${HI}`; while (g.measureText(txt).width > W2 * 0.86 && S > 10) { S -= 2; g.font = `800 ${S}px ${HI}`; }
  g.fillText(txt, W2 / 2, H2 * (sub ? 0.4 : 0.52)); if (sub) { g.font = `700 ${Math.round(H2 * 0.2)}px ${HI}`; g.globalAlpha = 0.8; g.fillText(sub, W2 / 2, H2 * 0.74); g.globalAlpha = 1; } }
function padlock(g, W2, H2, open, col, txt) { const cx = W2 / 2, cy = H2 * 0.42, s = H2 * 0.36; g.save(); g.shadowColor = col; g.shadowBlur = 30; g.strokeStyle = col; g.lineWidth = s * 0.16; g.lineCap = 'round';
  g.beginPath(); if (open) { g.arc(cx - s * 0.62, cy - s * 0.32, s * 0.36, Math.PI, 0); } else g.arc(cx, cy - s * 0.32, s * 0.36, Math.PI, 0); g.stroke(); g.fillStyle = col; g.beginPath(); g.roundRect(cx - s * 0.55, cy - s * 0.32, s * 1.1, s * 0.9, s * 0.14); g.fill(); g.restore();
  g.fillStyle = '#0E1424'; g.beginPath(); g.arc(cx, cy + s * 0.08, s * 0.12, 0, 7); g.fill(); g.fillRect(cx - s * 0.04, cy + s * 0.08, s * 0.08, s * 0.22);
  g.fillStyle = col; g.font = `800 ${Math.round(H2 * 0.15)}px ${HI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, cx, H2 * 0.88); }

// ------------------------------------------------------------------ scene objects
let docket, phone, screenCanvas, screenMesh, bust, twin, kid, tripodPhone, printCard, dots, stored, flatDots, lockL, labelL, labelT;
const PED = V(-0.42, 0, -0.15), BUST_YAW = 0.35, DIR = V(Math.sin(BUST_YAW), 0, Math.cos(BUST_YAW));
const HEAD = V(PED.x, 1.16, PED.z);
const RV = V(Math.cos(BUST_YAW), 0, -Math.sin(BUST_YAW));                          // horizontal, toward the camera's orbit side
const PHONE_AT = HEAD.clone().addScaledVector(DIR, 0.3).addScaledVector(RV, -0.08).add(V(0, -0.13, 0));   // held below and in front of the face
const PROJ = PHONE_AT.clone().add(V(0, 0.065, 0));                                  // dot projector (top of the phone)
const PH_W = 0.3, PH_H = 0.56, SC_W = 0.274, SC_H = 0.515, SW = 548, SH = 1030;
const hemi = () => scene.children.find((o) => o.isHemisphereLight);
function makeBust(scale = 1) {                                     // a generic mannequin bust (original geometry, no real person)
  const g = new THREE.Group(); const skin = M('#D6D9E0', { roughness: 0.62, metalness: 0.02 });
  const ped = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.78, 32), mats.navy)); ped.position.y = 0.39; g.add(ped);
  const add = (geo, pos, scl, rot) => { const m = sh(new THREE.Mesh(geo, skin)); m.position.set(...pos); if (scl) m.scale.set(...scl); if (rot) m.rotation.set(...rot); g.add(m); return m; };
  add(new THREE.SphereGeometry(1, 40, 24), [0, 0.88, 0], [0.24, 0.09, 0.14]);                       // shoulders
  add(new THREE.CylinderGeometry(0.052, 0.06, 0.16, 24), [0, 0.99, -0.005]);                         // neck
  add(new THREE.SphereGeometry(1, 48, 36), [0, 1.16, 0], [0.098, 0.13, 0.112]);                      // head
  add(new THREE.ConeGeometry(0.021, 0.05, 20), [0, 1.152, 0.112], null, [Math.PI / 2 + 0.25, 0, 0]); // nose
  add(new THREE.SphereGeometry(1, 24, 16), [0, 1.205, 0.088], [0.078, 0.018, 0.03]);                 // brow
  add(new THREE.SphereGeometry(1, 24, 16), [0, 1.062, 0.072], [0.046, 0.032, 0.038]);                // chin
  add(new THREE.SphereGeometry(1, 20, 12), [0, 1.098, 0.1], [0.03, 0.009, 0.012]);                   // lips
  add(new THREE.SphereGeometry(1, 16, 12), [-0.034, 1.17, 0.092], [0.02, 0.012, 0.012]);             // cheek/eye lids
  add(new THREE.SphereGeometry(1, 16, 12), [0.034, 1.17, 0.092], [0.02, 0.012, 0.012]);
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(1, 16, 12), [0.097 * s, 1.16, -0.005], [0.014, 0.03, 0.02]);   // ears
  g.scale.setScalar(scale); return g;
}
function dotTex() { const c = canvas(64, 64), g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return cvTex(c); }
function castDots(targets, nx, ny, w, h, center, seed) {           // rays from the projector through a jittered grid: the "random dot pattern"
  let s = seed; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const rc = new THREE.Raycaster(), right = V(DIR.z, 0, -DIR.x), up = V(0, 1, 0), pts = [];
  scene.updateMatrixWorld(true);
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const p = center.clone().addScaledVector(right, ((i + r()) / nx - 0.5) * w).addScaledVector(up, ((j + r()) / ny - 0.5) * h);
    rc.set(PROJ, p.clone().sub(PROJ).normalize()); const hit = rc.intersectObjects(targets, true)[0];
    if (hit) pts.push([hit.point.clone().addScaledVector(hit.face ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld) : DIR, 0.002), hit.distance]);
  }
  pts.sort((a, b) => b[0].y - a[0].y + (r() - 0.5) * 0.01);
  const pos = new Float32Array(pts.length * 3), col = new Float32Array(pts.length * 3), dist = pts.map((p) => p[1]);
  pts.forEach(([p], k) => pos.set([p.x, p.y, p.z], k * 3));
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.007, map: dotTex(), vertexColors: true, transparent: true, alphaTest: 0.2, depthWrite: false, toneMapped: false, sizeAttenuation: true });
  const P3 = new THREE.Points(geo, mat); P3.userData = { dist, dmin: Math.min(...dist), dmax: Math.max(...dist), key: '' }; P3.frustumCulled = false; scene.add(P3); return P3;
}
const CRED = new THREE.Color(RED), CNEAR = new THREE.Color('#FF8A1C'), CMID = new THREE.Color('#F2E14C'), CFAR = new THREE.Color('#2F6BFF'), CSTORE = new THREE.Color(P.mint);
function colorDots(P3, mode, k = 1) {                              // mode: 'ir' (red) · 'depth' (near amber → far blue) · 'flat' (all one depth) · 'stored' (mint)
  const key = mode + k; if (P3.userData.key === key) return; P3.userData.key = key;
  const col = P3.geometry.attributes.color, { dist, dmin, dmax } = P3.userData, c = new THREE.Color();
  for (let i = 0; i < dist.length; i++) {
    if (mode === 'stored') c.copy(CSTORE); else if (mode === 'ir') c.copy(CRED);
    else { const u = mode === 'flat' ? 0.5 : clamp((dist[i] - dmin) / Math.max(1e-6, dmax - dmin)); const d = u < 0.5 ? CNEAR.clone().lerp(CMID, u * 2) : CMID.clone().lerp(CFAR, (u - 0.5) * 2); c.copy(CRED).lerp(d, k); }
    col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true;
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
  for (const [x, y] of [[-1.25, 1.35], [1.45, 1.5]]) {                 // wall monitors: dot-grid icon only
    const mon = rbox(0.62, 0.4, 0.06, 0.03, mats.steel); mon.position.set(x, y, -2.3); scene.add(mon);
    const mc = canvas(512, 300), mg = mc.getContext('2d'); mg.fillStyle = '#0E1424'; mg.fillRect(0, 0, 512, 300);
    mg.shadowColor = P.mint; mg.shadowBlur = 12; mg.fillStyle = P.mint; for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) { const r2 = Math.hypot(i - 4, (j - 2) * 1.6); if (r2 < 4.2) { mg.beginPath(); mg.arc(156 + i * 25, 100 + j * 25, 6, 0, 7); mg.fill(); } }
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), new THREE.MeshBasicMaterial({ map: cvTex(mc), toneMapped: false })); scr.position.set(x, y, -2.265); scene.add(scr);
  }
  docket = createDocket(THREE); scene.add(docket.root);
  // the bust, its twin and a child-size bust (generic mannequins)
  bust = makeBust(1); bust.position.copy(PED); bust.rotation.y = BUST_YAW; scene.add(bust);
  twin = makeBust(1); twin.position.set(-0.86, 0, -0.32); twin.rotation.y = BUST_YAW + 0.08; twin.visible = false; scene.add(twin);
  kid = makeBust(0.84); kid.position.set(-1.24, 0, -0.42); kid.rotation.y = BUST_YAW + 0.12; kid.visible = false; scene.add(kid);
  // the phone on a stand, screen toward the face (we see its back)
  tripodPhone = new THREE.Group(); scene.add(tripodPhone);
  const tp = rbox(0.075, 0.15, 0.009, 0.01, mats.navy); tripodPhone.add(tp); const tl = new THREE.Mesh(new THREE.CircleGeometry(0.008, 16), mats.mint); tl.position.set(-0.02, 0.055, -0.006); tl.rotation.y = Math.PI; tripodPhone.add(tl);
  const pole = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 1.14, 12), mats.steel)); pole.position.y = -0.64; tripodPhone.add(pole);
  const foot = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.02, 24), mats.steel)); foot.position.y = -1.2; tripodPhone.add(foot);
  tripodPhone.position.copy(PHONE_AT); tripodPhone.rotation.y = BUST_YAW + Math.PI; tp.rotation.x = 0.25; tl.rotation.x = 0.25;
  // a flat printed photo of the same face, on a thin rod, between the phone and the face
  const pc = canvas(420, 560), pg = pc.getContext('2d'); { const gr = pg.createRadialGradient(210, 250, 20, 210, 280, 260); gr.addColorStop(0, '#E9ECF2'); gr.addColorStop(1, '#8D95A6'); pg.fillStyle = '#2A3550'; pg.fillRect(0, 0, 420, 560);
    pg.fillStyle = gr; pg.beginPath(); pg.ellipse(210, 250, 120, 160, 0, 0, 7); pg.fill(); pg.fillStyle = '#B9BFCB'; pg.beginPath(); pg.ellipse(210, 490, 190, 70, 0, Math.PI, 0); pg.fill();
    pg.fillStyle = 'rgba(60,70,90,0.35)'; pg.beginPath(); pg.moveTo(210, 220); pg.lineTo(190, 290); pg.lineTo(222, 296); pg.fill(); pg.fillRect(176, 330, 68, 7); pg.beginPath(); pg.ellipse(170, 228, 22, 8, 0, 0, 7); pg.ellipse(250, 228, 22, 8, 0, 0, 7); pg.fill(); }
  printCard = new THREE.Group(); scene.add(printCard);
  const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.28), new THREE.MeshStandardMaterial({ map: cvTex(pc), roughness: 0.8, emissive: new THREE.Color('#ffffff'), emissiveMap: cvTex(pc), emissiveIntensity: 0.25 })); pm.name = 'print'; printCard.add(pm);
  const rod = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.0, 10), mats.steel)); rod.position.y = -0.64; printCard.add(rod);
  printCard.position.copy(HEAD.clone().addScaledVector(DIR, 0.17).add(V(0, -0.01, 0))); printCard.rotation.y = BUST_YAW; printCard.visible = false;
  // dot clouds: on the face (raycast now), the stored copy, and on the flat print
  dots = castDots([bust], 64, 84, 0.3, 0.4, HEAD.clone().add(V(0, -0.03, 0)), 4242);
  stored = new THREE.Points(dots.geometry.clone(), dots.material.clone()); stored.userData = { ...dots.userData, key: '' }; stored.geometry.setAttribute('color', dots.geometry.attributes.color.clone()); stored.frustumCulled = false; scene.add(stored); colorDots(stored, 'stored');
  printCard.visible = true; flatDots = castDots([printCard.getObjectByName('print')], 48, 64, 0.22, 0.29, printCard.position.clone(), 777); printCard.visible = false;
  dots.visible = stored.visible = flatDots.visible = false;
  // DOCKET's own phone (inserts + CTA)
  phone = new THREE.Group(); scene.add(phone);
  const pb = rbox(PH_W, PH_H, 0.03, 0.04, mats.navy); phone.add(pb);
  const bezel = rbox(PH_W - 0.012, PH_H - 0.012, 0.004, 0.034, M('#070A12', { roughness: 0.3 })); bezel.position.z = 0.0145; phone.add(bezel);
  screenCanvas = canvas(SW, SH);
  screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(SC_W, SC_H), new THREE.MeshBasicMaterial({ map: cvTex(screenCanvas), toneMapped: false })); screenMesh.position.z = 0.0172; phone.add(screenMesh);
  lockL = makeLabel(0.2, 0.2, 512); labelL = makeLabel(0.5, 0.13); labelT = makeLabel(0.3, 0.08);
}

// ------------------------------------------------------------------ states (pure functions of t)
const q20 = (v) => Math.round(clamp(v) * 20) / 20;
let screenKey = '';
function darkAt(t) { return track([[-1, 1], [Hh.cut1 - 0.01, 1], [Hh.cut1, 0.55], [Hh.cut2 - 0.01, 0.55], [Hh.cut2, 0.9], [Hh.cut4 - 0.01, 0.9], [Hh.cut4, 0.55], [Hh.cut5 - 0.01, 0.55], [Hh.cut5, 0], [30.5, 0]], t); }
function sceneState(t) {
  const n = dots.geometry.attributes.position.count, nf = flatDots.geometry.attributes.position.count;
  const st = { dotsN: 0, dotsMode: 'ir', depthK: 0, stored: 0, storedOff: 1, print: 0, printUp: 0, flatN: 0, flatMode: 'ir', twin: 0, kid: 0 };
  if (t < Hh.cut1) { st.dotsN = Math.round(n * E.inOutSine(inv(Hh.sweep0[0], Hh.sweep0[1], t))); }
  else if (t < Hh.cut2) { st.print = 1; st.printUp = E.outCubic(inv(Hh.print, Hh.print + 0.5, t)); }
  else if (t < Hh.cut3) { st.dotsN = Math.round(n * E.inOutSine(inv(Hh.sweep[0], Hh.sweep[1], t))); st.dotsMode = 'depth'; st.depthK = q20(inv(Hh.depth, Hh.depth + 0.6, t));
    st.stored = t >= Hh.stored ? 1 : 0; st.storedOff = 1 - E.inOutCubic(inv(Hh.align[0], Hh.align[1], t)); }
  else if (t < Hh.cut4) { st.print = 1; st.printUp = 1; st.dotsN = 0; st.flatN = Math.round(nf * E.inOutSine(inv(Hh.flatDots[0], Hh.flatDots[1], t))); st.flatMode = 'depth'; }
  else { st.dotsN = n; st.dotsMode = 'depth'; st.depthK = 1; st.twin = E.outCubic(inv(Hh.twin, Hh.twin + 0.6, t)); st.kid = E.outCubic(inv(Hh.kid, Hh.kid + 0.6, t)); }
  return st;
}
// lock hologram + big labels: [text, colour, sub] per time window
function lockAt(t) {
  if (t < Hh.unlock) return t > 0.25 ? ['lock', RED, 'LOCKED'] : null;
  if (t < Hh.cut1) return ['open', P.mint, 'UNLOCKED'];
  if (t < Hh.deny) return t >= Hh.print + 0.3 ? ['lock', RED, 'LOCKED'] : null;
  if (t < Hh.cut2) return ['lock', RED, 'NOPE'];
  if (t >= Hh.cut3 && t < Hh.cut4) return t >= Hh.fail ? ['lock', RED, 'NOPE'] : null;
  if (t >= Hh.likely && t < Hh.cut5) return ['open', AMBER, 'MAY UNLOCK'];
  return null;
}
function labelAt(t) {
  if (t >= Hh.sweep[0] && t < Hh.depth - 0.2) return ['INVISIBLE DOTS', RED, '#FFFFFF', 'drawn in red'];
  if (t >= Hh.depth && t < Hh.stored - 0.1) return ['3D SHAPE', AMBER, NAVY];
  if (t >= Hh.stored && t < Hh.match) return ['STORED AT SETUP', P.mint, NAVY];
  if (t >= Hh.match && t < Hh.cut3) return ['MATCH ✓', P.mint, NAVY];
  if (t >= Hh.side[1] && t < Hh.cut4) return ['NO DEPTH ✕', RED, '#FFFFFF'];
  return null;
}
function screenState(t) { return { code: q20(inv(Hh.code[0], Hh.code[1], t)), ok: q20(inv(Hh.ok, Hh.ok + 0.3, t)) }; }
function drawScreen(t) {
  const k = screenState(t), key = JSON.stringify(k); if (key === screenKey) return; screenKey = key; screenMesh.material.map.needsUpdate = true;
  const g = screenCanvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.letterSpacing = '0px';
  g.fillStyle = '#0B1020'; g.fillRect(0, 0, SW, SH);
  g.fillStyle = 'rgba(244,247,251,0.55)'; g.font = '700 26px "JetBrains Mono"'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('9:41', 30, 46);
  tag(g, SW - 26, 20, 'EXAMPLE', NAVY, AMBER, 24);
  g.textAlign = 'center'; g.fillStyle = '#F4F7FB'; g.font = `800 46px ${HI}`; g.fillText(k.ok > 0 ? 'Unlocked' : 'Enter Passcode', SW / 2, 150);
  const n = Math.round(6 * k.code); for (let i = 0; i < 6; i++) { g.strokeStyle = '#F4F7FB'; g.lineWidth = 4; g.beginPath(); g.arc(SW / 2 - 150 + i * 60, 230, 16, 0, 7); if (i < n) { g.fillStyle = k.ok > 0 ? P.mint : '#F4F7FB'; g.fill(); } g.stroke(); }
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];
  keys.forEach((d, i) => { if (!d) return; const x = SW / 2 + ((i % 3) - 1) * 150, y = 380 + Math.floor(i / 3) * 140; g.fillStyle = '#1B2640'; g.beginPath(); g.arc(x, y, 58, 0, 7); g.fill(); g.fillStyle = '#F4F7FB'; g.font = `700 52px ${HI}`; g.fillText(d, x, y + 2); });
  if (k.ok > 0) { g.save(); g.globalAlpha = k.ok; g.fillStyle = 'rgba(11,16,32,0.85)'; g.fillRect(0, 280, SW, 700); g.fillStyle = P.mint; g.beginPath(); g.arc(SW / 2, 560, 120, 0, 7); g.fill(); check(g, SW / 2 - 60, 504, 120, NAVY, 18);
    g.fillStyle = P.mint; g.font = `800 50px ${HI}`; g.fillText('USE A PASSCODE', SW / 2, 760); g.restore(); }
  g.textAlign = 'left';
}

// ------------------------------------------------------------------ choreography
const SIDE = { x: 1.3, z: 0.3, rotY: -58 };               // out of shot in the dark hook
const BESIDE = { x: 0.34, z: -0.12, rotY: -62 };             // beside the bust for the photo test
const HOME2 = { x: -0.06, z: 0.62, rotY: 6 };
const REST_ARMS = { aFwd: 6, aOut: 10, aBend: 12, bFwd: 6, bOut: 10, bBend: 12 };
const DK = poseKeys([
  { t: -1, p: { ...SIDE, headPitch: 2 } },
  { t: Hh.cut1 - 0.01, p: {} },
  { t: Hh.cut1, p: { ...BESIDE, headPitch: 6 } },                                                  // (cut) DOCKET watches the photo test
  { t: Hh.deny - 0.05, p: { headPitch: 6, lean: 0 } },
  { t: Hh.deny + 0.3, e: 'outBack', p: { headRoll: 10, headYaw: 14 } },                          // head tilt: "can't fool it"
  { t: Hh.cut2 - 0.01, p: {} },
  { t: Hh.cut2, p: { ...SIDE, headRoll: 0, headYaw: 0 } },
  { t: Hh.cut5 - 0.01, p: {} },
  { t: Hh.cut5, p: { ...HOME2, headPitch: 14 } },                                                 // (cut) phone insert: passcode
  { t: Hh.cta - 0.01, p: {} },
  { t: Hh.cta, p: { ...REST_ARMS, headPitch: -2 } },                                              // (cut) CTA
  { t: 27.9, e: 'outBack', p: { bFwd: 128, bOut: 16, bBend: 6 } },
  { t: 29.0, p: { bFwd: 120 } },
  { t: 29.6, e: 'inOutCubic', p: { bFwd: 40, bOut: 14, bBend: 40 } },
  { t: 30.5, p: {} },
]);
const IKW = { 0: [[-1, 0], [Hh.cut5 - 0.01, 0], [Hh.cut5, 1], [30.5, 1]], 1: [[-1, 0], [Hh.cut5 - 0.01, 0], [Hh.cut5, 1], [Hh.cta - 0.01, 1], [Hh.cta, 0], [30.5, 0]] };
const EXPR = [[-9, 'focus'], [Hh.unlock, 'happy'], [Hh.deny, 'skeptic'], [Hh.cut2, 'focus'], [Hh.match, 'happy'], [Hh.fail, 'skeptic'], [Hh.twin, 'puzzled'], [Hh.cut5, 'determined'], [Hh.ok, 'proud'], [Hh.cta, 'happy'], [29.2, 'proud']];
const BLINKS = [1.5, 4.9, 9.6, 13.0, 18.2, 21.6, 25.1, 28.3, 29.6];
let VOICE = null;
function docketAt(t) {
  const p = poseAt(DK, t);
  p.lean += 1.2 * Math.sin(t * 2.2);
  p.headRoll += 1.5 * Math.sin(t * 1.3);
  p.antenna = kick(t, Hh.unlock, 14) + kick(t, Hh.deny, 16) + kick(t, Hh.ok, 14) + 6 * Math.sin(t * 3.1);
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
function phoneSpotAt(t) {
  const p = docketAt(t);
  const AWAY = spot(p, V(0.0, -2, 0.0), 0);                          // DOCKET's own phone is out of sight until the passcode insert
  const SHOW = spot(p, V(0.0, 1.02, 0.36), -0.06);
  const LOW = spot(p, V(-0.14, 0.62, 0.25), -0.4, 0.2);
  const segs = [[-1, AWAY], [Hh.cut5 - 0.01, AWAY], [Hh.cut5, SHOW], [Hh.cta - 0.01, SHOW], [Hh.cta, LOW]];
  let i = 1; while (i < segs.length - 1 && t > segs[i][0]) i++;
  const [t0, A] = segs[i - 1], [t1, B] = segs[i], k = E.inOutCubic(inv(t0, t1, t));
  return { p: A.p.clone().lerp(B.p, k), q: A.q.clone().slerp(B.q, k) };
}
const onPhone = (x, y, z = 0.02) => phone.localToWorld(V(x, y, z));
function billboard(m, pos, s) { m.position.copy(pos); m.quaternion.copy(cam.quaternion); m.scale.setScalar(Math.max(0.01, s)); m.visible = s > 0.02; }

function stageAt(t) {
  const p = docketAt(t);
  docket.pose(p);
  // light: dark for the dot shots ("total darkness" illustration), normal for the inserts
  const d = darkAt(t); key.intensity = 38 * (1 - 0.88 * d); fill.intensity = 3 * (1 - 0.85 * d); rim.intensity = 1.4 * (1 - 0.6 * d); hemi().intensity = 0.55 * (1 - 0.85 * d); scene.environmentIntensity = 0.55 * (1 - 0.85 * d);
  const s = sceneState(t);
  dots.visible = s.dotsN > 0; dots.geometry.setDrawRange(0, s.dotsN); colorDots(dots, s.dotsMode === 'ir' ? 'ir' : 'depth', s.dotsMode === 'ir' ? 1 : s.depthK);
  stored.visible = s.stored > 0 && s.storedOff > 0.001; stored.position.copy(DIR.clone().cross(V(0, 1, 0)).multiplyScalar(-0.42 * s.storedOff)); stored.position.y = 0.02 * s.storedOff;
  printCard.visible = s.print > 0; printCard.position.copy(HEAD.clone().addScaledVector(DIR, 0.17).add(V(0, -0.01 - 0.5 * (1 - s.printUp), 0)));
  flatDots.visible = s.flatN > 0; flatDots.geometry.setDrawRange(0, s.flatN); colorDots(flatDots, 'flat', 1);
  twin.visible = s.twin > 0; twin.position.x = -0.86 - 0.6 * (1 - s.twin); kid.visible = s.kid > 0; kid.position.x = -1.24 - 0.6 * (1 - s.kid);
  scene.updateMatrixWorld(true);
  const ps = phoneSpotAt(t); phone.position.copy(ps.p); phone.quaternion.copy(ps.q);
  scene.updateMatrixWorld(true);
  const wA = track(IKW[0], t), wB = track(IKW[1], t);
  let tA = onPhone(-0.19, -0.06, 0), tB = onPhone(0.19, -0.06, 0);
  if (t >= Hh.cta) tA = onPhone(-0.12, -0.2, 0);
  solveArm(0, p, tA, wA); solveArm(1, p, tB, wB);
  scene.updateMatrixWorld(true);
  window.DBG = { dots: dots.geometry.attributes.position.count, flat: flatDots.geometry.attributes.position.count };
  // lock hologram above the stand phone (or above the twin in the payoff), big label, small honesty tag
  const lk = lockAt(t);
  if (lk) { const [shape, col, txt] = lk; paintLabel(lockL, shape + col + txt, (g, W2, H2) => padlock(g, W2, H2, shape === 'open', col, txt));
    const at = t >= Hh.cut4 ? twin.position.clone().add(V(0.22, 1.33, 0.22)) : HEAD.clone().addScaledVector(RV, 0.185).add(V(0, -0.08, 0.04));
    const shake = (txt === 'NOPE') ? 0.012 * Math.sin(t * 50) * Math.exp(-((t - (t < Hh.cut3 ? Hh.deny : Hh.fail)) * 4)) : 0;
    billboard(lockL, at.add(V(shake, 0, 0)), t >= Hh.cut4 ? 1.0 : t >= Hh.cut1 && t < Hh.cut2 ? 1.1 : 0.7); } else lockL.visible = false;
  const lb = labelAt(t);
  if (lb) { const [txt, bg, fg, sub] = lb; paintLabel(labelL, txt + bg, (g, W2, H2) => pill(g, W2, H2, txt, bg, fg, sub)); const fwd = V(0, 0, -1).applyQuaternion(cam.quaternion), upv = V(0, 1, 0).applyQuaternion(cam.quaternion); billboard(labelL, cam.position.clone().addScaledVector(fwd, 0.5).addScaledVector(upv, -0.085), 0.24); }   // fixed lower-middle of the frame (y ≈ 1350 px)
  else labelL.visible = false;
  labelT.visible = false;
  const ex = exprAt(t);
  docket.face(ex, { talk: talkAt(t), blink: BLINKS.reduce((a, b) => a + (t >= b && t < b + 0.14 ? Math.sin(((t - b) / 0.14) * Math.PI) : 0), 0), t, look: ex === 'focus' ? Math.sin(t * 4) : 0 });
  drawScreen(t);
}

// ------------------------------------------------------------------ camera (fov 44, eased keyframes, pilot system; near-duplicate keys = cuts)
const INS = [[-0.03, 1.15, 2.02], [-0.03, 1.12, 0.95]];
const PF = (() => { const v = HEAD.clone().addScaledVector(DIR, 0.09); return [v.x, 1.1, v.z]; })();   // between the print and the face (side view)
const orbitPos = (deg, r, y) => { const a = BUST_YAW + deg * D2R; return [HEAD.x + Math.sin(a) * r, y, HEAD.z + Math.cos(a) * r]; };
const CAM = [
  [0.0, orbitPos(32, 1.05, 1.2), [HEAD.x + 0.06, 1.07, HEAD.z]], [Hh.cut1 - 0.01, orbitPos(30, 0.88, 1.19), [HEAD.x + 0.06, 1.08, HEAD.z]],
  [Hh.cut1, [0.42, 1.22, 1.62], [-0.14, 1.03, 0.0]], [Hh.cut2 - 0.01, [0.38, 1.21, 1.52], [-0.14, 1.03, 0.0]],
  [Hh.cut2, orbitPos(12, 0.62, 1.2), [HEAD.x, 1.1, HEAD.z]], [Hh.orbit[0], orbitPos(16, 0.56, 1.2), [HEAD.x, 1.1, HEAD.z]], [Hh.orbit[1], orbitPos(62, 0.58, 1.21), [HEAD.x, 1.1, HEAD.z]],
  [Hh.stored, orbitPos(30, 0.78, 1.21), [HEAD.x + 0.06, 1.1, HEAD.z]], [Hh.cut3 - 0.01, orbitPos(22, 0.74, 1.2), [HEAD.x + 0.04, 1.1, HEAD.z]],
  [Hh.cut3, orbitPos(18, 0.72, 1.2), [HEAD.x, 1.08, HEAD.z]], [Hh.side[0], orbitPos(20, 0.72, 1.2), [HEAD.x, 1.08, HEAD.z]], [Hh.side[1], orbitPos(80, 0.86, 1.18), PF], [Hh.cut4 - 0.01, orbitPos(84, 0.84, 1.18), PF],
  [Hh.cut4, [-0.34, 1.24, 2.05], [-0.76, 1.0, -0.26]], [Hh.cut5 - 0.01, [-0.38, 1.22, 1.92], [-0.76, 1.0, -0.26]],
  [Hh.cut5, ...INS], [Hh.cta - 0.01, [-0.03, 1.15, 1.92], [-0.03, 1.12, 0.95]],
  [Hh.cta, [0.1, 1.26, 2.7], [-0.12, 1.06, 0.4]], [30.0, [0.1, 1.25, 2.5], [-0.12, 1.07, 0.4]],
];
function cameraAt(t) {
  let i = 1; while (i < CAM.length - 1 && t > CAM[i][0]) i++;
  const [t0, p0, q0] = CAM[i - 1], [t1, p1, q1] = CAM[i], k = E.inOutCubic(inv(t0, t1, t));
  const pos = p0.map((v, j) => lerp(v, p1[j], k)), tgt = q0.map((v, j) => lerp(v, q1[j], k));
  const shake = kick(t, Hh.unlock, 0.004, 0.1, 40) + kick(t, Hh.deny, 0.006, 0.1, 40) + kick(t, Hh.fail, 0.005, 0.08, 40);
  cam.position.set(pos[0] + shake + 0.004 * Math.sin(t * 0.9), pos[1] + shake * 0.7 + 0.004 * Math.sin(t * 1.3), pos[2]);
  cam.lookAt(tgt[0], tgt[1], tgt[2]);
}
// separate vertical thumbnail tied to the hook: the dark face covered in depth-coloured dots + 4 large words
window.renderThumb = () => {
  const t = 10.4; cameraAt(t); stageAt(t); labelL.visible = false; renderer.render(scene, cam);
  const c = octx; c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(glCanvas, 0, 0);
  const gr = c.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, 'rgba(8,11,22,0.9)'); gr.addColorStop(1, 'rgba(8,11,22,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, 900);
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  [['DOTS YOU', '#F4F7FB', 380], ['CAN’T SEE', AMBER, 560]].forEach(([w, col, y]) => { let S = 190; c.font = `800 ${S}px ${HI}`; while (c.measureText(w).width > 780) { S -= 4; c.font = `800 ${S}px ${HI}`; } c.lineWidth = 24; c.strokeStyle = '#080B16'; c.strokeText(w, 500, y); c.fillStyle = col; c.fillText(w, 500, y); });
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
