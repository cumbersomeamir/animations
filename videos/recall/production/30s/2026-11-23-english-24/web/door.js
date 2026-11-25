// english-24 props: the counter microwave (round 02 / english-11 builder) with a real perforated metal screen in the door window,
// a mug on the turntable, a power strip + plug; and the giant door cut-away: a perforated sheet drawn at true hole-to-wavelength
// scale (1 mm holes vs a ~120 mm microwave), the wave ribbon and its reflection, wavelength and hole rulers, a "solid metal" overlay,
// light rays passing through holes, and the bent-door gap.
//
// Facts (HyperPhysics "Microwave Ovens", R. Nave, Georgia State Univ.; NASA Science "Microwaves" / "Visible Light"; FDA "Microwave
// Oven Radiation"; 21 CFR 1030.10): oven microwaves are about 12 cm long (2,450 MHz); the door screen's holes are about 1 mm, so
// the wavelength is ~120 times the hole size and the waves can't get out; visible light (~500 nm) is ~2000 times smaller than the
// holes, so you can see through; metal reflects microwaves; a damaged door (hinges, latch, seals) can leak, so don't use an oven whose
// door is bent or doesn't close firmly. Leakage limits are small but not zero, so nothing here claims zero leakage.
import * as THREE from 'three';
import { PAL, flat, buildRibbon } from './lowpoly.js';

const shadow = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/** Canvas texture of a perforated metal sheet: staggered round holes (alpha 0) in metal; one tile = cols x rows hole pitches.
 *  Even rows (from the top of the tile): centres at (k + 0.5) * pitch; odd rows: at k * pitch (edge holes split across tiles). */
function perforated(cols, rows, holeFrac = 0.55, metal = '#3A3A36') {
  const px = 32, c = document.createElement('canvas'); c.width = cols * px; c.height = rows * px;
  const x = c.getContext('2d');
  x.fillStyle = metal; x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'destination-out';
  for (let r = 0; r < rows; r++) for (let k = 0; k <= cols; k++) {
    const cx = r % 2 ? k * px : (k + 0.5) * px;
    if (cx > c.width) continue;
    x.beginPath(); x.arc(cx, (r + 0.5) * px, px * holeFrac / 2, 0, Math.PI * 2); x.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ---------------------------------------------------------------- counter microwave (round 02 builder; door on local +z, hinge on -x)
export function buildMicrowave(scene) {
  const g = new THREE.Group(), W = 0.5, H = 0.3, D = 0.38, t = 0.02, PW = 0.13;
  const shell = flat('#E8E2D6'), inner = flat('#DCD8CE', { emissive: '#6B4A22', emissiveIntensity: 0 }), panelM = flat('#2E2C28', { roughness: 0.5 });
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
  // mug on the turntable (rotates with the plate)
  const mug = new THREE.Group(); mug.position.set(0, 0.006, 0.0); plate.add(mug);
  const mb = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.034, 0.085, 12), flat('#C9673F'))); mb.position.y = 0.045; mug.add(mb);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0385, 0.0385, 0.014, 12), flat(PAL.lime)); band.position.y = 0.05; mug.add(band);
  const tea = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.004, 12), flat('#8A5A34')); tea.position.y = 0.083; mug.add(tea);
  const handle = shadow(new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 5, 10), flat('#C9673F'))); handle.position.set(0.045, 0.048, 0); mug.add(handle);
  const cavLight = new THREE.PointLight('#FFE3A8', 0, 1.2, 1.0); cavLight.position.set(cx, H - 0.08, 0.11); g.add(cavLight);
  // door: shell frame + perforated metal screen + light tinted glass
  const door = new THREE.Group(); door.position.set(-W / 2, 0, D / 2); g.add(door);
  const ww = W - PW - 0.09, wh = H - 0.09, wx = (W - PW) / 2 - 0.01, wy = H / 2;
  const frame = new THREE.Shape(); frame.moveTo(0, 0); frame.lineTo(W - PW, 0); frame.lineTo(W - PW, H); frame.lineTo(0, H); frame.lineTo(0, 0);
  const hole = new THREE.Path(); hole.moveTo(wx - ww / 2, wy - wh / 2); hole.lineTo(wx - ww / 2, wy + wh / 2); hole.lineTo(wx + ww / 2, wy + wh / 2); hole.lineTo(wx + ww / 2, wy - wh / 2); hole.lineTo(wx - ww / 2, wy - wh / 2);
  frame.holes.push(hole);
  const dp = shadow(new THREE.Mesh(new THREE.ExtrudeGeometry(frame, { depth: 0.024, bevelEnabled: false }), shell)); door.add(dp);
  const pitch = 0.0022;   // 2.2 mm hole pitch, ~1.2 mm holes (illustrative real-world scale; HyperPhysics: holes "about 1 mm")
  const tex = perforated(16, 16, 0.55); tex.repeat.set(ww / (16 * pitch), wh / (16 * pitch));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.45, metalness: 0.35 }));
  screen.position.set(wx, wy, 0.012); door.add(screen);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshStandardMaterial({ color: '#1C1B19', transparent: true, opacity: 0.18, roughness: 0.05, depthWrite: false }));
  glass.position.set(wx, wy, 0.0236); door.add(glass);
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.012, H - 0.024), panelM); pf.position.set(W / 2 - PW / 2, H / 2, D / 2 + 0.0012); g.add(pf);
  const dc = document.createElement('canvas'); dc.width = 512; dc.height = 232;
  const dtex = new THREE.CanvasTexture(dc); dtex.colorSpace = THREE.SRGBColorSpace; dtex.anisotropy = 8;
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.108, 0.049), new THREE.MeshBasicMaterial({ map: dtex, toneMapped: false }));
  disp.position.set(W / 2 - PW / 2, H - 0.05, D / 2 + 0.0024); g.add(disp);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    const b = shadow(box(0.026, 0.02, 0.006, flat(r === 2 && c === 2 ? '#C9C3B6' : '#5A5650'))); b.position.set(W / 2 - PW / 2 + (c - 1) * 0.034, H - 0.12 - r * 0.034, D / 2 + 0.003); g.add(b);
  }
  scene.add(g);
  const ctx = dc.getContext('2d');
  return {
    group: g, door, plate, lamp, mug, cavLight, W, H, D,
    window: V(-W / 2 + wx, wy, D / 2 + 0.024),   // window centre, local coords
    set({ run = false, turn = 0, doorAjar = 0, text = '' }) {
      lamp.material.color.set(run ? '#FFE3A8' : '#7A7468'); cavLight.intensity = run ? 4 : 0; inner.emissiveIntensity = run ? 0.22 : 0; plate.rotation.y = turn;
      door.rotation.y = -doorAjar;
      ctx.fillStyle = '#10140C'; ctx.fillRect(0, 0, 512, 232);
      if (text) { ctx.fillStyle = PAL.lime; ctx.font = '700 150px Fredoka'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 124); }
      dtex.needsUpdate = true;
    },
  };
}

