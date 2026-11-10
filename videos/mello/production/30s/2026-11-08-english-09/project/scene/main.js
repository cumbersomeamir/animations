// Mello 30 s english09-01 (English): "the peak-end rule" - end the workday on one meaningful finished task
// (Redelmeier & Kahneman 1996; Fredrickson & Kahneman 1993; Redelmeier, Katz & Kahneman 2003). Same accepted style recipe
// and renderer as the latest accepted episodes ("Thoughts in a Quiet Room": sparse clean 3D miniature, one abstract faceless
// performer, soft contact shadows, white/pale-gray stage, lavender #D9BCF5 only as the highlight; English captions in
// Instrument Serif). Room, desk props, rig, camera helper, caption mechanics, cards and the oriented-box safe-zone audit are
// carried over from ../../2026-11-07-english-08/project; the laptop prop from ../../2026-11-06-english-06/project.
// New for this episode: a "day out" mood-line card (a long low queue, a peak, a good end) where only the peak and the end
// stay lit as the memory, a schematic of a standard vs a gentler ending with a "remembered" bar, and a to-do list on the
// laptop where the last meaningful task is checked off, the loop closes and the lid shuts.
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
const PS = l => TL[l].pauses;
const longest = l => (PS(l).length ? PS(l).reduce((a, b) => (b[1] - b[0] > a[1] - a[0] ? b : a)) : [TL[l].end, TL[l].end]);
const SPL = l => longest(l)[1];   // end of the longest internal pause = start of the line's second phrase
const hookSplit = SPL('hook'), nameSplit = SPL('name'), studySplit = SPL('study'), qualSplit = SPL('qual'), tipSplit = SPL('tip'), closeSplit = SPL('close');
// word starts measured with faster-whisper word timestamps on generated/narration.wav (see notes): "yet you remember" 1.41,
// "peak-end rule" 3.73, "most intense moment" 5.97, "and the ending" 7.51, "gentler final minutes" 10.05, "made patients remember"
// 11.23, "less unpleasant" 13.75, "but endings carry weight" 16.97, "finishing" 19.81, "meaningful task" 21.05, "close the laptop" 23.63
const S = { s1: 0.0, s2: 3.15, s3: 8.45, s4: 18.45, s5: 25.75, end: 30.0 };
const T = {
  draw: 0.0, queueDone: 1.15, peakAt: 1.95, drawEnd: 2.65,        // the day draws itself: queue, then the peak, then a good end
  title: TL.name.start + 0.3, dim: TL.name.start + 0.9, peak: TL.name.start + 2.55, endP: TL.name.start + 4.1,
  morph: TL.study.start + 0.05, rowA: TL.study.start + 0.45, rowB: studySplit - 0.05, bars: TL.study.start + 2.65, less: TL.study.start + 5.1,
  weight: qualSplit - 0.05,                                       // "but endings carry weight"
  cardOut: S.s4 - 0.1,
  type: TL.tip.start + 0.6, check: TL.tip.start + 2.35, done: TL.tip.start + 2.95,   // "finishing one small, meaningful task"
  loop: TL.close.start, lidA: closeSplit + 0.05, lidB: TL.close.end - 0.05,        // "close the loop, then close the laptop"
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





// ---------------------------------------------------------------- episode props: memory card, evidence schematic, laptop to-do list
const lavender = new THREE.Color('#D9BCF5');
const INK = '#17122E', NAVY = '#1C1733', CREAM = '#F6F1E6', PEACH = '#F0D2A6', PEACH_D = '#E9B984';
const UI = '"Inter", sans-serif', SERIF = '"Instrument Serif", serif';
function rr(g, x, y, w, h, r, fill, stroke, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function check(g, x, y, s, col, lw) { g.strokeStyle = col; g.lineWidth = lw || s * 0.16; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 0.35, y + s * 0.35); g.lineTo(x + s, y - s * 0.4); g.stroke(); }
function star(g, cx, cy, r, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); } g.closePath(); g.fill(); }

