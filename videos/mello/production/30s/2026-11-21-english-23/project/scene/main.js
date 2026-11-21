// Mello 30 s english23-01 (English): "stop pushing the idea" (why stepping away can unlock a stuck problem: creative
// incubation). Sources (context/33): Baird et al. 2012, Psychological Science (an undemanding task during an incubation
// break beat a demanding task, rest or no break on previously tried Unusual Uses problems); limits: later studies often
// found no such edge (Murray et al. 2021; Teng & Lien 2022; McDaniel et al. 2025); incubation in general: Sio & Ormerod
// 2009 meta-analysis. Rules retained: 2026-11-11 story/caption/palette rules (context/10 section 8), the first-frame rule
// (section 9), the caption band y 280-460 (section 10), the store-sampled palette (context/22) and a soothing original
// bed under the voice (live feedback: published colours + soothing audio).
// New: the approved performer forcing two stubborn puzzle pieces together (tab against tab) while the wall shows the third
// shape they could make; two evidence cards (direction only); an easy task lets his mind wander (and the doubt about it);
// he notes the problem, waters a plant, comes back, turns one piece around and it clicks.
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
// "stop pushing" 0.05, "stuck problem" 1.85, "loosen" 2.77, "step away" 3.49, "what kind of break" 4.69, "one study" 6.17,
// "listed new uses" 7.33, "everyday objects" 8.51, "tried again" 10.21, "easy task" 11.57, "beat" 12.53, "hard task" 13.03,
// "rest" 14.03, "no break" 14.81, "easy task" 16.05, "minds wander" 17.05, "later studies" 18.53, "often haven't found" 19.15,
// "edge" 20.31, "note the problem" 21.31, "water a plant" 22.25, "come back" 23.35, "take a mindful break" 26.50
const S = { s1: 0.0, s2: 1.6, s3: 5.85, s4: 11.25, s5: 15.75, s6: 21.0, s7: 23.3, end: 30.0 };
const T = {
  loosen: 2.85, release: 3.55, look: 4.75,                    // S2: pushing, the pieces ease apart, he steps back, looks up
  try1: 7.4, objects: 8.6, between: 9.9, try2: 10.3,          // S3: one study: try 1 (uses for objects), a break, try again
  easy: 11.65, beat: 12.6, hard: 13.1, rest: 14.1, none: 14.9,  // S4: easy task beat a hard task, rest, or no break
  toss: 15.9, wander: 17.1, wanderB: 18.2, doubt: 19.25,      // S5: an easy task, the mind wanders; later studies: doubt
  note: 21.4, water: 22.35, waterB: 23.1,                     // S6: note the problem; water a plant
  back: 23.45, lift: 23.75, spinA: 23.95, spinB: 24.75, click: 25.1,   // S7: back; turn one piece around; click
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






// ---------------------------------------------------------------- episode props: store palette, the puzzle pieces, the wall shape, the cards
// palette sampled 2026-11-11 from the current Play listing (context/22): stage #EDE8FE, ink #191632, violet #633BFE,
// lilac #E6D2FC, deep violet #5B45A3, dark UI #060513, gold #FEC357.
const PAL = { bg: '#EDE8FE', ink: '#191632', violet: '#633BFE', lilac: '#E6D2FC', deep: '#5B45A3', dark: '#060513', gold: '#FEC357' };
M.stage.color.set('#F8F6FF'); M.rug.color.set('#ECE6FB'); hemi.color.set('#F6F3FF'); hemi.groundColor.set('#DCD3F2');
scene.background.set('#EAE4F4');   // = the back wall as rendered
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
const LABELS = [];

// ---- the room: the desk stays (no lamp, mug, pencil, notebook or stool); the plant sits on the desk's left end
for (const o of [mug, lamp, lampLight, pencil, seat, ped, base, notebook]) o.visible = false;
const nearXZ = (o, x, z) => Math.abs(o.position.x - x) < 0.02 && Math.abs(o.position.z - z) < 0.02;
for (const o of scene.children) if (o.isMesh && o.material && o.material.map === blobTex && (nearXZ(o, 0.47, 0.06) || nearXZ(o, 0.5, -0.22) || nearXZ(o, STOOL.x, STOOL.z) || nearXZ(o, -1.45, -1.45))) o.visible = false;
const PLANT_POS = V(-0.53, DESK_Y, -0.2);
plant.scale.setScalar(0.5); plant.position.copy(PLANT_POS);
blob(0.22, 0.22, 0.5, DESK_Y + 0.002).position.set(PLANT_POS.x, DESK_Y + 0.002, PLANT_POS.z);

// ---- the approved performer (store palette tones, as in english20/21)
M.fig.color.set('#8270C4'); M.hair.color.set(PAL.deep);

// ---- puzzle pieces: classic knob edges; A (violet) has its tab on the right; B (gold) has a tab on the left and a blank on
// the right, so tab meets tab and they cannot fit, until B is turned around (180 degrees in its own plane)
const PS_S = 0.14;                       // half side of a piece (0.28 m square)
const KNOB = L => ({ a: 0.12 * L, hN: 0.07 * L, r: 0.17 * L, h: 0.07 * L + 0.136 * L });
function knobEdge(out, P0, P1, n, type) {   // appends points from P0 (exclusive) to P1 along a straight / tab / blank edge
  const d = P1.clone().sub(P0), L = d.length(); d.normalize();
  const put = (x, y) => out.push(new THREE.Vector2(P0.x + d.x * x + n.x * y, P0.y + d.y * x + n.y * y));
  if (type === 'flat') { put(L, 0); return; }
  const k = KNOB(L), sg = type === 'tab' ? 1 : -1;
  put(L / 2 - k.a, 0); put(L / 2 - k.a, sg * k.hN);
  const tL = Math.atan2(k.hN - k.h, -k.a) + 2 * Math.PI, tR = Math.atan2(k.hN - k.h, k.a);
  for (let i = 1; i < 28; i++) { const th = lerp(tL, tR, i / 28); put(L / 2 + k.r * Math.cos(th), sg * (k.h + k.r * Math.sin(th))); }
  put(L / 2 + k.a, sg * k.hN); put(L / 2 + k.a, 0); put(L, 0);
}
function pieceOutline(w, h, left, right) {   // w x h rectangle centred on the origin, flat top and bottom
  const pts = [new THREE.Vector2(-w / 2, -h / 2)];
  knobEdge(pts, new THREE.Vector2(-w / 2, -h / 2), new THREE.Vector2(w / 2, -h / 2), new THREE.Vector2(0, -1), 'flat');
  knobEdge(pts, new THREE.Vector2(w / 2, -h / 2), new THREE.Vector2(w / 2, h / 2), new THREE.Vector2(1, 0), right);
  knobEdge(pts, new THREE.Vector2(w / 2, h / 2), new THREE.Vector2(-w / 2, h / 2), new THREE.Vector2(0, 1), 'flat');
  knobEdge(pts, new THREE.Vector2(-w / 2, h / 2), new THREE.Vector2(-w / 2, -h / 2), new THREE.Vector2(-1, 0), left);
  pts.pop(); return pts;
}
const PIECE_D = 0.05, TAB = KNOB(2 * PS_S).h + KNOB(2 * PS_S).r;   // tab reach beyond the edge
function pieceMesh(left, right, col) {
  const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pieceOutline(2 * PS_S, 2 * PS_S, left, right)), { depth: PIECE_D, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.007, bevelSegments: 3, curveSegments: 6 });
  geo.translate(0, 0, -PIECE_D / 2); geo.computeVertexNormals();
  const m = mesh(geo, std(col, 0.5, { emissive: new THREE.Color(col), emissiveIntensity: 0.12 })); scene.add(m); return m;
}
const pieceA = pieceMesh('blank', 'tab', PAL.violet), pieceB = pieceMesh('tab', 'blank', PAL.gold);
const pzBlob = blob(0.9, 0.3, 0.0, DESK_Y + 0.003);
// the seam glow at the click
const glowTx = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,246,214,1)'); gr.addColorStop(0.35, 'rgba(254,195,87,0.55)'); gr.addColorStop(1, 'rgba(254,195,87,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const seamGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), new THREE.MeshBasicMaterial({ map: glowTx, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
seamGlow.renderOrder = 4; scene.add(seamGlow);

// ---- the third shape on the wall: the outline the two pieces make once B is turned around (one bigger piece)
const WALL_Z = -2.66, WALL_SHAPE = { x: 0.0, y: 1.72, scale: 2.4 };
const wallTx = (() => {
  const c = document.createElement('canvas'); c.width = 1600; c.height = 900; const g = c.getContext('2d');
  const w = 4 * PS_S, h = 2 * PS_S, pts = pieceOutline(w, h, 'blank', 'tab');
  const sc = 1180 / (w + TAB), ox = 800 - (TAB / 2) * sc, oy = 450;
  g.beginPath(); pts.forEach((p, i) => { const x = ox + p.x * sc, y = oy - p.y * sc; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath();
  g.fillStyle = 'rgba(201,182,245,0.78)'; g.fill(); g.lineJoin = 'round'; g.strokeStyle = PAL.gold; g.lineWidth = 16; g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const M_WALL = new THREE.MeshBasicMaterial({ map: wallTx, transparent: true, depthWrite: false, toneMapped: false });
const WALL_M = (4 * PS_S + TAB) * WALL_SHAPE.scale / 1180;   // metres per canvas pixel
const wallShape = new THREE.Mesh(new THREE.PlaneGeometry(1600 * WALL_M, 900 * WALL_M), M_WALL);
wallShape.position.set(WALL_SHAPE.x, WALL_SHAPE.y, WALL_Z); wallShape.renderOrder = -1; scene.add(wallShape);
const wallFlash = new THREE.Mesh(wallShape.geometry, new THREE.MeshBasicMaterial({ map: wallTx, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
wallFlash.position.copy(wallShape.position).add(V(0, 0, 0.01)); scene.add(wallFlash);

// ---- S3-S4: the dark in-app card (Baird et al. 2012: direction only, no invented values)
const CARD_POS = V(0.1, 1.55, 0.5);
const card = makeCard(0.7, 0.62); const cardTx = cardCanvas(card, 0.68, 0.605, 1220, 1086);
function chip(g, x, y, w, h, label, col, a, dashed) {
  g.globalAlpha = a; g.setLineDash(dashed ? [22, 16] : []); rr(g, x, y, w, h, 34, '#14112E', col, 8); g.setLineDash([]);
  g.fillStyle = col; g.font = `600 44px ${UI}`; g.textAlign = 'center'; g.fillText(label, x + w / 2, y + 62);
}
function listLines(g, x, y, w, n, grow, col, a) { g.globalAlpha = a; g.fillStyle = col; for (let i = 0; i < n; i++) { const f = clamp(grow * n - i); if (f > 0) rr(g, x, y + i * 58, w * (0.55 + 0.4 * ((i * 37) % 5) / 4) * f, 22, 11, col); } }
function mugIcon(g, x, y, s, col, a) { g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = 9; g.lineJoin = 'round';
  rr(g, x - s * 0.5, y - s * 0.55, s, s * 1.1, 14, null, col, 9); g.beginPath(); g.arc(x + s * 0.62, y, s * 0.26, -1.3, 1.3); g.stroke(); }
function clipIcon(g, x, y, s, col, a) { g.globalAlpha = a; g.strokeStyle = col; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x - s * 0.18, y + s * 0.2); g.lineTo(x - s * 0.18, y - s * 0.45); g.arc(x, y - s * 0.45, s * 0.18, Math.PI, 0); g.lineTo(x + s * 0.18, y + s * 0.5);
  g.arc(x - s * 0.04, y + s * 0.5, s * 0.22, 0, Math.PI); g.lineTo(x - s * 0.26, y - s * 0.3); g.stroke(); }
function drawCard(t) {
  const m = sm(remap(t, S.s3 - 0.05, S.s3 + 0.3)), t1 = sm(remap(t, T.try1 - 0.1, T.try1 + 0.3)), l1 = remap(t, T.try1, T.try1 + 1.0), ob = sm(remap(t, T.objects - 0.1, T.objects + 0.35));
  const bw = sm(remap(t, T.between - 0.1, T.between + 0.3)), t2 = sm(remap(t, T.try2 - 0.1, T.try2 + 0.35)), l2 = remap(t, T.try2 + 0.1, T.try2 + 0.9);
  const ez = sm(remap(t, T.easy - 0.1, T.easy + 0.3)), bt = eio(remap(t, T.beat - 0.1, T.beat + 0.9));
  const hd = remap(t, T.hard - 0.05, T.hard + 0.25), rs = remap(t, T.rest - 0.05, T.rest + 0.25), nb = remap(t, T.none - 0.05, T.none + 0.25), res = t >= S.s4;
  const key = [m, t1, l1, ob, bw, t2, l2, ez, bt, hd, rs, nb, res ? 1 : 0].map(x => (+x).toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle'; g.textAlign = 'left';
  g.globalAlpha = m; g.fillStyle = '#B9A4FF'; g.font = `600 52px ${UI}`; g.fillText(res ? 'IMPROVEMENT ON TRY 2' : 'ONE STUDY', 60, 86);
  g.fillStyle = '#8E86AE'; g.font = `500 44px ${UI}`; g.fillText(res ? 'same problems, by what came in between' : 'new uses for everyday objects', 60, 148);
  if (!res) {
    // try 1 -> in between -> try 2 (the same problems)
    chip(g, 50, 300, 330, 560, 'TRY 1', '#FFFFFF', m * t1, false);
    mugIcon(g, 200, 450, 96, '#FFFFFF', m * t1 * ob);
    listLines(g, 90, 560, 250, 4, l1, '#B9A4FF', m * t1);
    g.globalAlpha = m * bw; g.fillStyle = '#8E86AE'; g.beginPath(); g.moveTo(392, 580); g.lineTo(424, 560); g.lineTo(424, 600); g.closePath(); g.fill();
    chip(g, 445, 300, 330, 560, 'in between', '#B9A4FF', m * bw, true);
    g.globalAlpha = m * bw; g.fillStyle = '#B9A4FF'; g.font = `400 150px ${SERIF}`; g.textAlign = 'center'; g.fillText('?', 610, 600);
    g.globalAlpha = m * t2; g.fillStyle = '#8E86AE'; g.beginPath(); g.moveTo(787, 580); g.lineTo(819, 560); g.lineTo(819, 600); g.closePath(); g.fill();
    chip(g, 840, 300, 330, 560, 'TRY 2', PAL.gold, m * t2, false);
    g.globalAlpha = m * t2; g.fillStyle = PAL.gold; g.font = `500 38px ${UI}`; g.textAlign = 'center'; g.fillText('same problems', 1005, 430);
    listLines(g, 880, 560, 250, 4, l2, PAL.gold, m * t2);
  } else { const X = 60, Wb = 1100;
    const row = (y, lab, a, v, col, solid) => { if (a <= 0) return; g.globalAlpha = m * a; g.fillStyle = '#FFFFFF'; g.font = `400 92px ${SERIF}`; g.textAlign = 'left'; g.fillText(lab, X, y);
      rr(g, X, y + 80, Wb, 60, 30, '#1B1640'); const w = Math.max(60, Wb * v); if (solid) rr(g, X, y + 80, w, 60, 30, col); else rr(g, X + 4, y + 84, w - 8, 52, 26, null, col, 8); };
    row(360, 'easy task', ez, 0.42 + 0.43 * bt, PAL.gold, true);
    const other = ['hard task', ', rest,', ' or no break'].slice(0, (hd > 0) + (rs > 0) + (nb > 0)).join('');
    row(660, other || ' ', m, 0.42, '#B9A4FF', false);
  }
  g.globalAlpha = 1; g.textAlign = 'left'; tex.needsUpdate = true;
}

// ---- S5: an easy task (tossing a ball hand to hand) and the wandering mind (a dotted trail that drifts out, then greys)
const ball = mesh(new THREE.SphereGeometry(0.035, 24, 16), std(PAL.gold, 0.5, { emissive: new THREE.Color(PAL.gold), emissiveIntensity: 0.15 })); scene.add(ball);
const trailCurve = new THREE.CatmullRomCurve3([V(0.0, 1.84, -0.68), V(0.14, 1.96, -0.72), V(0.06, 2.1, -0.8), V(-0.18, 2.06, -0.85), V(-0.3, 1.92, -0.8),
  V(-0.16, 1.84, -0.75), V(0.06, 1.94, -0.82), V(0.26, 2.06, -0.95), V(0.4, 2.16, -1.0), V(0.28, 2.24, -1.05), V(0.1, 2.2, -1.0)], false, 'catmullrom', 0.5);
const DOTS = 64, dotGeo = new THREE.SphereGeometry(0.014, 12, 8);
const M_DOT = new THREE.MeshBasicMaterial({ color: PAL.gold, transparent: true, toneMapped: false });
const dots = [...Array(DOTS)].map((_, i) => { const d = new THREE.Mesh(dotGeo, M_DOT); d.position.copy(trailCurve.getPointAt(i / (DOTS - 1))); scene.add(d); return d; });
const qTx = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, t }; })();
function drawQ() { const g = qTx.c.getContext('2d'); g.clearRect(0, 0, 256, 256); g.fillStyle = '#8E86AE'; g.font = `400 220px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 128, 140); qTx.t.needsUpdate = true; }
drawQ();
const qMark = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: qTx.t, transparent: true, depthWrite: false, toneMapped: false }));
qMark.position.set(-0.07, 1.96, -0.78); scene.add(qMark);   // inside the loop the trail draws

// ---- S6: a sticky note on piece A (with a question mark) and a small watering can
const noteTx = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, t }; })();
function drawNote() { const g = noteTx.c.getContext('2d'); g.fillStyle = '#FFE39A'; g.fillRect(0, 0, 256, 256); g.fillStyle = INK; g.font = `400 190px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 128, 140); noteTx.t.needsUpdate = true; }
drawNote();
const note = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshStandardMaterial({ map: noteTx.t, roughness: 0.8, side: THREE.DoubleSide })); scene.add(note);
const can = new THREE.Group(); scene.add(can);
{ const M_CAN = std('#B9A4FF', 0.45);
  const body = mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.085, 28), M_CAN); can.add(body);
  const spout = mesh(new THREE.CylinderGeometry(0.007, 0.01, 0.14, 12), M_CAN); spout.position.set(0.075, 0.03, 0); spout.rotation.z = -1.0; can.add(spout);
  const hd = mesh(new THREE.TorusGeometry(0.03, 0.007, 8, 20, Math.PI), M_CAN); hd.position.set(-0.05, 0.02, 0); hd.rotation.z = Math.PI / 2; can.add(hd); }
const CAN_REST = V(-0.38, DESK_Y + 0.043, 0.08);
const drops = [...Array(14)].map(() => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 8), new THREE.MeshBasicMaterial({ color: '#5E9BE0', transparent: true, toneMapped: false })); scene.add(d); return d; });

