// Single source of truth for timing. Video (scenes.mjs) and audio (audio.mjs) both read this file,
// so every sound effect is locked to the frame of the action that causes it.
import fs from "node:fs";
import path from "node:path";
import { FPS } from "./lib/util.mjs";
import { CAPTIONS } from "./narration.mjs";

export const TOTAL_FRAMES = 900; // 30.0 s @ 30 fps

export const SCENES = [
  { id: "S1 hook", f0: 0, f1: 90 },
  { id: "S2 problem", f0: 90, f1: 210 },
  { id: "S3 arrival", f0: 210, f1: 300 },
  { id: "S4 discover", f0: 300, f1: 450 },
  { id: "S5 brief", f0: 450, f1: 570 },
  { id: "S6 conversations", f0: 570, f1: 690 },
  { id: "S7 campaign", f0: 690, f1: 795 },
  { id: "S8 cta", f0: 795, f1: 900 },
];

// Key action frames (K)
export const K = {
  // S1
  crouch: 9, launch: 17, catch: 24, land: 33, stampFall: 47, stampHit: 56,
  // S2
  zoomOut: 90, islands: [94, 99, 104], foldStart: 94, foldEnd: 104, windUp: 105, release: 113,
  gust: 123, crash: 138, bubbles: [145, 151, 157, 163, 169, 175], tangleStart: 148, tangleFull: 200,
  // S3
  phoneShadow: 196, phoneFall: 207, phoneLand: 225, screenOn: 229, logoDraw: [232, 250], wordWerbens: 242,
  ribbonOut: 250, snip: 262, retract: [266, 288], shakeOff: [264, 278],
  // S4
  walk: [287, 303], tap: 306, lasso: [312, 324, 336], camPush: [372, 392], hover: [395, 400, 405], tapCard: 410,
  jumpOut: 422, c1Land: 444,
  // S5
  bend: 450, pick: 461, uncrumple: [470, 480], fold: [480, 487], bridge: [482, 493], windUp2: 487, throw2: 491,
  ride: [491, 513], catch2: 513, unfold: [518, 528], bulb: 530, thumbs: 540, toss: [548, 562],
  // S6
  chat: [
    { f: 578, who: "B", text: "Brief sent!" },
    { f: 598, who: "C", text: "Love it!" },
    { f: 618, who: "B", text: "Draft Friday?" },
    { f: 638, who: "C", icon: "check", text: "Deal" },
    { f: 656, who: "B", icon: "thumb" },
    { f: 672, who: "C", icon: "heart" },
  ],
  chatFly: 14,
  // S7
  boardIn: 690, checks: [694, 717, 731], camOut: [742, 758], pops: [748, 754], confetti: 760, cheer: 762,
  // S8
  spiral: [784, 808], iconIn: 808, wordmark: 817, tagline: 826, pill: 831, shine: 862,
};

export const sec = (f) => f / FPS;

/** Load narration manifest (measured durations) and derive caption frame timings. */
export function loadNarration(root = process.cwd()) {
  const m = JSON.parse(fs.readFileSync(path.join(root, "build/narration/manifest.json"), "utf8"));
  const byId = Object.fromEntries(m.lines.map((l) => [l.id, l]));
  // measured internal pause of L2 ("...scattered." | "and the chats?") from waveform analysis
  const L2split = 1.74;
  const caps = [];
  for (const c of CAPTIONS) {
    const L = byId[c.from ?? c.id];
    let t0 = L.start, t1 = L.end;
    if (c.id === "L2a") t1 = L.start + 1.33;
    if (c.id === "L2b") t0 = L.start + L2split;
    caps.push({ ...c, t0, t1 });
  }
  // display windows: in a little before speech, out before next caption (or ~0.9 s after speech)
  const out = caps.map((c, i) => {
    const next = caps[i + 1];
    const f0 = Math.round((c.t0 - 0.12) * FPS);
    let f1 = Math.round((c.t1 + 0.9) * FPS);
    if (next) f1 = Math.min(f1, Math.round((next.t0 - 0.2) * FPS));
    if (c.id === "L7") f1 = Math.min(f1, K.spiral[0] + 4);
    // words spread over the spoken span proportional to characters
    const words = c.lines.join(" ").split(" ");
    const chars = words.map((w) => w.length + 1);
    const tot = chars.reduce((a, b) => a + b, 0);
    const span = Math.max(0.5, (c.t1 - c.t0) * 0.85) * FPS;
    let acc = 0;
    const wordFrames = words.map((w, k) => {
      const wf = Math.round(c.t0 * FPS + (acc / tot) * span);
      acc += chars[k];
      return wf;
    });
    return { ...c, f0, f1, wordFrames };
  });
  return { manifest: m, captions: out };
}

