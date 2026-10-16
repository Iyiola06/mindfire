"""Original cinematic score for the Mindfire Homes 10-year brand film.

    python promo/score.py   ->  promo/audio/score_80.wav, 4 stems, cues_film.json

Felt piano + strings + a soft heartbeat pulse, D-flat major, 80 BPM: one bar is exactly 3 s,
so 15 bars are the 45 s film and every scene starts on a bar line. Luxury-property films
are piano-led and restrained, so this one is too. Fully synthesized with numpy; nothing
to license.
"""
import json
import os
import wave

import numpy as np

SR = 48_000
BPM = 80
BEAT = 60 / BPM          # 0.75 s
BAR = 4 * BEAT           # 3.0 s
BARS = 15
LEN = BARS * BAR         # 45 s
N = int(LEN * SR)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "audio")
rng = np.random.default_rng(2016)

# Chord per bar (MIDI). D-flat major: I  V/3  vi  IV ... ending on I.
DB = [49, 53, 56, 60, 65]          # Dbmaj9-ish
AB_C = [48, 56, 60, 63, 68]        # Ab/C
BBM = [46, 53, 56, 61, 65]         # Bbm7
GB = [42, 49, 53, 56, 58]          # Gbmaj9
EBM = [39, 51, 54, 58, 61]         # Ebm7
ABSUS = [44, 51, 56, 61, 63]       # Absus4
AB = [44, 51, 56, 60, 63]          # Ab
CHORDS = [DB, AB_C, BBM, GB, DB, AB_C, BBM, GB, DB, AB_C, EBM, GB, BBM, ABSUS, DB]

SECTIONS = {
    "open": (0, 2),        # 0-6 s     solo piano
    "problem": (2, 4),     # 6-12 s    + strings
    "title": (4, 5),       # 12-15 s   swell, title card
    "portfolio": (5, 9),   # 15-27 s   piano ostinato + pulse
    "services": (9, 11),   # 27-33 s   build
    "promise": (11, 13),   # 33-39 s   breakdown, thanks
    "end": (13, 15),       # 39-45 s   final swell, end card
}
CUES = {
    "bpm": BPM, "bar_seconds": BAR, "fps_suggested": 24,
    "open_line": [0.8, 1.8], "problem": 6.0, "title_risk": 7.8, "origin": 9.0, "promise_line": 10.5,
    "title_hit": 12.0, "portfolio": [15.0, 18.0, 21.0], "stat": 24.0, "services": 27.0,
    "promise": 33.0, "thanks": 36.0, "next_ten": 39.0, "end_card": 41.0, "fade": 44.2,
}


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(buf, sig, at):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def in_sec(bar, name):
    a, b = SECTIONS[name]
    return a <= bar < b


