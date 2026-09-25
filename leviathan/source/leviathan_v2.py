"""
LEVIATHAN (V2 – The Colossus Awakens)
12/8 march, dotted quarter = 120 (bar = 2.0 s). D phrygian, power fifths & octaves.
Phase 1 (0:00-1:00)  dark basses, dragging timpani, threatening horn swells
Phase 2 (1:00-2:00)  relentless staccato string ostinato, snare rolls, heavy bass drum
Phase 3 (2:00-3:15)  the colossus breaks out: horn fanfare, choir & high strings, cymbals
Phase 4 (3:15-end)   one brutal crescendo-hit, then a deep sub rumble in the ocean
Rule: no chaos. Contrast and weight, not note count.
"""
import numpy as np
from studio import Score, SSO, MSG, AEG
from cutil import Sec, hum, hv, CH, root, tones, voicing, melody, swell, pad, rng

S = Score()


def sf2(name, sfp, prog, bank=0):
    return S.track(name, "sf2", sf=sfp, prog=prog, bank=bank)


def shot(name, sfp, prog, bank=0, hold=0.07, decay=0.07, punch=1.7):
    return S.track(name, "oneshot", sf=sfp, prog=prog, bank=bank, hold=hold, decay=decay, punch=punch)


cb = sf2("cb", AEG, 43, 40)
vc = sf2("vc", AEG, 42, 40)
trem_lo = sf2("trem_lo", AEG, 43, 67)
cbsn = sf2("cbsn", AEG, 70, 100)
hn_swell = sf2("hn_swell", AEG, 60, 40)
hn = sf2("hn", AEG, 60, 40)
hn2 = sf2("hn2", AEG, 60, 40)
tbn = sf2("tbn", AEG, 57, 40)
btbn = sf2("btbn", AEG, 57, 99)
tuba = sf2("tuba", AEG, 58)
tpt = sf2("tpt", AEG, 56, 40)
choir = sf2("choir", AEG, 52)
choirM = sf2("choirM", AEG, 52, 42)
vln_hi = sf2("vln_hi", AEG, 40, 40)
trem = sf2("trem", AEG, 40, 67)
timp = sf2("timp", AEG, 47)
timp_roll = sf2("timp_roll", AEG, 47, 66)
kit = sf2("kit", AEG, 48, 128)
snare = sf2("snare", AEG, 48, 128)
bd = sf2("bd", SSO, 37)
cym = sf2("cym", SSO, 38)
taiko = sf2("taiko", MSG, 116)
pizz = sf2("pizz", AEG, 42, 65)
stac_lo = shot("stac_lo", AEG, 42, 40, hold=0.08, decay=0.07)       # cellos
stac_va = shot("stac_va", AEG, 43, 40, hold=0.09, decay=0.08)       # basses
stac_hi = shot("stac_hi", AEG, 48, 0, hold=0.06, decay=0.06)        # string ensemble, high
brass_st = shot("brass_st", AEG, 61, 0, hold=0.12, decay=0.12, punch=1.4)

sea = S.track("sea", "sea")
thunder = S.track("thunder", "thunder")
gong = S.track("gong", "gong")
impact = S.track("impact", "impact")
riser = S.track("riser", "riser")
whoosh = S.track("whoosh", "whoosh")
sub = S.track("sub", "subv2")

NB = 112
A = Sec(1.0, 6, NB, 180)          # quarter = 180  <=> dotted quarter = 120
D2, A2 = 38, 45
# ------------------------------------------------------------------ harmony (bar -> (1st half, 2nd half))
H = {}
for b in range(1, 31):
    H[b] = "D5"
for b in (13, 14, 21, 22):
    H[b] = "Eb5"
H.update({25: "Bb5", 26: "Bb5", 27: "C5", 28: "C5"})
LOOP = ["D5", "D5", "Eb5", "D5", "D5", "C5", "Bb5", "A5"]
for i, b in enumerate(range(31, 55)):
    H[b] = LOOP[i % 8]
