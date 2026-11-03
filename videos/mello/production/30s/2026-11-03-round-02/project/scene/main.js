// Mello 30 s round02-01: "A short sensory grounding break" (3 things you see, 2 sounds, 1 sensation).
// Same accepted style recipe and renderer as feedback-01 ("Thoughts in a Quiet Room": sparse clean 3D miniature,
// one abstract faceless performer, soft contact shadows, white/pale-gray stage, Instrument Serif captions,
// Mello lavender #D9BCF5 only as the highlight). Room, props, rig, cameras, caption and lock-up code are carried
// over unchanged from ../../2026-11-02-feedback-round/project/scene/main.js; only the episode story is new.
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
const S = { s1: 0.0, s2: 3.05, s3: 7.95, s4: 12.75, s5: 20.6, end: 30.0 };
const hookSplit = (TL.hook.pauses[0] || [1.1, 1.35])[1];
const qualSplit = (TL.qual.pauses[0] || [18.0, 18.4])[1];
const T = {
  settle: hookSplit + 0.15,            // "Try a short grounding break": racing chips slow and settle
  land: S.s2 - 0.1,                    // chips rest on the desk corner (they stay: the worry is not solved)
  see1: TL.lamp.start, see2: TL.mug.start, see3: TL.nb.start,
  seeOff: S.s3 - 0.2,
  ticks: [TL.clock.start - 0.45, TL.clock.start + 0.55, TL.clock.start + 1.55, TL.clock.start + 2.55],
  hear1: TL.clock.start, hear2: TL.breath.start,
  inhale: TL.breath.start - 0.2, exhale: TL.breath.end + 0.15,
  hearOff: S.s4 + 0.4,
  feel1: TL.feet.start + 0.05,
  craneA: TL.feet.end + 0.2, craneB: qualSplit + 1.4,
  present: qualSplit,                  // "...brings your attention back to the present": anchors glow together
  c3: TL.three.start, c2: TL.two.start, c1: TL.one.start,
  back: TL.back.start,
  openA: TL.back.start + 0.25, openB: TL.back.start + 0.9,
  pencilA: TL.back.start + 1.0, writeA: TL.back.start + 1.9,
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
  const R = 1.7, zWall = -2.7, pts = [];
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

// ---------------------------------------------------------------- episode props: wall clock, racing-thought chips, highlights
const clock = new THREE.Group();
const face = mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.03, 48), M.mug); face.rotation.x = Math.PI / 2; clock.add(face);
const bezel = mesh(new THREE.TorusGeometry(0.17, 0.014, 12, 48), M.lead); clock.add(bezel);
for (let i = 0; i < 12; i++) {
  const m = mesh(new THREE.BoxGeometry(0.008, i % 3 ? 0.018 : 0.032, 0.004), M.lead, false, false);
  const a = i / 12 * Math.PI * 2; m.position.set(Math.sin(a) * 0.14, Math.cos(a) * 0.14, 0.017); m.rotation.z = -a; clock.add(m);
}
const handH = new THREE.Group(), handM = new THREE.Group(), handS = new THREE.Group();
[[handH, 0.07, 0.012, M.lead], [handM, 0.11, 0.008, M.lead], [handS, 0.125, 0.004, M.cover]].forEach(([g, len, w, mat]) => {
  const m = mesh(new THREE.BoxGeometry(w, len, 0.004), mat, false, false); m.position.y = len / 2 - 0.012; g.add(m); g.position.z = 0.02; clock.add(g);
});
handH.rotation.z = -2.1; handM.rotation.z = -0.6;
const clockStand = mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.012, 32), M.mug); clockStand.position.set(0, -0.185, -0.01); clock.add(clockStand);
clock.scale.setScalar(0.5); clock.rotation.x = -0.12;
clock.position.set(-0.22, DESK_Y + 0.095, -0.2); scene.add(clock);
blob(0.2, 0.14, 0.5, DESK_Y + 0.002).position.set(-0.22, DESK_Y + 0.002, -0.2);

