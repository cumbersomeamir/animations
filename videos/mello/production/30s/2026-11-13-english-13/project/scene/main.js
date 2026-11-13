// Mello 30 s english13-01 (English): "why trying not to think of something can bring it back" (ironic thought suppression:
// Wegner, Schneider, Carter & White 1987; Wegner 1994; meta-analyses Abramowitz, Tolin & Street 2001 and Wang, Hagger &
// Chatzisarantis 2020). Second episode under the 2026-11-11 rules (context/10 section 8): hook -> super hook -> proof ->
// payoff -> CTA, one visual idea at a time, large brief labels, captions inside x 100-900, the store-sampled palette
// (context/22) and a soothing original bed under the voice. The approved narrator, room, rig, camera helper, caption
// mechanics, dark in-app card, note card and oriented-box audit are carried over from ../../2026-11-11-english-12/project.
// New: a pink elephant (the unwanted thought) that the performer keeps pushing off the desk and that keeps popping back, a
// white-bear/bell card, a lilac "checking" beam that finds the elephant hiding behind the plant, the rebound, and the
// payoff: the elephant is noticed, shrinks to a small figure in the desk corner, and attention goes to one specific job.
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
// word starts measured with faster-whisper word timestamps on generated/narration.wav (see notes): "pink elephant" 1.25,
// "too late" 2.60, "why does fighting" 3.33, "people told to avoid" 6.70, "white bear" 7.88, "kept ringing a bell" 8.50,
// "one theory" 10.55, "part of your mind keeps checking" 11.55, "afterwards" 14.05, "return more" 15.26,
// "small, repeated effect" 16.45, "so what actually helps" 18.55, "don't fight it" 20.40, "notice it" 21.38,
// "give your mind one specific job" 22.1
const S = { s1: 0.0, s2: 2.55, s3: 5.4, s4: 10.4, s5: 18.3, end: 30.0 };
const T = {
  push1B: 1.55, fall1B: 2.15, pop1: 2.62,                                  // pushed off the desk -> "Too late": it pops back
  push2A: 3.35, push2B: 4.15, fall2B: 4.45, pop2: 4.66,                     // pushed off the other side -> back again
  bear: 6.7, bell0: 8.5,                                                    // card: white bear, the bell keeps ringing
  beamA: 11.45, beamFind: 12.55,                                            // "checking": the beam finds it behind the plant
  rebound: 15.2,                                                            // it returns, a little bigger
  stop: 20.4, notice: 21.4, shrinkB: 22.05, job: 22.1, writeA: 22.6, writeB: 24.0,
  pullA: 24.3, lockA: TL.cta.start - 0.3,
};
const BELLS = [0, 1, 2, 3, 4, 5].map(i => T.bell0 + i * 0.32);
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






