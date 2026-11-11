// Mello 30 s english12-01 (English): "why an unfinished task follows you into bed, and how to park it" (Masicampo &
// Baumeister 2011; Scullin et al. 2018). First episode under the 2026-11-11 rules (context/10 section 8): story built as
// hook -> escalation -> proof -> payoff -> CTA, one visual idea at a time, large brief labels, captions inside x 100-900,
// and the palette sampled from the current Play Store icon and screenshots (pale lavender #EDE8FE stage, ink #191632,
// primary violet #633BFE, mascot lilac #E6D2FC, deep violet #5B45A3, dark UI #060513, gold sparkle #FEC357).
// The approved format, narrator, room, rig, camera helper, caption mechanics and the oriented-box audit are carried over
// from ../../2026-11-09-english-11/project. New: an open violet loop (the unfinished task) that orbits the performer and
// intrudes on his reading, a dark in-app-style card (intrusions stop with a plan; the sleep-lab comparison), a bedside lamp,
// and a notebook on the lap where the next step and its time are written and the loop closes ("parked").
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
const intrudeSplit = SPL('intrude'), sleepSplit = SPL('sleep'), parkSplit = SPL('park'), exampleSplit = SPL('example');
// word starts measured with faster-whisper word timestamps on generated/narration.wav (see notes): "unfinished task" 0.87,
// "follow you into bed" 1.73, "unfinished goals" 4.0, "intruding" 5.36, "other tasks" 6.0, "specific plan" 7.72,
// "intrusions stop" 9.12, "sleep lab" 10.87, "to-do list" 12.61, "fell asleep faster" 13.17, "listing finished tasks" 14.91,
// "not a cure" 16.65, "the loop can wait" 17.65, "park it" 19.27, "jot down the next step" 20.02, "when you'll do it" 21.18,
// "Email Sam" 22.4, "tomorrow at nine" 23.35
const S = { s1: 0.0, s2: 3.05, s3: 7.0, s4: 10.45, s5: 18.85, end: 30.0 };
const T = {
  pass1: 3.95, pass2: 5.25, pass3: 6.2,                                    // the loop cuts between eyes and page
  blips: S.s3 + 0.1, planIn: 7.75, stop: 9.1,                               // card: intrusions stream, a plan, they stop
  lab: TL.sleep.start + 0.15, todo: 12.6, todoBar: 13.15, done: 14.9, doneBar: 15.2,
  wait: 17.6,                                                               // "the loop can wait": it slows and hangs
  write1A: 20.0, write1B: 21.0, write2A: 21.2, write2B: 21.95,             // "Email Sam" / "tomorrow, 9:00"
  parkA: 22.45, parkB: 23.9,                                                // the loop lands on the page and closes
  closeA: 24.3, closeB: 24.9, lampA: 24.6, lampB: 26.2,
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






// ---------------------------------------------------------------- episode props: store palette, bed, lamp, loop, card, notebook
// palette sampled 2026-11-11 from the current Play listing (icon sha256 3182c61f… = assets/icon.png, 7 screenshots)
const PAL = { bg: '#EDE8FE', ink: '#191632', violet: '#633BFE', lilac: '#E6D2FC', deep: '#5B45A3', dark: '#060513', gold: '#FEC357', mute: '#8E86AE' };
scene.background.set('#EAE4F4');   // = the stage as rendered (target #EDE8FE; the warm key light caps blue), so no horizon line shows
M.stage.color.set('#F8F6FF'); M.rug.color.set('#ECE6FB'); hemi.color.set('#F6F3FF'); hemi.groundColor.set('#DCD3F2');
M.fig.color.set('#8270C4'); M.hair.color.set(PAL.deep); M.cover.color.set('#F4B84A');
const INK = PAL.ink, UI = '"Inter", sans-serif', SERIF = '"Instrument Serif", serif';
function rr(g, x, y, w, h, r, fill, stroke, lw = 4) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function pillTxt(g, txt, cx, cy, size, fill, col = INK, a = 1) { if (a <= 0) return; g.globalAlpha = a; g.font = `400 ${size}px ${SERIF}`; const w = g.measureText(txt).width + size * 0.7; rr(g, cx - w / 2, cy - size * 0.66, w, size * 1.3, size * 0.34, fill); g.fillStyle = col; g.textAlign = 'center'; g.fillText(txt, cx, cy + size * 0.03); g.textAlign = 'left'; g.globalAlpha = 1; }
function makeCard(w, h) {   // dark, in-app style card (the store screenshots' UI surface) with a violet rim
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

// ---- the bed and the nightstand (as english11), lilac duvet
const M_BED = std('#E7D9C6', 0.72), M_SHEET = std('#FAF8FF', 0.92), M_DUVET = std(PAL.lilac, 0.95);
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
  blob(0.55, 0.52, 0.45).position.set(NIGHT.x, 0.012, NIGHT.z);
}
// ---- bedside lamp (warm), dims at the end
const bLamp = new THREE.Group();
bLamp.add(mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.016, 32), M.lamp));
{ const st = mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.3, 12), M.lamp); st.position.y = 0.15; bLamp.add(st); }
const bShadeMat = new THREE.MeshStandardMaterial({ color: '#FFF4E2', roughness: 0.6, emissive: new THREE.Color('#FFD9A0'), emissiveIntensity: 0.55, side: THREE.DoubleSide });
const bShade = mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.12, 32, 1, true), bShadeMat, false, false); bShade.position.y = 0.33; bLamp.add(bShade);
bLamp.position.set(NIGHT.x - 0.06, NIGHT.y, NIGHT.z - 0.07); scene.add(bLamp);
blob(0.18, 0.18, 0.45, NIGHT.y + 0.001).position.set(NIGHT.x - 0.06, NIGHT.y + 0.001, NIGHT.z - 0.07);
const bLight = new THREE.PointLight('#ffd6a0', 0.9, 2.2, 2); bLight.position.set(NIGHT.x - 0.06, NIGHT.y + 0.3, NIGHT.z - 0.07); scene.add(bLight);

