// Werbens · Education pilot 01 — "Why identical products can feel different in different packaging"
// Deterministic browser Three.js scene: every object, the camera and the HUD are pure functions of t (seconds).
// Harness: scene.html?t=N renders a frozen frame; window.__frame(t) re-renders; window.__ready signals init done.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { E, clamp, lerp, key, ramp, window as win, wobble, spring, noise1, mix, rng } from "./lib/anim.js";
import { makePip, makeQuibble, PALETTE } from "./rig/cast.js";
import { EXPR } from "./rig/character.js";
import { buildStage, buildTable, buildBoxes, buildBubble, buildLamp, buildParticles, makeCookie, TABLE_Y, LAMP } from "./props.js";
import { SHOTS, T, CAPTIONS } from "./timeline.js";

const W = 1080, H = 1920;
const Q = new URLSearchParams(location.search);
await Promise.all(["70px InterDisplayXB", "120px InterDisplayBlack", "40px InterSB", "40px InterB"].map((f) => document.fonts.load(f)));
const WORDS = await (await fetch("/src/words.json")).json();
const LINES = Object.fromEntries(WORDS.lines.map((l) => [l.id, l]));

// ------------------------------------------------------------------ renderer / scene
const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(PALETTE.stage);
scene.fog = new THREE.Fog(PALETTE.stage, 7.5, 17);
const pmrem = new THREE.PMREMGenerator(renderer);
const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
scene.environment = envRT.texture; scene.environmentIntensity = 0.32;
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 60);

const hemi = new THREE.HemisphereLight("#B8A6FF", "#1A0F42", 1.0); scene.add(hemi);
const keyLight = new THREE.SpotLight("#FFF4EC", 95, 0, 0.5, 0.7, 2);
keyLight.position.set(2.1, 4.8, 3.6); keyLight.target.position.set(-0.3, 1.0, -0.3);
keyLight.castShadow = true; keyLight.shadow.mapSize.set(2048, 2048); keyLight.shadow.bias = -0.0003; keyLight.shadow.normalBias = 0.015;
keyLight.shadow.camera.near = 3; keyLight.shadow.camera.far = 11; scene.add(keyLight, keyLight.target);
const rimL = new THREE.DirectionalLight("#BBA6FF", 2.4); rimL.position.set(-3.5, 3.2, -3.8); scene.add(rimL);
const rimR = new THREE.DirectionalLight("#8E6CFF", 2.0); rimR.position.set(3.6, 2.8, -3.2); scene.add(rimR);
const fill = new THREE.DirectionalLight("#D6CCFA", 0.55); fill.position.set(-2.5, 1.6, 3.2); scene.add(fill);

// ------------------------------------------------------------------ cast & props
const stage = buildStage(scene);
const table = buildTable(scene);
const boxes = buildBoxes(scene);
const bubble = buildBubble(scene);
const lamp = buildLamp(scene);
const fx = buildParticles(scene);
const pip = makePip(); scene.add(pip.root, pip.world);
const quib = makeQuibble(); scene.add(quib.root, quib.world);
const handCookie = { luxe: makeCookie(), plain: makeCookie(), pip: makeCookie() };
Object.values(handCookie).forEach((c) => scene.add(c));

const LUXE_AT = new THREE.Vector3(-0.3, TABLE_Y, -0.18), PLAIN_AT = new THREE.Vector3(0.3, TABLE_Y, -0.18);
const REST_LUXE_COOKIE = new THREE.Vector3(-0.1, TABLE_Y, 0.1), REST_PLAIN_COOKIE = new THREE.Vector3(0.14, TABLE_Y, 0.14);
const LUXE_LID_REST = new THREE.Vector3(-0.6, TABLE_Y + 0.003, 0.06);
const PIP_AT = { x: -1.17, z: -0.3, rotY: 0.55 };
const QUIB_AT = { x: 0.04, z: -0.66, rotY: -0.04 };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const atC = (p, x, y, z) => V(p.x + Math.cos(p.rotY) * x + Math.sin(p.rotY) * z, y, p.z - Math.sin(p.rotY) * x + Math.cos(p.rotY) * z);
const vkey = (t, ks) => { const v = key(t, ks.map(([tt, vv, ez]) => [tt, vv.toArray ? vv.toArray() : vv, ez])); return V(...v); };
const inShot = (t, i) => t >= SHOTS[i].t0 && t < SHOTS[i].t1;

// ------------------------------------------------------------------ helpers: speech, blinks, expressions
function talkAt(t) {
  for (const l of WORDS.lines) {
    if (t < l.start - 0.02 || t > l.end + 0.06) continue;
    const i = (t - l.start) * 100, i0 = Math.floor(i), f = i - i0, e = (k) => l.env[k] ?? 0;
    const v = (lerp(e(i0), e(i0 + 1), f) * 2 + e(i0 - 2) + e(i0 + 3)) / 4;
    return clamp((v - 0.012) / 0.085);
  }
  return 0;
}
const blinkAt = (t, times) => { let b = 0; for (const tb of times) { const d = t - tb; if (d > 0 && d < 0.17) b = Math.max(b, 1 - Math.abs(d - 0.075) / 0.085); } return clamp(b); };
const norm = (e) => ({ ...e, lidL: e.lidL ?? e.lid, lidR: e.lidR ?? e.lid });
function exprAt(t, ks, blend = 0.16) {
  let prev = norm(ks[0][1]), cur = prev, tk = -1;
  for (const [tt, e] of ks) if (t >= tt) { prev = cur; cur = norm(e); tk = tt; }
  return mix(prev, [cur, tk < 0 ? 1 : E.inOut(clamp((t - tk) / blend))]);
}
const chew = (t, tb, dur = 0.7) => { const d = t - tb; return d > 0 && d < dur ? (0.5 - 0.5 * Math.cos(d * 2 * Math.PI * 4.2)) * (1 - d / dur) * 0.45 : 0; };

