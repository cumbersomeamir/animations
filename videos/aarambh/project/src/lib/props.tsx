import React from "react";
import { clamp } from "./anim";
import { C, FONT } from "./theme";

const rad = (d: number) => (d * Math.PI) / 180;

/* ------------------------------------------------------------------ star */
export const starPath = (r: number, k = 0.17) =>
  `M0 ${-r} Q${k * r} ${-k * r} ${r} 0 Q${k * r} ${k * r} 0 ${r} Q${-k * r} ${k * r} ${-r} 0 Q${-k * r} ${-k * r} 0 ${-r} Z`;

export const Star: React.FC<{ x: number; y: number; r: number; rot?: number; fill?: string; stroke?: string; opacity?: number }> = ({
  x, y, r, rot = 0, fill = C.gold, stroke, opacity = 1,
}) => (
  <path d={starPath(r)} transform={`translate(${x} ${y}) rotate(${rot})`} fill={fill} stroke={stroke} strokeWidth={stroke ? r * 0.08 : 0} strokeLinejoin="round" opacity={opacity} />
);

/** Radiating sparkle lines (impact accent). t: 0→1 life. */
export const Burst: React.FC<{ x: number; y: number; t: number; r?: number; n?: number; color?: string; w?: number; rot?: number }> = ({
  x, y, t, r = 80, n = 8, color = C.gold, w = 7, rot = 0,
}) => {
  if (t <= 0 || t >= 1) return null;
  const r0 = r * (0.35 + 0.65 * t);
  const r1 = r * (0.55 + 0.75 * Math.min(1, t * 1.4));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={1 - t * t}>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        return (
          <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke={color} strokeWidth={w * (1 - t * 0.6)} strokeLinecap="round" />
        );
      })}
    </g>
  );
};

/* -------------------------------------------------------- sewing machine */
type Shape = { d: string; fill: string; stroke?: string; sw?: number };

const circleD = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;

function machineShapes(): Shape[] {
  return [
    { d: "M-178 -40 Q-178 -48 -170 -48 L170 -48 Q178 -48 178 -40 L178 -6 Q178 0 170 0 L-170 0 Q-178 0 -178 -6 Z", fill: C.green },
    {
      d: "M150 -48 L150 -172 Q150 -208 114 -208 L-122 -208 Q-166 -208 -166 -166 L-166 -84 Q-166 -66 -150 -66 L-112 -66 Q-96 -66 -96 -82 L-96 -138 Q-96 -152 -82 -152 L78 -152 Q92 -152 92 -138 L92 -48 Z",
      fill: C.green,
    },
    { d: circleD(165, -150, 46), fill: C.greenDeep },
    { d: "M26 -250 L54 -250 L54 -222 L26 -222 Z", fill: C.saffron },
  ];
}