// laptop with a canvas screen (from english06), here a stylised to-do list
function makeLaptop(cw = 1240, ch = 760) {
  const g = new THREE.Group();
  g.add(mesh(new RoundedBoxGeometry(0.38, 0.014, 0.25, 2, 0.004), M.lamp));
  const kb = mesh(new THREE.PlaneGeometry(0.33, 0.12), std('#E9E6EE', 0.8), false, true); kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.0075, -0.02); g.add(kb);
  const pad = mesh(new THREE.PlaneGeometry(0.11, 0.06), std('#EFECF2', 0.6), false, true); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.0076, 0.085); g.add(pad);
  const lid = new THREE.Group(); lid.position.set(0, 0.007, -0.125); g.add(lid);
  const lidM = mesh(new RoundedBoxGeometry(0.38, 0.245, 0.009, 2, 0.004), M.lamp); lidM.position.y = 0.1225; lid.add(lidM);
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.2145), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  scr.position.set(0, 0.1225, 0.0052); lid.add(scr);
  lid.rotation.x = -0.3;
  scene.add(g);
  return { g, lid, scr, c, ctx: c.getContext('2d'), tex, key: '' };
}
const LAP = makeLaptop();
LAP.g.position.set(0.02, DESK_Y, 0.1);
blob(0.5, 0.36, 0.45, DESK_Y + 0.002).position.set(0.02, DESK_Y + 0.002, 0.08);
function drawTodo(t) {
  const L = LAP, g = L.ctx, cw = L.c.width, ch = L.c.height;
  const ck = eout(remap(t, T.check, T.check + 0.3)), dn = sm(remap(t, T.done, T.done + 0.3)), lp = eio(remap(t, T.loop, T.loop + 0.6));
  const key = [ck, dn, lp].map(x => x.toFixed(3)).join('|'); if (key === L.key) return; L.key = key;
  g.fillStyle = '#FBFAFD'; g.fillRect(0, 0, cw, ch); g.fillStyle = '#EEE8F8'; g.fillRect(0, 0, cw, 86);
  ['#E8B7B0', '#EED9A6', '#BFD9C4'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(40 + i * 34, 43, 11, 0, Math.PI * 2); g.fill(); });
  g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#2A2440'; g.font = `600 46px ${UI}`; g.fillText('Today', 160, 45);
  const rows = [['Reply to Sam', 1], ['Fix the slides', 1], ['Send the proposal', ck]];
  rows.forEach(([txt, done], i) => {
    const y = 190 + i * 150;
    if (i === 2 && ck > 0) rr(g, 30, y - 62, cw - 60, 124, 30, `rgba(217,188,245,${0.55 * ck})`);
    g.strokeStyle = '#8E86AE'; g.lineWidth = 6; g.beginPath(); g.arc(90, y, 34, 0, Math.PI * 2); g.stroke();
    if (done > 0) { g.globalAlpha = done; g.fillStyle = i === 2 ? '#B98EEA' : '#CFC6E3'; g.beginPath(); g.arc(90, y, 34, 0, Math.PI * 2); g.fill(); check(g, 72, y + 2, 38, INK, 8); g.globalAlpha = 1; }
    g.fillStyle = done >= 1 && i < 2 ? '#9A94B2' : INK; g.font = `${i === 2 ? 600 : 500} 64px ${UI}`; g.fillText(txt, 160, y + 2);
    if (i < 2) { g.fillStyle = '#B9B3CB'; g.fillRect(160, y + 2, g.measureText(txt).width, 4); }
  });
  if (dn > 0) { g.globalAlpha = dn; rr(g, 330, 610, 580, 104, 52, NAVY); g.fillStyle = CREAM; g.font = `600 52px ${UI}`; g.textAlign = 'center'; g.fillText('Done for today', 620, 664); g.textAlign = 'left'; g.globalAlpha = 1; }
  if (lp > 0) { g.strokeStyle = '#B98EEA'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.ellipse(620, 420, 600, 330, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lp); g.stroke(); }
  L.tex.needsUpdate = true;
}

