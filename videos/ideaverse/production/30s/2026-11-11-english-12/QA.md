# QA — ideaverse-30s-english12-01.mp4 (English, batch 2026-11-11-english-12, 2026-11-11 feedback rules)
sha256 31b2a9f6a0140f93a386142cf2c3eaed8e6f0c367068d4f422680a669d878e96 · thumbnail `ideaverse-30s-english12-01-thumbnail.png`
(1080x1920 PNG, sha256 4e92a3d72008fce0652e3972e12c237b62af47fb8809be3c7ee16e179965713b) · evidence in `qa/` (regenerate: `ASRPY=<python with faster-whisper> ./qa.sh`).

## Technical
- 30.000 s · H.264 High yuv420p 1080x1920 30/1 · 900 frames (count_frames 900) · AAC-LC 48 kHz stereo 192 kb/s · faststart.
- Full FFmpeg decode: OK, no errors. Loudness −14.9 LUFS, true peak −1.8 dBFS, LRA 4.2 LU; music ducked under voice;
  every SFX sting sits in a pause between lines.

## Captions (new safe area)
- English only, ≤ 2 lines; pill x 100..900 / y 344..520, ink x 137..863 / y 372..497 → SPEC PASS (x 100..900, y 230..1500).
- Top 300 px: scene only (DOCKET antenna). Font 60 px except two longer captions (50 px, 54 px).
- Fix during review: "hang up and call back / on a number you already know." had shrunk to 48 px → split into two captions
  (60 px each) and frames 696–797 re-rendered.

## English audio ↔ captions (faster-whisper base.en on the final MP4)
- All seven lines MATCH ("codeword" normalised to "code word"); every recognised word inside its caption window.
- Limitation: I cannot listen. Narration clarity, caption sync and clipping were checked by ASR, loudness/peak measurement
  and the spectrum image only — not by ear. A human listen is recommended before publishing.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png, thumbnail)
- 0–2.9 hook: SAM + growing voice wave, "✓ familiar", NOT PROOF stamp on "proof"; 2.9–5.6 two-shot: Sam's call,
  "Need money, fast!" bubble, NEVER SAID + double take; SHORT CLIP → VOICE PATTERN; NEW WORDS → SOUNDS LIKE SAM;
  SOUND ✓ / WHAT SAM KNOWS ✕ + code word; phone: hang up → Contacts → saved number → "I'm fine — not me!" ✓; CTA.
- One idea per card with 1–3-word labels; the card behind the two-shot shows only "SAM ✓ familiar" so labels don't compete.
- Fixed before the full render: call bubble/stamp clipped at the frame edge → moved inward and resized; two-box close-up
  sat under the caption → camera re-framed lower.
- Known minor: on the two flips and at 5.6 s the card is blank for a few frames before the next label appears.
- Thumbnail: two-shot at 4.9 s + "THAT / VOICE / LIED." (180 px, LIED. in amber), words inside x 100..900; "LIED." overlaps
  DOCKET's left eye (deliberate overlap, readable).

## Preservation
- All earlier MP4s re-hashed unchanged (pilot-01, 15 s test, production-01..03, feedback-01, round02, hindi03, meme-01,
  hindi04, feedback05, english06..11).
