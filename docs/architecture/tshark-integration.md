# TShark Integration Guide & Dissection Internals

## 1. TShark Installation & Execution Requirements

AbhedyaX leverages the **TShark (Wireshark CLI)** engine as its primary protocol dissector. TShark provides protocol decoders for thousands of RFC specifications, including complex IKEv1, IKEv2, ESP, and AH encapsulation modes.

### Installation

- **Arch Linux / Omarchy:**
  ```bash
  sudo pacman -S wireshark-cli
  ```
- **Debian / Ubuntu:**
  ```bash
  sudo apt-get update && sudo apt-get install -y tshark
  ```
- **Red Hat / CentOS / Fedora:**
  ```bash
  sudo dnf install -y wireshark-cli
  ```

---

## 2. Subprocess Security & Invocation Standards

To protect against command injection and resource exhaustion:
1. **No Shell Invocations:** The Python executor uses `asyncio.create_subprocess_exec` with argument arrays. `shell=True` is strictly forbidden.
2. **Configurable Execution Timeouts:** Invocations are guarded by `asyncio.wait_for` enforcing `TSHARK_TIMEOUT_SECONDS` (default: 120s). If the subprocess hangs, it is terminated immediately.
3. **Separate Stream Capture:** `stdout` and `stderr` are read independently to prevent output mixing.
4. **Structured JSON Output:**
   ```bash
   tshark -r <pcap_path> -T json --no-duplicate-keys
   ```
   - `-T json`: Decodes the full protocol tree in standard JSON.
   - `--no-duplicate-keys`: Appends sequential index suffixes (`_1`, `_2`) to repeated transform attributes inside IKE proposals, preventing Python `json.loads` from dropping earlier cryptographic transforms.

---

## 3. Dissected Protocol Fields

| Protocol | TShark Dissector Field | RFC Equivalent / Description |
|---|---|---|
| **IKE Version** | `ike.version` / `ike.version_tree.ike.mjver` | Major and minor IKE version |
| **IKE Exchange** | `ike.exchangetype` | IKE_SA_INIT (34), IKE_AUTH (35), Main Mode (2) |
| **SPIs** | `ike.ispi`, `ike.rspi` | Initiator and Responder Security Parameter Indexes |
| **IKEv2 Ciphers** | `ike.tf.id.encr`, `ike.ike2.attr.key_length` | Transform Type 1 (e.g. AES-CBC, AES-GCM) |
| **IKEv2 Integrity** | `ike.tf.id.integ` | Transform Type 3 (e.g. HMAC-SHA2-256) |
| **IKEv2 PRF** | `ike.tf.id.prf` | Transform Type 2 (Pseudo-random function) |
| **Diffie-Hellman** | `ike.tf.id.ke` | Transform Type 4 (Key exchange group ID) |
| **IKEv1 Ciphers** | `ike.ike.attr.encryption_algorithm` | Attribute 1 (3DES, AES, DES) |
| **IKEv1 Hash** | `ike.ike.attr.hash_algorithm` | Attribute 2 (SHA-1, MD5, SHA-2) |
| **IKEv1 DH Group** | `ike.ike.attr.group_description` | Attribute 4 (MODP-1024, MODP-2048) |
| **IKEv1 Lifetime** | `ike.ike.attr.life_duration` | Attribute 12 (SA lifetime in seconds) |
| **ESP Security** | `esp.spi`, `esp.sequence` | SPI (32-bit hex) and sequence counter |
| **NAT-Traversal** | `udp.port == 4500`, `udpencap` | UDP port 4500 encapsulation |
