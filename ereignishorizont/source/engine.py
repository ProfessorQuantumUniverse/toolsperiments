"""
Audio engine for "EREIGNISHORIZONT" – a small orchestral production toolkit.

 * Score / Track containers (notes in seconds, CC automation)
 * SF2 rendering through FluidSynth (one MIDI file per stem)
 * Pure-numpy instruments: additive pipe organ, clock, impacts, risers,
   braams, sub bass, supersaw pads, heartbeat, space atmosphere
 * Mixing: EQ, panning, width, gain automation, convolution reverb buses
   with synthesised cathedral / hall impulse responses, master chain.
"""
import os, subprocess, hashlib
import numpy as np
import soundfile as sf
import mido
from scipy import signal

SR = 48000
RNG = np.random.default_rng(7)
HERE = os.path.dirname(os.path.abspath(__file__))
SF_DIR = os.environ.get("SF_DIR", os.path.join(HERE, "soundfonts"))
SSO = os.path.join(SF_DIR, "Sonatina_Symphonic_Orchestra.sf2")
MSG = os.path.join(SF_DIR, "MuseScore_General.sf2")
BUILD = os.environ.get("BUILD_DIR", os.path.join(HERE, "build"))
CACHE = os.path.join(BUILD, "cache")
os.makedirs(CACHE, exist_ok=True)

NOTE_IDX = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def n(name):
    """'C#4' -> 61, 'Bb2' -> 46"""
    letter = name[0]
    rest = name[1:]
    acc = 0
    while rest and rest[0] in "#b":
        acc += 1 if rest[0] == "#" else -1
        rest = rest[1:]
    return 12 * (int(rest) + 1) + NOTE_IDX[letter] + acc


def hz(p):
    return 440.0 * 2 ** ((p - 69) / 12.0)


# --------------------------------------------------------------------------
# Score
# --------------------------------------------------------------------------
class Track:
    def __init__(self, name, kind, **kw):
        self.name, self.kind, self.kw = name, kind, kw
        self.notes = []      # (t, dur, pitch, vel, extra)
        self.cc = []         # (t, ctrl, val)

    def add(self, t, dur, pitch, vel=80, **extra):
        if dur > 0:
            self.notes.append((float(t), float(dur), pitch, int(np.clip(vel, 1, 127)), extra))

    def curve(self, ctrl, pts, rate=25.0):
        """Linear CC curve from list of (t, value)."""
        for (t0, v0), (t1, v1) in zip(pts[:-1], pts[1:]):
            steps = max(1, int((t1 - t0) * rate))
            for i in range(steps):
                a = i / steps
                self.cc.append((t0 + a * (t1 - t0), ctrl, int(round(v0 + a * (v1 - v0)))))
        self.cc.append((pts[-1][0], ctrl, int(pts[-1][1])))

    def end(self):
        e = 0.0
        for t, d, *_ in self.notes:
            e = max(e, t + d)
        for t, *_ in self.cc:
            e = max(e, t)
        return e


class Score:
    def __init__(self):
        self.tracks = {}

    def track(self, name, kind="sf2", **kw):
        if name not in self.tracks:
            self.tracks[name] = Track(name, kind, **kw)
        return self.tracks[name]

    def __getitem__(self, k):
        return self.tracks[k]

    def end(self):
        return max(t.end() for t in self.tracks.values())


