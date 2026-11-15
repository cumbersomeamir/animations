# 30 · english-17 episode 01: "From broken to bought." (broken ceramic tile made into mosaic coasters and tabletops, English)

Batch `2026-11-15-english-17` (user-approved 15 Nov 2026, follows the delivered batch16). The Published-apps rules of 2026-11-11 and
the 2026-11-15 FIRST-FRAME rule are retained.
- **Language:** English narration and English captions only. Every line was synthesised fresh; no narration is reused.
- **Renderer and style:** the accepted **Scrap Shop X-ray** recipe (B), copied from `production/30s/2026-11-15-english-16/src/scene.html`
  with its 2026-11-11 adaptations. Mascot (simple open-lid can), palette, caption panel, voice and CTA are unchanged. Props (Voronoi-cut
  tile shards, coaster, grout, trays, stylised crockery figures, coaster set, glass, tabletop), scenes and text are new.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverables
- Video: `videos/wastepaisa/production/30s/2026-11-15-english-17/wastepaisa-30s-english17-01.mp4`
  SHA-256 `5f1402fc8d555773d7b3468678e0514e5214c9d94b601fd02b9c6ddaa5d4a2c8` · 13,375,856 bytes.
- Thumbnail (separate 1080×1920 PNG = the frame-zero composition, words "BROKEN TO BOUGHT"):
  `videos/wastepaisa/production/30s/2026-11-15-english-17/wastepaisa-30s-english17-01-thumbnail.png`
  SHA-256 `5547471f92ecec183e033d863852597fca7135500934ef6e64a08dcafefaa2bf` · 2,033,113 bytes.

## Start state, identity and topic decision
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at f2c892d (english-16) before
  edits. No render or job was running; earlier outputs were not touched, and batch16 was not repeated.
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The mapped
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **Topic kept (fresh):** "How broken ceramic tiles can become a product people buy".
  - The episode records and production notes were searched for ceramic, mosaic, tile, trencadís, coaster and upcycling.
  - Ceramics appeared only as a contaminant in glass cullet (english-08); no episode covers making a product from broken tile.
  - It is also the first value-addition (make-and-sell) episode; earlier episodes covered sorting and selling scrap.
- **Instagram reference** https://www.instagram.com/p/DfX3COQhs7s/:
  - Re-checked: still readable only as page metadata (dexter_zee1, Reel, 5 Nov 2026, ~21.6K likes) plus visible comments. The comments
    suggest the video is about turning hair into carbon or diamonds; several commenters ask who would buy it.
  - The video was not viewed; nothing about it is claimed beyond that.
  - The "who buys it?" question shaped this episode's spine: show the buyer's use, then what the price has to cover.

## 2026-11-15 FIRST-FRAME rule applied
- **Frame 0 is the composed subject:**
  - Broken tile shards mid-flight, converging onto a wooden coaster base; the centre shards have already clicked in.
  - By 1.2 s every shard is in place, and a gloss sweep shows the finished mosaic coaster.
  - The curiosity words "From broken to bought." (4 words) are on screen from frame 0, and the voice starts at 0.10 s. No logo, fade or
    empty setup.
- **The thumbnail is the same composition** with the brief's 3 words "BROKEN TO BOUGHT".
- **The words are truthful:** the episode shows how broken tile becomes a product with a buyer, and what its price has to cover.

## Final script (English narration = captions) · 71 words before the CTA, 29.6 s including the CTA
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.10–1.28 | From broken to bought. (big hook caption, on screen from frame 0) |
| L2 | 1.62–5.79 | Broken tile looks like rubble. So how does it become something people buy? |
| L3 | 6.14–10.24 | Chandigarh's Rock Garden is studded with broken crockery and tile. (city name with a phoneme fix, see below) |
| L4 | 10.59–14.16 | Sort the shards by colour, glue them on a base, and grout the gaps. (spoken "color") |
| L5 | 14.51–18.28 | Seal it, add felt, and it's a coaster set or a small tabletop. |
| L6 | 18.63–23.61 | Its price must cover materials, your labour and selling costs; the rest is profit. (spoken "labor") |
| L7 | 23.96–25.94 | So price one set before you make ten. |
| L8 | 27.20–29.68 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

Draft-stage change: L1 was first "Broken to bought." Both ASR engines heard "bot", so it became "From broken to bought.", which Whisper
hears correctly. Phoneme variants for "bought" were tested; Vosk still hears "bot" in every variant (see QA).

