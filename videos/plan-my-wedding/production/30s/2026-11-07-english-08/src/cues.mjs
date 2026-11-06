// Episode timeline (seconds), synced to measured narration onsets (build/vo/vo.json).
// VO: n1 0.18, n2 4.44, n3 11.37, n4 16.97, n5 19.60, n6 21.36, n7 22.80, n8 26.71-29.68 (src/narration.mjs).
export const T = {
  // S1 hook: camera flash on frame 0, 20 prints fan out (n1; "two hundred edited photos" +1.88)
  cam: 0.0, flash: 0.0, prints: 0.25, edited: 2.06,
  // S2 fine print (n2; "the fine print says" +1.42, "fifty are fully retouched" ~+2.6, "the rest get basic colour" +4.42)
  tag: 4.5, lens: 5.86, retouched: 7.0, basic: 8.86,
  // S3 quote terms (n3; "Delivery takes twelve weeks" 0, "raw files cost extra" +1.85, "use is personal only" +3.55)
  gridFold: 10.85, card: 11.25, delivery: 11.6, raw: 13.22, usage: 14.92,
  // S4 three questions (n4 header; n5/n6/n7 questions; "in writing" +2.47)
  crane: 16.55, header: 17.2, q1: 19.6, q2: 21.36, q3: 22.8, writing: 25.27,
  // S5 CTA end card (n8 26.71-29.68)
  fold: 26.15, end: 26.3, title: 26.9, sub: 27.2, banner: 27.45, perch: 28.4,
};
export const BPM = 96;

export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: Math.floor(t * 12 + 1e-6) / 12, type, gain, p });
  add(T.cam, 'pop', 0.55, 0.9); add(T.flash, 'shutter', 0.7, 1);
  for (let i = 0; i < 10; i++) add(T.prints + i * 0.1, 'crease', 0.22, 1.2 + (i % 4) * 0.07);
  add(T.edited, 'heart', 0.45, 0.85);
  add(T.tag, 'crease', 0.3, 1.2);
  add(T.lens, 'slide', 0.45, 1.3);
  add(T.retouched, 'chime', 0.4, 1.26); add(T.retouched + 0.1, 'tick', 0.3, 1.5);
  add(T.basic, 'snap', 0.4, 0.9);
  add(T.gridFold, 'crease', 0.35, 1.1); add(T.card, 'slide', 0.5, 1);
  for (let i = 0; i < 4; i++) add(T.delivery + 0.1 + i * 0.18, 'crease', 0.3, 1.3 + i * 0.05);
  add(T.raw, 'coin', 0.45, 1.1); add(T.usage, 'stamp', 0.5, 1.0);
  add(T.crane + 0.05, 'swoosh', 0.5, 1.05); add(T.crane + 0.15, 'flap', 0.35, 0.9);
  add(T.header, 'pop', 0.5, 1.0);
  [T.q1, T.q2, T.q3].forEach((t, i) => add(t, 'pop', 0.5, 1.1 + i * 0.1));
  add(T.writing, 'slide', 0.35, 1.5); add(T.writing + 0.3, 'stamp', 0.55, 1.05);
  for (let i = 0; i < 3; i++) add(T.fold + i * 0.07, 'crease', 0.3, 1.1);
  add(T.end + 0.05, 'slide', 0.45, 0.9); add(T.end + 0.42, 'snap', 0.55, 0.9);
  add(T.title, 'crease', 0.35, 1); add(T.banner, 'pop', 0.5, 1.2); add(T.banner + 0.3, 'chime', 0.35, 1.0);
  add(T.perch, 'flap', 0.35, 1.3);
  return c.sort((a, b) => a.t - b.t);
}
