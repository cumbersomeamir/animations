// Entry: the low-poly café + performer + lime phone from feedback round 01, a TV remote (with a battery swap), a small TV
// on the counter, and the giant infrared set; renders any frame deterministically.
import * as THREE from 'three';
import { buildCafe, buildPerson, buildPhone, buildRemote, buildBattery, buildCounterTV, buildGiantIR, SPEC, IRC, PAL } from './lowpoly.js';
import { makeChoreo, GIANT, TV_POS, TV_YAW, REM_DOWN } from './choreo.js';
import { drawPreview, drawTV } from './screen.js';
import { drawOverlay } from './overlay.js';
import { E, seg, clamp } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const col = c => new THREE.Color(c);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 56px Fredoka', '700 38px Fredoka', '700 36px Fredoka'].map(f => document.fonts.load(f)));
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
  S.remote = buildRemote(scene);
  S.oldB = [buildBattery(scene, false), buildBattery(scene, false)]; S.newB = [buildBattery(scene, true), buildBattery(scene, true)];
  S.tv = buildCounterTV(scene); S.tv.group.position.set(...TV_POS); S.tv.group.rotation.y = TV_YAW;
  S.G = buildGiantIR(scene, GIANT);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  R.compile(scene, S.cam);
  return { ok: true, fontCheck };
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), Zp = V(0, 0, 1), TINY = V(1e-4, 1e-4, 1e-4), ONE = V(1, 1, 1);
const lookQuat = (from, to) => { const m = new THREE.Matrix4().lookAt(to, from, V(0, 1, 0)); return new THREE.Quaternion().setFromRotationMatrix(m); };   // +z toward `to`

