// Real browser demo for Tensorblue english-10: a private window is not invisibility.
//
// Everything runs on 127.0.0.1 with the fictional name shop.example (RFC 2606 reserves .example):
//  - "the website": a tiny HTTP server that logs every request and sets one cookie per page
//    (seen_shoes for /shoes, seen_gift for /gift);
//  - "your network": a logging HTTP proxy in front of it (stands in for a school/employer/ISP network);
//  - one real Chromium (Playwright, full Chromium build, new headless) with a persistent profile:
//      normal window  -> http://shop.example/shoes
//      private window -> http://shop.example/gift   (an off-the-record context created over CDP with
//                         Target.createBrowserContext: "Similar to an incognito profile")
//  - after both windows close, the profile's own History and Cookies SQLite files are read.
// usage: node private_demo.mjs <out_dir>
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const SITE = 8711, PROXY = 8899, CDP = 9555;
const t0 = Date.now(), at = () => +((Date.now() - t0) / 1000).toFixed(2);
const siteLog = [], netLog = [], refused = [];

const site = http.createServer((q, r) => {
  const page = q.url.split('?')[0];
  if (page === '/favicon.ico') { r.statusCode = 404; return r.end(); }
  siteLog.push({ t: at(), request: `GET ${page}`, cookies_sent: q.headers.cookie || '' });
  r.setHeader('Set-Cookie', `seen_${page.replace(/\W/g, '') || 'home'}=1; Max-Age=86400; Path=/`);
  r.setHeader('Content-Type', 'text/html'); r.end(`<title>shop.example${page}</title><h1>shop.example${page}</h1>`);
}).listen(SITE, '127.0.0.1');

// plain forward proxy: logs the host (and path, since this demo uses http) of every request it relays
const proxy = http.createServer((q, r) => {
  const u = new URL(q.url);
  // only the demo site is relayed; Chromium's own background requests (e.g. its network-time check) are refused
  if (u.host !== 'shop.example') { refused.push(u.host); r.statusCode = 403; return r.end(); }
  if (u.pathname !== '/favicon.ico') netLog.push({ t: at(), host: u.host, path: u.pathname });
  const f = http.request({ host: '127.0.0.1', port: SITE, path: u.pathname + u.search, method: q.method, headers: { ...q.headers, host: u.host } },
    (fr) => { r.writeHead(fr.statusCode, fr.headers); fr.pipe(r); });
  q.pipe(f);
}).listen(PROXY, '127.0.0.1');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-profile-'));
const steps = [];
try {
  const normal = await chromium.launchPersistentContext(dir, {
    channel: 'chromium', args: [`--remote-debugging-port=${CDP}`, `--proxy-server=http://127.0.0.1:${PROXY}`],
  });
  const p1 = await normal.newPage(); await p1.goto('http://shop.example/shoes'); await p1.waitForTimeout(400);
  steps.push({ t: at(), window: 'normal', visit: 'shop.example/shoes' });

  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP}`);
  const priv = await browser.newContext();                       // Target.createBrowserContext (off-the-record)
  const p2 = await priv.newPage(); await p2.goto('http://shop.example/gift'); await p2.waitForTimeout(400);
  const during = (await priv.cookies()).map((c) => c.name);
  steps.push({ t: at(), window: 'private', visit: 'shop.example/gift', private_cookies_while_open: during });
  await priv.close();
  const fresh = await browser.newContext(); const after = (await fresh.cookies()).map((c) => c.name); await fresh.close();
  steps.push({ t: at(), window: 'private', note: 'closed; a new private window starts with', cookies: after });
  await browser.close();
  await p1.waitForTimeout(1500); await normal.close();
} finally {
  site.close(); proxy.close();
}

const q = (db, sql) => {
  const tmp = path.join(os.tmpdir(), 'tb-copy.db'); fs.copyFileSync(db, tmp);
  return execFileSync('python3', ['-I', '-c', `import sqlite3,json,sys;c=sqlite3.connect(sys.argv[1]);print(json.dumps(c.execute(sys.argv[2]).fetchall()))`, tmp, sql], { encoding: 'utf8' });
};
const history = JSON.parse(q(path.join(dir, 'Default/History'), 'select url, visit_count from urls order by id'));
const cookies = JSON.parse(q(path.join(dir, 'Default/Cookies'), 'select host_key, name from cookies order by name'));
fs.rmSync(dir, { recursive: true, force: true });

const vers = { playwright: require('/opt/node22/lib/node_modules/playwright/package.json').version };
const data = { site: 'shop.example', steps, website_log: siteLog, network_log: netLog, proxy_refused_other_hosts: refused,
  profile_after_close: { history_urls: history, cookies }, tools: vers };
fs.writeFileSync(path.join(out, 'private-demo.json'), JSON.stringify(data, null, 1));
console.log(JSON.stringify(data, null, 1));
