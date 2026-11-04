// Mello 30 s hindi04-01 (Hindi): "अगर… तो…" - implementation intentions (Gollwitzer 1999; Gollwitzer & Sheeran 2006).
// Same accepted style recipe and renderer as feedback-01 / round02-01 / hindi03-01 ("Thoughts in a Quiet Room": sparse
// clean 3D miniature, one abstract faceless performer, soft contact shadows, white/pale-gray stage, lavender #D9BCF5 only
// as the highlight). Room (accepted depth), props, rig, camera helper, Devanagari caption mechanics are carried over from
// ../../2026-11-03-hindi-03/project/scene/main.js. New for this episode: dinner plate, phone with a scrolling feed, a side
// shelf, the vague-intention card that dissolves, the if-then plan card, cue/action rings + Hindi labels, a 10-minute ring.
// Deterministic: window.renderAt(t) draws the frame at time t.
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



// ------------------------------------------------------------------ shot list (5 distinct shots) and beats
const P0 = l => (TL[l].pauses[0] || [TL[l].start, TL[l].start])[1];
const PL = l => (TL[l].pauses.at(-1) || [TL[l].end, TL[l].end])[1];
const hookSplit = P0('hook'), planSplit = P0('plan'), exSplit = P0('example'), mechSplit = P0('mech'), whySplit = P0('why'), evSplit = PL('evidence');
const S = { s1: 0.0, s2: 4.65, s3: 12.55, s4: 16.6, s5: 25.75, end: 30.0 };
const T = {
  intentIn: 0.25, intentOut: hookSplit + 0.15,        // vague intention appears, then dissolves while scrolling continues
  cardIn: planSplit - 0.15,                           // "agar... to..." plan card
  ifKey: planSplit + 0.05, thenKey: planSplit + 0.6,  // the two keywords
  ifText: TL.example.start, thenText: exSplit,        // "raat ke khaane ke baad" / "phone das minute shelf par"
  cardOut: S.s3 - 0.1,
  cue: TL.mech.start + 0.05,                          // "khaana khatm hona sanket hai": plate pushed away
  action: mechSplit + 0.05,                           // "phone shelf par rakhna, kaam": phone onto the shelf
  placed: mechSplit + 1.05,
  openA: TL.why.start + 0.5, openB: TL.why.start + 1.1, pencilA: TL.why.start + 1.2, writeA: TL.why.start + 2.1,
  buzz: evSplit - 0.1,                                // "haalaanki har baar nahin": the phone buzzes; a glance, then back
  lockA: TL.cta.start - 0.3,
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
key.shadow.camera.left = -5.5; key.shadow.camera.right = 5.5;
key.shadow.camera.top = 5.5; key.shadow.camera.bottom = -5.5;
key.shadow.camera.near = 0.5; key.shadow.camera.far = 20;
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
  const R = 1.7, zWall = -2.7, pts = [];   // accepted room depth (hindi03's deeper wall was episode-specific)
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




// ---------------------------------------------------------------- text texture (accepted helper)
// ---------------------------------------------------------------- text texture (accepted helper)
// ---------------------------------------------------------------- text texture (accepted helper)
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

// ---------------------------------------------------------------- abstract figure (faceless, no character likeness) - accepted rig
// ---------------------------------------------------------------- abstract figure (faceless, no character likeness) - accepted rig
// ---------------------------------------------------------------- abstract figure (faceless, no character likeness) - accepted rig
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




// ---------------------------------------------------------------- episode props: plate, phone, side shelf, cards, rings, labels
const lavender = new THREE.Color('#D9BCF5');
// dinner plate (finished) with a fork
const plate = new THREE.Group();
plate.add(mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.014, 48), M.mug));
const rim2 = mesh(new THREE.TorusGeometry(0.112, 0.006, 8, 48), M.mug); rim2.rotation.x = Math.PI / 2; rim2.position.y = 0.007; plate.add(rim2);
const fork = mesh(new RoundedBoxGeometry(0.012, 0.004, 0.17, 2, 0.002), std('#C9C5D2', 0.4)); fork.position.set(0.035, 0.012, 0.0); fork.rotation.y = 0.35; plate.add(fork);
scene.add(plate);
const plateBlob = blob(0.3, 0.3, 0.45, DESK_Y + 0.002);
const PLATE0 = V(-0.06, DESK_Y + 0.007, 0.1), PLATE1 = V(0.06, DESK_Y + 0.007, -0.2);

