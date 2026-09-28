import React from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b-2 border-black bg-[#FAF8F5]">
        <div>
          <h2 className="text-sm sm:text-base font-black tracking-tight text-black">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs font-mono text-zinc-600">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center bg-white">
        {children}
      </div>
    </div>
  );
};
