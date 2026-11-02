// Physical model for the illustration (scene units ~ metres of a tabletop model; ratios are what matter).
// Values cited in docs/SOURCES.md: steel ~7.8e3 kg/m^3, water 1.000e3 kg/m^3 (OpenStax College Physics 2e, Table 11.1).
export const RHO_STEEL = 7.8;   // relative to water
export const RHO_WATER = 1.0;

export const TANK = {
  x0: -0.65, x1: 0.65, z0: -0.2, z1: 0.2, floor: 0.03, top: 0.78,
  level0: 0.44,              // water level before anything is added
};
TANK.area = (TANK.x1 - TANK.x0) * (TANK.z1 - TANK.z0);

export const BALL_R = 0.10;
export const BALL_V = (4 / 3) * Math.PI * BALL_R ** 3;          // steel volume (same steel becomes the hull)
export const DISPLACED_FLOAT = BALL_V * RHO_STEEL / RHO_WATER;   // floating: displaced water mass = object mass
export const RISE_BALL = BALL_V / TANK.area;                     // level rise with the ball fully submerged
export const RISE_HULL = DISPLACED_FLOAT / TANK.area;            // level rise with the hull floating (7.8x)

// Hull shape (outer surface): superellipse plan with a tapered bow, flat bottom, round bilge, vertical walls.
export const HULL = { a: 0.36, b: 0.155, D: 0.28, n: 4.2, taper: 0.5, t: 0.012, qb: 0.8, bilge: 0.07 };

const sgnpow = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), p);
export const taperAt = xn => 1 - HULL.taper * Math.pow(Math.max(0, xn), 2.4);

/** Outer meridian: s in [0,1] from bottom centre to rim -> [q (plan fraction), y (relative to hull centre)]. */
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

/** plan position for (q, phi). */
export function planXZ(q, phi) {
  const { a, b, n } = HULL;
  const x = a * q * sgnpow(Math.cos(phi), 2 / n);
  const z = b * q * sgnpow(Math.sin(phi), 2 / n) * taperAt(x / a);
  return [x, z];
}

/** Bottom height (relative to hull centre) of the outer surface at plan point (x,z); null if outside. */
export function bottomAt(x, z) {
  const { a, b, n, D, qb, bilge } = HULL;
  const tz = taperAt(x / a);
  const q = Math.pow(Math.pow(Math.abs(x / a), n) + Math.pow(Math.abs(z / (b * tz)), n), 1 / n);
  if (q >= 1) return null;
  if (q <= qb) return -D / 2;
  const u = (q - qb) / (1 - qb);                 // inverse of the bilge quarter-circle
  const ang = Math.asin(Math.min(1, u));
  return -D / 2 + bilge * (1 - Math.cos(ang));
}

// Submerged volume vs depth of the hull bottom below the waterline (numerical integration on a plan grid).
const VT = (() => {
  const { a, b, D } = HULL, N = 220, M = 110, dA = (2 * a / N) * (2 * b / M);
  const bottoms = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const x = -a + (i + 0.5) * 2 * a / N, z = -b + (j + 0.5) * 2 * b / M;
    const h = bottomAt(x, z);
    if (h !== null) bottoms.push(h + D / 2); // height above hull bottom
  }
  const table = [];
  for (let k = 0; k <= 200; k++) {
    const d = (k / 200) * D;
    let v = 0; for (const h of bottoms) v += Math.max(0, d - h);
    table.push(v * dA);
  }
  return table;
})();

export function submergedVolume(depth) {
  const { D } = HULL;
  const x = Math.max(0, Math.min(D, depth)) / D * 200, i = Math.min(199, Math.floor(x)), f = x - i;
  return VT[i] * (1 - f) + VT[i + 1] * f;
}

/** Depth at which the hull displaces volume v (bisection on the table). */
export function depthForVolume(v) {
  let lo = 0, hi = HULL.D;
  for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (submergedVolume(m) < v) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

export const HULL_DRAFT = depthForVolume(DISPLACED_FLOAT);
export const HULL_LEVEL = TANK.level0 + RISE_HULL;
/** Hull centre y when floating at rest. */
export const HULL_REST_Y = HULL_LEVEL - HULL_DRAFT + HULL.D / 2;

/** Given hull centre y, solve water level consistently (level depends on displaced volume). */
export function levelWithHull(cy) {
  let L = TANK.level0;
  for (let k = 0; k < 6; k++) {
    const depth = L - (cy - HULL.D / 2);
    L = TANK.level0 + submergedVolume(depth) / TANK.area;
  }
  return L;
}

/** Ball (sphere) submerged volume for centre y and level L. */
export function ballSubmerged(cy, L) {
  const r = BALL_R, h = Math.max(0, Math.min(2 * r, L - (cy - r)));
  return Math.PI * h * h * (3 * r - h) / 3;
}
export function levelWithBall(cy) {
  let L = TANK.level0;
  for (let k = 0; k < 6; k++) L = TANK.level0 + ballSubmerged(cy, L) / TANK.area;
  return L;
}

export function report() {
  return {
    ball_volume: BALL_V, displaced_floating: DISPLACED_FLOAT, ratio: DISPLACED_FLOAT / BALL_V,
    rise_ball: RISE_BALL, rise_hull: RISE_HULL, rise_ratio: RISE_HULL / RISE_BALL,
    hull_draft: HULL_DRAFT, hull_depth: HULL.D, freeboard: HULL.D - HULL_DRAFT, hull_rest_y: HULL_REST_Y,
    hull_max_displacement: submergedVolume(HULL.D), max_over_needed: submergedVolume(HULL.D) / DISPLACED_FLOAT,
  };
}
