# 15 — Round `2026-11-03-round-02` · 30s · episode 01

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-03-round-02/tensorblue-30s-round02-01.mp4`
(copied to `production/30s/2026-11-03-round-02/production-notes.md`). All earlier MP4s are preserved unchanged.

## Brief (user-approved, 3 Nov 2026)
- **Topic:** Why a photo looks blurry when you zoom in — raster pixels versus vector shapes. A photo enlarges into coloured squares; a simple vector logo stays smooth because its outline is redrawn. Ordinary-viewer level; no idempotency/research jargon. Cite Adobe/MDN.
- **History check:** not covered before (earlier episodes: CDN edge caches, optimistic updates, idempotency keys), so the proposed topic was used as given.
- **Sheet feedback implemented:** "Current style is fine." Keep the Blue Receipt Theatre grammar, the official tensorblue.com palette and logo, the accepted caption treatment, voice, pacing and CTA. Use simpler content and readable examples, not an abstract moving-line research diagram. No redesign, no wholesale context rewrite.
- **Design references:** the brief mentions attached design references, but no attachment reached this Code session; the episode follows the written direction (simple, readable, everyday example).

## What was kept exactly (accepted)
Renderer/kit `src/brt.mjs` (copied unchanged from the feedback round); captions Inter SemiBold 54 px inside y 340–520, x 90–990; blue wipe transitions; tactile cards with contact shadows; isometric slab; Kokoro `af_bella`×0.7 + `am_puck`×0.3, en-us, speed 0.98 (cached, offline); quiet per-scene score without loops; the CTA scene and line "Follow Tensorblue for software explained simply." with the `[Tensorblue](/tˈɛnsəɹblˌu/)` override.

## Final script (as spoken; 75 words, 23.9 s of speech)
| id | time (s) | line |
|---|---|---|
| L1 | 0.30–2.31 | Why does a photo get blurry when you zoom in? |
| L2 | 3.10–8.13 | It's usually a raster image: a fixed grid of tiny coloured squares called pixels. |
| L3 | 8.48–12.53 | Zoom in, and each pixel just gets bigger, so edges turn into steps. |
| L4 | 12.88–15.26 | Many apps smooth those blocks, which looks blurry. |
| L5 | 15.61–21.04 | A vector logo stores shapes as points and curves, so it's redrawn sharply at any size. |
| L6 | 21.40–23.85 | Zooming can't add detail a photo never captured. |
| L7 | 26.20–28.75 | Follow Tensorblue for software explained simply. (accepted CTA) |
Qualifications are inside the sentences: "usually" (most photos are raster files), "Many apps" (the smoothing algorithm is app-dependent).

## Source → claim map (read 2026-11-03)
| claim | source | what it says |
|---|---|---|
| A photo is usually a raster image: a fixed grid of coloured squares called pixels | **MDN Glossary — Raster image** https://developer.mozilla.org/en-US/docs/Glossary/Raster_image ; **Adobe — Raster vs vector** https://www.adobe.com/creativecloud/file-types/image/comparison/raster-vs-vector.html ; **Adobe — Raster files** https://www.adobe.com/creativecloud/file-types/image/raster.html | MDN: "A raster image is an image file defined as a grid of pixels… Common raster image formats on the Web are JPEG, PNG, GIF, and ICO." Adobe: "Raster files are images built from pixels — tiny color squares that, in great quantity, can form highly detailed images such as photographs." "Digital photos and detailed graphics both come in raster form." |
| Zoom in and each pixel just gets bigger; edges turn into steps | Adobe raster-vs-vector (above); **MDN — image-rendering** https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering | Adobe: "If you zoom in or expand the size of a raster image, you start to see the individual pixels." MDN: scaling may occur "due to user interaction (zooming)"; nearest-neighbour scaling "preserves contrast and edges… no blurring or color smoothing occurs." |
| Many apps smooth those blocks, which looks blurry | MDN image-rendering (above); Adobe raster files (above) | MDN: `smooth` — "scaling algorithms that 'smooth' colors are acceptable, such as bilinear interpolation"; `auto` — "The scaling algorithm is UA dependent." Adobe: "because their pixel number is fixed, raster images can become distorted or blurry when resized." |
| A vector logo stores shapes as points and curves, so it's redrawn sharply at any size | Adobe raster-vs-vector; **Adobe — Vector files** https://www.adobe.com/creativecloud/file-types/image/vector.html ; **MDN — SVG** https://developer.mozilla.org/en-US/docs/Web/SVG | Adobe: "Vector files use mathematical equations, lines, and curves with fixed points on a grid… There are no pixels in a vector file… you can scale a vector image up or down without impacting its quality." "a logo saved in vector format can't 'lose resolution'". MDN: "SVG-format vector images can be rendered at any size without loss of quality." |
| Zooming can't add detail a photo never captured | Adobe raster files (above) | "because their pixel number is fixed… Increasing the size of an image with too few pixels can cause pixelation." Enlarging resamples the existing pixels; it does not recover detail that was never recorded. |
| On-screen tip: "keep logos as vectors (SVG)" | Adobe vector files (above) | "the vector format is better for drawing logos, diagrams, and illustrations." |

**Illustrative, not claims:** the "photo" is an original 140 × 170 px blue-hour landscape rendered in code (real pixels, shown with and without smoothing); zoom percentages are UI labels. The vector logo is the real `tensorblue-logo.svg`, drawn from its own path data (anchors and curve handles are the file's actual Bézier points).

## Storyboard as built (6 scenes, 5 blue wipes)
| time (s) | scene | what happens | sound |
|---|---|---|---|
| 0–2.7 | **S1 Hook** | Frame 0: a printed photo card "photo.jpg 100%". It zooms to 800% on the moon's edge; the chip counts up; the view goes soft; kinetic "Why so **blurry?**" | soft slide, type thumps |
| 2.7–8.3 | **S2 Raster = pixel grid** | Wipe →. The same 800% view turns into the real square pixels on "raster"; the grid draws on "fixed grid"; chip "photo.jpg · 140 × 170 pixels"; one blended edge pixel lifts out as a tile: "1 pixel = 1 colour". | clack, carve ticks, clack, blip |
| 8.3–15.4 | **S3 Steps → blur (before/after)** | Wipe ←. Left "100%" view with the zoom box; the right "800% · pixels" panel pops out of it; the ridge's pixel staircase is outlined on "steps" ("edges become **steps**"). On "smooth" the same panel becomes "800% · smoothed" and goes soft ("smoothed = **blurry**"). | slide, type, carve, slide, type |
| 15.4–21.2 | **S4 Vector + isometric stage** | Wipe ↑. Card "logo.svg" with the official drop; its 4 anchor points and curve handles appear ("points + **curves**"). The card moves onto the slab; smaller copies appear: three sizes, all sharp ("redrawn at **any size**"). | clack, carve, blip, slide, blips |
| 21.2–25.9 | **S5 Same zoom, different result + takeaway** | Wipe →. "photo.jpg · 800%" (fixed pixels) beside "logo.svg · 800%" (the drop's curve redrawn sharp); kinetic "Zoom can't add **detail**"; on the chime: "Tip: keep logos as vectors (SVG)". | clack, type, chime |
| 25.9–30.0 | **S6 CTA (accepted, unchanged)** | Wipe ↑. Logo drop, "Tensor**blue**", "software explained simply", Follow pill. | soft clack, thump, tap |

## Provenance and licences
Original code: `production/30s/2026-11-03-round-02/src/` (`scene.mjs` new; `brt.mjs`, `render.mjs`, `qa.mjs`, `tts.py`, `asr.py`, `export-qa.sh` reused; `mix.py` reused with this episode's six scene chords). Logo: `assets/brand/tensorblue-logo.svg` (user's own site, see `assets/brand/SOURCE.md`). Fonts: Inter / Inter Display (SIL OFL 1.1). Voice: Kokoro-82M (Apache-2.0), cached `hexgrad/Kokoro-82M` rev `f3ff357`, offline. Music/SFX synthesized. No paid APIs, Blender, secrets or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-03-round-02/tensorblue-30s-round02-01.mp4` · SHA256 `190f0dafff1910590fa9c6a11a8b88d6ac6da7c6b1b6e03ac730c04a7a1d3b50` · 3,137,134 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, ~0.64 Mb/s, `+faststart` |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo ~189 kb/s |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.1 LUFS**, LRA 3.6 LU, **−1.8 dBTP** |
| captions | ink y 340–520, x 90–990, ≤ 2 lines | all 10 groups pass: ink y 371–488, x 113–965 |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| narration (one ASR pass) | intelligible | faster-whisper base.en heard every word; WER 1.3 % = the spelling "colored" vs caption "coloured" only; no low-confidence words; mean word-start drift 0.11 s (max 0.38 s) |
| scenes | mechanism moves with narration | 6 scenes / 5 wipes; `qa/contact-sheet-1fps.png`, `qa/transitions.png` viewed |

The ASR pass ran on the export just before the last visual tweak (panel entry, tip pill); the narration/mix input (`audio/mix.wav`) is byte-identical in the final file.

**Fixed during QA:** filename label overlapped the photo (polaroid strip); lifted pixel was white-on-white and overlapped the size chip (blended edge pixel, moved); 800% panel missed the ridge (re-targeted to the diagonal); logo cards floated above the slab and overlapped (placed on the slab's centre line, spread); comparison panel showed the logo's inside, not its edge (re-targeted to the curve); 800% panel appeared as an empty dark box for ~0.6 s (now pops in filled); 2 s static hold after the takeaway (tip appears on the chime).

**Known limits:** I can't listen; clarity rests on ASR + loudness/true-peak checks. The attached design references were not available in this session. There is no Desktop/video-review folder in this cloud container, so the finished MP4 is delivered as the chat attachment and on the branch.
