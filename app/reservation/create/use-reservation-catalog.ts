import { useCallback, useEffect, useRef, useState } from "react"

import { getCatalog } from "@/lib/api/catalog"
import { getErrorMessage } from "@/lib/api/client"
import type { CatalogData } from "@/lib/api/types"

export function useReservationCatalog(fallbackError: string) {
  const requestId = useRef(0)
  const [catalog, setCatalog] = useState<CatalogData>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(true)

  const loadCatalog = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true)
    setError(undefined)

    try {
      const nextCatalog = await getCatalog()
      if (requestId.current === currentRequest) setCatalog(nextCatalog)
    } catch (loadError) {
      if (requestId.current !== currentRequest) return
      setError(getErrorMessage(loadError, fallbackError))
    } finally {
      if (requestId.current === currentRequest) setLoading(false)
    }
  }, [fallbackError])

  useEffect(() => {
    async function loadInitialCatalog() {
      await loadCatalog()
    }

    void loadInitialCatalog()
    return () => {
      requestId.current += 1
    }
  }, [loadCatalog])

  return { catalog, error, loading, reload: loadCatalog }
}
