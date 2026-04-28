import { create } from "zustand";
import type {
  FFTSize,
  SampleRate,
  BitDepth,
  WindowFunctionType,
  DisplayMode,
  FrequencyScale,
  ColorMap,
  FrequencyRange,
  DbRange,
  DeviceInfo,
  AnalysisData,
  AudioStats,
  AudioSourceType,
} from "@/types/audio";

interface AudioState {
  // Engine state
  isRunning: boolean;
  devices: DeviceInfo[];
  selectedDeviceId: string;
  sourceType: AudioSourceType;

  // Audio config
  fftSize: FFTSize;
  windowFunction: WindowFunctionType;
  smoothing: number;
  sampleRate: SampleRate;
  bitDepth: BitDepth;
  gain: number;
  kaiserBeta: number;
  frequencyRange: FrequencyRange;
  dbRange: DbRange;

  // Display config
  displayMode: DisplayMode;
  frequencyScale: FrequencyScale;
  colorMap: ColorMap;
  overlap: number;
  peakHold: boolean;
  peakDecayRate: number;
  showWindowed: boolean;

  // Analysis data (updated every frame)
  analysisData: AnalysisData | null;
  stats: AudioStats;

  // Actions
  setIsRunning: (v: boolean) => void;
  setDevices: (d: DeviceInfo[]) => void;
  setSelectedDeviceId: (id: string) => void;
  setSourceType: (t: AudioSourceType) => void;
  setFFTSize: (s: FFTSize) => void;
  setWindowFunction: (w: WindowFunctionType) => void;
  setSmoothing: (s: number) => void;
  setSampleRate: (r: SampleRate) => void;
  setBitDepth: (b: BitDepth) => void;
  setGain: (g: number) => void;
  setKaiserBeta: (b: number) => void;
  setFrequencyRange: (r: FrequencyRange) => void;
  setDbRange: (r: DbRange) => void;
  setDisplayMode: (m: DisplayMode) => void;
  setFrequencyScale: (s: FrequencyScale) => void;
  setColorMap: (c: ColorMap) => void;
  setOverlap: (o: number) => void;
  setPeakHold: (p: boolean) => void;
  setPeakDecayRate: (r: number) => void;
  setShowWindowed: (s: boolean) => void;
  setAnalysisData: (d: AnalysisData | null) => void;
  setStats: (s: AudioStats) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isRunning: false,
  devices: [],
  selectedDeviceId: "",
  sourceType: "microphone",

  fftSize: 2048,
  windowFunction: "hanning",
  smoothing: 0.8,
  sampleRate: 48000,
  bitDepth: "32f",
  gain: 1.0,
  kaiserBeta: 5,
  frequencyRange: { min: 20, max: 20000 },
  dbRange: { floor: -100, ceiling: -10 },

  displayMode: "line",
  frequencyScale: "logarithmic",
  colorMap: "inferno",
  overlap: 50,
  peakHold: true,
  peakDecayRate: 0.98,
  showWindowed: false,

  analysisData: null,
  stats: { actualSampleRate: 0, latency: 0, frameRate: 0, bufferSize: 0 },

  setIsRunning: (v) => set({ isRunning: v }),
  setDevices: (d) => set({ devices: d }),
  setSelectedDeviceId: (id) => set({ selectedDeviceId: id }),
  setSourceType: (t) => set({ sourceType: t }),
  setFFTSize: (s) => set({ fftSize: s }),
  setWindowFunction: (w) => set({ windowFunction: w }),
  setSmoothing: (s) => set({ smoothing: s }),
  setSampleRate: (r) => set({ sampleRate: r }),
  setBitDepth: (b) => set({ bitDepth: b }),
  setGain: (g) => set({ gain: g }),
  setKaiserBeta: (b) => set({ kaiserBeta: b }),
  setFrequencyRange: (r) => set({ frequencyRange: r }),
  setDbRange: (r) => set({ dbRange: r }),
  setDisplayMode: (m) => set({ displayMode: m }),
  setFrequencyScale: (s) => set({ frequencyScale: s }),
  setColorMap: (c) => set({ colorMap: c }),
  setOverlap: (o) => set({ overlap: o }),
  setPeakHold: (p) => set({ peakHold: p }),
  setPeakDecayRate: (r) => set({ peakDecayRate: r }),
  setShowWindowed: (s) => set({ showWindowed: s }),
  setAnalysisData: (d) => set({ analysisData: d }),
  setStats: (s) => set({ stats: s }),
}));
