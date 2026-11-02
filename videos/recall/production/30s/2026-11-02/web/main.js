// Entry: builds the challenge set once, renders any frame deterministically, logs overlay boxes + safe-area anchors.
import * as THREE from 'three';
import { buildSet } from './set.js';
import { Kip } from './character.js';
import { SteelPiece, makeHullGhost, Splash, Bubbles } from './props.js';
import { makeChoreo, KR } from './choreo.js';
import { drawOverlay } from './overlay.js';
import { PAL, clayMat } from './clay.js';
import * as PH from './physics.js';
import { clamp, seg, E, rng } from './anim.js';

const S = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);

function insideDisc() {
  const { a, b, n, taper } = PH.HULL, sh = new THREE.Shape();
  for (let i = 0; i <= 96; i++) {
    const ph = (i / 96) * Math.PI * 2, c = Math.cos(ph), s = Math.sin(ph);
    const x = a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const z = b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * (1 - taper * Math.pow(Math.max(0, x / a), 2.4));
    if (i === 0) sh.moveTo(x, z); else sh.lineTo(x, z);
  }
  const g = new THREE.ShapeGeometry(sh, 2); g.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#A9E4D4', transparent: true, opacity: 0.78, roughness: 0.08, envMapIntensity: 1.4, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 5;
  return m;
}

window.__setup = async (d) => {
  S.d = d; S.W = d.width; S.H = d.height;
  await Promise.all(['600 54px Fredoka', '700 30px Fredoka', '400 60px "Titan One"'].map(f => document.fonts.load(f)));
  const gl = document.getElementById('gl'), ov = document.getElementById('ov');
  for (const c of [gl, ov]) { c.width = S.W; c.height = S.H; c.style.width = S.W + 'px'; c.style.height = S.H + 'px'; }
  S.octx = ov.getContext('2d');
  const R = new THREE.WebGLRenderer({ canvas: gl, antialias: d.aa !== false, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(S.W, S.H, false);
  R.toneMapping = THREE.NeutralToneMapping; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap; R.localClippingEnabled = true;
  S.R = R;
  S.scene = new THREE.Scene(); S.scene.background = new THREE.Color('#14180F');
  S.cam = new THREE.PerspectiveCamera(30, S.W / S.H, 0.05, 40);
  S.set = buildSet(S.scene, R);
  S.kip = new Kip(1.2); S.kip.addTo(S.scene);
  S.ball = new SteelPiece(); S.ball.setMorph(0); S.scene.add(S.ball.mesh);
  S.ship = new SteelPiece(); S.ship.setMorph(1); S.scene.add(S.ship.mesh);
  S.ghost = makeHullGhost(); S.scene.add(S.ghost.mesh);
  S.inside = insideDisc(); S.scene.add(S.inside);
  // plug with a lime pull-ring
  S.plug = new THREE.Group();
  const lime = clayMat(PAL.lime, { bump: 0.6 });
  const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.013, 0.02, 16), lime);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.035, 8), clayMat(PAL.ink, { bump: 0.3 })); stem.position.y = 0.027;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.005, 10, 24), lime); ring.position.y = 0.06;
  S.plug.add(cork, stem, ring); S.scene.add(S.plug);
  S.splashBall = new Splash(S.scene, 16, 11, 0.8);
  S.splashShip = new Splash(S.scene, 12, 19, 0.6);
  S.splashFlood = new Splash(S.scene, 12, 29, 0.5);
  S.bubBall = new Bubbles(S.scene, 12, 5);
  S.bubShip = new Bubbles(S.scene, 18, 7);
  const R2 = rng(77);
  S.jet = Array.from({ length: 16 }, () => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.006 + R2() * 0.006, 8, 6), S.splashBall.mat); m.visible = false; S.scene.add(m);
    return { m, ph: R2(), dx: (R2() - 0.5) * 0.03, dz: (R2() - 0.5) * 0.03, v: 0.75 + R2() * 0.3 };
  });
  S.choreo = makeChoreo(d.timeline);
  S.capCache = {};
  S.icon = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = '/app-assets/icon.png'; });
  R.compile(S.scene, S.cam);
  return PH.report();
};

