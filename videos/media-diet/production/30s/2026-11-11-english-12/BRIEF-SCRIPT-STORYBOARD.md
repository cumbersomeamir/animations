# 27 · English episode 12 (30 s) — "Why is 500 km/h so hard?" (BYD YANGWANG U9 Xtreme, 503.17 km/h)

Output: `videos/media-diet/production/30s/2026-11-11-english-12/media-diet-30s-english12-01.mp4` (30.000 s, 1080×1920, 30 fps,
H.264 yuv420p + AAC). Separate thumbnail: `…/2026-11-11-english-12/thumbnail-english12-01.png` (1080×1920).
First episode under the approved feedback rules (context/26, read 11 Nov 2026). Start state: rules persisted and pushed (3fbc3af =
remote), no jobs. Earlier outputs untouched. Session user videos2@tensorblue.com (CLAUDE.md lists info@tensorblue.com; mismatch
noted, nothing changed). Commits by the session identity.

## Topic selection (recorded before rendering)
Scanned 4–11 Nov 2026 official announcements and reliable tech reporting (Verge, Ars, TechCrunch, Engadget, IEEE Spectrum, New Atlas,
Electrek, Wired, InsideEVs, NASA, SpaceNews, company newsrooms). Candidates: DARPA/Caltech ASTRA in-orbit truss assembly (5 Nov),
BYD robotic charging arm (10 Nov), Airbus/Qantas A350-1000ULR distance record certificate (flight was in July), Boston Dynamics
wheeled Atlas, hydrofoil kit, Phobos landing — rejected as less visual/physical or not new. Trend roundups and flying-car claims rejected.
**Selected:** the FIA-recognised 503.17 km/h single-direction run of BYD's YANGWANG U9 Xtreme on 1 Nov 2026 (FIA news 6 Nov 2026;
Guinness single-direction titles; BYD press release 6 Nov 2026). Visible physical contradiction: a battery car past 500 km/h, where
air resistance makes every extra km/h disproportionately expensive. Status: record run by a limited-production model (30 units),
customer cars at contract/production-planning stage — not a prototype claim, not yet a delivered product. Full source list, facts
vs calculations vs assumptions: the output folder's SOURCES.md.

## Story (Theory of Marketing) and pacing
thumbnail "500 KM/H / WHY HARD?" → hook 0–3.5 s (car at speed, 503.17 km/h readout, FIA tag) → super hook 3.5–5.3 s (needle strains at
500: "Why is 500 so hard?") → build-up + proof 5.3–20.2 s (air → drag ∝ v² → power ∝ v³ as a cube of blocks → 4³ vs 5³ = ×1.95 →
four motors 4 × 555 kW = 2.2 MW → constraint: heat, temperatures set before each run) → payoff/takeaway 20.2–26.2 s (+1 % speed puts a
slab on three faces = about +3 % power; it was one way, not a two-way average) → CTA 26.2–30 s (Media Diet sign).

## Narration = captions (approved English voice: Kokoro af_bella 0.7 + am_puck 0.3, 0.98, en-us) — 85 words, 26.5 s of speech
| id | start–end (s) | line |
|---|---|---|
| V1 | 0.15–3.34 | An electric car just broke five hundred kilometers an hour. (caption: 500 km/h) |
| V2 | 3.60–5.13 | Why is five hundred so hard? |
| V3 | 5.42–7.48 | Air. Drag grows with speed squared. |
| V4 | 7.78–9.88 | Power to beat it grows with speed cubed. |
| V5 | 10.18–13.15 | Four hundred to five hundred? Nearly double the power. |
| V6 | 13.45–16.28 | Its answer: four motors, two point two megawatts. |
| V7 | 16.60–19.94 | The catch is heat, so temperatures were set before every run. |
| V8 | 20.30–23.24 | One percent faster costs about three percent more power. |
| V9 | 23.60–25.99 | And it was one way, not a two-way average. |
| V10 | 26.30–29.42 | Follow Media Diet for the physics behind the headlines. (CTA) |
Every take transcribed exactly by Whisper medium before use (digits/percent as written in captions).

## Storyboard (one visual idea and one large label at a time; labels at y ≈ 1330, never in the caption band)
| shot | time (s) | picture | label |
|---|---|---|---|
| S1 | 0–3.5 | paper hypercar (generic, not a replica) on a closed desert straight at dusk, road and dust streaming | 503.17 km/h counter; small "FIA-recognised · Abu Dhabi · 1 Nov 2026", "editorial reconstruction" |
| S2 | 3.5–5.3 | paper speedometer, needle sweeps to 490 then strains toward the magenta 500 tick | — |
| S3 | 5.3–7.62 | side view, air flecks flow over the body; red drag arrow grows with v² | drag: speed² |
| S4 | 7.62–10.05 | 4×4 red square (drag) + cyan layers (× speed) → gold 4×4×4 cube | drag: speed² → × speed → power: speed³ |
| S5 | 10.05–13.35 | 4³ cube tagged 400 km/h beside a 5³ cube (500 km/h) building layer by layer | ×1.95 |
| S6 | 13.35–16.5 | car body turns translucent; four motors light one by one; blade-style battery in the floor | 4 × 555 kW → = 2.2 MW |
| S7 | 16.5–20.15 | battery glows hot, flecks rise, thermometer peaks; then settles into the green band | HEAT → ideal start temp |
| S8 | 20.15–23.5 | gold 5³ cube; three translucent slabs land on top/right/front | +1% speed → +3% power; "slabs exaggerated for clarity" |
| S9 | 23.5–26.2 | top-down road: cyan run arrow one way; faint return arrow that never happened | ONE WAY → no 2-way average |
| S10 | 26.2–30 | Media Diet sign hinges up beside the road | — (caption only) |

## Style
Layered Tech Cutaway paper diorama (accepted renderer core, paper stock, key light, PCF shadows, ACES, restrained bokeh, vignette);
dusk sand/road set added for this story; brand palette for labels and props. Captions: accepted Space Grotesk 700 50 px, baselines
414/478, auto-fit so every line stays inside x 100–900. No footage, photos, logos or liveries of the car or brands.

## QA / limits
Filled after render (see the output folder's QA.md).
