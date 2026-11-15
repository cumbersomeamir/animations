// "Low-poly Everyday Discovery" world: flat-shaded café corner and the same original everyday person (FK acting rig)
// and lime phone as feedback round 01 (buildCafe / buildPerson are unchanged; buildPhone gains an option to drop the
// holding fingertips), plus english-16 props: a miniature head cross-section (skull, jaw, spine, airway, vocal folds, outer
// ear, eardrum and a lime cochlea), sound wave-front crescents, and a generic voice-note player/recorder screen.
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

// ---------------------------------------------------------------- english-16: miniature head cross-section (profile, facing +x)
// Profile units: neck base y = 0, crown y = 1, nose tip x = 0.42; scaled by HM.S onto a plinth (HM.base). The cut face is the
// z = 0 plane facing +z (the camera side); the slab extends back to z = -0.7. Simplified, illustrative anatomy: the outer ear,
// ear canal, eardrum and cochlea are drawn on the section so the two paths can be followed in one view.
export const HM = { S: 2.6, base: 0.95 };
export const hp = (x, y, z = 0) => new THREE.Vector3(x * HM.S, HM.base + y * HM.S, z);   // profile point -> model-local point
const OUTLINE = [[0.10, 0.0], [0.12, 0.17], [0.20, 0.29], [0.30, 0.325], [0.335, 0.37], [0.338, 0.415], [0.315, 0.44], [0.342, 0.47],
  [0.33, 0.52], [0.425, 0.555], [0.345, 0.655], [0.335, 0.71], [0.315, 0.81], [0.21, 0.94], [0.0, 1.0], [-0.24, 0.955], [-0.385, 0.83],
  [-0.425, 0.65], [-0.375, 0.49], [-0.24, 0.38], [-0.205, 0.18], [-0.205, 0.0]];
const SKULL_OUT = [[0.30, 0.70], [0.295, 0.80], [0.20, 0.915], [0.0, 0.968], [-0.225, 0.925], [-0.36, 0.81], [-0.395, 0.645], [-0.345, 0.515],
  [-0.21, 0.47], [-0.08, 0.50], [0.05, 0.515], [0.20, 0.50], [0.29, 0.53], [0.305, 0.60]];
const BRAIN = [[0.255, 0.70], [0.17, 0.875], [0.0, 0.925], [-0.20, 0.885], [-0.325, 0.785], [-0.355, 0.65], [-0.31, 0.56], [-0.17, 0.53],
  [-0.03, 0.565], [0.12, 0.60], [0.235, 0.645]];
const JAW = [[0.005, 0.515], [-0.035, 0.40], [0.02, 0.335], [0.27, 0.33], [0.305, 0.37], [0.30, 0.405], [0.24, 0.395], [0.07, 0.39],
  [0.035, 0.42], [0.04, 0.515]];
const AIRWAY = [[0.322, 0.448], [0.25, 0.468], [0.10, 0.478], [0.0, 0.48], [-0.055, 0.46], [-0.06, 0.40], [-0.05, 0.28], [-0.045, 0.0],
  [0.015, 0.0], [0.01, 0.27], [0.0, 0.37], [0.02, 0.425], [0.10, 0.445], [0.24, 0.437], [0.322, 0.44]];
const TONGUE = [[0.255, 0.436], [0.12, 0.443], [0.03, 0.42], [0.02, 0.375], [0.08, 0.385], [0.20, 0.405], [0.26, 0.42]];
const NASAL = [[0.315, 0.535], [0.25, 0.56], [0.10, 0.545], [0.02, 0.50], [0.10, 0.505], [0.26, 0.515]];
const PINNA = [[-0.105, 0.665], [-0.16, 0.655], [-0.19, 0.605], [-0.185, 0.53], [-0.155, 0.48], [-0.12, 0.475], [-0.105, 0.51],
  [-0.125, 0.53], [-0.14, 0.58], [-0.125, 0.625], [-0.095, 0.635]];
