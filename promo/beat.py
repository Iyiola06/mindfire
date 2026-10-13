"""Original Afro-house instrumental for the Mindfire Homes 10-year film.

    python promo/beat.py   ->  promo/audio/beat_120.wav, 4 stems, cues.json

120 BPM, so one bar is exactly 2 s and 15 bars are 30 s: every scene starts on a whole
second. A-flat major (I - vi - IV - V) because this is a celebration, not a sales pitch.
Everything is synthesized here with numpy: no samples, no vocals, nothing to license.
"""
import json
import os
import wave

import numpy as np

SR = 48_000
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
BARS = 15
LEN = BARS * BAR
N = int(LEN * SR)
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "audio")
rng = np.random.default_rng(10)  # ten years; fixed seed keeps every render identical

# ── arrangement (bar indices) ────────────────────────────────────────────────
HOOK = range(0, 2)        # 0-4 s   filtered groove opening up
LOGO = range(2, 3)        # 4-6 s   impact, pad swell
MONTAGE = range(3, 7)     # 6-14 s  full drop
WAY = range(7, 10)        # 14-20 s thinned groove + stamps
THANKS = range(10, 11)    # 20-22 s full groove
VERSE = range(11, 12)     # 22-24 s breakdown under the scripture
BUILD = range(12, 13)     # 24-26 s snare roll, drop-out at 25.5
CTA = range(13, 15)       # 26-30 s final groove, last hit at 29

# One chord per bar. MIDI notes.  Ab maj7 / Fm9 / Db maj9 / Eb6
CHORDS = [
    [56, 60, 63, 67],
    [53, 56, 60, 63, 67],
    [49, 53, 56, 60, 63],
    [51, 55, 58, 60],
]
ROOTS = [44, 41, 37, 39]  # Ab2 F2 Db2 Eb2

# Practice stamps in the 14-20 s scene and the CTA URL ding.
STAMPS = [14.5, 15.5, 16.5, 17.5, 18.5]
CUES = {
    "bpm": BPM,
    "bar_seconds": BAR,
    "hook_stamp": 3.0,
    "riser": 2.0,
    "logo_impact": 4.0,
    "tagline": 5.0,
    "drop": 6.0,
    "montage_cuts": [6.0, 7.0, 8.0, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0, 12.5],
    "wall": 13.0,
    "way_scene": 14.0,
    "stamps": STAMPS,
    "way_outro": 19.0,
    "thanks_hit": 20.0,
    "thank_you": 21.0,
    "verse": 22.0,
    "snare_roll": [24.0, 25.5],
    "dropout": 25.5,
    "cta_hit": 26.0,
    "url_ding": 26.5,
    "contact": 27.5,
    "final_hit": 29.0,
}


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, a=0.002, d=0.2, curve=1.0):
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-6), 0, 1)
    return att * np.exp(-t / d) ** curve


def onepole_lp(x, fc):
    """One-pole low-pass; fc may be a scalar or a per-sample array."""
    fc = np.broadcast_to(np.asarray(fc, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def hp(x, fc):
    return x - onepole_lp(x, fc)


def noise(n):
    return rng.standard_normal(n)


def add(buf, sig, at):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


# ── instruments ──────────────────────────────────────────────────────────────
def kick():
    t = t_(0.45)
    f = 48 + (158 - 48) * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.16)
    click = noise(len(t)) * np.exp(-t / 0.002) * 0.3
    return np.tanh(1.8 * (body + click)) * 0.95


def clap():
    n = int(0.35 * SR)
    src = hp(onepole_lp(noise(n), 5000), 900)
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.022]):
        i = int(off * SR)
        dec = 0.09 if k == 2 else 0.006
        e[i:] += env(n - i, 0.0005, dec)
    return src * e * 0.6


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    return hp(noise(n), 7000) * env(n, 0.0005, 0.05 if open_ else 0.012) * 0.28


def shaker():
    n = int(0.07 * SR)
    s = hp(onepole_lp(noise(n), 12000), 5000)
    return s * env(n, 0.006, 0.02) * 0.16


