import React from "react";
import { E, clamp, decay, kf, kfo, prog, spring, wob } from "../lib/anim";
import { Pose, STAND, Stick, solve } from "../lib/rig";
import { Burst, Clock, Fabric, SewingMachine, Slip, Stool } from "../lib/props";
import { C } from "../lib/theme";
import { T } from "../timeline";

export const TAILOR = { outfit: C.saffron, hair: "bun" as const, accent: C.gold };
export const FLOOR = 1240;

/* Shared room backdrop (tailor's corner). */
export const RoomBackdrop: React.FC<{ f: number; sec: number; window?: boolean }> = ({ f, sec, window = true }) => (
  <g>
    <rect x={-400} y={-200} width={1880} height={FLOOR + 200} fill={C.paper} />
    <rect x={-400} y={FLOOR} width={1880} height={900} fill={C.floor} />
    <rect x={-400} y={FLOOR - 8} width={1880} height={14} fill={C.floorDark} />
    {/* rug */}
    <path d={`M150 ${FLOOR + 40} L760 ${FLOOR + 40} L800 ${FLOOR + 130} L110 ${FLOOR + 130} Z`} fill={C.greenPale} />
    <path d={`M180 ${FLOOR + 70} L740 ${FLOOR + 70} M165 ${FLOOR + 100} L770 ${FLOOR + 100}`} stroke={C.gold} strokeWidth={6} strokeDasharray="18 14" />
    {window && (
      <g>
        <defs>
          <clipPath id="win">
            <path d="M610 880 L610 610 A170 170 0 0 1 950 610 L950 880 Z" />
          </clipPath>
        </defs>
        <path d="M610 880 L610 610 A170 170 0 0 1 950 610 L950 880 Z" fill={C.greenPale} />
        <g clipPath="url(#win)">
          <circle cx={858} cy={560 + wob(f, 3) * 3} r={48} fill={C.gold} />
          <path d="M600 880 L600 790 L680 790 L680 760 L760 760 L760 810 L840 810 L840 740 L900 740 L900 800 L960 800 L960 880 Z" fill={C.greenMist} />
          <path d={`M640 ${700 + wob(f, 1) * 4} q20 -12 40 0 q20 12 40 0`} fill="none" stroke={C.cream} strokeWidth={6} strokeLinecap="round" />
        </g>
        <path d="M610 880 L610 610 A170 170 0 0 1 950 610 L950 880 Z" fill="none" stroke={C.ink} strokeWidth={30} />
        <path d="M610 880 L610 610 A170 170 0 0 1 950 610 L950 880 Z" fill="none" stroke={C.cream} strokeWidth={18} />
        <line x1={780} y1={440} x2={780} y2={880} stroke={C.cream} strokeWidth={12} />
        <rect x={588} y={878} width={384} height={24} rx={6} fill={C.kraft} stroke={C.ink} strokeWidth={5} />
      </g>
    )}
    {/* shelf with fabric rolls */}
    <rect x={60} y={652} width={360} height={20} rx={5} fill={C.kraft} stroke={C.ink} strokeWidth={5} />
    {[
      [118, 616, 34, C.saffron],
      [196, 620, 30, C.green],
      [268, 614, 36, C.gold],
      [346, 622, 28, C.greenMid],
    ].map(([x, y, r, c], i) => (
      <g key={i}>
        <circle cx={x as number} cy={y as number} r={r as number} fill={c as string} stroke={C.ink} strokeWidth={5} />
        <circle cx={x as number} cy={y as number} r={(r as number) * 0.45} fill="none" stroke={C.cream} strokeWidth={3} opacity={0.7} />
      </g>
    ))}
    <Clock x={230} y={450} sec={sec} />
  </g>
);

const SEAT: Pose = {
  ...STAND, x: 450, y: 1090, s: 1, torso: 14, head: 6,
  nhx: 150, nhy: -45, fhx: 125, fhy: -32, nfx: 112, nfy: 148, ffx: 88, ffy: 150,
  mouth: 0.1, open: 0, blink: 0, brow: 0, lx: 1, ly: 0.2,
};

