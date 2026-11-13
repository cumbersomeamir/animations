# 17 — Brand source for Hindi episode 03 (2026-11-03): app.werbens.com (MANDATORY per latest brief)

The latest user brief requires the visible colours and logo of **https://app.werbens.com** in the video ("not a guessed
palette or werbens.com substitute"). This file records that source and the exact values. It supersedes the palette and
logo decisions in `context/15` for episodes from `production/30s/2026-11-03-hindi-03/` on; context/15 stays as the record of
the Play listing / werbens.com inspection. Renderer, style recipe, motion, caption treatment and pacing are unchanged.

## Facts (inspected 2026-11-03 in headless Chromium; computed styles read from the live DOM)
- URL: `https://app.werbens.com/` → redirects to `https://app.werbens.com/app` (HTTP 200); page title "Werbens - Marketing
  Company and AI Content Platform". Visible header lockup: square **logo mark** + **"Werbens"** wordmark; light glass header
  over a dark-navy hero; mint/teal accents.
- **Logo file:** `https://app.werbens.com/app/werbens-logo.svg` (HTTP 200, image/svg+xml, 1388×812, viewBox 0 0 694 406;
  `<title>Werbens Logo</title>`, desc "Werbens angular W logo recreated from the original silhouette as clean SVG geometry").
  Geometry: rect fill **#7FE7DC** + angular W path fill **#316879**, drop shadows (#316879 @ 35 %, #5CE0D2 @ 25 %).
  Saved verbatim: `assets/brand/app-werbens-logo.svg` (sha256 816c1761552aa2aa8468b3313c2e83512924f838a54b0c560aabf00fe017fe9b).
- **Wordmark:** "Werbens" in **Space Grotesk 700**, 30.4 px, letter-spacing −1.216 px (−0.04 em), gradient text
  `linear-gradient(135deg, #7FE7DC, #316879)` (background-clip: text).
- **Fonts:** body Manrope; headings + wordmark Space Grotesk.
- **Colours (computed; most frequent first):**
  | Token | Value | Where seen |
  |---|---|---|
  | ink | **#0F172A** rgb(15,23,42) | main text (164 elements) |
  | mint-white | **#F0FDFA** rgb(240,253,250) | text on dark, light header tint |
  | deep teal | **#316879** rgb(49,104,121) | logo W, active nav text, Login button background, borders @ 8–12 % |
  | mint | **#7FE7DC** rgb(127,231,220) | logo field, accent text, gradient start |
  | teal | **#5CE0D2** rgb(92,224,210) | gradient mid, logo glow |
  | navy | **#0B1120** rgb(11,17,32) | dark sections / panels |
  | slate | **#64748B** rgb(100,116,139) | secondary text |
  | amber | **#F59E0B** rgb(245,158,11) | small accent text |
  | white | **#FFFFFF** | cards, header glass `linear-gradient(rgba(255,255,255,.88), rgba(240,253,250,.72))` |
  Hero headline gradient: `linear-gradient(135deg, #7FE7DC, #5CE0D2 50%, #FFFFFF)`; dark panels
  `linear-gradient(rgba(9,16,30,.94), rgba(8,20,34,.78))`.
- Not repeated anywhere (unverified marketing figures on the page): "97% brand voice match", "10,000+ creators", "50M+", etc.
- Note: the Google Play icon (context/15, violet #6435FC) differs from this web-app logo. Per the latest brief the video uses
  the app.werbens.com logo and palette; the Play icon is not shown in this episode.

## Decisions (applied in hindi-03)
- 3D hero accents: deep teal #316879 + mint #7FE7DC (lit bases pre-compensated for the accepted ACES renderer, measured in
  QA); negative space #F0FDFA / white; ink #0F172A; secondary #64748B; navy #0B1120 for dark props.
- Caption treatment unchanged (pill, size, word groups, brighten as spoken) — pill #0F172A @ 92 %, highlights #7FE7DC;
  the Devanagari captions use Noto Sans Devanagari 800 (Inter has no Devanagari glyphs).
- CTA: the app.werbens.com logo (SVG unchanged) on the accepted landing tile + the wordmark (Space Grotesk 700, −0.04 em,
  135° #7FE7DC→#316879 gradient). Amber is not used.

## Re-check 2026-11-04 (hindi-04)
app.werbens.com re-loaded: computed palette, wordmark styling and `werbens-logo.svg` (byte-identical, sha256 816c1761…)
unchanged. No token changes.

## Re-check 2026-11-05 (feedback-05)
Re-loaded again: palette, wordmark styling and logo SVG (sha256 816c1761…) unchanged. Amber #F59E0B is used only for clutter stickers.

## Re-check for english-06 (batch 2026-11-06; container clock 2026-11-05)
Re-loaded again: top-40 computed colour list identical, wordmark styling (Space Grotesk 700, −1.216 px, 135° #7FE7DC→#316879)
and logo SVG (sha256 816c1761…) unchanged. Amber #F59E0B is used only for the "25% FAT" card and the fat block.

## Re-check for english-07 (2026-11-06)
Re-loaded again: top-40 computed colour list identical, wordmark styling unchanged, logo SVG sha256 816c1761… unchanged.
Amber #F59E0B is used only for the fake "WAS ₹500" sticker and the "pricey" end of the gauge.

## Re-check for english-08 (batch 2026-11-07; container clock 2026-11-06)
Re-loaded again: top-40 computed colour list identical, wordmark styling unchanged, logo SVG sha256 816c1761… unchanged.
Amber #F59E0B is used only for the fake "ONLY 2 LEFT!" tag.

## Re-check for english-09 (2026-11-08)
Re-loaded again: top-40 computed colour list identical, wordmark styling unchanged, logo SVG sha256 816c1761… unchanged.
Amber is not used in this episode.

## Re-check for english-10 (2026-11-09)
Re-loaded again: top-40 computed colour list identical, wordmark styling unchanged, logo SVG sha256 816c1761… unchanged.
Amber is not used in this episode.

## Re-check for english-11 (2026-11-09)
Re-loaded again: top-40 computed colour list identical, wordmark styling unchanged, logo SVG sha256 816c1761… unchanged.
Amber is not used in this episode.

## Re-check for english-12 (2026-11-11) + colour-theme change
Re-loaded again (HTTP 200 → /app): top-40 computed colour list identical to 2026-11-09, wordmark styling unchanged (Space
Grotesk 700, 30.4 px, −1.216 px, 135° #7FE7DC→#316879), hero headline gradient `linear-gradient(135deg, #7FE7DC, #5CE0D2 50%,
#FFFFFF)`, logo SVG sha256 816c1761… unchanged. Per the 2026-11-11 feedback ("change color theme and logo to actual
app.werbens.com … not … guessed light blue") the episode now uses the site's rendered **dark-navy hero theme** in every scene
(navy #0B1120 stage + fog, ink #0F172A plinths, deep teal #316879 / mint #7FE7DC accents, mint-white #F0FDFA props, dark-glass
caption pill with mint border, hero-gradient labels) instead of the light #F0FDFA studio; values and rendered measurements in
context/28 §3. Amber unused.

## Re-check for english-13 (2026-11-13)
Re-loaded again (HTTP 200 → /app): top-40 computed colour list identical to 2026-11-11; wordmark styling and hero-headline
gradient unchanged; Login button #316879; logo SVG sha256 816c1761… unchanged. The dark-navy hero theme (context/28 §3) is kept
in every scene; rendered values in context/29 §3. Amber unused.
