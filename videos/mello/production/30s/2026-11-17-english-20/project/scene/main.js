// Mello 30 s english20-01 (English): "does naming a feeling help?" (affect labeling: Lieberman, Inagaki, Tabibnia & Crockett
// 2011, Emotion; Lieberman et al. 2007, Psychological Science). Topic as requested; it is not the same subject as feedback-01's
// cognitive defusion of a *thought* (context/11): this is putting a *feeling* into words (context/30). Rules retained: the
// 2026-11-11 story/caption/palette rules (context/10 section 8), the first-frame rule (section 9), the store-sampled palette
// (context/22) and a soothing original bed under the voice (the live feedback, again: published app colours + soothing audio).
// Room, rig, camera helper, caption mechanics, dark in-app card and the oriented-box audit are carried over from
// ../../2026-11-17-english-19/project. New: a tense message on a giant phone screen, a spiky storm (the unnamed feeling) that
// softens when it is named, a ghost "worse?" storm, two evidence cards (direction only) and a stylised brain whose amygdala glow dims.
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
// "naming a feeling" 0.33, "expect it to make things worse" 2.44, "putting feelings into words" 5.51, "upsetting images" 7.71,
// "lowered reported distress" 8.71, "about as well as" 11.36, "reframing" 12.20, "distraction" 13.04, "less amygdala activity" 15.54,
// "tense message lands" 18.60, "pause" 19.78, "name it" 20.30, "I feel anxious" 21.00, "the feeling stays" 22.90, "a little softer" 24.32
const S = { s1: 0.0, s2: 1.7, s3: 4.4, s4: 10.75, s5: 14.4, s6: 17.85, s7: 22.6, end: 30.0 };
const T = {
  ghostA: 2.4, ghostB: 3.8,                                 // S2: a ghost storm swells: "worse?"
  img: 5.0, tagImg: 5.7, down: 8.8,                         // S3: an upsetting image, a word tag on it, distress arrow goes down
  col1: 11.2, col2: 12.25, col3: 13.1,                      // S4: naming / reframing / distraction, similar drops
  brainTag: 15.0, dim: 15.6, dimB: 16.6,                    // S5: the label appears, the amygdala glow dims
  lower: 19.85, nameA: 20.45, tagA: 21.05, tagB: 21.6,      // S6: he lowers the phone, names it: "I feel anxious"
  softA: 21.3, softB: 25.0,                                 // the storm softens (stays, smaller, lighter)
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






// ---------------------------------------------------------------- episode props: store palette, the phone, the storm, the cards, the brain
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

function makeLabel(text, w = 0.2, col = PAL.lilac) {
  const lab = new THREE.Group();
  const lb = mesh(new RoundedBoxGeometry(w, 0.08, 0.016, 3, 0.016), new THREE.MeshBasicMaterial({ color: col, transparent: true, toneMapped: false }), false, false); lab.add(lb);
  const ltx = textTexture(text, { font: SERIF, w: Math.round(3200 * w), h: 256, size: 170, color: INK, pad: 24 });
  const lp = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.01, 0.076), new THREE.MeshBasicMaterial({ map: ltx.tex, transparent: true, depthWrite: false, toneMapped: false }));
  lp.position.z = 0.0085; lp.renderOrder = 6; lab.add(lp); lab.userData = { body: lb, txt: lp, tx: ltx, label: text }; scene.add(lab); return lab;
}

// ---- the room: hide the desk set; keep the plant
for (const o of [deskTop, mug, lamp, lampLight, pencil, seat, ped, base, notebook]) o.visible = false;
for (const o of scene.children) if (o.isMesh && o.geometry && o.geometry.type === 'CylinderGeometry' && o.material === M.leg) o.visible = false;
for (const o of scene.children) if (o.isMesh && o.material && o.material.map === blobTex && o !== footBlobs[0] && o !== footBlobs[1]) o.visible = false;
plant.position.set(-1.3, 0, -1.5); blob(0.6, 0.6, 0.5).position.set(-1.3, 0.002, -1.5);

