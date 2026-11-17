# Episode record: "can they tell you're nervous?" (the illusion of transparency), English, english18-01

Request: "NEXT EDUCATIONAL EPISODE — … next batch18 on 15 November 2026". Topic: "Why everyone notices your nerves less than you think" (illusion of transparency and public-speaking nervousness). Brief: a thought bubble visible to the speaker but hidden from the audience; compare predicted vs rated anxiety using real findings, without invented numerical bars; a useful reframe and no cure promise; hook "CAN THEY TELL?".
Deliverables:
- `videos/mello/production/30s/2026-11-15-english-18/mello-30s-english18-01.mp4`
- `videos/mello/production/30s/2026-11-15-english-18/mello-30s-english18-01-thumbnail.png` (1080x1920, "CAN THEY TELL?", the same composition as frame 0)

Durable rules: `10-format-and-style-rules.md` sections 8 (2026-11-11) and 9 (first frame). Palette as in `22`.

## Topic decision (history checked first)
- Not covered in context 11–27.
- The closest episode is hindi03-01 (`13`, the spotlight effect: how much others notice your *appearance or actions*, the Barry Manilow T-shirt study). The illusion of transparency is a different question: whether your *inner state* (nerves) shows. It has its own studies and its own tested fix (telling speakers about it).
- To keep the two apart, this episode uses no T-shirt, no "they're busy with their own things" reframe, and none of hindi03's numbers.

## User instructions applied
- **First frame:** the speaker at a lectern beside a giant thought bubble with a pounding heart; the audience's heads below. The words "Can they tell / you're nervous?" (5 words) are on screen at frame 0. Hook audio at 0.15 s. The thumbnail is the same composition with "CAN THEY TELL?".
- **Thought bubble visible to us, hidden from the audience:** in S5 the camera swings from behind him (bubble and racing heart in view) round to the audience's side, and the bubble fades out; from there he just looks like a speaker.
- **Predicted vs rated anxiety from real findings:** the card's bars are drawn to scale from one class study's published averages, with no numbers on screen and no invented values.
- **Retained:**
  - store-sampled palette (`22`);
  - soothing original bed (13.1 dB under the voice) with a soft, muffled heartbeat that follows the heart on screen;
  - the approved faceless performer and narrator, synthesized fresh; English only; captions inside x 100–900.
- No cure promise: "knowing this helped speakers" is reported from a study. The reframe is "they see less than you feel".

## Research (sources checked 2026-11-17)
1. **Gilovich, T., Savitsky, K., & Medvec, V. H. (1998).** The illusion of transparency: Biased assessments of others' ability to read one's emotional states. *Journal of Personality and Social Psychology, 75*(2), 332–346. https://doi.org/10.1037/0022-3514.75.2.332 (PMID 9731312; PubMed abstract read)
   - "a tendency for people to overestimate the extent to which others can discern their internal states. People often mistakenly believe that their internal states 'leak out' more than they really do."
   - The authors attribute it to adjusting "insufficiently from the 'anchor' of their own phenomenological experience".
2. **MacInnis, C. C., Mackinnon, S. P., & MacIntyre, P. D. (2010).** The illusion of transparency and normative beliefs about anxiety during public speaking. *Current Research in Social Psychology, 15*(4). https://crisp.org.uiowa.edu/sites/crisp.org.uiowa.edu/files/2020-04/15.4.pdf (full text read)
   - **Study 1:** students in an introductory public speaking course gave short speeches to their class (audience M = 15.0 people); 93 speakers completed the speaker surveys.
   - After speaking, speakers rated their own anxiety (situational PSA) and how they thought the audience rated it (reflected appraisal); audience members rated each speaker's anxiety. All three use a six-item scale summed to 6–42.
   - Table 1 means: speakers felt 24.0; speakers expected the audience to rate 23.3; the audience rated 17.3.
   - Both the speakers' own ratings and their expectations were significantly higher than the audience's (t(92) = 7.71 and t(91) = 7.89, p < .001). Own rating and expected rating did not differ (t(91) = 1.57).
   - Their description of Savitsky & Gilovich (2003): speakers "overestimated the extent by which their nervousness was evident to their partner. Further, the effects of this illusion were ameliorated by simply assuring speakers that their anxiety was not as visible to the audience as speakers tend to believe."
