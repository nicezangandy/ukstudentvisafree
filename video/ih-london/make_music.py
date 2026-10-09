"""120 BPM, 30초 배경음악 합성 (자체 제작 음원). 드롭 3.0초, 마지막 히트 26.0초."""
import numpy as np, wave
SR = 48000; BPM = 120; BEAT = 60 / BPM; DUR = 30.0
N = int(SR * DUR); L = np.zeros(N); R = np.zeros(N)
t_all = np.arange(N) / SR
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def add(sig, start, pan=0.0, gain=1.0):
    i = int(start * SR); j = min(N, i + len(sig)); s = sig[: j - i] * gain
    L[i:j] += s * (1 - pan) ** 0.5 if pan > 0 else s; R[i:j] += s * (1 + pan) ** 0.5 if pan < 0 else s
def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR; e = np.minimum(1, t / a) * np.exp(-t / r); return e
def saw(f, n, det=0.0):
    t = np.arange(n) / SR; s = 0
    for d in (-det, 0, det):
        s = s + 2 * ((t * f * (1 + d)) % 1) - 1
    return s / 3
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); p = 0.0
    for k in range(len(x)): p = (1 - a) * x[k] + a * p; y[k] = p
    return y
# 진행: C - G - Am - F (1마디 = 2초 = 4박), 15마디
prog = [[60, 64, 67], [55, 59, 62, 67], [57, 60, 64], [53, 57, 60, 65]]
bass = [36, 31, 33, 29]
for bar in range(15):
    t0 = bar * 2.0; ch = prog[bar % 4]; n = int(2.0 * SR)
    pad = sum(saw(mtof(m), n, 0.004) for m in ch) / len(ch)
    fc = 600 if t0 < 3.0 else 1800
    pad = lowpass(pad, fc) * np.minimum(1, np.arange(n) / (0.05 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.05 * SR))
    add(pad, t0, gain=0.22 if t0 >= 2.0 else 0.18)
    if 3.0 <= t0 + 1.0 and t0 < 26.0:  # 드롭 이후 베이스·플럭
        for b in range(4):
            tb = t0 + b * BEAT
            if tb < 3.0 or tb >= 26.0: continue
            nb = int(BEAT * SR); f = mtof(bass[bar % 4])
            s = np.sin(2 * np.pi * f * np.arange(nb) / SR) + 0.3 * np.sin(4 * np.pi * f * np.arange(nb) / SR)
            add(s * env(nb, 0.005, 0.25), tb, gain=0.35)
        for k in range(8):
            tp = t0 + k * BEAT / 2
            if tp < 3.0 or tp >= 26.0: continue
            m = ch[(k * 2) % len(ch)] + 12; nb = int(0.25 * SR)
            add(lowpass(saw(mtof(m), nb), 3000) * env(nb, 0.002, 0.08), tp, pan=0.4 if k % 2 else -0.4, gain=0.12)
# 킥·하이햇·클랩 (드롭 3.0 ~ 26.0)
for b in range(int(DUR / BEAT)):
    tb = b * BEAT
    if 3.0 <= tb < 26.0:
        nk = int(0.3 * SR); tk = np.arange(nk) / SR
        kick = np.sin(2 * np.pi * (50 * tk + 90 * (1 - np.exp(-tk * 30)) / 30)) * np.exp(-tk * 12)
        add(kick, tb, gain=0.6)
        nh = int(0.05 * SR); add(np.random.randn(nh) * env(nh, 0.001, 0.015), tb + BEAT / 2, gain=0.08)
        if b % 2 == 1:
            nc = int(0.2 * SR); add(lowpass(np.random.randn(nc), 4000) * env(nc, 0.002, 0.05), tb, gain=0.2)
# 인트로 라이저 (1.0~3.0)
nr = int(2.0 * SR); rr = np.random.randn(nr) * np.linspace(0, 1, nr) ** 2
add(lowpass(rr, 2500), 1.0, gain=0.15)
# 드롭 임팩트 3.0, 마지막 히트 26.0 (긴 잔향 코드)
for th in (3.0, 26.0):
    nh = int(3.5 * SR) if th == 26.0 else int(1.0 * SR); th_t = np.arange(nh) / SR
    boom = np.sin(2 * np.pi * 45 * th_t) * np.exp(-th_t * 3)
    add(boom, th, gain=0.5)
nf = int(4.0 * SR); chord = sum(saw(mtof(m), nf, 0.006) for m in (48, 60, 64, 67, 72)) / 5
chord = lowpass(chord, 2200) * np.exp(-np.arange(nf) / SR * 0.9)
add(chord, 26.0, gain=0.45)
# 마지막 0.6초 페이드아웃
fade = np.ones(N); k = int(0.6 * SR); fade[-k:] = np.linspace(1, 0, k)
L *= fade; R *= fade
mx = max(np.abs(L).max(), np.abs(R).max()); L /= mx * 1.1; R /= mx * 1.1
data = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open("public/music.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
print("ok", N / SR)
