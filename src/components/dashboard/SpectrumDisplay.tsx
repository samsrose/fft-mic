"use client";

import { useEffect, useRef } from "react";
import { useAudioStore } from "@/state/useAudioStore";
import { useCanvasColors } from "@/hooks/useCanvasColors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SpectrumDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peakRef = useRef<Float32Array>(new Float32Array(0));
  const colors = useCanvasColors();

  const {
    analysisData,
    isRunning,
    displayMode,
    frequencyScale,
    frequencyRange,
    dbRange,
    peakHold,
    peakDecayRate,
    stats,
  } = useAudioStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const sr = stats.actualSampleRate || 48000;
    const nyquist = sr / 2;

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 8; i++) {
      const x = (w / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let i = 1; i < 6; i++) {
      const y = (h / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (!analysisData || !isRunning) {
      ctx.fillStyle = colors.text;
      ctx.font = "14px var(--font-geist-mono, monospace)";
      ctx.textAlign = "center";
      ctx.fillText(
        isRunning ? "Waiting for data..." : "Click Start to begin",
        w / 2,
        h / 2 + 5
      );
      return;
    }

    const freqData = analysisData.magnitudeDb;
    const binCount = freqData.length;

    const freqForBin = (bin: number) => (bin / binCount) * nyquist;

    const freqToX = (freq: number): number => {
      const minF = Math.max(frequencyRange.min, 1);
      const maxF = Math.min(frequencyRange.max, nyquist);
      if (frequencyScale === "logarithmic") {
        const logMin = Math.log10(minF);
        const logMax = Math.log10(maxF);
        const logF = Math.log10(Math.max(freq, minF));
        return ((logF - logMin) / (logMax - logMin)) * w;
      }
      return ((freq - minF) / (maxF - minF)) * w;
    };

    const dbToY = (db: number): number => {
      const clamped = Math.max(dbRange.floor, Math.min(dbRange.ceiling, db));
      return (1 - (clamped - dbRange.floor) / (dbRange.ceiling - dbRange.floor)) * h;
    };

    if (peakHold) {
      if (peakRef.current.length !== binCount) {
        peakRef.current = new Float32Array(binCount).fill(-200);
      }
      for (let i = 0; i < binCount; i++) {
        if (freqData[i] > peakRef.current[i]) {
          peakRef.current[i] = freqData[i];
        } else {
          peakRef.current[i] = peakRef.current[i] * peakDecayRate + freqData[i] * (1 - peakDecayRate);
        }
      }
    }

    if (displayMode === "bars") {
      const barWidth = Math.max(1, w / binCount);
      for (let i = 0; i < binCount; i++) {
        const freq = freqForBin(i);
        if (freq < frequencyRange.min || freq > frequencyRange.max) continue;

        const x = freqToX(freq);
        const y = dbToY(freqData[i]);
        const barH = h - y;

        ctx.fillStyle = colors.primary;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x, y, barWidth, barH);
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.beginPath();
      let started = false;

      for (let i = 0; i < binCount; i++) {
        const freq = freqForBin(i);
        if (freq < frequencyRange.min || freq > frequencyRange.max) continue;

        const x = freqToX(freq);
        const y = dbToY(freqData[i]);

        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }

      if (displayMode === "filled") {
        const lastFreq = Math.min(frequencyRange.max, nyquist);
        const firstFreq = Math.max(frequencyRange.min, 1);
        ctx.lineTo(freqToX(lastFreq), h);
        ctx.lineTo(freqToX(firstFreq), h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, colors.fillTop);
        grad.addColorStop(1, colors.fillBottom);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (peakHold && peakRef.current.length > 0) {
      ctx.strokeStyle = colors.peak;
      ctx.lineWidth = 1;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < binCount; i++) {
        const freq = freqForBin(i);
        if (freq < frequencyRange.min || freq > frequencyRange.max) continue;
        const x = freqToX(freq);
        const y = dbToY(peakRef.current[i]);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    ctx.fillStyle = colors.text;
    ctx.font = "10px var(--font-geist-mono, monospace)";

    ctx.textAlign = "right";
    ctx.fillText(`${dbRange.ceiling} dB`, w - 4, 14);
    ctx.fillText(`${dbRange.floor} dB`, w - 4, h - 4);

    const freqLabels =
      frequencyScale === "logarithmic"
        ? [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000]
        : [1000, 2000, 4000, 6000, 8000, 10000, 15000, 20000];

    ctx.textAlign = "center";
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 0.5;
    for (const f of freqLabels) {
      if (f < frequencyRange.min || f > frequencyRange.max) continue;
      const x = freqToX(f);
      if (x < 30 || x > w - 20) continue;

      ctx.beginPath();
      ctx.moveTo(x, h - 16);
      ctx.lineTo(x, h);
      ctx.stroke();

      const label = f >= 1000 ? `${f / 1000}k` : `${f}`;
      ctx.fillText(label, x, h - 4);
    }
  }, [
    analysisData,
    isRunning,
    displayMode,
    frequencyScale,
    frequencyRange,
    dbRange,
    peakHold,
    peakDecayRate,
    stats,
    colors,
  ]);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400" />
          Spectrum
          {peakHold && (
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500" />
              Peak Hold
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <canvas
          ref={canvasRef}
          className="w-full rounded-md"
          style={{ height: "200px" }}
        />
      </CardContent>
    </Card>
  );
}
