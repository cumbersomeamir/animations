# 30 — English-16 30 s #01: Florence Nightingale and the polar-area chart, "NOT THE WOUNDS" (second episode under the first-frame addendum, `25`)

- **Batch:** 2026-11-15-english-16 (the user's batch-16 brief, clarified on 2026-11-15: same job, exact output path below)
- **Video:** `videos/aarambh/production/30s/2026-11-15-english-16/aarambh-30s-english16-01.mp4`
  - sha256 `7198a45442f00b446e957304fadf4dff0e4c2e0886b7f91849d4e7213e0d388f`
- **Thumbnail:** `videos/aarambh/production/30s/2026-11-15-english-16/aarambh-30s-english16-01-thumbnail.png` (1080x1920 RGB; it is frame 0)
  - sha256 `2b762a6efcbfb5ae1ad54ae9605e5b999947892ebb45185e0e64814a90ab7c3b`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only; the established Meshline/Recall narrator (Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98). No earlier narration was reused.
- **Pre-flight (2026-11-15):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin at `dd76b9f` (english-15); the only untracked path was this batch's new folder (created after `test ! -e`). Account checked against CLAUDE.md. Earlier outputs are untouched.
- **Isolation note:** one `git log --all` call printed other app branches' commit titles. Nothing from them was opened, fetched or used; only Aarambh history and context were consulted.
- **Topic:** fresh. A grep for "nightingale" over `videos/aarambh` (excluding this batch) found nothing, so the brief's subject was used.
- **Batch-16 path:** the earlier reply's suggestion of a "2026-11-16" folder was wrong; the user's path `2026-11-15-english-16` is used.

## First frame (rule)
- **Frame 0 (t = 0):**
  - Henry Hering's real c. 1860 photograph of Florence Nightingale (left, tilted print) beside a crop of her real 1858 rose diagram, the April 1854 – March 1855 half (right, tilted print), on the spotlit dark-green desk;
  - the words "NOT THE / WOUNDS" (3 words, large) below.
- **No intro:** no logo, flicker, fade from black or fade-in. The scene's first state is drawn complete.
- **No caption at frame 0:** the first caption appears at 0.22 s.
- **Hook audio:** narration starts at 0.05 s and is audible from 0.08 s (`qa/first_frame.txt`).
- **Thumbnail = frame 0:** rendered from the same `drawFrame(0)`. Frame 0 of the export differs from it by 1.50/255 mean absolute difference (H.264 encoding only). Mean luminance 72.9/255.
- **Truthful words:** in her figures, wounds caused about 10% of the recorded deaths (1,758 of 17,982, April 1854 – March 1856); disease caused about 81% (14,476).

## Story structure (rule `25`)
| beat | time (s) | narration | picture |
|---|---|---|---|
| hook | 0.05–4.48 | "Most British soldiers who died in the Crimean War weren't killed by wounds." | frame-0 composition; slow push; light sweeps across the rose (0.30) and the portrait (0.50) |
| super hook / question | 4.80–6.00 | "So what killed them?" | hard cut with flash (4.74) to the full real 1858 diagram; slow push toward the large rose; big gold "?" |
| proof 1: read the chart | 6.10–10.26 | "In Florence Nightingale's chart, blue is death from preventable disease." | legend chips appear one at a time: blue = preventable disease, red = wounds |
| proof 2: the intervention | 10.60–15.30 | "After a sanitary commission flushed sewers in 1855," | whip pan (10.40–10.60) to the real 1857 Sanitary Commission report title page; gold underline; a pipe appears and water flushes the sludge through; label "sewers flushed"; stamp "1855" |
| proof 3: before vs after | 15.65–17.80 | "the blue shrank, even the next winter." | push (15.40–15.65) to two roses redrawn from her monthly rates, growing month by month: BEFORE (Apr 1854–Mar 1855) large, AFTER (Apr 1855–Mar 1856) small; the Dec–Feb wedges outlined in gold on both; "Jan 1855 2,761" vs "Jan 1856 42" "disease deaths"; small note "redrawn from her 1858 figures" |
| caveat | 18.45–22.86 | "Strong evidence, not certainty: one chart can't rule out other changes." | push (18.15–18.45): mini roses joined by an arrow "sewers flushed"; STRONG EVIDENCE, then NOT CERTAINTY; three grey "?" land on the arrow: "other changes?" |
| payoff | 23.20–26.16 | "Lesson: before calling it proof, ask what else changed." | page turn (22.85–23.20) to a cream page: circular portrait, "FLORENCE NIGHTINGALE", cards "before vs after" and "what else changed?" |
| CTA | 27.10–29.78 | "Download Aarambh to support livelihood tools." | CTA slide (26.70–27.10) to the Aarambh card |

## Final script (English; 68 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.05 | Most British soldiers who died in the Crimean War weren't killed by wounds. | — |
| S2 | 4.80 | So what killed them? | — |
| S3 | 6.10 | In Florence Nightingale's chart, blue is death from preventable disease. | — |
| S4 | 10.60 | After a sanitary commission flushed sewers in 1855, the blue shrank, even the next winter. | — |
| S5 | 18.45 | Strong evidence, not certainty: one chart can't rule out other changes. | — |
| S6 | 23.20 | Lesson: before calling it proof, ask what else changed. | — |
| S7 | 27.10 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

## Sources (accessed 2026-11-15)
- **[FA] Michael Friendly and RJ Andrews, "The radiant diagrams of Florence Nightingale",** SORT 45 (1), 2021, 1–16, DOI 10.2436/20.8080.02.77: https://www.idescat.cat/sort/sort451/45.1.0.friendly-andrews.prov.pdf
- **[PAN] Report to the Right Honourable Lord Panmure … of the proceedings of the Sanitary Commission dispatched to the seat of war in the East, 1855–56** (London, 1857). Wellcome Collection copy on the Internet Archive, `b24757354`: https://archive.org/details/b24757354 (text: `b24757354_djvu.txt`; title page = page n6).
- **[DATA] Nightingale's monthly figures, April 1854 – March 1856,** as transcribed in the R package HistData (dataset `Nightingale`; documented source Nightingale 1858, *Notes on Matters Affecting the Health, Efficiency, and Hospital Administration of the British Army*). CSV via Rdatasets: https://vincentarelbundock.github.io/Rdatasets/csv/HistData/Nightingale.csv (saved as `assets/nightingale-monthly-deaths-1854-1856.csv`).
- **[DIAG] Wikimedia Commons, "Nightingale-mortality.jpg"** (the real "Diagram of the Causes of Mortality in the Army in the East", with its printed legend): https://commons.wikimedia.org/wiki/File:Nightingale-mortality.jpg
- **[POR] Wikimedia Commons, "Florence Nightingale (H Hering NPG x82368).jpg"** (Henry Hering, c. 1860; National Portrait Gallery, London, x82368): https://commons.wikimedia.org/wiki/File:Florence_Nightingale_(H_Hering_NPG_x82368).jpg

## Claim map (measured, documented, interpretive, illustrative)
| claim | kind | basis |
|---|---|---|
| Most British soldiers who died weren't killed by wounds | measured (her records) | DATA: of 17,982 recorded deaths in the Army in the East, April 1854 – March 1856, 14,476 (81%) were disease, 1,758 (10%) wounds, 1,748 other. Scope: these 24 months cover the British army's campaign in the East; the narration says "the Crimean War". |
| blue is death from preventable disease | documented | DIAG legend: the blue wedges represent "the deaths from Preventible or Mitigable Zymotic diseases"; FA Fig. 1: "preventable zymotic diseases (outer, blue wedges)". The diagram's red = wounds (FA calls it pink); grey/black = other. |
| a sanitary commission flushed sewers in 1855 | documented | PAN digest: "Sanitary measures adopted, for clearing, cleansing, removing nuisances, improving ventilation, trapping and flushing sewers and privies, filtering the water, quicklime washing the walls"; FA: "a Sanitary Commission was formed around April 1855". Other accounts give March 1855 for its arrival, so the narration says only "in 1855". |
| the blue shrank | measured | DATA: disease deaths 11,157 in April 1854 – March 1855 vs 3,319 in April 1855 – March 1856, while the recorded army was larger (e.g. January 32,393 vs 44,212). FA: her two-panel design "makes a direct comparison of the deaths before the arrival of the Sanitary Commission with those after". |
| even the next winter | measured | DATA: disease deaths Dec–Feb 1854–55 were 1,725, 2,761, 2,120; Dec–Feb 1855–56 were 91, 42, 24. This weakens a purely seasonal explanation. On screen: "Jan 1855 2,761" vs "Jan 1856 42". |
| Strong evidence, not certainty: one chart can't rule out other changes | interpretive (the correlation caveat) | A before/after comparison in one place is observational. The commission worked on the hospitals (PAN covers Scutari and other hospitals), while the chart covers the whole army in the East; supplies, shelter, the end of the siege and troop arrivals also changed between the two years. The video names no single alternative as fact; it says only that one chart can't rule them out. |
| Lesson: before calling it proof, ask what else changed | interpretive | A teaching takeaway, not a statistic. |
| area of each wedge reflects the number | documented | FA: she "plotted deaths in each month as the square roots of distance from the center, so the area of each wedge reflected the number of deaths". The redrawn roses use radius ∝ sqrt(monthly disease rate per 1,000 per year), scaled to January 1855 (1,022.8). |
| CTA | verified listing | Play listing (verified 2026-11-03, `11` CTA correction): "Fund verified livelihood tools and follow their impact." |

- **Illustrative:** the sewer pipe and flush, the "1855" stamp, arrows, "?" marks, cards and chips. The scene-4 roses are redrawn from her monthly rates (labelled on screen "redrawn from her 1858 figures"); frames 0–10 and the caveat scene show crops of, or are built around, the real printed diagram.
- **Deliberately NOT claimed:**
  - that she invented the pie chart or the polar-area chart;
  - that sanitation alone caused the drop, or any percentage drop in hospital mortality (popular figures such as "42% to 2%" were not verified and are not used);
  - germ theory (the commission's measures were framed in terms of foul air and drainage at the time);
  - any quotation from her.
- **Date note:** the diagram first appeared in her 1858 *Notes* (the source HistData cites) and was reprinted in 1859; FA cites the 1859 printing.

## Images (real archival objects; public domain)
| file | what | source | licence |
|---|---|---|---|
| `assets/florence-nightingale-hering-npg-x82368-pd.jpg` | Florence Nightingale, photograph by Henry Hering, c. 1860 (960x1334) | National Portrait Gallery, London, x82368, via Commons (POR) | {{PD-old-auto-1923\|deathyear=1893}} |
| `assets/nightingale-diagram-causes-of-mortality-1858-pd.jpg` | "Diagram of the Causes of Mortality in the Army in the East" (1280x700) | Commons "Nightingale-mortality.jpg" (David Rumsey Map Collection copy) | public domain (1858) |
| `assets/sanitary-commission-report-1857-title-wellcome-pd.jpg` | title page of the 1857 Sanitary Commission report to Lord Panmure (953x1575) | Wellcome Collection via the Internet Archive `b24757354`, page n6 | public domain (1857) |
| `assets/nightingale-monthly-deaths-1854-1856.csv` | her monthly counts and rates, 24 rows | HistData `Nightingale` via Rdatasets (DATA) | data |
| `assets/aarambh-icon.png` | app icon | `videos/aarambh/assets/icon.png` | the app's own icon |

## Style (rule `25` + first-frame addendum; approved animation-direction skill, editorial mode)
- **Layout:** one visual idea per scene, with large, brief labels ("NOT THE WOUNDS", "?", legend chips, "sewers flushed", "1855", "BEFORE", "AFTER", "Jan 1855 2,761", "Jan 1856 42", "disease deaths", "STRONG EVIDENCE", "NOT CERTAINTY", "other changes?", "FLORENCE NIGHTINGALE", "before vs after", "what else changed?"). No paragraph cards and no source footers.
- **Motion:** the roses grow month by month, the sludge flushes through the pipe, the winter wedges are outlined in sequence; no static page with a lens moving up and down.
- **Transitions:** hard cut with flash (4.74), whip pan (10.40–10.60), push (15.40–15.65), push (18.15–18.45), page turn (22.85–23.20), CTA slide (26.70–27.10).
- **Captions:** Inter 800 at 54 px, plate centred at x = 500, y 330–490. Every caption line is ≤ 700 px, so the plate keeps ≥ 30 px padding.

## QA (final export)
- **ffprobe** (`qa/ffprobe.txt`): h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s.
- **Full FFmpeg decode** (`qa/full_decode.log`): no errors.
- **Loudness** (`qa/loudness.txt`): −14.9 LUFS integrated, −1.5 dBTP true peak (at the limit), LRA 2.9.
- **Clipping** (`qa/clipping.txt`): overall sample peak −1.53 dBFS, flat factor 0; audio md5 `9228bf1156c575231c5bb6f8235f62f2`.
- **First frame** (`qa/first_frame.txt`): frame 0 equals the thumbnail composition (1.50/255); mean luminance 72.9/255 (no fade from black); audio audible from 0.08 s.
- **Captions** (`qa/caption_bounds.txt`): 13 groups of at most 2 lines. The widest line is 684 px ("weren't killed by wounds."), so the plate runs x 128–872 and y 330–490.
- **ASR on the export:**
  - **small (en)** (`qa/asr_small_crosscheck.txt`) matches the script word for word except "RUMB" for Aarambh (punctuation aside).
  - **tiny.en** (`qa/asr_final.txt`) matches except "1 ,855" (its tokenisation of 1855) and "RM" for Aarambh.
- **Word-to-event sync** (`qa/sync.txt`): 20 events. Word-triggered events lead their words by 0.10–0.53 s. Pacing windows are met (hook 0.05–4.48, question 4.80–6.00, proof 6.10–22.86 with scene changes at 4.74, 10.60, 15.65 and 18.45, payoff 23.20–26.16, CTA 27.10–29.78).
- **Frames:** `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (21 frames, including t = 0); both reviewed, no defects found.
- **Fixes:** before the full render, the lesson page's circular portrait crop cut her forehead; it was widened (`circlePortrait(…, 0.41, 0.33, 0.27, …)`). Captions were measured before the render. There was one full render and no post-render re-render.

## Remaining limits
- **No listening:** I cannot listen in this container. Narration, sync and clipping were checked with two ASR models, word timestamps and audio statistics; no human listening was done.
- **Redrawn roses:** the before/after roses in scene 4 are redrawn from her monthly rates (and labelled so), not cut from the printed plate.
- **Scope of the evidence:** the commission worked on the hospitals; the chart covers deaths across the whole army in the East. The video presents the drop as strong evidence, not proof.
- **Commission date:** sources differ (March vs around April 1855), so the narration says only "in 1855".
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 and thumbnail are attached in chat and pushed only to the app branch.
