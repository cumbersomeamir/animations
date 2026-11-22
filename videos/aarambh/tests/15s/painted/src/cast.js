// cast.js — the potter, the supporter, their emotions and emotes, and the props. All painted with paint()/inkLine().

// ---------- emotions: face + emote + idle motion, locked to the beat ----------
const EMO = {
  neutral:    { eyes: 'normal', mouth: 'smile0', br: [0, 0], take: .3, body: t => ({ dy: -.06 * pulse(t, 5) }) },
  determined: { eyes: 'normal', mouth: 'flat', br: [-.1, -.8], take: .4, emote: 'sweat', body: t => ({ dy: -.05 * pulse(t, 7) }) },
  surprised:  { eyes: 'wide', mouth: 'O', br: [1, 0], take: 1, emote: '!', body: () => ({}) },
  sad:        { eyes: 'sad', mouth: 'frown', br: [.1, 1], gloom: .7, take: .45, emote: 'cloud', body: t => ({ dy: .18 + .05 * wob(t, .5), sq: .05 }) },
  curious:    { eyes: 'normal', mouth: 'o', br: [.6, .3], take: .5, emote: '?', lookY: -1, lookX: .6, body: t => ({ dy: -.04 * wob(t, .8) }) },
  thinking:   { eyes: 'normal', mouth: 'wobble', br: [.3, -.2], take: .3, emote: 'dots', lookX: .8, lookY: .3, body: t => ({ dy: -.04 * wob(t, .6) }) },
  starstruck: { eyes: 'star', mouth: 'grin', br: [1, 0], blush: .5, take: 1, emote: 'sparkle', body: t => ({ dy: -.35 * Math.abs(Math.sin(bpOf(t) * Math.PI)) }) },
  happy:      { eyes: 'happy', mouth: 'grin', br: [.5, 0], blush: .6, take: .6, body: t => ({ dy: -.14 * pulse(t, 5) }) },
  love:       { eyes: 'heart', mouth: 'smile', br: [.4, .2], blush: .8, take: .6, emote: 'hearts', body: t => ({ dy: -.1 * pulse(t, 4) }) },
  proud:      { eyes: 'closed', mouth: 'smile', br: [.3, 0], blush: .6, take: .4, emote: 'sparkle', body: t => ({ dy: -.08 * pulse(t, 5) }) },
};

// Acted changes: squint + squash before each key (anticipation), take after it, emote pops in.
function emotions(t, keys, o = {}) {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const [tk, name, ov] = keys[i], e = EMO[name], next = keys[i + 1];
  let squint = 0, sq = 0, dy = 0;
  if (next && t > next[0] - .12) { const k = ease(seg(t, next[0] - .12, next[0])); squint = .85 * k; sq += .08 * k; }
  const a = t - tk;
  if (i > 0) {
    const amt = e.take ?? .5;
    if (a < .1) squint = Math.max(squint, .85 * (1 - a / .1));
    sq += -.24 * amt * Math.exp(-6 * a) * Math.cos(16 * a);
    dy += -1.0 * amt * Math.exp(-7 * a) * Math.max(0, Math.cos(9 * a));
  }
  const body = e.body ? e.body(t) : {};
  return {
    eyes: e.eyes, mouth: e.mouth, br: e.br, blush: e.blush || 0, gloom: e.gloom || 0, emote: e.emote,
    emoteK: i > 0 || tk > 0 ? backOut(seg(t, tk + .04, tk + .32)) : 1, emoteAge: a,
    lookX: e.lookX ?? 0, lookY: e.lookY ?? 0, ...body, squint, sq: sq + (body.sq || 0), dy: dy + (body.dy || 0), ...(ov || {}), ...o,
  };
}

// ---------- the person rig (ground point between the feet, size unit u, +x = facing) ----------
const LOOKS = {
  potter: { outfit: PAL.green, outfitDk: PAL.greenDk, trim: PAL.gold, scarf: PAL.gold, hair: 'bun', skin: PAL.skin },
  supporter: { outfit: PAL.cream, outfitDk: PAL.creamDk, trim: PAL.green, scarf: PAL.gold, hair: 'short', skin: '#B97E55' },
};

