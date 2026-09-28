"""Scenarios package for AbhedyaX strongSwan testbed."""

from services.testbed.src.scenarios.loader import (
    export_preset_definitions,
    load_all_scenarios,
)
from services.testbed.src.scenarios.models import (
    ExpectedSecurity,
    ScenarioDefinition,
    ScoreRange,
)
from services.testbed.src.scenarios.presets import (
    PRESET_SCENARIOS,
    get_preset_scenario,
    list_preset_scenarios,
)

# Populate definitions on disk
try:
    export_preset_definitions()
except Exception:
    pass

__all__ = [
    "ExpectedSecurity",
    "PRESET_SCENARIOS",
    "ScenarioDefinition",
    "ScoreRange",
    "export_preset_definitions",
    "get_preset_scenario",
    "list_preset_scenarios",
    "load_all_scenarios",
]
