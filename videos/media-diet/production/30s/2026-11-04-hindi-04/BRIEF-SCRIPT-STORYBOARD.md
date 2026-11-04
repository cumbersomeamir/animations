# 17 · Hindi episode hindi-04 — "Google Play Store (2 Nov 2026) now reminds you if Play Protect stays off"

Round: batch 2026-11-04 (user-authorised). Output: `videos/media-diet/production/30s/2026-11-04-hindi-04/media-diet-30s-hindi04-01.mp4`.
Previous MP4s preserved unchanged. Start state: branch clean at 3b1093c (= remote), no render/ffmpeg/voice/ASR processes,
so nothing needed checkpointing first.

## Brief (as given, condensed)
Hindi 30 s news episode: one verified official rollout from the last 14 days (21 Oct – 4 Nov 2026) that affects ordinary
people (phone safety, maps, scam prevention, accessibility or battery): what changed, who gets it, one concrete use, release
date/availability; no rumours shown as launched. Keep the accepted renderer/style/assets/pacing/CTA; Hindi narration and
Devanagari captions with a local Hindi-capable voice; about 60–75 Hindi words; ASR-only limitation recorded if listening is
not possible.

## Topic research and choice (history: not covered before)
Earlier episodes: internet message (pilot), airplane mode, noise cancelling, warehouse lidar, satellite SOS, SynthID (iOS 27.2).
Method: read official feeds/pages instead of search snippets — Google Keyword RSS (global, India, Android, Maps, Safety),
Apple Newsroom RSS, Google System Services Release Notes, Google Play Help. **Chosen:** Google Play Store **v53.9, dated
2026-11-02** in Google's System Services Release Notes — "you'll get a reminder if Play Protect stays off for a while" — with
Google Play Help for what Play Protect does and the exact path to keep it on. Released (dated release note), Android phones
with Google Play, directly useful against scam apps sent as links. Candidates not chosen (with reasons) are listed in the
output folder's SOURCES.md (Messages Enhanced protection = announced 14 Oct "coming weeks"; Circle to Search scam check 15 Oct;
Wallet Aadhaar ID 19 Oct; iOS 27.2 FaceTime captioner = same update as hindi-03; Apple Health = developer beta; Gmail
Security Checkup = how-to; Maps India alerts = Nov 2025).

## Feedback applied
- Satisfied design kept: the accepted renderer core (paper stock, light rig, palette, table/hills, vignette, bokeh), the
  accepted hindi-03 Devanagari caption treatment (Noto Sans Devanagari 700, 48 px, baselines 406/480 in the y 300–560 band),
  calendar and "?" props, the Media Diet sign and the Hindi CTA, the accepted audio recipe (pad without loops, event foley,
  −15 LUFS / −2 dBTP).
- Hindi voice: cached Kokoro-82M v1.0 native Hindi stock voices hf_alpha 0.7 + hm_omega 0.3, lang `hi`, speed 1.08 (the
  hindi-03 setting). The English af_bella/am_puck voices were not used.
- New scene mechanisms (distinct from earlier episodes): a big paper phone lying on the desk with a physical switch knob,
  a clock that races, a reminder card, a conveyor through a shield gate, a radar sweep, a harmful tile → warning → disabled →
  bin, and a settings sheet whose steps light as they are spoken.

## Narration (spoken) vs captions (written) — 74 words, 27.0 s of speech
| id | start–end (s) | spoken (Kokoro input) | caption | meaning |
|---|---|---|---|---|
| V1 | 0.20–2.46 | प्ले प्रोटेक्ट बंद करके भूल गये? | …भूल गए? | Turned Play Protect off and forgot? |
| V2 | 2.81–5.92 | दो नवंबर के गूगल प्ले स्टोर अपडेट के बाद, | 2 नवंबर के गूगल / प्ले स्टोर अपडेट के बाद, | After Google's 2 November Play Store update, |
| V3 | 6.27–10.53 | यह कुछ समय बंद रहा, तो ऐंड्रॉइड फ़ोन पर याद दिलाया जाएगा। | …एंड्रॉयड फ़ोन पर… | if it stays off for a while, an Android phone will remind you. |
| V4 | 10.88–16.38 | प्ले प्रोटेक्ट ऐप को इंस्टॉल पर जाँचता है, और फ़ोन को समय-समय पर स्कैन करता है। | same (2 cues) | Play Protect checks apps at install and scans the phone from time to time. |
| V5 | 16.73–21.86 | ख़तरनाक ऐप मिले, तो चेतावनी देता है, और उसे बंद या हटा भी सकता है। | same (2 cues) | If it finds a harmful app it warns you, and can also disable or remove it. |
| V6 | 22.21–25.70 | चालू रखें: प्ले स्टोर, प्रोफ़ाइल, प्ले प्रोटेक्ट, सेटिंग्स। | same | Keep it on: Play Store, profile, Play Protect, Settings. |
| V7 | 26.05–29.33 | टेक्नोलॉजी समझनी हो, तो मीडिआ डाइट फ़ॉलो करें। | …मीडिया डाइट… | Want technology explained? Follow Media Diet. (CTA, final 3.95 s) |