// ---- the reading book (ochre hardcover; the cover opens about the spine)
const BK = { w: 0.15, d: 0.22, h: 0.034 };
const book = new THREE.Group();
{ const pg = mesh(new RoundedBoxGeometry(BK.w - 0.008, BK.h - 0.008, BK.d - 0.01, 2, 0.003), M.pages); book.add(pg);
  const bk = mesh(new RoundedBoxGeometry(BK.w, 0.004, BK.d, 2, 0.0018), std('#B98EEA', 0.7)); bk.position.y = -BK.h / 2 + 0.002; book.add(bk);
  const sp = mesh(new RoundedBoxGeometry(0.006, BK.h, BK.d, 2, 0.002), std('#B98EEA', 0.7)); sp.position.x = -BK.w / 2 + 0.003; book.add(sp); }
const bookCover = new THREE.Group(); bookCover.position.set(-BK.w / 2, BK.h / 2 - 0.002, 0); book.add(bookCover);
{ const cv = mesh(new RoundedBoxGeometry(BK.w, 0.004, BK.d, 2, 0.0018), std('#B98EEA', 0.7)); cv.position.set(BK.w / 2, 0, 0); bookCover.add(cv); }
// printed lines on the open page (reading)
{ const c = document.createElement('canvas'); c.width = 256; c.height = 380; const g = c.getContext('2d'); g.fillStyle = '#C9C2DA'; for (let i = 0; i < 11; i++) g.fillRect(26, 40 + i * 30, i % 4 === 3 ? 130 : 200, 9);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(BK.w - 0.02, BK.d - 0.03), new THREE.MeshBasicMaterial({ map: tx, transparent: true }));
  pl.rotation.x = -Math.PI / 2; pl.position.y = BK.h / 2 - 0.004 + 0.0012; book.add(pl); }
scene.add(book);