// ---------------------------------------------------------------- the memory card (S1-S3)
function makeCard(w, h) {
  const g = new THREE.Group();
  const border = mesh(new RoundedBoxGeometry(w + 0.03, h + 0.03, 0.01, 3, 0.02), std('#D9BCF5', 0.45, { transparent: true, emissive: lavender.clone(), emissiveIntensity: 0.12 }), false, false);
  border.position.z = -0.006; g.add(border);
  const panel = mesh(new RoundedBoxGeometry(w, h, 0.012, 3, 0.016), std('#FBF8F0', 0.9, { transparent: true }), false, false); g.add(panel);
  g.userData = { border, panel }; scene.add(g); return g;
}
function cardCanvas(card, w, h, cw, ch) {
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  m.position.z = 0.0075; m.renderOrder = 5; card.add(m); return { c, g: c.getContext('2d'), t, m, key: '' };
}
const CARD_POS = V(-0.374, 1.32, 0.3);
const card = makeCard(0.7, 0.52); const cardTx = cardCanvas(card, 0.68, 0.505, 1220, 906);
// the day: x in [0,1] -> mood (canvas y; smaller = better). A long low queue, a peak, a good end.
const X0 = 70, X1 = 1150;
function moodY(u) {
  if (u < 0.55) return 610 + 10 * Math.sin(u * 40);                       // queueing: low and flat
  if (u < 0.75) { const k = (u - 0.55) / 0.2; return 610 - 310 * Math.sin(k * Math.PI / 2) ** 2; }   // up to the peak
  if (u < 0.86) { const k = (u - 0.75) / 0.11; return 300 + 170 * sm(k); }  // back down a little
  const k = (u - 0.86) / 0.14; return 470 - 110 * sm(k);                    // a good ending
}
const drawU = t => (t < T.queueDone ? lerp(0.16, 0.55, eout(remap(t, T.draw, T.queueDone))) : t < T.peakAt ? 0.55 + 0.2 * eio(remap(t, T.queueDone, T.peakAt)) : 0.75 + 0.25 * eio(remap(t, T.peakAt, T.drawEnd)));
function drawCard(t) {
  const u = drawU(t), ti = sm(remap(t, T.title, T.title + 0.3)), dim = sm(remap(t, T.dim, T.dim + 0.6));
  const pk = sm(remap(t, T.peak, T.peak + 0.35)), en = sm(remap(t, T.endP, T.endP + 0.35)), m = sm(remap(t, T.morph, T.morph + 0.45));
  const ra = sm(remap(t, T.rowA, T.rowA + 0.4)), rb = sm(remap(t, T.rowB, T.rowB + 0.4)), br = eio(remap(t, T.bars, T.bars + 0.7)), ls = sm(remap(t, T.less, T.less + 0.3)), wt = sm(remap(t, T.weight, T.weight + 0.35));
  const shuffle = Math.floor(t * 6);
  const key = [u, ti, dim, pk, en, m, ra, rb, br, ls, wt].map(x => x.toFixed(3)).join('|') + '|' + (t < T.dim ? shuffle : 0);
  if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle'; g.textAlign = 'left';
  if (m < 1) {
    g.globalAlpha = 1 - m;
    // header: "a day out" -> the name
    if (ti < 1) { g.globalAlpha = (1 - m) * (1 - ti); g.fillStyle = INK; g.font = `400 92px ${SERIF}`; g.fillText('a day out', 44, 78); }
    if (ti > 0) { g.globalAlpha = (1 - m) * ti; g.font = `400 84px ${SERIF}`; const w = g.measureText('the peak-end rule').width + 64; rr(g, 610 - w / 2, 22, w, 112, 30, '#D9BCF5'); g.fillStyle = INK; g.textAlign = 'center'; g.fillText('the peak-end rule', 610, 80); g.textAlign = 'left'; }
    g.globalAlpha = 1 - m;
    // baseline + the mood line, drawn up to u
    g.fillStyle = '#E2DCEB'; g.fillRect(X0, 760, X1 - X0, 5);
    const pts = []; for (let i = 0; i <= 160; i++) { const v = i / 160 * u; pts.push([X0 + (X1 - X0) * v, moodY(v)]); }
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.globalAlpha = (1 - m) * (1 - 0.72 * dim); g.strokeStyle = '#7E7A9C'; g.lineWidth = 14; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    // the queue: little waiting figures that shuffle, and its length
    const qa = (1 - m) * (1 - 0.72 * dim);
    for (let i = 0; i < 9; i++) { const x = X0 + 40 + i * 62 + (i % 2 ? 4 : -4) * ((shuffle + i) % 2), vis = clamp((u * (X1 - X0) + X0 - x) / 40);
      if (vis <= 0) continue; g.globalAlpha = qa * vis; g.fillStyle = '#B9B3CB'; g.beginPath(); g.arc(x, 664, 15, 0, Math.PI * 2); g.fill(); rr(g, x - 16, 684, 32, 52, 14, '#B9B3CB'); }
    if (u > 0.3) { g.globalAlpha = qa * clamp((u - 0.3) * 6); g.fillStyle = '#5E577E'; g.font = `500 54px ${UI}`; g.fillText('40-min queue', X0, 830); }
    // peak and end: lit as "what you remember"
    const pkx = X0 + (X1 - X0) * 0.75, enx = X1, pky = moodY(0.75), eny = moodY(1);
    if (u >= 0.75) { g.globalAlpha = 1 - m; star(g, pkx, pky, 34 + 18 * pk, '#B98EEA'); }
    if (u >= 0.999) { g.globalAlpha = 1 - m; g.fillStyle = '#B98EEA'; g.beginPath(); g.arc(enx, eny, 22 + 10 * en, 0, Math.PI * 2); g.fill(); }
    const pill = (txt, x, y, a) => { if (a <= 0) return; g.globalAlpha = (1 - m) * a; g.font = `400 80px ${SERIF}`; const w = g.measureText(txt).width + 56; rr(g, x - w / 2, y - 52, w, 104, 28, '#E7DAF8'); g.fillStyle = INK; g.textAlign = 'center'; g.fillText(txt, x, y + 2); g.textAlign = 'left'; };
    pill('peak', pkx, pky - 100, pk); pill('end', enx - 70, eny - 100, en);
    if (dim > 0.3) { g.globalAlpha = (1 - m) * sm((dim - 0.3) / 0.7); g.fillStyle = '#5E577E'; g.font = `500 52px ${UI}`; g.textAlign = 'right'; g.fillText('what you remember', X1, 880); g.textAlign = 'left'; }
    g.globalAlpha = 1;
  }
  if (m > 0) {   // schematic: a standard vs a gentler ending, and how unpleasant it is remembered (direction only)
    g.globalAlpha = m; g.fillStyle = INK; g.font = `400 84px ${SERIF}`; g.fillText('discomfort over time', 44, 76);
    g.fillStyle = '#5E577E'; g.font = `500 50px ${UI}`; g.textAlign = 'right'; g.fillText('in memory', 1176, 150); g.textAlign = 'left';
    const row = (y0, label, tail, a, barW) => {
      if (a <= 0) return; g.globalAlpha = m * a;
      g.fillStyle = INK; g.font = `400 72px ${SERIF}`; g.fillText(label, 44, y0 - 60);
      const xa = 60, xb = 640, xt = 820, f = u2 => y0 + 150 - 110 * Math.exp(-((u2 - 0.55) ** 2) / 0.05) - 30;
      g.strokeStyle = '#7E7A9C'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath();
      for (let i = 0; i <= 40; i++) { const u2 = i / 40, x = xa + (xb - xa) * u2; const y = f(u2) - (u2 > 0.8 ? 40 * (u2 - 0.8) / 0.2 : 0); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      if (tail) { g.strokeStyle = '#B98EEA'; g.lineWidth = 14; g.beginPath(); g.moveTo(xb, f(1) - 40); g.quadraticCurveTo(xb + 90, f(1) + 10, xt, y0 + 140); g.stroke();
        if (wt > 0) { g.globalAlpha = m * wt; rr(g, xb - 20, y0 + 40, xt - xb + 60, 140, 30, null, '#B98EEA', 6); g.globalAlpha = m * a; } }
      rr(g, 900, y0 + 70, 260, 50, 25, '#EFEAF6'); rr(g, 900, y0 + 70, Math.max(30, 260 * barW * br), 50, 25, tail ? '#B98EEA' : '#9A94B2');
    };
    row(330, 'standard ending', false, ra, 0.82);
    row(640, 'gentler final minutes', true, rb, lerp(0.82, 0.62, ls));
    if (wt > 0) { g.globalAlpha = m * wt; g.font = `400 72px ${SERIF}`; const w = g.measureText('endings carry weight').width + 56; rr(g, 610 - w / 2, 800, w, 96, 28, '#D9BCF5'); g.fillStyle = INK; g.textAlign = 'center'; g.fillText('endings carry weight', 610, 850); g.textAlign = 'left'; }
    g.globalAlpha = 1;
  }
  tex.needsUpdate = true;
}


// ---------------------------------------------------------------- choreography (seated throughout)
const PELVIS = V(0, 0.64, 0.7);
const kbPt = (sx, dz = 0) => LAP.g.localToWorld(V(sx * 0.07, 0.045, 0.045 + dz));
const padPt = () => LAP.g.localToWorld(V(0.0, 0.04, 0.09));
function lidAngle(t) { return lerp(-0.3, 1.5, eio(remap(t, T.lidA, T.lidB))); }
function pose(t) {
  const P = {};
  P.breath = Math.sin(t * 2 * Math.PI / 4.2);
  P.lean = track(t, [[0, 0.18], [S.s4 - 0.3, 0.18], [S.s4, 0.24], [T.lidB, 0.24], [T.lidB + 0.8, 0.02], [30, 0.0]]);
  P.headPitch = track(t, [[0, -0.1], [S.s4 - 0.3, -0.1], [S.s4, -0.42], [T.lidB, -0.42], [T.lidB + 0.8, -0.05], [30, 0.02]]);
  P.headYaw = track(t, [[0, 0.32], [S.s4 - 0.3, 0.32], [S.s4, 0], [30, 0]]);
  P.torsoYaw = P.headYaw * 0.2;
  return P;
}
function placeFigure(t, P) {
  const lean = P.lean, br = P.breath;
  torso.position.copy(PELVIS);
  torso.rotation.set(-lean, P.torsoYaw, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + lean * 0.5, P.headYaw, 0, 'YXZ');
  torso.updateMatrixWorld(true);
  const shL = torso.localToWorld(V(-0.15, 0.315, 0.0)), shR = torso.localToWorld(V(0.15, 0.315, 0.0));
  const typing = (sx, k) => kbPt(sx).add(V(0.006 * Math.sin(t * 23 + k), 0.008 * Math.abs(Math.sin(t * 17 + 2 * k)), 0));
  const restL = kbPt(-1, 0.12).add(V(-0.07, -0.005, 0.0)), restR = kbPt(1, 0.12).add(V(0.07, -0.005, 0.0));
  let hL = restL.clone(), hR = restR.clone();
  // S4: type, click the last task done, then close the lid with the right hand, then rest back
  const ty = sm(remap(t, T.type - 0.3, T.type)) * (1 - sm(remap(t, T.check - 0.45, T.check - 0.2)));
  hL = vl(hL, typing(-1, 0), ty); hR = vl(hR, typing(1, 1.3), ty);
  const click = sm(remap(t, T.check - 0.4, T.check - 0.15)) * (1 - sm(remap(t, T.done + 0.2, T.done + 0.5)));
  hR = vl(hR, padPt().add(V(0, 0.012 * (1 - Math.sin(Math.PI * remap(t, T.check - 0.12, T.check + 0.1))), 0)), click);
  const lidTop = LAP.lid.localToWorld(V(0.06, 0.24, 0.02));
  const lk = sm(remap(t, T.lidA - 0.35, T.lidA)) * (1 - sm(remap(t, T.lidB + 0.05, T.lidB + 0.4)));
  hR = vl(hR, lidTop, lk);
  const back = sm(remap(t, T.lidB + 0.2, T.lidB + 0.8));
  hL = vl(hL, V(-0.16, DESK_Y + 0.04, 0.3), back); hR = vl(hR, V(0.18, DESK_Y + 0.04, 0.3), back * (1 - lk));
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
}
function setProps(t) {
  notebook.position.set(-0.42, DESK_Y + NB.h / 2 + 0.001, 0.02); notebook.rotation.set(0, -0.15, 0); coverPivot.rotation.z = 0; notebook.updateMatrixWorld(true);
  nbBlob.position.set(-0.4, DESK_Y + 0.003, 0.04); nbBlob.material.opacity = 0.55;
  ink.forEach(ln => { ln.visible = false; });
  pencil.position.set(-0.26, DESK_Y + 0.006, 0.22); pencil.rotation.set(Math.PI / 2, 0, 1.2);
  LAP.lid.rotation.x = lidAngle(t);
  drawTodo(t);
}
function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  const v = (t < 0.01 ? 1 : 1) * (1 - sm(remap(t, T.cardOut - 0.3, T.cardOut)));
  card.visible = v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0);
  card.scale.setScalar(0.88);
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v * 0.95; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 close in front of the memory card: the day draws itself (the queue, the peak, the end)
  { a: S.s1, b: S.s2, k0: [V(-0.36, 1.31, 0.3), -20, 4, 2.95, 30], k1: [V(-0.36, 1.31, 0.3), -16, 4, 2.8, 30] },
  // S2 rear-left medium: the card beside the performer; only the peak and the end stay lit
  { a: S.s2, b: S.s3, k0: [V(-0.24, 1.14, 0.3), -21, 9, 4.0, 30], k1: [V(-0.23, 1.13, 0.3), -17, 8, 3.75, 30] },
  // S3 high rear-left, closer: the study schematic and "endings carry weight"
  { a: S.s3, b: S.s4, k0: [V(-0.35, 1.27, 0.3), -32, 17, 3.4, 30], k1: [V(-0.35, 1.27, 0.3), -27, 15, 3.2, 30] },
  // S4 steep right three-quarter onto the laptop: the last meaningful task, the loop closes, the lid shuts
  { a: S.s4, b: S.s5, k0: [V(0.11, 0.99, 0.06), 32, 44, 1.6, 30], k1: [V(0.11, 0.97, 0.06), 27, 46, 1.48, 30] },
  // S5 wide calm room (accepted staging), lock-up
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