function eye(type, x, y, u, squint, side, lookX, lookY) {
  const sw = u * .018;
  const h = Math.max(.08, 1 - squint);
  if (squint > .8 && type !== 'happy' && type !== 'closed') type = 'closed';
  switch (type) {
    case 'happy': inkLine([[x - .3 * u, y + .1 * u], [x, y - .2 * u], [x + .3 * u, y + .1 * u]], sw * 1.3); break;
    case 'closed': inkLine([[x - .3 * u, y - .02 * u], [x, y + .16 * u], [x + .3 * u, y - .02 * u]], sw * 1.3); break;
    case 'star': paint(starPts(x, y, .38 * u, .38), { wash: PAL.gold, ink: PAL.ink, sw: sw * .8 }); break;
    case 'heart': paint(heartPts(x, y + .05 * u, .34 * u), { wash: PAL.rose, ink: PAL.ink, sw: sw * .8 }); break;
    case 'wide':
      paint(ellPts(x, y, .36 * u, .44 * u * h, 18), { wash: PAL.cream, ink: PAL.ink, sw: sw * .9 });
      paint(ellPts(x + lookX * .1 * u, y + lookY * .1 * u, .16 * u, .18 * u * h, 12), { wash: PAL.ink, ink: null });
      break;
    case 'sad':
      paint(ellPts(x + lookX * .1 * u, y + .06 * u + lookY * .08 * u, .17 * u, .26 * u * h, 14), { wash: PAL.ink, ink: null });
      inkLine([[x - .3 * u, y - .16 * u + side * .1 * u], [x + .3 * u, y - .16 * u - side * .1 * u]], sw);
      break;
    default:
      paint(ellPts(x + lookX * .1 * u, y + lookY * .1 * u, .18 * u, .28 * u * h, 14), { wash: PAL.ink, ink: null });
      if (h > .5) paint(ellPts(x + lookX * .1 * u + .06 * u, y + lookY * .1 * u - .1 * u, .05 * u, .05 * u, 8), { wash: PAL.cream, ink: null });
  }
}
function mouthAt(type, x, y, u) {
  const sw = u * .018;
  switch (type) {
    case 'smile0': inkLine([[x - .35 * u, y], [x, y + .12 * u], [x + .35 * u, y]], sw); break;
    case 'smile': inkLine([[x - .45 * u, y - .05 * u], [x, y + .25 * u], [x + .45 * u, y - .05 * u]], sw * 1.1); break;
    case 'grin': paint([[x - .55 * u, y - .1 * u], [x + .55 * u, y - .1 * u], [x + .3 * u, y + .35 * u], [x, y + .45 * u], [x - .3 * u, y + .35 * u]], { wash: '#7A2E2A', ink: PAL.ink, sw: sw * .9, curv: .4 }); break;
    case 'flat': inkLine([[x - .35 * u, y + .05 * u], [x + .35 * u, y]], sw * 1.1); break;
    case 'frown': inkLine([[x - .4 * u, y + .2 * u], [x, y - .02 * u], [x + .4 * u, y + .2 * u]], sw * 1.1); break;
    case 'o': paint(ellPts(x, y + .08 * u, .16 * u, .2 * u, 12), { wash: '#7A2E2A', ink: PAL.ink, sw: sw * .8 }); break;
    case 'O': paint(ellPts(x, y + .12 * u, .3 * u, .4 * u, 14), { wash: '#7A2E2A', ink: PAL.ink, sw: sw * .9 }); break;
    case 'wobble': inkLine([[x - .4 * u, y + .05 * u], [x - .15 * u, y - .05 * u], [x + .1 * u, y + .07 * u], [x + .4 * u, y - .03 * u]], sw); break;
  }
}