// phone with a scrolling feed on its screen
const feedTex = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 1024;
  const g = c.getContext('2d'); g.fillStyle = '#F4F0FB'; g.fillRect(0, 0, 256, 1024);
  const cols = ['#D9BCF5', '#C9C5D6', '#EAD9A8', '#BFD3CB', '#D7C7EE'];
  for (let i = 0; i < 8; i++) {
    const y = 12 + i * 128; g.fillStyle = cols[i % cols.length]; g.beginPath(); g.roundRect(14, y, 228, 84, 14); g.fill();
    g.fillStyle = '#B7B1C9'; g.fillRect(14, y + 94, 150, 10); g.fillRect(14, y + 110, 96, 8);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 0.25); return t;
})();
const phone = new THREE.Group();
phone.add(mesh(new RoundedBoxGeometry(0.07, 0.008, 0.14, 2, 0.004), M.lead));
const screenMat = new THREE.MeshBasicMaterial({ map: feedTex, toneMapped: false, transparent: true });
const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.124), screenMat); screen.rotation.x = -Math.PI / 2; screen.position.y = 0.0045; phone.add(screen);
const notif = new THREE.Mesh(new THREE.PlaneGeometry(0.056, 0.022), new THREE.MeshBasicMaterial({ color: '#D9BCF5', transparent: true, opacity: 0, toneMapped: false }));
notif.rotation.x = -Math.PI / 2; notif.position.set(0, 0.0052, -0.045); phone.add(notif);
scene.add(phone);
const phoneBlob = blob(0.16, 0.22, 0, 1.0);

// side shelf to the performer's right (birch, two lower shelves with books)
const SHELF = V(0.6, 0, 0.62), SHELF_TOP = 1.0;
{ const g = new THREE.Group();
  const side = (x) => { const m = mesh(new RoundedBoxGeometry(0.025, SHELF_TOP, 0.3, 2, 0.006), M.desk); m.position.set(x, SHELF_TOP / 2, 0); g.add(m); };
  side(-0.17); side(0.17);
  for (const y of [0.04, 0.36, 0.68, SHELF_TOP - 0.012]) { const s = mesh(new RoundedBoxGeometry(0.36, 0.024, 0.3, 2, 0.006), M.desk); s.position.set(0, y, 0); g.add(s); }
  const back = mesh(new THREE.BoxGeometry(0.34, SHELF_TOP, 0.01), M.leg); back.position.set(0, SHELF_TOP / 2, -0.145); g.add(back);
  [[-0.1, 0.48, '#B9B4CC', 0.2], [-0.05, 0.47, '#D6A452', 0.18], [0.0, 0.46, '#A7BBA5', 0.17], [0.09, 0.42, '#C9C5D6', 0.1]].forEach(([x, y, c, h]) => {
    const b = mesh(new RoundedBoxGeometry(0.035, h, 0.2, 2, 0.004), std(c, 0.8)); b.position.set(x, 0.38 + h / 2, 0.0); b.rotation.z = x > 0.05 ? -0.35 : 0; g.add(b); });
  g.position.copy(SHELF); g.rotation.y = -Math.PI / 2 + 0.25; scene.add(g);
  blob(0.5, 0.5, 0.5).position.set(SHELF.x, 0.013, SHELF.z); }
const PHONE_SPOT = V(0.6, SHELF_TOP + 0.008, 0.6);

// cards: the vague intention (S1) and the if-then plan (S2), same spot to the performer's left
function makeCard(w, h) {
  const g = new THREE.Group();
  const border = mesh(new RoundedBoxGeometry(w + 0.03, h + 0.03, 0.01, 3, 0.02), std('#D9BCF5', 0.45, { transparent: true, emissive: lavender.clone(), emissiveIntensity: 0.12 }), false, false);
  border.position.z = -0.006; g.add(border);
  const panel = mesh(new RoundedBoxGeometry(w, h, 0.012, 3, 0.016), std('#FBF8F0', 0.9, { transparent: true }), false, false); g.add(panel);
  g.userData = { border, panel, rows: [] }; scene.add(g); return g;
}
function rowTexture() { const c = document.createElement('canvas'); c.width = 1400; c.height = 230; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g: c.getContext('2d'), t, state: '' }; }
function addRow(card, y, w) {
  const tx = rowTexture();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 230 / 1400), new THREE.MeshBasicMaterial({ map: tx.t, transparent: true, depthWrite: false, toneMapped: false }));
  m.position.set(0, y, 0.0075); m.renderOrder = 5; card.add(m); card.userData.rows.push({ m, tx }); return { m, tx };
}
function drawRow(row, key, text, align = 'left') {
  const st = key + '|' + text; if (row.tx.state === st) return; row.tx.state = st;
  const { c, g, t } = row.tx; g.clearRect(0, 0, c.width, c.height);
  g.textBaseline = 'middle'; let x = 30;
  if (key) {
    g.font = '400 150px "Tiro Devanagari Hindi"'; const kw = g.measureText(key).width;
    g.fillStyle = '#D9BCF5'; g.beginPath(); g.roundRect(x, 18, kw + 56, 194, 44); g.fill();
    g.fillStyle = '#17122E'; g.fillText(key, x + 28, 124); x += kw + 84;
  }
  if (text) { g.font = '400 136px "Tiro Devanagari Hindi"'; let s = 136; while (g.measureText(text).width > c.width - x - 20 && s > 40) { s -= 4; g.font = `400 ${s}px "Tiro Devanagari Hindi"`; }
    g.fillStyle = '#17122E'; g.textAlign = align; g.fillText(text, align === 'center' ? c.width / 2 : x, 124); g.textAlign = 'left'; }
  t.needsUpdate = true;
}
const CARD_POS = V(-0.34, 1.32, 0.3), INTENT_POS = V(0.1, 0.94, 0.12);
const intentCard = makeCard(0.62, 0.17); const intentRow = addRow(intentCard, 0.0, 0.6);
const planCard = makeCard(0.78, 0.34); const ifRow = addRow(planCard, 0.075, 0.74), thenRow = addRow(planCard, -0.08, 0.74);

