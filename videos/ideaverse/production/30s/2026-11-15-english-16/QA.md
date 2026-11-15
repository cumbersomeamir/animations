# QA — ideaverse-30s-english16-01.mp4 (English, batch 2026-11-15-english-16 / batch16)
sha256 8ee36342a27851187947465cb3e36d7d7d4ad863374b3196c9b0261040a78520 · thumbnail `ideaverse-30s-english16-01-thumbnail.png`
(1080x1920 PNG, sha256 bd9b5b90f82b9395f76349bab625997aee50d8b9fd9f1262f29bed9b7a85773a) · evidence in `qa/`
(regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −15.0 LUFS, true peak −1.4 dBFS; music ducked under voice; the wake chime
  sits before the first word and in the pause after "cold,"; ticks are quiet.

## Captions (2026-11-11 safe area)
- English only, ≤ 2 lines, 60 px; pill x 126..874 / y 344..520, text ink x 164..837 / y 373..497 → SPEC PASS (inside
  x 100..900, y 230..1500). Top 300 px: scene only (DOCKET's antenna, TV silhouettes, wall monitor) — qa/top-band-strips.png.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All seven lines MATCH; every recognised word inside a caption that shows it (qa/asr-narration.txt).
- No real wake phrase is spoken (the video cannot wake viewers' speakers); "Hey Google" never appears in audio.
- Limitation: I cannot listen. Narration, sync and clipping were checked by ASR, loudness/true-peak and the spectrum image
  only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, key frames, thumbnail)
- Frame 0: DOCKET (puzzled), the TV line in subtitles, the speaker's ring glowing + WHO WOKE IT? (no fade-in, no logo).
  X-ray: chip glows (ON DEVICE); snippets fly from the TV into the speaker and are dropped; the cloud stays dim (NOTHING
  SENT); the meter's wake line appears (CLOSE ENOUGH?). Card: 12 show tiles → a lit-ring badge on each (12 TV SHOWS →
  12 OF 12). The line plays: the meter crosses the line, the ring lights, the audio flies to the cloud (SENT). Phone:
  Sensitivity Default → Less (LESS SENSITIVE). Same line again: stays under the raised line (STAYS ASLEEP). CTA.
- Fixed during review: layout re-done twice from test stills (DOCKET blocked the hook; TV, meter and cloud were cut off;
  the card's 4th row sat under the label → 4×3 grid; the phone slider sat under the label → moved up; subtitles hidden
  while the speaker is explained; snippet tiles fade in below the top band); after the full render, the study card showed
  its idle decorative ring for 7 frames (12.70–12.93 s) → plain card, frames 381–392 re-rendered (only 381–388 changed).
- Known minor: the meter overlaps the TV cabinet in the wide shots (it stays readable).

## Content
- Sources and claim types in context/31 (Google Assistant privacy help; Google Nest sensitivity help; Dubois et al.,
  PETS 2020 + Mon(IoT)r Lab summary; Chen et al. ICASSP 2014; Sainath & Parada Interspeech 2015). The study example is
  stated in the past tense; the settings screen is generic (EXAMPLE); no Ideaverse speaker or voice feature is implied.

## Preservation
- All 21 earlier MP4s re-hashed unchanged.
