// Mello 30 s english08-01 (English): "the illusion of explanatory depth" - explain it before you claim you understand it
// (Rozenblit & Keil 2002; Meyers et al. 2023). Same accepted style recipe and renderer as the latest accepted episodes
// ("Thoughts in a Quiet Room": sparse clean 3D miniature, one abstract faceless performer, soft contact shadows, white/pale-gray
// stage, lavender #D9BCF5 only as the highlight; English captions in Instrument Serif). Room, desk props, rig, camera helper,
// caption mechanics, cards and the oriented-box safe-zone audit are carried over from ../../2026-11-06-english-07/project.
// New for this episode: a large brass zipper on the desk (procedural teeth that mesh behind the slider and fan apart ahead of
// it), a confidence card (1-7 meter, a step-by-step attempt that stalls at step 2, the rating dropping after explaining), a
// speech bubble while explaining out loud, and an X-ray slider that reveals the Y-shaped channel (Sundback 1917).
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
const hookSplit = SPL('hook'), sureSplit = SPL('sure'), studySplit = SPL('study'), trickSplit = SPL('trick'), stuckSplit = SPL('stuck'), learnSplit = SPL('learn');
// word starts measured with faster-whisper word timestamps on generated/narration.wav (see notes):
// "zipper" 1.93, "feel sure" 3.38, "explain" 4.64, "step by step" 5.24, "lower" 9.13, "illusion" 12.10, "explain it out loud" 16.15,
// "stuck" 18.20, "learn next" 19.08, "hidden part" 21.81, "slider's Y-shaped channel" 22.95
const S = { s1: 0.0, s2: 2.6, s3: 14.3, s4: 17.6, s5: 25.75, end: 30.0 };
const T = {
  zipA: 0.0, zipB: 1.95,                              // the zipper zips itself shut from frame 0
  cardIn: S.s2 + 0.15, sure: TL.sure.start + 0.45,    // "feel sure": the rating climbs to 6
  steps: TL.sure.start + 1.05, step1: TL.sure.start + 1.75, step2: TL.sure.start + 2.35, stuckQ: TL.sure.start + 2.85,
  drop: TL.study.start + 2.4,                         // "lower": the rating drops after explaining
  title: TL.name.start + 0.5,                         // "the illusion of explanatory depth"
  cardOut: S.s3 - 0.1,
  talkA: TL.trick.start - 0.1, bubble: TL.trick.start + 0.35, talkB: TL.trick.end + 0.2,   // the attempt types out, then stalls (readable for over 1 s)
  unzipA: S.s4 + 0.05, unzipB: S.s4 + 0.7,            // the slider slides back to the middle
  ring: TL.stuck.start + 0.3, next: TL.stuck.start + 1.2,   // "where you get stuck" / "what to learn next"
  xray: TL.learn.start + 1.3, yLabel: TL.learn.start + 2.5, zip2A: TL.learn.start + 2.5, zip2B: TL.learn.end - 0.05,
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




// ---------------------------------------------------------------- episode props: brass zipper, cards, speech bubble
const lavender = new THREE.Color('#D9BCF5');
const INK = '#17122E', NAVY = '#1C1733', CREAM = '#F6F1E6', PEACH = '#F0D2A6';
const UI = '"Inter", sans-serif', SERIF = '"Instrument Serif", serif';
function rr(g, x, y, w, h, r, fill, stroke, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }

// ---- a large zipper lying on the desk. Local frame: length along z (bottom stop at +L/2 near the performer, top at -L/2),
// rows of teeth at x<0 (left) and x>0 (right). Behind the slider (toward +z) the teeth mesh on the centre line; ahead of it
// the two rows fan apart in a V. The slider moves along s in [0, 1] (0 = bottom, 1 = top).
const ZIP = { L: 0.4, N: 20, open: 0.34, pos: V(0.02, DESK_Y + 0.0045, 0.12), yaw: 1.15 };
const zipper = new THREE.Group(); zipper.position.copy(ZIP.pos); zipper.rotation.y = ZIP.yaw; scene.add(zipper);
const toothMat = std('#E0B45E', 0.35, { metalness: 0.25 }), tapeMat = std('#8E86AE', 0.9);
const toothGeo = new RoundedBoxGeometry(0.016, 0.007, 0.0115, 2, 0.002), tapeGeo = new RoundedBoxGeometry(0.046, 0.003, 0.0215, 1, 0.001);
const pitch = ZIP.L / ZIP.N;
const rows = [-1, 1].map(sx => Array.from({ length: ZIP.N }, (_, i) => {
  const tooth = mesh(toothGeo, toothMat); const tape = mesh(tapeGeo, tapeMat, false, true);
  zipper.add(tooth); zipper.add(tape);
  return { sx, i, tooth, tape, z: ZIP.L / 2 - (i + (sx < 0 ? 0.25 : 0.75)) * pitch };
}));
const stopB = mesh(new RoundedBoxGeometry(0.03, 0.009, 0.012, 2, 0.003), toothMat); stopB.position.set(0, 0.004, ZIP.L / 2 + 0.006); zipper.add(stopB);
// slider: navy body (turns see-through for the X-ray), the Y-shaped channel inside, a pull tab
const slider = new THREE.Group(); zipper.add(slider);
const sliderMat = std('#2A2440', 0.4, { metalness: 0.3, transparent: true });
const sBody = mesh(new RoundedBoxGeometry(0.06, 0.022, 0.07, 3, 0.008), sliderMat); sBody.position.y = 0.011; slider.add(sBody);
const yMat = new THREE.MeshBasicMaterial({ color: '#B98EEA', transparent: true, opacity: 0, depthTest: false, toneMapped: false });
const yParts = [];
for (const [x, z, rot, len] of [[-0.013, -0.016, 0.42, 0.04], [0.013, -0.016, -0.42, 0.04], [0, 0.017, 0, 0.032]]) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.0085, 0.002, len), yMat); b.position.set(x, 0.024, z); b.rotation.y = rot; b.renderOrder = 7; slider.add(b); yParts.push(b);
}
const tab = mesh(new RoundedBoxGeometry(0.026, 0.004, 0.06, 2, 0.002), sliderMat); tab.position.set(0, 0.025, 0.055); slider.add(tab);
blob(0.3, 0.6, 0.35, DESK_Y + 0.002).position.set(ZIP.pos.x, DESK_Y + 0.002, ZIP.pos.z);
function sliderS(t) {
  let s = lerp(0.12, 0.92, eio(remap(t, T.zipA, T.zipB)));
  s = lerp(s, 0.38, eio(remap(t, T.unzipA, T.unzipB)));
  s = lerp(s, 0.66, eio(remap(t, T.zip2A, T.zip2B)));
  if (t > S.s5) s = 0.92;
  return s;
}
// zipper footprint on screen from its own (local) extents: tapes +-(teeth + open fan + tape width), length +-L/2
function zipperBox() {
  zipper.updateMatrixWorld(true);
  const s = sliderS(curT), zs = ZIP.L / 2 - s * ZIP.L, fan = Math.max(0, zs + ZIP.L / 2) * Math.tan(ZIP.open * 0.5), hx = 0.0055 + fan + 0.055;
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y, z] of [[-0.06, 0, ZIP.L / 2 + 0.02], [0.06, 0, ZIP.L / 2 + 0.02], [-hx, 0, -ZIP.L / 2], [hx, 0, -ZIP.L / 2], [-0.06, 0.03, ZIP.L / 2], [0.06, 0.03, ZIP.L / 2], [-hx, 0.03, -ZIP.L / 2], [hx, 0.03, -ZIP.L / 2]]) {
    const v = V(x, y, z).applyMatrix4(zipper.matrixWorld).project(camera), px = (v.x + 1) / 2 * W, py = (1 - v.y) / 2 * H;
    x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
  }
  return [x0, y0, x1, y1].map(Math.round);
}
let curT = 0;
function setZipper(t) {
  curT = t;
  const s = sliderS(t), zs = ZIP.L / 2 - s * ZIP.L;          // slider centre in local z
  for (const row of rows) for (const r of row) {
    const ahead = zs - r.z;                                    // > 0: ahead of the slider (open side)
    const open = ahead > 0 ? Math.min(ahead, ZIP.L) * Math.tan(ZIP.open * 0.5) : 0;
    const x = r.sx * (0.0055 + open);
    r.tooth.position.set(x, 0.0035, r.z);
    r.tooth.rotation.set(0, -r.sx * (ahead > 0 ? ZIP.open * 0.5 : 0), 0);
    r.tape.position.set(x + r.sx * 0.03, 0.0015, r.z);
    r.tape.rotation.copy(r.tooth.rotation);
  }
  slider.position.set(0, 0, zs + 0.005);
  const xr = sm(remap(t, T.xray, T.xray + 0.5)) * (t < S.s5 ? 1 : 0);
  sliderMat.opacity = lerp(1, 0.28, xr); sliderMat.depthWrite = xr < 0.5;
  yMat.opacity = 0.95 * xr;
  return s;
}
const tabWorld = () => tab.localToWorld(V(0, 0.004, 0.02));

