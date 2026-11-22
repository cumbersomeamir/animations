// Entry: the low-poly café + performer from feedback round 01 (E13 legs), now with a ceiling smoke alarm, a toaster with burnt toast,
// a kettle and a broom (english-23), plus the giant cut-away optical chamber (LED beam aimed away from the sensor, drifting smoke or
// steam particles that scatter light, the sensor that lights up). Frame 0 = the thumbnail composition (the alarm in curling smoke +
// title). Renders any frame deterministically, plus the thumbnail ("sheet" pose = frame 0 + Recall pill). Frames are written from an
// explicit composite of the 3D and overlay canvases (english-09 renderer note).
import * as THREE from 'three';
import { buildCafe, buildPerson, buildPuffs, PAL, flat } from './lowpoly.js';
import { buildCeilingAlarm, buildToaster, buildKettle, buildBroom, buildChamber, ALARM, CH } from './smoke.js';
import { makeChoreo, ROOT, GIANT, TOASTER, KETTLE } from './choreo.js';
import { drawOverlay, drawThumbnail } from './overlay.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 46px Fredoka', '700 36px Fredoka', '600 52px Fredoka', '700 78px Fredoka', '700 110px Fredoka'].map(f => document.fonts.load(f)));
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')));
  const fontCheck = texts.every(s => document.fonts.check('600 56px Fredoka', s));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d', { willReadFrequently: true });
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false); R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; S.R = R;
  const scene = new THREE.Scene(); scene.background = col('#2A1E15'); scene.fog = new THREE.Fog('#3A2A1D', 3.2, 9); S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(34, S.W / S.H, 0.01, 120);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  S.key = new THREE.DirectionalLight('#FFD3A0', 3.2); S.key.castShadow = true; S.key.shadow.mapSize.set(1536, 1536); S.key.shadow.bias = -0.0006; S.key.shadow.normalBias = 0.02;
  Object.assign(S.key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 14 });
  scene.add(S.key, S.key.target);
  S.hemi = new THREE.HemisphereLight('#FFE9CC', '#4A3424', 0.75); scene.add(S.hemi);
  const fill = new THREE.DirectionalLight('#9FB8D8', 0.45); fill.position.set(3, 2, 4); scene.add(fill);
  S.faceLight = new THREE.PointLight('#FFE2BF', 0.9, 1.6, 1.5); S.faceLight.position.set(0.3, 1.75, 0.0); scene.add(S.faceLight);
  S.ceilLight = new THREE.PointLight('#FFE6C4', 0, 2.2, 1.4); scene.add(S.ceilLight);        // lights the ceiling + alarm from below
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  { const trou = flat('#3E4A57'), shoe = flat('#2B2722', { roughness: 0.6 }), L = new THREE.Group(); S.person.root.add(L);   // legs + shoes (english-13)
    const hip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), trou); hip.position.set(0, 0.93, 0); hip.castShadow = true; L.add(hip);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.84, 7), trou); leg.position.set(sx * 0.085, 0.5, 0); leg.castShadow = true; L.add(leg);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.22), shoe); sh.position.set(sx * 0.09, 0.04, 0.035); sh.castShadow = true; L.add(sh);
    } }
  S.cafe.coffee.visible = false;                       // the counter now holds the toaster and kettle
  S.ceil = buildCeilingAlarm(scene); S.toaster = buildToaster(scene, TOASTER); S.kettle = buildKettle(scene, KETTLE); S.broom = buildBroom(scene);
  S.puffs = buildPuffs(scene, 140, '#403C37', 0.5); S.vapor = buildPuffs(scene, 70, '#FFFFFF', 0.4);
  S.chLight = new THREE.PointLight('#E8F5C8', 0, 9, 1.2); S.chLight.position.set(GIANT[0] - 0.5, 2.6, GIANT[2] + 1.2); scene.add(S.chLight);
  S.Ch = buildChamber(scene, GIANT);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const m4 = new THREE.Matrix4(), s4 = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const GIANT_SHOTS = ['giant_open', 'giant_miss', 'giant_scatter', 'giant_hit', 'steam_giant'];

