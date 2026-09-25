"""Objective listening proxies: loudness curve, spectrogram, band balance, distortion & click checks."""
import sys, importlib, numpy as np, soundfile as sf, pyloudnorm as pyln, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
from scipy import signal
C = importlib.import_module(sys.argv[1]); wav = sys.argv[2]; out = sys.argv[3]
x, sr = sf.read(wav); m = x.mean(1)
meter = pyln.Meter(sr)
print("integrated LUFS", round(meter.integrated_loudness(x), 2), " sample peak dBFS", round(20*np.log10(np.abs(x).max()), 2),
      " clipped samples", int(np.sum(np.abs(x) >= 0.999)))
hop, win = int(0.5*sr), int(3*sr)
ts = np.arange(0, len(x)-win, hop)
st = np.array([10*np.log10(np.mean(x[i:i+win]**2)+1e-12)+3 for i in ts]); ts = (ts+win/2)/sr
fig, ax = plt.subplots(3, 1, figsize=(18, 11), gridspec_kw=dict(height_ratios=[1, 2, 1.2]))
ax[0].plot(ts, st); ax[0].set_ylim(-60, 0); ax[0].grid(alpha=.3); ax[0].set_ylabel("RMS dB (3 s)")
for k, v in C.SECTIONS.items():
    for a in ax: a.axvline(v, color="r", alpha=.35)
    ax[0].text(v, -6, k, fontsize=8)
f, t, Z = signal.spectrogram(m, sr, nperseg=8192, noverlap=4096); Z = 10*np.log10(Z+1e-14)
ax[1].pcolormesh(t, f, Z, vmin=Z.max()-90, vmax=Z.max(), shading="auto", cmap="magma")
ax[1].set_yscale("symlog", linthresh=100); ax[1].set_ylim(20, 20000)
bands = [(20, 60), (60, 250), (250, 2000), (2000, 6000), (6000, 20000)]
for lo, hi in bands:
    sel = (f >= lo) & (f < hi); ax[2].plot(t, 10*np.log10(np.sum(10**(Z[sel]/10), 0)+1e-14), label=f"{lo}-{hi}")
ax[2].legend(); ax[2].grid(alpha=.3); plt.tight_layout(); plt.savefig(out, dpi=65)
keys = sorted(C.SECTIONS.items(), key=lambda kv: kv[1])
for (k, a), (_, b) in zip(keys[:-1], keys[1:]):
    seg = x[int(a*sr):int(b*sr)]
    sp = np.abs(np.fft.rfft(seg.mean(1)))**2; fr = np.fft.rfftfreq(len(seg), 1/sr); tot = sp.sum()
    bd = [10*np.log10(sp[(fr >= lo) & (fr < hi)].sum()/tot+1e-12) for lo, hi in bands]
    print(f"{k:12s} {a:6.1f}-{b:6.1f} rms {10*np.log10(np.mean(seg**2))+3:6.1f}  bands: " + " ".join(f"{v:6.1f}" for v in bd))
# click / glitch detector over EVERYTHING (no exclusions): HF spikes relative to local HF energy
h = signal.sosfilt(signal.butter(4, 9000, "high", fs=sr, output="sos"), m)
w = 4800; env = np.sqrt(np.convolve(h**2, np.ones(w)/w, "same"))+1e-6
cand = np.nonzero(np.abs(h)/env > 10)[0]/sr
groups = np.split(cand, np.nonzero(np.diff(cand) > 0.05)[0]+1) if len(cand) else []
print("HF spike events (>10x local):", len(groups), [round(g[0], 2) for g in groups[:25]])
