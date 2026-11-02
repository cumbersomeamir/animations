// Original square-pixel art director ("Pixel Pip": the series host redrawn as a 16×20 sprite) + pixel props.
// One sprite grid: every part is drawn into a 16×20 canvas and shown with image-rendering: pixelated at PX world px/pixel.
export const SW = 16, SH = 20;
const C = { v: "#6234FB", d: "#4A1FD6", l: "#CCC0F7", L: "#AE9CF3", k: "#1B1433", w: "#FFFFFF", p: "#F0EAFC", y: "#FFFFFF" };

// pose: { legs: stand|walkA|walkB|tuck|crouch|stretch|sit, arms: down|up|carry|wave|point, eyes: n|l|r|u|d|wide|happy|shut, mouth: smile|o|flat|grin, flip }
export function drawMascot(ctx, pose) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, SW, SH);
  if (pose.flip) ctx.setTransform(-1, 0, 0, 1, SW, 0);
  const px = (x, y, c) => { if (x < 0 || x >= SW || y < 0 || y >= SH) return; ctx.fillStyle = C[c]; ctx.fillRect(x, y, 1, 1); };
  const legs = pose.legs || "stand";
  let bodyH = 9, legH = 2, xL = 3, xR = 12;
  if (legs === "crouch") { bodyH = 8; legH = 1; xL = 2; xR = 13; }
  if (legs === "stretch") { bodyH = 10; xL = 4; xR = 11; }
  if (legs === "tuck") legH = 1;
  if (legs === "sit") legH = 1;
  const feetY = SH - 1, bodyBottom = feetY - legH, bodyTop = bodyBottom - bodyH + 1;
  // body (rounded capsule, darker bottom row and right edge)
  for (let r = 0; r < bodyH; r++) {
    const y = bodyTop + r; let a = xL, b = xR;
    if (r === 0 || r === bodyH - 1) { a++; b--; }
    for (let x = a; x <= b; x++) px(x, y, r === bodyH - 1 || x === b ? "d" : "v");
  }
  // beret (tilted to the left) + stalk
  for (let x = xL; x <= xR - 2; x++) px(x, bodyTop - 1, "l");
  for (let x = xL + 1; x <= xR - 4; x++) px(x, bodyTop - 2, "L");
  px(xL + 3, bodyTop - 3, "k");
  // eyes
  const eL = xL + 2, eR = xR - 3, er = bodyTop + 2, e = pose.eyes || "n";
  if (e === "happy") { px(eL, er + 1, "k"); px(eL + 1, er, "k"); px(eR, er, "k"); px(eR + 1, er + 1, "k"); }
  else if (e === "shut") { for (const x of [eL, eL + 1, eR, eR + 1]) px(x, er + 1, "k"); }
  else {
    for (const x of [eL, eL + 1, eR, eR + 1]) { px(x, er, "w"); px(x, er + 1, "w"); if (e === "wide") px(x, er - 1, "w"); }
    let dx = { n: [1, 0], l: [0, 0], r: [1, 1], u: [1, 0], d: [1, 0], wide: [1, 0] }[e] || [1, 0];
    const py = e === "u" || e === "wide" ? er : er + 1;
    px(eL + dx[0], py, "k"); px(eR + dx[1], py, "k");
  }
  // mouth
  const m = er + 3, mo = pose.mouth || "smile";
  if (mo === "smile") { px(eL + 1, m, "k"); px(eR, m, "k"); px(eL + 2, m + 1, "k"); px(eR - 1, m + 1, "k"); }
  else if (mo === "o") { px(eL + 2, m, "k"); px(eR - 1, m, "k"); px(eL + 2, m + 1, "k"); px(eR - 1, m + 1, "k"); }
  else if (mo === "flat") { for (let x = eL + 1; x <= eR; x++) px(x, m + 1, "k"); }
  else if (mo === "grin") { for (let x = eL + 1; x <= eR; x++) px(x, m, "k"); px(eL + 1, m + 1, "k"); px(eR, m + 1, "k"); for (let x = eL + 2; x <= eR - 1; x++) px(x, m + 1, "w"); }
  // arms + white mitten hands
  const sr = bodyTop + 4, a = pose.arms || "down";
  const armDown = (x, dir) => { px(x, sr, "d"); px(x, sr + 1, "d"); px(x, sr + 2, "w"); };
  const armUp = (x, dir) => { px(x, sr, "d"); px(x + dir, sr - 1, "d"); px(x + dir, sr - 2, "d"); px(x + dir, sr - 3, "w"); };
  const armCarry = (x) => { for (let y = bodyTop - 2; y <= sr; y++) px(x, y, "d"); px(x, bodyTop - 3, "w"); };
  if (a === "down") { armDown(xL - 1); armDown(xR + 1); }
  if (a === "up") { armUp(xL - 1, -1); armUp(xR + 1, 1); }
  if (a === "carry") { armCarry(xL - 1); armCarry(xR + 1); }
  if (a === "wave") { armDown(xL - 1); armUp(xR + 1, 1); }
  if (a === "point") { armDown(xL - 1); px(xR + 1, sr, "d"); px(xR + 2, sr, "d"); px(xR + 3, sr, "w"); }
  // legs
  const lx = xL + 2, rx = xR - 2;
  if (legs === "stand" || legs === "stretch") { px(lx, feetY - 1, "k"); px(rx, feetY - 1, "k"); px(lx - 1, feetY, "k"); px(lx, feetY, "k"); px(rx, feetY, "k"); px(rx + 1, feetY, "k"); }
  if (legs === "walkA") { px(lx - 1, feetY - 1, "k"); px(rx, feetY - 1, "k"); px(lx - 2, feetY, "k"); px(lx - 1, feetY, "k"); px(rx, feetY, "k"); px(rx + 1, feetY, "k"); }
  if (legs === "walkB") { px(lx, feetY - 1, "k"); px(rx + 1, feetY - 1, "k"); px(lx - 1, feetY, "k"); px(lx, feetY, "k"); px(rx + 1, feetY, "k"); px(rx + 2, feetY, "k"); }
  if (legs === "tuck") { px(lx, feetY, "k"); px(lx + 1, feetY, "k"); px(rx - 1, feetY, "k"); px(rx, feetY, "k"); }
  if (legs === "crouch") { px(lx - 1, feetY, "k"); px(lx, feetY, "k"); px(rx, feetY, "k"); px(rx + 1, feetY, "k"); }
  if (legs === "sit") { px(lx + 1, feetY, "k"); px(lx + 2, feetY, "k"); px(rx + 1, feetY, "k"); px(rx + 2, feetY, "k"); }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// pixel props on the same grid (each returns [w, h, rows]); '#' = colour c
export const PROPS = {
  bang: { c: "v", rows: ["##", "##", "##", "##", "##", "..", "##"] },
  quest: { c: "v", rows: [".###.", "#...#", "...#.", "..#..", "..#..", ".....", "..#.."] },
  spark: { c: "w", rows: ["..#..", ".###.", "#####", ".###.", "..#.."] },
  z: { c: "p", rows: ["####", "..#.", ".#..", "####"] },
  dust: { c: "p", rows: ["#"] },
  check: { c: "v", rows: ["......#", ".....##", "#...##.", "##.##..", ".###...", "..#...."] },
  x: { c: "v", rows: ["##...##", ".##.##.", "..###..", ".##.##.", "##...##"] },
};
export function drawProp(ctx, name) {
  const P = PROPS[name]; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); ctx.fillStyle = C[P.c];
  P.rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === "#") ctx.fillRect(x, y, 1, 1); }));
  return [P.rows[0].length, P.rows.length];
}
