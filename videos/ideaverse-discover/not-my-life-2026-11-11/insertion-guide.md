# Insertion guide — replacing the temporary stand-ins

Film: 1080×1920, 30 fps, **750 frames (00:00:00:00 – 00:00:24:29)**, 120 BPM (1 beat = 15 frames).
Timecodes are `HH:MM:SS:FF` at 30 fps; `f` = film frame (0-based). Clip durations are fixed by the
manifest — replacements must have **at least** the listed frame count at 30 fps; extra frames are ignored.

Everything is driven by `manifest.json` (slots, UI plates, render parameters) and `scene/main.js`
(camera, layers, environments, titles). Do not generate personalised Google Flow clips into the UI layers.

## Layer model

| class | files | replace? |
|---|---|---|
| **Footage slots** (temporary stand-ins) | `assets/slots/*.mp4` (+ `.png` posters, refreshed automatically) | **yes** — this guide |
| **UI plates** (genuine recording) | `assets/ui/grid-scrolled.png`, `assets/ui/feed-proof.mp4` (+ `feed-proof-offsets.json`), `assets/ui/phone-screen-payoff.mp4` | **no** — only with a newer genuine screen recording |
| **Phone** | 3D body/glass/screen in `scene/main.js › buildPhoneWorld` (screen texture = UI plates) | no |
| **Editorial environment / motion graphics** | procedural layers in `scene/main.js` (caustics, bubbles, neon, rain, floor reflection, stars, nebula, embers, dust, halo, shadows); titles in `drawText` | optional |
| **Editorial plates** | `assets/plates/card-couple.png` (real 3-of-30 result) | optional |

## Workflow

```bash
# 1. put the new clips over the files below (same names, H.264 mp4 at 30 fps)
python3 scripts/prepare_assets.py --slots-only     # checks frame counts, refreshes posters + render cache
node scripts/render.mjs --workers 2                  # all 8 shots -> build/video.mp4
#    or only the touched shots, e.g. reveal-02 and payoff:  node scripts/render.mjs --shots 285,480
bash scripts/mux.sh                                  # out/not-my-life-25s.mp4 + -no-music.mp4 (audio unchanged)
python3 scripts/qa.py                                # report + contact sheets in build/qa/
```
Shot segments (first frame identifies the shot): 0–89, 90–104, 105–247, 248–284, 285–374, 375–479, 480–659, 660–749.
Rendering speed in this container (software WebGL): ≈ 2–6 s per frame and worker.

---

## 1. `opening-character` — `assets/slots/opening-character.mp4`

| | |
|---|---|
| film range | **f0–f89 · 00:00:00:00 – 00:00:02:29** (90 frames) |
| slot frames | 102 = 90 used + 12 tail handle · mapping `slotFrame = f` |
| placeholder | 520×890 still (clip frame 795 = 6-of-30 loop in-point; matches grid tile r4c1) |
| replacement spec | clean footage, ≈9:16 (renderer cover-fits to 520×890 aspect 0.584), ≥ 1080×1920, ≥ 102 frames; subject centred in the middle 80 % |
| source framing on screen | plane over grid tile **r4c1** of the real grid UI: screen px x 33–205, y 775–1069 (720×1600 screen space); maps slot crop x100–620 / y100–990 of the 720×1080 6-of-30 image |
| mask | rectangle, 8 px (screen-space) feathered edge; under it the real UI tile stays visible |
| opacity | 0 until **f19**, ramps to 1 by **f28** (driven by camera distance 1.28 → 0.93 units), 1 until f89 |
| camera move | continuous dive in phone space (monotone log-distance spline, key at loop-time 25.0/26.8/28.2 s): distance 2.15 → 0.462 (lands f54 · 00:00:01:24, window = 92 % of slot height, centred) → 0.432 at f89 (slow push); yaw 0.44 → 0, pitch 0.12 → 0, roll −0.04 → 0; screen lens-blur outside the tile fades out as the camera lands |
| transitions | **in**: loop seam — the move is continuous from f749 (no cut). **out**: hard cut on beat 6 to the black card f90. Title "NEVER HAPPENED." over this slot from f78 (00:00:02:18) |
| handles | head 0 (loop seam), tail 12 |
| note | if the new character differs from the real tile, f19–f28 reads as the photo resolving into the new image — intended. |

## 2. `superhook-motion` — `assets/slots/superhook-motion.mp4`

