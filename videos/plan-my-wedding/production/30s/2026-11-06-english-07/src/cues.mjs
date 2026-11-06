// Episode timeline (seconds), synced to measured narration onsets (build/vo/vo.json).
// VO: n1 0.18, n2 5.01, n3 8.29, n4 12.17, n5 17.41, n6 21.59, n7 27.04-29.72 (src/narration.mjs).
export const T = {
  // S1 hook: sun already sinking on frame 0 (n1; "Build the ceremony timeline backwards" +1.22)
  sun: 0.0, hills: 0.0, ruler: 1.45, arrow: 2.9,
  // S2 sunset pin (n2; "sunset is six P M" +1.06)
  example: 5.1, sunset: 6.07,
  // S3 portraits (n3; "so book them from five thirty" +1.39)
  couple: 8.4, portraits: 9.68,
  // S4 buffer + late-start demo (n4; "twenty-minute buffer" +0.7, "so a late start" +2.35)
  buffer: 12.87, ghost: 14.52, ghostOut: 16.2,
  // S5 ceremony (n5; "so it starts at four forty" +1.88)
  ceremony: 17.55, start: 19.29,
  // S6 check (n6; "and the venue's timing rules" +2.98)
  crane: 21.3, card: 21.55, tick1: 22.4, tick2: 24.65,
  // S7 CTA end card (n7 27.04-29.72)
  fold: 26.35, end: 26.5, title: 27.1, sub: 27.4, banner: 27.65, perch: 28.6,
};
export const BPM = 96;

export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: Math.floor(t * 12 + 1e-6) / 12, type, gain, p });
  add(0.02, 'slide', 0.45, 0.8);
  add(T.ruler, 'slide', 0.4, 1.1);
  for (let i = 0; i < 4; i++) add(T.ruler + 0.15 + i * 0.08, 'tick', 0.25, 1.2 + i * 0.05);
  add(T.arrow, 'swoosh', 0.45, 0.9);
  add(T.example, 'crease', 0.3, 1.2);
  add(T.sunset, 'stamp', 0.55, 0.9); add(T.sunset + 0.1, 'chime', 0.35, 1.0);
  add(T.couple, 'pop', 0.45, 1.1); add(T.couple + 0.12, 'shutter', 0.4, 1);
  add(T.portraits, 'stamp', 0.55, 1.0);
  add(T.buffer, 'stamp', 0.5, 1.1);
  add(T.ghost, 'slide', 0.4, 1.3); add(T.ghost + 0.5, 'tick', 0.4, 1.4);
  add(T.ghostOut, 'slide', 0.3, 1.5);
  add(T.ceremony, 'stamp', 0.6, 0.95); add(T.start, 'pop', 0.5, 1.2);
  add(T.crane + 0.05, 'swoosh', 0.5, 1.05); add(T.crane + 0.15, 'flap', 0.35, 0.9);
  add(T.card, 'slide', 0.5, 1);
  add(T.tick1, 'tick', 0.5, 1); add(T.tick2, 'tick', 0.5, 1.12);
  for (let i = 0; i < 3; i++) add(T.fold + i * 0.07, 'crease', 0.3, 1.1);
  add(T.end + 0.05, 'slide', 0.45, 0.9); add(T.end + 0.42, 'snap', 0.55, 0.9);
  add(T.title, 'crease', 0.35, 1); add(T.banner, 'pop', 0.5, 1.2); add(T.banner + 0.3, 'chime', 0.35, 1.0);
  add(T.perch, 'flap', 0.35, 1.3);
  return c.sort((a, b) => a.t - b.t);
}
