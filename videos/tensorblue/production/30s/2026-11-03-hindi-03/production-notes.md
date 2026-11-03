# Production notes — batch `2026-11-03-hindi-03` · 30s · episode 01 (Hindi)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-03-hindi-03/tensorblue-30s-hindi03-01.mp4`
(copy of `videos/tensorblue/context/16-production-30s-hindi03-01.md`). All earlier MP4s are preserved unchanged.

## Brief (user-approved, 3 Nov 2026)
- **Topic:** Why a password manager can keep your passwords without knowing your master password — local encryption and the locked-vault mechanism, explained plainly, without claiming every implementation is identical.
- **History check:** not covered before (earlier episodes: CDN caches, optimistic updates, idempotency keys, raster vs vector).
- **Latest user correction (overrides older language rules):** ALL spoken narration and captions in natural **Hindi (Devanagari)**; use a genuinely Hindi-capable local voice (do not feed Hindi to the English-only Kokoro voices); verify pronunciation and intelligibility; render real Devanagari glyphs (no missing squares); no paid APIs, no celebrity voice.
- **Sheet feedback:** "Current style is fine." Keep the Blue Receipt Theatre grammar, official palette and logo, accepted renderer, caption placement, pacing and the truthful CTA; simpler, readable examples. The brief mentions attached design references; none reached this Code session.

## Hindi voice — how it was done (no substitution, no blocker)
- **TTS:** the same official model, **Kokoro-82M** (`hexgrad/Kokoro-82M`, rev `f3ff357`), in its **Hindi pipeline** `lang_code='h'` (Hindi G2P via the espeak-ng `hi` data bundled in `espeakng-loader`), with Kokoro's **official Hindi voices**: blend **`hf_alpha`×0.7 + `hm_omega`×0.3** (keeps the accepted female-led 70/30 character), speed **1.12** (needed to fit 30 s; still a natural Hindi pace). Voice files downloaded once from the official repo: `hf_alpha.pt` sha256 `06906fe0…aafc8f044`, `hm_omega.pt` sha256 `b55f02a8…40155703e`.
- English `af_bella`/`am_puck` were **not** used for Hindi.
- **Pronunciation fixes found by ASR:** "टेंसरब्लू" written joined was heard as "TensorFlow" → spoken from the pronunciation spelling **"टेन्सर ब्लू"** (/ʈˈeːnsəɾ blˈuː/); "कई" was swallowed after "कैसे?" → 0.5 s pause after L1 and "कई पासवर्ड मैनेजर" in full. Captions keep the standard spelling "टेंसरब्लू".
- **Font:** Mukta SemiBold/Bold/ExtraBold (Ek Type, SIL OFL 1.1, from the official `google/fonts` repo; `assets/fonts/mukta/` with `OFL.txt`). Verified shaping in the renderer: ि reordering (किताब), conjuncts (क्ष, स्व, प्रि), reph (पासवर्ड), nukta (फ़ॉलो, सॉफ़्टवेयर) — no missing glyphs. Devanagari text uses zero letter-spacing (negative tracking breaks the shirorekha). The "✓" glyph is absent from Mukta, so ticks are drawn as vectors.

## Final script (Hindi, as spoken; 64 words, 26.0 s of speech incl. CTA)
| id | time (s) | line (caption text) | meaning |
|---|---|---|---|
| L1 | 0.30–4.59 | पासवर्ड मैनेजर आपका मास्टर पासवर्ड नहीं जानता। कैसे? | A password manager doesn't know your master password. How? |
| L2 | 5.09–9.14 | कई पासवर्ड मैनेजर डिवाइस पर ही इससे चाबी बनाते हैं। | Many password managers make a key from it right on your device. |
| L3 | 9.49–12.50 | इसी चाबी से वॉल्ट लॉक होकर सिंक होता है। | With this key the vault is locked, then synced. |
| L4 | 12.85–15.67 | सर्वर पर लॉक डेटा रहता है, चाबी नहीं। | The server keeps locked data, not the key. |
| L5 | 16.02–20.35 | मास्टर पासवर्ड डालते ही चाबी फिर बनती है, और वॉल्ट खुलता है। | Enter the master password and the key is made again, and the vault opens. |
| L6 | 20.70–24.69 | इसलिए इसे भूलने पर, कंपनी अक्सर उसे लौटा नहीं पाती। | So if you forget it, the company often can't give it back. |
| L7 | 26.15–29.65 | टेंसरब्लू फ़ॉलो करें, सॉफ़्टवेयर आसान भाषा में। | Follow Tensorblue — software explained simply. (accepted CTA, in Hindi) |
Qualifications sit inside sentences: **"कई"** (many, not all, password managers) and **"अक्सर"** (often — some services offer emergency access/account recovery). No dates or currency in the script. The first Hindi draft (78 words) measured 34 s with this voice and was tightened twice.

