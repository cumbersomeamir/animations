// Devanagari fonts for the Hindi episode (Noto Sans Devanagari, OFL-1.1, in ../fonts) + the accepted Inter set for Latin
// fallback (the Meshline wordmark, digits, "·"). Text uses font lists like '52px HBold, EBold'.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalFonts } from '@napi-rs/canvas';
import '../../../../education/pilot-01/src/fonts.mjs';
const F = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fonts');
GlobalFonts.registerFromPath(path.join(F, 'NotoSansDevanagari-Bold.ttf'), 'HBold');
GlobalFonts.registerFromPath(path.join(F, 'NotoSansDevanagari-SemiBold.ttf'), 'HSemi');
GlobalFonts.registerFromPath(path.join(F, 'NotoSansDevanagari-Medium.ttf'), 'HMed');
