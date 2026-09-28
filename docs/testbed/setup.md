# AbhedyaX Testbed Setup and Environment Guide

## 1. Operating Modes

The testbed operates in two modes:

| Feature | Real Mode | Simulation Mode |
|---|---|---|
| **Underlying VPN** | strongSwan charon daemon | Deterministic high-fidelity emulation |
| **Network Isolation**| Linux network namespaces (`ip netns`) | Virtual simulated network links |
| **Traffic Injector** | Real namespace socket generators | Pure-Python deterministic generator |
| **Capture Engine** | `tcpdump` on transit interface | Synthesized dissectable PCAP/PCAPNG |
| **Prerequisites** | Linux, root/CAP_NET_ADMIN, strongSwan, tcpdump | Any OS, Python 3.11+, no root |
| **Analysis Engine** | `RealAnalysisEngine` via TShark | `RealAnalysisEngine` or `MockAnalysisEngine` |

---

## 2. Real Mode Host Prerequisites

To run in **Real strongSwan Mode**, ensure the following host packages are installed:

### Arch Linux / Omarchy
```bash
sudo pacman -S strongswan tcpdump iproute2 wireshark-cli
```

### Ubuntu / Debian
```bash
sudo apt update
sudo apt install -y strongswan strongswan-swanctl tcpdump iproute2 tshark
```

### Verification
Verify tool availability using the testbed CLI:
```bash
python -m services.testbed.src.cli.main check
```

---

## 3. Privilege Requirements

Creating network namespaces (`ip netns add`) and capturing on virtual interfaces requires `CAP_NET_ADMIN` or root privileges:

```bash
# Allow tcpdump execution without full root (recommended):
sudo setcap cap_net_raw,cap_net_admin=eip $(which tcpdump)

# Execute testbed with elevated permissions for real network creation:
sudo python -m services.testbed.src.cli.main run ts-secure-ikev2-gcm --mode real
```

When run by an unprivileged user, the testbed automatically detects missing capabilities and falls back to **Simulation Mode**, ensuring uninterrupted development and testing.