// three small dark "racing thought" chips (the same navy as the accepted thought card, no text)
const chipMat = std('#1C1733', 0.55);
const chips = [0, 1, 2].map(() => { const c = mesh(new RoundedBoxGeometry(0.115, 0.078, 0.014, 3, 0.006), chipMat); scene.add(c); return c; });
const chipBlobs = [0, 1, 2].map(() => blob(0.2, 0.16, 0, DESK_Y + 0.003));
const CHIP_REST = V(-0.47, DESK_Y + 0.008, 0.04);

// lavender highlight rings + numbered tabs (the counting mechanism)
const ringMat = () => std('#D9BCF5', 0.45, { transparent: true, emissive: new THREE.Color('#D9BCF5'), emissiveIntensity: 0.25, depthWrite: false });
function ring(r, tube = 0.006) { const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, 64), ringMat()); m.renderOrder = 3; scene.add(m); return m; }
const tagMat = std('#D9BCF5', 0.5, { transparent: true });
function tag(n) {
  const g = new THREE.Group();
  const b = mesh(new RoundedBoxGeometry(0.07, 0.07, 0.016, 3, 0.012), tagMat.clone(), false, false); g.add(b);
  const tx = textTexture(String(n), { font: '"Instrument Serif"', w: 256, h: 256, size: 230, color: '#17122E' });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.066), new THREE.MeshBasicMaterial({ map: tx.tex, transparent: true, depthWrite: false, toneMapped: false }));
  p.position.z = 0.0085; p.renderOrder = 5; g.add(p); g.userData = { body: b, txt: p, tx, n }; scene.add(g); return g;
}
// see: lamp, mug, notebook  (rings lie on the desk around each base)
const SEE = [
  { ring: ring(0.1), pos: V(0.5, DESK_Y + 0.004, -0.22), tag: tag(1), tagPos: V(0.34, 0.86, -0.2), t: T.see1 },
  { ring: ring(0.075), pos: V(0.47, DESK_Y + 0.004, 0.06), tag: tag(2), tagPos: V(0.36, 0.86, 0.14), t: T.see2 },
  { ring: ring(0.2), pos: V(0.14, DESK_Y + 0.004, 0.03), tag: tag(3), tagPos: V(0.14, 0.85, -0.17), t: T.see3 },
];
SEE.forEach(s => { s.ring.rotation.x = Math.PI / 2; s.ring.position.copy(s.pos); s.ring.scale.set(1, 1.0, 1); });
SEE[2].ring.scale.set(0.75, 1.0, 1);   // notebook ring is an oval (x narrower than z)
// hear: clock (rings in the wall plane) and breath (horizontal ring around the chest)
const clockRings = [0, 1, 2, 3].map(() => ring(0.1, 0.004));
clockRings.forEach(r => { r.position.set(clock.position.x, clock.position.y, clock.position.z + 0.02); r.rotation.x = -0.12; });
const breathRing = ring(0.2, 0.006); breathRing.rotation.x = Math.PI / 2;
const HEAR = [{ tag: tag(1), tagPos: V(-0.36, 0.9, -0.17), t: T.hear1 }, { tag: tag(2), tagPos: V(-0.25, 1.15, 0.6), t: T.hear2 }];
// feel: ring on the floor around the feet
const feetRing = ring(0.24, 0.007); feetRing.rotation.x = Math.PI / 2; feetRing.scale.set(1, 0.75, 1); feetRing.position.set(0, 0.016, 0.2);
const FEEL = { tag: tag(1), tagPos: V(0.0, 0.13, 0.17), t: T.feel1 };
const ALL_TAGS = [...SEE.map(s => s.tag), ...HEAR.map(h => h.tag), FEEL.tag];

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


// ---------------------------------------------------------------- choreography
const PELVIS = V(0, 0.64, 0.7);
const NB_DESK = V(0.14, DESK_Y + NB.h / 2 + 0.001, 0.03);
const HEAD_C = V(0, 1.38, 0.55);

