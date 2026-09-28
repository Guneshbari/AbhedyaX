import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down";
  trendLabel?: string;
  icon?: LucideIcon;
  helperText?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trend,
  trendDirection = "up",
  trendLabel,
  icon: Icon,
  helperText,
  className,
}) => {
  const isPositive =
    trendDirection === "up" && !label.toLowerCase().includes("risk");

  return (
    <div
      className={cn(
        "relative p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between",
        "transition-all duration-100 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#000]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-black tracking-wider uppercase text-zinc-700 font-mono">
          {label}
        </span>
        {Icon && (
          <div className="p-2 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
            <Icon className="w-4 h-4 stroke-[2.5]" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-black">
          {value}
        </div>

        {(trend || helperText) && (
          <div className="mt-2.5 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-mono font-bold px-1.5 py-0.5 border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]",
                  isPositive
                    ? "bg-[#4ADE80] text-black"
                    : "bg-[#FBBF24] text-black"
                )}
              >
                {trendDirection === "up" ? (
                  <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                {trend}
              </span>
            )}

            {trendLabel && (
              <span className="text-zinc-600 font-mono text-[11px] font-bold truncate">
                {trendLabel}
              </span>
            )}
            {!trendLabel && helperText && (
              <span className="text-zinc-600 font-mono text-[11px] font-bold truncate">
                {helperText}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
