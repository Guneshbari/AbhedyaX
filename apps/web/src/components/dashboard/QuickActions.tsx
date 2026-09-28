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
        <h2 className="text-base sm:text-lg font-black tracking-tight text-black">
          Quick Actions
        </h2>
        <span className="text-xs font-mono font-bold text-zinc-600 uppercase">
          Direct Operational Shortcuts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((act) => {
          const Icon = ACTION_ICONS[act.iconName] || UploadCloud;

          return (
            <Link
              key={act.id}
              href={act.href}
              className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black">
                    <Icon className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  {act.badge && (
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-white text-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_#000]">
                      {act.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-black group-hover:underline">
                  {act.title}
                </h3>
                <p className="mt-1 text-xs text-zinc-700 leading-relaxed font-medium">
                  {act.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between text-xs font-mono font-black text-black">
                <span>{act.actionText}</span>
                <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
