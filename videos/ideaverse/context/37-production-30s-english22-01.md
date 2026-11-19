# 37 — Production 30s english22-01 (English): "This frame never happened: one ball, two places."

Batch 2026-11-19-english-22 ("NEXT EPISODE — English batch22", authorised 19 November; batch20/21 were already delivered and
pushed, nothing checkpointed). Workspace `production/30s/2026-11-19-english-22/` · deliverables `ideaverse-30s-english22-01.mp4`
+ `ideaverse-30s-english22-01-thumbnail.png`. Repo cumbersomeamir/animations · branch claude-video/ideaverse.
Style: accepted pilot-01 DOCKET newsroom style via the latest renderer. LIVE feedback applied: CTA exactly "Download the
Ideaverse app."; icon re-checked against the live Play listing (unchanged); a mechanism with a surprising, checkable
consequence, not an AI-use tip.
New brief rules (2026-11-19): captions in an upper band ≈ y 280–460 with horizontal safe margins (pill now y 282–458, x 100..900);
other vital information away from the right-side/bottom platform controls; ≤ one short headline + the current caption;
hook 0–3, superhook 3–5, build 5–21, payoff 21–27, CTA 27–30.

## Topic check (history: context/09, 12–36)
- Proposed: "Why AI slow-motion can create a ball that was never there" (frame interpolation; a bouncing ball splits or
  disappears when estimated motion is ambiguous; smoothness is not proof of a real moment).
- Not covered: no earlier episode explains frame interpolation (english17-01 was the pre-shutter frame buffer / Top Shot —
  real frames, not invented ones). Used as briefed.

## Script (English, 77 words incl. CTA) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.20 | hook | This frame never happened: one ball, two places. |
| s2 | 3.35 | superhook | AI slow motion made it up. |
| s3 | 5.25 | mechanism | It takes two real frames and guesses how each pixel moved. |
| s4 | 8.90 | mechanism | Then it moves both frames to the middle and blends them into a new one. |
| s5 | 12.95 | the failure | But on a fast bounce, that guess can fail, and the blend shows both balls. |
| s6 | 17.45 | proof | Neither real frame shows this. |
| s7 | 20.85 | payoff | Smooth isn't proof. To judge a real moment, step through the original frames. |
| s8 | 27.20 | CTA | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en (punctuation aside). Rejected draft wording: "the guess can fail"
(base.en heard "the guests") → "that guess can fail".

