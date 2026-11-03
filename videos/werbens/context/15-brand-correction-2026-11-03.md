# 15 — Brand correction (2026-11-03): official colours and logo

Scope: ONLY the brand colour theme and the logo. Everything else in `context/11` (style recipe "Satisfying Product
Theatre", renderer, motion, caption treatment, voice, pacing, audio) stays as accepted. This file supersedes the palette
lines in `context/05-progress.md` ("violet #6234FB"), `context/11` ("Palette", lavender/deep-violet tints) and
`context/14` §4 wherever they conflict.

## Facts (inspected 2026-11-03; measured from files, not guessed)
| Source | What was inspected | Measured result |
|---|---|---|
| Google Play listing `https://play.google.com/store/apps/details?id=com.werbens.app` (HTTP 200) | Icon image `play-lh…vpoOKo4…TT1A=s0` (512×512) | **Byte-identical to `assets/icon.png`** (sha256 b9709c1f51e7…). Background **#6435FC**, W ribbon **#FEFEFD** (white). The icon is current; it is the app's official logo. Listing text unchanged ("Discover creators and manage brand campaigns, briefs and conversations."; Tensorblue AI; updated Oct 6, 2026). |
| Same listing | 5 phone screenshots (1080×2340): dashboard, campaign chat, business workspace, creator discovery, performance | App UI palette: primary **#573EEC** (buttons, sent chat bubbles, progress bars, kicker labels, active tab); light/disabled **#AEA2F4** (and tint #E4E1FD); page background **#F7F8FA**; cards **#FFFFFF** with border **#E4E7EB**; headings **#101114**; secondary/inactive grey **#8C93A1** (also #687083). No lavender (#CCC0F7), pale violet (#F0EAFC), deep violet (#4A1FD6/#2A1678) or ink #1B1433 appear. |
| `https://www.werbens.com/` (plain curl → HTTP 429 bot check; loaded in headless Chromium → HTTP 200, "Werbens" site built on Wix Studio) | Header logo + computed styles | **Logo lockup:** inline SVG mark = a full circle + a right half-circle touching it (fill #000002, black), saved verbatim as `assets/brand/werbens-site-logo-mark.svg` (sha256 bfeb9558…), followed by the word **"Werbens"** in **Fahkwang, weight 700**, black (computed style; 18 px in the header). Site palette: black #000000, off-white #F5F4F3, white, accent lime #CFFF28, olive #5F7614, slate #52558A. The site describes Werbens as an advertising and digital-marketing company (UK, India, Dubai). |
Not used / not claimed: the site's "1000+ happy customers" and "1,034 ad campaigns" counters, its service list, and the
listing screenshots' sample people/numbers (they are UI samples, not facts to repeat). No screenshot is shown in the video.

## Decisions (brand correction applied from round 2026-11-03-round-02 on)
- **Hero accent:** app primary **#573EEC** replaces #6234FB. Light accent **#AEA2F4** replaces lavender #CCC0F7.
- **Neutrals:** studio sweep / negative space **#F7F8FA** (app background) with white; label cards white with **#E4E7EB**
  borders; text **#101114**; secondary text **#8C93A1**. The lavender-tinted greys are dropped.
- **Captions:** same treatment (pill, size, word groups, words brighten as spoken); the pill colour changes from the
  invented deep violet to the app heading ink **#101114** (92 %), highlight words **#AEA2F4**.
- **Logo:** CTA uses the official Play icon image unchanged (tile side colour matched to the measured **#6435FC**) and the
  official website lockup (circle + half-circle mark + "Werbens" in Fahkwang Bold, black) instead of the typeset
  Inter "Werbens" wordmark. No invented emblem. The channel line "Decoding how brands sell" stays as a small grey tagline
  under the lockup (it is the series line, not a brand claim).
- The website's lime/olive accents belong to the agency site, not to the app listing; they are recorded but not used.
- Fictional example brands in episodes keep their own labels ("Fictional brand") and never use the Werbens lockup.

## Verification hooks
`production/30s/2026-11-03-round-02/QA.md` §brand: icon hash check, palette tokens in `src/scene.html` / `src/scene.js`,
lockup frames in `qa/frames/`.
