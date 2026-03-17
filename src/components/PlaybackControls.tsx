"use client";
import { SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Step } from "@/lib/types";
import { SpeedLevel } from "@/hooks/usePlayback";

interface Props {
  steps: Step[];
  playback: {
    currentStep: number;
    playing: boolean;
    speed: SpeedLevel;
    setSpeed: (s: SpeedLevel) => void;
    play: () => void;
    pause: () => void;
    next: () => void;
    prev: () => void;
    reset: () => void;
    end: () => void;
  };
}

const BTN =
  "w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e2235] " +
  "hover:bg-[#2d3452] text-[#94a3b8] hover:text-white transition-all " +
  "disabled:opacity-30 disabled:cursor-not-allowed";

export default function PlaybackControls({ steps, playback }: Props) {
  const { currentStep, playing, speed, setSpeed, play, pause, next, prev, reset, end } = playback;
  const total = steps.length;
  const currentData = currentStep >= 0 && currentStep < total ? steps[currentStep] : null;

  return (
    <div className="bg-[#1a1d27] rounded-xl border border-[#2d3452] p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Transport controls */}
        <div className="flex items-center gap-1.5">
          <button className={BTN} onClick={reset} disabled={currentStep <= -1} title="Reset">
            <SkipBack size={13} />
          </button>
          <button className={BTN} onClick={prev} disabled={currentStep <= -1} title="Prev">
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={playing ? pause : play}
            className="w-9 h-9 flex items-center justify-center rounded-lg
                       bg-[#22d3a5]/20 hover:bg-[#22d3a5]/30 text-[#22d3a5] transition-all"
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button className={BTN} onClick={next} disabled={currentStep >= total - 1} title="Next">
            <ChevronRight size={13} />
          </button>
          <button className={BTN} onClick={end} disabled={currentStep >= total - 1} title="End">
            <SkipForward size={13} />
          </button>
        </div>

        <span className="text-xs text-[#64748b]">
          Step {Math.max(currentStep + 1, 0)} of {total}
        </span>

        {/* Speed */}
        <div className="flex items-center gap-1 text-xs text-[#64748b]">
          <span>Speed:</span>
          {(["slow", "normal", "fast"] as SpeedLevel[]).map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded capitalize transition-all ${
                speed === s
                  ? "bg-[#22d3a5]/20 text-[#22d3a5]"
                  : "bg-[#1e2235] text-[#64748b] hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-[#0f1117] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#22d3a5] transition-all duration-300 rounded-full"
          style={{ width: `${total > 0 ? ((currentStep + 1) / total) * 100 : 0}%` }}
        />
      </div>

      {/* Step description */}
      <AnimatePresence mode="wait">
        {currentData ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-[#0f1117] rounded-lg px-3 py-2 text-xs text-[#94a3b8] leading-relaxed"
          >
            {currentData.description}
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#0f1117] rounded-lg px-3 py-2 text-xs text-[#475569] italic"
          >
            Press ▶ Play to start the step-by-step animation
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
