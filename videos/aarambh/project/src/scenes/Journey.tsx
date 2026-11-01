import React from "react";
import { E, clamp, decay, kf, kfo, prog, qbez, spring, wob } from "../lib/anim";
import { Pose, STAND, Stick } from "../lib/rig";
import { Bicycle, Box, Burst, SewingMachine, Star } from "../lib/props";
import { C } from "../lib/theme";
import { T } from "../timeline";
import { TAILOR } from "./Room";
import { NODE_X, NODE_Y } from "./Fund";

const GROUND = 1250;
export const COURIER = { outfit: C.gold, hair: "cap" as const };

/* ---------------------------------------------------- bike kinematics */
const STOP_X = 700;
const VMAX = 18;
const BX: number[] = (() => {
  const out: number[] = [];
  let x = STOP_X;
  for (let f = 0; f <= 900; f++) {
    let v = 0;
    if (f > T.rideStart && f <= T.rideStart + 24) v = (VMAX * (f - T.rideStart)) / 24;
    else if (f > T.rideStart + 24 && f <= 610) v = VMAX;
    else if (f > 610 && f <= T.rideEnd) v = (VMAX * (T.rideEnd - f)) / (T.rideEnd - 610);
    x += v;
    out.push(x);
  }
  return out;
})();
export const RIDE_DIST = BX[900] - STOP_X;

export const bikeX = (f: number) => {
  if (f < T.bikeStop) return kf(f, [[498, -320], [T.bikeStop, STOP_X, E.out]]);
  const i = Math.floor(f);
  const fr = f - i;
  return BX[i] + (BX[Math.min(900, i + 1)] - BX[i]) * fr;
};
const camX = (f: number) => (f < T.rideStart ? 0 : bikeX(f) - kf(f, [[T.rideStart, STOP_X], [584, 470, E.inOut]]));
export const rideProgress = (f: number) => clamp((bikeX(f) - STOP_X) / RIDE_DIST);
export const journeyX = (f: number) => kf(f, [[T.fundOut, 1100], [T.fundOut + 22, 0, E.inOut]]);

const DOOR_X = 2600; // world
const TAILOR_X = 2650;
const DROP_X = 2480;

/* ---------------------------------------------------- parallax street */
const Skyline: React.FC<{ off: number }> = ({ off }) => {
  const period = 640;
  const start = Math.floor(off / period) - 1;
  const items = [];
  for (let k = start; k < start + 4; k++) {
    const x0 = k * period - off;
    items.push(
      <g key={k} transform={`translate(${x0} 0)`}>
        <rect x={0} y={880} width={150} height={380} fill={C.greenMist} />
        <rect x={160} y={800} width={120} height={460} fill={C.greenPale} />
        <rect x={290} y={930} width={180} height={330} fill={C.greenMist} />
        <rect x={480} y={850} width={140} height={410} fill={C.greenPale} />
        <rect x={190} y={760} width={50} height={40} rx={8} fill={C.greenMist} />
        <rect x={510} y={815} width={46} height={35} rx={8} fill={C.greenMist} />
        {[0, 1, 2].map((r) =>
          [0, 1].map((c) => <rect key={`${r}${c}`} x={22 + c * 62} y={920 + r * 80} width={34} height={44} rx={4} fill={C.paper} opacity={0.7} />),
        )}
        {[0, 1, 2].map((r) => <rect key={`b${r}`} x={318 + r * 52} y={970} width={30} height={40} rx={4} fill={C.paper} opacity={0.6} />)}
      </g>,
    );
  }
  return <g>{items}</g>;
};