function pose(t) {
  const breath = Math.sin(t * 2 * Math.PI / 4.2);
  const P = {};
  // inhale / exhale on "Your own breath" (larger than the idle breath)
  const big = sm(remap(t, T.inhale, T.inhale + 1.0)) * (1 - sm(remap(t, T.exhale, T.exhale + 1.3)));
  P.breath = breath * (1 - big) + big * 2.4;
  P.lean = track(t, [[0, 0.3], [hookSplit, 0.3], [T.settle + 0.9, 0.14], [T.see3 + 0.4, 0.18], [S.s3, 0.12],
    [T.hear2, 0.1], [S.s4 + 0.3, 0.2], [T.feel1 + 0.8, 0.2], [T.craneA + 1.0, 0.05], [T.back, 0.06], [T.back + 0.8, 0.26]]);
  P.shrug = track(t, [[0, 0.03], [hookSplit, 0.03], [T.settle + 0.8, 0.0], [T.inhale, 0.0], [T.inhale + 1.0, 0.032], [T.exhale, 0.032], [T.exhale + 1.3, -0.008], [30, -0.004]]);
  P.headPitch = track(t, [[0, -0.5], [hookSplit, -0.5], [T.settle + 0.8, -0.12],
    [T.see1 - 0.1, -0.12], [T.see1 + 0.35, -0.2], [T.see2 - 0.1, -0.2], [T.see2 + 0.35, -0.55], [T.see3 - 0.1, -0.55], [T.see3 + 0.35, -0.68], [S.s3 - 0.3, -0.3],
    [T.hear1 - 0.3, 0.12], [T.hear2 - 0.4, 0.1], [T.hear2 + 0.2, -0.05], [S.s4 + 0.1, -0.1], [T.feel1 - 0.6, -0.72], [T.craneA + 0.4, -0.72],
    [T.craneA + 1.6, -0.02], [T.back, -0.04], [T.back + 0.7, -0.55], [30, -0.58]]);
  P.headYaw = track(t, [[0, 0], [T.see1 - 0.1, 0], [T.see1 + 0.35, -0.55], [T.see2 - 0.1, -0.55], [T.see2 + 0.35, -0.7],
    [T.see3 - 0.1, -0.7], [T.see3 + 0.35, -0.22], [S.s3 - 0.3, 0], [T.hear1 - 0.3, 0.32], [T.hear2 - 0.4, 0.3], [T.hear2 + 0.2, 0],
    [T.c3, 0], [T.c3 + 0.3, -0.25], [T.c2, -0.25], [T.c2 + 0.3, 0.22], [T.c1, 0.22], [T.c1 + 0.3, 0], [30, 0]]);
  P.headRoll = track(t, [[T.hear1 - 0.4, 0], [T.hear1, 0.14], [T.hear2 - 0.4, 0.12], [T.hear2 + 0.2, 0]]);   // listening tilt
  P.torsoYaw = P.headYaw * 0.18;
  P.nbPos = NB_DESK; P.nbRot = new THREE.Euler(0, -0.06, 0);
  P.cover = track(t, [[T.openA, 0], [T.openB, Math.PI * 0.985, eio]]);
  // feet: lift a touch, then press flat on "your feet on the floor"
  P.footLift = Math.sin(Math.PI * remap(t, T.feel1 - 0.45, T.feel1 + 0.05)) * 0.018;
  return P;
}

function setNotebook(P) {
  notebook.position.copy(P.nbPos); notebook.rotation.copy(P.nbRot);
  coverPivot.rotation.z = P.cover;
  notebook.updateMatrixWorld(true);
  nbBlob.position.set(P.nbPos.x + 0.02, DESK_Y + 0.003, P.nbPos.z + 0.02);
  nbBlob.material.opacity = 0.55;
}

