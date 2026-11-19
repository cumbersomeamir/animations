// Entry: the low-poly café + performer from feedback round 01 holding the lime phone (a reading screen that auto-rotates), a
// giant MEMS accelerometer die (proof mass on springs, comb fingers and fixed plates that glow as their gap narrows, a gravity
// arrow, the die turning like the phone), and a bedroom POV lying on one side (the screen flips; rotation lock keeps it upright).
// Frame 0 = the thumbnail composition (the springs and fingers + title). Renders any frame deterministically, plus the thumbnail
// ("sheet" pose "thumbnail" = frame 0 + Recall pill). Frames are written from an explicit composite of the 3D and overlay canvases.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildPhone, buildMems, buildBedroom, buildArrow, MEMS, PAL, flat } from './lowpoly.js';
import { makeChoreo, ROOT, GIANT, BED } from './choreo.js';
import { drawUI } from './screen.js';
import { drawOverlay, drawThumbnail } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const frac = x => x - Math.floor(x);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 46px Fredoka', '700 36px Fredoka', '600 52px Fredoka', '700 78px Fredoka', '700 110px Fredoka'].map(f => document.fonts.load(f)));
  const texts = d.timeline.captions.flatMap(c => c.lines.map(l => l.map(s => s[0]).join('')));
  const fontCheck = texts.every(s => document.fonts.check('600 56px Fredoka', s));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d', { willReadFrequently: true });   // software 2D canvas (see __renderFrame)
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
  S.rim = new THREE.PointLight('#FFF1D6', 1.0, 1.0, 1.5); S.rim.position.set(0.3, 1.6, 0.2); scene.add(S.rim);
  S.cafe = buildCafe(scene); S.person = buildPerson(scene);
  { const trou = flat('#3E4A57'), shoe = flat('#2B2722', { roughness: 0.6 }), L = new THREE.Group(); S.person.root.add(L);   // legs + shoes (english-13)
    const hip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), trou); hip.position.set(0, 0.93, 0); hip.castShadow = true; L.add(hip);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.84, 7), trou); leg.position.set(sx * 0.085, 0.5, 0); leg.castShadow = true; L.add(leg);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.22), shoe); sh.position.set(sx * 0.09, 0.04, 0.035); sh.castShadow = true; L.add(sh);
    } }
  S.phone = buildPhone(scene); S.bphone = buildPhone(scene);
  S.Ms = buildMems(scene, GIANT); S.Bd = buildBedroom(scene, BED);
  S.gArrow = buildArrow(scene, '#F8FAF3', 0.06, 1); S.gArrow.rotation.z = Math.PI;
  S.bArrow = buildArrow(scene, PAL.lime, 0.0045, 1);
  S.nearPillow = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), flat('#FFFFFF', { roughness: 0.9 })); S.nearPillow.scale.set(1.0, 0.45, 1.6); S.nearPillow.receiveShadow = true; scene.add(S.nearPillow);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new THREE.Vector3(), ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

