# Tataru Commerce Service — Roadmap

## Current Status

**Phase 0 + Phase 1: DONE | Phase 2a+2b+2c: DONE**

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

## Phase 2: React Frontend (MVP) — DONE

### 2a: Project Setup
- [x] Vite + React 19 + TypeScript
- [x] Tailwind CSS v4 + shadcn/ui (base-ui component library)
- [x] React Router v7 for navigation
- [x] TanStack Query v5 for API data fetching + client-side caching
- [x] TanStack Table v8 for headless table logic

### 2b: Core Pages
- [x] **Layout:** Header with DC/World selector (persisted in localStorage), sidebar nav, FFXIV dark theme
- [x] **Dashboard** (`/`): Overview cards per scan type, last scan time, trigger scan button
- [x] **Craft Scanner** (`/craft`): Sortable/filterable table (Item, Craft Cost, MB Price, Margin, Margin%, Velocity, Profit/Day)
- [x] **Vendor Arbitrage** (`/vendor`): NPC flip opportunities table
- [x] **Cross-World** (`/cross-world`): Buy/sell world spread table
- [x] **Discovery** (`/discover`): High-margin items table
- [x] **Gather** (`/gather`): Gatherable items with job/level columns

### 2c: Shared Components
- [x] `<DataTable>` — sortable, filterable, paginated (50/page), generic with TanStack Table
- [x] `<ScanStatusBadge>` — color-coded freshness ("15m ago" / "2h ago")
- [x] Gil formatting via `format.ts` helpers (gil, pct, decimal, relativeTime)
- [x] Stale row dimming (opacity on is_stale rows)
- [x] Mobile-responsive: sidebar collapses to hamburger menu

### 2d: Docker + Infrastructure
- [x] Frontend Dockerfile (multi-stage: node build → nginx)
- [x] nginx config: proxies `/api/` to backend, SPA fallback
- [x] docker-compose updated with frontend service

### Remaining for Phase 2 polish
- [ ] Click row → detail view (ingredient breakdown for craft/discover)
- [ ] Item images (Universalis-style, requires external icon source)
- [ ] Job icons for gather/craft pages
- [ ] Card layout on very small screens (currently table-only)

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