const MidLayer: React.FC<{ off: number; f: number }> = ({ off, f }) => {
  const period = 560;
  const start = Math.floor(off / period) - 1;
  const items = [];
  for (let k = start; k < start + 4; k++) {
    const x0 = k * period - off;
    items.push(
      <g key={k} transform={`translate(${x0} 0)`}>
        {/* tree */}
        <rect x={86} y={1050} width={20} height={200} fill={C.ink} />
        <circle cx={96} cy={1000} r={88} fill={k % 2 ? C.greenMid : C.green} />
        <circle cx={60} cy={960} r={10} fill={C.gold} opacity={0.8} />
        {/* lamp post */}
        <line x1={330} y1={890} x2={330} y2={1250} stroke={C.ink} strokeWidth={10} />
        <path d="M330 892 Q330 862 362 862" fill="none" stroke={C.ink} strokeWidth={8} />
        <circle cx={366} cy={874} r={14} fill={C.gold} stroke={C.ink} strokeWidth={4} />
        {/* shop awning */}
        <g transform="translate(400 1060)">
          <rect x={0} y={0} width={150} height={190} fill={C.cream} stroke={C.ink} strokeWidth={5} />
          <path d={`M-10 0 L160 0 L150 ${36 + wob(f, k, 3) * 2} L0 ${36 + wob(f, k, 3) * 2} Z`} fill={k % 2 ? C.saffron : C.green} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <rect x={40} y={80} width={70} height={110} fill={C.greenPale} stroke={C.ink} strokeWidth={4} />
        </g>
      </g>,
    );
  }
  return <g>{items}</g>;
};

const Road: React.FC<{ off: number }> = ({ off }) => (
  <g>
    <rect x={-50} y={GROUND} width={1180} height={700} fill={C.floor} />
    <rect x={-50} y={GROUND - 6} width={1180} height={16} fill={C.floorDark} />
    <rect x={-50} y={GROUND + 120} width={1180} height={150} fill={C.floorDark} opacity={0.6} />
    {Array.from({ length: 10 }).map((_, i) => {
      const x = ((i * 160 - off) % 1600 + 1600) % 1600 - 160;
      return <rect key={i} x={x} y={GROUND + 188} width={90} height={12} rx={6} fill={C.cream} />;
    })}
  </g>
);

const Foreground: React.FC<{ off: number }> = ({ off }) => (
  <g>
    {Array.from({ length: 6 }).map((_, i) => {
      const x = ((i * 380 - off) % 2280 + 2280) % 2280 - 300;
      return (
        <g key={i} transform={`translate(${x} ${GROUND + 330})`}>
          <path d="M0 0 Q20 -70 36 0 Q52 -90 70 0 Q88 -60 104 0 Z" fill={C.green} />
        </g>
      );
    })}
  </g>
);

/* ---------------------------------------------------- tailor's shop */
const Shop: React.FC<{ f: number }> = ({ f }) => (
  <g transform={`translate(${DOOR_X} 0)`}>
    <rect x={-260} y={560} width={640} height={GROUND - 560} fill={C.kraftLight} stroke={C.ink} strokeWidth={6} />
    <rect x={-280} y={540} width={680} height={36} rx={6} fill={C.green} stroke={C.ink} strokeWidth={6} />
    {/* arched doorway with curtain */}
    <path d={`M-110 ${GROUND} L-110 820 A110 110 0 0 1 110 820 L110 ${GROUND} Z`} fill={C.ink} />
    <path d={`M-96 ${GROUND} L-96 824 A96 96 0 0 1 96 824 L96 ${GROUND} Z`} fill={C.saffron} />
    {[-60, -20, 20, 60].map((x, i) => (
      <path key={i} d={`M${x} 760 Q${x + 12 + wob(f, i, 3) * 6} 1000 ${x} ${GROUND}`} fill="none" stroke={C.saffronDeep} strokeWidth={6} />
    ))}
    {/* sign: needle and thread */}
    <g transform="translate(0 650)">
      <rect x={-90} y={-46} width={180} height={92} rx={14} fill={C.cream} stroke={C.ink} strokeWidth={6} />
      <line x1={-40} y1={24} x2={40} y2={-24} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <ellipse cx={34} cy={-20} rx={7} ry={4} fill={C.cream} transform="rotate(-31 34 -20)" />
      <path d="M38 -22 Q 70 10 20 20 Q -20 30 -50 0" fill="none" stroke={C.saffron} strokeWidth={5} strokeLinecap="round" />
    </g>
    {/* window with a kurta inside */}
    <rect x={170} y={760} width={160} height={200} rx={10} fill={C.greenPale} stroke={C.ink} strokeWidth={6} />
    <path d="M250 790 L214 806 L200 860 L218 866 L226 838 L226 930 L274 930 L274 838 L282 866 L300 860 L286 806 Z" fill={C.green} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    <g transform="translate(-200 1250)">
      <path d="M-40 -80 L40 -80 L30 0 L-30 0 Z" fill={C.saffron} stroke={C.ink} strokeWidth={5} />
      <circle cx={0} cy={-120} r={46} fill={C.greenMid} />
      <circle cx={-22} cy={-140} r={26} fill={C.green} />
    </g>
  </g>
);

