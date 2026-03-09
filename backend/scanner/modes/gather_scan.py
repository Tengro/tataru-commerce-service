import sys

from scanner.api import garland, universalis
from scanner.output import print_header, print_gather_result


def scan(
    dc: str,
    world: str | None = None,
    no_cache: bool = False,
    allow_stale: bool = False,
    min_price: float = 100,
    min_velocity: float = 1.0,
    min_level: int = 0,
    btn_level: int = 0,
    fsh_level: int = 0,
    sort_by: str = "gil_per_day",
    on_progress: callable = None,
) -> list[dict]:
    """Find profitable gathering opportunities.

    Uses Garland node browse to find gatherable items first (fast),
    then fetches prices only for those items from Universalis.

    Level params: 0 = skip that job, >0 = show items up to that level.
    """
    def _progress(phase, msg):
        if on_progress:
            on_progress(phase, 3, msg)

    # Build job filter from levels
    job_levels = {}
    if min_level > 0:
        job_levels["MIN"] = min_level
    if btn_level > 0:
        job_levels["BTN"] = btn_level
    if fsh_level > 0:
        job_levels["FSH"] = fsh_level

    if not job_levels:
        _progress(1, "No gathering jobs selected (all levels are 0)")
        return []

    # Phase 1: Get gatherable items from Garland (node-first approach)
    _progress(1, "Scanning gathering nodes...")
    gather_items = garland.fetch_gathering_items(
        job_levels,
        no_cache=no_cache,
        on_progress=lambda msg: _progress(1, msg),
    )
    if not gather_items:
        _progress(1, "No gatherable items found for selected jobs/levels")
        return []

    _progress(1, f"Found {len(gather_items)} gatherable items, fetching prices...")

    # Phase 2: Fetch prices from Universalis (world-specific)
    item_ids = [g["item_id"] for g in gather_items]
    price_target = world or dc
    _progress(2, f"Fetching {price_target} prices for {len(item_ids)} items...")

    price_data = universalis.fetch_prices(
        item_ids, price_target, no_cache=no_cache, allow_stale=allow_stale,
        listings=5, entries=20,
    )

    # Build results and filter
    results = []
    for g in gather_items:
        item_id = g["item_id"]
        pd = price_data.get(item_id)
        if not pd:
            continue

        avg_price = pd.avg_sale_price
        velocity = pd.nq_sale_velocity
        if avg_price < min_price or velocity < min_velocity:
            continue

        gil_per_day = avg_price * 0.95 * velocity

        results.append({
            "item_id": item_id,
            "name": g["name"],
            "job": g["job"],
            "level": g["level"],
            "location": g["location"],
            "is_timed": g["is_timed"],
            "mb_price": avg_price,
            "velocity": velocity,
            "gil_per_day": gil_per_day,
            "is_stale": pd.is_stale,
        })

    _progress(3, f"Found {len(results)} gathering opportunities")

    if sort_by == "mb_price":
        results.sort(key=lambda r: r["mb_price"], reverse=True)
    elif sort_by == "velocity":
        results.sort(key=lambda r: r["velocity"], reverse=True)
    else:
        results.sort(key=lambda r: r["gil_per_day"], reverse=True)

    _progress(3, f"Done — {len(results)} items")
    return results



def run(
    dc: str,
    world: str | None = None,
    no_cache: bool = False,
    allow_stale: bool = False,
    min_price: float = 100,
    min_velocity: float = 1.0,
    min_level: int = 0,
    btn_level: int = 0,
    fsh_level: int = 0,
    sort_by: str = "gil_per_day",
):
    header = f"Gatherer Profit Scan — {dc} DC"
    if world:
        header += f" / {world}"
    jobs = []
    if min_level > 0:
        jobs.append(f"MIN {min_level}")
    if btn_level > 0:
        jobs.append(f"BTN {btn_level}")
    if fsh_level > 0:
        jobs.append(f"FSH {fsh_level}")
    if jobs:
        header += f" ({', '.join(jobs)})"
    print_header(header)

    def _print_progress(phase, total, msg):
        print(f"  Phase {phase}/{total}: {msg}")

    results = scan(
        dc=dc, world=world, no_cache=no_cache, allow_stale=allow_stale,
        min_price=min_price, min_velocity=min_velocity,
        min_level=min_level, btn_level=btn_level, fsh_level=fsh_level,
        sort_by=sort_by, on_progress=_print_progress,
    )

    if not results:
        print("\n  No gathering opportunities found with current filters.")
        return

    print(f"\n  Found {len(results)} opportunities:\n")
    for r in results:
        print_gather_result(
            name=r["name"],
            item_id=r["item_id"],
            job=r["job"],
            level=r["level"],
            location=r["location"],
            is_timed=r["is_timed"],
            mb_price=r["mb_price"],
            velocity=r["velocity"],
            gil_per_day=r["gil_per_day"],
            is_stale=r["is_stale"],
        )
