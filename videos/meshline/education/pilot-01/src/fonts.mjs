import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GlobalFonts } from '@napi-rs/canvas';
const FONTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../project/fonts');
GlobalFonts.registerFromPath(path.join(FONTS, 'InterDisplay-ExtraBold.otf'), 'EDisplay');
GlobalFonts.registerFromPath(path.join(FONTS, 'InterDisplay-Bold.otf'), 'EBold');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-SemiBold.otf'), 'ESemi');
GlobalFonts.registerFromPath(path.join(FONTS, 'Inter-Medium.otf'), 'EMed');
