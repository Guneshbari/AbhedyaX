"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
    <div className="space-y-6">
      <PageHeader
        title="Encrypted Traffic Metadata Exposure"
        subtitle="Evaluate behavioral and application visibility inferable from timing, packet sizes, directionality, and burst cadence without decrypting ESP payloads."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Metadata Exposure" },
        ]}
      />

      {/* USP Banner */}
      <div className="p-4 sm:p-5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-[#0F1218] to-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-semibold text-[#F4F7FA] flex items-center gap-2 flex-wrap">
              <span>AbhedyaX USP-04: Zero-Payload Metadata Observability</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                Privacy & Telemetry USP
              </span>
            </div>
            <p className="text-xs text-[#9AA4B2] mt-0.5 leading-relaxed">
              Demonstrates flow pattern observability while strictly preserving payload confidentiality and never decrypting ESP traffic.
            </p>
          </div>
        </div>
        <Link
          href="/ai-intelligence"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#141820] hover:bg-[#1C222C] text-[#F4F7FA] border border-[#252B35] transition-colors shrink-0"
        >
          <span>View ML Pipeline</span>
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
        </Link>
      </div>

      {/* Session Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#252B35] pb-3">
        {CANONICAL_RECENT_ANALYSES.map((item) => {
          const isSelected = item.id === selectedAnalysisId;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectAnalysis(item.id)}
              className={`px-3 py-2 text-xs font-mono rounded-lg transition-all flex items-center gap-2 border shrink-0 ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500/50 text-[#F4F7FA] font-medium shadow-sm"
                  : "bg-[#0F1218] border-[#252B35] text-[#9AA4B2] hover:text-[#F4F7FA] hover:border-[#3B4252]"
              }`}
            >
              <span>{item.id}</span>
              <span className="text-[10px] text-[#687384]">({item.vpnProtocol})</span>
              {item.id === "AX-2026-00424" && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-sans font-medium">
                  Anomaly Case
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-12 text-center text-[#9AA4B2] font-mono text-sm rounded-xl border border-[#252B35] bg-[#0F1218]">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-3" />
          Evaluating metadata observability for {selectedAnalysisId}...
        </div>
      ) : !metadata ? (
        <div className="p-12 text-center text-[#9AA4B2] font-mono text-sm rounded-xl border border-[#252B35] bg-[#0F1218]">
          Metadata analysis unavailable.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Indicator Card */}
          <div className="p-5 sm:p-6 rounded-xl border border-[#252B35] bg-[#0F1218] backdrop-blur-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg sm:text-xl font-semibold text-[#F4F7FA] tracking-tight">
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
              <p className="text-xs text-[#9AA4B2] mt-2 max-w-2xl font-sans leading-relaxed">
                {metadata.explanation}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-[#9AA4B2]">
                <span>Session: <strong className="text-[#F4F7FA]">{metadata.analysis_id}</strong></span>
                <span className="text-[#3B4252]">•</span>
                <span>Provenance: <strong className="text-[#F4F7FA]">{metadata.provenance}</strong></span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#252B35] bg-[#141820] flex flex-col items-center justify-center min-w-[140px] shrink-0 self-end md:self-center">
              <span className="text-[10px] font-mono uppercase text-[#687384] font-semibold">Observability</span>
              <span className="text-3xl font-bold font-mono text-[#F4F7FA] mt-1">
                {metadata.score !== null ? `${metadata.score}` : "N/A"}
              </span>
              <span className="text-[10px] text-[#9AA4B2] font-mono mt-0.5">out of 100</span>
            </div>
          </div>

          {/* 5 Observable Dimensions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metadata.dimensions.map((dim, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDimensionIcon(dim.name)}
                      <h3 className="text-xs font-semibold text-[#F4F7FA]">{dim.name}</h3>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        dim.indicator === "High"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                          : dim.indicator === "Moderate"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/25"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      }`}
                    >
                      {dim.indicator}
                    </span>
                  </div>

                  <div className="mt-3 text-2xl font-bold font-mono text-[#F4F7FA]">
                    {dim.value}
                    <span className="text-xs text-[#687384] font-normal"> / 100</span>
                  </div>

                  <p className="text-xs text-[#9AA4B2] mt-2 font-sans leading-relaxed">
                    {dim.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#252B35]/60">
                  <span className="text-[10px] uppercase font-mono text-[#687384] block mb-1.5 font-semibold">
                    Signal Features
                  </span>
                  <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                    {dim.key_features.map((f, fi) => (
                      <span key={fi} className="px-1.5 py-0.5 rounded bg-[#141820] text-[#9AA4B2] border border-[#252B35]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Zero-Payload Classification Summary Card */}
            {metadata.traffic_classification && (
              <div className="p-5 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-[#0F1218] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400">
                    <BrainCircuit className="w-4 h-4" />
                    <h3 className="text-xs font-semibold text-[#F4F7FA]">Inferred Application Class</h3>
                  </div>

                  <div className="mt-3">
                    <span className="text-2xl font-bold font-mono text-[#F4F7FA]">
                      {metadata.traffic_classification.predicted_class}
                    </span>
                    <div className="text-xs font-mono text-indigo-300 mt-1">
                      Confidence: {(metadata.traffic_classification.confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <p className="text-xs text-[#9AA4B2] mt-2 font-sans leading-relaxed">
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
          <div className="p-4 rounded-xl border border-[#252B35] bg-[#090B10] text-xs text-[#9AA4B2] font-mono flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-[#F4F7FA] block mb-0.5">Cryptographic Integrity Disclaimer:</strong>
              <span>{metadata.disclaimer}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
