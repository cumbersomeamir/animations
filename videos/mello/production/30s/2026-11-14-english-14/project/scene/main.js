// Mello 30 s english14-01 (English): "why a friend's problem is easier to untangle than your own" (Solomon's paradox and
// self-distancing: Grossmann & Kross 2014; distanced self-talk: Kross et al. 2014). The brief's proposed topic (Zeigarnik /
// write the next action and when) overlaps english12-01, so a genuinely different same-genre topic was chosen (context/24).
// Rules of 2026-11-11 (context/10 section 8) and the latest feedback are retained: hook -> super hook -> proof -> payoff -> CTA,
// one visual idea at a time, large brief labels, captions inside x 100-900, the store-sampled palette (context/22) and a
// soothing original bed under the voice. Room, desk, rig, camera helper, caption mechanics, dark in-app card, note card and
// the oriented-box audit are carried over from ../../2026-11-13-english-13/project. New: two floating knots ("a friend's"
// untangles, "yours" stays tangled), the Solomon's-paradox card with the wise-reasoning gap that closes as the camera steps
// back, a self-talk bubble ("Why am I nervous?" -> "Why is Alex nervous?"), and the payoff note that untangles "yours".
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
// word starts measured with faster-whisper word timestamps on generated/narration.wav (see notes): "untangle" 0.77,
// "a friend's problem" 1.47, "your own" 2.79, "Solomon's paradox" 4.70, "people reasoned more wisely" 8.06,
// "someone else's conflict" 9.85, "than their own" 11.34, "reflected from a distance" 12.94, "the gap disappeared" 14.58,
// "using your own name" 16.65, "better speeches" 18.65, "less distress" 19.72, "ask yourself by name" 21.95,
// "Alex, what would you tell a friend?" 23.47
const S = { s1: 0.0, s2: 3.55, s3: 12.4, s4: 15.95, s5: 20.85, end: 30.0 };
const T = {
  untangleA: 0.85, untangleB: 2.0,                               // the friend's knot comes loose; yours stays tangled
  title: 4.6,                                                     // "Solomon's paradox"
  bars: 7.9, other: 9.8, own: 11.3,                               // wise reasoning: someone else's (long) vs your own (short)
  closeA: 14.5, closeB: 15.4,                                     // "the gap disappeared": your own bar grows to match
  bubble: 16.25, swapName: 16.95, calm: 18.6,                     // "Why am I nervous?" -> "Why is Alex nervous?"
  knotIn: 21.05, writeA: 22.0, writeB: 23.4, write2B: 24.6,      // the note: "Alex," / "what would you tell a friend?"
  loosenA: 23.6, loosenB: 25.1, pullA: 25.2,
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






// ---------------------------------------------------------------- episode props: store palette, knots, card, bubble, note
// palette sampled 2026-11-11 from the current Play listing (context/22): stage #EDE8FE, ink #191632, violet #633BFE,
// lilac #E6D2FC, deep violet #5B45A3, dark UI #060513, gold #FEC357.
const PAL = { bg: '#EDE8FE', ink: '#191632', violet: '#633BFE', lilac: '#E6D2FC', deep: '#5B45A3', dark: '#060513', gold: '#FEC357' };
scene.background.set('#F0E9F5');   // = the far floor as rendered from the cross-desk cameras (context/23), so no horizon line shows
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
lamp.visible = false;   // the desk lamp would sit between the cross-desk cameras and the knots (as english13)
scene.traverse(o => { if (o.isMesh && o.rotation.x === -Math.PI / 2 && Math.abs(o.position.y - (DESK_Y + 0.002)) < 1e-4 && Math.abs(o.position.x - 0.5) < 1e-3 && Math.abs(o.position.z + 0.22) < 1e-3) o.visible = false; });

// ---- the knots: a tangled torus-knot path that can loosen into a calm ring (the same length of "thread")
const KN = 220, KR = 0.11;
function knotPts(seed, jit, t) {
  const pts = [];
  for (let i = 0; i < KN; i++) { const f = i / KN * Math.PI * 2, p = 3, q = 7;
    const r = 0.62 + 0.38 * Math.cos(q * f);
    const j = jit * 0.06 * Math.sin(f * 11 + t * 7 + seed) * Math.sin(t * 3.1 + seed);
    pts.push(V(r * Math.cos(p * f) * (1 + j), r * Math.sin(p * f) * (1 - j), 0.42 * Math.sin(q * f))); }
  return pts;
}
const ringPts = Array.from({ length: KN }, (_, i) => { const f = i / KN * Math.PI * 2; return V(Math.cos(f), Math.sin(f), 0); });
function makeKnot(col) {
  const g = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, emissive: new THREE.Color(col), emissiveIntensity: 0.25 });
  g.userData = { mat, mesh: null, key: '' }; scene.add(g); return g;
}
function setKnot(k, u, jit, t, seed) {
  const key = u.toFixed(3) + '|' + (jit > 0 ? Math.floor(t * 30) : 0); if (key === k.userData.key) return; k.userData.key = key;
  const kp = knotPts(seed, jit, t), pts = kp.map((p, i) => p.clone().lerp(ringPts[i], eio(u)).multiplyScalar(KR));
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 360, 0.011, 10, true);
  if (k.userData.mesh) { k.remove(k.userData.mesh); k.userData.mesh.geometry.dispose(); }
  k.userData.mesh = mesh(geo, k.userData.mat, false, false); k.add(k.userData.mesh);
}
const knotF = makeKnot('#B9A4FF'), knotY = makeKnot(PAL.violet);
const labF = makeLabel('a friend’s', 0.24), labY = makeLabel('yours', 0.2);

