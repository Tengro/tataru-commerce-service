# Tataru Commerce Service

FFXIV Market Board profit scanner — find profitable crafting, vendor arbitrage, cross-world spreads, gathering opportunities, and market discovery.

Named after Tataru Taru, the Scions of the Seventh Dawn's resident financial genius.

## Architecture

- **Backend**: FastAPI + scanner engine (Python). Periodically scans FFXIV market data from [Universalis](https://universalis.app/) and [Garland Tools](https://garlandtools.org/), stores pre-computed results in SQLite.
- **Frontend**: React (planned).

## Quick Start

```bash
cd backend
pip install -e ".[dev]"
uvicorn api.main:app --reload
```

The scheduler will run an initial scan on startup (takes a few minutes), then refresh hourly.

### API Endpoints

- `GET /api/v1/scans/{type}?dc=Chaos` — scan results (type: craft, vendor, cross_world, discover, gather)
- `GET /api/v1/status` — last scan times and next scheduled run
- `GET /api/v1/worlds` — list of data centers and worlds
- `GET /docs` — interactive API docs (Swagger)

### Docker

```bash
docker-compose up
```

## Development

```bash
cd backend
pip install -e ".[dev]"
pytest tests/ -v
```

## Credits

Data provided by [Universalis](https://universalis.app/) and [Garland Tools](https://garlandtools.org/).
