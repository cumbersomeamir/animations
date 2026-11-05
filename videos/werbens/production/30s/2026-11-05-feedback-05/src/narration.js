// Feedback-05 final script (Devanagari; 67 words; sources and claim map in context/20-feedback05-30s-01.md).
// Voice: Kokoro-82M v1.0 Hindi voice packs (bundled with kokoro-js 1.2.1) — chosen by listening tests (ASR) in context/18.
// The accepted English blend (af_bella 0.7 + am_puck 0.3) cannot speak Hindi; per the latest brief it is NOT used here.
export const VOICE_BLEND = [["hf_alpha", 1.0]];
export const SPEED = 1.22; // Hindi packs run slow: 0.98 → 31.7 s of speech; 1.15 → 27.1 s; 1.22 → 25.5 s with equal ASR (context/18) // Hindi packs run slow; 0.98 gave 31.7 s of speech for 30 s (context/18)
// Hindi G2P: eSpeak NG 1.51 (Ubuntu package) `-v hi --ipa --tie=^`, then misaki's EspeakG2P mapping (same path Kokoro's
// Hindi voices were trained with). Spoken-only respellings below (captions keep the written form).
// "-इए" imperatives were heard as "-ए" by the Hindi ASR check (बनाइए → बनाए); the spoken respelling "-इये" gives eSpeak the
// explicit glide [-ɪjeː] of natural speech. Captions always show the standard written form.
export const SPOKEN = { "रेस्टोरेंट": "रेस्टोरेन्ट", "आई-ट्रैकिंग": "आई ट्रैकिन्ग", "रखिए": "रखिये" }; // eSpeak nasalises "-ेंट/-िंग" and drops the [n]; "-इए" → "-इये" glide (context/18)
export const NARRATION = [
  { id: "L1", start: 0.3, text: "‘शाही’, ‘लाजवाब’, ‘प्रीमियम’... पर बिक क्या रहा है?" },
  { id: "L2", start: 3.4, text: "एक काल्पनिक रेस्टोरेंट का विज्ञापन: शब्द बहुत, जानकारी कम।" },
  { id: "L3", start: 7.9, text: "अब तीन चीज़ें रखिए। पहली, डिश की असली फ़ोटो।" },
  { id: "L4", start: 11.35, text: "दूसरी, साफ़ कीमत, दो सौ पचास रुपये।" },
  { id: "L5", start: 14.4, text: "तीसरी, एक ही काम, ‘अभी ऑर्डर करें’।" },
  { id: "L6", start: 17.2, text: "एक आई-ट्रैकिंग शोध में, ठसाठस भरे विज्ञापनों में ब्रांड पर ध्यान कम गया।" },
  { id: "L7", start: 22.4, text: "नियम याद रखिए: एक प्रोडक्ट, एक कीमत, एक काम।" },
  { id: "L8", start: 26.1, text: "ऐसे ही सबक के लिए वर्बेन्स को फ़ॉलो करें।" },
];
// Phrase spans (s, RELATIVE to the line start) pinned from the measured voiced chunks where Kokoro skips a comma pause or a
// stop closure fakes one (envelope listing in context/20 §4); other lines use the automatic snapping in src/words_hi.mjs.
export const PHRASE_SEGMENTS = {
  L1: [[0.04, 0.42], [0.43, 1.01], [1.24, 2.02], [2.17, 2.63]],
  L4: [[0.03, 0.48], [0.48, 1.16], [1.37, 2.58]],
  L6: [[0.03, 1.48], [1.78, 4.71]],
  L7: [[0.03, 1.07], [1.26, 1.81], [1.91, 2.55], [2.7, 3.18]],
};
