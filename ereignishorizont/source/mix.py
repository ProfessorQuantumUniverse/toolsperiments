"""Render all stems, gain-stage, mix through reverb buses, master."""
import os, sys, time, hashlib, pickle, inspect
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from pedalboard import Pedalboard, Compressor, Limiter
import engine as E
from engine import SR
import composition as C

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(E.BUILD, "out")
os.makedirs(OUT, exist_ok=True)
STEMS = os.path.join(E.BUILD, "stems")
os.makedirs(STEMS, exist_ok=True)
TOTAL = C.END
N = int(TOTAL * SR)
SEC = C.SECTIONS

# ------------------------------------------------------------------ mix table
# target: active loudness of the stem (dBFS RMS, loudest 3 s window)
# sends: (cathedral, hall)
M = {
    "org_main":  dict(t=-21, pan=0, w=1.25, hp=30, send=(0.50, 0.10)),
    "org_full":  dict(t=-21, pan=0, w=1.3, hp=30, send=(0.55, 0.10)),
    "org_chord": dict(t=-22, pan=0, w=1.3, hp=30, send=(0.60, 0.10)),
    "org_lh":    dict(t=-26, pan=0, w=1.0, hp=40, send=(0.45, 0.10)),
    "org_soft":  dict(t=-25, pan=0, w=1.2, hp=40, send=(0.55, 0.10)),
    "ped_soft":  dict(t=-28, pan=0, w=0.6, hp=30, send=(0.30, 0.0)),
    "ped":       dict(t=-25, pan=0, w=0.6, hp=28, send=(0.30, 0.0)),
    "ped_full":  dict(t=-23, pan=0, w=0.7, hp=26, send=(0.35, 0.0)),
    "piano":     dict(t=-20, pan=0, w=0.9, hp=35, lp=9000, send=(0.18, 0.35)),
    "celesta":   dict(t=-30, pan=0.3, w=1.0, send=(0.45, 0.2)),
    "vln1":      dict(t=-20, pan=-0.45, w=0.8, hp=150, eq=(("high", 4500, 2.5),), send=(0.22, 0.35)),
    "vln2":      dict(t=-22, pan=-0.2, w=0.8, hp=120, eq=(("high", 4500, 2.0),), send=(0.22, 0.35)),
    "vla":       dict(t=-23, pan=0.2, w=0.8, hp=90, lp=9500, send=(0.22, 0.35)),
    "vc":        dict(t=-22, pan=0.35, w=0.8, hp=45, send=(0.2, 0.35)),
    "vc_mel":    dict(t=-20, pan=0.3, w=0.8, hp=45, send=(0.2, 0.4)),
    "cb":        dict(t=-23, pan=0.45, w=0.7, hp=28, send=(0.15, 0.3)),
    "strL":      dict(t=-28, pan=0, w=1.2, hp=90, send=(0.3, 0.3)),
    "trem":      dict(t=-24, pan=0.1, w=1.1, hp=40, send=(0.25, 0.3)),
    "spic_lo":   dict(t=-22, pan=0.2, w=0.9, hp=35, send=(0.08, 0.25)),
    "spic_hi":   dict(t=-25, pan=-0.3, w=1.0, hp=180, send=(0.15, 0.3)),
    "hn":        dict(t=-20, pan=-0.3, w=0.8, hp=60, eq=(("peak", 2200, 1.5, 0.8),), send=(0.3, 0.3)),
    "hn2":       dict(t=-23, pan=-0.2, w=0.8, hp=60, send=(0.3, 0.3)),
    "hn_pad":    dict(t=-24, pan=-0.35, w=0.8, hp=60, send=(0.3, 0.3)),
    "tpt":       dict(t=-21, pan=0.15, w=0.7, hp=120, send=(0.28, 0.3)),
    "tpt_st":    dict(t=-25, pan=0.2, w=0.7, hp=120, send=(0.25, 0.3)),
    "tbn":       dict(t=-22, pan=0.35, w=0.8, hp=50, send=(0.25, 0.3)),
    "btb":       dict(t=-24, pan=0.4, w=0.7, hp=40, send=(0.2, 0.3)),
    "tuba":      dict(t=-23, pan=0.45, w=0.6, hp=35, send=(0.15, 0.25)),
    "choir":     dict(t=-21, pan=0, w=1.3, hp=90, eq=(("peak", 3000, 2, 0.7),), send=(0.5, 0.15)),
    "choir2":    dict(t=-25, pan=0, w=1.4, hp=90, send=(0.5, 0.15)),
    "choir_mel": dict(t=-22, pan=0, w=1.0, hp=100, eq=(("peak", 3000, 2, 0.7),), send=(0.45, 0.2)),
    "oohs":      dict(t=-24, pan=0, w=1.4, hp=90, send=(0.5, 0.15)),
    "timp":      dict(t=-20, pan=0, w=0.8, hp=35, send=(0.2, 0.35)),
    "taiko":     dict(t=-19, pan=0, w=1.2, hp=42, eq=(("low", 110, -4), ("peak", 2800, 3, 0.8)), send=(0.1, 0.28)),
    "bd":        dict(t=-21, pan=0, w=1.0, hp=25, send=(0.15, 0.3)),
    "cym":       dict(t=-24, pan=0, w=1.4, hp=300, send=(0.2, 0.3)),
    "chimes":    dict(t=-26, pan=-0.2, w=1.0, hp=200, send=(0.4, 0.2)),
    "glock":     dict(t=-30, pan=0.25, w=1.0, hp=400, send=(0.4, 0.2)),
    "tick":      dict(peak=-13, pan=0, w=1.0, hp=250, send=(0.0, 0.10)),
    "impact":    dict(peak=-6, hp=25, pan=0, w=1.0, send=(0.18, 0.0)),
    "riser":     dict(t=-25, pan=0, w=1.3, send=(0.1, 0.2)),
    "whoosh":    dict(t=-25, pan=0, w=1.3, send=(0.05, 0.2)),
    "pad":       dict(t=-29, pan=0, w=1.4, hp=120, send=(0.4, 0.1)),
    "sub":       dict(t=-27, pan=0, w=0.0, hp=28, lp=140, send=(0.0, 0.0)),
    "braam":     dict(t=-22, pan=0, w=1.2, hp=30, send=(0.25, 0.1)),
    "heart":     dict(peak=-14, pan=0, w=0.0, lp=200, send=(0.0, 0.08)),
    "atmos":     dict(t=-35, pan=0, w=1.5, send=(0.3, 0.0)),
}

