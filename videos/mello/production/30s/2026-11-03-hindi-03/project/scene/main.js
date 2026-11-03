// Mello 30 s hindi03-01 (Hindi): "स्पॉटलाइट इफ़ेक्ट" - the spotlight effect (Gilovich, Medvec & Savitsky, 2000).
// Same accepted style recipe and renderer as feedback-01 / round02-01 ("Thoughts in a Quiet Room": sparse clean 3D
// miniature, one abstract faceless performer, soft contact shadows, white/pale-gray stage, lavender #D9BCF5 only as
// the highlight). Room, props, rig, camera helper and caption mechanics are carried over unchanged from
// ../../2026-11-03-round-02/project/scene/main.js. New for this episode: four busy room-mates (simple faceless figures),
// the tipping mug, a theatrical spotlight + room dim for the *imagined* audience, Hindi labels, Devanagari captions.
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
const hookSplit = P0('hook'), studySplit = PL('study'), whySplit = PL('why'), askSplit = P0('ask'), qualSplit = P0('qual');
const S = { s1: 0.0, s2: 3.25, s3: 5.55, s4: 13.95, s5: 21.85, end: 30.0 };
const T = {
  knock: 0.12, tipA: 0.16, tipB: 0.5,                 // the performer's hand knocks the mug over
  spotA: hookSplit + 0.1, spotB: hookSplit + 0.7,     // "...sab aapko hi dekh rahe hain?": spotlight + imagined audience
  shirt: P0('study') + 0.1,                           // "atpati T-shirt": a printed shirt appears on the performer
  predict: studySplit,                                // "aadhe log": two of the four (imagined) would remember
  real: TL.real.start,                                // "asal mein": lights back, everyone returns to their own task
  glance: TL.real.start + 0.9,                        // ...only one of four actually glances (about a quarter)
  labels: whySplit + 0.05,                            // "baaki log apne kaamon mein": what each person is busy with
  ask: askSplit,                                      // "ye log asal mein kismein vyast hain?": performer looks around
  mugA: TL.qual.start + 0.15, mugB: TL.qual.start + 1.25,   // rights the mug, calmly
  openA: TL.qual.start + 1.8, openB: TL.qual.start + 2.4,
  pencilA: TL.qual.start + 2.5, writeA: TL.qual.start + 3.4,
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
  const R = 1.7, zWall = -4.2, pts = [];   // hindi03: wall pushed back 1.5 m to seat the room-mates behind the desk
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
plant.position.set(-1.75, 0, -0.35); scene.add(plant);
blob(0.6, 0.6, 0.55).position.set(-1.75, 0.002, -0.35);

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



// ---------------------------------------------------------------- episode: spotlight, room-mates, labels, shirt print
const spot = new THREE.SpotLight('#fff3e2', 0, 6, 0.36, 0.55, 1.2);
spot.position.set(0.0, 3.6, 0.62); spot.target.position.set(0, 0.9, 0.62); scene.add(spot, spot.target);
const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.62, 3.55, 48, 1, true),
  new THREE.MeshBasicMaterial({ color: '#fff4e6', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, toneMapped: false }));
cone.position.set(0, 3.55 / 2, 0.62); cone.renderOrder = 6; scene.add(cone);
const glowTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,246,230,1)'); gr.addColorStop(0.6, 'rgba(255,246,230,0.55)'); gr.addColorStop(1, 'rgba(255,246,230,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const floorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.set(0, 0.016, 0.62); floorGlow.renderOrder = 2; scene.add(floorGlow);
const BASE_LIGHT = { hemi: hemi.intensity, key: key.intensity, fill: fill.intensity, front: front.intensity };
const BG0 = new THREE.Color(STAGE), BG1 = new THREE.Color('#C9C5D0');

// printed T-shirt image on the performer's back (the study's 'awkward T-shirt'; visible in the rear shots)
const printTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#F1C76A'; g.beginPath(); g.roundRect(8, 8, 240, 240, 36); g.fill();
  g.fillStyle = '#17122E'; g.beginPath(); g.arc(128, 104, 46, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(128, 236, 86, 70, 0, Math.PI, 0); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const shirtPrint = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.13), new THREE.MeshStandardMaterial({ map: printTex, roughness: 0.8, transparent: true }));

