import { useEffect, useRef, useState } from "react"

import { getBootstrap } from "@/lib/api/catalog"
import { getReservations } from "@/lib/api/reservations"
import type { BootstrapData, ReservationPage } from "@/lib/api/types"

import {
  reservationSearchRequest,
  type ReservationSearchFilters,
} from "./search-query"

const emptyResult: ReservationPage = { reservations: [], total: 0 }
let catalogRequest: Promise<BootstrapData> | undefined

function getSearchCatalog() {
  catalogRequest ??= getBootstrap().catch((error) => {
    catalogRequest = undefined
    throw error
  })
  return catalogRequest
}

export function useReservationSearch(
  filters: ReservationSearchFilters,
  fallbackError: string
) {
  const requestId = useRef(0)
  const [catalog, setCatalog] = useState<BootstrapData>()
  const [result, setResult] = useState<ReservationPage>(emptyResult)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentRequest = ++requestId.current

    async function loadCatalog() {
      try {
        const nextCatalog = await getSearchCatalog()
        if (requestId.current === currentRequest) setCatalog(nextCatalog)
      } catch {
        // Search results remain usable when room filter metadata is unavailable.
      }
    }

    async function loadReservations() {
      setLoading(true)
      setError(undefined)

      try {
        const nextResult = await getReservations(
          reservationSearchRequest(filters)
        )
        if (requestId.current === currentRequest) setResult(nextResult)
      } catch (loadError) {
        if (requestId.current !== currentRequest) return
        setResult(emptyResult)
        setError(loadError instanceof Error ? loadError.message : fallbackError)
      } finally {
        if (requestId.current === currentRequest) setLoading(false)
      }
    }

    void loadCatalog()
    void loadReservations()

    return () => {
      requestId.current += 1
    }
  }, [fallbackError, filters])

  return { catalog, result, error, loading }
}