H.update({55: "Bb5", 56: "Bb5", 57: "C5", 58: "C5", 59: "A5", 60: "A5"})
FH = ["D5", "D5", "Bb5", "Eb5|D5", "D5", "Eb5", "Bb5", "Bb5|A5"]
for i, b in enumerate(range(61, 77)):
    H[b] = FH[i % 8]
for i, ch in enumerate(["Bb5", "Bb5", "C5", "C5", "Bb5", "Bb5", "A5", "A5"]):
    H[77 + i] = ch
for i, b in enumerate(range(85, 93)):
    H[b] = FH[i]
for b in range(93, 97):
    H[b] = "D5"
H.update({97: "A5", 98: "A5"})
for b in range(99, NB + 1):
    H[b] = "D5"


def half(b, e):
    """chord at eighth e (0..11) of bar b"""
    h = H[b]
    if "|" in h:
        a, c = h.split("|")
        return a if e < 6 else c
    return h


def rt(ch, lo=36):
    return root(ch, lo)


def crash(t, v=112):
    kit.add(t, 3.0, 57, v)
    cym.add(t + 0.004, 4.0, 55, int(v * 0.85))


def cym_swell(t_peak, key=50, v=100):
    lead = {48: 2.02, 50: 3.16, 52: 3.16}[key]
    cym.add(t_peak - lead, lead + 4.0, key, v)


def troll(t0, t1, pitch, v0=40, v1=115):
    timp_roll.add(t0, t1 - t0, pitch, 100)
    timp_roll.curve(11, [(t0 - 0.02, 30), (t0, int(20 + v0 * 0.6)), (t1, int(min(127, 30 + v1 * 0.8))),
                         (t1 + 0.05, 90)])


def sroll(t0, t1, v0=35, v1=120, rate=0.042):
    k = int((t1 - t0) / rate)
    for i in range(k):
        a = i / max(1, k - 1)
        snare.add(t0 + i * rate + rng.normal(0, 0.003), 0.1, 38, hv(v0 + (v1 - v0) * a ** 1.4, 4))


def e8(b, e):
    return A.t(b, e * 0.5)


# ================================================================== PHASE 1 (bars 1-30)
sea.add(0.0, A.t(31) + 2.0, 60, 95, rough=0.3)
thunder.add(1.5, 6.0, 60, 70, size=1.4)
thunder.add(A.t(13), 6.0, 60, 85, size=1.5)
thunder.add(A.t(25) + 0.5, 6.0, 60, 95, size=1.6)
for b in range(1, 31):
    ch = H[b]
    r = rt(ch, 26)
    t0, d = A.t(b) - 0.03, A.d(b, 0, 6) + 0.06
    cb.add(t0, d, r, 90)
    cb.add(t0, d, r + 12, 80)
    sub.add(A.t(b), A.d(b, 0, 6) + 0.05, r, 100, att=3.0 if b == 1 else 0.3, rel=0.6)
    if b >= 9:
        trem_lo.add(t0, d, r + 12, 90)
    if b >= 5:
        cbsn.add(t0, d, r, 80)
swell(cb, [(0, 30), (A.t(9), 60), (A.t(25), 90), (A.t(31), 110)])
swell(trem_lo, [(0, 20), (A.t(9), 25), (A.t(20), 70), (A.t(29), 95), (A.t(31), 118)])
swell(cbsn, [(0, 50), (A.t(5), 50), (A.t(31), 100)])
# dragging timpani
for b in range(1, 31):
    r = 38 if H[b] == "D5" else rt(H[b], 36) + 12 if rt(H[b], 36) + 12 <= 50 else rt(H[b], 36)
    if b < 9 and b % 2 == 1:
        timp.add(hum(A.t(b), 0.004), 2.0, r, hv(108))
        bd.add(A.t(b), 2.0, 48, 90)
    elif 9 <= b < 25:
        timp.add(hum(A.t(b), 0.004), 2.0, r, hv(112))
        if b % 4 == 1:
            bd.add(A.t(b), 2.0, 48, 100)
    elif b >= 25:
        for e in (0, 6):
            timp.add(hum(e8(b, e), 0.004), 1.2, r, hv(118 if e == 0 else 104))
    if b >= 17:
        taiko.add(hum(A.t(b), 0.004), 0.8, 32, hv(100))
