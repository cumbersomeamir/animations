// Mello 30 s feedback-01: "A thought is not automatically a fact".
// Style recipe "Thoughts in a Quiet Room": sparse clean 3D miniature, one abstract faceless figure,
// soft contact shadows, white/pale-gray stage, Mello lavender (#D9BCF5, sampled from the app icon)
// only as the thought-frame highlight. Deterministic: window.renderAt(t) draws the frame at time t.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const W = 1080, H = 1920;
const TL = Object.fromEntries((await (await fetch('../generated/timeline.json')).json()).lines.map(l => [l.id, l]));

// ------------------------------------------------------------------ timing helpers
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const remap = (t, a, b) => (b === a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));
const sm = x => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };     // smootherstep
const eio = x => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const eout = x => 1 - Math.pow(1 - clamp(x), 3);
const ein = x => Math.pow(clamp(x), 2.2);
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const vl = (a, b, t) => a.clone().lerp(b, t);
// keyframe track: [[t, value(number|Vector3)], ...] with smootherstep between keys
function track(t, keys, ease = sm) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1, ez] = keys[i];
      const x = (ez || ease)(remap(t, t0, t1));
      return v0.isVector3 ? vl(v0, v1, x) : lerp(v0, v1, x);
    }
  }
  return keys[keys.length - 1][1];
}

// ------------------------------------------------------------------ shot list (5 distinct shots)
const S = { s1: 0.0, s2: 3.8, s3: 9.7, s4: 18.6, s5: 24.3, end: 30.0 };
const tTry = TL.try.start, tNotice = TL.notice.start, tThought2 = TL.thought2.start;
const tStill = TL.still.start, tObsSplit = (TL.observe.pauses.at(-1) || [13.0])[0];
const tName = TL.name.start, tArgue = TL.argue.start, tAction = TL.action.start;
const tActSplit = (TL.action.pauses[0] || [21.6])[1], tCta = TL.cta.start;
const T = {
  land: 0.38,                         // thought card lands
  pulse1: TL.thought.start,           // "I'll mess this up."
  tabIn: tNotice - 0.25, typeA: tNotice, typeB: TL.notice.end - 0.05,
  pulse2: tThought2,
  clearA: TL.thought2.end - 0.35, clearB: TL.thought2.end + 0.65,   // solid -> transparent frame
  moveA: TL.thought2.end + 0.45, moveB: S.s3 + 1.0,                 // frame shifts beside the person
  lookBack: tObsSplit + 0.1,          // "instead of treating it as a prediction" -> attention to task
  glow1: tName + 0.4,
  glance: tAction, glanceBack: tActSplit + 0.05,
  placeA: tActSplit + 0.2, contact: TL.action.end - 0.75,
  openA: TL.action.end - 0.25, openB: TL.action.end + 0.4,
  pencilA: S.s5 + 0.35, writeA: S.s5 + 1.3,
  lockA: tCta - 0.2,
};
window.__T = T; window.__S = S;

// ------------------------------------------------------------------ renderer / scene
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const STAGE = '#F5F4F7';
scene.background = new THREE.Color(STAGE);
const camera = new THREE.PerspectiveCamera(30, W / H, 0.05, 80);

const hemi = new THREE.HemisphereLight('#ffffff', '#e4dfda', 2.0);
scene.add(hemi);
const key = new THREE.DirectionalLight('#fff6ec', 1.9);
key.position.set(2.2, 4.8, 3.0);
key.target.position.set(0, 0.6, 0.2);
const LIGHT_DIR = key.target.position.clone().sub(key.position).normalize();
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -4.2; key.shadow.camera.right = 4.2;
key.shadow.camera.top = 4.2; key.shadow.camera.bottom = -4.2;
key.shadow.camera.near = 0.5; key.shadow.camera.far = 14;
key.shadow.radius = 9; key.shadow.blurSamples = 16; key.shadow.bias = -0.0004;
scene.add(key, key.target);
const fill = new THREE.DirectionalLight('#eef0ff', 0.45);
fill.position.set(3.0, 1.6, 1.0);
scene.add(fill);
const front = new THREE.DirectionalLight('#ffffff', 0.9);   // lifts the back wall to an airy near-white
front.position.set(0.3, 1.2, 4.0);
scene.add(front);

const std = (c, r = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: 0, dithering: true, ...extra });
const M = {
  stage: std('#F7F6F8', 0.95), rug: std('#ECE9E5', 1.0), desk: std('#E7D9C6', 0.72), leg: std('#D6C7B2', 0.7),
  stool: std('#FBFAF8', 0.6), fig: std('#7E7A9C', 0.8), hair: std('#55507A', 0.88),
  cover: std('#D6A452', 0.7), pages: std('#FBF8F0', 0.92), mug: std('#FFFFFF', 0.45), pencil: std('#F1C76A', 0.6),
  lead: std('#3A3550', 0.6), lamp: std('#FAFAF8', 0.5), pot: std('#ECE7E1', 0.85), leaf: std('#A7BBA5', 0.85),
  mull: std('#E3E0E7', 0.8),
  slab: std('#1C1733', 0.55, { transparent: true }),
  rim: std('#D9BCF5', 0.42, { transparent: true, emissive: new THREE.Color('#D9BCF5'), emissiveIntensity: 0.12 }),
  tab: std('#D9BCF5', 0.5, { transparent: true }),
};

function mesh(geo, mat, cast = true, recv = true) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = recv; return m;
}

