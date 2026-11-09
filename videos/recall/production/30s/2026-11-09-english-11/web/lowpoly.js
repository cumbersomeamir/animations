// "Low-poly Everyday Discovery" world: flat-shaded café corner and the same original everyday person (FK acting rig)
// and lime phone as feedback round 01 (buildCafe / buildPerson / buildPhone are unchanged), plus english-11 props: the
// counter microwave and steam from round 02 (this app's own builders), a plate of food, a glass measuring cup, flat wave
// ribbons (from feedback-05), and a giant set for the mechanism shots (water molecules in food on a plate cross-section,
// and a cut-away porous mug with an iron-rich glaze).
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

// ---------------------------------------------------------------- counter microwave (round 02 builder; door on local +z, hinge on -x)
export function buildMicrowave(scene) {
  const g = new THREE.Group(), W = 0.5, H = 0.3, D = 0.38, t = 0.02, PW = 0.13;
  const shell = flat('#E8E2D6'), inner = flat('#DCD8CE'), panelM = flat('#2E2C28', { roughness: 0.5 });
  const add = (m, x, y, z) => { m.position.set(x, y, z); g.add(shadow(m)); return m; };
  add(box(W, t, D, shell), 0, H - t / 2, 0); add(box(W, t, D, shell), 0, t / 2, 0);
  add(box(t, H - 2 * t, D, shell), -W / 2 + t / 2, H / 2, 0);
  add(box(W - PW, H - 2 * t, t, inner), -PW / 2, H / 2, -D / 2 + t / 2);
  add(box(PW, H - 2 * t, D, shell), W / 2 - PW / 2, H / 2, 0);
  for (const [x, z] of [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]]) add(box(0.04, 0.012, 0.04, flat('#3A3631')), x, -0.006, z);
  const cx = (-W / 2 + t + W / 2 - PW) / 2;
  const lamp = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.12), new THREE.MeshBasicMaterial({ color: '#7A7468' }));
  lamp.rotation.x = Math.PI / 2; lamp.position.set(cx, H - t - 0.001, 0); g.add(lamp);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.006, 20), new THREE.MeshStandardMaterial({ color: '#DDEBEA', transparent: true, opacity: 0.55, roughness: 0.1 }));
  plate.position.set(cx, t + 0.012, 0); g.add(plate);
  const door = new THREE.Group(); door.position.set(-W / 2, 0, D / 2); g.add(door);
  const dp = shadow(box(W - PW, H, 0.024, shell)); dp.position.set((W - PW) / 2, H / 2, 0.012); door.add(dp);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(W - PW - 0.09, H - 0.09), new THREE.MeshStandardMaterial({ color: '#2A2926', roughness: 0.2, transparent: true, opacity: 0.78 }));
  win.position.set((W - PW) / 2 - 0.01, H / 2, 0.0245); door.add(win);
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.012, H - 0.024), panelM); pf.position.set(W / 2 - PW / 2, H / 2, D / 2 + 0.0012); g.add(pf);
  const dc = document.createElement('canvas'); dc.width = 512; dc.height = 232;
  const dtex = new THREE.CanvasTexture(dc); dtex.colorSpace = THREE.SRGBColorSpace; dtex.anisotropy = 8;
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.108, 0.049), new THREE.MeshBasicMaterial({ map: dtex, toneMapped: false }));
  disp.position.set(W / 2 - PW / 2, H - 0.05, D / 2 + 0.0024); g.add(disp);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const b = shadow(box(0.026, 0.02, 0.006, flat(r === 2 && c === 2 ? '#C9C3B6' : '#5A5650'))); b.position.set(W / 2 - PW / 2 + (c - 1) * 0.034, H - 0.12 - r * 0.034, D / 2 + 0.003); g.add(b);
  }
  scene.add(g);
  return { group: g, door, plate, lamp, disp, canvas: dc, ctx: dc.getContext('2d'), tex: dtex, cav: V3(cx, t + 0.016, 0), W, H, D };
}

/** Steam puffs (round 02 builder): an instanced soft sprite. */
export function buildSteam(scene, n = 60) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: '#FFFFFF', transparent: true, opacity: 0.4, depthWrite: false }), n);
  m.frustumCulled = false; scene.add(m); return m;
}