/** Power strip with the microwave's plug (unplug moves the plug up and out). */
export function buildPlug(scene, at, rotY = 0) {
  const g = new THREE.Group(); g.position.set(...at); g.rotation.y = rotY; scene.add(g);
  const strip = shadow(box(0.22, 0.04, 0.06, flat('#F2EEE3'))); strip.position.y = 0.02; g.add(strip);
  const sw = box(0.03, 0.012, 0.025, flat('#C9673F')); sw.position.set(0.08, 0.045, 0); g.add(sw);
  for (const x of [-0.07, 0.0]) { const s = box(0.035, 0.004, 0.035, flat('#DCD6C8')); s.position.set(x, 0.041, 0); g.add(s); }
  const plug = new THREE.Group(); plug.position.set(-0.07, 0.04, 0); g.add(plug);
  const pb = shadow(box(0.04, 0.05, 0.03, flat('#2B2722'))); pb.position.y = 0.025; plug.add(pb);
  const cable = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.4, 6), flat('#2B2722'))); cable.position.set(0, 0.05, -0.2); cable.rotation.x = Math.PI / 2; plug.add(cable);
  return { group: g, plug, set(out) { plug.position.set(-0.07 - 0.04 * out, 0.04 + 0.12 * out, 0.05 * out); plug.rotation.z = 0.5 * out; } };
}

// ---------------------------------------------------------------- giant door cut-away (1 mm = 0.05 units; the ~120 mm wave = 6.0)
export const GD = { mm: 0.05, lambda: 6.0, hole: 0.05, pitch: 0.08, waveY: 3.0, A: 0.8, sheetW: 12.8, sheetH: 8.96 };   // sheet = 10 x 7 texture tiles (16 x 16 holes each)

