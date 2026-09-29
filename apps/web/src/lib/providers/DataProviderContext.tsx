"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { DataMode, EffectiveMode, DataProvider, DataProviderContextValue } from "./types";
import { DemoDataProvider } from "./demoProvider";
import { ApiDataProvider } from "./apiProvider";

// Singletons for efficiency
const demoProviderSingleton = new DemoDataProvider();
const apiProviderSingleton = new ApiDataProvider();

// Module-level current provider reference for direct non-React function calls
let currentActiveProvider: DataProvider = demoProviderSingleton;
let currentEffectiveMode: EffectiveMode = "demo";
let currentConfiguredMode: DataMode = "demo";

export function getActiveDataProvider(): DataProvider {
  return currentActiveProvider;
}

export function getEffectiveDataMode(): EffectiveMode {
  return currentEffectiveMode;
}

export function getConfiguredDataMode(): DataMode {
  return currentConfiguredMode;
}

function resolveInitialMode(): DataMode {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("abhedyax_data_mode");
      if (saved === "demo" || saved === "api" || saved === "auto") {
        return saved as DataMode;
      }
    } catch {
      // localStorage may be unavailable in some security contexts
    }
  }
  const envMode = process.env.NEXT_PUBLIC_DATA_MODE;
  if (envMode === "api" || envMode === "auto" || envMode === "demo") {
    return envMode as DataMode;
  }
  return "demo";
}

// Initialize module-level values
const initialMode = resolveInitialMode();
currentConfiguredMode = initialMode;
if (initialMode === "api") {
  currentActiveProvider = apiProviderSingleton;
  currentEffectiveMode = "api";
} else {
  currentActiveProvider = demoProviderSingleton;
  currentEffectiveMode = "demo";
}

const DataProviderContext = createContext<DataProviderContextValue | undefined>(undefined);

export function DataProviderProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DataMode>(initialMode);
  const [effectiveMode, setEffectiveModeState] = useState<EffectiveMode>(
    initialMode === "api" ? "api" : "demo"
  );
  const [isApiAvailable, setIsApiAvailable] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Initializing data mode...");

  const updateActiveProvider = useCallback((newEffectiveMode: EffectiveMode) => {
    currentEffectiveMode = newEffectiveMode;
    if (newEffectiveMode === "api") {
      currentActiveProvider = apiProviderSingleton;
    } else {
      currentActiveProvider = demoProviderSingleton;
    }
  }, []);

  const checkApiHealth = useCallback(async (): Promise<boolean> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${baseUrl}/health`, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        setIsApiAvailable(true);
        return true;
      }
    } catch {
      // API unavailable or timed out
    }
    setIsApiAvailable(false);
    return false;
  }, []);

  const setMode = useCallback(
    (newMode: DataMode) => {
      setModeState(newMode);
      currentConfiguredMode = newMode;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("abhedyax_data_mode", newMode);
        } catch {
          // ignore storage error
        }
      }

      if (newMode === "demo") {
        setEffectiveModeState("demo");
        updateActiveProvider("demo");
        setStatusMessage("Demo Mode active (deterministic canonical datasets, zero network latency)");
      } else if (newMode === "api") {
        setEffectiveModeState("api");
        updateActiveProvider("api");
        setStatusMessage("API Mode active (connecting to FastAPI backend)");
        checkApiHealth().then((available) => {
          if (!available) {
            setStatusMessage("API Mode active, but backend appears offline or sleeping.");
          }
        });
      } else if (newMode === "auto") {
        // In auto mode, initialize with demo immediately for zero latency
        setEffectiveModeState("demo");
        updateActiveProvider("demo");
        setStatusMessage("Auto Mode: checking backend...");
        checkApiHealth().then((available) => {
          if (available) {
            setEffectiveModeState("api");
            updateActiveProvider("api");
            setStatusMessage("Auto Mode: API detected, connected to live backend.");
          } else {
            setEffectiveModeState("demo");
            updateActiveProvider("demo");
            setStatusMessage("Auto Mode: Backend unreachable, serving deterministic demo datasets.");
          }
        });
      }
    },
    [checkApiHealth, updateActiveProvider]
  );

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, setMode]);

  const recheckConnectivity = useCallback(async () => {
    setStatusMessage("Re-checking backend connectivity...");
    const available = await checkApiHealth();
    if (mode === "auto") {
      if (available) {
        setEffectiveModeState("api");
        updateActiveProvider("api");
        setStatusMessage("Auto Mode: API detected, connected to live backend.");
      } else {
        setEffectiveModeState("demo");
        updateActiveProvider("demo");
        setStatusMessage("Auto Mode: Backend unreachable, serving deterministic demo datasets.");
      }
    } else if (mode === "api") {
      if (available) {
        setStatusMessage("API Mode: Backend connected.");
      } else {
        setStatusMessage("API Mode: Backend unreachable or sleeping.");
      }
    }
  }, [checkApiHealth, mode, updateActiveProvider]);

  const value = useMemo<DataProviderContextValue>(
    () => ({
      provider: effectiveMode === "api" ? apiProviderSingleton : demoProviderSingleton,
      mode,
      effectiveMode,
      isApiAvailable,
      statusMessage,
      setMode,
      recheckConnectivity,
    }),
    [mode, effectiveMode, isApiAvailable, statusMessage, setMode, recheckConnectivity]
  );

  return (
    <DataProviderContext.Provider value={value}>
      {children}
    </DataProviderContext.Provider>
  );
}

export function useDataProvider(): DataProviderContextValue {
  const context = useContext(DataProviderContext);
  if (!context) {
    return {
      provider: currentActiveProvider,
      mode: currentConfiguredMode,
      effectiveMode: currentEffectiveMode,
      isApiAvailable: false,
      statusMessage: "Standalone data provider fallback",
      setMode: () => {},
      recheckConnectivity: async () => {},
    };
  }
  return context;
}