def conga(f0):
    t = t_(0.25)
    f = f0 * (1 + 0.15 * np.exp(-t / 0.01))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09)
    slap = hp(noise(len(t)), 2000) * np.exp(-t / 0.004) * 0.25
    return (body + slap) * 0.35


def snare():
    t = t_(0.2)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
    nz = hp(noise(len(t)), 1500) * np.exp(-t / 0.07)
    return (0.5 * tone + nz) * 0.45


def logdrum(m, dur):
    """Amapiano-style log drum bass: glides down into the note, saturated."""
    t = t_(dur)
    f = hz(m) * (1 + 0.6 * np.exp(-t / 0.025))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
    return np.tanh(1.6 * s * env(len(t), 0.003, dur * 0.45)) * 0.55


def saw_voice(m, dur, harmonics=14, detune=0.07, a=0.005, d=0.25, sustain=False):
    t = t_(dur)
    out = np.zeros(len(t))
    for det in (-detune, 0, detune):
        f = hz(m + det)
        for h in range(1, harmonics + 1):
            if f * h > SR / 2.2:
                break
            out += np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6.28)) / h
    if sustain:
        e = np.clip(t / a, 0, 1) * np.clip((dur - t) / 0.25, 0, 1)
    else:
        e = env(len(t), a, d)
    return out * e / 3


def chord(notes, dur, **kw):
    return sum(saw_voice(m, dur, **kw) for m in notes) / len(notes)


def riser(dur):
    t = t_(dur)
    f = 300 + 2600 * (t / dur) ** 2
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3 + hp(noise(len(t)), 3000) * 0.5
    return s * (t / dur) ** 2.2 * 0.5


def impact():
    t = t_(2.2)
    f = 30 + 60 * np.exp(-t / 0.18)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.7)
    crash = onepole_lp(noise(len(t)), 6000) * np.exp(-t / 0.5) * 0.35
    return np.tanh(1.4 * (boom + crash)) * 0.9


def whoosh(dur=0.5):
    n = int(dur * SR)
    t = np.arange(n) / n
    fc = 400 + 5000 * np.sin(np.pi * t) ** 2
    s = hp(onepole_lp(noise(n), fc), 300)
    return s * np.sin(np.pi * t) ** 1.5 * 0.4


def ding(m=80):
    t = t_(1.4)
    f = hz(m)
    out = sum(np.sin(2 * np.pi * f * p * t) * np.exp(-t / (0.9 / p ** 0.7)) * a
              for p, a in [(1, 1), (2.76, 0.5), (5.4, 0.25), (8.93, 0.12)])
    return out * 0.22


def stamp():
    """Rubber stamp landing on paper: low thud + paper slap. The 'verified' sound."""
    t = t_(0.3)
    thud = np.sin(2 * np.pi * (90 + 80 * np.exp(-t / 0.01)) * t) * np.exp(-t / 0.05)
    slap = onepole_lp(noise(len(t)), 3500) * np.exp(-t / 0.015)
    return (thud * 0.6 + slap * 0.5) * 0.7


def pop():
    t = t_(0.08)
    return np.sin(2 * np.pi * (900 - 500 * t / 0.08) * t) * np.exp(-t / 0.02) * 0.25


# ── arrange ──────────────────────────────────────────────────────────────────
drums = np.zeros(N)
bass = np.zeros(N)
music = np.zeros(N)
fx = np.zeros(N)
kicks = []

K, CL, SH = kick(), clap(), shaker()
HC, HO, SN = hat(), hat(True), snare()
SWING = 0.018

