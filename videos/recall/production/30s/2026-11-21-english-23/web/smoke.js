// english-23 props: café ceiling + photoelectric smoke alarm, toaster with burnt toast, kettle, broom, and the giant cut-away
// optical chamber (LED, beam, light trap, photodiode sensor, labyrinth vanes, drifting smoke/steam particles, scattered rays).
//
// Mechanism (US EPA "Photoelectric Technology", archived 2009; Nebraska State Fire Marshal, "Photoelectric smoke alarms"):
// a light source is aimed into a sensing chamber at an angle away from the sensor; in clean air the beam crosses the chamber
// without striking the photocell; smoke particles deflect (scatter) some light in all directions and some reaches the
// photocell; when enough light reaches it, the alarm is triggered. Sizes, colours and the drawn rays are illustrative.
import * as THREE from 'three';
import { PAL, flat } from './lowpoly.js';

const shadow = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const glow = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false, transparent: o < 1, opacity: o, depthWrite: o >= 1 });

export const CEIL = 2.55;
export const ALARM = V(-0.22, CEIL, -0.12);  // café alarm centre (on the ceiling, in front of the performer, clear of the pendant lamp)

/** Ceiling plane over the café + the real-size ceiling smoke alarm (cover with vent slots, LED, centre test button). */
export function buildCeilingAlarm(scene) {
  const g = new THREE.Group(); scene.add(g);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), flat('#EFE4CF')); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, CEIL, 1.4); ceil.receiveShadow = true; g.add(ceil);
  for (let i = -6; i <= 6; i++) { const b = box(0.06, 0.05, 8, flat('#D9C7A8')); b.position.set(i * 0.9, CEIL - 0.025, 1.4); g.add(b); }   // ceiling battens
  const a = new THREE.Group(); a.position.copy(ALARM); g.add(a);
  const base = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.012, 24), flat('#F4F1E8', { roughness: 0.6 }))); base.position.y = -0.006; a.add(base);
  const body = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.076, 0.07, 0.034, 24), flat('#F8FAF3', { roughness: 0.55 }))); body.position.y = -0.029; a.add(body);
  const face = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.056, 0.012, 24), flat('#ECE8DC', { roughness: 0.6 }))); face.position.y = -0.051; a.add(face);
  for (let i = 0; i < 18; i++) {   // vent slots around the side
    const s = box(0.006, 0.02, 0.004, flat('#3A3A33')); const ang = i / 18 * Math.PI * 2;
    s.position.set(Math.cos(ang) * 0.0735, -0.03, Math.sin(ang) * 0.0735); s.rotation.y = -ang; a.add(s);
  }
  const btn = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.008, 16), flat(PAL.lime, { roughness: 0.5 }))); btn.position.y = -0.06; a.add(btn);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 10, 8), glow('#5A6B3A')); led.position.set(0.037, -0.058, 0.02); a.add(led);
  const ledHalo = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 10), new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); ledHalo.position.copy(led.position); a.add(ledHalo);
  // blaring rings (sound), drawn as thin lime tori below the alarm
  const rings = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 6, 40), new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })); r.rotation.x = Math.PI / 2; r.position.y = -0.07; a.add(r); return r; });
  return {
    group: g, alarm: a, btn,
    /** ledOn 0..1 (lime flash), ring phase 0..1 per ring or null, press depth 0..1 */
    set({ ledOn = 0, blare = 0, t = 0, press = 0 }) {
      led.material.color.set(ledOn > 0.5 ? PAL.lime : '#5A6B3A'); ledHalo.material.opacity = 0.75 * ledOn;
      rings.forEach((r, i) => { const ph = (t * 2.2 + i / 3) % 1; const s = 0.09 + ph * 0.32; r.scale.set(s, s, s * 0.6 + 0.4); r.material.opacity = blare * (1 - ph) * 0.9; r.position.y = -0.07 - ph * 0.12; });
      btn.position.y = -0.06 + 0.005 * press;
    },
  };
}

