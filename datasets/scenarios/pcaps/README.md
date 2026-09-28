# AbhedyaX Benchmark IPsec Packet Captures (Datasets)

This directory contains synthesized, reproducible benchmark packet captures designed for automated testing, protocol dissection validation, and security auditing within the AbhedyaX framework.

> [!NOTE]
> All captures in this directory are non-confidential, non-proprietary synthetic traces generated in a controlled sandbox using RFC standard byte layouts and Scapy. They contain no real-world enterprise infrastructure data, private keys, or actual sensitive cleartext.

## Capture Catalog & Provenance

### 1. `modern-ikev2-aes256gcm.pcap`
- **Protocol:** IKEv2 (RFC 7296) + ESP (RFC 4303)
- **Encryption:** AES-256-GCM (Transform ID: 20, Key Length: 256)
- **Integrity / PRF:** None (AEAD) / HMAC-SHA2-256 (Transform ID: 5)
- **Key Exchange:** Diffie-Hellman Group 19 (256-bit random ECP, Transform ID: 19)
- **Payload:** Authenticated ESP frames carrying simulated site-to-site VPN payload.
- **Expected Compliance:** High compliance (Score: ~95, Grade: A, Risk: Low).

### 2. `legacy-ikev1-3des-sha1.pcap`
- **Protocol:** IKEv1 Main Mode (RFC 2409) + ESP (RFC 4303)
- **Encryption:** 3DES-CBC (Attribute: 5)
- **Integrity:** HMAC-SHA1 (Attribute: 2)
- **Authentication:** Pre-Shared Key (Attribute: 1)
- **Key Exchange:** Diffie-Hellman Group 2 (MODP-1024, Attribute: 2)
- **SA Lifetime:** 86,400 seconds (24 hours)
- **Expected Compliance:** Deprecated suite (Score: < 50, Grade: F, Risk: Critical).
  - Triggers `IKE-001` (Legacy IKEv1), `CRYPTO-001` (Sweet32 3DES Vulnerability), `DH-001` (Insecure DH Group 2), `AUTH-002` (Deprecated SHA-1), and `LIFE-001` (Excessive 24h SA lifetime).

### 3. `weak-ikev2-des-md5.pcap`
- **Protocol:** IKEv2 (RFC 7296) + ESP
- **Encryption:** Single DES (Transform ID: 2)
- **Integrity / PRF:** HMAC-MD5 (Transform ID: 1)
- **Key Exchange:** Diffie-Hellman Group 1 (MODP-768, Transform ID: 1)
- **Expected Compliance:** Severe compliance failure (Grade: F, Risk: Critical).

### 4. `natt-esp-traffic.pcap`
- **Protocol:** UDP Encapsulated IPsec / NAT-Traversal (RFC 3948)
- **Ports:** UDP 4500 <-> UDP 4500
- **Payload:** Encapsulated ESP frames with valid non-zero SPI headers.
- **Expected Compliance:** Correct NAT-Traversal detection and SPI extraction.
