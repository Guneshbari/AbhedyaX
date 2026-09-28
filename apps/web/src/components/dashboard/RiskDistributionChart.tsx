"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { ChartCard } from "@/components/ui/ChartCard";
import { RiskDistributionItem } from "@/types/dashboard";
import { useIsMounted } from "@/lib/useIsMounted";

interface RiskDistributionChartProps {
  data: RiskDistributionItem[];
}

interface CustomDonutTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: RiskDistributionItem }>;
}

const CustomDonutTooltip: React.FC<CustomDonutTooltipProps> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-mono space-y-1 min-w-[150px]">
        <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-1 font-black text-black">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full border border-black"
              style={{ backgroundColor: item.color }}
            />
            {item.category} Risk
          </span>
          <span className="font-mono bg-[#FFE600] px-1 border border-black">{item.percentage}%</span>
        </div>
        <div className="flex items-center justify-between text-zinc-700 pt-0.5 font-bold">
          <span>Total Sessions:</span>
          <span className="font-mono text-black font-black">{item.count}</span>
        </div>
        <p className="text-[10px] text-zinc-600 pt-0.5 leading-snug font-medium font-sans">
          {item.description}
        </p>
      </div>
    );
  }
  return null;
};

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  data,
}) => {
  const mounted = useIsMounted();
  const totalSessions = data.reduce((acc, curr) => acc + curr.count, 0);

  // Map category to neo-brutalist vibrant palette
  const getNeoColor = (category: string, fallback: string) => {
    switch (category.toLowerCase()) {
      case "low":
        return "#4ADE80";
      case "moderate":
      case "medium":
        return "#FBBF24";
      case "high":
        return "#FB923C";
      case "critical":
        return "#FF4B4B";
      default:
        return fallback;
    }
  };

  const chartData = data.map((d) => ({
    ...d,
    color: getNeoColor(d.category, d.color),
  }));

  return (
    <ChartCard
      title="Risk Distribution"
      subtitle="Breakdown of evaluated tunnels by severity category"
      className="h-[380px]"
    >
      {mounted ? (
        <div className="flex flex-col sm:flex-row items-center justify-between h-full gap-4">
          {/* Donut Chart with Center Total */}
          <div className="relative w-full sm:w-1/2 h-[210px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  stroke="#000000"
                  strokeWidth={2}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomDonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black font-mono text-black">
                {totalSessions}
              </span>
              <span className="text-[10px] uppercase font-black font-mono text-zinc-600 tracking-wider">
                Sessions
              </span>
            </div>
          </div>

          {/* Severity Legend */}
          <div className="w-full sm:w-1/2 space-y-2 text-xs font-mono">
            {chartData.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between p-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-black shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-black text-black">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono font-bold">
                  <span className="text-black">{item.count}</span>
                  <span className="bg-zinc-100 border border-black px-1 text-[11px] w-10 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-[210px] flex items-center justify-center text-xs font-mono font-bold text-zinc-500">
          Loading risk metrics...
        </div>
      )}
    </ChartCard>
  );
};