/** Toaster with two slices that pop up (burnt). */
export function buildToaster(scene, at) {
  const g = new THREE.Group(); g.position.set(...at); g.rotation.y = Math.PI / 2; scene.add(g);   // slots across, so the slices face the camera
  const bodyM = flat('#E9E1D0', { roughness: 0.45, metalness: 0.15 });
  const body = shadow(box(0.26, 0.17, 0.15, bodyM)); body.position.y = 0.085; g.add(body);
  const topM = flat('#CFC5B1', { roughness: 0.4, metalness: 0.2 });
  const top = shadow(box(0.262, 0.012, 0.152, topM)); top.position.y = 0.175; g.add(top);
  for (const x of [-0.055, 0.055]) { const slot = box(0.03, 0.014, 0.11, flat('#26221C')); slot.position.set(x, 0.18, 0); g.add(slot); }
  const lever = shadow(box(0.03, 0.02, 0.03, flat(PAL.lime))); lever.position.set(0.14, 0.1, 0.0); g.add(lever);
  for (const x of [-0.11, 0.11]) { const foot = box(0.03, 0.01, 0.12, flat('#2B2620')); foot.position.set(x, 0.005, 0); g.add(foot); }
  const toastM = flat('#3B2416', { roughness: 0.9 }), crustM = flat('#24160D', { roughness: 0.95 });
  const slices = [-0.055, 0.055].map(x => {
    const s = new THREE.Group(); s.position.set(x, 0.11, 0); g.add(s);
    const bread = shadow(box(0.018, 0.12, 0.1, toastM)); s.add(bread);
    const crust = shadow(box(0.02, 0.016, 0.104, crustM)); crust.position.y = 0.064; s.add(crust);
    return s;
  });
  return { group: g, set(pop) { slices.forEach((s, i) => { s.position.y = 0.11 + 0.08 * pop + (i ? 0.004 : 0); s.rotation.x = (i ? -0.06 : 0.05) * pop; }); }, mouth: V(at[0], at[1] + 0.2, at[2]) };
}

/** Low-poly kettle (steam comes from the spout). */
export function buildKettle(scene, at) {
  const g = new THREE.Group(); g.position.set(...at); scene.add(g);
  const m = flat('#C9673F', { roughness: 0.5 });
  const body = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.17, 10), m)); body.position.y = 0.085; g.add(body);
  const lid = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.075, 0.03, 10), m)); lid.position.y = 0.185; g.add(lid);
  const knob = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), flat(PAL.lime))); knob.position.y = 0.21; g.add(knob);
  const spout = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.024, 0.12, 7), m)); spout.position.set(0.1, 0.13, 0); spout.rotation.z = -0.9; g.add(spout);
  const handle = shadow(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 5, 10, Math.PI), flat('#2B2620'))); handle.position.set(-0.07, 0.12, 0); handle.rotation.z = Math.PI / 2; g.add(handle);
  return { group: g, spout: V(at[0] + 0.15, at[1] + 0.17, at[2]) };
}

/** Broom: pole along +y from the origin (length L) + brush head at the bottom. */
export function buildBroom(scene) {
  const g = new THREE.Group(); scene.add(g);
  const L = 1.35;
  const pole = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, L, 8), flat('#B98557'))); pole.position.y = L / 2; g.add(pole);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 0.03, 8), flat(PAL.lime)); cap.position.y = L - 0.012; g.add(cap);
  const head = shadow(box(0.26, 0.05, 0.06, flat('#5B3E2A'))); head.position.y = -0.025; g.add(head);
  const bristles = shadow(box(0.25, 0.09, 0.05, flat('#D9B66A'))); bristles.position.y = -0.095; g.add(bristles);
  return { group: g, L };
}

// ---------------------------------------------------------------- giant cut-away chamber
export const CH = { R: 2.3, H: 0.9, led: V(-1.75, 0.45, -0.55), trap: V(1.85, 0.45, -0.55), sensor: V(0.2, 0.45, -1.75) };   // sensor at the back, facing the beam's middle at 90°

