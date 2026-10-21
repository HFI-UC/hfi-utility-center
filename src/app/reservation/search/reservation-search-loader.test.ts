import { beforeEach, describe, expect, it, vi } from "vite-plus/test"

import type { ReservationQuery } from "@/lib/api/reservations"
import type { Reservation } from "@/lib/api/types"

import { loadReservationSearch } from "./reservation-search-loader"
import { parseReservationSearchFilters } from "./search-query"

const store = vi.hoisted(() => ({ rows: [] as (Reservation & { campusId: number })[] }))

vi.mock("@/lib/api/reservations", () => ({
  getReservations: vi.fn((query: ReservationQuery) => {
    const rows = store.rows
      .filter(
        (row) =>
          (query.campusId === undefined || row.campusId === query.campusId) &&
          (query.status === undefined || row.status === query.status),
      )
      .sort((left, right) =>
        query.sort === "time"
          ? left.startTime.localeCompare(right.startTime) || left.id - right.id
          : right.id - left.id,
      )
    const start = (query.page ?? 0) * 20
    return Promise.resolve({ reservations: rows.slice(start, start + 20), total: rows.length })
  }),
}))

function reservation(id: number): Reservation & { campusId: number } {
  return {
    id,
    campusId: id % 2 === 0 ? 1 : 2,
    roomId: 1,
    studentName: "Student",
    email: null,
    // Shared timestamps exercise the deterministic ID tie-break across pages.
    startTime: new Date(Date.UTC(2024, 0, 1, 0, Math.floor(id / 3))).toISOString(),
    endTime: new Date(Date.UTC(2024, 0, 1, 1, Math.floor(id / 3))).toISOString(),
    reason: "Study",
    status: id % 3 === 0 ? "ai_reviewing" : "pending",
  }
}

beforeEach(() => {
  store.rows = []
})

describe("reservation time descending pagination", () => {
  it.each([0, 1, 19, 20, 21, 39, 41, 53, 4100])(
    "paginates all %i reservations without gaps or duplicates",
    async (total) => {
      store.rows = Array.from({ length: total }, (_, index) => reservation(index + 1))
      const actual: number[] = []
      const pageCount = Math.ceil(total / 20)
      for (let page = 0; page <= pageCount; page++) {
        const filters = parseReservationSearchFilters({ page: String(page + 1) })
        const result = await loadReservationSearch(filters)
        expect(result.total).toBe(total)
        expect(result.reservations.map((row) => row.id)).toEqual(
          Array.from({ length: total }, (_, index) => total - index).slice(
            page * 20,
            page * 20 + 20,
          ),
        )
        actual.push(...result.reservations.map((row) => row.id))
      }
      expect(actual).toEqual(Array.from({ length: total }, (_, index) => total - index))
    },
  )

  it("keeps a single-campus in-review query scoped and complete on later pages", async () => {
    store.rows = Array.from({ length: 101 }, (_, index) => reservation(index + 1))
    const filters = parseReservationSearchFilters({ campus: "1", status: "pending", page: "2" })
    const result = await loadReservationSearch(filters)
    expect(result.total).toBe(50)
    expect(result.reservations.map((row) => row.id)).toEqual(
      Array.from({ length: 50 }, (_, index) => 100 - index * 2).slice(20, 40),
    )
  })

  it("merges campus subsets before descending sort and page slicing", async () => {
    store.rows = Array.from({ length: 67 }, (_, index) => reservation(index + 1))
    store.rows.push({ ...reservation(100), campusId: 3 })
    const filters = parseReservationSearchFilters({ campus: ["1", "2"], page: "2" })
    const result = await loadReservationSearch(filters)
    expect(result.total).toBe(67)
    expect(result.reservations.map((row) => row.id)).toEqual(
      Array.from({ length: 67 }, (_, index) => 67 - index).slice(20, 40),
    )
  })

  it("keeps booking-order descending consistent for combined filters", async () => {
    store.rows = Array.from({ length: 43 }, (_, index) => reservation(index + 1))
    const filters = parseReservationSearchFilters({ status: "pending", sort: "sequence" })
    const result = await loadReservationSearch(filters)
    expect(result.total).toBe(43)
    expect(result.reservations.map((row) => row.id)).toEqual(
      Array.from({ length: 20 }, (_, index) => 43 - index),
    )
  })
})