// ------------------------------------------------------------------ box trajectories (boxes drive the hands)
function luxeBox(t) {
  let p = LUXE_AT.clone(), rx = 0, rz = 0, sy = 1;
  if (t < T.landLuxe) { const u = clamp((t - T.dropLuxe) / (T.landLuxe - T.dropLuxe)); p.y = lerp(3.4, TABLE_Y, u * u); rz = (1 - u) * 0.12; }
  else if (t < 2.6) { sy = 1 + wobble(t, T.landLuxe, -0.1, 7, 9); }
  else if (t < 5.9) {
    p = vkey(t, [[T.liftLuxe[0], LUXE_AT], [T.liftLuxe[1], LUXE_AT.clone().add(V(0.02, 0.045, 0.03)), E.out], [T.setDown[0], LUXE_AT.clone().add(V(0.02, 0.05, 0.03))], [T.setDown[1], LUXE_AT]]);
    const held = win(t, T.liftLuxe[0] + 0.1, T.setDown[0] + 0.1, 0.15, 0.15);
    p.x += noise1(t * 14, 3) * 0.006 * held; p.y += noise1(t * 11, 5) * 0.004 * held; rz = 0.05 * held;
  } else if (t >= 11.6) {
    p = vkey(t, [[11.6, V(-0.54, 1.02, -0.06)], [T.pipRaise[1], V(-0.54, 1.14, -0.04), E.outBack], [14.2, V(-0.54, 1.15, -0.04)], [15, V(-0.54, 1.16, -0.04)]]);
    rz = -0.04; rx = 0.08;
  }
  return { p, rx, rz, sy };
}
function plainBox(t) {
  let p = PLAIN_AT.clone(), rx = 0, rz = 0, sy = 1;
  if (t < T.landPlain) { const u = clamp((t - T.dropPlain) / (T.landPlain - T.dropPlain)); p.y = lerp(3.0, TABLE_Y, u * u); rz = -(1 - u) * 0.2; }
  else if (t < 2.6) { p.y += Math.abs(wobble(t, T.landPlain, 0.07, 2.6, 5)); rz = wobble(t, T.landPlain, 0.08, 2.6, 6); }
  else if (t < 5.9) {
    p = vkey(t, [[T.liftPlain[0], PLAIN_AT], [T.liftPlain[1], PLAIN_AT.clone().add(V(0.27, 0.3, 0.1)), E.outBack], [T.setDown[0], PLAIN_AT.clone().add(V(0.26, 0.28, 0.1))], [T.setDown[1], PLAIN_AT]]);
    const held = win(t, T.liftPlain[1], T.setDown[0], 0.2, 0.2);
    p.y += Math.sin(t * 5.2) * 0.012 * held; rz = -0.1 * held + Math.sin(t * 4.1) * 0.03 * held;
  }
  return { p, rx, rz, sy };
}

// ------------------------------------------------------------------ choreography: PIP (host / ad director)
function pipPose(t) {
  const p = { ...PIP_AT, lean: 0, tilt: 0, squash: Math.sin(t * Math.PI * 0.9) * 0.012, bob: 0, lookX: 0.2, lookY: 0, hand: {}, point: {}, talk: talkAt(t), blink: blinkAt(t, [1.62, 3.9, 6.6, 9.85, 12.35]) };
  if (t < 2.6) {
    p.rotY = key(t, [[0, 0.55], [1.25, 0.6], [1.6, 0.95, E.outBack]]);
    p.lookY = key(t, [[0, 0.85], [0.6, 0.6], [0.8, -0.35], [1.3, -0.25], [1.6, 0.05]]);
    p.lookX = key(t, [[0, 0.35], [0.8, 0.75], [1.6, 0.35]]);
    p.squash += wobble(t, T.landLuxe, -0.09, 5, 7); p.bob = wobble(t, T.landLuxe, 0.035, 5, 7);
    p.lean = key(t, [[0, -0.06], [0.7, -0.06], [1.0, 0.08], [1.4, 0.0]]);
    p.expr = exprAt(t, [[0, EXPR.curious], [T.landLuxe, EXPR.shock], [0.95, EXPR.presenter], [1.55, EXPR.smug]], 0.12);
    const pr = ramp(t, T.pipPresent[0], T.pipPresent[0] + 0.35, E.outBack) * (1 - ramp(t, T.pipPresent[1], T.pipPresent[1] + 0.35));
    const clasp = ramp(t, 1.3, 1.7);
    const restR = atC(p, 0.36, 0.92, 0.18), restL = atC(p, -0.36, 0.92, 0.18);
    p.hand.r = restR.clone().lerp(V(-0.62, 1.22, 0.12), pr).lerp(atC(p, 0.06, 1.02, 0.36), clasp);
    p.hand.l = restL.clone().lerp(atC(p, -0.5, 1.28, 0.16), pr).lerp(atC(p, -0.06, 1.0, 0.36), clasp);
    p.hand.r.y += Math.sin(t * 18) * 0.008 * clasp; p.hand.l.y -= Math.sin(t * 18) * 0.008 * clasp; // eager hand rub
  } else if (t < 9.3) {
    // off-camera in S2/S3 (voice continues); keep a neutral watching pose
    p.rotY = 0.95; p.expr = norm(EXPR.presenter); p.lookX = 0.5;
    p.hand.r = atC(p, 0.06, 1.02, 0.36); p.hand.l = atC(p, -0.06, 1.0, 0.36);
  } else if (t < 11.6) {
    p.x = -1.0; p.z = -0.42;
    p.rotY = key(t, [[9.3, -0.15], [9.78, -0.1], [10.1, 0.42, E.outBack]]);
    p.lookY = key(t, [[9.3, 0.9], [9.6, 0.7], [9.8, -0.3], [10.1, 0.0]]);
    p.lookX = key(t, [[9.3, 0.4], [9.8, 0.8], [10.1, 0.2]]);
    const pull = key(t, [[9.3, 0], [9.44, -0.04, E.out], [9.62, 0.13, E.in], [9.7, 0.13], [9.82, 0, E.out]]);
    p.squash += -pull * 0.25; p.bob = -Math.max(0, pull) * 0.15;
    const bead = lamp.setCord(Math.max(0, pull), wobble(t, 9.7, 1, 2.2, 3));
    const onCord = 1 - ramp(t, 9.72, 9.95);
    const present = ramp(t, 10.0, 10.3, E.outBack) * (1 - ramp(t, 11.2, 11.55));
    p.hand.r = bead.clone().lerp(atC(p, 0.36, 0.92, 0.2), 1 - onCord).lerp(V(-0.45, 1.24, 0.14), present);
    p.hand.l = atC(p, -0.36, 0.92, 0.18).lerp(atC(p, -0.5, 1.28, 0.2), present);
    p.lean = -0.05 + present * 0.06;
    p.expr = exprAt(t, [[9.3, EXPR.curious], [9.62, EXPR.wink], [9.85, EXPR.presenter], [10.05, EXPR.smug]], 0.12);
  } else {
    p.x = -1.17; p.z = -0.3; p.rotY = 0.42;
    p.lookX = key(t, [[11.6, 0.6], [12.5, 0.65], [12.75, 0.1], [13.0, 0.45], [13.6, 0.0]]);
    p.lookY = key(t, [[11.6, -0.1], [13.0, -0.2], [13.6, 0.05]]);
    p.lean = key(t, [[11.6, 0.0], [13.2, 0.05], [13.6, -0.02]]);
    p.tilt = key(t, [[13.9, 0], [14.25, -0.08, E.outBack]]);
    const lb = luxeBox(t);
    p.hand.r = lb.p.clone().add(V(-0.02, -0.04, 0.02)); // palm under the box (waiter hold)
    p.elbowBack = { l: -0.55, r: -0.9 };
    p.hand.l = vkey(t, [[11.6, atC(p, -0.42, 1.2, 0.26)], [T.pipRaise[1], atC(p, -0.46, 1.44, 0.3), E.outBack], [12.9, atC(p, -0.44, 1.42, 0.32)], [T.cookieIn[1], lb.p.clone().add(V(-0.02, 0.56, 0.06)), E.inOut], [13.75, lb.p.clone().add(V(-0.04, 0.6, 0.08))], [14.3, atC(p, -0.36, 1.0, 0.25)]]);
    p.expr = exprAt(t, [[11.6, EXPR.presenter], [12.7, EXPR.smug], [13.5, EXPR.presenter], [T.wink, EXPR.wink]], 0.12);
  }
  return p;
}

