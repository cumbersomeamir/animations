// Real sync demo for Tensorblue english-12: an app that keeps working offline (local-first model).
// Uses Automerge 3.5.0 (MIT, npm @automerge/automerge), a sync library built for local-first apps.
//  1. The server's shopping list ["bread"] is copied onto Phone A and Phone B (each keeps a full local copy).
//  2. Both go offline. A: adds "milk", renames "bread" -> "rye bread". B: adds "eggs", renames "bread" -> "brown bread".
//     Each phone keeps working on its own copy; the changes the server hasn't seen yet are counted (the queue).
//  3. Back online: the server merges A's and B's changes, then both phones merge the server's copy.
//  4. Result: both additions are kept; the two renames of the same item are a conflict that Automerge's
//     rule settles the same way on every copy (one value wins, the other is kept as a conflict).
// The list items are invented. usage: node sync_demo.mjs <out_dir>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as A from '@automerge/automerge';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const AM_VERSION = JSON.parse(fs.readFileSync(path.join(HERE, '../node_modules/@automerge/automerge/package.json'), 'utf8')).version;

const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const list = (d) => d.items.map((i) => String(i.text));
const ACT = { server: '5e' .repeat(16), A: 'a1'.repeat(16), B: 'b2'.repeat(16) };

let server = A.from({ items: [{ text: 'bread' }] }, { actor: ACT.server });
let phoneA = A.clone(server, { actor: ACT.A });
let phoneB = A.clone(server, { actor: ACT.B });
const start = { server: list(server), A: list(phoneA), B: list(phoneB) };

// offline edits, each saved to that phone's own copy
phoneA = A.change(phoneA, 'add milk', (d) => { d.items.push({ text: 'milk' }); });
phoneA = A.change(phoneA, 'rename bread', (d) => { d.items[0].text = 'rye bread'; });
phoneB = A.change(phoneB, 'add eggs', (d) => { d.items.push({ text: 'eggs' }); });
phoneB = A.change(phoneB, 'rename bread', (d) => { d.items[0].text = 'brown bread'; });
const offline = { A: list(phoneA), B: list(phoneB), server: list(server) };
const queued = { A: A.getChanges(server, phoneA).length, B: A.getChanges(server, phoneB).length };

// back online: sync through the server
server = A.merge(server, phoneA);
server = A.merge(server, phoneB);
phoneA = A.merge(phoneA, server);
phoneB = A.merge(phoneB, server);
const conflicts = A.getConflicts(server.items[0], 'text') || {};
const conflictValues = Object.values(conflicts).map((v) => String(v));
const same = JSON.stringify(A.getHeads(server)) === JSON.stringify(A.getHeads(phoneA)) && JSON.stringify(A.getHeads(phoneA)) === JSON.stringify(A.getHeads(phoneB));

const data = {
  library: { name: '@automerge/automerge', version: AM_VERSION },
  start, offline, queued_changes: queued,
  after_sync: { server: list(server), A: list(phoneA), B: list(phoneB), all_copies_identical: same },
  same_item_conflict: { winner: String(server.items[0].text), values_kept: conflictValues },
};
fs.writeFileSync(path.join(out, 'sync-demo.json'), JSON.stringify(data, null, 1));
console.log(JSON.stringify(data, null, 1));
