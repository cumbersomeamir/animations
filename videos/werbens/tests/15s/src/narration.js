// Timed narration for the 15 s test (seconds). Claims limited to the saved Play listing.
export const VOICE = "af_heart";
// Kokoro G2P renders the brand non-rhotic ("wˈɜːbənz", ASR heard "Warbins"); override reads "WER-bens".
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz" };
export const NARRATION = [
  { id: "T1", start: 0.25, text: "Discover creators." },
  { id: "T2", start: 3.05, text: "Manage campaigns, briefs and conversations." },
  { id: "T3", start: 7.0, text: "All in one app." },
  { id: "T4", start: 11.85, text: "Werbens. Explore on Google Play." },
];
