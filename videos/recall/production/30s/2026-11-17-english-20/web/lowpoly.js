// "Low-poly Everyday Discovery" world: flat-shaded café corner and the same original everyday person (FK acting rig)
// and lime phone as feedback round 01 (buildCafe / buildPerson / buildPhone are unchanged), plus english-20 props: a café glass
// of water with a lime straw drawn where it appears, a giant water section with an eye and a Snell's-law light path, a lawn mower
// crossing from grass to pavement, and a pool cross-section with a ghost floor at the apparent depth.
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

// ---------------------------------------------------------------- english-20: refraction (café glass, giant ray section, mower, pool)
export const N_WATER = 1.333;   // OpenStax College Physics 2e, Table 25.1 (fresh water)
const glassM = (op, col = '#DCEEF6') => new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: op, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide });
const waterM = (op = 0.42) => new THREE.MeshStandardMaterial({ color: '#7FC0E2', transparent: true, opacity: op, roughness: 0.08, depthWrite: false, side: THREE.DoubleSide, emissive: '#2C6E96', emissiveIntensity: 0.15 });
const cyl = (r, a, b, m, seg = 10) => { const d = b.clone().sub(a), L = d.length(); const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, seg), m); c.position.copy(a).addScaledVector(d, 0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return c; };

/** Café glass of water with a lime straw; setBreak(dx, flat) draws the underwater part where it appears (shifted, flatter). */
export function buildCafeGlass(scene) {
  const g = new THREE.Group(); scene.add(g);
  const R = 0.042, H = 0.14, WY = 0.1;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.92, H, 28, 1, true), glassM(0.22)); glass.position.y = H / 2; g.add(glass);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.92, R * 0.92, 0.008, 28), glassM(0.4)); base.position.y = 0.004; g.add(base);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.002, R * 0.92 - 0.002, WY - 0.008, 28), waterM(0.38)); water.position.y = 0.008 + (WY - 0.008) / 2; g.add(water);
  const surf = new THREE.Mesh(new THREE.CircleGeometry(R - 0.002, 28), new THREE.MeshStandardMaterial({ color: '#CFEAF7', transparent: true, opacity: 0.5, roughness: 0.02, depthWrite: false })); surf.rotation.x = -Math.PI / 2; surf.position.y = WY; g.add(surf);
  const strawM = flat(PAL.lime, { emissive: PAL.lime, emissiveIntensity: 0.12 });
  const W = new THREE.Vector3(-0.004, WY, 0.0), dir = new THREE.Vector3(-0.42, 1, 0.12).normalize();
  const above = cyl(0.0048, W, W.clone().addScaledVector(dir, 0.13), strawM); g.add(above);
  const below = new THREE.Group(); g.add(below);
  const setBreak = (dx, flatten) => {
    below.clear();
    const down = new THREE.Vector3(-dir.x, -dir.y * (1 - flatten), -dir.z).normalize();
    const start = W.clone().add(new THREE.Vector3(dx, -0.002, 0.006 * Math.sign(dx)));
    let end = start.clone().addScaledVector(down, 0.12); if (end.y < 0.012) end = start.clone().addScaledVector(down, (start.y - 0.012) / -down.y);
    below.add(cyl(0.0052, start, end, strawM));
  };
  setBreak(0.014, 0.25);
  return { group: g, setBreak, WY };
}

/** Snell's law path in the x-y plane from an underwater point P to the eye E across the surface y = Y (bisection). */
export function snellPath(P, E, Y, n = N_WATER) {
  let lo = Math.min(P.x, E.x), hi = Math.max(P.x, E.x);
  const f = x => { const s1 = (x - P.x) / Math.hypot(x - P.x, Y - P.y), s2 = (E.x - x) / Math.hypot(E.x - x, E.y - Y); return n * s1 - s2; };
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; }
  const S = new THREE.Vector3((lo + hi) / 2, Y, P.z);
  const k = (P.x - E.x) / (S.x - E.x), Q = new THREE.Vector3(P.x, E.y + (S.y - E.y) * k, P.z);   // apparent point: E→S extended to x = P.x
  return { S, Q };
}