// ---------------------------------------------------------------- cards
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
// confidence card (S2): rating 1-7, the step-by-step attempt, the drop, the name
const CARD_POS = V(-0.374, 1.32, 0.3);
const card = makeCard(0.7, 0.52); const cardTx = cardCanvas(card, 0.68, 0.505, 1220, 906);
function drawCard(t) {
  const v = lerp(lerp(4, 6, eio(remap(t, T.sure - 0.1, T.sure + 0.5))), 3.3, eio(remap(t, T.drop, T.drop + 0.7)));
  const gh = sm(remap(t, T.drop, T.drop + 0.3)), lb = sm(remap(t, T.drop + 0.4, T.drop + 0.7));
  const st = sm(remap(t, T.steps, T.steps + 0.3)), s1 = sm(remap(t, T.step1, T.step1 + 0.25)), s2 = sm(remap(t, T.step2, T.step2 + 0.25)), q = eout(remap(t, T.stuckQ, T.stuckQ + 0.3));
  const ti = sm(remap(t, T.title, T.title + 0.35));
  const key = [v, gh, lb, st, s1, s2, q, ti].map(x => x.toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle'; g.textAlign = 'left';
  // header: the question, replaced by the name
  if (ti < 1) { g.globalAlpha = 1 - ti; g.fillStyle = INK; g.font = `400 84px ${SERIF}`; g.fillText('How well do I understand a zipper?', 44, 74); g.globalAlpha = 1; }
  if (ti > 0) { g.globalAlpha = ti; g.font = `400 80px ${SERIF}`; const w = g.measureText('the illusion of explanatory depth').width + 64; rr(g, 610 - w / 2, 18, w, 112, 30, '#D9BCF5'); g.fillStyle = INK; g.textAlign = 'center'; g.fillText('the illusion of explanatory depth', 610, 76); g.textAlign = 'left'; g.globalAlpha = 1; }
  // rating 1..7
  const X0 = 150, X1 = 1070, Y = 228, xv = val => X0 + (X1 - X0) * (val - 1) / 6;
  g.fillStyle = '#5E577E'; g.font = `500 58px ${UI}`; g.fillText('1', 70, Y + 2); g.textAlign = 'right'; g.fillText('7', 1150, Y + 2); g.textAlign = 'left';
  rr(g, X0, Y - 8, X1 - X0, 16, 8, '#E2DCEB');
  for (let k = 1; k <= 7; k++) { g.fillStyle = '#CFC6E3'; g.beginPath(); g.arc(xv(k), Y, 7, 0, Math.PI * 2); g.fill(); }
  if (gh > 0) { g.globalAlpha = 0.45 * gh; g.fillStyle = '#B98EEA'; g.beginPath(); g.arc(xv(6), Y, 40, 0, Math.PI * 2); g.fill();
    g.globalAlpha = gh; g.fillStyle = '#5E577E'; g.font = `500 46px ${UI}`; g.textAlign = 'center'; g.fillText('before', xv(6), Y - 70); g.textAlign = 'left'; g.globalAlpha = 1; }
  g.fillStyle = '#D9BCF5'; g.beginPath(); g.arc(xv(v), Y, 46, 0, Math.PI * 2); g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  g.fillStyle = INK; g.font = `600 50px ${UI}`; g.textAlign = 'center'; g.fillText(String(Math.round(v)), xv(v), Y + 2); g.textAlign = 'left';
  if (lb > 0) { g.globalAlpha = lb; g.fillStyle = INK; g.font = `500 46px ${UI}`; g.textAlign = 'center'; g.fillText('after explaining', xv(v), Y + 82); g.textAlign = 'left'; g.globalAlpha = 1; }
  // the step-by-step attempt
  if (st > 0) { g.globalAlpha = st; g.fillStyle = '#E4DFEE'; g.fillRect(44, 372, 1132, 4); g.fillStyle = '#5E577E'; g.font = `500 54px ${UI}`; g.fillText('Explain it, step by step:', 44, 440); g.globalAlpha = 1; }
  if (s1 > 0) { g.globalAlpha = s1; g.fillStyle = INK; g.font = `400 92px ${SERIF}`; g.fillText('1. Pull the slider up.', 60, 560); g.globalAlpha = 1; }
  if (s2 > 0) { g.globalAlpha = s2; g.fillStyle = INK; g.font = `400 92px ${SERIF}`; g.fillText('2. The teeth… lock, somehow?', 60, 690); g.globalAlpha = 1; }
  if (q > 0) { g.save(); g.globalAlpha = Math.min(1, q); g.translate(1080, 790); g.scale(lerp(1.4, 1, q), lerp(1.4, 1, q)); g.fillStyle = '#E9C18C'; g.beginPath(); g.arc(0, 0, 70, 0, Math.PI * 2); g.fill(); g.fillStyle = INK; g.font = `400 110px ${SERIF}`; g.textAlign = 'center'; g.fillText('?', 0, 6); g.restore(); }
  tex.needsUpdate = true;
}
// speech bubble (S3): explaining out loud, and getting stuck
const bubble = makeCard(0.5, 0.17); const bubbleTx = cardCanvas(bubble, 0.49, 0.165, 1100, 370);
function drawBubble(t) {
  const n = Math.floor(clamp(remap(t, T.bubble, T.bubble + 1.0)) * 28);
  const key = String(n); if (key === bubbleTx.key) return; bubbleTx.key = key;
  const { c, g, t: tex } = bubbleTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle';
  g.fillStyle = INK; g.font = `italic 400 120px ${SERIF}`; g.fillText('“So the teeth… um…”'.slice(0, n), 50, 190);
  tex.needsUpdate = true;
}
// labels on the zipper close-up (S4): where you got stuck / learn next / the Y-shaped channel
function makeLabel(text, w = 0.2, col = '#D9BCF5') {
  const lab = new THREE.Group();
  const lb = mesh(new RoundedBoxGeometry(w, 0.08, 0.016, 3, 0.016), std(col, 0.5, { transparent: true }), false, false); lab.add(lb);
  const ltx = textTexture(text, { font: SERIF, w: Math.round(3200 * w), h: 256, size: 170, color: INK, pad: 24 });
  const lp = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.01, 0.076), new THREE.MeshBasicMaterial({ map: ltx.tex, transparent: true, depthWrite: false, toneMapped: false }));
  lp.position.z = 0.0085; lp.renderOrder = 6; lab.add(lp); lab.userData = { body: lb, txt: lp, tx: ltx, label: text }; scene.add(lab); return lab;
}
const stuckLab = makeLabel('stuck here → learn next', 0.46, '#F3EFFA'), yLab = makeLabel('Y-shaped channel', 0.34);
const LABELS = [stuckLab, yLab];
const stuckRing = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.004, 10, 64), std('#E08A4F', 0.45, { transparent: true, emissive: new THREE.Color('#E08A4F'), emissiveIntensity: 0.3, depthWrite: false }));
stuckRing.rotation.x = Math.PI / 2; stuckRing.renderOrder = 6; scene.add(stuckRing);


