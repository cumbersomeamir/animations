// "Low-poly Everyday Discovery" world: flat-shaded café corner and the same original everyday person (FK acting rig)
// and lime phone as feedback round 01 (buildCafe / buildPerson / buildPhone are unchanged), plus english-19 props: a giant
// half-section pressure cooker on a glowing hob (water, locking lid with valve weight and pressure gauge, a dial thermometer,
// food chunks), low-poly mountains for the payoff, and a small café cooker on a hotplate.
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

// ---------------------------------------------------------------- english-19: pressure cooker (giant half-section + café cooker)
// Giant pot profile is (r, y) in giant units around the y axis; the section keeps the back half (z <= 0), so the cut faces lie in
// the z = 0 plane facing the camera. Proportions are simplified; the thermometer and gauge dials are illustrations.
export const PC = { r: 1.0, wall: 0.06, base: 0.32, waterTop: 1.3, rim: 2.15 };
function chromeMatcap() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 256); sky.addColorStop(0, '#F4F7FA'); sky.addColorStop(0.46, '#AFC0CF'); sky.addColorStop(0.5, '#4A3A30'); sky.addColorStop(0.62, '#8A715E'); sky.addColorStop(1, '#E6D2BC');
  g.fillStyle = sky; g.fillRect(0, 0, 256, 256);
  const hl = g.createRadialGradient(92, 78, 4, 92, 78, 70); hl.addColorStop(0, 'rgba(255,255,255,0.95)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hl; g.fillRect(0, 0, 256, 256);
  const rim = g.createRadialGradient(128, 128, 90, 128, 128, 128); rim.addColorStop(0, 'rgba(0,0,0,0)'); rim.addColorStop(1, 'rgba(40,36,32,0.55)'); g.fillStyle = rim; g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const halfLathe = (prof, mat, capMat) => {
  const g = new THREE.Group();
  const lathe = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.0001), y)), 40, Math.PI / 2, Math.PI), mat); g.add(lathe);
  const sh = new THREE.Shape(prof.map(([r, y]) => new THREE.Vector2(r, y)));
  for (const sx of [1, -1]) { const cap = new THREE.Mesh(new THREE.ShapeGeometry(sh), capMat); cap.scale.x = sx; cap.position.z = 0.001; g.add(cap); }
  return { group: g, lathe };
};
/** Round dial (thermometer or pressure gauge) drawn on a canvas; set(value) redraws the needle. */
export function buildDial(parent, { min, max, ticks, label, size = 0.62, accent = PAL.lime }) {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const grp = new THREE.Group(); parent.add(grp);
  const rimM = new THREE.MeshMatcapMaterial({ matcap: chromeMatcap() });
  const bezel = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.56, size * 0.56, 0.08, 40), rimM); bezel.rotation.x = Math.PI / 2; grp.add(bezel);
  const face = new THREE.Mesh(new THREE.CircleGeometry(size * 0.5, 48), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); face.position.z = 0.045; grp.add(face);
  const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, ang = v => a0 + (a1 - a0) * (v - min) / (max - min);
  const set = (v, zone) => {
    g.fillStyle = '#F8FAF3'; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.fill();
    if (zone) { g.strokeStyle = zone.color; g.lineWidth = 34; g.beginPath(); g.arc(256, 256, 196, ang(zone.from), ang(zone.to)); g.stroke(); }
    g.strokeStyle = '#20251B'; g.fillStyle = '#20251B'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const tv of ticks) { const a = ang(tv); g.lineWidth = 8; g.beginPath(); g.moveTo(256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214); g.lineTo(256 + Math.cos(a) * 178, 256 + Math.sin(a) * 178); g.stroke();
      g.font = '700 62px Fredoka'; g.fillText(String(tv), 256 + Math.cos(a) * 128, 256 + Math.sin(a) * 128); }
    g.font = '700 44px Fredoka'; g.fillStyle = '#5B6650'; g.fillText(label, 256, 380);
    const a = ang(v); g.strokeStyle = '#E2553A'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + Math.cos(a) * 196, 256 + Math.sin(a) * 196); g.stroke();
    g.fillStyle = '#20251B'; g.beginPath(); g.arc(256, 256, 22, 0, Math.PI * 2); g.fill();
    tex.needsUpdate = true;
  };
  set(min);
  return { group: grp, set };
}
export function buildGiantCooker(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  // kitchen set: warm wall, oak counter, black hob with a glowing ring
  const back = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), flat('#3E2C21')); back.position.set(0, 6, -4); back.receiveShadow = true; g.add(back);
  const counter = shadow(new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 5), flat('#B98557'))); counter.position.set(0, -0.2, -0.8); g.add(counter);
  const hob = shadow(new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 2.6), flat('#1E1E20', { roughness: 0.35 }))); hob.position.set(0, 0.06, -0.5); g.add(hob);
  const glowM = new THREE.MeshBasicMaterial({ color: '#FF5A2A', toneMapped: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 6, 40, Math.PI), glowM); ring.rotation.x = -Math.PI / 2; ring.rotation.z = Math.PI; ring.position.set(0, 0.125, 0); g.add(ring);
  // pot (steel, half-section) and water
  const steel = flat('#A7AFB6', { roughness: 0.4, metalness: 0.2, side: THREE.DoubleSide }), capM = flat('#7D868F', { side: THREE.DoubleSide });
  const R = PC.r, w = PC.wall, b = 0.2, top = PC.rim;
  const pot = halfLathe([[0, b], [R - 0.08, b], [R, b + 0.08], [R, top], [R + 0.05, top], [R + 0.05, top - 0.08], [R + w, top - 0.1], [R + w, b + 0.06], [R - 0.06, b - 0.06], [0, b - 0.06]], steel, capM); g.add(pot.group);
  const waterM = new THREE.MeshStandardMaterial({ color: '#6FA6C9', transparent: true, opacity: 0.55, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false });
  const water = new THREE.Mesh(new THREE.CylinderGeometry(R - 0.005, R - 0.005, PC.waterTop - b, 40, 1, false, Math.PI / 2, Math.PI), waterM); water.position.y = (PC.waterTop + b) / 2; g.add(water);
  const wcut = new THREE.Mesh(new THREE.PlaneGeometry(2 * R - 0.01, PC.waterTop - b), waterM); wcut.position.set(0, (PC.waterTop + b) / 2, 0.003); g.add(wcut);
  // locking lid: dome, rim, long handle, valve stem with a weight, pressure gauge on top
  const lid = new THREE.Group(); g.add(lid);
  const lidSteel = flat('#B4BCC3', { roughness: 0.35, metalness: 0.25 });
  const dome = shadow(new THREE.Mesh(new THREE.SphereGeometry(R + 0.07, 40, 10, 0, Math.PI * 2, 0, Math.PI * 0.22), lidSteel)); dome.scale.y = 0.55; dome.position.y = -0.35; lid.add(dome);
  const lrim = shadow(new THREE.Mesh(new THREE.CylinderGeometry(R + 0.09, R + 0.09, 0.1, 40), lidSteel)); lrim.position.y = 0.0; lid.add(lrim);
  const handle = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.2), flat('#2B2B2D'))); handle.position.set(-1.6, 0.06, 0); lid.add(handle);
  const stem = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 10), lidSteel)); stem.position.set(0.32, 0.27, 0.15); lid.add(stem);
  const weight = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.16, 12), flat('#2B2B2D'))); weight.position.set(0.32, 0.42, 0.15); lid.add(weight);
  const gauge = buildDial(lid, { min: 1, max: 3, ticks: [1, 2, 3], label: '× pressure', size: 0.7 });
  gauge.group.position.set(-0.45, 0.42, 0.25); gauge.group.rotation.x = -0.35;
  // thermometer dial clipped to the pot's rim (front, cut side)
  const thermo = buildDial(g, { min: 80, max: 130, ticks: [80, 100, 120], label: '°C', size: 0.92 });
  thermo.group.position.set(0.66, 2.75, 0.35);
  const probe = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 8), lidSteel)); probe.position.set(0.66, 1.65, 0.12); g.add(probe);
  // food chunks (carrot and potato), hidden until the "food" beat
  const food = new THREE.Group(); g.add(food);
  const fc = ['#E8843A', '#E3C98F', '#E8843A', '#E3C98F', '#E8843A', '#E3C98F'];
  fc.forEach((c, i) => { const m = shadow(new THREE.Mesh(facet(new THREE.BoxGeometry(0.24, 0.22, 0.22), 0.02, 50 + i), flat(c, { emissive: c, emissiveIntensity: 0.25 }))); m.position.set(-0.6 + (i % 3) * 0.6, 0.38 + Math.floor(i / 3) * 0.3, -0.08 - (i % 2) * 0.12); m.rotation.set(i, i * 0.7, 0); food.add(m); });
  return { group: g, pot, water, waterM, lid, weight, gauge, thermo, food, ring, glowM };
}