QA-stage change: the synthesiser said "Chandigarh's" roughly as "Chun-di-GURZ", and Whisper wrote it as "Chundegur's". The G2P
phonemes were replaced with /tʃʌndiːˈɡɑːrz/ ("Chun-dee-GARZ", closer to the Indian pronunciation), and Whisper then writes "Chandigarh's".
L3 grew by 0.12 s, so L4–L7, their scenes, labels and SFX all moved 0.12 s later.

## Research (accessed 15 Nov 2026). Facts, craft practice and illustrative assumptions are kept apart
- **R1, Nek Chand Foundation** (registered charity supporting Nek Chand's work): https://nekchand.org/?p=96
  - The Rock Garden of Chandigarh was assembled from "rocks, broken crockery and colored stones" set in concrete.
  - Nek Chand set up a network so that "broken crockery, tiles, rags and other discarded items could be brought to the garden for
    recycling".
  - Its figures are "pottery-encrusted concrete figures".
  - Source for L3.
- **R2 (background, not on screen), Park Güell, Barcelona** (official site):
  https://parkguell.barcelona/en/park-guell/emblematic-features/greek-theatre
  - "the undulating bench covered with tile-shard mosaic planned by Josep M. Jujol".
  - Fundació Catalunya La Pedrera describes the bench as "clad in polychrome ceramic trencadís"
    (https://www.lapedrera.com/en/work-antoni-gaudi/park-guell/).
  - Considered as the proof scene; the Rock Garden was chosen as the Indian example.
- **R3, mosaic method, WheatonArts** (nonprofit arts centre) mosaic coaster lesson: https://www.wheatonarts.org/?p=23491
  - Sort the shards by colour, attach them with tile adhesive leaving gaps for grout lines, let it dry overnight.
  - Mix sanded grout as directed, press it into the gaps, then wipe the excess with a damp sponge.
- **R4, finishing (common craft practice):**
  - Grout sealer for stain and water resistance: The Mosaic Store's coaster guide, read via a search extract because the page returned
    HTTP 402.
  - Felt glued to the underside: The Cottage Mama tile coaster tutorial (search extract).
  - The episode names these steps only; no product, quantity or safety procedure is given. Breaking or nipping tile is not shown: the
    shards are already broken.
- **Prices:** no verifiable price was found for mosaic coasters, adhesive, grout or sealer in India.
  - Marketplace listings vary and do not set a market price.
  - Following the brief ("only cite prices verified otherwise omit numbers"), the unit economics show no rupee figures.

### Illustrative unit economics (on-screen "ILLUSTRATIVE"; no numbers)
| Part of one set's price | Bar share on screen | Basis |
|---|---|---|
| Materials (base, adhesive, grout, sealer, felt; the tile shards are scrap) | 18 % | illustrative proportion only |
| Labour (sorting, setting, grouting, finishing time) | 34 % | illustrative proportion only |
| Selling costs (packing, platform or stall fees, delivery) | 20 % | illustrative proportion only |
| **Profit = price − the three costs** | **28 %** | arithmetic identity; the share is illustrative |
- The takeaway, "price one set before you make ten", is advice: cost one finished set first, then scale only if the price covers it.

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| From broken to bought (shards click into a finished coaster) | demonstration | No price or promise |
| Broken tile looks like rubble. So how does it become something people buy? (rubble heap; a shard lifts; PRICE ₹ ? tag) | perception plus question | No claim about waste volume |
| Chandigarh's Rock Garden is studded with broken crockery and tile (ROCK GARDEN · CHANDIGARH; stylised crockery-covered figures; magnifier on the shards) | R1 | Figures are generic and stylised, not copies of the sculptures |
| Sort the shards by colour, glue them on a base, and grout the gaps (SORT into three trays; GLUE ON A BASE; GROUT float pass) | R3 | No tool safety procedure needed (no cutting shown) |
| Seal it, add felt, and it's a coaster set or a small tabletop (SEAL gloss; flip to FELT pads; COASTER SET with a glass of tea; TABLETOP) | R3, R4 | Buyer use shown, no sales claim |
| Its price must cover materials, your labour and selling costs; the rest is profit (ILLUSTRATIVE; PRICE bar split MATERIALS / LABOUR / SELLING COSTS / PROFIT) | arithmetic identity | No numbers; proportions labelled illustrative |
| So price one set before you make ten (1 SET PRICED tag + tick; ×10 sets) | advice | Not a promise of sales |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; key light per scene; 0.35 s dissolve + depth push)
| Section | Time | Scene |
|---|---|---|
| Hook (frame 0) | 0–1.6 s | Shards mid-flight converge on a wooden base, inner first; all in by 1.2 s; gloss sweep (1.15–1.55); big caption from frame 0 |
| Escalation | 1.6–6.0 s | A heap of broken tile in the shop; RUBBLE? (2.94); one teal shard lifts and glows (3.63); a PRICE ₹ ? tag pops on "buy" (5.31) |
| Proof | 6.0–10.3 s | Five stylised crockery-studded figures rise in perspective; ROCK GARDEN · CHANDIGARH (6.77); a magnifier shows the broken crockery and tile (8.45) |
| Method | 10.3–14.37 s | The same 36 shards fly from a pile into teal/blue, mustard and terracotta/cream trays (SORT 10.65); they fly onto the base inner first (GLUE ON A BASE 12.15); a grout float wipes left to right (GROUT 13.23) |
| Product and buyer use | 14.37–18.47 s | SEAL gloss (14.57); flip to the felt pads (FELT 15.26); the coaster becomes one of a COASTER SET (16.25); a glass of tea set on it (16.72); a mosaic TABLETOP side table rises (17.12–17.57) |
| Money (illustrative) | 18.47–23.82 s | ILLUSTRATIVE tag; PRICE bar (18.84); MATERIALS (19.68), LABOUR (20.64), SELLING COSTS (21.18) fill from the top; the rest turns orange: PROFIT (23.01) |
| Takeaway | 23.82–27 s | One set with a "1 SET PRICED" tag and a tick (24.14–25.07); it shrinks into the first of ten sets, ×10 (25.52) |
| CTA | 27–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 27.2–29.68 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode, loudness, clipping:**
  - Whole decode exited 0 with 0 bytes of errors.
  - Loudness **−15.0 LUFS**, true peak **−1.5 dBFS**, LRA 4.0 LU.
  - Sample peak −1.51 dBFS, flat factor 0 (no clipped runs).
- **Captions** (900 frames logged, `qa/caption-bounds.json`): ink **x 131.6–868.4**, **y 345.5–514.5**, at most 2 lines; the hook caption
  is present at frame 0.
- **Timing and intelligibility** (ASR only; no listening possible in this cloud session; `qa/asr.txt`):
  - Vosk: mean word accuracy 0.823; L4 and L7 1.00; onsets and offsets within ±0.03 s.
    - Misses are near-homophones and word splits: "broken to"/"broke into", rubble/"rebel", buy/"by", "seal it"/"zealot",
      tabletop/"table top", its/"it's".
    - "bought" is heard as "bot" in every phoneme variant tested on the dry narration; Whisper hears "bought".
    - The city name and the brand are out of the Vosk vocabulary.
  - faster-whisper small: matches the script word for word apart from the brand spelling and the city, which it writes phonetically as
    "Chundy Gar's" (Chandi-garh's). On the isolated L3 line it writes "Chandigarh's".
- **Fixes:**
  - Script: "Broken to bought." was heard as "broken to bot" by both engines, so the hook became "From broken to bought."
  - Stills round 1:
    - A foggy dust ellipse over the rubble heap read as a glass dome, so it was removed.
    - A white light-sweep bar in the Rock Garden scene was distracting, so it was removed.
    - The bottom label "BROKEN CROCKERY + TILE" repeated the caption, so it was replaced with a magnifier on the shards.
    - The chai glass was too small to read, so it was enlarged (×1.6).
    - The "1 SET PRICED" tag covered the set, so the set moved left and the tag right.
  - Stills round 2: the magnifier moved down 50 px to clear the location label.
  - Thumbnail: the words touched the top shards, so they moved up 120 px.
  - First full render: Whisper wrote "Chundegur's", because the synthesiser said "Chun-di-GURZ". A phoneme fix gives "Chun-dee-GARZ";
    L4–L7, their scenes, labels and SFX moved 0.12 s later; then re-mixed, re-rendered and re-muxed. All QA above is on that final file.
- **Visual review:**
  - Stills of every scene (two rounds).
  - 50 transition and representative frames decoded from the export (`qa/contact-transitions.png`).
  - A full sheet every 1.25 s (`qa/contact-full.png`).
  - Frame 0 at full resolution.
- **Limits:**
  - No watched or listened check: two ASR engines and level meters only.
  - No prices: none could be verified, so the unit economics are an illustrative split with no rupee figures, and the bar proportions
    are illustrative.
  - The Rock Garden figures are stylised, not depictions of specific sculptures.
  - The seal and felt steps rest on craft tutorials, one of them read only through a search extract (HTTP 402).
  - The Instagram reference could only be read as page metadata and visible comments.
  - The Desktop/video-review folder isn't reachable from this cloud session; the MP4 and thumbnail are delivered as chat attachments and
    in the repo, and production files stay outside any review folder.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused. The Rock Garden figures are generic stylised shapes, not copies of
  any artwork.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its English model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
