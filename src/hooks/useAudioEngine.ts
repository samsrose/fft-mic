"use client";

import { useCallback, useEffect, useRef } from "react";
import { AudioEngine } from "@/core/AudioEngine";
import { enumerateAudioDevices } from "@/core/MicrophoneSource";
import { useAudioStore } from "@/state/useAudioStore";

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);

  const {
    isRunning,
    selectedDeviceId,
    sourceType,
    fftSize,
    sampleRate,
    smoothing,
    gain,
    dbRange,
    setIsRunning,
    setDevices,
    setStats,
  } = useAudioStore();

  useEffect(() => {
    engineRef.current = new AudioEngine();
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  const refreshDevices = useCallback(async () => {
    const devices = await enumerateAudioDevices();
    setDevices(devices);
  }, [setDevices]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  const start = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;

    try {
      await engine.start(
        selectedDeviceId || undefined,
        fftSize,
        sampleRate,
        smoothing,
        sourceType
      );
      setIsRunning(true);
      await refreshDevices();

      const s = engine.getStats();
      setStats({
        actualSampleRate: s.sampleRate,
        latency: s.latency,
        frameRate: 0,
        bufferSize: s.bufferSize,
      });
    } catch (err) {
      console.error("Failed to start audio engine:", err);
      setIsRunning(false);
    }
  }, [selectedDeviceId, sourceType, fftSize, sampleRate, smoothing, setIsRunning, refreshDevices, setStats]);

  const stop = useCallback(async () => {
    await engineRef.current?.stop();
    setIsRunning(false);
  }, [setIsRunning]);

  const toggle = useCallback(async () => {
    if (isRunning) {
      await stop();
    } else {
      await start();
    }
  }, [isRunning, start, stop]);

  useEffect(() => {
    engineRef.current?.setFFTSize(fftSize);
  }, [fftSize]);

  useEffect(() => {
    engineRef.current?.setSmoothing(smoothing);
  }, [smoothing]);

  useEffect(() => {
    engineRef.current?.setGain(gain);
  }, [gain]);

  useEffect(() => {
    engineRef.current?.setDbRange(dbRange.floor, dbRange.ceiling);
  }, [dbRange]);

  return { engine: engineRef, start, stop, toggle, refreshDevices };
}