// ---------------------------------------------------------------- stage: floor sweeping into a back wall
function sweepGeometry() {
  const R = 1.7, zWall = -2.7, pts = [];
  for (let i = 0; i <= 24; i++) pts.push([0, lerp(14, zWall + R, i / 24)]);
  for (let i = 1; i <= 24; i++) { const a = (i / 24) * Math.PI / 2; pts.push([R - R * Math.cos(a), zWall + R - R * Math.sin(a)]); }
  for (let i = 1; i <= 16; i++) pts.push([R + (12 - R) * (i / 16), zWall]);
  const xs = 2, X0 = -16, X1 = 16, pos = [], nrm = [], idx = [];
  for (let i = 0; i < pts.length; i++) {
    const [y, z] = pts[i];
    const [yp, zp] = pts[Math.max(0, i - 1)], [yn, zn] = pts[Math.min(pts.length - 1, i + 1)];
    const ty = yn - yp, tz = zn - zp, l = Math.hypot(ty, tz);
    const ny = -tz / l, nz = ty / l;            // normal pointing up / toward +z
    for (let j = 0; j < xs; j++) {
      pos.push(j ? X1 : X0, y, z); nrm.push(0, ny < 0 ? -ny : ny, ny < 0 ? -nz : nz);
    }
  }
  for (let i = 0; i < pts.length - 1; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, b, c, b, d, c);   // counter-clockwise seen from above / from the front
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setIndex(idx);
  return g;
}
const sweep = mesh(sweepGeometry(), M.stage, false, true);
scene.add(sweep);

// soft contact-shadow blobs (in addition to the VSM key shadow)
const blobTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  for (let i = 0; i <= 10; i++) { const x = i / 10; gr.addColorStop(x, `rgba(34,28,56,${Math.exp(-4.2 * x * x) * (1 - x)})`); }
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
function blob(w, d, op, y = 0.002) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity: op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.renderOrder = 1; scene.add(m); return m;
}

// rug, window, plant
const rug = mesh(new RoundedBoxGeometry(2.3, 0.012, 1.9, 2, 0.006), M.rug, false, true);
rug.position.set(0, 0.006, 0.25); scene.add(rug);
const plant = new THREE.Group();
const pot = mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.32, 40), M.pot); pot.position.y = 0.16; plant.add(pot);
const leafGeo = new THREE.SphereGeometry(0.1, 24, 16);
[[0, 0.55, 0, 0, 0.9], [0.09, 0.5, 0.03, -0.5, 0.75], [-0.1, 0.48, -0.02, 0.55, 0.8], [0.02, 0.47, 0.1, -0.2, 0.7], [-0.03, 0.5, -0.1, 0.3, 0.75]]
  .forEach(([x, y, z, rz, s]) => { const l = mesh(leafGeo, M.leaf); l.scale.set(0.45 * s, 1.6 * s, 0.3 * s); l.position.set(x, y, z); l.rotation.z = rz; plant.add(l); });
plant.position.set(-1.45, 0, -1.45); scene.add(plant);
blob(0.6, 0.6, 0.55).position.set(-1.45, 0.002, -1.45);

// desk
const DESK_Y = 0.76;
const deskTop = mesh(new RoundedBoxGeometry(1.3, 0.045, 0.7, 3, 0.014), M.desk);
deskTop.position.set(0, DESK_Y - 0.0225, 0); scene.add(deskTop);
for (const [x, z] of [[-0.6, -0.3], [0.6, -0.3], [-0.6, 0.3], [0.6, 0.3]]) {
  const l = mesh(new THREE.CylinderGeometry(0.018, 0.015, DESK_Y - 0.045, 16), M.leg); l.position.set(x, (DESK_Y - 0.045) / 2, z); scene.add(l);
  blob(0.16, 0.16, 0.6).position.set(x, 0.013, z);
}
blob(1.7, 1.05, 0.28).position.set(0, 0.013, 0);
// mug
const mug = new THREE.Group();
mug.add(mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.095, 32), M.mug));
const handle = mesh(new THREE.TorusGeometry(0.026, 0.008, 10, 24), M.mug); handle.position.x = 0.046; mug.add(handle);
mug.position.set(0.47, DESK_Y + 0.0475, 0.06); mug.rotation.y = -2.2; scene.add(mug);
blob(0.16, 0.16, 0.5, DESK_Y + 0.002).position.set(0.47, DESK_Y + 0.002, 0.06);
// lamp
const lamp = new THREE.Group();
lamp.add(mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.018, 32), M.lamp));
const stem = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 12), M.lamp); stem.position.set(0, 0.18, 0); lamp.add(stem);
const arm = mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.2, 12), M.lamp); arm.position.set(0.08, 0.37, 0); arm.rotation.z = -1.2; lamp.add(arm);
const shade = mesh(new THREE.ConeGeometry(0.075, 0.1, 32, 1, true), M.lamp); shade.position.set(0.17, 0.36, 0); shade.rotation.z = 0.35; lamp.add(shade);
shade.material = M.lamp.clone(); shade.material.side = THREE.DoubleSide;
const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 12), new THREE.MeshBasicMaterial({ color: '#FFE7B8', toneMapped: false }));
bulb.position.set(0.165, 0.33, 0); lamp.add(bulb);
lamp.position.set(0.5, DESK_Y + 0.009, -0.22); lamp.rotation.y = 2.6; scene.add(lamp);
blob(0.22, 0.22, 0.5, DESK_Y + 0.002).position.set(0.5, DESK_Y + 0.002, -0.22);
const lampLight = new THREE.PointLight('#ffd9a0', 0.0, 1.4, 2);
lampLight.position.set(0.36, DESK_Y + 0.32, -0.12); scene.add(lampLight);
// pencil
const pencil = new THREE.Group();
const pb = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 6), M.pencil); pencil.add(pb);
const ptip = mesh(new THREE.ConeGeometry(0.006, 0.02, 6), M.pages); ptip.position.y = 0.09; pencil.add(ptip);
const plead = mesh(new THREE.ConeGeometry(0.002, 0.007, 6), M.lead); plead.position.y = 0.1; pencil.add(plead);
scene.add(pencil);

