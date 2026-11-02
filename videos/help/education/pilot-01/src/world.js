// Miniature neighbourhood diorama + lesson props. Procedural, original.
import * as THREE from 'three';
import { mat } from './rig/figure.js';

export const PAL = {
  cream: '#F7F5EF', ink: '#0B0D12', green: '#2DB37D', yellow: '#F2C230',
  // derived neutrals/tints from the icon palette (documented in LICENSES/character sheet)
  sand: '#EADFC8', sandDark: '#D9CBAE', greenDark: '#1F8A5E', greenLight: '#8FD3B0',
  yellowDeep: '#D9A81F', kraft: '#D3AE7E', stone: '#C9BFAa', coral: '#E0644F', inkSoft: '#1A1E27',
};

function m(geo, material, cast = true, recv = true) {
  const x = new THREE.Mesh(geo, material);
  x.castShadow = cast; x.receiveShadow = recv;
  return x;
}

function roundedBox(w, h, d, r, seg = 4) {
  // simple rounded box via ExtrudeGeometry with bevel
  const shape = new THREE.Shape();
  const x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  shape.moveTo(x - r, y);
  shape.absarc(x, y, r, Math.PI, Math.PI * 1.5);
  shape.lineTo(x + ww, y - r);
  shape.absarc(x + ww, y, r, Math.PI * 1.5, Math.PI * 2);
  shape.lineTo(x + ww + r, y + hh);
  shape.absarc(x + ww, y + hh, r, 0, Math.PI / 2);
  shape.lineTo(x, y + hh + r);
  shape.absarc(x, y + hh, r, Math.PI / 2, Math.PI);
  const g = new THREE.ExtrudeGeometry(shape, { depth: d - 2 * r * 0.5, bevelEnabled: true, bevelThickness: r * 0.5, bevelSize: r * 0.5, bevelSegments: seg, curveSegments: 10 });
  g.translate(0, 0, -(d - 2 * r * 0.5) / 2);
  return g;
}

// ---------- text textures ----------
export function textCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
export { rr };

function tick(ctx, cx, cy, s, color, lw) {
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(cx - s * 0.5, cy); ctx.lineTo(cx - s * 0.12, cy + s * 0.36); ctx.lineTo(cx + s * 0.55, cy - s * 0.4); ctx.stroke();
}
export { tick };

