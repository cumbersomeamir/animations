// QA (DOM): caption text bounds (y 350–470, x ≥ 80 / ≤ 1000, ≤ 2 lines), top 0–300 free of overlays, mascot never under the caption
// pill and inside the frame, sampled every 1/6 s across the whole timeline. Output: qa/dom-bounds.json
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { createRequire } from "node:module"; import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url); const { chromium } = require("playwright");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MOUNTS = { "/assets/": path.resolve(ROOT, "../../../assets"), "/": ROOT };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split("?")[0]); const m = Object.keys(MOUNTS).find((k) => u.startsWith(k)); const f = path.join(MOUNTS[m], u.slice(m.length)); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : f.endsWith(".html") ? "text/html" : f.endsWith(".otf") ? "font/otf" : "application/octet-stream" }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(`http://127.0.0.1:${srv.address().port}/src/scene.html?t=0`); await p.waitForFunction("window.__ready===true");
const res = { caption: { minTop: 1e9, maxBottom: 0, minLeft: 1e9, maxRight: 0, maxLines: 0, pillTop: 1e9, pillBottom: 0 }, mascotUnderCaption: [], mascotInTop300: [], mascotPartlyOffFrame: [], samples: 0 };
for (let f = 0; f < 900; f += 5) {
  const t = f / 30, q = await p.evaluate((t) => window.__bounds(t), t); res.samples++;
  if (q.lines.length) {
    const c = res.caption; c.maxLines = Math.max(c.maxLines, q.lines.length);
    for (const [l, tp, r, bt] of q.lines) { c.minTop = Math.min(c.minTop, tp); c.maxBottom = Math.max(c.maxBottom, bt); c.minLeft = Math.min(c.minLeft, l); c.maxRight = Math.max(c.maxRight, r); }
    c.pillTop = Math.min(c.pillTop, q.pill[1]); c.pillBottom = Math.max(c.pillBottom, q.pill[3]);
    const [ml, mt, mr, mb] = q.mascot, [pl, pt, pr, pb] = q.pill;
    if (ml < pr && mr > pl && mt < pb && mb > pt) res.mascotUnderCaption.push(+t.toFixed(2));
  }
  const [ml, mt, mr, mb] = q.mascot; const vis = mr > 0 && ml < 1080 && mb > 0 && mt < 1920;
  if (vis && mt < 300) res.mascotInTop300.push(+t.toFixed(2));
  if (ml < 0 || mr > 1080 || mb > 1600) res.mascotPartlyOffFrame.push(+t.toFixed(2)); // whip transit / off-camera (expected)
}
for (const k of ["minTop", "maxBottom", "minLeft", "maxRight", "pillTop", "pillBottom"]) res.caption[k] = Math.round(res.caption[k]);
console.log(JSON.stringify(res));
fs.mkdirSync(path.join(ROOT, "qa"), { recursive: true }); fs.writeFileSync(path.join(ROOT, "qa/dom-bounds.json"), JSON.stringify(res, null, 2));
await b.close(); srv.close();
