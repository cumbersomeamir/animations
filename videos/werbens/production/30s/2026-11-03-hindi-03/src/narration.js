// Hindi-03 final script (Devanagari; 67 words; sources and claim map in context/18-hindi03-30s-01.md).
// Voice: Kokoro-82M v1.0 Hindi voice packs (bundled with kokoro-js 1.2.1) — chosen by listening tests (ASR) in context/18.
// The accepted English blend (af_bella 0.7 + am_puck 0.3) cannot speak Hindi; per the latest brief it is NOT used here.
export const VOICE_BLEND = [["hf_alpha", 1.0]];
export const SPEED = 1.22; // Hindi packs run slow: 0.98 → 31.7 s of speech; 1.15 → 27.1 s; 1.22 → 25.5 s with equal ASR (context/18) // Hindi packs run slow; 0.98 gave 31.7 s of speech for 30 s (context/18)
// Hindi G2P: eSpeak NG 1.51 (Ubuntu package) `-v hi --ipa --tie=^`, then misaki's EspeakG2P mapping (same path Kokoro's
// Hindi voices were trained with). Spoken-only respellings below (captions keep the written form).
// "-इए" imperatives were heard as "-ए" by the Hindi ASR check (बनाइए → बनाए); the spoken respelling "-इये" gives eSpeak the
// explicit glide [-ɪjeː] of natural speech. Captions always show the standard written form.
export const SPOKEN = { "बनाइए": "बनाइये", "झुकाइए": "झुकाइये", "पूछिए": "पूछिये", "दिखाइए": "दिखाइये", "समझिए": "समझिये", "लीजिए": "लीजिये" };
export const NARRATION = [
  { id: "L1", start: 0.3, text: "‘शानदार’ लिखना आसान है, साबित करना नहीं।" },
  { id: "L2", start: 3.55, text: "‘मज़बूत’, ‘बेहतरीन’ जैसे शब्द कुछ नहीं दिखाते।" },
  { id: "L3", start: 6.95, text: "अब एक काल्पनिक नॉन-स्टिक तवा लीजिए।" },
  { id: "L4", start: 9.8, text: "बिना तेल के डोसा बनाइए, तवा झुकाइए, डोसा खुद फिसल जाता है।" },
  { id: "L5", start: 14.45, text: "आँखों देखी बात अक्सर ज़्यादा याद रहती है।" },
  { id: "L6", start: 17.8, text: "तरीका: हर विशेषण के आगे पूछिए, इसे कैमरे पर कैसे दिखाऊँ? फिर वही दिखाइए।" },
  { id: "L7", start: 23.2, text: "बस, टेस्ट असली होना चाहिए।" },
  { id: "L8", start: 26.0, text: "वर्बेन्स को फ़ॉलो करें, ब्रांड्स कैसे बेचते हैं, समझिए।" },
];
