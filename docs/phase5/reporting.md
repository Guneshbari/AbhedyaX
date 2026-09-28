# AbhedyaX Security & Audit Reporting Subsystem

## 1. Overview
The AbhedyaX Reporting Subsystem (`services/report-generator`) generates executive and technical reports directly from the canonical `AnalysisResult` data contract.

Reports are produced as **fully self-contained HTML documents** with embedded CSS. This design eliminates complex, error-prone headless browser binaries (e.g. Puppeteer, Playwright, WeasyPrint) while enabling instant, high-fidelity browser PDF generation via native print dialogs (`window.print()` / `Cmd+P` / `Ctrl+P`).

---

## 2. Report Types

### A. Executive Security Assessment Report
Targeted at CISOs, SOC Directors, and Compliance Officers:
- **Visual Score Hero:** 0–100 deterministic security score, letter grade, and operational risk band.
- **Executive Summary:** Plain-English posture diagnosis and business impact overview.
- **VPN Architecture Snapshot:** Protocol mode, NAT traversal status, and session telemetry.
- **Top Cryptographic Findings:** Critical and High severity findings with verified evidence and actionable remediation steps.
- **AI Flow Intelligence:** Zero-payload traffic classification (e.g. Video, VoIP, Web, SSH) with confidence level and candidate distributions.
- **Strategic Remediation Roadmap:** Prioritized checklist for security hardening.
- **Disclaimers:** Explicit disclosure of zero-payload inspection and simulation/real capture status.

### B. Technical Cryptographic & Flow Audit Report
Targeted at Security Engineers, Cryptanalysts, and Compliance Auditors:
- **Full Session Metadata:** Analysis ID, capture file name, frame count, byte volume, and duration.
- **Wire Dissection Telemetry:** Number of observed IKE handshakes, ESP tunnels, and negotiated SPIs.
- **Transform Proposal Matrix:** Phase 1 (IKE SA) and Phase 2 (Child SA) cryptographic proposals evaluated against NIST SP 800-77 Rev. 1 and RFC 8221 standards.
- **Flow Feature Extraction Matrix:** Detailed values for all 28 observable flow features (e.g., packet size mean, variance, IAT mean, directionality ratio).
- **ML Attribution & Explainability:** Top contributing flow features ranked by model importance.
- **Auditable Score Deduction Table:** Complete row-by-row breakdown of every penalty deduction, showing rule ID, severity, deduction points, and mathematical rationale.
- **Testbed Ground-Truth Validation:** Discrepancy checks comparing wire results against kernel-level strongSwan configuration.

---

## 3. Subsystem Architecture & Templates

```
services/report-generator/
├── pyproject.toml               # Pytest configuration
├── static/
│   └── report.css               # Unified SOC styling + @media print overrides
├── templates/
│   ├── executive.html.j2        # Executive assessment template
│   └── technical.html.j2        # Technical audit report template
├── src/
│   ├── __init__.py             # Public functions
│   ├── template_loader.py      # Jinja2 environment with security autoescaping
│   ├── executive_report.py     # generate_executive_report(result)
│   └── technical_report.py     # generate_technical_report(result)
└── tests/
    └── test_report_generator.py # Unit tests across all demo scenarios
```

---

## 4. Print & PDF Styling Architecture

All styles are defined in `static/report.css` and injected inline into `<style>` tags during rendering:
- **Screen View:** Dark SOC interface matching the AbhedyaX dashboard aesthetic (`#0A0D14` background, cyan/indigo accents).
- **Print View (`@media print`):**
  - Background forced to pure white (`#FFFFFF`) with dark text (`#111827`) to save printer ink and ensure clean readability.
  - Interactive action bars, buttons, and external links are automatically hidden (`display: none !important`).
  - Section headers, finding cards, and data tables enforce `break-inside: avoid` to prevent awkward page splits across findings.
  - Page margins set to `1.5cm` with `@page { size: A4 portrait; margin: 1.5cm; }`.

---

## 5. API Endpoints

The FastAPI backend exposes three reporting routes under `/api/v1/analyses/{analysis_id}/report/`:

| Method | Endpoint | Response Type | Content / Header |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analyses/{id}/report/executive` | `text/html` | Standalone Executive HTML with embedded CSS |
| `GET` | `/api/v1/analyses/{id}/report/technical` | `text/html` | Standalone Technical HTML with embedded CSS |
| `GET` | `/api/v1/analyses/{id}/report/json` | `application/json` | Downloadable canonical JSON attachment (`Content-Disposition: attachment; filename="abhedyax_analysis_{id}.json"`) |

### Example cURL Commands
```bash
# View executive report in browser
curl -s http://localhost:8000/api/v1/analyses/AX-2026-00428/report/executive > executive_report.html

# Download canonical JSON export
curl -O -J http://localhost:8000/api/v1/analyses/AX-2026-00428/report/json
```
