# Early-session progress (archived)

This was context/05-progress.md from the first, unfinished 30 s campaign attempt (session of 2026-11-01). It was moved here unchanged on 2026-11-22 when local history was rebased onto the current remote branch, so the remote 05-progress.md stays authoritative. Status: source and narration only; no MP4 was rendered.

---

# Progress

## Verified facts (from assets/listing.json, hashes re-checked)
- Aarambh, package in.aarambh.app, Android, Lifestyle, Rated 3+, price 0 INR, author Tensorblue AI.
- Description: "Fund verified livelihood tools and follow their impact."
- icon.png sha256 bfd11449…2e37e and listing.json sha256 850735cd…a412293 match 03-assets.json.
- Icon palette sampled: green #05483A, cream #FCF6EE, gold #F0B344.
- Unknown: real app UI, verification process details, pricing, outcomes. Not claimed.

## Creative decisions
- Editorial paper cut-out + ink stickman hybrid; one tool (sewing machine) traced Need → Verified → Funded → Delivered → At work. See videos/aarambh/storyboard.md.
- Phone UI and checkpoint tracker are stylized illustration, not captured app screens.
- Narration: Kokoro-82M local TTS, voice af_heart, "Aarambh" phonemes overridden to ˈɑːɹʌmb (Whisper small.en with brand prompt transcribes it as "Aarambh").
- Music + SFX: original, synthesized in numpy (no samples).

## Milestones
1. [done] Context read in order; toolchain: Node 22, Remotion 4.0.539, ffmpeg 6.1.1, Python 3.13, kokoro-onnx 0.6.1, faster-whisper 1.2.1 (QA only).
2. [done] Narration generated: `python audio/tts.py <models> audio/narration af_heart 1.0` (models in session scratchpad, URLs + sha256 in tts.py).
3. [in progress] Remotion composition (project/src), synth soundtrack (audio/), render, QA.

## Verification results
- Narration ASR (Whisper small.en): all 7 lines transcribed verbatim (brand recognized with prompt).

## Unresolved / next
- Implement scenes, synth audio, render, inspect contact sheet and boundary frames, fix, write QA.md.
