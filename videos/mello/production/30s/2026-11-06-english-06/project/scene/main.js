// Mello 30 s english06-01 (English): "the beautiful mess effect" - owning a small mistake at work (Bruk, Scholl & Bless 2018;
// Bruk, Scholl & Bless 2022). Same accepted style recipe and renderer as feedback-01 / round02-01 and the Hindi episodes
// ("Thoughts in a Quiet Room": sparse clean 3D miniature, one abstract faceless performer, soft contact shadows, white/pale-gray
// stage, lavender #D9BCF5 only as the highlight; English captions in Instrument Serif). Room, desk props, rig, camera helper,
// caption mechanics and the oriented-box safe-zone audit are carried over from ../../2026-11-05-feedback-05/project/scene/main.js.
// New for this episode: a laptop with a stylised mail screen (the wrong file sent to the team, then a one-line correction), the
// accepted navy thought card ("They'll think I'm careless.") turning into a schematic two-slider comparison, and a colleague
// (the hindi-03 faceless room-mate figure) at a second desk who receives the correction while busy with their own work.
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
const hookSplit = SPL('hook'), fearSplit = SPL('fear'), studySplit = SPL('study'), ownSplit = SPL('own'), askSplit = SPL('ask'), qSplit = SPL('question');
// word starts measured with faster-whisper word timestamps on generated/narration.wav (see notes): "mistake" 2.71,
// "someone else" 8.60, "more kindly" 10.10, "beautiful" 13.63, "send the fix" 17.43, "owned" 21.41
const W_MORE = TL.study.start + 3.35, W_THEMSELVES = TL.study.start + 4.41;
const S = { s1: 0.0, s2: 3.7, s3: 15.3, s4: 18.55, s5: 25.75, end: 30.0 };
const T = {
  send: 0.5,                                   // "you hit send": click
  spot: 2.35,                                  // "then you spot the mistake": ring on the OLD file
  hands: 2.8,                                  // head in hands
  slabIn: TL.fear.start - 0.1,                 // "owning it feels like proof that you're careless": navy inner-critic card
  morph: TL.study.start - 0.05,                // "but in studies": the card turns into the comparison
  rowSelf: TL.study.start + 0.3, rowOther: TL.study.start + 1.75,
  knobOther: W_MORE - 0.05, knobSelf: W_THEMSELVES - 0.05,
  title: TL.name.start + 0.95,                 // "the beautiful mess effect"
  cardOut: S.s3 - 0.1,
  typeA: S.s3 + 0.25, typeB: ownSplit - 0.25,  // "so own it in one plain line": typing the correction
  attach: ownSplit - 0.1, send2: TL.own.end - 0.7,   // "and send the fix"
  arrive: S.s4 + 0.3, open: S.s4 + 0.85,       // the colleague's screen: the correction arrives and is opened
  nod: TL.question.start + 0.55,               // "if a colleague owned this mistake": a small nod
  replyA: qSplit - 0.1, replyB: TL.question.end - 0.3, replySent: TL.question.end,
  back: TL.question.end + 0.6,                 // back to their own work
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


// ---------------------------------------------------------------- episode props: laptops with mail screens, second desk, colleague, card
const lavender = new THREE.Color('#D9BCF5');
const INK = '#17122E', NAVY = '#1C1733', CREAM = '#F6F1E6', WARM = '#E08A4F', WARM_HL = '#F4C79C';
const UI = '"Inter", sans-serif', SERIF = '"Instrument Serif", serif';

// laptop with a canvas screen (stylised mail app, original illustration)
function makeLaptop(cw = 1240, ch = 760) {
  const g = new THREE.Group();
  g.add(mesh(new RoundedBoxGeometry(0.38, 0.014, 0.25, 2, 0.004), M.lamp));
  const kb = mesh(new THREE.PlaneGeometry(0.33, 0.12), std('#E9E6EE', 0.8), false, true); kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.0075, -0.02); g.add(kb);
  const pad = mesh(new THREE.PlaneGeometry(0.11, 0.06), std('#EFECF2', 0.6), false, true); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.0076, 0.085); g.add(pad);
  const lid = new THREE.Group(); lid.position.set(0, 0.007, -0.125); g.add(lid);
  const lidM = mesh(new RoundedBoxGeometry(0.38, 0.245, 0.009, 2, 0.004), M.lamp); lidM.position.y = 0.1225; lid.add(lidM);
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.2145), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  scr.position.set(0, 0.1225, 0.0052); lid.add(scr);
  lid.rotation.x = -0.3;
  scene.add(g);
  return { g, lid, scr, c, ctx: c.getContext('2d'), tex, key: '' };
}
const LAP = makeLaptop();
LAP.g.position.set(0.0, DESK_Y, 0.1);
blob(0.5, 0.36, 0.45, DESK_Y + 0.002).position.set(0.0, DESK_Y + 0.002, 0.08);
// the accepted notebook and pencil rest on the left of the desk, closed
const NB_REST = V(-0.4, DESK_Y + NB.h / 2 + 0.001, 0.08);

