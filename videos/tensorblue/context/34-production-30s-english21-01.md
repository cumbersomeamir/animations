# 34 — Batch `2026-11-18-english-21` (batch21) · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-18-english-21/tensorblue-30s-english21-01.mp4`, thumbnail `…/tensorblue-30s-english21-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-18-english-21/production-notes.md`. All earlier MP4s (including batch20 / english-20, pushed first as `b9b2699`) are preserved unchanged.

## Brief (user-authorised, 18 Nov 2026, batch21; app-isolated continuation, see `35-continuation-2026-11-18.md`)
- **Topic:** why a progress bar races to 99 percent and then gets stuck.
  - Real software stages and inaccurate estimates.
  - A playful 3D parcel pipeline showing bytes transferred versus the work that follows.
  - A useful app-development insight, with the exact tensorblue.com colours and no decorative lines.
- **Order:** batch20 had no checkpointed work and was produced, verified, pushed and attached first. This episode was made once, after it.
- **History check:** not a duplicate. No earlier episode covers progress bars, installers or time estimates.
  - The nearest are english-19 (a video player's buffer) and english-15 ("it said saved": write-ahead logs). Both have different mechanisms.
- **Feedback applied (2026-11-18, this app only):** "make it about app development or something cool that some app did… motion graphics lack 3d depth and are not fun".
  - **Content:** a practical app-builder rule from Microsoft's own design guide, proven on a real update run.
  - **Depth:** the `toy3d.mjs` look (thick lit toys, fog, foreground phone). The conveyor runs straight into depth, and the bar stands as a scoreboard at the far end, so every shot down the belt keeps it at the top of the frame.
  - **Fun:**
    - byte cubes stream out of the DOWNLOAD hopper up into the bar, which races;
    - the parcel is scanned in a glowing VERIFY gate, then its lid flips and file cubes burst out;
    - the cubes hop one by one into the phone while the bar sits at 99 % and jiggles impatiently;
    - a green 100 % badge stamps down only when the last cube lands;
    - a bouncing quote card.
- **Standing rules kept:** frame zero (no fade or logo intro; 2–5 truthful words; works as the thumbnail; hook audio at once), Theory of Marketing pacing, one idea at a time, captions x 100–900 (house band y 340–520), and honest QA.
- **Language and voice:** English only. Approved Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, narration from 0.10 s, and the accepted CTA. No Hindi.
- **Colours** (tensorblue.com re-checked 2026-11-18):
  - the palette, plus the site's own tokens: **amber-400 `#FFB900`** (VERIFY), **cyan-400 `#00D3F2`** (UNPACK, the EVERY STAGE label), **green-400 `#05DF72`** (INSTALL, done, 100 %), **red-500 `#FB2C36`** (stuck at 99 %);
  - the DOWNLOAD stage and the bytes bar are brand blue `#3B82F6`;
  - the phone's update screen is our own generic drawing.

## The real test (`src/demo/stages_demo.py`; Python 3 standard library; real work on this machine)
**Package:** a made-up update zip of **37,697,433 bytes**: one 18 MB asset plus 2,400 small files, **2,401 files** in all (seed 20261118).

**Four real stages, one after another:**
1. **DOWNLOAD** over HTTP from a local server, throttled to **100 Mb/s** so it behaves like a fast home link, not loopback;
2. **VERIFY:** the SHA-256 of every byte, compared with the published hash;
3. **UNPACK:** unzip every file;
4. **INSTALL:** copy each file into the app folder and **fsync** it, then write a manifest.

**Two bars watch the same run, sampled every 0.05 s:**
- **bytes-only:** downloaded bytes ÷ package bytes, never shown as 100 until everything is done (Microsoft's rule);
- **staged:** each stage owns a share of one bar, sized from a first calibration run's stage times (Microsoft: "share a portion of the progress"; Apple Progress: sub-operations get a portion of the parent's pending units).

Run 1 calibrates; run 2 is reported and shown (`demo/out/stages-demo.json`):

| | value |
|---|---|
| run 2 stage times | download **3.017 s**, verify 0.043 s, unpack 0.319 s, install **1.430 s**; total **4.808 s**; hash OK |
| shares from run 1 | download 69.2 %, verify 0.9 %, unpack 2.8 %, install 27.2 % |
| bytes-only bar | reached **99 % at 3.0 s**, then **stuck 1.8 s**, **37 %** of the wait; at worst **36 points** away from the time actually elapsed |
| staged bar | at worst **6 points** away from the time actually elapsed |

**Honest notes:**
- Verification was fast here (SHA-256 of 38 MB took 0.04 s). On this machine the long tail was **installing**: 2,401 files, each fsynced.
- The script therefore says only that the bar ignored "verifies… unpacks… installs". It never claims that verification is the slow part.
- Timings vary by machine; unpack took 0.12 s in run 1 and 0.32 s in run 2.
- The renderer stops if the headline results change (99 % at ≈ 3.0 s, stuck 1.6–2.0 s, ≥ 2,000 files, staged gap < bytes gap).

## Final script (as spoken; 80 words, 29.55 s incl. CTA; first word at 0.10 s)
| id | time (s) | line |
|---|---|---|
| L1 | 0.10–3.33 | It raced to ninety-nine percent. Now it's stuck. Why? |
| L2 | 3.58–5.17 | The bar only counted the download. |
| L3 | 5.42–10.55 | But an update still verifies the file, unpacks thousands of pieces, and installs them. |
| L4 | 10.80–13.92 | A bar shouldn't say a hundred until it's all done, so it waits. |
| L5 | 14.17–18.30 | Our test hit ninety-nine in three seconds, then sat there almost two more. |
| L6 | 18.55–23.03 | Microsoft's design guide calls that particularly uninformative and annoying. |
| L7 | 23.33–26.13 | Building one? Give every stage its share of the bar. |
| L8 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation:**
- "Microsoft's" is not in the misaki lexicon (❓), so it is overridden as `[Microsoft's](/mˈIkɹəsˌɔfts/)`.
- "ninety-nine", "uninformative" and "particularly" phonemise normally.
- `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.

**Timing edits from the draft (86 → 80 words):** L3 "installs each one" became "installs them"; L4 dropped "at ninety-nine" (the badge shows it); L5 became "Our test hit…"; gaps were cut to 0.25 s. The payoff ends at 26.13 s.

## Source → claim map (read 2026-11-18; Microsoft, Apple and the paper read raw, quotes verbatim)
**[MS]** Microsoft Learn, Windows app design guidelines (Win32 UX guide), "Progress Bars": https://learn.microsoft.com/en-us/windows/win32/uxguide/progress-bars
**[APPLE]** Apple Developer Documentation, Foundation `Progress`: https://developer.apple.com/documentation/foundation/progress
**[UIST]** Chris Harrison, Brian Amento, Stacey Kuznetsov, Robert Bell, "Rethinking the Progress Bar", UIST '07 (October 7–10, 2007, Newport, Rhode Island), pp. 115–118: https://chrisharrison.net/projects/progressbars/ProgBarHarrison.pdf

| claim | kind | source and what it says |
|---|---|---|
| It raced to ninety-nine percent; now it's stuck | documented pattern | [MS]: "progress bars that immediately shoot to 99 percent completion, then stay there for a long time are particularly uninformative and annoying." |
| The bar only counted the download | our test's bytes-only bar (a common simple design) | test: percent = downloaded bytes ÷ package bytes |
| An update still verifies the file, unpacks thousands of pieces, and installs them | measured stages | test: SHA-256 check, 2,401 files unzipped, each installed with fsync. [APPLE] uses the same shape as its own example: "tracking the progress of code downloading and copying files on disk". |
| A bar shouldn't say a hundred until it's all done, so it waits | documented rule | [MS]: "Clearly indicate completion. Don't let a progress bar go to 100 percent unless the operation has completed." |
| Our test hit ninety-nine in three seconds, then sat there almost two more | measured | 99 % at 3.0 s; 1.8 s stuck (above) |
| Microsoft's design guide calls that particularly uninformative and annoying | documented (quoted) | [MS] quote above |
| Building one? Give every stage its share of the bar | documented guidance + measured | [MS]: "Don't restart progress… Instead, have all the steps in the operation share a portion of the progress and have a single progress bar go to completion once." [APPLE]: "When you assign a progress instance, the system allocates a portion of the containing progress instance's pending unit count." Test: the staged bar stayed within 6 points of elapsed time; the bytes-only bar strayed up to 36. |
| (notes only) Stalls near the end feel worst | research | [UIST]: "participants perceived progress bars with pauses as taking longer to complete… accelerating progress was strongly favored. The latter two effects had an exaggerated perceptual impact when located towards the end of the process (end effect)." It also suggests running "slower or variable operations" first. This supports the story but is not narrated. |

**Illustrative, not claims:**
- the conveyor, hopper, gate, parcel, file cubes (32 shown for 2,401 files, with the real count on a tag), the phone's update screen and the scoreboard bar;
- the story trips in the hook, tour and payoff, which follow the narration, not the measured times. Only the proof shot replays the measured run.

**Deliberately not claimed:**
- that any named app's bar works this way;
- that verification is slow (it was not here);
- any time remaining or speed figure beyond our test;
- that a staged bar is always accurate: its shares come from a previous run, and real timings vary.
- No Tensorblue product feature is implied. No Microsoft or Apple UI or logo is reproduced; the quote is shown as text on our own card.

## Storyboard as built (6 shots, 2 wipes around the proof, then the CTA wipe; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.44 | **1 Hook — frame zero** | Frame 0: **WHY STUCK?** fully drawn above a glossy 3D scoreboard bar at 99 % with a big "99%" badge. Below it the pipeline (DOWNLOAD hopper → VERIFY gate → belt with a pile of file cubes → UNPACK pad) and a phone in the foreground: "Updating app · Installing… 99%". File cubes keep hopping into the phone. On "stuck" the bar jiggles; "STILL INSTALLING". |
| 3.44–5.33 | **2 Only the download** | Rewind: the bar drains to 0. The camera moves to the hopper; the parcel drops in and byte cubes stream up into the bar, which races to 99 % by "download" ("COUNTS ONLY THE DOWNLOAD"). |
| 5.33–10.68 | **3 The real work** | Ride along the belt: the parcel is scanned in the glowing amber VERIFY gate ("VERIFY ✓"); at UNPACK the lid flips and file cubes burst out ("2,401 FILES"); on "installs" cubes hop one by one into the phone ("INSTALLING"). The bar stays at 99 % and jiggles on each step ("STILL 99%"). |
| 10.68–14.05 | **4 100 % only when done** | Wide again: "100% ONLY WHEN DONE". The last cubes land, then the badge stamps a green **100%**, the bar turns green and the phone shows "Done ✓". |
| 14.05–18.43 | **5 Proof** | Wipe ↑ to the test bench: BYTES ONLY and EVERY STAGE bars, a stopwatch in test seconds, and four stage chips that light as the measured run replays (1.5× speed). The bytes bar turns red at 99 % ("99% AT 3.0 s", then "THEN STUCK 1.8 s"); the staged bar keeps moving and reaches 100 % with it. |
| 18.43–23.18 | **5b Quote** | A white card drops in: "“particularly uninformative and annoying” · MICROSOFT DESIGN GUIDE", while the same run replays behind it (rewind sound). |
| 23.18–26.60 | **6 Payoff** | Wipe ↑ back to the pipeline with a fresh run. The bar is now split into stage shares (DOWNLOAD 69 % blue, a sliver each for VERIFY and UNPACK, INSTALL 27 % green), and each fills as its station works. It reaches a green 100 % as the last cube installs. Kinetic **EVERY STAGE / GETS A SHARE.** |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card. |

**Thumbnail** (`tensorblue-30s-english21-01-thumbnail.png`, 1080×1920): frame zero (without the caption) plus the logo and wordmark. **WHY STUCK?** + the bar's **99%** badge.

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/stages_demo.py` + `src/demo/out/stages-demo.json`;
- `src/proj-check.mjs` (dev helper for camera layout).

Reused from english-20:
- unchanged: `brt.mjs`, `stage3d.mjs`, `toy3d.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`, `transitions.mjs`, `requirements-audio.txt`;
- `mix.py`: heading, seed 20261124 and an 8-chord score;
- `package.json`: only `@napi-rs/canvas` 1.1.0.

Licences and assets:
- Fonts: Inter / Inter Display (SIL OFL 1.1); JetBrains Mono (Apache-2.0) for "update.zip".
- Voice: Kokoro-82M (Apache-2.0).
- ASR: `Systran/faster-whisper-base.en` (MIT).
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-18-english-21/tensorblue-30s-english21-01.mp4` · SHA256 `0106628459d14f86183b0acb717ea5918e73624a8b1501fe4894746c3cdcc136` · 6,330,654 bytes.

| gate | target | result |
|---|---|---|
| frame zero | composed subject + 2–5 words, no fade/logo intro | frame 0 = "WHY STUCK?" over the 3D bar at 99 % (badge "99%"), the pipeline and the phone at "Installing… 99%"; narration from 0.10 s, a sound at 0.00 s; viewed (`qa/transitions.png` tile 1, thumbnail) |
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, ~1.5 Mb/s; `+faststart` (atoms ftyp, moov, free, mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo, ~193 kb/s |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 1.8 LU, **−1.8 dBTP** |
| captions | ink inside x 100–900, y 340–520, ≤ 2 lines | all 15 groups pass: ink x 153–844, y 371–488 (`qa/caption-qa.json`) |
| caption sync | each group switches on its word | every group starts 0.06 s before Kokoro's word onset and dissolves into the next |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| thumbnail | separate 1080×1920, 2–5 large words | frame zero + wordmark, viewed at full size |
| narration (one ASR pass, base.en, narration span, on this exact file) | intelligible | Every scripted word heard, including "Microsoft's". 77/80 matched, WER 6.1 %: numerals ("99%", "99"), "TensorBlue" and "one," for "one?". Only low-confidence token: "a" (0.55). Mean start drift 0.10 s, max 0.39 s (`qa/asr.json`). |
| shots / transitions | one idea at a time, purposeful moves | 6 shots + a quote beat, 2 bench wipes, 1 CTA wipe. `qa/contact-sheet-1fps.png` (30 tiles) and `qa/transitions.png` (22 frames decoded from the final MP4) viewed. |

**Fixed during QA:**
1. **Bar placement.** A bar floating near the camera covered the frame-zero words and filled close-ups. It became a scoreboard behind the hopper, and cameras were set with a projection helper.
2. **Badge.** The 99 % badge overlapped "WHY STUCK?"; it now sits under the bar's right end.
3. **Belt draw order.** The belt, sorted as one big object, painted over the parcel in the VERIFY gate. It is now drawn first as the base.
4. **100 % timing.** The green 100 % landed after the wipe, so it was never seen. The install timing now finishes before "waits" ends, and the renderer refuses timings that would hide it.
5. **Proof bench.** The bars ran off-frame and the chip labels were truncated ("DOWN"). Smaller bars, full-word chips, and one result tag below.
6. **Quote beat.** It was static for 4.5 s, so the run now replays behind the card.
7. **Smaller fixes:**
   - a too-wide caption was split (the render guard caught it);
   - payoff labels collided with the kinetic words;
   - the hook phone and the VERIFY tag were clipped.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering; no listening check was performed.
- The test is one machine's run: download throttled to 100 Mb/s, installs with fsync. Real devices, apps and networks have different stage times; verification can be slower elsewhere.
- In the payoff the VERIFY and UNPACK shares are slivers (0.9 % and 2.8 %), because that is what the measured run gave.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