export function buildRaySection(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), flat('#3E2C21')); back.position.set(0, 6, -4); g.add(back);
  const slab = shadow(new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 5), flat('#B98557'))); slab.position.set(0, -0.2, -0.8); g.add(slab);
  // water tank section (front face open toward the camera)
  const Y = 2.0;
  const water = new THREE.Mesh(new THREE.BoxGeometry(3.6, Y, 1.4), waterM(0.5)); water.position.set(0, Y / 2, -0.7); g.add(water);
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.4), new THREE.MeshStandardMaterial({ color: '#D7EEF9', transparent: true, opacity: 0.55, roughness: 0.02, depthWrite: false, side: THREE.DoubleSide })); surf.rotation.x = -Math.PI / 2; surf.position.set(0, Y, -0.7); g.add(surf);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.025, 0.025), new THREE.MeshBasicMaterial({ color: '#EAF6FF', toneMapped: false })); edge.position.set(0, Y, 0.0); g.add(edge);
  for (const sx of [-1, 1]) { const w = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.0, 1.5), glassM(0.18))); w.position.set(sx * 1.84, 1.5, -0.7); g.add(w); }
  // the real straw (lime) and its apparent underwater image (ghost)
  const strawM = flat(PAL.lime, { emissive: PAL.lime, emissiveIntensity: 0.15 });
  const top = new THREE.Vector3(-1.15, 3.35, 0.05), P = new THREE.Vector3(0.3, 0.6, 0.05);
  const dirS = P.clone().sub(top).normalize(), W = top.clone().addScaledVector(dirS, (top.y - Y) / -dirS.y);
  g.add(cyl(0.07, top, P, strawM));
  const E = new THREE.Vector3(1.95, 3.15, 0.05);
  const { S, Q } = snellPath(P, E, Y);
  const ghostM = new THREE.MeshStandardMaterial({ color: PAL.lime, transparent: true, opacity: 0.45, emissive: PAL.lime, emissiveIntensity: 0.35, depthWrite: false });
  const ghost = cyl(0.07, W.clone(), Q.clone(), ghostM); ghost.visible = false; g.add(ghost);
  // the eye (white, iris looking toward the surface point)
  const eye = new THREE.Group(); eye.position.copy(E); g.add(eye);
  const ball = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 16), flat('#F6F1E6', { roughness: 0.35 }))); eye.add(ball);
  const iris = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 12), flat('#5C7A4C')); const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), flat('#14110E'));
  // the iris is turned a little toward the camera so the ball reads as an eye
  const look = S.clone().sub(E).normalize().lerp(new THREE.Vector3(0, 0, 1), 0.45).normalize();
  iris.position.copy(look.clone().multiplyScalar(0.27)); pupil.position.copy(look.clone().multiplyScalar(0.36)); iris.scale.set(1, 1, 0.5); eye.add(iris, pupil);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 10, 0, Math.PI * 2, 0, Math.PI * 0.32), flat('#A8714E')); lid.rotation.z = 0.45; eye.add(lid);
  // the light path (real) and the straight-back line the brain assumes (ghost)
  const rayM = new THREE.MeshBasicMaterial({ color: '#FFF3B0', toneMapped: false, transparent: true, opacity: 0.9, depthTest: false });
  // the light stops at the front of the eye (same straight line S→E, so the Snell path is unchanged)
  const Ein = E.clone().addScaledVector(S.clone().sub(E).normalize(), 0.3);
  const ray1 = cyl(0.025, P, S, rayM), ray2 = cyl(0.025, S, Ein, rayM); ray1.renderOrder = ray2.renderOrder = 20; g.add(ray1, ray2);
  const backM = new THREE.MeshBasicMaterial({ color: '#F8FAF3', toneMapped: false, transparent: true, opacity: 0.95, depthTest: false });
  const backL = new THREE.Group(); backL.visible = false; g.add(backL);   // dashed: the straight line the brain assumes
  const nd = 9; for (let i = 0; i < nd; i++) { const a = S.clone().lerp(Q, i / nd), b = S.clone().lerp(Q, (i + 0.55) / nd); const d = cyl(0.026, a, b, backM); d.renderOrder = 21; backL.add(d); }
  const dots = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.06, 1), new THREE.MeshBasicMaterial({ color: '#FFE37A', toneMapped: false, depthTest: false }), 24);
  dots.renderOrder = 22; dots.frustumCulled = false; g.add(dots);
  return { group: g, P, S, Q, E: Ein, eyeC: E, W, ray1, ray2, rayM, backL, backM, ghost, ghostM, dots, Y };
}

/** Lawn mower crossing from grass to pavement (origin = boundary point on the ground). */
export function buildMowerSet(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const grass = shadow(new THREE.Mesh(new THREE.PlaneGeometry(14, 14), flat('#6F9E4E')), false, true); grass.rotation.x = -Math.PI / 2; grass.position.set(-7, 0, 0); g.add(grass);
  const pave = shadow(new THREE.Mesh(new THREE.PlaneGeometry(14, 14), flat('#B9B4AA')), false, true); pave.rotation.x = -Math.PI / 2; pave.position.set(7, 0.002, 0); g.add(pave);
  for (let i = -6; i <= 6; i++) { const j = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.006, 14), flat('#A39E94')), false, true); j.position.set(1.2 + i * 1.2 > 0 ? 1.2 + i * 1.2 : -50, 0.004, 0); g.add(j); }
  for (let i = 0; i < 70; i++) { const t = shadow(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 4), flat(i % 2 ? '#5E8C41' : '#80AE5B'))); t.position.set(-0.3 - ((i * 0.618) % 1) * 6, 0.09, -5 + ((i * 0.37) % 1) * 10); g.add(t); }
  const mower = new THREE.Group(); g.add(mower);
  const body = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.32, 0.7), flat('#C9673F'))); body.position.y = 0.3; mower.add(body);
  const deck = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 0.12, 12), flat('#2F3732'))); deck.position.y = 0.2; mower.add(deck);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.06, 0.72), flat(PAL.lime)); stripe.position.y = 0.42; mower.add(stripe);
  for (const sz of [-1, 1]) { const bar = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6), flat('#2B2B2D'))); bar.position.set(-0.75, 0.75, sz * 0.25); bar.rotation.z = 0.9; mower.add(bar); }
  const grip = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), flat('#2B2B2D'))); grip.rotation.x = Math.PI / 2; grip.position.set(-1.18, 1.1, 0); mower.add(grip);
  const wheels = [[0.32, 0.36], [0.32, -0.36], [-0.32, 0.36], [-0.32, -0.36]].map(([x, z]) => { const w = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 12), flat('#1E1E20'))); w.rotation.x = Math.PI / 2; w.position.set(x, 0.13, z); mower.add(w); return w; });
  return { group: g, mower, wheels };
}

