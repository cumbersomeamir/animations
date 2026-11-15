# 29 · english-16 episode 01: "Same tyre. Different buyer." (truck tyre casings sorted for retreaders vs crumb, English)

Batch `2026-11-15-english-16` (user-approved 15 Nov 2026, follows the finished batch15). The Published-apps rules of 2026-11-11 and the
2026-11-15 FIRST-FRAME rule are retained.
- **Language:** English narration and English captions only. Every line was synthesised fresh; no narration is reused from earlier episodes.
- **Renderer and style:** the accepted **Scrap Shop X-ray** recipe (B), copied from `production/30s/2026-11-15-english-15/src/scene.html`
  with its 2026-11-11 adaptations. Mascot (simple open-lid can), palette, caption panel, voice and CTA are unchanged. Props, scenes and
  text are new. One renderer fix: `label()` now multiplies the scene alpha, so labels fade with their scene in transitions.
- **Copy:** this file is also in the output folder as `PRODUCTION-NOTES.md`.

## Deliverables
- Video: `videos/wastepaisa/production/30s/2026-11-15-english-16/wastepaisa-30s-english16-01.mp4`
  SHA-256 `30368bd1ff6889fe8470ed392e4895aceb012f76aa48400743a4f7adcefefce5` · 11,123,314 bytes.
- Thumbnail (separate 1080×1920 PNG = the frame-zero composition, words "SAME TYRE. DIFFERENT BUYER."):
  `videos/wastepaisa/production/30s/2026-11-15-english-16/wastepaisa-30s-english16-01-thumbnail.png`
  SHA-256 `dde59037d32fd1ef16c4fca65859a6c9f253ed4a6b8652e68133835f5d007af8` · 1,637,956 bytes.

## Start state, identity and topic decision
- **Repo and branch:** `cumbersomeamir/animations`, branch `claude-video/wastepaisa`, clean and in sync at 080b4b3 (english-15) before
  edits. No render or job was running, so nothing had to be queued; earlier outputs were not touched (english-15 was not repeated).
- **Identity:** commits are authored as Claude (noreply@anthropic.com) through this session's repo-scoped GitHub access. The mapped
  account (info@tensorblue.com) cannot be verified independently from inside the container.
- **Proposed topic rejected as covered:** "The scrap business mistake hiding inside mixed plastic" (sort compatible clean plastic streams
  before sale; mixed vs separated buyer specifications; hypothetical per-kg margin; hook "SAME BAG, DIFFERENT BUYER").
  - english-14 (context 27) already taught it: sort hard plastic by polymer (float/sink, resin code) before sale.
  - english-07 already taught sorted vs mixed plastic value.
  - A third plastic-sorting episode would repeat both.
- **Replacement, same genre and story criteria, the same hook shape ("SAME TYRE. DIFFERENT BUYER."):**
  - A worn truck tyre has two possible buyers: a retreader, who pays for a sound casing, or a crumb/recycling buyer, who pays by weight.
  - Inspecting and sorting before sale decides which buyer, so the same opportunity (sorting compatible streams before sale, with a
    transparent hypothetical margin that includes sorting, labour and transport) carries over to a material no episode has covered.
  - No earlier WastePaisa episode mentions tyres.
- **Other candidates rejected:**
  - Mattress foam: Indian recycling is described as nascent, and no foam scrap price could be verified.
  - E-waste EPR: the floor price is in litigation, and a ₹22/kg figure could not be verified.
  - Paper sub-grades: overlaps feedback-05.
  - Hair: weak, old data, and export restrictions apply.
  - Fan motors: falls under the e-waste rules.
- **Instagram reference** https://www.instagram.com/p/DfX3COQhs7s/:
  - Still readable only as page metadata: dexter_zee1, "Make Money ! From Hair ??!!", 5 Nov 2026.
  - The video was not viewed, and nothing about it is claimed beyond that.
  - Its "money from an overlooked material" angle informed the money-first framing only.

## 2026-11-15 FIRST-FRAME rule applied
- **Frame 0 is the composed subject:**
  - Two identical worn truck tyres side by side under a key light: the left with a warm rim light, the right with a cool one, hinting at
    two fates.
  - The 4 curiosity words "Same tyre. Different buyer." are already on screen; the big hook caption is forced visible from frame 0.
  - The narration starts at 0.10 s. No logo, fade or empty setup.
