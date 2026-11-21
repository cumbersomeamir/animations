// ------------------------------------------------------------------ camera: push-in, orbit, crane to top-down, descend (this episode's
// choreography; no lateral plinth slides)
const K = (p, t) => [p, t];
const F0 = K([0, 0.4, 0.6], [0, 0.07, 0]), F0b = K([0, 0.44, 0.57], [0, 0.066, 0]);
const C1 = K([0, 0.12, 0.37], [0, 0.104, 0]), C2 = K([0.09, 0.118, 0.35], [0.004, 0.103, 0]), C2b = K([0.1, 0.118, 0.34], [0.004, 0.103, 0]);
const C3w = K([0.03, 0.155, 0.5], [0, 0.127, 0]);
const O1 = K([-0.26, 0.275, 0.4], [0, 0.131, 0]), O2 = K([-0.38, 0.275, 0.17], [0, 0.131, 0]);
const TOP = K([0, 1.45, 0.24], [0, 0, -0.06]);
const P1 = K([0, 0.16, 0.52], [0, 0.123, 0]), P1b = K([0, 0.158, 0.49], [0, 0.123, 0]);
const CTAV = K([0, 0.28, 1.3], [0, 0.098, 0]), CTAV2 = K([0, 0.28, 1.26], [0, 0.098, 0]);
const CAMS = [[0, ...F0], [2.6, ...F0b], [3.3, ...F0b], [4.3, ...C1], [7.0, ...C1], [7.7, ...C2], [10.9, ...C2b], [11.4, ...C3w], [14.1, ...C3w], [15.0, ...O1], [17.6, ...O2], [18.4, ...O2], [19.4, ...TOP], [21.25, ...TOP], [22.2, ...P1], [25.4, ...P1b], [26.75, ...CTAV], [30, ...CTAV2]];
function cameraAt(t) { if (THUMB) return { pos: v3(...F0[0]), tgt: v3(...F0[1]) };
  let i = CAMS.findIndex((k) => k[0] > t); if (i < 0) i = CAMS.length; if (i === 0) i = 1;
  const a = CAMS[Math.min(i - 1, CAMS.length - 1)], b = CAMS[Math.min(i, CAMS.length - 1)], u = a === b ? 0 : E.inOut(clamp((t - a[0]) / (b[0] - a[0])));
  return { pos: v3(...a[1].map((v, k) => lerp(v, b[1][k], u))), tgt: v3(...a[2].map((v, k) => lerp(v, b[2][k], u))) }; }
const keysAt = (ks, t) => { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; return va + (vb - va) * E.inOut((t - a) / (b - a)); } return ks[ks.length - 1][1]; };
// face element presence: full at frame 0 → out at faceOut → back on their words → out at reset → back at refill
function facePres(t, tin, tin2) { const out1 = 1 - ramp(t, ...T.faceOut, E.in), in1 = ramp(t, tin, tin + 0.3, E.outBack), out2 = 1 - ramp(t, ...T.reset, E.in), in2 = ramp(t, tin2, tin2 + 0.3, E.outBack);
  if (t < T.faceOut[1]) return out1; if (t < T.reset[0]) return in1; if (t < T.reset[1]) return out2 * in1; return in2; }
const tmpQ = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), AX = new THREE.Vector3();

