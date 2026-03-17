"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { CarResult, Car } from "@/lib/types";

interface Props {
  carResults: CarResult[];
  cars: Car[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d27] border border-[#2d3452] rounded-lg px-3 py-2 text-xs">
      <p className="text-white font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {Number(p.value).toFixed(2)} km
        </p>
      ))}
    </div>
  );
};

export default function BatteryChart({ carResults, cars }: Props) {
  const data = carResults.map((cr) => {
    const car = cars.find((c) => c.id === cr.carId);
    return {
      name: `Car ${cr.carId}`,
      "Battery Available": car?.battery ?? 0,
      "Distance Used": parseFloat(cr.distanceUsed.toFixed(2)),
    };
  });

  return (
    <div className="bg-[#1a1d27] rounded-xl border border-[#2d3452] p-4">
      <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-4">
        Battery Usage per Car
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="25%" barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3452" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }}
                 axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }}
                 axisLine={false} tickLine={false} unit=" km" />
          <Tooltip content={<CustomTooltip />}
                   cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 8 }}
            iconType="square" iconSize={10}
          />
          <Bar dataKey="Battery Available" fill="#7eb5d4" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Distance Used" fill="#22d3a5" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
