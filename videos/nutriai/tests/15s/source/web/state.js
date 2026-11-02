// state.js: every uniform as a pure function of the frame number (u_time = frame / fps).
// Shared timing comes from ../timeline.json so audio and picture stay in sync.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (f, a, b) => clamp((f - a) / (b - a));
const E_ = {
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t, s = 1.9) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
};

// Layout constants mirrored from common.glsl (p-space).
const IMPACT = [0.0, 0.05];
const RING_C = [0.0, -0.02], RING_R = 0.40;
const GLASS_C = [0.0, -0.17], GLASS_HH = 0.45;
const LOGO_C = [0.0, 0.326];
const BTN_C = [0.0, -0.35625];
const BOTTOM = GLASS_C[1] - GLASS_HH;

export function makeState(TL) {
  const E = TL.events, fps = TL.fps;
  const MEALS = [E.meal1, E.meal2, E.meal3];
  const DROPS = [E.drop1, E.drop2, E.drop3, E.drop4];
  const SEG_MID = [60, 0, -60];
  const DROP_X = [-0.05, 0.06, -0.02, 0.035];

  const level = (f) => {
    let l = 0.085 * E_.outCubic(seg(f, E.pool, E.pool + 14));
    for (const k of DROPS) l += 0.165 * E_.outCubic(seg(f, k, k + 10));
    l *= 1 - E_.inQuad(seg(f, E.vortex, E.vortex + 24));
    return l;
  };
  const ringPt = (deg, r = RING_R) => [RING_C[0] + Math.cos((deg * Math.PI) / 180) * r, RING_C[1] + Math.sin((deg * Math.PI) / 180) * r];

  // Ripple sources: [frame, x, y, amplitude]
  const RIPS = [
    [E.dropHit, IMPACT[0], IMPACT[1], 1.5],
    [E.ringSnap, RING_C[0], RING_C[1], 0.55],
    ...MEALS.map((k, i) => [k, ...ringPt(SEG_MID[i]), 0.55]),
    [E.melt, RING_C[0], RING_C[1] + 0.2, 0.9],
    ...DROPS.map((k, i) => [k, DROP_X[i], BOTTOM + 2 * GLASS_HH * level(k), 0.6]),
    [E.logoSnap, LOGO_C[0], LOGO_C[1], 0.75],
    [E.press, BTN_C[0], BTN_C[1], 0.5],
  ];

  return function stateAt(f) {
    const t = f / fps;
    const U = { u_time: t, u_frame: f };
    const age = (k) => (f - k) / fps;

    // ---------- A: drop + bloom
    const dropK = seg(f, -6, E.dropHit);
    U.u_drop = f < E.dropHit ? [0.0, lerp(0.98, IMPACT[1], E_.inQuad(dropK)), 0.052, 1] : [0, 0, 0.05, 0];
    U.u_antic = f < E.dropHit ? 0.45 + 0.55 * seg(f, 0, E.dropHit) : 0;
    U.u_front = f < E.dropHit ? 0 : 0.12 + 2.3 * E_.outCubic(seg(f, E.dropHit, E.dropHit + 42));
    U.u_flash = f < E.dropHit ? 0 : Math.exp(-(f - E.dropHit) / 5);
    U.u_ca = (f >= E.dropHit ? 1.2 * Math.exp(-age(E.dropHit) * 3.5) : 0) + (f >= E.melt ? 0.6 * Math.exp(-age(E.melt) * 3) : 0) + (f >= E.logoSnap ? 0.8 * Math.exp(-age(E.logoSnap) * 4) : 0);
    U.u_energy = 1.0 + (f >= E.dropHit ? 1.8 * Math.exp(-age(E.dropHit) * 1.1) : 0) + 0.8 * seg(f, E.vortex, E.vortex + 20) * (1 - seg(f, E.logoSnap, E.logoSnap + 30));
    U.u_base = (f < E.dropHit ? 0.24 : 0.10) + 0.06 * seg(f, E.logoSnap, E.logoSnap + 20);

    // envelope weights
    const wA = 1 - seg(f, E.condense, E.condense + 26);
    const wB = seg(f, E.condense, E.condense + 22) * (1 - seg(f, E.melt + 4, E.pool + 4));
    const wC = seg(f, E.melt + 8, E.pool + 4) * (1 - seg(f, E.vortex + 4, E.vortex + 26));
    const wD = seg(f, E.vortex + 6, E.logo + 14);
    U.u_w = [wA, wB, wC, wD];
    U.u_ring = E_.inOutCubic(seg(f, E.condense, E.ringSnap + 6));
    U.u_melt = E_.inOutQuad(seg(f, E.melt, E.pool));
    U.u_level = level(f);
    U.u_vortex = E_.inOutQuad(seg(f, E.vortex, E.logoSnap - 4)) * (1 - 0.85 * E_.outCubic(seg(f, E.logoSnap, E.logoSnap + 30)));
    U.u_logo = E_.inOutCubic(seg(f, E.logo, E.logoSnap));

    // ---------- B: ring, fork, segments, blobs, labels
    U.u_ringVis = f < E.vortex ? seg(f, E.condense + 10, E.ringSnap) : 0;
    U.u_ringCrisp = E_.outCubic(seg(f, E.condense + 16, E.ringSnap + 10));
    U.u_forkVis = E_.outCubic(seg(f, E.forkIn, E.forkIn + 16));
    U.u_seg = MEALS.map((k) => E_.outCubic(seg(f, k, k + 10)));
    MEALS.forEach((k, i) => {
      const s = k - 22;
      const tgt = ringPt(SEG_MID[i], RING_R + 0.01);
      const start = [0.86, tgt[1] + 0.55 - i * 0.1];
      const ctrl = [0.62, tgt[1] + 0.05];
      const u = E_.inOutQuad(seg(f, s, k));
      const x = (1 - u) * (1 - u) * start[0] + 2 * u * (1 - u) * ctrl[0] + u * u * tgt[0];
      const y = (1 - u) * (1 - u) * start[1] + 2 * u * (1 - u) * ctrl[1] + u * u * tgt[1];
      const r = 0.05 * (1 - E_.inQuad(seg(f, k - 2, k + 8))) * (0.85 + 0.15 * Math.sin(f * 0.9 + i));
      U['u_blob' + i] = f >= s && f < k + 8 ? [x, y, Math.max(r, 0.0001), 1] : [0, 0, 0.0001, 0];
    });
    U.u_labP = MEALS.map((k) => seg(f, k + 2, k + 14));

    // ---------- C: melt -> glass, water level, droplets, ticks
    U.u_glassVis = seg(f, E.glassIn, E.glassIn + 24) * (1 - seg(f, E.vortex + 8, E.logoSnap - 6));
    let wave = 0;
    for (const k of [E.pool, ...DROPS]) if (f >= k) wave += Math.exp(-age(k) * 2.6);
    U.u_wave = Math.min(wave, 1.4) + 0.6 * seg(f, E.vortex, E.vortex + 10) * (1 - seg(f, E.vortex + 10, E.vortex + 24));
    U.u_wd0 = [0, 0, 0.03, 0];
    U.u_wd1 = [0, 0, 0.03, 0];
    DROPS.forEach((k, i) => {
      const s = k - 16;
      if (f < s || f >= k) return;
      const surf = BOTTOM + 2 * GLASS_HH * level(k);
      const y = lerp(1.05, surf, E_.inQuad(seg(f, s, k)));
      U[i % 2 ? 'u_wd1' : 'u_wd0'] = [DROP_X[i], y, 0.033, 1];
    });
    U.u_ticks = DROPS.reduce((a, k) => a + E_.outCubic(seg(f, k, k + 8)), 0);

    // ---------- D: logo, icon dissolve, end card
    U.u_logoVis = seg(f, E.logo + 2, E.logoSnap - 2);
    U.u_logoCrisp = E_.outCubic(seg(f, E.logo + 10, E.logoSnap + 4));
    U.u_iconMix = E_.inOutQuad(seg(f, E.iconDissolve, E.iconDissolve + 18));
    U.u_dim = E_.outCubic(seg(f, E.logoSnap - 4, E.word + 10));
    U.u_btn = f < E.button ? 0 : E_.outBack(seg(f, E.button, E.button + 14));
    U.u_press = f >= E.press ? Math.sin(seg(f, E.press, E.press + 9) * Math.PI) : 0;
    U.u_endP = [seg(f, E.word, E.word + 16), seg(f, E.sub, E.sub + 14), seg(f, E.feat, E.feat + 14), seg(f, E.button + 4, E.button + 16)];

    // ---------- captions: 0..1 in, 1..2 out
    const cap = (i0, o0) => (f < o0 ? seg(f, i0, i0 + 14) : 1 + seg(f, o0, o0 + 12));
    U.u_capP = [cap(E.capA_in, E.capA_out), cap(E.capB_in, E.capB_out), cap(E.capC_in, E.capC_out), seg(f, E.melt, E.melt + 16)];
    const vis = (a) => (a <= 0 ? 0 : a < 1 ? Math.min(1, a * 2) : Math.max(0, 1 - (a - 1) * 1.5));
    U.u_scrim = Math.max(vis(U.u_capP[0]), vis(U.u_capP[1]), vis(U.u_capP[2]));

    // ---------- ripples: the six most recent active sources
    const active = RIPS.filter(([k]) => f >= k && (f - k) / fps < 2.2).sort((a, b) => b[0] - a[0]).slice(0, 6);
    U.u_rip = Array.from({ length: 6 }, (_, i) => (active[i] ? [active[i][1], active[i][2], (f - active[i][0]) / fps, active[i][3]] : [0, 0, 0, 0]));
    return U;
  };
}
