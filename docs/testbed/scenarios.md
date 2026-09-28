# Canonical Testbed Scenarios

AbhedyaX defines 5 benchmark scenarios covering modern, legacy, weak, and next-generation IPsec configurations:

---

### 1. `ts-secure-ikev2-gcm` — Secure IKEv2 AES-GCM
- **Protocol**: IKEv2 (Tunnel Mode)
- **IP Version**: IPv4
- **Encryption**: AES-256-GCM (Authenticated Encryption with Associated Data)
- **Integrity**: AEAD built-in GHASH
- **Diffie-Hellman**: DH Group 19 (256-bit Elliptic Curve / ECP-256)
- **PFS**: Enabled
- **Replay Protection**: Enabled (32-packet anti-replay window)
- **SA Lifetime**: 28,800 seconds (8 hours)
- **Expected Risk**: Low (Security Score: 88-96)
- **Rule Violations**: None

---

### 2. `ts-aes256-cbc` — AES-256-CBC with HMAC
- **Protocol**: IKEv2 (Tunnel Mode)
- **IP Version**: IPv4
- **Encryption**: AES-256-CBC
- **Integrity**: HMAC-SHA256
- **Diffie-Hellman**: DH Group 14 (2048-bit MODP)
- **PFS**: Disabled
- **Replay Protection**: Enabled
- **SA Lifetime**: 28,800 seconds
- **Expected Risk**: Medium (Security Score: 65-80)
- **Rule Violations**: `PFS-001` (No Perfect Forward Secrecy), `CRYPTO-002` (Non-AEAD Cipher)

---

### 3. `ts-weak-dh` — Weak Diffie-Hellman Configuration
- **Protocol**: IKEv2 (Tunnel Mode)
- **IP Version**: IPv4
- **Encryption**: AES-128-CBC
- **Integrity**: HMAC-SHA256
- **Diffie-Hellman**: DH Group 2 (1024-bit MODP, Logjam attack vulnerable)
- **PFS**: Disabled
- **Replay Protection**: Enabled
- **SA Lifetime**: 28,800 seconds
- **Expected Risk**: High (Security Score: 40-60)
- **Rule Violations**: `DH-001` (Insecure DH Group <= 1024-bit), `PFS-001`

---

### 4. `ts-legacy-ikev1` — Legacy IKEv1
- **Protocol**: IKEv1 Main Mode (Tunnel Mode)
- **IP Version**: IPv4
- **Encryption**: AES-128-CBC
- **Integrity**: HMAC-SHA1
- **Diffie-Hellman**: DH Group 2 (1024-bit MODP)
- **PFS**: Disabled
- **Replay Protection**: Disabled
- **SA Lifetime**: 86,400 seconds (24 hours)
- **Expected Risk**: Critical (Security Score: 15-35)
- **Rule Violations**: `IKE-001` (Deprecated IKEv1 protocol), `AUTH-001` (SHA-1 integrity), `DH-001`, `LIFE-001` (Excessive SA lifetime)

---

### 5. `ts-secure-ipv6` — Secure IPv6 IPsec
- **Protocol**: IKEv2 (Tunnel Mode)
- **IP Version**: IPv6
- **Encryption**: AES-256-GCM
- **Integrity**: AEAD
- **Diffie-Hellman**: DH Group 20 (384-bit Elliptic Curve / ECP-384)
- **PFS**: Enabled
- **Replay Protection**: Enabled
- **SA Lifetime**: 28,800 seconds
- **Expected Risk**: Low (Security Score: 90-98)
- **Rule Violations**: None