# --------------------------------------------------------------------------
# FluidSynth rendering
# --------------------------------------------------------------------------
def render_sf2(track, total_len):
    sfpath = track.kw["sf"]
    bank, prog = track.kw.get("bank", 0), track.kw["prog"]
    tpb = 960                      # ticks per beat, tempo 120 -> 1920 ticks / s
    tps = 1920.0
    ev = []
    for t, d, p, v, ex in track.notes:
        ev.append((int(round(t * tps)), 1, ("on", p, v)))
        ev.append((int(round((t + d) * tps)), 0, ("off", p, 0)))
    for t, c, v in track.cc:
        ev.append((int(round(t * tps)), 2, ("cc", c, int(np.clip(v, 0, 127)))))
    ev.sort(key=lambda e: (e[0], e[1]))
    mf = mido.MidiFile(ticks_per_beat=tpb)
    tr = mido.MidiTrack()
    mf.tracks.append(tr)
    tr.append(mido.MetaMessage("set_tempo", tempo=500000, time=0))
    tr.append(mido.Message("control_change", control=0, value=bank, time=0))
    tr.append(mido.Message("control_change", control=32, value=0, time=0))
    tr.append(mido.Message("program_change", program=prog, time=0))
    tr.append(mido.Message("control_change", control=7, value=127, time=0))
    tr.append(mido.Message("control_change", control=10, value=64, time=0))
    if not any(c == 11 for _, c, _ in track.cc):
        tr.append(mido.Message("control_change", control=11, value=127, time=0))
    tr.append(mido.Message("control_change", control=91, value=0, time=0))
    tr.append(mido.Message("control_change", control=93, value=0, time=0))
    last = 0
    for tick, _, e in ev:
        dt = max(0, tick - last)
        last = tick
        if e[0] == "on":
            tr.append(mido.Message("note_on", note=e[1], velocity=e[2], time=dt))
        elif e[0] == "off":
            tr.append(mido.Message("note_off", note=e[1], velocity=0, time=dt))
        else:
            tr.append(mido.Message("control_change", control=e[1], value=e[2], time=dt))
    endtick = int(total_len * tps)
    tr.append(mido.Message("control_change", control=64, value=0, time=max(0, endtick - last)))
    mid = os.path.join(CACHE, track.name + ".mid")
    mf.save(mid)
    h = hashlib.md5(open(mid, "rb").read() + sfpath.encode()).hexdigest()[:12]
    wav = os.path.join(CACHE, f"{track.name}_{h}.wav")
    if not os.path.exists(wav):
        subprocess.run(["fluidsynth", "-ni", "-q", "-r", str(SR), "-g", "0.5",
                        "-o", "synth.reverb.active=0", "-o", "synth.chorus.active=0",
                        "-o", "synth.polyphony=1024", "-O", "float", "-T", "wav",
                        "-F", wav, sfpath, mid], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    x, sr = sf.read(wav, dtype="float32", always_2d=True)
    assert sr == SR
    out = np.zeros((int(total_len * SR), 2), np.float32)
    m = min(len(out), len(x))
    out[:m] = x[:m]
    return out


# --------------------------------------------------------------------------
# DSP helpers
# --------------------------------------------------------------------------
def env_adsr(nsamp, a, r, sus_len=None, curve=2.0):
    """attack a sec (raised cosine), sustain, release r sec (exp)"""
    e = np.ones(nsamp, np.float32)
    na = min(nsamp, max(1, int(a * SR)))
    e[:na] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, na))
    if sus_len is not None:
        ns = int(sus_len * SR)
        if ns < nsamp:
            tr = np.arange(nsamp - ns) / SR
            e[ns:] *= np.exp(-tr / max(r, 1e-3) * 4.0)
    return e


