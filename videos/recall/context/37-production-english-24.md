# 37 — English-24 (2026-11-23 batch 24): "This window is a metal net" (why a microwave door has a metal mesh you can see through)

**Output:** `videos/recall/production/30s/2026-11-23-english-24/recall-30s-english24-01.mp4` + separate vertical thumbnail
`recall-30s-english24-01-thumbnail.png` (= frame 0 + Recall pill).

**Format:** 11 with the 2026-11-13 and 2026-11-15 batch notes. **Style:** 15, unchanged (same performer with the E13 legs, café,
palette, Fredoka caption pill, English voice, score engine and CTA). **Language:** English only. Previous MP4s preserved; no automation.
**Feedback applied:** Satisfied? = "Yes": approved visual context, narrator, soundtrack engine and CTA kept; subject, sets (door macro,
giant perforated door cut-away), choreography and foley are new.

## Request essentials (user; facts about the brief)
- "NEXT EPISODE — English batch24, authorised 23 November … Preserve the separate batch23 workflow and all prior files; this recovered
  session should create ONLY the new batch24 episode."
- Topic: "Why a microwave door has a metal mesh you can see through." Educational EM physics: wavelength and conductive shielding,
  visible light vs microwave wavelengths; original 3D door cut-away; accurate approximate scales; no claim of zero leakage, no unsafe
  experiments; explain why holes pass light but attenuate microwaves; no quiz. Must differ from batch 23 (actual subject: smoke alarm).
- Rules as E22/E23 (30.000 s 1080x1920 H.264/yuv420p + AAC, English captions/voice, hook/superhook/proof/payoff/CTA timing, captions
  ~y 280–460, sources in the project, no posting, no Desktop/video-review files, no new chats).
- Resume instruction (2026-11-25): inspect tree/checkpoint/render/remote, reuse the existing episode and verified render, finish and push.

## Order of work (facts)
- 2026-11-23: branch equal to the remote at 6ea4d20 (E23 final); E24 built in its own folder; the full build finished before a session
  pause (render, mux, thumbnail, QA). Nothing had been committed for E24.
- 2026-11-25 (resume): remote unchanged (no E24 on it); the local render was reused after a checker fix and a 18-frame partial re-render
  (see QA summary).

## Topic check → topic kept (why)
Not covered before: R02 (cold patches/standing waves), E11 (dielectric heating vs the plate) and the declined E07/E21/H04 suggestions
were all about microwave *heating*; none covers the door screen, wavelength vs hole size or shielding. Different from E23 in question,
setting (door macro + giant perforated sheet vs ceiling alarm + optical chamber) and mechanism (aperture vs wavelength and metal
reflection vs light scattering by particles).

## Final script (80 words, 27.0 s of speech; voice af_bella 0.7 + am_puck 0.3, en-us, 0.98; per-line ASR matched)
| id | start (s) | text | dur (s) |
|---|---|---|---|
| l01 | 0.05 | This window is a metal net. | 1.46 |
| l02 | 1.75 | Light gets through. So why don't the microwaves? | 2.67 |
| l03 | 4.75 | Microwaves are waves about twelve centimeters long. | 2.94 |
| l04 | 7.95 | The holes are only about a millimeter wide, over a hundred times smaller. | 4.14 |
| l05 | 12.35 | To waves that long, the net is like solid metal, so they bounce back inside. | 4.46 |
| l06 | 17.05 | Light waves are about two thousand times smaller than the holes, so they slip through. | 4.59 |
| l07 | 21.90 | So if the door is bent, or won't close firmly, stop using it. | 3.51 |
| l08 | 26.45 | Download Recall to turn your study material into lessons. | 3.28 |

## Sources (quotes, claim map, facts vs assumptions in the output folder's `docs/SOURCES.md`; read 2026-11-23)
- **HyperPhysics (GSU), "Microwave Ovens":** holes "about 1 mm in diameter compared to a 120 mm wavelength … about 120 times the size of
  the holes, and can't 'see' the holes to get out"; "at 500 nm wavelength, the visible light wavelengths are about 2000 times smaller than
  the holes"; 2,450 MHz → "about 12 cm".