// four room-mates: simple faceless figures in a lighter lilac-gray (the accepted performer stays the only slate figure)
const PERSON = { body: '#BEB9CC', hair: '#8D87A6', imagined: '#CDB8F4' };
const lavender = new THREE.Color('#D9BCF5');
function personLimb(parent, mat, r0, r1) { const m = mesh(new THREE.CylinderGeometry(r1, r0, 1, 16, 1, true), mat); parent.add(m); return m; }
function personJoint(parent, mat, r) { const m = mesh(new THREE.SphereGeometry(r, 16, 12), mat); parent.add(m); return m; }
function setSeg(m, a, b) { const d = b.clone().sub(a), len = d.length(); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); m.scale.set(1, len, 1); }
function makePerson({ id, pos, yaw, seated, label }) {
  const g = new THREE.Group(); g.position.copy(pos); g.rotation.y = yaw; scene.add(g);
  const mat = std(PERSON.body, 0.82, { emissive: lavender.clone(), emissiveIntensity: 0 });
  const hairM = std(PERSON.hair, 0.88);
  const hipY = seated ? 0.64 : 0.92;
  const body = new THREE.Group(); body.position.y = hipY; g.add(body);
  const torsoM = mesh(new THREE.CapsuleGeometry(0.112, 0.2, 8, 24), mat); torsoM.scale.set(1.12, 1, 0.82); torsoM.position.y = 0.2; body.add(torsoM);
  const neckM = mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.1, 14), mat); neckM.position.y = 0.43; body.add(neckM);
  const headG = new THREE.Group(); headG.position.y = 0.55; body.add(headG);
  const sk = mesh(new THREE.SphereGeometry(0.1, 32, 22), mat); sk.scale.set(0.94, 1.1, 1.0); headG.add(sk);
  const hr = mesh(new THREE.SphereGeometry(0.105, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.5), hairM); hr.scale.set(0.95, 1.1, 1.02); hr.rotation.x = 0.7; hr.position.set(0, 0.008, 0.006); headG.add(hr);
  const arms = [-1, 1].map(sx => ({ sx, ua: personLimb(body, mat, 0.038, 0.034), fa: personLimb(body, mat, 0.033, 0.029),
    sh: personJoint(body, mat, 0.041), el: personJoint(body, mat, 0.034), ha: personJoint(body, mat, 0.037) }));
  // legs are static (seated or standing), built once in group space
  for (const sx of [-1, 1]) {
    const hip = V(sx * 0.08, hipY + 0.02, 0);
    const knee = seated ? V(sx * 0.1, hipY - 0.02, -0.38) : V(sx * 0.09, 0.49, -0.01);
    const ank = seated ? V(sx * 0.11, 0.075, -0.42) : V(sx * 0.09, 0.075, 0.0);
    const th = personLimb(g, mat, 0.056, 0.048), sh = personLimb(g, mat, 0.046, 0.038);
    setSeg(th, hip, knee); setSeg(sh, knee, ank);
    personJoint(g, mat, 0.058).position.copy(hip); personJoint(g, mat, 0.048).position.copy(knee); personJoint(g, mat, 0.038).position.copy(ank);
    const ft = mesh(new RoundedBoxGeometry(0.082, 0.05, 0.155, 3, 0.022), mat); ft.position.set(ank.x, 0.028, ank.z - 0.045); g.add(ft);
  }
  blob(0.62, 0.62, 0.5).position.set(pos.x, 0.013, pos.z);
  if (seated) {
    const st = new THREE.Group();
    const s1 = mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.05, 36), M.stool); s1.position.y = 0.535; st.add(s1);
    const s2 = mesh(new THREE.CylinderGeometry(0.023, 0.028, 0.5, 14), M.stool); s2.position.y = 0.25; st.add(s2);
    const s3 = mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.02, 28), M.stool); s3.position.y = 0.01; st.add(s3);
    st.position.set(pos.x, 0, pos.z); scene.add(st);
  }
  // halo (imagined attention) and label (what they are actually busy with)
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.007, 10, 48), std('#D9BCF5', 0.45, { transparent: true, emissive: lavender.clone(), emissiveIntensity: 0.4, depthWrite: false }));
  halo.rotation.x = Math.PI / 2; halo.renderOrder = 4; scene.add(halo);
  const lab = new THREE.Group();
  const lb = mesh(new RoundedBoxGeometry(0.24, 0.085, 0.016, 3, 0.016), std('#D9BCF5', 0.5, { transparent: true }), false, false); lab.add(lb);
  const ltx = textTexture(label, { font: '"Tiro Devanagari Hindi"', w: 768, h: 272, size: 190, color: '#17122E', pad: 24 });
  const lp = new THREE.Mesh(new THREE.PlaneGeometry(0.23, 0.0815), new THREE.MeshBasicMaterial({ map: ltx.tex, transparent: true, depthWrite: false, toneMapped: false }));
  lp.position.z = 0.0085; lp.renderOrder = 5; lab.add(lp); lab.userData = { body: lb, txt: lp, tx: ltx, label }; scene.add(lab);
  return { id, g, body, headG, arms, mat, seated, hipY, halo, lab, pos, yaw, props: {} };
}
const PEOPLE = [
  makePerson({ id: 'read', pos: V(-0.96, 0, -1.98), yaw: Math.PI, seated: true, label: 'पढ़ाई' }),
  makePerson({ id: 'phone', pos: V(-0.32, 0, -1.98), yaw: Math.PI, seated: true, label: 'फ़ोन' }),
  makePerson({ id: 'laptop', pos: V(0.32, 0, -1.98), yaw: Math.PI, seated: true, label: 'लैपटॉप' }),
  makePerson({ id: 'tea', pos: V(0.96, 0, -1.98), yaw: Math.PI, seated: true, label: 'चाय' }),
];
const BY = Object.fromEntries(PEOPLE.map(p => [p.id, p]));
// one long table between the room-mates and the performer's desk (as in the study: observers seated along one side)
const LT_Z = -1.56;
{ const top = mesh(new RoundedBoxGeometry(2.7, 0.04, 0.62, 3, 0.012), M.desk); top.position.set(0, 0.7, LT_Z); scene.add(top);
  for (const [x, z] of [[-1.28, LT_Z - 0.26], [1.28, LT_Z - 0.26], [-1.28, LT_Z + 0.26], [1.28, LT_Z + 0.26]]) {
    const l = mesh(new THREE.CylinderGeometry(0.018, 0.015, 0.68, 14), M.leg); l.position.set(x, 0.34, z); scene.add(l);
    blob(0.16, 0.16, 0.55).position.set(x, 0.013, z); }
  blob(3.1, 1.0, 0.25).position.set(0, 0.013, LT_Z); }
