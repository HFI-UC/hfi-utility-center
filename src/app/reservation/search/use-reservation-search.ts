import { useEffect, useRef, useState } from "react"

import { getCampuses, getRooms } from "@/lib/api/catalog"
import type { CatalogData, ReservationPage } from "@/lib/api/types"

import { loadReservationSearch } from "./reservation-search-loader"
import { reservationSearchRequest, type ReservationSearchFilters } from "./search-query"

const emptyResult: ReservationPage = { reservations: [], total: 0 }

export function useReservationSearch(filters: ReservationSearchFilters) {
  const requestId = useRef(0)
  const pendingRequest = useRef<{ key: string; promise: Promise<ReservationPage> } | null>(null)
  const [catalog, setCatalog] = useState<Pick<CatalogData, "campuses" | "rooms">>()
  const requestKey = JSON.stringify(reservationSearchRequest(filters))
  const [result, setResult] = useState<ReservationPage>(emptyResult)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [catalogError, setCatalogError] = useState<string>()
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      try {
        const [campuses, rooms] = await Promise.all([getCampuses(), getRooms()])
        if (active) {
          setCatalog({ campuses, rooms })
          setCatalogError(undefined)
        }
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
    // The request body alone cannot tell "no campus" from "every campus" or a
    // multi-campus subset, so the dedup key carries the campus selection too.
    const key = JSON.stringify([requestKey, filters.campusIds, filters.campusesChosen, reloadKey])
    const promise =
      pendingRequest.current?.key === key
        ? pendingRequest.current.promise
        : loadReservationSearch(filters)
    // StrictMode re-runs this effect; reuse the in-flight promise instead of refetching.
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
  }, [filters, requestKey, reloadKey])

  return {
    catalog,
    result,
    loading,
    error,
    catalogError,
    retry: () => setReloadKey((key) => key + 1),
  }
}
