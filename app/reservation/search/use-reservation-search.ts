import { useEffect, useRef, useState } from "react"

import { getCatalog } from "@/lib/api/catalog"
import { getErrorMessage } from "@/lib/api/client"
import { getReservations } from "@/lib/api/reservations"
import type { CatalogData, ReservationPage } from "@/lib/api/types"

import {
  reservationSearchRequest,
  type ReservationSearchFilters,
} from "./search-query"

const emptyResult: ReservationPage = { reservations: [], total: 0 }

export function useReservationSearch(
  filters: ReservationSearchFilters,
  fallbackError: string
) {
  const requestId = useRef(0)
  const [catalog, setCatalog] = useState<CatalogData>()
  const [result, setResult] = useState<ReservationPage>(emptyResult)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      try {
        const nextCatalog = await getCatalog()
        if (active) setCatalog(nextCatalog)
      } catch {
        // Search results remain usable when room filter metadata is unavailable.
      }
    }

    void loadCatalog()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const currentRequest = ++requestId.current

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
        setError(getErrorMessage(loadError, fallbackError))
      } finally {
        if (requestId.current === currentRequest) setLoading(false)
      }
    }

    void loadReservations()

    return () => {
      requestId.current += 1
    }
  }, [fallbackError, filters])

  return { catalog, result, error, loading }
}
