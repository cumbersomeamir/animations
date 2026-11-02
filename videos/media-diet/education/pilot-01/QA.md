# QA — Media Diet · Nodo Explains 01

**Deliverable:** `videos/media-diet/education/pilot-01/media-diet-education-pilot-01.mp4`
Built with `bash build/build.sh` (SKIP_FRAMES=1 after the frame render); QA by `build/qa.sh`. Evidence in `qa/`.

## Iteration log (problems found → fixes → rerender)
| round | found by | problem | fix |
|---|---|---|---|
| stills v0 | stills contact sheet | Hook: Nodo off-frame left; Phone B hidden behind routers/server | Reframed shot 1; network hidden until "Nope", then rises from the floor (also a clearer visual metaphor) |
| stills v0 | stills | Medium shot: caption card over Nodo's head; bubble hidden behind head; held packet covered his face | Camera look-target raised; bubble path moved up-left; packet held at chest height |
| stills v0 | stills | Packets P1/P3 spawned at the same spot (index bug) | Explicit spawn offsets per packet |
| stills v0 | stills | Router "scan column" swallowed the riding Nodo | Replaced by a sweeping scan ring around the packet |
| stills v0 | stills | Server shot too tight: cutaway unreadable; "APP'S SERVERS" label under the caption | Wider low 3/4 camera; label moved onto the tower face |
| stills v0 | stills | Disclaimer overlapped Nodo in shots 4–5 | Disclaimer pill placed directly under the caption card (dynamic height) |
| stills v0 | stills | Stomp unreadable (raised leg foreshortened toward camera) | Nodo turns side-on; near (right) leg stomps; foot lands on the send button |
| stills v0 | stills | Final wide: Nodo clipped at bottom; dazed "sit" pose read as standing | Crane end reframed; sit replaced by a dazed landing crouch |
| v1 full render | dense contact sheet (every 10th frame) | Hop shot camera chased x and let Nodo slip off the left edge | Camera now tracks depth only and is pulled back; left/right hops read as a zigzag |
| v1 | contact sheet + full-res frame | Final wide: "APP'S SERVERS" label hidden behind the tower; hop badges 1/3 occluded; "FRIEND'S PHONE" label clipped at left | Crane ends on the screen-right side (sight-lines computed to clear the tower); label drawn on top above the roof; label re-centred |
| v1 | full-res frame 165 | "address label" callout covered the packet's tag edge | Callout moved to the upper-left of the tag with an arrow |
| v1 | audio timeline plot | Stomp thump transient sat on the first word "It" | Stomp SFX −3.5 dB |
| v1 | stills | Wi-Fi ROUTER label clipped at right edge; ROUTERS label drifted to the bottom edge | Labels repositioned; ROUTERS fades out at 8.1 s |
| v2 full render | text-bounds report (qa/text-bounds.json) | "YOUR PHONE" label entirely off-screen left in the hook (63 frames) | Label moved onto the visible right corner of Phone A; frames 0–80 re-rendered |
| v2 | full-res frame review | On "fly straight", Nodo pointed away from the beam | Gesture mirrored: he points along the beam toward the friend's phone |
| v2 | boundary contact sheet (cut 8.75 s) | Nodo off-frame left for ~6 frames after the cut | Short pan that follows his jump into the server shot |
| v2 | representative sheet / text-bounds | Wi-Fi ROUTER label half-hidden by Nodo, then sliding off the right edge; server label fading in under the disclaimer and at the right margin during the pan | Labels repositioned and re-timed; affected frame ranges re-rendered |
| final | text-bounds | 0 violations in 450 frames | — |

## Final verification (delivered file)
- **Path:** `videos/media-diet/education/pilot-01/media-diet-education-pilot-01.mp4`
- **SHA-256:** `ff387d9f6ef5409ffcadeb8aa9dceea5c6d98c6126ad9dfa3cc54128425bac05` · size 13,381,009 bytes · 7136 kb/s
- **ffprobe** (`qa/ffprobe.json`, checks in `qa/stream-checks.json`): H.264 High, yuv420p, 1080×1920, r/avg frame rate 30/1,
  **450 frames counted**, video duration **15.000000 s**, AAC-LC 48 kHz stereo audio duration **15.000000 s**,
  container duration **15.000000 s**. All 10 checks PASS.