/** Arm: a sleeve ribbon from shoulder to hand with a natural elbow sag, plus a hand. */
function arm(sh, hand, u, col, skin, bend = 1) {
  const dx = hand[0] - sh[0], dy = hand[1] - sh[1], d = Math.hypot(dx, dy) || 1, L = 3.7 * u;
  const sag = Math.sqrt(Math.max(0, (L / 2) ** 2 - (Math.min(d, L * .98) / 2) ** 2)) * bend;
  const mid = [(sh[0] + hand[0]) / 2 - dy / d * sag, (sh[1] + hand[1]) / 2 + dx / d * sag];
  const P = [sh, mid, hand];
  paint(ribbon(P, .82 * u, .62 * u), { wash: col, ink: PAL.ink, sw: u * .016 });
  paint(ellPts(hand[0], hand[1], .42 * u, .4 * u, 14), { wash: skin, ink: PAL.ink, sw: u * .014 });
}

/**
 * person(x, y, u, look, o): o = { flip, dx, dy, sq, lean, sit, hN, hF, legN, legF, eyes, mouth, br, lookX, lookY, squint,
 * blush, gloom, emote, emoteK, emoteAge, headTilt, scarfSway, mid(u) callback drawn before the near arm, key }
 */
function person(x, y, u, look, o = {}) {
  const key = o.key || 'p';
  const flip = o.flip ? -1 : 1, sq = o.sq || 0;
  const hip = -2.3 * u;
  push();
  translate(x + (o.dx || 0) * u, y + (o.dy || 0) * u);
  scale(flip * (1 + sq * .5), 1 - sq);
  translate(0, hip); rotate(o.lean || 0); translate(0, -hip);
  const sit = o.sit || 0;
  // legs
  boilSeed(key + 'legs');
  const legs = [
    { hip: [-.45 * u, hip], foot: o.legF || [lerp(-.55, 1.5, sit) * u, 0], knee: [lerp(-.5, 1.6, sit) * u, lerp(-1.1, -2.5, sit) * u], col: mixCol(look.outfitDk, PAL.ink, .25) },
    { hip: [.45 * u, hip], foot: o.legN || [lerp(.6, 2.3, sit) * u, 0], knee: [lerp(.55, 2.25, sit) * u, lerp(-1.1, -2.6, sit) * u], col: look.outfitDk },
  ];
  for (const L of legs) {
    paint(ribbon([L.hip, L.knee, L.foot], .85 * u, .7 * u), { wash: L.col, ink: PAL.ink, sw: u * .016 });
    paint(ellPts(L.foot[0] + .3 * u, L.foot[1] - .12 * u, .55 * u, .26 * u, 14), { wash: PAL.ink, ink: null });
  }
  const sh = [[-1.25 * u, -6.35 * u], [1.25 * u, -6.35 * u]];
  // scarf tail behind the body (follow-through)
  if (look.scarf) {
    boilSeed(key + 'scarfB');
    const sw = o.scarfSway || 0;
    paint(ribbon([[-1.1 * u, -6.4 * u], [-2.0 * u - sw * .5 * u, -5.4 * u], [-2.5 * u - sw * u, -4.1 * u]], .9 * u, .55 * u), { wash: mixCol(look.scarf, PAL.goldDk, .35), ink: PAL.ink, sw: u * .014 });
  }
  // far arm (behind)
  boilSeed(key + 'armF');
  arm(sh[0], o.hF || [-1.6 * u, -2.9 * u], u, mixCol(look.outfit, PAL.ink, .22), mixCol(look.skin, PAL.ink, .15));
  // body (kurta)
  boilSeed(key + 'body');
  const B = [[-1.25, -6.75], [0, -6.95], [1.25, -6.75], [1.75, -5.7], [2.05, -3.6], [2.35, -1.55], [0, -1.3], [-2.35, -1.55], [-2.05, -3.6], [-1.75, -5.7]].map(([a, b]) => [a * u, b * u]);
  paint(B, { wash: look.outfit, ink: PAL.ink, sw: u * .02, curv: .5 });
  inkLine([[-2.2 * u, -1.75 * u], [0, -1.5 * u], [2.2 * u, -1.75 * u]], u * .03, look.trim, 'dry', .5);
  inkLine([[.15 * u, -6.85 * u], [.2 * u, -5.2 * u]], u * .012, mixCol(look.outfit, PAL.ink, .5));
  if (look.scarf) { boilSeed(key + 'scarfF'); paint(ribbon([[-1.2 * u, -6.65 * u], [.2 * u, -5.0 * u], [1.75 * u, -3.4 * u]], .8 * u, .7 * u), { wash: look.scarf, ink: PAL.ink, sw: u * .014 }); }
  // head
  const tilt = o.headTilt || 0;
  const hc = [.1 * u + Math.sin(tilt) * 2.2 * u, -9.0 * u + (1 - Math.cos(tilt)) * u];
  boilSeed(key + 'head');
  if (look.hair === 'bun') paint(ellPts(hc[0] - 1.75 * u, hc[1] - 1.45 * u, .9 * u, .85 * u, 18), { wash: look.hair === 'bun' ? PAL.hair : PAL.hair, ink: PAL.ink, sw: u * .014 });
  paint(ellPts(hc[0], hc[1], 2.15 * u, 2.1 * u, 30), { wash: look.skin, ink: PAL.ink, sw: u * .02 });
  // hair cap
  const R = 2.18 * u, cap = [];
  const a0 = look.hair === 'bun' ? 196 : 188, a1 = look.hair === 'bun' ? 340 : 348;
  for (let a = a0; a <= a1; a += 12) cap.push([hc[0] + Math.cos(a * Math.PI / 180) * R, hc[1] + Math.sin(a * Math.PI / 180) * R]);
  const line = look.hair === 'bun'
    ? [[hc[0] + 1.75 * u, hc[1] - 1.0 * u], [hc[0] + .6 * u, hc[1] - 1.25 * u], [hc[0] - .6 * u, hc[1] - 1.05 * u], [hc[0] - 1.9 * u, hc[1] - .45 * u]]
    : [[hc[0] + 1.95 * u, hc[1] - .55 * u], [hc[0] + 1.0 * u, hc[1] - 1.35 * u], [hc[0] - .2 * u, hc[1] - .95 * u], [hc[0] - 2.0 * u, hc[1] - .2 * u]];
  paint(through([...cap, ...line], 3), { wash: PAL.hair, ink: PAL.ink, sw: u * .016 });
  // face (3/4: shifted toward the heading)
  const fx = hc[0] + .35 * u, fy = hc[1] + .25 * u, lx = o.lookX || 0, ly = o.lookY || 0, br = o.br || [0, 0];
  boilSeed(key + 'face');
  if (o.gloom) for (let k = 0; k < 3; k++) inkLine([[fx - .7 * u + k * .55 * u, hc[1] - 1.0 * u], [fx - .7 * u + k * .55 * u, hc[1] - (1.0 - .45 * o.gloom) * u + .2 * u]], u * .012, PAL.inkSoft);
  if (o.blush) for (const s of [-1, 1]) paint(ellPts(fx + s * 1.25 * u, fy + .6 * u, .42 * u, .22 * u, 12), { wash: PAL.rose, washOp: 120 * o.blush, ink: null });
  for (const s of [-1, 1]) {
    const ex = fx + s * .75 * u, ey = fy - .25 * u;
    eye(o.eyes || 'normal', ex, ey, u, o.squint || 0, s, lx, ly);
    const by = ey - .62 * u - br[0] * .22 * u, inner = by - br[1] * .18 * u, outer = by + br[1] * .1 * u;
    inkLine([[ex - s * .32 * u, outer], [ex + s * .2 * u, inner]], u * .016);
  }
  mouthAt(o.mouth || 'smile0', fx + lx * .12 * u, fy + .95 * u, u);
  if (o.mid) o.mid(u);
  // near arm (in front)
  boilSeed(key + 'armN');
  arm(sh[1], o.hN || [1.7 * u, -2.9 * u], u, look.outfit, look.skin);
  if (o.front) o.front(u);
  pop();
  // emote in world space (never mirrored)
  if (o.emote && (o.emoteK ?? 1) > .01) {
    const ex = x + (o.dx || 0) * u + flip * (hc[0] + 2.4 * u), ey = y + (o.dy || 0) * u + (hc[1] - 2.3 * u) * (1 - sq);
    emote(o.emote, ex, ey, u, o.emoteK ?? 1, o.emoteAge || 0, key);
  }
  boilSeed(key + 'after');
}

