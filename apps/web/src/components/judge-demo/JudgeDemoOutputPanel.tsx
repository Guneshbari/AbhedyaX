"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Shield, Activity, Cpu, FileText, GitCompare } from "lucide-react";
import { useJudgeDemoStore } from "@/store/judgeDemo";
import { cn } from "@/lib/utils";

function KV({ label, value, mono = true, highlight = false }: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-[#252B35] last:border-b-0">
      <span className="font-mono text-[10px] text-[#687384] uppercase tracking-wider shrink-0">{label}</span>
      <span className={cn(
        "text-right text-[11px] font-bold",
        mono ? "font-mono" : "",
        highlight ? "text-[#FFE600]" : "text-[#F4F7FA]"
      )}>
        {value}
      </span>
    </div>
  );
}

function Badge({ label, variant = "neutral" }: {
  label: string;
  variant?: "good" | "warn" | "danger" | "neutral" | "info";
}) {
  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase border",
      variant === "good" ? "border-[#22C55E]/50 bg-[#22C55E]/10 text-[#22C55E]" :
      variant === "warn" ? "border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B]" :
      variant === "danger" ? "border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]" :
      variant === "info" ? "border-[#3B82F6]/50 bg-[#3B82F6]/10 text-[#3B82F6]" :
      "border-[#252B35] bg-[#141820] text-[#9AA4B2]"
    )}>
      {label}
    </span>
  );
}

function riskVariant(risk: string): "good" | "warn" | "danger" | "neutral" {
  if (risk === "Low") return "good";
  if (risk === "Moderate") return "warn";
  return "danger";
}

function scoreColor(score: number): string {
  if (score >= 90) return "text-[#22C55E]";
  if (score >= 75) return "text-[#F59E0B]";
  if (score >= 50) return "text-[#EF4444]";
  return "text-[#EF4444]";
}

