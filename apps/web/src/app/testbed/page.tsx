"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Play,
  AlertCircle,
  ArrowUpRight,
  Activity,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SimulationModeBadge } from "@/components/ui/SimulationModeBadge";
import { NetworkTopology } from "@/components/testbed/NetworkTopology";
import {
  TestbedConfigurator,
  TestbedConfig,
} from "@/components/testbed/TestbedConfigurator";
import { TestbedExecutionMonitor } from "@/components/testbed/TestbedExecutionMonitor";
import {
  getTestbedStatus,
  getTestbedScenarios,
  createTestbedRun,
  getTestbedRun,
  cancelTestbedRun,
} from "@/lib/api/testbed";
import { DEMO_TESTBED_STATUS, DEMO_TESTBED_SCENARIOS } from "@/demo";
import { TrafficClass } from "@/types/testbed";
import { DASHBOARD_DATA } from "@/data/dashboardData";
import { formatDate } from "@/lib/utils";

const DEFAULT_CONFIG: TestbedConfig = {
  ikeVersion: "IKEv2",
  vpnMode: "Tunnel",
  encryption: "AES-256-GCM",
  authentication: "AEAD",
  dhGroup: "DH Group 19",
  pfs: "Enabled",
  ipVersion: "IPv4",
};

export default function TestbedPage() {
  const [config, setConfig] = useState<TestbedConfig>(DEFAULT_CONFIG);
  const [executionMode, setExecutionMode] = useState<"simulation" | "real">("simulation");
  const [trafficProfile, setTrafficProfile] = useState<TrafficClass>("ICMP");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch testbed environment capabilities with instant demo initial data
  const { data: envStatus = DEMO_TESTBED_STATUS } = useQuery({
    queryKey: ["testbed-status"],
    queryFn: getTestbedStatus,
    initialData: DEMO_TESTBED_STATUS,
    refetchInterval: 15000,
  });

  // 2. Fetch scenario definitions with instant demo initial data
  const { data: scenarios = DEMO_TESTBED_SCENARIOS } = useQuery({
    queryKey: ["testbed-scenarios"],
    queryFn: getTestbedScenarios,
    initialData: DEMO_TESTBED_SCENARIOS,
  });

  // 3. Poll active run if running
  const { data: currentRun, refetch: refetchRun } = useQuery({
    queryKey: ["testbed-run", activeRunId],
    queryFn: () => getTestbedRun(activeRunId!),
    enabled: !!activeRunId,
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      if (state === "Completed" || state === "Failed" || state === "Cancelled") {
        return false;
      }
      return 600;
    },
  });

  // 4. Create Run Mutation
  const createRunMutation = useMutation({
    mutationFn: createTestbedRun,
    onSuccess: (run) => {
      setErrorMessage(null);
      setActiveRunId(run.run_id);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to initiate testbed run.");
    },
  });

  // 5. Cancel Run Mutation
  const cancelRunMutation = useMutation({
    mutationFn: () => cancelTestbedRun(activeRunId!),
    onSuccess: () => {
      refetchRun();
    },
  });

  const handleApplyPreset = (presetId: string) => {
    switch (presetId) {
      case "secure-enterprise":
        setConfig({
          ikeVersion: "IKEv2",
          vpnMode: "Tunnel",
          encryption: "AES-256-GCM",
          authentication: "AEAD",
          dhGroup: "DH Group 19",
          pfs: "Enabled",
          ipVersion: "IPv4",
        });
        break;
      case "moderate-security":
        setConfig({
          ikeVersion: "IKEv2",
          vpnMode: "Tunnel",
          encryption: "AES-256-CBC",
          authentication: "HMAC-SHA256",
          dhGroup: "DH Group 14",
          pfs: "Disabled",
          ipVersion: "IPv4",
        });
        break;
      case "weak-configuration":
        setConfig({
          ikeVersion: "IKEv1",
          vpnMode: "Tunnel",
          encryption: "AES-128-CBC",
          authentication: "HMAC-SHA1",
          dhGroup: "DH Group 2",
          pfs: "Disabled",
          ipVersion: "IPv4",
        });
        break;
      case "secure-ipv6":
        setConfig({
          ikeVersion: "IKEv2",
          vpnMode: "Tunnel",
          encryption: "AES-256-GCM",
          authentication: "AEAD",
          dhGroup: "DH Group 20",
          pfs: "Enabled",
          ipVersion: "IPv6",
        });
        break;
      case "traffic-anomaly":
        setConfig({
          ikeVersion: "IKEv2",
          vpnMode: "Tunnel",
          encryption: "AES-256-GCM",
          authentication: "AEAD",
          dhGroup: "DH Group 19",
          pfs: "Enabled",
          ipVersion: "IPv4",
        });
        break;
    }
  };

  const handleRunExecution = () => {
    setErrorMessage(null);

    // Map selected config to closest testbed scenario
    let targetScenario = "ts-secure-ikev2-gcm";
    if (config.ikeVersion === "IKEv1") {
      targetScenario = "ts-legacy-ikev1";
    } else if (config.dhGroup === "DH Group 2" || config.encryption === "AES-128-CBC") {
      targetScenario = "ts-weak-dh";
    } else if (config.ipVersion === "IPv6" || config.dhGroup === "DH Group 20") {
      targetScenario = "ts-secure-ipv6";
    } else if (config.pfs === "Disabled" || config.encryption.includes("CBC")) {
      targetScenario = "ts-aes256-cbc";
    }

    createRunMutation.mutate({
      scenario_id: targetScenario,
      traffic_profile: trafficProfile,
      execution_mode: executionMode,
    });
  };

  const canRunReal = Boolean(
    envStatus?.is_linux && envStatus?.can_manage_netns && envStatus?.has_strongswan
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header */}
      <PageHeader
        title="strongSwan IPsec Testbed"
        subtitle="Virtual network namespace orchestration for reproducible multi-endpoint VPN scenarios, traffic injection, and live capture"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Testbed" },
        ]}
        badge={
          executionMode === "real" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-black text-xs font-mono font-black bg-[#4ADE80] text-black shadow-[2px_2px_0px_0px_#000]">
              <span className="w-2 h-2 rounded-full bg-black" />
              Real strongSwan Testbed
            </span>
          ) : (
            <SimulationModeBadge />
          )
        }
        actions={
          <PrimaryButton
            variant="primary"
            size="sm"
            icon={Play}
            isLoading={createRunMutation.isPending}
            onClick={handleRunExecution}
          >
            Run Current Scenario
          </PrimaryButton>
        }
      />

      {/* 2. Testbed Status Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-700 uppercase font-black block">
            Testbed Status
          </span>
          <span className="text-emerald-700 font-black mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-700" />
            {canRunReal ? "Real Testbed Ready" : "Simulation Ready"}
          </span>
        </div>

        <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-700 uppercase font-black block">
            Execution Mode
          </span>
          <span className="text-black font-black mt-1 block uppercase">
            {executionMode}
          </span>
        </div>

        <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-700 uppercase font-black block">
            Scenarios Available
          </span>
          <span className="text-black font-black mt-1 block">
            {scenarios ? `${scenarios.length} Defined` : "5 Benchmarks"}
          </span>
        </div>

        <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]">
          <span className="text-[10px] text-zinc-700 uppercase font-black block">
            Target Namespaces
          </span>
          <span className="text-black font-black mt-1 block truncate">
            ns_initiator, ns_responder
          </span>
        </div>
      </div>

      {/* 3. Execution Mode & Traffic Injection Controls Bar */}
      <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-black uppercase text-[11px] font-black flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-black" />
            Mode:
          </span>
          <div className="inline-flex border-2 border-black p-1 bg-[#FAF8F5] shadow-[2px_2px_0px_0px_#000]">
            <button
              onClick={() => setExecutionMode("simulation")}
              className={`px-3 py-1 text-xs font-black transition-all ${
                executionMode === "simulation"
                  ? "bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                  : "text-zinc-700 hover:text-black"
              }`}
            >
              Simulation Mode
            </button>
            <button
              onClick={() => setExecutionMode("real")}
              disabled={!canRunReal}
              title={
                canRunReal
                  ? "Execute inside real Linux network namespaces using strongSwan"
                  : envStatus?.message || "Missing root / strongSwan on this host"
              }
              className={`px-3 py-1 text-xs font-black transition-all ${
                executionMode === "real"
                  ? "bg-[#4ADE80] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                  : "text-zinc-700 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              Real strongSwan {!canRunReal && "(Unavailable)"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-black uppercase text-[11px] font-black flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-black" />
            Traffic Profile:
          </span>
          <select
            value={trafficProfile}
            onChange={(e) => setTrafficProfile(e.target.value as TrafficClass)}
            className="px-3 py-1.5 border-2 border-black bg-[#FAF8F5] text-black font-bold focus:outline-none focus:bg-[#FFE600] font-mono text-xs shadow-[2px_2px_0px_0px_#000]"
          >
            <option value="ICMP">ICMP (Ping Keep-Alive)</option>
            <option value="Web">Web (HTTP Bursts)</option>
            <option value="Email">Email (TCP Bursts)</option>
            <option value="VoIP">VoIP (Bidirectional UDP)</option>
            <option value="Video">Video (High-Throughput Stream)</option>
            <option value="Messaging">Messaging (Interactive Text)</option>
          </select>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 bg-[#FF4B4B]/15 border-2 border-black shadow-[4px_4px_0px_0px_#000] text-black text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FF4B4B]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4. Active Testbed Execution Monitor (Live Telemetry, Progress, Results) */}
      {currentRun && (
        <TestbedExecutionMonitor
          run={currentRun}
          onCancel={cancelRunMutation.mutate}
          isCancelling={cancelRunMutation.isPending}
        />
      )}

      {/* 5. Interactive Topology Diagram */}
      <NetworkTopology
        ikeVersion={config.ikeVersion}
        encryption={config.encryption}
        dhGroup={config.dhGroup}
        ipVersion={config.ipVersion}
      />

      {/* 6. Interactive Configuration Controls */}
      <TestbedConfigurator
        config={config}
        onChangeConfig={setConfig}
        onApplyPreset={handleApplyPreset}
        onReset={() => setConfig(DEFAULT_CONFIG)}
        onRunSimulation={handleRunExecution}
        isSubmitting={createRunMutation.isPending}
      />

      {/* 7. Recent Test Runs History */}
      <div className="p-6 bg-white border-2 sm:border-[3px] border-black shadow-[6px_6px_0px_0px_#000] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div>
            <h3 className="text-sm font-black text-black">
              Recent Testbed Execution Runs
            </h3>
            <p className="text-xs text-zinc-700 font-medium">
              Historical scenario runs executed through the testbed orchestrator
            </p>
          </div>
          <Link
            href="/analyses"
            className="text-xs text-black font-black hover:underline"
          >
            All Analyses &rarr;
          </Link>
        </div>

        <div className="divide-y-2 divide-black/20 text-xs font-mono">
          {DASHBOARD_DATA.recentAnalyses.slice(0, 4).map((run) => (
            <div
              key={run.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <Link
                  href={`/analyses/${run.id}`}
                  className="font-black text-black hover:underline"
                >
                  {run.id}
                </Link>
                <span className="text-black">•</span>
                <span className="text-black font-bold">{run.sourceName}</span>
                <span className="text-black">•</span>
                <span className="text-zinc-700 font-medium">{run.encryption}</span>
              </div>

              <div className="flex items-center gap-4 text-zinc-700 font-bold">
                <span>Score: {run.securityScore}/100</span>
                <span suppressHydrationWarning>{formatDate(run.createdAt)}</span>
                <Link
                  href={`/analyses/${run.id}`}
                  className="text-black font-black hover:underline flex items-center gap-0.5"
                >
                  <span>View</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