const project = v => { const p = v.clone().project(S.cam); return { x: (p.x * 0.5 + 0.5) * 1080, y: (-p.y * 0.5 + 0.5) * 1920 }; };
const projR = (c, r) => { const a = project(c), b = project(c.clone().add(V(0, r, 0))); return { ...a, r: Math.abs(b.y - a.y) }; };

function applyFrame(f) {
  const t = f / 30, s = S.choreo.frame(t), C = s.cues;
  const cam = S.cam;
  cam.position.set(...s.cam.pos); cam.lookAt(...s.cam.target); cam.fov = s.cam.fov; cam.aspect = S.W / S.H; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
  S.set.sun.rotation.z = -t * 0.06;
  S.set.sunMat.color.setScalar(0.9 + 0.1 * s.fx.beat);
  S.kip.apply(s.kip);

  // steel pieces
  S.ball.mesh.position.set(...s.ball);
  const sh = s.ship;
  S.ship.mesh.position.set(...sh.pos); S.ship.mesh.rotation.set(0, 0, sh.tilt || 0);
  const z1 = PH.TANK.z1 + 0.012;

  // water
  const rip = (x, z, age, amp) => ({ x, z, age, amp });
  S.set.waters[0].set(s.ballLevel, [rip(-0.31, -0.03, t - C.splash, 0.012)], t, null);
  const shipBottom = sh.pos[1] - PH.HULL.D / 2;
  const afloat = sh.phase === 'float' || sh.phase === 'filling' || (sh.phase === 'replay' && sh.w < PH.W_MAX * 0.97);
  const hole = afloat && shipBottom < sh.level + 0.01 ? { x: sh.pos[0], z: sh.pos[2] } : null;
  S.set.waters[1].set(sh.level, [rip(0.31, 0, t - C.shipTouch, 0.008), rip(0.31, 0, t - C.founder, 0.01), rip(0.31, 0, t - C.replayEnd + 0.2, 0.004)], t, hole);

  // inside water while the ship fills (or refills in the replay)
  const showInside = (sh.phase === 'filling' || sh.phase === 'replay') && sh.w > 1e-5 && afloat;
  S.inside.visible = showInside;
  if (showInside) {
    const hIn = PH.insideHeight(sh.w), { bilge, qb, t: th, b, a } = PH.HULL;
    const q = hIn < bilge ? qb + (1 - qb) * Math.sin(Math.acos(1 - hIn / bilge)) : 1;
    S.inside.position.set(sh.pos[0], sh.pos[1] - PH.HULL.D / 2 + th + hIn, sh.pos[2]);
    S.inside.scale.set(q * (1 - 2 * th / a), 1, q * (1 - 2 * th / b));
    S.inside.rotation.set(0, 0, sh.tilt || 0);
  }
  // plug: in the hull, then in Kip's hand, flies back during the replay
  const hand = S.kip.arms[1].hand.position;
  const plugHome = V(sh.pos[0] - 0.1, shipBottom + PH.HULL.t + 0.01, sh.pos[2]);
  const inHand = V(hand.x, hand.y - 0.05, hand.z);
  if (t < C.plugPull) S.plug.position.copy(plugHome);
  else if (t < C.replay + 0.75) S.plug.position.copy(inHand);
  else S.plug.position.copy(inHand.lerp(plugHome, seg(t, C.replay + 0.75, C.replayEnd - 0.05, E.io)));
  S.plug.rotation.set(0, 0, t >= C.plugPull && t < C.replayEnd - 0.05 ? 0.3 : 0);
  // fountain through the plug hole while filling
  const jetOn = sh.phase === 'filling' ? 1 - seg(t, C.founder - 0.5, C.founder) : 0;
  const inTop = showInside ? S.inside.position.y : shipBottom + PH.HULL.t;
  for (const j of S.jet) {
    const ph = (t * 2.6 + j.ph) % 1, T = 0.32 * ph;
    const y = plugHome.y + 0.02 + j.v * T - 4.9 * T * T * 3;
    j.m.position.set(plugHome.x + j.dx * ph * 3, y, plugHome.z + j.dz * ph * 3);
    j.m.visible = jetOn > 0.05 && y > inTop - 0.003 && ph < 0.95;
  }
  // splashes and bubbles
  S.splashBall.update(t - C.splash, [-0.31, s.ballLevel, -0.03], s.ballLevel, 0.15);
  S.splashShip.update(t - C.shipTouch, [0.31 + 0.15, sh.level, 0.06], sh.level, 0.15);
  S.splashFlood.update(sh.phase === 'sinking' || sh.phase === 'sunk' ? t - C.founder : -1, [0.31 - 0.12, sh.level, 0.05], sh.level, 0.15);
  S.bubBall.update(t - C.splash - 0.05, [...s.ball], s.ballLevel);
  S.bubShip.update(sh.phase === 'sinking' || sh.phase === 'sunk' ? t - C.founder : -1, [sh.pos[0], sh.pos[1] + 0.05, sh.pos[2]], sh.level);

  // displaced-water glow on the ship (clipped at the chamber's waterline)
  S.ghost.mesh.visible = s.fx.shipGhost > 0.01;
  S.ghost.mesh.position.set(...sh.pos); S.ghost.mat.opacity = 0.5 * s.fx.shipGhost; S.ghost.plane.constant = sh.level - 0.002;

  // projected anchors
  const P = {};
  P.ball = projR(V(...s.ball), PH.BALL_R);
  const sc = V(sh.pos[0], sh.pos[1], sh.pos[2] + PH.HULL.b);
  P.shipCenter = project(sc);
  P.shipTop = project(V(sh.pos[0], sh.pos[1] + PH.HULL.D / 2, sh.pos[2] + PH.HULL.b));
  P.shipBottom = project(V(sh.pos[0], sh.pos[1] - PH.HULL.D / 2, sh.pos[2] + PH.HULL.b));
  P.stampL = project(V(-0.33, 0.83, z1)); P.stampR = project(V(0.33, 0.83, z1));
  P.start0 = project(V(PH.TANK.x0 + 0.01, PH.TANK.level0, z1)); P.start1 = project(V(PH.TANK.x1 - 0.01, PH.TANK.level0, z1));
  P.levelL = project(V(-0.57, s.ballLevel, z1)); P.baseL = project(V(-0.57, PH.TANK.level0, z1));
  P.levelR = project(V(0.57, sh.level, z1)); P.baseR = project(V(0.57, PH.TANK.level0, z1));
  P.sameW = project(V(0, 0.53, z1));
  P.hand = project(hand);
  // safe-area anchors: top of Kip's helmet and the tank floor
  const hatTop = S.kip.hat.localToWorld(V(0, 0.15, 0));
  const safe = { kipTop: project(hatTop).y, tankFloor: project(V(0, PH.TANK.floor, z1)).y, tankTop: project(V(0, PH.TANK.top, z1)).y,
    tankLeft: project(V(PH.TANK.x0, PH.TANK.floor, z1)).x, tankRight: project(V(PH.TANK.x1, PH.TANK.floor, z1)).x };
  return { s, P, safe };
}

window.__renderFrame = async (f) => {
  const { s, P, safe } = applyFrame(f);
  S.R.render(S.scene, S.cam);
  const boxes = drawOverlay(S.octx, S.W, S.H, s, P, S.d.timeline, S.icon, S.capCache);
  await new Promise(r => requestAnimationFrame(() => r()));
  return { boxes, safe, ballLevel: s.ballLevel, shipLevel: s.ship.level, phase: s.ship.phase };
};
window.__sheetPoses = () => [];