// ---------- diorama ----------
export function buildWorld(scene) {
  const W = {};
  const MAT = {
    base: mat(PAL.cream, 0.92), baseSide: mat(PAL.sandDark, 0.95), lane: mat('#E4D8BF', 0.95), curb: mat('#EFE7D6', 0.9),
    wallCream: mat('#F3EBDD', 0.9), wallYellow: mat('#F4D27A', 0.9), wallGreen: mat('#A9DCC0', 0.9),
    roofGreen: mat(PAL.greenDark, 0.85), roofYellow: mat(PAL.yellowDeep, 0.85), roofInk: mat('#2B3140', 0.85),
    door: mat(PAL.green, 0.7), doorDark: mat(PAL.greenDark, 0.7), knob: mat(PAL.yellow, 0.4),
    window: mat('#FFE9A8', 0.5, { emissive: new THREE.Color('#F2C230'), emissiveIntensity: 0.35 }),
    frameWood: mat('#FFFFFF', 0.8), trunk: mat('#8A5A3C', 0.9), leaf: mat(PAL.green, 0.85), leafDark: mat(PAL.greenDark, 0.85),
    ink: mat(PAL.ink, 0.6), bulb: mat('#FFF1B8', 0.4, { emissive: new THREE.Color('#F2C230'), emissiveIntensity: 1.2 }),
    pot: mat('#C97B57', 0.85), stage: mat('#12151C', 0.95),
  };
  W.MAT = MAT;

  // dark stage floor (catches soft shadow), the diorama floats on it
  const stage = m(new THREE.CircleGeometry(30, 64), MAT.stage, false, true);
  stage.rotation.x = -Math.PI / 2; stage.position.y = -0.62;
  scene.add(stage);

  // Base plate: rounded slab (top/bottom caps cream, sides sand)
  const slab = new THREE.Shape();
  const bw = 7.2, bd = 6.4, br = 0.35;
  slab.moveTo(-bw / 2 + br, -bd / 2);
  slab.lineTo(bw / 2 - br, -bd / 2); slab.quadraticCurveTo(bw / 2, -bd / 2, bw / 2, -bd / 2 + br);
  slab.lineTo(bw / 2, bd / 2 - br); slab.quadraticCurveTo(bw / 2, bd / 2, bw / 2 - br, bd / 2);
  slab.lineTo(-bw / 2 + br, bd / 2); slab.quadraticCurveTo(-bw / 2, bd / 2, -bw / 2, bd / 2 - br);
  slab.lineTo(-bw / 2, -bd / 2 + br); slab.quadraticCurveTo(-bw / 2, -bd / 2, -bw / 2 + br, -bd / 2);
  const baseGeo = new THREE.ExtrudeGeometry(slab, { depth: 0.45, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 12 });
  const base = new THREE.Mesh(baseGeo, [MAT.base, MAT.baseSide]);
  base.castShadow = true; base.receiveShadow = true;
  base.rotation.x = Math.PI / 2; // shape XY -> XZ, extrude downward
  base.position.y = -0.04;
  scene.add(base);
  // lane
  const lane = m(new THREE.BoxGeometry(7.0, 0.02, 1.25), MAT.lane, false, true);
  lane.position.set(0, 0.011, 0.55);
  scene.add(lane);
  // footpath curb
  const curb = m(new THREE.BoxGeometry(7.0, 0.05, 0.08), MAT.curb);
  curb.position.set(0, 0.025, -0.1);
  scene.add(curb);
  // paving dots on lane (subtle texture)
  const dotGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.012, 10);
  const dotMat = mat('#D8CBAF', 0.95);
  for (let i = 0; i < 26; i++) {
    const d = m(dotGeo, dotMat, false, true);
    d.position.set(-3.2 + i * 0.26, 0.022, 0.55 + Math.sin(i * 1.7) * 0.4);
    scene.add(d);
  }

  // Houses along the back
  W.houses = [];
  const houseSpecs = [
    { x: -2.35, w: 1.5, h: 1.75, wall: MAT.wallGreen, roof: MAT.roofYellow, door: false },
    { x: -0.45, w: 2.1, h: 2.05, wall: MAT.wallCream, roof: MAT.roofGreen, door: true },
    { x: 1.75, w: 1.7, h: 1.6, wall: MAT.wallYellow, roof: MAT.roofInk, door: false },
  ];
  for (const s of houseSpecs) {
    const g = new THREE.Group();
    g.position.set(s.x, 0, -1.95);
    const body = m(new THREE.BoxGeometry(s.w, s.h, 1.4), s.wall);
    body.position.y = s.h / 2;
    g.add(body);
    // roof: prism via extrude
    const tri = new THREE.Shape();
    tri.moveTo(-s.w / 2 - 0.14, 0); tri.lineTo(s.w / 2 + 0.14, 0); tri.lineTo(0, 0.62); tri.closePath();
    const roof = m(new THREE.ExtrudeGeometry(tri, { depth: 1.6, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), s.roof);
    roof.position.set(0, s.h, -0.8);
    g.add(roof);
    // windows
    const nW = s.door ? 2 : 2;
    for (let i = 0; i < nW; i++) {
      const wx = s.door ? (i === 0 ? -0.62 : 0.62) : (i === 0 ? -0.35 : 0.35);
      const win = m(new THREE.BoxGeometry(0.42, 0.46, 0.06), MAT.window, false);
      win.position.set(wx, s.h * 0.58, 0.7);
      const fr = m(new THREE.BoxGeometry(0.5, 0.54, 0.04), MAT.frameWood, true);
      fr.position.set(wx, s.h * 0.58, 0.69);
      const mull = m(new THREE.BoxGeometry(0.03, 0.46, 0.08), MAT.frameWood, false);
      mull.position.set(wx, s.h * 0.58, 0.71);
      const sill = m(new THREE.BoxGeometry(0.56, 0.05, 0.12), MAT.frameWood);
      sill.position.set(wx, s.h * 0.58 - 0.27, 0.73);
      g.add(fr, win, mull, sill);
      // window box plants
      const box = m(new THREE.BoxGeometry(0.46, 0.09, 0.1), MAT.pot);
      box.position.set(wx, s.h * 0.58 - 0.33, 0.78);
      g.add(box);
      for (let k = 0; k < 4; k++) {
        const lf = m(new THREE.SphereGeometry(0.06, 10, 8), k % 2 ? MAT.leaf : MAT.leafDark);
        lf.position.set(wx - 0.16 + k * 0.105, s.h * 0.58 - 0.27, 0.8);
        g.add(lf);
      }
    }
    if (s.door) {
      // door on left side of house front so the doorstep is visible
      const dg = new THREE.Group();
      dg.position.set(0, 0, 0.71);
      const frame = m(new THREE.BoxGeometry(0.66, 1.12, 0.05), MAT.frameWood);
      frame.position.set(0, 0.56, 0);
      // hinge group so the door can swing
      const hinge = new THREE.Group();
      hinge.position.set(-0.27, 0, 0.03);
      const door = m(new THREE.BoxGeometry(0.54, 1.02, 0.05), MAT.door);
      door.position.set(0.27, 0.51, 0);
      const panel1 = m(new THREE.BoxGeometry(0.36, 0.3, 0.02), MAT.doorDark);
      panel1.position.set(0.27, 0.74, 0.03);
      const panel2 = m(new THREE.BoxGeometry(0.36, 0.3, 0.02), MAT.doorDark);
      panel2.position.set(0.27, 0.3, 0.03);
      const knob = m(new THREE.SphereGeometry(0.035, 12, 10), MAT.knob);
      knob.position.set(0.46, 0.5, 0.05);
      hinge.add(door, panel1, panel2, knob);
      const dark = m(new THREE.BoxGeometry(0.54, 1.02, 0.02), mat('#3B2E26', 0.95), false);
      dark.position.set(0, 0.51, -0.01);
      const step = m(new THREE.BoxGeometry(0.85, 0.07, 0.36), MAT.curb);
      step.position.set(0, 0.035, 0.2);
      // awning
      const awn = m(new THREE.BoxGeometry(0.9, 0.05, 0.36), mat(PAL.yellow, 0.8));
      awn.position.set(0, 1.25, 0.15); awn.rotation.x = 0.25;
      dg.add(frame, dark, hinge, step, awn);
      g.add(dg);
      W.doorHinge = hinge;
      W.doorWorld = new THREE.Vector3(s.x, 0, -1.95 + 0.71);
      // house number plaque (generic)
      const plaque = m(new THREE.BoxGeometry(0.16, 0.12, 0.02), mat(PAL.yellow, 0.6));
      plaque.position.set(0.48, 0.95, 0.72);
      g.add(plaque);
    }
    scene.add(g);
    W.houses.push(g);
  }
  W.mainHouse = W.houses[1];

  // Tree
  const tree = new THREE.Group();
  tree.position.set(2.7, 0, -0.55);
  const trunk = m(new THREE.CylinderGeometry(0.07, 0.1, 0.9, 10), MAT.trunk);
  trunk.position.y = 0.45; tree.add(trunk);
  [[0, 1.15, 0, 0.45, MAT.leaf], [-0.25, 0.95, 0.1, 0.32, MAT.leafDark], [0.27, 1.0, -0.05, 0.34, MAT.leafDark], [0.05, 1.45, 0.05, 0.3, MAT.leaf]].forEach(([x, y, z, r, mm]) => {
    const s = m(new THREE.SphereGeometry(r, 20, 16), mm); s.position.set(x, y, z); tree.add(s);
  });
  scene.add(tree);
  W.tree = tree;

  // Lamp post
  const lamp = new THREE.Group();
  lamp.position.set(-1.65, 0, -0.35);
  const pole = m(new THREE.CylinderGeometry(0.035, 0.05, 1.6, 10), MAT.ink); pole.position.y = 0.8;
  const head = m(new THREE.SphereGeometry(0.11, 16, 12), MAT.bulb); head.position.y = 1.65;
  const cap = m(new THREE.ConeGeometry(0.15, 0.12, 16), MAT.ink); cap.position.y = 1.76;
  lamp.add(pole, head, cap);
  scene.add(lamp);

  // Potted plants by the main door
  for (const [x, z] of [[-1.05, -1.05], [0.15, -1.05]]) {
    const p = m(new THREE.CylinderGeometry(0.11, 0.08, 0.2, 14), MAT.pot); p.position.set(x, 0.1, z);
    const l = m(new THREE.SphereGeometry(0.15, 14, 12), MAT.leaf); l.position.set(x, 0.3, z);
    scene.add(p, l);
  }
  // Bench
  const bench = new THREE.Group();
  bench.position.set(-2.6, 0, 1.6); bench.rotation.y = 0.4;
  const seat = m(new THREE.BoxGeometry(0.8, 0.05, 0.25), mat(PAL.yellowDeep, 0.8)); seat.position.y = 0.25;
  const back = m(new THREE.BoxGeometry(0.8, 0.22, 0.04), mat(PAL.yellowDeep, 0.8)); back.position.set(0, 0.42, -0.12);
  bench.add(seat, back);
  for (const x of [-0.33, 0.33]) { const leg = m(new THREE.BoxGeometry(0.04, 0.25, 0.22), MAT.ink); leg.position.set(x, 0.125, 0); bench.add(leg); }
  scene.add(bench);

  return W;
}

