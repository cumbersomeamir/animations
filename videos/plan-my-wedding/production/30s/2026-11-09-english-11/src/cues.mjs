// Episode timeline (seconds), synced to measured narration onsets and pauses (build/vo/vo.json).
// VO: n1 0.18, n2 2.77, n3 9.04, n4 15.16, n5 21.42, n6 26.55-29.48 (src/narration.mjs).
export const T = {
  // S1 hook: the final-month stack already teeters on frame 0 (n1; "The due dates don't" +1.25)
  hook: 0.0, adds: 0.25, dont: 1.43, reset: 2.45,
  // S2 made-up plan (n2 pauses: venue +0.91, caterer +1.46, photographer +2.26, deposit ~+3.6, balance ~+4.8)
  tag: 2.9, venue: 3.68, caterer: 4.23, photo: 5.03, dep: 6.3, bal: 7.6,
  // n3: "spread out" ~+0.93, "balances" +2.2, "same month" ~+3.8, "just before the wedding" +4.93
  spread: 9.97, balances: 11.24, month: 12.85, wedding: 13.97,
  // S3 payment schedule (n4: "list every payment" +1.62, "due date" ~+2.85, "start saving early" +3.96, "heavy month" ~+5.1)
  crane: 14.95, card: 15.3, list: 16.78, due: 18.0, saving: 19.12, heavy: 20.3,
  // n5: "refundable" ~+0.4, "if plans change" +1.53, "whole schedule" ~+3.0, "in writing" ~+3.5
  refund: 21.8, change: 22.95, schedule: 24.4, writing: 24.9,
  // S4 CTA end card (n6 26.55-29.48)
  fold: 26.0, end: 26.15, title: 26.75, sub: 27.05, banner2: 27.3, perch: 28.25,
};
export const BPM = 96;

export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: Math.floor(t * 12 + 1e-6) / 12, type, gain, p });
  add(0.02, 'creak', 0.35, 1.0); add(T.adds, 'chime', 0.3, 1.1); add(T.dont, 'creak', 0.4, 0.85); add(T.dont + 0.15, 'slide', 0.35, 1.3);
  add(T.reset, 'whoosh', 0.4, 1.0); add(T.tag, 'crease', 0.3, 1.2);
  add(T.venue, 'pop', 0.45, 1.0); add(T.caterer, 'pop', 0.45, 1.12); add(T.photo, 'pop', 0.45, 1.25); add(T.photo + 0.1, 'shutter', 0.3, 1);
  for (let i = 0; i < 3; i++) add(T.dep + i * 0.2, 'slide', 0.3, 1.2 + i * 0.08);
  add(T.bal, 'crease', 0.35, 1.0);
  add(T.spread, 'chime', 0.25, 1.15);
  for (let i = 0; i < 3; i++) add(T.balances + 0.06 + i * 0.3, 'stamp', 0.45, 1.0 - i * 0.05);
  add(T.month, 'creak', 0.4, 0.85); add(T.wedding, 'heart', 0.4, 1.1);
  add(T.crane + 0.05, 'swoosh', 0.5, 1.05); add(T.crane + 0.15, 'flap', 0.35, 0.9); add(T.card, 'slide', 0.5, 1);
  for (let i = 0; i < 6; i++) add(T.list + i * 0.18, 'tick', 0.3, 1 + i * 0.05);
  add(T.due, 'slide', 0.3, 1.3);
  for (let i = 0; i < 5; i++) add(T.saving + 0.1 + i * 0.2, 'coin', 0.25, 1 + i * 0.04);
  add(T.heavy, 'stamp', 0.45, 0.95);
  for (let i = 0; i < 6; i++) add(T.refund + 0.1 + i * 0.1, 'pop', 0.25, 1.3 + i * 0.04);
  add(T.writing - 0.1, 'slide', 0.35, 1.5); add(T.writing + 0.35, 'stamp', 0.55, 1.05);
  for (let i = 0; i < 3; i++) add(T.fold + i * 0.07, 'crease', 0.3, 1.1);
  add(T.end + 0.05, 'slide', 0.45, 0.9); add(T.end + 0.42, 'snap', 0.55, 0.9);
  add(T.title, 'crease', 0.35, 1); add(T.banner2, 'pop', 0.5, 1.2); add(T.banner2 + 0.3, 'chime', 0.35, 1.0);
  add(T.perch, 'flap', 0.35, 1.3);
  return c.sort((a, b) => a.t - b.t);
}
