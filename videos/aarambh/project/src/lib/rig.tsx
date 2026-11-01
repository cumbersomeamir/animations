import React from "react";
import { clamp } from "./anim";
import { C } from "./theme";

// Ink stickman rig. Local space: hip at (0,0), +x = facing direction, y down.
export const BODY = { T: 165, U: 88, F: 86, Th: 102, Sh: 104, R: 40 };

export type Pose = {
  x: number;
  y: number;
  s: number;
  torso: number; // deg; + leans forward
  head: number; // deg; extra head tilt (+ forward/down)
  nhx: number; nhy: number; // near hand target (local)
  fhx: number; fhy: number; // far hand target
  nfx: number; nfy: number; // near foot target
  ffx: number; ffy: number; // far foot target
  mouth: number; // -1 frown … 1 smile
  open: number; // 0 … 1 open mouth
  blink: number; // 0 open … 1 closed
  brow: number; // -1 worried … 1 raised
  lx: number; ly: number; // gaze
};

export const STAND: Pose = {
  x: 0, y: 0, s: 1, torso: 0, head: 0,
  nhx: 8, nhy: 26, fhx: -6, fhy: 27,
  nfx: 16, nfy: 200, ffx: -14, ffy: 200,
  mouth: 0.3, open: 0, blink: 0, brow: 0, lx: 0.4, ly: 0,
};

type V = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;

function ik(o: V, t: V, l1: number, l2: number, s: number): { j: V; e: V } {
  const dx = t[0] - o[0];
  const dy = t[1] - o[1];
  const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.5, l1 + l2 - 0.5);
  const b = Math.atan2(dy, dx);
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  return {
    j: [o[0] + l1 * Math.cos(b + s * a), o[1] + l1 * Math.sin(b + s * a)],
    e: [o[0] + d * Math.cos(b), o[1] + d * Math.sin(b)],
  };
}

export function solve(p: Pose) {
  const { T, U, F, Th, Sh, R } = BODY;
  const up: V = [Math.sin(rad(p.torso)), -Math.cos(rad(p.torso))];
  const neck: V = [up[0] * T, up[1] * T];
  const sh: V = [up[0] * T * 0.86, up[1] * T * 0.86];
  const hu: V = [Math.sin(rad(p.torso + p.head)), -Math.cos(rad(p.torso + p.head))];
  const head: V = [neck[0] + hu[0] * (R + 7), neck[1] + hu[1] * (R + 7)];
  const na = ik(sh, [p.nhx, p.nhy], U, F, 1);
  const fa = ik(sh, [p.fhx, p.fhy], U, F, 1);
  const nl = ik([0, 0], [p.nfx, p.nfy], Th, Sh, -1);
  const fl = ik([0, 0], [p.ffx, p.ffy], Th, Sh, -1);
  return { neck, sh, head, na, fa, nl, fl };
}

/** Convert a local point of a character to world space. */
export const toWorld = (p: Pose, dir: 1 | -1, pt: V): V => [p.x + pt[0] * p.s * dir, p.y + pt[1] * p.s];

export type Look = {
  outfit: string;
  outfitLen?: number; // how far below the hip the garment hangs
  hair: "bun" | "short" | "cap";
  accent?: string; // dupatta / scarf
  flutter?: number; // dupatta tail sway
};

const P = (c: V, a: number, r: number): V => [c[0] + r * Math.cos(rad(a)), c[1] + r * Math.sin(rad(a))];
const pt = (v: V) => `${v[0].toFixed(2)},${v[1].toFixed(2)}`;

