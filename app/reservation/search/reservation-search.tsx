"use client"

import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"

import { Spinner } from "@/components/astryx"
import { NeoFooter, NeoPage } from "@/components/neo/shared"
import type { Reservation } from "@/lib/api/types"

import { ReservationResults } from "./reservation-results"
import { ReservationSearchFilterForm } from "./reservation-search-filters"
import { ReservationSearchPagination } from "./reservation-search-pagination"
import {
  parseReservationSearchFilters,
  reservationSearchHref,
  type ReservationSearchFilters,
} from "./search-query"
import { useReservationSearch } from "./use-reservation-search"

export function ReservationSearch() {
  const searchParams = useSearchParams()
  const filters = parseReservationSearchFilters(
    Object.fromEntries(searchParams.entries())
  )
  const t = useTranslations("searchPage")
  const { catalog, result, loading } = useReservationSearch(filters)

  return (
    <NeoPage>
      <main className="internal-main booking-list-page">
        <div className="list-layout">
          <aside className="booking-sidebar">
            <div className="booking-sidebar__intro">
              <strong>{t("filtersTitle")}</strong>
              <span>{t("filtersDescription")}</span>
            </div>
            <ReservationSearchFilterForm
              key={reservationSearchHref(filters, filters.page)}
              catalog={catalog}
              filters={filters}
            />
          </aside>
          <section className="booking-list-content">
            <div className="page-title-row">
              <div>
                <span className="page-overline">HFI Utility Center</span>
                <h1>{t("title")}</h1>
              </div>
            </div>
            <SearchContent
              loading={loading}
              reservations={result.reservations}
              sort={filters.sort}
            />
            {!loading ? (
              <div className="list-pagination">
                <div className="list-pagination__summary">
                  <span>{t("total", { count: result.total })}</span>
                  <span>{t("page", { page: filters.page + 1 })}</span>
                </div>
                <ReservationSearchPagination
                  filters={filters}
                  totalReservations={result.total}
                  previousLabel={t("previous")}
                  nextLabel={t("next")}
                />
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <NeoFooter />
    </NeoPage>
  )
}

function SearchContent({
  loading,
  reservations,
  sort,
}: {
  loading: boolean
  reservations: Reservation[]
  sort: ReservationSearchFilters["sort"]
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
    return <ReservationResults reservations={reservations} sort={sort} />
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