- **The thumbnail is the same composition with the same words,** so the first image works as the thumbnail.
- **The words are truthful:** the episode shows that the same worn tyre goes to a retreader or to crumb, depending on its casing.

## Final script (English narration = captions) · 69 words before the CTA, 29.6 s including the CTA
| Line | Time (s) | Caption text (spoken form where different) |
|---|---|---|
| L1 | 0.10–1.87 | Same tyre. Different buyer. (big hook caption, on screen from frame 0; spoken "tire") |
| L2 | 2.20–4.52 | One rolls again; the other becomes crumb. |
| L3 | 4.90–7.37 | India retreads about ten million tyres a year. (spoken "tires") |
| L4 | 7.70–11.42 | Retreaders need a sound casing: no cuts or separations. |
| L5 | 11.80–15.29 | So inspect each tyre, and sort casings from crumb tyres. (spoken "tire … tires") |
| L6 | 15.65–22.89 | Say ten tyres give six casings: after buying, sorting and transport, about ₹1,300 is left. (spoken "tires … thirteen hundred rupees") |
| L7 | 23.25–25.94 | Sold all as crumb, the same ten lose money. |
| L8 | 27.20–29.68 | Join WastePaisa and put your scrap to use. (accepted CTA, verbatim) |

Draft-stage changes:
- The first script ran 29.8 s of speech before the CTA, so it was tightened to 23.7 s.
- TTS uses the US spelling "tire(s)" so Kokoro pronounces it correctly; captions keep the Indian spelling "tyre(s)".

## Research (accessed 15 Nov 2026). Published facts, guidance and hypothetical assumptions are kept apart
- **S1, NITI Aayog, "Enhancing Circular Economy of Waste Tyres in India" (January 2026)** (primary, Government of India think tank; read
  in full via pdftotext): https://www.niti.gov.in/sites/default/files/2026-01/Enhancing-Circular-Economy-of-Waste-Tyres-in-India.pdf
  - **Volume:** India retreads about 10 million tyres annually.
  - **Practice:** retreading is practical mainly for truck and bus tyres. Market shares: trucks 65 %, buses 20 %, OTR 12 %, passenger 3 %.
  - **Performance:** a retread keeps 50–70 % of a new tyre's performance.
  - **Sector:** about one-third of more than 10,000 retreaders are formal (organised).
  - **Waste tyres:** about 1.53 MMT go to crumb rubber and 0.27 MMT to reclaim; crumb is a real, separate end market.
  - **Guidelines:** MoRTH AIS-064 covers retreading.
- **S2, BIS IS 15731:2018, "Automotive tyres — Selection and inspection of retreadable tyre casing"** (Indian Standard; title and scope
  from the BIS standards portal).
  - A June 2024 draft amendment (BIS TXD 07 document, read via a search extract; the BIS tmp files returned errors) says:
    - Inspection is by a skilled operator on a bead-spreading machine, under lighting above 3,000 lux.
    - Casings are cleaned and dried the day before, because punctures and liner splits can go undetected on wet or dirty tyres.
  - The episode therefore says only "inspect each tyre" and shows no inspection procedure.
- **S3, Apollo Tyres, truck tyre retreading guide** (manufacturer):
  https://www.apollotyres.com/en-in/stories/blogs/tyre-guides/truck-tyre-retreading-benefits/
  - A casing is a good retreading candidate if it is structurally sound and free of major damage such as cuts or separations.
  - Source for L4's wording.
- **Not found:** no published price per casing or per kg of crumb tyre for India.
  - A trade article (search extract only) put the casing at about one-third of a tyre's cost.
  - All money on screen is therefore a labelled HYPOTHETICAL. No market price or "lakhs" promise is made.

### Hypothetical ledger (on-screen "HYPOTHETICAL"; 10 worn truck tyres, ~50 kg each assumed = 500 kg)
| Item | ₹ | Basis |
|---|---|---|
| 6 sound casings sold to a retreader × ₹1,500 | 9,000 | assumption |
| 4 crumb tyres: 200 kg × ₹5/kg | 1,000 | assumption |
| **Sales** | **10,000** | arithmetic |
| Buying the 10 worn tyres × ₹500 | −5,000 | assumption (one price per tyre, before inspection) |
| Sorting and inspection: one worker-day | −700 | assumption near the Delhi unskilled minimum wage (≈₹710/day; April 2025 revision as reported; a 2026 notification was not confirmed) |
| Transport: one mini-truck day | −3,000 | assumption |
| **Left (profit)** | **≈1,300** | arithmetic (≈₹2.6/kg on 500 kg) |
| Same ten sold all as crumb: 500 kg × ₹5/kg | 2,500 | assumption; no sorting step, so no sorting cost |
| **All as crumb: 2,500 − 5,000 − 3,000** | **−5,500** | arithmetic (a loss) |

