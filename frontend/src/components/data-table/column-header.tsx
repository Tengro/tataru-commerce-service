import type { Column } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

interface ColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export function ColumnHeader<TData, TValue>({ column, title, className }: ColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>
  }

  const sorted = column.getIsSorted()

  return (
    <button
      className={cn("flex items-center gap-1 hover:text-foreground", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {title}
      <span className="text-xs">
        {sorted === "asc" ? "\u25B2" : sorted === "desc" ? "\u25BC" : "\u25B4"}
      </span>
    </button>
  )
}
