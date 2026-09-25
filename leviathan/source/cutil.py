"""Shared composition helpers: tempo maps, harmony, voice leading, humanisation."""
import numpy as np
from studio import Score, SSO, MSG, AEG

rng = np.random.default_rng(88)


class Sec:
    """Section with fixed meter (quarter notes per bar) and a tempo map
    [(bar_position, quarter_bpm), ...] (linear interpolation -> accel./rit.)."""

    def __init__(self, t0, meter_q, nbars, tempo):
        self.t0, self.mq, self.n = t0, meter_q, nbars
        step = 1 / 96
        self.pos = np.arange(0, (nbars + 4) * meter_q, step)
        if np.isscalar(tempo):
            bpm = np.full(len(self.pos), float(tempo))
        else:
            xs = [(b - 1) * meter_q for b, _ in tempo]
            bpm = np.interp(self.pos, xs, [v for _, v in tempo])
        dt = 60.0 / bpm * step
        self.cum = t0 + np.concatenate([[0], np.cumsum(dt[:-1])])

    def t(self, bar, q=0.0):
        return float(np.interp((bar - 1) * self.mq + q, self.pos, self.cum))

    def d(self, bar, q, dq):
        return self.t(bar, q + dq) - self.t(bar, q)

    @property
    def end(self):
        return self.t(self.n + 1)


def hum(t, sd=0.006, lim=0.015):
    """timing humanisation: gaussian jitter, clipped to +-15 ms"""
    return t + float(np.clip(rng.normal(0, sd), -lim, lim))


def hv(v, amt=4):
    return int(np.clip(v + rng.normal(0, amt), 1, 127))


CH = {
    "Dm": (2, [2, 5, 9]), "Bb": (10, [10, 2, 5]), "F": (5, [5, 9, 0]), "C": (0, [0, 4, 7]),
    "A": (9, [9, 1, 4]), "Gm": (7, [7, 10, 2]), "Eb": (3, [3, 7, 10]), "D5": (2, [2, 9]),
    "Eb5": (3, [3, 10]), "C5": (0, [0, 7]), "Bb5": (10, [10, 5]), "A5": (9, [9, 4]), "F5": (5, [5, 0]),
    "G5": (7, [7, 2]), "Dsus": (2, [2, 7, 9]),
}


def root(ch, lo=36):
    return lo + (CH[ch][0] - lo) % 12


def tones(ch, lo, hi):
    return [p for p in range(lo, hi + 1) if p % 12 in CH[ch][1]]


def voicing(ch, ranges, prev=None):
    pcs = CH[ch][1]
    out, used = [], []
    for i, (lo, hi) in enumerate(ranges):
        ref = prev[i] if prev else (lo + hi) / 2
        cands = [p for p in range(lo, hi + 1) if p % 12 in pcs]
        best = min(cands, key=lambda p: abs(p - ref) + (6 if p % 12 in used else 0)
                   + (4 if (out and abs(out[-1] - p) < 3) else 0))
        out.append(best)
        used.append(best % 12)
    return out


def melody(tr, sec, bar0, notes, unit=1.0, transpose=0, vel=80, legato=1.03, sd=0.008, q0=0.0,
           phrase=True):
    """notes: (pitch, duration in `unit` quarters). Velocity follows the phrase:
    longer notes and the phrase peak get more weight (the line 'breathes')."""
    q = q0
    total = sum(d for _, d in notes) * unit
    for p, d in notes:
        t = sec.t(bar0, q)
        dur = sec.d(bar0, q, d * unit)
        arch = np.sin(np.pi * min(1.0, (q - q0 + d * unit / 2) / total)) if phrase else 0.5
        v = vel - 6 + 10 * arch + (4 if d * unit >= 2 else 0)
        if p is not None:
            tr.add(hum(t, sd), dur * legato, p + transpose, hv(v, 3))
        q += d * unit
    return q


def swell(tr, pts):
    tr.curve(11, pts)


def breathe(tr, sec, bars, lo, hi, every=2):
    """CC11 'breathing' swells over groups of bars."""
    pts = []
    for b in range(bars[0], bars[-1] + 1, every):
        pts += [(sec.t(b), lo), (sec.t(b, sec.mq * every * 0.55), hi)]
    pts.append((sec.t(bars[-1] + 1), lo))
    tr.curve(11, pts)


def pad(tr, sec, bars, harm, ranges, vel=80, overlap=0.08, sd=0.01):
    prev = None
    for bar, ch in zip(bars, harm):
        prev = voicing(ch, ranges, prev)
        for p in prev:
            tr.add(hum(sec.t(bar), sd) - overlap / 2, sec.d(bar, 0, sec.mq) + overlap, p, hv(vel, 3))
