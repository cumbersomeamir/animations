# QA — `help-30s-english21-01.mp4` (2026-11-18, batch 21) — English narration + captions

All checks on the **final exported MP4**. SHA-256 `b0fde7277ccc8099f332dd12a2f9d9f4eaef81f4dbedd6765aea9eb53b14750a`, 14.8 MB (14,843,625 bytes). Thumbnail `help-30s-english21-thumbnail.png` (1080×1920 PNG, SHA-256 `db8816a8dfde66c9a073a5acb0cfcf604cd67ebf5a0c297769ddcc521bb3556b`).

| Check | Result | Evidence |
|---|---|---|
| Duration / streams | container **30.000000 s**; video h264 **High**, **1080×1920**, **yuv420p**, **30/1**, **900 frames** (counted); audio **AAC-LC 48 kHz stereo**, 30.000000 s | `qa/ffprobe.json` |
| Full decode | full decode to null output, exit 0, **0 error lines**; 900 video frames read | `qa/full-decode.log`, `qa/ffprobe.json` |
| First frame | frame 0 = the hook at full lamp level (no fade, no logo): a birth certificate (name, date of birth, place, parents, seal), a wall calendar on day 21 ringed in red, a newborn in a cradle; plaque "FREE FOR 21 DAYS" (4 words); no caption on frame 0; narration from 0.10 s | `qa/frame-000.png` |
| Thumbnail | = frame 0 (plaque hidden) + "FREE FOR / 21 DAYS." + Help badge | `help-30s-english21-thumbnail.png` |
| Loudness | **−15.1 LUFS**, LRA 2.3 LU, **true peak −1.6 dBTP** (below the −1.5 limit; no audio re-encode needed); SFX only in pauses; nothing under the first word | `qa/loudness.txt` |
| Voice | Established narrator (Meshline): Kokoro-82M af_bella 0.7 + am_puck 0.3, en-us, 0.98, synthesized fresh; same soundtrack treatment (pad + mallet motif + percussion); no Hindi. Voice-only spelling: "twenty twenty-three" for 2023 | `src/script.json` (`tts`) |
| Intelligibility | **I did not listen** (no audio playback available to me). Offline English ASR (Vosk small-en-us-0.15) on the audio decoded from the final MP4 recognises every script word; differences are homophones or joins only: "wait" → "weight", "may be" → "maybe", "magistrate's" → "magistrates", and one extra token "or" after "register" in the full-track pass (the same sentence decoded alone, and a 3.8 s window cut from the track, both read "register the birth now") | `qa/asr-final-mix.txt`, `qa/asr-voice-track.txt` |
| Story / pacing | Hook 0.10–3.20 s · superhook (late = magistrate's order) 3.42–6.41 s · question 6.62–8.28 s · proof 8.50–21.96 s (school-age proof, who reports, name later) · payoff 22.20–25.77 s · CTA 27.10–29.67 s. 80 words, 26.9 s of speech | `src/cues.json`, `build/mix_info.json` |
| Captions | 16 cards from ASR word times (script-to-ASR alignment for "twenty-one", "2023", "may be"), no overlaps; every spoken word in exactly one card. Zone: ink **x 128–872, y 376–496** → **0 violations** in 32 checked frames (rule x 100–900, y 230–1500) | `src/captions.json`, `qa/caption-bounds.json` |
| Picture / transitions | Contact sheet (frame 0 + every second) and every scene cut (−0.3 / 0 / +0.3 s) inspected. One idea per beat; labels 1–4 words (FREE FOR 21 DAYS, AFTER A YEAR → MAGISTRATE'S ORDER, WHY THIS PAPER?, BORN SINCE OCT 2023 → PROOF OF AGE → SCHOOL ADMISSION, HOSPITALS REPORT → AT HOME: THE FAMILY, NO NAME YET? → REGISTER NOW → ADD NAME LATER, HELP WITH ONE FORM → ON TIME, LUCKNOW) | `qa/contact-sheet.png`, `qa/scene-transitions.png` |
| Icon | Play listing re-downloaded 2026-11-18 ("Updated on Sep 15, 2026"): =s512 icon byte-identical to `assets/icon.png` (SHA-256 0646d82d…eebd4); the CTA draws that file. No App Store listing is linked | context 34 |

## Defects found and fixed
- First voice take ran 28.6 s → five lines shortened (26.9 s).
- "Register anyway, and add it later" was heard as "register or anyway and added it later" → tested three rewordings in isolation; "Register the birth now; add the name later." recognised in isolation and in a cut window.
- Stills pass: the cradle's baby was hard to read and cut by the frame edge → larger swaddle, head and cap, cradle moved inward; "1 YEAR" overflowed the calendar → smaller type; the lifted stamp hung over the ORDER title → fades as it lifts; the "?" beside the empty name line was a dot → round yellow "?" badge; the pen covered the certificate title → smaller and flatter; the parent now holds the pen while signing.
- After the fixes the full video was rendered and all QA above was run on the final file.

## Remaining limits
- No human listening pass (ASR + loudness only).
- Procedures are national (1969 Act, Model Rules 1999, 2023 and 2026 amendments). Uttar Pradesh's own rules (2002) were not read; state fees and offices differ, so no fee amount or office is narrated. The 2026 amendment's commencement date was not confirmed; the narration ("a magistrate's order" after a year) is true under both the 2023 and 2026 wording.
- The 1 October 2023 start date comes from a news report of the MHA notification (The Quint) and a summary listing of S.O. 4058(E); the e-Gazette copy failed TLS verification and was not bypassed. The CRS FAQ (dc.crsorgi.gov.in) reset the connection and was not used.
- RTE Act section 14(2) bars refusing school admission for lack of age proof; the script therefore says the certificate "proves age for school admission" and never that a child is refused school. (Section 14 seen in search excerpts only; not narrated.)
- NFHS-5 (2019–21) found 79.5% of under-5 births in Uttar Pradesh registered; NFHS-6 (2023–24) fact sheets drop this indicator, so no statistic is narrated.
- People, documents and buildings are illustrative and fictional; no family is shown or implied. Help does not register births or provide document services.
- A 0.3 s blur-in at 26.6 s overlaps the payoff figures with the CTA figures (the established CTA transition).
- Desktop/video-review is not reachable from this cloud session; the MP4 and thumbnail are attached in chat and pushed.