/** The oversized optical chamber (origin on the floor of the chamber). */
export function buildChamber(scene, origin) {
  const g = new THREE.Group(); g.position.set(...origin); scene.add(g);
  const floorM = flat('#3A4336', { roughness: 0.9 }), vaneM = flat('#262C23', { roughness: 0.8 }), rimM = flat('#4A5544');
  const floor = shadow(new THREE.Mesh(new THREE.CylinderGeometry(CH.R + 0.25, CH.R + 0.35, 0.18, 40), floorM), false, true); floor.position.y = -0.09; g.add(floor);
  const plinth = shadow(new THREE.Mesh(new THREE.CylinderGeometry(CH.R + 0.6, CH.R + 0.7, 0.12, 40), flat('#ECE8DC', { roughness: 0.6 })), false, true); plinth.position.y = -0.24; g.add(plinth);   // the alarm's off-white shell, cut away
  // labyrinth vanes around the rim (let smoke in, keep room light out) — back half only, so the camera sees inside
  for (let i = 0; i < 26; i++) {
    const a = Math.PI * 0.95 + (i / 25) * Math.PI * 1.1;
    const v = shadow(box(0.55, CH.H, 0.08, vaneM)); v.position.set(Math.cos(a) * CH.R, CH.H / 2, Math.sin(a) * CH.R); v.rotation.y = -a + 0.7; g.add(v);
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(CH.R + 0.22, 0.06, 6, 48, Math.PI * 1.2), rimM); rim.rotation.x = Math.PI / 2; rim.rotation.z = Math.PI * 0.9; rim.position.y = CH.H; g.add(rim);
  // LED housing + lens
  const ledBox = shadow(box(0.42, 0.42, 0.42, flat('#CFCBBE'))); ledBox.position.copy(CH.led).add(V(-0.25, 0, 0)); g.add(ledBox);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), glow(PAL.lime)); lens.position.copy(CH.led); g.add(lens);
  // light trap on the far side (absorbs the beam)
  const trap = shadow(new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.6, 12, 1, true), flat('#090B08', { side: THREE.DoubleSide }))); trap.position.copy(CH.trap); trap.rotation.z = -Math.PI / 2; g.add(trap);
  // photodiode sensor, off the beam axis (front): dark dome on a block, ring glows with received light
  const sBlock = shadow(box(0.5, 0.5, 0.4, flat('#CFCBBE'))); sBlock.position.copy(CH.sensor).add(V(0, 0, -0.28)); g.add(sBlock);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#1A2016', roughness: 0.2, metalness: 0.1, emissive: PAL.lime, emissiveIntensity: 0 }));
  dome.rotation.x = Math.PI / 2; dome.position.copy(CH.sensor).add(V(0, 0, -0.08)); g.add(dome);
  const sRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 28), glow('#3B4730')); sRing.position.copy(CH.sensor).add(V(0, 0, -0.08)); g.add(sRing);
  const sHalo = new THREE.Mesh(new THREE.SphereGeometry(0.27, 16, 12), new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); sHalo.position.copy(CH.sensor).add(V(0, 0, -0.02)); g.add(sHalo);
  // beam: additive translucent cylinder LED -> trap
  const len = CH.trap.x - CH.led.x;
  const beamM = new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, len, 16, 1, true), beamM); beam.rotation.z = Math.PI / 2; beam.position.copy(CH.led).add(V(len / 2, 0, 0)); g.add(beam);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, len, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#F4FFD8', transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); core.rotation.z = Math.PI / 2; core.position.copy(beam.position); g.add(core);
  // the lifted cover (off-white shell with vent ring) used for the "open it up" transformation
  const cover = new THREE.Group(); g.add(cover);
  const shell = shadow(new THREE.Mesh(new THREE.CylinderGeometry(CH.R + 0.5, CH.R + 0.65, 0.5, 40), flat('#F8FAF3', { roughness: 0.55 }))); shell.position.y = CH.H + 0.25; cover.add(shell);
  const btn = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 24), flat(PAL.lime))); btn.position.y = CH.H + 0.55; cover.add(btn);
  for (let i = 0; i < 30; i++) { const s = box(0.08, 0.28, 0.05, flat('#3A3A33')); const a = i / 30 * Math.PI * 2; s.position.set(Math.cos(a) * (CH.R + 0.6), CH.H + 0.25, Math.sin(a) * (CH.R + 0.6)); s.rotation.y = -a; cover.add(s); }
  // particles (smoke or steam) + scattered rays
  const NP = 70;
  const parts = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: '#C9C5BC', roughness: 0.85, flatShading: true }), NP);
  parts.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NP * 3).fill(0.6), 3); parts.frustumCulled = false; g.add(parts);
  const steam = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.88, toneMapped: false }), NP);
  steam.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NP * 3).fill(0.9), 3); steam.frustumCulled = false; g.add(steam);
  const NR = 220;
  const rays = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.011, 0.011, 1, 5), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), NR);
  rays.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NR * 3).fill(1), 3); rays.frustumCulled = false; g.add(rays);
  const NH = 14, hitM = new THREE.MeshBasicMaterial({ color: PAL.lime, transparent: true, opacity: 0.95, depthWrite: false, toneMapped: false });
  const hits = Array.from({ length: NH }, () => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 6), hitM); c.visible = false; g.add(c); return c; });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), Y = V(0, 1, 0), col = new THREE.Color(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  return {
    group: g, cover, lens, beam, core, sensor: CH.sensor,
    setBeam(on) { beamM.opacity = 0.28 * on; core.material.opacity = 0.55 * on; lens.material.color.set(on > 0.5 ? PAL.lime : '#4A5A30'); },
    setSensor(level) {   // level 0..1 = received light
      dome.material.emissiveIntensity = 1.6 * level; sHalo.material.opacity = 0.32 * level;
      sRing.material.color.lerpColors(new THREE.Color('#3B4730'), new THREE.Color(PAL.lime), Math.min(1, level * 2));
    },
    /** list: [{p: Vector3 (local), r, kind: 'smoke'|'steam', lit 0..1}] ; rays: [{a, b, c (0..1), hit}] */
    setParticles(list) {
      let ns = 0, nv = 0;
      for (const P of list) {
        sc.set(P.r, P.r, P.r); m4.compose(P.p, q.identity(), sc);
        if (P.kind === 'steam') { if (nv < NP) { steam.setMatrixAt(nv, m4); col.setRGB(0.86 + 0.12 * P.lit, 0.93 + 0.07 * P.lit, 0.97); steam.setColorAt(nv++, col); } }
        else if (ns < NP) { parts.setMatrixAt(ns, m4); col.setRGB(0.5 + 0.45 * P.lit, 0.5 + 0.5 * P.lit, 0.47 + 0.2 * P.lit); parts.setColorAt(ns++, col); }
      }
      for (let i = ns; i < NP; i++) parts.setMatrixAt(i, ZERO);
      for (let i = nv; i < NP; i++) steam.setMatrixAt(i, ZERO);
      for (const m of [parts, steam]) { m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true; }
    },
    setRays(list) {
      let n = 0, h = 0;
      for (const R of list) {
        const d = R.b.clone().sub(R.a), L = d.length();
        if (R.hit) { if (h < NH) { const c = hits[h++]; c.visible = true; c.position.copy(R.a).addScaledVector(d, 0.5); c.quaternion.setFromUnitVectors(Y, d.normalize()); c.scale.set(1, L, 1); c.material.opacity = 0.95 * R.c; } continue; }
        if (n >= NR) continue;
        q.setFromUnitVectors(Y, d.clone().normalize()); sc.set(1, L, 1); m4.compose(R.a.clone().addScaledVector(d, 0.5), q, sc); rays.setMatrixAt(n, m4);
        const k = R.c; col.setRGB(0.78 * k, 0.95 * k, 0.42 * k); rays.setColorAt(n++, col);
      }
      for (let i = n; i < NR; i++) rays.setMatrixAt(i, ZERO);
      for (; h < NH; h++) hits[h].visible = false;
      rays.instanceMatrix.needsUpdate = true; rays.instanceColor.needsUpdate = true;
    },
  };
}
