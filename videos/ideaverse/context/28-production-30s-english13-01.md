# 28 — Production 30s english13-01 (English): "In a noisy room, which voice should a hearing aid keep?"

Batch 2026-11-13-english-13 ("NEXT EDUCATIONAL EPISODE", Satisfied? feedback retained) + TOPIC CORRECTION from the user on
2026-11-13 for the same job (not an additional video). Workspace `production/30s/2026-11-13-english-13/` · deliverables
`ideaverse-30s-english13-01.mp4` + `ideaverse-30s-english13-01-thumbnail.png`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse. Style: accepted pilot-01 DOCKET newsroom style via the latest
renderer; 2026-11-11 rules (context/11).

## Topic history for this job
1. Proposed: inpainting ("where does the hidden background come from?") = repeat of **hindi03-01** (Magic Eraser;
   prediction vs recovery; also swapped in english-08 and english-11) → replaced.
2. First replacement: Face ID depth dots — stopped mid-render after the user's correction; never delivered; source kept
   only in git history (commit 3b655d1).
3. **Final (user's correction): AI-powered hearing aids** — why they try to pull speech out of a crowded room, and why
   overlapping voices remain difficult. Not covered by any earlier episode (context/09, 12–27).

## Script (English, 74 words) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| (hook) | 0.0–0.72 | striking image | synthesized crowd murmur + clinks under the noisy-room card (no words) |
| s1 | 0.75 | hook (real question) | In a noisy room, which voice should a hearing aid keep? |
| s2 | 4.00 | escalation | Some new ones have an AI chip that pulls speech out of noise. |
| s3 | 7.60 | mechanism | The idea: slice sound into tiny bits of pitch and time, and keep the bits that look like speech. |
| s4 | 14.00 | result | Clatter fades. Voices stay. |
| s5 | 16.30 | the limit | But a second voice is speech too, and when two people talk at once, their bits overlap. |
| s6 | 22.00 | payoff | So around someone with hearing aids, take turns: one voice at a time. |
| s7 | 27.30 | CTA | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en on first synthesis.

## Facts → sources (accessed 2026-11-13)
| claim | type | source |
|---|---|---|
| some new hearing aids have an AI chip that pulls speech out of noise | documented product feature | Phonak (Sonova), Audéo Sphere product page, https://www.phonak.com/en-us/hearing-devices/hearing-aids/audeo-sphere — "Spheric Speech Clarity 2.0 - DEEPSONIC™ DNN chip separates speech from noise in real time from any direction"; "uses our proprietary and powerful DEEPSONIC™ AI chip". (Performance percentages on that page are NOT used.) |
| the idea: slice sound into tiny bits of pitch and time, keep the bits that look like speech | published research method (the general approach; a product's exact internals are not public) | DeLiang Wang, "Deep Learning Reinvents the Hearing Aid", IEEE Spectrum, 6 Dec 2016, https://spectrum.ieee.org/deep-learning-reinvents-the-hearing-aid — the program "breaks a noisy speech sample into … time-frequency units", a deep neural network classifies "the units as speech or not", then "a digital filter … tosses out all the nonspeech". |
| a second voice is speech too | documented (definition) | Phonak page — the chip "extracts, enhances and integrates speech from any number of voices" (i.e. it keeps speech, not one chosen voice). Wang & Chen, "Supervised Speech Separation Based on Deep Learning: An Overview" (2018), https://arxiv.org/abs/1708.07524 — "speech enhancement (speech-nonspeech separation)" vs "speaker separation (multi-talker separation)" are distinct tasks. |
| when two people talk at once, their bits overlap → hard | documented | IEEE Spectrum (Wang) — "If sounds share the same frequency band at the same time, the loudest sound in a scene overpowers the others" · Healy et al., J. Acoust. Soc. Am. 141(6):4230 (2017), PMID 28618817 — "Individuals with hearing impairment have particular difficulty perceptually segregating concurrent voices … This listening situation represents a very different problem for both the human and machine listener, when compared to perceiving speech in other types of background noise." |
| so: take turns, one voice at a time | practical inference from the two sources above (not a medical claim) | Healy et al. 2017 (concurrent voices are the hard case); IEEE Spectrum (the author's mother "pleads with us to speak in turn"). |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse hearing or audio feature. |
Not claimed: any hearing improvement, percentages, product rankings, or that the illustrated grid is a specific product's
algorithm. Illustrative: the room, ear, chip, tile grid, colours and overlap marks.

## Storyboard (cues.js)
1. 0–3.7 hook (easel close): noisy-room card — five voices and clatter flow into a generic ear with a hearing aid; crowd
   swell before the first word; WHICH VOICE? on "which voice".
2. 3.7–7.3 two-shot: DOCKET holds up a generic AI chip; hologram AI CHIP — SPEECH ✓ (wave rises) / NOISE ✕ (specks fall).
3. 7.3–13.9 card: SOUND (one blurred smear) → a sweep slices it into a PITCH × TIME grid (speech mint, noise brown,
   clatter white; axes) → KEEP SPEECH mask fades the noise.
4. 13.9–16.2 the last clatter falls away; VOICES STAY (speech tiles glow).
5. 16.2–21.9 SECOND VOICE (amber) lands in the same tiles → split mint/amber tiles + "?" → OVERLAP (camera push-in).
6. 21.9–27.15 TAKE TURNS: the two voices slide apart in time (no shared tiles) → ONE AT A TIME ✓✓.
7. 27.15–30 CTA: DOCKET waves; "Download the / [icon] Ideaverse app."
Thumbnail: the noisy-room card + "WHICH / VOICE?" (VOICE? in amber).

## QA / status — DELIVERED 2026-11-13
- Output: production/30s/2026-11-13-english-13/ideaverse-30s-english13-01.mp4 · sha256 b2970ca5…4d31, plus
  ideaverse-30s-english13-01-thumbnail.png ("WHICH VOICE?"). QA.md in that folder.
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −15.0 LUFS / −1.8 dBTP.
- English ASR on the final MP4: all seven lines MATCH, no word outside its caption; caption text inside x 100..900.
- Review fix: two over-long captions split (text had overflowed to x 85..914); checker now tests text, not just the pill.
- Limitation: ASR-only listening check (no by-ear listen possible here).