// ---------- emotes (painted marks, never letters) ----------
function emote(kind, x, y, u, k, age, key = 'e') {
  boilSeed(key + 'emote' + kind);
  const s = u * backOut(k);
  if (s < 1) return;
  switch (kind) {
    case '!':
      paint(ribbon([[x, y - 1.3 * s], [x + .05 * s, y - .1 * s]], .55 * s, .25 * s), { wash: PAL.gold, ink: PAL.ink, sw: u * .016 });
      paint(ellPts(x + .07 * s, y + .45 * s, .22 * s, .22 * s, 12), { wash: PAL.gold, ink: PAL.ink, sw: u * .014 });
      break;
    case '?':
      paint(ribbon([[x - .45 * s, y - .9 * s], [x, y - 1.35 * s], [x + .45 * s, y - .9 * s], [x + .05 * s, y - .35 * s], [x, y - .05 * s]], .32 * s, .26 * s), { wash: PAL.cream, ink: PAL.ink, sw: u * .016 });
      paint(ellPts(x, y + .38 * s, .18 * s, .18 * s, 12), { wash: PAL.cream, ink: PAL.ink, sw: u * .014 });
      break;
    case 'sweat':
      paint([[x - .1 * s, y - .5 * s + age * .2 * u], [x + .25 * s, y + .15 * s + age * .2 * u], [x, y + .35 * s + age * .2 * u], [x - .3 * s, y + .12 * s + age * .2 * u]], { wash: PAL.drop, ink: PAL.ink, sw: u * .012, curv: .6 });
      break;
    case 'cloud': {
      const cx = x - 1.6 * u, cy = y - .4 * u + Math.sin(age * 3) * .1 * u;
      for (let i = 0; i < 4; i++) {
        const yy = cy + .6 * s + ((age * 2.2 + i * .27) % 1) * 1.2 * s;
        inkLine([[cx - .6 * s + i * .4 * s, yy], [cx - .65 * s + i * .4 * s, yy + .3 * s]], u * .014, PAL.drop, 'inkfine');
      }
      paint(through([[cx - 1.2 * s, cy + .4 * s], [cx - 1.1 * s, cy - .2 * s], [cx - .4 * s, cy - .6 * s], [cx + .4 * s, cy - .5 * s], [cx + 1.1 * s, cy - .1 * s], [cx + 1.2 * s, cy + .4 * s]], 4), { wash: '#93A7A0', ink: PAL.ink, sw: u * .016 });
      break;
    }
    case 'hearts':
      for (let i = 0; i < 3; i++) {
        const a = (age * .9 + i / 3) % 1, hx = x - .3 * u + Math.sin(a * 6 + i) * .4 * u + i * .5 * u, hy = y - a * 2.2 * u;
        paint(heartPts(hx, hy, (.3 + .15 * (1 - a)) * s), { wash: PAL.rose, washOp: 255 * (1 - a * .5), ink: PAL.ink, sw: u * .012 });
      }
      break;
    case 'sparkle':
      for (let i = 0; i < 3; i++) {
        const tw = .5 + .5 * Math.sin(age * 9 + i * 2.1);
        paint(starPts(x + [-.4, .5, .1][i] * u, y + [-.2, -.8, .6][i] * u, (.25 + .2 * tw) * s, .3), { wash: PAL.gold, ink: PAL.ink, sw: u * .01 });
      }
      break;
    case 'dots':
      for (let i = 0; i < 3; i++) if (age > i * .18) paint(ellPts(x - .5 * u + i * .5 * u, y, .13 * s, .13 * s, 10), { wash: PAL.ink, ink: null });
      break;
  }
}

