"""English text normalisation shared by align.py and asr_check.py (word error rate on comparable tokens)."""
import re

WORDNUM = [("twenty twenty five", "2025"), ("twenty four", "24"), ("two thousand", "2000"), ("one thousand", "1000"), ("three hundred", "300"),
           ("a hundred", "100"), ("thirty", "30"), ("ten", "10"), ("five", "5"), ("four", "4"), ("three", "3"), ("twenty four", "24"), ("seven", "7"), ("eight", "8"), ("fifteen", "15"), ("eighteen", "18")]

ALIAS = {"adhar": "aadhaar", "aadhar": "aadhaar", "aadhaars": "aadhaars"}

def tokens(s):
    s = s.lower().replace("%", " percent").replace("₹", " ")
    s = re.sub(r"(?<=\d),(?=\d)", "", s)
    s = re.sub(r"[^a-z0-9' ]+", " ", s).replace("'", "")
    s = " " + re.sub(r"\s+", " ", s).strip() + " "
    s = re.sub(r"(?<= )(?:[a-z] )+[a-z](?= )", lambda m: m.group().replace(" ", ""), s)  # c c p a -> ccpa
    s = re.sub(r"(?<= )(?:\d )+\d(?= )", lambda m: m.group().replace(" ", ""), s)        # 1 9 1 5 -> 1915
    for w, n in WORDNUM:
        s = s.replace(f" {w} ", f" {n} ")
    return [ALIAS.get(w, w) for w in s.split()]

def wer(ref, hyp):
    a, b = tokens(ref), tokens(hyp)
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p = d[:]; d[0] = i
        for j, cb in enumerate(b, 1):
            d[j] = min(p[j] + 1, d[j - 1] + 1, p[j - 1] + (ca != cb))
    return d[len(b)] / max(1, len(a))
