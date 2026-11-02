// Scene composition for the TableVerse 30 s promo. drawFrame(ctx, f) renders frame f.
import { loadImage } from '@napi-rs/canvas';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PAL } from './palette.mjs';
import { E, clamp, lerp, prog, track, wobble, arc, rng, quadBezier, noise1, mix, D2R } from './util.mjs';
import * as T from './timeline.mjs';
import { W, H } from './timeline.mjs';
import { POSE, kidJoints, groundedHipY, kidWorld, drawKid, drawBuddy, buddyGlove } from './characters.mjs';
import {
  FONT, groundY, drawBackground, drawPlanet, drawStarToken, drawBlock, blockImage, drawShatter, drawIce, iceImage, ICE,
  drawTrampoline, drawDust, drawConfetti, drawBurstRays, drawRing, drawSparkBurst, drawSnow, drawZzz,
  outlinedText, drawCaption, sparkle, roundRect, starPath,
} from './props.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ICON = null;
export async function init() {
  ICON = await loadImage(path.join(HERE, '..', '..', 'assets', 'icon.png'));
}

// ------------------------------------------------------------------ layout constants
const KS = 1.12; // kid scale
const KID_X0 = 260;
const BLOCK = { label: '7 × 8', w: 440, h: 220, x: 690 };
BLOCK.y = groundY(BLOCK.x) - 18 - BLOCK.h / 2; // face centre so the block rests on the ground
const BED = { x: 540, y: 1598 };
const CHEER = { x: 912, y: 1400, s: 0.62 };
const GRID = { cx: 560, dx: 104, y1: 1150, dy: 86, R: 29 };
const gx = (c) => GRID.cx + (c - 3) * GRID.dx;
const gy = (k) => GRID.y1 - (k - 1) * GRID.dy; // k = 1..8 (bottom to top)

const FACE = {
  calm: { eyes: 'dot', mouth: 'smile', brows: 0, lookX: 0, lookY: 0, sweat: 0, blush: 0.6, blink: 1 },
};
const face = (o) => ({ ...FACE.calm, ...o });

// ------------------------------------------------------------------ kid helpers
const hipOn = (pose, gyv, s = KS, sq = 1) => groundedHipY(pose, s, gyv, sq);
const reachLocal = { R: kidJoints(POSE.reachR).rH, L: kidJoints(POSE.reachL).lH };
const standBedHip = hipOn(POSE.launch, BED.y);
const apexHipForRow = (k, side) => gy(k) + 4 - reachLocal[side][1] * KS;

// jump descriptors for the trampoline section: [takeoff, apex, land, apexHipY, poseAtApex]
const JUMPS = [];
T.APEX.forEach((a, i) => {
  const side = i % 2 === 0 ? 'R' : 'L';
  const hip = apexHipForRow(i + 1, side);
  const handX = BED.x + reachLocal[side][0] * KS;
  const handC = Math.max(0, Math.min(6, Math.round((handX - GRID.cx) / GRID.dx + 3)));
  JUMPS.push({ k: i + 1, t0: a - T.HALF_AIR, a, t1: a + T.HALF_AIR, hip, pose: side === 'R' ? POSE.reachR : POSE.reachL, side, depth: 14 + i * 3, handC, handX });
});
// challenge jumps
const J_B1 = { t0: T.B1_HIT - 13, a: T.B1_HIT, t1: T.B1_HIT + 13, hip: standBedHip - 300, pose: POSE.punchUL, depth: 26 };
const J_B2 = { t0: T.B2_HIT - 13, a: T.B2_HIT, t1: T.B2_HIT + 13, hip: standBedHip - 380, pose: POSE.kickUR, depth: 26 };
const J_SMALL = { t0: T.LAND8 + 4, a: T.LAND8 + 13, t1: T.LAND8 + 22, hip: standBedHip - 60, pose: POSE.victory, depth: 30 };
const J_BIG = { t0: T.TAKEOFF_BIG, a: T.HIT_BIG, hip: standBedHip - 500 };

function airPose(j, f) {
  const u = (f - j.t0) / (j.t1 - j.t0);
  if (u < 0.18) return mix(POSE.launch, j.pose, E.outCubic(u / 0.18));
  if (u < 0.62) return j.pose;
  if (u < 0.86) return mix(j.pose, POSE.fall, E.inOutCubic((u - 0.62) / 0.24));
  return mix(POSE.fall, POSE.land, E.inOutQuad((u - 0.86) / 0.14));
}
function airHip(j, f) {
  const u = (f - j.t0) / (j.t1 - j.t0);
  return standBedHip - (standBedHip - j.hip) * arc(u);
}
/** contact phase on the bed between landing frame L and next takeoff N */
function contact(f, L, N, depth) {
  const u = clamp((f - L) / Math.max(1, N - L));
  const d = depth * Math.sin(Math.PI * u);
  const pose = u < 0.5 ? mix(POSE.land, POSE.crouch, u * 2) : mix(POSE.crouch, POSE.launch, (u - 0.5) * 2);
  return { d, pose, sq: u < 0.4 ? 0.88 : u > 0.75 ? 1.08 : 0.95 };
}

const practiceFace = (f, j) => {
  const near = Math.abs(f - j.a) < 6;
  return face({
    eyes: near && j.k >= 4 ? 'happy' : 'dot',
    mouth: near ? 'grin' : 'determined',
    brows: near ? 0 : 0.8,
    lookY: f < j.a ? -1 : 0.2,
    blush: 0.8,
  });
};