export const EAR = { canal: [-0.135, 0.55], drum: [-0.08, 0.55], cochlea: [-0.025, 0.533], larynx: [-0.018, 0.25], lips: [0.338, 0.445] };

const shapeOf = (pts, hole) => {
  const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x * HM.S, HM.base + y * HM.S)));
  if (hole) s.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x * HM.S, HM.base + y * HM.S))));
  return s;
};
const slab = (pts, depth, mat, z = 0, hole = null) => {
  const m = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(shapeOf(pts, hole), { depth, bevelEnabled: false }), mat)); m.position.z = z; return m;
};

export function buildHeadModel(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  // set: warm dark backdrop, floor, oak plinth
  const back = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), flat('#3B2B20')); back.position.set(0, 6, -3.2); back.receiveShadow = true; g.add(back);
  const floor = shadow(new THREE.Mesh(new THREE.PlaneGeometry(40, 20), flat('#5E4130')), false, true); floor.rotation.x = -Math.PI / 2; g.add(floor);
  const plinth = shadow(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.08, HM.base, 10), flat('#B98557'))); plinth.position.set(-0.15, HM.base / 2, -0.35); g.add(plinth);
  const skinM = flat('#B97F5C'), boneM = flat('#F1E6CF', { emissive: '#FFB347', emissiveIntensity: 0 }), brainM = flat('#D8A8A0'),
    airM = flat('#4E1C22', { roughness: 0.6 }), tongueM = flat('#D9707A'), earM = flat('#A8714E');
  const head = new THREE.Group(); g.add(head);
  head.add(slab(OUTLINE, 0.7, skinM, -0.7));                                   // the head slab; its front face is the section
  head.add(slab(BRAIN, 0.02, brainM, 0));
  const bones = new THREE.Group(); head.add(bones);
  bones.add(slab(SKULL_OUT, 0.045, boneM, 0, BRAIN));
  bones.add(slab(JAW, 0.045, boneM, 0));
  for (let i = 0; i < 6; i++) {                                                // cervical spine behind the airway
    const y0 = 0.035 + i * 0.072; bones.add(slab([[-0.17, y0], [-0.085, y0], [-0.08, y0 + 0.055], [-0.165, y0 + 0.058]], 0.045, boneM, 0));
  }
  head.add(slab(AIRWAY, 0.03, airM, 0));
  head.add(slab(NASAL, 0.05, airM, 0));
  head.add(slab(TONGUE, 0.04, tongueM, 0));
  // vocal folds: two small pads across the airway at the larynx (they vibrate while speaking)
  const foldM = new THREE.MeshStandardMaterial({ color: '#F4B9B2', flatShading: true, roughness: 0.6, emissive: PAL.lime, emissiveIntensity: 0 });
  const folds = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.028 * HM.S, 0.012 * HM.S, 0.06), foldM); m.position.copy(hp(EAR.larynx[0] + s * 0.016, EAR.larynx[1], 0.03)); head.add(m); return m; });
  // outer ear (raised), canal, eardrum, middle-ear bones and the lime cochlea
  const pinna = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(shapeOf(PINNA), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1 }), earM)); pinna.position.z = 0.02; head.add(pinna);
  const canal = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.07, 10), flat('#2A1414')); canal.rotation.x = Math.PI / 2; canal.position.copy(hp(...EAR.canal, 0.1)); head.add(canal);
  const canalTube = slab([[-0.135, 0.565], [-0.08, 0.565], [-0.08, 0.535], [-0.135, 0.535]], 0.05, flat('#2A1414'), 0.02); head.add(canalTube);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 12), flat('#F3E3C8', { emissive: PAL.lime, emissiveIntensity: 0 })); drum.rotation.z = Math.PI / 2; drum.position.copy(hp(...EAR.drum, 0.07)); head.add(drum);
  const coM = new THREE.MeshStandardMaterial({ color: PAL.lime, flatShading: true, roughness: 0.5, emissive: PAL.lime, emissiveIntensity: 0.15 });
  const spiral = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 5, r = 0.12 * (1 - i / 75); spiral.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)); }
  const cochlea = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiral), 90, 0.03, 6, false), coM); cochlea.position.copy(hp(...EAR.cochlea, 0.075)); head.add(cochlea);
  const vest = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 0), coM); vest.position.copy(hp(EAR.cochlea[0] - 0.03, EAR.cochlea[1] + 0.01, 0.075)); head.add(vest);
  const oss = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.03), boneM); oss.position.copy(hp(-0.055, 0.55, 0.07)); oss.rotation.z = 0.2; head.add(oss);
  // payoff: a fingertip plugging the ear canal (the air path is blocked; the bone path still arrives)
  const finger = new THREE.Group(); finger.visible = false; head.add(finger);
  const fm = flat('#A8714E'); const tipG = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.5, 8), fm); tipG.rotation.x = Math.PI / 2; tipG.position.z = 0.25; finger.add(tipG);
  const nail = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), fm); nail.position.z = 0.0; finger.add(nail);
  finger.position.copy(hp(...EAR.canal, 0.06)); finger.rotation.set(0.15, -0.35, 0); shadow(tipG); shadow(nail);
  return { group: g, head, bones, boneM, folds, foldM, coM, drum, finger };
}

