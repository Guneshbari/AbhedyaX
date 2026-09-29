"use client";

import React from "react";
import { X, CheckCircle2, Server, Laptop, RefreshCw, Zap, ShieldAlert } from "lucide-react";
import { useDataProvider, DataMode } from "@/lib/providers";

interface DataModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataModeModal: React.FC<DataModeModalProps> = ({ isOpen, onClose }) => {
  const { mode, effectiveMode, isApiAvailable, statusMessage, setMode, recheckConnectivity } =
    useDataProvider();
  const [checking, setChecking] = React.useState(false);

  if (!isOpen) return null;

  const handleRecheck = async () => {
    setChecking(true);
    await recheckConnectivity();
    setChecking(false);
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white border-2 sm:border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base font-black text-black uppercase tracking-tight">
                Data Provider & Architecture Mode
              </h2>
              <p className="text-xs text-zinc-600 font-mono font-bold">
                AbhedyaX Zero-Dependency Dual-Mode Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-black bg-white hover:bg-[#FF4B4B] hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Current Status Pill */}
        <div className="p-3 bg-[#FAF8F5] border-2 border-black flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full border border-black ${
                effectiveMode === "api" ? "bg-[#4ADE80] animate-pulse" : "bg-[#FBBF24]"
              }`}
            />
            <span className="font-bold text-black">
              Active Source:{" "}
              <strong className="font-black uppercase">
                {effectiveMode === "api" ? "Live FastAPI Service" : "Deterministic Demo Provider"}
              </strong>
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 border border-black bg-[#FFE600] font-black uppercase">
            Mode: {mode}
          </span>
        </div>

        {/* Mode Selection Options */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase text-black font-mono block">
            Select Runtime Data Mode:
          </label>

          {/* Option 1: Demo Mode */}
          <div
            onClick={() => setMode("demo")}
            className={`p-3.5 border-2 border-black cursor-pointer transition-all ${
              mode === "demo"
                ? "bg-[#FFE600] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                : "bg-white hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-black shrink-0" />
                <span className="text-xs font-black text-black">
                  Demo Mode (Recommended for Evaluator Testing)
                </span>
              </div>
              {mode === "demo" && <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />}
            </div>
            <p className="text-[11px] text-zinc-700 mt-1 pl-6 leading-relaxed">
              Consumes preloaded canonical datasets. 100% resilient against server cold-starts, sleeps, or network timeouts. Zero external dependencies.
            </p>
          </div>

          {/* Option 2: Auto Mode */}
          <div
            onClick={() => setMode("auto")}
            className={`p-3.5 border-2 border-black cursor-pointer transition-all ${
              mode === "auto"
                ? "bg-[#FFE600] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                : "bg-white hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-black shrink-0" />
                <span className="text-xs font-black text-black">
                  Auto-Detect Mode (Seamless Fallback)
                </span>
              </div>
              {mode === "auto" && <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />}
            </div>
            <p className="text-[11px] text-zinc-700 mt-1 pl-6 leading-relaxed">
              Initializes immediately with demo data for zero initial latency, while checking for a live backend in the background. Upgrades to live API when available.
            </p>
          </div>

          {/* Option 3: Live API Mode */}
          <div
            onClick={() => setMode("api")}
            className={`p-3.5 border-2 border-black cursor-pointer transition-all ${
              mode === "api"
                ? "bg-[#FFE600] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                : "bg-white hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-black shrink-0" />
                <span className="text-xs font-black text-black">
                  Live API Mode (FastAPI Backend)
                </span>
              </div>
              {mode === "api" && <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />}
            </div>
            <p className="text-[11px] text-zinc-700 mt-1 pl-6 leading-relaxed">
              Directly routes all inspection and USP telemetry queries to the FastAPI service at <code className="bg-zinc-200 px-1 font-mono text-[10px]">{apiUrl}</code>.
            </p>
          </div>
        </div>

        {/* Backend Diagnostics Bar */}
        <div className="p-3 bg-[#FAF8F5] border-2 border-black space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-600 font-bold">FastAPI Backend ({apiUrl}):</span>
            <span
              className={`font-black uppercase px-2 py-0.5 border border-black ${
                isApiAvailable ? "bg-[#4ADE80] text-black" : "bg-[#FF4B4B] text-white"
              }`}
            >
              {isApiAvailable ? "Reachable (200 OK)" : "Offline / Sleeping"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 font-mono">{statusMessage}</p>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleRecheck}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-black bg-white hover:bg-[#FAF8F5] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Probing..." : "Test Connection"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-black bg-[#FFE600] hover:bg-[#FCD34D] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
