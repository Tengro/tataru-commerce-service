# Tataru Commerce Service — Roadmap

## Current Status

**Phase 0 + Phase 1a/1b: DONE**

Repo bootstrapped with:
- [x] Scanner package (from ffxiv-profit-scanner, unchanged)
- [x] FastAPI API: `/api/v1/scans/{type}`, `/status`, `/worlds`
- [x] Pydantic response models for all 5 scan types
- [x] Background scheduler (APScheduler) — runs scans hourly, stores in SQLite
- [x] SQLite DB for pre-computed scan results
- [x] Docker Compose + Dockerfile
- [x] CI: GitHub Actions, 23 tests on Python 3.10 + 3.12

---

## Phase 1c: DB-backed API cache

Replace the file-based cache (`~/.ffxiv-scanner/`) with the `api_cache` SQLite table so everything lives in one DB.

- [ ] Add `api_cache` table (namespace, key, data, cached_at)
- [ ] New `cache_db.py` with same `get()`/`put()` interface as current `scanner/cache.py`
- [ ] Swap imports in scanner code: `from scanner import cache` → new DB-backed cache
- [ ] TTL checks via SQL instead of file timestamps
- [ ] `namespace_age()` → simple query

---

## Phase 2: React Frontend (MVP)

### 2a: Project Setup
- [ ] Vite + React + TypeScript
- [ ] Tailwind CSS + shadcn/ui (component library)
- [ ] React Router for navigation
- [ ] TanStack Query for API data fetching + client-side caching

### 2b: Core Pages
- [ ] **Layout:** Top nav with DC/World selector (persisted in localStorage), TCS branding
- [ ] **Dashboard** (`/`): Overview cards — "X profitable crafts", "Y vendor flips", last scan time
- [ ] **Craft Scanner** (`/craft`): Sortable/filterable table
  - Columns: Item, Job, Craft Cost, MB Price, Margin, Margin %, Profit/Day, Velocity
  - Click row → detail view (ingredient breakdown, cost sources)
- [ ] **Vendor Arbitrage** (`/vendor`): NPC flip opportunities table
- [ ] **Cross-World** (`/cross-world`): Buy/sell world spread table
- [ ] **Discovery** (`/discover`): High-margin items table
- [ ] **Gather** (`/gather`): Gatherable items with job/level filter inputs (MIN/BTN/FSH)

### 2c: Shared Components
- [ ] `<DataTable>` — sortable, filterable, paginated table (reuse across all modes)
- [ ] `<ScanStatus>` — "Last updated: 15 min ago" badge
- [ ] `<GilAmount>` — formatted gil display
- [ ] `<JobIcon>` — crafter/gatherer job icon
- [ ] Mobile-responsive: tables → card layout on small screens

---

## Phase 3: User Features

- [ ] **Discord OAuth** login (optional — browsing works without login)
- [ ] **Favorites:** Bookmark items, pinned to top of tables
- [ ] **Alerts:** "Notify me when X drops below Y gil" (Discord webhook)
- [ ] **Retainer planner:** "I have 20 retainer slots — suggest best items to list"
- [ ] **Price history charts:** Price + velocity over time (requires storing historical data)

---

## Phase 4: Production Readiness

- [ ] **PostgreSQL** migration (from SQLite)
- [ ] **Rate limiting** per user
- [ ] **HTTPS** via Caddy reverse proxy + Let's Encrypt
- [ ] **Monitoring:** health check endpoint, error alerting
- [ ] **CI/CD:** auto-deploy on push to main
- [ ] **Multi-DC:** scan all DCs (NA, EU, JP, OCE), users pick theirs
- [ ] **Docker Compose** for full stack: backend + frontend + db + scheduler

---

## Ideas / Backlog

- Universalis WebSocket subscription (real-time price updates instead of polling)
- Multi-language support
- Item search across all scan modes
- "What should I craft with MY retainer inventory?" mode
- Gil/hour estimates for gathering (factoring in timed node rotations)