Why the comparison is fair, and where it is limited:
- Both columns start from the same ten tyres, already bought at the same price, and carry the same transport.
- Only the sorting cost differs, and it is counted only where sorting happens.
- Real casing and crumb prices vary with tyre size, brand, casing age and region. The point is the mechanism (an inspected casing has a
  second buyer), not the numbers.

## Source-to-claim map
| Claim (spoken or on screen) | Sources | Safeguard |
|---|---|---|
| Same tyre. Different buyer. (two identical worn tyres) | S1, S3 | Two fates shown next; nothing promised |
| One rolls again; the other becomes crumb (left tyre gets a fresh tread and rolls on, SECOND LIFE; right tyre goes into a shredder, CRUMB) | S1 | Schematic shredder; no process detail |
| India retreads about ten million tyres a year (≈10 MILLION, RETREADS A YEAR · INDIA; ten retread icons) | S1 | "about" + "≈" |
| Retreaders need a sound casing: no cuts or separations (X-ray sections: SOUND CASING ✓; CUT, SEPARATION marked) | S2, S3 | Schematic cross-section |
| So inspect each tyre, and sort casings from crumb tyres (a ring checks each tyre in a row; CASINGS stack vs FOR CRUMB stack) | S2, S3 | No inspection procedure shown or implied |
| Say ten tyres give six casings: after buying, sorting and transport, about ₹1,300 is left (HYPOTHETICAL; 6 CASINGS + 4 CRUMB; SALES ₹10,000; BUYING −₹5,000; SORTING −₹700; TRANSPORT −₹3,000; LEFT ≈ ₹1,300) | assumptions | "Say" + HYPOTHETICAL; costs incl. sorting/labour and transport; bar to scale |
| Sold all as crumb, the same ten lose money (SORTED +₹1,300 vs ALL AS CRUMB −₹5,500; HYPOTHETICAL NUMBERS) | assumptions | Same buying and transport; no sorting cost on the crumb side |
| Join WastePaisa and put your scrap to use | accepted CTA; `assets/listing.json` | No invented feature or payout |

## Storyboard (Scrap Shop X-ray, smooth 30 fps; point-cloud shop persists; key light per scene; 0.35 s dissolve + depth push)
| Section | Time | Scene |
|---|---|---|
| Hook (frame 0) | 0–2.1 s | Two identical worn truck tyres, warm vs cool rim light; big hook caption "Same tyre. Different buyer." from frame 0 (same continuous scene as the escalation, no dissolve) |
| Escalation | 2.1–4.8 s | Left tyre gains a fresh orange-edged tread (SECOND LIFE) and rolls off left; right tyre lifts as a shredder rises, drops in, crumb falls into a pile (CRUMB 4.03) |
| Proof: scale | 4.8–7.6 s | The retreaded tyre rolls back in from the left, shrinks into the first of ten retread icons; ≈10 MILLION pops on "ten" (5.92); RETREADS A YEAR · INDIA |
| Proof: what buyers need | 7.6–11.7 s | Two X-ray casing cross-sections (plies, belts, beads); SOUND CASING + tick (8.57–8.9); a red cut (CUT 10.01) and a separation (SEPARATION 10.55) on the second |
| Sort | 11.7–15.5 s | A row of ten tyres; a ring checks each one in turn and it flies to the CASINGS stack (warm, 13.75) or the FOR CRUMB stack (14.44); the mascot's eyes follow |
| Hypothetical ledger | 15.5–23.1 s | HYPOTHETICAL tag (15.71); 6 CASINGS + 4 CRUMB; to-scale bar SALES ₹10,000 (17.7); BUYING −₹5,000 (18.71); SORTING −₹700 (19.28); TRANSPORT −₹3,000 (19.94); LEFT ≈ ₹1,300 (21.11) |
| Takeaway | 23.1–27 s | Zero line: SORTED +₹1,300 bar up vs ALL AS CRUMB −₹5,500 bar down (24.0–25.2); HYPOTHETICAL NUMBERS; the mascot frowns |
| CTA | 27–30 s | Accepted English end card: icon, WastePaisa wordmark, "Put your scrap to use", mascot waves. Voice CTA 27.2–29.68 |

