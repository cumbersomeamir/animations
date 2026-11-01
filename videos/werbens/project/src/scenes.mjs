// Werbens 30s promo — scene compositor. Every entity is a pure function of frame f.
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { C } from "./lib/palette.mjs";
import { W, H, FPS, E, clamp, lerp, inv, tw, track, spring, wobble, mulberry32, bezier, quad, samplePath, catmull, polyLength, pointAt, subPath } from "./lib/util.mjs";
import { rr, circle, line, dust, burst, sparkle, speedLines, swirl, icon, groundShadow } from "./lib/draw.mjs";
import { drawStick, rigWorld, poseAt, pose, mixPose, addPose, walkPose, faceAt, POSES } from "./lib/rig.mjs";
import { FONT, drawBrief, drawPlane, drawStamp, drawPhone, PHONE, drawIsland, drawBubble, drawAvatar, drawCard, CARD, drawBulb, confetti } from "./lib/props.mjs";
import { drawRibbon, loopPoints } from "./lib/ribbon.mjs";
import { drawCaption } from "./lib/captions.mjs";
import { K, loadNarration } from "./timeline.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const GROUND = 1420;

// ======================================================================================
// Setup
// ======================================================================================
export async function setup() {
  const F = path.join(ROOT, "fonts");
  GlobalFonts.registerFromPath(path.join(F, "InterDisplay-ExtraBold.otf"), FONT.display);
  GlobalFonts.registerFromPath(path.join(F, "InterDisplay-Black.otf"), FONT.black);
  GlobalFonts.registerFromPath(path.join(F, "Inter-SemiBold.otf"), FONT.semi);
  GlobalFonts.registerFromPath(path.join(F, "Inter-Bold.otf"), FONT.bold);
  const icon = await loadImage(path.join(ROOT, "..", "assets", "icon.png"));
  const { captions } = loadNarration(ROOT);
  return { icon, bg: makeBackground(), captions };
}

function makeBackground() {
  const cv = createCanvas(W, H);
  const ctx = cv.getContext("2d");
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  // paper grain
  const img = ctx.getImageData(0, 0, W, H);
  const r = mulberry32(2024);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * 10 + (r() < 0.002 ? -18 : 0);
    img.data[i] = clamp(img.data[i] + n, 0, 255);
    img.data[i + 1] = clamp(img.data[i + 1] + n, 0, 255);
    img.data[i + 2] = clamp(img.data[i + 2] + n * 0.9, 0, 255);
  }
  ctx.putImageData(img, 0, 0);
  // vignette
  const g = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.5, H * 0.75);
  g.addColorStop(0, "rgba(27,20,51,0)");
  g.addColorStop(1, "rgba(27,20,51,0.10)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // halftone corners (editorial texture)
  ctx.fillStyle = "rgba(98,52,251,0.10)";
  for (let y = 0; y < 300; y += 22) for (let x = 0; x < 300; x += 22) {
    const d = Math.hypot(W - x - W, y) / 300;
    const rad = Math.max(0, 5 * (1 - Math.hypot(x, y) / 320));
    if (rad > 0.4) { ctx.beginPath(); ctx.arc(W - 20 - x, 20 + y, rad, 0, Math.PI * 2); ctx.fill(); }
  }
  return cv;
}

// ======================================================================================
// Camera
// ======================================================================================
const CAM = {
  x: [[0, 330], [86, 330], [110, 540], [K.camPush[0], 540], [K.camPush[1], 560], [425, 560], [447, 600], [572, 600], [592, 615], [K.boardIn, 615], [K.boardIn + 16, 600], [K.camOut[0], 600], [K.camOut[1], 540]],
  y: [[0, 1180], [86, 1180], [110, 960], [K.camPush[0], 960], [K.camPush[1], 1130], [425, 1130], [447, 1100], [572, 1100], [592, 1160], [K.boardIn, 1160], [K.boardIn + 16, 1130], [K.camOut[0], 1130], [K.camOut[1], 1000]],
  z: [[0, 1.3], [86, 1.36], [110, 1.0], [K.camPush[0], 1.0], [K.camPush[1], 1.28], [425, 1.28], [447, 1.12], [572, 1.12], [592, 1.3], [K.boardIn, 1.3], [K.boardIn + 16, 1.62], [K.camOut[0], 1.62], [K.camOut[1], 1.0]],
};
function camera(f) {
  let x = track(CAM.x, f), y = track(CAM.y, f), z = track(CAM.z, f);
  // impacts shake the camera
  const sh = wobble(f, K.phoneLand, 9, 7, 16) + wobble(f, K.stampHit, 10, 10, 5) + wobble(f, K.crash, 9, 10, 4) + wobble(f, K.confetti, 8, 9, 4) + wobble(f, K.c1Land, 9, 10, 3);
  const sh2 = wobble(f, K.phoneLand + 1, 7, 7, 10);
  return { x: x + sh2 * 0.6, y: y + sh, z };
}
const toScreen = (cam, p) => ({ x: (p.x - cam.x) * cam.z + W / 2, y: (p.y - cam.y) * cam.z + H / 2 });

// ======================================================================================
// Characters
// ======================================================================================
const B_SCALE = 0.85;
const bX = (f) => track([[0, 250], [K.walk[0], 250], [K.walk[1], 355, E.linear]], f);

const B_POSES = [
  [0, "lookUp"], [5, "lookUp"], [K.crouch + 4, "crouch", E.inOutQuad], [K.launch + 1, "reachUp", E.outCubic], [26, "reachUp"],
  [K.land, "land", E.inQuad], [42, "holdUp", E.outBack], [K.stampHit, "holdUp"],
  [K.stampHit + 3, pose("holdUp", { t: 6, aHip: 34, aKn: 48, bHip: 14, bKn: 44, aEl: 40, bEl: 46 }), E.outQuad], [68, "holdUp", E.outBack],
  [82, "holdFront"], [K.foldStart, "holdFront"], [K.foldEnd, pose("holdFront", { aSh: 72, aEl: 50 })],
  [K.windUp + 6, "windUp", E.inOutQuad], [K.release - 1, pose("windUp", { t: -20, aSh: -150 })], [K.release + 3, "throw", E.outCubic],
  [126, pose("throw", { head: -16 })], [134, pose("stand", { head: -14, aSh: 30, aEl: 30 })], [K.crash + 4, "shock", E.outBack],
  [K.crash + 10, "shock"], [K.crash + 20, "slump"], [K.tangleStart + 14, "tangled"], [K.snip, "tangled"],
  [K.snip + 4, "shock", E.outCubic], [K.shakeOff[1], "stand"], [K.shakeOff[1] + 6, "fist", E.outBack], [K.walk[0], "stand"],
  [K.walk[1], "stand"], [K.tap - 2, "point", E.outCubic], [K.tap + 8, "point"], [318, pose("stand", { head: -10 })],
  [345, pose("stand", { head: -6 })], [366, "fist", E.outBack], [380, "stand"], [K.hover[0] - 4, pose("point", { aSh: 74 })],
  [K.hover[1], pose("point", { aSh: 90 })], [K.hover[2], pose("point", { aSh: 80 })], [K.tapCard, pose("point", { aSh: 86 })],
  [K.tapCard + 8, pose("point", { aSh: 86 })], [K.jumpOut + 4, pose("shock", { aSh: 120, bSh: 110 })], [K.c1Land + 2, "stand"],
  [K.bend + 2, "stand"], [K.pick, "bendPick", E.inOutQuad], [K.pick + 3, "bendPick"], [K.uncrumple[0], "holdFront", E.outCubic],
  [K.fold[1], pose("holdFront", { aSh: 72, aEl: 50 })], [K.throw2 - 1, "windUp", E.inOutQuad], [K.throw2 + 3, "throw", E.outCubic],
  [503, pose("throw", { head: -12 })], [510, pose("stand", { head: -10 })], [K.catch2 + 4, "fist", E.outBack], [530, "fist"],
  [540, "stand"], [690, "stand"], [K.cheer, "crouch"], [K.cheer + 6, "cheer", E.outCubic], [K.cheer + 16, "cheer"],
];
const B_FACE = [
  [0, { eye: 1.2, brow: 0.6, smile: 0.1, open: 0.25, lookY: -1 }], [12, { eye: 1.1, brow: 0.2, smile: 0.2, lookY: -1 }],
  [K.catch, { eye: 1.25, brow: 0.8, smile: 1, open: 0.6, lookY: -1 }], [36, { eye: 1, brow: 0.3, smile: 1, open: 0.3 }],
  [52, { eye: 1.1, brow: 0.5, smile: 1, blush: 0.5, lookY: -1 }], [K.stampHit, { eye: 0.12, brow: -0.3, smile: 0.2, open: 0.4 }],
  [62, { eye: 1.2, brow: 0.7, smile: 1, open: 0.5, blush: 0.6 }], [88, { eye: 1, brow: 0.3, smile: 1, blush: 0.5 }],
  [96, { eye: 1.1, brow: 0.4, smile: 0.2, look: 1 }], [104, { eye: 1, brow: -0.2, smile: 0.6, look: 1 }],
  [K.release, { eye: 1, brow: -0.4, smile: 0.8, open: 0.4, look: 1 }], [128, { eye: 1.1, brow: 0.5, smile: 0.6, look: 1, lookY: -1 }],
  [K.crash, { eye: 1.5, brow: 1, smile: -0.2, open: 0.8 }], [150, { eye: 0.8, brow: -0.2, browTilt: 1, smile: -0.8 }],
  [172, { eye: 1.3, brow: 0.8, browTilt: 1, smile: -0.6, open: 0.5 }], [205, { eye: 1.2, brow: 0.6, browTilt: 1, smile: -0.7, open: 0.3 }],
  [K.phoneLand - 2, { eye: 1.6, brow: 1, smile: -0.2, open: 0.7, look: 1 }], [244, { eye: 1.3, brow: 0.7, smile: 0.3, open: 0.2, look: 1 }],
  [K.snip, { eye: 0.15, brow: -0.2, smile: 0, open: 0.5 }], [278, { eye: 1.2, brow: 0.6, smile: 1, open: 0.4, look: 1, blush: 0.5 }],
  [300, { eye: 1, brow: 0.3, smile: 1, look: 1 }], [318, { eye: 1.2, brow: 0.6, smile: 0.9, open: 0.3, look: 1, lookY: -1 }],
  [366, { eye: 1.2, brow: 0.6, smile: 1, open: 0.5, look: 1 }], [395, { eye: 1, brow: 0.2, smile: 0.7, look: 1, lookY: 0.5 }],
  [K.tapCard, { eye: 1.1, brow: 0.4, smile: 1, look: 1 }], [K.jumpOut + 2, { eye: 1.5, brow: 1, smile: 1, open: 0.7, look: 1, lookY: -1 }],
  [446, { eye: 1.1, brow: 0.5, smile: 1, open: 0.3, look: 1, blush: 0.5 }], [454, { eye: 1, brow: 0.2, smile: 0.5, lookY: 1 }],
  [470, { eye: 1.1, brow: 0.4, smile: 0.8, look: 1 }], [488, { eye: 1, brow: -0.3, smile: 0.9, open: 0.2, look: 1 }],
  [500, { eye: 1.1, brow: 0.5, smile: 0.8, look: 1, lookY: -1 }], [K.catch2 + 2, { eye: 1.3, brow: 0.8, smile: 1, open: 0.7, look: 1, blush: 0.6 }],
  [560, { eye: 1, brow: 0.3, smile: 1, look: 1 }], [700, { eye: 1, brow: 0.3, smile: 1, look: 1 }],
  [K.cheer + 2, { eye: 1.3, brow: 0.8, smile: 1, open: 0.7, blush: 0.6 }],
];
const BLINKS_B = [74, 300, 384, 474, 545, 612, 700, 735];

