// Mello 30 s english11-01 (English): "environmental friction: make the distracting habit slightly harder and the useful one
// easier" (Maas, de Ridder, de Vet & de Wit 2012; Hollands et al. 2019 Cochrane review in the notes). Same accepted style
// recipe and renderer as the latest accepted episodes ("Thoughts in a Quiet Room": sparse clean 3D miniature, one abstract
// faceless performer, soft contact shadows, white/pale-gray stage, lavender #D9BCF5 only as the highlight; English captions
// in Instrument Serif). Room, desk props, rig, camera helper, caption mechanics, cards and the oriented-box safe-zone audit
// are carried over from ../../2026-11-09-english-10/project. New for this episode: a bed and nightstand, a phone that lights
// up within reach, the snack-distance study card, the effort/friction card with the phone and book swapping places, the
// phone charging across the room and a book placed where the phone used to be.
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
const hookSplit = SPL('hook'), studySplit = SPL('study'), mechSplit = SPL('mech'), nameSplit = SPL('name'), tipSplit = SPL('tip'), closeSplit = SPL('close');
// word starts measured with faster-whisper word timestamps on generated/narration.wav (see notes): "within reach" 1.01,
// "your book" 2.40, "moving snacks" 4.85, "half a metre" 5.60, "farther away" 6.18, "fewer people" 7.18, "noticeable" 9.55,
// "reaching" 10.53, "more effort" 11.71, "friction" 13.23, "changes what's easy" 15.65, "charge your phone" 18.05,
// "across the room" 18.75, "put a book" 19.97, "where it used to be" 20.43, "easy reach" 22.43, "not the scroll" 23.73
const S = { s1: 0.0, s2: 3.6, s3: 8.75, s4: 17.3, s5: 20.3, end: 30.0 };
const T = {
  reachA: 0.85, reachB: 1.3, pickB: 1.85, bookPill: hookSplit + 0.02,
  study: S.s2 + 0.05, bowl: studySplit - 0.1, slideA: 5.55, slideB: 6.45, fewer: 7.1,
  notice: 9.4, effA: mechSplit + 0.05, effB: 11.75,
  friction: TL.name.start - 0.05, swapA: 15.5, swapB: 16.45,
  placeA: 17.75, placeB: 18.45, charge: 18.5, bookA: 19.55, bookB: 20.1,
  putA: 20.4, putB: 21.0, easy: 22.4,
  liftA: 24.0, liftB: 24.6, openA: 24.7, openB: 25.4,
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






// ---------------------------------------------------------------- episode props: bed, nightstand, phone, pad, book, cards
const lavender = new THREE.Color('#D9BCF5');
const INK = '#17122E', NAVY = '#1C1733', PEACH = '#F0D2A6', SLATE = '#5E577E';
const UI = '"Inter", sans-serif', SERIF = '"Instrument Serif", serif';
function rr(g, x, y, w, h, r, fill, stroke, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function check(g, x, y, s, col, lw) { g.strokeStyle = col; g.lineWidth = lw || s * 0.16; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 0.35, y + s * 0.35); g.lineTo(x + s, y - s * 0.4); g.stroke(); }
function makeCard(w, h) {
  const g = new THREE.Group();
  const border = mesh(new RoundedBoxGeometry(w + 0.03, h + 0.03, 0.01, 3, 0.02), std('#D9BCF5', 0.45, { transparent: true, emissive: lavender.clone(), emissiveIntensity: 0.12 }), false, false);
  border.position.z = -0.006; g.add(border);
  const panel = mesh(new RoundedBoxGeometry(w, h, 0.012, 3, 0.016), std('#FBF8F0', 0.9, { transparent: true, emissive: new THREE.Color('#FBF8F0'), emissiveIntensity: 0.3 }), false, false); g.add(panel);
  g.userData = { border, panel }; scene.add(g); return g;
}
function cardCanvas(card, w, h, cw, ch) {
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  m.position.z = 0.0075; m.renderOrder = 5; card.add(m); return { c, g: c.getContext('2d'), t, m, key: '' };
}
function pillTxt(g, txt, cx, cy, size, fill, a = 1) { if (a <= 0) return; g.globalAlpha = a; g.font = `400 ${size}px ${SERIF}`; const w = g.measureText(txt).width + size * 0.7; rr(g, cx - w / 2, cy - size * 0.66, w, size * 1.3, size * 0.34, fill); g.fillStyle = INK; g.textAlign = 'center'; g.fillText(txt, cx, cy + size * 0.03); g.textAlign = 'left'; g.globalAlpha = 1; }
function makeLabel(text, w = 0.2, col = '#D9BCF5') {
  const lab = new THREE.Group();
  const lb = mesh(new RoundedBoxGeometry(w, 0.08, 0.016, 3, 0.016), std(col, 0.5, { transparent: true }), false, false); lab.add(lb);
  const ltx = textTexture(text, { font: SERIF, w: Math.round(3200 * w), h: 256, size: 170, color: INK, pad: 24 });
  const lp = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.01, 0.076), new THREE.MeshBasicMaterial({ map: ltx.tex, transparent: true, depthWrite: false, toneMapped: false }));
  lp.position.z = 0.0085; lp.renderOrder = 6; lab.add(lp); lab.userData = { body: lb, txt: lp, tx: ltx, label: text }; scene.add(lab); return lab;
}
// screen-anchored helper: put a camera-facing object at a fixed screen spot (2.2 m in front of the camera)
function anchor(obj, cx, cy, wpx, wWorld) {
  const dd = 2.2, th = Math.tan(camera.fov * D2R / 2), q = camera.quaternion;
  const nx = 2 * cx / W - 1, ny = 1 - 2 * cy / H;
  obj.position.copy(camera.position).add(V(0, 0, -1).applyQuaternion(q).multiplyScalar(dd))
    .add(V(1, 0, 0).applyQuaternion(q).multiplyScalar(nx * dd * th * W / H)).add(V(0, 1, 0).applyQuaternion(q).multiplyScalar(ny * dd * th));
  obj.quaternion.copy(q); obj.scale.setScalar((wpx / H * 2 * dd * th) / wWorld);
}