// ---------- props ----------
/** Kick wheel: flywheel near the ground, shaft, wheel-head. o = { wob, phase, broke, kind:'old'|'new', spin, bloom } */
function wheel(x, y, u, o = {}) {
  const old = o.kind !== 'new';
  const wood = old ? '#9C7752' : PAL.green, woodDk = old ? '#6F5236' : PAL.greenDk, top = old ? '#B99266' : '#D9C3A0';
  const broke = o.broke || 0;
  const wb = (o.wob || 0) * Math.sin((o.phase || 0) * TAU);
  const headX = x + wb * .35 * u + broke * .9 * u, headY = y - 4.25 * u + broke * 1.0 * u;
  const tilt = wb * .1 + broke * .42;
  boilSeed('wheel' + (o.kind || 'old') + 'base');
  // flywheel
  paint(ellPts(x, y - .55 * u, 2.7 * u, .55 * u, 26), { wash: woodDk, ink: PAL.ink, sw: u * .02 });
  paint(ellPts(x, y - .75 * u, 2.7 * u, .55 * u, 26), { wash: wood, ink: PAL.ink, sw: u * .02 });
  // shaft
  const shaftTop = [lerp(x, headX, .8), headY + .3 * u];
  paint(ribbon([[x, y - .8 * u], [lerp(x, shaftTop[0], .5), lerp(y - .8 * u, shaftTop[1], .5)], shaftTop], .6 * u, .5 * u), { wash: woodDk, ink: PAL.ink, sw: u * .018 });
  if (!old) inkLine([[x - 2.2 * u, y - .75 * u], [x + 2.2 * u, y - .75 * u]], u * .03, PAL.gold, 'dry', .3);
  // head (a disc seen from slightly above), with clay on it drawn by the caller
  boilSeed('wheel' + (o.kind || 'old') + 'head');
  push(); translate(headX, headY); rotate(tilt);
  paint(ellPts(0, .35 * u, 3.0 * u, .7 * u, 28), { wash: woodDk, ink: PAL.ink, sw: u * .02 });
  paint(ellPts(0, 0, 3.0 * u, .7 * u, 28), { wash: top, ink: PAL.ink, sw: u * .02 });
  if (!old) paint(ellPts(0, 0, 3.0 * u, .7 * u, 28), { ink: PAL.gold, sw: u * .03 });
  if (old) { inkLine([[-1.5 * u, -.1 * u], [-.4 * u, .15 * u], [.5 * u, -.05 * u]], u * .012, PAL.inkSoft); if (broke > .3) inkLine([[.6 * u, -.4 * u], [1.0 * u, .1 * u], [1.4 * u, .4 * u], [1.3 * u, .9 * u]], u * .02); }
  // spin streaks
  if (o.spin) {
    const ph = o.spinPhase || 0;
    for (let i = 0; i < 3; i++) {
      const a0 = ph * TAU + i * TAU / 3, P = [];
      for (let k = 0; k <= 6; k++) { const a = a0 + k * .16; P.push([Math.cos(a) * 2.55 * u, Math.sin(a) * .58 * u]); }
      if (P.some(p => p[1] > 0)) inkLine(P.filter(p => p[1] > -.05 * u), u * .014 * o.spin, PAL.inkSoft, 'inkfine');
    }
  }
  pop();
  return { headX, headY, tilt };
}

