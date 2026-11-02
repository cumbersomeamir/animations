// gram.js: "Gram", the recurring NutriAI education performer: a living 100 g calibration weight.
// Reusable Three.js rig: lathe body + knob, canvas-drawn expressive face (with the "100 g"
// engraving), ink limbs with simple 2-bone IK, cream gloves, leaf-green shoes.
// API: const g = createGram(THREE); scene.add(g.root); g.pose({...}); g.face({...});
import { COL, clamp, lerp } from './util.js';

export const GRAM_DIM = { bodyR: 0.44, legLen: 0.30, bodyH: 1.21, total: 1.51 };

export function createGram(THREE) {
  const root = new THREE.Group();      // origin on the ground between the feet; faces +z
  const hip = new THREE.Group();       // body pivot at the bottom of the body
  root.add(hip);

  const bodyMat = new THREE.MeshPhysicalMaterial({ color: COL.leaf, roughness: 0.3, metalness: 0.2, clearcoat: 0.7, clearcoatRoughness: 0.22 });
  const bandMat = new THREE.MeshPhysicalMaterial({ color: COL.leafDark, roughness: 0.35, metalness: 0.25, clearcoat: 0.5 });
  const inkMat = new THREE.MeshStandardMaterial({ color: COL.ink, roughness: 0.55 });
  const gloveMat = new THREE.MeshStandardMaterial({ color: COL.mist, roughness: 0.5 });
  const shoeMat = new THREE.MeshPhysicalMaterial({ color: COL.leafDark, roughness: 0.4, clearcoat: 0.4 });

  // calibration-weight silhouette (radius, height)
  const prof = [
    [0.0, 0.0], [0.40, 0.0], [0.445, 0.02], [0.445, 0.14], [0.44, 0.16], [0.44, 0.70], [0.43, 0.745], [0.39, 0.79],
    [0.30, 0.83], [0.19, 0.86], [0.155, 0.89], [0.15, 0.95], [0.20, 0.975], [0.25, 1.01], [0.272, 1.07], [0.262, 1.13],
    [0.22, 1.18], [0.12, 1.205], [0.0, 1.21],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  hip.add(body);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.452, 0.452, 0.11, 72, 1, true), bandMat);
  band.position.y = 0.075;
  band.castShadow = true;
  hip.add(band);
  const knobRing = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.018, 12, 48), bandMat);
  knobRing.rotation.x = Math.PI / 2;
  knobRing.position.y = 0.93;
  hip.add(knobRing);

  // face: canvas texture on a cylinder patch facing +z
  const FW = 1024, FH = 600;
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = FW;
  faceCanvas.height = FH;
  const fctx = faceCanvas.getContext('2d');
  const faceTex = new THREE.CanvasTexture(faceCanvas);
  faceTex.colorSpace = THREE.SRGBColorSpace;
  faceTex.anisotropy = 4;
  const faceGeo = new THREE.CylinderGeometry(0.4415, 0.4415, 0.60, 64, 1, true, -1.2, 2.4);
  const faceMesh = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ map: faceTex, transparent: true, roughness: 0.4, depthWrite: false }));
  faceMesh.position.y = 0.45;
  hip.add(faceMesh);

  // limbs
  const limbGeo = new THREE.CylinderGeometry(1, 1, 1, 14, 1);
  limbGeo.translate(0, 0.5, 0);
  const ballGeo = new THREE.SphereGeometry(1, 18, 12);
  const mk = (geo, mat, parent) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; parent.add(m); return m; };
  const arms = ['L', 'R'].map(() => ({ up: mk(limbGeo, inkMat, hip), lo: mk(limbGeo, inkMat, hip), el: mk(ballGeo, inkMat, hip), hand: mk(ballGeo, gloveMat, hip) }));
  const legs = ['L', 'R'].map(() => ({ up: mk(limbGeo, inkMat, root), lo: mk(limbGeo, inkMat, root), kn: mk(ballGeo, inkMat, root), shoe: mk(ballGeo, shoeMat, root) }));
  const R_LIMB = 0.042;

  const Y = new THREE.Vector3(0, 1, 0);
  const tmp = new THREE.Vector3();
  function place(mesh, a, b, r) {
    tmp.subVectors(b, a);
    const len = tmp.length();
    mesh.position.copy(a);
    mesh.quaternion.setFromUnitVectors(Y, tmp.normalize());
    mesh.scale.set(r, Math.max(len, 1e-4), r);
  }
  function ball(mesh, p, r) { mesh.position.copy(p); mesh.scale.setScalar(r); }
  // 2-bone solve: elbow placed on the bend side
  function solve2(a, c, L1, L2, pole) {
    const d = tmp.subVectors(c, a);
    const dist = Math.min(d.length(), L1 + L2 - 1e-3);
    const dir = d.clone().normalize();
    const along = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist);
    const h = Math.sqrt(Math.max(0, L1 * L1 - along * along));
    const side = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
    const end = a.clone().add(dir.clone().multiplyScalar(dist));
    return { mid: a.clone().add(dir.multiplyScalar(along)).add(side.multiplyScalar(h)), end };
  }

  const state = { faceKey: '' };
  const SH = [new THREE.Vector3(-0.43, 0.56, 0.02), new THREE.Vector3(0.43, 0.56, 0.02)];
  const HIPS = [-0.17, 0.17];

  // pose: { x,y,z, rotY, lean, pitch, squash, crouch, lift, hands:[[x,y,z],[x,y,z]] (hip-local), feet:[[dx,dz,dy],[...]] }
  function pose(p = {}) {
    root.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0);
    root.rotation.y = p.rotY ?? 0;
    const crouch = clamp(p.crouch ?? 0, 0, 1);
    const lift = p.lift ?? 0;
    const hipY = GRAM_DIM.legLen - crouch * 0.13 + lift;
    const sq = p.squash ?? 0;
    hip.position.set(0, hipY, 0);
    hip.rotation.set(((p.pitch ?? 0) * Math.PI) / 180, 0, (-(p.lean ?? 0) * Math.PI) / 180);
    hip.scale.set(1 + sq * 0.55, 1 - sq, 1 + sq * 0.55);
    // arms (hip-local)
    const hands = p.hands || [[-0.62, 0.24, 0.06], [0.62, 0.24, 0.06]];
    arms.forEach((A, i) => {
      const s = SH[i];
      const h = new THREE.Vector3(...hands[i]);
      const pole = new THREE.Vector3(i ? 1 : -1, -0.6, -0.4);
      const { mid, end } = solve2(s, h, 0.27, 0.25, pole);
      place(A.up, s, mid, R_LIMB);
      place(A.lo, mid, end, R_LIMB);
      ball(A.el, mid, R_LIMB);
      ball(A.hand, end, 0.085);
    });
    // legs (root space): hips follow the body pivot
    hip.updateMatrix();
    const feet = p.feet || [[0, 0, 0], [0, 0, 0]];
    legs.forEach((Lg, i) => {
      const hp = new THREE.Vector3(HIPS[i], 0.03, 0).applyMatrix4(hip.matrix);
      const f = new THREE.Vector3(HIPS[i] * 1.15 + (feet[i][0] || 0), 0.06 + lift * 0.55 + (feet[i][2] || 0), (feet[i][1] || 0));
      const { mid, end } = solve2(hp, f, 0.17, 0.17, new THREE.Vector3(i ? 0.5 : -0.5, 0, 1));
      place(Lg.up, hp, mid, R_LIMB);
      place(Lg.lo, mid, end, R_LIMB);
      ball(Lg.kn, mid, R_LIMB);
      Lg.shoe.position.set(end.x, end.y - 0.02, end.z + 0.05);
      Lg.shoe.scale.set(0.11, 0.065, 0.16);
    });
  }

  // face: { eyes:'open'|'wide'|'happy'|'closed'|'squint'|'wink', look:[x,y], blink, brows:'none'|'up'|'worried'|'determined'|'curious', mouth:'smile'|'grin'|'o'|'flat'|'wavy'|'smirk'|'open', open, blush }
  function face(e = {}) {
    const key = JSON.stringify(e);
    if (key === state.faceKey) return;
    state.faceKey = key;
    drawFace(fctx, FW, FH, e);
    faceTex.needsUpdate = true;
  }

  pose({});
  face({ eyes: 'open', mouth: 'smile' });
  const handWorld = (i) => { arms[i].hand.updateWorldMatrix(true, false); return arms[i].hand.getWorldPosition(new THREE.Vector3()); };
  return { root, hip, pose, face, faceCanvas, handWorld, hands: arms.map((a) => a.hand), materials: { bodyMat, bandMat, inkMat, gloveMat, shoeMat } };
}

