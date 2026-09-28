"""Technical audit report generation for AbhedyaX."""

from typing import Any
from .template_loader import get_template_env


def generate_technical_report(result: Any) -> str:
    """Render the technical protocol and flow audit report as an HTML document.

    Args:
        result: AnalysisResult instance or dict representation.

    Returns:
        Self-contained HTML string with inline CSS.
    """
    env = get_template_env()
    template = env.get_template("technical.html.j2")
    return template.render(result=result)
