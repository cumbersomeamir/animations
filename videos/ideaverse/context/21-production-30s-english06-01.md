# 21 — Production 30s english06-01 (English): "Live captions can mishear numbers — check before you act"

Batch 2026-11-06-english-06 (user-approved). Workspace `production/30s/2026-11-06-english-06/` · deliverable `ideaverse-30s-english06-01.mp4`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed before edits).
Style: accepted DOCKET 15 s-pilot lesson style (feedback-05 renderer), English voice + captions.

## Topic choice (history check)
The suggested subject — photograph a care label and have AI translate the washing symbols — was already produced as
hindi04-01 (2026-11-04, context/19). Per the brief ("if this suggested subject already exists choose a fresh equally useful
subject"), this episode covers phone **live captions**: AI turns speech into on-screen text when you can't play sound, but it
can mishear numbers ("three fifteen" → "3:50"), so check times, names and numbers with the sender. Not covered before
(previous topics: prompts, prompt injection, voice-note to-do, spam filters, photo OCR, Magic Eraser, shopping-list meme,
care labels, notice checklist).

## Final transcript (Kokoro af_bella 0.7 + am_puck 0.3, en-us, speed 0.98) — 70 words, 21.8 s speech
| id | t (s) | line |
|---|---|---|
| s1 | 0.25 | Stuck on a noisy bus with a voice message you can't hear? |
| s2 | 3.75 | Turn on Live Caption on Android, or Live Captions on iPhone. |
| s3 | 8.30 | AI listens to the audio and types the words on your screen. |
| s4 | 12.60 | But it can get it wrong. Your friend said three fifteen. The caption says three fifty. |
| s5 | 18.40 | So for times, names and numbers that matter, check with the sender before you act. |
| s6 | 26.60 | Download the Ideaverse app. |
Wording change after ASR: "But it can mishear" (heard "miss here") → "But it can get it wrong."

## Sources (accessed 2026-11-06)
| claim | source |
|---|---|
| Android: Live Caption automatically captions speech on the device, incl. audio messages | Android Accessibility Help, "Live Caption: Caption media & calls on your device", https://support.google.com/accessibility/android/answer/9350862 — "With a single tap, Live Caption automatically captions speech on your device. You can use it on media like videos, podcasts, phone calls, video calls, and audio messages." Availability "may vary based on your device". |
| iPhone: the feature is called Live Captions; accuracy may vary | Apple iPhone User Guide, "Get live captions of spoken audio on iPhone", https://support.apple.com/guide/iphone/get-live-captions-of-spoken-audio-iphe0990f7bb/ios — "Live Captions is available on iPhone 11 or later… The accuracy of Live Captions may vary and shouldn't be relied upon in high-risk or emergency situations." |
| it can get numbers wrong → check with the sender | follows from Apple's accuracy note; "three fifteen" → "3:50" is an illustrative example, not a measured error rate |
| Ideaverse | name + current Play icon in the CTA only; no claim that Ideaverse captions audio |
Settings and chat screens are illustrations labelled EXAMPLE, not real Android/iOS UI; "Sam" is fictional.

## Storyboard
1. 0–3.6 wide hook: DOCKET sways on a "bus" (handrail + swinging straps, amber noise squiggles), phone shows a voice message
   from Sam with a muted-speaker badge "Too noisy to hear"; DOCKET puzzled.
2. 3.6–8.1 phone insert: Accessibility settings — Android "Live Caption" and iPhone "Live Captions" toggles flip on as named.
3. 8.1–12.4 phone insert: the voice message plays; a LIVE CAPTION box types "Meet me at the gate at 3:50" word by word.
4. 12.4–18.2 easel close-up: "Said vs. captioned" — Sam said 3:15 (mint clock), caption shows 3:50 (amber clock), "≠" + ring.
5. 18.2–25.5 phone insert: chips Times · Names · Numbers; DOCKET types "Is it 3:15 or 3:50?"; Sam replies "3:15! See you";
   the caption's 3:50 turns into "3:15 ✓" — mistake avoided.
6. 25.5–30 CTA: DOCKET waves; caption "Download the / [icon] Ideaverse app".

## QA / status — DELIVERED 2026-11-06
- Output: production/30s/2026-11-06-english-06/ideaverse-30s-english06-01.mp4 (QA.md in that folder).
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −14.9 LUFS.
- English ASR: all lines match; every word inside its caption; captions in spec; top band text-free.
- Publishing caption = final transcript (publishing-caption.txt), Ideaverse identity only.
