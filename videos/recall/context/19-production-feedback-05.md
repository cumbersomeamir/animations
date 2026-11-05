# 19 — Feedback-05 (2026-11-05, Hindi): "हेडफ़ोन ने एसी की गूंज दबा दी, पर दोस्त की आवाज़ क्यों सुनाई दी?" (why noise-cancelling headphones reduce steady hum but not voices)

**Output:** `videos/recall/production/30s/2026-11-05-feedback-05/recall-30s-feedback05-01.mp4`

**Format:** 11. **Style:** 15 (unchanged). **Hindi setup:** the same as 17 and 18. Previous MP4s are preserved, and no automation was created.

## Request essentials (user, 2026-11-05; facts about the brief)
- Batch 2026-11-05-feedback-05. One new 30 s Hindi educational episode explaining why noise-cancelling headphones struggle with sudden voices but reduce steady engine hum.
- It should start with an everyday surprising contrast and animate the sound plus the opposing wave with clear timing. It should explain one memorable reason, and the claims must be verified with acoustics/product sources.
- Keep the approved visual-proof format, voice, performer and scene recipe. Three.js is the renderer, not the style. Give an immediate visual hook in the first 1–2 s, a concrete demonstration and takeaway, and one short truthful CTA in the last 3–4 s.
- Natural Hindi VO and Devanagari captions. No filler, no repeated disclaimers, no invented features or guarantees.
- The publishing caption must match the final transcript, use the correct app identity, and contain no editing instructions.
- **Performance snapshot (user):** 14/14 reels show plays; 4,133 plays and 110 likes observed (13/14 visible); median 153. The user notes these totals do not establish causality, and this episode is a controlled topic/opening test, **not** a style change.

## Setup confirmation and history check
- **Repo and branch:** repo `cumbersomeamir/animations` (origin URL verified); branch `claude-video/recall` at 3993a5b, tree clean, no active jobs.
- **Account:** the git author is session-managed, and the commit trailers carry this Claude session URL.
- **Topic history:** none of the 6 earlier episodes covers headphones or ANC; the episode table in 11 and contexts 12–18 were checked.

## Final script (74 Hindi words, 24.05 s of speech; voice hf_beta 0.7 + hm_omega 0.3, lang hi, 0.98; CTA 1.05)
| id | start (s) | Hindi | gloss | dur (s) | ASR CER |
|---|---|---|---|---|---|
| — | 0.75 | (diegetic, Kokoro Hindi voice hm_psi) अरे, सुनो! | Hey, listen! | 0.78 | — |
| l01 | 1.55 | हेडफ़ोन ने एसी की गूंज दबा दी, पर दोस्त की आवाज़ क्यों सुनाई दी? | The headphones suppressed the AC hum, so why was a friend's voice still heard? | 4.20 | 0.106 |
| l02 | 6.00 | बाहर का माइक शोर सुनता है, और स्पीकर उसकी उल्टी लहर बजाकर उसे घटाता है। | The outside mic hears the noise; the speaker plays its opposite wave to reduce it. | 5.45 | 0.036 |
| l03 | 11.70 | पर उल्टी लहर ज़रा देर से बनती है; धीमी गूंज में चल जाता है, आवाज़ों की तेज़ लहरों में नहीं। | But the opposite wave is formed a little late; with a slow hum that's fine, with a voice's fast waves it isn't. | 6.14 | 0.060 |
| l04 | 18.80 | तो ये प्लेन, ट्रेन या एसी की गूंज में सबसे ज़्यादा मदद करते हैं। | So they help most with plane, train or AC hum. | 4.27 | 0.041 |
| l05 | 25.80 | कोई भी नया विषय एआई से सीखने के लिए रिकॉल डाउनलोड करें। | Download Recall for learning any new subject with AI. | 4.00 | 0.114 |

- **Mean CER:** 0.071 (Whisper medium, language `hi`, clean lines). The residual differences are spelling only.
- **Wording changes:**
  - "आवाज़ की" (heard as "आवास" = residence) → "आवाज़ों की";
  - "बस" → "प्लेन", to match the Sony source examples exactly;
  - "बाहर लगा … घटा देता है" → "बाहर का … घटाता है" (to stay within 75 words);
  - "मिटा"/"काट" (remove/cut) avoided in favour of "दबा दी"/"घटाता है" (suppress/reduce), because the sources say ANC reduces noise rather than removing it.
- **The memorable reason:** "उल्टी लहर ज़रा देर से बनती है" (the opposite wave is always a little late) — patent S4.

## Sources (quotes and claim map in the output folder's `docs/SOURCES.md`)
- **Sony Help Guides** (WH-1000XM4, WH-H900N, WF-SP800N): "effective in low frequency ranges such as airplanes, trains, offices, near air-conditioning, and is not as effective for higher frequencies, such as human voices."
- **US8848935B1** (Audience → Samsung):
  - a reference microphone captures the background noise;
  - the anti-noise wave cancels "via destructive interference";
  - "excessive latency makes the anti-noise signal arrive too late … resulting in unsatisfactory cancelation at higher frequencies."
