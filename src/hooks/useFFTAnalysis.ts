"use client";

import { useRef } from "react";
import type { AudioEngine } from "@/core/AudioEngine";
import { getWindowCoefficients, applyWindow } from "@/dsp/WindowFunctions";
import { computeFFT, padToPowerOf2 } from "@/dsp/FFTProcessor";
import { useAudioStore } from "@/state/useAudioStore";
import { useAnimationFrame } from "./useAnimationFrame";
import type { AnalysisData } from "@/types/audio";

export function useFFTAnalysis(engineRef: React.RefObject<AudioEngine | null>) {
  const {
    isRunning,
    fftSize,
    windowFunction,
    kaiserBeta,
    setAnalysisData,
    setStats,
  } = useAudioStore();

  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(performance.now());

  useAnimationFrame(() => {
    const engine = engineRef.current;
    if (!engine || !engine.isRunning) return;

    const timeDomain = engine.getTimeDomainData();
    if (timeDomain.length === 0) return;

    const windowCoeffs = getWindowCoefficients(windowFunction, timeDomain.length, kaiserBeta);
    const windowedTimeDomain = applyWindow(timeDomain, windowCoeffs);

    const paddedWindowed = padToPowerOf2(windowedTimeDomain);
    const { magnitudeDb, phase } = computeFFT(paddedWindowed);

    const frequencyData = engine.getFrequencyData();

    const data: AnalysisData = {
      timeDomain,
      windowedTimeDomain,
      frequencyData,
      magnitudeDb,
      phase,
    };

    setAnalysisData(data);

    // FPS tracking
    frameCountRef.current++;
    const now = performance.now();
    const elapsed = now - lastFpsTimeRef.current;
    if (elapsed >= 1000) {
      const fps = Math.round((frameCountRef.current / elapsed) * 1000);
      const engineStats = engine.getStats();
      setStats({
        actualSampleRate: engineStats.sampleRate,
        latency: engineStats.latency,
        frameRate: fps,
        bufferSize: fftSize,
      });
      frameCountRef.current = 0;
      lastFpsTimeRef.current = now;
    }
  }, isRunning);
}