## Source → claim map (primary vendor documentation, read 2026-11-03)
| claim | source | what it says |
|---|---|---|
| The manager doesn't know your master password | **Bitwarden Security Whitepaper** https://bitwarden.com/help/bitwarden-security-white-paper/ ; **1Password security** https://support.1password.com/1password-security/ | Bitwarden: "Master passwords and Stretched Master Keys are never stored on or transmitted to Bitwarden servers." 1Password: "Your password is never shared with anyone, even us at AgileBits." |
| Many managers derive a key on your device from the master password | Bitwarden whitepaper; 1Password security | Bitwarden: "All cryptographic keys are generated and managed by the client on your devices, and all encryption is done locally"; PBKDF2 (600,000 rounds) "stretch[es] the user's master password… The resulting salted value is the 256-bit Master Key" (Argon2id optional). 1Password: "1Password uses PBKDF2-HMAC-SHA256 for key derivation" (1Password also mixes in a Secret Key — implementations differ, hence "कई"). |
| The vault is locked with that key before it syncs | Bitwarden whitepaper | "your data is fully encrypted and/or hashed before ever leaving your local device". |
| The server keeps locked data, not the key | Bitwarden whitepaper; 1Password security | Bitwarden: "Zero knowledge encryption: Bitwarden team members cannot see your passwords." 1Password: "End-to-end encryption leaves the keys in your hands – and nowhere else." |
| Entering the master password re-creates the key and the vault opens on the device | Bitwarden whitepaper | Keys are derived and data is decrypted by the client ("decrypted locally"). |
| If you forget it, the company often can't give it back | **Bitwarden — Forgot master password** https://bitwarden.com/help/forgot-master-password/ ; Bitwarden whitepaper | "Bitwarden has no way to access, retrieve, or reset your master password." Whitepaper: forgetting it locks the user out "unless they have emergency access or account recovery active" (hence "अक्सर"). |

**Illustrative, not claims:** the vault card, rows (ईमेल / बैंक / वाई-फ़ाई), the hex "ciphertext", the server and company cards are generic demo UI, not any real app's screens.

## Storyboard as built (7 scenes, 6 blue wipes)
| time (s) | scene | what happens |
|---|---|---|
| 0–4.8 | **S1 Hook** | Frame 0: an unlocked pale vault card "आपका वॉल्ट" (ईमेल, बैंक, वाई-फ़ाई, masked). On "नहीं जानता" a pill "मास्टर पासवर्ड: पता नहीं"; kinetic "कैसे?" in blue. |
| 4.8–9.3 | **S2 Key made on the device** | Wipe →. "मास्टर पासवर्ड" field fills with dots; pill "डिवाइस पर ही"; on "चाबी" the blue key token (white notch bars = the key) comes out of the field; kinetic "पासवर्ड → चाबी". |
| 9.3–12.7 | **S3 Lock, then sync** | Wipe ←. The vault rows scramble into ciphertext and the padlock closes on "लॉक"; on "सिंक" the locked vault moves away ("सर्वर की ओर सिंक") while the key stays: "चाबी यहीं रहती है". |
| 12.7–15.9 | **S4 Server stage** | Wipe ↑. Isometric slab with a pale "सर्वर" machine; the locked vault card: "सिर्फ़ लॉक डेटा"; a dashed key outline with ✕: "चाबी नहीं". |
| 15.9–20.5 | **S5 Unlock** | Wipe →. Typing fills the master-password field; the SAME key token re-forms ("वही चाबी" + tick); the vault unlocks and ciphertext turns back into rows; kinetic "वॉल्ट खुला". |
| 20.5–25.8 | **S6 Forgetting** | Wipe ←. Field shows "? ? ?", the key can't form (dashed ✕); "कंपनी" card holds only a locked vault and answers "पासवर्ड हमारे पास नहीं"; on the chime: "चाबी सिर्फ़ आपके पास". |
| 25.8–30.0 | **S7 CTA** | Wipe ↑. Accepted end card: logo, "Tensor**blue**" wordmark (brand), Hindi subline "सॉफ़्टवेयर, आसान भाषा में", button "फ़ॉलो करें". |