function tailorPose(f: number): Pose {
  const p = kfo<Pose>(f, SEAT, [
    [0, { nhx: 168, nhy: -175, torso: 12, mouth: -0.1, brow: -0.3, lx: 1, ly: -0.6 }],
    [4, { nhx: 182, nhy: -288, torso: 9 }, E.out],
    [9, { nhx: 150, nhy: -45, torso: 16, ly: 0.4 }, E.in],
    [13, { nhx: 182, nhy: -288, torso: 9, ly: -0.6 }, E.out],
    [18, { nhx: 150, nhy: -45, torso: 16, ly: 0.4 }, E.in],
    [22, { nhx: 182, nhy: -288, torso: 9, ly: -0.6 }, E.out],
    [27, { nhx: 150, nhy: -45, torso: 16, brow: -0.6, ly: 0.4 }, E.in],
    [38, { nhx: 118, nhy: -300, torso: -8, head: -10, mouth: -0.5, brow: -1, blink: 0.6, fhx: 128, fhy: -36, ly: -0.8 }, E.inOut],
    [40, { nhx: 112, nhy: -306, torso: -10 }],
    [46, { nhx: 30, nhy: -335, fhx: -50, fhy: -255, torso: -26, head: -14, open: 1, brow: 1, blink: 0, mouth: 0, ly: -1, lx: 0 }, E.out],
    [58, { nhx: 95, nhy: -150, fhx: 62, fhy: -120, torso: 4, head: 0, open: 0.45, lx: 0.6, ly: 0 }, E.inOut],
    [74, { nhx: 102, nhy: -22, fhx: 86, fhy: -16, torso: 30, head: 18, open: 0, mouth: -0.8, brow: -1, blink: 0.35, lx: 0.6, ly: 0.8 }, E.inOut],
    [84, { lx: 1, ly: 0.1, head: 8, blink: 0 }],
    [98, { lx: 1, ly: -0.2, head: 4 }],
    [110, { nhx: 128, nhy: -168, fhx: 112, fhy: -162, head: 24, torso: 32, blink: 1, mouth: -0.9 }, E.inOut],
    [119, { head: 28, torso: 35 }],
    [129, { torso: 6, head: -16, nhx: 72, nhy: -40, fhx: 60, fhy: -30, blink: 0, brow: 1, ly: -1, lx: 0.5, mouth: 0, open: 0.4 }, E.out],
    [150, { open: 0, mouth: 0.4, brow: 0.6 }],
    [186, { mouth: 0.95, nhx: 78, nhy: -122, fhx: 66, fhy: -118, brow: 0.3 }],
    [196, { nhx: 128, nhy: -300, torso: 2, head: -18, open: 0.2 }, E.inOut],
    [203, { nhx: 122, nhy: -292 }],
    [216, { nhx: 150, nhy: -110, fhx: 74, fhy: -44, torso: 8, head: -12, mouth: 1, open: 0, ly: -1, lx: 0.2 }, E.out],
    [234, { head: -20, ly: -1, lx: 0, nhx: 120, nhy: -250 }],
  ]);
  // strain tremor before the snap
  if (f > 28 && f < 40) {
    const a = (f - 28) / 12;
    p.nhx += Math.sin(f * 2.7) * 4 * a;
    p.nhy += Math.cos(f * 3.1) * 4 * a;
  }
  // breathing / idle
  p.torso += wob(f, 2, 1.5) * 1.2;
  return p;
}

const toW = (p: Pose, v: [number, number]): [number, number] => [p.x + v[0] * p.s, p.y + v[1] * p.s];

