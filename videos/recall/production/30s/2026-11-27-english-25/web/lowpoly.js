// "Low-poly Everyday Discovery" world: flat-shaded café corner and the same original everyday person (FK acting rig)
// and lime phone as feedback round 01 (buildCafe / buildPerson / buildPhone are unchanged), plus english-22 props: a giant MEMS
// accelerometer die (proof mass on serpentine springs, comb fingers and fixed plates for two axes, anchors; drawn deflection
// greatly exaggerated) on a circuit board, and a small bedroom for the lying-down POV.
import * as THREE from 'three';



export const PAL = { lime: '#C7F36B', paper: '#F8FAF3', ink: '#20251B' };
export const flat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0, ...opts });
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const shadow = (m, cast = true, rec = true) => { m.castShadow = cast; m.receiveShadow = rec; return m; };

// jitter vertices a little so primitives read as hand-made low-poly facets
function facet(geo, amt, seed = 1) {
  const p = geo.attributes.position.array; let s = seed;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647 - 0.5; };
  const map = new Map();
  for (let i = 0; i < p.length; i += 3) {
    const k = `${p[i].toFixed(4)},${p[i + 1].toFixed(4)},${p[i + 2].toFixed(4)}`;
    if (!map.has(k)) map.set(k, [r() * amt, r() * amt, r() * amt]);
    const d = map.get(k); p[i] += d[0]; p[i + 1] += d[1]; p[i + 2] += d[2];
  }
  geo.computeVertexNormals();
  return geo;
}

// ---------------------------------------------------------------- café set
export function buildCafe(scene) {
  const g = new THREE.Group(); scene.add(g);
  const floor = shadow(new THREE.Mesh(new THREE.PlaneGeometry(14, 12), flat('#8A5E3F')), false, true); floor.rotation.x = -Math.PI / 2; g.add(floor);
  for (let i = -12; i <= 12; i++) { const s = box(0.012, 0.004, 12, flat('#6E4A31')); s.position.set(i * 0.28, 0.002, 0); g.add(s); }
  const wall = shadow(new THREE.Mesh(new THREE.PlaneGeometry(14, 6), flat('#E7D9C0')), false, true); wall.position.set(0, 3, -1.6); g.add(wall);
  const wallL = shadow(new THREE.Mesh(new THREE.PlaneGeometry(6, 6), flat('#DCCAAD')), false, true); wallL.position.set(-2.6, 3, 1.2); wallL.rotation.y = Math.PI / 2; g.add(wallL);
  // window on the back wall (warm glow) + frame + light shaft
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.5), new THREE.MeshBasicMaterial({ color: '#FFE2B0' })); pane.position.set(-1.25, 1.85, -1.59); g.add(pane);
  for (const [w, h, x, y] of [[1.42, 0.06, -1.25, 2.6], [1.42, 0.06, -1.25, 1.1], [0.06, 1.56, -1.93, 1.85], [0.06, 1.56, -0.57, 1.85], [0.04, 1.5, -1.25, 1.85], [1.3, 0.04, -1.25, 1.85]]) {
    const f = box(w, h, 0.05, flat('#5B3E2A')); f.position.set(x, y, -1.57); g.add(f);
  }
  const shaftMat = new THREE.MeshBasicMaterial({ color: '#FFD9A0', transparent: true, opacity: 0.09, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.1, 3.4, 4, 1, true), shaftMat);
  shaft.position.set(-0.55, 1.45, -0.55); shaft.rotation.set(0.75, 0.6, 0.55); g.add(shaft);
  // counter (oak) with a cream front
  const top = shadow(box(3.2, 0.06, 0.7, flat('#B98557'))); top.position.set(0, 0.92, -0.05); g.add(top);
  const front = shadow(box(3.1, 0.9, 0.06, flat('#D9C3A0'))); front.position.set(0, 0.45, 0.27); g.add(front);
  for (let i = -5; i <= 5; i++) { const s = box(0.02, 0.86, 0.02, flat('#C8AE88')); s.position.set(i * 0.28, 0.45, 0.305); g.add(s); }
  // shelf + cups + plant on the back wall
  const shelf = shadow(box(1.4, 0.04, 0.22, flat('#8A5E3F'))); shelf.position.set(0.85, 1.75, -1.48); g.add(shelf);
  const cupCols = ['#F2EEE3', '#C9673F', '#7E8F6A', '#F2EEE3'];
  cupCols.forEach((c, i) => { const cup = shadow(new THREE.Mesh(facet(new THREE.CylinderGeometry(0.05, 0.04, 0.1, 7), 0.004, i + 3), flat(c))); cup.position.set(0.35 + i * 0.3, 1.82, -1.45); g.add(cup); });
  const pot = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.18, 7), flat('#B5654A'))); pot.position.set(1.35, 1.04, -0.25); g.add(pot);
  for (let i = 0; i < 9; i++) {
    const leaf = shadow(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.32 + (i % 3) * 0.06, 4), flat(i % 2 ? '#6F8A4E' : '#88A35E')));
    const a = i * 0.7; leaf.position.set(1.35 + Math.cos(a) * 0.05, 1.27, -0.25 + Math.sin(a) * 0.05); leaf.rotation.set(Math.sin(a) * 0.45, 0, Math.cos(a) * 0.45); g.add(leaf);
  }
  // pendant lamp
  const cord = box(0.01, 1.2, 0.01, flat('#2B2620')); cord.position.set(0.35, 2.8, -0.25); g.add(cord);
  const shade = shadow(new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.2, 8, 1, true), flat('#2F3A2A', { side: THREE.DoubleSide }))); shade.position.set(0.35, 2.15, -0.25); g.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), new THREE.MeshBasicMaterial({ color: '#FFE7B8' })); bulb.position.set(0.35, 2.06, -0.25); g.add(bulb);
  // coffee cup on the counter
  const coffee = new THREE.Group();
  const c1 = shadow(new THREE.Mesh(facet(new THREE.CylinderGeometry(0.045, 0.036, 0.09, 8), 0.003, 9), flat('#F2EEE3'))); c1.position.y = 0.045;
  const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.005, 8), flat('#5A3A24')); c2.position.y = 0.088;
  const handle = shadow(new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.007, 4, 8), flat('#F2EEE3'))); handle.position.set(0.05, 0.05, 0);
  coffee.add(c1, c2, handle); coffee.position.set(-0.45, 0.95, -0.05); g.add(coffee);
  return { group: g, coffee };
}

