// Episode timeline (seconds), synced to measured Hindi narration onsets (build/vo/vo.json).
// VO: h1 0.18, h2 3.68, h3 9.00, h4 12.37, h5 15.01, h6 19.83, h7 25.64 (src/narration.json).
export const T = {
  // S1 hook (h1; "या एक हज़ार" +0.92, "सस्ता कौन?" +2.39)
  domeA: 0.0, domeB: 0.12, tagA: 0.25, tagB: 1.1, ask: 2.57,
  // S2 cards + minimum plates (h2; "मेहमान दो सौ" ~+1.0, "न्यूनतम दो सौ पचास" +3.19)
  lids: 3.45, cards: 3.7, guests: 4.7, min: 6.87, empty: 7.45,
  // S3 quote 1 add-ons (h3; "लाइव काउंटर" ~+0.4, "स्टाफ़" +1.72, "टैक्स" +2.43)
  addA: [9.4, 10.72, 11.43],
  // S4 quote 2 inclusions (h4; "सब शामिल" +1.47)
  incB: [12.85, 13.25, 13.84],
  // S5 totals as paper towers (h5; "पहला" +0.4, "दूसरा" +3.15)
  crane1: 14.85, fold1: 14.9, towerA: 15.41, blkGap: 0.3, labelA: 16.6, towerB: 18.16, labelB: 18.5,
  // S6 checklist (h6; items ~+1.2 +1.64 +2.81 +3.42 +4.1)
  crane2: 19.62, fold2: 19.67, sheet: 19.87, ticks: [21.02, 21.47, 22.64, 23.25, 23.92], stamp: 24.8,
  // S7 CTA end card (h7 25.64-29.75)
  fold3: 25.4, card: 25.55, title: 26.15, sub: 26.45, banner: 26.7, perch: 27.7,
};
export const BPM = 96;

export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: Math.floor(t * 12 + 1e-6) / 12, type, gain, p });
  add(T.domeA + 0.05, 'pop', 0.6, 0.95); add(T.domeB + 0.05, 'pop', 0.6, 1.05);
  add(T.tagA, 'crease', 0.45, 1.2); add(T.tagB, 'crease', 0.45, 1.3); add(T.ask, 'heart', 0.4, 0.9);
  add(T.lids, 'snap', 0.5, 1.1); add(T.lids + 0.1, 'snap', 0.45, 1.2);
  add(T.cards, 'slide', 0.5, 1); add(T.cards + 0.15, 'crease', 0.4, 1.2);
  for (let i = 0; i < 4; i++) add(T.guests + i * 0.12, 'tick', 0.25, 1 + i * 0.05);
  add(T.min, 'stamp', 0.5, 1.0);
  for (let i = 0; i < 5; i++) add(T.min + 0.08 + i * 0.08, 'tick', 0.3, 1.4 + i * 0.05);
  add(T.empty, 'heart', 0.4, 0.8);
  T.addA.forEach((t, i) => { add(t, 'crease', 0.4, 1.1 + i * 0.05); add(t + 0.12, 'stamp', 0.45, 1.0 + i * 0.08); });
  T.incB.forEach((t, i) => add(t, 'tick', 0.45, 1.1 + i * 0.1));
  add(T.crane1 + 0.05, 'swoosh', 0.5, 1); add(T.crane1 + 0.15, 'flap', 0.35, 0.9);
  for (let i = 0; i < 3; i++) add(T.fold1 + i * 0.08, 'crease', 0.35, 1.1);
  for (let i = 0; i < 4; i++) add(T.towerA + i * T.blkGap, i === 0 ? 'pop' : 'stamp', 0.5, 0.85 + i * 0.08);
  add(T.labelA, 'crease', 0.4, 1.2);
  add(T.towerB, 'pop', 0.55, 0.95); add(T.labelB, 'chime', 0.4, 1.12);
  add(T.crane2 + 0.05, 'swoosh', 0.5, 1.05);
  for (let i = 0; i < 3; i++) add(T.fold2 + i * 0.08, 'crease', 0.35, 1.1);
  add(T.sheet, 'slide', 0.5, 1);
  T.ticks.forEach((t, i) => add(t, 'tick', 0.45, 1 + i * 0.07));
  add(T.stamp, 'stamp', 0.6, 1);
  for (let i = 0; i < 3; i++) add(T.fold3 + i * 0.07, 'crease', 0.3, 1.1);
  add(T.card + 0.05, 'slide', 0.45, 0.9); add(T.card + 0.42, 'snap', 0.55, 0.9);
  add(T.title, 'crease', 0.35, 1); add(T.banner, 'pop', 0.5, 1.2); add(T.banner + 0.3, 'chime', 0.35, 1.0);
  add(T.perch, 'flap', 0.35, 1.3);
  return c.sort((a, b) => a.t - b.t);
}
