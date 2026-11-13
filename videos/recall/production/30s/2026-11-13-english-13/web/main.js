// Entry: the low-poly café + performer from feedback round 01, a cutaway elevator car riding up its shaft with the performer
// standing on a bathroom scale (live display), the floor's push and gravity drawn as arrows to the same scale, and the
// end café shot; renders any frame deterministically, plus a separate vertical thumbnail ("sheet" pose "thumbnail").
// Frames are written from an explicit composite of the 3D and overlay canvases (english-09 fix).
import * as THREE from 'three';
import { buildCafe, buildPerson, buildElevator, buildScale, buildShaft, buildArrow, CAR, FLOOR_H, PAL, flat } from './lowpoly.js';
import { makeChoreo, ROOT, SHAFT, ARROW_K } from './choreo.js';
import { drawOverlay, drawThumbnail } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);
const CORAL = '#F08A5D';

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
  // legs + shoes for this episode (the shared performer rig ends at the hips: the café counter always hid the legs)
  { const trou = flat('#3E4A57'), shoe = flat('#2B2722', { roughness: 0.6 }), lime = flat(PAL.lime), L = new THREE.Group(); S.person.root.add(L); S.legs = L;
    const hip = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.2), trou); hip.position.set(0, 0.93, 0); hip.castShadow = true; L.add(hip);
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.056, 0.84, 7), trou); leg.position.set(sx * 0.085, 0.5, 0); leg.castShadow = true; L.add(leg);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.075, 0.22), shoe); sh.position.set(sx * 0.09, 0.04, 0.035); sh.castShadow = true; L.add(sh);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.104, 0.014, 0.224), lime); sole.position.set(sx * 0.09, 0.007, 0.035); L.add(sole);
    } }
  S.shaft = buildShaft(scene, 11); S.shaft.group.position.set(...SHAFT);
  S.car = buildElevator(scene); S.car.right.visible = false;   // cutaway: the front and right walls are open to the camera
  S.scale = buildScale(scene);
  // force arrows: the floor's push (pale lime up to the weight's length, bright lime beyond it, coral ghost when short) and gravity
  S.ar = { push: buildArrow(scene, '#A9CF5A'), extra: buildArrow(scene, PAL.lime, 0.05), ghost: buildArrow(scene, CORAL, 0.045, 0.35), grav: buildArrow(scene, CORAL) };
  S.guide = new THREE.Group(); scene.add(S.guide);
  for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: PAL.paper, toneMapped: false, depthTest: false, transparent: true })); d.position.x = -0.5 + i * 0.125; d.renderOrder = 22; S.guide.add(d); }
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {}; S.last = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

function drawScaleDisplay(val, flash) {
  const k = val.toFixed(1); if (S.last.scale === k + flash.toFixed(2)) return; S.last.scale = k + flash.toFixed(2);
  const { ctx: g, c, tex } = S.scale.disp, W = c.width, H = c.height;
  g.fillStyle = '#10140D'; g.fillRect(0, 0, W, H);
  g.fillStyle = `rgba(199,243,107,${0.08 + 0.25 * flash})`; g.fillRect(0, 0, W, H);
  g.save(); g.fillStyle = PAL.lime; g.shadowColor = 'rgba(199,243,107,0.7)'; g.shadowBlur = 14 + 20 * flash;
  g.font = '700 96px Fredoka'; g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillText(k, W - 74, H / 2 + 4);
  g.font = '700 40px Fredoka'; g.textAlign = 'left'; g.fillText('kg', W - 66, H / 2 + 18); g.restore();
  tex.needsUpdate = true;
}
function drawIndicator(floor, moving) {
  const key = floor + (moving ? 'm' : ''); if (S.last.ind === key) return; S.last.ind = key;
  const { ctx: g, c, tex } = S.car.ind, W = c.width, H = c.height;
  g.fillStyle = '#10140D'; g.fillRect(0, 0, W, H);
  g.fillStyle = PAL.lime; g.font = '700 92px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(floor), W * 0.62, H / 2 + 6);
  if (moving) { g.beginPath(); g.moveTo(W * 0.24, H * 0.26); g.lineTo(W * 0.36, H * 0.62); g.lineTo(W * 0.12, H * 0.62); g.closePath(); g.fill(); }
  tex.needsUpdate = true;
}

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };

