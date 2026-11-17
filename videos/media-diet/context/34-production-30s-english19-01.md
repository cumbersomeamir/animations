# 34 · English episode 19 (30 s) — "Tiny label. Big problem." (Genesis AI's robot-arm demo and the label it struggled to peel)

Output: `videos/media-diet/production/30s/2026-11-17-english-19/media-diet-30s-english19-01.mp4` (30.000 s, 1080×1920, 30 fps,
H.264 yuv420p + AAC). Thumbnail `…/thumbnail-english19-01.png` = frame 0. Batch 19 (17 Nov 2026), after batch 18 was delivered
(0c3e43a) — not a repeat. First-frame rule, approved rules (context/26) and the latest feedback (Bean benchmark; Bean not repeated) applied.
Earlier outputs untouched. Session user videos2@tensorblue.com (CLAUDE.md lists info@tensorblue.com; noted, unchanged).
Operational: the session disk allowance is almost full (~150–200 MB free), so this episode's frames, stills and QA frames live on the RAM
disk /dev/shm/md-e19 (symlinked as frames/, .cache/stills, .cache/qa_frames; gitignored). Nothing from earlier episodes was deleted.

## Topic selection (recorded before the render finished) — date: 17 Nov 2026
TechCrunch (17 Nov 2026) watched Genesis AI's model drive two off-the-shelf robot arms that packed boxes, folded a box shut, taped it and
applied a label; on a rerun the robot fumbled a box and "had a heck of a time peeling the tiny adhesive label". Mechanism: force data from
sensor gloves worn by 100+ workers and by the robots. Constraint (company statement): the dexterous hands last "a few weeks of regular work"
before replacement. First principles: Kendall's thin-film peel law, F/b = G/(1 − cos θ) → ≈ 66× more force at 10° than at 90° (ideal film).
Rejected candidates (Penn muscles: paper 7 Sep; Howl: simulation only; Skydio F10: announced 24 Sep; Remedy: January visit) in SOURCES.md.

## First frame + story and pacing
frame 0 / thumbnail: a light sensor-gloved robot hand with its fingertip on a tiny yellow label on a liner strip, a taped box behind +
"Tiny label. / Big problem." (4 words, the first narration line, on screen from frame 0) → 1.9–6.5 s the event (two arms pack a box, fold
the flaps, run tape; source chip) → 6.5–9.1 s escalation (rerun: the fingertip slides over the label) → 9.1–11.4 s question (box vs label)
→ 11.4–16.4 s first principles (big peel cutaway: flat pull ≈ 66× force, straight up easy) → 16.4–19 s the hard part (lift the first edge)
→ 19–23.75 s mechanism + constraint (same sensor glove on a worker's hand and the robot's; the robot hand wears) → 23.75–25.9 s takeaway
(lift a corner, pull steep: the label comes off) → 25.9–30 s CTA.

## Narration = captions (approved English voice) — 87 words, 26.5 s of speech
| id | start (s) | line |
|---|---|---|
| V1 | 0.05 | Tiny label. Big problem. (hook; caption from frame 0) |
| V2 | 2.00 | Robot arms run by Genesis AI packed a box and taped it shut. |
| V3 | 6.60 | On a rerun, the tiny label fought back. |
| V4 | 9.20 | So why is a sticker harder than a box? |
| V5 | 11.50 | Pull it nearly flat, and it takes dozens of times more force than pulling straight up. |
| V6 | 16.50 | So the hard part is lifting that first edge. |
| V7 | 19.15 | Genesis trains touch with sensor gloves, but its hands wear out in weeks. |
| V8 | 23.85 | Lift a corner, then pull steep. |
| V9 | 26.10 | Follow Media Diet for the physics behind the headlines. (CTA, ends 29.22) |
Every take transcribed exactly by Whisper medium before use ("taped a box" was heard as "taped to box" and rewritten; the first draft ran
~28 s and was tightened).

## Storyboard (one visual idea and one large label at a time)
| shot | time (s) | picture | label |
|---|---|---|---|
| S1 | 0–1.9 | gloved fingertip on the corner of a tiny label; taped box behind | (hook = caption) |
| S2 | 1.9–6.5 | from above: a hand lowers a small box into a big one, flaps fold, tape runs along the seam | small "Genesis AI demo · TechCrunch · 17 Nov 2026", "editorial reconstruction" |
| S3 | 6.5–9.1 | the fingertip slides across the label; it barely lifts and drops back | rerun |
| S4 | 9.1–11.4 | camera moves from the box down to the tiny label strip | — |
| S5 | 11.4–16.4 | big peel cutaway: film pulled nearly flat with a huge red arrow, then straight up with a small green arrow | flat pull ≈ 66× force (+ small "ideal thin film, 10° vs 90° (Kendall 1975)") → straight up: easy |
| S6 | 16.4–19.05 | the fingertip lifts the label's first edge | lift the edge |
| S7 | 19.05–23.75 | the same sensor glove on a worker's hand (blue sleeve) and the robot's hand; pads glow; then the robot glove scuffs | same sensor glove → hands last weeks |
| S8 | 23.75–25.92 | corner lifted, then pulled steep: the label comes off | corner, then steep |
| S9 | 25.92–30 | Media Diet sign; the box behind it | — |

## QA / limits (final export; details in the output folder's QA.md)
SHA-256 4b9a8f877de20a0a693ab896fb8a429bce1a820bcc2634051ac7ffd01445419b; 900 frames; video/audio/container 30.000 s; H.264 High yuv420p
1080×1920 30 fps; AAC-LC 48 kHz stereo (eng); full decode clean; −15.1 LUFS / −2.0 dBTP; captions ink y 340–534, x 194–887; labels x 204–875,
y 1354–1484; 0 violations; caption↔speech 11/11; Whisper-medium recall 1.0 full pass and 1.0 per line. Thumbnail = frame 0
(SHA-256 d9f44118…67d8), mean abs diff vs encoded frame 0 = 1.78/255.
Limits: generic reconstruction (no Genesis footage); cause of the rerun trouble not reported — the peel law is general physics (ideal film);
"hands wear out in weeks" is a company statement; nobody has listened to or watched the final file yet.
