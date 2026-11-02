// Kip, the clay explorer — reusable rig for Recall's educational series (original character).
// Gumdrop body+head in one clay piece; the face and helmet slide around the body (head turn),
// rubber-hose clay arms/legs are re-tubed every frame from shoulder/hip to hand/foot targets.
import * as THREE from 'three';
import { clayMat, PAL } from './clay.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

export const KIP_DEFAULT_POSE = {
  root: [0, 0, 0], yaw: 0,
  lean: 0, sway: 0, squash: 1,
  headYaw: 0, headPitch: 0, headRoll: 0,
  look: [0, 0], blink: 0,
  browRaiseL: 0, browRaiseR: 0, browAngle: 0,
  smile: 0.3, mouthOpen: 0, mouthRound: 0,
  handL: null, handR: null,          // world positions (null -> rest at sides)
  elbowL: [-1, -0.4, 0.2], elbowR: [1, -0.4, 0.2], // bend direction (Kip-local)
  fistR: 0, fistL: 0, thumbUpR: 0,
  footL: null, footR: null,
};

export class Kip {
  constructor(scale = 1) {
    this.k = scale;
    this.root = new THREE.Group();
    this.root.scale.setScalar(scale);
    this.body = new THREE.Group();          // pivot at hips
    this.body.position.y = 0.12;
    this.root.add(this.body);
    const skin = clayMat(PAL.clayBody, { bump: 1.1, repeat: 2 });
    const lime = clayMat(PAL.lime, { bump: 1.0, repeat: 2, rough: 0.7 });
    const ink = clayMat(PAL.ink, { bump: 0.8, repeat: 2, rough: 0.6 });
    this.mats = { skin, lime, ink };

    // gumdrop body
    const prof = [[0, 0], [0.11, 0.004], [0.172, 0.03], [0.2, 0.085], [0.21, 0.16], [0.205, 0.26],
      [0.19, 0.36], [0.163, 0.45], [0.122, 0.525], [0.066, 0.568], [0.0, 0.582]];
    const spline = new THREE.SplineCurve(prof.map(p => new THREE.Vector2(p[0], p[1])));
    const pts = spline.getPoints(48); pts[0].x = 0; pts[pts.length - 1].x = 0;
    this.bean = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), skin);
    this.bean.castShadow = true; this.bean.receiveShadow = true;
    this.body.add(this.bean);

    // neckerchief (lime) + knot
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.203, 0.03, 16, 64), lime);
    scarf.rotation.x = Math.PI / 2; scarf.position.y = 0.245; scarf.scale.set(1, 1, 0.9);
    scarf.castShadow = true;
    this.body.add(scarf);
    this.knot = new THREE.Group();
    const k1 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 20, 16), lime);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 3), lime);
    tail.position.set(0, -0.06, 0); tail.rotation.set(Math.PI, 0, 0); tail.scale.set(1, 1, 0.35);
    this.knot.add(k1, tail); this.knot.position.set(0.04, 0.235, 0.205);
    this.knot.rotation.z = -0.25;
    this.body.add(this.knot);

    // head rig: face + helmet slide around the body axis
    this.head = new THREE.Group(); this.head.position.y = 0.3; this.body.add(this.head);
    const face = new THREE.Group(); face.position.y = -0.3; this.head.add(face);
    this.face = face;
    this.eyes = [];
    for (const s of [-1, 1]) {
      const eg = new THREE.Group(); eg.position.set(0.072 * s, 0.405, 0.158); eg.rotation.y = 0.32 * s;
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.05, 28, 20), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.25, envMapIntensity: 0.6 }));
      white.scale.set(0.82, 1.12, 0.5);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.026, 20, 16), new THREE.MeshStandardMaterial({ color: PAL.ink, roughness: 0.2 }));
      pupil.scale.set(1, 1.15, 0.45); pupil.position.z = 0.02;
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 10, 8), new THREE.MeshBasicMaterial({ color: '#FFFFFF' }));
      glint.position.set(0.008, 0.012, 0.012); pupil.add(glint);
      eg.add(white, pupil);
      face.add(eg);
      this.eyes.push({ g: eg, pupil, side: s });
    }
    this.brows = [];
    for (const s of [-1, 1]) {
      const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.052, 6, 10), ink);
      b.rotation.z = Math.PI / 2; b.position.set(0.074 * s, 0.478, 0.142);
      const bg = new THREE.Group(); bg.add(b); bg.rotation.y = 0.33 * s;
      face.add(bg);
      this.brows.push({ m: b, side: s });
    }
    this.mouthMat = new THREE.MeshStandardMaterial({ color: '#2A1E1A', roughness: 0.5, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    this.mouth = new THREE.Mesh(new THREE.BufferGeometry(), this.mouthMat);
    this.mouth.position.set(0, 0.318, 0.2045);
    this.mouth.rotation.x = -0.15;
    face.add(this.mouth);

    // pith helmet (lime) with ink band
    const hat = new THREE.Group(); hat.position.set(0, 0.235, -0.01); hat.rotation.x = -0.12;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.165, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), lime);
    dome.scale.set(1, 0.78, 1.04);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.25, 0.018, 56), lime);
    brim.scale.set(1, 1, 1.08); brim.position.y = -0.004;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.1655, 0.1685, 0.036, 64, 1, true), ink);
    band.position.y = 0.02; band.scale.set(1, 1, 1.04);
    const nub = new THREE.Mesh(new THREE.SphereGeometry(0.024, 16, 12), lime); nub.position.y = 0.13;
    for (const m of [dome, brim, band, nub]) { m.castShadow = true; hat.add(m); }
    this.head.add(hat);
    this.hat = hat;

    // limbs
    this.limbMat = skin;
    this.arms = [-1, 1].map(s => {
      const tube = new THREE.Mesh(new THREE.BufferGeometry(), skin); tube.castShadow = true;
      const hand = new THREE.Group();
      const palm = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 18), skin); palm.scale.set(1, 0.86, 0.82); palm.castShadow = true;
      const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.017, 0.03, 6, 10), skin); thumb.castShadow = true;
      hand.add(palm, thumb);
      return { s, tube, hand, palm, thumb };
    });
    this.legs = [-1, 1].map(s => {
      const tube = new THREE.Mesh(new THREE.BufferGeometry(), skin); tube.castShadow = true;
      const boot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), ink);
      boot.scale.set(1.05, 0.72, 1.45); boot.castShadow = true;
      return { s, tube, boot };
    });
    this.limbGroup = new THREE.Group(); // limbs live in world space
    for (const a of this.arms) this.limbGroup.add(a.tube, a.hand);
    for (const l of this.legs) this.limbGroup.add(l.tube, l.boot);
    this.pose = { ...KIP_DEFAULT_POSE };
  }

  addTo(scene) { scene.add(this.root); scene.add(this.limbGroup); }

  /** Kip-local point -> world (uses current root transform). */
  local(x, y, z) {
    this.root.updateMatrixWorld(true);
    return V(x, y, z).applyMatrix4(this.root.matrixWorld);
  }

  apply(p) {
    p = { ...KIP_DEFAULT_POSE, ...p };
    this.pose = p;
    this.root.position.set(...p.root);
    this.root.rotation.set(0, p.yaw, 0);
    const sq = p.squash;
    this.body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    this.body.rotation.set(p.lean, 0, p.sway);
    this.head.rotation.set(p.headPitch, p.headYaw, p.headRoll, 'YXZ');
    this.knot.rotation.y = 0;

    for (const e of this.eyes) {
      e.g.scale.y = Math.max(0.06, 1 - p.blink);
      e.pupil.position.x = p.look[0] * 0.016;
      e.pupil.position.y = p.look[1] * 0.02;
    }
    for (const b of this.brows) {
      const raise = b.side < 0 ? p.browRaiseL : p.browRaiseR;
      b.m.position.y = 0.478 + raise * 0.02;
      b.m.rotation.z = Math.PI / 2 + p.browAngle * 0.35 * -b.side;
    }
    this.mouth.geometry.dispose();
    this.mouth.geometry = mouthGeom(p.smile, p.mouthOpen, p.mouthRound);

    this.root.updateMatrixWorld(true);
    // arms
    for (const a of this.arms) {
      const sh = V(0.178 * a.s, 0.26, 0.0).applyMatrix4(this.body.matrixWorld);
      const rest = this.local(0.27 * a.s, 0.24, 0.06);
      const target = (a.s < 0 ? p.handL : p.handR);
      const tv = typeof target === 'function' ? target(this) : target;
      const hp = tv ? (tv.isVector3 ? tv.clone() : V(...tv)) : rest;
      const bend = V(...(a.s < 0 ? p.elbowL : p.elbowR)).transformDirection(this.root.matrixWorld);
      const len = sh.distanceTo(hp);
      const mid = sh.clone().lerp(hp, 0.5).addScaledVector(bend, Math.max(0.02, 0.12 * this.k - len * 0.12));
      const curve = new THREE.QuadraticBezierCurve3(sh, mid, hp);
      a.tube.geometry.dispose();
      a.tube.geometry = new THREE.TubeGeometry(curve, 16, 0.033 * this.k, 10, false);
      a.hand.position.copy(hp); a.hand.scale.setScalar(this.k);
      const dir = hp.clone().sub(mid).normalize();
      a.hand.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
      const fist = a.s < 0 ? p.fistL : p.fistR;
      a.palm.scale.set(1 - 0.1 * fist, 0.86 + 0.1 * fist, 0.82);
      const up = a.s > 0 ? p.thumbUpR : 0;
      a.thumb.position.set(-0.04 * a.s * (1 - up), 0.01 + 0.05 * up, 0.02);
      a.thumb.rotation.set(0, 0, (0.9 * a.s) * (1 - up));
    }
    // legs
    for (const l of this.legs) {
      const hip = V(0.085 * l.s, 0.05, 0).applyMatrix4(this.body.matrixWorld);
      const ft = (l.s < 0 ? p.footL : p.footR);
      const foot = ft ? V(...ft) : this.local(0.095 * l.s, 0.035, 0.015);
      const mid = hip.clone().lerp(foot, 0.5).add(V(0.015 * l.s, 0, 0.01));
      const curve = new THREE.QuadraticBezierCurve3(hip, mid, foot.clone().add(V(0, 0.02, 0)));
      l.tube.geometry.dispose();
      l.tube.geometry = new THREE.TubeGeometry(curve, 8, 0.036 * this.k, 10, false);
      l.boot.position.copy(foot).add(V(0, 0.0, 0.02 * this.k)); l.boot.scale.set(1.05 * this.k, 0.72 * this.k, 1.45 * this.k);
      l.boot.rotation.y = p.yaw;
    }
  }

  /** World position of an eye (side -1 = screen-left, 1 = screen-right). */
  eyeWorld(side) {
    this.root.updateMatrixWorld(true);
    return this.eyes.find(e => e.side === side).g.getWorldPosition(new THREE.Vector3());
  }

  /** Kip-local point using the body (lean/squash) frame. */
  bodyPoint(x, y, z) {
    this.root.updateMatrixWorld(true);
    return V(x, y, z).applyMatrix4(this.body.matrixWorld);
  }

  setVisible(v) { this.root.visible = v; this.limbGroup.visible = v; }
}