function placeFigure(t, P) {
  const lean = P.lean, br = P.breath;
  torso.position.copy(PELVIS);
  torso.rotation.set(-lean, P.torsoYaw, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + lean * 0.5, P.headYaw, P.headRoll, 'YXZ');
  torso.updateMatrixWorld(true);
  const shL = torso.localToWorld(V(-0.15, 0.315 + P.shrug, 0.0)), shR = torso.localToWorld(V(0.15, 0.315 + P.shrug, 0.0));
  const restR = V(0.28, DESK_Y + 0.045, 0.2), restL = V(-0.12, DESK_Y + 0.045, 0.22);
  // hook: hands at the temples while thoughts race, then down to the desk
  head.updateMatrixWorld(true);
  const tL = head.localToWorld(V(-0.1, -0.03, -0.08)), tR = head.localToWorld(V(0.1, -0.03, -0.08));
  const down = sm(remap(t, T.settle, T.settle + 0.9));
  let hL = vl(tL, restL, down), hR = vl(tR, restR, down);
  // left hand opens the cover by its free edge; right hand picks the pencil and writes
  if (t >= T.openA - 0.25) {
    const edge = coverPivot.localToWorld(V(NB.w * 0.95, 0.03, 0.05));
    const k = sm(remap(t, T.openA - 0.25, T.openA)) * (1 - sm(remap(t, T.openB, T.openB + 0.35)));
    const rest2 = notebook.localToWorld(V(-NB.w * 0.62, 0.035, 0.07));
    hL = vl(vl(restL, rest2, sm(remap(t, T.openB, T.openB + 0.35))), edge, k);
  }
  const pen0 = V(0.37, DESK_Y + 0.03, 0.17);
  const write0 = notebook.localToWorld(V(NB.w * 0.32, 0.04, 0.0));
  if (t >= T.pencilA) {
    const a = sm(remap(t, T.pencilA, T.pencilA + 0.5)), b = sm(remap(t, T.pencilA + 0.65, T.writeA));
    hR = vl(vl(restR, pen0, a), write0, b);
    if (t > T.writeA) {
      const w = t - T.writeA, row = Math.min(4, Math.floor(w / 0.85)), ph = (w % 0.85) / 0.85;
      hR = notebook.localToWorld(V(NB.w * 0.18 + 0.06 * ph + 0.004 * Math.sin(w * 31), 0.04 + 0.003 * Math.abs(Math.sin(w * 23)), -0.09 + row * 0.03 + 0.04));
    }
  }
  const poleL = vl(V(-0.3, -1, -0.9), V(-0.8, -0.5, 0.6), down), poleR = vl(V(0.3, -1, -0.9), V(0.8, -0.5, 0.6), down);
  const aL = ik(shL, hL, 0.25, 0.235, poleL), aR = ik(shR, hR, 0.25, 0.235, poleR);
  J.shL.position.copy(shL); J.shR.position.copy(shR); J.elL.position.copy(aL.mid); J.elR.position.copy(aR.mid);
  J.haL.position.copy(aL.end); J.haR.position.copy(aR.end);
  setLimb(limbs.uaL, shL, aL.mid); setLimb(limbs.faL, aL.mid, aL.end); setLimb(limbs.uaR, shR, aR.mid); setLimb(limbs.faR, aR.mid, aR.end);
  J.haL.lookAt(aL.mid); J.haR.lookAt(aR.mid);
  // legs (feet planted; a small lift-and-press on the sensation beat)
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    const hip = torso.localToWorld(V(sx * 0.085, 0.02, 0.0)); hip.y = Math.max(hip.y, 0.6);
    const ank = V(sx * 0.12, 0.075 + P.footLift, 0.27);
    const r = ik(hip, ank, 0.4, 0.43, V(sx * 0.15, 1, -0.6));
    const [th, sh, hi, kn, an] = i === 0 ? [limbs.thL, limbs.shL, J.hiL, J.knL, J.anL] : [limbs.thR, limbs.shR, J.hiR, J.knR, J.anR];
    hi.position.copy(hip); kn.position.copy(r.mid); an.position.copy(r.end);
    setLimb(th, hip, r.mid); setLimb(sh, r.mid, r.end);
    feet[i].position.set(r.end.x, 0.028 + P.footLift, r.end.z - 0.045); feet[i].rotation.set(-P.footLift * 6, sx * -0.1, 0);
    footBlobs[i].position.set(r.end.x, 0.013, r.end.z - 0.04);
    footBlobs[i].material.opacity = 0.6 * (1 - P.footLift * 20);
  }
  const penRest = V(0.37, DESK_Y + 0.006, 0.17);
  if (t >= T.pencilA + 0.5) { pencil.position.copy(aR.end).add(V(-0.012, -0.02, -0.02)); pencil.rotation.set(-0.9, 0.2, 0.55); }
  else { pencil.position.copy(penRest); pencil.rotation.set(Math.PI / 2, 0, 1.1); }
}