/** Complete kid state at frame f */
export function kidState(f) {
  let x = KID_X0, y, pose = POSE.stand, rot = 0, sq = 1, s = KS, col = PAL.cream, fc = face({});
  let bedDepth = 0;
  // ---------------- S1 hook
  if (f < T.ICE_SHATTER) {
    const gyv = groundY(x);
    if (f < 12) {
      pose = mix(POSE.stand, POSE.lookUp, E.inOutSine(prog(0, 10, f)));
      fc = face({ lookX: 0.8, lookY: -1, mouth: f > 6 ? 'o' : 'smile' });
      y = hipOn(pose, gyv);
    } else if (f < T.BLOCK_LAND + 3) {
      pose = mix(POSE.lookUp, POSE.flinch, E.outCubic(prog(12, 16, f)));
      fc = face({ eyes: 'squint', mouth: 'wavy', brows: -1 });
      y = hipOn(pose, gyv);
    } else if (f < 31) {
      // startled hop backwards
      const u = prog(T.BLOCK_LAND + 3, 31, f);
      x = KID_X0 + 10 * (1 - u) - 18 * u;
      pose = mix(POSE.flinch, POSE.startle, E.outCubic(clamp(u * 2.2)));
      y = hipOn(POSE.stand, gyv) - 70 * arc(u);
      sq = u < 0.25 ? 1.12 : 1;
      fc = face({ eyes: 'wide', mouth: 'open', brows: -1, lookX: 0.7 });
    } else if (f < T.FREEZE_START) {
      x = KID_X0 - 18;
      const u = prog(31, 38, f);
      pose = mix(POSE.land, POSE.scared, E.outCubic(u));
      // knees knocking
      const knock = Math.sin(f * 1.6) * 7 * prog(33, 38, f);
      pose = { ...pose, lTh: pose.lTh + knock, rTh: pose.rTh - knock };
      sq = f < 33 ? 0.9 : 1;
      y = hipOn(pose, gyv, KS, sq);
      fc = face({ eyes: 'wide', mouth: 'wavy', brows: -1, lookX: 0.7, sweat: prog(34, 40, f) });
    } else {
      x = KID_X0 - 18;
      const u = prog(T.FREEZE_START, 58, f);
      pose = mix(POSE.scared, POSE.frozen, E.inOutCubic(u));
      y = hipOn(pose, gyv);
      col = mixColor(PAL.cream, PAL.ice, prog(T.FREEZE_START + 4, T.FREEZE_END, f));
      fc = face({ eyes: 'wide', mouth: 'wavy', brows: -1, lookX: 0.5, sweat: 1 - prog(56, 64, f) });
      // shiver inside the ice + knock reactions
      x += (f > 80 ? Math.sin(f * 2.3) * 1.3 : 0) + wobble(f - T.KNOCK1, 3, 2.2, 0.35) + wobble(f - T.KNOCK2, 4, 2.2, 0.35);
    }
    return finishKid({ x, y, pose, rot, sq, s, col, face: fc }, f);
  }
  // ---------------- S2 story (thaw, look, walk, hop on)
  if (f < T.HOP_ON_LAND) {
    x = KID_X0 - 18;
    if (f < 182) {
      const u = prog(T.ICE_SHATTER, 160, f);
      pose = mix(POSE.frozen, POSE.stand, E.outCubic(u));
      const shake = wobble(f - T.ICE_SHATTER, 16, 0.95, 0.11);
      pose = { ...pose, lean: shake, head: -shake * 0.6, lUA: pose.lUA - Math.abs(shake) * 1.5, rUA: pose.rUA + Math.abs(shake) * 1.5 };
      col = mixColor(PAL.ice, PAL.cream, prog(T.ICE_SHATTER, 160, f));
      fc = face({ eyes: f < 158 ? 'squint' : 'dot', mouth: f < 158 ? 'wavy' : 'grin', lookX: f > 158 ? 0.9 : 0, blink: f > 168 && f < 172 ? 0.1 : 1 });
      y = hipOn(pose, groundY(x));
    } else if (f < 240) {
      // watching the block burst into stars
      pose = mix(POSE.stand, POSE.lookUp, E.inOutSine(prog(186, 196, f)));
      const amazed = f > T.STOMP && f < 222;
      fc = face({ eyes: amazed ? 'wide' : 'dot', mouth: amazed ? 'o' : 'grin', lookX: lerp(0.9, 0.4, prog(190, 210, f)), lookY: -1 });
      y = hipOn(pose, groundY(x));
    } else if (f < T.WALK_START) {
      // scratches head at the sleepy stars
      const sc = { ...POSE.stand, rUA: 160, rFA: 122, head: -8, lean: -3 };
      pose = mix(POSE.lookUp, sc, E.inOutCubic(prog(240, 247, f)));
      pose = { ...pose, rFA: pose.rFA + Math.sin(f * 1.1) * 8 * prog(244, 247, f) };
      fc = face({ eyes: 'dot', mouth: 'flat', lookY: -1, lookX: 0.3, brows: -0.6 });
      y = hipOn(pose, groundY(x));
    } else if (f < 282) {
      // walk two steps to the right
      const u = prog(T.WALK_START, 282, f);
      x = lerp(KID_X0 - 18, 350, E.inOutSine(u));
      const ph = u * Math.PI * 2 * 1.5;
      const sw = Math.sin(ph);
      pose = {
        lean: 3, head: 2,
        lUA: -14 - 24 * sw, lFA: 20, rUA: 14 - 24 * sw, rFA: -20,
        lTh: -6 + 24 * sw, lSh: 6 + 24 * Math.max(0, -sw), rTh: 6 - 24 * sw, rSh: -6 + 24 * Math.max(0, sw) * -1,
      };
      y = hipOn(pose, groundY(x)) - Math.abs(Math.cos(ph)) * 6;
      fc = face({ eyes: 'dot', mouth: 'grin', lookX: 1 });
    } else {
      // hop onto the trampoline bed
      const u = prog(282, T.HOP_ON_LAND, f);
      x = lerp(350, BED.x, E.inOutSine(u));
      const y0 = hipOn(POSE.stand, groundY(350));
      const y1 = standBedHip;
      y = lerp(y0, y1, u) - 120 * arc(u);
      pose = u < 0.5 ? mix(POSE.crouch, POSE.hop, E.outCubic(u * 2)) : mix(POSE.hop, POSE.land, E.inCubic((u - 0.5) * 2));
      sq = u < 0.15 ? 1.1 : 1;
      fc = face({ eyes: 'dot', mouth: 'grin', lookY: -0.4 });
    }
    return finishKid({ x, y, pose, rot, sq, s, col, face: fc, bedDepth: 0 }, f);
  }
  x = BED.x;
  // ---------------- S3 practice: 8 bounces
  if (f < T.LAND8) {
    if (f < JUMPS[0].t0) {
      // settle + crouch on the bed
      const u = prog(T.HOP_ON_LAND, JUMPS[0].t0, f);
      bedDepth = 26 * Math.sin(Math.PI * u) * (u < 0.3 ? 1 : 1);
      pose = mix(POSE.land, POSE.crouch, E.inOutCubic(clamp(u * 1.4)));
      if (u > 0.85) pose = mix(pose, POSE.launch, (u - 0.85) / 0.15);
      sq = u > 0.85 ? 1.1 : 0.94;
      y = hipOn(pose, BED.y + bedDepth, KS, sq);
      fc = face({ eyes: 'dot', mouth: 'determined', brows: 0.9, lookY: -1 });
      return finishKid({ x, y, pose, rot, sq, s, col, face: fc, bedDepth }, f);
    }
    for (let i = 0; i < JUMPS.length; i++) {
      const j = JUMPS[i];
      if (f >= j.t0 && f < j.t1) {
        pose = airPose(j, f);
        y = airHip(j, f);
        const u = (f - j.t0) / (j.t1 - j.t0);
        sq = u < 0.12 ? 1.12 : u > 0.92 ? 0.94 : 1;
        fc = practiceFace(f, j);
        return finishKid({ x, y, pose, rot, sq, s, col, face: fc, bedDepth: 0 }, f);
      }
      const next = JUMPS[i + 1];
      if (next && f >= j.t1 && f < next.t0) {
        const c = contact(f, j.t1, next.t0, j.depth);
        bedDepth = c.d;
        pose = c.pose;
        sq = c.sq;
        y = hipOn(pose, BED.y + bedDepth, KS, sq);
        fc = face({ eyes: 'dot', mouth: 'grin', brows: 0.5, lookY: -1, blush: 0.8 });
        return finishKid({ x, y, pose, rot, sq, s, col, face: fc, bedDepth }, f);
      }
    }
  }
  // ---------------- S4 challenge
  if (f < T.FLIP_LAND) {
    const seq = [
      [T.LAND8, J_SMALL.t0, 30, null],
      [J_SMALL.t0, J_SMALL.t1, 0, J_SMALL],
      [J_SMALL.t1, J_B1.t0, 22, null],
      [J_B1.t0, J_B1.t1, 0, J_B1],
      [J_B1.t1, J_B2.t0, 24, null],
      [J_B2.t0, J_B2.t1, 0, J_B2],
    ];
    for (const [a, b, depth, j] of seq) {
      if (f >= a && f < b) {
        if (j) {
          pose = airPose(j, f);
          y = airHip(j, f);
          const u = (f - j.t0) / (j.t1 - j.t0);
          sq = u < 0.12 ? 1.12 : u > 0.92 ? 0.94 : 1;
          const near = Math.abs(f - j.a) < 5;
          fc = face({ eyes: near ? 'squint' : 'dot', mouth: near ? 'open' : 'determined', brows: 0.9, lookX: j === J_B1 ? -0.8 : j === J_B2 ? 0.8 : 0, lookY: -0.8 });
          if (j === J_B2) rot = -14 * Math.sin(Math.PI * clamp(u));
          if (j === J_B1) rot = 8 * Math.sin(Math.PI * clamp(u));
        } else {
          const c = contact(f, a, b, depth);
          bedDepth = c.d;
          pose = c.pose;
          sq = c.sq;
          y = hipOn(pose, BED.y + bedDepth, KS, sq);
          fc = face({ eyes: 'dot', mouth: f < T.B1_HIT ? 'grin' : 'determined', brows: 0.6, lookY: -1, lookX: f < J_B1.t0 ? -0.6 : 0.6 });
        }
        return finishKid({ x, y, pose, rot, sq, s, col, face: fc, bedDepth }, f);
      }
    }
    if (f < T.TAKEOFF_BIG) {
      // deep anticipation crouch while the giant block descends
      const u = prog(J_B2.t1, T.TAKEOFF_BIG, f);
      bedDepth = 52 * E.outCubic(clamp(u * 1.3)) * (u > 0.9 ? 1 - (u - 0.9) * 10 : 1);
      pose = mix(POSE.land, POSE.deepCrouch, E.outCubic(clamp(u * 1.5)));
      if (u > 0.9) pose = mix(pose, POSE.launch, (u - 0.9) / 0.1);
      const tremble = u > 0.5 && u < 0.9 ? Math.sin(f * 2.4) * 1.5 : 0;
      sq = u > 0.9 ? 1.15 : 0.92;
      y = hipOn(pose, BED.y + bedDepth, KS, sq) + tremble;
      fc = face({ eyes: u > 0.45 ? 'squint' : 'dot', mouth: 'determined', brows: 1, lookY: -1 });
      return finishKid({ x, y, pose, rot, sq, s, col, face: fc, bedDepth }, f);
    }
    if (f < T.HIT_BIG) {
      const u = prog(T.TAKEOFF_BIG, T.HIT_BIG, f);
      pose = mix(POSE.launch, POSE.uppercut, E.outCubic(clamp(u * 1.6)));
      y = standBedHip - (standBedHip - J_BIG.hip) * E.outQuad(u);
      sq = 1.18 - 0.18 * u;
      fc = face({ eyes: 'squint', mouth: 'open', brows: 1, lookY: -1 });
      return finishKid({ x, y, pose, rot, sq, s, col, face: fc, bedDepth: 0 }, f);
    }
    // after the hit: hang, backflip, fall
    const u = prog(T.HIT_BIG, T.FLIP_LAND, f);
    y = J_BIG.hip - 40 * Math.sin(Math.PI * clamp(u * 1.8)) * (u < 0.55 ? 1 : 0) + (standBedHip - J_BIG.hip) * E.inQuad(clamp((u - 0.2) / 0.8));
    rot = -360 * E.inOutCubic(prog(T.HIT_BIG + 3, T.FLIP_LAND - 5, f));
    if (f < T.HIT_BIG + 4) pose = POSE.uppercut;
    else if (f < T.FLIP_LAND - 8) pose = mix(POSE.uppercut, POSE.tuck, E.outCubic(prog(T.HIT_BIG + 4, T.HIT_BIG + 9, f)));
    else pose = mix(POSE.tuck, POSE.land, E.inOutCubic(prog(T.FLIP_LAND - 8, T.FLIP_LAND, f)));
    fc = face({ eyes: 'happy', mouth: 'grin', blush: 1 });
    return finishKid({ x, y, pose, rot, sq, s, col, face: fc, bedDepth: 0 }, f);
  }
  // ---------------- S5 celebrate
  if (f < T.CTA_START) {
    if (f < 708) {
      const u = prog(T.FLIP_LAND, 708, f);
      bedDepth = 36 * Math.sin(Math.PI * u);
      pose = mix(POSE.land, POSE.victory, E.outCubic(clamp((u - 0.4) / 0.6)));
      sq = u < 0.4 ? 0.86 : 1.04;
      y = hipOn(pose, BED.y + bedDepth, KS, sq);
      fc = face({ eyes: 'happy', mouth: 'grin', blush: 1 });
    } else if (f < T.HIGH_FIVE - 7) {
      pose = mix(POSE.victory, { ...POSE.victory, lUA: -160, rUA: 160 }, 0.5 + 0.5 * Math.sin(f * 0.45));
      bedDepth = 6 * Math.abs(Math.sin((f - 708) * 0.2));
      y = hipOn(pose, BED.y + bedDepth);
      fc = face({ eyes: 'happy', mouth: 'grin', blush: 1, lookX: 0.6 });
    } else if (f < 750) {
      const u = prog(T.HIGH_FIVE - 7, T.HIGH_FIVE, f);
      pose = mix(POSE.victory, POSE.highFive, E.outBack(u));
      const recoil = wobble(f - T.HIGH_FIVE, 10, 1.2, 0.25);
      pose = { ...pose, rUA: pose.rUA - recoil, lean: pose.lean - recoil * 0.3 };
      bedDepth = 4;
      y = hipOn(pose, BED.y + bedDepth);
      fc = face({ eyes: f >= T.HIGH_FIVE ? 'happy' : 'dot', mouth: 'grin', lookX: 1, blush: 1 });
    } else {
      // dance: bounce on the beat (15 frames) with alternating arm pumps
      const beat = (f - 750) / 15;
      const ph = beat * Math.PI;
      bedDepth = 14 * Math.abs(Math.sin(ph));
      const a = Math.sin(ph);
      pose = { ...POSE.victory, lUA: -150 + 30 * a, rUA: 150 + 30 * a, lFA: -12 + 30 * Math.max(0, a), rFA: 12 - 30 * Math.max(0, -a), lean: 4 * a, head: -4 * a };
      sq = 1 - 0.05 * Math.abs(Math.sin(ph));
      y = hipOn(pose, BED.y + bedDepth, KS, sq) - 10 * Math.abs(Math.cos(ph)) * 0;
      fc = face({ eyes: 'happy', mouth: 'grin', blush: 1, lookX: 0.3 });
    }
    return finishKid({ x, y, pose, rot, sq, s, col, face: fc, bedDepth }, f);
  }
  // ---------------- S6 CTA: hop off to the left, wave
  if (f < T.CTA_SETTLE) {
    const u = prog(T.CTA_START, T.CTA_SETTLE, f);
    x = lerp(BED.x, 300, E.inOutSine(u));
    s = lerp(KS, 0.9, u);
    const y0 = standBedHip, y1 = hipOn(POSE.stand, groundY(300), 0.9);
    y = lerp(y0, y1, E.inQuad(u)) - 190 * arc(u);
    pose = u < 0.5 ? mix(POSE.victory, POSE.hop, E.outCubic(u * 2)) : mix(POSE.hop, POSE.land, E.inCubic((u - 0.5) * 2));
    rot = -12 * Math.sin(Math.PI * u);
    fc = face({ eyes: 'happy', mouth: 'grin', blush: 1 });
    return finishKid({ x, y, pose, rot, sq, s, col, face: fc, bedDepth: 0 }, f);
  }
  x = 300;
  s = 0.9;
  const u = prog(T.CTA_SETTLE, T.CTA_SETTLE + 8, f);
  pose = mix(POSE.land, POSE.wave, E.outBack(u));
  const waveT = Math.max(0, f - T.CTA_SETTLE - 4);
  pose = { ...pose, rFA: pose.rFA + 24 * Math.sin(waveT * 0.38) * prog(T.CTA_SETTLE + 4, T.CTA_SETTLE + 10, f) };
  sq = f < T.CTA_SETTLE + 3 ? 0.9 : 1;
  y = hipOn(pose, groundY(x), s, sq);
  fc = face({ eyes: 'happy', mouth: 'grin', blush: 1, lookX: 0.15, blink: 1 });
  return finishKid({ x, y, pose, rot, sq, s, col, face: fc, bedDepth: 0 }, f);
}

