"""Scan results endpoints."""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

import db

router = APIRouter(tags=["scans"])

VALID_SCAN_TYPES = {"craft", "vendor", "cross_world", "discover", "gather"}

# ── Response models ──────────────────────────────────────────────


class IngredientCostOut(BaseModel):
    item_id: int
    name: str
    amount: int
    price_per_unit: float
    total_cost: float
    source: str
    craft_alternative: float | None = None
    craft_savings_pct: float | None = None


class CraftResult(BaseModel):
    item_id: int
    name: str
    mb_price: float
    craft_cost: float
    margin: float
    margin_pct: float
    revenue: float
    sale_velocity: float
    profit_per_day: float
    is_stale: bool
    ingredient_costs: list[IngredientCostOut] = []


class VendorResult(BaseModel):
    name: str
    item_id: int
    npc_price: int
    mb_price: int
    markup_pct: float
    velocity: float
    daily_profit: float
    is_stale: bool


class CrossWorldResult(BaseModel):
    name: str
    item_id: int
    cheap_world: str
    cheap_price: int
    cheap_qty: int
    expensive_world: str
    expensive_price: float
    spread_pct: float
    net_profit: float
    is_stale: bool


class GatherResult(BaseModel):
    item_id: int
    name: str
    job: str
    level: int
    location: str = ""
    is_timed: bool
    mb_price: float
    velocity: float
    gil_per_day: float
    is_stale: bool


class ScanResponse(BaseModel):
    scan_type: str
    dc: str
    world: str
    scanned_at: float
    count: int
    results: list[dict]


# Map scan types to their result models (for validation/docs)
_RESULT_MODELS = {
    "craft": CraftResult,
    "vendor": VendorResult,
    "cross_world": CrossWorldResult,
    "discover": CraftResult,  # same shape as craft
    "gather": GatherResult,
}


# ── Endpoints ────────────────────────────────────────────────────


@router.get("/scans/{scan_type}")
def get_scan_results(
    scan_type: str,
    dc: str = Query(..., description="Data center name, e.g. 'Chaos'"),
    world: str = Query("", description="World name (optional)"),
    sort_by: str = Query("", description="Field to sort by"),
    min_profit: float = Query(0, description="Minimum profit/margin filter"),
    min_velocity: float = Query(0, description="Minimum sale velocity filter"),
    limit: int = Query(200, ge=1, le=1000, description="Max results to return"),
) -> ScanResponse:
    if scan_type not in VALID_SCAN_TYPES:
        raise HTTPException(404, f"Unknown scan type: {scan_type}. Valid: {', '.join(sorted(VALID_SCAN_TYPES))}")

    stored = db.get_scan_result(scan_type, dc, world)
    if stored is None:
        raise HTTPException(404, f"No scan data for {scan_type}/{dc}. Scan may not have run yet.")

    results = stored["data"]

    # Apply filters
    if min_profit > 0:
        profit_key = _profit_key(scan_type)
        if profit_key:
            results = [r for r in results if r.get(profit_key, 0) >= min_profit]

    if min_velocity > 0:
        vel_key = _velocity_key(scan_type)
        if vel_key:
            results = [r for r in results if r.get(vel_key, 0) >= min_velocity]

    # Sort
    if sort_by and results:
        reverse = True  # Higher is better for profit-like fields
        results = sorted(results, key=lambda r: r.get(sort_by, 0), reverse=reverse)

    results = results[:limit]

    return ScanResponse(
        scan_type=scan_type,
        dc=dc,
        world=world,
        scanned_at=stored["scanned_at"],
        count=len(results),
        results=results,
    )


def _profit_key(scan_type: str) -> str | None:
    return {
        "craft": "profit_per_day",
        "vendor": "daily_profit",
        "cross_world": "net_profit",
        "discover": "profit_per_day",
        "gather": "gil_per_day",
    }.get(scan_type)


def _velocity_key(scan_type: str) -> str | None:
    return {
        "craft": "sale_velocity",
        "vendor": "velocity",
        "cross_world": None,
        "discover": "sale_velocity",
        "gather": "velocity",
    }.get(scan_type)
