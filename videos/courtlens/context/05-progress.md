# Progress

Rounds are listed newest first. Earlier rounds are preserved verbatim from previous Courtlens chats.
Context files: 06-style-test.md + 07-test-progress.md (2026-11-01 15 s style test), 08-series-format.md (durable
series format from 2026-11-02, newest direction), episodes/ (per-episode briefs; 2026-11-03 hindi-03 is Hindi).

## Round 2026-11-04 (hindi-04): Hindi episode 04, shop bill says "रिफ़ंड नहीं" on a defective product

### Status
- No generation active at start (clean tree, no jobs, remote not ahead). Caches intact.
- DELIVERED: `production/30s/2026-11-04-hindi-04/courtlens-30s-hindi04-01.mp4`
  (sha256 3e2b194f1725f8c0165d1ce7ca4ebc3c3f92cfcfac9bcd1860bf203054ac4f57). Earlier MP4s untouched.
- Episode record (topic-overlap decision vs episode 01, Hindi script, citations, reusable Hindi adjustments):
  `context/episodes/2026-11-04-hindi-bill-no-refund.md`.

### Verified facts (details: production/30s/2026-11-04-hindi-04/notes/LEGAL-SOURCES.md)
- Consumer Protection Act 2019 (official DoCA PDF):
  - s.2(47)(viii): refusing to take back defective goods and refund, within the bill's stated period or else 30
    days, is an unfair trade practice
  - s.2(10) defect
  - s.35 complaint
  - s.39(1)(a)–(c) repair, replacement, refund
- Change of mind: no statutory right; shop policy decides.
- NCH contact re-checked 2026-11-04 (1915 / 1800-11-4000).
- DoCA (consumeraffairs.gov.in) also hosts the official E-Commerce Rules 2020 and E-Commerce Amendment Rules 2026 PDFs.
  These could close episode-01 checkpoints A/B if a revision is ever requested (not done; out of scope).

### Creative decisions
- Topic kept despite overlap with episode 01: different setting (physical shop vs online), different provision
  (CPA s.2(47)(viii) vs E-Commerce Rules), new lesson (bill period / 30 days; bill as evidence), Hindi audience.
- Same accepted engine, Hindi voice, font, caption band and pacing as hindi-03. Changes:
  - performer: a leaking kettle
  - shop-bill card with the "रिफ़ंड नहीं · बिका माल वापस नहीं होगा" clause
  - shopkeeper's sign
  - CPA rule card with two time-window chips
  - defective vs change-of-mind split, with the shop's sign as a sticker on the change-of-mind side
  - bill + leak photo in the envelope, then the CTA

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-04-hindi-04/src
$S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
$S/tts/venv/bin/python -I align.py ../audio/lines narration.json $S/asr
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build4 ./build.sh
$S/tts/venv/bin/python qa.py ../courtlens-30s-hindi04-01.mp4 timeline.json ../audio/lines ../qa
$S/tts/venv/bin/python -I asr_check.py ../courtlens-30s-hindi04-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean; −15.8 LUFS / −2.4 dBTP.
- Narration 7/7 at +3 ms; CTA final 3.25 s; y<300 clear; captions ≤2 lines in y 340–520.
- Hindi ASR on the final mix: CER 0.063, every word recognised, all inside caption windows.
- One full render. Two wording defects were fixed before it (see `qa/QA.md`).

### Unresolved / checkpoints
- ASR-only listening: no direct audio listening in this environment; a native-speaker listen is recommended.
- Ernakulam order (secondary) and e-Daakhil URL not used on screen; see LEGAL-SOURCES.md.
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Await review of courtlens-30s-hindi04-01.mp4. No further episode or automation unless asked.

## Round 2026-11-03 (hindi-03): Hindi episode 03, recording a call you are part of

### Status
- No generation was active at start (clean tree, no jobs, remote not ahead).
- The session's worker restarted mid-round and the user's usage limit was hit once. All state was intact in the repo
  and scratchpad (Hindi lines, word times, cached models). Work resumed without duplicate generation.
