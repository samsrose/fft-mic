"use client";

import { useEffect, useRef } from "react";
import { useAudioStore } from "@/state/useAudioStore";
import { useCanvasColors } from "@/hooks/useCanvasColors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WaveformDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { analysisData, showWindowed, isRunning } = useAudioStore();
  const colors = useCanvasColors();

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

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    const gridX = 8;
    const gridY = 6;
    for (let i = 1; i < gridX; i++) {
      const x = (w / gridX) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let i = 1; i < gridY; i++) {
      const y = (h / gridY) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

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

    const drawWaveform = (data: Float32Array, color: string) => {
      const len = data.length;
      const step = len / w;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      for (let px = 0; px < w; px++) {
        const idx = Math.floor(px * step);
        const val = data[idx] ?? 0;
        const y = ((1 - val) / 2) * h;

        if (px === 0) {
          ctx.moveTo(px, y);
        } else {
          ctx.lineTo(px, y);
        }
      }

      ctx.stroke();
    };

    drawWaveform(analysisData.timeDomain, colors.primary);

    if (showWindowed) {
      drawWaveform(analysisData.windowedTimeDomain, colors.secondary);
    }

    ctx.fillStyle = colors.text;
    ctx.font = "10px var(--font-geist-mono, monospace)";
    ctx.textAlign = "left";
    ctx.fillText("+1.0", 4, 14);
    ctx.fillText(" 0.0", 4, h / 2 - 4);
    ctx.fillText("-1.0", 4, h - 6);
  }, [analysisData, showWindowed, isRunning, colors]);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 dark:bg-cyan-400" />
          Waveform
          {showWindowed && (
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400" />
              Windowed
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
