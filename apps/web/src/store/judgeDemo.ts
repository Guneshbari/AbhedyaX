/**
 * AbhedyaX Judge Demo — Zustand State Store.
 *
 * Central state for the guided 8-stage judge demo session.
 * All transitions are deterministic and frontend-only.
 */
"use client";

import { create } from "zustand";
import {
  DemoStageKey,
  StageStatus,
  DemoStageOutputs,
  ValidationResult,
  ExecutionLogEntry,
  STAGE_DEFINITIONS,
  STAGE_EXECUTION_STEPS,
  STAGE_VALIDATIONS,
  SCENARIO_TO_ANALYSIS,
  buildDemoStageOutputs,
} from "@/demo/judgeEngine";

const STAGE_KEYS: DemoStageKey[] = STAGE_DEFINITIONS.map((s) => s.key);

// -------------------------------------------------------------------------
// State Shape
// -------------------------------------------------------------------------

interface DemoState {
  /** Is the demo overlay open? */
  isOpen: boolean;
  /** Currently selected scenario */
  scenarioId: string;
  /** Derived analysis ID for the selected scenario */
  analysisId: string;
  /** Which stage is currently active */
  currentStage: DemoStageKey;
  /** Per-stage status */
  stageStatuses: Record<DemoStageKey, StageStatus>;
  /** Per-stage execution logs */
  stageLogs: Record<DemoStageKey, ExecutionLogEntry[]>;
  /** Per-stage validation results */
  stageValidations: Record<DemoStageKey, ValidationResult[]>;
  /** All stage outputs (filled as stages complete) */
  stageOutputs: DemoStageOutputs;
  /** Drift comparison baseline (for stage 7) */
  driftBaselineId: string;
  /** True when all 8 stages are completed */
  demoComplete: boolean;
  /** Page the user was on when demo opened (to restore on exit) */
  previousPath: string;
}

interface DemoActions {
  open: (previousPath?: string) => void;
  close: () => void;
  reset: () => void;
  selectScenario: (scenarioId: string) => void;
  setDriftBaseline: (analysisId: string) => void;
  goToStage: (key: DemoStageKey) => void;
  runStage: (key: DemoStageKey) => Promise<void>;
}

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

function initialStatuses(): Record<DemoStageKey, StageStatus> {
  const s: Partial<Record<DemoStageKey, StageStatus>> = {};
  STAGE_KEYS.forEach((k, i) => {
    s[k] = i === 0 ? "ready" : "locked";
  });
  return s as Record<DemoStageKey, StageStatus>;
}

function emptyLogs(): Record<DemoStageKey, ExecutionLogEntry[]> {
  return STAGE_KEYS.reduce<Record<DemoStageKey, ExecutionLogEntry[]>>(
    (acc, k) => { acc[k] = []; return acc; },
    {} as Record<DemoStageKey, ExecutionLogEntry[]>
  );
}

function emptyValidations(): Record<DemoStageKey, ValidationResult[]> {
  return STAGE_KEYS.reduce<Record<DemoStageKey, ValidationResult[]>>(
    (acc, k) => { acc[k] = []; return acc; },
    {} as Record<DemoStageKey, ValidationResult[]>
  );
}

const DEFAULT_SCENARIO = "secure-enterprise";
const DEFAULT_ANALYSIS = SCENARIO_TO_ANALYSIS[DEFAULT_SCENARIO];
const DEFAULT_DRIFT_BASELINE = "AX-2026-00428";

function initialState(): DemoState {
  return {
    isOpen: false,
    scenarioId: DEFAULT_SCENARIO,
    analysisId: DEFAULT_ANALYSIS,
    currentStage: "input",
    stageStatuses: initialStatuses(),
    stageLogs: emptyLogs(),
    stageValidations: emptyValidations(),
    stageOutputs: {},
    driftBaselineId: DEFAULT_DRIFT_BASELINE,
    demoComplete: false,
    previousPath: "/",
  };
}

// -------------------------------------------------------------------------
// Store
// -------------------------------------------------------------------------

