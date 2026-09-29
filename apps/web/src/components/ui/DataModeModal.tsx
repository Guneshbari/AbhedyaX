"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, Server, Laptop, RefreshCw, Zap, ShieldCheck } from "lucide-react";
import { useDataProvider, DataMode } from "@/lib/providers";

interface DataModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataModeModal: React.FC<DataModeModalProps> = ({ isOpen, onClose }) => {
  const { mode, effectiveMode, isApiAvailable, statusMessage, setMode, recheckConnectivity } =
    useDataProvider();
  const [checking, setChecking] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleRecheck = async () => {
    setChecking(true);
    await recheckConnectivity();
    setChecking(false);
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b-2 border-black shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <Zap className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 id="modal-title" className="text-sm sm:text-base font-black text-black uppercase tracking-tight font-mono">
                Runtime Data Mode
              </h2>
              <p className="text-[11px] text-zinc-600 font-mono font-bold">
                AbhedyaX Dual-Mode Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-black bg-white hover:bg-[#FF4B4B] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Current Status Pill */}
          <div className="p-3 bg-[#FAF8F5] border-2 border-black flex items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full border border-black shrink-0 ${
                  effectiveMode === "api" ? "bg-[#4ADE80] animate-pulse" : "bg-[#FBBF24]"
                }`}
              />
              <span className="font-bold text-black truncate">
                Active:{" "}
                <strong className="font-black uppercase">
                  {effectiveMode === "api" ? "Live FastAPI Service" : "Deterministic Demo"}
                </strong>
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 border border-black bg-[#FFE600] text-black font-black uppercase shrink-0">
              Mode: {mode}
            </span>
          </div>

          {/* Mode Selection Options */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-black uppercase text-black font-mono block">
              Select Data Mode:
            </span>

            {/* Option 1: Demo Mode */}
            <div
              onClick={() => setMode("demo")}
              className={`p-3 border-2 border-black cursor-pointer transition-all ${
                mode === "demo"
                  ? "bg-[#FFE600] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-[#FAF8F5] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-black shrink-0" />
                  <span className="text-xs font-black text-black uppercase font-mono">
                    Demo Mode
                  </span>
                </div>
                {mode === "demo" && <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />}
              </div>
              <p className="text-[11px] text-zinc-800 leading-relaxed font-medium">
                Deterministic preloaded canonical datasets. 100% resilient against server cold starts, sleeps, or network timeouts. Zero latency.
              </p>
            </div>

            {/* Option 2: Auto Mode */}
            <div
              onClick={() => setMode("auto")}
              className={`p-3 border-2 border-black cursor-pointer transition-all ${
                mode === "auto"
                  ? "bg-[#FFE600] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-[#FAF8F5] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-black shrink-0" />
                  <span className="text-xs font-black text-black uppercase font-mono">
                    Auto-Detect Mode
                  </span>
                </div>
                {mode === "auto" && <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />}
              </div>
              <p className="text-[11px] text-zinc-800 leading-relaxed font-medium">
                Starts instantly with demo data for zero loading wait, while probing backend in background. Connects live if server is awake.
              </p>
            </div>

            {/* Option 3: Live API Mode */}
            <div
              onClick={() => setMode("api")}
              className={`p-3 border-2 border-black cursor-pointer transition-all ${
                mode === "api"
                  ? "bg-[#FFE600] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]"
                  : "bg-[#FAF8F5] hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-black shrink-0" />
                  <span className="text-xs font-black text-black uppercase font-mono">
                    Live API Mode
                  </span>
                </div>
                {mode === "api" && <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />}
              </div>
              <p className="text-[11px] text-zinc-800 leading-relaxed font-medium">
                Routes all queries to the FastAPI service. Requires active backend.
              </p>
            </div>
          </div>

          {/* Backend Diagnostics Strip */}
          <div className="p-3 bg-[#FAF8F5] border-2 border-black space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between gap-2">
              <span className="text-zinc-700 font-bold truncate">FastAPI: {apiUrl}</span>
              <span
                className={`font-black uppercase px-2 py-0.5 border border-black shrink-0 text-[10px] ${
                  isApiAvailable ? "bg-[#4ADE80] text-black" : "bg-[#FF4B4B] text-white"
                }`}
              >
                {isApiAvailable ? "Online (200 OK)" : "Offline / Sleeping"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-600">{statusMessage}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t-2 border-black flex items-center justify-between gap-3 shrink-0">
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
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