// ---- the notebook on the lap: the written plan ("Email Sam" / "tomorrow, 9:00")
const pageTx = (() => { const c = document.createElement('canvas'); c.width = 520; c.height = 700; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g: c.getContext('2d'), t, key: '' }; })();
const PAGE = { w: NB.w - 0.024, d: NB.d - 0.03 };
const pageText = new THREE.Mesh(new THREE.PlaneGeometry(PAGE.w, PAGE.d), new THREE.MeshBasicMaterial({ map: pageTx.t, transparent: true, depthWrite: false }));
pageText.rotation.x = -Math.PI / 2; pageText.position.y = NB.h / 2 - 0.002 + 0.0016; pageText.renderOrder = 4; notebook.add(pageText);
const TXT = [{ s: 'Email Sam', x: 46, y: 250, size: 104 }, { s: 'tomorrow, 9:00', x: 46, y: 420, size: 92 }];
const NINE = { u: 0, v: 420 };   // filled after layout: centre of "9:00" on the page canvas
function drawPage(p1, p2) {
  const key = p1.toFixed(3) + '|' + p2.toFixed(3); if (key === pageTx.key) return; pageTx.key = key;
  const g = pageTx.g; g.clearRect(0, 0, 520, 700); g.textBaseline = 'middle';
  g.fillStyle = '#9C8AD0'; g.font = `600 34px ${UI}`; g.fillText('NEXT STEP', 46, 130);
  [[TXT[0], p1], [TXT[1], p2]].forEach(([L, p]) => { if (p <= 0) return; g.font = `italic 400 ${L.size}px ${SERIF}`; const w = g.measureText(L.s).width;
    g.save(); g.beginPath(); g.rect(L.x - 10, L.y - L.size, (w + 20) * p, L.size * 2); g.clip(); g.fillStyle = INK; g.fillText(L.s, L.x, L.y); g.restore(); });
  g.font = `italic 400 ${TXT[1].size}px ${SERIF}`; const w0 = g.measureText('tomorrow, ').width, w9 = g.measureText('9:00').width; NINE.u = TXT[1].x + w0 + w9 / 2;
  pageTx.t.needsUpdate = true;
}
// the note card: the same plan, large and readable, floating above the lap (camera-facing, fixed screen spot)
const NOTE = { w: 0.5, h: 0.34, cw: 1000, ch: 680 };
const note = new THREE.Group();
const noteBody = mesh(new RoundedBoxGeometry(NOTE.w, NOTE.h, 0.01, 3, 0.022), new THREE.MeshBasicMaterial({ color: '#FFFDF7', transparent: true, toneMapped: false }), false, false); note.add(noteBody);
const noteTx = (() => { const c = document.createElement('canvas'); c.width = NOTE.cw; c.height = NOTE.ch; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g: c.getContext('2d'), t, key: '' }; })();
const notePlane = new THREE.Mesh(new THREE.PlaneGeometry(NOTE.w - 0.01, NOTE.h - 0.01), new THREE.MeshBasicMaterial({ map: noteTx.t, transparent: true, depthWrite: false, toneMapped: false }));
notePlane.position.z = 0.0062; notePlane.renderOrder = 5; note.add(notePlane); note.userData = { body: noteBody }; scene.add(note);
const NTXT = [{ s: 'Email Sam', x: 70, y: 290, size: 176 }, { s: 'tomorrow, 9:00', x: 70, y: 500, size: 150 }];
const NNINE = { u: 0, v: 500 };
function drawNote(p1, p2) {
  const key = p1.toFixed(3) + '|' + p2.toFixed(3); if (key === noteTx.key) return; noteTx.key = key;
  const g = noteTx.g; g.clearRect(0, 0, NOTE.cw, NOTE.ch); g.textBaseline = 'middle';
  g.fillStyle = PAL.deep; g.font = `600 52px ${UI}`; g.fillText('NEXT STEP', 74, 120);
  [[NTXT[0], p1], [NTXT[1], p2]].forEach(([L, p]) => { if (p <= 0) return; g.font = `italic 400 ${L.size}px ${SERIF}`; const w = g.measureText(L.s).width;
    g.save(); g.beginPath(); g.rect(L.x - 10, L.y - L.size, (w + 24) * p, L.size * 2); g.clip(); g.fillStyle = INK; g.fillText(L.s, L.x, L.y); g.restore(); });
  g.font = `italic 400 ${NTXT[1].size}px ${SERIF}`; NNINE.u = NTXT[1].x + g.measureText('tomorrow, ').width + g.measureText('9:00').width / 2;
  noteTx.t.needsUpdate = true;
}
const notePoint = (u, v) => note.localToWorld(V((u / NOTE.cw - 0.5) * (NOTE.w - 0.01), -(v / NOTE.ch - 0.5) * (NOTE.h - 0.01), 0.012));
function anchor(obj, cx, cy, wpx, wWorld) {
  const dd = 2.2, th = Math.tan(camera.fov * D2R / 2), q = camera.quaternion;
  const nx = 2 * cx / W - 1, ny = 1 - 2 * cy / H;
  obj.position.copy(camera.position).add(V(0, 0, -1).applyQuaternion(q).multiplyScalar(dd))
    .add(V(1, 0, 0).applyQuaternion(q).multiplyScalar(nx * dd * th * W / H)).add(V(0, 1, 0).applyQuaternion(q).multiplyScalar(ny * dd * th));
  obj.quaternion.copy(q); obj.scale.setScalar((wpx / H * 2 * dd * th) / wWorld);
}
const pagePoint = (u, v, lift = 0.004) => notebook.localToWorld(V((u / 520 - 0.5) * PAGE.w, NB.h / 2 + lift, (v / 700 - 0.5) * PAGE.d));

// ---- the open loop (the unfinished task): a violet arc with a gold spark at its open end; it closes when parked
const loopG = new THREE.Group(); scene.add(loopG);
const loopSpin = new THREE.Group(); loopG.add(loopSpin);
const loopMat = new THREE.MeshBasicMaterial({ color: PAL.violet, toneMapped: false, transparent: true });
const glowMat = new THREE.MeshBasicMaterial({ color: '#B9A4FF', toneMapped: false, transparent: true, opacity: 0.28, depthWrite: false });
let loopMesh = null, glowMesh = null, loopArcKey = -1;
const spark = new THREE.Mesh(new THREE.OctahedronGeometry(0.016, 0), new THREE.MeshBasicMaterial({ color: PAL.gold, toneMapped: false, transparent: true })); loopSpin.add(spark);
const LOOP_R = 0.1;
function setLoopArc(a) {
  const k = Math.round(a * 200); if (k === loopArcKey) return; loopArcKey = k;
  if (loopMesh) { loopSpin.remove(loopMesh, glowMesh); loopMesh.geometry.dispose(); glowMesh.geometry.dispose(); }
  loopMesh = new THREE.Mesh(new THREE.TorusGeometry(LOOP_R, 0.011, 14, 120, a), loopMat); loopMesh.renderOrder = 7;
  glowMesh = new THREE.Mesh(new THREE.TorusGeometry(LOOP_R, 0.026, 10, 120, a), glowMat); glowMesh.renderOrder = 6;
  loopSpin.add(loopMesh, glowMesh);
  spark.position.set(Math.cos(a) * LOOP_R, Math.sin(a) * LOOP_R, 0);
}
const OPEN = 1.62 * Math.PI;
setLoopArc(OPEN);

