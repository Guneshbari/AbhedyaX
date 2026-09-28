"""Encrypted Traffic Metadata Exposure Engine.

Evaluates what behavioral and application characteristics can be inferred
from encrypted ESP flow metadata (timing, packet sizes, directionality, bursts)
strictly without decrypting payload data.
"""

from typing import Dict, Any, List, Optional
from app.models.analysis import AnalysisResult
from services.security_twin.src.models.metadata_exposure import (
    MetadataExposureDimension,
    MetadataExposureResult,
    ExposureLevel,
)


def compute_dimension_scores(
    features: Dict[str, Any],
    predicted_class: str,
) -> List[MetadataExposureDimension]:
    """Calculate the 5 standard metadata observability dimensions."""
    # 1. Timing Observability (inter-arrival cadence, jitter, periodic polling)
    inter_arrival = str(features.get("inter_arrival_pattern", "")).lower()
    if "burst" in inter_arrival or "anomalous" in inter_arrival:
        timing_score = 78.0
        timing_ind: ExposureLevel = "High"
        timing_desc = "Distinctive periodic burst cadence provides high observability for traffic correlation."
    elif "interactive" in inter_arrival:
        timing_score = 52.0
        timing_ind: ExposureLevel = "Moderate"
        timing_desc = "Variable human interactive pauses partially expose application rhythm."
    elif "regular" in inter_arrival or "uniform" in inter_arrival:
        timing_score = 35.0
        timing_ind: ExposureLevel = "Low"
        timing_desc = "Uniform packet pacing successfully obscures underlying application events."
    else:
        timing_score = 45.0
        timing_ind: ExposureLevel = "Moderate"
        timing_desc = "Standard temporal spacing observable without individual payload awareness."

    # 2. Size Pattern Observability (packet size distribution, MTU padding vs variable frames)
    size_pat = str(features.get("packet_size_pattern", "")).lower()
    if "highly_variable" in size_pat or "video" in predicted_class.lower():
        size_score = 82.0
        size_ind: ExposureLevel = "High"
        size_desc = "Unpadded variable packet sizes exhibit distinctive application payload fingerprinting."
    elif "moderate_variable" in size_pat or "bimodal" in size_pat:
        size_score = 58.0
        size_ind: ExposureLevel = "Moderate"
        size_desc = "Moderate packet length distribution reveals request-response sizing profiles."
    elif "uniform" in size_pat:
        size_score = 25.0
        size_ind: ExposureLevel = "Low"
        size_desc = "Uniform cipher block sizing and padding obscure application payload boundaries."
    else:
        size_score = 50.0
        size_ind: ExposureLevel = "Moderate"
        size_desc = "Standard packet length histograms permit statistical clustering."

    # 3. Directionality Observability (forward vs reverse volume and asymmetry)
    directionality = str(features.get("directionality", "")).lower()
    if "server_heavy" in directionality or "download" in directionality:
        dir_score = 74.0
        dir_ind: ExposureLevel = "High"
        dir_desc = "Asymmetric downlink-dominant transfer clearly separates media streaming from interactive chat."
    elif "client_dominant" in directionality:
        dir_score = 65.0
        dir_ind: ExposureLevel = "Moderate"
        dir_desc = "Upstream-heavy transmission profile identifies data upload or beaconing."
    elif "bidirectional" in directionality:
        dir_score = 48.0
        dir_ind: ExposureLevel = "Moderate"
        dir_desc = "Balanced bidirectional flow matches conversational voice or interactive sessions."
    else:
        dir_score = 40.0
        dir_ind: ExposureLevel = "Moderate"
        dir_desc = "Directional volume ratios observable on external network taps."

    # 4. Burst Pattern Observability (micro-burst clustering, peak rates)
    if "burst" in inter_arrival or "anomalous" in inter_arrival:
        burst_score = 84.0
        burst_ind: ExposureLevel = "High"
        burst_desc = "Pronounced micro-burst clusters distinguish non-interactive bulk transfers."
    elif "VoIP" in predicted_class:
        burst_score = 30.0
        burst_ind: ExposureLevel = "Low"
        burst_desc = "Isochronous packet delivery with negligible burst variance."
    else:
        burst_score = 55.0
        burst_ind: ExposureLevel = "Moderate"
        burst_desc = "Standard TCP window burst cycles observable in packet sequence arrival times."

    # 5. Flow Duration Observability (session lifespan, idle timers)
    duration = features.get("session_duration_seconds", 600)
    try:
        dur_val = float(duration)
    except (ValueError, TypeError):
        dur_val = 600.0

    if dur_val > 1800:
        dur_score = 70.0
        dur_ind: ExposureLevel = "High"
        dur_desc = f"Long-lived persistent session ({int(dur_val)}s) facilitates extended traffic pattern profiling."
    elif dur_val > 300:
        dur_score = 55.0
        dur_ind: ExposureLevel = "Moderate"
        dur_desc = f"Typical workflow duration ({int(dur_val)}s) provides sufficient statistical sample size."
    else:
        dur_score = 38.0
        dur_ind: ExposureLevel = "Low"
        dur_desc = f"Ephemeral session ({int(dur_val)}s) restricts behavioral sampling window."

    return [
        MetadataExposureDimension(
            name="Timing Observability",
            value=timing_score,
            indicator=timing_ind,
            description=timing_desc,
            key_features=["inter_arrival_pattern", "mean_iat_seconds", "jitter"],
        ),
        MetadataExposureDimension(
            name="Size Pattern Observability",
            value=size_score,
            indicator=size_ind,
            description=size_desc,
            key_features=["packet_size_pattern", "mean_packet_length", "size_variance"],
        ),
        MetadataExposureDimension(
            name="Directionality Observability",
            value=dir_score,
            indicator=dir_ind,
            description=dir_desc,
            key_features=["directionality", "forward_reverse_ratio", "byte_asymmetry"],
        ),
        MetadataExposureDimension(
            name="Burst Pattern Observability",
            value=burst_score,
            indicator=burst_ind,
            description=burst_desc,
            key_features=["burst_count", "peak_burst_rate", "idle_periods"],
        ),
        MetadataExposureDimension(
            name="Flow Duration Observability",
            value=dur_score,
            indicator=dur_ind,
            description=dur_desc,
            key_features=["session_duration_seconds", "flow_lifespan"],
        ),
    ]


