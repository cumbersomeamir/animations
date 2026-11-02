// Props: steel ball <-> hollow hull clay morph, displaced-water ghosts, splash/bubbles/ripples, magnifier, flag.
import * as THREE from 'three';
import { PAL, clayMat, steelMat } from './clay.js';
import { BALL_R, HULL, outerMeridian, planXZ } from './physics.js';
import { E, rng } from './anim.js';

const NT = 72, NP = 112, EPS = 2 / NT;

/** Hull vertex for grid coordinate u in [0,1] (0 = top pole -> inner bottom, 1 = bottom pole -> outer bottom). */
function hullPoint(u, phi, out) {
  const { t, a, b, n } = HULL;
  const meridianWithNormal = s => {
    const [q, y] = outerMeridian(s);
    const [x, z] = planXZ(q, phi);
    // outward plan normal of the superellipse (approx.)
    let nx = Math.sign(x) * Math.pow(Math.abs(x / a) + 1e-9, n - 1) / a;
    let nz = Math.sign(z) * Math.pow(Math.abs(z / b) + 1e-9, n - 1) / b;
    const L = Math.hypot(nx, nz) || 1; nx /= L; nz /= L;
    const s1 = 0.42, s2 = 0.62;
    const beta = s <= s1 ? Math.PI / 2 : s <= s2 ? Math.PI / 2 * (1 - (s - s1) / (s2 - s1)) : 0; // pi/2: normal down
    return { x, y, z, N: [Math.cos(beta) * nx, -Math.sin(beta), Math.cos(beta) * nz] };
  };
  const inner = s => { const p = meridianWithNormal(s); return [p.x - t * p.N[0], p.y - t * p.N[1], p.z - t * p.N[2]]; };
  if (u >= 0.5 + EPS) { const p = meridianWithNormal((1 - u) / (0.5 - EPS)); out[0] = p.x; out[1] = p.y; out[2] = p.z; return; }
  if (u <= 0.5 - EPS) { const p = inner(u / (0.5 - EPS)); out[0] = p[0]; out[1] = p[1]; out[2] = p[2]; return; }
  const al = (u - (0.5 - EPS)) / (2 * EPS);
  const pi = inner(1), po = meridianWithNormal(1);
  const c = [(pi[0] + po.x) / 2, (pi[1] + po.y) / 2, (pi[2] + po.z) / 2];
  const ca = Math.cos(Math.PI * al), sa = Math.sin(Math.PI * al);
  out[0] = c[0] + ca * (pi[0] - c[0]);
  out[1] = c[1] + ca * (pi[1] - c[1]) + sa * t * 0.6;
  out[2] = c[2] + ca * (pi[2] - c[2]);
}

