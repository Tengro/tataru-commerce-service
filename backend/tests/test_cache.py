"""Tests for SQLite-backed cache."""

import time
from unittest.mock import patch

from scanner import cache


def test_put_and_get():
    cache.put("test", "item1", {"price": 100})
    result = cache.get("test", "item1")
    assert result == {"price": 100}
    cache.clear("test")


def test_get_missing_key():
    assert cache.get("test", "nonexistent") is None


def test_overwrite():
    cache.put("test", "item1", {"price": 100})
    cache.put("test", "item1", {"price": 200})
    assert cache.get("test", "item1") == {"price": 200}
    cache.clear("test")


def test_ttl_expiry():
    cache.put("universalis", "item1", {"price": 100})
    # Patch time to simulate TTL expiry
    with patch("scanner.cache.time") as mock_time:
        mock_time.time.return_value = time.time() + 20000  # 5.5 hours later
        assert cache.get("universalis", "item1") is None
        # But allow_stale should still return it
        assert cache.get("universalis", "item1", allow_stale=True) == {"price": 100}
    cache.clear("universalis")


def test_infinite_ttl():
    cache.put("garland", "item1", {"name": "Iron Ore"})
    with patch("scanner.cache.time") as mock_time:
        mock_time.time.return_value = time.time() + 999999
        assert cache.get("garland", "item1") == {"name": "Iron Ore"}
    cache.clear("garland")


def test_namespace_age():
    assert cache.namespace_age("empty_ns") is None
    cache.put("test_age", "item1", {"x": 1})
    age = cache.namespace_age("test_age")
    assert age is not None
    assert age < 2  # Should be nearly instant
    cache.clear("test_age")


def test_clear_namespace():
    cache.put("ns_a", "item1", {"x": 1})
    cache.put("ns_b", "item1", {"x": 2})
    cache.clear("ns_a")
    assert cache.get("ns_a", "item1") is None
    assert cache.get("ns_b", "item1") == {"x": 2}
    cache.clear("ns_b")


def test_clear_all():
    cache.put("ns_a", "item1", {"x": 1})
    cache.put("ns_b", "item1", {"x": 2})
    cache.clear()
    assert cache.get("ns_a", "item1") is None
    assert cache.get("ns_b", "item1") is None


def test_stores_lists():
    cache.put("test", "list_key", [1, 2, 3])
    assert cache.get("test", "list_key") == [1, 2, 3]
    cache.clear("test")