// ---- the card (S3-S4): intrusions stop with a plan -> the sleep-lab comparison
const CARD_POS = V(-2.45, 1.64, -0.5);
const card = makeCard(0.7, 0.52); const cardTx = cardCanvas(card, 0.68, 0.505, 1220, 906);
const blipAt = i => T.blips + 0.18 + i * 0.27;   // intrusion blips arrive until the plan stops them
function drawCard(t) {
  const mA = sm(remap(t, T.blips - 0.1, T.blips + 0.25)), mB = sm(remap(t, T.lab - 0.35, T.lab));
  const nB = Math.max(0, Math.min(40, Math.floor((Math.min(t, T.stop) - T.blips) / 0.27)));
  const pl = sm(remap(t, T.planIn, T.planIn + 0.35)), st = sm(remap(t, T.stop, T.stop + 0.3));
  const td = sm(remap(t, T.todo - 0.1, T.todo + 0.25)), tb = eio(remap(t, T.todoBar, T.todoBar + 0.6)), dn = sm(remap(t, T.done - 0.1, T.done + 0.25)), db = eio(remap(t, T.doneBar, T.doneBar + 0.9));
  const key = [mA, mB, nB, pl, st, td, tb, dn, db, Math.floor(t * 15) % 1000].map(x => (+x).toFixed(3)).join('|'); if (key === cardTx.key) return; cardTx.key = key;
  const { c, g, t: tex } = cardTx; g.clearRect(0, 0, c.width, c.height); g.textBaseline = 'middle'; g.textAlign = 'left';
  if (mB < 1) {   // A: "intrusions" -- blips stream in over time until a plan lands, then the line goes quiet
    const a = mA * (1 - mB); g.globalAlpha = a; g.fillStyle = '#FFFFFF'; g.font = `400 120px ${SERIF}`; g.fillText('intrusions', 60, 110);
    const X0 = 80, X1 = 1140, Y = 640, px = (tt) => X0 + (X1 - X0) * clamp((tt - T.blips) / (T.stop + 1.4 - T.blips));
    g.fillStyle = '#3A3264'; g.fillRect(X0, Y, X1 - X0, 8);
    const now = px(Math.min(t, T.stop + 1.4));
    g.fillStyle = '#B9A4FF'; g.fillRect(X0, Y, Math.max(0, now - X0), 8);
    for (let i = 0; i < nB; i++) { const ti = blipAt(i); if (ti > t || ti > T.stop) break; const x = px(ti), h = 120 + 90 * ((i * 37) % 5) / 4, pop = sm(remap(t, ti, ti + 0.15));
      g.globalAlpha = a; g.strokeStyle = PAL.violet; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, Y); g.lineTo(x, Y - h * pop); g.stroke();
      g.fillStyle = '#B9A4FF'; g.beginPath(); g.arc(x, Y - h * pop, 24, 0, 7); g.fill(); }
    if (pl > 0) { const x = px(T.planIn + 0.35); g.globalAlpha = a * pl; rr(g, x - 70, Y - 290 + (1 - pl) * -80, 140, 170, 16, '#FBF8F0'); g.fillStyle = '#9C8AD0'; for (let k = 0; k < 4; k++) g.fillRect(x - 46, Y - 250 + k * 32 + (1 - pl) * -80, k === 3 ? 50 : 92, 9);
      pillTxt(g, 'plan', x, Y + 130, 100, PAL.violet, '#FFFFFF', a * pl); }
    g.globalAlpha = 1;
  }
  if (mB > 0) {   // B: falling asleep -- to-do list vs done list (schematic bars, direction only)
    const a = mB; g.globalAlpha = a; g.fillStyle = '#FFFFFF'; g.font = `400 112px ${SERIF}`; g.fillText('falling asleep', 60, 110);
    g.fillStyle = PAL.gold; g.beginPath(); g.arc(1110, 100, 44, 0, 7); g.fill(); g.fillStyle = PAL.dark; g.beginPath(); g.arc(1132, 84, 40, 0, 7); g.fill();
    const row = (y, lab, p, lb, col, frac) => { if (lb <= 0) return; g.globalAlpha = a * lb; g.fillStyle = '#FFFFFF'; g.font = `400 104px ${SERIF}`; g.fillText(lab, 70, y);
      rr(g, 70, y + 70, 1060, 84, 42, '#1C1736'); if (p > 0) rr(g, 70, y + 70, Math.max(84, 1060 * frac * p), 84, 42, col); };
    row(310, 'to-do list', tb, td, PAL.violet, 0.42);
    row(600, 'done list', db, dn, '#5E577E', 0.78);
    g.globalAlpha = 1;
  }
  tex.needsUpdate = true;
}