// ------------------------------------------------------------------ choreography: QUIBBLE (sceptical customer)
function quibPose(t) {
  const p = { ...QUIB_AT, lean: 0, tilt: 0, squash: Math.sin(t * Math.PI * 0.8 + 1) * 0.01, bob: 0, lookX: -0.1, lookY: -0.3, hand: {}, point: {}, talk: 0, blink: blinkAt(t, [0.25, 2.3, 3.3, 6.0, 9.45, 12.6]), curlBounce: 0, glassesSlip: 0 };
  const crossL = atC(p, 0.13, 0.98, 0.31), crossR = atC(p, -0.13, 0.94, 0.33);
  p.elbowBack = { l: -0.1, r: -0.1 };
  if (t < 2.6) {
    p.curlBounce = wobble(t, T.landLuxe, 0.5, 4, 5) + wobble(t, T.landPlain, 0.25, 4, 6);
    p.squash += wobble(t, T.landLuxe, -0.05, 6, 8);
    p.lean = key(t, [[0, 0], [T.quibSquint[0], 0.0], [T.quibSquint[0] + 0.35, 0.2, E.outBack], [1.75, 0.16], [1.85, 0.05], [T.quibPoint, 0.12, E.outBack]]);
    p.lookY = key(t, [[0, 0.7], [0.5, 0.5], [0.75, -0.5], [1.6, -0.75], [1.9, -0.5]]);
    p.lookX = key(t, [[0, 0.0], [0.6, 0.3], [0.8, -0.2], [1.3, 0.35], [1.6, -0.45]]);
    p.expr = exprAt(t, [[0, EXPR.sceptic], [T.landLuxe, EXPR.curious], [T.quibSquint[0], EXPR.squint], [T.quibPoint - 0.1, EXPR.smug]], 0.14);
    const pt = ramp(t, 1.72, T.quibPoint, E.outBack);
    p.hand.r = crossR;
    p.hand.l = crossL.clone().lerp(V(-0.36, 1.32, -0.12), pt).add(V(0, wobble(t, T.quibPoint, 0.03, 3, 6), 0));
    p.point.l = pt;
    p.elbowBack.l = lerp(-0.1, -0.3, pt); p.elbowUp = { l: 0.75 * pt, r: 0 };
  } else if (t < 5.9) {
    const lb = luxeBox(t), pb = plainBox(t);
    const lGrip = lb.p.clone().add(V(0.0, 0.34, 0.07)), pGrip = pb.p.clone().add(V(0.02, 0.23, 0.06));
    const reach = ramp(t, 2.6, 2.72);
    p.hand.r = crossR.clone().lerp(pGrip, reach);
    p.hand.l = crossL.clone().lerp(lGrip, reach);
    const strain = win(t, T.liftLuxe[0], T.setDown[1], 0.25, 0.3);
    p.tilt = 0.1 * strain + noise1(t * 9, 2) * 0.012 * strain;
    p.lean = 0.12 + 0.05 * strain;
    p.squash += -0.05 * strain;
    p.lookX = key(t, [[2.6, 0.1], [2.9, 0.45], [3.45, 0.4], [3.6, -0.5], [4.4, -0.45], [4.55, 0.55], [5.3, 0.5], [5.5, 0.0]]);
    p.lookY = key(t, [[2.6, -0.5], [3.0, 0.1], [3.45, 0.0], [3.6, -0.6], [4.4, -0.55], [4.55, 0.95], [5.3, 0.9], [5.5, -0.4]]);
    p.expr = exprAt(t, [[2.6, EXPR.sceptic], [3.1, EXPR.meh], [3.55, mix(norm(EXPR.squint), [norm(EXPR.shock), 0.25])], [T.bubbleBig, mix(norm(EXPR.curious), [norm(EXPR.delight), 0.45])], [5.4, EXPR.curious]], 0.16);
  } else if (t < 9.3) {
    const luxeTop = LUXE_AT.clone().add(V(0, 0.34, 0)), plainTop = PLAIN_AT.clone().add(V(0, 0.22, 0));
    p.lean = 0.14;
    p.hand.r = crossR.clone().lerp(plainTop.clone().add(V(0.05, 0.06, 0.12)), 0.85);
    // luxe: flick lid → dip → to mouth → bite → hold → set down
    const mouthFor = V(p.x + 0.0, 0.36 + 0.8 - 0.02, p.z + 0.23 + 0.16);
    p.hand.l = vkey(t, [[5.9, luxeTop.clone().add(V(0, 0.05, 0.16))], [T.lidLuxe, luxeTop.clone().add(V(0, 0.1, 0.12)), E.out], [T.grabLuxe[0], luxeTop.clone().add(V(0, 0.12, 0.0))], [T.grabLuxe[1], luxeTop.clone().add(V(0, -0.04, 0.0))], [T.toMouthLuxe[1], mouthFor.clone().add(V(-0.03, -0.01, -0.07)), E.inOut], [T.biteLuxe + 0.05, mouthFor.clone().add(V(-0.03, -0.03, -0.05))], [7.6, mouthFor.clone().add(V(-0.15, -0.24, 0.05))], [7.98, REST_LUXE_COOKIE.clone().add(V(-0.02, 0.05, 0))], [8.3, crossL]]);
    // plain: flick lid → dip → to mouth → bite → shrug
    if (t > 7.85) {
      p.hand.r = vkey(t, [[7.85, crossR], [T.lidPlain, plainTop.clone().add(V(0, 0.08, 0.12)), E.out], [T.grabPlain[0], plainTop.clone().add(V(0, 0.1, 0))], [T.grabPlain[1], plainTop.clone().add(V(0, -0.04, 0))], [T.toMouthPlain[1], mouthFor.clone().add(V(0.03, -0.01, -0.07))], [T.bitePlain + 0.05, mouthFor.clone().add(V(0.03, -0.03, -0.05))], [9.0, mouthFor.clone().add(V(0.22, -0.18, 0.06))], [9.3, mouthFor.clone().add(V(0.26, -0.2, 0.06))]]);
      p.hand.l = p.hand.l.clone().lerp(atC(p, -0.4, 1.16, 0.22), ramp(t, 8.78, 9.05, E.outBack)); // shrug
    }
    p.lookX = key(t, [[5.9, -0.4], [6.4, -0.1], [7.1, 0.0], [7.95, 0.5], [8.4, 0.1], [8.8, 0.0]]);
    p.lookY = key(t, [[5.9, -0.7], [6.3, -0.5], [6.6, -0.2], [7.1, 0.5], [7.9, -0.5], [8.4, -0.2], [8.8, 0.2]]);
    p.tilt = key(t, [[5.9, 0], [7.1, -0.05], [7.9, 0.0], [8.8, 0.06, E.outBack], [9.3, 0.05]]);
    p.squash += wobble(t, T.biteLuxe, 0.05, 6, 8) + wobble(t, T.bitePlain, 0.05, 6, 8) + 0.03 * win(t, T.delight[0], T.delight[1], 0.15, 0.3) - 0.03 * win(t, T.meh[0], 9.3, 0.15, 0.1);
    p.bob = 0.025 * win(t, T.delight[0], T.delight[1], 0.15, 0.3) + 0.02 * win(t, T.meh[0], 9.3, 0.1, 0.1);
    const ex = exprAt(t, [[5.9, EXPR.curious], [T.toMouthLuxe[0] + 0.2, mix(norm(EXPR.curious), [norm(EXPR.shock), 0.5])], [T.biteLuxe, EXPR.neutral], [T.delight[0], EXPR.delight], [7.95, EXPR.sceptic], [T.toMouthPlain[0] + 0.1, mix(norm(EXPR.curious), [norm(EXPR.shock), 0.4])], [T.bitePlain, EXPR.neutral], [T.meh[0], EXPR.meh]], 0.12);
    const bite = (tb) => key(t, [[tb - 0.16, 0], [tb - 0.04, 0.7, E.out], [tb + 0.03, 0, E.in]]);
    ex.open += bite(T.biteLuxe) + bite(T.bitePlain) + chew(t, T.biteLuxe + 0.06, 0.9) + chew(t, T.bitePlain + 0.06, 0.6);
    p.expr = ex;
    p.point.l = 0;
  } else if (t < 11.6) {
    p.hand.l = crossL; p.hand.r = crossR;
    p.lookX = key(t, [[9.3, -0.4], [9.7, -0.2], [10.15, -0.1], [11.0, -0.05], [11.2, 0.2]]);
    p.lookY = key(t, [[9.3, 0.8], [9.62, 0.8], [9.75, -0.6], [10.15, -0.4], [11.1, -0.1]]);
    p.lean = key(t, [[9.3, 0.05], [10.15, 0.05], [10.3, -0.12, E.outBack], [11.1, -0.05]]);
    p.glassesSlip = ramp(t, T.glassesSlip[0], T.glassesSlip[1], E.outBack);
    p.curlBounce = wobble(t, T.shock[0], 0.6, 5, 4);
    const up = ramp(t, T.shock[0], T.shock[0] + 0.2, E.outBack) * (1 - ramp(t, 11.0, 11.4));
    p.hand.l = crossL.clone().lerp(atC(p, -0.36, 1.22, 0.24), up); p.hand.r = crossR.clone().lerp(atC(p, 0.36, 1.22, 0.24), up);
    p.expr = exprAt(t, [[9.3, EXPR.sceptic], [T.lampOn, EXPR.curious], [T.shock[0], EXPR.shock], [11.05, EXPR.sheepish]], 0.12);
  } else {
    p.hand.l = crossL; p.hand.r = crossR; p.glassesSlip = 1 - ramp(t, 12.2, 12.6); p.lookX = -0.6; p.lookY = -0.1;
    p.expr = exprAt(t, [[11.6, EXPR.sheepish], [13.9, mix(norm(EXPR.sheepish), [norm(EXPR.smug), 0.5])]]);
  }
  return p;
}