// ---------------------------------------------------------------- person (original, low-poly, FK)
export function buildPerson(scene) {
  const P = { root: new THREE.Group() }; scene.add(P.root);
  const skin = flat('#A8714E'), hairM = flat('#2A1E17'), sweater = flat('#D8C3A0'), limeM = flat(PAL.lime), dark = flat('#1D1A17');
  P.torso = new THREE.Group(); P.torso.position.y = 0.95; P.root.add(P.torso);
  const body = shadow(new THREE.Mesh(facet(new THREE.CylinderGeometry(0.175, 0.15, 0.5, 8), 0.008, 2), sweater)); body.position.y = 0.25; P.torso.add(body);
  const chest = shadow(new THREE.Mesh(facet(new THREE.SphereGeometry(0.19, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0.006, 4), sweater)); chest.position.y = 0.48; chest.scale.set(1, 0.42, 0.85); P.torso.add(chest);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 4, 10), limeM); collar.rotation.x = Math.PI / 2; collar.position.y = 0.53; P.torso.add(collar);
  P.neck = new THREE.Group(); P.neck.position.y = 0.55; P.torso.add(P.neck);
  const neck = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.08, 6), skin)); neck.position.y = 0.03; P.neck.add(neck);
  P.head = new THREE.Group(); P.head.position.y = 0.08; P.neck.add(P.head);
  const head = shadow(new THREE.Mesh(facet(new THREE.IcosahedronGeometry(0.105, 1), 0.006, 7), skin)); head.scale.set(0.92, 1.12, 0.98); head.position.y = 0.1; P.head.add(head);
  const jaw = shadow(new THREE.Mesh(facet(new THREE.IcosahedronGeometry(0.075, 1), 0.004, 8), skin)); jaw.position.set(0, 0.04, 0.015); jaw.scale.set(1, 0.8, 1); P.head.add(jaw);
  const hair = shadow(new THREE.Mesh(facet(new THREE.SphereGeometry(0.108, 9, 5, 0, Math.PI * 2, 0, Math.PI * 0.4), 0.01, 11), hairM)); hair.position.set(0, 0.142, -0.016); hair.scale.set(1.04, 1.0, 1.06); hair.rotation.x = -0.28; P.head.add(hair);
  const back = shadow(new THREE.Mesh(facet(new THREE.SphereGeometry(0.104, 8, 5), 0.01, 12), hairM)); back.position.set(0, 0.1, -0.035); back.scale.set(1.02, 1.08, 0.86); P.head.add(back);
  for (let i = 0; i < 8; i++) { // curly tufts on top and back only (forehead stays clear)
    const t = shadow(new THREE.Mesh(new THREE.IcosahedronGeometry(0.032, 0), hairM)); const a = -1.3 + i * 0.37;
    t.position.set(Math.sin(a) * 0.075, 0.225 + 0.012 * Math.cos(i * 2.1), -0.045 + Math.cos(a) * 0.03); P.head.add(t);
  }
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.04, 4), skin); nose.rotation.x = Math.PI / 2; nose.position.set(0, 0.09, 0.107); P.head.add(nose);
  for (const s of [-1, 1]) { const ear = shadow(new THREE.Mesh(new THREE.IcosahedronGeometry(0.022, 0), skin)); ear.position.set(s * 0.098, 0.1, 0); ear.scale.set(0.6, 1, 1); P.head.add(ear); }
  P.eyes = [-1, 1].map(s => {
    const g = new THREE.Group(); g.position.set(s * 0.037, 0.108, 0.091);
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.0128, 8, 6), flat('#F6F1E6', { roughness: 0.4 })); white.scale.set(1.25, 0.95, 0.5);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.0074, 6, 5), new THREE.MeshStandardMaterial({ color: '#1A1410', roughness: 0.3 })); pupil.position.z = 0.0055;
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.002, 4, 3), new THREE.MeshBasicMaterial({ color: '#FFFFFF' })); glint.position.set(0.0025, 0.0025, 0.009);
    g.add(white, pupil, glint); P.head.add(g);
    return { g, pupil, s };
  });
  P.brows = [-1, 1].map(s => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.0075, 0.01), hairM); b.position.set(s * 0.038, 0.13, 0.097); P.head.add(b); return { b, s }; });
  P.mouthMat = new THREE.MeshStandardMaterial({ color: '#3B1E17', roughness: 0.6, side: THREE.DoubleSide });
  P.mouth = new THREE.Mesh(new THREE.BufferGeometry(), P.mouthMat); P.mouth.position.set(0, 0.045, 0.098); P.head.add(P.mouth);
  // arms (FK): shoulder -> elbow -> hand
  P.arms = [-1, 1].map(s => {
    const sh = new THREE.Group(); sh.position.set(s * 0.19, 0.47, 0); P.torso.add(sh);
    const ua = shadow(new THREE.Mesh(facet(new THREE.CylinderGeometry(0.048, 0.042, 0.27, 6), 0.004, 20 + s), sweater)); ua.position.y = -0.135; sh.add(ua);
    const el = new THREE.Group(); el.position.y = -0.27; sh.add(el);
    const fa = shadow(new THREE.Mesh(facet(new THREE.CylinderGeometry(0.04, 0.034, 0.25, 6), 0.004, 30 + s), sweater)); fa.position.y = -0.125; el.add(fa);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.03, 6), limeM); cuff.position.y = -0.235; el.add(cuff);
    const hand = new THREE.Group(); hand.position.y = -0.27; el.add(hand);
    const palm = shadow(new THREE.Mesh(facet(new THREE.BoxGeometry(0.058, 0.07, 0.026), 0.003, 40 + s), skin)); palm.position.y = -0.03; hand.add(palm);
    const thumb = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.019, 0.045, 0.019), skin)); thumb.position.set(-s * 0.034, -0.015, 0.012); thumb.rotation.z = s * 0.5; hand.add(thumb);
    return { sh, el, hand, thumb, s };
  });
  P.apply = (q) => {
    P.root.position.set(...q.pos); P.root.rotation.y = q.yaw || 0;
    P.torso.rotation.set(q.lean || 0, q.twist || 0, q.tilt || 0);
    P.head.rotation.set(q.headPitch || 0, q.headYaw || 0, q.headRoll || 0, 'YXZ');
    for (const e of P.eyes) { e.g.scale.y = Math.max(0.08, 1 - (q.blink || 0)) * (1 - 0.45 * (q.squint || 0)); e.pupil.position.x = (q.look ? q.look[0] : 0) * 0.0045; e.pupil.position.y = (q.look ? q.look[1] : 0) * 0.004; }
    for (const b of P.brows) { const raise = b.s < 0 ? (q.browL || 0) : (q.browR || 0); b.b.position.y = 0.13 + raise * 0.011; b.b.rotation.z = (q.browAngle || 0) * 0.35 * -b.s; }
    P.mouth.geometry.dispose(); P.mouth.geometry = mouthGeom(q.smile || 0, q.open || 0, q.frown || 0);
    P.root.updateMatrixWorld(true);
    for (const a of P.arms) {
      const tgt = a.s < 0 ? q.handL : q.handR;
      if (tgt) ik(a, tgt, q.pole && (a.s < 0 ? q.pole[0] : q.pole[1]));
    }
  };
  // two-bone IK in torso space: upper arm 0.27, forearm+hand 0.27; elbow bends toward the pole direction
  const Y = new THREE.Vector3(0, -1, 0);
  function ik(a, targetW, poleL) {
    const L1 = 0.27, L2 = 0.27;
    const S = a.sh.position.clone();
    const T = P.torso.worldToLocal(targetW.clone());
    const d = T.clone().sub(S); const dist = THREE.MathUtils.clamp(d.length(), 0.06, L1 + L2 - 0.002);
    const dir = d.normalize();
    const pole = new THREE.Vector3(...(poleL || [a.s * 0.7, -0.5, -0.5])).normalize();
    const bend = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
    const cosA = THREE.MathUtils.clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1), A = Math.acos(cosA);
    const u = dir.clone().multiplyScalar(Math.cos(A)).add(bend.clone().multiplyScalar(Math.sin(A))).normalize();
    const E = S.clone().add(u.clone().multiplyScalar(L1));
    const Tn = S.clone().add(dir.clone().multiplyScalar(dist));
    const f = Tn.sub(E).normalize();
    const q1 = new THREE.Quaternion().setFromUnitVectors(Y, u);
    a.sh.quaternion.copy(q1);
    a.el.quaternion.setFromUnitVectors(Y, f.applyQuaternion(q1.clone().invert()));
    a.hand.rotation.set(0, 0, 0);
  }
  return P;
}
function mouthGeom(smile, open, frown) {
  const w = 0.026 + 0.006 * smile - 0.004 * frown, s = new THREE.Shape();
  const corner = 0.006 * smile - 0.008 * frown, bot = -(0.004 + 0.022 * open + 0.004 * Math.max(0, smile));
  s.moveTo(-w, corner); s.quadraticCurveTo(0, corner - 0.008 * smile + 0.006 * frown, w, corner);
  s.quadraticCurveTo(w * 0.8, bot, 0, bot); s.quadraticCurveTo(-w * 0.8, bot, -w, corner);
  return new THREE.ShapeGeometry(s, 8);
}

