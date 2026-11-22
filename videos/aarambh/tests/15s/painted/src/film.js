// film.js — Aarambh 15 s painted test. Shots A–E (see ../STORYBOARD.md). Every frame is a pure function of t.
(() => {
  const G = 1460, U = 58;            // yard ground line and the potter's size unit (medium shot)
  const POT_X = 330, WHEEL_X = 660;  // potter on her stool, the wheel in front of her
  const SPLAT = [520, 1497];         // where the flung clay lands (paid off in shot D)
  const PH = { x: 650, y: 1120, w: 250, h: 444 };          // phone on the balcony
  const SCR = { w: PH.w * .88, h: PH.h * .9 };             // its screen
  const SUP = { x: 400, y: 1650, u: 64 };                  // supporter

  // ---------------------------------------------------------------- worlds
  function yardSky(t) {
    boilSeed('sky');
    paint(rectPts(-500, -1700, 2080, 820), { wash: PAL.dusk, ink: null });
    paint(rectPts(-500, -900, 2080, 700), { wash: mixCol(PAL.dusk, PAL.duskLt, .7), ink: null });
    paint(rectPts(-500, -240, 2080, 640), { wash: '#7FA392', ink: null });
    paint(rectPts(-500, 380, 2080, 900), { wash: '#F2E2C2', ink: null });
    paint(rectPts(-500, 200, 2080, 260), { fill: '#C9D8C0', fillOp: 150, bleed: .25, tex: .5, ink: null });
    paint(rectPts(-500, -420, 2080, 280), { fill: '#4E7A68', fillOp: 140, bleed: .25, tex: .5, ink: null });
    for (let i = 0; i < 14; i++) {        // last of the night stars, high up
      const x = -300 + hash(i * 7.1) * 1700, y = -1600 + hash(i * 3.3) * 900, tw = .6 + .4 * Math.sin(t * 5 + i);
      boilSeed('nstar' + i); paint(starPts(x, y, 9 * tw + 4, .35), { wash: PAL.goldLt, ink: null });
    }
    for (let i = 0; i < 5; i++) {         // clouds drifting
      const y = -1200 + i * 330, x = ((hash(i * 9.2) * 1800 - t * (30 + i * 12)) % 1900 + 1900) % 1900 - 400;
      boilSeed('cloud' + i);
      paint(through([[x - 220, y + 40], [x - 160, y - 40], [x - 40, y - 80], [x + 90, y - 60], [x + 200, y - 10], [x + 230, y + 40]], 4),
        { fill: i < 2 ? '#6E9483' : '#E9E1CC', fillOp: 170, bleed: .2, tex: .6, ink: null });
    }
  }
  function yard(t, o = {}) {
    yardSky(t);
    // low dawn sun
    glow(210, 1010, 330, '#F7CF84', .55);
    boilSeed('sun'); paint(ellPts(210, 1010, 92, 92, 30), { wash: '#F6D58E', ink: null });
    // hills
    boilSeed('hills');
    paint(through([[-300, 1240], [-100, 1090], [180, 1050], [420, 1120], [700, 1040], [980, 1080], [1300, 1180], [1300, 1300], [-300, 1300]], 4), { wash: PAL.sage, ink: PAL.inkSoft, sw: .5 });
    paint(through([[-300, 1250], [60, 1150], [380, 1180], [640, 1130], [900, 1170], [1300, 1150], [1300, 1320], [-300, 1320]], 4), { wash: PAL.greenMid, ink: PAL.ink, sw: .6 });
    // neem tree
    boilSeed('tree');
    paint(ribbon([[70, 1240], [60, 1000], [90, 820]], 60, 34), { wash: '#6F5236', ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 4; i++) {
      boilSeed('leaf' + i);
      const cx = [40, 160, 0, 120][i], cy = [760, 800, 860, 680][i], r = [150, 120, 120, 120][i];
      paint(ellPts(cx + wob(t, .4, i * .3) * 4, cy, r, r * .8, 22, 4), { wash: i % 2 ? PAL.green : PAL.greenMid, ink: PAL.ink, sw: .7 });
    }
    // hut
    boilSeed('hut');
    paint(rectPts(780, 1000, 340, 300, 3), { wash: '#E6D3AE', ink: PAL.ink, sw: .9 });
    paint([[740, 1020], [960, 860], [1180, 1020]], { wash: '#B08A55', ink: PAL.ink, sw: 1, hatch: { d: 26, a: 1.1, b: 'HB', c: '#7A5A33', w: .8 } });
    paint(rrPts(860, 1110, 120, 190, 50), { wash: PAL.green, ink: PAL.ink, sw: .9 });
    // ground
    boilSeed('ground');
    paint(rectPts(-400, 1290, 1880, 900), { wash: PAL.earth, ink: null });
    paint(rectPts(-400, 1290, 1880, 70), { fill: PAL.earthDk, fillOp: 140, bleed: .2, tex: .6, ink: null });
    for (let i = 0; i < 9; i++) { boilSeed('peb' + i); const x = hash(i * 4.4) * 1080, y = 1530 + hash(i * 2.2) * 330; paint(ellPts(x, y, 16 + 10 * hash(i), 7, 10), { wash: PAL.earthDk, ink: null }); }
    // finished pots by the hut (it's a potter's yard)
    for (let i = 0; i < 3; i++) clay([915, 1010, 965][i], [1455, 1462, 1330][i], [32, 30, 28][i], 1, { key: 'shelf' + i });
  }

  function balconyBG(t, hole) {
    boilSeed('bsky');
    if (hole) irisShape(rectPts(PH.x - SCR.w / 2, PH.y - SCR.h / 2, SCR.w, SCR.h), PAL.dusk);
    else {
      paint(rectPts(-200, -200, 1480, 1300), { wash: PAL.dusk, ink: null });
      paint(rectPts(-200, 800, 1480, 700), { wash: PAL.duskLt, ink: null });
      paint(rectPts(-200, 760, 1480, 260), { fill: '#C98F55', fillOp: 90, bleed: .3, tex: .5, ink: null });
    }
    for (let i = 0; i < 16; i++) {
      const x = 40 + hash(i * 5.7) * 1000, y = 120 + hash(i * 1.9) * 620, tw = .5 + .5 * Math.sin(t * 4 + i * 1.3);
      if (hole && Math.abs(x - PH.x) < SCR.w / 2 + 30 && Math.abs(y - PH.y) < SCR.h / 2 + 30) continue;
      boilSeed('bst' + i); paint(starPts(x, y, 7 + 6 * tw, .35), { wash: PAL.goldLt, ink: null });
    }
    boilSeed('moon'); paint(ellPts(880, 300, 62, 62, 24), { wash: PAL.cream, ink: PAL.ink, sw: .6 }); paint(ellPts(910, 285, 56, 56, 24), { wash: PAL.dusk, ink: null });
    // town: two clusters that leave the phone clear
    const town = [[-40, 1000, 200, 400], [140, 1080, 170, 320], [280, 960, 160, 440], [800, 1010, 150, 390], [930, 940, 190, 460]];
    town.forEach(([x, y, w, h], i) => {
      boilSeed('town' + i);
      paint(rectPts(x, y, w, h, 2), { wash: i % 2 ? PAL.duskDk : '#0E3229', ink: PAL.ink, sw: .6 });
      for (let k = 0; k < 2; k++) {
        const wx = x + 30 + k * (w - 90), wy = y + 60 + (i % 2) * 70;
        glow(wx + 15, wy + 20, 70, PAL.lamp, .35);
        paint(rectPts(wx, wy, 30, 40, 1), { wash: PAL.lamp, ink: PAL.ink, sw: .5 });
      }
    });
    // string lights
    const L = []; for (let k = 0; k <= 10; k++) { const x = -40 + k * 116; L.push([x, 540 + Math.sin(k / 10 * Math.PI) * 70]); }
    boilSeed('wire'); inkLine(L, .7, PAL.ink, 'inkfine', .6);
    L.forEach(([x, y], k) => { if (k % 2) return; glow(x, y + 18, 60, PAL.lamp, .5 + .3 * Math.sin(t * 3 + k)); boilSeed('bulb' + k); paint(ellPts(x, y + 18, 11, 14, 10), { wash: PAL.lamp, ink: PAL.ink, sw: .4 }); });
  }
  function parapet() {
    boilSeed('parapet');
    paint(rectPts(-60, 1370, 1200, 620), { wash: '#2B4C42', ink: PAL.ink, sw: .9 });
    paint(rectPts(-60, 1350, 1200, 46), { wash: PAL.creamDk, ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 6; i++) inkLine([[60 + i * 190, 1420], [60 + i * 190, 1900]], .8, '#1E3A32');
    // tulsi pot on the ledge
    boilSeed('tulsi');
    paint([[860, 1352], [990, 1352], [970, 1250], [880, 1250]], { wash: PAL.clay, ink: PAL.ink, sw: .8 });
    for (let i = 0; i < 5; i++) paint(ellPts(895 + i * 15, 1200 - (i % 2) * 30, 26, 44, 12, 2, (i - 2) * .3), { wash: i % 2 ? PAL.greenMid : PAL.sage, ink: PAL.ink, sw: .5 });
  }

  /** Painted UI inside the phone: a wheel, the verified seal, a gold star to tap. No words. */
  const phoneUI = (t, tapAt) => (x, y, w, h) => {
    boilSeed('ui');
    paint(rrPts(x + w * .08, y + h * .08, w * .84, h * .52, 14), { wash: PAL.mist, ink: PAL.inkSoft, sw: .4 });
    wheel(x + w * .5, y + h * .52, 15, { kind: 'new' });
    seal(x + w * .78, y + h * .17, 22, backOut(seg(t, 4.2, 4.45)));
    for (let k = 0; k < 2; k++) paint(rrPts(x + w * .14, y + h * (.66 + k * .06), w * (k ? .45 : .72), h * .025, 4), { wash: PAL.inkSoft, washOp: 120, ink: null });
    const press = tapAt != null && t > tapAt - .02 && t < tapAt + .12 ? .82 : 1;
    if (tapAt == null || t < tapAt + .02) goldStar(x + w * .5, y + h * .86, 30 * press * (1 + .08 * pulse(t, 5)), 0, .8);
    if (tapAt != null && t > tapAt && t < tapAt + .35) { const k = seg(t, tapAt, tapAt + .35); paint(ellPts(x + w * .5, y + h * .86, 30 + 90 * k, 30 + 90 * k, 24), { ink: PAL.gold, sw: 1.5 * (1 - k) }); }
  };

  function smear(k, up = true) {
    if (k <= 0) return;
    for (let i = 0; i < 9; i++) {
      boilSeed('smear' + i);
      const x = 40 + i * 125 + hash(i) * 40, len = 900 + 600 * k;
      const y0 = up ? 960 - len / 2 + (hash(i * 3) - .5) * 400 : 0;
      paint(ribbon([[x, y0], [x + 10, y0 + len]], 90 * k + 30, 20), { wash: i % 3 ? '#9DB8A6' : PAL.goldLt, washOp: 200 * k, ink: null });
    }
  }

  function caption(lines, t, a, b, y0) {
    const k = backOut(seg(t, a, a + .25)) * (1 - ease(seg(t, b - .2, b)));
    if (k <= .01) return;
    const hgt = 70 + 82 * lines.length, w = 860;
    boilSeed('cap' + a);
    push(); translate(540, y0 + hgt / 2); scale(k); translate(-540, -(y0 + hgt / 2));
    paint(rrPts(540 - w / 2, y0, w, hgt, 34, 3), { wash: PAL.cream, ink: PAL.ink, sw: 1.1 });
    pop();
    lines.forEach((s, i) => letter(s, 540, y0 + 76 + i * 82, 66, PAL.green, { pop: seg(t, a + .05 + i * .08, a + .3 + i * .08) * 1, alpha: k, shadow: false, screen: true }));
  }

  // ------------------------------------------------------------ characters in the yard
  function potter(t, pose) { person(POT_X, G, U, LOOKS.potter, { sit: 1, key: 'potter', scarfSway: wob(t, .9) * .4 + (pose.scarfKick || 0), ...pose }); }

  // ---------------------------------------------------------------- A · the wheel breaks
  function shotA(t, lt, dur) {
    const clunk = 1.1, sh = t > clunk ? shakeXY(t, 16 * Math.exp(-(t - clunk) * 7)) : [0, 0];
    const tiltUp = 140 * ease(seg(t, 2.35, 2.75)) + 900 * easeIn(seg(t, 2.72, 2.95));
    camBegin(540 + sh[0], 1000 - tiltUp + sh[1], 1 + .04 * seg(t, 0, 2.95));
    yard(t);
    const wobA = kf(t, [[0, .55], [1.05, 1.25]]), phase = t * 1.7;
    const broke = t < clunk ? 0 : easeOut(seg(t, clunk, clunk + .12)) + spring(t, clunk + .12, 7, 22) * .08;
    const mood = emotions(t, [[0, 'determined'], [1.12, 'surprised'], [1.62, 'sad'], [2.22, 'curious']]);
    const wx = WHEEL_X;
    // where the head is, to hold the clay
    const wb = wobA * Math.sin(phase * TAU) * (t < clunk ? 1 : 0);
    const headX = wx + wb * .35 * U + broke * .9 * U, headY = G - 4.25 * U + broke * 1.0 * U;
    // potter: pushing → hands fly up → slump → hand to chin, looks up
    const lagX = wobA * Math.sin((phase - .08) * TAU) * .35 * U;
    const hN = kf(t, [[0, [(wx - 1.15 * U + lagX - POT_X) / U, -4.75]], [1.1, [(wx - 1.15 * U + lagX - POT_X) / U, -4.75]], [1.3, [2.8, -9.4], easeOut], [1.62, [2.8, -9.0]], [1.95, [2.5, -3.2]], [2.22, [2.5, -3.2]], [2.5, [2.1, -7.4]]]);
    const hF = kf(t, [[0, [(wx - 1.3 * U + lagX - POT_X) / U + .4, -5.4]], [1.1, [(wx - 1.3 * U + lagX - POT_X) / U + .4, -5.4]], [1.3, [-.6, -9.0], easeOut], [1.62, [-.4, -8.6]], [1.95, [1.8, -3.1]]]);
    const lean = kf(t, [[0, .13], [1.1, .15], [1.25, -.16, easeOut], [1.62, -.1], [1.95, .12], [2.22, .1], [2.5, -.06]]);
    potter(t, { ...mood, hN: hN.map(v => v * U), hF: hF.map(v => v * U), lean: lean + (t < clunk ? wb * .03 : 0), headTilt: kf(t, [[1.62, 0], [1.95, .12], [2.22, .12], [2.5, -.12]]), scarfKick: spring(t, clunk, 4, 14) * 1.5 });
    wheel(wx, G, U, { kind: 'old', wob: t < clunk ? wobA : 0, phase, broke });
    // clay: lurching on the head, then flung and splatted
    if (t < clunk) clay(headX - wb * .25 * U, headY + .05 * U, U, 0, { wobble: wobA, ph: phase * 6, key: 'lump' });
    else if (t < 1.36) {
      const k = seg(t, clunk, 1.36), p = arcPt([headX, headY - .4 * U], SPLAT, 260, k);
      push(); translate(p[0], p[1]); rotate(-k * 4); clay(0, .6 * U, U * .85, 0, { key: 'fly' }); pop();
    } else splat(SPLAT[0], SPLAT[1], U * .9, easeOut(seg(t, 1.36, 1.5)) + spring(t, 1.36, 8, 25) * .2);
    if (t > clunk && t < 1.6) for (let i = 0; i < 4; i++) {   // dust puffs from the clunk
      const k = seg(t, clunk, 1.6); boilSeed('dust' + i);
      paint(ellPts(wx + (i - 1.5) * 90 * (1 + k), G - 40 - k * 60 - i * 8, 40 + 50 * k, 26 + 30 * k, 14), { fill: PAL.earthDk, fillOp: 160 * (1 - k), bleed: .3, tex: .4, ink: null });
    }
    // a gold glint in the sky (leads her eye, and ours, upward)
    if (t > 2.05) { const k = backOut(seg(t, 2.05, 2.3)); goldStar(840, 470, 26 * k * (1 + .25 * Math.sin(t * 14)), t * 2, k); }
    camEnd();
    if (lt < .38) { const sc = toScreen(WHEEL_X, G - 4 * U, LAST_CAM); iris(sc[0], sc[1], lerp(330, 1700, easeIn(lt / .38))); }
    smear(seg(t, 2.72, 2.95));
  }

  // ---------------------------------------------------------------- B · far away, someone funds it
  function shotB(t, lt, dur) {
    const arrive = 700 * (1 - easeOut(seg(lt, 0, .32)));
    const push_ = ease(seg(t, 3.4, 4.3)), follow = ease(seg(t, 5.4, 5.95));
    camBegin(lerp(540, 600, push_), lerp(960, 1060, push_) + arrive - 520 * follow, lerp(1, 1.16, push_) - .1 * follow);
    balconyBG(t, false);
    const tap = 5.3;
    const mood = emotions(t, [[2.95, 'thinking'], [4.35, 'determined', { lookX: .9, lookY: .5 }], [5.32, 'love']]);
    const hN = kf(t, [[2.95, [2.2, -3.4]], [4.4, [2.2, -3.4]], [4.75, [3.0, -6.6]], [5.12, [2.6, -7.2]], [tap, [3.9, -5.6], easeIn], [5.45, [3.3, -6.4]], [5.8, [2.4, -3.6]]]);
    const S = SUP.u;
    person(SUP.x, SUP.y, S, LOOKS.supporter, {
      ...mood, key: 'sup', lookX: t < 4.35 ? .8 : mood.lookX, lookY: t < 4.35 ? .5 : mood.lookY,
      hF: [(PH.x - PH.w * .42 - SUP.x), (PH.y + PH.h * .28 - SUP.y)], hN: hN.map(v => v * S), scarfSway: wob(t, .7) * .3,
      mid: () => phone(PH.x - SUP.x, PH.y - SUP.y, PH.w, PH.h, -.05 + spring(t, tap, 6, 20) * .03, phoneUI(t, tap)),
    });
    parapet();
    // the star leaves the phone
    if (t > tap) {
      const k = seg(t, tap, 5.95), p = arcPt([PH.x + 5, PH.y + PH.h * .34], [980, 260], 260, easeIn(k) * .6 + k * .4);
      goldStar(p[0], p[1], lerp(30, 64, backOut(seg(t, tap, tap + .3))), t * 5, 1);
      for (let i = 1; i < 5; i++) { const q = arcPt([PH.x + 5, PH.y + PH.h * .34], [980, 260], 260, Math.max(0, easeIn(k - i * .04) * .6 + (k - i * .04) * .4)); boilSeed('trail' + i); paint(starPts(q[0], q[1], 22 - i * 4, .3), { wash: PAL.gold, washOp: 200 - i * 40, ink: null }); }
    }
    camEnd();
    smear(1 - seg(lt, 0, .3), true);
    caption(['Fund a verified', 'livelihood tool'], t, 3.35, 5.6, 1560);
  }

  // ---------------------------------------------------------------- C · the star flies to her and becomes a wheel
  const starPath = t => kf(t, [[5.95, [-260, -1080]], [6.9, [700, -900]], [7.25, [880, -480]], [7.7, [WHEEL_X, G - 4.3 * U], easeIn]]);
  function shotC(t, lt, dur) {
    const land = 7.7, sh = t > land ? shakeXY(t, 18 * Math.exp(-(t - land) * 6)) : [0, 0];
    const cx = kf(t, [[5.95, 260], [6.9, 640], [7.55, 540]]), cy = kf(t, [[5.95, -930], [6.9, -800], [7.25, -360], [7.62, 1000]]);
    camBegin(cx + sh[0], cy + sh[1], 1);
    yard(t);
    const mood = emotions(t, [[5.95, 'curious'], [7.72, 'surprised'], [8.5, 'starstruck']]);
    const hN = kf(t, [[5.95, [2.1, -7.4]], [7.72, [2.1, -7.4]], [7.9, [3.0, -9.5], easeOut], [8.5, [2.9, -9.0]], [8.75, [1.7, -5.7]]]);
    const hF = kf(t, [[5.95, [1.8, -3.1]], [7.72, [1.8, -3.1]], [7.9, [-.6, -9.2], easeOut], [8.5, [-.4, -8.8]], [8.75, [1.2, -5.5]]]);
    const hop = t > 8.85 && t < 9.2 ? -1.0 * Math.sin(seg(t, 8.85, 9.2) * Math.PI) : 0;
    potter(t, { ...mood, hN: hN.map(v => v * U), hF: hF.map(v => v * U), dy: mood.dy + hop, lean: kf(t, [[7.7, -.06], [7.9, -.18, easeOut], [8.5, -.1], [8.75, .02]]), scarfKick: spring(t, land, 4, 14) * 1.6, lookY: t < land ? -1 : mood.lookY });
    // wheel: the old broken one until the splash, then the new one blooms
    if (t < land + .08) wheel(WHEEL_X, G, U, { kind: 'old', broke: 1 });
    else {
      const b = backOut(seg(t, land + .08, land + .45));
      push(); translate(WHEEL_X, G); scale(b, b); translate(-WHEEL_X, -G);
      wheel(WHEEL_X, G, U, { kind: 'new' });
      pop();
      const sk = t < 8.3 ? 0 : backOut(seg(t, 8.3, 8.42)), sy = t < 8.3 ? lerp(900, G - 2.4 * U, easeIn(seg(t, 8.12, 8.3))) : G - 2.4 * U;
      if (t > 8.12) seal(WHEEL_X, sy, 52, t < 8.3 ? 1 : 1 + .25 * (1 - sk) - spring(t, 8.3, 7, 24) * .2);
    }
    splat(SPLAT[0], SPLAT[1], U * .9, 1);
    // the star
    if (t < land) {
      const p = starPath(t);
      for (let i = 6; i >= 1; i--) { const q = starPath(t - i * .035); boilSeed('ctrail' + i); paint(starPts(q[0], q[1], 46 - i * 6, .3), { wash: PAL.gold, washOp: 230 - i * 32, ink: null }); }
      goldStar(p[0], p[1], 66, t * 6, 1);
    } else if (t < land + .5) {   // gold splash
      const k = seg(t, land, land + .5);
      glow(WHEEL_X, G - 4 * U, 520 * (1 - k * .5), PAL.lamp, 1 - k);
      for (let i = 0; i < 9; i++) {
        const a = i / 9 * TAU + .2, d = (80 + 260 * easeOut(k)) * (1 + .2 * hash(i)), x = WHEEL_X + Math.cos(a) * d, y = G - 4 * U + Math.sin(a) * d * .7;
        boilSeed('drop' + i); paint(ribbon([[WHEEL_X + Math.cos(a) * d * .55, G - 4 * U + Math.sin(a) * d * .38], [x, y]], 46 * (1 - k), 8), { wash: i % 2 ? PAL.gold : PAL.goldLt, ink: PAL.ink, sw: .5 * (1 - k) });
      }
    }
    camEnd();
  }

  // ---------------------------------------------------------------- D · she starts work; far away, it's seen
  function shotD(t, lt, dur) {
    const pull = ease(seg(t, 11.2, 12.1)), s = lerp(1, SCR.w / 1080, pull);
    const ctr = [lerp(540, PH.x, pull), lerp(960, PH.y, pull)];
    const slap = 10.1, spinStart = 10.12;
    push(); translate(ctr[0], ctr[1]); scale(s); translate(-540, -960);
    const sh = t > slap && t < slap + .4 ? shakeXY(t, 8 * Math.exp(-(t - slap) * 8)) : [0, 0];
    camBegin(540 + sh[0], 1000 + sh[1], 1 + .05 * seg(t, 9.45, 11.2));
    yard(t);
    // wheel spin: kicked at the slap, ramps up then steady
    const spinT = Math.max(0, t - spinStart), spinPh = spinT < .3 ? 2.2 * spinT * spinT / .6 : 2.2 * (spinT - .15);
    const spinning = t > spinStart ? clamp(spinT / .3) : 0;
    const mood = emotions(t, [[9.45, 'determined', { lookX: .6, lookY: .8 }], [10.3, 'happy'], [10.95, 'proud']]);
    const m = ease(seg(t, 10.2, 11.1));
    const potR = lerp(1.35, 1.5, m), potH = lerp(.9, 2.2, m);
    // hands: reach down to the splat, lift, slap it on the wheel, then shape the rising pot
    const hN = kf(t, [[9.45, [2.6, -3.0]], [9.8, [3.5, -1.2]], [9.9, [3.5, -1.2]], [10.02, [4.4, -5.6]], [slap, [5.0, -4.6], easeIn], [10.25, [(WHEEL_X + potR * U * .95 - POT_X) / U, -4.5]], [11.1, [(WHEEL_X + potR * U * .9 - POT_X) / U, -4.4 - potH * .8]]]);
    const hF = kf(t, [[9.45, [1.8, -3.1]], [9.8, [3.0, -1.4]], [9.9, [3.0, -1.4]], [10.02, [3.9, -5.4]], [slap, [4.4, -4.5], easeIn], [10.25, [(WHEEL_X - potR * U * .95 - POT_X) / U, -4.6]], [11.1, [(WHEEL_X - potR * U * .9 - POT_X) / U, -4.5 - potH * .8]]]);
    const lean = kf(t, [[9.45, .08], [9.8, .38], [9.9, .38], [10.05, .1], [10.3, .14]]);
    const kick = t > 10.0 && t < 10.3 ? Math.sin(seg(t, 10.0, 10.3) * Math.PI) : 0;
    potter(t, { ...mood, hN: hN.map(v => v * U), hF: hF.map(v => v * U), lean, legN: [(2.3 + 1.3 * kick) * U, -.6 * kick * U], headTilt: t < 10.05 ? .12 : .05 });
    wheel(WHEEL_X, G, U, { kind: 'new', spin: spinning, spinPhase: spinPh });
    seal(WHEEL_X, G - 2.4 * U, 52, 1);
    // the clay: splat on the ground → lump in her hands → slapped on the wheel → a pot rises
    if (t < 9.9) splat(SPLAT[0], SPLAT[1], U * .9, 1);
    else if (t < slap) {
      const k = seg(t, 9.9, slap), p = arcPt([SPLAT[0] + 40, SPLAT[1] - 30], [WHEEL_X, G - 4.3 * U], 140, ease(k));
      clay(p[0], p[1] + .3 * U, U * .8, 0, { key: 'carry' });
    } else {
      const sq = spring(t, slap, 8, 26) * .25;
      push(); translate(WHEEL_X, G - 4.25 * U); scale(1 + sq, 1 - sq); translate(-WHEEL_X, -(G - 4.25 * U));
      clay(WHEEL_X, G - 4.25 * U + .05 * U, U, m, { spin: spinning, ph: spinPh * 3, key: 'pot' });
      pop();
    }
    camEnd();
    pop();
    if (pull > 0) {   // the yard was a picture on the supporter's phone all along
      balconyBG(t, true);
      const S = SUP.u, mood2 = emotions(t, [[11.2, 'love']], { lookX: .9, lookY: .5 });
      person(SUP.x, SUP.y, S, LOOKS.supporter, { ...mood2, key: 'sup', hF: [(PH.x - PH.w * .42 - SUP.x), (PH.y + PH.h * .28 - SUP.y)], hN: [2.2 * S, -3.4 * S], scarfSway: wob(t, .7) * .3, dx: (1 - pull) * 3 });
      phoneFrame(PH.x, PH.y, PH.w, PH.h);
      parapet();
    }
    caption(['…and follow its impact'], t, 10.95, 12.25, 1600);
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, [PAL.green, PAL.greenMid], PAL.gold);
  }
  function phoneFrame(cx, cy, w, h) {
    boilSeed('pframe');
    const x0 = cx - w / 2, y0 = cy - h / 2, sx = cx - SCR.w / 2, sy = cy - SCR.h / 2, col = '#16302A';
    paint(rectPts(x0, y0, w, sy - y0), { wash: col, ink: null });
    paint(rectPts(x0, sy + SCR.h, w, y0 + h - sy - SCR.h), { wash: col, ink: null });
    paint(rectPts(x0, sy, sx - x0, SCR.h), { wash: col, ink: null });
    paint(rectPts(sx + SCR.w, sy, x0 + w - sx - SCR.w, SCR.h), { wash: col, ink: null });
    paint(rrPts(x0, y0, w, h, w * .16), { ink: PAL.ink, sw: 1 });
    paint(rectPts(sx, sy, SCR.w, SCR.h), { ink: PAL.ink, sw: .6 });
  }

  // ---------------------------------------------------------------- E · Aarambh
  function shotE(t, lt, dur) {
    camBegin(540, 960, 1 + .025 * lt);
    boilSeed('endbg');
    paint(rectPts(-100, -100, 1280, 2120), { wash: PAL.green, ink: null });
    for (let i = 0; i < 4; i++) { boilSeed('bloom' + i); paint(ellPts(hash(i * 3) * 1080, 300 + i * 420, 260, 200, 24, 6), { fill: i % 2 ? PAL.greenMid : PAL.greenDk, fillOp: 110, bleed: .3, tex: .6, ink: null }); }
    for (let i = 0; i < 12; i++) { boilSeed('fleck' + i); const tw = .5 + .5 * Math.sin(t * 4 + i * 2); paint(starPts(60 + hash(i * 8.1) * 960, 120 + hash(i * 2.7) * 1680, 6 + 6 * tw, .35), { wash: PAL.goldLt, washOp: 200, ink: null }); }
    // icon in a painted cream frame
    const ik = backOut(seg(t, 12.75, 13.05)), cx = 540, cy = 720, S = 380;
    if (ik > .01) {
      push(); translate(cx, cy); rotate(spring(t, 12.75, 5, 14) * .06); scale(ik);
      boilSeed('frame');
      paint(rrPts(-S / 2 - 30, -S / 2 - 30, S + 60, S + 60, 100, 2), { wash: PAL.cream, ink: PAL.ink, sw: 1.3 });
      placeImage(ICON, 0, 0, S, S);
      for (const [qx, qy, a0] of [[1, -1, -Math.PI / 2], [1, 1, 0], [-1, 1, Math.PI / 2], [-1, -1, Math.PI]]) {   // round the icon's corners
        const r = 78, ccx = qx * (S / 2 - r), ccy = qy * (S / 2 - r), P = [[qx * (S / 2 + 2), qy * (S / 2 + 2)]];
        for (let k = 0; k <= 8; k++) { const a = a0 + k / 8 * Math.PI / 2; P.push([ccx + Math.cos(a) * r, ccy + Math.sin(a) * r]); }
        paint(P, { wash: PAL.cream, ink: null });
      }
      paint(rrPts(-S / 2, -S / 2, S, S, 78), { ink: PAL.ink, sw: .9 });
      pop();
      // the icon's own star twinkles on the beat
      const sx = cx - .0176 * S * ik, sy = cy + .17 * S * ik;
      glow(sx, sy, 120 * (1 + .3 * pulse(t, 4)), PAL.lamp, .45 * ik);
      if (t > 13.0) { const k = backOut(seg(t, 13.0, 13.25)); for (let i = 0; i < 3; i++) paint(starPts(sx + [-150, 160, 130][i], sy + [-260, -180, 40][i], (16 + 10 * Math.sin(t * 6 + i)) * k, .3), { wash: PAL.gold, ink: PAL.ink, sw: .4 }); }
    }
    // CTA pill
    const ck = backOut(seg(t, 13.55, 13.85));
    if (ck > .01) { push(); translate(540, 1335); scale(ck); boilSeed('pill'); paint(rrPts(-380, -72, 760, 144, 72, 2), { wash: PAL.cream, ink: PAL.ink, sw: 1.2 }); pop(); }
    // rhyme: a small wheel spinning true, with its pot
    const wk = backOut(seg(t, 13.9, 14.2));
    if (wk > .01) {
      push(); translate(540, 1720); scale(wk); translate(-540, -1720);
      wheel(540, 1720, 24, { kind: 'new', spin: 1, spinPhase: t * 2.2 });
      clay(540, 1720 - 4.25 * 24, 24, 1, { spin: 1, ph: t * 6.6, key: 'endpot' });
      pop();
    }
    camEnd();
    letter('Aarambh', 540, 1065, 136, PAL.cream, { pop: seg(t, 12.95, 13.2) * 1, screen: true });
    letter('Fund verified livelihood tools', 540, 1172, 50, PAL.goldLt, { pop: seg(t, 13.2, 13.45), screen: true });
    if (ck > .01) letter('Explore on Google Play', 540, 1338, 64, PAL.green, { pop: seg(t, 13.62, 13.85), screen: true, shadow: false });
    if (lt < .3) brushWipe(.5 + lt / .6, [PAL.green, PAL.greenMid], PAL.gold);
  }

  shots([[0, shotA], [2.95, shotB], [5.95, shotC], [9.45, shotD], [12.45, shotE]]);
})();