troll(A.t(29), A.t(31) - 0.03, 38, 30, 124)
# threatening horn swells (power fifths)
for b in range(5, 31, 4):
    ch = H[b]
    r = rt(ch, 48)
    for p in (r, r + 7):
        hn_swell.add(A.t(b), A.d(b, 0, 18), p, 100)
    if b >= 17:
        for p in (r - 12, r - 5):
            tbn.add(A.t(b), A.d(b, 0, 18), p, 96)
pts = []
for b in range(5, 31, 4):
    pts += [(A.t(b), 25), (A.t(b + 2), 118 if b >= 17 else 100), (A.t(b + 3, 3), 30)]
swell(hn_swell, pts)
swell(tbn, [(A.t(1), 20)] + [(t_, max(20, v - 10)) for t_, v in pts if t_ >= A.t(17)])
# male choir humming from bar 23
for b in range(23, 61):
    ch = H[b]
    r = rt(ch, 48)
    choirM.add(A.t(b), A.d(b, 0, 6) + 0.05, r, 88)
    choirM.add(A.t(b), A.d(b, 0, 6) + 0.05, r + 7, 84)
swell(choirM, [(0, 20), (A.t(23), 20), (A.t(31), 70), (A.t(47), 90), (A.t(61), 110)])
riser.add(A.t(27), A.t(31) - A.t(27), 60, 90, f0=120, f1=8000, shepard=False)
cym_swell(A.t(31), 52, 110)

# ================================================================== PHASE 2 (bars 31-60)
impact.add(A.t(31), 4.0, 60, 110, size=1.2)
OST = [(0, 122), (1, 72), (2, 84), (3, 114), (5, 88), (6, 120), (7, 72), (8, 84), (9, 114), (11, 90)]


def ostinato(b, hi=False, level=0):
    for e, v in OST:
        ch = half(b, e)
        r = rt(ch, 38)
        p = r + (1 if (e == 11 and ch == "D5") else 0)      # phrygian neighbour Eb as pickup
        t = hum(e8(b, e), 0.004, 0.008)
        vv = min(127, v + level)
        stac_lo.add(t, 0.2, p + 12, hv(vv))
        stac_va.add(t, 0.2, p, hv(vv - 4))
        if e in (0, 3, 6, 9):
            pizz.add(t, 0.3, p + 12, hv(vv - 6))
        if hi:
            ph = tones(ch, 62, 74)
            hp_ = ph[0] if e % 2 == 0 else ph[-1]
            stac_hi.add(t, 0.2, hp_, hv(vv - 10))


for b in range(31, 99):
    ostinato(b, hi=b >= 39, level=-8 if b < 39 else (0 if b < 61 else 4))
    ch = half(b, 0)
    r = rt(ch, 26)
    for tr, p, v in ((cb, r, 100), (cb, r + 12, 95)):
        tr.add(A.t(b) - 0.02, A.d(b, 0, 6) + 0.04, p, v)
    sub.add(A.t(b), A.d(b, 0, 6) + 0.05, r, 105, att=0.15, rel=0.4)