// ---- the card (S2-S3): "Solomon's paradox" -> wise reasoning, someone else's vs your own -> the gap closes
const CARD_POS = V(-0.58, 1.55, 0.42);
const card = makeCard(0.7, 0.52); const cardTx = cardCanvas(card, 0.68, 0.505, 1220, 906);
function crown(g, x, y, s, a) { g.globalAlpha = a; g.fillStyle = PAL.gold; g.beginPath(); g.moveTo(x - s, y + s * 0.5); g.lineTo(x - s, y - s * 0.4); g.lineTo(x - s * 0.5, y + s * 0.05);
  g.lineTo(x, y - s * 0.6); g.lineTo(x + s * 0.5, y + s * 0.05); g.lineTo(x + s, y - s * 0.4); g.lineTo(x + s, y + s * 0.5); g.closePath(); g.fill(); g.globalAlpha = 1; }
function drawCard(t) {
  const m = sm(remap(t, S.s2 - 0.05, S.s2 + 0.3)), ti = sm(remap(t, T.title - 0.15, T.title + 0.25)), b = sm(remap(t, T.bars - 0.35, T.bars));
  const o1 = eio(remap(t, T.other, T.other + 0.6)), o2 = eio(remap(t, T.own, T.own + 0.6)), cl = eio(remap(t, T.closeA, T.closeB));
  const key = [m, ti, b, o1, o2, cl].map(x => x.toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle';
  if (b < 1) {   // A: the name of the effect
    const a = m * (1 - b); g.globalAlpha = a * ti; crown(g, 610, 300, 110, a * ti);
    g.globalAlpha = a * ti; g.fillStyle = '#FFFFFF'; g.font = `400 150px ${SERIF}`; g.textAlign = 'center'; g.fillText('Solomon’s', 610, 520); g.fillText('paradox', 610, 660); g.textAlign = 'left';
  }
  if (b > 0) {   // B: wise reasoning about someone else's problem vs your own (schematic bars, direction only)
    const a = m * b; g.globalAlpha = a; g.fillStyle = '#FFFFFF'; g.font = `400 112px ${SERIF}`; g.fillText('wise reasoning', 60, 110);
    const row = (y, lab, p, frac, col) => { if (p <= 0) return; g.globalAlpha = a * sm(Math.min(1, p * 2)); g.fillStyle = '#FFFFFF'; g.font = `400 96px ${SERIF}`; g.fillText(lab, 70, y);
      rr(g, 70, y + 66, 1060, 84, 42, '#1C1736'); rr(g, 70, y + 66, Math.max(84, 1060 * frac * p), 84, 42, col); };
    row(300, 'someone else’s', o1, 0.8, PAL.violet);
    row(590, 'your own', o2, lerp(0.42, 0.8, cl), lerp(0, 1, cl) > 0.5 ? PAL.violet : '#5E577E');
    g.globalAlpha = 1;
  }
  tex.needsUpdate = true;
}

// ---- the self-talk bubble (S4): "Why am I nervous?" -> "Why is Alex nervous?"
const BUB = { w: 0.62, h: 0.24, cw: 1240, ch: 480 };
const bubble = new THREE.Group();
const bubTx = (() => { const c = document.createElement('canvas'); c.width = BUB.cw; c.height = BUB.ch; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g: c.getContext('2d'), t, key: '' }; })();
const bubPlane = new THREE.Mesh(new THREE.PlaneGeometry(BUB.w, BUB.h), new THREE.MeshBasicMaterial({ map: bubTx.t, transparent: true, depthWrite: false, toneMapped: false }));
bubPlane.renderOrder = 5; bubble.add(bubPlane); bubble.userData = { body: bubPlane }; scene.add(bubble);
function drawBubble(sw) {
  const key = sw.toFixed(3); if (key === bubTx.key) return; bubTx.key = key;
  const g = bubTx.g; g.clearRect(0, 0, BUB.cw, BUB.ch); g.textBaseline = 'middle'; g.textAlign = 'center';
  rr(g, 20, 20, BUB.cw - 40, BUB.ch - 120, 70, '#FFFDF7'); g.fillStyle = '#FFFDF7'; g.beginPath(); g.moveTo(180, BUB.ch - 110); g.lineTo(130, BUB.ch - 20); g.lineTo(290, BUB.ch - 110); g.closePath(); g.fill();
  g.font = `italic 400 128px ${SERIF}`;
  if (sw < 1) { g.globalAlpha = 1 - sw; g.fillStyle = INK; g.fillText('Why am I nervous?', BUB.cw / 2, 200 - 30 * sw); }
  if (sw > 0) { g.globalAlpha = sw; const a = 'Why is ', b = 'Alex', c = ' nervous?'; const wa = g.measureText(a).width, wb = g.measureText(b).width, wc = g.measureText(c).width;
    let x = BUB.cw / 2 - (wa + wb + wc) / 2; g.textAlign = 'left'; g.fillStyle = INK; g.fillText(a, x, 200 + 30 * (1 - sw)); g.fillStyle = PAL.violet; g.fillText(b, x + wa, 200 + 30 * (1 - sw)); g.fillStyle = INK; g.fillText(c, x + wa + wb, 200 + 30 * (1 - sw)); }
  g.globalAlpha = 1; bubTx.t.needsUpdate = true;
}

