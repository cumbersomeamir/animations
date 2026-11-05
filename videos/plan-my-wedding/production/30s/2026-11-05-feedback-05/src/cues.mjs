// Episode timeline (seconds), synced to measured Hindi narration onsets (build/vo/vo.json).
// VO: h1 0.18, h2 5.13, h3 8.47, h4 13.88, h5 17.78, h6 22.40, h7 26.41-29.73 (src/narration.json).
export const T = {
  // S1 hook: open lawn, cloud + paper rain from frame 0 (h1; "और अचानक बारिश" +1.51, "बैकअप प्लान" +3.02)
  cloud: 0.0, rain: 0.12, lawnSet: 0.0, umbrella: 3.2,
  // S2 covered alternate space (h2; "छत वाली जगह" +1.7)
  crane1: 4.9, hall: 5.35, lawnFold: 5.6, chairsGo: 6.85, hallOk: 7.6,
  // S3 power (h3; "योग्य इलेक्ट्रीशियन" ~+1.0, "बोर्ड ढके" +3.04, "तार पानी से दूर" +4.07)
  board: 8.6, sparky: 9.45, cover: 11.51, lift: 12.54,
  // S4 access (h4; "ढका रास्ता" ~+0.5, "फिसलन रोकने वाली चटाई" +1.68)
  boardFold: 13.7, walk: 14.35, mats: 15.56, guest: 16.0,
  // S5 written vendor terms (h5; "टेंट" +0.66, "कैटरर" +1.2, "डेकोर" +2.0, "लिखित में" ~+3.5)
  crane2: 17.55, worldFold: 17.6, sheet: 17.85, rows: [18.44, 18.98, 19.78], signed: 21.3,
  // S6 decision time (h6; "पक्का कीजिए" +0.45, "किस समय" +1.36, "बैकअप प्लान पर" +2.47)
  sheetFold: 22.25, clock: 22.55, hand: 23.76, flip: 24.87,
  // S7 CTA end card (h7 26.41-29.73)
  clockFold: 26.0, card: 26.15, title: 26.75, sub: 27.05, banner: 27.3, perch: 28.2,
};
export const BPM = 96;

export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: Math.floor(t * 12 + 1e-6) / 12, type, gain, p });
  add(0.0, 'slide', 0.5, 0.8);
  for (let i = 0; i < 10; i++) add(T.rain + i * 0.42, 'tick', 0.12, 1.6 + (i % 3) * 0.1);
  add(T.umbrella, 'pop', 0.55, 1.1); add(T.umbrella + 0.1, 'crease', 0.4, 1.3);
  add(T.crane1 + 0.05, 'swoosh', 0.5, 1); add(T.crane1 + 0.15, 'flap', 0.35, 0.9);
  add(T.hall, 'pop', 0.65, 0.85); add(T.lawnFold, 'crease', 0.35, 1.1);
  for (let i = 0; i < 6; i++) add(T.chairsGo + i * 0.08, 'tick', 0.25, 1.1 + i * 0.05);
  add(T.hallOk, 'chime', 0.35, 1.26);
  add(T.board, 'pop', 0.55, 0.95); add(T.sparky, 'pop', 0.5, 1.2);
  add(T.cover, 'crease', 0.5, 1.0); add(T.cover + 0.12, 'snap', 0.45, 1.1);
  add(T.lift, 'creak', 0.4, 1.1); add(T.lift + 0.3, 'chime', 0.35, 1.12);
  add(T.boardFold, 'crease', 0.3, 1.1);
  for (let i = 0; i < 6; i++) add(T.walk + i * 0.08, 'crease', 0.3, 1.0 + i * 0.06);
  for (let i = 0; i < 5; i++) add(T.mats + i * 0.1, 'tick', 0.3, 1.2 + i * 0.05);
  add(T.crane2 + 0.05, 'swoosh', 0.5, 1.05);
  for (let i = 0; i < 3; i++) add(T.worldFold + i * 0.08, 'crease', 0.35, 1.1);
  add(T.sheet, 'slide', 0.5, 1);
  T.rows.forEach((t, i) => add(t, 'tick', 0.45, 1 + i * 0.08));
  add(T.signed, 'stamp', 0.6, 1);
  for (let i = 0; i < 3; i++) add(T.sheetFold + i * 0.07, 'crease', 0.3, 1.1);
  add(T.clock, 'pop', 0.5, 1.0);
  for (let i = 0; i < 4; i++) add(T.hand - 0.4 + i * 0.12, 'tick', 0.3, 1.5);
  add(T.flip, 'snap', 0.55, 1.0); add(T.flip + 0.1, 'chime', 0.35, 1.12);
  for (let i = 0; i < 3; i++) add(T.clockFold + i * 0.07, 'crease', 0.3, 1.1);
  add(T.card + 0.05, 'slide', 0.45, 0.9); add(T.card + 0.42, 'snap', 0.55, 0.9);
  add(T.title, 'crease', 0.35, 1); add(T.banner, 'pop', 0.5, 1.2); add(T.banner + 0.3, 'chime', 0.35, 1.0);
  add(T.perch, 'flap', 0.35, 1.3);
  return c.sort((a, b) => a.t - b.t);
}
