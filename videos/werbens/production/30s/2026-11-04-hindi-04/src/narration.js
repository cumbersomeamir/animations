// Hindi-04 final script (Devanagari; 69 words; sources and claim map in context/19-hindi04-30s-01.md).
// Voice: Kokoro-82M v1.0 Hindi voice packs (bundled with kokoro-js 1.2.1) — chosen by listening tests (ASR) in context/18.
// The accepted English blend (af_bella 0.7 + am_puck 0.3) cannot speak Hindi; per the latest brief it is NOT used here.
export const VOICE_BLEND = [["hf_alpha", 1.0]];
export const SPEED = 1.22; // Hindi packs run slow: 0.98 → 31.7 s of speech; 1.15 → 27.1 s; 1.22 → 25.5 s with equal ASR (context/18) // Hindi packs run slow; 0.98 gave 31.7 s of speech for 30 s (context/18)
// Hindi G2P: eSpeak NG 1.51 (Ubuntu package) `-v hi --ipa --tie=^`, then misaki's EspeakG2P mapping (same path Kokoro's
// Hindi voices were trained with). Spoken-only respellings below (captions keep the written form).
// "-इए" imperatives were heard as "-ए" by the Hindi ASR check (बनाइए → बनाए); the spoken respelling "-इये" gives eSpeak the
// explicit glide [-ɪjeː] of natural speech. Captions always show the standard written form.
export const SPOKEN = { "लीजिए": "लीजिये", "दिखाइए": "दिखाइये", "चलाइए": "चलाइये", "समझिए": "समझिये", "लिंट": "लिन्ट" }; // लिंट→लिन्ट keeps the [n] (eSpeak: lĩʈ → lɪnʈ)
export const NARRATION = [
  { id: "L1", start: 0.3, text: "‘प्रीमियम क्वालिटी’ लिखने से स्वेटर साफ़ नहीं होता।" },
  { id: "L2", start: 3.85, text: "एक काल्पनिक लिंट रोलर लीजिए। पहले रोओं से भरा काला स्वेटर दिखाइए।" },
  { id: "L3", start: 8.8, text: "फिर उसी फ़्रेम, उसी रोशनी में एक बार रोलर चलाइए।" },
  { id: "L4", start: 13.0, text: "पहले और बाद का फ़र्क़ ख़ुद बोलता है।" },
  { id: "L5", start: 16.2, text: "और रोलर की शीट पर चिपके रोएँ, यही सबूत है।" },
  { id: "L6", start: 20.0, text: "छोटे बिज़नेस के लिए नियम: वही एंगल, वही रोशनी, कोई फ़िल्टर नहीं।" },
  { id: "L7", start: 26.0, text: "वर्बेन्स को फ़ॉलो करें, ब्रांड्स कैसे बेचते हैं, समझिए।" },
];
