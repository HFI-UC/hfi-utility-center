import { useEffect, useRef, useState } from "react"

import { getCatalog } from "@/lib/api/catalog"
import { getReservations } from "@/lib/api/reservations"
import type { CatalogData, ReservationPage } from "@/lib/api/types"

import {
  reservationSearchRequest,
  type ReservationSearchFilters,
} from "./search-query"

const emptyResult: ReservationPage = { reservations: [], total: 0 }

export function useReservationSearch(filters: ReservationSearchFilters) {
  const requestId = useRef(0)
  const [catalog, setCatalog] = useState<CatalogData>()
  const [result, setResult] = useState<ReservationPage>(emptyResult)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      const nextCatalog = await getCatalog()
      if (active) setCatalog(nextCatalog)
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

      const nextResult = await getReservations(
        reservationSearchRequest(filters)
      )
      if (requestId.current !== currentRequest) return
      setResult(nextResult)
      setLoading(false)
    }

    void loadReservations()

    return () => {
      requestId.current += 1
    }
  }, [filters])

  return { catalog, result, loading }
}