- **NASA Science:** oven microwaves "about 12 centimeters in length"; the eye detects "380 to 700 nanometers".
- **FDA "Microwave Oven Radiation":** microwaves "are reflected by metal"; federal leakage limit (not zero); "Don't operate a microwave
  oven if the door does not close firmly or is bent, warped, or otherwise damaged"; two interlocks stop microwaves when the door opens.
- **21 CFR 1030.10:** 1 mW/cm² (new) / 5 mW/cm² thereafter at 5 cm.
- **Facts vs assumptions:** holes and wave drawn to scale with each other (1 : 120); pitch/pattern illustrative; light drawn as rays,
  not to scale (size given in the label); wave speed, amplitude, the solid-metal tint and the leaking gap are illustrative; no leakage
  amount shown; oven never shown running with the door open.

## CTA
Same verified wording as E13–E23: "Download Recall to turn your study material into lessons."

## Creative decisions (choices, not facts)
- **Frame 0 = thumbnail:** macro of the door's perforated net with a lit terracotta mug behind it; title "THIS WINDOW / IS A METAL NET".
- **Proof:** giant door cut-away seen from behind/above so the wave reads in portrait (it oscillates sideways while travelling toward
  the sheet); rulers for 12 cm and 1 mm; the sheet tints "like solid metal"; a paler reflected wave; outside, warm rays through holes;
  back to the real door POV where the mug is clearly visible.
- **Limit + payoff:** overhead view of the bent door's gap with a wave squeezing out (illustrative); in the café the door sits ajar,
  the oven is off, the performer frowns and pulls the plug ("stop using it").
- **Preview fixes (4 passes):** dark mug behind the mesh (stronger cavity light, warm inner glow, then a terracotta mug for contrast
  after an over-bright pass); performer could not peer into the door (microwave turned to face them; head-turn sign fixed); a side-on
  wave showed one arc in portrait (re-staged top-down with sideways oscillation); dark giant sheet (matte grey); overwhelming light rays
  (fewer, dimmer); unreadable gap shot (steep overhead view, wider gap, stronger leak); subtle ajar door (0.1 rad).

## Skill adjustments learned this round
- Long waves in a portrait frame: let them travel into depth with sideways oscillation, seen from above, instead of side-on.
- Exact feature positions on procedural textures: size the sheet in whole texture tiles so hole centres can be computed exactly.
- Caption QA must treat digits in captions and spelled-out numbers in the script as equal.
- After a partial re-render, merge the renderer's per-range layout log so the every-frame layout check stays exact.

## Progress
- 2026-11-23: topic check (kept); sources verified; narration (ASR matched); timeline generator; door macro, microwave screen, giant
  cut-away; four preview passes; mix −14.59 LUFS, −1.6 dBTP, voice +16.5…+18.3 dB; full render, mux, thumbnail, QA.
- 2026-11-25: resumed; caption-sync checker fixed (number equivalence); title end moved to the hook cut and frames 39–56 re-rendered;
  all QA re-run and passing; docs, context and progress written; committed and pushed.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 c21a2206…bc76, 29,260,457 bytes; H.264 High 1080x1920 yuv420p 30 fps, 900 frames, video/audio/container 30.000 s; AAC
  48 kHz stereo; full decode clean; −14.6 LUFS, −1.4 dBTP, 0 clipped samples; ASR WER 0.058 (number formatting); narration starts within
  0.2 ms of plan; 13/13 caption groups lead by 0.00–0.05 s; caption ink x 206–874, y 342–558; y 0–230 clear; no overlaps; longest static
  run 0.53 s; frame 0 = thumbnail (mean abs diff 2.12/255).
- Not verified: listening by ear and real-time viewing (frames, metrics and ASR only). Known weakness: performer's face partly out of
  frame in the unplug shot.

## Publishing caption
`production/30s/2026-11-23-english-24/publishing-caption.txt` (from `script.json`; exact transcript + illustration note + 4 sources +
hashtags). Not published anywhere.

## Exact commands
`cd videos/recall/production/30s/2026-11-23-english-24 && WORKERS=3 ./build.sh`; `TTS=1 ./build.sh` also regenerates narration, word
timings and timeline; `python3 make_caption.py` regenerates the post copy.

## Next
Only on user request.
