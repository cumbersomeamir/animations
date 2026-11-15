// Mello 30 s english16-01 (English): "why feel small on purpose" (awe walks: Sturm et al. 2022; awe and the small self:
// Piff et al. 2015). The brief's proposed topic (an unfinished task interrupting the evening + a specific plan) was already
// covered by english12-01 (and swapped once before in english14), so a fresh same-genre psychology practice was chosen
// (context/26). Rules retained: 2026-11-11 story/caption/palette rules (context/10 section 8), the first-frame rule
// (section 9), the store-sampled palette (context/22) and a soothing original bed under the voice. The same approved
// faceless performer, rig, camera helper, caption mechanics, dark in-app card and audit are carried over from
// ../../2026-11-15-english-15/project; this episode moves the performer outdoors at dusk (the store's own first screenshot
// is a violet dusk landscape): a vast sky dome, a big moon, a grove of towering trees and a far skyline.
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
// word starts measured with faster-whisper word timestamps on generated/narration.wav (see notes): "small" 0.53,
// "awe" 2.71, "what you feel" 3.31, "vast" 4.33, "night sky" 5.27, "older adults" 7.18, "weekly" 8.22, "fifteen-minute" 8.64, "eight weeks" 9.92,
// "looking for awe" 11.42, "more scenery" 12.98, "less self" 14.07, "bigger smiles" 15.04, "less daily distress" 17.31,
// "next walk" 19.66, "one vast thing" 20.72, "a sky" 21.82, "a tree" 22.66, "a skyline" 23.36, "pause for it" 24.16
const S = { s1: 0.0, s2: 2.25, s3: 6.05, s4: 10.95, s5: 19.15, end: 30.0 };
const T = {
  lookUp: 1.0, older: 7.15, c15: 8.6, cWeekly: 8.2, c8: 9.9,
  ph1: 11.4, ph2: 12.4, ph3: 13.4, ph4: 14.4, smile: 15.0, distress: 16.4, distB: 18.3,
  walkA: 19.4, stop: 24.0, upA: 22.5, upB: 24.1,
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






// ---------------------------------------------------------------- episode props: dusk sky, moon, hill, grove, skyline, cards
// palette sampled 2026-11-11 from the current Play listing (context/22): stage #EDE8FE, ink #191632, violet #633BFE,
// lilac #E6D2FC, deep violet #5B45A3, dark UI #060513, gold #FEC357. The dusk sky runs dark UI -> deep violet -> violet ->
// lilac at the horizon (as in the store's first screenshot); the moon and lit windows use the gold.
const PAL = { bg: '#EDE8FE', ink: '#191632', violet: '#633BFE', lilac: '#E6D2FC', deep: '#5B45A3', dark: '#060513', gold: '#FEC357' };
const INK = PAL.ink, UI = '"Inter", sans-serif', SERIF = '"Instrument Serif", serif';
M.fig.color.set('#8270C4'); M.hair.color.set(PAL.deep);
// outdoors: hide the room (stage, desk, stool, plant, props); keep the performer, its contact shadows and the lights
{ const keep = new Set([fig, ...footBlobs, hemi, key, key.target, fill, front, lampLight, camera]);
  for (const o of [...scene.children]) if (!keep.has(o)) o.visible = false; }
scene.background.set(PAL.dark);
hemi.color.set('#D9CCFF'); hemi.groundColor.set('#3A2E78'); hemi.intensity = 1.5; key.color.set('#FFF1DC'); key.intensity = 1.5; fill.color.set('#B9A4FF'); front.intensity = 0.55;
function rr(g, x, y, w, h, r, fill2, stroke, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill2) { g.fillStyle = fill2; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
// ---- sky dome (gradient), stars, moon
{ const c = document.createElement('canvas'); c.width = 16; c.height = 1024; const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 1024);
  grd.addColorStop(0.0, PAL.dark); grd.addColorStop(0.22, '#140E3C'); grd.addColorStop(0.36, '#2E2270'); grd.addColorStop(0.44, PAL.deep);
  grd.addColorStop(0.485, PAL.violet); grd.addColorStop(0.5, PAL.lilac); grd.addColorStop(1.0, '#2E2270');
  g.fillStyle = grd; g.fillRect(0, 0, 16, 1024);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(60, 48, 32), new THREE.MeshBasicMaterial({ map: tx, side: THREE.BackSide, depthWrite: false, toneMapped: false, fog: false }));
  dome.renderOrder = -10; scene.add(dome); }