function setChips(t) {
  // fast orbit around the head (racing thoughts) that slows on "Try a short grounding break", then the chips settle
  const w0 = 4.2, slow = remap(t, T.settle - 0.2, T.settle + 0.7);
  const ang = t < T.settle - 0.2 ? w0 * t : w0 * (T.settle - 0.2) + w0 * (T.settle + 0.7 - (T.settle - 0.2)) * (slow - slow * slow / 2);
  const fall = eio(remap(t, T.settle + 0.55, T.land));
  chips.forEach((c, i) => {
    const a = ang + i * Math.PI * 2 / 3;
    const orbit = HEAD_C.clone().add(V(Math.cos(a) * 0.23, 0.05 * Math.sin(a * 2 + i), Math.sin(a) * 0.18));
    const rest = CHIP_REST.clone().add(V(0.012 * i, 0.0145 * i, -0.008 * i));
    const p = vl(orbit, rest, fall); p.y += Math.sin(Math.PI * fall) * 0.05;
    c.position.copy(p);
    c.rotation.set(lerp(0.3 * Math.sin(a + i), -Math.PI / 2, fall), lerp(-a, 0.25 * i - 0.2, fall), lerp(0.2 * Math.cos(a), 0, fall));
    const s = lerp(1, 0.92, fall); c.scale.setScalar(s * sm(remap(t, -0.25, 0.1)));
    chipBlobs[i].position.set(rest.x, DESK_Y + 0.003, rest.z); chipBlobs[i].material.opacity = 0.45 * fall;
  });
}

function pop(t, t0, dur = 0.35) { return eout(remap(t, t0, t0 + dur)); }
function setTag(g, pos, vis, pulse = 0) {
  g.visible = vis > 0.003;
  g.position.copy(pos); g.position.y += (1 - vis) * -0.02;
  const s = lerp(0.6, 1, vis) * (1 + 0.18 * pulse); g.scale.setScalar(s);
  g.userData.body.material.opacity = vis; g.userData.txt.material.opacity = vis;
}
function setRing(r, vis, grow = 1, pulse = 0) {
  r.visible = vis > 0.003; r.material.opacity = vis * 0.95;
  r.material.emissiveIntensity = 0.25 + 0.6 * pulse;
  const s = lerp(0.7, 1, grow) * (1 + 0.12 * pulse); r.scale.set(s * (r.userData.sx || 1), s * (r.userData.sy || 1), 1);
}
SEE[2].ring.userData.sx = 0.75;
feetRing.userData.sy = 0.75;

