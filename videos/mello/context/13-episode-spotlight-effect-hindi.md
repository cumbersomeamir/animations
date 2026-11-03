# Episode record: "स्पॉटलाइट इफ़ेक्ट" (spotlight effect), Hindi (hindi03-01)

Round: 2026-11-03 "hindi-03". Deliverable: `videos/mello/production/30s/2026-11-03-hindi-03/mello-30s-hindi03-01.mp4` (one video).
Durable rules: `10-format-and-style-rules.md` is unchanged. This file adds the episode record only.

## User instructions applied
- **Topic:** a psychology hack, the spotlight effect. Show the imagined audience versus what people are actually busy with, and give one practical reframing action. Research the original study. No guided meditation, no cure claims.
- **Sheet feedback:** Satisfied = Yes. Keep the accepted room, performer, lavender/ivory identity, typography, staging and style, and keep the CTA "Take a mindful break with Mello" (here translated into Hindi, see below).
- **Latest correction (overrides older language instructions):** all narration and captions are natural Hindi in Devanagari.
  - Use a genuinely Hindi-capable local voice, not English Kokoro fed Hindi text.
  - Check pronunciation and intelligibility.
  - Render real Devanagari glyphs, with no missing squares.

## Topic history check
Earlier episodes covered breathing (stickman), cognitive defusion (feedback-01) and sensory grounding (round02-01). The spotlight effect is new.

## Research (primary source checked 2026-11-03)
**Gilovich, T., Medvec, V. H., & Savitsky, K. (2000).** The spotlight effect in social judgment: An egocentric bias in estimates of the salience of one's own actions and appearance. *Journal of Personality and Social Psychology, 78*(2), 211–222. https://doi.org/10.1037/0022-3514.78.2.211
- Full text was read from the archived Cornell copy: https://web.archive.org/web/20131030215508/http://www.psych.cornell.edu/sites/default/files/Gilo.Medvec.Sav_.pdf (also https://www.psychologyib.com/uploads/1/1/7/5/11758934/the_spotlight_effect_-_ib_psychology.pdf).
- **Study 1:** Cornell students wore a potentially embarrassing T-shirt (Barry Manilow) into a room where observers sat at a long table filling out questionnaires. The targets estimated how many observers could say who was on the shirt.
  - "The average estimate made by the targets was exactly twice as high as the average accuracy rate of the observers."
  - Footnote 3 gives the figures: 46% estimated vs 23% actual.
- **Mechanism (abstract):** "people appear to anchor on their own rich phenomenological experience and then adjust—insufficiently—to take into account the perspective of others."

How the script uses it:
- "लगभग आधे" stands for ≈46%, the targets' estimate.
- "क़रीब एक-चौथाई" stands for 23% actual.
- "हम अपनी नज़र से देखते हैं" ("we see things from our own viewpoint") is a plain-language gloss of anchoring on one's own perspective.
- The practical question ("what are these people actually busy with?") is a reframing prompt. It follows from that mechanism and from the busy observers in the study; it is not a tested intervention, so it is not presented as one.

Not claimed: any cure, treatment, percentage beyond "about half / about a quarter", or that the app teaches this.

## Voice: why this TTS
Candidates were tested locally with no paid API. Each test line was round-tripped through faster-whisper large-v3-turbo with the language forced to Hindi (character error rate):

| voice | CER |
|---|---|
| Kokoro-82M **hf_beta** (Hindi-trained female) | **0.093** |
| Kokoro hf_alpha | 0.111 |
| Kokoro hm_psi | 0.111 |
| Kokoro hm_omega | 0.120 |
| Piper hi_IN priyamvada | 0.102 |
| Piper hi_IN pratham | 0.130 (heard "एक अटपटी" as "180") |

Chosen: **Kokoro hf_beta, lang "hi"** (espeak-ng Hindi phonemes), **speed 1.05** so the Hindi script fits 30 s. The English af_bella/am_puck blend is not used for Hindi. No voice cloning.

Script changes made because of listening proxies (ASR):
- "एक-चौथाई ने ही याद रखा" was transcribed as "नहीं याद रखा", which flips the meaning. Rewritten as "सिर्फ़ क़रीब एक-चौथाई को याद रहा".
- "आंकते" was misheard ("आखते"). Replaced with "देखते".
- "झेंप" was heard as "जेंप". Replaced with the more common "शर्म आना".

