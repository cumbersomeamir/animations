# QA — ideaverse-30s-english13-01.mp4 (English, batch 2026-11-13-english-13, topic-corrected: AI hearing aids)
sha256 b2970ca52e36eae600397085c137bd25119d023a1661a1517baecc320f914d31 · thumbnail `ideaverse-30s-english13-01-thumbnail.png`
(1080x1920 PNG, sha256 44847d0eace35b6face0400b3718b6eda9e39b3182d82618d9afc2b5736dd08d) · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, true peak −1.8 dBFS; music ducked under voice; the crowd swell
  (0–0.72 s) ends before the first word; stings sit in pauses.

## Captions (2026-11-11 safe area)
- English only, ≤ 2 lines; pill x 101..899 / y 344..520, text ink x 138..860 / y 373..497 → SPEC PASS (x 100..900, y 230..1500;
  top 300 px clear). Fonts 56–60 px.
- Defect found and fixed in review: the first two captions had shrunk to the 44 px minimum and their text overflowed the pill
  (ink x 85..914) — split into four shorter captions (60 px) and frames 20–220 re-rendered. The checker now also fails on
  text outside x 100..900 (it previously checked only the pill).

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All seven lines MATCH; every recognised word inside its caption window (also exact in small.en before render).
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, thumbnail, top-band-strips.png)
- Hook: noisy-room card in motion from frame 0 → WHICH VOICE?; two-shot: DOCKET holds a generic AI chip, hologram SPEECH ✓ /
  NOISE ✕; grid: SOUND smear → PITCH × TIME slicing → KEEP SPEECH → clatter falls, VOICES STAY → SECOND VOICE → split tiles
  + "?" → OVERLAP (push-in) → TAKE TURNS (voices slide apart) → ONE AT A TIME ✓✓; CTA.
- Fixed before the full render: chip hologram clipped at the frame edge → moved/resized; chip enlarged; payoff moved from a
  small two-shot to the full card; ✓ marks moved off the EXAMPLE tag.
- Known minor: ~8 frames at 7.3 s show the grid card before its first label fades in.
- Top 300 px: scene only (DOCKET antenna).

## Content
- Sources and claim types in context/28 (Phonak Audéo Sphere page; IEEE Spectrum, Wang 2016; Healy et al. JASA 2017; Wang &
  Chen 2018). No medical outcomes, no percentages, no brand on screen, no Ideaverse hearing feature implied.

## Preservation
- All earlier MP4s re-hashed unchanged. The superseded Face ID draft for this job was never rendered to an MP4 (git history only).
