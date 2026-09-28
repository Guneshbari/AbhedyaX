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
      <div className="p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-mono space-y-1">
        <div className="font-black text-black border-b-2 border-black pb-1 uppercase">
          {item.class} Traffic
        </div>
        <div className="flex items-center justify-between gap-3 text-zinc-700 font-bold">
          <span>Probability:</span>
          <span className="font-mono font-black text-black bg-[#FFE600] px-1 border border-black">
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
      className="h-[380px]"
    >
      {mounted ? (
        <div className="w-full h-[270px]">
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
                stroke="#000000"
                tick={{ fill: "#000000", fontSize: 11, fontWeight: "bold" }}
                tickLine={{ stroke: "#000000" }}
                axisLine={{ stroke: "#000000", strokeWidth: 2 }}
              />
              <YAxis
                type="category"
                dataKey="class"
                stroke="#000000"
                tick={{ fill: "#000000", fontSize: 12, fontWeight: "bold" }}
                tickLine={{ stroke: "#000000" }}
                axisLine={{ stroke: "#000000", strokeWidth: 2 }}
                width={85}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="percentage" stroke="#000000" strokeWidth={2}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.class}
                    fill={entry.isPredicted ? "#FFE600" : "#FAF8F5"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-[270px] flex items-center justify-center text-xs font-mono font-bold text-zinc-500">
          Loading distribution chart...
        </div>
      )}
    </ChartCard>
  );
};
