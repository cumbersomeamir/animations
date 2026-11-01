// Bundle src/cues.ts with esbuild (a Remotion dependency) and write ../audio/cues.json.
import { build } from "esbuild";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = await build({ entryPoints: [path.join(here, "../src/cues.ts")], bundle: true, write: false, format: "esm", platform: "node" });
const mod = await import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
const json = { fps: mod.FPS, narration: mod.NARRATION, sfx: mod.SFX, music: mod.MUSIC };
const dest = path.join(here, "../../audio/cues.json");
writeFileSync(dest, JSON.stringify(json, null, 1) + "\n");
console.log(`wrote ${dest}: ${json.sfx.length} sfx cues, ${json.narration.length} narration lines`);