function applyFrame(f, forceT) {
  const t = forceT != null ? forceT : f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues;
  const inCar = shot.id !== 'cafe_wide';
  // ---------------- the ride
  const rd = ch.ride(t), car = V(...SHAFT).add(V(0, rd.y, 0));
  S.car.group.position.copy(car); S.car.cables.forEach(cb => { const L = S.shaft.height - rd.y - CAR.H; cb.scale.y = L; cb.position.y = CAR.H + 0.16 + L / 2; });
  S.scale.group.position.copy(car.clone().add(V(0, 0.03, 0.05)));
  const r = ch.reading(t), flash = Math.max(0, 1 - Math.abs(t - (C.start + C.jumpEnd) / 2) / 0.6) * (t < 3 ? 1 : 0);
  drawScaleDisplay(r, flash);
  drawIndicator(1 + Math.floor((rd.y + 0.3) / FLOOR_H), rd.v > 0.02);
  // ---------------- performer: on the scale in the car, or at the café counter for the CTA
  const q = ch.person(t, shot.id);
  if (inCar) {
    const root = car.clone().add(V(0, 0.087, 0.0)); q.pos = root.toArray();   // standing on the scale's top
    const side = s => root.clone().add(V(s * 0.27, 0.9, 0.04));
    q.handR = side(1).lerp(root.clone().add(V(0.05, 1.1, 0.18)), q.belly); q.handL = side(-1);
  } else { q.pos = ROOT; q.handR = V(0.22, 1.0, -0.32); q.handL = V(-0.22, 1.0, -0.32); }
  S.person.apply(q);
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  // ---------------- arrows (car-local positions: push left of the body, gravity right of it, both drawn to the same scale)
  const ar = ch.arrows(t, shot.id), A = S.ar, base = 0.09, Lw = ARROW_K, Lp = ARROW_K * ar.ratio;
  for (const k in A) A[k].visible = false; S.guide.visible = false;
  const at = (g, x, y) => { g.position.copy(car.clone().add(V(x, y, 0.32))); g.updateMatrixWorld(true); };
  if (ar.push > 0.001) {
    const grow = ar.push;
    A.push.visible = true; at(A.push, -0.5, base); A.push.rotation.set(0, 0, 0); A.push.userData.setLength(Math.min(Lw, Lp) * grow);
    if (Lp > Lw + 0.004) { A.extra.visible = true; at(A.extra, -0.5, base + Lw * grow); A.extra.userData.setLength((Lp - Lw) * grow); }
    if (Lp < Lw - 0.004) { A.ghost.visible = true; at(A.ghost, -0.5, base + Lp); A.ghost.userData.setLength((Lw - Lp)); }
  }
  if (ar.grav > 0.001) { A.grav.visible = true; at(A.grav, 0.5, base + Lw); A.grav.rotation.set(Math.PI, 0, 0); A.grav.userData.setLength(Lw * ar.grav); }
  if (ar.push > 0.99 && ar.grav > 0.99) { S.guide.visible = true; S.guide.position.copy(car.clone().add(V(0, base + Lw, 0.32))); S.guide.children.forEach(m => { m.material.opacity = 0.75; }); }
  // ---------------- camera + key light
  const cam = ch.camera(t, { car, head });
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  const focus = inCar ? car.clone().add(V(0, 1.2, 0)) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(inCar ? V(2.4, 3.6, 3.2) : V(-2.6, 3.4, -1.4)));
  S.scene.fog.near = inCar ? 6 : 2.6; S.scene.fog.far = inCar ? 22 : 8;
  // ---------------- overlay anchors
  const P = {}, pin = (k, p, qq) => { P[k] = project(p); P[k + 'T'] = project(qq); };
  if (shot.id.startsWith('shaft')) {
    pin('push', car.clone().add(V(-0.5, base + Lw * 0.7, 0.32)), car.clone().add(V(-1.05, base + Lw * 0.82, 0.32)));
    pin('grav', car.clone().add(V(0.5, base + Lw * 0.7, 0.32)), car.clone().add(V(1.05, base + Lw * 0.82, 0.32)));
    pin('tip', car.clone().add(V(-0.5, base + (Lw + Lp) / 2, 0.32)), car.clone().add(V(-0.5, base + Lw + 0.62, 0.32)));
  }
  const safe = { shot: shot.id };
  if (shot.id === 'react' || shot.id === 'cafe_wide') safe.head = project(head).y;
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
// The separate vertical thumbnail: the hook's close-up (scale already jumped) with 2–4 large words.
window.__sheetPoses = () => ['thumbnail'];
window.__renderSheetPose = async () => {
  applyFrame(0, 1.75);
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
