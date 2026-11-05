// Episode timeline (seconds), synced to measured narration onsets (build/vo/vo.json).
// VO: n1 0.18, n2 4.38, n3 9.75, n4 13.62, n5 17.64, n6 26.17-29.60 (src/narration.mjs).
export const T = {
  // S1 hook: RSVP cards pour in from frame 0 (n1; "isn't one hundred fifty meals" +2.38)
  cards: 0.0, count: 0.15, neq: 2.56, plates: 2.7,
  // S2 split (n2; "made-up example" 0, "the yeses are..." +1.72, "eighteen children" ~+3.9)
  crane1: 4.15, trays: 4.5, tag: 4.6, adults: 6.2, kids: 8.2,
  // S3 vendor crew meals (n3; "photographer" ~+0.5, "DJ" ~+1.4, "eight crew meals" +2.98)
  photog: 10.2, dj: 11.1, crew: 12.6,
  // S4 caterer ticket (n4; "one hundred fifty-eight" ~+1.2, "in three types" +2.89)
  ticket: 13.7, rows: [14.0, 14.3, 14.6], total: 14.95, types: 16.5,
  // S5 confirm in writing (n5; header 0, items ~+2.5 .. +7.3)
  crane2: 17.45, sheet: 17.7, ticks: [20.0, 20.5, 21.1, 22.4, 23.4, 24.9], sign: 25.35,
  // S6 CTA end card (n6 26.17-29.60)
  fold: 25.9, card: 26.0, title: 26.6, sub: 26.9, banner: 27.15, perch: 28.1,
};
export const BPM = 96;

export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: Math.floor(t * 12 + 1e-6) / 12, type, gain, p });
  for (let i = 0; i < 10; i++) add(T.cards + 0.05 + i * 0.16, 'crease', 0.25, 1.2 + (i % 4) * 0.08);
  add(T.neq, 'stamp', 0.6, 0.95); add(T.plates, 'pop', 0.45, 1.2);
  add(T.crane1 + 0.05, 'swoosh', 0.5, 1); add(T.crane1 + 0.15, 'flap', 0.35, 0.9);
  add(T.trays, 'pop', 0.5, 0.9); add(T.tag, 'crease', 0.3, 1.2);
  for (let i = 0; i < 8; i++) add(T.adults + i * 0.1, 'tick', 0.2, 1 + i * 0.03);
  for (let i = 0; i < 3; i++) add(T.kids + i * 0.12, 'tick', 0.28, 1.5 + i * 0.06);
  add(T.photog, 'pop', 0.5, 1.0); add(T.photog + 0.15, 'shutter', 0.45, 1);
  add(T.dj, 'pop', 0.5, 1.15);
  for (let i = 0; i < 8; i++) add(T.crew + i * 0.07, 'tick', 0.25, 1.2 + i * 0.04);
  add(T.ticket, 'slide', 0.5, 1);
  T.rows.forEach((t, i) => add(t, 'crease', 0.35, 1.1 + i * 0.08));
  add(T.total, 'stamp', 0.55, 1); add(T.types, 'chime', 0.35, 1.12);
  add(T.crane2 + 0.05, 'swoosh', 0.5, 1.05);
  add(T.sheet, 'slide', 0.5, 1);
  T.ticks.forEach((t, i) => add(t, 'tick', 0.45, 1 + i * 0.06));
  add(T.sign, 'slide', 0.35, 1.5); add(T.sign + 0.4, 'stamp', 0.5, 1.1);
  for (let i = 0; i < 3; i++) add(T.fold + i * 0.07, 'crease', 0.3, 1.1);
  add(T.card + 0.05, 'slide', 0.45, 0.9); add(T.card + 0.42, 'snap', 0.55, 0.9);
  add(T.title, 'crease', 0.35, 1); add(T.banner, 'pop', 0.5, 1.2); add(T.banner + 0.3, 'chime', 0.35, 1.0);
  add(T.perch, 'flap', 0.35, 1.3);
  return c.sort((a, b) => a.t - b.t);
}
