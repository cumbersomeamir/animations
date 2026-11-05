// Mello 30 s feedback05-01 (Hindi): "प्लानिंग फ़ैलेसी" - the planning fallacy (Kahneman & Tversky 1979; Buehler, Griffin & Ross 1994;
// Roy, Christenfeld & McKenzie 2005). Same accepted style recipe and renderer as feedback-01 / round02-01 / hindi03-01 / hindi04-01
// ("Thoughts in a Quiet Room": sparse clean 3D miniature, one abstract faceless performer, soft contact shadows, white/pale-gray
// stage, lavender #D9BCF5 only as the highlight). Room, desk props, rig, camera helper and Devanagari caption mechanics are carried
// over from ../../2026-11-04-hindi-04/project/scene/main.js. New for this episode: a flat desk clock that races through a full hour
// past a "10 मिनट" note (hook), a task sheet being written, a thought card (imagined vs actual), a time-log page in the notebook,
// and a calendar card where a one-hour block is set from the past record and the actual time is logged afterwards.
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
const hookSplit = SPL('hook'), nameSplit = SPL('name'), realSplit = SPL('real'), fixSplit = SPL('fix'), exSplit = SPL('example'), logSplit = SPL('log');
const S = { s1: 0.0, s2: 3.85, s3: 11.95, s4: 15.95, s5: 25.75, end: 30.0 };
const T = {
  hour: 2.9,                                                  // the clock completes a full hour on "ek ghanta nikal gaya"
  dream: nameSplit - 0.1, dreamEnd: TL.name.end + 0.15,       // "ham aane vaale kaam ko perfect sochte hain": looks up, imagining
  cardIn: nameSplit - 0.25, bar1A: nameSplit + 0.35, bar1B: TL.name.end - 0.35,
  real: TL.real.start,                                        // "par asal mein": the actual row
  buzz: TL.real.start + 0.4, mug: TL.real.start + 0.95, search: TL.real.start + 1.5, realDone: TL.real.end - 0.2,
  cardOut: S.s3 - 0.1,
  openA: S.s3 + 0.3, openB: S.s3 + 0.9,                       // the notebook (time log) opens
  point: fixSplit - 0.15, mark: fixSplit + 0.45,              // "pichhli baar ka asli samay dekhiye": pencil to the 55-minute row
  calIn: S.s4 + 0.15,
  blockA: exSplit + 0.15, blockB: TL.example.end - 0.5,       // "to calendar mein poora ek ghanta rakhiye"
  doneA: TL.log.start, doneB: logSplit - 0.05,                // "aur kaam ke baad": the hour block fills (the work happens)
  logA: logSplit + 0.05, logB: TL.log.end - 0.1,              // "asli samay likh lijiye": the actual time is written down
  calOut: S.s5 - 0.05,
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

// ---------------------------------------------------------------- episode props: desk clock, task sheet, phone, log page, cards, labels
const lavender = new THREE.Color('#D9BCF5');
const OVER = '#F0D2A6';        // warm "overrun" tone (echoes the ochre notebook); the plan itself stays lavender
const OVER_BAR = '#E9C18C';    // the same tone, one step deeper so it reads on the cream card
const INK = '#17122E';
const HIN = '"Tiro Devanagari Hindi", "Instrument Serif", serif';

// flat round desk clock, dial facing up so the steep cameras read it; 12 o'clock points away from the performer (-z)
const CLOCK_POS = V(-0.3, DESK_Y, -0.05), CLOCK_R = 0.095;
const clock = new THREE.Group();
{ const body = mesh(new THREE.CylinderGeometry(CLOCK_R + 0.014, CLOCK_R + 0.018, 0.03, 64), M.mug); body.position.y = 0.015; clock.add(body);
  const rim = mesh(new THREE.TorusGeometry(CLOCK_R + 0.012, 0.0055, 10, 72), std('#D9BCF5', 0.45, { emissive: lavender.clone(), emissiveIntensity: 0.15 }));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.031; clock.add(rim); }
const faceCanvas = document.createElement('canvas'); faceCanvas.width = faceCanvas.height = 512;
{ const g = faceCanvas.getContext('2d'); g.fillStyle = '#FCFBF8'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * Math.PI * 2, big = i % 5 === 0, r0 = big ? 200 : 222, r1 = 246;
    g.strokeStyle = big ? '#2A2440' : '#A9A4BC'; g.lineWidth = big ? 11 : 4; g.lineCap = 'round'; g.beginPath();
    g.moveTo(256 + Math.sin(a) * r0, 256 - Math.cos(a) * r0); g.lineTo(256 + Math.sin(a) * r1, 256 - Math.cos(a) * r1); g.stroke();
  } }
