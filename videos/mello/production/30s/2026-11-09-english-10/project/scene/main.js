// Mello 30 s english10-01 (English): "how long a habit takes, and why one missed day doesn't derail it" (Lally, van Jaarsveld,
// Potts & Wardle 2010). Same accepted style recipe and renderer as the latest accepted episodes ("Thoughts in a Quiet Room":
// sparse clean 3D miniature, one abstract faceless performer, soft contact shadows, white/pale-gray stage, lavender #D9BCF5
// only as the highlight; English captions in Instrument Serif). Room, desk props, rig, camera helper, caption mechanics, cards
// and the oriented-box safe-zone audit are carried over from ../../2026-11-08-english-09/project; standing and walking from
// ../../2026-11-06-english-07/project. New for this episode: a "21 days?" calendar that crosses itself off, the study set-up
// (same context, one new daily action, 12 weeks), individual automaticity curves (18 ... 254 days, estimated), a week strip
// with one missed day, and the evening cue: the work bag goes down, then the walk.
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
const hookSplit = SPL('hook'), studySplit = SPL('study'), rangeSplit = SPL('range'), curveSplit = SPL('curve'), missedSplit = SPL('missed'), tipSplit = SPL('tip');
// word starts measured with faster-whisper word timestamps on generated/narration.wav (see notes): "not quite" 2.23,
// "people repeated" 4.43, "same context" 6.79, "after breakfast" 8.35, "eighteen" 12.34, "two hundred fifty-four" 13.04,
// "levels off" 16.66, "missing one day" 17.86, "didn't materially" 18.60, "just walk" 22.62, "after the same cue" 24.12
const S = { s1: 0.0, s2: 3.2, s3: 9.55, s4: 17.6, s5: 25.75, end: 30.0 };
const T = {
  cross: 0.0, crossEnd: 2.0, notQuite: TL.hook.start + 1.95,          // the 21 squares cross off; "not quite"
  study: TL.study.start + 0.05, cue: TL.study.start + 3.35, act: TL.study.start + 1.1, days0: TL.study.start + 1.5, days1: TL.study.end - 0.1,
  curves: TL.range.start + 0.2, curvesEnd: TL.range.start + 2.3, l18: TL.range.start + 2.55, l254: TL.range.start + 3.3,
  fast: TL.curve.start + 0.2, flat: curveSplit + 0.05,
  cardOut: S.s4 - 0.1,
  standA: S.s3 + 6.9, standB: S.s3 + 7.9,                            // the performer stands with the work bag (before the cut)
  week: TL.missed.start + 0.05, gap: TL.missed.start + 0.6, onward: missedSplit,
  weekOut: TL.tip.start + 1.2,
  bagA: TL.tip.start + 3.1, bagB: TL.tip.start + 3.75, cueLab: TL.tip.start + 3.5,   // "after the same cue": the bag goes down
  turnA: TL.tip.start + 3.8, walkA: TL.tip.start + 4.25,
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






// ---------------------------------------------------------------- episode props: cards, week strip, work bag
const lavender = new THREE.Color('#D9BCF5');
const INK = '#17122E', NAVY = '#1C1733', CREAM = '#F6F1E6', PEACH = '#F0D2A6', PEACH_D = '#E9B984';
const UI = '"Inter", sans-serif', SERIF = '"Instrument Serif", serif';
function rr(g, x, y, w, h, r, fill, stroke, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function check(g, x, y, s, col, lw) { g.strokeStyle = col; g.lineWidth = lw || s * 0.16; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 0.35, y + s * 0.35); g.lineTo(x + s, y - s * 0.4); g.stroke(); }
function cross(g, cx, cy, s, col, lw) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - s, cy - s); g.lineTo(cx + s, cy + s); g.moveTo(cx + s, cy - s); g.lineTo(cx - s, cy + s); g.stroke(); }
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
function pillTxt(g, txt, cx, cy, size, fill, a = 1) { if (a <= 0) return; g.globalAlpha = a; g.font = `400 ${size}px ${SERIF}`; const w = g.measureText(txt).width + size * 0.7; rr(g, cx - w / 2, cy - size * 0.66, w, size * 1.3, size * 0.34, fill); g.fillStyle = INK; g.textAlign = 'center'; g.fillText(txt, cx, cy + size * 0.03); g.textAlign = 'left'; g.globalAlpha = 1; }