// ---- the bed (left of the room) and the nightstand beside its head
const M_BED = std('#E7D9C6', 0.72), M_SHEET = std('#F6F4F8', 0.92), M_DUVET = std('#DDD3EE', 0.95);
const BED = { x: -2.35, z: -0.05, w: 1.1, l: 2.0, top: 0.5 };
{
  const base = mesh(new RoundedBoxGeometry(BED.w, 0.26, BED.l, 3, 0.03), M_BED); base.position.set(BED.x, 0.19, BED.z); scene.add(base);
  const matt = mesh(new RoundedBoxGeometry(BED.w - 0.04, 0.18, BED.l - 0.05, 4, 0.06), M_SHEET); matt.position.set(BED.x, 0.41, BED.z); scene.add(matt);
  const duvet = mesh(new RoundedBoxGeometry(BED.w + 0.02, 0.06, 1.25, 4, 0.03), M_DUVET); duvet.position.set(BED.x, 0.52, BED.z + 0.37); scene.add(duvet);
  const pillow = mesh(new RoundedBoxGeometry(0.52, 0.11, 0.32, 4, 0.05), M_SHEET); pillow.position.set(BED.x, 0.555, BED.z - 0.76); pillow.rotation.x = -0.12; scene.add(pillow);
  const headb = mesh(new RoundedBoxGeometry(BED.w + 0.04, 0.95, 0.06, 3, 0.025), M_BED); headb.position.set(BED.x, 0.475, BED.z - BED.l / 2 - 0.03); scene.add(headb);
  blob(BED.w + 0.35, BED.l + 0.3, 0.32).position.set(BED.x, 0.012, BED.z);
}
const NIGHT = V(-1.53, 0.52, -0.8);
{
  const body = mesh(new RoundedBoxGeometry(0.36, NIGHT.y - 0.06, 0.34, 3, 0.02), M_BED); body.position.set(NIGHT.x, (NIGHT.y - 0.06) / 2 + 0.04, NIGHT.z); scene.add(body);
  const top = mesh(new RoundedBoxGeometry(0.4, 0.03, 0.38, 3, 0.01), M_BED); top.position.set(NIGHT.x, NIGHT.y - 0.015, NIGHT.z); scene.add(top);
  const drawer = mesh(new RoundedBoxGeometry(0.012, 0.012, 0.08, 2, 0.004), std('#CDBBA3', 0.6)); drawer.position.set(NIGHT.x + 0.185, NIGHT.y - 0.15, NIGHT.z); scene.add(drawer);
  blob(0.55, 0.52, 0.45).position.set(NIGHT.x, 0.012, NIGHT.z);
  blob(0.34, 0.32, 0.25, NIGHT.y + 0.001).position.set(NIGHT.x, NIGHT.y + 0.001, NIGHT.z);
}
const PHONE_SPOT = V(NIGHT.x + 0.02, NIGHT.y + 0.006, NIGHT.z + 0.04);
const BOOK_SPOT = V(NIGHT.x + 0.0, NIGHT.y + 0.0, NIGHT.z + 0.03);

