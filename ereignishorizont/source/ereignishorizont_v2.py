"""
EREIGNISHORIZONT (V2 – Resurrected)
4/4, 82 -> 88 BPM (steady acceleration), D minor, i - VI - III - VII (Dm - Bb - F - C).
Warm church-organ ostinato, clock pulse, 35-55 Hz sub pedal, unison horns & trombones,
epic string chords, intimate grand piano outro with the leitmotif.
"""
import numpy as np
from studio import Score, SSO, MSG, AEG
from cutil import Sec, hum, hv, CH, root, tones, voicing, melody, swell, breathe, pad, rng

S = Score()


def sf2(name, sfp, prog, bank=0):
    return S.track(name, "sf2", sf=sfp, prog=prog, bank=bank)


piano = sf2("piano", AEG, 1, 11)                 # Salamander grand, wide
vln1 = sf2("vln1", AEG, 40, 40)
vln1p = sf2("vln1p", AEG, 40, 40)
vln2 = sf2("vln2", AEG, 40, 40)
vla = sf2("vla", AEG, 41, 40)
vc = sf2("vc", AEG, 42, 40)
cb = sf2("cb", AEG, 43, 40)
vc_mel = sf2("vc_mel", AEG, 42, 40)
trem = sf2("trem", AEG, 40, 67)
hn = sf2("hn", AEG, 60, 40)
hn_pad = sf2("hn_pad", AEG, 60, 40)
tbn = sf2("tbn", AEG, 57, 40)
btbn = sf2("btbn", AEG, 57, 99)
tuba = sf2("tuba", AEG, 58)
tpt = sf2("tpt", AEG, 56, 40)
choir = sf2("choir", AEG, 52)
timp = sf2("timp", AEG, 47)
timp_roll = sf2("timp_roll", AEG, 47, 66)
kit = sf2("kit", AEG, 48, 128)
cym = sf2("cym", SSO, 38)
taiko = sf2("taiko", MSG, 116)
aeg_org = sf2("aeg_org", AEG, 19)
bells = sf2("bells", AEG, 14)

org8 = S.track("org8", "organ", reg="warm_soft", chiff=0.15)
org16 = S.track("org16", "organ", reg="warm_main", chiff=0.1)
org_ped = S.track("org_ped", "organ", reg="warm_pedal", chiff=0.1)
org_full = S.track("org_full", "organ", reg="warm_full", chiff=0.2)
org_pad = S.track("org_pad", "organ", reg="warm_soft", chiff=0.1)
tick = S.track("tick", "tick")
sub = S.track("sub", "subv2")
impact = S.track("impact", "impact")
riser = S.track("riser", "riser")
whoosh = S.track("whoosh", "whoosh")

# ------------------------------------------------------------------ form
N = 88
A = Sec(1.0, 4, N, [(1, 82), (73, 88), (81, 88), (86, 72), (89, 62)])
LOOP = ["Dm", "Dm", "Bb", "Bb", "F", "F", "C", "C"]
H = [LOOP[(b - 1) % 8] for b in range(1, N + 1)]
END_T = A.end
# leitmotif (quarters), fits Dm Dm Bb Bb F F C C
L = [(65, 3), (64, 1), (62, 2), (69, 2), (67, 3), (65, 1), (62, 4),
     (65, 3), (67, 1), (69, 2), (74, 2), (72, 3), (70, 1), (67, 4)]
SUBP = {"Dm": 26, "Bb": 34, "F": 29, "C": 24}          # 36.7 / 58 / 43.7 / 32.7 Hz


def crash(t, v=110):
    kit.add(t, 3.0, 57, v)
    cym.add(t + 0.004, 4.0, 55, int(v * 0.85))


def cym_swell(t_peak, key=50, v=100):
    lead = {48: 2.02, 50: 3.16, 52: 3.16}[key]
    cym.add(t_peak - lead, lead + 4.0, key, v)


def troll(t0, t1, pitch, v0=40, v1=110):
    timp_roll.add(t0, t1 - t0, pitch, 100)
    timp_roll.curve(11, [(t0 - 0.02, 30), (t0, int(20 + v0 * 0.6)), (t1, int(min(127, 30 + v1 * 0.8))),
                         (t1 + 0.05, 90)])