// ---- the giant message screen (a phone, scaled up) and the phone in his hand
const MSG_POS = V(0.3, 1.72, 0.25);
const msg = makeCard(0.36, 0.44, '#FFFDF7', PAL.lilac); const msgTx = cardCanvas(msg, 0.34, 0.42, 680, 840);
function drawMsg() { const { c, g, t } = msgTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle'; g.textAlign = 'center';
  rr(g, 280, 40, 120, 120, 60, '#DCD3F2'); g.fillStyle = PAL.deep; g.font = `600 60px ${UI}`; g.fillText('S', 340, 104);
  g.fillStyle = '#8E86AE'; g.font = `600 44px ${UI}`; g.fillText('9:41 PM', 340, 210);
  rr(g, 30, 290, 620, 360, 70, '#ECE7F7'); g.textAlign = 'left'; g.fillStyle = INK; g.font = `400 150px ${SERIF}`; g.fillText('We need', 80, 395); g.fillText('to talk.', 80, 545);
  g.fillStyle = '#8E86AE'; g.font = `500 40px ${UI}`; g.fillText('Read', 50, 720);
  t.needsUpdate = true; }
drawMsg();
const phone = new THREE.Group(); scene.add(phone);
{ const b = mesh(new RoundedBoxGeometry(0.075, 0.15, 0.01, 2, 0.008), std('#2A2160', 0.4)); phone.add(b);
  const scr = mesh(new THREE.PlaneGeometry(0.064, 0.134), new THREE.MeshBasicMaterial({ color: '#F4F0FF', toneMapped: false })); scr.position.z = 0.0055; phone.add(scr); }

// ---- the feeling: a spiky storm that softens when it is named (it stays, smaller and lighter)
const SPIKES = []; { let sd = 5; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let i = 0; i < 16; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, q = Math.sqrt(1 - u * u); SPIKES.push(V(q * Math.cos(a), u, q * Math.sin(a))); } }
const stormGeo = new THREE.IcosahedronGeometry(1, 4); const stormBase = stormGeo.attributes.position.array.slice();
const M_STORM = std('#3B2F6E', 0.55, { emissive: new THREE.Color('#2A1F66'), emissiveIntensity: 0.35, flatShading: true });
const storm = new THREE.Mesh(stormGeo, M_STORM); storm.castShadow = true; scene.add(storm);
const ghost = new THREE.Mesh(stormGeo, new THREE.MeshBasicMaterial({ color: '#8270C4', transparent: true, opacity: 0.0, depthWrite: false, toneMapped: false })); ghost.renderOrder = 2; scene.add(ghost);
let stormKey = '';
function shapeStorm(spike, t) { const key = spike.toFixed(3) + '|' + (Math.floor(t * 30)); if (key === stormKey) return; stormKey = key;
  const p = stormGeo.attributes.position, v = V(0, 0, 0);
  for (let i = 0; i < p.count; i++) { v.set(stormBase[i * 3], stormBase[i * 3 + 1], stormBase[i * 3 + 2]).normalize();
    let s = 0; for (let k = 0; k < SPIKES.length; k++) { const d = Math.max(0, v.dot(SPIKES[k])); s += Math.pow(d, 26) * (0.85 + 0.15 * Math.sin(t * 5 + k)); }
    const wob = 0.04 * Math.sin(5 * v.x + t * 1.7) * Math.sin(4 * v.y + t * 1.3);
    const R = 1 + spike * Math.min(1.1, s) + wob; p.setXYZ(i, v.x * R, v.y * R, v.z * R); }
  p.needsUpdate = true; stormGeo.computeVertexNormals(); }
const STORM_AT = V(-0.1, 1.99, -0.05);
const nameTag = makeLabel('I feel anxious', 0.42, PAL.gold), worseTag = makeLabel('worse?', 0.24, PAL.lilac);
const LABELS = [nameTag, worseTag];