export class SteelPiece {
  constructor() {
    const nv = (NT + 1) * (NP + 1);
    this.sphere = new Float32Array(nv * 3);
    this.hull = new Float32Array(nv * 3);
    this.uv = new Float32Array(nv * 2);
    const tmp = [0, 0, 0];
    for (let i = 0; i <= NT; i++) for (let j = 0; j <= NP; j++) {
      const k = i * (NP + 1) + j, u = i / NT, th = Math.PI * u, ph = 2 * Math.PI * j / NP;
      this.sphere.set([BALL_R * Math.sin(th) * Math.cos(ph), BALL_R * Math.cos(th), BALL_R * Math.sin(th) * Math.sin(ph)], k * 3);
      hullPoint(u, ph, tmp); this.hull.set(tmp, k * 3);
      this.uv.set([j / NP * 3, u * 1.5], k * 2);
    }
    const idx = [];
    for (let i = 0; i < NT; i++) for (let j = 0; j < NP; j++) {
      const a = i * (NP + 1) + j, b = a + NP + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    this.geo = new THREE.BufferGeometry();
    this.geo.setIndex(idx);
    this.pos = new THREE.BufferAttribute(new Float32Array(nv * 3), 3);
    this.geo.setAttribute('position', this.pos);
    this.geo.setAttribute('uv', new THREE.BufferAttribute(this.uv, 2));
    this.mesh = new THREE.Mesh(this.geo, steelMat());
    this.mesh.castShadow = true; this.mesh.receiveShadow = true;
    this.m = -1;
    this.setMorph(0);
  }

  /** m: 0 = ball, 1 = hull. Horizontal spread leads the press-down (pinch-pot squish). */
  setMorph(m, squishPhase = 0) {
    if (Math.abs(m - this.m) < 1e-5 && squishPhase === this.sq) return;
    this.m = m; this.sq = squishPhase;
    const eh = E.out(Math.min(1, m * 1.08)), ev = E.io(m);
    const lump = 0.009 * Math.sin(Math.PI * m);
    const p = this.pos.array, S = this.sphere, H = this.hull;
    for (let i = 0; i <= NT; i++) for (let j = 0; j <= NP; j++) {
      const k = (i * (NP + 1) + j) * 3, th = Math.PI * i / NT, ph = 2 * Math.PI * j / NP;
      const w = lump * Math.sin(5 * ph + 3 * th + squishPhase) * Math.sin(th);
      const sx = S[k], sy = S[k + 1], sz = S[k + 2];
      const r = Math.hypot(sx, sy, sz) || 1;
      p[k] = sx + (H[k] - sx) * eh + w * sx / r;
      p[k + 1] = sy + (H[k + 1] - sy) * ev + w * sy / r;
      p[k + 2] = sz + (H[k + 2] - sz) * eh + w * sz / r;
    }
    this.pos.needsUpdate = true;
    this.geo.computeVertexNormals();
    // weld the seam normals (j = 0 and j = NP share positions)
    const nrm = this.geo.attributes.normal.array;
    for (let i = 0; i <= NT; i++) {
      const a = (i * (NP + 1)) * 3, b = (i * (NP + 1) + NP) * 3;
      for (let c = 0; c < 3; c++) { const v = (nrm[a + c] + nrm[b + c]) / 2; nrm[a + c] = nrm[b + c] = v; }
    }
    this.geo.attributes.normal.needsUpdate = true;
    this.geo.computeBoundingSphere();
  }
}

/** Lime translucent shell over the hull's outer surface, clipped to below the waterline. */
export function makeHullGhost() {
  const rows = [];
  const tmp = [0, 0, 0];
  const i0 = Math.ceil(NT * (0.5 + EPS));
  const pos = [], idx = [];
  for (let i = i0; i <= NT; i++) for (let j = 0; j <= NP; j++) {
    hullPoint(i / NT, 2 * Math.PI * j / NP, tmp);
    pos.push(tmp[0] * 1.02, tmp[1] - 0.001, tmp[2] * 1.05);
  }
  const R = NT - i0;
  for (let i = 0; i < R; i++) for (let j = 0; j < NP; j++) {
    const a = i * (NP + 1) + j, b = a + NP + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.5);
  const mat = new THREE.MeshStandardMaterial({
    color: PAL.lime, emissive: PAL.lime, emissiveIntensity: 0.55, transparent: true, opacity: 0.0,
    roughness: 0.4, depthWrite: false, side: THREE.DoubleSide, clippingPlanes: [plane],
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.renderOrder = 6;
  void rows;
  return { mesh, mat, plane };
}

export function makeBallGhost() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: PAL.lime, emissive: PAL.lime, emissiveIntensity: 0.35, transparent: true, opacity: 0, roughness: 0.1, depthWrite: false, envMapIntensity: 1.5 });
  const s = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, 40, 28), mat);
  const omat = new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false });
  const o = new THREE.Mesh(new THREE.SphereGeometry(BALL_R * 1.07, 40, 28), omat);
  s.renderOrder = 6; o.renderOrder = 6;
  g.add(o, s);
  return { group: g, mat, omat };
}

