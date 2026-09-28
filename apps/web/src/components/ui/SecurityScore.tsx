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
    if (s >= 60) return "D";
    return "F";
  };

  const calculatedGrade = getGrade(score);

  const getColorConfig = (s: number) => {
    if (s >= 90) {
      return {
        bg: "bg-[#4ADE80]",
        text: "text-black",
        bar: "bg-[#4ADE80]",
      };
    }
    if (s >= 75) {
      return {
        bg: "bg-[#38BDF8]",
        text: "text-black",
        bar: "bg-[#38BDF8]",
      };
    }
    if (s >= 50) {
      return {
        bg: "bg-[#FBBF24]",
        text: "text-black",
        bar: "bg-[#FBBF24]",
      };
    }
    return {
      bg: "bg-[#FF4B4B]",
      text: "text-black",
      bar: "bg-[#FF4B4B]",
    };
  };

  const colors = getColorConfig(score);

  const sizeConfigs = {
    sm: {
      text: "text-sm font-black",
      grade: "text-xs px-1.5 py-0.2",
      container: "gap-1.5",
    },
    md: {
      text: "text-base font-black",
      grade: "text-xs px-2 py-0.5",
      container: "gap-2",
    },
    lg: {
      text: "text-3xl font-black",
      grade: "text-sm px-2.5 py-0.5",
      container: "gap-3",
    },
  };

  const currentSize = sizeConfigs[size];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className={cn("inline-flex items-center", currentSize.container)}>
        <span className={cn("font-mono tracking-tight text-black", currentSize.text)}>
          {score}
          <span className="text-[0.75em] text-zinc-600 font-bold">/100</span>
        </span>
        {showGrade && (
          <span
            className={cn(
              "font-mono font-black border-2 border-black shadow-[2px_2px_0px_0px_#000] select-none uppercase",
              currentSize.grade,
              colors.bg,
              colors.text
            )}
          >
            {calculatedGrade}
          </span>
        )}
      </div>

      {showProgress && (
        <div className="w-full bg-white h-2.5 border-2 border-black overflow-hidden shadow-[1.5px_1.5px_0px_0px_#000]">
          <div
            className={cn("h-full border-r-2 border-black transition-all duration-300", colors.bar)}
            style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
