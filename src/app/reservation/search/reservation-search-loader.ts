import { getReservations, type ReservationQuery } from "@/lib/api/reservations"
import type { ReservationPage } from "@/lib/api/types"
import { parseApiTimestamp } from "@/lib/date-time"

import { reservationSearchRequest, type ReservationSearchFilters } from "./search-query"

const PAGE_SIZE = 20
const REVIEW_STATUSES = ["pending", "ai_reviewing"] as const

async function loadEveryPage(request: ReservationQuery): Promise<ReservationPage> {
  const first = await getReservations({ ...request, page: 0 })
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, Math.ceil(first.total / PAGE_SIZE) - 1) }, (_, index) =>
      getReservations({ ...request, page: index + 1 }),
    ),
  )
  return { reservations: [first, ...rest].flatMap((page) => page.reservations), total: first.total }
}

async function loadTimePage(request: ReservationQuery): Promise<ReservationPage> {
  // The API sorts time ascending. A descending page is a reversed interval at
  // the other end of that result set, which may straddle two API pages.
  const first = await getReservations({ ...request, page: 0 })
  const end = first.total - (request.page ?? 0) * PAGE_SIZE
  if (end <= 0) return { reservations: [], total: first.total }

  const start = Math.max(0, end - PAGE_SIZE)
  const firstPage = Math.floor(start / PAGE_SIZE)
  const lastPage = Math.floor((end - 1) / PAGE_SIZE)
  const pages = await Promise.all(
    Array.from({ length: lastPage - firstPage + 1 }, (_, index) => {
      const page = firstPage + index
      return page === 0 ? Promise.resolve(first) : getReservations({ ...request, page })
    }),
  )
  const offset = start - firstPage * PAGE_SIZE
  return {
    reservations: pages
      .flatMap((page) => page.reservations)
      .slice(offset, offset + end - start)
      .reverse(),
    total: first.total,
  }
}

export async function loadReservationSearch(
  filters: ReservationSearchFilters,
): Promise<ReservationPage> {
  if (filters.campusesChosen && filters.campusIds.length === 0) {
    return { reservations: [], total: 0 }
  }

  const request = reservationSearchRequest(filters)
  if (filters.campusIds.length <= 1 && filters.status !== "pending") {
    return filters.sort === "time" ? loadTimePage(request) : getReservations(request)
  }

  // The API accepts one campus and one status per request. Merge the disjoint
  // subsets before sorting and slicing, including both in-review statuses.
  const campusIds = filters.campusIds.length > 1 ? filters.campusIds : [request.campusId]
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
          ? right.id - left.id
          : parseApiTimestamp(right.startTime).getTime() -
            parseApiTimestamp(left.startTime).getTime()
      return delta || right.id - left.id
    })
  const start = filters.page * PAGE_SIZE
  return {
    reservations: merged.slice(start, start + PAGE_SIZE),
    total: pages.reduce((sum, page) => sum + page.total, 0),
  }
}