// ---- S3-S4: the dark in-app card (Lieberman et al. 2011: direction only, no invented values)
const CARD_POS = V(0.1, 1.55, 0.25);
const card = makeCard(0.7, 0.62); const cardTx = cardCanvas(card, 0.68, 0.605, 1220, 1086);
function arrowDown(g, x, y, h, w, col, a) { g.globalAlpha = a; g.fillStyle = col; g.fillRect(x - w * 0.18, y, w * 0.36, h * 0.62); g.beginPath(); g.moveTo(x - w / 2, y + h * 0.58); g.lineTo(x + w / 2, y + h * 0.58); g.lineTo(x, y + h); g.closePath(); g.fill(); }
function frameIcon(g, x, y, w, h, a) { g.globalAlpha = a; rr(g, x, y, w, h, 18, '#1B1640', '#8E86AE', 6); g.fillStyle = '#5B45A3';
  g.beginPath(); g.moveTo(x + 20, y + h - 20); g.lineTo(x + w * 0.4, y + h * 0.42); g.lineTo(x + w * 0.62, y + h * 0.66); g.lineTo(x + w * 0.78, y + h * 0.5); g.lineTo(x + w - 20, y + h - 20); g.closePath(); g.fill();
  g.fillStyle = '#8E86AE'; g.beginPath(); g.arc(x + w * 0.76, y + h * 0.28, 22, 0, 7); g.fill(); }
function drawCard(t) {
  const m = sm(remap(t, S.s3 - 0.05, S.s3 + 0.3)), im = sm(remap(t, T.img - 0.1, T.img + 0.35)), tg = sm(remap(t, T.tagImg - 0.1, T.tagImg + 0.3)), dn = eio(remap(t, T.down - 0.1, T.down + 0.8));
  const c1 = eio(remap(t, T.col1 - 0.1, T.col1 + 0.6)), c2 = eio(remap(t, T.col2 - 0.1, T.col2 + 0.6)), c3 = eio(remap(t, T.col3 - 0.1, T.col3 + 0.6)), cmp = t >= S.s4;
  const key = [m, im, tg, dn, c1, c2, c3, cmp ? 1 : 0].map(x => (+x).toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle'; g.textAlign = 'left';
  g.globalAlpha = m; g.fillStyle = '#B9A4FF'; g.font = `600 52px ${UI}`; g.fillText(cmp ? 'SIMILAR DROPS IN DISTRESS' : 'IN THE STUDIES', 60, 86);
  g.fillStyle = '#8E86AE'; g.font = `500 44px ${UI}`; g.fillText(cmp ? 'self-reported, compared in the same studies' : 'upsetting images, self-reported distress', 60, 148);
  if (!cmp) {
    frameIcon(g, 70, 260, 520, 380, m * im);
    if (tg > 0) { g.globalAlpha = m * tg; rr(g, 150, 590, 360, 110, 55, PAL.gold); g.fillStyle = INK; g.font = `400 80px ${SERIF}`; g.textAlign = 'center'; g.fillText('“angry”', 330, 648); g.textAlign = 'left'; }
    if (dn > 0) { g.globalAlpha = m * Math.min(1, dn * 2); g.fillStyle = '#FFFFFF'; g.font = `400 92px ${SERIF}`; g.textAlign = 'center'; g.fillText('distress', 900, 300); arrowDown(g, 900, 360, 420 * dn, 220, PAL.gold, m * Math.min(1, dn * 2)); g.textAlign = 'left'; }
  } else {
    const cols = [[220, 'naming', c1, PAL.gold], [610, 'reframing', c2, '#B9A4FF'], [1000, 'distraction', c3, '#B9A4FF']];
    cols.forEach(([x, lab, a, col]) => { if (a <= 0) return; g.globalAlpha = m * Math.min(1, a * 2); g.fillStyle = '#FFFFFF'; g.font = `400 88px ${SERIF}`; g.textAlign = 'center'; g.fillText(lab, x, 330);
      arrowDown(g, x, 420, 420 * a, 200, col, m * Math.min(1, a * 2)); });
    g.textAlign = 'left';
  }
  g.globalAlpha = 1; tex.needsUpdate = true;
}

// ---- S5: a stylised brain (two translucent halves) with an amygdala glow that dims when the feeling is named
const brain = new THREE.Group(); brain.position.set(0.0, 1.55, 0.2); scene.add(brain);
const M_BRAIN = new THREE.MeshStandardMaterial({ color: '#C7B8F5', roughness: 0.5, transparent: true, opacity: 0.55, depthWrite: false });
for (const sx of [-1, 1]) { const h = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), M_BRAIN); h.scale.set(0.2, 0.22, 0.3); h.position.set(sx * 0.105, 0, 0); h.renderOrder = 3; brain.add(h); }
const M_AMY = std(PAL.gold, 0.3, { emissive: new THREE.Color('#FFB347'), emissiveIntensity: 1.2 });
const amy = mesh(new THREE.SphereGeometry(0.045, 24, 16), M_AMY, false, false); amy.scale.set(0.8, 0.7, 1.2); amy.position.set(0.07, -0.07, 0.04); brain.add(amy);
const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(254,195,87,0.95)'); gr.addColorStop(0.35, 'rgba(254,195,87,0.45)'); gr.addColorStop(1, 'rgba(254,195,87,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, depthTest: false, toneMapped: false })); glow.scale.set(0.34, 0.34, 1); glow.position.copy(amy.position); glow.renderOrder = 8; brain.add(glow);
const amyLab = makeLabel('amygdala', 0.26, PAL.lilac), brainTag = makeLabel('“anxious”', 0.26, PAL.gold); LABELS.push(amyLab, brainTag);

