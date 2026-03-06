"""API cache backed by SQLite — same interface as the old file-based cache."""

import json
import time

from db import get_connection

# TTL in seconds; None = infinite
NAMESPACE_TTL = {
    "garland": None,
    "universalis": 10800,  # 3 hours
}


def get(namespace: str, key: str, allow_stale: bool = False):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT data, cached_at FROM api_cache WHERE namespace=? AND key=?",
            (namespace, key),
        ).fetchone()
        if row is None:
            return None
        ttl = NAMESPACE_TTL.get(namespace)
        if ttl is not None and not allow_stale:
            if time.time() - row["cached_at"] > ttl:
                return None
        return json.loads(row["data"])
    finally:
        conn.close()


def put(namespace: str, key: str, payload) -> None:
    now = time.time()
    conn = get_connection()
    try:
        conn.execute(
            """INSERT INTO api_cache (namespace, key, data, cached_at)
               VALUES (?, ?, ?, ?)
               ON CONFLICT(namespace, key)
               DO UPDATE SET data=excluded.data, cached_at=excluded.cached_at""",
            (namespace, key, json.dumps(payload), now),
        )
        conn.commit()
    finally:
        conn.close()


def namespace_age(namespace: str) -> float | None:
    """Return age in seconds of the most recent write in a namespace, or None if empty."""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT MAX(cached_at) as latest FROM api_cache WHERE namespace=?",
            (namespace,),
        ).fetchone()
        if row is None or row["latest"] is None:
            return None
        return time.time() - row["latest"]
    finally:
        conn.close()


def clear(namespace: str | None = None) -> None:
    conn = get_connection()
    try:
        if namespace:
            conn.execute("DELETE FROM api_cache WHERE namespace=?", (namespace,))
        else:
            conn.execute("DELETE FROM api_cache")
        conn.commit()
    finally:
        conn.close()