def lp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def hp(x, fc, order=2):
    sos = signal.butter(order, fc, "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def bp(x, f1, f2, order=2):
    sos = signal.butter(order, [f1, min(f2, SR * 0.45)], "band", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0).astype(np.float32)


def shelf(x, fc, gain_db, kind="high"):
    """RBJ shelf filter"""
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * fc / SR
    alpha = np.sin(w0) / 2 * np.sqrt(2)
    cw = np.cos(w0)
    if kind == "high":
        b0 = A * ((A + 1) + (A - 1) * cw + 2 * np.sqrt(A) * alpha)
        b1 = -2 * A * ((A - 1) + (A + 1) * cw)
        b2 = A * ((A + 1) + (A - 1) * cw - 2 * np.sqrt(A) * alpha)
        a0 = (A + 1) - (A - 1) * cw + 2 * np.sqrt(A) * alpha
        a1 = 2 * ((A - 1) - (A + 1) * cw)
        a2 = (A + 1) - (A - 1) * cw - 2 * np.sqrt(A) * alpha
    else:
        b0 = A * ((A + 1) - (A - 1) * cw + 2 * np.sqrt(A) * alpha)
        b1 = 2 * A * ((A - 1) - (A + 1) * cw)
        b2 = A * ((A + 1) - (A - 1) * cw - 2 * np.sqrt(A) * alpha)
        a0 = (A + 1) + (A - 1) * cw + 2 * np.sqrt(A) * alpha
        a1 = -2 * ((A - 1) + (A + 1) * cw)
        a2 = (A + 1) + (A - 1) * cw - 2 * np.sqrt(A) * alpha
    b = np.array([b0, b1, b2]) / a0
    a = np.array([1, a1 / a0, a2 / a0])
    return signal.lfilter(b, a, x, axis=0).astype(np.float32)


def peak_eq(x, fc, gain_db, q=1.0):
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * fc / SR
    alpha = np.sin(w0) / (2 * q)
    b = np.array([1 + alpha * A, -2 * np.cos(w0), 1 - alpha * A])
    a = np.array([1 + alpha / A, -2 * np.cos(w0), 1 - alpha / A])
    return signal.lfilter(b / a[0], a / a[0], x, axis=0).astype(np.float32)


def pink(nsamp, ch=2):
    w = RNG.standard_normal((nsamp, ch)).astype(np.float32)
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
    a = [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, w, axis=0).astype(np.float32) * 8


def place(buf, x, t, gain=1.0, pan=0.0):
    """mix mono/stereo x into stereo buf at time t with constant-power pan"""
    i0 = int(round(t * SR))
    if i0 >= len(buf):
        return
    if x.ndim == 1:
        th = (pan + 1) * np.pi / 4
        x = np.stack([x * np.cos(th), x * np.sin(th)], 1) * np.sqrt(2)
    i1 = min(len(buf), i0 + len(x))
    if i0 < 0:
        x = x[-i0:]
        i0 = 0
    buf[i0:i1] += x[: i1 - i0] * gain


def varfilter(x, cut_fn, kind="low", block=512, order=2):
    """Time-varying butterworth filter (block-wise, state carried)."""
    y = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), block):
        fc = float(np.clip(cut_fn(i / SR), 20, SR * 0.45))
        sos = signal.butter(order, fc, kind, fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2) + x.shape[1:])
        y[i:i + block], zi = signal.sosfilt(sos, x[i:i + block], axis=0, zi=zi)
    return y


# --------------------------------------------------------------------------
# Additive pipe organ
# --------------------------------------------------------------------------
def _principal(k):
    return k ** -1.25 * (1.0 if k % 2 else 0.85)


def _flute(k):
    return {1: 1.0, 2: 0.18, 3: 0.12, 4: 0.03, 5: 0.02}.get(k, 0.0)


def _stopped(k):
    return (1.0 / k ** 1.6 if k % 2 else 0.02 / k) if k < 12 else 0


def _reed(k):
    return k ** -0.75 * (1 + 0.3 * np.sin(k * 1.3))


RANKS = {
    # name: (pitch multiplier, harmonic fn, level)
    "Contra32": (0.25, lambda k: [1, .35, .12, .05][k - 1] if k <= 4 else 0, 0.55),
    "Bourdon16": (0.5, _stopped, 0.75),
    "Principal16": (0.5, _principal, 0.55),
    "Principal8": (1.0, _principal, 0.8),
    "Flute8": (1.0, _flute, 0.7),
    "Gedackt8": (1.0, _stopped, 0.6),
    "Octave4": (2.0, _principal, 0.5),
    "Flute4": (2.0, _flute, 0.45),
    "Twelfth": (3.0, _flute, 0.28),
    "Fifteenth": (4.0, _principal, 0.3),
    "Mix1": (6.0, _principal, 0.16),
    "Mix2": (8.0, _principal, 0.14),
    "Mix3": (12.0, _principal, 0.10),
    "Trumpet8": (1.0, _reed, 0.30),
    "Bombarde16": (0.5, _reed, 0.30),
}

REGISTRATIONS = {
    "soft": ["Flute8", "Flute4", "Gedackt8"],
    "principal": ["Principal8", "Octave4", "Flute8", "Fifteenth"],
    "chorus": ["Bourdon16", "Principal8", "Octave4", "Twelfth", "Fifteenth", "Flute8"],
    "full": ["Bourdon16", "Principal16", "Principal8", "Octave4", "Twelfth", "Fifteenth",
             "Mix1", "Mix2", "Mix3", "Trumpet8"],
    "pedal_soft": ["Bourdon16", "Gedackt8"],
    "pedal": ["Contra32", "Bourdon16", "Principal16", "Principal8"],
    "pedal_full": ["Contra32", "Bourdon16", "Principal16", "Principal8", "Octave4",
                   "Bombarde16"],
}

_organ_cache = {}


