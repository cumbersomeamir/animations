# QA — Werbens production 30 s #02 (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-02-batch-02/werbens-30s-production-02.mp4`
**sha256:** `29d53d97939fdac9d79354f85d472afc76a3bfe7444f04a856a5b80e7f9495e1` · 6,620,893 bytes · checked 2026-11-02

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC 48 kHz stereo | AAC-LC, 48000 Hz, 2 ch, ~200 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |

## 2. Audio (`qa/loudness.txt`, `qa/astats.txt`, `qa/audio-spectrogram.png`, `qa/asr-mix.json`)
- Integrated −15.0 LUFS (target −14…−16), true peak −1.4 dBTP (≤ −1), sample peak −1.42 dBFS, flat factor 0. PASS.
- Voice up front (music −9 dB, SFX −4 dB under speech); quiet hi-fi band + chiptune mascot; room-tone drop before L6.
- Final-mix ASR (Whisper base.en): L1 11/11 · L2 12/12 · L3 17/17 · L4 8/8 · L5 17/17 · L6 8/8 → 73/73; full transcript =
  script. PASS. (Render 1 failed this check — "choose"→"shoot", "a modest photo"→"the modest photos" — fixed by moving
  foley off word onsets.) Intelligibility was measured with ASR; no human listening pass was possible here.

## 3. Captions and safe areas (`qa/dom-bounds.json`, every frame, 900 samples, live DOM)
- Caption line boxes y 351–467 (ink within 350–470), x 187–893 (margins ≥ 80 px), max 2 lines; pill 340–480. PASS.
- Mascot never under the caption pill, never in y 0–300, never off-frame. Top 0–300 free of overlays. PASS.

## 4. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png`, `qa/frames/*.jpg`)
- Every second shows a cause → effect action (cursor drags/clicks/types → UI changes; mascot acts → UI state).
- Transitions checked: section seams (f89/90, f239/240, f689/690, f869/870), car drop (f48), resize + spring (f250–268),
  Compare split (f400–412), rack focus (f487), page swap (f500–510), ghost bounce (f550–560), page expand (f580–590),
  spotlight + flip (f765–822), pull-back (f840), end dim (f899). Moves stay sharp (no whips in this episode).
- Labels visible: "ANALYTICAL RECONSTRUCTION OF THE 1959 LAYOUT · NOT THE ORIGINAL AD", "GENERIC COMPARISON LAYOUT ·
  ILLUSTRATIVE · NOT A REAL AD", "ORIGINAL EXAMPLE · FICTIONAL PRODUCT · ILLUSTRATIVE", "ILLUSTRATIVE MOCK-UP".
- Accuracy: claims mapped in `production-30s-02.md`; no performance statistics; no VW photo/logo/copy reproduced.

## 5. Defects found and fixed
| Pass | Defect | Fix |
|---|---|---|
| timing | "isn't to copy" heard as "isn't a copy" | restored draft wording "is not to copy" + full "to" phonemes |
| stills 1 | static first 3 s; anatomy tags small | car drag at 0.5–1.6 s with push-in; page-level anatomy framing |
| stills 2 | mascot on page top edges under the caption (1.4–3 s, 17–19 s) | camera rects with mascot headroom |
| render 1 | ASR: "choose"→"shoot", "a modest photo"→"the modest photos" (foley on onsets) | tags/SFX ~0.1 s before words; cheer after "choose" |
| render 1b | jump targets still `display:none` → mascot flew toward (0,0) for a few frames | layout-position anchors; tags kept in layout |
| render 2 | — rechecked everything above | final |

## 6. Remaining limitations (honest)
- Synthetic narration (Kokoro); intelligibility measured by ASR, not a human listener.
- Full-window shots (0–1.9 s, 13.5–16.5 s, 19.3–23 s, 28.5–30 s) make secondary UI text small on a phone; captions and
  close-ups carry the meaning.
- The 1959 date refers to the campaign/account (GHI, Ad Age via GHI); the museum's catalogued copy of the ad is a 1962 printing.
  The Ad Age page itself could not be fetched (HTTP 403); its ranking is cited through the GHI entry.
- Living Screencast's "real product UI" rule is adapted (fictional, labelled workspace) as documented in context/11.
