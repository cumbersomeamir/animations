import React from "react";
import { E, clamp, decay, kf, prog, spring, wob } from "../lib/anim";
import { Burst, Magnifier, RequestCard, Stamp, Star } from "../lib/props";
import { C } from "../lib/theme";
import { T } from "../timeline";

/** Scene offsets shared by the card, desk and phone scenes. */
export const deskY = (f: number) => kf(f, [[T.roomOut, -1500], [T.deskIn, 0, E.inOut]]);
export const deskX = (f: number) => kf(f, [[T.deskOut, 0], [T.fundIn, -1100, E.inOut]]);
export const fundX = (f: number) => kf(f, [[T.deskOut, 1100], [T.fundIn, 0, E.inOut], [T.fundOut, 0], [T.fundOut + 22, -1100, E.inOut]]);

// phone geometry (world, before fundX)
export const PHONE = { x: 600, y: 820, s: 0.95 };
export const slotWorld = (lx: number, ly: number) => [PHONE.x + lx * PHONE.s, PHONE.y + ly * PHONE.s] as [number, number];

const DESK_CARD = { x: 540, y: 930, s: 1.3, rot: -2 };

/** Card pose across S2→S4 (one continuous object). */
export function cardState(f: number) {
  // S2: pops out of the thought bubble
  const pop = spring(f, T.cardPop, 2.2, 0.55);
  let x = 600;
  let y = 620 + wob(f, 4, 2) * 4;
  let s = 0.3 + 0.7 * pop;
  let rot = 0;
  let sx = clamp(prog(f, T.cardPop, T.cardPop + 8, E.out));
  if (f >= T.roomOut) {
    const u = prog(f, T.roomOut, T.deskIn, E.inOut);
    x = 600 + (DESK_CARD.x - 600) * u;
    y = 620 + (DESK_CARD.y - 620) * u - Math.sin(u * Math.PI) * 120;
    s = 1 + (DESK_CARD.s - 1) * u;
    rot = kf(f, [[T.roomOut, 0], [T.roomOut + 12, -9], [T.deskIn, DESK_CARD.rot, E.out]]) + decay(f, T.deskIn, 2.5, 3, 6);
    sx = 1;
  }
  if (f >= T.deskIn) {
    x = DESK_CARD.x;
    y = DESK_CARD.y + (f >= T.stamp ? decay(f, T.stamp, 6, 8, 3) : 0);
    s = DESK_CARD.s;
    if (f >= T.stamp) s += decay(f, T.stamp, 0.025, 5, 5);
  }
  // S3→S4: shrink into the middle slot of the phone list
  const slot = slotWorld(0, 70);
  if (f >= T.deskOut) {
    const u = prog(f, T.deskOut, T.fundIn - 2, E.inOut);
    x = DESK_CARD.x + (slot[0] - DESK_CARD.x) * u;
    y = DESK_CARD.y + (slot[1] - DESK_CARD.y) * u - Math.sin(u * Math.PI) * 140;
    s = DESK_CARD.s + (0.42 * PHONE.s - DESK_CARD.s) * u;
    rot = DESK_CARD.rot * (1 - u) + Math.sin(u * Math.PI) * 10;
  }
  // S4: picked → lifted to the top of the screen
  if (f >= T.fundIn - 2) {
    const up = prog(f, T.pick + 4, T.pick + 14, E.inOut);
    const top = slotWorld(0, -60);
    x = slot[0] + (top[0] - slot[0]) * up;
    y = slot[1] + (top[1] - slot[1]) * up;
    s = 0.42 * PHONE.s + (0.44 - 0.42) * PHONE.s * up;
    s *= 1 + decay(f, T.pick, 0.08, 4, 4);
    rot = 0;
    x += fundX(f);
  }
  const glow = f >= T.pick && f < T.fundOut + 30 ? clamp((f - T.pick) / 4) : 0;
  const stamp = f >= T.stamp ? clamp((f - T.stamp) / 4) : 0;
  const tagPop = kf(f, [[316, 0], [321, 1, E.out], [330, 0, E.inOut]]);
  return { x, y, s, rot, sx, glow, stamp, tagPop };
}

export const CardFlight: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.cardPop || f >= T.fundOut + 24) return null;
  const c = cardState(f);
  return <RequestCard x={c.x} y={c.y} s={c.s} rot={c.rot} sx={c.sx} stamp={c.stamp} glow={c.glow} tagPop={c.tagPop} />;
};