def evaluate_metadata_exposure(analysis: AnalysisResult) -> MetadataExposureResult:
    """Analyze metadata exposure indicators from an AnalysisResult without decrypting payloads."""
    # Check if traffic intelligence features exist
    feat_dict: Dict[str, Any] = {}
    if analysis.traffic and analysis.traffic.features:
        if isinstance(analysis.traffic.features, dict):
            feat_dict = analysis.traffic.features
        else:
            feat_dict = analysis.traffic.features.model_dump()

    predicted_cls = analysis.traffic.predicted_class if analysis.traffic else "Unknown"

    if not feat_dict:
        # Insufficient features available
        return MetadataExposureResult(
            analysis_id=analysis.analysis_id,
            indicator="Unknown",
            score=None,
            dimensions=[],
            explanation="Insufficient encrypted flow features extracted from this session to evaluate metadata observability.",
            provenance="Observed" if analysis.source.type == "pcap" else "Simulated",
            features_summary={},
            traffic_classification=None,
        )

    dimensions = compute_dimension_scores(feat_dict, predicted_cls)

    # Calculate overall weighted score
    overall_score = round(sum(d.value for d in dimensions) / len(dimensions), 1)

    if overall_score >= 70.0:
        indicator: ExposureLevel = "High"
        exp_summary = (
            f"High metadata observability ({overall_score}/100): Packet timing and size profiles exhibit "
            f"distinctive characteristics that allow confident flow classification as '{predicted_cls}' "
            f"without decrypting IPsec ESP packets."
        )
    elif overall_score >= 45.0:
        indicator = "Moderate"
        exp_summary = (
            f"Moderate metadata observability ({overall_score}/100): Packet pacing and flow directionality "
            f"reveal operational category '{predicted_cls}', while cryptographic encapsulation preserves content confidentiality."
        )
    else:
        indicator = "Low"
        exp_summary = (
            f"Low metadata observability ({overall_score}/100): Uniform packet lengths and regular timing "
            f"significantly minimize traffic fingerprinting."
        )

    prov = "Observed" if analysis.source.type == "pcap" else "Simulated"

    tf_summary = {
        "predicted_class": predicted_cls,
        "confidence": analysis.traffic.confidence if analysis.traffic else 0.0,
        "classification_mode": analysis.traffic.classification_mode if analysis.traffic else "simulated",
    }

    return MetadataExposureResult(
        analysis_id=analysis.analysis_id,
        indicator=indicator,
        score=overall_score,
        dimensions=dimensions,
        explanation=exp_summary,
        provenance=prov,
        features_summary=feat_dict,
        traffic_classification=tf_summary,
    )
