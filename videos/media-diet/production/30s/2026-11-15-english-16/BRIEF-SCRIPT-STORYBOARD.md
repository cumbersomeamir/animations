# 31 · English episode 16 (30 s) — "Ten fans. No jet fuel." (COMAC CE-25A electric airliner, first crewed flight)

Output: `videos/media-diet/production/30s/2026-11-15-english-16/media-diet-30s-english16-01.mp4` (30.000 s, 1080×1920, 30 fps,
H.264 yuv420p + AAC). Thumbnail `…/thumbnail-english16-01.png` = frame 0. Batch 16 (15 Nov 2026), queued after batch 15, which was
delivered first (9dea382 = remote) — batch 15 not repeated. First-frame rule, approved rules (context/26) and latest feedback applied.
Earlier outputs untouched. Session user videos2@tensorblue.com (CLAUDE.md lists info@tensorblue.com; noted, unchanged).

## Topic selection (recorded before the render finished) — exact event date: 14 November 2026
COMAC's CE-25A (10-tonne class, 19 seats, all-electric, ten wing-top ducted fans) made its first crewed flight on 14 Nov 2026 in Binzhou,
Shandong (Xinhua citing COMAC; Global Times; IE; configuration from AIN and The War Zone). Status: flight test; CAAC accepted the
type-certification application. Rejected: KIMM sound-from-the-screen display (official release 6 Oct 2026, not timely), Maxwell M1
(not flown), Stellantis dolly (patent), Starship/Bean/earlier topics. Sources and the facts/estimates split: the output folder's SOURCES.md.

## First frame + story and pacing
frame 0 / thumbnail: the paper airliner flying toward camera above sunset fields, all ten fan intakes visible + "Ten fans. / No jet
fuel." (5 words, the first narration line, on screen from frame 0) → 2.1–6.4 s the event (source chip) → 6.4–9 s the question ("So why
only about 400 kilometers?", ring on a map) → 9–20.6 s first principles (~50× energy per kilo → electric drives win back ~2× → still
~25× → batteries never get lighter) → 20.6–26 s takeaway ("Energy per kilo sets the range, so electric planes start short"; short hops
inside the ring) → 26–30 s CTA.

## Narration = captions (approved English voice) — 72 words, 26.0 s of speech
| id | start–end (s) | line |
|---|---|---|
| V1 | 0.05–1.86 | Ten fans. No jet fuel. (hook; caption from frame 0) |
| V2 | 2.15–6.21 | On November 14th, China's electric airliner flew its first crew. |
| V3 | 6.50–8.80 | So why only about 400 kilometers? |
| V4 | 9.10–13.25 | Jet fuel packs about fifty times more energy per kilo than batteries. |
| V5 | 13.55–17.07 | Electric motors waste less, winning back only about twice. |
| V6 | 17.40–20.38 | And a battery never gets lighter, while fuel burns off. |
| V7 | 20.70–24.73 | Energy per kilo sets the range, so electric planes start short. |
| V8 | 26.10–29.22 | Follow Media Diet for the physics behind the headlines. (CTA) |
Every take transcribed exactly by Whisper medium before use.

## Storyboard (one visual idea and one large label at a time)
| shot | time (s) | picture | label |
|---|---|---|---|
| S1 | 0–2.06 | airliner toward camera, ten fans spinning, clouds, sunset fields | (hook = caption) |
| S2 | 2.06–6.41 | the airliner passing over fields and clouds | small "COMAC CE-25A · first crewed flight · 14 Nov 2026", "editorial reconstruction" |
| S3 | 6.41–9.01 | schematic map: a 400 km ring grows around a city | 400 km (stated) |
| S4 | 9.01–13.46 | one kilo of jet fuel stacks 50 energy tiles; one kilo of battery pack, one | ~50× energy per kilo |
| S5 | 13.46–17.31 | half the fuel tiles turn red and drift off as waste heat | still ~25× |
| S6 | 17.31–20.61 | two planes on scales: fuel block shrinks during the flight, battery block stays | battery weight stays |
| S7 | 20.61–26.0 | short hops drawn inside the ring; a small airliner flies one | short hops first |
| S8 | 26.0–30 | Media Diet sign under the airliner | — |

## QA / limits (final export; details in the output folder's QA.md)
SHA-256 e6bef02fc5aaaebaf892dec2300a1451a47b091dba7cd73e11cb10a7e4ae6717; 900 frames; video/audio/container 30.000 s; H.264 High yuv420p
1080×1920 30 fps; AAC-LC 48 kHz stereo (eng); full decode clean; −15.2 LUFS / −1.9 dBTP; captions ink y 342–534, x 193–887; labels x 203–876,
y 1358–1456; 0 violations; caption↔speech 11/11; Whisper-medium per-line recall 1.0 on every line; single full pass 0.861 because Whisper
dropped the final CTA sentence in its one-window decode (the CTA alone decodes exactly; CTA level equals the previous line). Thumbnail = frame 0
(SHA-256 9f8bfb2c…8fda), mean abs diff vs encoded frame 0 = 1.49/255.
Limits: generic reconstruction (no COMAC footage); ~50×/~2× are published estimates, ~25× derived; flight testing, not certified;
nobody has listened to or watched the final file yet.
