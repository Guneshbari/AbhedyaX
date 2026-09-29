import assert from "node:assert";
import { DemoDataProvider } from "../apps/web/src/lib/providers/demoProvider";
import { ApiDataProvider } from "../apps/web/src/lib/providers/apiProvider";
import { CANONICAL_SCENARIOS, CANONICAL_ANALYSES_MAP } from "../apps/web/src/demo";

async function runTests() {
  console.log("=== Testing Standalone Demo Data Providers ===");

  // 1. Test DemoDataProvider
  const demoProvider = new DemoDataProvider();
  assert.strictEqual(demoProvider.name, "DemoDataProvider");
  assert.strictEqual(demoProvider.mode, "demo");

  const health = await demoProvider.checkHealth();
  assert.strictEqual(health.status, "ok");
  assert.strictEqual(health.engine_mode, "demo");

  const dashboard = await demoProvider.getDashboardData();
  assert.ok(dashboard.kpis.length > 0);
  assert.ok(dashboard.recentAnalyses.length >= 6);

  const twin = await demoProvider.getSecurityTwin("AX-2026-00428");
  assert.strictEqual(twin.analysis_id, "AX-2026-00428");
  assert.strictEqual(twin.alignment.overall, "aligned");
  assert.strictEqual(twin.security_impact.risk_score, 100);

  const drift = await demoProvider.getDrift("AX-2026-00428", "AX-2026-00427");
  assert.ok(drift.security_impact.score_delta < 0, "expected negative score delta");
  assert.strictEqual(drift.baseline_analysis_id, "AX-2026-00428");
  assert.strictEqual(drift.current_analysis_id, "AX-2026-00427");

  const metadata = await demoProvider.getMetadataExposure("AX-2026-00424");
  assert.strictEqual(metadata.analysis_id, "AX-2026-00424");
  assert.ok(metadata.dimensions.length >= 5);

  const posture = await demoProvider.getPostureTimeline();
  assert.ok(posture.timeline.length >= 6, "expected at least 6 timeline entries");
  assert.ok(posture.total_sessions >= 6, "expected at least 6 sessions");

  const ml = await demoProvider.getActiveMLModel();
  assert.ok(ml.status === "ready" || ml.status === "active", "expected ml model to be active or ready");
  assert.ok((ml.metrics?.test_accuracy ?? 0) >= 0.9);

  const testbedStatus = await demoProvider.getTestbedStatus();
  assert.strictEqual(testbedStatus.default_mode, "simulation");

  console.log("✓ DemoDataProvider: All methods return valid canonical data immediately.");

  // 2. Test ApiDataProvider fallback when offline
  const apiProvider = new ApiDataProvider();
  assert.strictEqual(apiProvider.name, "ApiDataProvider");
  assert.strictEqual(apiProvider.mode, "api");

  // ApiDataProvider should cleanly fallback to demo data rather than throwing
  const apiHealth = await apiProvider.checkHealth();
  assert.ok(apiHealth.status === "ok");

  const apiTwin = await apiProvider.getSecurityTwin("AX-2026-00428");
  assert.strictEqual(apiTwin.analysis_id, "AX-2026-00428");
  assert.strictEqual(apiTwin.alignment.overall, "aligned");

  const apiDrift = await apiProvider.getDrift("AX-2026-00428", "AX-2026-00427");
  assert.ok(apiDrift.security_impact.score_delta < 0, "expected negative score delta");
  assert.strictEqual(apiDrift.baseline_analysis_id, "AX-2026-00428");

  const apiMetadata = await apiProvider.getMetadataExposure("AX-2026-00424");
  assert.strictEqual(apiMetadata.analysis_id, "AX-2026-00424");

  const apiPosture = await apiProvider.getPostureTimeline();
  assert.ok(apiPosture.timeline.length >= 6, "expected at least 6 timeline entries");

  console.log("✓ ApiDataProvider: Fallback mechanisms gracefully return canonical data without hanging or crashing.");

  console.log("=== All Standalone Demo Provider Tests Passed Successfully! ===");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
