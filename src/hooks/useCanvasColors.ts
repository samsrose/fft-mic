"use client";

import { useMemo, useSyncExternalStore } from "react";

function subscribeToDarkMode(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getIsDark() {
  if (typeof document === "undefined") return true;
  return document.documentElement.classList.contains("dark");
}

export interface CanvasColors {
  bg: string;
  grid: string;
  axis: string;
  text: string;
  primary: string;
  secondary: string;
  peak: string;
  fillTop: string;
  fillBottom: string;
}

export function useCanvasColors(): CanvasColors {
  const isDark = useSyncExternalStore(subscribeToDarkMode, getIsDark, () => true);

  return useMemo<CanvasColors>(
    () =>
      isDark
        ? {
            bg: "#0a0a0a",
            grid: "rgba(255, 255, 255, 0.06)",
            axis: "rgba(255, 255, 255, 0.15)",
            text: "rgba(255, 255, 255, 0.4)",
            primary: "#22d3ee",
            secondary: "#a78bfa",
            peak: "#f43f5e",
            fillTop: "rgba(34, 211, 238, 0.6)",
            fillBottom: "rgba(34, 211, 238, 0.02)",
          }
        : {
            bg: "#fafafa",
            grid: "rgba(0, 0, 0, 0.07)",
            axis: "rgba(0, 0, 0, 0.15)",
            text: "rgba(0, 0, 0, 0.45)",
            primary: "#0891b2",
            secondary: "#7c3aed",
            peak: "#e11d48",
            fillTop: "rgba(8, 145, 178, 0.5)",
            fillBottom: "rgba(8, 145, 178, 0.02)",
          },
    [isDark]
  );
}
