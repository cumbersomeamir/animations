// Single source of timing for the scene (browser) and the audio mixer (Node). Times in seconds.
// Narration word times live in src/words.json (Kokoro → Whisper alignment); beats below are hung on those words.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900

// Storyboard sections (brief): hook 0–3 · setup 3–8 · mechanism 8–23 · takeaway 23–29 · end 29–30
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3 }, { id: "setup", t0: 3, t1: 8 }, { id: "mechanism", t0: 8, t1: 23 },
  { id: "takeaway", t0: 23, t1: 29 }, { id: "end", t0: 29, t1: 30 },
];

export const T = {
  dragEnd: 1.22, headFill: 1.25,
  whipBenefit: [2.95, 3.2], clickBenefit: 3.35, quest: [3.6, 4.95],
  clickProduct: 5.45, productPop: [5.45, 5.85], fictional: 5.85,
  grabFeature: 8.11,
  wipe: [9.78, 10.16], stick: [10.4, 10.6], notebook: 10.55, dry: 10.85,
  rainAll: [11.45, 13.6], walk: [11.9, 21.0],
  whipBenefit2: [12.8, 13.0], benefitFill: 13.05, whipBack: [13.45, 13.75],
  situation: 15.62, selectHead: 16.25, link: [16.3, 16.85], headWords: [16.95, 17.15, 17.35, 17.5, 17.62, 17.76, 17.95], outcome: 18.1,
  supportDrag: [18.55, 19.15], supportDrop: 19.2, supportCheck: 19.25,
  badgeClick: 19.75, typeOver: [19.9, 20.75], bang: 21.0, stomps: [21.45, 21.85], strike: [22.25, 22.5],
  erase: [23.0, 23.35], typeHonest: [23.45, 24.3], spotlight: [24.45, 26.1], noOverclaim: 25.0,
  pullBack: [26.0, 26.75], allDone: 26.6, cheer: 28.26, sleep: 28.9, dim: [29.1, 30.0],
};
export const OVERCLAIM = "100% waterproof!";
export const HONEST = "Water-resistant · not waterproof";
export const BENEFIT_WORDS = ["Your", "notebook", "stays", "dry", "on", "drizzly", "commutes."];

// Camera: focus rectangles in world px [x, y, w, h], mapped into the caption-free safe band (x 80–1000, y 510–1470).
const WIN = [60, 500, 960, 960];
export const CAM = [ // every rect includes ~150 px headroom above anchor edges for the mascot + carried chip/props
  [0.0, [380, 530, 640, 480]], [1.3, [80, 530, 620, 480]], [2.95, [80, 530, 620, 480]],
  [3.2, [560, 760, 480, 380]], [5.0, [560, 760, 480, 380]], [5.4, WIN], [7.15, WIN],
  [7.65, [80, 490, 500, 520]], [9.4, [80, 490, 500, 520]], [9.75, [80, 490, 500, 740]], [10.2, [80, 490, 500, 740]], [10.6, [92, 800, 470, 430]], [12.8, [92, 800, 470, 430]],
  [13.0, [560, 800, 480, 360]], [13.45, [560, 800, 480, 360]], [13.75, [80, 540, 500, 700]], [18.15, [80, 540, 500, 700]],
  [18.55, WIN], [19.6, WIN], [20.05, [90, 680, 470, 420]], [24.4, [90, 680, 470, 420]],
  [24.85, [100, 740, 380, 170]], [26.0, [100, 740, 380, 170]], [26.75, WIN], [30, WIN],
];

// Cursor (the user): world positions with click times. Never teleports; spring-eased between keys.
export const CURSOR = [
  [0.0, [930, 860]], [1.22, [470, 735]], [1.6, [540, 760]], [2.95, [560, 770]], [3.3, [820, 985]], [4.9, [900, 1050]],
  [5.38, [850, 712]], [6.2, [760, 760]], [7.4, [600, 760]], [9.6, [600, 780]], [10.0, [600, 1180]], [15.9, [600, 1170]],
  [16.22, [420, 712]], [16.6, [560, 640]], [18.3, [640, 760]], [18.52, [780, 1112]], [19.15, [330, 1258]], [19.4, [300, 1100]],
  [19.72, [200, 852]], [20.0, [430, 900]], [24.4, [440, 905]], [26.2, [600, 1000]], [27.2, [900, 1380]], [30, [905, 1385]],
];
export const CLICKS = [0.0, T.clickBenefit, T.clickProduct, T.selectHead, 18.55, T.supportDrop, T.badgeClick];

