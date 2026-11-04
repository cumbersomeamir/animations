// "Low-poly Everyday Discovery" world: flat-shaded café corner and the same original everyday person (FK acting rig)
// as feedback round 01 (buildCafe / buildPerson are unchanged), plus Hindi episode 04 props: a portable induction plate,
// a steel chai pot, an aluminium pan, a fridge magnet, steam, and a giant induction cutaway for the mechanism shots.
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

// ================================================================ Hindi episode 04 props
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

/** Lathe vessel (open top): radius R, height H, wall w, base thickness b, slight flare. */
function vesselGeometry(R, H, w, b, flare = 0.08, seg = 18) {
  const pts = [V2(0, 0), V2(R, 0), V2(R * (1 + flare * 0.5), H * 0.5), V2(R * (1 + flare), H), V2(R * (1 + flare) - w, H), V2(R * (1 + flare * 0.5) - w, H * 0.5), V2(R - w, b), V2(0, b)];
  const g = new THREE.LatheGeometry(pts, seg); g.computeVertexNormals(); return g;
}
const V2 = (x, y) => new THREE.Vector2(x, y);

/** Portable induction plate: black glass top with a cooking-zone ring, control strip with power LEDs (icons only). */
export function buildInduction(scene) {
  const g = new THREE.Group(), W = 0.3, D = 0.34;
  const body = shadow(box(W, 0.045, D, flat('#3A3631', { roughness: 0.6 }))); body.position.y = 0.0225; g.add(body);
  const glass = shadow(box(W - 0.006, 0.008, D - 0.006, new THREE.MeshStandardMaterial({ color: '#141412', roughness: 0.18, metalness: 0.1 }))); glass.position.y = 0.049; g.add(glass);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.083, 0.088, 40), new THREE.MeshBasicMaterial({ color: '#8C8A84' })); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.0532, -0.02); g.add(ring);
  const leds = [];
  for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.002, 0.006), new THREE.MeshBasicMaterial({ color: '#3A3A36' })); l.position.set(-0.04 + i * 0.016, 0.0535, 0.135); g.add(l); leds.push(l); }
  const power = new THREE.Mesh(new THREE.CircleGeometry(0.008, 16), new THREE.MeshBasicMaterial({ color: PAL.lime })); power.rotation.x = -Math.PI / 2; power.position.set(0.1, 0.0535, 0.135); g.add(power);
  scene.add(g); return { group: g, leds, power, top: 0.053, zone: V3(0, 0.053, -0.02) };
}

/** Steel chai pot (patila) with liquid, rim, and bubbles; or an aluminium pan with a handle. */
export function buildPot(scene, kind = 'steel') {
  const g = new THREE.Group();
  const steel = kind === 'steel', R = steel ? 0.072 : 0.082, H = steel ? 0.082 : 0.04;
  const mat = flat(steel ? '#C3C8C9' : '#E6E9EA', { roughness: steel ? 0.38 : 0.5, metalness: steel ? 0.12 : 0.05, side: THREE.DoubleSide });
  const v = shadow(new THREE.Mesh(vesselGeometry(R, H, 0.004, 0.005, steel ? 0.12 : 0.18), mat)); g.add(v);
  let liquid = null;
  if (steel) { liquid = new THREE.Mesh(new THREE.CircleGeometry(R * 1.04, 24), flat('#B98250', { roughness: 0.35 })); liquid.rotation.x = -Math.PI / 2; liquid.position.y = H * 0.62; g.add(liquid); }
  else { const h = shadow(box(0.13, 0.008, 0.018, flat('#2E2B27'))); h.position.set(R + 0.07, H * 0.8, 0); g.add(h); }
  scene.add(g); return { group: g, R, H, liquid, kind };
}

/** Lime fridge magnet. */
export function buildMagnet(scene) {
  const g = new THREE.Group();
  const m = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 14), flat(PAL.lime))); m.rotation.x = Math.PI / 2; g.add(m);
  const d = new THREE.Mesh(new THREE.CylinderGeometry(0.0145, 0.0145, 0.0025, 14), flat('#3A3631')); d.rotation.x = Math.PI / 2; d.position.z = -0.005; g.add(d);
  scene.add(g); return g;
}

/** Soft camera-facing steam puffs (radial alpha texture), as in round 02. */
export function buildSteam(scene, n = 60) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: '#FFFFFF', transparent: true, opacity: 0.4, depthWrite: false }), n);
  m.frustumCulled = false; scene.add(m); return m;
}

/** Giant induction cutaway: open body, translucent black glass, copper spiral coil, alternating field loops,
 *  a giant steel pot and aluminium pan (translucent walls) with base discs, eddy-current rings and bubbles. */
