// Entry: the low-poly café + performer from feedback round 01 with a fridge and a window thermometer, a giant cutaway fridge
// whose refrigerant loop carries heat from the inside coils to the outside coils (heat bits + fluid blobs coloured by
// temperature), the door-open loop with the motor's heat, and a room cutaway with an air conditioner venting outdoors;
// renders any frame deterministically, plus a separate vertical thumbnail ("sheet" pose "thumbnail").
// Frames are written from an explicit composite of the 3D and overlay canvases (english-09 fix).
import * as THREE from 'three';
import { buildCafe, buildPerson, buildFridge, buildThermometer, buildGiantFridge, buildGiantAC, buildPuffs, buildDots, polyPath, PAL, flat } from './lowpoly.js';
import { makeChoreo, ROOT, HOOK_POS, FRIDGE_POS, THERMO_POS, GIANT, ACG } from './choreo.js';
import { drawOverlay, drawThumbnail } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const HEAT = col('#FF9A3C'), MOTOR = col('#F0503C');

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 46px Fredoka', '700 36px Fredoka', '600 52px Fredoka', '700 78px Fredoka', '700 150px Fredoka'].map(f => document.fonts.load(f)));
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
  // lights: warm window key, cool fill, warm bounce (unchanged from feedback round 01)
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  scene.add(new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75));
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  // legs + shoes (english-13): the shared rig ends at the hips
  { const trou = flat('#3E4A57'), shoe = flat('#2B2722', { roughness: 0.6 }), L = new THREE.Group(); S.person.root.add(L);
    const hip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), trou); hip.position.set(0, 0.93, 0); hip.castShadow = true; L.add(hip);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.84, 7), trou); leg.position.set(sx * 0.085, 0.5, 0); leg.castShadow = true; L.add(leg);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.22), shoe); sh.position.set(sx * 0.09, 0.04, 0.035); sh.castShadow = true; L.add(sh);
    } }
  S.fridge = buildFridge(scene); S.fridge.group.position.set(...FRIDGE_POS);
  S.thermo = buildThermometer(scene, 0.11); S.thermo.position.set(...THERMO_POS);
  S.mist = buildPuffs(scene, 36, '#EAF6FF', 0.38);
  S.GF = buildGiantFridge(scene, GIANT); S.AC = buildGiantAC(scene, ACG);
  S.blobs = buildDots(scene, 34, 0.075, 1); S.heat = buildDots(scene, 120, 0.055, 0);
  S.cool = buildPuffs(scene, 26, '#9FD3F0', 0.42);
  // the door-open loop (giant-fridge local coordinates, origin at the fridge floor)
  S.loop = polyPath([[0.5, 1.6, 2.6], [0.35, 2.2, 0.7], [0.2, 3.0, -0.35], [0.2, 2.7, -1.3], [0.25, 3.5, -2.0], [0.3, 4.7, -1.3], [0.4, 4.7, 1.5], [0.5, 3.0, 2.6], [0.5, 1.6, 2.6]]);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {}; S.last = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3();
const frac = x => x - Math.floor(x);
function setDot(mesh, i, p, sc, c) { m4.compose(p, q4.identity(), s4.set(sc, sc, sc)); mesh.setMatrixAt(i, m4); mesh.setColorAt(i, c); }
function hideFrom(mesh, i0) { for (let i = i0; i < mesh.count; i++) { m4.makeScale(0, 0, 0); mesh.setMatrixAt(i, m4); } }

