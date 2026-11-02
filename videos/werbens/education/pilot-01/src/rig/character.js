// Reusable toy-like character rig for the Werbens education series (original design, procedural Three.js geometry).
// Hierarchy:  root (floor position + yaw) → hips (lean/tilt/bob) → torso (squash/stretch) → body, face, accessories
// Limbs (arms with analytic 2-bone IK, legs, hands) live in `world` (scene space) and are solved every frame.
// Side naming: "l" = character-local −x (screen-left when the character faces camera), "r" = local +x.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { clamp, lerp } from "../lib/anim.js";

export const EXPR = {
  neutral: { browL: 0, browR: 0, raiseL: 0, raiseR: 0, lid: 0.12, lower: 0, open: 0, smile: 0.2, skew: 0, mw: 1 },
  presenter: { browL: 0.12, browR: 0.12, raiseL: 0.4, raiseR: 0.4, lid: 0.04, lower: 0.08, open: 0.05, smile: 0.6, skew: 0, mw: 1.05 },
  sceptic: { browL: 0.18, browR: -0.32, raiseL: 0.95, raiseR: -0.4, lid: 0.36, lower: 0.12, open: 0, smile: -0.05, skew: 0.4, mw: 0.78 },
  squint: { browL: -0.28, browR: -0.28, raiseL: -0.35, raiseR: -0.35, lid: 0.55, lower: 0.4, open: 0, smile: 0, skew: 0.15, mw: 0.6 },
  curious: { browL: 0.28, browR: 0.28, raiseL: 0.65, raiseR: 0.65, lid: 0, lower: 0, open: 0.18, smile: 0.1, skew: 0, mw: 0.55 },
  delight: { browL: 0.3, browR: 0.3, raiseL: 0.75, raiseR: 0.75, lid: 0.5, lower: 0.75, open: 0.4, smile: 1, skew: 0, mw: 1.25 },
  meh: { browL: -0.05, browR: 0.12, raiseL: -0.2, raiseR: 0.45, lid: 0.48, lower: 0.1, open: 0, smile: -0.4, skew: -0.25, mw: 0.85 },
  shock: { browL: 0.22, browR: 0.22, raiseL: 1.25, raiseR: 1.25, lid: -0.3, lower: 0, open: 0.95, smile: -0.1, skew: 0, mw: 0.62 },
  sheepish: { browL: 0.45, browR: 0.45, raiseL: 0.5, raiseR: 0.5, lid: 0.3, lower: 0.25, open: 0, smile: 0.35, skew: -0.35, mw: 0.85 },
  smug: { browL: -0.1, browR: 0.18, raiseL: 0.15, raiseR: 0.55, lid: 0.28, lower: 0.2, open: 0, smile: 0.8, skew: 0.3, mw: 1.0 },
  wink: { browL: -0.2, browR: 0.2, raiseL: -0.1, raiseR: 0.5, lid: 0.04, lidL: 1, lower: 0.2, open: 0.08, smile: 0.95, skew: 0.2, mw: 1.1 },
};

const Y = new THREE.Vector3(0, 1, 0);
const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpQ = new THREE.Quaternion();

export function mat(color, o = {}) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.45, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.35, ...o });
}

function solveIK(S, T, a, b, pole, outE, outH) {
  const d = tmpV.copy(T).sub(S);
  const len = d.length();
  const n = d.normalize();
  const L = clamp(len, Math.abs(a - b) + 1e-3, (a + b) * 0.998);
  outH.copy(S).addScaledVector(n, L);
  const cosA = clamp((a * a + L * L - b * b) / (2 * a * L), -1, 1), sinA = Math.sqrt(1 - cosA * cosA);
  const m = tmpV2.copy(pole).addScaledVector(n, -pole.dot(n)).normalize();
  outE.copy(S).addScaledVector(n, a * cosA).addScaledVector(m, a * sinA);
}

function placeSegment(mesh, A, B) {
  const d = tmpV.copy(B).sub(A);
  const L = d.length();
  mesh.position.copy(A).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(Y, d.normalize());
  mesh.scale.set(1, Math.max(1e-4, L), 1);
}

