"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { SolveResult, Car, Employee } from "@/lib/types";
import { getCarColor } from "@/lib/colors";
import BatteryChart from "./BatteryChart";

interface Props {
  result: SolveResult;
  cars: Car[];
  employees: Employee[];
}

type SortKey = "id" | "car";
type SortDir = "asc" | "desc";

export default function ResultsPanel({ result, cars, employees }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const tableRows = employees.map((emp) => {
    for (const cr of result.carResults) {
      const visitIdx = cr.assignedEmployees.indexOf(emp.id);
      if (visitIdx !== -1) {
        return {
          empId: emp.id, x: emp.x, y: emp.y,
          carId: cr.carId, visitOrder: visitIdx + 1,
          carIdx: result.carResults.indexOf(cr),
        };
      }
    }
    return { empId: emp.id, x: emp.x, y: emp.y, carId: -1, visitOrder: -1, carIdx: -1 };
  });

  const sortedRows = [...tableRows].sort((a, b) => {
    const av = sortKey === "id" ? a.empId : a.carId;
    const bv = sortKey === "id" ? b.empId : b.carId;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
          result.valid
            ? "bg-[#22d3a5]/10 border-[#22d3a5]/30 text-[#22d3a5]"
            : "bg-[#f87171]/10 border-[#f87171]/30 text-[#f87171]"
        }`}
      >
        {result.valid ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        {result.valid
          ? `✅ Valid Schedule — All ${employees.length} employees assigned successfully`
          : `❌ Invalid Schedule — Insufficient battery at Car${result.failedCarIds.length > 1 ? "s" : ""} ${result.failedCarIds.join(", ")}`}
      </motion.div>

      {/* Car Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.carResults.map((cr, i) => {
          const car = cars.find((c) => c.id === cr.carId)!;
          const pct = Math.min((cr.distanceUsed / car.battery) * 100, 100);
          const color = getCarColor(i);
          return (
            <motion.div
              key={cr.carId}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-[#1a1d27] rounded-xl p-4 border ${
                cr.failed ? "border-[#f87171]/40" : "border-[#2d3452]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full"
                        style={{ background: color }} />
                  <span className="text-sm font-semibold text-white">Car {cr.carId}</span>
                </div>
                {cr.failed && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f87171]/15
                                   text-[#f87171] border border-[#f87171]/30">
                    INSUFFICIENT BATTERY
                  </span>
                )}
              </div>

              <div className="mb-2">
                <div className="w-full h-2 bg-[#0f1117] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: cr.failed ? "#f87171" : "#22d3a5" }}
                  />
                </div>
                <p className="text-xs text-[#64748b] mt-1">
                  Used {cr.distanceUsed.toFixed(2)} km of {car.battery} km
                </p>
              </div>

              {cr.assignedEmployees.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1 text-xs mt-2">
                  <span className="px-2 py-0.5 rounded bg-[#0f1117] text-[#94a3b8]">HQ</span>
                  {cr.assignedEmployees.map((eid) => {
                    const emp = employees.find((e) => e.id === eid)!;
                    return (
                      <span key={eid} className="flex items-center gap-1">
                        <span className="text-[#475569]">→</span>
                        <span
                          className="px-2 py-0.5 rounded text-[#0f1117] font-semibold"
                          style={{ background: color }}
                        >
                          E{eid} ({emp?.x},{emp?.y})
                        </span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#475569] italic mt-2">No employees assigned</p>
              )}
            </motion.div>
          );
        })}
      </div>

      <BatteryChart carResults={result.carResults} cars={cars} />

      {/* Assignment Table */}
      <div className="bg-[#1a1d27] rounded-xl border border-[#2d3452] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2d3452]">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            Assignment Table
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[#64748b] bg-[#0f1117]/50">
                <th
                  className="text-left px-4 py-2 cursor-pointer hover:text-white select-none"
                  onClick={() => toggleSort("id")}
                >
                  Employee {sortKey === "id" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="text-left px-4 py-2">Location</th>
                <th
                  className="text-left px-4 py-2 cursor-pointer hover:text-white select-none"
                  onClick={() => toggleSort("car")}
                >
                  Assigned Car {sortKey === "car" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="text-left px-4 py-2">Visit Order</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, i) => (
                <tr
                  key={row.empId}
                  className={`border-t border-[#1e2235] hover:bg-[#1e2235]/60 transition-colors ${
                    i % 2 === 0 ? "" : "bg-[#0f1117]/20"
                  }`}
                >
                  <td className="px-4 py-2.5 text-white font-medium">Emp {row.empId}</td>
                  <td className="px-4 py-2.5 text-[#94a3b8]">({row.x}, {row.y})</td>
                  <td className="px-4 py-2.5">
                    {row.carId !== -1 ? (
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full"
                              style={{ background: getCarColor(row.carIdx) }} />
                        Car {row.carId}
                      </span>
                    ) : (
                      <span className="text-[#f87171]">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[#64748b]">
                    {row.visitOrder > 0 ? `#${row.visitOrder}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