function blink(face, f, list) {
  for (const b of list) if (f >= b && f < b + 4) return { ...face, eye: 0.1 };
  return face;
}
function talkMouth(face, f, times) {
  for (const t of times) {
    if (f >= t - 6 && f < t + 6) {
      const k = Math.abs(Math.sin(((f - t + 6) / 12) * Math.PI * 2.5));
      return { ...face, open: Math.max(face.open, 0.25 + 0.5 * k) };
    }
  }
  return face;
}

function stateB(f) {
  let p = poseAt(B_POSES, f);
  let lift = 0, sx = 1, sy = 1;
  // S1 jump
  lift += track([[K.launch, 0], [K.catch + 1, 150, E.outCubic], [K.land, 0, E.inQuad]], f);
  if (f >= K.launch && f < K.land) { sy = lerp(1.08, 1, inv(K.catch, K.land, f)); sx = 1 / sy; }
  sy -= Math.max(0, wobble(f, K.land, 3, 9, 0.14)) + Math.max(0, wobble(f, K.stampHit, 4, 10, 0.1));
  sx = 1 + (1 - sy) * 0.6;
  // breathing / idle
  p = addPose(p, { t: Math.sin(f * 0.11) * 1.4, aSh: Math.sin(f * 0.09) * 2, bSh: -Math.sin(f * 0.09) * 2 });
  // tangled struggle
  if (f > K.tangleStart + 14 && f < K.snip) {
    const k = clamp(inv(K.tangleStart + 14, K.tangleStart + 26, f));
    p = addPose(p, { t: Math.sin(f * 0.9) * 7 * k, head: Math.sin(f * 0.7) * 6 * k, aEl: Math.sin(f * 1.3) * 12 * k, bEl: Math.cos(f * 1.1) * 12 * k, aHip: Math.sin(f * 1.1) * 5 * k });
  }
  // shake off
  if (f >= K.shakeOff[0] && f < K.shakeOff[1]) {
    const k = 1 - inv(K.shakeOff[0], K.shakeOff[1], f);
    p = addPose(p, { t: Math.sin(f * 2.2) * 14 * k, head: Math.sin(f * 2.2 + 1) * 12 * k, aSh: Math.sin(f * 2) * 30 * k, bSh: -Math.sin(f * 2) * 30 * k });
  }
  // walk
  if (f >= K.walk[0] && f < K.walk[1]) {
    const ph = (f - K.walk[0]) / 10;
    const amt = Math.sin(inv(K.walk[0], K.walk[1], f) * Math.PI) * 0.9 + 0.1;
    p = mixPose(p, walkPose(ph, 1), amt);
    lift += Math.abs(Math.sin(ph * Math.PI * 2)) * 6 * amt;
  }
  // happy hop after shake-off
  lift += track([[K.shakeOff[1] + 2, 0], [K.shakeOff[1] + 8, 34, E.outQuad], [K.shakeOff[1] + 14, 0, E.inQuad]], f);
  // talk gestures in S6
  for (const c of K.chat.filter((c) => c.who === "B")) {
    const k = Math.sin(clamp(inv(c.f - 6, c.f + 12, f)) * Math.PI);
    if (k > 0) p = mixPose(p, POSES.talk, k * 0.9);
  }
  // cheer jump S7
  lift += track([[K.cheer + 2, 0], [K.cheer + 10, 110, E.outCubic], [K.cheer + 20, 0, E.inQuad], [K.cheer + 24, 0], [K.cheer + 30, 40, E.outQuad], [K.cheer + 36, 0, E.inQuad]], f);
  let face = faceAt(B_FACE, f);
  face = blink(face, f, BLINKS_B);
  face = talkMouth(face, f, K.chat.filter((c) => c.who === "B").map((c) => c.f));
  return { x: bX(f), ground: GROUND, s: B_SCALE, facing: 1, pose: p, face, kind: "brand", lift, sx, sy };
}

// ---- floating islands with creators (S2–S4) ----
const ISL = [
  { x: 300, y: 742, kind: "beanie", act: "film", facing: 1 },   // C3
  { x: 900, y: 902, kind: "cap", act: "selfie", facing: -1 },   // C1
  { x: 885, y: 1205, kind: "phones", act: "dance", facing: -1 }, // C2
];
const C_SCALE_ISL = 0.48;
function stateIsland(i, f) {
  const I = ISL[i];
  const s = E.outBack(inv(K.islands[i], K.islands[i] + 11, f));
  let y = I.y + Math.sin(f * 0.08 + i * 2.1) * 7;
  let rot = Math.sin(f * 0.05 + i) * 0.02, alpha = 1;
  const fall0 = K.lasso[i] + 32;
  if (f > fall0) {
    const t = f - fall0;
    y += 0.9 * t * t * 0.5;
    rot += 0.012 * t * (i % 2 ? 1 : -1);
    alpha = clamp(1 - t / 22);
  }
  // land-impact reaction (shock wave shakes islands)
  y -= Math.max(0, wobble(f, K.phoneLand + 2 + i * 2, 4, 8, 22));
  return { x: I.x, y, s, rot, alpha };
}
function islandCreator(i, f, isl) {
  const I = ISL[i];
  let p, face = { smile: 0.8, eye: 1 };
  if (I.act === "film") p = addPose(POSES.film, { t: Math.sin(f * 0.15) * 4, head: Math.sin(f * 0.1) * 4 });
  if (I.act === "selfie") p = addPose(POSES.selfie, { aEl: Math.sin(f * 0.3) * 10, t: Math.sin(f * 0.2) * 5 });
  if (I.act === "dance") {
    const k = (Math.sin(f * 0.42) + 1) / 2;
    p = mixPose(POSES.dance, { ...POSES.dance, t: -8, aSh: -60, bSh: 130, aHip: -10, bHip: 30, aKn: 20, bKn: 40 }, k);
  }
  face = { smile: 0.9, eye: 1, open: I.act === "dance" ? 0.3 : 0 };
  // reaction to the phone landing
  const react = clamp(inv(K.phoneLand, K.phoneLand + 4, f)) * (1 - clamp(inv(K.phoneLand + 40, K.phoneLand + 55, f)));
  if (react > 0) {
    p = mixPose(p, POSES.shock, react * 0.8);
    face = { eye: lerp(1, 1.5, react), brow: react, smile: 0.2, open: 0.6 * react, look: 1 };
  }
  if (f > K.phoneLand + 40) face = { ...face, look: 1, smile: 0.9 };
  let lift = Math.max(0, wobble(f, K.phoneLand + 2 + i * 2, 3, 6, 40));
  if (I.act === "dance") lift += Math.abs(Math.sin(f * 0.42)) * 8;
  // shrink into a card when lassoed
  const shrink = 1 - E.inBack(inv(K.lasso[i] + 10, K.lasso[i] + 18, f));
  const sc = C_SCALE_ISL * isl.s * shrink;
  return { x: isl.x, ground: isl.y - 6, s: sc, facing: I.facing, pose: p, face, kind: I.kind, lift, shadow: false, alpha: isl.alpha };
}