3. **Savitsky, K., & Gilovich, T. (2003).** The illusion of transparency and the alleviation of speech anxiety. *Journal of Experimental Social Psychology, 39*(6), 618–625. https://doi.org/10.1016/S0022-1031(03)00056-8
   - **Not read directly.** The publisher page returned 403 and the course-hosted copy 403; the archived copy is on a host the fetch tool refuses; the original Cornell URL is 404; Semantic Scholar and Crossref have no abstract.
   - The script's "knowing this helped speakers" rests on MacInnis et al.'s peer-reviewed description above ("ameliorated by simply assuring speakers…").
   - Secondary summaries (Wikipedia; Dlugan, Six Minutes, 2018) also say informed speakers rated themselves better and observers rated their speeches better. The script does not claim the observer-rating detail.

How the script uses them (measured / reported / gloss / advice / illustrative):
- **Definition (1998):** "Psychologists call that worry the illusion of transparency."
- **Measured (MacInnis et al. 2010, one class study, averages):**
  - "After class speeches, students scored their own nerves and guessed what the audience saw. They expected the audience to see nearly all of it (23.3 vs 24.0). Audiences rated them clearly calmer (17.3)."
  - Card bars: (mean − 6) / 36 of the bar, so 0.50, 0.48 and 0.31, with "calm" / "very nervous" at the ends and "one class study, averages" on the card.
- **Gloss of the mechanism (1998 anchoring):** "You feel your nerves from the inside. They only see the outside."
- **Reported (2003 via 2010):** "In another study, knowing this helped speakers."
- **Advice / reframe:** "So remind yourself: they see less than you feel." This is an average across speakers, not a promise for every speaker or every talk.
- **Illustrative:** the bubble, the heart and its rate, the camera swing, the audience's nods, his calmer posture.

## Voice and verification
- Kokoro-82M v1.0, 0.7 × af_bella + 0.3 × am_puck, en-us, speed 0.98, local CPU, synthesized fresh.
- ASR fix: "students rated their nerves" was heard as "raided their nerves". Four phrasings were tested and "scored their own nerves" chosen (exact, and closest to a rating scale).
- ASR (faster-whisper large-v3-turbo, per line) is then exact on the narration and on the pre-render mix.
- Measured word starts (Whisper, about 0.1 s early):

| words | start (s) |
|---|---|
| "nervous" | 0.77 |
| "illusion of transparency" | 3.54 |
| "class speeches" | 5.59 |
| "scored their own nerves" | 7.17 |
| "guessed" | 8.57 |
| "nearly all of it" | 12.29 |
| "audiences rated them" | 13.57 |
| "clearly calmer" | 14.79 |
| "from the inside" | 17.0 |
| "they only see the outside" | 18.12 |
| "knowing this helped speakers" | 20.99 |
| "remind yourself" | 22.99 |
| "they see less than you feel" | 24.11 |

- I can't listen to audio. The check is an ASR round-trip plus loudness and stem measurements.

## Final script (English, as recorded; 70 words)
| line | text | start | end |
|---|---|---|---|
| hook | Can they tell you're nervous? | 0.15 | 1.31 |
| name | Psychologists call that worry the illusion of transparency. | 1.70 | 5.06 |
| study | After class speeches, students scored their own nerves and guessed what the audience saw. | 5.35 | 10.11 |
| result | They expected the audience to see nearly all of it. Audiences rated them clearly calmer. | 10.75 | 15.83 |
| why | You feel your nerves from the inside. They only see the outside. | 16.20 | 19.68 |
| payoff | In another study, knowing this helped speakers. So remind yourself: they see less than you feel. | 20.05 | 25.46 |
| cta | Take a mindful break with Mello. | 26.60 | 28.32 |

## Storyboard (6 shots)
- **S1, 0–1.55, frame 0 = thumbnail:** the speaker at a lectern on a low stage, gripping it; a giant thought bubble with a pounding violet heart beside his head; the audience's heads below. "Can they tell / you're nervous?".
- **S2, 1.55–5.2:** closer; the heart racing beside him (muffled heartbeat).
- **S3, 5.2–10.5:** dark in-app card "HOW NERVOUS, AFTER CLASS SPEECHES" ("one class study, averages"). "speakers felt" (solid lilac), then "they guessed" (outline).
- **S4, 10.5–16.0:** closer on the card. A gold "≈" between the first two bars on "nearly all of it", then "audience saw" (gold, shorter) on "clearly calmer".
- **S5, 16.0–19.85:** behind him, the bubble fills the view ("from the inside"). On "they only see the outside" the camera swings round to the audience's side, and the bubble and heartbeat fade out.
- **S6, 19.85–30:** front three-quarter. The bubble returns; the heart slows and shrinks. He looks up and opens a hand; two audience members nod. Lock-up from 26.3 s.
