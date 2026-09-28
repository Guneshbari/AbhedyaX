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
        "relative p-5 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col justify-between",
        "transition-colors duration-150 hover:border-[#3B4252]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium tracking-wide uppercase text-[#9AA4B2]">
          {label}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-[#141820] border border-[#252B35] text-[#9AA4B2]">
            <Icon className="w-4 h-4 text-blue-400" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#F4F7FA]">
          {value}
        </div>

        {(trend || helperText) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded",
                  isPositive
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                )}
              >
                {trendDirection === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend}
              </span>
            )}

            {trendLabel && (
              <span className="text-[#687384] truncate">{trendLabel}</span>
            )}
            {!trendLabel && helperText && (
              <span className="text-[#687384] truncate">{helperText}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
