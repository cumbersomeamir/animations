// English-08 final script (sources and claim map in context/23-english08-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens" (context/11 pronunciation list). "were" before
// "rated" came out non-rhotic (wɜː) for en-us: rhotic override.
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "wɜː ɹˈeɪɾᵻd": "wɜɹ ɹˈeɪɾᵻd" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "Same cookies. Why do the last two look more tempting?" },
  { id: "L2", start: 3.6, text: "In a 1975 study, cookies from a nearly empty jar were rated more desirable." },
  { id: "L3", start: 9.75, text: "Cookies that ran low because others wanted them were rated higher still." },
  { id: "L4", start: 14.25, text: "That's scarcity: what's running out can seem more valuable." },
  { id: "L5", start: 17.7, text: "So show real limits: true stock counts and real end dates." },
  { id: "L6", start: 21.7, text: "But a fake 'only 2 left' is a known dark pattern." },
  { id: "L7", start: 26.1, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 6: 2.15, 7: 2.42, 8: 2.6, 9: 2.75 },
  L2: { 3: 4.95, 5: 6.2, 6: 6.42, 7: 6.5, 8: 6.92, 9: 7.4, 10: 7.72, 11: 7.92, 12: 8.23, 13: 8.55 },
  L3: { 1: 10.25, 2: 10.42, 3: 10.66, 4: 11.36, 5: 11.75, 6: 12.0, 7: 12.35, 8: 12.6, 9: 12.8, 10: 13.16, 11: 13.48 },
  L4: { 1: 14.5, 5: 16.13, 6: 16.3, 7: 16.5, 8: 16.69 },
  L5: { 1: 17.95, 2: 18.15, 3: 18.4, 5: 19.48, 6: 19.82, 7: 20.12, 8: 20.28, 9: 20.52, 10: 20.86 },
  L6: { 1: 21.98, 3: 22.38, 4: 22.6, 5: 22.78, 6: 23.16, 7: 23.3, 8: 23.38, 9: 23.7, 10: 24.0 },
  L7: { 2: 27.1, 3: 27.22, 5: 27.74, 6: 28.02 },
};
