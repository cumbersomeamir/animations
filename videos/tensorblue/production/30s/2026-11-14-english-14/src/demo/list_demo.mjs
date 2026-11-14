// Real list test for Tensorblue english-14, run in the pre-installed Chromium via Playwright.
// A phone-sized page (390×844 CSS px) shows a feed of 10,000 posts in two ways:
//  A. plain list   — one DOM row per post (10,000 rows), like laying everything out up front.
//  B. recycling list — our own minimal virtual list (original code): only enough rows to fill the
//     viewport plus one spare above and one below; when a row leaves the top it is moved to the bottom
//     and given the next post's text (the same idea Android's RecyclerView docs describe).
// We scroll B from the first post to the last and record: rows that exist, rows ever created, how often
// rows were re-filled, and which posts one physical row showed. Timings are recorded but are machine-
// specific (this container), so the video uses only the row counts.
// usage: node list_demo.mjs <out_dir>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const N = 10000, ROW = 72, W = 390, H = 844;
const page_html = `<!doctype html><html><head><meta charset="utf-8"><style>
 body{margin:0;font:16px sans-serif} #v{height:${H}px;overflow-y:scroll;position:relative}
 .row{height:${ROW}px;box-sizing:border-box;border-bottom:1px solid #ddd;padding:12px}
 #inner{position:relative} #inner .row{position:absolute;left:0;right:0}
</style></head><body><div id="v"></div></body></html>`;

const browser = await chromium.launch({ channel: 'chromium' });
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const page = await ctx.newPage();
await page.setContent(page_html);

// A. plain list
const plain = await page.evaluate(({ N }) => {
  const v = document.getElementById('v'); v.innerHTML = '';
  const t0 = performance.now();
  const frag = document.createDocumentFragment();
  for (let i = 1; i <= N; i++) { const d = document.createElement('div'); d.className = 'row'; d.textContent = 'Post ' + i; frag.appendChild(d); }
  v.appendChild(frag); v.getBoundingClientRect(); void v.scrollHeight;          // force layout
  const ms = performance.now() - t0;
  const rows = v.querySelectorAll('.row').length;
  return { rows, build_and_layout_ms: +ms.toFixed(1) };
}, { N });

// B. recycling list
const recycled = await page.evaluate(async ({ N, ROW, H }) => {
  const v = document.getElementById('v'); v.innerHTML = '';
  const inner = document.createElement('div'); inner.id = 'inner'; inner.style.height = N * ROW + 'px'; v.appendChild(inner);
  const POOL = Math.ceil(H / ROW) + 2;                                            // on screen + a spare each side
  let created = 0, refills = 0; const pool = [];
  for (let k = 0; k < POOL; k++) { const d = document.createElement('div'); d.className = 'row'; d.dataset.node = String(k); inner.appendChild(d); pool.push({ el: d, post: -1, history: [] }); created++; }
  function render() {
    const first = Math.max(0, Math.floor(v.scrollTop / ROW) - 1);
    for (let i = first; i < Math.min(N, first + POOL); i++) {
      const slot = pool[i % POOL];                                                 // same physical row, next post
      if (slot.post !== i) { slot.post = i; slot.el.textContent = 'Post ' + (i + 1); slot.el.style.top = i * ROW + 'px'; refills++; if (slot.history.length < 4) slot.history.push(i + 1); }
    }
  }
  render();
  let maxRows = 0, lastVisible = 0; const t0 = performance.now();
  for (let y = 0; y <= N * ROW - H; y += ROW / 2) {
    v.scrollTop = y; render();
    maxRows = Math.max(maxRows, inner.querySelectorAll('.row').length);
  }
  v.scrollTop = N * ROW; render();
  const vis = [...inner.querySelectorAll('.row')].map((r) => +r.textContent.replace('Post ', ''));
  lastVisible = Math.max(...vis);
  const ms = performance.now() - t0;
  return { pool_size: POOL, rows_in_dom_max: maxRows, rows_created: created, refills, last_post_shown: lastVisible,
    row_node_0_showed_first_posts: pool[0].history, scroll_whole_feed_ms: +ms.toFixed(1) };
}, { N, ROW, H });

const version = browser.version();
await browser.close();
const data = { browser: 'Chromium ' + version + ' (pre-installed, Playwright)', viewport: `${W}x${H}`, row_height_px: ROW, posts: N, plain, recycled,
  note: 'timings are from this container only and are not used in the video' };
fs.writeFileSync(path.join(out, 'list-demo.json'), JSON.stringify(data, null, 1));
console.log(JSON.stringify(data, null, 1));
