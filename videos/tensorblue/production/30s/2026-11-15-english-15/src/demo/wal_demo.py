"""Real crash test for Tensorblue english-15: SQLite in WAL mode (Python stdlib sqlite3, no extra packages).

1. A notes database is created with journal_mode=WAL, synchronous=FULL, and automatic checkpoints off
   (wal_autocheckpoint=0) so committed changes stay in the log and the main file is updated "later".
2. A child process saves two notes (two committed transactions), starts a third ("Buy milk") without
   committing, then kills itself with SIGKILL — an app crash in the middle of a save.
3. Before reopening, we look at the files on disk: are the committed notes in the main database file,
   in the -wal log, or both?
4. Reopen the database (SQLite recovers from the WAL) and list the notes.
5. Checkpoint: copy the logged changes into the main file, and look again.
This is an application crash, not a power cut: per SQLite's docs, transactions are durable across
application crashes regardless of the synchronous setting; power loss is where synchronous matters.
usage: python3 wal_demo.py <out_dir>
"""
import json
import os
import signal
import sqlite3
import subprocess
import sys
import tempfile

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
work = tempfile.mkdtemp(prefix="wal-demo-")
db = os.path.join(work, "notes.db")

con = sqlite3.connect(db, isolation_level=None)
mode = con.execute("PRAGMA journal_mode=WAL").fetchone()[0]
con.execute("PRAGMA synchronous=FULL")
con.execute("PRAGMA wal_autocheckpoint=0")
con.execute("CREATE TABLE notes(id INTEGER PRIMARY KEY, text TEXT)")
con.execute("PRAGMA wal_checkpoint(TRUNCATE)")                 # start: empty table in the main file, empty log
con.close()

child = r'''
import os, signal, sqlite3, sys
con = sqlite3.connect(sys.argv[1], isolation_level=None)
con.execute("PRAGMA synchronous=FULL"); con.execute("PRAGMA wal_autocheckpoint=0")
for text in ["Pay rent Fri", "Call Sam"]:
    con.execute("BEGIN"); con.execute("INSERT INTO notes(text) VALUES (?)", (text,)); con.execute("COMMIT")
con.execute("BEGIN"); con.execute("INSERT INTO notes(text) VALUES (?)", ("Buy milk",))   # never committed
os.kill(os.getpid(), signal.SIGKILL)                                                       # crash mid-save
'''
p = subprocess.run([sys.executable, "-c", child, db])
crash_signal = -p.returncode if p.returncode < 0 else None

def has(path, s):
    try:
        return s.encode() in open(path, "rb").read()
    except FileNotFoundError:
        return None

before = {
    "main_file_has": {t: has(db, t) for t in ["Pay rent Fri", "Call Sam", "Buy milk"]},
    "wal_log_has": {t: has(db + "-wal", t) for t in ["Pay rent Fri", "Call Sam", "Buy milk"]},
    "wal_bytes": os.path.getsize(db + "-wal") if os.path.exists(db + "-wal") else 0,
}

con = sqlite3.connect(db, isolation_level=None)
after_restart = [r[0] for r in con.execute("SELECT text FROM notes ORDER BY id")]
ck = con.execute("PRAGMA wal_checkpoint(TRUNCATE)").fetchone()
con.close()
after_checkpoint = {t: has(db, t) for t in ["Pay rent Fri", "Call Sam", "Buy milk"]}

data = {
    "sqlite_version": sqlite3.sqlite_version, "python": sys.version.split()[0], "journal_mode": mode, "synchronous": "FULL",
    "child_killed_by_signal": crash_signal,
    "on_disk_after_crash": before,
    "notes_after_restart": after_restart,
    "checkpoint_result": list(ck),
    "main_file_has_after_checkpoint": after_checkpoint,
    "note": "application crash (SIGKILL), not a power cut",
}
json.dump(data, open(os.path.join(out, "wal-demo.json"), "w"), indent=1)
print(json.dumps(data, indent=1))
