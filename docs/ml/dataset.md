# AbhedyaX Dataset Methodology

## 1. Dataset Generation and Provenance

To train supervised models for encrypted IPsec VPN traffic classification without violating operational secrecy or relying on unverified synthetic distributions, AbhedyaX uses the controlled **strongSwan Testbed** (`services/testbed`) established in Phase 3.

### Ground-Truth Recording Pipeline
1. **Network Namespace Isolation**:
   - Simulated gateway pairs (`ns_client` and `ns_server`) run isolated strongSwan IPsec tunnels across virtual Ethernet pairs (`veth`).
2. **Deterministic Application Generation**:
   - `services/testbed/src/traffic/generator.py` dispatches controlled application traffic corresponding to 6 target classes:
     - `Web`: HTTP/1.1 and HTTP/2 curl downloads with synthetic web objects and HTML assets.
     - `Video`: Continuous high-bitrate media streaming simulation with high-MTU frame bursts.
     - `VoIP`: Simulated RTP voice packets with fixed 160-byte payload bursts at deterministic 20ms cadence.
     - `Email`: Transactional SMTP/IMAP protocol exchanges with command-response interleaving.
     - `Messaging`: Short intermittent burst exchanges with human think-time idle pauses.
     - `ICMP`: Constant interval ping echo request/reply packets.
3. **Packet Capture & Manifest Recording**:
   - Raw wire traffic is captured via `tcpdump` into `.pcap` files.
   - Synchronously, ground-truth metadata (`dataset_manifest.json` and scenario JSON files) records exact tunnel parameters, cryptographic suites, algorithms, and application classes.

---

## 2. Dataset Schema and Manifest

The dataset is ingested through `services/ml/src/dataset/loader.py` into canonical `DatasetSample` models:

```json
{
  "sample_id": "cap_video_01",
  "scenario_id": "scen_video_stream",
  "traffic_class": "Video",
  "pcap_path": "services/testbed/generated/captures/cap_video_01.pcap",
  "ground_truth_path": "services/testbed/generated/ground_truth/gt_video_01.json",
  "features": {
    "packet_count": 520.0,
    "mean_packet_size": 1340.2,
    "direction_ratio": 0.082,
    "flow_duration": 4.12
  },
  "label": "Video"
}
```

---

## 3. Data Leakage Prevention

A critical flaw in naive encrypted network traffic classification is **packet-level splitting**, where packets from the same TCP or ESP flow appear in both train and test sets, causing artificial 99%+ accuracy due to memorized sequence numbers or port numbers.

AbhedyaX strictly prevents data leakage via **capture-level splitting** (`split_dataset_by_capture`):
- All packets and flows belonging to a specific capture session are allocated exclusively to either the **Training set (60%)**, **Validation set (20%)**, or **Test set (20%)**.
- No session or capture ID is ever shared across splits.
- Splits are stratified across all 6 classes to maintain class balance:
  - Total captures: 30
  - Train: 18 captures (3 per class)
  - Validation: 6 captures (1 per class)
  - Test: 6 captures (1 per class)

---

## 4. Dataset Validation and Integrity

The dataset validator (`services/ml/src/dataset/validator.py`) enforces strict cybersecurity criteria prior to model training:
1. **Label Validity**: Every sample must belong to the approved 6 target classes.
2. **Feature Schema Adherence**: All 28 canonical features must be present and finite numeric values.
3. **Minimum Packet Threshold**: Captures with 0 ESP packets are flagged as corrupted anomalies.
4. **Duplicate Protection**: Unique `sample_id` deduplication prevents sample overcounting.
