// Single source of timing for the scene (browser) and the audio mixer (Node). Narration word times: src/words.json
// (src/words.mjs Whisper base.en + WORD_FIX pins in narration.js). Beats sit on the measured English word onsets (context/40).
// Story structure (context/27 incl. §5 first frame, §6 caption band): frame 0 = a miniature living room half-unfolded from flat
// cut-out products on a store floor + "WHY ROOMS / COME FIRST?" · hook 0–3.0 · super hook 3.0–5.85 · build 5.85–9.7 ·
// proof 9.7–21.5 · payoff 21.5–26.2 · CTA 26.2–30. Camera grammar for this episode: a follow-cam that walks the store path
// (pop-up rooms on either side), a turn-back to the shelves, and a high overview of the whole path for the payoff.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3.0 }, { id: "super", t0: 3.0, t1: 5.85 }, { id: "build", t0: 5.85, t1: 9.7 }, { id: "proof", t0: 9.7, t1: 21.5 },
  { id: "payoff", t0: 21.5, t1: 26.2 }, { id: "cta", t0: 26.2, t1: 30 },
];
export const T = {
  // frame 0: room A (living) is half-unfolded from flat pieces (walls mostly up, rug unrolling, the rest still flat); it finishes
  // during the hook; its lamp lights on "rooms"
  headline: [0, 0.42], unfoldA: [-1.0, 2.3], lampA: 1.59,
  // super hook: crane up and back over the entrance; a shopper pawn appears on "store guide"; the path arrows light from the
  // entrance into the showroom on "start with the showroom" (SHOWROOM FIRST)
  crane: [3.0, 4.3], pawnIn: 3.41, pathLight: [4.32, 5.5], showLab: [4.32, 5.75],
  // build: follow-cam walks the path; room B (bedroom) pops up on "Whole rooms", room C (dining) on "in action"; flat packs
  // slide onto the racks on "Flat packs" at the end of the path
  walk: [5.6, 9.4], unfoldB: [6.0, 6.9], unfoldC: [6.75, 7.65], racks: [7.89, 8.7],
  // proof 1: a lone sofa on a plinth under a cold spot ("Alone"); a dimension bar grows on "size"; a plain tag pops on "price";
  // room D unfolds around it on "In a room"; its lamp and window light on "evening" (YOUR EVENING)
  alone: 9.73, size: 11.14, price: 11.77, unfoldD: [12.53, 13.45], evening: 13.58, eveLab: [13.26, 14.4],
  // proof 2: a dotted thought arc from the shopper; an imagined (ghost) shopper appears on the sofa on "picturing yourself" and
  // reaches for the cup on "using"; the real shopper steps toward the room on "want" (PICTURE IT)
  think: [15.15, 15.6], ghost: [15.41, 16.0], using: 16.36, pictureLab: [15.41, 17.9], want: [18.24, 18.75],
  // proof 3: turn back to the shelves; a flat pack slides onto the shopper's cart on "shelves"; a small ghost of the finished
  // room rises above it on "finishing a room" (FINISH THE ROOM)
  shelves: [18.85, 19.6], packOn: 19.63, ghostRoom: [20.17, 20.8], finishLab: [20.1, 21.35],
  // payoff: crane up to the whole path; on "Don't just show the product" every room's context folds flat and only the products
  // stand; on "Show the life around it" walls, rugs, lamps and people pop back in every room (SHOW THE LIFE)
  payCrane: [21.3, 22.35], foldAll: [21.63, 22.45], popAll: [23.13, 24.2], lifeLab: [23.13, 25.0],
  // CTA: the stage sinks; app.werbens.com logo tile pops up; wordmark on "Werbens"
  ctaClear: [26.25, 26.6], tile: [26.38, 26.74], lockup: 27.55,
};
// caption groups: word index ranges into each line (br = index of the first word of line 2); the first group waits for the headline
export const CAPTIONS = [
  { line: "L1", from: 0, to: 8, br: 4, t0: 0.42 },
  { line: "L2", from: 0, to: 8, br: 4 },
  { line: "L3", from: 0, to: 5, br: 2 }, { line: "L3", from: 5, to: 9 },
  { line: "L4", from: 0, to: 9, br: 5 }, { line: "L4", from: 9, to: 15, br: 12 },
  { line: "L5", from: 0, to: 7, br: 3 }, { line: "L5", from: 7, to: 13, br: 10 },
  { line: "L6", from: 0, to: 7, br: 3 },
  { line: "L7", from: 0, to: 5, br: 2 }, { line: "L7", from: 5, to: 10, br: 8 },
  { line: "L8", from: 0, to: 7, br: 2 },
];
export const HIGHLIGHT = ["ikea", "rooms", "showroom", "flat", "packs", "sofa", "room", "evening", "picturing", "yourself", "want", "shelves", "finishing", "product", "life", "werbens"];