// ---- C1 standalone (after jumping out of the phone) ----
const C1_SCALE = 0.78;
const C1_X = 900;
const C1_POSES = [
  [K.jumpOut, "cheer"], [K.c1Land - 3, "cheer"], [K.c1Land, "land", E.inQuad], [K.c1Land + 6, "wave", E.outBack],
  [470, "wave"], [478, "stand"], [K.ride[1] - 12, "stand"], [K.catch2 - 2, "catchUp", E.outCubic], [K.catch2 + 3, pose("catchUp", { aEl: 40, bEl: 44 })],
  [K.unfold[0] + 2, "read"], [K.thumbs - 4, "read"], [K.thumbs, "thumbsUp", E.outBack], [K.toss[0] - 2, "thumbsUp"],
  [K.toss[0] + 2, pose("throw", { aSh: 60, bSh: 40, t: 8 }), E.outCubic], [K.toss[0] + 12, "stand"],
  [690, "stand"], [K.cheer + 2, "crouch"], [K.cheer + 8, "cheer", E.outCubic],
];
const C1_FACE = [
  [K.jumpOut, { eye: 1.3, brow: 0.8, smile: 1, open: 0.6 }], [K.c1Land + 8, { eye: 1.1, brow: 0.5, smile: 1, open: 0.3, blush: 0.5 }],
  [490, { eye: 1, brow: 0.3, smile: 0.8, look: 1 }], [K.ride[1] - 10, { eye: 1.2, brow: 0.6, smile: 0.6, open: 0.3, lookY: -1, look: 1 }],
  [K.catch2 + 2, { eye: 1.2, brow: 0.6, smile: 1, open: 0.4 }], [K.unfold[1], { eye: 1, brow: 0.2, smile: 0.4, lookY: 1 }],
  [K.bulb, { eye: 1.4, brow: 1, smile: 1, open: 0.6, lookY: -1 }], [K.thumbs + 6, { eye: 1.1, brow: 0.5, smile: 1, blush: 0.6, look: 1 }],
  [700, { eye: 1, brow: 0.3, smile: 1, look: 1 }], [K.cheer + 4, { eye: 1.3, brow: 0.8, smile: 1, open: 0.7, blush: 0.6 }],
];
function stateC1(f) {
  if (f < K.jumpOut) return null;
  let p = poseAt(C1_POSES, f);
  p = addPose(p, { t: Math.sin(f * 0.1 + 1) * 1.4 });
  // wave arm oscillation
  const waving = (f > K.c1Land + 4 && f < 476);
  if (waving) p = addPose(p, { aEl: Math.sin(f * 0.6) * 28 });
  for (const c of K.chat.filter((c) => c.who === "C")) {
    const k = Math.sin(clamp(inv(c.f - 6, c.f + 12, f)) * Math.PI);
    if (k > 0) p = mixPose(p, POSES.talk, k * 0.9);
  }
  let x = C1_X, ground = GROUND, s = C1_SCALE, lift = 0, sx = 1, sy = 1;
  if (f < K.c1Land) {
    const t = inv(K.jumpOut, K.c1Land, f);
    // arc out of the phone card (world) to the floor
    const p0 = { x: 660, y: 1110 }, p1 = { x: 820, y: 640 }, p2 = { x: C1_X, y: GROUND };
    const q = quad(p0, p1, p2, E.inOutSine(t));
    x = q.x; ground = q.y; s = lerp(0.18, C1_SCALE, E.outCubic(Math.min(1, t * 1.6)));
  }
  sy -= Math.max(0, wobble(f, K.c1Land, 3, 9, 0.16));
  sx = 1 + (1 - sy) * 0.6;
  lift += track([[K.cheer + 4, 0], [K.cheer + 12, 100, E.outCubic], [K.cheer + 22, 0, E.inQuad], [K.cheer + 27, 0], [K.cheer + 33, 40, E.outQuad], [K.cheer + 39, 0, E.inQuad]], f);
  let face = faceAt(C1_FACE, f);
  face = blink(face, f, [486, 560, 625, 700]);
  face = talkMouth(face, f, K.chat.filter((c) => c.who === "C").map((c) => c.f));
  return { x, ground, s, facing: -1, pose: p, face, kind: "cap", lift, sx, sy, shadow: f >= K.c1Land - 4 };
}

// ---- C2 / C3 reprise on top of the phone (S7) ----
function statePhoneTopper(i, f) {
  const f0 = K.pops[i];
  if (f < f0) return null;
  const x = [520, 680][i];
  const top = GROUND - PHONE.h;
  const up = spring(f, f0, 2.2, 6);
  const ground = lerp(top + 120, top, up);
  let p = (f - f0) % 16 < 8 ? POSES.cheer : pose("cheer", { aSh: 140, bSh: 150, t: 4 });
  p = mixPose(POSES.crouch, p, clamp(inv(f0, f0 + 6, f)));
  const lift = Math.abs(Math.sin((f - f0) * 0.4)) * 18 * clamp(inv(f0 + 8, f0 + 12, f));
  return { x, ground, s: 0.5, facing: i ? -1 : 1, pose: p, face: { eye: 1.3, brow: 0.8, smile: 1, open: 0.6, blush: 0.5 }, kind: ["phones", "beanie"][i], lift, shadow: false, clip: top };
}

// ======================================================================================
// Brief paper / plane
// ======================================================================================
const CRASH = { x: 440, y: GROUND - 18 };
function planePath1(f0Hand) {
  const start = f0Hand;
  const a = samplePath((t) => bezier(start, { x: start.x + 120, y: start.y - 220 }, { x: 560, y: 760 }, { x: 650, y: 790 }), 30);
  const loop = loopPoints(650, 880, 90, -Math.PI / 2, 1.0, 34).map((p) => ({ x: p.x, y: p.y + 0 }));
  const end = loop[loop.length - 1];
  const c = samplePath((t) => bezier(end, { x: end.x + 40, y: end.y + 60 }, { x: CRASH.x + 120, y: CRASH.y - 160 }, CRASH), 30);
  return [...a, ...loop.slice(1), ...c.slice(1)];
}
const holdOffset = (f) => ({
  x: track([[K.catch, 0], [K.land, 6], [42, 0], [70, 0], [82, 26], [200, 26]], f),
  y: track([[K.catch, -40], [K.land, -30], [42, -78], [70, -78], [82, -30], [200, -30]], f),
});