// props
const papers = mesh(new RoundedBoxGeometry(0.2, 0.006, 0.27, 2, 0.002), M.pages); scene.add(papers);
const phone = new THREE.Group();
phone.add(mesh(new RoundedBoxGeometry(0.068, 0.135, 0.011, 2, 0.006), M.lead));
const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.058, 0.118), new THREE.MeshBasicMaterial({ color: '#EDE6FA', toneMapped: false })); scr.position.z = -0.0065; scr.rotation.y = Math.PI; phone.add(scr);
scene.add(phone);
const laptop = new THREE.Group();
laptop.add(mesh(new RoundedBoxGeometry(0.3, 0.014, 0.21, 2, 0.004), M.lamp));
const lid = new THREE.Group(); lid.position.set(0, 0.007, -0.105); laptop.add(lid);
const lidM = mesh(new RoundedBoxGeometry(0.3, 0.2, 0.009, 2, 0.004), M.lamp); lidM.position.y = 0.1; lid.add(lidM);
const lscr = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.17), new THREE.MeshBasicMaterial({ color: '#E9E3F7', toneMapped: false })); lscr.position.set(0, 0.1, 0.0055); lid.add(lscr);
lid.rotation.x = -0.32;
laptop.position.set(BY.laptop.pos.x, 0.727, LT_Z - 0.08); laptop.rotation.y = Math.PI; scene.add(laptop);
blob(0.4, 0.3, 0.4, 0.722).position.set(BY.laptop.pos.x, 0.722, LT_Z - 0.08);
const cup = new THREE.Group();
cup.add(mesh(new THREE.CylinderGeometry(0.036, 0.032, 0.085, 28), M.mug));
const cuph = mesh(new THREE.TorusGeometry(0.022, 0.007, 8, 20), M.mug); cuph.position.x = 0.04; cup.add(cuph);
scene.add(cup);
const LABEL_OBJS = PEOPLE.map(p => p.lab);


