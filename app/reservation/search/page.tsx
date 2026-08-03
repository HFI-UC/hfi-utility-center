import { getTranslations } from "next-intl/server"

import { getBootstrap } from "@/lib/api/catalog"
import { ApiError } from "@/lib/api/client"
import { getReservations } from "@/lib/api/reservations"
import type { ReservationPage } from "@/lib/api/types"

import { ReservationSearch } from "./reservation-search"
import {
  parseReservationSearchFilters,
  reservationSearchRequest,
} from "./search-query"

type SearchParams = Record<string, string | string[] | undefined>

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
  const filters = parseReservationSearchFilters(params)

  const [catalogResult, reservationsResult] = await Promise.allSettled([
    getBootstrap(),
    getReservations(reservationSearchRequest(filters)),
  ])

  const empty: ReservationPage = { reservations: [], total: 0 }
  let error: string | undefined
  if (reservationsResult.status === "rejected") {
    const reason = reservationsResult.reason
    if (reason instanceof ApiError) {
      error = reason.status === 0 ? apiErrors("network") : apiErrors("unknown")
    } else {
      error = reason instanceof Error ? reason.message : common("unknown")
    }
  }

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
      filters={filters}
      error={error}
    />
  )
}