export const SewingMachine: React.FC<{
  x: number; y: number; s?: number; rot?: number; wheel?: number; needle?: number; sketch?: number; fill?: number; thread?: boolean;
}> = ({ x, y, s = 1, rot = 0, wheel = 0, needle = 0, sketch, fill = 1, thread = true }) => {
  const shapes = machineShapes();
  const sk = sketch === undefined ? 1 : clamp(sketch);
  const outline = sketch !== undefined;
  const nb = -30 + needle * 18;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {shapes.map((sh, i) => (
        <path key={i} d={sh.d} fill={sh.fill} fillOpacity={fill} stroke={C.ink} strokeWidth={outline ? 6 : 5} strokeLinejoin="round"
          {...(outline ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - clamp(sk * 1.25 - i * 0.08) } : {})} />
      ))}
      <g opacity={fill}>
        {/* gold decals */}
        <path d="M-70 -182 Q-40 -196 -10 -182 T50 -182 T110 -182" fill="none" stroke={C.gold} strokeWidth={5} strokeLinecap="round" />
        <circle cx={-120} cy={-180} r={7} fill={C.gold} />
        <line x1={-160} y1={-36} x2={160} y2={-36} stroke={C.gold} strokeWidth={3} opacity={0.8} />
        {/* hand wheel */}
        <g transform={`translate(165 -150) rotate(${wheel})`}>
          <circle r={36} fill="none" stroke={C.gold} strokeWidth={6} />
          {[0, 120, 240].map((a) => (
            <line key={a} x1={0} y1={0} x2={Math.cos(rad(a)) * 34} y2={Math.sin(rad(a)) * 34} stroke={C.gold} strokeWidth={6} strokeLinecap="round" />
          ))}
          <circle r={9} fill={C.gold} stroke={C.ink} strokeWidth={3} />
        </g>
        {/* spool */}
        <line x1={40} y1={-208} x2={40} y2={-226} stroke={C.ink} strokeWidth={5} />
        <rect x={22} y={-256} width={36} height={8} rx={3} fill={C.kraft} stroke={C.ink} strokeWidth={3} />
        <rect x={22} y={-224} width={36} height={8} rx={3} fill={C.kraft} stroke={C.ink} strokeWidth={3} />
        {thread && <path d="M40 -240 Q-30 -236 -132 -206 L-134 -70" fill="none" stroke={C.saffron} strokeWidth={3} />}
        {/* needle bar + needle + presser foot */}
        <rect x={-142} y={-70} width={14} height={nb + 70} fill={C.steel} stroke={C.ink} strokeWidth={3} />
        <line x1={-135} y1={nb} x2={-135} y2={nb + 20} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        <path d="M-160 -50 L-112 -50 L-118 -44 L-160 -44 Z" fill={C.steel} stroke={C.ink} strokeWidth={3} />
      </g>
    </g>
  );
};

/* ------------------------------------------------------------ the card */
export const RequestCard: React.FC<{
  x: number; y: number; s?: number; rot?: number; sx?: number; stamp?: number; glow?: number; tagPop?: number;
}> = ({ x, y, s = 1, rot = 0, sx = 1, stamp = 0, glow = 0, tagPop = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * sx} ${s})`}>
    {glow > 0 && <rect x={-296} y={-216} width={592} height={432} rx={40} fill="none" stroke={C.gold} strokeWidth={10} opacity={glow} />}
    <rect x={-280} y={-200} width={560} height={400} rx={30} fill={C.cream} stroke={C.ink} strokeWidth={5} filter="url(#paper)" />
    <rect x={-252} y={-172} width={212} height={344} rx={20} fill={C.greenPale} />
    <SewingMachine x={-146} y={72} s={0.52} />
    <text x={-12} y={-138} fontFamily={FONT.sans} fontWeight={700} fontSize={22} letterSpacing={3} fill={C.greenMid}>LIVELIHOOD NEED</text>
    <text x={-12} y={-72} fontFamily={FONT.serif} fontWeight={700} fontSize={56} fill={C.ink}>Sewing</text>
    <text x={-12} y={-14} fontFamily={FONT.serif} fontWeight={700} fontSize={56} fill={C.ink}>machine</text>
    <g transform={`translate(${-12 + 88} 18) scale(${1 + tagPop * 0.18})`}>
      <rect x={-88} y={-4} width={176} height={46} rx={23} fill={C.gold} />
      <text x={0} y={27} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={24} fill={C.ink}>Tailoring</text>
    </g>
    {stamp > 0 && (
      <g transform={`translate(130 132) rotate(-7) scale(${1 + (1 - clamp(stamp)) * 0.25})`} opacity={clamp(stamp * 1.6)}>
        <rect x={-134} y={-36} width={268} height={72} rx={14} fill="none" stroke={C.green} strokeWidth={7} />
        <path d={starPath(17)} transform="translate(-100 0)" fill={C.gold} stroke={C.green} strokeWidth={2.5} />
        <text x={16} y={14} textAnchor="middle" fontFamily={FONT.sans} fontWeight={800} fontSize={38} letterSpacing={4} fill={C.green}>VERIFIED</text>
      </g>
    )}
  </g>
);

/* -------------------------------------------------------------- stamp */
export const Stamp: React.FC<{ x: number; y: number; s?: number; squash?: number; rot?: number }> = ({ x, y, s = 1, squash = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (1 + squash * 0.12)} ${s * (1 - squash * 0.14)})`} filter="url(#paper)">
    <rect x={-20} y={-150} width={40} height={96} rx={10} fill={C.kraft} stroke={C.ink} strokeWidth={5} />
    <ellipse cx={0} cy={-168} rx={46} ry={34} fill={C.kraftLight} stroke={C.ink} strokeWidth={5} />
    <rect x={-138} y={-62} width={276} height={52} rx={12} fill={C.green} stroke={C.ink} strokeWidth={5} />
    <rect x={-130} y={-14} width={260} height={14} rx={4} fill={C.ink} />
  </g>
);

