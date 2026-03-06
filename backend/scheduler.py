"""Periodic scan scheduler — runs all scan modes and stores results in DB."""

import dataclasses
import logging
import threading
import time

from apscheduler.schedulers.background import BackgroundScheduler

import db
from config import SCAN_DCS, SCAN_INTERVAL_MINUTES
from scanner.modes import craft_scan, vendor_arbitrage, cross_world, discover, gather_scan

log = logging.getLogger("tcs.scheduler")

# Scan modes and their function signatures
_SCAN_MODES = {
    "craft": lambda dc: craft_scan.scan(dc),
    "vendor": lambda dc: vendor_arbitrage.scan(dc),
    "cross_world": lambda dc: cross_world.scan(dc),
    "discover": lambda dc: discover.scan(dc),
    "gather": lambda dc: gather_scan.scan(dc),
}


def _serialize_results(results: list) -> list[dict]:
    """Convert scan results (dataclasses or dicts) to plain dicts for JSON storage."""
    out = []
    for r in results:
        if dataclasses.is_dataclass(r):
            d = dataclasses.asdict(r)
        else:
            # Already a dict — drop non-serializable values (like PriceData objects)
            d = {k: v for k, v in r.items() if not hasattr(v, '__dataclass_fields__')}
        out.append(d)
    return out


def run_all_scans() -> None:
    """Run all scan modes for all configured DCs."""
    for dc in SCAN_DCS:
        for mode_name, scan_fn in _SCAN_MODES.items():
            t0 = time.time()
            try:
                results = scan_fn(dc)
                serialized = _serialize_results(results)
                db.upsert_scan_result(mode_name, dc, serialized)
                elapsed = time.time() - t0
                log.info(f"  {mode_name}/{dc}: {len(serialized)} results in {elapsed:.1f}s")
            except Exception:
                log.exception(f"  {mode_name}/{dc}: scan failed")


_scheduler: BackgroundScheduler | None = None


def start() -> None:
    """Start the background scheduler."""
    global _scheduler

    # Run initial scan in a background thread so the API starts responding immediately
    existing = db.get_all_scan_status()
    if not existing:
        log.info("No existing scan data — initial scan will run in background")
        threading.Thread(target=run_all_scans, name="initial-scan", daemon=True).start()
    else:
        log.info(f"Found {len(existing)} existing scan results")

    _scheduler = BackgroundScheduler()
    _scheduler.add_job(
        run_all_scans,
        "interval",
        minutes=SCAN_INTERVAL_MINUTES,
        id="scan_all",
        replace_existing=True,
    )
    _scheduler.start()
    log.info(f"Scheduler started — scanning every {SCAN_INTERVAL_MINUTES} minutes")


def stop() -> None:
    """Stop the background scheduler."""
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None


def get_next_run_time() -> float | None:
    """Get the next scheduled scan time as a Unix timestamp."""
    if _scheduler is None:
        return None
    job = _scheduler.get_job("scan_all")
    if job and job.next_run_time:
        return job.next_run_time.timestamp()
    return None