function setPuffs(mesh, list, kind) {
  let n = 0;
  for (const P of list) {
    if (P.kind !== kind || n >= mesh.count) continue;
    s4.set(P.s, P.s, P.s); m4.compose(P.p, S.cam.quaternion, s4); mesh.setMatrixAt(n++, m4);
  }
  for (let i = n; i < mesh.count; i++) mesh.setMatrixAt(i, ZERO);
  mesh.instanceMatrix.needsUpdate = true;
}

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues, id = shot.id;
  const set = GIANT_SHOTS.includes(id) ? 'giant' : 'cafe';
  const P = {};
  // ---------------- café: performer, toaster, kettle, broom, alarm
  const q = ch.person(t); q.pos = ROOT; S.person.apply(q);
  S.toaster.set(ch.toaster(t));
  S.ceil.set(ch.alarm(t, id));
  const b = ch.broom(t); S.broom.group.visible = t >= 22.2;
  S.broom.group.position.copy(b.O); S.broom.group.quaternion.setFromUnitVectors(V(0, 1, 0), b.D);
  S.cafe.group.visible = S.person.root.visible = S.ceil.group.visible = S.toaster.group.visible = S.kettle.group.visible = set === 'cafe';
  if (set !== 'cafe') S.broom.group.visible = false;
  S.Ch.group.visible = set === 'giant';
  // ---------------- giant chamber
  if (set === 'giant') {
    const c = ch.chamber(t, id);
    S.Ch.cover.position.y = 3.6 * c.cover; S.Ch.cover.rotation.z = 0.12 * c.cover; S.Ch.cover.visible = c.cover < 0.999;
    S.Ch.setBeam(c.beam); S.Ch.setSensor(c.level); S.Ch.setParticles(c.parts); S.Ch.setRays(c.rays);
  }
  // ---------------- camera + lights
  const cam = ch.camera(t, {});
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const pl = set === 'cafe' ? ch.puffs(t) : [];
  setPuffs(S.puffs, pl, 'smoke'); setPuffs(S.vapor, pl, 'steam');
  S.puffs.visible = S.vapor.visible = set === 'cafe';
  const G = V(...GIANT);
  const focus = set === 'cafe' ? V(0, 1.0, -0.3) : G.clone();
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(set === 'cafe' ? V(-2.6, 3.4, -1.4) : V(-3.0, 6.0, 4.0)));
  S.key.intensity = set === 'cafe' ? 3.2 : 1.6;
  const ext = set === 'cafe' ? 2.2 : 4;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: set === 'cafe' ? 14 : 30 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = set === 'cafe' ? 3.2 : 30; S.scene.fog.far = set === 'cafe' ? 9 : 90;
  S.scene.background = col(set === 'giant' ? '#141A1F' : '#2A1E15');
  S.hemi.intensity = set === 'cafe' ? 0.75 : 0.45; S.chLight.intensity = set === 'giant' ? 2.2 : 0;
  const ceilingShot = ['hook_alarm', 'alarm_blare', 'test_press'].includes(id);
  S.ceilLight.intensity = ceilingShot ? 1.6 : 0.5; S.ceilLight.position.copy(ALARM.clone().add(V(-0.25, -0.55, 0.45)));
  S.faceLight.intensity = set === 'cafe' && !ceilingShot ? 0.9 : 0;
  // ---------------- overlay anchors
  const pin = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  if (set === 'giant') {
    const w = v => G.clone().add(v);
    if (id === 'giant_open') pin('light', w(CH.led), w(CH.led.clone().add(V(0.2, 1.3, 0.4))));
    if (id === 'giant_miss') pin('sensor', w(CH.sensor.clone().add(V(0, 0.15, 0.08))), w(CH.sensor.clone().add(V(0.5, 1.15, 0.2))));
    if (id === 'giant_scatter') pin('smoke', w(V(1.5, 0.6, -0.6)), w(V(1.7, 1.75, -0.9)));
    if (id === 'giant_hit') pin('hit', w(CH.sensor.clone().add(V(0.05, 0.08, 0.55))), w(V(-0.5, 1.35, -0.6)));
    if (id === 'steam_giant') pin('steam', w(V(1.3, 0.6, -0.5)), w(V(1.5, 1.75, -0.9)));
  } else if (id === 'test_press') pin('button', ALARM.clone().add(V(0, -0.062, 0)), ALARM.clone().add(V(0.12, -0.2, 0.05)));
  const safe = { shot: id };
  if (id === 'cafe_cta') safe.head = project(S.person.head.localToWorld(V(0, 0.11, 0.02))).y;
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
// The thumbnail is frame 0 itself (the alarm in curling smoke + the title words) with the Recall pill added.
window.__sheetPoses = () => ['thumbnail'];
window.__renderSheetPose = async () => {
  const { t, shot, P } = applyFrame(0);
  S.R.render(S.scene, S.cam);
  drawOverlay(S.octx, S.W, S.H, t, S.choreo.overlay(t, shot.id), P, S.d.timeline, S.icon, S.capCache, shot.id);
  drawThumbnail(S.octx, S.W, S.H, S.icon);
  S.octx.getImageData(0, 0, 1, 1);
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
};
window.__composite = () => {
  if (!S.comp) { S.comp = document.createElement('canvas'); S.comp.width = S.W; S.comp.height = S.H; S.cctx = S.comp.getContext('2d'); }
  S.cctx.clearRect(0, 0, S.W, S.H);
  S.cctx.drawImage(document.getElementById('gl'), 0, 0); S.cctx.drawImage(document.getElementById('ov'), 0, 0);
  return S.comp.toDataURL('image/png');
};