// ---- his pose
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

// piece placement over time (world): held and jammed (S1-S2), set down on the desk (S2 on "step away"), turned and fitted (S7)
const PZ = -0.17, HOLD_Y = 1.2, HOLD_Z = -0.27, JAM = PS_S + TAB + 0.004, FIT = PS_S;
const ME = V(0.0, 0.9, -0.58), YAW_ME = Math.PI;
function piecesAt(t) {
  const down = sm(remap(t, T.release - 0.45, T.release + 0.05)), loosen = sm(remap(t, T.loosen, T.loosen + 0.5));
  const push = t < T.release ? (0.5 + 0.5 * Math.sin(t * 2 * Math.PI * 1.6)) * (1 - 0.6 * loosen) : 0;   // rhythmic shoves
  const y0 = lerp(HOLD_Y, DESK_Y + PS_S + 0.008, down), z0 = lerp(HOLD_Z, PZ, down);
  const gap = 0.03 * loosen * (1 - down) + 0.012 * (1 - push);
  let ax = -JAM - gap, bx = JAM + gap, by = y0, bz = z0, brz = 0, ay = y0;
  const tilt = 0.06 * push * (1 - down);
  // S7: lift B, turn it around, slide both together, click
  const lf = sm(remap(t, T.lift, T.spinA)), sp = eio(remap(t, T.spinA, T.spinB)), jn = eio(remap(t, T.spinB, T.click));
  if (t >= S.s7) { by = DESK_Y + PS_S + 0.008 + 0.09 * lf * (1 - jn); brz = Math.PI * sp; bz = PZ;
    ax = lerp(-JAM - 0.012, -FIT, jn); bx = lerp(JAM + 0.012, FIT, jn); }
  return { a: V(ax, ay, z0), b: V(bx, by, bz), aRz: -tilt, bRz: brz + tilt, push, down };
}
const figRef = {};
function pose(t) { return { br: Math.sin(t * 2 * Math.PI / (t > T.release ? 4.6 : 3.0)) }; }
function placeFigure(t, P) {
  const pz = piecesAt(t);
  const fwd = V(0, 0, 1), lat = V(1, 0, 0);
  let hL = null, hR = null, yaw = YAW_ME, lean = 0.06, headPitch = -0.12, headYaw = 0, pel = ME.clone();
  const step = sm(remap(t, T.release, T.release + 0.6));
  if (t < S.s3) {   // S1-S2: pushing the held pieces together, then setting them down and stepping back
    const sq = 0.006 * pz.push;
    hR = V(pz.a.x - PS_S - 0.01 + sq, pz.a.y, pz.a.z - 0.02); hL = V(pz.b.x + PS_S + 0.01 - sq, pz.b.y, pz.b.z - 0.02);
    if (t > T.release - 0.5) { const off = step; hR.lerp(V(-0.26, 0.92, -0.62), off); hL.lerp(V(0.26, 0.92, -0.62), off); }
    lean = lerp(0.16 + 0.03 * pz.push, 0.02, step); pel.z -= 0.12 * step; pel.y -= 0.01 * pz.push * (1 - step);
    headPitch = lerp(-0.28, -0.05, step) + (t > T.look ? 0.12 * sm(remap(t, T.look, T.look + 0.4)) : 0); headYaw = t > T.look ? 0.25 * sm(remap(t, T.look, T.look + 0.5)) : 0;
  } else if (t >= S.s5 && t < S.s6) {   // S5: tossing a ball from hand to hand, eyes drifting up
    pel.z -= 0.12; lean = 0.02; const ph = (t - T.toss) / 0.9, k = Math.floor(ph), u = ph - k, fromL = k % 2 === 0;
    const chest = pel.clone().add(V(0, 0.27, 0.27)), L0 = chest.clone().add(V(0.13, 0, 0)), R0 = chest.clone().add(V(-0.13, 0, 0));
    const dip = s => -0.03 * Math.sin(Math.PI * clamp(s));
    hL = L0.clone().add(V(0, fromL ? dip(u * 2.5) : dip((u - 0.6) * 2.5), 0)); hR = R0.clone().add(V(0, fromL ? dip((u - 0.6) * 2.5) : dip(u * 2.5), 0));
    const a = fromL ? L0 : R0, b = fromL ? R0 : L0;
    ball.position.copy(vl(a, b, u)).add(V(0, 0.05 + 0.22 * Math.sin(Math.PI * u), 0));
    const wd = sm(remap(t, T.wander - 0.3, T.wander + 0.6));
    headPitch = lerp(-0.08, 0.28, wd) - 0.08 * sm(remap(t, T.doubt, T.doubt + 0.6)); headYaw = 0.18 * wd * Math.sin(t * 0.6);
  } else if (t >= S.s6 && t < S.s7) {   // S6: stick the note on piece A, then pick up the can and water the plant
    pel.z -= 0.12; const nt = sm(remap(t, T.note - 0.35, T.note + 0.1)), back = sm(remap(t, T.note + 0.25, T.note + 0.6));
    const noteSpot = pz.a.clone().add(V(0, 0.02, PIECE_D / 2 + 0.02));
    hR = vl(pel.clone().add(V(-0.18, 0.05, 0.1)), noteSpot.clone().add(V(0, 0, 0.03)), nt * (1 - back));
    const reach = sm(remap(t, T.note + 0.4, T.water - 0.25)), pour = sm(remap(t, T.water - 0.1, T.water + 0.35)) * (1 - sm(remap(t, T.waterB, T.waterB + 0.3)));
    const canHold = V(-0.33, 1.2 + 0.03 * pour, -0.3);   // spout above the leaves, so the water is seen falling
    if (t > T.note + 0.25) hR = vl(hR, vl(CAN_REST.clone().add(V(0.02, 0.06, -0.02)), canHold, sm(remap(t, T.water - 0.6, T.water - 0.1))), reach);
    yaw = YAW_ME + 0.45 * sm(remap(t, T.water - 0.6, T.water - 0.1)); lean = 0.12; headPitch = -0.3; headYaw = 0.2 * reach;
  } else if (t >= S.s7) {   // S7: back to the pieces; both hands turn B around; then he steps back, relaxed
    pel.z -= 0.12 * (1 - sm(remap(t, T.back - 0.2, T.back + 0.3))) + 0.08 * sm(remap(t, T.click + 0.4, T.click + 1.2));
    const grab = sm(remap(t, T.back, T.lift)) * (1 - sm(remap(t, T.click + 0.1, T.click + 0.6)));
    const bL = pz.b.clone().add(V(-PS_S * 0.7, PS_S * 0.95, 0.0)), bR = pz.b.clone().add(V(PS_S * 0.7, PS_S * 0.95, 0.0));
    const spinTurn = remap(t, T.spinA, T.spinB) * Math.PI;   // hands follow the turning piece's top corners
    bL.copy(pz.b).add(V(PS_S * 0.75 * Math.cos(spinTurn), PS_S * 0.9 + 0.02, 0)); bR.copy(pz.b).add(V(-PS_S * 0.75 * Math.cos(spinTurn), PS_S * 0.9 + 0.02, 0));
    hL = vl(V(0.26, 0.92, -0.62), bL, grab); hR = vl(V(-0.26, 0.92, -0.62), bR, grab);
    lean = 0.04 + 0.16 * grab; headPitch = lerp(-0.12, -0.32, grab) + 0.1 * sm(remap(t, T.click, T.click + 0.6)); yaw = YAW_ME + 0.18 * grab;
  } else { pel.z -= 0.12; }
  const p = poseStanding(R_ME, { pel, yaw, lean, headPitch, headYaw, hL, hR, br: P.br, gy: 0 });
  figRef.p = p; figRef.headP = p.headP;
}
function setProps(t) { nbBlob.material.opacity = 0; ink.forEach(ln => { ln.visible = false; }); }
function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  const cardShot = t >= S.s3 && t < S.s5, sceneShot = !cardShot;
  for (const o of [fig, deskTop, plant, pieceA, pieceB, pzBlob, can]) o.visible = sceneShot;
  wallShape.visible = t < S.s2; wallFlash.visible = false;   // the third shape is the frame-0 hint; S7 answers it with the joined pieces
  footBlobs.forEach(b => { b.visible = sceneShot; });
  for (const o of scene.children) if (o.isMesh && o.material === M.leg) o.visible = sceneShot;
  // pieces
  const pz = piecesAt(t);
  pieceA.position.copy(pz.a); pieceA.rotation.set(0, 0, pz.aRz); pieceB.position.copy(pz.b); pieceB.rotation.set(0, 0, pz.bRz);
  pzBlob.material.opacity = 0.35 * pz.down; pzBlob.position.set((pz.a.x + pz.b.x) / 2, DESK_Y + 0.003, PZ);
  const ck = remap(t, T.click - 0.05, T.click + 0.9), flash = t >= T.click - 0.05 ? Math.exp(-4 * ck) * (ck > 0 ? 1 : 0) : 0;
  seamGlow.visible = sceneShot && flash > 0.01; seamGlow.position.copy(pz.a).add(V(PS_S, 0, PIECE_D / 2 + 0.012)); seamGlow.material.opacity = 0.9 * flash; seamGlow.lookAt(camera.position);
  // wall shape: present from frame 0, breathing; flashes at the click; dims before the lock-up
  const outro = sm(remap(t, T.lockA - 0.8, T.lockA - 0.1));
  M_WALL.opacity = (0.92 + 0.08 * Math.sin(t * 1.7)) * (1 - outro);
  wallFlash.material.opacity = 0.7 * flash;
  // S5: ball, wandering trail, the doubt
  const s5 = t >= S.s5 && t < S.s6; ball.visible = s5;
  const wd = remap(t, T.wander, T.wanderB), grey = sm(remap(t, T.doubt - 0.2, T.doubt + 0.5));
  M_DOT.color.set(PAL.gold).lerp(new THREE.Color('#B8B0CC'), grey); M_DOT.opacity = 1 - 0.35 * grey;
  dots.forEach((d, i) => { const f = i / (DOTS - 1); d.visible = s5 && wd > 0 && f <= wd; d.position.copy(trailCurve.getPointAt(f)).add(V(0, 0.006 * Math.sin(t * 2 + i * 0.7), 0)); });
  qMark.visible = s5 && grey > 0.01; qMark.material.opacity = grey; qMark.scale.setScalar(lerp(0.6, 1, grey)); qMark.quaternion.copy(camera.quaternion);
  // S6-S7: the note on piece A (it rides along with A after it is stuck)
  const nt = sm(remap(t, T.note - 0.1, T.note + 0.35));
  note.visible = sceneShot && t >= T.note - 0.35;
  const stuck = pz.a.clone().add(V(-0.02, 0.03, PIECE_D / 2 + 0.012));
  const inHand = figRef.p ? figRef.p.handR.clone().add(V(-0.02, 0.02, 0.04)) : stuck;
  note.position.copy(vl(inHand, stuck, nt)); note.rotation.set(0, 0, 0.12 * nt - 0.3 * (1 - nt));
  // the can: on the desk, picked up and tilted over the plant in S6, back on the desk in S7
  const pick = t >= S.s6 && t < S.s7 ? sm(remap(t, T.water - 0.6, T.water - 0.35)) : 0, pour = t >= S.s6 && t < S.s7 ? sm(remap(t, T.water - 0.1, T.water + 0.35)) * (1 - sm(remap(t, T.waterB, T.waterB + 0.3))) : 0;
  const hand = figRef.p ? figRef.p.handR.clone().add(V(0.0, -0.03, 0.0)) : CAN_REST;
  can.position.copy(vl(CAN_REST, hand, pick)); can.rotation.set(0, Math.PI, -0.75 * pour);
  drops.forEach((d, i) => { const ph = ((t - T.water) * 1.8 + i / drops.length) % 1, on = pour > 0.6 && t > T.water;
    d.visible = sceneShot && on; const tip = can.localToWorld(V(0.13, 0.08, 0)); d.position.copy(tip).add(V(0.008 * Math.sin(i * 2.3), -0.3 * ph * ph - 0.05 * ph, 0)); d.material.opacity = 0.95 * (1 - 0.7 * ph); });
  // the card (S3-S4): no fade-out before its cut
  const v = sm(remap(t, S.s3 - 0.05, S.s3 + 0.25));
  card.visible = cardShot && v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0);
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
const SHOTS = [
  // S1 frame 0 = the thumbnail: tab against tab, he forces the pieces; the wall shows the third shape they could make
  { a: S.s1, b: S.s2, k0: [V(0.0, 1.45, -0.6), 0, 5, 4.6, 30], k1: [V(0.0, 1.45, -0.6), 2, 5, 4.4, 30] },
  // S2 three-quarter: shoving, tab against tab; they ease apart; he sets them down and steps back (the camera pulls back)
  { a: S.s2, b: S.s3, k0: [V(0.09, 1.3, -0.3), 22, 6, 3.6, 30], k1: [V(0.04, 1.28, -0.3), 14, 6, 4.0, 30] },
  // S3 the card: try 1, in between, try 2 (same problems)
  { a: S.s3, b: S.s4, k0: [V(0.14, 1.6, 0.5), 4, 4, 3.4, 30], k1: [V(0.14, 1.6, 0.5), 0, 4, 3.3, 30] },
  // S4 the card from a low angle: improvement on try 2
  { a: S.s4, b: S.s5, k0: [V(0.17, 1.65, 0.5), -30, -5, 3.35, 30], k1: [V(0.17, 1.65, 0.5), -24, -5, 3.3, 30] },
  // S5 side: an easy task; his mind wanders (the dotted trail), then the doubt
  { a: S.s5, b: S.s6, k0: [V(0.02, 1.76, -0.75), -28, 6, 3.4, 30], k1: [V(0.02, 1.76, -0.75), -22, 6, 3.2, 30] },
  // S6 front-left: note on piece A; watering the plant
  { a: S.s6, b: S.s7, k0: [V(-0.3, 1.3, -0.35), -22, 8, 3.0, 30], k1: [V(-0.3, 1.3, -0.35), -16, 8, 2.9, 30] },
  // S7 back to the pieces: B turns around and clicks; pull back for the lock-up
  { a: S.s7, b: S.end, m: [T.click + 0.2, 27.2], ease: 'sine', k0: [V(0.1, 1.34, -0.2), 8, 7, 4.1, 30], k1: [V(0.04, 1.38, -0.5), 2, 5, 4.5, 30], k2: [V(0.04, 1.38, -0.5), 0, 5, 4.6, 30] },
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
  // crucial: the card and both puzzle pieces, each audited by its own oriented box; his head
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const keep = b => (onScreen(b) ? b : null);
  const crucial = { card: card.visible ? keep(textBox(card)) : null,
    // the pieces are the subject (vital) in S1, S2 and S7; in S5-S6 they are background props
    pieceA: pieceA.visible && (t < S.s3 || t >= S.s7) ? keep(screenBoxOriented(pieceA)) : null, pieceB: pieceB.visible && (t < S.s3 || t >= S.s7) ? keep(screenBoxOriented(pieceB)) : null };
  for (const L of LABELS) crucial[L.userData.label] = L.visible ? keep(textBox(L)) : null;
  const r = { t, card: null, crucial, head: fig.visible ? sphereBox(head, 0.12) : null, mateHead: null, desk: null };
  const cb = capEl.getBoundingClientRect();
  r.caption = capEl.innerHTML && +capEl.style.opacity > 0.02 ? [cb.left, cb.top, cb.right, cb.bottom].map(Math.round) : null;
  const spans = [...capEl.querySelectorAll('.ln')].map(e => e.getBoundingClientRect());
  r.captionText = spans.length && r.caption ? [Math.min(...spans.map(b => b.left)), Math.min(...spans.map(b => b.top)), Math.max(...spans.map(b => b.right)), Math.max(...spans.map(b => b.bottom))].map(Math.round) : null;
  r.captionLines = spans.length;
  r.shot = SHOTS.findIndex(x => t >= x.a && t < x.b) + 1 || 7;
  return r;
};


