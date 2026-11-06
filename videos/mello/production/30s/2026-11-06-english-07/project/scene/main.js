// Mello 30 s english07-01 (English): "temptation bundling" - pair a treat with a habit you keep putting off (Milkman, Minson &
// Volpp 2014; Kirgios et al. 2020). Same accepted style recipe and renderer as the latest accepted episodes ("Thoughts in a Quiet
// Room": sparse clean 3D miniature, one abstract faceless performer, soft contact shadows, white/pale-gray stage, lavender
// #D9BCF5 only as the highlight; English captions in Instrument Serif). Room, desk props, rig, camera helper, caption mechanics,
// cards and the oriented-box safe-zone audit are carried over from ../../2026-11-06-english-06/project/scene/main.js.
// New for this episode: a phone with a stylised podcast screen and a "walks only" lock, the bundle card (want + putting off)
// that turns into a schematic chart (more often at first, the boost fades), walking shoes, headphones, and the accepted
// performer standing up, stepping into the shoes, lacing up and walking.
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
const hookSplit = SPL('hook'), nameSplit = SPL('name'), studySplit = SPL('study'), pickSplit = SPL('pick'), ruleSplit = SPL('rule'), closeSplit = SPL('close');
// word starts measured with faster-whisper word timestamps on generated/narration.wav (see notes):
// "want" 6.44, "putting off" 7.58, "went more often" 13.03, "though the boost faded" 14.21, "a show" 17.03, "a playlist" 17.41,
// "a podcast" 17.95, "walking shoes" 21.55, "on" 22.39, "Lace up" 24.62
const S = { s1: 0.0, s2: 3.45, s3: 15.75, s4: 19.15, s5: 25.75, end: 30.0 };
const T = {
  lock: 0.35, tag: 0.85, tapTry: 1.55,               // "new rule": the lock drops onto Play; a tap, the lock jiggles
  cardIn: S.s2 + 0.1, title: TL.name.start + 0.4,    // "temptation bundling"
  want: TL.name.start + 2.7, off: TL.name.start + 3.85, join: TL.name.start + 4.35,
  morph: TL.study.start + 0.05,                      // "in a gym study": the card turns into the schematic chart
  draw: PS('study')[0][1] - 0.05, more: TL.study.start + 4.15, faded: TL.study.start + 5.35, drawEnd: TL.study.end - 0.15,
  cardOut: S.s3 - 0.1,
  tile1: TL.pick.start + 1.0, tile2: TL.pick.start + 1.4, tile3: TL.pick.start + 1.95, choose: TL.pick.start + 2.25,
  ruleIn: S.s4 + 0.15,                               // "then set the rule": plays only on walks (locked)
  standA: TL.rule.start + 0.05, standB: TL.rule.start + 1.15,
  stepA: TL.rule.start + 1.3, stepB: TL.rule.start + 2.45, unlock: TL.rule.end - 0.4,   // "...walking shoes are on"
  laceA: TL.close.start + 0.1, laceB: closeSplit + 0.55, walkA: closeSplit + 0.75,      // "want the next episode? lace up."
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



// ---------------------------------------------------------------- episode props: phone (podcast screen), shoes, headphones, cards
const lavender = new THREE.Color('#D9BCF5');
const INK = '#17122E', NAVY = '#1C1733', CREAM = '#F6F1E6', PEACH = '#F0D2A6';
const UI = '"Inter", sans-serif', SERIF = '"Instrument Serif", serif';
function rr(g, x, y, w, h, r, fill, stroke, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function padlock(g, cx, cy, s, col, open = 0, shackleCol = col) {   // drawn padlock; open 0..1 lifts and swings the shackle
  g.save(); g.translate(cx, cy);
  g.strokeStyle = shackleCol; g.lineWidth = s * 0.16; g.lineCap = 'round';
  g.save(); g.translate(s * 0.28, -s * 0.12 - s * 0.22 * open); g.rotate(-0.9 * open); g.translate(-s * 0.28, 0);
  g.beginPath(); g.moveTo(-s * 0.28, 0); g.lineTo(-s * 0.28, -s * 0.28); g.arc(0, -s * 0.28, s * 0.28, Math.PI, 0); g.lineTo(s * 0.28, 0); g.stroke(); g.restore();
  rr(g, -s * 0.48, -s * 0.12, s * 0.96, s * 0.74, s * 0.14, col);
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.arc(0, s * 0.18, s * 0.09, 0, Math.PI * 2); g.fill();
  g.restore();
}
function playTri(g, cx, cy, s, col) { g.fillStyle = col; g.beginPath(); g.moveTo(cx - s * 0.32, cy - s * 0.42); g.lineTo(cx + s * 0.46, cy); g.lineTo(cx - s * 0.32, cy + s * 0.42); g.closePath(); g.fill(); }
function shoeIcon(g, x, y, s, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - s * 0.55); g.quadraticCurveTo(x + s * 0.35, y - s * 0.6, x + s * 0.5, y - s * 0.32); g.quadraticCurveTo(x + s * 0.95, y - s * 0.28, x + s, y - s * 0.05); g.lineTo(x + s, y); g.closePath(); g.fill(); }

// phone with a canvas screen (stylised podcast player; original illustration)
const phone = new THREE.Group();
phone.add(mesh(new RoundedBoxGeometry(0.078, 0.009, 0.158, 2, 0.005), M.lead));
const phoneC = document.createElement('canvas'); phoneC.width = 600; phoneC.height = 1216;
const phoneTex = new THREE.CanvasTexture(phoneC); phoneTex.colorSpace = THREE.SRGBColorSpace; phoneTex.anisotropy = 8;
const phoneScr = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.142), new THREE.MeshBasicMaterial({ map: phoneTex, toneMapped: false }));
phoneScr.rotation.x = -Math.PI / 2; phoneScr.position.y = 0.0048; phone.add(phoneScr);
scene.add(phone);
const phoneBlob = blob(0.16, 0.24, 0.0, DESK_Y + 0.002);
const PHONE_DESK = V(0.13, DESK_Y + 0.0047, 0.2);
let phoneKey = '';
function drawPhone(t) {
  const g = phoneC.getContext('2d'), W2 = 600, H2 = 1216;
  const pickMode = t >= S.s3 && t < S.s4;
  const locked = t < T.unlock + 0.1;
  const lk = sm(remap(t, T.lock - 0.15, T.lock + 0.1)), jig = Math.sin(Math.PI * 4 * remap(t, T.tapTry, T.tapTry + 0.5)) * (t > T.tapTry && t < T.tapTry + 0.5 ? 1 : 0);
  const op = sm(remap(t, T.unlock, T.unlock + 0.3));
  const tiles = [T.tile1, T.tile2, T.tile3].map(a => sm(remap(t, a - 0.05, a + 0.15))), ch = sm(remap(t, T.choose, T.choose + 0.2));
  const wave = Math.floor(t * 8);
  const key = [pickMode, locked, lk.toFixed(2), jig.toFixed(2), op.toFixed(2), ...tiles.map(x => x.toFixed(2)), ch.toFixed(2), locked ? 0 : wave].join('|');
  if (key === phoneKey) return; phoneKey = key;
  g.fillStyle = '#FBFAFD'; g.fillRect(0, 0, W2, H2); g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillStyle = '#EEE8F8'; g.fillRect(0, 0, W2, 120);
  g.fillStyle = '#2A2440'; g.font = `600 52px ${UI}`; g.fillText(pickMode ? 'Pick one treat' : 'Podcasts', 44, 66);
  if (pickMode) {
    [['Show', 0], ['Playlist', 1], ['Podcast', 2]].forEach(([name, i]) => {
      const y = 190 + i * 300, on = i === 2 ? Math.max(tiles[2], ch) : tiles[i] * (1 - tiles[i + 1 > 2 ? 2 : i + 1]);
      rr(g, 40, y, 520, 250, 36, on > 0.02 ? `rgba(217,188,245,${0.35 + 0.65 * on})` : '#F3EFFA', '#CFC6E3', 3);
      g.fillStyle = '#17122E'; g.font = `600 84px ${UI}`; g.fillText(name, 90, y + 125);
      if (i === 2 && ch > 0) { g.globalAlpha = ch; g.strokeStyle = '#17122E'; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(450, y + 128); g.lineTo(482, y + 160); g.lineTo(530, y + 92); g.stroke(); g.globalAlpha = 1; }
    });
  } else {
    // cover art: lavender square with sound bars
    const gr = g.createLinearGradient(60, 160, 540, 640); gr.addColorStop(0, '#E7DAF8'); gr.addColorStop(1, '#C9B1EE'); rr(g, 60, 160, 480, 480, 40, gr);
    for (let i = 0; i < 9; i++) { const h = 60 + 140 * Math.abs(Math.sin(i * 1.7 + (locked ? 0 : t * 6))); rr(g, 120 + i * 42, 400 - h / 2, 24, h, 12, '#7E5FC4'); }
    g.fillStyle = '#17122E'; g.font = `600 52px ${UI}`; g.fillText('The Long Way Home', 60, 712);
    g.fillStyle = '#8E88A6'; g.font = `500 42px ${UI}`; g.fillText('Episode 12', 60, 772);
    rr(g, 60, 832, 480, 12, 6, '#E2DCEB'); rr(g, 60, 832, 480 * (locked ? 0.0 : 0.04 + 0.02 * op), 12, 6, '#8E6FD0');
    // play button with the lock
    const bx = 300 + 14 * jig, by = 1000;
    g.fillStyle = '#D9BCF5'; g.beginPath(); g.arc(bx, by, 104, 0, Math.PI * 2); g.fill();
    if (locked) { playTri(g, bx + 8, by, 110, 'rgba(23,18,46,0.25)'); if (lk > 0) { g.globalAlpha = lk; padlock(g, bx, by - 6 - 30 * (1 - lk), 120, NAVY); g.globalAlpha = 1; } }
    else { g.fillStyle = INK; rr(g, bx - 38, by - 46, 26, 92, 8, INK); rr(g, bx + 12, by - 46, 26, 92, 8, INK); }
  }
  phoneTex.needsUpdate = true;
}