function finishKid(k, f) {
  return k;
}

function kidWithTail(f) {
  const k = kidState(f);
  // follow-through for the headband tails from recent hip velocity
  const p1 = kidState(Math.max(0, f - 1)), p3 = kidState(Math.max(0, f - 3));
  const vx = (k.x - p3.x) / 3, vy = (k.y - p3.y) / 3;
  const vx1 = k.x - p1.x, vy1 = k.y - p1.y;
  const sp = Math.hypot(vx * 0.6 + vx1 * 0.4, vy * 0.6 + vy1 * 0.4);
  const trail = (Math.atan2(-(vy * 0.6 + vy1 * 0.4), -(vx * 0.6 + vx1 * 0.4)) * 180) / Math.PI;
  const rest = 50;
  const w = clamp(sp / 10);
  let a = rest + ((((trail - rest + 540) % 360) - 180) * w);
  k.tailAng = a + Math.sin(f * 0.55) * (5 + 10 * w);
  k.tailFlutter = Math.sin(f * 0.8) * (0.3 + 0.7 * w);
  return k;
}

function mixColor(a, b, t) {
  const pa = hex(a), pb = hex(b);
  const c = pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(t))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ------------------------------------------------------------------ buddy (Seven)
export function buddyState(f, kid) {
  const base = { s: 0.8, rot: 0, sx: 1, sy: 1, armL: -40, armR: 40, legL: -8, legR: 8, eyes: 'open', mouth: 'smile', lookX: 0, lookY: 0, glow: 1 };
  const bob = (amp = 8, sp = 0.18) => Math.sin(f * sp) * amp;
  if (f < T.BUDDY_IN) return null;
  if (f < T.BUDDY_ARRIVE) {
    const u = E.outCubic(prog(T.BUDDY_IN, T.BUDDY_ARRIVE, f));
    const [x, y] = quadBezier([1220, 420], [760, 640], [485, 1430], u);
    return { ...base, x, y, rot: 360 * 1.5 * (1 - u), armL: -150, armR: 150, legL: -30, legR: 30, mouth: 'grin', trail: true, lookX: -1 };
  }
  if (f < T.ICE_SHATTER + 2) {
    // knock knock
    const lunge = (kf) => {
      const t = f - kf;
      if (t < -4 || t > 6) return 0;
      return t < 0 ? E.inQuad((t + 4) / 4) : 1 - E.outQuad(t / 6);
    };
    const l = Math.max(lunge(T.KNOCK1), lunge(T.KNOCK2), lunge(T.ICE_SHATTER));
    const arrive = wobble(f - T.BUDDY_ARRIVE, 0.12, 0.8, 0.2);
    return { ...base, x: 485 - 40 * l, y: 1430 + bob(5), sx: 1 + arrive, sy: 1 - arrive, armL: lerp(-60, -92, l), armR: 50, lookX: -1, mouth: l > 0.5 ? 'o' : 'smile', rot: -6 * l };
  }
  if (f < T.BUDDY_TO_BLOCK) {
    return { ...base, x: 485, y: 1420 + bob(6, 0.3), armL: -150 + bob(14, 0.6), armR: 150 - bob(14, 0.6), eyes: 'happy', mouth: 'grin', legL: -20, legR: 20 };
  }
  const topY = BLOCK.y - BLOCK.h / 2 - 152 * 0.8;
  if (f < T.BUDDY_OVER_BLOCK) {
    const u = E.inOutCubic(prog(T.BUDDY_TO_BLOCK, T.BUDDY_OVER_BLOCK, f));
    const [x, y] = quadBezier([485, 1420], [600, 1120], [BLOCK.x, topY - 70], u);
    return { ...base, x, y, rot: 20 * Math.sin(Math.PI * u), armL: -120, armR: 120, lookX: 1, lookY: 1 };
  }
  if (f < T.STOMP) {
    // anticipation: rise + squash, then slam
    if (f < T.STOMP - 3) {
      const u = prog(T.BUDDY_OVER_BLOCK, T.STOMP - 3, f);
      return { ...base, x: BLOCK.x, y: topY - 70 - 30 * E.outCubic(u), sx: 1 + 0.12 * u, sy: 1 - 0.16 * u, armL: -160, armR: 160, eyes: 'happy', mouth: 'grin', legL: -40, legR: 40 };
    }
    const u = prog(T.STOMP - 3, T.STOMP, f);
    return { ...base, x: BLOCK.x, y: lerp(topY - 100, topY, E.inQuad(u)), sx: 0.88, sy: 1.18, armL: -170, armR: 170, mouth: 'o' };
  }
  if (f < 212) {
    const u = prog(T.STOMP, 212, f);
    const sq = wobble(f - T.STOMP, 0.22, 1.0, 0.18);
    return { ...base, x: lerp(BLOCK.x, 860, E.outCubic(u)), y: lerp(topY, 1330, E.outCubic(u)) - 150 * arc(clamp(u * 1.2)), rot: -360 * E.outCubic(u), sx: 1 + sq, sy: 1 - sq, armL: -150, armR: 150, eyes: 'happy', mouth: 'grin', legL: -30, legR: 30 };
  }
  if (f < T.TRAMP_CARRY) {
    const yawn = f > 244 && f < 250;
    return { ...base, x: 860, y: 1330 + bob(8, 0.2), lookY: -1, lookX: -0.6, eyes: yawn ? 'closed' : 'open', mouth: yawn ? 'o' : 'smile', armL: yawn ? -170 : -30, armR: yawn ? 170 : 30 };
  }
  if (f < 257) {
    const u = E.inCubic(prog(T.TRAMP_CARRY, 257, f));
    return { ...base, x: lerp(860, 1260, u), y: 1330 - 120 * u, rot: 25 * u, armL: -60, armR: 60, trail: true };
  }
  if (f < T.TRAMP_DROP) {
    const u = E.outCubic(prog(257, T.TRAMP_DROP, f));
    return { ...base, x: lerp(1300, BED.x, u), y: 1360 + bob(4, 0.5), rot: -10 * (1 - u), armL: -20, armR: 20, carrying: true, mouth: 'grin', lookX: -1 };
  }
  if (f < 292) {
    const u = E.inOutCubic(prog(T.TRAMP_DROP, 292, f));
    return { ...base, x: lerp(BED.x, CHEER.x, u), y: lerp(1360, CHEER.y, u) - 140 * arc(u), s: lerp(0.8, CHEER.s, u), armL: -150, armR: 150, eyes: 'happy', mouth: 'grin', rot: 360 * u };
  }
  // ---------------- cheering spot during practice / challenge
  if (f < T.BUDDY_FLY_IN) {
    let cheer = 0;
    for (const a of [...T.APEX, T.B1_HIT, T.B2_HIT, T.HIT_BIG]) {
      const t = f - a;
      if (t >= 0 && t < 12) cheer = Math.max(cheer, Math.sin((Math.PI * t) / 12));
    }
    const worried = f > T.B3_IN && f < T.HIT_BIG;
    const hop = cheer * 26 + (f > T.HIT_BIG && f < T.HIT_BIG + 30 ? 60 * arc(prog(T.HIT_BIG, T.HIT_BIG + 30, f)) : 0);
    const beat = Math.sin(((f - 300) / 15) * Math.PI);
    return {
      ...base, x: CHEER.x, y: CHEER.y - hop + Math.abs(beat) * -6, s: CHEER.s,
      armL: lerp(-40 + beat * 10, -160, cheer), armR: lerp(40 + beat * 10, 160, cheer),
      eyes: worried ? 'open' : cheer > 0.3 ? 'happy' : 'open', mouth: worried ? 'o' : cheer > 0.3 ? 'grin' : 'smile',
      lookX: -1, lookY: worried ? -1 : -0.4, legL: -10 - cheer * 20, legR: 10 + cheer * 20,
      rot: f > T.HIT_BIG && f < T.HIT_BIG + 30 ? 360 * E.inOutCubic(prog(T.HIT_BIG, T.HIT_BIG + 30, f)) : 0,
    };
  }
  // ---------------- S5 high five + dance
  const k5 = kidState(T.HIGH_FIVE);
  const hand = kidWorld(k5, 'rH');
  const hfS = 0.8;
  const hfArm = -132;
  const gloveLocal = [-24 + Math.sin(hfArm * D2R) * 50, 18 + Math.cos(hfArm * D2R) * 50];
  const meet = [hand[0] - gloveLocal[0] * hfS + 6, hand[1] - gloveLocal[1] * hfS - 4];
  if (f < T.HIGH_FIVE) {
    const u = prog(T.BUDDY_FLY_IN, T.HIGH_FIVE, f);
    const approach = E.inOutCubic(clamp(u / 0.75));
    const [x0, y0] = quadBezier([CHEER.x, CHEER.y], [1000, 1150], [meet[0] + 70, meet[1] - 10], approach);
    const lunge = E.inQuad(clamp((u - 0.75) / 0.25));
    return { ...base, s: lerp(CHEER.s, hfS, approach), x: lerp(x0, meet[0], lunge), y: lerp(y0, meet[1], lunge), armL: lerp(-60, hfArm, approach), armR: 60, lookX: -1, mouth: 'grin', trail: u < 0.7 };
  }
  if (f < T.CTA_START) {
    const t = f - T.HIGH_FIVE;
    const rec = wobble(t, 0.18, 1.1, 0.2);
    const away = E.outCubic(prog(T.HIGH_FIVE, T.HIGH_FIVE + 14, f));
    const beat = Math.sin(((f - 750) / 15) * Math.PI);
    const dancing = f >= 750;
    return {
      ...base, s: hfS, x: meet[0] + 40 * away, y: meet[1] + 30 * away + (dancing ? -Math.abs(beat) * 22 : 0),
      sx: 1 + rec, sy: 1 - rec, armL: dancing ? -150 + beat * 25 : lerp(hfArm, -150, away), armR: dancing ? 150 + beat * 25 : 150,
      eyes: 'happy', mouth: 'grin', rot: dancing ? beat * 10 : 0, legL: -20, legR: 20,
    };
  }
  // ---------------- S6 CTA
  const startX = meet[0] + 40, startY = meet[1] + 30;
  const u = E.inOutCubic(prog(T.CTA_START, T.CTA_SETTLE, f));
  const wave = Math.sin((f - T.CTA_SETTLE) * 0.38) * prog(T.CTA_SETTLE, T.CTA_SETTLE + 6, f);
  return {
    ...base, s: lerp(hfS, 0.74, u), x: lerp(startX, 800, u), y: lerp(startY, 1500, u) - 120 * arc(u) + (f > T.CTA_SETTLE ? bob(6, 0.2) : 0),
    armL: -40, armR: lerp(150, 140, u) + 25 * wave, eyes: 'happy', mouth: 'grin', lookX: -0.2, rot: f < T.CTA_SETTLE ? -20 * arc(u) : 0,
  };
}

