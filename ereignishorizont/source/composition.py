"""
EREIGNISHORIZONT – an epic in five movements
  I.   Staub          (dust, the ticking clock, a felt piano remembers)
  II.  Kornfeld       (the chase – organ ostinato in threes against twos)
  III. Andocken       (the docking – relentless ostinato, chromatic ascent, cut)
  IV.  Zeit           (one 8-bar cycle, five times, layer upon layer)
  V.   Tesserakt      (coda – time runs out)

All material is original. Written as Python so that every note is data.
"""
import numpy as np
from engine import Score, SSO, MSG, n

rng = np.random.default_rng(2014)
S = Score()

# ---------------------------------------------------------------- tracks
def sf2(name, sfp, prog, bank=0):
    return S.track(name, "sf2", sf=sfp, prog=prog, bank=bank)

piano = sf2("piano", MSG, 0)
celesta = sf2("celesta", MSG, 8)
harp = sf2("harp", SSO, 1)
vln1 = sf2("vln1", SSO, 2)
vln2 = sf2("vln2", SSO, 4)
vla = sf2("vla", SSO, 6)
vc = sf2("vc", SSO, 8)
vc_mel = sf2("vc_mel", SSO, 8)
cb = sf2("cb", SSO, 10)
strL = sf2("strL", MSG, 49)          # layer: MuseScore slow strings for body
trem = sf2("trem", MSG, 44)
spic_lo = sf2("spic_lo", MSG, 48)
spic_hi = sf2("spic_hi", MSG, 48)
hn = sf2("hn", SSO, 30)
hn2 = sf2("hn2", MSG, 60)
hn_pad = sf2("hn_pad", SSO, 30)
tpt = sf2("tpt", SSO, 28)
tpt_st = sf2("tpt_st", MSG, 56)
tbn = sf2("tbn", SSO, 32)
btb = sf2("btb", SSO, 33)
tuba = sf2("tuba", SSO, 34)
choir = sf2("choir", SSO, 35)
choir2 = sf2("choir2", MSG, 52)
choir_mel = sf2("choir_mel", SSO, 35)
oohs = sf2("oohs", MSG, 53)
timp = sf2("timp", MSG, 47)
taiko = sf2("taiko", MSG, 116)
bd = sf2("bd", SSO, 37)
cym = sf2("cym", SSO, 38)
chimes = sf2("chimes", SSO, 43)
glock = sf2("glock", SSO, 39)

org_soft = S.track("org_soft", "organ", reg="soft", chiff=1.5)
org_main = S.track("org_main", "organ", reg="principal")
org_lh = S.track("org_lh", "organ", reg="chorus")
org_full = S.track("org_full", "organ", reg="full")
org_chord = S.track("org_chord", "organ", reg="full")
ped_soft = S.track("ped_soft", "organ", reg="pedal_soft", chiff=0.3)
ped = S.track("ped", "organ", reg="pedal", chiff=0.3)
ped_full = S.track("ped_full", "organ", reg="pedal_full", chiff=0.3)

tick = S.track("tick", "tick")
impact = S.track("impact", "impact")
riser = S.track("riser", "riser")
whoosh = S.track("whoosh", "whoosh")
pad = S.track("pad", "pad", bright=2200, attack=2.0, release=2.5)
sub = S.track("sub", "sub")
braam = S.track("braam", "braam")
heart = S.track("heart", "heart")
atmos = S.track("atmos", "atmos")


# ---------------------------------------------------------------- helpers
class Sec:
    def __init__(self, t0, bpm, beats=4):
        self.t0, self.bpm, self.beats = t0, bpm, beats
        self.b = 60.0 / bpm

    def t(self, bar, beat=0.0):
        return self.t0 + ((bar - 1) * self.beats + beat) * self.b

    def d(self, beats):
        return beats * self.b


def hum(t, amt=0.010):
    return t + rng.normal(0, amt)


def hv(v, amt=5):
    return int(np.clip(v + rng.normal(0, amt), 1, 127))


# chord name -> (bass pitch class, chord pitch classes)
CH = {
    "Dm": (2, [2, 5, 9]), "Bbmaj7": (10, [10, 2, 5, 9]), "Bb": (10, [10, 2, 5, 0]),
    "Gm": (7, [7, 10, 2]), "A": (9, [9, 1, 4]), "Asus": (9, [9, 2, 4]), "A5": (9, [9, 4]),
    "F": (5, [5, 9, 0]), "C": (0, [0, 4, 7, 2]), "D": (2, [2, 6, 9]),
    "Bm7": (11, [11, 2, 6, 9]), "Gmaj7": (7, [7, 11, 2, 6]), "D/F#": (6, [2, 6, 9]),
    "Eb": (3, [3, 7, 10, 2]), "Em7": (4, [4, 7, 11, 2]), "Fmaj7": (5, [5, 9, 0, 4]),
    "Gm6": (7, [7, 10, 2, 4]), "Cadd9": (0, [0, 4, 7, 2]), "Dsus": (2, [2, 7, 9]),
}


def ped_pitch(ch):          # 36..47
    return 36 + CH[ch][0]


def bass2(ch):              # 36..47 -> cellos/basses/trombones
    return 36 + CH[ch][0]


def voicing(ch, ranges, prev=None):
    """greedy voice-leading: ranges top->down, returns pitches"""
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


LH_ARP = {
    "Dm": [38, 45, 50, 53, 57], "Bbmaj7": [34, 41, 46, 50, 57], "Gm": [43, 50, 55, 58, 62],
    "A": [45, 52, 57, 61, 64], "F": [41, 48, 53, 57, 60], "Bb": [46, 53, 58, 60, 62],
    "C": [36, 43, 48, 52, 55], "D": [38, 45, 50, 54, 57], "Bm7": [47, 54, 57, 62, 66],
    "Gmaj7": [43, 50, 54, 59, 62], "D/F#": [42, 50, 54, 57, 62],
}

# Theme H (minor) – (pitch, beats); 8 bars of 4/4
TH = [(65, 3), (64, 1), (62, 2), (69, 2), (67, 3), (65, 1), (64, 4),
      (65, 3), (67, 1), (69, 2), (74, 2), (72, 3), (70, 1), (69, 4)]
TM = [(66 if p == 65 else p, d) for p, d in TH]          # major-mode version
H_MIN = ["Dm", "Bbmaj7", "Gm", "A", "Dm", "F", "Bb", "F"]
H_MAJ = ["D", "Bm7", "Gmaj7", "A", "D", "D/F#", "Bb", "D"]
# "Zeit-Motiv" M2 – (pitch, beat offset in bar, beats) per bar
M2 = [[(69, 0, 1), (74, 1, 1), (77, 2, 2)], [(81, 0, 4)], [(79, 0, 1), (77, 1, 1), (74, 2, 2)],
      [(76, 0, 4)], [(69, 0, 1), (74, 1, 1), (77, 2, 2)], [(81, 0, 2), (84, 2, 2)],
      [(86, 0, 2), (84, 2, 2)], [(81, 0, 4)]]
