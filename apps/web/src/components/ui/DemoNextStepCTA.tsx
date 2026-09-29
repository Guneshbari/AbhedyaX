"use client";

/**
 * DemoNextStepCTA — Contextual "Continue →" card added to existing pages.
 *
 * Placed at the bottom of relevant existing pages. Only shown when the demo
 * journey is active. Uses Neo-Brutalism design system tokens.
 */

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useDemoJourney } from "@/store/demoJourney";
import { cn } from "@/lib/utils";

interface DemoNextStepCTAProps {
  /** The route to navigate to */
  nextRoute: string;
  /** Short action label, e.g. "View Security Twin" */
  nextLabel: string;
  /** Optional longer description of what the next step shows */
  context?: string;
  /** Step number this CTA appears on */
  fromStep?: number;
  /** Optional additional className for the wrapper */
  className?: string;
}

export function DemoNextStepCTA({
  nextRoute,
  nextLabel,
  context,
  fromStep,
  className,
}: DemoNextStepCTAProps) {
  const { isActive, currentStep } = useDemoJourney();
  const router = useRouter();

  // Only show when demo is active
  if (!isActive) return null;

  // If a specific step is provided, only show on that step
  if (fromStep !== undefined && currentStep !== fromStep) return null;

  return (
    <div
      className={cn(
        "mt-6 p-4 bg-[#FFE600] border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] bg-black text-[#FFE600] px-1.5 py-0.5">
            JUDGE DEMO — NEXT STEP
          </span>
        </div>
        <p className="font-mono text-sm font-black text-black uppercase tracking-wide">
          {nextLabel}
        </p>
        {context && (
          <p className="font-mono text-xs text-black/70 mt-0.5 leading-relaxed">
            {context}
          </p>
        )}
      </div>

      <button
        onClick={() => router.push(nextRoute)}
        className="flex items-center gap-2 px-4 py-2.5 bg-black text-[#FFE600] border-2 border-black font-mono font-black text-xs uppercase tracking-wider hover:bg-zinc-900 active:translate-x-[1px] active:translate-y-[1px] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] shrink-0"
      >
        {nextLabel}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Inline variant — smaller contextual link used inside cards/panels
 */
export function DemoInlineLink({
  label,
  route,
  className,
}: {
  label: string;
  route: string;
  className?: string;
}) {
  const { isActive } = useDemoJourney();
  const router = useRouter();

  if (!isActive) return null;

  return (
    <button
      onClick={() => router.push(route)}
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[11px] font-black text-black underline decoration-[#FFE600] decoration-2 underline-offset-2 hover:text-zinc-700 transition-colors",
        className
      )}
    >
      {label}
      <ChevronRight className="w-3 h-3" />
    </button>
  );
}