export function buildGiantDoor(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  // warm oven interior behind (z < 0), café-dark outside (z > 0)
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshBasicMaterial({ color: '#5B3A1E', toneMapped: false })); inside.position.set(0, 4, -18); g.add(inside);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), flat('#2B241C')); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; floor.receiveShadow = true; g.add(floor);
  // the perforated sheet (pivot at its left edge so the bent-door gap can open at the right edge)
  const pivot = new THREE.Group(); pivot.position.set(-GD.sheetW / 2, 0, 0); g.add(pivot);
  const tex = perforated(16, 16, GD.hole / GD.pitch, '#B4B1A8'); tex.repeat.set(GD.sheetW / (16 * GD.pitch), GD.sheetH / (16 * GD.pitch));
  const sheetM = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.1, color: '#FFFFFF' });
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(GD.sheetW, GD.sheetH), sheetM); sheet.position.set(GD.sheetW / 2, GD.waveY, 0); pivot.add(sheet);
  const edge = shadow(box(0.12, GD.sheetH, 0.12, flat('#8C8A83', { metalness: 0.3 }))); edge.position.set(GD.sheetW, GD.waveY, 0); pivot.add(edge);
  // "acts like solid metal" overlay (what the long wave effectively meets)
  const solidM = new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const solid = new THREE.Mesh(new THREE.PlaneGeometry(GD.sheetW, GD.sheetH), solidM); solid.position.set(GD.sheetW / 2, GD.waveY, -0.02); pivot.add(solid);
  // oven body frame on the right (the door closes against it)
  const body = shadow(box(1.6, GD.sheetH + 1, 3.0, flat('#E8E2D6'))); body.position.set(GD.sheetW / 2 + 0.85, GD.waveY, -1.4); g.add(body);
  // waves: incident (lime), reflected (pale lime), leak through the gap (lime)
  const inc = buildRibbon(g, PAL.lime, 420), ref = buildRibbon(g, '#E9FFB8', 420, 0.8), leak = buildRibbon(g, PAL.lime, 200);
  // rulers: one wavelength (along z) and one hole (along x)
  const ruler = (len, axis) => {
    const r = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: PAL.paper, toneMapped: false });
    const bar = new THREE.Mesh(axis === 'z' ? new THREE.BoxGeometry(0.06, 0.03, len) : new THREE.BoxGeometry(len, 0.006, 0.004), m); r.add(bar);
    for (const s of [-1, 1]) {
      const tk = new THREE.Mesh(axis === 'z' ? new THREE.BoxGeometry(0.5, 0.03, 0.06) : new THREE.BoxGeometry(0.004, 0.03, 0.004), m);
      if (axis === 'z') tk.position.z = s * len / 2; else tk.position.x = s * len / 2; r.add(tk);
    }
    g.add(r); return r;
  };
  const lamRuler = ruler(GD.lambda, 'z'), holeRuler = ruler(GD.hole, 'x');
  // light rays through holes (warm, additive thin beams), placed on a grid of real hole centres near the wave axis
  const NR = 40, rays = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0035, 0.0035, 1, 5), new THREE.MeshBasicMaterial({ color: '#FFE7B0', transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), NR);
  rays.frustumCulled = false; g.add(rays);
  // exact hole centres (texture tiles start at the sheet's bottom-left corner; canvas rows run from the tile top, flipY)
  const holes = [], tileW = 16 * GD.pitch, x0 = -GD.sheetW / 2, y0 = GD.waveY - GD.sheetH / 2;
  for (let m = 0; m < 7; m++) for (let r = 0; r < 16; r++) for (let n = 0; n < 10; n++) for (let k = 0; k < 16; k++) {
    const x = x0 + n * tileW + (r % 2 ? k : k + 0.5) * GD.pitch, y = y0 + (m + 1) * tileW - (r + 0.5) * GD.pitch;
    if (Math.abs(x) < 0.42 && Math.abs(y - GD.waveY) < 0.42) holes.push(V(x, y, 0));
  }
  holes.sort((a, b) => a.distanceTo(V(0, GD.waveY, 0)) - b.distanceTo(V(0, GD.waveY, 0)));
  return {
    group: g, pivot, solidM, inc, ref, leak, lamRuler, holeRuler, rays, holes,
    sheetCentre: V(0, GD.waveY, 0),
    setRays(on, t) {
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(0, 0, 1)), s = new THREE.Vector3();
      let n = 0;
      for (const h of holes) {
        if (n >= NR) break;
        const len = 2.6 * on, p = h.clone().add(V(0, 0, -1.2 + len / 2 + 0.04 * Math.sin(t * 3 + n)));
        s.set(1, Math.max(0.001, len), 1); m4.compose(p, q, s); rays.setMatrixAt(n++, m4);
      }
      rays.instanceMatrix.needsUpdate = true; rays.visible = on > 0.01;
    },
  };
}
