"""Real-folder demo for Tensorblue english-08: why a deleted photo can still be there.

A fictional sync system made of real folders: phone/, cloud/, laptop/, cloud-trash/ and an
older backup snapshot backup-monday/. rsync 3.2.7 moves the files. Four steps:
  1. device-only removal: delete on the phone, sync uploads only (no --delete)
     -> the cloud and the laptop keep their copies.
  2. synced delete: delete on the phone, sync with --delete and --backup-dir
     -> the cloud and the laptop lose it, and the cloud's copy moves to cloud-trash/.
  3. the older backup snapshot still holds a copy.
  4. permanent removal: empty cloud-trash/, then remove the old snapshot -> no copy anywhere.
After each step every folder is listed. The photos are made-up placeholder files.
usage: python sync_demo.py <out_dir>
"""
import json, os, shutil, subprocess, sys, tempfile

PHOTOS = ["beach.jpg", "dog.jpg", "cake.jpg"]
PLACES = ["phone", "cloud", "laptop", "cloud-trash", "backup-monday"]


def rsync(*args):
    cmd = ["rsync", "-a", *args]
    subprocess.run(cmd, check=True)
    return " ".join(a if not a.startswith("/") else os.path.basename(a.rstrip("/")) + ("/" if a.endswith("/") else "") for a in cmd)


def listing(root):
    out = {}
    for p in PLACES:
        d = os.path.join(root, p)
        out[p] = sorted(f for f in os.listdir(d) if not f.startswith(".")) if os.path.isdir(d) else None
    return out


def main():
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    steps = []
    with tempfile.TemporaryDirectory() as root:
        P = lambda name: os.path.join(root, name) + "/"
        for p in PLACES[:4]:
            os.makedirs(P(p))
        for f in PHOTOS:
            with open(os.path.join(root, "phone", f), "wb") as fh:
                fh.write(("placeholder photo " + f).encode())
        cmds = [rsync(P("phone"), P("cloud")), rsync(P("cloud"), P("laptop")), rsync(P("cloud"), P("backup-monday"))]
        steps.append({"step": "0 start: phone uploads, laptop syncs, Monday backup", "commands": cmds, "state": listing(root)})

        os.remove(os.path.join(root, "phone", "beach.jpg"))
        cmds = ["rm phone/beach.jpg", rsync(P("phone"), P("cloud")), rsync(P("cloud"), P("laptop"))]
        steps.append({"step": "1 device-only removal (upload-only sync)", "commands": cmds, "state": listing(root)})

        rsync(P("cloud"), P("phone"))                      # the phone gets it back from the cloud
        os.remove(os.path.join(root, "phone", "beach.jpg"))
        cmds = ["rm phone/beach.jpg",
                rsync("--delete", "--backup", "--backup-dir=" + os.path.join(root, "cloud-trash"), P("phone"), P("cloud")),
                rsync("--delete", P("cloud"), P("laptop"))]
        steps.append({"step": "2 synced delete (deletion propagates, cloud keeps a trash copy)", "commands": cmds, "state": listing(root)})

        steps.append({"step": "3 the older backup snapshot", "commands": [], "state": listing(root)})

        for f in os.listdir(os.path.join(root, "cloud-trash")):
            os.remove(os.path.join(root, "cloud-trash", f))
        s4a = listing(root)
        shutil.rmtree(os.path.join(root, "backup-monday"))
        steps.append({"step": "4 empty the trash, then remove the old backup", "commands": ["rm cloud-trash/*", "rm -r backup-monday"],
                      "state_after_empty_trash": s4a, "state": listing(root)})
        for s in steps:                                    # record commands relative to the demo root
            s["commands"] = [c.replace(root + "/", "") for c in s["commands"]]
    v = subprocess.run(["rsync", "--version"], capture_output=True, text=True).stdout.splitlines()[0]
    data = {"rsync": v, "photo": "beach.jpg", "steps": steps}
    json.dump(data, open(os.path.join(out, "sync-demo.json"), "w"), indent=1)
    for s in steps:
        where = [p for p, fs in s["state"].items() if fs and "beach.jpg" in fs]
        print(f"{s['step']:62s} beach.jpg in: {', '.join(where) or 'nowhere'}")
        if "state_after_empty_trash" in s:
            print(f"{'   (after emptying the trash only)':62s} beach.jpg in: {', '.join(p for p, fs in s['state_after_empty_trash'].items() if fs and 'beach.jpg' in fs)}")


if __name__ == "__main__":
    main()
