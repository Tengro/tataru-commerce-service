import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchScanResults, fetchStatus, fetchWorlds, triggerScan } from "@/lib/api"
import { useDc } from "./use-dc"
import type { ScanResponse, StatusResponse, WorldsResponse, ScanResult } from "@/types/api"

export function useScanResults<T extends ScanResult>(scanType: string) {
  const { dc, world } = useDc()
  return useQuery<ScanResponse<T>>({
    queryKey: ["scans", scanType, dc, world],
    queryFn: () => fetchScanResults<T>(scanType, dc, world),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useStatus() {
  return useQuery<StatusResponse>({
    queryKey: ["status"],
    queryFn: fetchStatus,
    refetchInterval: 60 * 1000,
  })
}

export function useWorlds() {
  return useQuery<WorldsResponse>({
    queryKey: ["worlds"],
    queryFn: fetchWorlds,
    staleTime: Infinity,
  })
}

export function useTriggerScan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: triggerScan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status"] })
    },
  })
}