/* --------------------------------------------------------- S1 + S2 */
export const HookAndNeed: React.FC<{ f: number }> = ({ f }) => {
  const p = tailorPose(f);
  const j = solve(p);
  const hand = toW(p, j.na.e);
  const elbow = toW(p, j.na.j);
  const dl = Math.hypot(hand[0] - elbow[0], hand[1] - elbow[1]) || 1;
  const dir: [number, number] = [(hand[0] - elbow[0]) / dl, (hand[1] - elbow[1]) / dl];
  const cloth: [number, number] = [596, 1062];

  // stool tip after snap (pivot on back leg foot)
  const tilt = kf(f, [[T.snap, 0], [T.snap + 7, -7, E.out], [T.stoolLand, 2.5, E.inOut], [62, -1], [68, 0]]);

  // clock: ticks with each stitch, freezes on snap, droops on "stops", revives later
  const ticks = Math.min(4, Math.floor((f + 5) / 9));
  let sec = 30 + ticks * 30;
  if (f >= T.clockDroop - 2) sec = kf(f, [[T.clockDroop - 2, 150], [T.clockDroop + 10, 180, E.outBounce]]);
  if (f >= 128) sec = 180 + Math.floor((f - 128) / 15) * 6;

  // snapped thread & flying needle
  const t = f - T.snap;
  const n0 = SNAP_HAND;
  const needle: [number, number] = [n0[0] + 15 * t, n0[1] - 36 * t + 1.1 * t * t];

  // slips dropping onto the spike
  const slipY = [1060, 1036, 1012, 988, 964];
  const slipR = [-6, 7, -10, 5, -3];

  // thought bubble
  const dots = T.thoughtDots.map((d, i) => ({ s: spring(f, d, 3, 0.45), x: [565, 592, 624][i], y: [905, 850, 795][i], r: [13, 19, 26][i] }));
  const bub = spring(f, T.bubble, 2.4, 0.5);
  const pop = prog(f, T.cardPop, T.cardPop + 6, E.out);
  const bubS = bub * (1 + pop * 0.15);
  const bubO = 1 - pop;
  const sketch = prog(f, T.sketchStart, T.sketchEnd, E.inOut);
  const fill = prog(f, T.sketchEnd, T.sketchEnd + 10);
  // drawing morphs into the card's illustration
  const m = prog(f, T.cardPop, T.cardPop + 10, E.inOut);
  const mx = kf(f, [[T.cardPop, 620], [T.cardPop + 10, 600 - 146, E.inOut]]);
  const my = kf(f, [[T.cardPop, 655], [T.cardPop + 10, 620 + 72, E.inOut]]);
  const ms = kf(f, [[T.cardPop, 0.95], [T.cardPop + 10, 0.52, E.inOut]]);

  const cloud = [
    [0, 0, 170], [-150, 34, 112], [150, 34, 112], [-82, -110, 112], [88, -112, 112], [-62, 122, 100], [70, 122, 100],
  ];

  return (
    <g>
      <RoomBackdrop f={f} sec={sec} />
      {/* side table + order spike */}
      <g>
        <rect x={790} y={1094} width={200} height={22} rx={6} fill={C.kraft} stroke={C.ink} strokeWidth={5} />
        <path d={`M808 1116 L800 ${FLOOR} M972 1116 L980 ${FLOOR}`} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
        <line x1={890} y1={1094} x2={890} y2={930} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        {slipY.map((y, i) => {
          if (i < 2) return <Slip key={i} x={890} y={y} rot={slipR[i]} />;
          const land = T.slipLand[i - 2];
          if (f < land - 11) return null;
          const yy = kf(f, [[land - 11, -160], [land, y, E.in]]);
          const r = slipR[i] + kf(f, [[land - 11, 40 * (i % 2 ? 1 : -1)], [land, slipR[i] * 0]]) + decay(f, land, 10, 5, 6);
          return <Slip key={i} x={890 + decay(f, land, 6, 4, 5)} y={yy} rot={r} />;
        })}
        <circle cx={890} cy={930} r={6} fill={C.ink} />
      </g>

      {/* tailor on the stool, tipping as one unit */}
      <g transform={`rotate(${tilt} 358 ${FLOOR})`}>
        <Stool x={450} y={1100} h={FLOOR - 1100} />
        <Stick
          p={p}
          look={{ ...TAILOR, flutter: wob(f, 5, 3) + (f > T.snap && f < 70 ? 1.2 : 0) }}
          back={
            // cloth on the lap
            <g transform={`translate(${-p.x} ${-p.y})`}>
              <defs>
                <clipPath id="lapcloth">
                  <path d="M470 1060 L612 1050 Q626 1056 622 1076 L614 1176 L566 1176 L572 1080 L470 1086 Z" />
                </clipPath>
              </defs>
              <path d="M470 1060 L612 1050 Q626 1056 622 1076 L614 1176 L566 1176 L572 1080 L470 1086 Z" fill={C.green} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
              <g clipPath="url(#lapcloth)">
                {Array.from({ length: 30 }).map((_, k) => (
                  <circle key={k} cx={476 + (k % 6) * 28 + (Math.floor(k / 6) % 2) * 14} cy={1064 + Math.floor(k / 6) * 26} r={4.5} fill={C.gold} />
                ))}
              </g>
              {/* running stitches already made */}
              <path d="M488 1072 L512 1070 M528 1069 L552 1067 M568 1066 L590 1064" stroke={C.saffron} strokeWidth={4} strokeLinecap="round" />
            </g>
          }
          front={
            <g transform={`translate(${-p.x} ${-p.y})`}>
              {f < T.snap && (
                <g>
                  <path
                    d={threadPath(cloth, hand, f)}
                    fill="none"
                    stroke={C.saffron}
                    strokeWidth={f > 28 ? 3.2 : 4}
                    strokeLinecap="round"
                  />
                  <line x1={hand[0] - dir[0] * 6} y1={hand[1] - dir[1] * 6} x2={hand[0] + dir[0] * 34} y2={hand[1] + dir[1] * 34} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
                  <line x1={hand[0] - dir[0] * 4} y1={hand[1] - dir[1] * 4} x2={hand[0] + dir[0] * 31} y2={hand[1] + dir[1] * 31} stroke={C.steel} strokeWidth={2} strokeLinecap="round" />
                </g>
              )}
            </g>
          }
        />
        {/* the lower half of the snapped thread curls back onto the cloth */}
        {f >= T.snap && f < 130 && (
          <path d={curlPath(cloth, f - T.snap)} fill="none" stroke={C.saffron} strokeWidth={4} strokeLinecap="round" />
        )}
      </g>

      {/* snap flash + flying needle */}
      <Burst x={SNAP_MID[0]} y={SNAP_MID[1]} t={(f - T.snap) / 10} r={90} n={10} color={C.gold} w={9} />
      <Burst x={SNAP_MID[0]} y={SNAP_MID[1]} t={(f - T.snap) / 7} r={50} n={6} color={C.ink} w={5} rot={30} />
      {t >= 0 && t < 16 && (
        <g transform={`translate(${needle[0]} ${needle[1]}) rotate(${-60 + t * 42})`}>
          <line x1={0} y1={-20} x2={0} y2={20} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
          <path d={`M0 -20 q ${8 + Math.sin(t) * 6} -14 ${-4} -30`} fill="none" stroke={C.saffron} strokeWidth={3.5} strokeLinecap="round" />
        </g>
      )}
      {/* sweat drops while straining */}
      {f > 26 && f < 46 && (
        <path
          d="M0 -12 Q8 0 0 8 Q-8 0 0 -12 Z"
          transform={`translate(${toW(p, j.head)[0] - 46 + (f - 26) * -1.2} ${toW(p, j.head)[1] - 30 + (f - 26) * 1.4}) rotate(-20)`}
          fill="#8EC5D6"
          stroke={C.ink}
          strokeWidth={3}
        />
      )}

      {/* thought bubble */}
      {f >= T.thoughtDots[0] && f < T.cardPop + 8 && (
        <g opacity={bubO}>
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r * d.s} fill={C.cream} stroke={C.ink} strokeWidth={6} />
          ))}
          <g transform={`translate(620 560) scale(${bubS})`}>
            {cloud.map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r} fill="none" stroke={C.ink} strokeWidth={14} />)}
            {cloud.map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r} fill={C.cream} />)}
          </g>
          <Burst x={620} y={560} t={(f - T.cardPop) / 8} r={300} n={12} color={C.gold} w={10} />
        </g>
      )}
      {f >= T.sketchStart && f < T.cardPop + 10 && (
        <SewingMachine x={f < T.cardPop ? 620 : mx} y={f < T.cardPop ? 655 : my} s={(f < T.cardPop ? 0.95 : ms) * (f < T.cardPop ? bubS : 1)} sketch={m > 0 ? 1 : sketch} fill={fill} />
      )}
      {/* pencil that draws the sketch */}
      {f >= T.sketchStart && f < T.sketchEnd + 4 && (
        <Pencil f={f} />
      )}
    </g>
  );
};