// ---------------------------------------------------------------- plate (ceramic, lime band) with an optional mound of food
export function buildPlate(scene, { food = true, R = 0.12 } = {}) {
  const g = new THREE.Group(); scene.add(g);
  const pts = [[0, 0.004], [R * 0.55, 0.0], [R * 0.6, 0.006], [R * 0.66, 0.006], [R * 0.9, 0.016], [R, 0.022], [R * 0.99, 0.026], [R * 0.88, 0.021], [R * 0.64, 0.011], [0, 0.011]].map(([x, y]) => new THREE.Vector2(x, y));
  const plateM = flat('#F4F1EA', { roughness: 0.45 });
  const plate = shadow(new THREE.Mesh(new THREE.LatheGeometry(pts, 28), plateM)); g.add(plate);
  const band = new THREE.Mesh(new THREE.TorusGeometry(R * 0.93, 0.0022, 4, 40), flat(PAL.lime)); band.rotation.x = Math.PI / 2; band.position.y = 0.019; g.add(band);
  const out = { group: g, plate, band, R, food: [], foodGroup: null };
  if (food) {
    const fg = new THREE.Group(); g.add(fg); out.foodGroup = fg;
    const rice = flat('#EFE6CF'), curry = flat('#D9822B'), pea = flat('#7FA650'), carrot = flat('#E07A35');
    let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const mound = shadow(new THREE.Mesh(facet(new THREE.SphereGeometry(R * 0.5, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0.004, 5), rice)); mound.scale.set(1, 0.5, 1); mound.position.y = 0.011; fg.add(mound); out.food.push(mound);
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2, r = R * (0.12 + 0.42 * rnd()), m = [curry, curry, pea, carrot][i % 4];
      const lump = shadow(new THREE.Mesh(new THREE.IcosahedronGeometry(R * (0.06 + 0.04 * rnd()), 0), m));
      lump.position.set(Math.cos(a) * r, 0.011 + R * 0.25 * Math.sqrt(Math.max(0, 1 - (r / (R * 0.5)) ** 2)) + 0.004, Math.sin(a) * r); lump.rotation.set(rnd() * 3, rnd() * 3, 0);
      fg.add(lump); out.food.push(lump);
    }
  }
  return out;
}

/** Glass measuring cup with water (local origin at the base centre). */
export function buildCup(scene) {
  const g = new THREE.Group(); scene.add(g);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.042, 0.11, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#DDEFF2', transparent: true, opacity: 0.35, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }));
  glass.position.y = 0.055; g.add(glass);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.006, 16), new THREE.MeshStandardMaterial({ color: '#DDEFF2', transparent: true, opacity: 0.5, roughness: 0.05 })); base.position.y = 0.003; g.add(base);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.041, 0.075, 16), new THREE.MeshStandardMaterial({ color: '#7FB7D6', transparent: true, opacity: 0.7, roughness: 0.1 })); water.position.y = 0.043; g.add(water);
  const handle = shadow(new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.006, 4, 10, Math.PI), new THREE.MeshStandardMaterial({ color: '#DDEFF2', transparent: true, opacity: 0.5 }))); handle.rotation.z = -Math.PI / 2; handle.position.set(0.05, 0.06, 0); g.add(handle);
  for (let i = 0; i < 3; i++) { const tick = box(0.012, 0.002, 0.001, flat('#C94F3A')); tick.position.set(-0.012, 0.03 + i * 0.025, 0.047); g.add(tick); }
  return { group: g, water, glass };
}

// ---------------------------------------------------------------- giant set
/** Station positions (relative to the giant origin). F: food on a plate cross-section. M: a cut-away porous mug. */
export const GS = { F: [-1.4, 0, 0], M: [2.0, 0, 0] };

function plateProfile(w, h, rimH) {   // plate cross-section in the XY plane (centre x=0, bottom y=0)
  const s = new THREE.Shape();
  s.moveTo(-w * 0.35, 0); s.lineTo(w * 0.35, 0); s.lineTo(w * 0.38, 0.05); s.lineTo(w * 0.47, rimH * 0.7); s.lineTo(w * 0.5, rimH);
  s.lineTo(w * 0.47, rimH + 0.03); s.lineTo(w * 0.42, rimH * 0.8 + 0.02); s.lineTo(w * 0.36, h); s.lineTo(-w * 0.36, h);
  s.lineTo(-w * 0.42, rimH * 0.8 + 0.02); s.lineTo(-w * 0.47, rimH + 0.03); s.lineTo(-w * 0.5, rimH); s.lineTo(-w * 0.47, rimH * 0.7); s.lineTo(-w * 0.38, 0.05); s.closePath();
  return s;
}
function moundProfile(w, h) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0);
  for (let i = 1; i <= 12; i++) { const a = Math.PI * (1 - i / 12); s.lineTo((w / 2) * Math.cos(a), h * Math.sin(a) * (1 + 0.06 * Math.sin(i * 2.3))); }
  s.closePath(); return s;
}

