import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { ColumnHeader } from "@/components/data-table/column-header"
import { ScanStatusBadge } from "@/components/scan-status-badge"
import { useScanResults } from "@/hooks/use-scans"
import { gil, decimal, priceAge } from "@/lib/format"
import type { HunterResult } from "@/types/api"

const columns: ColumnDef<HunterResult, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <ColumnHeader column={column} title="Item" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "mb_price",
    header: ({ column }) => <ColumnHeader column={column} title="MB Price" className="justify-end" />,
    cell: ({ row }) => <div className="text-right">{gil(row.getValue("mb_price"))}</div>,
  },
  {
    accessorKey: "velocity",
    header: ({ column }) => <ColumnHeader column={column} title="Velocity" className="justify-end" />,
    cell: ({ row }) => <div className="text-right">{decimal(row.getValue("velocity"))}</div>,
  },
  {
    accessorKey: "gil_per_day",
    header: ({ column }) => <ColumnHeader column={column} title="Gil/Day" className="justify-end" />,
    cell: ({ row }) => <div className="text-right font-medium text-profit-positive">{gil(row.getValue("gil_per_day"))}</div>,
  },
  {
    id: "bargain",
    header: "Bargain",
    cell: ({ row }) => {
      const b = row.original.bargain
      if (!b) return null
      return (
        <span className="text-xs text-profit-positive">
          {b.world}: {gil(b.price)} x{b.qty} (-{b.discount_pct}%)
        </span>
      )
    },
  },
  {
    accessorKey: "last_updated",
    header: ({ column }) => <ColumnHeader column={column} title="Updated" />,
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{priceAge(row.getValue("last_updated"))}</span>
    ),
  },
]

export function HunterPage() {
  const { data, isLoading } = useScanResults<HunterResult>("hunter")
  const [filter, setFilter] = useState("")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Hunter Scanner</h2>
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