// second desk (birch, as the accepted desk) for a colleague, to the performer's right
const DESK2 = V(1.27, 0, 0.42);
{ const top = mesh(new RoundedBoxGeometry(0.62, 0.045, 1.0, 3, 0.014), M.desk); top.position.set(DESK2.x, DESK_Y - 0.0225, DESK2.z); scene.add(top);
  for (const [dx, dz] of [[-0.27, -0.46], [0.27, -0.46], [-0.27, 0.46], [0.27, 0.46]]) {
    const l = mesh(new THREE.CylinderGeometry(0.018, 0.015, DESK_Y - 0.045, 16), M.leg); l.position.set(DESK2.x + dx, (DESK_Y - 0.045) / 2, DESK2.z + dz); scene.add(l);
    blob(0.16, 0.16, 0.6).position.set(DESK2.x + dx, 0.013, DESK2.z + dz);
  }
  blob(0.9, 1.4, 0.26).position.set(DESK2.x, 0.013, DESK2.z); }
const LAP2 = makeLaptop();
LAP2.g.position.set(DESK2.x - 0.04, DESK_Y, DESK2.z); LAP2.g.rotation.y = Math.PI / 2;   // screen faces +x, toward the colleague
blob(0.36, 0.5, 0.45, DESK_Y + 0.002).position.set(DESK2.x - 0.04, DESK_Y + 0.002, DESK2.z);
const cup2 = new THREE.Group();
cup2.add(mesh(new THREE.CylinderGeometry(0.036, 0.032, 0.085, 28), M.mug));
{ const h = mesh(new THREE.TorusGeometry(0.022, 0.007, 8, 20), M.mug); h.position.x = 0.04; cup2.add(h); }
cup2.position.set(DESK2.x + 0.14, DESK_Y + 0.0425, DESK2.z + 0.4); scene.add(cup2);
blob(0.14, 0.14, 0.45, DESK_Y + 0.002).position.set(DESK2.x + 0.14, DESK_Y + 0.002, DESK2.z + 0.4);

