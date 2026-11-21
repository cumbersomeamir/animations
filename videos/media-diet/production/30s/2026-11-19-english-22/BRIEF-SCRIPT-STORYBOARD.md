# 37 · English episode 22 (30 s) — "Five minutes. What's the catch?" (the physical bottleneck behind a five-minute EV charge)

Output: `videos/media-diet/production/30s/2026-11-19-english-22/media-diet-30s-english22-01.mp4` (30.000 s, 1080×1920, 30 fps,
H.264 yuv420p + AAC). Thumbnail `…/thumbnail-english22-01.jpg` = frame 0. Batch 22 (authorised 19 Nov 2026), started 19 Nov, interrupted
by a worker restart before its first commit, finished 21 Nov before batch 23 (brief: "finish any checkpointed prior batch22 work first").
Session user videos2@tensorblue.com (CLAUDE.md lists info@tensorblue.com; noted, unchanged).

## Subject (actual) and feedback applied
BYD Flash Charging: the Fangchengbao Tai 9 (Ti 9) launch (19 Nov 2026) with BYD's 10→70 % in 5 min claim on a 66.48 kWh second-gen LFP
Blade pack, and BYD's Abu Dhabi press demo (reported 13 Nov 2026) measured at 5:17 to 70 % and 8:57 to 97 %. One question: why can't a
megawatt charger just pour it in? Answer from first principles: lithium plating when ions are rushed, Joule heat ∝ current², so the
battery sets the pace (slower when full or cold). Payoff: five-minute claims mean the middle of the battery. Tesla Megacharger (18 Nov)
compared and rejected.

## Story and pacing
frame 0 / thumbnail: a huge glowing charging nozzle hanging over a small battery with a tiny lit gate + "FIVE MINUTES. / WHAT'S THE
CATCH?" → 1.8–6.4 s the claim (paper SUV at a flash charger, pulses in the cable; "10→70% in 5 min (claim)" + date chip) → 6.4–8.2 s
question (the surge jams at the port) → 8.2–12.4 s measured curve (steep to 70 % at 5:17, bending to 97 % at 8:57; "last 27%: 3 min 40 s")
→ 12.4–17.3 s cell cross-section (ions into graphite sheets; rushed → lithium plating) → 17.3–19.2 s heat (cell glows, thermometer;
"heat ∝ current²") → 19.2–22.9 s the battery sets the pace (slow tail glows, frost; "BYD claim at −30 °C: 20→97% in 12 min") → 22.9–26.2 s
payoff (gauge, fast middle band; "fast zone: the middle") → 26.2–30 s CTA.

## Narration = captions (approved English voice) — 82 words, 26.5 s of speech
| id | start (s) | line |
|---|---|---|
| V1 | 0.05 | Five minutes. What's the catch? (hook; caption from frame 0, in capitals) |
| V2 | 1.86 | BYD's new SUV claims 10 to 70 percent in five minutes. |
| V3 | 6.46 | Why not just pour in a megawatt? |
| V4 | 8.27 | But in a demo, the last 27 percent took almost four minutes. |
| V5 | 12.51 | Lithium ions must squeeze into the anode; rushed, they plate as metal. |
| V6 | 17.39 | And heat grows with current squared. |
| V7 | 19.32 | So the battery sets the pace, slowing when full or cold. |
| V8 | 22.99 | Five-minute claims mean the middle, not empty to full. |
| V9 | 26.23 | Follow Media Diet for the physics behind the headlines. (CTA, ends 29.35) |
Every take checked by Whisper medium ("Tai 9" was heard as "TI-9", so the model name is on screen only; ASR number map five→5, four→4).

## Operational
Disk ~108 MB at the start of 21 Nov with two episodes due, so this and the next episode are encoded at x264 CRF 20 (was 17) and the QA
contact sheets are saved as JPEG; frames/stills/QA frames/intermediate WAVs on the RAM disk /dev/shm/md-e22. Nothing on disk deleted.

## QA / limits (final export; details in the output folder's QA.md)
SHA-256 093ffc82e6d85cd7209bb9eb998307901ef8399eceb48d2da07b38d2cf79cb91; 900 frames; video/audio/container 30.000 s; H.264 High yuv420p
1080×1920 30 fps (CRF 20 for disk); AAC-LC 48 kHz stereo (eng); full decode clean; −15.2 LUFS / −1.9 dBTP; captions ink y 360–488,
x 194–886; labels x 203–877, y 1344–1478; 0 violations; caption↔speech 10/10; Whisper full pass 0.976, per line 0.988 (V4 0.917: "27%"
vs "27 percent"); chunk-start continuity checked (no glitches). Thumbnail = frame 0 as JPEG (SHA-256 d5888ea1…d829), mean abs diff vs
encoded frame 0 = 2.05/255.
Limits: 10→70 % in 5 min is BYD's claim; measured times from a press demo of an unnamed test vehicle; interpolated curve; generic paper
models; not yet watched or listened to by a human.