// ---------------------------------------------------------------- choreography (seated throughout)
const PELVIS = V(0, 0.64, 0.7);
function pose(t) {
  const P = {};
  P.breath = Math.sin(t * 2 * Math.PI / 4.2);
  P.lean = track(t, [[0, 0.24], [S.s2, 0.24], [T.cardIn + 0.4, 0.14], [S.s3 - 0.2, 0.14], [T.talkA, 0.1], [T.talkB, 0.1], [S.s4, 0.26], [30, 0.24]]);
  P.headPitch = track(t, [[0, -0.6], [S.s2 - 0.1, -0.6], [T.cardIn + 0.5, -0.08], [T.drop, -0.08], [T.drop + 0.4, -0.25], [T.drop + 1.2, -0.08], [S.s3 - 0.2, -0.08],
    [T.talkA, -0.02], [T.bubble + 0.6, -0.02], [T.bubble + 1.1, -0.3], [T.talkB, -0.3], [S.s4, -0.62], [30, -0.6]]);
  P.headYaw = track(t, [[0, 0], [S.s2 - 0.1, 0], [T.cardIn + 0.5, 0.32], [S.s3 - 0.2, 0.32], [T.talkA, -0.15], [T.talkB, -0.15], [S.s4, 0], [30, 0]]);
  P.headRoll = track(t, [[0, 0], [T.bubble + 0.7, 0], [T.bubble + 1.1, 0.18], [T.talkB, 0.18], [S.s4, 0], [30, 0]]);   // the "um…" head tilt
  P.torsoYaw = P.headYaw * 0.2;
  return P;
}
function placeFigure(t, P) {
  const lean = P.lean, br = P.breath;
  torso.position.copy(PELVIS);
  torso.rotation.set(-lean, P.torsoYaw, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + lean * 0.5, P.headYaw, P.headRoll, 'YXZ');
  torso.updateMatrixWorld(true);
  const shL = torso.localToWorld(V(-0.15, 0.315, 0.0)), shR = torso.localToWorld(V(0.15, 0.315, 0.0));
  const restL = V(-0.18, DESK_Y + 0.045, 0.26), restR = V(0.26, DESK_Y + 0.045, 0.24);
  // right hand: pulls the tab while zipping (S1, and again in S4), gestures while explaining out loud (S3)
  const pull = 0;   // the zipper moves on its own (a diagram), so no arm crosses it
  let hR = vl(restR, tabWorld().add(V(0, 0.03, 0)), pull);
  const talk = sm(remap(t, T.talkA, T.talkA + 0.35)) * (1 - sm(remap(t, T.talkB - 0.3, T.talkB)));
  const gest = shR.clone().add(V(0.06, -0.12, -0.24)).add(V(0.035 * Math.sin(t * 5.2), 0.03 * Math.sin(t * 3.7 + 1), 0));
  hR = vl(hR, gest, talk);
  let hL = restL.clone();
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
  notebook.position.set(-0.4, DESK_Y + NB.h / 2 + 0.001, 0.02); notebook.rotation.set(0, -0.15, 0); coverPivot.rotation.z = 0; notebook.updateMatrixWorld(true);
  nbBlob.position.set(-0.38, DESK_Y + 0.003, 0.04); nbBlob.material.opacity = 0.55;
  ink.forEach(ln => { ln.visible = false; });
  pencil.position.set(-0.24, DESK_Y + 0.006, 0.2); pencil.rotation.set(Math.PI / 2, 0, 1.2);
  setZipper(t);
  zipper.updateMatrixWorld(true);
}