// ---------------------------------------------------------------- phone (lime case, live screen)
export function buildPhone(scene, { fingers = true } = {}) {
  const g = new THREE.Group();
  const body = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.074, 0.152, 0.009), flat(PAL.lime, { roughness: 0.5 })));
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.148, 0.002), flat('#141412', { roughness: 0.3 })); bezel.position.z = 0.0046;
  const c = document.createElement('canvas'); c.width = 540; c.height = 1140;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.1393), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); screen.position.z = 0.0058;
  const cam = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 10), flat('#141412')); cam.rotation.x = Math.PI / 2; cam.position.set(-0.022, 0.058, -0.0052);
  const skin = flat('#A8714E');
  if (fingers) for (const [x, y, w, h] of [[0.0405, -0.022, 0.009, 0.02], [0.0405, -0.046, 0.009, 0.019], [-0.0405, -0.036, 0.009, 0.03]]) {
    const f = shadow(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.012), skin)); f.position.set(x, y, -0.0035); g.add(f);   // fingertips at the edges
  }
  g.add(body, bezel, screen, cam); scene.add(g);
  return { group: g, canvas: c, ctx: c.getContext('2d'), tex };
}


// ================================================================ english-10 props
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export function buildRibbon(scene, color, N = 220, opacity = 1) {
  const g = new THREE.BufferGeometry(), pos = new Float32Array((N + 1) * 2 * 3), idx = [];
  for (let i = 0; i < N; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, b, c, b, d, c); }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: opacity < 1, opacity, toneMapped: false, depthWrite: opacity >= 1 }));
  m.frustumCulled = false; m.userData.N = N; scene.add(m); return m;
}
/** p0->p1 straight path; y(s) offset along `up` (s in 0..1); width w. */
export function setRibbon(m, p0, p1, up, yFn, w) {
  const N = m.userData.N, a = m.geometry.attributes.position.array, dir = p1.clone().sub(p0), L = dir.length();
  const tmp = V3(0, 0, 0), q = V3(0, 0, 0);
  for (let i = 0; i <= N; i++) {
    const s = i / N, y = yFn(s), yn = yFn(Math.min(1, s + 1 / N)), slope = (yn - y) * N / L;
    const nx = -slope, ny = 1, nl = Math.hypot(nx, ny);                       // normal in (dir, up) plane
    tmp.copy(p0).addScaledVector(dir, s).addScaledVector(up, y);
    const ox = dir.clone().normalize().multiplyScalar(nx / nl * w / 2), oy = up.clone().multiplyScalar(ny / nl * w / 2);
    q.copy(tmp).add(ox).add(oy); a.set([q.x, q.y, q.z], i * 6);
    q.copy(tmp).sub(ox).sub(oy); a.set([q.x, q.y, q.z], i * 6 + 3);
  }
  m.geometry.attributes.position.needsUpdate = true;
}

