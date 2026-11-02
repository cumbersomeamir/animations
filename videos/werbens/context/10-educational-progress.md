# 10 — Educational pilot 01: progress log

App Werbens · com.werbens.app · repo cumbersomeamir/animations · branch `claude-video/werbens` · workspace `videos/werbens/`.
Session: Claude Code, 2026-11-02 ("Werbens — Educational Pilot 01"). Read on resume: CLAUDE.md, START_HERE.md, 00–10, this file.

## Checkpoint of earlier work (done first, commit 8ce6f62)
- 30 s promo (05): UNFINISHED, no MP4; preserved as-is. 15 s Three.js style test (06/07): UNFINISHED / NOT DELIVERED
  (render was in progress in a reclaimed container; no MP4 ever committed); preserved as-is. Neither resumed, trimmed or relabelled.

## Verified facts (evidence)
- Listing (assets/listing.json): "Discover creators and manage brand campaigns, briefs and conversations."; Android, Business,
  free, Tensorblue AI. Icon palette: violet #6234FB, lavender #CCC0F7/#C6BAF6, pale #F0EAFC, white #FEFEFD.
- Research (accessed 2026-11-02, see education/pilot-01/sources.md): Deliza & MacFie 1996 (Crossref abstract read);
  Piqueras-Fiszman & Spence 2012 (PubMed abstract read) and 2015 (Crossref + WUR summary); Becker et al. 2011 (Crossref; findings
  via secondary summaries only — flagged); Krishna 2012 (background). No numbers used on screen.
- User's Instagram references: NOT viewed (HTTP 429) — only the user's written observations were used.
- Narration intelligibility (Whisper base.en on each clean TTS line): L1 6/6, L2 8/8, L3 6/6, L4 2/2, L5 8/8 words.

## Creative choices (not facts)
- Concept: packaging = a cue that sets an expectation, which can tilt how the same product is judged → "make the box promise
  what's really inside". Fictional plain vs luxe cookie boxes, identical cookies by construction, X-ray lamp reveal.
- Cast: Pip (host/ad director, speaks) + Quibble (sceptical customer, silent) — original; bible + model sheet in
  education/pilot-01/character/. Voice: Kokoro-82M blend af_bella 0.7 + af_heart 0.3, speed 0.94 (Apache-2.0, local).
- Five shots with motivated cuts (wide two-shot → high medium → close medium → whip to high wide → medium on host).
- Captions: word-timed (Whisper word times piecewise-anchored to measured pauses), keyword highlights, dark pill over the table
  skirt (y 1300–1520). Note "Illustrative demo · not experiment data · effects vary" 5.95–11.55 s. Small Werbens signature +
  research line in the last 1.6 s. Chip "Marketing craft · 01" 0–2.5 s.
- Score: original 96 BPM marimba/pizzicato groove (Dm7–Bbmaj7–Gm7–A7), stops on the lamp click, resolves to F major for the
  takeaway; 37 synthesised SFX cues each tied to a visible action (identical crunch for both cookies on purpose).

## Skill / technique provenance
- `.claude/skills/animation-direction/SKILL.md` (local, read): applied storyboard-first with timed action verbs, reusable
  primitives inside the app workspace, character rig with anticipation → action → impact → recovery (drops, squash, strain,
  bite, yank), props explaining cause and effect, full render + boundary frames + contact sheet + ffprobe + full decode.
  Adaptation: the skill's stickman/editorial look is replaced by dimensional toy-like 3D characters (brief asks for a 3D
  backstage studio; browser Three.js allowed) — the motion principles carry over, the 2D drawing style does not.
- Three.js workflow carried over from this app's own 15 s test (07): deterministic `frame(t)`, `?t=` freeze harness,
  headless Chromium (SwiftShader) capture, console/HTTP error capture, resource disposal. three@0.180.0 served from the
  pinned npm package via importmap (no CDN). No bloom/post-processing this time (glows are additive sprites) to keep
  SwiftShader at ≈2.4 s/frame.

## Build commands (exact)
```
cd videos/werbens/education/pilot-01
npm install                     # three 0.180.0, kokoro-js 1.2.1, @huggingface/transformers 3.7.6 (lockfile committed)
node src/tts.mjs                # 5 lines, 31 s on CPU
node src/words.mjs              # writes src/words.json (committed)
node src/audio.mjs              # build/audio/mix.wav: -14.0 LUFS, -1.4 dBTP
node src/render.mjs --video     # build/video.mp4, 450 frames
ffmpeg -y -i build/video.mp4 -i build/audio/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 -t 15 -movflags +faststart werbens-education-pilot-01.mp4
bash qa.sh && node src/asr_mix.mjs
node src/render.mjs --sheet && bash character/make-sheet.sh
```

## Render / QA state
- Iteration stills (5 passes) fixed: cropped host in S1/S4, lifted box hiding Quibble's face (S2), off-screen tags, action
  under captions (S3), hand covering Pip's face (S5), lids occluding faces (luxe lid now pops off; plain lid hinged sideways),
  X-ray beam washing Quibble (elliptical beam), "=" badge over Quibble's mouth, check mark off-screen, weak frame 0 (box now
  already falling, question caption + chip on frame 0). Model sheet: fixed a visibility bug (22/26 empty panels) and labels.
- Full render pass 1 (20.6 min, 2.7 s/frame): technically clean; visual review found note-over-stripe legibility, unclear
  S1 point, small X-ray reveal with "=" over the cookies, beam washing Quibble → fixed.
- Full render pass 2 (19.2 min) = FINAL. Verified: h264 High 1080×1920 yuv420p 30/1, 450 frames, video/audio/format 15.000000 s,
  AAC-LC 48 kHz stereo, full decode 0 errors, −14.0 LUFS / −1.0 dBTP / LRA 2.1, ASR on final mix 30/30 words, no page errors.
  sha256 d40419b7f8a220a09f77447e09b0bd6955e6c7e328d58d6dee2eb8912ca7de0b. Details: education/pilot-01/QA.md.
- Evidence: qa/contact-sheet.png (every 0.5 s), qa/boundary-sheet.png (cut frames), qa/frames/*.jpg, qa/ffprobe.json,
  qa/loudness.txt, qa/astats.txt, qa/audio-spectrogram.png, qa/asr-mix.json; character/model-sheet.png.

## Unresolved / open
- None blocking. Limitations listed in QA.md §5 (synthetic voice, bright beam on Quibble, S1 point reads as hand-over-box,
  Becker 2011 secondary-sourced, Instagram refs not viewable).

## Next action
Pilot 01 delivered. Next: wait for user feedback on the pilot; if approved, pick episode 2 from 08's list, research + claim map
first, reuse `education/pilot-01/src/rig` + pipeline in a new `education/episode-02/` folder (do not modify pilot 01).