// ------------------------------------------------------------------ challenge block positions (derived from contact points)
function challengeTargets() {
  const kB1 = kidState(T.B1_HIT), kB2 = kidState(T.B2_HIT), kB3 = kidState(T.HIT_BIG - 1);
  const fist1 = kidWorld(kB1, 'lH');
  const foot2 = kidWorld(kB2, 'rF');
  const fist3 = kidWorld({ ...kB3, pose: POSE.uppercut, y: J_BIG.hip, sq: 1 }, 'rH');
  return {
    b1: { label: '7 × 3', w: 300, h: 150, x: fist1[0] - 110, y: fist1[1] - 62, hit: fist1, ans: '21' },
    b2: { label: '7 × 5', w: 300, h: 150, x: foot2[0] + 120, y: foot2[1] - 58, hit: foot2, ans: '35' },
    b3: { label: '7 × 8', w: 480, h: 230, x: BED.x, y: fist3[1] - 130, hit: fist3, ans: '56' },
  };
}
let TG = null;

// ------------------------------------------------------------------ star grid state
const STAR_RNG = (() => {
  const r = rng(77);
  const a = [];
  for (let i = 0; i < 56; i++) a.push({ r1: r(), r2: r(), r3: r(), r4: r(), r5: r(), sky: [70 + r() * 940, 140 + r() * 980] });
  return a;
})();

