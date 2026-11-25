# 39 · English episode 24 (30 s) — "The safety net spread the crash." (Microsoft's report on the 12 Nov 2026 Outlook outage)

Output: `videos/media-diet/production/30s/2026-11-23-english-24/media-diet-30s-english24-01.mp4` (30.000 s, 1080×1920, 30 fps,
H.264 yuv420p + AAC). Thumbnail `…/thumbnail-english24-01.jpg` = frame 0. Batch 24 (authorised 23 Nov 2026). Batch 23 was already
complete (62dc6a7 = remote); no batch-24 checkpoint existed (the first attempt stopped at a disk check), so this episode starts fresh.
Session user videos2@tensorblue.com (CLAUDE.md lists info@tensorblue.com; noted, unchanged).

## Brief (verbatim essentials)
"One real technology announcement from the last 72 hours — and the mechanism it changes." As of 23 Nov 2026 find and verify a real dated
technology development from primary sources within 72 hours; avoid robotics recovery, charging, batteries and prior topics; a meaningful
consumer impact with one first-principles animated mechanism, not a montage; if no fresh story verifies use a clearly dated recent
development; never invent news or metrics; approved style; surprise-first opening. Read all prior topic records incl. batch 23's actual
subject; different core question, visual setting and mechanism; source notes in the project, not narration. 30.000 s 1080×1920
H.264/yuv420p + AAC; English narration and captions only; established voice; hook 0–3 s, optional super-hook 3–5 s, proof/build 5–21 s,
payoff 21–27 s, CTA 27–30 s; one idea per shot; one short headline + the spoken caption; captions ~y 280–460; vital information away from
the right side/bottom; soundtrack below a clear voice. Latest feedback: "No, topic can be more poweful, trendy like the one I created about
chicago bean. It should not be a hit or miss. Content is weak". Follow-up instruction (resume): preserve existing caches and prior work;
try a RAM-backed location / alternate volume for rendering, encoding and Git staging; report any exact remaining blocker.

## Subject (actual), topic-history check and feedback applied
Microsoft's Post Incident Report for Microsoft 365, dated **20 Nov 2026**, on the 12–13 Nov 2026 outage: a latent Windows defect (lock
contention) made busy network-gateway servers unresponsive; ~14 % of capacity was offline for routine updates and Teams traffic had
failed over onto the same gateways; at peak, the automatic traffic redistribution meant to make the service resilient moved load onto
fewer healthy servers and cascaded — more than 80 % of North American servers unresponsive within two hours, then every region. Impact
≈ 24 h for most Outlook/Exchange users; no mail lost; not a cyberattack. Planned fixes: partitioned gateway pools, smaller fault zones,
traffic fixes against cross-region cascades, gradual ramp-up/admission control, more headroom. Candidate B (Amazon Prime Air drone
struck a fiber cable, 20 Nov) rejected: mechanism under FAA investigation (app rule: reject unverified mechanisms). Zoox/VT pedestrian
sounds rejected (study from Sept 2026). No prior episode covered an outage or cascading overload; new question, setting (paper server
floor, server cutaway, stylised world map) and mechanism (load ÷ fewer servers → cascade; spare room and walls stop it).
Feedback applied: a trending, widely felt headline (Outlook down worldwide) + one surprising, verified mechanism ("the safety net spread
the crash") + a useful, general payoff ("rerouting needs spare room").

## Story and pacing
frame 0 / thumbnail: a receding row of paper gateway servers; the near ones frozen (frost, red LED, red overflowing gauge), a glowing red
rerouting net carrying mail onward to the still-green ones + "THE SAFETY NET / SPREAD THE CRASH." + chip "illustration · Microsoft 365
outage, 12 Nov 2026" → 1.8–5.47 s a paper laptop stuck on "Can't connect", mail piling up ("≈ 24 hours of disruption" + chip
"Microsoft's incident report · 20 Nov 2026") → 5.47–8.26 s server cutaway: requests queue at a one-at-a-time lock that jams; the server
frosts ("too busy → frozen" + chip "latent Windows defect: lock contention") → 8.26–11.28 s ten servers fed by one mail stream; one
freezes and its mail shifts to the rest (live "same traffic ÷ 9 servers = 10.0 each" + chip "Nov 12: ~14% of capacity offline for routine
updates") → 11.28–14.25 s the neighbours cross the limit line and freeze one by one ("4 left · 22.5 each (limit 10)" + "illustrative")
→ 14.25–18.58 s stylised paper world map: North American sites go dark outward from US East ("over 80% unresponsive" + chip "North
America, in under two hours") → 18.58–21.12 s traffic arcs spill to every region, their sites go dark ("every region hit") → 21.12–22.74 s
with spare servers the same failure is absorbed ("spare room absorbs it") → 22.74–25.9 s walls rise between pools; one pool freezes, the
others stay green ("walled-off pools" + chip "Microsoft's planned fix · report 20 Nov 2026") → 25.9–30 s CTA.

## Narration = captions (approved English voice) — 77 words, 26.5 s of speech
| id | start (s) | line |
|---|---|---|
| V1 | 0.05 | The safety net spread the crash. (hook; caption from frame 0, in capitals) |
| V2 | 1.90 | Microsoft just explained how Outlook went down worldwide. |
| V3 | 5.57 | A hidden bug froze servers that got too busy. |
| V4 | 8.36 | When one froze, its traffic shifted to the others. |
| V5 | 11.38 | The neighbors overloaded, froze, and passed it on. |
| V6 | 14.35 | In two hours, over 80 percent of North American servers froze. (caption "80%") |
| V7 | 18.68 | Then traffic spilled into every other region. |
| V8 | 21.22 | Rerouting needs spare room, so Microsoft plans walled-off server pools. |
| V9 | 26.00 | Follow Media Diet for the physics behind the headlines. (CTA, ends 29.12) |
Every take checked by Whisper medium ("Outlook's" lost its "s" and "froze too" was heard as "froze to", so both were rephrased).

## Operational (disk)
The root disk has 20 MB free (all earlier caches preserved, as instructed). The only writable volume with space is the RAM disk
(/dev/shm, 16 GB). This episode is therefore produced entirely in RAM: a sparse partial clone of the branch at /dev/shm/repo24 (only
context, assets and this folder checked out; shared three.js, fonts, voice models and the Python venv used read-only from disk), frames,
audio, encode, QA and Git staging/push from that clone. Encoded at the usual CRF 20. The disk checkout at /home/user/animations is left
untouched and is behind the remote after this push; updating it would need ≈ the MP4's size in free disk.

## QA / limits (final export; details in the output folder's QA.md)
SHA-256 9d95b22ec133a4a3bc4251ef52d81b905a89f7985392148ffd3613f2fb13b9d7 (15.8 MB, CRF 20); 900 frames; video/audio/container 30.000 s;
H.264 High yuv420p 1080×1920 30 fps; AAC-LC 48 kHz stereo (eng); full decode clean; −15.1 LUFS / −2.0 dBTP; captions ink y 360–488,
x 192–888; labels x 201–877, y 1342–1476; 0 violations; caption↔speech 10/10; Whisper 1.0 full pass and per line; 14 chunk starts
continuous. Thumbnail = frame 0 as JPEG (SHA-256 6ead15aa…bfa4), mean abs diff vs encoded frame 0 = 1.37/255.
Limits: illustrative load numbers; stylised map; Microsoft's fixes are planned; generic paper models; not yet watched or listened to by a
human.