// ---------------------------------------------------------------- choreography
const PELVIS = V(0, 0.64, 0.7);
const NB_DESK = V(0.14, DESK_Y + NB.h / 2 + 0.001, 0.03);
const MUG0 = V(0.47, DESK_Y + 0.0475, 0.06), MUG_YAW = -2.2, MUG_R = 0.042;
const HEAD_W = V(0, 1.36, 0.6);   // performer head (for the room-mates to look at)

const LOOK = { read: T.ask + 0.25, phone: T.ask + 0.9, laptop: T.ask + 1.55, tea: T.ask + 2.2 };
function imagined(t) { return sm(remap(t, T.spotA, T.spotB + 0.4)) * (1 - sm(remap(t, T.real, T.real + 0.7))); }
function mugTip(t) {
  // 0 upright -> 1 on its side (falls toward +x); righted again in S5
  let a = ein(remap(t, T.tipA, T.tipB));
  if (t > T.tipB) a = 1 - 0.07 * Math.exp(-(t - T.tipB) * 10) * Math.abs(Math.sin((t - T.tipB) * 22));
  return a * (1 - sm(remap(t, T.mugA + 0.45, T.mugB)));
}
function setMug(t) {
  const a = mugTip(t), phi = -a * Math.PI / 2;
  const pivot = V(MUG0.x + MUG_R, DESK_Y, MUG0.z);
  const rel = V(-MUG_R, 0.0475, 0);
  const c = Math.cos(phi), s = Math.sin(phi);
  mug.position.set(pivot.x + c * rel.x - s * rel.y, pivot.y + s * rel.x + c * rel.y, pivot.z);
  mug.quaternion.setFromEuler(new THREE.Euler(0, 0, phi)).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, MUG_YAW, 0)));
  return a;
}