// colleague: the hindi-03 faceless room-mate figure (lighter lilac-gray; the accepted performer stays the only slate figure)
const PERSON = { body: '#BEB9CC', hair: '#8D87A6' };
function personLimb(parent, mat, r0, r1) { const m = mesh(new THREE.CylinderGeometry(r1, r0, 1, 16, 1, true), mat); parent.add(m); return m; }
function personJoint(parent, mat, r) { const m = mesh(new THREE.SphereGeometry(r, 16, 12), mat); parent.add(m); return m; }
function setSeg(m, a, b) { const d = b.clone().sub(a), len = d.length(); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); m.scale.set(1, len, 1); }
function makePerson(pos, yaw) {
  const g = new THREE.Group(); g.position.copy(pos); g.rotation.y = yaw; scene.add(g);
  const mat = std(PERSON.body, 0.82), hairM = std(PERSON.hair, 0.88), hipY = 0.64;
  const body = new THREE.Group(); body.position.y = hipY; g.add(body);
  const torsoM = mesh(new THREE.CapsuleGeometry(0.112, 0.2, 8, 24), mat); torsoM.scale.set(1.12, 1, 0.82); torsoM.position.y = 0.2; body.add(torsoM);
  const neckM = mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.1, 14), mat); neckM.position.y = 0.43; body.add(neckM);
  const headG = new THREE.Group(); headG.position.y = 0.55; body.add(headG);
  const sk = mesh(new THREE.SphereGeometry(0.1, 32, 22), mat); sk.scale.set(0.94, 1.1, 1.0); headG.add(sk);
  const hr = mesh(new THREE.SphereGeometry(0.105, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.5), hairM); hr.scale.set(0.95, 1.1, 1.02); hr.rotation.x = 0.7; hr.position.set(0, 0.008, 0.006); headG.add(hr);
  const arms = [-1, 1].map(sx => ({ sx, ua: personLimb(body, mat, 0.038, 0.034), fa: personLimb(body, mat, 0.033, 0.029),
    sh: personJoint(body, mat, 0.041), el: personJoint(body, mat, 0.034), ha: personJoint(body, mat, 0.037) }));
  for (const sx of [-1, 1]) {
    const hip = V(sx * 0.08, hipY + 0.02, 0), knee = V(sx * 0.1, hipY - 0.02, -0.38), ank = V(sx * 0.11, 0.075, -0.42);
    const th = personLimb(g, mat, 0.056, 0.048), sh = personLimb(g, mat, 0.046, 0.038);
    setSeg(th, hip, knee); setSeg(sh, knee, ank);
    personJoint(g, mat, 0.058).position.copy(hip); personJoint(g, mat, 0.048).position.copy(knee); personJoint(g, mat, 0.038).position.copy(ank);
    const ft = mesh(new RoundedBoxGeometry(0.082, 0.05, 0.155, 3, 0.022), mat); ft.position.set(ank.x, 0.028, ank.z - 0.045); g.add(ft);
  }
  blob(0.62, 0.62, 0.5).position.set(pos.x, 0.013, pos.z);
  const st = new THREE.Group();
  const s1 = mesh(new THREE.CylinderGeometry(0.17, 0.16, 0.05, 36), M.stool); s1.position.y = 0.535; st.add(s1);
  const s2 = mesh(new THREE.CylinderGeometry(0.023, 0.028, 0.5, 14), M.stool); s2.position.y = 0.25; st.add(s2);
  const s3 = mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.02, 28), M.stool); s3.position.y = 0.01; st.add(s3);
  st.position.set(pos.x, 0, pos.z); scene.add(st);
  return { g, body, headG, arms, hipY };
}
const MATE = makePerson(V(DESK2.x + 0.5, 0, DESK2.z), Math.PI / 2);   // faces -x, toward the second laptop

// ---------------------------------------------------------------- screens (stylised mail app; drawn per frame, cached by state)
function rr(g, x, y, w, h, r, fill, stroke, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function docIcon(g, x, y, s, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 0.62, y); g.lineTo(x + s * 0.82, y + s * 0.2); g.lineTo(x + s * 0.82, y + s); g.lineTo(x, y + s); g.closePath(); g.fill(); }
function chip(g, x, y, parts, hlIdx, hlCol, ring = 0) {   // attachment chip: [text, text, text], one part highlighted
  g.font = `500 58px ${UI}`; const ws = parts.map(p => g.measureText(p).width), w = ws.reduce((a, b) => a + b, 0) + 150;
  rr(g, x, y, w, 116, 26, '#F3EFFA', '#CFC6E3', 3);
  docIcon(g, x + 32, y + 26, 64, '#B9AFD3');
  let cx = x + 112;
  parts.forEach((p, i) => { if (i === hlIdx && hlCol) { rr(g, cx - 8, y + 20, ws[i] + 16, 76, 12, hlCol); } g.fillStyle = '#2A2440'; g.fillText(p, cx, y + 60); cx += ws[i]; });
  if (ring > 0) { g.globalAlpha = Math.min(1, ring); rr(g, x - 14 - 8 * ring, y - 14 - 8 * ring, w + 28 + 16 * ring, 144 + 16 * ring, 38, null, WARM, 10); g.globalAlpha = 1; }
  return w;
}
function check(g, x, y, s, col) { g.strokeStyle = col; g.lineWidth = s * 0.16; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 0.35, y + s * 0.35); g.lineTo(x + s, y - s * 0.4); g.stroke(); }
function toast(g, x, y, text, a) {   // navy pill with cream text and a drawn check mark
  if (a <= 0) return; g.globalAlpha = a; g.font = `600 54px ${UI}`; const tw = g.measureText(text).width, w = tw + 150;
  rr(g, x - w / 2, y, w, 104, 52, NAVY); g.fillStyle = CREAM; g.fillText(text, x - w / 2 + 50, y + 54); check(g, x - w / 2 + 50 + tw + 22, y + 54, 36, '#D9BCF5'); g.globalAlpha = 1; }
