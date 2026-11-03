// QA (live DOM, sampled across the whole timeline): caption ink inside y 340–520 and x 90–990, ≤ 2 lines;
// y 0–300 free of text/labels; labels (tags, notes, chip, wordmark) inside x 80–1000 and y 300–1560 (clear of side/bottom
// platform UI), never under the caption pill, and not overlapping each other. Output: qa/dom-bounds.json
// Usage: node src/qa_dom.mjs [STEP]   (STEP in frames; 1 = every frame)
import http from "node:http"; import fs from "node:fs"; import path from "node:path";
import { createRequire } from "node:module"; import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url); const { chromium } = require("playwright");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MOUNTS = { "/assets/": path.resolve(ROOT, "../../../assets"), "/": ROOT };
const TYPES = { ".js": "text/javascript", ".html": "text/html", ".otf": "font/otf", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2" };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split("?")[0]); const m = Object.keys(MOUNTS).find((k) => u.startsWith(k)); const f = path.join(MOUNTS[m], u.slice(m.length)); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(`http://127.0.0.1:${srv.address().port}/src/scene.html?t=0`); await p.waitForFunction("window.__ready===true", null, { timeout: 180000 });
const res = { caption: { minTop: 1e9, maxBottom: 0, minLeft: 1e9, maxRight: 0, maxLines: 0, pillTop: 1e9, pillBottom: 0 },
  labels: { minLeft: 1e9, maxRight: 0, minTop: 1e9, maxBottom: 0 }, labelInTop300: [], labelOutsideSafe: [], labelUnderCaption: [], labelOverlaps: [], samples: 0 };
const STEP = +(process.argv[2] || 5);
const hit = (a, c) => a[0] < c[2] && a[2] > c[0] && a[1] < c[3] && a[3] > c[1];
for (let f = 0; f < 900; f += STEP) {
  const t = +(f / 30).toFixed(3), q = await p.evaluate((t) => window.__bounds(t), t); res.samples++;
  if (q.lines.length) {
    const c = res.caption; c.maxLines = Math.max(c.maxLines, q.lines.length);
    for (const [l, tp, r, bt] of q.lines) { c.minTop = Math.min(c.minTop, tp); c.maxBottom = Math.max(c.maxBottom, bt); c.minLeft = Math.min(c.minLeft, l); c.maxRight = Math.max(c.maxRight, r); }
    c.pillTop = Math.min(c.pillTop, q.pill[1]); c.pillBottom = Math.max(c.pillBottom, q.pill[3]);
  }
  for (const [id, l, tp, r, bt] of q.hud) {
    const L = res.labels; L.minLeft = Math.min(L.minLeft, l); L.maxRight = Math.max(L.maxRight, r); L.minTop = Math.min(L.minTop, tp); L.maxBottom = Math.max(L.maxBottom, bt);
    if (tp < 300) res.labelInTop300.push([t, id]);
    if (l < 80 || r > 1000 || bt > 1560) res.labelOutsideSafe.push([t, id, l, tp, r, bt]);
    if (q.pill && hit([l, tp, r, bt], q.pill)) res.labelUnderCaption.push([t, id]);
  }
  for (let i = 0; i < q.hud.length; i++) for (let j = i + 1; j < q.hud.length; j++) if (hit(q.hud[i].slice(1), q.hud[j].slice(1))) res.labelOverlaps.push([t, q.hud[i][0], q.hud[j][0]]);
}
for (const k of ["minTop", "maxBottom", "minLeft", "maxRight", "pillTop", "pillBottom"]) res.caption[k] = Math.round(res.caption[k]);
console.log(JSON.stringify({ ...res, labelOutsideSafe: res.labelOutsideSafe.slice(0, 12), labelOverlaps: res.labelOverlaps.slice(0, 20), nOutside: res.labelOutsideSafe.length, nOverlaps: res.labelOverlaps.length }));
fs.mkdirSync(path.join(ROOT, "qa"), { recursive: true }); fs.writeFileSync(path.join(ROOT, "qa/dom-bounds.json"), JSON.stringify(res, null, 2));
await b.close(); srv.close();
