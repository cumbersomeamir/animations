# 29 — English-15 30 s #01: Frances Oldham Kelsey and thalidomide, "STOPPED AT THE DOOR" (first episode under the first-frame addendum, `25`)

- **Batch:** 2026-11-15-english-15 (from the user's brief for 15 November 2026)
- **Video:** `videos/aarambh/production/30s/2026-11-15-english-15/aarambh-30s-english15-01.mp4`
  - sha256 `86d5532a47693f9b085d26c0912653be425f364867108f2c3134034776764a29`
- **Thumbnail:** `videos/aarambh/production/30s/2026-11-15-english-15/aarambh-30s-english15-01-thumbnail.png` (1080x1920 RGB; it is frame 0)
  - sha256 `9ac8544aecedc112a168aae2b6ef877046968574cb98af3a0b2b4cd6731014bb`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only; the established Meshline/Recall narrator (Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98). No earlier narration was reused.
- **Pre-flight (2026-11-15):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin at `89239f1` (english-14 clarification), clean tree; account checked against CLAUDE.md; commits authored as "Claude". No job was running or queued, and earlier outputs are untouched.
- **Topic:** fresh (grep for kelsey/thalidomide over `videos/aarambh` found nothing), so the brief's subject was used.
- **New rule persisted first:** "FIRST FRAME IS CRITICAL" was added as an addendum to `25` and summarised in `11`.

## First frame (rule)
- **Frame 0 (t = 0):**
  - the real NLM portrait of Frances Kelsey (left) beside FDA's photo of the real, unopened 1960 Kevadon (thalidomide) bottle (right), both as spotlit prints on the dark-green desk;
  - the words "STOPPED AT THE DOOR" (4 words) below.
- **No intro:** no logo, flicker, fade from black or fade-in; the old spotlight flicker was removed from the renderer.
- **No caption at frame 0:** the first caption appears at 0.22 s.
- **Hook audio:** narration starts at 0.05 s and is audible from 0.09 s (`qa/first_frame.txt`).
- **Thumbnail = frame 0:** the thumbnail is rendered from the same `drawFrame(0)`; frame 0 of the export differs from it by 1.39/255 mean absolute difference (H.264 encoding only).
- **Truthful words:** "Stopped at the door" is a metaphor for refusing approval at the FDA. The drug was never marketed in the U.S. (FDA), and the narration says exactly that.

## Story structure (rule `25`)
| beat | time (s) | narration | picture |
|---|---|---|---|
| hook | 0.05–5.72 | "In 1960, an FDA reviewer refused a pill sold in dozens of countries." | frame-0 composition; a slow push; light sweeps across both prints; on "refused" a gold bar (the "door") rises between her and the bottle |
| escalation and question | 6.05–8.42 | "It was thalidomide. Why did she say no?" | hard cut to the real Kevadon label; gold underline under "thalidomide"; a big "?" |
| proof 1 | 8.75–11.61 | "Frances Kelsey found its safety evidence too thin." | whip pan to the real FDA photo of Kelsey (1960s) at a desk with stacks of documents; an EVIDENCE gauge fills to about 22% and stalls below a "needed" line; "too thin" |
| proof 2 | 11.95–15.83 | "The company kept pressing; she kept asking for reliable evidence." | page turn: the company building and her portrait; five letters fly in and stack ("pressing"); "?" marks go back; stamp "RELIABLE EVIDENCE?" |
| proof 3 | 16.15–21.50 | "Then researchers linked it to severe birth defects; it was never marketed in the U.S." | push: timeline 1960 application → 1961; card "severe birth defects" (text only, no graphic imagery); the real bottle returns; stamp "NEVER MARKETED IN THE U.S." |
| payoff | 21.85–26.22 | "Lesson: popularity isn't proof of safety; ask what the evidence shows." | push: her portrait above a scale tilted toward "popular" (a crowd of dots); it tips toward "evidence" (documents) on "ask what the evidence shows"; "ask for the evidence" |
| CTA | 27.10–29.87 | "Download Aarambh to support livelihood tools." | the Aarambh card |

## Final script (English; 71 words)
| id | start (s) | text (caption = spoken) | TTS difference |
|---|---|---|---|
| S1 | 0.05 | In 1960, an FDA reviewer refused a pill sold in dozens of countries. | — |
| S2 | 6.05 | It was thalidomide. Why did she say no? | — |
| S3 | 8.75 | Frances Kelsey found its safety evidence too thin. | — |
| S4 | 11.95 | The company kept pressing; she kept asking for reliable evidence. | — |
| S5 | 16.15 | Then researchers linked it to severe birth defects; it was never marketed in the U.S. | — |
| S6 | 21.85 | Lesson: popularity isn't proof of safety; ask what the evidence shows. | — |
| S7 | 27.10 | Download Aarambh to support livelihood tools. | "Download Aa-rumbh, to support…" |

The first draft was about 3 s too long. Its cut details are kept here but not voiced:
- "some data suggested harm with repeated use" (NLM);
- "about a year later" (FDA).

## Sources and claim map (accessed 2026-11-15)
- **[FDA] U.S. FDA, "Frances Oldham Kelsey: Medical reviewer famous for averting a public health tragedy"** (content current as of 02/01/2018): https://www.fda.gov/about-fda/fda-history-exhibits/frances-oldham-kelsey-medical-reviewer-famous-averting-public-health-tragedy
- **[NLM] National Library of Medicine, Changing the Face of Medicine, "Dr. Frances Kathleen Oldham Kelsey":** https://cfmedicine.nlm.nih.gov/physicians/biography_182.html
- **[FDA-K] FDA photo "Kevadon (thalidomide), 1960"** (Flickr fdaphotos 48103117237; Commons "Kevadon (thalidomide), 1960.jpg"; {{PD-USGov-FDA}}), with FDA's caption: "In 1960, the FDA received a new drug application for a sedative, thalidomide, used for years in other countries … FDA medical officer Frances Oldham Kelsey refused to approve the application for lack of sufficient evidence of safety. The drug was soon linked to severe birth defects in thousands of babies."

| claim | kind | source and wording relied on |
|---|---|---|
| In 1960, an FDA reviewer refused | documented | NLM: "In 1960, during her first month at the Food and Drug Administration, Dr. Frances Oldham Kelsey … refused to approve release of thalidomide in the United States"; FDA-K: "In 1960, the FDA received a new drug application … refused to approve the application" |
| a pill sold in dozens of countries | documented | FDA: thalidomide "was already available in dozens of countries around the world"; NLM: "used as a sleeping pill" |
| It was thalidomide (the Kevadon label) | documented | FDA-K photo: "KEVADON thalidomide 100 mg. per tablet"; Kevadon was the U.S. application's brand (FDA-K) |
| She found its safety evidence too thin | documented | FDA: "refused to approve the application because of its inadequate evidence"; FDA-K: "for lack of sufficient evidence of safety" |
| The company kept pressing; she kept asking for reliable evidence | documented | FDA: "despite constant pressure from the company"; "The company continued to send in what they believed was proof of thalidomide's safety, but Dr. Kelsey adamantly insisted on scientifically reliable evidence"; NLM: "the manufacturers tried everything they could to get around her judgement" |
| Then researchers linked it to severe birth defects; 1961 marker | documented | FDA: "Approximately a year later researchers in Germany and Australia linked thalidomide to clusters of rare, severe birth defects"; NLM: "In November 1961, reports began to emerge in Germany and the United Kingdom" |
| It was never marketed in the U.S. | documented | FDA: "The drug was never marketed in the U. S." |
| Lesson: popularity isn't proof of safety; ask what the evidence shows | interpretive | from FDA (the drug was widely available elsewhere, and the decision rested on the lack of reliable evidence). A teaching takeaway, not a statistic. |
| 1960 "application" (timeline) | documented | FDA-K: "In 1960, the FDA received a new drug application" |
| CTA | verified listing | Play listing (verified 2026-11-03, `11` CTA correction): "Fund verified livelihood tools and follow their impact." |

- **Scope, stated honestly:**
  - The real bottle's label reads "CAUTION: New Drug—Limited by Federal Law to Investigational Use". Investigational distribution happened before the marketing application was resolved.
  - The narration therefore says only "never marketed in the U.S." (FDA's wording). It does not claim that no American received the drug.
  - No number of babies affected or "saved" is given, and she is not presented as a sole saviour. FDA's "perhaps thousands" and NLM's "at least 4000 children in Europe" are not used.
- **Illustrative:** the gold "door", evidence gauge, envelopes, company building, timeline, stamps, scale and dots.
- **Deliberately NOT claimed:**
  - any birth-defect imagery (text only);
  - quotations, including Kennedy's citation;
  - the 1962 Drug Amendments and the August 7, 1962 award (true per FDA and NLM, but not voiced for time).

## Images (real archival objects; all U.S. government works, public domain)
| file | what | source | licence |
|---|---|---|---|
| `assets/frances-kelsey-portrait-nlm-pd.png` | portrait of Frances Kathleen Oldham Kelsey (307x418; undated, photographer unknown) | NLM Changing the Face of Medicine, via Commons "Frances Oldham Kelsey.png" | {{PD-USGov}} |
| `assets/kevadon-thalidomide-1960-fda-pd.jpg` | the 1960 Kevadon (thalidomide) investigational bottle | FDA (Flickr fdaphotos 48103117237), via Commons | {{PD-USGov-FDA}}; FDA: "free of all copyright restrictions" |
| `assets/frances-kelsey-1960s-fda171-pd.jpg` | Frances O. Kelsey in the 1960s at a desk with stacks of documents | FDA (Flickr 8211251003, "FDA 171"), via Commons | {{PD-USGov-FDA}} |
| `assets/drug-detective-poster-fda113-pd.jpg` | 1960s U.S. Civil Service recruitment poster "Drug Detective" about Kelsey | FDA (Flickr 8205474573, "FDA 113"), via Commons | {{PD-USGov-FDA}}. Downloaded as a candidate; **not used** in the video (text-heavy). |
| `assets/aarambh-icon.png` | app icon | `videos/aarambh/assets/icon.png` | the app's own icon |

## Style (rule `25` + first-frame addendum; approved animation-direction skill, editorial mode)
- **Layout:** one visual idea per scene, with large, brief labels ("STOPPED AT THE DOOR", "?", "FRANCES KELSEY", "EVIDENCE", "needed", "too thin", "pressing", "RELIABLE EVIDENCE?", "1960 · application", "1961", "severe birth defects", "NEVER MARKETED IN THE U.S.", "popular", "evidence", "ask for the evidence"). No paragraph cards and no source footers.
- **Transitions:** hard cut with flash (5.99), whip pan (8.55–8.75), page turn (11.60–11.95), push (15.90–16.15), push (21.55–21.85), CTA slide (26.70–27.10).
- **Captions:** Inter 800 at 54 px, plate centred at x = 500, y 330–490. Every caption line is ≤ 700 px, so the plate keeps ≥ 30 px padding.

## QA (final export)
- **ffprobe** (`qa/ffprobe.txt`): h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s.
- **Full FFmpeg decode** (`qa/full_decode.log`): no errors.
- **Loudness** (`qa/loudness.txt`): −14.8 LUFS integrated, −1.5 dBTP true peak (at the limit), LRA 3.7.
- **Clipping** (`qa/clipping.txt`): overall sample peak −1.49 dBFS, flat factor 0; audio md5 `dd28e09687dbf07e79b264c94d3fb65f`.
- **First frame** (`qa/first_frame.txt`): frame 0 equals the thumbnail composition (1.39/255); mean luminance 60/255 (no fade from black); audio audible from 0.09 s.
- **Captions** (`qa/caption_bounds.txt`): 12 groups of at most 2 lines. The widest line is 694 px, so the plate runs x 123–877 and y 330–490.
- **ASR on the export:**
  - **small (en)** (`qa/asr_small_crosscheck.txt`) matches the script except "found it safety" for "found its safety" and "RUM" for Aarambh.
  - **tiny.en** (`qa/asr_final.txt`) matches except "Francis" (homophone) and "RM".
- **Word-to-event sync** (`qa/sync.txt`): 25 events. Word-triggered events lead their words by 0.10–0.46 s. All pacing windows are met (hook 0.05–5.72, question 6.05–8.42, proof 8.75–21.50, payoff 21.85–26.22, CTA 27.10–29.87).
- **Frames:** `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (20 frames, including t = 0).
- **Fixes:**
  - **Before the full render:**
    - the "door" bar touched the portrait border;
    - the "dozens of countries" dots ran past x 900 and cluttered the hook, so they were removed;
    - the "RELIABLE EVIDENCE?" stamp looked muddy on paper;
    - the "NEVER MARKETED" stamp sat on the bottle with low contrast;
    - the "severe birth defects" card extended to x 1010.
  - **After the first full render** (two video-only re-renders; audio md5 unchanged):
    - the "too thin" label reached x 925; it now ends at x 875;
    - the caption "The company kept pressing;" (760 px) was split into two lines.

## Remaining limits
- **No listening:** I cannot listen in this container. Narration, sync and clipping were checked with two ASR models, word timestamps and audio statistics; no human listening was done.
- **Small portrait:** the NLM portrait is 307x418, shown at 390 px wide (about 1.3× upscale); it reads well on a phone.
- **Not voiced for time:** the 1962 law change and the presidential award are documented but not in the video.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 and thumbnail are attached in chat and pushed only to the app branch.
