"""
HORIZONT – Opus 1
One through-composed epic in D minor (-> D major), two leitmotifs:
  L  "Hoffnung" (hope)  – lyrical, first heard on the grand piano
  F  "Schicksal" (fate) – the dark brass fanfare, D phrygian
  Prolog    4/4  72 -> 92   clock alone, piano plays L, the clock accelerates
  Kornfeld  4/4  92 -> 96   warm organ ostinato, L in cellos and horns (i - VI - III - VII)
  Andocken  4/4 108 -> 116  relentless ostinato over rising steps D Eb F G A, F in the brass, hard cut
  Zeit      4/4  64         one cycle, five layers; the last one turns to D major (I - bVI - bIII - bVII)
  Epilog    rit.            piano alone, the clock stops
"""
import numpy as np
from studio import Score, SSO, MSG, AEG
from cutil import Sec, hum, hv, CH, root, tones, voicing, melody, swell, pad, rng

CH.update({"D": (2, [2, 6, 9]), "Ebmaj": (3, [3, 7, 10]), "Gm": (7, [7, 10, 2]), "A": (9, [9, 1, 4])})
S = Score()


def sf2(name, sfp, prog, bank=0):
    return S.track(name, "sf2", sf=sfp, prog=prog, bank=bank)


def shot(name, sfp, prog, bank=0, hold=0.08, decay=0.08, punch=1.6):
    return S.track(name, "oneshot", sf=sfp, prog=prog, bank=bank, hold=hold, decay=decay, punch=punch)


piano = sf2("piano", AEG, 1, 11)
vln1 = sf2("vln1", AEG, 40, 40)
vln1p = sf2("vln1p", AEG, 40, 40)
vln2 = sf2("vln2", AEG, 40, 40)
vla = sf2("vla", AEG, 41, 40)
vc = sf2("vc", AEG, 42, 40)
vc_mel = sf2("vc_mel", AEG, 42, 40)
cb = sf2("cb", AEG, 43, 40)
trem = sf2("trem", AEG, 40, 67)
hn = sf2("hn", AEG, 60, 40)
hn2 = sf2("hn2", AEG, 60, 40)
hn_pad = sf2("hn_pad", AEG, 60, 40)
tbn = sf2("tbn", AEG, 57, 40)
btbn = sf2("btbn", AEG, 57, 99)
tuba = sf2("tuba", AEG, 58)
tpt = sf2("tpt", AEG, 56, 40)
choir = sf2("choir", AEG, 52)
choirM = sf2("choirM", AEG, 52, 42)
timp = sf2("timp", AEG, 47)
timp_roll = sf2("timp_roll", AEG, 47, 66)
kit = sf2("kit", AEG, 48, 128)
snare = sf2("snare", AEG, 48, 128)
bd = sf2("bd", SSO, 37)
cym = sf2("cym", SSO, 38)
taiko = sf2("taiko", MSG, 116)
bells = sf2("bells", AEG, 14)
aeg_org = sf2("aeg_org", AEG, 19)
pizz = sf2("pizz", AEG, 42, 65)
stac_lo = shot("stac_lo", AEG, 42, 40, hold=0.09, decay=0.08)
stac_va = shot("stac_va", AEG, 43, 40, hold=0.1, decay=0.09)
brass_st = shot("brass_st", AEG, 61, 0, hold=0.14, decay=0.12, punch=1.3)

org8 = S.track("org8", "organ", reg="warm_soft", chiff=0.15)
org16 = S.track("org16", "organ", reg="warm_main", chiff=0.1)
org_ped = S.track("org_ped", "organ", reg="warm_pedal", chiff=0.1)
org_full = S.track("org_full", "organ", reg="warm_full", chiff=0.15)
org_pad = S.track("org_pad", "organ", reg="warm_soft", chiff=0.05)
tick = S.track("tick", "tick")
sub = S.track("sub", "subv2")
impact = S.track("impact", "impact")
riser = S.track("riser", "riser")
whoosh = S.track("whoosh", "whoosh")
gong = S.track("gong", "gong")

LOOP = ["Dm", "Dm", "Bb", "Bb", "F", "F", "C", "C"]
L = [(65, 3), (64, 1), (62, 2), (69, 2), (67, 3), (65, 1), (62, 4),
     (65, 3), (67, 1), (69, 2), (74, 2), (72, 3), (70, 1), (67, 4)]