// ---- phone (screen is a canvas: notifications -> a scrolling feed -> charging)
const phone = new THREE.Group();
const phoneBody = mesh(new RoundedBoxGeometry(0.078, 0.009, 0.158, 3, 0.004), std('#1C1733', 0.4)); phone.add(phoneBody);
const scr = { c: document.createElement('canvas') }; scr.c.width = 256; scr.c.height = 512; scr.g = scr.c.getContext('2d');
scr.tex = new THREE.CanvasTexture(scr.c); scr.tex.colorSpace = THREE.SRGBColorSpace; scr.key = '';
const screenM = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.148), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }));
screenM.rotation.x = -Math.PI / 2; screenM.position.y = 0.0047; phone.add(screenM);
scene.add(phone);
const phoneBlob = blob(0.14, 0.22, 0.4, 0.0);
function drawScreen(mode, t) {
  const k = mode + '|' + (mode === 'feed' ? Math.floor(t * 30) : mode === 'notif' ? Math.floor(t * 10) : Math.floor(t * 6)); if (k === scr.key) return; scr.key = k;
  const g = scr.g; g.clearRect(0, 0, 256, 512); rr(g, 0, 0, 256, 512, 26, mode === 'charge' ? '#120E24' : '#221B44');
  if (mode === 'notif') {
    for (let i = 0; i < 4; i++) { const a = clamp((t + 0.6 - i * 0.35) / 0.25); if (a <= 0) continue; g.globalAlpha = a;
      rr(g, 18, 70 + i * 92, 220, 76, 18, i === 0 ? '#D9BCF5' : '#3A3264'); g.fillStyle = i === 0 ? '#5E577E' : '#8E86AE'; g.beginPath(); g.arc(50, 108 + i * 92, 14, 0, 7); g.fill();
      g.fillRect(76, 94 + i * 92, 130, 10); g.fillRect(76, 116 + i * 92, 90, 10); g.globalAlpha = 1; }
  } else if (mode === 'feed') {
    const off = (t * 120) % 150;
    for (let i = -1; i < 5; i++) { const y = 30 + i * 150 - off; rr(g, 18, y, 220, 130, 16, i % 2 ? '#3A3264' : '#4A3F7A'); g.fillStyle = '#8E86AE'; g.fillRect(34, y + 96, 150, 10); }
  } else {
    const p = 0.5 + 0.5 * Math.sin(t * 3);
    g.strokeStyle = `rgba(217,188,245,${0.35 + 0.4 * p})`; g.lineWidth = 10; g.beginPath(); g.arc(128, 256, 62, 0, 7); g.stroke();
    g.fillStyle = '#D9BCF5'; g.beginPath(); g.moveTo(138, 206); g.lineTo(102, 264); g.lineTo(128, 264); g.lineTo(118, 306); g.lineTo(156, 244); g.lineTo(130, 244); g.closePath(); g.fill();
  }
  scr.tex.needsUpdate = true;
}
// notification chips rising off the phone (S1)
const chips = [-0.7, -0.35, 0.0, 0.35, 0.7].map((t0, i) => {
  const c = new THREE.Group();
  const b = mesh(new RoundedBoxGeometry(0.1, 0.034, 0.008, 3, 0.012), std(i % 2 ? '#FFFFFF' : '#EADCFB', 0.5, { transparent: true }), false, false); c.add(b);
  const d = mesh(new THREE.CircleGeometry(0.008, 20), new THREE.MeshBasicMaterial({ color: '#A77BE6', transparent: true })); d.position.set(-0.03, 0, 0.0045); c.add(d);
  const l = mesh(new THREE.PlaneGeometry(0.04, 0.006), new THREE.MeshBasicMaterial({ color: '#8E86AE', transparent: true })); l.position.set(0.012, 0, 0.0045); c.add(l);
  c.userData = { t0, mats: [b.material, d.material, l.material], sx: [0.03, -0.035, 0.015, -0.02, 0.035][i] }; scene.add(c); return c;
});
// charging pad on the desk (across the room)
const PAD = V(0.05, DESK_Y + 0.006, 0.22);
const pad = mesh(new THREE.CylinderGeometry(0.06, 0.064, 0.012, 40), std('#FBFAF8', 0.5)); pad.position.copy(PAD); scene.add(pad);
const padRing = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.004, 8, 48), new THREE.MeshBasicMaterial({ color: '#C9A6F2', transparent: true, opacity: 0, toneMapped: false }));
padRing.rotation.x = -Math.PI / 2; padRing.position.copy(PAD).add(V(0, 0.004, 0)); scene.add(padRing);
blob(0.17, 0.17, 0.45, DESK_Y + 0.002).position.set(PAD.x, DESK_Y + 0.002, PAD.z);

// ---- the book (ochre hardcover; the cover opens about the spine)
const BK = { w: 0.15, d: 0.22, h: 0.034 };
const book = new THREE.Group();
{ const pg = mesh(new RoundedBoxGeometry(BK.w - 0.008, BK.h - 0.008, BK.d - 0.01, 2, 0.003), M.pages); book.add(pg);
  const bk = mesh(new RoundedBoxGeometry(BK.w, 0.004, BK.d, 2, 0.0018), M.cover); bk.position.y = -BK.h / 2 + 0.002; book.add(bk);
  const sp = mesh(new RoundedBoxGeometry(0.006, BK.h, BK.d, 2, 0.002), M.cover); sp.position.x = -BK.w / 2 + 0.003; book.add(sp); }
const bookCover = new THREE.Group(); bookCover.position.set(-BK.w / 2, BK.h / 2 - 0.002, 0); book.add(bookCover);
{ const cv = mesh(new RoundedBoxGeometry(BK.w, 0.004, BK.d, 2, 0.0018), M.cover); cv.position.set(BK.w / 2, 0, 0); bookCover.add(cv);
  const st = mesh(new THREE.BoxGeometry(0.09, 0.0045, 0.012), std('#FBF1DD', 0.8)); st.position.set(BK.w / 2, 0.0004, -0.05); cv.add(st); }
scene.add(book);
const bookBlob = blob(0.22, 0.3, 0.45, 0.0);
const BOOK_DESK = V(-0.45, DESK_Y + BK.h / 2, 0.08);
// dashed outline left where the phone used to be (S5)
const outl = { c: document.createElement('canvas') }; outl.c.width = 256; outl.c.height = 400; { const g = outl.c.getContext('2d'); g.setLineDash([22, 16]); rr(g, 16, 16, 224, 368, 34, null, '#B98EEA', 12); }
outl.tex = new THREE.CanvasTexture(outl.c); outl.tex.colorSpace = THREE.SRGBColorSpace;
const outline = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.18), new THREE.MeshBasicMaterial({ map: outl.tex, transparent: true, depthWrite: false, toneMapped: false }));
outline.rotation.x = -Math.PI / 2; outline.position.copy(PHONE_SPOT).add(V(0, -0.004, 0)); outline.renderOrder = 4; scene.add(outline);

// ---- labels
const bookLab = makeLabel('across the room', 0.36), padLab = makeLabel('charging', 0.24), easyLab = makeLabel('the easy reach', 0.34);
const LABELS = [bookLab, padLab, easyLab];