// stool
const STOOL = V(0, 0.53, 0.7);
const seat = mesh(new THREE.CylinderGeometry(0.19, 0.18, 0.05, 40), M.stool); seat.position.copy(STOOL); scene.add(seat);
const ped = mesh(new THREE.CylinderGeometry(0.025, 0.03, STOOL.y - 0.03, 16), M.stool); ped.position.set(STOOL.x, (STOOL.y - 0.03) / 2, STOOL.z); scene.add(ped);
const base = mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.02, 32), M.stool); base.position.set(STOOL.x, 0.01, STOOL.z); scene.add(base);
blob(0.6, 0.6, 0.55).position.set(STOOL.x, 0.013, STOOL.z);

// ---------------------------------------------------------------- notebook
const NB = { w: 0.22, d: 0.3, h: 0.018 };
const notebook = new THREE.Group();
const pages = mesh(new RoundedBoxGeometry(NB.w - 0.008, NB.h - 0.006, NB.d - 0.01, 2, 0.003), M.pages); notebook.add(pages);
const back = mesh(new RoundedBoxGeometry(NB.w, 0.004, NB.d, 2, 0.0018), M.cover); back.position.y = -NB.h / 2 + 0.002; notebook.add(back);
const coverPivot = new THREE.Group(); coverPivot.position.set(-NB.w / 2, NB.h / 2 - 0.002, 0); notebook.add(coverPivot);
const cover = mesh(new RoundedBoxGeometry(NB.w, 0.004, NB.d, 2, 0.0018), M.cover); cover.position.set(NB.w / 2, 0, 0); coverPivot.add(cover);
const band = mesh(new THREE.BoxGeometry(0.006, 0.0045, NB.d + 0.002), M.lead); band.position.set(NB.w * 0.34, 0.0004, 0); cover.add(band);
// written lines that appear on the right page while writing (S5)
const ink = [];
for (let i = 0; i < 5; i++) {
  const ln = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.0045), new THREE.MeshBasicMaterial({ color: '#4A4466', transparent: true, opacity: 0.85 }));
  ln.rotation.x = -Math.PI / 2; ln.position.set(0, NB.h / 2 - 0.002 + 0.0012, -0.09 + i * 0.03); ln.scale.x = 0.0001; notebook.add(ln); ink.push(ln);
}
scene.add(notebook);
const nbBlob = blob(0.34, 0.42, 0.0, DESK_Y + 0.003);

// ---------------------------------------------------------------- the thought card / frame
function textTexture(text, { font, w, h, color = '#ffffff', size, italic = false, align = 'center', pad = 0 }) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = color; g.textBaseline = 'middle'; g.textAlign = align;
  let s = size;
  do { g.font = `${italic ? 'italic ' : ''}400 ${s}px ${font}`; s -= 2; } while (g.measureText(text).width > w - 2 * pad - 8 && s > 10);
  g.fillText(text, align === 'left' ? pad : w / 2, h * 0.54);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return { tex: t, canvas: c, g };
}
const CARD = { w: 0.66, h: 0.42, d: 0.032 };
const card = new THREE.Group();
const slab = mesh(new RoundedBoxGeometry(CARD.w, CARD.h, CARD.d, 3, 0.012), M.slab, false, false);
slab.renderOrder = 2; card.add(slab);
function frameGeometry(w, h, bw, r) {
  const rr = (s, x, y, ww, hh, rad) => {
    s.moveTo(x + rad, y); s.lineTo(x + ww - rad, y); s.quadraticCurveTo(x + ww, y, x + ww, y + rad);
    s.lineTo(x + ww, y + hh - rad); s.quadraticCurveTo(x + ww, y + hh, x + ww - rad, y + hh);
    s.lineTo(x + rad, y + hh); s.quadraticCurveTo(x, y + hh, x, y + hh - rad); s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y);
  };
  const outer = new THREE.Shape(); rr(outer, -w / 2, -h / 2, w, h, r);
  const hole = new THREE.Path(); rr(hole, -w / 2 + bw, -h / 2 + bw, w - 2 * bw, h - 2 * bw, Math.max(0.002, r - bw * 0.6));
  outer.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(outer, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 3, curveSegments: 10 });
  g.translate(0, 0, -0.015); return g;
}
const rim = mesh(frameGeometry(CARD.w + 0.012, CARD.h + 0.012, 0.03, 0.018), M.rim, false, false);
rim.renderOrder = 3; card.add(rim);
// glass sheet inside the frame once it is transparent (barely tinted lavender)
const glass = new THREE.Mesh(new THREE.PlaneGeometry(CARD.w - 0.05, CARD.h - 0.05),
  new THREE.MeshBasicMaterial({ color: '#EBDDFB', transparent: true, opacity: 0, depthWrite: false }));
glass.renderOrder = 2; card.add(glass);
const thoughtTx = textTexture('I’ll mess this up.', { font: '"Instrument Serif"', w: 1400, h: 420, size: 220, pad: 40 });
const thoughtTxt = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.18), new THREE.MeshBasicMaterial({ map: thoughtTx.tex, transparent: true, depthWrite: false, toneMapped: false }));
thoughtTxt.position.set(0, -0.025, CARD.d / 2 + 0.002); thoughtTxt.renderOrder = 4; card.add(thoughtTxt);
// tab label "I'm noticing the thought that..." (typed on)
const TAB = { w: 0.6, h: 0.082 };
const tab = new THREE.Group();
const tabBody = mesh(new RoundedBoxGeometry(TAB.w, TAB.h, 0.02, 3, 0.012), M.tab, false, false); tab.add(tabBody);
const TAB_TEXT = 'I’m noticing the thought that…';
const tabTx = textTexture(TAB_TEXT, { font: '"Instrument Serif"', w: 1600, h: 220, size: 150, italic: true, color: '#17122E', pad: 40 });
const tabTxt = new THREE.Mesh(new THREE.PlaneGeometry(TAB.w - 0.02, (TAB.w - 0.02) * 220 / 1600),
  new THREE.MeshBasicMaterial({ map: tabTx.tex, transparent: true, depthWrite: false, toneMapped: false }));