| | |
|---|---|
| film range | **f105–f191 · 00:00:03:15 – 00:00:06:11** |
| slot frames | 99: head handle 0–11, **f105–f119 hold slot frame 12** (0.5 s in-point freeze), **f120–f191 → slot 12–83** (`slotFrame = 12 + f − 120`), tail handle 84–98 |
| placeholder | 500×890 real motion: clip frames 795–893 (6-of-30 video, one seamless section of its 5.17 s loop) |
| replacement spec | 9:16 clean motion clip ≥ 1080×1920, ≥ 99 frames; the first moving frame (motion should read immediately) = slot frame 12; slot frame 12 must work as a still |
| framing | full-frame plane, 1.2 % overscan, cover |
| camera move | 5 % push-in f105–f168 (ease in/out); exit f165–f187 (5.50–6.25 s): plane lifts +2.9 u, moves back 1.6 u, tilts −0.42 rad (ease-in), corners round to 0.03 u → reads as a 3D swipe up into depth |
| transitions | **in**: hard cut from black card (f105, beat 7). Motion starts f120 (beat 8). **out**: overlaps reveal-01 rising (f166–f180); teal environment fades in under it from 5.45 s |
| text | "THEN ONE MOVED." f121–f152, centre (500, 1345) |
| handles | head 12, tail 15 |

## 3. `reveal-01-underwater` — `assets/slots/reveal-01-underwater.mp4`

| | |
|---|---|
| film range | **f160–f247 · 00:00:05:10 – 00:00:08:07** (visible from f166 · 00:00:05:16) |
| slot frames | 112 · `slotFrame = 12 + (f − 160)` · head 12, tail 12 |
| placeholder | 720×960 still: 4-of-30 curry dinner (clip frame 700, image y95–1055) — **stand-in, not underwater** |
| replacement spec | 3:4 card, ≥ 1080×1440 (or a 9:16 Flow clip pre-cropped to 3:4) |
| layers | card plane 0.75×1.0 u, corner 0.02 u + soft drop shadow; environment (kept): caustic backdrop z −3.6, light shafts z −1.4 (additive), 240 bubbles |
| camera move | card rises y −2.5 → 0, z +0.5 → 0, tilt 0.55 → 0 rad (f166–f180, ease-out, lands on beat 12 · 00:00:06:00); then crane-down push camera (0, 0.12, 2.78) → (0, 0, 2.32) f180–f247; card settles ry 0 → −0.07, rx 0 → 0.035 |
| transitions | **out**: cut f248 into the feed proof zoomed ×3.03 onto the real grid tile r2c1 (graphic match: card rect = tile rect), 12-frame zoom-out |
| end framing | card ≈ 1082 px wide, centred |

## 4. `reveal-02-tokyo` — `assets/slots/reveal-02-tokyo.mp4`

| | |
|---|---|
| film range | **f285–f374 · 00:00:09:15 – 00:00:12:14** |
| slot frames | 114 · `slotFrame = 12 + (f − 285)` · head 12, tail 12 |
| placeholder | 720×960 still: grid tile r4c2 night-street portrait (raw idx 1577), Lanczos ×3.03 — **stand-in, not Tokyo** |
| replacement spec | 3:4 card ≥ 1080×1440 |
| layers | card; mirrored reflection (34 % opacity, mip-blurred, fades over 75 % of its height) below floor y −0.58; kept: neon backdrop z −6, 190 bokeh, 950 rain streaks, wet floor |
| camera move | starts exactly where the feed push ends (card 1058 px wide, centred, beat 19); continues push 7 % to f295; truck right + pull back to (0.62, 0.07, 3.25), look-at x 0.2, card turns ry 0 → −0.30 (3/4 view) f292–f362; whip-pan right f357–f374 (look-at +3.6) |
| transitions | **in**: match cut from the real tile r4c2 push (f284 → f285). **out**: whip pan, cut f375 (beat 25) |

## 5. `reveal-03-space` — `assets/slots/reveal-03-space.mp4`

| | |
|---|---|
| film range | **f375–f479 · 00:00:12:15 – 00:00:15:29** |
| slot frames | 129 · `slotFrame = 12 + (f − 375)` · head 12, tail 12 |
| placeholder | 720×960 still: grid tile r4c3 fire-background portrait (raw idx 1577), Lanczos ×3.03 — **stand-in, not a spaceship** |
| replacement spec | 3:4 card ≥ 1080×1440 |
| layers | card + warm additive halo; kept: 1600 stars, nebula z −120, 320 embers |
| camera move | arrival from the whip (look-at x −2.2 → 0, f375–f386); card turns from a steep 3/4 angle to facing (ry 1.02 → 0, f375–f433), visible from the first frame; dolly-zoom: distance 9.2 → 2.5 and fov 42° → 28° (f384–f463); push-through f463–f479 (distance → 1.55, fov 26°) until the card overfills the frame |
| transitions | **out**: hard cut f480 (beat 32) to the phone screen close-up (graphic match frame-filling → frame-filling) |

