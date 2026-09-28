# Labelled IPsec Dataset Specification

## 1. Overview

AbhedyaX produces labelled datasets designed to train machine learning models for encrypted traffic classification (Phase 4). The dataset couples raw network captures (`.pcapng`) with deterministic ground-truth JSON metadata.

---

## 2. Directory Layout

- **PCAP Captures**: `services/testbed/generated/pcaps/{scenario_id}_{run_id}_{timestamp}.pcapng`
- **Ground Truth**: `services/testbed/generated/ground_truth/{scenario_id}_{run_id}.json`
- **Dataset Manifest**: `services/testbed/generated/dataset_manifest.json`

---

## 3. Ground-Truth JSON Schema

```json
{
  "scenario_id": "ts-secure-ikev2-gcm",
  "generated_at": "2026-09-28T13:58:03.364744+00:00",
  "configuration": {
    "ike_version": "IKEv2",
    "mode": "Tunnel",
    "ip_version": "IPv4",
    "encryption": "AES-256-GCM",
    "authentication": "AEAD",
    "dh_group": "DH Group 19",
    "pfs": true,
    "replay_protection": true,
    "sa_lifetime_seconds": 28800
  },
  "traffic": {
    "class": "ICMP",
    "duration_seconds": 30.0
  },
  "capture": {
    "file": "/absolute/path/to/capture.pcapng",
    "format": "pcapng",
    "packet_count": 44
  },
  "expected_analysis": {
    "protocol": "IPsec",
    "ike_version": "IKEv2",
    "mode": "Tunnel",
    "ip_version": "IPv4",
    "encryption": "AES-256-GCM",
    "authentication": "AEAD",
    "dh_group": "DH Group 19",
    "pfs": true
  }
}
```

---

## 4. Benchmark Matrix (30 Captures)

The complete benchmark dataset matrix consists of **5 VPN Scenarios** combined with **6 Traffic Classes**:

| Scenarios | ICMP | Web | Email | VoIP | Video | Messaging | Total |
|---|---|---|---|---|---|---|---|
| `ts-secure-ikev2-gcm` | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| `ts-aes256-cbc` | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| `ts-weak-dh` | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| `ts-legacy-ikev1` | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| `ts-secure-ipv6` | 1 | 1 | 1 | 1 | 1 | 1 | 6 |
| **Totals** | 5 | 5 | 5 | 5 | 5 | 5 | **30** |

To generate the full dataset:
```bash
python -m services.testbed.src.cli.main dataset-generate
```
