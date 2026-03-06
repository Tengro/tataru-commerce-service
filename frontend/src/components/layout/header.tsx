import { DcSelector } from "./dc-selector"
import { ScanStatusBadge } from "@/components/scan-status-badge"
import { useStatus } from "@/hooks/use-scans"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { data: status } = useStatus()
  const [menuOpen, setMenuOpen] = useState(false)

  const latestScan = status?.scans?.reduce(
    (latest, s) => (s.scanned_at > (latest?.scanned_at ?? 0) ? s : latest),
    status.scans[0],
  )

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden px-2"
            onClick={() => { setMenuOpen(!menuOpen); onMenuToggle() }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
          <h1 className="text-lg font-semibold text-primary whitespace-nowrap">
            Tataru Commerce
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <ScanStatusBadge scannedAt={latestScan?.scanned_at} />
          <DcSelector />
        </div>
      </div>
    </header>
  )
}
