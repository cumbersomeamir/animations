// Tensorblue english-24 test, part 2: what JavaScript's Number type does to a 64-bit ID.
// Reads demo/out/snowflake-test.json, takes the sample ID (a string), and compares:
//   Number(id)  -> a double: exact only up to 2^53 (Number.MAX_SAFE_INTEGER)
//   BigInt(id) / the string itself -> exact
// usage: node demo/js_precision.mjs demo/out   -> adds "js" to snowflake-test.json
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2] || 'demo/out';
const file = path.join(dir, 'snowflake-test.json');
const res = JSON.parse(fs.readFileSync(file, 'utf8'));
const idStr = res.sample.id;
const asNumber = Number(idStr);                    // what JSON.parse does to a bare 64-bit integer
const asParsed = JSON.parse(`{"id":${idStr}}`).id;
const back = BigInt(asNumber).toString();          // the integer the double actually holds
const x = res.ids.map((r) => r.id);
const collide = new Set(x.map((s) => Number(s))).size;
res.js = {
  node: process.version,
  max_safe_integer: Number.MAX_SAFE_INTEGER,
  id_string: idStr,
  number_toString: String(asNumber),
  json_parse_number_toString: String(asParsed),
  number_exact_integer: back,
  number_equals_id: back === idStr,
  off_by: (BigInt(back) - BigInt(idStr)).toString(),
  bigint_equals_id: BigInt(idStr).toString() === idStr,
  test_ids: x.length,
  distinct_as_strings: new Set(x).size,
  distinct_after_Number: collide,
};
// IDs that are different as strings but equal once they become JavaScript Numbers
const groups = new Map();
for (const s of x) { const k = BigInt(Number(s)).toString(); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(s); }
res.js.collisions = [...groups.entries()].filter(([, v]) => v.length > 1).map(([num, ids]) => ({ number_exact_integer: num, ids }));
const a = res.ids[0].id, b2 = res.ids[1].id;          // machine 1, same millisecond, sequence 0 and 1
res.js.showcase = { a, b: b2, a_differs_from_b: a !== b2, number_a: BigInt(Number(a)).toString(), number_b: BigInt(Number(b2)).toString(),
  numbers_equal: Number(a) === Number(b2), bigint_equal: BigInt(a) === BigInt(b2) };
fs.writeFileSync(file, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res.js, null, 1));
