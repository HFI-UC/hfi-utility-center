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
  const pendingRequest = useRef<{
    key: string
    promise: Promise<ReservationPage>
  } | null>(null)
  const requestKey = JSON.stringify(reservationSearchRequest(filters))
  const [catalog, setCatalog] = useState<CatalogData>()
  const [result, setResult] = useState<ReservationPage>(emptyResult)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      const nextCatalog = await getCatalog()
      if (active) setCatalog(nextCatalog)
    }

    loadCatalog()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const currentRequest = ++requestId.current
    const promise =
      pendingRequest.current?.key === requestKey
        ? pendingRequest.current.promise
        : getReservations(JSON.parse(requestKey))
    pendingRequest.current = { key: requestKey, promise }

    async function loadReservations() {
      setLoading(true)

      try {
        const nextResult = await promise
        if (requestId.current === currentRequest) {
          setResult(nextResult)
        }
      } finally {
        if (pendingRequest.current?.promise === promise) {
          pendingRequest.current = null
        }
        if (requestId.current === currentRequest) setLoading(false)
      }
    }

    loadReservations()

    return () => {
      requestId.current += 1
    }
  }, [requestKey])

  return { catalog, result, loading }
}