for bar in range(BARS):
    b0 = bar * BAR
    ci = bar % 4
    full = bar in MONTAGE or bar in THANKS or bar in CTA
    thin = bar in WAY or bar in HOOK
    verse = bar in VERSE
    build = bar in BUILD

    # kick: four on the floor, except the logo bar, the last beat of the hook, and after 29 s
    if bar not in LOGO:
        for beat in range(4):
            at = b0 + beat * BEAT
            if bar == 1 and beat == 3:
                continue  # drop-out before the logo impact
            if build and at >= CUES["dropout"]:
                continue
            if at >= CUES["final_hit"] + 0.01:
                continue
            if verse and beat in (1, 3):
                continue  # half-time under the scripture
            add(drums, K * (0.75 if verse else 1.0), at)
            kicks.append(at)

    # claps on 2 and 4
    if full or (bar in WAY and bar > 7):
        for beat in (1, 3):
            at = b0 + beat * BEAT
            if at < CUES["final_hit"]:
                add(drums, CL, at)

    # hats/shaker: 16ths with swing on odd steps
    if (full or thin or build) and not verse:
        for step in range(16):
            at = b0 + step * BEAT / 4 + (SWING if step % 2 else 0)
            if (build and at >= CUES["dropout"]) or at >= CUES["final_hit"]:
                continue
            if bar == 1 and step >= 14:
                continue
            add(drums, SH * (1.0 if step % 4 == 2 else 0.6), at)
            if step % 4 == 2 and (full or build):
                add(drums, HO * 0.7, at)
            elif full and step % 2 == 0:
                add(drums, HC * 0.6, at)

    # congas: Afro-house pattern
    if full:
        for step, f0 in [(3, 330), (6, 220), (10, 330), (11, 260), (14, 220)]:
            at = b0 + step * BEAT / 4
            if at < CUES["final_hit"]:
                add(drums, conga(f0), at)

    # snare roll 24.0 -> 25.5, accelerating
    if build:
        at = b0
        while at < CUES["dropout"] - 0.01:
            add(drums, SN * (0.35 + 0.65 * (at - b0) / 1.5), at)
            # 8ths, then 16ths, then 32nds into the drop-out
            at += BEAT / 2 if at - b0 < 0.75 else (BEAT / 4 if at - b0 < 1.25 else BEAT / 8)

    # log-drum bass
    if bar not in LOGO and not (bar == 14):
        root = ROOTS[ci]
        pattern = [(0, 0.35), (0.75, 0.2), (1.5, 0.35), (2.5, 0.3), (3.25, 0.25)] if full else [(0, 0.5), (2, 0.5)]
        for bt, d in pattern:
            at = b0 + bt * BEAT
            if (build and at >= CUES["dropout"]) or (bar == 1 and at >= 3.5):
                continue
            m = root + (12 if bt in (0.75, 3.25) else 0)
            add(bass, logdrum(m, d), at)
    if bar == 14:
        add(bass, logdrum(ROOTS[0], 1.2), CUES["final_hit"])  # final root note on the last hit

    # chord stabs on the off-beats; pads in the hook, logo, verse and outro
    if full or bar in WAY:
        for step in (2, 6, 10, 14) if full else (6, 14):
            at = b0 + step * BEAT / 4
            if at < CUES["final_hit"]:
                add(music, chord([n + 12 for n in CHORDS[ci]], 0.25, d=0.09) * 0.9, at)
    if bar in HOOK or bar in LOGO or verse or build or bar == 14:
        dur = BAR + 0.4
        if bar == 14:
            dur = LEN - b0
        add(music, chord(CHORDS[ci], dur, harmonics=8, detune=0.12, a=0.4 if bar != 2 else 0.05, sustain=True) * 0.8, b0)

# ── fx ───────────────────────────────────────────────────────────────────────
add(fx, riser(2.0), CUES["riser"])
add(fx, stamp() * 1.2, CUES["hook_stamp"])  # "VERIFIED" lands on the title deed
add(fx, impact(), CUES["logo_impact"])
add(fx, riser(1.0) * 0.6, 5.0)
add(fx, impact() * 0.8, CUES["drop"])
for c in CUES["montage_cuts"][1:]:
    add(fx, whoosh(0.35 if c >= 9 else 0.5) * (0.5 if c >= 9 else 0.8), c - 0.12)