const faceTex = new THREE.CanvasTexture(faceCanvas); faceTex.colorSpace = THREE.SRGBColorSpace; faceTex.anisotropy = 8;
const cFace = new THREE.Mesh(new THREE.CircleGeometry(CLOCK_R, 64), new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.6 }));
cFace.rotation.x = -Math.PI / 2; cFace.position.y = 0.0305; cFace.receiveShadow = true; clock.add(cFace);
const wedgeMat = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.92, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
const planW = new THREE.Mesh(new THREE.CircleGeometry(CLOCK_R * 0.8, 8, 0, 0.001), wedgeMat('#D9BCF5'));
const overW = new THREE.Mesh(new THREE.CircleGeometry(CLOCK_R * 0.8, 8, 0, 0.001), wedgeMat(OVER));
for (const [w, y] of [[planW, 0.0312], [overW, 0.0313]]) { w.rotation.x = -Math.PI / 2; w.position.y = y; w.renderOrder = 2; clock.add(w); }
const handMat = std('#2A2440', 0.5);
const minHand = new THREE.Group(); minHand.position.y = 0.0335; clock.add(minHand);
{ const m = mesh(new THREE.BoxGeometry(0.007, 0.003, 0.084), handMat, true, false); m.position.z = -0.034; minHand.add(m); }
const hrHand = new THREE.Group(); hrHand.position.y = 0.0325; clock.add(hrHand);
{ const m = mesh(new THREE.BoxGeometry(0.01, 0.003, 0.05), handMat, true, false); m.position.z = -0.02; hrHand.add(m); }
{ const c = mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.007, 20), std('#D9BCF5', 0.4)); c.position.y = 0.036; clock.add(c); }
clock.position.copy(CLOCK_POS); scene.add(clock);
blob(0.34, 0.34, 0.5, DESK_Y + 0.002).position.set(CLOCK_POS.x, DESK_Y + 0.002, CLOCK_POS.z);
let wedgeKey = '';
function setClock(m) {
  minHand.rotation.y = -m / 60 * Math.PI * 2;
  hrHand.rotation.y = -(6 + m / 60) / 12 * Math.PI * 2;                 // 6:00 -> 7:00
  const key = m.toFixed(2); if (key === wedgeKey) return; wedgeKey = key;
  const th = m / 60 * Math.PI * 2, tp = Math.min(m, 10) / 60 * Math.PI * 2;
  planW.geometry.dispose(); planW.geometry = new THREE.CircleGeometry(CLOCK_R * 0.8, 24, Math.PI / 2 - tp, Math.max(tp, 0.0001));
  overW.geometry.dispose(); overW.geometry = new THREE.CircleGeometry(CLOCK_R * 0.8, 72, Math.PI / 2 - th, Math.max(th - tp, 0.0001));
  planW.visible = m > 0.05; overW.visible = m > 10.02;
}
const clockMin = t => 60 * (0.45 * clamp(t / T.hour) + 0.55 * sm(t / T.hour));   // moving from frame 0, a full hour by T.hour

// the task: a sheet being written at the front of the desk
const SHEET_POS = V(0.0, DESK_Y + 0.0016, 0.25);
const sheet = mesh(new RoundedBoxGeometry(0.15, 0.003, 0.2, 2, 0.0012), M.pages); sheet.position.copy(SHEET_POS); sheet.rotation.y = 0.12; scene.add(sheet);
blob(0.22, 0.27, 0.3, DESK_Y + 0.002).position.set(SHEET_POS.x, DESK_Y + 0.002, SHEET_POS.z);
const sheetInk = [];
for (let i = 0; i < 7; i++) {
  const ln = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.004), new THREE.MeshBasicMaterial({ color: '#4A4466', transparent: true, opacity: 0.85 }));
  ln.rotation.x = -Math.PI / 2; ln.position.set(-0.055, 0.0017, -0.075 + i * 0.024); ln.scale.x = 0.0001; sheet.add(ln); sheetInk.push(ln);
}
function writingTime(t) { let s = 0; for (const [a, b] of WRITE) s += clamp(t, a, b) - a; return s; }
const WRITE = [[-1, T.dream - 0.35], [T.dreamEnd + 0.35, T.buzz - 0.05], [T.search + 0.6, S.s3 + 0.25]];
const penDown = t => Math.max(...WRITE.map(([a, b]) => sm(remap(t, a, a + 0.2)) * (1 - sm(remap(t, b - 0.2, b)))));
const sheetLines = t => Math.min(6.98, 1.4 + writingTime(t) / 0.75);
function sheetPt(lines, h = 0.04) { const row = Math.floor(lines), u = lines - row; return sheet.localToWorld(V(-0.055 + 0.105 * u, h, -0.075 + row * 0.024)); }

// phone lying on the desk (an interruption: it buzzes)
const phone = new THREE.Group();
phone.add(mesh(new RoundedBoxGeometry(0.07, 0.008, 0.14, 2, 0.004), M.lead));
const screenMat = new THREE.MeshBasicMaterial({ color: '#2B2640', toneMapped: false });
const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.124), screenMat); screen.rotation.x = -Math.PI / 2; screen.position.y = 0.0045; phone.add(screen);
const notif = new THREE.Mesh(new THREE.PlaneGeometry(0.054, 0.024), new THREE.MeshBasicMaterial({ color: '#D9BCF5', transparent: true, opacity: 0, toneMapped: false }));
notif.rotation.x = -Math.PI / 2; notif.position.set(0, 0.0052, -0.04); phone.add(notif);
const PHONE_DESK = V(-0.23, DESK_Y + 0.004, 0.27);
phone.position.copy(PHONE_DESK); phone.rotation.y = 0.35; scene.add(phone);
blob(0.14, 0.2, 0.4, DESK_Y + 0.002).position.set(PHONE_DESK.x, DESK_Y + 0.002, PHONE_DESK.z);
const MUG0 = V(-0.38, DESK_Y + 0.0475, 0.15);
const mugBlob = blob(0.16, 0.16, 0.5, DESK_Y + 0.002);