// ---- Sound effect cue sheet (frames). type -> synth in audio.mjs. pan: -1..1 ----
export const SFX = [
  // S1
  { f: 0, type: "flutter", dur: 0.75, gain: 0.5 },
  { f: K.launch - 1, type: "whoosh", dur: 0.28, f0: 300, f1: 1800, gain: 0.45 },
  { f: K.catch, type: "snap", gain: 0.75 },
  { f: K.land, type: "thump", gain: 0.6 },
  { f: K.stampFall, type: "whoosh", dur: 0.3, f0: 2200, f1: 500, gain: 0.35 },
  { f: K.stampHit, type: "stamp", gain: 0.9 },
  { f: K.stampHit + 6, type: "sparkle", gain: 0.35 },
  // S2
  { f: K.zoomOut, type: "whoosh", dur: 0.6, f0: 200, f1: 900, gain: 0.35 },
  ...K.islands.map((f, i) => ({ f, type: "pop", freq: 520 + i * 140, gain: 0.55, pan: [-0.3, 0.5, 0.45][i] })),
  { f: K.foldStart, type: "rustle", dur: 0.33, gain: 0.45 },
  { f: K.windUp, type: "whoosh", dur: 0.22, f0: 900, f1: 300, gain: 0.25 },
  { f: K.release, type: "whoosh", dur: 0.35, f0: 400, f1: 2600, gain: 0.6 },
  { f: K.release + 2, type: "glide", dur: 0.7, gain: 0.25, pan: 0.3 },
  { f: K.gust, type: "wind", dur: 0.55, gain: 0.45, pan: 0.4 },
  { f: K.crash, type: "crumple", gain: 0.85 },
  { f: K.crash, type: "thump", gain: 0.4 },
  ...K.bubbles.map((f, i) => ({ f, type: "pop", freq: 700 + ((i * 173) % 400), gain: 0.4, pan: [-0.3, 0.5, 0.45][i % 3] })),
  { f: K.tangleStart, type: "scribble", dur: 1.7, gain: 0.32 },
  // S3
  { f: K.phoneFall - 4, type: "fallWhistle", dur: (K.phoneLand - K.phoneFall + 4) / FPS, gain: 0.4 },
  { f: K.phoneLand, type: "impact", gain: 1.0 },
  { f: K.phoneLand + 3, type: "tick", freq: 900, gain: 0.3 },
  { f: K.screenOn, type: "blip", gain: 0.4 },
  { f: K.wordWerbens, type: "chime", gain: 0.55 },
  { f: K.ribbonOut, type: "whoosh", dur: 0.45, f0: 300, f1: 2400, gain: 0.5 },
  { f: K.snip, type: "snip", gain: 0.8 },
  { f: K.snip + 1, type: "whoosh", dur: 0.5, f0: 1500, f1: 300, gain: 0.35 },
  { f: K.retract[0], type: "whoosh", dur: 0.6, f0: 2000, f1: 400, gain: 0.25 },
  { f: K.shakeOff[0] + 2, type: "rattle", gain: 0.35 },
  // S4
  { f: 291, type: "step", gain: 0.3 }, { f: 297, type: "step", gain: 0.3 }, { f: 303, type: "step", gain: 0.3 },
  { f: K.tap, type: "tap", gain: 0.6 },
  ...K.lasso.map((f, i) => ({ f, type: "whoosh", dur: 0.33, f0: 500, f1: 2800, gain: 0.45, pan: [-0.4, 0.5, 0.45][i] })),
  ...K.lasso.map((f, i) => ({ f: f + 10, type: "pop", freq: 640, gain: 0.45, pan: [-0.4, 0.5, 0.45][i] })),
  ...K.lasso.map((f, i) => ({ f: f + 30, type: "dock", freq: [784, 880, 988][i], gain: 0.55 })),
  { f: 368, type: "tick", freq: 1200, gain: 0.25 }, { f: 372, type: "tick", freq: 1300, gain: 0.25 }, { f: 376, type: "tick", freq: 1400, gain: 0.25 },
  { f: K.camPush[0], type: "whoosh", dur: 0.6, f0: 200, f1: 700, gain: 0.25 },
  ...K.hover.map((f) => ({ f, type: "tick", freq: 1500, gain: 0.2 })),
  { f: K.tapCard, type: "tap", gain: 0.6 },
  { f: K.tapCard + 1, type: "dock", freq: 1175, gain: 0.45 },
  { f: K.jumpOut, type: "boing", gain: 0.6, pan: 0.3 },
  { f: K.c1Land, type: "thump", gain: 0.55, pan: 0.5 },
  // S5
  { f: K.pick, type: "rustle", dur: 0.2, gain: 0.35 },
  { f: K.uncrumple[0], type: "crinkle", dur: 0.33, gain: 0.55 },
  { f: K.fold[0], type: "rustle", dur: 0.25, gain: 0.45 },
  { f: K.bridge[0], type: "whoosh", dur: 0.4, f0: 400, f1: 2000, gain: 0.4 },
  { f: K.throw2, type: "whoosh", dur: 0.3, f0: 500, f1: 2600, gain: 0.55 },
  { f: K.throw2 + 2, type: "glide", dur: 0.7, gain: 0.3, pan: 0.2 },
  { f: K.catch2, type: "snap", gain: 0.7, pan: 0.5 },
  { f: K.unfold[0], type: "rustle", dur: 0.3, gain: 0.4, pan: 0.5 },
  { f: K.bulb, type: "ding", gain: 0.6, pan: 0.5 },
  { f: K.thumbs, type: "pop", freq: 880, gain: 0.4, pan: 0.5 },
  { f: K.toss[0], type: "whoosh", dur: 0.35, f0: 600, f1: 1800, gain: 0.35 },
  { f: K.toss[1], type: "dock", freq: 1047, gain: 0.5 },
  // S6
  ...K.chat.map((c) => ({ f: c.f, type: "pop", freq: c.who === "B" ? 980 : 740, gain: 0.5, pan: c.who === "B" ? -0.35 : 0.35 })),
  ...K.chat.map((c) => ({ f: c.f + 14, type: "dock", freq: c.who === "B" ? 1319 : 1175, gain: 0.35 })),
  // S7
  { f: K.boardIn, type: "whoosh", dur: 0.45, f0: 200, f1: 900, gain: 0.3 },
  ...K.checks.map((f, i) => ({ f, type: "check", freq: [1047, 1319, 1568][i], gain: 0.55 })),
  { f: K.camOut[0], type: "whoosh", dur: 0.5, f0: 900, f1: 250, gain: 0.25 },
  ...K.pops.map((f, i) => ({ f, type: "boing", gain: 0.35, pan: i ? 0.3 : -0.2 })),
  { f: K.confetti, type: "confetti", gain: 0.7 },
  // S8
  { f: K.spiral[0], type: "whoosh", dur: 0.85, f0: 150, f1: 3000, gain: 0.7 },
  { f: K.iconIn, type: "impact", gain: 0.55 },
  { f: K.iconIn + 1, type: "chime", gain: 0.6 },
  { f: K.wordmark, type: "whoosh", dur: 0.3, f0: 600, f1: 2200, gain: 0.25 },
  { f: K.pill, type: "dock", freq: 1319, gain: 0.5 },
  { f: K.shine, type: "sparkle", gain: 0.35 },
];
