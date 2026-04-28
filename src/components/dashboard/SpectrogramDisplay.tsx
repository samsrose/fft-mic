"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAudioStore } from "@/state/useAudioStore";
import { useCanvasColors } from "@/hooks/useCanvasColors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ColorMap } from "@/types/audio";

function colorMapFn(value: number, map: ColorMap): [number, number, number] {
  const t = Math.max(0, Math.min(1, value));

  switch (map) {
    case "inferno": {
      const r = Math.round(255 * Math.min(1, t * 3));
      const g = Math.round(255 * Math.max(0, Math.min(1, t * 3 - 1)));
      const b = Math.round(255 * Math.max(0, Math.min(1, (1 - t) * 2)));
      return [r, g, b];
    }
    case "viridis": {
      const r = Math.round(255 * (0.267 + t * 0.329));
      const g = Math.round(255 * Math.min(1, 0.004 + t * 0.874));
      const b = Math.round(255 * Math.max(0, 0.329 - t * 0.329 + t * t * 0.5));
      return [r, g, b];
    }
    case "plasma": {
      const r = Math.round(255 * Math.min(1, 0.05 + t * 1.2));
      const g = Math.round(255 * Math.max(0, t * t * 0.9));
      const b = Math.round(255 * Math.max(0, 0.53 - t * 0.8 + t * t * 0.8));
      return [r, g, b];
    }
    case "grayscale":
    default: {
      const v = Math.round(255 * t);
      return [v, v, v];
    }
  }
}

function formatFrequency(hz: number): string {
  if (hz >= 1000) {
    return `${(hz / 1000).toFixed(hz >= 10000 ? 1 : 2)} kHz`;
  }
  return `${Math.round(hz)} Hz`;
}

export function SpectrogramDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const initializedRef = useRef(false);
  const colors = useCanvasColors();
  const [hoverX, setHoverX] = useState<number | null>(null);

  const { analysisData, isRunning, colorMap, frequencyRange, dbRange, stats } =
    useAudioStore();

  const initOffscreen = useCallback(
    (width: number, height: number, bgColor: string) => {
      if (!offscreenRef.current) {
        offscreenRef.current = document.createElement("canvas");
      }
      offscreenRef.current.width = width;
      offscreenRef.current.height = height;
      const ctx = offscreenRef.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }
      initializedRef.current = true;
    },
    []
  );

  // Spectrogram rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cw = Math.round(rect.width * dpr);
    const ch = Math.round(rect.height * dpr);

    canvas.width = cw;
    canvas.height = ch;

    if (!initializedRef.current) {
      initOffscreen(cw, ch, colors.bg);
    }

    const offscreen = offscreenRef.current;
    if (!offscreen || !analysisData || !isRunning) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, rect.width, rect.height);
        if (!isRunning) {
          ctx.fillStyle = colors.text;
          ctx.font = "14px var(--font-geist-mono, monospace)";
          ctx.textAlign = "center";
          ctx.fillText("Click Start to begin", rect.width / 2, rect.height / 2 + 5);
        }
      }
      return;
    }

    const octx = offscreen.getContext("2d");
    if (!octx) return;

    const freqData = analysisData.magnitudeDb;
    const binCount = freqData.length;
    const sr = stats.actualSampleRate || 48000;
    const nyquist = sr / 2;

    const imgData = octx.getImageData(0, 1, cw, ch - 1);
    octx.putImageData(imgData, 0, 0);

    const rowData = octx.createImageData(cw, 1);
    for (let px = 0; px < cw; px++) {
      const ratio = px / cw;
      const minF = Math.max(frequencyRange.min, 1);
      const maxF = Math.min(frequencyRange.max, nyquist);

      const logMin = Math.log10(minF);
      const logMax = Math.log10(maxF);
      const freq = Math.pow(10, logMin + ratio * (logMax - logMin));

      const bin = Math.round((freq / nyquist) * binCount);
      const db = bin < binCount ? freqData[bin] : -200;

      const normalized = (db - dbRange.floor) / (dbRange.ceiling - dbRange.floor);
      const [r, g, b] = colorMapFn(normalized, colorMap);

      const idx = px * 4;
      rowData.data[idx] = r;
      rowData.data[idx + 1] = g;
      rowData.data[idx + 2] = b;
      rowData.data[idx + 3] = 255;
    }
    octx.putImageData(rowData, 0, ch - 1);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(offscreen, 0, 0);
    }
  }, [analysisData, isRunning, colorMap, frequencyRange, dbRange, stats, initOffscreen, colors]);

  // Overlay rendering for hover crosshair
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = overlay.getBoundingClientRect();
    overlay.width = Math.round(rect.width * dpr);
    overlay.height = Math.round(rect.height * dpr);

    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    if (hoverX === null || !isRunning) return;

    const sr = stats.actualSampleRate || 48000;
    const nyquist = sr / 2;
    const minF = Math.max(frequencyRange.min, 1);
    const maxF = Math.min(frequencyRange.max, nyquist);
    const logMin = Math.log10(minF);
    const logMax = Math.log10(maxF);
    const ratio = hoverX / w;
    const freq = Math.pow(10, logMin + ratio * (logMax - logMin));

    // Vertical line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(hoverX, 0);
    ctx.lineTo(hoverX, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Frequency label
    const label = formatFrequency(freq);
    ctx.font = "11px var(--font-geist-mono, monospace)";
    const textWidth = ctx.measureText(label).width;
    const padding = 5;
    const pillW = textWidth + padding * 2;
    const pillH = 18;

    // Position the pill so it doesn't overflow the canvas edges
    let pillX = hoverX + 8;
    if (pillX + pillW > w - 2) {
      pillX = hoverX - pillW - 8;
    }
    const pillY = 6;

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 4);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, pillX + padding, pillY + pillH / 2);
    ctx.textBaseline = "alphabetic";
  }, [hoverX, isRunning, frequencyRange, stats]);

  useEffect(() => {
    if (!isRunning) {
      initializedRef.current = false;
    }
  }, [isRunning]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoverX(e.clientX - rect.left);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setHoverX(null);
  }, []);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
          Spectrogram
          <span className="text-xs text-muted-foreground ml-auto capitalize">
            {colorMap}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full rounded-md"
            style={{ height: "360px" }}
          />
          <canvas
            ref={overlayRef}
            className="absolute inset-0 w-full rounded-md cursor-crosshair"
            style={{ height: "360px" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </div>
      </CardContent>
    </Card>
  );
}