// ------------------------------------------------------------------ frame
function frame(t) {
  if (THUMB) t = 0; // the thumbnail IS frame 0
  const c = cameraAt(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.updateMatrixWorld();
  key_.position.set(c.tgt.x - 0.95, 2.35, 1.75); key_.target.position.set(c.tgt.x, 0.05, 0); key_.target.updateMatrixWorld();
  const cl = ramp(t, ...T.ctaClear, E.inOut);
  stage.position.y = -0.3 * cl; stage.visible = cl < 0.999; placeShadow(stageSh, 0, 0, 0, 0.05, 0.03, 0.8 * (1 - cl));

  // --- card: face elements, turn/lift/spin
  const pa = facePres(t, T.avatar, T.self), pb = (i) => facePres(t, T.bars + i * 0.08, T.refill[0] + i * 0.05), pr = facePres(t, T.ring[0], T.refill[0] + 0.25), par = facePres(t, T.artists, T.refill[0] + 0.15), pw = facePres(t, T.arrow, T.worth);
  avatar.scale.setScalar(Math.max(0.001, pa)); avatar.visible = pa > 0.003;
  const glowA = 0.6 * win(t, T.you, T.youLab[1], 0.15, 0.4) + 0.5 * win(t, T.self, T.storyLab[1], 0.15, 0.4) + 0.35 * pulse(t, T.avatar, 0.5);
  avatarGlow.visible = glowA > 0.01; avatarGlow.material.opacity = glowA; avatarGlow.scale.setScalar(0.07);
  artists.forEach((a, i) => { const p = par > 0 ? clamp(par * 3 - i * 0.6) : 0; a.scale.setScalar(Math.max(0.001, Math.min(1.1, p))); a.visible = p > 0.003; });
  bars.forEach((b, i) => { const p = pb(i); b.scale.set(Math.max(0.0005, b.userData.w * clamp(p)), 1, 1); b.visible = p > 0.003; });
  { const sweep = t < T.faceOut[1] ? 1 - ramp(t, ...T.faceOut) : t < T.reset[0] ? ramp(t, ...T.ring, E.lin) : t < T.reset[1] ? 1 - ramp(t, ...T.reset) : ramp(t, T.refill[0] + 0.2, T.refill[1] + 0.2, E.lin);
    ringSegs.forEach((s, i) => { s.visible = i / 20 < sweep - 0.001; }); }
  arrow.scale.setScalar(Math.max(0.001, pw * (1 + 0.25 * pulse(t, T.worth, 0.5) + 0.2 * pulse(t, T.arrow, 0.4)))); arrow.visible = pw > 0.003;
  const turn = win(t, T.turn[0], T.adIn[0] + 0.2, 0.3, 0.4), spin = ramp(t, ...T.spin, E.inOut), lift = 0.008 * win(t, T.you, T.youLab[1], 0.2, 0.4);
  cardG.rotation.y = 0.35 * turn + (Math.PI * 2 - 1.0) * spin + 1.0 * ramp(t, T.reset[0], T.reset[0] + 0.9, E.inOut); // spin ends facing the orbit camera, turns back on the descend cardG.position.y = lift;
  tabM.emissiveIntensity = 0.2 + 0.6 * win(t, T.brand, T.travelLab[1], 0.15, 0.3);
  sparks.forEach((s, j) => { const p = pulse(t, T.you + 0.1 + j * 0.22, 0.5) + pulse(t, T.self + 0.1 + j * 0.2, 0.5); s.visible = p > 0.01; s.material.opacity = Math.min(1, p); const sc = 0.012 + 0.01 * p; s.scale.set(sc, sc, 1); s.position.set([-0.05, 0.05, 0.035][j], CARD_Y + [0.05, 0.03, 0.075][j], 0.01); });

  // --- share tree: dots + mini cards follow the growth level g; a brightness wave flows outward
  { const g = keysAt(GROW, t), pos = dotGeo.attributes.position.array, col = dotGeo.attributes.color.array;
    for (let i = 0; i < DOTS.length; i++) { const d = DOTS[i], on = d.d <= g; pos[3 * i] = d.x; pos[3 * i + 1] = on ? FY : -5; pos[3 * i + 2] = d.z;
      const w = 0.45 + 0.55 * Math.max(0, Math.sin((d.d - t * 1.8) * 2.4)), fade = clamp((g - d.d) * 3 + 0.3); col[3 * i] = 0.5 * w * fade; col[3 * i + 1] = 0.9 * w * fade; col[3 * i + 2] = 0.86 * w * fade; }
    dotGeo.attributes.position.needsUpdate = true; dotGeo.attributes.color.needsUpdate = true;
    const mp = miniGeo.attributes.position.array;
    NODES.forEach((n, i) => { if (n.L === 0) { mp[3 * i + 1] = -5; return; } const p = NODES[n.parent], u = clamp(g - (n.L - 1)); const show = u > 0.02;
      mp[3 * i] = lerp(p.x, n.x, u); mp[3 * i + 1] = show ? 0.016 + (n.L <= 2 ? 0.024 : 0) + 0.01 * Math.sin(Math.PI * u) : -5; mp[3 * i + 2] = lerp(p.z, n.z, u); });
    miniGeo.attributes.position.needsUpdate = true;
    const topness = clamp((camera.position.y - 0.45) / 0.9); minis.material.size = 0.026 * (1 + 0.6 * topness) * (1 + 0.25 * win(t, T.brand, T.travelLab[1], 0.15, 0.3)); dots.material.size = 0.0085 * (1 + 0.5 * topness); }

  // --- friends: visible at frame 0 (hook), hidden during the close-ups, back for proof 2 → CTA; lean in on "how others see us"
  { const vis = (1 - ramp(t, 3.3, 3.6, E.in)) + ramp(t, ...T.friends, E.outBack), ln = 0.28 * win(t, T.lean[0], T.spin[1] + 0.6, 0.3, 0.4);
    pawnMat.emissiveIntensity = 0.25 * win(t, T.lean[0], T.spin[1] + 0.6, 0.3, 0.4) + 0.3 * win(t, T.brand, T.travelLab[1], 0.2, 0.3);
    FRIENDS.forEach((f, k) => { const n = f.userData.n, v = clamp(vis - k * 0.02); f.visible = v > 0.01; f.scale.setScalar(Math.max(0.001, Math.min(1.1, v))); f.position.set(n.x, 0, n.z);
      const r = Math.hypot(n.x, n.z) || 1; AX.set(-n.z / r, 0, n.x / r); f.quaternion.setFromAxisAngle(AX.normalize(), ln); }); }

  // --- listening discs spiral into the card (super hook); the card face brightens a touch as each one lands
  discs.forEach((d, i) => { const t0 = T.discs[0] + i * 0.18, u = ramp(t, t0, t0 + 0.55, E.in), vis = t > t0 - 0.35 && u < 1; d.visible = vis; if (!vis) return;
    const a = ramp(t, t0 - 0.35, t0, E.out), { a0, z0 } = d.userData, ang = a0 + 1.6 * u, R = 0.115 * (1 - u);
    d.position.set(R * Math.cos(ang), CARD_Y - 0.018 + 0.45 * R * Math.sin(ang), lerp(z0, 0.006, u)); d.rotation.set(HALF - 0.45 * (1 - u), 0, 0.25 * (1 - u)); // spiral kept below the caption band
    d.children[0].rotation.y = t * 9 + i; d.scale.setScalar(Math.max(0.001, a * (1 - 0.65 * u))); });
  { let fl = 0; for (let i = 0; i < discs.length; i++) fl += pulse(t, T.discs[0] + i * 0.18 + 0.5, 0.3); front.material.color.setScalar(1 + 0.12 * Math.min(1, fl)); }

  // --- ad board (proof 1): slides in, dims and sinks on "an ad"
  { const ain = ramp(t, ...T.adIn, E.out), aout = ramp(t, ...T.adOut, E.in); adG.visible = ain > 0.01 && aout < 0.99; const ax = 0.22 * (1 - ain); adG.position.set(ax, -0.125 * aout, 0.055); adG.rotation.y = -0.5 * (1 - ain);
    placeShadow(adSh, ax, 0.055, 0, 0.05, 0.02, adG.visible ? 0.8 * (1 - aout) : 0); }

  // --- lights: hero spot on the card
  hero.intensity = 2.4 * (1 - cl); hero.position.set(0.1, 1.1, 0.55); hero.target.position.set(0, CARD_Y, 0); hero.target.updateMatrixWorld(); heroC.intensity = 0;

  // --- CTA tile (app.werbens.com logo): pops up as the stage sinks
  const tu = clamp((t - T.tile[0]) / (T.tile[1] - T.tile[0])), ty = t < T.tile[0] ? 6 : tu < 1 ? lerp(0.03, 0, tu * tu) : 0, tg = Math.max(0.001, E.outBack(tu));
  tileCTA.visible = t >= T.tile[0]; tileCTA.position.set(0, ty, 0.05); const tsq = squash(t, T.tile[1], -0.14); tileCTA.scale.set(tg * (1 - tsq * 0.5), tg * (1 + tsq), tg * (1 - tsq * 0.5));
  for (const m of tileCTA.children) m.castShadow = ty < 0.25; placeShadow(tileSh, 0, 0.05, ty, 0.2, 0.06, tileCTA.visible ? 1 : 0);

  renderer.render(scene, camera);

  // ------------------------------------------------------------------ HUD: frame-0 headline, then one big brief label at a time
  { const o = THUMB ? 1 : 1 - ramp(t, ...T.headline, E.in); $("thumb").style.display = o > 0.01 ? "block" : "none"; $("thumb").style.opacity = String(o); }
  const lab = (id, w, y = 630) => hudAt($(id), [500, y], THUMB ? 0 : win(t, ...w, 0.18, 0.15), 0.85 + 0.15 * Math.min(1, pop(t, w[0], 0.3)));
  lab("lYou", T.youLab); lab("lLook", T.lookLab); lab("lTravel", T.travelLab); lab("lStory", T.storyLab);
  const wd = THUMB ? 0 : ramp(t, T.lockup - 0.35, T.lockup + 0.15); $("lockup").style.opacity = String(wd); $("lockup").style.transform = `translate(-50%, ${(1 - E.out(wd)) * 20}px)`;
  const tgl = THUMB ? 0 : ramp(t, T.lockup + 0.1, T.lockup + 0.5); $("tagline").style.opacity = String(tgl); $("tagline").style.transform = `translate(-50%, ${(1 - E.out(tgl)) * 14}px)`;
  captions(t);
}

