// Kilogram balance + episode props in clay: equal-arm balance with lime pans, kg dial, lock pin and swap button;
// 1 kg steel cube, 1 kg feather sack, two same-size boxes (steel / feathers), drifting feather particles.
import * as THREE from 'three';
import { PAL, clayMat, steelMat } from './clay.js';
import { rbox } from './set.js';
import { BAL, CUBE, SACK, BOX, BOX_IN, panPositions } from './physics.js';
import { rng } from './anim.js';

function plateTexture(text, { w = 256, h = 128, bg = PAL.ink, fg = PAL.lime, font = '"Titan One"', size = 0.6 } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.font = `400 ${Math.round(h * size)}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = fg; g.fillText(text, w / 2, h / 2 + 3);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function featherGeometry() {
  // a single curved feather: vane outline + slight bend, built as a thin shape
  const s = new THREE.Shape();
  s.moveTo(0, -0.03);
  s.bezierCurveTo(0.012, -0.015, 0.014, 0.018, 0.0, 0.034);
  s.bezierCurveTo(-0.014, 0.018, -0.012, -0.015, 0, -0.03);
  const g = new THREE.ShapeGeometry(s, 6);
  const p = g.attributes.position.array;
  for (let i = 0; i < p.length; i += 3) p[i + 2] = 0.01 * Math.sin((p[i + 1] + 0.03) * 40);
  g.computeVertexNormals();
  return g;
}

export function buildBalance(scene) {
  const lime = clayMat(PAL.lime, { bump: 0.9, repeat: 2, rough: 0.6 });
  const ink = clayMat(PAL.ink, { bump: 0.8, repeat: 2, rough: 0.55 });
  const paper = clayMat(PAL.paper, { bump: 1.2, repeat: 2, rough: 0.8 });
  const B = { group: new THREE.Group() }; scene.add(B.group);
  const [px, py, pz] = BAL.pivot;

  // step for Kip (behind) + balance base with kg plate and swap button
  const step = new THREE.Mesh(rbox(0.7, 0.12, 0.42, 0.03), clayMat(PAL.inkClay, { bump: 1.2 }));
  step.position.set(0, 0.06, -0.46); step.receiveShadow = true; scene.add(step);
  const base = new THREE.Mesh(rbox(0.56, 0.07, 0.3, 0.025), ink); base.position.set(0, 0.035, 0); base.castShadow = base.receiveShadow = true;
  const kgPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.05), new THREE.MeshBasicMaterial({ map: plateTexture('kg'), toneMapped: false }));
  kgPlate.position.set(0, 0.035, 0.151);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, py - 0.07, 24), lime); post.position.set(px, 0.07 + (py - 0.07) / 2, pz); post.castShadow = true;
  const head = new THREE.Mesh(rbox(0.09, 0.07, 0.07, 0.02), ink); head.position.set(px, py, pz); head.castShadow = true;
  // kg dial on the post (paper arc + ticks); the needle hangs from the pivot
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.075, 40, Math.PI * 1.2, Math.PI * 0.6), paper);
  dial.position.set(px, py - 0.02, pz + 0.042);
  const ticks = new THREE.Group();
  for (let k = -3; k <= 3; k++) {
    const tk = new THREE.Mesh(new THREE.BoxGeometry(0.003, k === 0 ? 0.022 : 0.012, 0.002), ink);
    const a = k * 0.09; tk.position.set(px + Math.sin(a) * 0.066, py - 0.02 - Math.cos(a) * 0.066, pz + 0.044); tk.rotation.z = a; ticks.add(tk);
  }
  B.button = new THREE.Mesh(new THREE.SphereGeometry(0.032, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), lime);
  B.button.position.set(-0.17, 0.07, -0.04); B.button.scale.set(1, 0.7, 1);
  for (const m of [base, kgPlate, post, head, dial, ticks, B.button]) B.group.add(m);

  // beam (rotates about the pivot)
  B.beam = new THREE.Group(); B.beam.position.set(px, py, pz + 0.05); B.group.add(B.beam);
  const bar = new THREE.Mesh(rbox(BAL.arm * 2 + 0.06, 0.03, 0.035, 0.012), ink); bar.castShadow = true;
  const caps = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 12), lime); m.position.x = s * (BAL.arm + 0.02); return m; });
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.07, 0.004), clayMat('#D24C3C', { bump: 0.2 }));
  needle.position.set(0, -0.045, -0.006);
  B.beam.add(bar, ...caps, needle);
  // lock pin through the pivot head (lime, ring end on +x)
  B.pin = new THREE.Group();
  const pinRod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 10), lime); pinRod.rotation.z = Math.PI / 2;
  const pinRing = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 10, 24), lime); pinRing.position.x = 0.085; pinRing.rotation.y = Math.PI / 2;
  B.pin.add(pinRod, pinRing); B.pin.position.set(px + 0.03, py, pz + 0.05); scene.add(B.pin);

  // pans with three hanger rods each
  B.pans = [-1, 1].map(() => {
    const g = new THREE.Group();
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(BAL.panR, BAL.panR * 0.72, 0.03, 40), lime); dish.position.y = -0.015; dish.castShadow = dish.receiveShadow = true;
    const rods = [0, 1, 2].map(k => {
      const a = k * Math.PI * 2 / 3 + 0.5, r = BAL.panR * 0.92;
      const top = new THREE.Vector3(0, BAL.hang, 0), bot = new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
      const len = top.distanceTo(bot);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, len, 6), ink);
      m.position.copy(top.clone().add(bot).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), top.clone().sub(bot).normalize());
      return m;
    });
    g.add(dish, ...rods); scene.add(g);
    return g;
  });

  // --- round 1: 1 kg steel cube + 1 kg feather sack
  B.cube = new THREE.Mesh(rbox(CUBE, CUBE, CUBE, 0.004, 3), steelMat()); B.cube.castShadow = true; scene.add(B.cube);
  B.sack = new THREE.Group();
  const sackGeo = new THREE.SphereGeometry(0.5, 48, 32);
  const sp = sackGeo.attributes.position.array, R = rng(42);
  const bumps = Array.from({ length: 9 }, () => [R() * 6.28, R() * 3.14, 0.04 + R() * 0.05]);
  for (let i = 0; i < sp.length; i += 3) {
    let x = sp[i], y = sp[i + 1], z = sp[i + 2];
    const flat = y < -0.32 ? (-0.32 - y) : 0;            // flat bottom
    y += flat;
    const th = Math.atan2(z, x), ph = Math.acos(Math.max(-1, Math.min(1, y / 0.5)));
    let k = 1; for (const [a, b, amp] of bumps) k += amp * Math.exp(-((th - a) ** 2 + (ph - b) ** 2) * 3);
    if (y > 0.3) { const pinch = (y - 0.3) / 0.2; x *= 1 - 0.75 * pinch; z *= 1 - 0.75 * pinch; }
    sp[i] = x * k * SACK.w; sp[i + 1] = (y + 0.32) * SACK.h / 0.82; sp[i + 2] = z * k * SACK.d;
  }
  sackGeo.computeVertexNormals();
  const sackMesh = new THREE.Mesh(sackGeo, clayMat('#F4F2E8', { bump: 1.8, repeat: 3, rough: 0.92 })); sackMesh.castShadow = true;
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 10, 24), lime); tie.rotation.x = Math.PI / 2; tie.position.y = SACK.h * 0.93;
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.055), new THREE.MeshBasicMaterial({ map: plateTexture('1 kg', { bg: PAL.lime, fg: PAL.ink }), toneMapped: false, side: THREE.DoubleSide }));
  tag.position.set(0.0, SACK.h * 0.55, SACK.d * 0.52); tag.rotation.x = -0.15;
  const fg = featherGeometry(), fm = new THREE.MeshStandardMaterial({ color: '#FBFBF5', roughness: 0.9, side: THREE.DoubleSide });
  for (let k = 0; k < 7; k++) {
    const f = new THREE.Mesh(fg, fm); const a = k * 0.9;
    f.position.set(Math.cos(a) * 0.03, SACK.h * 0.98 + 0.02, Math.sin(a) * 0.03); f.rotation.set(0.3 * Math.sin(a), a, 0.5 * Math.cos(a)); f.scale.setScalar(1.3);
    B.sack.add(f);
  }
  B.sack.add(sackMesh, tie, tag); scene.add(B.sack);
  const cubeTag = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.03), new THREE.MeshBasicMaterial({ map: plateTexture('1 kg', { bg: PAL.lime, fg: PAL.ink }), toneMapped: false }));
  cubeTag.position.set(0, 0, CUBE / 2 + 0.001); B.cube.add(cubeTag);

  // --- round 2: two boxes of the same size
  const glass = new THREE.MeshPhysicalMaterial({ color: '#F4FFFB', transparent: true, opacity: 0.16, roughness: 0.05, envMapIntensity: 1.5, depthWrite: false });
  const makeBox = (fillMesh) => {
    const g = new THREE.Group();
    const shell = new THREE.Mesh(new THREE.BoxGeometry(BOX, BOX, BOX), glass); shell.position.y = BOX / 2; shell.renderOrder = 5;
    const edges = new THREE.Group();
    for (const [sx, sy, sz, w, h, d] of [[1, 0, 1, 0.012, BOX, 0.012], [-1, 0, 1, 0.012, BOX, 0.012], [1, 0, -1, 0.012, BOX, 0.012], [-1, 0, -1, 0.012, BOX, 0.012],
      [0, 1, 1, BOX, 0.012, 0.012], [0, -1, 1, BOX, 0.012, 0.012], [0, 1, -1, BOX, 0.012, 0.012], [0, -1, -1, BOX, 0.012, 0.012],
      [1, 1, 0, 0.012, 0.012, BOX], [-1, 1, 0, 0.012, 0.012, BOX], [1, -1, 0, 0.012, 0.012, BOX], [-1, -1, 0, 0.012, 0.012, BOX]]) {
      const e = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lime); e.position.set(sx * BOX / 2, BOX / 2 + sy * BOX / 2, sz * BOX / 2); edges.add(e);
    }
    fillMesh.position.y += BOX / 2;
    g.add(fillMesh, shell, edges); scene.add(g);
    return g;
  };
  const steelFill = new THREE.Mesh(rbox(BOX_IN, BOX_IN, BOX_IN, 0.006, 3), steelMat()); steelFill.castShadow = true;
  const featherFill = new THREE.Group();
  const ffBody = new THREE.Mesh(new THREE.SphereGeometry(BOX_IN * 0.52, 28, 20), clayMat('#F4F2E8', { bump: 2.0, repeat: 3, rough: 0.95 }));
  ffBody.scale.set(1.02, 0.96, 1.02);
  featherFill.add(ffBody);
  for (let k = 0; k < 10; k++) {
    const f = new THREE.Mesh(fg, fm); const a = k * 0.63;
    f.position.set(Math.cos(a) * 0.06, 0.05 + (k % 3) * 0.02, Math.sin(a) * 0.06); f.rotation.set(a, a * 0.7, 0.4); f.scale.setScalar(1.1);
    featherFill.add(f);
  }
  B.boxSteel = makeBox(steelFill); B.boxFeather = makeBox(featherFill);

  // --- drifting feathers
  const R2 = rng(9);
  B.fly = Array.from({ length: 16 }, () => {
    const m = new THREE.Mesh(fg, fm); m.visible = false; m.scale.setScalar(1.2); scene.add(m);
    return { m, vx: (R2() - 0.5) * 0.5, vy: 0.35 + R2() * 0.35, vz: (R2() - 0.2) * 0.25, ph: R2() * 6, sp: 2 + R2() * 3 };
  });
  B.panPositions = panPositions;
  return B;
}

/** Feather puff: tau seconds after the event at origin; feathers pop up and drift down slowly with sway. */
export function updateFeathers(B, events, t) {
  let idx = 0;
  for (const ev of events) {
    const tau = t - ev.t;
    for (let k = 0; k < ev.n; k++) {
      const f = B.fly[idx++ % B.fly.length];
      if (tau < 0 || tau > 2.6) { if (!f._used) f.m.visible = false; continue; }
      const up = Math.min(tau, 0.35), fall = Math.max(0, tau - 0.35);
      const x = ev.p[0] + f.vx * up + 0.04 * Math.sin(f.ph + tau * f.sp), y = ev.p[1] + f.vy * up - 0.22 * fall;
      const z = ev.p[2] + f.vz * up + 0.03;
      f.m.position.set(x, Math.max(ev.floor, y), z);
      f.m.rotation.set(0.6 * Math.sin(tau * f.sp + f.ph), tau * 1.5 + f.ph, 0.8 * Math.cos(tau * f.sp));
      f.m.visible = y > ev.floor + 0.002; f._used = true;
    }
  }
  for (const f of B.fly) f._used = false;
}