/* ---------------------------------------------------- characters */
function courierPose(f: number, crank: number): Pose {
  const a = (crank * Math.PI) / 180;
  const ped1: [number, number] = [-8 + Math.cos(a) * 30, -72 + Math.sin(a) * 30];
  const ped2: [number, number] = [-8 - Math.cos(a) * 30, -72 - Math.sin(a) * 30];
  const hip: [number, number] = [-58, -214];
  const stopped = (f >= T.bikeStop - 2 && f < T.rideStart + 4) || f >= T.rideEnd - 2 ? 1 : 0;
  const footDown = stopped
    ? Math.min(prog(f, T.bikeStop - 2, T.bikeStop + 4) + (f >= T.rideEnd ? prog(f, T.rideEnd - 2, T.rideEnd + 4) : 0), 1) * (f < T.rideStart + 4 || f >= T.rideEnd - 2 ? 1 : 0)
    : 0;
  const lean = 28 + decay(f, T.bikeStop, 8, 3, 5) + decay(f, T.rideEnd, 10, 3, 5);
  let nh: [number, number] = [178, 0];
  let mouth = 0.6;
  let open = 0;
  let ly = 0;
  // bell ring: thumb flicks up
  if (f >= 556 && f < 572) nh = [172, -10 + Math.sin((f - 556) * 1.4) * 6];
  // wave goodbye after drop-off
  if (f >= T.boxDrop - 6) {
    const w = prog(f, T.boxDrop - 6, T.boxDrop + 2);
    nh = [178 + (90 - 178) * w + Math.sin(f * 0.7) * 22 * w, -260 * w];
    mouth = 1;
    open = 0.3 * w;
  }
  if (f >= 640 && f < T.boxDrop) ly = 0.6;
  const nf: [number, number] = [ped1[0] - hip[0], ped1[1] - hip[1]];
  const ground: [number, number] = [30, 212];
  const nfx = nf[0] + (ground[0] - nf[0]) * footDown;
  const nfy = nf[1] + (ground[1] - nf[1]) * footDown;
  return {
    ...STAND, x: hip[0], y: hip[1] + Math.sin(a * 2) * 1.5 * (1 - footDown), s: 1, torso: lean, head: -8,
    nhx: nh[0], nhy: nh[1], fhx: 172, fhy: 4,
    nfx, nfy, ffx: ped2[0] - hip[0], ffy: ped2[1] - hip[1],
    mouth, open, blink: f % 70 < 3 ? 1 : 0, brow: 0.3, lx: 1, ly,
  };
}

function tailorPose(f: number): Pose {
  const base: Pose = { ...STAND, x: TAILOR_X, y: GROUND - 200, mouth: 0.5, lx: 1, ly: 0, brow: 0.3 };
  const p = kfo<Pose>(f, base, [
    [590, {}],
    [600, { nhx: 50, nhy: -290, mouth: 1, brow: 0.7 }],
    [636, { nhx: 50, nhy: -290 }],
    [644, { nhx: 70, nhy: -178, fhx: 58, fhy: -172, open: 0.7, brow: 1, mouth: 0.5 }, E.out],
    [T.boxDrop + 2, { nhx: 70, nhy: -178, fhx: 58, fhy: -172, open: 0.5, ly: 0.8 }],
    [T.boxOpen - 2, { torso: 36, head: 12, nhx: 168, nhy: 34, fhx: 140, fhy: 28, open: 0, mouth: 0.6, ly: 1, nfx: 30, ffx: -40 }, E.inOut],
    [T.boxOpen + 8, { torso: -14, head: -10, nhx: 40, nhy: -310, fhx: -36, fhy: -290, open: 0.8, mouth: 1, brow: 1, ly: -0.4, nfx: 16, ffx: -14 }, E.out],
    [690, { torso: -4, head: -4, nhx: 60, nhy: -260, fhx: -20, fhy: -250, open: 0.4 }],
  ]);
  if (f >= 600 && f < 636) p.nhx += Math.sin((f - 600) * 0.75) * 34;
  const hop = f >= T.boxOpen ? Math.sin(clamp((f - T.boxOpen) / 14) * Math.PI) * 40 : 0;
  p.y -= hop;
  if (f >= T.boxOpen && f < T.boxOpen + 14) {
    p.nfy -= hop * 0.3;
    p.ffy -= hop * 0.3;
  }
  return p;
}

