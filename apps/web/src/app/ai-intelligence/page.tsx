import React from "react";
import { BrainCircuit, Cpu, Layers, BarChart3, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AiIntelligencePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Encrypted Traffic Intelligence"
        subtitle="Machine learning inference models trained to classify encrypted ESP payload profiles (VoIP, Video, Web, Messaging) without decryption."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "AI Intelligence" },
        ]}
      />

      {/* Model Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Inference Accuracy"
          value="94.2%"
          trend="+1.8%"
          trendDirection="up"
          trendLabel="on holdout testbed set"
          icon={BrainCircuit}
        />
        <MetricCard
          label="Encrypted Classes"
          value="7"
          helperText="VoIP, Messaging, Email, Web, ICMP, Video, Unknown"
          icon={Layers}
        />
        <MetricCard
          label="Mean Inference Latency"
          value="4.2ms"
          trend="-0.6ms"
          trendDirection="down"
          trendLabel="optimized ONNX runtime"
          icon={Cpu}
        />
        <MetricCard
          label="Deterministic Decoupling"
          value="100%"
          helperText="Zero LLM involvement in cryptographic rules"
          icon={ShieldCheck}
        />
      </div>

      {/* Target Classes Matrix */}
      <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218]">
        <h2 className="text-sm font-semibold text-[#F4F7FA] mb-1">
          Canonical Traffic Profile Classes
        </h2>
        <p className="text-xs text-[#9AA4B2] mb-4">
          Statistical features extracted from ESP packet length distributions, inter-arrival intervals, and burst dynamics.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {[
            { name: "VoIP", desc: "Low jitter / RTP cadence", icon: "📞" },
            { name: "Messaging", desc: "Sporadic small bursts", icon: "💬" },
            { name: "Email", desc: "Medium bursty transfers", icon: "✉️" },
            { name: "Web", desc: "High variability HTTPS", icon: "🌐" },
            { name: "ICMP", desc: "Fixed small size packets", icon: "⚡" },
            { name: "Video", desc: "High bandwidth stream", icon: "🎥" },
            { name: "Unknown", desc: "Anomalous flow profile", icon: "❓" },
          ].map((cls) => (
            <div
              key={cls.name}
              className="p-3 rounded-lg bg-[#141820] border border-[#252B35] text-center"
            >
              <div className="text-xl mb-1">{cls.icon}</div>
              <div className="text-xs font-semibold text-[#F4F7FA]">
                {cls.name}
              </div>
              <div className="text-[10px] text-[#687384] mt-0.5 leading-tight">
                {cls.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <EmptyState
        title="ML Classifier Pipeline (Phase 4)"
        description="The real-time feature extraction pipeline extracts time-series and length distribution vectors from live ESP streams to execute ONNX model inference."
        icon={BarChart3}
        actionText="View Training Schemas"
        actionHref="/analyze"
      />
    </div>
  );
}
