/**
 * Canonical Report Fixtures for AbhedyaX Demo Provider.
 * Self-contained HTML report strings rendered from deterministic analysis fixtures.
 */

import { CANONICAL_ANALYSES_MAP } from "./analyses";

export function getDemoReportHtml(analysisId: string, type: "executive" | "technical"): string {
  const analysis = CANONICAL_ANALYSES_MAP[analysisId] || CANONICAL_ANALYSES_MAP["AX-2026-00428"];
  const isExec = type === "executive";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AbhedyaX ${isExec ? "Executive Security Assessment" : "Technical Audit Report"} - ${analysis.analysis_id}</title>
  <style>
    body { font-family: ui-monospace, SFMono-Regular, monospace; background: #FAF8F5; color: #000; padding: 24px; line-height: 1.5; }
    .container { max-width: 900px; margin: 0 auto; background: #FFF; border: 3px solid #000; box-shadow: 6px 6px 0px #000; padding: 32px; }
    .badge { display: inline-block; background: #FFE600; color: #000; border: 2px solid #000; padding: 4px 10px; font-weight: 900; margin-bottom: 12px; }
    h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 0 0 12px 0; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; border: 2px solid #000; }
    th { background: #FFE600; border: 1px solid #000; padding: 8px 12px; text-align: left; }
    td { border: 1px solid #000; padding: 8px 12px; }
    .score { font-size: 36px; font-weight: 900; background: #FFE600; border: 2px solid #000; display: inline-block; padding: 8px 20px; margin: 12px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">OFFICIAL // ${isExec ? "EXECUTIVE POSTURE" : "DEEP TECHNICAL AUDIT"}</div>
    <h1>${isExec ? "Executive VPN Security Assessment" : "Technical IPsec Protocol & Wire Audit"}</h1>
    <p>Session ID: <strong>${analysis.analysis_id}</strong> | Target: <strong>${analysis.source.name}</strong></p>
    <div class="score">${analysis.security.score} / 100 (Grade ${analysis.security.grade} - ${analysis.security.risk_level} Risk)</div>
    
    <h2>Cryptographic Parameters</h2>
    <table>
      <thead>
        <tr><th>Parameter</th><th>Value</th><th>Standard</th></tr>
      </thead>
      <tbody>
        <tr><td>IKE Protocol</td><td>${analysis.vpn.ike_version}</td><td>RFC 7296</td></tr>
        <tr><td>Symmetric Cipher</td><td>${analysis.cryptography.encryption}</td><td>NIST SP 800-77</td></tr>
        <tr><td>Diffie-Hellman</td><td>${analysis.cryptography.dh_group}</td><td>RFC 8221</td></tr>
        <tr><td>PFS</td><td>${analysis.cryptography.pfs ? "Enabled" : "Disabled"}</td><td>RFC 7296</td></tr>
        <tr><td>Anti-Replay</td><td>${analysis.security.replay_protection ? "Active" : "Disabled"}</td><td>RFC 4303</td></tr>
      </tbody>
    </table>

    <h2>Security Findings (${analysis.findings.length})</h2>
    ${analysis.findings
      .map(
        (f) => `<div style="border: 2px solid #000; padding: 12px; margin-bottom: 10px; background: #FAF8F5;">
        <strong>[${f.id}] ${f.title} (${f.severity})</strong>
        <p style="margin: 6px 0;">${f.description}</p>
        <div style="background: #FFE600; padding: 6px 10px; font-weight: bold; border: 1px solid #000;">Recommendation: ${f.recommendation}</div>
      </div>`
      )
      .join("")}

    <p style="margin-top: 30px; font-size: 11px; border-top: 2px solid #000; padding-top: 12px;">
      AbhedyaX Zero-Payload Security Assessment Framework • NTRO Problem 26160
    </p>
  </div>
</body>
</html>`;
}