// walking shoes (white uppers, lavender soles, navy laces), waiting on the floor to the right of the stool
const SHOE_SPOTS = [V(0.42, 0, 0.6), V(0.42, 0, 0.76)];   // left / right foot when standing, facing +x
function makeShoe() {
  const g = new THREE.Group();
  const up = mesh(new RoundedBoxGeometry(0.098, 0.066, 0.19, 3, 0.03), std('#FBFAF8', 0.6)); up.position.set(0, 0.04, 0); g.add(up);
  const sole = mesh(new RoundedBoxGeometry(0.104, 0.02, 0.198, 2, 0.008), std('#D9BCF5', 0.5)); sole.position.set(0, 0.01, 0); g.add(sole);
  for (let i = 0; i < 3; i++) { const l = mesh(new THREE.BoxGeometry(0.05, 0.006, 0.008), M.lead, false, false); l.position.set(0, 0.074, -0.025 + i * 0.025); g.add(l); }
  scene.add(g); return g;
}
const shoes = [makeShoe(), makeShoe()];
const shoeBlobs = shoes.map(() => blob(0.18, 0.28, 0.5));

// headphones (lavender), worn once the podcast unlocks
const phonesG = new THREE.Group(); head.add(phonesG);
{ const band = mesh(new THREE.TorusGeometry(0.118, 0.012, 8, 40, Math.PI), std('#D9BCF5', 0.45), true, false); band.position.y = 0.012; phonesG.add(band);
  for (const sx of [-1, 1]) { const cup = mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.034, 28), std('#D9BCF5', 0.5)); cup.rotation.z = Math.PI / 2; cup.position.set(sx * 0.112, -0.006, 0.0); phonesG.add(cup); } }
