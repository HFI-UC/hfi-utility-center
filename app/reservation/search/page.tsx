import { getTranslations } from "next-intl/server"

import { getBootstrap } from "@/lib/api/catalog"
import { ApiError } from "@/lib/api/client"
import { getReservations } from "@/lib/api/reservations"
import type { ReservationPage, ReservationStatus } from "@/lib/api/types"

import { ReservationSearch } from "./reservation-search"

type SearchParams = Record<string, string | string[] | undefined>

function value(params: SearchParams, key: string) {
  const current = params[key]
  return Array.isArray(current) ? current[0] : current
}

function dateTimestamp(date: string | undefined, endOfDay = false) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined
  const suffix = endOfDay ? "T23:59:59" : "T00:00:00"
  return Math.floor(new Date(`${date}${suffix}`).getTime() / 1000)
}

export default async function ReservationSearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [common, apiErrors] = await Promise.all([
    getTranslations("common"),
    getTranslations("apiErrors"),
  ])
  const keyword = value(params, "keyword") ?? ""
  const roomId = Math.max(0, Number(value(params, "room")) || 0)
  const rawStatus = value(params, "status")
  const status = ["pending", "approved", "rejected"].includes(rawStatus ?? "")
    ? (rawStatus as ReservationStatus)
    : undefined
  const startDate = value(params, "start") ?? ""
  const endDate = value(params, "end") ?? ""
  const page = Math.max(0, (Number(value(params, "page")) || 1) - 1)

  const [catalogResult, reservationsResult] = await Promise.allSettled([
    getBootstrap(),
    getReservations({
      keyword,
      roomId: roomId || undefined,
      status,
      page,
      startTime: dateTimestamp(startDate),
      endTime: dateTimestamp(endDate, true),
    }),
  ])

  const empty: ReservationPage = { reservations: [], total: 0 }
  const error =
    reservationsResult.status === "rejected"
      ? reservationsResult.reason instanceof ApiError
        ? reservationsResult.reason.status === 0
          ? apiErrors("network")
          : apiErrors("unknown")
        : reservationsResult.reason instanceof Error
          ? reservationsResult.reason.message
          : common("unknown")
      : undefined

  return (
    <ReservationSearch
      catalog={
        catalogResult.status === "fulfilled" ? catalogResult.value : undefined
      }
      result={
        reservationsResult.status === "fulfilled"
          ? reservationsResult.value
          : empty
      }
      filters={{ keyword, roomId, status, startDate, endDate, page }}
      error={error}
    />
  )
}
