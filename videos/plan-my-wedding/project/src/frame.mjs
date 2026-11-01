// Composes one frame at time t (seconds).
import { C, W, H } from './lib/paper.mjs';
import { drawDesk } from './scenes/desk.mjs';
import { drawCaptions } from './captions.mjs';

let phoneMod = null, celebMod = null;
export async function loadScenes() {
  try { phoneMod = await import('./scenes/phone.mjs'); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }
  try { celebMod = await import('./scenes/celebrate.mjs'); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }
}

export function drawFrame(ctx, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  if (t < 12.5) drawDesk(ctx, t);
  else if (t < 22.3 || !celebMod) phoneMod && phoneMod.drawPhone(ctx, t);
  else celebMod.drawCelebrate(ctx, t, phoneMod);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawCaptions(ctx, t);
}
