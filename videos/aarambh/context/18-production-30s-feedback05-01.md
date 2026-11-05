# 18 — Feedback-05 30 s #01 (Hindi): Hedy Lamarr & George Antheil, frequency hopping

- **Batch:** 2026-11-05-feedback-05
- **Output:** `videos/aarambh/production/30s/2026-11-05-feedback-05/aarambh-30s-feedback05-01.mp4`
- **sha256:** `6b8e384b9d30e5f072fd199b203a6bf26296d103b378650d6b8dab6004ebd7a4`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Recipe:** the accepted Archive Light Table recipe (`11`) with the Hindi notes.
  - Renderer: `production/30s/2026-11-05-feedback-05/src/render.mjs`, built from the hindi-04 renderer core.
  - The channel, ship, torpedo, jammer and perforated-roll drawings are this app's own round-02 code, relabelled in Hindi.
  - No Three.js and no Blender; Canvas2D is only the tool.
- **Pre-flight (2026-11-05):**
  - Repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin, clean tree.
  - Account checked against the assigned account in CLAUDE.md (same organisation); commits are authored as "Claude".
  - No unfinished job existed (hindi-04 was pushed), and all earlier renders are untouched.

## Why this topic again (a deliberate re-test, not a duplicate)
Round-02 (`15`, 2026-11-03) covered Lamarr & Antheil in **English**. The user explicitly asked for this topic in this batch as a controlled topic/opening test. The new version differs in four ways:
1. **Hindi** narration and captions.
2. **Real portraits** of both inventors (round-02 had none, because the licence checks were rate-limited).
3. An **immediate visual hook**: both portraits and name plates appear within the first 2 s.
4. A **combining-skills takeaway**. The 1962 / "later wireless" lines from round-02 are dropped, so the video makes no deployment claim.

**Performance snapshot:** the user shared a public Instagram performance snapshot. It is treated as non-causal (post ages differ, and totals do not show what caused them), and it does not replace the approved style. Per CLAUDE.md ("No … analytics belong here"), the numbers are not stored in this repo.

## Specific feedback applied
- **Portraits:** verified real historic portraits of both inventors, with licences (see Images).
- **Transitions:** 7 pages, changed by 2 page turns, 3 slide swaps (one is the CTA card) and 1 hard cut. The magnifier is used once, on the real Fig. 4 perforations. Nothing bobs on a static page.
- **One mechanism:** sender and receiver hop channels together, kept in step by matching piano-roll-like strips. A jammer stuck on one channel cannot block it.
- **Concrete takeaway on combining skills:** "सीख: हेडी और जॉर्ज की तरह अलग-अलग हुनर मिलाइए।" The cards show Hedy's knowledge of torpedo control plus George's piano-roll-style synchronisation, joining into "frequency hopping" (NIHF).
- **Not claimed:** that she invented Wi-Fi or Bluetooth, or that the wartime system was deployed. The video says only that the Navy did not adopt it at the time.
- **CTA:** Aarambh only, "आरंभ डाउनलोड करें, आजीविका के औज़ारों का साथ दें।" It is spoken from 25.70 s (last 4.3 s), with the card sliding in at 25.20 s. No other app or company name appears in the video, CTA or publishing copy, and "Help" / "TensorBlue" captions were rejected.
- **Voice:** Kokoro Hindi `hf_alpha` (speed 1.05), the approved Hindi voice. The Meshline/Recall blend (af_bella + am_puck) is English-only, so it is not applicable to Hindi narration. No celebrity voice imitation.
- **Music:** quiet under speech (accepted ducking).

## Final script (Hindi; 59 words; 23.8 s of speech plus pauses)
Captions show `text`; the voice reads `tts`, which differs only where a written form would be misread.