// ---- the main card (S2-S3): the snack-distance study -> what changed -> friction (phone and book swap places)
const CARD_POS = V(-2.45, 1.64, -0.5);
const card = makeCard(0.7, 0.52); const cardTx = cardCanvas(card, 0.68, 0.505, 1220, 906);
function bowl(g, x, y, s, a = 1) {
  g.globalAlpha = a; g.fillStyle = '#E9B984'; [[-0.42, -0.2], [0, -0.32], [0.4, -0.18], [-0.18, -0.42], [0.2, -0.45]].forEach(([dx, dy]) => { g.beginPath(); g.arc(x + dx * s, y + dy * s, s * 0.2, 0, 7); g.fill(); });
  g.fillStyle = '#B9B3CB'; g.beginPath(); g.moveTo(x - s * 0.75, y - s * 0.2); g.quadraticCurveTo(x, y + s * 0.85, x + s * 0.75, y - s * 0.2); g.closePath(); g.fill(); g.globalAlpha = 1;
}
function eye(g, x, y, s, a = 1) {
  g.globalAlpha = a; g.strokeStyle = SLATE; g.lineWidth = s * 0.12; g.beginPath(); g.moveTo(x - s, y); g.quadraticCurveTo(x, y - s * 0.8, x + s, y); g.quadraticCurveTo(x, y + s * 0.8, x - s, y); g.stroke();
  g.fillStyle = SLATE; g.beginPath(); g.arc(x, y, s * 0.3, 0, 7); g.fill(); g.globalAlpha = 1;
}
function phoneGlyph(g, x, y, s, a = 1, bolt = 0) { g.globalAlpha = a; rr(g, x - s * 0.32, y - s * 0.6, s * 0.64, s * 1.2, s * 0.12, NAVY); rr(g, x - s * 0.24, y - s * 0.5, s * 0.48, s * 0.95, s * 0.06, '#4A3F7A');
  if (bolt > 0) { g.globalAlpha = a * bolt; g.fillStyle = '#D9BCF5'; g.beginPath(); g.moveTo(x + s * 0.06, y - s * 0.3); g.lineTo(x - s * 0.14, y + s * 0.04); g.lineTo(x, y + s * 0.04); g.lineTo(x - s * 0.06, y + s * 0.3); g.lineTo(x + s * 0.14, y - s * 0.06); g.lineTo(x, y - s * 0.06); g.closePath(); g.fill(); }
  g.globalAlpha = 1; }
function bookGlyph(g, x, y, s, a = 1) { g.globalAlpha = a; rr(g, x - s * 0.42, y - s * 0.56, s * 0.84, s * 1.12, s * 0.08, '#D6A452'); g.fillStyle = '#FBF1DD'; g.fillRect(x - s * 0.24, y - s * 0.36, s * 0.48, s * 0.1); g.globalAlpha = 1; }
function drawCard(t) {
  const mA = sm(remap(t, T.study - 0.05, T.study + 0.3)), mB = sm(remap(t, T.notice - 0.35, T.notice)), mC = sm(remap(t, T.friction - 0.35, T.friction));
  const bw = sm(remap(t, T.bowl - 0.6, T.bowl - 0.2)), sl = eio(remap(t, T.slideA, T.slideB)), t70 = sm(remap(t, T.slideB - 0.2, T.slideB + 0.1)), fw = sm(remap(t, T.fewer, T.fewer + 0.3));
  const nt = sm(remap(t, T.notice, T.notice + 0.35)), ef = eio(remap(t, T.effA, T.effB)), me = sm(remap(t, T.effB - 0.15, T.effB + 0.2));
  const sw = eio(remap(t, T.swapA, T.swapB)), lb = sm(remap(t, T.swapB - 0.1, T.swapB + 0.3));
  const key = [mA, mB, mC, bw, sl, t70, fw, nt, ef, me, sw, lb].map(x => (+x).toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle'; g.textAlign = 'left';
  if (mB < 1) {   // A: one study -- the snack bowl moves from 20 cm to 70 cm away
    const a = mA * (1 - mB); g.globalAlpha = a; g.fillStyle = INK; g.font = `400 104px ${SERIF}`; g.fillText('one study', 44, 90);
    const X = d => 250 + d * 12.2, Y = 470;
    g.fillStyle = '#CFC6E3'; g.fillRect(170, Y + 70, 1000, 8);
    g.fillStyle = SLATE; g.beginPath(); g.arc(150, Y + 10, 52, 0, 7); g.fill(); g.font = `500 52px ${UI}`; g.textAlign = 'center'; g.fillText('you', 150, Y + 130);
    const d = lerp(20, 70, sl); bowl(g, X(d), Y + 10, 92, a * bw);
    g.globalAlpha = a * bw; g.fillStyle = SLATE; g.font = `500 54px ${UI}`; g.fillText('20 cm', X(20), Y + 140);
    g.globalAlpha = a * t70; g.fillText('70 cm', X(70), Y + 140);
    if (sl > 0) { g.globalAlpha = a * Math.min(1, sl * 3); g.strokeStyle = '#B98EEA'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(20), Y - 150); g.lineTo(X(d), Y - 150); g.stroke(); }
    g.textAlign = 'left'; g.globalAlpha = 1;
    if (fw > 0) pillTxt(g, 'fewer people ate any', 610, 800, 84, '#E7DAF8', a * fw);
  }
  if (mB > 0 && mC < 1) {   // B: what changed? just as noticeable; more effort
    const a = mB * (1 - mC); g.globalAlpha = a; g.fillStyle = INK; g.font = `400 104px ${SERIF}`; g.fillText('what changed?', 44, 90);
    const cols = [[330, '20 cm', 0.28], [890, '70 cm', 1.0]];
    for (const [x, lab, h] of cols) {
      bowl(g, x, 250, 70, a); g.globalAlpha = a; g.fillStyle = SLATE; g.font = `500 50px ${UI}`; g.textAlign = 'center'; g.fillText(lab, x, 345);
      eye(g, x - 40, 440, 56, a * nt); if (nt > 0) check(g, x + 40, 450, 56, '#A77BE6', 12);
      g.globalAlpha = a; const bh = 330 * h * ef; rr(g, x - 70, 860 - bh, 140, Math.max(bh, 1), 18, h > 0.5 ? '#B98EEA' : '#D9CCEE');
    }
    g.globalAlpha = a; g.textAlign = 'left';
    if (me > 0) pillTxt(g, 'more effort', 610, 600, 84, '#E7DAF8', a * me);
    g.globalAlpha = 1;
  }
  if (mC > 0) {   // C: friction -- the phone and the book trade places
    const a = mC; pillTxt(g, 'friction', 610, 96, 110, '#E7DAF8', a);
    g.globalAlpha = a; rr(g, 70, 300, 250, 420, 34, '#EFE9F7', '#CFC6E3', 5); rr(g, 110, 330, 170, 90, 24, '#FFFFFF');   // bed + pillow
    rr(g, 350, 300, 150, 150, 22, '#E7D9C6');   // nightstand
    rr(g, 840, 560, 320, 200, 26, '#E7D9C6');   // desk across the room
    const near = [425, 375], far = [1000, 660], ph = [lerp(near[0], far[0], sw), lerp(near[1], far[1], sw) - 120 * Math.sin(Math.PI * sw)], bk = [lerp(far[0], near[0], sw), lerp(far[1], near[1], sw) - 160 * Math.sin(Math.PI * sw)];
    phoneGlyph(g, ph[0], ph[1], 110, a, sm(remap(sw, 0.85, 1))); bookGlyph(g, bk[0], bk[1], 110, a);
    if (lb > 0) { g.globalAlpha = a * lb; g.fillStyle = '#7A55C8'; g.font = `500 56px ${UI}`; g.textAlign = 'center'; g.fillText('easy', 425, 500); g.fillStyle = '#8E86AE'; g.fillText('harder', 1000, 820); g.textAlign = 'left'; }
    g.globalAlpha = 1;
  }
  tex.needsUpdate = true;
}

