// Entry: builds the scene once, then renders any frame index deterministically on request.
import * as THREE from 'three';
import { buildSet } from './set.js';
import { Kip } from './character.js';
import { SteelPiece, makeHullGhost, makeBallGhost, Splash, Bubbles, makeMagnifier, makeFlag } from './props.js';
import { makeChoreo } from './choreo.js';
import { drawOverlay } from './overlay.js';
import { PAL } from './clay.js';
import * as PH from './physics.js';
import { E, seg, clamp, pulse } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d');
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false);
  R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = 1.0;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap;
  R.localClippingEnabled = true;
  S.R = R;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#14180F');
  S.scene = scene;
  S.cam = new THREE.PerspectiveCamera(30, S.W / S.H, 0.05, 40);
  S.set = buildSet(scene, R);
  S.kip = new Kip(1.2); S.kip.addTo(scene);
  S.steel = new SteelPiece(); scene.add(S.steel.mesh);
  S.hullGhost = makeHullGhost(); scene.add(S.hullGhost.mesh);
  S.ballGhost = makeBallGhost(); scene.add(S.ballGhost.group);
  S.splashIn = new Splash(scene, 18, 11, 1.0);
  S.splashOut = new Splash(scene, 14, 23, 0.8);
  S.splashHullL = new Splash(scene, 10, 37, 0.55);
  S.splashHullR = new Splash(scene, 10, 41, 0.55);
  S.bubbles = new Bubbles(scene, 16, 5);
  S.bubblesRev = new Bubbles(scene, 12, 9);
  S.mag = makeMagnifier(); scene.add(S.mag);
  S.flag = makeFlag(); scene.add(S.flag);
  S.choreo = makeChoreo(d.timeline);
  S.mouth = d.mouth ? d.mouth.frames : null;
  await Promise.all([document.fonts.load('600 66px Fredoka'), document.fonts.load('700 34px Fredoka'), document.fonts.load('600 40px Fredoka')]);
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  R.compile(scene, S.cam);
  window.__physics = PH.report();
  return window.__physics;
};

function project(v) {
  const p = v.clone().project(S.cam);
  return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 };
}
function projR(center, r) {
  const c = project(center), e = project(center.clone().add(V(0, r, 0)));
  return { ...c, r: Math.abs(e.y - c.y) };
}

