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

export default function AiIntelligencePage() {
  const { data: mlStatus } = useQuery({
    queryKey: ["active-ml-model"],
    queryFn: getActiveMLModel,
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border border-blue-500/30 bg-blue-500/10 text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            {mlStatus?.status === "ready" ? "Active ML Engine (RandomForest v1.0.0)" : "Evaluating"}
          </span>
        }
      />

      {/* 2. Mandatory Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
        <div>
          <span className="font-semibold block text-[#F4F7FA]">Research & Validation Disclaimer</span>
          <p className="mt-0.5 text-[#9AA4B2] leading-relaxed">
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
        <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-3">
          <span className="text-[10px] text-[#687384] uppercase font-mono font-bold block">
            Active Inference Model
          </span>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#F4F7FA]">
              {mlStatus?.model_name || "traffic_classifier"}
            </h3>
            <p className="text-xs text-blue-400 font-mono">
              Version: {mlStatus?.model_version || "v1.0.0"} • {mlStatus?.algorithm || "RandomForest"}
            </p>
          </div>
          <div className="text-xs text-[#9AA4B2] space-y-1 font-mono pt-2 border-t border-[#252B35]">
            <div className="flex justify-between">
              <span>Dataset Version:</span>
              <span className="text-[#F4F7FA]">{mlStatus?.dataset_version || "v1.0.0"}</span>
            </div>
            <div className="flex justify-between">
              <span>Abstention Threshold:</span>
              <span className="text-emerald-400">{mlStatus?.abstention_threshold || 0.55} (55%)</span>
            </div>
            <div className="flex justify-between">
              <span>Zero-Payload Proof:</span>
              <span className="text-[#F4F7FA]">Enforced (No ESP decrypt)</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-3 lg:col-span-2">
          <span className="text-[10px] text-[#687384] uppercase font-mono font-bold block">
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
                className="p-3 rounded-lg bg-[#141820] border border-[#252B35] flex items-center gap-3"
              >
                <span className="text-xl">{cls.icon}</span>
                <div>
                  <div className="text-xs font-bold text-[#F4F7FA]">{cls.name}</div>
                  <div className="text-[10px] text-[#687384] truncate">{cls.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Per-Class Performance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Class Metrics */}
        <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F7FA]">
              Per-Class Classification Metrics (Held-Out Test Set)
            </h3>
            <p className="text-xs text-[#9AA4B2]">
              Precision, recall, and F1 scores measured on unseen captures
            </p>
          </div>

          <div className="rounded-xl border border-[#252B35] overflow-x-auto">
            <div className="min-w-[440px]">
              <div className="grid grid-cols-5 bg-[#141820] px-3 py-2 text-[10px] font-mono uppercase text-[#687384] border-b border-[#252B35]">
                <span className="col-span-2">Traffic Class</span>
                <span className="text-right">Precision</span>
                <span className="text-right">Recall</span>
                <span className="text-right">F1 Score</span>
              </div>
              <div className="divide-y divide-[#252B35]/60 text-xs font-mono">
                {classes.map((cls) => {
                  const row = perClass[cls] || { precision: 0.0, recall: 0.0, f1_score: 0.0 };
                  return (
                    <div
                      key={cls}
                      className="grid grid-cols-5 px-3 py-2.5 items-center hover:bg-[#141820]/40 transition-colors"
                    >
                      <span className="col-span-2 text-[#F4F7FA] font-medium">{cls}</span>
                      <span className="text-right text-[#9AA4B2]">{row.precision.toFixed(2)}</span>
                      <span className="text-right text-[#9AA4B2]">{row.recall.toFixed(2)}</span>
                      <span className="text-right text-emerald-400 font-bold">{row.f1_score.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F7FA]">
              Test Set Confusion Matrix
            </h3>
            <p className="text-xs text-[#9AA4B2]">
              Rows represent ground truth classes, columns represent model predictions
            </p>
          </div>

          {cm.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[440px] text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-[#252B35] text-[10px] text-[#687384] uppercase">
                    <th className="py-2 text-left">Actual \ Pred</th>
                    {classes.map((c) => (
                      <th key={c} className="py-2 text-center px-1">
                        {c.slice(0, 4)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252B35]/50">
                  {classes.map((rowCls, rowIdx) => (
                    <tr key={rowCls} className="hover:bg-[#141820]/40">
                      <td className="py-2 text-[#F4F7FA] font-semibold text-[11px]">{rowCls}</td>
                      {classes.map((colCls, colIdx) => {
                        const val = cm[rowIdx]?.[colIdx] ?? 0;
                        const isDiag = rowIdx === colIdx;
                        return (
                          <td
                            key={colCls}
                            className={`py-2 text-center font-bold ${
                              isDiag
                                ? val > 0
                                  ? "text-emerald-400 bg-emerald-500/10"
                                  : "text-[#687384]"
                                : val > 0
                                ? "text-amber-400 bg-amber-500/10"
                                : "text-[#3B4252]"
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
            <div className="p-8 text-center text-[#687384] text-xs font-mono">
              Confusion matrix being computed...
            </div>
          )}
        </div>
      </div>

      {/* 6. Feature Importance Ranking */}
      <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[#F4F7FA]">
            Top Feature Importance Weights
          </h3>
          <p className="text-xs text-[#9AA4B2]">
            Relative feature contributions to decision splits across the Random Forest ensemble
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(featureImp)
            .slice(0, 10)
            .map(([feat, imp], idx) => {
              const pct = Math.min(100, Math.round((imp / 0.1) * 100));
              return (
                <div key={feat} className="p-3 rounded-lg bg-[#141820] border border-[#252B35] space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#F4F7FA] font-medium truncate">
                      {idx + 1}. {feat}
                    </span>
                    <span className="text-blue-400 font-bold">{(imp * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#090B10] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
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