// rings + Hindi labels for cue / action, and the 10-minute ring
function ring(r, tube = 0.006) { const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 64), std('#D9BCF5', 0.45, { transparent: true, emissive: lavender.clone(), emissiveIntensity: 0.3, depthWrite: false })); m.rotation.x = Math.PI / 2; m.renderOrder = 3; scene.add(m); return m; }
function makeLabel(text) {
  const lab = new THREE.Group();
  const lb = mesh(new RoundedBoxGeometry(0.2, 0.08, 0.016, 3, 0.016), std('#D9BCF5', 0.5, { transparent: true }), false, false); lab.add(lb);
  const ltx = textTexture(text, { font: '"Tiro Devanagari Hindi"', w: 640, h: 256, size: 170, color: '#17122E', pad: 24 });
  const lp = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.076), new THREE.MeshBasicMaterial({ map: ltx.tex, transparent: true, depthWrite: false, toneMapped: false }));
  lp.position.z = 0.0085; lp.renderOrder = 5; lab.add(lp); lab.userData = { body: lb, txt: lp, tx: ltx, label: text }; scene.add(lab); return lab;
}
const cueRing = ring(0.15), actRing = ring(0.12);
const cueLab = makeLabel('संकेत'), actLab = makeLabel('काम'), timeLab = makeLabel('10 मिनट');
const LABELS = [cueLab, actLab, timeLab];
const timerMat = std('#D9BCF5', 0.45, { transparent: true, emissive: lavender.clone(), emissiveIntensity: 0.35, side: THREE.DoubleSide, depthWrite: false });
const timerRing = new THREE.Mesh(new THREE.RingGeometry(0.105, 0.122, 64, 1, 0, 0.001), timerMat);
timerRing.rotation.x = -Math.PI / 2; timerRing.position.copy(PHONE_SPOT).add(V(0, 0.004, 0)); timerRing.renderOrder = 3; scene.add(timerRing);
const timerTrack = new THREE.Mesh(new THREE.RingGeometry(0.105, 0.122, 64), new THREE.MeshBasicMaterial({ color: '#E9E3F2', transparent: true, opacity: 0, depthWrite: false }));
timerTrack.rotation.x = -Math.PI / 2; timerTrack.position.copy(PHONE_SPOT).add(V(0, 0.003, 0)); scene.add(timerTrack);
let timerTheta = -1;


// ---------------------------------------------------------------- choreography
const PELVIS = V(0, 0.64, 0.7);
const NB_DESK = V(0.22, DESK_Y + NB.h / 2 + 0.001, 0.0);
const PHONE_HAND = V(0.12, 0.82, 0.3);

function pose(t) {
  const P = {};
  P.breath = Math.sin(t * 2 * Math.PI / 4.2);
  P.lean = track(t, [[0, 0.2], [T.cue, 0.2], [T.cue + 0.5, 0.26], [T.action, 0.18], [T.placed, 0.14], [T.openA, 0.24], [T.writeA, 0.26]]);
  P.shrug = 0;
  P.headPitch = track(t, [[0, -0.62], [T.cue - 0.2, -0.62], [T.cue + 0.3, -0.6], [T.action, -0.4], [T.action + 0.5, -0.25], [T.placed + 0.3, -0.25],
    [T.openA, -0.55], [T.buzz, -0.58], [T.buzz + 0.3, -0.3], [T.buzz + 0.9, -0.3], [T.buzz + 1.3, -0.58], [30, -0.6]]);
  P.headYaw = track(t, [[0, 0], [T.cue - 0.1, 0], [T.cue + 0.3, -0.1], [T.action, -0.1], [T.action + 0.5, -0.75], [T.placed + 0.2, -0.75], [T.placed + 0.8, 0.12],
    [T.buzz, 0.12], [T.buzz + 0.3, -0.7], [T.buzz + 0.9, -0.7], [T.buzz + 1.3, 0.12], [30, 0.12]]);
  P.headRoll = 0;
  P.torsoYaw = P.headYaw * 0.2;
  P.nbPos = NB_DESK; P.nbRot = new THREE.Euler(0, 0.12, 0);
  P.cover = track(t, [[T.openA, 0], [T.openB, Math.PI * 0.985, eio]]);
  return P;
}

