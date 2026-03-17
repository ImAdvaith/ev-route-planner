"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Step } from "@/lib/types";

export type SpeedLevel = "slow" | "normal" | "fast";

const SPEED_MAP: Record<SpeedLevel, number> = {
  slow: 1200,
  normal: 600,
  fast: 200,
};

export function usePlayback(steps: Step[]) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<SpeedLevel>("normal");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const tick = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= steps.length - 1) { setPlaying(false); return prev; }
      return prev + 1;
    });
  }, [steps.length]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setTimeout(tick, SPEED_MAP[speed]);
    }
    return clearTimer;
  }, [playing, currentStep, speed, tick]);

  const play = () => {
    if (currentStep >= steps.length - 1) setCurrentStep(-1);
    setPlaying(true);
  };
  const pause = () => setPlaying(false);
  const next = () => { pause(); setCurrentStep((p) => Math.min(p + 1, steps.length - 1)); };
  const prev = () => { pause(); setCurrentStep((p) => Math.max(p - 1, -1)); };
  const reset = () => { pause(); setCurrentStep(-1); };
  const end = () => { pause(); setCurrentStep(steps.length - 1); };

  return { currentStep, playing, speed, setSpeed, play, pause, next, prev, reset, end };
}
