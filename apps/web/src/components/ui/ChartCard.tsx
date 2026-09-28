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
        "rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between p-5 border-b border-[#252B35]">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[#F4F7FA]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[#9AA4B2]">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-center">{children}</div>
    </div>
  );
};