// ---- the main card (S1-S3): "21 days?" -> the study set-up -> automaticity curves
const CARD_POS = V(-0.374, 1.32, 0.3);
const card = makeCard(0.7, 0.52); const cardTx = cardCanvas(card, 0.68, 0.505, 1220, 906);
function drawCard(t) {
  const n = Math.min(21, Math.floor(5 + 16 * eout(remap(t, T.cross, T.crossEnd)))), nq = sm(remap(t, T.notQuite, T.notQuite + 0.35));
  const m1 = sm(remap(t, T.study, T.study + 0.4)), m2 = sm(remap(t, T.curves - 0.3, T.curves + 0.1));
  const act = sm(remap(t, T.act, T.act + 0.3)), cue = sm(remap(t, T.cue, T.cue + 0.3)), days = Math.floor(84 * clamp(remap(t, T.days0, T.days1)));
  const cv = eio(remap(t, T.curves, T.curvesEnd)), l18 = sm(remap(t, T.l18, T.l18 + 0.3)), l254 = sm(remap(t, T.l254, T.l254 + 0.3)), fa = sm(remap(t, T.fast, T.fast + 0.3)), fl = sm(remap(t, T.flat, T.flat + 0.3));
  const key = [n, nq, m1, m2, act, cue, days, cv, l18, l254, fa, fl].map(x => (+x).toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle'; g.textAlign = 'left';
  if (m1 < 1) {   // "21 days?"
    g.globalAlpha = 1 - m1; g.fillStyle = INK; g.font = `400 112px ${SERIF}`; g.fillText('21 days?', 44, 86);
    for (let i = 0; i < 21; i++) { const col = i % 7, row = Math.floor(i / 7), x = 80 + col * 152, y = 210 + row * 152;
      rr(g, x, y, 124, 124, 22, '#F3EFFA', '#CFC6E3', 3); if (i < n) cross(g, x + 62, y + 62, 34, '#5E577E', 12); }
    if (nq > 0) { for (let i = 0; i < 7; i++) { g.globalAlpha = (1 - m1) * nq * (1 - i * 0.12); g.setLineDash([12, 10]); rr(g, 80 + i * 152, 666, 124, 124, 22, null, '#B9B3CB', 4); g.setLineDash([]); }
      g.globalAlpha = (1 - m1) * nq; g.save(); g.translate(880, 120); g.rotate(-0.12); rr(g, -190, -62, 380, 124, 24, PEACH_D); g.fillStyle = INK; g.font = `400 92px ${SERIF}`; g.textAlign = 'center'; g.fillText('not quite', 0, 4); g.restore(); g.textAlign = 'left'; }
    g.globalAlpha = 1;
  }
  if (m1 > 0 && m2 < 1) {   // the study set-up
    g.globalAlpha = m1 * (1 - m2); g.fillStyle = INK; g.font = `400 100px ${SERIF}`; g.fillText('one study', 44, 86);
    g.globalAlpha = m1 * (1 - m2) * act; g.fillStyle = '#5E577E'; g.font = `500 52px ${UI}`; g.fillText('same context', 60, 196); g.fillText('one new daily action', 640, 196);
    if (cue > 0) pillTxt(g, 'after breakfast', 300, 290, 80, PEACH, m1 * (1 - m2) * cue);
    if (act > 0) { pillTxt(g, 'e.g. a walk', 880, 290, 80, '#E7DAF8', m1 * (1 - m2) * act); g.globalAlpha = m1 * (1 - m2) * act; g.fillStyle = INK; g.font = `400 90px ${SERIF}`; g.textAlign = 'center'; g.fillText('→', 590, 292); g.textAlign = 'left'; }
    g.globalAlpha = m1 * (1 - m2);
    for (let i = 0; i < 84; i++) { const col = i % 14, row = Math.floor(i / 14), x = 110 + col * 72, y = 430 + row * 62; g.fillStyle = i < days ? '#B98EEA' : '#E2DCEB'; g.beginPath(); g.arc(x, y, 20, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#5E577E'; g.font = `500 54px ${UI}`; g.fillText(`day ${Math.max(1, days)} of 84 · 12 weeks`, 80, 836); g.globalAlpha = 1;
  }
  if (m2 > 0) {   // automaticity curves (schematic): fast, typical, slow (projected beyond the 84 study days)
    g.globalAlpha = m2; g.fillStyle = INK; g.font = `400 96px ${SERIF}`; g.fillText('automaticity', 44, 84);
    const X0 = 100, X1 = 1160, Yb = 740, Yt = 210, dx = d => X0 + (X1 - X0) * d / 260;
    g.fillStyle = '#B9B3CB'; g.fillRect(X0, Yb, X1 - X0, 6); g.fillRect(X0, Yt - 20, 6, Yb - Yt + 26);
    g.fillStyle = '#5E577E'; g.font = `500 50px ${UI}`; g.textAlign = 'right'; g.fillText('days →', X1, Yb + 56); g.textAlign = 'left';
    g.setLineDash([10, 10]); g.strokeStyle = '#CFC6E3'; g.lineWidth = 4; g.beginPath(); g.moveTo(dx(84), Yt); g.lineTo(dx(84), Yb); g.stroke(); g.setLineDash([]);
        const curve = (d95, col, lw, dashAfter, hi) => {
      const k = 3 / d95; g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
      const pts = []; for (let i = 0; i <= 120; i++) { const d = 260 * i / 120 * cv; pts.push([dx(d), Yb - (Yb - Yt - 120) * (1 - Math.exp(-k * d)), d]); }
      g.beginPath(); pts.forEach(([x, y, d], i) => { if (d > dashAfter) return; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      const rest = pts.filter(p => p[2] >= dashAfter); if (rest.length > 1) { g.setLineDash([16, 12]); g.beginPath(); rest.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.setLineDash([]); }
      if (hi > 0) { g.globalAlpha = m2 * hi * 0.35; g.lineWidth = lw + 22; g.strokeStyle = '#D9BCF5'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.globalAlpha = m2; }
    };
    curve(254, '#A9A3BD', 12, 84, 0); curve(66, '#8E86AE', 12, 84, Math.max(fa, fl)); curve(18, '#A77BE6', 16, 999, 0);
    if (l18 > 0) pillTxt(g, '18 days', dx(18) + 40, Yt + 30, 72, '#E7DAF8', m2 * l18);
    if (l254 > 0) pillTxt(g, '254 (estimated)', dx(178), Yb - 150, 70, '#F3EFFA', m2 * l254);
    if (fa > 0) { g.globalAlpha = m2 * fa; g.fillStyle = '#5E577E'; g.font = `500 56px ${UI}`; g.fillText('fast at first', dx(24), Yb - 60); }
    if (fl > 0) { g.globalAlpha = m2 * fl; g.fillStyle = '#5E577E'; g.font = `500 56px ${UI}`; g.fillText('then levels off', dx(118), Yt + 40); }
    g.globalAlpha = 1;
  }
  tex.needsUpdate = true;
}
// ---- week strip (S4): one missed day, and the curve carries on
const week = makeCard(0.6, 0.2); const weekTx = cardCanvas(week, 0.59, 0.19, 1220, 386);
function drawWeek(t) {
  const shown = Math.floor(clamp(remap(t, T.week, T.week + 0.9)) * 7.999), gp = sm(remap(t, T.gap, T.gap + 0.3)), on = sm(remap(t, T.onward, T.onward + 0.5));
  const key = [shown, gp, on].map(x => (+x).toFixed(3)).join('|'); if (key === weekTx.key) return; weekTx.key = key;
  const { c, g, t: tex } = weekTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle';
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => {
    if (i >= shown) return; const x = 40 + i * 166;
    g.fillStyle = '#5E577E'; g.font = `500 50px ${UI}`; g.textAlign = 'center'; g.fillText(d, x + 66, 50); g.textAlign = 'left';
    if (i === 3) { g.setLineDash([12, 10]); rr(g, x, 90, 132, 132, 26, null, '#B9B3CB', 5); g.setLineDash([]); }
    else { rr(g, x, 90, 132, 132, 26, '#E7DAF8'); check(g, x + 34, 158, 64, INK, 12); }
  });
  if (gp > 0) pillTxt(g, 'one missed day', 40 + 3 * 166 + 66, 300, 64, '#F3EFFA', gp);
  if (on > 0) { g.globalAlpha = on; g.strokeStyle = '#B98EEA'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(780, 330); g.quadraticCurveTo(980, 300, 1170, 250); g.stroke();
    g.fillStyle = '#B98EEA'; g.beginPath(); g.moveTo(1185, 245); g.lineTo(1150, 236); g.lineTo(1160, 270); g.closePath(); g.fill(); g.globalAlpha = 1; }
  tex.needsUpdate = true;
}
// ---- the work bag (navy-lilac tote with lavender straps): carried, set down on the desk (the cue)
const bag = new THREE.Group();
{ const body = mesh(new RoundedBoxGeometry(0.28, 0.26, 0.09, 3, 0.02), std('#5E577E', 0.8)); body.position.y = 0.13; bag.add(body);
  for (const sx of [-1, 1]) { const h = mesh(new THREE.TorusGeometry(0.06, 0.008, 8, 24, Math.PI), std('#D9BCF5', 0.5)); h.position.set(sx * 0.05, 0.26, 0); bag.add(h); } }
scene.add(bag);
const bagBlob = blob(0.36, 0.18, 0.0, DESK_Y + 0.002);
const BAG_SPOT = V(0.34, DESK_Y + 0.001, 0.2);
function makeLabel(text, w = 0.2, col = '#D9BCF5') {
  const lab = new THREE.Group();
  const lb = mesh(new RoundedBoxGeometry(w, 0.08, 0.016, 3, 0.016), std(col, 0.5, { transparent: true }), false, false); lab.add(lb);
  const ltx = textTexture(text, { font: SERIF, w: Math.round(3200 * w), h: 256, size: 170, color: INK, pad: 24 });
  const lp = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.01, 0.076), new THREE.MeshBasicMaterial({ map: ltx.tex, transparent: true, depthWrite: false, toneMapped: false }));
  lp.position.z = 0.0085; lp.renderOrder = 6; lab.add(lp); lab.userData = { body: lb, txt: lp, tx: ltx, label: text }; scene.add(lab); return lab;
}
const cueLab = makeLabel('same cue → walk', 0.38);
const LABELS = [cueLab];


// ---------------------------------------------------------------- choreography: seated -> standing with the bag -> bag down -> walk
const SEAT = V(0, 0.64, 0.7), STANDP = V(0.3, 0.9, 0.64);
const YAW_WALK = -Math.PI / 2;
function walkDist(t) { if (t <= T.walkA) return 0; const v = 0.26, r = 0.6, d = t - T.walkA; return v * (d < r ? d * d / (2 * r) : d - r / 2); }
function pose(t) {
  const P = {};
  P.breath = Math.sin(t * 2 * Math.PI / 4.2);
  P.up = eio(remap(t, T.standA, T.standB)); P.walk = walkDist(t);
  P.yaw = YAW_WALK * eio(remap(t, T.turnA, T.turnA + 0.5));
  P.lean = track(t, [[0, 0.18], [T.standA, 0.18], [T.standB, 0.05], [T.bagA - 0.2, 0.05], [T.bagA + 0.3, 0.38], [T.bagB, 0.38], [T.bagB + 0.35, 0.05], [30, 0.05]]);
  P.headPitch = track(t, [[0, -0.08], [T.standA, -0.08], [T.standB, -0.1], [T.bagA - 0.2, -0.1], [T.bagA + 0.3, -0.5], [T.bagB, -0.5], [T.bagB + 0.35, -0.05], [30, -0.02]]);
  P.headYaw = track(t, [[0, 0.32], [T.standA, 0.32], [T.standB, 0.1], [T.week, 0.1], [T.week + 0.5, -0.35], [T.weekOut, -0.35], [T.weekOut + 0.5, 0], [30, 0]]);
  return P;
}
function placeFigure(t, P) {
  const br = P.breath;
  const pel = vl(SEAT, STANDP, P.up); pel.x += P.walk; pel.y += 0.008 * Math.cos(4 * Math.PI * P.walk / 0.62) * Math.min(1, P.walk * 4);
  torso.position.copy(pel);
  torso.rotation.set(-P.lean, P.yaw + P.headYaw * 0.15, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + P.lean * 0.45, P.headYaw, 0, 'YXZ');
  torso.updateMatrixWorld(true);
  const fwd = V(-Math.sin(P.yaw), 0, -Math.cos(P.yaw)), lat = V(Math.cos(P.yaw), 0, -Math.sin(P.yaw)), upv = V(0, 1, 0);
  const shL = torso.localToWorld(V(-0.15, 0.315, 0.0)), shR = torso.localToWorld(V(0.15, 0.315, 0.0));
  const ph = 2 * Math.PI * P.walk / 0.62;
  // feet: seated under the desk -> under the hips -> walking
  const ankles = [-1, 1].map((sx, i) => {
    const under = pel.clone().add(lat.clone().multiplyScalar(sx * 0.09)); under.y = 0.075;
    let a = vl(V(sx * 0.12, 0.075, 0.27), under, P.up);
    if (P.walk > 0) { const psi = ph + (i ? Math.PI : 0), w = Math.min(1, P.walk * 5);
      a = vl(a, under.clone().add(fwd.clone().multiplyScalar(0.15 * Math.sin(psi) * w)).add(V(0, 0.05 * Math.max(0, Math.cos(psi)) * w, 0)), w); }
    return a;
  });
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    const hip = torso.localToWorld(V(sx * 0.085, 0.02, 0.0)); hip.y = Math.max(hip.y, 0.6);
    const pole = fwd.clone().multiplyScalar(0.8).add(upv.clone().multiplyScalar(1 - 0.75 * P.up)).add(lat.clone().multiplyScalar(sx * 0.15));
    const r = ik(hip, ankles[i], 0.4, 0.43, pole);
    const [th, sh, hi, kn, an] = i === 0 ? [limbs.thL, limbs.shL, J.hiL, J.knL, J.anL] : [limbs.thR, limbs.shR, J.hiR, J.knR, J.anR];
    hi.position.copy(hip); kn.position.copy(r.mid); an.position.copy(r.end);
    setLimb(th, hip, r.mid); setLimb(sh, r.mid, r.end);
    feet[i].position.copy(r.end).add(fwd.clone().multiplyScalar(0.045)); feet[i].position.y = r.end.y - 0.047; feet[i].rotation.set(0, P.yaw + sx * -0.1 * (1 - P.up), 0);
    footBlobs[i].position.set(feet[i].position.x, 0.013, feet[i].position.z); footBlobs[i].material.opacity = 0.6 * (1 - Math.min(1, (r.end.y - 0.075) * 12));
  }
  // hands: on the desk (seated) -> hanging (standing; the right hand carries the bag) -> the bag goes down -> walking swing
  const restL = V(-0.16, DESK_Y + 0.045, 0.27), restR = V(0.2, DESK_Y + 0.045, 0.27);
  const hang = sx => (sx < 0 ? shL : shR).clone().add(V(0, -0.47, 0)).add(fwd.clone().multiplyScalar(0.06)).add(lat.clone().multiplyScalar(sx * 0.07));
  const sw = sx => fwd.clone().multiplyScalar(0.1 * Math.sin(ph + (sx < 0 ? Math.PI : 0)) * Math.min(1, P.walk * 5));
  const sk = sm(remap(t, T.standA + 0.1, T.standB));
  let hL = vl(restL, hang(-1).add(sw(-1)), sk), hR = vl(restR, hang(1).add(sw(1)), sk);
  const put = sm(remap(t, T.bagA, T.bagB)) * (1 - sm(remap(t, T.bagB + 0.1, T.bagB + 0.45)));
  hR = vl(hR, BAG_SPOT.clone().add(V(0.0, 0.32, 0.0)), put);
  const sideL = lat.clone().multiplyScalar(-0.6).add(V(0, -0.3, 0)).sub(fwd.clone().multiplyScalar(0.5)), sideR = lat.clone().multiplyScalar(0.6).add(V(0, -0.3, 0)).sub(fwd.clone().multiplyScalar(0.5));
  const aL = ik(shL, hL, 0.25, 0.235, sk > 0.5 ? sideL : V(-0.8, -0.5, 0.6)), aR = ik(shR, hR, 0.25, 0.235, sk > 0.5 ? sideR : V(0.8, -0.5, 0.6));
  J.shL.position.copy(shL); J.shR.position.copy(shR); J.elL.position.copy(aL.mid); J.elR.position.copy(aR.mid);
  J.haL.position.copy(aL.end); J.haR.position.copy(aR.end);
  setLimb(limbs.uaL, shL, aL.mid); setLimb(limbs.faL, aL.mid, aL.end); setLimb(limbs.uaR, shR, aR.mid); setLimb(limbs.faR, aR.mid, aR.end);
  J.haL.lookAt(aL.mid); J.haR.lookAt(aR.mid);
  // the bag: beside the desk leg until the performer stands, then in the right hand, then on the desk
  if (t < T.standB) { bag.position.set(0.5, 0, 0.62); bag.rotation.set(0, 0.3, 0); }
  else if (t < T.bagB) { bag.position.copy(aR.end).add(V(0, -0.27, 0)); bag.position.y = Math.max(bag.position.y, DESK_Y + 0.002 - 0.0 * put); bag.rotation.set(0, P.yaw + 0.2, 0); }
  else { bag.position.copy(BAG_SPOT); bag.rotation.set(0, 0.25, 0); }
  bagBlob.position.set(bag.position.x, bag.position.y < 0.1 ? 0.012 : DESK_Y + 0.002, bag.position.z); bagBlob.material.opacity = (t < T.standB || t >= T.bagB) ? 0.45 : 0;
}
function setProps(t) {
  notebook.position.set(-0.4, DESK_Y + NB.h / 2 + 0.001, 0.02); notebook.rotation.set(0, -0.15, 0); coverPivot.rotation.z = 0; notebook.updateMatrixWorld(true);
  nbBlob.position.set(-0.38, DESK_Y + 0.003, 0.04); nbBlob.material.opacity = 0.55;
  ink.forEach(ln => { ln.visible = false; });
  pencil.position.set(-0.22, DESK_Y + 0.006, 0.2); pencil.rotation.set(Math.PI / 2, 0, 1.2);
}
function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  const v = 1 - sm(remap(t, T.cardOut - 0.3, T.cardOut));
  card.visible = v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0); card.scale.setScalar(0.88);
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v * 0.95; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
  const wv = sm(remap(t, T.week - 0.1, T.week + 0.25)) * (1 - sm(remap(t, T.weekOut, T.weekOut + 0.35)));
  week.visible = wv > 0.003;
  if (week.visible) { const dd = 2.2, th = Math.tan(camera.fov * D2R / 2), q = camera.quaternion;
    const fw = V(0, 0, -1).applyQuaternion(q), cr = V(1, 0, 0).applyQuaternion(q), cu = V(0, 1, 0).applyQuaternion(q);
    const nx = 0, ny = 1 - 2 * 690 / H, wpx = 820;
    week.position.copy(camera.position).add(fw.multiplyScalar(dd)).add(cr.multiplyScalar(nx * dd * th * W / H)).add(cu.multiplyScalar(ny * dd * th));
    week.quaternion.copy(q); week.scale.setScalar(lerp(0.9, 1, wv) * (wpx / H * 2 * dd * th) / 0.6);
    week.userData.border.material.opacity = wv; week.userData.panel.material.opacity = wv * 0.95; weekTx.m.material.opacity = wv; drawWeek(t); }
  const lv = sm(remap(t, T.cueLab, T.cueLab + 0.3)) * (1 - sm(remap(t, S.s5 - 0.3, S.s5 - 0.02)));
  cueLab.visible = lv > 0.003;
  if (cueLab.visible) { const dd = 2.2, th = Math.tan(camera.fov * D2R / 2), q = camera.quaternion, ny = 1 - 2 * 700 / H, wpx = 600;
    cueLab.position.copy(camera.position).add(V(0, 0, -1).applyQuaternion(q).multiplyScalar(dd)).add(V(0, 1, 0).applyQuaternion(q).multiplyScalar(ny * dd * th));
    cueLab.quaternion.copy(q); cueLab.scale.setScalar(lerp(0.85, 1, lv) * (wpx / H * 2 * dd * th) / 0.38); } cueLab.userData.body.material.opacity = lv; cueLab.userData.txt.material.opacity = lv;
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 in front of the card: "21 days?" crosses itself off
  { a: S.s1, b: S.s2, k0: [V(-0.36, 1.31, 0.3), -20, 4, 2.95, 30], k1: [V(-0.36, 1.31, 0.3), -16, 4, 2.8, 30] },
  // S2 rear-left medium: the study set-up beside the performer
  { a: S.s2, b: S.s3, k0: [V(-0.3, 1.2, 0.3), -30, 8, 3.35, 30], k1: [V(-0.3, 1.2, 0.3), -25, 8, 3.15, 30] },
  // S3 high rear-left, closer: automaticity curves
  { a: S.s3, b: S.s4, k0: [V(-0.35, 1.27, 0.3), -32, 17, 3.4, 30], k1: [V(-0.35, 1.27, 0.3), -27, 15, 3.2, 30] },
  // S4 front-right, wide enough for a standing figure: the missed day, then the bag goes down and the walk starts
  { a: S.s4, b: S.s5, k0: [V(0.36, 1.42, 0.6), 56, 12, 5.65, 30], k1: [V(0.4, 1.42, 0.6), 48, 12, 5.45, 30] },
  // S5 wide room: the walk continues, lock-up
  { a: S.s5, b: S.end, k0: [V(0.8, 1.25, 0.55), 8, 14, 7.0, 30], k1: [V(1.15, 1.32, 0.55), 11, 16, 8.0, 30] },
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
  // crucial in-scene text: the main card, the week strip and the cue label, each audited by its own oriented box
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const keep = b => (onScreen(b) ? b : null);
  const r = { t, card: null, crucial: { card: card.visible ? keep(textBox(card)) : null, week: week.visible ? keep(textBox(week)) : null, cueLab: cueLab.visible ? keep(textBox(cueLab)) : null },
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
const studyP1 = PS('study')[0][1];   // end of the pause after "In one study,"
const CAPS = [
  { a: -1, b: TL.study.start - 0.12, size: C2, lines: [[sg(`${hl('Twenty-one days')} to build a habit?`)], [sg('Not quite.', 2.2)]] },
  { a: TL.study.start - 0.06, b: studyP1 - 0.12, size: C1, lines: [[sg('In one study,')]] },
  { a: studyP1 - 0.06, b: studySplit - 0.12, size: C2, lines: [[sg('people repeated one new daily action')], [sg(`in the ${hl('same context')},`, TL.study.start + 3.15)]] },
  { a: studySplit - 0.06, b: TL.range.start - 0.12, size: C1, lines: [[sg(`like ${hl('after breakfast')}.`)]] },
  { a: TL.range.start - 0.06, b: rangeSplit - 0.12, size: C2, lines: [[sg(`Reaching ${hl('near-automatic')}`)], [sg('was estimated', TL.range.start + 0.75)]] },
  { a: rangeSplit - 0.06, b: TL.curve.start - 0.12, size: C2, lines: [[sg(`at ${hl('eighteen')} to`)], [sg(`${hl('two hundred fifty-four days')}.`, 12.98)]] },
  { a: TL.curve.start - 0.06, b: TL.missed.start - 0.12, size: C2, lines: [[sg(`It climbs ${hl('fast at first')},`)], [sg(`then ${hl('levels off')}.`, curveSplit - 0.04)]] },
  { a: TL.missed.start - 0.06, b: TL.tip.start - 0.12, size: C2, lines: [[sg(`And ${hl('missing one day')}`)], [sg('didn’t materially derail it.', 18.55)]] },
  { a: TL.tip.start - 0.06, b: tipSplit - 0.12, size: C2, lines: [[sg(`So if you ${hl('skip one evening walk')},`)]] },
  { a: tipSplit - 0.06, b: TL.cta.start - 0.2, size: C2, lines: [[sg(`${hl('just walk')} the next evening,`)], [sg(`after the ${hl('same cue')}.`, 24.08)]] },
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
cardTx.key = ''; weekTx.key = '';
// redraw the label textures now that the fonts are present
for (const lab of LABELS) { const { canvas: c, g: ctx } = lab.userData.tx; ctx.clearRect(0, 0, c.width, c.height); let s = 170; ctx.font = `400 ${s}px ${SERIF}`;
  while (ctx.measureText(lab.userData.label).width > c.width - 60) { s -= 4; ctx.font = `400 ${s}px ${SERIF}`; }
  ctx.fillStyle = '#17122E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab.userData.label, c.width / 2, c.height * 0.54); lab.userData.tx.tex.needsUpdate = true; }
renderAt(0);
window.ready = true;
