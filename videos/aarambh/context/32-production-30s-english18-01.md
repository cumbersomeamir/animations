# 32 — English-18 30 s #01: John Snow and the 1854 Broad Street outbreak, "ONE HANDLE. MANY LIVES." (fourth episode under the first-frame addendum, `25`)

- **Batch:** 2026-11-15-english-18 (the user's brief "NEXT EDUCATIONAL EPISODE … next batch18 on 15 November 2026")
- **Video:** `videos/aarambh/production/30s/2026-11-15-english-18/aarambh-30s-english18-01.mp4`
  - sha256 `90166fbac1f41adbe3720210c343f1275c7508c393265f0eaf83d888eafe5586`
- **Thumbnail:** `videos/aarambh/production/30s/2026-11-15-english-18/aarambh-30s-english18-01-thumbnail.png` (1080x1920 RGB; it is frame 0)
  - sha256 `37fffed7016208ef9190d2babec0a10b2e6709580c6c190d40ba80bb14670372`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only; the established Meshline/Recall narrator (Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98). No earlier narration was reused.
- **Pre-flight (2026-11-15):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin at `d503120` (english-17), clean tree; account checked against CLAUDE.md. The batch folder was created after `test ! -e`. Batch 17 was already delivered and was not touched; earlier outputs are untouched.
- **Topic:** fresh. A grep for "john snow", cholera, "broad street" and miasma over `videos/aarambh` found nothing, so the brief's subject was used.
- **Related episode:** english-16 (Nightingale) also had a public-health evidence lesson. This episode's lesson is different and concrete (map the cases, then check who was spared), and its caution is narrated through Snow's own table rather than a "not certainty" card.
- **Session note:** the worker process restarted once after the export QA. The files and hashes were re-verified before the work continued.

## First frame (rule)
- **Frame 0 (t = 0):**
  - the real 1856 photograph of John Snow (left, tilted print);
  - a cast-iron Victorian street pump with its handle rim-lit in gold (right, illustration);
  - the words "ONE HANDLE. / MANY LIVES." (4 words, large) below.
- **No intro:** no logo, flicker, fade from black or fade-in. The scene's first state is drawn complete.
- **No caption at frame 0:** the first caption appears at 0.22 s.
- **Hook audio:** narration starts at 0.05 s and is audible from 0.09 s (`qa/first_frame.txt`).
- **Thumbnail = frame 0:** rendered from the same `drawFrame(0)`. Frame 0 of the export differs from it by 1.53/255 mean absolute difference (H.264 encoding only). Mean luminance 56.4/255.
- **Truthful words:** the brief's words are used as given.
  - "Many lives" is first answered by the death toll: over 500 deaths in ten days near the pump (Snow).
  - The video later shows, from Snow's own table, that attacks were already falling when the handle came off.
  - So the frame is a question that the story answers, not a claim that the handle alone saved those lives.
  - The pump is an illustration (Snow's pump does not survive; the modern replica on Broadwick Street was not used).

## Story structure (rule `25`)
| beat | time (s) | narration | picture |
|---|---|---|---|
| hook | 0.05–4.49 | "In ten days, cholera killed over 500 people near one London pump." | frame-0 composition; slow push; light sweep over the portrait |
| escalation and question | 4.85–8.84 | "Many doctors blamed bad air. How did John Snow find the cause?" | hard cut with flash (4.79) into drifting fog; "bad air?"; the fog clears to the real 1855 title page of his book; gold underline under JOHN SNOW, M.D. |
| proof 1: the cluster | 9.25–13.11 | "He traced where the dead had lived: nearly all near the Broad Street pump." | whip pan (9.05–9.25) to his real map of the deaths; slow push toward the pump; the bars around the pump glow gold; ring on the pump, "Broad Street pump" |
| proof 2: the exceptions | 13.50–18.53 | "Brewery workers drinking beer escaped; a workhouse with its own well barely suffered." | push (13.20–13.45) to a closer view of the same map; ring on the brewery, "BREWERY / beer, not pump water"; pan to the workhouse; ring, "WORKHOUSE / own well: 5 of 535 died" |
| proof 3: the handle in context | 18.85–21.73 | "The handle came off, but attacks were already falling." | push (18.55–18.85) to the pump above his Table 1 redrawn as bars (fatal attacks per day; peak 143); the handle comes off and drops; marker "handle off · Sept 8"; the 1–8 Sept bars turn gold, arrow down, "already falling" |
| payoff | 22.20–25.04 | "Lesson: map who got sick, then ask who was spared." | page turn (21.85–22.20) to a cream page: circular portrait, JOHN SNOW, cards "1 map who got sick", "2 ask who was spared" |
| CTA | 27.10–29.87 | "Download Aarambh to support livelihood tools." | CTA slide (26.70–27.10) to the Aarambh card |

## Final script (English; 76 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.05 | In ten days, cholera killed over 500 people near one London pump. | — |
| S2 | 4.85 | Many doctors blamed bad air. How did John Snow find the cause? | — |
| S3 | 9.25 | He traced where the dead had lived: nearly all near the Broad Street pump. | — |
| S4 | 13.50 | Brewery workers drinking beer escaped; a workhouse with its own well barely suffered. | — |
| S5 | 18.85 | The handle came off, but attacks were already falling. | — |
| S6 | 22.20 | Lesson: map who got sick, then ask who was spared. | — |
| S7 | 27.10 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

The first draft opened "In 1854, cholera killed over 500 people in ten days…" (6.9 s). The year was cut from the narration to fit; it remains on the book page and in the chart marker.

## Sources (accessed 2026-11-15)
- **[SNOW] John Snow, *On the Mode of Communication of Cholera*, 2nd ed., much enlarged** (London: John Churchill, 1855; preface dated 11 December 1854). Wellcome Collection copy on the Internet Archive, `b28985266`: https://archive.org/details/b28985266 (text: `b28985266_djvu.txt`; title page = page n4).
- **[T1] Snow (1855) Table 1, fatal attacks and deaths by day, 19 Aug – 30 Sep 1854,** as transcribed in the R package HistData (`Snow.dates`). CSV via Rdatasets: https://vincentarelbundock.github.io/Rdatasets/csv/HistData/Snow.dates.csv (saved as `assets/snow-1855-table1-fatal-attacks-by-day.csv`; 45 attacks of unknown date are in the last row and are not charted). Documentation: https://vincentarelbundock.github.io/Rdatasets/doc/HistData/Snow.dates.html
- **[LM] London Museum, "John Snow: Cholera & the Broad Street pump":** https://www.londonmuseum.org.uk/collections/london-stories/john-snow-cholera-broad-street-pump/
- **[UCLA] UCLA Department of Epidemiology John Snow site, removal of the handle and the Board of Health's response:** https://epi-snow.ph.ucla.edu/Stream5_additionalitems_e.html (background only; not voiced)
- **[MAP] Wikimedia Commons, "Snow-cholera-map-1.jpg"** (Snow's map of the deaths around Broad Street, C. F. Cheffins lith., in the 1855 book): https://commons.wikimedia.org/wiki/File:Snow-cholera-map-1.jpg
- **[POR] Wikimedia Commons, "John Snow.jpg"** (autotype of an 1856 photograph, published 1887): https://commons.wikimedia.org/wiki/File:John_Snow.jpg

## Claim map (measured, documented, interpretive, illustrative)
| claim | kind | basis |
|---|---|---|
| In ten days, cholera killed over 500 people near one London pump | measured (Snow's count) | SNOW: "Within two hundred and fifty yards of the spot where Cambridge Street joins Broad Street, there were upwards of five hundred fatal attacks of cholera in ten days." The Broad Street pump stood at that spot (MAP). |
| Many doctors blamed bad air | documented (prevailing belief) | LM: "When cholera struck, doctors didn't understand germs. They thought disease spread by inhaling dirty air, known as 'miasma'." Said as "many", not "all". The fog on screen illustrates the belief, not a cause. |
| How did John Snow find the cause? | the question | The build-up answers it with his evidence (the cluster and the exceptions). |
| He traced where the dead had lived: nearly all near the Broad Street pump | documented | SNOW: he "made inquiry, in detail, respecting the eighty-three deaths registered" for the first three days; "nearly all the deaths had taken place within a short distance of the pump. There were only ten deaths in houses situated decidedly nearer to another street pump", and most of those families also used the Broad Street pump. The map on screen is his published map (in the 1855 book). The narration says "traced", not that he drew the map before the handle came off. |
| Brewery workers drinking beer escaped | documented | SNOW: "above seventy workmen … none of them had suffered from cholera, — at least in a severe form, — only two having been indisposed … The men are allowed a certain quantity of malt liquor, and Mr. Huggins believes they do not drink water at all; and he is quite certain that the workmen never obtained water from the pump in the street. There is a deep well in the brewery". On screen: "beer, not pump water". |
| a workhouse with its own well barely suffered | documented (measured) | SNOW: "out of five hundred and thirty-five inmates only five died of cholera … The workhouse has a pump-well on the premises … and the inmates never sent to Broad Street for water." On screen: "own well: 5 of 535 died". |
| The handle came off | documented | SNOW: after he spoke to the Board of Guardians on Thursday 7 September, "the handle of the pump was removed on the following day" (8 September; marker on the chart). |
| but attacks were already falling | measured (his table) + his own caveat | T1: fatal attacks 143 on 1 Sept, 116, 54, 46, 36, 20, 28 and 12 on 8 Sept. SNOW: "the attacks had so far diminished before the use of the water was stopped, that it is impossible to decide whether the well still contained the cholera poison in an active state"; the flight of the population also reduced deaths. HistData calls the ended-by-the-handle version "apocryphal". |
| Lesson: map who got sick, then ask who was spared | interpretive | A teaching takeaway from his method (the cluster plus the exceptions), not a statistic. |
| CTA | verified listing | Play listing (verified 2026-11-03, `11` CTA correction): "Fund verified livelihood tools and follow their impact." |

- **Illustrative:** the pump and its falling handle, the fog, rings, plates, the gold glow over the cluster (it tints everything dark near the pump, bars and street lines alike, to show where the deaths concentrate), arrows and cards. The chart is redrawn from Table 1 and labelled "fatal attacks per day".
- **Deliberately NOT claimed:**
  - that removing the handle ended the outbreak or saved a number of lives;
  - that the map came before the handle's removal;
  - germ theory or *Vibrio cholerae*;
  - the index case or the Rev. Henry Whitehead's later work;
  - the Board of Health's 1855 rejection of his view (background in UCLA, not voiced);
  - that he "founded epidemiology";
  - any quotation spoken aloud.

## Images (real archival objects; public domain)
| file | what | source | licence |
|---|---|---|---|
| `assets/john-snow-portrait-1856-pd.jpg` | John Snow (1813–1858), autotype of an 1856 photograph, published 1887 (1280x1881) | Commons "John Snow.jpg" (POR), standard 1280 px rendering | public domain |
| `assets/snow-broad-street-map-1854-pd.jpg` | the central part of Snow's map of the deaths around Broad Street (crop 0.25–0.87 x, 0.20–0.70 y of the 3840 px rendering; 2381x1801) | Commons "Snow-cholera-map-1.jpg" (MAP) | public domain |
| `assets/snow-1855-title-page-wellcome-pd.jpg` | title page of *On the Mode of Communication of Cholera*, 2nd ed. (1855) (1125x1967) | Wellcome Collection via the Internet Archive `b28985266`, page n4 | public domain |
| `assets/snow-1855-table1-fatal-attacks-by-day.csv` | his Table 1 by day | HistData `Snow.dates` via Rdatasets (T1) | data |
| `assets/aarambh-icon.png` | app icon | `videos/aarambh/assets/icon.png` | the app's own icon |

- **Not used:**
  - Commons "John Snow memorial and pub.jpg" (the replica pump, CC BY-SA 2.0; a modern replica could be mistaken for the original);
  - a Wellcome catalogue portrait (marked in copyright).
- **Download note:** Wikimedia now returns 429 for original-size files from scripts. The standard thumbnail sizes (1280 px, 3840 px) worked.

## Style (rule `25` + first-frame addendum; approved animation-direction skill, editorial mode)
- **Layout:** one visual idea per scene, with large, brief labels ("ONE HANDLE. MANY LIVES.", "bad air?", "Broad Street pump", "BREWERY / beer, not pump water", "WORKHOUSE / own well: 5 of 535 died", "143", "fatal attacks per day", "handle off · Sept 8", "already falling", "JOHN SNOW", the two cards). No paragraph cards and no source footers.
- **Motion that explains:** the fog of "bad air" clears to his book; the camera pushes into his map while the cluster around the pump glows; the camera pans from the brewery to the workhouse; the handle comes off over his own daily table, where the bars before 8 Sept are already falling.
- **Transitions:** hard cut with flash (4.79), whip pan (9.05–9.25), push (13.20–13.45), pan within the map (15.70–16.40), push (18.55–18.85), page turn (21.85–22.20), CTA slide (26.70–27.10).
- **Captions:** Inter 800 at 54 px, plate centred at x = 500, y 330–490. Every caption line is ≤ 700 px, so the plate keeps ≥ 30 px padding.

## QA (final export)
- **ffprobe** (`qa/ffprobe.txt`): h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; 18.6 MB (the map's fine line detail).
- **Full FFmpeg decode** (`qa/full_decode.log`): no errors.
- **Loudness** (`qa/loudness.txt`): −15.0 LUFS integrated, −1.5 dBTP true peak (at the limit), LRA 4.6.
- **Clipping** (`qa/clipping.txt`): overall sample peak −1.52 dBFS, flat factor 0; audio md5 `55ec4977b0ef2834332b119cff404aa5`.
- **First frame** (`qa/first_frame.txt`): frame 0 equals the thumbnail composition (1.53/255); mean luminance 56.4/255 (no fade from black); audio audible from 0.09 s.
- **Captions** (`qa/caption_bounds.txt`): 13 groups of at most 2 lines. The widest line is 674 px ("own well barely suffered."), so the plate runs x 133–867 and y 330–490.
- **ASR on the export:**
  - **small (en)** (`qa/asr_small_crosscheck.txt`) matches the script word for word except "RUM" for Aarambh ("ten" is printed as "10").
  - **tiny.en** (`qa/asr_final.txt`) matches except "asked" for "ask" and "RM" for Aarambh.
- **Word-to-event sync** (`qa/sync.txt`): 22 events. Word-triggered events lead their words by 0.10–0.57 s. Pacing windows are met (hook 0.05–4.49, escalation and question 4.85–8.84, proof 9.25–21.73, payoff 22.20–25.04, CTA 27.10–29.87).
- **Frames:** `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (27 frames, including t = 0); both reviewed, no defects found. A suspected shift at 18.5 s was checked at full size: it is the same composition as 17.5 s (the label plate is still fading in).
- **Fixes:** all before the full render; one full render, no post-render re-render.
  - Ring positions on the pump, brewery and workhouse were checked at full resolution.
  - The book underline was moved twice so it sits under "JOHN SNOW, M.D." and not the small text below.
  - The frame-0 pump was moved left (the handle knob kept inside the frame) and given a rim light.
  - "MANY LIVES." was reduced from 790 px to 750 px wide.

## Remaining limits
- **No listening:** I cannot listen in this container. Narration, sync and clipping were checked with two ASR models, word timestamps and audio statistics; no human listening was done.
- **Map vs inquiry:** the map shown is his published map. His first evidence was the registered addresses of 83 deaths, and the narration says "traced", not "mapped first".
- **Glow is not a recount:** the gold glow marks the area around the pump; it is not a recount of the deaths.
- **Illustrated pump:** the pump is an illustration, not the original.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 and thumbnail are attached in chat and pushed only to the app branch.