// precompute bite origins (mouth positions at bite time) for deterministic crumbs
quib.update(quibPose(T.biteLuxe)); const BITE_ORIGIN_LUXE = quib.state.mouth.clone();
quib.update(quibPose(T.bitePlain)); const BITE_ORIGIN_PLAIN = quib.state.mouth.clone();

// ------------------------------------------------------------------ camera
const CAM_FOV = [40, 40, 38, 40, 38];
function cameraAt(t) {
  let pos, tgt, fov, blur = 0;
  if (t < 2.6) { // S1 wide two-shot, slow push-in, shake on the heavy landing
    const u = ramp(t, 0, 2.6, E.sine);
    pos = V(-0.86, 1.56, 4.85).lerp(V(-0.8, 1.52, 4.45), u); tgt = V(-0.6, 1.08, -0.3); fov = 42;
    const sh = wobble(t, T.landLuxe, 0.028, 11, 9); pos.y += sh; tgt.y += sh * 0.6; pos.x += wobble(t, T.landLuxe + 0.01, 0.012, 13, 9);
  } else if (t < 5.9) { // S2 front-right medium on Quibble weighing the boxes
    const u = ramp(t, 2.6, 5.9, E.sine);
    pos = V(0.48, 1.88, 3.72).lerp(V(0.42, 1.85, 3.55), u); tgt = V(0.02, 1.22, -0.4); fov = 40;
  } else if (t < 9.3) { // S3 front-left close medium on the tasting
    const u = ramp(t, 5.9, 9.3, E.sine);
    pos = V(-0.28, 1.74, 3.1).lerp(V(-0.24, 1.75, 2.9), u); tgt = V(0.04, 1.26, -0.4); fov = 38;
  } else if (t < 11.6) { // S4 high wide, whip-in, slow crane down
    // wide for the cord pull + "Same cookies" gesture, then push in on the evidence and Quibble's reaction
    const u1 = ramp(t, 9.3, 10.45, E.sine), u2 = ramp(t, 10.45, 11.6, E.inOut), whip = 1 - ramp(t, 9.3, 9.46, E.out);
    pos = V(-0.42, 2.42, 4.35).lerp(V(-0.4, 2.32, 4.22), u1).lerp(V(-0.05, 1.9, 3.1), u2);
    tgt = V(-0.56, 1.12, -0.35).lerp(V(-0.02, 1.12, -0.25), u2); fov = 40;
    tgt.x += whip * 1.2; blur = whip * 14;
  } else { // S5 medium on Pip with the box
    const u = ramp(t, 11.6, 15, E.sine);
    pos = V(-0.91, 1.53, 3.72).lerp(V(-0.91, 1.5, 3.5), u); tgt = V(-0.91, 1.25, -0.25); fov = 40;
  }
  return { pos, tgt, fov, blur };
}