## QA (final export)
- **ffprobe:** **30.000000 s**; H.264 High **yuv420p 1080×1920**, 30/1, **900** frames; AAC-LC 48 kHz stereo, duration_ts **1,440,000**.
- **Decode, loudness, clipping:**
  - Whole decode exited 0 with 0 bytes of errors.
  - Loudness **−15.0 LUFS**, true peak **−1.4 dBFS** (the AAC encode adds 0.1 dB over the −1.5 dBTP loudnorm target), LRA 3.1 LU.
  - Sample peak −1.42 dBFS, flat factor 0 (no clipped runs).
- **Captions** (900 frames logged, `qa/caption-bounds.json`): ink **x 135.5–864.5**, **y 343.5–516.5**, at most 2 lines; the hook caption
  is present at frame 0.
- **Timing and intelligibility** (ASR only; no listening possible in this cloud session; `qa/asr.txt`):
  - Vosk: mean word accuracy 0.897; L3 and L6 1.00; onsets and offsets within ±0.03 s.
    - "retreaders" → "retractors" and "crumb" → "chrome" were already heard this way on the dry narration, where Whisper heard them
      correctly; they were kept because they are the trade terms.
    - "rolls" → "rose" and "as" → "his" appear only on the export; no SFX sits on those words.
    - "tyre"/"tire" is spelling only, and the brand is out of vocabulary.
  - faster-whisper small: matches the script word for word apart from the brand spelling.
- **Fixes:**
  - Script: the first draft ran 29.8 s of speech before the CTA, so it was tightened to 23.7 s.
  - Stills round 1:
    - The two-fates scene jumped between scenes (the right tyre changed size and position), so it now lifts from the hook position
      while the shredder rises.
    - The 10-million scene showed "≈0 MILLION" while counting up, so the number now pops on "ten"; the retread rolls in and becomes
      the first of ten icons.
    - The sorting queue drew all waiting tyres in one spot (read as one tyre), so it is now a row of ten with an inspection ring each.
    - The compare bars were small, so they were enlarged.
    - The all-as-crumb loss was corrected from −₹6,200 to −₹5,500: no sorting step, so no sorting cost.
  - Stills round 2: inspection rings now draw over neighbouring tyres; SORTED and ALL AS CRUMB got chips to separate them from the
    point-cloud lamp; the crumb pile was made denser.
  - First full render: the 2.1–2.45 s hook→split dissolve blended two identical tyre layers and dimmed them by about 20 %. The hook and
    split are now one continuous scene from t=0 (frame 0 unchanged; tyre-region difference between 0 s and 2.2 s is 1.3/255). The
    video was re-rendered and re-muxed; all QA above is on that final file.
- **Visual review:**
  - Stills of every scene (three rounds).
  - 46 transition and representative frames decoded from the export (`qa/contact-transitions.png`).
  - A full sheet every 1.25 s (`qa/contact-full.png`).
  - Frame 0 at full resolution.
- **Limits:**
  - No watched or listened check: two ASR engines and level meters only.
  - All money is hypothetical; India has no published casing or crumb-tyre price to cite, and real prices vary with size, brand,
    casing age and region.
  - The BIS draft amendment was read through a search extract (its files returned errors).
  - The casing "one-third of a tyre's cost" figure is a search extract only and is not used on screen.
  - The Instagram reference could only be read as page metadata.
  - The Desktop/video-review folder isn't reachable from this cloud session; the MP4 and thumbnail are delivered as chat attachments and
    in the repo, and production files stay outside any review folder.

## Provenance and licences
- Original Canvas2D code (this repo); the accepted renderer is reused.
- Kokoro-82M is Apache-2.0 and kokoro-onnx is MIT; espeak-ng G2P (GPL-3.0) was used as a tool, not shipped.
- Vosk and its English model are Apache-2.0; faster-whisper is MIT.
- Baloo 2 is OFL. The app icon is from the approved assets.
- Music and SFX are original (`education/pilot-01/audio/synth.py`).
- Models and caches stay in the scratchpad and are not committed.
