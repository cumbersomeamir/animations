// cues.js — the single timeline for picture AND score (ES module, imported by reel.js and music/score.mjs).
// 120 BPM: beat = 0.5 s, bar = 2 s. Chapter changes sit on bars, cuts/hits on beats or 16ths.
const B = (n) => +(n * 0.5).toFixed(4);

const CUES = {
  bpm: 120, fps: 30, dur: 15, B,
  // scene starts (s)
  S: { idea: 0, one: 2, image: 4, motion: 10, end: 12 },
  // chapters -> segmented progress bar in the HUD
  CH: [['01 IDEA', 0, 2], ['02 ONE APP', 2, 4], ['03 IMAGE', 4, 10], ['04 MOTION', 10, 12], ['END', 12, 15]],
  // transitions into a scene: [duration, kind]
  TR: { one: [0.5, 'iris'], image: [0.55, 'zoom'], motion: [0.5, 'slats'], end: [0.2, 'cut'] },
  hits: {
    // 01 IDEA
    dot: 0.0, wordOne: -0.12, wordIdea: 0.75, cloudForm: [0.25, 1.5], bulbLit: 1.5, chipInput: 1.25,
    // 02 ONE APP
    apps: [2.25, 2.375, 2.5, 2.625, 2.75], absorb: [2.5, 2.625, 2.75, 2.875, 3.0], slam: 3.0, chipAI: 3.5,
    // 03 IMAGE (lead)
    wordIdea2: 4.5, stream: [4.5, 5.5], arrow: 5.5, wordImage: 6.0,
    scan: [5.5, 6.0, 6.5, 7.0, 7.5, 8.0], done: 8.0, ringIn: 8.5, schematic: 6.5,
    // 04 MOTION
    voice: [10.25, 10.5, 10.75, 11.0], tapes: 10.0,
    // END
    impact: 12.0, name: 12.25, sub: 12.75, cta: 13.0, ctaPulse: [14.0],
  },
  // narration clips (seconds) — files in narration/wav/<id>.wav
  narration: [
    { id: 'v1', t: 0.3 },
    { id: 'v2', t: 2.25 },
    { id: 'v3', t: 4.55 },
    { id: 'v4', t: 10.2 },
    { id: 'v5', t: 12.3 },
  ],
};
export default CUES;