// ---------------------------------------------------------------- helpers
function softSprite() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}
export function buildPuffs(scene, n, color, opacity = 0.45) {
  const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: softSprite(), color, transparent: true, opacity, depthWrite: false }), n);
  m.frustumCulled = false; scene.add(m); return m;
}
/** Small glowing "heat" bits (instanced); colour per instance. */
export function buildDots(scene, n, r = 0.05, detail = 0) {
  const m = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(r, detail), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), n);
  m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3);
  m.frustumCulled = false; scene.add(m); return m;
}
/** A path made of straight segments with arc-length lookup: at(s) for s in [0,1]. */
export function polyPath(pts) {
  const P = pts.map(p => new THREE.Vector3(...p)), L = [0];
  for (let i = 1; i < P.length; i++) L.push(L[i - 1] + P[i].distanceTo(P[i - 1]));
  const total = L[L.length - 1];
  return {
    P, L, total,
    at(s) { const d = ((s % 1) + 1) % 1 * total; let i = 1; while (i < L.length - 1 && L[i] < d) i++; const u = (d - L[i - 1]) / (L[i] - L[i - 1] || 1); return P[i - 1].clone().lerp(P[i], u); },
    sOf(i) { return L[i] / total; },
  };
}
function tubeAlong(points, r, mat) {
  const cp = new THREE.CurvePath(); for (let i = 1; i < points.length; i++) cp.add(new THREE.LineCurve3(new THREE.Vector3(...points[i - 1]), new THREE.Vector3(...points[i])));
  return shadow(new THREE.Mesh(new THREE.TubeGeometry(cp, points.length * 16, r, 6, false), mat));
}

