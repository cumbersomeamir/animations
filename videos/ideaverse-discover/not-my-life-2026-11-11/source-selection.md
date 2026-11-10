# Source selection — "Not My Life" (Ideaverse Discover, 25 s)

All picture content in the film that shows a Discover result or Discover UI comes from two genuine screen
recordings of the Ideaverse app. Nothing in the interface was drawn, recreated or animated by hand; results
that the source does not contain (underwater dinner, Tokyo night, floating spaceship) are **not** shown or
claimed — real Discover results stand in for them in clearly replaceable slots.

## 1. Sources

| id | file | where it came from | spec | SHA-256 |
|---|---|---|---|---|
| `clip` | `assets/sources/01-discover-personalized-gallery.mp4` | conversation attachment = Drive `clips/01-discover-personalized-gallery.mp4` (identical size 8,889,273 B) | 720×1600, 30 fps CFR, 36.967 s, 1109 frames, silent | `3f3640166dc41de1008afb43dd15e7f397e45ca42bf4ad930fe11e393435cce2` |
| `raw` | `cache/sources/raw-01-discover-personalized-gallery.mp4` (not committed, 52 MB; `scripts/fetch_sources.sh`) | public Drive folder `raw/01-discover-personalized-gallery.mp4` (id `1XxbbWl8l17OgWZphjQYWOrp_KXzXytcy`) | 720×1600, variable frame rate, 220.02 s, 1578 frames, silent | `8f22d25ba9abfbd208ce0fdf1984a19f7bef37b3e29256a26ab46eecd412f9a2` |

Drive `RECORDING-NOTES.md` (read): debug build 1.0.7 (53), demo mode off, existing signed-in account; raw takes
contain inspection pauses; *some raw inspection captures include a restaurant notification — avoid those*.
Check performed: the status bar (y 0–80) of every one of the 228 raw frames used was compared with the clean clip
status bar; all match (max mean difference 4.9/255, identical icons — no notification visible).

## 2. What the recordings actually contain (frame-by-frame inspection)

Inspection method: every clip frame decoded (1109 PNGs) and consecutive-frame differences computed; raw decoded
with its true timestamps (VFR); contact sheets at 1 fps / 0.5 fps plus full-size key frames; grid tiles
template-matched (Lanczos-scaled, mean absolute error) against full-size viewer images.

### Clip (`clip`, timecodes = seconds / frame index at 30 fps)
| time | frames | content |
|---|---|---|
| 0.000–7.967 | 0–239 | Discover grid, top state: credits bar, "5 images · 0 videos · 5s", "Customize Mix", chips You/Friends/Business/Brand/Product, 3×3 tiles (selfie; *brand* office portrait; couple at cafe; *product* curry ×2; couple; fire portrait; *product*; *brand* blue tech room), nav Discover/Chat/Social/News/Explore. Static apart from compression noise. |
| 8.000 | 240 | hard cut to viewer "Discover · 2 of 30 · Swipe up or down": young man in black, Tensorblue office (still). |
| 17.267–18.133 | 518–544 | real swipe to 3 of 30. |
| 18.167–21.000 | 545–630 | 3 of 30: couple at cafe (still). |
| 21.033–21.900 | 631–657 | real swipe to 4 of 30. |
| 21.933–24.733 | 658–742 | 4 of 30: young man with a bowl of curry (still; the steam is part of the image). |
| 24.767–24.967 | 743–749 | back to the grid (top state). |
| 25.000–36.967 | 750–1108 | **6 of 30 plays as motion**: the couple at the cafe smile, turn to each other and back; mute-toggle icon bottom-right. 24 fps cadence inside the 30 fps recording (every 5th frame repeats). Loop restarts at frames 795 (26.500 s), 950 (31.667 s) and 1106 (36.867 s) → loop ≈ 5.17 s. Note: the grid header in this session reads "0 videos"; this is reported as observed and not interpreted. |

### Raw (`raw`, pts seconds)
| pts | content |
|---|---|
| 0–~144 | grid, then 2 of 30 held (inspection pause). |
| ~150–172 | swipes to 3 and 4 of 30, back to grid. |
| **173.951–174.887** | **real grid scroll** (0 → 671 px) revealing rows 3–5: fire portrait, product, *brand* blue tech room, couple, **night-street portrait**, **fire portrait 2**, *brand* TensorBlue screens, *product* (holding a plate), *brand*. |
| 177.849–178.37 | tap → viewer "6 of 30" loading state (black image area), then the video appears. |
| 178.37–218.03 | 6 of 30 plays and loops (jumps at 186.36, 191.54, 196.71, 201.91, 207.08, 212.28, 217.45). |
| **218.035** | viewer closes back to the scrolled grid; last frame 219.920 (index 1577). |

Tile geometry (720 px space): columns x 0–238 / 240–478 / 480–718; tile height 317, row pitch 319; scrolled state
= top state − 671 px. A tile shows its result scaled to 238 px wide, centre-cropped (offset 20 px).
Matches (mean abs. error /255): top r1c3 ↔ 3-of-30 image 4.5; top r1c2 ↔ 2-of-30 8.2; top r2c1 ↔ 4-of-30 8.6;
**scrolled r4c1 ↔ 6-of-30 video loop in-point (clip frame 795) 8.4**.

