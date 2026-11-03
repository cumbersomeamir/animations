# QA — ideaverse-30s-meme-01.mp4 (Hindi, experimental meme)
File: `videos/ideaverse/production/30s/2026-11-03-meme-01/ideaverse-30s-meme-01.mp4` · sha256 `669848f7943ba4e2bbff236b16dee7969b556ec0fe5abda27c270d802b4459c7` · 14.2 MB

## Format (qa/ffprobe.json, qa/decoded-video-frames.txt, qa/full-decode.log)
- 30.000 s (container, video, audio). H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames (decoded count 900).
- AAC-LC 48 kHz stereo 192 kb/s. Full FFmpeg decode: no errors.

## Loudness (qa/loudness.txt)
- Integrated −14.9 LUFS, peak −3.5 dBFS. Speech ≈ −14…−15 dBFS RMS before mastering; music-only tail −38.7 dBFS;
  freeze stings sit under the voice (−25 dBFS around the deadpan freeze). Voice-forward, no loops.

## Hindi narration / caption timing (qa/asr-narration.txt — faster-whisper medium, language hi, final MP4)
- All 9 lines recognised. Spelling-normalised CER: m1 0.05, m2 0.12, m3 0.00, m4 0.50*, m5 0.20, m6 0.09, m7 0.19, m8 0.08, m9 0.04.
  *m4 is a measurement artifact: the window's 0.45 s tail catches m5's first word ("और"), and Whisper abbreviates लीटर as "l";
  the heard words "और 20 [लीटर] तेल" are correct.
- Fixed from the first pass: "तीन-तीन तरबूज़" (heard "तिन तिन तार्बूस", CER 0.55) → "और तीन तरबूज़!" (heard "और तीन तर्बूस").
- Remaining soft spots: तरबूज़ → "तर्बूस" (z softened), छह सौ → "चेहसाओ" (run together; caption shows ₹600), मोहल्ला → "मुहल्ला" (a valid spelling).
- Word-in-caption check: every heard word lies inside a caption that shows it, apart from these two artifacts: the abbreviated "l" and the run-together "चेहसाओ".
  Numbers are spoken as words and captioned as digits (50, 20, 2, 3, ₹600); the checker maps both forms.
- I cannot hear audio: intelligibility is judged by multilingual ASR plus phoneme review. Kokoro Hindi voices are graded C by
  their author; a native-speaker listen is recommended before posting.

## Captions / glyphs / safe areas (qa/caption-bounds.txt, qa/caption-geometry.json, qa/top-band-strips.png)
- Exact renderer geometry incl. outline stroke: x 92..988, y 344..514; ink x 106..971, y 349..508 — SPEC PASS.
  9 captions, ≤ 2 lines, 56–62 px Noto Sans Devanagari 800 with black outline; never overlapping.
- Top band y 0..300: no caption text. Falling grocery props (with labels) pass through it for < 0.3 s while dropping in.

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png)
- Mute test: hook caption + typing → endless reply + groceries rain → freeze "पूरा मोहल्ला" → 50 kg / oil cans / melons →
  clipboard knocked → deadpan freeze → vague prompt ringed + 4 questions → pile flies out → constraint chips → modest list
  ≈ ₹560 ("कीमतें सिर्फ़ उदाहरण") → price tags ✓ → CTA with icon. Each beat reads from captions + props.
- Fixes made before the full render: cart wire mesh hid the pile (shallower, sparser basket); phone and clipboard blocked the
  cart (hands swapped, clipboard held low on the cart side so the melon can knock it); punchline shots widened; result shot reframed.

## Accepted minor issues
- The modest items are small in the 21.6–23.4 s cart shot; the ✓ price tags carry the beat.
- Freeze-frame entry flash is bright for 0.12 s (intentional meme punch).

## Preservation
Earlier MP4 sha256 unchanged (production-01 c5ababf6…, 02 8b301679…, 03 fc6836f0…, feedback-01 3806e0ea…, round02-01 3bc06d64…,
hindi03-01 97aef888…, pilot-01 2886236d…, 15 s test f10ebf29…).
