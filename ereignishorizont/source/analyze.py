import sys, numpy as np, soundfile as sf, pyloudnorm as pyln, matplotlib
matplotlib.use("Agg"); import matplotlib.pyplot as plt
from scipy import signal
import composition as C
wav = sys.argv[1]; out = sys.argv[2]
x, sr = sf.read(wav); m = x.mean(1)
meter = pyln.Meter(sr)
print("integrated LUFS", round(meter.integrated_loudness(x),2), "peak dBFS", round(20*np.log10(np.abs(x).max()),2))
# short-term loudness (3s window, 0.5 s hop)
hop, win = int(0.5*sr), int(3*sr)
st=[]; ts=[]
for i in range(0, len(x)-win, hop):
    seg = x[i:i+win]
    ms = np.mean(seg**2)
    st.append(10*np.log10(ms+1e-12)+3.0); ts.append((i+win/2)/sr)
st=np.array(st); ts=np.array(ts)
fig, ax = plt.subplots(3,1, figsize=(18,12), gridspec_kw=dict(height_ratios=[1,2,1.2]))
ax[0].plot(ts, st); ax[0].set_ylim(-60,0); ax[0].set_ylabel("RMS dB (3s)"); ax[0].grid(alpha=.3)
for k,v in C.SECTIONS.items(): 
    for a in ax: a.axvline(v, color='r', alpha=.4)
    ax[0].text(v, -5, k)
f, t, Z = signal.spectrogram(m, sr, nperseg=8192, noverlap=4096)
Z = 10*np.log10(Z+1e-14)
ax[1].pcolormesh(t, f, Z, vmin=Z.max()-90, vmax=Z.max(), shading='auto', cmap='magma')
ax[1].set_yscale('symlog', linthresh=100); ax[1].set_ylim(20, 20000)
# band energies over time
bands=[(20,60),(60,250),(250,2000),(2000,6000),(6000,20000)]
for lo,hi in bands:
    sel=(f>=lo)&(f<hi); e=10*np.log10(np.sum(10**(Z[sel]/10),0)+1e-14)
    ax[2].plot(t, e, label=f"{lo}-{hi}")
ax[2].legend(); ax[2].grid(alpha=.3)
plt.tight_layout(); plt.savefig(out, dpi=70)
# per-section stats
secs=[("I",C.SECTIONS["I"],C.SECTIONS["II"]),("II",C.SECTIONS["II"],C.SECTIONS["III"]),("III",C.SECTIONS["III"],C.SECTIONS["III_end"]),("IV1-2",C.SECTIONS["IV"],C.SECTIONS["IV_c3"]),("IV3",C.SECTIONS["IV_c3"],C.SECTIONS["IV_c4"]),("IV4",C.SECTIONS["IV_c4"],C.SECTIONS["IV_c5"]),("IV5",C.SECTIONS["IV_c5"],C.SECTIONS["V"]),("V",C.SECTIONS["V"],C.SECTIONS["END"])]
for n,a,b in secs:
    seg=x[int(a*sr):int(b*sr)]
    sp=np.abs(np.fft.rfft(seg.mean(1)))**2; fr=np.fft.rfftfreq(len(seg),1/sr)
    tot=sp.sum()
    bd=[10*np.log10(sp[(fr>=lo)&(fr<hi)].sum()/tot+1e-12) for lo,hi in bands]
    print(f"{n:6s} rms {10*np.log10(np.mean(seg**2))+3:6.1f} dB  max-st {st[(ts>a)&(ts<b)].max():6.1f}  bands%: "+" ".join(f"{v:6.1f}" for v in bd))