## Facts → sources (accessed 2026-11-19)
| claim | type | source |
|---|---|---|
| AI slow motion makes new frames from two real ones (consumer example) | documented | Samsung Newsroom, "Finally, a Mobile Camera That Ensures You Never Miss a Moment" (Galaxy S24), https://news.samsung.com/global/finally-a-mobile-camera-that-ensures-you-never-miss-a-moment — Instant Slow-mo via "AI Frame Rate Conversion (AI FRC)": "AI FRC takes every two frames from the video as it was originally recorded and uses a deep learning model to analyze and extract motion information … helps AI FRC interpolate intermediate frames"; "This process is carried out twice" (both directions); fusion steps "render the final, AI-generated intermediate frames". Samsung Community CamCyclopedia, "Instant Slow-mo", https://r2.community.samsung.com/t5/CamCyclopedia/Instant-Slow-mo/ba-p/19981063 — "uses an AI model to extract motion information between two input frames … synthesize interpolated frames … placed sequentially between the two input frames"; "For 30fps, when selecting 1/4x speed, slow motion is applied by adding three interpolated frames." |
| it guesses how each pixel moved | documented (method) | H. Jiang et al. (NVIDIA), "Super SloMo: High Quality Estimation of Multiple Intermediate Frames for Video Interpolation", CVPR 2018, https://openaccess.thecvf.com/content_cvpr_2018/papers/Jiang_Super_SloMo_High_CVPR_2018_paper.pdf — "We start by computing bi-directional optical flow between the input images" (optical flow = per-pixel motion). |
| moves both frames to the middle and blends them into a new one | documented (method) | Super SloMo — "These flows are then linearly combined at each time step to approximate the intermediate bi-directional optical flows … Finally, the two input images are warped and linearly fused to form each intermediate frame." |
| on a fast bounce that guess can fail | documented (failure type) | Super SloMo — the approximated flows "only work well in locally smooth regions and produce artifacts around motion boundaries"; without understanding occlusions "it may result in severe artifacts in the interpolated frames, especially around motion boundaries". F. Reda et al. (Google), "FILM: Frame Interpolation for Large Motion", ECCV 2022, https://arxiv.org/abs/2202.04901 — large scene motion poses "a major challenge for existing interpolation methods"; Fig. 1 compares a 50% blend of two photos (a doubled image) with ABME "showing large artifacts". Xu et al., "Quadratic Video Interpolation", NeurIPS 2019, https://arxiv.org/abs/1911.00627 — "Existing video interpolation methods usually assume uniform motion between consecutive frames and use linear models … which cannot well approximate the complex motion in the real world." |
| the blend shows both balls | illustrative (consequence of the documented blend) | When the two moved frames disagree, a linear blend of them contains both positions at partial strength (cf. FILM Fig. 1, "blended with 50%"). The video's doubled ball is drawn, not a recording of a specific product's output. |
| smooth isn't proof; step through the original frames | advice following from the sources | The in-between frames are generated (Samsung: "AI-generated intermediate frames"); only the recorded frames were captured. |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse video feature. |
Not used: product-specific failure rates, claims about any phone's current quality, DLSS/TV motion smoothing.
Illustrative (not measured): the ball and positions, the arrows, the timeline (9 tiles; real every 4th), the phone screens
(EXAMPLE; generic), the "fast bounce" timing.

## Storyboard (cues.js)
1. 0–3.28 hook: one coral ball frozen twice (see-through) in a gridded video frame with brackets; A FRAME THAT / NEVER HAPPENED.
2. 3.28–5.15 DOCKET's phone: Slow-mo · AI; made-up frames (amber) pop in between real ones (mint) (AI SLOW-MO).
3. 5.15–8.85 card: REAL 1 / ? / REAL 2 (TWO REAL FRAMES); arrows on the ball's pixels, dots on the still floor (MOTION GUESS).
4. 8.85–12.85 both frames slide to the middle and blend into one ball → AI-MADE (MOVED + BLENDED).
5. 12.85–17.3 3D: the real ball drops out of frame and back (fast bounce); the straight guess arrow → ✗ (GUESS FAILS); the blend
   shows both balls (BOTH BALLS) — the hook frame explained.
6. 17.3–20.7 card: REAL 1 ✓ / AI-MADE ! (both balls) / REAL 2 ✓ (NEVER HAPPENED).
7. 20.7–26.85 phone: smooth slow-mo playback (SMOOTH ≠ PROOF) → Original: frame 1 → frame 2 (CHECK THE ORIGINAL).
8. 26.85–30 CTA "Download the / [icon] Ideaverse app."
Thumbnail: the hook scene + "NEVER / HAPPENED".

## QA / status — DELIVERED 2026-11-19
- Output: production/30s/2026-11-19-english-22/ideaverse-30s-english22-01.mp4 · sha256 4ba2ea80…a7a5, plus
  ideaverse-30s-english22-01-thumbnail.png ("NEVER / HAPPENED"). QA.md in that folder.
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −15.0 LUFS / −2.3 dBTP.
- English ASR on the final MP4: all eight lines MATCH, no word outside its caption; caption band y 282–458 inside x 100..900
  (SPEC PASS); text-free above the band.
- Frames: 900 in 1453 s (3 workers) + re-renders 98–170 (card content at the cut) and 620–805 (no easel in the phone shots);
  score re-mixed.
- Limitation: ASR-only listening check (no by-ear listen possible here).
