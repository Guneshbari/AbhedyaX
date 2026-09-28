"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  FileCode,
  Activity,
  StopCircle,
} from "lucide-react";
import { TestbedRun } from "@/types/testbed";

interface Props {
  run: TestbedRun;
  onCancel?: () => void;
  isCancelling?: boolean;
}

export const TestbedExecutionMonitor: React.FC<Props> = ({
  run,
  onCancel,
  isCancelling = false,
}) => {
  const isRunning =
    run.state !== "Completed" &&
    run.state !== "Failed" &&
    run.state !== "Cancelled" &&
    run.state !== "Idle";

  return (
    <div className="p-6 rounded-2xl border border-[#252B35] bg-[#0F1218] space-y-6 shadow-xl">
      {/* 1. Header Bar with State & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#252B35]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs text-blue-400 font-bold">
              RUN ID: {run.run_id}
            </span>
            <span className="text-[#3B4252]">•</span>
            <span className="text-xs px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 font-medium">
              {run.execution_mode === "real"
                ? "Real strongSwan Engine"
                : "Deterministic Simulation Mode"}
            </span>
            <span className="text-[#3B4252]">•</span>
            <span className="text-xs text-[#9AA4B2] font-mono">
              Profile: {run.traffic_profile}
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#F4F7FA] mt-1">
            {run.scenario_name}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {isRunning && onCancel && (
            <button
              onClick={onCancel}
              disabled={isCancelling}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors disabled:opacity-50"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>{isCancelling ? "Cancelling..." : "Cancel Run"}</span>
            </button>
          )}

          {run.analysis_id && (
            <Link
              href={`/analyses/${run.analysis_id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-colors"
            >
              <span>Inspect in Analyzer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. Live Progress Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            {isRunning && (
              <RotateCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            )}
            {run.state === "Completed" && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {run.state === "Failed" && (
              <XCircle className="w-3.5 h-3.5 text-red-400" />
            )}
            {run.state === "Cancelled" && (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="font-semibold text-[#F4F7FA]">
              State: {run.state}
            </span>
          </div>
          <span className="text-[#9AA4B2]">{run.progress}%</span>
        </div>

        {/* Progress Track */}
        <div className="h-2 w-full bg-[#141820] rounded-full overflow-hidden border border-[#252B35]">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              run.state === "Completed"
                ? "bg-emerald-500"
                : run.state === "Failed"
                ? "bg-red-500"
                : run.state === "Cancelled"
                ? "bg-amber-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${Math.max(5, run.progress)}%` }}
          />
        </div>

        <p className="text-xs text-[#9AA4B2] font-mono">
          {run.step_description}
        </p>
      </div>

      {/* 3. Detailed Results Section on Completion */}
      {run.state === "Completed" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Ground Truth Card */}
          <div className="p-4 rounded-xl border border-[#252B35] bg-[#141820]/70 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F4F7FA]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ground Truth Config</span>
            </div>
            {run.ground_truth ? (
              <div className="text-xs font-mono space-y-1.5 text-[#9AA4B2]">
                <div className="flex justify-between">
                  <span>IKE:</span>
                  <span className="text-[#F4F7FA]">
                    {run.ground_truth.configuration.ike_version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cipher:</span>
                  <span className="text-[#F4F7FA]">
                    {run.ground_truth.configuration.encryption}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>DH Group:</span>
                  <span className="text-[#F4F7FA]">
                    {run.ground_truth.configuration.dh_group}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span className="text-[#F4F7FA]">
                    {run.ground_truth.configuration.mode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Traffic Class:</span>
                  <span className="text-blue-400">
                    {run.ground_truth.traffic.class}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#687384]">Not available</p>
            )}
          </div>

          {/* Capture Telemetry Card */}
          <div className="p-4 rounded-xl border border-[#252B35] bg-[#141820]/70 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F4F7FA]">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Captured PCAP Telemetry</span>
            </div>
            {run.capture_metadata ? (
              <div className="text-xs font-mono space-y-1.5 text-[#9AA4B2]">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="text-[#F4F7FA] uppercase">
                    {run.capture_metadata.file_format}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Packets:</span>
                  <span className="text-emerald-400 font-bold">
                    {run.capture_metadata.packet_count} pkts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="text-[#F4F7FA]">
                    {(run.capture_metadata.file_size_bytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="text-[#F4F7FA]">
                    {run.capture_metadata.duration_seconds}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Interface:</span>
                  <span className="text-[#F4F7FA]">
                    {run.capture_metadata.interface}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#687384]">Not available</p>
            )}
          </div>

          {/* Validation Score Card */}
          <div className="p-4 rounded-xl border border-[#252B35] bg-[#141820]/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F4F7FA]">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Analyzer Validation</span>
              </div>
              {run.validation_result && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    run.validation_result.passed
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border border-red-500/30"
                  }`}
                >
                  {run.validation_result.passed ? "Passed" : "Failed"}
                </span>
              )}
            </div>
            {run.validation_result ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-[#F4F7FA]">
                    {Math.round(run.validation_result.accuracy * 100)}%
                  </span>
                  <span className="text-xs text-[#9AA4B2] font-mono">
                    ({run.validation_result.matched_checks}/
                    {run.validation_result.total_checks} verified)
                  </span>
                </div>
                <p className="text-[11px] text-[#687384]">
                  Automated ground-truth vs AbhedyaX protocol inspection comparison.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#687384]">Not available</p>
            )}
          </div>
        </div>
      )}

      {/* 4. Verification Check Details Table */}
      {run.state === "Completed" && run.validation_result && (
        <div className="space-y-2 pt-2 border-t border-[#252B35]">
          <h4 className="text-xs font-semibold uppercase text-[#687384] tracking-wider">
            Ground-Truth Verification Matrix
          </h4>
          <div className="rounded-xl border border-[#252B35] overflow-hidden">
            <div className="grid grid-cols-4 bg-[#141820] px-4 py-2 text-[10px] font-mono uppercase text-[#687384] border-b border-[#252B35]">
              <span>Field</span>
              <span>Expected</span>
              <span>Observed</span>
              <span className="text-right">Match</span>
            </div>
            <div className="divide-y divide-[#252B35]/60 text-xs font-mono">
              {run.validation_result.checks.map((chk, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-4 px-4 py-2 items-center hover:bg-[#141820]/40 transition-colors"
                >
                  <span className="text-[#F4F7FA] font-medium">
                    {chk.field}
                  </span>
                  <span className="text-[#9AA4B2]">
                    {String(chk.expected)}
                  </span>
                  <span className="text-[#9AA4B2]">
                    {String(chk.observed)}
                  </span>
                  <span className="text-right">
                    {chk.match ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>MATCH</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 font-bold text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>DIFF</span>
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