function setNotebook(P) {
  notebook.position.copy(P.nbPos); notebook.rotation.copy(P.nbRot);
  coverPivot.rotation.z = P.cover;
  notebook.updateMatrixWorld(true);
  nbBlob.position.set(P.nbPos.x + 0.02, DESK_Y + 0.003, P.nbPos.z + 0.02);
  nbBlob.material.opacity = 0.55;
}

function platePos(t) { return vl(PLATE0, PLATE1, eio(remap(t, T.cue + 0.15, T.cue + 0.95))); }

function placeFigure(t, P) {
  const lean = P.lean, br = P.breath;
  torso.position.copy(PELVIS);
  torso.rotation.set(-lean, P.torsoYaw, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + lean * 0.5, P.headYaw, P.headRoll, 'YXZ');
  torso.updateMatrixWorld(true);
  const shL = torso.localToWorld(V(-0.15, 0.315, 0.0)), shR = torso.localToWorld(V(0.15, 0.315, 0.0));
  const restR = V(0.24, DESK_Y + 0.045, 0.2), restL = V(-0.14, DESK_Y + 0.045, 0.24);
  // right hand: holds the phone (thumb-scroll jitter) -> carries it to the shelf -> back to rest -> pencil and writing
  const scroll = Math.sin(t * 7.0) * 0.004;
  let hR = PHONE_HAND.clone().add(V(0, scroll, 0));
  const carry = eio(remap(t, T.action, T.placed));
  if (t > T.action) hR = vl(PHONE_HAND, PHONE_SPOT.clone().add(V(-0.02, 0.03, 0.04)), carry).add(V(0, Math.sin(Math.PI * carry) * 0.06, 0));
  if (t > T.placed) hR = vl(PHONE_SPOT.clone().add(V(-0.02, 0.03, 0.04)), restR, sm(remap(t, T.placed + 0.1, T.placed + 0.6)));
  // left hand: rests -> pushes the plate away (the cue) -> rests -> opens the notebook
  let hL = restL;
  const pp = platePos(t), push = sm(remap(t, T.cue - 0.25, T.cue + 0.15)) * (1 - sm(remap(t, T.cue + 0.95, T.cue + 1.35)));
  hL = vl(restL, pp.clone().add(V(-0.06, 0.03, 0.1)), push);
  if (t >= T.openA - 0.25) {
    const edge = coverPivot.localToWorld(V(NB.w * 0.95, 0.03, 0.05));
    const k = sm(remap(t, T.openA - 0.25, T.openA)) * (1 - sm(remap(t, T.openB, T.openB + 0.35)));
    const rest2 = notebook.localToWorld(V(-NB.w * 0.62, 0.035, 0.07));
    hL = vl(vl(restL, rest2, sm(remap(t, T.openB, T.openB + 0.35))), edge, k);
  }
  const pen0 = V(0.4, DESK_Y + 0.03, 0.22);
  const write0 = notebook.localToWorld(V(NB.w * 0.32, 0.04, 0.0));
  if (t >= T.pencilA) {
    const a = sm(remap(t, T.pencilA, T.pencilA + 0.5)), b = sm(remap(t, T.pencilA + 0.65, T.writeA));
    hR = vl(vl(restR, pen0, a), write0, b);
    if (t > T.writeA) {
      const w = t - T.writeA, row = Math.min(4, Math.floor(w / 0.85)), ph = (w % 0.85) / 0.85;
      const pause = sm(remap(t, T.buzz, T.buzz + 0.3)) * (1 - sm(remap(t, T.buzz + 0.9, T.buzz + 1.3)));   // pen pauses during the buzz glance
      const wp = notebook.localToWorld(V(NB.w * 0.18 + 0.06 * ph + 0.004 * Math.sin(w * 31), 0.04 + 0.003 * Math.abs(Math.sin(w * 23)), -0.09 + row * 0.03 + 0.04));
      hR = vl(wp, wp.clone().add(V(0, 0.04, 0)), pause);
    }
  }
  const poleL = V(-0.8, -0.5, 0.6), poleR = V(0.8, -0.5, 0.6);
  const aL = ik(shL, hL, 0.25, 0.235, poleL), aR = ik(shR, hR, 0.25, 0.235, poleR);
  J.shL.position.copy(shL); J.shR.position.copy(shR); J.elL.position.copy(aL.mid); J.elR.position.copy(aR.mid);
  J.haL.position.copy(aL.end); J.haR.position.copy(aR.end);
  setLimb(limbs.uaL, shL, aL.mid); setLimb(limbs.faL, aL.mid, aL.end); setLimb(limbs.uaR, shR, aR.mid); setLimb(limbs.faR, aR.mid, aR.end);
  J.haL.lookAt(aL.mid); J.haR.lookAt(aR.mid);
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    const hip = torso.localToWorld(V(sx * 0.085, 0.02, 0.0)); hip.y = Math.max(hip.y, 0.6);
    const ank = V(sx * 0.12, 0.075, 0.27);
    const r = ik(hip, ank, 0.4, 0.43, V(sx * 0.15, 1, -0.6));
    const [th, sh, hi, kn, an] = i === 0 ? [limbs.thL, limbs.shL, J.hiL, J.knL, J.anL] : [limbs.thR, limbs.shR, J.hiR, J.knR, J.anR];
    hi.position.copy(hip); kn.position.copy(r.mid); an.position.copy(r.end);
    setLimb(th, hip, r.mid); setLimb(sh, r.mid, r.end);
    feet[i].position.set(r.end.x, 0.028, r.end.z - 0.045); feet[i].rotation.set(0, sx * -0.1, 0);
    footBlobs[i].position.set(r.end.x, 0.013, r.end.z - 0.04);
  }
  const penRest = V(0.4, DESK_Y + 0.006, 0.22);
  if (t >= T.pencilA + 0.5) { pencil.position.copy(aR.end).add(V(-0.012, -0.02, -0.02)); pencil.rotation.set(-0.9, 0.2, 0.55); }
  else { pencil.position.copy(penRest); pencil.rotation.set(Math.PI / 2, 0, 1.1); }
  // phone: in the right hand until placed, then lying on the shelf
  if (t < T.placed) {
    phone.position.copy(aR.end).add(V(-0.01, 0.025, -0.03));
    const tilt = lerp(-0.55, 0, carry);
    phone.rotation.set(tilt, -0.2 + 0.3 * carry, 0, 'YXZ');
  } else { phone.position.copy(PHONE_SPOT); phone.rotation.set(0, -0.35, 0); }
}
mug.position.set(0.47, DESK_Y + 0.0475, 0.06);