function applyFrame(f) {
  const t = f / 30;
  const C = S.choreo.cues;
  const mouthAmp = S.mouth ? (S.mouth[Math.min(S.mouth.length - 1, f)] || 0) : 0;
  const s = S.choreo.frame(t, mouthAmp);
  S.state = s;
  const cam = S.cam;
  cam.position.set(...s.cam.pos); cam.lookAt(...s.cam.target); cam.fov = s.cam.fov; cam.aspect = S.W / S.H; cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);

  S.kip.apply(s.kip);

  const st = s.st;
  S.steel.mesh.position.set(...st.pos);
  S.steel.setMorph(st.morph, st.squishPhase);
  S.steel.mesh.rotation.set(0, 0, st.mode === 'hull' && t > C.touch ? 0.012 * Math.sin(2 * Math.PI * 0.6 * (t - C.touch)) * Math.exp(-0.8 * (t - C.touch)) : 0);

  // water + ripples (time freezes while "paused")
  const tw = t >= C.pause && t < C.unpause ? C.pause : t >= C.unpause ? t - (C.unpause - C.pause) : t;
  const ripples = [
    { x: 0, z: -0.03, age: t - C.splash, amp: 0.012 },
    { x: 0, z: -0.03, age: Math.abs(t - C.rewindSplash) < 0.6 ? Math.abs(t - C.rewindSplash) : -1, amp: 0.009 },
    { x: 0, z: 0, age: t - C.touch, amp: 0.01 },
    { x: -0.3, z: 0.03, age: t - C.flagPlant, amp: 0.003 },
  ];
  const hullIn = st.mode === 'hull' && st.pos[1] - PH.HULL.D / 2 < s.level + 0.01 ? { x: st.pos[0], z: st.pos[2] } : null;
  S.set.water.set(s.level, ripples, tw, hullIn);

  // splashes / bubbles
  S.splashIn.update(t - C.splash, [0, s.level, -0.03], s.level);
  S.splashOut.update(t <= C.rewindSplash ? C.rewindSplash - t : -1, [0, s.level, -0.03], s.level);
  S.splashHullL.update(t - C.touch - 0.08, [-0.3, s.level, 0.02], s.level);
  S.splashHullR.update(t - C.touch - 0.08, [0.3, s.level, -0.02], s.level);
  S.bubbles.update(t < C.rewind ? t - C.splash - 0.05 : -1, [st.pos[0], st.pos[1], st.pos[2]], s.level);
  S.bubblesRev.update(t >= C.rewind && t < C.pause ? (C.pause - t) * 2.2 : -1, [st.pos[0], st.pos[1], st.pos[2]], s.level);

  // displaced-water ghosts
  const bg = S.ballGhost;
  const ga = s.fx.ballGhost;
  bg.group.visible = ga > 0.01;
  bg.group.position.set(st.pos[0] + 0.3 * s.fx.ballGhostSlide, st.pos[1] + 0.02 * s.fx.ballGhostSlide, st.pos[2] + 0.02);
  bg.mat.opacity = 0.32 * ga; bg.omat.opacity = 0;
  bg.group.scale.setScalar(0.85 + 0.15 * clamp(s.fx.ballGhostSlide * 3));
  const hg = S.hullGhost;
  hg.mesh.visible = st.mode === 'hull' && s.fx.hullGhost > 0.01;
  hg.mesh.position.set(...st.pos); hg.mesh.rotation.copy(S.steel.mesh.rotation);
  hg.mat.opacity = 0.5 * s.fx.hullGhost;
  hg.plane.constant = s.level - 0.002;

  // magnifier in Kip's right hand during the pause
  const magA = Math.min(seg(t, C.pause + 0.05, C.pause + 0.3, E.back), 1 - seg(t, C.twirl2 - 0.2, C.twirl2, E.in));
  S.mag.visible = magA > 0.01;
  if (S.mag.visible) {
    const h = S.kip.arms[1].hand.position;
    S.mag.position.set(h.x, h.y + 0.13, h.z + 0.01);
    S.mag.rotation.set(-0.25, -0.1, 0.05);
    S.mag.scale.setScalar(Math.max(0.01, magA));
  }

  // flag: appears in Kip's left hand, then rides on the hull after planting
  S.flag.visible = t >= C.flagGrab + 0.1;
  if (S.flag.visible) {
    if (t < C.flagPlant) {
      const h = S.kip.arms[0].hand.position;
      S.flag.position.set(h.x, h.y - 0.06, h.z); S.flag.rotation.set(0, 0.4, -0.25);
      S.flag.scale.setScalar(seg(t, C.flagGrab + 0.1, C.flagGrab + 0.3, E.back));
    } else {
      const k = seg(t, C.flagPlant, C.flagPlant + 0.12, E.out);
      S.flag.position.set(st.pos[0] - PH.HULL.a + 0.075, st.pos[1] + PH.HULL.D / 2 - 0.07 * k - 0.0, st.pos[2] + 0.02);
      S.flag.rotation.set(0, 0.5, -0.25 * (1 - k) + 0.02 * Math.sin(3 * t));
      S.flag.scale.setScalar(1);
    }
    S.flag.userData.wave(t);
  }

  S.set.diorama.update(t, (t - C.toot) / 0.9);

  // projected anchors for the overlay
  const P = {};
  const ballC = V(...st.pos);
  if (st.mode === 'ball') P.ball = projR(ballC, PH.BALL_R);
  P.ghost = projR(S.ballGhost.group.position.clone(), PH.BALL_R);
  const gx = 0.5, gz = PH.TANK.z1 + 0.012;
  P.gauge = [];
  for (let k = 0; k <= 9; k++) P.gauge.push({ ...project(V(gx, PH.TANK.level0 + k * PH.RISE_BALL, gz)), k });
  P.levelPt = project(V(gx, s.level, gz));
  P.markBall = project(V(gx, PH.TANK.level0 + PH.RISE_BALL, gz));
  P.markHull = project(V(gx, PH.TANK.level0 + PH.RISE_HULL, gz));
  if (st.mode === 'hull') {
    P.hullBottom = project(V(st.pos[0], st.pos[1] - PH.HULL.D / 2, st.pos[2] + PH.HULL.b));
    P.hullTop = project(V(st.pos[0], st.pos[1] + PH.HULL.D / 2, st.pos[2]));
    P.steelPt = project(V(st.pos[0] + 0.2, st.pos[1] + PH.HULL.D / 2, st.pos[2] + PH.HULL.b * 0.95));
    P.airPt = project(V(st.pos[0] + 0.02, st.pos[1] + PH.HULL.D / 2 - 0.02, st.pos[2]));
  }
  P.hand = project(S.kip.arms[1].hand.position);
  return { s, P };
}

