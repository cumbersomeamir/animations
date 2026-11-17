# Sources — Media Diet english-19 (30 s): "Tiny label. Big problem." — Genesis AI's robot-arm demo and the label it struggled to peel

Topic selected 17 Nov 2026 (batch 19, after batch 18 was delivered). Brief: a verified new robot demonstration and the task it still cannot
do. Excluded: Colorado State tensegrity robots (english-17), Boston Dynamics wheeled Atlas (english-13), the copper hoverboard (english-18),
the Bean and every earlier topic in the context/11 log. Benchmark: the Bean episode's clear question → physical stakes → first principles.

**Event and date (since the previous episode):** TechCrunch, Tim Fernholz, **17 Nov 2026, 6:00 AM PST** — reporting from a demo at Genesis AI's
Silicon Valley facility; Genesis AI's own Series A announcement video on YouTube is dated **2026-11-17 14:02 UTC**. The date of the reporter's
visit itself is not stated. Genesis AI's demo footage is not used; the film is an editorial reconstruction.

Checked since 15 Nov and rejected:
- Penn Engineering "CoilLCE" artificial muscles (piano finger, robot eyes) — coverage 15–16 Nov, but Penn's release is dated 12 Nov and the
  Advanced Functional Materials paper was published 7 Sep 2026 (not fresh).
- NC State "Howl" egg-collecting humanoid (IE, 17 Nov) — still in simulation; practical demonstrations targeted for early 2027.
- Skydio F10 Lightrunner lopsided drone (IEEE Spectrum, 15 Nov) — the product was announced by Skydio on 24 Sep 2026.
- Remedy Robotics telesurgery feature (IEEE Spectrum, 16 Nov) — describes a January visit; no new dated demonstration.
- UC3M/UPNA soft gripper (release 2 Oct 2026), ROBOTERA hand launch (product PR), market reports — not fresh or not a demonstration.

## Primary / firsthand
1. TechCrunch, "Genesis AI raises $500 million to deploy glove-wearing robots", 17 Nov 2026 —
   https://techcrunch.com/2026/11/17/genesis-ai-raises-500-million-to-deploy-electric-glove-wearing-robots/
   - Genesis's physical AI model "operated a pair of off-the-shelf robotic arms"; in one demo the arms "picked up two small cardboard boxes,
     scanned them, placed them in a larger cardboard box, folded it closed, taped it shut, and then plucked a label off a strip of printer
     tape and applied it to the box."
   - "During the second go-round, the robot fumbled a box and had a heck of a time peeling the tiny adhesive label off the printer tape."
   - "Genesis gathers force data … using a sensor-enabled glove … worn by more than 100 real workers … The company's robots wear the same
     sensor-equipped gloves, and their 'hands' are designed to mimic the proportions of human hands."
   - "Right now, the company's dexterous hands can only operate for a few weeks of regular work before they need to be replaced."
2. Genesis AI, "Genesis - $500M Series A", YouTube, published 2026-11-17T14:02:19Z — https://www.youtube.com/watch?v=VeYie2A9iGk
   (date via the channel's RSS feed; the company site genesis.ai renders its post with JavaScript and could not be read here).

## Physics of peeling
- K. Kendall, "Thin-film peeling — the elastic term", *Journal of Physics D: Applied Physics* 8, 1449–1452 (1975),
  https://doi.org/10.1088/0022-3727/8/13/005 (metadata confirmed via Crossref). For a thin, inextensible film the peel force per width is
  F/b = G / (1 − cos θ), where G is the adhesive fracture energy and θ the angle between the pulled film and the surface.
- Derived ratios (ideal film, same adhesive): θ = 90° → 1×; 45° → 3.4×; 20° → 16.6×; **10° → 65.8× (≈ 66×)**; 180° → 0.5×.
  With real, slightly stretchy films the elastic term lowers the extreme small-angle values, so "dozens of times" is used in narration and
  the on-screen figure is labelled "ideal thin film, 10° vs 90°".

## Facts vs. explanation vs. illustration
| Claim (narration) | Kind | Source |
|---|---|---|
| Tiny label. Big problem. | hook summarising the reported rerun | 1 |
| Robot arms run by Genesis AI packed a box and taped it shut. | reported demonstration (off-the-shelf arms, Genesis's model) | 1 |
| On a rerun, the tiny label fought back. | reported ("had a heck of a time peeling the tiny adhesive label") | 1 |
| So why is a sticker harder than a box? | the episode's question | — |
| Pull it nearly flat, and it takes dozens of times more force than pulling straight up. | physics: ideal thin-film peel law (≈ 66× at 10° vs 90°) | Kendall 1975 |
| So the hard part is lifting that first edge. | explanation from the peel law: a steep angle needs a lifted edge first — **general physics, not a reported diagnosis of Genesis's rerun** | Kendall 1975 |
| Genesis trains touch with sensor gloves, | reported mechanism (force data from sensor gloves worn by workers and robots) | 1 |
| but its hands wear out in weeks. | company statement ("a few weeks of regular work before they need to be replaced") | 1 |
| Lift a corner, then pull steep. | practical takeaway from the peel law | Kendall 1975 |

Not claimed: why the rerun went wrong (not reported), success rates, speeds, prices, the humanoid Eno's abilities (not demonstrated to
TechCrunch), the funding amount (not in the narration), whether the demo arms wore the gloves. Visuals: generic paper reconstruction — the
human-proportioned gloved hands, the box, the label strip and the peel cutaway are schematic; the label sizes are illustrative.
