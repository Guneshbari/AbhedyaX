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
    <div className="p-5 sm:p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] space-y-6">
      {/* Header & Presets Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-black flex items-center gap-2">
            <Sliders className="w-5 h-5 stroke-[2.5]" />
            <span>Scenario Parameter Orchestration</span>
          </h3>
          <p className="text-xs text-zinc-700 font-medium mt-0.5">
            Configure target IPsec cryptographic and handshake attributes
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] uppercase font-mono font-black text-black shrink-0">
            Presets:
          </span>
          {presets.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => onApplyPreset(p.id)}
              className="text-xs font-mono font-bold px-2.5 py-1 bg-white hover:bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all shrink-0 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        {/* IKE Version */}
        <div className="space-y-1.5">
          <label className="text-black font-black text-[11px] uppercase">
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
            className="w-full bg-white border-2 border-black px-3 py-2 text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
          >
            <option value="IKEv2">IKEv2 (Modern RFC 7296)</option>
            <option value="IKEv1">IKEv1 (Legacy RFC 2409)</option>
          </select>
        </div>

        {/* Encapsulation Mode */}
        <div className="space-y-1.5">
          <label className="text-black font-black text-[11px] uppercase">
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
            className="w-full bg-white border-2 border-black px-3 py-2 text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
          >
            <option value="Tunnel">Tunnel Mode (Gateway-to-Gateway)</option>
            <option value="Transport">Transport Mode (Host-to-Host)</option>
          </select>
        </div>

        {/* Encryption Cipher */}
        <div className="space-y-1.5">
          <label className="text-black font-black text-[11px] uppercase">
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
            className="w-full bg-white border-2 border-black px-3 py-2 text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
          >
            <option value="AES-256-GCM">AES-256-GCM (AEAD Suite)</option>
            <option value="AES-128-GCM">AES-128-GCM (AEAD Suite)</option>
            <option value="AES-256-CBC">AES-256-CBC (Cipher-Block Chaining)</option>
            <option value="AES-128-CBC">AES-128-CBC (Legacy Standard)</option>
          </select>
        </div>

        {/* Authentication Integrity */}
        <div className="space-y-1.5">
          <label className="text-black font-black text-[11px] uppercase">
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
            className="w-full bg-white border-2 border-black px-3 py-2 text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
          >
            <option value="AEAD">AEAD Integrated (ICV-16)</option>
            <option value="HMAC-SHA256">HMAC-SHA2-256-128</option>
            <option value="HMAC-SHA1">HMAC-SHA1-96 (Deprecated)</option>
          </select>
        </div>

        {/* Diffie-Hellman Group */}
        <div className="space-y-1.5">
          <label className="text-black font-black text-[11px] uppercase">
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
            className="w-full bg-white border-2 border-black px-3 py-2 text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
          >
            <option value="DH Group 19">DH Group 19 (ECP-256 Elliptic)</option>
            <option value="DH Group 20">DH Group 20 (ECP-384 High-Sec)</option>
            <option value="DH Group 14">DH Group 14 (MODP-2048)</option>
            <option value="DH Group 2">DH Group 2 (MODP-1024 Insecure)</option>
          </select>
        </div>

        {/* PFS Status */}
        <div className="space-y-1.5">
          <label className="text-black font-black text-[11px] uppercase">
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
            className="w-full bg-white border-2 border-black px-3 py-2 text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
          >
            <option value="Enabled">Enabled (PFS Enforced on Child SA)</option>
            <option value="Disabled">Disabled (Re-use IKE SA Keying)</option>
          </select>
        </div>

        {/* IP Version */}
        <div className="space-y-1.5">
          <label className="text-black font-black text-[11px] uppercase">
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
            className="w-full bg-white border-2 border-black px-3 py-2 text-black font-bold shadow-[2px_2px_0px_0px_#000] focus:outline-none cursor-pointer"
          >
            <option value="IPv4">IPv4 (Standard Dual-Stack)</option>
            <option value="IPv6">IPv6 (Native Encapsulation)</option>
          </select>
        </div>

        {/* Posture Prediction Card */}
        <div className="p-3.5 bg-[#FAF8F5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-600 uppercase font-black block">
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
      <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-mono font-black text-black hover:bg-[#FFE600] px-2.5 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
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
