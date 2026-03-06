"""Meta endpoints — status, worlds, manual triggers."""

import threading
import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import db
import scheduler

router = APIRouter(tags=["meta"])

# FFXIV Data Centers and Worlds (as of Dawntrail)
DC_WORLDS: dict[str, list[str]] = {
    # NA
    "Aether": ["Adamantoise", "Cactuar", "Faerie", "Gilgamesh", "Jenova", "Midgardsormr", "Sargatanas", "Siren"],
    "Primal": ["Behemoth", "Excalibur", "Exodus", "Famfrit", "Hyperion", "Lamia", "Leviathan", "Ultros"],
    "Crystal": ["Balmung", "Brynhildr", "Coeurl", "Diabolos", "Goblin", "Malboro", "Mateus", "Zalera"],
    "Dynamis": ["Halicarnassus", "Maduin", "Marilith", "Seraph", "Cuchulainn", "Kraken", "Rafflesia", "Golem"],
    # EU
    "Chaos": ["Cerberus", "Louisoix", "Moogle", "Omega", "Phantom", "Ragnarok", "Sagittarius", "Spriggan"],
    "Light": ["Alpha", "Lich", "Odin", "Phoenix", "Raiden", "Shiva", "Twintania", "Zodiark"],
    # JP
    "Elemental": ["Aegis", "Atomos", "Carbuncle", "Garuda", "Gungnir", "Kujata", "Tonberry", "Typhon"],
    "Gaia": ["Alexander", "Bahamut", "Durandal", "Fenrir", "Ifrit", "Ridill", "Tiamat", "Ultima"],
    "Mana": ["Anima", "Asura", "Chocobo", "Hades", "Ixion", "Masamune", "Pandaemonium", "Titan"],
    "Meteor": ["Belias", "Mandragora", "Ramuh", "Shinryu", "Unicorn", "Valefor", "Yojimbo", "Zeromus"],
    # OCE
    "Materia": ["Bismarck", "Ravana", "Sephirot", "Sophia", "Zurvan"],
}


class ScanStatusEntry(BaseModel):
    scan_type: str
    dc: str
    world: str
    scanned_at: float
    age_minutes: float


class StatusResponse(BaseModel):
    scans: list[ScanStatusEntry]
    next_scan_at: float | None


class WorldsResponse(BaseModel):
    data_centers: dict[str, list[str]]


@router.get("/status")
def get_status() -> StatusResponse:
    now = time.time()
    rows = db.get_all_scan_status()
    scans = [
        ScanStatusEntry(
            scan_type=r["scan_type"],
            dc=r["dc"],
            world=r["world"],
            scanned_at=r["scanned_at"],
            age_minutes=round((now - r["scanned_at"]) / 60, 1),
        )
        for r in rows
    ]
    return StatusResponse(
        scans=scans,
        next_scan_at=scheduler.get_next_run_time(),
    )


@router.get("/worlds")
def get_worlds() -> WorldsResponse:
    return WorldsResponse(data_centers=DC_WORLDS)


_scan_lock = threading.Lock()


@router.post("/scans/trigger")
def trigger_scan():
    """Manually trigger a full scan (runs in background)."""
    if not _scan_lock.acquire(blocking=False):
        raise HTTPException(409, "A scan is already running")
    def _run():
        try:
            scheduler.run_all_scans()
        finally:
            _scan_lock.release()
    threading.Thread(target=_run, name="manual-scan", daemon=True).start()
    return {"status": "scan_started"}
