// ------------------------------------------------------------------ camera: follow-cam along the store path (this episode's
// choreography): hero 3/4 → crane over the entrance → follow the shopper down the path → the lone sofa → side view → turn back to
// the shelves → high overview of the whole path → CTA
const K = (p, t) => [p, t];
// shopper position along the path (pawn is rotationally symmetric, so no yaw)
const WALK_Z1 = -1.36, STAND = [0.06, -1.36], CART_AT = [0.025, -1.04], SHOP_AT_CART = [-0.03, -0.98];
function shopperAt(t) {
  if (t < T.walk[0]) return [pathX(PATH_Z0), PATH_Z0, 0];
  if (t < T.walk[1]) { const u = E.inOut((t - T.walk[0]) / (T.walk[1] - T.walk[0])), z = lerp(PATH_Z0, WALK_Z1, u); return [pathX(z), z, Math.abs(Math.sin(t * 13)) * 0.004]; }
  const st = [lerp(pathX(WALK_Z1), STAND[0], ramp(t, T.walk[1], T.walk[1] + 0.4)), lerp(WALK_Z1, STAND[1], ramp(t, T.walk[1], T.walk[1] + 0.4)) - 0.025 * ramp(t, ...T.want, E.inOut)];
  const back = ramp(t, T.shelves[0], T.shelves[1] - 0.1, E.inOut); if (back <= 0) return [st[0], st[1], 0];
  return [lerp(st[0], SHOP_AT_CART[0], back), lerp(st[1], SHOP_AT_CART[1], back), back < 1 ? Math.abs(Math.sin(t * 13)) * 0.004 : 0];
}
const FOLLOW = (t) => { const [sx, sz] = shopperAt(t), k = E.inOut(clamp((-sz - 0.55) / 0.6)); return K([0.45 * sx, 0.24 + 0.13 * k, sz + 0.46 + 0.12 * k], [0.5 * sx, 0.04, sz - 0.3]); }; // rises over the racks near the end
const F0 = K([0.06, 0.25, 0.36], [-0.14, 0.04, -0.03]), H1 = K([0.05, 0.235, 0.33], [-0.14, 0.04, -0.03]);
const OV1 = K([0.03, 0.72, 0.98], [0, 0, -0.32]);
const D1 = K([-0.02, 0.155, -1.1], [-0.01, 0.05, -1.52]), D1b = K([-0.02, 0.152, -1.13], [-0.01, 0.05, -1.52]), D2 = K([0.02, 0.2, -1.02], [0.0, 0.075, -1.55]);
const S1 = K([0.2, 0.2, -1.2], [-0.01, 0.05, -1.52]), S2 = K([0.19, 0.195, -1.22], [-0.01, 0.05, -1.52]);
const R1 = K([0.0, 0.26, -0.76], [0.01, 0.1, -1.0]), R2 = K([0.0, 0.255, -0.78], [0.01, 0.1, -1.0]);
const OV2 = K([0.0, 1.5, 1.1], [0.0, 0.0, -0.6]), OV2b = K([0.0, 1.48, 1.08], [0.0, 0.0, -0.6]); // framing solved by projection: room C below the label, room A above y ≈ 1680
const OV3 = K([-0.04, 0.36, 0.4], [-0.145, 0.06, -0.03]); // payoff bookend: push into room A (frame 0's room), now lived in
const CTAV = K([0, 0.28, 1.3], [0, 0.098, 0]), CTAV2 = K([0, 0.28, 1.26], [0, 0.098, 0]);
const FOLLOW_W = [6.2, 9.4];
const CAMS = [[0, ...F0], [2.9, ...H1], [3.0, ...H1], [4.3, ...OV1], [5.5, ...OV1], [FOLLOW_W[0], ...FOLLOW(FOLLOW_W[0])], [FOLLOW_W[1], ...FOLLOW(FOLLOW_W[1])],
  [10.2, ...D1], [12.4, ...D1b], [13.5, ...D2], [14.3, ...D2], [15.1, ...S1], [18.75, ...S2], [19.6, ...R1], [21.3, ...R2], [22.5, ...OV2], [24.05, ...OV2b], [25.7, ...OV3], [26.75, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  if (t > FOLLOW_W[0] && t < FOLLOW_W[1]) { const f = FOLLOW(t); return { pos: v3(...f[0]), tgt: v3(...f[1]) }; }
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }
// room part progress: staggered pop-up inside the room's window; context parts fold flat on "Don't just show the product" and
// pop back on "Show the life around it"
function partU(R, p, t) { const [a, b] = R.win, n = R.parts.length, st = R.starts ? R.starts[p.k] : a + (b - a) * 0.7 * (p.k / (n - 1)), dur = R.dur || Math.max(0.28, (b - a) * 0.38);
  let u = E.outBack(clamp((t - st) / dur));
  if (p.ctx) { const f0 = T.foldAll[0] + R.delay + p.k * 0.03, f = ramp(t, f0, f0 + 0.35, E.inOut), pb = E.outBack(clamp((t - (T.popAll[0] + R.delay + p.k * 0.04)) / 0.4)); u = u * (1 - f) + pb; }
  return u; }
const LAMP_ON = new Map([[roomA, () => [T.lampA, T.lampA + 0.3]], [roomB, () => [T.unfoldB[1] - 0.1, T.unfoldB[1] + 0.2]], [roomD, () => [T.evening, T.evening + 0.35]]]);
for (const R of ROOMS) R.lampPart = R.lamps.map((L) => R.parts.find((p) => p.obj === L.parent || p.obj === L.parent?.parent));
const CUP_Y = roomD.cup.position.y, CUP_Y_A = roomA.cup.position.y; cartPack.material = PACKS[11].o.material;
const thinkP = new THREE.Vector3(), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();

// ------------------------------------------------------------------ frame
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const c = cameraAt(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.updateMatrixWorld();
  key_.position.set(c.tgt.x - 0.95, 2.35, c.tgt.z + 1.75); key_.target.position.set(c.tgt.x, 0.05, c.tgt.z); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut); stage.position.y = -0.4 * cl; stage.visible = cl < 0.999;
  const alone = win(t, T.alone, T.unfoldD[0] + 0.35, 0.3, 0.5), eve = win(t, T.evening, T.shelves[0] + 0.3, 0.4, 0.5);
  key_.intensity = 11 * (1 - 0.45 * alone - 0.22 * eve);

  // --- rooms: parts pop up from flat cut-outs; lamps light; context folds/pops in the payoff
  for (const R of ROOMS) {
    for (const p of R.parts) { const u = partU(R, p, t), o = p.obj;
      if (p.type === "hinge") { o.rotation.x = -HALF * (1 - Math.min(u, 1.08)); o.scale.z = lerp(0.1, 1, clamp(u)); o.visible = R.hideFlat ? u > 0.02 : true; }
      else if (p.type === "rug") { o.scale.x = Math.max(0.02, u); o.visible = R.hideFlat ? u > 0.02 : true; }
      else if (p.type === "pop") { o.scale.setScalar(Math.max(0.001, u)); o.visible = u > 0.01; }
      else if (p.type === "plate") { o.scale.set(Math.max(0.01, u), 1, Math.max(0.01, u)); o.visible = u > 0.02; } }
    R.lamps.forEach((L, j) => { const on = LAMP_ON.has(R) ? ramp(t, ...LAMP_ON.get(R)()) : 0, pu = R.lampPart[j] ? partU(R, R.lampPart[j], t) : 1, g = on * clamp((pu - 0.8) / 0.2);
      L.userData.glow.material.opacity = 0.8 * g; L.userData.glow.visible = g > 0.01; L.userData.shadeM.emissiveIntensity = 0.9 * g; });
  }
  // --- the lone sofa: cold spot, dimension bar on "size", plain tag on "price"; both leave when room D unfolds
  { const gone = 1 - ramp(t, T.unfoldD[0], T.unfoldD[0] + 0.3), ds = E.outBack(ramp(t, T.size, T.size + 0.32)) * gone; dimBar.scale.set(Math.max(0.001, ds), 1, 1); dimBar.visible = ds > 0.01;
    const tg = E.outBack(ramp(t, T.price, T.price + 0.3)) * gone; tagG.scale.setScalar(Math.max(0.001, tg)); tagG.visible = tg > 0.01; tagG.userData.card.rotation.y = 0.25 * Math.sin(t * 2.2); }
  hero.intensity = 3.2 * alone; hero.position.set(0.05, 0.9, -1.25); hero.target.position.set(0, 0.03, -1.52); hero.target.updateMatrixWorld(); heroC.intensity = 0;

  // --- path arrows: faint at rest; light from the entrance into the showroom on "start with the showroom", then a flowing wave
  for (const ch of chevrons) { const s = ch.userData.s, lit = ramp(t, T.pathLight[0] + s * 1.1, T.pathLight[0] + s * 1.1 + 0.15), flow = 0.45 + 0.55 * Math.max(0, Math.sin(s * 9 - t * 2.4)) ** 2;
    ch.userData.m.opacity = 0.16 + 0.7 * lit * flow * (1 - cl); }
  M.arch.emissiveIntensity = 0.15 + 0.5 * pulse(t, T.pawnIn, 0.6);

  // --- shopper
  { const [sx, sz, bob] = shopperAt(t), sp = THUMB ? 0 : E.outBack(ramp(t, T.pawnIn, T.pawnIn + 0.3)); shopper.position.set(sx, bob, sz); shopper.scale.setScalar(Math.max(0.001, sp)); shopper.visible = sp > 0.01;
    M.shopper.emissiveIntensity = 0.35 * win(t, T.ghost[0], T.pictureLab[1], 0.2, 0.3) + 0.3 * pulse(t, T.want[0], 0.5);
    // thought arc from the shopper's head to the imagined shopper on the sofa
    const ta = win(t, T.think[0], T.pictureLab[1], 0.12, 0.35), rev = ramp(t, ...T.think), pos = thinkGeo.attributes.position.array;
    tmpA.set(sx, 0.052, sz); tmpB.set(roomD.seat[0], roomD.seat[1] + 0.04, roomD.seat[2]);
    for (let k = 0; k < THINK_N; k++) { const u = (k + 1) / (THINK_N + 1); thinkP.lerpVectors(tmpA, tmpB, u); thinkP.y += 0.045 * Math.sin(Math.PI * u); const on = u <= rev; pos[3 * k] = thinkP.x; pos[3 * k + 1] = on ? thinkP.y : -5; pos[3 * k + 2] = thinkP.z; }
    thinkGeo.attributes.position.needsUpdate = true; thinkDots.material.opacity = ta; thinkDots.visible = ta > 0.01; }
  // --- the imagined (ghost) shopper on the sofa; reaches for the cup on "using"; becomes a real person in the payoff
  { const go = 0.5 * win(t, T.ghost[0], T.popAll[0] + 0.3, 0.3, 0.3); GHOST.opacity = go; ghostP.visible = go > 0.01; ghostP.position.set(roomD.seat[0], roomD.seat[1] + 0.004 * Math.sin(t * 3), roomD.seat[2]);
    ghostP.scale.setScalar(0.9 + 0.1 * E.outBack(ramp(t, T.ghost[0], T.ghost[1]))); ghostP.rotation.z = -0.25 * win(t, T.using, T.using + 1.3, 0.25, 0.4);
    roomD.cup.position.y = CUP_Y + 0.01 * win(t, T.using, T.using + 1.3, 0.25, 0.4); roomA.cup.position.y = CUP_Y_A; }
  // --- racks: flat packs slide onto the shelves on "Flat packs"; one slides onto the cart on "shelves"; a ghost of the finished
  // room rises above it on "finishing a room"
  for (const pk of PACKS) { const d = (pk.i % 9) * 0.05 + (pk.rx > 0 ? 0.02 : 0), u = E.out(ramp(t, T.racks[0] + d, T.racks[0] + d + 0.35)); pk.o.position.x = pk.x0 + (pk.rx > 0 ? -1 : 1) * 0.07 * (1 - u); pk.o.visible = u > 0.01 && !(pk.i === 11 && t >= T.packOn); }
  { const cv = E.outBack(ramp(t, T.shelves[0] + 0.2, T.shelves[0] + 0.55)); cart.visible = cv > 0.01 && cl < 1; cart.scale.setScalar(Math.max(0.001, cv)); cart.position.set(CART_AT[0], 0, CART_AT[1]);
    const mv = ramp(t, T.packOn, T.packOn + 0.35, E.inOut); cartPack.visible = t >= T.packOn; const from = [0.08, 0.0115, RACK_Z + 0.072], to = [CART_AT[0], 0.0165, CART_AT[1]];
    cartPack.position.set(lerp(from[0], to[0], mv), lerp(from[1], to[1], mv) + 0.02 * Math.sin(Math.PI * mv), lerp(from[2], to[2], mv));
    const gr = win(t, T.ghostRoom[0], T.payCrane[0] + 0.4, 0.4, 0.4); GHOST_ROOM.opacity = 0.55 * gr; ghostRoom.visible = gr > 0.01;
    ghostRoom.position.set(CART_AT[0], 0.035 + 0.035 * E.out(ramp(t, ...T.ghostRoom)) + 0.002 * Math.sin(t * 2.5), CART_AT[1]); ghostRoom.rotation.y = 0.5 + 0.05 * t; ghostRoom.scale.setScalar(0.2 + 0.1 * E.outBack(ramp(t, ...T.ghostRoom))); }
  // --- life: people in every room on "Show the life around it"
  for (const L of life) { const v = E.outBack(clamp((t - (T.popAll[0] + 0.25 + L.room.delay)) / 0.35)); L.o.scale.setScalar(Math.max(0.001, v)); L.o.visible = v > 0.01; }

  // --- CTA tile (app.werbens.com logo): pops up as the stage sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lShow", T.showLab); lab("lEve", T.eveLab); lab("lPic", T.pictureLab); lab("lFin", T.finishLab);
  lab("lLife", T.lifeLab);
  const wd = THUMB ? 0 : ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = THUMB ? 0 : ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}