function starStates(f) {
  const out = [];
  const burst = [BLOCK.x, BLOCK.y - 40];
  for (let k = 1; k <= 8; k++) {
    for (let c = 0; c < 7; c++) {
      const i = (k - 1) * 7 + c;
      const R = STAR_RNG[i];
      const tx = gx(c), ty = gy(k);
      let x = tx, y = ty, lit = 1, pop = 0, rot = 0, sleepy = 0, alpha = 1, scale = 1;
      if (f < T.STOMP) continue;
      const launch = T.STOMP + i * 0.33 + R.r1 * 3;
      const dur = 20 + R.r2 * 5;
      if (f < launch) continue;
      if (f < launch + dur) {
        const u = E.outCubic((f - launch) / dur);
        const ctrl = [lerp(burst[0], tx, 0.5) + (R.r3 - 0.5) * 420, Math.min(burst[1], ty) - 220 - R.r4 * 200];
        [x, y] = quadBezier(burst, ctrl, [tx, ty], u);
        scale = 0.35 + 0.65 * u;
        rot = (1 - u) * 400 * (R.r5 - 0.5);
        out.push({ x, y, R: GRID.R * scale, lit: 1, pop: 0, rot, sleepy: 0, alpha: 1, k, c, flying: true });
        continue;
      }
      // asleep after settling
      const sleepAt = T.SLEEP_START + R.r3 * 10;
      const sleepAmt = prog(sleepAt, sleepAt + 6, f);
      lit = 1 - sleepAmt;
      sleepy = sleepAmt;
      // wake during practice
      const apex = T.APEX[k - 1];
      const handC = JUMPS[k - 1].handC; // ripple starts at the star the hand slaps
      const wakeAt = apex + Math.abs(c - handC) * 1.6;
      if (f >= wakeAt) {
        lit = prog(wakeAt, wakeAt + 3, f);
        sleepy = 1 - lit;
        pop = prog(wakeAt, wakeAt + 10, f);
      }
      if (sleepy > 0.5) y += Math.sin(f * 0.09 + i * 0.7) * 2.5;
      if (lit > 0.5) rot = Math.sin(f * 0.05 + i) * 6;
      // challenge: lit stars drift up into the night sky
      const lift = prog(T.LAND8 + 3 + R.r4 * 10, T.LAND8 + 33 + R.r4 * 10, f);
      if (lift > 0) {
        const e = E.inOutCubic(lift);
        x = lerp(x, R.sky[0], e);
        y = lerp(y, R.sky[1] - 60, e);
        scale = lerp(1, 0.32, e);
        alpha = lerp(1, 0.75, e);
        pop = 0;
      }
      out.push({ x, y, R: GRID.R * scale, lit, pop, rot, sleepy, alpha, k, c });
    }
  }
  return out;
}

// ------------------------------------------------------------------ orbit ring (S5-S6)
function ringState(f) {
  if (f < T.ORBIT_BURST) return null;
  const toCTA = E.inOutCubic(prog(T.CTA_START, T.ICON_POP + 2, f));
  const cx = lerp(560, 540, toCTA), cy = lerp(1395, 640, toCTA);
  const rx = lerp(300, 300, toCTA), ry = lerp(64, 78, toCTA);
  const tilt = lerp(-8, -14, toCTA);
  const spin = (f - T.ORBIT_BURST) * 0.035;
  const form = E.inOutCubic(prog(T.ORBIT_BURST, T.ORBIT_BURST + 26, f));
  return { cx, cy, rx, ry, tilt, spin, form };
}
function ringStars(f, rs, front) {
  const out = [];
  const src = [TG.b3.x, TG.b3.y + 10];
  for (let i = 0; i < 56; i++) {
    const R = STAR_RNG[i];
    const th = (i / 56) * Math.PI * 2 + rs.spin;
    const lx = Math.cos(th) * rs.rx, ly = Math.sin(th) * rs.ry;
    const ct = Math.cos(rs.tilt * D2R), st = Math.sin(rs.tilt * D2R);
    const ex = rs.cx + lx * ct - ly * st, ey = rs.cy + lx * st + ly * ct;
    const isFront = Math.sin(th) > 0;
    if (isFront !== front) continue;
    const delay = R.r1 * 0.35;
    const fu = clamp((rs.form - delay) / (1 - delay));
    const sx = src[0] + (R.r2 - 0.5) * 300, sy = src[1] + (R.r3 - 0.5) * 160;
    const ctrl = [lerp(sx, ex, 0.5) + (R.r4 - 0.5) * 300, Math.min(sy, ey) - 150];
    const [x, y] = quadBezier([sx, sy], ctrl, [ex, ey], fu);
    const depth = 0.75 + 0.25 * Math.sin(th);
    out.push({ x, y, R: 15 * depth * (0.8 + 0.2 * fu), a: 0.7 + 0.3 * depth, i, fu });
  }
  return out;
}
function drawRingStars(ctx, f, rs, front) {
  if (!rs) return;
  // ring band
  ctx.save();
  ctx.translate(rs.cx, rs.cy);
  ctx.rotate(rs.tilt * D2R);
  ctx.beginPath();
  if (front) ctx.ellipse(0, 0, rs.rx, rs.ry, 0, 0, Math.PI);
  else ctx.ellipse(0, 0, rs.rx, rs.ry, 0, Math.PI, Math.PI * 2);
  ctx.lineWidth = 14 * rs.form;
  ctx.strokeStyle = `rgba(56,214,232,${0.28 * rs.form})`;
  ctx.stroke();
  ctx.lineWidth = 4 * rs.form;
  ctx.strokeStyle = `rgba(150,240,255,${0.85 * rs.form})`;
  ctx.stroke();
  ctx.restore();
  for (const s of ringStars(f, rs, front)) {
    ctx.save();
    ctx.globalAlpha *= s.a;
    if (s.fu < 1) {
      const gl = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.R * 2.6);
      gl.addColorStop(0, `rgba(255,214,102,${0.6 * (1 - s.fu)})`);
      gl.addColorStop(1, 'rgba(255,214,102,0)');
      ctx.fillStyle = gl;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.R * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    starPath(ctx, s.x, s.y, s.R, s.R * 0.45, f * 3 + s.i * 20);
    ctx.fillStyle = s.i % 3 === 0 ? PAL.cyan : PAL.yellow;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = PAL.ink;
    ctx.stroke();
    ctx.restore();
  }
}

