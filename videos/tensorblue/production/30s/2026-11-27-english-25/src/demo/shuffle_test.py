"""Tensorblue english-25 test: pure shuffle vs "pick the freshest of several random orders".

Python 3 standard library only. OUR OWN model of what Spotify Engineering described on 13 Nov 2025
("Shuffle: Making Random Feel More Human", engineering.atspotify.com/2025/11/shuffle-making-random-feel-more-human):
  * Standard Shuffle: "Each song in your playlist gets a unique value based on a randomly calculated 'seed' number,
    and the playlist is then ordered according to those random values." (Mersenne Twister - Python's `random`
    module is also a Mersenne Twister, MT19937.)
  * Fewer Repeats: "Generate multiple random sequences", "Score each sequence for freshness" (recently played tracks
    early in the order lose points; the earlier and the more recent, the more points lost), "Pick the freshest".
Spotify did not publish how many sequences it draws or its exact scoring, so N_CANDIDATES and the penalty below are
OUR illustrative choices. This is not Spotify's code and measures only our model.

Setup: a 20-song playlist; 5 of the songs were played recently (10 min, 1 h, 3 h, 12 h and 24 h ago).
Metrics over many trials: how often song #1 is a just-played song, and how many just-played songs land in the top 5.

usage: python3 shuffle_test.py <out_dir>   -> writes shuffle-test.json
"""
import json
import os
import random
import sys

PLAYLIST = [f'S{n:02d}' for n in range(1, 21)]
RECENT_HOURS = {'S03': 1 / 6, 'S08': 1.0, 'S11': 3.0, 'S16': 12.0, 'S19': 24.0}   # just played (hours ago)
N_CANDIDATES = 10
TRIALS = 20000
SEED = 20261127
TOP = 5


def standard_shuffle(rng):
    keys = {s: rng.random() for s in PLAYLIST}          # one random value per song, then sort by it
    return sorted(PLAYLIST, key=lambda s: keys[s])


def penalty(order):
    """freshness points lost: earlier position and more recent play both lose more (our weights)"""
    L = len(order)
    return sum((1 - i / L) * (1 / (1 + RECENT_HOURS[s] / 6)) for i, s in enumerate(order) if s in RECENT_HOURS)


def freshness(order):
    return round(100 * (1 - penalty(order) / 5), 1)       # 100 = no recent song anywhere near the top


def fewer_repeats(rng):
    cands = [standard_shuffle(rng) for _ in range(N_CANDIDATES)]
    return max(cands, key=freshness), cands


def stats(orders):
    first = sum(o[0] in RECENT_HOURS for o in orders) / len(orders)
    top = sum(sum(s in RECENT_HOURS for s in o[:TOP]) for o in orders) / len(orders)
    return {'first_song_just_played_pct': round(100 * first, 1), 'just_played_in_top5_avg': round(top, 3)}


def main(out_dir):
    rng = random.Random(SEED)
    std = [standard_shuffle(rng) for _ in range(TRIALS)]
    fr = [fewer_repeats(rng)[0] for _ in range(TRIALS)]
    # one worked example for the video: the first draw of a fresh generator (not cherry-picked)
    ex_rng = random.Random(SEED + 1)
    ex_std = standard_shuffle(ex_rng)
    ex_best, ex_cands = fewer_repeats(ex_rng)
    res = {
        'what': 'Our own model of Spotify\'s Standard vs Fewer Repeats shuffle (13 Nov 2025 post); illustrative scoring and N; not Spotify code.',
        'playlist_size': len(PLAYLIST), 'just_played': RECENT_HOURS, 'candidates': N_CANDIDATES, 'trials': TRIALS, 'seed': SEED,
        'expected_standard': {'first_song_just_played_pct': round(100 * len(RECENT_HOURS) / len(PLAYLIST), 1),
                              'just_played_in_top5_avg': round(TOP * len(RECENT_HOURS) / len(PLAYLIST), 3)},
        'standard': stats(std),
        'fewer_repeats': stats(fr),
        'example': {
            'standard_order': ex_std, 'standard_freshness': freshness(ex_std),
            'candidates': [{'order': c, 'freshness': freshness(c)} for c in ex_cands],
            'winner_index': ex_cands.index(ex_best), 'winner_freshness': freshness(ex_best),
        },
    }
    os.makedirs(out_dir, exist_ok=True)
    json.dump(res, open(os.path.join(out_dir, 'shuffle-test.json'), 'w'), indent=1)
    print(json.dumps({k: v for k, v in res.items() if k != 'example'}, indent=1))
    print('example standard top5:', ex_std[:5], 'fresh', freshness(ex_std))
    print('candidate freshness:', [c['freshness'] for c in res['example']['candidates']], 'winner', res['example']['winner_index'])


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'out')
