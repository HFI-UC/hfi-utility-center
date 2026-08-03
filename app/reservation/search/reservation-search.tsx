"use client"

import { useTranslations } from "next-intl"

import { ReservationResults } from "./reservation-results"
import { ReservationSearchFilterForm } from "./reservation-search-filters"
import { ReservationSearchPagination } from "./reservation-search-pagination"
import type { ReservationSearchFilters } from "./search-query"
import { useReservationSearch } from "./use-reservation-search"

export function ReservationSearch({
  filters,
}: {
  filters: ReservationSearchFilters
}) {
  const t = useTranslations("searchPage")
  const common = useTranslations("common")
  const { catalog, result, error, loading } = useReservationSearch(
    filters,
    common("unknown")
  )

  return (
    <main className="mx-auto max-w-[96rem] px-4 py-8 sm:px-8 sm:py-10">
      <header className="border-b pb-6">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("total", { count: result.total })}
        </p>
      </header>

      <ReservationSearchFilterForm catalog={catalog} filters={filters} />

      {loading ? (
        <p
          className="border-b py-16 text-sm text-muted-foreground"
          aria-live="polite"
        >
          {t("loading")}
        </p>
      ) : error ? (
        <p className="border-b py-6 text-sm text-destructive">{error}</p>
      ) : result.reservations.length ? (
        <ReservationResults reservations={result.reservations} />
      ) : (
        <section className="border-b py-16">
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </section>
      )}

      {!loading && !error ? (
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
