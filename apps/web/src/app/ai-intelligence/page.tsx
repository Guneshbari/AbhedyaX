"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BrainCircuit,
  Activity,
  AlertCircle,
  Sliders,
  Database,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { getActiveMLModel } from "@/lib/api/analyses";
import { DEMO_ML_MODEL_STATUS } from "@/demo";

export default function AiIntelligencePage() {
  const { data: mlStatus = DEMO_ML_MODEL_STATUS } = useQuery({
    queryKey: ["active-ml-model"],
    queryFn: getActiveMLModel,
    initialData: DEMO_ML_MODEL_STATUS,
    refetchInterval: 30000,
  });

  const metrics = mlStatus?.metrics;
  const classes = mlStatus?.classes || ["Email", "ICMP", "Messaging", "Video", "VoIP", "Web"];
  const perClass = metrics?.per_class_metrics || {};
  const featureImp = metrics?.feature_importance || {};
  const cm = metrics?.confusion_matrix || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <PageHeader
        title="AI Encrypted Traffic Intelligence"
        subtitle="Supervised machine learning models trained to classify encrypted IPsec traffic flows using time-series, burst, and packet length metadata without payload decryption."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "AI Intelligence" },
        ]}
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-black text-xs font-mono font-black bg-[#4ADE80] text-black shadow-[2px_2px_0px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            {mlStatus?.status === "ready" ? "Active ML Engine (RandomForest v1.0.0)" : "Evaluating"}
          </span>
        }
      />

      {/* 2. Mandatory Disclaimer Alert */}
      <div className="p-4 border-2 border-black bg-[#FFE600] shadow-[4px_4px_0px_0px_#000] text-black text-xs flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-black" />
        <div>
          <span className="font-black block text-black text-sm">Research & Validation Disclaimer</span>
          <p className="mt-0.5 text-zinc-800 leading-relaxed font-bold">
            Model metrics describe evaluation on the available labelled dataset (Phase 3 strongSwan testbed captures) and should not be interpreted as universal real-world accuracy across arbitrary public internet traffic. Classification is bounded by observable IPsec metadata.
          </p>
        </div>
      </div>

      {/* 3. Model Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Test Macro F1"
          value={metrics?.test_macro_f1 ? `${(metrics.test_macro_f1 * 100).toFixed(1)}%` : "61.1%"}
          trend={metrics?.validation_macro_f1 ? `${(metrics.validation_macro_f1 * 100).toFixed(1)}% val F1` : "77.8% val"}
          trendDirection="up"
          trendLabel="stratified split"
          icon={BrainCircuit}
        />
        <MetricCard
          label="Test Balanced Acc"
          value={metrics?.test_balanced_accuracy ? `${(metrics.test_balanced_accuracy * 100).toFixed(1)}%` : "66.7%"}
          helperText="Equal weight per traffic class"
          icon={Activity}
        />
        <MetricCard
          label="Active Features"
          value={mlStatus?.feature_count ? String(mlStatus.feature_count) : "28"}
          helperText="Temporal, size, burst & distribution"
          icon={Sliders}
        />
        <MetricCard
          label="Training Samples"
          value="30 Captures"
          helperText="5 VPN configs × 6 traffic classes"
          icon={Database}
        />
      </div>

      {/* 4. Active Model & Deployment Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
          <span className="text-[10px] text-zinc-700 uppercase font-mono font-black block">
            Active Inference Model
          </span>
          <div className="space-y-1">
            <h3 className="text-base font-black text-black">
              {mlStatus?.model_name || "traffic_classifier"}
            </h3>
            <p className="text-xs text-black font-mono font-bold">
              Version: {mlStatus?.model_version || "v1.0.0"} • {mlStatus?.algorithm || "RandomForest"}
            </p>
          </div>
          <div className="text-xs text-zinc-700 space-y-1 font-mono pt-2 border-t-2 border-black font-bold">
            <div className="flex justify-between">
              <span>Dataset Version:</span>
              <span className="text-black font-black">{mlStatus?.dataset_version || "v1.0.0"}</span>
            </div>
            <div className="flex justify-between">
              <span>Abstention Threshold:</span>
              <span className="text-emerald-700 font-black">{mlStatus?.abstention_threshold || 0.55} (55%)</span>
            </div>
            <div className="flex justify-between">
              <span>Zero-Payload Proof:</span>
              <span className="text-black font-black">Enforced (No ESP decrypt)</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-3 lg:col-span-2">
          <span className="text-[10px] text-zinc-700 uppercase font-mono font-black block">
            Supported Encrypted Traffic Classes
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            {[
              { name: "ICMP", desc: "Diagnostic keep-alive / ping", icon: "⚡" },
              { name: "Web", desc: "Bursty request-response HTTPS", icon: "🌐" },
              { name: "Email", desc: "Medium bursty SMTP/IMAP", icon: "✉️" },
              { name: "VoIP", desc: "Consistent small bidirectional UDP", icon: "📞" },
              { name: "Video", desc: "High-throughput sustained stream", icon: "🎥" },
              { name: "Messaging", desc: "Sporadic asynchronous text", icon: "💬" },
            ].map((cls) => (
              <div
                key={cls.name}
                className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-3"
              >
                <span className="text-xl">{cls.icon}</span>
                <div>
                  <div className="text-xs font-black text-black">{cls.name}</div>
                  <div className="text-[10px] text-zinc-700 font-medium truncate">{cls.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Per-Class Performance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Class Metrics */}
        <div className="p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
          <div>
            <h3 className="text-sm font-black text-black">
              Per-Class Classification Metrics (Held-Out Test Set)
            </h3>
            <p className="text-xs text-zinc-700 font-medium">
              Precision, recall, and F1 scores measured on unseen captures
            </p>
          </div>

          <div className="border-2 border-black shadow-[3px_3px_0px_0px_#000] overflow-x-auto">
            <div className="min-w-[440px]">
              <div className="grid grid-cols-5 bg-[#FFE600] px-3 py-2 text-[10px] font-mono uppercase text-black font-black border-b-2 border-black">
                <span className="col-span-2">Traffic Class</span>
                <span className="text-right">Precision</span>
                <span className="text-right">Recall</span>
                <span className="text-right">F1 Score</span>
              </div>
              <div className="divide-y-2 divide-black text-xs font-mono">
                {classes.map((cls) => {
                  const row = perClass[cls] || { precision: 0.0, recall: 0.0, f1_score: 0.0 };
                  return (
                    <div
                      key={cls}
                      className="grid grid-cols-5 px-3 py-2.5 items-center hover:bg-[#FFF9D2]/40 transition-colors"
                    >
                      <span className="col-span-2 text-black font-black">{cls}</span>
                      <span className="text-right text-zinc-800 font-bold">{row.precision.toFixed(2)}</span>
                      <span className="text-right text-zinc-800 font-bold">{row.recall.toFixed(2)}</span>
                      <span className="text-right text-emerald-700 font-black">{row.f1_score.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div className="p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
          <div>
            <h3 className="text-sm font-black text-black">
              Test Set Confusion Matrix
            </h3>
            <p className="text-xs text-zinc-700 font-medium">
              Rows represent ground truth classes, columns represent model predictions
            </p>
          </div>

          {cm.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[440px] text-xs font-mono border-collapse border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <thead>
                  <tr className="border-b-2 border-black text-[10px] text-black font-black uppercase bg-[#FFE600]">
                    <th className="py-2 px-2 text-left">Actual \ Pred</th>
                    {classes.map((c) => (
                      <th key={c} className="py-2 text-center px-1">
                        {c.slice(0, 4)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {classes.map((rowCls, rowIdx) => (
                    <tr key={rowCls} className="hover:bg-[#FFF9D2]/40">
                      <td className="py-2 px-2 text-black font-black text-[11px] border-r-2 border-black">{rowCls}</td>
                      {classes.map((colCls, colIdx) => {
                        const val = cm[rowIdx]?.[colIdx] ?? 0;
                        const isDiag = rowIdx === colIdx;
                        return (
                          <td
                            key={colCls}
                            className={`py-2 text-center font-black ${
                              isDiag
                                ? val > 0
                                  ? "text-black bg-[#4ADE80]"
                                  : "text-zinc-400"
                                : val > 0
                                ? "text-black bg-[#FBBF24]"
                                : "text-zinc-400"
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-700 text-xs font-mono font-bold">
              Confusion matrix being computed...
            </div>
          )}
        </div>
      </div>

      {/* 6. Feature Importance Ranking */}
      <div className="p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
        <div>
          <h3 className="text-sm font-black text-black">
            Top Feature Importance Weights
          </h3>
          <p className="text-xs text-zinc-700 font-medium">
            Relative feature contributions to decision splits across the Random Forest ensemble
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(featureImp)
            .slice(0, 10)
            .map(([feat, imp], idx) => {
              const pct = Math.min(100, Math.round((imp / 0.1) * 100));
              return (
                <div key={feat} className="p-3 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-black font-black truncate">
                      {idx + 1}. {feat}
                    </span>
                    <span className="text-black font-black">{(imp * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white border border-black overflow-hidden shadow-[1px_1px_0px_0px_#000]">
                    <div
                      className="h-full bg-[#FFE600] border-r border-black"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
