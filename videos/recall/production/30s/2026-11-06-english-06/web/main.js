// Entry: the low-poly café + performer + lime phone from feedback round 01, a small Bluetooth speaker on the counter,
// and the giant desk-top (compass-needle grid, giant phone + compass chip, GPS satellites, giant speaker, steel plate);
// renders any frame deterministically.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildPhone, buildSpeaker, buildGiantCompass, buildTrail, TABLE, GPHONE, PAL } from './lowpoly.js';
import { makeChoreo, fieldAt, deflect, chipAt, SPEAKER_POS, GIANT, MAG_AT, STEEL_AT } from './choreo.js';
import { drawMap } from './screen.js';
import { drawOverlay } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 36px Fredoka', '600 38px Fredoka', '700 110px Fredoka'].map(f => document.fonts.load(f)));
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')));
  const fontCheck = texts.every(s => document.fonts.check('600 56px Fredoka', s));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d');
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; S.R = R;
  const scene = new THREE.Scene(); scene.background = col('#2A1E15'); scene.fog = new THREE.Fog('#3A2A1D', 3.2, 9); S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.01, 80);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  // lights: warm window key, cool fill, warm bounce (unchanged from feedback round 01)
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  scene.add(new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75));
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene); S.phone = buildPhone(scene);
  S.speaker = buildSpeaker(scene); S.speaker.group.position.set(...SPEAKER_POS);
  S.gCanvas = document.createElement('canvas'); S.gCanvas.width = 720; S.gCanvas.height = 1520; S.gctx = S.gCanvas.getContext('2d');
  S.G = buildGiantCompass(scene, GIANT, S.gCanvas);
  S.trail = buildTrail(scene);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), Y = V(0, 1, 0), ONE = V(1, 1, 1), ZERO = V(0, 0, 0);

