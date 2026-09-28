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
    if (name.includes("Timing")) return <Clock className="w-4 h-4 text-black" />;
    if (name.includes("Size")) return <Maximize2 className="w-4 h-4 text-black" />;
    if (name.includes("Directionality")) return <ArrowUpDown className="w-4 h-4 text-black" />;
    if (name.includes("Burst")) return <Zap className="w-4 h-4 text-black" />;
    return <Timer className="w-4 h-4 text-black" />;
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
      <div className="p-4 sm:p-5 bg-[#C084FC]/20 border-2 sm:border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#C084FC] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-black flex items-center gap-2 flex-wrap">
              <span>AbhedyaX USP-04: Zero-Payload Metadata Observability</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 border-2 border-black bg-white text-black font-black shadow-[2px_2px_0px_0px_#000]">
                Privacy & Telemetry USP
              </span>
            </div>
            <p className="text-xs text-zinc-800 mt-0.5 leading-relaxed font-bold">
              Demonstrates flow pattern observability while strictly preserving payload confidentiality and never decrypting ESP traffic.
            </p>
          </div>
        </div>
        <Link
          href="/ai-intelligence"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-black bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all shrink-0"
        >
          <span>View ML Pipeline</span>
          <ExternalLink className="w-3.5 h-3.5 text-black" />
        </Link>
      </div>

      {/* Session Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b-2 border-black pb-3">
        {CANONICAL_RECENT_ANALYSES.map((item) => {
          const isSelected = item.id === selectedAnalysisId;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectAnalysis(item.id)}
              className={`px-3 py-2 text-xs font-mono transition-all flex items-center gap-2 border-2 border-black shrink-0 ${
                isSelected
                  ? "bg-[#FFE600] text-black font-black shadow-[3px_3px_0px_0px_#000]"
                  : "bg-white text-black font-bold shadow-[2px_2px_0px_0px_#000] hover:bg-[#FAF8F5]"
              }`}
            >
              <span>{item.id}</span>
              <span className="text-[10px] text-zinc-600 font-bold">({item.vpnProtocol})</span>
              {item.id === "AX-2026-00424" && (
                <span className="text-[9px] px-1.5 py-0.5 border border-black bg-[#FF4B4B] text-black font-black shadow-[1px_1px_0px_0px_#000]">
                  Anomaly Case
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-12 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          <div className="w-6 h-6 rounded-full border-2 border-black border-t-[#FFE600] animate-spin mx-auto mb-3" />
          Evaluating metadata observability for {selectedAnalysisId}...
        </div>
      ) : !metadata ? (
        <div className="p-12 text-center text-black font-mono text-sm border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000]">
          Metadata analysis unavailable.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Indicator Card */}
          <div className="p-5 sm:p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
                  Session Observability Index
                </h2>
                <span
                  className={`text-xs uppercase font-mono px-2.5 py-1 border-2 border-black font-black shadow-[2px_2px_0px_0px_#000] ${
                    metadata.indicator === "High"
                      ? "bg-[#FF4B4B] text-black"
                      : metadata.indicator === "Moderate"
                      ? "bg-[#FBBF24] text-black"
                      : "bg-[#4ADE80] text-black"
                  }`}
                >
                  {metadata.indicator} Observability
                </span>
              </div>
              <p className="text-xs text-zinc-700 mt-2 max-w-2xl font-sans leading-relaxed font-medium">
                {metadata.explanation}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-zinc-700">
                <span>Session: <strong className="text-black font-black">{metadata.analysis_id}</strong></span>
                <span className="text-black">•</span>
                <span>Provenance: <strong className="text-black font-black">{metadata.provenance}</strong></span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex flex-col items-center justify-center min-w-[140px] shrink-0 self-end md:self-center">
              <span className="text-[10px] font-mono uppercase text-zinc-700 font-bold">Observability</span>
              <span className="text-3xl font-black font-mono text-black mt-1">
                {metadata.score !== null ? `${metadata.score}` : "N/A"}
              </span>
              <span className="text-[10px] text-zinc-700 font-mono font-bold mt-0.5">out of 100</span>
            </div>
          </div>

          {/* 5 Observable Dimensions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metadata.dimensions.map((dim, idx) => (
              <div
                key={idx}
                className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDimensionIcon(dim.name)}
                      <h3 className="text-xs font-black text-black">{dim.name}</h3>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 border-2 border-black font-black shadow-[2px_2px_0px_0px_#000] ${
                        dim.indicator === "High"
                          ? "bg-[#FF4B4B] text-black"
                          : dim.indicator === "Moderate"
                          ? "bg-[#FBBF24] text-black"
                          : "bg-[#4ADE80] text-black"
                      }`}
                    >
                      {dim.indicator}
                    </span>
                  </div>

                  <div className="mt-3 text-2xl font-black font-mono text-black">
                    {dim.value}
                    <span className="text-xs text-zinc-600 font-bold"> / 100</span>
                  </div>

                  <p className="text-xs text-zinc-700 mt-2 font-sans leading-relaxed font-medium">
                    {dim.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-black/20">
                  <span className="text-[10px] uppercase font-mono text-zinc-700 block mb-1.5 font-bold">
                    Signal Features
                  </span>
                  <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                    {dim.key_features.map((f, fi) => (
                      <span key={fi} className="px-1.5 py-0.5 border border-black bg-[#FAF8F5] text-black font-bold shadow-[1px_1px_0px_0px_#000]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Zero-Payload Classification Summary Card */}
            {metadata.traffic_classification && (
              <div className="p-5 bg-[#FFE600] border-2 sm:border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-black">
                    <BrainCircuit className="w-4 h-4 text-black" />
                    <h3 className="text-xs font-black text-black">Inferred Application Class</h3>
                  </div>

                  <div className="mt-3">
                    <span className="text-2xl font-black font-mono text-black">
                      {metadata.traffic_classification.predicted_class}
                    </span>
                    <div className="text-xs font-mono font-bold text-black mt-1">
                      Confidence: {(metadata.traffic_classification.confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <p className="text-xs text-zinc-800 mt-2 font-sans leading-relaxed font-medium">
                    Classification mode: <span className="font-mono font-black">{metadata.traffic_classification.classification_mode}</span>.
                    Derived strictly from packet sizes and cadence clusters.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-black text-[10px] font-mono text-black font-black">
                  Payload Decryption: <strong>NEVER EXECUTED</strong>
                </div>
              </div>
            )}
          </div>

          {/* Scientific Disclaimer */}
          <div className="p-4 border-2 border-black bg-[#FAF8F5] shadow-[3px_3px_0px_0px_#000] text-xs text-zinc-800 font-mono font-bold flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-black shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-black block mb-0.5 font-black">Cryptographic Integrity Disclaimer:</strong>
              <span>{metadata.disclaimer}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