// ---------------------------------------------------------------- captions (Instrument Serif; store ink #191632, key words in store violet #633BFE)
// captions inside y 280-460 (context/10 section 10)
const hl = s => `<span class="hl">${s}</span>`;
const sg = (html, t = null) => ({ html, t });
const C2 = 88, C1 = 96, C0 = 100;
const superP = PS('super')[0][1], p1A = PS('p1')[0][1], p1C = PS('p1')[2][1], p2P = PS('p2')[0][1], whyP = PS('why')[0][1], payP = PS('payoff')[0][1];
const CAPS = [
  // frame 0: the curiosity words are the first caption, already fully on screen
  { a: -1, b: TL.super.start - 0.12, size: C0, lines: [[sg('Stop pushing')], [sg(`${hl('the idea.')}`)]] },
  { a: TL.super.start - 0.06, b: superP - 0.12, size: C2, lines: [[sg('A stuck problem can loosen')], [sg(`when you ${hl('step away')}.`, 3.3)]] },
  { a: superP - 0.06, b: TL.p1.start - 0.12, size: C1, lines: [[sg(`But ${hl('what kind of break')}?`)]] },
  { a: TL.p1.start - 0.06, b: p1A - 0.12, size: C1, lines: [[sg('In one study,')]] },
  { a: p1A - 0.06, b: p1C - 0.12, size: C2, lines: [[sg(`people listed ${hl('new uses')}`)], [sg('for everyday objects,', 8.45)]] },
  { a: p1C - 0.06, b: TL.p2.start - 0.12, size: C1, lines: [[sg(`then ${hl('tried again')}.`)]] },
  { a: TL.p2.start - 0.06, b: p2P - 0.12, size: C2, lines: [[sg(`An ${hl('easy task')} in between`)], [sg('beat a hard task,', 12.45)]] },
  { a: p2P - 0.06, b: TL.why.start - 0.12, size: C1, lines: [[sg('rest, or no break.')]] },
  { a: TL.why.start - 0.06, b: whyP - 0.12, size: C2, lines: [[sg('The easy task')], [sg(`let minds ${hl('wander')},`, 16.7)]] },
  { a: whyP - 0.06, b: TL.payoff.start - 0.12, size: C2, lines: [[sg('but later studies often')], [sg(`haven't found ${hl('that edge')}.`, 19.4)]] },
  { a: TL.payoff.start - 0.06, b: payP - 0.12, size: C2, lines: [[sg(`So ${hl('note the problem')},`)], [sg('water a plant,', 22.15)]] },
  { a: payP - 0.06, b: TL.payoff.end + 0.4, size: C1, lines: [[sg(`then ${hl('come back')}.`)]] },
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
cardTx.key = ''; drawNote(); drawQ();
// redraw the label textures now that the fonts are present
for (const lab of LABELS) { const { canvas: c, g: ctx } = lab.userData.tx; ctx.clearRect(0, 0, c.width, c.height); let s = 170; ctx.font = `400 ${s}px ${SERIF}`;
  while (ctx.measureText(lab.userData.label).width > c.width - 60) { s -= 4; ctx.font = `400 ${s}px ${SERIF}`; }
  ctx.fillStyle = '#191632'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab.userData.label, c.width / 2, c.height * 0.54); lab.userData.tx.tex.needsUpdate = true; }
renderAt(0);
window.ready = true;
