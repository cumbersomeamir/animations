// English-12 script (sources, claim tags and story structure in context/28-english12-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz; established override = "WER-bens"; general rhotic ɜː → ɜɹ (context/11 list).
// weak "and" after "Coke" was heard as "Cocon": stressed ˈænd.
// "Häagen-Dazs" came out hˈɛədʒəndˈæzz: brand pronunciation "HAH-gen-dahz" (hˈɑːɡən dˈɑːz).
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz", "ɜː": "ɜɹ", "hˈɛədʒəndˈæzz": "hˈɑːɡən dˈɑːz", "kˈoʊk ænd": "kˈoʊk ˈænd" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "Same product. New perception." },
  { id: "L2", start: 2.4, text: "So why does one feel expensive?" },
  { id: "L3", start: 4.45, text: "In 1960, ice cream makers gave a luxury brand a made-up name: Häagen-Dazs." },
  { id: "L4", start: 10.45, text: "Then backed it with a rich recipe." },
  { id: "L5", start: 12.5, text: "But can a name change the taste?" },
  { id: "L6", start: 14.3, text: "Coke and Pepsi are chemically nearly identical." },
  { id: "L7", start: 17.33, text: "Yet in a study, knowing one drink's brand shifted preferences." },
  { id: "L8", start: 21.3, text: "A brand shapes expectations before the first bite." },
  { id: "L9", start: 24.55, text: "Signal a real strength, then deliver it." },
  { id: "L10", start: 27.0, text: "Follow Werbens to decode how brands sell." },
];
// Word-onset corrections (seconds, absolute; keys = Whisper token index) where Whisper's cross-attention times drift: read
// from the voiced segments of the narration envelope (build/narration/manifest.json env, 10 ms frames). Applied by src/words_fix.mjs.
export const WORD_FIX = {
  L1: { 1: 0.7, 2: 1.3, 3: 1.47 },
  L5: { 1: 12.72 },
  L6: { 1: 14.55, 2: 14.85, 3: 15.45, 4: 15.6 },
  L8: { 4: 23.2 },
};