export function buildGiantInduction(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const TOP = 0.9;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), flat('#5A4130')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  const plinth = shadow(box(3.6, 0.3, 3.0, flat('#EFE6D4'))); plinth.position.y = 0.15; g.add(plinth);
  const bodyM = flat('#3A3631', { roughness: 0.6 });
  const back = box(3.2, 0.55, 0.06, bodyM); back.position.set(0, 0.575, -1.27); g.add(back);
  for (const s of [-1, 1]) { const side = box(0.06, 0.55, 2.6, bodyM); side.position.set(s * 1.57, 0.575, 0); g.add(side); }
  const floorP = box(3.2, 0.04, 2.6, flat('#2B2825')); floorP.position.y = 0.32; g.add(floorP);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 2.6), new THREE.MeshStandardMaterial({ color: '#1A1A18', roughness: 0.1, transparent: true, opacity: 0.45 })); glass.position.y = TOP - 0.03; g.add(glass);
  const gEdge = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color: '#8C8A84', transparent: true, opacity: 0.7 })); gEdge.position.copy(glass.position); g.add(gEdge);
  // copper spiral coil
  const pts = []; for (let i = 0; i <= 420; i++) { const a = i / 420 * Math.PI * 2 * 7, r = 0.18 + 0.8 * i / 420; pts.push(V3(r * Math.cos(a), 0.62, r * Math.sin(a))); }
  const coil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 900, 0.035, 6, false), new THREE.MeshStandardMaterial({ color: '#C87533', emissive: '#7A3A12', emissiveIntensity: 0.25, roughness: 0.35, metalness: 0.6, flatShading: true }));
  coil.castShadow = true; g.add(coil);
  // field loops: half-ellipses rising through the cooking zone and closing outside
  const loops = [];
  for (let k = 0; k < 10; k++) {
    const a = k / 10 * Math.PI * 2, r0 = 0.3, r1 = 1.25;
    const curve = new THREE.CatmullRomCurve3([V3(r0 * Math.cos(a), 0.64, r0 * Math.sin(a)), V3(0.35 * Math.cos(a), 1.35, 0.35 * Math.sin(a)), V3(0.9 * Math.cos(a), 1.55, 0.9 * Math.sin(a)), V3(r1 * Math.cos(a), 1.1, r1 * Math.sin(a)), V3(r1 * Math.cos(a), 0.64, r1 * Math.sin(a))]);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.018, 5, false), new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    g.add(m); loops.push({ m, curve });
  }
  const arrows = loops.map(() => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 6), new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0, toneMapped: false })); g.add(c); return c; });
  // giant vessels (translucent walls so base + eddy rings + bubbles read)
  const mkVessel = (kind) => {
    const p = new THREE.Group(); g.add(p);
    const steel = kind === 'steel', R = steel ? 0.95 : 1.05, H = steel ? 1.05 : 0.5;
    const wall = new THREE.Mesh(vesselGeometry(R, H, 0.03, 0.001, steel ? 0.12 : 0.18, 36), new THREE.MeshStandardMaterial({ color: steel ? '#C3C8C9' : '#E6E9EA', roughness: 0.35, metalness: 0.1, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }));
    p.add(wall);
    const baseM = new THREE.MeshStandardMaterial({ color: steel ? '#B4B9BA' : '#DDE0E1', roughness: 0.4, metalness: 0.1, emissive: '#FF6A1A', emissiveIntensity: 0 });
    const base = shadow(new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.09, 36), baseM)); base.position.y = 0.045; p.add(base);
    const rings = [0.3, 0.55, 0.8].map(r => { const t = new THREE.Mesh(new THREE.TorusGeometry(r * R, 0.04, 6, 48), new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0, toneMapped: false, depthTest: false })); t.renderOrder = 10; t.rotation.x = Math.PI / 2; t.position.y = 0.07; p.add(t); return t; });
    let liquid = null;
    if (steel) { liquid = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.05, R * 0.99, H * 0.55, 36), new THREE.MeshStandardMaterial({ color: '#B98250', roughness: 0.35, transparent: true, opacity: 0.5, depthWrite: false })); liquid.position.y = 0.09 + H * 0.275; p.add(liquid); }
    else { const h = box(1.4, 0.07, 0.2, flat('#2E2B27')); h.position.set(R + 0.75, H * 0.8, 0); p.add(h); }
    return { group: p, base, rings, liquid, R, H, kind };
  };
  const pot = mkVessel('steel'), pan = mkVessel('alu');
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: '#FFF6E8', transparent: true, opacity: 0.75 }), 40);
  bubbles.frustumCulled = false; g.add(bubbles);
  return { group: g, TOP, coil, loops, arrows, pot, pan, bubbles, glass };
}