function applyFrame(f) {
  const t = f / 30, ch = S.choreo, shot = ch.shotAt(t), C = ch.cues;
  const giantShot = shot.id.startsWith('giant'), pov = shot.id.endsWith('_pov');
  // ---------------- performer + phone (resting on the palm, facing the eyes; as in feedback round 01)
  const q = ch.person(t); S.person.apply(q);
  const head = S.person.head.localToWorld(V(0, 0.11, 0.02));
  const arm = S.person.arms[1], wrist = arm.hand.getWorldPosition(V(0, 0, 0)), elbow = arm.el.getWorldPosition(V(0, 0, 0));
  const fdir = wrist.clone().sub(elbow).normalize(), palmC = wrist.clone().add(fdir.clone().multiplyScalar(0.04));
  const phonePos = palmC.clone().add(head.clone().sub(palmC).normalize().multiplyScalar(0.03)).add(fdir.clone().multiplyScalar(0.035));
  S.phone.group.position.copy(phonePos); S.phone.group.lookAt(head);
  const down = (t >= 20.4 && t < 23.6) ? 1 : 0;   // the phone is set down exactly for the close-up (cuts at 20.4 / 23.6)
  if (down > 0.5) { S.phone.group.position.set(0.3, 0.9555, -0.12); S.phone.group.rotation.set(-Math.PI / 2, 0, 0.4); }
  S.phone.group.updateMatrixWorld(true);
  drawPreview(S.phone.ctx, 540, 1140, ch.preview(t)); S.phone.tex.needsUpdate = true;
  // ---------------- remote in the left hand: aimed at the phone camera, at the TV, or held back-up for the battery swap
  const armL = S.person.arms[0], wL = armL.hand.getWorldPosition(V(0, 0, 0)), eL = armL.el.getWorldPosition(V(0, 0, 0));
  const palmL = wL.clone().add(wL.clone().sub(eL).normalize().multiplyScalar(0.05));
  const tvC = V(TV_POS[0], TV_POS[1] + 0.155, TV_POS[2]);
  const qPhone = lookQuat(palmL, phonePos), qTV = lookQuat(palmL, tvC);
  const qSwap = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2 + 0.35, Math.PI));
  const tvK = clamp(Math.max(seg(t, 16.6, 16.85) * (1 - seg(t, 17.85, 18.0)), seg(t, 25.0, 25.2))), swK = seg(t, 20.22, 20.39) * (t < 23.6 ? 1 : 0);
  const rq = qPhone.clone().slerp(qTV, tvK).slerp(qSwap, swK);
  S.remote.group.position.copy(palmL.clone().lerp(V(...REM_DOWN), swK)); S.remote.group.quaternion.copy(rq); S.remote.group.updateMatrixWorld(true);
  S.remote.thumb.visible = swK < 0.5; S.remote.group.children.forEach(m => { if (m.material && m.material.color && m.material.color.getHexString() === 'a8714e' && m !== S.remote.thumb) m.visible = swK < 0.5; });
  S.remote.thumb.position.y = S.remote.T / 2 + 0.008 - 0.004 * (ch.pressedAt(t).held ? 1 : 0);
  // battery swap: the cover slides back, old cells pop out to the counter, new cells drop in, the cover closes
  const B = ch.batteries(t), rem = S.remote;
  rem.cover.position.set(0, -rem.T / 2 - 0.0012 - 0.025 * B.cover, -0.045 - 0.05 * B.cover);
  const slot = sx => rem.group.localToWorld(V(sx * 0.0092, -rem.T / 2 + 0.002, -0.045));
  const remQ = rem.group.getWorldQuaternion(new THREE.Quaternion());
  [-1, 1].forEach((sx, i) => {
    const o = S.oldB[i], n = S.newB[i];
    o.visible = B.swapping && B.oldOut < 1 && t > C.coverOff; n.visible = B.swapping && B.newIn > 0 && t < C.coverOn + 0.25;
    const rest = V(-0.03 + 0.06 * i, 0.9582, 0.04);
    if (t < C.oldOut) { o.position.copy(slot(sx)); o.quaternion.copy(remQ); }
    else { o.position.copy(slot(sx).lerp(rest, B.oldOut)).add(V(0, 0.08 * Math.sin(Math.PI * B.oldOut), 0)); o.quaternion.copy(remQ).slerp(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), 0.3 + i), B.oldOut); }
    n.position.copy(slot(sx).add(V(0.05, 0.1, 0.02).multiplyScalar(1 - B.newIn))); n.quaternion.copy(remQ);
    if (t > C.oldOut + 0.4 && t < 26.35) { o.visible = true; o.position.copy(rest); o.quaternion.setFromAxisAngle(V(0, 1, 0), 0.3 + i); }
  });
  // counter TV
  drawTV(S.tv.ctx, ch.tvVolume(t)); S.tv.tex.needsUpdate = true;
  // ---------------- giant set
  const G = S.G, gs = ch.giant(t), P = {}, org = V(...GIANT);
  G.group.visible = giantShot;
  for (const o of [S.cafe.group, S.person.root, S.phone.group, S.remote.group, S.tv.group, ...S.oldB, ...S.newB]) if (giantShot) o.visible = false;
  if (!giantShot) { S.cafe.group.visible = S.phone.group.visible = S.remote.group.visible = S.tv.group.visible = true; S.person.root.visible = !pov; }
  if (giantShot) {
    const GR = G.remote, toSensor = gs.remoteToSensor;
    GR.group.position.set(toSensor ? -0.35 : -0.55, 0.5 + GR.T / 2, 0.55); GR.group.rotation.set(0, toSensor ? -Math.PI / 2 : Math.PI / 2, 0); GR.group.updateMatrixWorld(true);
    G.group.updateMatrixWorld(true);
    const led = GR.group.localToWorld(V(0, 0, GR.L / 2 + 0.05));
    const tgt = toSensor ? G.cam.localToWorld(V(0, 1.25, 0.35)) : G.rx.getWorldPosition(V(0, 0, 0));
    const dir = tgt.clone().sub(led), len = dir.length(); dir.normalize();
    const SPEED = 3.2, rq = new THREE.Quaternion().setFromUnitVectors(Zp, dir);
    for (let k = 0; k < 48; k++) {
      const age = k * 0.045, on = ch.irOn(t - age) && age * SPEED < len;
      const p = led.clone().add(dir.clone().multiplyScalar(age * SPEED)).sub(org), s = 1 + 0.8 * (age * SPEED / len);
      M4.compose(p, rq, on ? V(s, s, s) : TINY); G.rings.setMatrixAt(k, M4);
    }
    G.rings.instanceMatrix.needsUpdate = true;
    const arrive = ch.irOn(t - len / SPEED);
    G.rxM.color.set(!toSensor && arrive ? PAL.lime : '#3A1C26');
    drawTV(G.tctx, ch.tvVolume(t)); G.ttex.needsUpdate = true;
    const glow = toSensor && arrive ? 1 : 0;
    const dark = col('#2C3326'), hot = col('#F3E8FF');
    G.tilePos.forEach((p, i) => { const dx = p.x, dy = p.y - 1.25, w = Math.exp(-(dx * dx + dy * dy) / 0.12); G.tiles.setColorAt(i, dark.clone().lerp(hot, glow * w).lerp(col(IRC), glow * w * 0.35)); });
    G.tiles.instanceColor.needsUpdate = true;
    G.irMark.material.opacity = 0.85 * gs.irMark * (0.7 + 0.3 * Math.sin(t * 9));
    G.eyeBr.group.scale.y = Math.max(0.001, gs.eyeBr); G.eyeBr.group.visible = gs.eyeBr > 0.01;
    G.camBr.group.scale.y = Math.max(0.001, gs.camBr); G.camBr.group.visible = gs.camBr > 0.01;
  }
  // ---------------- camera + key light
  const cam = ch.camera(t, { head, phone: phonePos, remote: S.remote.group.position.clone(), remoteTip: S.remote.group.localToWorld(V(0, 0, S.remote.L / 2)) });
  S.cam.up.set(0, 1, 0); S.cam.position.copy(cam.pos); S.cam.lookAt(cam.target); S.cam.fov = cam.fov; S.cam.aspect = S.W / S.H; S.cam.updateProjectionMatrix(); S.cam.updateMatrixWorld(true);
  if (giantShot) {
    const colW = G.col.localToWorld.bind(G.col);
    P.ir = project(colW(V(SPEC.w / 2, G.yAt(0.85), 0.1)));
    P.eyeBr = project(colW(V(-0.55, G.yAt(0.35), 0.1)));
    P.rx = project(G.rx.getWorldPosition(V(0, 0, 0)));
    P.tiles = project(G.cam.localToWorld(V(0, 1.25, 0.1)));
    P.eye = project(G.eye.localToWorld(V(0, 1.0, 0.3)));
  } else {
    P.phone = project(phonePos); P.batt = project(S.remote.group.localToWorld(V(0, 0, -0.045)));
  }
  const focus = giantShot ? org.clone().add(V(0, 1.2, 0)) : V(0, 1.0, -0.3);
  S.key.target.position.copy(focus); S.key.position.copy(focus.clone().add(giantShot ? V(-3.0, 6.0, 3.6) : V(-2.6, 3.4, -1.4)));
  const ext = giantShot ? 4.6 : 2.2;
  if (S.key.shadow.camera.right !== ext) { Object.assign(S.key.shadow.camera, { left: -ext, right: ext, top: ext, bottom: -ext, far: giantShot ? 24 : 14 }); S.key.shadow.camera.updateProjectionMatrix(); }
  S.scene.fog.near = giantShot ? 12 : 2.6; S.scene.fog.far = giantShot ? 30 : 8;
  const safe = { shot: shot.id };
  if (!giantShot && !pov) safe.head = project(head).y;
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
