# 31 — Batch `2026-11-15-english-18` (batch18) · 30s · episode 01 (English)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-15-english-18/tensorblue-30s-english18-01.mp4`, thumbnail `…/tensorblue-30s-english18-01-thumbnail.png`.
This file is copied to `production/30s/2026-11-15-english-18/production-notes.md`. All earlier MP4s (including batch17 / english-17) are preserved unchanged.

## Brief (user-authorised, 15 Nov 2026, batch18)
- **Topic:** how Shazam recognizes a song in a noisy café.
  - Audio fingerprinting: landmark peaks, hash matches and timing offsets against a database of recordings.
  - Show one tiny sound shard finding its original track, with strong 3D depth and a playful, relevant metaphor.
  - Use Shazam's original published technical paper. Distinguish exact-recording fingerprinting from humming recognition.
- **Look:** the exact tensorblue.com palette and logo; no decorative moving lines.
- **Hook:** TEN SECONDS. ONE SONG.
- **Standing rules kept:**
  - frame zero is a composed, surprising subject plus 2–5 truthful words, with no fade or logo intro, working as the thumbnail, and hook audio at once;
  - Theory of Marketing structure and pacing;
  - one idea at a time;
  - captions inside x 100–900 (house band y 340–520);
  - honest QA.
- **Feedback kept:** a useful app-engineering story with real 3D depth and fun; exact palette and logo; no distracting lines.
- **History check** (this app's completed rounds only): the topic is new. No earlier episode covers audio, music recognition, spectrograms or fingerprint hashing. The only "fingerprint" mentions are biometric (Hindi batch 04, passkeys). This is a single job after the finished batch17; batch17 was not repeated.
- **Process:** the session's worker restarted mid-job and the user asked to "try again". Work resumed from the saved state (narration, timings and the test were already on disk); nothing was lost or duplicated.
- **Language and voice:** English only. Approved Tensorblue voice, Kokoro-82M `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98, cached. Narration starts at 0.10 s. No Hindi. Other apps' context was not read.
- **Style:**
  - Blue Receipt Theatre kit `brt.mjs` and `stage3d.mjs` unchanged.
  - Node + `@napi-rs/canvas` 1.1.0. No Three.js, Blender or paid API.
  - No Shazam logo, UI or app screens: the phone screen is generic ("LISTENING 0:10").
- **Colours** (tensorblue.com tokens as checked for english-16/17, 2026-11-15):
  - The Tensorblue palette: `#3B82F6`, `#0A6CFF`, `#030610`, `#D8E3F5`, `#B7C7DF`, `#FFFFFF`, navies `#050816` / `#08101F` / `#0B1423`.
  - **cyan-400 `#00D3F2`:** the matching song stars and the stack.
  - **amber-400 `#FFB900`:** hashes in flight, and the hummed version.

## The real test (`src/demo/fingerprint_demo.py`; numpy 1.26.4 + scipy 1.14.1, pinned in `requirements-audio.txt`)
- **What it is:** our own implementation of the method in Wang (2003). It is **not Shazam's code**, and the music and noise are **made up** (generated from fixed seeds).
- **Database:** 6 synthetic instrumental tracks of 60 s each (8 kHz mono, as in the paper's tests), indexed as 67,658 hashes.
- **Sample:** 10 s of track 3 starting at 37.0 s, buried in synthetic café noise at **0 dB SNR** (noise as loud as the music) and band-limited like a phone mic. The noise is a babble of six voices, room rumble and cup clinks.
- **Method, as the paper describes:**
  - spectrogram (FFT 1024, hop 32 ms);
  - keep local peaks, the "constellation map";
  - pair each anchor with up to 10 later peaks in a target zone (64 ms–2 s, ±940 Hz). Each hash is (freq 1, freq 2, time gap) plus the anchor's time;
  - look the hashes up. For each track, histogram t_db − t_sample; the score is the number of hits in the histogram peak (±1 frame).
- **Results** (`demo/out/fingerprint-demo.json`):

| check | result |
|---|---|
| sample peaks | **255**: 41 also in the clean song at the found offset, **214 added by the café** |
| sample hashes | 2,422 |
| hits (hashes found in the database) | 210 in all; **189 are random** (outside the winning peak) |
| track 3 | 86 hits, of which **21 share one offset: 37.02 s** (the true start is 37.0 s; one frame is 32 ms) |
| best other track | score **4** (track 4) |
| example hash (on screen) | **625 Hz + 1242 Hz, gap 0.58 s** (anchor 1.28 s into the clip; both are song peaks and the hash matched track 3 at the offset) |
| hummed version | same melody as a pure tone, 2 semitones lower, 8 % slower, same noise: best score **2** on every track. **No match.** |
| robustness (same clip, louder noise) | +6 dB 57 vs 3 · +3 dB 30 vs 3 · 0 dB 21 vs 4 · −3 dB 14 vs 2 · −6 dB 10 vs 2 · −9 dB 3 vs 2 (no clear match) |

- **Parameter note:** fan-out 10 is the paper's own example value (F = 10). A first run with fan-out 5 gave a weaker 6 vs 2 at 0 dB. Both runs are documented, and the video uses the F = 10 run.
- **Visual note:** hits whose offset would put the clip before the song's start (10 of 210, and 4 of 82 for the hum) are not drawn on the lanes; they are chance hits.
- The renderer stops if any of these results change.

## Final script (as spoken; 73 words, 29.45 s incl. CTA; first word at 0.10 s)
| id | time (s) | line |
|---|---|---|
| L1 | 0.10–3.46 | Ten seconds in a noisy cafe, and Shazam names the song. |
| L2 | 3.76–5.71 | The trick? Turn sound into stars. |
| L3 | 6.01–10.35 | Shazam's 2003 paper keeps only the loudest frequency peaks. |
| L4 | 10.60–14.55 | Pairs of peaks become hashes: two frequencies and the gap between. |
| L5 | 14.85–17.09 | Look them up, and noise makes random hits, |
| L6 | 17.24–20.29 | but in the right recording, the hits share one time offset. |
| L7 | 20.64–24.79 | So it matches that exact recording. Humming needs a melody-based search. |
| L8 | 27.00–29.55 | Follow Tensorblue for software explained simply. (accepted CTA) |

**Pronunciation (misaki, checked):**
- "Shazam" /ʃəzˈæm/, "cafe" /kæfˈA/, "2003" "two thousand three", "melody-based" — all normal; no overrides needed.
- `[Tensorblue](/tˈɛnsəɹblˌu/)` is the accepted override.

## Source → claim map (primary/reliable, read 2026-11-15; quotes checked verbatim against the raw files)
**[W]** Avery Li-Chun Wang (Shazam Entertainment, Ltd.), "An Industrial-Strength Audio Search Algorithm", ISMIR 2003. PDF: https://www.ee.columbia.edu/~dpwe/papers/Wang03-shazam.pdf. Venue and year: the ISMIR 2003 agenda (https://ismir2003.ismir.net/agenda.html) lists "Invited Speaker - Avery Wang, Shazam Entertainment 'An Industrial Strength Audio Search Algorithm'", Wednesday 10/29/2003; the PDF's source file is "ISMIR-2003-Shazam-rev2".
**[G]** Google Blog, Krishna Kumar, "Song stuck in your head? Just hum to search", Oct 15, 2020. https://blog.google/products/search/hum-to-search/

| claim | kind | source and what it says |
|---|---|---|
| Ten seconds in a noisy café, and Shazam names the song | documented capability + our test | [W]: "capable of quickly identifying a short segment of music captured through a cellphone microphone in the presence of foreground voices and other dominant noise"; "It can correctly identify music in the presence of voices, traffic noise, dropout, and even other music." [W] tested 15, 10 and 5 s samples: "the recognition rate drops to 50% for 15, 10, and 5 second samples at approximately -9, -6, and -3 dB SNR". Our test: a 10-s clip at 0 dB found track 3 (21 vs 4). |
| The trick: turn sound into stars | documented (the paper's own metaphor) | [W]: "We term the sparse coordinate lists 'constellation maps' since the coordinate scatter plots often resemble a star field." |
| Shazam's 2003 paper keeps only the loudest frequency peaks | documented | [W]: "We settled on spectrogram peaks, due to their robustness in the presence of noise"; "A time-frequency point is a candidate peak if it has a higher energy content than all its neighbors in a region centered around the point"; "the highest amplitude peaks are most likely to survive the distortions". |
| Pairs of peaks become hashes: two frequencies and the gap between | documented + our test | [W]: "Fingerprint hashes are formed from the constellation map, in which pairs of time-frequency points are combinatorially associated… each pair yielding two frequency components plus the time difference between the points." Test: 625 + 1242 Hz, gap 0.58 s. |
| Look them up, and noise makes random hits | documented + our test | [W]: for a non-matching track "There are a few chance associations, but no linear correspondence appears." Test: 189 of 210 hits are random. |
| …but in the right recording, the hits share one time offset | documented + our test | [W]: "For each (tk',tk) coordinate in the scatterplot, we calculate δtk=tk'-tk. Then we calculate a histogram of these δtk values and scan for a peak… The score of the match is the number of matching points in the histogram peak." Also the strip-chart image: slide the sample's map over the song's and "at some point a significant number of points will coincide when the proper time offset is located". Test: 21 hits at 37.02 s. |
| So it matches that exact recording | documented | [W]: "The algorithm was designed specifically to target recognition of sound files that are already present in the database. It is not expected to generalize to live recordings." "The algorithm is conversely very sensitive to which particular version of a track has been sampled. Given a multitude of different performances of the same song by an artist, the algorithm can pick the correct one even if they are virtually indistinguishable by the human ear." |
| Humming needs a melody-based search | documented (another company's described method) + our test | [G]: "When you hum a melody into Search, our machine learning models transform the audio into a number-based sequence representing the song's melody… The algorithms also take away all the other details, like accompanying instruments and the voice's timbre and tone." Test: our hummed version scores 2 everywhere (no match). |

**Illustrative, not claims:**
- the café, cup, phone, chatter bubbles and the "0:10" screen;
- the six songs and their content;
- the noise mix and the hum;
- the glass "shard", the lanes and the cube stacks. These show the paper's strip-chart/transparency image; every peak, hash, hit and offset drawn comes from the test.

**Deliberately not claimed:**
- Shazam's current production system, catalogue size, speed or accuracy. The 2003 paper's own figures (1.8M tracks, milliseconds per query) are not used on screen.
- Whether today's Shazam app accepts humming. The video says only that humming needs a melody-based search; that method is attributed in the notes to Google's described hum-to-search.
- No Shazam or Apple logo, UI or sound. No Tensorblue product feature is implied.

## Storyboard as built (7 camera shots, a world-change wipe, then the CTA wipe; every cue keyed to word timings)
| time (s) | shot | what happens |
|---|---|---|
| 0–3.61 | **1 Hook — frame zero** | Frame 0: a café table with a black coffee and a phone ("LISTENING 0:10"). Above it floats a dark-glass "sound shard" whose 10-s spectrogram stands up as glowing blue/cyan 3D terrain; two chatter bubbles bob. **TEN SECONDS. ONE SONG.** is already on screen, with a sound on frame 0. |
| 3.61–5.86 | **2 Sound → stars** | Closer. On "stars" the terrain sinks and the loudest peaks pop up as white star beads across the plate. |
| 5.86–10.45 | **3 Peaks only** | "TIME →" / "FREQUENCY ↑" mark the axes, then "LOUDEST PEAKS" (the beads pulse). The chatter fades. |
| 10.45–14.70 | **4 Hash** | Two peaks light amber. A HASH card rises above them: "625 + 1242 Hz", "gap 0.58 s". On "between" it shrinks and small amber cards pop off other pairs; the shard flies up. |
| 14.70 | wipe | A blue wipe ↑ to the database. |
| 14.70–17.14 | **5 Look up** | Six songs lie as dark star-chart lanes (time runs away from us). The shard hovers over the near end and its hashes rain down as amber cubes that land as blue hits at the offsets they imply, scattered over every lane ("RANDOM HITS"). |
| 17.14–20.96 | **6 One offset** | Closer on track 3. From "share", 21 cyan hits stack into one tower at 37 s ("21 HITS AT 37 s"). The camera pushes in, the hits sink away, and the shard glides down and docks on track 3 at 37 s: its song stars turn cyan where they sit on the song's own stars, and the café's stars dim. |
| 20.96–26.60 | **7 Payoff** | "TRACK 3 ✓". Pull back (slow crane). Kinetic **EXACT RECORDING,**. On "Humming", an amber hummed shard drops in ("HUMMED"); its hits scatter and no stack forms. **NOT THE TUNE.** |
| 26.60–30.0 | **CTA** | Blue wipe ↑ into the accepted end card. |

**Thumbnail** (`tensorblue-30s-english18-01-thumbnail.png`, 1080×1920): frame zero (without the caption) plus the logo and wordmark in the empty top. **TEN SECONDS. ONE SONG.** (4 words).

## Provenance and licences
New this round:
- `src/scene.mjs`;
- `src/demo/fingerprint_demo.py` + `src/demo/out/fingerprint-demo.json`.

Reused from english-17:
- unchanged: `brt.mjs`, `stage3d.mjs`, `render.mjs`, `qa.mjs`, `dump-events.mjs`, `export-qa.sh`, `tts.py`, `asr.py`, `thumb.mjs`, `requirements-audio.txt`;
- `mix.py`: heading, seed (20261121) and an 8-chord shot score;
- `package.json`: only `@napi-rs/canvas` 1.1.0.

Licences and assets:
- The test uses numpy and scipy (already pinned for the audio pipeline).
- Fonts: Inter / Inter Display (SIL OFL 1.1).
- Voice: Kokoro-82M (Apache-2.0), cached.
- ASR: `Systran/faster-whisper-base.en` (MIT), cached.
- Music and SFX: synthesized.

No paid APIs, Blender, secrets, personal data or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-15-english-18/tensorblue-30s-english18-01.mp4` · SHA256 `cdcecacdceaf3fc8099565248867375db6ff0be1343dd20d5af1317a514ff637` · 16,048,609 bytes.

| gate | target | result |
|---|---|---|
| frame zero | composed subject + 2–5 words, no fade/logo intro | frame 0 = the café table with the glowing sound shard + "TEN SECONDS. ONE SONG." fully drawn; narration from 0.10 s, a sound at 0.00 s; viewed (`qa/transitions.png` tile 1, thumbnail) |
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` (moov before mdat) |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.0 LUFS**, LRA 2.7 LU, **−1.8 dBTP** |
| captions | ink inside x 100–900, y 340–520, ≤ 2 lines | all 14 groups pass: ink x 153–844, y 371–488 (`qa/caption-qa.json`) |
| caption sync | each group switches on its word | Every group starts 0.06 s before Kokoro's word onset and dissolves into the next with no blank frame. Whisper's start drift is ≤ 0.33 s, all on mid-group words ("hits", "that", "recording") that switch no caption. |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| thumbnail | separate 1080×1920, 2–4 large words | frame zero + wordmark, 4 words, viewed |
| narration (one ASR pass, base.en, narration span) | intelligible | 68/73 scripted words matched, WER 6.8 %; mean start drift 0.08 s, max 0.33 s (`qa/asr.json`). The differences are under "Known limits". |
| shots / transitions | one idea at a time, purposeful moves | 7 shots, 1 world-change wipe, 1 CTA wipe. `qa/contact-sheet-1fps.png` (30 tiles) and `qa/transitions.png` (frame 0 + frames around each change) viewed on the final file. |

**Fixed during QA:**
1. **Frame zero.** In the first pass the shard overlapped "ONE SONG." and the chatter bubbles sat on the words. The shard now stands up like a spectrogram panel facing us and was lowered; the camera was re-set with a projection check.
2. **Stars, not bristles.** 255 tall white pegs on a pale plate read as a bristle field. The plate became dark glass and the peaks small beads, so they read as a star map.
3. **Phone.** It dominated the close-ups; it was moved forward and to the side.
4. **Hash card.** It was clipped at the frame edge and covered by the small cards. It now sits above the plate and shrinks before the small cards appear, which are smaller.
5. **Lanes.** Per-segment outlines drew seams across the lanes; one outlined base per lane replaced them.
6. **Docking moment.** It was too small in the wide shot. A push-in on track 3 now shows the stars lining up, and the payoff pull-back waits for it.
7. **Fan-out.** It was raised from 5 to the paper's example value of 10 (see the test).

**Known limits:**
- I can't listen here. Clarity rests on one ASR pass plus loudness and true-peak metering, plus a voice-track energy check; no listening check was performed.
- WER 6.8 % comes from:
  - "10" for "Ten" (numeral tokenisation);
  - "turns" for "Turn" (the /s/ of "sound" attaches; the voice track has a 0.1 s silence after "trick?");
  - "peeks" for "peaks" (homophone; captions spell "peaks");
  - a doubled "search." (p 0.087) inside the final word's own span (24.27–24.78 s). The voice track is silent from 24.80 s, so this is a Whisper artefact.
- Music, café noise and the hum are synthetic; real recordings and real Shazam were not tested. The test shows the published method, not Shazam's present system.
- The MP4 is 16.0 MB (about 4.3 Mb/s), larger than recent rounds because of the dense star dots and cubes. It is within normal upload sizes.
- There is no Desktop/video-review folder in this cloud container. The MP4 and thumbnail are delivered as chat attachments and on the branch.
