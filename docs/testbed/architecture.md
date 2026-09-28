# AbhedyaX strongSwan Testbed Architecture

## 1. System Purpose & Core Philosophy

The **AbhedyaX Controlled IPsec Testbed** is a sandboxed data-generation, security benchmarking, and validation environment designed specifically for the National Technical Research Organisation (NTRO) Problem Statement (ID: 26160). 

It operates under strict architectural separation:
1. **Isolated Data Generation**: The testbed is completely decoupled from the production packet-analysis engine (`RealAnalysisEngine` / `MockAnalysisEngine`).
2. **Ground-Truth Determinism**: Ground-truth descriptions describe what the testbed was configured to produce, never copying analyzer outputs.
3. **Dual Execution Modes**: Real strongSwan orchestration in Linux network namespaces where privileges and software permit, alongside a deterministic high-fidelity Simulation Mode for developer and restricted environments.

---

## 2. End-to-End Orchestration Flow

```
  ┌─────────────────────────────────────────────────────────────┐
  │                   1. Scenario Definition                    │
  │    (IKEv1/v2, Cipher, DH Group, Lifetime, Traffic Profile)   │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 2. Environment & Pre-checks                 │
  │     (Linux, CAP_NET_ADMIN, strongSwan, tcpdump, TShark)     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 3. Network Provisioning                     │
  │   ns_initiator (192.168.10.2) ── WAN (veth) ── ns_responder │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                4. strongSwan Configuration                  │
  │    (Generated swanctl.conf / ipsec.conf / ipsec.secrets)    │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                  5. Tunnel Establishment                    │
  │        (IKE Handshake & Child SA Security Association)      │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌──────────────────────────────┴──────────────────────────────┐
  │                                                             │
  ▼                                                             ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│    6. Traffic Injection      │              │      7. Packet Capture       │
│ (ICMP, Web, VoIP, Stream)    │ ───────────> │  (tcpdump / scapy pcapng)    │
└──────────────────────────────┘              └──────────────┬───────────────┘
                                                             │
                                                             ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 8. Ground-Truth Recording                   │
  │      (Generated schema record: SA parameters + Traffic)     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                9. AbhedyaX Analysis Engine                  │
  │         (TShark Dissection & Security Rules Audit)          │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 10. Verification & Scoring                  │
  │     (Ground-Truth vs Observed Attribute Accuracy Match)     │
  └─────────────────────────────────────────────────────────────┘
```

---

## 3. Network Topology Specification

The testbed isolates traffic within 3 Linux network namespaces connected by virtual ethernet (`veth`) pairs:

- **`ns_initiator`**: Simulates the roaming VPN client.
  - IP: `192.168.10.2/24` (veth_init)
  - Protected Subnet: `10.100.1.0/24`
  - Default Gateway: `192.168.10.1`

- **`ns_router`**: Simulates the untrusted WAN intermediate network.
  - Interfaces: `veth_r_init` (`192.168.10.1/24`), `veth_r_resp` (`192.168.20.1/24`)
  - Capture Point: tcpdump captures encrypted traffic at `veth_r_init`.
  - IP forwarding is enabled exclusively inside this namespace.

- **`ns_responder`**: Simulates the corporate enterprise VPN gateway.
  - IP: `192.168.20.2/24` (veth_resp)
  - Protected Subnet: `10.100.2.0/24`
  - Default Gateway: `192.168.20.1`

---

## 4. Component Layout

```
services/testbed/
├── configs/strongswan/     # Generated swanctl and ipsec templates
├── generated/
│   ├── analysis/           # Validation comparison outputs
│   ├── ground_truth/       # Labelled ground-truth metadata
│   └── pcaps/              # Captured PCAPNG captures
├── scenarios/definitions/  # Canonical scenario JSON specifications
├── src/
│   ├── capture/            # tcpdump and synthetic packet capture
│   ├── cli/                # Command-line interface tool
│   ├── config/             # Path resolvers and environment models
│   ├── dataset_generator.py# 30-sample ML dataset generator
│   ├── ground_truth/       # Ground-truth schema and generator
│   ├── network/            # Linux namespaces, veth pairs, routing
│   ├── orchestrator.py     # Master multi-stage state machine
│   ├── scenarios/          # Built-in presets and definition loaders
│   ├── strongswan/         # swanctl.conf / ipsec.conf generator
│   ├── traffic/            # 6 controlled traffic profile generators
│   └── validation/         # Expected vs observed accuracy validator
└── tests/                  # Unit and integration pytest suite
```
