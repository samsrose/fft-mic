"use client";

import { useCallback, useEffect, useState } from "react";
import { useAudioStore } from "@/state/useAudioStore";
import type { DbPreset, CreatePresetInput } from "@/types/db";
import type {
  FFTSize,
  WindowFunctionType,
  SampleRate,
  BitDepth,
  DisplayMode,
  FrequencyScale,
  ColorMap,
} from "@/types/audio";

export function usePresets() {
  const [presets, setPresets] = useState<DbPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const store = useAudioStore();

  const fetchPresets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/presets");
      if (!res.ok) throw new Error("Failed to fetch presets");
      const data: DbPreset[] = await res.json();
      setPresets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const saveCurrentAsPreset = useCallback(
    async (name: string, description?: string) => {
      const input: CreatePresetInput = {
        name,
        description,
        fft_size: store.fftSize,
        window_function: store.windowFunction,
        smoothing: store.smoothing,
        sample_rate: store.sampleRate,
        bit_depth: store.bitDepth,
        gain: store.gain,
        kaiser_beta: store.kaiserBeta,
        freq_min: store.frequencyRange.min,
        freq_max: store.frequencyRange.max,
        db_floor: store.dbRange.floor,
        db_ceiling: store.dbRange.ceiling,
        display_mode: store.displayMode,
        frequency_scale: store.frequencyScale,
        color_map: store.colorMap,
        overlap: store.overlap,
        peak_hold: store.peakHold,
        peak_decay_rate: store.peakDecayRate,
        show_windowed: store.showWindowed,
      };

      const res = await fetch("/api/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) throw new Error("Failed to save preset");
      const saved: DbPreset = await res.json();
      setPresets((prev) => [saved, ...prev]);
      return saved;
    },
    [store]
  );

  const loadPreset = useCallback(
    (preset: DbPreset) => {
      store.setFFTSize(preset.fft_size as FFTSize);
      store.setWindowFunction(preset.window_function as WindowFunctionType);
      store.setSmoothing(preset.smoothing);
      store.setSampleRate(preset.sample_rate as SampleRate);
      store.setBitDepth(preset.bit_depth as BitDepth);
      store.setGain(preset.gain);
      store.setKaiserBeta(preset.kaiser_beta);
      store.setFrequencyRange({ min: preset.freq_min, max: preset.freq_max });
      store.setDbRange({ floor: preset.db_floor, ceiling: preset.db_ceiling });
      store.setDisplayMode(preset.display_mode as DisplayMode);
      store.setFrequencyScale(preset.frequency_scale as FrequencyScale);
      store.setColorMap(preset.color_map as ColorMap);
      store.setOverlap(preset.overlap);
      store.setPeakHold(preset.peak_hold);
      store.setPeakDecayRate(preset.peak_decay_rate);
      store.setShowWindowed(preset.show_windowed);
    },
    [store]
  );

  const deletePreset = useCallback(async (id: string) => {
    const res = await fetch(`/api/presets/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete preset");
    setPresets((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    presets,
    loading,
    error,
    fetchPresets,
    saveCurrentAsPreset,
    loadPreset,
    deletePreset,
  };
}
