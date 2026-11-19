# QA: courtlens-30s-english22-01.mp4 (English, India; batch 22) + thumbnail

- Video: `videos/courtlens/production/30s/2026-11-19-english-22/courtlens-30s-english22-01.mp4`
  sha256 `592900abd62ccd2c60e44b0ac1ad98049d98270f4cbd0720940c0bffd0a44fc2` (24457841 bytes)
- Thumbnail: `courtlens-30s-english22-01-thumbnail.png` (PNG 1080x1920; = frame-zero composition + series chip)
  sha256 `5716faf1c11dd39ce256f7416cf18bde761503c36201c52eff5dbb6dcb2577a3`

Machine-readable: `qa_report.json`, `asr_check.json`. Decoded from the final MP4: `frame-zero.jpg`,
`contact-sheet-1fps.jpg`, `transition-frames.jpg` (38 beats and cuts), `final-frame.jpg`. Caption bounds and frame
zero: `src/capcheck.py <mp4> <thumb> <out> 230 470 470 545` (caption band y 230–470; chip band excluded).

## Automated checks (all PASS, on the final file)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness / clipping | −16.2 LUFS integrated, LRA 2.1 LU, true peak −2.4 dBFS (no clipping) |
| Narration placement | 10/10 English lines at planned start +3 ms (similarity 0.95–0.98) |
| Pacing | hook 0.05–1.12 s; superhook 1.35–3.93 s; proof 4.20–19.77 s; distinction 20.05–22.89 s; payoff 23.15–26.55 s; CTA 26.95 → 29.90 s (final 3.05 s) |
| First frame | Decoded frame 0 is the full composition: a thick 3D valet ticket ("VALET 047") with keys, its red fine-print line "PARKED AT OWNER'S RISK" glowing, a cyan halo, and the hook words "YOUR CAR. YOUR RISK?" (mean luma 208/255; no fade or logo intro). It matches the thumbnail at mean abs diff 1.67/255 outside the chip band (99th percentile 8.0: the thumbnail's red-line glow is set slightly stronger). Voice starts at 0.05 s. |
| Caption band (19 Nov brief: y≈280–460) | Caption ink in decoded frames (every 3rd frame): **x 117..884, y 285..452** |
| Top zone y<280 | 180 sampled frames, darkest pixel 205/255 → clear. qa.py's zone moved from y<300 to y<280 to match the brief. |
| Captions | 16 English chunks, ≤ 2 lines, non-overlapping; at most the caption plus one short pill on screen |
| Bottom/right controls | Pills sit at y≈1356–1456 and vital labels at x ≤ 900. The torn stub (19.1–19.9 s) and entering props pass through the edges only in motion. |
| Missing assets | none: Inter faces, the icon and all drawn props render (frames reviewed) |
| Render | 900/900 frames, no capture retries (full re-render after the transition fix); then frames 0–125 re-rendered in place for the SFX/swing retime, with neighbours 126–128 bit-identical |

## English audio/caption timing check (ASR-only; limitation stated)
- **Not performed:** nobody watched the video in real time or listened to the audio. The listening proxy is a local
  faster-whisper "medium" (language=en) run on the final mix.
- **Final mix:** full WER **0.012**.
  - Lines 1–9 are word-perfect: "Your car, your risk", "parked at owner's risk", "The Supreme Court ruled in 2019",
    "takes your keys", "even if the valet service is free", "must prove it took proper care", "can't excuse its own
    negligence", "Parked it yourself … doesn't apply", "Report any damage right away in writing".
  - The only miss is the brand in line 10, heard as "Courtlands" (an ASR spelling, as in all accepted episodes).
- **Caption alignment:** all recognised words fall inside the on-screen caption window (`words_outside_captions = []`).

## Visual review (decoded frames)
- **Frame zero / hook:** the 3D ticket with keys and a sheen sweep; the red line flares on "parked at owner's risk".
- **Proof, one condition per shot:**
  - SUPREME COURT / 14 NOV 2019 stamp
  - keys fly to the valet's key board and a care shield grows over the car: ✓ HOTEL'S CARE
  - a FREE tag swings onto the stand: ✓ STILL COUNTS
  - the car vanishes to a dashed outline (lost), then returns scratched (damaged)
  - the PROOF weight drops on the hotel's pan: HOTEL MUST PROVE
  - the owner's-risk line is struck and its stub torn off: NEGLIGENCE: NO EXCUSE
  - self-park bay: you drive in, then appear with your keys ✓; the shield can't form ✕: NO HANDOVER
- **Payoff:** the ticket ✓ and a note being written: ✓ IN WRITING.
- **CTA:** the Courtlens icon, arc and "Follow Courtlens / Everyday Indian law, explained" (unchanged layout).
- **Transitions:**
  - scenes now cross-fade (the incoming scene starts 0.18 s early), so content carries through every cut
  - the hook → stamp cut (≈4.0–4.2 s) and the payoff entry (≈23.0–23.3 s) still show a brief light frame while the
    stamp and ticket spring in, under 0.3 s each

## Defects found and fixed
- **Stills review, before the full render:**
  - Frame zero: the keys covered "VALET" and "No." collided with "047", so the keys now hang outside the card and
    "No." was removed.
  - The FREE tag covered the stand's VALET sign, so it moved up.
- **First full render, decoded review:**
  - The hook caption's ink reached y 277 (above the brief's ~280). The hook is now 90 px, centred lower (ink
    y≥285).
  - Near-empty dips at 4.1, 14.3, 16.4 and 23.1 s became cross-fades.
  - The car drove through the standing figure (≈20.4 s), so the figure and keys now appear after the car parks.
  - The episode was fully re-rendered.
- **ASR on the final mix:**
  - l1 was heard as "Your car **at** your risk": the key-jingle SFX at 0.3 s masked "car. Your".
  - The keys' swing and jingle moved into the pause after l1 (1.2 s), and the opening paper rustle was softened.
  - Frames 0–125 were re-rendered and the audio re-muxed. l1 is now word-perfect.
- **Narration before synthesis:** the payoff line was reordered to end on "in writing" (heard as "in riding"
  before), and l9 shortened for a comfortable pace.
