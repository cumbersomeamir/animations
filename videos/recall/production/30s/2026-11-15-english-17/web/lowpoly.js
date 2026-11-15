// "Low-poly Everyday Discovery" world: flat-shaded café corner and the same original everyday person (FK acting rig)
// and lime phone as feedback round 01 (buildCafe / buildPerson / buildPhone are unchanged), plus english-17 props: an airliner
// window seat (sidewall lining, three-layer oval windows, shade, sunset sky, seats), a glowing marker for the window's small
// hole, fog that spreads between the layers, and a giant section through the window with air "pressure" dots.
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

// ---------------------------------------------------------------- english-17: airliner window seat + giant window section
// Cabin frame: the sidewall lining's inner face is the plane x = WIN.x, facing -x (into the cabin); the window centre is at
// (WIN.x, WIN.y, 0). Layers from the cabin outward: inner (scratch) pane, middle pane with the small hole, thick outer pane,
// fuselage skin. Sizes are close to real; the hole marker is enlarged so it reads on a phone (illustrative).
export const WIN = { x: 0.47, y: 1.15, a: 0.115, b: 0.165, inner: 0.045, middle: 0.085, outer: 0.1, skin: 0.115, holeY: -0.128 };
const ovalPts = (a, b, n = 48, e = 2.6) => Array.from({ length: n }, (_, i) => {
  const t = i / n * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
  return new THREE.Vector2(a * Math.sign(c) * Math.pow(Math.abs(c), 2 / e), b * Math.sign(s) * Math.pow(Math.abs(s), 2 / e));
});
const toWall = (geo, x) => { geo.rotateY(-Math.PI / 2); geo.translate(x, 0, 0); return geo; };   // shape (u=z, v=y), extrusion -> -x
const ovalAt = (a, b, cy) => ovalPts(a, b).map(p => new THREE.Vector2(p.x, p.y + cy));

