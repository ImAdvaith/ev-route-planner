"use client";
import dynamic from "next/dynamic";
import { Employee, SolveResult } from "@/lib/types";

// Must be dynamically imported with ssr:false — Konva uses browser APIs
const CanvasInner = dynamic(() => import("./CanvasInner"), { ssr: false });

interface Props {
  employees: Employee[];
  result: SolveResult | null;
  currentStep: number;
}

export default function CanvasView(props: Props) {
  return (
    <div className="bg-[#1a1d27] rounded-xl border border-[#2d3452] overflow-hidden">
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
          Route Canvas
        </p>
        <p className="text-xs text-[#475569]">Pan & zoom to explore</p>
      </div>
      <CanvasInner {...props} />
    </div>
  );
}