M2_MAJ = [[(p + 1 if p % 12 == 5 else p, o, d) for p, o, d in bar] for bar in M2]
M2_MAJ[5] = [(81, 0, 2), (86, 2, 2)]


def melody(tr, sec, bar0, notes, transpose=0, vel=80, legato=1.04, hum_t=0.012, shape=True,
           time_scale=1.0):
    """place a (pitch, beats) melody starting at bar0; returns end time"""
    beat = 0.0
    for i, (p, d) in enumerate(notes):
        t = sec.t(bar0, beat * time_scale)
        dur = sec.d(d * time_scale)
        v = vel + (6 if d >= 3 and shape else 0) - (4 if d <= 1 and shape else 0)
        tr.add(hum(t, hum_t), dur * legato, p + transpose, hv(v, 3))
        beat += d
    return sec.t(bar0, beat * time_scale)


def swell(tr, pts):
    tr.curve(11, pts)


def cym_swell(t_peak, key=50, vel=100):
    lead = {48: 2.02, 50: 3.16, 52: 3.16, 53: 2.18}[key]
    cym.add(t_peak - lead, lead + 4.0, key, vel)


def crash(t, vel=115):
    cym.add(t, 5.0, 55, vel)
    cym.add(t + 0.005, 4.0, 57, int(vel * 0.9))


def bd_hit(t, vel=115):
    bd.add(t, 3.0, 48, vel)


def timp_roll(t0, t1, pitch, v0=40, v1=110, rate=0.055):
    k = int((t1 - t0) / rate)
    for i in range(k):
        a = i / max(1, k - 1)
        timp.add(t0 + i * rate + rng.normal(0, 0.004), rate * 1.5, pitch, hv(v0 + (v1 - v0) * a ** 1.5, 4))


def big_hit(t, size=1.0, vel=120, cym_on=True):
    impact.add(t, 4.0, 60, vel, size=size)
    bd_hit(t, min(127, vel))
    if cym_on:
        crash(t, min(127, vel))


# ==================================================================
# I. STAUB  – 66 bpm, 14 bars
# ==================================================================
I = Sec(0.6, 66)
I_h = ["Dm", "Dm"] + H_MIN + ["Dm", "Bbmaj7", "Gm", "A"]
I_end = I.t(15)

atmos.add(0.0, I_end + 8.0, n("D3"), 70, att=7.0, rel=8.0)
for bar in range(1, 15):
    for beat in range(4):
        tt = I.t(bar, beat)
        v = 64 + bar * 2 + (6 if beat == 0 else 0)
        tick.add(tt, 0.05, 60, v, tock=beat % 2 == 1)

# organ pedal – soft 16' + 8', a floor under everything
for bar, ch in enumerate(I_h, 1):
    ped_soft.add(I.t(bar), I.d(4) + 0.02, ped_pitch(ch), 85)

# felt piano: theme H (bars 3-10) up an octave, broken chords under it
melody(piano, I, 3, TH, transpose=12, vel=60, legato=1.1, hum_t=0.018)
for bar in range(3, 15):
    ch = I_h[bar - 1]
    arp = LH_ARP[ch]
    if bar <= 10:
        pat, step, vbase = [0, 1, 2, 3, 4, 3, 2, 1], 0.5, 40
    else:
        pat, step, vbase = [0, 1, 2, 3, 4, 3, 2, 1] * 2, 0.25, 36
    for i, k in enumerate(pat):
        tt = I.t(bar, i * step)
        piano.add(hum(tt, 0.012), I.d(4 - i * step) + 0.3, arp[k], hv(vbase + (8 if i == 0 else 0), 4))

# celesta echo of the melody's long notes (Buckley glitter)
for bar, beat, p in [(4, 2, 81), (6, 0, 88), (8, 2, 86), (10, 0, 93)]:
    celesta.add(I.t(bar, beat), I.d(3), p, 45)

# string pad bars 3-14 with voice leading; vln1 joins at bar 7
prev = None
for bar in range(3, 15):
    ch = I_h[bar - 1]
    v = voicing(ch, [(62, 72), (55, 64)], prev)
    prev = v
    t0, d = I.t(bar) - 0.05, I.d(4) + 0.12
    vln2.add(t0, d, v[0], 70)
    vla.add(t0, d, v[1], 70)
    if bar <= 10:
        vc.add(t0, d, bass2(ch) + 12 if bass2(ch) + 12 <= 50 else bass2(ch), 72)
    cb.add(t0, d, bass2(ch), 70)
    if bar >= 7:
        top = voicing(ch, [(74, 84)])[0]
        vln1.add(t0, d, top, 66)
swell(vln2, [(0, 20), (I.t(3), 20), (I.t(6), 55), (I.t(10), 62), (I.t(11), 50), (I.t(14), 70), (I.t(15), 110)])
swell(vla, [(0, 20), (I.t(3), 20), (I.t(6), 55), (I.t(10), 62), (I.t(11), 50), (I.t(14), 70), (I.t(15), 110)])
swell(vc, [(0, 20), (I.t(3), 25), (I.t(8), 60), (I.t(10), 60)])
swell(cb, [(0, 20), (I.t(3), 25), (I.t(8), 55), (I.t(11), 60), (I.t(15), 105)])
swell(vln1, [(0, 10), (I.t(7), 10), (I.t(9), 55), (I.t(11), 48), (I.t(14), 70), (I.t(15), 112)])

# cellos sing the first half of the theme (bars 11-14)
melody(vc_mel, I, 11, TH[:7], transpose=-12, vel=88, legato=1.06, hum_t=0.01)
swell(vc_mel, [(0, 70), (I.t(11), 72), (I.t(12), 95), (I.t(13), 80), (I.t(14), 90), (I.t(15), 118)])

# soft organ flutes from bar 7
prev = None
for bar in range(7, 15):
    ch = I_h[bar - 1]
    prev = voicing(ch, [(62, 70), (55, 63), (50, 57)], prev)
    for p in prev:
        org_soft.add(I.t(bar), I.d(4) + 0.03, p, 80)

# oohs from bar 11
for bar in range(11, 15):
    ch = I_h[bar - 1]
    for p in voicing(ch, [(64, 72), (57, 64)]):
        oohs.add(I.t(bar), I.d(4) + 0.1, p, 60)
