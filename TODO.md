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

### Remaining for Phase 2 polish (can interleave with 2.5)
- [ ] Click row → detail view (ingredient breakdown for craft/discover)
- [ ] Item images (XIVAPI icon URLs)
- [ ] Job icons for gather/craft pages
- [ ] Card layout on very small screens (currently table-only)
- [ ] Frontend CI (`npm run build` in GitHub Actions)

---

## Phase 2.5: Real-Time Price Feed (WebSocket + Hybrid Polling)

Universalis provides a WebSocket API (`wss://universalis.app/api/v2/ws`, BSON protocol) with
real-time events for listing and sale changes. This replaces heavy hourly polling with a
passive subscription model — prices stay fresh continuously.

### 2.5a: WebSocket Client
- [ ] `scanner/ws_client.py` — async WebSocket client using `websockets` + `pymongo` (BSON)
- [ ] Subscribe to `listings/add` + `sales/add` per configured DC
- [ ] Auto-reconnect with exponential backoff (1s → 2s → … → 60s cap)
- [ ] Parse events → update `api_cache` with fresh price data
- [ ] Store raw `sales/add` events in `price_history` table (item_id, world, price, qty, timestamp) for Phase 3 analytics
- [ ] Track connection state (connected / reconnecting / disconnected)

### 2.5b: Scheduler Rework
- [ ] **Quick scans** every 2 hours — craft, vendor, cross_world, gather (cache is mostly fresh from WS)
- [ ] **Discovery scan** daily at 04:00 server time (quiet hours, expensive full-market sweep)
- [ ] **Dirty-scan debounce** — when WS events update cached prices, mark affected scan types dirty; recalculate dirty scans every ~30s instead of on every event
- [ ] Keep manual trigger endpoint as-is

### 2.5c: Config + Status
- [ ] `WS_ENABLED` env var (default `true`) — kill switch for WebSocket
- [ ] `QUICK_SCAN_INTERVAL_HOURS` env var (default `2`)
- [ ] `DISCOVERY_CRON` env var (default `"0 4 * * *"`)
- [ ] `GET /api/v1/status` — expose WS connection state + last event timestamp

### 2.5d: Frontend
- [ ] Dashboard: WebSocket status indicator (green = live feed, yellow = reconnecting, red = polling only)
- [ ] Show data freshness more prominently (near-real-time vs hours old)

---

## Phase 3: User Features

- [ ] **Favorites:** Bookmark items, pinned to top of tables (localStorage, no auth needed)
- [ ] **Price history charts:** Price + velocity over time (WS events provide continuous data to store)
- [ ] **Sale activity heatmaps:** Hourly sale volume per item — "when do buyers show up?" to time listings optimally (e.g., list at 14:00 if peak sales are 15:00–20:00 UTC). Note: Universalis data has observer bias — sales are only recorded when a plugin user uploads, so overnight data may be underrepresented on quieter DCs
- [ ] **Alerts:** "Notify me when X drops below Y gil" (Discord webhook — WS makes this near-instant)
- [ ] **Retainer planner:** "I have 20 retainer slots — suggest best items to list"
- [ ] **Discord OAuth** login (optional — browsing works without login, needed for persistent favorites/alerts)

---

## Phase 4: Production Readiness

- [ ] **PostgreSQL** migration (SQLite won't scale with continuous WS writes)
- [ ] **HTTPS** via Caddy reverse proxy + Let's Encrypt
- [ ] **Multi-DC:** scan all DCs, each with its own WS subscription
- [ ] **Monitoring:** health check endpoint, error alerting
- [ ] **CI/CD:** auto-deploy on push to main
- [ ] **Rate limiting** per user

---

## Ideas / Backlog

- Multi-language support
- Item search across all scan modes
- "What should I craft with MY retainer inventory?" mode
- Gil/hour estimates for gathering (factoring in timed node rotations)
