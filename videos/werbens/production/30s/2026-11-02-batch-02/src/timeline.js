// Single source of timing for scene (browser) and audio (Node). Narration word times: src/words.json.
export const FPS = 30;
export const DURATION = 30;
export const FRAMES = FPS * DURATION; // 900
export const SECTIONS = [
  { id: "hook", t0: 0, t1: 3 }, { id: "setup", t0: 3, t1: 8 }, { id: "mechanism", t0: 8, t1: 23 },
  { id: "takeaway", t0: 23, t1: 29 }, { id: "end", t0: 29, t1: 30 },
];
export const T = {
  carDrag: [0.5, 1.6], carPulse: [2.95, 3.6], typeA: [4.25, 5.3],
  resize: [7.05, 8.2], stomp: 8.9, shrink: [8.95, 9.35], ring: [9.8, 10.6],
  annWS: 10.6, annPW: 11.58, annMP: 12.55, annOut: [14.3, 14.6], // tags pop just BEFORE each spoken word (foley off word onsets)
  compare: 13.25, split: [13.3, 13.85], loudCar: 14.37, loud1: 14.97, loud2: 15.21, loud3: 15.49, rack: [16.1, 16.4],
  swapPage: [16.55, 16.9], ghost: [17.25, 17.95], ghostBack: [18.2, 18.6], cross: [17.95, 18.6],
  expand: [19.15, 19.7], toolDrag: [19.35, 19.8], trade: 20.1, tick1: 20.7, cust: 22.7, link: [23.0, 23.5], tick2: 23.4,
  headClick: 23.6, typeC: [23.7, 24.9], tag: 25.79, flip: [27.2, 27.5], tick3: 27.95, cheer: 27.92, /* after "choose" ends (27.90): the cheer masked "choose" in the first mix */
  pullBack: [27.9, 28.5], allDone: 28.0, sleep: 28.9, dim: [29.1, 30.0],
};
export const HEAD_A = "Think small.";
export const HEAD_C = "Fewer bits. Fits your pocket.";

const WIN = [60, 500, 960, 960];
export const CAM = [ // focus rects [x,y,w,h] → safe band (x 80–1000, y 510–1470); each keeps ~150 px mascot headroom
  [0.0, WIN], [0.4, WIN], [1.9, [84, 505, 568, 735]], [6.4, [84, 505, 568, 735]],
  [6.9, [84, 640, 568, 500]], [10.3, [84, 640, 568, 500]], [10.7, [80, 600, 580, 820]], [13.1, [80, 600, 580, 820]], [13.5, WIN], [16.5, WIN],
  [16.95, [530, 500, 480, 800]], [18.9, [530, 500, 480, 800]], [19.3, WIN], [23.0, WIN],
  [23.5, [84, 610, 568, 640]], [24.9, [84, 610, 568, 640]], [25.45, [100, 900, 540, 330]], [27.9, [100, 900, 540, 330]],
  [28.5, WIN], [30, WIN],
];
export const CURSOR = [
  [0.0, [880, 790]], [0.5, [830, 724]], [1.6, [292, 830]], [2.4, [340, 930]], [3.6, [360, 960]], [4.15, [420, 1218]], [5.6, [470, 1252]],
  [6.6, [600, 1000]], [7.05, [346, 856]], [8.2, [540, 946]], [8.9, [540, 946]], [9.25, [610, 1010]], [10.4, [640, 1060]],
  [13.1, [958, 572]], [14.0, [960, 660]], [16.4, [562, 626]], [17.25, [300, 900]], [17.95, [770, 920]], [18.4, [600, 930]],
  [19.15, [562, 626]], [19.35, [830, 724]], [19.8, [370, 880]], [20.05, [850, 830]], [22.6, [850, 960]], [23.6, [400, 1130]],
  [24.9, [560, 1250]], [27.15, [300, 1054]], [27.6, [430, 1130]], [28.3, [900, 1380]], [30, [905, 1385]],
];
export const CLICKS = [0.5, 1.6, 4.15, 7.05, 13.25, 16.55, 17.25, 17.95, 19.15, 19.35, 19.8, 20.05, 22.6, 23.6, 27.2];

export const CAPTIONS = [
  { line: "L1", from: 0, to: 7, br: 3 }, { line: "L1", from: 7, to: 12, br: 10 },
  { line: "L2", from: 0, to: 7, br: 3 }, { line: "L2", from: 7, to: 12, br: 10 },
  { line: "L3", from: 0, to: 8, br: 4 }, { line: "L3", from: 8, to: 17, br: 13 },
  { line: "L4", from: 0, to: 8, br: 4 },
  { line: "L5", from: 0, to: 7, br: 4 }, { line: "L5", from: 7, to: 16, br: 11 },
  { line: "L6", from: 0, to: 8, br: 4 },
];
export const HIGHLIGHT = ["tiny", "small", "smallness", "modest", "flashier", "copy", "tradeoff", "right", "limitation", "reason"];