function skyTexture() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 512; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, '#34558F'); gr.addColorStop(0.3, '#7495CB'); gr.addColorStop(0.47, '#E9B98F'); gr.addColorStop(0.52, '#F8D8A8'); gr.addColorStop(0.58, '#EBA57F'); gr.addColorStop(0.75, '#B98AA0'); gr.addColorStop(1, '#7E6687');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 512); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildCabin(scene) {
  const g = new THREE.Group(); scene.add(g);
  const W = WIN, cream = flat('#E9DFCC'), reveal = flat('#D9CCB3'), seatM = flat('#4F6457'), cover = flat('#F1EEE4');
  // sidewall lining with three window openings
  const wall = new THREE.Shape([new THREE.Vector2(-1.8, 0.45), new THREE.Vector2(1.8, 0.45), new THREE.Vector2(1.8, 1.95), new THREE.Vector2(-1.8, 1.95)]);
  for (const z of [-0.56, 0, 0.56]) wall.holes.push(new THREE.Path(ovalAt(W.a + 0.012, W.b + 0.012, W.y).map(p => new THREE.Vector2(p.x + z, p.y))));
  const lining = shadow(new THREE.Mesh(toWall(new THREE.ExtrudeGeometry(wall, { depth: 0.04, bevelEnabled: false }), W.x + 0.04), cream)); g.add(lining);
  const panes = [];
  for (const z of [-0.56, 0, 0.56]) {
    const ring = new THREE.Shape(ovalAt(W.a + 0.03, W.b + 0.03, W.y).map(p => new THREE.Vector2(p.x + z, p.y)));
    ring.holes.push(new THREE.Path(ovalAt(W.a + 0.004, W.b + 0.004, W.y).map(p => new THREE.Vector2(p.x + z, p.y))));
    g.add(shadow(new THREE.Mesh(toWall(new THREE.ExtrudeGeometry(ring, { depth: 0.08, bevelEnabled: false }), W.x + 0.12), reveal)));
    const glassM = (op, col) => new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: op, roughness: 0.08, metalness: 0, depthWrite: false, side: THREE.DoubleSide });
    const pane = (dx, op, col, th = 0.004) => { const sh = new THREE.Shape(ovalAt(W.a, W.b, W.y).map(p => new THREE.Vector2(p.x + z, p.y)));
      const m = new THREE.Mesh(toWall(new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false }), W.x + dx + th), glassM(op, col)); g.add(m); return m; };
    panes.push({ z, inner: pane(W.inner, 0.035, '#DCEAF2'), middle: pane(W.middle, 0.05, '#CFE3EE', 0.005), outer: pane(W.outer, 0.06, '#BFD8E8', 0.012) });
    // window shade, pulled most of the way up
    const shade = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.12), flat('#EFE7D6', { side: THREE.DoubleSide })); shade.rotation.y = -Math.PI / 2;
    shade.position.set(W.x + 0.03, W.y + W.b - 0.02, z); g.add(shade);
  }
  // fuselage skin seen through the windows
  const skinS = new THREE.Shape([new THREE.Vector2(-1.8, 0.4), new THREE.Vector2(1.8, 0.4), new THREE.Vector2(1.8, 2.0), new THREE.Vector2(-1.8, 2.0)]);
  for (const z of [-0.56, 0, 0.56]) skinS.holes.push(new THREE.Path(ovalAt(W.a - 0.005, W.b - 0.005, W.y).map(p => new THREE.Vector2(p.x + z, p.y))));
  g.add(new THREE.Mesh(toWall(new THREE.ExtrudeGeometry(skinS, { depth: 0.01, bevelEnabled: false }), W.x + W.skin + 0.01), flat('#E8ECEF')));
  // outside: sunset sky, sun glow and low clouds
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), new THREE.MeshBasicMaterial({ map: skyTexture(), toneMapped: false, fog: false })); sky.rotation.y = -Math.PI / 2; sky.position.set(W.x + 7, W.y, 0); g.add(sky);
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: softSprite(), color: '#FFE9C0', transparent: true, opacity: 0.95, depthWrite: false, fog: false })); sun.scale.set(1.6, 1.6, 1); sun.position.set(W.x + 6.5, W.y - 0.08, -0.9); g.add(sun);
  let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 34; i++) {   // a self-lit sea of clouds below the horizon
    const cc = ['#F4D3C6', '#E6B6B9', '#F8E2D2', '#D7A6B4'][i % 4];
    const c = new THREE.Mesh(facet(new THREE.IcosahedronGeometry(0.22 + r() * 0.3, 1), 0.05, i + 3), flat(cc, { emissive: cc, emissiveIntensity: 0.55, fog: false }));
    c.scale.set(1.9, 0.38, 1.4); c.position.set(W.x + 2.6 + r() * 4.5, W.y - 0.62 - r() * 0.55, -3.5 + r() * 7); g.add(c);
  }
  // overhead bin, ceiling, carpet
  g.add(shadow(box(0.6, 0.32, 3.6, cream))); g.children[g.children.length - 1].position.set(0.2, 2.12, 0);
  const carpet = shadow(new THREE.Mesh(new THREE.PlaneGeometry(4, 4), flat('#4A5560')), false, true); carpet.rotation.x = -Math.PI / 2; g.add(carpet);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), flat('#EDE6D8', { side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = 2.4; g.add(ceil);
  // window seat + middle seat (sage fabric, cream headrest covers)
  const seat = (x) => {
    const sg = new THREE.Group(); sg.position.set(x, 0, 0); g.add(sg);
    const cush = shadow(new THREE.Mesh(facet(new THREE.BoxGeometry(0.46, 0.12, 0.48), 0.006, 3), seatM)); cush.position.set(0, 0.45, 0.02); sg.add(cush);
    const back = shadow(new THREE.Mesh(facet(new THREE.BoxGeometry(0.46, 0.74, 0.11), 0.006, 4), seatM)); back.position.set(0, 0.86, -0.25); back.rotation.x = -0.12; sg.add(back);
    const head = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.17, 0.02), cover)); head.position.set(0, 1.13, -0.17); head.rotation.x = -0.12; sg.add(head);
    for (const sx of [-1, 1]) { const arm = shadow(box(0.05, 0.05, 0.42, flat('#3B4A41'))); arm.position.set(sx * 0.25, 0.64, 0.02); sg.add(arm); }
    const leg = shadow(box(0.4, 0.38, 0.06, flat('#2F3530'))); leg.position.set(0, 0.2, 0.02); sg.add(leg);
    return sg;
  };
  seat(0.12); seat(-0.38);
  return { group: g, panes };
}

