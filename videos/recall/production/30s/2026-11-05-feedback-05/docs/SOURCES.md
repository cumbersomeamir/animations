# Sources and claim check — Recall feedback-05 "हेडफ़ोन ने एसी की गूंज दबा दी, पर दोस्त की आवाज़ क्यों सुनाई दी?" (why noise-cancelling headphones reduce steady hum but not voices)

Sources were fetched on 2026-11-05. Quotes are verbatim.

## Sources read
| # | source | used for |
|---|---|---|
| S1 | Sony Help Guide, WH-1000XM4, "The effect of noise canceling is not sufficient." — https://helpguide.sony.net/mdr/wh1000xm4/v1/en/contents/TP0002752735.html (© 2020 Sony) | what ANC is effective on (low frequencies: airplanes, trains, offices, air-conditioning) and not as effective on (higher frequencies such as human voices) |
| S2 | Sony Help Guide, WH-H900N (same page title) — https://helpguide.sony.net/mdr/whh900n/v1/en/contents/TP0001513207.html (© 2017 Sony) | the same sentence, confirming it across models |
| S3 | Sony Help Guide, WF-SP800N (same page title) — https://helpguide.sony.net/mdr/wfsp800n/v1/en/contents/TP0002755729.html (© 2020 Sony) | the same sentence; fit/seal advice |
| S4 | US Patent **US8848935B1** "Low latency active noise cancellation system" (Audience, Inc.; current assignee Samsung Electronics; priority 2009-12-14; granted 2014-09-30) — https://patents.google.com/patent/US8848935B1/en | mechanism (reference microphone, anti-noise wave, destructive interference) and why higher frequencies suffer (latency: the anti-noise arrives too late) |

**Attempted but not usable:** the Apple Support URL tried (https://support.apple.com/en-us/102583) returned an unrelated archived article, so it is not cited.

## Verbatim quotes
- **S1, S2, S3:**
  - "The noise canceling function is effective in low frequency ranges such as airplanes, trains, offices, near air-conditioning, and is not as effective for higher frequencies, such as human voices."
- **S3:**
  - "When you feel the noise canceling function and low frequency sound are insufficient, change the earbuds to ones that feel more sealed."
- **S4:**
  - "a reference microphone provides a reference signal based on the background noise captured at a reference position."
  - "the anti-noise acoustic wave is intended to attenuate or eliminate the background noise at the listening position via destructive interference, so that only the desired audio remains."
  - "the performance of the ANC system is constrained by the latency (or delay) introduced during the formation of the compensation signal."
  - "excessive latency makes the anti-noise signal arrive too late to effectively cancel the noise signal, resulting in unsatisfactory cancelation at higher frequencies."

## Claim → source map (Hindi narration, with an English gloss)
| narration | gloss | support |
|---|---|---|
| हेडफ़ोन ने एसी की गूंज दबा दी, पर दोस्त की आवाज़ क्यों सुनाई दी? | The headphones suppressed the AC hum, so why was a friend's voice still heard? | S1 (effective near air-conditioning; not as effective for human voices) |
| बाहर का माइक शोर सुनता है, और स्पीकर उसकी उल्टी लहर बजाकर उसे घटाता है। | The outside mic hears the noise, and the speaker plays its opposite wave to reduce it. | S4 (reference microphone; anti-noise wave; destructive interference). "घटाता है" (reduces), not "removes" |
| पर उल्टी लहर ज़रा देर से बनती है; धीमी गूंज में चल जाता है, आवाज़ों की तेज़ लहरों में नहीं। | But the opposite wave is formed a little late; with a slow hum that's fine, with a voice's fast waves it isn't. | S4 (latency; anti-noise arrives too late → unsatisfactory cancelation at higher frequencies); S1 (low frequencies vs voices) |
| तो ये प्लेन, ट्रेन या एसी की गूंज में सबसे ज़्यादा मदद करते हैं। | So they help most with plane, train or AC hum. | S1/S2/S3 (airplanes, trains, air-conditioning) |
| कोई भी नया विषय एआई से सीखने के लिए रिकॉल डाउनलोड करें। | Download Recall for learning any new subject with AI. | the user's established Recall CTA; see the product-fact check in context 16/17 |

- **On-screen takeaway (no VO):** "एक-सी गूंज पर सबसे ज़्यादा असर।" (strongest effect on steady hum) — S1.
- **Diegetic call:** "अरे, सुनो!" (Hey, listen!) is a sound effect demonstrating a sudden voice. It is not a claim.

## How the animation uses the sources (illustrative, not measured)
The wave panel shows three lanes:
1. noise;
2. the opposite wave, formed with the **same small delay** in both examples (shown as the "देर" band);
3. what reaches the ear.

The wavelengths are chosen so that:
- the slow hum is mostly cancelled (the residual is about 31% of the original);
- the voice's short waves are **not reduced** (the residual is about equal to the original).

The video never shows a voice being amplified. Real headphones also use feedback microphones, adaptive filters and passive sealing; the animation isolates the one sourced reason (delay versus frequency).

## What the video does not claim
- No decibel or percentage figures.
- No claim that ANC removes noise completely, and no hearing or medical claims.
- No claims about any specific product or brand.
