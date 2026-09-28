"""Jinja2 template environment loader for AbhedyaX Report Generator."""

from pathlib import Path
from typing import Any
import jinja2

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


def get_report_css() -> str:
    """Read the bundled report.css content for inline injection."""
    css_path = STATIC_DIR / "report.css"
    if css_path.exists():
        return css_path.read_text(encoding="utf-8")
    return ""


def get_template_env() -> jinja2.Environment:
    """Create configured Jinja2 environment with custom filters and security."""
    loader = jinja2.FileSystemLoader(str(TEMPLATES_DIR))
    env = jinja2.Environment(
        loader=loader,
        autoescape=jinja2.select_autoescape(["html", "xml"]),
        trim_blocks=True,
        lstrip_blocks=True,
    )

    # Custom helper filters
    def format_duration(seconds: Any) -> str:
        try:
            sec = float(seconds)
            m = int(sec // 60)
            s = int(sec % 60)
            return f"{m}m {s}s"
        except (ValueError, TypeError):
            return str(seconds)

    def format_bytes(b: Any) -> str:
        try:
            num = float(b)
            if num >= 1024 * 1024:
                return f"{num / (1024 * 1024):.2f} MB"
            elif num >= 1024:
                return f"{num / 1024:.1f} KB"
            return f"{int(num)} B"
        except (ValueError, TypeError):
            return str(b)

    env.filters["format_duration"] = format_duration
    env.filters["format_bytes"] = format_bytes
    env.globals["get_report_css"] = get_report_css

    return env