/* ----------------------------------------------------------- magnifier */
export const Magnifier: React.FC<{ x: number; y: number; r?: number; rot?: number; children?: React.ReactNode; id: string }> = ({
  x, y, r = 110, rot = 0, children, id,
}) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <clipPath id={id}>
        <circle cx={0} cy={0} r={r - 8} />
      </clipPath>
    </defs>
    <g transform={`rotate(${rot})`}>
      <line x1={r * 0.72} y1={r * 0.72} x2={r * 1.75} y2={r * 1.75} stroke={C.ink} strokeWidth={40} strokeLinecap="round" />
      <line x1={r * 0.78} y1={r * 0.78} x2={r * 1.72} y2={r * 1.72} stroke={C.kraft} strokeWidth={26} strokeLinecap="round" />
    </g>
    <circle r={r - 6} fill={C.cream} />
    <g clipPath={`url(#${id})`}>{children}</g>
    <circle r={r - 6} fill="rgba(255,255,255,0.12)" />
    <path d={`M${-r * 0.55} ${-r * 0.3} A${r * 0.62} ${r * 0.62} 0 0 1 ${-r * 0.2} ${-r * 0.6}`} fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.7} />
    <circle r={r} fill="none" stroke={C.ink} strokeWidth={16} />
    <circle r={r} fill="none" stroke={C.gold} strokeWidth={7} />
  </g>
);

/* --------------------------------------------------------------- phone */
export const Phone: React.FC<{ x: number; y: number; s?: number; rot?: number; children?: React.ReactNode; id: string }> = ({
  x, y, s = 1, rot = 0, children, id,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <defs>
      <clipPath id={id}>
        <rect x={-136} y={-276} width={272} height={552} rx={34} />
      </clipPath>
    </defs>
    <rect x={-150} y={-290} width={300} height={580} rx={46} fill={C.ink} filter="url(#paper)" />
    <rect x={-136} y={-276} width={272} height={552} rx={34} fill={C.cream} />
    <g clipPath={`url(#${id})`}>{children}</g>
    <rect x={-40} y={-268} width={80} height={16} rx={8} fill={C.ink} />
  </g>
);

/* ---------------------------------------------------------- tool glyphs */
export const BikeGlyph: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx={-26} cy={10} r={17} />
    <circle cx={26} cy={10} r={17} />
    <path d="M-26 10 L-6 -14 L18 -14 L26 10 M-6 -14 L2 10 L18 -14 M-10 -20 L0 -20 M14 -24 L22 -24" stroke={C.green} />
  </g>
);
export const ToolboxGlyph: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <rect x={-34} y={-12} width={68} height={38} rx={6} fill={C.saffron} stroke={C.ink} strokeWidth={4} />
    <path d="M-14 -12 L-14 -24 L14 -24 L14 -12" fill="none" stroke={C.ink} strokeWidth={5} />
    <line x1={-34} y1={4} x2={34} y2={4} stroke={C.ink} strokeWidth={4} />
  </g>
);

