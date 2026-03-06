import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStatus, useTriggerScan } from "@/hooks/use-scans"
import { useDc } from "@/hooks/use-dc"
import { relativeTime } from "@/lib/format"
import { Link } from "react-router-dom"

const SCAN_META: Record<string, { label: string; path: string; description: string }> = {
  craft: { label: "Craft Scanner", path: "/craft", description: "Profitable crafts" },
  vendor: { label: "Vendor Arbitrage", path: "/vendor", description: "NPC flip opportunities" },
  cross_world: { label: "Cross-World", path: "/cross-world", description: "World price spreads" },
  discover: { label: "Discovery", path: "/discover", description: "High-margin items" },
  gather: { label: "Gather", path: "/gather", description: "Gatherable items" },
}

export function DashboardPage() {
  const { dc } = useDc()
  const { data: status } = useStatus()
  const triggerMutation = useTriggerScan()

  const scansByType = new Map(
    status?.scans
      ?.filter((s) => s.dc === dc)
      .map((s) => [s.scan_type, s])
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Market overview for {dc}</p>
        </div>
        <div className="flex items-center gap-3">
          {status?.next_scan_at && (
            <span className="text-xs text-muted-foreground">
              Next scan: {relativeTime(status.next_scan_at).replace(" ago", "")}
            </span>
          )}
          <Button
            size="sm"
            onClick={() => triggerMutation.mutate()}
            disabled={triggerMutation.isPending}
          >
            {triggerMutation.isPending ? "Starting..." : "Trigger Scan"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(SCAN_META).map(([type, meta]) => {
          const scan = scansByType.get(type)
          return (
            <Link key={type} to={meta.path}>
              <Card className="transition-colors hover:border-primary/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {meta.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">{meta.description}</p>
                  <div className="mt-2">
                    {scan ? (
                      <Badge variant={scan.age_minutes < 30 ? "default" : "secondary"}>
                        Updated {relativeTime(scan.scanned_at)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No data yet</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {triggerMutation.isError && (
        <p className="text-sm text-destructive">
          {(triggerMutation.error as Error).message}
        </p>
      )}
      {triggerMutation.isSuccess && (
        <p className="text-sm text-profit-positive">Scan started! Results will appear shortly.</p>
      )}
    </div>
  )
}