// ---------- props ----------
export function buildParcel() {
  const g = new THREE.Group();
  const box = m(roundedBox(0.34, 0.24, 0.26, 0.025, 2), mat(PAL.kraft, 0.9));
  g.add(box);
  const tapeM = mat(PAL.green, 0.6);
  const t1 = m(new THREE.BoxGeometry(0.352, 0.252, 0.06), tapeM); g.add(t1);
  const t2 = m(new THREE.BoxGeometry(0.06, 0.252, 0.272), tapeM); g.add(t2);
  const label = m(new THREE.PlaneGeometry(0.11, 0.07), mat(PAL.cream, 0.8), false);
  label.position.set(0.09, 0.03, 0.132); g.add(label);
  return g;
}

// The "clip frame": a portrait camera frame the host carries around.
export function buildClipFrame(textures) {
  const g = new THREE.Group();
  const W = 0.86, H = 1.18, T = 0.06;
  const yM = mat(PAL.yellow, 0.55);
  const bars = [
    [0, H / 2, W + T, T], [0, -H / 2, W + T, T], [-W / 2, 0, T, H + T], [W / 2, 0, T, H + T],
  ];
  for (const [x, y, w, h] of bars) {
    const b = m(roundedBox(w, h, 0.05, 0.022, 2), yM);
    b.position.set(x, y, 0);
    g.add(b);
  }
  // corner brackets (cream) inside
  const cM = mat(PAL.cream, 0.6);
  const L = 0.13, th = 0.022;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const hx = m(new THREE.BoxGeometry(L, th, 0.02), cM, false);
    hx.position.set(sx * (W / 2 - 0.05 - L / 2 + 0.0), sy * (H / 2 - 0.06), 0.03);
    const vy = m(new THREE.BoxGeometry(th, L, 0.02), cM, false);
    vy.position.set(sx * (W / 2 - 0.06), sy * (H / 2 - 0.05 - L / 2), 0.03);
    g.add(hx, vy);
  }
  // REC dot + label on top bar
  const recDot = m(new THREE.SphereGeometry(0.03, 14, 10), mat(PAL.coral, 0.4, { emissive: new THREE.Color(PAL.coral), emissiveIntensity: 0.6 }), false);
  recDot.position.set(-W / 2 + 0.14, H / 2 - 0.13, 0.03);
  g.add(recDot);
  const recLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), new THREE.MeshBasicMaterial({ map: textures.rec, transparent: true }));
  recLabel.position.set(-W / 2 + 0.27, H / 2 - 0.13, 0.03);
  g.add(recLabel);
  // "end of clip" shutter (hidden until the clip ends)
  const shutter = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.02, H - 0.02), new THREE.MeshStandardMaterial({ map: textures.endClip, roughness: 0.9 }));
  shutter.position.z = -0.005;
  shutter.scale.y = 0.0001; shutter.visible = false;
  const shutterPivot = new THREE.Group();
  shutterPivot.position.y = H / 2 - 0.01;
  shutter.position.y = -(H - 0.02) / 2;
  shutterPivot.add(shutter);
  g.add(shutterPivot);
  // handle grips on sides
  for (const sx of [-1, 1]) {
    const grip = m(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 12), mat(PAL.yellowDeep, 0.7));
    grip.position.set(sx * (W / 2 + 0.0), 0, 0.0);
    g.add(grip);
  }
  g.userData = { W, H, recDot, shutter, shutterPivot };
  return g;
}