// ------------------------------------------------------------------ face artwork (2D)
export function drawFace(g, W, H, e) {
  g.clearRect(0, 0, W, H);
  const ink = COL.ink;
  const look = e.look || [0, 0];
  const blink = clamp(e.blink ?? 0);
  const cx = W / 2, ey = 205, dx = 128;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  // engraving "100 g"
  g.font = '900 92px NDisplay, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.fillStyle = 'rgba(21,30,22,0.55)';
  g.fillText('100 g', cx + 3, H - 28);
  g.fillStyle = 'rgba(166,233,85,0.55)';
  g.fillText('100 g', cx - 1, H - 32);
  // blush
  if (e.blush) {
    g.fillStyle = `rgba(240,125,16,${0.28 * e.blush})`;
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 205, ey + 105, 52, 26, 0, 0, Math.PI * 2); g.fill(); }
  }
  const eyes = e.eyes || 'open';
  for (const s of [-1, 1]) {
    const x = cx + s * dx;
    const kind = eyes === 'wink' ? (s > 0 ? 'happy' : 'open') : eyes;
    if (kind === 'happy') {
      g.strokeStyle = ink; g.lineWidth = 22;
      g.beginPath(); g.arc(x, ey + 25, 55, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
      continue;
    }
    if (kind === 'closed') {
      g.strokeStyle = ink; g.lineWidth = 20;
      g.beginPath(); g.arc(x, ey - 10, 55, Math.PI * 0.2, Math.PI * 0.8); g.stroke();
      continue;
    }
    const rw = kind === 'wide' ? 78 : 66, rh = kind === 'wide' ? 96 : kind === 'squint' ? 46 : 84;
    const open = 1 - blink;
    g.fillStyle = COL.mist;
    g.strokeStyle = ink;
    g.lineWidth = 14;
    g.beginPath(); g.ellipse(x, ey, rw, Math.max(4, rh * open), 0, 0, Math.PI * 2); g.fill(); g.stroke();
    if (open > 0.25) {
      g.save();
      g.beginPath(); g.ellipse(x, ey, rw - 7, Math.max(2, rh * open - 7), 0, 0, Math.PI * 2); g.clip();
      const px = x + look[0] * rw * 0.42, py = ey - look[1] * rh * 0.38 + 6;
      g.fillStyle = ink;
      g.beginPath(); g.ellipse(px, py, kind === 'wide' ? 30 : 36, kind === 'wide' ? 34 : 42, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#FFFFFF';
      g.beginPath(); g.arc(px - 11, py - 15, 11, 0, Math.PI * 2); g.fill();
      g.restore();
    }
  }
  // brows
  const brows = e.brows || 'none';
  if (brows !== 'none') {
    g.strokeStyle = ink; g.lineWidth = 20;
    for (const s of [-1, 1]) {
      const x = cx + s * dx;
      let yi = 0, yo = 0;
      if (brows === 'up') { yi = -26; yo = -18; }
      if (brows === 'worried') { yi = -30; yo = 6; }
      if (brows === 'determined') { yi = 14; yo = -14; }
      if (brows === 'curious') { yi = s > 0 ? -34 : 2; yo = s > 0 ? -22 : 4; }
      const by = ey - 118;
      g.beginPath(); g.moveTo(x + s * 62, by + yo); g.quadraticCurveTo(x + s * 15, by + Math.min(yi, yo) - 12, x - s * 48, by + yi); g.stroke();
    }
  }
  // mouth
  const my = ey + 150, mouth = e.mouth || 'smile', mo = clamp(e.open ?? 0.6, 0, 1.3);
  g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 18;
  if (mouth === 'smile') { g.beginPath(); g.arc(cx, my - 52, 64, Math.PI * 0.22, Math.PI * 0.78); g.stroke(); }
  else if (mouth === 'smirk') { g.beginPath(); g.moveTo(cx - 50, my); g.quadraticCurveTo(cx + 10, my + 18, cx + 60, my - 18); g.stroke(); }
  else if (mouth === 'flat') { g.beginPath(); g.moveTo(cx - 44, my); g.lineTo(cx + 44, my); g.stroke(); }
  else if (mouth === 'wavy') {
    g.lineWidth = 14; g.beginPath();
    for (let i = 0; i <= 6; i++) { const x = cx - 60 + i * 20, y = my + (i % 2 ? -10 : 10); i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  } else if (mouth === 'o') { g.beginPath(); g.ellipse(cx, my, 30, 30 + 24 * mo, 0, 0, Math.PI * 2); g.fill(); }
  else {
    // grin / open: D-shaped open mouth with tongue
    const h = 30 + 70 * mo;
    g.beginPath(); g.moveTo(cx - 78, my - 20); g.quadraticCurveTo(cx, my - 6, cx + 78, my - 20); g.quadraticCurveTo(cx + 60, my + h, cx, my + h); g.quadraticCurveTo(cx - 60, my + h, cx - 78, my - 20); g.closePath(); g.fill();
    g.save(); g.clip();
    g.fillStyle = '#E0705A'; g.beginPath(); g.ellipse(cx + 8, my + h, 46, 30, 0, 0, Math.PI * 2); g.fill();
    if (mouth === 'grin') { g.fillStyle = COL.mist; g.fillRect(cx - 70, my - 30, 140, 22); }
    g.restore();
  }
}