function setEpisode(t, camYaw, intentYaw) {
  // phone screen: scrolls while in hand, dims on the shelf, wakes for the buzz
  feedTex.offset.y = -(Math.min(t, T.action) * 0.11) % 1;
  const onShelf = sm(remap(t, T.placed - 0.2, T.placed + 0.4));
  const buzz = Math.sin(Math.PI * remap(t, T.buzz, T.buzz + 1.0));
  screenMat.color.setScalar(lerp(1, 0.12, onShelf) + 0.8 * buzz * onShelf);
  notif.material.opacity = buzz * onShelf;
  if (t > T.placed) { phone.position.x += 0.003 * Math.sin(t * 95) * buzz; phone.position.z += 0.002 * Math.cos(t * 83) * buzz; }
  phoneBlob.position.set(PHONE_SPOT.x, SHELF_TOP + 0.002, PHONE_SPOT.z); phoneBlob.material.opacity = 0.45 * onShelf;
  // plate (pushed away on the cue)
  const pp = platePos(t); plate.position.copy(pp); plateBlob.position.set(pp.x, DESK_Y + 0.002, pp.z);
  // cards
  const iv = sm(remap(t, T.intentIn, T.intentIn + 0.3)) * (1 - sm(remap(t, T.intentOut, T.intentOut + 1.3)));
  intentCard.visible = iv > 0.003;
  intentCard.position.copy(INTENT_POS).add(V(0, 0.06 * sm(remap(t, T.intentOut, T.intentOut + 1.3)), 0));
  intentCard.scale.setScalar(0.36 * lerp(0.85, 1, sm(remap(t, T.intentIn, T.intentIn + 0.3))) * lerp(1, 0.7, sm(remap(t, T.intentOut, T.intentOut + 1.3))));
  intentCard.quaternion.copy(camera.quaternion);
  intentCard.userData.border.material.opacity = iv * 0.35; intentCard.userData.panel.material.opacity = iv * 0.92; intentRow.m.material.opacity = iv;
  drawRow(intentRow, '', '“स्क्रॉल बंद करूँगी”', 'center');
  const pv = sm(remap(t, T.cardIn, T.cardIn + 0.35)) * (1 - sm(remap(t, T.cardOut - 0.3, T.cardOut)));
  planCard.visible = pv > 0.003;
  planCard.position.copy(CARD_POS); planCard.rotation.set(0, camYaw, 0);
  planCard.scale.setScalar(0.94 * lerp(0.85, 1, sm(remap(t, T.cardIn, T.cardIn + 0.35))));
  planCard.userData.border.material.opacity = pv; planCard.userData.panel.material.opacity = pv * 0.95;
  drawRow(ifRow, t >= T.ifKey ? 'अगर' : '', t >= T.ifText ? 'रात के खाने के बाद' : '');
  drawRow(thenRow, t >= T.thenKey ? 'तो' : '', t >= T.thenText ? 'फ़ोन शेल्फ़ पर, 10 मिनट' : '');
  ifRow.m.material.opacity = pv; thenRow.m.material.opacity = pv;
  // cue ring + label on the plate; action ring + label on the shelf
  const cv = sm(remap(t, T.cue + 0.3, T.cue + 0.7)) * (1 - sm(remap(t, S.s4 - 0.35, S.s4 - 0.05)));
  cueRing.position.copy(pp).add(V(0, 0.004, 0)); cueRing.visible = cv > 0.003; cueRing.material.opacity = cv;
  cueRing.scale.setScalar(lerp(0.7, 1, eout(remap(t, T.cue + 0.3, T.cue + 0.8))));
  const av = sm(remap(t, T.placed - 0.3, T.placed + 0.1)) * (1 - sm(remap(t, S.s4 - 0.35, S.s4 - 0.05)));   // 'kaam' owns the shelf until the cut
  actRing.position.copy(PHONE_SPOT).add(V(0, 0.006, 0)); actRing.visible = av > 0.003; actRing.material.opacity = av;
  const setLab = (lab, pos, v, pulse = 0) => {
    lab.position.copy(pos); lab.quaternion.copy(camera.quaternion); lab.visible = v > 0.003;
    lab.scale.setScalar(1.3 * lerp(0.6, 1, v) * (1 + 0.12 * pulse));
    lab.userData.body.material.opacity = v; lab.userData.txt.material.opacity = v;
  };
  setLab(cueLab, pp.clone().add(V(-0.04, 0.08, 0.06)), cv);
  setLab(actLab, PHONE_SPOT.clone().add(V(0.0, 0.14, 0.05)), av);
  // 10-minute ring fills from the moment the phone is placed (stylised: the clip shows the start of the ten minutes)
  const tv = sm(remap(t, S.s4, S.s4 + 0.45));   // the 10-minute ring/label take over after the cut (no label overlap)
  timerTrack.material.opacity = 0.9 * tv; timerRing.visible = tv > 0.003; timerMat.opacity = tv;
  const th = Math.max(0.001, Math.PI * 2 * clamp(remap(t, S.s4, 29.8)) * 0.42);
  if (Math.abs(th - timerTheta) > 0.004) { timerTheta = th; timerRing.geometry.dispose(); timerRing.geometry = new THREE.RingGeometry(0.105, 0.122, 64, 1, Math.PI / 2, th); }
  setLab(timeLab, PHONE_SPOT.clone().add(V(-0.14, 0.06, -0.06)), tv * (1 - sm(remap(t, S.s5 - 0.3, S.s5 + 0.2))), buzz);
  timeLab.scale.multiplyScalar(0.8);
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 high over the right shoulder: the scrolling phone over the finished plate; the vague intention floats up and dissolves
  { a: S.s1, b: S.s2, k0: [V(0.08, 0.84, 0.16), 30, 58, 1.8, 30], k1: [V(0.08, 0.84, 0.16), 26, 56, 1.65, 30] },
  // S2 rear-left medium: the if-then plan card builds beside the performer
  { a: S.s2, b: S.s3, k0: [V(-0.24, 1.14, 0.3), -16, 9, 4.0, 30], k1: [V(-0.23, 1.13, 0.3), -12, 8, 3.75, 30] },
  // S3 rear-right high: cue (plate pushed away) and action (phone onto the shelf)
  { a: S.s3, b: S.s4, k0: [V(0.26, 0.92, 0.32), 30, 34, 2.7, 30], k1: [V(0.36, 0.95, 0.42), 36, 33, 2.6, 30], m: [T.cue + 0.6, T.placed + 0.2], ease: 'sine' },
  // S4 high right side: the phone resting on the shelf with the 10-minute ring, the performer writing at the desk
  { a: S.s4, b: S.s5, k0: [V(0.44, 0.86, 0.4), 34, 48, 2.0, 30], k1: [V(0.43, 0.86, 0.38), 28, 46, 1.85, 30] },
  // S5 wide calm room (accepted staging): back to the notebook, lock-up
  { a: S.s5, b: S.end, k0: [V(0.0, 0.98, 0.1), 6, 15, 5.0, 30], k1: [V(-0.02, 1.1, 0.05), 9, 18, 6.8, 30] },
];

