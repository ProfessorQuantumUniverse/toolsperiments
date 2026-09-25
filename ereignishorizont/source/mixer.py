"""
V2 mixer: render stems, gain-stage, place in a film-scoring stage, hybrid convolution reverb,
mastering chain (HP 30 Hz, +55 Hz weight, soft top end, glue compression, true-peak limiter -1 dBTP).

usage: python3 mixer.py <composition_module> <out_basename>
"""
import os, sys, time, hashlib, pickle, inspect, importlib, json
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from pedalboard import Pedalboard, Compressor
import studio as E
from studio import SR

MOD = sys.argv[1]
NAME = sys.argv[2]
C = importlib.import_module(MOD)
BUILD = os.environ.get("BUILD_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "build"))
OUT = os.path.join(BUILD, "out")
STEMS = os.path.join(BUILD, "stems", MOD)
os.makedirs(OUT, exist_ok=True)
os.makedirs(STEMS, exist_ok=True)
TOTAL = C.END
N = int(TOTAL * SR)

# (target active dB, pan, width, highpass, lowpass, (cathedral send, hall send))
DEFAULT = {
    "piano": (-19, 0.0, 1.0, 35, 12000, (0.30, 0.45)),
    "vln1": (-20, -0.45, 0.8, 150, 11000, (0.35, 0.35)), "vln1p": (-23, -0.45, 0.8, 150, 11000, (0.35, 0.35)),
    "vln2": (-22, -0.2, 0.8, 120, 11000, (0.35, 0.35)), "vla": (-23, 0.2, 0.8, 90, 9500, (0.35, 0.35)),
    "vc": (-22, 0.35, 0.8, 45, 9000, (0.3, 0.35)), "vc_mel": (-20, 0.3, 0.8, 45, 9000, (0.3, 0.35)),
    "cb": (-23, 0.45, 0.7, 30, 6000, (0.25, 0.3)), "trem": (-24, -0.25, 1.1, 150, 10000, (0.35, 0.35)),
    "hn": (-19, -0.3, 0.8, 50, 9000, (0.4, 0.3)), "hn2": (-21, -0.25, 0.8, 50, 9000, (0.4, 0.3)),
    "hn_pad": (-23, -0.35, 0.8, 50, 9000, (0.4, 0.3)),
    "tbn": (-20, 0.35, 0.8, 45, 8000, (0.35, 0.3)), "btbn": (-22, 0.4, 0.7, 35, 7000, (0.3, 0.3)),
    "tuba": (-23, 0.45, 0.6, 28, 5000, (0.25, 0.25)), "tpt": (-21, 0.15, 0.7, 150, 10000, (0.35, 0.3)),
    "choir": (-21, 0.0, 1.3, 90, 10000, (0.55, 0.15)), "choirM": (-22, 0.0, 1.2, 70, 9000, (0.5, 0.15)),
    "timp": (-20, 0.0, 0.9, 30, 8000, (0.3, 0.35)), "timp_roll": (-22, 0.0, 0.9, 30, 8000, (0.3, 0.35)),
    "kit": (-22, 0.0, 1.2, 30, 12000, (0.25, 0.3)), "cym": (-26, 0.0, 1.4, 300, 12000, (0.3, 0.3)),
    "taiko": (-19, 0.0, 1.2, 38, 8000, (0.2, 0.3)), "bells": (-27, -0.2, 1.0, 150, 10000, (0.5, 0.2)),
    "aeg_org": (-27, 0.0, 1.2, 40, 8000, (0.5, 0.15)),
    "org8": (-21, 0.0, 1.3, 40, 9000, (0.55, 0.1)), "org16": (-22, 0.0, 1.3, 60, 9000, (0.55, 0.1)),
    "org_ped": (-23, 0.0, 0.6, 28, 3000, (0.35, 0.0)), "org_full": (-21, 0.0, 1.3, 40, 9000, (0.6, 0.1)),
    "org_pad": (-26, 0.0, 1.2, 60, 8000, (0.6, 0.1)),
    "tick": (None, 0.0, 1.0, 300, 12000, (0.05, 0.15)), "sub": (-24, 0.0, 0.0, 25, 120, (0.0, 0.0)),
    "impact": (None, 0.0, 1.0, 28, 10000, (0.25, 0.0)), "riser": (-26, 0.0, 1.3, 120, 11000, (0.15, 0.2)),
    "whoosh": (-26, 0.0, 1.3, 300, 11000, (0.1, 0.2)),
    # Leviathan
    "stac_lo": (-20, 0.25, 0.9, 35, 9000, (0.15, 0.3)), "stac_va": (-23, 0.1, 0.9, 80, 9000, (0.15, 0.3)),
    "stac_hi": (-23, -0.3, 1.0, 150, 10000, (0.2, 0.3)), "pizz": (-26, 0.3, 0.8, 40, 8000, (0.15, 0.3)),
    "brass_st": (-22, 0.2, 0.9, 45, 8000, (0.3, 0.3)), "cbsn": (-25, 0.25, 0.7, 25, 5000, (0.3, 0.3)),
    "trem_lo": (-25, 0.35, 1.0, 30, 7000, (0.3, 0.3)), "hn_swell": (-21, -0.3, 0.8, 45, 8000, (0.45, 0.3)),
    "sea": (-26, 0.0, 1.5, 30, 9000, (0.2, 0.0)), "thunder": (None, 0.0, 1.2, 25, 8000, (0.3, 0.0)),
    "gong": (None, 0.0, 1.2, 35, 10000, (0.4, 0.0)), "bd": (-21, 0.0, 1.0, 28, 8000, (0.25, 0.3)),
    "snare": (-24, 0.05, 1.0, 120, 12000, (0.25, 0.3)), "vln_hi": (-22, -0.4, 0.8, 200, 11000, (0.4, 0.35)),
}
PEAKS = {"tick": -14, "impact": -6, "thunder": -9, "gong": -8}
MIXOVR = getattr(C, "MIX", {})
AUTO = getattr(C, "AUTO", {})
MACRO = getattr(C, "MACRO", None)


def stem_key(tr):
    src = inspect.getsource(E) if tr.kind != "sf2" else ""
    h = hashlib.md5(pickle.dumps((tr.kind, sorted(tr.kw.items()), tr.notes, tr.cc, TOTAL)) +
                    src.encode()).hexdigest()[:14]
    return os.path.join(STEMS, f"{tr.name}_{h}.npy")


def active_level(x, win=3.0):
    m = (x.astype(np.float64) ** 2).mean(1)
    w = int(win * SR)
    k = len(m) // w
    b1 = m[: k * w].reshape(k, w).mean(1)
    b2 = m[w // 2: w // 2 + (k - 1) * w].reshape(k - 1, w).mean(1)
    return 10 * np.log10(max(b1.max(), b2.max()) + 1e-12)


def main():
    t0 = time.time()
    paths = {}
    for name, tr in C.S.tracks.items():
        if not tr.notes:
            continue
        p = stem_key(tr)
        if not os.path.exists(p):
            x = E.render_track(tr, TOTAL)
            np.save(p, x.astype(np.float32))
            print(f"  rendered {name:10s} peak {np.abs(x).max():.3f}", flush=True)
            del x
        paths[name] = p
    print(f"stems ready ({time.time() - t0:.0f}s)")
    dry = np.zeros((N, 2), np.float32)
    cath = np.zeros((N, 2), np.float32)
    hall = np.zeros((N, 2), np.float32)
    rep = []
    for name, p in paths.items():
        tgt, pan, w, hpf, lpf, (cs, hs) = DEFAULT[name]
        o = MIXOVR.get(name, {})
        tgt = o.get("t", tgt)
        cs, hs = o.get("send", (cs, hs))
        x = np.load(p)
        if name in PEAKS or tgt is None:
            g = PEAKS[name] - 20 * np.log10(np.abs(x).max() + 1e-9)
        else:
            g = tgt - active_level(x)
        g += o.get("trim", 0.0)
        y = E.channel(x, gain_db=g, pan=o.get("pan", pan), width=o.get("w", w), hp_f=hpf, lp_f=lpf,
                      eq=o.get("eq", ()), auto=AUTO.get(name))
        dry += y
        if cs:
            cath += y * cs
        if hs:
            hall += y * hs
        rep.append(f"{name}:{g:+.0f}")
        del x, y
    print("gain staging:", " ".join(rep))
    rt_c, rt_h = getattr(C, "REVERB", (4.2, 2.6))
    ir_c = E.hybrid_ir(tail_rt=rt_c, tail_rt_high=rt_c * 0.45, tail_level=0.75, length=rt_c * 1.6, seed=31)
    ir_h = E.hybrid_ir(tail_rt=rt_h, tail_rt_high=rt_h * 0.5, tail_level=0.45, length=rt_h * 1.6, seed=7)
    wet = E.convolve(E.hp(cath, 120), ir_c) + E.convolve(E.hp(hall, 90), ir_h) * 0.8
    wet = E.lp(wet, 9000, 2)
    # wet share ~30 % (amplitude ratio wet / (dry + wet) measured on RMS)
    rd, rw = np.sqrt(np.mean(dry ** 2)), np.sqrt(np.mean(wet ** 2))
    target_share = getattr(C, "WET_SHARE", 0.30)
    k = target_share / (1 - target_share) * rd / rw
    wet *= k
    mix = dry + wet
    print(f"wet share {np.sqrt(np.mean(wet ** 2)) / (rd + np.sqrt(np.mean(wet ** 2))):.2f}")
    if MACRO:
        mix *= E.gain_curve(MACRO, len(mix))[:, None]
    np.save(os.path.join(BUILD, f"{NAME}_premaster.npy"), mix)
    master(mix)


def master(mix):
    x = E.hp(mix, 30, 4)                      # rumble filter (4th-order @ 30 Hz)
    x = E.peak_eq(x, 55, 2.5, 0.9)            # weight for drums & basses
    x = E.peak_eq(x, 300, -1.2, 0.8)          # de-mud
    x = E.shelf(x, 10000, -2.0, "high")       # soft top end
    x = E.lp(x, 18000, 2)
    comp = Pedalboard([Compressor(threshold_db=-20, ratio=1.8, attack_ms=35, release_ms=280)])
    x = comp(x.astype(np.float32), SR)
    meter = pyln.Meter(SR)
    # choose the gain so that the limiter never has to work harder than ~3 dB
    gain = 0.0
    for it in range(8):
        y, gr = E.limiter(x * 10 ** (gain / 20), ceiling_db=-1.0)
        mgr = -gr.min()
        if abs(mgr - 3.0) < 0.3:
            break
        gain += 3.0 - mgr
    lufs = meter.integrated_loudness(y)
    tp = 20 * np.log10(E.true_peak(y))
    print(f"master: gain {gain:+.1f} dB, max limiter GR {mgr:.1f} dB, "
          f"time with GR>1dB {np.mean(gr < -1) * 100:.1f}%, {lufs:.1f} LUFS, true peak {tp:.2f} dBTP")
    fi = int(0.05 * SR)
    y[:fi] *= np.linspace(0, 1, fi)[:, None]
    fo = int(3.0 * SR)
    y[-fo:] *= (np.linspace(1, 0, fo) ** 2)[:, None]
    wav = os.path.join(OUT, f"{NAME}.wav")
    sf.write(wav, y, SR, subtype="PCM_24")
    json.dump({"lufs": lufs, "true_peak": tp, "max_gr": float(mgr)}, open(os.path.join(OUT, f"{NAME}.json"), "w"))
    print("wrote", wav)


if __name__ == "__main__":
    pm = os.path.join(BUILD, f"{NAME}_premaster.npy")
    if os.environ.get("REMASTER") and os.path.exists(pm):
        master(np.load(pm))
    else:
        main()