# ── instruments ──────────────────────────────────────────────────────────────
def piano(m, dur, vel=0.6):
    """Felt piano: stretched partials, two detuned strings, soft high-end, damper release."""
    f0 = hz(m)
    tail = 2.2
    n = int((dur + tail) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    B = 0.00032
    for k in range(1, 12):
        fk = f0 * k * np.sqrt(1 + B * k * k)
        if fk > 11000:
            break
        felt = 1 / (1 + (fk / (1800 + 2200 * vel)) ** 2)
        amp = felt / k ** 1.05
        T = 3.2 * (262 / f0) ** 0.4 / k ** 0.6
        ph = rng.uniform(0, 2 * np.pi)
        out += amp * np.exp(-t / T) * (np.sin(2 * np.pi * fk * t + ph) + np.sin(2 * np.pi * fk * 1.0006 * t + ph)) / 2
    att = np.clip(t / 0.003, 0, 1)
    damper = np.where(t < dur, 1.0, np.exp(-(t - dur) / 0.35))
    ham = rng.standard_normal(n) * np.exp(-t / 0.004) * 0.015
    return (out * att * damper + ham) * vel * 0.32


def strings(notes, dur, level=1.0, attack=1.1, release=1.6):
    """Ensemble pad: 3 detuned voices per note, slow vibrato, harmonic roll-off as the 'filter'."""
    n = int((dur + release) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for m in notes:
        f0 = hz(m)
        for v, det in enumerate((-0.09, 0.0, 0.08)):
            f = f0 * 2 ** (det / 12)
            vib = 0.0025 * np.sin(2 * np.pi * (4.6 + v * 0.4) * t + v)
            for k in range(1, 14):
                if f * k > 9000:
                    break
                out += np.sin(2 * np.pi * f * k * t * (1 + vib) + rng.uniform(0, 6.28)) / k ** 1.8
    env = np.clip(t / attack, 0, 1) ** 2 * np.clip((dur + release - t) / release, 0, 1)
    return out * env * level * 0.05 / len(notes)


def cello(m, dur, level=1.0):
    n = int((dur + 1.2) * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = sum(np.sin(2 * np.pi * f * k * t * (1 + 0.002 * np.sin(2 * np.pi * 4.8 * t))) / k ** 1.5 for k in range(1, 8))
    env = np.clip(t / 0.6, 0, 1) * np.clip((dur + 1.2 - t) / 1.2, 0, 1)
    return s * env * level * 0.11


def heartbeat(vel=1.0):
    t = np.arange(int(0.6 * SR)) / SR
    f = 46 + 30 * np.exp(-t / 0.04)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22) * vel * 0.5


def shaker(vel=1.0):
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = x - np.convolve(x, np.ones(6) / 6, mode="same")  # crude high-pass
    return x * np.clip(t / 0.01, 0, 1) * np.exp(-t / 0.025) * vel * 0.05


def boom(level=1.0):
    t = np.arange(int(4.0 * SR)) / SR
    f = 32 + 40 * np.exp(-t / 0.25)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.4)
    return np.tanh(1.3 * s) * level * 0.6


def swell(dur, level=1.0):
    """Reverse cymbal: bright noise with a rising envelope that stops dead on the hit."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = x - np.convolve(x, np.ones(4) / 4, mode="same")
    return x * (t / dur) ** 3 * level * 0.16


def chime(m, level=1.0):
    t = np.arange(int(3.0 * SR)) / SR
    f = hz(m)
    return sum(np.sin(2 * np.pi * f * p * t) * np.exp(-t / (1.6 / p ** 0.6)) * a for p, a in [(1, 1), (2.0, .35), (3.0, .12), (4.2, .05)]) * level * 0.06


# ── arrangement ──────────────────────────────────────────────────────────────
pno = np.zeros(N)
strs = np.zeros(N)
perc = np.zeros(N)
fx = np.zeros(N)
E = BEAT / 2  # eighth note

for bar, ch in enumerate(CHORDS):
    b0 = bar * BAR
    root = ch[0]
    arp = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[4] + 12]
    # left hand: low root, sustained
    if not in_sec(bar, "title"):
        add(pno, piano(root - 12 if root > 44 else root, BAR * 0.95, 0.42), b0)
    if in_sec(bar, "open"):
        # sparse: one note per beat, gentle
        for i, idx in enumerate([0, 2, 1, 3]):
            add(pno, piano(arp[idx], BEAT * 1.6, 0.36 + 0.04 * bar), b0 + i * BEAT)
    elif in_sec(bar, "title"):
        # the title chord: rolled, wide, full
        for i, m in enumerate([root - 12, root, ch[1], ch[2], ch[3] + 12, ch[4] + 12, ch[2] + 24]):
            add(pno, piano(m, BAR * 0.9, 0.62), b0 + i * 0.035)
    elif in_sec(bar, "promise") or bar == 14:
        # breakdown: quarter-note arpeggio, softer
        for i, idx in enumerate([0, 2, 1, 3]):
            if bar == 14 and i > 1:
                break
            add(pno, piano(arp[idx], BEAT * 1.4, 0.38), b0 + i * BEAT)
    else:
        # ostinato: eighth notes
        pat = [0, 2, 1, 3, 2, 1, 3, 2]
        for i, idx in enumerate(pat):
            vel = 0.34 + (0.08 if i % 4 == 0 else 0) + (0.06 if in_sec(bar, "services") else 0)
            add(pno, piano(arp[idx], E * 1.5, vel), b0 + i * E)
    # melody on top: a simple, singing line on chord tones
    if in_sec(bar, "portfolio") or in_sec(bar, "services") or bar == 13:
        top = ch[4] + 24 if ch[4] + 24 <= 89 else ch[4] + 12
        add(pno, piano(top, BEAT * 2.6, 0.5), b0)
        add(pno, piano(ch[3] + 24 if ch[3] + 24 <= 89 else ch[3] + 12, BEAT * 1.0, 0.42), b0 + 3 * BEAT)

    # strings
    if bar >= 2 and bar != 14:
        lvl = {"problem": .7, "title": 1.3, "portfolio": 1.0, "services": 1.25, "promise": .85, "end": 1.35}
        name = next(k for k, (a, b) in SECTIONS.items() if a <= bar < b)
        add(strs, strings(ch[1:], BAR + 0.15, lvl.get(name, 1.0)), b0)
        add(strs, cello(root - 12 if root > 44 else root, BAR + 0.1, lvl.get(name, 1.0)), b0)
    if bar == 14:
        add(strs, strings(DB[1:] + [DB[1] + 12], 3.2, 1.1, attack=0.3, release=2.4), b0)
        add(strs, cello(37, 3.2, 1.0), b0)

    # pulse: heartbeat on beats 1 and 3, shaker on the off-eighths
    if in_sec(bar, "portfolio") or in_sec(bar, "services") or bar == 13:
        for beat in (0, 2):
            add(perc, heartbeat(0.9 if beat == 0 else 0.6), b0 + beat * BEAT)
        for i in range(8):
            if i % 2:
                add(perc, shaker(1.0 if in_sec(bar, "services") else 0.7), b0 + i * E + 0.012)

# fx: swells land exactly on the scene hits
add(fx, swell(2.5), CUES["title_hit"] - 2.5)
add(fx, boom(1.0), CUES["title_hit"])
add(fx, chime(85, 1.0), CUES["title_hit"] + 0.02)
add(fx, swell(1.5, 0.6), CUES["portfolio"][0] - 1.5)
add(fx, swell(1.0, 0.5), CUES["stat"] - 1.0)
add(fx, chime(80, 0.8), CUES["stat"] + 1.6)          # the counter lands on 1,000+
add(fx, swell(3.0, 0.9), CUES["next_ten"] - 3.0)
add(fx, boom(0.9), CUES["next_ten"])
add(fx, chime(85, 0.9), CUES["end_card"])

# ── mix ──────────────────────────────────────────────────────────────────────
def reverb(x, secs, wet):
    n = int(secs * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t / (secs / 6.0))
    ir = np.convolve(ir, np.ones(8) / 8, mode="same")  # darker tail
    ir[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))  # pre-delay softness
    ir /= np.sqrt(np.sum(ir ** 2))
    L = len(x) + n
    nfft = 1 << (L - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]
    return x + wet * y


pno = reverb(pno, 3.2, 0.45)
strs = reverb(strs, 3.8, 0.55)
perc = reverb(perc, 1.2, 0.18)
fx = reverb(fx, 3.0, 0.35)

stems = {"piano": pno * 1.0, "strings": strs * 1.0, "perc": perc * 0.9, "fx": fx * 0.8}
mix = sum(stems.values())
mix = np.tanh(1.05 * mix)
gain = 10 ** (-1 / 20) / np.max(np.abs(mix))
fade = np.ones(N)
fs = int(CUES["fade"] * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.6
fade[: int(0.05 * SR)] = np.linspace(0, 1, int(0.05 * SR))
mix = mix * gain * fade
for k in stems:
    stems[k] = np.clip(stems[k] * gain * fade, -1, 1)


def write(path, x):
    st = np.stack([x, x], axis=1)  # identical channels: mono-safe on phone speakers
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())


os.makedirs(OUT, exist_ok=True)
write(os.path.join(OUT, f"score_{BPM}.wav"), mix)
for k, v in stems.items():
    write(os.path.join(OUT, f"score_stem_{k}.wav"), v)
with open(os.path.join(OUT, "cues_film.json"), "w") as f:
    json.dump(CUES, f, indent=2)

rms = [20 * np.log10(np.sqrt(np.mean(mix[int(s * SR):int((s + 1) * SR)] ** 2)) + 1e-9) for s in range(int(LEN))]
print("RMS dBFS per second:")
print(" ".join(f"{s:>2}:{r:5.1f}" for s, r in enumerate(rms)))
spec = np.abs(np.fft.rfft(mix))
fr = np.fft.rfftfreq(N, 1 / SR)
for lo, hi in [(20, 120), (120, 500), (500, 2000), (2000, 8000), (8000, 20000)]:
    e = np.sum(spec[(fr >= lo) & (fr < hi)] ** 2)
    print(f"band {lo:>5}-{hi:<5} Hz: {10 * np.log10(e + 1e-9):6.1f} dB")
print("wrote", OUT)
