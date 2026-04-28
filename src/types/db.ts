import type {
  FFTSize,
  WindowFunctionType,
  SampleRate,
  BitDepth,
  DisplayMode,
  FrequencyScale,
  ColorMap,
  AudioSourceType,
} from "./audio";

export interface DbPreset {
  id: string;
  name: string;
  description: string | null;
  fft_size: FFTSize;
  window_function: WindowFunctionType;
  smoothing: number;
  sample_rate: SampleRate;
  bit_depth: BitDepth;
  gain: number;
  kaiser_beta: number;
  freq_min: number;
  freq_max: number;
  db_floor: number;
  db_ceiling: number;
  display_mode: DisplayMode;
  frequency_scale: FrequencyScale;
  color_map: ColorMap;
  overlap: number;
  peak_hold: boolean;
  peak_decay_rate: number;
  show_windowed: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbSession {
  id: string;
  preset_id: string | null;
  device_label: string | null;
  source_type: AudioSourceType;
  fft_size: FFTSize;
  window_function: WindowFunctionType;
  smoothing: number;
  sample_rate: SampleRate;
  bit_depth: BitDepth;
  gain: number;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  avg_db: number | null;
  peak_db: number | null;
  peak_frequency: number | null;
  notes: string | null;
}

export interface DbSnapshot {
  id: string;
  session_id: string | null;
  name: string;
  fft_size: FFTSize;
  window_function: WindowFunctionType;
  sample_rate: SampleRate;
  frequency_bins: number[] | null;
  magnitude_db_summary: { min: number; max: number; mean: number } | null;
  peak_frequency: number | null;
  peak_magnitude_db: number | null;
  rms_db: number | null;
  spectral_centroid: number | null;
  created_at: string;
}

export interface CreatePresetInput {
  name: string;
  description?: string;
  fft_size: FFTSize;
  window_function: WindowFunctionType;
  smoothing: number;
  sample_rate: SampleRate;
  bit_depth: BitDepth;
  gain: number;
  kaiser_beta: number;
  freq_min: number;
  freq_max: number;
  db_floor: number;
  db_ceiling: number;
  display_mode: DisplayMode;
  frequency_scale: FrequencyScale;
  color_map: ColorMap;
  overlap: number;
  peak_hold: boolean;
  peak_decay_rate: number;
  show_windowed: boolean;
}

export interface CreateSessionInput {
  preset_id?: string;
  device_label?: string;
  source_type: AudioSourceType;
  fft_size: FFTSize;
  window_function: WindowFunctionType;
  smoothing: number;
  sample_rate: SampleRate;
  bit_depth: BitDepth;
  gain: number;
}

export interface EndSessionInput {
  avg_db?: number;
  peak_db?: number;
  peak_frequency?: number;
  notes?: string;
}

export interface CreateSnapshotInput {
  session_id?: string;
  name: string;
  fft_size: FFTSize;
  window_function: WindowFunctionType;
  sample_rate: SampleRate;
  frequency_bins?: number[];
  magnitude_db_summary?: { min: number; max: number; mean: number };
  peak_frequency?: number;
  peak_magnitude_db?: number;
  rms_db?: number;
  spectral_centroid?: number;
}