// oriented box: projects the 8 corners of a mesh's own (local) bounding box, so camera-facing labels and cards are
// measured as drawn instead of by their inflated world-axis box
function screenBoxOriented(m) {
  m.updateMatrixWorld(true);
  if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
  const bb = m.geometry.boundingBox;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let i = 0; i < 8; i++) {
    const v = V(i & 1 ? bb.max.x : bb.min.x, i & 2 ? bb.max.y : bb.min.y, i & 4 ? bb.max.z : bb.min.z).applyMatrix4(m.matrixWorld).project(camera);
    const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1].map(Math.round);
}
const textBox = o => screenBoxOriented(o.userData.body || o.userData.border);
// head as a sphere: exact projected circle (world-axis boxes of a head right next to the camera are hugely inflated)
function sphereBox(obj, r) {
  const c = obj.getWorldPosition(V(0, 0, 0)), pc = c.clone().applyMatrix4(camera.matrixWorldInverse);
  if (pc.z > -camera.near) return null;   // behind the camera: not in the frame
  const v = c.clone().project(camera), R = r / (-pc.z * Math.tan(camera.fov * D2R / 2)) * (H / 2);
  const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
  return [x - R, y - R, x + R, y + R].map(Math.round);
}

function unionBox(objs) {
  const bs = objs.filter(o => o.visible).map(screenBox).filter(Boolean);
  if (!bs.length) return null;
  return [Math.min(...bs.map(b => b[0])), Math.min(...bs.map(b => b[1])), Math.max(...bs.map(b => b[2])), Math.max(...bs.map(b => b[3]))];
}

