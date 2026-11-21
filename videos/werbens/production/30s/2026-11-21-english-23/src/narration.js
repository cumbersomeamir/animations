// English-23 script (sources, claim tags and story structure in context/39-english23-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ" };
export const NARRATION = [
  { id: "L1", start: 0.12, text: "Why would anyone post a brand's card for free?" },
  { id: "L2", start: 3.3, text: "Each year, Spotify Wrapped turns your listening into your story." },
  { id: "L3", start: 7.1, text: "Top songs, top artists, minutes played, on a ready-to-share card." },
  { id: "L4", start: 11.2, text: "You're not posting an ad. You're posting you." },
  { id: "L5", start: 14.4, text: "Studies suggest we often share to shape how others see us." },
  { id: "L6", start: 18.3, text: "Each card carries the brand to that person's friends." },
  { id: "L7", start: 21.9, text: "Give customers a story about themselves worth sharing." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L3: { 2: 8.07 },
  L5: { 2: 15.45, 3: 15.76 },
  L7: { 2: 22.9, 3: 22.98 },
};
export const WORD_TEXT_FIX = { L2: { 3: "Wrapped" } }; // Whisper writes "Wrapped turns" as "Wrap turns" (t merges with "turns"); restores the caption word