// ---------------------------------------------------------------- episode props: store palette, elephant, card, beam, note
// palette sampled 2026-11-11 from the current Play listing (context/22): stage #EDE8FE, ink #191632, violet #633BFE,
// lilac #E6D2FC, deep violet #5B45A3, dark UI #060513, gold #FEC357. The elephant's pink is the brief's "pink elephant".
const PAL = { bg: '#EDE8FE', ink: '#191632', violet: '#633BFE', lilac: '#E6D2FC', deep: '#5B45A3', dark: '#060513', gold: '#FEC357' };
scene.background.set('#F0E9F5');   // = the far floor as rendered from these cross-desk cameras (looking toward the open front), so no horizon line shows
M.stage.color.set('#F8F6FF'); M.rug.color.set('#ECE6FB'); hemi.color.set('#F6F3FF'); hemi.groundColor.set('#DCD3F2');
M.fig.color.set('#8270C4'); M.hair.color.set(PAL.deep); M.cover.color.set('#F4B84A');
const INK = PAL.ink, UI = '"Inter", sans-serif', SERIF = '"Instrument Serif", serif';
function rr(g, x, y, w, h, r, fill, stroke, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function makeCard(w, h) {   // dark, in-app style card (the store screenshots' UI surface) with a deep-violet rim
  const g = new THREE.Group();
  const border = mesh(new RoundedBoxGeometry(w + 0.024, h + 0.024, 0.01, 3, 0.024), new THREE.MeshBasicMaterial({ color: PAL.deep, transparent: true, toneMapped: false }), false, false);
  border.position.z = -0.006; g.add(border);
  const panel = mesh(new RoundedBoxGeometry(w, h, 0.012, 3, 0.02), new THREE.MeshBasicMaterial({ color: PAL.dark, transparent: true, toneMapped: false }), false, false); g.add(panel);
  g.userData = { border, panel }; scene.add(g); return g;
}
function cardCanvas(card, w, h, cw, ch) {
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  m.position.z = 0.0075; m.renderOrder = 5; card.add(m); return { c, g: c.getContext('2d'), t, m, key: '' };
}
function makeLabel(text, w = 0.2, col = PAL.lilac) {
  const lab = new THREE.Group();
  const lb = mesh(new RoundedBoxGeometry(w, 0.08, 0.016, 3, 0.016), new THREE.MeshBasicMaterial({ color: col, transparent: true, toneMapped: false }), false, false); lab.add(lb);
  const ltx = textTexture(text, { font: SERIF, w: Math.round(3200 * w), h: 256, size: 170, color: INK, pad: 24 });
  const lp = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.01, 0.076), new THREE.MeshBasicMaterial({ map: ltx.tex, transparent: true, depthWrite: false, toneMapped: false }));
  lp.position.z = 0.0085; lp.renderOrder = 6; lab.add(lp); lab.userData = { body: lb, txt: lp, tx: ltx, label: text }; scene.add(lab); return lab;
}
function anchor(obj, cx, cy, wpx, wWorld) {   // camera-facing object at a fixed screen spot, 2.2 m in front of the camera
  const dd = 2.2, th = Math.tan(camera.fov * D2R / 2), q = camera.quaternion;
  const nx = 2 * cx / W - 1, ny = 1 - 2 * cy / H;
  obj.position.copy(camera.position).add(V(0, 0, -1).applyQuaternion(q).multiplyScalar(dd))
    .add(V(1, 0, 0).applyQuaternion(q).multiplyScalar(nx * dd * th * W / H)).add(V(0, 1, 0).applyQuaternion(q).multiplyScalar(ny * dd * th));
  obj.quaternion.copy(q); obj.scale.setScalar((wpx / H * 2 * dd * th) / wWorld);
}
// desk dressing moved so the elephant has a clear run along the front of the desk; the desk lamp lights the chosen job
// (the desk lamp would sit between the cross-desk cameras and the elephant, so it is hidden; a warm light stays for the job)
lamp.visible = false; mug.position.set(-0.52, DESK_Y + 0.0475, -0.26);
scene.traverse(o => { if (!o.isMesh || o.rotation.x !== -Math.PI / 2 || Math.abs(o.position.y - (DESK_Y + 0.002)) > 1e-4) return;
  if (Math.abs(o.position.x - 0.47) < 1e-3 && Math.abs(o.position.z - 0.06) < 1e-3) o.position.set(-0.52, DESK_Y + 0.002, -0.26);    // mug's contact shadow
  else if (Math.abs(o.position.x - 0.5) < 1e-3 && Math.abs(o.position.z + 0.22) < 1e-3) o.visible = false; });                    // lamp's contact shadow
const taskLight = new THREE.PointLight('#ffd9a0', 0, 1.6, 2); taskLight.position.set(-0.06, DESK_Y + 0.45, 0.0); scene.add(taskLight);