function pose(t) {
  const P = {};
  P.breath = Math.sin(t * 2 * Math.PI / 4.2);
  const im = imagined(t);
  P.lean = track(t, [[0, 0.2], [T.knock, 0.24], [T.tipB + 0.1, 0.04, eout], [T.spotB, 0.1], [T.real, 0.12], [T.real + 0.8, 0.16],
    [T.mugA, 0.18], [T.mugA + 0.5, 0.24], [T.openA, 0.24], [T.writeA, 0.26]]);
  P.shrug = 0.032 * im + 0.02 * Math.sin(Math.PI * remap(t, T.tipA, T.tipB + 0.5));
  P.headPitch = track(t, [[0, -0.45], [T.tipA, -0.4], [T.tipB, -0.5], [T.tipB + 0.4, -0.15], [T.spotB, -0.3], [T.real, -0.32], [T.real + 0.6, -0.05],
    [T.labels, -0.05], [T.mugA, -0.35], [T.mugB, -0.45], [T.writeA, -0.58], [30, -0.6]]);
  // nervous look-around in the hook; in the "ask" beat the performer checks what each person is busy with
  // looks along the long table, left to right: read (+0.36), phone (+0.12), laptop (-0.12), tea (-0.36)
  const looks = [[T.ask - 0.2, 0], [LOOK.read, 0.38], [LOOK.read + 0.4, 0.38], [LOOK.phone, 0.13], [LOOK.phone + 0.4, 0.13],
    [LOOK.laptop, -0.13], [LOOK.laptop + 0.4, -0.13], [LOOK.tea, -0.38], [LOOK.tea + 0.4, -0.38], [LOOK.tea + 0.9, 0]];
  P.headYaw = t < T.real ? track(t, [[0, 0], [T.tipA, 0], [T.tipB, -0.55], [T.tipB + 0.5, -0.55], [T.spotA, 0.45], [T.spotA + 0.7, -0.4],
    [T.spotB + 0.9, 0.05], [T.real, 0]]) : track(t, looks);
  P.headRoll = 0;
  P.torsoYaw = P.headYaw * 0.18;
  P.nbPos = NB_DESK; P.nbRot = new THREE.Euler(0, -0.06, 0);
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

function placeFigure(t, P) {
  const lean = P.lean, br = P.breath;
  torso.position.copy(PELVIS);
  torso.rotation.set(-lean, P.torsoYaw, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + lean * 0.5, P.headYaw, P.headRoll, 'YXZ');
  torso.updateMatrixWorld(true);
  const shL = torso.localToWorld(V(-0.15, 0.315 + P.shrug, 0.0)), shR = torso.localToWorld(V(0.15, 0.315 + P.shrug, 0.0));
  const restR = V(0.28, DESK_Y + 0.045, 0.2), restL = V(-0.12, DESK_Y + 0.045, 0.22);
  let hL = restL, hR = restR;
  // hook: the right hand reaches across and knocks the mug, then flinches back
  const reach = Math.sin(Math.PI * remap(t, 0.0, 0.42));
  hR = vl(restR, V(0.41, DESK_Y + 0.06, 0.08), t < 0.42 ? reach : 0);
  if (t > 0.42) hR = vl(V(0.3, DESK_Y + 0.07, 0.24), restR, sm(remap(t, 0.42, 1.0)));
  // S5: right the mug (hand follows the mug's top), then open the notebook and write (accepted actions)
  if (t >= T.mugA) {
    const mugTop = mug.localToWorld(V(0, 0.06, 0));
    const k = sm(remap(t, T.mugA, T.mugA + 0.45)) * (1 - sm(remap(t, T.mugB, T.mugB + 0.4)));
    hR = vl(restR, mugTop, k);
  }
  if (t >= T.openA - 0.25) {
    const edge = coverPivot.localToWorld(V(NB.w * 0.95, 0.03, 0.05));
    const k = sm(remap(t, T.openA - 0.25, T.openA)) * (1 - sm(remap(t, T.openB, T.openB + 0.35)));
    const rest2 = notebook.localToWorld(V(-NB.w * 0.62, 0.035, 0.07));
    hL = vl(vl(restL, rest2, sm(remap(t, T.openB, T.openB + 0.35))), edge, k);
  }
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
  const penRest = V(0.37, DESK_Y + 0.006, 0.17);
  if (t >= T.pencilA + 0.5) { pencil.position.copy(aR.end).add(V(-0.012, -0.02, -0.02)); pencil.rotation.set(-0.9, 0.2, 0.55); }
  else { pencil.position.copy(penRest); pencil.rotation.set(Math.PI / 2, 0, 1.1); }
  // the shirt print sits on the back (torso local +z)
  shirtPrint.position.set(0, 0.24, 0.103); shirtPrint.rotation.set(0, 0, 0);
}
torso.add(shirtPrint);

// room-mates: task pose (reality) vs facing the performer (imagined)
const TASK = {
  read: { hands: [V(-0.1, 0.24, -0.3), V(0.1, 0.24, -0.3)], pitch: -0.6, yaw: 0 },
  phone: { hands: [V(-0.12, 0.1, -0.3), V(0.03, 0.26, -0.26)], pitch: -0.65, yaw: 0.05 },
  laptop: { hands: [V(-0.08, 0.1, -0.42), V(0.08, 0.1, -0.42)], pitch: -0.35, yaw: 0 },
  tea: { hands: [V(-0.13, 0.1, -0.3), V(0.08, 0.3, -0.24)], pitch: 0.0, yaw: -0.8 },
};
const SIDE = [V(-0.13, 0.1, -0.32), V(0.13, 0.1, -0.32)];   // imagined: hands flat on the table, staring
function setPeople(t, camYaw) {
  const im = imagined(t);
  // prediction beat: two of four "would remember" (halos stay bright), the other two dim
  const pred = sm(remap(t, T.predict, T.predict + 0.4));
  // reality: only one of four actually glances over (about a quarter)
  const gl = Math.sin(Math.PI * remap(t, T.glance, T.glance + 1.3));
  PEOPLE.forEach((p, i) => {
    const task = TASK[p.id];
    // yaw toward the performer when imagined
    const toP = HEAD_W.clone().sub(p.pos); const want = Math.atan2(-toP.x, -toP.z);
    let dy = want - p.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI;
    const turn = sm(remap(im, 0, 1));
    p.g.rotation.y = p.yaw + dy * turn * 0.35;
    // head aim at the performer in group space
    const hw = HEAD_W.clone(); p.g.updateMatrixWorld(true); const hl = p.g.worldToLocal(hw).sub(V(0, p.hipY + 0.55, 0));
    const aimYaw = Math.atan2(-hl.x, -hl.z), aimPitch = Math.atan2(hl.y, Math.hypot(hl.x, hl.z));
    const isGlancer = p.id === 'laptop';
    const glY = isGlancer ? (aimYaw - task.yaw) * gl : 0, glP = isGlancer ? (aimPitch - task.pitch) * gl : 0;
    p.headG.rotation.set(lerp(task.pitch + 0.03 * Math.sin(t * 1.3 + i), aimPitch, turn) + glP,
      lerp(task.yaw, aimYaw, turn) + glY, 0, 'YXZ');
    p.body.rotation.y = 0;
    p.body.scale.y = 1 + 0.008 * Math.sin(t * 1.5 + i * 1.7);
    // tint: lavender while imagined
    p.mat.color.set(PERSON.body).lerp(new THREE.Color(PERSON.imagined), im * 0.85);
    p.mat.emissiveIntensity = 0.16 * im;
    // arms: task pose <-> hanging at the sides while staring
    p.body.updateMatrixWorld(true);
    p.arms.forEach((a, k) => {
      let tgt = vl(task.hands[k], SIDE[k], turn);
      if (p.id === 'laptop' && turn < 0.5) tgt = tgt.clone().add(V(0, 0.008 * Math.abs(Math.sin(t * 9 + k * 1.7)), 0));   // typing
      if (p.id === 'tea' && k === 1) tgt = vl(tgt, V(0.04, 0.47, -0.14), (1 - turn) * sm(Math.max(0, Math.sin(t * 0.9 - 1.2))));   // sips now and then
      const sh = V(a.sx * 0.145, 0.31, 0);
      const r = ik(sh, tgt, 0.24, 0.225, V(a.sx * 0.6, -0.8, 0.3));
      a.sh.position.copy(sh); a.el.position.copy(r.mid); a.ha.position.copy(r.end);
      setSeg(a.ua, sh, r.mid); setSeg(a.fa, r.mid, r.end);
      a.end = r.end;
    });
    // halo: imagined attention; in the prediction beat only "read" and "laptop" (2 of 4) keep it; reality: only the glancer, briefly
    const keep = p.id === 'read' || p.id === 'laptop';
    const hv = im * (keep ? 1 : 1 - 0.8 * pred) + (isGlancer ? 0.9 * gl : 0);
    p.headG.updateMatrixWorld(true);
    const hp = p.headG.localToWorld(V(0, 0.2, 0));
    p.halo.position.copy(hp); p.halo.visible = hv > 0.01; p.halo.material.opacity = clamp(hv);
    const hs = 1 + 0.15 * (keep ? pred * im : 0); p.halo.scale.set(hs, hs, 1);
    // label: what they are actually busy with (appears on "baaki log apne kaamon mein..."); pulses as the performer looks
    const li = sm(remap(t, T.labels + i * 0.45, T.labels + i * 0.45 + 0.35)) * (1 - sm(remap(t, S.s5 - 0.2, S.s5 + 0.2)));
    const pulse = Math.sin(Math.PI * remap(t, LOOK[p.id], LOOK[p.id] + 0.5));
    p.lab.position.copy(p.headG.localToWorld(V(0, -0.02, 0))).add(V(Math.cos(camYaw) * 0.24, 0.0, -Math.sin(camYaw) * 0.24));
    p.lab.rotation.set(0, camYaw, 0);
    p.lab.scale.setScalar(1.35 * lerp(0.6, 1, li) * (1 + 0.15 * pulse));
    // never show a label cut by the frame edge: fade it as its screen box nears the 90 px side margins
    p.lab.updateMatrixWorld(true);
    const labHalf = 0.13;   // label half-width in label space (scale is in matrixWorld)
    const xl = V(-labHalf, 0, 0).applyMatrix4(p.lab.matrixWorld).project(camera).x, xr = V(labHalf, 0, 0).applyMatrix4(p.lab.matrixWorld).project(camera).x;
    const px0 = (Math.min(xl, xr) + 1) / 2 * W, px1 = (Math.max(xl, xr) + 1) / 2 * W;
    const edge = sm(remap(px0, 70, 130)) * sm(remap(W - px1, 70, 130));
    const lv = li * edge;
    p.lab.visible = lv > 0.003;
    p.lab.userData.body.material.opacity = lv; p.lab.userData.txt.material.opacity = lv;
  });
  // props follow the hands
  const rd = BY.read, ph = BY.phone, te = BY.tea;
  papers.position.copy(rd.body.localToWorld(V(0, 0.32, -0.32))); papers.quaternion.copy(rd.body.getWorldQuaternion(new THREE.Quaternion())).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.95, 0, 0)));
  papers.visible = true;
  phone.position.copy(ph.body.localToWorld(ph.arms[1].end.clone().add(V(0, 0.05, -0.02))));
  phone.quaternion.copy(ph.body.getWorldQuaternion(new THREE.Quaternion())).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.6, 0, 0)));
  cup.position.copy(te.body.localToWorld(te.arms[1].end.clone().add(V(0.0, 0.03, -0.03))));
  cup.rotation.set(0, te.g.rotation.y, 0);
}

