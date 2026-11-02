// Tinku: original recurring performer for the WastePaisa education channel.
// A curious scrap creature built from everyday waste: tin-can body with a
// flipped-up lid crest, cardboard ear flaps, copper-wire limbs, orange
// lab-glove hands, green bottle-cap feet, bead antenna and a flip-down loupe.
//
// Reusable rig: createTinku(THREE) -> { root, apply(pose, extras), dims }.
// All pose parameters are plain numbers/arrays so poses can be blended.
import * as THREE from 'three';

export const PALETTE = {
  tin: 0xc4c9cf,
  tinDark: 0x8e959d,
  label: 0xf4e7d2,
  labelStripe: 0xe8741c,
  cardboard: 0xa8743f,
  cardboardDark: 0x7a5129,
  copper: 0xc47a42,
  glove: 0xee7a1e,
  cap: 0x1f6b3a,
  capTop: 0x2c8a4e,
  eyeWhite: 0xfff8ec,
  pupil: 0x1d130e,
  brow: 0x2a1b12,
  brass: 0xc9a14a,
  bead: 0xee7a1e,
};

export const DEFAULT_POSE = {
  hop: 0, lean: 0, pitch: 0, squash: 1, twist: 0,
  handL: [0.40, 0.30, 0.10], handR: [-0.40, 0.30, 0.10],
  elbowL: 0.10, elbowR: 0.10,
  browL: 0, browR: 0, browTiltL: 0, browTiltR: 0,
  lid: 0.08, squint: 0, eyeScale: 1, look: [0, 0],
  smile: 0.35, mouthOpen: 0, mouthWide: 1,
  earL: 0.45, earR: 0.45,
  loupe: 0, canLid: 1, footL: [0.13, 0, 0.02], footR: [-0.13, 0, 0.02],
};

function labelTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#f4e7d2'; g.fillRect(0, 0, 1024, 256);
  // fine paper grain
  const r = mulberry(7);
  for (let i = 0; i < 2500; i++) {
    g.fillStyle = `rgba(120,90,60,${0.03 + r() * 0.04})`;
    g.fillRect(r() * 1024, r() * 256, 1 + r() * 3, 1);
  }
  g.fillStyle = '#e8741c'; g.fillRect(0, 0, 1024, 22); g.fillRect(0, 234, 1024, 22);
  g.fillStyle = '#1f6b3a'; g.fillRect(0, 26, 1024, 6); g.fillRect(0, 224, 1024, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let r = Math.imul(a ^ (a >>> 15), 1 | a);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function ridgedCap(radius, height, color, topColor) {
  const grp = new THREE.Group();
  const geo = new THREE.CylinderGeometry(radius, radius * 1.02, height, 63, 1, true);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const a = Math.atan2(z, x);
    const k = 1 + 0.045 * Math.max(0, Math.cos(a * 21));
    pos.setX(i, x * k); pos.setZ(i, z * k);
  }
  geo.computeVertexNormals();
  const m = new THREE.MeshStandardMaterial({ color, metalness: 0.15, roughness: 0.45 });
  const side = new THREE.Mesh(geo, m);
  const top = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.99, 48),
    new THREE.MeshStandardMaterial({ color: topColor, metalness: 0.1, roughness: 0.35 }));
  top.rotation.x = -Math.PI / 2; top.position.y = height / 2;
  side.castShadow = true; top.castShadow = true;
  grp.add(side, top);
  return grp;
}

