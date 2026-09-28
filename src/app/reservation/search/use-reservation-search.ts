import { useEffect, useRef, useState } from "react"

import { getCatalog } from "@/lib/api/catalog"
import { getReservations } from "@/lib/api/reservations"
import type { CatalogData, ReservationPage } from "@/lib/api/types"

import { reservationSearchRequest, type ReservationSearchFilters } from "./search-query"

const emptyResult: ReservationPage = { reservations: [], total: 0 }

export function useReservationSearch(filters: ReservationSearchFilters) {
  const requestId = useRef(0)
  const pendingRequest = useRef<{ key: string; promise: Promise<ReservationPage> } | null>(null)
  const requestKey = JSON.stringify(reservationSearchRequest(filters))
  const [catalog, setCatalog] = useState<CatalogData>()
  const [result, setResult] = useState<ReservationPage>(emptyResult)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [catalogError, setCatalogError] = useState<string>()
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      setCatalogError(undefined)
      try {
        const nextCatalog = await getCatalog()
        if (active) setCatalog(nextCatalog)
      } catch (error) {
        if (active) setCatalogError(error instanceof Error ? error.message : "Request failed")
      }
    }

    void loadCatalog()
    return () => {
      active = false
    }
  }, [reloadKey])

  useEffect(() => {
    const currentRequest = ++requestId.current
    const key = `${requestKey}:${reloadKey}`
    const promise =
      pendingRequest.current?.key === key
        ? pendingRequest.current.promise
        : getReservations(JSON.parse(requestKey))
    pendingRequest.current = { key, promise }

    async function loadReservations() {
      setLoading(true)
      setError(undefined)

      try {
        const nextResult = await promise
        if (requestId.current === currentRequest) {
          setResult(nextResult)
        }
      } catch (error) {
        if (requestId.current === currentRequest) {
          setError(error instanceof Error ? error.message : "Request failed")
        }
      }

      if (pendingRequest.current?.promise === promise) pendingRequest.current = null
      // Stale runs must not clear the flag the newest request still owns.
      if (requestId.current === currentRequest) setLoading(false)
    }

    void loadReservations()

    return () => {
      requestId.current += 1
    }
  }, [requestKey, reloadKey])

  return {
    catalog,
    result,
    loading,
    error,
    catalogError,
    retry: () => setReloadKey((key) => key + 1),
  }
}
