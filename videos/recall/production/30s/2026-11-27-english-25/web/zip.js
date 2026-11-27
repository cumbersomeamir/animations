// english-25 props: a zip pencil case on the café counter, and the giant zipper cut-away: two staggered rows of teeth (each with a
// bump on one face and a hollow on the other) on flexible tapes, a slider whose Y-shaped channel (slanted side walls, a wedge
// between the arms) joins or splits the rows, a lifting cover with a lime pull tab and a lock catch, and an exploded nest demo.
//
// Facts (G. Sundback, US Patent 1,219,881 "Separable fastener", 1917; YKK Americas, "Pin Lock Sliders vs. Auto Lock Sliders"):
// the slide has a chamber whose side walls have inclined faces and a tongue separating it into branch channels ("Y-shaped channel");
// moved one way it unlocks and opens the members, moved the other way it closes them; the members are staggered, each with a recess on
// one side and a projection on the other, so the outside of one nests within the recess of the next; once engaged the stringers have
// practically no movement of separation. An auto-lock slider's small locking mechanism keeps it in place unless the tab is pulled.
// Sizes, proportions, colours and the drawn catch are illustrative; real sliders and teeth vary by maker.
import * as THREE from 'three';
import { PAL, flat, buildRibbon } from './lowpoly.js';

const shadow = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- giant geometry constants (units)
export const Z = {
  P: 0.6,            // spacing of teeth on one tape; the other tape is offset by P / 2 (staggered)
  W: 0.62, H: 0.27, D: 0.26,   // tooth head size (x across, y along the chain, z thickness)
  N: 44,             // teeth per tape (wrapping chain)
  bot: -1.7, split: -0.2, top: 1.7,   // slider: bottom (single channel), where the arms begin, top (two arms)
  armSlope: 0.5,     // lateral spread per unit length inside the arms
  tapeW: 1.3,
};
/** lateral offset of each row (0 = joined) at height yRel relative to the slider */
export function rowOffset(yRel) {
  if (yRel <= Z.split) return 0;
  if (yRel <= Z.top) return (yRel - Z.split) * Z.armSlope;
  return Math.min(2.4, (Z.top - Z.split) * Z.armSlope + (yRel - Z.top) * 0.42);
}
const slopeAt = yRel => (yRel <= Z.split ? 0 : yRel <= Z.top ? Z.armSlope : (rowOffset(yRel + 0.01) - rowOffset(yRel)) / 0.01);

function plateShape(inset = 0) {   // slider plate outline: narrow bottom, wide top (follows the outer channel walls)
  const s = new THREE.Shape(), hw = y => Z.W + rowOffset(y) + 0.22 - inset;
  const ys = [Z.bot, Z.split, 0.4, 1.0, Z.top];
  s.moveTo(-hw(Z.bot), Z.bot - 0.05);
  for (const y of ys) s.lineTo(-hw(y), y);
  s.lineTo(-hw(Z.top), Z.top + 0.05); s.lineTo(hw(Z.top), Z.top + 0.05);
  for (const y of [...ys].reverse()) s.lineTo(hw(y), y);
  s.lineTo(hw(Z.bot), Z.bot - 0.05); s.lineTo(-hw(Z.bot), Z.bot - 0.05);
  return s;
}

