// Episode timeline (seconds), synced to measured narration onsets (build/vo/vo.json).
// VO: n1 0.18, n2 3.19, n3 7.09, n4 10.61, n5 15.26, n6 20.27, n7 26.55-29.30 (src/narration.mjs).
export const T = {
  // S1 hook: two queues already jammed at one serving point on frame 0 (n1; "and the buffet line still crawls" +1.02)
  hook: 0.0, crawl: 1.2,
  // S2 made-up layout (n2; "two queues merge at one serving point" +1.54) and the backup (n3; "same spoon" ~+1.3, "line backs up" +2.06)
  tag: 3.4, queues: 4.73, merge: 5.6, spoon: 8.35, backs: 9.15,
  // S3 split (n4; "separate stations" ~+0.6, "its own queue" ~+2.6, "one-way flow" ~+3.5); the crane cuts the table
  crane: 10.4, split: 10.75, ownQ: 13.0, oneway: 14.1,
  // S4 accessible route (n5; "accessible route" ~+0.6, "step-free" +1.8, "wide and clear" ~+2.55, "food within reach" ~+3.35)
  route: 15.85, wcGo: 16.9, stepFree: 17.06, wide: 17.8, reach: 18.6,
  // S5 walkthrough check (n6; "check where each queue starts" +1.41, "where it exits" ~+2.75, "the route a wheelchair takes" +4.03)
  walk: 20.3, pin1: 21.68, pin2: 23.0, pin3: 24.3,
  // S6 CTA end card (n7 26.55-29.30)
  fold: 26.0, end: 26.15, title: 26.75, sub: 27.05, banner2: 27.3, perch: 28.25,
};
export const BPM = 96;

export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: Math.floor(t * 12 + 1e-6) / 12, type, gain, p });
  for (let i = 0; i < 4; i++) add(0.05 + i * 0.35, 'tick', 0.22, 0.9 + (i % 2) * 0.1);
  add(T.crawl, 'creak', 0.35, 1.0);
  add(T.tag, 'crease', 0.3, 1.2); add(T.queues, 'slide', 0.35, 1.1); add(T.queues + 0.25, 'slide', 0.3, 1.2);
  add(T.merge, 'stamp', 0.45, 1.0); add(T.spoon, 'pop', 0.45, 1.4); add(T.spoon + 0.25, 'pop', 0.35, 1.5);
  for (let i = 0; i < 6; i++) add(T.backs + i * 0.1, 'tick', 0.25, 0.8 + i * 0.03);
  add(T.crane + 0.05, 'swoosh', 0.5, 1.05); add(T.crane + 0.15, 'flap', 0.35, 0.9); add(T.split, 'snap', 0.5, 1.0); add(T.split + 0.15, 'crease', 0.35, 1.1);
  add(T.ownQ, 'slide', 0.35, 1.1); add(T.oneway, 'chime', 0.3, 1.1);
  add(T.route, 'slide', 0.35, 1.2); add(T.wcGo, 'pop', 0.4, 1.0); add(T.stepFree, 'stamp', 0.45, 1.05); add(T.wide, 'whoosh', 0.35, 1.1); add(T.reach, 'chime', 0.35, 1.2);
  add(T.walk, 'crease', 0.35, 1.0);
  add(T.pin1, 'pop', 0.45, 1.0); add(T.pin1 + 0.15, 'pop', 0.4, 1.1); add(T.pin2, 'pop', 0.45, 1.2); add(T.pin2 + 0.15, 'pop', 0.4, 1.3); add(T.pin3, 'pop', 0.5, 1.4); add(T.pin3 + 0.5, 'chime', 0.35, 1.12);
  for (let i = 0; i < 3; i++) add(T.fold + i * 0.07, 'crease', 0.3, 1.1);
  add(T.end + 0.05, 'slide', 0.45, 0.9); add(T.end + 0.42, 'snap', 0.55, 0.9);
  add(T.title, 'crease', 0.35, 1); add(T.banner2, 'pop', 0.5, 1.2); add(T.banner2 + 0.3, 'chime', 0.35, 1.0);
  add(T.perch, 'flap', 0.35, 1.3);
  return c.sort((a, b) => a.t - b.t);
}
