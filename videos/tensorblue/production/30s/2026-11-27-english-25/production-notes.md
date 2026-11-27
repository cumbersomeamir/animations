# 39 — Batch `2026-11-27-english-25` (batch25) · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-27-english-25/tensorblue-30s-english25-01.mp4`, thumbnail `…/tensorblue-30s-english25-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-27-english-25/production-notes.md`. All earlier MP4s are preserved unchanged. Batch24 was complete (`df2ba9f`).

**Environment:** the session resumed in a fresh container (new kernel build). The branch was clean and in sync, and the Kokoro/Whisper venv and HF cache were intact. Free disk at the start: 27 GB; renders stream frames straight into ffmpeg, so no frame files are written.

## Brief (user-authorised, 27 Nov 2026)
- **Proposed topic:** "How Figma keeps two cursors from overwriting each other". A purposeful 3D canvas: editors change separate properties, then the same property. Verify with Figma engineering sources.
- **Rule:** "If this mechanism has already been covered, choose an unrelated subject within the same established genre, and record the change." Preserve the approved visual skill, branding, voice and music; verify every claim.
- **Kept:**
  - the 2026-11-18 feedback: app development / something cool an app did, real 3D depth, fun;
  - the exact current tensorblue.com branding;
  - captions at y 280–460;
  - nothing vital near the bottom/right platform UI;
  - one idea per shot, minimal large text.