// ---------------------------------------------------------------- choreography: seated on the bed edge throughout
const SEATB = V(BED.x + BED.w / 2 - 0.06, 0.585, -0.42);
function pose(t) {
  const P = {};
  P.breath = Math.sin(t * 2 * Math.PI / (t > T.lampA ? 5.2 : 4.2));
  P.yaw = -Math.PI / 2;
  const read = t >= S.s2 && t < S.s5, write = t >= S.s5;
  P.lean = track(t, [[0, 0.1], [S.s2, 0.16], [S.s5, 0.24], [T.closeB, 0.24], [T.closeB + 0.8, 0.05], [30, 0.03]]);
  P.headPitch = track(t, [[0, -0.12], [S.s2 - 0.01, -0.12], [S.s2, -0.55], [S.s5 - 0.01, -0.55], [S.s5, -0.75], [T.closeB, -0.75], [T.closeB + 0.8, -0.05], [30, 0.0]]);
  P.headYaw = track(t, [[0, 0.1], [S.s2, 0.0], [T.wait, 0.0], [T.wait + 0.6, -0.35], [S.s5 - 0.01, -0.3], [S.s5, 0.0], [30, 0.0]]);
  P.read = read; P.write = write;
  return P;
}
function basisFacing(pos, target, lat) {   // object basis: local +y faces target, local +x along lat
  const y = target.clone().sub(pos).normalize(); const x = lat.clone().sub(y.clone().multiplyScalar(lat.dot(y))).normalize(); const z = x.clone().cross(y);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}
