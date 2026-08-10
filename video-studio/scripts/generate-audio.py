#!/usr/bin/env python3
"""Synthesize the ad's audio bed — pure stdlib, deterministic (no network).
  pad.wav     warm sustained note (enters when the first chip lands)
  tick.wav    soft snap for each placeholder
  resolve.wav gentle swell when all PII is handled (the 'safe' beat)
  keytick.wav tiny click for the enter key
"""
import wave, math, array, os

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
os.makedirs(OUT, exist_ok=True)


def write(name, samples):
    a = array.array("h", (int(max(-1.0, min(1.0, s)) * 32767) for s in samples))
    with wave.open(os.path.join(OUT, name), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(a.tobytes())
    print(f"  {name}  {len(samples)/SR:.1f}s")


def env(t, dur, atk, rel):
    if t < atk: return t / atk
    if t > dur - rel: return max(0.0, (dur - t) / rel)
    return 1.0


def pad(dur):
    # C2/C3/G3/C4 — root + fifth + octave, warm and stable
    freqs = [65.41, 130.81, 196.00, 261.63]
    gains = [0.55, 0.42, 0.26, 0.20]
    n = int(SR * dur); out = [0.0] * n
    for i in range(n):
        t = i / SR
        breath = 0.86 + 0.14 * math.sin(2 * math.pi * 0.13 * t)
        s = 0.0
        for f, g in zip(freqs, gains):
            s += g * (math.sin(2 * math.pi * f * t) + 0.12 * math.sin(2 * math.pi * 2 * f * t))
        out[i] = s * env(t, dur, 1.3, 1.8) * breath * 0.12
    return out


def tick(dur=0.13, base=760.0, vol=0.5):
    n = int(SR * dur); out = [0.0] * n
    for i in range(n):
        t = i / SR
        d = math.exp(-t * 34)
        s = (0.7 * math.sin(2 * math.pi * base * t) + 0.3 * math.sin(2 * math.pi * 2 * base * t)) * d
        if i < 30:  # tiny click transient
            s += 0.25 * (1 - i / 30) * (((i * 131) % 17) / 17 - 0.5)
        out[i] = s * vol
    return out


def resolve(dur=2.4):
    freqs = [130.81, 196.00, 261.63, 392.00]  # warm major-ish swell
    n = int(SR * dur); out = [0.0] * n
    for i in range(n):
        t = i / SR
        s = sum(0.28 * math.sin(2 * math.pi * f * t) for f in freqs)
        out[i] = s * env(t, dur, 0.8, 1.4) * 0.15
    return out


print("· synthesizing audio")
write("pad.wav", pad(34.0))
write("tick.wav", tick())
write("resolve.wav", resolve())
write("keytick.wav", tick(dur=0.06, base=420.0, vol=0.35))
print("done")