// time-log page inside the notebook (visible once the cover opens)
const pageCanvas = document.createElement('canvas'); pageCanvas.width = 520; pageCanvas.height = 712;
const pageTex = new THREE.CanvasTexture(pageCanvas); pageTex.colorSpace = THREE.SRGBColorSpace; pageTex.anisotropy = 8;
const pageMesh = new THREE.Mesh(new THREE.PlaneGeometry(NB.w - 0.012, NB.d - 0.014), new THREE.MeshStandardMaterial({ map: pageTex, roughness: 0.92 }));
pageMesh.rotation.x = -Math.PI / 2; pageMesh.position.y = NB.h / 2 - 0.003 + 0.0007; pageMesh.receiveShadow = true; notebook.add(pageMesh);
let pageKey = '';
function drawPage(mark) {
  const key = mark.toFixed(2); if (key === pageKey) return; pageKey = key;
  const g = pageCanvas.getContext('2d'); g.fillStyle = '#FBF8F0'; g.fillRect(0, 0, 520, 712);
  g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillStyle = '#7F78A0'; g.font = `400 60px ${HIN}`; g.fillText('असली समय', 40, 84);
  g.fillStyle = '#D9BCF5'; g.fillRect(40, 126, 230, 7);
  [['सफ़ाई', '40 मिनट'], ['रिपोर्ट', '55 मिनट'], ['ईमेल', '25 मिनट']].forEach(([a, b], i) => {
    const y = 236 + i * 128;
    if (i === 1 && mark > 0) { g.fillStyle = 'rgba(217,188,245,0.95)'; g.beginPath(); g.roundRect(26, y - 54, Math.max(1, 468 * mark), 108, 28); g.fill(); }
    g.fillStyle = '#E2DCCF'; g.fillRect(40, y + 60, 440, 3);
    g.fillStyle = '#2A2440'; g.font = `400 60px ${HIN}`; g.textAlign = 'left'; g.fillText(a, 46, y);
    g.textAlign = 'right'; g.fillText(b, 474, y); g.textAlign = 'left';
  });
  pageTex.needsUpdate = true;
}
// notebook ink: one stroke while the hour is planned, two while the actual time is written
ink.forEach((ln, i) => { ln.position.z = 0.072 + i * 0.022; ln.visible = false; });

// camera-facing Hindi labels (accepted pill style)
function makeLabel(text, w = 0.2, col = '#D9BCF5') {
  const lab = new THREE.Group();
  const lb = mesh(new RoundedBoxGeometry(w, 0.08, 0.016, 3, 0.016), std(col, 0.5, { transparent: true }), false, false); lab.add(lb);
  const ltx = textTexture(text, { font: HIN, w: Math.round(3200 * w), h: 256, size: 170, color: INK, pad: 24 });
  const lp = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.01, 0.076), new THREE.MeshBasicMaterial({ map: ltx.tex, transparent: true, depthWrite: false, toneMapped: false }));
  lp.position.z = 0.0085; lp.renderOrder = 5; lab.add(lp); lab.userData = { body: lb, txt: lp, tx: ltx, label: text, extra: [] }; scene.add(lab); return lab;
}
const planLab = makeLabel('10 मिनट'), hourLab = makeLabel('1 घंटा', 0.2, OVER), logLab = makeLabel('पिछली बार: 55 मिनट', 0.42);
const strike = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.0075), new THREE.MeshBasicMaterial({ color: INK, transparent: true, depthWrite: false, toneMapped: false }));
strike.position.z = 0.0095; strike.renderOrder = 6; planLab.add(strike); planLab.userData.extra.push(strike);
const LABELS = [planLab, hourLab, logLab];

