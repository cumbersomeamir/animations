# 27 — Production 30s english12-01 (English): "A familiar voice is no longer proof" (voice cloning)

Batch 2026-11-11-english-12 (user-approved "NEXT EDUCATIONAL EPISODE", Satisfied? column read 11 Nov 2026). Created once,
after english-09/10/11 were finished in order. Workspace `production/30s/2026-11-11-english-12/` · deliverables
`ideaverse-30s-english12-01.mp4` + `ideaverse-30s-english12-01-thumbnail.png`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse. Style: accepted pilot-01 DOCKET newsroom style via the latest
renderer; follows the new rules in context/11 "Approved feedback 2026-11-11".

## Topic check (history: context/09, 12–26)
- Proposed: "Why voice-cloning scams can sound like someone you know". Not covered before (english-06 was live captions
  mishearing; production-02 prompt injection; no synthetic-voice episode). Used as proposed.
- Story criteria: surprising mechanism (a short recording is enough for software to speak NEW words in that voice) +
  useful payoff (verify urgent requests on a separate, known channel). No procedural fraud detail; no real person
  imitated — "Sam" is a generic fictional caller with a plain silhouette; the narrator is the established DOCKET voice.
- Icon re-checked against the Play listing on 2026-11-11: og:image unchanged (5TopfIwT…), =s512 PNG pixel-identical to
  assets/icon.png (bytes differ only by PNG encoding) → no replacement (logged in 03-assets.json).

## Script (English, 72 words) — placements from ASR word timings; beats per the new pacing
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.25 | hook 0–3 | A familiar voice is no longer proof. |
| s2 | 3.00 | escalation 3–5 | This sounds like Sam. Sam never said it. |
| s3 | 6.00 | mechanism | From a short clip of Sam talking, software learns how Sam's voice sounds. |
| s4 | 10.70 | mechanism | Then it says brand-new words in that voice, and a familiar voice feels believable. |
| s5 | 16.00 | limit (proof of what it can't do) | But it copies the sound, not what Sam knows, like your family code word. |
| s6 | 21.00 | payoff 21–27 | So when a call urgently asks for money, hang up and call back on a number you already know. |
| s7 | 27.30 | CTA 27–30 | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en (ASR spells "codeword"; the checker treats it as "code word").
No duration number for the recording is claimed ("a short clip"), per the brief.

## Facts → sources (accessed 2026-11-11) — measured facts vs illustration
| claim | type | source |
|---|---|---|
| a familiar voice can be synthetic; criminals use short clips of a loved one's voice to ask for urgent money | documented (law-enforcement warning) | FBI Internet Crime Complaint Center, PSA I-120324-PSA "Criminals Use Generative Artificial Intelligence to Facilitate Financial Fraud" (3 Dec 2024), https://www.ic3.gov/PSA/2024/PSA241203 — "Criminals generate short audio clips containing a loved one's voice to impersonate a close relative in a crisis situation, asking for immediate financial assistance". |
| from a short clip, software learns how the voice sounds, then says brand-new words in that voice | published research mechanism | Jia et al., "Transfer Learning from Speaker Verification to Multispeaker Text-To-Speech Synthesis" (Google, NeurIPS 2018), https://arxiv.org/abs/1806.04558 — a speaker encoder makes "a fixed-dimensional embedding vector from seconds of reference speech from a target speaker"; a synthesis network "generates a mel spectrogram from text, conditioned on the speaker embedding" — including "speakers that were not seen during training". |
| a familiar voice feels believable | documented | FBI PSA — generative AI "increases the believability of their schemes". |
| it copies the sound, not what Sam knows → family code word | reasoning from the mechanism (input = voice clip + any text) + documented advice | FBI PSA tip — "Create a secret word or phrase with your family to verify their identity." |
| hang up and call back on a number you already know | documented advice | FBI PSA tip — "Verify the identity of the person calling you by hanging up the phone, researching the contact … and call the phone number directly." |
| Ideaverse | — | Name + current Play icon only. No claim that Ideaverse detects cloned voices. |
Illustrative (not measured): Sam, the clip, the "voice pattern" rosette, the call and contacts screens — all fictional EXAMPLEs.
Not used: the FTC consumer alert (Mar 2023) could not be fetched from this environment (bot-blocked), so it is not cited.

## Storyboard (cues.js) — one idea per card, large 1–3-word labels
1. 0–2.9 hook (easel close): phone ring; "SAM" + a voice wave grows, "✓ familiar"; on "proof" a red NOT PROOF stamp.
2. 2.9–5.6 escalation (two-shot): DOCKET answers Sam's call; bubble "Need money, fast!"; "Sam never said it" → NEVER SAID
   stamp + double take. (Card in the background only shows "SAM ✓ familiar".)
3. 5.6–10.35 SHORT CLIP (Sam talking, wave plays) → arrow → VOICE PATTERN (rosette) + "Sam's sound".
4. 10.35–15.6 NEW WORDS: "Need money, fast!" typed + voice pattern → output wave → SOUNDS LIKE SAM ✓.
5. 15.6–20.6 push-in: SOUND ✓ (copied) / WHAT SAM KNOWS ✕ with a lock + "code word".
6. 20.6–26.6 phone: urgent incoming call → hang up → Contacts → "Sam · saved number" → "I'm fine — not me!" ✓.
7. 26.6–30 CTA: DOCKET waves; caption "Download the / [icon] Ideaverse app."
Thumbnail (separate PNG, 1080x1920): the two-shot at 4.9 s (call + bubble + NEVER SAID) with "THAT / VOICE / LIED." in
three large lines (LIED. in amber), inside x 100..900.

## QA / status — IN PROGRESS
- Pre-render mix ASR: all lines MATCH, no word outside captions.