const GIANT_SHOTS = ['hook_mems', 'giant_mass', 'giant_gravity', 'giant_fingers', 'giant_turn'];

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues, id = shot.id;
  const set = GIANT_SHOTS.includes(id) ? 'giant' : id.startsWith('bed') ? 'bed' : 'cafe';
  const P = {};
  // ---------------- café: performer + phone in the hand (rotates in its own plane)
  const q = ch.person(t); q.pos = ROOT; S.person.apply(q);
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  const arm = S.person.arms[1], wrist = arm.hand.getWorldPosition(V(0, 0, 0)), elbow = arm.el.getWorldPosition(V(0, 0, 0));
  const fdir = wrist.clone().sub(elbow).normalize(), palmC = wrist.clone().add(fdir.clone().multiplyScalar(0.04));
  const phonePos = palmC.clone().add(head.clone().sub(palmC).normalize().multiplyScalar(0.03)).add(fdir.clone().multiplyScalar(0.035));
  S.phone.group.position.copy(phonePos); S.phone.group.up.set(0, 1, 0); S.phone.group.lookAt(head); S.phone.group.rotateZ(ch.phoneRot(t)); S.phone.group.updateMatrixWorld(true);
  const u = ch.ui(t, id);
  if (set !== 'giant') { drawUI(set === 'bed' ? S.bphone.ctx : S.phone.ctx, 540, 1140, u); (set === 'bed' ? S.bphone : S.phone).tex.needsUpdate = true; }
  S.cafe.group.visible = S.person.root.visible = S.phone.group.visible = set === 'cafe';
  S.Ms.group.visible = S.gArrow.visible = set === 'giant'; S.Bd.group.visible = S.bphone.group.visible = set === 'bed';
  // ---------------- giant MEMS die
  if (set === 'giant') {
    const m = ch.mems(t, id); S.Ms.die.rotation.z = m.phi; S.Ms.setOffset(m.dx, m.dy);
    const ga = id === 'giant_gravity' ? seg(t, C.gravityTag - 0.3, C.gravityTag + 0.3) : id === 'giant_turn' ? 1 : 0;
    S.gArrow.visible = ga > 0.01; S.gArrow.userData.setLength(1.1 * ga); S.gArrow.position.set(GIANT[0], 0.55, 0.55);
  }
  // ---------------- camera + lights
  const cam = ch.camera(t, { head, phone: phonePos });
  S.cam.up.copy(cam.up || V(0, 1, 0)); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  // ---------------- bedroom POV: the phone is held upright for your eyes; a small arrow shows which way gravity points
  if (set === 'bed') {
    const right = cam.f.clone().cross(cam.up).normalize(), bp = cam.eye.clone().addScaledVector(cam.f, 0.3).addScaledVector(cam.up, -0.035);
    S.bphone.group.position.copy(bp); S.bphone.group.up.copy(cam.up); S.bphone.group.lookAt(cam.eye); S.bphone.group.updateMatrixWorld(true);
    const ga = id === 'bed_flip' ? seg(t, C.gravTag2 - 0.3, C.gravTag2 + 0.2) : 0;
    S.nearPillow.visible = true; S.nearPillow.position.copy(cam.eye.clone().addScaledVector(right, 0.085).addScaledVector(cam.f, 0.2).addScaledVector(cam.up, -0.02)); S.nearPillow.lookAt(cam.eye.clone().addScaledVector(right, 0.085));
    S.bArrow.visible = ga > 0.01; S.bArrow.userData.setLength(0.055 * ga);
    S.bArrow.position.copy(bp.clone().addScaledVector(right, 0.06).addScaledVector(cam.up, 0.02).add(V(0, 0.027, 0))); S.bArrow.rotation.set(0, 0, Math.PI);
  } else S.bArrow.visible = S.nearPillow.visible = false;
  const G = V(...GIANT), B = V(...BED);
  const focus = set === 'cafe' ? V(0, 1.0, -0.3) : set === 'giant' ? G.clone() : B.clone().add(V(0.4, 0.8, -0.8));
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(set === 'cafe' ? V(-2.6, 3.4, -1.4) : set === 'giant' ? V(-3.0, 4.0, 6.0) : V(2.4, 3.6, 2.0)));
  const ext = set === 'cafe' ? 2.2 : 6;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: set === 'cafe' ? 14 : 30 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = set === 'cafe' ? 3.2 : 30; S.scene.fog.far = set === 'cafe' ? 9 : 90;
  S.scene.background = col(set === 'giant' ? '#141A1F' : set === 'bed' ? '#E9DCC6' : '#2A1E15');
  const pov = id.endsWith('_pov');
  S.faceLight.intensity = set === 'cafe' && !pov ? 0.9 : 0; S.rim.intensity = pov ? 0.6 : 0;
  // ---------------- overlay anchors
  const pin = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  if (set === 'giant') {
    const w = (x, y, z) => S.Ms.die.localToWorld(V(x, y, z));
    if (id === 'giant_mass') pin('springs', w(1.05, 1.05, 0.15), w(1.2, 1.25, 0.2).add(V(-0.2, 0.85, 0)));
    if (id === 'giant_gravity') pin('gravity', G.clone().add(V(0, -0.45, 0.55)), G.clone().add(V(0.15, -1.45, 0.6)));
    if (id === 'giant_fingers') pin('gap', w(1.25, -0.39, 0.2), w(1.1, -0.39, 0.2).add(V(0, -0.38, 0.1)));
    if (id === 'giant_turn') pin('shift', w(0, 0, 0.25), G.clone().add(V(0.2, -1.6, 0.4)));
  } else if (id === 'proof_pov') pin('screen', phonePos, phonePos.clone().add(V(0, -0.05, 0)));
  else if (id === 'bed_flip') pin('grav2', S.bArrow.position.clone().add(V(0, -0.03, 0)), S.bArrow.position.clone().addScaledVector(S.cam.up.clone(), -0.07).add(V(0, -0.03, 0)));
  else if (id === 'bed_lock') { const bp = S.bphone.group.position; pin('lock', bp, bp.clone().addScaledVector(cam.up, -0.09)); }
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
// The thumbnail is frame 0 itself (the accelerometer's springs and fingers + the title words) with the Recall pill added.
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