function mailFrame(g, cw, ch, title) {
  g.fillStyle = '#FBFAFD'; g.fillRect(0, 0, cw, ch);
  g.fillStyle = '#EEE8F8'; g.fillRect(0, 0, cw, 86);
  ['#E8B7B0', '#EED9A6', '#BFD9C4'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(40 + i * 34, 43, 11, 0, Math.PI * 2); g.fill(); });
  g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#2A2440'; g.font = `600 44px ${UI}`; g.fillText(title, 160, 45);
}
function drawMail(t) {
  const L = LAP, g = L.ctx, cw = L.c.width, ch = L.c.height;
  const second = t >= S.s3 - 0.05;
  const press = second ? Math.sin(Math.PI * remap(t, T.send2 - 0.05, T.send2 + 0.2)) : Math.sin(Math.PI * remap(t, T.send - 0.05, T.send + 0.2));
  const ts = second ? T.send2 : T.send;
  const gone = sm(remap(t, ts + 0.08, ts + 0.18)), sent = sm(remap(t, ts + 0.18, ts + 0.42));   // the button leaves before the toast arrives
  const ring = second ? 0 : sm(remap(t, T.spot, T.spot + 0.25)) * (0.75 + 0.25 * Math.sin(Math.max(0, t - T.spot) * 9));
  const hlOld = second ? 0 : sm(remap(t, T.spot - 0.1, T.spot + 0.15));
  const typed = second ? Math.floor(40 * clamp(remap(t, T.typeA, T.typeB))) : 0;
  const att = second ? sm(remap(t, T.attach, T.attach + 0.25)) : 1;
  const blink = second && typed > 0 && typed < 40 && Math.floor(t * 4) % 2 === 0;
  const key = [second, press, gone, sent, ring, hlOld, typed, att, blink].map(x => (typeof x === 'number' ? x.toFixed(2) : x)).join('|');
  if (key === L.key) return; L.key = key;
  mailFrame(g, cw, ch, second ? 'Reply' : 'New message');
  g.font = `500 54px ${UI}`; g.fillStyle = '#8E88A6'; g.fillText('To:', 40, 160);
  rr(g, 130, 120, 310, 80, 40, '#E7DAF8'); g.fillStyle = '#2A2440'; g.fillText('Team (12)', 160, 161);
  g.fillStyle = '#8E88A6'; g.fillText('Subject:', 40, 256); g.fillStyle = '#2A2440'; g.fillText(second ? 'Re: Q3 report' : 'Q3 report', 270, 256);
  g.fillStyle = '#E4DFEE'; g.fillRect(40, 306, cw - 80, 3);
  if (!second) { [[356, 900], [400, 700]].forEach(([y, w]) => rr(g, 40, y - 11, w, 22, 11, '#DCD6E8')); }
  else {
    const full = ["Sorry, wrong file.", "Here's the right one."]; let n = typed; g.font = `500 56px ${UI}`; g.fillStyle = '#2A2440';
    let cx = 40, cy = 352;
    full.forEach((ln, i) => { const part = ln.slice(0, Math.max(0, n)); n -= ln.length + 1; const y = 352 + i * 64; g.fillText(part, 40, y); if (part.length) { cx = 40 + g.measureText(part).width; cy = y; } });
    if (blink) g.fillRect(cx + 6, cy - 30, 5, 60);
  }
  if (att > 0) { g.globalAlpha = att; if (second) chip(g, 40, 460, ['Q3_report_', 'FINAL', '.pdf'], 1, '#E7DAF8'); else chip(g, 40, 460, ['Q3_report_', 'OLD', '.pdf'], 1, hlOld > 0 ? WARM_HL : null, ring); g.globalAlpha = 1; }
  // send button -> "Sent" toast
  if (gone < 1) { const s = 1 - 0.06 * press; g.save(); g.globalAlpha = 1 - gone; g.translate(1050, 680); g.scale(s, s); rr(g, -140, -50, 280, 100, 50, press > 0.2 ? '#C7A4EE' : '#D9BCF5'); g.fillStyle = INK; g.font = `600 54px ${UI}`; g.textAlign = 'center'; g.fillText('Send', 0, 2); g.textAlign = 'left'; g.restore(); }
  toast(g, 860, 628, 'Sent to Team (12)', sent);
  L.tex.needsUpdate = true;
}
function drawInbox(t) {
  const L = LAP2, g = L.ctx, cw = L.c.width, ch = L.c.height;
  const arrive = eout(remap(t, T.arrive, T.arrive + 0.35)), open = sm(remap(t, T.open, T.open + 0.25)) * (1 - sm(remap(t, T.back, T.back + 0.3)));
  const own = clamp((t - S.s4 + 3) / 0.9, 0, 6) + (t > T.back ? clamp((t - T.back) / 0.9, 0, 2) : 0);
  const typed = Math.floor(20 * clamp(remap(t, T.replyA, T.replyB))), rsent = sm(remap(t, T.replySent, T.replySent + 0.25));
  const key = [arrive, open, own, typed, rsent].map(x => x.toFixed(2)).join('|'); if (key === L.key) return; L.key = key;
  mailFrame(g, cw, ch, 'Inbox');
  // left: message list
  g.fillStyle = '#F4F1F8'; g.fillRect(0, 86, 440, ch - 86);
  const items = [['Budget draft', '2 comments'], ['Client call', 'notes'], ['Q3 report', 'OLD.pdf']];
  const off = 140 * arrive;
  items.forEach(([a, b], i) => { const y = 120 + off + i * 140; if (y > ch) return; g.fillStyle = '#2A2440'; g.font = `600 46px ${UI}`; g.fillText(a, 34, y + 24); g.fillStyle = '#8E88A6'; g.font = `500 38px ${UI}`; g.fillText(b, 34, y + 76); g.fillStyle = '#E4DFEE'; g.fillRect(24, y + 116, 392, 2); });
  if (arrive > 0) { const y = 120 - 140 * (1 - arrive); g.globalAlpha = arrive; rr(g, 12, y - 12, 416, 132, 18, '#E7DAF8');
    g.fillStyle = '#8E6FD0'; g.beginPath(); g.arc(34, y + 24, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#17122E'; g.font = `600 46px ${UI}`; g.fillText('Re: Q3 report', 56, y + 24); g.fillStyle = '#4A4466'; g.font = `500 38px ${UI}`; g.fillText('Sorry, wrong file…', 56, y + 76); g.globalAlpha = 1; }
  // right: their own document, or the opened correction with a short reply
  const X = 480;
  if (open < 1) { g.globalAlpha = 1 - open; g.fillStyle = '#2A2440'; g.font = `600 52px ${UI}`; g.fillText('Budget plan', X, 160);
    for (let i = 0; i < 8; i++) { const w = [640, 560, 690, 520, 600, 660, 480, 610][i] * clamp(own - i); if (w > 0) rr(g, X, 236 + i * 62, w, 22, 11, '#DCD6E8'); } g.globalAlpha = 1; }
  if (open > 0) { g.globalAlpha = open;
    g.fillStyle = '#17122E'; g.font = `600 56px ${UI}`; g.fillText('Re: Q3 report', X, 160);
    g.fillStyle = '#2A2440'; g.font = `500 54px ${UI}`; g.fillText('Sorry, wrong file.', X, 250); g.fillText("Here's the right one.", X, 318);
    g.save(); g.translate(X, 372); g.scale(0.8, 0.8); chip(g, 0, 0, ['Q3_report_', 'FINAL', '.pdf'], 1, '#E7DAF8'); g.restore();
    if (typed > 0 || rsent > 0) { rr(g, X, 500, 720, 116, 26, '#FFFFFF', '#CFC6E3', 3); g.fillStyle = '#2A2440'; g.font = `500 54px ${UI}`; g.fillText('Thanks for flagging!'.slice(0, Math.max(typed, rsent > 0 ? 20 : 0)), X + 30, 560); }
    toast(g, X + 370, 640, 'Sent', rsent);
    g.globalAlpha = 1; }
  L.tex.needsUpdate = true;
}

// ---------------------------------------------------------------- the card: inner critic (navy, accepted) -> schematic comparison
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
const C_NAVY = new THREE.Color(NAVY), C_CREAM = new THREE.Color('#FBF8F0');
function drawCard(t) {
  const q = 1 - sm(remap(t, T.morph, T.morph + 0.45));                   // the quote (inner critic)
  const r1 = sm(remap(t, T.rowSelf, T.rowSelf + 0.35)), r2 = sm(remap(t, T.rowOther, T.rowOther + 0.35));
  const k2 = eio(remap(t, T.knobOther, T.knobOther + 0.6)), k1 = eio(remap(t, T.knobSelf, T.knobSelf + 0.6));
  const ti = sm(remap(t, T.title, T.title + 0.3));
  const key = [q, r1, r2, k1, k2, ti].map(x => x.toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle';
  if (q > 0) { g.globalAlpha = q; g.fillStyle = CREAM; g.font = `italic 400 156px ${SERIF}`; g.textAlign = 'center'; g.fillText('“They’ll think', 610, 270); g.fillText('I’m careless.”', 610, 440); g.textAlign = 'left'; g.globalAlpha = 1; }
  const row = (y, label, a, pos, knobCol) => {
    if (a <= 0) return; g.globalAlpha = a;
    g.fillStyle = INK; g.font = `400 108px ${SERIF}`; g.fillText(label, 44, y - 92);
    g.fillStyle = '#7F78A0'; g.font = `500 56px ${UI}`; g.fillText('harsher', 44, y + 4); g.textAlign = 'right'; g.fillText('kinder', 1180, y + 4); g.textAlign = 'left';
    const x0 = 280, x1 = 960; rr(g, x0, y - 8, x1 - x0, 16, 8, '#E2DCEB');
    const x = x0 + (x1 - x0) * pos; g.fillStyle = knobCol; g.beginPath(); g.arc(x, y, 38, 0, Math.PI * 2); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
    g.globalAlpha = 1;
  };
  row(360, 'Judging yourself', r1, lerp(0.5, 0.4, k1), '#7E7A9C');
  row(620, 'Judging someone else', r2, lerp(0.5, 0.62, k2), '#D9BCF5');
  if (ti > 0) { g.globalAlpha = ti; g.font = `400 92px ${SERIF}`; const w = g.measureText('the beautiful mess effect').width + 70; rr(g, 610 - w / 2, 22, w, 118, 30, '#D9BCF5');
    g.fillStyle = INK; g.textAlign = 'center'; g.fillText('the beautiful mess effect', 610, 84); g.textAlign = 'left'; g.globalAlpha = 1; }
  tex.needsUpdate = true;
}


// ---------------------------------------------------------------- choreography
const PELVIS = V(0, 0.64, 0.7);
const kbPt = (sx, dz = 0) => LAP.g.localToWorld(V(sx * 0.07, 0.045, 0.045 + dz));
const padPt = () => LAP.g.localToWorld(V(0.0, 0.04, 0.09));

function pose(t) {
  const P = {};
  P.breath = Math.sin(t * 2 * Math.PI / 4.2);
  // freeze at the mistake, sink into the hands, slowly look up at the card, lean in to type, lean back after sending
  P.lean = track(t, [[0, 0.2], [T.hands, 0.22], [T.hands + 0.45, 0.36], [T.morph, 0.36], [T.morph + 0.6, 0.16], [S.s3 - 0.2, 0.16], [S.s3 + 0.2, 0.24],
    [T.send2 + 0.3, 0.24], [T.send2 + 0.9, 0.08], [T.back - 0.4, 0.08], [T.back + 0.4, 0.22], [30, 0.22]]);
  P.headPitch = track(t, [[0, -0.42], [T.spot - 0.2, -0.42], [T.spot + 0.15, -0.5], [T.hands, -0.5], [T.hands + 0.45, -0.75], [T.morph, -0.75],
    [T.morph + 0.7, -0.1], [T.title + 0.6, -0.05], [S.s3 - 0.2, -0.05], [S.s3 + 0.2, -0.42], [T.send2 + 0.3, -0.42], [T.send2 + 0.9, -0.2],
    [T.back - 0.4, -0.2], [T.back + 0.4, -0.42], [30, -0.42]]);
  P.headYaw = track(t, [[0, 0], [T.morph, 0], [T.morph + 0.7, 0.32], [T.title + 0.6, 0.36], [S.s3 - 0.2, 0.36], [S.s3 + 0.2, 0], [30, 0]]);
  P.headRoll = 0;
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
  const typing = (sx, k) => kbPt(sx).add(V(0.006 * Math.sin(t * 23 + k), 0.008 * Math.abs(Math.sin(t * 17 + 2 * k)), 0));
  const restL = kbPt(-1, 0.1).add(V(-0.06, -0.005, 0.0)), restR = kbPt(1, 0.1).add(V(0.06, -0.005, 0.0));
  // head in hands: hands to the sides of the (lowered) head
  const hp = head.getWorldPosition(V(0, 0, 0));
  const right = V(1, 0, 0).applyQuaternion(torso.quaternion);
  const inHL = hp.clone().add(right.clone().multiplyScalar(-0.1)).add(V(0, -0.04, 0.05)), inHR = hp.clone().add(right.clone().multiplyScalar(0.1)).add(V(0, -0.04, 0.05));
  const hh = sm(remap(t, T.hands, T.hands + 0.45)) * (1 - sm(remap(t, T.morph - 0.1, T.morph + 0.5)));
  // right hand: send click -> keyboard -> head -> rest -> typing the correction -> click send -> rest -> typing again
  let hR = vl(padPt().add(V(0, 0.012 * (1 - Math.sin(Math.PI * remap(t, T.send - 0.12, T.send + 0.12))), 0)), restR, sm(remap(t, T.send + 0.3, T.send + 0.8)));
  let hL = restL.clone();
  if (t > S.s3 - 0.4) {
    const ty = sm(remap(t, S.s3 - 0.3, T.typeA)) * (1 - sm(remap(t, T.typeB, T.typeB + 0.2)));
    hL = vl(restL, typing(-1, 0), ty);
    hR = vl(restR, typing(1, 1.3), ty);
    const clickR = sm(remap(t, T.typeB, T.typeB + 0.25)) * (1 - sm(remap(t, T.send2 + 0.25, T.send2 + 0.55)));
    hR = vl(hR, padPt().add(V(0, 0.012 * (1 - Math.sin(Math.PI * remap(t, T.attach - 0.08, T.attach + 0.12))) * (t < T.send2 - 0.2 ? 1 : 0)
      + 0.012 * (1 - Math.sin(Math.PI * remap(t, T.send2 - 0.12, T.send2 + 0.12))) * (t >= T.send2 - 0.2 ? 1 : 0) - 0.006, 0)), clickR);
    const tw = sm(remap(t, T.back - 0.2, T.back + 0.4));   // back to work later
    hL = vl(hL, typing(-1, 0), tw); hR = vl(hR, typing(1, 1.3), tw);
  }
  hL = vl(hL, inHL, hh); hR = vl(hR, inHR, hh);
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

// colleague: busy with their own work; reads the correction, a small nod, a short reply, back to work
function setMate(t) {
  const p = MATE;
  const read = sm(remap(t, T.open - 0.2, T.open + 0.3)) * (1 - sm(remap(t, T.back, T.back + 0.4)));
  const nod = Math.sin(Math.PI * 2 * remap(t, T.nod, T.nod + 0.7)) * (t > T.nod && t < T.nod + 0.7 ? 1 : 0);
  p.headG.rotation.set(-0.38 + 0.06 * read + 0.13 * nod + 0.02 * Math.sin(t * 1.3), 0.05 * Math.sin(t * 0.7), 0, 'YXZ');
  p.body.rotation.x = -0.05 * read;
  p.body.scale.y = 1 + 0.008 * Math.sin(t * 1.5 + 1.7);
  p.body.updateMatrixWorld(true);
  const typingNow = !(t > T.open - 0.2 && t < T.replyA) && !(t > T.replySent && t < T.back + 0.2);
  p.arms.forEach((a, k) => {
    let tgt = V(a.sx * 0.085, 0.14, -0.43);
    if (typingNow) tgt = tgt.clone().add(V(0.004 * Math.sin(t * 21 + k * 2), 0.009 * Math.abs(Math.sin(t * 15 + k * 1.7)), 0));
    else tgt = tgt.clone().add(V(0, 0.0, 0.03));
    const sh = V(a.sx * 0.145, 0.31, 0);
    const r = ik(sh, tgt, 0.24, 0.225, V(a.sx * 0.6, -0.8, 0.3));
    a.sh.position.copy(sh); a.el.position.copy(r.mid); a.ha.position.copy(r.end);
    setSeg(a.ua, sh, r.mid); setSeg(a.fa, r.mid, r.end);
  });
}

function setProps(t) {
  notebook.position.copy(NB_REST); notebook.rotation.set(0, -0.1, 0); coverPivot.rotation.z = 0; notebook.updateMatrixWorld(true);
  nbBlob.position.set(NB_REST.x + 0.02, DESK_Y + 0.003, NB_REST.z + 0.02); nbBlob.material.opacity = 0.55;
  ink.forEach(ln => { ln.visible = false; });
  pencil.position.set(-0.22, DESK_Y + 0.006, 0.26); pencil.rotation.set(Math.PI / 2, 0, 1.2);
  drawMail(t); drawInbox(t);
}

function setEpisode(t) {
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  const v = sm(remap(t, T.slabIn, T.slabIn + 0.35)) * (1 - sm(remap(t, T.cardOut - 0.3, T.cardOut)));
  card.visible = v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0);
  card.scale.setScalar(0.9 * lerp(0.85, 1, sm(remap(t, T.slabIn, T.slabIn + 0.35))));
  const m = sm(remap(t, T.morph, T.morph + 0.45));
  card.userData.panel.material.color.copy(C_NAVY).lerp(C_CREAM, m);
  card.userData.border.material.opacity = v * m; card.userData.panel.material.opacity = v * lerp(1, 0.95, m); cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 over the right shoulder onto the laptop: the wrong file goes to the whole team
  { a: S.s1, b: S.s2, k0: [V(0.07, 0.9, 0.04), 30, 28, 1.65, 30], k1: [V(0.07, 0.89, 0.04), 27, 27, 1.5, 30] },
  // S2 rear-left medium: the inner critic, then the comparison, beside the performer (slow push)
  { a: S.s2, b: S.s3, k0: [V(-0.24, 1.14, 0.3), -21, 9, 4.0, 30], k1: [V(-0.23, 1.13, 0.3), -17, 8, 3.7, 30] },
  // S3 steep right three-quarter onto the keyboard and screen: one plain line, send the fix
  { a: S.s3, b: S.s4, k0: [V(0.08, 0.99, 0.06), 32, 44, 1.5, 30], k1: [V(0.08, 0.99, 0.06), 27, 42, 1.36, 30] },
  // S4 behind the colleague at the second desk: their own work, the correction arrives, a nod, a short reply
  { a: S.s4, b: S.s5, k0: [V(1.18, 0.96, 0.44), 58, 49, 1.75, 30], k1: [V(1.18, 0.96, 0.44), 54, 47, 1.6, 30] },
  // S5 wide calm room (accepted staging), both desks, lock-up
  { a: S.s5, b: S.end, k0: [V(0.7, 0.98, 0.25), 6, 15, 7.0, 30], k1: [V(0.68, 1.1, 0.2), 9, 18, 8.6, 30] },
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
  // "card" = crucial in-scene text: the thought/comparison card and the two laptop screens (stylised mail text)
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const big = b => (b[2] - b[0]) * (b[3] - b[1]) > 40000;   // ignore screens that are only distant specks in the frame
  const keep = b => (onScreen(b) && big(b) ? b : null);
  const r = { t, card: null, crucial: { card: card.visible ? keep(textBox(card)) : null, screen1: keep(screenBoxOriented(LAP.scr)), screen2: keep(screenBoxOriented(LAP2.scr)) },
    cardBox: card.visible ? textBox(card) : null, screen1: screenBoxOriented(LAP.scr), screen2: screenBoxOriented(LAP2.scr),
    head: sphereBox(head, 0.12), mateHead: sphereBox(MATE.headG, 0.12), desk: screenBox(deskTop) };
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
const CAPS = [
  { a: -1, b: TL.fear.start - 0.12, size: C2, lines: [[sg('You hit send to the whole team…')], [sg(`then you spot the ${hl('mistake')}.`, hookSplit - 0.05)]] },
  { a: TL.fear.start - 0.06, b: TL.study.start - 0.12, size: C2, lines: [[sg('Owning it feels like')], [sg(`${hl('proof')} that you’re careless.`)]] },
  { a: TL.study.start - 0.06, b: W_MORE - 0.12, size: C2, lines: [[sg('But in studies, people judged')], [sg('someone else admitting a mistake', studySplit + 0.55)]] },
  { a: W_MORE - 0.06, b: TL.name.start - 0.12, size: C1, lines: [[sg(`${hl('more kindly')} than themselves.`)]] },
  { a: TL.name.start - 0.06, b: TL.own.start - 0.12, size: C2, lines: [[sg('Researchers call it the')], [sg(`${hl('beautiful mess effect')}.`)]] },
  { a: TL.own.start - 0.06, b: TL.ask.start - 0.12, size: C2, lines: [[sg(`So ${hl('own it')} in one plain line,`)], [sg('and send the fix.', ownSplit - 0.04)]] },
  { a: TL.ask.start - 0.06, b: TL.question.start - 0.12, size: C1, lines: [[sg('Still feels huge?'), sg(' Ask:', askSplit - 0.04)]] },
  { a: TL.question.start - 0.06, b: TL.cta.start - 0.2, size: C2, lines: [[sg('If a colleague owned this mistake,')], [sg(`what would I ${hl('think of them')}?`, qSplit - 0.04)]] },
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
  setMate(t);
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
LAP.key = ''; LAP2.key = ''; cardTx.key = '';
renderAt(0);
window.ready = true;
