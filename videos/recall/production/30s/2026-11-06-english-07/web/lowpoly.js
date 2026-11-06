// "Low-poly Everyday Discovery" world: flat-shaded café corner and the same original everyday person (FK acting rig)
// and lime phone as feedback round 01 (buildCafe / buildPerson / buildPhone are unchanged), plus english-07 props:
// a charger brick + cable, a warm sun patch on the counter, a water glass and carafe, and a giant battery cutaway for the
// mechanism shots (charge slots filling, current stream, current and voltage dials, 80% ring, thermometer).
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


// ================================================================ english-07 props
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

/** Small white charger brick (lime USB-C port) lying on the counter; returns the cable socket point (local). */
export function buildCharger(scene) {
  const g = new THREE.Group();
  const b = shadow(new THREE.Mesh(facet(new THREE.BoxGeometry(0.05, 0.026, 0.05, 2, 1, 2), 0.0008, 41), flat('#F2EEE3', { roughness: 0.5 }))); b.position.y = 0.013; g.add(b);
  const port = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.006, 0.004), flat(PAL.lime)); port.position.set(0, 0.013, 0.026); g.add(port);
  scene.add(g); return g;
}

/** Charging cable: a tube rebuilt along a curve from the charger to the phone's port. */
export function buildCable(scene) {
  const m = shadow(new THREE.Mesh(new THREE.BufferGeometry(), flat('#F2EEE3', { roughness: 0.6 })));
  m.frustumCulled = false; scene.add(m);
  m.update = (pts) => { m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.0028, 6, false); };
  return m;
}

/** Warm window-light patch lying on the counter (additive) with faint heat shimmer strips. */
export function buildSunPatch(scene) {
  const g = new THREE.Group();
  const patch = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshBasicMaterial({ color: '#FFD08A', transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  patch.rotation.x = -Math.PI / 2; patch.scale.set(0.2, 0.13, 1); g.add(patch);
  const shim = [];
  for (let i = 0; i < 4; i++) {
    const pts = []; for (let k = 0; k <= 16; k++) pts.push(V3(0.004 * Math.sin(k * 0.9 + i), k * 0.006, 0));
    const s = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0012, 4, false), new THREE.MeshBasicMaterial({ color: '#FFE7B8', transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    s.position.set(-0.03 + i * 0.02, 0.002, 0.005 * (i % 2)); g.add(s); shim.push(s);
  }
  scene.add(g); return { group: g, patch, shim };
}

/** Clear drinking glass with water whose level is set per frame (0..1 of the glass height). */
export function buildGlass(scene, R = 0.032, H = 0.11) {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.86, H, 14, 1, true), new THREE.MeshStandardMaterial({ color: '#E8F2F2', transparent: true, opacity: 0.3, roughness: 0.08, side: THREE.DoubleSide, flatShading: true }));
  glass.position.y = H / 2; g.add(glass);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.0012, 4, 24), new THREE.MeshBasicMaterial({ color: '#F4FAFB', transparent: true, opacity: 0.8 })); rim.rotation.x = Math.PI / 2; rim.position.y = H; g.add(rim);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.86, R * 0.86, 0.006, 14), new THREE.MeshStandardMaterial({ color: '#E8F2F2', transparent: true, opacity: 0.55, roughness: 0.1 })); base.position.y = 0.003; g.add(base);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.94, R * 0.82, 1, 14), new THREE.MeshStandardMaterial({ color: '#BFE3EE', emissive: '#5FA7C0', emissiveIntensity: 0.3, transparent: true, opacity: 0.6, roughness: 0.05, flatShading: true }));
  g.add(water);
  const band = new THREE.Mesh(new THREE.TorusGeometry(R + 0.0006, 0.0022, 4, 24), flat(PAL.lime)); band.rotation.x = Math.PI / 2; band.position.y = H * 0.16; g.add(band);
  g.setLevel = (u) => { const h = Math.max(0.002, u * (H - 0.01)); water.scale.y = h; water.position.y = 0.006 + h / 2; water.visible = u > 0.005; };
  scene.add(g); return Object.assign(g, { R, H });
}

/** Glass carafe (lathe body, neck, lime handle); the spout point is returned in local space. */
export function buildCarafe(scene) {
  const g = new THREE.Group();
  const prof = [[0.0, 0], [0.04, 0], [0.046, 0.03], [0.045, 0.1], [0.03, 0.14], [0.022, 0.17], [0.026, 0.185]].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 14), new THREE.MeshStandardMaterial({ color: '#E8F2F2', transparent: true, opacity: 0.35, roughness: 0.08, side: THREE.DoubleSide, flatShading: true })); g.add(body);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.043, 0.039, 0.08, 14), new THREE.MeshStandardMaterial({ color: '#BFE3EE', emissive: '#5FA7C0', emissiveIntensity: 0.3, transparent: true, opacity: 0.55, flatShading: true })); water.position.y = 0.045; g.add(water);
  const handle = shadow(new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.007, 5, 12, Math.PI), flat(PAL.lime))); handle.rotation.z = -Math.PI / 2; handle.position.set(0.048, 0.1, 0); g.add(handle);
  scene.add(g); return Object.assign(g, { spout: V3(-0.026, 0.185, 0), water });
}