export function JudgeDemoOutputPanel() {
  const { currentStage, stageStatuses, stageOutputs, scenarioId } = useJudgeDemoStore();
  const status = stageStatuses[currentStage];

  if (status === "locked" || status === "ready") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
        <Shield className="w-8 h-8 text-[#252B35]" />
        <p className="font-mono text-xs text-[#687384]">Output will appear after execution</p>
      </div>
    );
  }

  if (status === "running" || status === "validating") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
        <Activity className="w-8 h-8 text-[#F59E0B] animate-pulse" />
        <p className="font-mono text-xs text-[#F59E0B] uppercase tracking-wider animate-pulse">
          Processing...
        </p>
      </div>
    );
  }

  // Completed — show stage-specific output
  switch (currentStage) {
    case "input":
      return <InputOutput outputs={stageOutputs} />;
    case "packet-analysis":
      return <PacketOutput outputs={stageOutputs} />;
    case "normalization-flow":
      return <FlowOutput outputs={stageOutputs} />;
    case "vpn-analysis":
      return <VpnOutput outputs={stageOutputs} />;
    case "ai-intelligence":
      return <AiOutput outputs={stageOutputs} />;
    case "security-assessment":
      return <SecurityOutput outputs={stageOutputs} />;
    case "security-twin-drift":
      return <TwinDriftOutput outputs={stageOutputs} />;
    case "metadata-posture-report":
      return <FinalOutput outputs={stageOutputs} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Stage 1 — Input
// ---------------------------------------------------------------------------

function InputOutput({ outputs }: { outputs: ReturnType<typeof useJudgeDemoStore.getState>["stageOutputs"] }) {
  const { scenario, analysisId, scenarioId } = outputs;
  if (!scenario) return null;
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">SCENARIO OUTPUT</div>
      <div className="border border-[#252B35] bg-[#0F1218] px-3 py-1 divide-y divide-[#252B35]">
        <KV label="Analysis ID" value={analysisId} highlight />
        <KV label="Scenario" value={scenario.id.replace(/-/g, " ").toUpperCase()} />
        <KV label="Protocol" value={scenario.vpn.protocol} />
        <KV label="IKE Version" value={scenario.vpn.ike_version} />
        <KV label="Mode" value={scenario.vpn.mode} />
        <KV label="IP Version" value={scenario.vpn.ip_version} />
        <KV label="Encryption" value={scenario.cryptography.encryption} />
        <KV label="Auth / Integrity" value={scenario.cryptography.authentication} />
        <KV label="DH Group" value={scenario.cryptography.dh_group} />
        <KV label="PFS" value={
          <Badge label={scenario.cryptography.pfs ? "ENABLED" : "DISABLED"}
            variant={scenario.cryptography.pfs ? "good" : "warn"} />
        } />
        <KV label="Traffic Class (GT)" value={scenario.traffic.predicted_class} />
        <KV label="Expected Score" value={
          <span className={scoreColor(scenario.security.score)}>{scenario.security.score} / 100</span>
        } />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 2 — Packet Analysis
// ---------------------------------------------------------------------------

function PacketOutput({ outputs }: { outputs: typeof useJudgeDemoStore.getState extends () => { stageOutputs: infer T } ? T : never }) {
  const p = outputs.packetSummary;
  if (!p) return null;
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">PACKET INVENTORY</div>
      <div className="border border-[#252B35] bg-[#0F1218] px-3 py-1 divide-y divide-[#252B35]">
        <KV label="PCAP File" value={p.pcap_name} />
        <KV label="Total Packets" value={p.total_packets.toLocaleString()} highlight />
        <KV label="IKE Packets" value={p.ike_packets} />
        <KV label="ESP Packets" value={p.esp_packets.toLocaleString()} />
        <KV label="AH Packets" value={p.ah_packets} />
        <KV label="Capture Duration" value={`${p.capture_duration_seconds}s`} />
        <KV label="Payload Decrypted" value={
          <Badge label="NOT PERFORMED" variant="warn" />
        } />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "IKE", val: p.ike_packets, color: "text-[#3B82F6]" },
          { label: "ESP", val: p.esp_packets, color: "text-[#F59E0B]" },
          { label: "AH", val: p.ah_packets, color: "text-[#687384]" },
        ].map((item) => (
          <div key={item.label} className="border border-[#252B35] bg-[#141820] p-2 text-center">
            <div className={cn("font-mono font-black text-lg", item.color)}>{item.val}</div>
            <div className="font-mono text-[9px] text-[#687384] tracking-wider uppercase mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 3 — Protocol & Flow Extraction
// ---------------------------------------------------------------------------

function FlowOutput({ outputs }: any) {
  const pf = outputs.protocolFeatures;
  const ff = outputs.flowFeatures;
  if (!pf || !ff) return null;
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">EXTRACTED FEATURES</div>
      <div className="border border-[#252B35] bg-[#0F1218] px-3 py-1 divide-y divide-[#252B35]">
        <KV label="IKE Version" value={pf.ike_version} />
        <KV label="Encryption" value={pf.encryption} />
        <KV label="Auth" value={pf.auth} />
        <KV label="DH Group" value={pf.dh_group} />
        <KV label="PFS" value={<Badge label={pf.pfs ? "ON" : "OFF"} variant={pf.pfs ? "good" : "warn"} />} />
        <KV label="Replay Protection" value={<Badge label={pf.replay_protection ? "ON" : "OFF"} variant={pf.replay_protection ? "good" : "warn"} />} />
        <KV label="SA Lifetime" value={`${pf.sa_lifetime_seconds}s`} />
      </div>
      <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">FLOW METADATA</div>
      <div className="border border-[#252B35] bg-[#0F1218] px-3 py-1 divide-y divide-[#252B35]">
        <KV label="Mean Packet Size" value={`${ff.mean_packet_size?.toFixed(0)} B`} />
        <KV label="Packet Rate" value={`${ff.packet_rate?.toFixed(1)} pps`} />
        <KV label="Flow Duration" value={`${ff.flow_duration?.toFixed(1)}s`} />
        <KV label="Direction Ratio" value={ff.direction_ratio?.toFixed(2)} />
        <KV label="Burst Count" value={ff.burst_count} />
        <KV label="Pattern" value={ff.packet_size_pattern?.replace(/_/g, " ")} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 4 — VPN Security Analysis
// ---------------------------------------------------------------------------

function VpnOutput({ outputs }: any) {
  const vp = outputs.vpnProfile;
  if (!vp) return null;
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">OBSERVED SECURITY PROFILE</div>
      <div className="border border-[#252B35] bg-[#0F1218] px-3 py-1 divide-y divide-[#252B35]">
        <KV label="IKE Version" value={
          <Badge label={vp.ike_version} variant={vp.ike_version === "IKEv2" ? "good" : "danger"} />
        } />
        <KV label="Mode" value={vp.mode} />
        <KV label="IP Version" value={vp.ip_version} />
        <KV label="Encryption" value={vp.encryption} />
        <KV label="Auth" value={vp.auth} />
        <KV label="DH Group" value={
          <Badge
            label={vp.dh_group}
            variant={vp.dh_group.includes("19") || vp.dh_group.includes("20") ? "good" : vp.dh_group.includes("14") ? "warn" : "danger"}
          />
        } />
        <KV label="PFS" value={<Badge label={vp.pfs ? "ENABLED" : "DISABLED"} variant={vp.pfs ? "good" : "warn"} />} />
        <KV label="Replay Protection" value={<Badge label={vp.replay_protection ? "ENABLED" : "DISABLED"} variant={vp.replay_protection ? "good" : "danger"} />} />
        <KV label="SA Lifetime" value={`${(vp.sa_lifetime_seconds / 3600).toFixed(0)}h (${vp.sa_lifetime_seconds}s)`} />
        <KV label="NAT-T" value={vp.nat_traversal ? "YES" : "NO"} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 5 — AI Intelligence
// ---------------------------------------------------------------------------

function AiOutput({ outputs }: any) {
  const ai = outputs.aiResult;
  if (!ai) return null;
  const pct = Math.round(ai.confidence * 100);
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">CLASSIFICATION RESULT</div>
      <div className="border border-[#252B35] bg-[#0F1218] px-3 py-2">
        <div className="flex items-end gap-3">
          <div>
            <div className="font-mono text-[10px] text-[#687384] uppercase tracking-wider mb-1">Traffic Class</div>
            <div className="font-mono text-2xl font-black text-[#FFE600]">{ai.traffic_class}</div>
          </div>
          <div className="mb-1">
            <div className="font-mono text-[10px] text-[#687384] uppercase tracking-wider mb-1">Confidence</div>
            <div className={cn("font-mono text-xl font-black", pct >= 80 ? "text-[#22C55E]" : pct >= 60 ? "text-[#F59E0B]" : "text-[#EF4444]")}>
              {pct}%
            </div>
          </div>
        </div>
        {/* Confidence bar */}
        <div className="mt-2 h-1.5 bg-[#252B35] w-full">
          <div
            className={cn("h-full transition-all", pct >= 80 ? "bg-[#22C55E]" : pct >= 60 ? "bg-[#F59E0B]" : "bg-[#EF4444]")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Class distribution */}
      {ai.class_distribution.length > 0 && (
        <>
          <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">CLASS PROBABILITIES</div>
          <div className="border border-[#252B35] bg-[#0F1218] divide-y divide-[#252B35]">
            {ai.class_distribution.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-3 py-1.5">
                <span className={cn("font-mono text-[11px] w-20 shrink-0", c.class === ai.traffic_class ? "text-[#FFE600] font-bold" : "text-[#9AA4B2]")}>
                  {c.class}
                </span>
                <div className="flex-1 h-1 bg-[#252B35]">
                  <div
                    className={cn("h-full", c.class === ai.traffic_class ? "bg-[#FFE600]" : "bg-[#252B35] border border-[#3B82F6]/30")}
                    style={{ width: `${Math.round(c.confidence * 100)}%`, background: c.class === ai.traffic_class ? "#FFE600" : "#3B82F6" }}
                  />
                </div>
                <span className="font-mono text-[11px] text-[#687384] w-10 text-right shrink-0">
                  {Math.round(c.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="border border-[#F59E0B]/30 bg-[#F59E0B]/5 px-3 py-2">
        <p className="font-mono text-[10px] text-[#F59E0B]">
          ⚠ Classification uses 28 metadata features only. Payload decryption: NOT PERFORMED.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 6 — Security Assessment
// ---------------------------------------------------------------------------

function SecurityOutput({ outputs }: any) {
  const sa = outputs.securityAssessment;
  if (!sa) return null;
  const scoreVal = sa.risk_score;
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">RISK ASSESSMENT</div>

      {/* Score card */}
      <div className="border border-[#252B35] bg-[#0F1218] p-3 flex items-center gap-4">
        <div className={cn("font-mono font-black text-4xl", scoreColor(scoreVal))}>{scoreVal}</div>
        <div>
          <div className="font-mono text-[10px] text-[#687384] uppercase">Security Score / 100</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge label={sa.grade} variant={scoreVal >= 90 ? "good" : scoreVal >= 75 ? "warn" : "danger"} />
            <Badge label={sa.risk_band} variant={riskVariant(sa.risk_band)} />
          </div>
          {sa.total_deduction > 0 && (
            <div className="font-mono text-[10px] text-[#687384] mt-1">
              Total deduction: <span className="text-[#EF4444]">-{sa.total_deduction}</span>
            </div>
          )}
        </div>
      </div>

      {/* Deductions */}
      {sa.deductions.length > 0 && (
        <>
          <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">DEDUCTIONS</div>
          <div className="border border-[#252B35] bg-[#0F1218] divide-y divide-[#252B35]">
            {sa.deductions.map((d: any, i: number) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2">
                <span className="font-mono text-[10px] text-[#EF4444] font-bold shrink-0 mt-0.5">-{d.deduction}</span>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] text-[#9AA4B2] truncate">{d.finding_id} — {d.category}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Findings count */}
      <div className="border border-[#252B35] bg-[#141820] px-3 py-2">
        <div className="font-mono text-[10px] text-[#687384] uppercase">Findings Generated</div>
        <div className={cn("font-mono font-black text-xl mt-0.5", sa.findings.length === 0 ? "text-[#22C55E]" : "text-[#EF4444]")}>
          {sa.findings.length} {sa.findings.length === 1 ? "finding" : "findings"}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 7 — Security Twin & Drift
// ---------------------------------------------------------------------------

function TwinDriftOutput({ outputs }: any) {
  const td = outputs.securityTwinDrift;
  if (!td) return null;
  const { twin, drift, score_delta } = td;
  const alignment = twin?.alignment?.overall ?? "unknown";
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">SECURITY TWIN</div>
      <div className="border border-[#252B35] bg-[#0F1218] px-3 py-1 divide-y divide-[#252B35]">
        <KV label="Analysis" value={twin?.analysis_id} />
        <KV label="Mode" value={twin?.mode} />
        <KV label="Alignment" value={
          <Badge
            label={alignment.toUpperCase()}
            variant={alignment === "aligned" ? "good" : alignment === "partial" ? "warn" : "danger"}
          />
        } />
        <KV label="Risk Score" value={
          <span className={scoreColor(twin?.security_impact?.risk_score ?? 0)}>
            {twin?.security_impact?.risk_score} / 100
          </span>
        } />
      </div>

      <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">DRIFT ANALYSIS</div>
      <div className="border border-[#252B35] bg-[#0F1218] px-3 py-1 divide-y divide-[#252B35]">
        <KV label="Baseline" value={drift?.baseline_analysis_id} />
        <KV label="Current" value={drift?.current_analysis_id} />
        <KV label="Score Delta" value={
          <span className={score_delta > 0 ? "text-[#22C55E]" : score_delta < 0 ? "text-[#EF4444]" : "text-[#9AA4B2]"}>
            {score_delta > 0 ? "+" : ""}{score_delta}
          </span>
        } highlight />
        <KV label="Changes" value={drift?.summary?.total_changes ?? 0} />
        <KV label="Security-Relevant" value={drift?.summary?.security_relevant_changes ?? 0} />
        <KV label="Weakened" value={
          <span className={drift?.summary?.weakened_changes > 0 ? "text-[#EF4444]" : "text-[#22C55E]"}>
            {drift?.summary?.weakened_changes ?? 0}
          </span>
        } />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage 8 — Final Insights
// ---------------------------------------------------------------------------

function FinalOutput({ outputs }: any) {
  const fi = outputs.finalInsights;
  const sa = outputs.securityAssessment;
  const ai = outputs.aiResult;
  if (!fi) return null;
  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] tracking-[0.2em] text-[#687384] uppercase">ANALYSIS SUMMARY</div>
      {sa && (
        <div className="border border-[#252B35] bg-[#0F1218] px-3 py-1 divide-y divide-[#252B35]">
          <KV label="Security Score" value={
            <span className={scoreColor(sa.risk_score)}>{sa.risk_score} / 100</span>
          } highlight />
          <KV label="Risk Band" value={<Badge label={sa.risk_band} variant={riskVariant(sa.risk_band)} />} />
          <KV label="Grade" value={sa.grade} />
          <KV label="Findings" value={sa.findings.length} />
        </div>
      )}
      {ai && (
        <div className="border border-[#252B35] bg-[#0F1218] px-3 py-1 divide-y divide-[#252B35]">
          <KV label="Traffic Class" value={<span className="text-[#FFE600]">{ai.traffic_class}</span>} />
          <KV label="AI Confidence" value={`${Math.round(ai.confidence * 100)}%`} />
          <KV label="Payload Decrypted" value={<Badge label="NO" variant="good" />} />
        </div>
      )}
      <div className="border border-[#252B35] bg-[#0F1218] px-3 py-1 divide-y divide-[#252B35]">
        <KV label="Metadata Dimensions" value={fi.metadata?.dimensions?.length ?? 5} />
        <KV label="Posture Timeline" value={`${fi.posture?.total_sessions ?? 6} sessions`} />
        <KV label="Reasoning Chains" value={fi.reasoning?.chains?.length ?? 0} />
        <KV label="Executive Report" value={<Badge label="GENERATED" variant="good" />} />
        <KV label="Technical Report" value={<Badge label="GENERATED" variant="good" />} />
      </div>
    </div>
  );
}
