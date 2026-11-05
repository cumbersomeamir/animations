// Hindi word timing for captions (no Hindi word-timestamp model available offline): for each narration line, the boundaries
// between punctuation-delimited phrases are predicted from eSpeak phoneme proportions and snapped IN ORDER to the best measured
// pause in the clip (10 ms RMS envelope); inside each phrase, word durations are proportional to the word's phoneme count.
// Writes src/words.json (the scene reads it for word-timed captions and beats). Run after src/tts_hi.mjs.
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { PHRASE_SEGMENTS } from "./narration.js";
const man = JSON.parse(fs.readFileSync("build/narration/manifest.json", "utf8"));
const phonCount = (w) => { const r = spawnSync("espeak-ng", ["-v", "hi", "-q", "--ipa", w], { encoding: "utf8" }); return Math.max(1, r.stdout.replace(/[ˈˌː\s]/g, "").length); };
const out = { method: "envelope voiced segments × eSpeak phoneme counts (see header)", lines: [] };
for (const l of man.lines) {
  // phrases from the written text (punctuation = pause candidates)
  const clean = l.text.replace(/[‘’“”"']/g, "");
  const phrases = [...clean.matchAll(/([^,।?!:;.—]+)([,।?!:;.—]?)/g)].map((m) => m[1].trim()).filter(Boolean).map((p) => p.split(/\s+/));
  // voiced chunks (10 ms envelope, ≥ 30 ms quiet splits) → candidate pause gaps inside the line
  const env = l.env, chunks = []; let on = -1, quiet = 0;
  for (let i = 0; i <= env.length; i++) { const v = i < env.length ? env[i] : 0;
    if (v > 0.02) { if (on < 0) on = i; quiet = 0; } else if (on >= 0) { quiet++; if (quiet >= 3 || i === env.length) { chunks.push([on, i - quiet + 1]); on = -1; quiet = 0; } } }
  const a0 = chunks[0][0], b0 = chunks.at(-1)[1], gaps = []; for (let i = 0; i < chunks.length - 1; i++) gaps.push([chunks[i][1], chunks[i + 1][0]]);
  // phrase boundaries: expected from phoneme proportions, snapped (in order) to the gap that best fits — near the expected
  // time and preferring longer pauses (Kokoro's comma pauses can be as short as 0.1 s)
  const pc = phrases.map((ws) => ws.reduce((x, w) => x + phonCount(w), 0)), ptot = pc.reduce((x, y) => x + y, 0); let acc = 0, prev = a0; const cuts = [];
  for (let k = 0; k < phrases.length - 1; k++) { acc += pc[k]; const exp = a0 + ((b0 - a0) * acc) / ptot; let best = null, bs = 1e9;
    for (const [g0, g1] of gaps) { const c = (g0 + g1) / 2; if (c <= prev + 5) continue; const sc = Math.abs(c - exp) - 0.8 * (g1 - g0); if (sc < bs) { bs = sc; best = [g0, g1]; } }
    if (!best) best = [Math.round(exp), Math.round(exp)]; cuts.push(best); prev = best[1]; }
  const segs = []; let st = a0; for (const [g0, g1] of cuts) { segs.push([st, g0]); st = g1; } segs.push([st, b0]);
  const pin = PHRASE_SEGMENTS?.[l.id]; if (pin && pin.length === phrases.length) { segs.length = 0; for (const [x, y] of pin) segs.push([Math.round(x * 100), Math.round(y * 100)]); }
  const words = [];
  phrases.forEach((ws, pi) => {
    const [a, b] = segs[pi], t0 = l.start + a / 100, t1 = l.start + b / 100, n = ws.map(phonCount), tot = n.reduce((x, y) => x + y, 0); let acc = 0;
    ws.forEach((w, i) => { const s = t0 + ((t1 - t0) * acc) / tot; acc += n[i]; words.push({ w, t0: +s.toFixed(3), t1: +(t0 + ((t1 - t0) * acc) / tot).toFixed(3) }); });
  });
  out.lines.push({ id: l.id, start: l.start, end: l.end, script: clean, words, phrases: phrases.length, segments: segs.map(([a, b]) => [+(l.start + a / 100).toFixed(2), +(l.start + b / 100).toFixed(2)]) });
  console.log(l.id, words.map((w) => `${w.w}@${w.t0.toFixed(2)}`).join(" "));
}
fs.writeFileSync("src/words.json", JSON.stringify(out, null, 1));
