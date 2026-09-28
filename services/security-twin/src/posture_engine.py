"""Security Posture Timeline Aggregator.

Aggregates historical canonical analysis sessions into a continuous security
posture progression, computing risk-band transitions, configuration milestones,
and longitudinal compliance posture.
"""

from typing import List, Dict
from app.models.analysis import AnalysisResult
from services.security_twin.src.models.posture import (
    PostureTimelineEntry,
    PostureTransition,
    PostureTimelineResult,
)


def build_posture_timeline(analyses: List[AnalysisResult]) -> PostureTimelineResult:
    """Aggregate a sequence of canonical AnalysisResults into a PostureTimelineResult."""
    if not analyses:
        return PostureTimelineResult(
            timeline=[],
            transitions=[],
            total_sessions=0,
            average_score=0.0,
            highest_score=0,
            lowest_score=0,
            risk_distribution={},
            posture_summary="No completed analysis sessions available.",
        )

    # Sort chronologically by created_at
    sorted_analyses = sorted(analyses, key=lambda a: a.created_at)

    entries: List[PostureTimelineEntry] = []
    risk_dist: Dict[str, int] = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}

    for a in sorted_analyses:
        r_level = a.security.risk_level
        risk_dist[r_level] = risk_dist.get(r_level, 0) + 1

        cfg_summary = f"{a.vpn.ike_version} | {a.cryptography.encryption} | {a.cryptography.dh_group} | PFS:{'On' if a.cryptography.pfs else 'Off'}"

        src_type = "PCAP" if a.source.type == "pcap" else "Simulation"
        prov = "Observed Wire" if a.source.type == "pcap" else "Scenario Ground Truth"

        entries.append(
            PostureTimelineEntry(
                analysis_id=a.analysis_id,
                timestamp=a.created_at,
                scenario=a.source.name or a.analysis_id,
                score=a.security.score,
                risk=a.security.risk_level,
                grade=a.security.grade,
                finding_count=len(a.findings),
                configuration_summary=cfg_summary,
                source=src_type,
                provenance=prov,
                pfs=bool(a.cryptography.pfs),
                replay_protection=bool(a.security.replay_protection),
                ike_version=a.vpn.ike_version,
                encryption=a.cryptography.encryption,
            )
        )

    # Compute transitions between consecutive timeline entries
    transitions: List[PostureTransition] = []
    for i in range(len(entries) - 1):
        prev = entries[i]
        curr = entries[i + 1]

        delta = curr.score - prev.score
        changes = []
        if prev.ike_version != curr.ike_version:
            changes.append(f"IKE: {prev.ike_version} -> {curr.ike_version}")
        if prev.encryption != curr.encryption:
            changes.append(f"Cipher: {prev.encryption} -> {curr.encryption}")
        if prev.pfs != curr.pfs:
            changes.append(f"PFS: {'Enabled' if prev.pfs else 'Disabled'} -> {'Enabled' if curr.pfs else 'Disabled'}")
        if prev.replay_protection != curr.replay_protection:
            changes.append(f"Replay: {'Enabled' if prev.replay_protection else 'Disabled'} -> {'Enabled' if curr.replay_protection else 'Disabled'}")

        if not changes:
            changes.append("Parameters stable between sessions")

        transitions.append(
            PostureTransition(
                from_id=prev.analysis_id,
                to_id=curr.analysis_id,
                from_score=prev.score,
                to_score=curr.score,
                score_delta=delta,
                risk_transition=f"{prev.risk} -> {curr.risk}",
                grade_transition=f"{prev.grade} -> {curr.grade}",
                key_changes=changes,
            )
        )

    scores = [e.score for e in entries]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    highest = max(scores) if scores else 0
    lowest = min(scores) if scores else 0

    summary_text = (
        f"Inspected {len(entries)} operational sessions with mean security score of {avg_score}/100. "
        f"Posture spans from high-assurance modern tunnels ({highest}/100 Grade A) to deprecated legacy deployments "
        f"requiring remediation ({lowest}/100 Grade F)."
    )

    return PostureTimelineResult(
        timeline=entries,
        transitions=transitions,
        total_sessions=len(entries),
        average_score=avg_score,
        highest_score=highest,
        lowest_score=lowest,
        risk_distribution=risk_dist,
        posture_summary=summary_text,
    )