swell(oohs, [(0, 30), (I.t(11), 30), (I.t(13), 70), (I.t(15), 115)])

# transition into II
riser.add(I.t(12), I_end - I.t(12), 60, 70, f0=200, f1=7000)
cym_swell(I_end, 50, 90)
whoosh.add(I_end - 3.0, 3.0, 60, 90)
timp_roll(I.t(14), I_end - 0.05, 45, 30, 105)

# ==================================================================
# II. KORNFELD – 100 bpm, 32 bars
# ==================================================================
II = Sec(I_end, 100)
II_h = (["Dm", "Dm", "Bb", "Bb", "F", "F", "C", "C"] * 2 +
        ["Dm", "Dm", "Bbmaj7", "Bbmaj7", "Gm", "Gm", "A", "A"] +
        ["Dm", "Dm", "F", "F", "Bb", "Bb", "A", "A"])
RH3 = {"Dm": [69, 74, 77], "Bb": [70, 74, 77], "Bbmaj7": [69, 74, 77], "F": [69, 72, 77],
       "C": [67, 72, 76], "Gm": [67, 70, 74], "A": [69, 73, 76]}
LH2 = {"Dm": [50, 57], "Bb": [46, 53], "Bbmaj7": [46, 53], "F": [53, 60], "C": [48, 55],
       "Gm": [50, 55], "A": [52, 57]}
II_end = II.t(33)
big_hit(II.t(1), 0.8, 100)

