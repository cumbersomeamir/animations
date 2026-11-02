# Sources and claim check — Recall feedback-round 01 "QR code with a logo"

All pages were fetched on 2026-11-02, and the quotes below are verbatim from the fetched text. DENSO WAVE (qrcode.com) invented the QR Code, so it is the primary source.

## Pages read
| # | URL | page title | used for |
|---|---|---|---|
| S1 | https://www.qrcode.com/en/about/error_correction.html | Error correction feature \| QRcode.com \| DENSO WAVE | error correction restores data; Reed–Solomon; rate is a ratio of codewords |
| S2 | https://www.qrcode.com/en/about/standards.html | QR Code Standardization \| QRcode.com \| DENSO WAVE | L/M/Q/H: approx. 7/15/25/30 % of codewords can be restored |
| S3 | https://www.qrcode.com/en/history/ | History of QR Code \| QRcode.com \| DENSO WAVE | position-detecting square marks; orientation from any angle out of 360°; 1:1:3:1:1 |
| S4 | https://www.qrcode.com/en/about/ | What is a QR Code? \| QRcode.com \| DENSO WAVE | "Readable from any direction in 360°"; self-correction when smeared or damaged |
| S5 | https://www.qrcode.com/en/faq.html | FAQ \| QRcode.com \| DENSO WAVE | caution on overlaying illustrations; trademark wording |
| — | https://www.iso.org/standard/62021.html | (HTTP 403 for automated fetch) | not used |

## Verbatim quotes
- S1: "QR Code has error correction capability to restore data if the code is dirty or damaged."
- S1: "The QR Code error correction feature is implemented by adding a Reed-Solomon Code* to the original data."
- S1: "Reed-Solomon Code requires twice the amount of codewords to be corrected." / "QR Code therefore represents its error correction rate as a ratio of the total codewords."
- S2: Level H: "Approx. 30% of codewords can be restored." (L 7 %, M 15 %, Q 25 %, all "Approx.")
- S3: "This was how the position detecting pattern made up of square marks came into being." / "By incorporating these marks into their code, high-speed reading became possible." / "…the orientation of their code could be determined regardless of the angle of scanning, which could be any angle out of 360°" / "This ratio was 1:1:3:1:1."
- S4: "Readable from any direction in 360°" / "Even if a QR Code is partly smeared or damaged, it has the capacity to correct itself and restore the original data."
- S5: "Users of QR Code must be careful about deforming the code by overlaying it with an illustration" / "If it is deformed, the QR Code's error correction function is invoked where even a tiny missing or smeared part renders the reading operation impossible, or the response of the operation may become slow."
- S5 (trademark): "The word “QR Code” is registered trademark of DENSO WAVE INCORPORATED in Japan and other countries." / "No trademark comment is necessary in cases where only a QR Code image is used." This sentence goes in the text copy: "QR Code is a registered trademark of DENSO WAVE INCORPORATED."

## Claim → source map (narration)
| narration | support | note |
|---|---|---|
| "It stores extra error-correction information," | S1 (Reed–Solomon code added to the original data) | The code is shown as extra EC tiles, not as copies of the message. |
| "so a scanner can rebuild some missing data." | S1 "restore data if … dirty or damaged"; S4 | The word "some" is deliberate: restoration is limited to approx. 7–30 % of codewords (S2), and the limit is codewords, not area. |
| "Those three large corner squares help it find and orient the code." | S3, S4 | The DENSO pages say "square marks" and do not use the word "three". The count comes from the code itself: our verified matrix has 147 finder modules, which is 3 × 49 (three 7×7 patterns). |
| "Cover too much, especially those markers, and it may fail." | S5; our decode tests | Hedged ("may"). We make no claim about every scanner. |
| "A bigger logo isn't always better." | our decode tests; S2 limit | We use no fixed safe percentage. |
| On-screen "Small logo, clear corners." | our decode tests; S5 caution | A takeaway, not a guarantee. S5 advises consulting DENSO WAVE about design overlays. |

## The QR code in the video (our own verification, reproducible)
`qrdata/make_qr.py` builds the code with segno 1.6.6, writes `qrdata/qr.json` and decodes test renders with zxing-cpp 2.3.0. The code is version 2, level H, alphanumeric "HELLO FROM RECALL". It is one Reed–Solomon block of 16 data codewords + 28 EC codewords, which can correct up to 14 codeword errors.

The module-role map is verified by reading back the mode/length header and recomputing all 28 EC codewords over GF(256) with polynomial 0x11D.

| test | modules covered | codewords touched | zxing-cpp |
|---|---|---|---|
| clean | — | 0 | decodes "HELLO FROM RECALL" |
| small centre logo | 7×7 | 10 | decodes "HELLO FROM RECALL" |
| big centre logo | 15×15 | 25 | no decode |
| top-right finder + separator covered | 8×8 corner | 0 | no decode |

`qa/qa.py` decodes the actual card images drawn in the video (`build/cards/card_small|big|thumb.png`). The phone shows the result sheet only in the "small" state, which decodes. These results come from one decoder on clean renders. They are not a rule for every scanner, and the video does not present them as one.