export const SFX = [
  { t: 0.0, type: "jump8", gain: 0.2 }, { t: 0.38, type: "land8", gain: 0.22 },
  { t: 0.5, type: "click", gain: 0.4 }, { t: 0.55, type: "drag", dur: 1.05, gain: 0.16 }, { t: 1.6, type: "drop", gain: 0.38 },
  { t: 2.85, type: "jump8", gain: 0.18 }, { t: 3.2, type: "land8", gain: 0.2 }, { t: 2.97, type: "blip8", freq: 1046, gain: 0.16 },
  { t: 4.15, type: "click", gain: 0.36 }, { t: T.typeA[0], type: "typing", dur: 1.05, n: 12, gain: 0.24 },
  { t: 7.05, type: "click", gain: 0.36 }, { t: 7.1, type: "grow", dur: 1.1, gain: 0.26 },
  { t: T.stomp, type: "stomp8", gain: 0.3 }, { t: T.shrink[0], type: "shrink", gain: 0.3 }, { t: 9.8, type: "sparkle", gain: 0.16 }, { t: 9.82, type: "cheer8", gain: 0.18 },
  { t: 10.3, type: "jump8", gain: 0.16 }, { t: 10.6, type: "land8", gain: 0.16 }, { t: T.annWS, type: "tick", freq: 1319, gain: 0.22 },
  { t: 11.35, type: "jump8", gain: 0.14 }, { t: 11.58, type: "land8", gain: 0.14 }, { t: T.annPW, type: "tick", freq: 1568, gain: 0.22 },
  { t: 12.3, type: "jump8", gain: 0.14 }, { t: 12.55, type: "land8", gain: 0.14 }, { t: T.annMP, type: "tick", freq: 1760, gain: 0.22 },
  { t: T.compare, type: "click", gain: 0.38 }, { t: T.split[0], type: "swish", dur: 0.45, gain: 0.26 },
  { t: T.loudCar, type: "pop", gain: 0.3 }, { t: 14.3, type: "jump8", gain: 0.16 }, { t: 14.7, type: "land8", gain: 0.18 },
  { t: T.loud1, type: "burst", gain: 0.34 }, { t: T.loud2, type: "pop", gain: 0.3 }, { t: T.loud3, type: "burst", gain: 0.34 },
  ...[15.55, 15.63, 15.71, 15.79, 15.87].map((t) => ({ t, type: "pop", gain: 0.18 })),
  { t: T.rack[0], type: "rack", dur: 0.4, gain: 0.22 }, { t: 16.15, type: "jump8", gain: 0.16 }, { t: 16.5, type: "land8", gain: 0.16 },
  { t: T.swapPage[0], type: "click", gain: 0.34 }, { t: 16.6, type: "swish", dur: 0.3, gain: 0.2 }, { t: 16.75, type: "jump8", gain: 0.16 }, { t: 17.1, type: "land8", gain: 0.18 },
  { t: T.ghost[0], type: "click", gain: 0.34 }, { t: 17.3, type: "drag", dur: 0.62, gain: 0.16 }, { t: T.cross[0], type: "alert8", gain: 0.24 },
  { t: 18.2, type: "stomp8", gain: 0.28 }, { t: 18.24, type: "boing", gain: 0.24 },
  { t: T.expand[0], type: "click", gain: 0.34 }, { t: 19.2, type: "swish", dur: 0.45, gain: 0.22 }, { t: 19.35, type: "click", gain: 0.3 }, { t: 19.4, type: "drag", dur: 0.4, gain: 0.14 },
  { t: 19.8, type: "drop", gain: 0.34 }, { t: 19.9, type: "jump8", gain: 0.16 }, { t: 20.3, type: "land8", gain: 0.18 },
  { t: 20.05, type: "click", gain: 0.3 }, { t: T.trade, type: "pop", gain: 0.3 }, { t: T.tick1, type: "tick", freq: 1568, gain: 0.22 },
  { t: 22.6, type: "click", gain: 0.3 }, { t: T.cust, type: "pop", gain: 0.3 }, { t: T.link[0], type: "link", dur: 0.5, gain: 0.18 }, { t: T.tick2, type: "tick", freq: 1760, gain: 0.22 },
  { t: 23.4, type: "jump8", gain: 0.16 }, { t: 23.7, type: "land8", gain: 0.18 }, { t: T.headClick, type: "click", gain: 0.32 }, { t: T.typeC[0], type: "typing", dur: 1.2, n: 26, gain: 0.24 },
  { t: 25.8, type: "jump8", gain: 0.14 }, { t: T.tag - 0.07, type: "pop", gain: 0.26 }, { t: 26.05, type: "land8", gain: 0.16 },
  { t: 27.2, type: "click", gain: 0.34 }, { t: T.flip[0], type: "flip", gain: 0.3 }, { t: 27.25, type: "jump8", gain: 0.16 }, { t: 27.55, type: "land8", gain: 0.18 },
  { t: T.cheer, type: "cheer8", gain: 0.2 }, { t: T.tick3, type: "tick", freq: 1976, gain: 0.22 }, { t: 27.96, type: "sparkle", gain: 0.16 },
  { t: T.pullBack[0], type: "swish", dur: 0.6, gain: 0.16 }, { t: 28.2, type: "jump8", gain: 0.16 }, { t: 28.6, type: "land8", gain: 0.18 },
];
