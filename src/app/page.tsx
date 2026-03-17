"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import InputPanel from "@/components/InputPanel";
import CanvasView from "@/components/Canvas";
import PlaybackControls from "@/components/PlaybackControls";
import ResultsPanel from "@/components/ResultsPanel";
import { Car, Employee, SolveResult } from "@/lib/types";
import { solveEVRouting } from "@/lib/algorithm";
import { usePlayback } from "@/hooks/usePlayback";

export default function Home() {
  const [cars, setCars] = useState<Car[]>([
    { id: 1, battery: 60 },
    { id: 2, battery: 60 },
  ]);
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, x: 2, y: 3 }, { id: 2, x: -1, y: 5 },
    { id: 3, x: 4, y: -2 }, { id: 4, x: -3, y: -4 },
    { id: 5, x: 6, y: 1 },  { id: 6, x: -5, y: 2 },
  ]);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const playback = usePlayback(result?.steps ?? []);

  const handleSolve = async () => {
    setLoading(true);
    setResult(null);
    playback.reset();
    await new Promise((r) => setTimeout(r, 350));
    const res = solveEVRouting(cars, employees);
    setResult(res);
    setLoading(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f1117]/90 backdrop-blur border-b border-[#1e2235]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-[#22d3a5]" size={22} />
            <span className="text-lg font-bold tracking-tight">EV Route Planner</span>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-[#1a1d27] text-[#94a3b8] border border-[#2d3452]">
            DAA Capstone | CVRP Heuristic
          </span>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#22d3a5] to-transparent opacity-60" />
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Input Panel */}
          <div className="lg:w-[35%] w-full">
            <InputPanel
              cars={cars}
              setCars={setCars}
              employees={employees}
              setEmployees={setEmployees}
              onSolve={handleSolve}
              loading={loading}
            />
          </div>

          {/* Right: Canvas + Playback */}
          <div className="lg:w-[65%] w-full flex flex-col gap-4">
            <CanvasView
              employees={employees}
              result={result}
              currentStep={playback.currentStep}
            />
            {result && (
              <PlaybackControls steps={result.steps} playback={playback} />
            )}
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultsRef}
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-8"
            >
              <ResultsPanel result={result} cars={cars} employees={employees} />
            </motion.div>
          )}
        </AnimatePresence>

        <HowItWorks />
      </main>
    </div>
  );
}

function HowItWorks() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-10 bg-[#1a1d27] rounded-xl border border-[#2d3452] overflow-hidden">
      <button
        className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-[#1e2235] transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <span className="font-semibold text-sm text-[#94a3b8]">
          How It Works — Algorithm Overview
        </span>
        <span className="text-[#22d3a5] text-lg">{open ? "−" : "+"}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <ul className="px-6 pb-5 space-y-2 text-sm text-[#94a3b8] list-disc list-inside">
              <li>
                <strong className="text-[#22d3a5]">Phase 1 — Greedy Assignment:</strong>{" "}
                Employees are sorted farthest-first from HQ. Each is assigned to the car
                with fewest passengers and lowest estimated route distance.
              </li>
              <li>
                <strong className="text-[#22d3a5]">Phase 2 — Nearest Neighbour Routing:</strong>{" "}
                For each car&apos;s assigned employees, the algorithm greedily visits the closest
                unvisited employee next, starting from HQ.
              </li>
              <li>
                <strong className="text-[#22d3a5]">Battery Validation:</strong>{" "}
                Total route distance per car is computed. If it exceeds battery capacity,
                that car is marked FAILED.
              </li>
              <li>
                <strong className="text-[#22d3a5]">Output:</strong>{" "}
                A schedule is valid only if all cars complete their routes within battery
                limits. Failed cars are highlighted with excess distance details.
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