/** Hand position at the snap frame (precomputed so the needle launches from the right place). */
const SNAP_POSE = tailorPose(T.snap);
const SNAP_HAND = toW(SNAP_POSE, solve(SNAP_POSE).na.e);
const SNAP_MID: [number, number] = [(596 + SNAP_HAND[0]) / 2, (1062 + SNAP_HAND[1]) / 2];

function threadPath(a: [number, number], b: [number, number], f: number) {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const slack = clamp(1 - len / 260) * 40;
  const vib = f > 28 ? Math.sin(f * 4.1) * 3 * ((f - 28) / 12) : 0;
  return `M${a[0]} ${a[1]} Q${mx + vib + slack * 0.6} ${my + slack + vib} ${b[0]} ${b[1]}`;
}

function curlPath(a: [number, number], t: number) {
  // thread end recoils downward and curls
  const k = clamp(t / 12);
  const len = 150 * (1 - 0.6 * k);
  const pts: string[] = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    const ang = -1.2 + u * (1 + k * 5.5);
    const r = len * u;
    pts.push(`${(a[0] + Math.cos(ang) * r * 0.55 + u * 10).toFixed(1)} ${(a[1] - Math.sin(ang) * r * (1 - k) + u * k * 40).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

const Pencil: React.FC<{ f: number }> = ({ f }) => {
  const u = prog(f, T.sketchStart, T.sketchEnd, E.inOut);
  const x = 470 + 300 * u + Math.sin(f * 1.3) * 26;
  const y = 600 + Math.cos(f * 0.9) * 50 - 40 * Math.sin(u * Math.PI);
  const o = clamp((f - T.sketchStart) / 4) * clamp((T.sketchEnd + 4 - f) / 4);
  return (
    <g transform={`translate(${x} ${y}) rotate(35)`} opacity={o}>
      <rect x={-9} y={-90} width={18} height={76} fill={C.gold} stroke={C.ink} strokeWidth={4} />
      <path d="M-9 -14 L0 6 L9 -14 Z" fill={C.kraftLight} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      <rect x={-9} y={-100} width={18} height={12} fill={C.saffron} stroke={C.ink} strokeWidth={4} />
    </g>
  );
};

/* ------------------------------------------------------------- S6 workshop */
const WSEAT: Pose = {
  ...STAND, x: 318, y: 1092, s: 1, torso: 18, head: 4,
  nhx: 168, nhy: -96, fhx: 120, fhy: -92, nfx: 150, nfy: 118, ffx: 196, ffy: 116,
  mouth: 0.8, open: 0, blink: 0, brow: 0.3, lx: 1, ly: 0.6,
};

export const Workshop: React.FC<{ f: number }> = ({ f }) => {
  const fly = (f - 690) * 22; // flywheel degrees
  const phi = (fly * Math.PI) / 180;
  const hw = fly * (72 / 46);
  const needle = (Math.sin((hw * Math.PI) / 180) + 1) / 2;
  const tread = Math.sin(phi) * 8;
  const p = kfo<Pose>(f, WSEAT, [
    [690, { mouth: 1, open: 0.3, brow: 0.8, lx: 0.4, ly: -0.4, torso: 10 }],
    [704, { mouth: 0.8, open: 0, brow: 0.3, lx: 1, ly: 0.6, torso: 18 }],
    [744, { lx: 1, ly: 0.4 }],
    [752, { lx: 1, ly: -0.6, head: -4 }],
    [764, { lx: 1, ly: 0.6, head: 4 }],
    [774, { lx: 1, ly: -0.6, head: -4 }],
    [782, { lx: 0, ly: 0, head: -6, mouth: 1 }],
  ]);
  p.nhx += Math.sin(phi * 2) * 3;
  p.fhx += Math.sin(phi * 2 + 1) * 3;
  p.nfy += tread;
  p.ffy -= tread;
  p.head += Math.sin(phi) * 1.5;
  p.y += Math.abs(Math.sin(phi)) * -1.5;
  const sec = 180 + Math.floor((f - 690) / 15) * 6 + 60;

  const kurtas = [
    { at: T.kurta[0], x: 900, color: C.green, trim: C.gold },
    { at: T.kurta[1], x: 1000, color: C.cream, trim: C.saffron },
  ];
  const tableTop = 1010;
  const fwx = 770;
  const fwy = 1136;
  return (
    <g>
      <RoomBackdrop f={f} sec={sec} window={false} />
      {/* garment rack */}
      <g>
        <path d={`M850 460 L850 ${FLOOR} M1050 460 L1050 ${FLOOR}`} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={836} y1={470} x2={1064} y2={470} stroke={C.ink} strokeWidth={12} strokeLinecap="round" />
        {/* an earlier garment already hanging */}
        <KurtaOnRack f={f} x={952} at={0} color={C.saffron} trim={C.green} />
      </g>
      {/* table + treadle stand */}
      <g>
        <path d={`M400 ${tableTop + 26} L372 ${FLOOR} M400 ${tableTop + 26} L428 ${FLOOR} M820 ${tableTop + 26} L792 ${FLOOR} M820 ${tableTop + 26} L848 ${FLOOR}`} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        <line x1={386} y1={1160} x2={834} y2={1160} stroke={C.ink} strokeWidth={8} />
        <circle cx={400} cy={1120} r={18} fill="none" stroke={C.ink} strokeWidth={7} />
        {/* flywheel */}
        <g transform={`translate(${fwx} ${fwy}) rotate(${fly})`}>
          <circle r={70} fill="none" stroke={C.ink} strokeWidth={12} />
          {[0, 120, 240].map((a) => (
            <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * 64} y2={Math.sin((a * Math.PI) / 180) * 64} stroke={C.ink} strokeWidth={7} />
          ))}
          <circle cx={46} cy={0} r={7} fill={C.gold} />
          <circle r={10} fill={C.gold} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* pitman rod from treadle to flywheel crank pin */}
        <line
          x1={600}
          y1={FLOOR - 22 + Math.sin((tread * Math.PI) / 180) * 120}
          x2={fwx + Math.cos(phi) * 46}
          y2={fwy + Math.sin(phi) * 46}
          stroke={C.inkSoft}
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* treadle plate rocking */}
        <g transform={`translate(480 ${FLOOR - 22}) rotate(${tread})`}>
          <rect x={-90} y={-8} width={210} height={18} rx={5} fill={C.kraftDark} stroke={C.ink} strokeWidth={5} />
          <circle r={8} fill={C.gold} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* belt from flywheel to hand wheel */}
        <line x1={fwx - 66} y1={fwy - 20} x2={640 + 165 - 44} y2={tableTop - 150} stroke={C.saffronDeep} strokeWidth={5} />
        <line x1={fwx + 66} y1={fwy - 20} x2={640 + 165 + 44} y2={tableTop - 150} stroke={C.saffronDeep} strokeWidth={5} />
        <rect x={360} y={tableTop} width={500} height={28} rx={6} fill={C.kraft} stroke={C.ink} strokeWidth={6} />
      </g>
      {/* stool + tailor */}
      <Stool x={318} y={1102} h={FLOOR - 1102} />
      <Stick p={p} look={{ ...TAILOR, flutter: wob(f, 5, 3) }} />
      {/* machine + fabric feeding through */}
      <SewingMachine x={640} y={tableTop} wheel={hw} needle={needle} />
      <defs>
        <clipPath id="feed">
          <rect x={360} y={tableTop - 80} width={480} height={80} />
        </clipPath>
      </defs>
      <g clipPath="url(#feed)">
        <Fabric x={392} y={tableTop - 22} w={470} h={20} offset={(f - 690) * 5} />
      </g>
      <path d={`M${496} ${tableTop - 12} L${640 - 140} ${tableTop - 12}`} stroke={C.saffron} strokeWidth={3} />
      {/* hands on top of the fabric */}
      <g transform={`translate(${p.x} ${p.y}) scale(${p.s})`}>
        {(() => {
          const j = solve(p);
          return (
            <>
              <path d={`M${j.sh[0]} ${j.sh[1]} L${j.na.j[0]} ${j.na.j[1]} L${j.na.e[0]} ${j.na.e[1]}`} fill="none" stroke={C.ink} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={j.na.e[0]} cy={j.na.e[1]} r={8.5} fill={C.ink} />
            </>
          );
        })()}
      </g>
      {/* finished kurtas fly to the rack */}
      {kurtas.map((k, i) => (
        <KurtaFlight key={i} f={f} {...k} />
      ))}
      {/* motion lines on the flywheel */}
      <path d={`M${fwx - 92} ${fwy - 40} A100 100 0 0 1 ${fwx - 40} ${fwy - 92}`} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.35} strokeLinecap="round" />
    </g>
  );
};

const KurtaOnRack: React.FC<{ f: number; x: number; at: number; color: string; trim: string }> = ({ f, x, at, color, trim }) => {
  const sw = decay(f, at, 8, 1.6, 14);
  return (
    <g transform={`translate(${x} 470) rotate(${sw})`}>
      <g transform="scale(0.72)">
        <path d="M0 0 L0 -18 Q0 -28 10 -28" fill="none" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <path d="M-60 6 L60 6" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        <path d="M-26 10 L-62 24 L-92 98 L-66 108 L-48 66 L-50 202 Q0 212 50 202 L48 66 L66 108 L92 98 L62 24 L26 10 Q0 28 -26 10 Z" fill={color} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M0 20 L0 86" stroke={trim} strokeWidth={7} strokeLinecap="round" />
        <path d="M-48 182 Q0 192 48 182" fill="none" stroke={trim} strokeWidth={7} />
      </g>
    </g>
  );
};

const KurtaFlight: React.FC<{ f: number; at: number; x: number; color: string; trim: string }> = ({ f, at, x, color, trim }) => {
  const start = at - 16;
  if (f < start) return null;
  if (f >= at) return <KurtaOnRack f={f} x={x} at={at} color={color} trim={trim} />;
  const u = (f - start) / 16;
  const e = E.inOut(u);
  const sx = 830;
  const sy = 960;
  const px = sx + (x - sx) * e;
  const py = sy + (470 - sy) * e - Math.sin(u * Math.PI) * 160;
  const s = 0.25 + 0.47 * E.out(u);
  return (
    <g transform={`translate(${px} ${py}) rotate(${(1 - e) * 220})`}>
      <g transform={`scale(${s})`}>
        <path d="M-26 10 L-62 24 L-92 98 L-66 108 L-48 66 L-50 202 Q0 212 50 202 L48 66 L66 108 L92 98 L62 24 L26 10 Q0 28 -26 10 Z" fill={color} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d="M0 20 L0 86" stroke={trim} strokeWidth={7} strokeLinecap="round" />
      </g>
    </g>
  );
};
