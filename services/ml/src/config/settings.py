"""Configuration and path definitions for the AbhedyaX ML pipeline."""

from pathlib import Path
from typing import List


def resolve_ml_base_dir() -> Path:
    # services/ml/src/config/settings.py -> services/ml
    return Path(__file__).resolve().parent.parent.parent


ML_BASE_DIR = resolve_ml_base_dir()
PROJECT_ROOT = ML_BASE_DIR.parent.parent

# Storage paths
ARTIFACTS_DIR = ML_BASE_DIR / "artifacts"
MODELS_DIR = ARTIFACTS_DIR / "models"
PREPROCESSORS_DIR = ARTIFACTS_DIR / "preprocessors"
METRICS_DIR = ARTIFACTS_DIR / "metrics"
REPORTS_DIR = ARTIFACTS_DIR / "reports"

# Dataset sources from Phase 3 testbed
TESTBED_DIR = PROJECT_ROOT / "services" / "testbed"
DATASET_PCAPS_DIR = TESTBED_DIR / "generated" / "pcaps"
DATASET_GT_DIR = TESTBED_DIR / "generated" / "ground_truth"
DATASET_MANIFEST_FILE = TESTBED_DIR / "generated" / "dataset_manifest.json"

# Ensure essential output dirs exist
for d in [MODELS_DIR, PREPROCESSORS_DIR, METRICS_DIR, REPORTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Target traffic classes
TARGET_CLASSES: List[str] = [
    "ICMP",
    "Web",
    "Email",
    "VoIP",
    "Video",
    "Messaging",
]

# Classification thresholds
DEFAULT_ABSTENTION_THRESHOLD = 0.55
UNKNOWN_CLASS = "Unknown"

# Canonical feature list (28 features)
CANONICAL_FEATURES: List[str] = [
    # Packet size features (6)
    "packet_count",
    "mean_packet_size",
    "median_packet_size",
    "std_packet_size",
    "min_packet_size",
    "max_packet_size",
    # Temporal & rate features (6)
    "flow_duration",
    "mean_inter_arrival_time",
    "std_inter_arrival_time",
    "median_inter_arrival_time",
    "packet_rate",
    "byte_rate",
    # Directionality features (5)
    "forward_packet_count",
    "reverse_packet_count",
    "forward_bytes",
    "reverse_bytes",
    "direction_ratio",
    # Burst features (3)
    "burst_count",
    "mean_burst_size",
    "burst_rate",
    # Packet size percentiles (5)
    "packet_size_p10",
    "packet_size_p25",
    "packet_size_p50",
    "packet_size_p75",
    "packet_size_p90",
    # IAT percentiles (3 key percentiles for robust timing)
    "iat_p25",
    "iat_p50",
    "iat_p75",
]