tabTxt.position.z = 0.0115; tabTxt.renderOrder = 5; tab.add(tabTxt);
tab.position.set(0, CARD.h / 2 + TAB.h / 2 + 0.012, 0); card.add(tab);
let tabChars = -1;
function setTabChars(n) {
  if (n === tabChars) return; tabChars = n;
  const { canvas: c, g } = tabTx;
  g.clearRect(0, 0, c.width, c.height);
  // keep the full-string layout fixed and reveal characters left to right
  let s = 150; g.font = `italic 400 ${s}px "Instrument Serif"`;
  while (g.measureText(TAB_TEXT).width > c.width - 88 && s > 10) { s -= 2; g.font = `italic 400 ${s}px "Instrument Serif"`; }
  const full = g.measureText(TAB_TEXT).width, x0 = (c.width - full) / 2;
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#17122E';
  g.fillText(TAB_TEXT.slice(0, n), x0, c.height * 0.54);
  tabTx.tex.needsUpdate = true;
}
scene.add(card);
function rrTexture(fill, ring) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 340;
  const g = c.getContext('2d'); g.filter = 'blur(14px)';
  g.beginPath(); g.roundRect(60, 60, 392, 220, 26);
  if (fill) { g.fillStyle = fill; g.fill(); } else { g.lineWidth = 26; g.strokeStyle = ring; g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function decal(tex) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(CARD.w * 1.3, CARD.w * 1.3 * 340 / 512 * 0.62),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 1; scene.add(m); return m;
}
const frameLight = new THREE.PointLight('#D9BCF5', 0, 2.2, 2);   // the frame's soft lavender glow
scene.add(frameLight);
const cardShadow = decal(rrTexture('rgba(28,23,51,1)'));        // the solid thought's shadow falls on the task
const frameShadow = decal(rrTexture(null, 'rgba(150,110,210,1)')); // the frame only leaves a light lavender trace

// ---------------------------------------------------------------- abstract figure (faceless, no character likeness)
const fig = new THREE.Group(); scene.add(fig);
const torso = new THREE.Group(); fig.add(torso);
const torsoMesh = mesh(new THREE.CapsuleGeometry(0.12, 0.2, 8, 28), M.fig);
torsoMesh.scale.set(1.15, 1, 0.82); torsoMesh.position.y = 0.2; torso.add(torsoMesh);
const neckG = new THREE.Group(); neckG.position.y = 0.4; torso.add(neckG);
const neck = mesh(new THREE.CylinderGeometry(0.042, 0.048, 0.1, 16), M.fig); neck.position.y = 0.03; neckG.add(neck);
const head = new THREE.Group(); head.position.y = 0.14; neckG.add(head);
const skull = mesh(new THREE.SphereGeometry(0.104, 40, 28), M.fig); skull.scale.set(0.94, 1.1, 1.0); head.add(skull);
// hair cap covers the back and top: gives the faceless head a readable facing direction
const hair = mesh(new THREE.SphereGeometry(0.109, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), M.hair);
hair.scale.set(0.95, 1.1, 1.02); hair.rotation.x = 0.7; hair.position.set(0, 0.008, 0.006); head.add(hair);
for (const sx of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(0.018, 12, 10), M.fig); e.position.set(sx * 0.097, 0, 0.01); e.scale.set(0.6, 1, 1); head.add(e); }
const jointGeo = r => new THREE.SphereGeometry(r, 20, 14);
const segGeo = new THREE.CylinderGeometry(1, 1, 1, 20, 1, true);
function makeLimb(r0, r1) {
  const m = mesh(new THREE.CylinderGeometry(r1, r0, 1, 20, 1, true), M.fig); fig.add(m); return { m, r0, r1 };
}
const Yup = V(0, 1, 0);
function setLimb(L, a, b) {
  const d = b.clone().sub(a), len = d.length();
  L.m.position.copy(a).add(b).multiplyScalar(0.5);
  L.m.quaternion.setFromUnitVectors(Yup, d.normalize());
  L.m.scale.set(1, len, 1);
}
function joint(r) { const m = mesh(jointGeo(r), M.fig); fig.add(m); return m; }
const limbs = {
  uaL: makeLimb(0.04, 0.036), faL: makeLimb(0.035, 0.031), uaR: makeLimb(0.04, 0.036), faR: makeLimb(0.035, 0.031),
  thL: makeLimb(0.058, 0.05), shL: makeLimb(0.047, 0.039), thR: makeLimb(0.058, 0.05), shR: makeLimb(0.047, 0.039),
};
const J = {
  shL: joint(0.043), elL: joint(0.036), haL: joint(0.04), shR: joint(0.043), elR: joint(0.036), haR: joint(0.04),
  hiL: joint(0.06), knL: joint(0.05), anL: joint(0.04), hiR: joint(0.06), knR: joint(0.05), anR: joint(0.04),
};
const feet = [0, 1].map(() => { const f = mesh(new RoundedBoxGeometry(0.085, 0.05, 0.16, 3, 0.022), M.fig); fig.add(f); return f; });
const footBlobs = [0, 1].map(() => blob(0.22, 0.28, 0.6));
J.haL.scale.set(1, 0.8, 1.15); J.haR.scale.set(1, 0.8, 1.15);

