// Physical model for the challenge tank (scene units; ratios are what matter).
// Cited values (docs/SOURCES.md): steel ~7.8e3 kg/m^3, water 1.000e3 kg/m^3 (OpenStax College Physics 2e, Table 11.1);
// buoyant force = weight of displaced fluid (Archimedes' principle, OpenStax §11.7).
// Adapted from education/pilot-01/web/physics.js (two chambers, smaller pieces, flooding model added).
export const RHO_STEEL = 7.8;
export const RHO_WATER = 1.0;

// One tank, two identical chambers split by a divider: left = ball, right = ship.
export const TANK = { x0: -0.62, x1: 0.62, div: 0.012, z0: -0.17, z1: 0.17, floor: 0.03, top: 0.62, level0: 0.36 };
export const CH = [
  { name: 'ball', cx: -0.31, x0: TANK.x0, x1: -TANK.div },
  { name: 'ship', cx: 0.31, x0: TANK.div, x1: TANK.x1 },
];
export const CH_AREA = (TANK.x1 - TANK.div) * (TANK.z1 - TANK.z0);

export const BALL_R = 0.07;
export const STEEL_V = (4 / 3) * Math.PI * BALL_R ** 3;        // same steel volume in ball and ship (same weight)
export const DISPLACED_FLOAT = STEEL_V * RHO_STEEL / RHO_WATER; // floating: displaced water weighs as much as the ship
export const RISE_BALL = STEEL_V / CH_AREA;                     // ball fully submerged
export const RISE_SHIP = DISPLACED_FLOAT / CH_AREA;             // ship floating (7.8x)
export const RISE_SUNK = STEEL_V / CH_AREA;                     // flooded ship on the floor: only the steel displaces

export const HULL = { a: 0.235, b: 0.128, D: 0.2, n: 4.2, taper: 0.45, t: 0.008, qb: 0.8, bilge: 0.05 };

const sgnpow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);
export const taperAt = xn => 1 - HULL.taper * Math.pow(Math.max(0, xn), 2.4);

export function outerMeridian(s) {
  const { D, qb, bilge } = HULL, yb = -D / 2;
  const s1 = 0.42, s2 = 0.62;
  if (s <= s1) return [qb * (s / s1), yb];
  if (s <= s2) {
    const u = (s - s1) / (s2 - s1), ang = u * Math.PI / 2;
    return [qb + (1 - qb) * Math.sin(ang), yb + bilge * (1 - Math.cos(ang))];
  }
  const u = (s - s2) / (1 - s2);
  return [1, yb + bilge + (D - bilge) * u];
}

export function planXZ(q, phi) {
  const { a, b, n } = HULL;
  const x = a * q * sgnpow(Math.cos(phi), 2 / n);
  const z = b * q * sgnpow(Math.sin(phi), 2 / n) * taperAt(x / a);
  return [x, z];
}

export function bottomAt(x, z) {
  const { a, b, n, D, qb, bilge } = HULL;
  const tz = taperAt(x / a);
  const q = Math.pow(Math.pow(Math.abs(x / a), n) + Math.pow(Math.abs(z / (b * tz)), n), 1 / n);
  if (q >= 1) return null;
  if (q <= qb) return -D / 2;
  const u = (q - qb) / (1 - qb);
  return -D / 2 + bilge * (1 - Math.cos(Math.asin(Math.min(1, u))));
}

const VT = (() => {
  const { a, b, D } = HULL, N = 200, M = 110, dA = (2 * a / N) * (2 * b / M);
  const bottoms = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const h = bottomAt(-a + (i + 0.5) * 2 * a / N, -b + (j + 0.5) * 2 * b / M);
    if (h !== null) bottoms.push(h + D / 2);
  }
  const table = [];
  for (let k = 0; k <= 200; k++) {
    const d = (k / 200) * D; let v = 0;
    for (const h of bottoms) v += Math.max(0, d - h);
    table.push(v * dA);
  }
  return table;
})();

/** Volume of the hull envelope below a plane `depth` above the hull bottom. */
export function envelopeBelow(depth) {
  const x = Math.max(0, Math.min(HULL.D, depth)) / HULL.D * 200, i = Math.min(199, Math.floor(x)), f = x - i;
  return VT[i] * (1 - f) + VT[i + 1] * f;
}
export function depthForVolume(v) {
  let lo = 0, hi = HULL.D;
  for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (envelopeBelow(m) < v) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

export const ENVELOPE_TOTAL = envelopeBelow(HULL.D);
export const SHIP_DRAFT = depthForVolume(DISPLACED_FLOAT);
export const LEVEL_SHIP = TANK.level0 + RISE_SHIP;
export const SHIP_REST_Y = LEVEL_SHIP - SHIP_DRAFT + HULL.D / 2;      // hull centre when floating empty
// Flooding through a bottom plug with the chamber's own water: while afloat, water only moves from outside to inside,
// so the chamber level stays at LEVEL_SHIP; the ship rides lower as the inside water w grows:
//   envelope below waterline = 7.8 V + w.   It founders when the rim reaches the waterline (w = W_MAX).
export const W_MAX = ENVELOPE_TOTAL - DISPLACED_FLOAT;
export const shipYWithInsideWater = w => LEVEL_SHIP - depthForVolume(DISPLACED_FLOAT + w) + HULL.D / 2;
export const SUNK_Y = TANK.floor + HULL.D / 2 + 0.004;
export const LEVEL_SUNK = TANK.level0 + RISE_SUNK;

/** Inside-water height above the inner bottom for inside volume w (approximate inner section = envelope shrunk by t). */
export function insideHeight(w) {
  const k = (1 - 2 * HULL.t / HULL.b) * (1 - 2 * HULL.t / HULL.a);
  let lo = 0, hi = HULL.D;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (envelopeBelow(m) * k < w) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

export function ballLevel(cy) {
  const r = BALL_R; let L = TANK.level0;
  for (let k = 0; k < 6; k++) {
    const h = Math.max(0, Math.min(2 * r, L - (cy - r)));
    L = TANK.level0 + (Math.PI * h * h * (3 * r - h) / 3) / CH_AREA;
  }
  return L;
}
/** Level in the ship chamber for an empty hull at centre y (consistent with displacement). */
export function shipLevelEmpty(cy) {
  let L = TANK.level0;
  for (let k = 0; k < 6; k++) L = TANK.level0 + envelopeBelow(L - (cy - HULL.D / 2)) / CH_AREA;
  return L;
}

export function report() {
  return {
    steel_volume: STEEL_V, displaced_floating: DISPLACED_FLOAT, ratio: DISPLACED_FLOAT / STEEL_V,
    chamber_area: CH_AREA, rise_ball: RISE_BALL, rise_ship: RISE_SHIP, rise_sunk: RISE_SUNK,
    ship_draft: SHIP_DRAFT, hull_depth: HULL.D, freeboard: HULL.D - SHIP_DRAFT, envelope_total: ENVELOPE_TOTAL,
    reserve_ratio: ENVELOPE_TOTAL / DISPLACED_FLOAT, inside_water_to_founder: W_MAX, level0: TANK.level0,
    level_ship: LEVEL_SHIP, level_sunk: LEVEL_SUNK,
  };
}
