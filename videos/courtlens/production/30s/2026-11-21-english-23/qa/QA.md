# QA: courtlens-30s-english23-01.mp4 (English, India; batch 23) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-21-english-23/courtlens-30s-english23-01.mp4`
  sha256 `8ac285b09c85f9d5eedea53e37fe659eac4884ea2ced5f0ede1c70b80546ffe4` (24713676 bytes)
- Thumbnail: `courtlens-30s-english23-01-thumbnail.png` (PNG 1080x1920; = frame-zero composition + series chip)
  sha256 `3971a769b510b8fff6687d06f7c0d58ca175b7a57c2f2857f198160bb523f6fd`

Machine-readable: `qa_report.json`, `asr_check.json`. Decoded from the final MP4: `frame-zero.jpg`,
`contact-sheet-1fps.jpg`, `transition-frames.jpg` (38 beats and cuts), `final-frame.jpg`. Caption bounds and frame
zero: `src/capcheck.py <mp4> <thumb> <out> 230 470 470 545`.

## Automated checks (all PASS, on the final file)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −16.3 LUFS integrated, LRA 3.1 LU, true peak −2.4 dBFS (no clipping); mix gain 7.4 dB |
| Narration placement | 10/10 English lines at planned start +3 ms (similarity 0.94–0.98) |
| Pacing | hook 0.05–1.02 s; superhook 1.40–4.52 s; proof 4.95–21.70 s; payoff 22.20–25.16 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| First frame | Decoded frame 0 is the full composition: the windshield view of a night POLICE barricade with red/cyan light glow, the road and a cone; the dashboard with an empty wallet slot "?" and the phone glowing with a licence; "PAPER OR PHONE?" (mean luma 165/255; no fade or logo intro). It matches the thumbnail at mean abs diff 1.55/255 outside the chip band (99th percentile 5.3). Voice starts at 0.05 s. |
| Caption band (y≈280–460) | Caption ink in decoded frames (every 3rd frame): **x 113..885, y 285..449** |
| Top zone y<280 | 180 sampled frames, darkest pixel 205/255 → clear |
| Captions | 13 English chunks, ≤ 2 lines, non-overlapping; at most the caption plus one short pill (app tiles carry their names) |
| Bottom/right controls | Pills sit at y≈1356–1456 and vital labels at x ≤ 900. The dashboard fades out by y≈1480. |
| Missing assets | none: Inter faces, the icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames, no capture retries. Frames 0–150 were re-rendered in place to make frame 0 identical to the thumbnail; neighbours 151–153 plus spot frames 600 and 899 are bit-identical. |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody watched the video in real time or listened to the audio. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.013**.
  - Lines 1–9 are word-perfect after normalisation: "license" and "offense" are US spellings of licence/offence.
  - The proper nouns are heard as "DigiLocker" and "M. Parivahan".
  - The only miss is the brand in line 10, heard as "Courtlands" (an ASR spelling, as in all accepted episodes).
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames)
- **Hook:** the windshield checkpoint (lane dashes rolling, lights flashing); the lights flare on "traffic check"; the
  empty wallet slot pulses on "at home". Chip shown.
- **Proof, one condition per shot:**
  - INDIA / MOTOR VEHICLE RULES stamp
  - the plastic licence turns and flies into the phone: ✓ ELECTRONIC FORM
  - DigiLocker and mParivahan tiles pop, each linking to the phone ✓
  - card = phone: SAME AS ORIGINAL
  - the officer's device scans → VERIFIED ✓; a dashed PAPER copy gets ✕: NO PAPER DEMANDED
  - the device logs OFFENCE, the record flies to an online database → RECORDED: RECORDED ONLINE
- **Payoff:** the phone, a tap on "+ ADD", the licence slides in with a glow ✓: ADD IT NOW.
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained" (unchanged layout).
- **Transitions:** crossfades carry content through every cut. Incoming props slide in from the frame edges at 11.8 s
  and 14.05 s. The stamp slam overscans the frame for about 0.2 s (series style).

## Defects found and fixed
- **Stills review:** the dashboard ended in a hard horizontal edge (y≈1480), so it now fades into the paper and the
  steering wheel is clipped.
- **First full render:**
  - Frame 0 differed from the thumbnail (mean 2.81/255, 99th percentile 20.7) because of the light phase, glow and
    wallet pulse. Their t=0 values now equal the thumbnail's; frames 0–150 were re-rendered.
  - **Final-mix ASR:** l5's "M Pari-vaahan" was transcribed as "M. Perry Vaughan". The TTS spelling became "em
    Puh-ree-vaa-hun" (tested: heard "M. Parivahan"), l5 was re-synthesised and the audio re-muxed. All checks above were
    re-run on that file.
- **Narration before synthesis:**
  - "DigiLocker" was voiced "Diggy Locker", so it is spelled "Diji Locker"
  - "Stopped at…" was heard "Stop to…", so it became "You're stopped at…"
