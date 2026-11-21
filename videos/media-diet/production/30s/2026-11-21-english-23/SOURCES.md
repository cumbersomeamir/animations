# Sources — Media Diet english-23 (30 s): "Kicked flat. How does it get up?" — the hidden recovery trick in a new robot demonstration

Brief (batch 23, authorised 21 Nov 2026): "The hidden recovery trick in a new robot demonstration" — a genuinely new, verified robotics
demonstration from within 72 h of 21 Nov 2026 (not EV charging, batteries, geothermal or a prior episode), one surprising engineering
question about balance or recovery, centre of mass + contact forces + a clear payoff about what the demo actually proves; footage verified
or an explicitly illustrative 3D recreation; no manufactured breaking news or exact performance. Applies this app's latest feedback
("more powerful, trendy … not hit or miss; content is weak"): a viral-style moment (a humanoid kicked over gets back up) explained by one
first-principles mechanism.

## Topic history check (all prior records read: context/11 log rows english06…22, context/19…37)
Previous robotics episodes: english-13 (Boston Dynamics' wheeled Atlas: why a walking robot needs wheels — motor torque–speed limits),
english-17 (TeCoBot tensegrity robots linking by claws), english-19 (Genesis AI arms that packed a box but struggled with a tiny label).
Batch 22's actual subject: BYD flash charging (lithium plating, Joule heat; a cell cross-section on a charging set). None covered balance,
falls or getting up. This episode's core question (how does a fallen humanoid get up?), visual setting (an outdoor paper test lawn + a
holographic simulation pad) and mechanism (static balance: centre of mass over the support area; contact-force sharing; a training
curriculum) are all new.

## Dated candidates compared (both within 72 h of 21 Nov 2026)
| | A · ReLoco humanoid fall recovery (chosen) | B · 151 humanoids dance for a Guinness record |
|---|---|---|
| date | arXiv preprint submitted **18 Nov 2026** (arXiv:2611.23916v1 [cs.RO]) | event 17 Nov 2026, Shenzhen; Interesting Engineering, 19 Nov 2026 |
| what | one learned policy walks, runs, gets a 64.5 kg Tiangong 3.0 humanoid up after kicks and resumes the task | 151 humanoid robots dancing in sync (ENGINEAI, Unitree, AGIBOT models), beating a 110-robot record |
| balance/recovery question | yes: how does a fallen humanoid stand up; hardware trial counts and timings | no: synchronised choreography, no recovery measurement |
| primary source | the paper itself + the authors' project page with robot footage | press report only (no Guinness page found) |
| verdict | chosen: exact fit to the brief, primary-sourced numbers, honest limits stated by the authors | rejected: spectacle without a mechanism or measurement |
Also scanned and not used: Foundation Phantom MK-II (Interesting Engineering, 20 Nov; a defence-oriented humanoid), State Grid
line-sleeving robot (20 Nov), GENTO 21-DoF hand (19 Nov), firefighting robot heat test (19 Nov), IEEE Spectrum Video Friday (20 Nov,
includes an Atlas clip — Atlas was english-13).

## Primary source (A)
- L. Fu, Y. Hu, Y. Zhong, J. Zhang, X. Li, L. Ji, Z. Xu, J. Tang, S. Li (corresponding), "ReLoco: Unified Humanoid Locomotion and Fall
  Recovery via Behavior-Conditioned Motion Priors", arXiv:2611.23916v1 [cs.RO], submitted 18 Nov 2026 — https://arxiv.org/abs/2611.23916 ;
  HTML full text read. Affiliations: Huazhong University of Science and Technology (Wuhan) and the Beijing Innovation Center of Humanoid
  Robots. **A preprint: not peer-reviewed** (stated on screen in the payoff).
- Project page (authors): https://lequn-f.github.io/ReLoco — hosts real-robot videos (recovery-front, recovery-back, cover) and an
  interactive MuJoCo demo; checked that the footage exists. The episode does **not** use that footage: every image is an explicitly
  labelled illustrative 3D recreation ("illustrative 3D recreation" chip on frame 0).