II, III, IV, V = SEC["II"], SEC["III"], SEC["IV"], SEC["V"]
b2 = 60 / 100 * 4
b3 = 60 / 112 * 4
# gain automation (t, dB)
AUTO = {
    "org_main": [(0, -9), (II, -9), (II + 24 * b2, -1), (II + 32 * b2, 0), (III, -13),
                 (III + 8 * b3, -8), (III + 24 * b3, -1), (III + 36 * b3, 0), (IV, -4)],
    "org_lh": [(0, -6), (II, -6), (II + 32 * b2, 0), (III, -6), (III + 24 * b3, 0)],
    "ped_soft": [(0, -30), (8, -3), (II, -2), (III, -6), (IV, -4)],
    "ped": [(0, 0)],
    "tick": [(0, -6), (10, -2), (II, -1), (III, -1), (III + 28 * b3, 1), (V, -3)],
    "atmos": [(0, 0)],
}


I_ = SEC["I"]
bI = 60 / 66 * 4
bIV = 60 / 62 * 4
MACRO = [(0, -11), (I_ + 2 * bI, -9), (I_ + 10 * bI, -6), (I_ + 13 * bI, -4), (II - 0.2, -1),
         (II, -3), (II + 16 * b2, -2), (II + 24 * b2, 0), (III - 0.1, 0.5),
         (III, 0.5), (III + 1.2 * b3, 0), (III + 2 * b3, -4), (III + 16 * b3, -2), (III + 24 * b3, 0),
         (III + 32 * b3, 1), (SEC["III_end"] + 2.5, 1),
         (IV - 0.3, -6), (IV, -6), (IV + 8 * bIV, -5), (IV + 16 * bIV, -2), (IV + 24 * bIV, 0),
         (IV + 32 * bIV, 1), (V + 1.5 * bIV, 1), (V + 3 * bIV, -2), (C.END, -3)]


def stem_key(tr):
    src = inspect.getsource(E) if tr.kind != "sf2" else ""
    h = hashlib.md5(pickle.dumps((tr.kind, sorted(tr.kw.items()), tr.notes, tr.cc, TOTAL)) +
                    src.encode()).hexdigest()[:14]
    return os.path.join(STEMS, f"{tr.name}_{h}.npy")


