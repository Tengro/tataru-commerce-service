import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDc } from "@/hooks/use-dc"
import { useWorlds } from "@/hooks/use-scans"

export function DcSelector() {
  const { dc, world, setDc, setWorld } = useDc()
  const { data: worldsData } = useWorlds()

  const dcList = worldsData ? Object.keys(worldsData.data_centers) : []
  const worldList = worldsData?.data_centers[dc] ?? []

  return (
    <div className="flex items-center gap-2">
      <Select value={dc} onValueChange={(v) => { if (v) setDc(v) }}>
        <SelectTrigger className="w-[140px] h-8 text-sm">
          <SelectValue placeholder="Data Center" />
        </SelectTrigger>
        <SelectContent>
          {dcList.map((name) => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={world || "__all__"} onValueChange={(v) => setWorld(v === "__all__" || !v ? "" : v)}>
        <SelectTrigger className="w-[140px] h-8 text-sm">
          <SelectValue placeholder="All Worlds" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Worlds</SelectItem>
          {worldList.map((name) => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
