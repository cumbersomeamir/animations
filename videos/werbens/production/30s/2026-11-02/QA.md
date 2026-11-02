# QA — Werbens production 30 s #01 (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-02/werbens-30s-production-01.mp4`
**sha256:** `9bf9df761ff722bc097d1733493036358665e4819f9bb3bdd13ca90db3416257` · 10,531,653 bytes · checked 2026-11-02

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC 48 kHz stereo | AAC-LC, 48000 Hz, 2 ch, ~197 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |

## 2. Audio (`qa/loudness.txt`, `qa/astats.txt`, `qa/audio-spectrogram.png`, `qa/asr-mix.json`)
- Integrated −15.0 LUFS (target −14…−16), true peak −1.5 dBTP (≤ −1), sample peak −1.46 dBFS, flat factor 0. PASS.
- Voice up front: music ducked −9 dB, SFX −4 dB under speech (voice ≈ 11 dB above the ducked score); quiet hi-fi + chiptune score.
- Intelligibility (local Whisper base.en on the final mix, per line): L1 8/8 · L2 7/7 · L3 4/4 · L4 6/6 · L5 11/11 · L6 17/17 ·
  L7 12/12 · L8 6/6 → 67/67 words; full transcript matches the script (only the hyphen in "water-resistant" differs). PASS.
- "Listening" here = measured: ASR, loudness, spectrogram/waveform inspection, timing of every cue against `timeline.js`.
  A human listening pass was not possible in this environment.

## 3. Captions and safe areas (`qa/dom-bounds.json`, sampled every 1/6 s from the live DOM)
- Caption text line boxes: y 351–467 (required ink in 350–470), x 215–865 (margins ≥ 80 px), max 2 lines; pill 340–480. PASS.
- Top 0–300 px: no overlays; mascot never there (`mascotInTop300: []`). PASS.
- Mascot never under the caption pill (`mascotUnderCaption: []`). PASS.
- `mascotPartlyOffFrame` at 3.17 s (mid-whip transit at the left edge) and 13.0–13.5 s (mascot is in the stage while the
  camera is on the BENEFIT card) — expected, not obstruction.
- Subject band y 510–1470 enforced by construction (camera focus rects mapped into it, incl. mascot headroom).

## 4. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png`, `qa/frames/*.jpg`)
- Every second has motion with cause and effect (cursor drags/clicks/types → UI changes; mascot acts → UI state changes).
- Transitions checked: section seams (f89/90, f239/240, f689/690, f869/870), whips (f92–95, f384–388, f404–409, sharp
  outside the whip window), pixel wipe (f293–305), spotlight freeze (f735–783), pull-back (f783–800), first/last frame.
- Continuity: the feature card leaves a dashed slot; the chip carried by the mascot becomes the pack's "water-resistant"
  label; BENEFIT/SUPPORT cards and AD CHECK ticks persist; headline history (feature → placeholder → benefit) is consistent.
- Accuracy: claims mapped to sources in `context/12-production-30s-01.md`; product and evidence labelled fictional on screen.

## 5. Defects found and fixed
| Pass | Defect | Fix |
|---|---|---|
| timing | "Water-resistant" heard as "water-assistant"; word anchors collapsed in L5/L7 | phoneme override; in-order nearest-pause anchoring |
| stills 1 | mascot + chip under the caption when on the headline; Zzz in caption zone | camera rects +150 px headroom; sleep perch on the brand row |
| stills 2 | sprite on line 2 covered line 1 of the headline (skill pitfall) | hops ride the field's top edge; badge moved/narrowed; inset moved |
| stills 3 | blur on every fast push/pull | anisotropic blur only inside the three whip windows |
| render 1 | mascot under caption at 9.83–10.0 s and 20.0 s | hold head+photo through the wipe; earlier badge landing; lower whip arc |
| render 2 | — rechecked everything above | final |

## 6. Remaining limitations (honest)
- Narration is synthetic (Kokoro). Intelligibility is measured by ASR, not by a human listener.
- At full-window zoom (~6–7 s, ~19 s, 27–30 s), secondary UI text inside the window is small on a phone; captions and the
  zoomed shots carry the meaning.
- During the single hop down to the claim badge (19.8–20.1 s) the moving sprite briefly passes over headline letters.
- The Living Screencast "real product UI" rule is adapted: the workspace is a fictional, labelled mock-up (see context/11).
