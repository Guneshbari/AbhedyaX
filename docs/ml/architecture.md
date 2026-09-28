# AbhedyaX ML Architecture

## 1. Overview and Core Principle

The AbhedyaX Machine Learning subsystem provides supervised traffic intelligence and application classification over encrypted IPsec VPN tunnels.

### Zero-Payload Inspection Principle
In adherence to modern privacy regulations, operational cybersecurity doctrine, and cryptographic integrity:
- **Zero payload decryption**: The system operates strictly without accessing decrypted IPsec ESP payload content, private keys, plaintext application streams, or credentials.
- **Observable metadata only**: Classification relies solely on side-channel flow characteristics observable on the network wire: packet lengths, inter-arrival times, burstiness, flow durations, directional volume, and outer IP/ESP header fields.

```
       +-----------------------------------------------------------+
       |                  Encrypted IPsec Wire                     |
       |  [Outer IP Header | ESP Header (SPI + Seq) | Encrypted]   |
       +-----------------------------------------------------------+
                                     |
                                     v
                       +---------------------------+
                       | Unified Feature Extractor |
                       |  - Packet Lengths (11)    |
                       |  - Temporal Timing (9)    |
                       |  - Direction & Burst (8)  |
                       +---------------------------+
                                     |
                                     v 28-dimensional vector
                       +---------------------------+
                       |   StandardScaler Norm     |
                       +---------------------------+
                                     |
                                     v
                       +---------------------------+
                       |    Trained Classifier     |
                       |   (RandomForest / XGB)    |
                       +---------------------------+
                                     |
                         +-----------+-----------+
                         |                       |
                 Confidence >= 0.55       Confidence < 0.55
                         |                       |
                         v                       v
               Predicted Class Profile       Abstain to "Unknown"
               + Feature Explanations        (Operational Safety)
```

---

## 2. Subsystem Separation of Concerns

The AbhedyaX architecture strictly separates data generation from the core analysis pipeline:

1. **Testbed (`services/testbed`)**:
   - Controlled strongSwan IPsec simulation and ground-truth generation environment.
   - Operates in isolated Linux network namespaces.
   - Creates reproducible scenarios with cryptographic policies and traffic generators (HTTP, RTP/VoIP, Video streaming, IMAP/SMTP, Matrix chat, ICMP).
   - Generates PCAP captures and metadata manifests with verifiable ground truth.

2. **Feature Extraction (`services/ml/src/features`)**:
   - Dissects IPsec packet streams from PCAP or real-time TShark JSON packets.
   - Reconstructs unidirectional and bidirectional IPsec flows identified by `(src_ip, dst_ip, spi)`.
   - Computes 28 canonical statistical features without inspecting application payloads.

3. **Model Training & Registry (`services/ml/src/models`)**:
   - Implements baseline, linear, ensemble, and gradient-boosted models.
   - Computes multi-class evaluation metrics (Macro F1, Balanced Accuracy, Confusion Matrix).
   - Manages versioned model artifacts with companion JSON metadata in `services/ml/artifacts/models/`.

4. **Inference & Explainability (`services/ml/src/inference`)**:
   - Serves low-latency predictions via `TrafficClassifier`.
   - Implements confidence-based abstention (default threshold 0.55).
   - Computes per-feature attribution weights (`generate_feature_explanations`) for SOC analyst explainability.

5. **Backend Engine Integration (`apps/api`)**:
   - `RealAnalysisEngine` pipes TShark-decoded packets through `UnifiedFeatureExtractor` and `TrafficClassifier`.
   - Populates the canonical `AnalysisResult.traffic` schema consumed identically by the Next.js frontend whether running in simulation or live ML mode.
