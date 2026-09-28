"""Model evaluation metrics and reporting."""

from typing import Any, Dict, List, Optional
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)


def evaluate_classifier(
    model: Any,
    X: np.ndarray,
    y_true: np.ndarray,
    feature_names: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Compute rigorous evaluation metrics across predictions.
    Outputs macro F1, balanced accuracy, confusion matrix, per-class metrics,
    and feature importance.
    """
    y_pred = model.predict(X)

    classes = sorted(list(set(np.concatenate([y_true, y_pred]))))

    acc = float(accuracy_score(y_true, y_pred))
    bal_acc = float(balanced_accuracy_score(y_true, y_pred))

    macro_f1 = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))
    macro_prec = float(precision_score(y_true, y_pred, average="macro", zero_division=0))
    macro_rec = float(recall_score(y_true, y_pred, average="macro", zero_division=0))

    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred, labels=classes)

    # Per-class metrics
    class_report_dict = classification_report(
        y_true, y_pred, labels=classes, output_dict=True, zero_division=0
    )

    per_class_metrics = {}
    for c in classes:
        if c in class_report_dict:
            per_class_metrics[c] = {
                "precision": round(class_report_dict[c]["precision"], 4),
                "recall": round(class_report_dict[c]["recall"], 4),
                "f1_score": round(class_report_dict[c]["f1-score"], 4),
                "support": int(class_report_dict[c]["support"]),
            }

    # Feature importances
    feature_importance: Dict[str, float] = {}
    if hasattr(model, "feature_importances_") and model.feature_importances_ is not None and feature_names:
        fi = model.feature_importances_
        if len(fi) == len(feature_names):
            pairs = sorted(zip(feature_names, fi), key=lambda x: x[1], reverse=True)
            feature_importance = {name: round(float(imp), 4) for name, imp in pairs}

    return {
        "accuracy": round(acc, 4),
        "balanced_accuracy": round(bal_acc, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "macro_precision": round(macro_prec, 4),
        "macro_recall": round(macro_rec, 4),
        "classes": classes,
        "confusion_matrix": cm.tolist(),
        "per_class_metrics": per_class_metrics,
        "feature_importance": feature_importance,
    }
