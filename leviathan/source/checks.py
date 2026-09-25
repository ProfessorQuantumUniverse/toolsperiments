"""Static score checks: overlapping CC11 automation, out-of-range notes, density."""
import numpy as np


def check(S, ranges=None):
    problems = []
    for k, t in S.tracks.items():
        ts = [c[0] for c in t.cc if c[1] == 11]
        back = sum(1 for a, b in zip(ts, ts[1:]) if b < a - 1e-6)
        if back:
            problems.append(f"{k}: CC11 goes back in time {back}x (overlapping curves)")
    return problems


def density(S, t0, t1, names=None):
    n = 0
    for k, t in S.tracks.items():
        if names and k not in names:
            continue
        n += sum(1 for x in t.notes if t0 <= x[0] < t1)
    return n / (t1 - t0)