const camQ = new THREE.Quaternion();
function placeFigure(t, P) {
  const br = P.breath;
  const pel = SEATB.clone();
  torso.position.copy(pel);
  torso.rotation.set(-P.lean, P.yaw + P.headYaw * 0.15, 0, 'YXZ');
  torso.scale.set(1 + 0.006 * br, 1 + 0.01 * br, 1 + 0.008 * br);
  neckG.rotation.set(0, 0, 0);
  head.rotation.set(P.headPitch + P.lean * 0.45, P.headYaw, 0, 'YXZ');
  torso.updateMatrixWorld(true);
  const fwd = V(-Math.sin(P.yaw), 0, -Math.cos(P.yaw)), lat = V(Math.cos(P.yaw), 0, -Math.sin(P.yaw)), upv = V(0, 1, 0);
  const base = V(pel.x, 0, pel.z);
  const shL = torso.localToWorld(V(-0.15, 0.315, 0.0)), shR = torso.localToWorld(V(0.15, 0.315, 0.0));
  const ankles = [-1, 1].map(sx => base.clone().add(fwd.clone().multiplyScalar(0.42)).add(lat.clone().multiplyScalar(sx * 0.11 + 0.04)).add(V(0, 0.075, 0)));
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    const hip = torso.localToWorld(V(sx * 0.085, 0.02, 0.0)); hip.y = Math.max(hip.y, 0.55);
    const pole = fwd.clone().multiplyScalar(0.8).add(upv).add(lat.clone().multiplyScalar(sx * 0.15));
    const r = ik(hip, ankles[i], 0.4, 0.43, pole);
    const [th, sh, hi, kn, an] = i === 0 ? [limbs.thL, limbs.shL, J.hiL, J.knL, J.anL] : [limbs.thR, limbs.shR, J.hiR, J.knR, J.anR];
    hi.position.copy(hip); kn.position.copy(r.mid); an.position.copy(r.end);
    setLimb(th, hip, r.mid); setLimb(sh, r.mid, r.end);
    feet[i].position.copy(r.end).add(fwd.clone().multiplyScalar(0.045)); feet[i].position.y = r.end.y - 0.047; feet[i].rotation.set(0, P.yaw + sx * -0.08, 0);
    footBlobs[i].position.set(feet[i].position.x, 0.013, feet[i].position.z); footBlobs[i].material.opacity = 0.6;
  }
  const headP = head.getWorldPosition(V(0, 0, 0));
  const at = (f, l, u) => pel.clone().add(fwd.clone().multiplyScalar(f)).add(lat.clone().multiplyScalar(l)).add(V(0, u, 0));
  const restL = at(0.3, -0.13, 0.06), restR = at(0.3, 0.13, 0.06);
  let hL = restL, hR = restR;
  // the book: open in both hands while reading (S2-S4); otherwise on the nightstand
  if (P.read) { const rd = at(0.3, 0.0, 0.34); book.position.copy(rd); book.quaternion.copy(basisFacing(rd, headP, lat)); bookCover.rotation.z = Math.PI * 0.97;
    hL = rd.clone().add(lat.clone().multiplyScalar(-0.078)); hR = rd.clone().add(lat.clone().multiplyScalar(0.078)); }
  else { book.position.set(NIGHT.x + 0.06, NIGHT.y + BK.h / 2, NIGHT.z + 0.08); book.quaternion.setFromEuler(new THREE.Euler(0, 0.5, 0)); bookCover.rotation.z = 0; }
  // the notebook: on the lap while writing (S5), the cover closes after the loop is parked
  if (P.write) {
    const nb = at(0.3, 0.0, 0.12); notebook.visible = true; notebook.position.copy(nb);
    const q = basisFacing(nb, headP.clone().add(V(0, 0.9, 0)), lat); notebook.quaternion.copy(q); notebook.updateMatrixWorld(true);
    coverPivot.rotation.z = Math.PI * 0.985 * (1 - eio(remap(t, T.closeA, T.closeB)));
    const p1 = clamp(remap(t, T.write1A, T.write1B)), p2 = clamp(remap(t, T.write2A, T.write2B));
    drawPage(p1, p2); pageText.visible = t < T.closeA + 0.15;
    // the pencil follows the writing cursor
    const L = p2 > 0 && p2 < 1 ? TXT[1] : TXT[0], p = p2 > 0 && p2 < 1 ? p2 : (p1 < 1 ? p1 : 1);
    pageTx.g.font = `italic 400 ${L.size}px ${SERIF}`; const wL = pageTx.g.measureText(L.s).width;
    const wig = 0.006 * Math.sin(t * 38) * (((p1 > 0 && p1 < 1) || (p2 > 0 && p2 < 1)) ? 1 : 0);
    const tip = pagePoint(L.x + wL * p, L.y + 10, 0.003).add(V(0, wig, 0));
    const away = sm(remap(t, T.parkA - 0.4, T.parkA)) * (1 - sm(remap(t, T.closeB, T.closeB + 0.6)));
    const grip = tip.clone().add(V(0, 0.07, 0)).add(lat.clone().multiplyScalar(0.03)).add(fwd.clone().multiplyScalar(-0.03));
    hR = vl(grip, at(0.36, 0.17, 0.16), away);
    if (t >= T.closeB + 0.3) hR = vl(at(0.36, 0.17, 0.16), restR, sm(remap(t, T.closeB + 0.3, T.closeB + 0.9)));
    pencil.visible = true; pencil.position.copy(hR.clone().add(V(0, -0.01, 0)));
    const pdir = (away < 0.5 ? tip.clone().sub(hR) : fwd.clone().add(V(0, -0.4, 0))).normalize(); pencil.quaternion.setFromUnitVectors(V(0, 1, 0), pdir);
    if (t >= T.closeB + 0.9) { pencil.position.set(NIGHT.x + 0.1, NIGHT.y + 0.006, NIGHT.z + 0.12); pencil.rotation.set(Math.PI / 2, 0, 0.6); }
    hL = pagePoint(20, 560, 0.01).add(lat.clone().multiplyScalar(-0.02));
    if (t >= T.closeB) hL = vl(hL, restL, sm(remap(t, T.closeB, T.closeB + 0.7)));
  } else { notebook.visible = false; pencil.visible = false; }
  const pole = sx => lat.clone().multiplyScalar(sx * 0.8).add(V(0, -0.6, 0)).sub(fwd.clone().multiplyScalar(0.2));
  const aL = ik(shL, hL, 0.25, 0.235, pole(-1)), aR = ik(shR, hR, 0.25, 0.235, pole(1));
  J.shL.position.copy(shL); J.shR.position.copy(shR); J.elL.position.copy(aL.mid); J.elR.position.copy(aR.mid);
  J.haL.position.copy(aL.end); J.haR.position.copy(aR.end);
  setLimb(limbs.uaL, shL, aL.mid); setLimb(limbs.faL, aL.mid, aL.end); setLimb(limbs.uaR, shR, aR.mid); setLimb(limbs.faR, aR.mid, aR.end);
  J.haL.lookAt(aL.mid); J.haR.lookAt(aR.mid);
  figRef.headP = headP; figRef.fwd = fwd; figRef.lat = lat;
}
const figRef = {};
// the loop's path: orbit the head (S1) -> cut between eyes and page three times (S2) -> calmer orbit (S3-S4) -> hang by the
// nightstand ("can wait") -> land on "9:00" on the page and close (S5) -> a small closed ring on the closed notebook
function placeLoop(t, headP, fwd, lat) {
  const orbit = (r, w, y) => headP.clone().add(fwd.clone().multiplyScalar(Math.cos(w) * r)).add(lat.clone().multiplyScalar(Math.sin(w) * r)).add(V(0, y + 0.03 * Math.sin(w * 1.7), 0));
  let pos, s = 1, flat = 0, arc = OPEN, op = 1;
  if (t < S.s2) pos = orbit(0.27, 0.9 + t * 1.5, 0.06);
  else if (t < S.s3) {
    const home = orbit(0.22, 0.9 + t * 1.1, -0.04);   // lower and tighter in the close reading shot, clear of the captions
    const book0 = book.position.clone(), between = headP.clone().lerp(book0, 0.55).add(fwd.clone().multiplyScalar(0.02));
    let k = 0; for (const p of [T.pass1, T.pass2, T.pass3]) k = Math.max(k, sm(remap(t, p - 0.28, p)) * (1 - sm(remap(t, p + 0.32, p + 0.62))));
    pos = vl(home, between, k); s = lerp(1, 0.85, k);
  } else if (t < T.wait) { const calm = sm(remap(t, T.stop, T.stop + 1.0)); pos = orbit(lerp(0.27, 0.32, calm), 0.9 + t * lerp(1.1, 0.45, calm), 0.12); s = lerp(1, 0.85, calm); }
  else if (t < S.s5) { const from = orbit(0.32, 0.9 + T.wait * 0.45, 0.12), hang = V(NIGHT.x + 0.02, NIGHT.y + 0.55 + 0.02 * Math.sin(t * 1.6), NIGHT.z + 0.05);
    pos = vl(from, hang, eio(remap(t, T.wait, T.wait + 0.9))); s = 0.85; }
  else {
    const hang = V(NIGHT.x + 0.04, NIGHT.y + 0.5 + 0.02 * Math.sin(t * 1.6), NIGHT.z + 0.15);
    const land = notePoint(NNINE.u, NNINE.v + 6), u = eio(remap(t, T.parkA, T.parkB - 0.5));
    pos = vl(hang, land, u); pos.y += 0.05 * Math.sin(Math.PI * u);
    s = lerp(0.85, note.scale.x * 0.62, u); arc = lerp(OPEN, 2 * Math.PI, eio(remap(t, T.parkB - 0.6, T.parkB)));
    if (t >= T.closeA) { const k = eio(remap(t, T.closeA, T.closeB)), cv = notebook.localToWorld(V(0.02, NB.h / 2 + 0.004, -0.03)); pos = vl(land, cv, k); s = lerp(note.scale.x * 0.62, 0.42, k); flat = k; }
  }
  setLoopArc(arc);
  const onTop = t >= S.s5; loopMat.depthTest = glowMat.depthTest = spark.material.depthTest = !onTop; if (loopMesh) { loopMesh.renderOrder = onTop ? 9 : 7; glowMesh.renderOrder = onTop ? 8 : 6; } spark.renderOrder = onTop ? 10 : 7;
  loopG.position.copy(pos); loopG.scale.setScalar(s);
  camQ.copy(camera.quaternion);
  const qFlat = notebook.visible ? notebook.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))) : camQ;
  loopG.quaternion.slerpQuaternions(camQ, qFlat, flat);
  const closed = sm(remap(t, T.parkB - 0.4, T.parkB));
  loopSpin.rotation.z = (1 - closed) * (t * 1.3) + closed * (T.parkB * 1.3);
  loopMat.color.set(PAL.violet).lerp(new THREE.Color('#8E6BFF'), closed * 0.5); glowMat.opacity = 0.28 + 0.2 * Math.sin(t * 3) * (1 - closed) + closed * 0.15;
  spark.material.opacity = op * (1 - closed) + closed * (1 - sm(remap(t, T.parkB, T.parkB + 0.8)));
  spark.scale.setScalar(1 + 0.3 * Math.sin(t * 6) + closed * 1.5 * (1 - sm(remap(t, T.parkB, T.parkB + 0.8))));
}
function setProps(t) {
  nbBlob.material.opacity = 0; ink.forEach(ln => { ln.visible = false; });
}
function setEpisode(t) {
  // note card (S5): anchored above the lap, written in sync with the pencil, then it drops into the notebook as it closes
  const nIn = sm(remap(t, S.s5 + 0.3, S.s5 + 0.7)), nOut = sm(remap(t, T.closeA - 0.1, T.closeB - 0.1));
  note.visible = t >= S.s5 && nIn * (1 - nOut) > 0.003;
  if (note.visible) { anchor(note, 540, 790, 640 * lerp(0.92, 1, nIn) * (1 - 0.55 * nOut), NOTE.w);
    if (nOut > 0) { const nb = notebook.getWorldPosition(V(0, 0, 0)); note.position.lerp(nb, nOut * 0.85); }
    noteBody.material.opacity = nIn * (1 - nOut); notePlane.material.opacity = nIn * (1 - nOut);
    drawNote(clamp(remap(t, T.write1A, T.write1B)), clamp(remap(t, T.write2A, T.write2B))); }
  placeLoop(t, figRef.headP, figRef.fwd, figRef.lat);   // after setCamera: the loop faces this frame's camera
  const camYaw = p => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
  // card (S3-S4)
  const v = sm(remap(t, S.s3 - 0.05, S.s3 + 0.25)) * (1 - sm(remap(t, TL.qual.start - 0.45, TL.qual.start - 0.1)));
  card.visible = v > 0.003; card.position.copy(CARD_POS); card.rotation.set(0, camYaw(CARD_POS), 0); card.scale.setScalar(1.0);
  card.userData.border.material.opacity = v; card.userData.panel.material.opacity = v; cardTx.m.material.opacity = v;
  if (card.visible) drawCard(t);
  // evening light: the bedside lamp dims after the loop is parked; the room settles a little
  const dim = sm(remap(t, T.lampA, T.lampB));
  bLight.intensity = 0.9 * (1 - 0.8 * dim); bShadeMat.emissiveIntensity = 0.55 * (1 - 0.75 * dim);
  hemi.intensity = 2.0 * (1 - 0.12 * dim); key.intensity = 1.9 * (1 - 0.2 * dim); front.intensity = 0.9 * (1 - 0.15 * dim);
}