function camFrom([tg, az, el, d, fov]) {
  const p = tg.clone().add(V(Math.sin(az * D2R) * Math.cos(el * D2R), Math.sin(el * D2R), Math.cos(az * D2R) * Math.cos(el * D2R)).multiplyScalar(d));
  return { p, tg, fov };
}
function setCamera(t) {
  const s = SHOTS.find(x => t >= x.a && t < x.b) || SHOTS[SHOTS.length - 1];
  const [ma, mb] = s.m || [s.a, s.b];
  const sine = x => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x));   // gentler peak speed than smootherstep
  const ez = s.ease === 'sine' ? sine : sm;
  const u = s.m ? ez(remap(t, ma, mb)) : sm(remap(t, s.a, s.b)) * 0.5 + remap(t, s.a, s.b) * 0.5;
  // optional "lead": the aim point arrives early so the subject stays low in frame during a crane
  const ut = s.lead ? ez(remap(t, ma, ma + (mb - ma) * s.lead)) : u;
  // optional "kp": a slow push from k0 to kp while the shot holds before its move window; the move then starts from kp
  const k0 = s.kp ? (t < ma ? s.k0.map((v, i) => { const w = remap(t, s.a, ma); return v.isVector3 ? vl(v, s.kp[i], w) : lerp(v, s.kp[i], w); }) : s.kp) : s.k0;
  let k = t < ma && s.kp ? k0 : k0.map((v, i) => (v.isVector3 ? vl(v, s.k1[i], ut) : lerp(v, s.k1[i], u)));
  if (s.k2 && t > mb) { const u2 = sm(remap(t, mb, s.b)); k = s.k1.map((v, i) => (v.isVector3 ? vl(v, s.k2[i], u2) : lerp(v, s.k2[i], u2))); }
  const c = camFrom(k);
  camera.position.copy(c.p); camera.lookAt(c.tg);
  camera.fov = c.fov; camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);   // so projections made before render() (label edge fade) use this frame's view
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


