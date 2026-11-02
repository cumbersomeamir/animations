# Production notes — Ideaverse 30s feedback-01
"AI you use daily — how spam filters learn to sort email" · round 2026-11-02 feedback · branch claude-video/ideaverse

## Style (user correction, see context/11 "STYLE CORRECTION")
Restored the 15-second educational pilot look by reusing its engine, not re-imagining it:
`education/pilot-01/src/character/docket.js` copied unchanged (DOCKET geometry, materials, 8 face expressions, lip-sync
mouth bar, antenna spring); renderer/tone mapping/shadows, PMREM environment, hemisphere + warm key spot + mint rim +
blue fill, navy fog, floor grid, back wall panels, NEWSROOM neon sign, fov-44 eased camera keys with impact shakes, numeric
arm IK and the caption pill style are copied from `pilot.js` into `src/stage/spam.js`. Pilot props (terminal, answer box,
ribbon, book, stamp, chain) were removed; wall monitors show icons instead of text. Riso/paper/halftone/printer: none.
Reference frames compared before rendering: pilot at 1, 6 and 11 s (same palette, materials, lighting and character).

## Story → picture (narration word times in brackets)
| time | narration | picture |
|---|---|---|
| 0–2.9 | "Ever wondered how your inbox catches spam?" | an oversized suspicious envelope flies in; DOCKET catches it (crouch, antenna kick), skeptic face; carries it to the MAIL SORTER reader |
| 2.9–6.0 | "AI learns patterns from lots of examples:" | camera turns left; 18 example envelopes fly into two clusters, "LOOKS LIKE SPAM" (amber) / "LOOKS NORMAL" (mint); DOCKET points |
| 6.0–10.5 | "suspicious links [6.23], repeated sales language [7.33], and messages people flag [8.89]" | insert: magnifier from DOCKET's NOTES drawer; the live zoom lens finds and rings the link, the repeated BUY NOW line, the "Reported as spam" flags |
| 10.8–15.6 | "A new email gets a spam score [11.87], then your mail service decides where it belongs." | scan bar; SPAM SCORE needle swings HIGH; SPAM drawer pops, DOCKET drops the envelope in; a "Team lunch" email scores LOW → INBOX |
| 16.3–19.9 | "But a real message can be caught by mistake [17.80]." | a "Job interview: please confirm" email scores HIGH and lands in SPAM; DOCKET puzzled ("?") and shrugs |
| 19.9–25.6 | "If something important is missing [21.16], check your spam folder [22.0]." | DOCKET opens INBOX: dashed amber "missing letter" ghost; opens SPAM, lifts the interview out, NOT SPAM sticker slaps on, INBOX pops open, filed |
| 25.8–30 | "Explore more everyday AI with Ideaverse." | DOCKET to camera, wave; caption with the Ideaverse icon chip |

## Claims
All factual claims and their sources: context/15 (and publishing-caption.txt). Qualification kept brief: "a spam score"
is the general idea (Graham's per-message probability; Microsoft's SCL value), real services combine many signals.
Ideaverse is only named in the CTA; no claim that it filters email. All emails are invented EXAMPLEs (`.example` links).

## Captions / safe areas
Exact geometry exported per frame (`node render.mjs --caplog=../qa/caption-geometry.json`): pill x 92..988, y 344..520;
max 2 lines; 60 px Space Grotesk (50 px auto-fit for the longest line). Overlay draws nothing above y 340; the pilot's
top-left signature and bottom "illustrative" label were removed. Inserts were re-angled so no scene text sits in y < 300.

## Audio
Kokoro (cached) af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; placements s1 0.30 · s2 2.95 · s3 10.85 · s4 16.40 ·
s5 20.00 · s6 25.90 s. Score: quiet pad chords (one per 2.5 s), event-linked notes and SFX only (whoosh, catch thump,
drawer slides/clunks, paper flops, needle glides, pattern glints, "uh-oh" marimba, sticker slap); no kick/shaker/tick
loops. Music ducked ~8 dB under voice. Master: two-pass loudnorm −15 LUFS, TP −1.5 dBTP.

## Commands
See build.sh (render → encode → caplog → score → loudnorm → mux → qa.sh). Render: 900 frames, 3 SwiftShader workers.
