"""Evaluation utility evaluating serialized models on test data."""

import json
import logging
from pathlib import Path
from typing import Optional
import click

from services.ml.src.config.settings import CANONICAL_FEATURES, MODELS_DIR
from services.ml.src.dataset.loader import load_dataset_from_manifest
from services.ml.src.dataset.splitter import extract_matrices, split_dataset_by_capture
from services.ml.src.models.evaluation import evaluate_classifier
from services.ml.src.models.registry import load_model_artifact

logger = logging.getLogger("abhedyax.ml.eval")


@click.command()
@click.option("--model-path", type=click.Path(exists=True), default=None, help="Path to joblib artifact")
def evaluate_cmd(model_path: Optional[str]):
    """Evaluate a trained model artifact on held-out test data."""
    if not model_path:
        # Default to latest in MODELS_DIR
        models = sorted(MODELS_DIR.glob("*.joblib"), key=lambda p: p.stat().st_mtime, reverse=True)
        if not models:
            click.echo("No model artifacts found in artifacts/models/. Please train a model first.", err=True)
            return
        target_path = models[0]
    else:
        target_path = Path(model_path)

    click.echo(f"Loading model from: {target_path.name}")
    bundle = load_model_artifact(target_path)
    click.echo(f"Model: {bundle.metadata.model_name} ({bundle.metadata.model_version}) | Algorithm: {bundle.metadata.algorithm}")

    samples = load_dataset_from_manifest()
    _, _, test_s = split_dataset_by_capture(samples, test_ratio=0.2, val_ratio=0.2)
    X_test, y_test = extract_matrices(test_s, CANONICAL_FEATURES)

    if bundle.scaler:
        X_test = bundle.scaler.transform(X_test)

    eval_res = evaluate_classifier(bundle.model, X_test, y_test, CANONICAL_FEATURES)

    click.echo("\n================ Evaluation Results ================")
    click.echo(f"  Accuracy:          {eval_res['accuracy'] * 100:.2f}%")
    click.echo(f"  Balanced Accuracy: {eval_res['balanced_accuracy'] * 100:.2f}%")
    click.echo(f"  Macro F1:          {eval_res['macro_f1'] * 100:.2f}%")
    click.echo(f"  Weighted F1:       {eval_res['weighted_f1'] * 100:.2f}%")
    click.echo("---------------- Per-Class Metrics -----------------")
    for cls_name, m in eval_res["per_class_metrics"].items():
        click.echo(
            f"  {cls_name:<12} Precision: {m['precision']:.2f}  Recall: {m['recall']:.2f}  F1: {m['f1_score']:.2f} (Support: {m['support']})"
        )
    click.echo("---------------- Top Features ----------------------")
    for feat, imp in list(eval_res["feature_importance"].items())[:5]:
        click.echo(f"  {feat:<25} Importance: {imp:.4f}")
    click.echo("====================================================\n")


if __name__ == "__main__":
    evaluate_cmd()