## 6. `payoff-spaceship` — `assets/slots/payoff-spaceship.mp4` (background plate)

| | |
|---|---|
| film range | **f480–f749 · 00:00:16:00 – 00:00:24:29**, continuing across the loop into **f0–f53 · 00:00:00:00 – 00:00:01:23** (edge of frame around the phone until the dive covers it) |
| slot frames | 348 · `slotFrame = 12 + ((f − 480) mod 750)` → f480 = 12 … f749 = 281, f0 = 282 … f53 = 335 · head 12, tail 12 |
| placeholder | 1440×2560 still: grid tile r3c3 dark-blue tech room (raw idx 1577, below its UI badge), Lanczos — **stand-in world, not a spaceship** |
| replacement spec | 9:16 plate ≥ 1440×2560 (moving plates welcome; slot frames 281 → 282 must be continuous for a seamless loop). The phone covers the plate centre — keep the subject out of the middle third |
| layer | camera-locked backdrop behind everything (depth test off); uv centre/zoom from `manifest.render.payoffWorldCenter` (now [0.5, 0.64]) / `payoffWorldZoom` ([1.40, 1.48]); parallax: centre −0.06 × camera azimuth/elevation (rad); depth blur σ from `payoffWorldBlurPx` ([14, 20] plate px, wide → close; the stand-in is deliberately defocused so its subject reads as ambience); 45 % central falloff behind the phone. **For a sharp Flow spaceship plate set blur [2, 5], centre [0.5, 0.5], zoom [1.15, 1.25].** |
| kept above it | 4 floating result cards (posters of reveal-01/02/03 + real 3-of-30), dust motes, the phone with the **real** screen recording (`phone-screen-payoff.mp4`: 6-of-30 playing in the viewer, real close to the grid at f660), title "Which life would you pick?" f668–f728 |
| camera move | phone-space monotone spline keyed at loop-time 16 / 19 / 22 / 25 / 26.8 s: distance 2.02 → 4.5 → 4.15 → 2.15 → 0.462; yaw 0 → −0.30 → +0.14 → +0.44 → 0; pitch 0 → 0.09 → 0.04 → 0.12 → 0; roll 0 → 0.02 → −0.01 → −0.04 → 0. Phone float y = 0.035·sin(2πs/12.5), rot y 0 → 0.20 → 0.10 → 0.08. All periodic over 25 s → f749 flows into f0 |
| transitions | **in**: hard cut f480 from reveal-03; pull-back reveals the world (16.0–19.0 s). Cards fade 23.4–24.4 s. **out**: continuous push into the opening composition (loop) |

---

## UI plates (genuine; listed for completeness)

| plate | film | source |
|---|---|---|
| `assets/ui/grid-scrolled.png` | phone screen f0–f89 | raw idx 1577 (pts 219.920) |
| `assets/ui/feed-proof.mp4` (37 fr) | f248–f284 · 00:00:08:08 – 00:00:09:14 | raw pts 173.90 ×8 frames, then 173.951–174.884 s real time; full-bleed ×1.5 crop from y 110; zoom ×3.03 → 1 out of tile r2c1 (f248–f259), push ×2.96 into tile r4c2 tracked by `feed-proof-offsets.json` (f271–f284) |
| `assets/ui/phone-screen-payoff.mp4` (270 fr) | f480–f749 on the phone | raw pts 212.035–219.920 real time, last frame held; viewer → grid at f660 (pts 218.035) |

## Titles (motion graphics, `scene/main.js › drawText`)

Inter Display (OFL), white, centred on x = 500 (safe area x 100–900, y 230–1500), widths fitted ≤ 770 px.

| text | frames | position |
|---|---|---|
| NEVER / HAPPENED. | f78–f104 (over slot, then black card f90–f104 = 0.5 s) | centre y 960 |
| THEN ONE / MOVED. | f121–f152 | centre y 1345 |
| Which life / would you pick? | f668–f728 | centre y ≈ 390 |

## Audio

The score and SFX do not depend on slot content. Hits sit on: 0.0 (loop downbeat), 3.0 (black card), 4.0 (motion), 6.0, 9.5, 12.5, 16.0 (big), 22.0 (UI close tick). Feed scroll ticks are derived from `feed-proof-offsets.json`. If timing is ever changed, edit `scripts/audio.py` and re-run it before `mux.sh`.
