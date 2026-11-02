# QA: meshline-education-pilot-01.mp4

## Technical verification (final render)
| Check | Result | Evidence |
|---|---|---|
| Video stream | H.264 High, yuv420p, 1080x1920, 30/1 fps, **450 frames**, 15.000000 s | `qa/ffprobe-summary.txt`, `qa/frames.txt` |
| Audio stream | AAC LC, 48 kHz stereo, 15.000000 s | `qa/ffprobe-summary.txt` |
| Container duration | **15.000000 s** | `qa/ffprobe.json` |
| Full decode | `ffmpeg -v error -i … -f null -` → no errors | `qa/decode.log` |
| Black/freeze | None (black ≥0.25 s, freeze ≥1.5 s) | `qa/black_freeze.txt` |
| Loudness | −15.0 LUFS integrated, LRA 2.4 LU, true peak −3.0 dBTP (no clipping). The last second still carries audio (−25.8 dB mean). | `qa/loudness.txt` |
| Narration intelligibility (300–4000 Hz voice vs music+SFX) | n1 +9.1 dB, n2 +14.2, n3 +11.7, n4 +10.0 | `qa/voice_balance.json` |
| Sound ↔ action sync | 78 cues exported from the animation timeline (bars, throw, taps, crest pings, gate passes, Dot's gate chime at 10.75 s, zip back, load, catch, plaque) | `qa/cues.json` |
| Representative sheet | 31 frames, every 0.5 s | `qa/contact-sheet.png` |
| Boundary sheet | 22 frames at every shot/caption transition (0.00, 0.30, 0.50, 1.20, 1.80, 2.40, 2.85, 3.20, 4.60, 5.50, 6.25, 6.90, 7.70, 9.00, 10.75, 11.00, 11.50, 12.00, 12.40, 12.70, 13.40, 14.96 s) | `qa/boundary-sheet.png` |
| SHA-256 | `a5bdbb97de1241d5adc470bb6eaac352f6c788ae69d1e4d28e339d76b1021256` | `qa/sha256.txt` |

## Editorial / visual assessment
- **One concept, three steps:** puzzle (0–2.5 s), mechanism (2.5–11 s), takeaway (11.4–15 s). No CTA, feature tour or slogan. The signature is small (48 px icon + 32 px wordmark at 62 % opacity, bottom right, from 12.9 s).
- **Performer:** Bix acts every beat: lights up, flexes, picks up, winds up, throws, taps, scratches, points, presents the meter, shrugs, foot-taps, catches and gestures. Dot performs the wait (sad face, foot tap, "your data" tag) and comes back with the page.
- **Physical mechanism:**
  - Many radio paths converge on one tower.
  - A visible FIFO queue spirals round the mast, crawling at a constant service rate through four lanes.
  - The queue grows behind Dot as more phones join.
  - Bars versus throughput are shown twice: the handheld meter (SIGNAL full, SPEED in the red) and the city board (SIGNAL full, SPEED PER PHONE draining).
- **Text bounds and readability:** captions are 70 px bold with 44 px subs on a dark plate, at y 210–390, inside the side margins. Board text is about 26–30 px. The plaque has an 86 px headline and a 42 px sub, centred. Everything was checked at full resolution, and no text touches a frame edge.
- **Continuity:** the same character positions persist across shots. The queue is simulated once and stays consistent across all four shots (still visible behind Bix in shot D). The phone's state goes spinner → page only after Dot returns.
- **Accuracy:** every claim is mapped in `research/claims.md`. The queue is labelled as illustration, and there are no numbers. Nothing is said about Meshline features.
- **Audio:** an original D-dorian marimba/pad score that thins out when the page stalls, builds during the crowd reveal and resolves on the takeaway. SFX are tied to actions. Speech-band clarity is at least +9 dB on every line.

## Defects found and fixed (in order)
1. Shot A/D cameras were too tight, cropping Bix and the plaque → reframed. Shot B lost Bix → camera put on the tower–Bix line.
2. The tower and gate sat behind the top caption in the wide shot → camera target raised.
3. The stadium board fell off the frame edge and its text was unreadable → enlarged, moved, redesigned as a vertical layout, and drawn above the packets.
4. The handheld meter covered the phone → moved to the far hand.
5. Dot covered Bix's face after the catch → Dot offset, then hops onto the phone.
6. Caption crossfades overlapped at 2.75 s and 9.0 s → retimed with a gap.
7. The board lingered into shot D → fades out at 11.0 s.
8. The returning Dot ballooned to full-frame as its path passed near the camera → on-screen size capped.
9. The opening voice line was masked (+5.0 dB) → deeper ducking, softer opening motif and bar bells. All lines are now ≥ +9 dB.
10. The bitrate was 9.9 Mb/s at CRF 16 → CRF 18 (8.0 Mb/s, 15 MB).

## Known limitations (honest)
- The voice is synthetic and has not been human-listened. Intelligibility was checked by speech-band level only; pronunciation was checked from phonemes.
- The queue is a teaching metaphor. Real cells schedule shared radio resources and do not form literal lines.
- The Instagram references were not viewed.
