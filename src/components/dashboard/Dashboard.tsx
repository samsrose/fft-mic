"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useFFTAnalysis } from "@/hooks/useFFTAnalysis";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { usePresets } from "@/hooks/usePresets";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { useAudioStore } from "@/state/useAudioStore";
import { TopBar } from "./TopBar";
import { SpectrumDisplay } from "./SpectrumDisplay";
import { SpectrogramDisplay } from "./SpectrogramDisplay";
import { ControlPanel } from "./ControlPanel";
import { PresetManager } from "./PresetManager";
import { SessionHistory } from "./SessionHistory";

const SAMPLE_INTERVAL_MS = 2000;

export function Dashboard() {
  const { engine, toggle } = useAudioEngine();
  useFFTAnalysis(engine);
  useDocumentTitle();

  const presetsHook = usePresets();
  const { startSession, endSession, recordSample, takeSnapshot } =
    useSessionTracking();

  const isRunning = useAudioStore((s) => s.isRunning);
  const analysisData = useAudioStore((s) => s.analysisData);
  const sampleRate = useAudioStore((s) => s.sampleRate);
  const fftSize = useAudioStore((s) => s.fftSize);
  const prevRunningRef = useRef(false);
  const sampleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && !prevRunningRef.current) {
      startSession();
      sampleTimerRef.current = setInterval(() => {
        const data = useAudioStore.getState().analysisData;
        if (!data) return;

        const mags = data.magnitudeDb;
        const validMags = Array.from(mags).filter((v) => isFinite(v));
        if (validMags.length === 0) return;

        const rmsDb =
          10 *
          Math.log10(
            validMags.reduce((s, v) => s + Math.pow(10, v / 10), 0) /
              validMags.length
          );

        const maxDb = Math.max(...validMags);
        const peakIdx = Array.from(mags).indexOf(maxDb);
        const sr = useAudioStore.getState().sampleRate;
        const fft = useAudioStore.getState().fftSize;
        const peakFreq = peakIdx * (sr / fft);

        recordSample(rmsDb, peakFreq);
      }, SAMPLE_INTERVAL_MS);
    }

    if (!isRunning && prevRunningRef.current) {
      endSession();
      if (sampleTimerRef.current) {
        clearInterval(sampleTimerRef.current);
        sampleTimerRef.current = null;
      }
    }

    prevRunningRef.current = isRunning;
  }, [isRunning, startSession, endSession, recordSample]);

  useEffect(() => {
    return () => {
      if (sampleTimerRef.current) clearInterval(sampleTimerRef.current);
    };
  }, []);

  const handleSnapshot = useCallback(async () => {
    if (!analysisData) return;
    const name = `Snapshot ${new Date().toLocaleTimeString()}`;
    await takeSnapshot(name, { magnitudeDb: analysisData.magnitudeDb });
  }, [analysisData, takeSnapshot]);

  return (
    <div className="flex flex-col gap-3 p-4 h-full">
      <TopBar onToggle={toggle} onSnapshot={isRunning ? handleSnapshot : undefined} />
      <SpectrumDisplay />
      <SpectrogramDisplay />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <PresetManager
          presets={presetsHook.presets}
          loading={presetsHook.loading}
          onSave={presetsHook.saveCurrentAsPreset}
          onLoad={presetsHook.loadPreset}
          onDelete={presetsHook.deletePreset}
        />
        <SessionHistory />
      </div>
      <ControlPanel />
    </div>
  );
}
