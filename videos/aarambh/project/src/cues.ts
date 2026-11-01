// Audio cue sheet. Exported to ../audio/cues.json by scripts/export-cues.mjs and consumed by audio/mix.py.
import { T } from "./timeline";

export const FPS = 30;

/** Narration line start frames (files: audio/narration/<id>.wav). */
export const NARRATION = [
  { id: "N1", frame: 50 },
  { id: "N2", frame: 135 },
  { id: "N3", frame: 246 },
  { id: "N4", frame: 385 },
  { id: "N5", frame: 515 },
  { id: "N6", frame: 700 },
  { id: "N7", frame: 815 },
];

/** [frame, sfx name, gain, duration frames (for sustained sounds)] */
export type Cue = [number, string, number, number?];

export const SFX: Cue[] = [
  ...T.stitchPeaks.map((f): Cue => [f - 2, "stitch", 0.8]),
  [28, "strain", 0.55, 12],
  [T.snap, "snap", 1.0],
  [T.stoolLand, "thud", 0.7],
  ...T.slipLand.map((f): Cue => [f, "plop", 0.6]),
  [T.clockDroop - 2, "droop", 0.55],
  ...T.thoughtDots.map((f, i): Cue => [f, `bubble${i}`, 0.45]),
  [T.bubble, "pop", 0.6],
  [T.sketchStart, "scribble", 0.4, T.sketchEnd - T.sketchStart],
  [T.cardPop, "pop_big", 0.75],
  [T.cardPop + 3, "paper", 0.5],
  [T.nodes[0], "ding0", 0.55],
  [T.roomOut, "whoosh", 0.7],
  [T.lensIn + 2, "swish", 0.5],
  [266, "tick", 0.35],
  [272, "tick", 0.35],
  [278, "tick", 0.35],
  [264, "whoosh_small", 0.35],
  [T.stamp, "stamp", 1.0],
  [T.nodes[1], "ding1", 0.55],
  [T.deskOut, "whoosh", 0.65],
  [T.pick, "tick", 0.6],
  [T.pick + 8, "bubble1", 0.5],
  [T.tap, "tap", 0.9],
  [T.tap + 2, "shimmer", 0.55],
  [T.nodes[2], "ding2", 0.55],
  [T.fundOut, "whoosh", 0.6],
  [T.machineHop - 2, "sparkle", 0.45],
  [T.machineHop, "boing", 0.45],
  [T.boxLand, "boxthud", 0.9],
  [T.boxLand + 4, "flap", 0.5],
  [T.boxLand + 10, "flap", 0.5],
  [500, "tape", 0.55],
  [498, "freewheel", 0.35, 16],
  [T.bikeStop - 8, "brake", 0.35],
  [T.bikeStop + 2, "whoosh_small", 0.35],
  [T.boxOnBike, "thump", 0.65],
  [T.rideStart + 6, "freewheel", 0.4, T.rideEnd - T.rideStart - 14],
  [556, "bell", 0.75],
  [T.rideEnd - 14, "brake", 0.5],
  [T.boxDrop - 16, "whoosh_small", 0.45],
  [T.boxDrop, "boxthud", 0.8],
  [T.nodes[3] + 1, "ding3", 0.55],
  [T.boxOpen - 3, "tape_rip", 0.55],
  [T.boxOpen, "pop_big", 0.7],
  [T.boxOpen + 2, "shimmer", 0.55],
  [T.iris, "whoosh", 0.55],
  [692, "machine", 0.5, 92],
  ...T.kurta.map((f): Cue => [f - 16, "whoosh_small", 0.45]),
  ...T.kurta.map((f): Cue => [f, "pop", 0.55]),
  [T.nodes[4], "ding4", 0.65],
  [782, "zip", 0.55],
  [T.curtain, "stitchrun", 0.5, 24],
  [T.endIcon, "chime", 0.75],
  [826, "sparkle", 0.45],
  [T.cta, "pop", 0.55],
];

/** Music sections (frames) for the score generator. */
export const MUSIC = {
  bpm: 100,
  offsetFrames: 4, // beat grid aligned to the first stitch
  sections: [
    { name: "stitchPulse", from: 0, to: T.snap },
    { name: "silence", from: T.snap, to: 62 },
    { name: "drone", from: 62, to: 225 },
    { name: "build", from: 225, to: 360 },
    { name: "fund", from: 360, to: 480 },
    { name: "ride", from: 480, to: 690 },
    { name: "impact", from: 690, to: 792 },
    { name: "resolve", from: 792, to: 900 },
  ],
};