const starGroups = [0, 1].map(k => { const n = 260, pos = new Float32Array(n * 3); let s = 7 + k * 13;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < n; i++) { const az = rnd() * Math.PI * 2, el = 0.12 + Math.pow(rnd(), 0.7) * 1.35, r = 55;
    pos.set([Math.cos(el) * Math.sin(az) * r, Math.sin(el) * r, Math.cos(el) * Math.cos(az) * r], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: k ? '#FFF1C9' : '#FFFFFF', size: k ? 3.2 : 2.2, sizeAttenuation: false, transparent: true, depthWrite: false, toneMapped: false }));
  pts.renderOrder = -9; scene.add(pts); return pts; });
const MOON = V(7.0, 10.6, -42);
const moon = new THREE.Mesh(new THREE.CircleGeometry(3.6, 64), new THREE.MeshBasicMaterial({ color: '#FFF0C8', toneMapped: false, depthWrite: false }));
const halo = new THREE.Mesh(new THREE.CircleGeometry(7.6, 64), new THREE.MeshBasicMaterial({ color: PAL.gold, transparent: true, opacity: 0.16, toneMapped: false, depthWrite: false }));
moon.position.copy(MOON); halo.position.copy(MOON).add(V(0, 0, -0.2)); moon.renderOrder = -8; halo.renderOrder = -8.5; scene.add(halo, moon);
// ---- ground: a wide dusk meadow with a gentle hill where he stands (S1-S2)
const M_GROUND = std('#4A3B8C', 0.95), M_HILL = std('#5A49A0', 0.95);
const ground = mesh(new THREE.CircleGeometry(58, 96), M_GROUND, false, true); ground.rotation.x = -Math.PI / 2; scene.add(ground);
const hill = mesh(new THREE.SphereGeometry(6, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), M_HILL, false, true); hill.scale.set(1, 0.08, 1); hill.position.set(0, -0.0, 0); scene.add(hill);
const HILL_Y = 6 * 0.08;   // he stands on the crest
// ---- the grove (S5): towering trees, a pale path, a far skyline with lit windows
const G = V(8, 0, 4);
const M_TRUNK = std('#3B2F6E', 0.9), M_LEAF = std('#3E3384', 0.9, { emissive: new THREE.Color('#2A2160'), emissiveIntensity: 0.25 }), M_LEAF2 = std('#4D3F98', 0.9);
function tree(x, z, h, r) { const g = new THREE.Group(); g.position.set(G.x + x, 0, G.z + z); scene.add(g);
  const tr = mesh(new THREE.CylinderGeometry(r * 0.75, r, h, 16), M_TRUNK); tr.position.y = h / 2; g.add(tr);
  for (const [dx, dy, dz, s, m] of [[0, 0.0, 0, 1.0, M_LEAF], [0.5, -0.5, 0.2, 0.75, M_LEAF2], [-0.45, -0.4, -0.25, 0.8, M_LEAF2], [0.1, 0.6, -0.1, 0.7, M_LEAF]]) {
    const c = mesh(new THREE.SphereGeometry(1.0, 24, 16), m); c.scale.set(s * 1.2, s, s * 1.2); c.position.set(dx, h + dy, dz); g.add(c); }
  const b = blob(r * 6, r * 6, 0.5); b.position.set(G.x + x, 0.012, G.z + z); return g; }