/** Glowing marker for the breather hole in the middle pane of window z (enlarged for legibility). */
export function buildHoleMarker(scene) {
  const g = new THREE.Group(); scene.add(g);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0075, 0.0022, 6, 22), new THREE.MeshBasicMaterial({ color: PAL.lime, toneMapped: false })); ring.rotation.y = Math.PI / 2; g.add(ring);
  const core = new THREE.Mesh(new THREE.CircleGeometry(0.0057, 18), new THREE.MeshBasicMaterial({ color: '#10140D' })); core.rotation.y = -Math.PI / 2; core.position.x = -0.0005; g.add(core);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softSprite(), color: PAL.lime, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending })); glow.scale.set(0.075, 0.075, 1); g.add(glow);
  g.position.set(WIN.x + WIN.middle - 0.001, WIN.y + WIN.holeY, 0);
  return { group: g, glow, ring };
}

/** Fog between the middle and outer panes: an oval-clipped canvas spreading from the hole. */
export function buildFog(scene) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 368; const tex = new THREE.CanvasTexture(c);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * WIN.a, 2 * WIN.b), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  m.rotation.y = -Math.PI / 2; m.position.set(WIN.x + WIN.middle + 0.008, WIN.y, 0); scene.add(m);
  const draw = (u) => {   // u: 0..1 spread
    const g = c.getContext('2d'); g.clearRect(0, 0, 256, 368); if (u <= 0) { tex.needsUpdate = true; return; }
    g.save(); g.beginPath(); ovalPts(124, 180).forEach((p, i) => (i ? g.lineTo : g.moveTo).call(g, 128 + p.x, 184 - p.y)); g.closePath(); g.clip();
    const hx = 128, hy = 184 - WIN.holeY / WIN.b * 180, R = 40 + 320 * u;
    const gr = g.createRadialGradient(hx, hy, 4, hx, hy, R); gr.addColorStop(0, `rgba(240,246,250,${0.85 * Math.min(1, u * 2)})`); gr.addColorStop(0.6, `rgba(232,240,246,${0.6 * Math.min(1, u * 2)})`); gr.addColorStop(1, 'rgba(232,240,246,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 368); g.restore(); tex.needsUpdate = true;
  };
  draw(0);
  return { mesh: m, draw };
}

