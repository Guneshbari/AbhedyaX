import React from "react";
import { cn } from "@/lib/utils";

interface SecurityScoreProps {
  score: number;
  grade?: "A" | "B" | "C" | "D" | "F";
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  showGrade?: boolean;
  className?: string;
}

export const SecurityScore: React.FC<SecurityScoreProps> = ({
  score,
  grade,
  size = "md",
  showProgress = false,
  showGrade = true,
  className,
}) => {
  const getGrade = (s: number): "A" | "B" | "C" | "D" | "F" => {
    if (grade) return grade;
    if (s >= 90) return "A";
    if (s >= 80) return "B";
    if (s >= 70) return "C";
    if (s >= 50) return "D";
    return "F";
  };

  const calculatedGrade = getGrade(score);

  const getColorConfig = (s: number) => {
    if (s >= 85) {
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        bar: "bg-emerald-500",
      };
    }
    if (s >= 70) {
      return {
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        bar: "bg-amber-500",
      };
    }
    if (s >= 50) {
      return {
        text: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        bar: "bg-orange-500",
      };
    }
    return {
      text: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      bar: "bg-red-500",
    };
  };

  const colors = getColorConfig(score);

  const sizeConfigs = {
    sm: {
      text: "text-xs font-semibold",
      grade: "text-[10px] px-1 py-0.2",
      container: "gap-1.5",
    },
    md: {
      text: "text-sm font-semibold",
      grade: "text-xs px-1.5 py-0.5",
      container: "gap-2",
    },
    lg: {
      text: "text-2xl font-bold",
      grade: "text-sm px-2 py-0.5",
      container: "gap-2.5",
    },
  };

  const currentSize = sizeConfigs[size];

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className={cn("inline-flex items-center", currentSize.container)}>
        <span className={cn("font-mono tracking-tight", currentSize.text, colors.text)}>
          {score}
          <span className="text-[0.75em] text-[#687384]">/100</span>
        </span>
        {showGrade && (
          <span
            className={cn(
              "font-bold rounded border font-mono select-none",
              currentSize.grade,
              colors.bg,
              colors.border,
              colors.text
            )}
          >
            {calculatedGrade}
          </span>
        )}
      </div>

      {showProgress && (
        <div className="w-full bg-[#141820] h-1.5 rounded-full overflow-hidden border border-[#252B35]">
          <div
            className={cn("h-full rounded-full transition-all duration-300", colors.bar)}
            style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
