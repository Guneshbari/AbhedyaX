"""Unit tests for testbed prerequisite evaluation."""

import pytest
from services.testbed.src.network.prerequisites import (
    evaluate_testbed_environment,
    has_root,
    is_linux,
)


def test_prerequisites_evaluation():
    status = evaluate_testbed_environment()
    assert isinstance(status.is_linux, bool)
    assert isinstance(status.has_root, bool)
    assert isinstance(status.can_manage_netns, bool)
    assert isinstance(status.has_strongswan, bool)
    assert isinstance(status.has_tcpdump, bool)
    assert isinstance(status.has_tshark, bool)
    assert status.default_mode in ["simulation", "real"]
    assert len(status.message) > 5