// ---- the pink elephant (original, built from primitives); local +x is where it faces, origin between its feet
const EL_PINK = std('#F4A7C8', 0.62, { emissive: new THREE.Color('#F27DB2'), emissiveIntensity: 0.0 });
const EL_EAR = std('#F8C3DA', 0.7), EL_EYE = std('#191632', 0.4);
const eleph = new THREE.Group(); const elBody = new THREE.Group(); eleph.add(elBody);
{
  const body = mesh(new THREE.SphereGeometry(1, 40, 28), EL_PINK); body.scale.set(0.17, 0.13, 0.125); body.position.set(0, 0.2, 0); elBody.add(body);
  const hd = mesh(new THREE.SphereGeometry(0.1, 32, 24), EL_PINK); hd.position.set(0.17, 0.28, 0); elBody.add(hd);
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(1, 24, 18), EL_EAR); ear.scale.set(0.022, 0.085, 0.075); ear.position.set(0.13, 0.28, s * 0.095); ear.rotation.y = s * 0.5; elBody.add(ear);
    const eye = mesh(new THREE.SphereGeometry(0.011, 12, 10), EL_EYE); eye.position.set(0.245, 0.305, s * 0.05); elBody.add(eye);
  }
  const trunk = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0.25, 0.26, 0), V(0.3, 0.2, 0), V(0.315, 0.12, 0), V(0.35, 0.075, 0), V(0.385, 0.085, 0)]), 32, 0.024, 12, false), EL_PINK); elBody.add(trunk);
  for (const [x, z] of [[0.09, 0.065], [0.09, -0.065], [-0.09, 0.065], [-0.09, -0.065]]) { const lg = mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.12, 20), EL_PINK); lg.position.set(x, 0.06, z); elBody.add(lg); }
  const tail = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 8), EL_PINK); tail.position.set(-0.175, 0.17, 0); tail.rotation.z = 0.6; elBody.add(tail);
}
scene.add(eleph);
const elBlob = blob(0.5, 0.36, 0.0, DESK_Y + 0.002);
const EL = 0.62;   // base scale: a toy-sized elephant on the desk
const puff = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 8, 48), new THREE.MeshBasicMaterial({ color: '#F7B9D5', transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); scene.add(puff);
const HIDE = V(-1.76, 0, -1.66);   // behind the plant as seen from the S4 camera, peeking out on its left   // behind the plant at the back left (S4)
const DESK_Z = 0.2;                // the elephant's lane along the front of the desk
function springIn(t, t0, d = 0.45) { const x = clamp((t - t0) / d); if (x <= 0) return 0; return 1 - Math.exp(-6 * x) * Math.cos(9 * x); }
// elephant state: position on the desk / falling / hidden / noticed, plus puffs where it vanishes or appears
function elephantAt(t) {
  const st = { p: V(0.05, DESK_Y, DESK_Z), s: EL, rotZ: 0, yaw: 0, vis: true, glow: 0, puff: null };
  const fallOff = (t0, t1, x0, dir) => { const u = clamp((t - t0) / (t1 - t0)); st.p.set(x0 + dir * 0.12 * u, DESK_Y - 0.9 * u * u, DESK_Z); st.rotZ = -dir * 1.6 * eio(Math.min(1, u * 1.6)); };
  if (t < T.push1B) { st.p.x = lerp(0.05, 0.58, eio(clamp(t / T.push1B))); }
  else if (t < T.fall1B) fallOff(T.push1B, T.fall1B, 0.58, 1);
  else if (t < T.pop1) { st.vis = false; }
  else if (t < S.s4) {
    const sc = EL * 1.2;
    if (t < T.push2A) { st.p.x = 0.25; st.s = sc * springIn(t, T.pop1); st.puff = [V(0.25, DESK_Y + 0.12, DESK_Z), clamp((t - T.pop1) / 0.5)]; }
    else if (t < T.push2B) { st.p.x = lerp(0.25, -0.58, eio(remap(t, T.push2A, T.push2B))); st.s = sc; st.yaw = Math.PI; }
    else if (t < T.fall2B) { fallOff(T.push2B, T.fall2B, -0.58, -1); st.s = sc; st.yaw = Math.PI; st.rotZ = -st.rotZ; }
    else if (t < T.pop2) st.vis = false;
    else { st.p.set(-0.22, DESK_Y, DESK_Z - 0.04); st.s = sc * 1.04 * springIn(t, T.pop2); st.yaw = 0.3; st.puff = [V(-0.22, DESK_Y + 0.12, DESK_Z), clamp((t - T.pop2) / 0.5)]; }
  } else if (t < T.rebound) {   // S4: hiding behind the plant; the checking beam finds it
    st.p.copy(HIDE); st.s = EL * 1.25; st.yaw = -0.6; st.glow = sm(remap(t, T.beamFind - 0.1, T.beamFind + 0.3)) * (0.6 + 0.4 * Math.sin(t * 6));
  } else if (t < T.notice) {   // the rebound: back on the desk, a little bigger
    st.p.set(-0.4, DESK_Y, 0.15); st.yaw = 0.25; st.s = EL * 1.42 * springIn(t, T.rebound, 0.5); st.puff = [V(-0.4, DESK_Y + 0.14, 0.15), clamp((t - T.rebound) / 0.5)];
  } else {   // noticed: it shrinks and settles in the desk corner, still there
    const u = eio(remap(t, T.notice, T.shrinkB));
    st.p = vl(V(-0.4, DESK_Y, 0.15), V(-0.43, DESK_Y, 0.25), u); st.yaw = lerp(0.25, -0.6, u); st.s = lerp(EL * 1.42, EL * 0.5, u);
  }
  return st;
}
function placeElephant(t) {
  const st = elephantAt(t);
  eleph.visible = st.vis && st.s > 0.002; eleph.position.copy(st.p); eleph.rotation.set(0, st.yaw, st.rotZ, 'YXZ'); eleph.scale.setScalar(Math.max(st.s, 0.0001));
  EL_PINK.emissiveIntensity = 0.45 * st.glow;
  const onDesk = Math.abs(st.p.y - DESK_Y) < 0.01; elBlob.position.set(st.p.x, DESK_Y + 0.002, st.p.z); elBlob.material.opacity = eleph.visible && onDesk ? 0.4 * Math.min(1, st.s / EL) : 0; elBlob.scale.setScalar(Math.max(st.s / EL, 0.001));
  if (st.puff && st.puff[1] < 1) { puff.visible = true; puff.position.copy(st.puff[0]); puff.quaternion.copy(camera.quaternion); puff.scale.setScalar(0.5 + 1.6 * st.puff[1]); puff.material.opacity = 0.7 * (1 - st.puff[1]); } else puff.visible = false;
  return st;
}

// ---- the card (S3): "white bear" and the bell that keeps ringing
const CARD_POS = V(-0.58, 1.55, 0.42);
const card = makeCard(0.7, 0.52); const cardTx = cardCanvas(card, 0.68, 0.505, 1220, 906);
function bearIcon(g, x, y, s, a) {
  g.globalAlpha = a; g.fillStyle = '#FFFFFF';
  for (const [dx, dy, r] of [[-0.62, -0.62, 0.3], [0.62, -0.62, 0.3]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); g.fill(); }
  g.beginPath(); g.ellipse(x, y, s, s * 0.9, 0, 0, 7); g.fill();
  g.fillStyle = '#E9E3F2'; g.beginPath(); g.ellipse(x, y + s * 0.3, s * 0.42, s * 0.3, 0, 0, 7); g.fill();
  g.fillStyle = PAL.dark; g.beginPath(); g.arc(x - s * 0.35, y - s * 0.15, s * 0.09, 0, 7); g.arc(x + s * 0.35, y - s * 0.15, s * 0.09, 0, 7); g.fill();
  g.beginPath(); g.ellipse(x, y + s * 0.18, s * 0.14, s * 0.1, 0, 0, 7); g.fill(); g.globalAlpha = 1;
}
function bellIcon(g, x, y, s, a, swing) {
  g.save(); g.globalAlpha = a; g.translate(x, y - s); g.rotate(swing); g.translate(0, s);
  g.fillStyle = PAL.gold; g.beginPath(); g.moveTo(-s * 0.8, s * 0.55); g.quadraticCurveTo(-s * 0.75, -s * 0.9, 0, -s * 0.95); g.quadraticCurveTo(s * 0.75, -s * 0.9, s * 0.8, s * 0.55); g.closePath(); g.fill();
  g.fillRect(-s * 0.95, s * 0.5, s * 1.9, s * 0.16); g.beginPath(); g.arc(0, s * 0.8, s * 0.18, 0, 7); g.fill(); g.restore(); g.globalAlpha = 1;
}
function drawCard(t) {
  const m = sm(remap(t, S.s3 - 0.05, S.s3 + 0.3)), b = sm(remap(t, T.bear - 0.1, T.bear + 0.3));
  const rings = BELLS.filter(x => t >= x).length, last = BELLS[Math.max(0, rings - 1)];
  const swing = rings ? 0.45 * Math.exp(-(t - last) * 5) * Math.sin((t - last) * 28) : 0;
  const key = [m, b, rings, swing].map(x => (+x).toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle';
  g.globalAlpha = m; g.fillStyle = '#B9A4FF'; g.font = `600 52px ${UI}`; g.fillText('DON’T THINK OF A', 60, 92);
  g.fillStyle = '#FFFFFF'; g.font = `400 130px ${SERIF}`; g.fillText('white bear', 60, 200);
  bearIcon(g, 290, 520, 150, m * b);
  if (rings > 0) { bellIcon(g, 820, 470, 120, m, swing);
    g.globalAlpha = m * Math.exp(-(t - last) * 2.5); g.strokeStyle = PAL.gold; g.lineWidth = 10; for (const r of [150, 190]) { g.beginPath(); g.arc(820, 460, r, -0.9, -0.2); g.stroke(); g.beginPath(); g.arc(820, 460, r, Math.PI + 0.2, Math.PI + 0.9); g.stroke(); }
    for (let i = 0; i < rings; i++) bellIcon(g, 640 + i * 92, 790, 34, m, 0); }
  g.globalAlpha = 1; tex.needsUpdate = true;
}

// ---- the "checking" beam (S4): a soft lilac cone from the head that sweeps the room and lands on the elephant
const beamGeo = new THREE.ConeGeometry(0.32, 1, 40, 1, true); beamGeo.translate(0, -0.5, 0); beamGeo.rotateX(-Math.PI / 2);   // apex at origin, opens along +z
const beamMat = new THREE.MeshBasicMaterial({ color: '#8C6BFF', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
const beam = new THREE.Mesh(beamGeo, beamMat); beam.renderOrder = 4; scene.add(beam);
// ---- labels (world, camera-facing): "checking", "rebound", "noticed"
const checkLab = makeLabel('checking', 0.26), reboundLab = makeLabel('rebound', 0.26), noticeLab = makeLabel('noticed', 0.24);
const LABELS = [checkLab, reboundLab, noticeLab];

// ---- the note card (S5): the one specific job, written large and in sync with the pencil
const NOTE = { w: 0.5, h: 0.3, cw: 1000, ch: 600 };
const note = new THREE.Group();
const noteBody = mesh(new RoundedBoxGeometry(NOTE.w, NOTE.h, 0.01, 3, 0.022), new THREE.MeshBasicMaterial({ color: '#FFFDF7', transparent: true, toneMapped: false }), false, false); note.add(noteBody);
const noteTx = (() => { const c = document.createElement('canvas'); c.width = NOTE.cw; c.height = NOTE.ch; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g: c.getContext('2d'), t, key: '' }; })();
const notePlane = new THREE.Mesh(new THREE.PlaneGeometry(NOTE.w - 0.01, NOTE.h - 0.01), new THREE.MeshBasicMaterial({ map: noteTx.t, transparent: true, depthWrite: false, toneMapped: false }));
notePlane.position.z = 0.0062; notePlane.renderOrder = 5; note.add(notePlane); note.userData = { body: noteBody }; scene.add(note);
function drawNote(p) {
  const key = p.toFixed(3); if (key === noteTx.key) return; noteTx.key = key;
  const g = noteTx.g; g.clearRect(0, 0, NOTE.cw, NOTE.ch); g.textBaseline = 'middle';
  g.fillStyle = PAL.deep; g.font = `600 54px ${UI}`; g.fillText('ONE JOB', 74, 130);
  if (p > 0) { const L = 'Draft the intro'; g.font = `italic 400 150px ${SERIF}`; const w = g.measureText(L).width;
    g.save(); g.beginPath(); g.rect(64, 200, (w + 24) * p, 300); g.clip(); g.fillStyle = INK; g.fillText(L, 74, 360); g.restore(); }
  noteTx.t.needsUpdate = true;
}

// ---------------------------------------------------------------- choreography: seated at the desk (stool), facing -z
const SEAT = V(0, 0.64, 0.7);
function pose(t, el) {
  const P = {};
  P.breath = Math.sin(t * 2 * Math.PI / 4.2);
  const pushing = (t < T.push1B) || (t >= T.push2A - 0.3 && t < T.push2B);
  P.lean = track(t, [[0, 0.38], [T.push1B, 0.4], [T.push1B + 0.4, 0.12], [T.push2A - 0.35, 0.18], [T.push2A, 0.4], [T.push2B, 0.4], [T.push2B + 0.4, 0.12], [S.s4, 0.2], [S.s5, 0.2], [T.job, 0.2], [T.writeA, 0.32], [30, 0.3]]);
  P.headPitch = track(t, [[0, -0.35], [T.pop1 - 0.05, -0.35], [T.pop1 + 0.3, -0.15], [T.push2A, -0.35], [T.pop2 + 0.3, -0.15], [S.s4, -0.35], [T.beamA, -0.1], [T.beamFind, -0.05], [T.rebound + 0.4, -0.3], [T.notice, -0.3], [T.job, -0.45], [30, -0.5]]);
  P.headYaw = track(t, [[0, -0.25], [T.push1B, -0.45], [T.pop1 + 0.3, -0.2], [T.push2A, 0.0], [T.push2B, 0.45], [T.pop2 + 0.3, 0.25], [S.s4, 0.0], [T.beamA, -0.2], [T.beamFind, 0.55], [T.rebound + 0.3, -0.3], [T.notice, -0.4], [T.notice + 0.35, -0.55], [T.job, 0.05], [30, 0.05]]);
  P.nod = Math.sin(clamp(remap(t, T.notice, T.notice + 0.6)) * Math.PI) * 0.22;   // a small acknowledging nod
  P.pushing = pushing;
  return P;
}
const figRef = {};
function placeFigure(t, P) {
  const br = P.breath, pel = SEAT.clone();
  torso.position.copy(pel);
  torso.rotation.set(-P.lean, P.headYaw * 0.15, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + P.lean * 0.45 - P.nod, P.headYaw, 0, 'YXZ');
  torso.updateMatrixWorld(true);
  const fwd = V(0, 0, -1), lat = V(1, 0, 0);
  const shL = torso.localToWorld(V(-0.15, 0.315, 0.0)), shR = torso.localToWorld(V(0.15, 0.315, 0.0));
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    const hip = torso.localToWorld(V(sx * 0.085, 0.02, 0.0)); hip.y = Math.max(hip.y, 0.6);
    const r = ik(hip, V(sx * 0.12, 0.075, 0.27), 0.4, 0.43, V(sx * 0.15, 1, -0.8));
    const [th, sh, hi, kn, an] = i === 0 ? [limbs.thL, limbs.shL, J.hiL, J.knL, J.anL] : [limbs.thR, limbs.shR, J.hiR, J.knR, J.anR];
    hi.position.copy(hip); kn.position.copy(r.mid); an.position.copy(r.end);
    setLimb(th, hip, r.mid); setLimb(sh, r.mid, r.end);
    feet[i].position.copy(r.end).add(V(0, 0, -0.045)); feet[i].position.y = r.end.y - 0.047; feet[i].rotation.set(0, sx * -0.1, 0);
    footBlobs[i].position.set(feet[i].position.x, 0.013, feet[i].position.z); footBlobs[i].material.opacity = 0.6;
  }
  // hands: resting on the desk / pushing the elephant / writing the one job
  const restL = V(-0.16, DESK_Y + 0.045, 0.27), restR = V(0.2, DESK_Y + 0.045, 0.27);
  let hL = restL.clone(), hR = restR.clone();
  const pushAmt = t < T.push1B ? 1 - sm(remap(t, T.push1B - 0.1, T.push1B + 0.3)) : t < T.push1B + 0.3 ? 1 - sm(remap(t, T.push1B - 0.1, T.push1B + 0.3)) : (sm(remap(t, T.push2A - 0.3, T.push2A)) * (1 - sm(remap(t, T.push2B - 0.05, T.push2B + 0.3))));
  if (t < S.s3 && pushAmt > 0) {
    const side = t < T.pop1 ? -1 : 1;   // first push from the left side (to +x), second from the right side (to -x)
    const ex = t < T.pop1 ? lerp(0.05, 0.58, eio(clamp(t / T.push1B))) : lerp(0.25, -0.58, eio(remap(t, T.push2A, T.push2B)));
    const contact = V(ex + side * 0.12, DESK_Y + 0.08, DESK_Z);
    hL = vl(restL, contact.clone().add(V(0, 0, -0.05)), pushAmt); hR = vl(restR, contact.clone().add(V(0, 0.02, 0.05)), pushAmt);
  }
  // S5: writing in the notebook
  const wr = sm(remap(t, T.job, T.writeA)), wig = (t > T.writeA && t < T.writeB) ? 1 : 0;
  if (wr > 0) {
    const pen = NBPOS.clone().add(V(-0.06 + 0.12 * clamp(remap(t, T.writeA, T.writeB)), 0.045 + 0.006 * Math.sin(t * 36) * wig, -0.02 + 0.01 * Math.sin(t * 9) * wig));
    hR = vl(hR, pen, wr); hL = vl(hL, NBPOS.clone().add(V(-0.17, 0.03, 0.06)), wr);
    pencil.position.copy(hR.clone().add(V(0, -0.012, 0))); pencil.quaternion.setFromUnitVectors(V(0, 1, 0), V(-0.25, -1, -0.35).normalize());
  } else { pencil.position.set(0.28, DESK_Y + 0.006, 0.14); pencil.rotation.set(Math.PI / 2, 0, 1.2); }
  const pole = sx => V(sx * 0.8, -0.5, 0.6);
  const aL = ik(shL, hL, 0.25, 0.235, pole(-1)), aR = ik(shR, hR, 0.25, 0.235, pole(1));
  J.shL.position.copy(shL); J.shR.position.copy(shR); J.elL.position.copy(aL.mid); J.elR.position.copy(aR.mid);
  J.haL.position.copy(aL.end); J.haR.position.copy(aR.end);
  setLimb(limbs.uaL, shL, aL.mid); setLimb(limbs.faL, aL.mid, aL.end); setLimb(limbs.uaR, shR, aR.mid); setLimb(limbs.faR, aR.mid, aR.end);
  J.haL.lookAt(aL.mid); J.haR.lookAt(aR.mid);
  figRef.headP = head.getWorldPosition(V(0, 0, 0));
}
const NBPOS = V(-0.06, DESK_Y + NB.h / 2 + 0.001, 0.12);
function setProps(t) {
  notebook.visible = true; notebook.position.copy(NBPOS); notebook.rotation.set(0, 0.06, 0);
  coverPivot.rotation.z = Math.PI * 0.985 * sm(remap(t, T.job - 0.3, T.job + 0.3)); notebook.updateMatrixWorld(true);
  nbBlob.position.set(NBPOS.x, DESK_Y + 0.003, NBPOS.z); nbBlob.material.opacity = 0.5;
  ink.forEach((ln, i) => { const p = clamp(remap(t, T.writeA + i * 0.28, T.writeA + i * 0.28 + 0.26)); ln.visible = p > 0; ln.scale.x = Math.max(0.0001, 0.15 * p * (i === 4 ? 0.6 : 1)); ln.position.x = 0.005 - 0.075 + 0.075 * p * (i === 4 ? 0.6 : 1); });
}
function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  const st = placeElephant(t);
  // card (S3)
  const v = sm(remap(t, S.s3 - 0.05, S.s3 + 0.25)) * (1 - sm(remap(t, S.s4 - 0.3, S.s4 - 0.02)));
  card.visible = v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0); card.scale.setScalar(1.0);
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
  // the checking beam (S4)
  const bv = sm(remap(t, T.beamA - 0.2, T.beamA + 0.3)) * (1 - sm(remap(t, T.rebound - 0.4, T.rebound)));
  beam.visible = bv > 0.003 && t >= S.s4 && t < S.s5;
  if (beam.visible && figRef.headP) {
    const sweep = eio(remap(t, T.beamA, T.beamFind));
    const from = V(0.9, 0.5, -2.0), to = HIDE.clone().add(V(0, 0.15, 0)), aim = vl(from, to, sweep);
    if (t > T.beamFind) aim.add(V(0.03 * Math.sin(t * 3), 0, 0));
    const hp = figRef.headP.clone().add(V(0, 0.02, 0)); beam.position.copy(hp); beam.lookAt(aim);
    const len = hp.distanceTo(aim); beam.scale.set(lerp(0.9, 0.7, sweep), lerp(0.9, 0.7, sweep), len);
    beamMat.opacity = 0.26 * bv + 0.08 * sm(remap(t, T.beamFind, T.beamFind + 0.3)) * bv;
  }
  // labels
  const lab = (L, a, pos, s) => { L.visible = a > 0.003; if (!L.visible) return; L.position.copy(pos); L.quaternion.copy(camera.quaternion); L.scale.setScalar(s * lerp(0.75, 1, a)); L.userData.body.material.opacity = a; L.userData.txt.material.opacity = a; };
  lab(checkLab, sm(remap(t, T.beamA + 0.3, T.beamA + 0.6)) * (1 - sm(remap(t, T.beamFind + 1.6, T.beamFind + 1.9))), V(-1.55, 1.08, -1.45), 1.5);
  lab(reboundLab, sm(remap(t, T.rebound + 0.35, T.rebound + 0.65)) * (1 - sm(remap(t, S.s5 - 0.3, S.s5 - 0.02))), V(-0.4, DESK_Y + 0.45, 0.15), 1.3);
  lab(noticeLab, sm(remap(t, T.notice + 0.3, T.notice + 0.6)) * (1 - sm(remap(t, T.job + 0.2, T.job + 0.5))), V(-0.12, DESK_Y + 0.34, 0.25), 0.75);
  // the task light warms the notebook once the one job is chosen
  taskLight.intensity = 0.7 * sm(remap(t, T.job - 0.2, T.job + 0.6));
  // note card (S5)
  const nIn = sm(remap(t, T.job + 0.1, T.job + 0.45)), nOut = sm(remap(t, T.pullA + 0.6, T.pullA + 1.1));
  note.visible = t >= S.s5 && nIn * (1 - nOut) > 0.003;
  if (note.visible) { anchor(note, 500, 730, 640 * lerp(0.92, 1, nIn), NOTE.w); noteBody.material.opacity = nIn * (1 - nOut); notePlane.material.opacity = nIn * (1 - nOut);
    drawNote(clamp(remap(t, T.writeA, T.writeB))); }
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 across the desk, facing the performer: he pushes the pink elephant off the desk
  { a: S.s1, b: S.s2, k0: [V(0.22, 1.2, 0.3), 160, 14, 2.5, 30], k1: [V(0.22, 1.2, 0.3), 164, 13, 2.35, 30] },
  // S2 across the desk from the left: it pops back, he pushes it off the other side, it pops back again
  { a: S.s2, b: S.s3, k0: [V(-0.05, 1.2, 0.3), -158, 11, 2.4, 30], k1: [V(-0.05, 1.2, 0.3), -162, 11, 2.3, 30] },
  // S3 the card beside him: white bear, the bell keeps ringing
  { a: S.s3, b: S.s4, k0: [V(-0.58, 1.55, 0.42), 176, 4, 3.55, 30], k1: [V(-0.58, 1.55, 0.42), 172, 4, 3.45, 30] },
  // S4 the wide room from behind him: the checking beam sweeps and finds the elephant behind the plant; the rebound
  { a: S.s4, b: S.s5, k0: [V(-0.75, 0.95, -0.6), 22, 15, 4.8, 30], k1: [V(-0.7, 0.95, -0.55), 16, 14, 4.5, 30] },
  // S5 across the desk, close: noticed, shrinks to the corner; one specific job; then a slow pull back for the lock-up
  { a: S.s5, b: S.end, m: [T.pullA, 27.2], ease: 'sine', k0: [V(-0.05, 1.28, 0.35), 168, 15, 2.3, 30], k1: [V(-0.08, 1.32, 0.3), 160, 15, 2.8, 30],
    k2: [V(-0.09, 1.32, 0.3), 157, 15, 2.72, 30] },
];
window.__SHOTS = SHOTS;

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
  // crucial in-scene text: the card, the note card and the labels, each audited by its own oriented box
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const keep = b => (onScreen(b) ? b : null);
  const crucial = { card: card.visible ? keep(textBox(card)) : null, note: note.visible ? keep(textBox(note)) : null };
  for (const L of LABELS) crucial[L.userData.label] = L.visible ? keep(textBox(L)) : null;
  const r = { t, card: null, crucial, head: sphereBox(head, 0.12), desk: screenBox(deskTop) };
  const cb = capEl.getBoundingClientRect();
  r.caption = capEl.innerHTML && +capEl.style.opacity > 0.02 ? [cb.left, cb.top, cb.right, cb.bottom].map(Math.round) : null;
  const spans = [...capEl.querySelectorAll('.ln')].map(e => e.getBoundingClientRect());
  r.captionText = spans.length && r.caption ? [Math.min(...spans.map(b => b.left)), Math.min(...spans.map(b => b.top)), Math.max(...spans.map(b => b.right)), Math.max(...spans.map(b => b.bottom))].map(Math.round) : null;
  r.captionLines = spans.length;
  r.shot = SHOTS.findIndex(x => t >= x.a && t < x.b) + 1 || 5;
  return r;
};


