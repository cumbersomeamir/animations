# Legal sources: "Can a hotel keep your original Aadhaar as a deposit?" (India)

Research date: 2026-11-08 (batch 2026-11-08-english-09). Language of the video: English.

## Topic choice
- Suggested subject, used as given. Episode history (01–08) has no Aadhaar, ID or privacy episode.
- Scope: a hotel check-in where the desk asks to keep the guest's original Aadhaar card until checkout. The scene is
  fictional (Room 204, ₹2,800). The card on screen is a generic illustration labelled "AADHAAR". It has no official
  emblem or layout and no real number: the original shows dots, and the masked copy shows "XXXX XXXX 4821".
- What the video does **not** claim, as the brief required:
  - no criminal offence
  - no "illegal everywhere" rule
  - no statement that a hotel may not ask for ID at all; hotels routinely record guest identity, and showing ID is
    called normal
- Status key: **VERIFIED-PRIMARY** = UIDAI's own regulation or page; **VERIFIED-OFFICIAL** = official PIB release.

## 1. Aadhaar (Authentication and Offline Verification) Regulations, 2021 [VERIFIED-PRIMARY]
- Made by UIDAI under s.54 of the Aadhaar Act, 2016 (as amended by the Aadhaar and Other Laws (Amendment) Act, 2019).
  The clean copy is "[Updated as on 15.12.2025]" and includes the 2025 amendment (notified 9.12.2025).
- Source: https://uidai.gov.in/images/The_Aadhaar_Authentication_and_Offline_Verifications_Regulations_2021-_Clean_copy-30122025.pdf
  (sha256 `1904da2556b2d4ae8e7d543d5cd38451fe5d4c7e62aac278705c925a1e93ccbc`). Downloaded from the old.uidai.gov.in
  mirror of the same file; the main host returned 503 at the time.
- **Reg 2(1)(mb):** "'Offline Verification Seeking Entity' or 'OVSE' means any entity desirous of undertaking offline
  verification of an Aadhaar number holder". So a hotel that checks your Aadhaar is an OVSE.
- **Reg 5(3):** "A requesting entity or OVSE shall ensure that the no service is denied to any resident for refusing
  to or being unable to undergo authentication or offline verification provided that the resident is able to
  identify himself through a viable alternative means as suggested by the requesting entity…"
- **Reg 6(1):** the OVSE "shall obtain the consent of the Aadhaar number holder" for the verification.
- **Reg 14A(1)(b), obligations of OVSEs:** an OVSE "shall not collect, use or store Aadhaar number or biometric
  information of any individual for any purpose or share offline Aadhaar data with any other entity except in
  accordance with the Act and Regulations framed thereunder".
- **Reg 16B(1):** an Aadhaar holder may voluntarily use the Aadhaar letter (or a copy), printed e-Aadhaar or PVC
  card "for establishing his identity by way of offline verification and the OVSE shall verify the printed details …
  with digitally signed Aadhaar Secure QR code".
- **Reg 16C(1):** "No Offline Verification Seeking Entity shall accept Aadhaar number, in physical or electronic form
  (without authentication), as a proof of identity for a lawful purpose, without first verifying the digital
  signature of the Authority as provided in the Aadhaar secure QR Code…"
- **Reg 20A(1)(d):** an OVSE may keep verification logs with consent, "but shall not, in any event, store the
  Aadhaar number or Virtual ID of the Aadhaar number holder".
- **Reg 2(1)(mc)** (offline Aadhaar data includes "the requirement of masking Aadhaar numbers before storing") and
  **Reg 14(1)(mb)** (for requesting entities, "Aadhaar numbers collected through physical forms or photocopies …
  shall be masked … by redacting the first 8 digits … before storing the physical copies").

Narration uses:
- "Aadhaar's own rules let a hotel verify it, by scanning its QR code with your consent" (Regs 6, 16B, 16C)
- "It shouldn't collect or store your Aadhaar number" (Regs 14A(1)(b), 20A)
- "any copy it keeps must be masked" (Reg 2(1)(mc), and the 2023 guideline below)
- "offer another ID they accept" (Reg 5(3))
- "leaving the original isn't part of the process": the verification described is a QR scan with consent, and
  nothing in it involves keeping the card. This is stated as a description, not as an offence.

## 2. UIDAI guideline to OVSEs (PIB, 10 Jan 2023) [VERIFIED-OFFICIAL]
- "UIDAI urges verification entities to adhere to Aadhaar usage hygiene":
  https://www.pib.gov.in/PressReleasePage.aspx?PRID=1889996
- "Verification entities, generally should not collect, use or store Aadhaar number of the resident after having
  conducted offline verification of Aadhaar … Post verification, if the OVSE finds it necessary for any reason, to
  store a copy of Aadhaar, the OVSE must ensure that Aadhaar number is redacted/masked and irretrievable."
- It also says to verify via the QR code "instead of accepting Aadhaar in physical or electronic form, as a proof of
  identity", and to give "viable alternative means of identification".

## 3. UIDAI OVSE page (last updated 2 Nov 2026) [VERIFIED-PRIMARY]
- https://uidai.gov.in/en/ovse lists "Hospitality and Tourism" as the first use case for offline verification. FAQ: a
  registered OVSE "may collect and store verifiable credentials shared with the explicit consent of the Aadhaar Number
  Holder".

## 4. Masked Aadhaar [VERIFIED-PRIMARY, partial]
- UIDAI FAQ "What is Masked Aadhaar?": "Masked Aadhaar implies replacing of first 8 digits of Aadhaar number with
  'xxxx-xxxx' while only last 4 digits of the Aadhaar Number are visible."
  https://uidai.gov.in/en/283-english-uk/faqs/aadhaar-online-services/e-aadhaar/1887-what-is-masked-aadhaar.html
  The page returned 503 from this environment, so the text was read from the search index. Reg 14(1)(mb) above
  independently confirms first-8-digit redaction.

## 5. Deliberately not used
- PIB, 27 May 2022 (PRID 1828797, "UIDAI cautions of sharing photocopy of Aadhar"). It says hotels may not keep
  copies and that this is an offence. MeitY withdrew the underlying UIDAI Bengaluru release on 29 May 2022 "in view of
  the possibility of the misinterpretation" (PIB PRID 1829162). The video therefore makes no offence claim.
- News of a planned 2025/26 UIDAI rule requiring hotels to register and stop photocopies: covered only by news reports
  (e.g. MediaNama, Dec 2025). No notification text was found, so it is not narrated.
- Aadhaar Act s.8A text: the UIDAI copy of the amended Act was unreachable (connection reset / 503). The narration
  relies on the regulations above instead.
