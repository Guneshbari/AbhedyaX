"""Executive report generation for AbhedyaX."""

from typing import Any
from .template_loader import get_template_env


def generate_executive_report(result: Any) -> str:
    """Render the executive security assessment report as an HTML document.

    Args:
        result: AnalysisResult instance or dict representation.

    Returns:
        Self-contained HTML string with inline CSS.
    """
    env = get_template_env()
    template = env.get_template("executive.html.j2")
    return template.render(result=result)