def _organ_tone(pitch, reg, length):
    key = (pitch, reg, length)
    if key in _organ_cache:
        return _organ_cache[key]
    nsamp = int(length * SR)
    t = np.arange(nsamp) / SR
    f0 = hz(pitch)
    out = np.zeros(nsamp, np.float64)
    rng = np.random.default_rng(pitch * 131 + len(reg))
    # slow wind drift shared by the note
    drift = np.cumsum(rng.standard_normal(nsamp // 4800 + 2))
    drift = np.interp(t, np.arange(len(drift)) * 0.1, drift) * 0.0004
    for rk in REGISTRATIONS[reg]:
        mult, hfn, lvl = RANKS[rk]
        fr = f0 * mult
        # mixture ranks break back an octave when too high
        while rk.startswith("Mix") and fr > 5000:
            fr /= 2
        if fr > 12000 or fr < 15:
            continue
        cents = rng.uniform(-1.8, 1.8)
        fr *= 2 ** (cents / 1200)
        k = 1
        while True:
            fh = fr * k
            if fh > 15000 or k > 60:
                break
            a = hfn(k)
            if a > 1e-3:
                roll = 1.0 / (1 + (fh / 5500) ** 2)
                ph = rng.uniform(0, 2 * np.pi)
                out += lvl * a * roll * np.sin(2 * np.pi * fh * t * (1 + drift) + ph)
            k += 1
    # loudness compensation: keep low pipes from swamping
    out *= 0.12 * (1.0 if f0 > 120 else (f0 / 120) ** 0.25)
    _organ_cache[key] = out.astype(np.float32)
    return _organ_cache[key]


def render_organ(track, total_len):
    reg = track.kw["reg"]
    buf = np.zeros((int(total_len * SR), 2), np.float32)
    for t, d, p, v, ex in track.notes:
        length = 8.0 if d + 0.6 <= 8.0 else float(np.ceil(d + 0.6))
        tone = _organ_tone(p, reg, length)
        f0 = hz(p)
        att = float(np.clip(0.09 * (100 / f0) ** 0.4, 0.012, 0.12))
        rel = float(np.clip(0.25 * (100 / f0) ** 0.3, 0.08, 0.5))
        nsamp = int((d + rel * 1.5) * SR)
        x = tone[:nsamp].copy()
        e = env_adsr(len(x), att, rel, sus_len=d)
        x *= e
        # chiff: a short breathy transient around the 2nd-4th harmonic
        nch = int(0.05 * SR)
        ch = RNG.standard_normal(nch).astype(np.float32)
        ch = bp(ch, min(f0 * 2, 9000), min(f0 * 5, 15000), 1)
        ch *= np.exp(-np.arange(nch) / (0.012 * SR))
        x[:nch] += ch * 0.05 * track.kw.get("chiff", 1.0)
        vel = v / 100.0
        # C/C# side pipe arrangement -> alternating pan
        pan = 0.0 if p < 45 else (0.35 if p % 2 else -0.35) * min(1, (p - 40) / 30)
        place(buf, x, t, vel, pan)
    return buf


# --------------------------------------------------------------------------
# Other synthesised instruments
# --------------------------------------------------------------------------
def tick_sound(tock=False, bright=1.0):
    nsamp = int(0.08 * SR)
    t = np.arange(nsamp) / SR
    f1, f2 = (2637, 1319) if not tock else (2349, 1175)   # E7/E6 tick, D7/D6 tock
    x = (np.sin(2 * np.pi * f1 * t) * np.exp(-t / 0.006) * 0.6 +
         np.sin(2 * np.pi * f2 * t) * np.exp(-t / 0.012) * 0.5 +
         np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.015) * 0.35)
    nz = RNG.standard_normal(nsamp)
    nz = hp(nz, 2500, 2) * np.exp(-t / 0.0025) * 0.8 * bright
    x = (x + nz).astype(np.float32)
    x[:24] *= np.linspace(0, 1, 24)
    return x


def render_tick(track, total_len):
    buf = np.zeros((int(total_len * SR), 2), np.float32)
    for t, d, p, v, ex in track.notes:
        x = tick_sound(tock=bool(ex.get("tock")), bright=ex.get("bright", 1.0))
        place(buf, x, t, (v / 127.0) ** 1.5, ex.get("pan", 0.08 if ex.get("tock") else -0.08))
    return buf


def impact_sound(size=1.0, low=1.0):
    dur = 5.0 * size
    nsamp = int(dur * SR)
    t = np.arange(nsamp) / SR
    f = 32 + 55 * np.exp(-t / 0.18)
    ph = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(ph) * np.exp(-t / (1.3 * size)) * low
    boom = np.tanh(boom * 1.6) / 1.2
    body = lp(RNG.standard_normal(nsamp), 300, 2) * np.exp(-t / 0.25) * 1.6
    crack = hp(RNG.standard_normal(nsamp), 2500, 2) * np.exp(-t / 0.05) * 0.35
    tail = bp(RNG.standard_normal(nsamp), 80, 2000, 1) * np.exp(-t / (1.8 * size)) * 0.12
    x = (boom + body + crack + tail).astype(np.float32)
    x[:48] *= np.linspace(0, 1, 48)
    st = np.stack([x, x], 1)
    # widen tail slightly
    dec = bp(RNG.standard_normal((nsamp, 2)), 150, 3000, 1) * np.exp(-t / (1.2 * size))[:, None] * 0.05
    return (st + dec).astype(np.float32)


def render_impact(track, total_len):
    buf = np.zeros((int(total_len * SR), 2), np.float32)
    for t, d, p, v, ex in track.notes:
        place(buf, impact_sound(ex.get("size", 1.0), ex.get("low", 1.0)), t, v / 127.0)
    return buf


def riser_sound(dur, f_start=250, f_end=9000, shepard=True):
    nsamp = int(dur * SR)
    t = np.arange(nsamp) / SR
    a = t / dur
    nz = pink(nsamp, 2)
    x = varfilter(nz, lambda tt: f_start * (f_end / f_start) ** (tt / dur), "low", order=2)
    x = hp(x, 180, 2)
    amp = a ** 2.2
    x *= amp[:, None] * 0.5
    if shepard:
        sh = np.zeros(nsamp)
        # shepard-risset glissando: octave-spaced partials gliding up
        oct_per_sec = 1.0 / 6.0
        for base in range(8):
            pos = (base + oct_per_sec * t) % 8.0          # octave position 0..8
            f = 40 * 2 ** pos
            w = np.exp(-0.5 * ((pos - 4.0) / 1.4) ** 2)
            ph = 2 * np.pi * np.cumsum(f) / SR
            sh += np.sin(ph) * w
        sh *= 0.12 * a ** 1.3
        x += np.stack([sh, sh], 1).astype(np.float32)
    fade = np.ones(nsamp)
    fade[-int(0.02 * SR):] = np.linspace(1, 0, int(0.02 * SR))
    return (x * fade[:, None]).astype(np.float32)


def render_riser(track, total_len):
    buf = np.zeros((int(total_len * SR), 2), np.float32)
    for t, d, p, v, ex in track.notes:
        place(buf, riser_sound(d, ex.get("f0", 250), ex.get("f1", 9000), ex.get("shepard", True)),
              t, v / 127.0)
    return buf


def whoosh_sound(dur, reverse=True):
    nsamp = int(dur * SR)
    t = np.arange(nsamp) / SR
    nz = pink(nsamp, 2)
    x = varfilter(nz, lambda tt: 400 * (14000 / 400) ** ((tt / dur) ** 2), "low")
    x = hp(x, 900)
    e = (t / dur) ** 3.5
    x *= e[:, None]
    x[-64:] *= np.linspace(1, 0, 64)[:, None]
    return x.astype(np.float32)


def render_whoosh(track, total_len):
    buf = np.zeros((int(total_len * SR), 2), np.float32)
    for t, d, p, v, ex in track.notes:
        place(buf, whoosh_sound(d), t, v / 127.0)
    return buf


def _saw_additive(f, nsamp, phase, maxf=7000):
    t = np.arange(nsamp) / SR
    x = np.zeros(nsamp)
    k = 1
    while f * k < maxf and k < 80:
        x += np.sin(2 * np.pi * f * k * t + phase * k) / k
        k += 1
    return x


def render_pad(track, total_len):
    """super-saw style pad: 5 detuned saws per note, slow attack, darker."""
    buf = np.zeros((int(total_len * SR), 2), np.float32)
    bright = track.kw.get("bright", 2500)
    att = track.kw.get("attack", 1.5)
    rel = track.kw.get("release", 2.0)
    for t, d, p, v, ex in track.notes:
        nsamp = int((d + rel) * SR)
        f0 = hz(p)
        st = np.zeros((nsamp, 2))
        for i, det in enumerate([-11, -5, 0, 5, 11]):
            f = f0 * 2 ** (det / 1200)
            s = _saw_additive(f, nsamp, RNG.uniform(0, 6.28), maxf=min(9000, bright * 2.5))
            pan = (i - 2) / 2 * 0.8
            st[:, 0] += s * np.cos((pan + 1) * np.pi / 4)
            st[:, 1] += s * np.sin((pan + 1) * np.pi / 4)
        st = lp(st, bright, 2)
        e = env_adsr(nsamp, att, rel, sus_len=d)
        st *= e[:, None] * 0.05
        place(buf, st.astype(np.float32), t, v / 127.0)
    return buf


def render_sub(track, total_len):
    buf = np.zeros((int(total_len * SR), 2), np.float32)
    for t, d, p, v, ex in track.notes:
        nsamp = int((d + 0.3) * SR)
        tt = np.arange(nsamp) / SR
        f = hz(p)
        x = np.sin(2 * np.pi * f * tt) + 0.18 * np.sin(4 * np.pi * f * tt)
        x = np.tanh(1.4 * x) / 1.1
        e = env_adsr(nsamp, ex.get("att", 0.03), 0.25, sus_len=d)
        if ex.get("decay"):
            e *= np.exp(-tt / ex["decay"])
        place(buf, (x * e * 0.5).astype(np.float32), t, v / 127.0)
    return buf


def render_braam(track, total_len):
    """Distorted low brass-synth 'BRAAM' – saws with an opening filter."""
    buf = np.zeros((int(total_len * SR), 2), np.float32)
    for t, d, p, v, ex in track.notes:
        nsamp = int((d + 1.5) * SR)
        f0 = hz(p)
        st = np.zeros((nsamp, 2))
        for i, det in enumerate([-14, -6, 0, 6, 14]):
            s = _saw_additive(f0 * 2 ** (det / 1200), nsamp, RNG.uniform(0, 6.28), maxf=6000)
            s += 0.5 * np.sign(np.sin(2 * np.pi * f0 / 2 * np.arange(nsamp) / SR))  # sub-square
            pan = (i - 2) / 2 * 0.7
            st[:, 0] += s * np.cos((pan + 1) * np.pi / 4)
            st[:, 1] += s * np.sin((pan + 1) * np.pi / 4)
        st = varfilter(st, lambda tt: 180 + 2400 * (tt / 0.35 if tt < 0.35 else np.exp(-(tt - 0.35) / 1.4)))
        st = np.tanh(st * 0.9)
        e = env_adsr(nsamp, 0.04, 1.2, sus_len=d)
        st = st * e[:, None] * 0.18
        place(buf, st.astype(np.float32), t, v / 127.0)
    return buf


def render_heart(track, total_len):
    buf = np.zeros((int(total_len * SR), 2), np.float32)
    for t, d, p, v, ex in track.notes:
        for off, amp in ((0.0, 1.0), (0.24, 0.65)):
            nsamp = int(0.6 * SR)
            tt = np.arange(nsamp) / SR
            f = 42 + 30 * np.exp(-tt / 0.05)
            x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.13)
            x[:48] *= np.linspace(0, 1, 48)
            place(buf, (x * amp * 0.9).astype(np.float32), t + off, v / 127.0)
    return buf


