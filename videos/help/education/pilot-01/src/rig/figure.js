// Reusable miniature-figure rig for the Help education series.
// One builder makes the recurring host (Tally) and the illustrative extras
// (courier, recipient) so proportions and materials stay consistent.
// All geometry is procedural three.js primitives — no external models.
import * as THREE from 'three';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _q = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);

export function mat(hex, rough = 0.78, extra = {}) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(hex), roughness: rough, metalness: 0, ...extra });
}

function mesh(geo, material, cast = true) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = cast;
  m.receiveShadow = true;
  return m;
}

// Limb segment between two points: unit cylinder stretched to length + a
// round joint sphere at its start, so caps never distort.
class Limb {
  constructor(parent, radius, material) {
    this.mesh = mesh(new THREE.CylinderGeometry(radius, radius, 1, 16, 1, true), material);
    this.joint = mesh(new THREE.SphereGeometry(radius, 16, 12), material);
    parent.add(this.mesh, this.joint);
  }
  set(a, b) {
    const len = Math.max(0.001, a.distanceTo(b));
    this.mesh.position.copy(a).add(b).multiplyScalar(0.5);
    _v3.copy(b).sub(a).normalize();
    this.mesh.quaternion.setFromUnitVectors(UP, _v3);
    this.mesh.scale.set(1, len, 1);
    this.joint.position.copy(a);
  }
}

// Two-bone IK: returns elbow/knee position.
function solveIK(root, target, l1, l2, pole, out) {
  const d = _v1.copy(target).sub(root);
  let dist = d.length();
  const maxReach = (l1 + l2) * 0.999;
  if (dist > maxReach) { d.multiplyScalar(maxReach / dist); dist = maxReach; }
  if (dist < 1e-4) { out.copy(root).add(pole); return out; }
  const dir = d.clone().normalize();
  // angle at root between dir and upper bone
  const cosA = THREE.MathUtils.clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1);
  const a = Math.acos(cosA);
  // bend plane: component of pole perpendicular to dir
  const p = _v2.copy(pole).sub(dir.clone().multiplyScalar(pole.dot(dir)));
  if (p.lengthSq() < 1e-8) p.set(0, 0, 1);
  p.normalize();
  out.copy(root).add(dir.multiplyScalar(Math.cos(a) * l1)).add(p.multiplyScalar(Math.sin(a) * l1));
  return out;
}

/**
 * opts: {
 *  skin, hair, coat, coatDark, trousers, shoe, accent,
 *  hat: 'bucket'|'cap'|'none', hatColor, hatBand,
 *  glasses: bool, satchel: bool, scale, hairStyle: 'curls'|'bun'|'short'
 * }
 */
