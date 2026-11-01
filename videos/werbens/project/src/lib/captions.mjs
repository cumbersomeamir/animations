// Kinetic captions: word-by-word spring reveal with a violet marker on key words. Screen-space.
import { C } from "./palette.mjs";
import { FONT } from "./props.mjs";
import { rr } from "./draw.mjs";
import { E, clamp, inv, lerp } from "./util.mjs";

const SIZE = 78;
const LH = 96;
const TOP = 318; // baseline of first line (2-line captions); safe band y 250..560

/** cap: { lines:[...], hi:[...], f0, f1, wordFrames:[...] } */
export function drawCaption(ctx, cap, f) {
  if (f < cap.f0 - 2 || f > cap.f1 + 1) return;
  ctx.save();
  ctx.font = `${SIZE}px ${FONT.display}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const space = ctx.measureText(" ").width;
  const exit = clamp(inv(cap.f1 - 7, cap.f1, f));
  const nLines = cap.lines.length;
  const base = nLines === 1 ? TOP + LH / 2 : TOP;
  let wi = 0;
  cap.lines.forEach((ln, li) => {
    const words = ln.split(" ");
    const widths = words.map((w) => ctx.measureText(w).width);
    const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
    let x = 540 - total / 2;
    const y = base + li * LH;
    words.forEach((w, k) => {
      const wf = cap.wordFrames[wi] ?? cap.f0;
      const a = clamp(inv(wf, wf + 8, f));
      if (a > 0) {
        const e = E.outBack(a);
        const dy = (1 - e) * 46 - exit * 30;
        const alpha = clamp(a * 1.6) * (1 - exit);
        const isHi = cap.hi.includes(w);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x + widths[k] / 2, y + dy);
        const sc = lerp(0.82, 1, e);
        ctx.scale(sc, sc);
        if (isHi) {
          const m = clamp(inv(wf + 3, wf + 12, f));
          const mw = (widths[k] + 30) * E.outCubic(m);
          if (mw > 1) {
            ctx.save();
            ctx.rotate(-0.025);
            ctx.fillStyle = "rgba(27,20,51,0.18)";
            rr(ctx, -widths[k] / 2 - 15 + 6, -SIZE * 0.78 + 8, mw, SIZE * 1.02, 16); ctx.fill();
            ctx.fillStyle = C.violet;
            rr(ctx, -widths[k] / 2 - 15, -SIZE * 0.78, mw, SIZE * 1.02, 16); ctx.fill();
            ctx.restore();
          }
          ctx.fillStyle = m > 0.45 ? C.pureWhite : C.ink;
          if (m <= 0.45) { ctx.lineWidth = 12; ctx.strokeStyle = C.paper; ctx.lineJoin = "round"; ctx.strokeText(w, -widths[k] / 2, 0); }
          ctx.fillText(w, -widths[k] / 2, 0);
        } else {
          ctx.lineWidth = 12; ctx.strokeStyle = C.paper; ctx.lineJoin = "round";
          ctx.strokeText(w, -widths[k] / 2, 0);
          ctx.fillStyle = C.ink;
          ctx.fillText(w, -widths[k] / 2, 0);
        }
        ctx.restore();
      }
      x += widths[k] + space;
      wi++;
    });
  });
  ctx.restore();
}