const TALL = { x: 0.55, z: 0.15 };
tree(TALL.x, TALL.z, 5.6, 0.2); tree(-2.6, -1.2, 4.6, 0.17); tree(2.4, -2.0, 5.0, 0.18); tree(-1.0, -3.2, 4.2, 0.15); tree(3.6, 0.6, 4.4, 0.16); tree(-3.6, 1.0, 4.8, 0.17);
{ const path = mesh(new THREE.PlaneGeometry(9, 0.9), std('#8C7BC9', 0.95), false, true); path.rotation.x = -Math.PI / 2; path.position.set(G.x - 0.5, 0.004, G.z + 1.0); scene.add(path); }
{ const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#231A55'; g.fillRect(0, 0, 64, 128);
  let s = 3; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let y = 8; y < 124; y += 12) for (let x = 6; x < 60; x += 12) if (rnd() > 0.55) { g.fillStyle = rnd() > 0.5 ? PAL.gold : '#FFE7A8'; g.fillRect(x, y, 6, 7); }
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  let s2 = 11; const r2 = () => { s2 = (s2 * 16807) % 2147483647; return s2 / 2147483647; };
  for (let i = 0; i < 34; i++) { const w = 1.4 + r2() * 2.4, h = 1.2 + r2() * 3.2, x = G.x - 26 + i * 1.6 + r2() * 0.8;
    const t2 = tx.clone(); t2.repeat.set(w / 1.5, h / 3); t2.needsUpdate = true;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), new THREE.MeshBasicMaterial({ map: t2, toneMapped: false })); b.position.set(x, h / 2, -50 - r2() * 3); scene.add(b); } }   // a thin band of lit windows on the horizon

// ---- cards: the study (dark, in-app style) and the selfies / daily distress (light photo card)
function makeCard(w, h, panelCol, rimCol) {
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
const CARD_POS = V(-1.0, 5.2, -5.5);   // the study card hangs in the sky among the stars
const card = makeCard(0.7, 0.52, PAL.dark, PAL.deep); const cardTx = cardCanvas(card, 0.68, 0.505, 1220, 906);
function walker(g, x, y, s, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y - s * 0.62, s * 0.16, 0, 7); g.fill();
  g.strokeStyle = col; g.lineWidth = s * 0.13; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y - s * 0.44); g.lineTo(x - s * 0.04, y + s * 0.05);
  g.moveTo(x - s * 0.04, y + s * 0.05); g.lineTo(x - s * 0.22, y + s * 0.45); g.moveTo(x - s * 0.04, y + s * 0.05); g.lineTo(x + s * 0.18, y + s * 0.45);
  g.moveTo(x, y - s * 0.32); g.lineTo(x - s * 0.22, y - s * 0.08); g.moveTo(x, y - s * 0.32); g.lineTo(x + s * 0.2, y - s * 0.12); g.stroke(); }
function chip(g, txt, cx, cy, a) { if (a <= 0) return; g.globalAlpha = a; g.font = `400 96px ${SERIF}`; const w = g.measureText(txt).width + 70; rr(g, cx - w / 2, cy - 62, w, 124, 40, '#2A2160', PAL.violet, 5);
  g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.fillText(txt, cx, cy + 4); g.textAlign = 'left'; g.globalAlpha = 1; }
