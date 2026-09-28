# AbhedyaX Security Architecture & Hardening Safeguards

## 1. Overview
As a defensive cybersecurity assessment tool, AbhedyaX must exemplify strict secure coding practices. The framework processes untrusted PCAP files and executes complex network dissection engines. This document details the defense-in-depth protections implemented across the platform.

---

## 2. Core Security Controls

### A. Zero-Payload Inspection & Cryptographic Isolation
- **No Payload Decryption:** AbhedyaX never decrypts ESP ciphertext (IP protocol 50).
- **Zero Key Material Handling:** The system has no mechanisms to accept or store pre-shared keys, private RSA/ECDSA keys, or DH private exponents.
- **Privacy Preservation:** Sensitive inner application data (HTTP requests, credentials, DNS lookups, VoIP audio payloads) cannot be leaked because it is never decrypted or accessed.

### B. Secure PCAP Ingestion & File Upload Defenses
Implemented in `apps/api/app/api/routes/analyses.py` (`upload_pcap`):
1. **Extension Whitelisting:** Strictly rejects files not ending in `.pcap` or `.pcapng`.
2. **Path Traversal Protection:** User-supplied filenames are sanitized using `os.path.basename` and prefixed with a secure UUIDv4 hex string (`safe_id = uuid.uuid4().hex[:12]`). The original path is discarded.
3. **Streaming Size Limit Enforcement:** Files are read in 64 KB chunks up to `ABHEDYAX_MAX_PCAP_SIZE_MB` (default: 50 MB). If the threshold is exceeded, the partial file is removed and HTTP 413 is returned.
4. **Isolated Storage:** Captures are saved strictly inside the configured `ABHEDYAX_PCAPS_DIR` with restricted permissions.

### C. Subprocess Execution & Command Injection Prevention
Implemented in `apps/api/app/packet/tshark.py`:
1. **No Shell Invocations:** Subprocesses are launched via `asyncio.create_subprocess_exec` using explicit argument lists (`argv`), completely bypassing shell parsing (`shell=False`).
2. **Strict Timeouts:** Dissection subprocesses enforce a hard timeout (`settings.tshark_timeout_seconds`, default: 60s) preventing denial-of-service through malicious infinite loop captures.
3. **Structured Fields (`-T fields`):** TShark is executed with explicit field selectors rather than freeform text printing, avoiding regex parsing vulnerabilities.

### D. Report Generation & XSS Prevention
Implemented in `services/report-generator/src/template_loader.py`:
1. **Automatic HTML Escaping:** Jinja2 environment configured with `autoescape=jinja2.select_autoescape(["html", "xml"])`.
2. **Self-Contained Content Security:** All styling is embedded inline (`<style>`). Reports make no external requests to third-party CDNs, fonts, or tracking scripts.
3. **Print Sanitization:** Interactive print scripts use simple `window.print()` triggers without eval or dynamic code execution.

### E. API Security & CORS Policy
1. **Explicit CORS Origins:** Only trusted frontend domains configured in `ABHEDYAX_CORS_ORIGINS` are granted access with credentials.
2. **Pydantic Validation:** All input payloads and output responses are validated against strict Pydantic v2 schemas.

### F. Security Twin & Metadata Exposure Safeguards
1. **Zero Payload Decryption Guarantee:** The Metadata Exposure engine operates strictly on 5 observable outer network dimensions (packet timing, sizes, directionality, burst cadences, and session duration). Inner ESP packet payloads are never inspected, decrypted, or decrypted keys required.
2. **Strict Provenance Labeling:** The Security Twin engine transparently tags every data field with an auditable provenance indicator (`wire_observed`, `inferred_from_headers`, `derived_rule`, `simulated_benchmark`), ensuring synthetic data or administrative policies are never falsely presented as wire-observed ground truth.
3. **No Key Storage:** The Security Twin models administrative cryptographic policy baselines abstractly (e.g. cipher names, DH groups) without accepting, storing, or handling actual private keys, certificates, or pre-shared keys.