function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  const v = sm(remap(t, T.cardIn, T.cardIn + 0.35)) * (1 - sm(remap(t, T.cardOut - 0.3, T.cardOut)));
  card.visible = v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0);
  card.scale.setScalar(0.88 * lerp(0.85, 1, sm(remap(t, T.cardIn, T.cardIn + 0.35))));
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v * 0.95; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
  // speech bubble beside the head while explaining out loud
  const bv = sm(remap(t, T.bubble - 0.1, T.bubble + 0.2)) * (1 - sm(remap(t, S.s4 - 0.25, S.s4 - 0.02)));
  bubble.visible = bv > 0.003;
  if (bubble.visible) { const hp = head.getWorldPosition(V(0, 0, 0)), cr = V(1, 0, 0).applyQuaternion(camera.quaternion);
    bubble.position.copy(hp).add(cr.multiplyScalar(0.312)).add(V(0, 0.0, 0)); bubble.quaternion.copy(camera.quaternion); bubble.scale.setScalar(0.7 * lerp(0.85, 1, bv));
    bubble.userData.border.material.opacity = bv; bubble.userData.panel.material.opacity = bv * 0.95; bubbleTx.m.material.opacity = bv; drawBubble(t); }
  // zipper close-up labels
  const setLab = (lab, pos, a, s) => { lab.position.copy(pos); lab.quaternion.copy(camera.quaternion); lab.visible = a > 0.003; lab.scale.setScalar(s * lerp(0.7, 1, a)); lab.userData.body.material.opacity = a; lab.userData.txt.material.opacity = a; };
  const sp = slider.localToWorld(V(0, 0.02, 0));
  const rv = sm(remap(t, T.ring, T.ring + 0.3)) * (1 - sm(remap(t, T.xray - 0.2, T.xray + 0.2)));
  stuckRing.visible = rv > 0.003; stuckRing.position.copy(sp); stuckRing.material.opacity = rv; stuckRing.scale.setScalar(lerp(0.7, 1, eout(rv)) * (1 + 0.06 * Math.sin(t * 6)));
  const out4 = 1 - sm(remap(t, S.s5 - 0.3, S.s5 - 0.02));
  setLab(stuckLab, ZC.clone().add(V(0.0, 0.06, 0.075)), sm(remap(t, T.next, T.next + 0.3)) * (1 - sm(remap(t, T.yLabel - 0.3, T.yLabel))), 0.4);
  setLab(yLab, ZC.clone().add(V(0.0, 0.06, 0.075)), sm(remap(t, T.yLabel, T.yLabel + 0.3)) * out4, 0.4);
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
const ZC = ZIP.pos.clone();
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 high over the right shoulder onto the big zipper: it zips itself shut
  { a: S.s1, b: S.s2, k0: [ZC.clone().add(V(0.0, 0.02, -0.09)), 22, 60, 1.55, 30], k1: [ZC.clone().add(V(0.0, 0.02, -0.1)), 18, 58, 1.4, 30] },
  // S2 rear-left medium: the confidence card beside the performer (slow push)
  { a: S.s2, b: S.s3, k0: [V(-0.24, 1.14, 0.3), -21, 9, 4.0, 30], k1: [V(-0.23, 1.13, 0.3), -17, 8, 3.7, 30] },
  // S3 front-right three-quarter medium: explaining out loud, getting stuck
  { a: S.s3, b: S.s4, k0: [V(0.16, 1.0, 0.62), 48, 10, 2.9, 30], k1: [V(0.16, 1.0, 0.62), 42, 9, 2.65, 30] },
  // S4 close onto the zipper: where you got stuck, the X-ray slider, the Y-shaped channel
  { a: S.s4, b: S.s5, k0: [ZC.clone().add(V(-0.03, 0.02, -0.08)), 16, 62, 1.3, 30], k1: [ZC.clone().add(V(-0.03, 0.02, -0.09)), 12, 60, 1.18, 30] },
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
  // crucial in-scene text: the confidence card, the speech bubble and the zipper labels, each audited on its own
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const keep = b => (onScreen(b) ? b : null);
  const r = { t, card: null, crucial: { card: card.visible ? keep(textBox(card)) : null, bubble: bubble.visible ? keep(textBox(bubble)) : null,
    stuckLab: stuckLab.visible ? keep(textBox(stuckLab)) : null, yLab: yLab.visible ? keep(textBox(yLab)) : null },
    head: sphereBox(head, 0.12), slider: screenBoxOriented(sBody), zipper: zipperBox(), desk: screenBox(deskTop) };
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
const W_AFTER = TL.study.start + 2.79;
const CAPS = [
  { a: -1, b: TL.sure.start - 0.12, size: C2, lines: [[sg('Quick:'), sg(' how well do you', hookSplit - 0.04)], [sg(`understand a ${hl('zipper')}?`, hookSplit + 0.4)]] },
  { a: TL.sure.start - 0.06, b: TL.study.start - 0.12, size: C2, lines: [[sg(`Most of us feel ${hl('sure')},`)], [sg('until we explain it step by step.', sureSplit - 0.04)]] },
  { a: TL.study.start - 0.06, b: W_AFTER - 0.12, size: C2, lines: [[sg('In studies, people rated their')], [sg(`understanding ${hl('lower')}`, studySplit + 1.2)]] },
  { a: W_AFTER - 0.06, b: TL.name.start - 0.12, size: C1, lines: [[sg('after trying to explain.')]] },
  { a: TL.name.start - 0.06, b: TL.trick.start - 0.12, size: C2, lines: [[sg('It’s called the')], [sg(`${hl('illusion of explanatory depth')}.`)]] },
  { a: TL.trick.start - 0.06, b: TL.stuck.start - 0.12, size: C2, lines: [[sg('So before you say ‘I get it’,')], [sg(`${hl('explain it out loud')}.`, trickSplit - 0.04)]] },
  { a: TL.stuck.start - 0.06, b: TL.learn.start - 0.12, size: C2, lines: [[sg(`Where you get ${hl('stuck')}`)], [sg('is what to learn next.', stuckSplit - 0.04)]] },
  { a: TL.learn.start - 0.06, b: learnSplit - 0.12, size: C2, lines: [[sg('With a zipper,')], [sg(`it’s often the ${hl('hidden part')}:`, TL.learn.start + 0.8)]] },
  { a: learnSplit - 0.06, b: TL.cta.start - 0.2, size: C2, lines: [[sg('the slider’s')], [sg(`${hl('Y-shaped channel')}.`)]] },
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
cardTx.key = ''; bubbleTx.key = '';
// redraw the label textures now that the fonts are present
for (const lab of LABELS) { const { canvas: c, g: ctx } = lab.userData.tx; ctx.clearRect(0, 0, c.width, c.height); let s = 170; ctx.font = `400 ${s}px ${SERIF}`;
  while (ctx.measureText(lab.userData.label).width > c.width - 60) { s -= 4; ctx.font = `400 ${s}px ${SERIF}`; }
  ctx.fillStyle = '#17122E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab.userData.label, c.width / 2, c.height * 0.54); lab.userData.tx.tex.needsUpdate = true; }
renderAt(0);
window.ready = true;
