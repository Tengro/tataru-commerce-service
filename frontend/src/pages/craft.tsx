import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { ColumnHeader } from "@/components/data-table/column-header"
import { ScanStatusBadge } from "@/components/scan-status-badge"
import { useScanResults } from "@/hooks/use-scans"
import { gil, pct, decimal } from "@/lib/format"
import type { CraftResult } from "@/types/api"

const columns: ColumnDef<CraftResult, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <ColumnHeader column={column} title="Item" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "craft_cost",
    header: ({ column }) => <ColumnHeader column={column} title="Craft Cost" className="justify-end" />,
    cell: ({ row }) => <div className="text-right">{gil(row.getValue("craft_cost"))}</div>,
  },
  {
    accessorKey: "mb_price",
    header: ({ column }) => <ColumnHeader column={column} title="MB Price" className="justify-end" />,
    cell: ({ row }) => <div className="text-right">{gil(row.getValue("mb_price"))}</div>,
  },
  {
    accessorKey: "margin",
    header: ({ column }) => <ColumnHeader column={column} title="Margin" className="justify-end" />,
    cell: ({ row }) => {
      const v = row.getValue<number>("margin")
      return <div className={`text-right ${v > 0 ? "text-profit-positive" : "text-profit-negative"}`}>{gil(v)}</div>
    },
  },
  {
    accessorKey: "margin_pct",
    header: ({ column }) => <ColumnHeader column={column} title="Margin %" className="justify-end" />,
    cell: ({ row }) => {
      const v = row.getValue<number>("margin_pct")
      return <div className={`text-right ${v > 0 ? "text-profit-positive" : "text-profit-negative"}`}>{pct(v)}</div>
    },
  },
  {
    accessorKey: "sale_velocity",
    header: ({ column }) => <ColumnHeader column={column} title="Velocity" className="justify-end" />,
    cell: ({ row }) => <div className="text-right">{decimal(row.getValue("sale_velocity"))}</div>,
  },
  {
    accessorKey: "profit_per_day",
    header: ({ column }) => <ColumnHeader column={column} title="Profit/Day" className="justify-end" />,
    cell: ({ row }) => {
      const v = row.getValue<number>("profit_per_day")
      return <div className={`text-right font-medium ${v > 0 ? "text-profit-positive" : "text-profit-negative"}`}>{gil(v)}</div>
    },
  },
]

export function CraftPage() {
  const { data, isLoading } = useScanResults<CraftResult>("craft")
  const [filter, setFilter] = useState("")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Craft Scanner</h2>
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