add(fx, whoosh(0.6), CUES["wall"] - 0.15)
add(fx, whoosh(0.6) * 0.8, CUES["way_scene"] - 0.2)
for i, s in enumerate(STAMPS):
    add(fx, stamp(), s)
    add(fx, ding(80 + [0, 2, 4, 7, 9][i]) * 0.55, s + 0.02)  # rising A-flat pentatonic
add(fx, pop(), CUES["way_outro"])
add(fx, impact() * 0.7, CUES["thanks_hit"])
add(fx, ding(80) * 0.5, CUES["thank_you"])
add(fx, riser(1.5) * 0.8, 24.0)
add(fx, impact(), CUES["cta_hit"])
add(fx, ding(87), CUES["url_ding"])
add(fx, pop() * 0.8, CUES["contact"])
add(fx, impact() * 0.9, CUES["final_hit"])

# ── mix ──────────────────────────────────────────────────────────────────────
def reverb(x, secs=1.8, wet=0.25):
    n = int(secs * SR)
    ir = noise(n) * np.exp(-np.arange(n) / SR / (secs / 5))
    ir = onepole_lp(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    L = len(x) + n
    nfft = 1 << (L - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[: len(x)]
    return x + wet * y


# Hook low-pass: the groove "opens up" over the first 4 s.
cut = np.full(N, 20000.0)
hook_n = int(4.0 * SR)
cut[:hook_n] = 350 * (20000 / 350) ** ((np.arange(hook_n) / hook_n) ** 1.6)
music = reverb(music, 2.2, 0.35)
fx = reverb(fx, 1.6, 0.2)

# Sidechain: bass and music duck on every kick.
duck = np.ones(N)
for k in kicks:
    i = int(k * SR)
    n = int(0.22 * SR)
    j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], 1 - 0.55 * np.exp(-np.arange(j - i) / SR / 0.06))
bass *= duck
music *= 0.6 + 0.4 * duck

stems = {"drums": drums * 0.9, "bass": bass * 0.85, "music": music * 0.55, "fx": fx * 0.8}
ramp = 0.45 + 0.55 * (np.arange(hook_n) / hook_n) ** 2  # the hook swells into the logo hit
for k in ("drums", "bass", "music"):
    stems[k][:hook_n] = onepole_lp(stems[k][:hook_n], cut[:hook_n]) * ramp
way = slice(int(14 * SR), int(20 * SR))
stems["drums"][way] *= 0.8  # thinner groove so the stamps read

mix = sum(stems.values())
mix = np.tanh(1.15 * mix)
peak = np.max(np.abs(mix))
gain = 10 ** (-1 / 20) / peak
fade = np.ones(N)
fn = int(0.8 * SR)
fade[-fn:] = np.linspace(1, 0, fn) ** 1.5
mix = mix * gain * fade
for k in stems:
    stems[k] = np.clip(stems[k] * gain * fade, -1, 1)


def write(path, x):
    st = np.stack([x, x], axis=1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())


os.makedirs(OUT, exist_ok=True)
write(os.path.join(OUT, f"beat_{BPM}.wav"), mix)
for k, v in stems.items():
    write(os.path.join(OUT, f"stem_{k}.wav"), v)
with open(os.path.join(OUT, "cues.json"), "w") as f:
    json.dump(CUES, f, indent=2)

# QA without ears: loudness per second should follow the arrangement.
rms = [20 * np.log10(np.sqrt(np.mean(mix[int(s * SR):int((s + 1) * SR)] ** 2)) + 1e-9) for s in range(int(LEN))]
print("RMS dBFS per second:")
print(" ".join(f"{s:>2}:{r:5.1f}" for s, r in enumerate(rms)))
spec = np.abs(np.fft.rfft(mix))
fr = np.fft.rfftfreq(N, 1 / SR)
for lo, hi in [(20, 120), (120, 500), (500, 2000), (2000, 8000), (8000, 20000)]:
    e = np.sum(spec[(fr >= lo) & (fr < hi)] ** 2)
    print(f"band {lo:>5}-{hi:<5} Hz: {10 * np.log10(e + 1e-9):6.1f} dB")
print("wrote", OUT)
