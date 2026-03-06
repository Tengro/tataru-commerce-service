"""TCS backend configuration — loaded from environment variables."""

import os
from pathlib import Path

# Data centers to scan periodically
SCAN_DCS: list[str] = [
    dc.strip()
    for dc in os.getenv("SCAN_DCS", "Chaos").split(",")
    if dc.strip()
]

# How often to run scans (minutes)
SCAN_INTERVAL_MINUTES: int = int(os.getenv("SCAN_INTERVAL_MINUTES", "60"))

# SQLite database path
DB_PATH: Path = Path(os.getenv("DB_PATH", "./data/tcs.db"))

# CORS origins (comma-separated)
CORS_ORIGINS: list[str] = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]
