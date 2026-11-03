# QA: courtlens-30s-hindi03-01.mp4 (Hindi)

File: `videos/courtlens/production/30s/2026-11-03-hindi-03/courtlens-30s-hindi03-01.mp4`
sha256 `5035fbf9220c0246d9fbe06456eab891cce0ea8accceeed224ffac39f2949e37`
Machine-readable: `qa_report.json` (spec/decode/loudness/timing/safe zone, from `src/qa.py`) and `asr_check.json`
(Hindi listening proxy on the final mix, from `src/asr_check.py`). Sheets decoded from the final MP4:
`contact-sheet-1fps.jpg`, `transition-frames.jpg`, `final-frame.jpg`.

## Automated checks (all PASS)
| Check | Result |
|---|---|
| Duration | 30.000000 s (container, video and audio) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 900 frames counted by full read, BT.709 |
| Audio | AAC-LC 48 kHz stereo |
| Full FFmpeg decode | exit 0, no errors |
| Loudness | −15.9 LUFS integrated, LRA 2.1 LU, true peak −2.5 dBFS |
| Narration placement | 7/7 Hindi lines found by cross-correlation at planned start +3 ms (similarity 0.98–0.99) |
| CTA | "आसान कानून के लिए, कोर्टलेंस को फ़ॉलो करें" 26.67 → 29.71 s = final 3.33 s |
| Top zone y<300 | 180 sampled frames, darkest pixel 211/255 → clear |
| Captions | 9 Devanagari chunks, ≤ 2 lines, non-overlapping, inside y 340–520 / x 90–990 |

## Hindi voice and listening check
- Voice: Kokoro v1.0 native **Hindi** voices hf_alpha 0.7 + hm_psi 0.3, lang "hi" (espeak-ng Hindi phonemes),
  speed 1.05, cached open model. The English voices were not used.
- I can't hear audio directly, so the proxy is a local faster-whisper "medium" transcription with language=hi.
  - **Lines, before mixing:** mean CER 0.092 across the 7 lines.
  - **Final mixed MP4** (music + SFX, per-line windows): full-script CER **0.097**. Every word of every line is
    recognised. Remaining differences are spelling-level: nukta, ौ/ो, ि/ी, "सबूद" for सबूत, "एडिद" for एडिट.
  - Year/number/currency: the script has none spoken.
  - **Brand name:** written "कोर्ट लेंस" for the voice, and recognised as "कोर्टलेंस".
- Words fixed after the ASR check:
  - छेड़छाड़ → बदलाव (heard as छेर्चार)
  - छिपी → गुप्त (heard as चिपी)
  - छापने → फैलाने (heard as चापनी)
  - आवाज़ → आवाज in the TTS input only (heard as आवास)
  - कोर्टलेंस → कोर्ट लेंस in the TTS input only (heard as कुर्तिलेस)
  - बातचीत avoided (heard as बाचीत)
- **Speech/caption alignment:** all ASR word timestamps on the final mix fall inside the caption window on screen at
  that moment (`asr_check.json`: words_outside_captions = []).
- The final re-render changed only video. The audio stream MD5 is identical before and after
  (80981e2fd0160179d0e259f0895d0931), so the listening check applies to the delivered file.

## Glyph rendering
- Noto Sans Devanagari (OFL) is the fallback after Inter. Full-resolution frames were checked: conjuncts (र्ते, प्र, र्ट,
  फ़्ते), nukta (ज़, फ़) and upper/lower matras shape correctly, with no missing-glyph boxes.
- Letter-spacing is off on Hindi strings. The caption marker band is raised for Devanagari headline height.

## Visual review
- Accepted feedback-01 grammar intact: card spring, object emerging and landing, sign drop and swing, dashed line to
  tag, rule card sliding between, chip highlights, tag flip, split stage, morph, envelope, ticking action card, icon CTA.
- Each change lands on its words:
  - "डिपॉज़िट": quote marker
  - "रिकॉर्ड की": REC pill, live waveform and beeps
  - "क्या यह कानूनी है?": landlord's sign
  - "सबूत": tag flips
  - "मामले / आवाज़ / बदलाव": chips
  - "पोस्ट करना": split
  - "हर्जाने": right result
  - "मूल फ़ाइल / एडिट": ticks
  - CTA in the final 3.33 s

## Defects found and fixed
1. Loudness −13.3 LUFS on the first encode (denser Hindi voice). Gain 6.8 → 3.9 dB, re-muxed: −15.9 LUFS / −2.5 dBTP.
2. The first full-mix ASR pass dropped the last two lines (Whisper end-of-window behaviour) and scored Latin
   loanwords as errors. Switched to per-line windows on the final mix, with a loanword map: CER 0.097.
3. Caption spelled "आवाज" without nukta, unlike the chip. Captions now use the standard "आवाज़".
4. The "सुप्रीम कोर्ट 1994" sticker dropped through the right-column header. It now pops in place.
5. The phone (wider than the earlier bottle) peeked above the call card while dropping. Drop height 400 → 260.
6. Audio file and call-log cards flew in from above across the action card. They now slide in at envelope height.

## Known limitations / checkpoints
- R. Rajagopal (1994) read via Indian Kanoon because the official digiscr host returned 502 (CHECKPOINT A).
  BSA s.63 is not covered (CHECKPOINT B).
- The ASR proxy confirms words are recognisable. It cannot judge accent naturalness; a native-speaker listen is
  recommended before posting.