// ---------------------------------------------------------------- giant section through the window (origin: floor)
// Cut face at z = 0 facing +z. Cabin on the left (-x), outside on the right (+x). Thicknesses are exaggerated (illustrative).
export const SEC = {
  inner: [-0.78, -0.72], middle: [-0.34, -0.22], outer: [0.22, 0.46], y0: 1.05, y1: 3.35, hole: [1.45, 1.53],
  cabin: [[-3.6, -0.86, 0.6, 4.2], [-0.68, -0.38, 1.12, 3.28]], gap: [[-0.18, 0.18, 1.12, 3.28]], out: [[0.66, 3.6, 0.6, 4.2]],
};
export function buildWindowSection(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const D = 1.3, slabM = (col, op, em) => new THREE.MeshStandardMaterial({ color: col, transparent: op < 1, opacity: op, roughness: 0.15, flatShading: true, depthWrite: op >= 1, emissive: em || '#000000', emissiveIntensity: 0 });
  const blk = (x0, x1, y0, y1, m, z0 = -D, z1 = 0) => { const b = shadow(new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m)); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); g.add(b); return b; };
  // backdrop: warm cabin side, sky side; floor
  const bc = new THREE.Mesh(new THREE.PlaneGeometry(12, 9), flat('#6B5040')); bc.position.set(-6.35, 3, -D - 0.3); g.add(bc);
  const bs = new THREE.Mesh(new THREE.PlaneGeometry(12, 9), new THREE.MeshBasicMaterial({ color: '#3F6BA6' })); bs.position.set(6.55, 3, -D - 0.3); g.add(bs);
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.5), flat('#8297AC')); bg.position.set(-0.15, 2.2, -D - 0.01); g.add(bg);   // closes the gap behind the cut
  const fl = shadow(new THREE.Mesh(new THREE.PlaneGeometry(30, 12), flat('#5B4636')), false, true); fl.rotation.x = -Math.PI / 2; g.add(fl);
  // structure: skin, frame, seals, cabin lining
  const metal = flat('#B9C1C9', { roughness: 0.5, metalness: 0.2 }), frameM = flat('#8E98A3', { roughness: 0.5, metalness: 0.2 }), seal = flat('#2A2B2C'), lining = flat('#EADFCB');
  blk(0.5, 0.6, 3.55, 4.6, metal); blk(0.5, 0.6, 0.0, 0.85, metal);
  blk(-0.4, 0.6, 3.4, 3.58, frameM); blk(-0.4, 0.6, 0.85, 1.02, frameM);
  blk(-0.38, 0.48, 3.33, 3.42, seal); blk(-0.38, 0.48, 0.98, 1.07, seal);
  blk(-0.98, -0.82, 3.2, 4.3, lining); blk(-0.98, -0.82, 0.2, 1.2, lining);
  blk(-0.82, -0.4, 3.42, 3.5, lining); blk(-0.82, -0.4, 0.95, 1.03, lining);
  // panes
  const outerM = slabM('#A9CDE6', 0.42, '#C7F36B'), middleM = slabM('#BFDCEC', 0.42, '#F8FAF3'), innerM = slabM('#D6E8F1', 0.25);
  const S = SEC;
  blk(S.outer[0], S.outer[1], S.y0, S.y1, outerM);
  blk(S.middle[0], S.middle[1], S.y0, S.hole[0], middleM); blk(S.middle[0], S.middle[1], S.hole[1], S.y1, middleM);
  blk(S.middle[0], S.middle[1], S.hole[0], S.hole[1], middleM, -D, -0.16);               // the hole is a short channel at the cut
  blk(S.inner[0], S.inner[1], 1.2, 3.2, innerM);
  // bright edges on the cut face so the transparent panes read
  const edgeM = new THREE.MeshBasicMaterial({ color: '#EAF6FF', toneMapped: false });
  for (const [x0, x1] of [S.outer, S.middle, S.inner]) for (const x of [x0, x1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.018, S.y1 - S.y0, 0.018), edgeM); e.position.set(x, (S.y0 + S.y1) / 2, 0.005); g.add(e); }
  // hole highlight
  const holeGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softSprite(), color: PAL.lime, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  holeGlow.scale.set(0.2, 0.2, 1); holeGlow.position.set((S.middle[0] + S.middle[1]) / 2, (S.hole[0] + S.hole[1]) / 2, 0.05); g.add(holeGlow);
  const holeRing = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 6, 24), new THREE.MeshBasicMaterial({ color: PAL.lime, toneMapped: false, transparent: true, opacity: 0 }));
  holeRing.position.set((S.middle[0] + S.middle[1]) / 2, (S.hole[0] + S.hole[1]) / 2, 0.02); g.add(holeRing);
  // air "pressure" dots (instanced; positions set per frame)
  const dots = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.045, 0), new THREE.MeshStandardMaterial({ color: '#FFF4E2', roughness: 0.5, emissive: '#FFE7C2', emissiveIntensity: 0.35, flatShading: true }), 420);
  dots.frustumCulled = false; g.add(dots);
  return { group: g, outerM, middleM, holeGlow, holeRing, dots };
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
