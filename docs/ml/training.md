# AbhedyaX Model Training Pipeline

## 1. Training Workflow Overview

The AbhedyaX ML training pipeline (`services/ml/training/train.py`) executes a reproducible end-to-end model training, validation, and benchmarking process.

```
       +------------------------------------+
       |   services/testbed captures (30)   |
       +------------------------------------+
                         |
                         v
       +------------------------------------+
       |  Feature Extraction (28 features)  |
       +------------------------------------+
                         |
                         v
       +------------------------------------+
       | Stratified Capture Split (60/20/20)|
       +------------------------------------+
                         |
                         v
       +------------------------------------+
       |  StandardScaler Feature Alignment  |
       +------------------------------------+
                         |
       +-----------------+-----------------+
       |                 |                 |
       v                 v                 v
[Logistic Reg]    [Random Forest]      [XGBoost]
       |                 |                 |
       +-----------------+-----------------+
                         |
                         v
       +------------------------------------+
       | Multi-Metric Evaluation & Ranking  |
       |  (Macro F1, Accuracy, B. Accuracy) |
       +------------------------------------+
                         |
                         v
       +------------------------------------+
       | Selected Champion: RandomForest    |
       |  - Validation Macro F1: 77.8%      |
       |  - Test Macro F1: 61.1%            |
       +------------------------------------+
                         |
                         v
       +------------------------------------+
       | Registry Serialization:            |
       |  - traffic_classifier_v1.0.0.joblib|
       |  - traffic_classifier_v1.0.0.json  |
       +------------------------------------+
```

---

## 2. Candidate Models Benchmarked

### A. Dummy Baseline (`DummyClassifier`)
- **Strategy**: Most frequent class prediction.
- **Purpose**: Establishes the absolute lower bound of classification intelligence.
- **Performance**: Validation Accuracy: 16.7%, Validation Macro F1: 4.8%.

### B. Logistic Regression (`LogisticRegression`)
- **Hyperparameters**: `max_iter=1000`, `class_weight='balanced'`, `C=1.0`, `solver='lbfgs'`.
- **Purpose**: Fast, interpretable linear classification baseline with standard scaling.
- **Performance**: Validation Accuracy: 66.7%, Validation Macro F1: 55.6%.

### C. Random Forest Classifier (`RandomForestClassifier`) — Selected Model
- **Hyperparameters**: `n_estimators=100`, `max_depth=8`, `class_weight='balanced'`, `random_state=42`.
- **Purpose**: Non-linear ensemble model resilient to multi-collinear timing and size features.
- **Performance**: Validation Accuracy: **83.3%**, Validation Macro F1: **77.8%**; Test Accuracy: **66.7%**, Test Macro F1: **61.1%**.

### D. XGBoost Classifier (`XGBClassifier`)
- **Hyperparameters**: `n_estimators=100`, `max_depth=6`, `learning_rate=0.1`, `objective='multi:softprob'`.
- **Performance**: Validation Accuracy: 50.0%, Validation Macro F1: 36.1%.

---

## 3. Serialization and Model Registry

Trained models are packaged as self-contained `ModelBundle` instances containing:
1. **Fitted Model**: Scikit-learn estimator instance.
2. **Fitted Scaler**: `StandardScaler` fitted exclusively on the training split.
3. **Artifact Metadata**: JSON manifest including model version, algorithm, canonical feature list, class labels, abstention threshold (`0.55`), and validation/test metrics.

Persisted locations:
- `services/ml/artifacts/models/traffic_classifier_v1.0.0.joblib`
- `services/ml/artifacts/models/traffic_classifier_v1.0.0.json`