function setSpot(t) {
  const im = imagined(t);
  spot.intensity = 26 * im;
  cone.material.opacity = 0.075 * im;
  floorGlow.material.opacity = 0.5 * im;
  const dim = 1 - 0.5 * im;
  hemi.intensity = BASE_LIGHT.hemi * dim; key.intensity = BASE_LIGHT.key * (1 - 0.6 * im);
  fill.intensity = BASE_LIGHT.fill * dim; front.intensity = BASE_LIGHT.front * dim;
  scene.background.copy(BG0).lerp(BG1, im);
  shirtPrint.visible = t >= T.shirt;
  const sp = eout(remap(t, T.shirt, T.shirt + 0.35)); shirtPrint.scale.setScalar(Math.max(0.001, sp));
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 rear 3/4 medium (accepted framing): the hand knocks the mug; the spotlight snaps on
  { a: S.s1, b: S.s2, k0: [V(0.08, 1.24, 0.36), 30, 13, 4.6, 26], k1: [V(0.06, 1.24, 0.34), 26, 12, 4.3, 26] },
  // S2 high wide from behind-left: the imagined audience, all staring at the performer under the spotlight
  { a: S.s2, b: S.s3, k0: [V(0.0, 1.22, -0.6), -24, 26, 6.6, 30], k1: [V(0.0, 1.22, -0.6), -18, 25, 6.2, 30] },
  // S3 over the performer's right shoulder toward the room-mates: the study, "half would remember", reality: one glances
  { a: S.s3, b: S.s4, k0: [V(0.0, 1.0, -1.0), 16, 12, 4.4, 30], k1: [V(0.0, 1.0, -1.0), 10, 11, 4.1, 30] },
  // S4 dolly left -> right behind the performer: what each person is busy with; then a pull-back as the performer looks around
  { a: S.s4, b: S.s5, k0: [V(-0.6, 1.02, -1.7), -12, 17, 3.5, 30], k1: [V(0.6, 1.02, -1.7), 12, 17, 3.5, 30], m: [S.s4, T.ask - 0.1], ease: 'sine',
    k2: [V(0.0, 1.0, -1.1), 2, 16, 5.4, 30] },
  // S5 wide calm room (accepted staging): the mug is set upright, back to the notebook, lock-up
  { a: S.s5, b: S.end, k0: [V(0.0, 1.3, -0.3), 6, 15, 5.6, 30], k1: [V(-0.02, 1.48, -0.35), 9, 18, 7.0, 30] },
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
  // "card" = the visible Hindi labels (the crucial in-scene text in this episode)
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const labs = LABEL_OBJS.filter(o => o.visible).map(screenBox).filter(onScreen);
  const r = { t, card: labs.length ? [Math.min(...labs.map(b => b[0])), Math.min(...labs.map(b => b[1])), Math.max(...labs.map(b => b[2])), Math.max(...labs.map(b => b[3]))] : null,
    head: screenBox(head), mug: screenBox(mug), notebook: screenBox(notebook), desk: screenBox(deskTop),
    mates: unionBox(PEOPLE.map(p => p.headG)), halos: unionBox(PEOPLE.map(p => p.halo)) };
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
const C2 = 76, C1 = 92;    // two-line / one-line sizes (Devanagari needs line-height 1.16 inside the 180 px band)
const CAPS = [
  { a: -1, b: S.s2 - 0.05, size: C2, lines: [[sg('कुछ गिरा,'), sg(' और लगा कि', hookSplit - 0.05)], [sg('सब आपको ही देख रहे हैं?', hookSplit + 0.45)]] },
  { a: TL.name.start - 0.06, b: S.s3 - 0.05, size: C2, lines: [[sg(`इसे ${hl('स्पॉटलाइट इफ़ेक्ट')}`)], [sg('कहते हैं।')]] },
  { a: TL.study.start - 0.06, b: studySplit - 0.12, size: C2, lines: [[sg('एक अध्ययन में, अटपटी')], [sg('टी-शर्ट पहने छात्रों ने सोचा,')]] },
  { a: studySplit - 0.06, b: TL.real.start - 0.12, size: C2, lines: [[sg(`${hl('आधे लोग')} शर्ट`)], [sg('याद रखेंगे।')]] },
  { a: TL.real.start - 0.06, b: S.s4 - 0.05, size: C2, lines: [[sg('असल में, सिर्फ़ क़रीब')], [sg(`${hl('एक-चौथाई')} को याद रहा।`)]] },
  { a: TL.why.start - 0.06, b: whySplit - 0.12, size: C2, lines: [[sg('हम अपनी नज़र से')], [sg('देखते हैं,')]] },
  { a: whySplit - 0.06, b: TL.ask.start - 0.12, size: C2, lines: [[sg('पर बाकी लोग अपने')], [sg(`${hl('कामों में लगे')} होते हैं।`)]] },
  { a: TL.ask.start - 0.06, b: S.s5 - 0.05, size: C2, lines: [[sg('अगली बार पूछिए:'), sg(' ये लोग', askSplit - 0.04)], [sg(`असल में ${hl('किसमें व्यस्त हैं?')}`, askSplit + 0.3)]] },
  { a: TL.qual.start - 0.06, b: qualSplit - 0.12, size: C1, lines: [[sg('शर्म आना सामान्य है,')]] },
  { a: qualSplit - 0.06, b: TL.cta.start - 0.2, size: C2, lines: [[sg('पर शायद किसी ने उतना')], [sg('ध्यान नहीं दिया।')]] },
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
  setMug(t);
  placeFigure(t, P);
  setCamera(t);
  setPeople(t, Math.atan2(camera.position.x, camera.position.z));
  setSpot(t);
  ink.forEach((ln, i) => {
    const w = t - T.writeA - i * 0.85, k = clamp(w / 0.85);
    ln.scale.x = Math.max(0.0001, 0.06 * k); ln.position.x = NB.w * 0.18 + 0.03 * k;
    ln.visible = w > 0;
  });
  lampLight.intensity = 0.35 * sm(remap(t, S.s5 - 0.2, S.s5 + 1.5));
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
window.__fontCheck = { tiro: document.fonts.check('400 100px "Tiro Devanagari Hindi"', 'स्पॉटलाइट'), instrument: document.fonts.check('400 100px "Instrument Serif"') };
// redraw the Hindi label textures now that the Devanagari font is present
for (const p of PEOPLE) {
  const { canvas: c, g: ctx } = p.lab.userData.tx;
  ctx.clearRect(0, 0, c.width, c.height);
  let s = 190; ctx.font = `400 ${s}px "Tiro Devanagari Hindi"`;
  while (ctx.measureText(p.lab.userData.label).width > c.width - 70) { s -= 4; ctx.font = `400 ${s}px "Tiro Devanagari Hindi"`; }
  ctx.fillStyle = '#17122E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(p.lab.userData.label, c.width / 2, c.height * 0.56);
  p.lab.userData.tx.tex.needsUpdate = true;
}
renderAt(0);
window.ready = true;
