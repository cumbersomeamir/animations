// Offline deterministic capture of the Three.js scene in headless Chromium (system Playwright, SwiftShader WebGL2).
// Usage:
//   node src/render.mjs --stills 0,1.2,2.5 [--scale 0.5]      -> build/stills/t_<t>.png
//   node src/render.mjs --video [--from 0 --to 450]            -> build/video.mp4 (no audio), 1080x1920 @30
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { FPS, FRAMES } from "./timeline.js";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright"); // pre-installed system Playwright (do not reinstall)

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MOUNTS = { "/assets/": path.resolve(ROOT, "../../../assets"), "/": ROOT };
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".otf": "font/otf", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };

function serve() {
  const srv = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const mount = Object.keys(MOUNTS).find((m) => url.startsWith(m));
    const file = path.join(MOUNTS[mount], url.slice(mount.length));
    if (!file.startsWith(MOUNTS[mount]) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => srv.listen(0, "127.0.0.1", () => r(srv)));
}

const srv = await serve();
const port = srv.address().port;
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--disable-gpu-vsync", "--font-render-hinting=none"] });
const scale = +opt("--scale", 1);
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: scale });
const errors = [];
page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errors.push(`[${m.type()}] ${m.text()}`); });
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => errors.push(`[requestfailed] ${r.url()}`));
page.on("response", (r) => { if (r.status() >= 400) errors.push(`[http ${r.status()}] ${r.url()}`); });
const first = args.includes("--thumb") ? "?thumb=1&t=0" : "?t=0"; // --thumb: separate vertical thumbnail mode (context/27)
await page.goto(`http://127.0.0.1:${port}/src/scene.html${first}`);
await page.waitForFunction("window.__ready === true", null, { timeout: 180000 }).catch((e) => { console.error("scene failed to init", errors); throw e; });
console.log("scene ready", JSON.stringify(await page.evaluate(() => window.__info())));

async function shoot(fn, arg) {
  await page.evaluate(([f, a]) => window[f](a), [fn, arg]);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
  return page.screenshot({ type: "png", animations: "disabled", caret: "hide" });
}

if (args.includes("--stills")) {
  const ts = opt("--stills", "0").split(",").map(Number);
  const out = path.join(ROOT, opt("--out", "build/stills"));
  fs.mkdirSync(out, { recursive: true });
  for (const t of ts) {
    const t0 = Date.now();
    fs.writeFileSync(path.join(out, `t_${t.toFixed(2)}.png`), await shoot("__frame", t));
    console.log(`still t=${t.toFixed(2)} ${Date.now() - t0}ms`);
  }
} else if (args.includes("--video")) {
  const from = +opt("--from", 0), to = +opt("--to", FRAMES);
  const outFile = path.join(ROOT, opt("--out", "build/video.mp4"));
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
    "-vf", "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p",
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-profile:v", "high", "-tune", "animation",
    "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
    "-r", String(FPS), "-movflags", "+faststart", outFile], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let f = from; f < to; f++) {
    const buf = await shoot("__frame", f / FPS);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 30 === 0) console.log(`frame ${f}/${to}  ${((Date.now() - t0) / (f - from + 1)).toFixed(0)} ms/frame`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error("ffmpeg exit " + c)))));
  console.log(`video written ${outFile} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
console.log("info after", JSON.stringify(await page.evaluate(() => window.__info())));
await page.evaluate(() => window.__dispose());
if (errors.length) console.log("PAGE ERRORS/WARNINGS:\n" + errors.join("\n"));
fs.mkdirSync(path.join(ROOT, "build"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "build/page-log.txt"), errors.join("\n") || "no console errors or warnings");
await browser.close();
srv.close();