phonesG.visible = false;

// ---------------------------------------------------------------- cards: bundle -> schematic chart (S2), status (S1 / S4)
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
const CARD_POS = V(-0.374, 1.385, 0.3);
const card = makeCard(0.7, 0.4); const cardTx = cardCanvas(card, 0.68, 0.39, 1220, 700);
function chipBox(g, x, y, w, label, text, fill, a) {
  if (a <= 0) return; g.globalAlpha = a;
  g.fillStyle = '#5E577E'; g.font = `500 66px ${UI}`; g.textAlign = 'center'; g.fillText(label, x + w / 2, y - 58);
  rr(g, x, y, w, 180, 40, fill); g.fillStyle = INK; g.font = `400 128px ${SERIF}`; g.fillText(text, x + w / 2, y + 94); g.textAlign = 'left'; g.globalAlpha = 1;
}
function drawCard(t) {
  const m = sm(remap(t, T.morph, T.morph + 0.45)), ti = sm(remap(t, T.title, T.title + 0.3)) * (1 - m);
  const a1 = sm(remap(t, T.want, T.want + 0.3)) * (1 - m), a2 = sm(remap(t, T.off, T.off + 0.3)) * (1 - m), jn = sm(remap(t, T.join, T.join + 0.35)) * (1 - m);
  const p = eio(remap(t, T.draw, T.drawEnd)), mo = sm(remap(t, T.more, T.more + 0.3)), fd = sm(remap(t, T.faded, T.faded + 0.3));
  const key = [m, ti, a1, a2, jn, p, mo, fd].map(x => x.toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle';
  if (m < 1) {
    if (ti > 0) { g.globalAlpha = ti; g.font = `400 92px ${SERIF}`; const w = g.measureText('temptation bundling').width + 70; rr(g, 610 - w / 2, 26, w, 118, 30, '#D9BCF5'); g.fillStyle = INK; g.textAlign = 'center'; g.fillText('temptation bundling', 610, 88); g.textAlign = 'left'; g.globalAlpha = 1; }
    if (jn > 0) { g.globalAlpha = jn; rr(g, 34, 300, 1152, 240, 56, null, '#B98EEA', 10); g.globalAlpha = 1; }
    chipBox(g, 70, 335, 440, 'want', 'podcast', '#E7DAF8', a1);
    if (a2 > 0) { g.globalAlpha = a2; g.fillStyle = INK; g.font = `400 150px ${SERIF}`; g.textAlign = 'center'; g.fillText('+', 610, 420); g.textAlign = 'left'; g.globalAlpha = 1; }
    chipBox(g, 710, 335, 440, 'putting off', 'a walk', PEACH, a2);
    if (jn > 0) { g.globalAlpha = jn; g.fillStyle = '#5E577E'; g.font = `500 66px ${UI}`; g.textAlign = 'center'; g.fillText('only together', 610, 615); g.textAlign = 'left'; g.globalAlpha = 1; }
  }
  if (m > 0) {   // schematic: gym visits over the weeks (direction only, no scale)
    g.globalAlpha = m;
    g.fillStyle = INK; g.font = `400 104px ${SERIF}`; g.fillText('gym visits', 44, 80);
    const X0 = 70, X1 = 1150, Yb = 600;
    g.fillStyle = '#B9B3CB'; g.fillRect(X0, Yb, X1 - X0, 6); g.fillStyle = '#5E577E'; g.font = `500 62px ${UI}`; g.textAlign = 'right'; g.fillText('weeks →', X1, Yb + 60); g.textAlign = 'left';
    const yA = u => 350 + 140 * Math.pow(u, 1.35), yB = u => 515 + 5 * Math.sin(u * 7);
    const line = (fy, col, lw) => { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60 * p; const x = X0 + 20 + (X1 - X0 - 40) * u, y = fy(u); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); };
    if (p > 0.001) { line(yB, '#A9A3BD', 18); line(yA, '#A77BE6', 24); }
    // legend
    g.font = `500 52px ${UI}`; rr(g, 430, 52, 64, 18, 9, '#A77BE6'); g.fillStyle = INK; g.fillText('audiobooks only at the gym', 510, 62);
    rr(g, 430, 122, 64, 16, 8, '#A9A3BD'); g.fillStyle = '#4A4466'; g.fillText('comparison group', 510, 132);
    if (mo > 0) { g.globalAlpha = m * mo; g.font = `400 92px ${SERIF}`; const w = g.measureText('more often').width + 56; rr(g, 96, 196, w, 112, 28, '#E7DAF8'); g.fillStyle = INK; g.fillText('more often', 124, 254); }
    if (fd > 0) { g.globalAlpha = m * fd; g.font = `400 92px ${SERIF}`; const w = g.measureText('the boost faded').width + 56; rr(g, X1 - w, 226, w, 112, 28, '#F3EFFA', '#CFC6E3', 3); g.fillStyle = INK; g.fillText('the boost faded', X1 - w + 28, 284); }
    g.globalAlpha = 1;
  }
  tex.needsUpdate = true;
}
// status card: locked "walks only" (S1, beside the phone; S4, beside the performer) -> unlocked "playing" (S4)
const status = makeCard(0.42, 0.13); const statusTx = cardCanvas(status, 0.41, 0.125, 900, 274);
function drawStatus(t) {
  const op = sm(remap(t, T.unlock, T.unlock + 0.35));
  const key = op.toFixed(3); if (key === statusTx.key) return; statusTx.key = key;
  const { c, g, t: tex } = statusTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle';
  if (op < 1) { g.globalAlpha = 1 - op; padlock(g, 120, 150, 150, NAVY, op); g.fillStyle = INK; g.font = `400 120px ${SERIF}`; g.fillText('walks only', 230, 146); g.globalAlpha = 1; }
  if (op > 0) { g.globalAlpha = op; g.fillStyle = '#B98EEA'; g.beginPath(); g.arc(120, 140, 82, 0, Math.PI * 2); g.fill(); playTri(g, 130, 140, 90, INK); g.fillStyle = INK; g.font = `400 120px ${SERIF}`; g.fillText('now playing', 230, 146); g.globalAlpha = 1; }
  tex.needsUpdate = true;
}


