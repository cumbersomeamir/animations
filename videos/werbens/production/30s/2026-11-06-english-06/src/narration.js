// English-06 final script (sources and claim map in context/21-english06-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens" (context/11 pronunciation list). "first" gets the
// rhotic US vowel (Kokoro G2P gave the non-rhotic fˈɜːst for en-us).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "fˈɜːst": "fˈɜɹst" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "75% lean, or 25% fat?" },
  { id: "L2", start: 4.0, text: "Same tray. Same numbers. Only the frame changed." },
  { id: "L3", start: 7.65, text: "In a 1988 study, people rated the same meat more favorably when it was labeled lean." },
  { id: "L4", start: 13.85, text: "After tasting it, that gap shrank." },
  { id: "L5", start: 16.1, text: "So lead with the positive side, not the negative one." },
  { id: "L6", start: 19.75, text: "Keep every number true." },
  { id: "L7", start: 21.5, text: "The frame shapes first impressions; the product shapes the rest." },
  { id: "L8", start: 26.1, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 1: 0.98, 2: 1.36, 3: 2.01, 4: 2.21, 5: 2.74, 6: 3.14 },
  L2: { 2: 4.91, 3: 5.2, 5: 6.1, 6: 6.27, 7: 6.6 },
  L3: { 3: 8.88, 5: 9.98, 6: 10.34, 7: 10.48, 8: 10.74, 9: 11.07, 10: 11.41, 11: 12.25, 12: 12.42, 13: 12.55, 14: 12.78, 15: 13.07 },
  L4: { 1: 14.16, 2: 14.52, 3: 14.77, 4: 14.95, 5: 15.16 },
  L5: { 1: 16.38, 3: 16.92, 4: 17.0, 5: 17.52, 8: 18.47, 9: 19.0 },
  L6: { 1: 20.02 },
  L7: { 1: 21.67, 4: 22.77, 5: 23.6, 6: 23.7, 7: 24.04, 8: 24.42, 9: 24.56 },
  L8: { 2: 27.1, 3: 27.22, 5: 27.74, 6: 28.02 },
};
