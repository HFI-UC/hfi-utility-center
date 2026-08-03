import { describe, expect, it } from "vitest"

import {
  parseReservationSearchFilters,
  reservationSearchHref,
  reservationSearchRequest,
  visiblePageNumbers,
} from "@/app/reservation/search/search-query"

describe("reservation search query", () => {
  it("normalizes user-controlled search parameters", () => {
    expect(
      parseReservationSearchFilters({
        keyword: ["robotics", "ignored"],
        room: "7",
        status: "approved",
        start: "2026-08-01",
        end: "2026-08-03",
        page: "3",
      })
    ).toEqual({
      keyword: "robotics",
      roomId: 7,
      status: "approved",
      startDate: "2026-08-01",
      endDate: "2026-08-03",
      page: 2,
    })
  })

  it("falls back for invalid status, room, and page values", () => {
    expect(
      parseReservationSearchFilters({
        room: "-2",
        status: "unknown",
        page: "x",
      })
    ).toMatchObject({ roomId: 0, status: undefined, page: 0 })
  })

  it("rejects fractional numbers, invalid dates, and reversed ranges", () => {
    expect(
      parseReservationSearchFilters({
        room: "2.5",
        page: "1.5",
        start: "2026-08-03",
        end: "2026-07-31",
      })
    ).toMatchObject({
      roomId: 0,
      page: 0,
      startDate: "2026-08-03",
      endDate: "",
    })

    expect(
      parseReservationSearchFilters({ start: "2026-02-30" }).startDate
    ).toBe("")
  })

  it("builds API filters and browser URLs with the existing contract", () => {
    const filters = parseReservationSearchFilters({
      keyword: "music",
      room: "2",
      status: "pending",
      start: "2026-08-01",
      end: "2026-08-02",
      page: "2",
    })

    expect(reservationSearchRequest(filters)).toMatchObject({
      keyword: "music",
      roomId: 2,
      status: "pending",
      page: 1,
    })
    expect(reservationSearchHref(filters, 1)).toBe(
      "/reservation/search?keyword=music&room=2&status=pending&start=2026-08-01&end=2026-08-02&page=2"
    )
  })

  it("keeps pagination compact at boundaries and in the middle", () => {
    expect(visiblePageNumbers(0, 10)).toEqual([0, 1, 9])
    expect(visiblePageNumbers(5, 10)).toEqual([0, 4, 5, 6, 9])
    expect(visiblePageNumbers(9, 10)).toEqual([0, 8, 9])
  })
})
