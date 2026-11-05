# Episode record: 2026-11-05 feedback-05 #01 (30 s Hindi educational)

**Batch:** 2026-11-05-feedback-05. **Topic:** outdoor-venue rain-backup checklist (बारिश का बैकअप प्लान).
**Output:** `production/30s/2026-11-05-feedback-05/plan-my-wedding-30s-feedback05-01.mp4`; publishing caption in `production/30s/2026-11-05-feedback-05/publishing-caption.txt`.

## Pre-flight (2026-11-05)
- Confirmed repo cumbersomeamir/animations, branch claude-video/plan-my-wedding (in sync with origin, 0/0), session account amir@tensorblue.com.
- No running jobs or unpushed work. Earlier MP4s (tests/15s, round-02, hindi-03, hindi-04) preserved; the 30 s promo WIP is still checkpointed (78de844).
- Topic history: venue quotes (round02), guest count vs décor (hindi03), catering quotes (hindi04). A rain backup checklist is new.
- This channel was not in the Instagram performance snapshot, so its established context is kept. The "Meshline/Recall" voice note does not apply to this app; the accepted Plan My Wedding Hindi voice is used.

## Final transcript (Hindi, 64 words; src/narration.json)
| # | VO (s) | Narration | English gloss | Caption |
|---|---|---|---|---|
| h1 | 0.18–4.95 | खुले लॉन में शादी, और अचानक बारिश? बैकअप प्लान तैयार रखिए. | Wedding on an open lawn, and sudden rain? Keep a backup plan ready. | खुले लॉन में शादी, / और अचानक बारिश? → बैकअप प्लान तैयार रखिए |
| h2 | 5.13–8.29 | पहला, सबके बैठने लायक छत वाली जगह. | First, a covered space with seating for everyone. | 1. सबके बैठने लायक / छत वाली जगह |
| h3 | 8.47–13.71 | दूसरा, बिजली योग्य इलेक्ट्रीशियन लगाए; बोर्ड ढके, तार पानी से दूर. | Second, power set up by a qualified electrician; boards covered, cables away from water. | 2. बिजली योग्य इलेक्ट्रीशियन लगाए; / बोर्ड ढके, तार पानी से दूर |
| h4 | 13.88–17.60 | तीसरा, ढका रास्ता और फिसलन रोकने वाली चटाई. | Third, a covered path and anti-slip mats. | 3. ढका रास्ता और / फिसलन रोकने वाली चटाई |
| h5 | 17.78–22.22 | चौथा, टेंट, कैटरर, डेकोर की बारिश वाली शर्तें लिखित में. | Fourth, the tent, caterer and décor rain terms in writing. | 4. टेंट, कैटरर, डेकोर की / बारिश वाली शर्तें लिखित में |
| h6 | 22.40–25.88 | और पक्का कीजिए, किस समय बैकअप प्लान पर जाएँगे. | And fix the time at which you'll switch to the backup plan. | 5. पक्का कीजिए, किस समय / बैकअप प्लान पर जाएँगे |
| h7 | 26.41–29.73 | चेकलिस्ट के लिए प्लान माय वेडिंग डाउनलोड करें. | Download Plan My Wedding for the checklist. | end card: प्लान माय वेडिंग डाउनलोड करें · गूगल प्ले पर |

On-screen only: the fictional venue sign "चमेली बाग़ · काल्पनिक जगह" (0.4–3.0 s) and "फ़ैसला: सुबह 11 बजे (उदाहरण)" (example decision time). No rates, no local legal claims, no electrical DIY: the electrical item says to have a qualified electrician do it.

## Storyboard (each checklist item physically fixes the venue)
1. 0–5 s: on frame 0 a folded paper cloud slides in. Bold paper rain starts at 0.12 s, puddles grow, and the lawn chairs darken. The open-lawn mandap and fictional sign pop up. On "बैकअप प्लान" a raspberry origami umbrella opens with a "बैकअप प्लान" tag.
2. 4.9–8.3 s: the crane swoops in. A covered hall pops up, the six lawn chairs fly into it (6.85 s), and the mandap folds. "सबके लिए छत ✓". Rain now stops at the hall roof.
3. 8.5–13.7 s: a power board pops up with its cable lying in a puddle (raspberry ✗). A qualified electrician appears with the tag "योग्य इलेक्ट्रीशियन". On "बोर्ड ढके" a rain hood hinges over the board, and rain no longer reaches it. On "तार पानी से दूर" a post rises and the cable lifts out of the water onto it (✓).
4. 13.9–17.6 s: a covered walkway canopy unfolds from the entry to the hall door ("ढका रास्ता"). On "फिसलन रोकने वाली चटाई" mats fold down along the path, and a guest walks through dry while rain stops under the canopy.
5. 17.6–22.2 s: the crane wipes to the "बारिश हुई तो वेंडर क्या करेंगे?" sheet. Example terms tick as each vendor is named (टेंट: साइड कवर लगेंगे; कैटरर: ढकी जगह पर खाना; डेकोर: अंदर दोबारा सजावट). A vendor signature line draws, then the "लिखित में ✓" stamp.
6. 22.25–25.9 s: an origami clock hand sweeps to the marked time "सुबह 11 बजे (उदाहरण)". On "बैकअप प्लान पर जाएँगे" a switch flips from "खुला लॉन" to "बैकअप प्लान".
7. 26.15–30 s: the accepted end card with the official Play icon banner "प्लान माय वेडिंग डाउनलोड करें", sub-line "चेकलिस्ट · वेंडर · बजट", and "गूगल प्ले पर". The crane perches.