## Final script (Hindi, as recorded) with English gloss
| line | Hindi | gloss | start | end |
|---|---|---|---|---|
| hook | कुछ गिरा, और लगा कि सब आपको ही देख रहे हैं? | Dropped something, and felt everyone was looking at you? | 0.30 | 3.10 |
| name | इसे स्पॉटलाइट इफ़ेक्ट कहते हैं। | This is called the spotlight effect. | 3.40 | 5.36 |
| study | एक अध्ययन में, अटपटी टी-शर्ट पहने छात्रों ने सोचा, आधे लोग शर्ट याद रखेंगे। | In a study, students wearing an awkward T-shirt thought half the people would remember the shirt. | 5.70 | 10.84 |
| real | असल में, सिर्फ़ क़रीब एक-चौथाई को याद रहा। | In reality, only about a quarter remembered. | 11.15 | 13.79 |
| why | हम अपनी नज़र से देखते हैं, पर बाकी लोग अपने कामों में लगे होते हैं। | We see things from our own view, but others are busy with their own things. | 14.05 | 18.23 |
| ask | अगली बार पूछिए: ये लोग असल में किसमें व्यस्त हैं? | Next time, ask: what are these people actually busy with? | 18.60 | 21.68 |
| qual | शर्म आना सामान्य है, पर शायद किसी ने उतना ध्यान नहीं दिया। | Feeling embarrassed is normal, but probably no one noticed that much. | 22.00 | 25.96 |
| cta | मेलो के साथ एक माइंडफुल ब्रेक लीजिए। | Take a mindful break with Mello. (accepted CTA, in Hindi) | 26.30 | 28.74 |

- The qualification appears once, in the relevant sentence ("शायद", probably).
- The year is left out of the narration for time; it is in the publishing copy.
- Numbers are said in words.

## Storyboard (5 shots)
1. **S1, 0.00–3.25: rear 3/4 medium (accepted).**
   - The performer's hand knocks the mug over (clink, thud).
   - On "…सब आपको ही देख रहे हैं?" a theatrical spotlight comes on and the room dims.
2. **S2, 3.25–5.55: high wide from behind-left.**
   - The *imagined* audience: four room-mates at a long table, tinted lavender with halos, all heads up staring at the performer under the spotlight.
   - Caption: "इसे स्पॉटलाइट इफ़ेक्ट कहते हैं।"
3. **S3, 5.55–13.95: over the performer's right shoulder.**
   - An "awkward T-shirt" print appears on the performer's back.
   - "आधे लोग": two of the four halos stay bright (half).
   - "असल में": the lights come back and everyone's head drops to their own task; only one person glances over briefly (a quarter).
4. **S4, 13.95–21.85: slow dolly along the long table.**
   - Hindi labels appear for what each person is busy with: पढ़ाई, फ़ोन, लैपटॉप, चाय.
   - On the question, the camera pulls back while the performer looks along the table at each person, and each label pulses as it is looked at.
5. **S5, 21.85–30.00: wide room (accepted staging).**
   - The performer sets the mug upright, opens the notebook and writes.
   - Lock-up from 26.0 s: real icon, "Mello", "Google Play पर". Caption: the Hindi CTA.

## Episode-specific adjustments (decisions in this round)
- **Room.** The room needed seated room-mates, so the back wall moved from z −2.7 to −4.2 to make floor space for a long table behind the desk; nothing else in the room changed. The table mirrors the study setup (observers at a long table).
- **Room-mates.** Four simple faceless figures in a lighter lilac-gray, using the same capsule style as the performer, so the accepted slate performer stays distinct.
- **Imagined vs real.**
  - *Imagined:* lavender tint, halos, heads up, spotlight, room dim.
  - *Real:* neutral, heads down on their tasks.
  - This shows the gap directly without turning the figures.
- **Typography.**
  - Devanagari uses **Tiro Devanagari Hindi** (OFL, @fontsource 5.2.7) as a fallback after the accepted Instrument Serif, which keeps Latin glyphs; caption line-height is 1.16 for matras.
  - The lock-up sub-line is "Google Play पर".
- **Labels.** They fade near the frame edges so no cut-off label ever shows; this needed a same-frame camera matrix update.
- **Mix.** The bed was raised to sit about 12.6 dB under the voice, the accepted balance; the denser Hindi narration ducks more.