L_MAJ = [(66, 3)] + L[1:]                         # only the first note changes: F -> F#
SUBP = {"Dm": 26, "D": 26, "Bb": 34, "F": 29, "C": 24, "Eb": 27, "Gm": 31, "A": 33, "D5": 26, "Eb5": 27}
# fate fanfare (4/4, quarters), D phrygian
F1 = [(69, 0.75), (69, 0.25), (69, 1), (74, 2), (72, 1), (70, 1), (69, 2), (70, 1), (69, 1), (67, 1), (65, 1),
      (63, 2), (62, 2)]
F2 = [(74, 0.75), (74, 0.25), (74, 1), (77, 2), (75, 1), (74, 1), (72, 2), (74, 1), (72, 1), (70, 1), (69, 1),
      (70, 2), (69, 2)]


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


def sroll(t0, t1, v0=35, v1=118, rate=0.045):
    k = int((t1 - t0) / rate)
    for i in range(k):
        a = i / max(1, k - 1)
        snare.add(t0 + i * rate + rng.normal(0, 0.003), 0.1, 38, hv(v0 + (v1 - v0) * a ** 1.4, 4))


def clock(sec, bars, sub_n=1, v0=75, v1=100):
    for i, bar in enumerate(bars):
        for k in range(4 * sub_n):
            v = v0 + (v1 - v0) * i / max(1, len(bars) - 1) + (8 if k % (2 * sub_n) == 0 else 0)
            tick.add(sec.t(bar, k / sub_n), 0.05, 60, int(min(127, v)), tock=(k % 2 == 1))


def arp8(ch):
    r = root(ch, 45)
    th = tones(ch, r + 12, r + 17)[0]
    return [r, r + 7, r + 12, th, r + 19, th, r + 12, r + 7]


def cell16(ch):
    t = [p for p in tones(ch, 64, 79)]
    return [t[0], t[1], t[2], t[1]]


def timp_pitch(ch):
    r = root(ch, 36)
    return r + 12 if r + 12 <= 50 else r


# ================================================================== PROLOG
P = Sec(1.0, 4, 10, [(1, 72), (9, 72), (11, 92)])
clock(P, range(1, 11), 1, 70, 92)
for bar in range(3, 11):
    ch = LOOP[(bar - 3) % 8]
    for p in voicing(ch, [(62, 69), (57, 62), (50, 57)]):
        org_pad.add(P.t(bar), P.d(bar, 0, 4) + 0.05, p, 70)
    sub.add(P.t(bar), P.d(bar, 0, 4) + 0.05, SUBP[ch], 90, att=2.0 if bar == 3 else 0.3, rel=0.6)
    r = root(ch, 36)
    for i, p in enumerate([r, r + 7, r + 12]):
        piano.add(hum(P.t(bar) + i * 0.07, 0.01), P.d(bar, 0, 4) + 0.6, p, hv(42 - i * 3))
melody(piano, P, 3, L, transpose=12, vel=60, legato=1.12, sd=0.015)

# ================================================================== KORNFELD
K = Sec(P.end, 4, 32, [(1, 92), (33, 96)])
KH = [LOOP[(b - 1) % 8] for b in range(1, 33)]
clock(K, range(1, 33), 2, 78, 100)
for bar in range(1, 33):
    ch = KH[bar - 1]
    a = arp8(ch)
    for e in range(8):
        t = hum(K.t(bar, e * 0.5), 0.003, 0.006)
        org8.add(t, K.d(bar, e * 0.5, 0.5) * 0.98, a[e], 80 + (8 if e == 0 else 0))
        aeg_org.add(t, K.d(bar, e * 0.5, 0.5) * 0.95, a[e], hv(66))
    c = cell16(ch)
    for s in range(16):
        org16.add(hum(K.t(bar, s * 0.25), 0.003, 0.006), K.d(bar, s * 0.25, 0.25) * 0.97, c[s % 4],
                  84 + (8 if s % 4 == 0 else 0))
    org_ped.add(K.t(bar) - 0.02, K.d(bar, 0, 4) + 0.04, 36 + (CH[ch][0] - 36) % 12, 90)
    sub.add(K.t(bar), K.d(bar, 0, 4) + 0.05, SUBP[ch], 100, att=0.25, rel=0.5)
