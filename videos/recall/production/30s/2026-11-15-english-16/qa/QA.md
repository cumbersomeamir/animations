# QA — `recall-30s-english16-01.mp4` (English) + thumbnail

- **File:** `videos/recall/production/30s/2026-11-15-english-16/recall-30s-english16-01.mp4`
- **sha256:** `e8b53219cef6a754bde8508d21233d43c38866cce5b40b90ea072ce62889750a`
- **Size:** 12,190,738 bytes
- **Thumbnail:** `recall-30s-english16-01-thumbnail.png`, 1080x1920 PNG, sha256 `62c8eaf30107005df6e34f17f69969d1b644019859c4d64c62d74a63014eb3fc`

**How it was checked:** `qa/qa.py`, `qa/narration_sync.py` and `qa/caption_sync.py`. Raw outputs are in `qa_report.json`,
`ffprobe.json`, `narration_sync.json`, `caption_sync.json`, `audio_report.json` and `cue_table.json`. Caption checks use the
batch area (ink inside x 100–900 and y 230–1500; nothing in y 0–230); labels must sit inside x 100–900, y 560–1460.

**Result: all 25 automated checks pass, and so do narration sync and caption sync** on the first full render (no re-render
needed).

## First frame (batch rule)
| check | result |
|---|---|
| frame 0 content | the performer gasping (raised brows, "O" mouth) at a voice note on the lime phone, lime wave-fronts travelling to their ear, plus the title "THAT IS / MY VOICE?" (4 words) at full opacity; no logo intro, no fade from black, no empty set |
| title bounds | 128 px Fredoka, ink x 217–863, y 355–591 (inside x 100–900, y 230–1500) |
| frame 0 = thumbnail | decoded frame 0 of the final MP4 vs the thumbnail, pill area excluded: mean absolute difference 1.58/255 (p99 6.0, i.e. compression only) |
| hook audio | the play tap at 0.00 s; the narrator says the title words from 0.05 s (measured 0.050 s) |

## Streams and decode
| check | result |
|---|---|
| video | H.264 High, 1080x1920, yuv420p, 30/1 fps, **900 frames** counted by full decode, 30.000000 s |
| audio | AAC-LC 48 kHz stereo, 30.000000 s |
| container | 30.000000 s |
| full FFmpeg decode (`ffmpeg -v error -i … -f null -`) | exit 0, empty stderr |
| black frames / static runs | none (min frame luma 66.8 > 12); longest static run 7 frames (limit < 60) |
| missing assets | none: fonts load (`document.fonts.check` true for every caption), the Recall icon loads (end pill and thumbnail) |

## English narration and audio
| check | result |
|---|---|
| language / voice | English, Kokoro v1.0 with the established Recall blend af_bella 0.7 + am_puck 0.3, en-us, speed 0.98; generated fresh for this script. No cloned or celebrity voice |
| ASR, final mix | faster-whisper base.en: **WER 0.0**. Transcript: "That is my voice. Your friends hear this voice every day. You hear yourself two ways. Through the air, from your mouth to your ears. And through bone, your skull carries the vibrations to your inner ears. That inner path changes the sound, and only you get it. A microphone only catches the air path, like everyone else's ears. Plug your ears and hum. It gets louder. That's the bone path. Download Recall to turn your study material into lessons." |
| hook intonation | the TTS reads "That is my voice?" with a falling (stunned) contour, not a rising question (YIN pitch track); ASR punctuates it as a statement |
| loudness (EBU R128, final MP4) | **−14.8 LUFS**, true peak **−1.5 dBTP** (−1.6 dBTP in the mix before AAC), LRA 2.5 LU, **0 clipped samples** |
| voice over bed | +15.7 … +20.3 dB per line; the synthesised hum (22.38–23.45 s) sits in a gap between lines |

## Narration timing (cross-correlation in the decoded final audio)
| line | planned (s) | measured (s) | error | corr | on screen |
|---|---|---|---|---|---|
| l01 | 0.05 | 0.050 | −0.1 ms | 0.85 | hook_phone (frame 0: the gasp + title) |
| l02 | 1.30 | 1.300 | 0.0 ms | 0.84 | hook_phone (voice note playing) |
| l03 | 4.45 | 4.450 | −0.2 ms | 0.84 | model_intro (head cross-section; both paths previewed) |
| l04 | 6.10 | 6.100 | −0.1 ms | 0.83 | model_air (lime wave-fronts mouth → ear canal: "air") |
| l05 | 8.60 | 8.600 | 0.0 ms | 0.84 | model_bone (amber pulses through jaw and spine: "bone", then "inner ear") |
| l06 | 13.10 | 13.100 | 0.0 ms | 0.84 | model_only (waves leave, amber stays inside: "only you") |
| l07 | 16.50 | 16.500 | 0.0 ms | 0.82 | model_mic (giant phone records the waves: "air only") |
| l08 | 21.15 | 21.150 | 0.0 ms | 0.84 | payoff_plug (fingers into the ears) |
| l09 | 23.60 | 23.600 | −0.1 ms | 0.85 | payoff_plug → model_plug at 24.50 ("bone path") |
| l10 | 26.45 | 26.450 | 0.0 ms | 0.84 | cafe_wide (CTA, Recall pill) |

## Caption ↔ speech alignment
- All 13 spoken caption groups appear 0.05–0.07 s before their first spoken word and stay until their last (the title group is
  on screen from frame 0; its words are spoken 0.05–0.54 s).

## Layout and glyphs (renderer box log, all 900 frames)
| check | result |
|---|---|
| captions are English | yes: no non-Latin characters |
| caption ink bounds | title (0–1.23 s) x 217–863, y 355–591; all other captions **x 213–867, y 341.5–464.5**; ≤ 2 lines; 56 px (long lines 48–54 px) |
| y 0–230 | nothing drawn (`top_0_230_clear`) |
| labels | 6 brief labels ("air", "bone", "inner ear", "only you", "air only", "bone path"), **one at a time**, inside x 110–890, y 562–1441; no overlaps with captions or the brand pill |

## Visual review
**What was checked:** the contact sheet (one frame per second) and the boundary sheet (first and last frame of all 10 shots, plus
each caption start), both decoded from the final MP4, and the thumbnail. Every boundary frame shows the right caption and
label for its shot (no stale overlay); hard cuts only.

**Fixed before the full render (from three preview passes):** the hook was too tight (phone and wave-fronts over the mouth, title
over the eyes); the wave-fronts were edge-on to the camera and read as a lightning bolt (now turned to face the camera); the gasp
read as a grin (mouth narrowed into an "O"); the payoff close-up hid the hands (wider lens); amber dots drawn over the performer's
face read as a beard (replaced by a cut to the head model with a fingertip in the ear canal); the giant phone was cut off at the
frame edge; the bone pulses were too dense and the cochlea too small; the "only you" label sat on the plinth (moved to the ear).

## Limits (honest)
- **I cannot listen.** The listen-through was done as measurements only: ASR of the final mix, narration cross-correlation,
  loudness, true peak, clipping, voice-over-bed levels and a pitch track of the hook line. No human listening check was performed.
- The hook "That is my voice?" is delivered with falling intonation by the TTS (the brief's exact words were kept).
- The head cross-section is simplified (the outer ear, canal and cochlea are drawn on the section); pulse paths and speeds and
  the hum sound are illustrative. Fingers in the ears as occlusion is an everyday inference from the earplug/earmold studies.
- The user's review folder is not reachable from this cloud session, so nothing was saved there; the MP4 and thumbnail are
  attached in chat and committed to the branch.
