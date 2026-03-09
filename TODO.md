# Tataru Commerce Service — Roadmap

## Current Status

**Phase 0 + Phase 1 + Phase 2: DONE | Mode Consolidation + v1.1 fixes: DONE**

Scan modes: **crafting** · **gather** · **hunter** · **seal** · **vendor** · **workshop**

All modes are world-specific ("you sell where you play"), level-gated where applicable.

---

## What's Done

### Phase 0: Project Setup
- [x] Separate repo from old scanner (ffxiv-profit-scanner)
- [x] CI: GitHub Actions — Python 3.10 + 3.12 backend tests
- [x] Docker Compose + Dockerfiles for backend + frontend

### Phase 1: FastAPI Backend
- [x] FastAPI app with CORS, lifespan management, Swagger docs
- [x] Pydantic response models for 7 scan types (workshop, crafting, vendor, gather, hunter, seal + dashboard)
- [x] Endpoints: `GET /api/v1/scans/{type}`, `/status`, `/worlds`, `POST /api/v1/scans/trigger`
- [x] APScheduler runs all modes hourly, non-blocking startup
- [x] SQLite-backed API cache (`api_cache` table, TTL, allow_stale)
- [x] 32 tests passing

### Phase 2: React Frontend
- [x] Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui
- [x] TanStack Query v5 + TanStack Table v8
- [x] Dashboard with scan status cards + manual trigger
- [x] 6 scan pages: Crafting, Gather, Hunter, Vendor, Seals, Workshop
- [x] Sortable/filterable/paginated tables, stale row dimming, bargain column
- [x] DC/World selector persisted in localStorage
- [x] Mobile-responsive (sidebar collapses to hamburger)
- [x] nginx reverse proxy + SPA fallback

### Mode Consolidation (v1.0 → v1.1)
- [x] Renamed Craft → Workshop, removed Cross-World + Discover
- [x] Added Crafting (level-gated), Hunter (mob drops via `drops` field), Seal arbitrage
- [x] All modes world-specific, gather simplified to single fetch
- [x] Hunter detection fixed: uses `drops` field, not `ventures` heuristic

---

## Next Steps — Prioritized

### Tier 1: Smoke Test & Ship (immediate)

Get TCS running end-to-end in Docker. Verify it works before adding features.

- [ ] `docker compose up --build` — verify all 6 scan modes run and populate data
- [ ] Verify frontend loads, tables populate, DC/world selector works
- [ ] Fix any scan mode failures (crafting/hunter/seal are new, never tested in TCS context)
- [ ] Add frontend build step to CI (`npm run build` in GitHub Actions)

### Tier 2: UI Polish (before sharing with anyone)

Small improvements that make the difference between "prototype" and "usable tool."

- [ ] Click row → detail view (ingredient breakdown for Workshop, Universalis link for others)
- [ ] Item images via XIVAPI icon URLs
- [ ] Job icons for Gather/Crafting pages (MIN/BTN/FSH, CRP/BSM/etc.)
- [ ] Card layout fallback on very small screens

### Tier 3: WebSocket + Hybrid Polling (Phase 2.5)

The big differentiator — near-real-time price updates without hammering Universalis.

#### 3a: WebSocket Client
- [ ] `scanner/ws_client.py` — async client using `websockets` + `pymongo` (BSON)
- [ ] Subscribe to `listings/add` + `sales/add` per configured DC
- [ ] Auto-reconnect with exponential backoff (1s → 2s → … → 60s cap)
- [ ] Parse events → update `api_cache` with fresh price data
- [ ] Store `sales/add` events in `price_history` table for analytics
- [ ] Track connection state (connected / reconnecting / disconnected)

#### 3b: Scheduler Rework
- [ ] **Quick scans** every 2h — crafting, vendor, gather, hunter, seal, workshop
- [ ] **Full market sweep** daily at 04:00 server time (quiet hours)
- [ ] **Dirty-scan debounce** — WS events mark affected scans dirty; recalculate every ~30s
- [ ] Keep manual trigger endpoint as-is

#### 3c: Config
- [ ] `WS_ENABLED` env var (default `true`)
- [ ] `QUICK_SCAN_INTERVAL_HOURS` (default `2`)
- [ ] `DISCOVERY_CRON` (default `"0 4 * * *"`)
- [ ] Expose WS state in `GET /api/v1/status`

#### 3d: Frontend
- [ ] Dashboard: WebSocket status indicator (green/yellow/red)
- [ ] Data freshness badges (near-real-time vs hours old)

### Tier 4: User Features (Phase 3)

Features that turn TCS from "data viewer" into "market assistant."

- [ ] **Favorites:** Bookmark items, pin to top of tables (localStorage, no auth)
- [ ] **Price history charts:** Price + velocity over time (needs `price_history` from Tier 3)
- [ ] **Sale activity heatmaps:** Hourly sale volume — "when do buyers show up?" (observer bias caveat on quiet DCs)
- [ ] **Discord alerts:** "Notify me when X drops below Y gil" via webhook (WS makes this near-instant)
- [ ] **Retainer planner:** "I have 20 retainer slots — suggest best items to list"
- [ ] **Discord OAuth** (optional — browsing works without login, needed for persistent favorites/alerts)

### Tier 5: Production Readiness (Phase 4)

For when TCS needs to serve more than one person.

- [ ] **PostgreSQL** migration (SQLite won't scale with continuous WS writes)
- [ ] **HTTPS** via Caddy reverse proxy + Let's Encrypt
- [ ] **Multi-DC** scanning, each with own WS subscription
- [ ] **Monitoring:** health check endpoint, error alerting
- [ ] **CI/CD:** auto-deploy on push to main
- [ ] **Rate limiting** per user

---

## Ideas / Backlog

- Multi-language support (JP/DE/FR item names)
- Item search across all scan modes
- "What should I craft with MY retainer inventory?" mode
- Gil/hour estimates for gathering (factoring in timed node rotations)
- Craftsim-style ingredient cost breakdown for Crafting mode (currently price/velocity only — full margins in Workshop only)
