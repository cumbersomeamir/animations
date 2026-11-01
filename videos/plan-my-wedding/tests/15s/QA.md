# QA — plan-my-wedding-15s-test.mp4

Final file: `videos/plan-my-wedding/tests/15s/plan-my-wedding-15s-test.mp4` (rendered 2026-11-01 in this Claude Code session).

## Technical (from qa/verify.json, qa/ffprobe.json)
| Check | Result |
|---|---|
| Duration | 15.000 s (container, video and audio streams) |
| Video | H.264 High, 1080x1920, yuv420p, 30/1 fps, 450 frames counted by decode |
| Audio | AAC LC, 48 kHz stereo, ~194 kb/s, 15.000 s |
| Full FFmpeg decode | `ffmpeg -v error -i … -f null -` → no errors (qa/decode.log empty) |
| Loudness | −15.9 LUFS integrated, true peak −3.2 dBFS (two-pass loudnorm, linear) — no clipping |
| Narration fit | 7 lines, each inside its slot; the last ends at 14.95 s (build/vo/vo.json) |

## Visual review (qa/contact-sheet.jpg every 0.5 s; qa/boundaries.jpg at the scene boundaries 1.0, 2.0, 2.45, 4.3, 4.72, 6.5, 6.9, 8.7, 9.1, 10.95, 11.5, 12.45, 12.9, 13.35, 14.0, 14.97 s)
- **Action continuity:** one crane, folded from the invitation, links every beat. Set pieces stay in place and the final pull-back shows them all together. Checklist items tie to coins (budget) and to the invites beat (third tick).
- **Medium fidelity:** faceted folds lit from the upper left, crease highlights, soft diffused shadows, pleats (canopy, checklist, dress), pop-up rises from the floor plane, 12 fps stepped timing with per-step jitter. No smooth organic squash/stretch, and all motion is planar hinge/slide/pivot.
- **Text/readability:** captions sit on folded cream strips (Cormorant 78 px, ink #4A1E26) inside the top safe zone (y≈240–360). End title is 150 px. CTA is Jost 46 px cream on raspberry. Vendor and checklist labels are 28–32 px and are read in the zoomed shots. In the wide shots they're decorative only.
- **Colour:** accents sampled from the app icon (cream #FDF6EE, raspberry #B32F3F, gold #C3904C) with blush/cream pastel tints, following the origami lane's soft-pastel exception.
- **Claims:** only listing-verified features: venue, vendors (caterer, decor, photographer), save favourites, checklist, budget, invitations, RSVPs, "together in one … workspace" → "All folded into one plan". No metrics, prices, ratings or testimonials. No app UI is depicted (no screenshots, no mock screens). The only product asset is the official Play icon in the CTA banner.
- **CTA:** "Plan My Wedding" and "Explore on Google Play" are held on screen from about 13.7 s to 15.0 s. The text is generic, with no Google Play logo or badge.

## Defects found and fixed
1. Pass 0 stills: right-hand guests hidden behind the checklist → moved checklist/budget lower (DY 230).
2. Pass 0 stills: folded pennants showing as flipped triangles on the end card → hidden until opened, and the string folds away with the world.
3. Pass 0 stills: venue/vendor shots had too much empty floor → re-framed the camera keys, enlarged the opening card (700x500) and the crane.
4. TTS pass 1: two lines exceeded their slots → retimed lines 6/7 and the caption 6 start.
5. Render pass 1 (boundaries sheet): empty stage for about 0.1 s before the pillars at 2.45 s → pillars now pop at 2.40/2.52.
6. Render pass 1: "Send invites" never ticked although invites are sent → third tick at 9.75 s with a stamp sound.
7. Render pass 1: the crane crossed the end-card emblem → it now flies a curved path out to the right before perching.

## Known limitations
- Code-rendered origami (vector facets + grain overlay), not photographed paper or AI-generated imagery. The skill's image/video-model prompting workflow was adapted, not used.
- 12 fps stepping is intentional; some viewers may read it as choppy.
- The narration voice is Kokoro "af_heart" (American English), and the market appears to be Indian weddings (mehendi in the listing). A regional voice was not evaluated.
- The audio has been checked objectively (levels, loudness, spectrum and cue timing) but I have not listened to it.