function mouthGeom(smile, open, round) {
  // Flat "D" mouth: top lip curve follows the smile, bottom curve drops with openness.
  const w = 0.046 * (1 - 0.3 * round) + 0.007 * smile * (1 - round);
  const s = new THREE.Shape();
  const topDip = -0.014 * smile;
  const bot = -(0.008 + 0.062 * open + 0.012 * Math.max(0, smile)) * (1 + 0.3 * round);
  // round > 0 lifts the top lip into an arch so the D-shape becomes an "O"
  const topCtl = topDip * 2 * (1 - round) + round * Math.abs(bot) * 0.75;
  const yc = 0.004 * smile * (1 - round) + round * bot * 0.35;
  s.moveTo(-w, yc);
  s.bezierCurveTo(-w * (1 - 0.4 * round), topCtl, w * (1 - 0.4 * round), topCtl, w, yc);
  s.bezierCurveTo(w * (0.95 - 0.1 * round), bot * (0.9 + 0.2 * round), w * 0.45, bot * 1.05, 0, bot * 1.05);
  s.bezierCurveTo(-w * 0.45, bot * 1.05, -w * (0.95 - 0.1 * round), bot * (0.9 + 0.2 * round), -w, yc);
  const g = new THREE.ShapeGeometry(s, 16);
  const p = g.attributes.position.array, R = 0.2;
  for (let i = 0; i < p.length; i += 3) p[i + 2] = Math.sqrt(Math.max(0, R * R - p[i] * p[i])) - R;
  g.computeVertexNormals();
  return g;
}
