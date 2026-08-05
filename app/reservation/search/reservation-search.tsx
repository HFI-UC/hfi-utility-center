"use client"

import { useTranslations } from "next-intl"

import { getErrorMessage } from "@/lib/api/client"
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
  const { catalog, result, loading, error } = useReservationSearch(filters)

  return (
    <main className="mx-auto max-w-[96rem] px-4 py-8 sm:px-8 sm:py-10">
      <header className="border-b pb-6">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("total", { count: result.total })}
        </p>
      </header>

      <ReservationSearchFilterForm
        key={reservationSearchHref(filters, filters.page)}
        catalog={catalog}
        filters={filters}
      />

      <SearchContent
        loading={loading}
        error={error ? getErrorMessage(error, t("loadError")) : undefined}
        reservations={result.reservations}
      />

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
  error,
  reservations,
}: {
  loading: boolean
  error?: string
  reservations: Reservation[]
}) {
  const t = useTranslations("searchPage")

  if (loading) {
    return (
      <p
        className="border-b py-16 text-sm text-muted-foreground"
        aria-live="polite"
      >
        {t("loading")}
      </p>
    )
  }
  if (error) {
    return (
      <section className="border-b py-16">
        <p className="font-medium text-destructive">{error}</p>
      </section>
    )
  }
  if (reservations.length) {
    return <ReservationResults reservations={reservations} />
  }

  return (
    <section className="border-b py-16">
      <p className="font-medium">{t("emptyTitle")}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("emptyDescription")}
      </p>
    </section>
  )
}
