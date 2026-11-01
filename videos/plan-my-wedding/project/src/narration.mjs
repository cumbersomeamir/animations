// Timed narration script. Single source of truth for TTS, captions and the mix.
// start/slotEnd are seconds on the 30 s timeline. Text only uses claims present in
// ../assets/listing.json (public Play listing retrieved 2026-11-01).
export const VOICE = 'af_heart';
export const SPEED = 1.0;

export const LINES = [
  { id: 'l1', start: 0.30, slotEnd: 2.55, text: 'One wedding. A thousand details.' },
  { id: 'l2', start: 3.00, slotEnd: 8.70, text: 'Add a few guests, and the venue, the caterer, and the budget all shift.' },
  { id: 'l3', start: 9.35, slotEnd: 12.45, text: 'Plan My Wedding gives your plans one home.' },
  { id: 'l4', start: 12.85, slotEnd: 15.85, text: 'Browse vendors, save favourites, request quotes.' },
  { id: 'l5', start: 16.20, slotEnd: 19.25, text: 'Tick off your checklist. Keep an eye on the budget.' },
  { id: 'l6', start: 19.55, slotEnd: 22.75, text: 'Send invitations and follow every RSVP.', speed: 1.04 },
  { id: 'l7', start: 23.10, slotEnd: 26.90, text: 'So you can get back to the celebration.' },
  { id: 'l8', start: 27.30, slotEnd: 29.90, text: 'Plan My Wedding. Explore on Google Play.' },
];
