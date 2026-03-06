import { Badge } from "@/components/ui/badge"
import { relativeTime } from "@/lib/format"

interface ScanStatusBadgeProps {
  scannedAt: number | undefined
  className?: string
}

export function ScanStatusBadge({ scannedAt, className }: ScanStatusBadgeProps) {
  if (!scannedAt) {
    return <Badge variant="outline" className={className}>No data</Badge>
  }

  const ageMinutes = (Date.now() - scannedAt * 1000) / 60000
  const variant = ageMinutes < 30 ? "default" : ageMinutes < 90 ? "secondary" : "destructive"

  return (
    <Badge variant={variant} className={className}>
      {relativeTime(scannedAt)}
    </Badge>
  )
}
