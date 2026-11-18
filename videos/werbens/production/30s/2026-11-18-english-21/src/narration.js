// English-21 script (sources, claim tags and story structure in context/37-english21-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ" };
export const NARRATION = [
  { id: "L1", start: 0.12, text: "Why can free pull people away from the better treat?" },
  { id: "L2", start: 3.5, text: "Two scoops, one coin apart. Now cut both by one coin." },
  { id: "L3", start: 7.5, text: "The gap stays the same, but one is now free." },
  { id: "L4", start: 10.45, text: "In experiments, far more chose the free one, and far fewer the better one." },
  { id: "L5", start: 15.0, text: "Free didn't just cost less; it seemed to add value." },
  { id: "L6", start: 18.3, text: "The effect was strongest for treats, weaker for practical items." },
  { id: "L7", start: 22.4, text: "So save free for things people enjoy, where it pulls hardest." },
  { id: "L8", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L4: { 8: 13.17, 9: 13.41, 10: 13.76 },
  L6: { 4: 19.53, 5: 19.64, 7: 20.7 },
};
export const WORD_TEXT_FIX = {};
