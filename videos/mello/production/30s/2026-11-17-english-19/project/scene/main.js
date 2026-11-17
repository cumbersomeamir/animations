// Mello 30 s english19-01 (English): "why do Mondays feel new?" (the fresh start effect: Dai, Milkman & Riis 2015,
// Psychological Science, Studies 1A and 1B; the effect named in Dai, Milkman & Riis 2014). The brief's proposed topic
// (an if-then plan, implementation intentions) was already covered by hindi04-01 and swapped twice since, so a fresh
// same-genre psychology insight about starting goals was chosen (context/29). Rules retained: 2026-11-11 story/caption/
// palette rules (context/10 section 8), the first-frame rule (section 9), the store-sampled palette (context/22) and a
// soothing original bed under the voice. Room, rig, camera helper, caption mechanics, dark in-app card and the oriented-
// box audit are carried over from ../../2026-11-15-english-18/project. New: a giant standing calendar whose pages flip
// (Sunday's slip-ups -> MONDAY 1 -> SUMMER BREAK, DAY 1 -> a month with a gold DAY 1 tag), and the old page drifting away.
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







// ------------------------------------------------------------------ shot list (7 distinct shots) and beats
const PS = l => TL[l].pauses;
// word starts measured with faster-whisper word timestamps on generated/narration.wav (about 0.1 s early; see notes):
// "Mondays" 0.43, "fresh start effect" 3.11, "picked a day" 5.91, "goal reminder" 6.79, "March twentieth" 8.24,
// "first day of spring" 9.76, "over three times as many" 11.14, "second study" 13.77, "first day of summer break" 15.61,
// "new beginning" 17.38, "past slip-ups" 18.26, "further away" 19.30, "pick a nearby day" 22.36, "day one" 24.02, "begin there" 24.76
const S = { s1: 0.0, s2: 1.7, s3: 4.4, s4: 7.9, s5: 13.45, s6: 17.15, s7: 20.45, end: 30.0 };
const T = {
  flip0A: -1.0, flip0B: 1.0,                  // frame 0: Sunday's page is mid-flip, revealing MONDAY 1
  strip: 4.75, picked: 6.0,                   // S3: the week strip; March 20 ringed
  row1: 8.35, row2: 9.85, grow2: 11.2,        // S4: "third Thursday" 7%, then "first day of spring" 26%
  flip1A: 15.25, flip1B: 16.05,               // S5: the page flips to SUMMER BREAK, DAY 1
  driftA: 17.5, driftB: 20.3,                 // S6: the old page with its slip-ups drifts away
  reachA: 22.3, tagA: 23.3, tagB: 24.15, stepA: 24.9, stepB: 25.7,   // S7: he puts a gold DAY 1 tag on a nearby day, then steps off
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






// ---------------------------------------------------------------- episode props: store palette, stage, lectern, audience, the thought bubble, the card
// palette sampled 2026-11-11 from the current Play listing (context/22): stage #EDE8FE, ink #191632, violet #633BFE,
// lilac #E6D2FC, deep violet #5B45A3, dark UI #060513, gold #FEC357.
const PAL = { bg: '#EDE8FE', ink: '#191632', violet: '#633BFE', lilac: '#E6D2FC', deep: '#5B45A3', dark: '#060513', gold: '#FEC357' };
M.stage.color.set('#F8F6FF'); M.rug.color.set('#ECE6FB'); hemi.color.set('#F6F3FF'); hemi.groundColor.set('#DCD3F2');
scene.background.set('#EAE4F4');   // = the back wall as rendered
M.fig.color.set('#8270C4'); M.hair.color.set(PAL.deep);
const INK = PAL.ink, UI = '"Inter", sans-serif', SERIF = '"Instrument Serif", serif';
function rr(g, x, y, w, h, r, fill, stroke, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function makeCard(w, h, panelCol = PAL.dark, rimCol = PAL.deep) {
  const g = new THREE.Group();
  const border = mesh(new RoundedBoxGeometry(w + 0.024, h + 0.024, 0.01, 3, 0.024), new THREE.MeshBasicMaterial({ color: rimCol, transparent: true, toneMapped: false }), false, false);
  border.position.z = -0.006; g.add(border);
  const panel = mesh(new RoundedBoxGeometry(w, h, 0.012, 3, 0.02), new THREE.MeshBasicMaterial({ color: panelCol, transparent: true, toneMapped: false }), false, false); g.add(panel);
  g.userData = { border, panel }; scene.add(g); return g;
}
function cardCanvas(card, w, h, cw, ch) {
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  m.position.z = 0.0075; m.renderOrder = 5; card.add(m); return { c, g: c.getContext('2d'), t, m, key: '' };
}

// ---- the room: hide the desk set; keep the plant; the giant standing calendar takes the stage
for (const o of [deskTop, mug, lamp, lampLight, pencil, seat, ped, base, notebook]) o.visible = false;
for (const o of scene.children) if (o.isMesh && o.geometry && o.geometry.type === 'CylinderGeometry' && o.material === M.leg) o.visible = false;   // desk legs
for (const o of scene.children) if (o.isMesh && o.material && o.material.map === blobTex && o !== footBlobs[0] && o !== footBlobs[1]) o.visible = false;   // old contact shadows
plant.position.set(-1.25, 0, -1.5); blob(0.6, 0.6, 0.5).position.set(-1.25, 0.002, -1.5);
blob(1.4, 0.9, 0.3).position.set(0.15, 0.012, 0.15);
// ---- the giant calendar: a board on an easel; a current page and a flipping page hinged at the top
const CAL = { pos: V(0.22, 0, -0.8), w: 1.0, h: 1.3, y0: 0.55 };   // page bottom at y0, top at y0 + h
const calG = new THREE.Group(); calG.position.copy(CAL.pos); calG.rotation.y = 0.12; scene.add(calG);
const PAGE_C = V(0, CAL.y0 + CAL.h / 2, 0.03);
{ const board = mesh(new RoundedBoxGeometry(CAL.w + 0.08, CAL.h + 0.14, 0.04, 3, 0.02), std('#FFFFFF', 0.6)); board.position.set(0, CAL.y0 + CAL.h / 2 + 0.03, 0); calG.add(board);
  const bar = mesh(new RoundedBoxGeometry(CAL.w + 0.12, 0.07, 0.07, 2, 0.02), std(PAL.deep, 0.5)); bar.position.set(0, CAL.y0 + CAL.h + 0.07, 0.03); calG.add(bar);
  for (const sx of [-1, 1]) { const ring = mesh(new THREE.TorusGeometry(0.03, 0.008, 8, 20), std('#C9BFE6', 0.4)); ring.position.set(sx * 0.3, CAL.y0 + CAL.h + 0.04, 0.05); calG.add(ring);
    const leg = mesh(new THREE.CylinderGeometry(0.018, 0.022, CAL.y0 + CAL.h, 10), M.leg); leg.position.set(sx * 0.42, (CAL.y0 + CAL.h) / 2, -0.12); leg.rotation.x = 0.08; calG.add(leg); }
  const back = mesh(new THREE.CylinderGeometry(0.018, 0.022, CAL.y0 + CAL.h, 10), M.leg); back.position.set(0, (CAL.y0 + CAL.h) / 2 - 0.05, -0.45); back.rotation.x = -0.32; calG.add(back); }
blob(1.2, 0.7, 0.4).position.set(CAL.pos.x, 0.012, CAL.pos.z - 0.05);
function pageTex() { const c = document.createElement('canvas'); c.width = 1024; c.height = 1332; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g: c.getContext('2d'), t }; }
const PG = { old: pageTex(), mon: pageTex(), summer: pageTex(), month: pageTex(), back: pageTex() };
function header(g, txt, col, tcol = '#FFFFFF') { rr(g, 0, 0, 1024, 230, [0, 0, 0, 0], col); g.fillStyle = tcol; g.font = `600 110px ${UI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 512, 122); }
function drawPages() {
  for (const k of ['old', 'mon', 'summer', 'month', 'back']) { const { g } = PG[k]; g.clearRect(0, 0, 1024, 1332); g.fillStyle = '#FFFDF8'; g.fillRect(0, 0, 1024, 1332); }
  { const { g } = PG.old; header(g, 'SUNDAY', PAL.deep); g.fillStyle = '#B6ACCB'; g.font = `400 640px ${SERIF}`; g.textAlign = 'center'; g.fillText('7', 512, 790);
    g.strokeStyle = '#C9BFE0'; g.lineWidth = 22; g.lineCap = 'round';
    for (const [x, y, s] of [[200, 1080, 70], [520, 1160, 60], [820, 1060, 75], [300, 520, 55], [800, 470, 50]]) { g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y + s); g.moveTo(x + s, y - s); g.lineTo(x - s, y + s); g.stroke(); } }
  { const { g } = PG.mon; const grd = g.createLinearGradient(0, 700, 0, 1332); grd.addColorStop(0, '#FFFDF8'); grd.addColorStop(1, '#FFE6B0'); g.fillStyle = grd; g.fillRect(0, 230, 1024, 1102);
    g.fillStyle = PAL.gold; g.beginPath(); g.arc(512, 1332, 330, Math.PI, 0); g.fill();
    header(g, 'MONDAY', PAL.violet); g.fillStyle = PAL.violet; g.font = `400 700px ${SERIF}`; g.textAlign = 'center'; g.fillText('1', 512, 760); }
  { const { g } = PG.summer; const grd = g.createLinearGradient(0, 230, 0, 1332); grd.addColorStop(0, '#FFF3D6'); grd.addColorStop(1, '#FFE0A0'); g.fillStyle = grd; g.fillRect(0, 230, 1024, 1102);
    g.fillStyle = PAL.gold; g.beginPath(); g.arc(780, 520, 150, 0, 7); g.fill();
    header(g, 'SUMMER BREAK', PAL.gold, PAL.ink); g.fillStyle = PAL.violet; g.font = `400 300px ${SERIF}`; g.textAlign = 'center'; g.fillText('DAY 1', 512, 960); }
  { const { g } = PG.month; header(g, 'THIS MONTH', PAL.deep); g.textAlign = 'center'; g.textBaseline = 'middle';
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; g.fillStyle = '#8E86AE'; g.font = `600 52px ${UI}`; days.forEach((d, i) => g.fillText(d, 92 + i * 140, 310));
    g.font = `400 84px ${SERIF}`; for (let i = 0; i < 28; i++) { const r = Math.floor(i / 7), cI = i % 7; const x = 92 + cI * 140, y = 440 + r * 210;
      g.fillStyle = i < 10 ? '#C5BDD8' : INK; g.fillText(String(i + 1), x, y); }
    g.strokeStyle = PAL.violet; g.lineWidth = 8; g.beginPath(); g.arc(92 + 2 * 140, 440 + 210, 62, 0, 7); g.stroke(); }   // today: the 10th (a Wednesday)
  { const { g } = PG.back; g.fillStyle = '#EFEAF8'; g.fillRect(0, 0, 1024, 1332); }
  for (const k in PG) PG[k].t.needsUpdate = true;
}
drawPages();
const M_PAGE = new THREE.MeshStandardMaterial({ map: PG.mon.t, roughness: 0.85 });
const page = new THREE.Mesh(new THREE.PlaneGeometry(CAL.w, CAL.h), M_PAGE); page.position.copy(PAGE_C); page.receiveShadow = true; calG.add(page);
// the page's text area (header + numeral, or the grid rows down to the DAY 1 row), audited as crucial text
const pageText = new THREE.Mesh(new THREE.PlaneGeometry(CAL.w, 0.98), new THREE.MeshBasicMaterial({ visible: false })); pageText.position.copy(PAGE_C).add(V(0, 0.16, 0.002)); calG.add(pageText);
const flipPivot = new THREE.Group(); flipPivot.position.set(-CAL.w / 2, PAGE_C.y, 0.035); calG.add(flipPivot);   // hinged on the left edge: the page swings open like a door
const M_FLIPF = new THREE.MeshStandardMaterial({ map: PG.old.t, roughness: 0.85 }), M_FLIPB = new THREE.MeshStandardMaterial({ map: PG.back.t, roughness: 0.9 });
const flipF = new THREE.Mesh(new THREE.PlaneGeometry(CAL.w, CAL.h), M_FLIPF); flipF.position.x = CAL.w / 2; flipF.castShadow = true; flipPivot.add(flipF);
const flipB = new THREE.Mesh(new THREE.PlaneGeometry(CAL.w, CAL.h), M_FLIPB); flipB.position.set(CAL.w / 2, 0, -0.001); flipB.rotation.y = Math.PI; flipPivot.add(flipB);
// the gold DAY 1 tag (S7) and the drifting old page (S6)
const tagTx = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d'); rr(g, 8, 8, 496, 240, 60, PAL.gold); g.fillStyle = PAL.ink; g.font = `600 120px ${UI}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DAY 1', 256, 134);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, g, t }; })();
const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshBasicMaterial({ map: tagTx.t, transparent: true, toneMapped: false })); tag.renderOrder = 6; calG.add(tag);
const TAG_AT = V((92 + 0 * 140) / 1024 * CAL.w - CAL.w / 2, CAL.y0 + CAL.h - (440 + 2 * 210) / 1332 * CAL.h, 0.045);   // the coming Monday (the 15th)
const drift = new THREE.Mesh(new THREE.PlaneGeometry(CAL.w, CAL.h), new THREE.MeshStandardMaterial({ map: PG.old.t, roughness: 0.85, transparent: true, side: THREE.DoubleSide })); scene.add(drift);

// ---- S3-S4: the dark in-app card (Dai, Milkman & Riis 2015, Study 1A)
const CARD_POS = V(0.1, 1.5, 0.15);
const card = makeCard(0.7, 0.56); const cardTx = cardCanvas(card, 0.68, 0.545, 1220, 978);
function tile(g, x, y, w, h, top, num, a, ring, col = '#FFFFFF') { g.globalAlpha = a; rr(g, x, y, w, h, 18, '#1B1640', '#3A3170', 4);
  g.fillStyle = '#8E86AE'; g.font = `600 34px ${UI}`; g.textAlign = 'center'; g.fillText(top, x + w / 2, y + 40); g.fillStyle = col; g.font = `400 84px ${SERIF}`; g.fillText(num, x + w / 2, y + h - 52);
  if (ring > 0) { g.globalAlpha = a * ring; rr(g, x - 6, y - 6, w + 12, h + 12, 22, null, PAL.gold, 9); } g.globalAlpha = 1; }
function drawCard(t) {
  const m = sm(remap(t, S.s3 - 0.05, S.s3 + 0.3)), st = sm(remap(t, T.strip - 0.1, T.strip + 0.5)), pk = sm(remap(t, T.picked, T.picked + 0.35));
  const r1 = sm(remap(t, T.row1 - 0.1, T.row1 + 0.35)), r2 = sm(remap(t, T.row2 - 0.1, T.row2 + 0.35)), g1 = eio(remap(t, T.row1 + 0.2, T.row1 + 0.9)), g2 = eio(remap(t, T.grow2, T.grow2 + 1.1));
  const res = t >= S.s4;
  const key = [m, st, pk, r1, r2, g1, g2, res ? 1 : 0].map(x => (+x).toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle'; g.textAlign = 'left';
  g.globalAlpha = m; g.fillStyle = '#B9A4FF'; g.font = `600 52px ${UI}`; g.fillText(res ? 'WHO PICKED MARCH 20' : 'ONE STUDY', 60, 86);
  g.fillStyle = '#8E86AE'; g.font = `500 44px ${UI}`; g.fillText(res ? 'for a goal reminder, by its label' : 'pick a day for a goal reminder', 60, 148);
  if (!res) { const days = [['TUE', '18'], ['WED', '19'], ['THU', '20'], ['FRI', '21'], ['SAT', '22'], ['SUN', '23'], ['MON', '24']];
    days.forEach(([d, n], i) => tile(g, 60 + i * 158, 380, 140, 210, d, n, m * st, i === 2 ? pk : 0, i === 2 && pk > 0 ? PAL.gold : '#FFFFFF'));
    g.globalAlpha = m * st; g.fillStyle = '#FFFFFF'; g.font = `400 96px ${SERIF}`; g.textAlign = 'left'; g.fillText('March', 60, 290); }
  else { const X = 60, Wb = 1100, MAX = 30;
    const row = (y, lab, a, v, gr, pct, mode) => { if (a <= 0) return; g.globalAlpha = m * a; g.fillStyle = '#FFFFFF'; g.font = `400 100px ${SERIF}`; g.textAlign = 'left'; g.fillText(lab, X, y);
      rr(g, X, y + 80, Wb, 60, 30, '#1B1640'); const w = Math.max(60, Wb * v / MAX * gr);
      if (mode === 'outline') rr(g, X + 4, y + 84, w - 8, 52, 26, null, '#B9A4FF', 8); else rr(g, X, y + 80, w, 60, 30, PAL.gold);
      if (gr > 0.98) { g.fillStyle = mode === 'outline' ? '#D9CCFF' : PAL.gold; g.font = `400 110px ${SERIF}`; g.textAlign = 'left'; g.fillText(pct, X + w + 30, y + 112); } };
    row(330, '“third Thursday”', r1, 7.23, g1, '7%', 'outline');
    row(620, '“first day of spring”', r2, 25.61, g2, '26%', 'gold'); }
  g.globalAlpha = 1; g.textAlign = 'left'; tex.needsUpdate = true;
}
const LABELS = [];

// ---- the performer: the approved rig, standing by the calendar
const R_ME = { group: fig, torso, neckG, head, limbs, J, feet, footBlobs };
function poseStanding(R, p) {
  const { pel, yaw, lean, headPitch, headYaw, hL, hR, br, gy } = p;
  R.torso.position.copy(pel); R.torso.rotation.set(-lean, yaw + headYaw * 0.15, 0, 'YXZ');
  R.torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  R.neckG.rotation.set(0, 0, 0); R.head.rotation.set(headPitch + lean * 0.45, headYaw, 0, 'YXZ');
  R.torso.updateMatrixWorld(true);
  const fwd = V(-Math.sin(yaw), 0, -Math.cos(yaw)), lat = V(Math.cos(yaw), 0, -Math.sin(yaw));
  const base2 = V(pel.x, gy, pel.z);
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    const hip = R.torso.localToWorld(V(sx * 0.085, 0.02, 0.0));
    const ank = base2.clone().add(lat.clone().multiplyScalar(sx * 0.1)).add(V(0, 0.075, 0));
    const r = ik(hip, ank, 0.4, 0.43, fwd.clone().multiplyScalar(0.9).add(V(0, 0.15, 0)).add(lat.clone().multiplyScalar(sx * 0.1)));
    const [th, sh, hi, kn, an] = i === 0 ? [R.limbs.thL, R.limbs.shL, R.J.hiL, R.J.knL, R.J.anL] : [R.limbs.thR, R.limbs.shR, R.J.hiR, R.J.knR, R.J.anR];
    hi.position.copy(hip); kn.position.copy(r.mid); an.position.copy(r.end); setLimb(th, hip, r.mid); setLimb(sh, r.mid, r.end);
    R.feet[i].position.copy(r.end).add(fwd.clone().multiplyScalar(0.045)); R.feet[i].position.y = r.end.y - 0.047; R.feet[i].rotation.set(0, yaw + sx * -0.08, 0);
    R.footBlobs[i].position.set(R.feet[i].position.x, gy + 0.013, R.feet[i].position.z); R.footBlobs[i].material.opacity = 0.6;
  }
  const shL = R.torso.localToWorld(V(-0.15, 0.315, 0.0)), shR = R.torso.localToWorld(V(0.15, 0.315, 0.0));
  const hang = sx => (sx < 0 ? shL : shR).clone().add(V(0, -0.46, 0)).add(fwd.clone().multiplyScalar(0.05)).add(lat.clone().multiplyScalar(sx * 0.07));
  const tL = hL || hang(-1), tR = hR || hang(1);
  const pole = sx => lat.clone().multiplyScalar(sx * 0.7).add(V(0, -0.6, 0)).sub(fwd.clone().multiplyScalar(0.3));
  const aL = ik(shL, tL, 0.25, 0.235, pole(-1)), aR = ik(shR, tR, 0.25, 0.235, pole(1));
  R.J.shL.position.copy(shL); R.J.shR.position.copy(shR); R.J.elL.position.copy(aL.mid); R.J.elR.position.copy(aR.mid);
  R.J.haL.position.copy(aL.end); R.J.haR.position.copy(aR.end);
  setLimb(R.limbs.uaL, shL, aL.mid); setLimb(R.limbs.faL, aL.mid, aL.end); setLimb(R.limbs.uaR, shR, aR.mid); setLimb(R.limbs.faR, aR.mid, aR.end);
  R.J.haL.lookAt(aL.mid); R.J.haR.lookAt(aR.mid);
  return { fwd, lat, handL: aL.end.clone(), handR: aR.end.clone(), headP: R.head.getWorldPosition(V(0, 0, 0)) };
}
const ME_R = V(0.98, 0.9, -0.38), ME_L = V(-0.62, 0.9, -0.3);   // beside the calendar: right (S1-S6), left (S7, to reach the Monday column)
const figRef = {};
function pose(t) { return { br: Math.sin(t * 2 * Math.PI / 4.4) }; }
function placeFigure(t, P) {
  // he faces the calendar (to his right-front); in S7 he reaches up and sets the DAY 1 tag, then steps back and turns toward us
  const ME = t >= S.s7 ? ME_L : ME_R;
  const toCal = Math.atan2(-(CAL.pos.x - ME.x), -(CAL.pos.z - ME.z));   // yaw that faces the calendar
  const step = sm(remap(t, T.stepA, T.stepB));
  const yaw = lerp(toCal, toCal + 0.75, step);
  const pel = ME.clone().add(V(-0.12 * step, 0, 0.2 * step)); pel.y += 0.004 * Math.sin(t * 1.4);
  const tagW = calG.localToWorld(TAG_AT.clone()); calG.updateMatrixWorld(true);
  const reach = t >= S.s7 ? sm(remap(t, T.reachA, T.tagA)) * (1 - sm(remap(t, T.tagB + 0.1, T.stepA + 0.3))) : 0;
  const fwd = V(-Math.sin(yaw), 0, -Math.cos(yaw));
  const chest = pel.clone().add(V(0, 0.3, 0));
  let hR = null; if (reach > 0) hR = vl(chest.clone().add(fwd.clone().multiplyScalar(0.12)).add(V(0, -0.25, 0)), tagW.clone().add(V(0, 0, 0.06)), reach);
  const look = t < S.s2 ? sm(remap(t, -0.5, 1.0)) : 1;
  const p = poseStanding(R_ME, { pel, yaw: yaw + 0.03 * Math.sin(t * 0.8), lean: 0.03 + 0.04 * reach, headPitch: t < S.s7 ? 0.22 * look : lerp(0.12, -0.05, step), headYaw: 0.05 * Math.sin(t * 0.6), hL: null, hR, br: P.br, gy: 0 });
  figRef.headP = p.headP;
}
function setProps(t) { nbBlob.material.opacity = 0; ink.forEach(ln => { ln.visible = false; }); }
function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  // calendar pages: S1-S2 Sunday flips away over MONDAY 1; S5 MONDAY flips away over SUMMER BREAK; S7 the month view
  let cur = PG.mon, fl = PG.old, fa = clamp(remap(t, T.flip0A, T.flip0B)), flipOn = t < S.s3;
  if (t >= S.s3) { cur = PG.mon; flipOn = false; }
  if (t >= S.s5) { cur = PG.summer; fl = PG.mon; fa = clamp(remap(t, T.flip1A, T.flip1B)); flipOn = t < S.s6; }
  if (t >= S.s6) { cur = PG.summer; flipOn = false; }
  if (t >= S.s7) cur = PG.month;
  if (M_PAGE.map !== cur.t) { M_PAGE.map = cur.t; M_PAGE.needsUpdate = true; }
  if (M_FLIPF.map !== fl.t) { M_FLIPF.map = fl.t; M_FLIPF.needsUpdate = true; }
  flipPivot.visible = flipOn && fa < 0.999; flipPivot.rotation.y = -1.95 * eio(fa);
  calG.visible = !(t >= S.s3 && t < S.s5);   // the cards get a clean background
  fig.visible = calG.visible; footBlobs.forEach(b => { b.visible = calG.visible; });
  // S6: the old page with its slip-ups drifts away behind the calendar
  const d = t >= S.s6 && t < S.s7 ? clamp(remap(t, T.driftA, T.driftB)) : -1;
  drift.visible = d >= 0; if (drift.visible) { calG.updateMatrixWorld(true);
    const from = calG.localToWorld(PAGE_C.clone().add(V(0, 0, 0.12))), to = from.clone().add(V(-1.25, -0.15, -1.55));
    drift.position.copy(vl(from, to, eio(d))); drift.position.y += 0.06 * Math.sin(d * 6);
    drift.quaternion.copy(calG.quaternion); drift.rotateZ(0.5 * eio(d)); drift.rotateX(-0.6 * eio(d)); drift.scale.setScalar(lerp(1, 0.7, d)); drift.material.opacity = 1 - sm(remap(d, 0.55, 1)); }
  // S7: the DAY 1 tag pops onto the coming Monday
  const tg = t >= S.s7 ? sm(remap(t, T.tagA, T.tagB)) : 0;
  tag.visible = tg > 0.01; tag.position.copy(TAG_AT).add(V(0, 0, 0.004)); tag.scale.setScalar(lerp(0.4, 1, eout(tg)) * (1 + 0.12 * Math.sin(Math.PI * clamp(remap(t, T.tagB - 0.1, T.tagB + 0.4))))); tag.material.opacity = tg;
  // the card (S3-S4)
  const v = sm(remap(t, S.s3 - 0.05, S.s3 + 0.25)) * (1 - sm(remap(t, S.s5 - 0.3, S.s5 - 0.02)));
  card.visible = v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0);
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
const SHOTS = [
  // S1 frame 0 = the thumbnail: Sunday's page swings open like a door onto MONDAY 1; he faces it
  { a: S.s1, b: S.s2, k0: [V(0.42, 1.55, -0.55), 18, 6, 4.9, 30], k1: [V(0.42, 1.55, -0.55), 16, 6, 4.75, 30] },
  // S2 straight on: MONDAY 1
  { a: S.s2, b: S.s3, k0: [V(0.26, 1.5, -0.75), 4, 4, 4.35, 30], k1: [V(0.26, 1.5, -0.75), 1, 4, 4.2, 30] },
  // S3 the card: one study, a week strip, March 20
  { a: S.s3, b: S.s4, k0: [V(0.1, 1.56, 0.15), 4, 4, 3.4, 30], k1: [V(0.1, 1.56, 0.15), 0, 4, 3.3, 30] },
  // S4 the card from a new angle: third Thursday 7% vs first day of spring 26%
  { a: S.s4, b: S.s5, k0: [V(0.17, 1.6, 0.15), -30, -5, 3.35, 30], k1: [V(0.17, 1.6, 0.15), -24, -5, 3.3, 30] },
  // S5 the calendar swings to SUMMER BREAK, DAY 1
  { a: S.s5, b: S.s6, k0: [V(0.29, 1.5, -0.7), 14, 5, 4.45, 30], k1: [V(0.29, 1.5, -0.7), 9, 5, 4.25, 30] },
  // S6 the old page with its slip-ups drifts away into the back of the room
  { a: S.s6, b: S.s7, k0: [V(-0.35, 1.5, -1.3), 15, 5, 4.6, 30], k1: [V(-0.5, 1.5, -1.6), 12, 5, 4.9, 30] },
  // S7 the month: a gold DAY 1 tag on a nearby day; he steps off; lock-up
  { a: S.s7, b: S.end, m: [S.s7, 27.2], ease: 'sine', k0: [V(0.28, 1.5, -0.6), 10, 5, 4.35, 30], k1: [V(0.26, 1.66, -0.5), 6, 5, 4.75, 30], k2: [V(0.25, 1.66, -0.5), 4, 5, 4.65, 30] },
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
  // crucial in-scene text: the card and the calendar page, each audited by its own oriented box; the performer's head
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const keep = b => (onScreen(b) ? b : null);
  const crucial = { card: card.visible ? keep(textBox(card)) : null, calendar: calG.visible && !(t >= S.s6 && t < S.s7) ? keep(screenBoxOriented(pageText)) : null };
  const r = { t, card: null, crucial, head: sphereBox(head, 0.12), mateHead: null, desk: null };
  const cb = capEl.getBoundingClientRect();
  r.caption = capEl.innerHTML && +capEl.style.opacity > 0.02 ? [cb.left, cb.top, cb.right, cb.bottom].map(Math.round) : null;
  const spans = [...capEl.querySelectorAll('.ln')].map(e => e.getBoundingClientRect());
  r.captionText = spans.length && r.caption ? [Math.min(...spans.map(b => b.left)), Math.min(...spans.map(b => b.top)), Math.max(...spans.map(b => b.right)), Math.max(...spans.map(b => b.bottom))].map(Math.round) : null;
  r.captionLines = spans.length;
  r.shot = SHOTS.findIndex(x => t >= x.a && t < x.b) + 1 || 7;
  return r;
};


