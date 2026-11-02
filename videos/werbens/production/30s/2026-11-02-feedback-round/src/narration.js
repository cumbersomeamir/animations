// Final script (user draft; two "can"s added so no behaviour is presented as guaranteed — see context/14-feedback-30s-01.md).
// Voice: established Meshline/Recall Kokoro config — style blend af_bella 0.7 + am_puck 0.3, speed 0.98, en-us.
export const VOICE_BLEND = [["af_bella", 0.7], ["am_puck", 0.3]];
export const SPEED = 0.98;
export const LANG_VOICE = "af_bella";
// Kokoro renders "Werbens" as wˈɜːbənz (heard "Warbins" in this app's earlier tests); established override = "WER-bens"
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "Why would a menu include a bad deal?" },
  { id: "L2", start: 3.1, text: "A medium drink sits just below the large in size, but almost at the same price." },
  { id: "L3", start: 9.3, text: "Now the large can feel like the obvious upgrade." },
  { id: "L4", start: 13.2, text: "That's a decoy: an option that can make another look better by comparison." },
  { id: "L5", start: 20.6, text: "Before paying extra, ask how much you actually want." },
  { id: "L6", start: 26.5, text: "Follow Werbens to decode how brands sell." },
];
