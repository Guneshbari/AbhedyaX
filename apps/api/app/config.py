from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AbhedyaX API"
    app_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_prefix: str = "/api/v1"
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]
    simulation_mode: bool = True
    step_delay_seconds: float = 0.4
    log_level: str = "INFO"

    # Phase 2: Engine & TShark Configuration
    analysis_engine: str = "mock"  # "mock" or "real" (ABHEDYAX_ANALYSIS_ENGINE)
    tshark_binary: str = "tshark"  # TSHARK_BINARY
    tshark_timeout_seconds: int = 120  # TSHARK_TIMEOUT_SECONDS
    max_pcap_size_mb: int = 250  # MAX_PCAP_SIZE_MB
    storage_dir: str = "storage"
    pcaps_dir: str = "storage/pcaps"
    datasets_dir: str = "datasets/scenarios/pcaps"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