/** Water stream between two points (radius set per frame). */
export function buildStream(scene) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 10, 1, true), new THREE.MeshStandardMaterial({ color: '#CFEAF2', emissive: '#6FB7D0', emissiveIntensity: 0.4, transparent: true, opacity: 0.75, roughness: 0.05 }));
  m.frustumCulled = false; scene.add(m);
  const Y = V3(0, 1, 0);
  m.set = (a, b, r) => { const d = b.clone().sub(a), L = d.length(); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(Y, d.normalize()); m.scale.set(r, L, r); };
  return m;
}

export const CELL = { w: 1.5, d: 0.8, h: 2.8, base: 0.5, rows: 14, cols: 8, deep: 3 };

function dialFace(label, maxMark) {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#20251B'; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.fill();
  g.lineWidth = 12; g.strokeStyle = '#E8E2D2'; g.stroke();
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (1.15 - 1.3 * i / 10), r0 = i % 5 ? 175 : 155;
    g.strokeStyle = '#E8E2D2'; g.lineWidth = i % 5 ? 6 : 10; g.beginPath(); g.moveTo(256 + Math.cos(a) * r0, 256 - Math.sin(a) * r0); g.lineTo(256 + Math.cos(a) * 205, 256 - Math.sin(a) * 205); g.stroke();
  }
  if (maxMark) { const a = Math.PI * (1.15 - 1.3 * 0.85); g.strokeStyle = '#F08A5D'; g.lineWidth = 16; g.beginPath(); g.moveTo(256 + Math.cos(a) * 140, 256 - Math.sin(a) * 140); g.lineTo(256 + Math.cos(a) * 215, 256 - Math.sin(a) * 215); g.stroke(); }
  g.fillStyle = PAL.paper; g.font = '600 64px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(label, 256, 380);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** Giant battery cutaway on a plinth: glass shell, graphite shelves with charge slots (instanced beads that fill bottom-up),
 *  + terminal fed by a thick cable, a falling stream of charge beads, an 80% ring, a current dial, a voltage dial (with a max
 *  mark), a thermometer and a pause badge. */
