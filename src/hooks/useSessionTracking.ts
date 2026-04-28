"use client";

import { useCallback, useRef } from "react";
import { useAudioStore } from "@/state/useAudioStore";
import type { DbSession, CreateSnapshotInput } from "@/types/db";

export function useSessionTracking() {
  const currentSessionRef = useRef<DbSession | null>(null);
  const peakDbRef = useRef<number>(-Infinity);
  const peakFreqRef = useRef<number>(0);
  const dbSamplesRef = useRef<number[]>([]);

  const store = useAudioStore();

  const startSession = useCallback(async () => {
    const selectedDevice = store.devices.find(
      (d) => d.deviceId === store.selectedDeviceId
    );

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_type: store.sourceType,
        device_label: selectedDevice?.label ?? "Unknown",
        fft_size: store.fftSize,
        window_function: store.windowFunction,
        smoothing: store.smoothing,
        sample_rate: store.sampleRate,
        bit_depth: store.bitDepth,
        gain: store.gain,
      }),
    });

    if (!res.ok) {
      console.error("Failed to start session in database");
      return null;
    }

    const session: DbSession = await res.json();
    currentSessionRef.current = session;
    peakDbRef.current = -Infinity;
    peakFreqRef.current = 0;
    dbSamplesRef.current = [];
    return session;
  }, [store]);

  const endSession = useCallback(async () => {
    const session = currentSessionRef.current;
    if (!session) return null;

    const samples = dbSamplesRef.current;
    const avgDb =
      samples.length > 0
        ? samples.reduce((a, b) => a + b, 0) / samples.length
        : null;

    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avg_db: avgDb,
        peak_db: peakDbRef.current === -Infinity ? null : peakDbRef.current,
        peak_frequency: peakFreqRef.current || null,
      }),
    });

    currentSessionRef.current = null;

    if (!res.ok) {
      console.error("Failed to end session in database");
      return null;
    }

    return (await res.json()) as DbSession;
  }, []);

  const recordSample = useCallback(
    (rmsDb: number, peakFrequency: number) => {
      if (!currentSessionRef.current) return;

      if (isFinite(rmsDb)) {
        dbSamplesRef.current.push(rmsDb);
        if (rmsDb > peakDbRef.current) {
          peakDbRef.current = rmsDb;
        }
      }

      if (peakFrequency > 0 && rmsDb > peakDbRef.current - 3) {
        peakFreqRef.current = peakFrequency;
      }
    },
    []
  );

  const takeSnapshot = useCallback(
    async (name: string, analysisData: { magnitudeDb: Float32Array }) => {
      const magnitudes = Array.from(analysisData.magnitudeDb);
      const validMags = magnitudes.filter((v) => isFinite(v));
      const min = Math.min(...validMags);
      const max = Math.max(...validMags);
      const mean = validMags.reduce((a, b) => a + b, 0) / validMags.length;

      const peakIdx = magnitudes.indexOf(max);
      const binWidth = store.sampleRate / store.fftSize;
      const peakFreq = peakIdx * binWidth;

      const rmsDb =
        10 *
        Math.log10(
          validMags.reduce((sum, v) => sum + Math.pow(10, v / 10), 0) /
            validMags.length
        );

      const totalPower = validMags.reduce(
        (sum, v) => sum + Math.pow(10, v / 10),
        0
      );
      const centroid =
        validMags.reduce(
          (sum, v, i) => sum + i * binWidth * Math.pow(10, v / 10),
          0
        ) / totalPower;

      const topBins = magnitudes
        .map((v, i) => ({ freq: i * binWidth, db: v }))
        .filter((b) => isFinite(b.db))
        .sort((a, b) => b.db - a.db)
        .slice(0, 20)
        .map((b) => b.freq);

      const input: CreateSnapshotInput = {
        session_id: currentSessionRef.current?.id,
        name,
        fft_size: store.fftSize,
        window_function: store.windowFunction,
        sample_rate: store.sampleRate,
        frequency_bins: topBins,
        magnitude_db_summary: { min, max, mean },
        peak_frequency: peakFreq,
        peak_magnitude_db: max,
        rms_db: isFinite(rmsDb) ? rmsDb : undefined,
        spectral_centroid: isFinite(centroid) ? centroid : undefined,
      };

      const res = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) throw new Error("Failed to save snapshot");
      return await res.json();
    },
    [store.fftSize, store.windowFunction, store.sampleRate]
  );

  return {
    currentSession: currentSessionRef,
    startSession,
    endSession,
    recordSample,
    takeSnapshot,
  };
}
