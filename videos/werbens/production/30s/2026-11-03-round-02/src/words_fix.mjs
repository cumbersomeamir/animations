// Apply WORD_FIX (narration.js) to src/words.json: replace drifted word onsets; each word ends at the next onset (last word
// keeps its measured end). Run after src/words.mjs.
import fs from "node:fs";
import { WORD_FIX } from "./narration.js";
const W = JSON.parse(fs.readFileSync("src/words.json", "utf8"));
for (const l of W.lines) {
  const fx = WORD_FIX[l.id]; if (!fx) continue;
  for (const [i, t] of Object.entries(fx)) l.words[+i].t0 = t;
  for (let i = 0; i < l.words.length - 1; i++) l.words[i].t1 = Math.min(l.words[i].t1 > l.words[i + 1].t0 || l.words[i].t1 < l.words[i].t0 ? l.words[i + 1].t0 : l.words[i].t1, l.words[i + 1].t0);
  l.words_fixed = Object.keys(fx).map(Number);
}
fs.writeFileSync("src/words.json", JSON.stringify(W, null, 1));
console.log(W.lines.filter((l) => WORD_FIX[l.id]).map((l) => l.id + " " + l.words.map((w) => `${w.w}@${w.t0.toFixed(2)}-${w.t1.toFixed(2)}`).join(" ")).join("\n"));
