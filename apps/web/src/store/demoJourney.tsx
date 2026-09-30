/**
 * AbhedyaX Demo Journey — zero-dependency state management.
 *
 * Uses React Context + localStorage for persistence. No Zustand required.
 * All exported hooks maintain the same API as the previous Zustand store so
 * existing consumers (JudgeDemoController, SimulationModeBadge) work unchanged.
 */
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const DEMO_PRIMARY_ID = "AX-2026-00428";   // secure-enterprise (baseline)
export const DEMO_SECONDARY_ID = "AX-2026-00427"; // legacy-critical (for drift)

const STORAGE_KEY = "abhedyax_demo_journey";

/** The 8-step demo journey mapped to real existing AbhedyaX routes */
export const DEMO_STEPS = [
  {
    step: 1,
    label: "BASELINE",
    description: "Security posture overview and recent analyses",
    routes: ["/"],
    nextRoute: "/analyze",
    nextLabel: "Analyze VPN",
  },
  {
    step: 2,
    label: "ANALYZE",
    description: "Select scenario and submit for analysis",
    routes: ["/analyze"],
    nextRoute: `/analyses/${DEMO_PRIMARY_ID}/processing`,
    nextLabel: "View Processing",
  },
  {
    step: 3,
    label: "ASSESS",
    description: "TShark dissection, protocol extraction, AI classification",
    routes: [
      `/analyses/${DEMO_PRIMARY_ID}/processing`,
      `/analyses/${DEMO_PRIMARY_ID}`,
      `/analyses/${DEMO_PRIMARY_ID}/findings`,
    ],
    nextRoute: `/analyses/${DEMO_PRIMARY_ID}/traffic`,
    nextLabel: "View Traffic Analysis",
  },
  {
    step: 4,
    label: "AI",
    description: "Encrypted traffic classification from observable metadata",
    routes: [
      `/analyses/${DEMO_PRIMARY_ID}/traffic`,
      "/ai-intelligence",
    ],
    nextRoute: `/security-twin/${DEMO_PRIMARY_ID}`,
    nextLabel: "View Security Twin",
  },
  {
    step: 5,
    label: "TWIN",
    description: "Expected vs observed security state, alignment, evidence",
    routes: [`/security-twin/${DEMO_PRIMARY_ID}`, "/security-twin"],
    nextRoute: `/compare?baseline=${DEMO_PRIMARY_ID}&current=${DEMO_SECONDARY_ID}`,
    nextLabel: "Compare vs Legacy Config",
  },
  {
    step: 6,
    label: "DRIFT",
    description: "Secure Enterprise → Legacy Critical: score 100→25, Δ−75",
    routes: ["/compare"],
    nextRoute: "/metadata-exposure",
    nextLabel: "View Metadata Exposure",
  },
  {
    step: 7,
    label: "EXPOSURE",
    description: "Encrypted traffic metadata and historical posture",
    routes: ["/metadata-exposure", "/posture"],
    nextRoute: `/reports?analysisId=${DEMO_PRIMARY_ID}`,
    nextLabel: "View Auditable Report",
  },
  {
    step: 8,
    label: "REPORT",
    description: "Evidence chain, executive report, technical report",
    routes: [`/reports`],
    nextRoute: null,
    nextLabel: null,
  },
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type DemoStepNumber = (typeof DEMO_STEPS)[number]["step"];

interface DemoJourneyState {
  isActive: boolean;
  currentStep: number;
  primaryAnalysisId: string;
}

interface DemoJourneyActions {
  startDemo: (primaryAnalysisId?: string) => void;
  exitDemo: () => void;
  advanceStep: () => void;
  setStep: (step: number) => void;
}

type DemoJourneyStore = DemoJourneyState & DemoJourneyActions;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const DemoJourneyContext = createContext<DemoJourneyStore | null>(null);

function loadPersistedState(): DemoJourneyState {
  if (typeof window === "undefined") {
    return { isActive: false, currentStep: 0, primaryAnalysisId: DEMO_PRIMARY_ID };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { isActive: false, currentStep: 0, primaryAnalysisId: DEMO_PRIMARY_ID };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function DemoJourneyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoJourneyState>(() => ({
    isActive: false,
    currentStep: 0,
    primaryAnalysisId: DEMO_PRIMARY_ID,
  }));

  // Hydrate from localStorage after mount
  useEffect(() => {
    setState(loadPersistedState());
  }, []);

  // Persist on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // ignore
      }
    }
  }, [state]);

  const startDemo = useCallback((primaryAnalysisId = DEMO_PRIMARY_ID) => {
    setState({ isActive: true, currentStep: 1, primaryAnalysisId });
  }, []);

  const exitDemo = useCallback(() => {
    setState((s) => ({ ...s, isActive: false, currentStep: 0 }));
  }, []);

  const advanceStep = useCallback(() => {
    setState((s) => ({
      ...s,
      currentStep: Math.min(s.currentStep + 1, DEMO_STEPS.length),
    }));
  }, []);

  const setStep = useCallback((step: number) => {
    setState((s) => ({ ...s, currentStep: step }));
  }, []);

  const value: DemoJourneyStore = {
    ...state,
    startDemo,
    exitDemo,
    advanceStep,
    setStep,
  };

  return (
    <DemoJourneyContext.Provider value={value}>
      {children}
    </DemoJourneyContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook — drop-in replacement for the Zustand hook
// ---------------------------------------------------------------------------
export function useDemoJourney(): DemoJourneyStore {
  const ctx = useContext(DemoJourneyContext);
  if (!ctx) {
    throw new Error("useDemoJourney must be used inside DemoJourneyProvider");
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Utility: match current pathname to a demo step
// ---------------------------------------------------------------------------
export function getDemoStepForPath(pathname: string) {
  return (
    DEMO_STEPS.find((s) =>
      s.routes.some((r) => pathname === r || pathname.startsWith(r + "?") || pathname.startsWith(r + "/"))
    ) ?? null
  );
}