/** Clay on the wheel: m = 0 lump → 1 pot. Base at (cx, by). */
function clay(cx, by, u, m, o = {}) {
  boilSeed('clay' + (o.key || ''));
  const prof = [ // [height, radius] from base to lip, lump vs pot
    [[0, 1.3], [.5, 1.45], [1.0, 1.25], [1.4, .7], [1.55, 0]],
    [[0, .9], [.9, 1.55], [1.8, 1.25], [2.5, .7], [2.85, .95]],
  ];
  const P = prof[0].map((p, i) => [lerp(p[0], prof[1][i][0], m), lerp(p[1], prof[1][i][1], m)]);
  const wob = o.wobble || 0;
  const R = P.map(([h, r], i) => [cx + r * u + wob * Math.sin(i * 1.7 + (o.ph || 0)) * .15 * u, by - h * u]);
  const L = P.slice().reverse().map(([h, r], i) => [cx - r * u + wob * Math.sin(i * 2.3 + (o.ph || 0)) * .15 * u, by - h * u]);
  const shape = m > .6 ? [...R.slice(0, -1), [cx + P[4][1] * u, by - P[4][0] * u], [cx - P[4][1] * u, by - P[4][0] * u], ...L.slice(1)] : [...R, ...L];
  paint(through([...shape, shape[0]], 3).slice(0, -1), { wash: PAL.clay, ink: PAL.ink, sw: u * .02 });
  if (m > .6) paint(ellPts(cx, by - P[4][0] * u, P[4][1] * u, .2 * u, 16), { wash: PAL.clayDk, ink: PAL.ink, sw: u * .014 });
  inkLine([[cx + .35 * u, by - .25 * u], [cx + .5 * u, by - P[2][0] * u]], u * .03, PAL.clayLt, 'dry', .5);
  if (o.spin) for (let i = 0; i < 2; i++) { const yy = by - (.5 + i * .9 + (o.ph || 0) % .9) * u * (.6 + m * .5); inkLine([[cx - .8 * u, yy], [cx, yy + .12 * u], [cx + .8 * u, yy]], u * .01, PAL.clayDk, 'inkfine'); }
}
/** Flattened clay splat on the ground. */
function splat(cx, cy, u, k) {
  boilSeed('splat');
  const P = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = (1 + .35 * hash(i * 3.3)) * u * lerp(.8, 1.35, k); P.push([cx + Math.cos(a) * r * 1.1, cy + Math.sin(a) * r * .38]); }
  paint(P, { wash: PAL.clay, ink: PAL.ink, sw: u * .018, curv: .5 });
}