function briefState(f, B, Bw, C1w) {
  // returns { mode, x, y, rot, crumple, stamp, fold, s }
  const stamp = clamp(inv(K.stampHit, K.stampHit + 6, f));
  if (f < K.catch) {
    const t = f / K.catch;
    const target = rigWorld({ ...stateB(K.catch) });
    const tx = (target.a.x + target.b.x) / 2, ty = (target.a.y + target.b.y) / 2 - 40;
    const x = lerp(tx + 30, tx, t) + Math.sin(f * 0.32) * 46 * (1 - t);
    const y = lerp(380, ty, E.inQuad(t * 0.6 + t * 0.4));
    return { mode: "paper", x, y, rot: Math.sin(f * 0.32 + 0.6) * 0.45 * (1 - t), stamp: 0 };
  }
  if (f < K.foldStart) {
    const o = holdOffset(f);
    return { mode: "paper", x: (Bw.a.x + Bw.b.x) / 2 + o.x, y: (Bw.a.y + Bw.b.y) / 2 + o.y, rot: Math.sin(f * 0.15) * 0.05 - wobble(f, K.stampHit, 5, 8, 0.12), stamp };
  }
  if (f < K.release) {
    const o = holdOffset(f);
    const hx = f < K.foldEnd ? (Bw.a.x + Bw.b.x) / 2 + o.x : Bw.a.x;
    const hy = f < K.foldEnd ? (Bw.a.y + Bw.b.y) / 2 + o.y : Bw.a.y;
    return { mode: "fold", x: hx, y: hy, fold: inv(K.foldStart, K.foldEnd, f), stamp: 1, rot: f < K.foldEnd ? 0 : -0.5 };
  }
  if (f < K.crash) {
    const startHand = rigWorld(stateB(K.release)).a;
    const path = planePath1(startHand);
    const cum = polyLength(path);
    const s = E.inOutSine(inv(K.release, K.crash, f));
    const pt = pointAt(path, s, cum);
    return { mode: "plane", x: pt.x, y: pt.y, rot: pt.ang, path, s };
  }
  if (f < K.pick) {
    // crumpled on the floor; hops when the phone lands
    const hop = Math.abs(wobble(f, K.phoneLand, 2.2, 5, 60));
    const bounce = Math.abs(wobble(f, K.crash, 3, 7, 26));
    return { mode: "ball", x: CRASH.x - clamp(inv(K.phoneLand, K.phoneLand + 14, f)) * 16, y: CRASH.y - hop - bounce, rot: (f - K.crash) * 0.01 + (f > K.phoneLand ? -0.6 * clamp(inv(K.phoneLand, K.phoneLand + 14, f)) : 0), crumple: clamp(inv(K.crash, K.crash + 3, f)) };
  }
  if (f < K.uncrumple[0]) return { mode: "ball", x: Bw.a.x, y: Bw.a.y - 10, rot: f * 0.05, crumple: 1 };
  if (f < K.fold[0]) {
    const c = 1 - E.outCubic(inv(K.uncrumple[0], K.uncrumple[1], f));
    return { mode: "paper", x: (Bw.a.x + Bw.b.x) / 2 + 24, y: (Bw.a.y + Bw.b.y) / 2 - 34, rot: Math.sin(f * 1.3) * 0.12 * c, crumple: c, stamp: 1, sx: 1 + wobble(f, K.uncrumple[1], 4, 8, 0.1) };
  }
  if (f < K.throw2) {
    const hx = f < K.fold[1] ? (Bw.a.x + Bw.b.x) / 2 + 24 : Bw.a.x;
    const hy = f < K.fold[1] ? (Bw.a.y + Bw.b.y) / 2 - 34 : Bw.a.y;
    return { mode: "fold", x: hx, y: hy, fold: inv(K.fold[0], K.fold[1], f), stamp: 1, rot: f < K.fold[1] ? 0 : -0.5 };
  }
  if (f < K.catch2) {
    const path = bridgePath();
    const s = E.inOutSine(inv(K.ride[0], K.ride[1], f));
    const pt = pointAt(path, lerp(0.04, 0.97, s));
    return { mode: "plane", x: pt.x, y: pt.y, rot: pt.ang, s, ride: true };
  }
  if (!C1w) return null;
  const cx = (C1w.a.x + C1w.b.x) / 2, cy = (C1w.a.y + C1w.b.y) / 2;
  if (f < K.unfold[1]) {
    return { mode: "fold", x: cx, y: cy - 20, fold: 1 - inv(K.unfold[0], K.unfold[1], f), stamp: 1, rot: f < K.unfold[0] ? Math.PI + 0.5 : 0, sc: 0.8 };
  }
  if (f < K.toss[0]) return { mode: "paper", x: f < K.thumbs ? cx : C1w.b.x - 10, y: f < K.thumbs ? cy - 30 : C1w.b.y - 20, rot: f < K.thumbs ? 0.05 : 0.3, stamp: 1, sc: 0.8 };
  if (f < K.toss[1]) {
    const t = E.inOutCubic(inv(K.toss[0], K.toss[1], f));
    const start = { x: C1w.b.x, y: C1w.b.y - 20 };
    const dock = { x: 600, y: 1130 };
    const q = quad(start, { x: 760, y: 820 }, dock, t);
    return { mode: "paper", x: q.x, y: q.y, rot: t * Math.PI * 2, stamp: 1, sc: lerp(0.8, 0.25, t), alpha: 1 - clamp(inv(0.85, 1, t)) };
  }
  return null;
}

function drawBriefState(ctx, st, f) {
  if (!st) return;
  const sc = st.sc ?? 1;
  if (st.mode === "paper" || st.mode === "ball") {
    drawBrief(ctx, st.x, st.y, { rot: st.rot, crumple: st.mode === "ball" ? 1 : st.crumple ?? 0, stamp: st.stamp ?? 0, sx: (st.sx ?? 1) * sc, sy: sc, alpha: st.alpha });
  } else if (st.mode === "fold") {
    const p = st.fold;
    if (p < 0.55) {
      const k = p / 0.55;
      drawBrief(ctx, st.x, st.y, { rot: st.rot + k * 0.6, sx: (1 - k * 0.85) * sc, sy: (1 - k * 0.35) * sc, stamp: st.stamp });
    } else {
      const k = (p - 0.55) / 0.45;
      drawPlane(ctx, st.x, st.y, st.rot - 0.3, lerp(0.5, 1, E.outBack(k)) * sc);
      if (k < 0.6) sparkle(ctx, st.x + 30, st.y - 30, 18 * (1 - k / 0.6), C.violet);
    }
  } else if (st.mode === "plane") {
    const tail = st.ride ? 0.9 : 0.6;
    speedLines(ctx, st.x, st.y, st.rot, 36, tail, { n: 3, gap: 14, color: st.ride ? C.violet : C.inkSoft, lw: 4 });
    drawPlane(ctx, st.x, st.y, st.rot, 1);
  }
}

// ======================================================================================
// Ribbons
// ======================================================================================
function bridgePath() {
  const a = { x: 438, y: 1150 }, b = { x: 838, y: 1095 };
  return samplePath((t) => bezier(a, { x: 470, y: 640 }, { x: 790, y: 600 }, b), 70);
}
function snipPath(Bpos) {
  const start = { x: 600, y: 1100 };
  const a = samplePath((t) => bezier(start, { x: 560, y: 820 }, { x: 260, y: 900 }, { x: 250, y: 1180 }), 40);
  const lp = loopPoints(250, 1250, 110, -Math.PI / 2, 1.15, 40);
  return [...a, ...lp.slice(1)];
}
function lassoPath(i) {
  const I = ISL[i];
  const start = { x: 600, y: GROUND - PHONE.h + 40 };
  const tgt = { x: I.x, y: I.y - 70 };
  const c1 = { x: start.x + (tgt.x - start.x) * 0.2, y: start.y - 260 };
  const c2 = { x: tgt.x + (i === 0 ? 120 : -60), y: tgt.y - 200 };
  const a = samplePath((t) => bezier(start, c1, c2, tgt), 40);
  const lp = loopPoints(tgt.x, tgt.y + 10, 64, -Math.PI / 2 + (i === 0 ? Math.PI : 0), 1.0, 28);
  return [...a, ...lp.slice(1)];
}

// ======================================================================================
// Tangle (S2–S3)
// ======================================================================================
const TANGLE = (() => {
  const r = mulberry32(42);
  const pts = [];
  const cx = 250, cy = 1255;
  let a = 0;
  for (let i = 0; i < 46; i++) {
    a += 0.9 + r() * 1.6;
    const rx = 50 + r() * 45, ry = 80 + r() * 70;
    pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
  }
  return catmull(pts, 6);
})();
const TANGLE_CUM = polyLength(TANGLE);

function drawTangle(ctx, f) {
  if (f < K.tangleStart || f > K.snip + 34) return;
  const prog = E.inOutSine(inv(K.tangleStart, K.tangleFull, f));
  const jig = (i) => ({ x: Math.sin(f * 0.9 + i * 0.3) * 4, y: Math.cos(f * 0.8 + i * 0.25) * 3 });
  if (f < K.snip) {
    const sub = subPath(TANGLE, 0, prog, TANGLE_CUM);
    const pts = sub.map((p, i) => ({ x: p.x + jig(i).x * (f > K.tangleFull - 30 ? 1 : 0.4), y: p.y + jig(i).y }));
    line(ctx, pts, 7, C.ink);
    line(ctx, pts.filter((_, i) => i % 3 === 0), 3, C.coral);
    return;
  }
  // snipped: three chunks fly apart with gravity and fade
  const t = f - K.snip;
  const n = TANGLE.length;
  const parts = [[0, Math.floor(n / 3)], [Math.floor(n / 3), Math.floor((2 * n) / 3)], [Math.floor((2 * n) / 3), n]];
  parts.forEach(([a, b], k) => {
    const vx = [-6, 5, 2][k], vy = [-10, -12, -6][k];
    const dx = vx * t, dy = vy * t + 0.9 * t * t * 0.5;
    const rot = [-0.04, 0.05, 0.03][k] * t;
    const cx = 250, cy = 1255;
    const seg = TANGLE.slice(a, b).map((p) => {
      const x = p.x - cx, y = p.y - cy;
      return { x: cx + x * Math.cos(rot) - y * Math.sin(rot) + dx, y: cy + x * Math.sin(rot) + y * Math.cos(rot) + dy };
    });
    ctx.save();
    ctx.globalAlpha = clamp(1 - t / 30);
    line(ctx, seg, 7, C.ink);
    ctx.restore();
  });
}

// S2 chatter bubbles flying from creators into the tangle
const CHATTER = ["Hi!", "When?", "Brief?", "Draft??", "Hello?", "Ping!"];
function drawChatter(ctx, f, islands) {
  K.bubbles.forEach((fb, i) => {
    if (f < fb || f > fb + 40) return;
    const src = i % 3;
    const isl = islands[src];
    const I = ISL[src];
    const from = { x: I.x + (I.facing > 0 ? 70 : -70), y: isl.y - 130 };
    const to = { x: 250 + Math.sin(i * 2) * 40, y: 1240 + Math.cos(i * 3) * 40 };
    const t = inv(fb + 6, fb + 22, f);
    const pos = quad(from, { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 120 }, to, E.inOutCubic(t));
    // thread trail
    const trail = samplePath((u) => quad(from, { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 120 }, to, E.inOutCubic(t) * u), 16)
      .map((p, k) => ({ x: p.x + Math.sin(k * 1.4 + f * 0.5) * 6, y: p.y + Math.cos(k * 1.2) * 6 }));
    ctx.save();
    ctx.globalAlpha = 1 - clamp(inv(fb + 24, fb + 40, f));
    line(ctx, trail, 4, i % 2 ? C.coral : C.ink);
    ctx.restore();
    const s = E.outBack(inv(fb, fb + 6, f)) * (1 - E.inBack(inv(fb + 20, fb + 26, f)));
    drawBubble(ctx, pos.x, pos.y, { w: 132, h: 56, text: CHATTER[i], s, tail: I.facing > 0 ? -1 : 1, rot: Math.sin(i * 5) * 0.12, font: `24px ${FONT.bold}` });
  });
}