export function buildGiantZip(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), flat('#2B241C')); floor.rotation.x = -Math.PI / 2; floor.position.y = -9; floor.receiveShadow = true; g.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), flat('#3A2D21')); back.position.set(0, 0, -6); back.receiveShadow = true; g.add(back);
  // tapes (ribbons that follow the rows' spread)
  const tapeL = buildRibbon(g, '#56634A', 300), tapeR = buildRibbon(g, '#56634A', 300);
  // teeth: heads, bumps (on +y face), hollows (dark, on -y face), per row
  const headGeo = new THREE.BoxGeometry(Z.W, Z.H, Z.D, 2, 1, 1);
  const bumpGeo = new THREE.SphereGeometry(0.075, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const holeGeo = new THREE.CircleGeometry(0.085, 14);
  const rows = ['#D6D1C6', '#B9B2A4'].map(c => {
    const heads = new THREE.InstancedMesh(headGeo, flat(c, { roughness: 0.4, metalness: 0.3 }), Z.N);
    const bumps = new THREE.InstancedMesh(bumpGeo, flat(c, { roughness: 0.35, metalness: 0.3 }), Z.N);
    const holes = new THREE.InstancedMesh(holeGeo, new THREE.MeshBasicMaterial({ color: '#1A1712', side: THREE.DoubleSide }), Z.N);
    for (const m of [heads, bumps, holes]) { m.frustumCulled = false; m.castShadow = m !== holes; g.add(m); }
    return { heads, bumps, holes };
  });
  // slider: back plate, channel walls (top + bottom flanges leave a slit for the tape), wedge, lifting cover with pull tab + catch
  const metal = flat('#B7B2A8', { roughness: 0.35, metalness: 0.25 });
  const wallM = flat('#A9A49A', { roughness: 0.35, metalness: 0.4, emissive: PAL.lime, emissiveIntensity: 0 });
  const wedgeM = flat('#A9A49A', { roughness: 0.35, metalness: 0.4, emissive: PAL.lime, emissiveIntensity: 0 });
  const slider = new THREE.Group(); g.add(slider);
  const backPlate = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(plateShape(), { depth: 0.08, bevelEnabled: false }), metal)); backPlate.position.z = -0.36; slider.add(backPlate);
  const walls = [];
  for (const side of [-1, 1]) for (const zf of [-0.2, 0.2]) {   // flanges along the outer channel edge, above and below the tape slit
    const pts = [Z.bot, Z.split, 0.4, 1.0, Z.top].map(y => V(side * (Z.W + rowOffset(y) + 0.1), y, zf));
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], d = b.clone().sub(a), L = d.length();
      const w = shadow(box(0.14, L + 0.02, 0.16, wallM)); w.position.copy(a).addScaledVector(d, 0.5); w.rotation.z = -Math.atan2(d.x, d.y); slider.add(w); walls.push(w);
    }
  }
  const wsh = new THREE.Shape(); { const hw = y => Math.max(0.02, rowOffset(y) - 0.11); const ys = [Z.split + 0.22, 0.4, 1.0, Z.top]; wsh.moveTo(0, Z.split + 0.12); for (const y of ys) wsh.lineTo(hw(y), y); wsh.lineTo(hw(Z.top), Z.top + 0.05); wsh.lineTo(-hw(Z.top), Z.top + 0.05); for (const y of [...ys].reverse()) wsh.lineTo(-hw(y), y); wsh.lineTo(0, Z.split + 0.12); }
  const wedge = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(wsh, { depth: 0.56, bevelEnabled: false }), wedgeM)); wedge.position.z = -0.28; slider.add(wedge);
  const cover = new THREE.Group(); slider.add(cover);
  const coverM = flat('#C4BFB4', { roughness: 0.3, metalness: 0.25, transparent: true, opacity: 1 });
  const coverPlate = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(plateShape(), { depth: 0.08, bevelEnabled: false }), coverM)); coverPlate.position.z = 0.28; cover.add(coverPlate);
  const lug = shadow(box(0.3, 0.6, 0.2, coverM)); lug.position.set(0, 0.6, 0.45); cover.add(lug);
  const tabPivot = new THREE.Group(); tabPivot.position.set(0, 0.85, 0.5); cover.add(tabPivot);
  const tab = shadow(box(0.5, 1.6, 0.08, flat(PAL.lime, { roughness: 0.5 }))); tab.position.y = -0.85; tabPivot.add(tab);
  const tabHole = box(0.22, 0.28, 0.09, flat('#1E241A')); tabHole.position.y = -1.35; tabPivot.add(tabHole);
  // lock catch (illustrative): a lime pin under the tab that drops between two teeth below the wedge
  const catchM = flat(PAL.lime, { emissive: PAL.lime, emissiveIntensity: 0.7 });
  const catchPin = shadow(box(0.2, 0.06, 0.55, catchM)); catchPin.position.set(0.0, -1.05, 0.3); slider.add(catchPin);
  // pull arrows (sideways tension tests)
  const arrows = [-1, 1].map(s => {
    const a = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: PAL.lime, toneMapped: false });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 10), m); shaft.rotation.z = Math.PI / 2; shaft.position.x = s * 0.5; a.add(shaft);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.42, 12), m); head.rotation.z = -s * Math.PI / 2; head.position.x = s * 1.15; a.add(head);
    a.visible = false; g.add(a); return a;
  });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = V(1, 1, 1);
  return {
    group: g, slider, cover, coverM, tabPivot, catchPin, walls, wallM, wedgeM, arrows,
    /** chain scroll c (units), slider height sy, sideways strain (0..1), catch depth (0 up .. 1 down between teeth) */
    set({ c = 0, sy = 0, strain = 0, catchDown = 1, tabUp = 0, cover: coverK = 0, coverAlpha = 1, arrowY = -4.4 }) {
      slider.position.y = sy;
      cover.position.set(0, 4.5 * coverK, 0.8 * coverK); cover.rotation.x = -0.25 * coverK; cover.visible = coverK < 0.999;
      coverM.opacity = coverAlpha * (1 - 0.85 * coverK); coverM.depthWrite = coverAlpha >= 1 && coverK < 0.05;
      tabPivot.rotation.x = -1.1 * tabUp;
      catchPin.position.z = 0.3 - 0.32 * catchDown; catchPin.visible = coverK < 0.5;
      const span = Z.N * Z.P;
      rows.forEach((r, side) => {
        const s = side ? 1 : -1;
        for (let i = 0; i < Z.N; i++) {
          let y = ((i * Z.P + c + (side ? Z.P / 2 : 0)) % span + span) % span - span / 2;
          const yr = y - sy, off = rowOffset(yr) + 0.03 * strain, ang = Math.atan(slopeAt(yr));
          const cx = s * (Z.W / 2 - 0.07 + off);
          e.set(0, 0, s * ang); q.setFromEuler(e);
          m4.compose(V(cx, y, 0), q, sc); r.heads.setMatrixAt(i, m4);
          const tipX = -s * (Z.W / 2 - 0.1);   // bump and hollow sit near the tooth tip (the part that overlaps the other row)
          const bp = V(tipX, Z.H / 2, 0).applyQuaternion(q).add(V(cx, y, 0)); m4.compose(bp, q, sc); r.bumps.setMatrixAt(i, m4);
          const hp = V(tipX, -Z.H / 2 - 0.002, 0).applyQuaternion(q).add(V(cx, y, 0));
          const hq = q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0))); m4.compose(hp, hq, sc); r.holes.setMatrixAt(i, m4);
        }
        for (const m of [r.heads, r.bumps, r.holes]) m.instanceMatrix.needsUpdate = true;
      });
      const tape = (rib, s) => rib.userData && (rib.visible = true, rib);
      for (const [rib, s] of [[tapeL, -1], [tapeR, 1]]) {
        const pos = rib.geometry.attributes.position.array, Nn = rib.userData.N;
        for (let k = 0; k <= Nn; k++) {
          const y = -14 + 28 * k / Nn, off = rowOffset(y - sy) + 0.05 * strain, xc = s * (Z.W - 0.1 + Z.tapeW / 2 + off);
          pos.set([xc - Z.tapeW / 2, y, -0.01, xc + Z.tapeW / 2, y, -0.01], k * 6);
        }
        rib.geometry.attributes.position.needsUpdate = true; rib.geometry.computeBoundingSphere();
      }
      arrows.forEach((a, k) => { a.visible = strain > 0.01; a.position.set((k ? 1 : -1) * (Z.W + 0.15 + 0.2 * strain), arrowY, 0.3); a.scale.setScalar(0.8 + 0.3 * strain); });
      void tape;
    },
  };
}