// ---------------------------------------------------------------- english-22: MEMS accelerometer (giant), bedroom (POV)
export const MEMS = { half: 0.75, A: 0.035, pitch: 0.15 };   // proof-mass half size, drawn deflection at 1 g, plate offset (×0.75) from its finger
const siM = (c, o = {}) => flat(c, { roughness: 0.35, metalness: 0.35, ...o });
function zigzag(a, b, n = 7, amp = 0.07) {   // serpentine spring polyline from a to b (in the xy plane)
  const d = b.clone().sub(a), L = d.length(), u = d.clone().normalize(), w = new THREE.Vector3(-u.y, u.x, 0), pts = [a.clone()];
  for (let i = 1; i < n * 2; i++) pts.push(a.clone().addScaledVector(u, (L * i) / (n * 2)).addScaledVector(w, i % 2 ? amp : -amp));
  pts.push(b.clone()); return pts;
}
/** Giant MEMS accelerometer die (in the xy plane, facing +z): a proof mass on four serpentine springs, comb fingers for both
 *  axes interleaved with fixed plates, anchors, a die with a "phone top" marker, and a board with other parts behind it.
 *  setOffset(dx, dy) moves the mass (springs re-drawn); fixed plates glow as the gap next to them narrows. */
export function buildMems(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(40, 30), flat('#1B2228')); back.position.set(0, 0, -3); back.receiveShadow = true; g.add(back);
  const board = shadow(new THREE.Mesh(new THREE.BoxGeometry(9, 9, 0.2), flat('#1F2B26', { roughness: 0.7 }))); board.position.z = -0.45; g.add(board);
  [[-3.1, 2.6, 0.9, 0.6], [3.0, -2.7, 1.1, 0.7], [-2.9, -2.4, 0.6, 0.6], [2.8, 2.9, 0.7, 1.0]].forEach(([x, y, w, h]) => { const c = shadow(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.25), flat('#2A2D30', { roughness: 0.5 }))); c.position.set(x, y, -0.25); g.add(c); });
  const die = new THREE.Group(); g.add(die);   // everything that turns with the phone
  const plate = shadow(new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.6, 0.2), siM('#5F6B78'))); plate.position.z = -0.25; die.add(plate);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.18), new THREE.MeshBasicMaterial({ color: PAL.lime, toneMapped: false })); top.position.set(0, 1.7, -0.14); die.add(top);   // marks the phone's top edge
  const anchorM = siM('#3C4550'), fixedBase = '#55606C', massM = siM('#D3DAE2', { emissive: '#3A4652', emissiveIntensity: 0.25 });
  const anchors = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => { const m = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.34), anchorM)); m.position.set(sx * 1.38, sy * 1.38, 0.0); die.add(m); return new THREE.Vector3(sx * 1.32, sy * 1.32, 0.1); });
  const mass = new THREE.Group(); die.add(mass);
  const H = MEMS.half, P = MEMS.pitch;
  const body = shadow(new THREE.Mesh(new THREE.BoxGeometry(2 * H, 2 * H, 0.18), massM)); body.position.z = 0.1; mass.add(body);
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.19), siM('#9AA5B1')); h.position.set(i * 0.26, j * 0.26, 0.1); mass.add(h); }   // etch holes
  const fixed = [];
  const finger = (w, h, m) => shadow(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.16), m));
  // y-sensing combs on the left/right edges (fingers along x, stacked in y) and x-sensing combs on the top/bottom edges
  for (const side of [-1, 1]) {
    for (const k of [-2, -1, 0, 1, 2]) {
      const f = finger(0.55, 0.06, massM); f.position.set(side * (H + 0.25), k * 0.33, 0.1); mass.add(f);
      for (const dir of [-1, 1]) { const m = siM(fixedBase, { emissive: PAL.lime, emissiveIntensity: 0 }); const ff = finger(0.55, 0.05, m); ff.position.set(side * (H + 0.47), k * 0.33 + dir * P * 0.75, 0.1); die.add(ff); fixed.push({ m, axis: 'y', dir }); }
    }
    const rail = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.75, 0.2), anchorM)); rail.position.set(side * (H + 0.78), 0, 0.1); die.add(rail);
    for (const k of [-2, -1, 0, 1, 2]) {
      const f = finger(0.06, 0.55, massM); f.position.set(k * 0.33, side * (H + 0.25), 0.1); mass.add(f);
      for (const dir of [-1, 1]) { const m = siM(fixedBase, { emissive: PAL.lime, emissiveIntensity: 0 }); const ff = finger(0.05, 0.55, m); ff.position.set(k * 0.33 + dir * P * 0.75, side * (H + 0.47), 0.1); die.add(ff); fixed.push({ m, axis: 'x', dir }); }
    }
    const rail2 = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.1, 0.2), anchorM)); rail2.position.set(0, side * (H + 0.78), 0.1); die.add(rail2);
  }
  const springM = flat(PAL.lime, { emissive: PAL.lime, emissiveIntensity: 0.45, roughness: 0.4 });
  const springs = anchors.map(() => { const m = shadow(new THREE.Mesh(new THREE.BufferGeometry(), springM)); die.add(m); return m; });
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => new THREE.Vector3(sx * H, sy * H, 0.1));
  let last = '';
  const setOffset = (dx, dy) => {
    mass.position.set(dx, dy, 0);
    const key = `${dx.toFixed(4)},${dy.toFixed(4)}`;
    if (key !== last) {
      last = key;
      springs.forEach((m, i) => {
        const a = corners[i].clone().add(new THREE.Vector3(dx, dy, 0)), pts = zigzag(a, anchors[i]);
        const cp = new THREE.CurvePath(); for (let k = 1; k < pts.length; k++) cp.add(new THREE.LineCurve3(pts[k - 1], pts[k]));
        m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(cp, pts.length * 4, 0.05, 6, false);
      });
    }
    // a fixed plate glows as the moving finger next to it comes closer (the gap the chip measures)
    for (const f of fixed) {
      const d = f.axis === 'y' ? dy : dx, near = Math.abs(d) > 1e-4 && Math.sign(d) === f.dir ? 1 : 0;
      f.m.emissiveIntensity = near * Math.min(1, Math.abs(d) / MEMS.A) * 0.9;
    }
  };
  setOffset(0, 0);
  return { group: g, die, mass, setOffset };
}
/** A small bedroom for the lying-down POV: bed, pillow, blanket, wall, window light and lamp. */
export function buildBedroom(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), flat('#E9DCC6')); wall.position.set(0, 3, -2.2); wall.receiveShadow = true; g.add(wall);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), flat('#DCCDB4')); side.rotation.y = Math.PI / 2; side.position.set(-2.6, 3, 2); side.receiveShadow = true; g.add(side);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), flat('#B98557')); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; g.add(floor);
  const frame = shadow(new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 2.6), flat('#8A6446'))); frame.position.set(0, 0.25, 0); g.add(frame);
  const mattress = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 2.5), flat('#F4F1EA'))); mattress.position.set(0, 0.55, 0); g.add(mattress);
  const blanket = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.12, 1.6), flat('#7DA0B8'))); blanket.position.set(0, 0.72, 0.45); g.add(blanket);
  const band = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.13, 0.12), flat(PAL.lime)); band.position.set(0, 0.72, -0.3); g.add(band);
  const pillow = shadow(new THREE.Mesh(facet(new THREE.BoxGeometry(0.75, 0.2, 0.45, 3, 2, 2), 0.02, 9), flat('#FFFFFF'))); pillow.position.set(-0.45, 0.78, -0.9); g.add(pillow);
  const head = shadow(new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.1, 0.12), flat('#8A6446'))); head.position.set(0, 1.0, -1.32); g.add(head);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), new THREE.MeshBasicMaterial({ color: '#FFE9BE', toneMapped: false })); win.position.set(1.6, 2.4, -2.18); g.add(win);
  const table = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.45), flat('#8A6446'))); table.position.set(1.35, 0.28, -0.9); g.add(table);
  const lamp = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.22, 10), flat(PAL.lime, { emissive: '#FFE3A8', emissiveIntensity: 0.6 }))); lamp.position.set(1.35, 0.7, -0.9); g.add(lamp);
  const foot = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), flat('#E3D3B8')); foot.rotation.y = Math.PI; foot.position.set(0, 3, 3.2); foot.receiveShadow = true; g.add(foot);
  const fwin = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.1), new THREE.MeshBasicMaterial({ color: '#FFE9BE', toneMapped: false })); fwin.rotation.y = Math.PI; fwin.position.set(0.6, 1.75, 3.18); g.add(fwin);
  const sill = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.15), flat('#FFFFFF'))); sill.position.set(0.6, 1.17, 3.12); g.add(sill);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), flat(PAL.lime)); pic.rotation.y = Math.PI; pic.position.set(-0.9, 1.6, 3.18); g.add(pic);
  const footboard = shadow(new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.75, 0.1), flat('#8A6446'))); footboard.position.set(0, 0.6, 1.3); g.add(footboard);
  return { group: g };
}

/** Arrow along +y from the origin: shaft (cylinder) + head (cone); setLength(L) keeps the head size. */
export function buildArrow(scene, color, r = 0.045, opacity = 1) {
  const g = new THREE.Group(); scene.add(g);
  const m = new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: opacity < 1, opacity, depthTest: false });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 10), m); shaft.renderOrder = 20; g.add(shaft);
  const head = new THREE.Mesh(new THREE.ConeGeometry(r * 2.6, r * 5, 12), m); head.renderOrder = 21; g.add(head);
  const hl = r * 5;
  g.userData.setLength = L => { const s = Math.max(0.001, L - hl); shaft.scale.y = s; shaft.position.y = s / 2; head.position.y = s + hl / 2; head.visible = L > hl * 0.6; shaft.visible = L > 0.002; };
  g.userData.mat = m;
  return g;
}
