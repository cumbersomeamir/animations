import React from "react";
import { E, clamp, decay, kf, kfo, prog, qbez, spring, wob } from "../lib/anim";
import { Pose, STAND, Stick } from "../lib/rig";
import { BikeGlyph, Burst, Phone, Star, ToolboxGlyph } from "../lib/props";
import { C, FONT } from "../lib/theme";
import { T } from "../timeline";
import { PHONE, fundX } from "./Desk";

export const SUPPORTER = { outfit: C.green, hair: "short" as const };
export const NODE_X = [150, 345, 540, 735, 930];
export const NODE_Y = 290;

const BASE: Pose = {
  ...STAND, x: 330, y: 1090, s: 1.3, torso: 8, head: 6,
  nhx: 40, nhy: 26, fhx: 101, fhy: -123,
  nfx: 22, nfy: 200, ffx: -16, ffy: 200,
  mouth: 0.4, open: 0, blink: 0, brow: 0.2, lx: 1, ly: 0.2,
};

function supporterPose(f: number): Pose {
  const p = kfo<Pose>(f, BASE, [
    [368, {}],
    [388, { nhx: 60, nhy: -20 }],
    [396, { nhx: 128, nhy: -128, brow: 0.6, mouth: 0.6 }, E.inOut],
    [404, { nhx: 108, nhy: -162, torso: 4, head: 2 }, E.inOut],
    [T.tap, { nhx: 165, nhy: -98, torso: 11, head: 8 }, E.in],
    [T.tap + 4, { nhx: 162, nhy: -100 }],
    [T.tap + 10, { nhx: 120, nhy: -130, torso: 6 }, E.out],
    [420, { nhx: 70, nhy: -300, mouth: 1, open: 0.55, brow: 1, blink: 0, ly: -1, lx: 0.6, head: -10 }, E.out],
    [427, { nhx: 90, nhy: -220, torso: 9 }, E.inOut],
    [433, { nhx: 70, nhy: -305, torso: 4 }, E.out],
    [444, { nhx: 80, nhy: -260, open: 0.2, mouth: 1, ly: -1, lx: 0.3 }],
  ]);
  p.torso += wob(f, 7, 1.4) * 1.2;
  return p;
}

const MiniCard: React.FC<{ y: number; kind: "bike" | "tool"; o: number }> = ({ y, kind, o }) => (
  <g transform={`translate(0 ${y})`} opacity={o}>
    <rect x={-118} y={-80} width={236} height={160} rx={14} fill={C.cream} stroke={C.ink} strokeWidth={3} filter="url(#paper)" />
    <rect x={-106} y={-68} width={92} height={136} rx={10} fill={C.greenPale} />
    {kind === "bike" ? <BikeGlyph x={-60} y={0} s={1.25} /> : <ToolboxGlyph x={-60} y={4} s={1.1} />}
    <rect x={0} y={-40} width={92} height={14} rx={7} fill={C.ink} opacity={0.75} />
    <rect x={0} y={-14} width={70} height={12} rx={6} fill={C.inkSoft} opacity={0.4} />
    <rect x={0} y={20} width={64} height={24} rx={12} fill={C.gold} opacity={0.8} />
  </g>
);