/** Green verified seal with a cream tick. k: 0..1 pop. */
function seal(x, y, r, k = 1) {
  if (k <= .01) return;
  const s = r * k;
  boilSeed('seal' + Math.round(x));
  paint(starPts(x, y, s * 1.25, .82, 12, 0), { wash: PAL.gold, ink: PAL.ink, sw: r * .02 });
  paint(ellPts(x, y, s, s, 24), { wash: PAL.green, ink: PAL.ink, sw: r * .025 });
  inkLine([[x - .45 * s, y + .02 * s], [x - .1 * s, y + .38 * s], [x + .5 * s, y - .4 * s]], r * .05, PAL.cream, 'ink', .2);
}

/** The Aarambh gold star (from the icon), with light. */
function goldStar(x, y, r, rot = 0, a = 1) {
  glow(x, y, r * 3.2, PAL.lamp, .55 * a);
  boilSeed('star' + Math.round(r));
  push(); translate(x, y); rotate(rot);
  paint(starPts(0, 0, r, .3), { wash: PAL.gold, ink: PAL.ink, sw: r * .035 });
  paint(starPts(-r * .08, -r * .1, r * .45, .3), { wash: PAL.goldLt, ink: null });
  pop();
}

/** Stylized phone (no words on the screen). screen(sx, sy, sw, sh) paints inside. */
function phone(cx, cy, w, h, rot, screen) {
  boilSeed('phone');
  push(); translate(cx, cy); rotate(rot);
  paint(rrPts(-w / 2, -h / 2, w, h, w * .16), { wash: '#16302A', ink: PAL.ink, sw: w * .006 });
  const sw = w * .88, sh = h * .9;
  paint(rrPts(-sw / 2, -sh / 2, sw, sh, w * .1), { wash: '#F2E7CF', ink: null });
  if (screen) screen(-sw / 2, -sh / 2, sw, sh);
  paint(rrPts(-w * .12, -h / 2 + h * .025, w * .24, h * .022, h * .01), { wash: PAL.ink, ink: null });
  pop();
}

function stool(x, y, u) {
  boilSeed('stool');
  paint(rrPts(x - 1.6 * u, y - 2.35 * u, 3.2 * u, .55 * u, .25 * u), { wash: '#A47B52', ink: PAL.ink, sw: u * .02 });
  inkLine([[x - 1.2 * u, y - 1.85 * u], [x - 1.4 * u, y]], u * .05, '#6F5236');
  inkLine([[x + 1.2 * u, y - 1.85 * u], [x + 1.4 * u, y]], u * .05, '#6F5236');
}
