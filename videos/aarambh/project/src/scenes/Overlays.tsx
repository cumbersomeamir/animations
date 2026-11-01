import React from "react";
import { E, clamp, kf, prog, spring } from "../lib/anim";
import { Burst } from "../lib/props";
import { C, FONT } from "../lib/theme";
import { T } from "../timeline";
import { NODE_X, NODE_Y } from "./Fund";
import { rideProgress } from "./Journey";
import { NARRATION } from "../cues";

/* ---------------------------------------------------------- tracker */
const LABELS = ["Need", "Verified", "Funded", "Delivered", "At work"];

function progressX(f: number) {
  const N = NODE_X;
  if (f < 228) return N[0];
  if (f < T.nodes[1]) return N[0] + (N[1] - N[0]) * prog(f, 228, T.nodes[1], E.inOut);
  if (f < T.tap + 2) return N[1];
  if (f < T.nodes[2]) return N[1] + (N[2] - N[1]) * prog(f, T.tap + 2, T.nodes[2], E.inOut2);
  if (f < T.rideStart) return N[2];
  if (f < T.nodes[3]) return N[2] + (N[3] - N[2]) * (0.9 * rideProgress(f) + 0.1 * prog(f, T.rideEnd, T.nodes[3]));
  if (f < 694) return N[3];
  if (f < T.nodes[4]) return N[3] + (N[4] - N[3]) * prog(f, 694, T.nodes[4], E.inOut);
  return N[4];
}

export const Tracker: React.FC<{ f: number }> = ({ f }) => {
  if (f < 196 || f > T.curtain + 30) return null;
  const y = kf(f, [[198, -240], [216, 0, E.outBack]]);
  const px = progressX(f);
  const moving = T.nodes.every((n) => Math.abs(f - n) > 2) && f > 228 && px < NODE_X[4] && NODE_X.every((x) => Math.abs(px - x) > 4);
  return (
    <g transform={`translate(0 ${y})`}>
      <rect x={56} y={226} width={968} height={168} rx={40} fill={C.cream} stroke={C.ink} strokeWidth={5} filter="url(#paper)" />
      <line x1={NODE_X[0]} y1={NODE_Y} x2={NODE_X[4]} y2={NODE_Y} stroke={C.inkSoft} strokeWidth={5} strokeDasharray="4 12" strokeLinecap="round" opacity={0.6} />
      <line x1={NODE_X[0]} y1={NODE_Y} x2={px} y2={NODE_Y} stroke={C.gold} strokeWidth={9} strokeLinecap="round" />
      {NODE_X.map((x, i) => {
        const lit = T.nodes[i];
        const s = spring(f, lit, 2.6, 0.42);
        const on = f >= lit;
        return (
          <g key={i}>
            <circle cx={x} cy={NODE_Y} r={22} fill={C.cream} stroke={C.inkSoft} strokeWidth={5} />
            {on && (
              <g transform={`translate(${x} ${NODE_Y}) scale(${s})`}>
                <circle r={27} fill={C.green} stroke={C.ink} strokeWidth={4} />
                <path d="M-11 1 L-3 9 L12 -8" fill="none" stroke={C.cream} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
              </g>
            )}
            <Burst x={x} y={NODE_Y} t={(f - lit) / 12} r={64} n={10} color={C.gold} w={6} />
            <text
              x={x}
              y={NODE_Y + 66}
              textAnchor="middle"
              fontFamily={FONT.sans}
              fontWeight={on ? 800 : 600}
              fontSize={28}
              fill={on ? C.green : C.inkSoft}
              opacity={on ? 1 : 0.7}
            >
              {LABELS[i]}
            </text>
          </g>
        );
      })}
      {moving && (
        <g transform={`translate(${px} ${NODE_Y})`}>
          <circle r={16 + Math.sin(f * 0.6) * 3} fill={C.gold} opacity={0.3} />
          <circle r={11} fill={C.gold} stroke={C.ink} strokeWidth={4} />
        </g>
      )}
    </g>
  );
};

