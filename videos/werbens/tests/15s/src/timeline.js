// Shared timing (imported by the browser scene AND the Node audio mixer) — one source of truth.
// All motion is a pure function of t (seconds), per the threejs-animation skill's deterministic-time rule.
export const FPS = 30;
export const DURATION = 15;
export const FRAMES = FPS * DURATION; // 450

export const SHOTS = [
  { id: "1 discover", t0: 0.0, t1: 2.5 },
  { id: "2 assemble", t0: 2.5, t1: 6.5 },
  { id: "3 one app", t0: 6.5, t1: 10.5 },
  { id: "4 brand", t0: 10.5, t1: 15.0 },
];

// Key action times (seconds). Word anchors measured from narration waveform pauses.
export const T = {
  ignite: [1.25, 1.5, 1.75],          // three creator tiles light up in the tunnel
  creatorDock: [2.8, 3.0, 3.2],       // creators dock around the phone
  campaignPulse: 3.5,                 // "campaigns"
  briefDock: 4.42,                    // "briefs"
  chatDock: [4.86, 5.14],             // "conversations"
  ringLift: [6.5, 7.4],               // pieces lift into orbit
  gridWave: [7.2, 9.2],               // tile field snaps into a grid floor
  rowChecks: [7.05, 7.3, 7.55],       // "All in one app"
  spiralIn: [10.5, 11.25],            // pieces spiral into the screen
  morph: [11.1, 12.0],                // phone spins + morphs into the icon tile
  wordmark: 11.95,                    // "Werbens."
  tagline: 12.25,
  pill: 12.62,                        // "Explore on Google Play"
  shine: 13.6,
};

// Captions: concise, synced to narration lines (in/out seconds).
export const CAPTIONS = [
  { t0: 0.15, t1: 2.45, lines: ["Discover creators"], hi: ["creators"] },
  { t0: 3.0, t1: 6.35, chips: [{ text: "Campaigns", t: 3.45, x: 300, y: 300 }, { text: "Briefs", t: 4.36, x: 760, y: 300 }, { text: "Conversations", t: 4.82, x: 540, y: 430 }] },
  { t0: 6.95, t1: 10.35, lines: ["All in one app"], hi: ["one", "app"] },
];

// Sound cue sheet (seconds) — synthesised in audio.mjs; each cue is caused by a visible action.
export const SFX = [
  { t: 0.0, type: "rush", dur: 2.4, gain: 0.36 },
  ...[0.35, 0.62, 0.86, 1.08, 1.3, 1.52, 1.78, 2.05].map((t, i) => ({ t, type: "passby", gain: 0.28 + (i % 3) * 0.05, pan: i % 2 ? 0.55 : -0.55 })),
  ...T.ignite.map((t, i) => ({ t, type: "ignite", freq: [1175, 1397, 1568][i], gain: 0.45, pan: [-0.3, 0.35, 0] [i] })),
  { t: 2.45, type: "whoosh", dur: 0.7, f0: 300, f1: 1400, gain: 0.35 },
  ...T.creatorDock.map((t, i) => ({ t, type: "dock", freq: [880, 988, 1109][i], gain: 0.5, pan: -0.4 })),
  { t: T.campaignPulse, type: "pulse", gain: 0.7 },
  { t: T.briefDock - 0.35, type: "whoosh", dur: 0.4, f0: 400, f1: 1800, gain: 0.3, pan: 0.4 },
  { t: T.briefDock, type: "dock", freq: 1319, gain: 0.55, pan: 0.4 },
  ...T.chatDock.map((t, i) => ({ t: t - 0.12, type: "pop", freq: [740, 880][i], gain: 0.4, pan: 0.45 })),
  ...T.chatDock.map((t, i) => ({ t, type: "dock", freq: [1480, 1661][i], gain: 0.45, pan: 0.45 })),
  { t: T.ringLift[0], type: "swell", dur: 1.2, gain: 0.45 },
  ...T.rowChecks.map((t, i) => ({ t, type: "tick", freq: [1568, 1760, 2093][i], gain: 0.4 })),
  { t: T.gridWave[0], type: "shimmer", dur: 2.0, gain: 0.3 },
  { t: T.spiralIn[0] - 0.1, type: "whoosh", dur: 0.9, f0: 2000, f1: 200, gain: 0.55 },
  { t: T.morph[0], type: "spin", dur: 0.9, gain: 0.4 },
  { t: T.morph[1], type: "hit", gain: 0.9 },
  { t: T.pill, type: "pop", freq: 1175, gain: 0.45 },
  { t: T.shine, type: "sparkle", gain: 0.3 },
];
