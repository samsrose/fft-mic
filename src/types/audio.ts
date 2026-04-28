export const AUDIO_SOURCE_TYPES = ["microphone", "system"] as const;
export type AudioSourceType = (typeof AUDIO_SOURCE_TYPES)[number];

export const WINDOW_FUNCTIONS = [
  "rectangular",
  "hamming",
  "hanning",
  "blackman",
  "blackmanHarris",
  "kaiser",
  "triangular",
  "flatTop",
  "welch",
] as const;

export type WindowFunctionType = (typeof WINDOW_FUNCTIONS)[number];

export const FFT_SIZES = [256, 512, 1024, 2048, 4096, 8192, 16384] as const;
export type FFTSize = (typeof FFT_SIZES)[number];

export const SAMPLE_RATES = [8000, 16000, 22050, 44100, 48000, 96000] as const;
export type SampleRate = (typeof SAMPLE_RATES)[number];

export const BIT_DEPTHS = ["8", "16", "24", "32f"] as const;
export type BitDepth = (typeof BIT_DEPTHS)[number];

export const DISPLAY_MODES = ["bars", "line", "filled"] as const;
export type DisplayMode = (typeof DISPLAY_MODES)[number];

export const COLOR_MAPS = ["inferno", "viridis", "grayscale", "plasma"] as const;
export type ColorMap = (typeof COLOR_MAPS)[number];

export const FREQUENCY_SCALES = ["linear", "logarithmic"] as const;
export type FrequencyScale = (typeof FREQUENCY_SCALES)[number];

export interface FrequencyRange {
  min: number;
  max: number;
}

export interface DbRange {
  floor: number;
  ceiling: number;
}

export interface AudioConfig {
  fftSize: FFTSize;
  windowFunction: WindowFunctionType;
  smoothing: number;
  sampleRate: SampleRate;
  bitDepth: BitDepth;
  gain: number;
  frequencyRange: FrequencyRange;
  dbRange: DbRange;
}

export interface DisplayConfig {
  displayMode: DisplayMode;
  frequencyScale: FrequencyScale;
  colorMap: ColorMap;
  overlap: number;
  peakHold: boolean;
  peakDecayRate: number;
  showWindowed: boolean;
}

export interface AnalysisData {
  timeDomain: Float32Array;
  windowedTimeDomain: Float32Array;
  frequencyData: Float32Array;
  magnitudeDb: Float32Array;
  phase: Float32Array;
}

export interface AudioStats {
  actualSampleRate: number;
  latency: number;
  frameRate: number;
  bufferSize: number;
}

// --- ECS-inspired entity/component types ---

export type EntityId = string;

export interface Entity {
  id: EntityId;
  type: "audioSource" | "analyzer" | "visualizer";
}

export interface AudioSourceEntity extends Entity {
  type: "audioSource";
  deviceId: string;
  label: string;
}

export interface AnalyzerEntity extends Entity {
  type: "analyzer";
  config: AudioConfig;
}

export interface VisualizerEntity extends Entity {
  type: "visualizer";
  displayConfig: DisplayConfig;
}

export interface DeviceInfo {
  deviceId: string;
  label: string;
  groupId: string;
}