export const Fund: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.deskOut - 2 || f > T.fundOut + 26) return null;
  const ox = fundX(f);
  const p = supporterPose(f);
  const listIn = prog(f, T.fundIn - 6, T.fundIn + 12, E.out);
  const listOut = prog(f, T.pick + 4, T.pick + 14, E.in);
  const dim = f >= T.pick ? 1 - 0.6 * clamp((f - T.pick) / 4) : 1;
  const btn = spring(f, T.pick + 8, 2.6, 0.45);
  const press = f >= T.tap ? Math.max(0, 1 - (f - T.tap) / 4) : 0;
  const tapped = f >= T.tap + 2;
  const ripple = (f - T.tap) / 14;
  const phoneRock = decay(f, T.tap, 2.5, 4, 5);
  return (
    <g transform={`translate(${ox} 0)`}>
      <rect x={-400} y={-200} width={1880} height={2400} fill={C.paper} />
      <circle cx={600} cy={820} r={430} fill={C.greenPale} />
      <rect x={-400} y={1350} width={1880} height={700} fill={C.floor} />
      <rect x={-400} y={1342} width={1880} height={14} fill={C.floorDark} />
      {/* hanging lamp */}
      <line x1={930} y1={-20} x2={930} y2={500} stroke={C.ink} strokeWidth={5} />
      <path d={`M860 ${560} Q930 ${470} 1000 ${560} Z`} fill={C.gold} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      {/* plant */}
      <g transform="translate(120 1350)">
        {[-50, -20, 10, 40, 70].map((a, i) => (
          <ellipse key={i} cx={0} cy={-150} rx={26} ry={84} fill={i % 2 ? C.greenMid : C.green} transform={`rotate(${a - 10 + wob(f, i, 2) * 4} 0 -60)`} />
        ))}
        <path d="M-62 -70 L62 -70 L48 0 L-48 0 Z" fill={C.saffron} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      </g>
      <Stick
        p={p}
        look={SUPPORTER}
        mid={
          <g transform={`scale(${1 / p.s}) translate(${-p.x} ${-p.y})`}>
            <Phone x={PHONE.x} y={PHONE.y} s={PHONE.s} rot={phoneRock} id="ph">
              <g opacity={listIn}>
                <Star x={-98} y={-226} r={14} />
                <rect x={-74} y={-234} width={96} height={14} rx={7} fill={C.ink} opacity={0.7} />
                <circle cx={96} cy={-227} r={14} fill={C.greenPale} stroke={C.ink} strokeWidth={3} />
              </g>
              <MiniCard y={kf(f, [[T.fundIn - 6, -420], [T.fundIn + 10, -110, E.out], [T.pick + 4, -110], [T.pick + 14, -520, E.in]])} kind="bike" o={dim * (1 - listOut * 0.3)} />
              <MiniCard y={kf(f, [[T.fundIn - 6, 640], [T.fundIn + 12, 250, E.out], [T.pick + 4, 250], [T.pick + 14, 680, E.in]])} kind="tool" o={dim * (1 - listOut * 0.3)} />
              {f >= T.pick + 6 && (
                <g transform={`translate(0 150) scale(${btn * (1 - press * 0.12)})`}>
                  <rect x={-112} y={-34} width={224} height={68} rx={34} fill={tapped ? C.gold : C.green} stroke={C.ink} strokeWidth={4} />
                  {tapped ? (
                    <path d="M-22 0 L-6 16 L24 -16" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(f, T.tap + 2, T.tap + 8)} />
                  ) : (
                    <text x={0} y={12} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={34} fill={C.cream}>Fund</text>
                  )}
                  {ripple > 0 && ripple < 1 && (
                    <rect x={-112 - ripple * 40} y={-34 - ripple * 40} width={224 + ripple * 80} height={68 + ripple * 80} rx={34 + ripple * 40} fill="none" stroke={C.gold} strokeWidth={6 * (1 - ripple)} />
                  )}
                </g>
              )}
            </Phone>
          </g>
        }
      />
    </g>
  );
};

/** Gold star launched by the tap, arcing up to the "Funded" checkpoint. */
export const FundStar: React.FC<{ f: number }> = ({ f }) => {
  const a = T.tap + 2;
  const b = T.starHit;
  if (f < a || f > b) return null;
  const start: [number, number] = [PHONE.x + fundX(f), PHONE.y + 150 * PHONE.s];
  const ctrl: [number, number] = [1000, 360];
  const end: [number, number] = [NODE_X[2], NODE_Y];
  const at = (ff: number) => qbez(start, ctrl, end, E.inOut2(clamp((ff - a) / (b - a))));
  const pos = at(f);
  const grow = spring(f, a, 3, 0.5);
  return (
    <g>
      {[6, 5, 4, 3, 2, 1].map((k) => {
        const q = at(f - k * 1.2);
        return <Star key={k} x={q[0]} y={q[1]} r={(30 - k * 3.5) * grow} opacity={0.12 * (7 - k)} />;
      })}
      <circle cx={pos[0]} cy={pos[1]} r={52 * grow} fill={C.gold} opacity={0.22} />
      <Star x={pos[0]} y={pos[1]} r={40 * grow} rot={(f - a) * 14} stroke={C.ink} />
      <Burst x={start[0]} y={start[1]} t={(f - a) / 8} r={120} n={10} color={C.gold} w={8} />
    </g>
  );
};