/** Sound wave-fronts: lime crescents (instanced); each instance faces its travel direction. */
export function buildCrescents(scene, n, color, r = 0.16, tube = 0.03) {
  const geo = new THREE.TorusGeometry(r, tube, 4, 14, Math.PI * 0.8); geo.rotateZ(-Math.PI * 0.4);   // arc in the x-y plane, bulging toward +x (= travel direction)
  const m = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color, toneMapped: false }), n);
  m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3);
  m.frustumCulled = false; scene.add(m); return m;
}

/** Voice-note player / recorder artwork on a phone screen (generic, unbranded). s = { mode: 'play'|'rec', p: 0..1, t: seconds } */
export function drawVoiceNote(ph, s) {
  const g = ph.ctx, W = ph.canvas.width, H = ph.canvas.height;
  g.fillStyle = '#14180F'; g.fillRect(0, 0, W, H);
  const N = 30, bw = 10, gap = 6, x0 = (W - N * (bw + gap) + gap) / 2, cy = H * 0.5;
  for (let i = 0; i < N; i++) {
    const h = 40 + 150 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6 + 0.4)) * (0.6 + 0.4 * Math.sin(i * 0.9));
    const shown = s.mode === 'rec' ? i / N <= s.p : true, played = s.mode === 'play' ? i / N <= s.p : true;
    if (!shown) continue;
    g.fillStyle = played ? PAL.lime : '#5B6650'; g.fillRect(x0 + i * (bw + gap), cy - h / 2, bw, h);
  }
  if (s.mode === 'play') {   // play head + big pause button + timer
    const px = x0 + s.p * (N * (bw + gap) - gap); g.fillStyle = PAL.paper; g.fillRect(px - 3, cy - 120, 6, 240);
    g.fillStyle = PAL.lime; g.beginPath(); g.arc(W / 2, H * 0.78, 70, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#14180F'; g.fillRect(W / 2 - 26, H * 0.78 - 32, 18, 64); g.fillRect(W / 2 + 8, H * 0.78 - 32, 18, 64);
  } else {                   // recording dot
    g.fillStyle = '#F0614A'; g.beginPath(); g.arc(W / 2, H * 0.78, 70, 0, Math.PI * 2); g.fill();
    g.fillStyle = PAL.paper; g.beginPath(); g.arc(W / 2, H * 0.78, 30, 0, Math.PI * 2); g.fill();
  }
  const sec = Math.floor(s.t || 0); g.fillStyle = PAL.paper; g.font = '600 64px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(`0:${String(sec).padStart(2, '0')}`, W / 2, H * 0.24);
  ph.tex.needsUpdate = true;
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
