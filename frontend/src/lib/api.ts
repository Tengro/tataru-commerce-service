import type { ScanResponse, StatusResponse, WorldsResponse, ScanResult } from "@/types/api"

const BASE = "/api/v1"

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export function fetchScanResults<T extends ScanResult>(
  type: string,
  dc: string,
  world: string = "",
): Promise<ScanResponse<T>> {
  const params = new URLSearchParams({ dc })
  if (world) params.set("world", world)
  return apiFetch(`/scans/${type}?${params}`)
}

export function fetchStatus(): Promise<StatusResponse> {
  return apiFetch("/status")
}

export function fetchWorlds(): Promise<WorldsResponse> {
  return apiFetch("/worlds")
}

export function triggerScan(): Promise<{ status: string }> {
  return apiFetch("/scans/trigger", { method: "POST" })
}
