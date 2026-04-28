"use client";

import { useCallback, useEffect, useRef } from "react";

export function useAnimationFrame(callback: (deltaMs: number) => void, active: boolean) {
  const rafRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const loop = useCallback((time: number) => {
    if (prevTimeRef.current) {
      const delta = time - prevTimeRef.current;
      callbackRef.current(delta);
    }
    prevTimeRef.current = time;
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (active) {
      prevTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [active, loop]);
}
