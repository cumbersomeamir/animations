// Entry: builds the balance stage once; renders any frame deterministically; logs overlay boxes + safe anchors.
import * as THREE from 'three';
import { buildSet } from './set.js';
import { buildBalance, updateFeathers } from './balance.js';
import { Kip } from './character.js';
import { makeChoreo } from './choreo.js';
import { drawOverlay } from './overlay.js';
import * as PH from './physics.js';
import { seg, E, pulse } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 54px Fredoka', '700 30px Fredoka', '400 60px "Titan One"'].map(f => document.fonts.load(f)));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d');
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false);
  R.toneMapping = THREE.NeutralToneMapping; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap;
  S.R = R;
  S.scene = new THREE.Scene(); S.scene.background = new THREE.Color('#14180F');
  S.cam = new THREE.PerspectiveCamera(30, S.W / S.H, 0.05, 40);
  S.set = buildSet(S.scene, R);
  S.B = buildBalance(S.scene);
  S.kip = new Kip(1.2); S.kip.addTo(S.scene);
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  R.compile(S.scene, S.cam);
  return PH.report();
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };

function applyFrame(f) {
  const t = f / 30, s = S.choreo.frame(t), C = s.cues, B = S.B;
  const cam = S.cam;
  cam.position.set(...s.cam.pos); cam.lookAt(...s.cam.target); cam.fov = s.cam.fov; cam.aspect = S.W / S.H; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
  S.set.sun.rotation.z = -t * 0.06; S.set.sunMat.color.setScalar(0.9 + 0.1 * s.fx.beat);
  S.kip.apply(s.kip);

  // balance
  const th = s.tilt, pans = PH.panPositions(th);
  B.beam.rotation.z = th;
  B.pans[0].position.set(...pans.panL); B.pans[1].position.set(...pans.panR);
  const handL = S.kip.arms[0].hand.position.clone(), handR = S.kip.arms[1].hand.position.clone();

  // contents (round 1: cube + sack; round 2: same-size boxes) with a pop on each swap
  const ct = s.contents, sc = ct.out ? Math.max(0.001, ct.out.s) : ct.pop;
  const r1 = ct.round === 1;
  B.cube.visible = r1; B.sack.visible = r1; B.boxSteel.visible = !r1; B.boxFeather.visible = !r1;
  if (t < C.cubePlace) B.cube.position.copy(handL).add(V(0, -(PH.CUBE / 2 + 0.035), 0));
  else B.cube.position.set(pans.panL[0], pans.panL[1] + PH.CUBE / 2, pans.panL[2]);
  if (t < C.sackPlace) B.sack.position.copy(handR).add(V(0, -(PH.SACK.h * 0.93 + 0.03), -0.04));
  else B.sack.position.set(pans.panR[0], pans.panR[1], pans.panR[2]);
  const poke = pulse(t, C.pile + 0.05, C.pile + 0.45);
  B.cube.scale.setScalar(r1 ? sc : 1);
  B.sack.scale.set(r1 ? sc * (1 + 0.04 * poke) : 1, r1 ? sc * (1 - 0.08 * poke) : 1, r1 ? sc * (1 + 0.04 * poke) : 1);
  B.boxSteel.position.set(...pans.panL); B.boxFeather.position.set(...pans.panR);
  B.boxSteel.scale.setScalar(!r1 ? sc : 1); B.boxFeather.scale.setScalar(!r1 ? sc : 1);

  // lock pin: in the pivot, in Kip's hand while pulled, parked on the base after round 2
  const pinHome = V(PH.BAL.pivot[0] + 0.03, PH.BAL.pivot[1], PH.BAL.pivot[2] + 0.05);
  const pinPark = V(0.17, 0.078, 0.06);
  const inHand = handR.clone().add(V(-0.085, 0, 0));
  if (t < C.pinOut1 || (t >= C.pinIn && t < C.pinOut2)) B.pin.position.copy(pinHome);
  else if (t < C.pinIn) B.pin.position.copy(inHand);
  else if (t < C.slam + 1.0) B.pin.position.copy(inHand);
  else B.pin.position.copy(inHand.lerp(pinPark, seg(t, C.slam + 1.0, C.slam + 1.35, E.io)));
  B.pin.rotation.set(0, 0, t >= C.slam + 1.0 ? 0 : 0);
  // swap button press
  let press = 0; for (const tt of [C.flip, C.tog1, C.tog2, C.tog3]) press = Math.max(press, pulse(t, tt - 0.06, tt + 0.12));
  B.button.scale.set(1, 0.7 - 0.35 * press, 1);

  // feathers puff when the sack lands, when it is poked, and when round 2 slams
  updateFeathers(B, [
    { t: C.sackPlace, p: [pans.panR[0], pans.panR[1] + PH.SACK.h * 0.9, 0], n: 7, floor: 0.0 },
    { t: C.pile + 0.1, p: [pans.panR[0] - 0.05, pans.panR[1] + PH.SACK.h * 0.85, 0.05], n: 4, floor: 0.0 },
    { t: C.slam, p: [pans.panR[0], pans.panR[1] + PH.BOX, 0], n: 5, floor: 0.0 },
  ], t);

  // projected anchors
  const P = {};
  P.pivot = project(V(...PH.BAL.pivot).add(V(0, 0, 0.06)));
  P.base = project(V(0, 0.035, 0.16));
  if (r1) {
    const cc = B.cube.position;
    P.cubeTop = project(cc.clone().add(V(0, PH.CUBE / 2, 0)));
    P.sackTop = project(B.sack.position.clone().add(V(0, PH.SACK.h + 0.03, 0)));
    const box = (c, w, h, d, y0) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].flatMap(() => []).concat(
      [y0, y0 + h].flatMap(y => [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([sx, sz]) => project(V(c.x + sx * w / 2, y, c.z + sz * d / 2)))));
    const e = PH.CUBE * 1.35;
    P.cubeBox = box(cc, e, e, e, cc.y - e / 2);
    P.sackBox = box(B.sack.position, PH.SACK.w * 1.02, PH.SACK.h * 1.02, PH.SACK.d * 1.02, B.sack.position.y);
    P.sackMid = project(B.sack.position.clone().add(V(0, PH.SACK.h * 0.45, PH.SACK.d * 0.52)));
  } else {
    const br = (p) => ({ l: project(V(p[0] - PH.BOX / 2, p[1] + PH.BOX + 0.035, PH.BOX / 2)).x, r: project(V(p[0] + PH.BOX / 2, p[1] + PH.BOX + 0.035, PH.BOX / 2)).x,
      y: project(V(p[0], p[1] + PH.BOX + 0.035, PH.BOX / 2)).y });
    P.boxL = br(pans.panL); P.boxR = br(pans.panR);
    P.sizeLabel = project(V(0, 0.3, 0.16));
  }
  P.stampL = project(V(-0.5, 0.86, 0.1));
  P.stampC = project(V(0, 0.36, 0.14));
  const hatTop = S.kip.hat.localToWorld(V(0, 0.15, 0));
  const safe = { kipTop: project(hatTop).y, tankFloor: Math.max(project(V(0, 0, 0.15)).y, project(V(pans.panL[0], pans.panL[1] - 0.03, 0.17)).y),
    tankTop: project(V(...PH.BAL.pivot)).y, tankLeft: project(V(pans.panL[0] - PH.BAL.panR, pans.panL[1], 0)).x,
    tankRight: project(V(pans.panR[0] + PH.SACK.w / 2, pans.panR[1], 0)).x };
  return { s, P, safe };
}

window.__renderFrame = async (f) => {
  const { s, P, safe } = applyFrame(f);
  S.R.render(S.scene, S.cam);
  const boxes = drawOverlay(S.octx, S.W, S.H, s, P, S.d.timeline, S.icon, S.capCache);
  await new Promise(r => requestAnimationFrame(() => r()));
  return { boxes, safe, tilt: s.tilt, round: s.contents.round };
};
window.__sheetPoses = () => [];