window.layoutReport = t => {
  renderAt(t);
  // crucial in-scene text: the memory card and the laptop's to-do list, each audited on its own
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const keep = b => (onScreen(b) ? b : null);
  const big = b => b && (b[2] - b[0]) * (b[3] - b[1]) > 40000;
  const scr = screenBoxOriented(LAP.scr);
  const r = { t, card: null, crucial: { card: card.visible ? keep(textBox(card)) : null, screen: (SHOTS.findIndex(x => t >= x.a && t < x.b) === 3) && LAP.lid.rotation.x < 0.0 && big(scr) ? keep(scr) : null },   // the to-do list is read only in S4, before the lid closes
    head: sphereBox(head, 0.12), desk: screenBox(deskTop) };
  const cb = capEl.getBoundingClientRect();
  r.caption = capEl.innerHTML && +capEl.style.opacity > 0.02 ? [cb.left, cb.top, cb.right, cb.bottom].map(Math.round) : null;
  const spans = [...capEl.querySelectorAll('.ln')].map(e => e.getBoundingClientRect());
  r.captionText = spans.length && r.caption ? [Math.min(...spans.map(b => b.left)), Math.min(...spans.map(b => b.top)), Math.max(...spans.map(b => b.right)), Math.max(...spans.map(b => b.bottom))].map(Math.round) : null;
  r.captionLines = spans.length;
  r.shot = SHOTS.findIndex(x => t >= x.a && t < x.b) + 1 || 5;
  return r;
};


