# FFT Audio Analyzer Dashboard

Real-time audio spectrum analysis dashboard that captures audio from your MacBook's internal microphone, performs FFT with configurable window functions, and renders live visualizations.

## Features

- **Waveform Display** -- Real-time oscilloscope showing time-domain audio data with optional windowed overlay
- **Spectrum Analyzer** -- Frequency magnitude plot with bars, line, or filled display modes, logarithmic/linear scale, and peak hold
- **Spectrogram** -- Scrolling 2D waterfall heatmap with configurable color maps (inferno, viridis, plasma, grayscale)
- **9 Window Functions** -- Rectangular, Hamming, Hanning, Blackman, Blackman-Harris, Kaiser (adjustable beta), Triangular, Flat-top, Welch
- **Full Audio Controls** -- FFT size (256-16384), sample rate (8-96 kHz), bit depth, gain, smoothing, frequency range, dB range
- **Live Stats** -- Real-time display of sample rate, latency, and frame rate

## Architecture

The application follows a ring-level security model with ECS-inspired data flow:

| Ring | Layer | Responsibility |
|------|-------|---------------|
| 0 | Core | Audio engine, microphone access, permission guard |
| 1 | DSP | FFT processing, window functions, filter coefficients |
| 2 | State | Zustand store, React hooks |
| 3 | UI | Canvas visualizations, control components |

## Tech Stack

- **Next.js 16** with App Router and strict TypeScript
- **Tailwind CSS v4** + **shadcn/ui** for the dark-themed dashboard
- **Zustand** for state management
- **Web Audio API** for microphone capture and analysis
- **HTML5 Canvas** for 60fps visualizations
- **Custom Cooley-Tukey radix-2 FFT** for windowed analysis

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Start** to begin capturing audio from your microphone.

## Usage

1. Click **Start** to request microphone access and begin analysis
2. Select a different microphone from the dropdown if needed
3. Adjust the **Volume** slider to control pre-analysis gain
4. Use the **Advanced Controls** panel to configure:
   - FFT size and window function for analysis resolution
   - Sample rate and bit depth for audio quality
   - Frequency range and dB range for display bounds
   - Display mode, frequency scale, and color map for visualization style
   - Peak hold and overlap for spectrum and spectrogram behavior

## Project Structure

```
src/
├── app/                          # Next.js App Router
├── core/                         # Ring 0: Audio engine
│   ├── AudioEngine.ts
│   └── MicrophoneSource.ts
├── dsp/                          # Ring 1: DSP processing
│   ├── FFTProcessor.ts
│   ├── WindowFunctions.ts
│   └── Filters.ts
├── state/                        # Ring 2: Zustand store
│   └── useAudioStore.ts
├── hooks/                        # Ring 2: React hooks
│   ├── useAudioEngine.ts
│   ├── useFFTAnalysis.ts
│   └── useAnimationFrame.ts
├── components/
│   ├── dashboard/                # Ring 3: Visualization & controls
│   │   ├── Dashboard.tsx
│   │   ├── WaveformDisplay.tsx
│   │   ├── SpectrumDisplay.tsx
│   │   ├── SpectrogramDisplay.tsx
│   │   ├── TopBar.tsx
│   │   └── ControlPanel.tsx
│   └── ui/                       # shadcn/ui primitives
└── types/
    └── audio.ts                  # Shared TypeScript types
```

## License

MIT