prev = None
for bar in range(9, 33):
    ch = KH[bar - 1]
    t0, d = hum(K.t(bar), 0.01) - 0.05, K.d(bar, 0, 4) + 0.1
    r = root(ch, 36)
    cb.add(t0, d, r, 90)
    vc.add(t0, d, r + 12, 86)
    prev = voicing(ch, [(62, 69), (55, 62)], prev)
    vla.add(t0, d, prev[1], 86)
    if bar >= 17:
        vln2.add(t0, d, prev[0], 86)
    if bar >= 25:
        vln1p.add(t0, d, voicing(ch, [(74, 81)])[0], 90)
for tr in (cb, vc, vla, vln2, vln1p):
    pts = []
    for b in range(9, 33, 2):
        g = (b - 9) / 24
        pts += [(K.t(b), 50 + 30 * g), (K.t(b, 4.4), 85 + 40 * g), (K.t(b + 2) - 0.05, 55 + 30 * g)]
    tr.curve(11, sorted(pts))
melody(vc_mel, K, 9, L, transpose=-12, vel=92, legato=1.04, sd=0.01)
swell(vc_mel, [(0, 80), (K.t(9), 85), (K.t(12), 110), (K.t(13), 95), (K.t(16), 112), (K.t(17), 80)])
melody(hn, K, 17, L, transpose=-12, vel=96, legato=1.02)
melody(hn, K, 25, L, vel=112, legato=1.01)
melody(tbn, K, 25, L, transpose=-12, vel=108, legato=1.01)
melody(vln1, K, 25, L, transpose=12, vel=104, legato=1.02)
cl_ = [(81, 8), (82, 4), (86, 4), (84, 8), (79, 8)]
melody(vln1, K, 17, cl_, vel=84, legato=1.02, sd=0.01)
for bar in range(17, 33):
    for p in voicing(KH[bar - 1], [(64, 72), (57, 64), (50, 57)]):
        choir.add(K.t(bar), K.d(bar, 0, 4) + 0.05, p, 86 if bar < 25 else 100)
    for q, v in ([(0, 96), (2, 84)] if bar < 25 else [(0, 118), (1.5, 88), (2, 108), (3.5, 92)]):
        taiko.add(hum(K.t(bar, q), 0.004), 0.5, 32 if q in (0, 2) else 45, hv(v))
for bar in range(25, 33):
    ch = KH[bar - 1]
    for p in voicing(ch, [(62, 69), (57, 62), (50, 57), (45, 50)]):
        org_full.add(K.t(bar), K.d(bar, 0, 4) + 0.04, p, 90)
    tuba.add(K.t(bar), K.d(bar, 0, 4) + 0.04, root(ch, 36) - 12 if root(ch, 36) - 12 >= 28 else root(ch, 36), 108)
    timp.add(K.t(bar), 1.2, timp_pitch(ch), 112)
    timp.add(K.t(bar, 2), 1.0, timp_pitch(ch), 100)
crash(K.t(25), 112)
impact.add(K.t(25), 4.0, 60, 105, size=1.0)
cym_swell(K.t(25), 50, 105)
troll(K.t(24), K.t(25) - 0.03, 38, 40, 118)
riser.add(K.t(29), K.end - K.t(29), 60, 100, f0=150, f1=9000)
troll(K.t(32), K.end - 0.03, 38, 50, 124)
cym_swell(K.end, 52, 118)
whoosh.add(K.end - 3.0, 3.0, 60, 105)

# ================================================================== ANDOCKEN
D = Sec(K.end, 4, 36, [(1, 108), (29, 112), (37, 116)])
DH = (["Dm"] * 8 + ["Dm", "Dm", "Bb", "Bb"] * 2 + ["Dm"] * 4 + ["Eb", "Eb", "F", "F", "Gm", "Gm", "A", "A"] +
      ["Dm", "Dm", "Bb", "Eb|Dm", "Dm", "Eb", "Bb", "Bb|A"])
assert len(DH) == 36
CH["Eb"] = (3, [3, 7, 10])


def dch(bar, q):
    h = DH[bar - 1]
    if "|" in h:
        a, b = h.split("|")
        return a if q < 2 else b
    return h


impact.add(D.t(1), 4.0, 60, 124, size=1.4)
gong.add(D.t(1), 8.0, 38, 118, size=1.2)
crash(D.t(1), 118)
bd.add(D.t(1), 3.0, 48, 124)
for p in (38, 50, 57, 62, 65, 69):
    org_full.add(D.t(1), D.d(1, 0, 4), p, 100)
