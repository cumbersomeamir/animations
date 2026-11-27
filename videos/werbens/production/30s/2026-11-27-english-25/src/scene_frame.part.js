// ------------------------------------------------------------------ camera: the eye's search (this episode's choreography): wide
// on the cooler with a darting light → push to the labels → diagonal pull-back along the wall of coolers → shelf-by-shelf scan →
// static stream of names in front of the lens → close on the friend's bottle → two-shot hand-over → CTA
const K = (p, t) => [p, t];
const F0 = K([0.13, 0.44, 0.78], [0.0, 0.675, 0]), H1 = K([0.09, 0.45, 0.74], [0.0, 0.66, 0]); // frame 0: upper shelves big, dark space above the cooler for the headline
const C1 = K([0.05, 0.4, 0.62], [0, 0.38, 0]), C1b = K([0.04, 0.4, 0.58], [0, 0.38, 0]);
const W1 = K([-3.2, 1.0, 1.2], [-0.15, 0.6, 0]), W1b = K([-3.26, 1.02, 1.24], [-0.15, 0.6, 0]); // solved by projection: all six coolers in x 48–942, y 756–1769 (below the label)
const S1 = K([0.0, 0.45, 1.12], [0, 0.42, 0]), S1b = K([0.0, 0.44, 1.06], [0, 0.42, 0]);
const ST = K([0.0, 0.38, 0.95], [0, 0.36, 0.1]), STb = K([0.0, 0.38, 0.9], [0, 0.36, 0.1]);
const G1 = K([0.08, 0.46, 0.8], [0.02, 0.4, 0.05]), G1b = K([0.07, 0.46, 0.75], [0.02, 0.4, 0.05]);
const P1 = K([0.01, 0.32, 1.42], [0.01, 0.21, 0.32]), P1b = K([0.01, 0.32, 1.37], [0.01, 0.21, 0.32]);
const CTAV = K([0, 0.28, 1.3], [0, 0.098, 0]), CTAV2 = K([0, 0.28, 1.26], [0, 0.098, 0]);
const CAMS = [[0, ...F0], [2.9, ...H1], [3.9, ...C1], [5.9, ...C1b], [7.4, ...W1], [9.75, ...W1b], [10.8, ...S1], [12.95, ...S1b], [13.7, ...ST], [17.2, ...STb],
  [18.2, ...G1], [20.6, ...G1b], [21.8, ...P1], [25.6, ...P1b], [26.75, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }
// search-light paths (hero cooler indices, row-major from the bottom shelf)
const HOOK_PATH = [22, 18, 24, 15, 21, 17], SEARCH_PATH = [20, 21, 22, 23, 24, 19, 18, 17, 16, 15, 10];
const labelFront = (i) => { const b = HERO_B[i]; return v3(b.userData.home.x, b.userData.home.y + 0.031, 0.04); };
function pathAt(path, t, [t0, t1]) { const n = path.length, u = clamp((t - t0) / (t1 - t0)) * (n - 1), k = Math.min(n - 2, Math.floor(u)), f = E.inOut(u - k); return labelFront(path[k]).lerp(labelFront(path[k + 1]), f); }
const checkedAt = (t) => { const u = clamp((t - T.search[0]) / (T.search[1] - T.search[0])) * (SEARCH_PATH.length - 1); return new Set(SEARCH_PATH.slice(0, Math.floor(u) + 1)); };
const S_POS = [-0.13, 0, 0.45], F_POS = [0.155, 0, 0.45], SAM_OUT = v3(-0.07, SHELF0 + 2 * SHELF_DY + 0.01, 0.105), MIA_OUT = v3(0.07, SHELF0 + 3 * SHELF_DY + 0.01, 0.105);
const SAM_HAND = v3(-0.075, 0.05, 0.47), GIFT_START = v3(-0.035, 0.05, 0.47), GIFT_END = v3(0.105, 0.05, 0.47);

// ------------------------------------------------------------------ frame
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const c = cameraAt(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.updateMatrixWorld();
  key_.position.set(c.tgt.x - 0.95, 2.35, c.tgt.z + 1.75); key_.target.position.set(c.tgt.x, 0.2, c.tgt.z); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut); stage.position.y = -0.9 * cl; stage.visible = cl < 0.999;
  const streamDim = win(t, T.stream[0] - 0.2, T.stream[1], 0.4, 0.4); key_.intensity = 11 * (1 - 0.35 * streamDim);
  M.back.emissiveIntensity = 0.16 * (1 - 0.5 * streamDim);

  // --- coolers: the five extra coolers rise on "150"; hero cooler always present
  COOLERS.forEach((g, ci) => { if (ci === HERO) return; const d = Math.abs(ci - HERO) * 0.1, u = E.outBack(ramp(t, T.coolers[0] + d, T.coolers[0] + d + 0.45)), gone = ramp(t, T.search[0] - 0.4, T.search[0]);
    g.visible = u > 0.01 && gone < 0.99; g.position.y = -CH * (1 - Math.min(1, u)) - 0.9 * gone; });

  // --- hero labels: names at frame 0; spin to the plain logo on "Share a Coke"; spin back to names in a wave on "swapped … names"
  const checked = t >= T.search[0] && t < T.search[1] + 0.6 ? checkedAt(t) : null;
  HERO_B.forEach((b, i) => { const { r, c: col, lab, lm } = b.userData;
    const lp = E.inOut(ramp(t, T.toLogo[0] + col * 0.05 + (4 - r) * 0.02, T.toLogo[0] + col * 0.05 + (4 - r) * 0.02 + 0.3)), sw = E.outBack(ramp(t, T.swap[0] + (col + (4 - r)) * 0.13, T.swap[0] + (col + (4 - r)) * 0.13 + 0.45));
    lab.rotation.y = Math.PI * lp + Math.PI * sw;
    const dim = checked && checked.has(i) && i !== SAM_I ? 0.55 : 1; lm.color.setScalar(dim * (1 - 0.3 * streamDim)); });
  // --- the search light: darting in the hook, zigzag shelf by shelf in proof 1
  { let p = null, o = 0; if (t >= T.scanHook[0] - 0.2 && t < T.scanHook[1] + 0.3) { p = pathAt(HOOK_PATH, t, T.scanHook); o = win(t, T.scanHook[0] - 0.4, T.scanHook[1] + 0.3, 0.2, 0.3); } // lit from frame 0
    if (t >= T.search[0] - 0.2 && t < T.search[1] + 0.4) { p = pathAt(SEARCH_PATH, t, T.search); o = win(t, T.search[0] - 0.2, T.search[1] + 0.4, 0.2, 0.3); }
    if (THUMB) { p = labelFront(HOOK_PATH[0]); o = 1; }
    scanGlow.visible = scanRing.visible = o > 0.01; if (p) { scanGlow.position.copy(p); scanRing.position.copy(p).setZ(p.z + 0.005); }
    scanGlow.material.opacity = 0.55 * o; scanRing.material.opacity = 0.9 * o; scanRing.scale.setScalar(0.05 + 0.006 * Math.sin(t * 9));
    hero.intensity = 1.6 * o; if (p) { hero.position.set(p.x + 0.25, p.y + 0.7, p.z + 0.9); hero.target.position.copy(p); hero.target.updateMatrixWorld(); } heroC.intensity = 0; }

  // --- name-card stream: cards rush past; SAM's card decelerates, stops centre and pops on "grabs attention"; others slip by dimmed
  STREAM.forEach((m) => { const { i, sam } = m.userData; const mt = m.material;
    if (sam) { const t0 = T.samPop - 0.34, u = E.out(ramp(t, t0, T.samPop)), pop = E.outBack(ramp(t, T.samPop, T.samPop + 0.3)), fly = ramp(t, ...T.foundSam, E.inOut);
      const home = v3(0.3 * (1 - u), 0.36, 0.4); m.position.copy(home.lerp(SAM_OUT.clone().add(v3(0, 0.031, 0.02)), fly)); const sc = (1 + 0.45 * pop) * (1 - 0.75 * fly); m.scale.set(sc, sc, 1);
      mt.opacity = t < t0 ? 0 : Math.min(ramp(t, t0, t0 + 0.12), 1 - ramp(t, T.foundSam[1] - 0.15, T.foundSam[1])); m.visible = mt.opacity > 0.01;
      samCardGlow.position.copy(m.position).setZ(m.position.z - 0.005); samCardGlow.scale.set(0.24 * sc, 0.1 * sc, 1); samCardGlow.material.opacity = 0.7 * pop * mt.opacity; samCardGlow.visible = samCardGlow.material.opacity > 0.01; return; }
    const t0 = T.stream[0] + i * 0.26, u = (t - t0) / 0.85, x = lerp(0.32, -0.32, u), after = ramp(t, T.samPop, T.samPop + 0.3);
    m.position.set(x, 0.36 + 0.03 * ((i % 3) - 1), 0.37 - 0.012 * (i % 2)); m.scale.set(1 + 0.25 * after, 1, 1);
    mt.opacity = u <= 0 || u >= 1 || t > T.stream[1] ? 0 : Math.min(clamp(u * 6), clamp((1 - u) * 6)) * (1 - 0.6 * after); m.visible = mt.opacity > 0.01; });

  // --- found: SAM's bottle glows and slides out; the friend's (MIA) glows, slides out, gets a ribbon; payoff: both go to SAM's
  // hands, a find ring pulses round SAM's bottle, the gift arcs to MIA
  { const so = E.outBack(ramp(t, ...T.foundSam)), pay = ramp(t, T.payCam[0], T.payCam[1] - 0.1, E.inOut);
    const sOut = SAM_B.userData.home.clone().lerp(SAM_OUT, Math.min(1, so)); SAM_B.position.copy(sOut.lerp(SAM_HAND, pay)); SAM_B.userData.lm.emissiveIntensity = 0;
    SAM_B.userData.lab.material.emissive.set("#7FE7DC"); SAM_B.userData.lm.emissiveIntensity = 0.35 * win(t, T.foundSam[0], T.payCam[0] + 0.5, 0.2, 0.5) + 0.4 * pulse(t, T.findMark, 0.6);
    const mo = E.outBack(ramp(t, ...T.pullMia)), hand = ramp(t, ...T.handOver, E.inOut), mStart = MIA_B.userData.home.clone().lerp(MIA_OUT, Math.min(1, mo)).lerp(GIFT_START, pay);
    const arc = GIFT_START.clone().lerp(GIFT_END, hand); arc.y += 0.08 * Math.sin(Math.PI * hand); MIA_B.position.copy(hand > 0 ? arc : mStart);
    MIA_B.userData.lm.emissiveIntensity = 0.45 * win(t, T.friend, T.giftLab[1], 0.15, 0.5) + 0.3 * pulse(t, T.handOver[1], 0.6);
    const gs = E.outBack(ramp(t, T.gift - 0.15, T.gift + 0.2)); giftG.scale.setScalar(Math.max(0.001, gs)); giftG.visible = gs > 0.01;
    M.ribbon.emissiveIntensity = 0.25 + 0.5 * pulse(t, T.gift, 0.5) + 0.4 * pulse(t, T.handOver[1], 0.6);
    findRing.position.copy(SAM_B.position).add(v3(0, 0.042, 0.02)); const fr = pulse(t, T.findMark - 0.05, 0.9); findRing.material.opacity = 0.9 * fr; findRing.visible = fr > 0.01; findRing.scale.setScalar(0.07 + 0.05 * ramp(t, T.findMark - 0.05, T.findMark + 0.85)); }
  // --- shoppers: SAM and MIA arrive for the payoff two-shot
  { const sv = THUMB ? 0 : E.outBack(ramp(t, T.payCam[0] + 0.2, T.payCam[0] + 0.6)); // SAM appears for the payoff only (out of frame in the search shot)
    shopper.visible = sv > 0.01; shopper.scale.setScalar(Math.max(0.001, Math.min(1.1, sv))); shopper.position.set(...S_POS); shopper.rotation.y = 0.25;
    const fv = THUMB ? 0 : E.outBack(ramp(t, T.payCam[0] + 0.4, T.payCam[0] + 0.8)); friend.visible = fv > 0.01; friend.scale.setScalar(Math.max(0.001, fv)); friend.position.set(...F_POS); friend.rotation.y = -0.25;
    M.pawn2.emissiveIntensity = 0.35 * pulse(t, T.handOver[1], 0.8); M.pawn.emissiveIntensity = 0.25 * pulse(t, T.findMark, 0.7); }

  // --- CTA tile (app.werbens.com logo): pops up as the stage sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("l150", T.lab150); lab("lSearch", T.searchLab); lab("lPop", T.popLab); lab("lGift", T.giftLab); lab("lGive", T.giveLab);
  const wd = THUMB ? 0 : ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = THUMB ? 0 : ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}