function ik(root, target, l1, l2, pole) {
  const d = target.clone().sub(root);
  const dist = clamp(d.length(), Math.abs(l1 - l2) + 1e-3, (l1 + l2) * 0.999);
  const dir = d.normalize();
  const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
  const p = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
  return { mid: root.clone().add(dir.clone().multiplyScalar(a)).add(p.multiplyScalar(h)), end: root.clone().add(dir.multiplyScalar(dist)) };
}

// ---------------------------------------------------------------- choreography
const PELVIS = V(0, 0.64, 0.7);
const NB_REACH = V(0.0, 0.85, 0.3), NB_HUG = V(0.0, 0.88, 0.44), NB_LAP = V(0.0, 0.845, 0.41);
const NB_HOVER = V(0.07, 0.86, 0.16), NB_DESK = V(0.14, DESK_Y + NB.h / 2 + 0.001, 0.03);
const CARD_HOME = V(0, 1.33, 0.25), CARD_SIDE = V(-0.44, 1.5, 0.3), CARD_ROT0 = 0.12, CARD_ROT1 = 0.1;

function pose(t) {
  const breath = Math.sin(t * 2 * Math.PI / 4.2);
  const P = {};
  P.lean = track(t, [[0, 0.24], [T.land, 0.24], [T.land + 0.5, 0.03, eout], [T.clearA + 0.3, 0.04], [T.clearB + 0.5, 0.12],
    [T.lookBack, 0.12], [T.lookBack + 1.0, 0.2], [S.s4, 0.2], [T.placeA, 0.24], [T.contact + 0.6, 0.22], [S.s5 + 0.6, 0.26]]);
  P.shrug = track(t, [[0, 0], [T.land, 0], [T.land + 0.35, 0.03, eout], [T.clearA + 0.2, 0.028], [T.clearB + 0.6, -0.006], [30, -0.006]]);
  P.headPitch = track(t, [[0, -0.42], [T.land, -0.42], [T.land + 0.45, -0.02, eout], [T.clearA, -0.04], [T.moveA, 0.06],
    [T.lookBack, 0.04], [T.lookBack + 0.9, -0.38], [tName + 0.6, -0.4], [S.s4, -0.45], [T.contact, -0.55], [S.s5, -0.55], [30, -0.58]]);
  P.headYaw = track(t, [[0, 0], [T.moveA, 0], [T.moveB - 0.1, 0.62], [T.lookBack, 0.6], [T.lookBack + 0.9, 0.02],
    [T.glance, 0.02], [T.glance + 0.45, 0.42], [T.glanceBack, 0.4], [T.glanceBack + 0.45, 0.0], [30, 0]]);
  P.torsoYaw = P.headYaw * 0.18;
  P.breath = breath;
  // notebook path
  let nbPos, nbRot = new THREE.Euler(0, 0, 0);
  if (t < T.placeA) {
    nbPos = track(t, [[0, NB_REACH], [T.land, NB_REACH], [T.land + 0.45, NB_HUG, eout], [T.clearB, NB_HUG], [T.clearB + 0.9, NB_LAP],
      [tName + 0.3, NB_LAP], [tName + 1.2, V(0.02, 0.875, 0.32)], [S.s4 - 0.2, V(0.05, 0.875, 0.19)], [tAction - 0.2, NB_HOVER]]);
    const tilt = track(t, [[0, -0.18], [T.land, -0.18], [T.land + 0.45, -0.95, eout], [T.clearB, -0.95], [T.clearB + 0.9, -0.55],
      [tName + 1.4, -0.35], [tAction - 0.2, -0.12]]);
    nbRot.set(tilt, 0, 0);
    nbPos = nbPos.clone().add(V(0, 0.003 * breath, 0));
  } else {
    const u = remap(t, T.placeA, T.contact);
    nbPos = vl(NB_HOVER, NB_DESK, eio(u)); nbPos.y += Math.sin(Math.PI * eio(u)) * 0.025;
    nbRot.set(lerp(-0.12, 0, eio(u)), lerp(0, -0.06, eio(u)), 0);
  }
  P.nbPos = nbPos; P.nbRot = nbRot;
  P.cover = track(t, [[T.openA, 0], [T.openB, Math.PI * 0.985, eio]]);
  return P;
}

function setNotebook(P) {
  notebook.position.copy(P.nbPos); notebook.rotation.copy(P.nbRot);
  coverPivot.rotation.z = P.cover;
  notebook.updateMatrixWorld(true);
  const h = Math.max(0, P.nbPos.y - DESK_Y);
  const onDesk = P.nbPos.z < 0.36 && P.nbPos.z > -0.36 ? 1 : 0;
  nbBlob.position.set(P.nbPos.x + 0.02, DESK_Y + 0.003, P.nbPos.z + 0.02);
  nbBlob.material.opacity = onDesk * 0.55 * clamp(1 - h / 0.14);
  const s = 1 + h * 2.2; nbBlob.scale.set(s, s, 1);
}