# ------------------------------------------------------------------ clock
for bar in range(1, 88):
    sub_n = 1 if bar < 13 or bar >= 81 else 2
    for k in range(4 * sub_n):
        q = k / sub_n
        v = 72 + min(30, bar // 3) + (10 if k % (2 * sub_n) == 0 else 0)
        if bar >= 81:
            v = max(40, 95 - (bar - 80) * 6)
        tick.add(A.t(bar, q), 0.05, 60, v, tock=(k % 2 == 1))

# ------------------------------------------------------------------ organ ostinato
def arp8(ch):
    r = root(ch, 45)
    th = tones(ch, r + 12, r + 17)[0]
    return [r, r + 7, r + 12, th, r + 19, th, r + 12, r + 7]


def cell16(ch):
    r = root(ch, 62)
    t = tones(ch, 64, 76)
    lo = [p for p in t if p >= 64][0]
    mid = [p for p in t if p > lo][0]
    hi = [p for p in t if p > mid][0]
    return [lo, mid, hi, mid]


for bar in range(3, 81):
    ch = H[bar - 1]
    a = arp8(ch)
    for e in range(8):
        t = hum(A.t(bar, e * 0.5), 0.003, 0.006)
        v = 78 + (8 if e == 0 else 0) + (4 if e == 4 else 0)
        org8.add(t, A.d(bar, e * 0.5, 0.5) * 0.98, a[e], v)
        if bar >= 9:
            aeg_org.add(t, A.d(bar, e * 0.5, 0.5) * 0.95, a[e], hv(70))
    if 13 <= bar <= 76:
        c = cell16(ch)
        for s in range(16):
            t = hum(A.t(bar, s * 0.25), 0.003, 0.006)
            org16.add(t, A.d(bar, s * 0.25, 0.25) * 0.97, c[s % 4], 84 + (8 if s % 4 == 0 else 0))
    if bar >= 5:
        org_ped.add(A.t(bar) - 0.02, A.d(bar, 0, 4) + 0.04, 36 + (CH[ch][0] - 36) % 12, 90)
        sub.add(A.t(bar), A.d(bar, 0, 4) + 0.05, SUBP[ch], 100, att=0.25 if bar > 5 else 3.0, rel=0.6)

# outro: soft organ chords under the piano
for bar in range(81, 89):
    ch = H[bar - 1]
    for p in voicing(ch, [(62, 69), (57, 62), (50, 57)]):
        org_pad.add(A.t(bar), A.d(bar, 0, 4) + 0.05, p, 70)
org_ped.add(A.t(81), A.t(89) - A.t(81) + 1.0, 38, 70)
sub.add(A.t(81), A.t(89) - A.t(81) + 1.5, 26, 80, att=1.0, rel=4.0)

# full organ chords at the climaxes
for bar in list(range(37, 53)) + list(range(57, 74)):
    ch = H[bar - 1]
    for p in voicing(ch, [(62, 69), (57, 62), (50, 57), (45, 50)]):
        org_full.add(A.t(bar), A.d(bar, 0, 4) + 0.04, p, 90 if bar < 73 else 95)

# ------------------------------------------------------------------ strings
# pads breathe in two-bar swells; they grow with the form
prev = None
for bar in range(13, 81):
    ch = H[bar - 1]
    if 53 <= bar <= 56:
        continue
    t0, d = hum(A.t(bar), 0.01) - 0.05, A.d(bar, 0, 4) + 0.1
    r = root(ch, 36)
    cb.add(t0, d, r, 90)
    if bar >= 21:
        vc.add(t0, d, r + 12, 88)
    prev = voicing(ch, [(62, 69), (55, 62)], prev)
    vla.add(t0, d, prev[1], 86)
    if bar >= 29:
        vln2.add(t0, d, prev[0], 86)
    if bar >= 37:
        top = voicing(ch, [(74, 81)])[0]
        vln1p.add(t0, d, top, 90)
        vln2.add(t0, d, top - 12 if top - 12 != prev[0] else top - 7, 86)
for tr, lo, hi in [(cb, 45, 75), (vla, 40, 72), (vc, 45, 78), (vln2, 45, 80), (vln1p, 50, 85)]:
    pts = []
    for b in range(13, 81, 2):
        if 53 <= b <= 56:
            continue
        grow = min(1.0, (b - 13) / 40)
        l_, h_ = lo + 30 * grow, hi + 40 * grow
        pts += [(A.t(b), l_), (A.t(b, 4.4), min(127, h_)), (A.t(b + 2) - 0.05, l_ + 5)]
    pts = sorted(pts)
    tr.curve(11, pts)
# climax tremolo chords
for bar in list(range(45, 53)) + list(range(57, 73)):
    for p in voicing(H[bar - 1], [(79, 86), (74, 79), (67, 74)]):
        trem.add(A.t(bar), A.d(bar, 0, 4) + 0.03, p, 110)
swell(trem, [(A.t(44), 60), (A.t(45), 95), (A.t(52), 110), (A.t(53), 60), (A.t(57), 100), (A.t(73), 127)])

# ------------------------------------------------------------------ leitmotif statements
melody(piano, A, 13, L, transpose=12, vel=58, legato=1.1, sd=0.012)            # first, fragile
melody(vc_mel, A, 21, L, transpose=-12, vel=92, legato=1.04, sd=0.01)         # cellos sing
melody(hn_pad, A, 21, L, transpose=-12, vel=70, legato=1.02, sd=0.01)
swell(vc_mel, [(0, 80), (A.t(21), 85), (A.t(24), 110), (A.t(25), 95), (A.t(28), 115), (A.t(29), 80)])
swell(hn_pad, [(0, 50), (A.t(21), 45), (A.t(25), 70), (A.t(29), 60)])
# violins' long counter-line (29-36)
cl_ = [(81, 8), (82, 4), (86, 4), (84, 8), (79, 8)]
melody(vln1, A, 29, cl_, vel=86, legato=1.02, sd=0.01)
# horns + trombones unison (37-44), then trumpets join (45-52)
melody(hn, A, 37, L, vel=104, legato=1.01)
melody(tbn, A, 37, L, transpose=-12, vel=100, legato=1.01)
melody(hn, A, 45, L, vel=118, legato=1.01)
melody(tbn, A, 45, L, transpose=-12, vel=114, legato=1.01)
melody(tpt, A, 45, L, transpose=12, vel=108, legato=1.01)
melody(vln1, A, 45, L, transpose=24, vel=110, legato=1.02)
# final: twice, everything (57-72)
for start in (57, 65):
    melody(hn, A, start, L, vel=122, legato=1.01)
    melody(tbn, A, start, L, transpose=-12, vel=120, legato=1.01)
    melody(btbn, A, start, L, transpose=-24, vel=112, legato=1.01)
    melody(tpt, A, start, L, transpose=12, vel=118 if start == 57 else 124, legato=1.01)
    melody(vln1, A, start, L, transpose=24, vel=118, legato=1.02)
    melody(choir, A, start, L, transpose=0, vel=110, legato=1.02)
swell(hn, [(0, 100), (A.t(37), 95), (A.t(44), 112), (A.t(45), 115), (A.t(53), 120), (A.t(57), 122), (A.t(73), 127),
           (A.t(75), 90)])
swell(tbn, [(0, 95), (A.t(37), 90), (A.t(45), 112), (A.t(57), 120), (A.t(73), 127), (A.t(75), 90)])
swell(btbn, [(0, 110), (A.t(57), 112), (A.t(73), 127)])
swell(tpt, [(0, 100), (A.t(45), 100), (A.t(53), 112), (A.t(57), 110), (A.t(73), 127)])
swell(vln1, [(0, 60), (A.t(29), 70), (A.t(33), 100), (A.t(37), 85), (A.t(45), 105), (A.t(53), 115),
             (A.t(57), 112), (A.t(73), 127), (A.t(77), 70), (A.t(81), 30)])
swell(choir, [(0, 90), (A.t(57), 95), (A.t(73), 127), (A.t(77), 60)])
# choir pads 29-52
for bar in range(29, 53):
    for p in voicing(H[bar - 1], [(64, 72), (57, 64), (50, 57)]):
        choir.add(A.t(bar), A.d(bar, 0, 4) + 0.05, p, 88 if bar < 45 else 100)
# low brass pads 29-52, tuba doubling bass at climaxes
for bar in range(29, 81):
    ch = H[bar - 1]
    if 53 <= bar <= 56:
        continue
    r = root(ch, 36)
    if bar < 37:
        for p in (r + 12, r + 19):
            hn_pad.add(A.t(bar), A.d(bar, 0, 4) + 0.04, p if p <= 67 else p - 12, 80)
    if bar >= 45 and bar < 73:
        tuba.add(A.t(bar), A.d(bar, 0, 4) + 0.04, r - 12 if r - 12 >= 28 else r, 110)
swell(tuba, [(0, 100), (A.t(45), 100), (A.t(73), 125)])

# ------------------------------------------------------------------ percussion
for bar in range(21, 81, 2):
    if 53 <= bar <= 56:
        continue
    timp.add(A.t(bar), 1.5, 38 if H[bar - 1] == "Dm" else root(H[bar - 1], 38), 85 if bar < 37 else 112)
for bar in range(29, 73):
    if 53 <= bar <= 56:
        continue
    lvl = 0 if bar < 37 else (1 if bar < 45 else 2)
    pat = [(0, 110), (2, 96)] if lvl == 0 else ([(0, 118), (1.5, 88), (2, 108), (3.5, 92)] if lvl == 1 else
                                                [(0, 124), (0.75, 70), (1.5, 96), (2, 118), (2.75, 72), (3.5, 104)])
    for q, v in pat:
        taiko.add(hum(A.t(bar, q), 0.004), 0.5, 32 if q in (0, 2) else 45, hv(v - (22 if lvl == 0 else 0)))
    if lvl == 2:
        for q in (0, 2):
            timp.add(A.t(bar, q), 0.8, root(H[bar - 1], 38), 110)
for b in (37, 45, 57, 65, 73):
    cym_swell(A.t(b), 50, 105)
    crash(A.t(b), 112 if b != 73 else 124)
    impact.add(A.t(b), 4.0, 60, 100 if b < 57 else 120, size=0.9 if b < 57 else 1.3)
for b in (49, 61, 69):
    crash(A.t(b), 100)
troll(A.t(44), A.t(45) - 0.03, 38, 40, 118)
troll(A.t(64), A.t(65) - 0.03, 38, 50, 124)
troll(A.t(72), A.t(73) - 0.03, 38, 60, 127)
# breakdown 53-56: organ + clock only, the tension rises
riser.add(A.t(53), A.t(57) - A.t(53), 60, 95, f0=150, f1=9000)
whoosh.add(A.t(57) - 3.0, 3.0, 60, 100)
cym_swell(A.t(57), 52, 118)
troll(A.t(55), A.t(57) - 0.03, 38, 30, 124)

# ------------------------------------------------------------------ release & outro
for p in (38, 50, 57, 62, 65, 69, 74):
    org_full.add(A.t(73), A.d(73, 0, 8), p, 95)
kit.add(A.t(73), 3.0, 35, 124)
melody(hn, A, 75, L[:4], transpose=-12, vel=80, legato=1.02)
for bar in range(73, 81):
    ch = H[bar - 1]
    for p in voicing(ch, [(62, 69), (55, 62), (50, 55)]):
        choir.add(A.t(bar), A.d(bar, 0, 4) + 0.05, p, 80)
# the grand piano, alone and warm: leitmotif with left-hand chords
melody(piano, A, 81, L, transpose=0, vel=62, legato=1.15, sd=0.02)
for bar in range(81, 89):
    ch = H[bar - 1]
    r = root(ch, 36)
    lh = [r, r + 7, r + 12] + ([tones(ch, r + 13, r + 17)[0]] if bar % 2 == 1 else [])
    for i, p in enumerate(lh):
        piano.add(hum(A.t(bar) + i * 0.06, 0.01), A.d(bar, 0, 4) + 0.8, p, hv(46 - i * 3))
for i, p in enumerate([26, 38, 45, 50, 53, 57, 62]):
    piano.add(A.t(89) + i * 0.09, 7.0, p, hv(48 - i * 2))
bells.add(A.t(89) + 0.5, 6.0, 74, 50)

END = A.t(89) + 9.0
SECTIONS = {"Intro": 0.0, "Ostinato": A.t(3), "Theme piano": A.t(13), "Cellos": A.t(21), "Build": A.t(29),
            "Brass": A.t(37), "Climax 1": A.t(45), "Breakdown": A.t(53), "Finale": A.t(57),
            "Release": A.t(73), "Piano outro": A.t(81), "END": END}
MARKS = [("I", "Uhrwerk", 0.0), ("II", "Leitmotiv", A.t(13)), ("III", "Aufbau", A.t(29)),
         ("IV", "Höhepunkt", A.t(45)), ("V", "Finale", A.t(57)), ("VI", "Flügel", A.t(81))]
HARM = (A, H)

REVERB = (4.3, 2.6)           # cathedral tail RT60, hall tail RT60 (s)
WET_SHARE = 0.32
MACRO = [(0, -1), (A.t(3), -3), (A.t(13), -3), (A.t(29), -2), (A.t(45), 0), (A.t(81), -2), (END, -2)]
AUTO = {
    "org8": [(0, -16), (A.t(3), -16), (A.t(9), -10), (A.t(13), -7), (A.t(29), -4), (A.t(45), 0), (A.t(73), 0),
             (A.t(79), -8), (A.t(81), -14)],
    "org16": [(0, -13), (A.t(13), -13), (A.t(21), -8), (A.t(37), -3), (A.t(45), 0), (A.t(73), -1), (A.t(77), -12)],
    "aeg_org": [(0, -8), (A.t(29), -3), (A.t(45), 0), (A.t(79), -6)],
    "org_ped": [(0, -10), (A.t(13), -7), (A.t(29), -3), (A.t(45), 0), (A.t(81), -6)],
    "sub": [(0, -8), (A.t(13), -6), (A.t(29), -3), (A.t(45), 0), (A.t(81), -5)],
    "tick": [(0, 0), (A.t(3), -3), (A.t(29), -1), (A.t(45), 1), (A.t(81), -3)],
    "piano": [(0, 0), (A.t(80), 0), (A.t(81), -5)],
    "cb": [(0, -4), (A.t(29), -2), (A.t(45), 0)],
}