swell(cb, [(A.t(31), 105), (A.t(61), 118), (A.t(99), 127)])
# percussion phase 2
for b in range(31, 61):
    for e, v, p in ((0, 124, 32), (3, 100, 45), (6, 118, 32), (9, 104, 45)):
        taiko.add(hum(e8(b, e), 0.004), 0.6, p, hv(v - (10 if b < 39 else 0)))
    if b >= 39:
        for e in (2, 5, 8, 11):
            taiko.add(hum(e8(b, e), 0.004), 0.3, 55, hv(58))
    for e in (0, 6):                                   # heavy bass drum on "1 and 4"
        bd.add(e8(b, e), 2.0, 48, 112 if e == 0 else 100)
        kit.add(e8(b, e), 2.0, 35, 110 if e == 0 else 96)
    if b >= 47:
        for e in (0, 6):
            timp.add(hum(e8(b, e), 0.004), 1.0, 38 if half(b, e) == "D5" else rt(half(b, e), 36) + 12 if rt(half(b, e), 36) + 12 <= 50 else rt(half(b, e), 36), hv(112))
    if b % 4 == 2 and b < 55:
        sroll(e8(b, 6), A.t(b + 1) - 0.02, 30, 112)
sroll(A.t(57), A.t(61) - 0.02, 25, 124, rate=0.04)
troll(A.t(59), A.t(61) - 0.03, 45, 50, 127)
# horns & trombones: sustained power chords with 2-bar swells (47-60)
for b in range(47, 61, 2):
    ch = H[b]
    r = rt(ch, 50)
    for p in (r, r + 7):
        hn2.add(A.t(b), A.d(b, 0, 12), p, 100)
    for p in (r - 12, r - 5):
        tbn.add(A.t(b), A.d(b, 0, 12), p, 100)
    tuba.add(A.t(b), A.d(b, 0, 12), r - 24 if r - 24 >= 26 else r - 12, 100)
swell(hn2, [(0, 40)] + sum([[(A.t(b), 50), (A.t(b + 1, 3), 110), (A.t(b + 2) - 0.05, 60)] for b in range(47, 61, 2)], []))
swell(tbn, [(A.t(33), 30), (A.t(47), 50)] + sum([[(A.t(b + 1, 3), 110), (A.t(b + 2) - 0.05, 60)] for b in range(47, 61, 2)], []))
swell(tuba, [(0, 60), (A.t(47), 80), (A.t(61), 110)])
riser.add(A.t(55), A.t(61) - A.t(55), 60, 110, f0=150, f1=10000)
whoosh.add(A.t(61) - 3.0, 3.0, 60, 105)
cym_swell(A.t(61), 52, 122)

# ================================================================== PHASE 3 (bars 61-98)
# fanfare in eighths (12 per bar)
F1 = [(69, 2), (69, 1), (69, 3), (74, 6), (72, 3), (70, 3), (69, 6), (70, 3), (69, 3), (67, 3), (65, 3),
      (63, 6), (62, 6)]
F2 = [(74, 2), (74, 1), (74, 3), (77, 6), (75, 3), (74, 3), (72, 6), (74, 3), (72, 3), (70, 3), (69, 3),
      (70, 6), (69, 6)]
FAN = F1 + F2
impact.add(A.t(61), 4.0, 60, 124, size=1.5)
gong.add(A.t(61), 8.0, 38, 118, size=1.2)
crash(A.t(61), 122)
# statement 1: horns (two octaves) + trombones unison
melody(hn, A, 61, FAN, unit=0.5, transpose=-12, vel=116, legato=1.0, sd=0.006)
melody(hn2, A, 61, FAN, unit=0.5, transpose=0, vel=104, legato=1.0, sd=0.006)
melody(tbn, A, 61, FAN, unit=0.5, transpose=-24, vel=112, legato=1.0, sd=0.006)
# statement 2: + trumpets, choir, high strings on top
melody(hn, A, 69, FAN, unit=0.5, transpose=-12, vel=122, legato=1.0, sd=0.006)
melody(hn2, A, 69, FAN, unit=0.5, transpose=0, vel=112, legato=1.0, sd=0.006)
melody(tbn, A, 69, FAN, unit=0.5, transpose=-24, vel=118, legato=1.0, sd=0.006)
melody(tpt, A, 69, FAN, unit=0.5, transpose=0, vel=110, legato=1.0, sd=0.006)
melody(vln_hi, A, 69, FAN, unit=0.5, transpose=12, vel=110, legato=1.02, sd=0.008)
for b in range(69, 99):
    ch = half(b, 0)
    for p in voicing(ch.replace("5", "5"), [(69, 77), (62, 69), (57, 62), (50, 57)]):
        choir.add(A.t(b), A.d(b, 0, 6) + 0.04, p, 104)
    r = rt(ch, 36)
    tuba.add(A.t(b), A.d(b, 0, 6) + 0.04, r - 12 if r - 12 >= 26 else r, 112)
    btbn.add(A.t(b), A.d(b, 0, 6) + 0.04, r, 110)