export function createTinku() {
  const P = PALETTE;
  const root = new THREE.Group(); root.name = 'tinku';
  const hips = new THREE.Group(); root.add(hips);

  const legLen = 0.20, capH = 0.06;
  const canR = 0.30, canH = 0.62;
  const bodyY = capH + legLen + canH / 2;
  const body = new THREE.Group(); body.position.y = bodyY; hips.add(body);

  const tin = new THREE.MeshStandardMaterial({ color: P.tin, metalness: 0.85, roughness: 0.32 });
  const tinDark = new THREE.MeshStandardMaterial({ color: P.tinDark, metalness: 0.85, roughness: 0.4 });

  // can shell
  const can = new THREE.Mesh(new THREE.CylinderGeometry(canR, canR, canH, 64, 1, true), tin);
  can.castShadow = true; body.add(can);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(canR, 48), tinDark);
  bottom.rotation.x = Math.PI / 2; bottom.position.y = -canH / 2; body.add(bottom);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(canR * 0.98, 48), tinDark);
  inner.rotation.x = -Math.PI / 2; inner.position.y = canH / 2 - 0.02; body.add(inner);
  for (const y of [canH / 2, -canH / 2]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(canR, 0.018, 10, 64), tin);
    rim.rotation.x = Math.PI / 2; rim.position.y = y; rim.castShadow = true; body.add(rim);
  }
  for (const y of [0.21, -0.23]) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(canR + 0.002, 0.008, 6, 64), tinDark);
    rib.rotation.x = Math.PI / 2; rib.position.y = y; body.add(rib);
  }
  // paper label band (front-facing seam at back)
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(canR + 0.004, canR + 0.004, 0.30, 64, 1, true),
    new THREE.MeshStandardMaterial({ map: labelTexture(), roughness: 0.85, metalness: 0 }));
  label.position.y = -0.04; body.add(label);

  // flipped-up lid crest, hinged at the back of the top rim
  const lidHinge = new THREE.Group(); lidHinge.position.set(0, canH / 2, -canR * 0.92); body.add(lidHinge);
  const lid = new THREE.Group(); lid.position.set(0, 0, canR * 0.92); lidHinge.add(lid);
  const lidDisc = new THREE.Mesh(new THREE.CylinderGeometry(canR * 0.97, canR * 0.97, 0.012, 48), tin);
  lidDisc.castShadow = true; lid.add(lidDisc);
  const lidRing = new THREE.Mesh(new THREE.TorusGeometry(canR * 0.97, 0.012, 8, 48), tinDark);
  lidRing.rotation.x = Math.PI / 2; lid.add(lidRing);
  const tab = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 8, 24), tinDark);
  tab.rotation.x = Math.PI / 2; tab.position.set(0, 0.012, canR * 0.55); lid.add(tab);

  // cardboard ear flaps
  const cardMat = new THREE.MeshStandardMaterial({ color: P.cardboard, roughness: 0.9 });
  const cardEdge = new THREE.MeshStandardMaterial({ color: P.cardboardDark, roughness: 0.9 });
  const ears = [];
  for (const s of [1, -1]) {
    const pivot = new THREE.Group(); pivot.position.set(s * (canR - 0.01), canH / 2 - 0.10, -0.02);
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.26, 0.17), [cardEdge, cardEdge, cardEdge, cardEdge, cardMat, cardMat]);
    flap.position.y = 0.13; flap.castShadow = true;
    // corrugation stripes
    for (let i = 0; i < 4; i++) {
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.037, 0.008, 0.172), cardEdge);
      st.position.y = 0.04 + i * 0.055; flap.add(st);
    }
    pivot.add(flap); body.add(pivot); ears.push({ pivot, s });
  }

  // eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: P.eyeWhite, roughness: 0.18, metalness: 0 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: P.pupil, roughness: 0.3 });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lidMat = new THREE.MeshStandardMaterial({ color: P.tin, metalness: 0.8, roughness: 0.3 });
  const eyes = [];
  for (const s of [1, -1]) {
    const eg = new THREE.Group(); eg.position.set(s * 0.125, 0.16, canR - 0.07); body.add(eg);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.115, 32, 24), eyeMat); ball.castShadow = true; eg.add(ball);
    const pupil = new THREE.Group(); eg.add(pupil);
    const pd = new THREE.Mesh(new THREE.SphereGeometry(0.052, 24, 16), pupilMat); pd.scale.z = 0.45; pupil.add(pd);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), glintMat); gl.position.set(0.018, 0.022, 0.024); pupil.add(gl);
    // upper lid: hemisphere cap facing +z, rotated up/back to open
    const up = new THREE.Group(); eg.add(up);
    const capGeo = new THREE.SphereGeometry(0.122, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    capGeo.rotateX(Math.PI / 2);
    const upper = new THREE.Mesh(capGeo, lidMat); up.add(upper);
    const lo = new THREE.Group(); eg.add(lo);
    const lower = new THREE.Mesh(capGeo, lidMat); lo.add(lower);
    // brow
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.09, 4, 8), new THREE.MeshStandardMaterial({ color: P.brow, roughness: 0.6 }));
    brow.rotation.z = Math.PI / 2; const browG = new THREE.Group(); browG.add(brow);
    browG.position.set(s * 0.125, 0.315, canR - 0.02); body.add(browG);
    eyes.push({ eg, pupil, up, lo, browG, s });
  }

  // mouth (on label front)
  const mouthG = new THREE.Group(); mouthG.position.set(0, -0.06, canR + 0.006); body.add(mouthG);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x24150e, roughness: 0.6 });
  let mouthLine = null;
  const mouthOpenG = new THREE.Group(); mouthG.add(mouthOpenG);
  const mo = new THREE.Mesh(new THREE.CircleGeometry(0.05, 32), mouthMat); mouthOpenG.add(mo);
  const tongue = new THREE.Mesh(new THREE.CircleGeometry(0.028, 24, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: 0xd8642a, roughness: 0.6 }));
  tongue.position.set(0, -0.012, 0.001); mouthOpenG.add(tongue);

  // antenna
  const beadMat = new THREE.MeshStandardMaterial({ color: P.bead, roughness: 0.3, metalness: 0.1 });
  const wireMat = new THREE.MeshStandardMaterial({ color: P.copper, metalness: 0.9, roughness: 0.3 });
  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.04, 20, 14), beadMat); bead.castShadow = true; body.add(bead);
  let antenna = null;

  // loupe on the character's right side: brass ring on a hinged wire arm
  const brass = new THREE.MeshStandardMaterial({ color: P.brass, metalness: 0.9, roughness: 0.28 });
  const loupeHinge = new THREE.Vector3(-canR - 0.02, 0.27, 0.06);
  const hingeKnob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), brass); hingeKnob.position.copy(loupeHinge); body.add(hingeKnob);
  const loupeArm = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 1, 8), brass); body.add(loupeArm);
  const loupeRing = new THREE.Group(); body.add(loupeRing);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.015, 10, 32), brass); ring.castShadow = true; loupeRing.add(ring);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.082, 32), new THREE.MeshPhysicalMaterial({ color: 0xdfeff5, roughness: 0.05, transparent: true, opacity: 0.22, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }));
  loupeRing.add(lens);
  const LOUPE_UP = new THREE.Vector3(-canR - 0.05, 0.47, -0.02);
  const LOUPE_DOWN = new THREE.Vector3(-0.125, 0.16, canR + 0.1);

  // limbs (regenerated each frame)
  let arms = [null, null], legs = [null, null];
  const gloveMat = new THREE.MeshStandardMaterial({ color: P.glove, roughness: 0.55 });
  const hands = [];
  for (let i = 0; i < 2; i++) {
    const h = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.062, 20, 14), gloveMat); palm.scale.set(1, 0.9, 0.8); palm.castShadow = true; h.add(palm);
    const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), gloveMat); thumb.position.set(i ? -0.05 : 0.05, 0.03, 0.03); h.add(thumb);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 20), gloveMat); cuff.position.set(0, 0, -0.04); h.add(cuff);
    root.add(h); hands.push(h);
  }
  const feet = [ridgedCap(0.10, capH, P.cap, P.capTop), ridgedCap(0.10, capH, P.cap, P.capTop)];
  feet.forEach((f) => root.add(f));

  // blob shadow (soft contact shadow) under the character
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.55 }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.002; root.add(sh);

  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tmpC = new THREE.Vector3();

  function tube(old, points, radius, mat, segs = 28) {
    if (old) { old.geometry.dispose(); root.remove(old); }
    const curve = new THREE.CatmullRomCurve3(points);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, radius, 8, false), mat);
    m.castShadow = true; root.add(m); return m;
  }

  function apply(p, ex = {}) {
    const pose = { ...DEFAULT_POSE, ...p };
    // body
    const sq = pose.squash;
    hips.position.y = pose.hop;
    hips.rotation.set(pose.pitch, 0, pose.lean);
    body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    body.rotation.y = pose.twist;
    lidHinge.rotation.x = -1.95 * pose.canLid + (ex.lidWobble || 0);
    for (const e of ears) e.pivot.rotation.z = -e.s * ((e.s > 0 ? pose.earL : pose.earR) + (ex.earWobble || 0));

    // eyes
    for (const e of eyes) {
      const left = e.s > 0;
      e.eg.scale.setScalar(pose.eyeScale);
      const lx = pose.look[0], ly = pose.look[1];
      const dir = tmpA.set(lx * 0.55, ly * 0.45, 1).normalize();
      e.pupil.position.copy(dir).multiplyScalar(0.098);
      e.pupil.lookAt(tmpB.copy(dir).multiplyScalar(2).add(e.pupil.position));
      const closure = Math.min(1, pose.lid + (ex.blink || 0));
      // open: cap rotated up/back (-2.3 rad) ; closed: cap faces front (0)
      e.up.rotation.x = -2.35 * (1 - closure);
      e.lo.rotation.x = 2.35 - 0.95 * pose.squint;
      const br = left ? pose.browL : pose.browR;
      const bt = left ? pose.browTiltL : pose.browTiltR;
      e.browG.position.y = 0.30 + br * 0.045;
      e.browG.rotation.z = e.s * bt;
    }
    // loupe flips down over the right eye along an arc
    const lp = THREE.MathUtils.clamp(pose.loupe, 0, 1.2);
    const lpos = LOUPE_UP.clone().lerp(LOUPE_DOWN, lp);
    lpos.x -= Math.sin(Math.PI * Math.min(1, lp)) * 0.12; lpos.y += Math.sin(Math.PI * Math.min(1, lp)) * 0.06;
    loupeRing.position.copy(lpos);
    loupeRing.rotation.set(0, THREE.MathUtils.lerp(Math.PI / 2, 0, Math.min(1, lp)), 0);
    const armDir = lpos.clone().sub(loupeHinge);
    const armLen = Math.max(0.01, armDir.length() - 0.085);
    loupeArm.scale.set(1, armLen, 1);
    loupeArm.position.copy(loupeHinge).addScaledVector(armDir.clone().normalize(), armLen / 2);
    loupeArm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), armDir.clone().normalize());

    // mouth
    if (mouthLine) { mouthLine.geometry.dispose(); mouthG.remove(mouthLine); mouthLine = null; }
    const w = 0.07 * pose.mouthWide;
    if (pose.mouthOpen < 0.08) {
      const s = pose.smile * 0.035;
      const pts = [new THREE.Vector3(-w, s * 0.6, 0), new THREE.Vector3(-w * 0.45, -s * 0.55, 0), new THREE.Vector3(0, -s * 0.8, 0), new THREE.Vector3(w * 0.45, -s * 0.55, 0), new THREE.Vector3(w, s * 0.6, 0)];
      mouthLine = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.011, 6), mouthMat);
      mouthG.add(mouthLine);
      mouthOpenG.visible = false;
    } else {
      mouthOpenG.visible = true;
      mouthOpenG.scale.set(pose.mouthWide * 0.95, 0.35 + pose.mouthOpen * 0.85, 1);
      mouthOpenG.position.y = -pose.smile * 0.004;
    }

    // antenna: twist-tie wire with secondary wobble
    root.updateMatrixWorld(true);
    const aw = ex.antenna || 0;
    const base = new THREE.Vector3(0.09, canH / 2, 0.06);
    const pts = [];
    for (let i = 0; i <= 5; i++) {
      const k = i / 5;
      pts.push(new THREE.Vector3(base.x + Math.sin(k * 2.2) * 0.04 + aw * k * k * 0.22, base.y + k * 0.36, base.z + Math.sin(k * 7) * 0.012 - k * 0.05));
    }
    if (antenna) { antenna.geometry.dispose(); body.remove(antenna); }
    antenna = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.009, 6), wireMat);
    antenna.castShadow = true; body.add(antenna);
    bead.position.copy(pts[pts.length - 1]);

    // arms: shoulder (body space) -> hand target (root space), bent wire
    root.updateMatrixWorld(true);
    const handT = [pose.handL, pose.handR];
    const elb = [pose.elbowL, pose.elbowR];
    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? 1 : -1;
      const sh = body.localToWorld(tmpA.set(s * (canR - 0.01), -0.02, 0.0));
      root.worldToLocal(sh);
      const hand = tmpB.fromArray(handT[i]);
      const mid = tmpC.copy(sh).add(hand).multiplyScalar(0.5);
      const len = sh.distanceTo(hand);
      const bend = elb[i] * Math.max(0.25, 1.2 - len);
      mid.x += s * bend * 0.8; mid.y -= bend * 0.9;
      const a = sh.clone(), b = mid.clone(), c = hand.clone();
      const q1 = a.clone().lerp(b, 0.5), q2 = b.clone().lerp(c, 0.5);
      arms[i] = tube(arms[i], [a, q1, b, q2, c], 0.021, wireMat, 32);
      hands[i].position.copy(c);
      const d = c.clone().sub(b).normalize();
      hands[i].lookAt(c.clone().add(d));
    }
    // legs: hip -> foot
    const footT = [pose.footL, pose.footR];
    for (let i = 0; i < 2; i++) {
      const s = i === 0 ? 1 : -1;
      const hip = body.localToWorld(tmpA.set(s * 0.13, -canH / 2 + 0.02, 0));
      root.worldToLocal(hip);
      const foot = new THREE.Vector3().fromArray(footT[i]);
      feet[i].position.set(foot.x, foot.y + capH / 2, foot.z);
      const top = new THREE.Vector3(foot.x, foot.y + capH, foot.z);
      const mid = hip.clone().lerp(top, 0.5); mid.x += s * 0.035;
      legs[i] = tube(legs[i], [hip.clone(), mid, top], 0.021, wireMat, 16);
    }
    sh.scale.setScalar(1 - Math.min(0.5, pose.hop * 0.8));
    sh.position.set(0, 0.003 - pose.hop * 0, 0);
  }

  apply(DEFAULT_POSE);
  return { root, apply, dims: { height: bodyY + canH / 2, canR, canH, bodyY } };
}

let _blob = null;
export function blobTex() {
  if (_blob) return _blob;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.4)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  _blob = new THREE.CanvasTexture(c);
  return _blob;
}