export function createFigure(opts) {
  const o = Object.assign({
    skin: '#9A6446', hair: '#2A1C17', coat: '#2DB37D', coatDark: '#23925F', trousers: '#2B2F3A', shoe: '#1A1D24',
    accent: '#F2C230', hat: 'none', hatColor: '#F2C230', hatBand: '#2DB37D', glasses: false, satchel: false,
    hairStyle: 'short', scale: 1, collar: '#F7F5EF', cheeks: '#C77B62', mouthInk: '#3A1E19',
  }, opts);

  const M = {
    skin: mat(o.skin, 0.62), hair: mat(o.hair, 0.9), coat: mat(o.coat, 0.85), coatDark: mat(o.coatDark, 0.85),
    trousers: mat(o.trousers, 0.9), shoe: mat(o.shoe, 0.6), accent: mat(o.accent, 0.7), hat: mat(o.hatColor, 0.85),
    hatBand: mat(o.hatBand, 0.85), ink: mat('#0B0D12', 0.35), white: mat('#FFFFFF', 0.25), collar: mat(o.collar, 0.8),
    cheeks: mat(o.cheeks, 0.8, { transparent: true, opacity: 0.55 }), mouth: mat(o.mouthInk, 0.6),
  };

  const root = new THREE.Group();
  root.name = 'figure';
  const body = new THREE.Group(); // scaled container
  body.scale.setScalar(o.scale);
  root.add(body);

  const LEG = 0.34;
  const hips = new THREE.Group();
  hips.position.y = LEG;
  body.add(hips);
  const torso = new THREE.Group();
  hips.add(torso);

  // Coat: bell-shaped lathe
  const coatPts = [];
  const prof = [[0.0, -0.05], [0.25, -0.05], [0.265, 0.02], [0.245, 0.18], [0.215, 0.34], [0.19, 0.46], [0.15, 0.53], [0.08, 0.565], [0.0, 0.57]];
  for (const [r, y] of prof) coatPts.push(new THREE.Vector2(r, y));
  const coat = mesh(new THREE.LatheGeometry(coatPts, 40), M.coat);
  torso.add(coat);
  // hem band
  const hem = mesh(new THREE.TorusGeometry(0.255, 0.018, 8, 40), M.coatDark);
  hem.rotation.x = Math.PI / 2; hem.position.y = -0.03;
  torso.add(hem);
  // collar
  const collar = mesh(new THREE.TorusGeometry(0.1, 0.035, 10, 28), M.collar);
  collar.rotation.x = Math.PI / 2; collar.position.y = 0.55;
  torso.add(collar);
  // buttons
  for (let i = 0; i < 2; i++) {
    const b = mesh(new THREE.SphereGeometry(0.022, 12, 10), M.accent);
    b.position.set(0, 0.36 - i * 0.14, 0.215 + i * 0.02);
    torso.add(b);
  }
  // satchel (Tally's notebook bag)
  let satchelGroup = null;
  if (o.satchel) {
    satchelGroup = new THREE.Group();
    const bag = mesh(new THREE.BoxGeometry(0.17, 0.14, 0.07), M.accent);
    bag.position.set(0, 0, 0);
    const flap = mesh(new THREE.BoxGeometry(0.175, 0.06, 0.075), mat('#D9A81F', 0.7));
    flap.position.set(0, 0.045, 0.004);
    satchelGroup.add(bag, flap);
    satchelGroup.position.set(0.24, 0.1, 0.06);
    satchelGroup.rotation.y = 0.9;
    torso.add(satchelGroup);
    // strap across chest
    const strap = mesh(new THREE.CapsuleGeometry(0.014, 0.62, 4, 8), M.ink);
    strap.position.set(0.02, 0.33, 0.19);
    strap.rotation.z = 0.78; strap.rotation.x = -0.25;
    torso.add(strap);
  }

  // Head
  const neck = new THREE.Group();
  neck.position.y = 0.6;
  torso.add(neck);
  const head = new THREE.Group();
  head.position.y = 0.17;
  neck.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.2, 40, 30), M.skin);
  skull.scale.set(1, 1.02, 0.96);
  head.add(skull);
  // ears
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.045, 14, 10), M.skin);
    ear.position.set(0.195 * s, -0.01, -0.01); ear.scale.set(0.6, 1, 0.8);
    head.add(ear);
  }
  // nose
  const nose = mesh(new THREE.SphereGeometry(0.034, 16, 12), mat(shade(o.skin, -0.08), 0.6));
  nose.position.set(0, -0.025, 0.195); nose.scale.set(1, 0.85, 0.9);
  head.add(nose);
  // cheeks
  for (const s of [-1, 1]) {
    const c = mesh(new THREE.SphereGeometry(0.036, 14, 10), M.cheeks, false);
    c.position.set(0.1 * s, -0.055, 0.165); c.scale.set(1, 0.6, 0.35);
    head.add(c);
  }
  // hair
  const hairG = new THREE.Group();
  head.add(hairG);
  if (o.hairStyle === 'curls') {
    const spots = [[-0.17, 0.02, -0.06], [0.17, 0.02, -0.06], [-0.12, 0.08, -0.13], [0.12, 0.08, -0.13], [0, 0.06, -0.18], [-0.15, -0.06, -0.1], [0.15, -0.06, -0.1], [0, -0.03, -0.19]];
    for (const p of spots) { const h = mesh(new THREE.SphereGeometry(0.07, 14, 10), M.hair); h.position.set(...p); hairG.add(h); }
  } else if (o.hairStyle === 'bun') {
    const cap = mesh(new THREE.SphereGeometry(0.208, 30, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), M.hair);
    cap.rotation.x = -0.35; hairG.add(cap);
    const bun = mesh(new THREE.SphereGeometry(0.085, 18, 14), M.hair);
    bun.position.set(0, 0.12, -0.17); hairG.add(bun);
  } else {
    const cap = mesh(new THREE.SphereGeometry(0.207, 30, 20, 0, Math.PI * 2, 0, Math.PI * 0.42), M.hair);
    cap.rotation.x = -0.25; hairG.add(cap);
  }

  // Eyes
  const eyes = [];
  for (const s of [-1, 1]) {
    const eg = new THREE.Group();
    eg.position.set(0.072 * s, 0.035, 0.178);
    const white = mesh(new THREE.SphereGeometry(0.036, 18, 14), M.white, false);
    white.scale.set(1, 1.05, 0.5);
    const pupil = mesh(new THREE.SphereGeometry(0.022, 16, 12), M.ink, false);
    pupil.position.z = 0.014; pupil.scale.set(1, 1.1, 0.6);
    const glint = mesh(new THREE.SphereGeometry(0.0065, 8, 6), M.white, false);
    glint.position.set(0.008, 0.009, 0.026);
    const lid = new THREE.Group();
    lid.add(white, pupil, glint);
    eg.add(lid);
    head.add(eg);
    eyes.push({ group: eg, lid, pupil, glint, side: s });
  }
  // Glasses
  if (o.glasses) {
    for (const s of [-1, 1]) {
      const rim = mesh(new THREE.TorusGeometry(0.058, 0.009, 8, 30), M.ink, false);
      rim.position.set(0.075 * s, 0.035, 0.2);
      head.add(rim);
      const arm = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.17, 6), M.ink, false);
      arm.rotation.x = Math.PI / 2; arm.position.set(0.13 * s, 0.04, 0.12); arm.rotation.z = 0;
      head.add(arm);
    }
    const bridge = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.04, 6), M.ink, false);
    bridge.rotation.z = Math.PI / 2; bridge.position.set(0, 0.045, 0.206);
    head.add(bridge);
  }
  // Brows
  const brows = [];
  for (const s of [-1, 1]) {
    const b = mesh(new THREE.CapsuleGeometry(0.011, 0.055, 4, 8), mat(o.hair, 0.8), false);
    b.rotation.z = Math.PI / 2;
    const bg = new THREE.Group();
    bg.position.set(0.075 * s, 0.115, 0.19);
    bg.add(b);
    head.add(bg);
    brows.push({ group: bg, side: s });
  }
  // Mouth: smile arc + open cavity
  const mouthG = new THREE.Group();
  mouthG.position.set(0, -0.085, 0.183);
  head.add(mouthG);
  const smile = mesh(new THREE.TorusGeometry(0.036, 0.0085, 8, 20, Math.PI), M.mouth, false);
  smile.rotation.z = Math.PI; // U shape (smile)
  mouthG.add(smile);
  const cavity = mesh(new THREE.SphereGeometry(0.035, 18, 12), M.mouth, false);
  cavity.scale.set(1, 0.2, 0.35);
  cavity.position.y = -0.012;
  mouthG.add(cavity);
  const tongue = mesh(new THREE.SphereGeometry(0.02, 12, 8), mat('#C86A5C', 0.6), false);
  tongue.position.set(0, -0.022, 0.006); tongue.scale.set(1, 0.5, 0.5);
  mouthG.add(tongue);

  // Hat
  const hatG = new THREE.Group();
  head.add(hatG);
  if (o.hat === 'bucket') {
    const crownPts = [[0.0, 0.0], [0.205, 0.0], [0.2, 0.06], [0.185, 0.12], [0.165, 0.155], [0.0, 0.165]].map(([r, y]) => new THREE.Vector2(r, y));
    const crown = mesh(new THREE.LatheGeometry(crownPts, 36), M.hat);
    const brimPts = [[0.19, 0.0], [0.24, -0.015], [0.31, -0.055], [0.318, -0.07], [0.3, -0.068], [0.235, -0.03], [0.19, -0.012]].map(([r, y]) => new THREE.Vector2(r, y));
    const brim = mesh(new THREE.LatheGeometry(brimPts, 40), M.hat);
    const band = mesh(new THREE.CylinderGeometry(0.2015, 0.2035, 0.035, 36, 1, true), M.hatBand);
    band.position.y = 0.022;
    hatG.add(crown, brim, band);
    hatG.position.set(0, 0.11, -0.01);
    hatG.rotation.x = -0.12;
  } else if (o.hat === 'cap') {
    const dome = mesh(new THREE.SphereGeometry(0.212, 30, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), M.hat);
    const peak = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 24, 1, false, -Math.PI / 2, Math.PI), M.hat);
    peak.position.set(0, 0.0, 0.16); peak.scale.set(1, 1, 1.2);
    const button = mesh(new THREE.SphereGeometry(0.02, 8, 6), M.hatBand);
    button.position.y = 0.21;
    hatG.add(dome, peak, button);
    hatG.position.set(0, 0.06, -0.01);
    hatG.rotation.x = -0.1;
  }

  // Limbs (world-space, attached to root's parent at first update)
  const limbsGroup = new THREE.Group();
  limbsGroup.name = 'limbs';
  const R = { arm: 0.045 * o.scale, leg: 0.06 * o.scale };
  const arms = [-1, 1].map((s) => ({
    side: s,
    upper: new Limb(limbsGroup, R.arm, M.coat),
    lower: new Limb(limbsGroup, R.arm * 0.92, M.coat),
    cuff: mesh(new THREE.TorusGeometry(0.04 * o.scale, 0.012 * o.scale, 8, 18), M.coatDark),
    hand: mesh(new THREE.SphereGeometry(0.052 * o.scale, 16, 12), M.skin),
    shoulderLocal: new THREE.Vector3(0.19 * s, 0.47, 0.0),
    l1: 0.22 * o.scale, l2: 0.21 * o.scale,
    target: new THREE.Vector3(), elbow: new THREE.Vector3(), world: false,
  }));
  for (const a of arms) limbsGroup.add(a.cuff, a.hand);
  const legs = [-1, 1].map((s) => ({
    side: s,
    upper: new Limb(limbsGroup, R.leg, M.trousers),
    lower: new Limb(limbsGroup, R.leg * 0.95, M.trousers),
    shoe: mesh(new THREE.SphereGeometry(0.075 * o.scale, 16, 12), M.shoe),
    hipLocal: new THREE.Vector3(0.09 * s, 0.02, 0),
    l1: 0.19 * o.scale, l2: 0.19 * o.scale,
    knee: new THREE.Vector3(),
  }));
  for (const l of legs) { l.shoe.scale.set(0.9, 0.55, 1.35); limbsGroup.add(l.shoe); }

  const fig = {
    root, body, hips, torso, neck, head, eyes, brows, mouthG, smile, cavity, tongue, hatG, limbsGroup, arms, legs, opts: o, M, satchel: satchelGroup,
    LEG,
  };

  // Pose state (all optional; defaults neutral)
  fig.pose = defaultPose();
  fig.apply = (p) => applyPose(fig, Object.assign(defaultPose(), p));
  return fig;
}