function unionBox(objs) {
  const bs = objs.filter(o => o.visible).map(screenBox).filter(Boolean);
  if (!bs.length) return null;
  return [Math.min(...bs.map(b => b[0])), Math.min(...bs.map(b => b[1])), Math.max(...bs.map(b => b[2])), Math.max(...bs.map(b => b[3]))];
}

window.layoutReport = t => {
  renderAt(t);
  // "card" = visible in-scene Hindi text (plan card, intention card, labels): the crucial in-scene text in this episode
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const objs = [intentCard, planCard, ...LABELS].filter(o => o.visible).map(screenBox).filter(onScreen);
  const r = { t, card: objs.length ? [Math.min(...objs.map(b => b[0])), Math.min(...objs.map(b => b[1])), Math.max(...objs.map(b => b[2])), Math.max(...objs.map(b => b[3]))] : null,
    planCard: planCard.visible ? screenBox(planCard) : null, head: screenBox(head), phone: screenBox(phone), plate: screenBox(plate), desk: screenBox(deskTop) };
  const cb = capEl.getBoundingClientRect();
  r.caption = capEl.innerHTML && +capEl.style.opacity > 0.02 ? [cb.left, cb.top, cb.right, cb.bottom].map(Math.round) : null;
  const spans = [...capEl.querySelectorAll('.ln')].map(e => e.getBoundingClientRect());
  r.captionText = spans.length && r.caption ? [Math.min(...spans.map(b => b.left)), Math.min(...spans.map(b => b.top)), Math.max(...spans.map(b => b.right)), Math.max(...spans.map(b => b.bottom))].map(Math.round) : null;
  r.captionLines = spans.length;
  r.shot = SHOTS.findIndex(x => t >= x.a && t < x.b) + 1 || 5;
  return r;
};


