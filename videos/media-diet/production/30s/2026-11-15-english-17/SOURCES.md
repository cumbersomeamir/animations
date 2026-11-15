# Sources — Media Diet english-17 (30 s): "No joints. Just tension." — Colorado State's tensegrity robots that link up

Topic selected 15 Nov 2026 (batch 17, after batch 16 was delivered). Excluded: COMAC CE-25A (english-16), the Bean, Starship
(english-15) and every earlier topic in the context/11 log. Benchmark used: the Bean episode's clear question → physical stakes →
first-principles answer.

**Date, stated openly:** the paper and the university release are dated **11 November 2026**; the widest coverage (Popular Science)
is dated 12 Nov 2026. 11 Nov is about four days before 15 Nov, so it is **just outside** the requested 72-hour window. Nothing
stronger inside the window passed verification (below), so this is the "verified recent demonstration with an openly correct date".

Checked inside the window and rejected:
- Kestrel-inspired soaring robot (New Atlas, 15 Nov) — the npj Robotics paper is dated 21 Jun 2026, not new.
- Four strike drones catapulted off HMS Queen Elizabeth (New Atlas, 15 Nov) — military; Royal Navy release 5 Nov.
- BYD Seal 07 emergency steering at 81 mph (IE, 14 Nov) — no official dated source found; BYD was english-12.
- SS United States resting upright as a reef (13 Nov footage) — a scuttling, no technology mechanism to explain.
- Robo-frog with light-driven liquid-crystal muscles (PopSci, 13 Nov) — no dated primary source found.
- Bubble-powered underwater ride car (New Atlas, 12 Nov) — attraction, not a verified new demonstration.
- KIMM "sound from the screen" display — official release 6 Oct 2026.

**Exact topic:** Colorado State University researchers (Assoc. Prof. Jianguo Zhao's lab, Mechanical Engineering) published TeCoBot,
modular robots whose bodies are tensegrity structures — stiff rods held by a stretchable tension web, no traditional joints — with
claws at both ends so robots can link into chains, loops and branches. **Status:** lab research prototypes; currently human-piloted.

## Primary / official
1. Saikot, M.H., Spiegel, S., Kariyawasam, S.A., Stefka, A., Chrisler, J. & Zhao, J. "Tensegrity continuum robots enable
   task-adaptive morphologies for cooperative behaviours." *Nature Machine Intelligence*, published **11 November 2026**,
   https://doi.org/10.1038/s42256-026-01335-4 — abstract (read): tensegrity-based compliant body + claw-based connection mechanisms;
   each robot manipulates and moves on its own; several self-reconfigure into chains, loops, branches. Supplementary Video 2 (listing
   read): six locomotion modes incl. **pipe climbing**. The full text is paywalled and was not read.
2. Colorado State University, Walter Scott, Jr. College of Engineering, "Inspired by elephant trunks, these shape-shifting robots bend,
   grab and team up", Josh Rhoten, **11 Nov 2026** —
   https://engr.source.colostate.edu/inspired-by-elephant-trunks-these-shape-shifting-robots-bend-grab-and-team-up/ :
   "stiff rods are held in place by a web of tensioned cables rather than being rigidly locked together … lets them bend, collapse and
   change shape"; "no traditional joints yet feature a pair of gripping claws at both ends"; Zhao: "Right now, these systems need to be
   piloted by a human. However, we have already demonstrated that two robots can find each other and connect on their own"; team hopes
   to make them faster.

## Corroboration / dimensions
- Popular Science, Mack DeGeurin, **12 Nov 2026** — https://www.popsci.com/technology/robotic-slugs-fuse-together/ : 1 ft 11 in long,
  4.3 in diameter, ~600 g without batteries; **six carbon fiber rods** and a continuous, stretchable, 3D-printed tension network;
  a remote human operator; in demonstration videos two robots connect "to form one long robot that can more easily loop around a pipe",
  and several form an H-shape that "climb[s] along a duct"; a single robot can "shimmy up a pipe".

## Tensegrity physics
- Same definition in sources 2 and PopSci: rods held apart by a web in tension, not locked together by joints → rods carry
  compression (they push out), the web carries tension (it pulls in); the balance holds the shape.
- Sabelhaus, A.P. et al., "System design and locomotion of SUPERball, an untethered tensegrity robot", ICRA 2015 (NASA Ames / UC
  Berkeley) — https://best.berkeley.edu/wp-content/uploads/2015/07/ICRA_2015_SUPERball.pdf : on landing the tensegrity robot will
  "absorb impact forces by diffusing them through the structure"; rods and cables only carry single-axis loads.
- NASA NTRS 20140010029 (Super Ball Bot) — https://ntrs.nasa.gov/api/citations/20140010029/downloads/20140010029.pdf (tensegrity
  structures distribute applied forces through the whole network).

## Facts vs. explanation vs. illustration
| Claim (narration) | Kind | Source |
|---|---|---|
| No joints. Just tension. | reported design ("no traditional joints", web of tensioned cables) | 2, PopSci |
| Colorado State's new robots link up by their claws | reported design + demonstration (claw connection) | 1, 2 |
| Six stiff rods hang in a stretchy web | reported construction (six carbon fiber rods; stretchable tension network) | PopSci, 2 |
| pushing out while it pulls in | physics of tensegrity (rods in compression, web in tension) | 2, SUPERball |
| Squash it, and the load spreads, so it bends instead of breaking | general tensegrity behaviour (forces diffuse through the network) + reported flexibility ("bend, collapse") — an explanation, **not** a measured TeCoBot load test | SUPERball, NTRS, 2 |
| Linked up, they loop around pipes and climb ducts | reported demonstrations (loop around a pipe; H-shape climbs a duct) | PopSci, 1 |
| The catch: for now, a human still pilots them | quoted constraint | 2, PopSci |
| That's tensegrity: strength from pull, not from joints | editorial takeaway from the definition | 2 |

Not claimed: the actuation method (motors, cable drives — paper body not read), speeds, payloads, forces, costs, release or product
plans, autonomy beyond Zhao's quote. Visuals: generic paper reconstruction — the six rods (two layers of three), the web, the claws,
weights, pipe, controller and prism are schematic, not CSU's hardware, footage or photos; the H-shape duct climb is simplified to two
linked robots spiralling up a pipe.
