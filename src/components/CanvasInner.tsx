"use client";
import { useRef, useMemo } from "react";
import { Stage, Layer, Circle, Line, Text, Arrow, Group } from "react-konva";
import { Employee, SolveResult } from "@/lib/types";
import { getCarColor } from "@/lib/colors";

const CANVAS_SIZE = 480;
const PADDING = 40;
const RANGE = 20;

function toCanvas(val: number): number {
  return PADDING + ((val + RANGE) / (2 * RANGE)) * (CANVAS_SIZE - 2 * PADDING);
}

interface Props {
  employees: Employee[];
  result: SolveResult | null;
  currentStep: number;
}

export default function CanvasInner({ employees, result, currentStep }: Props) {
  const stageRef = useRef<any>(null);

  const visibleEdges = useMemo(() => {
    if (!result) return [];
    return result.steps.slice(0, currentStep + 1);
  }, [result, currentStep]);

  const empColorMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (!result) return map;
    result.carResults.forEach((cr, i) => {
      cr.assignedEmployees.forEach((eid) => { map[eid] = getCarColor(i); });
    });
    return map;
  }, [result]);

  // Dot grid every 4 units
  const dots = useMemo(() => {
    const pts = [];
    for (let x = -20; x <= 20; x += 4)
      for (let y = -20; y <= 20; y += 4)
        pts.push({ x: toCanvas(x), y: toCanvas(y) });
    return pts;
  }, []);

  return (
    <div className="flex flex-col items-center pb-3">
      <Stage
        ref={stageRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        draggable
        style={{ cursor: "grab", background: "#0f1117" }}
      >
        <Layer>
          {/* Dot grid */}
          {dots.map((d, i) => (
            <Circle key={i} x={d.x} y={d.y} radius={1} fill="#1e2235" />
          ))}

          {/* Axes */}
          <Line
            points={[PADDING, toCanvas(0), CANVAS_SIZE - PADDING, toCanvas(0)]}
            stroke="#2d3452" strokeWidth={1}
          />
          <Line
            points={[toCanvas(0), PADDING, toCanvas(0), CANVAS_SIZE - PADDING]}
            stroke="#2d3452" strokeWidth={1}
          />

          {/* Route arrows */}
          {visibleEdges.map((step, i) => {
            const carIdx = result?.carResults.findIndex((cr) => cr.carId === step.carId) ?? 0;
            const color = getCarColor(carIdx);
            return (
              <Arrow
                key={i}
                points={[
                  toCanvas(step.from[0]), toCanvas(-step.from[1]),
                  toCanvas(step.to[0]),   toCanvas(-step.to[1]),
                ]}
                stroke={color}
                strokeWidth={2}
                fill={color}
                pointerLength={8}
                pointerWidth={6}
                opacity={0.85}
              />
            );
          })}

          {/* HQ origin */}
          <Circle
            x={toCanvas(0)} y={toCanvas(0)} radius={8}
            fill="#ffffff" shadowColor="#ffffff" shadowBlur={12}
          />
          <Text
            x={toCanvas(0) + 10} y={toCanvas(0) - 8}
            text="HQ" fontSize={10} fill="#e2e8f0" fontStyle="bold"
          />

          {/* Employee nodes */}
          {employees.map((emp) => {
            const cx = toCanvas(emp.x);
            const cy = toCanvas(-emp.y);
            const color = empColorMap[emp.id] ?? "#475569";
            const isActive =
              result && currentStep >= 0 &&
              result.steps[currentStep]?.employeeId === emp.id;
            return (
              <Group key={emp.id}>
                <Circle
                  x={cx} y={cy}
                  radius={isActive ? 14 : 10}
                  fill={color}
                  opacity={result ? 1 : 0.45}
                  shadowColor={isActive ? color : undefined}
                  shadowBlur={isActive ? 20 : 0}
                />
                <Text
                  x={cx - 5} y={cy - 6}
                  text={String(emp.id)}
                  fontSize={9} fill="#0f1117" fontStyle="bold"
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {/* Car legend */}
      {result && (
        <div className="flex flex-wrap gap-3 mt-2 px-4 justify-center">
          {result.carResults.map((cr, i) => (
            <div key={cr.carId} className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: getCarColor(i) }}
              />
              Car {cr.carId}
              {cr.failed && <span className="text-[#f87171]"> ⚠</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
