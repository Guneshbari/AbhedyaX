/**
 * End-to-End Verification Test for AbhedyaX Demo Data Provider & Canonical Baselines.
 * Run with: npx tsx tests/test-demo-provider.ts
 */

import { DemoDataProvider } from "../src/lib/providers/demoProvider";
import { getActiveDataProvider, getEffectiveDataMode } from "../src/lib/providers";

async function runTests() {
  console.log("=================================================");
  console.log("  AbhedyaX Demo Data Provider Verification Suite ");
  console.log("=================================================\n");

  const provider = new DemoDataProvider();
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // 1. Health & Environment Diagnostics
  console.log("[1/11] Testing Health & Environment Diagnostics...");
  const health = await provider.checkHealth();
  assert(health.status === "ok" && health.engine_mode === "demo", "checkHealth() returns demo engine status");

  const env = await provider.getEnvironmentStatus();
  assert(env.engine_mode === "demo" && env.supported_formats.includes(".pcap"), "getEnvironmentStatus() returns valid pcap support");

  // 2. Canonical Scenario Analyses
  console.log("\n[2/11] Testing Canonical Scenario Coverage & Scores...");
  const analyses = await provider.getAnalyses();
  assert(analyses.length === 6, `getAnalyses() returns exactly 6 canonical analyses (got ${analyses.length})`);

  const expectedCases = [
    { id: "AX-2026-00428", score: 100, grade: "A", risk: "Low", cipher: "AES-256-GCM" },
    { id: "AX-2026-00427", score: 25, grade: "F", risk: "Critical", cipher: "AES-128-CBC" },
    { id: "AX-2026-00426", score: 80, grade: "B", risk: "Moderate", cipher: "AES-256-CBC" },
    { id: "AX-2026-00425", score: 100, grade: "A", risk: "Low", cipher: "AES-256-GCM" },
    { id: "AX-2026-00424", score: 95, grade: "A", risk: "Low", cipher: "AES-256-GCM" },
    { id: "AX-2026-00423", score: 100, grade: "A", risk: "Low", cipher: "ChaCha20-Poly1305" },
  ];

  for (const c of expectedCases) {
    const a = await provider.getAnalysis(c.id);
    assert(
      a.security.score === c.score &&
        a.security.grade === c.grade &&
        a.security.risk_level === c.risk &&
        a.cryptography.encryption === c.cipher,
      `Scenario ${c.id}: Score=${a.security.score}/${c.score}, Grade=${a.security.grade}, Risk=${a.security.risk_level}, Cipher=${a.cryptography.encryption}`
    );
  }

  // Verify AX-2026-00427 specifically does NOT mention 3DES
  const legacy = await provider.getAnalysis("AX-2026-00427");
  assert(
    legacy.cryptography.encryption === "AES-128-CBC" &&
      legacy.cryptography.authentication === "HMAC-SHA1" &&
      legacy.security.replay_protection === false,
    "AX-2026-00427 strictly uses AES-128-CBC/HMAC-SHA1 with disabled anti-replay"
  );

  // 3. Dashboard Data
  console.log("\n[3/11] Testing Dashboard Data Aggregates...");
  const dashboard = await provider.getDashboardData();
  assert(dashboard.kpis.length === 4, `Dashboard has 4 KPI metrics (got ${dashboard.kpis.length})`);
  assert(dashboard.recentAnalyses.length === 6, `Dashboard has 6 recent analyses (got ${dashboard.recentAnalyses.length})`);
  assert(dashboard.riskDistribution.length === 4, "Dashboard risk distribution has 4 bands (Low, Moderate, High, Critical)");

  // 4. Security Twin
  console.log("\n[4/11] Testing Security Twin Baseline Alignment...");
  const twin28 = await provider.getSecurityTwin("AX-2026-00428");
  assert(
    twin28.alignment.overall === "aligned" && twin28.alignment.mismatched_count === 0,
    "AX-2026-00428 Security Twin is fully aligned (0 mismatches)"
  );

  const twin27 = await provider.getSecurityTwin("AX-2026-00427");
  assert(
    twin27.alignment.overall === "drifted" && twin27.alignment.mismatched_count >= 4,
    `AX-2026-00427 Security Twin reflects critical drift (${twin27.alignment.mismatched_count} mismatches)`
  );

  // 5. Configuration Drift
  console.log("\n[5/11] Testing Configuration Drift & Presets...");
  const presets = await provider.getDemoComparisons();
  assert(presets.length === 4, `getDemoComparisons() returns 4 canonical presets (got ${presets.length})`);

  const drift28vs27 = await provider.getDrift("AX-2026-00428", "AX-2026-00427");
  assert(
    drift28vs27.security_impact.score_delta === -75,
    `Enterprise vs Legacy score delta is exactly -75 (100 -> 25) (got ${drift28vs27.security_impact.score_delta})`
  );

  const drift28vs26 = await provider.getDrift("AX-2026-00428", "AX-2026-00426");
  assert(
    drift28vs26.security_impact.score_delta === -20,
    `Enterprise vs Moderate score delta is exactly -20 (100 -> 80) (got ${drift28vs26.security_impact.score_delta})`
  );

  // 6. Metadata Exposure
  console.log("\n[6/11] Testing Zero-Payload Metadata Exposure...");
  const meta24 = await provider.getMetadataExposure("AX-2026-00424");
  assert(meta24.dimensions.length === 5, "Metadata exposure assesses exactly 5 side-channel dimensions");
  assert(meta24.disclaimer.includes("does NOT decrypt"), "Metadata exposure includes explicit zero-payload disclaimer");

  // 7. Auditable Reasoning
  console.log("\n[7/11] Testing Auditable Reasoning Deduction Chains...");
  const reasoning27 = await provider.getReasoning("AX-2026-00427");
  assert(
    reasoning27.total_deduction === 75 && reasoning27.final_score === 25,
    `Reasoning for AX-2026-00427 shows base 100 - 75 = 25 (chains: ${reasoning27.chains.length})`
  );

  // 8. Posture Timeline
  console.log("\n[8/11] Testing Posture Timeline...");
  const posture = await provider.getPostureTimeline();
  assert(posture.timeline.length === 6, `Posture timeline contains all 6 sessions (got ${posture.timeline.length})`);
  assert(posture.transitions.length === 5, `Posture timeline contains 5 transition deltas (got ${posture.transitions.length})`);

  // 9. AI Encrypted Traffic Intelligence
  console.log("\n[9/11] Testing AI Traffic Intelligence Status...");
  const ml = await provider.getActiveMLModel();
  assert(
    ml.status === "active" && Boolean(ml.algorithm?.includes("Random Forest")) && ml.metrics?.validation_macro_f1 === 0.942,
    `ML model status is active with algorithm=${ml.algorithm}, F1=${ml.metrics?.validation_macro_f1}`
  );

  // 10. strongSwan Testbed
  console.log("\n[10/11] Testing strongSwan Testbed Subsystem...");
  const testbedStatus = await provider.getTestbedStatus();
  assert(Boolean(testbedStatus.strongswan_version?.includes("5.9")), `Testbed reports strongSwan 5.9.x (got ${testbedStatus.strongswan_version})`);

  const testbedScenarios = await provider.getTestbedScenarios();
  assert(testbedScenarios.length === 4, `Testbed provides 4 benchmark scenarios (got ${testbedScenarios.length})`);

  const testbedRun = await provider.createTestbedRun({ scenario_id: "demo-enterprise-ikev2" });
  assert(testbedRun.state === "Completed" && testbedRun.progress === 100, "Demo testbed run executes and reaches 100% completed");

  // 11. Reports & Active Provider Bridge
  console.log("\n[11/11] Testing Offline Reports & Provider Bridge...");
  const execReport = await provider.getExecutiveReport("AX-2026-00428");
  assert(execReport.includes("AX-2026-00428") && execReport.includes("Executive"), "Executive report generates offline HTML dossier");

  const techReport = await provider.getTechnicalReport("AX-2026-00428");
  assert(techReport.includes("AX-2026-00428") && techReport.includes("Technical"), "Technical report generates offline HTML audit");

  const activeProvider = getActiveDataProvider();
  assert(activeProvider.name === "DemoDataProvider", `Default active provider is DemoDataProvider (got ${activeProvider.name})`);
  assert(getEffectiveDataMode() === "demo", `Default effective mode is 'demo' (got ${getEffectiveDataMode()})`);

  console.log("\n=================================================");
  console.log(`  Tests Completed: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution threw unhandled exception:", err);
  process.exit(1);
});
