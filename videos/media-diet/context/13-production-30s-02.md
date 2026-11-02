# 13 · Production 30s-02 — "How noise cancelling headphones create quiet"

Batch: production-30s-2026-11-02-batch-02 (user-authorised). Output: `videos/media-diet/production/30s/2026-11-02-batch-02/media-diet-30s-production-02.mp4`.
Format rules + user feedback: context/11-production-format.md (section "Updates from the user's feedback (batch-02)").

## Brief (as authorised, condensed)
Genre: tech news & breakthroughs / everyday tech explained. Style: Visual Investigation STYLE.md (read-only art direction).
Topic: how noise cancelling headphones create quiet. Scene: open a headphone evidence case, reveal microphones and driver,
slow two opposing waves to cancel low-frequency sound, then contrast speech and ear cushion. 30.000 s, 65–80 words,
same Kokoro voice config, voice upfront, −14…−16 LUFS, TP ≤ −1 dBTP, captions ink y 350–470.

## User feedback captured for future episodes
- 30s-01 reviewed and preserved; never regenerate its topic. Keep the approved Visual Investigation identity.
- No decorative motion disconnected from narration; purposeful transitions; fresh storyboard (no trims/recolours).
- Make the hook and payoff useful; explain the mechanism visibly through scene changes.
- Reuse cached voice/runtime and rendering assets to keep renders fast; no new characters.

## Draft → final script (Kokoro af_bella 0.7 + am_puck 0.3, speed 0.98, en-us) — 69 words, 22.9 s of speech
Draft (72 words): "Noise cancelling headphones do not build a wall around your ears. Microphones listen to surrounding sound, and the
electronics generate an opposing waveform. When the waves meet, part of the noise is reduced. This works especially well with
steady low rumbles, like an engine. Sudden voices and sharp sounds are harder to cancel. The ear cushions also block sound
physically. So the quiet you hear comes from two different mechanisms working together."

| id | start | end | final line | edit |
|---|---|---|---|---|
| V1 | 0.25 | 3.51 | Noise cancelling headphones don't just wall off your ears. | accuracy: cushions *are* a wall (passive), so "don't just"; shorter hook (3.25 s) |
| V2 | 3.85 | 8.25 | Microphones listen to the noise, and electronics create an opposing wave. | timing (wording kept close) |
| V3 | 8.70 | 11.33 | When the waves meet, part of the noise is reduced. | unchanged |
| V4 | 11.80 | 14.90 | This works best on steady, low rumbles, like an engine. | timing ("especially well with" → "best on") |
| V5 | 15.35 | 18.44 | Voices and sudden, sharp sounds are harder to cancel. | clarity ("Sudden voices" → "Voices and sudden") |
| V6 | 18.95 | 21.11 | Ear cushions also block sound physically. | unchanged ("The" dropped) |
| V7 | 23.05 | 26.03 | So the quiet comes from two mechanisms working together. | timing ("you hear", "different" dropped) |
| V8 | 26.50 | 27.76 | A snug fit helps both. | added payoff (practical, sourced: Bose + Sony) |

## Sources (checked 2026-11-02; verbatim quotes in the output folder's SOURCES.md)
- S1 Apple Support 108918 *Active Noise Cancellation and Transparency modes for AirPods* (published 2026-09-14):
  outward-facing microphone(s) detect external sounds, countered with anti-noise; an inward-facing microphone listens inside the ear.
- S2 Sony Help Guide WF-SP800N *What is noise canceling?*: built-in microphones, "equal-but-opposite canceling signal";
  works primarily on low-frequency noise; "Although noise is reduced, it is not completely canceled."
- S3 Sony Help Guide WF-SP800N troubleshooting: effective at low frequencies (airplanes, trains…), "not as effective … human
  voices"; use earbuds that feel more sealed when noise canceling/low frequencies feel insufficient.
- S4 Bose *How Do Noise Cancelling Headphones Work?* (2026-04-27): "two technologies working together: passive isolation and active
  noise cancellation"; passive isolation from ear cups, padding and fit; steady sounds easier than sudden; voices harder; "a better seal helps".
- Background only: Kuo & Morgan, "Active noise control: a tutorial review", Proc. IEEE 87(6) 1999, doi:10.1109/5.763310.
Claim map: C1 V1→S4 · C2 mics→S1,S2,S4 · C3 opposing wave→S1,S2,S4 · C4 reduced not zero→S2,S4 · C5 low steady→S2,S3,S4 ·
C6 voices/sudden harder→S3,S4 · C7 cushions block→S4 · C8 two mechanisms→S4 · C9 snug fit helps both→S4 (passive), S3 (active).

## Storyboard (as rendered; one bench; cuts on the 0.5 s grid at narration boundaries)
| time | layout | what happens (each motion tied to the line) |
|---|---|---|
| 0.0–3.5 | L1 evidence case | latch (0.45) → lid hinges open (0.55) revealing generic over-ear headphones; "wall" dashed around one cup (1.75); rings on both outer mics + "+ ?" (2.75). |
| 3.5–8.5 | L2 cutaway (schematic) | noise wave reaches the outer mic (3.6); outer mic ringed (3.95), inner mic ringed (4.45); dashed signal path to electronics (5.9); anti-noise leaves the driver toward the ear (6.9). |
| 8.5–11.5 | L3 waveform chart | playhead (slowed, ms readout) draws noise, anti-noise and "what reaches your ear"; residual ringed: "reduced, not zero". |
| 11.5–15.0 | L4 chart · engine rumble | steady low wave nearly cancelled; ✓ "mostly cancelled". Tag "Sony · Bose: low, steady noise". |
| 15.0–18.5 | L5 chart · voice/sudden | bursts and a sharp click survive in "what reaches your ear"; two rings, "gets through". |
| 18.5–21.5 | L6 cutaway · cushion seal | big outside wave, small inside wave; cushions ringed; "passive", "ANC off in this view". |
| 21.5–26.0 | L7 board | ACTIVE ✓ mics + anti-noise, ✓ best on steady low rumble, ⬚ voices/sudden harder; PASSIVE ✓ cushions/padding/fit, ✓ block physically; brace → "QUIET" (24.35, bed drops). |
| 26.0–28.0 | L8 fit check | a leak gap at the cushion lets a wave in (26.05); snug fit closes it (26.75); ✓ active ✓ passive (27.35). |
| 28.0–30.0 | L9 evidence map | three source tags linked to the cutaway; signature; Dm add9 + vibraphone; fade 29.2–30.0. |

## QA summary (final export; full report in the output folder's QA.md)
- SHA-256 `f077ae0bfb37b1ac84905cec0b2379421404183c5a584b42f641effd2d7a69d8`
- 900 frames · video 30.000000 s · audio 30.000000 s · container 30.000000 s · H.264 High yuv420p 1080×1920 30/1 · AAC 48 kHz stereo.
- Full decode clean · −15.1 LUFS / −1.9 dBTP · caption ink y 361–462 · 0 safe-area violations in 900 frames.
- One ASR + timing pass: word recall 0.986 (only "canceling"/"cancelling" spelling), every line inside its window.
- Contact sheets (representative + all 8 cut boundaries) inspected; fixes listed in QA.md.

## Limits
- Meshline cache absent in this container; production 01's cached Kokoro-82M v1.0 + agreed config reused.
- Schematic physics (no product measurements). No automation created.