// ---------------------------------------------------------------- choreography: seated -> stands -> steps into the shoes -> laces up -> walks
const SEAT = V(0, 0.64, 0.7), RISE = V(0.3, 0.9, 0.68), STAND = V(0.42, 0.895, 0.68);
const YAW_WALK = -Math.PI / 2;   // facing +x
function walkDist(t) { if (t <= T.walkA) return 0; const v = 0.26, r = 0.6, d = t - T.walkA; return v * (d < r ? d * d / (2 * r) : d - r / 2); }
function stance(t) { return { up: eio(remap(t, T.standA, T.standB)), step: eio(remap(t, T.stepA, T.stepB)), lace: sm(remap(t, T.laceA, T.laceA + 0.45)) * (1 - sm(remap(t, T.laceB - 0.4, T.laceB))), walk: walkDist(t) }; }

function pose(t) {
  const P = {}, st = stance(t);
  P.breath = Math.sin(t * 2 * Math.PI / 4.2);
  P.st = st;
  P.yaw = YAW_WALK * eio(remap(t, T.standA + 0.3, T.stepA + 0.5));
  P.lean = track(t, [[0, 0.22], [T.standA, 0.22], [T.standB, 0.06], [T.laceA, 0.06], [T.laceA + 0.45, 0.95], [T.laceB - 0.4, 0.95], [T.laceB, 0.06], [30, 0.06]]);
  P.headPitch = track(t, [[0, -0.62], [T.cardIn, -0.62], [T.cardIn + 0.6, -0.08], [S.s3 - 0.3, -0.08], [S.s3, -0.55], [S.s4 - 0.1, -0.55],
    [T.standB, -0.5], [T.stepB, -0.5], [T.unlock, -0.1], [T.laceA, -0.1], [T.laceA + 0.4, -0.5], [T.laceB, -0.1], [30, -0.05]]);
  P.headYaw = track(t, [[0, 0], [T.cardIn, 0], [T.cardIn + 0.6, 0.32], [S.s3 - 0.3, 0.32], [S.s3, 0], [30, 0]]);
  return P;
}
function pelvisAt(t, st) {
  let p = vl(SEAT, RISE, st.up); if (st.step > 0) p = vl(p, STAND, st.step);
  p.y -= 0.16 * st.lace; p.x += st.walk; p.y += 0.008 * Math.cos(4 * Math.PI * st.walk / 0.62) * Math.min(1, st.walk * 4);
  return p;
}

