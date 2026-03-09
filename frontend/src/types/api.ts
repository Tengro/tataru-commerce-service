export interface IngredientCost {
  item_id: number
  name: string
  amount: number
  price_per_unit: number
  total_cost: number
  source: string
  craft_alternative: number | null
  craft_savings_pct: number | null
}

export interface WorkshopResult {
  item_id: number
  name: string
  mb_price: number
  craft_cost: number
  margin: number
  margin_pct: number
  revenue: number
  sale_velocity: number
  profit_per_day: number
  is_stale: boolean
  last_updated: number
  ingredient_costs: IngredientCost[]
}

export interface CraftingResult {
  item_id: number
  name: string
  job: string
  level: number
  mb_price: number
  velocity: number
  gil_per_day: number
  is_stale: boolean
  last_updated: number
  bargain: BargainInfo | null
}

export interface VendorResult {
  name: string
  item_id: number
  npc_price: number
  mb_price: number
  markup_pct: number
  velocity: number
  daily_profit: number
  is_stale: boolean
  last_updated: number
}

export interface BargainInfo {
  price: number
  qty: number
  world: string
  discount_pct: number
}

export interface GatherResult {
  item_id: number
  name: string
  job: string
  level: number
  location: string
  is_timed: boolean
  mb_price: number
  velocity: number
  gil_per_day: number
  is_stale: boolean
  last_updated: number
  bargain: BargainInfo | null
}

export interface HunterResult {
  item_id: number
  name: string
  mb_price: number
  velocity: number
  gil_per_day: number
  is_stale: boolean
  last_updated: number
  bargain: BargainInfo | null
}

export interface SealResult {
  item_id: number
  name: string
  seal_cost: number
  mb_price: number
  gil_per_seal: number
  velocity: number
  daily_profit: number
  is_stale: boolean
  last_updated: number
}

export type ScanResult = WorkshopResult | CraftingResult | VendorResult | GatherResult | HunterResult | SealResult

export interface ScanResponse<T = ScanResult> {
  scan_type: string
  dc: string
  world: string
  scanned_at: number
  count: number
  results: T[]
}

export interface ScanStatusEntry {
  scan_type: string
  dc: string
  world: string
  scanned_at: number
  age_minutes: number
}

export interface StatusResponse {
  scans: ScanStatusEntry[]
  next_scan_at: number | null
}

export interface WorldsResponse {
  data_centers: Record<string, string[]>
}
