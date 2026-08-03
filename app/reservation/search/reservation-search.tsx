"use client"

import { useTranslations } from "next-intl"

import type { BootstrapData, ReservationPage } from "@/lib/api/types"

import { ReservationResults } from "./reservation-results"
import { ReservationSearchFilterForm } from "./reservation-search-filters"
import { ReservationSearchPagination } from "./reservation-search-pagination"
import type { ReservationSearchFilters } from "./search-query"

export function ReservationSearch({
  catalog,
  result,
  filters,
  error,
}: {
  catalog?: BootstrapData
  result: ReservationPage
  filters: ReservationSearchFilters
  error?: string
}) {
  const t = useTranslations("searchPage")

  return (
    <main className="mx-auto max-w-[96rem] px-4 py-8 sm:px-8 sm:py-10">
      <header className="border-b pb-6">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("total", { count: result.total })}
        </p>
      </header>

      <ReservationSearchFilterForm catalog={catalog} filters={filters} />

      {error ? (
        <p className="border-b py-6 text-sm text-destructive">{error}</p>
      ) : null}
      {result.reservations.length ? (
        <ReservationResults reservations={result.reservations} />
      ) : (
        <section className="border-b py-16">
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </section>
      )}

      <ReservationSearchPagination
        filters={filters}
        totalReservations={result.total}
        previousLabel={t("previous")}
        nextLabel={t("next")}
      />
    </main>
  )
}
