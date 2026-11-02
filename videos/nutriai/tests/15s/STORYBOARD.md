# NutriAI 15 s style test (shader-glsl) — storyboard

1080×1920, 30 fps, 450 frames. Medium: GLSL fragment shaders only (no illustration layer). Every
visual is computed per pixel from uniforms driven by one clock (`u_time = frame/30`). Timing source:
`source/timeline.json`.

Story: one leaf-green droplet becomes the day's organic flow; the flow **resolves** into a meal ring,
then into a glass of water, then into the NutriAI mark and the Google Play call to action.

| # | Frames (s) | Shader action (verbs) | Skill technique | Caption | Narration | Sound on action |
|---|---|---|---|---|---|---|
| A | 0–78 (0–2.6) | A glowing droplet **falls** with a light trail toward pulsing anticipation rings; it **strikes** (f12): flash, shock ripple, chromatic split; domain-warped fluid **blooms** outward to fill the frame | SDF droplet + lens refraction, ripple displacement, chromatic aberration, domain warping (noise into noise), fbm | Every **bite.** Every **sip.** | "Every bite. Every sip." (0.6 s) | falling whistle → sub impact + splash → bubbles |
| B | 78–204 (2.6–6.8) | The fluid **contracts** and swirls into a ring (envelope tightens around the SDF), the warped outline **snaps** crisp (f104); a fork glyph **solidifies** inside; three liquid blobs **spiral in** and **merge** (metaball smooth-union) into the rim, each **sweeping** a leaf-green segment (f128/154/180) with a ripple | SDF ring + segments, opSmoothUnion metaballs, warped-edge → crisp (fwidth AA), tangential flow | Track every **meal.** + Breakfast / Lunch / Dinner labels | "Track every meal." (3.47 s) | suction swell → tock → plop + rising chimes ×3 |
| C | 204–330 (6.8–11.0) | A displacement wave **melts** the ring; it **drips** down and **pools**; a glass outline **dissolves in**; four refractive droplets **fall** (f252/272/292/312), each **raising** the caustic water and **lighting** a tally tick; surface **waves** | Displacement / drip transition, noise-dissolve reveal, trapezoid SDF, caustics from |snoise| ridges, refraction | Log every **glass** of **water.** | "Log every glass of water." (7.4 s) | melt glide → pour → four rising plinks |
| D | 330–450 (11.0–15.0) | The water **drains** into a vortex that **rises** and **condenses** into the icon's ring + leaf (f364 snap), which **noise-dissolves** into the real app icon tile; wordmark, subtitle and feature line **liquid-reveal**; the Google Play button **pops** and is **pressed** (f418) | Vortex domain twist, SDF logo (vesica leaf), dissolve transition to texture, liquid text reveal | NutriAI · Calorie Tracker · Meals · Water · Weight · Fasting · **Explore on Google Play** | "NutriAI." (12.07 s) "Explore on Google Play." (13.0 s) | swirl riser → A-major bloom → pop → click |

Claims check: meals, water, weight and fasting tracking come from the Play listing description; "Calorie
Tracker" is the listing title. Ring segments, labels, glass ticks are abstract motifs (stylized), not app UI.
No metrics, outcomes, pricing or testimonials.