## Provenance and licences
New: `src/scene.mjs`, `src/asr_hi.py`; `src/tts.py` now reads `lang_code`/`voices`/`speed`/`tts` from `script.json` (English defaults unchanged). Reused unchanged: `brt.mjs`, `render.mjs`, `qa.mjs`, `export-qa.sh`; `mix.py` (seed/heading only). Logo: `assets/brand/tensorblue-logo.svg`. Fonts: Inter/Inter Display (wordmark), Mukta (Devanagari) — SIL OFL 1.1. Voice: Kokoro-82M (Apache-2.0). ASR check: `Systran/faster-whisper-medium` (rev `08e178d`, MIT). Music/SFX synthesized. No paid APIs, Blender, secrets or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-03-hindi-03/tensorblue-30s-hindi03-01.mp4` · SHA256 `ff8af8525f3a2cdaa3fdaf9a5796adacde41636da8538f2c3babb4acc552bed4` · 2,743,937 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.0 LUFS**, LRA 1.9 LU, **−1.8 dBTP** |
| captions (Hindi) | ink y 340–520, x 90–990, ≤ 2 lines, real glyphs | all 8 groups pass: ink y 362–495, x 225–854; Devanagari shaping verified, no missing glyphs |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| Hindi intelligibility (ASR, final MP4) | intelligible | faster-whisper **medium**, `language='hi'`, sentence-by-sentence: every sentence transcribed, **CER 8.6 %** overall (per line 0–13.5 %), 0 low-confidence words. WER 34 % is inflated by Whisper spelling variants (पास्वर्ड, दिवाइस, मास्तर, कमपनी, अकसर, भाशा). Weakest word: the loanword **वॉल्ट** ("vault"), heard as "वाल्क"/"वॉर्ट". |
| caption/speech timing | aligned | Kokoro gives no Hindi word timestamps, so word times are estimated within each line; heard word starts differ by mean 0.09 s (max 0.25 s) over 41 matched words |
| scenes | mechanism moves with narration | 7 scenes / 6 wipes; `qa/contact-sheet-1fps.png`, `qa/transitions.png` viewed |

**ASR runs, honestly counted:** (1) voice-only probe — Whisper wrote romanised Hindi; it revealed "कई" swallowed and "TensorFlow"; (2) targeted clips after the fixes — "कई…" and "टेनसर ब्लू" recognised; (3) a single 30 s pass on the final MP4 produced hallucinated mixed-script output (a Whisper decoding failure, not the audio); (4) sentence-by-sentence on the same final MP4 — the result reported above.

**Fixed during QA:** "✓" missing in Mukta (vector tick), vault rows overlapped label/ciphertext mid-change, sync move too small, vault card covered the server and its label, near-invisible company pill, ciphertext overflowing smaller cards.

**Known limits:** I can't listen; "listening" here is ASR plus loudness/true-peak metering — a native Hindi speaker should listen once before posting (Kokoro's Hindi voices are less polished than its English ones; "वॉल्ट" is the least clear word). Design references were not available in this session. No Desktop/video-review folder exists in this cloud container; the MP4 is delivered as the chat attachment and on the branch.