// ---------------------------------------------------------------- captions (accepted treatment; Devanagari via Tiro Devanagari Hindi)
const hl = s => `<span class="hl">${s}</span>`;
const sg = (html, t = null) => ({ html, t });
const C2 = 76, C1 = 92;
const CAPS = [
  { a: -1, b: S.s2 - 0.05, size: C2, lines: [[sg('“मैं स्क्रॉल करना बंद करूँगी”')], [sg('सिर्फ़ इरादा अक्सर काफ़ी नहीं होता।', hookSplit - 0.05)]] },
  { a: TL.plan.start - 0.06, b: TL.example.start - 0.12, size: C2, lines: [[sg('इसकी जगह,'), sg(` ${hl('अगर… तो…')}`, planSplit - 0.04)], [sg('वाली योजना बनाइए:', planSplit + 0.7)]] },
  { a: TL.example.start - 0.06, b: exSplit - 0.12, size: C1, lines: [[sg('रात के खाने के बाद,')]] },
  { a: exSplit - 0.06, b: S.s3 - 0.05, size: C2, lines: [[sg('मैं फ़ोन दस मिनट के लिए')], [sg('शेल्फ़ पर रख दूँगी।')]] },
  { a: TL.mech.start - 0.06, b: mechSplit - 0.12, size: C2, lines: [[sg('खाने का ख़त्म होना')], [sg(`${hl('संकेत')} है;`)]] },
  { a: mechSplit - 0.06, b: S.s4 - 0.05, size: C2, lines: [[sg('फ़ोन शेल्फ़ पर रखना,')], [sg(`${hl('काम')}।`)]] },
  { a: TL.why.start - 0.06, b: TL.evidence.start - 0.12, size: C2, lines: [[sg('संकेत आते ही,')], [sg(`फ़ैसला ${hl('पहले से तय')} होता है।`, whySplit - 0.04)]] },
  { a: TL.evidence.start - 0.06, b: evSplit - 0.12, size: C2, lines: [[sg('कई शोधों में, ऐसी योजनाओं से')], [sg('अमल करना आसान हुआ,')]] },
  { a: evSplit - 0.06, b: TL.cta.start - 0.2, size: C1, lines: [[sg('हालाँकि हर बार नहीं।')]] },
  { a: TL.cta.start - 0.1, b: 99, size: C2, lines: [[sg('मेलो के साथ एक')], [sg('माइंडफुल ब्रेक लीजिए।')]] },
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
      capEl.innerHTML = c.lines.map((l, k) => `<span class="ln ln${k + 1}">${l.map((s, j) => `<span class="sg" data-k="${k}-${j}">${s.html}</span>`).join('')}</span>`).join('');
      // fit: never wider than the 900 px band (all segments laid out from the start, so nothing reflows)
      let fs = c.size;
      for (const ln of capEl.querySelectorAll('.ln')) while (ln.scrollWidth > 896 && fs > 56) { fs -= 2; capEl.style.fontSize = fs + 'px'; }
    } else capEl.innerHTML = '';
  }
  if (i < 0) { capEl.style.opacity = 0; } else {
    const c = CAPS[i];
    const fin = sm(remap(t, c.a, c.a + 0.22)), fout = 1 - sm(remap(t, c.b - 0.14, c.b));
    capEl.style.opacity = Math.min(fin, fout);
    capEl.style.transform = `scale(${lerp(0.985, 1, fin)})`;
    c.lines.forEach((l, k) => l.forEach((s, j) => {
      const el = capEl.querySelector(`[data-k="${k}-${j}"]`);
      if (el) el.style.opacity = s.t === null ? 1 : sm(remap(t, s.t, s.t + 0.2));
    }));
  }
  // end lockup (accepted)
  const lk = sm(remap(t, T.lockA, T.lockA + 0.6));
  lockEl.style.opacity = lk; lockEl.style.transform = `translateY(${(1 - lk) * 16}px) scale(${lerp(0.96, 1, lk)})`;
}



// ---------------------------------------------------------------- frame
function renderAt(t) {
  const P = pose(t);
  setNotebook(P);
  placeFigure(t, P);
  setCamera(t);
  setEpisode(t, Math.atan2(camera.position.x - CARD_POS.x, camera.position.z - CARD_POS.z), Math.atan2(camera.position.x - INTENT_POS.x, camera.position.z - INTENT_POS.z));
  ink.forEach((ln, i) => {
    const w = t - T.writeA - i * 0.85, k = clamp(w / 0.85);
    ln.scale.x = Math.max(0.0001, 0.06 * k); ln.position.x = NB.w * 0.18 + 0.03 * k;
    ln.visible = w > 0;
  });
  lampLight.intensity = 0.35 * sm(remap(t, S.s4 - 0.2, S.s4 + 1.5));
  setCaption(t);
  renderer.render(scene, camera);
}
window.renderAt = renderAt;
window.projectPoints = (t, pts) => { renderAt(t); return pts.map(([x, y, z]) => { const v = V(x, y, z).project(camera); return [Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * H)]; }); };
window.showGuides = on => { document.getElementById('guides').style.display = on ? 'block' : 'none'; };

await document.fonts.load('400 100px "Instrument Serif"');
await document.fonts.load('italic 400 100px "Instrument Serif"');
await document.fonts.load('500 30px "Inter"');
await document.fonts.ready;
await new Promise(r => { const im = document.getElementById('icon'); if (im.complete) r(); else im.onload = r; });
await document.fonts.load('400 100px "Tiro Devanagari Hindi"', 'अआकखग');
await document.fonts.ready;
window.__fontCheck = { tiro: document.fonts.check('400 100px "Tiro Devanagari Hindi"', 'संकेत'), instrument: document.fonts.check('400 100px "Instrument Serif"') };
// redraw Hindi textures now that the Devanagari font is present
for (const lab of LABELS) {
  const { canvas: c, g: ctx } = lab.userData.tx;
  ctx.clearRect(0, 0, c.width, c.height);
  let s = 170; ctx.font = `400 ${s}px "Tiro Devanagari Hindi"`;
  while (ctx.measureText(lab.userData.label).width > c.width - 60) { s -= 4; ctx.font = `400 ${s}px "Tiro Devanagari Hindi"`; }
  ctx.fillStyle = '#17122E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(lab.userData.label, c.width / 2, c.height * 0.56);
  lab.userData.tx.tex.needsUpdate = true;
}
for (const r of [intentRow, ifRow, thenRow]) r.tx.state = '';
renderAt(0);
window.ready = true;
