import type { ReservationStatus } from "@/lib/api/types"
import { inputValueToTimestamp } from "@/lib/date-time"

export type ReservationSearchFilters = {
  keyword: string
  campusId: number
  roomId: number
  status?: ReservationStatus
  startDate: string
  endDate: string
  page: number
  sort: "time" | "sequence"
}

type SearchParams = Record<string, string | string[] | undefined>

function firstValue(params: SearchParams, key: string) {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

function parseStatus(value: string | undefined): ReservationStatus | undefined {
  if (value === "pending" || value === "approved" || value === "rejected") {
    return value
  }
  return undefined
}

function parsePositiveInteger(value: string | undefined) {
  const number = Number(value)
  return Number.isSafeInteger(number) && number > 0 ? number : undefined
}

function parseDate(value: string | undefined) {
  return value && inputValueToTimestamp(value) !== undefined ? value : ""
}

export function parseReservationSearchFilters(
  params: SearchParams
): ReservationSearchFilters {
  const startDate = parseDate(firstValue(params, "start"))
  const parsedEndDate = parseDate(firstValue(params, "end"))
  const endDate = startDate && parsedEndDate < startDate ? "" : parsedEndDate

  return {
    keyword: firstValue(params, "keyword")?.trim() ?? "",
    campusId: parsePositiveInteger(firstValue(params, "campus")) ?? 0,
    roomId: parsePositiveInteger(firstValue(params, "room")) ?? 0,
    status: parseStatus(firstValue(params, "status")),
    startDate,
    endDate,
    page: (parsePositiveInteger(firstValue(params, "page")) ?? 1) - 1,
    sort: firstValue(params, "sort") === "sequence" ? "sequence" : "time",
  }
}

export function reservationSearchRequest(
  filters: ReservationSearchFilters,
  now = new Date()
) {
  const selectedStartTime = inputValueToTimestamp(filters.startDate)
  const startTime =
    filters.sort === "time"
      ? Math.max(selectedStartTime ?? 0, shanghaiDayStart(now))
      : selectedStartTime

  return {
    keyword: filters.keyword,
    campusId: filters.campusId || undefined,
    roomId: filters.roomId || undefined,
    status: filters.status,
    page: filters.page,
    startTime,
    endTime: inputValueToTimestamp(filters.endDate, true),
    sort: filters.sort,
  }
}

function shanghaiDayStart(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  )
  return (
    Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day)
    ) /
      1000 -
    8 * 60 * 60
  )
}

export function reservationSearchHref(
  filters: ReservationSearchFilters,
  page: number
) {
  const query = new URLSearchParams()
  if (filters.keyword) query.set("keyword", filters.keyword)
  if (filters.campusId) query.set("campus", String(filters.campusId))
  if (filters.roomId) query.set("room", String(filters.roomId))
  if (filters.status) query.set("status", filters.status)
  if (filters.startDate) query.set("start", filters.startDate)
  if (filters.endDate) query.set("end", filters.endDate)
  if (filters.sort === "sequence") query.set("sort", "sequence")
  if (page > 0) query.set("page", String(page + 1))

  const search = query.toString()
  return search ? `/reservation/search?${search}` : "/reservation/search"
}

export function visiblePageNumbers(currentPage: number, totalPages: number) {
  const candidates = new Set([
    0,
    totalPages - 1,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ])

  return [...candidates]
    .filter((page) => page >= 0 && page < totalPages)
    .sort((left, right) => left - right)
}