- The Apple URL tried was an unrelated archived page and is not cited.

## Product-fact check (CTA)
The CTA is the same as in 16–18. "with AI" is the user's wording, not confirmed in the saved listing or public site text. There is no learning guarantee.

## Creative decisions (choices, not facts)
- **Same café and performer as F01** (code identical). New props:
  - graphite over-ear headphones with lime rings and an ANC LED, attached to the head;
  - a wall AC unit;
  - flat 3D wave ribbons.
- **Opening = demonstration** (first 1.5 s, no VO):
  - **Picture:** the AC's coral hum ribbon flattens near the ear when the cup is tapped (LED on). The friend's "अरे, सुनो!" (speech bubble and a jagged white voice ribbon) passes straight through, and the performer turns.
  - **Sound:** the AC drone drops about 15 dB at ANC-on, while the call stays clear.
- **Mechanism object:** a giant headphone cutaway (shell, cushion, driver, glowing outer mic) and a dark three-lane wave panel: noise / late opposite wave / what reaches the ear.
  - The **same delay band "देर"** is used in both examples, and waves slow to quarter speed with a crest phase-locked in view while "देर" is spoken.
  - Slow hum: lane 3 is almost flat ("लगभग शांत").
  - Voice: short bursty waves; lane 3 keeps the wiggles ("आवाज़ बची").
  - Wavelengths are chosen so the voice is not reduced but **never amplified** (an amplified voice would be misleading).
- **Takeaway:** plane, train and AC icons whose hums flatten at the ear. The on-screen takeaway "एक-सी गूंज पर सबसे ज़्यादा असर।" appears with no VO.
- **Captions:** the accepted Baloo 2 Devanagari pill treatment. The publishing caption is the exact final transcript plus sources.

## Skill adjustments learned this round
- To show a time gap on a moving wave, slow the wave clock and phase-lock a feature into frame (`waveTime`, `SLOW_PH` in `web/choreo.js`). Otherwise the marker drifts off-screen.
- Use a diegetic line (a second official Hindi voice) plus a speech bubble to make the "sudden sound" in the hook audible as well as visible.
- Generate the publishing caption from `script.json` so it can never drift from the final transcript.

## Progress
- 2026-11-05:
  - Setup confirmed; topic history clear; sources fetched.
  - Hindi narration generated and ASR-checked (one homophone fix).
  - Scene built from H04 tooling. Preview stills reviewed and fixed:
    - hook and react framing;
    - the giant cup rebuilt (rotations);
    - sources framing and lane visibility;
    - the delay band made visible and kept in frame (wave clock + phase lock; sign fix).
  - Mix −14.58 LUFS, −1.6 dBTP, voice +15.9…+17.7 dB.
  - Pre-render caption sync fixed one late caption (boundary moved to 7.95 s).
  - Full render started.
- 2026-11-05: full render run 1 (`WORKERS=3 ./build.sh`, 9 m 49 s): all 25 checks + narration sync + caption sync pass;
  contact/boundary sheets reviewed; no re-render needed. Committed, pushed and attached. No further episode; no automation.

## QA summary (verification results; details in the output folder's qa/QA.md)
- Final MP4 sha256 `db4bbc78bcfe680f90b30fe308501c80010e0623e923e45518668aa301cf22e9` (8,330,597 bytes).
- H.264 High 1080x1920 yuv420p 30 fps, 900 frames; AAC-LC 48 kHz stereo; video/audio/container 30.000000 s; full decode clean.
- Hindi ASR on the final mix (Whisper medium, `hi`): CER 0.076; narration within 0.1 ms of plan; 10 spoken caption groups
  appear 0.03–0.13 s before their first word and stay past their last.
- −14.6 LUFS, −1.5 dBTP, 0 clipped samples; voice +15.9…+17.7 dB over bed; hook drone drops ~15 dB at ANC-on.
- Captions all Devanagari, ink x 164–907, y 342–484, ≤ 2 lines; font coverage true; labels/bubble central; no overlaps.
- Limits: ASR-only Hindi check (no native listener; I cannot listen); waves illustrative (one sourced reason isolated);
  "with AI" is the user's wording.

## Publishing caption
`production/30s/2026-11-05-feedback-05/publishing-caption.txt` is generated from `script.json`: the exact final spoken
transcript (l01–l05) + one illustration note + 2 sources + hashtags. App identity: Recall (रिकॉल); no other app names;
no editing instructions.

## Exact commands
`cd videos/recall/production/30s/2026-11-05-feedback-05 && WORKERS=3 ./build.sh` (mix → 900 frames → mux → qa/qa.py →
qa/narration_sync.py → qa/caption_sync.py).

## Next
Only on user request.