function Limb({ a, b, c, color, w }: { a: V; b: V; c: V; color: string; w: number }) {
  return (
    <path
      d={`M${pt(a)} L${pt(b)} L${pt(c)}`}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function HairBack({ h, look }: { h: V; look: Look }) {
  const R = BODY.R;
  if (look.hair !== "bun") return null;
  const b = P(h, -146, R + 10);
  return <circle cx={b[0]} cy={b[1]} r={17} fill={C.ink} />;
}

function Hair({ h, look }: { h: V; look: Look }) {
  const R = BODY.R;
  if (look.hair === "cap") {
    const a = P(h, -4, R + 4);
    const b = P(h, 184, R + 4);
    return (
      <g>
        <path d={`M${pt(a)} A${R + 4} ${R + 4} 0 0 0 ${pt(b)} Q${h[0]} ${h[1] - 16} ${pt(a)} Z`} fill={C.green} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M${pt(P(h, -6, R + 2))} L${h[0] + R + 30} ${h[1] - 4}`} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
        <circle cx={h[0]} cy={h[1] - R - 6} r={6} fill={C.gold} stroke={C.ink} strokeWidth={3} />
      </g>
    );
  }
  const a1 = look.hair === "bun" ? -58 : -44;
  const a2 = look.hair === "bun" ? 168 : 196;
  const o1 = P(h, a1, R + 1);
  const o2 = P(h, a2, R + 1);
  const span = (a1 - (a2 - 360));
  return (
    <path
      d={`M${pt(o1)} A${R + 1} ${R + 1} 0 ${span > 180 ? 1 : 0} 0 ${pt(o2)}`}
      fill="none"
      stroke={C.ink}
      strokeWidth={look.hair === "bun" ? 15 : 13}
      strokeLinecap="round"
    />
  );
}

function Face({ h, p }: { h: V; p: Pose }) {
  const ex = p.lx * 5;
  const ey = p.ly * 4;
  const e1: V = [h[0] + 6 + ex, h[1] - 4 + ey];
  const e2: V = [h[0] + 25 + ex, h[1] - 4 + ey];
  const ry = 6.4 * (1 - clamp(p.blink)) + 0.9;
  const raise = Math.max(p.brow, 0) * 6;
  const worry = Math.max(-p.brow, 0);
  const brow = (e: V, inner: 1 | -1) => {
    const yO = e[1] - 13 - raise + worry * 2;
    const yI = e[1] - 13 - raise - worry * 6;
    const xO = e[0] - inner * 7;
    const xI = e[0] + inner * 6;
    return <path d={`M${xO} ${yO} L${xI} ${yI}`} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />;
  };
  const m: V = [h[0] + 17 + ex * 0.5, h[1] + 17];
  return (
    <g>
      {p.mouth > 0.2 && <circle cx={h[0] + 31} cy={h[1] + 8} r={7} fill={C.saffron} opacity={0.35 * clamp(p.mouth)} />}
      <ellipse cx={e1[0]} cy={e1[1]} rx={4.6} ry={ry} fill={C.ink} />
      <ellipse cx={e2[0]} cy={e2[1]} rx={4.6} ry={ry} fill={C.ink} />
      {brow(e1, 1)}
      {brow(e2, -1)}
      {p.open > 0.05 ? (
        <ellipse cx={m[0]} cy={m[1] + 2} rx={5 + p.open * 4} ry={2 + p.open * 8} fill={C.ink} />
      ) : (
        <path d={`M${m[0] - 10} ${m[1]} Q${m[0]} ${m[1] + p.mouth * 11} ${m[0] + 10} ${m[1]}`} fill="none" stroke={C.ink} strokeWidth={4.5} strokeLinecap="round" />
      )}
    </g>
  );
}

export function Stick({
  p,
  dir = 1,
  look,
  back,
  mid,
  front,
  w = 13,
}: {
  p: Pose;
  dir?: 1 | -1;
  look: Look;
  back?: React.ReactNode;
  mid?: React.ReactNode;
  front?: React.ReactNode;
  w?: number;
}) {
  const j = solve(p);
  const T = BODY.T;
  const len = look.outfitLen ?? 26;
  const hand = (v: V, c: string) => <circle cx={v[0]} cy={v[1]} r={8.5} fill={c} />;
  const foot = (v: V, c: string) => (
    <path d={`M${v[0] - 2} ${v[1]} L${v[0] + 18} ${v[1] + 1}`} stroke={c} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${p.s * dir} ${p.s})`}>
      {/* far side */}
      <Limb a={[0, 0]} b={j.fl.j} c={j.fl.e} color={C.inkSoft} w={w} />
      {foot(j.fl.e, C.inkSoft)}
      <Limb a={j.sh} b={j.fa.j} c={j.fa.e} color={C.inkSoft} w={w} />
      {hand(j.fa.e, C.inkSoft)}
      {back}
      {/* near leg */}
      <Limb a={[0, 0]} b={j.nl.j} c={j.nl.e} color={C.ink} w={w} />
      {foot(j.nl.e, C.ink)}
      {/* torso + garment */}
      <g transform={`rotate(${p.torso})`}>
        {look.accent && (
          <path
            d={`M-6 ${-T * 0.84} Q${-34 + (look.flutter ?? 0) * 10} ${-T * 0.62} ${-46 + (look.flutter ?? 0) * 18} ${-T * 0.36} L${-34 + (look.flutter ?? 0) * 16} ${-T * 0.34} Q${-22} ${-T * 0.6} 4 ${-T * 0.8} Z`}
            fill={look.accent}
          />
        )}
        <line x1={0} y1={0} x2={0} y2={-T} stroke={C.ink} strokeWidth={w} strokeLinecap="round" />
        <path
          d={`M-21 ${-T * 0.9} Q0 ${-T * 0.96} 21 ${-T * 0.9} L${33} ${len} Q0 ${len + 8} ${-33} ${len} Z`}
          fill={look.outfit}
          stroke={look.outfit}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        {look.accent && (
          <path d={`M10 ${-T * 0.9} L24 ${-T * 0.84} L-12 ${-T * 0.12} L-26 ${-T * 0.2} Z`} fill={look.accent} />
        )}
      </g>
      {/* head */}
      <HairBack h={j.head} look={look} />
      <circle cx={j.head[0]} cy={j.head[1]} r={BODY.R} fill={C.cream} stroke={C.ink} strokeWidth={w * 0.8} />
      <Hair h={j.head} look={look} />
      <Face h={j.head} p={p} />
      {mid}
      {/* near arm */}
      <Limb a={j.sh} b={j.na.j} c={j.na.e} color={C.ink} w={w} />
      {hand(j.na.e, C.ink)}
      {front}
    </g>
  );
}