/** Splash droplets (ballistic), deterministic per seed. */
export class Splash {
  constructor(scene, n, seed, size = 1) {
    const R = rng(seed);
    this.mat = new THREE.MeshStandardMaterial({ color: '#CDEFE5', roughness: 0.08, metalness: 0, transparent: true, opacity: 0.9, envMapIntensity: 1.4 });
    this.drops = [];
    for (let i = 0; i < n; i++) {
      const ang = R() * Math.PI * 2, sp = (0.35 + R() * 0.55) * size, up = (1.0 + R() * 1.1) * Math.sqrt(size);
      const m = new THREE.Mesh(new THREE.SphereGeometry((0.008 + R() * 0.012) * Math.sqrt(size), 10, 8), this.mat);
      m.visible = false; scene.add(m);
      this.drops.push({ m, vx: Math.cos(ang) * sp, vz: Math.sin(ang) * sp * 0.45, vy: up });
    }
  }
  /** tau: seconds since impact (negative = hidden). origin [x,y,z]; level for culling. */
  update(tau, origin, level, zmax = 0.19) {
    for (const d of this.drops) {
      if (tau < 0 || tau > 0.9) { d.m.visible = false; continue; }
      const x = origin[0] + d.vx * tau, y = origin[1] + d.vy * tau - 4.9 * tau * tau;
      const z = Math.max(-zmax, Math.min(zmax, origin[2] + d.vz * tau));
      d.m.position.set(x, y, z);
      d.m.visible = y > level - 0.005;
      d.m.scale.setScalar(1 + 0.6 * Math.max(0, 0.12 - tau) / 0.12);
    }
  }
}

export class Bubbles {
  constructor(scene, n, seed) {
    const R = rng(seed);
    this.mat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.05, transparent: true, opacity: 0.55, envMapIntensity: 1.6, depthWrite: false });
    this.b = [];
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.006 + R() * 0.011, 10, 8), this.mat);
      m.visible = false; m.renderOrder = 3; scene.add(m);
      this.b.push({ m, delay: R() * 0.9, sp: 0.35 + R() * 0.3, ox: (R() - 0.5) * 0.12, oz: (R() - 0.5) * 0.1, ph: R() * 6 });
    }
  }
  update(tau, origin, level) {
    for (const b of this.b) {
      const x = tau - b.delay;
      if (x < 0 || tau < 0) { b.m.visible = false; continue; }
      const y = origin[1] + b.sp * x;
      b.m.position.set(origin[0] + b.ox + 0.012 * Math.sin(b.ph + 14 * x), y, origin[2] + b.oz);
      b.m.visible = y < level - 0.01;
    }
  }
}

export function makeMagnifier() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.013, 14, 40), clayMat(PAL.lime, { bump: 0.8 }));
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.068, 40), new THREE.MeshPhysicalMaterial({ color: '#E8FFF6', transparent: true, opacity: 0.22, roughness: 0.02, envMapIntensity: 2.0, depthWrite: false, side: THREE.DoubleSide }));
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.1, 6, 10), clayMat(PAL.ink, { bump: 0.6 }));
  handle.position.y = -0.135;
  ring.castShadow = handle.castShadow = true;
  g.add(ring, lens, handle);
  return g;
}

export function makeFlag() {
  const g = new THREE.Group();
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.24, 10), clayMat(PAL.ink, { bump: 0.5 }));
  stick.position.y = 0.12; stick.castShadow = true;
  const geo = new THREE.PlaneGeometry(0.12, 0.075, 8, 2);
  const base = geo.attributes.position.array.slice();
  const cloth = new THREE.Mesh(geo, clayMat(PAL.lime, { bump: 0.6, rough: 0.65 }));
  cloth.material.side = THREE.DoubleSide; cloth.castShadow = true;
  cloth.position.set(0.066, 0.2, 0);
  g.add(stick, cloth);
  g.userData.wave = t => {
    const p = geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) {
      const x = base[i] + 0.06, f = x / 0.12;
      p[i + 1] = base[i + 1] * (1 - 0.85 * f);
      p[i + 2] = 0.012 * f * Math.sin(9 * t - 7 * f);
    }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
  };
  return g;
}
