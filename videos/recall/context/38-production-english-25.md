# 38 — English-25 (2026-11-27 batch 25): "Same slider, opposite jobs" (why a zipper locks one way and opens the other)

**Output:** `videos/recall/production/30s/2026-11-27-english-25/recall-30s-english25-01.mp4` + separate vertical thumbnail
`recall-30s-english25-01-thumbnail.png` (= frame 0 + Recall pill).

**Format:** 11 with the 2026-11-13 and 2026-11-15 batch notes. **Style:** 15, unchanged (same performer with the E13 legs, café,
palette, Fredoka caption pill, English voice, score engine and CTA). **Language:** English only. Earlier MP4s preserved; no automation.

## Request essentials (user; facts about the brief)
- "NEXT EPISODE — English batch 25, authorized 27 November … Batch 24 is complete. Produce exactly one new episode."
- Topic: "Why a zipper opens from one end and locks from the other. Use a clear cutaway of an oversized slider and show its channels
  meshing and unmeshing opposing teeth. Preserve approved Recall visual style. No quiz." If already covered, choose an unrelated subject
  and record the change. Verify claims with authoritative sources.
- 30.000 s 1080x1920 H.264/yuv420p + AAC, English voice and captions only; strong truthful frame 0 + thumbnail; hook 0–3, build/proof to
  21, payoff by 27, short CTA; one idea per shot; captions ~y 280–460; vital content away from bottom/right UI; free tools only.
- Output path as above; thumbnail and source/QA notes; check decode, caption timing, narration, branding; commit/push only new work;
  check free disk early; preserve earlier work; no social publishing.

## Order of work (facts)
- Branch equal to the remote at c915f7b (E24 final). Free disk checked first: 27 GB available (earlier E23/E24 build caches kept).
- Source checkpoint 531c1b2 pushed before the full render.

## Topic check → topic kept (why)
No delivered episode (F01–E24) covers zippers, sliders or interlocking teeth. Different from E24 in question, setting (pencil case +
giant slider cut-away vs microwave door + perforated sheet) and mechanism (Y channel and wedge acting on staggered nesting teeth vs
wavelength vs hole size).

## Final script (84 words, 25.9 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matched)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.05 | Same slider, opposite jobs. | 1.89 |
| l02 | 2.15 | Pull it one way, the teeth lock. Pull it back, they open. How? | 3.44 |
| l03 | 5.82 | Inside, the slider's channel is shaped like a Y. | 2.65 |
| l04 | 8.70 | Closing, its slanted walls squeeze both rows together. | 3.05 |
| l05 | 11.98 | Each tooth has a bump and a hollow, so each bump nests in the next hollow. | 4.29 |
| l06 | 16.50 | Nested, they hardly pull apart sideways. | 2.30 |
| l07 | 19.03 | Opening, a wedge between the arms splits them apart. | 2.97 |
| l08 | 22.25 | And many sliders hold still until you pull the tab. | 2.87 |
| l09 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |
(l08 was trimmed from "… so they won't creep open." so the speech ends before the CTA.)

## Sources (quotes, claim map and facts vs assumptions in the output folder's `docs/SOURCES.md`; read 2026-11-27)
- **Sundback, US Patent 1,219,881 "Separable fastener" (1917):** "a Y-shaped channel"; "a point to fit between the diverging channels";
  a chamber whose "side walls … having inclined faces" and "a tongue … separating the chamber into sidewise extending branch channels";
  "on moving the slide in one direction to unlock and open the said members, the said slide when moved in the opposite direction closing
  the said members"; members "in staggered relation, each member having a recess on one side and a projection of similar shape on the
  other"; "the outside of one member nests within the recess of an adjoining member"; engaged stringers "have practically no movement of
  separation".
- **YKK Americas (auto-lock vs pin-lock):** "keeps the slider in place unless the slider's tab is pulled"; "prevents the slider from
  moving on its own if the zipper tape is forced apart".
- **Facts vs assumptions:** generic simplified metal zipper; the lock catch is illustrative; speeds, angles, arrows and the exploded nest
  animation are illustrative; "many sliders" because not all lock.

## CTA
Same verified wording as E13–E24: "Download Recall to turn your study material into lessons."

## Creative decisions (choices, not facts)
- **Frame 0 = thumbnail:** the whole giant slider with its lime tab — separate rows entering its top, locked teeth leaving its bottom —
  under "SAME SLIDER, / OPPOSITE JOBS". Vertical chain suits the portrait frame.
- **Proof:** the cover lifts to reveal the Y channel; closing with glowing slanted walls; an exploded four-tooth stack (lime bumps,
  rimmed hollows) that nests; a sideways pull that holds; opening with the glowing wedge.
- **Payoff:** ghosted cover with a lime catch between two teeth while the tapes are pulled; then the café close-up where pulling the tab
  unzips the case.
- **Preview fixes (3 passes):** frame 0 too tight (pulled back to show the whole Y), cover lifting into the lens (now lifts up and fades),
  pull arrows placed at the off-screen slider's height (own height, larger), opaque ghost cover and a hidden catch (always-transparent
  material, bigger glowing catch, lower camera), invisible hollows (pale rims + light from below), café framing.

## Skill adjustments learned this round
- A vertical mechanism (a zipper chain) is a natural fit for the portrait frame: keep the moving part fixed and scroll the chain.
- Transparency toggles on a Three.js material need `transparent` set at creation; vary only `opacity`/`depthWrite` per frame.

## Progress
- 2026-11-27: setup + disk check; topic kept; sources verified; narration (ASR matched); timeline generator; giant zipper, nest demo,
  pencil case; three preview passes; mix −14.62 LUFS, −1.6 dBTP, voice +16.1…+18.9 dB; checkpoint pushed; full render (all checks passed); visual review → two framing fixes via partial re-render; final QA passed; committed.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `cfe9aada…e459`, 9,099,173 bytes; thumbnail sha256 `bd75319f…30a0`.
- 25/25 automated checks pass; narration sync (all 9 lines within 0.2 ms) and caption sync (13 groups, lead 0.00–0.05 s) pass.
- H.264 High 1080x1920 yuv420p 30 fps, 900 decoded frames, video/audio/container 30.000000 s, full decode clean; AAC-LC 48 kHz stereo.
- −14.7 LUFS, −1.5 dBTP, LRA 2.0, 0 clipped samples; ASR WER 0.0; caption ink x 204–876, y 342–557; longest static run 10 frames.
- Frame 0 = thumbnail (pill rows excluded: mean abs diff 1.76/255).
- Visual review fixes: `pouch_react` caption over the face (camera pulled back/aimed higher) and `pull_tab` arm-dominated close-up
  (higher view down on the case); partial re-render of frames 60–172 and 720–793, untouched neighbours md5-identical, re-mux, QA re-run.

## Publishing caption
`production/30s/2026-11-27-english-25/publishing-caption.txt` (from `script.json`; exact transcript + illustration note + 2 sources +
hashtags). Not published anywhere.

## Exact commands
`cd videos/recall/production/30s/2026-11-27-english-25 && WORKERS=3 ./build.sh`; `TTS=1 ./build.sh` also regenerates narration, word
timings and timeline; `python3 make_caption.py` regenerates the post copy.

## Next
Only on user request.