## Approved style notes (kept for future episodes)
- Renderer: `tests/15s/src/lib.mjs` and `models.mjs` (origami facets, 12 fps `stepT`, `jit`, grain overlay; @napi-rs/canvas → FFmpeg). Scene grammar, captions, crane and end card follow hindi-03/04. This is a code motion-graphics renderer: not Three.js, Blender, or AI image/video generation.
- Palette: verified icon accents (cream #FDF6EE, raspberry #B32F3F, gold #C3904C). The rain uses a muted mauve tint (#9E7F88) plus cream highlights for legibility.
- Voice: Kokoro-82M Hindi (0.7 hf_alpha + 0.3 hm_omega), misaki/espeak-ng `hi` G2P, speed 1.04, local CPU and cached. Quiet voice-forward mix (music 0.42, 60 % duck, SFX 0.6). Captions use Noto Serif Devanagari Bold in the folded strip at y≈340–510.
- New pronunciation lessons: "प्लान बी" is heard as "प्लान भी", so use "बैकअप प्लान". In the CTA, respell "वेडिंग" as "वैडिंग" (G2P only) so it is heard as "Wedding", not "Waiting". Keep the "डाउन लोड" respelling.

## Verification
- qa/verify.json: 30.000 s; H.264 High 1080x1920 yuv420p 30/1 fps, 900 frames; AAC 48 kHz stereo 30.000 s; −16.0 LUFS, −1.5 dBTP; full decode clean; no VO overlaps; CTA 26.41–29.73 s.
- Listening was **ASR only (no human ear)**. Whisper large-v3-turbo on the final MP4 audio (qa/asr_rendered_audio.json):
  > खुले लॉन में शादी और अचानक बारिश बैक अप प्लान तेयार रखे पहला सबकी बैठने लायक छत वाली जगा दूसरा बिजली योग्य एलेक्रिशियन लगाए बोर धके तार पानी से दूर तीसरा धका रास्ता और फिसलन रोकने वाली चटाई चौथा टेंट कैटरर डेकोर की बारिश वाली शर्ते लिखित में और पक्का कीजिए किस समय बैक अप प्लान पर जाएंगे चेकलिस्त के लिए प्लान माई वैडिंग डाउन लोड करें।

  All 7 sentences are recovered in order; the differences are spelling-level ASR variants.
- Frames: qa/contact-sheet.jpg and qa/boundaries.jpg reviewed. Fixed: faint rain (bolder drops from 0.12 s), the umbrella overlapping the mandap, and rain drawn over the board hood during its fold (13.9 s).

## Sources (primary; publishing notes only)
- UK Health and Safety Executive, *Electrical safety* (event safety): "To prevent danger, construct or protect electrical equipment that could be exposed to rain or other adverse conditions with suitable and sufficient covers, enclosures or shelters." Also: "Route cables to minimise tripping hazards…" and "use cable ramps or similar to protect cables running overground across route ways". https://www.hse.gov.uk/event-safety/electrical-safety.htm
- UK HSE, *Contamination* (slips): "Contamination is involved in almost all slip accidents, that is anything that ends up on a floor, eg rain water…"; lists "entrance matting" among ways to stop contamination reaching the floor. https://www.hse.gov.uk/slips/cleancampaign.htm
- New York State Department of State, Division of Consumer Protection (18 Feb 2026): "Make sure all quotes, agreements, contracts and decisions you negotiate with businesses are in writing." https://dos.ny.gov/news/say-i-do-smart-planning-after-valentines-day-nys-department-states-division-consumer
- Plan My Wedding Google Play listing (verified 2026-11-03, unchanged): "Build a personalised checklist", vendor bookings, "monitor your budget". This supports the CTA "चेकलिस्ट के लिए … डाउनलोड करें". https://play.google.com/store/apps/details?id=com.tensorblue.planmywedding
- Not used as a claim: India's CEA (Measures relating to Safety and Electric Supply) Regulations 2023 on licensed electrical contractors. Its exact text was not verified, so the video only advises a qualified electrician and makes no legal statement.

## Publishing caption (matches the final transcript)
```
खुले लॉन में शादी, और अचानक बारिश? बैकअप प्लान तैयार रखिए:
1. सबके बैठने लायक छत वाली जगह
2. बिजली योग्य इलेक्ट्रीशियन लगाए; बोर्ड ढके, तार पानी से दूर
3. ढका रास्ता और फिसलन रोकने वाली चटाई
4. टेंट, कैटरर, डेकोर की बारिश वाली शर्तें लिखित में
5. पक्का कीजिए, किस समय बैकअप प्लान पर जाएँगे
चेकलिस्ट के लिए Plan My Wedding डाउनलोड करें — Google Play पर।
#शादी #वेडिंगप्लानिंग #PlanMyWedding
```