/* ---------------------------------------------------------------- S3 */
export const Desk: React.FC<{ f: number }> = ({ f }) => {
  const oy = deskY(f);
  const ox = deskX(f);
  const cupJump = f >= T.stamp ? Math.max(0, Math.sin(clamp((f - T.stamp) / 10) * Math.PI)) * 34 : 0;
  return (
    <g transform={`translate(${ox} ${oy})`}>
      <rect x={-400} y={-200} width={1880} height={2400} fill={C.paper} />
      {/* desk blotter */}
      <g transform="rotate(-1.5 540 930)">
        <rect x={64} y={560} width={952} height={760} rx={40} fill={C.green} filter="url(#paper)" />
        <rect x={92} y={588} width={896} height={704} rx={28} fill="none" stroke={C.gold} strokeWidth={4} strokeDasharray="22 14" />
      </g>
      {/* chai cup that jumps when the stamp lands */}
      <g transform={`translate(196 ${700 - cupJump})`}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${-18 + i * 18} -60 q ${10 + wob(f, i, 3) * 6} -20 0 -40 q ${-10 + wob(f, i + 4, 3) * 6} -20 0 -40`} fill="none" stroke={C.cream} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
        ))}
        <path d="M-46 -50 L46 -50 L36 40 Q34 52 22 52 L-22 52 Q-34 52 -36 40 Z" fill={C.cream} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M44 -26 q 34 0 30 26 q -4 22 -34 20" fill="none" stroke={C.ink} strokeWidth={8} />
        <path d="M-42 -20 L42 -20" stroke={C.saffron} strokeWidth={8} />
      </g>
      {/* ink pad */}
      <g transform="translate(860 690) rotate(6)">
        <rect x={-82} y={-46} width={164} height={92} rx={12} fill={C.kraft} stroke={C.ink} strokeWidth={6} />
        <rect x={-66} y={-32} width={132} height={64} rx={8} fill={C.ink} opacity={0.85} />
      </g>
      {/* pencil */}
      <g transform="translate(860 1230) rotate(-30)">
        <rect x={-100} y={-10} width={170} height={20} fill={C.gold} stroke={C.ink} strokeWidth={5} />
        <path d="M70 -10 L100 0 L70 10 Z" fill={C.kraftLight} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      </g>
    </g>
  );
};

/** Items that must render above the card (lens, stamp, sparkles). */
export const DeskOver: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.lensIn || f > T.deskOut + 30) return null;
  const oy = deskY(f);
  const ox = deskX(f);
  const lx = kf(f, [[T.lensIn, 1250], [T.lensIn + 12, 360, E.out], [T.lensIn + 32, 730, E.inOut], [T.lensIn + 44, 1300, E.in]]);
  const ly = kf(f, [[T.lensIn, 1500], [T.lensIn + 12, 905, E.out], [T.lensIn + 22, 860], [T.lensIn + 32, 930, E.inOut], [T.lensIn + 44, 1350, E.in]]);
  const lrot = kf(f, [[T.lensIn, 20], [T.lensIn + 12, -4], [T.lensIn + 32, 8], [T.lensIn + 44, 30]]);
  const target = { x: 714, y: 1100 };
  const sy = kf(f, [
    [262, -400],
    [276, target.y - 210, E.out],
    [286, target.y - 290, E.inOut],
    [T.stamp, target.y, E.in],
    [T.stamp + 6, target.y],
    [T.stamp + 22, -440, E.in],
  ]);
  let squash = 0;
  if (f > 282 && f < T.stamp) squash = -0.5 * prog(f, 282, 288);
  if (f >= T.stamp) squash = f < T.stamp + 3 ? 0.9 : Math.max(-0.2, decay(f, T.stamp + 3, 0.6, 3, 4));
  const c = cardState(f);
  const k = 1.7;
  return (
    <g transform={`translate(${ox} ${oy})`}>
      {f < T.lensIn + 46 && (
        <Magnifier x={lx} y={ly} rot={lrot} id="lens" r={118}>
          <g transform={`scale(${k}) translate(${-lx} ${-ly})`}>
            <rect x={0} y={400} width={1080} height={1000} fill={C.green} />
            <RequestCard x={c.x} y={c.y} s={c.s} rot={c.rot} />
          </g>
        </Magnifier>
      )}
      {/* tiny check sparkles as the lens passes */}
      {[[400, 860, 266], [620, 860, 272], [650, 960, 278]].map(([x, y, at], i) => {
        const s = spring(f, at, 3, 0.4) * (1 - prog(f, at + 10, at + 18));
        return s > 0.01 ? <Star key={i} x={x} y={y} r={22 * s} fill={C.gold} stroke={C.ink} /> : null;
      })}
      {f >= 262 && f < T.stamp + 24 && <Stamp x={target.x} y={sy} rot={-7} squash={squash} s={1} />}
      {/* ink splats + impact lines */}
      <Burst x={target.x} y={target.y - 20} t={(f - T.stamp) / 9} r={210} n={14} color={C.gold} w={9} />
      {f >= T.stamp && f < T.stamp + 14 &&
        Array.from({ length: 7 }).map((_, i) => {
          const a = -Math.PI * (0.1 + (i / 6) * 0.8);
          const d = (f - T.stamp) * (10 + (i % 3) * 4);
          return <circle key={i} cx={target.x + Math.cos(a) * (150 + d)} cy={target.y - 10 + Math.sin(a) * (30 + d * 0.5) + (f - T.stamp) ** 2 * 0.8} r={7 - (f - T.stamp) * 0.4} fill={C.green} stroke={C.ink} strokeWidth={2} />;
        })}
    </g>
  );
};