// ======================================================================================
// Phone + its screen UI (explicitly stylized illustration, not real app UI)
// ======================================================================================
function statePhone(f) {
  if (f < K.phoneFall) return null;
  const t = inv(K.phoneFall, K.phoneLand, f);
  const bottom = lerp(-200, GROUND, E.inQuad(t));
  let sy = 1, sx = 1;
  if (f < K.phoneLand) { sy = lerp(1, 1.1, t); sx = 1 / sy; }
  else { sy = 1 - wobble(f, K.phoneLand, 2.6, 6, 0.18); sx = 1 + (1 - sy) * 0.7; }
  // tap / select pulses
  const pulse = wobble(f, K.tap, 4, 9, 0.03) + wobble(f, K.tapCard, 4, 9, 0.03) + wobble(f, K.confetti, 3, 7, 0.06);
  return { x: 600, bottom, sx: sx + pulse, sy: sy - pulse * 0.5, rot: f < K.phoneLand ? (1 - t) * 0.12 : wobble(f, K.phoneLand, 2, 6, 0.03) };
}

const SLOTS = Array.from({ length: 6 }, (_, i) => ({ x: 68 + (i % 2) * 120, y: 170 + Math.floor(i / 2) * 110 }));
const SCREEN_ORIGIN = { x: 600 - PHONE.w / 2 + PHONE.inset, y: GROUND - PHONE.h + PHONE.inset };
const slotWorld = (i) => ({ x: SCREEN_ORIGIN.x + SLOTS[i].x, y: SCREEN_ORIGIN.y + SLOTS[i].y });
const CARD_KINDS = ["beanie", "cap", "phones", "plain", "brandless", "plain2"];

function wLogoPath(cx, cy, s) {
  const P = [[-0.44, -0.3], [-0.2, 0.32], [0, -0.06], [0.2, 0.32], [0.44, -0.3]].map(([x, y]) => ({ x: cx + x * s, y: cy + y * s }));
  return catmull(P, 10);
}

function screenUI(ctx, sw, sh, f, A) {
  if (f < K.screenOn) {
    ctx.fillStyle = "#16102B"; ctx.fillRect(0, 0, sw, sh);
    return;
  }
  const flash = 1 - clamp(inv(K.screenOn, K.screenOn + 5, f));
  // full-violet brand screen (logo draw) until the UI takes over
  const uiT = E.inOutCubic(inv(292, 306, f)); // 0 = full logo screen, 1 = header only
  ctx.fillStyle = C.screenBg; ctx.fillRect(0, 0, sw, sh);
  if (uiT > 0) drawUIContent(ctx, sw, sh, f, A);
  const headH = lerp(sh, 72, uiT);
  const g = ctx.createLinearGradient(0, 0, 0, headH);
  g.addColorStop(0, "#7246FF"); g.addColorStop(1, C.violet);
  ctx.fillStyle = g; ctx.fillRect(0, 0, sw, headH);
  if (uiT < 1) {
    const cx = sw / 2, cy = lerp(sh * 0.42, 40, uiT), s = lerp(170, 26, uiT);
    const p = E.inOutCubic(inv(K.logoDraw[0], K.logoDraw[1], f));
    const path = wLogoPath(cx, cy, s);
    const sub = subPath(path, 0, p);
    ctx.save();
    ctx.translate(0, lerp(7, 1, uiT));
    line(ctx, sub, lerp(34, 6, uiT), C.violetDeep);
    ctx.restore();
    line(ctx, sub, lerp(34, 6, uiT), C.pureWhite);
    if (p >= 1 && uiT < 0.3) {
      const k = clamp(inv(K.logoDraw[1], K.logoDraw[1] + 14, f));
      for (let i = 0; i < 4; i++) sparkle(ctx, cx + Math.cos(i * 1.7) * 100, cy + Math.sin(i * 2.3) * 70, 14 * Math.sin(k * Math.PI), C.pureWhite);
    }
    if (uiT < 0.5) {
      ctx.globalAlpha = clamp(inv(K.logoDraw[1] - 4, K.logoDraw[1] + 6, f)) * (1 - uiT * 2);
      ctx.fillStyle = C.pureWhite; ctx.font = `30px ${FONT.display}`; ctx.textAlign = "center";
      ctx.fillText("Werbens", cx, cy + 128);
      ctx.globalAlpha = 1;
    }
  }
  if (uiT > 0.6) {
    ctx.globalAlpha = clamp((uiT - 0.6) / 0.4);
    ctx.save();
    rr(ctx, 14, 30, 30, 30, 8); ctx.clip();
    ctx.drawImage(A.icon, 14, 30, 30, 30);
    ctx.restore();
    ctx.fillStyle = C.pureWhite; ctx.font = `20px ${FONT.bold}`; ctx.textAlign = "left";
    ctx.fillText("Werbens", 52, 52);
    ctx.globalAlpha = 1;
  }
  if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, sw, sh); }
}

function tabBar(ctx, sw, sh, active) {
  ctx.fillStyle = C.pureWhite; ctx.fillRect(0, sh - 56, sw, 56);
  ctx.fillStyle = C.grayLight; ctx.fillRect(0, sh - 56, sw, 2);
  ["people", "doc", "chat", "board"].forEach((k, i) => {
    const x = sw * (0.125 + i * 0.25), y = sh - 28;
    if (i === active) { ctx.fillStyle = C.lilacPale; rr(ctx, x - 26, y - 17, 52, 34, 17); ctx.fill(); }
    icon(ctx, k, x, y, 22, i === active ? C.violet : C.gray, 2.6);
  });
}

function drawUIContent(ctx, sw, sh, f, A) {
  if (f < 450) return uiDiscover(ctx, sw, sh, f);
  if (f < 570) return uiBrief(ctx, sw, sh, f);
  if (f < K.boardIn + 2) return uiChat(ctx, sw, sh, f);
  return uiBoard(ctx, sw, sh, f);
}

function uiDiscover(ctx, sw, sh, f) {
  // search pill
  ctx.fillStyle = C.pureWhite; rr(ctx, 14, 84, sw - 28, 28, 14); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = C.grayLight; ctx.stroke();
  icon(ctx, "search", 32, 98, 14, C.gray, 2.4);
  ctx.fillStyle = C.grayLight; rr(ctx, 46, 94, 90, 8, 4); ctx.fill();
  // grid
  const hoverIdx = f < K.hover[0] ? -1 : f < K.hover[1] ? 0 : f < K.hover[2] ? 2 : 1;
  for (let i = 0; i < 6; i++) {
    let appear = 0, dy = 0;
    if (i < 3) { const fd = K.lasso[i] + 30; appear = f >= fd ? 1 : 0; }
    else { const fi = 368 + (i - 3) * 4; appear = clamp(inv(fi, fi + 8, f)); dy = (1 - E.outCubic(appear)) * 160; }
    if (appear <= 0) continue;
    let s = i < 3 ? 1 + wobble(f, K.lasso[i] + 30, 3, 8, 0.25) : 1;
    let { x, y } = SLOTS[i];
    let selected = false, check = 0;
    if (i === 1 && f >= K.tapCard) {
      selected = true;
      check = E.outBack(inv(K.tapCard, K.tapCard + 6, f));
      const grow = E.inOutCubic(inv(K.tapCard + 4, K.tapCard + 12, f)) * (1 - E.inOutCubic(inv(K.jumpOut + 8, K.jumpOut + 18, f)));
      x = lerp(x, sw / 2, grow); y = lerp(y, 250, grow); s *= lerp(1, 1.7, grow);
    }
    const kind = ["beanie", "cap", "phones", "plain", "plain", "plain"][i];
    if (i === 1 && f >= K.jumpOut) {
      // the creator has jumped out: card shows an empty avatar "portal" for a moment
      drawCard(ctx, x, y + dy, "plain", { s, selected, check, accent: C.coral, alpha: 1 });
    } else {
      drawCard(ctx, x, y + dy, kind, { s, selected, check, accent: [C.yellow, C.coral, C.lilac, C.violetLight, C.coral, C.yellow][i] });
    }
    if (hoverIdx === i && f < K.tapCard + 2) {
      ctx.lineWidth = 4; ctx.strokeStyle = C.violet;
      rr(ctx, x - CARD.w / 2 - 5, y - CARD.h / 2 - 5, CARD.w + 10, CARD.h + 10, 19); ctx.stroke();
    }
  }
  // tap ripples
  for (const [ft, px, py] of [[K.tap, 40, 200], [K.tapCard, SLOTS[1].x, SLOTS[1].y]]) {
    const r = inv(ft, ft + 12, f);
    if (r > 0 && r < 1) { ctx.globalAlpha = 1 - r; circle(ctx, px, py, 10 + r * 50, null, C.violet, 4); ctx.globalAlpha = 1; }
  }
  tabBar(ctx, sw, sh, 0);
}