export const useJudgeDemoStore = create<DemoState & DemoActions>((set, get) => ({
  ...initialState(),

  open(previousPath = "/") {
    set((s) => {
      if (s.demoComplete) {
        // Full reset on re-open after completion
        return { ...initialState(), isOpen: true, previousPath };
      }
      return { ...s, isOpen: true, previousPath };
    });
  },

  close() {
    set({ isOpen: false });
  },

  reset() {
    set({ ...initialState(), isOpen: true });
  },

  selectScenario(scenarioId: string) {
    const analysisId =
      SCENARIO_TO_ANALYSIS[scenarioId] ?? SCENARIO_TO_ANALYSIS[DEFAULT_SCENARIO];
    // Changing scenario resets progress from stage 1
    set({
      scenarioId,
      analysisId,
      currentStage: "input",
      stageStatuses: initialStatuses(),
      stageLogs: emptyLogs(),
      stageValidations: emptyValidations(),
      stageOutputs: {},
      demoComplete: false,
    });
  },

  setDriftBaseline(analysisId: string) {
    set({ driftBaselineId: analysisId });
  },

  goToStage(key: DemoStageKey) {
    const { stageStatuses } = get();
    const status = stageStatuses[key];
    if (status === "locked") return; // Cannot jump to locked stage
    set({ currentStage: key });
  },

  async runStage(key: DemoStageKey) {
    const { stageStatuses, analysisId, driftBaselineId } = get();
    const status = stageStatuses[key];
    if (status === "running" || status === "locked") return;

    const steps = STAGE_EXECUTION_STEPS[key];
    const validationLabels = STAGE_VALIDATIONS[key];

    // Mark running, clear previous logs
    set((s) => ({
      currentStage: key,
      stageStatuses: { ...s.stageStatuses, [key]: "running" },
      stageLogs: { ...s.stageLogs, [key]: [] },
      stageValidations: { ...s.stageValidations, [key]: [] },
    }));

    // Animate execution steps
    for (let i = 0; i < steps.length; i++) {
      const entry: ExecutionLogEntry = {
        id: `${key}-${i}`,
        text: steps[i],
        done: false,
        type: steps[i].includes("✓") ? "success" : steps[i].includes("NOT PERFORMED") ? "warn" : "info",
      };

      // Add pending entry
      set((s) => ({
        stageLogs: {
          ...s.stageLogs,
          [key]: [...(s.stageLogs[key] ?? []), entry],
        },
      }));

      // Simulate processing delay
      await delay(200 + Math.random() * 150);

      // Mark entry done
      set((s) => ({
        stageLogs: {
          ...s.stageLogs,
          [key]: (s.stageLogs[key] ?? []).map((e) =>
            e.id === entry.id ? { ...e, done: true } : e
          ),
        },
      }));
    }

    // Validating phase
    set((s) => ({
      stageStatuses: { ...s.stageStatuses, [key]: "validating" },
    }));

    await delay(250);

    // Build outputs for this stage
    const outputs = buildDemoStageOutputs(analysisId, driftBaselineId);

    // Build validation results
    const validations: ValidationResult[] = validationLabels.map((label) => ({
      label,
      passed: true, // All canonical data is always valid
    }));

    // Determine next stage
    const currentIdx = STAGE_KEYS.indexOf(key);
    const nextKey = currentIdx < STAGE_KEYS.length - 1 ? STAGE_KEYS[currentIdx + 1] : null;

    const isDemoComplete = key === "metadata-posture-report";

    set((s) => {
      const newStatuses = { ...s.stageStatuses, [key]: "completed" as StageStatus };
      if (nextKey) {
        newStatuses[nextKey] = "ready";
      }
      return {
        stageStatuses: newStatuses,
        stageValidations: { ...s.stageValidations, [key]: validations },
        stageOutputs: { ...s.stageOutputs, ...outputs },
        currentStage: nextKey ?? key,
        demoComplete: isDemoComplete,
      };
    });
  },
}));

// -------------------------------------------------------------------------
// Utility
// -------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