def render_atmos(track, total_len):
    """Space wind: filtered pink noise with slow motion, plus a faint high shimmer."""
    buf = np.zeros((int(total_len * SR), 2), np.float32)
    for t, d, p, v, ex in track.notes:
        nsamp = int(d * SR)
        nz = pink(nsamp, 2)
        lfo = lambda tt: 500 + 350 * np.sin(2 * np.pi * tt / 11.0) + 200 * np.sin(2 * np.pi * tt / 4.3)
        x = varfilter(nz, lfo, "low", block=1024)
        x = hp(x, 120)
        tt = np.arange(nsamp) / SR
        sh = np.zeros((nsamp, 2))
        for i, f in enumerate([hz(p + 24), hz(p + 31), hz(p + 36), hz(p + 43)]):
            am = 0.5 + 0.5 * np.sin(2 * np.pi * tt / (5 + 2.3 * i) + i)
            sh[:, i % 2] += np.sin(2 * np.pi * f * tt) * am * 0.03
        x = x * 0.25 + sh
        e = env_adsr(nsamp, ex.get("att", 6.0), ex.get("rel", 6.0), sus_len=d - ex.get("rel", 6.0))
        place(buf, (x * e[:, None]).astype(np.float32), t, v / 127.0)
    return buf


SYNTHS = {
    "organ": render_organ, "tick": render_tick, "impact": render_impact,
    "riser": render_riser, "whoosh": render_whoosh, "pad": render_pad,
    "sub": render_sub, "braam": render_braam, "heart": render_heart,
    "atmos": render_atmos,
}


