// English-10 final script (sources and claim map in context/25-english10-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens" (context/11 pronunciation list). Its en-us G2P
// also gave the non-rhotic ɜː in "learn", "service", "purpose", "verb": general rhotic override ɜː → ɜɹ (applied after Werbens);
// the hyphenated "15-minute" was joined into one word: split.
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ", "fˈɪftiːnmˈɪnɪt": "fˈɪftiːn mˈɪnɪt" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "Learn more... about what?" },
  { id: "L2", start: 2.05, text: "Here are two buttons for a fictional meal kit service." },
  { id: "L3", start: 5.05, text: "'Learn more' hides what happens next. 'See the 3 plans' says it before you tap." },
  { id: "L4", start: 10.0, text: "Web accessibility guidelines from the W3C say a link's purpose should be clear from its text." },
  { id: "L5", start: 16.5, text: "So name the next step: a verb plus what they'll get, like 'Compare 3 plans' or 'Book a 15-minute call'." },
  { id: "L6", start: 23.2, text: "No guessing what comes next." },
  { id: "L7", start: 26.1, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 1: 0.6, 2: 1.14 },
  L2: { 1: 2.34, 2: 2.42, 3: 2.58, 4: 2.81, 5: 3.07, 6: 3.27, 7: 3.62, 8: 3.93, 9: 4.13 },
  L3: { 1: 5.45, 2: 5.66, 4: 6.15, 5: 6.62, 7: 7.6, 8: 7.79, 9: 8.04, 10: 8.35, 12: 8.77, 13: 9.0, 14: 9.16 },
  L4: { 2: 11.08, 3: 11.79, 4: 11.95, 5: 12.06, 6: 13.46, 7: 13.85, 9: 14.35, 10: 14.69, 11: 14.92, 12: 15.0, 13: 15.21, 14: 15.39, 15: 15.55 },
  L5: { 1: 16.8, 3: 17.29, 4: 17.49, 6: 18.3, 7: 18.67, 8: 18.93, 9: 19.09, 10: 19.33, 11: 19.86, 12: 20.03, 13: 20.48, 14: 20.75, 15: 21.21, 16: 21.35, 17: 21.47, 18: 21.55, 19: 21.82, 20: 22.22 },
  L6: { 1: 23.49, 4: 24.4 },
  L7: { 2: 27.1, 3: 27.22, 5: 27.74, 6: 28.02 },
};
