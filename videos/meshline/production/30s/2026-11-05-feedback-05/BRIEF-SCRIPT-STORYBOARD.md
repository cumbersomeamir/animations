# 18: Production 30s, batch 2026-11-05-feedback-05 (Hindi): "दीवार के पीछे हेडफ़ोन की आवाज़ क्यों टूटती है?" (why Bluetooth headphones break up behind a thick wall)

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-05-feedback-05/meshline-30s-feedback05-01.mp4`, sha256 `7ba35b646d94a35f6d446cb823f6afa8db338dca3d8e5189ddce6939e43c5099`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo (audio language tag `hin`).
- Checks:
  - full decode OK, no black or freeze;
  - −14.6 LUFS, −3.4 dBTP, voice/bed +22 to +26 dB;
  - Hindi ASR (whisper-medium): per-line CER 0.072, final MP4 CER 0.078 (only miss: "फ़ोन" after "हेडफ़ोन," in l2 merged by ASR; segment starts within ~0.25 s of caption starts);
  - Devanagari captions inside y 340–520 and x 90–990.
- Earlier renders are preserved and untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations` (origin), branch `claude-video/meshline`. The assigned account is amir@tensorblue.com (CLAUDE.md); commits use the session's noreply identity.
- **State:** the tree was clean at HEAD `fca78d9`. No render, TTS or ASR job was running, and the batch folder did not exist.
- **Isolation:** only Meshline files were read. The "Recall voice" named in the brief belongs to another app and was not used or opened; the Meshline Hindi voice was used.
- **Topic history:** not an exact repeat. Round 02 (English) mentioned walls only as one reach limit inside "direct vs routed", and Hindi 03 used earbuds only as a hook. This episode is a practical diagnosis with a test and the bars-vs-link comparison (see `research/claims.md`).

## Performance-sheet note (observation only)
- 8/8 reels show plays: 436 observed plays and 19 observed likes (7/8 like counts visible), with a median of 17 plays.
- Post ages differ and totals are cumulative, so no causal conclusion is drawn.
- This batch is a controlled topic/opening test: a familiar everyday problem, with the visual problem already happening in the first second. The approved style, voice and pacing are unchanged.

## Approved style kept (actual renderer, not Three.js)
- Node 22 + `@napi-rs/canvas` 2D Transit Map sheet renderer: `src/render.mjs`, `fonts_hi.mjs`, `caplayout.mjs` from Hindi 03/04. The scene is a new `src/wall.mjs` built with the same helpers and conventions:
  - charcoal sheet, blue ink, pen tips, paper veils;
  - coral only for problems;
  - one screen-space instrument;
  - Devanagari captions at 50 px in y 340–520;
  - CTA icon + wordmark at y ≈ 1462–1526.
- Voice: Kokoro-82M Hindi `hf_beta`, speed 1.0. Quiet pad bed with sparse glints, voice +22 dB or more over the bed.

## Final script (75 words)
| id | time (s) | line (Hindi) | English gloss |
|---|---|---|---|
| l1 | 0.20–3.48 | दीवार के पीछे गए, हेडफ़ोन की आवाज़ टूटने लगी? | Went behind the wall and the headphone audio started breaking up? |
| l2 | 3.90–7.24 | हेडफ़ोन, फ़ोन से ब्लूटूथ रेडियो पर सीधे जुड़ते हैं। | Headphones connect directly to the phone over Bluetooth radio. |
| l3 | 7.66–12.83 | मोटी कंक्रीट या धातु की दीवार सिग्नल कमज़ोर करती है; दूरी और रेडियो-शोर भी। | A thick concrete or metal wall weakens the signal; so do distance and radio noise. |
| l4 | 13.25–18.37 | जाँच: फ़ोन के पास, बिना दीवार आइए; आवाज़ सुधरे, तो वजह दूरी या रुकावट थी। | Test: come near the phone with no wall between; if the audio improves, the cause was distance or the obstruction. |
| l5 | 18.80–22.20 | सिग्नल बार मोबाइल टावर के हैं, हेडफ़ोन लिंक के नहीं। | Signal bars are about the mobile tower, not the headphone link. |
| l6 | 22.62–25.49 | सीधे लिंक को चाहिए: कम दूरी, साफ़ रास्ता। | A direct link needs short distance and a clear path. |
| l7 | 25.99–29.72 | पास वालों से ऑफ़लाइन बात के लिए मेशलाइन डाउनलोड करें। | Download Meshline to talk offline with people nearby. |

Edits during drafting:
- The first draft had 85 words and 29.3 s of speech; it was cut to 75 words.
- "रुकावट ही वजह थी" (the obstruction was the cause) became "वजह दूरी या रुकावट थी" (the cause was distance or the obstruction). The test changes both, so naming only the wall would overclaim.

## Sources
See `production/30s/2026-11-05-feedback-05/research/claims.md`: Bluetooth SIG range and tech overview (headphones named explicitly), and T-Mobile on bars. All were re-fetched on 2026-11-05.

## Storyboard (as rendered)
| Time (s) | Beat | Map action |
|---|---|---|
| 0–3.6 | Hook (problem visible from frame 1) | Home floor plan with a hatched "मोटी दीवार". The headphones token is already walking behind the wall. The dashed link from "आपका फ़ोन" breaks at the wall with coral sparks. The instrument waveform shows coral dropouts, and a coral "?" appears. Cartouche "हेडफ़ोन बनाम दीवार". |
| 3.6–7.6 | Direct link | Push in. The pen re-inks the "सीधा ब्लूटूथ लिंक" as audio packets ride it and fade after the wall. |
| 7.6–13.2 | Causes | Wide room. The wall flashes coral ("कंक्रीट / धातु"). Bluetooth bars step down. A dimension line "दूरी" is drawn. A second radio in the next room emits coral static ("रेडियो-शोर"). |
| 13.2–18.6 | Test | The camera follows the headphones back through the doorway to the phone. The link turns clean, the bars rise to 4 and the waveform becomes solid. A "✓ आवाज़ साफ़" stamp appears, then "वजह: दूरी या रुकावट". |
| 18.6–22.5 | Bars ≠ headphone link | Wide. The "मोबाइल टावर" and its blue line appear ("सिग्नल बार: यह लिंक"). The headphones step behind the wall again: the Bluetooth row drops (coral highlight) while the tower row stays at 4 bars (blue highlight). |
| 22.5–26 | Takeaway | The headphones return. "कम दूरी" and "साफ़ रास्ता" tags pop, and the link thickens. |
| 26–30 | CTA | The instrument fades and the Meshline icon and wordmark appear. Slow push-in. Caption "पास वालों से ऑफ़लाइन बात के लिए / मेशलाइन डाउनलोड करें". |

## QA
See `production/30s/2026-11-05-feedback-05/QA.md`.

## Reproduce
From the batch folder:
- `<kokoro-py> audio/voice_hi.py <kokoro_dir with hf_beta.bin> audio/narration.json audio/narration` (the WAVs are committed)
- `<asr-py> asr_hi.py lines <faster-whisper-medium> audio/narration asr_words.json`
- `PY=<py with numpy+scipy> ./build.sh`
- `./qa.sh`
- `<asr-py> asr_hi.py final <faster-whisper-medium> meshline-30s-feedback05-01.mp4 qa/asr_final.json`

## Next
Await review (a native-speaker listen is recommended). No automation was created, nothing was uploaded to Drive, and no other video was started.
