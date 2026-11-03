// "Low-poly Everyday Discovery" world: flat-shaded café corner and the same original everyday person (FK acting rig)
// as feedback round 01 (buildCafe / buildPerson / buildPhone are unchanged), plus Hindi episode 03 props: an iced glass,
// a napkin, water drops, a real-scale index finger, and a giant touchscreen cross-section for the mechanism shots.
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
export function buildPhone(scene) {
  const g = new THREE.Group();
  const body = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.074, 0.152, 0.009), flat(PAL.lime, { roughness: 0.5 })));
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.148, 0.002), flat('#141412', { roughness: 0.3 })); bezel.position.z = 0.0046;
  const c = document.createElement('canvas'); c.width = 540; c.height = 1140;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.1393), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); screen.position.z = 0.0058;
  const cam = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 10), flat('#141412')); cam.rotation.x = Math.PI / 2; cam.position.set(-0.022, 0.058, -0.0052);
  const skin = flat('#A8714E');
  for (const [x, y, w, h] of [[0.0405, -0.022, 0.009, 0.02], [0.0405, -0.046, 0.009, 0.019], [-0.0405, -0.036, 0.009, 0.03]]) {
    const f = shadow(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.012), skin)); f.position.set(x, y, -0.0035); g.add(f);   // fingertips at the edges
  }
  g.add(body, bezel, screen, cam); scene.add(g);
  return { group: g, canvas: c, ctx: c.getContext('2d'), tex };
}

// ================================================================ Hindi episode 03 props
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const waterMat = (op = 0.55) => new THREE.MeshStandardMaterial({ color: '#CDEBF5', emissive: '#6FB7D0', emissiveIntensity: 0.35, roughness: 0.04, metalness: 0.0, transparent: true, opacity: op, flatShading: false });

/** Iced glass of water with condensation drops (drops slide down; positions set per frame). */
export function buildGlass(scene) {
  const g = new THREE.Group(), R = 0.036, H = 0.11;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.86, H, 12, 1, true), new THREE.MeshStandardMaterial({ color: '#E8F2F2', transparent: true, opacity: 0.32, roughness: 0.08, side: THREE.DoubleSide, flatShading: true }));
  glass.position.y = H / 2; g.add(glass);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.86, R * 0.86, 0.008, 12), new THREE.MeshStandardMaterial({ color: '#E8F2F2', transparent: true, opacity: 0.5, roughness: 0.1 })); base.position.y = 0.004; g.add(base);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.93, R * 0.82, H * 0.72, 12), waterMat(0.45)); water.position.y = 0.008 + H * 0.36; g.add(water);
  for (let i = 0; i < 3; i++) { const ice = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.018, 0.02), new THREE.MeshStandardMaterial({ color: '#F4FAFB', transparent: true, opacity: 0.7, roughness: 0.15, flatShading: true })); ice.position.set(-0.01 + i * 0.011, H * 0.7, (i % 2 ? 0.008 : -0.006)); ice.rotation.set(i, i * 0.7, 0.3); g.add(ice); }
  const lime = new THREE.Mesh(new THREE.TorusGeometry(R + 0.0006, 0.0025, 4, 20), flat(PAL.lime)); lime.rotation.x = Math.PI / 2; lime.position.y = H * 0.18; g.add(lime);
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2), waterMat(0.75), 26); drops.frustumCulled = false; g.add(drops);
  const dd = Array.from({ length: 26 }, (_, i) => ({ a: i * 2.39996, y0: 0.02 + ((i * 0.618) % 1) * 0.085, sp: 0.004 + 0.012 * ((i * 0.37) % 1), s: 0.0018 + 0.0014 * ((i * 0.53) % 1) }));
  scene.add(g); return { group: g, drops, dd, R, H };
}

/** Folded paper napkin (cream with a lime stripe). */
export function buildNapkin(scene) {
  const g = new THREE.Group();
  const n = shadow(new THREE.Mesh(facet(new THREE.BoxGeometry(0.09, 0.006, 0.075, 3, 1, 3), 0.0015, 5), flat('#F3EEE2'))); g.add(n);
  const st = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.0062, 0.008), flat(PAL.lime)); st.position.z = 0.026; g.add(st);
  scene.add(g); return g;
}

/** Water drops sitting on a surface (instanced hemispheres). */
export function buildDrops(scene, n, mat = waterMat(0.62)) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), mat, n);
  m.castShadow = false; m.frustumCulled = false; scene.add(m); return m;
}

