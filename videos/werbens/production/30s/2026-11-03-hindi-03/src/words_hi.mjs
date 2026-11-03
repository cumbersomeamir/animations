// Hindi word timing for captions (no Hindi word-timestamp model available offline): for each narration line, the measured
// voiced segments of the clip (10 ms RMS envelope; pauses ≥ 0.12 s) are matched IN ORDER to the punctuation-delimited
// phrases of the script; inside each phrase, word durations are proportional to the word's eSpeak phoneme count.
// Writes src/words.json (the scene reads it for word-timed captions and beats). Run after src/tts_hi.mjs.
import fs from "node:fs";
import { spawnSync } from "node:child_process";
const man = JSON.parse(fs.readFileSync("build/narration/manifest.json", "utf8"));
const phonCount = (w) => { const r = spawnSync("espeak-ng", ["-v", "hi", "-q", "--ipa", w], { encoding: "utf8" }); return Math.max(1, r.stdout.replace(/[ˈˌː\s]/g, "").length); };
const out = { method: "envelope voiced segments × eSpeak phoneme counts (see header)", lines: [] };
for (const l of man.lines) {
  // phrases from the written text (punctuation = pause candidates)
  const clean = l.text.replace(/[‘’“”"']/g, "");
  const phrases = [...clean.matchAll(/([^,।?!:;.—]+)([,।?!:;.—]?)/g)].map((m) => m[1].trim()).filter(Boolean).map((p) => p.split(/\s+/));
  // voiced segments from the envelope
  const env = l.env, segs = []; let on = -1, quiet = 0;
  for (let i = 0; i <= env.length; i++) {
    const v = i < env.length ? env[i] : 0;
    if (v > 0.02) { if (on < 0) on = i; quiet = 0; } else if (on >= 0) { quiet++; if (quiet >= 12 || i === env.length) { segs.push([on, i - quiet + 1]); on = -1; quiet = 0; } }
  }
  // merge segments down to the number of phrases (merge the pair with the smallest gap), or split the longest if fewer
  while (segs.length > phrases.length) { let k = 0, best = 1e9; for (let i = 0; i < segs.length - 1; i++) { const g = segs[i + 1][0] - segs[i][1]; if (g < best) { best = g; k = i; } } segs.splice(k, 2, [segs[k][0], segs[k + 1][1]]); }
  while (segs.length < phrases.length) { let k = 0; for (let i = 1; i < segs.length; i++) if (segs[i][1] - segs[i][0] > segs[k][1] - segs[k][0]) k = i; const [a, b] = segs[k], m = Math.round((a + b) / 2); segs.splice(k, 1, [a, m], [m, b]); }
  const words = [];
  phrases.forEach((ws, pi) => {
    const [a, b] = segs[pi], t0 = l.start + a / 100, t1 = l.start + b / 100, n = ws.map(phonCount), tot = n.reduce((x, y) => x + y, 0); let acc = 0;
    ws.forEach((w, i) => { const s = t0 + ((t1 - t0) * acc) / tot; acc += n[i]; words.push({ w, t0: +s.toFixed(3), t1: +(t0 + ((t1 - t0) * acc) / tot).toFixed(3) }); });
  });
  out.lines.push({ id: l.id, start: l.start, end: l.end, script: clean, words, phrases: phrases.length, segments: segs.map(([a, b]) => [+(l.start + a / 100).toFixed(2), +(l.start + b / 100).toFixed(2)]) });
  console.log(l.id, words.map((w) => `${w.w}@${w.t0.toFixed(2)}`).join(" "));
}
fs.writeFileSync("src/words.json", JSON.stringify(out, null, 1));
