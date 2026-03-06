"""SQLite database for storing pre-computed scan results."""

import json
import sqlite3
import time
from pathlib import Path

from config import DB_PATH

_CREATE_SQL = """
CREATE TABLE IF NOT EXISTS scan_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_type TEXT NOT NULL,
    dc TEXT NOT NULL,
    world TEXT DEFAULT '',
    data JSON NOT NULL,
    scanned_at REAL NOT NULL,
    params JSON DEFAULT '{}'
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_scan_lookup
    ON scan_results(scan_type, dc, world);

CREATE TABLE IF NOT EXISTS api_cache (
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    data JSON NOT NULL,
    cached_at REAL NOT NULL,
    PRIMARY KEY (namespace, key)
);
"""


def _ensure_db() -> Path:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(_CREATE_SQL)
    conn.close()
    return DB_PATH


def get_connection() -> sqlite3.Connection:
    _ensure_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def upsert_scan_result(
    scan_type: str,
    dc: str,
    data: list,
    world: str = "",
    params: dict | None = None,
) -> None:
    """Store or update a scan result."""
    conn = get_connection()
    try:
        conn.execute(
            """INSERT INTO scan_results (scan_type, dc, world, data, scanned_at, params)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(scan_type, dc, world)
               DO UPDATE SET data=excluded.data, scanned_at=excluded.scanned_at, params=excluded.params""",
            (scan_type, dc, world, json.dumps(data), time.time(), json.dumps(params or {})),
        )
        conn.commit()
    finally:
        conn.close()


def get_scan_result(scan_type: str, dc: str, world: str = "") -> dict | None:
    """Fetch a stored scan result. Returns {data, scanned_at, params} or None."""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT data, scanned_at, params FROM scan_results WHERE scan_type=? AND dc=? AND world=?",
            (scan_type, dc, world),
        ).fetchone()
        if row is None:
            return None
        return {
            "data": json.loads(row["data"]),
            "scanned_at": row["scanned_at"],
            "params": json.loads(row["params"]),
        }
    finally:
        conn.close()


def get_all_scan_status() -> list[dict]:
    """Get last scan times for all type/dc combos."""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT scan_type, dc, world, scanned_at FROM scan_results ORDER BY scan_type, dc"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