function placeFigure(t, P) {
  const lean = P.lean, br = P.breath;
  torso.position.copy(PELVIS);
  torso.rotation.set(-lean, P.torsoYaw, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + lean * 0.5, P.headYaw, 0, 'YXZ');
  torso.updateMatrixWorld(true);
  const shL = torso.localToWorld(V(-0.15, 0.315 + P.shrug, 0.0)), shR = torso.localToWorld(V(0.15, 0.315 + P.shrug, 0.0));
  // hands: hold the notebook, or task-specific targets
  const nbL = notebook.localToWorld(V(-NB.w / 2 - 0.012, 0.0, 0.05)), nbR = notebook.localToWorld(V(NB.w / 2 + 0.012, 0.0, 0.05));
  let hL = nbL, hR = nbR;
  if (t >= T.contact + 0.12) {
    const rel = remap(t, T.contact + 0.12, T.contact + 0.5);
    const restR = V(0.28, DESK_Y + 0.045, 0.2), restL = V(-0.12, DESK_Y + 0.045, 0.22);
    hR = vl(nbR, restR, sm(rel)); hL = vl(nbL, restL, sm(rel));
    // left hand opens the cover by its free edge
    if (t >= T.openA - 0.25) {
      const edge = coverPivot.localToWorld(V(NB.w * 0.95, 0.03, 0.05));
      const k = sm(remap(t, T.openA - 0.25, T.openA)) * (1 - sm(remap(t, T.openB, T.openB + 0.35)));
      const rest2 = notebook.localToWorld(V(-NB.w * 0.62, 0.035, 0.07));
      hL = vl(vl(restL, rest2, sm(remap(t, T.openB, T.openB + 0.35))), edge, k);
    }
    // right hand: pick up the pencil and write (S5)
    const pen0 = V(0.37, DESK_Y + 0.03, 0.17);
    const write0 = notebook.localToWorld(V(NB.w * 0.32, 0.04, 0.0));
    if (t >= T.pencilA) {
      const a = sm(remap(t, T.pencilA, T.pencilA + 0.5)), b = sm(remap(t, T.pencilA + 0.65, T.writeA));
      hR = vl(vl(restR, pen0, a), write0, b);
      if (t > T.writeA) {
        const w = t - T.writeA, row = Math.min(4, Math.floor(w / 0.85)), ph = (w % 0.85) / 0.85;
        hR = notebook.localToWorld(V(NB.w * 0.18 + 0.06 * ph + 0.004 * Math.sin(w * 31), 0.04 + 0.003 * Math.abs(Math.sin(w * 23)), -0.09 + row * 0.03 + 0.04));
      }
    }
  }
  const poleL = V(-0.8, -0.5, 0.6), poleR = V(0.8, -0.5, 0.6);
  const aL = ik(shL, hL, 0.25, 0.235, poleL), aR = ik(shR, hR, 0.25, 0.235, poleR);
  J.shL.position.copy(shL); J.shR.position.copy(shR); J.elL.position.copy(aL.mid); J.elR.position.copy(aR.mid);
  J.haL.position.copy(aL.end); J.haR.position.copy(aR.end);
  setLimb(limbs.uaL, shL, aL.mid); setLimb(limbs.faL, aL.mid, aL.end); setLimb(limbs.uaR, shR, aR.mid); setLimb(limbs.faR, aR.mid, aR.end);
  J.haL.lookAt(aL.mid); J.haR.lookAt(aR.mid);
  // legs (feet planted)
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    const hip = torso.localToWorld(V(sx * 0.085, 0.02, 0.0)); hip.y = Math.max(hip.y, 0.6);
    const ank = V(sx * 0.12, 0.075, 0.27);
    const r = ik(hip, ank, 0.4, 0.43, V(sx * 0.15, 1, -0.6));
    const [th, sh, hi, kn, an] = i === 0 ? [limbs.thL, limbs.shL, J.hiL, J.knL, J.anL] : [limbs.thR, limbs.shR, J.hiR, J.knR, J.anR];
    hi.position.copy(hip); kn.position.copy(r.mid); an.position.copy(r.end);
    setLimb(th, hip, r.mid); setLimb(sh, r.mid, r.end);
    feet[i].position.set(r.end.x, 0.028, r.end.z - 0.045); feet[i].rotation.y = sx * -0.1;
    footBlobs[i].position.set(r.end.x, 0.013, r.end.z - 0.04);
  }
  // pencil follows right hand after pickup
  const penRest = V(0.37, DESK_Y + 0.006, 0.17);
  if (t >= T.pencilA + 0.5) {
    pencil.position.copy(aR.end).add(V(-0.012, -0.02, -0.02));
    pencil.rotation.set(-0.9, 0.2, 0.55);
  } else { pencil.position.copy(penRest); pencil.rotation.set(Math.PI / 2, 0, 1.1); }
}