def render_track(track, total_len):
    if track.kind == "sf2":
        return render_sf2(track, total_len)
    return SYNTHS[track.kind](track, total_len)


# --------------------------------------------------------------------------
# Reverb impulse responses
# --------------------------------------------------------------------------
def make_ir(rt_low=5.5, rt_high=2.0, length=7.0, predelay=0.03, er=True, seed=3, density=1.0):
    rng = np.random.default_rng(seed)
    nsamp = int(length * SR)
    t = np.arange(nsamp) / SR
    nz = rng.standard_normal((nsamp, 2))
    edges = [20, 150, 400, 1000, 2500, 5000, 9000, 20000]
    out = np.zeros((nsamp, 2))
    for i in range(len(edges) - 1):
        f1, f2 = edges[i], min(edges[i + 1], SR * 0.45)
        band = bp(nz, f1, f2, 2)
        fm = np.sqrt(f1 * f2)
        a = np.clip((np.log(fm) - np.log(150)) / (np.log(9000) - np.log(150)), 0, 1)
        rt = rt_low * (1 - a) + rt_high * a
        out += band * np.exp(-6.91 * t / rt)[:, None]
    out *= (1 - np.exp(-t / (0.025 * density)))[:, None]
    if er:
        for k in range(24):
            dt = rng.uniform(0.004, 0.09)
            g = 0.9 * (1 - dt / 0.1) * rng.uniform(0.3, 1.0)
            ch = rng.integers(0, 2)
            idx = int(dt * SR)
            out[idx, ch] += g * 4
            out[idx + rng.integers(5, 40), 1 - ch] += g * 3
    pd = int(predelay * SR)
    out = np.concatenate([np.zeros((pd, 2)), out])[:nsamp]
    out /= np.sqrt(np.sum(out ** 2) / 2)
    return out.astype(np.float32)