// ---------------------------------------------------------------- choreography: seated on the bed edge (S1-S3, S5), standing at the desk (S4)
const SEATB = V(BED.x + BED.w / 2 - 0.06, 0.585, -0.42), STANDD = V(-0.25, 0.9, 0.5);
const atDesk = t => t >= S.s4 && t < S.s5;
function pose(t) {
  const P = {};
  P.breath = Math.sin(t * 2 * Math.PI / 4.2);
  P.desk = atDesk(t);
  P.yaw = P.desk ? 0 : -Math.PI / 2;
  if (P.desk) {
    P.lean = track(t, [[S.s4, 0.08], [T.placeA, 0.08], [T.placeA + 0.4, 0.42], [T.placeB, 0.42], [T.placeB + 0.4, 0.12], [T.bookA, 0.12], [T.bookA + 0.3, 0.4], [T.bookA + 0.45, 0.4], [T.bookB, 0.1]]);
    P.headPitch = track(t, [[S.s4, -0.2], [T.placeA, -0.3], [T.placeA + 0.4, -0.55], [T.placeB + 0.3, -0.55], [T.bookA, -0.4], [T.bookB, -0.35]]);
    P.headYaw = track(t, [[S.s4, 0.15], [T.placeB, 0.15], [T.bookA, -0.15], [T.bookB, -0.05]]);
  } else {
    P.lean = track(t, [[0, 0.12], [T.reachA, 0.12], [T.reachB, 0.3], [T.pickB, 0.16], [S.s4, 0.16], [S.s5, 0.18], [T.putA, 0.18], [T.putA + 0.35, 0.32], [T.putB, 0.32], [T.putB + 0.4, 0.12], [T.liftA, 0.12], [T.liftA + 0.3, 0.3], [T.liftB, 0.14], [30, 0.14]]);
    P.headPitch = track(t, [[0, -0.25], [T.reachA, -0.3], [T.reachB, -0.45], [T.pickB, -0.6], [S.s4, -0.6], [S.s5, -0.35], [T.putA + 0.3, -0.55], [T.putB + 0.3, -0.4], [T.easy, -0.4], [T.liftB, -0.6], [30, -0.62]]);
    P.headYaw = track(t, [[0, -0.15], [T.reachA, -0.35], [T.reachB, -0.4], [T.pickB, 0.0], [S.s4, 0.0], [S.s5, -0.3], [T.putB, -0.4], [T.putB + 0.5, -0.1], [T.liftA, -0.3], [T.liftB, 0], [30, 0]]);
  }
  return P;
}
function basisFacing(pos, target, lat) {   // object basis: local +y faces target, local +x along lat
  const y = target.clone().sub(pos).normalize(); const x = lat.clone().sub(y.clone().multiplyScalar(lat.dot(y))).normalize(); const z = x.clone().cross(y);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}