// ------------------------------------------------------------------ camera
function camera(f) {
  // hook: close two-shot, then pull back to reveal the star grid
  const pull = E.inOutCubic(prog(186, 236, f));
  const push = E.inOutSine(prog(T.FREEZE_START, 110, f)) * 0.05;
  let z = lerp(1.3 + push, 1, pull);
  const fx = lerp(505, 540, pull), fy = 1500;
  const ax = 540, ay = lerp(1290, 1500, pull);
  // impact zoom punches
  const punch = (kf, amt, d = 7) => (f >= kf ? amt * Math.exp(-(f - kf) / d) : 0);
  z += punch(T.BLOCK_LAND, 0.04) + punch(T.HIT_BIG, 0.05, 9) + punch(T.STOMP, 0.02);
  for (const a of T.APEX) z += punch(a, 0.012, 5);
  // shake
  let sx = 0, sy = 0;
  const shakes = [
    [T.BLOCK_LAND, 24], [T.ICE_SHATTER, 9], [T.STOMP, 14], [T.TRAMP_LAND, 5],
    [T.B1_HIT, 9], [T.B2_HIT, 9], [T.HIT_BIG, 26], [T.FLIP_LAND, 6],
  ];
  for (const [kf, amp] of shakes) {
    const t = f - kf;
    if (t < 0 || t > 24) continue;
    const a = amp * Math.exp(-t / 5);
    sx += a * noise1(t * 1.7, kf);
    sy += a * noise1(t * 1.7, kf + 13);
  }
  return { z, fx, fy, ax: ax + sx, ay: ay + sy, x: sx, y: sy };
}

// ------------------------------------------------------------------ drawing helpers
function shadow(ctx, x, gyv, w, a) {
  if (a <= 0) return;
  ctx.beginPath();
  ctx.ellipse(x, gyv + 4, w, w * 0.18, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(10,4,40,${a})`;
  ctx.fill();
}

function popText(ctx, text, x, y, t, size, opts = {}) {
  if (t < 0) return;
  const life = opts.life ?? 30;
  if (t > life) return;
  const sc = E.outBackBig(clamp(t / 10));
  const a = 1 - clamp((t - life + 8) / 8);
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(x, y - (opts.float ?? 30) * E.outCubic(clamp(t / life)));
  ctx.scale(sc, sc);
  ctx.rotate((opts.rot ?? -6) * D2R * (1 - clamp(t / 10)));
  outlinedText(ctx, text, 0, 0, size, { grad: [[0, PAL.yellowHi], [1, PAL.orange]], sw: size * 0.16 });
  ctx.restore();
}

function speedLines(ctx, x, y, f, from, to, seed = 3) {
  if (f < from || f > to) return;
  const r = rng(seed + f);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const lx = x + (r() - 0.5) * 260;
    const ly = y + 40 + r() * 200;
    ctx.lineWidth = 3 + r() * 4;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx, ly + 60 + r() * 90);
    ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ main frame
export function drawFrame(ctx, f, opts = {}) {
  if (!TG) TG = challengeTargets();
  const cam = camera(f);
  const kid = kidWithTail(f);
  const bud = buddyState(f, kid);

  drawBackground(ctx, f, cam);

  ctx.save();
  ctx.translate(cam.ax, cam.ay);
  ctx.scale(cam.z, cam.z);
  ctx.translate(-cam.fx, -cam.fy);

  drawPlanet(ctx, f);

  // ---- star grid (behind characters)
  const stars = starStates(f);
  for (const s of stars) drawStarToken(ctx, s.x, s.y, s.R, s.lit, s.pop, s.rot, s.sleepy, s.alpha);
  if (f >= T.SLEEP_START && f < 312) {
    drawZzz(ctx, gx(6) + 40, gy(8) - 10, f - (T.SLEEP_START + 4), 66);
    drawZzz(ctx, gx(0) - 10, gy(6) - 20, f - (T.SLEEP_START + 16), 56);
  }
  // row totals (skip counting) on the left of the grid
  if (f >= T.APEX[0] && f < T.LAND8 + 22) {
    const fade = 1 - prog(T.LAND8 + 6, T.LAND8 + 20, f);
    T.APEX.forEach((a, i) => {
      if (f < a) return;
      const t = f - a;
      const sc = E.outBackBig(clamp(t / 9));
      ctx.save();
      ctx.globalAlpha *= fade;
      ctx.translate(gx(0) - 76, gy(i + 1));
      ctx.scale(sc, sc);
      outlinedText(ctx, String(T.COUNT[i]), 0, 0, 46, { fill: PAL.yellow, sw: 9, align: 'center', shadow: false });
      ctx.restore();
    });
  }

  // ---- hook block + shadow
  if (f < T.STOMP) {
    const fallU = prog(0, T.BLOCK_LAND, f);
    const by = f < T.BLOCK_LAND ? lerp(520, BLOCK.y, E.inQuad(fallU)) : BLOCK.y;
    shadow(ctx, BLOCK.x, groundY(BLOCK.x), 120 + 140 * fallU, 0.15 + 0.3 * fallU);
    const sqk = wobble(f - T.BLOCK_LAND, 0.16, 0.95, 0.22);
    const rot = f < T.BLOCK_LAND ? -10 * (1 - fallU) : 0;
    const stomp = wobble(f - (T.STOMP - 1), 0.1, 1.2, 0.2);
    drawBlock(ctx, BLOCK.label, BLOCK.w, BLOCK.h, BLOCK.x, by, rot, 1 + sqk + stomp, 1 - sqk - stomp);
  }
  if (f >= T.BLOCK_LAND && f < T.BLOCK_LAND + 30) {
    drawDust(ctx, BLOCK.x - BLOCK.w / 2, groundY(BLOCK.x - 240) - 6, f - T.BLOCK_LAND, 3, 8, 1.6);
    drawDust(ctx, BLOCK.x + BLOCK.w / 2, groundY(BLOCK.x + 240) - 6, f - T.BLOCK_LAND, 4, 8, 1.6);
  }

  // ---- trampoline (back) + carried trampoline
  const tramp = trampState(f, bud, kid);
  if (tramp) drawTrampoline(ctx, tramp.x, tramp.y, tramp.depth, tramp.alpha, tramp.sink);

  // ---- ring back half
  const rs = ringState(f);
  if (f < T.CTA_START + 4) drawRingStars(ctx, f, rs, false);

  // ---- shadows
  const kidGround = f >= T.HOP_ON_LAND - 4 && f < T.CTA_START + 10 ? BED.y + 10 : groundY(kid.x);
  const kh = clamp(1 - (kidGround - 135 - kid.y) / 700);
  if (!(f >= T.HOP_ON_LAND && f < T.CTA_START + 10)) shadow(ctx, kid.x, groundY(kid.x), 70 * kid.s, 0.35 * kh);
  if (bud && f >= T.CTA_SETTLE - 6) shadow(ctx, bud.x - 10, groundY(bud.x), 70 * bud.s, 0.3);

  // ---- characters
  const budBehind = bud && f >= T.HIGH_FIVE - 2 && f < T.CTA_START;
  if (bud && budBehind) drawBuddyFx(ctx, bud, f);
  drawKid(ctx, kid);
  if (bud && !budBehind) drawBuddyFx(ctx, bud, f);

  // ---- trampoline front rim over the kid's feet
  if (tramp && tramp.alpha > 0) drawTrampolineFront(ctx, tramp);

  // ---- ice
  if (f >= T.FREEZE_START && f < T.ICE_SHATTER) {
    const g = E.outCubic(prog(T.FREEZE_START, T.FREEZE_END, f));
    const crack = [];
    if (f >= T.KNOCK1) crack.push({ x: 380, y: 1450, amt: prog(T.KNOCK1, T.KNOCK1 + 3, f) * 0.55, seed: 21 });
    if (f >= T.KNOCK2) crack.push({ x: 384, y: 1430, amt: prog(T.KNOCK2, T.KNOCK2 + 3, f), seed: 22 });
    const shakeX = wobble(f - T.KNOCK1, 4, 2.2, 0.35) + wobble(f - T.KNOCK2, 5, 2.2, 0.35);
    ctx.save();
    ctx.translate(shakeX, 0);
    drawIce(ctx, KID_X0 - 18, groundY(KID_X0) + 10, g, f, { sheen: prog(88, 106, f), crack });
    ctx.restore();
  }
  drawSnow(ctx, KID_X0 - 18, 1500, f, T.FREEZE_START, 112);
  if (f >= T.ICE_SHATTER && f < T.ICE_SHATTER + 40) {
    const { img, pad } = iceImage();
    const ox = KID_X0 - 18 - ICE.w / 2 - pad, oy = groundY(KID_X0) + 10 - ICE.h - pad;
    drawShatter(ctx, img, ox, oy, img.width, img.height, 400, 1440, f - T.ICE_SHATTER, { seed: 5, cols: 4, rows: 5, power: 15, upBias: 9, life: 36, edge: 'rgba(235,252,255,0.9)' });
    drawRing(ctx, 390, 1440, f - T.ICE_SHATTER, 160, 14, '220,250,255', 10);
    drawSparkBurst(ctx, KID_X0, 1480, f - T.ICE_SHATTER, 8, 10, 160, 22);
  }

  // ---- question mark over the kid
  if (f >= T.QMARK_POP && f < 58) {
    const t = f - T.QMARK_POP;
    const sc = E.outBackBig(clamp(t / 8)) * (1 - E.inBack(prog(50, 58, f)));
    const head = kidWorld(kid, 'head');
    ctx.save();
    ctx.translate(head[0] + 100, head[1] - 125);
    ctx.rotate((Math.sin(t * 0.35) * 10) * D2R);
    ctx.scale(sc, sc);
    outlinedText(ctx, '?', 0, 0, 150, { fill: PAL.yellow, sw: 18 });
    ctx.restore();
  }

  // ---- stomp burst
  if (f >= T.STOMP && f < T.STOMP + 40) {
    const b = blockImage(BLOCK.label, BLOCK.w, BLOCK.h);
    const ox = BLOCK.x - BLOCK.w / 2 - b.pad, oy = BLOCK.y - BLOCK.h / 2 - b.pad;
    drawShatter(ctx, b.img, ox, oy, b.img.width, b.img.height, BLOCK.x, BLOCK.y - BLOCK.h / 2, f - T.STOMP, { seed: 9, cols: 5, rows: 3, power: 13, upBias: 4, life: 34 });
    drawBurstRays(ctx, BLOCK.x, BLOCK.y - 60, f - T.STOMP, 300, 16, 'rgba(255,227,138,', 14);
    drawDust(ctx, BLOCK.x, groundY(BLOCK.x) - 4, f - T.STOMP, 6, 12, 1.4);
  }

  // ---- challenge blocks
  drawChallenge(ctx, f);

  // ---- big 56
  if (f >= T.HIT_BIG && f < T.ORBIT_BURST + 10) {
    const t = f - T.HIT_BIG;
    const sc = E.outElastic(clamp(t / 22)) * (1 + 0.35 * E.inBack(prog(T.ORBIT_BURST - 2, T.ORBIT_BURST + 8, f)));
    const a = 1 - prog(T.ORBIT_BURST, T.ORBIT_BURST + 8, f);
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.translate(TG.b3.x, TG.b3.y + 20 + Math.sin(t * 0.12) * 6);
    const gl = ctx.createRadialGradient(0, 0, 0, 0, 0, 260);
    gl.addColorStop(0, `rgba(255,214,102,${0.45 * clamp(t / 6)})`);
    gl.addColorStop(1, 'rgba(255,214,102,0)');
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(0, 0, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.scale(sc, sc);
    outlinedText(ctx, '56', 0, 10, 250, { grad: [[0, PAL.yellowHi], [0.6, PAL.yellow], [1, PAL.orange]], sw: 30 });
    ctx.restore();
    const ta = clamp((f - T.HIT_BIG - 6) / 8) * a;
    ctx.save();
    ctx.globalAlpha *= ta;
    outlinedText(ctx, '7 × 8 =', TG.b3.x, TG.b3.y - 150 + (1 - ta) * 20, 84, { fill: PAL.cream, sw: 13 });
    ctx.restore();
  }
  if (f >= T.HIT_BIG) {
    drawBurstRays(ctx, TG.b3.hit[0], TG.b3.hit[1] - 60, f - T.HIT_BIG, 520, 22, 'rgba(255,240,190,', 16, 12);
    drawConfetti(ctx, TG.b3.x, TG.b3.y, f - T.HIT_BIG - 1, 31, 80, 26);
  }
  speedLines(ctx, kid.x, kid.y, f, T.TAKEOFF_BIG + 1, T.HIT_BIG - 1);

  // ---- high five spark
  if (f >= T.HIGH_FIVE && f < T.HIGH_FIVE + 26) {
    const hand = kidWorld(kidState(T.HIGH_FIVE), 'rH');
    drawSparkBurst(ctx, hand[0], hand[1], f - T.HIGH_FIVE, 14, 10, 130, 24);
    drawRing(ctx, hand[0], hand[1], f - T.HIGH_FIVE, 110, 14, '255,227,138', 9);
    drawBurstRays(ctx, hand[0], hand[1], f - T.HIGH_FIVE, 150, 10, 'rgba(255,255,255,', 10, 17);
  }

  // ---- ring front half (S5)
  if (f < T.CTA_START + 4) drawRingStars(ctx, f, rs, true);

  ctx.restore(); // camera

  // ================= screen space UI
  for (const [text, a, b] of T.CAPTIONS) drawCaption(ctx, text, f, a, b, 300, 70);
  drawPracticeHUD(ctx, f);

  // ---- CTA
  if (f >= T.CTA_START) drawCTA(ctx, f, rs);

  // ---- flashes
  const flash = (kf, amt, d) => (f >= kf && f < kf + d ? amt * (1 - (f - kf) / d) : 0);
  const fl = Math.max(flash(T.HIT_BIG, 0.5, 7), flash(T.ICON_POP, 0.28, 8), flash(T.ICE_SHATTER, 0.2, 5), flash(T.STOMP, 0.22, 5), flash(T.BLOCK_LAND, 0.18, 4));
  if (fl > 0) {
    ctx.fillStyle = `rgba(255,250,235,${fl})`;
    ctx.fillRect(0, 0, W, H);
  }
  // vignette
  const vg = ctx.createRadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H * 0.5, H * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(5,2,20,0.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  if (opts.debug) {
    ctx.font = `700 34px ${FONT}`;
    ctx.fillStyle = '#0f0';
    ctx.textAlign = 'left';
    ctx.fillText(`f${f}  ${(f / 30).toFixed(2)}s`, 20, 50);
  }
}

function drawBuddyFx(ctx, b, f) {
  if (b.trail) {
    for (let i = 6; i >= 1; i--) {
      const p = buddyState(f - i * 1.5);
      if (!p) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 20, 34 * p.s * (1 - i / 8), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56,214,232,${0.32 * (1 - i / 7)})`;
      ctx.fill();
    }
  }
  drawBuddy(ctx, b);
}