swell(choir, [(0, 60), (A.t(69), 85), (A.t(77), 100), (A.t(85), 115), (A.t(97), 124), (A.t(99), 127)])
swell(btbn, [(0, 90), (A.t(69), 95), (A.t(99), 127)])
# bridge (77-84): brass chorale on Bb - C - Bb - A, high strings tremolo, rising
for b in range(77, 85, 2):
    ch = H[b]
    r = rt(ch, 50)
    for p in (r, r + 7, r + 12):
        hn.add(A.t(b), A.d(b, 0, 12), p - 12, 118)
        hn2.add(A.t(b), A.d(b, 0, 12), p, 110)
    for p in (r - 12, r - 5):
        tbn.add(A.t(b), A.d(b, 0, 12), p, 116)
    for p in tones(ch, 74, 86):
        trem.add(A.t(b), A.d(b, 0, 12), p, 112)
    tpt.add(A.t(b), A.d(b, 0, 12), r + 12 if r + 12 <= 76 else r, 108)
for b in (78, 80, 82, 84):
    sroll(e8(b, 6), A.t(b + 1) - 0.02, 40, 118)
swell(trem, [(0, 40), (A.t(77), 70), (A.t(85), 120), (A.t(93), 110), (A.t(99), 127)])
# statement 3: everything, fff
for tr, tp_, v in ((hn, -12, 126), (hn2, 0, 120), (tbn, -24, 124), (tpt, 0, 122), (vln_hi, 12, 122),
                   (choir, 0, 118)):
    melody(tr, A, 85, FAN, unit=0.5, transpose=tp_, vel=v, legato=1.0, sd=0.006)
for tr in (hn, hn2, tbn, tpt):
    swell(tr, [(A.t(61) - 0.05, 110), (A.t(77), 116), (A.t(85), 124), (A.t(93), 127)])
swell(vln_hi, [(0, 80), (A.t(69), 100), (A.t(85), 118), (A.t(93), 127)])
# 93-98: hammer on D, then the approach
for b in range(93, 99):
    ch = H[b]
    r = rt(ch, 50)
    for e in (0, 3, 6, 9) if b < 97 else range(12):
        vv = 118 if b < 97 else 90 + (b - 97) * 12 + e * 2
        for p in (r - 12, r - 5, r, r + 7):
            brass_st.add(e8(b, e), 0.25, p, min(127, vv))
    for p in (r, r + 7, r + 12):
        vln_hi.add(A.t(b), A.d(b, 0, 6), p + 12, 118)
# percussion phase 3: timpani on every dotted beat ("1 and 4"), taiko groove, crashes
for b in range(61, 99):
    for e, v, p in ((0, 126, 32), (2, 60, 55), (3, 104, 45), (5, 64, 55), (6, 122, 32), (8, 60, 55),
                    (9, 108, 45), (11, 70, 55)):
        taiko.add(hum(e8(b, e), 0.004), 0.5, p, hv(v))
    for e in (0, 3, 6, 9):
        ch = half(b, e)
        tp = 38 if ch == "D5" else (rt(ch, 36) + 12 if rt(ch, 36) + 12 <= 50 else rt(ch, 36))
        timp.add(hum(e8(b, e), 0.004), 1.0, tp if e in (0, 6) else 45 if ch == "D5" else tp, hv(120 if e in (0, 6) else 104))
    for e in (0, 6):
        bd.add(e8(b, e), 2.0, 48, 118)
        kit.add(e8(b, e), 2.0, 35, 116)
    if b % 4 == 1:
        crash(A.t(b), 116)
