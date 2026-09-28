# AbhedyaX ML Inference Engine

## 1. Inference Architecture

The AbhedyaX ML inference engine (`services/ml/src/inference/classifier.py`) provides real-time, low-latency classification of encrypted IPsec traffic flows.

```
+-------------------------------------------------------------+
| RealAnalysisEngine (TShark Ingestion)                       |
+-------------------------------------------------------------+
                               |
                               v (Stream of parsed packets)
+-------------------------------------------------------------+
| UnifiedFeatureExtractor.extract_from_packets()              |
|  - Computes 28 statistical features in memory               |
|  - Latency: < 5 ms for 5,000 packets                        |
+-------------------------------------------------------------+
                               |
                               v (28-dimensional vector)
+-------------------------------------------------------------+
| InferencePreprocessor.transform()                           |
|  - Standard scaling alignment from ModelBundle              |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Scikit-Learn Model predict_proba()                          |
|  - Class probability distribution                           |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Confidence Evaluation: max(probability)                     |
|  - If max(prob) >= 0.55: Predicted class = argmax(prob)     |
|  - If max(prob) < 0.55:  Predicted class = "Unknown"        |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Feature Explainability Engine                               |
|  - Extracts top 5 features by (feature_value * importance)  |
|  - Generates human-readable evidence for SOC analysts       |
+-------------------------------------------------------------+
```

---

## 2. Abstention Threshold Logic

In high-stakes national cybersecurity operations, an erroneous high-confidence prediction is significantly more dangerous than a transparent acknowledgement of uncertainty.

### Operational Abstention Rule
- **Threshold**: $\tau = 0.55$ (`DEFAULT_ABSTENTION_THRESHOLD`).
- When the classifier evaluates an anomalous, sparse, or uncharacteristic traffic pattern:
  $$\max_{c} P(y = c \mid \mathbf{x}) < \tau \implies \hat{y} = \text{"Unknown"}$$
- When abstention occurs:
  - The classification mode is flagged as `"unknown"` or `"ml"`.
  - The UI presents an amber status badge indicating `"Abstained (Low Confidence)"`.
  - The SOC analyst is guided to perform manual packet inspection for proprietary tunneling or covert channels.

---

## 3. Explainability and Attribution

For every classification decision, `generate_feature_explanations` returns the top contributing features:

```json
[
  {
    "feature": "direction_ratio",
    "value": 0.082,
    "importance": 0.0636
  },
  {
    "feature": "burst_rate",
    "value": 14.2,
    "importance": 0.0580
  },
  {
    "feature": "mean_packet_size",
    "value": 1340.2,
    "importance": 0.0516
  }
]
```

These features directly populate the **Why this classification?** panel in the AbhedyaX dashboard, visualizing the exact physical properties that prompted the model's decision.

---

## 4. API and Engine Integration

The inference classifier is integrated into `apps/api/app/engines/real.py`:

```python
from services.ml.src.features.extractor import UnifiedFeatureExtractor
from services.ml.src.inference.classifier import traffic_classifier

# In RealAnalysisEngine._build_traffic_intelligence:
extractor = UnifiedFeatureExtractor()
features = extractor.extract_from_packets(esp_packets)
pred = traffic_classifier.predict(features)

return TrafficIntelligence(
    predicted_class=pred.predicted_class,
    confidence=pred.confidence,
    candidate_classes=[
        TrafficCandidateClass(class_name=c.traffic_class, confidence=c.probability)
        for c in pred.candidate_classes
    ],
    features=features,
    model={"name": pred.model.name, "version": pred.model.version},
    explanation=[
        SupportingFeature(feature=e.feature, value=e.value, importance=e.importance)
        for e in pred.explanation
    ],
    classification_mode=pred.classification_mode,
)
```

The active model metadata is queryable via:
- `GET /api/v1/analyses/ml/model`
- Consumed live by the `/ai-intelligence` dashboard interface.
