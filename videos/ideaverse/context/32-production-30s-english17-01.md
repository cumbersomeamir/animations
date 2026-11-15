# 32 — Production 30s english17-01 (English): "You pressed too late, but your phone still caught the jump. How?"

Batch 2026-11-15-english-17 ("NEXT EDUCATIONAL EPISODE", batch17; follows the delivered batch16). Workspace
`production/30s/2026-11-15-english-17/` · deliverables `ideaverse-30s-english17-01.mp4` + `ideaverse-30s-english17-01-thumbnail.png`.
Repo cumbersomeamir/animations · branch claude-video/ideaverse (confirmed clean at ecce9e8; no job running, nothing queued).
Style: accepted pilot-01 DOCKET newsroom style via the latest renderer; 2026-11-11 rules + first-frame rule (context/11).

## Topic check (history: context/09, 12–31)
- Proposed: "How your phone saves the photo from before you pressed the shutter" (buffered frames / zero shutter lag,
  selecting a sharp moment; distinguish buffering from an AI best-shot feature). No earlier episode covers the frame
  buffer, zero shutter lag, Top Shot or Live Photos (english-15 Night Sight explained a burst merged *after* the press, in
  low light — a different mechanism) → used as proposed.

## Script (English, 74 words) — placements from ASR word timings
| id | start (s) | beat | line |
|---|---|---|---|
| s1 | 0.20 | hook + real question | You pressed too late, but your phone still caught the jump. How? |
| s2 | 3.95 | mechanism (buffer) | The camera starts shooting when you open it, keeping recent frames in a loop. |
| s3 | 8.40 | mechanism (zero shutter lag) | The shutter just picks frames it already took. |
| s4 | 10.95 | proof (documented features) | Live Photos and Top Shot keep a second and a half on each side. |
| s5 | 15.35 | AI step (one implementation) | Top Shot even has a model suggest a sharper frame. |
| s6 | 20.00 | payoff | Missed it? Open the photo's motion frames and pick the jump yourself. |
| s7 | 27.20 | CTA | Download the Ideaverse app. |
All lines transcribed exactly by base.en (small.en heard "press" for "pressed" in s1; base.en, used for QA, is exact).

## Facts → sources (accessed 2026-11-15)
| claim | type | source |
|---|---|---|
| the camera starts shooting when you open it, keeping recent frames in a loop; the shutter picks frames it already took | documented (Pixel; general mechanism = zero shutter lag) | Google Research blog, "Night Sight: Seeing in the Dark on Pixel Phones" (14 Nov 2018), https://research.google/blog/night-sight-seeing-in-the-dark-on-pixel-phones/ — "the default picture-taking mode on Pixel phones uses a zero-shutter-lag (ZSL) protocol … As soon as you open the camera app, it begins capturing image frames and storing them in a circular buffer that constantly erases old frames to make room for new ones. When you press the shutter button, the camera sends the most recent 9 or 15 frames to our HDR+ or Super Res Zoom software. This means you capture exactly the moment you want — hence the name zero-shutter-lag." |
| Live Photos keep 1.5 s on each side | documented (Apple, current) | Apple Support, "Take and edit Live Photos", https://support.apple.com/en-us/104966 — "With Live Photos, your iPhone records what happens 1.5 seconds before and after you take a picture. Then you can pick a different key photo" (Live Photo is on by default; the Camera turns it on again unless the setting is preserved). |
| Top Shot keeps 1.5 s on each side | documented (Google, Pixel 3 launch description) | Google Research blog, "Top Shot on Pixel 3" (20 Dec 2018), https://research.google/blog/top-shot-on-pixel-3/ — "Top Shot captures up to 90 images from 1.5 seconds before and after the shutter press, selecting up to two alternative shots to save in high resolution … (other lower-res frames can also be reviewed as desired)". |
| Top Shot has a model suggest a sharper frame | documented (one specific implementation — not a property of buffering in general) | same post — "analyzes the image frames before and after the shutter press on the device in real-time using computer vision techniques, and recommends several alternative high-quality HDR+ photos"; "uses a hardware-accelerated MobileNet-based single shot detector"; attributes include "whether the subject is blurry", "are the subject's eyes open?". Current behaviour: Pixel Camera Help, https://support.google.com/pixelcamera/answer/9937175 — "With Top Shot, your Camera app takes a burst of photos and automatically chooses your best shot." |
| missed it? open the motion frames and pick the jump yourself | documented (both platforms) | Apple (above) — Edit → Live → "Drag the white frame to choose a different thumbnail … tap Make Key Photo" · Pixel Camera Help — "Manually pick your favorite shot from Motion Photos … pick a favorite shot from your motion photos". (Works only if Live Photo / Motion / Top Shot was on; alternates other than the saved high-res ones can be lower resolution — kept in notes, not narrated.) |
| Ideaverse | — | Name + current Play icon only. No claim of any Ideaverse camera or photo feature. |
Illustrative (not measured): the dog-and-hurdle scene, the 12-slot ring and its capture rate (one frame per 0.25 s), the 7
frames on the ±1.5 s card and their spacing, the blur levels, the scan, the frame-picker screen and touch dot (EXAMPLE).

## Storyboard (cues.js)
1. 0–3.85 hook: DOCKET holds a phone showing a perfect mid-air jump; an amber touch dot on the shutter;
   BEFORE YOU CLICKED from frame 0; head tilt on "How?".
2. 3.85–8.45 a ring of frame slots (NOW at the front): from "starts shooting" a new frame is written every beat and the
   ring turns, older frames dim (ALREADY SHOOTING → ON A LOOP).
3. 8.45–10.85 the press: the ring stops, the latest frames fly out into one photo — the dog already landing (ALREADY TAKEN).
4. 10.85–15.3 card: 7 frames around the press (press row amber), then −1.5 s / +1.5 s (1.5 S EACH SIDE).
5. 15.3–19.9 a scan runs down the frames; the mid-air frame (before the press) gets ✓ (AI SUGGESTS).
6. 19.9–26.85 DOCKET's phone: frame picker; the touch dot drags from the press frame back to the jump; "Use this frame" → ✓
   (PICK THE FRAME).
7. 26.85–30 CTA "Download the / [icon] Ideaverse app."
Thumbnail: the hook phone + "BEFORE YOU / CLICKED".

## QA / status — DELIVERED 2026-11-15
- Output: production/30s/2026-11-15-english-17/ideaverse-30s-english17-01.mp4 · sha256 3b16f0c9…98f0, plus
  ideaverse-30s-english17-01-thumbnail.png ("BEFORE YOU / CLICKED"). QA.md in that folder.
- 30.000 s, 900 frames, H.264 High yuv420p 1080x1920 30 fps, AAC-LC 48 kHz stereo; full decode clean; −15.0 LUFS / −1.9 dBTP.
- English ASR on the final MP4: all seven lines MATCH, no word outside its caption; caption text inside x 100..900; top band text-free.
- Limitation: ASR-only listening check (no by-ear listen possible here).