// ---------------------------------------------------------------- captions (Instrument Serif; store ink #191632, key words in store violet #633BFE)
const hl = s => `<span class="hl">${s}</span>`;
const sg = (html, t = null) => ({ html, t });
const C2 = 96, C1 = 108, C0 = 132;
const resP = PS('result')[2][1], againP = PS('again')[0][1], payP1 = PS('payoff')[0][1];
const CAPS = [
  // frame 0: the curiosity words are the first caption, already fully on screen
  { a: -1, b: TL.name.start - 0.12, size: C0, lines: [[sg('Why do Mondays')], [sg(`${hl('feel new?')}`)]] },
  { a: TL.name.start - 0.06, b: TL.study.start - 0.12, size: C2, lines: [[sg('Psychologists call it')], [sg(`the ${hl('fresh start effect')}.`, 2.95)]] },
  { a: TL.study.start - 0.06, b: TL.result.start - 0.12, size: C2, lines: [[sg('In one study, people picked')], [sg(`a day for a ${hl('goal reminder')}.`, 6.3)]] },
  { a: TL.result.start - 0.06, b: resP - 0.12, size: C2, lines: [[sg('When March twentieth was labeled')], [sg(`the ${hl('first day of spring')},`, 9.75)]] },
  { a: resP - 0.06, b: TL.again.start - 0.12, size: C1, lines: [[sg(`${hl('over three times')} as many`)], [sg('chose it.', 12.6)]] },
  { a: TL.again.start - 0.06, b: TL.why.start - 0.12, size: C2, lines: [[sg('A second study found the same')], [sg(`for the ${hl('first day of summer break')}.`, 15.5)]] },
  { a: TL.why.start - 0.06, b: TL.payoff.start - 0.12, size: C2, lines: [[sg(`A ${hl('new beginning')} can make`)], [sg(`past slip-ups feel ${hl('further away')}.`, 18.35)]] },
  { a: TL.payoff.start - 0.06, b: payP1 - 0.12, size: C1, lines: [[sg('So when starting feels hard,')]] },
  { a: payP1 - 0.06, b: TL.payoff.end + 0.4, size: C2, lines: [[sg('pick a nearby day that feels')], [sg(`like ${hl('day one')}, and begin there.`, 23.9)]] },
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
cardTx.key = ''; drawPages();
// redraw the label textures now that the fonts are present
for (const lab of LABELS) { const { canvas: c, g: ctx } = lab.userData.tx; ctx.clearRect(0, 0, c.width, c.height); let s = 170; ctx.font = `400 ${s}px ${SERIF}`;
  while (ctx.measureText(lab.userData.label).width > c.width - 60) { s -= 4; ctx.font = `400 ${s}px ${SERIF}`; }
  ctx.fillStyle = '#191632'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab.userData.label, c.width / 2, c.height * 0.54); lab.userData.tx.tex.needsUpdate = true; }
renderAt(0);
window.ready = true;