function placeFigure(t, P) {
  const st = P.st, br = P.breath, pel = pelvisAt(t, st);
  torso.position.copy(pel);
  torso.rotation.set(-P.lean, P.yaw + P.headYaw * 0.2, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + P.lean * 0.45, P.headYaw, 0, 'YXZ');
  torso.updateMatrixWorld(true);
  const fwd = V(-Math.sin(P.yaw), 0, -Math.cos(P.yaw)), lat = V(Math.cos(P.yaw), 0, -Math.sin(P.yaw)), upv = V(0, 1, 0);
  const shL = torso.localToWorld(V(-0.15, 0.315, 0.0)), shR = torso.localToWorld(V(0.15, 0.315, 0.0));
  // ---- feet: seated under the desk -> under the hips -> into the shoes -> walking
  const ph = 2 * Math.PI * st.walk / 0.62;
  const ankles = [-1, 1].map((sx, i) => {
    const seated = V(sx * 0.12, 0.075, 0.27);
    const under = pel.clone().add(lat.clone().multiplyScalar(sx * 0.09)); under.y = 0.075;
    let a = vl(seated, under, st.up);
    if (st.step > 0) {   // left foot first, then the right, each lifted on its way into the shoe
      const k = clamp(st.step * 2 - i), spot = SHOE_SPOTS[i].clone().add(V(0, 0.075, 0));
      a = vl(a, spot, sm(k)).add(V(0, 0.06 * Math.sin(Math.PI * k), 0));
    }
    if (st.walk > 0) {
      const psi = ph + (i ? Math.PI : 0), base = pel.clone().add(lat.clone().multiplyScalar(sx * 0.085)); base.y = 0.075;
      const w = Math.min(1, st.walk * 5);
      const wa = base.add(fwd.clone().multiplyScalar(0.15 * Math.sin(psi) * w)).add(V(0, 0.05 * Math.max(0, Math.cos(psi)) * w, 0));
      a = vl(a, wa, w);
    }
    return a;
  });
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    const hip = torso.localToWorld(V(sx * 0.085, 0.02, 0.0)); hip.y = Math.max(hip.y, 0.6);
    const pole = fwd.clone().multiplyScalar(0.8).add(upv.clone().multiplyScalar(1 - 0.75 * st.up)).add(lat.clone().multiplyScalar(sx * 0.15));
    const r = ik(hip, ankles[i], 0.4, 0.43, pole);
    const [th, sh, hi, kn, an] = i === 0 ? [limbs.thL, limbs.shL, J.hiL, J.knL, J.anL] : [limbs.thR, limbs.shR, J.hiR, J.knR, J.anR];
    hi.position.copy(hip); kn.position.copy(r.mid); an.position.copy(r.end);
    setLimb(th, hip, r.mid); setLimb(sh, r.mid, r.end);
    feet[i].position.copy(r.end).add(fwd.clone().multiplyScalar(0.045)); feet[i].position.y = r.end.y - 0.047; feet[i].rotation.set(0, P.yaw + sx * -0.1 * (1 - st.up), 0);
    footBlobs[i].position.set(feet[i].position.x, 0.013, feet[i].position.z); footBlobs[i].material.opacity = 0.6 * (1 - Math.min(1, (r.end.y - 0.075) * 12));
  }
  // ---- hands
  const restL = V(-0.14, DESK_Y + 0.045, 0.24), restR = V(0.24, DESK_Y + 0.045, 0.22);
  const tapR = PHONE_DESK.clone().add(V(0.0, 0.03 + 0.012 * (1 - Math.sin(Math.PI * remap(t, T.tapTry - 0.1, T.tapTry + 0.15))), 0.02));
  let hR = vl(restR, tapR, 0.0 * sm(remap(t, T.tapTry - 0.45, T.tapTry - 0.1)));   // no reach: the arm would hide the lock
  let hL = restL.clone();
  // S3: the phone in the right hand, thumb taps the tiles
  const PH = V(0.12, 0.9, 0.36);
  const hold = sm(remap(t, S.s3 - 0.4, S.s3 - 0.05)) * (t < S.s4 ? 1 : 0);   // the hand stays on the phone until the cut
  const inHand = t >= S.s3 && t < S.s4;   // the phone changes place only on cuts
  const thumb = [T.tile1, T.tile2, T.tile3, T.choose].reduce((s, a) => s + Math.max(0, Math.sin(Math.PI * remap(t, a - 0.1, a + 0.1))), 0);
  hR = vl(hR, PH.clone().add(V(0.0, -0.035 - 0.006 * thumb, 0.03)), hold);
  // standing: arms hang and swing; lacing: hands to the shoes
  const hang = sx => (sx < 0 ? shL : shR).clone().add(V(0, -0.47, 0)).add(fwd.clone().multiplyScalar(0.05)).add(lat.clone().multiplyScalar(sx * 0.06));
  const sw = sx => fwd.clone().multiplyScalar(0.1 * Math.sin(ph + (sx < 0 ? Math.PI : 0)) * Math.min(1, st.walk * 5));
  const standK = sm(remap(t, T.standA + 0.2, T.standB));
  hL = vl(hL, hang(-1).add(sw(-1)), standK); hR = vl(hR, hang(1).add(sw(1)), standK * (1 - hold));
  if (st.lace > 0) { const sh = (i, dx) => SHOE_SPOTS[i].clone().add(V(0.02 + dx, 0.12, 0)); hL = vl(hL, sh(0, 0.0), st.lace); hR = vl(hR, sh(1, 0.01 * Math.sin(t * 18)), st.lace); }
  const poleL = V(-0.8, -0.5, 0.6), poleR = V(0.8, -0.5, 0.6);
  const aL = ik(shL, hL, 0.25, 0.235, standK > 0.5 ? lat.clone().multiplyScalar(-0.6).add(V(0, -0.3, 0)).sub(fwd.clone().multiplyScalar(0.5)) : poleL);
  const aR = ik(shR, hR, 0.25, 0.235, standK > 0.5 ? lat.clone().multiplyScalar(0.6).add(V(0, -0.3, 0)).sub(fwd.clone().multiplyScalar(0.5)) : poleR);
  J.shL.position.copy(shL); J.shR.position.copy(shR); J.elL.position.copy(aL.mid); J.elR.position.copy(aR.mid);
  J.haL.position.copy(aL.end); J.haR.position.copy(aR.end);
  setLimb(limbs.uaL, shL, aL.mid); setLimb(limbs.faL, aL.mid, aL.end); setLimb(limbs.uaR, shR, aR.mid); setLimb(limbs.faR, aR.mid, aR.end);
  J.haL.lookAt(aL.mid); J.haR.lookAt(aR.mid);
  // ---- phone: on the desk, in the hand during S3
  if (inHand) { phone.position.copy(aR.end).add(V(0.0, 0.085, -0.065)); phone.rotation.set(0.75, -0.25, 0, 'YXZ'); phoneBlob.material.opacity = 0; }
  else { phone.position.copy(PHONE_DESK); phone.rotation.set(0, 0.25, 0); phoneBlob.position.set(PHONE_DESK.x, DESK_Y + 0.002, PHONE_DESK.z); phoneBlob.material.opacity = 0.4; }
  // ---- shoes: on the floor, then on the feet
  shoes.forEach((s, i) => {
    const on = st.step > 0 && clamp(st.step * 2 - i) >= 0.98;
    if (on) { s.position.copy(feet[i].position).add(V(0, -0.028, 0)); s.rotation.copy(feet[i].rotation); }
    else { s.position.copy(SHOE_SPOTS[i]); s.rotation.set(0, YAW_WALK, 0); }
    shoeBlobs[i].position.set(s.position.x, 0.012, s.position.z); shoeBlobs[i].rotation.z = s.rotation.y; shoeBlobs[i].material.opacity = 0.45 * (1 - Math.min(1, s.position.y * 12));
  });
  feet.forEach((f, i) => { f.visible = !(st.step > 0 && clamp(st.step * 2 - i) >= 0.98); });
  // ---- headphones pop on when the podcast unlocks
  const hp = eout(remap(t, T.unlock + 0.05, T.unlock + 0.4)); phonesG.visible = hp > 0.01; phonesG.scale.setScalar(Math.max(0.01, lerp(1.25, 1, hp)));
}