/** Low-poly index finger, tip at the origin, pointing down -Y (length L, radius r). */
export function buildFinger(scene, L = 0.075, r = 0.0085) {
  const g = new THREE.Group(), skin = flat('#A8714E');
  const shaft = shadow(new THREE.Mesh(facet(new THREE.CylinderGeometry(r, r * 1.08, L, 8), r * 0.04, 61), skin)); shaft.position.y = r + L / 2; g.add(shaft);
  const tip = shadow(new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), skin)); tip.position.y = r; g.add(tip);
  const nail = new THREE.Mesh(new THREE.BoxGeometry(r * 1.2, r * 1.4, r * 0.25), flat('#D9A88A')); nail.position.set(0, r * 1.6, r * 0.88); g.add(nail);
  const knuckle = shadow(new THREE.Mesh(new THREE.SphereGeometry(r * 1.12, 8, 6), skin)); knuckle.position.y = r + L * 0.55; g.add(knuckle);
  scene.add(g); return g;
}

/** Giant touchscreen cross-section: cover glass, sense columns + drive rows (fine electrode grid), display,
 *  field arcs at every crossing, per-crossing signal discs, a location marker and a giant finger. */
export function buildGiantScreen(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const W = 3.2, D = 2.4, TOP = 1.0, NX = 8, NZ = 6, PX = 0.4, PZ = 0.4;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), flat('#5A4130')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  const plinth = shadow(box(W + 0.4, 0.5, D + 0.4, flat('#EFE6D4'))); plinth.position.y = 0.25; g.add(plinth);
  const display = shadow(box(W, 0.18, D, flat('#1E2420', { roughness: 0.5 }))); display.position.y = 0.59; g.add(display);
  const px = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.1, D - 0.1), new THREE.MeshBasicMaterial({ color: '#2C3A33' })); px.rotation.x = -Math.PI / 2; px.position.y = 0.681; g.add(px);
  const elec = new THREE.MeshStandardMaterial({ color: '#D9F2A6', emissive: '#7FA83A', emissiveIntensity: 0.25, transparent: true, opacity: 0.85, roughness: 0.3, flatShading: true });
  const rows = [], cols = [];
  for (let j = 0; j < NZ; j++) { const m = box(W - 0.1, 0.03, 0.07, elec.clone()); m.position.set(0, 0.74, (j - (NZ - 1) / 2) * PZ); g.add(m); rows.push(m); }
  for (let i = 0; i < NX; i++) { const m = box(0.07, 0.03, D - 0.1, elec.clone()); m.position.set((i - (NX - 1) / 2) * PX, 0.8, 0); g.add(m); cols.push(m); }
  const glass = new THREE.Mesh(new THREE.BoxGeometry(W, TOP - 0.83, D), new THREE.MeshStandardMaterial({ color: '#DCEFF2', transparent: true, opacity: 0.28, roughness: 0.05, flatShading: true }));
  glass.position.y = (TOP + 0.83) / 2; g.add(glass);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color: '#F4FAFB', transparent: true, opacity: 0.6 })); edge.position.copy(glass.position); g.add(edge);
  // field arcs (half-torus) standing over every crossing, drive row -> sense column
  const arcGeo = new THREE.TorusGeometry(0.13, 0.009, 4, 14, Math.PI);
  const arcs = new THREE.InstancedMesh(arcGeo, new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false }), NX * NZ * 2);
  arcs.frustumCulled = false; g.add(arcs);
  const sig = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 14), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false }), NX * NZ);
  sig.frustumCulled = false; g.add(sig);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 6, 32), new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0, toneMapped: false })); ring.rotation.x = Math.PI / 2; g.add(ring);
  const ghosts = Array.from({ length: 3 }, () => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.018, 6, 28), new THREE.MeshBasicMaterial({ color: '#F08A5D', transparent: true, opacity: 0, toneMapped: false })); m.rotation.x = Math.PI / 2; g.add(m); return m; });
  const drops = buildDrops(g, 3, waterMat(0.6));
  const film = new THREE.Mesh(new THREE.CircleGeometry(1, 28), waterMat(0.45)); film.rotation.x = -Math.PI / 2; g.add(film);
  const cloth = shadow(new THREE.Mesh(facet(new THREE.BoxGeometry(1.3, 0.06, 0.9, 4, 1, 4), 0.02, 9), flat('#F3EEE2'))); g.add(cloth);
  const clothStripe = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.062, 0.1), flat(PAL.lime)); clothStripe.position.z = 0.32; cloth.add(clothStripe);
  const finger = buildFinger(g, 1.25, 0.15);
  const cross = (i, j) => V3((i - (NX - 1) / 2) * PX, TOP, (j - (NZ - 1) / 2) * PZ);
  return { group: g, W, D, TOP, NX, NZ, PX, PZ, rows, cols, arcs, sig, ring, ghosts, drops, film, cloth, finger, cross, glass };
}
