/**
 * AbhedyaX Demo Journey — zero-dependency state management.
 *
 * Uses React Context + localStorage for persistence. No external dependencies.
 * All exported hooks maintain the same API so existing consumers work seamlessly.
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
    description: "Establish Secure VPN Baseline",
    routes: ["/", `/analyses/${DEMO_PRIMARY_ID}`],
    pageRoute: `/analyses/${DEMO_PRIMARY_ID}`,
    nextRoute: "/analyze",
    nextLabel: "Analyze VPN",
  },
  {
    step: 2,
    label: "ANALYZE",
    description: "Analyze the IPsec VPN",
    routes: ["/analyze"],
    pageRoute: "/analyze",
    nextRoute: `/analyses/${DEMO_PRIMARY_ID}/processing`,
    nextLabel: "View Processing",
  },
  {
    step: 3,
    label: "ASSESS",
    description: "Deterministic Security Assessment",
    routes: [
      `/analyses/${DEMO_PRIMARY_ID}/processing`,
      `/analyses/${DEMO_PRIMARY_ID}`,
      `/analyses/${DEMO_PRIMARY_ID}/findings`,
    ],
    pageRoute: `/analyses/${DEMO_PRIMARY_ID}`,
    nextRoute: `/analyses/${DEMO_PRIMARY_ID}/traffic`,
    nextLabel: "View Traffic Intelligence",
  },
  {
    step: 4,
    label: "AI",
    description: "Encrypted Traffic Intelligence",
    routes: [
      `/analyses/${DEMO_PRIMARY_ID}/traffic`,
      "/ai-intelligence",
    ],
    pageRoute: `/analyses/${DEMO_PRIMARY_ID}/traffic`,
    nextRoute: `/security-twin/${DEMO_PRIMARY_ID}`,
    nextLabel: "View Security Twin",
  },
  {
    step: 5,
    label: "TWIN",
    description: "Expected vs Observed Security State",
    routes: [`/security-twin/${DEMO_PRIMARY_ID}`, "/security-twin"],
    pageRoute: `/security-twin/${DEMO_PRIMARY_ID}`,
    nextRoute: `/compare?baseline=${DEMO_PRIMARY_ID}&current=${DEMO_SECONDARY_ID}`,
    nextLabel: "Compare vs Legacy Config",
  },
  {
    step: 6,
    label: "DRIFT",
    description: "Detect Configuration Drift (100 → 25, Δ−75)",
    routes: ["/compare"],
    pageRoute: `/compare?baseline=${DEMO_PRIMARY_ID}&current=${DEMO_SECONDARY_ID}`,
    nextRoute: "/metadata-exposure",
    nextLabel: "View Metadata Exposure",
  },
  {
    step: 7,
    label: "EXPOSURE",
    description: "Metadata Exposure & Posture Timeline",
    routes: ["/metadata-exposure", "/posture"],
    pageRoute: "/metadata-exposure",
    nextRoute: `/reports?analysisId=${DEMO_PRIMARY_ID}`,
    nextLabel: "View Auditable Report",
  },
  {
    step: 8,
    label: "REPORT",
    description: "Auditable Security Report & Evidence Chain",
    routes: [`/reports`],
    pageRoute: `/reports?analysisId=${DEMO_PRIMARY_ID}`,
    nextRoute: null,
    nextLabel: null,
  },
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type DemoStepNumber = (typeof DEMO_STEPS)[number]["step"];

export interface DemoJourneyState {
  isActive: boolean;
  currentStep: number;
  completedStages: number[];
  primaryAnalysisId: string;
}

export interface DemoJourneyActions {
  startDemo: (primaryAnalysisId?: string) => void;
  exitDemo: () => void;
  advanceStep: () => void;
  previousStep: () => void;
  setStep: (step: number) => void;
  resetDemo: () => void;
}

export type DemoJourneyStore = DemoJourneyState & DemoJourneyActions;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const DemoJourneyContext = createContext<DemoJourneyStore | null>(null);

function loadPersistedState(): DemoJourneyState {
  if (typeof window === "undefined") {
    return {
      isActive: false,
      currentStep: 1,
      completedStages: [],
      primaryAnalysisId: DEMO_PRIMARY_ID,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        isActive: Boolean(parsed.isActive),
        currentStep: typeof parsed.currentStep === "number" && parsed.currentStep >= 1 ? parsed.currentStep : 1,
        completedStages: Array.isArray(parsed.completedStages) ? parsed.completedStages : [],
        primaryAnalysisId: parsed.primaryAnalysisId || DEMO_PRIMARY_ID,
      };
    }
  } catch {
    // ignore
  }
  return {
    isActive: false,
    currentStep: 1,
    completedStages: [],
    primaryAnalysisId: DEMO_PRIMARY_ID,
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function DemoJourneyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoJourneyState>(() => ({
    isActive: false,
    currentStep: 1,
    completedStages: [],
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
    const nextState: DemoJourneyState = {
      isActive: true,
      currentStep: 1,
      completedStages: [],
      primaryAnalysisId,
    };
    setState(nextState);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch {
        // ignore
      }
    }
  }, []);

  const exitDemo = useCallback(() => {
    const nextState: DemoJourneyState = {
      isActive: false,
      currentStep: 1,
      completedStages: [],
      primaryAnalysisId: DEMO_PRIMARY_ID,
    };
    setState(nextState);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch {
        // ignore
      }
    }
  }, []);

  const advanceStep = useCallback(() => {
    setState((s) => {
      const nextStep = Math.min(s.currentStep + 1, DEMO_STEPS.length);
      const nextCompleted = Array.from(
        new Set([...(s.completedStages || []), s.currentStep])
      );
      const nextState: DemoJourneyState = {
        ...s,
        currentStep: nextStep,
        completedStages: nextCompleted,
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch {
          // ignore
        }
      }
      return nextState;
    });
  }, []);

  const previousStep = useCallback(() => {
    setState((s) => {
      const prevStep = Math.max(s.currentStep - 1, 1);
      const nextState: DemoJourneyState = {
        ...s,
        currentStep: prevStep,
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch {
          // ignore
        }
      }
      return nextState;
    });
  }, []);

  const setStep = useCallback((step: number) => {
    setState((s) => {
      const nextState: DemoJourneyState = {
        ...s,
        currentStep: step,
      };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch {
          // ignore
        }
      }
      return nextState;
    });
  }, []);

  const resetDemo = useCallback(() => {
    startDemo(DEMO_PRIMARY_ID);
  }, [startDemo]);

  const value: DemoJourneyStore = {
    ...state,
    startDemo,
    exitDemo,
    advanceStep,
    previousStep,
    setStep,
    resetDemo,
  };

  return (
    <DemoJourneyContext.Provider value={value}>
      {children}
    </DemoJourneyContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
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