export function buildCharacter(spec) {
  const S = spec;
  const root = new THREE.Group(); root.name = S.name;
  const hips = new THREE.Group(); root.add(hips);
  const torso = new THREE.Group(); hips.add(torso);
  const world = new THREE.Group(); world.name = S.name + "-limbs";

  const bodyMat = mat(S.color, S.bodyMat || {});
  const limbMat = mat(S.limbColor || S.color, { roughness: 0.5 });
  const handMat = mat(S.handColor, { roughness: 0.55, clearcoat: 0.3 });
  const inkMat = mat("#1B1433", { roughness: 0.3, clearcoat: 0.8 });
  const eyeMat = mat("#FFFFFF", { roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const mouthMat = new THREE.MeshPhysicalMaterial({ color: "#24103F", roughness: 0.5, side: THREE.DoubleSide });

  // ---------------------------------------------------------------- body
  let body, surfZ, H;
  if (S.shape === "capsule") {
    const r = S.radius, len = S.length; H = len + 2 * r;
    body = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 12, 40), bodyMat);
    body.position.y = r + len / 2;
    const yh = r + len; // top hemisphere centre
    surfZ = (x, y) => {
      const dy = y > yh ? y - yh : y < r ? r - y : 0;
      return Math.sqrt(Math.max(1e-4, r * r - x * x - dy * dy));
    };
  } else {
    const { w, h, d, round } = S.box; H = h;
    body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 6, round), bodyMat);
    body.position.y = h / 2;
    surfZ = (x, y) => {
      // flat front with rounded vertical edges
      const ex = Math.abs(x) - (w / 2 - round), ey = y - (h - round);
      let z = d / 2;
      if (ex > 0) z -= round - Math.sqrt(Math.max(0, round * round - ex * ex));
      if (ey > 0) z -= round - Math.sqrt(Math.max(0, round * round - ey * ey));
      return z;
    };
  }
  body.castShadow = true; body.receiveShadow = true;
  torso.add(body);

  // ---------------------------------------------------------------- face
  const face = new THREE.Group(); torso.add(face);
  const E = S.eye;
  const eyes = [-1, 1].map((side) => {
    const x = side * E.sep / 2, z0 = surfZ(x, E.y) - E.rz * 0.42;
    const g = new THREE.Group(); g.position.set(x, E.y, z0); face.add(g);
    const white = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), eyeMat);
    white.scale.set(E.rx, E.ry, E.rz); g.add(white);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(E.pupil, 24, 16), inkMat);
    pupil.scale.z = 0.55; g.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(E.pupil * 0.3, 12, 8), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
    g.add(glint);
    const lidMat = S.lidColor ? mat(S.lidColor) : bodyMat.clone(); lidMat.side = THREE.DoubleSide;
    const upPivot = new THREE.Group(); upPivot.scale.set(E.rx * 1.1, E.ry * 1.1, E.rz * 1.35); g.add(upPivot);
    const up = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), lidMat); upPivot.add(up);
    const loPivot = new THREE.Group(); loPivot.scale.copy(upPivot.scale); g.add(loPivot);
    const lo = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), lidMat); loPivot.add(lo);
    [white, pupil, up, lo].forEach((m) => (m.castShadow = false));
    return { side, g, pupil, glint, up, lo, x, z0 };
  });
  const B = S.brow;
  const brows = [-1, 1].map((side) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(B.r, B.len, 6, 12), inkMat);
    face.add(m); return { side, m };
  });
  let mouth = new THREE.Mesh(new THREE.BufferGeometry(), mouthMat); face.add(mouth);

  function buildMouth(p) {
    const w = (S.mouth.w * p.mw) / 2, sm = p.smile, sk = p.skew, op = clamp(p.open, 0, 1.3);
    const yl = sm * 0.03 + sk * 0.022, yr = sm * 0.03 - sk * 0.022;
    const upMid = -sm * 0.006 + op * 0.014 + 0.004;
    const loMid = Math.min(upMid - 0.013, -sm * 0.034 - op * 0.095 - 0.006);
    const sh = new THREE.Shape();
    sh.moveTo(-w, yl);
    sh.quadraticCurveTo(0, 2 * upMid - (yl + yr) / 2, w, yr);
    sh.quadraticCurveTo(0, 2 * loMid - (yl + yr) / 2, -w, yl);
    const g = new THREE.ShapeGeometry(sh, 14);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i) + S.mouth.y;
      pos.setXYZ(i, x, y, surfZ(x, y) + 0.004);
    }
    g.computeVertexNormals();
    mouth.geometry.dispose(); mouth.geometry = g;
  }

  // ---------------------------------------------------------------- accessories (spec-defined)
  const acc = S.accessories ? S.accessories({ THREE, torso, face, surfZ, mat, inkMat, H, S }) : {};

  // ---------------------------------------------------------------- limbs (world space)
  const arm = (side) => {
    const up = new THREE.Mesh(new THREE.CylinderGeometry(S.armR, S.armR, 1, 14), limbMat);
    const fo = new THREE.Mesh(new THREE.CylinderGeometry(S.armR * 0.95, S.armR, 1, 14), limbMat);
    const sj = new THREE.Mesh(new THREE.SphereGeometry(S.armR * 1.15, 14, 10), limbMat);
    const ej = new THREE.Mesh(new THREE.SphereGeometry(S.armR, 14, 10), limbMat);
    const hand = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.SphereGeometry(S.handR, 20, 14), handMat); palm.scale.set(1, 1.12, 0.92); hand.add(palm);
    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(S.handR * 0.36, S.handR * 0.5, 6, 10), handMat); hand.add(thumb);
    const finger = new THREE.Mesh(new THREE.CapsuleGeometry(S.handR * 0.33, 1, 6, 10), handMat); hand.add(finger);
    for (const m of [up, fo, sj, ej, palm, thumb, finger]) m.castShadow = true;
    world.add(up, fo, sj, ej, hand);
    return { side, up, fo, sj, ej, hand, palm, thumb, finger, E: new THREE.Vector3(), Hd: new THREE.Vector3(), Sh: new THREE.Vector3() };
  };
  const arms = { l: arm(-1), r: arm(1) };
  const legs = [-1, 1].map((side) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(S.legR, S.legR * 0.92, 1, 12), limbMat);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), mat(S.shoeColor, { roughness: 0.4 }));
    foot.scale.set(S.legR * 1.5, S.legR * 0.95, S.legR * 2.3);
    leg.castShadow = foot.castShadow = true;
    world.add(leg, foot);
    return { side, leg, foot };
  });

  const state = { hand: { l: new THREE.Vector3(), r: new THREE.Vector3() }, mouth: new THREE.Vector3(), head: new THREE.Vector3() };

  function update(p) {
    // root & body
    root.position.set(p.x, 0, p.z);
    root.rotation.y = p.rotY || 0;
    hips.position.y = S.legLen + (p.bob || 0);
    hips.rotation.set(p.lean || 0, 0, p.tilt || 0);
    const sq = p.squash || 0;
    torso.scale.set(1 - sq * 0.5, 1 + sq, 1 - sq * 0.5);
    torso.rotation.y = p.twist || 0;
    root.updateMatrixWorld(true);

    // face
    const ex = p.expr;
    buildMouth({ ...ex, open: ex.open + (p.talk || 0) * 0.75, mw: ex.mw * (1 - (p.talk || 0) * 0.18) });
    const lx = clamp(p.lookX || 0, -1, 1), ly = clamp(p.lookY || 0, -1, 1);
    for (const e of eyes) {
      e.pupil.position.set(lx * E.rx * 0.42, ly * E.ry * 0.38, E.rz * 0.72);
      e.glint.position.set(lx * E.rx * 0.42 + E.pupil * 0.35, ly * E.ry * 0.38 + E.pupil * 0.38, E.rz * 0.72 + E.pupil * 0.45);
      const lidSide = e.side < 0 ? ex.lidL ?? ex.lid : ex.lidR ?? ex.lid;
      const lid = Math.max(lidSide, p.blink || 0);
      const edge = lerp(0.95, -1.05, clamp(lid, -1, 1));
      e.up.rotation.x = edge <= -1 ? 1.62 : -Math.asin(clamp(edge, -1, 1));
      const lowEdge = lerp(-0.95, 0.12, clamp(ex.lower, 0, 1));
      e.lo.rotation.x = Math.asin(clamp(-lowEdge, -1, 1));
    }
    for (const b of brows) {
      const raise = b.side < 0 ? ex.raiseL : ex.raiseR, ang = b.side < 0 ? ex.browL : ex.browR;
      const x = b.side * (E.sep / 2 + 0.005), y = E.y + E.ry + B.gap + raise * B.lift;
      b.m.position.set(x, y, surfZ(x, y) + B.r * 0.6);
      // capsule along Y → horizontal; positive ang lifts the inner end
      b.m.rotation.set(0, 0, Math.PI / 2 - b.side * ang);
      b.m.rotation.y = -b.side * 0.25 * (S.shape === "capsule" ? 1 : 0.2); // follow the curvature
    }
    if (acc.update) acc.update(p);

    // arms
    for (const k of ["l", "r"]) {
      const A = arms[k], side = A.side;
      A.Sh.set(side * S.shoulder.x, S.shoulder.y, S.shoulder.z);
      torso.localToWorld(A.Sh);
      let target = p.hand?.[k];
      if (!target) {
        const rest = p.rest?.[k] || [side * (S.shoulder.x + 0.12), S.shoulder.y - S.upper - S.fore * 0.75, 0.08];
        target = torso.localToWorld(new THREE.Vector3(...rest));
      }
      const pole = new THREE.Vector3(side * 0.7, -1 + 2 * (p.elbowUp?.[k] || 0), p.elbowBack?.[k] ?? -0.55).applyQuaternion(torso.getWorldQuaternion(tmpQ)).normalize();
      solveIK(A.Sh, target, S.upper, S.fore, pole, A.E, A.Hd);
      placeSegment(A.up, A.Sh, A.E);
      placeSegment(A.fo, A.E, A.Hd);
      A.sj.position.copy(A.Sh); A.ej.position.copy(A.E);
      const dir = tmpV.copy(A.Hd).sub(A.E).normalize();
      A.hand.position.copy(A.Hd).addScaledVector(dir, S.handR * 0.55);
      A.hand.quaternion.setFromUnitVectors(Y, dir);
      // thumb sits towards the body-up side
      A.thumb.position.set(-side * S.handR * 0.75, S.handR * 0.15, S.handR * 0.35);
      A.thumb.rotation.set(0.4, 0, side * 0.9);
      const pt = clamp(p.point?.[k] || 0);
      A.finger.visible = pt > 0.02;
      A.finger.scale.set(1, Math.max(0.01, pt) * 0.11, 1);
      A.finger.position.set(0, S.handR * 0.7 + pt * 0.075, 0);
      state.hand[k].copy(A.hand.position);
    }
    // legs
    for (const L of legs) {
      const hip = torso.localToWorld(new THREE.Vector3(L.side * S.legGap, S.legR * 1.2, 0));
      const foot = root.localToWorld(new THREE.Vector3(L.side * S.legGap * 1.15, S.legR * 0.9, 0.02));
      placeSegment(L.leg, foot, hip);
      L.foot.position.copy(foot).add(new THREE.Vector3(0, 0, S.legR * 0.9).applyQuaternion(root.quaternion));
      L.foot.quaternion.copy(root.quaternion);
    }
    state.mouth.set(0, S.mouth.y, surfZ(0, S.mouth.y) + 0.02); torso.localToWorld(state.mouth);
    state.head.set(0, H * 0.98, 0); torso.localToWorld(state.head);
    return state;
  }

  return { root, world, torso, hips, face, spec: S, update, state, height: H, surfZ, acc };
}
