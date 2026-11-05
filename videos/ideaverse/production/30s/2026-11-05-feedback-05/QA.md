# QA — ideaverse-30s-feedback05-01.mp4 (Hindi)
File: `videos/ideaverse/production/30s/2026-11-05-feedback-05/ideaverse-30s-feedback05-01.mp4` · sha256 `ea5687f21bac7bbc958eab99c36223759e301ddeb62fc0a640effd7287877b09` · 12.9 MB

## Format (qa/ffprobe.json, qa/decoded-video-frames.txt, qa/full-decode.log)
- 30.000 s (container, video, audio). H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames (decoded 900). AAC-LC 48 kHz stereo.
- Full FFmpeg decode: no errors.

## Loudness (qa/loudness.txt)
- Integrated −14.9 LUFS, peak −2.9 dBFS. Speech ≈ −14…−16 dBFS RMS vs music-only gap −34 dBFS / tail −38 dBFS before mastering.

## Hindi narration / caption timing (qa/asr-narration.txt — faster-whisper medium, language hi, final MP4)
- All 6 lines recognised; spelling-normalised CER 0.04–0.24 (h2 highest: नोटिस → "नोतिस", ऐप → "एप"; also आख़िरी → "आहेरी").
- Fixed: caption 5 ended at 17.1 s while "अंदाज़ा मत लगाओ" was spoken 17.14–17.9 s → caption now 14.5–17.95 s.
- Word-in-caption check: every heard word is inside its caption except one ASR artifact ("साफ़ न" heard as "साफ़ नहीं" at 15.5 s).
- CTA "आइडियावर्स ऐप डाउनलोड कीजिए" spoken 26.30–28.55 s; caption 26.0–30 s with the icon.
- **Limitation:** I cannot listen to audio; intelligibility is judged by multilingual ASR + phoneme review only. Kokoro's Hindi
  voices are graded C by their author; a native-speaker listen is recommended before posting.

## Captions / glyphs / safe areas (qa/caption-bounds.txt, qa/caption-geometry.json, qa/top-band-strips.png)
- Exact renderer geometry: pill x 127..953, y 344..520; ink x 163..914, y 362..502 — SPEC PASS. 9 captions, ≤ 2 lines, 60 px.
- Devanagari (Noto Sans Devanagari): nukta (फ़ीस, तारीख़, ज़रूरी, अंदाज़ा), chandrabindu (पहुँचें, लाएँ) render correctly; no tofu.
- Top band y 0..300: no text (antenna, easel top edge only).

## Picture review (qa/contact-sheet-full.png, qa/contact-sheet-transitions.png)
- Accepted DOCKET lesson style. Hook moves from frame 0 (notice scrolls, buried deadline highlights at 2.0 s, stamp at 2.95 s).
- 9 setups each acting on its line: easel hook · DOCKET reaction · paste · typing wide · instruction + chips · card flip to
  "AI का जवाब" with quoted rows + "पता नहीं" row · flip back with badges 1·2·3 + "?" + "स्कूल से पूछें" · two-shot point/nod · CTA.
- Fixed before the full render: notice's first body line half-clipped under the header; the vague line's highlight covered
  the previous sentence (lines re-broken).

## Preservation
Earlier MP4 sha256 unchanged (production-01 c5ababf6…, 02 8b301679…, 03 fc6836f0…, feedback-01 3806e0ea…, round02-01 3bc06d64…,
hindi03-01 97aef888…, meme-01 669848f7…, hindi04-01 718b32cb…, pilot-01 2886236d…, 15 s test f10ebf29…).
