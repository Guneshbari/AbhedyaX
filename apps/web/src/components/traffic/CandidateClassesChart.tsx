"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { ChartCard } from "@/components/ui/ChartCard";
import { TrafficCandidateClass } from "@/types/analysis";
import { useIsMounted } from "@/lib/useIsMounted";

interface CandidateClassesChartProps {
  candidates: TrafficCandidateClass[];
  predictedClass: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { class: string; percentage: number } }>;
}

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35] shadow-xl text-xs space-y-1">
        <div className="font-semibold text-[#F4F7FA] border-b border-[#252B35] pb-1">
          {item.class} Traffic
        </div>
        <div className="flex items-center justify-between gap-3 text-[#9AA4B2]">
          <span>Probability:</span>
          <span className="font-mono font-bold text-blue-400">
            {item.percentage}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const CandidateClassesChart: React.FC<CandidateClassesChartProps> = ({
  candidates,
  predictedClass,
}) => {
  const mounted = useIsMounted();

  const chartData = candidates.map((c) => ({
    class: c.class,
    percentage: Number((c.confidence * 100).toFixed(1)),
    isPredicted: c.class.toLowerCase() === predictedClass.toLowerCase(),
  }));

  return (
    <ChartCard
      title="Candidate Class Probability Distribution"
      subtitle="Multi-class probability distribution derived from statistical flow vectors"
      className="h-[360px]"
    >
      {mounted ? (
        <div className="w-full h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                stroke="#687384"
                tick={{ fill: "#687384", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#252B35" }}
              />
              <YAxis
                type="category"
                dataKey="class"
                stroke="#687384"
                tick={{ fill: "#F4F7FA", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "#252B35" }}
                width={80}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.class}
                    fill={entry.isPredicted ? "#3B82F6" : "#252B35"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-[260px] flex items-center justify-center text-xs text-[#687384]">
          Loading distribution chart...
        </div>
      )}
    </ChartCard>
  );
};