function setHighlights(t) {
  const camYaw = Math.atan2(camera.position.x, camera.position.z);
  // "...back to the present": all anchors glow softly; countdown pulses the groups; fade as attention returns to the task
  const recap = sm(remap(t, T.present, T.present + 0.6)) * (1 - sm(remap(t, T.back + 0.2, T.back + 1.0)));
  const pulse = (t0) => Math.sin(Math.PI * remap(t, t0, t0 + 0.55));
  const p3 = pulse(T.c3), p2 = pulse(T.c2), p1 = pulse(T.c1);
  SEE.forEach((s) => {
    const v = Math.max(pop(t, s.t) * (1 - sm(remap(t, T.seeOff, T.seeOff + 0.4))), recap * 0.85);
    setRing(s.ring, v, pop(t, s.t, 0.45), p3);
    setTag(s.tag, s.tagPos, pop(t, s.t) * (1 - sm(remap(t, T.seeOff, T.seeOff + 0.4))), 0);
    s.tag.rotation.y = camYaw * 0.6;
  });
  // clock: second hand jumps on each tick; rings expand from the clock face on ticks
  const sec = Math.floor(t + 0.45);   // tick boundaries align with T.ticks (.2 phase)
  handS.rotation.z = -sec * Math.PI / 30 - 0.4;
  const hearVis = (t0) => pop(t, t0) * (1 - sm(remap(t, T.hearOff, T.hearOff + 0.4)));
  clockRings.forEach((r, i) => {
    const tk = T.ticks[i], u = remap(t, tk, tk + 1.2);
    const on = t >= tk && t < tk + 1.2 && t < T.hearOff ? 1 : 0;
    r.visible = on > 0; const s = 1 + 1.4 * eout(u); r.scale.set(s, s, 1); r.material.opacity = on * (1 - u) * 0.9;
    r.material.emissiveIntensity = 0.3;
  });
  setTag(HEAR[0].tag, HEAR[0].tagPos, hearVis(T.hear1), p2);
  // breath ring around the chest
  torso.updateMatrixWorld(true);
  const chest = torso.localToWorld(V(0, 0.27, 0));
  const bu = remap(t, T.inhale, T.inhale + 1.4);
  breathRing.position.copy(chest);
  const bv = Math.max((t >= T.inhale ? Math.sin(Math.PI * bu) : 0), recap * 0.45, 0);
  setRing(breathRing, bv, 0.6 + 0.6 * eout(bu), p2);
  setTag(HEAR[1].tag, HEAR[1].tagPos, hearVis(T.hear2), p2);
  HEAR[1].tag.rotation.y = camYaw * 0.6;
  // feet
  const fv = Math.max(pop(t, T.feel1) * (1 - sm(remap(t, T.craneA + 1.5, T.craneA + 2.2))), recap * 0.85);
  setRing(feetRing, fv, pop(t, T.feel1, 0.6), p1);
  setTag(FEEL.tag, FEEL.tagPos, pop(t, T.feel1) * (1 - sm(remap(t, T.craneA, T.craneA + 0.35))), 0);
  FEEL.tag.rotation.y = camYaw * 0.8;
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 rear 3/4 medium (accepted framing): thoughts race around the head, then settle on the desk
  { a: S.s1, b: S.s2, k0: [V(0.02, 1.24, 0.36), 30, 13, 4.6, 26], k1: [V(0.0, 1.24, 0.34), 26, 12, 4.3, 26] },
  // S2 over-the-shoulder toward the desk: three things you can see
  { a: S.s2, b: S.s3, k0: [V(0.3, 1.03, -0.04), 8, 31, 2.15, 30], k1: [V(0.31, 1.03, -0.04), 5, 30, 2.0, 30] },
  // S3 wide rear-left, wall clock in view: two sounds you can hear
  { a: S.s3, b: S.s4, k0: [V(-0.06, 1.06, 0.16), -36, 13, 4.5, 30], k1: [V(-0.06, 1.05, 0.16), -31, 12, 4.2, 30] },
  // S4 low close on the feet, then a slow crane up past the desk (the chips are still there) to the upright performer
  { a: S.s4, b: S.s5, k0: [V(-0.04, 0.22, 0.24), 144, 31, 1.95, 30], kp: [V(-0.04, 0.2, 0.24), 152, 30, 1.7, 30], k1: [V(-0.18, 0.96, 0.3), 48, 21, 3.9, 28], m: [T.craneA, T.craneB], lead: 0.7, ease: 'sine',
    k2: [V(-0.17, 0.96, 0.3), 40, 20, 3.7, 28] },
  // S5 wide calm room (accepted framing): countdown, back to the task, lock-up
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

function unionBox(objs) {
  const bs = objs.filter(o => o.visible).map(screenBox).filter(Boolean);
  if (!bs.length) return null;
  return [Math.min(...bs.map(b => b[0])), Math.min(...bs.map(b => b[1])), Math.max(...bs.map(b => b[2])), Math.max(...bs.map(b => b[3]))];
}
window.layoutReport = t => {
  renderAt(t);
  // "card" = the visible numbered tabs (the crucial labels in this episode); clock reported separately
  const r = { t, card: unionBox(ALL_TAGS), clock: screenBox(clock), head: screenBox(head), notebook: screenBox(notebook), desk: screenBox(deskTop) };
  const cb = capEl.getBoundingClientRect();
  r.caption = capEl.innerHTML && +capEl.style.opacity > 0.02 ? [cb.left, cb.top, cb.right, cb.bottom].map(Math.round) : null;
  const spans = [...capEl.querySelectorAll('.ln')].map(e => e.getBoundingClientRect());
  r.captionText = spans.length && r.caption ? [Math.min(...spans.map(b => b.left)), Math.min(...spans.map(b => b.top)), Math.max(...spans.map(b => b.right)), Math.max(...spans.map(b => b.bottom))].map(Math.round) : null;
  r.captionLines = spans.length;
  r.shot = SHOTS.findIndex(x => t >= x.a && t < x.b) + 1 || 5;
  return r;
};


// ---------------------------------------------------------------- captions (accepted treatment: overlay inside the y 340-520 band)
const q = s => s.replace(/'/g, '\u2019');
const hl = s => `<span class="hl">${q(s)}</span>`;
// a segment shown from time t (null = with the caption)
const sg = (html, t = null) => ({ html, t });
const CAPS = [
  { a: -1, b: S.s2 - 0.05, size: 96, lines: [[sg('Mind racing?')], [sg(`Try a short ${hl('grounding break')}.`, hookSplit - 0.05)]] },
  { a: TL.see.start - 0.06, b: TL.lamp.start - 0.08, size: 96, lines: [[sg(`Name ${hl('three things')}`)], [sg('you can see:')]] },
  { a: TL.lamp.start - 0.06, b: S.s3 - 0.05, size: 96, lines: [[sg('A lamp.', TL.lamp.start - 0.04), sg(' A mug.', TL.mug.start - 0.04)], [sg('Your notebook.', TL.nb.start - 0.04)]] },
  { a: TL.hear.start - 0.06, b: TL.clock.start - 0.08, size: 96, lines: [[sg(`${hl('Two sounds')}`)], [sg('you can hear:')]] },
  { a: TL.clock.start - 0.06, b: S.s4 - 0.05, size: 96, lines: [[sg('A clock ticking.', TL.clock.start - 0.04)], [sg('Your own breath.', TL.breath.start - 0.04)]] },
  { a: TL.feel.start - 0.06, b: TL.qual.start - 0.12, size: 96, lines: [[sg(`${hl('One physical sensation:')}`)], [sg('your feet on the floor.', TL.feet.start - 0.04)]] },
  { a: TL.qual.start - 0.06, b: qualSplit - 0.12, size: 96, lines: [[sg(q("It won't solve"))], [sg(q("what's worrying you,"))]] },
  { a: qualSplit - 0.06, b: S.s5 - 0.05, size: 96, lines: [[sg('but it brings your attention')], [sg('back to the present.')]] },
  { a: TL.three.start - 0.06, b: TL.back.start - 0.12, size: 118, lines: [[sg('Three,', TL.three.start - 0.04), sg(' two,', TL.two.start - 0.04), sg(' one.', TL.one.start - 0.04)]] },
  { a: TL.back.start - 0.06, b: TL.cta.start - 0.2, size: 96, lines: [[sg('Then return to')], [sg('what you were doing.')]] },
  { a: TL.cta.start - 0.1, b: 99, size: 96, lines: [[sg('Take a mindful break')], [sg('with Mello.')]] },
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
  placeFigure(t, P);
  setChips(t);
  setCamera(t);
  setHighlights(t);
  ink.forEach((ln, i) => {
    const w = t - T.writeA - i * 0.85, k = clamp(w / 0.85);
    ln.scale.x = Math.max(0.0001, 0.06 * k); ln.position.x = NB.w * 0.18 + 0.03 * k;
    ln.visible = w > 0;
  });
  lampLight.intensity = 0.35 * sm(remap(t, S.s5 - 0.2, S.s5 + 1.5));
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

// redraw numeral textures now that the font is present
for (const g of ALL_TAGS) {
  const { canvas: c, g: ctx } = g.userData.tx;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = '400 230px "Instrument Serif"'; ctx.fillStyle = '#17122E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(g.userData.n), c.width / 2, c.height * 0.56);
  g.userData.tx.tex.needsUpdate = true;
}
renderAt(0);
window.ready = true;