- **Full decode:** `ffmpeg -v error -xerror -i … -map 0 -f null -` → exit 0, 0 bytes of errors (`qa/full-decode.log`).
- **Loudness** (`qa/loudness.txt`): integrated **−16.0 LUFS**, true peak **−1.5 dBTP**, LRA 1.8 LU; no clipping (peak −1.55 dBFS, flat factor 0).
- **Contact sheets from the encoded MP4:** `qa/contact-sheet-representative.png` (30 frames, every 0.5 s) and
  `qa/contact-sheet-boundaries.png` (frames −2…+2 around each cut at 2.65 / 6.32 / 8.75 / 10.70 s); `qa/first-frame.png`, `qa/last-frame.png`.
- **Text bounds:** `qa/text-bounds.json` — every visible caption, disclaimer, series tag, signature, callout and 3D label measured on all
  450 frames; **0 violations** of a 36 px frame margin. Captions sit 230–600 px from the top
  (clear of the platform UI zones). Minimum sizes: captions 64 px (82 px final), labels ≈45 px cap height, disclaimer 29 px.
- **Intelligibility (objective proxy):** offline Vosk ASR on the delivered audio (music + SFX included), word recall vs script
  **0.8** (`qa/asr-transcript.json`). Transcript: "does your message fly straight to your friend know it travels as packets eat with an address letters pass them along by hop usually via the app servers not one jump many handouts". Misses are near-homophones of a
  small ASR model ("nope→know", "each→eat", "routers→letters", "hand-offs→handouts"); every line is also captioned verbatim.
  I cannot listen to audio in this environment; pacing was set from measured line durations (2.5 words/s overall, ≥0.29 s gaps).
- **Audio timing:** `qa/audio-timeline.png` (narration windows, SFX cue ticks, picture cuts, ducked music, final mix).

## Inspection checklist
| area | result |
|---|---|
| Complete motion | Every shot has continuous character performance (point/chin-rub, nope, stomp, catch/inspect, toss/surf, land/point/peek/walk, tether, tumble/present/thumbs-up) plus moving props/camera; no static holds > 0.6 s except the final read hold, where camera drift, badge pulses and breathing continue. |
| Continuity | Cuts on action: toss→ride, jump-off→landing, yank→flying in. Packet/tag colours, Nodo design and screen states stay consistent; hop badges keep numbers; route trail persists into the final wide. |
| Transitions | 4 hard cuts with 3-frame 18 % cyan flash; boundary sheet shows no black/duplicate frames or pops. |
| Text readability | Caption card 80 % navy behind white/cyan/pink type; 1–2 lines; on screen ≥ narration line + 0.2 s. Address tag readable in the 4.75–6.1 s push-in. |
| Educational accuracy | Claims mapped in SOURCES.md (RFC 791, RFC 1812, Wikipedia Router, Apple iMessage, Signal, Briar, RFC 5737). "Usually" + on-screen "Simplified diagram…" caveat. No claim that all apps are peer-to-peer or server-relayed, and no claim about who can read encrypted content. Hop count illustrative. Chat UI invented. |
| App presence | 30 px "Media Diet" + icon signature 12.6–15 s only; no CTA, no product claims, nothing presented as Media Diet UI or data. |
| Audio | Narration on top, music ducked ≈ −6 dB under voice, SFX on action cues, end fade 14.55–15.0 s; −16 LUFS / −1.5 dBTP. |

## Known limitations (honest)
- The narration is a local neural TTS (Piper medium) with a light pitch shift; natural, but recognisably synthetic.
- Rendering uses SwiftShader WebGL (CPU); no motion blur or post bloom, glow is faked with additive sprites.
- The final wide shows the route from the Wi-Fi router to the friend's phone; the sender's phone is just above frame (shown in the hook).
- Reference accounts (@battysticky, @breakingbreach) were not viewed in this session; only the user's written description informed the quality bar.
