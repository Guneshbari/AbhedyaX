"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAnalysisMetadataExposure } from "@/lib/api/securityTwin";
import { MetadataExposureResult } from "@/types/securityTwin";
import { CANONICAL_RECENT_ANALYSES } from "@/data/dashboardData";
import {
  Eye,
  Clock,
  Maximize2,
  ArrowUpDown,
  Zap,
  Timer,
  ShieldAlert,
  ExternalLink,
  BrainCircuit,
} from "lucide-react";

export default function MetadataExposurePage() {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>("AX-2026-00424"); // Default to anomaly scenario to showcase contrast
  const [metadata, setMetadata] = useState<MetadataExposureResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getAnalysisMetadataExposure(selectedAnalysisId)
      .then((data) => {
        if (isMounted) {
          setMetadata(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load metadata exposure:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedAnalysisId]);

  const handleSelectAnalysis = (id: string) => {
    setLoading(true);
    setSelectedAnalysisId(id);
  };

  const getDimensionIcon = (name: string) => {
    if (name.includes("Timing")) return <Clock className="w-4 h-4 text-cyan-400" />;
    if (name.includes("Size")) return <Maximize2 className="w-4 h-4 text-indigo-400" />;
    if (name.includes("Directionality")) return <ArrowUpDown className="w-4 h-4 text-purple-400" />;
    if (name.includes("Burst")) return <Zap className="w-4 h-4 text-amber-400" />;
    return <Timer className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Encrypted Traffic Metadata Exposure"
          subtitle="Evaluate behavioral and application visibility inferable from timing, packet sizes, directionality, and burst cadence without decrypting ESP payloads."
        />

        {/* USP Banner */}
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <span>AbhedyaX USP-04: Zero-Payload Metadata Observability</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  Privacy & Telemetry USP
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Demonstrates flow pattern observability while strictly preserving payload confidentiality and never decrypting ESP traffic.
              </p>
            </div>
          </div>
          <Link
            href="/ai-intelligence"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors shrink-0"
          >
            <span>View ML Pipeline</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Session Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
          {CANONICAL_RECENT_ANALYSES.map((item) => {
            const isSelected = item.id === selectedAnalysisId;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectAnalysis(item.id)}
                className={`px-3 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2 border ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500/50 text-white font-medium shadow-sm"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                }`}
              >
                <span>{item.id}</span>
                <span className="text-[10px] text-neutral-400">({item.vpnProtocol})</span>
                {item.id === "AX-2026-00424" && (
                  <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-sans">
                    Anomaly Case
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-sm">
            Evaluating metadata observability for {selectedAnalysisId}...
          </div>
        ) : !metadata ? (
          <div className="p-12 text-center text-neutral-400 font-mono text-sm">
            Metadata analysis unavailable.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Indicator Card */}
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white tracking-tight">
                    Session Observability Index
                  </h2>
                  <span
                    className={`text-xs uppercase font-mono px-2.5 py-0.5 rounded-full font-medium ${
                      metadata.indicator === "High"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : metadata.indicator === "Moderate"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {metadata.indicator} Observability
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-2 max-w-2xl font-sans">
                  {metadata.explanation}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs font-mono text-neutral-400">
                  <span>Session: <strong className="text-neutral-200">{metadata.analysis_id}</strong></span>
                  <span>•</span>
                  <span>Provenance: <strong className="text-neutral-200">{metadata.provenance}</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col items-center justify-center min-w-[140px]">
                <span className="text-[10px] font-mono uppercase text-neutral-500">Observability</span>
                <span className="text-3xl font-bold font-mono text-white mt-0.5">
                  {metadata.score !== null ? `${metadata.score}` : "N/A"}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">out of 100</span>
              </div>
            </div>

            {/* 5 Observable Dimensions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metadata.dimensions.map((dim, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDimensionIcon(dim.name)}
                        <h3 className="text-xs font-semibold text-white">{dim.name}</h3>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          dim.indicator === "High"
                            ? "bg-amber-500/10 text-amber-400"
                            : dim.indicator === "Moderate"
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {dim.indicator}
                      </span>
                    </div>

                    <div className="mt-3 text-2xl font-bold font-mono text-neutral-200">
                      {dim.value}
                      <span className="text-xs text-neutral-500 font-normal"> / 100</span>
                    </div>

                    <p className="text-xs text-neutral-400 mt-2 font-sans">
                      {dim.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800/60">
                    <span className="text-[10px] uppercase font-mono text-neutral-500 block mb-1">
                      Signal Features
                    </span>
                    <div className="flex flex-wrap gap-1 font-mono text-[10px] text-neutral-400">
                      {dim.key_features.map((f, fi) => (
                        <span key={fi} className="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Zero-Payload Classification Summary Card */}
              {metadata.traffic_classification && (
                <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400">
                      <BrainCircuit className="w-4 h-4" />
                      <h3 className="text-xs font-semibold text-white">Inferred Application Class</h3>
                    </div>

                    <div className="mt-3">
                      <span className="text-2xl font-bold font-mono text-white">
                        {metadata.traffic_classification.predicted_class}
                      </span>
                      <div className="text-xs font-mono text-indigo-300 mt-0.5">
                        Confidence: {(metadata.traffic_classification.confidence * 100).toFixed(1)}%
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 mt-2 font-sans">
                      Classification mode: <span className="font-mono text-indigo-300">{metadata.traffic_classification.classification_mode}</span>.
                      Derived strictly from packet sizes and cadence clusters.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-indigo-900/40 text-[10px] font-mono text-indigo-300">
                    Payload Decryption: <strong>NEVER EXECUTED</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Scientific Disclaimer */}
            <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-950 text-xs text-neutral-400 font-mono flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-200 block mb-0.5">Cryptographic Integrity Disclaimer:</strong>
                <span>{metadata.disclaimer}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