/** Pool cross-section: tiled floor (real depth), a ghost floor (apparent depth), and depth bars. Origin = pool rim centre at ground. */
export function buildPool(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const D = 2.4, L = 6, Wd = 3;
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(50, 30), new THREE.MeshBasicMaterial({ color: '#A9D2EE' })); sky.position.set(0, 8, -12); g.add(sky);
  const deckM = flat('#E7DCC8');
  for (const [x, w] of [[-L / 2 - 2, 4], [L / 2 + 2, 4]]) { const d = shadow(new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, 8), deckM)); d.position.set(x, -0.15, -2); g.add(d); }
  const backDeck = shadow(new THREE.Mesh(new THREE.BoxGeometry(L, 0.3, 4), deckM)); backDeck.position.set(0, -0.15, -Wd - 2); g.add(backDeck);
  const tileM = flat('#9CCFE6'), wallM = flat('#BFE1F0');
  const floor = shadow(new THREE.Mesh(new THREE.BoxGeometry(L, 0.12, Wd), tileM)); floor.position.set(0, -D - 0.06, -Wd / 2); g.add(floor);
  for (let i = 0; i <= 10; i++) { const ln = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.01, Wd), flat('#6FAECD')); ln.position.set(-L / 2 + i * L / 10, -D + 0.005, -Wd / 2); g.add(ln); }
  const backW = shadow(new THREE.Mesh(new THREE.BoxGeometry(L, D, 0.12), wallM)); backW.position.set(0, -D / 2, -Wd); g.add(backW);
  for (const sx of [-1, 1]) { const w = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.12, D, Wd), wallM)); w.position.set(sx * L / 2, -D / 2, -Wd / 2); g.add(w); }
  const water = new THREE.Mesh(new THREE.BoxGeometry(L, D, Wd), waterM(0.45)); water.position.set(0, -D / 2 + 0.02, -Wd / 2); g.add(water);
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(L, Wd), new THREE.MeshStandardMaterial({ color: '#D9F0FB', transparent: true, opacity: 0.4, roughness: 0.02, depthWrite: false })); surf.rotation.x = -Math.PI / 2; surf.position.set(0, 0.02, -Wd / 2); g.add(surf);
  const ghostM = new THREE.MeshStandardMaterial({ color: PAL.lime, transparent: true, opacity: 0.0, emissive: PAL.lime, emissiveIntensity: 0.45, depthWrite: false, side: THREE.DoubleSide });
  const ghost = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.2, Wd - 0.2), ghostM); ghost.rotation.x = -Math.PI / 2; ghost.position.set(0, -D + 0.02, -Wd / 2); g.add(ghost);
  // depth bars at the front-left: real (paper) and apparent (lime)
  const barReal = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.12, D, 0.12), flat('#F8FAF3'))); barReal.position.set(-L / 2 + 0.5, -D / 2, 0.15); g.add(barReal);
  const barApp = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1, 0.12), flat(PAL.lime, { emissive: PAL.lime, emissiveIntensity: 0.3 })); barApp.position.set(-L / 2 + 0.75, -0.5, 0.15); g.add(barApp);
  // ladder and a lane rope for scale
  const steel = flat('#C9D0D6', { roughness: 0.35, metalness: 0.3 });
  for (const sz of [-0.25, 0.25]) { const r = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.6, 8), steel)); r.position.set(L / 2 - 0.6, -0.5, -Wd + 0.35 + sz); g.add(r);
    const hook = shadow(new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 6, 12, Math.PI), steel)); hook.rotation.y = Math.PI / 2; hook.position.set(L / 2 - 0.6, 0.78, -Wd + 0.13 + sz); g.add(hook); }
  for (let i = 0; i < 4; i++) { const st = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.5), steel)); st.position.set(L / 2 - 0.6, -0.4 - i * 0.45, -Wd + 0.35); g.add(st); }
  for (let i = 0; i < 18; i++) { const f = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 8), flat(i % 2 ? '#F8FAF3' : PAL.lime))); f.rotation.z = Math.PI / 2; f.position.set(-L / 2 + 0.3 + i * (L - 0.6) / 17, 0.04, -Wd / 2); g.add(f); }
  return { group: g, ghost, ghostM, barApp, D, L, Wd };
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
