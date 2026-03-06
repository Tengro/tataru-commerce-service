# Tataru Commerce Service — Roadmap

## Current Status

**Phase 0 + Phase 1: DONE**

### Phase 0: Project Setup
- [x] New repo created (separate from ffxiv-profit-scanner)
- [x] Scanner package copied (unchanged from v0.4.2)
- [x] Directory structure: `backend/` + `frontend/` (placeholder)
- [x] CI: GitHub Actions, Python 3.10 + 3.12

### Phase 1a: FastAPI Backend
- [x] FastAPI app with CORS, lifespan management
- [x] Pydantic response models for all 5 scan types
- [x] Endpoints: `GET /api/v1/scans/{type}`, `/status`, `/worlds`
- [x] Query params: `sort_by`, `min_profit`, `min_velocity`, `limit`
- [x] Swagger docs at `/docs`

### Phase 1b: Scheduler
- [x] APScheduler runs all scan modes hourly for configured DCs
- [x] Non-blocking startup (initial scan runs in background thread)
- [x] Results stored in SQLite `scan_results` table
- [x] `POST /api/v1/scans/trigger` for manual scan kicks
- [x] Logging: scan duration, result counts, errors

### Phase 1c: DB-backed API cache
- [x] `api_cache` SQLite table (namespace, key, data, cached_at)
- [x] Rewrote `scanner/cache.py` — same `get()`/`put()` interface, backed by SQLite
- [x] TTL checks via SQL, `namespace_age()` via `MAX(cached_at)` query
- [x] 9 cache tests (TTL expiry, allow_stale, clear, namespace isolation)
- [x] Everything in one DB file (`data/tcs.db`)

### Phase 1 totals
- 32 tests passing
- Backend verified end-to-end: real Chaos DC scan data served via API
- Docker Compose + Dockerfile ready

---

## Phase 2: React Frontend (MVP) ← NEXT

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