// ------------------------------------------------------------------ HUD
const $ = (id) => document.getElementById(id);
const capEl = $("cap"), tagsEl = $("tags"), linesEl = $("lines");
const toScreen = (v) => { const p = v.clone().project(camera); return [(p.x + 1) * 0.5 * W, (1 - p.y) * 0.5 * H, p.z]; };
const capCache = new Map();
function captionNodes(c) {
  const k = CAPTIONS.indexOf(c);
  if (capCache.has(k)) return capCache.get(k);
  const L = LINES[c.line], words = L.script.split(" "), [a, b] = c.part || [0, words.length];
  const box = document.createElement("div"); box.className = "box";
  const nodes = words.slice(a, b).map((w, i) => {
    const s = document.createElement("span"); s.className = "w"; s.textContent = w;
    const plain = w.toLowerCase().replace(/[^a-z']/g, "");
    if (c.hi.includes(plain)) s.classList.add("hi");
    box.appendChild(s); return { s, t0: L.words[a + i]?.t0 ?? c.t0 };
  });
  const v = { box, nodes }; capCache.set(k, v); return v;
}
let capShown = null;
function hudCaptions(t) {
  const c = CAPTIONS.find((c) => t >= c.t0 && t < c.t1);
  if (c !== capShown) { capEl.innerHTML = ""; if (c) capEl.appendChild(captionNodes(c).box); capShown = c; }
  if (!c) return;
  const { box, nodes } = captionNodes(c);
  box.style.opacity = String(Math.min(c.t0 <= 0 ? 1 : ramp(t, c.t0, c.t0 + 0.1, E.out2), 1 - ramp(t, c.t1 - 0.12, c.t1)));
  for (const n of nodes) {
    const u = ramp(t, n.t0 - 0.06, n.t0 + 0.1, E.out);
    n.s.style.opacity = String(0.3 + 0.7 * u);
    n.s.style.transform = `translateY(${(1 - u) * 10}px) scale(${0.94 + 0.06 * E.outBack(u)})`;
  }
}
const TAGS = [
  { text: "lighter", dim: true, t0: 3.08, t1: 5.35, anchor: () => plainBox(curT).p.clone().add(V(0.1, 0.26, 0.05)), at: [918, 760] },
  { text: "heavier", t0: T.tagHeavy, t1: 5.4, anchor: () => luxeBox(curT).p.clone().add(V(-0.05, 0.4, 0.05)), at: [196, 712] },
  { text: "angular", t0: T.tagAngular, t1: 5.4, anchor: () => luxeBox(curT).p.clone().add(V(-0.19, 0.3, 0.0)), at: [176, 590] },
];
const tagEls = TAGS.map((g) => { const d = document.createElement("div"); d.className = "tag" + (g.dim ? " dim" : ""); d.textContent = g.text; tagsEl.appendChild(d); return d; });
let curT = 0;
function hudTags(t) {
  let svg = "";
  TAGS.forEach((g, i) => {
    const el = tagEls[i], on = t >= g.t0 && t < g.t1;
    el.style.display = on ? "block" : "none"; if (!on) return;
    const [ax, ay] = toScreen(g.anchor());
    const u = ramp(t, g.t0, g.t0 + 0.22, E.outBack), o = 1 - ramp(t, g.t1 - 0.15, g.t1);
    const w = el.offsetWidth, h = el.offsetHeight;
    const [x, y] = g.at;
    el.style.left = `${x - w / 2}px`; el.style.top = `${y - h / 2}px`;
    el.style.transform = `scale(${u})`; el.style.opacity = String(o);
    const lx = lerp(ax, x, 1), ly = lerp(ay, y, 1);
    svg += `<line x1="${ax}" y1="${ay}" x2="${lerp(ax, lx, u)}" y2="${lerp(ay, ly, u)}" stroke="#F0EAFC" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round" opacity="${o}"/><circle cx="${ax}" cy="${ay}" r="${9 * u}" fill="#F0EAFC" opacity="${o}"/>`;
  });
  // promise link (S5): box emblem ⇄ cookie
  if (t >= T.promiseLink && t < T.cookieIn[0] + 0.1) {
    const lb = luxeBox(t), a = toScreen(lb.p.clone().add(V(0.0, 0.24, 0.17))), b = toScreen(handCookie.pip.position);
    const u = ramp(t, T.promiseLink, T.promiseLink + 0.3, E.out), o = 1 - ramp(t, T.cookieIn[0] - 0.05, T.cookieIn[0] + 0.1);
    svg += `<line x1="${a[0]}" y1="${a[1]}" x2="${lerp(a[0], b[0], u)}" y2="${lerp(a[1], b[1], u)}" stroke="#C9B8FF" stroke-width="7" stroke-dasharray="3 14" stroke-linecap="round" opacity="${o}"/>`;
    svg += `<circle cx="${a[0]}" cy="${a[1]}" r="${16 * u}" fill="none" stroke="#F0EAFC" stroke-width="5" opacity="${o}"/><circle cx="${b[0]}" cy="${b[1]}" r="${62 * u}" fill="none" stroke="#F0EAFC" stroke-width="5" opacity="${o}"/>`;
  }
  linesEl.innerHTML = svg;
}
function hudBadges(t) {
  const eq = $("eq");
  if (t >= T.equal && t < 11.55) {
    const m = toScreen(LUXE_AT.clone().lerp(PLAIN_AT, 0.5).add(V(0, 0.22, 0.2)));
    const u = ramp(t, T.equal, T.equal + 0.25, E.outBack), o = 1 - ramp(t, 11.4, 11.55);
    eq.style.display = "block"; eq.style.left = `${m[0]}px`; eq.style.top = `${m[1]}px`; eq.style.transform = `scale(${u})`; eq.style.opacity = String(o);
  } else eq.style.display = "none";
  const ck = $("check");
  if (t >= T.check) {
    const m = toScreen(luxeBox(t).p.clone().add(V(0.0, 0.66, 0.08)));
    const u = ramp(t, T.check, T.check + 0.25, E.outBack);
    ck.style.display = "block"; ck.style.left = `${m[0]}px`; ck.style.top = `${m[1]}px`; ck.style.transform = `scale(${u})`;
    $("checkPath").style.strokeDasharray = "1"; $("checkPath").style.strokeDashoffset = String(1 - ramp(t, T.check + 0.08, T.check + 0.35, E.out));
  } else ck.style.display = "none";
  $("chip").style.opacity = String(1 - ramp(t, 2.4, 2.55));
  $("note").style.opacity = String(win(t, 5.95, 11.55, 0.25, 0.15));
  $("sig").style.opacity = String(ramp(t, T.signature, T.signature + 0.35));
  $("sig").style.transform = `translateY(${(1 - ramp(t, T.signature, T.signature + 0.4, E.out)) * 16}px)`;
  $("src").style.opacity = String(ramp(t, T.signature + 0.2, T.signature + 0.55));
}

// ------------------------------------------------------------------ effects
function sparkBurst(t, t0, center, from, n, radius, dur, seed, size = 0.09) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const s = fx.sparks[from + i], a = r() * Math.PI * 2, el = (r() - 0.3) * 1.2, rr = radius * (0.6 + r() * 0.6), delay = r() * 0.12;
    const u = (t - t0 - delay) / dur;
    if (u < 0 || u > 1) continue;
    s.visible = true;
    s.position.copy(center).add(V(Math.cos(a) * Math.cos(el) * rr * E.out(u), Math.sin(el) * rr * E.out(u) + u * 0.05, Math.sin(a) * Math.cos(el) * rr * 0.4 * E.out(u)));
    const tw = 0.6 + 0.4 * Math.sin((t - t0) * 40 + i);
    s.scale.setScalar(size * (1 - u * 0.6) * tw * ramp(u, 0, 0.12));
    s.material.opacity = 1 - E.in(u);
    s.material.rotation = u * 2 + i;
  }
}
function dustRing(t, t0, center, from, n, r0, r1, dur, alpha) {
  for (let i = 0; i < n; i++) {
    const s = fx.dust[from + i], u = (t - t0) / dur;
    if (u < 0 || u > 1) continue;
    const a = (i / n) * Math.PI * 2 + 0.3, rr = lerp(r0, r1, E.out(u));
    s.visible = true; s.position.set(center.x + Math.cos(a) * rr, center.y + 0.02 + u * 0.07, center.z + Math.sin(a) * rr * 0.8);
    s.scale.setScalar(lerp(0.1, 0.3, E.out(u))); s.material.opacity = alpha * (1 - u);
  }
}
function crumbBurst(t, tb, origin, from, n, seed) {
  const r = rng(seed), g = -5.5;
  for (let i = 0; i < n; i++) {
    const m = fx.crumbs[from + i];
    const vx = (r() - 0.5) * 0.9, vy = 0.3 + r() * 0.6, vz = 0.15 + r() * 0.45, spin = (r() - 0.5) * 30;
    const d = t - tb; if (d < 0) continue;
    const floorY = Math.abs(origin.x + vx * 0.4) < 0.83 && Math.abs(origin.z + vz * 0.4) < 0.35 ? TABLE_Y + 0.005 : 0.005;
    // landing time: origin.y + vy*d + g/2 d² = floorY
    const A = g / 2, Bq = vy, Cq = origin.y - floorY, tl = (-Bq - Math.sqrt(Bq * Bq - 4 * A * Cq)) / (2 * A);
    const dd = Math.min(d, tl);
    m.visible = true;
    m.position.set(origin.x + vx * dd, origin.y + vy * dd + A * dd * dd, origin.z + vz * dd);
    if (d >= tl) m.position.y = floorY;
    m.rotation.set(spin * dd, spin * 0.7 * dd, 0);
  }
}