Facts used (quoted/paraphrased from the paper):
- Robot: "The Tiangong 3.0 humanoid is 1.70 m tall and weighs 64.5 kg"; 31 DoF, 23 controlled by the policy.
- Hardware kicks while standing (§III-D 2, Table VII a): "Of 47 attempts, 34 resulted in falls after which the policy remained active,
  five did not produce a fall, and eight triggered immediate hardware protection. The policy recovered autonomously in all 34 trials where
  control continued, covering prone, supine, and side-lying configurations."
- Timing (Table VII b, first ten recoveries per posture, 30 trials): get-up **2.64 ± 0.64 s** mean (supine 2.07, side-lying 2.81, prone
  3.04 s); fall 0.96 ± 0.39 s (prone 0.78 s — used for the fall animation length).
- Limits stated by the authors: "Manual kicks varied in direction and magnitude, but the applied forces were not measured." "Since kick
  and push magnitudes were not controlled, these demonstrations do not establish a maximum recoverable force or a quantitative
  terrain-robustness comparison."
- Training trick (§II-D, Fig. 3): "an upward force is applied to the robot's head while it is non-upright"; after the windowed get-up
  success rate exceeds 0.8, "assistance decreases by 20 N at each reset from a fallen state until it reaches zero"; with 400 N "the force
  reaches zero near 1.9 k iterations, and the final unassisted rate is 0.955 ± 0.005, compared with 0.915 ± 0.004 without assistance"
  (single training runs); "Evaluation and hardware deployment use no assistance."
- Deployment: one proprioceptive actor, "without controller switching or on-robot policy fine-tuning"; hardware trials include walking
  and running kicks with task resumption (not counted in the episode's "47").
- Get-up behaviour: recovery "can involve rolling, arm support, and substantial torso rotation"; get-up references allow foot and hand
  contacts; "the policy can reposition the body before standing up".

## First principles (explanation, not a claim about the paper's controller)
- Static balance: a body stands without falling only while its centre of mass lies above the area enclosed by its ground contacts
  (support polygon). Standing on two feet, that area is the feet; on hands and feet it is much larger.
- Force sharing: the ground forces on hands and feet must add up to the weight (64.5 kg × 9.81 m/s² ≈ 633 N). With the centre of mass
  ahead of the toes, the hands must carry part of it; once the centre of mass is moved back over the feet the hands' share drops to zero
  and they can lift — then the legs can extend.
- The on-screen readouts ("hands 430 N · feet 210 N" … "hands 0 N · feet 630 N") are computed live from the paper model's pose with an
  illustrative mass split (2-D statics, rounded to 10 N), labelled "illustrative statics". They are not measured robot data.

## Facts vs. explanation vs. illustration
| Narration | Kind | Source |
|---|---|---|
| Kicked flat. How does it get up? | hook (kicked falls; question) | ReLoco §III-D 2 |
| In a new study, researchers kicked this robot 47 times. | fact (47 standing kick attempts; preprint 18 Nov 2026) | ReLoco Table VII a |
| To stand, its center of mass must be over its feet. | physics (static balance) | first principles |
| So it plants its hands, shifts its weight over its feet, then lets go. | explanation of a get-up with arm support (illustrative statics on screen) | first principles; ReLoco ("arm support", hand contacts) |
| In training, an invisible lift held its head, then faded out. | fact (simulation curriculum: upward force on the head, reduced to zero) | ReLoco §II-D, Fig. 3 |
| On the real robot: 34 falls, 34 get-ups. | fact (34 falls with control active, all recovered; chip: the other 13 kicks = 5 no fall + 8 safety cut-outs) | ReLoco Table VII a |
| It proves recovery, not toughness: kick strength was never measured. | conclusion matching the authors' own limitation | ReLoco §III-D 3 |

Not claimed: the 96.80 % / 96.96 % simulation success rates (simulation, not shown), any maximum survivable kick, that the robot's real
controller uses these exact contacts/poses, peer review. Visuals: a generic paper humanoid (not a replica of Tiangong 3.0), boot, lawn,
simulation grid, tally board and kick-force meter, all illustrative; the 2.64 s stopwatch and 47-tile tally use the paper's numbers.
