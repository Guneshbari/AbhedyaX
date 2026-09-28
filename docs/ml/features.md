# AbhedyaX Canonical Feature Inventory

## 1. Zero-Payload Feature Philosophy

AbhedyaX extracts 28 statistical and behavioral features from encrypted IPsec Encapsulating Security Payload (ESP) streams. Under standard IPsec operation (RFC 4303), the inner transport header (TCP/UDP), IP addresses, and application payload are completely encrypted.

However, the following properties remain directly observable on the wire:
1. **Outer IP packet length**: ESP packet length is strictly proportional to inner plaintext packet length plus ESP overhead (SPI, Sequence Number, IV, Padding, Next Header, ICV/Authentication Tag).
2. **Packet arrival timestamps**: Timing of packet transmissions reflects client request pacing, codec intervals (e.g., VoIP 20ms frame pacing), human idle times, or bulk transfer throughput.
3. **Directionality & ESP SPI**: The Security Parameter Index (SPI) identifies distinct unidirectional Security Associations (SAs). Coupled with source/destination IP pairs, bidirectional flows are reconstructed without breaking encryption.

---

## 2. Feature Definitions (28 Canonical Features)

### A. Packet Length Distribution (11 Features)
Derived strictly from the `length` field of intercepted ESP packets.

| Feature Name | Type | Formula / Description | Physical Interpretation |
|---|---|---|---|
| `packet_count` | `float` | $N = \sum 1$ | Total packet count in the session/flow window. |
| `mean_packet_size` | `float` | $\mu_L = \frac{1}{N} \sum_{i=1}^N L_i$ | Average frame length in bytes. |
| `median_packet_size` | `float` | $\text{Median}(L)$ | 50th percentile of packet sizes. |
| `std_packet_size` | `float` | $\sigma_L = \sqrt{\frac{1}{N} \sum (L_i - \mu_L)^2}$ | Standard deviation; indicates length variance. |
| `min_packet_size` | `float` | $\min(L)$ | Smallest packet (typically keepalives, TCP ACKs). |
| `max_packet_size` | `float` | $\max(L)$ | Largest packet (typically MTU-clamped ~1420 bytes). |
| `packet_size_p10` | `float` | 10th percentile of $L$ | Baseline size for signaling / acknowledgements. |
| `packet_size_p25` | `float` | 25th percentile of $L$ | Lower quartile frame distribution. |
| `packet_size_p50` | `float` | 50th percentile of $L$ | Middle frame distribution. |
| `packet_size_p75` | `float` | 75th percentile of $L$ | Upper quartile frame distribution. |
| `packet_size_p90` | `float` | 90th percentile of $L$ | Bulk transfer frame cluster boundary. |

### B. Temporal & Rate Dynamics (9 Features)
Derived from packet arrival timestamps $t_1, t_2, \dots, t_N$ sorted monotonically.

| Feature Name | Type | Formula / Description | Physical Interpretation |
|---|---|---|---|
| `flow_duration` | `float` | $\Delta T = t_N - t_1$ (seconds) | Total active transmission duration. |
| `mean_inter_arrival_time` | `float` | $\mu_{\text{IAT}} = \frac{1}{N-1} \sum_{i=1}^{N-1} (t_{i+1} - t_i)$ | Mean delay between successive frames. |
| `std_inter_arrival_time` | `float` | $\sigma_{\text{IAT}}$ of $(t_{i+1} - t_i)$ | Jitter / inter-packet variance. |
| `median_inter_arrival_time` | `float` | $\text{Median}(\text{IAT})$ | Robust central tendency of packet delay. |
| `packet_rate` | `float` | $\frac{N}{\Delta T}$ (packets/sec) | Packet throughput density. |
| `byte_rate` | `float` | $\frac{\sum L_i}{\Delta T}$ (bytes/sec) | Bandwidth consumption rate. |
| `iat_p25` | `float` | 25th percentile of IAT | Rapid intra-burst packet spacing. |
| `iat_p50` | `float` | 50th percentile of IAT | Median packet delivery cadence. |
| `iat_p75` | `float` | 75th percentile of IAT | Inter-burst pauses or network idle intervals. |

### C. Directionality & Micro-Burst Dynamics (8 Features)
Derived from directional assignments (Forward = initiator egress, Reverse = responder ingress) and micro-burst clustering (consecutive packets in the same direction separated by $\le 50\text{ ms}$).

| Feature Name | Type | Formula / Description | Physical Interpretation |
|---|---|---|---|
| `forward_packet_count` | `float` | $N_{\text{fwd}}$ | Packets transmitted in initiator $\to$ responder direction. |
| `reverse_packet_count` | `float` | $N_{\text{rev}}$ | Packets transmitted in responder $\to$ initiator direction. |
| `forward_bytes` | `float` | $B_{\text{fwd}} = \sum L_{\text{fwd}}$ | Byte volume transmitted forward. |
| `reverse_bytes` | `float` | $B_{\text{rev}} = \sum L_{\text{rev}}$ | Byte volume transmitted reverse. |
| `direction_ratio` | `float` | $\frac{B_{\text{fwd}}}{B_{\text{rev}} + 1.0}$ | Asymmetry ratio (e.g., video streaming has high asymmetry, VoIP has 1.0). |
| `burst_count` | `float` | Total distinct micro-bursts | Number of clustered directional transmissions. |
| `mean_burst_size` | `float` | $\frac{1}{M} \sum_{j=1}^M \text{burst\_packets}_j$ | Average number of packets per micro-burst. |
| `burst_rate` | `float` | $\frac{\text{burst\_count}}{\Delta T}$ (bursts/sec) | Frequency of application dispatches. |

---

## 3. Class-Specific Feature Profiles

1. **Video Streaming**:
   - High `mean_packet_size` (~1200–1400 bytes).
   - High `direction_ratio` ($B_{\text{rev}} \gg B_{\text{fwd}}$ for download streaming).
   - High `byte_rate`, low `iat_p25`.
2. **VoIP (Audio)**:
   - Clustered small packets (`mean_packet_size` 160–250 bytes).
   - `mean_inter_arrival_time` centered around 20 ms.
   - Symmetrical bidirectional traffic (`direction_ratio` $\approx 1.0$).
3. **Web (HTTP/2 / HTTP/3)**:
   - Bimodal packet sizes (small TCP ACKs vs full MTU frames).
   - High burstiness with human think-time idle gaps (`iat_p75` > 0.5s).
4. **Messaging**:
   - Low `packet_count`, low `burst_rate`.
   - Long inter-arrival times between dispatches.
5. **Email**:
   - Transactional handshake bursts followed by moderate bulk transfer.
6. **ICMP**:
   - Fixed packet sizes (64–84 bytes), strictly identical forward and reverse counts.
