"""Dataset management package for AbhedyaX ML service."""

from services.ml.src.dataset.loader import (
    load_dataset_from_directory,
    load_dataset_from_manifest,
    samples_to_polars,
)
from services.ml.src.dataset.schema import DatasetReport, DatasetSample
from services.ml.src.dataset.splitter import extract_matrices, split_dataset_by_capture
from services.ml.src.dataset.validator import validate_dataset

__all__ = [
    "DatasetReport",
    "DatasetSample",
    "extract_matrices",
    "load_dataset_from_directory",
    "load_dataset_from_manifest",
    "samples_to_polars",
    "split_dataset_by_capture",
    "validate_dataset",
]
