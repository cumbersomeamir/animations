# QA — Werbens English-12 30 s #01 "Same product. New perception." (final export = render 2)

**File:** `videos/werbens/production/30s/2026-11-11-english-12/werbens-30s-english12-01.mp4`
**sha256:** `d1db2065107e49c917f3b2df1d3e9d98868b17394fbbec4ee663a8f66f7d2a62` · 5,215,326 bytes · checked 2026-11-11
**Thumbnail:** `werbens-30s-english12-01-thumbnail.png` (1080×1920; sha256 `7f2434620654c2761505a941d4e4bedf6b9b944c481561c78f7237e9c8e2fa6f`)
+ `.jpg` (sha256 `cc1dc70275917cd32b4eada1e9c8e591b884d1bdb6ca82ef90f74f05e9e585aa`)
Rules checked against: `context/27-approved-feedback-rules-2026-11-11.md`.

## 1. Streams / duration (`qa/ffprobe.json`, `qa/*-stream.txt`, `qa/format.txt`, `qa/decode.log`)
| Check | Required | Measured | Result |
|---|---|---|---|
| Duration (format / video / audio) | exactly 30.000 s | 30.000000 / 30.000000 / 30.000000 | PASS |
| Frames (decoded count) | 900 | nb_read_frames = 900 | PASS |
| Video | 1080×1920, 30 fps, H.264, yuv420p | h264 High, 1080×1920, yuv420p, r/avg 30/1, bt709 | PASS |
| Audio | AAC | AAC-LC, 48000 Hz, 2 ch, ~193 kb/s | PASS |
| Full decode | 0 errors | `ffmpeg -xerror … -f null -` OK | PASS |
| Render log | no page errors | `build/page-log.txt`: "no console errors or warnings" | PASS |

## 2. Story structure + pacing (context/27)
| Part | Required | As built (narration on air, voice stem) |
|---|---|---|
| Hook | 0–3 s striking image + hook | frame 0: two identical tubs falling into place; L1 "Same product. New perception." 0.34–2.04 s |
| Super hook | 3–5 s optional escalation | L2 "So why does one feel expensive?" 2.43–3.97 s + "?" |
| Build-up + proof | 5–21 s, scene changes | L3 4.48–10.18 · L4 10.49–12.15 · L5 12.53–13.94 · L6 14.33–16.92 · L7 17.36–20.92 s; 3 sets (tub → name/scoop → cups) |
| Payoff | 21–27 s concrete takeaway | L8 21.33–24.10 · L9 24.58–26.65 s |
| CTA | 27–30 s | L10 "Follow Werbens to decode how brands sell." 27.07–29.28 s; logo tile lands 26.86 s, wordmark 27.55 s |

## 3. English narration, intelligibility and caption timing (`qa/asr-mix.json`)
- Voice: the established Meshline/Recall narrator (Kokoro-82M v1.0 q8, af_bella 0.7 + am_puck 0.3, speed 0.98, en-us), newly
  synthesised. English only; no Hindi or recycled audio.
- Pronunciation overrides: "Werbens" → wˈɜɹbɛnz; rhotic ɜː → ɜɹ; "Häagen-Dazs" → hˈɑːɡən dˈɑːz; "Coke and" → stressed "and".
- Final-mix ASR (Whisper base.en): the whole-mix transcript matches the script word for word, except:
  - "Häagen-Dazs" is written "Hagen-Daz" (the name is spelled on screen);
  - the colon after "name" becomes a comma;
  - "Werbens" is written "Warbins" (the documented vocabulary limit; the name is on screen).
- Per-line windows: L1 4/4 · L2 6/6 · L3 12/15 (spellings above) · L4 7/7 · L5 7/7 · L6 7/7 · L7 10/10 · L8 8/8 · L9 7/7 ·
  L10 6/7.
- **ASR only; no human listening was performed in this cloud session.** Narration sync and clipping were checked by ASR word
  windows, by the voice-stem envelope and by astats (flat factor 0, i.e. no digital clipping).
- Caption groups (16) brighten word by word at the Whisper onsets, with `WORD_FIX` pins for L1/L5/L6/L8. Caption windows run
  from L1 0.23 s to L10 30.0 s.
- Audio: −15.0 LUFS integrated, true peak −1.9 dBTP (≤ −1.5), LRA 1.9 LU, flat factor 0.
  - Stems: voice −20.6 LUFS (accepted English −20.9); music −31.2 LUFS (quiet, ducked −10 dB under speech); foley −32.3 LUFS.
  - Score: 6 held pads + 16 event notes, no loops.

## 4. Captions, labels and safe areas (`qa/dom-bounds.json`, every frame)
- 900 samples (every frame), checked against the context/27 boxes:
  - Caption ink y 369–489, x 175–825; pill y 353–507, x 145–855. Both are inside x 100–900 / y 230–1500. Max 2 lines; no
    auto-shrink needed.
  - Big labels ("?", "1960", "SIGNAL IT", "DELIVER IT"), wordmark and tagline: x 262–818, y 561–1456, inside x 100–900 /
    y 560–1500.
  - Nothing in y 0–300; 0 labels under the caption pill; 0 label overlaps; never more than one big label at a time.
  - No source chips or paragraph cards on screen. Result: PASS.

