// Episode timeline (seconds), synced to measured Hindi narration onsets (build/vo/vo.json).
// VO starts: h1 0.18, h2 4.64, h3 9.50, h4 12.35, h5 15.36, h6 19.85, h7 25.90 (src/narration.json).
export const T = {
  // S1 hook: décor saving vs +50 guests (h1; "पर पचास और मेहमान बुलाए?" at +2.34)
  decor: 0.0, box: 0.45, coin: 1.1, coinIn: 1.55, guests: 2.52, plus50: 3.15,
  // S2 per-guest unit (h2; "प्रति मेहमान" +1.22, "खाना एक हज़ार" +2.28, "कुर्सी-मेज़" +3.17)
  crane1: 4.3, fold1: 4.35, unit: 4.8, plate: 6.92, chair: 7.81, sum: 8.55,
  // S3 100 guests (h3; total at +1.13)
  fold2: 9.12, grid: 9.52, rowGap: 0.07, total100: 10.63,
  // S4 150 guests (h4; total at +1.29)
  grid50: 12.4, total150: 13.64,
  // S5 compare with the décor saving (h5; "सजावट की बचत का बारह गुना" +2.09)
  crane2: 15.15, fold3: 15.2, scale: 15.35, left: 15.75, right: 16.2, twelve: 17.45, coinGap: 0.1,
  // S6 guest-list decision (h6; "सूची को ज़रूरी" +1.9, "शायद में बाँटकर" +3.67, "संख्या पक्की" +4.94)
  crane3: 19.6, fold4: 19.65, sheet: 19.85, must: 21.7, maybe: 23.5, count: 24.8, unlock: 25.25,
  // S7 CTA end card (h7 25.90-29.84)
  fold5: 25.55, card: 25.7, title: 26.3, sub: 26.6, banner: 26.85, perch: 27.8,
};
export const BPM = 96;

export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: Math.floor(t * 12 + 1e-6) / 12, type, gain, p });
  add(T.decor + 0.05, 'pop', 0.6, 1.1); add(T.box, 'pop', 0.5, 0.9);
  add(T.coin, 'coin', 0.5, 1.1); add(T.coinIn, 'crease', 0.4, 1.2);
  for (let i = 0; i < 5; i++) add(T.guests + i * 0.1, 'pop', 0.35, 1.4 + i * 0.06);
  add(T.plus50, 'heart', 0.45, 0.9);
  add(T.crane1 + 0.05, 'swoosh', 0.55, 1); add(T.crane1 + 0.15, 'flap', 0.4, 0.9);
  for (let i = 0; i < 3; i++) add(T.fold1 + i * 0.08, 'crease', 0.35, 1.1);
  add(T.unit, 'pop', 0.6, 1.0);
  add(T.plate, 'stamp', 0.55, 1.1); add(T.chair, 'stamp', 0.55, 1.25); add(T.sum, 'chime', 0.4, 1.12);
  add(T.fold2, 'crease', 0.4, 1.0);
  for (let i = 0; i < 10; i++) add(T.grid + i * T.rowGap, 'tick', 0.22, 1 + i * 0.03);
  add(T.total100, 'snap', 0.55, 1.0);
  for (let i = 0; i < 5; i++) add(T.grid50 + i * T.rowGap, 'tick', 0.28, 1.35 + i * 0.04);
  add(T.total150, 'snap', 0.6, 0.85);
  add(T.crane2 + 0.05, 'swoosh', 0.5, 1.1);
  for (let i = 0; i < 3; i++) add(T.fold3 + i * 0.08, 'crease', 0.35, 1.1);
  add(T.scale, 'pop', 0.6, 0.8);
  add(T.left, 'coin', 0.45, 1.0); add(T.left + 0.1, 'creak', 0.35, 1);
  add(T.right, 'crease', 0.4, 1.2);
  for (let i = 0; i < 12; i++) add(T.twelve + i * T.coinGap, 'coin', 0.28, 0.95 + i * 0.03);
  add(T.twelve + 12 * T.coinGap + 0.05, 'creak', 0.45, 0.9);
  add(T.crane3 + 0.05, 'swoosh', 0.5, 1.0);
  for (let i = 0; i < 3; i++) add(T.fold4 + i * 0.08, 'crease', 0.35, 1.1);
  add(T.sheet, 'slide', 0.5, 1);
  for (let i = 0; i < 3; i++) { add(T.must + i * 0.15, 'crease', 0.35, 1.2 + i * 0.05); add(T.maybe + i * 0.15, 'crease', 0.35, 1.0 + i * 0.05); }
  add(T.count, 'stamp', 0.6, 1); add(T.unlock, 'chime', 0.4, 1.26);
  for (let i = 0; i < 3; i++) add(T.fold5 + i * 0.07, 'crease', 0.3, 1.1);
  add(T.card + 0.05, 'slide', 0.45, 0.9); add(T.card + 0.42, 'snap', 0.55, 0.9);
  add(T.title, 'crease', 0.35, 1); add(T.banner, 'pop', 0.5, 1.2); add(T.banner + 0.3, 'chime', 0.35, 1.0);
  add(T.perch, 'flap', 0.35, 1.3);
  return c.sort((a, b) => a.t - b.t);
}
