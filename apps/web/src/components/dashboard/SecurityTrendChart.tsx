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
      <div className="p-3 rounded-lg bg-[#141820] border border-[#252B35] shadow-xl text-xs space-y-1.5 min-w-[140px]">
        <div className="font-semibold text-[#F4F7FA] border-b border-[#252B35] pb-1">
          {label}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#9AA4B2] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Security Score:
          </span>
          <span className="font-mono font-bold text-blue-400">{score}/100</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#687384] flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-[#687384]" />
            Target Baseline:
          </span>
          <span className="font-mono text-[#9AA4B2]">{benchmark}</span>
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
        <div className="flex items-center gap-3 text-xs text-[#9AA4B2]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-blue-500 rounded" />
            Session Score
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#687384] border-t border-dashed border-[#9AA4B2]" />
            NIST Baseline (80)
          </span>
        </div>
      }
      className="h-[360px]"
    >
      {mounted ? (
        <div className="w-full h-[270px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1C222C"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#687384"
                tick={{ fill: "#687384", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#252B35" }}
              />
              <YAxis
                stroke="#687384"
                tick={{ fill: "#687384", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#252B35" }}
                domain={[40, 100]}
                ticks={[40, 60, 80, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={80}
                stroke="#687384"
                strokeDasharray="4 4"
                label={{
                  value: "Target 80",
                  fill: "#687384",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={{
                  fill: "#3B82F6",
                  stroke: "#0F1218",
                  strokeWidth: 2,
                  r: 3.5,
                }}
                activeDot={{
                  fill: "#60A5FA",
                  stroke: "#0F1218",
                  strokeWidth: 2,
                  r: 5,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-[270px] flex items-center justify-center text-xs text-[#687384]">
          Loading chart telemetry...
        </div>
      )}
    </ChartCard>
  );
};