// ------------------------------------------------------------------ frame
function setBoxXray(box, u) {
  const [body, ...rest] = box.mats;
  for (const m of box.mats) { m.opacity = lerp(1, m === box.label.material ? 0.18 : 0.26, u); m.depthWrite = u < 0.02; }
  box.edges.material.opacity = u;
}
function placeBox(box, s) { box.group.position.copy(s.p); box.group.rotation.set(s.rx, 0, s.rz); box.group.scale.set(1 + (1 - s.sy) * 0.5, s.sy, 1 + (1 - s.sy) * 0.5); }
function holdCookie(c, hand, toward, t, visible, bitten) {
  c.visible = visible; if (!visible) return;
  const dir = toward.clone().sub(hand).normalize();
  c.position.copy(hand).addScaledVector(dir, Math.min(0.1, hand.distanceTo(toward) - 0.035));
  c.lookAt(c.position.clone().add(dir)); c.rotateX(Math.PI / 2); // cookie face toward the mouth
  c.userData.setBitten(bitten);
}

function frame(t) {
  curT = t;
  // boxes
  const lb = luxeBox(t), pb = plainBox(t);
  placeBox(boxes.luxe, lb); placeBox(boxes.plain, pb);
  // luxe lid: sits on the box, pops off in S3 and lands on the table (stays there)
  const L = boxes.luxe.lid;
  if (t < T.lidLuxe) { L.position.copy(boxes.luxe.group.localToWorld(V(0, boxes.luxe.h, 0))); L.rotation.copy(boxes.luxe.group.rotation); }
  else {
    const u = clamp((t - T.lidLuxe) / 0.42), top = LUXE_AT.clone().add(V(0, boxes.luxe.h, 0));
    L.position.copy(top.clone().lerp(LUXE_LID_REST, E.inOut(u))); L.position.y += Math.sin(Math.PI * u) * 0.34 + Math.abs(wobble(t, T.lidLuxe + 0.42, 0.03, 4, 7));
    L.rotation.set(Math.sin(Math.PI * u) * 0.5, u * 1.3, -u * 0.25 * (1 - u) * 4 + (u >= 1 ? 0 : 0));
  }
  // plain lid: hinged on its right edge, flipped open by Quibble in S3
  boxes.plain.lid.rotation.z = t < 5.9 ? 0 : key(t, [[T.lidPlain, 0], [T.lidPlain + 0.28, -1.95, E.outBack]]);
  // stacks (3 cookies each): Quibble takes one from each; Pip borrows/returns one in S5
  const luxeTaken = t >= T.grabLuxe[1] - 0.04 ? 1 : 0, plainTaken = t >= T.grabPlain[1] - 0.04 ? 1 : 0;
  const pipHas = t >= 11.6 && t < T.cookieIn[1] ? 1 : 0;
  boxes.luxe.stack.forEach((c, i) => (c.visible = i < 3 - luxeTaken - pipHas));
  boxes.plain.stack.forEach((c, i) => (c.visible = i < 3 - plainTaken));
  // x-ray (S4)
  const xr = inShot(t, 3) ? ramp(t, T.xray[0], T.xray[1]) : 0;
  setBoxXray(boxes.luxe, xr); setBoxXray(boxes.plain, xr);
  const on = inShot(t, 3) ? ramp(t, T.lampOn, T.lampOn + 0.06) * (1 - 0.06 * Math.sin(t * 60) * ramp(t, T.lampOn, T.lampOn + 0.15) * (1 - ramp(t, T.lampOn + 0.15, T.lampOn + 0.3))) : 0;
  lamp.beamMat.opacity = 0.13 * on; lamp.light.intensity = 9 * on; lamp.lensMat.color.set(on > 0.5 ? "#FFFFFF" : "#3C2F6E");
  if (!inShot(t, 3)) lamp.setCord(0, 0);

  // characters
  const pp = pipPose(t); pip.update(pp);
  const qp = quibPose(t); const qs = quib.update(qp);

  // cookies in hands
  const mouthQ = qs.mouth.clone();
  const luxeInHand = t >= T.grabLuxe[1] - 0.04 && t < 7.98;
  holdCookie(handCookie.luxe, qs.hand.l, luxeInHand && t < T.toMouthLuxe[0] ? qs.hand.l.clone().add(V(0, 1, 0)) : mouthQ, t, luxeInHand, t >= T.biteLuxe);
  if (t >= 7.98) { handCookie.luxe.visible = t < 11.6; handCookie.luxe.position.copy(REST_LUXE_COOKIE); handCookie.luxe.rotation.set(0, 0.4, 0); handCookie.luxe.userData.setBitten(true); }
  const plainInHand = t >= T.grabPlain[1] - 0.04 && t < 9.3;
  holdCookie(handCookie.plain, qs.hand.r, plainInHand && t < T.toMouthPlain[0] ? qs.hand.r.clone().add(V(0, 1, 0)) : mouthQ, t, plainInHand, t >= T.bitePlain);
  if (t >= 9.3 && t < 11.6) { handCookie.plain.visible = true; handCookie.plain.position.copy(REST_PLAIN_COOKIE); handCookie.plain.rotation.set(0, -0.5, 0); handCookie.plain.userData.setBitten(true); }
  // Pip's cookie (S5): in hand, then dropped into the box
  const pc = handCookie.pip;
  if (t >= 11.6 && t < T.cookieIn[1] + 0.25) {
    pc.visible = true; pc.userData.setBitten(false);
    const hp = pip.state.hand.l.clone();
    if (t < T.cookieIn[0]) { pc.position.copy(hp).add(V(0.0, 0.1, 0.03)); pc.rotation.set(Math.PI / 2 - 0.15, 0, 0.1); }
    else {
      const u = ramp(t, T.cookieIn[0], T.cookieIn[1] + 0.2, E.in), top = lb.p.clone().add(V(0, 0.42, 0.04));
      pc.position.copy(hp.clone().add(V(0, 0.1, 0.03)).lerp(top, ramp(t, T.cookieIn[0], T.cookieIn[1], E.inOut)));
      pc.position.y -= Math.max(0, u - 0.6) * 0.5; pc.rotation.set(lerp(Math.PI / 2 - 0.15, 0, ramp(t, T.cookieIn[0], T.cookieIn[1])), 0, 0.1);
      pc.visible = t < T.cookieIn[1] + 0.12;
    }
  } else pc.visible = false;

  // thought bubble (expectation) — above Quibble's head, faces camera
  const cam = cameraAt(t);
  camera.position.copy(cam.pos); camera.fov = cam.fov; camera.updateProjectionMatrix(); camera.lookAt(cam.tgt); camera.updateMatrixWorld();
  canvas.style.filter = cam.blur > 0.3 ? `blur(${cam.blur.toFixed(1)}px)` : "none";
  const showB = t >= T.bubbleSmall && t < 9.9;
  bubble.group.visible = showB;
  if (showB) {
    const head = qs.head.clone();
    const bp = head.clone().add(V(0.3, 0.4, 0.1));
    const big = t < 5.9 ? ramp(t, T.bubbleBig, T.bubbleBig + 0.4, E.outBack) : 1 - ramp(t, 7.98, 8.25);
    const s = ramp(t, T.bubbleSmall, T.bubbleSmall + 0.3, E.outBack) * lerp(0.62, 1.0, big) * (t >= 5.9 ? 0.85 : 1) * (1 + 0.04 * Math.sin(t * 3.1));
    bubble.cloud.position.copy(bp); bubble.cloud.quaternion.copy(camera.quaternion); bubble.cloud.scale.setScalar(Math.max(0.001, s));
    bubble.trail[0].position.copy(head.clone().lerp(bp, 0.35)); bubble.trail[1].position.copy(head.clone().lerp(bp, 0.14));
    bubble.trail[0].scale.setScalar(ramp(t, T.bubbleSmall - 0.05, T.bubbleSmall + 0.1)); bubble.trail[1].scale.setScalar(ramp(t, T.bubbleSmall - 0.1, T.bubbleSmall + 0.05));
    const el = bubble.expectLuxe, ep = bubble.expectPlain;
    el.position.set(0, 0, 0.16); el.rotation.set(Math.PI / 2 - 0.35, 0, 0); el.scale.setScalar(3.0 * big + 0.001);
    ep.position.set(0, 0, 0.16); ep.rotation.set(Math.PI / 2 - 0.35, 0, 0); ep.scale.setScalar(2.0 * (1 - big) + 0.001);
    el.rotation.z = Math.sin(t * 1.7) * 0.15; ep.rotation.z = Math.sin(t * 1.7) * 0.1;
    const glowPulse = 1 + 0.35 * win(t, T.delight[0], T.delight[1], 0.1, 0.4);
    bubble.glow.position.set(0, 0, 0.1); bubble.glow.scale.setScalar(0.72 * big * glowPulse + 0.001); bubble.glow.material.opacity = big;
  }
  // effects
  [...fx.sparks, ...fx.dust, ...fx.puffs, ...fx.crumbs].forEach((s) => (s.visible = false));
  dustRing(t, T.landPlain, PLAIN_AT, 0, 6, 0.12, 0.3, 0.45, 0.35);
  dustRing(t, T.landLuxe, LUXE_AT, 6, 10, 0.14, 0.52, 0.75, 0.6);
  if (showB) sparkBurst(t, T.bubbleBig + 0.25, bubble.cloud.position.clone().add(V(0, 0, 0.12)), 0, 8, 0.32, 0.7, 11, 0.11);
  sparkBurst(t, T.lidLuxe + 0.02, LUXE_AT.clone().add(V(0, 0.42, 0)), 8, 6, 0.22, 0.6, 21, 0.08);
  sparkBurst(t, T.delight[0], qs.head.clone().add(V(0, -0.15, 0.25)), 14, 10, 0.48, 0.85, 31, 0.1);
  crumbBurst(t, T.biteLuxe, BITE_ORIGIN_LUXE, 0, 11, 41);
  crumbBurst(t, T.bitePlain, BITE_ORIGIN_PLAIN, 11, 11, 43);
  for (let i = 0; i < 3; i++) { // "meh" grey puff
    const s = fx.puffs[i], u = (t - T.meh[0] - i * 0.06) / 0.55; if (u < 0 || u > 1) continue;
    s.visible = true; s.position.copy(qs.head).add(V(0.16 + i * 0.08, 0.08 + u * 0.22, 0.1)); s.scale.setScalar(0.12 + u * 0.12); s.material.opacity = 0.75 * (1 - u); s.material.color.set("#9C96AE");
  }
  if (t >= 9.9 && t < 10.5) { // bubble pops under the X-ray beam
    const c = qs.head.clone().add(V(0.3, 0.4, 0.1));
    for (let i = 0; i < 6; i++) { const s = fx.puffs[i], u = (t - 9.9) / 0.5, a = (i / 6) * Math.PI * 2; s.visible = true; s.position.copy(c).add(V(Math.cos(a) * 0.3 * E.out(u), Math.sin(a) * 0.22 * E.out(u), 0)); s.scale.setScalar(0.16 * (1 - u * 0.5)); s.material.opacity = 0.8 * (1 - u); s.material.color.set("#EDE6FF"); }
  }
  stage.bulbs.forEach((b, i) => (b.material.opacity = 0.75 + 0.25 * Math.sin(t * 2 + i * 1.7)));

  renderer.render(scene, camera);
  hudCaptions(t); hudTags(t); hudBadges(t);
}

