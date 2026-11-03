// "Low-poly Everyday Discovery" world: flat-shaded café corner and the same original everyday person (FK acting rig)
// as feedback round 01 (buildCafe / buildPerson are unchanged), plus round-02 props: a counter microwave with a live
// display, a bowl of leftovers, a spoon, steam, and a giant cutaway microwave cavity for the mechanism shots.
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

// ================================================================ round 02 props
import { CAV, BOWL, rOut, rIn, foodTop } from './heat.js';

/** Lathe bowl (rim radius s) from the shared profile in heat.js. */
export function bowlGeometry(s, seg = 14) {
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(BOWL.rb * s, 0)];
  for (let i = 1; i <= 8; i++) { const y = BOWL.h * i / 8; pts.push(new THREE.Vector2(rOut(y) * s, y * s)); }
  pts.push(new THREE.Vector2((1 - BOWL.wall * 0.5) * s, (BOWL.h + 0.02) * s));
  for (let i = 8; i >= 1; i--) { const y = BOWL.base + (BOWL.h - BOWL.base) * i / 8; pts.push(new THREE.Vector2(rIn(y) * s, y * s)); }
  pts.push(new THREE.Vector2(0, BOWL.base * s));
  const g = new THREE.LatheGeometry(pts, seg); g.computeVertexNormals(); return g;
}

/** Polar grid (centre + NR rings x NS segments) with position + colour attributes, updated in place. */
export function polarGeometry(NR, NS) {
  const n = 1 + NR * NS, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), idx = [];
  for (let j = 0; j < NS; j++) idx.push(0, 1 + (j + 1) % NS, 1 + j);
  for (let i = 0; i < NR - 1; i++) for (let j = 0; j < NS; j++) {
    const a = 1 + i * NS + j, b = 1 + i * NS + (j + 1) % NS, c = a + NS, d = b + NS;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx);
  g.userData = { NR, NS }; return g;
}
/** rFn(i) ring radius, hFn(r, a) height, colFn(i, j) -> [r,g,b] (i = -1 for the centre). */
export function setPolar(g, rFn, hFn, colFn) {
  const { NR, NS } = g.userData, p = g.attributes.position.array, c = g.attributes.color.array;
  const put = (k, x, y, z, rgb) => { p[k * 3] = x; p[k * 3 + 1] = y; p[k * 3 + 2] = z; c[k * 3] = rgb[0]; c[k * 3 + 1] = rgb[1]; c[k * 3 + 2] = rgb[2]; };
  put(0, 0, hFn(0, 0), 0, colFn(-1, 0));
  for (let i = 0; i < NR; i++) { const r = rFn(i); for (let j = 0; j < NS; j++) { const a = 2 * Math.PI * j / NS; put(1 + i * NS + j, r * Math.cos(a), hFn(r, a), r * Math.sin(a), colFn(i, j)); } }
  g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true; g.computeVertexNormals();
}

// ---------------------------------------------------------------- counter microwave (door on local +z, hinge on -x)
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
  // door
  const door = new THREE.Group(); door.position.set(-W / 2, 0, D / 2); g.add(door);
  const dp = shadow(box(W - PW, H, 0.024, shell)); dp.position.set((W - PW) / 2, H / 2, 0.012); door.add(dp);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(W - PW - 0.09, H - 0.09), new THREE.MeshStandardMaterial({ color: '#2A2926', roughness: 0.2, transparent: true, opacity: 0.78 }));
  win.position.set((W - PW) / 2 - 0.01, H / 2, 0.0245); door.add(win);
  // control panel + live display
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
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- real bowl of leftovers + spoon + steam
export function buildBowl(scene, s = 0.075) {
  const g = new THREE.Group(); scene.add(g);
  const bowl = shadow(new THREE.Mesh(facet(bowlGeometry(s), 0.0008, 3), flat('#F2EEE3'))); g.add(bowl);
  const band = new THREE.Mesh(new THREE.TorusGeometry(rOut(BOWL.h * 0.82) * s + 0.0008, 0.0022, 4, 24), flat(PAL.lime)); band.rotation.x = Math.PI / 2; band.position.y = BOWL.h * 0.82 * s; g.add(band);
  const fg = polarGeometry(10, 28), food = shadow(new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.7 })), false, true); g.add(food);
  const lumps = [], LC = ['#D9822B', '#E8D6A8', '#B5552F', '#E8D6A8', '#C97A3A'];
  for (let i = 0; i < 14; i++) {
    const m = shadow(new THREE.Mesh(new THREE.IcosahedronGeometry(s * (0.06 + 0.03 * ((i * 7) % 3)), 0), flat(LC[i % LC.length])));
    lumps.push({ m, r: 0.12 + 0.7 * ((i * 0.618) % 1), a: i * 2.4 }); g.add(m);
  }
  return { group: g, food, fg, lumps, s };
}