/* ----------------------------------------------------------------- box */
export const Box: React.FC<{
  x: number; y: number; s?: number; flapL?: number; flapR?: number; tape?: number; squash?: number; rot?: number; inner?: React.ReactNode;
}> = ({ x, y, s = 1, flapL = 1, flapR = 1, tape = 0, squash = 0, rot = 0, inner }) => {
  // flap: 1 = open (sticking up/out), 0 = closed (lying flat across the top)
  const aL = -125 * flapL;
  const aR = 125 * flapR;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (1 + squash * 0.1)} ${s * (1 - squash * 0.12)})`}>
      {inner}
      <rect x={-150} y={-220} width={300} height={220} rx={8} fill={C.kraft} stroke={C.ink} strokeWidth={6} filter="url(#paper)" />
      <path d="M-150 -170 L150 -170" stroke={C.kraftDark} strokeWidth={4} opacity={0.6} />
      <g transform="translate(92 -60)">
        <path d="M-18 -10 L0 -26 L18 -10 M0 -26 L0 10" fill="none" stroke={C.kraftDark} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g transform={`translate(-150 -220) rotate(${aL})`}>
        <rect x={0} y={-14} width={152} height={28} rx={4} fill={C.kraftLight} stroke={C.ink} strokeWidth={5} />
      </g>
      <g transform={`translate(150 -220) rotate(${aR})`}>
        <rect x={-152} y={-14} width={152} height={28} rx={4} fill={C.kraftLight} stroke={C.ink} strokeWidth={5} />
      </g>
      {tape > 0 && <rect x={-24} y={-236} width={48} height={22 + 110 * clamp(tape)} rx={3} fill="#EADBB8" stroke={C.ink} strokeWidth={3} opacity={0.95} />}
    </g>
  );
};

/* ------------------------------------------------------------- bicycle */
export const Bicycle: React.FC<{ x: number; y: number; s?: number; spin: number; crank: number; rot?: number; children?: React.ReactNode }> = ({
  x, y, s = 1, spin, crank, rot = 0, children,
}) => {
  const R = 74;
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} ${-R})`}>
      <circle r={R} fill="none" stroke={C.ink} strokeWidth={11} />
      <circle r={R - 9} fill="none" stroke={C.steel} strokeWidth={4} />
      <g transform={`rotate(${spin})`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={i} x1={0} y1={0} x2={Math.cos((i / 6) * Math.PI * 2) * (R - 10)} y2={Math.sin((i / 6) * Math.PI * 2) * (R - 10)} stroke={C.inkSoft} strokeWidth={3} />
        ))}
      </g>
      <circle r={8} fill={C.ink} />
    </g>
  );
  const cx = -8;
  const cy = -72;
  const pa = rad(crank);
  const p1: [number, number] = [cx + Math.cos(pa) * 30, cy + Math.sin(pa) * 30];
  const p2: [number, number] = [cx - Math.cos(pa) * 30, cy - Math.sin(pa) * 30];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {wheel(-128)}
      {wheel(128)}
      <line x1={cx} y1={cy} x2={p2[0]} y2={p2[1]} stroke={C.inkSoft} strokeWidth={7} strokeLinecap="round" />
      <g fill="none" stroke={C.green} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M-128 ${-R} L${cx} ${cy} L-52 -186 L-128 ${-R}`} />
        <path d={`M-52 -186 L98 -180 L${cx} ${cy}`} />
        <path d={`M98 -180 L128 ${-R}`} />
      </g>
      <path d="M-212 -150 L-70 -150 M-190 -150 L-128 -74 M-90 -150 L-110 -110" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <path d="M98 -180 L92 -214 Q112 -222 136 -212" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={110} cy={-224} r={9} fill={C.gold} stroke={C.ink} strokeWidth={3} />
      <path d="M-52 -186 L-56 -200" stroke={C.ink} strokeWidth={8} />
      <ellipse cx={-58} cy={-204} rx={28} ry={8} fill={C.ink} />
      <circle cx={cx} cy={cy} r={14} fill={C.gold} stroke={C.ink} strokeWidth={4} />
      {children}
      <line x1={cx} y1={cy} x2={p1[0]} y2={p1[1]} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
      <rect x={p1[0] - 12} y={p1[1] - 4} width={24} height={8} rx={3} fill={C.ink} />
    </g>
  );
};

/* ------------------------------------------------------ room furniture */
export const Clock: React.FC<{ x: number; y: number; r?: number; sec: number; min?: number; hr?: number }> = ({ x, y, r = 70, sec, min = 60, hr = 300 }) => (
  <g transform={`translate(${x} ${y})`} filter="url(#paper)">
    <circle r={r} fill={C.cream} stroke={C.ink} strokeWidth={9} />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <line key={i} x1={Math.cos(a) * (r - 12)} y1={Math.sin(a) * (r - 12)} x2={Math.cos(a) * (r - (i % 3 === 0 ? 24 : 18))} y2={Math.sin(a) * (r - (i % 3 === 0 ? 24 : 18))} stroke={C.ink} strokeWidth={i % 3 === 0 ? 6 : 3} strokeLinecap="round" />;
    })}
    <line x1={0} y1={0} x2={Math.sin(rad(hr)) * r * 0.45} y2={-Math.cos(rad(hr)) * r * 0.45} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
    <line x1={0} y1={0} x2={Math.sin(rad(min)) * r * 0.68} y2={-Math.cos(rad(min)) * r * 0.68} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    <line x1={-Math.sin(rad(sec)) * 12} y1={Math.cos(rad(sec)) * 12} x2={Math.sin(rad(sec)) * r * 0.8} y2={-Math.cos(rad(sec)) * r * 0.8} stroke={C.saffron} strokeWidth={4} strokeLinecap="round" />
    <circle r={7} fill={C.saffron} stroke={C.ink} strokeWidth={3} />
  </g>
);

export const Stool: React.FC<{ x: number; y: number; h: number; rot?: number }> = ({ x, y, h, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={`M-74 8 L-92 ${h} M74 8 L92 ${h} M-82 ${h * 0.6} L82 ${h * 0.6}`} stroke={C.ink} strokeWidth={10} strokeLinecap="round" fill="none" />
    <rect x={-100} y={-6} width={200} height={24} rx={12} fill={C.kraft} stroke={C.ink} strokeWidth={6} />
  </g>
);

export const Slip: React.FC<{ x: number; y: number; rot?: number; s?: number; opacity?: number; tick?: number }> = ({ x, y, rot = 0, s = 1, opacity = 1, tick = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    <rect x={-60} y={-38} width={120} height={76} rx={6} fill={C.cream} stroke={C.ink} strokeWidth={4} />
    <line x1={-42} y1={-14} x2={30} y2={-14} stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round" />
    <line x1={-42} y1={4} x2={42} y2={4} stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
    <line x1={-42} y1={20} x2={10} y2={20} stroke={C.inkSoft} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
    {tick > 0 && <path d="M18 14 L32 28 L58 -6" fill="none" stroke={C.green} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(tick)} />}
  </g>
);

export const Kurta: React.FC<{ x: number; y: number; s?: number; rot?: number; color: string; trim: string; sx?: number }> = ({ x, y, s = 1, rot = 0, color, trim, sx = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * sx} ${s})`}>
    <path d="M0 -6 L0 -26 Q0 -36 10 -36" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
    <path d="M-60 0 L60 0" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    <path
      d="M-26 4 L-62 18 L-92 92 L-66 102 L-48 60 L-50 196 Q0 206 50 196 L48 60 L66 102 L92 92 L62 18 L26 4 Q0 22 -26 4 Z"
      fill={color} stroke={C.ink} strokeWidth={5} strokeLinejoin="round"
    />
    <path d="M0 14 L0 80" stroke={trim} strokeWidth={6} strokeLinecap="round" />
    {[30, 50, 70].map((yy) => <circle key={yy} cx={0} cy={yy} r={4} fill={trim} />)}
    <path d="M-48 176 Q0 186 48 176" fill="none" stroke={trim} strokeWidth={6} />
  </g>
);

/** Patterned fabric strip (green with gold dots). */
export const Fabric: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; color?: string; dot?: string; offset?: number }> = ({
  x, y, w, h, rot = 0, color = C.green, dot = C.gold, offset = 0,
}) => {
  const dots = [];
  for (let i = -1; i < w / 28 + 1; i++) {
    for (let j = 0; j < h / 28; j++) {
      const dx = ((i * 28 + (j % 2) * 14 + offset) % (w + 28) + w + 28) % (w + 28) - 14;
      if (dx > 4 && dx < w - 4 && 14 + j * 28 < h - 5) dots.push(<circle key={`${i}-${j}`} cx={dx} cy={14 + j * 28} r={4.5} fill={dot} />);
    }
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={0} y={0} width={w} height={h} rx={6} fill={color} stroke={C.ink} strokeWidth={4} />
      {dots}
    </g>
  );
};