function setProps(t) {
  notebook.position.set(-0.36, DESK_Y + NB.h / 2 + 0.001, 0.06); notebook.rotation.set(0, -0.1, 0); coverPivot.rotation.z = 0; notebook.updateMatrixWorld(true);
  nbBlob.position.set(-0.34, DESK_Y + 0.003, 0.08); nbBlob.material.opacity = 0.55;
  ink.forEach(ln => { ln.visible = false; });
  pencil.position.set(-0.2, DESK_Y + 0.006, 0.18); pencil.rotation.set(Math.PI / 2, 0, 1.2);
  drawPhone(t);
}

function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  const v = sm(remap(t, T.cardIn, T.cardIn + 0.35)) * (1 - sm(remap(t, T.cardOut - 0.3, T.cardOut)));
  card.visible = v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0);
  card.scale.setScalar(0.9 * lerp(0.85, 1, sm(remap(t, T.cardIn, T.cardIn + 0.35))));
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v * 0.95; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
  // status: S1 beside the phone; S4 beside the performer's head
  const s1v = sm(remap(t, T.tag, T.tag + 0.3)) * (1 - sm(remap(t, S.s2 - 0.25, S.s2 - 0.02)));
  const s4v = sm(remap(t, T.ruleIn, T.ruleIn + 0.35)) * (1 - sm(remap(t, T.laceA + 0.05, T.laceA + 0.35)));   // gone before the lace-up bend
  const sv = Math.max(s1v, s4v);
  status.visible = sv > 0.003;
  if (status.visible) {
    if (t < S.s2) { status.position.copy(PHONE_DESK).add(V(-0.06, 0.035, -0.095)); status.scale.setScalar(0.22 * lerp(0.85, 1, s1v)); }
    else { const hp = head.getWorldPosition(V(0, 0, 0)), cr = V(1, 0, 0).applyQuaternion(camera.quaternion); status.position.copy(hp).add(cr.multiplyScalar(0.41)).add(V(0, -0.02, 0)); status.scale.setScalar(1.25 * lerp(0.85, 1, s4v) * (1 + 0.1 * Math.sin(Math.PI * remap(t, T.unlock, T.unlock + 0.5)))); }
    status.quaternion.copy(camera.quaternion);
    status.userData.border.material.opacity = sv; status.userData.panel.material.opacity = sv * 0.95; statusTx.m.material.opacity = sv;
    drawStatus(t);
  }
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 high over the right shoulder onto the phone: the podcast gets a "walks only" lock
  { a: S.s1, b: S.s2, k0: [V(0.1, 0.79, 0.19), 26, 60, 0.88, 30], k1: [V(0.1, 0.79, 0.18), 22, 58, 0.78, 30] },
  // S2 rear-left medium: the bundle card, then the schematic study chart, beside the performer (slow push)
  { a: S.s2, b: S.s3, k0: [V(-0.24, 1.14, 0.3), -21, 9, 4.0, 30], k1: [V(-0.23, 1.13, 0.3), -17, 8, 3.7, 30] },
  // S3 close over the right shoulder onto the phone in the hand: pick one treat
  { a: S.s3, b: S.s4, k0: [V(0.12, 0.97, 0.3), 26, 50, 0.85, 30], k1: [V(0.12, 0.97, 0.3), 21, 48, 0.76, 30] },
  // S4 front-right three-quarter: stands, steps into the walking shoes, the podcast unlocks, laces up
  { a: S.s4, b: S.s5, k0: [V(0.42, 0.9, 0.7), 56, 12, 5.65, 30], k1: [V(0.46, 0.9, 0.7), 48, 12, 5.45, 30] },
  // S5 wide calm room (accepted staging): the walk begins, lock-up
  { a: S.s5, b: S.end, k0: [V(0.8, 1.25, 0.55), 8, 14, 7.0, 30], k1: [V(0.95, 1.32, 0.55), 11, 16, 8.0, 30] },
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
  // crucial in-scene text: the card, the status card and the phone screen, each audited on its own
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const big = b => (b[2] - b[0]) * (b[3] - b[1]) > 40000;
  const keep = b => (onScreen(b) && big(b) ? b : null);
  const r = { t, card: null, crucial: { card: card.visible ? keep(textBox(card)) : null, status: status.visible ? keep(textBox(status)) : null, phone: keep(screenBoxOriented(phoneScr)) },
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
const P1 = PS('study')[0][1], P2 = SPL('study'), W_WENT = TL.study.start + 4.13;
const CAPS = [
  { a: -1, b: TL.name.start - 0.12, size: C2, lines: [[sg('New rule:')], [sg(`this podcast only plays on ${hl('walks')}.`, hookSplit - 0.05)]] },
  { a: TL.name.start - 0.06, b: nameSplit - 0.12, size: C2, lines: [[sg('It’s called')], [sg(`${hl('temptation bundling')}:`)]] },
  { a: nameSplit - 0.06, b: TL.study.start - 0.12, size: C2, lines: [[sg(`pair something you ${hl('want')}`)], [sg(`with something you keep ${hl('putting off')}.`, TL.name.start + 3.0)]] },
  { a: TL.study.start - 0.06, b: P1 - 0.12, size: C1, lines: [[sg('In a gym study,')]] },
  { a: P1 - 0.06, b: W_WENT - 0.12, size: C2, lines: [[sg('people who saved page-turner')], [sg('audiobooks for workouts')]] },
  { a: W_WENT - 0.06, b: TL.pick.start - 0.12, size: C2, lines: [[sg(`went ${hl('more often')},`)], [sg('though the boost faded.', P2 - 0.04)]] },
  { a: TL.pick.start - 0.06, b: TL.rule.start - 0.12, size: C2, lines: [[sg(`Pick ${hl('one treat')}:`)], [sg('a show,', T.tile1 - 0.04), sg(' a playlist,', T.tile2 - 0.04), sg(' a podcast.', T.tile3 - 0.04)]] },
  { a: TL.rule.start - 0.06, b: TL.close.start - 0.12, size: C2, lines: [[sg('Then set the rule:'), sg(' it only plays', ruleSplit - 0.04)], [sg(`when your ${hl('walking shoes')} are on.`, ruleSplit + 0.55)]] },
  { a: TL.close.start - 0.06, b: TL.cta.start - 0.2, size: C2, lines: [[sg('Want the next episode?')], [sg(`${hl('Lace up.')}`, closeSplit - 0.04)]] },
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
phoneKey = ''; cardTx.key = ''; statusTx.key = '';
renderAt(0);
window.ready = true;
