// Episode model: a kilogram of steel vs a kilogram of feathers (scene units = metres).
// Cited (docs/SOURCES.md): steel 7.8e3 kg/m^3 (OpenStax College Physics 2e Table 11.1); density = mass / volume (§11.2);
// SI unit of mass = kilogram (NIST). Feather pile volume is ILLUSTRATIVE (no credible single bulk-density value; real
// down/feathers vary widely) — only "far more space" is claimed.
export const RHO_STEEL = 7800;                        // kg/m^3
export const MASS_R1 = 1.0;                           // kg on each pan in round 1
export const CUBE = Math.cbrt(MASS_R1 / RHO_STEEL);   // 1 kg steel cube side ≈ 0.0504 m
export const SACK = { w: 0.42, h: 0.36, d: 0.40 };    // illustrative 1 kg feather sack (≈ 0.06 m^3 incl. air gaps)
export const SACK_VOLUME = SACK.w * SACK.h * SACK.d * 0.92;
export const RHO_FEATHER_PILE_ILLUS = MASS_R1 / SACK_VOLUME;   // implied illustrative bulk density (kg/m^3)
export const BOX = 0.2;                               // round 2: two boxes of the same size (outer, metres)
export const BOX_IN = BOX - 0.014;
export const MASS_STEEL_BOX = RHO_STEEL * BOX_IN ** 3;
export const MASS_FEATHER_BOX = RHO_FEATHER_PILE_ILLUS * BOX_IN ** 3;

export const BAL = { pivot: [0, 0.5, 0], arm: 0.48, hang: 0.28, panR: 0.17, maxTilt: 0.27 };
/** Hook (beam-end) and pan-surface positions for a beam tilt (positive = left side down). */
export function panPositions(tilt) {
  const [px, py, pz] = BAL.pivot, c = Math.cos(tilt), s = Math.sin(tilt);
  const hookL = [px - BAL.arm * c, py - BAL.arm * s, pz], hookR = [px + BAL.arm * c, py + BAL.arm * s, pz];
  return { hookL, hookR, panL: [hookL[0], hookL[1] - BAL.hang, pz], panR: [hookR[0], hookR[1] - BAL.hang, pz] };
}
export function report() {
  return { cube_side_m: CUBE, sack_volume_m3: SACK_VOLUME, cube_volume_m3: CUBE ** 3, volume_ratio: SACK_VOLUME / CUBE ** 3,
    implied_feather_pile_density_kg_m3: RHO_FEATHER_PILE_ILLUS, box_inner_m: BOX_IN, mass_steel_box_kg: MASS_STEEL_BOX,
    mass_feather_box_kg: MASS_FEATHER_BOX, mass_ratio_round2: MASS_STEEL_BOX / MASS_FEATHER_BOX };
}
