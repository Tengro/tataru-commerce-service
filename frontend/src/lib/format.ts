export function gil(value: number | null | undefined): string {
  if (value == null) return "-"
  return Math.round(value).toLocaleString("en-US")
}

export function pct(value: number | null | undefined): string {
  if (value == null) return "-"
  return `${Math.round(value)}%`
}

export function decimal(value: number | null | undefined, digits = 1): string {
  if (value == null) return "-"
  return value.toFixed(digits)
}

export function relativeTime(unixTimestamp: number): string {
  const diffMs = Date.now() - unixTimestamp * 1000
  const minutes = Math.floor(diffMs / 60000)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