function uiBrief(ctx, sw, sh, f) {
  const inT = E.outCubic(inv(450, 460, f));
  ctx.save();
  ctx.translate((1 - inT) * 60, 0);
  ctx.globalAlpha = inT;
  // doc
  ctx.fillStyle = C.pureWhite; rr(ctx, 14, 84, sw - 28, 360, 18); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = C.grayLight; ctx.stroke();
  ctx.save(); rr(ctx, 14, 84, sw - 28, 360, 18); ctx.clip();
  ctx.fillStyle = C.violet; ctx.fillRect(14, 84, sw - 28, 40);
  ctx.restore();
  ctx.fillStyle = C.pureWhite; ctx.font = `19px ${FONT.display}`; ctx.textAlign = "left";
  ctx.fillText("BRIEF", 30, 111);
  // avatars: brand + creator, linked once the brief lands
  drawAvatar(ctx, 66, 178, 28, "brand", { lw: 2.5 });
  const c1 = E.outBack(inv(K.catch2, K.catch2 + 8, f));
  const link = clamp(inv(K.catch2 + 2, K.catch2 + 12, f));
  ctx.setLineDash([6, 8]); ctx.lineWidth = 3; ctx.strokeStyle = C.gray;
  ctx.beginPath(); ctx.moveTo(98, 178); ctx.lineTo(160, 178); ctx.stroke(); ctx.setLineDash([]);
  if (link > 0) { line(ctx, [{ x: 98, y: 178 }, { x: lerp(98, 160, link), y: 178 }], 5, C.violet); }
  if (c1 > 0) { ctx.save(); ctx.translate(190, 178); ctx.scale(c1, c1); drawAvatar(ctx, 0, 0, 28, "cap", { lw: 2.5 }); ctx.restore(); }
  else circle(ctx, 190, 178, 28, null, C.grayLight, 3);
  if (link >= 1) { const k = E.outBack(inv(K.catch2 + 10, K.catch2 + 18, f)); ctx.save(); ctx.translate(129, 178); ctx.scale(k, k); circle(ctx, 0, 0, 15, C.violet, C.pureWhite, 3); icon(ctx, "check", 0, 0, 16, C.pureWhite, 3.4); ctx.restore(); }
  // lines
  for (let i = 0; i < 6; i++) {
    const fill = i < 3 ? 1 : clamp(inv(K.toss[1] + (i - 3) * 2, K.toss[1] + (i - 3) * 2 + 6, f));
    ctx.fillStyle = C.grayLight;
    rr(ctx, 34, 236 + i * 30, (i % 2 ? 140 : 180), 10, 5); ctx.fill();
    if (fill > 0) { ctx.fillStyle = C.lilac; rr(ctx, 34, 236 + i * 30, (i % 2 ? 140 : 180) * fill, 10, 5); ctx.fill(); }
  }
  ctx.restore();
  tabBar(ctx, sw, sh, 1);
}

function chatBubbleSize(ctx, c) {
  ctx.font = `17px ${FONT.bold}`;
  const tw2 = c.text ? ctx.measureText(c.text).width : 0;
  return { w: c.text ? tw2 + 30 + (c.icon ? 24 : 0) : 62, h: 42 };
}
function uiChat(ctx, sw, sh, f) {
  const inT = E.outCubic(inv(570, 580, f));
  ctx.save();
  ctx.translate((1 - inT) * 60, 0);
  ctx.globalAlpha = inT;
  // chat header row
  drawAvatar(ctx, 34, 100, 16, "cap", { lw: 2 });
  ctx.fillStyle = C.ink; ctx.font = `17px ${FONT.bold}`; ctx.textAlign = "left"; ctx.fillText("Creator chat", 58, 106);
  ctx.fillStyle = C.grayLight; ctx.fillRect(14, 124, sw - 28, 2);
  // docked messages (stack from bottom)
  const docked = K.chat.filter((c) => f >= c.f + K.chatFly);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 128, sw, sh - 56 - 128); ctx.clip();
  let yBottom = sh - 56 - 14;
  for (let k = docked.length - 1; k >= 0; k--) {
    const c = docked[k];
    const { w, h } = chatBubbleSize(ctx, c);
    // newest arrives with a pop; older ones slide up smoothly
    const newer = docked.slice(k + 1);
    let shift = 0;
    for (const n of newer) shift += (h + 10) * E.outCubic(inv(n.f + K.chatFly, n.f + K.chatFly + 6, f));
    const y = sh - 56 - 14 - h / 2 - shift;
    const isB = c.who === "B";
    const x = isB ? sw - 14 - w / 2 : 46 + w / 2;
    const pop = 1 + wobble(f, c.f + K.chatFly, 3, 9, 0.15);
    if (!isB) drawAvatar(ctx, 26, y + 4, 12, "cap", { lw: 1.5 });
    drawBubble(ctx, x, y, { w, h, s: pop, fill: isB ? C.violet : C.pureWhite, color: isB ? C.pureWhite : C.ink, text: c.text, icon: c.icon, font: `17px ${FONT.bold}`, shadow: false, lw: 2.5 });
    yBottom = y;
  }
  ctx.restore();
  ctx.restore();
  tabBar(ctx, sw, sh, 2);
}

function uiBoard(ctx, sw, sh, f) {
  const inT = E.outCubic(inv(K.boardIn, K.boardIn + 8, f));
  ctx.save();
  ctx.globalAlpha = inT;
  ctx.fillStyle = C.ink; ctx.font = `24px ${FONT.display}`; ctx.textAlign = "left";
  ctx.fillText("Campaign", 18, 110);
  const rows = [["people", "Creators"], ["doc", "Brief"], ["chat", "Chats"]];
  rows.forEach(([ic, label], i) => {
    const t = E.outBack(inv(K.boardIn + i * 4, K.boardIn + i * 4 + 10, f));
    const y = 126 + i * 104;
    ctx.save();
    ctx.translate((1 - t) * 90, 0);
    ctx.globalAlpha = clamp(t) * inT;
    const done = f >= K.checks[i];
    ctx.fillStyle = done ? C.lilacPale : C.pureWhite; rr(ctx, 14, y, sw - 28, 92, 18); ctx.fill();
    ctx.lineWidth = done ? 3 : 2; ctx.strokeStyle = done ? C.violet : C.grayLight; ctx.stroke();
    circle(ctx, 46, y + 46, 22, C.pureWhite, C.lilac, 2.5);
    icon(ctx, ic, 46, y + 46, 22, C.violet, 2.6);
    ctx.fillStyle = C.ink; ctx.font = `20px ${FONT.bold}`; ctx.fillText(label, 80, y + 42);
    ctx.fillStyle = C.grayLight; rr(ctx, 80, y + 54, 86, 8, 4); ctx.fill();
    const k = E.outBack(inv(K.checks[i], K.checks[i] + 7, f));
    circle(ctx, sw - 44, y + 46, 17, null, C.grayLight, 3);
    if (k > 0) { ctx.save(); ctx.translate(sw - 44, y + 46); ctx.scale(k, k); circle(ctx, 0, 0, 17, C.violet); icon(ctx, "check", 0, 0, 18, C.pureWhite, 3.6); ctx.restore(); }
    ctx.restore();
  });
  ctx.restore();
  tabBar(ctx, sw, sh, 3);
}