## Topic decision (why the proposal was replaced)
- **Already covered by english-17** (`30-production-30s-english17-01.md`, 15 Nov): *"how Figma lets two people move the same shape without destroying the file"*.
  - Same company, same sources (Figma's multiplayer engineering post), same mechanism.
  - Edits go through one central server; different properties both survive; the same property ends with the last value the server receives.
  - Its storyboard already had two cursors changing separate properties and then the same one.
- **Chosen instead:** *Why did Spotify make shuffle "less random", and how?*
  - Spotify Engineering's **13 Nov 2025** post describes the mechanism: "Fewer Repeats" makes several truly random orders, scores each for freshness, and keeps the freshest.
  - It fits "something cool an app did" and ends in a concrete builder pattern: **generate a few random candidates, then pick the one that scores best on what users actually feel**.
- **New to the channel.** No prior episode covers shuffling, randomness or candidate scoring. Prior topics: CDN, optimistic updates, idempotency, raster/vector, password vault, passkeys, OCR, QR, last-seat race, deleted-photo sync, DNS, incognito, photo compression, offline-first, undo, list recycling, write-ahead log, reroute, Figma multiplayer, Shazam, adaptive bitrate, WhatsApp store-and-forward, progress bar, tunnel dead reckoning, k-anonymity, Snowflake IDs.
- **Different from batch24** (Snowflake):
  - question: perceived randomness, not unique IDs;
  - setting: a listening room with song queues, coins, candidate decks and a die, not servers and ID plates;
  - mechanism: best-of-N random candidates by a score, not bit packing.
- Spotify's 2014 post "How to shuffle songs?" now returns 404, so it is not used or cited.

## Branding re-check (tensorblue.com, 2026-11-27: homepage + its three CSS files)
- `#030610`, `#3B82F6`, `#D8E3F5` and `#B7C7DF` are still present.
- `--color-amber-400` is oklch(82.8% .189 84.429) → **`#FFB900`**, used 16× on the homepage. It marks **just-played** songs.
- `--color-green-400` is oklch(79.2% .209 151.711) → **`#05DF72`**, used 160×. It marks the **fresh / winning** order.
- Logo and wordmark: `assets/brand` as before; the end card is the accepted one, unchanged.

## The test (`src/demo/shuffle_test.py`; Python 3 stdlib)
- **What it is:** our own model of the two modes the post describes. It is not Spotify's code; Spotify did not publish how many orders it draws or its exact scoring.
  - **Standard:** one random value per song, then sort by it, as the post describes. Python's `random` is a Mersenne Twister, as is Spotify's Standard Shuffle.
  - **Fewer Repeats (our model):** draw **10** random orders and keep the one with the highest freshness. A just-played song costs points weighted by how early it sits (1 − position/20) and how recently it played, 1/(1 + hours/6). N = 10 and these weights are **our illustrative choices**.
- **Setup:** a 20-song playlist; 5 songs were just played (10 min, 1 h, 3 h, 12 h and 1 day ago). 20,000 trials, seed 20261127.

| mode | first song is a just-played song | just-played songs in the top 5 |
|---|---|---|
| pure shuffle | **24.6 %** (expected 25 %) | 1.25 |
| freshest of 10 random orders | **8.1 %** (≈ 1 in 12) | 0.50 |

- **Worked example** (the first draw of a fresh generator, seed 20261128, **not cherry-picked**):
  - the pure shuffle opens 9, **11 (3 h ago)**, 13, 18, 14;
  - the ten candidates score 61, 76, 65, 60, 74, 80, 62, 71, **82**, 70, so **#9 wins**, with no just-played song in its top 5.
- The proof trays show 12 tiles each with **3** and **1** amber: 24.6 % and 8.1 % of 12, rounded. The renderer throws if those counts stop matching the measured rates.
- The payoff's feed scores (58 / 87 / 71) are illustrative, not measured.

## Final script (as spoken; 79 words incl. CTA, 29.55 s; first word at 0.10 s)
| id | time (s) | line |
|---|---|---|
| L1 | 0.10–3.59 | Spotify's shuffle was truly random. It felt repetitive. |
| L2 | 3.89–6.86 | Five heads in a row is random too. So what changed? |
| L3 | 7.16–10.42 | Since 2025, it makes several random orders. |
| L4 | 10.67–11.96 | Each gets a freshness score. |
| L5 | 12.16–14.22 | Songs you just played lose points near the top. |
| L6 | 14.47–15.73 | The freshest order wins. |
| L7 | 16.03–21.93 | Our test: just-played songs came first one time in four. Freshest of ten: one in twelve. |
| L8 | 22.23–25.92 | Building a feed? Keep it random, then pick the freshest of a few. |
| L9 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation:**
- "Spotify" is not in the misaki lexicon (❓), so it is overridden as `[Spotify](/spˈɑtɪfˌI/)` / `[Spotify's](/spˈɑtɪfˌIz/)`, "SPAH-tih-fye". ASR heard "Spotify's" correctly.
- "2025" is read "twenty twenty-five".
- `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.

**Edits:**
- The first draft ran 29.5 s of speech and its hook took 3.6 s. "It didn't feel random" became "It felt repetitive" (the post's own "less repetitive"). "So what did Spotify change?" became "So what changed?". "Its 2025 fix, Fewer Repeats, makes…" became "Since 2025, it makes…"; the name moved to the headline. L7 was shortened.

## Source → claim map (read 2026-11-27; raw pages, quotes verbatim)
| claim | kind | source and what it says |
|---|---|---|
| Spotify's shuffle was truly random | documented | **Spotify Engineering, "Shuffle: Making Random Feel More Human", 13 Nov 2025, Ludvig Borgne & Chidem Sahiner** https://engineering.atspotify.com/2025/11/shuffle-making-random-feel-more-human: "For the last 5 years, Spotify's Shuffle was exactly that – random. We relied on a standard, publicly used randomization method to generate playlist orders that were mathematically sound." |
| It felt repetitive | documented | same: "users wanted Shuffle to feel more varied and less repetitive. Certain songs or artists seemed to surface again and again"; "statistical randomness doesn't always translate into perceived randomness." |
| Five heads in a row is random too | documented | same: "Think of flipping a coin and getting five heads in a row. It's a completely valid random outcome, but it doesn't feel random." |
| Since 2025, it makes several random orders | documented | same: "we introduced a new system we call Fewer Repeats. Generate multiple random sequences. Each of these potential shuffle sequences is a mathematically random version of your playlist." "The 'Fewer Repeats' mode of Shuffle is now the default experience for Premium users." (Premium default; the caption says so.) |
| Each gets a freshness score; songs you just played lose points near the top | documented | same: "Score each sequence for freshness. We check how recently you've listened to the songs — both within that playlist and across Spotify. Each random sequence loses 'freshness points' for recently played tracks appearing early in the order. The earlier in the order and the more recent they were played, the more points they lose." |
| The freshest order wins | documented | same: "Pick the freshest version of the random sequences. The sequence with the highest freshness score wins, becoming your final Shuffle." |
| Our test: one time in four → one in twelve | measured on our model | 24.6 % → 8.1 % (above) |
| Building a feed? Keep it random, then pick the freshest of a few | our advice, from the documented pattern | generalises the post's method ("We're not changing the math behind randomness; instead, we're simply choosing the freshest sounding one.") |
| (test note) Python's `random` is a Mersenne Twister | documented | **Python docs, random** https://docs.python.org/3/library/random.html: "Python uses the Mersenne Twister as the core generator." Spotify: Standard Shuffle uses "a well-known method called the Mersenne Twister". |

**Illustrative, not claims:**
- the queue rows ("Song 9"… with a generic note glyph, not real titles or cover art), the coins, the candidate deck and badges, the trays, the die and the generic feed cards;
- no Spotify UI, logo or green is reproduced.

**Deliberately not claimed:**
- how many orders Spotify draws or its exact weights;
- that free-tier users get Fewer Repeats;
- any engagement or satisfaction figure;
- the 2014 artist-spreading story (its post now returns 404).

## Storyboard as built (8 shots + CTA wipe; one headline at a time; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.77 | **1 Hook — frame zero** | A floating "up next" queue (the real first-draw pure shuffle): Song 9, **Song 11 · 3 h ago** (amber edge and pill), 13, 18, 14. The just-played row lifts forward and glows amber, then bumps on "repetitive". **JUST PLAYED. / UP AGAIN?** (amber / white, soft shadow, centred x 500). The pill stays at x ≤ 906 (measured). |
| 3.77–7.04 | **2 Five heads** | A high camera over five coins that flip and land face-up **H** one by one, keyed to the narration. **5 HEADS. STILL RANDOM.** |
| 7.04–10.55 | **3 Several random orders** | One queue panel pops up, then fans out into a deck of **ten** candidate panels on a rising staircase receding into depth (real candidate orders; just-played rows amber). **FEWER REPEATS** |
| 10.55–12.04 | **4 Freshness score** | A score badge pops onto every panel at **100**. **FRESHNESS SCORE** |
| 12.04–14.35 | **5 Lose points** | Closer. Amber rows near the top pulse while every badge counts down to its real score (61, 76, 65, 60, 74, 80, 62, 71, 82, 70). **JUST PLAYED = −POINTS** |
| 14.35–15.91 | **6 The freshest wins** | Panel #9 (82, no amber in its top 5) slides out of the deck to the front and turns green; the rest sink away. **82 WINS** |
| 15.91–22.11 | **7 Proof** | Tray "pure shuffle 24.6%": 12 tiles land, **3 amber**. Then "freshest of 10 · 8.1%": 12 tiles, **1 amber**. **1 IN 4 → 1 IN 12** |
| 22.11–26.60 | **8 Payoff** | A die rolls in; three generic feed cards pop out on "random"; scores appear (58 / 87 / 71, illustrative) and the 87 card slides forward and turns green on "pick the freshest". **RANDOM, THEN FRESHEST** |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card. |

**Thumbnail** (`tensorblue-30s-english25-01-thumbnail.png`): frame zero (without the caption) plus the logo and wordmark. **JUST PLAYED. UP AGAIN?** (4 words).

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/shuffle_test.py` + `src/demo/out/shuffle-test.json`;
- `src/amber-extent.mjs`, a dev helper that measures the rightmost amber pixel per frame (checks the right-side controls zone).

Reused from english-24:
- unchanged: `brt.mjs`, `stage3d.mjs`, `toy3d.mjs`, `render.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`, `transitions.mjs`, `qa.mjs`, `requirements-audio.txt`;
- `mix.py`: heading, seed 20261128, a 9-scene chord list.

Licences and assets:
- Fonts: Inter / Inter Display, JetBrains Mono (SIL OFL 1.1).
- Voice: Kokoro-82M (Apache-2.0), the approved blend.
- ASR: faster-whisper base.en (MIT).
- Music and SFX: synthesized by `mix.py` (the established original score method).

No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `…/tensorblue-30s-english25-01.mp4` · SHA256 `645162a5adacc1c9cf887d40664674ecaccd3a8369436afc1677aed5d3cab1d2` · 5,612,884 bytes.

| gate | target | result |
|---|---|---|
| frame zero | composed subject + 2–5 words, no fade/logo intro | the real queue with the just-played row lifted + "JUST PLAYED. UP AGAIN?"; narration from 0.10 s, a sound at 0.00 s |
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 30/1, yuv420p, ~1.3 Mb/s, `+faststart` (ftyp, moov, free, mdat) |
| frames / duration | 900 / 30.000 s | silent render checked at 900 frames before muxing; final `nb_read_frames=900`; all streams 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo, ~191 kb/s |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.3 LUFS**, LRA 2.2 LU, **−3.2 dBTP** |
| captions | ink inside x 100–900, **y 280–460**, ≤ 2 lines | all 13 groups pass: ink x 149–851, y 311–428 |
| top / caption band | no stage drawing in y 0–479 | 0 violations in 90 sampled frames |
| headline vs props | nothing from the world inside a headline's box (+12 px) | 0 prop pixels in 396 sampled frames |
| right-side controls | vital labels clear of the right edge | the hook's amber pill peaks at x 906 (measured with `amber-extent.mjs`; it was 1079 before the fix) |
| text density | ≤ one headline + caption | one kinetic headline at a time; each exits before its cut |
| narration (one ASR pass on the final audio) | intelligible | Every scripted word heard, including "Spotify's". 76/79 matched, WER 2.5 %, all from "10"/"12" as numerals, "just played" without the hyphen, and "TensorBlue". Low confidence: "too" (p 0.49), "10" (p 0.49). Mean start drift 0.09 s, max 0.33 s. |
| audio identity | ASR-checked audio = final audio | audio-stream MD5 `20a1e3a0…`, unchanged across the last visual-only re-render (SFX list verified identical) |
| watch-through | every second | 2 frames/s **by exact frame number** of the whole final file, plus `qa/transitions.png` (25 frames decoded from the MP4) and stills of every shot and transition |

**Fixed during the build/QA:**
1. **Hook frame 0.** The rows were still mid-settle and overlapping; the shuffle now lands before frame 0. The floor shadows of the upper rows darkened the bottom row, so only the bottom row casts a shadow.
2. **Coins.** The right coin was cut off; the spacing and camera were adjusted.
3. **Empty stage.** The candidate shot was empty for 1.7 s during "Since 2025"; one queue now appears at the cut and fans out on "several".
4. **Ten candidates.** A flat arc made them tiny and overflowed both edges. They became a deck receding into depth, then a rising staircase, so all ten badges show.
5. **Lower edge.** The deck's front panel sat near y 1700, and the deck shots were lifted.
6. **Proof.** The tray labels were too small and were enlarged (24.6 % amber, 8.1 % green); the proof shot opened with ~0.2 s of empty stage, so the first tray now starts at the cut.
7. **Payoff die.** It rolled in half-cut at the bottom-left, then filled the frame, before its path was fixed; the feed cards were recentred.
8. **Right edge.** The hook's lifted row pushed its "3 h ago" pill to x 1079 (the right-side controls zone). The lift and the dolly were reduced: x 906.

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering; no listening check was performed. "Watched" means exact-frame sheets at 2 fps, stills and pixel checks, not real-time playback.
- Our test models the documented method with our own N and weights; it does not measure Spotify. Fewer Repeats is the default for **Premium** users; Standard Shuffle remains purely random.
- Frame zero is a flatter composition (a readable queue) than later shots; its depth comes from the lifted amber row and the camera drift.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
