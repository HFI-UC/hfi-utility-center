import { useEffect, useRef, useState } from "react"

import { getCatalog } from "@/lib/api/catalog"
import { getReservations } from "@/lib/api/reservations"
import type { CatalogData, ReservationPage } from "@/lib/api/types"
import { parseApiTimestamp } from "@/lib/date-time"

import { reservationSearchRequest, type ReservationSearchFilters } from "./search-query"

const PAGE_SIZE = 20
const REVIEW_STATUSES = ["pending", "ai_reviewing"] as const
const emptyResult: ReservationPage = { reservations: [], total: 0 }

// The API accepts one status per request. In review covers pending and AI review,
// so both result sets are fetched and interleaved into one page.
async function loadReviewPage(filters: ReservationSearchFilters): Promise<ReservationPage> {
  const request = reservationSearchRequest(filters)
  const pages = await Promise.all(
    REVIEW_STATUSES.map(async (status) => {
      const first = await getReservations({ ...request, status, page: 0 })
      const rest = await Promise.all(
        Array.from({ length: Math.max(0, Math.ceil(first.total / PAGE_SIZE) - 1) }, (_, index) =>
          getReservations({ ...request, status, page: index + 1 }),
        ),
      )
      return [first, ...rest]
    }),
  )
  const merged = pages
    .flatMap((statusPages) => statusPages.flatMap((page) => page.reservations))
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
    total: pages.reduce((sum, statusPages) => sum + statusPages[0].total, 0),
  }
}
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
        : filters.status === "pending"
          ? loadReviewPage(filters)
          : getReservations(JSON.parse(requestKey))

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