for b in (69, 77, 85, 93):
    impact.add(A.t(b), 4.0, 60, 112, size=1.2)
    cym_swell(A.t(b), 50, 110)
sroll(A.t(97), A.t(99) - 0.02, 50, 127, rate=0.035)
troll(A.t(97), A.t(99) - 0.03, 45, 70, 127)
riser.add(A.t(95), A.t(99) - A.t(95), 60, 120, f0=200, f1=12000)
whoosh.add(A.t(99) - 3.5, 3.5, 60, 118)
cym_swell(A.t(99), 52, 126)

# ================================================================== PHASE 4 (bar 99 -> end)
HIT = A.t(99)
impact.add(HIT, 4.0, 60, 127, size=2.0)
gong.add(HIT, 9.0, 38, 127, size=1.6)
crash(HIT, 127)
bd.add(HIT, 3.0, 48, 127)
kit.add(HIT, 3.0, 35, 127)
timp.add(HIT, 3.0, 38, 127)
taiko.add(HIT, 1.0, 32, 127)
for tr, ps, v in ((hn, [50, 57, 62], 127), (hn2, [62, 69, 74], 124), (tbn, [38, 45, 50], 127),
                  (btbn, [38], 127), (tuba, [26], 127), (tpt, [62, 69, 74], 124), (choir, [50, 57, 62, 69, 74], 124),
                  (vln_hi, [74, 81, 86], 124), (cb, [26, 38], 127)):
    for p in ps:
        tr.add(HIT, A.d(99, 0, 4.5), p, v)
# the ocean swallows it: sub rumble, low tremolo basses, distant thunder
sub.add(HIT, A.t(NB + 1) - HIT + 2.0, 26, 118, att=0.05, rel=8.0)
sea.add(HIT + 1.0, A.t(NB + 1) - HIT + 6.0, 60, 110, rough=0.5)
trem_lo.add(HIT + 1.2, A.t(NB + 1) - HIT, 26, 90)
trem_lo.add(HIT + 1.2, A.t(NB + 1) - HIT, 38, 85)
swell(trem_lo, [(HIT, 60), (HIT + 1.2, 80), (A.t(106), 55), (A.t(NB + 1), 5)])
thunder.add(HIT + 4.0, 6.0, 60, 100, size=1.8)
thunder.add(HIT + 12.0, 6.0, 60, 70, size=1.8)
cbsn.add(HIT + 1.5, 10.0, 26, 70)

END = A.t(NB + 1) + 7.0
REVERB = (3.8, 2.4)
WET_SHARE = 0.30
MACRO = [(0, -8), (A.t(17), -7), (A.t(29), -5), (A.t(31), -4), (A.t(47), -2.5), (A.t(61), 0), (A.t(85), 1),
         (A.t(99), 1.5), (A.t(100), 0), (END, 0)]
MIX = {"cb": {"t": -21}, "sub": {"t": -22}, "trem_lo": {"t": -23}}
MARKS = [("I", "Grollen", 0.0), ("II", "Ostinato", A.t(31)), ("III", "Fanfare", A.t(61)),
         ("IV", "Tutti", A.t(85)), ("V", "Schlag", HIT)]
SECTIONS = {"Phase 1": 0.0, "Phase 2": A.t(31), "Phase 3": A.t(61), "Bridge": A.t(77), "Tutti": A.t(85),
            "Hit": HIT, "END": END}
HARM = (A, H)
