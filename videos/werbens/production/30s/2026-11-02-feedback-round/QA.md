# QA — Werbens feedback round 30 s #01 "The decoy effect" (final export = render 1 after 5 stills passes)

**File:** `videos/werbens/production/30s/2026-11-02-feedback-round/werbens-30s-feedback-01.mp4`
**sha256:** `fc9cda2ae0888146335eaf60695d689ea66d5748dfa3e71f5e4d21788b424516` · 4,569,824 bytes · checked 2026-11-02

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~193 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/page-log.txt`: "no console errors or warnings" | PASS |

## 2. Audio + narration timing (`qa/loudness.txt`, `qa/astats.txt`, `qa/audio-spectrogram.png`, `qa/asr-mix.json`)
- Integrated −15.0 LUFS, true peak −1.4 dBTP, LRA 6.2 LU, sample peak −1.40 dBFS, flat factor 0 (no clipping). PASS.
- Stems before the mix: voice −20.8 LUFS (×1.4 in the mix), music −32.1 LUFS (then ×0.8 and ducked −10 dB under speech),
  foley −25.7 LUFS (ducked −4 dB under speech) → music is subtle, voice clearly on top (waveform in the spectrogram image).
- No loops: the score is 11 held pad chords (one per scene) + 26 single event-tied piano notes; no beat grid, hats,
  arpeggio or repeating bass figure. Music thins to a low fifth under the hanging ball and cuts on the impact.
- Narration timing (voice stem onsets/offsets vs schedule): L1 0.33–2.06 · L2 3.13–8.03 · L3 9.33–11.87 · L4 13.23–17.41 ·
  L5 20.63–23.58 · L6 26.54–28.79 s (all within 0.04 s of the planned line slots; last word ends 1.2 s before the end).
- Final-mix ASR (Whisper base.en on the MP4): L1 8/8 · L2 16/16 · L3 9/9 · L4 13/13 · L5 9/9 · L6 6/7 → 61/62. The only miss is
  the brand name ("Warbins"/"Wurbins"; not in Whisper's vocabulary — also missed on the clean narration). The name is spelled
  in the caption and the wordmark. Intelligibility measured by ASR; no human listening pass was possible here.

## 3. Captions, labels and safe areas (`qa/dom-bounds.json`, live DOM, every frame)
DOM_RESULTS

## 4. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 31 beats, `qa/frames/*.jpg`)
- Every second shows a physical change tied to the line being spoken (landings → guide line → price connector → glass
  transform → 20 ml band lifts → coin lands/hops → DECOY flip/grey → hop → ball crush → regroup → glass + need line → ring
  cut → slice set down → CTA tile). No static page, no camera bobbing.
- Beats checked: f0 first frame (small cup already falling), f16/f34 landings, f79 medium falls in (no caption on screen),
  f105 medium lands on "medium", f141 push to the two-cup shot, f200 price connector, f249/f270 lids + glass, f297 band lift +
  "+20 ml" + level line, f318 coin + "+Rs5", f336 coin hop, f369 lids return, f390 pull-back, f412 DECOY flip, f456 beam,
  f497 hop, f552 ball hover (after the caption has cleared), f573 impact, f595 slide-off, f620 regroup, f640 glass, f690 need
  line, f718/f731 ring tightens/snaps, f745/f760 slice arc/set-down "+150 ml for +Rs70", f785 CTA slide, f792 tile lands,
  f810 wordmark, f899 last frame.
- Text sizes on a 1080-wide frame: captions 54 px, tag prices 50 px, ml 40 px, notes 36 px, tag names 25 px, wordmark 72 px.
- Label "Illustrative menu" shown once (0.7–8.2 s). No real brand, no app feature, no statistic, no testimonial.

## 5. Defects found and fixed before the final render
| Pass | Defect | Fix |
|---|---|---|
| stills 1 | open lids rendered face-on as large "bubbles"; stray note in y < 300; "+20 ml" cut off at the left edge; latte liquid too pale; blade read as a grey shelf; cluttered CTA | lids pop up + fade; note removed; note anchored right of the band and clamped to x 96–984; warmer latte; glowing ring cut; CTA keeps only small cup + icon tile |
| stills 2 | medium and ball passed behind captions; 20 ml band seen edge-on; far-off shadow-map blobs from falling cups | medium falls during the caption gap (2.62 s), ball enters after the L4 caption ends; band tilts toward camera; airborne objects cast only the contact decal |
| stills 3 | large cup crossed the first caption at 0.4 s; coin fell through "+20 ml"; band too pale (emissive) | large drop starts at −0.2 s; coin starts lower with a pop-in; darker band/slice violet, lower emissive |
| DOM QA | small tag at x 60–77 (< 80), "+Rs5" bracket bottom 1575 (> 1560), slice note right 1014, small cup sliver in the close shot | small cup x −1.0, tag hidden while off-shot, connector between price rows, label clamp, small cup hidden outside the shot |
| audio | foley on word onsets risk (ticks on "below"/"almost", coin on "like") | ticks moved 0.08 s earlier, coin lands at 10.62 s; final ASR 61/62 |

## 6. Remaining limitations (honest)
- Synthetic narration (Kokoro). "Werbens" is pronounced with the stored override; Whisper cannot spell it (vocabulary limit).
- The brief's medium (Rs155) is a near-dominated decoy (Rs5 cheaper than the large), not strictly dominated; the narration
  describes exactly that. Research (Frederick et al., 2014) finds the attraction effect often absent for perceptual or tasted
  products, so the script says "can"; no claim that cafés use or profit from it.
- The four Instagram reference posts were not viewed; only the brief's description of their staging was used.
- The local "Desktop/video-review" folder named in the brief does not exist in this cloud container; the finished MP4 is
  delivered as a chat attachment and in the repo path above.