- DELIVERED: `production/30s/2026-11-03-hindi-03/courtlens-30s-hindi03-01.mp4`
  (sha256 5035fbf9220c0246d9fbe06456eab891cce0ea8accceeed224ffac39f2949e37). Earlier MP4s untouched.
- Episode record (topic check, Hindi script, citations, user corrections): `context/episodes/2026-11-03-hindi-call-recording.md`.

### Verified facts (details: production/30s/2026-11-03-hindi-03/notes/LEGAL-SOURCES.md)
- Vibhor Garg v. Neha, 2025 INSC 829 (SC, 14 Jul 2025), para 9.5, official PDF: three-fold test (relevance,
  identification, accuracy); recording without consent or knowledge doesn't bar admissibility.
- R.M. Malkani (1973), official PDF.
- R. Rajagopal (1994) para 26(1), publishing private matters without consent can bring damages (via Indian Kanoon).
- Narrowed claim: no blanket legal/illegal answer. Evidence and posting are treated separately.

### Creative decisions
- **Language:** all narration and captions in Hindi (Devanagari); on-screen labels Hindi; "Courtlens" in Latin only on
  the icon CTA card.
- **Voice:** Kokoro v1.0 native Hindi voices hf_alpha 0.7 + hm_psi 0.3 (keeps the accepted 0.7/0.3 female-lead
  character), lang hi, speed 1.05 (Hindi pace; tested for clarity). English voices not used for Hindi.
- **Glyphs:** Noto Sans Devanagari 5.3.0 (OFL, npm @fontsource) as Devanagari fallback; no letter-spacing on Hindi.
- **Engine:** the accepted engine reused via the round-02 copy. Changes:
  - phone performer
  - call card with the landlord's quote
  - landlord's sign
  - SC rule card with three chips
  - evidence vs posting split
  - audio file + call log in the envelope
  - Hindi action card and CTA