// ---------------------------------------------------------------- captions (Instrument Serif; store ink #191632, key words in store violet #633BFE)
const hl = s => `<span class="hl">${s}</span>`;
const sg = (html, t = null) => ({ html, t });
const C2 = 96, C1 = 108;
const superP = PS('super')[0][1], studyP = PS('study')[0][1], mechP = PS('mech')[0][1], rebP = PS('rebound')[0][1], payP2 = PS('payoff')[1][1];
const CAPS = [
  { a: -1, b: TL.super.start - 0.12, size: C2, lines: [[sg('Try not to picture')], [sg(`a ${hl('pink elephant')}.`, 1.2)]] },
  { a: TL.super.start - 0.06, b: superP - 0.12, size: C1, lines: [[sg('Too late.')]] },
  { a: superP - 0.06, b: TL.study.start - 0.12, size: C2, lines: [[sg('Why does fighting a thought')], [sg(`${hl('bring it back?')}`, 4.25)]] },
  { a: TL.study.start - 0.06, b: studyP - 0.12, size: C1, lines: [[sg('In one study,')]] },
  { a: studyP - 0.06, b: TL.mech.start - 0.12, size: C2, lines: [[sg(`people told to avoid a ${hl('white bear')}`)], [sg(`${hl('kept ringing a bell')} for it.`, 8.45)]] },
  { a: TL.mech.start - 0.06, b: mechP - 0.12, size: C1, lines: [[sg('One theory:')]] },
  { a: mechP - 0.06, b: TL.rebound.start - 0.12, size: C2, lines: [[sg('a part of your mind')], [sg(`${hl('keeps checking')} for it.`, 12.25)]] },
  { a: TL.rebound.start - 0.06, b: rebP - 0.12, size: C2, lines: [[sg('Afterwards, it tended')], [sg(`to ${hl('return more')}:`, 14.95)]] },
  { a: rebP - 0.06, b: TL.bridge.start - 0.12, size: C2, lines: [[sg(`a ${hl('small, repeated')} effect.`)]] },
  { a: TL.bridge.start - 0.06, b: TL.payoff.start - 0.12, size: C1, lines: [[sg(`So what ${hl('actually helps?')}`)]] },
  { a: TL.payoff.start - 0.06, b: payP2 - 0.12, size: C2, lines: [[sg('Don’t fight it.')], [sg(`${hl('Notice it')},`, 21.35)]] },
  { a: payP2 - 0.06, b: TL.payoff.end + 0.4, size: C2, lines: [[sg('then give your mind')], [sg(`${hl('one specific job')}.`, 23.0)]] },
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
      // fit: never wider than the 800 px caption zone (x 100-900, 2026-11-11 rule) (all segments laid out from the start, so nothing reflows)
      let fs = c.size;
      for (const ln of capEl.querySelectorAll('.ln')) while (ln.scrollWidth > 796 && fs > 56) { fs -= 2; capEl.style.fontSize = fs + 'px'; }
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
cardTx.key = ''; noteTx.key = '';
// redraw the label textures now that the fonts are present
for (const lab of LABELS) { const { canvas: c, g: ctx } = lab.userData.tx; ctx.clearRect(0, 0, c.width, c.height); let s = 170; ctx.font = `400 ${s}px ${SERIF}`;
  while (ctx.measureText(lab.userData.label).width > c.width - 60) { s -= 4; ctx.font = `400 ${s}px ${SERIF}`; }
  ctx.fillStyle = '#191632'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab.userData.label, c.width / 2, c.height * 0.54); lab.userData.tx.tex.needsUpdate = true; }
renderAt(0);
window.ready = true;
