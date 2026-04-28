"use client";

import { useEffect } from "react";
import { useAudioStore } from "@/state/useAudioStore";

const BASE_TITLE = "FFT";

function formatFrequency(hz: number): string {
  if (hz >= 1000) {
    return `${(hz / 1000).toFixed(hz >= 10000 ? 1 : 2)} kHz`;
  }
  return `${Math.round(hz)} Hz`;
}

export function useDocumentTitle(): void {
  const analysisData = useAudioStore((s) => s.analysisData);
  const isRunning = useAudioStore((s) => s.isRunning);
  const stats = useAudioStore((s) => s.stats);

  useEffect(() => {
    if (!isRunning || !analysisData) {
      document.title = BASE_TITLE;
      return;
    }

    const magnitudes = analysisData.magnitudeDb;
    const binCount = magnitudes.length;
    if (binCount === 0) {
      document.title = BASE_TITLE;
      return;
    }

    let peakBin = 0;
    let peakVal = -Infinity;
    for (let i = 1; i < binCount; i++) {
      if (magnitudes[i] > peakVal) {
        peakVal = magnitudes[i];
        peakBin = i;
      }
    }

    const sr = stats.actualSampleRate || 48000;
    const nyquist = sr / 2;
    const peakFreq = (peakBin / binCount) * nyquist;

    document.title = `${formatFrequency(peakFreq)} — ${BASE_TITLE}`;
  }, [analysisData, isRunning, stats]);
}
