# AbhedyaX Datasets & Benchmark Capture Files

AbhedyaX includes a standardized suite of synthetic and testbed-generated IPsec packet captures (.pcap / .pcapng) designed for deterministic testing, protocol extraction validation, and machine learning model training.

---

## 1. Benchmark Scenarios PCAP Catalog

All PCAP files are located at [`datasets/scenarios/pcaps/`](file:///home/gnx/Projects/SIH/abhedyax/datasets/scenarios/pcaps/):

| Capture Filename | Protocol & Modes | Cryptographic Suite | Key Exchange | Expected Score & Risk |
| :--- | :--- | :--- | :--- | :--- |
| `modern-ikev2-aes256gcm.pcap` | IKEv2 / ESP Tunnel | AES-256-GCM / AEAD | DH Group 19 (ECP-256) | **Score $\ge 90$** (Grade A, Low Risk) |
| `legacy-ikev1-3des-sha1.pcap` | IKEv1 Main Mode / ESP | 3DES-CBC / HMAC-SHA1 | DH Group 2 (MODP-1024) | **Score $< 50$** (Grade F, Critical Risk) |
| `weak-ikev2-des-md5.pcap` | IKEv2 / ESP Tunnel | Single DES / HMAC-MD5 | DH Group 1 (MODP-768) | **Score $< 50$** (Grade F, Critical Risk) |
| `natt-esp-traffic.pcap` | IKEv2 NAT-T (UDP 4500) | AES-256-CBC / HMAC-SHA256 | DH Group 14 (MODP-2048) | NAT-Traversal Verified |

### Safety & Privacy Guarantee
All files in `datasets/scenarios/pcaps/` are non-confidential synthetic traces. They contain no real-world enterprise infrastructure credentials, private keys, or proprietary data.

---

## 2. Testing PCAPs with the CLI or API

You can upload and analyze any of the benchmark PCAPs directly via `curl`:

```bash
# Upload modern IKEv2 capture
curl -X POST http://localhost:8000/api/v1/analyses/upload \
  -F "file=@datasets/scenarios/pcaps/modern-ikev2-aes256gcm.pcap"

# Upload legacy insecure IKEv1 capture
curl -X POST http://localhost:8000/api/v1/analyses/upload \
  -F "file=@datasets/scenarios/pcaps/legacy-ikev1-3des-sha1.pcap"
```

Or via the Web UI at `http://localhost:3000/analyze?mode=pcap` by dragging and dropping any `.pcap` or `.pcapng` file.

---

## 3. strongSwan Testbed Generated Captures

The strongSwan testbed orchestrator generates multi-flow labeled captures with paired ground-truth JSON files in:
- `services/testbed/generated/pcaps/`
- `services/testbed/generated/ground_truth/`
- `services/testbed/generated/dataset_manifest.json`

Each capture contains paired ground-truth attributes (initiator SPI, responder SPI, negotiated cipher, auth method, DH group, and application traffic profile) used for automated validation against the AbhedyaX protocol analyzer.
