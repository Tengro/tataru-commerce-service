import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { ColumnHeader } from "@/components/data-table/column-header"
import { ScanStatusBadge } from "@/components/scan-status-badge"
import { useScanResults } from "@/hooks/use-scans"
import { gil, pct } from "@/lib/format"
import type { CrossWorldResult } from "@/types/api"

const columns: ColumnDef<CrossWorldResult, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <ColumnHeader column={column} title="Item" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "cheap_world",
    header: ({ column }) => <ColumnHeader column={column} title="Buy World" />,
  },
  {
    accessorKey: "cheap_price",
    header: ({ column }) => <ColumnHeader column={column} title="Buy Price" className="justify-end" />,
    cell: ({ row }) => <div className="text-right">{gil(row.getValue("cheap_price"))}</div>,
  },
  {
    accessorKey: "expensive_world",
    header: ({ column }) => <ColumnHeader column={column} title="Sell World" />,
  },
  {
    accessorKey: "expensive_price",
    header: ({ column }) => <ColumnHeader column={column} title="Sell Price" className="justify-end" />,
    cell: ({ row }) => <div className="text-right">{gil(row.getValue("expensive_price"))}</div>,
  },
  {
    accessorKey: "spread_pct",
    header: ({ column }) => <ColumnHeader column={column} title="Spread %" className="justify-end" />,
    cell: ({ row }) => <div className="text-right text-profit-positive">{pct(row.getValue("spread_pct"))}</div>,
  },
  {
    accessorKey: "net_profit",
    header: ({ column }) => <ColumnHeader column={column} title="Net Profit" className="justify-end" />,
    cell: ({ row }) => <div className="text-right font-medium text-profit-positive">{gil(row.getValue("net_profit"))}</div>,
  },
]

export function CrossWorldPage() {
  const { data, isLoading } = useScanResults<CrossWorldResult>("cross_world")
  const [filter, setFilter] = useState("")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Cross-World Arbitrage</h2>
        <ScanStatusBadge scannedAt={data?.scanned_at} />
      </div>
      <input
        type="text"
        placeholder="Filter by name..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="h-8 w-64 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <DataTable columns={columns} data={data?.results ?? []} isLoading={isLoading} filterValue={filter} />
    </div>
  )
}
