"use client"

import { useTranslations } from "next-intl"

import { Spinner } from "@/components/ui/spinner"
import type { Reservation } from "@/lib/api/types"

import { ReservationResults } from "./reservation-results"
import { ReservationSearchFilterForm } from "./reservation-search-filters"
import { ReservationSearchPagination } from "./reservation-search-pagination"
import {
  reservationSearchHref,
  type ReservationSearchFilters,
} from "./search-query"
import { useReservationSearch } from "./use-reservation-search"

export function ReservationSearch({
  filters,
}: {
  filters: ReservationSearchFilters
}) {
  const t = useTranslations("searchPage")
  const { catalog, result, loading } = useReservationSearch(filters)

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
      <header className="pb-2">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
      </header>

      <ReservationSearchFilterForm
        key={reservationSearchHref(filters, filters.page)}
        catalog={catalog}
        filters={filters}
      />

      <SearchContent loading={loading} reservations={result.reservations} />

      {!loading ? (
        <ReservationSearchPagination
          filters={filters}
          totalReservations={result.total}
          previousLabel={t("previous")}
          nextLabel={t("next")}
        />
      ) : null}
    </main>
  )
}

function SearchContent({
  loading,
  reservations,
}: {
  loading: boolean
  reservations: Reservation[]
}) {
  const t = useTranslations("searchPage")

  if (loading) {
    return (
      <p
        className="flex items-center gap-2 py-5 text-sm text-muted-foreground"
        aria-live="polite"
      >
        <Spinner />
        {t("loading")}
      </p>
    )
  }
  if (reservations.length) {
    return <ReservationResults reservations={reservations} />
  }

  return (
    <section className="py-16">
      <p className="font-medium">{t("emptyTitle")}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("emptyDescription")}
      </p>
    </section>
  )
}