// ---- the note card (S5): "Alex," / "what would you tell a friend?"
const NOTE = { w: 0.56, h: 0.3, cw: 1120, ch: 600 };
const note = new THREE.Group();
const noteBody = mesh(new RoundedBoxGeometry(NOTE.w, NOTE.h, 0.01, 3, 0.022), new THREE.MeshBasicMaterial({ color: '#FFFDF7', transparent: true, toneMapped: false }), false, false); note.add(noteBody);
const noteTx = (() => { const c = document.createElement('canvas'); c.width = NOTE.cw; c.height = NOTE.ch; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g: c.getContext('2d'), t, key: '' }; })();
const notePlane = new THREE.Mesh(new THREE.PlaneGeometry(NOTE.w - 0.01, NOTE.h - 0.01), new THREE.MeshBasicMaterial({ map: noteTx.t, transparent: true, depthWrite: false, toneMapped: false }));
notePlane.position.z = 0.0062; notePlane.renderOrder = 5; note.add(notePlane); note.userData = { body: noteBody }; scene.add(note);
function drawNote(p1, p2) {
  const key = p1.toFixed(3) + '|' + p2.toFixed(3); if (key === noteTx.key) return; noteTx.key = key;
  const g = noteTx.g; g.clearRect(0, 0, NOTE.cw, NOTE.ch); g.textBaseline = 'middle';
  const line = (s, x, y, size, col, p) => { if (p <= 0) return; g.font = `italic 400 ${size}px ${SERIF}`; const w = g.measureText(s).width;
    g.save(); g.beginPath(); g.rect(x - 10, y - size, (w + 24) * p, size * 2); g.clip(); g.fillStyle = col; g.fillText(s, x, y); g.restore(); };
  line('Alex,', 74, 170, 150, PAL.violet, p1);
  line('what would you', 74, 330, 120, INK, clamp(p2 * 2));
  line('tell a friend?', 74, 470, 120, INK, clamp(p2 * 2 - 1));
  noteTx.t.needsUpdate = true;
}