/* ---------------------------------------------------- the scene */
export const Journey: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.fundOut - 2 || f > 706) return null;
  const jx = journeyX(f);
  const cam = camX(f);
  const bx = bikeX(f);
  const crank = (bx + 320) * 1.1;
  const spin = ((bx + 320) / 74) * (180 / Math.PI);
  const bikeRot = decay(f, T.bikeStop, 2.5, 3, 5) + decay(f, T.rideEnd, 3, 3, 5);
  const cp = courierPose(f, crank);

  // machine: bench → hop → box
  const benchM = { x: 210, y: 1010 };
  const inBox = { x: 590, y: GROUND - 12 };
  const hopU = prog(f, T.machineHop, T.boxLand, E.lin);
  const hopPos = qbez([benchM.x, benchM.y], [420, 620], [inBox.x, inBox.y], E.inOut2(hopU));
  const mSquash = f >= T.machineHop - 5 && f < T.machineHop ? prog(f, T.machineHop - 5, T.machineHop) : 0;

  // box: floor → carrier → road
  const flapsClosed = Math.min(prog(f, T.boxLand + 2, T.boxLand + 8, E.out), 1);
  const flapR = 1 - prog(f, T.boxLand + 7, T.boxLand + 13, E.out);
  const tape = prog(f, 500, 508, E.inOut);
  const toBike = prog(f, T.bikeStop, T.boxOnBike, E.inOut2);
  const carrier = { x: bx - 141, y: GROUND - 154 };
  const opened = f >= T.boxOpen ? E.outBack(prog(f, T.boxOpen, T.boxOpen + 6, E.lin)) : 0;

  let box = { x: 590, y: GROUND, s: 1, rot: 0, squash: f >= T.boxLand ? Math.max(0, decay(f, T.boxLand, 0.8, 3, 4)) : 0, onBike: false };
  if (f >= T.bikeStop) {
    const p = qbez([590, GROUND], [575, GROUND - 260], [carrier.x, carrier.y], toBike);
    box = { x: p[0], y: p[1], s: 1 + (0.62 - 1) * toBike, rot: -18 * Math.sin(toBike * Math.PI), squash: 0, onBike: toBike > 0.45 };
  }
  if (f >= T.boxOnBike) {
    box = { x: carrier.x, y: carrier.y - Math.abs(Math.sin(f * 0.8)) * 3 * (f < T.rideEnd ? 1 : 0), s: 0.62, rot: decay(f, T.boxOnBike, 4, 3, 4), squash: 0, onBike: true };
  }
  const dropU = prog(f, T.boxDrop - 16, T.boxDrop, E.lin);
  if (f >= T.boxDrop - 16) {
    const p = qbez([carrier.x, carrier.y], [(carrier.x + DROP_X) / 2, GROUND - 420], [DROP_X, GROUND], E.inOut2(dropU));
    box = { x: p[0], y: p[1], s: 0.62 + (0.85 - 0.62) * dropU, rot: 360 * E.inOut(dropU), squash: f >= T.boxDrop ? Math.max(0, decay(f, T.boxDrop, 0.8, 3, 4)) : 0, onBike: f < T.boxDrop };
  }

  // machine rising out at the door
  const rise = prog(f, T.boxOpen, T.boxOpen + 18, E.out);
  const glow = spring(f, T.boxOpen, 1.4, 0.6);

  const boxEl = (
    <Box
      x={box.x - cam}
      y={box.y}
      s={box.s}
      rot={box.rot}
      squash={box.squash}
      flapL={f >= T.boxOpen ? opened : 1 - flapsClosed}
      flapR={f >= T.boxOpen ? opened : flapR}
      tape={f >= T.boxOpen - 2 ? 1 - prog(f, T.boxOpen - 3, T.boxOpen) : tape}
      inner={
        f >= T.boxOpen ? (
          <g>
            <circle cx={0} cy={-260 - rise * 220} r={180 * glow} fill={C.gold} opacity={0.35 * (1 - rise * 0.4)} />
            <SewingMachine x={0} y={-20 - rise * 270} s={0.95} />
          </g>
        ) : f >= T.boxLand && f < T.bikeStop ? (
          <SewingMachine x={0} y={-12} s={0.8} />
        ) : null
      }
    />
  );

  return (
    <g transform={`translate(${jx} 0)`}>
      <rect x={-400} y={-200} width={1880} height={2400} fill={C.paper} />
      <Skyline off={cam * 0.3} />
      <MidLayer off={cam * 0.65 + 200} f={f} />
      <Road off={cam} />
      <g transform={`translate(${-cam} 0)`}>
        <Shop f={f} />
        {/* dispatch bench */}
        <rect x={60} y={1010} width={310} height={26} rx={6} fill={C.kraft} stroke={C.ink} strokeWidth={6} />
        <path d={`M84 1036 L76 ${GROUND} M346 1036 L354 ${GROUND}`} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      </g>
      {/* machine waiting on the bench, then hopping into the box */}
      {f < T.boxLand && (
        <g>
          <SewingMachine
            x={(f < T.machineHop ? benchM.x : hopPos[0]) - cam}
            y={f < T.machineHop ? benchM.y : hopPos[1]}
            s={0.8 * (1 + mSquash * 0.08)}
            rot={f < T.machineHop ? 0 : -25 * Math.sin(hopU * Math.PI)}
          />
        </g>
      )}
      {!box.onBike && f < T.boxDrop - 16 && boxEl}
      {/* tailor waiting at the door */}
      {f > 560 && <Stick p={{ ...tailorPose(f), x: TAILOR_X - cam }} dir={-1} look={{ ...TAILOR, flutter: wob(f, 5, 3) }} />}
      {f >= T.boxDrop && boxEl}
      {/* bicycle + courier */}
      <Bicycle x={bx - cam} y={GROUND} spin={spin} crank={crank} rot={bikeRot}>
        <Stick p={cp} look={COURIER} />
        {f >= 556 && f < 574 && (
          <g transform="translate(110 -230)" opacity={1 - (f - 556) / 18}>
            {[0, 1].map((k) => (
              <path key={k} d={`M${20 + k * 16} ${-20 - k * 12} q 14 14 0 30`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" transform={`scale(${1 + (f - 556) * 0.04})`} />
            ))}
          </g>
        )}
      </Bicycle>
      {box.onBike && f < T.boxDrop && boxEl}
      {/* skid dust */}
      {[T.bikeStop, T.rideEnd].map((s0) =>
        f >= s0 - 10 && f < s0 + 12
          ? [0, 1, 2].map((k) => {
              const life = (f - (s0 - 10) - k * 3) / 16;
              if (life < 0 || life > 1) return null;
              return <circle key={`${s0}${k}`} cx={bikeX(s0) - cam - 128 - life * 60 - k * 20} cy={GROUND - 14 - life * 30} r={10 + life * 22} fill={C.floorDark} opacity={0.8 * (1 - life)} />;
            })
          : null,
      )}
      <Foreground off={cam * 1.4} />
      <Burst x={DROP_X - cam} y={GROUND - 300} t={(f - T.boxOpen) / 12} r={260} n={14} color={C.gold} w={10} />
      {f >= T.boxOpen + 2 && f < 700 && [0, 1, 2].map((k) => (
        <Star key={k} x={DROP_X - cam + [-170, 160, 120][k]} y={GROUND - [420, 470, 300][k] - (f - T.boxOpen) * 2} r={22 * spring(f, T.boxOpen + 2 + k * 3, 3, 0.4)} rot={(f - T.boxOpen) * 6} stroke={C.ink} />
      ))}
    </g>
  );
};

/** Star that dives from the "Funded" checkpoint onto the machine (cause of the hop). */
export const DiveStar: React.FC<{ f: number }> = ({ f }) => {
  const a = T.fundOut + 4;
  const b = T.machineHop - 2;
  if (f < a || f > b + 6) return null;
  const end: [number, number] = [210 + journeyX(f), 1010 - 230];
  const u = prog(f, a, b, E.inOut2);
  const pos = qbez([NODE_X[2], NODE_Y], [NODE_X[2] + 200, 560], end, u);
  if (f > b) return <Burst x={end[0]} y={end[1]} t={(f - b) / 7} r={110} n={10} color={C.gold} w={8} />;
  return (
    <g>
      <circle cx={pos[0]} cy={pos[1]} r={46} fill={C.gold} opacity={0.2} />
      <Star x={pos[0]} y={pos[1]} r={32} rot={f * 12} stroke={C.ink} />
    </g>
  );
};

export { DOOR_X, DROP_X };
