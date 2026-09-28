"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Play,
  AlertCircle,
  ArrowUpRight,
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
import { createAnalysis } from "@/lib/api/analyses";
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
  const router = useRouter();
  const [config, setConfig] = useState<TestbedConfig>(DEFAULT_CONFIG);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createAnalysis,
    onSuccess: (data) => {
      router.push(`/analyses/${data.analysis_id}/processing`);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || "Failed to trigger testbed simulation.");
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

  const handleRunSimulation = () => {
    setErrorMessage(null);

    // Map selected config to the closest canonical simulation scenario
    let targetScenario = "secure-enterprise";
    if (
      config.ikeVersion === "IKEv1" ||
      config.dhGroup === "DH Group 2" ||
      config.encryption === "AES-128-CBC"
    ) {
      targetScenario = "weak-configuration";
    } else if (config.ipVersion === "IPv6" || config.dhGroup === "DH Group 20") {
      targetScenario = "secure-ipv6";
    } else if (config.pfs === "Disabled" || config.encryption.includes("CBC")) {
      targetScenario = "moderate-security";
    }

    mutation.mutate({
      source_type: "simulation",
      scenario_id: targetScenario,
    });
  };

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
        badge={<SimulationModeBadge />}
        actions={
          <PrimaryButton
            variant="primary"
            size="sm"
            icon={Play}
            isLoading={mutation.isPending}
            onClick={handleRunSimulation}
          >
            Run Current Scenario
          </PrimaryButton>
        }
      />

      {/* 2. Testbed Status Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl border border-[#252B35] bg-[#0F1218]">
          <span className="text-[10px] text-[#687384] uppercase block">
            Testbed Status
          </span>
          <span className="text-emerald-400 font-bold mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Simulation Ready
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#252B35] bg-[#0F1218]">
          <span className="text-[10px] text-[#687384] uppercase block">
            Execution Engine
          </span>
          <span className="text-[#F4F7FA] font-bold mt-1 block">
            MockAnalysisEngine
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#252B35] bg-[#0F1218]">
          <span className="text-[10px] text-[#687384] uppercase block">
            Scenario Profiles
          </span>
          <span className="text-blue-400 font-bold mt-1 block">
            5 Benchmarks
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-[#252B35] bg-[#0F1218]">
          <span className="text-[10px] text-[#687384] uppercase block">
            Target Namespaces
          </span>
          <span className="text-[#F4F7FA] font-bold mt-1 block truncate">
            ns_initiator, ns_responder
          </span>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Interactive Topology Diagram */}
      <NetworkTopology
        ikeVersion={config.ikeVersion}
        encryption={config.encryption}
        dhGroup={config.dhGroup}
        ipVersion={config.ipVersion}
      />

      {/* 4. Interactive Configuration Controls */}
      <TestbedConfigurator
        config={config}
        onChangeConfig={setConfig}
        onApplyPreset={handleApplyPreset}
        onReset={() => setConfig(DEFAULT_CONFIG)}
        onRunSimulation={handleRunSimulation}
        isSubmitting={mutation.isPending}
      />

      {/* 5. Recent Test Runs History */}
      <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#252B35]">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F7FA]">
              Recent Testbed Execution Runs
            </h3>
            <p className="text-xs text-[#9AA4B2]">
              Historical scenario runs executed through the testbed orchestrator
            </p>
          </div>
          <Link
            href="/analyses"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            All Analyses &rarr;
          </Link>
        </div>

        <div className="divide-y divide-[#252B35]/60 text-xs font-mono">
          {DASHBOARD_DATA.recentAnalyses.slice(0, 4).map((run) => (
            <div
              key={run.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <Link
                  href={`/analyses/${run.id}`}
                  className="font-bold text-blue-400 hover:underline"
                >
                  {run.id}
                </Link>
                <span className="text-[#3B4252]">•</span>
                <span className="text-[#F4F7FA]">{run.sourceName}</span>
                <span className="text-[#3B4252]">•</span>
                <span className="text-[#9AA4B2]">{run.encryption}</span>
              </div>

              <div className="flex items-center gap-4 text-[#687384]">
                <span>Score: {run.securityScore}/100</span>
                <span>{formatDate(run.createdAt)}</span>
                <Link
                  href={`/analyses/${run.id}`}
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
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