// ---------------------------------------------------------------- choreography: seated at the desk (stool), facing -z
const SEAT = V(0, 0.64, 0.7);
const NBPOS = V(-0.06, DESK_Y + NB.h / 2 + 0.001, 0.12);
function pose(t) {
  const P = {};
  const tense = t < S.s4 ? 0 : (1 - sm(remap(t, T.calm, T.calm + 1.2)));   // shoulders drop once the self-talk is distanced
  P.breath = Math.sin(t * 2 * Math.PI / (t > T.calm ? 4.8 : 3.6));
  P.lean = track(t, [[0, 0.2], [S.s4, 0.26], [T.calm + 1.2, 0.14], [S.s5, 0.18], [T.writeA, 0.3], [30, 0.28]]);
  P.headPitch = track(t, [[0, -0.05], [T.untangleA, -0.05], [T.untangleB, 0.0], [S.s4, -0.2], [T.calm, -0.05], [S.s5, -0.1], [T.writeA, -0.45], [30, -0.48]]);
  P.headYaw = track(t, [[0, 0.35], [T.untangleB, 0.35], [T.untangleB + 0.5, -0.4], [S.s2, -0.4], [S.s4, 0.1], [S.s5, 0.0], [30, 0.0]]);
  P.shrug = 0.04 * tense;
  return P;
}
const figRef = {};
function placeFigure(t, P) {
  const br = P.breath, pel = SEAT.clone();
  torso.position.copy(pel);
  torso.rotation.set(-P.lean, P.headYaw * 0.15, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br + P.shrug, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + P.lean * 0.45, P.headYaw, 0, 'YXZ');
  torso.updateMatrixWorld(true);
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
  const restL = V(-0.16, DESK_Y + 0.045, 0.27), restR = V(0.2, DESK_Y + 0.045, 0.27);
  let hL = restL.clone(), hR = restR.clone();
  // S4: hands clasped in front while nervous, opening as he settles
  const nerv = t >= S.s4 && t < S.s5 ? 1 - sm(remap(t, T.calm, T.calm + 1.0)) : 0;
  hL = vl(hL, V(-0.03, DESK_Y + 0.07, 0.3), nerv); hR = vl(hR, V(0.03, DESK_Y + 0.07, 0.3), nerv);
  // S5: writing the note in the notebook
  const wr = sm(remap(t, T.writeA - 0.5, T.writeA)), wig = (t > T.writeA && t < T.write2B) ? 1 : 0;
  if (wr > 0) {
    const pen = NBPOS.clone().add(V(-0.06 + 0.12 * clamp(remap(t, T.writeA, T.write2B)), 0.045 + 0.006 * Math.sin(t * 36) * wig, -0.02 + 0.01 * Math.sin(t * 9) * wig));
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
function setProps(t) {
  notebook.visible = true; notebook.position.copy(NBPOS); notebook.rotation.set(0, 0.06, 0);
  coverPivot.rotation.z = Math.PI * 0.985 * sm(remap(t, T.writeA - 0.8, T.writeA - 0.2)); notebook.updateMatrixWorld(true);
  nbBlob.position.set(NBPOS.x, DESK_Y + 0.003, NBPOS.z); nbBlob.material.opacity = 0.5;
  ink.forEach((ln, i) => { const p = clamp(remap(t, T.writeA + i * 0.5, T.writeA + i * 0.5 + 0.45)); ln.visible = p > 0; ln.scale.x = Math.max(0.0001, 0.15 * p * (i === 4 ? 0.6 : 1)); ln.position.x = 0.005 - 0.075 + 0.075 * p * (i === 4 ? 0.6 : 1); });
}
function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  const hp = figRef.headP || V(0, 1.37, 0.68);
  // knots: S1 both (the friend's loosens, yours stays tangled); S5 yours returns beside him and loosens as the note is written
  const k1 = t < S.s2 ? 1 : 0, k5 = t >= S.s5 ? sm(remap(t, T.knotIn, T.knotIn + 0.4)) : 0;
  knotF.visible = k1 > 0; knotY.visible = k1 > 0 || k5 > 0;
  const spin = (k, a) => { k.quaternion.copy(camera.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35 * Math.sin(t * 0.7 + a), 0.5 * Math.sin(t * 0.5 + a), t * 0.4 + a))); };
  if (k1) {
    knotF.position.set(0.22, 1.47 + 0.02 * Math.sin(t * 1.5), 0.42); spin(knotF, 0); knotF.scale.setScalar(0.9); setKnot(knotF, clamp(remap(t, T.untangleA, T.untangleB)), 0, t, 1.3);
    knotY.position.set(-0.22, 1.47 + 0.02 * Math.sin(t * 1.7 + 1), 0.42); spin(knotY, 2); knotY.scale.setScalar(0.9); setKnot(knotY, 0, 1, t, 4.1);
  } else if (k5) {
    const lo = clamp(remap(t, T.loosenA, T.loosenB));
    knotY.position.set(-0.2, 1.2 + 0.02 * Math.sin(t * 1.5), 0.3); spin(knotY, 2); knotY.scale.setScalar(0.8 * k5); setKnot(knotY, lo, 1 - lo, t, 4.1);
    knotY.userData.mat.color.set(PAL.violet).lerp(new THREE.Color('#B9A4FF'), lo); knotY.userData.mat.emissive.copy(knotY.userData.mat.color);
  }
  const lab = (L, a, pos, s) => { L.visible = a > 0.003; if (!L.visible) return; L.position.copy(pos); L.quaternion.copy(camera.quaternion); L.scale.setScalar(s * lerp(0.75, 1, a)); L.userData.body.material.opacity = a; L.userData.txt.material.opacity = a; };
  const la = sm(remap(t, 0.0, 0.01)) * (1 - sm(remap(t, S.s2 - 0.3, S.s2 - 0.02)));
  lab(labF, la, V(0.2, 1.29, 0.42), 0.8); lab(labY, la, V(-0.19, 1.29, 0.42), 0.8);
  // card (S2-S3)
  const v = sm(remap(t, S.s2 - 0.05, S.s2 + 0.25)) * (1 - sm(remap(t, S.s4 - 0.3, S.s4 - 0.02)));
  card.visible = v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0); card.scale.setScalar(1.0);
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
  // self-talk bubble (S4), above-left of his head
  const bv = sm(remap(t, T.bubble, T.bubble + 0.3)) * (1 - sm(remap(t, S.s5 - 0.3, S.s5 - 0.02)));
  bubble.visible = bv > 0.003;
  if (bubble.visible) { bubble.position.copy(hp).add(V(-0.1, 0.36, -0.05)); bubble.quaternion.copy(camera.quaternion); bubble.scale.setScalar(0.75 * lerp(0.85, 1, bv)); bubPlane.material.opacity = bv; drawBubble(eio(remap(t, T.swapName, T.swapName + 0.5))); }
  // note card (S5)
  const nIn = sm(remap(t, T.writeA - 0.3, T.writeA)), nOut = sm(remap(t, T.pullA + 0.6, T.pullA + 1.1));
  note.visible = t >= S.s5 && nIn * (1 - nOut) > 0.003;
  if (note.visible) { anchor(note, 500, 730, 680 * lerp(0.92, 1, nIn), NOTE.w); noteBody.material.opacity = nIn * (1 - nOut); notePlane.material.opacity = nIn * (1 - nOut);
    drawNote(clamp(remap(t, T.writeA, T.writeB)), clamp(remap(t, T.writeB + 0.1, T.write2B))); }
}
const LABELS = [labF, labY];


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 across the desk, facing him: two knots float beside him; the friend's comes loose, his stays tangled
  { a: S.s1, b: S.s2, k0: [V(0.0, 1.3, 0.4), 172, 8, 2.75, 30], k1: [V(0.0, 1.3, 0.4), 176, 8, 2.6, 30] },
  // S2 the card beside him: the name of the effect, then the wise-reasoning gap
  { a: S.s2, b: S.s3, k0: [V(-0.58, 1.55, 0.42), 176, 4, 3.55, 30], k1: [V(-0.58, 1.55, 0.42), 172, 4, 3.4, 30] },
  // S3 from behind him, stepping back from the card: "from a distance" the gap closes
  { a: S.s3, b: S.s4, m: [S.s3 + 0.2, T.closeA], ease: 'sine', k0: [V(-0.53, 1.55, 0.42), -14, 5, 3.3, 30], k1: [V(-0.5, 1.45, 0.45), -18, 8, 4.1, 30] },
  // S4 across the desk from the right: the self-talk bubble switches "I" for his name; his shoulders drop
  { a: S.s4, b: S.s5, k0: [V(-0.08, 1.38, 0.55), 160, 9, 2.5, 30], k1: [V(-0.08, 1.38, 0.55), 164, 9, 2.38, 30] },
  // S5 across the desk, close: the note, and his knot loosening; then a slow pull back for the lock-up
  { a: S.s5, b: S.end, m: [T.pullA, 27.4], ease: 'sine', k0: [V(-0.05, 1.28, 0.35), 168, 15, 2.3, 30], k1: [V(-0.08, 1.32, 0.3), 160, 15, 2.8, 30],
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
  // crucial in-scene text: the card, the bubble, the note card and the knot labels, each audited by its own oriented box
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const keep = b => (onScreen(b) ? b : null);
  const crucial = { card: card.visible ? keep(textBox(card)) : null, bubble: bubble.visible ? keep(textBox(bubble)) : null, note: note.visible ? keep(textBox(note)) : null };
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
const studyP = PS('study')[0][1], distP = PS('distance')[1][1], selfP = PS('selftalk')[0][1], payP = PS('payoff')[1][1];
const W_FASTER = 2.13, W_ABOUT = 9.45, W_THAN = 11.26;
const CAPS = [
  { a: -1, b: W_FASTER - 0.12, size: C2, lines: [[sg('Why can you untangle')], [sg(`a ${hl('friend’s problem')}`, 1.4)]] },
  { a: W_FASTER - 0.06, b: TL.name.start - 0.12, size: C1, lines: [[sg(`faster than ${hl('your own?')}`)]] },
  { a: TL.name.start - 0.06, b: TL.study.start - 0.12, size: C2, lines: [[sg('Researchers call it')], [sg(`${hl('Solomon’s paradox')}.`, 4.6)]] },
  { a: TL.study.start - 0.06, b: studyP - 0.12, size: C1, lines: [[sg('Across three experiments,')]] },
  { a: studyP - 0.06, b: W_THAN - 0.12, size: C2, lines: [[sg(`people reasoned ${hl('more wisely')}`)], [sg(`about ${hl('someone else’s')} conflict`, W_ABOUT)]] },
  { a: W_THAN - 0.06, b: TL.distance.start - 0.12, size: C1, lines: [[sg('than their own.')]] },
  { a: TL.distance.start - 0.06, b: distP - 0.12, size: C2, lines: [[sg('But when they reflected')], [sg(`${hl('from a distance')},`, 13.4)]] },
  { a: distP - 0.06, b: TL.selftalk.start - 0.12, size: C1, lines: [[sg(`the gap ${hl('disappeared')}.`)]] },
  { a: TL.selftalk.start - 0.06, b: selfP - 0.12, size: C2, lines: [[sg('Self-talk using')], [sg(`${hl('your own name')}`, 16.9)]] },
  { a: selfP - 0.06, b: TL.payoff.start - 0.12, size: C2, lines: [[sg(`also led to ${hl('better speeches')}`)], [sg(`and ${hl('less distress')}.`, 19.3)]] },
  { a: TL.payoff.start - 0.06, b: payP - 0.12, size: C2, lines: [[sg('So when you’re stuck,')], [sg(`ask yourself ${hl('by name')}:`, 21.9)]] },
  { a: payP - 0.06, b: TL.payoff.end + 0.4, size: C2, lines: [[sg(`${hl('Alex')}, what would you`)], [sg('tell a friend?', 24.2)]] },
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
cardTx.key = ''; noteTx.key = ''; bubTx.key = '';
// redraw the label textures now that the fonts are present
for (const lab of LABELS) { const { canvas: c, g: ctx } = lab.userData.tx; ctx.clearRect(0, 0, c.width, c.height); let s = 170; ctx.font = `400 ${s}px ${SERIF}`;
  while (ctx.measureText(lab.userData.label).width > c.width - 60) { s -= 4; ctx.font = `400 ${s}px ${SERIF}`; }
  ctx.fillStyle = '#191632'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab.userData.label, c.width / 2, c.height * 0.54); lab.userData.tx.tex.needsUpdate = true; }
renderAt(0);
window.ready = true;