// ------------------------------------------------------------------ model sheet mode
function sheet(view) {
  const [who, kind, arg] = view.split(":");
  const ch = who === "pip" ? pip : quib, other = who === "pip" ? quib : pip;
  [boxes.luxe.group, boxes.plain.group, bubble.group, lamp.group, fx.group, other.root, other.world, ...Object.values(handCookie)].forEach((o) => (o.visible = false));
  ch.root.visible = ch.world.visible = true; boxes.luxe.lid.visible = false;
  table.visible = false;
  $("hud").querySelectorAll("#chip,#tags,#eq,#check,#cap,#note,#sig,#src,#lines").forEach((e) => (e.style.display = "none"));
  const p = { x: 0, z: 1.2, rotY: 0, lean: 0, tilt: 0, squash: 0, bob: 0, lookX: 0, lookY: 0, hand: {}, point: {}, talk: 0, blink: 0, expr: norm(EXPR[arg] || EXPR.neutral) };
  let label = "", sub = "";
  const name = ch.spec.name;
  if (kind === "turn") { p.rotY = { front: 0, three: 0.75, side: 1.5708, back: Math.PI }[arg]; p.expr = norm(who === "pip" ? EXPR.presenter : EXPR.sceptic); label = name; sub = arg === "three" ? "¾ view" : arg; }
  else if (kind === "expr") { label = name; sub = arg; }
  else if (kind === "pose") {
    label = name; sub = arg;
    if (arg === "present") { p.expr = norm(EXPR.presenter); p.hand.r = atC(p, 0.5, 1.3, 0.25); p.hand.l = atC(p, -0.5, 1.3, 0.25); p.lean = -0.05; }
    if (arg === "point") { p.expr = norm(EXPR.smug); p.hand.l = atC(p, -0.25, 1.5, 0.5); p.point.l = 1; p.hand.r = atC(p, 0.12, 0.98, 0.33); p.rotY = 0.2; }
    if (arg === "crossed") { p.expr = norm(EXPR.sceptic); p.hand.l = atC(p, 0.13, 0.98, 0.31); p.hand.r = atC(p, -0.13, 0.94, 0.33); p.elbowBack = { l: -0.1, r: -0.1 }; }
    if (arg === "shrug") { p.expr = norm(EXPR.meh); p.hand.l = atC(p, -0.42, 1.16, 0.22); p.hand.r = atC(p, 0.42, 1.16, 0.22); p.tilt = 0.06; }
    if (arg === "wink") { p.expr = norm(EXPR.wink); p.hand.r = atC(p, 0.32, 1.15, 0.32); p.point.r = 1; p.tilt = -0.08; }
    if (arg === "strain") { p.expr = norm(EXPR.squint); p.tilt = 0.1; p.squash = -0.05; p.hand.l = atC(p, -0.32, 0.92, 0.35); p.hand.r = atC(p, 0.3, 0.9, 0.3); }
  }
  ch.update(p);
  const close = kind === "expr";
  const h = ch.height + ch.spec.legLen;
  const tgt = close ? V(0, ch.spec.legLen + ch.spec.eye.y - 0.05, 1.2) : V(0, h * 0.5 + 0.05, 1.2);
  camera.fov = close ? 30 : 30; camera.position.set(0, tgt.y + (close ? 0.05 : 0.15), 1.2 + (close ? 2.4 : 5.0)); camera.updateProjectionMatrix(); camera.lookAt(tgt); camera.updateMatrixWorld();
  const sl = $("sheetLabel"); sl.style.display = "block"; sl.innerHTML = `${label}<small>${sub}</small>`;
  renderer.render(scene, camera);
}

// ------------------------------------------------------------------ harness
window.__frame = (t) => frame(t);
window.__sheet = (v) => sheet(v);
window.__info = () => ({ ...renderer.info.memory, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles });
window.__dispose = () => {
  scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) { for (const k in m) if (m[k] && m[k].isTexture) m[k].dispose(); m.dispose(); } });
  envRT.dispose(); pmrem.dispose(); renderer.dispose();
};
if (Q.has("sheet")) sheet(Q.get("sheet")); else frame(+(Q.get("t") || 0));
if (Q.has("play")) { const c = new THREE.Clock(); renderer.setAnimationLoop(() => frame(c.getElapsedTime() % 15)); }
window.__ready = true;