const FLAT = q => q.set(0, 0, 0, 1);
let phonePose = null, bookPose = null;
function placeFigure(t, P) {
  const br = P.breath;
  const pel = (P.desk ? STANDD : SEATB).clone();
  torso.position.copy(pel);
  torso.rotation.set(-P.lean, P.yaw + P.headYaw * 0.15, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + P.lean * 0.45, P.headYaw, 0, 'YXZ');
  torso.updateMatrixWorld(true);
  const fwd = V(-Math.sin(P.yaw), 0, -Math.cos(P.yaw)), lat = V(Math.cos(P.yaw), 0, -Math.sin(P.yaw)), upv = V(0, 1, 0);
  const base = V(pel.x, 0, pel.z);
  const shL = torso.localToWorld(V(-0.15, 0.315, 0.0)), shR = torso.localToWorld(V(0.15, 0.315, 0.0));
  // legs: seated on the bed edge (feet forward on the floor) or standing at the desk
  const ankles = [-1, 1].map(sx => P.desk ? base.clone().add(lat.clone().multiplyScalar(sx * 0.09)).add(V(0, 0.075, 0))
    : base.clone().add(fwd.clone().multiplyScalar(0.42)).add(lat.clone().multiplyScalar(sx * 0.11 + 0.04)).add(V(0, 0.075, 0)));
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    const hip = torso.localToWorld(V(sx * 0.085, 0.02, 0.0)); hip.y = Math.max(hip.y, 0.55);
    const pole = fwd.clone().multiplyScalar(0.8).add(upv.clone().multiplyScalar(P.desk ? 0.25 : 1)).add(lat.clone().multiplyScalar(sx * 0.15));
    const r = ik(hip, ankles[i], 0.4, 0.43, pole);
    const [th, sh, hi, kn, an] = i === 0 ? [limbs.thL, limbs.shL, J.hiL, J.knL, J.anL] : [limbs.thR, limbs.shR, J.hiR, J.knR, J.anR];
    hi.position.copy(hip); kn.position.copy(r.mid); an.position.copy(r.end);
    setLimb(th, hip, r.mid); setLimb(sh, r.mid, r.end);
    feet[i].position.copy(r.end).add(fwd.clone().multiplyScalar(0.045)); feet[i].position.y = r.end.y - 0.047; feet[i].rotation.set(0, P.yaw + sx * -0.08, 0);
    footBlobs[i].position.set(feet[i].position.x, 0.013, feet[i].position.z); footBlobs[i].material.opacity = 0.6;
  }
  // hands and the two held objects
  const headP = head.getWorldPosition(V(0, 0, 0));
  const at = (f, l, u) => pel.clone().add(fwd.clone().multiplyScalar(f)).add(lat.clone().multiplyScalar(l)).add(V(0, u, 0));
  let hL, hR; const qP = new THREE.Quaternion(), qB = new THREE.Quaternion();
  let pPos, bPos, bOpen = 0;
  if (!P.desk) {
    const restL = at(0.3, -0.13, 0.06), restR = at(0.3, 0.13, 0.06);
    const hold = at(0.31, 0.0, 0.3 + 0.004 * Math.sin(t * 5)), holdL = hold.clone().add(lat.clone().multiplyScalar(-0.05)).add(V(0, -0.02, 0)), holdR = hold.clone().add(lat.clone().multiplyScalar(0.05)).add(V(0, -0.02, 0));
    if (t < S.s4) {
      const r1 = sm(remap(t, T.reachA, T.reachB)), r2 = eio(remap(t, T.reachB, T.pickB)), r3 = sm(remap(t, T.reachB + 0.15, T.pickB));
      hL = vl(vl(restL, PHONE_SPOT.clone().add(V(-0.03, 0.03, 0)), r1), holdL, r2);
      const thumb = 0.012 * Math.max(0, Math.sin(t * 7)) * sm(remap(t, T.pickB, T.pickB + 0.3));
      hR = vl(restR, holdR.clone().add(fwd.clone().multiplyScalar(thumb)), r3);
      pPos = vl(PHONE_SPOT, hold, r2); qP.slerpQuaternions(FLAT(new THREE.Quaternion()), basisFacing(hold, headP, lat), r2);
      bPos = BOOK_DESK.clone(); FLAT(qB);
    } else {   // S5: the book goes where the phone was, then up to read
      const p1 = eio(remap(t, T.putA, T.putB)), back = sm(remap(t, T.putB, T.putB + 0.45)), l1 = eio(remap(t, T.liftA, T.liftB));
      const carryL = at(0.26, -0.12, 0.26), spot = BOOK_SPOT.clone().add(V(0, BK.h / 2, 0));
      const read = at(0.3, 0.0, 0.36);
      bPos = l1 > 0 ? vl(spot, read, l1) : vl(carryL.clone().add(V(0, 0.03, 0)), spot, p1);
      const qCarry = basisFacing(carryL, headP, lat), qRead = basisFacing(read, headP, lat);
      if (l1 > 0) qB.slerpQuaternions(FLAT(new THREE.Quaternion()), qRead, l1); else qB.slerpQuaternions(qCarry, FLAT(new THREE.Quaternion()), p1);
      hL = l1 > 0 ? vl(vl(restL, spot.clone().add(lat.clone().multiplyScalar(-0.07)), sm(remap(t, T.liftA - 0.4, T.liftA))), read.clone().add(lat.clone().multiplyScalar(-0.075)), l1)
        : vl(vl(carryL, spot.clone().add(V(-0.02, 0.02, 0)), p1), restL, back);
      hR = l1 > 0 ? vl(vl(restR, spot.clone().add(lat.clone().multiplyScalar(0.07)), sm(remap(t, T.liftA - 0.3, T.liftA))), read.clone().add(lat.clone().multiplyScalar(0.075)), l1) : restR;
      pPos = PAD.clone().add(V(0, 0.011, 0)); FLAT(qP);
      bOpen = eio(remap(t, T.openA, T.openB));
    }
  } else {   // S4: phone onto the pad, then pick up the book
    const hang = sx => at(0.12, sx * 0.2, -0.05);
    const p1 = eio(remap(t, T.placeA, T.placeB)), back = sm(remap(t, T.placeB + 0.05, T.placeB + 0.5));
    const carryR = at(0.24, 0.17, 0.12), padTop = PAD.clone().add(V(0, 0.011, 0));
    hR = vl(vl(carryR, padTop.clone().add(V(0, 0.02, 0)), p1), hang(1), back);
    pPos = vl(carryR.clone().add(V(0, 0.01, 0)), padTop, p1); qP.slerpQuaternions(basisFacing(carryR, headP, lat), FLAT(new THREE.Quaternion()), p1);
    const b1 = sm(remap(t, T.bookA, T.bookA + 0.35)), b2 = eio(remap(t, T.bookA + 0.35, T.bookB));
    const carryL = at(0.24, -0.15, 0.14);
    hL = vl(vl(hang(-1), BOOK_DESK.clone().add(V(0.0, 0.03, 0)), b1), carryL, b2);
    bPos = vl(BOOK_DESK, carryL.clone().add(V(0, 0.03, 0)), b2); qB.slerpQuaternions(FLAT(new THREE.Quaternion()), basisFacing(carryL, headP, lat), b2);
  }
  phone.position.copy(pPos); phone.quaternion.copy(qP);
  book.position.copy(bPos); book.quaternion.copy(qB); bookCover.rotation.z = Math.PI * 0.97 * bOpen;
  const onSurf = (p, y) => Math.abs(p.y - y) < 0.03;
  phoneBlob.position.set(pPos.x, (pPos.y < 0.65 ? NIGHT.y : DESK_Y) + 0.002, pPos.z); phoneBlob.material.opacity = (onSurf(pPos, PHONE_SPOT.y) || onSurf(pPos, PAD.y + 0.011)) ? 0.35 : 0;
  bookBlob.position.set(bPos.x, (bPos.y < 0.65 ? NIGHT.y : DESK_Y) + 0.002, bPos.z); bookBlob.material.opacity = (onSurf(bPos, BOOK_DESK.y) || onSurf(bPos, BOOK_SPOT.y + BK.h / 2)) ? 0.45 : 0;
  const pole = sx => (P.desk ? lat.clone().multiplyScalar(sx * 0.7).add(V(0, -0.5, 0)) : lat.clone().multiplyScalar(sx * 0.8).add(V(0, -0.6, 0)).sub(fwd.clone().multiplyScalar(0.2)));
  const aL = ik(shL, hL, 0.25, 0.235, pole(-1)), aR = ik(shR, hR, 0.25, 0.235, pole(1));
  J.shL.position.copy(shL); J.shR.position.copy(shR); J.elL.position.copy(aL.mid); J.elR.position.copy(aR.mid);
  J.haL.position.copy(aL.end); J.haR.position.copy(aR.end);
  setLimb(limbs.uaL, shL, aL.mid); setLimb(limbs.faL, aL.mid, aL.end); setLimb(limbs.uaR, shR, aR.mid); setLimb(limbs.faR, aR.mid, aR.end);
  J.haL.lookAt(aL.mid); J.haR.lookAt(aR.mid);
}
function setProps(t) {
  notebook.visible = false; nbBlob.material.opacity = 0; ink.forEach(ln => { ln.visible = false; });
  pencil.position.set(-0.32, DESK_Y + 0.006, 0.2); pencil.rotation.set(Math.PI / 2, 0, 1.2);
}
function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  // phone screen
  drawScreen(t < T.pickB ? 'notif' : t < S.s4 || (t < T.placeB) ? 'feed' : 'charge', t);
  padRing.material.opacity = t >= T.charge ? 0.5 + 0.35 * Math.sin((t - T.charge) * 3) : 0;
  // notification chips (S1, before the phone is picked up)
  for (const c of chips) {
    const u = (t - c.userData.t0) / 1.2, live = t < T.reachB + 0.2 && u >= 0 && u <= 1;
    c.visible = live; if (!live) continue;
    c.position.copy(PHONE_SPOT).add(V(c.userData.sx * 1.5, 0.06 + 0.34 * eout(u), 0)); c.quaternion.copy(camera.quaternion);
    const a = Math.min(sm(u / 0.15), 1 - sm((u - 0.6) / 0.4)); c.userData.mats.forEach(m => { m.opacity = a; }); c.scale.setScalar(1.5 * lerp(0.7, 1, sm(u / 0.2)));
  }
  // the card (S2-S3)
  const v = sm(remap(t, S.s2 - 0.05, S.s2 + 0.25)) * (1 - sm(remap(t, S.s4 - 0.3, S.s4 - 0.02)));
  card.visible = v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0); card.scale.setScalar(1.0);
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v * 0.95; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
  // outline where the phone was (S5) -- fades as the book lands in it
  outline.visible = t >= S.s5 && t < T.putB + 0.3; outline.material.opacity = 1 - sm(remap(t, T.putB - 0.1, T.putB + 0.3));
  // labels
  const lab = (L, a, pos, s) => { L.visible = a > 0.003; if (!L.visible) return; L.position.copy(pos); L.quaternion.copy(camera.quaternion); L.scale.setScalar(s * lerp(0.75, 1, a)); L.userData.body.material.opacity = a; L.userData.txt.material.opacity = a; };
  lab(bookLab, sm(remap(t, T.bookPill, T.bookPill + 0.3)) * (1 - sm(remap(t, S.s2 - 0.25, S.s2 - 0.02))), BOOK_DESK.clone().add(V(-0.03, 0.3, -0.15)), 1.15);
  lab(padLab, sm(remap(t, T.charge + 0.2, T.charge + 0.5)) * (1 - sm(remap(t, T.bookA - 0.2, T.bookA + 0.1))), PAD.clone().add(V(0.0, 0.2, 0.0)), 1.0);
  lab(easyLab, sm(remap(t, T.easy, T.easy + 0.3)) * (1 - sm(remap(t, T.liftA - 0.3, T.liftA))), BOOK_SPOT.clone().add(V(0.02, 0.2, 0.1)), 0.9);
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 close on the nightstand from the room side: the phone lights up within reach; on "your book isn't" the camera
  // pulls back to the desk across the room, where the book waits
  { a: S.s1, b: S.s2, m: [hookSplit - 0.35, S.s2 - 0.1], ease: 'sine', k0: [V(-1.35, 1.02, -0.55), 66, 16, 3.0, 30], k1: [V(-0.95, 1.1, -0.3), 68, 30, 3.9, 30] },
  // S2 front-right: the study card above the bed, the performer scrolling below it
  { a: S.s2, b: S.s3, k0: [V(-2.32, 1.6, -0.46), 74, 5, 3.5, 30], k1: [V(-2.32, 1.6, -0.46), 68, 5, 3.35, 30] },
  // S3 front-left, higher: what changed, then friction
  { a: S.s3, b: S.s4, k0: [V(-2.33, 1.6, -0.56), 108, 11, 3.45, 30], k1: [V(-2.33, 1.6, -0.56), 114, 11, 3.3, 30] },
  // S4 the desk across the room: the phone goes on the charger, the book comes off the desk
  { a: S.s4, b: S.s5, k0: [V(-0.2, 1.35, 0.3), 70, 18, 3.6, 30], k1: [V(-0.22, 1.35, 0.3), 62, 17, 3.45, 30] },
  // S5 the nightstand (same framing as the opening, now with the book), then pull back: reading on the bed, the phone
  // charging on the desk in the foreground
  { a: S.s5, b: S.end, m: [T.liftA - 0.2, 27.0], ease: 'sine', k0: [V(-1.35, 1.02, -0.55), 66, 16, 3.0, 30], k1: [V(-0.95, 1.28, -0.25), 60, 18, 5.2, 30],
    k2: [V(-0.97, 1.27, -0.27), 63, 17, 4.85, 30] },   // a slow drift under the lock-up so the last seconds keep moving
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
  // crucial in-scene text: the card and the three labels, each audited by its own oriented box
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const keep = b => (onScreen(b) ? b : null);
  const crucial = { card: card.visible ? keep(textBox(card)) : null };
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