window.__renderFrame = async (f) => {
  const { s, P } = applyFrame(f);
  S.R.render(S.scene, S.cam);
  S.boxes = drawOverlay(S.octx, S.W, S.H, s, P, S.d.timeline, S.icon);
  await new Promise(r => requestAnimationFrame(() => r()));
  return { boxes: S.boxes, level: s.level, mode: s.st.mode };
};

// ---------- character model sheet ----------
const SHEET = {
  'front-neutral': { yaw: 0, p: {} },
  'three-quarter': { yaw: 0.6, p: { headYaw: 0.15 } },
  'profile': { yaw: 1.5, p: {} },
  'back': { yaw: Math.PI, p: {} },
  'curious': { yaw: 0.2, p: { browRaiseL: 0.2, browRaiseR: 1.0, headRoll: 0.15, look: [0.6, 0.5], smile: 0.2, browAngle: 0.3 } },
  'surprised': { yaw: 0, p: { browRaiseL: 1, browRaiseR: 1, mouthOpen: 0.7, mouthRound: 1, squash: 1.06, smile: 0 } },
  'determined': { yaw: -0.2, p: { browAngle: -0.8, browRaiseL: -0.3, browRaiseR: -0.3, smile: 0.5, squash: 0.95, lean: 0.12 } },
  'delighted': { yaw: 0.15, p: { browRaiseL: 1, browRaiseR: 1, smile: 1, mouthOpen: 0.35, thumbUpR: 1, fistR: 1 } },
};
window.__sheetPoses = () => Object.keys(SHEET);
window.__renderSheetPose = async (name) => {
  const conf = SHEET[name];
  for (const o of [S.set.tank, S.set.step, S.set.diorama.group, S.steel.mesh, S.set.water.vol, S.set.water.surf]) o.visible = false;
  S.hullGhost.mesh.visible = false; S.ballGhost.group.visible = false; S.mag.visible = false; S.flag.visible = false;
  S.scene.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'RoundedBoxGeometry' && o.position.z < -0.3 && o.position.y > 0.2) o.visible = false; });
  const root = [0, 0.0, 0.5];
  const p = { root, yaw: conf.yaw, ...conf.p };
  if (name === 'delighted') p.handR = k => k.local(0.27, 0.5, 0.2);
  if (name === 'curious') p.handR = k => k.bodyPoint(0.04, 0.27, 0.235);
  S.kip.apply(p);
  const cam = S.cam;
  cam.position.set(0, 0.55, 2.55); cam.lookAt(0, 0.43, 0.5); cam.fov = 30; cam.aspect = S.W / S.H; cam.updateProjectionMatrix();
  S.R.render(S.scene, cam);
  S.octx.clearRect(0, 0, S.W, S.H);
  await new Promise(r => requestAnimationFrame(() => r()));
};
