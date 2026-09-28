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
    <div className="p-5 sm:p-6 bg-white border-2 border-black shadow-[5px_5px_0px_0px_#000] space-y-6">
      {/* 1. Header Bar with State & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs text-black font-black bg-[#FFE600] px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
              RUN ID: {run.run_id}
            </span>
            <span className="text-black font-black">•</span>
            <span className="text-xs px-2 py-0.5 border-2 border-black bg-white text-black font-mono font-bold shadow-[1px_1px_0px_0px_#000]">
              {run.execution_mode === "real"
                ? "Real strongSwan Engine"
                : "Deterministic Simulation Mode"}
            </span>
            <span className="text-black font-black">•</span>
            <span className="text-xs text-zinc-700 font-mono font-bold">
              Profile: {run.traffic_profile}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-black mt-2">
            {run.scenario_name}
          </h3>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isRunning && onCancel && (
            <button
              onClick={onCancel}
              disabled={isCancelling}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-[#FF4B4B] hover:bg-red-400 text-black text-xs font-mono font-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
            >
              <StopCircle className="w-4 h-4 stroke-[2.5]" />
              <span>{isCancelling ? "Cancelling..." : "Cancel Run"}</span>
            </button>
          )}

          {run.analysis_id && (
            <Link
              href={`/analyses/${run.analysis_id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-[#4ADE80] hover:bg-emerald-300 text-black text-xs font-mono font-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              <span>Inspect in Analyzer</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. Live Progress Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-black">
          <div className="flex items-center gap-2">
            {isRunning && (
              <RotateCw className="w-4 h-4 text-black animate-spin stroke-[2.5]" />
            )}
            {run.state === "Completed" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 stroke-[3]" />
            )}
            {run.state === "Failed" && (
              <XCircle className="w-4 h-4 text-[#FF4B4B] stroke-[3]" />
            )}
            {run.state === "Cancelled" && (
              <AlertTriangle className="w-4 h-4 text-amber-700 stroke-[3]" />
            )}
            <span className="text-black">
              State: {run.state}
            </span>
          </div>
          <span className="bg-[#FFE600] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">{run.progress}%</span>
        </div>

        {/* Progress Track */}
        <div className="h-3 w-full bg-white border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_#000]">
          <div
            className={`h-full border-r-2 border-black transition-all duration-300 ${
              run.state === "Completed"
                ? "bg-[#4ADE80]"
                : run.state === "Failed"
                ? "bg-[#FF4B4B]"
                : run.state === "Cancelled"
                ? "bg-[#FBBF24]"
                : "bg-[#FFE600]"
            }`}
            style={{ width: `${Math.max(5, run.progress)}%` }}
          />
        </div>

        <p className="text-xs text-zinc-700 font-mono font-bold">
          {run.step_description}
        </p>
      </div>

      {/* 3. Detailed Results Section on Completion */}
      {run.state === "Completed" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Ground Truth Card */}
          <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-black">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Ground Truth Config</span>
            </div>
            {run.ground_truth ? (
              <div className="text-xs font-mono space-y-1.5 text-zinc-800 font-bold">
                <div className="flex justify-between">
                  <span>IKE:</span>
                  <span className="text-black">
                    {run.ground_truth.configuration.ike_version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cipher:</span>
                  <span className="text-black">
                    {run.ground_truth.configuration.encryption}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>DH Group:</span>
                  <span className="text-black">
                    {run.ground_truth.configuration.dh_group}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mode:</span>
                  <span className="text-black">
                    {run.ground_truth.configuration.mode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Traffic Class:</span>
                  <span className="bg-[#FFE600] px-1 border border-black">
                    {run.ground_truth.traffic.class}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-600 font-mono">Not available</p>
            )}
          </div>

          {/* Capture Telemetry Card */}
          <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-black">
              <FileCode className="w-4 h-4 stroke-[2.5]" />
              <span>Captured PCAP Telemetry</span>
            </div>
            {run.capture_metadata ? (
              <div className="text-xs font-mono space-y-1.5 text-zinc-800 font-bold">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="text-black uppercase">
                    {run.capture_metadata.file_format}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Packets:</span>
                  <span className="text-black font-black">
                    {run.capture_metadata.packet_count} pkts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="text-black">
                    {(run.capture_metadata.file_size_bytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="text-black">
                    {run.capture_metadata.duration_seconds}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Interface:</span>
                  <span className="text-black">
                    {run.capture_metadata.interface}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-600 font-mono">Not available</p>
            )}
          </div>

          {/* Validation Score Card */}
          <div className="p-4 bg-[#FAF8F5] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-black">
                <Activity className="w-4 h-4 stroke-[2.5]" />
                <span>Analyzer Validation</span>
              </div>
              {run.validation_result && (
                <span
                  className={`text-[10px] px-2 py-0.5 border border-black font-bold uppercase shadow-[1px_1px_0px_0px_#000] ${
                    run.validation_result.passed
                      ? "bg-[#4ADE80] text-black"
                      : "bg-[#FF4B4B] text-black"
                  }`}
                >
                  {run.validation_result.passed ? "Passed" : "Failed"}
                </span>
              )}
            </div>
            {run.validation_result ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-black">
                    {Math.round(run.validation_result.accuracy * 100)}%
                  </span>
                  <span className="text-xs text-zinc-700 font-mono font-bold">
                    ({run.validation_result.matched_checks}/
                    {run.validation_result.total_checks} verified)
                  </span>
                </div>
                <p className="text-xs text-zinc-600 font-medium">
                  Automated ground-truth vs AbhedyaX protocol inspection comparison.
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-600 font-mono">Not available</p>
            )}
          </div>
        </div>
      )}

      {/* 4. Verification Check Details Table */}
      {run.state === "Completed" && run.validation_result && (
        <div className="space-y-2 pt-2 border-t-2 border-black">
          <h4 className="text-xs font-mono font-black uppercase text-black tracking-wider">
            Ground-Truth Verification Matrix
          </h4>
          <div className="border-2 border-black shadow-[3px_3px_0px_0px_#000] overflow-hidden">
            <div className="grid grid-cols-4 bg-[#FFE600] px-4 py-2 text-[10px] font-mono uppercase font-black text-black border-b-2 border-black">
              <span>Field</span>
              <span>Expected</span>
              <span>Observed</span>
              <span className="text-right">Match</span>
            </div>
            <div className="divide-y-2 divide-black text-xs font-mono font-bold">
              {run.validation_result.checks.map((chk, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-4 px-4 py-2.5 items-center hover:bg-[#FAF8F5] bg-white transition-colors"
                >
                  <span className="text-black font-black">
                    {chk.field}
                  </span>
                  <span className="text-zinc-700">
                    {String(chk.expected)}
                  </span>
                  <span className="text-zinc-700">
                    {String(chk.observed)}
                  </span>
                  <span className="text-right">
                    {chk.match ? (
                      <span className="inline-flex items-center gap-1 bg-[#4ADE80] text-black px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000] font-black text-[10px]">
                        <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                        <span>MATCH</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-[#FF4B4B] text-black px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000] font-black text-[10px]">
                        <XCircle className="w-3 h-3 stroke-[3]" />
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