function drawCard(t) {
  const m = sm(remap(t, S.s3 - 0.05, S.s3 + 0.3)), o = sm(remap(t, T.older - 0.1, T.older + 0.3)), a1 = sm(remap(t, T.cWeekly, T.cWeekly + 0.25)), a2 = sm(remap(t, T.c15, T.c15 + 0.25)), a3 = sm(remap(t, T.c8, T.c8 + 0.25));
  const step = Math.floor(t * 6) % 2;
  const key = [m, o, a1, a2, a3, step].map(x => (+x).toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle';
  g.globalAlpha = m; g.fillStyle = '#B9A4FF'; g.font = `600 52px ${UI}`; g.fillText('ONE STUDY', 60, 90);
  g.globalAlpha = m * o; g.fillStyle = '#FFFFFF'; g.font = `400 120px ${SERIF}`; g.fillText('older adults', 60, 230);
  for (let i = 0; i < 3; i++) walker(g, 830 + i * 120, 240 + (i + step) % 2 * 4, 150, i === 1 ? PAL.lilac : '#B9A4FF');
  chip(g, 'weekly', 230, 520, m * a1); chip(g, '15 min', 610, 520, m * a2); chip(g, '8 weeks', 985, 520, m * a3);
  g.globalAlpha = m * a3; g.fillStyle = '#B9A4FF'; g.font = `500 50px ${UI}`; g.textAlign = 'center'; g.fillText('awe walk  vs  ordinary walk', 610, 760); g.textAlign = 'left';
  g.globalAlpha = 1; tex.needsUpdate = true;
}
// the photo card: four selfies over the weeks (self smaller, more sky, bigger smile), then "daily distress" going down
const PHOTO_POS = V(1.3, 5.6, -6.2);
const photo = makeCard(0.7, 0.62, '#FFFDF7', PAL.lilac); const photoTx = cardCanvas(photo, 0.68, 0.605, 1220, 1080);
function selfie(g, x, y, w, h, k, a) {   // k: 0 (week 1) .. 1 (week 8)
  g.save(); g.globalAlpha = a; rr(g, x, y, w, h + 80, 14, '#FFFFFF', '#E6DEF5', 4); g.beginPath(); g.rect(x + 18, y + 18, w - 36, h - 36); g.clip();
  const grd = g.createLinearGradient(0, y, 0, y + h); grd.addColorStop(0, '#2E2270'); grd.addColorStop(0.7, PAL.deep); grd.addColorStop(1, PAL.lilac); g.fillStyle = grd; g.fillRect(x, y, w, h);
  g.fillStyle = '#FFF0C8'; g.beginPath(); g.arc(x + w * 0.72, y + h * 0.3, 26 + 12 * k, 0, 7); g.fill();
  g.fillStyle = '#3E3384'; for (const [tx, th] of [[0.12, 0.55], [0.3, 0.75], [0.86, 0.62]]) { g.fillRect(x + w * tx - 6, y + h * (1 - th * (0.4 + 0.6 * k)), 12, h); g.beginPath(); g.arc(x + w * tx, y + h * (1 - th * (0.4 + 0.6 * k)), 40 * (0.5 + 0.6 * k), 0, 7); g.fill(); }
  const fs = lerp(1.0, 0.42, k), cx = x + w * 0.5, cy = y + h * (0.78 - 0.12 * (1 - fs));   // the self: big and close -> small among the scenery
  g.fillStyle = '#8270C4'; g.beginPath(); g.ellipse(cx, y + h + 10, 150 * fs, 150 * fs, 0, Math.PI, 0); g.fill();
  g.beginPath(); g.arc(cx, cy - 40 * fs, 92 * fs, 0, 7); g.fill(); g.fillStyle = PAL.deep; g.beginPath(); g.arc(cx, cy - 40 * fs, 94 * fs, Math.PI * 1.05, Math.PI * 1.95); g.fill();
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 9 * Math.max(0.5, fs); g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy - 30 * fs, (24 + 26 * k) * fs, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  g.restore();
}
function drawPhoto(t) {
  const m = sm(remap(t, S.s4 - 0.05, S.s4 + 0.3)), ps = [T.ph1, T.ph2, T.ph3, T.ph4].map(x => sm(remap(t, x - 0.1, x + 0.35))), sml = sm(remap(t, T.smile, T.smile + 0.4));
  const ds = sm(remap(t, T.distress - 0.3, T.distress + 0.1)), db = eio(remap(t, T.distress + 0.2, T.distB));
  const key = [m, ...ps, sml, ds, db].map(x => x.toFixed(3)).join('|'); if (key === photoTx.key) return; photoTx.key = key;
  const { c, g, t: tex } = photoTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle';
  if (ds < 1) { const a = m * (1 - ds);
    const pos = [[70, 60], [640, 60], [70, 560], [640, 560]], labs = ['week 1', 'week 3', 'week 5', 'week 8'];
    pos.forEach(([x, y], i) => { if (ps[i] <= 0) return; selfie(g, x, y + (1 - ps[i]) * 30, 510, 380, i / 3, a * ps[i]);
      g.globalAlpha = a * ps[i]; g.fillStyle = INK; g.font = `400 66px ${SERIF}`; g.textAlign = 'center'; g.fillText(labs[i], x + 255, y + 420 + (1 - ps[i]) * 30); g.textAlign = 'left'; });
    if (sml > 0) { g.globalAlpha = a * sml; rr(g, 625, 545, 540, 500, 26, null, PAL.gold, 10); }
  }
  if (ds > 0) { const a = m * ds; g.globalAlpha = a; g.fillStyle = INK; g.font = `400 120px ${SERIF}`; g.fillText('daily distress', 70, 170);
    g.fillStyle = '#8E86AE'; g.font = `500 52px ${UI}`; g.fillText('awe walkers, over 8 weeks', 70, 290);
    rr(g, 70, 470, 1080, 130, 65, '#EFEAF8'); rr(g, 70, 470, Math.max(130, 1080 * lerp(0.82, 0.5, db)), 130, 65, PAL.violet);
    g.fillStyle = '#8E86AE'; g.font = `500 48px ${UI}`; g.fillText('week 1', 70, 680); g.textAlign = 'right'; g.fillText('week 8', 1150, 680); g.textAlign = 'left';
    g.fillStyle = PAL.violet; g.font = `400 140px ${SERIF}`; g.fillText('↓', 1040 * lerp(0.82, 0.5, db) + 60, 860); }
  g.globalAlpha = 1; tex.needsUpdate = true;
}

// ---------------------------------------------------------------- choreography: standing on the hill (S1-S4), walking in the grove (S5)
const STAND = V(0, 0.9 + HILL_Y, 0);
const WALK0 = V(G.x - 2.1, 0.9, G.z + 1.0), WALK1 = V(G.x - 0.25, 0.9, G.z + 1.0);
function walkDist(t) { const L = WALK0.distanceTo(WALK1), d = T.stop - T.walkA; return L * eio(remap(t, T.walkA, T.stop)); }
const figRef = {};
function pose(t) { return { br: Math.sin(t * 2 * Math.PI / (t > T.stop ? 5.0 : 4.2)) }; }
function placeFigure(t, P) {
  const inGrove = t >= S.s5;
  let pel, yaw, lean = 0.04, headPitch, headYaw = 0, walk = 0;
  if (!inGrove) {
    pel = STAND.clone(); yaw = 0.25;   // facing the moon (-z), turned a little toward it
    headPitch = 0.12 + 0.4 * sm(remap(t, T.lookUp, T.lookUp + 1.2));
  } else {
    walk = walkDist(t); pel = vl(WALK0, WALK1, walk / WALK0.distanceTo(WALK1));
    yaw = lerp(-Math.PI / 2, -Math.PI / 2 + 0.55, sm(remap(t, T.stop - 0.4, T.stop + 0.4)));   // turns toward the tall tree
    headPitch = lerp(0.0, 0.75, sm(remap(t, T.upA + 0.6, T.upB + 0.4)));
    pel.y += 0.008 * Math.cos(4 * Math.PI * walk / 0.62) * (t < T.stop ? 1 : 0);
  }
  torso.position.copy(pel); torso.rotation.set(-lean, yaw + headYaw * 0.15, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * P.br, 1 + 0.01 * P.br, 1 + 0.008 * P.br);
  neckG.rotation.set(0, 0, 0); head.rotation.set(headPitch, headYaw, 0, 'YXZ'); torso.updateMatrixWorld(true);
  const fwd = V(-Math.sin(yaw), 0, -Math.cos(yaw)), lat = V(Math.cos(yaw), 0, -Math.sin(yaw));
  const moving = inGrove && t > T.walkA && t < T.stop, w = moving ? Math.min(1, (t - T.walkA) * 3, (T.stop - t) * 3) : 0, ph = 2 * Math.PI * walk / 0.62;
  const groundY = inGrove ? 0 : HILL_Y;
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    const hip = torso.localToWorld(V(sx * 0.085, 0.02, 0.0));
    const psi = ph + (i ? Math.PI : 0);
    const ank = V(pel.x, groundY + 0.075, pel.z).add(lat.clone().multiplyScalar(sx * 0.09)).add(fwd.clone().multiplyScalar(0.15 * Math.sin(psi) * w)).add(V(0, 0.05 * Math.max(0, Math.cos(psi)) * w, 0));
    const r = ik(hip, ank, 0.4, 0.43, fwd.clone().multiplyScalar(0.9).add(V(0, 0.15, 0)));
    const [th, sh, hi, kn, an] = i === 0 ? [limbs.thL, limbs.shL, J.hiL, J.knL, J.anL] : [limbs.thR, limbs.shR, J.hiR, J.knR, J.anR];
    hi.position.copy(hip); kn.position.copy(r.mid); an.position.copy(r.end); setLimb(th, hip, r.mid); setLimb(sh, r.mid, r.end);
    feet[i].position.copy(r.end).add(fwd.clone().multiplyScalar(0.045)); feet[i].position.y = r.end.y - 0.047; feet[i].rotation.set(0, yaw + sx * -0.08, 0);
    footBlobs[i].position.set(feet[i].position.x, groundY + 0.013, feet[i].position.z); footBlobs[i].material.opacity = 0.55;
  }
  const shL = torso.localToWorld(V(-0.15, 0.315, 0.0)), shR = torso.localToWorld(V(0.15, 0.315, 0.0));
  const swing = sx => fwd.clone().multiplyScalar(0.1 * Math.sin(ph + (sx < 0 ? 0 : Math.PI)) * w);
  const hang = sx => (sx < 0 ? shL : shR).clone().add(V(0, -0.46, 0)).add(fwd.clone().multiplyScalar(0.04)).add(lat.clone().multiplyScalar(sx * 0.07)).add(swing(sx));
  const pole = sx => lat.clone().multiplyScalar(sx * 0.7).add(V(0, -0.6, 0)).sub(fwd.clone().multiplyScalar(0.3));
  const aL = ik(shL, hang(-1), 0.25, 0.235, pole(-1)), aR = ik(shR, hang(1), 0.25, 0.235, pole(1));
  J.shL.position.copy(shL); J.shR.position.copy(shR); J.elL.position.copy(aL.mid); J.elR.position.copy(aR.mid);
  J.haL.position.copy(aL.end); J.haR.position.copy(aR.end);
  setLimb(limbs.uaL, shL, aL.mid); setLimb(limbs.faL, aL.mid, aL.end); setLimb(limbs.uaR, shR, aR.mid); setLimb(limbs.faR, aR.mid, aR.end);
  J.haL.lookAt(aL.mid); J.haR.lookAt(aR.mid);
  figRef.headP = head.getWorldPosition(V(0, 0, 0));
}
function setProps(t) {
  // the key light (and its shadows) follows the action: the hill (S1-S4) or the grove (S5)
  const c = t >= S.s5 ? V(G.x - 0.6, 0.6, G.z + 0.8) : V(0, 0.6, 0.2);
  key.target.position.copy(c); key.position.copy(c).add(V(2.2, 4.2, 2.8)); key.target.updateMatrixWorld();
}
function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  starGroups[0].material.opacity = 0.75 + 0.25 * Math.sin(t * 2.3); starGroups[1].material.opacity = 0.8 + 0.2 * Math.sin(t * 1.7 + 1.3);
  halo.material.opacity = 0.14 + 0.03 * Math.sin(t * 0.9);
  moon.lookAt(camera.position); halo.lookAt(camera.position);
  moon.visible = halo.visible = t < S.s5;   // the grove looks another way; keeps the moon from crossing behind the lock-up
  const v = sm(remap(t, S.s3 - 0.05, S.s3 + 0.25)) * (1 - sm(remap(t, S.s4 - 0.3, S.s4 - 0.02)));
  card.visible = v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0);
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
  const pv = sm(remap(t, S.s4 - 0.05, S.s4 + 0.25)) * (1 - sm(remap(t, S.s5 - 0.3, S.s5 - 0.02)));
  photo.visible = pv > 0.003; photo.position.copy(PHOTO_POS); photo.rotation.set(0, camYaw(PHOTO_POS), 0);
  photo.userData.border.material.opacity = pv; photo.userData.panel.material.opacity = pv; photoTx.m.material.opacity = pv;
  if (photo.visible) drawPhoto(t);
}
const LABELS = [];


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
const SHOTS = [
  // S1 frame 0 = the thumbnail: a tiny figure on the hill under a vast dusk sky and a big moon
  { a: S.s1, b: S.s2, k0: [V(0.55, 3.1, -5), 2, -8, 15.0, 30], k1: [V(0.55, 3.15, -5), 2, -8.5, 14.5, 30] },
  // S2 crane: from behind him as he looks up; the sky opens above
  { a: S.s2, b: S.s3, m: [S.s2, S.s3], ease: 'sine', k0: [V(0, 2.5, -4), 0, -4, 7.0, 30], k1: [V(0, 4.8, -7), 0, -16, 8.6, 30] },
  // S3 up among the stars: the study card
  { a: S.s3, b: S.s4, k0: [V(-1.0, 5.2, -5.5), 4, 4, 3.45, 30], k1: [V(-1.0, 5.2, -5.5), 0, 4, 3.35, 30] },
  // S4 the photo card in the sky (turned away from the moon so the captions stay legible): the selfies, then daily distress
  { a: S.s4, b: S.s5, k0: [V(1.32, 5.6, -6.2), 28, 2, 3.5, 30], k1: [V(1.32, 5.6, -6.2), 24, 2, 3.4, 30] },
  // S5 the grove: following him along the path (k0 -> k1), then low behind him, looking up the tallest tree (k2)
  { a: S.s5, b: S.end, m: [T.walkA, T.stop], k0: [V(G.x - 1.8, 1.25, G.z + 1.0), 12, 4, 4.2, 30], k1: [V(G.x - 0.25, 1.3, G.z + 0.9), 18, 4, 4.0, 30],
    k2: [V(G.x + 0.1, 2.5, G.z - 0.2), -24, -21, 5.8, 30] },
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
  // crucial in-scene text: the study card and the photo card, each audited by its own oriented box
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const keep = b => (onScreen(b) ? b : null);
  const crucial = { card: card.visible ? keep(textBox(card)) : null, photo: photo.visible ? keep(textBox(photo)) : null };
  const r = { t, card: null, crucial, head: sphereBox(head, 0.12), desk: null };
  const cb = capEl.getBoundingClientRect();
  r.caption = capEl.innerHTML && +capEl.style.opacity > 0.02 ? [cb.left, cb.top, cb.right, cb.bottom].map(Math.round) : null;
  const spans = [...capEl.querySelectorAll('.ln')].map(e => e.getBoundingClientRect());
  r.captionText = spans.length && r.caption ? [Math.min(...spans.map(b => b.left)), Math.min(...spans.map(b => b.top)), Math.max(...spans.map(b => b.right)), Math.max(...spans.map(b => b.bottom))].map(Math.round) : null;
  r.captionLines = spans.length;
  r.shot = SHOTS.findIndex(x => t >= x.a && t < x.b) + 1 || 5;
  return r;
};


