"use client";

/**
 * DemoJourneyBanner — Slim fixed-bottom progress bar shown during guided demo.
 *
 * Rendered inside existing pages (not a new shell). Shows current step,
 * total steps, step label, and an EXIT DEMO action. Uses Neo-Brutalism tokens.
 * Invisible when demo is not active.
 */

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ChevronRight } from "lucide-react";
import { useDemoJourney, DEMO_STEPS, getDemoStepForPath } from "@/store/demoJourney";
import { cn } from "@/lib/utils";

export function DemoJourneyBanner() {
  const { isActive, currentStep, exitDemo } = useDemoJourney();
  const pathname = usePathname();
  const router = useRouter();

  if (!isActive) return null;

  const step = getDemoStepForPath(pathname ?? "");
  const displayStep = step ? step.step : currentStep;
  const displayLabel = step?.label ?? DEMO_STEPS[currentStep - 1]?.label ?? "Demo";
  const displayDesc = step?.description ?? "";

  const pct = Math.round((displayStep / DEMO_STEPS.length) * 100);

  const nextStep = step?.nextRoute ?? null;
  const nextLabel = step?.nextLabel ?? null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 print:hidden">
      {/* Progress fill bar */}
      <div className="h-1 bg-black w-full">
        <div
          className="h-full bg-[#FFE600] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Banner body */}
      <div className="bg-black border-t-2 border-[#FFE600] flex items-center gap-3 px-4 py-2 flex-wrap sm:flex-nowrap">
        {/* Step counter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[10px] text-[#687384] uppercase tracking-widest">
            JUDGE DEMO
          </span>
          <span className="font-mono font-black text-[#FFE600] text-xs">
            {displayStep} / {DEMO_STEPS.length}
          </span>
        </div>

        {/* Step dots */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          {DEMO_STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => {
                if (s.routes[0]) router.push(s.routes[0]);
              }}
              title={s.label}
              className={cn(
                "w-2 h-2 border border-[#252B35] transition-all",
                s.step < displayStep
                  ? "bg-[#22C55E] border-[#22C55E]"
                  : s.step === displayStep
                  ? "bg-[#FFE600] border-[#FFE600]"
                  : "bg-transparent"
              )}
            />
          ))}
        </div>

        {/* Current step label + description */}
        <div className="flex-1 min-w-0">
          <span className="font-mono font-black text-xs text-[#F4F7FA] uppercase tracking-wide">
            {displayLabel}
          </span>
          {displayDesc && (
            <span className="font-mono text-[10px] text-[#687384] ml-2 hidden md:inline">
              — {displayDesc}
            </span>
          )}
        </div>

        {/* Next step CTA */}
        {nextStep && nextLabel && (
          <button
            onClick={() => router.push(nextStep)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE600] border-2 border-[#FFE600] text-black font-mono font-black text-[10px] uppercase tracking-wider hover:bg-yellow-300 transition-colors shrink-0 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
          >
            {nextLabel}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
        {!nextStep && displayStep === DEMO_STEPS.length && (
          <span className="font-mono text-[10px] text-[#22C55E] font-bold uppercase tracking-wider shrink-0">
            ✓ DEMO COMPLETE
          </span>
        )}

        {/* Exit */}
        <button
          onClick={exitDemo}
          title="Exit demo journey"
          className="flex items-center gap-1 px-2 py-1.5 border border-[#252B35] text-[#687384] hover:text-[#EF4444] hover:border-[#EF4444] font-mono text-[10px] uppercase tracking-wider transition-colors shrink-0"
        >
          <X className="w-3 h-3" />
          <span className="hidden sm:inline">EXIT</span>
        </button>
      </div>
    </div>
  );
}
