// Entry: ?mode=film (default) renders the pilot frame-by-frame; ?mode=sheet renders the character model sheet.
const mode = new URLSearchParams(location.search).get('mode') || 'film';
await document.fonts.load('700 64px "Space Grotesk"');
await document.fonts.load('500 32px "Space Grotesk"');
await document.fonts.load('500 30px "Inter"');
await document.fonts.load('600 30px "Inter"');
await document.fonts.load('700 30px "Inter"');
if (mode === 'sheet') await import('./sheet.js'); else await import('./film.js');
