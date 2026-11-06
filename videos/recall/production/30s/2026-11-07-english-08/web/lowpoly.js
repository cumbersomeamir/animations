// "Low-poly Everyday Discovery" world: flat-shaded café corner and the same original everyday person (FK acting rig)
// and lime phone as feedback round 01 (buildCafe / buildPerson / buildPhone are unchanged), plus english-08 props:
// a TV remote (dark IR LED tip, battery cover, AAA batteries), a small TV on the counter, and a giant set for the mechanism
// shots (vertical light spectrum with eye/camera ranges, giant remote with invisible pulse rings, TV receiver, camera
// sensor tiles, a giant eye).
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


// ================================================================ english-08 props
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
export const IRC = '#C08AF0';   // false colour for infrared as a camera shows it (violet-white)

/** TV remote, tip toward local +z (so lookAt aims it). Size scales with s (1 = real, 0.17 m long). */
export function buildRemote(scene, s = 1) {
  const g = new THREE.Group(), L = 0.17 * s, W = 0.046 * s, T = 0.018 * s;
  const body = shadow(new THREE.Mesh(facet(new THREE.BoxGeometry(W, T, L, 2, 1, 4), 0.0006 * s, 51), flat('#2A2E28', { roughness: 0.6 }))); g.add(body);
  const btnM = flat('#4A5045'), limeM = flat(PAL.lime);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.0045 * s, 0.0045 * s, 0.004 * s, 8), btnM); b.position.set((c - 1) * 0.012 * s, T / 2 + 0.002 * s, (-0.02 - r * 0.013) * s); g.add(b); }
  const power = new THREE.Mesh(new THREE.CylinderGeometry(0.0065 * s, 0.0065 * s, 0.005 * s, 10), limeM); power.position.set(0, T / 2 + 0.0025 * s, 0.05 * s); g.add(power);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.011 * s, 0.002 * s, 4, 16), flat('#4A5045')); ring.rotation.x = Math.PI / 2; ring.position.set(0, T / 2 + 0.001 * s, 0.022 * s); g.add(ring);
  const ledM = new THREE.MeshStandardMaterial({ color: '#3A1C26', roughness: 0.2, transparent: true, opacity: 0.9, flatShading: true });
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.0055 * s, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), ledM); led.rotation.x = Math.PI / 2; led.position.set(0, 0, L / 2); g.add(led);
  const cover = shadow(new THREE.Mesh(new THREE.BoxGeometry(W * 0.86, 0.003 * s, 0.07 * s), flat('#343832'))); cover.position.set(0, -T / 2 - 0.0012 * s, -0.045 * s); g.add(cover);
  const thumb = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.016 * s, 0.012 * s, 0.024 * s), flat('#A8714E'))); thumb.position.set(0, T / 2 + 0.008 * s, 0.03 * s); thumb.rotation.x = 0.2; g.add(thumb);
  for (const sx of [-1, 1]) { const f = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.008 * s, 0.014 * s, 0.05 * s), flat('#A8714E'))); f.position.set(sx * (W / 2 + 0.003 * s), -0.002 * s, -0.03 * s); g.add(f); }
  scene.add(g); return { group: g, led, ledM, cover, power, thumb, L, T, W };
}

/** AAA battery (lime band) with its long axis along local z. */
export function buildBattery(scene, fresh = true) {
  const g = new THREE.Group();
  const b = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.0052, 0.0052, 0.044, 10), flat(fresh ? '#20251B' : '#6F6A60', { roughness: 0.5 }))); b.rotation.x = Math.PI / 2; g.add(b);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.00535, 0.00535, 0.012, 10), flat(fresh ? PAL.lime : '#9C958A')); band.rotation.x = Math.PI / 2; band.position.z = 0.012; g.add(band);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.002, 8), flat('#C9CDC4')); tip.rotation.x = Math.PI / 2; tip.position.z = 0.023; g.add(tip);
  scene.add(g); return g;
}

/** Small TV on a foot; its screen is a canvas (calm picture + volume bar). Screen faces local +z. */
export function buildCounterTV(scene) {
  const g = new THREE.Group();
  const frame = shadow(box(0.36, 0.23, 0.025, flat('#1C1D1A', { roughness: 0.5 }))); frame.position.y = 0.155; g.add(frame);
  const c = document.createElement('canvas'); c.width = 512; c.height = 320;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2125), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); screen.position.set(0, 0.155, 0.0131); g.add(screen);
  const foot = shadow(box(0.14, 0.012, 0.08, flat('#2A2B27'))); foot.position.y = 0.006; g.add(foot);
  const neck = shadow(box(0.03, 0.04, 0.02, flat('#2A2B27'))); neck.position.y = 0.03; g.add(neck);
  const rx = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 6), new THREE.MeshBasicMaterial({ color: '#3A1C26' })); rx.position.set(0.15, 0.052, 0.014); g.add(rx);
  scene.add(g); return { group: g, canvas: c, ctx: c.getContext('2d'), tex };
}

