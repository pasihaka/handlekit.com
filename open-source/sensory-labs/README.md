# 🔬 Sensory Labs: Clinical Psychophysics & Web Audio Screening Engines

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Screening Labs](https://img.shields.io/badge/Live_Labs-HandleKit.com-00d2ff.svg)](https://handlekit.com)
[![Contrast Sensitivity](https://img.shields.io/badge/Vision-Pelli--Robson_Log_CS-10b981.svg)](https://handlekit.com/contrast-sensitivity-test)
[![Hearing Age](https://img.shields.io/badge/Audiology-Presbycusis_8kHz--20kHz-a855f7.svg)](https://handlekit.com/hearing-age-test)
[![Tinnitus Masker](https://img.shields.io/badge/Audio-Tinnitus_Notched_Masker-f59e0b.svg)](https://handlekit.com/tinnitus-frequency-matcher)

An open-source suite of client-side, zero-dependency sensory evaluation engines built with the **Web Audio API** and **HTML5 Canvas / SVG**.

Designed for researchers, optometrists, audiologists, educators, and developers who need scientifically grounded vision and hearing screeners that run entirely in the user's browser without tracking, ads, or server-side telemetry.

---

## 🌟 Live Demonstrations & Hosted Labs

The canonical, production implementations of these screening tools are hosted freely by **HandleKit Sensory Labs**:

| Screener | Scientific Benchmark | Live Production URL |
| :--- | :--- | :--- |
| **Visual Contrast Sensitivity Test** | Pelli-Robson Log CS (16 Weber contrast levels, Sloan optotypes) | [handlekit.com/contrast-sensitivity-test](https://handlekit.com/contrast-sensitivity-test) |
| **Biological Hearing Age Screener** | High-frequency presbycusis thresholding (8,000 Hz – 20,000 Hz) | [handlekit.com/hearing-age-test](https://handlekit.com/hearing-age-test) |
| **Tinnitus Pitch Matcher & Masker** | Subjective pitch discrimination + biquad notched sound therapy | [handlekit.com/tinnitus-frequency-matcher](https://handlekit.com/tinnitus-frequency-matcher) |
| **JND Color Perception Test** | Weber's Law difference thresholds (Oklab ΔE) | [handlekit.com/jnd-test](https://handlekit.com/jnd-test) |

---

## 🔬 Scientific Foundations & Engine Architecture

### 1. Visual Contrast Sensitivity (Pelli-Robson Log CS)
Unlike traditional Snellen visual acuity (which measures high-contrast spatial resolution / "20/20 vision"), **Contrast Sensitivity (CS)** evaluates an individual's ability to distinguish subtle gradations of luminance against a white background.

* **Contrast Definition**: Implements the standard Weber contrast formula:
  $$C = \frac{L_{target} - L_{background}}{L_{background}}$$
* **Logarithmic Scaling**: Results are reported in $\log_{10}(CS)$, where:
  $$\text{Log CS} = \log_{10}\left(\frac{1}{|C|}\right)$$
* **Clinical Protocol**:
  * 16 distinct contrast steps (from Log CS 0.05 up to 2.30 in ~0.15 log-unit decrements).
  * 10 standard Sloan optotype letters (`C, D, H, K, N, O, R, S, V, Z`) rendered with equal psychophysical legibility.
  * 2 triplets (6 letters) per contrast tier.
  * Passing criterion: at least 2 of 3 letters correctly identified per triplet.
  * Automatic threshold cessation when 2 or more errors occur in a triplet.

### 2. High-Frequency Presbycusis & Ear Age Screener
**Presbycusis** is the age-related sensorineural deterioration of high-frequency stereocilia hair cells at the basal turn of the cochlea.

* **Acoustic Spectrum**: Generates calibrated, pure sine waves ($8\text{ kHz}$ to $20\text{ kHz}$) using native `AudioContext.createOscillator()`.
* **Nyquist-Shannon Sampling**: Requires minimum digital-to-analog converter (DAC) sample rates of $44.1\text{ kHz}$ or $48\text{ kHz}$ to produce pure $20\text{ kHz}$ analog acoustic waves without anti-aliasing distortion.
* **The 17.4 kHz "Mosquito Tone"**: Tests the biological threshold typically lost by age 25.

### 3. Tinnitus Frequency Pitch Matcher & Notched Therapy
Because subjective tinnitus cannot be measured with external microphones, clinical matching relies on psychoacoustic pitch comparison.

* **Pure Tone Pitch Matching**: Sweeps from $250\text{ Hz}$ to $16,000\text{ Hz}$ with fine cent adjustment.
* **Acoustic Notched Sound Therapy**: Implements a second-order IIR biquad band-stop filter (`type = "notch"` with configurable $Q$-factor) on synthesized white/pink noise centered around the patient's detected tinnitus frequency.

---

## 🚀 Getting Started

### Local Standalone Demo
This repository includes a standalone demonstration in `index.html` requiring **zero build tools** and **zero dependencies**.

```bash
# Clone the repository
git clone https://github.com/pasihaka/sensory-labs.git
cd sensory-labs

# Open the standalone demo in your default browser
# macOS: open index.html
# Linux: xdg-open index.html
# Windows: start index.html
```

---

## 📦 Embedding the Tools on External Websites

You can embed the official, isolated interactive screeners into any website, optometry blog, or health portal using HandleKit's embed mode (`?embed=true`):

### Contrast Sensitivity Test Embed:
```html
<div style="max-width:100%;margin:0 auto;text-align:center;">
  <iframe 
    src="https://handlekit.com/contrast-sensitivity-test?embed=true" 
    width="100%" 
    height="720" 
    style="border:1px solid rgba(0,210,255,0.3);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.25);" 
    allow="fullscreen" 
    title="Visual Contrast Sensitivity Test (Pelli-Robson VCS)">
  </iframe>
  <div style="font-size:12px;color:#64748b;margin-top:8px;font-family:system-ui,-apple-system,sans-serif;">
    Vision screening benchmark powered by <a href="https://handlekit.com/contrast-sensitivity-test" target="_blank" rel="noopener" style="color:#0284c7;text-decoration:underline;font-weight:600;">HandleKit Sensory Labs</a>
  </div>
</div>
```

---

## 🔒 Privacy Guarantee

All sensory tests in this library execute 100% locally inside the client's Web Audio / Canvas execution context. No audio signals, webcam feeds, test scores, or biometric indicators are ever transmitted to a server.

---

## 📄 License & Attribution

Distributed under the **MIT License**. See `LICENSE` for details.

Developed and maintained by **[HandleKit](https://handlekit.com)**.
