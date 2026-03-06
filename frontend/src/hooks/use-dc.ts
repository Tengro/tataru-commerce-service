import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { createElement } from "react"

interface DcContextValue {
  dc: string
  world: string
  setDc: (dc: string) => void
  setWorld: (world: string) => void
}

const DcContext = createContext<DcContextValue | null>(null)

function readStorage(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export function DcProvider({ children }: { children: ReactNode }) {
  const [dc, setDcState] = useState(() => readStorage("tcs-dc", "Chaos"))
  const [world, setWorldState] = useState(() => readStorage("tcs-world", ""))

  const setDc = useCallback((newDc: string) => {
    setDcState(newDc)
    setWorldState("")
    localStorage.setItem("tcs-dc", newDc)
    localStorage.setItem("tcs-world", "")
  }, [])

  const setWorld = useCallback((newWorld: string) => {
    setWorldState(newWorld)
    localStorage.setItem("tcs-world", newWorld)
  }, [])

  return createElement(DcContext.Provider, { value: { dc, world, setDc, setWorld } }, children)
}

export function useDc(): DcContextValue {
  const ctx = useContext(DcContext)
  if (!ctx) throw new Error("useDc must be used within DcProvider")
  return ctx
}