// ======================================================================================
// CTA (S8) — screen space
// ======================================================================================
const TAGLINE = ["Discover creators and manage brand", "campaigns, briefs and conversations."];
function drawCTA(ctx, f, A, cam) {
  if (f < K.spiral[0]) return;
  // spiral ribbon wipe from the phone screen
  const centre = toScreen(cam, { x: 600, y: GROUND - PHONE.h / 2 });
  const wipe = inv(K.spiral[0], K.spiral[1], f);
  if (f < K.spiral[1] + 2) {
    const turns = 3.0;
    const pts = [];
    for (let i = 0; i <= 260; i++) {
      const th = (i / 260) * turns * Math.PI * 2;
      const r = 20 + th * 68;
      pts.push({ x: centre.x + Math.cos(th + f * 0.05) * r, y: centre.y + Math.sin(th + f * 0.05) * r });
    }
    drawRibbon(ctx, pts, { s0: 0, s1: E.outQuad(Math.min(1, wipe * 1.1)), w: lerp(60, 520, wipe), freq: 0.004, phase: f * 0.2, taper: 80, outlineW: 4 });
  }
  const bgA = clamp(inv(K.spiral[1] - 8, K.spiral[1], f));
  if (bgA <= 0) return;
  ctx.save();
  ctx.globalAlpha = bgA;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#6E40FF"); g.addColorStop(0.55, C.violet); g.addColorStop(1, "#4419D0");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // drifting soft ribbons (motion in the hold)
  for (let k = 0; k < 2; k++) {
    const pts = samplePath((t) => ({ x: -100 + t * 1280, y: 520 + k * 980 + Math.sin(t * 5 + f * 0.04 + k * 2) * 90 }), 80);
    drawRibbon(ctx, pts, { w: 120, freq: 0.006, phase: f * 0.05 + k, front: "rgba(255,255,255,0.10)", back: "rgba(255,255,255,0.05)", outline: false, shadow: false, taper: 0 });
  }
  // halo
  const hg = ctx.createRadialGradient(540, 760, 40, 540, 760, 360);
  hg.addColorStop(0, "rgba(255,255,255,0.28)"); hg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hg; ctx.fillRect(0, 300, W, 900);
  // icon
  const ic = spring(f, K.iconIn, 1.8, 6.5);
  if (ic > 0) {
    const S = 300 * ic;
    ctx.save();
    ctx.translate(540, 760);
    ctx.rotate((1 - Math.min(1, ic)) * -0.4);
    ctx.fillStyle = "rgba(20,8,70,0.35)"; rr(ctx, -S / 2 + 10, -S / 2 + 18, S, S, S * 0.23); ctx.fill();
    ctx.save(); rr(ctx, -S / 2, -S / 2, S, S, S * 0.23); ctx.clip();
    ctx.drawImage(A.icon, -S / 2, -S / 2, S, S);
    // shine sweep
    const sh = inv(K.shine, K.shine + 16, f);
    if (sh > 0 && sh < 1) {
      ctx.globalAlpha = 0.45 * Math.sin(sh * Math.PI);
      ctx.fillStyle = C.pureWhite;
      ctx.beginPath(); const sx = lerp(-S, S, sh);
      ctx.moveTo(sx - 40, -S / 2); ctx.lineTo(sx + 40, -S / 2); ctx.lineTo(sx - 40, S / 2); ctx.lineTo(sx - 120, S / 2); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    ctx.lineWidth = 6; ctx.strokeStyle = "rgba(255,255,255,0.85)"; rr(ctx, -S / 2, -S / 2, S, S, S * 0.23); ctx.stroke();
    ctx.restore();
  }
  // wordmark
  const wm = E.outBack(inv(K.wordmark, K.wordmark + 14, f));
  if (wm > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(wm) * bgA;
    ctx.fillStyle = C.pureWhite; ctx.font = `150px ${FONT.display}`; ctx.textAlign = "center";
    ctx.fillText("Werbens", 540, 1085 + (1 - wm) * 50);
    ctx.restore();
  }
  // tagline from the Play listing, word-by-word
  ctx.font = `42px ${FONT.semi}`; ctx.textAlign = "left";
  let wi = 0;
  TAGLINE.forEach((ln, li) => {
    const words = ln.split(" ");
    const sp = ctx.measureText(" ").width;
    const widths = words.map((w) => ctx.measureText(w).width);
    let x = 540 - (widths.reduce((a, b) => a + b, 0) + sp * (words.length - 1)) / 2;
    words.forEach((w, k) => {
      const a = clamp(inv(K.tagline + wi * 1.6, K.tagline + wi * 1.6 + 7, f));
      ctx.globalAlpha = a * 0.94 * bgA;
      ctx.fillStyle = C.pureWhite;
      ctx.fillText(w, x, 1170 + li * 58 + (1 - E.outCubic(a)) * 18);
      x += widths[k] + sp; wi++;
    });
  });
  ctx.globalAlpha = bgA;
  // CTA pill
  const pl = E.outBack(inv(K.pill, K.pill + 12, f));
  if (pl > 0) {
    const pulse = 1 + Math.sin((f - K.pill) * 0.18) * 0.015 * clamp(inv(K.pill + 12, K.pill + 20, f));
    ctx.save();
    ctx.translate(540, 1352);
    ctx.scale(pl * pulse, pl * pulse);
    ctx.fillStyle = "rgba(20,8,70,0.35)"; rr(ctx, -350 + 6, -62 + 10, 700, 124, 62); ctx.fill();
    ctx.fillStyle = C.pureWhite; rr(ctx, -350, -62, 700, 124, 62); ctx.fill();
    ctx.fillStyle = C.violet; ctx.font = `50px ${FONT.display}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Explore on Google Play", 0, 3);
    ctx.restore();
  }
  // B and C1 wave from below
  for (const [i, x, kind, fc] of [[0, 300, "brand", 1], [1, 780, "cap", -1]]) {
    const f0 = 846 + i * 6;
    if (f < f0) continue;
    const up = spring(f, f0, 2, 6);
    const p = addPose(POSES.wave, { aEl: Math.sin(f * 0.5 + i) * 30, t: Math.sin(f * 0.15 + i) * 3 });
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, W, 1700); ctx.clip();
    drawStick(ctx, { x, ground: lerp(1960, 1690, up), s: 0.56, facing: fc, pose: p, face: { eye: 1.15, brow: 0.5, smile: 1, open: 0.3, blush: 0.6, look: 1 }, kind, shadow: false });
    ctx.restore();
  }
  ctx.restore();
}

// ======================================================================================
// Frame
// ======================================================================================
export function drawFrame(ctx, f, A) {
  const cam = camera(f);
  ctx.save();
  ctx.drawImage(A.bg, 0, 0);
  ctx.translate(W / 2, H / 2);
  ctx.scale(cam.z, cam.z);
  ctx.translate(-cam.x, -cam.y);

  // decor: big paper circle (parallax-ish, editorial)
  ctx.save();
  ctx.globalAlpha = 0.5;
  circle(ctx, 610 + (cam.x - 540) * 0.25, 1060 + (cam.y - 960) * 0.25, 430, C.lilacPale);
  ctx.restore();

  // islands + creators (S2–S4)
  const islands = [0, 1, 2].map((i) => stateIsland(i, f));
  if (f >= K.islands[0] && f < 420) {
    islands.forEach((isl, i) => {
      if (isl.s <= 0.01 || isl.alpha <= 0) return;
      drawIsland(ctx, isl.x, isl.y, 190, { s: isl.s, rot: isl.rot, alpha: isl.alpha });
      const cst = islandCreator(i, f, isl);
      if (cst.s > 0.01) {
        const hw = rigWorld(cst);
        drawStick(ctx, cst);
        // props: camera for C3, phone for C1
        if (ISL[i].act === "film") { ctx.save(); ctx.globalAlpha = isl.alpha; ctx.translate(hw.a.x, hw.a.y); ctx.scale(cst.s / 0.48, cst.s / 0.48); rr(ctx, -4, -16, 30, 22, 5); ctx.fillStyle = C.inkSoft; ctx.fill(); circle(ctx, 18, -5, 6, C.lilac, C.ink, 2); ctx.restore(); }
        if (ISL[i].act === "selfie") { ctx.save(); ctx.globalAlpha = isl.alpha; ctx.translate(hw.a.x, hw.a.y); ctx.scale(cst.s / 0.48, cst.s / 0.48); rr(ctx, -8, -24, 16, 28, 4); ctx.fillStyle = C.ink; ctx.fill(); ctx.restore(); }
      }
    });
  }

  // ground
  ctx.fillStyle = C.paperDark;
  ctx.fillRect(-1200, GROUND, 3600, 1800);
  ctx.fillStyle = "rgba(27,20,51,0.05)";
  for (let i = 0; i < 14; i++) ctx.fillRect(-400 + i * 160 + (i % 3) * 30, GROUND + 60 + (i % 4) * 40, 70, 4);
  line(ctx, [{ x: -1200, y: GROUND }, { x: 2400, y: GROUND }], 5, C.ink);

  // phone shadow anticipation + phone
  const ph = statePhone(f);
  if (f >= K.phoneShadow && f < K.phoneLand + 2) {
    const k = E.inQuad(inv(K.phoneShadow, K.phoneLand, f));
    groundShadow(ctx, 600, GROUND + 4, 30 + k * 150, 0.05 + k * 0.2);
  }
  const Bst = stateB(f);
  const Bw = rigWorld(Bst);
  const C1st = stateC1(f);
  const C1w = C1st ? rigWorld(C1st) : null;
  const brief = briefState(f, Bst, Bw, C1w);

  if (ph) {
    groundShadow(ctx, ph.x, GROUND + 4, 175 * ph.sx, 0.2);
    drawPhone(ctx, ph.x, ph.bottom, (c, sw, sh) => screenUI(c, sw, sh, f, A), { sx: ph.sx, sy: ph.sy, rot: ph.rot, glow: clamp(inv(K.screenOn, K.screenOn + 10, f)) * (1 - clamp(inv(300, 330, f))) });
    if (f >= K.phoneLand && f < K.phoneLand + 22) {
      dust(ctx, ph.x - 150, GROUND - 6, inv(K.phoneLand, K.phoneLand + 22, f), { n: 5, spread: 150, size: 30, seed: 7, dir: -1 });
      dust(ctx, ph.x + 150, GROUND - 6, inv(K.phoneLand, K.phoneLand + 22, f), { n: 5, spread: 150, size: 30, seed: 9, dir: 1 });
      burst(ctx, ph.x, GROUND - PHONE.h / 2, inv(K.phoneLand, K.phoneLand + 10, f), { n: 12, r0: 300, r1: 380, lw: 7 });
    }
  }
  // C2/C3 popping on top of the phone (S7)
  for (const i of [0, 1]) {
    const st = statePhoneTopper(i, f);
    if (st) {
      ctx.save();
      ctx.beginPath(); ctx.rect(-500, -2000, 2500, st.clip + 2000 + 2); ctx.clip();
      drawStick(ctx, st);
      ctx.restore();
    }
  }

  // crumpled brief lying on the floor is drawn before characters
  if (brief && brief.mode === "ball" && f < K.pick) drawBriefState(ctx, brief, f);

  // ribbons behind characters: snip ribbon (S3)
  if (f >= K.ribbonOut && f < K.retract[1]) {
    const pts = snipPath();
    const s1 = f < K.retract[0] ? E.outCubic(inv(K.ribbonOut, K.snip, f)) : 1 - E.inCubic(inv(K.retract[0], K.retract[1], f));
    drawRibbon(ctx, pts, { s0: 0, s1, w: 40, phase: f * 0.25 });
  }

  // B
  drawStick(ctx, Bst);
  // stamp (S1)
  if (f >= K.stampFall && f < K.stampHit + 18) {
    const hx = (Bw.a.x + Bw.b.x) / 2, hy = (Bw.a.y + Bw.b.y) / 2 - 78;
    let sx2, sy2, rot = 0;
    if (f < K.stampHit) { const t = E.inQuad(inv(K.stampFall, K.stampHit, f)); sx2 = hx; sy2 = lerp(hy - 520, hy - 10, t); }
    else { const t = f - K.stampHit; sx2 = hx + t * 14; sy2 = hy - 10 - t * 26 + 1.4 * t * t; rot = t * 0.12; }
    drawStamp(ctx, sx2, sy2, rot, 1.05);
  }
  if (f >= K.stampHit && f < K.stampHit + 10) burst(ctx, (Bw.a.x + Bw.b.x) / 2, (Bw.a.y + Bw.b.y) / 2 - 78, inv(K.stampHit, K.stampHit + 10, f), { n: 10, r0: 90, r1: 150, color: C.violet, lw: 6 });
  // tangle around B
  drawTangle(ctx, f);
  if (f >= K.snip && f < K.snip + 8) burst(ctx, 250, 1240, inv(K.snip, K.snip + 8, f), { n: 8, r0: 60, r1: 130, color: C.violet, lw: 7 });

  // C1
  if (C1st) drawStick(ctx, C1st);
  if (f >= K.jumpOut && f < K.jumpOut + 12) burst(ctx, 660, 1110, inv(K.jumpOut, K.jumpOut + 12, f), { n: 10, r0: 40, r1: 120, color: C.violet, lw: 6 });
  if (f >= K.c1Land && f < K.c1Land + 16) dust(ctx, C1_X, GROUND - 4, inv(K.c1Land, K.c1Land + 16, f), { n: 6, spread: 90, size: 20, seed: 13 });

  // gust swirl (S2)
  if (f >= K.gust - 4 && f < K.gust + 16) swirl(ctx, 700, 830, inv(K.gust - 4, K.gust + 6, f), 0.9, 1 - clamp(inv(K.gust + 8, K.gust + 16, f)));

  // lasso ribbons + flying cards (S4)
  K.lasso.forEach((L0, i) => {
    if (f < L0 || f > L0 + 31) return;
    const pts = lassoPath(i);
    const out = E.outCubic(inv(L0, L0 + 10, f));
    const back = E.inOutCubic(inv(L0 + 16, L0 + 30, f));
    const s1 = f < L0 + 16 ? out : 1 - back;
    const head = drawRibbon(ctx, pts, { s0: 0, s1: Math.max(0.001, s1), w: 30, phase: f * 0.3 + i });
    if (f >= L0 + 12) {
      const appear = E.outBack(inv(L0 + 12, L0 + 18, f));
      const ap = f < L0 + 16 ? { x: ISL[i].x, y: islands[i].y - 70 } : head;
      // blend final approach to grid slot
      const sw = slotWorld(i);
      const k = clamp(inv(L0 + 26, L0 + 30, f));
      const cx = lerp(ap.x, sw.x, k), cy = lerp(ap.y, sw.y, k);
      drawCard(ctx, cx, cy, ISL[i].kind, { s: appear * lerp(0.95, 1, k), rot: (1 - k) * Math.sin(f * 0.4 + i) * 0.2 });
    }
  });

  // bridge ribbon (S5)
  if (f >= K.bridge[0] && f < K.catch2 + 16) {
    const pts = bridgePath();
    const grow = E.outCubic(inv(K.bridge[0], K.bridge[1], f));
    const shrink = E.inCubic(inv(K.catch2, K.catch2 + 16, f));
    drawRibbon(ctx, pts, { s0: lerp(0.5 - grow / 2, 0.5, shrink), s1: lerp(0.5 + grow / 2, 0.5, shrink), w: 36, phase: f * 0.2 });
  }

  // brief / plane in hand or flight
  if (brief && !(brief.mode === "ball" && f < K.pick)) drawBriefState(ctx, brief, f);
  if (f >= K.crash && f < K.crash + 10) burst(ctx, CRASH.x, CRASH.y, inv(K.crash, K.crash + 10, f), { n: 9, r0: 30, r1: 90, color: C.coral, lw: 6 });
  if (f >= K.crash && f < K.crash + 16) dust(ctx, CRASH.x, GROUND - 4, inv(K.crash, K.crash + 16, f), { n: 5, spread: 70, size: 16, seed: 21 });
  if (f >= K.catch && f < K.catch + 8) burst(ctx, (Bw.a.x + Bw.b.x) / 2, (Bw.a.y + Bw.b.y) / 2 - 40, inv(K.catch, K.catch + 8, f), { n: 8, r0: 70, r1: 120, lw: 5 });
  if (f >= K.catch2 && f < K.catch2 + 10 && C1w) burst(ctx, (C1w.a.x + C1w.b.x) / 2, (C1w.a.y + C1w.b.y) / 2 - 20, inv(K.catch2, K.catch2 + 10, f), { n: 8, r0: 50, r1: 100, color: C.violet, lw: 5 });

  // chatter (S2)
  if (f >= K.bubbles[0] && f < 230) drawChatter(ctx, f, islands);

  // bulb (S5)
  if (C1w && f >= K.bulb && f < 560) {
    const s = E.outBack(inv(K.bulb, K.bulb + 8, f)) * (1 - E.inBack(inv(552, 560, f)));
    drawBulb(ctx, C1w.head.x, C1w.head.y - 96, s * 0.9, Math.sin(clamp(inv(K.bulb, K.bulb + 20, f)) * Math.PI));
  }
  // sweat drop when tangled
  if (f > 175 && f < K.snip) {
    const d = ((f - 175) % 24) / 24;
    ctx.save(); ctx.globalAlpha = 1 - d;
    ctx.fillStyle = "#8EC9FF"; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    const sx3 = Bw.head.x - 40, sy3 = Bw.head.y - 20 + d * 30;
    ctx.beginPath(); ctx.moveTo(sx3, sy3 - 16); ctx.quadraticCurveTo(sx3 + 11, sy3, sx3, sy3 + 6); ctx.quadraticCurveTo(sx3 - 11, sy3, sx3, sy3 - 16); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // happy sparkles
  if (f >= 58 && f < 86) for (let i = 0; i < 3; i++) sparkle(ctx, Bw.head.x + [-90, 80, 110][i], Bw.head.y + [-60, -100, 10][i], 16 * Math.sin(clamp(inv(58 + i * 4, 76 + i * 4, f)) * Math.PI), C.violet);

  // S6 flying chat bubbles (world)
  for (const c of K.chat) {
    if (f < c.f || f >= c.f + K.chatFly) continue;
    const spk = c.who === "B" ? Bw : C1w;
    if (!spk) continue;
    const from = { x: spk.head.x + (c.who === "B" ? 50 : -50), y: spk.head.y - 70 };
    // dock target: bottom of thread inside the phone screen (world coords)
    const tmp = createCanvasCtx();
    const { w, h } = chatBubbleSize(tmp, c);
    const isB = c.who === "B";
    const dx = isB ? PHONE.w - 2 * PHONE.inset - 14 - w / 2 : 46 + w / 2;
    const dock = { x: SCREEN_ORIGIN.x + dx, y: SCREEN_ORIGIN.y + (PHONE.h - 2 * PHONE.inset) - 56 - 14 - h / 2 };
    const t = E.inOutCubic(inv(c.f + 2, c.f + K.chatFly, f));
    const q = quad(from, { x: (from.x + dock.x) / 2, y: Math.min(from.y, dock.y) - 140 }, dock, t);
    const s = E.outBack(inv(c.f, c.f + 5, f)) * lerp(1.35, 1, t);
    // dotted trail
    ctx.save(); ctx.globalAlpha = 0.5; ctx.setLineDash([2, 12]);
    line(ctx, samplePath((u) => quad(from, { x: (from.x + dock.x) / 2, y: Math.min(from.y, dock.y) - 140 }, dock, t * u), 20), 5, C.violet);
    ctx.restore();
    drawBubble(ctx, q.x, q.y, { w, h, s, fill: isB ? C.violet : C.pureWhite, color: isB ? C.pureWhite : C.ink, text: c.text, icon: c.icon, font: `17px ${FONT.bold}`, lw: 3 });
  }

  // confetti (S7)
  confetti(ctx, f, K.confetti, 600, GROUND - PHONE.h - 10, { n: 56, power: 30 });

  ctx.restore();

  // captions (screen space)
  for (const cap of A.captions) drawCaption(ctx, cap, f);

  // CTA
  drawCTA(ctx, f, A, cam);
}

let _tmpCtx = null;
function createCanvasCtx() {
  if (!_tmpCtx) _tmpCtx = createCanvas(8, 8).getContext("2d");
  return _tmpCtx;
}
