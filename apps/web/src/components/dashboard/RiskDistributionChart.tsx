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
      <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35] shadow-xl text-xs space-y-1 min-w-[150px]">
        <div className="flex items-center justify-between gap-2 border-b border-[#252B35] pb-1 font-semibold text-[#F4F7FA]">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.category} Risk
          </span>
          <span className="font-mono">{item.percentage}%</span>
        </div>
        <div className="flex items-center justify-between text-[#9AA4B2] pt-0.5">
          <span>Total Sessions:</span>
          <span className="font-mono text-[#F4F7FA] font-bold">{item.count}</span>
        </div>
        <p className="text-[10px] text-[#687384] pt-0.5 leading-snug">
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

  return (
    <ChartCard
      title="Risk Distribution"
      subtitle="Breakdown of evaluated tunnels by severity category"
      className="h-[360px]"
    >
      {mounted ? (
        <div className="flex flex-col sm:flex-row items-center justify-between h-full gap-4">
          {/* Donut Chart with Center Total */}
          <div className="relative w-full sm:w-1/2 h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  stroke="#0F1218"
                  strokeWidth={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomDonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-[#F4F7FA]">
                {totalSessions}
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#687384] tracking-wider">
                Sessions
              </span>
            </div>
          </div>

          {/* Severity Legend */}
          <div className="w-full sm:w-1/2 space-y-2 text-xs">
            {data.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between p-2 rounded-lg bg-[#141820]/60 border border-[#252B35]/60"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-[#F4F7FA]">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[#9AA4B2]">{item.count}</span>
                  <span className="text-[#687384] text-[11px] w-8 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-[200px] flex items-center justify-center text-xs text-[#687384]">
          Loading risk metrics...
        </div>
      )}
    </ChartCard>
  );
};