function trampState(f, bud) {
  if (f < 257) return null;
  if (f < T.TRAMP_DROP) return { x: bud.x, y: bud.y + 150, depth: 6, alpha: 1, sink: 0, carried: true };
  if (f < T.TRAMP_LAND) {
    const u = E.inQuad(prog(T.TRAMP_DROP, T.TRAMP_LAND, f));
    return { x: BED.x, y: lerp(1360 + 150, BED.y, u), depth: 0, alpha: 1, sink: 0 };
  }
  const k = kidState(f);
  let depth = k.bedDepth || 0;
  depth += wobble(f - T.TRAMP_LAND, 10, 1.1, 0.25);
  const out = E.inCubic(prog(T.CTA_START + 3, T.CTA_SETTLE + 4, f));
  return { x: BED.x, y: BED.y, depth, alpha: 1 - out, sink: 80 * out };
}

function drawTrampolineFront(ctx, t) {
  ctx.save();
  ctx.globalAlpha *= t.alpha;
  ctx.translate(0, t.sink);
  ctx.beginPath();
  ctx.ellipse(t.x, t.y, 150, 24, 0, 0.05, Math.PI - 0.05);
  ctx.lineCap = 'round';
  ctx.lineWidth = 16;
  ctx.strokeStyle = PAL.ink;
  ctx.stroke();
  ctx.lineWidth = 9;
  ctx.strokeStyle = PAL.cyan;
  ctx.stroke();
  ctx.restore();
}