| id | start (s) | caption text | TTS difference | English gloss (record only) |
|---|---|---|---|---|
| S1 | 0.30 | एक अभिनेत्री और एक संगीतकार ने रेडियो का पेटेंट लिया। | comma after ने | An actress and a composer took out a radio patent. |
| S2 | 4.95 | एक फ़्रीक्वेंसी वाला रेडियो टॉरपीडो जाम हो सकता था। | — | A radio torpedo on one frequency could be jammed. |
| S3 | 9.45 | उपाय: भेजने और पाने वाला साथ-साथ फ़्रीक्वेंसी बदलें। | साथ-साथ → साथ साथ; comma | Solution: sender and receiver change frequency together. |
| S4 | 13.85 | पियानो-रोल जैसी दो समान पट्टियाँ ताल मिलाती थीं। | पियानो-रोल → पियानो रोल | Two identical piano-roll-like strips kept them in step. |
| S5 | 18.10 | नौसेना ने तब इसे नहीं अपनाया। | — | The Navy did not adopt it then. |
| S6 | 21.00 | सीख: हेडी और जॉर्ज की तरह अलग-अलग हुनर मिलाइए। | comma; अलग-अलग → अलग अलग | Lesson: like Hedy and George, combine different skills. |
| S7 | 25.70 | आरंभ डाउनलोड करें, आजीविका के औज़ारों का साथ दें। | — | Download Aarambh, support livelihood tools. |