export function buildDateTag(textures) {
  // little calendar block that flips its sheet
  const g = new THREE.Group();
  const block = m(roundedBox(0.3, 0.32, 0.06, 0.02, 2), mat(PAL.cream, 0.8));
  g.add(block);
  const header = m(new THREE.BoxGeometry(0.3, 0.08, 0.065), mat(PAL.green, 0.7));
  header.position.y = 0.12; g.add(header);
  for (const sx of [-0.08, 0.08]) { const ring = m(new THREE.TorusGeometry(0.022, 0.007, 6, 14), mat(PAL.ink, 0.4)); ring.position.set(sx, 0.165, 0); g.add(ring); }
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.21), new THREE.MeshBasicMaterial({ map: textures.dateQ, transparent: true }));
  face.position.set(0, -0.035, 0.033); g.add(face);
  const flip = new THREE.Group(); flip.position.set(0, 0.075, 0.035);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.21), new THREE.MeshBasicMaterial({ map: textures.dateQ, transparent: true, side: THREE.DoubleSide }));
  sheet.position.y = -0.11; flip.add(sheet); g.add(flip);
  g.userData = { face, flip, sheet };
  return g;
}

export function buildPin() {
  const g = new THREE.Group();
  const head = m(new THREE.SphereGeometry(0.13, 22, 18), mat(PAL.yellow, 0.45));
  head.position.y = 0.42;
  const cone = m(new THREE.ConeGeometry(0.1, 0.32, 20), mat(PAL.yellow, 0.45));
  cone.rotation.x = Math.PI; cone.position.y = 0.25;
  const dot = m(new THREE.SphereGeometry(0.05, 14, 10), mat(PAL.ink, 0.4));
  dot.position.set(0, 0.44, 0.1);
  const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.18 }));
  shadowDisc.rotation.x = -Math.PI / 2; shadowDisc.position.y = 0.025;
  g.add(head, cone, dot);
  g.userData = { shadowDisc };
  return g;
}