function drawChallenge(ctx, f) {
  const items = [
    [TG.b1, T.B1_HIT, 576, -1, 41],
    [TG.b2, T.B2_HIT, 606, 1, 43],
  ];
  for (const [b, hit, enter, side, seed] of items) {
    if (f < enter) continue;
    if (f < hit) {
      const u = prog(enter, hit - 5, f);
      const x = lerp(b.x + side * 420, b.x, E.outCubic(u));
      const y = lerp(-180, b.y, E.outBack(u));
      const rot = side * 25 * (1 - E.outCubic(u)) + Math.sin(f * 0.6) * 3 * (1 - u * 0.5);
      drawBlock(ctx, b.label, b.w, b.h, x, y, rot);
    } else if (f < hit + 40) {
      const bi = blockImage(b.label, b.w, b.h);
      const ox = b.x - b.w / 2 - bi.pad, oy = b.y - b.h / 2 - bi.pad;
      drawShatter(ctx, bi.img, ox, oy, bi.img.width, bi.img.height, b.hit[0], b.hit[1], f - hit, { seed, cols: 4, rows: 2, power: 15, upBias: 3, life: 30 });
      drawBurstRays(ctx, b.hit[0], b.hit[1], f - hit, 200, 12, 'rgba(255,227,138,', 10, seed);
      drawRing(ctx, b.hit[0], b.hit[1], f - hit, 120, 12);
    }
    popText(ctx, b.ans, b.x, b.y, f - hit - 1, 130, { life: 30, float: 50, rot: side * -8 });
  }
  // giant block
  const b = TG.b3;
  if (f >= T.B3_IN && f < T.HIT_BIG) {
    const u = prog(T.B3_IN, T.B3_HOVER, f);
    const y = lerp(-300, b.y, E.outCubic(u)) + (f > T.B3_HOVER ? Math.sin(f * 0.5) * 4 : 0);
    const rot = Math.sin(f * 0.21) * 3;
    // ominous shadow glow
    ctx.save();
    const g = ctx.createRadialGradient(b.x, y, 40, b.x, y, 380);
    g.addColorStop(0, 'rgba(255,138,31,0.20)');
    g.addColorStop(1, 'rgba(255,138,31,0)');
    ctx.fillStyle = g;
    ctx.fillRect(b.x - 400, y - 400, 800, 800);
    ctx.restore();
    const sq = f > T.HIT_BIG - 3 ? 0.06 : 0;
    drawBlock(ctx, b.label, b.w, b.h, b.x, y, rot, 1 + sq, 1 - sq);
  } else if (f >= T.HIT_BIG && f < T.HIT_BIG + 50) {
    const bi = blockImage(b.label, b.w, b.h);
    const ox = b.x - b.w / 2 - bi.pad, oy = b.y - b.h / 2 - bi.pad;
    drawShatter(ctx, bi.img, ox, oy, bi.img.width, bi.img.height, b.hit[0], b.hit[1] + 20, f - T.HIT_BIG, { seed: 51, cols: 6, rows: 4, power: 24, upBias: 2, life: 44, gravity: 0.9 });
  }
}

function drawPracticeHUD(ctx, f) {
  const a0 = T.HOP_ON_LAND + 12, a1 = T.LAND8 + 4;
  if (f >= a0 && f < a1) drawCaption(ctx, 'Count in sevens', f, a0, a1, 286, 58);
  if (f < T.APEX[0] || f >= T.LAND8 + 6) return;
  let k = 0;
  T.APEX.forEach((a, i) => {
    if (f >= a) k = i + 1;
  });
  const t = f - T.APEX[k - 1];
  const sc = 1 + 0.22 * Math.exp(-t / 4) * (t >= 0 ? 1 : 0);
  const out = prog(T.LAND8, T.LAND8 + 6, f);
  ctx.save();
  ctx.globalAlpha *= 1 - out;
  ctx.translate(W / 2, 404);
  ctx.scale(sc, sc);
  // equation: "7 × k =" in cream, answer in yellow
  ctx.font = `700 104px ${FONT}`;
  const left = `7 × ${k} = `;
  const right = String(7 * k);
  const wl = ctx.measureText(left).width, wr = ctx.measureText(right).width;
  const x0 = -(wl + wr) / 2;
  outlinedText(ctx, left, x0 + wl / 2, 0, 104, { fill: PAL.cream, sw: 15 });
  outlinedText(ctx, right, x0 + wl + wr / 2, 0, 104, { grad: [[0, PAL.yellowHi], [1, PAL.orange]], sw: 15 });
  ctx.restore();
}

function drawCTA(ctx, f, rs) {
  // ring back half around the icon
  if (f >= T.CTA_START + 4) drawRingStars(ctx, f, rs, false);
  // icon
  if (f >= T.ICON_POP) {
    const t = f - T.ICON_POP;
    const sc = E.outBackBig(clamp(t / 14));
    const bob = Math.sin(t * 0.09) * 6;
    const size = 340;
    ctx.save();
    ctx.translate(540, 640 + bob);
    const gl = ctx.createRadialGradient(0, 0, 60, 0, 0, 330);
    gl.addColorStop(0, `rgba(123,63,228,${0.65 * clamp(t / 8)})`);
    gl.addColorStop(1, 'rgba(123,63,228,0)');
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(0, 0, 330, 0, Math.PI * 2);
    ctx.fill();
    ctx.scale(sc, sc);
    ctx.rotate((1 - clamp(t / 14)) * -12 * D2R);
    roundRect(ctx, -size / 2 - 8, -size / 2 - 8, size + 16, size + 16, 84);
    ctx.fillStyle = PAL.ink;
    ctx.fill();
    roundRect(ctx, -size / 2 - 4, -size / 2 - 4, size + 8, size + 8, 80);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.save();
    roundRect(ctx, -size / 2, -size / 2, size, size, 76);
    ctx.clip();
    ctx.drawImage(ICON, -size / 2, -size / 2, size, size);
    ctx.restore();
    ctx.restore();
    drawRing(ctx, 540, 640, t, 300, 16, '255,255,255', 12);
    drawSparkBurst(ctx, 540, 640, t - 2, 23, 12, 290, 26);
  }
  // ring front half
  if (f >= T.CTA_START + 4) drawRingStars(ctx, f, rs, true);
  // wordmark, letter by letter
  if (f >= T.WORD_POP) {
    const word = 'TableVerse';
    const size = 132;
    ctx.save();
    ctx.font = `700 ${size}px ${FONT}`;
    const widths = [...word].map((ch) => ctx.measureText(ch).width);
    const total = ctx.measureText(word).width;
    let x = 540 - total / 2;
    [...word].forEach((ch, i) => {
      const t = f - T.WORD_POP - i * 2;
      const cw = widths[i];
      if (t >= 0) {
        const sc = E.outBackBig(clamp(t / 9));
        ctx.save();
        ctx.translate(x + cw / 2, 958 - 30 * (1 - E.outCubic(clamp(t / 9))));
        ctx.scale(sc, sc);
        outlinedText(ctx, ch, 0, 0, size, { grad: [[0, PAL.yellowHi], [0.55, PAL.yellow], [1, PAL.orange]], sw: 20 });
        ctx.restore();
      }
      x += cw;
    });
    ctx.restore();
  }
  // tagline (verbatim Google Play listing description)
  if (f >= T.TAG_IN) {
    const a = E.outCubic(prog(T.TAG_IN, T.TAG_IN + 10, f));
    ctx.save();
    ctx.globalAlpha *= a;
    const lines = ['Learn multiplication tables through', 'stories, practice and fun challenges.'];
    lines.forEach((ln, i) => outlinedText(ctx, ln, 540, 1058 + i * 56 + (1 - a) * 18, 46, { fill: '#EDE6FF', sw: 9, weight: 600, shadow: false }));
    ctx.restore();
  }
  // CTA pill
  if (f >= T.PILL_POP) {
    const t = f - T.PILL_POP;
    const sc = E.outBackBig(clamp(t / 10)) * (1 + 0.025 * Math.sin(Math.max(0, t - 12) * 0.3) * (t > 12 ? 1 : 0));
    const w = 740, h = 118;
    ctx.save();
    ctx.translate(540, 1222);
    ctx.scale(sc, sc);
    roundRect(ctx, -w / 2, -h / 2 + 10, w, h, h / 2);
    ctx.fillStyle = 'rgba(8,4,30,0.5)';
    ctx.fill();
    roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, PAL.yellowHi);
    g.addColorStop(1, PAL.yellow);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = PAL.ink;
    ctx.stroke();
    ctx.font = `700 56px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PAL.text;
    ctx.fillText('Explore on Google Play', 0, 4);
    // shine sweep
    const sx = -w / 2 - 120 + ((t * 18) % (w + 600));
    ctx.save();
    roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
    ctx.clip();
    const sg = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)');
    sg.addColorStop(0.5, 'rgba(255,255,255,0.45)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.restore();
  }
}