function setCard(t) {
  // drop + land
  let pos, rotY = CARD_ROT0, rotZ = 0, sc = 1, sy = 1;
  if (t < T.land) {
    const u = ein(remap(t, -0.2, T.land));
    pos = vl(CARD_HOME.clone().add(V(0.02, 0.06, 0)), CARD_HOME, u); rotZ = 0.08 * (1 - u); sc = lerp(0.62, 1, eout(remap(t, -0.2, T.land)));
  } else {
    pos = CARD_HOME.clone();
    const k = t - T.land;
    sy = 1 - 0.07 * Math.exp(-k * 9) * Math.cos(k * 26);
    rotZ = -0.02 * Math.exp(-k * 6) * Math.sin(k * 18);
  }
  // pulses on "I'll mess this up."
  for (const tp of [T.pulse1, T.pulse2]) sc *= 1 + 0.035 * Math.sin(Math.PI * remap(t, tp, tp + 0.55));
  // move beside the person
  const mv = eio(remap(t, T.moveA, T.moveB));
  if (mv > 0) {
    const my = eio(remap(t, T.moveA + 0.55, T.moveB + 0.2));   // rise happens after the cut, never through the captions
    pos = V(lerp(CARD_HOME.x, CARD_SIDE.x, mv), lerp(CARD_HOME.y, CARD_SIDE.y, my), lerp(CARD_HOME.z, CARD_SIDE.z, mv));
    rotY = lerp(CARD_ROT0, CARD_ROT1, mv); sc *= lerp(1, 0.96, mv);
  }
  if (t > T.moveB + 0.2) { const f = t - T.moveB - 0.2; pos.y += 0.009 * Math.sin(f * 2 * Math.PI / 5.0); rotZ += 0.008 * Math.sin(f * 2 * Math.PI / 6.3); }
  card.position.copy(pos); card.rotation.set(0, rotY, rotZ); card.scale.set(sc, sc * sy, sc);
  // solid -> transparent frame
  const c = sm(remap(t, T.clearA, T.clearB));
  const appear = sm(remap(t, -0.2, 0.12));
  M.slab.opacity = lerp(1, 0.0, c) * appear;
  slab.visible = M.slab.opacity > 0.003;
  M.slab.depthWrite = c < 0.5;
  glass.material.opacity = 0.16 * c;
  M.rim.opacity = c; rim.visible = c > 0.003; rim.scale.setScalar(lerp(0.97, 1, c));
  const glow = Math.max(Math.sin(Math.PI * remap(t, T.glow1, T.glow1 + 1.2)), Math.sin(Math.PI * remap(t, T.glance, T.glance + 1.1)));
  M.rim.emissiveIntensity = 0.12 + 0.35 * glow;
  thoughtTxt.material.color.set('#FBF6EC').lerp(new THREE.Color('#17122E'), c); thoughtTxt.material.opacity = appear;
  // tab
  const ti = eout(remap(t, T.tabIn, T.tabIn + 0.3));
  tab.visible = ti > 0.001; tab.scale.set(lerp(0.6, 1, ti), ti, 1); M.tab.opacity = ti;
  tabTxt.material.opacity = ti;
  setTabChars(Math.round(TAB_TEXT.length * remap(t, T.typeA, T.typeB)));
  // the solid thought casts a shadow on the task; it fades as the thought becomes a frame
  const k = (pos.y - DESK_Y) / -LIGHT_DIR.y, sp = pos.clone().addScaledVector(LIGHT_DIR, k);
  cardShadow.position.set(sp.x, DESK_Y + 0.004, sp.z); cardShadow.rotation.z = -rotY; cardShadow.scale.setScalar(sc);
  const kf = pos.y / -LIGHT_DIR.y, fp = pos.clone().addScaledVector(LIGHT_DIR, kf);   // the clear frame's faint trace lands on the floor
  frameShadow.position.set(fp.x, 0.005, fp.z); frameShadow.rotation.z = -rotY; frameShadow.scale.setScalar(sc * 1.15);
  const insert = t >= S.s4 && t < S.s5;
  card.visible = !insert; cardShadow.visible = frameShadow.visible = !insert;
  frameLight.position.copy(pos); frameLight.intensity = c * (0.1 + 0.8 * glow);
  cardShadow.material.opacity = 0.34 * (1 - c) * remap(t, 0.05, T.land);
  frameShadow.material.opacity = 0.26 * c * mv * (0.7 + 0.6 * glow);
}

// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]
const SHOTS = [
  // S1 rear 3/4 medium: the card lands in the figure's line of sight
  { a: S.s1, b: S.s2, k0: [V(0.02, 1.24, 0.36), 30, 13, 4.6, 26], k1: [V(0.0, 1.24, 0.34), 26, 12, 4.3, 26] },
  // S2 tight over-the-shoulder: label types on, card clears, frame slides out of the line of sight
  { a: S.s2, b: S.s3, k0: [V(0.0, 1.42, 0.3), 18, 9, 4.4, 26], k1: [V(-0.02, 1.41, 0.28), 15, 8, 4.2, 26] },
  // S3 wide, rear-left and higher: the distance between the person and the thought
  { a: S.s3, b: S.s4, k0: [V(-0.25, 1.32, 0.42), -24, 11, 5.25, 28], k1: [V(-0.27, 1.31, 0.42), -21, 9, 4.95, 28] },
  // S4 overhead insert on the desk: one notebook is placed and opened
  { a: S.s4, b: S.s5, k0: [V(0.09, 0.78, 0.04), 0, 87, 2.5, 28], k1: [V(0.1, 0.78, 0.04), 0, 88, 2.42, 28] },
  // S5 wide calm room: slow pull-back and rise
  { a: S.s5, b: S.end, k0: [V(-0.06, 1.42, 0.1), 6, 15, 6.2, 30], k1: [V(-0.06, 1.48, 0.05), 9, 18, 7.4, 30] },
];
function camFrom([tg, az, el, d, fov]) {
  const p = tg.clone().add(V(Math.sin(az * D2R) * Math.cos(el * D2R), Math.sin(el * D2R), Math.cos(az * D2R) * Math.cos(el * D2R)).multiplyScalar(d));
  return { p, tg, fov };
}
function setCamera(t) {
  const s = SHOTS.find(x => t >= x.a && t < x.b) || SHOTS[SHOTS.length - 1];
  const u = sm(remap(t, s.a, s.b)) * 0.5 + remap(t, s.a, s.b) * 0.5;
  const k = s.k0.map((v, i) => (v.isVector3 ? vl(v, s.k1[i], u) : lerp(v, s.k1[i], u)));
  const c = camFrom(k);
  camera.position.copy(c.p); camera.lookAt(c.tg);
  camera.fov = c.fov; camera.updateProjectionMatrix();
}

// screen-space layout report for QA (safe zones)
function screenBox(obj) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj, true);
  if (box.isEmpty()) return null;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i < 8; i++) {
    const v = V(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera);
    const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1].map(Math.round);
}
window.layoutReport = t => {
  renderAt(t);
  const r = { t, card: screenBox(card), head: screenBox(head), notebook: screenBox(notebook), desk: screenBox(deskTop) };
  const cb = capEl.getBoundingClientRect();
  r.caption = capEl.innerHTML && +capEl.style.opacity > 0.02 ? [cb.left, cb.top, cb.right, cb.bottom].map(Math.round) : null;
  const spans = [...capEl.querySelectorAll('.ln')].map(e => e.getBoundingClientRect());
  r.captionText = spans.length && r.caption ? [Math.min(...spans.map(b => b.left)), Math.min(...spans.map(b => b.top)), Math.max(...spans.map(b => b.right)), Math.max(...spans.map(b => b.bottom))].map(Math.round) : null;
  r.captionLines = spans.length;
  r.shot = SHOTS.findIndex(x => t >= x.a && t < x.b) + 1 || 5;
  return r;
};