## Sources (checked 2026-11-04; quotes and claim map in the output folder's SOURCES.md)
Google System Services Release Notes — Google Play Store v53.9 (2026-11-02) · Google Play Help 2812853 *Use Google Play Protect
to help keep your apps safe & your data private* (what it does; on by default; "always keep Google Play Protect on"; path).

## Storyboard (as rendered; 7 shots, 6 cuts)
| time | shot | action tied to narration |
|---|---|---|
| 0.0–2.72 | S1 switch | big paper phone; the physical Play Protect knob slides OFF, the printed shield greys with a slash; "?" tag pops. |
| 2.72–6.18 | S2 date + update | calendar flips 31 अक्टूबर → 1 → 2 नवंबर; pan to the phone: update ring fills around "53.9" → ✓. |
| 6.18–10.79 | S3 reminder | clock hands race (time passes, switch still off); a reminder card (bell + shield-off glyphs) drops onto the screen and wiggles. |
| 10.79–16.64 | S4 how it protects | three new app tiles ride a conveyor through a shield gate (scan curtain lights) into the grid; camera rises; a radar sweeps the grid twice. |
| 16.64–22.12 | S5 harmful app | one tile turns magenta with a bug glyph; a warning tag pops; the tile greys out (disabled); it lifts into the paper bin (removed). |
| 22.12–25.96 | S6 keep it on | a settings sheet slides up; store → profile → shield → gear light in step with the words; the knob slides back ON, shield ✓. |
| 25.96–30.0 | S7 hero | pull-back over the desk; paper Media Diet sign hinges up (CTA). |

## Reusable adjustments for future Hindi episodes (this app only)
- Voice recipe: Kokoro-82M v1.0, hf_alpha 0.7 + hm_omega 0.3, lang `hi`, speed 1.08 → ≈ 2.7 words/s; 65–75 Hindi words fit
  30 s with ~0.3 s pauses and a 3–4 s CTA.
- Write numbers as Hindi words in the spoken text and as digits in captions. Keep a separate spoken spelling where espeak-ng
  misreads: "ऐंड्रॉइड" (not एंड्रॉयड), "मीडिआ" (not मीडिया — the medial ड gets flapped), "गये" (not गए), "सिंथ आई डी"; avoid
  "नए" before मॉडल (heard as "नहीं"). Check every take with Whisper medium (hi) before rendering.
- Pick news from official dated pages (release notes, newsroom/blog RSS), not search snippets; state the date in speech.
- Keep floating props (e.g. "?" tag) below the caption band (y > 560) and inside x 90–990; in hero shots keep the 2.6-unit
  sign ≥ 5.9 units from the camera so it fits the portrait frame.
- Hindi QA: score Whisper on per-line slices of the final mix (`asr_check_hi.py`) and check captions against the narration stem
  (`caption_sync.py`); a single full-length Whisper pass can stall on these mixes.

## QA summary (final export; full report in the output folder's QA.md)
- SHA-256 `aa815eb04ce787cd2513904d0be77b02ad5307e66720fd28740b30ff350c38d2` · 20,023,902 bytes · audio stream tagged `hin`.
- 900 frames · video 30.000000 s · audio 30.000000 s · container 30.000000 s · H.264 High yuv420p 1080×1920 30/1 · AAC 48 kHz stereo.
- Full decode clean · −14.9 LUFS / −2.0 dBTP · Devanagari caption ink y 362–494, x 202–875 · 0 safe-area violations in 900 frames.
- Caption ↔ speech (narration stem): 9/9 cues OK. Hindi Whisper medium on per-line slices of the final mix: CER 0.065, every line
  heard (a single full pass stalls after ~16 s — recogniser drift, not missing audio; speech is 14–27 dB above music/foley).
- Contact sheets inspected; the only visual defect (CTA sign clipped in the hero) fixed once by re-rendering frames 779–899.

## Limits
- I cannot listen to audio in this environment: pronunciation and intelligibility were checked only by phoneme inspection and
  Whisper-medium (hi) back-transcription; please listen once before posting.
- Google does not publish the reminder's exact wording or timing ("for a while"); the film shows a generic reminder card.
- Stock synthetic Hindi voice (no clone). No Desktop/video-review folder exists in this cloud container; the MP4 is attached
  in the session and pushed. No automation created.