/* ---------------------------------------------------------- captions */
type Word = [text: string, start: number, end: number, key?: boolean];
// Word timings are Whisper (small.en) word timestamps of the generated narration, in seconds from line start.
const LINES: Record<string, { rows: number[]; words: Word[] }> = {
  N1: { rows: [3], words: [["One", 0, 0.24], ["snapped", 0.24, 0.54, true], ["thread...", 0.54, 0.88, true], ["and", 1.26, 1.38], ["the", 1.38, 1.46], ["whole", 1.46, 1.7], ["day", 1.7, 1.88], ["stops.", 1.88, 2.22]] },
  N2: { rows: [4], words: [["What", 0, 0.16], ["she", 0.16, 0.3], ["needs", 0.3, 0.64], ["is", 0.64, 0.98], ["a", 0.98, 1.1], ["sewing", 1.1, 1.38, true], ["machine.", 1.38, 1.68, true]] },
  N3: { rows: [5], words: [["With", 0, 0.16], ["Aarambh,", 0.16, 0.64, true], ["you", 0.88, 1.0], ["can", 1.0, 1.16], ["fund", 1.16, 1.4], ["verified", 1.4, 1.92, true], ["livelihood", 1.92, 2.38, true], ["tools.", 2.38, 2.84, true]] },
  N4: { rows: [2], words: [["Pick", 0, 0.18], ["one.", 0.18, 0.48], ["Fund", 0.6, 0.82, true], ["it.", 0.82, 1.02, true]] },
  N5: { rows: [], words: [["Then", 0, 0.22], ["follow", 0.22, 0.54, true], ["its", 0.54, 0.78], ["journey...", 0.78, 1.14, true]] },
  N6: { rows: [3], words: [["...all", 0, 0.22], ["the", 0.22, 0.36], ["way", 0.36, 0.48], ["to", 0.48, 0.68], ["its", 0.68, 0.8], ["impact.", 0.8, 1.18, true]] },
};

export const Captions: React.FC<{ f: number }> = ({ f }) => {
  const line = NARRATION.filter((n) => LINES[n.id]).find((n, i, arr) => {
    const L = LINES[n.id];
    const end = n.frame + L.words[L.words.length - 1][2] * 30 + 22;
    const next = arr[i + 1];
    return f >= n.frame - 5 && f < Math.min(end, next ? next.frame - 5 : 1e9);
  });
  if (!line) return null;
  const L = LINES[line.id];
  const endF = line.frame + L.words[L.words.length - 1][2] * 30 + 22;
  const inA = prog(f, line.frame - 5, line.frame + 2, E.out);
  const outA = 1 - prog(f, endF - 6, endF, E.in);
  const o = Math.min(inA, outA);
  const rows: Word[][] = [];
  let cur: Word[] = [];
  L.words.forEach((w, i) => {
    cur.push(w);
    if (L.rows.includes(i + 1)) {
      rows.push(cur);
      cur = [];
    }
  });
  if (cur.length) rows.push(cur);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 1452,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity: o,
        transform: `translateY(${(1 - inA) * 24}px)`,
      }}
    >
      {rows.map((r, ri) => (
        <div
          key={ri}
          style={{
            background: "rgba(252,246,238,0.94)",
            border: `4px solid ${C.ink}`,
            borderRadius: 22,
            padding: "6px 24px 10px",
            fontFamily: FONT.sans,
            fontWeight: 800,
            fontSize: 56,
            lineHeight: 1.15,
            color: C.ink,
            letterSpacing: -0.5,
            boxShadow: `0 7px 0 rgba(18,48,42,0.16)`,
            whiteSpace: "nowrap",
          }}
        >
          {r.map(([t, s, e, key], wi) => {
            const ws = line.frame + s * 30;
            const lit = clamp((f - ws + 2) / 4);
            return (
              <span key={wi} style={{ position: "relative", opacity: 0.28 + 0.72 * lit, color: key ? C.green : C.ink, display: "inline-block", transform: `translateY(${(1 - lit) * 6}px)`, marginRight: wi < r.length - 1 ? 14 : 0 }}>
                {t}
                {key && lit > 0 && e && (
                  <span style={{ position: "absolute", left: 0, bottom: 2, height: 6, borderRadius: 3, background: C.gold, width: `${clamp((f - ws) / ((e - s) * 30)) * 100}%` }} />
                )}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
