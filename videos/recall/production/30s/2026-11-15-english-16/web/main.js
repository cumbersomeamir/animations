// Entry: the low-poly café + performer from feedback round 01 hearing a voice note of themselves (frame 0 = the thumbnail
// composition), a miniature head cross-section where the voice reaches the inner ear by air (lime wave-fronts from the mouth to
// the ear canal) and by bone (amber pulses through the jaw and spine to the cochlea), a giant phone whose microphone only gets
// the air path, and the plug-your-ears-and-hum payoff; renders any frame deterministically, plus the thumbnail ("sheet" pose
// "thumbnail" = frame 0 + Recall pill). Frames are written from an explicit composite of the 3D and overlay canvases.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildPhone, buildHeadModel, buildCrescents, buildDots, drawVoiceNote, polyPath, hp, EAR, PAL, flat } from './lowpoly.js';
import { makeChoreo, ROOT, GIANT, PHONE_HOLD, PHONE_REST, GPHONE, AIR_PTS, BONE_JAW, BONE_SPINE } from './choreo.js';
import { drawOverlay, drawThumbnail } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const frac = x => x - Math.floor(x);
const AMBER = '#FFB347', DARK = col('#2A1E15');

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 46px Fredoka', '700 36px Fredoka', '600 52px Fredoka', '600 64px Fredoka', '700 78px Fredoka', '700 110px Fredoka'].map(f => document.fonts.load(f)));
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')));
  const fontCheck = texts.every(s => document.fonts.check('600 56px Fredoka', s));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d', { willReadFrequently: true });   // software 2D canvas (see __renderFrame)
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; S.R = R;
  const scene = new THREE.Scene(); scene.background = col('#2A1E15'); scene.fog = new THREE.Fog('#3A2A1D', 3.2, 9); S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.01, 80);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  // lights: warm window key, cool fill, warm bounce (unchanged from feedback round 01) + a soft face light for the close-ups
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  scene.add(new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75));
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.faceLight = new THREE.PointLight('#FFE2BF', 0.9, 1.6, 1.5); S.faceLight.position.set(0.3, 1.75, 0.0); scene.add(S.faceLight);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  { const trou = flat('#3E4A57'), shoe = flat('#2B2722', { roughness: 0.6 }), L = new THREE.Group(); S.person.root.add(L);   // legs + shoes (english-13)
    const hip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), trou); hip.position.set(0, 0.93, 0); hip.castShadow = true; L.add(hip);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.84, 7), trou); leg.position.set(sx * 0.085, 0.5, 0); leg.castShadow = true; L.add(leg);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.22), shoe); sh.position.set(sx * 0.09, 0.04, 0.035); sh.castShadow = true; L.add(sh);
    } }
  S.fingers = S.person.arms.map(a => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.017, 0.055, 0.017), flat('#A8714E')); f.position.set(0, -0.088, 0.004); f.castShadow = true; a.hand.add(f); return f; });
  S.phone = buildPhone(scene);
  // hook: sound from the phone's speaker toward the listener's face
  S.hookC = buildCrescents(scene, 8, PAL.lime, 0.16, 0.03);
  // giant set: the head cross-section, air wave-fronts, bone pulses, the giant phone
  S.M = buildHeadModel(scene, GIANT);
  S.airPath = polyPath(AIR_PTS.map(p => p.toArray())); S.jawPath = polyPath(BONE_JAW.map(p => p.toArray())); S.spinePath = polyPath(BONE_SPINE.map(p => p.toArray()));
  S.airC = buildCrescents(scene, 16, PAL.lime, 0.16, 0.035); S.M.group.add(S.airC);
  S.leaveC = buildCrescents(scene, 30, PAL.lime, 0.16, 0.03); S.M.group.add(S.leaveC);
  S.micC = buildCrescents(scene, 10, PAL.lime, 0.16, 0.035); S.M.group.add(S.micC);
  S.boneD = buildDots(scene, 18, 0.06, 0); S.M.group.add(S.boneD);
  S.gphone = buildPhone(scene, { fingers: false }); S.M.group.add(S.gphone.group);
  S.gphone.group.position.set(...GPHONE.pos); S.gphone.group.rotation.set(...GPHONE.rot);
  // payoff: small amber pulses inside the performer's head (drawn on top)
  S.plugD = buildDots(scene, 12, 0.0055, 0); S.plugD.material.depthTest = false; S.plugD.renderOrder = 30;
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), X = V(1, 0, 0), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const mB = new THREE.Matrix4();
const setC = (mesh, i, pos, dir, sc, c) => {   // crescent i at pos, bulging along dir, its arc turned toward the camera; scale sc, colour c
  const camL = mesh.parent && mesh.parent !== S.scene ? mesh.parent.worldToLocal(S.camPos.clone()) : S.camPos.clone();
  const x = dir.clone().normalize(), zt = camL.sub(pos).normalize(); let z = zt.sub(x.clone().multiplyScalar(zt.dot(x)));
  if (z.lengthSq() < 1e-6) z = V(0, 0, 1); z.normalize(); const y = z.clone().cross(x);
  mB.makeBasis(x, y, z); q4.setFromRotationMatrix(mB); m4.compose(pos, q4, s4.set(sc, sc, sc)); mesh.setMatrixAt(i, m4); mesh.setColorAt(i, c);
};
const hideAll = mesh => { for (let i = 0; i < mesh.count; i++) mesh.setMatrixAt(i, ZERO); mesh.instanceMatrix.needsUpdate = true; };
const tint = (base, a) => col(base).lerp(DARK, 1 - clamp(a));

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues, id = shot.id;
  const cam = ch.camera(t, {}); S.camPos = cam.pos.clone();
  const giantShot = id.startsWith('model');
  // ---------------- performer + phone
  const q = ch.person(t, id); q.pos = ROOT;
  if (q.humming > 0) q.headRoll += 0.012 * q.humming * Math.sin(2 * Math.PI * 11 * t);
  const restR = V(0.24, 1.0, -0.36), restL = V(-0.22, 1.0, -0.34);
  const holding = id === 'hook_phone' || id === 'react';
  const ph = S.phone.group;
  if (holding) { ph.position.set(...PHONE_HOLD.pos); ph.lookAt(V(...PHONE_HOLD.face)); }
  else { ph.position.set(...PHONE_REST.pos); ph.rotation.set(...PHONE_REST.rot); }
  ph.updateMatrixWorld(true);
  S.person.apply({ ...q, handR: undefined, handL: undefined });
  const headW = (x, y, z) => S.person.head.localToWorld(V(x, y, z));
  let handR = holding ? ph.localToWorld(V(0.0, -0.1, -0.012)) : restR, handL = restL;
  if (q.plug > 0) {   // wrists beside the head so the index fingers reach the ear openings
    handL = restL.clone().lerp(headW(-0.17, 0.0, 0.03), q.plug); handR = restR.clone().lerp(headW(0.17, 0.0, 0.03), q.plug);
    q.pole = [[-1, -0.55, 0.15], [1, -0.55, 0.15]];
  }
  q.handR = handR; q.handL = handL;
  S.person.apply(q);
  S.person.mouth.scale.x = 1 - 0.5 * (q.gasp || 0);
  if (q.plug > 0) for (const a of S.person.arms) {   // point each hand (and its finger) at the ear opening
    const ear = headW(a.s * 0.1, 0.1, 0.005), w = a.hand.getWorldPosition(V(0, 0, 0));
    const dirW = ear.clone().sub(w).normalize(), pq = a.hand.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
    a.hand.quaternion.setFromUnitVectors(V(0, -1, 0), dirW.applyQuaternion(pq));
  }
  S.fingers.forEach(fm => { fm.visible = q.plug > 0.05; });
  drawVoiceNote(S.phone, { mode: 'play', p: clamp(t / 4.4), t: 1 + t });
  // hook: lime wave-fronts from the speaker to the face
  if (holding && t < 3.12) {
    const spk = ph.localToWorld(V(0, 0.06, 0.008)), face = headW(0.075, 0.06, 0.06), dir = face.clone().sub(spk);
    for (let i = 0; i < 8; i++) {
      if (i >= 4) { S.hookC.setMatrixAt(i, ZERO); continue; }
      const u = frac(t * 1.1 + i / 4), p = spk.clone().lerp(face, 0.12 + 0.8 * u);
      setC(S.hookC, i, p, dir, 0.17 + 0.17 * u, tint(PAL.lime, 1.3 - u));
    }
    S.hookC.instanceMatrix.needsUpdate = true; S.hookC.instanceColor.needsUpdate = true; S.hookC.visible = true;
  } else S.hookC.visible = false;
  S.plugD.visible = false;
  // ---------------- the head model
  const M = S.M, ms = ch.model(t), org = V(...GIANT), P = {};
  M.group.visible = giantShot;
  for (const o of [S.cafe.group, S.person.root, ph]) o.visible = !giantShot;
  if (giantShot) {
    const vib = 0.5 + 0.5 * Math.sin(2 * Math.PI * 9 * t);
    M.folds.forEach((m, i) => { m.scale.x = 1 + 0.35 * Math.sin(2 * Math.PI * 9 * t + i * Math.PI); });
    M.foldM.emissiveIntensity = 0.25 + 0.35 * vib;
    const plugged = id === 'model_plug';
    const boneOn = id === 'model_bone' || id === 'model_only' || id === 'model_mic' || plugged;
    const airOn = id === 'model_air' || id === 'model_only' || plugged;
    M.finger.visible = plugged;
    M.boneM.emissiveIntensity = boneOn ? 0.1 + 0.22 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 7 * t)) : 0;
    M.bones.position.x = boneOn ? 0.006 * Math.sin(2 * Math.PI * 23 * t) : 0;
    // air wave-fronts mouth -> ear canal -> cochlea
    const nAir = id === 'model_intro' ? 1 : airOn ? 14 : 0, AP = S.airPath, inside = AP.sOf(6), block = AP.sOf(5);
    for (let i = 0; i < 16; i++) {
      if (i >= nAir) { S.airC.setMatrixAt(i, ZERO); continue; }
      let s = frac(t * 0.3 + i / 14); if (plugged) s *= block;   // plugged: the wave-fronts stop at the finger
      const p = AP.at(s), dir = AP.at(Math.min(0.999, s + 0.01)).sub(p);
      const sc = (s > inside ? 0.45 : 1.0) * (id === 'model_intro' ? 1.1 : 1);
      setC(S.airC, i, p, dir, sc, tint(PAL.lime, plugged ? 0.55 * clamp((block - s) * 6) : (id === 'model_only' ? 0.75 : 1) * clamp((1 - s) * 6 + 0.2)));
    }
    S.airC.instanceMatrix.needsUpdate = true; S.airC.instanceColor.needsUpdate = true;
    // bone pulses larynx -> jaw / spine -> cochlea
    const nBone = id === 'model_intro' ? 2 : boneOn ? 10 : 0;
    for (let i = 0; i < 18; i++) {
      if (i >= nBone) { S.boneD.setMatrixAt(i, ZERO); continue; }
      const path = i % 2 ? S.jawPath : S.spinePath, s = frac(t * 0.42 + Math.floor(i / 2) / 5 + (id === 'model_intro' ? 0.5 : 0)), p = path.at(s);
      m4.compose(p, q4.identity(), s4.setScalar((0.7 + 0.4 * Math.sin(Math.PI * s)) * (plugged ? 1.15 : 1))); S.boneD.setMatrixAt(i, m4); S.boneD.setColorAt(i, col(AMBER));
    }
    S.boneD.instanceMatrix.needsUpdate = true; S.boneD.instanceColor.needsUpdate = true;
    // cochlea glow: lime for air arrivals, amber for bone arrivals
    M.coM.emissive.set(id === 'model_bone' || plugged ? AMBER : PAL.lime);
    M.coM.emissiveIntensity = (0.2 + 0.45 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 2.4 * t)) * (airOn || boneOn ? 1 : 0.3)) * (plugged ? 1.6 : 1);
    M.drum.material.emissiveIntensity = airOn && !plugged ? 0.25 + 0.25 * vib : 0;
    // "only you": wave-fronts leave the mouth into the room and fade
    const mouth = hp(0.37, 0.448, 0.1);
    for (let i = 0; i < 30; i++) {
      if (!(id === 'model_only' || id === 'model_mic')) { S.leaveC.setMatrixAt(i, ZERO); continue; }
      const a = -1.15 + 2.3 * ((i * 7) % 30) / 29, tz = ((i * 13) % 5 - 2) * 0.22, dir = V(Math.cos(a), Math.sin(a), tz + 0.25);
      const u = frac(t * 0.42 + i / 30), dist = 0.25 + 3.2 * u;
      setC(S.leaveC, i, mouth.clone().add(dir.clone().normalize().multiplyScalar(dist)), dir, 0.8 + 1.6 * u, tint(PAL.lime, (1 - u) * 0.9 * ms.leave * (id === 'model_mic' ? 0.5 : 1)));
    }
    S.leaveC.instanceMatrix.needsUpdate = true; S.leaveC.instanceColor.needsUpdate = true;
    // the giant phone's microphone gets the air path only
    const gp = S.gphone.group; gp.visible = id === 'model_mic';
    gp.scale.setScalar(GPHONE.scale * (0.6 + 0.4 * E.back(clamp(ms.mic))));
    gp.updateMatrixWorld(true);
    const micW = gp.localToWorld(V(0, -0.074, 0.004)), mic = S.M.group.worldToLocal(micW.clone());
    for (let i = 0; i < 10; i++) {
      if (id !== 'model_mic') { S.micC.setMatrixAt(i, ZERO); continue; }
      const u = frac(t * 0.55 + i / 10), p = mouth.clone().lerp(mic, u);
      setC(S.micC, i, p, mic.clone().sub(mouth), 0.9 + 0.5 * u, tint(PAL.lime, ms.mic * clamp((1 - u) * 5)));
    }
    S.micC.instanceMatrix.needsUpdate = true; S.micC.instanceColor.needsUpdate = true;
    if (id === 'model_mic') drawVoiceNote(S.gphone, { mode: 'rec', p: seg(t, C.micIn, C.micIn + 4.2, E.lin), t: Math.max(0, t - C.micIn) });
    P.micAt = micW;
  }
  // ---------------- camera + key light
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const focus = giantShot ? org.clone().add(V(0.2, 2.3, 0)) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(giantShot ? V(2.2, 5.0, 6.0) : V(-2.6, 3.4, -1.4)));
  const ext = giantShot ? 4.5 : 2.2;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 24 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? 12 : 3.2; S.scene.fog.far = giantShot ? 32 : 9;
  S.faceLight.intensity = giantShot ? 0 : 0.9;
  // ---------------- overlay anchors
  const W = p => org.clone().add(p);
  const pin = (k, p, qq) => { const a = project(p), b = project(qq); P[k] = a; P[k + 'T'] = b; };
  if (id === 'model_air') pin('air', W(AIR_PTS[3]), W(AIR_PTS[3]).add(V(0.5, 0.7, 0)));
  if (id === 'model_bone') { pin('bone', W(BONE_JAW[2]), W(BONE_JAW[2]).add(V(0.9, -0.7, 0))); pin('inner', W(hp(...EAR.cochlea, 0.1)), W(hp(...EAR.cochlea, 0.1)).add(V(-0.2, 0.9, 0))); }
  if (id === 'model_only') pin('only', W(hp(...EAR.cochlea, 0.1)), W(hp(...EAR.cochlea, 0.1)).add(V(-0.35, 1.05, 0)));
  if (id === 'model_mic' && P.micAt) pin('mic', P.micAt, P.micAt.clone().add(V(0.0, 1.9, 0)));
  if (id === 'model_plug') pin('bonePath', W(BONE_JAW[2]), W(BONE_JAW[2]).add(V(0.8, -0.6, 0)));
  const safe = { shot: id };
  if (id === 'cafe_wide') safe.head = project(headW(0, 0.11, 0.02)).y;
  return { t, shot, P, safe };
}