export function buildGiantBattery(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const C = CELL;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), flat('#4A3626')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  const plinth = shadow(box(4.6, C.base, 2.6, flat('#B98557'))); plinth.position.y = C.base / 2; g.add(plinth);
  const band = box(4.62, 0.08, 2.62, flat('#D9C3A0')); band.position.y = C.base - 0.12; g.add(band);
  const cell = new THREE.Group(); cell.position.y = C.base; g.add(cell);
  const shellM = new THREE.MeshStandardMaterial({ color: '#DDEFF0', emissive: '#F08A5D', emissiveIntensity: 0, transparent: true, opacity: 0.16, roughness: 0.05, depthWrite: false, flatShading: true });
  const shell = new THREE.Mesh(new THREE.BoxGeometry(C.w, C.h, C.d), shellM); shell.position.y = C.h / 2; cell.add(shell);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(shell.geometry), new THREE.LineBasicMaterial({ color: '#F4FAFB', transparent: true, opacity: 0.75 })); edges.position.copy(shell.position); cell.add(edges);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(C.w - 0.02, C.h - 0.02), flat('#2A3022')); back.position.set(0, C.h / 2, -C.d / 2 + 0.01); cell.add(back);
  const floor = shadow(box(C.w, 0.08, C.d, flat('#C9CDC4'))); floor.position.y = 0.04; cell.add(floor);
  const cap = shadow(box(C.w, 0.1, C.d, flat('#C9CDC4'))); cap.position.y = C.h + 0.05; cell.add(cap);
  const term = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 16), flat('#E8E2D2', { roughness: 0.4 }))); term.position.y = C.h + 0.18; cell.add(term);
  const plus = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.04), flat(PAL.lime)); plus.position.y = C.h + 0.27; cell.add(plus);
  const plus2 = plus.clone(); plus2.rotation.y = Math.PI / 2; cell.add(plus2);
  // graphite shelves (rows) + slot beads
  const rowH = (C.h - 0.3) / C.rows, shelves = [];
  for (let r = 0; r < C.rows; r++) { const s = box(C.w - 0.06, 0.018, C.d - 0.08, flat('#3A4232')); s.position.y = 0.12 + r * rowH; cell.add(s); shelves.push(s); }
  const n = C.rows * C.cols * C.deep;
  const beads = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.055, 1), new THREE.MeshStandardMaterial({ color: PAL.lime, emissive: '#7FA83A', emissiveIntensity: 0.35, roughness: 0.4, flatShading: true }), n);
  beads.frustumCulled = false; cell.add(beads);
  const slots = [];
  for (let r = 0; r < C.rows; r++) for (let k = 0; k < C.deep; k++) for (let c = 0; c < C.cols; c++)
    slots.push(V3(-C.w / 2 + 0.14 + c * (C.w - 0.28) / (C.cols - 1), 0.12 + r * rowH + 0.07, (k - 1) * 0.22));
  const fallers = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.055, 1), new THREE.MeshBasicMaterial({ color: '#E9FFC2', toneMapped: false }), 40);
  fallers.frustumCulled = false; cell.add(fallers);
  const ring = new THREE.Mesh(new THREE.BoxGeometry(C.w + 0.08, 0.035, C.d + 0.08), new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0.9, toneMapped: false }));
  ring.position.y = 0.12 + 0.8 * (C.h - 0.3) + 0.02; cell.add(ring);
  // cable from above-left into the + terminal
  const cablePts = [V3(-3.2, 5.6, -0.4), V3(-1.6, 5.0, -0.2), V3(-0.4, 4.4, 0), V3(0, C.base + C.h + 0.6, 0), V3(0, C.base + C.h + 0.28, 0)];
  const cable = shadow(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePts), 60, 0.07, 8, false), flat('#F2EEE3', { roughness: 0.6 }))); g.add(cable);
  const plugM = shadow(box(0.26, 0.36, 0.18, flat('#E8E2D2', { roughness: 0.4 }))); plugM.position.set(0, C.base + C.h + 0.45, 0); g.add(plugM);
  const glowM = new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
  const glowStream = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 14, 1, true), glowM); glowStream.frustumCulled = false; cell.add(glowStream);
  // dials (current: left, voltage: right) on stands in front of the plinth
  const dials = [['current', false, -1.2], ['voltage', true, 1.2]].map(([lab, mx, x]) => {
    const d = new THREE.Group(); d.position.set(x, C.base + 0.95, 0.95); g.add(d);
    const stand = shadow(box(0.08, 0.95, 0.08, flat('#5B3E2A'))); stand.position.y = -0.48; d.add(stand);
    const rim = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 24), flat('#C9CDC4'))); rim.rotation.x = Math.PI / 2; d.add(rim);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.46, 32), new THREE.MeshBasicMaterial({ map: dialFace(lab, mx), toneMapped: false })); face.position.z = 0.045; d.add(face);
    const needle = new THREE.Group(); needle.position.z = 0.06; d.add(needle);
    const nm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.36, 0.015), flat(lab === 'current' ? PAL.lime : '#F8FAF3')); nm.position.y = 0.17; needle.add(nm);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12), flat('#20251B')); hub.rotation.x = Math.PI / 2; needle.add(hub);
    return { g: d, needle };
  });
  // thermometer (right, behind the voltage dial) and pause badge
  const thermo = new THREE.Group(); thermo.position.set(1.25, C.base, -0.6); g.add(thermo);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.6, 12), new THREE.MeshStandardMaterial({ color: '#F4FAFB', transparent: true, opacity: 0.35, roughness: 0.1 })); tube.position.y = 1.05; thermo.add(tube);
  const bulb = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), flat('#F08A5D'))); bulb.position.y = 0.2; thermo.add(bulb);
  const colM = new THREE.MeshStandardMaterial({ color: '#F08A5D', emissive: '#F08A5D', emissiveIntensity: 0.3, flatShading: true });
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1, 10), colM); thermo.add(column);
  const pause = new THREE.Group(); pause.position.set(0, C.base + C.h + 1.0, 0.2); g.add(pause);
  const pbg = new THREE.Mesh(new THREE.CircleGeometry(0.32, 28), new THREE.MeshBasicMaterial({ color: '#F08A5D', toneMapped: false })); pause.add(pbg);
  for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.3), new THREE.MeshBasicMaterial({ color: PAL.paper, toneMapped: false })); b.position.set(s * 0.08, 0, 0.005); pause.add(b); }
  // heat shimmer strips above the cell
  const heat = [];
  for (let i = 0; i < 5; i++) {
    const pts = []; for (let k = 0; k <= 20; k++) pts.push(V3(0.06 * Math.sin(k * 0.8 + i), k * 0.05, 0));
    const s = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.018, 5, false), new THREE.MeshBasicMaterial({ color: '#F08A5D', transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    s.position.set(-0.6 + i * 0.3, C.base + C.h + 0.2, 0.3); g.add(s); heat.push(s);
  }
  return { group: g, cell, shell, shellM, beads, slots, fallers, ring, glowStream, dials, thermo, column, pause, heat, term };
}
