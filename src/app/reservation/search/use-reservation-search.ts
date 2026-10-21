import { useEffect, useRef, useState } from "react"

import { getCatalog } from "@/lib/api/catalog"
import { getReservations, type ReservationQuery } from "@/lib/api/reservations"
import type { CatalogData, ReservationPage } from "@/lib/api/types"
import { parseApiTimestamp } from "@/lib/date-time"

import { reservationSearchRequest, type ReservationSearchFilters } from "./search-query"

const PAGE_SIZE = 20
const REVIEW_STATUSES = ["pending", "ai_reviewing"] as const
const emptyResult: ReservationPage = { reservations: [], total: 0 }

// One API page is 20 rows. Combined filters need every row before they can be sorted.
async function loadEveryPage(request: ReservationQuery) {
  const first = await getReservations(request)
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, Math.ceil(first.total / PAGE_SIZE) - 1) }, (_, index) =>
      getReservations({ ...request, page: index + 1 }),
    ),
  )
  return { reservations: [first, ...rest].flatMap((page) => page.reservations), total: first.total }
}

// The API accepts one campus and one status per request; no campus means every
// campus. A campus subset, or the in-review status that covers both pending and
// AI review, is fetched per value and interleaved into one page.
async function loadCombinedPage(filters: ReservationSearchFilters): Promise<ReservationPage> {
  const request = reservationSearchRequest(filters)
  const campusIds = filters.campusIds.length > 1 ? filters.campusIds : [undefined]
  const statuses = filters.status === "pending" ? REVIEW_STATUSES : [request.status]
  const pages = await Promise.all(
    campusIds.flatMap((campusId) =>
      statuses.map((status) => loadEveryPage({ ...request, campusId, status })),
    ),
  )
  const merged = pages
    .flatMap((page) => page.reservations)
    .sort((left, right) => {
      const delta =
        filters.sort === "sequence"
          ? left.id - right.id
          : parseApiTimestamp(left.startTime).getTime() -
            parseApiTimestamp(right.startTime).getTime()
      return delta || left.id - right.id
    })
  const start = filters.page * PAGE_SIZE
  return {
    reservations: merged.slice(start, start + PAGE_SIZE),
    total: pages.reduce((sum, page) => sum + page.total, 0),
  }
}

export function useReservationSearch(filters: ReservationSearchFilters) {
  const requestId = useRef(0)
  const pendingRequest = useRef<{ key: string; promise: Promise<ReservationPage> } | null>(null)
  const [catalog, setCatalog] = useState<CatalogData>()
  const requestKey = JSON.stringify(reservationSearchRequest(filters))
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
    // The request body alone cannot tell "no campus" from "every campus" or a
    // multi-campus subset, so the dedup key carries the campus selection too.
    const key = JSON.stringify([requestKey, filters.campusIds, filters.campusesChosen, reloadKey])
    const promise =
      pendingRequest.current?.key === key
        ? pendingRequest.current.promise
        : filters.campusesChosen && filters.campusIds.length === 0
          ? Promise.resolve(emptyResult)
          : filters.campusIds.length > 1 || filters.status === "pending"
            ? loadCombinedPage(filters)
            : getReservations(JSON.parse(requestKey))
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
