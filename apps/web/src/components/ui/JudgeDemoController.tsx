/**
 * JudgeDemoController — Persistent guided-workflow card mounted at the top of the
 * main content area during demo mode. Inspired by the JOCKY NEXUS reference design
 * pattern, retaining AbhedyaX Neo-Brutalism visual language.
 *
 * Structure:
 *   [Header row]  AbhedyaX logo · JUDGE DEMO // GUIDED WORKFLOW · STAGE X/8 · Analysis ID · [_][✕]
 *   [Stage nav]   01 BASELINE · 02 ANALYZE · 03 ASSESS · 04 AI · 05 TWIN · 06 DRIFT · 07 EXPOSURE · 08 REPORT
 *   [Content row] STAGE badge · Title · Description  ·  [PRIMARY ACTION] [NEXT STEP →]
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronRight,
  Minus,
  Check,
  Lock,
  ChevronDown,
} from "lucide-react";
import { AbhedyaLogo } from "@/components/ui/AbhedyaLogo";
import { useDemoJourney, DEMO_PRIMARY_ID, DEMO_SECONDARY_ID } from "@/store/demoJourney";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Stage definitions (presentation layer only — orchestrates real product pages)
// ---------------------------------------------------------------------------
export interface DemoStageConfig {
  num: number;
  label: string;
  title: string;
  description: string;
  judgeMessage: string;
  pageRoute: string;
  primaryLabel: string;
  primaryRoute: string;
  nextRoute: string | null;
}

const STAGES: readonly DemoStageConfig[] = [
  {
    num: 1,
    label: "BASELINE",
    title: "Establish Secure VPN Baseline",
    description:
      "Begin with AX-2026-00428 — a secure enterprise IPsec configuration. Score: 100 · Grade A · Risk: Low.",
    judgeMessage:
      "We begin with a known secure VPN. AbhedyaX establishes the expected baseline security posture.",
    pageRoute: "/",
    primaryLabel: "Open Baseline Analysis",
    primaryRoute: `/analyses/${DEMO_PRIMARY_ID}`,
    nextRoute: "/analyze",
  },
  {
    num: 2,
    label: "ANALYZE",
    title: "Analyze the IPsec VPN",
    description:
      "Inspect captured or simulated VPN traffic. AbhedyaX extracts IKE version, SA parameters, cipher suites, and DH group.",
    judgeMessage:
      "AbhedyaX converts encrypted VPN traffic into structured protocol and cryptographic evidence.",
    pageRoute: "/analyze",
    primaryLabel: "View Processing Pipeline",
    primaryRoute: `/analyses/${DEMO_PRIMARY_ID}/processing`,
    nextRoute: `/analyses/${DEMO_PRIMARY_ID}`,
  },
  {
    num: 3,
    label: "ASSESS",
    title: "Security Assessment",
    description:
      "Deterministic Security Engine converts observed protocol facts into traceable findings, risk deductions, and a score.",
    judgeMessage:
      "Security severity is calculated from explicit evidence and deterministic rules — not from the ML classifier.",
    pageRoute: `/analyses/${DEMO_PRIMARY_ID}`,
    primaryLabel: "View Findings Details",
    primaryRoute: `/analyses/${DEMO_PRIMARY_ID}/findings`,
    nextRoute: `/analyses/${DEMO_PRIMARY_ID}/traffic`,
  },
  {
    num: 4,
    label: "AI",
    title: "Encrypted Traffic Intelligence",
    description:
      "AI infers likely traffic classes (VoIP, Video, Web…) from observable flow metadata — without decrypting ESP payload.",
    judgeMessage:
      "The ML model classifies encrypted traffic from observable metadata without decrypting payload content.",
    pageRoute: `/analyses/${DEMO_PRIMARY_ID}/traffic`,
    primaryLabel: "AI Model Telemetry",
    primaryRoute: "/ai-intelligence",
    nextRoute: `/security-twin/${DEMO_PRIMARY_ID}`,
  },
  {
    num: 5,
    label: "TWIN",
    title: "Expected vs Observed Security State",
    description:
      "Security Twin reconstructs the VPN security state, comparing intended policy against actual traffic properties.",
    judgeMessage:
      "AbhedyaX does not only analyze packets; it reconstructs the security state of the VPN.",
    pageRoute: `/security-twin/${DEMO_PRIMARY_ID}`,
    primaryLabel: "Security Twin Overview",
    primaryRoute: "/security-twin",
    nextRoute: `/compare?baseline=${DEMO_PRIMARY_ID}&current=${DEMO_SECONDARY_ID}`,
  },
  {
    num: 6,
    label: "DRIFT",
    title: "Detect Configuration Drift",
    description:
      "Compare secure baseline with legacy config: 100 → 25, Δ−75. IKEv1, AES-128-CBC, DH2, no replay protection.",
    judgeMessage:
      "A configuration change becomes measurable security impact: 100 → 25, a 75-point reduction.",
    pageRoute: `/compare?baseline=${DEMO_PRIMARY_ID}&current=${DEMO_SECONDARY_ID}`,
    primaryLabel: "Compare Baseline",
    primaryRoute: `/compare?baseline=${DEMO_PRIMARY_ID}&current=${DEMO_SECONDARY_ID}`,
    nextRoute: "/metadata-exposure",
  },
  {
    num: 7,
    label: "EXPOSURE",
    title: "Metadata Exposure & Posture",
    description:
      "Analyze observable metadata (timing, burst patterns, cadence) without payload compromise, and review historical posture.",
    judgeMessage:
      "Encryption protects payload content, but observable metadata can still reveal traffic characteristics.",
    pageRoute: "/metadata-exposure",
    primaryLabel: "View Posture Timeline",
    primaryRoute: "/posture",
    nextRoute: `/reports?analysisId=${DEMO_PRIMARY_ID}`,
  },
  {
    num: 8,
    label: "REPORT",
    title: "Auditable Security Report",
    description:
      "Full evidence chain: wire observation → protocol fact → finding → rule → deduction → remediation. Executive & Technical.",
    judgeMessage:
      "Every important conclusion can be traced back to evidence and the rule that produced it.",
    pageRoute: `/reports?analysisId=${DEMO_PRIMARY_ID}`,
    primaryLabel: "View Reports",
    primaryRoute: `/reports?analysisId=${DEMO_PRIMARY_ID}`,
    nextRoute: null,
  },
] as const;

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------
function getStageStatus(
  stageNum: number,
  currentStep: number,
  completedStages: number[] = []
): "completed" | "active" | "future" {
  if (stageNum === currentStep) return "active";
  if (completedStages.includes(stageNum) || stageNum < currentStep) return "completed";
  return "future";
}

// ---------------------------------------------------------------------------
// JudgeDemoController
// ---------------------------------------------------------------------------
export function JudgeDemoController() {
  const { isActive, currentStep, completedStages, setStep, advanceStep, exitDemo } =
    useDemoJourney();
  const [minimized, setMinimized] = useState(false);
  const router = useRouter();

  if (!isActive) return null;

  const displayStep = currentStep >= 1 && currentStep <= STAGES.length ? currentStep : 1;
  const stage = STAGES[displayStep - 1] ?? STAGES[0];
  const maxReached = Math.max(displayStep, ...(completedStages || [1]));

  // -----------------------------------------------------------------------
  // MINIMIZED strip
  // -----------------------------------------------------------------------
  if (minimized) {
    return (
      <div className="mb-4 border-2 border-black shadow-[3px_3px_0px_0px_#000] bg-black print:hidden">
        <div className="flex items-center gap-3 px-3 py-2">
          <AbhedyaLogo size={16} />
          <span className="font-mono font-black text-[10px] text-[#FFE600] uppercase tracking-[0.18em]">
            JUDGE DEMO
          </span>
          <span className="font-mono text-[10px] text-[#687384] uppercase">
            STAGE {displayStep} / {STAGES.length}
          </span>
          <span className="font-mono text-[9px] text-[#687384] hidden sm:inline">
            — {stage.label}: {stage.title}
          </span>

          {/* Mini stage dots */}
          <div className="flex items-center gap-0.5 ml-1">
            {STAGES.map((s) => {
              const status = getStageStatus(s.num, displayStep, completedStages);
              const isAccessible = s.num <= maxReached || completedStages.includes(s.num);
              return (
                <button
                  key={s.num}
                  type="button"
                  disabled={!isAccessible}
                  onClick={() => {
                    if (isAccessible) {
                      setStep(s.num);
                      router.push(s.pageRoute);
                    }
                  }}
                  title={`${s.label}: ${s.title}`}
                  className={cn(
                    "w-2.5 h-2.5 border transition-all",
                    status === "completed" && "bg-[#22C55E] border-[#22C55E]",
                    status === "active" && "bg-[#FFE600] border-[#FFE600] ring-1 ring-white",
                    status === "future" && "bg-transparent border-[#3A4454] opacity-50 cursor-not-allowed"
                  )}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {stage.nextRoute && (
              <button
                type="button"
                onClick={() => {
                  advanceStep();
                  router.push(stage.nextRoute!);
                }}
                className="flex items-center gap-1 px-2 py-1 bg-[#FFE600] border border-black text-black font-mono font-black text-[10px] uppercase hover:bg-yellow-300 transition-colors"
              >
                NEXT <ChevronRight className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setMinimized(false)}
              className="p-1 text-[#687384] hover:text-[#FFE600] transition-colors"
              title="Expand controller"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={exitDemo}
              className="p-1 text-[#687384] hover:text-[#EF4444] transition-colors"
              title="Exit demo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // FULL CARD (reference pattern)
  // -----------------------------------------------------------------------
  return (
    <div className="mb-6 border-2 border-black shadow-[4px_4px_0px_0px_#000] overflow-hidden print:hidden">
      {/* ── Row 1: Header ── */}
      <div className="bg-black px-4 py-2.5 flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {/* Left cluster */}
        <div className="flex items-center gap-2.5 min-w-0">
          <AbhedyaLogo size={18} />
          <span className="font-mono font-black text-[11px] text-[#FFE600] uppercase tracking-[0.15em] whitespace-nowrap">
            JUDGE DEMO
          </span>
          <span className="font-mono text-[9px] text-[#687384] hidden sm:inline">
            //
          </span>
          <span className="font-mono text-[9px] text-[#9AA4B2] uppercase tracking-widest hidden sm:inline whitespace-nowrap">
            GUIDED WORKFLOW
          </span>
        </div>

        {/* Stage badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono font-black text-[11px] bg-[#FFE600] text-black px-2 py-0.5 border border-[#FFE600]">
            STAGE {String(displayStep).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
          </span>
        </div>

        {/* Analysis ID badge */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="font-mono text-[10px] text-[#22C55E] border border-[#22C55E] px-1.5 py-0.5">
            Active: {DEMO_PRIMARY_ID}
          </span>
        </div>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setMinimized(true)}
            className="p-1 border border-[#252B35] text-[#687384] hover:text-[#9AA4B2] hover:border-[#9AA4B2] transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={exitDemo}
            className="p-1 border border-[#252B35] text-[#687384] hover:text-[#EF4444] hover:border-[#EF4444] transition-colors"
            title="Exit demo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Row 2: Stage navigation ── */}
      <div className="bg-[#0F1218] border-t border-b border-black overflow-x-auto">
        <div className="flex min-w-max">
          {STAGES.map((s) => {
            const status = getStageStatus(s.num, displayStep, completedStages);
            const isActive = status === "active";
            const isCompleted = status === "completed";
            const isAccessible = s.num <= maxReached || completedStages.includes(s.num);

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (isAccessible) {
                    setStep(s.num);
                    router.push(s.pageRoute);
                  }
                }}
                disabled={!isAccessible}
                title={!isAccessible ? `Complete stage ${displayStep} first` : s.title}
                className={cn(
                  "flex-1 min-w-[80px] flex flex-col items-center justify-center py-3 px-2 gap-1 font-mono text-[10px] font-black uppercase tracking-wider transition-all border-r border-black last:border-r-0 select-none",
                  isActive && "bg-[#FFE600] text-black",
                  isCompleted && "bg-[#1A2A1A] text-[#22C55E] hover:bg-[#233823] cursor-pointer",
                  !isAccessible && "bg-[#0F1218] text-[#3A4454] cursor-not-allowed opacity-60"
                )}
              >
                <span
                  className={cn(
                    "text-[9px] font-black flex items-center justify-center",
                    isActive && "text-black",
                    isCompleted && "text-[#22C55E]",
                    !isAccessible && "text-[#3A4454]"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 stroke-[3]" />
                  ) : !isAccessible ? (
                    <Lock className="w-2.5 h-2.5" />
                  ) : (
                    String(s.num).padStart(2, "0")
                  )}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Row 3: Stage content + actions ── */}
      <div className="bg-[#FAF8F5] border-t border-black px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Left: stage info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono font-black text-[10px] bg-black text-[#FFE600] px-2 py-0.5 shrink-0">
              STAGE {String(displayStep).padStart(2, "0")}
            </span>
            <span className="font-mono font-black text-sm text-black uppercase tracking-wide">
              {stage.title}
            </span>
          </div>
          <p className="font-mono text-xs text-zinc-700 leading-relaxed max-w-2xl">
            {stage.description}
          </p>
          <p className="font-mono text-[10px] text-zinc-500 italic hidden md:block">
            ↳ {stage.judgeMessage}
          </p>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Primary action */}
          <button
            type="button"
            onClick={() => {
              router.push(stage.primaryRoute);
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] font-mono font-black text-[11px] text-black uppercase tracking-wide hover:bg-[#FAF8F5] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all whitespace-nowrap"
          >
            {stage.primaryLabel}
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </button>

          {/* NEXT STEP */}
          {stage.nextRoute ? (
            <button
              type="button"
              onClick={() => {
                advanceStep();
                router.push(stage.nextRoute!);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-black text-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] font-mono font-black text-[11px] uppercase tracking-wide hover:bg-zinc-900 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all whitespace-nowrap"
            >
              NEXT STEP
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#22C55E] border-2 border-black font-mono font-black text-[11px] text-black uppercase tracking-wide">
              <Check className="w-3.5 h-3.5 shrink-0" />
              DEMO COMPLETE
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
