# QA — ideaverse-30s-production-02.mp4 (batch production-30s-2026-11-02-batch-02)

SHA256 8b30167988bed3a5a12527fd4437f6e6ba86036eb1d999a1a2163ebc9136afef · 10,839,795 bytes. Evidence in qa/.

| check | result |
|---|---|
| duration (format / video / audio) | 30.000000 / 30.000000 / 30.000000 s (qa/ffprobe.json) |
| video | H.264 High, 1080x1920, yuv420p, 30/1, 900 frames; decoded count 900 |
| audio | AAC-LC 48 kHz stereo, 192 kb/s |
| full FFmpeg decode | OK, no errors (qa/full-decode.log) |
| loudness | −15.0 LUFS integrated, LRA 2.4 LU, true peak −1.4 dBFS (spec −14…−16, TP ≤ −1) |
| narration ASR + timing (one pass, final MP4) | all 6 lines word-correct; spoken spans inside caption windows (qa/asr-narration.txt) |
| caption bounds (every captioned frame) | ink y 356–467 (spec 350–470), x 104–976 (margins ≥ 80) (qa/caption-bounds.txt) |
| top 0–300 px | paper + field dots only |
| contact sheets | qa/contact-sheet-full.png, qa/contact-sheet-boundaries.png (3/8/23/29 s + end) |
| render | 900 frames on 2s in ~70 s (riso engine + press asset reused from #01); mix < 10 s |

I cannot hear audio; intelligibility was checked by ASR on the final file plus loudness/peak meters and spectrum.

## Fixed during this batch
1. Frame 0 was nearly empty → the request plate is already sliding in at f0; the page feeds in by 2.5 s.
2. Loupe text clipped by the window → smaller type, larger riso window.
3. DATA lane looked empty → page, filed stamp and PDF shown inside it.
4. Summary tick overlapped its title → moved beside the SUMMARY tag ("sounds sure").
5. Caption-bounds tool counted the flying stamp (y 520–529 at 11.3–12.3 s) as caption ink → band limited to y ≤ 500;
   caption ink is 356–467; the stamp passes 50+ px below the captions.

## Remaining limits (honest)
- 10.5–14.8 s: the centre of the press is empty while the stamp/cable/lever act at the top and right (readable,
  but less dense than other beats).
- Bottom décor (press base, registration mark) sits in the overlay zone by design; no essential info there.
- Panel/label type is 16–22 px mono; readable on a phone but small.
- Prompt-injection risk is shown as a fictional, harmless example; no claim about any product's actual behaviour.