**Name spelling:** "ऐन्टाइल" is used in both caption and TTS. espeak reads it as ɛːnʈaːɪl ("AN-tile", Antheil's pronunciation), whereas "एंटाइल" came out as a nasal ẽːʈaːɪl.

**Trims to fit 30 s** (the first draft ran 30.4 s): the names moved from S1 into the S6 takeaway, with the names on screen from 0.4 s; S2 and S4 were shortened; extra comma pauses were removed.

## Sources and claim map (accessed 2026-11-05)
- **[P] U.S. Patent 2,292,387, "Secret Communication System".**
  - Inventors: Hedy Kiesler Markey and George Antheil.
  - The drawing sheet 2 header, shown on P5, reads "Aug. 11, 1942 · H. K. MARKEY ET AL · 2,292,387 · SECRET COMMUNICATION SYSTEM · Filed June 10, 1941".
  - Record: https://patents.google.com/patent/US2292387A/en (it returned 503 today; the full-text quotes were verified on 2026-11-03 and are in `15`).
- **[N1] National Inventors Hall of Fame, Hedy Lamarr:** https://www.invent.org/inductees/hedy-lamarr
- **[N2] National Inventors Hall of Fame, George Antheil:** https://www.invent.org/inductees/george-antheil

| claim (spoken or on screen) | source | wording relied on |
|---|---|---|
| An actress and a composer | N1; N2 | N1: "Actress Hedy Lamarr … worked with Hollywood composer George Antheil"; N2: "an avant-garde composer" |
| Radio patent 2,292,387; granted 11 Aug 1942; filed 10 Jun 1941 | P (sheet header on screen); N1 | N1: "U.S. Patent No. 2,292,387"; "When the patent was issued in 1942, it listed her maiden and married name at the time, Hedy Kiesler Markey." |
| Life dates 1914–2000 and 1900–1959 (name plates) | N1; N2 | "Born Nov. 9, 1914 - Died Jan. 19, 2000"; "Born July 8, 1900 - Died Feb. 12, 1959" (this closes round-02's open item on Antheil's birth year) |
| A radio torpedo on one frequency could be jammed | N1; P | N1: "frequency hopping reduced the risk of detection or jamming of radio-controlled torpedoes"; P (via `15`): "especially useful in the remote control of dirigible craft, such as torpedoes" |
| Sender and receiver change frequency together; "संदेश साफ़" (signal clear) | N1 | "if both the sender and receiver of the signal hopped frequencies at the same time, the signal was clear" |
| Piano-roll-like identical strips keep them in step; "88 फ़्रीक्वेंसी तक" | N2; P | N2: "To maintain synchronization, he developed a system to control the jumps between 88 pre-programmed frequencies based on the 88 keys of a piano"; P Fig. 4 is the perforated record strip; P (via `15`): "records of the type used for many years in player pianos … 88 different carrier frequencies" |
| The Navy did not adopt it then | N2 | "Although the Navy initially shunned their technique" |
| Hedy's skill card: knowledge of torpedo control | N1 | "giving her the foundation for her knowledge of weapons systems, including torpedo control systems" |
| George's skill card: piano-roll-style synchronisation | N2 | "Antheil was familiar with remote control technology … To maintain synchronization…" |
| Takeaway: combine different skills | interpretive, from N1 + N2 ("both inventors contributed great technical expertise") | — |
| CTA | Play listing (verified 2026-11-03, `11` CTA correction) | "Fund verified livelihood tools and follow their impact." |

**Deliberately NOT claimed:**
- that she invented Wi-Fi, Bluetooth or GPS
- that the wartime system was built or deployed
- the later Sylvania (1957) and 1962 blockade uses (NIHF reports these for the concept, but they are left out so nothing implies their device was deployed)
- profits, valuations or quotes

## Images (real archival objects; drawings labelled "चित्रण")
| file | what | source | licence |
|---|---|---|---|
| `assets/hedy-lamarr-screenland-oct-1942-cover.jpg` | *Screenland* magazine cover, October 1942, with Hedy Lamarr. The cover itself prints "HOW HEDY LAMARR SOLVES HER LOVE PROBLEMS". | Internet Archive `screenland45unse` (*Screenland*, May–Oct 1942), page n440, contributed by the Library of Congress MBRS; binding edge cropped | IA record: "Library of Congress has determined that this item is not in copyright"; the Commons copy of the same cover is tagged {{PD-US-not renewed}}. The cover carries the Library's own dated deposit stamp ("COPYRIGHT DEPOSIT … SEP 16 1942"). |
| `assets/george-antheil-berenice-abbott-1927.jpg` | George Antheil, portrait detail by Berenice Abbott, 1927 | Wikimedia Commons "File:Antheil 1927.jpg" (source credited there: A&M Penn Photography Foundation) | {{PD-US-expired}} |
| `assets/us2292387-sheet2-figs7-4.png`, `assets/us2292387-sheet2-signatures.png` | patent drawing sheet 2: header, Fig. 4, signatures (reused from this app's round-02 assets) | U.S. patent drawing (patentimages) | U.S. patent drawings are generally not subject to copyright |

**Other visuals:** channels, ships, torpedo, jammer, rolls and skill cards are original Canvas2D drawings, labelled "चित्रण" in the footers.

**Commons access:** the Commons API and the originals were rate-limited (429). Licence templates were read from file-page wikitext. The Antheil original downloaded on a later retry, and the Lamarr cover came straight from the Internet Archive scan that Commons cites.

## Storyboard (as rendered; times from the Hindi ASR word pass)
| time (s) | page | in | motion with narration |
|---|---|---|---|
| 0–4.95 | P1 the inventors | table on; prints land by 0.85 | the *Screenland* 1942 cover and Abbott's 1927 Antheil portrait; the "हेडी लमार · अभिनेत्री · 1914–2000" plate lands on "अभिनेत्री" (0.43); a gold "+" on "और" (1.22); the "जॉर्ज ऐन्टाइल · संगीतकार · 1900–1959" plate on "संगीतकार" (1.75); the "पेटेंट 2,292,387 · 11 अगस्त 1942" stamp on "पेटेंट" (3.52) |
| 4.95–9.45 | P2 the problem | **page turn** (4.60–4.95) | the carrier appears on one channel on "फ़्रीक्वेंसी" (5.04); the torpedo runs; on "जाम" (7.60) a jammer floods the same channel, the torpedo veers and a red "जाम!" stamp lands |
| 9.45–13.76 | P3 the solution | **slide swap** (9.10–9.45) | the sender lights on "भेजने" (9.75) and the receiver on "पाने" (10.67); on "साथ" (11.42) both hop together, one channel every 0.38 s, with the signal crossing on the shared channel while the jammer stays stuck on one; "संदेश साफ़" stamp on "बदलें" (12.82) |
| 13.76–18.10 | P4 the trick | **hard cut** on "पियानो" (13.76) | the real patent Fig. 4 strip; the **magnifier (only use)** lands on its perforations on "रोल" (14.43) and tracks along the strip to 15.9; sender and receiver strips scroll in step, so the same hole lights the same channel lamp; "एक जैसे छेद = एक ही चैनल" label on "पट्टियाँ" (15.93); note "पेटेंट: 88 फ़्रीक्वेंसी तक" |
| 18.10–21.00 | P5 the outcome | **page turn** (17.75–18.10) | the patent sheet header (dates); both inventors' real signatures; the "नौसेना ने तब नहीं अपनाया" stamp on "नहीं" (19.48) |
| 21.00–25.70 | P6 the takeaway | **slide swap** (20.65–21.00) | both portraits; the "हेडी · टॉरपीडो-नियंत्रण की जानकारी" card on "हेडी" (21.41) and the "जॉर्ज · पियानो-रोल जैसा ताल-मेल" card on "जॉर्ज" (21.97); they join into "फ़्रीक्वेंसी हॉपिंग" on "हुनर" (23.70) |
| 25.70–30 | P7 CTA card | **slide swap** (25.20–25.70) | app icon, "Aarambh", "आरंभ डाउनलोड करें", "आजीविका के औज़ारों का साथ दें", the listing line, "Google Play पर उपलब्ध" |

## QA (final export)
- **ffprobe:** h264 High yuv420p 1080x1920 30/1, 900 decoded frames, 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; format 30.000000 s.
- **Full FFmpeg decode:** no errors.
- **Loudness:** −15.0 LUFS integrated, −4.1 dBTP true peak, LRA 4.0.
- **Captions:** 7 groups of 2 lines each. The widest line is 727 px, so the plate runs x 144–936 and y 350–510; the top 300 px stays clear. No tofu.
- **Hindi ASR on the export** (faster-whisper small, language hi; `qa/asr_final.txt`). All seven sentences are recognised in order:
  - 0.00–4.36: एक अबहनेत्री और एक संगित कार ने रेडियो का पेटेंट लिया
  - 4.36–8.86: एक फ्रिक्वेसी वाला रेडियो तर्पीरो जाम हो सकता था
  - 8.86–13.30: उपाई भेजने और पाने वाला साथ-साथ फ्रिक्वेसी बडले
  - 13.30–17.56: प्यानो रोल जैसी तो समान पत्या ताल मिलाती थी
  - 17.56–24.84: नोसेना ने तब इसे नहीं अपनाया, सीक, हेडी और जोर्ज की तरहा अलग अलग हुनर मिलाये
  - 24.84–29.64: आरंभ डाओन लोड करे आजीविका के अजारो का साथ दे
  - The misses are spelling-level (तर्पीरो for टॉरपीडो, aspiration losses).
- **Word-to-event sync** (`qa/sync.txt`): 22 events, each 0.0–0.35 s before or on its word.
- **Contact sheets:** `qa/contact_representative.jpg` and `qa/contact_transitions.jpg`.
- **Fixes:**
  1. The P4 magnifier came close to the kicker and the credit, so it is smaller, tracks only the perforation band, and the credit is shorter and right-aligned.
  2. The P5 signature crop showed stray sheet text, now cropped.
  3. On P6 (first full render), the skill cards covered the *Screenland* credit; the cards and result box moved 40 px lower. One re-render.

## Remaining limits
- **No human listening:** I can't listen here. Words, pronunciation and alignment were verified by Hindi ASR and espeak phonemes only, and the voice is TTS-grade. A native-speaker listen is recommended before posting.
- **Patent full text:** it was not re-fetched today (Google Patents returned 503). The patent quotes rely on round-02's verified record and the drawing sheet shown on screen.
- **Magazine cover:** it includes the Library of Congress deposit stamp and the magazine's own cover lines, left unaltered as an archival object.
- **No review folder:** this is a cloud container, so no Desktop/video-review folder exists. The MP4 is attached in chat and pushed only to the app branch.