/** refrigerant colour along the loop (s in 0..1): cold blue → warmer (absorbing) → hot after the compressor → cooled → cold after the valve */
function fluidColor(s, mk) {
  const blue = col('#4FA3E0'), pale = col('#A9D8F2'), hot = col('#F0503C'), warm = col('#F2A65A'), cream = col('#F2EEE3');
  if (s < mk.evapEnd) return blue.clone().lerp(pale, s / mk.evapEnd);
  if (s < mk.compA) return pale;
  if (s < mk.compB) return pale.clone().lerp(hot, (s - mk.compA) / (mk.compB - mk.compA));
  if (s < mk.condEnd) { const u = (s - mk.compB) / (mk.condEnd - mk.compB); return u < 0.5 ? hot.clone().lerp(warm, u * 2) : warm.clone().lerp(cream, (u - 0.5) * 2); }
  return cream.clone().lerp(blue, (s - mk.condEnd) / (1 - mk.condEnd));
}

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues;
  const giantShot = shot.id.startsWith('giant');
  // ---------------- café fridge, mist, thermometer
  const dOpen = ch.door(t), fr = S.fridge;
  fr.door.rotation.y = -1.85 * dOpen; fr.lamp.intensity = 2.6 * dOpen; S.fridge.group.updateMatrixWorld(true);
  S.thermo.userData.setTemp(ch.thermo(t));
  S.mist.visible = dOpen > 0.05 && !giantShot;
  if (S.mist.visible) {
    for (let i = 0; i < S.mist.count; i++) {
      const ph = frac(t * 0.32 + i * 0.173), a = i * 2.39;
      const base = V(FRIDGE_POS[0] + 0.05 * Math.cos(a), 0.55 + 0.9 * frac(i * 0.37), FRIDGE_POS[2] + 0.36);
      const p = base.add(V(0.12 * Math.sin(a) * ph, -0.5 * ph * ph, 0.35 * ph + 0.05 * Math.sin(t + i)));   // cold air spills out and sinks
      const w = (0.07 + 0.12 * ph) * Math.sin(Math.PI * ph) * dOpen;
      m4.compose(p, S.cam.quaternion, s4.set(w, w * 0.8, w)); S.mist.setMatrixAt(i, m4);
    }
    S.mist.instanceMatrix.needsUpdate = true;
  }
  // ---------------- performer: beside the fridge (hook/react) or at the counter (CTA)
  const q = ch.person(t, shot.id), atCounter = shot.id === 'cafe_wide';
  q.pos = atCounter ? ROOT : HOOK_POS; if (atCounter) q.yaw = 0;
  const root = V(...q.pos);
  S.person.apply(Object.assign({}, q, { handR: root.clone().add(V(0.27, 0.92, 0.05)), handL: root.clone().add(V(-0.27, 0.92, 0.05)) }));
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  if (atCounter) { q.handR = V(0.22, 1.0, -0.32); q.handL = V(-0.22, 1.0, -0.32); }
  else {
    const restL = root.clone().add(V(-0.25, 0.92, 0.08)), restR = root.clone().add(V(0.25, 0.92, 0.08));
    const handle = fr.handle.getWorldPosition(V(0, 0, 0));
    q.handL = restL.lerp(handle, q.grabDoor);
    const fanP = head.clone().add(V(0.14 + 0.05 * Math.sin(t * 14), -0.1 + 0.03 * Math.cos(t * 14), 0.14));
    q.handR = restR.lerp(fanP, q.fan);
  }
  S.person.apply(q);
  // ---------------- giant fridge: refrigerant blobs + heat bits
  const G = S.GF, gs = ch.giant(t), org = V(...GIANT), Fo = org.clone().add(V(0, G.Y0, 0)), P = {};
  G.group.visible = shot.id.startsWith('giant') && shot.id !== 'giant_ac'; S.AC.group.visible = shot.id === 'giant_ac'; S.AC.thermo.visible = S.AC.group.visible; G.thermo.visible = G.group.visible;
  for (const o of [S.cafe.group, S.person.root, fr.group, S.thermo]) o.visible = !giantShot;
  S.blobs.visible = G.group.visible; S.heat.visible = giantShot; S.cool.visible = shot.id === 'giant_ac';
  G.door.rotation.y = -1.55 * gs.door;
  G.compressor.scale.set(1 + 0.05 * gs.squeeze, 1 - 0.08 * gs.squeeze, 1 + 0.05 * gs.squeeze);
  G.thermo.userData.setTemp(gs.thermo);
  if (S.blobs.visible) {
    const n = S.blobs.count;
    for (let i = 0; i < n; i++) { const s = frac(i / n + t * 0.045); setDot(S.blobs, i, Fo.clone().add(G.path.at(s)), 1, fluidColor(s, G.marks)); }
    S.blobs.instanceMatrix.needsUpdate = true; S.blobs.instanceColor.needsUpdate = true;
  }
  let k = 0;
  const H = S.heat;
  const absorbInside = (count, rate) => {      // from the food to the inside coils, where the heat is absorbed
    for (let i = 0; i < count && k < H.count; i++, k++) {
      const ph = frac(t * rate + i * 0.137), a = i * 2.17;
      const st = V(-0.2 + 0.15 * Math.sin(a), 1.3 + 1.3 * frac(i * 0.61), -0.1 + 0.5 * frac(i * 0.29));
      const en = V(0.15, 2.6 + 0.9 * frac(i * 0.43), -0.6 + 0.36 * frac(i * 0.71));
      const p = st.lerp(en, E.io(ph)).add(V(0, 0.05 * Math.sin(t * 3 + i), 0));
      setDot(H, k, Fo.clone().add(p), Math.sin(Math.PI * Math.min(1, ph * 1.15)), HEAT);
    }
  };
  const emitOutside = (count, rate, amt) => {  // from the outside coils into the room behind the fridge
    for (let i = 0; i < count && k < H.count; i++, k++) {
      const ph = frac(t * rate + i * 0.173);
      const st = V(0.15, 0.95 + 2.6 * frac(i * 0.37), -1.1 - 0.15 * frac(i * 0.53));
      const p = st.add(V(0.2 * Math.sin(i), 1.0 * ph, -1.3 * ph));
      setDot(H, k, Fo.clone().add(p), amt * Math.sin(Math.PI * ph), HEAT);
    }
  };
  if (shot.id === 'giant_pump') { absorbInside(40, 0.3); emitOutside(45, 0.35, 1.3 * seg(t, C.heatFlow, C.heatFlow + 0.6)); }
  if (shot.id === 'giant_inside') absorbInside(70, 0.32);
  if (shot.id === 'giant_back') emitOutside(80, 0.38, gs.release);
  if (shot.id === 'giant_loop') {
    const n = 70;
    for (let i = 0; i < n && k < H.count; i++, k++) {
      const s = frac(i / n + t * 0.11);
      setDot(H, k, Fo.clone().add(S.loop.at(s)).add(V(0.15 * Math.sin(i * 1.7), 0.1 * Math.sin(t * 2 + i), 0)), 1.7 * gs.loop, HEAT);
    }
    for (let i = 0; i < 18 && k < H.count; i++, k++) {   // the motor's own heat joins the stream behind the fridge
      const ph = frac(t * 0.42 + i * 0.211);
      const p = V(0.15, 0.55, -1.18).lerp(V(0.25, 3.5, -2.0), ph).add(V(0.12 * Math.sin(i * 2.3), 0, 0.1 * Math.cos(i)));
      setDot(H, k, Fo.clone().add(p), gs.motor * Math.sin(Math.PI * ph) * 2.0, MOTOR);
    }
  }
  if (shot.id === 'giant_ac') {
    const A = V(...ACG);
    for (let i = 0; i < 46 && k < H.count; i++, k++) {   // room heat drawn into the indoor unit
      const ph = frac(t * 0.33 + i * 0.149);
      const st = V(-1.6 + 2.6 * frac(i * 0.41), 1.0 + 1.6 * frac(i * 0.67), -0.6 + 1.5 * frac(i * 0.29));
      const p = st.lerp(V(0.6 + 0.5 * Math.sin(i), 3.6, -1.5), E.in(ph));
      setDot(H, k, A.clone().add(p), 1.5 * gs.acOn * Math.sin(Math.PI * Math.min(1, ph * 1.1)), HEAT);
    }
    for (let i = 0; i < 46 && k < H.count; i++, k++) {   // and released outdoors by the outdoor unit
      const ph = frac(t * 0.36 + i * 0.163);
      const p = V(2.95 + 0.3 * Math.sin(i), 0.8 + 0.6 * frac(i * 0.37), -0.8).add(V(1.2 * ph, 1.8 * ph, 0.7 * ph));
      setDot(H, k, A.clone().add(p), 1.6 * gs.acOut * Math.sin(Math.PI * ph), HEAT);
    }
    S.AC.fan.rotation.z = -t * 9 * gs.acOn;
    S.AC.thermo.userData.setTemp(gs.acThermo);
    for (let i = 0; i < S.cool.count; i++) {
      const ph = frac(t * 0.4 + i * 0.191);
      const p = A.clone().add(V(0.6 + 1.2 * (frac(i * 0.37) - 0.5), 3.45 - 1.6 * ph, -1.4 + 1.2 * ph));
      const w = (0.1 + 0.18 * ph) * Math.sin(Math.PI * ph) * gs.acOn;
      m4.compose(p, S.cam.quaternion, s4.set(w, w, w)); S.cool.setMatrixAt(i, m4);
    }
    S.cool.instanceMatrix.needsUpdate = true;
  }
  hideFrom(H, k); H.instanceMatrix.needsUpdate = true; if (H.instanceColor) H.instanceColor.needsUpdate = true;
  // ---------------- camera + key light
  const cam = ch.camera(t, { head });
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const focus = shot.id === 'giant_ac' ? V(...ACG).add(V(1, 1.5, 0)) : giantShot ? org.clone().add(V(0, 2, 0)) : V(-1.0, 1.0, -0.6);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(shot.id === 'giant_ac' ? V(-2.5, 6.0, 4.5) : giantShot ? V(3.0, 6.0, 3.6) : V(-2.6, 3.4, -1.4)));
  const ext = giantShot ? 5 : 2.6;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 24 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? 10 : 3.2; S.scene.fog.far = giantShot ? 30 : 9;
  // ---------------- overlay anchors (label positions as projected world points)
  const pin = (key, p, qq) => { P[key] = project(p); P[key + 'T'] = project(qq); };
  if (shot.id === 'hook_fridge') pin('warm', V(...THERMO_POS), V(THERMO_POS[0] + 0.05, THERMO_POS[1] - 0.32, THERMO_POS[2] + 0.2));
  if (shot.id === 'giant_pump') pin('out', Fo.clone().add(V(0.2, 2.6, -2.0)), Fo.clone().add(V(0.2, 3.9, -1.9)));
  if (shot.id === 'giant_inside') pin('evap', Fo.clone().add(V(0.15, 3.0, -0.4)), Fo.clone().add(V(0.2, 3.95, 0.3)));
  if (shot.id === 'giant_back') { pin('comp', Fo.clone().add(V(0.2, 0.5, -1.18)), Fo.clone().add(V(0.3, 0.1, -0.6))); pin('hot', Fo.clone().add(V(0.15, 2.3, -1.15)), Fo.clone().add(V(0.25, 3.35, -0.5))); }
  if (shot.id === 'giant_loop') pin('motor', Fo.clone().add(V(0.2, 0.6, -1.2)), Fo.clone().add(V(0.3, -0.1, -0.2)));
  if (shot.id === 'giant_ac') pin('ac', V(...ACG).add(V(3.0, 1.5, -0.8)), V(...ACG).add(V(2.9, 2.85, 0.4)));
  const safe = { shot: shot.id };
  if (shot.id === 'react' || shot.id === 'cafe_wide' || shot.id === 'hook_fridge') safe.head = project(head).y;
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
// The separate vertical thumbnail: the hook (open fridge on a hot day) with 2–4 large words.
window.__sheetPoses = () => ['thumbnail'];
window.__renderSheetPose = async () => {
  applyFrame(0, 3.0);
  S.cam.position.set(-1.0, 1.42, 1.75); S.cam.lookAt(-1.68, 1.42, -0.9); S.cam.fov = 46; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);   // thumbnail framing: face below the words
  S.R.render(S.scene, S.cam);
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
