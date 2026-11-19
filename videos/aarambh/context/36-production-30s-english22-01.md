# 36 — English-22 30 s #01: Elizebeth Friedman, codebreaker, "SHE READ THEIR SECRETS" (third episode under the 2026-11-17 feedback addendum in `25`)

- **Batch:** 2026-11-19-english-22 (the user's brief "NEXT EPISODE — English batch22, authorised 19 November")
- **Video:** `videos/aarambh/production/30s/2026-11-19-english-22/aarambh-30s-english22-01.mp4`
  - sha256 `0a8731d84956ce6b8f34604c875123f0bf5bcf1ca1639bf38826ea83b6485db7`
- **Thumbnail:** `videos/aarambh/production/30s/2026-11-19-english-22/aarambh-30s-english22-01-thumbnail.png` (1080x1920 RGB; it is frame 0)
  - sha256 `a3d5e7c5a122e1615ec0f857eca0f7a637058bd325dfcccc631e44119e0239aa`
- **Spec:** 30.000 s, 900 frames, 1080x1920, 30 fps, H.264 High yuv420p, AAC LC 48 kHz stereo
- **Language:** English narration and English captions only; the established Meshline/Recall narrator (Kokoro-82M, 0.7 af_bella + 0.3 am_puck, en-us, speed 0.98) and the established procedural soundtrack recipe.
- **Pre-flight (2026-11-19):** repo `cumbersomeamir/animations`, branch `claude-video/aarambh`, in sync with origin at `7facf2c`; clean tree.
  - Batches 20 and 21 were complete and pushed (records 34 and 35), with no unfinished checkpoint, so nothing needed finishing first.
  - The batch folder was created after `test ! -e`; earlier outputs are untouched.
- **Isolation:** only Aarambh's own context, skill, palette, narrator and CTA were used.

## Topic replacement (the brief's subject was already covered)
- **The brief:** "Hedy Lamarr and the radio that kept changing its address", with the instruction "If this precise subject was already covered, choose a genuinely different subject in this app's fixed genre before scripting and explain the replacement choice."
- **Already covered:** Lamarr & Antheil's frequency hopping is episode 04 (round-02, English; record `15`) and episode 07 (feedback-05, Hindi; record `18`). It was suggested and replaced twice before: by Morse (episode 10, record `21`) and by Grace Hopper (episode 14, record `26`). The Lamarr patent research and its historical limits stay in `15` and `18`; this episode makes no Lamarr or Wi-Fi claim.
- **Replacement:** Elizebeth Smith Friedman, the U.S. codebreaker who read Prohibition smugglers' radioed codes and later her team's breaks of Nazi spies' Enigma traffic. A grep for friedman, enigma, codebreak and cryptanal over `videos/aarambh` found nothing, so she is fresh.
- **Why her:** she keeps everything the brief asked for except the repeated person:
  - the same genre (a real person behind a technical idea);
  - the radio world and the brief's frame-0 idea (a real portrait beside one luminous radio dial);
  - the requested takeaway, "why changing a pattern can protect a signal", told from the codebreaker's side: a pattern that repeats leaks the secret; one that changes every time protects it (until it too is broken).

## First frame (rule; the brief's opening, adapted)
- **Frame 0 (t = 0):**
  - the NSA photograph of Elizebeth Friedman (left, tilted print);
  - one luminous radio tuning dial (right, illustration), with radio arcs;
  - four coded letter tiles on the air between them;
  - the words "SHE READ / THEIR SECRETS" (4 words).
- **No intro:** no logo, flicker, fade from black or fade-in.
- **No caption at frame 0:** the first caption appears at 0.22 s.
- **Hook audio:** audible from 0.08 s.
- **Thumbnail = frame 0:** frame 0 differs from it by 1.51/255 (H.264 only). Mean luminance 65.2/255.
- **Truthful words:** she decoded the smugglers' coded messages (Marshall Foundation: "Mrs. Friedman and her aide solved more than 12,000 coded messages for the Coast Guard between 1928 and 1930").

## Story structure (rules `25`, incl. the 2026-11-17 addendum: one moving idea per scene, at most one short label)
| beat | time (s) | narration | picture (on-screen text) |
|---|---|---|---|
| hook | 0.05–5.02 | "Smugglers radioed orders in secret code. Elizebeth Friedman read them anyway." | frame-0 composition; coded tiles drift from the dial towards her; three soft code beeps in the pause; on "read" the tiles that reach her turn gold |
| super hook | 5.35–6.44 | "How, without the key?" | hard cut with flash (5.29) to a locked padlock and a dashed outline of the missing key; the lock rattles on "key?" (no label) |
| proof 1: the repeat | 6.80–11.11 | "Their codes swapped each letter the same way every time, so patterns showed." | whip pan (6.60–6.80) to a swap box: a plain E goes in and a coded Q comes out, three times; the other coded letters rain into columns, Q stands tallest, and its top tile flips to a gold E (no label) |
| proof 2: the scale | 11.45–14.24 | "She and an aide cracked over 12,000 messages." | push (11.15–11.40): coded slips land on a pile, each ticked; the counter runs to "12,000+" |
| proof 3: the change | 14.60–20.70 | "Nazi spies used Enigma, which changed the swap every key press; her team still broke it." | push (14.30–14.55): a rotor and an E key; "ENIGMA"; three presses: the rotor steps, the lit wire changes, E becomes Q, then X, then M; on "broke" the three tiles flip to gold E, E, E |
| payoff | 21.10–25.32 | "Lesson: patterns that repeat leak secrets; never reuse a password." | page turn (20.75–21.10): her circular portrait over three locks; one red key opens all three in turn; they snap shut, a different key rises under each; card "one key per lock" |
| CTA | 27.10–29.87 | "Download Aarambh to support livelihood tools." | CTA slide (26.70–27.10) |

- **The unanswered question** ("How, without the key?") is answered concretely in proof 1 (a repeated swap makes the most common coded letter stand for the most common real letter) and extended in proof 3 (a swap that changes every press hides that pattern).

## Final script (English; 69 words)
| id | start (s) | text (caption = spoken) |
|---|---|---|
| S1 | 0.05 | Smugglers radioed orders in secret code. Elizebeth Friedman read them anyway. (TTS spelling "Elizabeth"; Kokoro misreads "Elizebeth") |
| S2 | 5.35 | How, without the key? |
| S3 | 6.80 | Their codes swapped each letter the same way every time, so patterns showed. |
| S4 | 11.45 | She and an aide cracked over 12,000 messages. |
| S5 | 14.60 | Nazi spies used Enigma, which changed the swap every key press; her team still broke it. |
| S6 | 21.10 | Lesson: patterns that repeat leak secrets; never reuse a password. |
| S7 | 27.10 | Download Aarambh to support livelihood tools. (TTS: "Download Aa-rumbh, to support…") |

- The first draft ran 27.48 s, so lines were merged and trimmed before rendering.

## Sources (accessed 2026-11-19)
- **[MF1] George C. Marshall Foundation, "Elizebeth Smith Friedman and Prohibition" (20 Jan 2020):** https://www.marshallfoundation.org/articles-and-features/elizebeth-smith-friedman-and-prohibition/
- **[MF2] George C. Marshall Foundation, "Elizebeth Who?":** https://www.marshallfoundation.org/articles-and-features/elizebeth-who/
- **[PBS] PBS American Experience, "How Codebreaker Elizebeth Friedman Fought Nazi Spies":** https://www.pbs.org/wgbh/americanexperience/features/codebreaker-elizebeth-friedman-fought-nazi-spies/
- **[SM] Smithsonian Magazine, American Women's History Museum blog, "Meet Elizebeth Smith Friedman…" (13 July 2026):** https://www.smithsonianmag.com/blogs/smithsonian-american-womens-history-museum/2026/07/13/meet-elizebeth-smith-friedman-the-us-governments-first-woman-codebreaker-she-cracked-nazi-codes-saved-8000-lives-and-pioneered-modern-codebreaking/ (read through a web-fetch agent, which returned short verbatim quotes)
- **[NG] National Geographic, interview with Jason Fagone about Elizebeth Friedman:** https://www.nationalgeographic.com/history/article/elizebeth-friedman-codebreaker-nazi-spy-fagone (read through a web-fetch agent; short quotes)
- **[CAM] H. A. Evans, "Recreation of the Polish Cyclometer and its role in the breaking of Enigma", MEng report, Department of Engineering, University of Cambridge (2019):** https://www.eng.cam.ac.uk/uploads/news/files/recreation-polish-cyclometer-and-its-role-breaking-enigma-hal.evans.pdf
- **[OX] S. Drape, encryption worksheets, Department of Computer Science, University of Oxford:** https://www.cs.ox.ac.uk/stephen.drape/materials/secret.pdf
- **[POR] Wikimedia Commons, "Elizebeth-Friedman.jpg"** (480x640): https://commons.wikimedia.org/wiki/File:Elizebeth-Friedman.jpg
- **Blocked (HTTP 403), not used:** the NSA biography and press pages, the U.S. Coast Guard history article "The Long Blue Line: Mrs. Friedman…", and Smithsonian invention.si.edu / womenshistory.si.edu pages. They were refused both directly and through a web-fetch agent.

## Claim map (documented, interpretive, illustrative)
| claim | kind | basis |
|---|---|---|
| Smugglers radioed orders in secret code | documented (simplified) | MF1: "the rum-runners used codes that they thought would make their communications secure"; SM: "Rum runners used radio transmitters and advanced encryption"; NG: "the rumrunners got good at concealing their operations using coded radio messages". "Orders" simplifies messages that directed the smuggling operations. |
| Elizebeth Friedman read them anyway | documented | MF1: she and her aide "solved more than 12,000 coded messages for the Coast Guard". |
| How, without the key? | question | Sets up the explanation. |
| Their codes swapped each letter the same way every time, so patterns showed | documented (simplified) | MF1: "She was surprised that the alcohol smugglers used simple encryptions"; she taught "mono-alphabetic ciphers right in the courtroom" (a mono-alphabetic cipher uses one fixed substitution throughout). OX: "The most common letters in the ciphertext are related to the most common letters in the plaintext… we can use frequency analysis to crack substitution ciphers." NG notes "hundreds of different code systems", so not every smuggler system was a simple substitution; the narration describes the simple ciphers MF1 names. |
| (E always becomes Q; Q piles up; the top Q flips to E) | illustrative | A picture of frequency analysis. The letters are invented for the demonstration and are not from a real smuggler message. |
| She and an aide cracked over 12,000 messages | documented | MF1, verbatim: "Mrs. Friedman and her aide solved more than 12,000 coded messages for the Coast Guard between 1928 and 1930". SM: "Friedman decoded more than 12,000 rum-running messages". |
| Nazi spies used Enigma | documented | PBS: from April 1942, new clandestine radio stations were "broadcasting messages using a devilishly complex encryption device called the Enigma machine". |
| which changed the swap every key press | documented | CAM: it "produces a complex substitution cipher that changes whenever a key is pressed… the right hand rotor rotates by one step for each keystroke". |
| (one rotor; E → Q, X, M) | illustrative | A real Enigma had several rotors, a reflector and a plugboard (CAM); one rotor is drawn to show the stepping. The letters are invented. |
| her team still broke it | documented | MF2: "She and her team broke the Enigma code machine, unaware that anyone else was working on it"; PBS: "her team broke three separate Enigma machines"; SM: her unit "cracked three Enigma machines". These were the machines used by the spy networks, not the whole German military Enigma effort (NG: she was "more narrowly focused on a couple of Enigma's systems being used by Nazi spies"); "it" in the narration refers to the spies' Enigma. |
| (Q, X, M flip to E, E, E) | illustrative | Shows the three different outputs read back to the same letter once broken. It does not show her method; PBS says she worked "using only pen and paper", and that method is not depicted. |
| Lesson: patterns that repeat leak secrets | interpretive | Drawn from the two proofs: the repeated substitution fell to frequency analysis (OX), and Enigma's per-keystroke change existed to stop exactly that (CAM: the message key was there "to avoid… cryptanalysts simply applying frequency analysis"). |
| never reuse a password | interpretive | A modern application of the lesson; widely given security advice, not attributed to Friedman. |
| ("one key per lock") | illustrative | Card and lock metaphor for unique passwords. |
| CTA | verified listing | Play listing (verified 2026-11-03, `11` CTA correction): "Fund verified livelihood tools and follow their impact." |

- **Deliberately NOT claimed:**
  - anything about Hedy Lamarr, frequency hopping or Wi-Fi (this episode replaces that topic);
  - a comparison with Alan Turing or Bletchley Park;
  - "first woman codebreaker", "saved 8,000 lives" (the SM headline), the 35 convictions (MF2), Hoover taking credit (PBS), the Queen Mary detail (PBS);
  - the content of any real decoded message;
  - that she broke Enigma alone or with machines.

## Portrait
- **Asset:** `assets/elizebeth-friedman-nsa-pd.jpg` (480x640, Commons "Elizebeth-Friedman.jpg"); `assets/elizebeth-friedman-nsa-pd-2x.jpg` is a 2x Lanczos copy with a mild unsharp mask and no added detail, used in the video.
- **Licence:** Commons tags it `{{PD-USGov}}`, with the NSA website as the source. That is a clearer public-domain basis than the english-21 portrait. The photographer is not checked beyond the Commons tag.
- **Crops:** head to coat for frame 0 (crop x 0.20–0.76, y 0.01–0.56), and a circular head crop for the lesson.

## Style (rule `25` incl. both addenda; approved animation-direction skill, editorial mode)
- **On-screen words across the whole video:**
  - frame 0: "SHE READ THEIR SECRETS";
  - "12,000+";
  - "ENIGMA";
  - the card "one key per lock".
  - Letter tiles (E, Q and the coded letters), the dial's frequency numbers and the rotor's letter ring are parts of the objects, not labels.
  - One idea per scene.
- **Motion that explains:**
  - coded letters leave the radio and turn gold when she reads them;
  - the same E becomes the same Q three times, and Q piles up highest until it flips to E;
  - slips pile up while the counter runs;
  - the rotor steps on every press and the same E becomes Q, X, then M, all of which flip back to E;
  - one red key opens every lock, then each lock gets its own key.
- **Transitions:** hard cut with flash (5.29), whip pan (6.60–6.80), push (11.15–11.40), push (14.30–14.55), page turn (20.75–21.10), CTA slide (26.70–27.10).
- **Captions:**
  - Inter 800 54 px, plate centred at x = 500, y 300–460. This episode moves the plate up from y 330–490 to match the brief's "approximately y280-460", below the platform account UI.
  - Every line is ≤ 681 px wide, so the plate runs x 129–871.
  - Frame-0 elements stay below y 560, so the plate never covers them.
- **Sound accents:**
  - faint radio hiss and three soft beeps (dit-dit-dah) in the pause after "code.";
  - a chime as the letters turn gold;
  - clicks as letters pass the swap box and rain into columns;
  - slip landings and counter ticks;
  - key presses with rotor steps;
  - three rising chimes as Q, X and M read E;
  - lock clicks and a snap shut;
  - card and CTA chimes.
  - Music is ducked under speech.

## QA (final export)
- **ffprobe:** h264 High yuv420p 1080x1920 30/1, 900 frames (900 decoded), 30.000000 s; aac LC 48 kHz 2 ch, 30.000000 s; 5.9 MB.
- **Full decode** (`-xerror`): no errors.
- **Loudness:** −15.0 LUFS integrated, −1.5 dBTP true peak, LRA 3.0.
- **Clipping:** peak −1.49 dBFS, flat factor 0; audio md5 `d7281d1440f18f3e9dc08f1f4c239447`.
- **First frame:** equals the thumbnail composition (1.51/255); luminance 65.2/255; audio from 0.08 s.
- **Captions** (`qa/caption_bounds.txt`): 12 groups of at most 2 lines. The widest line is 681 px, so the plate runs x 129–871 and y 300–460. The first caption appears at 0.22 s.
- **ASR on the export:**
  - faster-whisper small (en) matches the script word for word, except the TTS spelling "Elizabeth" and the app name ("RUMP"; earlier episodes heard "RUM"/"RM" from the same TTS respelling).
  - tiny.en also hears "code" for "codes" and "leaked" for "leak"; the small model hears both correctly.
- **Sync** (`qa/sync.txt`): 29 events. Word-triggered events land between 0.25 s before and 0.10 s after their words; the hard cut lands 0.13 s before the measured S2 onset (5.42), and the code beeps sit in the pause after "code.". "Nazi" and "Download" are stamped late or early by ASR; the measured speech onsets (14.63, 27.13) were used, and the captions fall back to the placed sentence starts.
- **Frames:** `qa/contact_representative.jpg` (every 1 s) and `qa/contact_transitions.jpg` (22 frames incl. t = 0 and the ending), reviewed on the final export.
- **Fixes:**
  - **Before the full render:**
    - the coded letters bunched on frame 0, so they now follow a wider arc with four tiles and a larger dial;
    - the missing-key outline was enlarged and placed under the lock;
    - the lesson's red key no longer starts half off-screen.
  - **After the first full render** (one video-only re-render; audio md5 unchanged):
    - the push into Enigma showed an empty page, so the rotor and E key now appear as the page pushes in;
    - the counter no longer shows a faint "0" before "cracked".

## Remaining limits
- **No listening:** I cannot listen in this container. Narration, sync and clipping were checked with two ASR models, word timestamps, onset measurements and audio statistics; no human listening was done.
- **Blocked sources:** NSA, USCG and Smithsonian institutional pages refused automated access (403). The claims rest on the Marshall Foundation, PBS, Smithsonian Magazine, National Geographic, Cambridge and Oxford material listed above.
- **Simplifications:** a one-rotor Enigma; simple substitution standing for the smugglers' many systems; illustrative letters.
- **No review folder:** none in this cloud container. The MP4 and thumbnail are attached in chat and pushed only to the app branch.