- **New tools:** `src/align.py` (word times + ASR per line) and `src/asr_check.py` (ASR on the final mix + caption alignment).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-03-hindi-03/src
$S/tts/venv/bin/pip install faster-whisper            # local ASR, model 'medium' cached in $S/asr
$S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
$S/tts/venv/bin/python -I align.py ../audio/lines narration.json $S/asr
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build3 ./build.sh          # SKIP_FRAMES=1 re-muxes audio only
$S/tts/venv/bin/python qa.py ../courtlens-30s-hindi03-01.mp4 timeline.json ../audio/lines ../qa
$S/tts/venv/bin/python -I asr_check.py ../courtlens-30s-hindi03-01.mp4 narration.json timeline.json $S/asr ../qa/asr_check.json
```

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz; full decode clean; −15.9 LUFS / −2.5 dBTP.
- Narration 7/7 at +3 ms; CTA final 3.33 s; y<300 clear; captions ≤2 lines in y 340–520.
- Hindi ASR on the final mix: CER 0.097, every word recognised, all words inside caption windows. Glyphs verified at
  full resolution. Six defects fixed (see `qa/QA.md`).

### Unresolved / checkpoints
- A: R. Rajagopal official PDF (digiscr.sci.gov.in) returned 502; text read via Indian Kanoon.
- B: BSA 2023 s.63 (electronic records) not verified from India Code; not used in the video.
- The ASR proxy can't judge accent naturalness; a native-speaker listen is recommended before posting.
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Await review of courtlens-30s-hindi03-01.mp4. No further episode or automation unless asked.

## Round 2026-11-03 (round-02): "Is this legal in India?" episode 02, MRP on a packaged water bottle

### Status
- No generation was active at start (clean tree, no running jobs, remote not ahead); nothing to checkpoint.
- DELIVERED: `production/30s/2026-11-03-round-02/courtlens-30s-round02-01.mp4`
  (sha256 f12d786e3a8824a87d788891dee6e0e0a697b5ed4f0c47d7f860fb59583291bb). Earlier MP4s untouched.
- Episode record (topic-history check, script, citations, sheet feedback applied):
  `context/episodes/2026-11-03-mrp-packaged-water.md`.

### Verified facts (details: production/30s/2026-11-03-round-02/notes/LEGAL-SOURCES.md)
- Legal Metrology (Packaged Commodities) Rules, 2011:
  - Rule 18(2), read in the Gazette scan from consumeraffairs.gov.in.
  - Rule 2(m), MRP inclusive of all taxes (G.S.R. 629(E), 2017).
  - Rule 6(1)(e), MRP must be printed (as amended 2017/2021).
  - No amendment through G.S.R. 826(E) of 21 Sep 2026 changes these rules.
- Supreme Court, CA 21790/2017, 12 Dec 2017, para 17 (hotels/restaurants: a different case). NCH contact page:
  1915 / 1800-11-4000, WhatsApp 8800001915.
- consumeraffairs.gov.in (new DoCA domain) and api.sci.gov.in are reachable from the container. `*.nic.in` and the
  NCH FAQ page are not.

### Creative decisions (sheet feedback: Satisfied = Yes)
- Reused the accepted feedback-01 renderer, palette, captions, voice, pacing, motion and CTA unchanged. Copied
  `src/` and swapped only episode performers and copy. `08-series-format.md` is not rewritten.
- Script: 74 words, 27.01 s speech; "1 9 1 5" is spelled as digits for correct reading.
- Audio: same pad voicings and SFX palette; chord changes now follow the episode's scene events (`CHORD_EVENTS`).

### Exact commands
```bash
cd videos/courtlens/production/30s/2026-11-03-round-02/src
$S/tts/venv/bin/python tts.py --model-dir $S/tts --lines narration.json --out ../audio/lines
SKIP_TTS=1 PY=$S/tts/venv/bin/python WORK=$S/build2 ./build.sh          # SKIP_FRAMES=1 re-muxes audio only
$S/tts/venv/bin/python qa.py ../courtlens-30s-round02-01.mp4 timeline.json ../audio/lines ../qa
```

### Verification
- 30.000000 s; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; full decode clean.
- −15.9 LUFS / −2.0 dBTP; narration 7/7 lines at +3 ms; CTA final 3.38 s; y<300 clear; captions ≤2 lines in y 340–520.
- Fixed: bottle scale (stills re-checked); true peak −1.2 → −2.0 dBTP (audio re-mux). See `qa/QA.md`.

### Unresolved / checkpoints
- A: NCH Legal Metrology FAQ wording seen only via search snippet (page returns 403 to the container).
- B: no national circular specifically on "cooling charges"; "chilled or not" rests on the Rule 18(2) text.
- Episode-01 checkpoint B can now be re-checked: DoCA hosts the E-Commerce Amendment Rules 2026 PDF on
  consumeraffairs.gov.in (not done in this round; outside its scope).
- Desktop/video-review is not reachable from this cloud session; the MP4 is attached in chat and pushed.

### Next
Await review of courtlens-30s-round02-01.mp4. No further episode or automation unless asked.

## Round 2026-11-02 (feedback round): "Is this legal in India?" no refunds vs defective item

### Verified facts
- App identity and branch: Courtlens, courtlens.tensorblue.app, branch `claude-video/courtlens`, account info@tensorblue.com.
- Product evidence (`assets/listing.json`): "Court records, case tracking and an AI assistant for advocates."
  Free, Android, rated 12+. No other product claims are used.
- Brand palette sampled from `assets/icon.png` (2026-11-02): navy #02193B, cyan accent #12AAD3, gold #D7A351,
  ivory #F0E9DD (details in `08-series-format.md` §3).
- Legal research for the 2026-11-02 episode: see
  `production/30s/2026-11-02-feedback-round/notes/LEGAL-SOURCES.md`. Key provisions: E-Commerce Rules 2020
  Rule 6(3) and Rule 7(4) (Gazette text read); 2026 amendment (G.S.R. 789(E)) in force 1 Jan 2027, refund duties reportedly unchanged.

### Creative decisions
- 2026-11-02: durable series format, style recipe "Tiny Clause, Big Consequence", approved voice, palette and
  safe-caption rules stored in `context/08-series-format.md`; episode brief in
  `context/episodes/2026-11-02-no-refunds-defective.md`. 02/04 marked as superseded where they conflict.
- Narration: user draft used verbatim (fits 30 s: 26.75 s speech). The longer "can't refuse to take back or refund"
  wording would overflow 30 s, so that exact rule text is shown on the rule card instead.
- Layout: captions y 340–520; series chip y≈560; stage y≈560–1460; nothing enters the caption band or y<300,
  including mid-transition (banner exits sideways; mug emerges from behind the order card; action card rises from below).
- Rendering: original Canvas 2D scene (`src/scene.js`) drawn in pre-installed headless Chromium via Playwright,
  frame-exact (t = frame/30), encoded with ffmpeg. No Blender, no paid API.
- Audio: Kokoro v1.0 ONNX, af_bella 0.7 + am_puck 0.3, en-us, speed 0.98. Original synthesized pad + SFX, no loops,
  music ducked about 15 dB under voice, final about −16 LUFS / ≤ −1.5 dBTP.

### Completed (2026-11-02 feedback round)
- Episode "Can an online seller use 'NO REFUNDS' to refuse a defective item?" (INDIA): ONE new English 30 s video.
- Output: `videos/courtlens/production/30s/2026-11-02-feedback-round/courtlens-30s-feedback-01.mp4`
- Sources: `.../src/` (scene.js, index.html, render.cjs, timeline.json, narration.json, tts.py, audio_mix.py, build.sh, qa.py, fonts/, icon.png)
- Narration stems: `.../audio/lines/l1..l7.wav` + `line_durations.json`
- Notes: `.../notes/LEGAL-SOURCES.md`, `PUBLISHING.md`, `STORYBOARD.md`; QA: `.../qa/` (QA.md, qa_report.json, sheets)

### Exact commands
```bash
# one-time: TTS runtime (scratch venv) + Kokoro v1.0 model files
python3 -m venv $S/tts/venv && $S/tts/venv/bin/pip install kokoro-onnx soundfile
curl -sSL -o $S/tts/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sSL -o $S/tts/voices-v1.0.bin  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
# sha256: kokoro-v1.0.onnx 7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5
#         voices-v1.0.bin  bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d
# full build (TTS → mix → loudness → 900 frames → H.264/AAC)
cd videos/courtlens/production/30s/2026-11-02-feedback-round/src
KOKORO_DIR=$S/tts PY=$S/tts/venv/bin/python WORK=$S/build ./build.sh      # SKIP_TTS=1 reuses audio/lines
# stills for inspection
node render.cjs stills $S/stills 0,2.5,6.1,13.35,15.5,22,26.6,29.9
# QA
$S/tts/venv/bin/python qa.py ../courtlens-30s-feedback-01.mp4 timeline.json ../audio/lines ../qa
```

### Verification (final render, 2026-11-02)
- `courtlens-30s-feedback-01.mp4` sha256 8df8a15e524a71b22a7c648948e428f299e2525710b62558b108f590f42bad08, 18.6 MB.
- 30.000000 s format/video/audio; H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo.
- Full FFmpeg decode: exit 0, no errors. Loudness −15.9 LUFS, true peak −2.0 dBFS.
- Narration: all 7 lines measured at planned start +3 ms (cross-correlation); CTA occupies final 3.38 s.
- y<300 clear on 180 sampled frames; captions ≤2 lines, non-overlapping, in y 340–520.
- Visual review of the contact sheet, transition frames and targeted stills: 8 defects found and fixed, then re-rendered
  (list in `qa/QA.md`). Render time is about 9 min for 900 frames on 4 workers.

### Unresolved / checkpoints
- Carried over from the 2026-11-01 round (not part of this request, left untouched): the earlier 30 s film's QA.md is still marked pending below.
- A: `*.nic.in` (Department of Consumer Affairs, India Code) and eGazette were unreachable from the build container;
  the E-Commerce Rules text was read from the Gazette PDF reproduced by LiveLaw. Re-check against the DoCA copy.
- B: 2026 Amendment Rules (G.S.R. 789(E)) official Gazette text not read directly; PIB + two clause-by-clause analyses
  say 6(3)/7(4) are untouched. Re-confirm before/after 1 Jan 2027.
- C: CPA 2019 s.2(47)(viii) read via Indian Kanoon only (not used on screen).
- The Meshline/Recall cached voice files were not present in this fresh container (and other app branches are off-limits);
  identical public Kokoro v1.0 files were downloaded with the user-specified blend parameters.
- The user's local Desktop/video-review folder is not reachable from this cloud session; the finished MP4 is
  delivered as a Claude attachment and pushed to the branch.

### Next
Await user review of courtlens-30s-feedback-01.mp4. Do not start another episode or automation unless asked.

## Round 2026-11-01: Courtlens 30 s production video (preserved from the earlier chat)

### Verified facts (from assets/listing.json + icon.png only)
- Listing line: "Court records, case tracking and an AI assistant for advocates." Android, Business, rated 12+, author Tensorblue AI, Play offer price 0 INR.
- Icon: navy tile, ivory courthouse, gold disc, cyan chat bubble with gold sparkle. Hashes match 03-assets.json.
- Unknowns kept unknown: pricing beyond listing, metrics, endorsements, real UI screens (none approved → all UI drawn as labelled illustration).

### Creative decisions
- Editorial paper-cutout world + original stick-figure advocate (black coat, white bands). Story: file slam → paper mountain collapses → paper maze → Courtlens lens collects walls into the phone → cards become a case trail → AI assistant answer verified against an official record with a magnifier → navy end card + "Explore on Google Play".
- Palette from icon (navy/ivory/gold/cyan) on warm paper; Fraunces + Inter (OFL, pinned via npm @fontsource).
- Narration: local Kokoro-82M v1.0 ONNX (Apache-2.0), voice af_heart; "Courtlens" spoken via "Court lens" spelling. Music + SFX synthesised in numpy (original).
- Storyboard: docs/storyboard.md. SFX cue sheet exported from the same timing constants as the animation (src/scenes.js → build/cues.json).

### Status (2026-11-01)
- RENDERED: output/courtlens-30s.mp4 — H.264 1080x1920 30fps 900 frames, AAC 48 kHz stereo, 30.000 s, loudnorm -14 LUFS; full ffmpeg decode OK.
- Narration ASR check (faster-whisper base.en): all 7 lines recognised (sim 0.80–1.00; lower scores are only "Court Lens" word split).
- Mix: VO 6.4–10.2 dB above music+SFX bed per line after compression/ducking.
- QA PENDING (paused when the 15 s diagram-animation test was requested): full post-mux contact sheet, scene-boundary frame review of the final encode, QA.md write-up.

### Exact commands (from videos/courtlens/project)
- `python3 -m venv .venv && .venv/bin/pip install kokoro-onnx==0.6.1 soundfile faster-whisper==1.2.1 scipy==1.17.0`; `npm ci`
- `./tools/fetch_models.sh` (sha256-verified HuggingFace download)
- `.venv/bin/python audio/narration.py && .venv/bin/python audio/asr_check.py && .venv/bin/python audio/captions.py`
- `node src/render.js cues build/cues.json && .venv/bin/python audio/score.py`
- `node src/render.js video build/video_noaudio.mp4`
- `ffmpeg -i build/video_noaudio.mp4 -i build/audio/mix.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -shortest -movflags +faststart ../output/courtlens-30s.mp4`

### Next
- Finish 30 s QA.md after the 15 s test is delivered.
- 15 s diagram-animation style test (2026-11-01): see 07-test-progress.md.
