# 31 — Production 30s english16-01 (English): "Nobody said the wake word. So why did the speaker wake up?"

Batch 2026-11-15-english-16 ("NEXT EDUCATIONAL EPISODE", batch16; follows the finished batch15). Workspace
`production/30s/2026-11-15-english-16/` · deliverables `ideaverse-30s-english16-01.mp4` + `ideaverse-30s-english16-01-thumbnail.png`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed clean at cc1741f; no job running, nothing queued).
Style: accepted pilot-01 DOCKET newsroom style via the latest renderer; 2026-11-11 rules + first-frame rule (context/11).

## Topic check (history: context/09, 12–30)
- Proposed: "Why AI can find a humming song when you know none of the words" (hum → melodic fingerprint, compared).
- Already covered: **english11-01** (context/26, "Name a song you can only hum": the hum becomes the shape of the melody
  and is compared with songs; likeliest matches; check before trusting) → replaced.
- Chosen (same genre: everyday audio AI with a useful, non-obvious mechanism, a verified consumer behaviour and an equally
  strong opening): **smart-speaker wake words** — why a speaker wakes when nobody said the wake word (on-device check of
  short snippets; nothing sent until a snippet is close enough; sound-alikes from TV cross the line; lower the sensitivity).
  Not covered by any earlier episode (live captions english-06, hum english-11, voice cloning english-12, hearing aids
  english-13 are different mechanisms).
- The narration never speaks a real wake phrase, so playing the video cannot wake viewers' speakers.

## Script (English, 76 words) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.20 | hook + real question | Nobody said the wake word. So why did the speaker wake up? |
| s2 | 4.00 | mechanism | On standby, a tiny on-device model checks short snippets of sound for the wake word. |
| s3 | 9.55 | mechanism | Nothing is sent until a snippet sounds close enough. |
| s4 | 12.85 | proof (measured) | Researchers played TV at smart speakers, and every show woke one up. |
| s5 | 17.55 | proof (example) | "Maybe I don't like the cold" woke a Google speaker. |
| s6 | 21.00 | payoff | So if a Google speaker wakes too often, lower its sensitivity in the Home app. |
| s7 | 27.20 | CTA | Download the Ideaverse app. |
All lines transcribed exactly by base.en and small.en (punctuation aside) on first synthesis.

## Facts → sources (accessed 2026-11-15)
| claim | type | source |
|---|---|---|
| on standby it checks short snippets of sound for the wake word, on the device; nothing is sent until then | documented (Google) | Google Assistant Help, "How Google Assistant is designed for your privacy", https://support.google.com/assistant/answer/11091714 — "When Google Assistant is in standby mode, your device processes short snippets of audio to detect an activation"; "When in standby mode, it won't send what you're saying to Google servers or anyone else. After Google Assistant detects an activation, it exits standby mode and sends your request to Google servers. This can also happen if there is a noise that sounds like 'Hey Google'". |
| "a tiny on-device model" | published method (product internals beyond "processes snippets on the device" are not public) | G. Chen, C. Parada, G. Heigold (Google), "Small-footprint keyword spotting using deep neural networks", ICASSP 2014, https://research.google.com/pubs/archive/42537.pdf — "a keyword spotting system with a small memory footprint, low computational cost … based on deep neural networks"; must "run in computationally constrained environments such as modern mobile devices. Running the system on the device avoids latency…" · T. N. Sainath, C. Parada (Google), "Convolutional Neural Networks for Small-footprint Keyword Spotting", Interspeech 2015, https://www.isca-archive.org/interspeech_2015/sainath15b_interspeech.pdf — "'Ok Google' … continuously listens for specific keywords … This keyword spotting (KWS) system runs on mobile devices, and therefore must have a small memory footprint … The current KWS system at Google uses a Deep Neural Network". |
| researchers played TV at smart speakers, and every show woke one up | measured | D. J. Dubois, R. Kolcun, A. M. Mandalari, M. T. Paracha, D. Choffnes, H. Haddadi, "When Speakers Are All Ears: Characterizing Misactivations of IoT Smart Speakers", PoPETs 2020, https://petsymposium.org/popets/2020/popets-2020-0072.php — 134 hours of content from 12 TV shows, played twice; Mon(IoT)r Lab summary, https://moniotrlab.khoury.northeastern.edu/publications/smart-speakers-study-pets20/ — "All shows cause at least one device to wake up at least once"; "almost all activations that are detected locally (device lit up) are also sent to the cloud". |
| "Maybe I don't like the cold" woke a Google speaker | measured (example; reproducible ≥3 times in the study, 2019–20 devices) | Mon(IoT)r Lab summary — for the Google Home Mini, reproducible activations included "maybe I don't like the cold". Stated in the past tense; current devices may behave differently. |
| if a Google speaker wakes too often, lower its sensitivity in the Home app | documented (current) | Google Nest Help, "Adjust the 'Hey Google' sensitivity of your speaker or display", https://support.google.com/googlenest/answer/16765977 — "Your voice assistant might activate even when you didn't say 'Hey Google' … If this happens often, you can make it less sensitive"; path in the Google Home app (Gemini for Home voice assistant or Google Assistant → "Hey Google" sensitivity); "available on most smart speakers and displays". |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse speaker or voice feature. |
Not used on screen: activation rates (0.95/h for one device–show pair; 4.26/h summed for one show), durations, other brands'
example phrases. Also noted, not narrated: lowering sensitivity can make the speaker miss you in a noisy room (Google: "might
not activate … in a noisy environment … make it more sensitive").
Illustrative (not measured): the TV show and its figures, the speaker design, the chip, the snippet tiles, the match meter, its
values and both threshold positions, the settings screen (EXAMPLE).

## Storyboard (cues.js)
1. 0–3.85 hook: DOCKET in the newsroom living corner, a TV line in subtitles ("…Maybe I don't like the cold."), the speaker's
   ring glowing; WHO WOKE IT? from frame 0; head tilt on "wake up?".
2. 3.85–9.5 x-ray close-up: the speaker turns translucent, a small chip glows (ON DEVICE); snippets fly from the TV into it,
   each checked (chip flash) and dropped.
3. 9.5–12.7 pull back: the cloud stays dim (NOTHING SENT); a match meter twitches low; its wake line appears (CLOSE ENOUGH?).
4. 12.7–17.3 card: 12 show tiles appear (12 TV SHOWS), then each gets a lit-ring badge (12 OF 12).
5. 17.3–20.85 the line plays: its snippet pushes the meter over the line; the ring lights (DOCKET startled); the audio flies
   to the cloud (SENT).
6. 20.85–25.4 DOCKET's phone: Sensitivity slider Default → Less (LESS SENSITIVE).
7. 25.4–26.85 the same line again: the meter stays under the raised line, the ring stays dark (STAYS ASLEEP).
8. 26.85–30 CTA "Download the / [icon] Ideaverse app."
Thumbnail: the hook scene + "WHO / WOKE IT?".

## QA / status — DELIVERED 2026-11-15
- Output: production/30s/2026-11-15-english-16/ideaverse-30s-english16-01.mp4 · sha256 8ee36342…8520, plus
  ideaverse-30s-english16-01-thumbnail.png ("WHO / WOKE IT?"). QA.md in that folder.
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −15.0 LUFS / −1.4 dBTP.
- English ASR on the final MP4: all seven lines MATCH, no word outside its caption; caption text inside x 100..900; top band text-free.
- Limitation: ASR-only listening check (no by-ear listen possible here).