/** Exploded nest demo: four big teeth from alternating tapes, stacked along the chain; gap 1 = apart, 0 = nested. */
export function buildNestDemo(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), flat('#33281E')); back.position.z = -4; g.add(back);
  const teeth = [];
  for (let k = 0; k < 4; k++) {
    const s = k % 2 ? 1 : -1, c = k % 2 ? '#B9B2A4' : '#D6D1C6', t = new THREE.Group(); g.add(t);
    const head = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.7, 2, 1, 1), flat(c, { roughness: 0.4, metalness: 0.3 }))); t.add(head);
    const bump = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), flat(PAL.lime, { roughness: 0.4, emissive: PAL.lime, emissiveIntensity: 0.15 }))); bump.position.set(0, 0.35, 0); t.add(bump);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.22, 18), new THREE.MeshBasicMaterial({ color: '#141210', side: THREE.DoubleSide })); hole.rotation.x = Math.PI / 2; hole.position.set(0, -0.352, 0); t.add(hole);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.03, 6, 24), new THREE.MeshBasicMaterial({ color: PAL.paper, toneMapped: false })); rim.rotation.x = Math.PI / 2; rim.position.set(0, -0.356, 0); t.add(rim);
    const tape = shadow(box(1.2, 0.72, 0.16, flat('#56634A'))); tape.position.set(s * 1.25, 0, 0); t.add(tape);
    teeth.push({ t, s });
  }
  return {
    group: g, teeth,
    set(gap) { teeth.forEach(({ t, s }, k) => { t.position.set(s * 0.18 * (1 + gap), k * (0.7 - 0.04 + 0.75 * gap) - 1.2, 0); }); },
  };
}

