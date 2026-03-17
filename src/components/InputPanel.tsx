"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car as CarIcon, User, Plus, Trash2, Zap, AlertTriangle } from "lucide-react";
import { Car, Employee } from "@/lib/types";
import { PRESETS } from "@/lib/presets";

interface Props {
  cars: Car[];
  setCars: (c: Car[]) => void;
  employees: Employee[];
  setEmployees: (e: Employee[]) => void;
  onSolve: () => void;
  loading: boolean;
}

export default function InputPanel({
  cars, setCars, employees, setEmployees, onSolve, loading,
}: Props) {
  const [errors, setErrors] = useState<string[]>([]);

  const addCar = () => {
    if (cars.length >= 8) return;
    const newId = cars.length ? Math.max(...cars.map((c) => c.id)) + 1 : 1;
    setCars([...cars, { id: newId, battery: 60 }]);
  };

  const removeCar = (id: number) => setCars(cars.filter((c) => c.id !== id));

  const updateBattery = (id: number, val: string) =>
    setCars(cars.map((c) => (c.id === id ? { ...c, battery: Number(val) } : c)));

  const addEmployee = () => {
    if (employees.length >= 20) return;
    const newId = employees.length ? Math.max(...employees.map((e) => e.id)) + 1 : 1;
    setEmployees([...employees, { id: newId, x: 0, y: 0 }]);
  };

  const removeEmployee = (id: number) =>
    setEmployees(employees.filter((e) => e.id !== id));

  const updateEmployee = (id: number, field: "x" | "y", val: string) =>
    setEmployees(employees.map((e) => (e.id === id ? { ...e, [field]: Number(val) } : e)));

  const loadPreset = (idx: number) => {
    const p = PRESETS[idx];
    setCars(p.cars.map((c) => ({ ...c })));
    setEmployees(p.employees.map((e) => ({ ...e })));
    setErrors([]);
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (cars.length === 0) errs.push("Add at least one car.");
    if (employees.length === 0) errs.push("Add at least one employee.");
    if (cars.some((c) => c.battery <= 0)) errs.push("All battery values must be > 0.");
    if (employees.some((e) => e.x < -20 || e.x > 20 || e.y < -20 || e.y > 20))
      errs.push("Coordinates must be in range −20 to 20.");
    setErrors(errs);
    return errs.length === 0;
  };

  const notEnoughSeats = cars.length * 4 < employees.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Preset Chips */}
      <div>
        <p className="text-xs text-[#94a3b8] mb-2 uppercase tracking-wider font-semibold">
          Preset Scenarios
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => loadPreset(i)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#1e2235] border border-[#2d3452]
                         text-[#94a3b8] hover:border-[#22d3a5] hover:text-[#22d3a5] transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cars */}
      <div className="bg-[#1a1d27] rounded-xl p-4 border border-[#2d3452]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
            <CarIcon size={14} className="text-[#22d3a5]" /> Fleet Configuration
          </p>
          <span className="text-xs text-[#64748b]">{cars.length}/8</span>
        </div>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          <AnimatePresence>
            {cars.map((car) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <span className="text-xs text-[#64748b] w-12 shrink-0">Car {car.id}</span>
                <input
                  type="number"
                  value={car.battery}
                  min={1}
                  onChange={(e) => updateBattery(car.id, e.target.value)}
                  className="flex-1 bg-[#0f1117] border border-[#2d3452] rounded-lg px-2 py-1.5
                             text-sm text-white focus:outline-none focus:border-[#22d3a5] transition-colors"
                  placeholder="Battery (km)"
                />
                <span className="text-xs text-[#475569]">km</span>
                <button
                  onClick={() => removeCar(car.id)}
                  className="text-[#475569] hover:text-[#f87171] transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <button
          onClick={addCar}
          disabled={cars.length >= 8}
          className="mt-3 w-full text-xs py-1.5 rounded-lg border border-dashed border-[#2d3452]
                     text-[#22d3a5] hover:border-[#22d3a5] hover:bg-[#22d3a5]/5 transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <Plus size={12} /> Add Car
        </button>
      </div>

      {/* Employees */}
      <div className="bg-[#1a1d27] rounded-xl p-4 border border-[#2d3452]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
            <User size={14} className="text-[#22d3a5]" /> Employee Home Locations
          </p>
          <span className="text-xs text-[#64748b]">{employees.length}/20</span>
        </div>
        <div className="grid grid-cols-3 gap-1 mb-1 px-1">
          <span className="text-xs text-[#475569]">ID</span>
          <span className="text-xs text-[#475569]">X</span>
          <span className="text-xs text-[#475569]">Y</span>
        </div>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          <AnimatePresence>
            {employees.map((emp) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-1.5"
              >
                <span className="text-xs text-[#64748b] w-10 shrink-0">E{emp.id}</span>
                {(["x", "y"] as const).map((field) => (
                  <input
                    key={field}
                    type="number"
                    value={emp[field]}
                    min={-20}
                    max={20}
                    onChange={(e) => updateEmployee(emp.id, field, e.target.value)}
                    className="flex-1 bg-[#0f1117] border border-[#2d3452] rounded-lg px-2 py-1.5
                               text-sm text-white focus:outline-none focus:border-[#22d3a5] transition-colors"
                  />
                ))}
                <button
                  onClick={() => removeEmployee(emp.id)}
                  className="text-[#475569] hover:text-[#f87171] transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <button
          onClick={addEmployee}
          disabled={employees.length >= 20}
          className="mt-3 w-full text-xs py-1.5 rounded-lg border border-dashed border-[#2d3452]
                     text-[#22d3a5] hover:border-[#22d3a5] hover:bg-[#22d3a5]/5 transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <Plus size={12} /> Add Employee
        </button>
      </div>

      {/* Warnings */}
      <AnimatePresence>
        {notEnoughSeats && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30
                       rounded-lg px-3 py-2 text-xs text-amber-400"
          >
            <AlertTriangle size={12} />
            Not enough seats for all employees (capacity: {cars.length * 4}).
          </motion.div>
        )}
        {errors.map((e) => (
          <motion.div
            key={e}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-[#f87171] px-1"
          >
            {e}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Solve Button */}
      <button
        onClick={() => { if (validate()) onSolve(); }}
        disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r
                   from-[#22d3a5] to-[#14b890] text-[#0f1117]
                   hover:shadow-[0_0_20px_rgba(34,211,165,0.35)] transition-all
                   disabled:opacity-70 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-[#0f1117]
                             border-t-transparent rounded-full" />
            Computing...
          </>
        ) : (
          <>
            <Zap size={16} /> Solve & Visualise
          </>
        )}
      </button>
    </div>
  );
}