k = 0
for bar in range(1, 33):
    ch = II_h[bar - 1]
    for s in range(16):
        tt = II.t(bar, s * 0.25)
        p = RH3[ch][k % 3]
        tr = org_main if bar < 25 else org_full
        tr.add(tt, II.d(0.25) * 0.97, p, 90)
        if 5 <= bar <= 16:
            piano.add(hum(tt, 0.004), II.d(0.25) * 0.9, p + 12, hv(36 + (10 if k % 3 == 0 else 0) + bar, 3))
        if bar >= 25:   # violins double the spinning figure an octave up
            spic_hi.add(tt, II.d(0.25) * 0.8, p + 12, hv(62 + (18 if k % 3 == 0 else 0), 4))
        k += 1
    for e in range(8):
        org_lh.add(II.t(bar, e * 0.5), II.d(0.5) * 0.95, LH2[ch][e % 2], 70 if bar < 17 else 85)
    pt = ped_soft if bar < 17 else (ped if bar < 25 else ped_full)
    pt.add(II.t(bar), II.d(4) + 0.02, ped_pitch(ch), 90)
    for e in range(8):
        tick.add(II.t(bar, e * 0.5), 0.05, 60, 80 + bar // 2 + (8 if e % 4 == 0 else 0), tock=e % 2 == 1)

# supersaw pad under everything (quiet gloss)
prev = None
for bar in range(1, 33, 2):
    ch = II_h[bar - 1]
    prev = voicing(ch, [(64, 72), (57, 65), (50, 57)], prev)
    for p in prev:
        pad.add(II.t(bar), II.d(8), p, 70)

# piano octave bass booms (bars 17-32)
for bar in range(17, 33):
    ch = II_h[bar - 1]
    b = ped_pitch(ch) - 12
    for beat, v in [(0, 100), (2.5, 80)] if bar % 2 else [(0, 95), (1.5, 75), (3, 80)]:
        piano.add(II.t(bar, beat), II.d(1.5), b, v)
        piano.add(II.t(bar, beat), II.d(1.5), b + 12, v - 10)

# low string spiccato pulse (bars 9-32) – 3+3+2 accents
acc = [104, 58, 66, 98, 58, 66, 96, 70]
for bar in range(9, 33):
    ch = II_h[bar - 1]
    r = bass2(ch)
    for e in range(8):
        tt = II.t(bar, e * 0.5)
        spic_lo.add(hum(tt, 0.004), 0.16, r, hv(acc[e] - (12 if bar < 17 else 0), 3))
        spic_lo.add(hum(tt, 0.004), 0.16, r + 12, hv(acc[e] - (18 if bar < 17 else 6), 3))
    cb.add(II.t(bar) - 0.03, II.d(4) + 0.05, r, 90)
    sub.add(II.t(bar), II.d(4), r - 12, 100)
swell(cb, [(II.t(1), 60), (II.t(9), 60), (II.t(17), 85), (II.t(25), 105), (II.t(33), 120)])

# violins – long counter-melody (bars 9-16), then support, then theme (25-32)
cm = [(81, 8), (82, 4), (86, 4), (84, 8), (79, 4), (76, 4)]
beat = 0
for p, d in cm:
    t0 = II.t(9, beat)
    vln1.add(hum(t0), II.d(d) + 0.1, p, 82)
    vln2.add(hum(t0), II.d(d) + 0.1, p - 12, 78)
    beat += d
swell(vln1, [(II.t(1), 40), (II.t(9), 45), (II.t(11), 90), (II.t(13), 70), (II.t(15), 95), (II.t(17), 70)])
swell(vln2, [(II.t(1), 40), (II.t(9), 45), (II.t(11), 88), (II.t(13), 70), (II.t(15), 92), (II.t(17), 70)])
prev = None
for bar in range(17, 25, 2):
    ch = II_h[bar - 1]
    prev = voicing(ch, [(76, 84), (69, 76)], prev)
    vln1.add(II.t(bar), II.d(8) + 0.1, prev[0], 85)
    vln2.add(II.t(bar), II.d(8) + 0.1, prev[1], 82)
melody(vln1, II, 25, TH[7:], transpose=12, vel=100, time_scale=2.0, legato=1.02)
melody(vln2, II, 25, TH[7:], transpose=0, vel=96, time_scale=2.0, legato=1.02)
swell(vln1, [(II.t(17), 70), (II.t(24), 90), (II.t(25), 100), (II.t(33), 125)])
swell(vln2, [(II.t(17), 70), (II.t(24), 90), (II.t(25), 100), (II.t(33), 125)])

# violas / cellos sustain from 17
prev = None
for bar in range(17, 33):
    ch = II_h[bar - 1]
    prev = voicing(ch, [(57, 67), (45, 55)], prev)
    vla.add(II.t(bar) - 0.03, II.d(4) + 0.06, prev[0], 88)
    vc.add(II.t(bar) - 0.03, II.d(4) + 0.06, prev[1], 90)
    strL.add(II.t(bar) - 0.03, II.d(4) + 0.06, prev[0], 70)
    strL.add(II.t(bar) - 0.03, II.d(4) + 0.06, prev[1], 70)
swell(vla, [(II.t(1), 70), (II.t(17), 75), (II.t(33), 122)])
swell(vc, [(II.t(1), 60), (II.t(17), 80), (II.t(33), 122)])

# horns: soft pads (9-16) then the theme augmented (17-32)
for bar in range(9, 17, 2):
    ch = II_h[bar - 1]
    for p in voicing(ch, [(60, 67), (53, 60)]):
        hn_pad.add(II.t(bar), II.d(8) + 0.05, p, 72)
    swell(hn_pad, [(II.t(bar), 35), (II.t(bar + 1), 85), (II.t(bar + 2) - 0.1, 45)])
melody(hn, II, 17, TH[:7], transpose=0, vel=95, time_scale=2.0, legato=1.02)
melody(hn2, II, 17, TH[:7], transpose=-12, vel=85, time_scale=2.0, legato=1.02)
melody(hn, II, 25, TH[7:], transpose=-12, vel=110, time_scale=2.0, legato=1.02)
melody(hn2, II, 25, TH[7:], transpose=0, vel=108, time_scale=2.0, legato=1.02)
melody(tpt, II, 25, TH[7:], transpose=0, vel=100, time_scale=2.0, legato=1.02)
swell(hn, [(II.t(1), 90), (II.t(17), 85), (II.t(21), 105), (II.t(25), 110), (II.t(33), 127)])
swell(tpt, [(II.t(1), 80), (II.t(25), 80), (II.t(29), 105), (II.t(33), 127)])

# trombones / tuba from 21
for bar in range(21, 33):
    ch = II_h[bar - 1]
    r = bass2(ch)
    tbn.add(II.t(bar), II.d(4) + 0.05, r + 12 if r + 12 <= 55 else r, 90)
    tbn.add(II.t(bar), II.d(4) + 0.05, (r + 7) if r + 7 >= 43 else r + 19, 85)
    tuba.add(II.t(bar), II.d(4) + 0.05, r - 12 if r - 12 >= 28 else r, 95)
swell(tbn, [(II.t(1), 60), (II.t(21), 60), (II.t(25), 95), (II.t(33), 125)])
swell(tuba, [(II.t(1), 60), (II.t(21), 70), (II.t(33), 120)])

# choir
for bar in range(9, 17, 2):
    ch = II_h[bar - 1]
    for p in voicing(ch, [(67, 74), (60, 67)]):
        oohs.add(II.t(bar), II.d(8) + 0.1, p, 70)
swell(oohs, [(II.t(1), 30), (II.t(9), 40), (II.t(16), 70), (II.t(17), 50)])
prev = None
for bar in range(17, 33, 2):
    ch = II_h[bar - 1]
    prev = voicing(ch, [(69, 77), (62, 69), (55, 62), (48, 55)], prev)
    for p in prev:
        choir.add(II.t(bar), II.d(8) + 0.1, p, 90)
        choir2.add(II.t(bar), II.d(8) + 0.1, p, 80)
swell(choir, [(II.t(1), 50), (II.t(17), 55), (II.t(25), 95), (II.t(33), 127)])
swell(choir2, [(II.t(1), 50), (II.t(17), 55), (II.t(25), 90), (II.t(33), 120)])

# percussion
for bar in range(17, 33):
    for e, v in zip([0, 3, 6], [115, 95, 100]):
        taiko.add(hum(II.t(bar, e * 0.5), 0.004), 0.6, 36, hv(v - (10 if bar < 25 else 0)))
    if bar >= 25:
        for e in [1, 2, 4, 5, 7]:
            taiko.add(hum(II.t(bar, e * 0.5), 0.006), 0.4, 41, hv(60))
        if bar % 2 == 0:
            for s in range(4):
                taiko.add(II.t(bar, 3 + s * 0.25), 0.3, 48, hv(80 + s * 10))
    if bar % 2 == 1:
        bd_hit(II.t(bar), 100 if bar < 25 else 118)
        timp.add(II.t(bar), 1.0, ped_pitch(II_h[bar - 1]), 105)
timp_roll(II.t(24), II.t(25), 45, 40, 118)
cym_swell(II.t(17), 50, 95)
cym_swell(II.t(25), 52, 110)
crash(II.t(25), 118)
impact.add(II.t(25), 4.0, 60, 105, size=0.9)
# A-major tension bars 31-32
for bar in (31, 32):
    for p in [45, 52, 57, 61, 64]:
        trem.add(II.t(bar), II.d(4) + 0.05, p + 12, 100)
swell(trem, [(II.t(1), 40), (II.t(31), 40), (II.t(33), 127)])
timp_roll(II.t(31), II_end - 0.05, 45, 40, 124)
riser.add(II.t(29), II_end - II.t(29), 60, 100, f0=150, f1=9000)
cym_swell(II_end, 52, 118)
whoosh.add(II_end - 3.5, 3.5, 60, 110)

# ==================================================================
# III. ANDOCKEN – 112 bpm, 36 bars, hard cut at the end
# ==================================================================
III = Sec(II_end, 112)
III_b = (["Dm"] * 8 + ["Bbmaj7"] * 4 + ["Cadd9"] * 4 + ["Dm"] * 4 + ["Eb"] * 2 + ["Em7"] * 2 +
         ["Fmaj7"] * 2 + ["Gm6"] * 2 + ["Asus"] * 4 + ["Dm"] * 4)
OST = {
    "Dm": [74, 69, 76, 69, 77, 69, 76, 69], "Bbmaj7": [74, 69, 76, 69, 77, 69, 76, 69],
    "Cadd9": [74, 67, 76, 67, 77, 67, 76, 67], "Eb": [74, 70, 77, 70, 79, 70, 77, 70],
    "Em7": [74, 71, 76, 71, 79, 71, 76, 71], "Fmaj7": [74, 69, 76, 69, 77, 69, 76, 69],
    "Gm6": [74, 70, 76, 70, 79, 70, 76, 70], "Asus": [74, 69, 76, 69, 77, 69, 76, 69],
}
III_end = III.t(37)

big_hit(III.t(1), 1.3, 127)
for p in [50, 57, 62, 65, 69, 74]:
    org_chord.add(III.t(1), III.d(4), p, 100)
ped_full.add(III.t(1), III.d(4), 38, 100)
timp.add(III.t(1), 2.0, 38, 120)
for p in [38, 45, 50]:
    braam.add(III.t(1), III.d(3), p, 110)

for bar in range(1, 37):
    ch = III_b[bar - 1]
    b = bass2(ch)
    ost = OST[ch]
    for e in range(8):
        tt = III.t(bar, e * 0.5)
        org_main.add(tt, III.d(0.5) * 0.96, ost[e], 95)
        if bar >= 25:
            org_full.add(tt, III.d(0.5) * 0.96, ost[e] + (12 if bar >= 29 else 0), 95)
        if bar >= 25:
            for s in range(2):
                spic_hi.add(III.t(bar, e * 0.5 + s * 0.25), 0.12, ost[e] + 12,
                            hv(70 + (20 if s == 0 else 0) + (bar - 25) * 2, 3))
        if bar <= 32:   # the clock: 8ths, then 16ths when it gets desperate
            sub_div = 2 if bar >= 29 else 1
            for s in range(sub_div):
                tick.add(III.t(bar, e * 0.5 + s * 0.25), 0.05, 60,
                         min(127, 78 + bar + (10 if e % 2 == 0 and s == 0 else 0)), tock=(e + s) % 2 == 1)
    for q in range(4):
        org_lh.add(III.t(bar, q), III.d(1) * 0.9, b + 12, 80 if bar < 17 else 95)
        pt = ped_soft if bar < 9 else (ped if bar < 25 else ped_full)
        pt.add(III.t(bar, q), III.d(1) * 0.85, 36 + CH[ch][0], 95)
    if bar >= 9:
        for e in range(8):
            tt = III.t(bar, e * 0.5)
            spic_lo.add(hum(tt, 0.003), 0.14, b, hv(acc[e] - (10 if bar < 17 else 0), 3))
            spic_lo.add(hum(tt, 0.003), 0.14, b + 12, hv(acc[e] - (14 if bar < 17 else 2), 3))
        sub.add(III.t(bar), III.d(4), b - 12, 105)

# organ swell: soft -> full is done in the mix via gain automation
# low tremolo strings bars 1-24
for bar in range(1, 25):
    b = bass2(III_b[bar - 1])
    trem.add(III.t(bar), III.d(4) + 0.03, b, 90)
    trem.add(III.t(bar), III.d(4) + 0.03, b + 12, 85)
swell(trem, [(III.t(1), 30), (III.t(1) + 0.01, 30), (III.t(9), 60), (III.t(17), 85), (III.t(25), 110)])
for bar in range(1, 37):
    b = bass2(III_b[bar - 1])
    cb.add(III.t(bar) - 0.02, III.d(4) + 0.04, b, 95)
swell(cb, [(III.t(1), 50), (III.t(9), 75), (III.t(25), 110), (III.t(33), 127)])

# horns: 2-bar swells (9-24) then theme fragment (25-32) then fanfare in trumpets (33-36)
for bar in range(9, 25, 2):
    ch = III_b[bar - 1]
    b = bass2(ch)
    for p in [b + 12, b + 19]:
        p = p if p <= 72 else p - 12
        hn_pad.add(III.t(bar), III.d(8) - 0.05, p, 95)
    swell(hn_pad, [(III.t(bar), 30), (III.t(bar + 1, 2), 115), (III.t(bar + 2) - 0.08, 40)])
frag = [(65, 4), (64, 4), (62, 4), (69, 4), (67, 4), (65, 4), (64, 8)]
melody(hn, III, 25, frag, vel=112, legato=1.01)
melody(hn2, III, 25, frag, transpose=-12, vel=110, legato=1.01)
swell(hn, [(III.t(1), 100), (III.t(25), 105), (III.t(33), 127)])
fan = [(77, 4), (76, 4), (74, 4), (81, 4)]
melody(tpt, III, 33, fan, vel=120, legato=1.0)
melody(hn, III, 33, fan, transpose=-12, vel=120, legato=1.0)
melody(hn2, III, 33, fan, transpose=-12, vel=120, legato=1.0)
melody(vln1, III, 33, fan, transpose=12, vel=115, legato=1.0)
melody(vln2, III, 33, fan, transpose=0, vel=112, legato=1.0)
# trumpet stabs, bars 29-32 on the dominant
for bar in range(29, 33):
    for e, v in zip([0, 3, 6], [120, 105, 112]):
        for p in (69, 76):
            tpt_st.add(III.t(bar, e * 0.5), III.d(0.4), p, v)
swell(tpt, [(III.t(1), 110), (III.t(33), 127)])

# violins: chromatic climb (17-32)
climb = {17: 81, 21: 82, 23: 83, 25: 84, 27: 86, 29: 88}
for bar, p in climb.items():
    nb = {17: 4, 21: 2, 23: 2, 25: 2, 27: 2, 29: 4}[bar]
    vln1.add(III.t(bar), III.d(4 * nb) + 0.05, p, 100)
    vln2.add(III.t(bar), III.d(4 * nb) + 0.05, p - 12, 96)
swell(vln1, [(III.t(1), 60), (III.t(17), 55), (III.t(33), 127)])
swell(vln2, [(III.t(1), 60), (III.t(17), 55), (III.t(33), 127)])
prev = None
for bar in range(17, 37):
    ch = III_b[bar - 1]
    prev = voicing(ch, [(57, 67), (45, 55)], prev)
    vla.add(III.t(bar) - 0.02, III.d(4) + 0.04, prev[0], 95)
    vc.add(III.t(bar) - 0.02, III.d(4) + 0.04, prev[1], 95)
swell(vla, [(III.t(1), 60), (III.t(17), 70), (III.t(33), 127)])
swell(vc, [(III.t(1), 60), (III.t(17), 75), (III.t(33), 127)])

# choir (17-36)
prev = None
for bar in range(17, 37, 2):
    ch = III_b[bar - 1]
    prev = voicing(ch, [(69, 79), (62, 70), (55, 62), (48, 55)], prev)
    for p in prev:
        choir.add(III.t(bar), III.d(8) + 0.05, p, 100)
        choir2.add(III.t(bar), III.d(8) + 0.05, p, 90)
swell(choir, [(III.t(1), 40), (III.t(17), 45), (III.t(25), 90), (III.t(33), 127)])
swell(choir2, [(III.t(1), 40), (III.t(17), 45), (III.t(25), 85), (III.t(33), 122)])

# low brass (17-36)
for bar in range(17, 37):
    b = bass2(III_b[bar - 1])
    tbn.add(III.t(bar), III.d(4) + 0.04, b + 12 if b + 12 <= 55 else b, 100)
    tbn.add(III.t(bar), III.d(4) + 0.04, b + 7 if b + 7 >= 43 else b + 19, 95)
    btb.add(III.t(bar), III.d(4) + 0.04, b, 100)
    tuba.add(III.t(bar), III.d(4) + 0.04, b - 12 if b - 12 >= 28 else b, 100)
swell(tbn, [(III.t(1), 50), (III.t(17), 55), (III.t(25), 100), (III.t(33), 127)])
swell(btb, [(III.t(1), 50), (III.t(17), 55), (III.t(25), 100), (III.t(33), 127)])
swell(tuba, [(III.t(1), 50), (III.t(17), 60), (III.t(33), 127)])

for bar in (17, 21, 25, 29, 33):
    b = bass2(III_b[bar - 1])
    for p in (b, b + 7):
        braam.add(III.t(bar), III.d(6), p, 118)

# percussion
for bar in range(2, 37):
    if bar < 9:
        if bar % 2 == 1:
            taiko.add(III.t(bar), 0.6, 36, 80)
        continue
    if bar < 17:
        for e, v in zip([0, 3, 6], [110, 88, 95]):
            taiko.add(hum(III.t(bar, e * 0.5), 0.004), 0.6, 36, hv(v))
    elif bar < 25:
        for e in range(8):
            v = [118, 55, 70, 105, 55, 70, 108, 75][e]
            taiko.add(hum(III.t(bar, e * 0.5), 0.004), 0.5, 36 if v > 90 else 41, hv(v))
    else:
        for s in range(16):
            v = [124, 50, 62, 98, 55, 60, 110, 52, 118, 50, 62, 100, 58, 72, 108, 85][s]
            taiko.add(hum(III.t(bar, s * 0.25), 0.003), 0.4, 36 if v > 95 else (41 if v > 60 else 48), hv(v, 3))
    if bar % 4 == 1:
        bd_hit(III.t(bar), 110)
for bar in (12, 16, 20, 24):
    timp_roll(III.t(bar, 2), III.t(bar + 1) - 0.03, 38 + (CH[III_b[bar]][0] - 2) % 12, 40, 115)
for bar in range(29, 33):
    for e in range(8):
        timp.add(III.t(bar, e * 0.5), 0.5, 45, hv(95 + e * 3 + (bar - 29) * 4))
for bar in range(33, 37):
    for q in range(4):
        timp.add(III.t(bar, q), 0.6, 38, 118 if q == 0 else 100)
for bar in (9, 17, 25):
    cym_swell(III.t(bar), 50, 90 + bar)
    crash(III.t(bar), 95 + bar)
    impact.add(III.t(bar), 4.0, 60, 90 + bar, size=0.8 + bar / 40)
riser.add(III.t(17), III.t(33) - III.t(17), 60, 110, f0=120, f1=10000)
cym_swell(III.t(33), 52, 125)
whoosh.add(III.t(33) - 4.0, 4.0, 60, 115)
timp_roll(III.t(32), III.t(33) - 0.03, 45, 60, 127)
big_hit(III.t(33), 1.5, 127)

# climax: sustained full organ + choir on D minor, bars 33-36
for p in [50, 57, 62, 65, 69, 74, 77, 81]:
    org_chord.add(III.t(33), III_end - III.t(33), p, 100)
for bar in range(33, 37):
    for p in [74, 77, 81]:
        choir_mel.add(III.t(bar), III.d(4) + 0.02, p, 110)
swell(choir_mel, [(III.t(1), 110)])

# ==================================================================
# IV. ZEIT – 62 bpm, 5 cycles of 8 bars
# ==================================================================
IV = Sec(III_end + 3.2, 62)
IV_h = H_MIN * 4 + H_MAJ
IV_end = IV.t(41)

# heartbeat (cycles 1-2)
for bar in range(1, 17):
    for beat in (0, 2):
        heart.add(IV.t(bar, beat), 0.5, 40, 60 + bar * 2)
atmos.add(IV.t(1) - 2, IV.t(17) - IV.t(1) + 6, n("D3"), 60, att=5.0, rel=6.0)

# cycle 1: piano alone – rolled low chord + the Zeit-Motiv
for bar in range(1, 41):
    ch = IV_h[bar - 1]
    arp = LH_ARP[ch]
    cyc = (bar - 1) // 8 + 1
    if cyc == 1:
        for i, p in enumerate(arp[:4]):
            piano.add(hum(IV.t(bar) + i * 0.07, 0.01), IV.d(4) + 0.4, p, hv(48 - i * 3, 3))
        for p, o, d in M2[(bar - 1) % 8]:
            piano.add(hum(IV.t(bar, o), 0.02), IV.d(d) + 0.5, p - 12 if p > 84 else p, hv(58, 4))
    elif cyc in (2, 3):
        for i, kk in enumerate([0, 1, 2, 3, 4, 3, 2, 1]):
            piano.add(hum(IV.t(bar, i * 0.5), 0.01), IV.d(4 - i * 0.5) + 0.3, arp[kk],
                      hv(44 + (8 if i == 0 else 0) + cyc * 2, 3))
    else:
        b = ped_pitch(ch) - 12
        for beat, v in [(0, 110), (2.5, 85)]:
            piano.add(IV.t(bar, beat), IV.d(1.5), b, v)
            piano.add(IV.t(bar, beat), IV.d(1.5), b + 12, v - 8)

# cycle 2: strings enter, cellos sing theme H, oohs, soft organ
prev = None
for bar in range(9, 41):
    ch = IV_h[bar - 1]
    b = bass2(ch)
    prev = voicing(ch, [(64, 72), (57, 65)], prev)
    t0, d = IV.t(bar) - 0.04, IV.d(4) + 0.08
    vla.add(t0, d, prev[1], 85)
    cb.add(t0, d, b, 90)
    if bar >= 17:
        vc.add(t0, d, b + 12 if b + 12 <= 52 else b, 90)
        strL.add(t0, d, prev[0], 75)
        strL.add(t0, d, prev[1], 75)
    if bar < 25:
        vln2.add(t0, d, prev[0], 80)
swell(vla, [(IV.t(1), 30), (IV.t(9), 40), (IV.t(16), 75), (IV.t(17), 70), (IV.t(33), 115), (IV.t(41), 127)])
swell(cb, [(IV.t(1), 40), (IV.t(9), 50), (IV.t(17), 80), (IV.t(33), 115), (IV.t(41), 127)])
swell(vc, [(IV.t(1), 60), (IV.t(17), 85), (IV.t(33), 120)])
swell(vln2, [(IV.t(1), 30), (IV.t(9), 40), (IV.t(16), 72), (IV.t(17), 75), (IV.t(25), 100)])
melody(vc_mel, IV, 9, TH, transpose=-12, vel=92, legato=1.06)
swell(vc_mel, [(IV.t(1), 70), (IV.t(9), 75), (IV.t(12), 100), (IV.t(13), 85), (IV.t(16), 105), (IV.t(17), 80)])
prev = None
for bar in range(9, 25):
    ch = IV_h[bar - 1]
    prev = voicing(ch, [(62, 70), (55, 63), (50, 57)], prev)
    for p in prev:
        org_soft.add(IV.t(bar), IV.d(4) + 0.03, p, 80)
    ped_soft.add(IV.t(bar), IV.d(4) + 0.02, ped_pitch(ch), 85)
for bar in range(9, 25):
    ch = IV_h[bar - 1]
    for p in voicing(ch, [(64, 72), (57, 64)]):
        oohs.add(IV.t(bar), IV.d(4) + 0.1, p, 70)
swell(oohs, [(IV.t(1), 30), (IV.t(9), 40), (IV.t(16), 80), (IV.t(24), 95), (IV.t(25), 60)])

# cycle 3: horns take theme H, violins the Zeit-Motiv, drums + pulse
melody(hn, IV, 17, TH, transpose=-12, vel=100, legato=1.03)
melody(hn2, IV, 17, TH, transpose=0, vel=96, legato=1.03)
swell(hn, [(IV.t(1), 100), (IV.t(17), 90), (IV.t(24), 110), (IV.t(25), 115)])
for bar in range(17, 25):
    for p, o, d in M2[(bar - 1) % 8]:
        vln1.add(hum(IV.t(bar, o)), IV.d(d) + 0.08, p, 92)
swell(vln1, [(IV.t(1), 60), (IV.t(17), 75), (IV.t(24), 100), (IV.t(25), 105)])
groove3 = {0: 112, 6: 92, 8: 104, 14: 88}
groove3_hi = {4: 70, 12: 74}
for bar in range(17, 41):
    ch = IV_h[bar - 1]
    b = bass2(ch)
    for s, v in groove3.items():
        taiko.add(hum(IV.t(bar, s * 0.25), 0.004), 0.7, 36, hv(v + (6 if bar >= 25 else 0)))
    for s, v in groove3_hi.items():
        taiko.add(hum(IV.t(bar, s * 0.25), 0.004), 0.5, 48, hv(v))
    if bar >= 25:
        for s in range(16):
            if s not in groove3 and s not in groove3_hi:
                taiko.add(hum(IV.t(bar, s * 0.25), 0.004), 0.3, 55, hv(42 + (s % 4 == 3) * 20, 5))
    timp.add(IV.t(bar), 1.5, ped_pitch(ch), 100 if bar < 25 else 118)
    for e in range(8):
        v = [100, 55, 70, 90, 60, 70, 92, 66][e] + (8 if bar >= 25 else 0)
        spic_lo.add(hum(IV.t(bar, e * 0.5), 0.004), 0.22, b, hv(min(127, v)))
        spic_lo.add(hum(IV.t(bar, e * 0.5), 0.004), 0.22, b + 12, hv(min(127, v - 8)))
    sub.add(IV.t(bar), IV.d(4), b - 12, 105)
    if bar % 2 == 1:
        bd_hit(IV.t(bar), 105 if bar < 25 else 120)
prev = None
for bar in range(17, 41, 2):
    ch = IV_h[bar - 1]
    prev = voicing(ch, [(64, 72), (57, 65), (50, 57)], prev)
    for p in prev:
        pad.add(IV.t(bar), IV.d(8), p, 75)
for bar in range(17, 25):
    ch = IV_h[bar - 1]
    for p in voicing(ch, [(64, 71), (57, 64), (50, 57)]):
        org_main.add(IV.t(bar), IV.d(4) + 0.03, p, 80)
    ped.add(IV.t(bar), IV.d(4) + 0.02, ped_pitch(ch), 90)
cym_swell(IV.t(17), 50, 90)
impact.add(IV.t(17), 4.0, 60, 85, size=0.8)

# cycle 4: tutti in minor – trumpets & violins theme, horns the motif
riser.add(IV.t(23), IV.t(25) - IV.t(23), 60, 90, f0=200, f1=8000)
cym_swell(IV.t(25), 52, 115)
big_hit(IV.t(25), 1.2, 120)
for p in (38, 45):
    braam.add(IV.t(25), IV.d(6), p, 115)
melody(tpt, IV, 25, TH, transpose=0, vel=112, legato=1.02)
melody(vln1, IV, 25, TH, transpose=12, vel=110, legato=1.03)
melody(vln2, IV, 25, TH, transpose=0, vel=105, legato=1.03)
melody(choir_mel, IV, 25, TH, transpose=0, vel=100, legato=1.03)
for bar in range(25, 33):
    for p, o, d in M2[(bar - 1) % 8]:
        hn.add(hum(IV.t(bar, o)), IV.d(d) + 0.05, p - 12 if p - 12 <= 72 else p - 24, 108)
        hn2.add(hum(IV.t(bar, o)), IV.d(d) + 0.05, p - 12, 104)
    ch = IV_h[bar - 1]
    arp = [x + 24 for x in LH_ARP[ch]]
    for s, kk in enumerate([0, 1, 2, 3, 4, 3, 2, 1] * 2):
        spic_hi.add(hum(IV.t(bar, s * 0.25), 0.003), 0.12, arp[kk], hv(66 + (16 if s % 4 == 0 else 0), 3))
swell(tpt, [(IV.t(1), 100), (IV.t(25), 100), (IV.t(32), 118), (IV.t(33), 125)])
swell(choir_mel, [(IV.t(1), 95), (IV.t(25), 95), (IV.t(33), 120)])
for bar in range(25, 41):
    ch = IV_h[bar - 1]
    b = bass2(ch)
    tbn.add(IV.t(bar), IV.d(4) + 0.04, b + 12 if b + 12 <= 55 else b, 100)
    tbn.add(IV.t(bar), IV.d(4) + 0.04, b + 7 if b + 7 >= 43 else b + 19, 95)
    btb.add(IV.t(bar), IV.d(4) + 0.04, b, 100)
    tuba.add(IV.t(bar), IV.d(4) + 0.04, b - 12 if b - 12 >= 28 else b, 100)
    for p in voicing(ch, [(62, 70), (57, 64), (50, 57), (45, 50)]):
        org_chord.add(IV.t(bar), IV.d(4) + 0.03, p, 95)
    ped_full.add(IV.t(bar), IV.d(4) + 0.02, ped_pitch(ch), 95)
swell(tbn, [(IV.t(1), 80), (IV.t(25), 85), (IV.t(33), 118), (IV.t(41), 127)])
swell(btb, [(IV.t(1), 80), (IV.t(25), 85), (IV.t(33), 118), (IV.t(41), 127)])
swell(tuba, [(IV.t(1), 80), (IV.t(25), 90), (IV.t(41), 127)])
prev = None
for bar in range(25, 41, 2):
    ch = IV_h[bar - 1]
    prev = voicing(ch, [(62, 69), (55, 62), (48, 55)], prev)
    for p in prev:
        choir.add(IV.t(bar), IV.d(8) + 0.05, p, 100)
        choir2.add(IV.t(bar), IV.d(8) + 0.05, p, 95)
swell(choir, [(IV.t(1), 80), (IV.t(25), 85), (IV.t(33), 122)])
swell(choir2, [(IV.t(1), 80), (IV.t(25), 85), (IV.t(33), 118)])
cym_swell(IV.t(29), 48, 100)
crash(IV.t(29), 105)

# the lift into D major
riser.add(IV.t(31), IV.t(33) - IV.t(31), 60, 120, f0=150, f1=10000)
whoosh.add(IV.t(33) - 3.5, 3.5, 60, 118)
cym_swell(IV.t(33), 52, 125)
timp_roll(IV.t(32), IV.t(33) - 0.03, 45, 50, 127)
for p in [57, 61, 64, 69]:
    trem.add(IV.t(32), IV.d(4), p, 110)
swell(trem, [(IV.t(1), 50), (IV.t(32), 50), (IV.t(33), 127)])
big_hit(IV.t(33), 1.6, 127)

# cycle 5: D MAJOR – everything sings
melody(tpt, IV, 33, TM, transpose=0, vel=122, legato=1.02)
melody(vln1, IV, 33, TM, transpose=12, vel=120, legato=1.03)
melody(choir_mel, IV, 33, TM, transpose=0, vel=118, legato=1.03)
melody(hn2, IV, 33, TM, transpose=-12, vel=118, legato=1.03)
for bar in range(33, 41):
    for p, o, d in M2_MAJ[(bar - 1) % 8]:
        vln2.add(hum(IV.t(bar, o)), IV.d(d) + 0.05, p - 12, 110)
        hn.add(hum(IV.t(bar, o)), IV.d(d) + 0.05, p - 12 if p - 12 <= 72 else p - 24, 118)
    ch = IV_h[bar - 1]
    arp = [x + 24 for x in LH_ARP[ch]]
    for s, kk in enumerate([0, 1, 2, 3, 4, 3, 2, 1] * 2):
        spic_hi.add(hum(IV.t(bar, s * 0.25), 0.003), 0.12, arp[kk], hv(74 + (16 if s % 4 == 0 else 0), 3))
    chimes.add(IV.t(bar), 3.0, 62 + CH[ch][0] - 2 if CH[ch][0] >= 2 else 74 + CH[ch][0] - 2, 100)
    gt = [p for p in range(74, 92) if p % 12 in CH[ch][1]]
    gseq = [gt[0], gt[2], gt[1], gt[3], gt[2], gt[1], gt[0], gt[1]]
    for s in range(8):
        glock.add(IV.t(bar, s * 0.5), 0.5, gseq[s], hv(62))
    if bar % 2 == 1 and bar > 33:
        crash(IV.t(bar), 100)
swell(vln1, [(IV.t(25), 105), (IV.t(33), 118), (IV.t(41), 127)])
swell(vln2, [(IV.t(25), 100), (IV.t(33), 115)])
swell(hn, [(IV.t(25), 115), (IV.t(33), 125)])

# ==================================================================
# V. TESSERAKT – coda
# ==================================================================
V = Sec(IV_end, 62)
# the final button: tutti D-major hit, then only the memory remains
big_hit(V.t(1), 1.8, 127)
for tr, ps, v in [(tpt, [74, 78, 81], 118), (hn, [62, 66, 69], 118), (tbn, [50, 57], 115),
                  (tuba, [38], 115), (choir, [62, 66, 69, 74], 118), (vln1, [86, 90], 115),
                  (vln2, [74, 78], 112), (vla, [62, 66], 112), (vc, [50, 57], 115),
                  (cb, [38], 115), (org_chord, [50, 57, 62, 66, 69, 74, 78], 100),
                  (ped_full, [38], 100), (timp, [38], 127)]:
    for p in ps:
        tr.add(V.t(1), V.d(2.5), p, v)
for p in [50, 57, 62, 66, 69]:
    org_soft.add(V.t(1, 2), V.t(11) - V.t(1, 2), p, 85)
ped_soft.add(V.t(1, 2), V.t(11) - V.t(1, 2), 38, 85)
for p in [62, 66, 69, 74]:
    oohs.add(V.t(2), V.t(10) - V.t(2), p, 70)
swell(oohs, [(V.t(1), 20), (V.t(2), 20), (V.t(4), 60), (V.t(8), 55), (V.t(10), 5)])
for p in [86, 93]:
    vln1.add(V.t(2), V.t(10) - V.t(2), p, 60)
swell(vln1, [(V.t(1, 3), 20), (V.t(3), 45), (V.t(8), 40), (V.t(10), 5)])
atmos.add(V.t(1), V.t(11) - V.t(1) + 4, n("D3"), 70, att=4.0, rel=7.0)
# piano remembers the theme – major, slower, rubato
beat = 0.0
for p, d in TM[:7]:
    tt = V.t(2, beat * 1.0)
    piano.add(hum(tt, 0.03), V.d(d) + 0.8, p + 12, hv(52, 3))
    beat += d
for bar, ch in zip(range(2, 6), ["D", "Bm7", "Gmaj7", "A"]):
    for i, p in enumerate(LH_ARP[ch][:4]):
        piano.add(V.t(bar) + i * 0.09, V.d(4) + 0.5, p, hv(40, 3))
for i, p in enumerate([38, 45, 50, 54, 57, 62, 66, 69]):
    piano.add(V.t(6) + i * 0.11, V.d(12), p, hv(42 - i, 2))
for i, p in enumerate([86, 93, 98]):
    celesta.add(V.t(6, 2) + i * 0.35, 4.0, p, 40)
# the clock comes back and runs down
tt = V.t(3)
gap = 60 / 62
k = 0
while gap < 3.2 and tt < V.t(11):
    tick.add(tt, 0.05, 60, max(40, 88 - k * 3), tock=k % 2 == 1)
    tt += gap
    gap *= 1.09
    k += 1
FINAL_TOCK = tt + 1.8
tick.add(FINAL_TOCK, 0.05, 60, 70, tock=True)

END = FINAL_TOCK + 7.0
SECTIONS = {"I": I.t0, "II": II.t0, "III": III.t0, "IV": IV.t0, "V": V.t0, "END": END,
            "III_end": III_end, "IV_c3": IV.t(17), "IV_c4": IV.t(25), "IV_c5": IV.t(33)}