export function buildQuestion() {
  const g = new THREE.Group();
  const yM = mat(PAL.yellow, 0.5);
  const arc = m(new THREE.TorusGeometry(0.32, 0.11, 18, 40, Math.PI * 1.35), yM);
  arc.rotation.z = -Math.PI * 0.42;
  arc.position.y = 0.55;
  const stem = m(new THREE.CapsuleGeometry(0.11, 0.18, 8, 16), yM);
  stem.position.set(0.0, 0.08, 0);
  const dot = m(new THREE.SphereGeometry(0.13, 20, 16), yM);
  dot.position.y = -0.38;
  g.add(arc, stem, dot);
  // tweak stem to connect arc end
  stem.position.set(0.0, 0.12, 0);
  return g;
}

export function buildLoupe() {
  const g = new THREE.Group();
  const ring = m(new THREE.TorusGeometry(0.09, 0.018, 10, 30), mat(PAL.ink, 0.4));
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.088, 30), new THREE.MeshStandardMaterial({ color: '#CFF0E0', transparent: true, opacity: 0.35, roughness: 0.1 }));
  const handle = m(new THREE.CylinderGeometry(0.018, 0.022, 0.16, 10), mat(PAL.yellowDeep, 0.6));
  handle.position.y = -0.17;
  g.add(ring, glass, handle);
  return g;
}

export function buildPanel(texture, w = 0.62, h = 0.78) {
  const g = new THREE.Group();
  const back = m(roundedBox(w + 0.06, h + 0.06, 0.04, 0.03, 2), mat(PAL.cream, 0.85));
  g.add(back);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  face.position.z = 0.022;
  g.add(face);
  g.userData = { face, back };
  return g;
}