## 3. Strongest results and how each is used

| film use | source pixels | why |
|---|---|---|
| Hook phone screen (f0–89) and outro (f660–749) | raw idx 1577 (219.920 s): scrolled grid, real UI | Same state the viewer closes to at 218.035 s, so the loop is real behaviour end-to-end. |
| `opening-character` slot | clip frame 795 (26.500 s), image region x100–620 y100–990 (icons excluded) | The camera dives into grid tile r4c1, which *is* this frame (match 8.4) — the "photo of me that never happened". |
| `superhook-motion` slot ("THEN ONE MOVED.") | clip frames 795–893 (26.500–29.767 s), x110–610 y100–990 | **Real video result motion** (no fake animation). Freeze on slot frame 12 (clip 807) for 0.5 s, motion from 4.000 s. |
| `reveal-01-underwater` stand-in | clip frame 700 (23.333 s), 4-of-30 curry dinner, y95–1055 | strongest dinner result; NOT underwater. |
| Feed proof (f248–284) | raw 173.90 s (held 8 frames) + 173.951–174.884 s in real time | real Discover scroll, UI legible (crop/enlarge ×1.5), proves the feed. Only change: editorial zoom out of tile r2c1 / into tile r4c2. |
| `reveal-02-tokyo` stand-in | raw idx 1577, tile r4c2 (night street portrait), 238×317 → 720×960 Lanczos ×3.03 + mild unsharp | most "night city" result available; NOT Tokyo. |
| `reveal-03-space` stand-in | raw idx 1577, tile r4c3 (fire portrait), same upscale | strangest result available; NOT a spaceship. |
| Payoff phone screen (f480–749) | raw 212.035–219.920 s real time, then held | 6-of-30 playing inside the real viewer UI, then the real close-to-grid at exactly 22.000 s. Includes the two real loop restarts of that video at film 16.245 s and 21.415 s (raw 212.28 / 217.45). |
| `payoff-spaceship` stand-in world | raw idx 1577, tile r3c3 (dark blue tech room, *brand*) below its badge, 150×267 → 1440×2560, shown depth-blurred (σ 7–11 px) | darkest, most sci-fi-like real result; extremely low resolution, so it is only used as a defocused backdrop. NOT a spaceship. |
| Payoff floating cards | slot posters of reveal-01/02/03 + `assets/plates/card-couple.png` (clip frame 600, 3-of-30) | layered environment from real result pixels. |
| Thumbnail | superhook slot frame 72 (clip frame 867, 28.900 s) | the couple looking at each other — strongest single frame. |

The office portrait (2-of-30) is deliberately **not** the hero: it appears only in the real grid UI. The hero is
the couple result because it exists as both a still tile and a real moving result.

## 4. What is editorial (not product)

- 3D phone body, lighting, depth of field, motion blur, grain, vignette.
- Reveal environments: teal caustics + bubbles (R1), neon bokeh + rain + floor reflection (R2), stars + nebula + embers (R3), dust motes (payoff). They surround the result cards; result pixels are never re-painted.
- Camera moves on stills (push, crane, truck, dolly-zoom), the 3D "swipe" of the superhook card, match cuts into/out of grid tiles, the tile-to-full-resolution overlay during the dive.
- Typography: "NEVER HAPPENED.", "THEN ONE MOVED.", "Which life would you pick?" (Inter Display, OFL).
- Nothing claims that Discover produces underwater / Tokyo / spaceship results, video "pop-out" or any feature. No logo intro, no download/pricing/feature claims, no end card. "Ideaverse" appears nowhere outside actual UI (it is not visible in the used UI either).

## 5. Tools, not used, and limits

- Used: Three.js 0.170 (WebGL2 via headless Chromium/SwiftShader, Playwright), Python (NumPy, Pillow, SciPy), FFmpeg 6.1 (libx264, AAC).
- Not used: Blender, Remotion (not needed: one deterministic Three.js scene covers 2D and 3D), Higgsfield, Google Flow, any paid or generative API, any AI upscaler (only Lanczos).
- Low-resolution stand-ins: grid tiles are 238×317 px originals; reveal-02/03 and the payoff world are therefore soft by nature. They are temporary.

## 6. Music and sound — origin and licence

- **Original composition**, 120 BPM, D minor (Dm9 – B♭maj7 – Gm7 – A7sus4 – Dm – B♭9 – Gm9 – A7 – B♭maj9 – F/A – Gm11 – B♭maj7 – A7sus4 → loops into Dm9).
- Every sound is synthesized by `scripts/audio.py` from oscillators and noise (PolyBLEP saws, sines, FM bells, filtered noise, algorithmic reverb). **No samples, loops, stock music, third-party or AI-generated audio, and no voice/TTS.**
- Created for this project; no third-party rights involved — free to use, modify and publish with the film.
- Two mixes: `mix_full` (score + SFX, −14 LUFS integrated, ≤ −1 dBTP) and `mix_nomusic` (SFX only, ≈ −15.5 LUFS).
- Loop: the timeline is rendered from −2 s to 31 s and folded modulo 25 s; limiter computed circularly → the audio is exactly periodic.
