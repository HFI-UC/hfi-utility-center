import { useCallback, useEffect, useRef, useState } from "react"

import { getCatalog } from "@/lib/api/catalog"
import type { CatalogData } from "@/lib/api/types"

export function useReservationCatalog() {
  const requestId = useRef(0)
  const [catalog, setCatalog] = useState<CatalogData>()
  const [loading, setLoading] = useState(true)

  const loadCatalog = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true)

    const nextCatalog = await getCatalog()
    if (requestId.current !== currentRequest) return
    setCatalog(nextCatalog)
    setLoading(false)
  }, [])

  useEffect(() => {
    async function loadInitialCatalog() {
      await loadCatalog()
    }

    void loadInitialCatalog()
    return () => {
      requestId.current += 1
    }
  }, [loadCatalog])

  return { catalog, loading }
}
