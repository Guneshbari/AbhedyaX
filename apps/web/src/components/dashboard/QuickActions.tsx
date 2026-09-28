import React from "react";
import Link from "next/link";
import {
  UploadCloud,
  PlayCircle,
  Network,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { QuickActionItem } from "@/types/dashboard";

interface QuickActionsProps {
  actions: QuickActionItem[];
}

const ACTION_ICONS: Record<string, LucideIcon> = {
  UploadCloud,
  PlayCircle,
  Network,
};

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-[#F4F7FA]">
          Quick Actions
        </h2>
        <span className="text-xs text-[#687384]">Direct Operational Shortcuts</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((act) => {
          const Icon = ACTION_ICONS[act.iconName] || UploadCloud;

          return (
            <Link
              key={act.id}
              href={act.href}
              className="group p-5 rounded-xl border border-[#252B35] bg-[#0F1218] hover:border-blue-500/40 hover:bg-[#141820] transition-all duration-150 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-[#141820] border border-[#252B35] text-blue-400 group-hover:border-blue-500/40 group-hover:text-blue-300 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  {act.badge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {act.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-[#F4F7FA] group-hover:text-blue-300 transition-colors">
                  {act.title}
                </h3>
                <p className="mt-1 text-xs text-[#9AA4B2] leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#252B35]/60 flex items-center justify-between text-xs font-medium text-blue-400">
                <span>{act.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
