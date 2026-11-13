# 28 · English episode 13 (30 s) — "Why would a walking robot need wheels?" (Boston Dynamics' wheeled Atlas testbed)

Output: `videos/media-diet/production/30s/2026-11-13-english-13/media-diet-30s-english13-01.mp4` (30.000 s, 1080×1920, 30 fps,
H.264 yuv420p + AAC). Separate thumbnail: `…/2026-11-13-english-13/thumbnail-english13-01.png` (1080×1920, "WHY / WHEELS?").
Batch of 13 Nov 2026 under the approved feedback rules (context/26) and the latest feedback (weak/random news → Bean-level clear
question, physical stakes, first principles). Start state: english-12 delivered and pushed (ee4dd12 = remote), no jobs.
Earlier outputs untouched. Session user videos2@tensorblue.com (CLAUDE.md lists info@tensorblue.com; mismatch noted, nothing changed).

## Topic selection (recorded before rendering finished)
Window 6–13 Nov 2026; preferred a tangible robot or energy/storage demonstration. Rejected (details in the output folder's
SOURCES.md): ApusNeo solar plane 100-hour flight (completion unconfirmed), DARPA/Caltech ASTRA (official date 5 Nov), Lift Ocean ONE
hydrofoil (no dated official announcement), CAT R3200 XE (leaked specs), BYD charger (same company as english-12), BESS business news.
**Selected:** Boston Dynamics, "Atlas on a Roll" (blog + video, 9 Nov 2026 14:50 UTC): scooter rims on Atlas's ankle actuators,
a learned whole-body controller, side dashes and a 360 spin jump. Status: research testbed, explicitly not a product.
Corroboration: The Robot Report (9 Nov), Korea JoongAng Daily, Interesting Engineering. Motor physics: Northwestern Mechatronics Wiki.

## Story (Theory of Marketing) and pacing
thumbnail "WHY / WHEELS?" → hook 0–3.7 s (paper humanoid rolls in on scooter wheels and lands a 360) → super hook 3.7–5.9 s (foot
comes off, scooter rim + one adapter bolts on: "Why would a walking robot need wheels?") → answer + build-up/proof 5.9–22.1 s (it's a
motor stress test → torque–speed chart: no motor gives full torque at full speed → launch/turn/stop each hit the limit line → it
trained in simulation → perfect simulated motors teach impossible moves → the team measured the real motors and simulated those) →
payoff 22.1–26 s ("A robot's AI is only as good as its motor model"; the robot dashes and stops cleanly) → CTA 26–30 s.

## Narration = captions (approved English voice: Kokoro af_bella 0.7 + am_puck 0.3, 0.98, en-us) — 81 words, 26.1 s of speech
| id | start–end (s) | line |
|---|---|---|
| V1 | 0.15–3.44 | Boston Dynamics put scooter wheels on its Atlas robot. |
| V2 | 3.75–5.61 | Why would a walking robot need wheels? |
| V3 | 5.95–8.31 | It doesn't. It's a stress test for its motors. |
| V4 | 8.65–10.71 | No motor gives full torque at full speed. |
| V5 | 11.05–13.64 | Every launch, turn and stop pushes that limit. |
| V6 | 13.95–18.28 | It trained in simulation, where perfect motors teach impossible moves. |
| V7 | 18.60–21.90 | So the team measured the real motors, and simulated those. |
| V8 | 22.20–25.39 | A robot's AI is only as good as its motor model. |
| V9 | 26.10–29.22 | Follow Media Diet for the physics behind the headlines. (CTA) |
Every take transcribed exactly by Whisper medium before use.

## Storyboard (one visual idea and one large label at a time; labels at y ≈ 1330–1395, never in the caption band)
| shot | time (s) | picture | label |
|---|---|---|---|
| S1 | 0–3.66 | generic paper humanoid rolls in on scooter wheels, crouches, 360 spin jump, lands | small "Boston Dynamics · Atlas on a Roll · 9 Nov 2026", "editorial reconstruction" |
| S2 | 3.66–5.86 | ankle close-up: foot slides away, magenta adapter + scooter rim bolt on | scooter rim + 1 adapter |
| S3 | 5.86–8.56 | shell turns translucent; hip/knee/ankle/shoulder actuators glow as it launches hard | test rig, not a product |
| S4 | 8.56–10.96 | paper torque–speed board: axes → limit line (stall torque to no-load speed) → corner crossed out | not both at once |
| S5 | 10.96–13.86 | operating point jumps to the line for launch, turn, stop; line turns red at "limit" | LAUNCH → TURN → STOP |
| S6 | 13.86–15.53 | grid of translucent ghost robots rolling on simulation tiles | SIMULATION |
| S7 | 15.53–18.51 | ideal-motor box (full torque at every speed); dot moves into the corner; real triangle appears, dot turns red ✕ | ideal motor → impossible move |
| S8 | 18.51–22.11 | motor on a test bench spins; measured points appear; the simulated box snaps onto them | MEASURED → sim = real |
| S9 | 22.11–26.0 | robot rolls, dashes sideways and stops cleanly | honest motor model |
| S10 | 26.0–30 | Media Diet sign hinges up, robot beside it | — (caption only) |

## Style
Layered Tech Cutaway paper diorama (accepted renderer core, paper stock, key light, PCF shadows, ACES, restrained bokeh, vignette) +
a soft front fill light for robot shots; lab floor of paper cards; chart drawn per frame on a paper board. Captions: accepted Space
Grotesk 700 50 px, baselines 414/478, auto-fit to x 100–900; labels auto-fit to ≤ 720 px. No footage, photos or logos of Boston Dynamics.

## QA / limits (final export; details in the output folder's QA.md)
SHA-256 9abd3e98617372033bb0061ccabfb0723f08a72c0407bd8e2b235e3021ca3f23; 900 frames; video/audio/container 30.000 s; H.264 High yuv420p
1080×1920 30 fps; AAC-LC 48 kHz stereo (eng); full decode clean; −15.1 LUFS / −2.0 dBTP; captions ink y 378–488, x 181–900; labels x 185–895,
y 1300–1456; 0 safe-area/caption-band/one-label violations in 900 frames; caption↔speech 12/12; Whisper-medium word recall 1.0 full pass and
1.0 per line. Thumbnail thumbnail-english13-01.png (SHA-256 4304abcb…0b70f), words inside x 195–883.
Limits: generic paper reconstruction (no BD footage); chart is a generic motor curve, not Atlas data; takeaway line is an editorial
summary; three sequential reveals open on a briefly empty element (≤ 0.2 s); nobody has listened to or watched the final file yet.
