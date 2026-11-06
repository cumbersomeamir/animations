"""Real SQLite demo for Tensorblue english-07: two buyers, one last seat.

A fictional event has one seat left (K12). Two buyers (A, B) try to buy it at the same moment.
1. Careless app logic, interleaved exactly as two servers can run it: both CHECK the seat (both see
   it free), then both SELL it  -> two tickets for one seat.
2. One-step claim: UPDATE ... WHERE id='K12' AND buyer IS NULL. The database applies the two claims
   one at a time; changes() is 1 for the first and 0 for the second -> one ticket, one "sold out".
3. Stress test with real threads released together by a barrier (300 trials each, a 2 ms gap of
   "app work" between check and sell): how often each version sells the seat twice.
Uses only the Python standard library (sqlite3). Nothing here is real customer data.
usage: python seat_demo.py <out_dir>
"""
import json, os, sqlite3, sys, tempfile, threading, time

SEAT = "K12"


def fresh(path):
    for p in (path, path + "-wal", path + "-shm", path + "-journal"):
        if os.path.exists(p):
            os.remove(p)
    c = sqlite3.connect(path, isolation_level=None)
    c.executescript(f"""CREATE TABLE seats(id TEXT PRIMARY KEY, buyer TEXT);
                        CREATE TABLE tickets(seat TEXT, buyer TEXT);
                        INSERT INTO seats VALUES('{SEAT}', NULL);""")
    c.close()


def conn(path):
    return sqlite3.connect(path, isolation_level=None, timeout=10)   # autocommit, wait for the write lock


def count_tickets(path):
    c = conn(path); n = c.execute("SELECT count(*) FROM tickets WHERE seat=?", (SEAT,)).fetchone()[0]
    who = [r[0] for r in c.execute("SELECT buyer FROM tickets WHERE seat=? ORDER BY rowid", (SEAT,))]; c.close()
    return n, who


def interleaved(path):
    log = {}
    # --- careless: check, then sell ---
    fresh(path); A, B = conn(path), conn(path)
    check = "SELECT buyer IS NULL FROM seats WHERE id = 'K12'"
    a_free = A.execute(check).fetchone()[0]; b_free = B.execute(check).fetchone()[0]
    for who, c, free in (("A", A, a_free), ("B", B, b_free)):
        if free:
            c.execute(f"UPDATE seats SET buyer = '{who}' WHERE id = 'K12'")
            c.execute("INSERT INTO tickets VALUES('K12', ?)", (who,))
    n, who = count_tickets(path)
    log["careless"] = {"check_sql": check, "sell_sql": "UPDATE seats SET buyer = '<buyer>' WHERE id = 'K12'",
                       "A_sees_free": bool(a_free), "B_sees_free": bool(b_free), "tickets": n, "ticket_buyers": who}
    A.close(); B.close()
    # --- one step: claim only if still free ---
    fresh(path); A, B = conn(path), conn(path)
    res = {}
    for who, c in (("A", A), ("B", B)):
        c.execute(f"UPDATE seats SET buyer = '{who}' WHERE id = 'K12' AND buyer IS NULL")
        ch = c.execute("SELECT changes()").fetchone()[0]
        res[who] = ch
        if ch == 1:
            c.execute("INSERT INTO tickets VALUES('K12', ?)", (who,))
    n, who = count_tickets(path)
    log["one_step"] = {"claim_sql": "UPDATE seats SET buyer = '<buyer>' WHERE id = 'K12' AND buyer IS NULL",
                       "changes_A": res["A"], "changes_B": res["B"], "tickets": n, "ticket_buyers": who}
    A.close(); B.close()
    return log


def buyer_careless(path, who, bar, gap):
    c = conn(path); bar.wait()
    free = c.execute("SELECT buyer IS NULL FROM seats WHERE id = 'K12'").fetchone()[0]
    time.sleep(gap)                                   # app / network work between check and sell
    if free:
        c.execute("UPDATE seats SET buyer = ? WHERE id = 'K12'", (who,))
        c.execute("INSERT INTO tickets VALUES('K12', ?)", (who,))
    c.close()


def buyer_one_step(path, who, bar, gap):
    c = conn(path); bar.wait()
    time.sleep(gap)                                   # same app work, before the single claim
    cur = c.execute("UPDATE seats SET buyer = ? WHERE id = 'K12' AND buyer IS NULL", (who,))
    if cur.rowcount == 1:
        c.execute("INSERT INTO tickets VALUES('K12', ?)", (who,))
    c.close()


def stress(path, fn, trials=300, gap=0.002):
    double = 0; dist = {}
    for _ in range(trials):
        fresh(path); bar = threading.Barrier(2)
        th = [threading.Thread(target=fn, args=(path, w, bar, gap)) for w in "AB"]
        [t.start() for t in th]; [t.join() for t in th]
        n, _ = count_tickets(path); dist[n] = dist.get(n, 0) + 1
        double += n > 1
    return {"trials": trials, "gap_s": gap, "sold_twice": double, "tickets_per_trial": {str(k): v for k, v in sorted(dist.items())}}


def main():
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    with tempfile.TemporaryDirectory() as d:
        db = os.path.join(d, "seats.db")
        data = {"sqlite_version": sqlite3.sqlite_version, "python": sys.version.split()[0], "seat": SEAT,
                "interleaved": interleaved(db),
                "stress": {"careless": stress(db, buyer_careless), "one_step": stress(db, buyer_one_step)}}
    json.dump(data, open(os.path.join(out, "seat-demo.json"), "w"), indent=1)
    print(json.dumps(data, indent=1))


if __name__ == "__main__":
    main()
