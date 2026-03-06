import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { ColumnHeader } from "@/components/data-table/column-header"
import { ScanStatusBadge } from "@/components/scan-status-badge"
import { useScanResults } from "@/hooks/use-scans"
import { gil, pct, decimal } from "@/lib/format"
import type { VendorResult } from "@/types/api"

const columns: ColumnDef<VendorResult, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <ColumnHeader column={column} title="Item" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "npc_price",
    header: ({ column }) => <ColumnHeader column={column} title="NPC Price" className="justify-end" />,
    cell: ({ row }) => <div className="text-right">{gil(row.getValue("npc_price"))}</div>,
  },
  {
    accessorKey: "mb_price",
    header: ({ column }) => <ColumnHeader column={column} title="MB Price" className="justify-end" />,
    cell: ({ row }) => <div className="text-right">{gil(row.getValue("mb_price"))}</div>,
  },
  {
    accessorKey: "markup_pct",
    header: ({ column }) => <ColumnHeader column={column} title="Markup %" className="justify-end" />,
    cell: ({ row }) => {
      const v = row.getValue<number>("markup_pct")
      return <div className="text-right text-profit-positive">{pct(v)}</div>
    },
  },
  {
    accessorKey: "velocity",
    header: ({ column }) => <ColumnHeader column={column} title="Velocity" className="justify-end" />,
    cell: ({ row }) => <div className="text-right">{decimal(row.getValue("velocity"))}</div>,
  },
  {
    accessorKey: "daily_profit",
    header: ({ column }) => <ColumnHeader column={column} title="Daily Profit" className="justify-end" />,
    cell: ({ row }) => <div className="text-right font-medium text-profit-positive">{gil(row.getValue("daily_profit"))}</div>,
  },
]

export function VendorPage() {
  const { data, isLoading } = useScanResults<VendorResult>("vendor")
  const [filter, setFilter] = useState("")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Vendor Arbitrage</h2>
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