export function defaultPose() {
  return {
    x: 0, z: 0, y: 0, yaw: 0,
    lean: 0, side: 0, twist: 0, squash: 0, bob: 0,
    headYaw: 0, headPitch: 0, headRoll: 0,
    browL: 0, browR: 0, browTiltL: 0, browTiltR: 0,
    blink: 0, lookX: 0, lookY: 0,
    mouthOpen: 0, smile: 0.4,
    hatTilt: 0,
    // hands: local to torso unless handWorld provided
    handL: [-0.24, 0.12, 0.08], handR: [0.24, 0.12, 0.08],
    handLWorld: null, handRWorld: null,
    elbowPoleL: [-0.6, -0.3, -0.4], elbowPoleR: [0.6, -0.3, -0.4],
    footL: [-0.1, 0, 0.02], footR: [0.1, 0, 0.02], // local to root (ground)
    footLiftL: 0, footLiftR: 0,
  };
}

function shade(hex, amt) {
  const c = new THREE.Color(hex);
  const hsl = {}; c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, THREE.MathUtils.clamp(hsl.l + amt, 0, 1));
  return '#' + c.getHexString();
}

function applyPose(f, p) {
  const s = f.opts.scale;
  f.root.position.set(p.x, p.y, p.z);
  f.root.rotation.set(0, p.yaw, 0);
  f.hips.position.y = f.LEG + p.bob;
  f.torso.rotation.set(p.lean, p.twist, p.side);
  f.torso.scale.set(1 + p.squash * 0.5, 1 - p.squash, 1 + p.squash * 0.5);
  f.neck.rotation.set(p.headPitch * 0.35, p.headYaw * 0.3, p.headRoll * 0.3);
  f.head.rotation.set(p.headPitch * 0.65, p.headYaw * 0.7, p.headRoll * 0.7);
  f.hatG.rotation.z = p.hatTilt;
  // brows
  const [bl, br] = f.brows;
  bl.group.position.y = 0.115 + p.browL * 0.03;
  br.group.position.y = 0.115 + p.browR * 0.03;
  bl.group.rotation.z = -p.browTiltL; // positive tilt = inner end up (worried)
  br.group.rotation.z = p.browTiltR;
  // eyes
  for (const e of f.eyes) {
    e.lid.scale.y = Math.max(0.08, 1 - p.blink);
    e.pupil.position.x = p.lookX * 0.012;
    e.pupil.position.y = p.lookY * 0.012;
    e.glint.position.x = 0.008 + p.lookX * 0.012;
    e.glint.position.y = 0.009 + p.lookY * 0.012;
  }
  // mouth
  const open = THREE.MathUtils.clamp(p.mouthOpen, 0, 1);
  f.cavity.scale.set(0.9 + open * 0.25, 0.12 + open * 1.0, 0.35);
  f.cavity.visible = open > 0.04;
  f.tongue.visible = open > 0.35;
  f.smile.scale.set(1 + Math.abs(p.smile) * 0.2, Math.max(0.15, Math.abs(p.smile)), 1);
  f.smile.rotation.z = p.smile >= 0 ? Math.PI : 0;
  f.smile.position.y = p.smile >= 0 ? 0.008 : -0.02;
  f.smile.visible = open < 0.5;

  // Update world matrices before limb solve
  f.root.updateWorldMatrix(true, true);
  const parent = f.limbsGroup.parent;
  const toLocal = (v) => (parent ? parent.worldToLocal(v) : v);

  // Arms
  const handsLocal = [p.handL, p.handR];
  const handsWorld = [p.handLWorld, p.handRWorld];
  const poles = [p.elbowPoleL, p.elbowPoleR];
  f.arms.forEach((a, i) => {
    const sh = f.torso.localToWorld(a.shoulderLocal.clone());
    let tgt;
    if (handsWorld[i]) tgt = new THREE.Vector3(...handsWorld[i]);
    else tgt = f.torso.localToWorld(new THREE.Vector3(...handsLocal[i]));
    // pole in figure space -> world direction
    const pole = new THREE.Vector3(...poles[i]).applyQuaternion(f.torso.getWorldQuaternion(_q)).normalize();
    const elbow = solveIK(sh, tgt, a.l1, a.l2, pole, new THREE.Vector3());
    // clamp target to reach
    const dir = tgt.clone().sub(sh);
    if (dir.length() > (a.l1 + a.l2) * 0.999) tgt = sh.clone().add(dir.setLength((a.l1 + a.l2) * 0.999));
    const shL = toLocal(sh.clone()), elL = toLocal(elbow.clone()), hL = toLocal(tgt.clone());
    a.upper.set(shL, elL);
    a.lower.set(elL, hL);
    a.hand.position.copy(hL);
    a.cuff.position.copy(elL.clone().lerp(hL, 0.86));
    a.cuff.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), hL.clone().sub(elL).normalize());
    a.handWorld = tgt;
  });
  // Legs
  const feet = [p.footL, p.footR];
  const lifts = [p.footLiftL, p.footLiftR];
  f.legs.forEach((l, i) => {
    const hip = f.hips.localToWorld(l.hipLocal.clone());
    const foot = f.root.localToWorld(new THREE.Vector3(feet[i][0], 0.06 * s + lifts[i], feet[i][2]));
    const pole = new THREE.Vector3(0, 0, 1).applyQuaternion(f.root.getWorldQuaternion(_q));
    const knee = solveIK(hip, foot, l.l1, l.l2, pole, new THREE.Vector3());
    const hipL = toLocal(hip), kneeL = toLocal(knee.clone()), footL = toLocal(foot.clone());
    l.upper.set(hipL, kneeL);
    l.lower.set(kneeL, footL);
    l.shoe.position.copy(footL).add(new THREE.Vector3(0, -0.025 * s, 0));
    l.shoe.quaternion.copy(f.root.quaternion);
    l.shoe.position.add(new THREE.Vector3(0, 0, 0.03 * s).applyQuaternion(f.root.quaternion));
  });
}