// ---- the performer: the approved rig, standing with the phone
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
const ME = V(-0.12, 0.9, 0.0), YAW_ME = Math.PI - 0.25;   // facing the camera side, turned a little toward the message
const figRef = {};
function pose(t) { return { br: Math.sin(t * 2 * Math.PI / (t > T.softA ? 4.8 : 3.4)) }; }
function placeFigure(t, P) {
  const lower = sm(remap(t, T.lower, T.lower + 0.6)), name = sm(remap(t, T.nameA, T.nameA + 0.5)), soft = sm(remap(t, T.softA, T.softB));
  const fwd = V(-Math.sin(YAW_ME), 0, -Math.cos(YAW_ME)), lat = V(Math.cos(YAW_ME), 0, -Math.sin(YAW_ME));
  const chest = ME.clone().add(V(0, 0.3, 0));
  const holdUp = chest.clone().add(fwd.clone().multiplyScalar(0.24)).add(lat.clone().multiplyScalar(0.08)).add(V(0, 0.06, 0));
  const holdDown = chest.clone().add(fwd.clone().multiplyScalar(0.12)).add(lat.clone().multiplyScalar(0.16)).add(V(0, -0.3, 0));
  const hR = vl(holdUp, holdDown, lower);
  const hL = name > 0 ? vl(chest.clone().add(V(0, -0.42, 0)).add(lat.clone().multiplyScalar(-0.2)), chest.clone().add(fwd.clone().multiplyScalar(0.12)).add(lat.clone().multiplyScalar(-0.04)).add(V(0, 0.04, 0)), name * (1 - 0.0 * soft)) : null;   // hand to chest as he names it
  const tense = 1 - soft;
  const p = poseStanding(R_ME, { pel: ME.clone().add(V(0, -0.005 * tense, 0)), yaw: YAW_ME + 0.03 * Math.sin(t * 0.8), lean: 0.06 + 0.04 * tense - 0.03 * lower,
    headPitch: lerp(-0.42, 0.0, lower) + 0.02 * Math.sin(t * 1.9) * tense, headYaw: 0.06 * Math.sin(t * 0.7), hL, hR, br: P.br * (1 + 0.5 * tense), gy: 0 });
  phone.position.copy(p.handR).add(V(0, 0.05, 0)); phone.lookAt(p.headP); figRef.headP = p.headP;
}
function setProps(t) { nbBlob.material.opacity = 0; ink.forEach(ln => { ln.visible = false; }); }
function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  const sceneShot = t < S.s3 || t >= S.s6, brainShot = t >= S.s5 && t < S.s6, cardShot = t >= S.s3 && t < S.s5;
  // performer, message, storm only in the scene shots
  fig.visible = sceneShot; footBlobs.forEach(b => { b.visible = sceneShot; }); phone.visible = sceneShot;
  msg.visible = sceneShot; msg.position.copy(MSG_POS); msg.rotation.set(0, camYaw(MSG_POS) * 0.6 - 0.25, 0);
  msg.userData.border.material.opacity = 1; msg.userData.panel.material.opacity = 1; msgTx.m.material.opacity = 1;
  const soft = sm(remap(t, T.softA, T.softB));
  storm.visible = sceneShot; ghost.visible = false;
  if (sceneShot) { const sc = lerp(0.165, 0.115, soft) * (1 + 0.04 * Math.sin(t * 6.3) * (1 - soft) + 0.02 * Math.sin(t * 1.4)); shapeStorm(lerp(0.85, 0.12, soft), t);
    storm.position.copy(STORM_AT).add(V(0.03 * Math.sin(t * 1.1), 0.03 * Math.sin(t * 0.9) - 0.08 * soft, 0)); storm.scale.setScalar(sc); storm.rotation.set(t * 0.25, t * 0.4, 0);
    M_STORM.color.set('#3B2F6E').lerp(new THREE.Color('#B9A4FF'), soft); M_STORM.emissive.set('#2A1F66').lerp(new THREE.Color('#6E5BC4'), soft);
    if (t >= S.s2 && t < S.s3) { const gA = sm(remap(t, T.ghostA, T.ghostB)); ghost.visible = gA > 0.01; ghost.position.copy(storm.position); ghost.rotation.copy(storm.rotation); ghost.scale.setScalar(sc * lerp(1.0, 1.35, gA)); ghost.material.opacity = 0.3 * gA; } }
  const lab = (L, a, pos, s) => { L.visible = a > 0.003; if (!L.visible) return; L.position.copy(pos); L.quaternion.copy(camera.quaternion); L.scale.setScalar(s * lerp(0.75, 1, a)); L.userData.body.material.opacity = a; L.userData.txt.material.opacity = a; };
  lab(worseTag, t >= S.s2 && t < S.s3 ? sm(remap(t, T.ghostB - 0.4, T.ghostB)) : 0, STORM_AT.clone().add(V(-0.3, -0.3, 0.12)), 1.1);
  lab(nameTag, t >= S.s6 ? sm(remap(t, T.tagA, T.tagB)) : 0, storm.position.clone().add(V(0.2, -0.22, 0.16)), 1.1);
  // the card (S3-S4)
  const v = sm(remap(t, S.s3 - 0.05, S.s3 + 0.25)) * (1 - sm(remap(t, S.s5 - 0.3, S.s5 - 0.02)));
  card.visible = cardShot && v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0);
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
  // the brain (S5)
  brain.visible = brainShot; brain.rotation.set(0.05, -0.35 + 0.25 * sm(remap(t, S.s5, S.s6)), 0);
  const dim = sm(remap(t, T.dim, T.dimB)), pulse = 1 + 0.08 * Math.sin(t * 7) * (1 - dim);
  M_AMY.emissiveIntensity = lerp(1.2, 0.12, dim); glow.material.opacity = lerp(1, 0.12, dim); glow.scale.setScalar(0.34 * pulse * lerp(1, 0.6, dim));
  brain.updateMatrixWorld(true);
  lab(amyLab, brainShot ? sm(remap(t, S.s5 + 0.2, S.s5 + 0.5)) : 0, brain.position.clone().add(V(0.0, -0.33, 0.12)), 1.0);
  lab(brainTag, brainShot ? sm(remap(t, T.brainTag, T.brainTag + 0.3)) : 0, brain.position.clone().add(V(0.0, 0.34, 0.12)), 1.0);
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
const SHOTS = [
  // S1 frame 0 = the thumbnail: a spiky storm over his head; "We need to talk." on a big phone screen beside him
  { a: S.s1, b: S.s2, k0: [V(0.06, 1.9, 0.0), 8, 4, 3.8, 30], k1: [V(0.06, 1.9, 0.0), 6, 4, 3.68, 30] },
  // S2 closer, from the other side: a ghost storm swells: "worse?"
  { a: S.s2, b: S.s3, k0: [V(0.0, 1.98, -0.05), -14, 3, 3.8, 30], k1: [V(0.0, 1.98, -0.05), -10, 3, 3.65, 30] },
  // S3 the card: an upsetting image, a word on it, distress goes down
  { a: S.s3, b: S.s4, k0: [V(0.14, 1.6, 0.25), 4, 4, 3.4, 30], k1: [V(0.14, 1.6, 0.25), 0, 4, 3.3, 30] },
  // S4 the card from a low angle: naming / reframing / distraction
  { a: S.s4, b: S.s5, k0: [V(0.17, 1.65, 0.25), -28, -5, 3.35, 30], k1: [V(0.17, 1.65, 0.25), -22, -5, 3.3, 30] },
  // S5 the brain: the amygdala glow dims when the feeling is named
  { a: S.s5, b: S.s6, k0: [V(0.0, 1.63, 0.2), 18, 6, 3.3, 30], k1: [V(0.0, 1.63, 0.2), 10, 6, 3.15, 30] },
  // S6 back with him: he lowers the phone and names it
  { a: S.s6, b: S.s7, k0: [V(0.05, 1.95, 0.0), 14, 4, 3.6, 30], k1: [V(0.05, 1.95, 0.0), 9, 4, 3.45, 30] },
  // S7 wider: the feeling stays, smaller and softer; lock-up
  { a: S.s7, b: S.end, m: [S.s7, 27.2], ease: 'sine', k0: [V(0.06, 1.85, 0.0), -6, 5, 4.0, 30], k1: [V(0.06, 1.92, 0.0), -2, 5, 4.4, 30], k2: [V(0.06, 1.92, 0.0), 0, 5, 4.3, 30] },
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
  // crucial in-scene text: the card, the message screen and the labels, each audited by its own oriented box; the performer's head
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const keep = b => (onScreen(b) ? b : null);
  const crucial = { card: card.visible ? keep(textBox(card)) : null, message: msg.visible ? keep(textBox(msg)) : null };
  for (const L of LABELS) crucial[L.userData.label] = L.visible ? keep(textBox(L)) : null;
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
const studyP = PS('study')[1][1], payP = PS('payoff')[1][1];
const CAPS = [
  // frame 0: the curiosity words are the first caption, already fully on screen
  { a: -1, b: TL.expect.start - 0.12, size: C0, lines: [[sg('Does naming')], [sg(`${hl('a feeling help?')}`)]] },
  { a: TL.expect.start - 0.06, b: TL.study.start - 0.12, size: C2, lines: [[sg('Many people expect it')], [sg(`to make things ${hl('worse')}.`, 3.1)]] },
  { a: TL.study.start - 0.06, b: studyP - 0.12, size: C2, lines: [[sg('But in studies, putting')], [sg(`${hl('feelings into words')}`, 5.85)]] },
  { a: studyP - 0.06, b: TL.compare.start - 0.12, size: C2, lines: [[sg('while viewing upsetting images')], [sg(`lowered ${hl('reported distress')}.`, 8.75)]] },
  { a: TL.compare.start - 0.06, b: TL.brain.start - 0.12, size: C2, lines: [[sg('It worked about as well as')], [sg(`${hl('reframing')} or ${hl('distraction')}.`, 12.2)]] },
  { a: TL.brain.start - 0.06, b: TL.payoff.start - 0.12, size: C2, lines: [[sg('Brain scans showed')], [sg(`less ${hl('amygdala activity')}, too.`, 15.5)]] },
  { a: TL.payoff.start - 0.06, b: payP - 0.12, size: C2, lines: [[sg('So when a tense message lands,')], [sg(`${hl('pause')} and name it:`, 19.8)]] },
  { a: payP - 0.06, b: TL.qual.start - 0.12, size: C1, lines: [[sg(`${hl('“I feel anxious.”')}`)]] },
  { a: TL.qual.start - 0.06, b: TL.qual.end + 0.4, size: C2, lines: [[sg('The feeling stays, but often')], [sg(`${hl('a little softer')}.`, 24.3)]] },
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
cardTx.key = ''; drawMsg(); msgTx.key = '';
// redraw the label textures now that the fonts are present
for (const lab of LABELS) { const { canvas: c, g: ctx } = lab.userData.tx; ctx.clearRect(0, 0, c.width, c.height); let s = 170; ctx.font = `400 ${s}px ${SERIF}`;
  while (ctx.measureText(lab.userData.label).width > c.width - 60) { s -= 4; ctx.font = `400 ${s}px ${SERIF}`; }
  ctx.fillStyle = '#191632'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab.userData.label, c.width / 2, c.height * 0.54); lab.userData.tx.tex.needsUpdate = true; }
renderAt(0);
window.ready = true;