// ---------------------------------------------------------------- captions (Instrument Serif; on the dusk sky: white, key words in the store gold #FEC357)
const hl = s => `<span class="hl">${s}</span>`;
const sg = (html, t = null) => ({ html, t });
const C2 = 96, C1 = 108, C0 = 132;
const aweP = PS('awe')[0][1], studyP = PS('study')[0][1], selfP = PS('selfies')[0][1], payP1 = PS('payoff')[0][1], payP3 = PS('payoff')[2][1];
const W_LIKE = 4.82, W_FOR = 9.68;
const CAPS = [
  // frame 0: the curiosity words are the first caption, already fully on screen
  { a: -1, b: TL.awe.start - 0.12, size: C0, lines: [[sg('Why feel small')], [sg(`${hl('on purpose?')}`)]] },
  { a: TL.awe.start - 0.06, b: aweP - 0.12, size: C1, lines: [[sg(`That feeling is ${hl('awe')}:`)]] },
  { a: aweP - 0.06, b: W_LIKE - 0.12, size: C2, lines: [[sg('what you feel near')], [sg(`something ${hl('vast')},`, 3.98)]] },
  { a: W_LIKE - 0.06, b: TL.study.start - 0.12, size: C1, lines: [[sg(`like a ${hl('night sky')}.`)]] },
  { a: TL.study.start - 0.06, b: studyP - 0.12, size: C1, lines: [[sg('In one study,')]] },
  { a: studyP - 0.06, b: W_FOR - 0.12, size: C2, lines: [[sg('older adults took weekly')], [sg(`${hl('fifteen-minute walks')}`, 8.55)]] },
  { a: W_FOR - 0.06, b: TL.selfies.start - 0.12, size: C1, lines: [[sg(`for ${hl('eight weeks')}.`)]] },
  { a: TL.selfies.start - 0.06, b: selfP - 0.12, size: C2, lines: [[sg(`Those ${hl('looking for awe')}`)], [sg('took selfies with', 12.05)]] },
  { a: selfP - 0.06, b: TL.distress.start - 0.12, size: C2, lines: [[sg(`${hl('more scenery')}, ${hl('less self')},`)], [sg(`and ${hl('bigger smiles')}.`, 14.85)]] },
  { a: TL.distress.start - 0.06, b: TL.payoff.start - 0.12, size: C2, lines: [[sg('They also reported')], [sg(`${hl('less daily distress')}.`, 17.25)]] },
  { a: TL.payoff.start - 0.06, b: payP1 - 0.12, size: C1, lines: [[sg('So on your next walk,')]] },
  { a: payP1 - 0.06, b: payP3 - 0.12, size: C2, lines: [[sg(`find ${hl('one vast thing')},`)], [sg('a sky, a tree,', 21.75)]] },
  { a: payP3 - 0.06, b: TL.payoff.end + 0.4, size: C2, lines: [[sg('a skyline,')], [sg(`and ${hl('pause for it')}.`, 24.0)]] },
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
cardTx.key = ''; photoTx.key = '';
// redraw the label textures now that the fonts are present
for (const lab of LABELS) { const { canvas: c, g: ctx } = lab.userData.tx; ctx.clearRect(0, 0, c.width, c.height); let s = 170; ctx.font = `400 ${s}px ${SERIF}`;
  while (ctx.measureText(lab.userData.label).width > c.width - 60) { s -= 4; ctx.font = `400 ${s}px ${SERIF}`; }
  ctx.fillStyle = '#191632'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lab.userData.label, c.width / 2, c.height * 0.54); lab.userData.tx.tex.needsUpdate = true; }
renderAt(0);
window.ready = true;
