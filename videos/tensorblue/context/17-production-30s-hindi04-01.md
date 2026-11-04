# 17 — Batch `2026-11-04-hindi-04` · 30s · episode 01 (Hindi)

**Status:** delivered — see QA. Output: `videos/tensorblue/production/30s/2026-11-04-hindi-04/tensorblue-30s-hindi04-01.mp4`
(copied to `production/30s/2026-11-04-hindi-04/production-notes.md`). All earlier MP4s are preserved unchanged.

## Brief (user-authorised, 4 Nov 2026)
- **Topic:** how a passkey login avoids typing a password, with the everyday phone-unlock example; device-held private key vs. the website's public key as a concrete lock/key visual; never imply biometric data goes to the website.
- **History check:** not covered before. The nearest episode (hindi-03, password managers) is about encrypting a vault with a key derived from a master password; this one is about signing in without any shared secret, so it is distinct.
- **Kept exactly (satisfied design):** Blue Receipt Theatre recipe and the accepted renderer — original Node code on `@napi-rs/canvas` (`brt.mjs`, unchanged; **not Three.js**), the logo and palette, caption placement, wipe compositor, the CTA end card, and the accepted Hindi setup from batch 03 (Kokoro-82M Hindi pipeline, `hf_alpha`×0.7 + `hm_omega`×0.3, Mukta font, zero tracking, sentence-level Hindi ASR).
- **Brand colours fetched again from https://www.tensorblue.com/ on 2026-11-04:** site CSS uses `#030610`, `#3B82F6` (25 uses), `#FFFFFF`, `#D8E3F5`, `#B7C7DF`; logo `#0A6CFF`; `tensorblue-logo.svg` byte-identical to `assets/brand/` (sha256 `e10eba43…`).
- **Design references:** none attached in this session; followed the written direction (simple, attractive, concrete lock/key, no line backgrounds).

## Final script (Hindi, as spoken; 66 words, 26.5 s of speech incl. CTA; speed 1.14)
| id | time (s) | line (caption text) | meaning |
|---|---|---|---|
| L1 | 0.30–3.14 | पासकी में पासवर्ड टाइप नहीं होता। कैसे? | With a passkey you don't type a password. How? |
| L2 | 3.59–6.98 | पासकी बनाते समय फ़ोन दो जुड़ी चाबियाँ बनाता है। | When you create a passkey, the phone makes two linked keys. |
| L3 | 7.28–11.10 | प्राइवेट चाबी आपके पास, पब्लिक चाबी वेबसाइट के पास। | The private key stays with you, the public key with the website. |
| L4 | 11.40–14.07 | लॉगिन पर वेबसाइट चुनौती भेजती है। | At sign-in the website sends a challenge. |
| L5 | 14.37–16.83 | आप रोज़ की तरह फ़ोन अनलॉक करते हैं। | You unlock the phone the way you do every day. |
| L6 | 17.13–21.91 | फ़ोन प्राइवेट चाबी से साइन करता है, वेबसाइट पब्लिक चाबी से जाँचती है। | The phone signs with the private key; the website checks with the public key. |
| L7 | 22.21–25.30 | फ़िंगरप्रिंट या चेहरा वेबसाइट तक नहीं जाता। | Your fingerprint or face doesn't go to the website. |
| L8 | 26.15–29.63 | टेंसरब्लू फ़ॉलो करें, सॉफ़्टवेयर आसान भाषा में। | Follow Tensorblue — software explained simply. (accepted CTA) |

**Edits and why:** the 72-word draft measured 29 s → tightened (hook "पासकी में पासवर्ड टाइप नहीं होता। कैसे?", "प्राइवेट चाबी आपके पास, …", dropped "एक"/"आपका"). Used **"प्राइवेट/पब्लिक चाबी"** instead of "की": espeak-hi renders "की" (key) as short /ki/, identical to the Hindi postposition "की" ("of"). "आपके पास" (with you) rather than "phone only" stays true for synced passkeys, which the credential manager keeps across your devices. CTA TTS spelling "टेन्सर ब्लू" (accepted since batch 03).

## Source → claim map (primary sources, read 2026-11-04)
| claim | source | what it says |
|---|---|---|
| Passkeys replace typed passwords with a key pair | **FIDO Alliance — Passkeys** https://fidoalliance.org/passkeys/ | "Passkeys replace passwords with cryptographic key pairs for phishing-resistant sign-in"; "designed so that there are no shared secrets". |
| Private key with you, public key on the website's server | **Apple — About the security of passkeys** https://support.apple.com/en-us/102195 ; **Google for Developers — Passkeys** https://developers.google.com/identity/passkeys | Apple: "One of these keys is public, and is stored on the server. This public key is not a secret. The other key is private, and is what is needed to actually sign in. The server never learns what the private key is." Google: "Developers only save a public key to the server instead of a password." |
| At sign-in the website sends a challenge; the device signs it; the site verifies | **W3C — Web Authentication Level 3** https://www.w3.org/TR/webauthn-3/ | "the Relying Party's request consists of a challenge and other input data… sent to the authenticator"; "Relying Parties should always be verifying signatures from an assertion". |
| You approve with the same everyday phone unlock | FIDO Alliance (above); **Google Account Help — Sign in with a passkey** https://support.google.com/accounts/answer/13548313 | FIDO: "a user approves a sign-in with the same process they use to unlock their device (for example, biometrics, PIN, or pattern)". Google: "Verify your identity on your phone with your fingerprint, face unlock, or PIN." |
| Fingerprint/face never goes to the website | FIDO Alliance; Google for Developers; Google Account Help | FIDO: "Biometric information and processing continues to stay on the device and is never sent to any remote server — the server only sees an assurance that the biometric check was successful." Google: "biometric material never leaves the user's personal device"; "Your biometric data… stays on your device and is never shared with Google." |

