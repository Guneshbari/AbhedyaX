/**
 * AbhedyaX Judge Demo Journey Store.
 *
 * Lightweight Zustand store that tracks which step of the judge demo
 * the user is currently on. Does NOT create a new UI — it only provides
 * context used by existing pages to show step hints and "Next Step" CTAs.
 *
 * Journey: Dashboard → Analyze → Processing → Result → Findings → Traffic
 *          → Security Twin → Compare → Metadata Exposure → Posture → Reports
 */
"use client";

import { create } from "zustand";

// The canonical analysis IDs used throughout the primary demo story
export const DEMO_PRIMARY_ID = "AX-2026-00428";   // secure-enterprise (baseline)
export const DEMO_SECONDARY_ID = "AX-2026-00427"; // legacy-critical (for drift)

/**
 * Each step maps to one or more existing Next.js routes.
 * The route patterns are used by DemoJourneyBanner to identify the active step.
 */
export const DEMO_STEPS = [
  {
    step: 1,
    label: "Dashboard",
    description: "Security posture overview and recent analyses",
    routes: ["/"],
    nextRoute: "/analyze",
    nextLabel: "Analyze VPN",
  },
  {
    step: 2,
    label: "Analyze VPN",
    description: "Select scenario and submit for analysis",
    routes: ["/analyze"],
    nextRoute: `/analyses/${DEMO_PRIMARY_ID}/processing`,
    nextLabel: "View Processing",
  },
  {
    step: 3,
    label: "Processing",
    description: "TShark dissection, protocol extraction, AI classification",
    routes: [`/analyses/${DEMO_PRIMARY_ID}/processing`],
    nextRoute: `/analyses/${DEMO_PRIMARY_ID}`,
    nextLabel: "View Security Assessment",
  },
  {
    step: 4,
    label: "Security Assessment",
    description: "Risk score, findings, traffic intelligence",
    routes: [
      `/analyses/${DEMO_PRIMARY_ID}`,
      `/analyses/${DEMO_PRIMARY_ID}/findings`,
      `/analyses/${DEMO_PRIMARY_ID}/traffic`,
    ],
    nextRoute: `/security-twin/${DEMO_PRIMARY_ID}`,
    nextLabel: "View Security Twin",
  },
  {
    step: 5,
    label: "Security Twin",
    description: "Expected vs observed state, alignment, evidence",
    routes: [`/security-twin/${DEMO_PRIMARY_ID}`, "/security-twin"],
    nextRoute: `/compare?baseline=${DEMO_PRIMARY_ID}&current=${DEMO_SECONDARY_ID}`,
    nextLabel: "Compare vs Legacy Config",
  },
  {
    step: 6,
    label: "Configuration Drift",
    description: "Secure Enterprise → Legacy Critical: score 100→25, Δ−75",
    routes: ["/compare"],
    nextRoute: "/metadata-exposure",
    nextLabel: "View Metadata Exposure",
  },
  {
    step: 7,
    label: "Metadata & Posture",
    description: "Encrypted traffic metadata and historical posture",
    routes: ["/metadata-exposure", "/posture"],
    nextRoute: `/analyses/${DEMO_PRIMARY_ID}/reports`,
    nextLabel: "View Auditable Report",
  },
  {
    step: 8,
    label: "Auditable Report",
    description: "Evidence chain, executive report, technical report",
    routes: [`/analyses/${DEMO_PRIMARY_ID}/reports`],
    nextRoute: null,
    nextLabel: null,
  },
] as const;

export type DemoStepNumber = (typeof DEMO_STEPS)[number]["step"];

interface DemoJourneyState {
  /** Whether the guided demo journey is active */
  isActive: boolean;
  /** Current step (1–8). 0 = not started. */
  currentStep: number;
  /** The primary canonical analysis ID being demonstrated */
  primaryAnalysisId: string;
}

interface DemoJourneyActions {
  /** Start the demo journey, optionally with a specific primary analysis */
  startDemo: (primaryAnalysisId?: string) => void;
  /** Stop / exit the demo journey */
  exitDemo: () => void;
  /** Advance to the next step manually */
  advanceStep: () => void;
  /** Set the current step explicitly (used by pages on mount) */
  setStep: (step: number) => void;
}

export const useDemoJourney = create<DemoJourneyState & DemoJourneyActions>((set, get) => ({
  isActive: false,
  currentStep: 0,
  primaryAnalysisId: DEMO_PRIMARY_ID,

  startDemo(primaryAnalysisId = DEMO_PRIMARY_ID) {
    set({ isActive: true, currentStep: 1, primaryAnalysisId });
  },

  exitDemo() {
    set({ isActive: false, currentStep: 0 });
  },

  advanceStep() {
    const { currentStep } = get();
    const next = Math.min(currentStep + 1, DEMO_STEPS.length);
    set({ currentStep: next });
  },

  setStep(step: number) {
    set({ currentStep: step });
  },
}));

/**
 * Given a pathname, return the matching demo step definition (or null).
 */
export function getDemoStepForPath(pathname: string) {
  return (
    DEMO_STEPS.find((s) =>
      s.routes.some((r) => {
        // Exact match or starts-with for dynamic routes
        return pathname === r || pathname.startsWith(r);
      })
    ) ?? null
  );
}
