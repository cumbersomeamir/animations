// Timed narration script (seconds). Text claims are limited to the saved Play listing:
// "Discover creators and manage brand campaigns, briefs and conversations."
export const VOICE = "af_heart";
// Kokoro's default G2P gives non-rhotic "wˈɜːbənz" (ASR heard "Warbins"); rhotic + full vowel reads as "WER-bens".
export const PHONEME_OVERRIDES = { "wˈɜːbənz": "wˈɜɹbɛnz" };

export const NARRATION = [
  { id: "L1", start: 0.30, text: "You've got the perfect brief." },
  { id: "L2", start: 3.05, text: "But your creators are scattered... and the chats? A total tangle." },
  { id: "L3", start: 7.55, text: "Meet... Werbens!" },
  { id: "L4", start: 10.15, text: "Discover creators for your brand." },
  { id: "L5", start: 15.10, text: "Bring your brief and creators together." },
  { id: "L6", start: 19.15, text: "Manage conversations, without the tangle." },
  { id: "L7", start: 23.05, text: "Campaigns, briefs and conversations. All in one app." },
  { id: "L8", start: 26.95, text: "Werbens. Explore on Google Play." },
];

// On-screen captions (shorter, mobile-legible). `hi` = words that get the violet marker.
export const CAPTIONS = [
  { id: "L1", lines: ["You've got the", "perfect brief."], hi: ["brief."] },
  { id: "L2a", from: "L2", lines: ["Creators?", "Scattered."], hi: ["Scattered."], part: [0, 0.48] },
  { id: "L2b", from: "L2", lines: ["Chats?", "A total tangle."], hi: ["tangle."], part: [0.48, 1.0] },
  { id: "L3", lines: ["Meet Werbens."], hi: ["Werbens."] },
  { id: "L4", lines: ["Discover creators", "for your brand."], hi: ["creators"] },
  { id: "L5", lines: ["Bring your brief", "and creators together."], hi: ["together."] },
  { id: "L6", lines: ["Manage conversations,", "without the tangle."], hi: ["conversations,"] },
  { id: "L7", lines: ["Campaigns, briefs &", "conversations. One app."], hi: ["One", "app."] },
];