// Captions (upper centre): word groups from each narration line [from, to) with an optional line break index.
export const CAPTIONS = [
  { line: "L1", from: 0, to: 8, br: 4 },
  { line: "L2", from: 0, to: 7, br: 4 },
  { line: "L3", from: 0, to: 4 },
  { line: "L4", from: 0, to: 5, br: 2 },
  { line: "L5", from: 0, to: 4 },
  { line: "L5", from: 4, to: 11, br: 8 },
  { line: "L6", from: 0, to: 6 },
  { line: "L6", from: 6, to: 13, br: 9 },
  { line: "L6", from: 13, to: 17 },
  { line: "L7", from: 0, to: 5, br: 3 },
  { line: "L7", from: 5, to: 11, br: 9 },
  { line: "L8", from: 0, to: 6, br: 3 },
];
export const HIGHLIGHT = ["feature", "benefit", "fictional", "situation", "outcome", "support", "waterproof", "waterresistant", "visible"];

// Sound cue sheet (synthesised in audio.mjs); every cue is a visible event.
export const SFX = [
  { t: 0.0, type: "drag", dur: 1.2, gain: 0.18 },
  { t: 1.0, type: "jump8", gain: 0.22 }, { t: T.dragEnd, type: "drop", gain: 0.42 }, { t: 1.38, type: "land8", gain: 0.24 },
  { t: T.whipBenefit[0], type: "swish", dur: 0.3, gain: 0.32 }, { t: 2.98, type: "jump8", gain: 0.22 }, { t: 3.42, type: "land8", gain: 0.22 },
  { t: T.clickBenefit, type: "click", gain: 0.45 }, { t: T.quest[0], type: "blip8", freq: 660, gain: 0.2 },
  { t: 5.0, type: "swish", dur: 0.35, gain: 0.22 }, { t: T.clickProduct, type: "click", gain: 0.45 }, { t: T.productPop[0] + 0.05, type: "pop", gain: 0.36 },
  { t: 5.85, type: "jump8", gain: 0.2 }, { t: 6.3, type: "land8", gain: 0.2 }, { t: 6.35, type: "sparkle", gain: 0.16 },
  { t: 7.3, type: "jump8", gain: 0.2 }, { t: 7.65, type: "land8", gain: 0.2 }, { t: T.grabFeature, type: "pickup8", gain: 0.24 },
  { t: T.wipe[0], type: "wipe", dur: 0.38, gain: 0.3 }, { t: 9.8, type: "jump8", gain: 0.2 }, { t: 10.25, type: "land8", gain: 0.22 },
  { t: 10.0, type: "rain", dur: 11.0, gain: 0.07 }, { t: T.rainAll[0], type: "rain", dur: 2.2, gain: 0.1 },
  { t: T.stick[1], type: "stick", gain: 0.32 }, { t: T.notebook, type: "pop", gain: 0.24 }, { t: T.dry, type: "tick", freq: 1568, gain: 0.26 },
  { t: 11.9, type: "jump8", gain: 0.18 }, { t: 12.25, type: "land8", gain: 0.18 },
  { t: T.whipBenefit2[0], type: "swish", dur: 0.25, gain: 0.28 }, { t: T.benefitFill, type: "chime", gain: 0.32 }, { t: T.whipBack[0], type: "swish", dur: 0.3, gain: 0.26 },
  { t: T.situation, type: "tick", freq: 1319, gain: 0.26 }, { t: T.selectHead, type: "click", gain: 0.4 }, { t: 16.25, type: "keys", text: "⌘A", gain: 0.3 },
  { t: T.link[0], type: "link", dur: 0.55, gain: 0.2 }, { t: 16.6, type: "jump8", gain: 0.2 },
  ...T.headWords.map((t, i) => ({ t, type: "note8", n: i, gain: 0.16 })),
  { t: T.outcome, type: "tick", freq: 1568, gain: 0.24 },
  { t: 18.15, type: "swish", dur: 0.35, gain: 0.2 }, { t: 18.55, type: "click", gain: 0.36 }, { t: T.supportDrag[0], type: "drag", dur: 0.6, gain: 0.16 },
  { t: T.supportDrop, type: "drop", gain: 0.36 }, { t: T.supportCheck, type: "tick", freq: 1760, gain: 0.24 },
  { t: T.badgeClick, type: "click", gain: 0.4 }, { t: T.typeOver[0], type: "typing", dur: 0.85, n: 16, gain: 0.26 },
  { t: 19.78, type: "jump8", gain: 0.2 }, { t: 20.08, type: "land8", gain: 0.24 }, { t: T.bang, type: "alert8", gain: 0.24 },
  ...T.stomps.map((t) => ({ t, type: "stomp8", gain: 0.3 })), { t: T.strike[0], type: "strike", gain: 0.26 },
  { t: T.erase[0], type: "typing", dur: 0.35, n: 6, gain: 0.2 }, { t: T.typeHonest[0], type: "typing", dur: 0.85, n: 18, gain: 0.24 },
  { t: T.noOverclaim, type: "tick", freq: 1976, gain: 0.26 }, { t: T.pullBack[0], type: "swish", dur: 0.6, gain: 0.18 },
  { t: 27.45, type: "jump8", gain: 0.2 }, { t: 27.85, type: "land8", gain: 0.22 }, { t: T.cheer, type: "cheer8", gain: 0.24 },
];