// ---------------------------------------------------------------- captions (accepted English treatment: Instrument Serif, lavender highlight)
const hl = s => `<span class="hl">${s}</span>`;
const sg = (html, t = null) => ({ html, t });
const C2 = 96, C1 = 108;
const W_AS = TL.study.start + 4.85;
const CAPS = [
  { a: -1, b: TL.name.start - 0.12, size: C2, lines: [[sg('A long queue,')], [sg(`yet you remember a ${hl('great day out')}?`, hookSplit - 0.04)]] },
  { a: TL.name.start - 0.06, b: nameSplit - 0.12, size: C1, lines: [[sg(`That’s the ${hl('peak-end rule')}:`)]] },
  { a: nameSplit - 0.06, b: TL.study.start - 0.12, size: C2, lines: [[sg('we tend to remember the most')], [sg(`${hl('intense moment')} and the ${hl('ending')}.`, TL.name.start + 2.5)]] },
  { a: TL.study.start - 0.06, b: studySplit - 0.12, size: C1, lines: [[sg('In a medical study,')]] },
  { a: studySplit - 0.06, b: W_AS - 0.12, size: C2, lines: [[sg(`${hl('gentler final minutes')} made patients`)], [sg('remember the whole procedure', TL.study.start + 2.6)]] },
  { a: W_AS - 0.06, b: TL.qual.start - 0.12, size: C1, lines: [[sg(`as ${hl('less unpleasant')}.`)]] },
  { a: TL.qual.start - 0.06, b: TL.tip.start - 0.12, size: C2, lines: [[sg('It won’t decide every memory,')], [sg(`but ${hl('endings carry weight')}.`, qualSplit - 0.04)]] },
  { a: TL.tip.start - 0.06, b: TL.close.start - 0.12, size: C2, lines: [[sg('So end your workday by finishing')], [sg(`one small, ${hl('meaningful task')}.`, TL.tip.start + 1.4)]] },
  { a: TL.close.start - 0.06, b: TL.cta.start - 0.2, size: C2, lines: [[sg('Close the loop,')], [sg(`then ${hl('close the laptop')}.`, closeSplit - 0.04)]] },
  { a: TL.cta.start - 0.1, b: 99, size: C2, lines: [[sg('Take a mindful break')], [sg('with Mello.')]] },
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
  setProps(t);
  placeFigure(t, P);
  setCamera(t);
  setEpisode(t);
  lampLight.intensity = 0.0;
  setCaption(t);
  renderer.render(scene, camera);
}
window.renderAt = renderAt;
window.projectPoints = (t, pts) => { renderAt(t); return pts.map(([x, y, z]) => { const v = V(x, y, z).project(camera); return [Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * H)]; }); };
window.showGuides = on => { document.getElementById('guides').style.display = on ? 'block' : 'none'; };

await document.fonts.load('400 100px "Instrument Serif"');
await document.fonts.load('italic 400 100px "Instrument Serif"');
await document.fonts.load('500 30px "Inter"');
await document.fonts.load('600 30px "Inter"');
await document.fonts.ready;
await new Promise(r => { const im = document.getElementById('icon'); if (im.complete) r(); else im.onload = r; });
window.__fontCheck = { instrument: document.fonts.check('400 100px "Instrument Serif"'), inter: document.fonts.check('600 30px "Inter"') };
// redraw canvas textures now that the fonts are present
LAP.key = ''; cardTx.key = '';
renderAt(0);
window.ready = true;
