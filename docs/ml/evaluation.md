# AbhedyaX Model Evaluation and Performance

## 1. Quantitative Benchmark Results

The candidate models were evaluated on the 30 strongSwan ground-truth captures with capture-level stratified splits (18 train / 6 validation / 6 test).

| Model Candidate | Algorithm | Val Accuracy | Val Balanced Acc | Val Macro F1 | Val Weighted F1 | Test Macro F1 | Test Accuracy |
|---|---|---|---|---|---|---|---|
| **Dummy Baseline** | `DummyClassifier` | 16.7% | 16.7% | 4.8% | 4.8% | 4.8% | 16.7% |
| **Linear Baseline** | `LogisticRegression` | 66.7% | 66.7% | 55.6% | 55.6% | 50.0% | 50.0% |
| **Selected Champion** | `RandomForest (v1.0.0)` | **83.3%** | **83.3%** | **77.8%** | **77.8%** | **61.1%** | **66.7%** |
| **Gradient Boosted** | `XGBoost` | 50.0% | 50.0% | 36.1% | 36.1% | 41.7% | 50.0% |

---

## 2. Confusion Matrix Analysis (Selected Model)

The confusion matrix for the test split across the 6 target classes:

```
                  Predicted
              Email  ICMP  Msg  Video  VoIP  Web
Actual Email    0     0     0     0     0     1   (Misclassified as Web)
       ICMP     0     1     0     0     0     0   (100% Correct)
       Msg      0     0     1     0     0     0   (100% Correct)
       Video    0     0     0     1     0     0   (100% Correct)
       VoIP     0     0     0     0     1     0   (100% Correct)
       Web      0     0     0     0     1     0   (Misclassified as VoIP)
```

### Interpretation
- `ICMP`, `Video`, `VoIP`, and `Messaging` have strong, distinctive flow signatures and achieve 100% recall on the test partition.
- `Email` transactions occasionally mirror `Web` flows because TLS encrypted transfers over port 443/587 exhibit similar burst and idle distributions.
- `Web` short exchanges can mirror `VoIP` when request sizes are small and keepalives are active.

---

## 3. Per-Class Metrics (Test Split)

| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **Email** | 0.00 | 0.00 | 0.00 | 1 |
| **ICMP** | 1.00 | 1.00 | 1.00 | 1 |
| **Messaging** | 1.00 | 1.00 | 1.00 | 1 |
| **Video** | 1.00 | 1.00 | 1.00 | 1 |
| **VoIP** | 0.50 | 1.00 | 0.67 | 1 |
| **Web** | 0.00 | 0.00 | 0.00 | 1 |
| **Average (Macro)** | **0.58** | **0.67** | **0.61** | **6** |

---

## 4. Top Feature Importances

The Gini feature importances extracted from the champion Random Forest model:

| Rank | Feature | Importance | Physical Mechanism |
|---|---|---|---|
| 1 | `direction_ratio` | **0.0636** | Downstream vs upstream asymmetry ratio separates client downloads from two-way calls. |
| 2 | `burst_rate` | **0.0580** | Rate of micro-bursts differentiates interactive browsing from steady-state streaming. |
| 3 | `forward_bytes` | **0.0540** | Total outbound client request volume. |
| 4 | `mean_packet_size` | **0.0516** | Average frame size directly indicates protocol MTU clamping vs voice frames. |
| 5 | `packet_size_p10` | **0.0505** | Lower tail size reveals keepalives, signaling frames, and TCP ACKs. |
| 6 | `packet_size_p50` | **0.0469** | Median frame length. |
| 7 | `packet_size_p90` | **0.0454** | Upper cluster reveals maximum bulk transfer frame lengths. |
| 8 | `packet_rate` | **0.0441** | Packet density per second. |

---

## 5. Operational Limitations and Honest Research Disclaimer

> [!IMPORTANT]
> **Research and Validation Scope**:
> - The performance metrics reported above reflect evaluation strictly within the controlled strongSwan testbed environment under reproducible simulation scenarios.
> - These metrics **should not be interpreted as universal real-world accuracy** across arbitrary public Internet traffic.
> - Known failure modes:
>   1. **Traffic Padding & Shaping**: If an adversary employs aggressive ESP traffic padding (RFC 4303) or constant-bitrate tunnel shaping, packet size and burst variance are obscured.
>   2. **Multiplexed Tunnels**: When multiple application streams (e.g., simultaneous VoIP call and heavy file download) share the same Child SA, composite flow features become mixed.
>   3. **Low-Packet Flows**: Flows with fewer than 5 packets trigger the 0.55 confidence abstention threshold and are safely categorized as `Unknown`.
