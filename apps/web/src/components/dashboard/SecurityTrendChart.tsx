"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { ChartCard } from "@/components/ui/ChartCard";
import { SecurityTrendPoint } from "@/types/dashboard";
import { useIsMounted } from "@/lib/useIsMounted";

interface SecurityTrendChartProps {
  data: SecurityTrendPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const score = payload.find((p) => p.dataKey === "score")?.value;
    const benchmark = payload.find((p) => p.dataKey === "benchmark")?.value;

    return (
      <div className="p-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs font-mono space-y-1.5 min-w-[150px]">
        <div className="font-black text-black border-b-2 border-black pb-1 uppercase">
          {label}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-zinc-700 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600] border border-black" />
            Session Score:
          </span>
          <span className="font-mono font-black text-black bg-[#FFE600] px-1 border border-black">
            {score}/100
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-zinc-600 font-medium flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-black" />
            Target Baseline:
          </span>
          <span className="font-mono font-bold text-black">{benchmark}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const SecurityTrendChart: React.FC<SecurityTrendChartProps> = ({
  data,
}) => {
  const mounted = useIsMounted();

  return (
    <ChartCard
      title="Security Score Trend"
      subtitle="Rolling 10-day evaluation of parsed IPsec sessions against NIST baseline"
      action={
        <div className="flex items-center gap-3 text-xs font-mono font-bold text-black flex-wrap">
          <span className="flex items-center gap-1.5 bg-[#FFE600] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-black" />
            Session Score
          </span>
          <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
            <span className="w-2.5 h-0.5 bg-black border-t border-dashed border-black" />
            NIST Baseline (80)
          </span>
        </div>
      }
      className="h-[380px]"
    >
      {mounted ? (
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#000000"
                tick={{ fill: "#000000", fontSize: 11, fontWeight: "bold" }}
                tickLine={{ stroke: "#000000" }}
                axisLine={{ stroke: "#000000", strokeWidth: 2 }}
              />
              <YAxis
                stroke="#000000"
                tick={{ fill: "#000000", fontSize: 11, fontWeight: "bold" }}
                tickLine={{ stroke: "#000000" }}
                axisLine={{ stroke: "#000000", strokeWidth: 2 }}
                domain={[40, 100]}
                ticks={[40, 60, 80, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={80}
                stroke="#000000"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: "Target 80",
                  fill: "#000000",
                  fontSize: 10,
                  fontWeight: "bold",
                  position: "insideTopRight",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#000000"
                strokeWidth={3}
                dot={{
                  fill: "#FFE600",
                  stroke: "#000000",
                  strokeWidth: 2,
                  r: 4.5,
                }}
                activeDot={{
                  fill: "#FFE600",
                  stroke: "#000000",
                  strokeWidth: 3,
                  r: 7,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-[280px] flex items-center justify-center text-xs font-mono font-bold text-zinc-500">
          Loading chart telemetry...
        </div>
      )}
    </ChartCard>
  );
};