function spectrumTex() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 1024; const g = c.getContext('2d');
  const vis = 0.7;   // fraction of the column that is visible light (bottom violet -> red), the rest is infrared
  const stops = ['#6A3FD0', '#3D63E8', '#2FB7D8', '#43C25A', '#E8DB3A', '#F29A2E', '#E0402E'];
  const gr = g.createLinearGradient(0, 1024, 0, 1024 * (1 - vis));
  stops.forEach((s, i) => gr.addColorStop(i / (stops.length - 1), s));
  g.fillStyle = gr; g.fillRect(0, 1024 * (1 - vis), 128, 1024 * vis);
  g.fillStyle = '#24151A'; g.fillRect(0, 0, 128, 1024 * (1 - vis));
  g.strokeStyle = 'rgba(192,138,240,0.35)'; g.lineWidth = 6;
  for (let y = -128; y < 1024 * (1 - vis); y += 34) { g.beginPath(); g.moveTo(0, y + 128); g.lineTo(128, y); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/** Giant set on a plinth: vertical spectrum column (visible bottom -> infrared top) with an eye range bracket and a camera
 *  range bracket, a giant remote, invisible-pulse rings (instanced), a giant TV receiver panel, a camera sensor (lens +
 *  tile grid) and a giant eye. */
export const SPEC = { x: 0.0, z: -1.3, y0: 0.75, h: 3.4, w: 0.62, vis: 0.7, cam: 0.86 };
export function buildGiantIR(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), flat('#4A3626')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  const plinth = shadow(box(6.4, 0.5, 3.6, flat('#B98557'))); plinth.position.y = 0.25; g.add(plinth);
  const band = box(6.42, 0.08, 3.62, flat('#D9C3A0')); band.position.y = 0.38; g.add(band);
  // spectrum column
  const S = SPEC, col = new THREE.Group(); col.position.set(S.x, 0.5, S.z); g.add(col);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(S.w, S.h, 0.14), [flat('#2A2B27'), flat('#2A2B27'), flat('#2A2B27'), flat('#2A2B27'), new THREE.MeshBasicMaterial({ map: spectrumTex(), toneMapped: false }), flat('#2A2B27')]);
  bar.position.y = S.y0 - 0.5 + S.h / 2 + 0.25; col.add(bar);
  const foot = shadow(box(1.1, 0.12, 0.6, flat('#5B3E2A'))); foot.position.y = 0.06; col.add(foot);
  const post = shadow(box(0.12, S.y0 - 0.25, 0.12, flat('#5B3E2A'))); post.position.y = (S.y0 - 0.25) / 2 + 0.1; col.add(post);
  const yAt = f => S.y0 + 0.25 + f * S.h - 0.5;   // column-local y of a spectrum fraction
  function bracket(x, f1, color) {
    const b = new THREE.Group(); const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, toneMapped: false });
    const len = (f1) * S.h; const spine = new THREE.Mesh(new THREE.BoxGeometry(0.04, len, 0.04), m); spine.position.y = yAt(0) + len / 2; b.add(spine);
    for (const y of [yAt(0), yAt(f1)]) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.04), m); tk.position.set(-Math.sign(x) * 0.07, y, 0); b.add(tk); }
    b.position.x = x; b.position.z = 0.08; col.add(b); return { group: b, m };
  }
  const eyeBr = bracket(-0.55, S.vis, PAL.paper), camBr = bracket(0.55, S.cam, IRC);
  const irMark = new THREE.Mesh(new THREE.BoxGeometry(S.w + 0.16, 0.05, 0.18), new THREE.MeshBasicMaterial({ color: IRC, transparent: true, opacity: 0, toneMapped: false })); irMark.position.y = yAt(0.8); col.add(irMark);
  // giant remote (5x real scale... much bigger: s = 12)
  const remote = buildRemote(g, 12);
  remote.group.children.forEach(m => { if (m.material && m.material.color && m.material.color.getHexString() === 'a8714e') m.visible = false; });
  // invisible pulse rings (dim, dashed look) and their bright camera-view twins on the sensor
  const ringGeo = new THREE.TorusGeometry(0.2, 0.025, 4, 18);
  const rings = new THREE.InstancedMesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#8A4F7A', transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false }), 48);
  rings.frustumCulled = false; g.add(rings);
  // TV receiver panel (right)
  const tv = new THREE.Group(); tv.position.set(2.45, 0.5, 0.3); tv.rotation.y = -Math.PI / 2; g.add(tv);
  const tvF = shadow(box(1.9, 1.2, 0.12, flat('#1C1D1A', { roughness: 0.5 }))); tvF.position.y = 1.15; tv.add(tvF);
  const tc = document.createElement('canvas'); tc.width = 512; tc.height = 320; const ttex = new THREE.CanvasTexture(tc); ttex.colorSpace = THREE.SRGBColorSpace;
  const tvS = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 1.1125), new THREE.MeshBasicMaterial({ map: ttex, toneMapped: false })); tvS.position.set(0, 1.15, 0.061); tv.add(tvS);
  const tvFoot = shadow(box(0.7, 0.06, 0.4, flat('#2A2B27'))); tvFoot.position.y = 0.03; tv.add(tvFoot);
  const tvNeck = shadow(box(0.12, 0.5, 0.08, flat('#2A2B27'))); tvNeck.position.y = 0.3; tv.add(tvNeck);
  const rxM = new THREE.MeshBasicMaterial({ color: '#3A1C26', toneMapped: false });
  const rx = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), rxM); rx.position.set(0.75, 0.62, 0.07); tv.add(rx);
  // camera sensor (left): lens ring + tile grid
  const cam = new THREE.Group(); cam.position.set(-2.35, 0.5, 0.3); cam.rotation.y = Math.PI / 2; g.add(cam);
  const housing = shadow(box(1.5, 1.5, 0.3, flat('#2A2E28', { roughness: 0.5 }))); housing.position.set(0, 1.25, -0.12); cam.add(housing);
  const lens = shadow(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 8, 28), flat('#C9CDC4', { roughness: 0.3 }))); lens.position.set(0, 1.25, 0.32); cam.add(lens);
  const glassL = new THREE.Mesh(new THREE.CircleGeometry(0.42, 28), new THREE.MeshStandardMaterial({ color: '#BFD9E6', transparent: true, opacity: 0.25, roughness: 0.05 })); glassL.position.set(0, 1.25, 0.31); cam.add(glassL);
  const NX = 8, NY = 8, tileGeo = new THREE.BoxGeometry(0.14, 0.14, 0.04);
  const tiles = new THREE.InstancedMesh(tileGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), NX * NY); tiles.frustumCulled = false; cam.add(tiles);
  const tilePos = []; for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) tilePos.push(V3((i - (NX - 1) / 2) * 0.16, 1.25 + (j - (NY - 1) / 2) * 0.16, 0.05));
  tilePos.forEach((p, i) => { const m = new THREE.Matrix4().makeTranslation(p.x, p.y, p.z); tiles.setMatrixAt(i, m); tiles.setColorAt(i, new THREE.Color('#2C3326')); });
  const camStand = shadow(box(0.16, 0.5, 0.16, flat('#2A2B27'))); camStand.position.y = 0.25; cam.add(camStand);
  // giant eye (beside the sensor, looking the same way)
  const eye = new THREE.Group(); eye.position.set(-2.0, 0.5, -0.95); eye.rotation.y = Math.PI / 2 - 0.25; g.add(eye);
  const ball = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 12), flat('#F2EEE3', { roughness: 0.4 }))); ball.position.y = 1.0; ball.scale.set(1, 0.85, 0.85); eye.add(ball);
  const iris = new THREE.Mesh(new THREE.CircleGeometry(0.19, 22), flat('#6B4A2F')); iris.position.set(0, 1.0, 0.36); eye.add(iris);
  const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.09, 18), flat('#141210')); pupil.position.set(0, 1.0, 0.365); eye.add(pupil);
  const lid = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.44, 18, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), flat('#A8714E'))); lid.position.y = 1.0; lid.scale.set(1, 0.85, 0.88); lid.rotation.x = -0.35; eye.add(lid);
  const eyeStand = shadow(box(0.12, 0.6, 0.12, flat('#5B3E2A'))); eyeStand.position.y = 0.3; eye.add(eyeStand);
  return { group: g, col, yAt, eyeBr, camBr, irMark, remote, rings, tv, tvS, ttex, tc, tctx: tc.getContext('2d'), rx, rxM, cam, tiles, tilePos, eye };
}