def convolve(x, ir):
    y = np.zeros((len(x) + len(ir) - 1, 2), np.float32)
    for c in range(2):
        y[:, c] = signal.oaconvolve(x[:, c], ir[:, c])
    return y[: len(x)]


# --------------------------------------------------------------------------
# Channel strip
# --------------------------------------------------------------------------
def gain_curve(pts, nsamp):
    """pts: list of (t, dB); linear in dB between points."""
    ts = np.array([p[0] for p in pts]) * SR
    db = np.array([p[1] for p in pts])
    g_db = np.interp(np.arange(nsamp), ts, db)
    return (10 ** (g_db / 20)).astype(np.float32)


def channel(x, gain_db=0.0, pan=0.0, width=1.0, hp_f=None, lp_f=None, eq=(), auto=None,
            mono=False):
    y = x
    if hp_f:
        y = hp(y, hp_f, 2)
    if lp_f:
        y = lp(y, lp_f, 2)
    for kind, f, g, *q in eq:
        if kind == "peak":
            y = peak_eq(y, f, g, q[0] if q else 1.0)
        else:
            y = shelf(y, f, g, kind)
    if mono:
        m = y.mean(1, keepdims=True)
        y = np.repeat(m, 2, 1)
    if width != 1.0:
        m = (y[:, 0] + y[:, 1]) * 0.5
        s = (y[:, 0] - y[:, 1]) * 0.5 * width
        y = np.stack([m + s, m - s], 1)
    if pan:
        th = (pan + 1) * np.pi / 4
        gl, gr = np.cos(th) * np.sqrt(2), np.sin(th) * np.sqrt(2)
        # balance-style pan keeps stereo image but shifts it
        y = np.stack([y[:, 0] * gl + y[:, 1] * max(0, -pan) * 0.5,
                      y[:, 1] * gr + y[:, 0] * max(0, pan) * 0.5], 1)
    y = y * (10 ** (gain_db / 20))
    if auto:
        y = y * gain_curve(auto, len(y))[:, None]
    return y.astype(np.float32)