// floating cards (accepted plan-card treatment): imagined vs actual (S2) and the calendar (S4)
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
function pill(g, x, y, text, size, fill, alpha = 1) {
  g.font = `400 ${size}px ${HIN}`; const w = g.measureText(text).width + size * 0.42;
  g.globalAlpha = alpha; g.fillStyle = fill; g.beginPath(); g.roundRect(x, y - size * 0.7, w, size * 1.3, size * 0.3); g.fill();
  g.fillStyle = INK; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(text, x + size * 0.21, y + size * 0.03); g.globalAlpha = 1; return w;
}
const CARD_POS = V(-0.34, 1.32, 0.3), CAL_POS = V(0.35, 1.155, 0.42);
const thoughtCard = makeCard(0.8, 0.366); const thoughtTx = cardCanvas(thoughtCard, 0.78, 0.357, 1400, 640);
const calCard = makeCard(0.54, 0.6); const calTx = cardCanvas(calCard, 0.52, 0.578, 900, 1000);
const SEGS = [['', 10, '#D9BCF5'], ['फ़ोन', 15, OVER_BAR], ['चाय', 15, OVER_BAR], ['ढूँढना', 15, OVER_BAR], ['', 5, '#D9BCF5']];
function segWindows() { return [[T.real + 0.05, T.real + 0.35], [T.buzz, T.buzz + 0.5], [T.mug, T.mug + 0.5], [T.search, T.search + 0.5], [T.search + 0.55, T.realDone]]; }
function drawThought(t) {
  const X0 = 370, U = 112, R1 = 140, R2 = 360, RC = 520;
  const p1 = sm(remap(t, T.cardIn + 0.05, T.cardIn + 0.3)), b1 = eio(remap(t, T.bar1A, T.bar1B)), t1 = sm(remap(t, T.bar1B - 0.1, T.bar1B + 0.15));
  const p2 = sm(remap(t, T.real - 0.05, T.real + 0.2));
  const wins = segWindows(), segP = wins.map(([a, b]) => eio(remap(t, a, b)));
  const t2 = sm(remap(t, T.realDone - 0.05, T.realDone + 0.2));
  const key = [p1, b1, t1, p2, ...segP, t2].map(x => x.toFixed(3)).join('|'); if (key === thoughtTx.key) return; thoughtTx.key = key;
  const { c, g, t: tex } = thoughtTx; g.clearRect(0, 0, c.width, c.height);
  if (p1 > 0) pill(g, 30, R1, 'सोचा', 124, '#D9BCF5', p1);
  if (b1 > 0) { g.fillStyle = '#D9BCF5'; g.beginPath(); g.roundRect(X0, R1 - 42, Math.max(8, U * b1), 84, 42); g.fill(); }
  if (t1 > 0) { g.globalAlpha = t1; g.fillStyle = INK; g.font = `400 116px ${HIN}`; g.textBaseline = 'middle'; g.fillText('10 मिनट', X0 + U + 34, R1 + 4); g.globalAlpha = 1; }
  if (p2 > 0) pill(g, 30, R2, 'असल', 124, OVER_BAR, p2);
  // actual bar: work and interruptions, drawn inside one rounded clip
  let x = X0; g.save(); g.beginPath(); g.roundRect(X0, R2 - 42, U * 6, 84, 42); g.clip();
  SEGS.forEach(([lab, mins, col], i) => { const w = U * mins / 10 * segP[i]; if (w > 0) { g.fillStyle = col; g.fillRect(x, R2 - 42, w - (i < 4 && segP[i] >= 1 ? 4 : 0), 84); } x += U * mins / 10 * (segP[i] >= 1 ? 1 : segP[i]); });
  g.restore();
  x = X0; SEGS.forEach(([lab, mins], i) => { const w = U * mins / 10; if (lab && segP[i] > 0) { g.globalAlpha = sm(segP[i] * 1.6); g.fillStyle = '#4A4466'; g.font = `400 90px ${HIN}`; g.textAlign = 'center'; g.fillText(lab, x + w / 2, RC); g.textAlign = 'left'; g.globalAlpha = 1; } x += w; });
  if (t2 > 0) { g.globalAlpha = t2; g.fillStyle = INK; g.font = `400 116px ${HIN}`; g.textBaseline = 'middle'; g.fillText('1 घंटा', X0 + U * 6 + 28, R2 + 4); g.globalAlpha = 1; }
  tex.needsUpdate = true;
}
function drawCal(t) {
  const Y0 = 250, PX = 225 / 30, XL = 190, XR = 860;          // 6:00 at Y0, 7.5 px per minute
  const hd = sm(remap(t, T.calIn + 0.05, T.calIn + 0.35)), guess = sm(remap(t, T.calIn + 0.3, T.calIn + 0.6)) * (1 - sm(remap(t, T.blockA, T.blockA + 0.4)));
  const blk = eio(remap(t, T.blockA, T.blockB)), lab1 = sm(remap(t, T.blockB - 0.25, T.blockB + 0.1));
  const done = remap(t, T.doneA, T.doneB), logv = remap(t, T.logA, T.logB);
  const key = [hd, guess, blk, lab1, done, logv].map(x => x.toFixed(3)).join('|'); if (key === calTx.key) return; calTx.key = key;
  const { c, g, t: tex } = calTx; g.clearRect(0, 0, c.width, c.height);
  if (hd > 0) pill(g, 30, 100, 'पिछली बार: 55 मिनट', 98, '#D9BCF5', hd);
  g.textBaseline = 'middle'; g.textAlign = 'left';
  ['6:00', '6:30', '7:00'].forEach((s, i) => { const y = Y0 + i * 225; g.fillStyle = '#9A94B2'; g.font = '500 56px Inter'; g.fillText(s, 26, y); g.fillStyle = '#E6E0EE'; g.fillRect(XL - 14, y - 1, XR - XL + 28, 3); });
  if (guess > 0) { g.globalAlpha = guess; g.setLineDash([14, 10]); g.strokeStyle = '#9A94B2'; g.lineWidth = 4; g.beginPath(); g.roundRect(XL, Y0 + 3, XR - XL, 10 * PX - 6, 14); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#7F78A0'; g.font = `400 58px ${HIN}`; g.fillText('10 मिनट?', XL + 24, Y0 + 5 * PX + 2); g.globalAlpha = 1; }
  if (blk > 0) { const h = Math.max(10, 60 * PX * blk);
    g.fillStyle = '#D9BCF5'; g.beginPath(); g.roundRect(XL, Y0 + 3, XR - XL, h - 6, 18); g.fill();
    if (done > 0) { g.save(); g.beginPath(); g.roundRect(XL, Y0 + 3, XR - XL, h - 6, 18); g.clip(); g.fillStyle = '#C7A4EE'; g.fillRect(XL, Y0 + 3, XR - XL, (h - 6) * eio(done)); g.restore(); }
    if (lab1 > 0) { g.globalAlpha = lab1; g.fillStyle = INK; g.font = `400 160px ${HIN}`; g.textAlign = 'center'; g.fillText('1 घंटा', (XL + XR) / 2, Y0 + 30 * PX + 6); g.textAlign = 'left'; g.globalAlpha = 1; } }
  if (logv > 0) {   // the actual time, written in after the work
    g.fillStyle = '#E6E0EE'; g.fillRect(40, 760, 820, 3);
    g.save(); g.beginPath(); g.rect(0, 770, 60 + 800 * eio(logv), 220); g.clip();
    g.fillStyle = '#4A4466'; g.font = `400 112px ${HIN}`; g.fillText('असल: 58 मिनट', 34, 872);
    g.strokeStyle = '#8E6FD0'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(760, 868); g.lineTo(792, 902); g.lineTo(852, 830); g.stroke();
    g.restore();
  }
  tex.needsUpdate = true;
}


// ---------------------------------------------------------------- choreography
const PELVIS = V(0, 0.64, 0.7);
const NB_DESK = V(0.25, DESK_Y + NB.h / 2 + 0.001, 0.12);

function pose(t) {
  const P = {};
  P.breath = Math.sin(t * 2 * Math.PI / 4.2);
  P.lean = track(t, [[0, 0.22], [T.dream - 0.3, 0.22], [T.dream + 0.4, 0.06], [T.dreamEnd, 0.06], [T.dreamEnd + 0.5, 0.22], [T.openA, 0.25], [30, 0.25]]);
  P.headPitch = track(t, [[0, -0.62], [T.dream - 0.3, -0.62], [T.dream + 0.4, -0.08], [T.dreamEnd, -0.08], [T.dreamEnd + 0.5, -0.6],
    [T.buzz, -0.6], [T.buzz + 0.2, -0.72], [T.mug, -0.62], [T.mug + 0.3, -0.38], [T.search, -0.45], [T.search + 0.55, -0.45], [T.search + 0.8, -0.6],
    [T.doneA - 0.1, -0.62], [T.doneA + 0.3, -0.22], [T.doneB, -0.22], [T.logA, -0.6], [30, -0.6]]);
  P.headYaw = track(t, [[0, 0.05], [T.dream - 0.3, 0.05], [T.dream + 0.4, 0.38], [T.dreamEnd, 0.38], [T.dreamEnd + 0.5, 0.05],
    [T.buzz, 0.05], [T.buzz + 0.2, 0.42], [T.mug, 0.4], [T.search, 0.1], [T.search + 0.18, -0.45], [T.search + 0.36, 0.42], [T.search + 0.55, -0.15],
    [T.search + 0.8, 0.05], [S.s3 + 0.1, -0.18], [T.doneA - 0.1, -0.18], [T.doneA + 0.3, -0.55], [T.doneB, -0.55], [T.logA, -0.18], [30, -0.18]]);
  P.headRoll = 0;
  P.torsoYaw = P.headYaw * 0.2;
  P.nbPos = NB_DESK; P.nbRot = new THREE.Euler(0, 0.12, 0);
  P.cover = track(t, [[T.openA, 0], [T.openB, Math.PI * 0.985, eio]]);
  return P;
}

function setNotebook(P) {
  notebook.position.copy(P.nbPos); notebook.rotation.copy(P.nbRot);
  coverPivot.rotation.z = P.cover;
  notebook.updateMatrixWorld(true);
  nbBlob.position.set(P.nbPos.x + 0.02, DESK_Y + 0.003, P.nbPos.z + 0.02);
  nbBlob.material.opacity = 0.55;
}

function mugLift(t) { return sm(remap(t, T.mug + 0.12, T.mug + 0.27)) * (1 - sm(remap(t, T.mug + 0.33, T.mug + 0.46))); }

function placeFigure(t, P) {
  const lean = P.lean, br = P.breath;
  torso.position.copy(PELVIS);
  torso.rotation.set(-lean, P.torsoYaw, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + lean * 0.5, P.headYaw, P.headRoll, 'YXZ');
  torso.updateMatrixWorld(true);
  const shL = torso.localToWorld(V(-0.15, 0.315, 0.0)), shR = torso.localToWorld(V(0.15, 0.315, 0.0));
  // right hand (holds the pencil): writes the task sheet -> opens the time log -> points at the 55-minute row -> writes the plan / the actual time
  const dn = penDown(t), lines = sheetLines(t);
  let hR = sheetPt(lines).add(V(0.003 * Math.sin(t * 31) * dn, 0.003 * Math.abs(Math.sin(t * 23)) * dn + 0.025 * (1 - dn), 0.015 * (1 - dn)));
  const sk = remap(t, T.search, T.search + 0.55);
  if (sk > 0 && sk < 1) hR.add(V(-0.05 * Math.sin(Math.PI * sk), 0, 0.02 * Math.sin(2 * Math.PI * sk)));   // shuffling, looking for something
  if (t >= T.openA - 0.3) {
    const edge = coverPivot.localToWorld(V(NB.w * 0.95, 0.03, 0.05));
    const hover = notebook.localToWorld(V(0.08, 0.07, 0.16));
    const row = notebook.localToWorld(V(0.1, 0.05, 0.25));     // the page's lower-right corner, below the rows (the arm stays off the log text)
    const k = sm(remap(t, T.openA - 0.3, T.openA)) * (1 - sm(remap(t, T.openB, T.openB + 0.3)));
    hR = vl(vl(hR, hover, sm(remap(t, T.openB, T.openB + 0.3))), edge, k);
    hR = vl(hR, row, sm(remap(t, T.point, T.point + 0.45)));
  }
  if (t >= S.s4) {   // writing on the log page: one stroke for the planned hour, two for the actual time
    const hover = notebook.localToWorld(V(-0.01, 0.07, 0.1));
    const inkPt = (i, u) => notebook.localToWorld(V(-0.075 + 0.12 * u, 0.045 + 0.003 * Math.abs(Math.sin(t * 23)), 0.072 + i * 0.022));
    const w1 = remap(t, T.blockA, T.blockB), w2 = remap(t, T.logA, T.logB);
    const d1 = sm(remap(t, T.blockA - 0.25, T.blockA)) * (1 - sm(remap(t, T.blockB, T.blockB + 0.25)));
    const d2 = sm(remap(t, T.logA - 0.25, T.logA)) * (1 - sm(remap(t, T.logB, T.logB + 0.25)));
    hR = hover.clone().add(V(0.004 * Math.sin(t * 1.3), 0, 0));
    if (d1 > 0) hR = vl(hR, inkPt(0, w1), d1);
    if (d2 > 0) hR = vl(hR, inkPt(w2 < 0.5 ? 1 : 2, (w2 * 2) % 1 || (w2 >= 1 ? 1 : 0)), d2);
  }
  // left hand: rests by the sheet -> taps the buzzing phone -> lifts the mug -> rests again (kept clear of the log page)
  const restL = V(-0.11, DESK_Y + 0.045, 0.25);
  let hL = restL.clone();
  const tap = sm(remap(t, T.buzz + 0.05, T.buzz + 0.25)) * (1 - sm(remap(t, T.buzz + 0.4, T.buzz + 0.55)));
  hL = vl(hL, PHONE_DESK.clone().add(V(0.0, 0.035, 0.0)), tap);
  const mk = sm(remap(t, T.mug, T.mug + 0.14)) * (1 - sm(remap(t, T.mug + 0.46, T.mug + 0.6)));
  hL = vl(hL, mug.position.clone().add(V(0.045, 0.0, 0.03)), mk);
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
  pencil.position.copy(aR.end).add(V(-0.012, -0.02, -0.02)); pencil.rotation.set(-0.9, 0.2, 0.55);
}

function setProps(t) {
  setClock(t < S.s2 ? clockMin(t) : 60);
  // the mug is lifted for a sip (an interruption)
  const lf = mugLift(t);
  mug.position.copy(MUG0).add(V(0.03 * lf, 0.08 * lf, 0.05 * lf)); mug.rotation.set(-0.25 * lf, -2.2, 0);
  mugBlob.position.set(MUG0.x, DESK_Y + 0.002, MUG0.z); mugBlob.material.opacity = 0.5 * (1 - 0.7 * lf);
  // the phone buzzes once (an interruption)
  const bz = Math.sin(Math.PI * remap(t, T.buzz - 0.05, T.buzz + 0.6));
  screenMat.color.set('#2B2640').lerp(new THREE.Color('#EDE6F7'), 0.85 * bz);
  notif.material.opacity = bz;
  phone.position.copy(PHONE_DESK).add(V(0.003 * Math.sin(t * 95) * bz, 0, 0.002 * Math.cos(t * 83) * bz));
  // sheet lines appear as they are written
  const L = sheetLines(t);
  sheetInk.forEach((ln, i) => { const k = clamp(L - i); ln.scale.x = Math.max(0.0001, 0.105 * k); ln.position.x = -0.055 + 0.0525 * k; ln.visible = k > 0; });
  drawPage(sm(remap(t, T.mark, T.mark + 0.4)));
  const inks = [remap(t, T.blockA, T.blockB), clamp(remap(t, T.logA, T.logB) * 2), clamp(remap(t, T.logA, T.logB) * 2 - 1)];
  ink.forEach((ln, i) => { const k = i < 3 ? inks[i] : 0; ln.visible = k > 0; ln.scale.x = Math.max(0.0001, 0.12 * k); ln.position.x = -0.075 + 0.06 * k; });
}

function setEpisode(t) {
  const setLab = (lab, pos, v, s = 1) => {
    lab.position.copy(pos); lab.quaternion.copy(camera.quaternion); lab.visible = v > 0.003;
    lab.scale.setScalar(s * lerp(0.6, 1, v));
    lab.userData.body.material.opacity = v; lab.userData.txt.material.opacity = v;
    lab.userData.extra.forEach(e => { e.material.opacity = v; });
  };
  // hook labels: the 10-minute plan (struck through) and the hour it took
  const out1 = 1 - sm(remap(t, S.s2 - 0.25, S.s2 - 0.02));
  setLab(planLab, V(-0.44, DESK_Y + 0.08, 0.0), out1, 0.6);
  const sk = eout(remap(t, T.hour - 0.05, T.hour + 0.25));
  strike.scale.x = Math.max(0.0001, sk); strike.position.x = -0.085 * (1 - sk); strike.visible = sk > 0.001;
  const hv = sm(remap(t, T.hour, T.hour + 0.3)) * out1;
  setLab(hourLab, V(-0.25, DESK_Y + 0.1, -0.14), hv, 0.6 * (1 + 0.12 * Math.sin(Math.PI * remap(t, T.hour, T.hour + 0.45))));
  // thought card: imagined vs actual
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  const pv = sm(remap(t, T.cardIn, T.cardIn + 0.35)) * (1 - sm(remap(t, T.cardOut - 0.3, T.cardOut)));
  thoughtCard.visible = pv > 0.003; thoughtCard.position.copy(CARD_POS); thoughtCard.rotation.set(0, camYaw(CARD_POS), 0);
  thoughtCard.scale.setScalar(0.92 * lerp(0.85, 1, sm(remap(t, T.cardIn, T.cardIn + 0.35))));
  thoughtCard.userData.border.material.opacity = pv; thoughtCard.userData.panel.material.opacity = pv * 0.95; thoughtTx.m.material.opacity = pv;
  if (thoughtCard.visible) drawThought(t);
  // the past record, lifted off the log page
  const lv = sm(remap(t, T.mark + 0.1, T.mark + 0.45)) * (1 - sm(remap(t, S.s4 - 0.3, S.s4 - 0.05)));
  setLab(logLab, notebook.localToWorld(V(-0.157, 0.05, 0.09)), lv, 0.32 * (1 + 0.08 * Math.sin(Math.PI * remap(t, T.mark + 0.1, T.mark + 0.6))));
  // calendar card: the hour is booked from the record; afterwards the actual time is written in
  const cv = sm(remap(t, T.calIn, T.calIn + 0.35)) * (1 - sm(remap(t, T.calOut - 0.3, T.calOut)));
  calCard.visible = cv > 0.003; calCard.position.copy(CAL_POS); calCard.rotation.set(0, camYaw(CAL_POS), 0);
  calCard.scale.setScalar(0.8 * lerp(0.85, 1, sm(remap(t, T.calIn, T.calIn + 0.35))));
  calCard.userData.border.material.opacity = cv; calCard.userData.panel.material.opacity = cv * 0.95; calTx.m.material.opacity = cv;
  if (calCard.visible) drawCal(t);
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 high over the right shoulder: the clock races through a full hour past the "10 मिनट" note while the sheet is written
  { a: S.s1, b: S.s2, k0: [V(-0.27, 0.82, 0.04), 26, 58, 1.7, 30], k1: [V(-0.28, 0.82, 0.02), 22, 57, 1.5, 30] },
  // S2 rear-left medium: imagined (lavender, clean) vs actual (interruptions) builds beside the performer
  { a: S.s2, b: S.s3, k0: [V(-0.24, 1.14, 0.3), -16, 9, 4.0, 30], k1: [V(-0.23, 1.13, 0.3), -12, 8, 3.75, 30] },
  // S3 steep right three-quarter onto the open time log: the 55-minute row
  { a: S.s3, b: S.s4, k0: [V(0.17, 0.8, 0.17), 22, 60, 1.45, 30], k1: [V(0.17, 0.8, 0.15), 17, 58, 1.3, 30] },
  // S4 rear-right medium: the calendar card beside the performer; the hour is booked, then the actual time is written
  { a: S.s4, b: S.s5, k0: [V(0.22, 1.1, 0.4), 24, 10, 3.4, 30], k1: [V(0.23, 1.1, 0.4), 19, 9, 3.2, 30] },
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

function unionBox(objs) {
  const bs = objs.filter(o => o.visible).map(screenBox).filter(Boolean);
  if (!bs.length) return null;
  return [Math.min(...bs.map(b => b[0])), Math.min(...bs.map(b => b[1])), Math.max(...bs.map(b => b[2])), Math.max(...bs.map(b => b[3]))];
}

window.layoutReport = t => {
  renderAt(t);
  // "card" = visible in-scene Hindi text (clock notes, thought card, log label, calendar card): the crucial in-scene text
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const objs = [planLab, hourLab, logLab, thoughtCard, calCard].filter(o => o.visible).map(textBox).filter(onScreen);
  const r = { t, card: objs.length ? [Math.min(...objs.map(b => b[0])), Math.min(...objs.map(b => b[1])), Math.max(...objs.map(b => b[2])), Math.max(...objs.map(b => b[3]))] : null,
    labs: [planLab, hourLab, logLab].map(o => (o.visible ? textBox(o) : null)), head: screenBox(head), clock: screenBox(clock), notebook: screenBox(notebook), phone: screenBox(phone), desk: screenBox(deskTop) };
  const cb = capEl.getBoundingClientRect();
  r.caption = capEl.innerHTML && +capEl.style.opacity > 0.02 ? [cb.left, cb.top, cb.right, cb.bottom].map(Math.round) : null;
  const spans = [...capEl.querySelectorAll('.ln')].map(e => e.getBoundingClientRect());
  r.captionText = spans.length && r.caption ? [Math.min(...spans.map(b => b.left)), Math.min(...spans.map(b => b.top)), Math.max(...spans.map(b => b.right)), Math.max(...spans.map(b => b.bottom))].map(Math.round) : null;
  r.captionLines = spans.length;
  r.shot = SHOTS.findIndex(x => t >= x.a && t < x.b) + 1 || 5;
  return r;
};


// ---------------------------------------------------------------- captions (accepted treatment; Devanagari via Tiro Devanagari Hindi)
const hl = s => `<span class="hl">${s}</span>`;
const sg = (html, t = null) => ({ html, t });
const C2 = 76, C1 = 92;
const CAPS = [
  { a: -1, b: TL.name.start - 0.12, size: C2, lines: [[sg('“बस दस मिनट का काम है…”')], [sg(`— और ${hl('एक घंटा')} निकल गया।`, hookSplit - 0.05)]] },
  { a: TL.name.start - 0.06, b: nameSplit - 0.12, size: C1, lines: [[sg(`इसे ${hl('प्लानिंग फ़ैलेसी')} कहते हैं:`)]] },
  { a: nameSplit - 0.06, b: TL.real.start - 0.12, size: C2, lines: [[sg('हम आने वाले काम को')], [sg(`${hl('परफ़ेक्ट')} सोचते हैं।`)]] },
  { a: TL.real.start - 0.06, b: TL.fix.start - 0.12, size: C2, lines: [[sg('पर असल में,')], [sg(`बीच में ${hl('बहुत कुछ')} आ जाता है।`, realSplit - 0.04)]] },
  { a: TL.fix.start - 0.06, b: TL.example.start - 0.12, size: C2, lines: [[sg('इसलिए, अंदाज़े की जगह,')], [sg(`पिछली बार का ${hl('असली समय')} देखिए।`, fixSplit - 0.04)]] },
  { a: TL.example.start - 0.06, b: exSplit - 0.12, size: C2, lines: [[sg('पिछली बार ऐसा काम')], [sg(`${hl('पचपन मिनट')} चला था,`)]] },
  { a: exSplit - 0.06, b: TL.log.start - 0.12, size: C2, lines: [[sg('तो कैलेंडर में')], [sg(`पूरा ${hl('एक घंटा')} रखिए।`)]] },
  { a: TL.log.start - 0.06, b: TL.cta.start - 0.2, size: C2, lines: [[sg('और काम के बाद,')], [sg(`${hl('असली समय')} लिख लीजिए।`, logSplit - 0.04)]] },
  { a: TL.cta.start - 0.1, b: 99, size: C2, lines: [[sg('मेलो के साथ एक')], [sg('माइंडफुल ब्रेक लीजिए।')]] },
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
  setNotebook(P);
  setProps(t);
  placeFigure(t, P);
  setCamera(t);
  setEpisode(t);
  lampLight.intensity = 0.35 * sm(remap(t, S.s4 - 0.2, S.s4 + 1.5));
  setCaption(t);
  renderer.render(scene, camera);
}
window.renderAt = renderAt;
window.projectPoints = (t, pts) => { renderAt(t); return pts.map(([x, y, z]) => { const v = V(x, y, z).project(camera); return [Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * H)]; }); };
window.showGuides = on => { document.getElementById('guides').style.display = on ? 'block' : 'none'; };

await document.fonts.load('400 100px "Instrument Serif"');
await document.fonts.load('italic 400 100px "Instrument Serif"');
await document.fonts.load('500 30px "Inter"');
await document.fonts.ready;
await new Promise(r => { const im = document.getElementById('icon'); if (im.complete) r(); else im.onload = r; });
await document.fonts.load('400 100px "Tiro Devanagari Hindi"', 'अआकखग');
await document.fonts.ready;
window.__fontCheck = { tiro: document.fonts.check('400 100px "Tiro Devanagari Hindi"', 'संकेत'), instrument: document.fonts.check('400 100px "Instrument Serif"') };
// redraw Hindi textures now that the Devanagari font is present
for (const lab of LABELS) {
  const { canvas: c, g: ctx } = lab.userData.tx;
  ctx.clearRect(0, 0, c.width, c.height);
  let s = 170; ctx.font = `400 ${s}px "Tiro Devanagari Hindi"`;
  while (ctx.measureText(lab.userData.label).width > c.width - 60) { s -= 4; ctx.font = `400 ${s}px "Tiro Devanagari Hindi"`; }
  ctx.fillStyle = '#17122E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(lab.userData.label, c.width / 2, c.height * 0.56);
  lab.userData.tx.tex.needsUpdate = true;
}
pageKey = ''; thoughtTx.key = ''; calTx.key = '';
renderAt(0);
window.ready = true;