window.__renderFrame = async (f) => {
  const { t, shot, P, safe } = applyFrame(f);
  S.R.render(S.scene, S.cam);
  const boxes = drawOverlay(S.octx, S.W, S.H, t, S.choreo.overlay(t, shot.id), P, S.d.timeline, S.icon, S.capCache, shot.id);
  S.octx.getImageData(0, 0, 1, 1);   // flush the overlay's draws before the frame is captured (english-09 fix)
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  return { boxes, safe, shot: shot.id };
};
// The thumbnail is frame 0 itself (the performer hearing the voice note + the title words) with the Recall pill added.
window.__sheetPoses = () => ['thumbnail'];
window.__renderSheetPose = async () => {
  const { t, shot, P } = applyFrame(0);
  S.R.render(S.scene, S.cam);
  drawOverlay(S.octx, S.W, S.H, t, S.choreo.overlay(t, shot.id), P, S.d.timeline, S.icon, S.capCache, shot.id);
  drawThumbnail(S.octx, S.W, S.H, S.icon);
  S.octx.getImageData(0, 0, 1, 1);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
};
/** Final frame composed explicitly (3D canvas, then the overlay canvas) and returned as PNG data. */
window.__composite = () => {
  if (!S.comp) { S.comp = document.createElement('canvas'); S.comp.width = S.W; S.comp.height = S.H; S.cctx = S.comp.getContext('2d'); }
  S.cctx.clearRect(0, 0, S.W, S.H);
  S.cctx.drawImage(document.getElementById('gl'), 0, 0); S.cctx.drawImage(document.getElementById('ov'), 0, 0);
  return S.comp.toDataURL('image/png');
};