export function buildSpoon(scene) {
  const g = new THREE.Group(), steel = flat('#C8CAC4', { roughness: 0.35 });
  const head = shadow(new THREE.Mesh(new THREE.SphereGeometry(1, 8, 4), steel)); head.scale.set(0.012, 0.004, 0.017); g.add(head);
  const handle = shadow(box(0.007, 0.003, 0.13, steel)); handle.position.z = 0.08; g.add(handle);
  scene.add(g); return g;
}

export function buildSteam(scene, n = 80) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: '#FFFFFF', transparent: true, opacity: 0.4, depthWrite: false }), n);
  m.frustumCulled = false; scene.add(m); return m;
}

// ---------------------------------------------------------------- giant cutaway microwave cavity (mechanism set)
export function buildGiantOven(scene, origin, clip) {
  const { W, H, D } = CAV, g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const steel = flat('#B9BCB8', { roughness: 0.6 }), seamM = flat('#8F938F'), cream = flat('#E8E2D6');
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), flat('#5A4130')); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.3; ground.receiveShadow = true; g.add(ground);
  const plane = (w, h, x, y, z, rx, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), steel); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); m.receiveShadow = true; g.add(m); return m; };
  plane(W, D, 0, 0, 0, -Math.PI / 2, 0); plane(W, D, 0, H, 0, Math.PI / 2, 0); plane(W, H, 0, H / 2, -D / 2, 0, 0);
  plane(D, H, -W / 2, H / 2, 0, 0, Math.PI / 2); plane(D, H, W / 2, H / 2, 0, 0, -Math.PI / 2);
  for (let i = 1; i < 4; i++) { const s1 = box(0.012, H, 0.01, seamM); s1.position.set(-W / 2 + i * W / 4, H / 2, -D / 2 + 0.006); g.add(s1); }
  for (let i = 1; i < 3; i++) { const s2 = box(0.01, H, 0.012, seamM); s2.position.set(-W / 2 + 0.006, H / 2, -D / 2 + i * D / 3); g.add(s2); const s3 = s2.clone(); s3.position.x = W / 2 - 0.006; g.add(s3); }
  // outer shell (cream) around the open front, plus the control-panel side
  const slab = (w, h, d, x, y, z) => { const m = box(w, h, d, cream); m.position.set(x, y, z); m.receiveShadow = true; g.add(m); return m; };
  slab(W + 1.4, 0.25, D + 0.2, 0.45, H + 0.125, 0); slab(W + 1.4, 0.3, D + 0.2, 0.45, -0.15, 0);
  slab(0.25, H + 0.55, D + 0.2, -W / 2 - 0.125, H / 2, 0); slab(0.9, H + 0.55, D + 0.2, W / 2 + 0.45, H / 2, 0);
  slab(W + 1.4, H + 0.55, 0.25, 0.45, H / 2, -D / 2 - 0.125);
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.7), flat('#2E2C28')); panel.position.set(W / 2 + 0.45, H / 2, D / 2 + 0.101); g.add(panel);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const b = box(0.13, 0.1, 0.03, flat('#5A5650')); b.position.set(W / 2 + 0.45 + (c - 1) * 0.17, H / 2 - 0.1 - r * 0.17, D / 2 + 0.11); g.add(b); }
  // giant door, swung wide open on the left hinge
  const door = new THREE.Group(); door.position.set(-W / 2 - 0.25, -0.3, D / 2 + 0.1); door.rotation.y = -1.95; g.add(door);
  const dp = box(W + 0.25, H + 0.55, 0.12, cream); dp.position.set((W + 0.25) / 2, (H + 0.55) / 2, 0.06); door.add(dp);
  const dw = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, H - 0.3), flat('#2A2926', { roughness: 0.2 })); dw.position.set((W + 0.25) / 2, (H + 0.55) / 2, 0.121); door.add(dw);
  // wave inlet on the right wall
  const port = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.36), flat('#3B3A36')); port.position.set(W / 2 - 0.004, 1.55, -0.35); port.rotation.y = -Math.PI / 2; g.add(port);
  const portGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.44), new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  portGlow.position.set(W / 2 - 0.008, 1.55, -0.35); portGlow.rotation.y = -Math.PI / 2; g.add(portGlow);
  // turntable + giant bowl (clipped in the cutaway shots) + section cap
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 12), flat('#6E6B64')); hub.position.y = 0.04; g.add(hub);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 0.04, 36), new THREE.MeshStandardMaterial({ color: '#DCEBEA', transparent: true, opacity: 0.5, roughness: 0.1 })); glass.position.y = 0.1; g.add(glass);
  const R = 0.85, turn = new THREE.Group(); turn.position.y = 0.12; g.add(turn);
  const bowlM = flat('#F2EEE3', { clippingPlanes: [clip], clipShadows: true, side: THREE.DoubleSide });
  const bowl = shadow(new THREE.Mesh(bowlGeometry(R, 22), bowlM)); turn.add(bowl);
  const band = new THREE.Mesh(new THREE.TorusGeometry(rOut(BOWL.h * 0.82) * R + 0.008, 0.022, 4, 40), flat(PAL.lime, { clippingPlanes: [clip] })); band.rotation.x = Math.PI / 2; band.position.y = BOWL.h * 0.82 * R; turn.add(band);
  const fg = polarGeometry(22, 72);
  const food = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.75, clippingPlanes: [clip], side: THREE.DoubleSide })); food.receiveShadow = true; turn.add(food);
  const cc = document.createElement('canvas'); cc.width = 420; cc.height = 200;
  const ctex = new THREE.CanvasTexture(cc); ctex.colorSpace = THREE.SRGBColorSpace;
  const cap = new THREE.Mesh(new THREE.PlaneGeometry(2.1 * R, 1.0 * R), new THREE.MeshBasicMaterial({ map: ctex, transparent: true, alphaTest: 0.5, toneMapped: false, side: THREE.DoubleSide }));
  cap.position.set(0, 0.12 + 0.46 * R, 0.002); g.add(cap);
  // standing-wave pattern (strong spots) and travelling wave trails
  const blobs = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 8), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.6, depthWrite: false, toneMapped: false }), 32);
  blobs.frustumCulled = false; g.add(blobs);
  const trails = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0.95, depthWrite: false, toneMapped: false }), 8 * 40);
  trails.frustumCulled = false; g.add(trails);
  // heat-spread arrows on the cut face
  const arrows = [];
  for (let i = 0; i < 6; i++) { const a = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.1, 5), new THREE.MeshBasicMaterial({ color: '#F4A04A', transparent: true, opacity: 0, depthWrite: false })); g.add(a); arrows.push(a); }
  return { group: g, turn, bowl, food, fg, cap, capCanvas: cc, capCtx: cc.getContext('2d'), capTex: ctex, blobs, trails, portGlow, arrows, R, glass };
}