// ---------------------------------------------------------------- cameras
const D2R = Math.PI / 180;
// each shot: start/end of [target, azimuth deg (from +z toward +x), elevation deg, distance, vertical fov]; optional move window m
const SHOTS = [
  // S1 front-right: the performer on the bed edge, the open loop orbiting his head, the lamp on
  { a: S.s1, b: S.s2, k0: [V(-1.62, 1.12, -0.52), 64, 10, 3.0, 30], k1: [V(-1.64, 1.14, -0.52), 68, 11, 2.75, 30] },
  // S2 front-left, closer: reading; the loop cuts between his eyes and the page
  { a: S.s2, b: S.s3, k0: [V(-1.62, 1.08, -0.42), 104, 16, 1.75, 30], k1: [V(-1.62, 1.08, -0.42), 98, 15, 1.62, 30] },
  // S3 front-right: the card above the bed (intrusions stop with a plan)
  { a: S.s3, b: S.s4, k0: [V(-2.32, 1.6, -0.46), 74, 5, 3.5, 30], k1: [V(-2.32, 1.6, -0.46), 70, 5, 3.4, 30] },
  // S4 front-left: the sleep-lab card; then the camera settles down to the performer as the loop hangs by the lamp
  { a: S.s4, b: S.s5, m: [TL.qual.start - 0.4, TL.qual.start + 0.9], ease: 'sine', k0: [V(-2.33, 1.6, -0.56), 108, 11, 3.45, 30], kp: [V(-2.33, 1.6, -0.56), 113, 11, 3.32, 30], k1: [V(-1.7, 1.12, -0.62), 112, 12, 2.7, 30] },
  // S5 front-right, lower and closer: writing on the lap, the plan on the note card; then a slow pull back to the room
  { a: S.s5, b: S.end, m: [T.closeB - 0.2, 27.4], ease: 'sine', k0: [V(-1.6, 1.3, -0.42), 58, 8, 2.6, 30], k1: [V(-1.45, 1.3, -0.45), 66, 13, 3.9, 30],
    k2: [V(-1.47, 1.29, -0.46), 70, 13.5, 3.6, 30] },   // a slow drift under the lock-up so the last seconds keep moving
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
  // crucial in-scene text: the card and the written plan on the notebook page, each audited by its own oriented box
  const onScreen = b => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const keep = b => (onScreen(b) ? b : null);
  const crucial = { card: card.visible ? keep(textBox(card)) : null, note: note.visible && t < T.closeA ? keep(textBox(note)) : null };
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
const sleepP1 = PS('sleep')[0][1], sleepP3 = PS('sleep')[2][1];   // "In a sleep lab," | "people who wrote … faster" | "than those …"
const CAPS = [
  { a: -1, b: TL.intrude.start - 0.12, size: C2, lines: [[sg(`Why does one ${hl('unfinished task')}`)], [sg('follow you into bed?', 1.66)]] },
  { a: TL.intrude.start - 0.06, b: TL.plan.start - 0.12, size: C2, lines: [[sg('In studies, unfinished goals')], [sg(`${hl('kept intruding')} on other tasks.`, 4.96)]] },
  { a: TL.plan.start - 0.06, b: TL.sleep.start - 0.12, size: C2, lines: [[sg(`Writing a ${hl('specific plan')}`)], [sg('made those intrusions stop.', 8.48)]] },
  { a: TL.sleep.start - 0.06, b: sleepP1 - 0.12, size: C1, lines: [[sg('In a sleep lab,')]] },
  { a: sleepP1 - 0.06, b: sleepP3 - 0.12, size: C2, lines: [[sg(`people who wrote a ${hl('to-do list')}`)], [sg(`fell asleep ${hl('faster')}`, 13.1)]] },
  { a: sleepP3 - 0.06, b: TL.qual.start - 0.12, size: C2, lines: [[sg('than those listing')], [sg('finished tasks.', 15.2)]] },
  { a: TL.qual.start - 0.06, b: TL.park.start - 0.12, size: C2, lines: [[sg('Not a cure,')], [sg(`but ${hl('the loop can wait')}.`, 17.5)]] },
  { a: TL.park.start - 0.06, b: parkSplit - 0.12, size: C1, lines: [[sg(`So ${hl('park it')}:`)]] },
  { a: parkSplit - 0.06, b: TL.example.start - 0.12, size: C2, lines: [[sg(`jot down the ${hl('next step')},`)], [sg(`and ${hl('when')} you’ll do it.`, 21.12)]] },
  { a: TL.example.start - 0.06, b: TL.example.end + 0.35, size: C2, lines: [[sg('Email Sam,')], [sg('tomorrow at nine.', 23.3)]] },
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
cardTx.key = ''; pageTx.key = '';
renderAt(0);
window.ready = true;