export function buildGiantHeat(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), flat('#4A3626')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  const plinth = shadow(box(8.0, 0.5, 3.2, flat('#B98557'))); plinth.position.set(0.2, 0.25, 0); g.add(plinth);
  const band = box(8.02, 0.08, 3.22, flat('#D9C3A0')); band.position.set(0.2, 0.38, 0); g.add(band);
  // ---- station F: plate cross-section (extruded profile, cut face toward +z) with a food mound
  const F = new THREE.Group(); F.position.set(...GS.F); g.add(F);
  const PW = 4.0, PH = 0.2, RH = 0.42, DEP = 1.4, PY = 0.52;
  const plateM = new THREE.MeshStandardMaterial({ color: '#EDEAE2', flatShading: true, roughness: 0.5, emissive: '#000000' });
  const plate = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(plateProfile(PW, PH, RH), { depth: DEP, bevelEnabled: false }), plateM));
  plate.position.set(0, PY, -DEP / 2); F.add(plate);
  const rimBand = box(0.05, 0.05, DEP + 0.02, flat(PAL.lime)); rimBand.position.set(PW * 0.49, PY + RH + 0.01, 0); F.add(rimBand);
  const rimBand2 = rimBand.clone(); rimBand2.position.x = -PW * 0.49; F.add(rimBand2);
  // heat that has soaked into the plate under the food (a glow on the cut face, grown by the choreography)
  const plateHeat = new THREE.Group();   // soft-edged glow: four stacked translucent bands (wider = fainter edge)
  for (const w of [1.0, 0.8, 0.62, 0.45]) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(w, PH * 0.96), new THREE.MeshBasicMaterial({ color: '#F27A22', transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
    b.renderOrder = 5; plateHeat.add(b);
  }
  plateHeat.position.set(0, PY + PH * 0.5, DEP / 2 + 0.03); F.add(plateHeat);
  // the plate's own atoms: a fixed lattice on the cut face (they do not move)
  const lat = []; for (let i = -16; i <= 16; i++) for (let j = 0; j < 2; j++) { const x = i * 0.105, y = 0.05 + j * 0.09; if (Math.abs(x) < PW * 0.34) lat.push([x, y]); }
  const lattice = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.022, 0), new THREE.MeshStandardMaterial({ color: '#AFC3CC', flatShading: true, roughness: 0.5 }), lat.length);
  const m4 = new THREE.Matrix4(); lat.forEach(([x, y], k) => { m4.makeTranslation(x, PY + y, DEP / 2 + 0.02); lattice.setMatrixAt(k, m4); }); F.add(lattice);
  // food mound (cut face toward +z)
  const FW = 2.2, FH = 1.05;
  const foodM = new THREE.MeshStandardMaterial({ color: '#E9D9B4', flatShading: true, roughness: 0.8, emissive: '#FF6A1A', emissiveIntensity: 0 });
  const food = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(moundProfile(FW, FH), { depth: DEP * 0.86, bevelEnabled: false }), foodM));
  food.position.set(0, PY + PH, -DEP * 0.43); F.add(food);
  const toppings = []; let sd = 11; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (let i = 0; i < 9; i++) {
    const a = 0.25 + 2.64 * rnd(), m = shadow(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1 + 0.06 * rnd(), 0), flat(['#D9822B', '#7FA650', '#E07A35'][i % 3])));
    m.position.set((FW / 2) * Math.cos(a) * 0.95, PY + PH + FH * Math.sin(a) * 0.95, -DEP * 0.3 + 0.75 * rnd()); F.add(m); toppings.push(m);
  }
  // water molecules on the food's cut face: O (red) + two H (white), instanced; posed per frame
  const mols = []; sd = 23; for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {   // jittered grid inside the mound's cut face
    const x = -0.86 + c * 0.245 + (rnd() - 0.5) * 0.1, yy = 0.14 + r * 0.22 + (rnd() - 0.5) * 0.08;
    const top = FH * Math.sqrt(Math.max(0, 1 - (x / (FW / 2)) ** 2)) - 0.13;
    if (yy < top) mols.push({ x, y: PY + PH + yy, a0: rnd() * 6.28, ph: rnd() * 6.28 });
  }
  const molO = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.055, 1), new THREE.MeshStandardMaterial({ color: '#E5533D', flatShading: true, roughness: 0.4, emissive: '#000000' }), mols.length);
  const molH = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.034, 0), new THREE.MeshStandardMaterial({ color: '#F8FAF3', flatShading: true, roughness: 0.4 }), mols.length * 2);
  for (const m of [molO, molH]) { m.renderOrder = 6; m.frustumCulled = false; F.add(m); }
  const faceZ = -DEP * 0.43 + DEP * 0.86 + 0.03;
  // ---- station M: cut-away porous mug (back half + cut faces), iron-rich glaze, crazing, pores, water
  const M = new THREE.Group(); M.position.set(...GS.M); g.add(M);
  const prof = [[0, 0.1], [0.66, 0.1], [0.72, 0.0], [0.86, 0.0], [0.95, 0.1], [0.98, 1.7], [0.8, 1.7], [0.76, 0.32], [0, 0.32]];
  const clayM = new THREE.MeshStandardMaterial({ color: '#C46E45', flatShading: true, roughness: 0.95, emissive: '#FF5A1A', emissiveIntensity: 0, side: THREE.DoubleSide });
  const mugBack = shadow(new THREE.Mesh(new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 22, Math.PI / 2, Math.PI), clayM));
  const MY = 0.42; mugBack.position.y = MY; M.add(mugBack);
  const shp = new THREE.Shape(prof.map(([x, y]) => new THREE.Vector2(x, y)));
  const cutR = new THREE.Mesh(new THREE.ShapeGeometry(shp), clayM); cutR.position.set(0, MY, 0.001); M.add(cutR);
  const cutL = new THREE.Mesh(new THREE.ShapeGeometry(shp), clayM); cutL.scale.x = -1; cutL.position.set(0, MY, 0.001); M.add(cutL);
  // iron-rich glaze: thin dark shells inside and outside the wall (the unglazed foot ring stays bare)
  const glazeM = new THREE.MeshStandardMaterial({ color: '#4A2416', roughness: 0.25, metalness: 0.05, flatShading: true, emissive: '#FF4A10', emissiveIntensity: 0, side: THREE.DoubleSide });
  const gOut = new THREE.Mesh(new THREE.LatheGeometry([[1.0, 0.16], [1.003, 1.7], [0.97, 1.74]].map(([x, y]) => new THREE.Vector2(x, y)), 22, Math.PI / 2, Math.PI), glazeM); gOut.position.y = MY; M.add(gOut);
  const gIn = new THREE.Mesh(new THREE.LatheGeometry([[0.0, 0.34], [0.775, 0.34], [0.785, 1.74]].map(([x, y]) => new THREE.Vector2(x, y)), 22, Math.PI / 2, Math.PI), glazeM); gIn.position.y = MY; M.add(gIn);
  for (const sx of [-1, 1]) for (const [x0, y0, x1, y1] of [[0.98, 0.16, 1.02, 0.16], [0.74, 0.32, 0.79, 0.32]]) { /* glaze edges on the cut face */
    const e = box(0.03, 1.56, 0.012, glazeM); e.position.set(sx * (x0 + 0.015), MY + 0.94, 0.006); if (x0 < 0.9) { e.position.set(sx * 0.775, MY + 1.03, 0.006); e.scale.y = 0.9; } M.add(e);
  }
  // crazing on the inner glaze (light crack lines on the back wall, visible through the opening)
  const craze = new THREE.Group(); M.add(craze);
  const crM = new THREE.MeshBasicMaterial({ color: '#E8D6B8', toneMapped: false });
  sd = 5; for (let i = 0; i < 14; i++) {
    const a = Math.PI * (0.62 + 0.76 * rnd()), y = MY + 0.5 + 1.1 * rnd(), len = 0.18 + 0.2 * rnd(), r = 0.765;
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.008, len, 0.008), crM); c.position.set(r * Math.sin(a), y, r * Math.cos(a)); c.rotation.set(0, a, (rnd() - 0.5) * 1.6); craze.add(c);
  }
  // pores on the cut faces (dark specks) and the water that soaks into them
  const pores = []; sd = 9; for (let i = 0; i < 46; i++) { const side = i % 2 ? 1 : -1, y = 0.4 + 1.25 * rnd(), x = 0.79 + 0.17 * rnd(); pores.push([side * x, MY + y]); }
  for (let i = 0; i < 10; i++) { const y = 0.12 + 0.17 * rnd(), x = 0.1 + 0.6 * rnd(); pores.push([(i % 2 ? 1 : -1) * x, MY + y]); }
  const poreMesh = new THREE.InstancedMesh(new THREE.CircleGeometry(0.018, 5), new THREE.MeshBasicMaterial({ color: '#5E2E1A' }), pores.length);
  pores.forEach(([x, y], k) => { m4.makeTranslation(x, y, 0.004); poreMesh.setMatrixAt(k, m4); }); M.add(poreMesh);
  const waterDots = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.03, 0), new THREE.MeshBasicMaterial({ color: '#5FA8D8', toneMapped: false }), pores.length);
  waterDots.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(pores.length * 3).fill(1), 3);
  waterDots.renderOrder = 6; waterDots.frustumCulled = false; M.add(waterDots);
  // a puddle in the mug and a wet patch under the foot ring (where water gets in)
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.74, 20, Math.PI, Math.PI), new THREE.MeshStandardMaterial({ color: '#6FAFD6', transparent: true, opacity: 0.75, roughness: 0.1 }));
  puddle.rotation.x = -Math.PI / 2; puddle.position.set(0, MY + 0.36, 0); M.add(puddle);
  return { group: g, F, M, plate, plateM, plateHeat, lattice, food, foodM, toppings, mols, molO, molH, faceZ, PY, PH, FW, FH, DEP,
    clayM, glazeM, craze, pores, waterDots, puddle, MY };
}
