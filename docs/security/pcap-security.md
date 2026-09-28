# PCAP Ingestion Security & Threat Mitigation

## 1. Threat Model & Principles

Packet captures uploaded by external users represent untrusted binary inputs. The AbhedyaX ingestion pipeline enforces defense-in-depth principles:

1. **Zero Execution of Packet Contents:** Packet contents are purely treated as static binary data. No part of a packet payload is ever executed, evaluated as code, or passed to shell interpreters.
2. **Untrusted Filename Handling & Path Traversal Prevention:**
   - Client-provided filenames (`file.filename`) are never used as local disk paths.
   - Server-side paths are generated using cryptographic random tokens:
     ```python
     safe_id = uuid.uuid4().hex[:12]
     safe_base = os.path.basename(orig_name).replace(" ", "_")
     saved_filename = f"{safe_id}_{safe_base}"
     ```
3. **Strict Size Quotas:**
   - Ingestion enforces a hard upload ceiling (`MAX_PCAP_SIZE_MB`, default: 250MB).
   - If an upload exceeds this limit during streaming, the stream is aborted, the partial file is securely deleted, and an HTTP 413 response is returned.
4. **Header Sanity & Format Validation:**
   - Magic bytes are checked before passing the file to TShark:
     - `\xd4\xc3\xb2\xa1` or `\xa1\xb2\xc3\xd4` (Standard libpcap microsecond)
     - `\x4d\x3c\xb2\xa1` or `\xa1\xb2\x3c\x4d` (libpcap nanosecond)
     - `\x0a\x0d\x0d\x0a` (PCAP Next Generation Section Header Block)
5. **No Filesystem Leakage:**
   - Server internal file paths (`/home/gnx/Projects/...`) are never exposed in REST API responses or frontend error toasts.
6. **Subprocess Sandboxing:**
   - Subprocesses are executed without shell expansion (`shell=False`).
   - Standard input is closed to prevent interactive prompt hangs.
   - Explicit timeouts prevent denial-of-service via malformed packet loops.
