/**
 * Canonical Metadata Exposure Fixtures for AbhedyaX Demo Provider.
 * Zero-payload side-channel traffic analysis across 5 observable dimensions.
 */

import {
  MetadataExposureResult,
  MetadataExposureDimension,
  ExposureLevel,
} from "@/types/securityTwin";
import { CANONICAL_ANALYSES_MAP } from "./analyses";

export function getDemoMetadataExposure(analysisId: string): MetadataExposureResult {
  const analysis = CANONICAL_ANALYSES_MAP[analysisId] || CANONICAL_ANALYSES_MAP["AX-2026-00428"];
  const feats = (analysis.traffic.features as Record<string, unknown>) || {};
  const isAnomaly = analysis.traffic.predicted_class === "Unknown" || analysis.analysis_id === "AX-2026-00424";

  const dimensions: MetadataExposureDimension[] = [
    {
      name: "Timing Observability",
      value: isAnomaly ? 78.0 : 45.0,
      indicator: isAnomaly ? "High" : "Moderate",
      description: isAnomaly
        ? "Periodic burst cadence and fixed-interval pacing provide high side-channel observability"
        : "Standard packet spacing with natural human interaction jitter",
      key_features: ["inter_arrival_pattern", "jitter", "packet_rate"],
    },
    {
      name: "Size Pattern Observability",
      value: isAnomaly ? 82.0 : 58.0,
      indicator: isAnomaly ? "High" : "Moderate",
      description: "Packet size distributions reveal framing patterns without payload awareness",
      key_features: ["packet_size_pattern", "mean_length", "packet_size_variance"],
    },
    {
      name: "Directionality Observability",
      value: 65.0,
      indicator: "Moderate",
      description: "Forward vs reverse packet volume ratio distinguishes client-server roles",
      key_features: ["directionality", "byte_asymmetry", "flow_ratio"],
    },
    {
      name: "Burst Pattern Observability",
      value: isAnomaly ? 84.0 : 55.0,
      indicator: isAnomaly ? "High" : "Moderate",
      description: isAnomaly
        ? "Synthetic micro-burst clustering deviates significantly from organic traffic"
        : "Standard buffer chunk delivery and sporadic event triggers",
      key_features: ["burst_count", "burst_rate", "burst_variance"],
    },
    {
      name: "Flow Duration Observability",
      value: 55.0,
      indicator: "Moderate",
      description: "Persistence of session connection window and SA lifetime association",
      key_features: ["session_duration_seconds", "cumulative_wire_packets"],
    },
  ];

  const avg = Math.round(dimensions.reduce((acc, d) => acc + d.value, 0) / dimensions.length);
  const ind: ExposureLevel = avg >= 70 ? "High" : avg >= 45 ? "Moderate" : "Low";

  return {
    analysis_id: analysis.analysis_id,
    indicator: ind,
    score: avg,
    dimensions,
    explanation: `Metadata observability indicator (${avg}/100) measures flow fingerprinting visibility based on packet sizes, timing, and directionality without decrypting ESP payloads.`,
    provenance: analysis.source.type === "pcap" ? "Observed" : "Simulated",
    features_summary: feats,
    traffic_classification: {
      predicted_class: analysis.traffic.predicted_class,
      confidence: analysis.traffic.confidence,
      classification_mode: analysis.traffic.classification_mode || "simulated",
    },
    disclaimer: "Metadata exposure indicator measures traffic flow fingerprinting visibility based on packet sizes, cadence, and directionality. It does NOT decrypt ESP payloads or weaken AES/IPsec cryptographic protection.",
  };
}