// ---------------------------------------------------------------- captions (accepted English treatment: Instrument Serif, lavender highlight)
const hl = s => `<span class="hl">${s}</span>`;
const sg = (html, t = null) => ({ html, t });
const C2 = 96, C1 = 108;
const W_MEANT = 6.82, W_PUT = 19.9;
const CAPS = [
  { a: -1, b: hookSplit - 0.12, size: C2, lines: [[sg(`Your phone is ${hl('within reach')}`)], [sg('all night.', 1.5)]] },
  { a: hookSplit - 0.06, b: TL.study.start - 0.12, size: C1, lines: [[sg(`Your book ${hl('isn’t')}.`)]] },
  { a: TL.study.start - 0.06, b: studySplit - 0.12, size: C1, lines: [[sg('In one study,')]] },
  { a: studySplit - 0.06, b: W_MEANT - 0.12, size: C2, lines: [[sg(`moving snacks ${hl('half a metre')}`)], [sg('farther away', 6.12)]] },
  { a: W_MEANT - 0.06, b: TL.mech.start - 0.12, size: C2, lines: [[sg(`meant ${hl('fewer people ate any')}.`)]] },
  { a: TL.mech.start - 0.06, b: mechSplit - 0.12, size: C2, lines: [[sg(`They weren’t ${hl('less noticeable')};`)]] },
  { a: mechSplit - 0.06, b: TL.name.start - 0.12, size: C2, lines: [[sg('reaching just felt')], [sg(`like ${hl('more effort')}.`, 11.4)]] },
  { a: TL.name.start - 0.06, b: nameSplit - 0.12, size: C1, lines: [[sg(`That’s ${hl('friction')}.`)]] },
  { a: nameSplit - 0.06, b: TL.tip.start - 0.12, size: C2, lines: [[sg('It won’t break a habit alone,')], [sg(`but it ${hl('changes what’s easy')}.`, 15.42)]] },
  { a: TL.tip.start - 0.06, b: W_PUT - 0.12, size: C2, lines: [[sg(`Tonight, ${hl('charge your phone')}`)], [sg(`${hl('across the room')},`, 18.68)]] },
  { a: W_PUT - 0.06, b: TL.close.start - 0.12, size: C2, lines: [[sg(`and ${hl('put a book')}`)], [sg('where it used to be.', 20.38)]] },
  { a: TL.close.start - 0.06, b: closeSplit - 0.12, size: C2, lines: [[sg(`Now the ${hl('easy reach')}`)], [sg('is the book,', 23.1)]] },
  { a: closeSplit - 0.06, b: TL.cta.start - 0.2, size: C1, lines: [[sg('not the scroll.')]] },
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
cardTx.key = ''; scr.key = '';
// redraw the label textures now that the fonts are present
for (const lab of LABELS) { const { canvas: c, g: ctx } = lab.userData.tx; ctx.clearRect(0, 0, c.width, c.height); let s = 170; ctx.font = `400 ${s}px ${SERIF}`;
  while (ctx.measureText(lab.userData.label).width > c.width - 60) { s -= 4; ctx.font = `400 ${s}px ${SERIF}`; }
  ctx.fillStyle = '#17122E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab.userData.label, c.width / 2, c.height * 0.54); lab.userData.tx.tex.needsUpdate = true; }
renderAt(0);
window.ready = true;