/** Low-poly mountains + snow for the payoff (origin: floor of the set). */
export function buildMountains(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshBasicMaterial({ color: '#9CC3E6' })); sky.position.set(0, 10, -18); g.add(sky);
  [[-6, 7, 5.5, '#7F8C99'], [2, 9, 7, '#6E7C8A'], [9, 6, 5, '#8A97A3'], [-1.5, 5, 4, '#94A0AA']].forEach(([x, h, r, c], i) => {
    const m = shadow(new THREE.Mesh(facet(new THREE.ConeGeometry(r, h, 7), 0.25, 70 + i), flat(c))); m.position.set(x, h / 2 - 0.2, -10 - i); g.add(m);
    const cap = new THREE.Mesh(facet(new THREE.ConeGeometry(r * 0.32, h * 0.32, 7), 0.08, 80 + i), flat('#F4F6F8')); cap.position.set(x, h - 0.2 - h * 0.16 + 0.02, -10 - i); g.add(cap);
  });
  const ground = shadow(new THREE.Mesh(new THREE.PlaneGeometry(60, 30), flat('#8C9A7E')), false, true); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.4; g.add(ground);
  const rock = shadow(new THREE.Mesh(facet(new THREE.DodecahedronGeometry(1.4, 0), 0.1, 90), flat('#7A746C'))); rock.scale.set(1.6, 0.35, 1.2); rock.position.set(0, -0.3, -0.5); g.add(rock);
  return { group: g };
}

/** The small café pressure cooker on a hotplate (origin = hotplate base centre). */
export function buildCafeCooker(scene) {
  const g = new THREE.Group(); scene.add(g);
  const plate = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.24), flat('#1E1E20', { roughness: 0.35 }))); plate.position.y = 0.0175; g.add(plate);
  const steel = flat('#B4BCC3', { roughness: 0.35, metalness: 0.25 });
  const pot = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.085, 0.12, 22), steel)); pot.position.y = 0.035 + 0.06; g.add(pot);
  const lid = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.018, 22), steel)); lid.position.y = 0.035 + 0.129; g.add(lid);
  const handle = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.015, 0.025), flat('#2B2B2D'))); handle.position.set(-0.15, 0.17, 0); g.add(handle);
  const weight = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.02, 10), flat('#2B2B2D'))); weight.position.set(0.03, 0.185, 0.02); g.add(weight);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0905, 0.0905, 0.01, 22), flat(PAL.lime)); band.position.y = 0.06; g.add(band);
  return { group: g, valve: new THREE.Vector3(0.03, 0.2, 0.02) };
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