def render_all():
    stems = {}
    for name, tr in C.S.tracks.items():
        if not tr.notes:
            continue
        path = stem_key(tr)
        if os.path.exists(path):
            stems[name] = path
            continue
        t0 = time.time()
        x = E.render_track(tr, TOTAL)
        np.save(path, x.astype(np.float32))
        stems[name] = path
        print(f"  rendered {name:10s} {time.time() - t0:6.1f}s  peak={np.abs(x).max():.3f}", flush=True)
        del x
    return stems


def active_level(x, win=3.0):
    m = (x.astype(np.float64) ** 2).mean(1)
    w = int(win * SR)
    k = len(m) // w
    blocks = m[: k * w].reshape(k, w).mean(1)
    # hop by half-window
    blocks2 = m[w // 2: w // 2 + (k - 1) * w].reshape(k - 1, w).mean(1) if k > 1 else blocks
    mx = max(blocks.max(), blocks2.max())
    return 10 * np.log10(mx + 1e-12)


def main():
    t0 = time.time()
    stems = render_all()
    print(f"stems ready ({time.time() - t0:.0f}s)")
    dry = np.zeros((N, 2), np.float32)
    cath = np.zeros((N, 2), np.float32)
    hall = np.zeros((N, 2), np.float32)
    report = []
    for name, x in stems.items():
        cfg = M[name]
        x = np.load(x)
        if "peak" in cfg:
            g = cfg["peak"] - 20 * np.log10(np.abs(x).max() + 1e-9)
        else:
            g = cfg["t"] - active_level(x)
        y = E.channel(x, gain_db=g, pan=cfg.get("pan", 0), width=cfg.get("w", 1.0),
                      hp_f=cfg.get("hp"), lp_f=cfg.get("lp"), eq=cfg.get("eq", ()),
                      auto=AUTO.get(name))
        dry += y
        cs, hs = cfg["send"]
        if cs:
            cath += y * cs
        if hs:
            hall += y * hs
        report.append((name, g))
    print("gain staging:", " ".join(f"{n}:{g:+.0f}" for n, g in report))
    ir_c = E.make_ir(rt_low=6.5, rt_high=2.6, length=8.0, predelay=0.035, seed=11)
    ir_h = E.make_ir(rt_low=2.6, rt_high=1.3, length=4.0, predelay=0.018, seed=5)
    wet_c = E.convolve(E.hp(cath, 90), ir_c)
    wet_h = E.convolve(E.hp(hall, 70), ir_h)
    mix = dry + wet_c * 0.55 + wet_h * 0.6
    mix *= E.gain_curve(MACRO, len(mix))[:, None]
    np.save(os.path.join(OUT, "premaster.npy"), mix)
    master(mix)


def master(mix, target_lufs=-16.0):
    x = E.hp(mix, 22, 2)
    x = E.peak_eq(x, 3500, 1.5, 0.7)
    x = E.shelf(x, 9000, 2.0, "high")
    x = E.peak_eq(x, 320, -1.5, 0.8)       # de-mud
    board = Pedalboard([Compressor(threshold_db=-22, ratio=1.8, attack_ms=30, release_ms=300)])
    meter = pyln.Meter(SR)
    pre = x.astype(np.float32)
    gain = target_lufs - meter.integrated_loudness(pre)
    for it in range(3):
        y = board(pre * 10 ** (gain / 20), SR)
        y = np.tanh(y * 1.05) / 1.05 if it >= 0 else y   # gentle saturation
        lim = Pedalboard([Limiter(threshold_db=-1.3, release_ms=150)])
        y = lim(y.astype(np.float32), SR)
        lufs = meter.integrated_loudness(y)
        print(f"  master pass {it}: gain {gain:+.1f} dB -> {lufs:.2f} LUFS, peak {20*np.log10(np.abs(y).max()):.2f} dBFS")
        if abs(lufs - target_lufs) < 0.3:
            break
        gain += target_lufs - lufs
    # fades
    fi = int(0.3 * SR)
    y[:fi] *= np.linspace(0, 1, fi)[:, None]
    fo = int(4.0 * SR)
    y[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
    # true-peak safety (4x oversampled) at -1.5 dBTP
    from scipy import signal
    tp = 20 * np.log10(np.abs(signal.resample_poly(y, 4, 1, axis=0)).max())
    if tp > -1.5:
        y = y * 10 ** ((-1.5 - tp) / 20)
    y = np.clip(y, -0.99, 0.99)
    wav = os.path.join(OUT, "ereignishorizont.wav")
    sf.write(wav, y, SR, subtype="PCM_24")
    print("wrote", wav)


if __name__ == "__main__":
    main()