**Illustrative, not claims:** the sign-in card, phone, "चुनौती 7Q2F · 91KX" card and website checklist are generic demo UI, not any real product's screens. The padlock-for-public-key is a teaching metaphor (in reality the public key verifies a signature).

## Storyboard as built (7 scenes, 6 blue wipes)
| time (s) | scene | what happens |
|---|---|---|
| 0–3.3 | **S1 Hook** | Frame 0: a "साइन इन" card with a password field and a blue "पासकी से साइन इन" button; on "टाइप" the password field is struck through; kinetic "कैसे?". |
| 3.3–7.1 | **S2 Key pair** | Wipe →. Phone "पासकी बनाएँ"; on "दो" the blue private-key token and a padlock with the **same notch pattern** come out of it; pill "एक जोड़ी". |
| 7.1–11.3 | **S3 Who keeps what** | Wipe ←. "आपका फ़ोन" keeps the private key ("प्राइवेट: आपके पास"); the padlock moves into the website card ("पब्लिक: वेबसाइट के पास"). |
| 11.3–17.0 | **S4 Challenge + everyday unlock** | Wipe ↑. The website sends a "चुनौती" card to the phone; on "रोज़" the fingerprint pad fills ("फ़िंगरप्रिंट · चेहरा · पिन") and on "अनलॉक" the phone's lock opens ("फ़ोन अनलॉक"). |
| 17.0–22.1 | **S5 Sign + verify** | Wipe →. The private key stamps a blue signature tick on the challenge ("प्राइवेट चाबी से साइन"); the card travels to the website's public-key padlock, which opens on "जाँचती": "बिना पासवर्ड लॉगिन". |
| 22.1–25.8 | **S6 Biometrics stay on the phone** | Wipe ←. Phone with the filled fingerprint: "फ़ोन में ही"; the website's list: पब्लिक चाबी ✓, साइन किया जवाब ✓, फ़िंगरप्रिंट / चेहरा ✕; kinetic "आपकी चाबी, **आपके पास**". |
| 25.8–30.0 | **S7 CTA** | Wipe ↑. Accepted end card: logo, "Tensor**blue**", "सॉफ़्टवेयर, आसान भाषा में", "फ़ॉलो करें". |

## Provenance and licences
New: `src/scene.mjs`. Reused unchanged from batch 03: `brt.mjs`, `tts.py`, `asr_hi.py`, `render.mjs`, `qa.mjs`, `export-qa.sh`; `mix.py` (seed/heading only). Logo `assets/brand/tensorblue-logo.svg`; fonts Inter/Inter Display (wordmark) and Mukta (Devanagari), SIL OFL 1.1. Voice: Kokoro-82M (Apache-2.0), cached `hf_alpha`/`hm_omega`, offline. ASR: `Systran/faster-whisper-medium` (MIT), cached. Music/SFX synthesized. No paid APIs, Blender, secrets, or other apps' files.

## QA (final exported MP4)
File `videos/tensorblue/production/30s/2026-11-04-hindi-04/tensorblue-30s-hindi04-01.mp4` · SHA256 `37494fc54ce43f04d4deb5e058a675ccec1face410cfd566f3ba647b592ad198` · 2,743,922 bytes.

| gate | target | result |
|---|---|---|
| video | 1080×1920, 30 fps, H.264 yuv420p | h264 High, 1080×1920, 30/1, yuv420p, `+faststart` |
| frames / duration | 900 / 30.000 s | `nb_frames=900`, decoded `nb_read_frames=900`; video, audio, container 30.000000 s |
| audio | AAC 48 kHz stereo | AAC-LC 48000 Hz stereo |
| whole-file decode | no errors | none |
| loudness / true peak | −14…−16 LUFS / ≤ −1 dBTP | **−15.0 LUFS**, LRA 1.5 LU, **−1.9 dBTP** |
| captions (Hindi) | ink y 340–520, x 90–990, ≤ 2 lines, real glyphs | all 9 groups pass: ink y 362–498, x 203–874; Devanagari shaping as in batch 03 (Mukta), no missing glyphs |
| top / caption band | no stage drawing in y 0–539 | 0 violations in 90 sampled frames |
| Hindi recognition (one ASR pass, final MP4) | intelligible | faster-whisper medium, `language='hi'`, sentence by sentence: every sentence transcribed, **CER 9.1 %** (per line 3.7–18.5 %), 0 low-confidence words. WER 28.8 % is mostly Whisper spelling (पास्की, वेब्साइट, लोगिन). Weakest words: चुनौती → "चुनाउटी", अनलॉक → "अन्लोग". |
| caption/speech timing | aligned | estimated Hindi word times vs heard starts: mean 0.07 s, max 0.25 s (46 matched words) |
| scenes | mechanism moves with narration | 7 scenes / 6 wipes; `qa/contact-sheet-1fps.png`, `qa/transitions.png` viewed |

**Fixed during QA (once):** phone lock icon and fingerprint vanished at the unlock moment (now shown open/filled) and the challenge card covered the lock; the signing key was hidden behind the card; the takeaway kinetic text repeated the "फ़ोन में ही" pill (now "आपकी चाबी, आपके पास").

**Known limits:** listening is not supported here — verification is ASR-only plus loudness/true-peak metering; a native Hindi speaker should listen once before posting. No Desktop/video-review folder exists in this cloud container; the finished MP4 is delivered as the chat attachment and on the branch.
