# QA — `recall-30s-english21-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-18-english-21/recall-30s-english21-01.mp4`
- **sha256:** `5d70b566a6d30c5d34a1b42ca05314ba233cc8601407463a51fd8af3a9ea0e43`
- **Size:** 9,185,072 bytes
- **Thumbnail:** `recall-30s-english21-01-thumbnail.png`, 1080x1920 PNG, sha256 `b43b662e8198679a661a66dbc3f72159deb784e987e0cbc641e625bc3c4f6d01`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`. Caption checks use the
batch area (ink inside x 100–900 and y 230–1500; nothing in y 0–230); labels must sit inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass on the first full render, and so do narration sync and caption sync.** No partial
re-render was needed.

## First frame (batch rule)
| check | result |
|---|---|
| frame 0 content | the giant pan cross-section: a big glossy water drop hovering just above the pan, vapour streaming out from under it, the coil glowing below; plus the title "THIS DROP / IS FLOATING" (4 words) at full opacity; no logo intro, no fade from black, no empty set |
| title bounds | Fredoka title, ink x 200–880, y 361–583 (inside x 100–900, y 230–1500) |
| frame 0 = thumbnail | decoded frame 0 of the final MP4 vs the thumbnail, pill rows (y 1380–1490) excluded: mean absolute difference 1.27/255 (p99 5.3, i.e. compression only) |
| hook audio | steam hiss and a drop wobble at 0.00 s; the narrator says the title words from 0.05 s (measured 0.050 s) |

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 54.3 > 12); longest static run 12 frames (limit < 60) |
| missing assets | none: fonts load (`document.fonts.check` true for every caption), the Recall icon loads (end pill and thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script. No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. Transcript: "This drop is floating. Make the pan hotter, and it lasts longer, not shorter. On a warm pan, water touches the metal and sizzles away in seconds. But on a very hot pan, the underside flashes into steam. That steam cushion holds it up, and steam carries heat poorly. So the drop skates instead of boiling. Kitchen test on an empty pan. Sizzling means not yet. Skating beads mean ready to sear. Download Recall to turn your study material into lessons." |
| loudness (EBU R128, final MP4) | **−14.6 LUFS**, true peak **−1.6 dBTP**, LRA 3.3 LU, **0 clipped samples** |
| voice over bed | +16.3 … +20.5 dB per line |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.05 | 0.050 | 0.0 ms | 0.87 | hook_drop (frame 0: hovering drop + title) |
| l02 | 1.45 | 1.450 | 0.0 ms | 0.84 | react_pan (flick, beads skate, tilt up to a raised brow) |
| l03 | 4.60 | 4.600 | 0.0 ms | 0.86 | giant_warm ("warm pan", the drop lands, boils, "sizzles away") |
| l04 | 8.90 | 8.900 | 0.0 ms | 0.85 | giant_hot ("very hot pan", the underside flashes into a "steam layer") |
| l05 | 12.55 | 12.550 | 0.0 ms | 0.85 | cushion_lift ("holds it up") → cushion_heat at 14.30 ("slows heat") → giant_skate at 16.30 ("skates") |
| l06 | 20.45 | 20.450 | 0.0 ms | 0.85 | test_sizzle (empty pan, two sprinkles sizzle away: "not yet") → test_skate at 24.56 ("ready to sear") |
| l07 | 26.45 | 26.450 | 0.0 ms | 0.84 | cafe_cta (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 14 spoken caption groups appear 0.05–0.07 s before their first spoken word and stay until their last (the title group is
  on screen from frame 0). The l05 tail group ("so the drop skates / instead of boiling.") stays on through the wordless proof_pan
  shot (18.55–20.38 s).

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| caption ink bounds | title (0–1.38 s) x 200–880, y 361–583; all other captions **x 221–859, y 341.5–464.5**; ≤ 2 lines |
| y 0–230 | nothing drawn (`top_0_230_clear`) |
| labels | 10 brief labels, **one at a time**, inside x 110–890, y 561–1455: "warm pan", "sizzles away", "very hot pan", "steam layer", "holds it up", "slows heat", "skates", "lasts longer", "not yet", "ready to sear"; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 11 shots, plus
each caption start), both decoded from the final MP4, and the thumbnail. Every boundary frame shows the right caption and label
for its shot (no stale overlay); hard cuts only. Representative frames: the hovering drop (0.5 s), the flick onto the café pan and
the skating beads (1.5–2.5 s), the raised brow (3.5–4.5 s), the warm-pan drop flattening, boiling and steaming away (5.5–8.5 s), the
hot-pan drop falling and hovering on its steam layer (9.5–11.5 s), the gap close-ups with lift arrows and short heat arrows
(12.5–15.5 s), the drop skating (16.5–18.5 s), the real beads (19.5 s), the empty pan, sprinkles and sizzle (20.5–24.5 s), the
skating beads (25.5 s) and the CTA (26.5–29.5 s).

**Cosmetic note (accepted):** for about 0.3 s (10.3–10.6 s) the "very hot pan" label overlaps the falling drop before it reaches
the steam layer; the label stays readable.

**Fixed before the full render (three preview passes):** oversized arrow heads and vapour dots in the gap close-ups; a steam layer
that read as a pedestal; a react shot that hid the pan (now a tilt from the pan to the face); beads too big; faint sizzle puffs; a
pale pan.

## Limits (honest)
- **I cannot listen.** The listen-through was done as measurements only: ASR of the final mix, narration cross-correlation,
  loudness, true peak, clipping and voice-over-bed levels. No human listening check was performed.
- No temperature is narrated because sources differ (~150–240 °C depending on surface and method). "Lasts longer" holds from a warm
  pan up to around the Leidenfrost point; far hotter still, drops shorten again slowly (Walker; Mathijssen et al.). The steam layer
  is drawn far thicker than the real ~0.1 mm; the pan's orange heat tint and the coil glow are illustrative; drop sizes, speeds and
  paths are illustrative.
- `audio/.venv` is a link to the english-20 environment (same packages) to save disk space; it is git-ignored, and `build.sh`
  rebuilds it if missing.
- The user's review folder is not reachable from this cloud session, so nothing was saved there (and no operational files were put
  in Desktop/video-review); the MP4 and thumbnail are attached in chat and committed to the branch.