// event-linked foley (synthesised in audio.mjs); kept off word onsets where possible
export const SFX = [
  // room A finishes unfolding in the hook
  { t: 0.25, type: "flap", gain: 0.05, pan: -0.2 }, { t: 0.7, type: "roll", dur: 0.4, gain: 0.04, pan: -0.1 }, { t: 1.05, type: "plop", gain: 0.05 },
  { t: 1.35, type: "clack", gain: 0.04, pan: 0.1 }, { t: T.lampA + 0.03, type: "glow", gain: 0.05 }, { t: 2.05, type: "plop", gain: 0.04, pan: -0.25 },
  // super hook
  { t: T.crane[0], type: "whoosh", dur: 0.9, gain: 0.05 }, { t: T.pawnIn + 0.03, type: "bloop", gain: 0.05 },
  ...Array.from({ length: 7 }, (_, i) => ({ t: T.pathLight[0] + 0.05 + i * 0.16, type: "tick", freq: 1175 + i * 110, gain: 0.028, pan: -0.2 + i * 0.06 })),
  { t: T.showLab[0] + 0.08, type: "tag", gain: 0.05 },
  // build
  { t: T.unfoldB[0] + 0.05, type: "flap", gain: 0.045, pan: 0.3 }, ...[0, 1, 2].map((i) => ({ t: T.unfoldB[0] + 0.35 + i * 0.15, type: "plop", gain: 0.04, pan: 0.3 })),
  { t: T.unfoldC[0] + 0.05, type: "flap", gain: 0.045, pan: -0.3 }, ...[0, 1, 2].map((i) => ({ t: T.unfoldC[0] + 0.35 + i * 0.15, type: "plop", gain: 0.04, pan: -0.3 })),
  { t: T.racks[0], type: "slide", dur: 0.5, gain: 0.05 }, ...[0, 1, 2, 3].map((i) => ({ t: T.racks[0] + 0.25 + i * 0.12, type: "clack", gain: 0.035, pan: (i % 2 ? 0.25 : -0.25) })),
  // proof 1
  { t: T.alone + 0.03, type: "hollow", gain: 0.05 }, { t: T.size + 0.03, type: "zip", dur: 0.3, gain: 0.04 }, { t: T.price + 0.05, type: "flip", gain: 0.05 },
  { t: T.unfoldD[0] + 0.03, type: "flap", gain: 0.05 }, { t: T.unfoldD[0] + 0.25, type: "roll", dur: 0.35, gain: 0.04 },
  ...[0, 1].map((i) => ({ t: T.unfoldD[0] + 0.55 + i * 0.17, type: "plop", gain: 0.045, pan: -0.2 + i * 0.4 })), { t: T.evening + 0.03, type: "glow", gain: 0.06 },
  { t: T.eveLab[0] + 0.06, type: "tag", gain: 0.045 },
  // proof 2
  { t: T.think[0], type: "plink", gain: 0.035 }, { t: T.ghost[0] + 0.03, type: "shimmer", dur: 0.6, gain: 0.05 }, { t: T.pictureLab[0] + 0.15, type: "tag", gain: 0.045 },
  { t: T.using + 0.08, type: "clink", gain: 0.04 }, { t: T.want[0] + 0.05, type: "bloop", gain: 0.045 },
  // proof 3
  { t: T.shelves[0], type: "whoosh", dur: 0.7, gain: 0.045 }, { t: T.packOn + 0.02, type: "slide", dur: 0.35, gain: 0.05 }, { t: T.packOn + 0.3, type: "thud", size: 1, gain: 0.05 },
  { t: T.ghostRoom[0] + 0.03, type: "shimmer", dur: 0.6, gain: 0.045 }, { t: T.finishLab[0] + 0.1, type: "tag", gain: 0.045 },
  // payoff
  { t: T.payCrane[0], type: "whoosh", dur: 0.9, gain: 0.045 }, ...[0, 1, 2].map((i) => ({ t: T.foldAll[0] + 0.12 + i * 0.18, type: "flap", gain: 0.03, pan: -0.3 + i * 0.3 })),
  ...Array.from({ length: 5 }, (_, i) => ({ t: T.popAll[0] + 0.05 + i * 0.14, type: "plop", gain: 0.04, pan: -0.3 + i * 0.15 })), { t: T.popAll[0] + 0.75, type: "chime", gain: 0.045 },
  { t: T.lifeLab[0] + 0.1, type: "tag", gain: 0.045 },
  { t: T.ctaClear[0], type: "slide", dur: 0.35, gain: 0.1 }, { t: T.tile[1], type: "tileLand", gain: 0.5 },
];
