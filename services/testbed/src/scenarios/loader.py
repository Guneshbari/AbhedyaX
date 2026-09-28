"""Scenario definition file loader and serializer."""

import json
from pathlib import Path
from typing import Dict, List
from services.testbed.src.config.settings import PATHS
from services.testbed.src.scenarios.models import ScenarioDefinition
from services.testbed.src.scenarios.presets import (
    PRESET_SCENARIOS,
    list_preset_scenarios,
)


def export_preset_definitions(target_dir: Path = PATHS.scenarios_dir) -> None:
    """Save all preset scenarios as human-readable JSON files in the definitions directory."""
    target_dir.mkdir(parents=True, exist_ok=True)
    for scenario in PRESET_SCENARIOS.values():
        out_file = target_dir / f"{scenario.scenario_id}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(scenario.model_dump_json(indent=2))


def load_all_scenarios(
    definitions_dir: Path = PATHS.scenarios_dir,
) -> Dict[str, ScenarioDefinition]:
    """Load scenario definitions from directory, falling back to presets."""
    scenarios: Dict[str, ScenarioDefinition] = {}

    # Start with built-ins
    for k, v in PRESET_SCENARIOS.items():
        scenarios[k] = v

    # Override/augment with disk files if present
    if definitions_dir.exists():
        for file_path in definitions_dir.glob("*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    scenario = ScenarioDefinition.model_validate(data)
                    scenarios[scenario.scenario_id] = scenario
            except Exception:
                # If invalid json, ignore and keep preset
                continue

    return scenarios
