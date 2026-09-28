import React from "react";
import { Sliders, Play, RotateCcw } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecurityScore } from "@/components/ui/SecurityScore";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { RiskLevel } from "@/types/dashboard";

export interface TestbedConfig {
  ikeVersion: "IKEv1" | "IKEv2";
  vpnMode: "Tunnel" | "Transport";
  encryption: "AES-128-CBC" | "AES-256-CBC" | "AES-128-GCM" | "AES-256-GCM";
  authentication: "HMAC-SHA1" | "HMAC-SHA256" | "AEAD";
  dhGroup: "DH Group 2" | "DH Group 14" | "DH Group 19" | "DH Group 20";
  pfs: "Enabled" | "Disabled";
  ipVersion: "IPv4" | "IPv6";
}

interface TestbedConfiguratorProps {
  config: TestbedConfig;
  onChangeConfig: (newConfig: TestbedConfig) => void;
  onApplyPreset: (presetName: string) => void;
  onReset: () => void;
  onRunSimulation: () => void;
  isSubmitting?: boolean;
}

export const TestbedConfigurator: React.FC<TestbedConfiguratorProps> = ({
  config,
  onChangeConfig,
  onApplyPreset,
  onReset,
  onRunSimulation,
  isSubmitting = false,
}) => {
  // Compute deterministic estimated posture based on parameters
  const calculateEstimatedPosture = () => {
    let score = 95;
    if (config.ikeVersion === "IKEv1") score -= 25;
    if (config.dhGroup === "DH Group 2") score -= 25;
    else if (config.dhGroup === "DH Group 14") score -= 10;
    if (config.encryption === "AES-128-CBC") score -= 15;
    else if (config.encryption === "AES-256-CBC") score -= 8;
    if (config.authentication === "HMAC-SHA1") score -= 18;
    if (config.pfs === "Disabled") score -= 15;
    if (config.ipVersion === "IPv6" && score >= 85) score = Math.min(score + 2, 98);

    score = Math.max(score, 35);

    let riskLevel: RiskLevel = "Low";
    if (score < 50) riskLevel = "Critical";
    else if (score < 70) riskLevel = "High";
    else if (score < 85) riskLevel = "Medium";

    return { score, riskLevel };
  };

  const estimated = calculateEstimatedPosture();

  const presets = [
    { label: "Secure Enterprise", id: "secure-enterprise" },
    { label: "Moderate Security", id: "moderate-security" },
    { label: "Legacy Weak", id: "weak-configuration" },
    { label: "Secure IPv6", id: "secure-ipv6" },
    { label: "Traffic Anomaly", id: "traffic-anomaly" },
  ];

  return (
    <div className="p-6 rounded-xl border border-[#252B35] bg-[#0F1218] space-y-6">
      {/* Header & Presets Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#252B35] gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#F4F7FA] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Scenario Parameter Orchestration</span>
          </h3>
          <p className="text-xs text-[#9AA4B2] mt-0.5">
            Configure target IPsec cryptographic and handshake attributes
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] uppercase font-mono text-[#687384] shrink-0">
            Presets:
          </span>
          {presets.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => onApplyPreset(p.id)}
              className="text-[11px] px-2 py-0.5 rounded bg-[#141820] hover:bg-[#1A202C] text-[#9AA4B2] hover:text-[#F4F7FA] border border-[#252B35] transition-colors shrink-0 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* IKE Version */}
        <div className="space-y-1.5">
          <label className="text-[#687384] font-medium text-[11px] uppercase font-mono">
            IKE Protocol Version
          </label>
          <select
            value={config.ikeVersion}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                ikeVersion: e.target.value as "IKEv1" | "IKEv2",
              })
            }
            className="w-full bg-[#141820] border border-[#252B35] rounded-lg px-3 py-2 text-[#F4F7FA] focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="IKEv2">IKEv2 (Modern RFC 7296)</option>
            <option value="IKEv1">IKEv1 (Legacy RFC 2409)</option>
          </select>
        </div>

        {/* Encapsulation Mode */}
        <div className="space-y-1.5">
          <label className="text-[#687384] font-medium text-[11px] uppercase font-mono">
            Encapsulation Mode
          </label>
          <select
            value={config.vpnMode}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                vpnMode: e.target.value as "Tunnel" | "Transport",
              })
            }
            className="w-full bg-[#141820] border border-[#252B35] rounded-lg px-3 py-2 text-[#F4F7FA] focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Tunnel">Tunnel Mode (Gateway-to-Gateway)</option>
            <option value="Transport">Transport Mode (Host-to-Host)</option>
          </select>
        </div>

        {/* Encryption Cipher */}
        <div className="space-y-1.5">
          <label className="text-[#687384] font-medium text-[11px] uppercase font-mono">
            Symmetric Cipher
          </label>
          <select
            value={config.encryption}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                encryption: e.target.value as TestbedConfig["encryption"],
                // auto-adjust auth if AEAD
                authentication: e.target.value.includes("GCM")
                  ? "AEAD"
                  : config.authentication === "AEAD"
                  ? "HMAC-SHA256"
                  : config.authentication,
              })
            }
            className="w-full bg-[#141820] border border-[#252B35] rounded-lg px-3 py-2 text-[#F4F7FA] focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="AES-256-GCM">AES-256-GCM (AEAD Suite)</option>
            <option value="AES-128-GCM">AES-128-GCM (AEAD Suite)</option>
            <option value="AES-256-CBC">AES-256-CBC (Cipher-Block Chaining)</option>
            <option value="AES-128-CBC">AES-128-CBC (Legacy Standard)</option>
          </select>
        </div>

        {/* Authentication Integrity */}
        <div className="space-y-1.5">
          <label className="text-[#687384] font-medium text-[11px] uppercase font-mono">
            Integrity / PRF Algorithm
          </label>
          <select
            value={config.authentication}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                authentication: e.target.value as TestbedConfig["authentication"],
              })
            }
            className="w-full bg-[#141820] border border-[#252B35] rounded-lg px-3 py-2 text-[#F4F7FA] focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="AEAD">AEAD Integrated (ICV-16)</option>
            <option value="HMAC-SHA256">HMAC-SHA2-256-128</option>
            <option value="HMAC-SHA1">HMAC-SHA1-96 (Deprecated)</option>
          </select>
        </div>

        {/* Diffie-Hellman Group */}
        <div className="space-y-1.5">
          <label className="text-[#687384] font-medium text-[11px] uppercase font-mono">
            Diffie-Hellman Group
          </label>
          <select
            value={config.dhGroup}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                dhGroup: e.target.value as TestbedConfig["dhGroup"],
              })
            }
            className="w-full bg-[#141820] border border-[#252B35] rounded-lg px-3 py-2 text-[#F4F7FA] focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="DH Group 19">DH Group 19 (ECP-256 Elliptic)</option>
            <option value="DH Group 20">DH Group 20 (ECP-384 High-Sec)</option>
            <option value="DH Group 14">DH Group 14 (MODP-2048)</option>
            <option value="DH Group 2">DH Group 2 (MODP-1024 Insecure)</option>
          </select>
        </div>

        {/* PFS Status */}
        <div className="space-y-1.5">
          <label className="text-[#687384] font-medium text-[11px] uppercase font-mono">
            Perfect Forward Secrecy
          </label>
          <select
            value={config.pfs}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                pfs: e.target.value as "Enabled" | "Disabled",
              })
            }
            className="w-full bg-[#141820] border border-[#252B35] rounded-lg px-3 py-2 text-[#F4F7FA] focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="Enabled">Enabled (PFS Enforced on Child SA)</option>
            <option value="Disabled">Disabled (Re-use IKE SA Keying)</option>
          </select>
        </div>

        {/* IP Version */}
        <div className="space-y-1.5">
          <label className="text-[#687384] font-medium text-[11px] uppercase font-mono">
            IP Version Stack
          </label>
          <select
            value={config.ipVersion}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                ipVersion: e.target.value as "IPv4" | "IPv6",
              })
            }
            className="w-full bg-[#141820] border border-[#252B35] rounded-lg px-3 py-2 text-[#F4F7FA] focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="IPv4">IPv4 (Standard Dual-Stack)</option>
            <option value="IPv6">IPv6 (Native Encapsulation)</option>
          </select>
        </div>

        {/* Posture Prediction Card */}
        <div className="p-3.5 rounded-lg bg-[#141820] border border-[#252B35] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#687384] uppercase font-mono block">
              Predicted Posture
            </span>
            <div className="mt-1">
              <RiskBadge level={estimated.riskLevel} />
            </div>
          </div>
          <SecurityScore score={estimated.score} size="md" showProgress={false} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-[#252B35] flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-[#9AA4B2] hover:text-[#F4F7FA] flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Defaults</span>
        </button>

        <PrimaryButton
          variant="primary"
          size="md"
          icon={Play}
          isLoading={isSubmitting}
          onClick={onRunSimulation}
        >
          {isSubmitting ? "Dispatching Scenario..." : "Run Testbed Simulation"}
        </PrimaryButton>
      </div>
    </div>
  );
};