## 5. Brand (live app.werbens.com, re-checked 2026-11-11; context/17 + context/28 §3)
- Palette, wordmark styling and `werbens-logo.svg` are unchanged (sha256 816c1761…). The colour theme is now the site's
  **dark-navy hero**, in every scene:

  | Element | Target token | Rendered (pixel samples) |
  |---|---|---|
  | Stage / fog | navy #0B1120 | floor ≈ #111A2D–#121B2F |
  | Sleeve | deep teal #316879 | ≈ #25677A–#266B7E under the spotlight |
  | Dressed lid | mint #7FE7DC | ≈ #83D7CE–#95DDD5 |
  | Logo tile (unlit SVG) | #7FE7DC / #316879 | #7EE7DC / #316879 |
  | Wordmark | Space Grotesk 700, −0.04 em, 135° #7FE7DC→#316879 | as specified |
  | Labels | site hero-headline gradient | as specified |

- Copy and CTA name only Werbens; no sales pitch.

## 6. Visual review (`qa/contact-sheet.png` 1 fps, `qa/transition-sheet.png` 30 beats, `qa/frames/*.jpg`)
- Beats in order:
  1. Frame 0: both tubs falling.
  2. "=" between identical tubs.
  3. The right tub gets the sleeve, mint lid, plinth and spotlight on "New perception".
  4. "?".
  5. Swap; "1960".
  6. The sleeve wipes up the plain tub; plinth + spotlight on "luxury".
  7. The name writes on at "Häagen-Dazs".
  8. Lid pops (kept below the caption band; `qa/frames/f330-lidfix.jpg`); the scoop rises on "rich".
  9. Lateral dolly to two identical cups; hops on "Coke"/"Pepsi".
  10. "≈".
  11. BRAND sleeve on one cup; it rises on a plinth into the light on "shifted preferences".
  12. Back to the tub; aura on "shapes expectations".
  13. Spoon in, bite on "bite"; "SIGNAL IT" → "DELIVER IT".
  14. Tub and spoon slide off; the logo tile lands; wordmark + tagline.
- No static page, no camera bobbing, no decorative lines. Transition frames always show at least one prop (f7, f16, f21 are
  mid-move frames with props at the frame edges). No missing assets: fonts, logo and words.json all loaded, and the page log is
  clean.
- Beats checked: f0, f13, f45, f52, f66, f110, f130, f140, f160, f208, f220, f285, f290, f330, f357, f370, f395, f432, f480,
  f563, f595, f640, f660, f718, f752, f785, f793, f800, f830, f899.
- Thumbnail: separate 1080×1920 image tied to the hook. It shows "SAME PRODUCT." / "NEW PERCEPTION." (4 words, Space Grotesk
  700, hero gradient), the plain tub vs the dressed tub on a lit plinth, and the logo + wordmark at the bottom. Text is inside
  x 108–972, and the top 300 px holds no text.

## 7. Defects found and fixed (one fix pass each)
| Pass | Defect | Fix |
|---|---|---|
| voice | "Häagen-Dazs" read hˈɛədʒəndˈæzz; "Coke and" heard as "Cocon"; first drafts 3 s too long for the context/27 pacing | phoneme overrides; script tightened in three passes (see context/28 §4) |
| stills 1 | floor and spotlight pool rendered teal/slate-blue, not the site's navy | darker navy floor, dimmer key/hero lights, lower hemisphere |
| stills 2 | empty frame in the move to the cups; preference columns read as straws; spoon entered the caption band; label touched the scoop; tile overlapped the wordmark | cups set moved closer (continuous move); columns replaced by the plinth + spotlight grammar; lower spoon path; label/camera moved; CTA framing lowered |
| colour | sleeve and lid rendered lighter than #316879 / #7FE7DC | lit bases recalibrated from pixel samples |
| CTA | tile dropped through the caption pill, then landed while the tub was still leaving, then left a 2-frame empty gap | short drop (0.14 m), stage clear eased in-out, tile lands right after |
| render 1 | **the popping lid rose into the caption pill at ≈ 11.0 s** (seen on the final-video transition sheet) | lower lid arc and smaller tilt; **full re-render (render 2)**. Render 1 is in checkpoint ed4b939 and is superseded at the same path. |

## 8. Remaining limitations (honest)
- Intelligibility and caption sync are checked by ASR (Whisper base.en), not by a human listener. Whisper cannot spell
  "Werbens" or "Häagen-Dazs", and both names are shown on screen.
- The study claim is stated as direction only ("shifted preferences"). The abstract does not name which drink's brand had
  the effect, so the video's sleeve says only "BRAND". The study is a small fMRI study, and no effect sizes are shown.
- "Then backed it with a rich recipe" is the brand's own account (Froneri), not an independent measurement.
- The tub carrying the name is a generic illustration in Werbens colours, not Häagen-Dazs packaging.
- The local "video-review" folder named in the brief does not exist in this cloud container. The finished MP4 and thumbnail
  are delivered as chat attachments and at the repo paths above; QA, sources and production files stay in the repo.
- Earlier MP4s were verified unchanged (14 files, sha256 prefixes as in context/11).