// ---------------------------------------------------------------- café zip pencil case (along local x; closed end at +x)
export function buildPencilCase(scene, at, rotY = 0) {
  const g = new THREE.Group(); g.position.set(...at); g.rotation.y = rotY; scene.add(g);
  const L = 0.24, bodyM = flat('#7E8F6A', { roughness: 0.85 });
  const body = shadow(new THREE.Mesh(new THREE.CapsuleGeometry(0.038, L - 0.076, 6, 12), bodyM)); body.rotation.z = Math.PI / 2; body.scale.set(1, 1, 1.15); body.position.y = 0.038; g.add(body);
  const chainM = flat('#C9C3B6', { roughness: 0.4, metalness: 0.3 }), gapM = flat('#1E1A15');
  const closed = shadow(box(1, 0.006, 0.012, chainM)); closed.position.y = 0.077; g.add(closed);
  const openL = box(1, 0.005, 0.005, chainM), openR = openL.clone(), slit = box(1, 0.004, 0.012, gapM);
  for (const m of [openL, openR, slit]) { m.position.y = 0.077; g.add(m); }
  const slider = new THREE.Group(); g.add(slider);
  const sb = shadow(box(0.018, 0.01, 0.02, flat('#9E9A92', { metalness: 0.4, roughness: 0.35 }))); slider.add(sb);
  const tab = shadow(box(0.008, 0.002, 0.03, flat(PAL.lime))); tab.position.set(0, 0.004, 0.022); slider.add(tab);
  const xOpenEnd = -L / 2 + 0.01, xClosedEnd = L / 2 - 0.01;
  return {
    group: g, slider, tab,
    /** u = 1 fully closed (slider at the open end), 0 fully open (slider at the closed end) */
    set(u, tabLift = 0) {
      const sx = xClosedEnd + (xOpenEnd - xClosedEnd) * u;
      slider.position.set(sx, 0.082, 0); tab.rotation.x = -1.0 * tabLift; tab.position.z = 0.022 - 0.008 * tabLift; tab.position.y = 0.004 + 0.012 * tabLift;
      const cl = Math.max(0.001, xClosedEnd - sx), op = Math.max(0.001, sx - xOpenEnd);
      closed.scale.x = cl; closed.position.x = sx + cl / 2;
      for (const [m, z] of [[openL, -0.006], [openR, 0.006]]) { m.scale.x = op; m.position.set(sx - op / 2, 0.077, z); }
      slit.scale.x = op; slit.position.set(sx - op / 2, 0.0765, 0);
    },
    tabWorld() { return tab.getWorldPosition(V(0, 0, 0)); },
  };
}