for bar in range(1, 37):
    ch = dch(bar, 0)
    tt = tones(ch, 62, 78)
    ost = [tt[2], tt[0], tt[3] if len(tt) > 3 else tt[2], tt[0], tt[2], tt[0], tt[1], tt[0]]
    for e in range(8):
        c_ = dch(bar, e * 0.5)
        if c_ != ch:
            tt2 = tones(c_, 62, 78)
            ost_e = [tt2[2], tt2[0], tt2[3] if len(tt2) > 3 else tt2[2], tt2[0], tt2[2], tt2[0], tt2[1], tt2[0]][e]
        else:
            ost_e = ost[e]
        t = hum(D.t(bar, e * 0.5), 0.003, 0.006)
        org16.add(t, D.d(bar, e * 0.5, 0.5) * 0.96, ost_e, 90)
        if bar >= 21:
            org_full.add(t, D.d(bar, e * 0.5, 0.5) * 0.96, ost_e + 12 if bar >= 29 else ost_e, 86)
        r = root(c_, 38)
        v = [118, 70, 96, 72, 112, 70, 98, 76][e] - (14 if bar < 9 else 0)
        if bar >= 5:
            stac_lo.add(t, 0.2, r + 12, hv(v))
            stac_va.add(t, 0.2, r, hv(v - 4))
            if e % 2 == 0:
                pizz.add(t, 0.3, r + 12, hv(v - 8))
    sub_n = 4 if bar >= 27 else 2
    for k in range(4 * sub_n):
        tick.add(D.t(bar, k / sub_n), 0.05, 60, min(127, 86 + bar // 2 + (8 if k % sub_n == 0 else 0)), tock=(k % 2 == 1))
    for q in (0, 2):
        c_ = dch(bar, q)
        org_ped.add(D.t(bar, q), D.d(bar, q, 2) * 0.95, 36 + (CH[c_][0] - 36) % 12, 95)
        sub.add(D.t(bar, q), D.d(bar, q, 2), SUBP[c_], 108, att=0.08, rel=0.3)
        cb.add(D.t(bar, q) - 0.02, D.d(bar, q, 2) + 0.03, root(c_, 28), 100)
swell(cb, [(D.t(1) - 0.05, 90), (D.t(1), 95), (D.t(21), 110), (D.t(37), 127)])
# percussion: builds in four stages
for bar in range(2, 37):
    ch = dch(bar, 0)
    if bar < 9:
        if bar % 2 == 1:
            timp.add(D.t(bar), 1.5, timp_pitch(ch), 100)
        continue
    stage = 1 if bar < 17 else (2 if bar < 29 else 3)
    pat = {1: [(0, 118), (2, 100)], 2: [(0, 122), (1.5, 90), (2, 112), (3.5, 96)],
           3: [(0, 126), (0.75, 70), (1.5, 100), (2, 122), (2.75, 74), (3, 90), (3.5, 108)]}[stage]
    for q, v in pat:
        taiko.add(hum(D.t(bar, q), 0.004), 0.5, 32 if q in (0, 2) else 45, hv(v))
    for q in ((0,) if stage == 1 else (0, 2)):
        timp.add(D.t(bar, q), 1.0, timp_pitch(dch(bar, q)), 116)
        bd.add(D.t(bar, q), 2.0, 48, 110)
    if bar % 4 == 0 and bar < 29:
        sroll(D.t(bar, 2), D.t(bar + 1) - 0.02, 35, 112)
    if stage == 3 and bar % 4 == 1:
        crash(D.t(bar), 118)
# horn swells over the rising steps, then the fate fanfare
for b in range(9, 29, 2):
    ch = DH[b - 1]
    r = root(ch, 50)
    for p in (r, r + 7):
        hn_pad.add(D.t(b), D.d(b, 0, 8), p, 104)
    for p in (r - 12, r - 5):
        tbn.add(D.t(b), D.d(b, 0, 8), p, 98)
swell(hn_pad, [(0, 40)] + sum([[(D.t(b), 40), (D.t(b + 1, 2), 115), (D.t(b + 2) - 0.05, 50)] for b in range(9, 29, 2)], []))
swell(tbn, [(0, 95), (K.t(25), 100), (K.end, 110)] + sum([[(D.t(b) + 0.01, 40), (D.t(b + 1, 2), 110), (D.t(b + 2) - 0.06, 50)]
                                                          for b in range(9, 29, 2)], []) + [(D.t(29) - 0.02, 112)])
for b in range(17, 29):
    for p in voicing(DH[b - 1], [(64, 72), (57, 64), (50, 57)]):
        choir.add(D.t(b), D.d(b, 0, 4) + 0.04, p, 104)
    for p in voicing(DH[b - 1], [(79, 86), (74, 79)]):
        trem.add(D.t(b), D.d(b, 0, 4) + 0.03, p, 104)
FAN = F1 + F2
for tr, tp_, v in ((hn, -12, 124), (hn2, 0, 116), (tbn, -24, 122), (tpt, 0, 118), (vln1, 12, 116),
                   (choirM, -12, 112)):
    melody(tr, D, 29, FAN, unit=1, transpose=tp_, vel=v, legato=1.0, sd=0.006)
for b in range(29, 37):
    for p in voicing(dch(b, 0), [(62, 69), (57, 62), (50, 57)]):
        choir.add(D.t(b), D.d(b, 0, 4) + 0.03, p, 118)
        trem.add(D.t(b), D.d(b, 0, 4) + 0.03, p + 24, 118)
    r = root(dch(b, 0), 36)
    tuba.add(D.t(b), D.d(b, 0, 4) + 0.03, r - 12 if r - 12 >= 26 else r, 118)
    btbn.add(D.t(b), D.d(b, 0, 4) + 0.03, r, 116)
swell(choir, [(0, 80), (K.t(17), 80), (K.t(25), 95), (D.t(17), 90), (D.t(29), 118), (D.t(37), 127)])
swell(trem, [(0, 60), (D.t(17), 60), (D.t(28), 110), (D.t(29), 112), (D.t(37), 127)])
swell(hn, [(0, 95), (K.t(17), 90), (K.t(25), 110), (K.t(33), 115), (D.t(29), 118), (D.t(37), 127)])
swell(tpt, [(0, 110), (D.t(29), 112), (D.t(37), 127)])
swell(vln1, [(0, 60), (K.t(17), 70), (K.t(21), 95), (K.t(25), 105), (K.t(33), 110), (D.t(29), 112), (D.t(37), 127)])
swell(choirM, [(0, 100), (D.t(29), 105), (D.t(37), 127)])
riser.add(D.t(21), D.t(29) - D.t(21), 60, 108, f0=120, f1=10000)
cym_swell(D.t(29), 52, 124)
troll(D.t(28), D.t(29) - 0.03, 45, 60, 127)
impact.add(D.t(29), 4.0, 60, 124, size=1.5)
sroll(D.t(36), D.end - 0.02, 60, 124, rate=0.04)
CUT = D.end                     # the hard cut: everything ends on the dominant

# ================================================================== ZEIT (+ Epilog)
Z = Sec(CUT + 2.6, 4, 48, [(1, 64), (41, 64), (45, 58), (49, 50)])
ZH = [LOOP[(b - 1) % 8] for b in range(1, 41)]
ZH[32:40] = ["D", "D", "Bb", "Bb", "F", "F", "C", "C"]
ZH += ["D"] * 8
M2 = [[(69, 0, 1), (74, 1, 1), (77, 2, 2)], [(76, 0, 4)], [(74, 0, 1), (77, 1, 1), (81, 2, 2)], [(77, 0, 4)],
      [(72, 0, 1), (77, 1, 1), (81, 2, 2)], [(79, 0, 4)], [(76, 0, 1), (79, 1, 1), (84, 2, 2)], [(79, 0, 4)]]
M2_MAJ = [[(p + 1 if p == 77 else p, o, d) for p, o, d in bar] for bar in M2[:2]] + M2[2:]
# cycle 1: piano alone (plus a heartbeat of sub)
for bar in range(1, 41):
    ch = ZH[bar - 1]
    cyc = (bar - 1) // 8 + 1
    r = root(ch, 36)
    if cyc == 1:
        for i, p in enumerate([r, r + 7, r + 12, tones(ch, r + 13, r + 17)[0]]):
            piano.add(hum(Z.t(bar) + i * 0.08, 0.01), Z.d(bar, 0, 4) + 0.5, p, hv(46 - i * 3))
        for p, o, d in M2[(bar - 1) % 8]:
            piano.add(hum(Z.t(bar, o), 0.02), Z.d(bar, o, d) + 0.5, p, hv(58))
    elif cyc in (2, 3):
        a = arp8(ch)
        for e in range(8):
            piano.add(hum(Z.t(bar, e * 0.5), 0.01), Z.d(bar, e * 0.5, 4 - e * 0.5) + 0.3, a[e] - 12 if a[e] > 64 else a[e],
                      hv(46 + (8 if e == 0 else 0)))
    sub.add(Z.t(bar), Z.d(bar, 0, 4) + 0.05, SUBP[ch], 90 if cyc < 3 else 104, att=0.6 if cyc < 3 else 0.2, rel=0.6)
# cycle 2: strings enter, cellos sing L
prev = None
for bar in range(9, 41):
    ch = ZH[bar - 1]
    t0, d = hum(Z.t(bar), 0.01) - 0.05, Z.d(bar, 0, 4) + 0.1
    r = root(ch, 36)
    cb.add(t0, d, r, 92)
    prev = voicing(ch, [(62, 69), (55, 62)], prev)
    vla.add(t0, d, prev[1], 88)
    vln2.add(t0, d, prev[0], 88)
    if bar >= 17:
        vc.add(t0, d, r + 12, 90)
    if bar >= 25:
        vln1p.add(t0, d, voicing(ch, [(74, 81)])[0], 92)
    for p in voicing(ch, [(62, 69), (57, 62), (50, 57)]):
        org_pad.add(Z.t(bar), Z.d(bar, 0, 4) + 0.05, p, 76)
    org_ped.add(Z.t(bar) - 0.02, Z.d(bar, 0, 4) + 0.04, 36 + (CH[ch][0] - 36) % 12, 86)
for tr in (cb, vla, vln2, vc, vln1p):
    pts = [(Z.t(1) - 0.1, 40)]
    for b in range(9, 41, 2):
        g = (b - 9) / 32
        pts += [(Z.t(b), 45 + 45 * g), (Z.t(b, 4.4), 80 + 47 * g), (Z.t(b + 2) - 0.05, 50 + 45 * g)]
    tr.curve(11, pts)
melody(vc_mel, Z, 9, L, transpose=-12, vel=94, legato=1.05, sd=0.012)
swell(vc_mel, [(Z.t(1), 80), (Z.t(9), 85), (Z.t(12), 112), (Z.t(13), 95), (Z.t(16), 115), (Z.t(17), 80)])
# cycle 3: horns sing L, violins the time-motif, drums and pulse
melody(hn, Z, 17, L, transpose=-12, vel=104, legato=1.02)
melody(hn2, Z, 17, L, vel=92, legato=1.02)
for bar in range(17, 25):
    for p, o, d in M2[(bar - 1) % 8]:
        vln1.add(hum(Z.t(bar, o), 0.01), Z.d(bar, o, d) + 0.06, p, hv(96))
for bar in range(17, 41):
    ch = ZH[bar - 1]
    r = root(ch, 38)
    lvl = 0 if bar < 25 else 1
    for q, v in ([(0, 112), (1.5, 88), (2, 104), (3.5, 90)] if lvl == 0 else
                 [(0, 124), (0.75, 72), (1.5, 98), (2, 120), (2.75, 76), (3.5, 106)]):
        taiko.add(hum(Z.t(bar, q), 0.004), 0.6, 32 if q in (0, 2) else 45, hv(v))
    timp.add(Z.t(bar), 1.5, timp_pitch(ch), 104 if lvl == 0 else 120)
    for e in range(8):
        v = [104, 60, 76, 92, 64, 74, 96, 70][e] + (8 if lvl else 0)
        stac_lo.add(hum(Z.t(bar, e * 0.5), 0.004), 0.2, r + 12, hv(min(127, v)))
        stac_va.add(hum(Z.t(bar, e * 0.5), 0.004), 0.2, r, hv(min(127, v - 6)))
    if bar % 2 == 1:
        bd.add(Z.t(bar), 2.0, 48, 108 if lvl == 0 else 122)
cym_swell(Z.t(17), 50, 96)
impact.add(Z.t(17), 4.0, 60, 95, size=0.9)
# cycle 4: tutti in minor – L in trumpets & violins, horns the time-motif, choir, full organ
riser.add(Z.t(23), Z.t(25) - Z.t(23), 60, 92, f0=200, f1=8000)
cym_swell(Z.t(25), 52, 115)
impact.add(Z.t(25), 4.0, 60, 118, size=1.2)
crash(Z.t(25), 118)
melody(tpt, Z, 25, L, vel=114, legato=1.02)
melody(vln1, Z, 25, L, transpose=12, vel=112, legato=1.03)
melody(choir, Z, 25, L, vel=106, legato=1.03)
for bar in range(25, 33):
    for p, o, d in M2[(bar - 1) % 8]:
        hn.add(hum(Z.t(bar, o), 0.008), Z.d(bar, o, d) + 0.05, p - 12, hv(112))
for bar in range(25, 41):
    ch = ZH[bar - 1]
    for p in voicing(ch, [(62, 69), (57, 62), (50, 57), (45, 50)]):
        org_full.add(Z.t(bar), Z.d(bar, 0, 4) + 0.04, p, 95)
    r = root(ch, 36)
    for p in voicing(ch, [(55, 62), (48, 55)]):
        tbn.add(Z.t(bar), Z.d(bar, 0, 4) + 0.04, p, 108)
    tuba.add(Z.t(bar), Z.d(bar, 0, 4) + 0.04, r - 12 if r - 12 >= 28 else r, 112)
    for p in voicing(ch, [(64, 72), (57, 64), (50, 57)]):
        choirM.add(Z.t(bar), Z.d(bar, 0, 4) + 0.04, p - 12, 100)
crash(Z.t(29), 104)
# the lift into D major
riser.add(Z.t(31), Z.t(33) - Z.t(31), 60, 115, f0=150, f1=11000)
whoosh.add(Z.t(33) - 3.2, 3.2, 60, 112)
cym_swell(Z.t(33), 52, 124)
troll(Z.t(32), Z.t(33) - 0.03, 45, 50, 127)
impact.add(Z.t(33), 4.0, 60, 127, size=1.6)
gong.add(Z.t(33), 8.0, 38, 120, size=1.3)
crash(Z.t(33), 124)
# cycle 5: D major, everything sings (I - bVI - bIII - bVII)
for tr, tp_, v in ((tpt, 0, 124), (vln1, 12, 122), (choir, 0, 120), (hn2, -12, 120)):
    melody(tr, Z, 33, L_MAJ, transpose=tp_, vel=v, legato=1.03)
for bar in range(33, 41):
    for p, o, d in M2_MAJ[(bar - 1) % 8]:
        hn.add(hum(Z.t(bar, o), 0.008), Z.d(bar, o, d) + 0.05, p - 12, hv(122))
        vln2.add(hum(Z.t(bar, o), 0.008), Z.d(bar, o, d) + 0.05, p, hv(112))
    ch = ZH[bar - 1]
    bells.add(Z.t(bar), 3.0, [p for p, d in L_MAJ][[0, 3, 4, 6, 7, 9, 11, 13][bar - 33]], 96)
    if bar % 2 == 1 and bar > 33:
        crash(Z.t(bar), 108)
    for p in voicing(ch, [(79, 86), (74, 79)]):
        trem.add(Z.t(bar), Z.d(bar, 0, 4) + 0.03, p, 118)
swell(hn, [(D.t(37), 110), (Z.t(17), 95), (Z.t(25), 112), (Z.t(33), 124), (Z.t(41), 127)])
swell(hn2, [(D.t(37), 110), (Z.t(17), 85), (Z.t(25), 100), (Z.t(33), 122)])
swell(tpt, [(D.t(37), 110), (Z.t(25), 108), (Z.t(33), 122), (Z.t(41), 127)])
swell(vln1, [(D.t(37), 110), (Z.t(17), 80), (Z.t(25), 108), (Z.t(33), 120), (Z.t(41), 127)])
swell(choir, [(D.t(37), 120), (Z.t(25), 100), (Z.t(33), 120), (Z.t(41), 127), (Z.t(43), 60)])
swell(choirM, [(D.t(37), 120), (Z.t(25), 95), (Z.t(33), 115)])
swell(trem, [(D.t(37), 120), (Z.t(33), 110), (Z.t(41), 124)])
swell(tbn, [(D.t(29) + 0.02, 112), (D.t(37), 120), (Z.t(25), 100), (Z.t(33), 118), (Z.t(41), 127)])
troll(Z.t(40), Z.t(41) - 0.03, 38, 60, 127)
sroll(Z.t(40), Z.t(41) - 0.02, 50, 124)

# epilog: the final D-major chord, then the piano remembers
EP = Z.t(41)
impact.add(EP, 4.0, 60, 124, size=1.6)
crash(EP, 118)
for tr, ps, v in ((tpt, [74, 78, 81], 124), (hn, [62, 66, 69], 124), (tbn, [50, 57], 122), (tuba, [38], 122),
                  (choir, [62, 66, 69, 74], 124), (vln1, [86, 90], 122), (vln2, [74, 78], 118), (vla, [62, 66], 116),
                  (cb, [38], 122), (timp, [38], 127), (org_full, [38, 50, 57, 62, 66, 69, 74], 100)):
    for p in ps:
        tr.add(EP, Z.d(41, 0, 3), p, v)
for p in (50, 57, 62, 66):
    org_pad.add(Z.t(41, 2), Z.t(49) - Z.t(41, 2) + 2.0, p, 70)
sub.add(Z.t(41, 2), Z.t(49) - Z.t(41, 2) + 3.0, 26, 80, att=1.5, rel=5.0)
melody(piano, Z, 42, L_MAJ[:7], transpose=12, vel=58, legato=1.15, sd=0.02)
for bar in range(42, 46):
    ch = ["D", "D", "Bb", "Bb"][bar - 42]
    r = root(ch, 36)
    for i, p in enumerate([r, r + 7, r + 12, tones(ch, r + 13, r + 17)[0]]):
        piano.add(hum(Z.t(bar) + i * 0.07, 0.01), Z.d(bar, 0, 4) + 0.6, p, hv(42 - i * 3))
for i, p in enumerate([26, 38, 45, 50, 54, 57, 62, 66, 69]):
    piano.add(Z.t(46) + i * 0.1, 9.0, p, hv(46 - i * 2))
bells.add(Z.t(46) + 0.8, 6.0, 74, 48)
# the clock returns, slows down and stops
tt, gap, k = Z.t(42), 60 / 64, 0
while gap < 2.6 and tt < Z.t(49):
    tick.add(tt, 0.05, 60, max(45, 86 - k * 3), tock=k % 2 == 1)
    tt += gap
    gap *= 1.1
    k += 1
tick.add(tt + 1.6, 0.05, 60, 60, tock=True)

END = max(Z.t(49), tt + 1.6) + 8.0
REVERB = (4.2, 2.6)
WET_SHARE = 0.31
MACRO = [(0, -3), (P.t(3), -4), (K.t(1), -4), (K.t(17), -2), (K.t(25), 0), (D.t(1), 0), (D.t(1) + 1.5, -5),
         (D.t(9), -4), (D.t(21), -2), (D.t(29), 0.5), (CUT + 1, 0.5), (Z.t(1) - 0.5, -3), (Z.t(9), -3),
         (Z.t(17), -1.5), (Z.t(25), 0), (Z.t(33), 1), (Z.t(42), 0), (END, -1)]
AUTO = {
    "org8": [(0, -12), (K.t(1), -12), (K.t(9), -8), (K.t(17), -4), (K.t(25), 0), (K.end, 0)],
    "org16": [(0, -12), (K.t(1), -12), (K.t(9), -8), (K.t(17), -4), (K.t(25), -1), (D.t(1), -8), (D.t(9), -6),
              (D.t(21), -2), (D.t(29), 0)],
    "aeg_org": [(0, -8), (K.t(17), -3), (K.t(25), 0)],
    "piano": [(0, 0), (Z.t(41), 0), (Z.t(42), -4)],
    "tick": [(0, 0), (K.t(1), -2), (D.t(1), -1), (D.t(27), 1), (Z.t(1), -3)],
}
MARKS = [("I", "Prolog", 0.0), ("II", "Kornfeld", K.t0), ("III", "Andocken", D.t0), ("IV", "Zeit", Z.t0),
         ("V", "D-Dur", Z.t(33)), ("VI", "Epilog", Z.t(42))]
SECTIONS = {"Prolog": 0.0, "Kornfeld": K.t0, "Kornfeld tutti": K.t(25), "Andocken": D.t0, "Aufstieg": D.t(21),
            "Schicksal": D.t(29), "Cut": CUT, "Zeit": Z.t0, "Zeit 3": Z.t(17), "Zeit 4": Z.t(25),
            "D-Dur": Z.t(33), "Epilog": Z.t(42), "END": END}
