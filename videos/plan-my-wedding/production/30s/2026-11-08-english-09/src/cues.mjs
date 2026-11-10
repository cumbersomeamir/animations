// Episode timeline (seconds), synced to measured narration onsets (build/vo/vo.json).
// VO: n1 0.18, n2 3.37, n3 6.98, n4 11.36, n5 14.65, n6 18.69, n7 22.48, n8 26.60-29.28 (src/narration.mjs).
export const T = {
  // S1 hook: vows already being spoken on frame 0; sound dies after row 3 (n1; "and the back rows heard nothing" +1.18)
  hook: 0.0, nothing: 1.36, shrink: 3.0,
  // S2 made-up quote (n2; "lists two speakers and a playlist" +1.29) and the gaps (n3 onsets 0 / +1.13 / +1.97)
  card: 3.45, tag: 3.7, spk: 4.95, play: 5.9, mic: 6.98, pow: 8.11, op: 8.95,
  // S3 confirm in writing (n4; "confirm" +1.14, "in writing" ~+2.2)
  crane: 11.15, banner: 12.45, writing: 13.5,
  // item 1 microphones (n5; "how many" +1.18, "wireless" ~+2.05, "spare batteries" ~+2.8)
  q1: 14.65, many: 15.83, wireless: 16.7, batt: 17.45,
  // item 2 power (n6; "where it plugs in" ~+0.55, "what backs it up" +1.71, "cuts out" ~+2.85)
  q2: 18.69, plug: 19.2, backup: 20.5, cutout: 21.55,
  // item 3 operator (n7; "who stays to run it" +0.91, "the vows" ~+1.9, "last speech" ~+3.0)
  q3: 22.48, opIn: 23.39, vowsBar: 24.35, allRows: 25.0, speechBar: 25.5, every: 25.55,
  // S4 CTA end card (n8 26.60-29.28)
  fold: 26.1, end: 26.25, title: 26.85, sub: 27.15, banner2: 27.4, perch: 28.35,
};
export const BPM = 96;

export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: Math.floor(t * 12 + 1e-6) / 12, type, gain, p });
  add(0.02, 'chime', 0.3, 1.0); add(T.nothing, 'pop', 0.4, 1.4); add(T.nothing + 0.12, 'pop', 0.35, 1.55);
  add(T.shrink, 'slide', 0.35, 1.1);
  add(T.card, 'slide', 0.5, 1); add(T.tag, 'crease', 0.3, 1.2);
  add(T.spk, 'tick', 0.45, 1); add(T.play, 'tick', 0.45, 1.1);
  add(T.mic, 'stamp', 0.5, 1.0); add(T.pow, 'stamp', 0.5, 0.95); add(T.pow + 0.05, 'snap', 0.4, 1.4); add(T.op, 'stamp', 0.5, 0.9);
  add(T.crane + 0.05, 'swoosh', 0.5, 1.05); add(T.crane + 0.15, 'flap', 0.35, 0.9);
  add(T.banner, 'pop', 0.5, 1.0);
  for (let i = 0; i < 3; i++) add(T.banner + 0.35 + i * 0.12, 'crease', 0.3, 1.1 + i * 0.06);
  add(T.writing, 'slide', 0.3, 1.4);
  add(T.q1, 'pop', 0.45, 1.1); add(T.many, 'pop', 0.4, 1.25); add(T.many + 0.1, 'pop', 0.35, 1.35);
  add(T.wireless, 'chime', 0.3, 1.1); add(T.batt, 'tick', 0.4, 1.3); add(T.batt + 0.1, 'tick', 0.4, 1.4);
  add(T.q2, 'pop', 0.45, 1.1); add(T.plug, 'slide', 0.35, 1.2); add(T.backup, 'stamp', 0.5, 1.05);
  add(T.cutout, 'snap', 0.45, 1.3); add(T.cutout + 0.15, 'chime', 0.3, 1.0);
  add(T.q3, 'pop', 0.45, 1.1); add(T.opIn, 'pop', 0.45, 0.95); add(T.vowsBar, 'slide', 0.35, 1.3);
  add(T.allRows, 'heart', 0.4, 1.1); add(T.allRows + 0.1, 'heart', 0.35, 1.25); add(T.every, 'chime', 0.35, 1.12);
  for (let i = 0; i < 3; i++) add(T.fold + i * 0.07, 'crease', 0.3, 1.1);
  add(T.end + 0.05, 'slide', 0.45, 0.9); add(T.end + 0.42, 'snap', 0.55, 0.9);
  add(T.title, 'crease', 0.35, 1); add(T.banner2, 'pop', 0.5, 1.2); add(T.banner2 + 0.3, 'chime', 0.35, 1.0);
  add(T.perch, 'flap', 0.35, 1.3);
  return c.sort((a, b) => a.t - b.t);
}
