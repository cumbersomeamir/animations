// One timeline drives picture and sound. Times are quantized to the 12 fps step grid
// at render time; audio cues use the same quantized times so every sound lands on a fold.
export const T = {
  ribbon: 0.0, foldA: 0.3, foldB: 0.7, squash: 1.04, morphEnd: 1.62, flap1: 1.7, flap2: 1.96,
  cam1: 2.0, riser: 2.2, pillarL: 2.4, pillarR: 2.52, canopy: 2.8, archHeart: 3.3, archFlower: 3.46,
  cam2: 4.3, cake: 4.68, tulips: 4.84, camera: 5.0, tags: 5.16, fav1: 5.45, fav2: 5.8,
  cam3: 6.5, box: 6.92, strip0: 6.9, check0: 7.45, check1: 7.8, check2: 9.75,
  cam4: 8.7, envelope: 9.12, flap: 9.25, planes: 9.5, planeGap: 0.11, flight: 0.55,
  cam5: 10.95, couple: 11.3, hands: 11.7, perch: 11.85, pennants: 11.55,
  foldDown: 12.45, card: 12.85, title: 13.3, sub: 13.55, banner: 13.7, cardPerch: 14.2,
};
export const BPM = 96;

export function buildCues() {
  const c = [];
  const add = (t, type, gain = 1, p = 1) => c.push({ t: Math.floor(t * 12 + 1e-6) / 12, type, gain, p });
  add(0.02, 'slide', 0.6, 1);
  add(T.foldA + 0.12, 'crease', 0.9, 1);
  add(T.foldA + 0.33, 'snap', 0.8, 1);
  add(T.foldB + 0.1, 'crease', 0.7, 1.15);
  add(T.foldB + 0.28, 'snap', 0.7, 1.2);
  add(T.squash, 'snap', 1.0, 0.85);
  add(T.squash + 0.25, 'crease', 0.6, 1.3);
  add(T.squash + 0.45, 'crease', 0.6, 1.45);
  add(T.flap1, 'flap', 0.8, 1);
  add(T.flap2, 'flap', 0.8, 1.1);
  [T.cam1, T.cam2, T.cam3, T.cam4].forEach((t) => { add(t + 0.05, 'swoosh', 0.75, 1); add(t + 0.12, 'flap', 0.55, 0.9); });
  add(T.riser, 'pop', 0.7, 0.7);
  add(T.pillarL, 'pop', 0.85, 0.9);
  add(T.pillarR, 'pop', 0.85, 1.0);
  for (let i = 0; i < 5; i++) add(T.canopy + i * 0.08, 'crease', 0.4, 1.2 + i * 0.08);
  add(T.archHeart, 'pop', 0.8, 1.3);
  add(T.archFlower, 'chime', 0.45, 1.5);
  add(T.cake, 'pop', 0.8, 1.0);
  add(T.tulips, 'pop', 0.8, 1.15);
  add(T.camera, 'pop', 0.8, 1.3);
  add(T.camera + 0.12, 'shutter', 0.5, 1);
  add(T.fav1, 'heart', 0.8, 1);
  add(T.fav2, 'heart', 0.8, 1.2);
  add(T.box, 'pop', 0.6, 0.9);
  for (let i = 0; i < 3; i++) add(T.strip0 + i * 0.15, 'crease', 0.55, 1 + i * 0.1);
  add(T.check0, 'stamp', 0.85, 1);
  add(T.check1, 'stamp', 0.85, 1.12);
  add(T.check2, 'stamp', 0.6, 1.25);
  add(T.check0 + 0.33, 'coin', 0.6, 1);
  add(T.check1 + 0.33, 'coin', 0.6, 1.12);
  add(T.envelope, 'pop', 0.7, 1.1);
  add(T.flap + 0.1, 'crease', 0.6, 1.3);
  for (let i = 0; i < 6; i++) {
    add(T.planes + i * T.planeGap, 'whoosh', 0.35, 1 + i * 0.05);
    add(T.planes + i * T.planeGap + T.flight, 'chime', 0.45, [1, 1.122, 1.26, 1.335, 1.498, 1.682][i]);
  }
  add(T.cam5, 'swoosh', 0.6, 0.8);
  add(T.couple, 'pop', 0.8, 1.0);
  add(T.couple + 0.1, 'pop', 0.7, 1.1);
  for (let i = 0; i < 4; i++) add(T.pennants + i * 0.1, 'crease', 0.35, 1.3 + i * 0.1);
  add(T.perch, 'flap', 0.6, 1.2);
  for (let i = 0; i < 5; i++) add(T.foldDown + i * 0.08, 'crease', 0.5, 1.1 - i * 0.05);
  add(T.card + 0.05, 'slide', 0.6, 0.9);
  add(T.card + 0.42, 'snap', 0.8, 0.9);
  add(T.title, 'crease', 0.5, 1);
  add(T.title + 0.12, 'crease', 0.5, 1.15);
  add(T.banner, 'pop', 0.7, 1.2);
  add(T.banner + 0.3, 'chime', 0.5, 1.0);
  add(T.cardPerch, 'flap', 0.5, 1.3);
  return c.sort((a, b) => a.t - b.t);
}
