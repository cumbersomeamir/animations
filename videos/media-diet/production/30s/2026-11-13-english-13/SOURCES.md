# Sources — Media Diet english-13 (30 s): "Why would a walking robot need wheels?" — Boston Dynamics' wheeled Atlas testbed

Topic selected 13 Nov 2026 after scanning 6–13 Nov 2026 official announcements and reliable reporting (New Atlas, Electrek,
IEEE Spectrum, The Robot Report, TechCrunch, The Verge, Ars Technica, Engadget, InsideEVs, Interesting Engineering, Canary Media,
Energy-Storage.news, NASA, Wired). Previously covered subjects (500 km/h car, Bean, every earlier app episode) excluded; chip-memory,
quantum and network-lock stories excluded as instructed.

Rejected after checking:
- UAVOS ApusNeo solar HAPS "100-hour flight" (New Atlas, 6 Nov): completion not confirmed by any official source as of 13 Nov
  (latest reports: "more than 80 hours", landing expected) — not presented as news.
- DARPA/Caltech ASTRA in-orbit truss assembly: official releases dated 5 Nov 2026, just outside the 6–13 Nov window.
- Lift Ocean ONE bolt-on hydrofoil (New Atlas, 8 Nov): product page exists but no dated official announcement in the window.
- CAT R3200 XE loader (Electrek, 10 Nov): specs "not yet officially released" (dealer leaks). BYD robotic charger: same company as
  the previous episode. Battery/BESS business items: not a visual demonstration.

**Exact topic:** Boston Dynamics' blog post "Atlas on a Roll — Bridging Classical Motor Controls and Whole-Body RL", published
9 Nov 2026 14:50 UTC, with a video: off-the-shelf scooter rims bolted to the Atlas humanoid's ankle actuators, a learned
whole-body controller driving it, side dashes and a 360-degree spin jump. The episode asks why a walking robot would need wheels
and answers with BD's stated reason: a motor stress test, because a motor cannot deliver full torque at full speed, and a
controller trained on idealised simulated motors learns moves the real hardware can't do.

**Status:** research testbed demonstration — "A wheeled Atlas isn't a product. It's a research testbed." (BD). Not an announcement
of a product; findings "are already being adapted back to our standard configuration" (BD).

## Primary / official source (read 13 Nov 2026)
1. Boston Dynamics — "Atlas on a Roll", by Xiaoyu (Andy) Wu, Controls Engineer, Atlas team; datePublished 2026-11-09T14:50:00Z.
   https://bostondynamics.com/blog/atlas-on-a-roll/
   - "We swapped the feet on our Atlas® robot … it let us push our actuators, and our models of them, hard."
   - "A wheeled Atlas isn't a product. It's a research testbed."
   - "We wanted a scenario where the motors had to deliver high torque and high speed continuously … every launch, turn, and stop
     pushes the motors across their full torque-speed range."
   - "A single custom adapter mounts an off-the-shelf scooter rim onto our existing ankle actuator, and that's the only new part."
   - "Reinforcement learning works by running millions of simulations of the robot before it ever runs on the hardware."
   - "If the simulation used for training assumes the motors are over-idealized, the policy can end up learning things the real
     hardware can't actually do. If the simulated motors behave the way the real ones do, the policy learns moves that the robot
     can carry out for real."
   - "… tuning the simulated motor model to match what we measured on the robot."
   - The 360-degree jump followed a recording of a person (trajectory tracking) and "worked on the first try".
2. Northwestern University Mechatronics Wiki — "Brushed DC Motor Theory" (Lynch et al.):
   https://hades.mech.northwestern.edu/index.php/Brushed_DC_Motor_Theory
   - At constant voltage the speed–torque curve is a straight line; stall torque (zero speed) is the maximum torque; at the
     no-load speed the torque is zero; back-EMF is proportional to speed; continuous torque is limited by heating (i²R).

## Corroboration (reliable reporting)
- The Robot Report, 9 Nov 2026 — https://www.therobotreport.com/boston-dynamics-adds-wheels-to-atlas-humanoid-to-test-whole-body-control/
- Korea JoongAng Daily — https://www.koreajoongangdaily.com/business/atlas-is-on-a-roll-hyundais-humanoid-robot-trades-feet-for-wheels/12965255
- Interesting Engineering — https://interestingengineering.com/ai-robotics/boston-dynamics-atlas-wheeled-robot

## Facts vs. explanation vs. illustration
| Claim in the video | Kind | Source |
|---|---|---|
| Boston Dynamics put scooter wheels on Atlas (scooter rim + one adapter) | official account | 1 |
| A research testbed / stress test for its motors, not a product | official statement | 1 |
| Every launch, turn and stop pushes the motors' torque–speed limit | official statement (paraphrased) | 1 |
| No motor gives full torque at full speed | engineering principle (voltage-limited motor: torque falls to zero at no-load speed) | 2 |
| It trained in simulation (millions of runs) | official statement | 1 |
| Perfect (over-idealised) simulated motors teach moves the real hardware can't do | official statement (paraphrased) | 1 |
| The team measured the real motors and tuned the simulator to match | official statement (paraphrased) | 1 |
| "A robot's AI is only as good as its motor model" | editorial takeaway summarising BD's conclusion that accurate motor models and learning work best together | 1 |

Illustrative, not measured: the chart is a generic straight-line motor curve (no Atlas motor data is public in the post); the
"ideal motor" box, the operating-point dot positions for launch/turn/stop, the measured dots and the simulation grid are
schematic. No speeds, torques, weights or prices are claimed.

## Visuals
Editorial paper-diorama reconstruction: a generic paper humanoid on scooter-style wheels (not a replica of Atlas), labelled
"editorial reconstruction". No Boston Dynamics footage, photos or logos are used.
