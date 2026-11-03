// Round-02 final script (75 words; sources and claim map in context/16-round02-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens" (context/11 pronunciation list)
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "Why do brands repeat one shape everywhere?" },
  { id: "L2", start: 3.0, text: "Take a fictional bakery: one arch on its logo, bag and sign." },
  { id: "L3", start: 7.4, text: "Cover the name, and the arch can still point to the bakery." },
  { id: "L4", start: 11.3, text: "Researchers call it a distinctive brand asset, once buyers learn the link." },
  { id: "L5", start: 16.0, text: "Swap shapes on every item, and there's no link to learn." },
  { id: "L6", start: 19.8, text: "Pick one asset, use it consistently, and test whether people link it to you." },
  { id: "L7", start: 26.3, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute) where Whisper's cross-attention times drift: measured from the voiced
// segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L2: { 5: 4.72, 6: 5.05, 7: 5.2, 8: 5.37, 9: 5.96, 10: 6.27, 11: 6.48 },
  L3: { 3: 8.5, 4: 8.64, 5: 8.73, 6: 8.98, 7: 9.12, 8: 9.57, 9: 9.8, 10: 9.86, 11: 9.93 },
};
