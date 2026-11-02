# 08 — Educational strategy (ACTIVE DIRECTION)

Status: **active**. This supersedes the campaign-style brief (02) and the 30-second deliverable spec (04) **for educational lessons only**.
Saved 2026-11-02 from the user-approved brief "Help — Educational Pilot 01". App: Help · `com.tensorblue.help` · branch `claude-video/help` · workspace `videos/help/`.

## Why
The user wants a niche audience built with *useful lessons*, not app advertisements. Each lesson must teach one thing a
viewer can use even if they never install Help. Relevant app posts may come occasionally **later**; they are not part of this format.

## Channel niche
Practical helping, donation logistics, verification and dignity.

## Format (every lesson)
- Exactly 15.000 s, 1080×1920 portrait, H.264 + AAC, 30 fps.
- **One concept only.** Open with a question/physical puzzle → demonstrate the mechanism with objects → end on a concise, usable takeaway.
- Short, comfortably paced narration (≈30–40 words). If the idea doesn't fit, **narrow it**; never speed the voice up or add false simplifications.
- Concise burned-in captions (cream pill, ink text, key words underlined in yellow), inside a mobile-safe zone (top chip ≥112 px, captions ≈1350–1560 px).
- Original music + action-timed SFX; narration ducked above music; −16 LUFS integrated, ≤ −1.5 dBTP.
- Persistent "Illustrative scene" chip + "Lesson NN". Small app signature (icon + "Help · giving, explained") in the last ~1.2 s. **No Play-Store CTA, no feature tour, no slogans.**
- Never imply the illustrative scene is real app UI, real footage, experiment data, a real recipient, a testimonial or an impact report.

## Visual identity
Warm cream / green / yellow **miniature neighbourhood diorama** floating on an ink stage (dimensional, tilt-shift "documentary" feel),
following one parcel/object per lesson. Palette sampled from the app icon (`assets/icon.png`): cream `#F7F5EF`, ink `#0B0D12`,
green `#2DB37D`, yellow `#F2C230` (+ documented tints `#1F8A5E`, `#D9A81F`, kraft `#D3AE7E`, coral REC dot `#E0644F`).
Original procedural three.js geometry rendered in headless Chromium; no third-party models, textures or footage.

## Recurring performer: **Tally**
Original miniature human fact-checker (pronouns: they/them). Silhouette: wide yellow bucket hat, round ink glasses, bell-shaped
green coat with yellow buttons, yellow satchel, curly dark hair. Tally **performs** the mechanism: holds/presents props, points,
tosses, reacts, investigates. Rig + model sheet: `education/pilot-01/src/rig/figure.js`, `education/pilot-01/character/`.
Voice: Piper `en_US-ljspeech-medium` (LJ Speech dataset, public domain) re-pitched −1 semitone with formants preserved + EQ.
Not an imitation of any actor or named character. Extras (couriers, recipients) are generic, respectful, upright, smiling; no pity framing.
Situations, camera language and choreography change per lesson; Tally's design stays fixed.

## Quality references (inspiration only)
User-provided: instagram.com/battysticky and instagram.com/breakingbreach. **Not watched or heard in this session** (Instagram not
accessed); only the user's description was used: expressive recurring performer on a dimensional dark stage doing physical
demonstrations; dimensional objects and visual metaphors explaining mechanisms. Nothing copied: no characters, scripts, logos,
assets, palettes or voices.

## Accuracy policy
- Public subject research allowed; cite every factual claim with URL + access date in the lesson's `SOURCES.md` (claim→source map).
- Product facts only from `assets/listing.json`. The listing says "verified proof"; **how** Help verifies is unknown → never describe or imply current product safeguards.
- No real people, recipients, testimonials, metrics, prices, outcomes or endorsements.

## Planned follow-on episodes (titles only — NOT rendered; each needs its own research)
1. Receipt vs delivery photo: what each one actually shows
2. Outputs vs outcomes: "100 kits delivered" isn't "100 lives changed"
3. Was this photo taken today? Spotting a reused donation image
4. Consent first: can someone say no to the camera when they receive help?
5. Faces, names, addresses: what a proof photo should leave out
6. "Needed items" lists: why asking beats guessing what to give
7. Cash, goods or voucher: what each kind of help is good at
8. The last mile: why the final handoff is the hardest step
9. "Verified" by whom? Three questions to ask about any proof
10. After the parcel: what follow-up can (and can't) tell you
