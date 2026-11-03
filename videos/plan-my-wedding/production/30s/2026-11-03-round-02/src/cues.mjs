// Episode timeline (seconds), synced to measured narration onsets (build/vo/vo.json).
// Picture uses these on the 12 fps step grid; audio uses the same quantized times.
export const T = {
  // S1 hook (n1 0.25-2.26)
  hallA: 0.0, hallB: 0.12, tagA: 0.4, tagB: 0.55, cheaper: 0.75, hidden: 1.45,
  // S2 two quotes (n2 2.55-6.15; "four thousand" +1.48)
  fold1: 2.3, crane1: 2.32, scale: 2.5, signs: 2.95, illus: 3.1, priceA: 4.03, priceB: 5.0, tiltUp: 5.25,
  // S3 guests (n3 6.42-9.56; "not your hundred and twenty" +1.83)
  guests: 6.6, guestsExtra: 8.27, plus40: 8.7, guestsFold: 9.55,
  // S4 add-ons (n4 9.82-14.25; items at +0.06 +0.53 +1.55 +2.29 +2.98)
  blk: [9.88, 10.35, 11.37, 12.11, 12.8],
  // S5 B inclusions (n5 14.5-16.2)
  bList: 14.6, cork: 15.6,
  // S6 totals (n6 16.45-20.15; "ten thousand one hundred" +0.79, "eight thousand eight hundred" +2.75)
  totA: 17.24, totB: 19.2, badge: 19.6,
  // S7 takeaway (n7 20.42-26.19; "so get written" +1.06, "compare identical" +2.16, "before paying" ~+5.0)
  fold2: 20.3, crane2: 20.3, sheet: 20.55, written: 21.48, rows: 21.62, ticks: 22.62, tickGap: 0.36, deposit: 25.45,
  // S8 CTA (n8 26.75-29.29)
  fold3: 26.15, card: 26.35, title: 26.95, sub: 27.25, banner: 27.45, perch: 28.3,
};
export const BPM = 96;

export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: Math.floor(t * 12 + 1e-6) / 12, type, gain, p });
  add(T.hallA + 0.05, 'pop', 0.7, 0.9); add(T.hallB + 0.05, 'pop', 0.7, 1.0);
  add(T.tagA, 'crease', 0.5, 1.2); add(T.tagB, 'crease', 0.5, 1.3);
  add(T.cheaper, 'chime', 0.35, 1.5);
  add(T.hidden, 'crease', 0.7, 0.9); add(T.hidden + 0.15, 'snap', 0.5, 1);
  for (let i = 0; i < 3; i++) add(T.fold1 + i * 0.08, 'crease', 0.4, 1.1 - i * 0.05);
  add(T.crane1 + 0.05, 'swoosh', 0.6, 1); add(T.crane1 + 0.15, 'flap', 0.45, 0.9);
  add(T.scale, 'pop', 0.7, 0.8); add(T.scale + 0.25, 'snap', 0.5, 1.1);
  add(T.signs, 'crease', 0.5, 1.2); add(T.signs + 0.1, 'crease', 0.5, 1.3);
  add(T.priceA, 'stamp', 0.6, 1); add(T.priceB, 'stamp', 0.6, 1.1);
  add(T.tiltUp, 'creak', 0.45, 1);
  for (let i = 0; i < 8; i++) add(T.guests + i * 0.08, 'pop', 0.22, 1.2 + i * 0.03);
  for (let i = 0; i < 4; i++) add(T.guestsExtra + i * 0.08, 'pop', 0.3, 1.6 + i * 0.05);
  add(T.plus40, 'heart', 0.5, 1);
  add(T.guestsFold, 'crease', 0.4, 1.1);
  T.blk.forEach((t, i) => { add(t, 'stamp', 0.65, 0.9 + i * 0.05); add(t + 0.08, 'creak', 0.3, 1 + i * 0.04); });
  add(T.bList + 0.15, 'stamp', 0.5, 1.2); add(T.bList + 0.3, 'crease', 0.4, 1.3);
  add(T.cork + 0.15, 'stamp', 0.4, 1.3);
  add(T.totA, 'snap', 0.6, 0.9); add(T.totA + 0.05, 'coin', 0.35, 0.9);
  add(T.totB, 'snap', 0.6, 1.0); add(T.badge, 'chime', 0.4, 1.26);
  for (let i = 0; i < 4; i++) add(T.fold2 + i * 0.08, 'crease', 0.4, 1.1 - i * 0.05);
  add(T.crane2 + 0.05, 'swoosh', 0.55, 1.1);
  add(T.sheet, 'slide', 0.5, 1);
  add(T.written, 'stamp', 0.55, 1);
  for (let i = 0; i < 6; i++) add(T.rows + i * 0.12, 'crease', 0.25, 1.2 + i * 0.05);
  for (let i = 0; i < 6; i++) add(T.ticks + i * T.tickGap, 'tick', 0.45, 1 + i * 0.06);
  add(T.deposit, 'coin', 0.5, 1); add(T.deposit + 0.25, 'crease', 0.4, 1.2);
  for (let i = 0; i < 3; i++) add(T.fold3 + i * 0.07, 'crease', 0.35, 1.1);
  add(T.card + 0.05, 'slide', 0.5, 0.9); add(T.card + 0.42, 'snap', 0.6, 0.9);
  add(T.title, 'crease', 0.4, 1); add(T.title + 0.12, 'crease', 0.4, 1.15);
  add(T.banner, 'pop', 0.55, 1.2); add(T.banner + 0.3, 'chime', 0.4, 1.0);
  add(T.perch, 'flap', 0.4, 1.3);
  return c.sort((a, b) => a.t - b.t);
}
