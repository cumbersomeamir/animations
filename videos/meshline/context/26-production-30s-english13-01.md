# 26: Production 30s, batch 2026-11-13-english-13 (English): "How two phones talk with no SIM card"

## Status: COMPLETE
- Output: `videos/meshline/production/30s/2026-11-13-english-13/meshline-30s-english13-01.mp4`, sha256 `a4058778b427a2b1fa08de07322aa4bb8b90990645107e28bde31272c02d7964`.
- Thumbnail: `…/meshline-30s-english13-01-thumbnail.png` (1080x1920, "NO SIM. / STILL / TALKING?"), sha256 `1843c9ec…f892`.
- Format: 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p + AAC LC 48 kHz stereo.
- Checks:
  - full decode OK, no black or freeze;
  - −15.0 LUFS, −4.1 dBTP, voice/bed +17.7 to +23.0 dB;
  - final-MP4 ASR WER 0.0;
  - captions inside x 100–900 and y 230–1500.
- No human listen-through. Earlier outputs are untouched.

## Pre-flight
- **Repo, branch, account:** repo `cumbersomeamir/animations`, branch `claude-video/meshline`, the existing Meshline Code chat. The mapped account is amir@tensorblue.com; commits use the session's noreply identity.
- **Read first:** CLAUDE.md, `05-progress.md`, context 00–25, the animation-direction skill and the episode log.
- **Isolation:** no other app's visuals, voice, CTA or assets. English only, with the established narrator (Kokoro 0.7 af_bella + 0.3 am_puck, 0.98).

## Topic (history checked)
- **Topic:** "How two phones can talk while both have no SIM card". Not covered before.
- **Nearest earlier episodes:** 04 (direct radio vs internet route), 05 Hindi (airplane mode radios), 14 (wall loss and relays).
- **New distinction:** the SIM is a carrier identity checked by the network; Bluetooth is a separate radio with its own pairing keys; plus the real prerequisites. Prior-episode narration was discarded; all lines are new.

## Story (Theory of Marketing)
- **Thumbnail:** "NO SIM. / STILL / TALKING?"
- **Hook:** SIMs pop out of both phones, yet a message hops across: "How?"
- **Build + proof:**
  - a SIM is not a radio but a carrier ID + key (3GPP TS 31.102 / 33.102);
  - the network's challenge/response check;
  - SIM-less phones get no carrier service.
- **Answer:** Bluetooth is a separate radio; phones pair with their own keys (Bluetooth SIG; NIST SP 800-121).
- **Constraint:** limited reach; walls cut it.
- **Payoff:** Bluetooth on + allow Nearby devices (Android 12+), no SIM needed.
- **CTA:** "Get Meshline while online, then message nearby offline." It uses listing facts only, plus the plain fact that installing needs a connection. No range, SIM, Bluetooth, emergency or long-distance claim is made for the app.

## Final script (66 words)
| id | time (s) | line (captions show "SIM"; the TTS text uses "sim") |
|---|---|---|
| l1 | 0.25–3.85 | Neither phone has a SIM, yet a message hops across. How? |
| l2 | 4.55–7.81 | A SIM is not a radio. It's your carrier ID card. |
| l3 | 8.51–11.87 | The network checks it before allowing calls or mobile data. |
| l4 | 12.57–17.50 | Bluetooth is a separate radio, pairing nearby phones directly with their own keys. |
| l5 | 18.20–20.84 | Its reach is limited, and walls cut it further. |
| l6 | 21.54–25.59 | Just switch Bluetooth on and allow Nearby devices. No SIM needed. |
| l7 | 26.19–29.55 | Get Meshline while online, then message nearby offline. |

## Storyboard (as rendered)
| Time (s) | Beat | Action |
|---|---|---|
| 0–4.3 | Hook | SIMs pop out of both phones; "no SIM" ×2; an envelope hops the dashed link ✓; "?". Instrument: mobile network "no SIM" / Bluetooth "message ✓". |
| 4.3–8.3 | The SIM | Big SIM card; radio icon ✕ "not a radio"; "carrier ID + key". |
| 8.3–12.4 | The check | "carrier network" tower: "?" down, ✓ back, "calls · data"; coral ✕ to both SIM-less phones, "no SIM, no carrier service". |
| 12.4–18 | Bluetooth | Radio rings on both phones; keys meet and lock, "paired"; a message hops. |
| 18–21.3 | Constraints | The phone drifts away ("limited reach"); a wall drops ("walls", ✕); then both return. |
| 21.3–26 | Prerequisites | Chips one at a time: "Bluetooth on", "Nearby devices", "No SIM needed"; the instrument is hidden. |
| 26.2–30 | CTA | Paper veil, icon and wordmark. |

## Production notes
- **3GPP FTP blocked:** 3GPP's FTP showed a bot-check page on 2026-11-13. The same specs were taken from ETSI (`etsi.org/deliver/etsi_ts/1xxyyy/...`); ETSI TS 1xx yyy = 3GPP TS xx.yyy.
- **TTS:** Kokoro spells the capitalised "SIM" as letters. Use lower-case "sim" in `narration.json` and keep "SIM" in captions. A contraction such as "isn't" can be misheard ("is in"), so prefer "is not" when the meaning hinges on the negation.
- **No third-party logos:** the Bluetooth rune is a trademarked logo. Draw a generic radio-wave glyph and use the word "Bluetooth" only descriptively.

## Reproduce
From `production/30s/2026-11-13-english-13/` (`$S` = the scratchpad with the venvs and models):
- `$S/venv/bin/python ../../../education/pilot-01/audio/voice.py $S/kokoro audio/narration.json audio/narration`
- `$S/asr/bin/python asr.py lines $S/whisper-base.en`
- `PY=$S/venv/bin/python bash build.sh`
- `bash qa.sh`
- `$S/asr/bin/python asr.py final $S/whisper-base.en meshline-30s-english13-01.mp4 qa/asr_final.json`
- `node src/render.mjs --thumb meshline-30s-english13-01-thumbnail.png`

## Next
Await review. Nothing else is queued. No automation was created and nothing was uploaded to Drive.