function applyFrame(f) {
  const t = f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues;
  // ---------------- performer + real phone (resting on the palm, facing the eyes; as in feedback round 01)
  const q = ch.person(t); S.person.apply(q);
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  const scr = ch.screen(t);
  const arm = S.person.arms[1], wrist = arm.hand.getWorldPosition(V(0, 0, 0)), elbow = arm.el.getWorldPosition(V(0, 0, 0));
  const fdir = wrist.clone().sub(elbow).normalize(), palmC = wrist.clone().add(fdir.clone().multiplyScalar(0.04));
  const toHead = head.clone().sub(palmC).normalize();
  const phonePos = palmC.clone().add(toHead.multiplyScalar(0.03)).add(fdir.multiplyScalar(0.035));
  S.phone.group.position.copy(phonePos); S.phone.group.lookAt(head); S.phone.group.rotateZ(scr.rot || 0);
  S.phone.group.rotateX(0.18 * (1 - q.phoneUp));
  S.phone.group.updateMatrixWorld(true);
  const phoneN = V(0, 0, 1).applyQuaternion(S.phone.group.quaternion);
  const insert = shot.id === 'hook_cu' || shot.id === 'fixed_cu';
  S.person.root.visible = !insert;   // POV insert: the camera is at the person's eye line
  drawMap(S.phone.ctx, 540, 1140, scr); S.phone.tex.needsUpdate = true;
  S.speaker.led.material.color.set(Math.sin(t * 9) > -0.2 ? PAL.lime : '#5E7A33');
  const beat = 1 + 0.07 * Math.max(0, Math.sin(t * 2 * Math.PI * 2)) ** 3;   // the speaker is playing: end rings pulse on the beat
  S.speaker.rings.forEach(r => r.scale.setScalar(beat));
  // figure-8 trail (beads along the path the phone has traced so far)
  const F = ch.f8(t);
  const showTrail = shot.id === 'fig8' && F.on;
  S.trail.visible = showTrail;
  if (showTrail) {
    const w0 = 2 * Math.PI * 2 * F.u, base = phonePos.clone().sub(V(0.11 * Math.sin(w0), 0.055 * Math.sin(2 * w0), 0)), n = S.trail.count;
    for (let i = 0; i < n; i++) {
      const u = F.u * i / (n - 1), w = 2 * Math.PI * 2 * u, age = F.u - u;
      const p = base.clone().add(V(0.11 * Math.sin(w), 0.055 * Math.sin(2 * w), 0.03));
      const s = 0.0055 * clamp(1 - age * 1.2, 0.35, 1);
      M4.compose(p, Q.identity(), V(s, s, s)); S.trail.setMatrixAt(i, M4);
    }
    S.trail.instanceMatrix.needsUpdate = true;
  }
  // ---------------- giant desk
  const G = S.G, gs = ch.giant(t), P = {}, T = TABLE, org = V(...GIANT);
  const giantShot = shot.id.startsWith('giant');
  G.group.visible = giantShot;
  if (giantShot) {
    G.phone.position.set(gs.phone[0], T.top + GPHONE.t / 2, gs.phone[1]);
    G.spk.group.visible = gs.magOn; G.spk.group.position.set(gs.magX, T.top, MAG_AT[1]);
    G.steel.visible = gs.steelOn; G.steel.position.set(STEEL_AT[0], T.top, gs.steelZ);
    const st = gs.st;
    const hide = (x, z) => (Math.abs(x - gs.phone[0]) < 0.66 && Math.abs(z - gs.phone[1]) < 1.2) ||
      (st.mag && Math.abs(x - st.mag[0]) < 0.92 && Math.abs(z - st.mag[1]) < 0.68) || (st.steel && Math.abs(x - st.steel[0]) < 0.88 && Math.abs(z - st.steel[1]) < 1.12);
    G.cells.forEach((c, i) => {
      const [bx, bz] = fieldAt(c.x, c.z, st), a = Math.atan2(-bx, -bz), h = hide(c.x, c.z);
      const sc = h ? 0.0001 : 1;
      M4.compose(V(c.x, T.top + 0.015, c.z), Q.identity(), V(sc, sc, sc)); G.discs.setMatrixAt(i, M4);
      M4.compose(V(c.x, T.top + 0.03, c.z), Q.setFromAxisAngle(V(1, 0, 0), Math.PI / 2), V(sc, sc, sc)); G.rims.setMatrixAt(i, M4);
      M4.compose(V(c.x, T.top + 0.075, c.z), Q.setFromAxisAngle(Y, a), V(sc, sc, sc)); G.north.setMatrixAt(i, M4); G.south.setMatrixAt(i, M4);
    });
    for (const m of [G.discs, G.rims, G.north, G.south]) m.instanceMatrix.needsUpdate = true;
    // compass chip: lifts out of the phone (exploded view) and its needle reads the field at the chip
    const cxz = chipAt(gs.phone), bChip = fieldAt(cxz[0], cxz[1], st), dChip = deflect(bChip);
    G.chip.position.y = GPHONE.t / 2 + 0.55 * gs.chipLift;
    G.chipNeedle.rotation.y = Math.atan2(-bChip[0], -bChip[1]);
    G.chipM.emissiveIntensity = 0.25 + 1.2 * gs.chipGlow;
    G.stalk.visible = gs.chipLift > 0.02;
    G.stalk.scale.y = Math.max(0.001, 0.55 * gs.chipLift); G.stalk.position.set(GPHONE.chip[0], GPHONE.t / 2 + 0.275 * gs.chipLift, GPHONE.chip[1]);
    G.chipSpot.material.opacity = 0.35 * gs.chipLift;
    // giant screen: the phone believes north is where the field points, so the beam turns the opposite way
    drawMap(S.gctx, 720, 1520, { ang: -dChip, width: 0.3 + 0.5 * gs.unsure, pulse: gs.dotPing, glow: gs.screenGlow }); G.tex.needsUpdate = true;
    // GPS satellites -> the dot
    G.phone.updateMatrixWorld(true);
    const dot = G.phone.localToWorld(V((240 / 540 - 0.5) * 0.92, GPHONE.t / 2 + 0.02, (660 / 1140 - 0.5) * 0.92 / 0.4737));
    G.sats.forEach((s, i) => { s.visible = gs.sat > 0.01; s.rotation.y = i * 0.9 + 0.15 * Math.sin(t * 0.7 + i); });
    let k = 0;
    G.sats.forEach((s, i) => {
      const sp = s.getWorldPosition(V(0, 0, 0)), b = G.beams[i], dir = dot.clone().sub(sp), len = dir.length();
      b.visible = gs.beam > 0.01; b.material.opacity = 0.45 * gs.beam;
      b.position.copy(sp.clone().add(dot).multiplyScalar(0.5).sub(org)); b.quaternion.setFromUnitVectors(Y, dir.clone().normalize()); b.scale.set(1, len, 1);
      for (let j = 0; j < 4; j++) {
        const u = ((gs.pulseT * 0.75 + j / 4 + i * 0.13) % 1 + 1) % 1, on = gs.beam > 0.05 && gs.pulseT > 0;
        M4.compose(sp.clone().lerp(dot, u).sub(org), Q.identity(), on ? ONE : V(1e-4, 1e-4, 1e-4)); G.pulses.setMatrixAt(k++, M4);
      }
    });
    G.pulses.instanceMatrix.needsUpdate = true;
    G.dotRing.position.copy(dot.clone().sub(org)); G.dotRing.scale.setScalar(1 + 2.5 * gs.dotPing); G.dotRing.material.opacity = 0.9 * (1 - gs.dotPing) * (gs.dotPing > 0 ? 1 : 0);
    // Earth-field streaks flowing north (fade and thin out when "weak")
    G.streaks.visible = gs.streaks > 0.01; G.streaks.material.opacity = 0.75 * gs.streaks;
    for (let i = 0; i < G.streaks.count; i++) {
      const x = -2.5 + (i % 8) * 0.71 + 0.18 * Math.sin(i * 7.1), ph = (i * 0.618) % 1;
      const z = 3.5 - (((t * 0.32 + ph) % 1) * 7.0);
      M4.compose(V(x, T.top + 0.34 + 0.05 * Math.sin(i), z), Q.identity(), V(1, 1, 1)); G.streaks.setMatrixAt(i, M4);
    }
    G.streaks.instanceMatrix.needsUpdate = true;
  }
  S.trail.visible = S.trail.visible && !giantShot;
  S.cafe.group.visible = S.person.root.visible = S.phone.group.visible = S.speaker.group.visible = !giantShot;
  if (!giantShot) S.person.root.visible = !insert;
  // ---------------- camera + key light
  const cam = ch.camera(t, { head, phone: phonePos, phoneNormal: phoneN, chip: giantShot ? G.chip.getWorldPosition(V(0, 0, 0)) : ZERO });
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  if (giantShot) {   // re-project anchors with the final camera
    {
      const G2 = S.G; G2.phone.updateMatrixWorld(true);
      const dot = G2.phone.localToWorld(V((240 / 540 - 0.5) * 0.92, GPHONE.t / 2 + 0.02, (660 / 1140 - 0.5) * 0.92 / 0.4737));
      P.dot = project(dot); P.dotPt = P.dot;
      P.chip = project(G2.chip.getWorldPosition(V(0, 0, 0)).add(V(0, 0.08, 0)));
      P.field = project(org.clone().add(V(0.9, T.top + 0.35, 0.2)));
      P.mag = project(G2.spk.group.getWorldPosition(V(0, 0, 0)).add(V(0, 1.1, 0)));
      P.steel = project(G2.steel.getWorldPosition(V(0, 0, 0)).add(V(0, 0.12, 0)));
      P.phoneG = project(G2.phone.getWorldPosition(V(0, 0, 0)).add(V(0, 0.1, 0)));
    }
  }
  if (shot.id === 'fig8') P.f8 = project(phonePos);
  const focus = giantShot ? org.clone().add(V(0, 0.5, 0)) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(giantShot ? V(-4.2, 6.5, -2.4) : V(-2.6, 3.4, -1.4)));
  const ext = giantShot ? 5.2 : 2.2;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 24 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? 10 : 2.6; S.scene.fog.far = giantShot ? 26 : 8;
  const safe = { shot: shot.id };
  if (!giantShot && !insert) safe.head = project(head).y;
  return { t, shot, P, safe };
}

window.__renderFrame = async (f) => {
  const { t, shot, P, safe } = applyFrame(f);
  S.R.render(S.scene, S.cam);
  const boxes = drawOverlay(S.octx, S.W, S.H, t, S.choreo.overlay(t), P, S.d.timeline, S.icon, S.capCache, shot.id);
  await new Promise(r => requestAnimationFrame(() => r()));
  return { boxes, safe, shot: shot.id };
};
window.__sheetPoses = () => [];