// ---------------------------------------------------------------- captions (overlay, caption-safe band)
const q = s => s.replace(/'/g, '’');
const hl = s => `<span class="hl">${q(s)}</span>`;
const CAPS = [
  { a: -1, b: TL.thought.start - 0.1, size: 96, lines: ['A thought can sound', 'like a fact:'] },
  { a: TL.thought.start - 0.04, b: tTry - 0.14, size: 118, lines: [`<span class="it">“${q("I'll mess this up.")}”</span>`] },
  { a: tTry - 0.06, b: tNotice - 0.14, size: 112, lines: ['Try adding one phrase:'] },
  { a: tNotice - 0.06, b: tStill - 0.35, size: 92, lines: [hl("I'm noticing the thought that…"), `<span class="it">${q("I'll mess this up.")}</span>`], l2: tThought2 - 0.06 },
  { a: tStill - 0.06, b: TL.observe.start - 0.06, size: 108, lines: ['The thought is still there,'] },
  { a: TL.observe.start - 0.02, b: tObsSplit - 0.02, size: 96, lines: ['but now', q("you're observing it,")] },
  { a: tObsSplit + 0.04, b: tName - 0.2, size: 96, lines: ['instead of treating it', 'as a prediction.'] },
  { a: tName - 0.06, b: Math.min(tArgue - 0.2, S.s4 - 0.03), size: 96, lines: [`This is a ${hl('cognitive')}`, `${hl('defusion')} technique.`] },
  { a: tArgue - 0.06, b: tAction - 0.12, size: 96, lines: [q("You don't have to argue"), 'with the thought.'] },
  { a: tAction - 0.06, b: S.s5 - 0.04, size: 96, lines: ['Notice it, then choose', 'one small, useful action.'] },
  { a: tCta - 0.1, b: 99, size: 96, lines: ['Take a mindful break', 'with Mello.'] },
];
const capEl = document.getElementById('cap'), lockEl = document.getElementById('lock');
let capIdx = -2;
function setCaption(t) {
  const i = CAPS.findIndex(c => t >= c.a && t < c.b);
  if (i !== capIdx) {
    capIdx = i;
    if (i >= 0) {
      const c = CAPS[i];
      capEl.style.fontSize = c.size + 'px';
      capEl.innerHTML = c.lines.map((l, k) => `<span class="ln ln${k + 1}">${l}</span>`).join('');
      // fit: never wider than the 900 px band
      let fs = c.size;
      for (const ln of capEl.querySelectorAll('.ln')) while (ln.scrollWidth > 896 && fs > 56) { fs -= 2; capEl.style.fontSize = fs + 'px'; }
    } else capEl.innerHTML = '';
  }
  if (i < 0) { capEl.style.opacity = 0; return; }
  const c = CAPS[i];
  const fin = sm(remap(t, c.a, c.a + 0.22)), fout = 1 - sm(remap(t, c.b - 0.14, c.b));
  capEl.style.opacity = Math.min(fin, fout);
  capEl.style.transform = `scale(${lerp(0.985, 1, fin)})`;
  const l2 = capEl.querySelector('.ln2');
  if (l2 && c.l2) { const k = sm(remap(t, c.l2, c.l2 + 0.22)); l2.style.opacity = k; }
  // end lockup
  const lk = sm(remap(t, T.lockA, T.lockA + 0.6));
  lockEl.style.opacity = lk; lockEl.style.transform = `translateY(${(1 - lk) * 16}px) scale(${lerp(0.96, 1, lk)})`;
}

// ---------------------------------------------------------------- frame
function renderAt(t) {
  const P = pose(t);
  setNotebook(P);
  placeFigure(t, P);
  setCard(t);
  // writing marks appear line by line in S5
  ink.forEach((ln, i) => {
    const w = t - T.writeA - i * 0.85, k = clamp(w / 0.85);
    ln.scale.x = Math.max(0.0001, 0.06 * k); ln.position.x = NB.w * 0.18 + 0.03 * k;
    ln.visible = w > 0;
  });
  lampLight.intensity = 0.35 * sm(remap(t, S.s5 - 0.2, S.s5 + 1.5));
  setCamera(t);
  setCaption(t);
  renderer.render(scene, camera);
}
window.renderAt = renderAt;
window.__dbg = { key, front, fill, hemi, renderer, scene, M, sweep };
window.showGuides = on => { document.getElementById('guides').style.display = on ? 'block' : 'none'; };

await document.fonts.load('400 100px "Instrument Serif"');
await document.fonts.load('italic 400 100px "Instrument Serif"');
await document.fonts.load('500 30px "Inter"');
await document.fonts.ready;
await new Promise(r => { const im = document.getElementById('icon'); if (im.complete) r(); else im.onload = r; });
// redraw text textures now that fonts are present
{
  const { canvas: c, g } = thoughtTx;
  g.clearRect(0, 0, c.width, c.height);
  let s = 220; g.font = `400 ${s}px "Instrument Serif"`;
  while (g.measureText('I’ll mess this up.').width > c.width - 88) { s -= 2; g.font = `400 ${s}px "Instrument Serif"`; }
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('I’ll mess this up.', c.width / 2, c.height * 0.54);
  thoughtTx.tex.needsUpdate = true;
}
tabChars = -1;
renderAt(0);
window.ready = true;
